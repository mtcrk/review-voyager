// Arama tabanlı otomatik otel eşleştirme (fiyat çekmez).
// Kaynaklar sitelerin kendi arama/autocomplete servisleri: ETS /v2/autocomplete, Jolly /Shared/Search,
// Tatil Sepeti /common/hotelsearch, Booking autocomplete + arama sayfası, Google Hotels (SerpApi).
import { type Candidate, pickBest, queryVariants, type Scored } from "./matching.ts";
import { type Counter, domesticCall, UA } from "./domesticHtml.ts";
import { unlockerAvailable, unlockerFetch } from "./unlocker.ts";
import { addDays } from "./types.ts";

export type SourceId = "etstur" | "jollytur" | "tatilsepeti" | "booking" | "serpapi";
export const SOURCES: SourceId[] = ["etstur", "jollytur", "tatilsepeti", "booking", "serpapi"];
export const RETRY_MS = 7 * 86400_000;

// Kaynak başına "kimlik" alanları (fiyat motorunun kullandığı).
export const FIELDS: Record<SourceId, { idCols: string[]; nameCol: string }> = {
  etstur: { idCols: ["etstur_hotel_id", "etstur_slug"], nameCol: "etstur_matched_name" },
  jollytur: { idCols: ["jollytur_hotel_id", "jollytur_slug"], nameCol: "jollytur_matched_name" },
  tatilsepeti: { idCols: ["tatilsepeti_slug"], nameCol: "tatilsepeti_matched_name" },
  booking: { idCols: ["booking_url"], nameCol: "booking_matched_name" },
  serpapi: { idCols: ["serpapi_property_token"], nameCol: "serpapi_matched_name" },
};
export const MATCH_COLS = [
  "match_name_snapshot",
  ...SOURCES.flatMap((s) => [...FIELDS[s].idCols, FIELDS[s].nameCol, `${s}_match_status`, `${s}_match_confidence`, `${s}_match_reason`, `${s}_match_source`, `${s}_match_candidate`, `${s}_match_checked_at`]),
].join(", ");

type Found = { cands: Candidate[]; cost: number };

async function getJson(url: string, c: Counter, init: { method?: "GET" | "POST"; body?: string; headers?: Record<string, string> } = {}) {
  const t = await domesticCall(url, init, c);
  return JSON.parse(t);
}

