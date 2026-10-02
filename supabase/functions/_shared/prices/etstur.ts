// ETS Tur adapter'ı (yurt içi pazar). Önce doğrudan etstur.com iç API'si denenir;
// engellenirse Bright Data Unlocker'a düşülür (yalnızca gerektiğinde → maliyet düşük).
import type { AdapterResult, BatchResult, BoardType, FetchParams, PriceQuote, Subject } from "./types.ts";
import { similarity } from "./types.ts";
import { UNLOCKER_COST_USD, unlockerAvailable, unlockerFetch } from "./unlocker.ts";

const BASE = "https://www.etstur.com/services/api";
const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36";

export type EtsMatch = { etstur_slug?: string; etstur_hotel_id?: string; etstur_matched_name?: string; etstur_checked_at?: string };

export function etsBoard(code: string | null | undefined, label: string | null | undefined): BoardType {
  const c = String(code ?? "").toUpperCase();
  const l = String(label ?? "").toLocaleLowerCase("tr");
  if (["AI", "LAI", "UAI", "UALL"].includes(c) || /her\s*şey\s*dahil|all\s*inclusive/.test(l)) return "all_inclusive";
  if (/tam\s*pansiyon/.test(l)) return "full_board";
  if (/yarım\s*pansiyon/.test(l)) return "half_board";
  if (/oda\s*kahvaltı|kahvaltı\s*dahil/.test(l)) return "breakfast";
  if (/sadece\s*oda/.test(l)) return "room_only";
  console.warn("etstur unknown board code", c, label);
  return "unknown";
}

function slugCandidates(name: string, city: string | null) {
  const fold = (s: string) =>
    s.replace(/İ/g, "I").replace(/ı/g, "i").replace(/ş/g, "s").replace(/Ş/g, "S").replace(/ğ/g, "g").replace(/Ğ/g, "G")
      .replace(/ü/g, "u").replace(/Ü/g, "U").replace(/ö/g, "o").replace(/Ö/g, "O").replace(/ç/g, "c").replace(/Ç/g, "C")
      .replace(/&/g, " ").replace(/[^A-Za-z0-9\s-]/g, " ").trim();
  const words = fold(name).split(/\s+/).filter((w) => w && !/^(hotel|otel|resort|spa)$/i.test(w) || false);
  const all = fold(name).split(/\s+/).filter(Boolean);
  const cap = (ws: string[]) => ws.map((w) => w[0].toUpperCase() + w.slice(1)).join("-");
  const out = new Set<string>();
  if (all.length) out.add(cap(all));
  if (words.length && words.length !== all.length) out.add(cap(words));
  if (city && all.length) out.add(cap([...all, ...fold(city).split(/\s+/)]));
  return Array.from(out).slice(0, 3);
}

/** Doğrudan dener; HTTP hatası/HTML/engel durumunda Bright Data'ya düşer. */
async function etsCall(url: string, method: "GET" | "POST", body: string | undefined, counter: { unlocker: number }) {
  let reason = "";
  try {
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json", "User-Agent": UA, Accept: "application/json" },
      body,
      signal: AbortSignal.timeout(20_000),
    });
    const t = await res.text();
    if (res.ok && t.trim().startsWith("{")) return JSON.parse(t);
    reason = `status ${res.status}${res.ok ? " (JSON değil)" : ""} · ${t.slice(0, 120).replace(/\s+/g, " ")}`;
  } catch (e) { reason = `fetch hatası: ${e instanceof Error ? e.message : String(e)}`; }
  console.warn(`ETS direct failed → Bright Data fallback [${method} ${url.replace(/^https?:\/\/[^/]+/, "")}]: ${reason}`);
  if (!unlockerAvailable()) throw new Error(`ETS doğrudan erişilemedi (${reason}) ve Bright Data yok`);
  counter.unlocker++;
  const r = await unlockerFetch({ url, method, body, headers: { "Content-Type": "application/json" } });
  if (r.status >= 400) throw new Error(`Bright Data ${r.status}`);
  return JSON.parse(r.text);
}

async function resolveHotel(s: Subject, counter: { unlocker: number; calls: number }): Promise<{ id: string; slug: string; name: string } | null> {
  // Yalnızca elle girilen slug çözülür; otomatik eşleştirme matcher.ts'te.
  if (!s.etstur_slug) return null;
  const tries = [s.etstur_slug];
  for (const slug of tries) {
    counter.calls++;
    const d = await etsCall(`${BASE}/hotel/detail/${encodeURIComponent(slug)}`, "GET", undefined, counter).catch(() => null);
    const id = d?.result?.hotelId;
    const nm = String(d?.result?.name ?? "");
    if (!id) continue;
    if (!s.etstur_slug && similarity(s.name, nm) < 0.5) continue;
    return { id: String(id), slug, name: nm };
  }
  return null;
}

