// Fiyat çekim motoru: kaynak zinciri (SerpApi → Booking/Apify), kaynak tercihi, cache,
// sorgu tavanı, snapshot yazımı ve maliyet kaydı.
import { createBookingAdapter } from "./booking.ts";
import { createSerpApiAdapter } from "./serpapi.ts";
import { createEtsAdapter } from "./etstur.ts";
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
  trigger: "manual" | "cron";
};

export type EngineResult = {
  calls: number;
  cost_usd: number;
  complete: boolean;
  capped: boolean;
  fetched: number;
  cached: number;
  skipped_no_source: number;
};

export async function loadSubjects(admin: any, b: EngineBusiness, competitorIds?: string[], includeOwn = true) {
  let q = admin
    .from("ci_competitors")
    .select("id, name, city, serpapi_property_token, booking_url, price_source_preference, price_source_checked_at, etstur_slug, etstur_hotel_id, etstur_checked_at")
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
  const serp: PriceAdapter | null = serpKey ? createSerpApiAdapter(serpKey) : null;
  const booking: PriceAdapter | null = o.allowBooking && apifyToken ? createBookingAdapter(apifyToken) : null;
  const board = (o.business.price_compare_board_type ?? "breakfast") as BoardType;

  const subjects = await loadSubjects(o.admin, o.business, o.competitorIds, o.includeOwn ?? true);
  const res: EngineResult = { calls: 0, cost_usd: 0, complete: true, capped: false, fetched: 0, cached: 0, skipped_no_source: 0 };
  const perAdapter: Record<string, { calls: number; cost: number }> = {};
  const track = (id: string, calls: number, cost: number) => {
    perAdapter[id] ??= { calls: 0, cost: 0 };
    perAdapter[id].calls += calls;
    perAdapter[id].cost += cost;
    res.calls += calls;
    res.cost_usd += cost;
  };

  // Cache: son cacheHours içinde çekilmiş (mülk, tarih) çiftleri.
  const done = new Set<string>();
  const doneDom = new Set<string>();
  const ets = createEtsAdapter();
  if (!o.force && o.dates.length) {
    const since = new Date(Date.now() - o.cacheHours * 3600_000).toISOString();
    const { data } = await o.admin
      .from("competitor_price_snapshots")
      .select("subject_type, competitor_id, checkin, market")
      .eq("business_id", o.business.id)
      .eq("nights", o.nights)
      .eq("adults", o.adults)
      .in("checkin", o.dates)
      .gte("fetched_at", since)
      .limit(10000);
    for (const r of data ?? []) {
      const k = `${r.subject_type === "own" ? "own" : r.competitor_id}|${r.checkin}`;
      if (r.market === "domestic") doneDom.add(k); else done.add(k);
    }
  }

  try {
    for (const checkin of o.dates) {
      if (Date.now() > o.deadline) { res.complete = false; break; }
      if (res.calls >= o.maxCalls) { res.capped = true; res.complete = false; break; }

      // Yurt içi pazar (ETS): uluslararası zincirden tamamen ayrı; hücrelerde asla karışmaz.
      {
        const etsTodo = subjects.filter((s) => {
          if (doneDom.has(`${s.key}|${checkin}`)) return false;
          // Eşleşme bulunamamış ve 30 gün geçmemişse tekrar deneme.
          if (!s.etstur_hotel_id && (s as any).etstur_checked_at && Date.now() - new Date((s as any).etstur_checked_at).getTime() < PREF_TTL_MS) return false;
          return true;
        });
        if (etsTodo.length) {
          const pe = { checkin, checkout: addDays(checkin, o.nights), nights: o.nights, adults: o.adults };
          const r = await ets.fetchMany(etsTodo, pe);
          track("etstur", r.unlocker_calls, r.cost_usd);
          const fa = new Date().toISOString();
          const erows: any[] = [];
          for (const s of etsTodo) {
            const er = r.results.get(s.key);
            if (!er) continue;
            if (er.match && Object.keys(er.match).length) await updateSubject(o.admin, o.business.id, s, er.match as any);
            const base = { business_id: o.business.id, competitor_id: s.competitor_id, subject_type: s.subject_type, checkin, nights: o.nights, adults: o.adults, currency: "TRY", fetched_at: fa, market: "domestic" };
            if (er.status === "ok") {
              for (const q of er.quotes) erows.push({
                ...base, source: q.source, source_adapter: q.source_adapter, price: q.price_per_night,
                price_per_night: q.price_per_night, price_total: q.price_total, price_derived: q.price_derived,
                board_type: q.board_type, room_name: q.room_name, refundable: q.refundable, free_cancellation: q.refundable,
                taxes_included: q.taxes_included, is_official: false, is_ad: false, raw: q.raw,
                price_before_discount: q.price_before_discount, campaign_price: q.campaign_price, campaign_label: q.campaign_label,
                remaining_allotment: q.remaining_allotment, cancellation_details: q.cancellation_details,
              });
            } else if (er.status === "no_prices") {
              erows.push({ ...base, source: "ETS Tur", source_adapter: "etstur", price: null, no_availability: true, board_type: "unknown", is_official: false, is_ad: false });
            }
          }
          if (erows.length) {
            const { error } = await o.admin.from("competitor_price_snapshots").insert(erows);
            if (error) console.error("ets snapshot insert failed", error);
          }
        }
      }

      const todo = subjects.filter((s) => {
        if (done.has(`${s.key}|${checkin}`)) { res.cached++; return false; }
        return true;
      });
      if (!todo.length) continue;
      const p = { checkin, checkout: addDays(checkin, o.nights), nights: o.nights, adults: o.adults };

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

      const serpRes = new Map<string, AdapterResult>();
      if (serp && serpList.length) {
        const r = await serp.fetchMany(serpList, p);
        track("serpapi", r.calls, r.cost_usd);
        r.results.forEach((v, k) => serpRes.set(k, v));
        // Zincir: SerpApi kıyaslanabilir fiyat vermediyse Booking'e düş.
        if (booking) {
          for (const s of serpList) {
            const sr = r.results.get(s.key);
            if (!sr || sr.status !== "ok" || !comparable(sr.quotes, board)) bookingList.push(s);
          }
        }
      }
      const bookRes = new Map<string, AdapterResult>();
      if (booking && bookingList.length && res.calls < o.maxCalls) {
        const r = await booking.fetchMany(bookingList, p);
        track("booking", r.calls, r.cost_usd);
        r.results.forEach((v, k) => bookRes.set(k, v));
      }

      const fetchedAt = new Date().toISOString();
      const rows: any[] = [];
      for (const s of todo) {
        const sr = serpRes.get(s.key);
        const br = bookRes.get(s.key);
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
          (!br || br.status === "not_found") &&
          (booking || !apifyToken)
        ) {
          Object.assign(patch, { price_source_preference: "none", price_source_checked_at: nowIso });
        }
        await updateSubject(o.admin, o.business.id, s, patch);

        const quotes = [...(sr?.quotes ?? []), ...(br?.quotes ?? [])];
        const base = {
          business_id: o.business.id,
          competitor_id: s.competitor_id,
          subject_type: s.subject_type,
          checkin,
          nights: o.nights,
          adults: o.adults,
          currency: "TRY",
          fetched_at: fetchedAt,
        };
        if (quotes.length) {
          for (const q of quotes) {
            rows.push({
              ...base,
              source: q.source,
              source_adapter: q.source_adapter,
              price: q.price_per_night, // geriye uyum: price = gecelik
              price_per_night: q.price_per_night,
              price_total: q.price_total,
              price_derived: q.price_derived,
              board_type: q.board_type,
              room_name: q.room_name,
              refundable: q.refundable,
              free_cancellation: q.refundable,
              taxes_included: q.taxes_included,
              is_official: q.is_official,
              is_ad: q.is_ad,
              num_guests: q.num_guests,
              raw: q.raw,
            });
          }
        } else if (sr?.status === "no_prices" || br?.status === "no_prices") {
          rows.push({
            ...base,
            source: br ? "Booking.com" : "Google Hotels",
            source_adapter: br ? "booking" : "serpapi",
            price: null,
            no_availability: true,
            board_type: "unknown",
            is_official: false,
            is_ad: false,
          });
        }
      }
      if (rows.length) {
        const { error } = await o.admin.from("competitor_price_snapshots").insert(rows);
        if (error) console.error("snapshot insert failed", error);
      }
    }
  } finally {
    const logs = Object.entries(perAdapter)
      .filter(([a, v]) => v.calls > 0 || (a === "etstur" && v.cost >= 0 && false))
      .map(([adapter, v]) => ({
        business_id: o.business.id,
        adapter,
        calls: v.calls,
        estimated_cost_usd: Number(v.cost.toFixed(4)),
        trigger: o.trigger,
      }));
    if (logs.length) await o.admin.from("price_fetch_log").insert(logs);
  }
  return res;
}