const searchers: Record<SourceId, (name: string, city: string | null, c: Counter) => Promise<Found>> = {
  async etstur(name, city, c) {
    const out: Candidate[] = [];
    for (const q of queryVariants(name, city)) {
      const d = await getJson(`https://www.etstur.com/v2/autocomplete?q=${encodeURIComponent(q)}`, c).catch(() => null);
      for (const it of d?.result ?? []) {
        if (it?.type !== "HOTEL" || it?.listingType !== "HOTEL_DOMESTIC" || !it?.url) continue;
        const title = String(it.title ?? "");
        out.push({ name: title, location: [title.split(",").slice(1).join(","), ...(it.state ?? []), it.city].filter(Boolean).join(" "), data: { slug: String(it.url), name: title.split(",")[0].trim() } });
      }
      if (out.length) break;
    }
    return { cands: out, cost: 0 };
  },
  async jollytur(name, city, c) {
    const out: Candidate[] = [];
    for (const q of queryVariants(name, city)) {
      const d = await getJson(`https://www.jollytur.com/Shared/Search?type=HotelPlanner&key=${encodeURIComponent(q)}`, c).catch(() => null);
      for (const it of Array.isArray(d) ? d : []) {
        if (!it?.isDomestic || it?.typeName !== "Otel" || !it?.id) continue;
        out.push({ name: String(it.value ?? ""), location: String(it.destinationBreadCrumb ?? ""), data: { id: String(it.id), slug: String(it.adjustName ?? "").replace(/^\//, ""), name: String(it.value ?? "") } });
      }
      if (out.length) break;
    }
    return { cands: out, cost: 0 };
  },
  async tatilsepeti(name, city, c) {
    const out: Candidate[] = [];
    for (const q of queryVariants(name, city)) {
      const d = await getJson(`https://www.tatilsepeti.com/common/hotelsearch?value=${encodeURIComponent(q)}`, c).catch(() => null);
      for (const it of Array.isArray(d) ? d : []) {
        if (!it?.IsDomestic || Number(it?.TypeId) !== 1 || !it?.Link) continue;
        out.push({ name: String(it.Title ?? ""), location: `${it.AreaPlace ?? ""} ${it.Category ?? ""}`, data: { slug: String(it.Link).replace(/^\//, ""), name: String(it.Title ?? "") } });
      }
      if (out.length) break;
    }
    return { cands: out, cost: 0 };
  },
  async booking(name, city, c) {
    const out: Candidate[] = [];
    for (const q of queryVariants(name, city)) {
      const d = await getJson("https://accommodations.booking.com/autocomplete.json", c, {
        method: "POST", body: JSON.stringify({ query: q, language: "en-gb", size: 8 }), headers: { "Content-Type": "application/json" },
      }).catch(() => null);
      for (const it of d?.results ?? []) {
        if (it?.dest_type !== "hotel" || it?.cc1 !== "tr") continue;
        const gps = typeof it.latitude === "number" ? { lat: it.latitude, lng: it.longitude } : null;
        out.push({ name: String(it.label1 ?? ""), location: String(it.label2 ?? ""), gps, data: { dest_id: String(it.dest_id), name: String(it.label1 ?? "").replace(/\s*-\s*(Ultra\s+)?All Inclusive$/i, "") } });
      }
      if (out.length) break;
    }
    return { cands: out, cost: 0 };
  },
  async serpapi(name, city) {
    const key = Deno.env.get("SERPAPI_API_KEY");
    if (!key) return { cands: [], cost: 0 };
    const ci = addDays(new Date().toISOString().slice(0, 10), 14);
    const q = [String(name).split(",")[0], city].filter(Boolean).join(" ");
    const r = await fetch(`https://serpapi.com/search.json?engine=google_hotels&gl=tr&hl=tr&currency=TRY&adults=2&check_in_date=${ci}&check_out_date=${addDays(ci, 1)}&q=${encodeURIComponent(q)}&api_key=${key}`);
    const d = await r.json();
    const out: Candidate[] = [];
    const add = (p: any) => {
      if (!p?.property_token || !p?.name) return;
      const g = p.gps_coordinates;
      out.push({ name: String(p.name), location: String(p.address ?? ""), gps: g ? { lat: Number(g.latitude), lng: Number(g.longitude) } : null, data: { token: String(p.property_token), name: String(p.name) } });
    };
    // Tam eşleşmede Google tek otel sayfası döndürür (properties yok, alanlar üst seviyede).
    if (!Array.isArray(d?.properties) && d?.property_token) add(d);
    for (const p of d?.properties ?? []) add(p);
    return { cands: out, cost: 0.0125 };
  },
};

/** Seçilen adayın kalıcı kimliğini tamamlar (ETS → hotelId, Booking → otel sayfa adresi). */
async function finalize(src: SourceId, s: Scored, c: Counter): Promise<Record<string, unknown> | null> {
  const d = s.cand.data as any;
  if (src === "etstur") {
    const r = await getJson(`https://www.etstur.com/services/api/hotel/detail/${encodeURIComponent(d.slug)}`, c).catch(() => null);
    const id = r?.result?.hotelId;
    return id ? { etstur_hotel_id: String(id), etstur_slug: d.slug, etstur_matched_name: String(r?.result?.name ?? d.name) } : null;
  }
  if (src === "jollytur") return { jollytur_hotel_id: d.id, jollytur_slug: d.slug, jollytur_matched_name: d.name };
  if (src === "tatilsepeti") return { tatilsepeti_slug: d.slug, tatilsepeti_matched_name: d.name };
  if (src === "serpapi") return { serpapi_property_token: d.token, serpapi_matched_name: d.name };
  // Booking: arama sayfasında hpos=1 olan bağlantı hedef oteldir.
  const url = `https://www.booking.com/searchresults.html?dest_id=${d.dest_id}&dest_type=hotel&lang=en-gb`;
  let html = "";
  try {
    c.calls++;
    const r = await fetch(url, { headers: { "User-Agent": UA, "Accept-Language": "en-GB" }, signal: AbortSignal.timeout(25_000) });
    if (r.ok) html = await r.text();
  } catch (_) { /* fallback */ }
  if (!/hotel\/[a-z]{2}\/[a-z0-9-]+\.[a-z-]*\.?html[^"]*dest_id=/.test(html) && unlockerAvailable()) {
    c.unlocker++;
    const r = await unlockerFetch({ url, country: "de" });
    if (r.status < 400) html = r.text;
  }
  const m = html.match(new RegExp(`https://www\\.booking\\.com/hotel/([a-z]{2})/([a-z0-9-]+)\\.[a-z-]+\\.html\\?[^"]*dest_id=${d.dest_id}[^"]*hpos=1`)) ??
    html.match(/https:\/\/www\.booking\.com\/hotel\/([a-z]{2})\/([a-z0-9-]+)\.[a-z-]+\.html\?[^"]*hpos=1&/);
  return m ? { booking_url: `https://www.booking.com/hotel/${m[1]}/${m[2]}.html`, booking_matched_name: d.name } : null;
}

export type Row = Record<string, any> & { name: string; city: string | null };
export type MatchOutcome = { source: SourceId; status: "matched" | "pending" | "not_found" | "skipped" | "error"; name?: string; confidence?: number; reason?: string };

function nullIds(src: SourceId) {
  const p: Record<string, unknown> = { [FIELDS[src].nameCol]: null };
  for (const col of FIELDS[src].idCols) p[col] = null;
  if (src === "etstur") p.etstur_checked_at = null;
  if (src === "jollytur") p.jollytur_checked_at = null;
  if (src === "tatilsepeti") p.tatilsepeti_checked_at = null;
  return p;
}

export function needsMatch(row: Row, src: SourceId, force: boolean) {
  if (row[`${src}_match_source`] === "manual") return false;
  if (force) return true;
  if (row.match_name_snapshot && row.match_name_snapshot !== row.name) return true;
  const st = row[`${src}_match_status`];
  if (st === "pending") return false;
  const at = row[`${src}_match_checked_at`];
  if (!st || !at) return true;
  return Date.now() - new Date(at).getTime() > RETRY_MS && st !== "matched";
}

/** Bir mülk için seçilen kaynakları eşleştirir; satır patch'ini ve sonuçları döndürür. */
export async function matchRow(row: Row, opts: { force?: boolean; sources?: SourceId[]; allowPaid?: boolean } = {}) {
  const c: Counter = { calls: 0, unlocker: 0 };
  let cost = 0;
  const patch: Record<string, unknown> = { match_name_snapshot: row.name };
  const outcomes: MatchOutcome[] = [];
  // Çapraz doğrulama referansları: işletme adı + yüksek güvenle eşleşmiş resmi adlar.
  const refs = [row.name];
  for (const src of SOURCES) {
    if (row[`${src}_match_status`] === "matched" || row[`${src}_match_source`] === "manual") {
      const nm = row[FIELDS[src].nameCol];
      if (nm && row[`${src}_match_confidence`] >= 0.9) refs.push(nm);
    }
  }
  const now = new Date().toISOString();
  for (const src of opts.sources ?? SOURCES) {
    if (src === "serpapi" && opts.allowPaid === false) { outcomes.push({ source: src, status: "skipped", reason: "ücretli arama kapalı" }); continue; }
    if (!needsMatch(row, src, !!opts.force)) { outcomes.push({ source: src, status: "skipped", reason: row[`${src}_match_source`] === "manual" ? "elle girildi" : "güncel" }); continue; }
    try {
      const f = await searchers[src](row.name, row.city, c);
      cost += f.cost;
      const { best, rejected } = pickBest(refs, row.city, f.cands);
      const rej = rejected.map((r) => r.reason).join(" · ");
      const base = { [`${src}_match_checked_at`]: now, [`${src}_match_source`]: "auto" };
      if (!best) {
        Object.assign(patch, nullIds(src), base, { [`${src}_match_status`]: "not_found", [`${src}_match_confidence`]: 0, [`${src}_match_candidate`]: null, [`${src}_match_reason`]: f.cands.length ? `Reddedildi: ${rej}`.slice(0, 600) : "aramada aday çıkmadı" });
        outcomes.push({ source: src, status: "not_found", reason: f.cands.length ? rej : "aday yok" });
        continue;
      }
      const ids = await finalize(src, best, c);
      if (!ids) {
        Object.assign(patch, nullIds(src), base, { [`${src}_match_status`]: "not_found", [`${src}_match_confidence`]: 0, [`${src}_match_candidate`]: null, [`${src}_match_reason`]: `${best.cand.name}: otel sayfası açılamadı` });
        outcomes.push({ source: src, status: "not_found", reason: "otel sayfası açılamadı" });
        continue;
      }
      const reason = (best.level === "high" ? best.reason : best.reason) + (rej ? ` · Reddedilen: ${rej}` : "");
      if (best.level === "high") {
        Object.assign(patch, ids, base, { [`${src}_match_status`]: "matched", [`${src}_match_confidence`]: best.confidence, [`${src}_match_candidate`]: null, [`${src}_match_reason`]: reason.slice(0, 600) });
        if (src === "etstur") patch.etstur_checked_at = now;
        if (src === "jollytur") patch.jollytur_checked_at = now;
        if (src === "tatilsepeti") patch.tatilsepeti_checked_at = now;
        refs.push(String(ids[FIELDS[src].nameCol] ?? best.cand.name));
        outcomes.push({ source: src, status: "matched", name: String(ids[FIELDS[src].nameCol]), confidence: best.confidence, reason });
      } else {
        Object.assign(patch, nullIds(src), base, { [`${src}_match_status`]: "pending", [`${src}_match_confidence`]: best.confidence, [`${src}_match_candidate`]: ids, [`${src}_match_reason`]: reason.slice(0, 600) });
        outcomes.push({ source: src, status: "pending", name: String(ids[FIELDS[src].nameCol]), confidence: best.confidence, reason });
      }
    } catch (e) {
      console.error("match failed", src, row.name, e);
      outcomes.push({ source: src, status: "error", reason: String(e).slice(0, 200) });
    }
  }
  return { patch, outcomes, calls: c.calls, unlocker: c.unlocker, cost_usd: cost + c.unlocker * 0.0015 };
}
