// Fiyat çekim motoru: kaynak zinciri (SerpApi → Booking/Apify), kaynak tercihi, cache,
// sorgu tavanı, snapshot yazımı ve maliyet kaydı.
import { createBookingAdapter } from "./booking.ts";
import { createSerpApiAdapter } from "./serpapi.ts";
import { createEtsAdapter } from "./etstur.ts";
import { createJollyAdapter } from "./jollytur.ts";
import { createTatilSepetiAdapter } from "./tatilsepeti.ts";
import { ensureMatches } from "./matcher.ts";
import { hasStandard } from "./roomTier.ts";
import { refreshBaseRooms } from "./baseRooms.ts";
import { insertSnapshots, type SnapshotInput } from "./snapshots.ts";
import { ADAPTER_LABELS, loadDisabledSources } from "./sourceSettings.ts";
import { unlockerAvailable } from "./unlocker.ts";
import { BRIGHTDATA_REQUIRED } from "./domesticHtml.ts";

export const DOMESTIC_COLS = "jollytur_hotel_id, jollytur_slug, jollytur_checked_at, tatilsepeti_slug, tatilsepeti_checked_at";
const pickDomestic = (r: any) => ({
  jollytur_hotel_id: r?.jollytur_hotel_id ?? null, jollytur_slug: r?.jollytur_slug ?? null, jollytur_checked_at: r?.jollytur_checked_at ?? null,
  tatilsepeti_slug: r?.tatilsepeti_slug ?? null, tatilsepeti_checked_at: r?.tatilsepeti_checked_at ?? null,
});
import type { AdapterResult, BoardType, PriceAdapter, PriceQuote, Subject } from "./types.ts";
import { addDays } from "./types.ts";

const PREF_TTL_MS = 30 * 86400_000;

export type EngineBusiness = {
  id: string;
  name: string;
  city: string | null;
  serpapi_property_token: string | null;
  booking_url: string | null;
  price_source_preference: string | null;
  price_source_checked_at: string | null;
  price_compare_board_type: string | null;
  etstur_slug?: string | null;
  etstur_hotel_id?: string | null;
  etstur_checked_at?: string | null;
};

export type EngineOptions = {
  admin: any;
  business: EngineBusiness;
  competitorIds?: string[];
  includeOwn?: boolean;
  dates: string[];
  nights: number;
  adults: number;
  cacheHours: number;
  force: boolean;
  maxCalls: number;
  allowBooking: boolean;
  deadline: number; // epoch ms
  trigger: "manual" | "cron" | "instant";
  /** Yalnızca bu pazarlar çekilir (varsayılan: ikisi de). */
  markets?: ("domestic" | "international")[];
  /** Uluslararası pazar sorgu gece sayısı (varsayılan nights). 7 ve üzerinde ek gece denemesi yapılmaz. */
  intlNights?: number;
};

export type EngineResult = {
  calls: number;
  cost_usd: number;
  complete: boolean;
  capped: boolean;
  fetched: number;
  cached: number;
  skipped_no_source: number;
  saved: number;
  errors: string[];
  /** Yönetici tarafından kapatılmış kaynakların adları (bu turda atlandı). */
  disabled: string[];
};

export async function loadSubjects(admin: any, b: EngineBusiness, competitorIds?: string[], includeOwn = true) {
  let q = admin
    .from("ci_competitors")
    .select(`id, name, city, serpapi_property_token, booking_url, price_source_preference, price_source_checked_at, etstur_slug, etstur_hotel_id, etstur_checked_at, ${DOMESTIC_COLS}`)
    .eq("business_id", b.id)
    .eq("is_active", true);
  if (competitorIds?.length) q = q.in("id", competitorIds);
  const { data: comps, error } = await q;
  if (error) throw error;
  const subjects: Subject[] = [];
  if (includeOwn) {
    subjects.push({
      key: "own",
      subject_type: "own",
      competitor_id: null,
      name: b.name,
      city: b.city,
      serpapi_property_token: b.serpapi_property_token,
      booking_url: b.booking_url,
      price_source_preference: b.price_source_preference,
      price_source_checked_at: b.price_source_checked_at,
      etstur_slug: b.etstur_slug ?? null,
      etstur_hotel_id: b.etstur_hotel_id ?? null,
      etstur_checked_at: b.etstur_checked_at ?? null,
      ...pickDomestic(b),
    } as Subject);
  }
  for (const c of comps ?? []) {
    subjects.push({
      key: c.id,
      subject_type: "competitor",
      competitor_id: c.id,
      name: c.name,
      city: c.city,
      serpapi_property_token: c.serpapi_property_token,
      booking_url: c.booking_url,
      price_source_preference: c.price_source_preference,
      price_source_checked_at: c.price_source_checked_at,
      etstur_slug: c.etstur_slug,
      etstur_hotel_id: c.etstur_hotel_id,
      etstur_checked_at: c.etstur_checked_at,
      ...pickDomestic(c),
    } as Subject);
  }
  return subjects;
}