export function parseRoomMulti(data: any, nights: number): { quotes: PriceQuote[]; anyRoom: boolean; minStay: number | null } {
  const quotes: PriceQuote[] = [];
  let anyRoom = false;
  let minStay: number | null = null;
  for (const g of data?.result?.roomGroups ?? []) {
    for (const room of g?.rooms ?? []) {
      for (const sb of room?.subBoards ?? []) {
        anyRoom = true;
        if (sb?.availability?.type === "MIN_STAY" && Number(sb?.availability?.nightCount) > 0) {
          const n = Number(sb.availability.nightCount);
          minStay = minStay === null ? n : Math.min(minStay, n);
        }
        if (sb?.availability?.type !== "AVAILABLE") continue;
        const disc = Number(sb?.price?.discountedPrice) || 0;
        const amt = Number(sb?.price?.amount) || 0;
        const total = disc || amt;
        if (!total) continue;
        const n = Number(room?.nightCount) || nights;
        quotes.push({
          source: "ETS Tur",
          source_adapter: "etstur",
          price_per_night: total / n,
          price_total: total,
          price_derived: true,
          board_type: etsBoard(sb?.boardType?.code, sb?.boardType?.label),
          room_name: room?.roomName ? String(room.roomName) : null,
          refundable: sb?.cancellation ? sb.cancellation === "FREE_CANCELLATION" : null,
          taxes_included: true,
          is_official: false,
          is_ad: false,
          num_guests: null,
          price_before_discount: amt || null,
          campaign_price: Number(sb?.campaignHighlightedPrice?.price?.amount) || null,
          campaign_label: sb?.campaignHighlightedPrice?.label ?? null,
          remaining_allotment: typeof sb?.lastAllotmentCount === "number" ? sb.lastAllotmentCount : null,
          cancellation_details: sb?.cancellationDetails ?? null,
          raw: { roomId: room?.roomId, maxAdultCapacity: room?.maxAdultCapacity, board: sb?.boardType, cancellation: sb?.cancellation, price: sb?.price, minPrice: data?.result?.minPrice },
        });
      }
    }
  }
  return { quotes, anyRoom, minStay };
}

export function createEtsAdapter() {
  return {
    id: "etstur" as const,
    async fetchMany(subjects: Subject[], p: FetchParams): Promise<BatchResult & { unlocker_calls: number }> {
      const results = new Map<string, AdapterResult>();
      const counter = { unlocker: 0, calls: 0 };
      // Bright Data'ya düşen çağrılar yavaş (5–45 sn); mülkler 4'erli paralel işlenir.
      const one = async (s: Subject) => {
        try {
          const match: EtsMatch = {};
          let hotelId = s.etstur_hotel_id;
          if (!hotelId) {
            const h = await resolveHotel(s, counter);
            match.etstur_checked_at = new Date().toISOString();
            if (!h) { results.set(s.key, { status: "not_found", quotes: [], match: match as any }); return; }
            hotelId = h.id;
            Object.assign(match, { etstur_hotel_id: h.id, etstur_slug: h.slug, etstur_matched_name: h.name });
          }
          counter.calls++;
          const body = JSON.stringify({ hotelId, checkIn: p.checkin, checkOut: p.checkout, rooms: [{ adultCount: p.adults, childCount: 0, childAges: [] }] });
          let data: any;
          try { data = await etsCall(`${BASE}/room/multi`, "POST", body, counter); }
          catch (e1) { console.warn("etstur retry", s.name, String(e1)); data = await etsCall(`${BASE}/room/multi`, "POST", body, counter); }
          const { quotes, minStay } = parseRoomMulti(data, p.nights);
          results.set(s.key, { status: quotes.length ? "ok" : "no_prices", quotes, match: match as any, min_stay: quotes.length ? null : minStay });
        } catch (e) {
          console.error("etstur adapter failed", s.name, e);
          results.set(s.key, { status: "error", quotes: [], error: String(e) });
        }
      };
      const queue = [...subjects];
      await Promise.all(Array.from({ length: Math.min(4, queue.length) }, async () => {
        while (queue.length) await one(queue.shift()!);
      }));
      return { results, calls: counter.calls, unlocker_calls: counter.unlocker, cost_usd: counter.unlocker * UNLOCKER_COST_USD };
    },
  };
}
