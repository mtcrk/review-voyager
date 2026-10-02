import { detectBoard } from "./board.ts";
import type { AdapterResult, BatchResult, FetchParams, PriceAdapter, PriceQuote, Subject } from "./types.ts";
import { similarity, splitPrice } from "./types.ts";

// SerpApi planlarında arama başı maliyet ~0.01–0.015 USD; tahmini değer.
const COST_PER_CALL_USD = 0.0125;

function rowsFrom(list: any[], isAd: boolean, nights: number): PriceQuote[] {
  const out: PriceQuote[] = [];
  for (const row of list ?? []) {
    const source = String(row?.source ?? "Google Hotels");
    const official = !!row?.official;
    const rooms: any[] = Array.isArray(row?.rooms) ? row.rooms : [];
    if (rooms.length) {
      for (const room of rooms) {
        const sp = splitPrice(
          room?.rate_per_night?.extracted_lowest ?? room?.extracted_rate_per_night,
          room?.total_rate?.extracted_lowest ?? room?.extracted_total_rate,
          nights,
        );
        if (!sp) continue;
        const name = room?.name ? String(room.name) : null;
        out.push({
          source,
          source_adapter: "serpapi",
          ...sp,
          board_type: detectBoard(name, room?.description, ...(room?.amenities ?? [])),
          room_name: name,
          refundable: typeof row?.free_cancellation === "boolean" ? row.free_cancellation : null,
          taxes_included: null,
          is_official: official,
          is_ad: isAd,
          num_guests: typeof room?.num_guests === "number" ? room.num_guests : null,
          raw: { ...row, rooms: undefined, room },
        });
      }
      continue;
    }
    const rpn = row?.rate_per_night ?? {};
    const tot = row?.total_rate ?? {};
    const sp = splitPrice(rpn.extracted_lowest, tot.extracted_lowest, nights);
    if (!sp) continue;
    const before = rpn.extracted_before_taxes_fees;
    out.push({
      source,
      source_adapter: "serpapi",
      ...sp,
      board_type: detectBoard(row?.description, row?.name),
      room_name: null,
      refundable: typeof row?.free_cancellation === "boolean" ? row.free_cancellation : null,
      taxes_included:
        typeof before === "number" && typeof rpn.extracted_lowest === "number"
          ? rpn.extracted_lowest > before
          : null,
      is_official: official,
      is_ad: isAd,
      num_guests: typeof row?.num_guests === "number" ? row.num_guests : null,
      raw: row,
    });
  }
  return out;
}

export function createSerpApiAdapter(apiKey: string): PriceAdapter {
  const base = (p: FetchParams) =>
    `https://serpapi.com/search.json?engine=google_hotels&gl=tr&hl=tr&currency=TRY` +
    `&check_in_date=${p.checkin}&check_out_date=${p.checkout}&adults=${p.adults}&api_key=${apiKey}`;

  return {
    id: "serpapi",
    async fetchMany(subjects: Subject[], p: FetchParams): Promise<BatchResult> {
      const results = new Map<string, AdapterResult>();
      let calls = 0;
      for (const s of subjects) {
        try {
          let token = s.serpapi_property_token;
          const match: AdapterResult["match"] = {};
          if (!token) {
            // Eşleştirme matcher.ts'te; eşleşmesiz mülk için arama yapılmaz.
            results.set(s.key, { status: "not_found", quotes: [] });
            continue;
          }
          calls++;
          const res = await fetch(`${base(p)}&property_token=${encodeURIComponent(token)}`);
          const payload = await res.json();
          if (payload?.error && !payload?.prices) {
            results.set(s.key, { status: "error", quotes: [], match, error: String(payload.error) });
            continue;
          }
          if (!match.serpapi_matched_name && payload?.name && !s.serpapi_property_token) {
            match.serpapi_matched_name = String(payload.name);
          }
          const quotes = [
            ...rowsFrom(payload?.prices ?? [], false, p.nights),
            ...rowsFrom(payload?.featured_prices ?? [], true, p.nights),
          ];
          results.set(s.key, { status: quotes.length ? "ok" : "no_prices", quotes, match });
        } catch (e) {
          console.error("serpapi adapter failed", s.name, e);
          results.set(s.key, { status: "error", quotes: [], error: String(e) });
        }
      }
      return { results, calls, cost_usd: calls * COST_PER_CALL_USD };
    },
  };
}