function prefValid(s: Subject) {
  return (
    !!s.price_source_preference &&
    !!s.price_source_checked_at &&
    Date.now() - new Date(s.price_source_checked_at).getTime() < PREF_TTL_MS
  );
}

function comparable(quotes: PriceQuote[], board: BoardType) {
  return quotes.some((q) => q.board_type === board);
}

async function updateSubject(admin: any, businessId: string, s: Subject, patch: Record<string, unknown>) {
  if (!Object.keys(patch).length) return;
  if (s.subject_type === "own") await admin.from("businesses").update(patch).eq("id", businessId);
  else await admin.from("ci_competitors").update(patch).eq("id", s.competitor_id);
  Object.assign(s, patch);
}

export async function runPriceFetch(o: EngineOptions): Promise<EngineResult> {
  const serpKey = Deno.env.get("SERPAPI_API_KEY");
  const apifyToken = Deno.env.get("APIFY_API_TOKEN");
  // Kaynak kapatma anahtarı: çekime başlamadan bir kez okunur.
  const off = await loadDisabledSources(o.admin);
  const serp: PriceAdapter | null = serpKey && !off.has("serpapi") ? createSerpApiAdapter(serpKey) : null;
  const booking: PriceAdapter | null = o.allowBooking && apifyToken && !off.has("booking") ? createBookingAdapter(apifyToken) : null;
  const board = (o.business.price_compare_board_type ?? "breakfast") as BoardType;

  // Otomatik eşleştirme (arama + katı puanlama). Onay bekleyen/bulunamayan mülkler için fiyat çekilmez.
  try {
    await ensureMatches(o.admin, o.business.id, { competitorIds: o.competitorIds, includeOwn: o.includeOwn, deadline: o.deadline - 60_000 });
  } catch (e) { console.error("ensureMatches failed", e); }
  const fresh = await o.admin.from("businesses").select("serpapi_property_token, booking_url, etstur_slug, etstur_hotel_id, etstur_checked_at, jollytur_hotel_id, jollytur_slug, jollytur_checked_at, tatilsepeti_slug, tatilsepeti_checked_at").eq("id", o.business.id).single();
  if (fresh.data) Object.assign(o.business, fresh.data);
  const subjects = await loadSubjects(o.admin, o.business, o.competitorIds, o.includeOwn ?? true);
  const res: EngineResult = { calls: 0, cost_usd: 0, complete: true, capped: false, fetched: 0, cached: 0, skipped_no_source: 0, saved: 0, errors: [], disabled: Array.from(off).map((a) => ADAPTER_LABELS[a] ?? a) };
  const perAdapter: Record<string, { calls: number; cost: number; ok: number; no_prices: number; error: number }> = {};
  const health = (id: string, status: string | undefined) => {
    perAdapter[id] ??= { calls: 0, cost: 0, ok: 0, no_prices: 0, error: 0 };
    if (status === "ok") perAdapter[id].ok++;
    else if (status === "no_prices") perAdapter[id].no_prices++;
    else if (status === "error") perAdapter[id].error++;
  };
  const track = (id: string, calls: number, cost: number, capCalls = calls) => {
    perAdapter[id] ??= { calls: 0, cost: 0, ok: 0, no_prices: 0, error: 0 };
    perAdapter[id].calls += calls;
    perAdapter[id].cost += cost;
    res.calls += capCalls;
    res.cost_usd += cost;
  };

  // Cache: son cacheHours içinde çekilmiş (mülk, tarih) çiftleri.
  const done = new Set<string>();
  const doneDom = new Set<string>();
  const domestic = [
    { id: "etstur", label: "ETS Tur", adapter: createEtsAdapter(), idField: "etstur_hotel_id", checkedField: "etstur_checked_at" },
    { id: "jollytur", label: "Jolly Tur", adapter: createJollyAdapter(), idField: "jollytur_hotel_id", checkedField: "jollytur_checked_at" },
    { id: "tatilsepeti", label: "Tatil Sepeti", adapter: createTatilSepetiAdapter(), idField: "tatilsepeti_slug", checkedField: "tatilsepeti_checked_at" },
  ].filter((d) => !off.has(d.id));
  // Yurt içi kaynaklar yalnız Bright Data ile çalışır; yoksa tek ve açık hata (sessiz "fiyat yok" yazılmaz).
  if (domestic.length && (!o.markets || o.markets.includes("domestic")) && !unlockerAvailable()) {
    res.errors.push(BRIGHTDATA_REQUIRED);
    domestic.length = 0;
  }
  if (!o.force && o.dates.length) {
    const since = new Date(Date.now() - o.cacheHours * 3600_000).toISOString();
    const { data } = await o.admin
      .from("competitor_price_snapshots")
      .select("subject_type, competitor_id, checkin, market, nights, reason:raw->>reason")
      .eq("business_id", o.business.id)
      .in("nights", [o.nights, o.intlNights ?? o.nights])
      .eq("adults", o.adults)
      .in("checkin", o.dates)
      .gte("fetched_at", since)
      .limit(10000);
    for (const r of data ?? []) {
      if (r.reason === "source_error") continue; // kaynak hatası önbellek sayılmaz, tekrar denenir
      const k = `${r.subject_type === "own" ? "own" : r.competitor_id}|${r.checkin}`;
      if (r.market === "domestic") { if (r.nights === o.nights) doneDom.add(k); }
      else if (r.nights === (o.intlNights ?? o.nights)) done.add(k);
    }
  }

  try {
    for (const checkin of o.dates) {
      if (Date.now() > o.deadline) { res.complete = false; break; }
      if (res.calls >= o.maxCalls) { res.capped = true; res.complete = false; break; }

      // Yurt içi pazar (ETS): uluslararası zincirden tamamen ayrı; hücrelerde asla karışmaz.
      // Kaynaklar: ETS Tur, Jolly Tur, Tatil Sepeti — aynı fetched_at ile tek batch yazılır; hücrede en ucuz kıyaslanabilir seçilir.
      if (!o.markets || o.markets.includes("domestic")) {
        const pe = { checkin, checkout: addDays(checkin, o.nights), nights: o.nights, adults: o.adults };
        const fa = new Date().toISOString();
        const erows: any[] = [];
        const notMatchedRecently = (s: Subject, idField: string, checkedField: string) =>
          !(s as any)[idField] && (s as any)[checkedField] && Date.now() - new Date((s as any)[checkedField]).getTime() < PREF_TTL_MS;
        for (const d of domestic) {
          if (Date.now() > o.deadline) { res.complete = false; break; }
          const list = subjects.filter((s) => !doneDom.has(`${s.key}|${checkin}`) && !notMatchedRecently(s, d.idField, d.checkedField));
          if (!list.length) continue;
          const r = await d.adapter.fetchMany(list, pe);
          track(d.id, r.calls, r.cost_usd, r.unlocker_calls);
          // Min. konaklama geri dönüşü: seçilen gecede müsait oda yoksa daha uzun konaklamayla tekrar sor
          // (en fazla 2 ek istek). Kaynak min. geceyi söylüyorsa doğrudan o gece sayısıyla sorulur.
          // Fiyat gecelik olarak kaydedilir; satır seçilen gece kümesinde (nights) kalır, queried_nights ayrıca yazılır.
          const queriedN = new Map<string, number>();
          const tried = new Map<string, number[]>();
          const MAX_FALLBACK_NIGHTS = 7;
          for (let attempt = 0; attempt < 2; attempt++) {
            if (Date.now() > o.deadline) break;
            const byN = new Map<number, Subject[]>();
            for (const s of list) {
              const er = r.results.get(s.key);
              if (!er) continue;
              // Tetik: hiç müsait oda yok VEYA müsait odalar arasında standart kategori yok (ör. yalnızca Suite).
              const noStd = er.status === "ok" && !hasStandard(er.quotes);
              if (!(er.status === "no_prices" && !er.not_on_sale) && !noStd) continue;
              const t = tried.get(s.key) ?? [o.nights];
              const cur = Math.max(...t);
              let n = er.min_stay && er.min_stay > cur ? er.min_stay : cur + 1;
              if (n > MAX_FALLBACK_NIGHTS || t.includes(n)) continue;
              byN.set(n, [...(byN.get(n) ?? []), s]);
            }
            if (!byN.size) break;
            for (const [n, subs] of byN) {
              const r2 = await d.adapter.fetchMany(subs, { checkin, checkout: addDays(checkin, n), nights: n, adults: o.adults });
              track(d.id, r2.calls, r2.cost_usd, r2.unlocker_calls);
              for (const s of subs) {
                tried.set(s.key, [...(tried.get(s.key) ?? [o.nights]), n]);
                const e2 = r2.results.get(s.key);
                if (!e2 || e2.status === "error") continue;
                const prev = r.results.get(s.key)!;
                for (const q of e2.quotes) (q as any)._qn = n;
                if (prev.status === "ok") {
                  // Önceki (daha kısa konaklama) odalar korunur; yeni sorgudaki yeni odalar eklenir.
                  const seen = new Set(prev.quotes.map((q) => `${q.room_name}|${q.board_type}`));
                  const add = e2.quotes.filter((q) => !seen.has(`${q.room_name}|${q.board_type}`));
                  r.results.set(s.key, { ...prev, quotes: [...prev.quotes, ...add], min_stay: e2.min_stay ?? prev.min_stay });
                  if (add.length) queriedN.set(s.key, n);
                } else {
                  queriedN.set(s.key, n);
                  r.results.set(s.key, { ...e2, match: prev.match });
                }
              }
            }
          }
          for (const s of list) {
            const er = r.results.get(s.key);
            health(d.id, er?.status);
            if (!er) continue;
            if (er.match && Object.keys(er.match).length) await updateSubject(o.admin, o.business.id, s, er.match as any);
            const base = { business_id: o.business.id, competitor_id: s.competitor_id, subject_type: s.subject_type, checkin, nights: o.nights, adults: o.adults, currency: "TRY", fetched_at: fa, market: "domestic" as const };
            if (er.status === "ok") {
              for (const q of er.quotes) {
                const n = (q as any)._qn ?? o.nights;
                const { _qn: _, ...qq } = q as any;
                erows.push({ ...base, ...qq, source: q.source, source_adapter: q.source_adapter, is_official: false, is_ad: false, no_availability: false, queried_nights: n, min_stay_nights: n > o.nights ? n : null });
              }
            } else if (er.status === "no_prices") {
              const t = tried.get(s.key) ?? [o.nights];
              erows.push({ ...base, source: d.label, source_adapter: d.id, price_per_night: null, no_availability: true, board_type: "unknown", queried_nights: queriedN.get(s.key) ?? o.nights,
                raw: er.min_stay ? { reason: "min_stay", min_stay: er.min_stay, tried_nights: t } : er.not_on_sale ? { reason: "not_on_sale", tried_nights: t } : { tried_nights: t } });
            } else if (er.status === "error") {
              console.error(`${d.id} error for ${s.name}: ${String(er.error ?? "").slice(0, 500)}`);
              // Hücre "dolu" görünmesin: kaynak hatası ayrı işaretlenir (computeCell bunu doluya saymaz).
              erows.push({ ...base, source: d.label, source_adapter: d.id, price_per_night: null, no_availability: true, board_type: "unknown", queried_nights: o.nights,
                raw: { reason: "source_error", error: String(er.error ?? "").slice(0, 300) } });
            }
          }
        }
        if (erows.length) {
          const w = await insertSnapshots(o.admin, erows, "yurt içi kayıt", o.trigger);
          res.saved += w.saved; res.errors.push(...w.errors);
        }
      }

      if (o.markets && !o.markets.includes("international")) continue;
      const todo = subjects.filter((s) => {
        if (done.has(`${s.key}|${checkin}`)) { res.cached++; return false; }
        return true;
      });
      if (!todo.length) continue;
      const iN = o.intlNights ?? o.nights;
      const p = { checkin, checkout: addDays(checkin, iN), nights: iN, adults: o.adults };

      const serpList: Subject[] = [];
      const bookingList: Subject[] = [];
      for (const s of todo) {
        const valid = prefValid(s);
        if (valid && s.price_source_preference === "none") { res.skipped_no_source++; continue; }
        if (valid && s.price_source_preference === "booking") {
          if (booking) bookingList.push(s); else if (serp) serpList.push(s);
        } else if (serp) serpList.push(s);
        else if (booking) bookingList.push(s);
      }

      const baseOf = (s: Subject, fetchedAt: string) => ({
        business_id: o.business.id, competitor_id: s.competitor_id, subject_type: s.subject_type, checkin,
        nights: iN, adults: o.adults, currency: "TRY", fetched_at: fetchedAt, market: "international" as const,
      });
      const noPriceRow = (s: Subject, fetchedAt: string, adapter: "serpapi" | "booking") => ({
        ...baseOf(s, fetchedAt), source: adapter === "booking" ? "Booking.com" : "Google Hotels", source_adapter: adapter,
        price_per_night: null, no_availability: true, board_type: "unknown", raw: {},
      });

      const serpRes = new Map<string, AdapterResult>();
      if (serp && serpList.length) {
        const r = await serp.fetchMany(serpList, p);
        track("serpapi", r.calls, r.cost_usd);
        r.results.forEach((v, k) => { serpRes.set(k, v); health("serpapi", v.status); });
        r.results.forEach((v) => { if (v.status === "error") console.warn("serpapi error:", v.error); });
        // Zincir: SerpApi kıyaslanabilir fiyat vermediyse Booking'e düş.
        if (booking) {
          for (const s of serpList) {
            const sr = r.results.get(s.key);
            if (!sr || sr.status !== "ok" || !comparable(sr.quotes, board)) bookingList.push(s);
          }
        }
        // Google fiyatlarını Booking'i beklemeden hemen kaydet (Booking uzun sürüp zaman aşımına düşse de kaybolmasın).
        const fa = new Date().toISOString();
        const srows: SnapshotInput[] = [];
        for (const s of serpList) {
          const sr = serpRes.get(s.key);
          if (sr?.status === "ok") for (const q of sr.quotes) srows.push({ ...baseOf(s, fa), ...q, no_availability: false });
          else if (sr?.status === "no_prices" && !bookingList.includes(s)) srows.push(noPriceRow(s, fa, "serpapi"));
        }
        if (srows.length) {
          const w = await insertSnapshots(o.admin, srows, "Google kayıt", o.trigger);
          res.saved += w.saved; res.errors.push(...w.errors);
        }
      }
      const bookRes = new Map<string, AdapterResult>();
      const remainingSec = Math.floor((o.deadline - Date.now()) / 1000);
      const bookQueriedN = new Map<string, number>();
      const bookTried = new Map<string, number[]>();
      if (booking && bookingList.length && res.calls < o.maxCalls) {
        if (remainingSec < 30) {
          res.complete = false; // Booking için süre kalmadı; sonraki çağrıda tamamlanır.
        } else {
          const r = await booking.fetchMany(bookingList, { ...p, timeoutSec: Math.min(150, remainingSec - 10) });
          track("booking", r.calls, r.cost_usd);
          r.results.forEach((v, k) => bookRes.set(k, v));
          // Min. konaklama geri dönüşü: Booking seçilen gecede oda listesini boş döndürür (actor min. gece bilgisi vermez).
          // +1, sonra +2 gece ile tekrar sorulur (en fazla 2 ek run); fiyat gecelik kaydedilir.
          // +1 ve +2 gece paralel sorulur (Apify run'ı uzun sürdüğü için sırayla süreye sığmaz); en kısa fiyatlı olan alınır.
          const left = Math.floor((o.deadline - Date.now()) / 1000);
          const subs = bookingList.filter((s) => bookRes.get(s.key)?.status === "no_prices");
          if (iN < 7 && subs.length && left >= 40) {
            const ns = [iN + 1, iN + 2];
            const outs = await Promise.all(ns.map((n) =>
              booking.fetchMany(subs, { checkin, checkout: addDays(checkin, n), nights: n, adults: o.adults, timeoutSec: Math.min(150, left - 10) })
                .catch(() => null)));
            outs.forEach((r2) => { if (r2) track("booking", r2.calls, r2.cost_usd); });
            for (const s of subs) {
              bookTried.set(s.key, [iN, ...ns]);
              for (let i = 0; i < ns.length; i++) {
                const e2 = outs[i]?.results.get(s.key);
                if (e2?.status === "ok") { bookQueriedN.set(s.key, ns[i]); bookRes.set(s.key, e2); break; }
              }
            }
          } else if (iN < 7 && subs.length) {
            // Süre yetmedi: "fiyat yok" yazma, sonraki çağrıda yeniden denensin.
            for (const s of subs) bookRes.delete(s.key);
            res.complete = false;
          }
        }
      }

      const fetchedAt = new Date().toISOString();
      const rows: SnapshotInput[] = [];
      for (const s of todo) {
        const sr = serpRes.get(s.key);
        const br = bookRes.get(s.key);
        if (br) health("booking", br.status);
        if (!sr && !br) continue;
        res.fetched++;

        // Eşleşme bilgilerini kaydet
        const patch: Record<string, unknown> = { ...(sr?.match ?? {}), ...(br?.match ?? {}) };

        // Kaynak tercihi
        const nowIso = new Date().toISOString();
        if (br && br.status === "ok" && comparable(br.quotes, board)) {
          if (s.price_source_preference !== "booking" || !prefValid(s)) Object.assign(patch, { price_source_preference: "booking", price_source_checked_at: nowIso });
        } else if (sr && sr.status === "ok" && comparable(sr.quotes, board)) {
          if (s.price_source_preference !== "serpapi" || !prefValid(s)) Object.assign(patch, { price_source_preference: "serpapi", price_source_checked_at: nowIso });
        } else if (
          !prefValid(s) &&
          (!sr || sr.status === "not_found" || sr.status === "no_prices") &&
          (br ? br.status === "not_found" : !booking) &&
          (booking || !apifyToken)
        ) {
          Object.assign(patch, { price_source_preference: "none", price_source_checked_at: nowIso });
        }
        await updateSubject(o.admin, o.business.id, s, patch);

        // Google satırları yukarıda yazıldı; burada yalnızca Booking (ve Booking'e düşüp onu da alamayan Google "fiyat yok").
        if (br?.status === "ok") {
          const qn = bookQueriedN.get(s.key) ?? iN;
          for (const q of br.quotes) rows.push({ ...baseOf(s, fetchedAt), ...q, no_availability: false, queried_nights: qn, min_stay_nights: qn > iN ? qn : null } as SnapshotInput);
        } else if (br?.status === "no_prices") {
          rows.push({ ...noPriceRow(s, fetchedAt, "booking"), raw: { tried_nights: bookTried.get(s.key) ?? [iN] } });
        } else if (sr?.status === "no_prices" && bookingList.includes(s)) {
          rows.push(noPriceRow(s, fetchedAt, "serpapi"));
        }
      }
      if (rows.length) {
        const w = await insertSnapshots(o.admin, rows, "Booking kayıt", o.trigger);
        res.saved += w.saved; res.errors.push(...w.errors);
      }
    }
  } finally {
    if (res.saved > 0) {
      try { await refreshBaseRooms(o.admin, o.business.id); } catch (e) { console.error("refreshBaseRooms failed", e); }
    }
    const logs = Object.entries(perAdapter)
      .filter(([, v]) => v.calls > 0 || v.cost > 0 || v.ok + v.no_prices + v.error > 0)
      .map(([adapter, v]) => ({
        business_id: o.business.id,
        adapter,
        calls: v.calls,
        estimated_cost_usd: Number(v.cost.toFixed(4)),
        trigger: o.trigger,
        ok_count: v.ok,
        no_prices_count: v.no_prices,
        error_count: v.error,
      }));
    if (logs.length) await o.admin.from("price_fetch_log").insert(logs);
  }
  return res;
}
