// Jolly Tur adapter'ı. Doğrudan erişim çalışıyor (Bright Data yalnızca engelde).
// Eşleşme: GET /Shared/Search?type=HotelPlanner&key=… (JSON) → id + adjustName.
// Fiyat: POST /hotel/GetReservationCompletePartial (JSON; "html" alanında oda kartları, toplam fiyat, vergiler dahil).
import { DOMParser } from "https://deno.land/x/deno_dom@v0.1.45/deno-dom-wasm.ts";
import type { AdapterResult, BatchResult, FetchParams, PriceQuote, Subject } from "./types.ts";
import { similarity } from "./types.ts";
import { etsBoard } from "./etstur.ts";
import { UNLOCKER_COST_USD } from "./unlocker.ts";
import { type Counter, domesticCall, parseTrPrice } from "./domesticHtml.ts";

const BASE = "https://www.jollytur.com";

async function resolve(s: Subject, c: Counter) {
  const t = await domesticCall(`${BASE}/Shared/Search?type=HotelPlanner&key=${encodeURIComponent(s.name)}`, {}, c);
  const list = JSON.parse(t) as any[];
  let best: any = null, score = 0;
  for (const it of list ?? []) {
    if (!it?.isDomestic || it?.typeName !== "Otel" || !it?.id) continue;
    let sc = similarity(s.name, String(it.value ?? ""));
    if (s.city && String(it.destinationBreadCrumb ?? "").toLocaleLowerCase("tr").includes(s.city.toLocaleLowerCase("tr"))) sc += 0.1;
    if (sc > score) { score = sc; best = it; }
  }
  if (!best || score < 0.5) return null;
  return { id: String(best.id), slug: String(best.adjustName ?? "").replace(/^\//, ""), name: String(best.value) };
}

export function parseJolly(html: string, nights: number): PriceQuote[] {
  const doc = new DOMParser().parseFromString(html, "text/html");
  if (!doc) return [];
  const out: PriceQuote[] = [];
  for (const card of Array.from(doc.querySelectorAll("div.product-info-inner")) as any[]) {
    const priceBox = card.parentElement?.querySelector?.(".price-info") ?? card.querySelector(".price-info");
    const scope = priceBox ?? card;
    const total = parseTrPrice(scope.querySelector(".current-price")?.textContent);
    if (!total) continue;
    const before = parseTrPrice(scope.querySelector(".old-price")?.textContent);
    const conceptEl = card.querySelector(".room-concept");
    const concept = conceptEl?.textContent?.trim() ?? "";
    const n = Number(scope.querySelector(".day-info")?.textContent?.match(/(\d+)\s*Gece/)?.[1]) || nights;
    const freeCancel = /Ücretsiz İptal/.test(card.textContent ?? "");
    out.push({
      source: "Jolly Tur", source_adapter: "jollytur",
      price_per_night: total / n, price_total: total, price_derived: true,
      board_type: etsBoard(null, concept),
      room_name: card.querySelector(".room-title")?.textContent?.trim() || null,
      refundable: freeCancel ? true : null,
      taxes_included: /Vergiler Dahil/i.test(scope.textContent ?? "") ? true : null,
      is_official: false, is_ad: false, num_guests: null,
      price_before_discount: before,
      raw: { concept, data_concept: conceptEl?.getAttribute?.("data-concept") ?? null, total, before },
    });
  }
  return out;
}

export function createJollyAdapter() {
  return {
    id: "jollytur" as const,
    async fetchMany(subjects: Subject[], p: FetchParams): Promise<BatchResult & { unlocker_calls: number }> {
      const results = new Map<string, AdapterResult>();
      const c: Counter = { calls: 0, unlocker: 0 };
      for (const s of subjects) {
        try {
          const match: Record<string, string> = {};
          let id = (s as any).jollytur_hotel_id as string | null;
          if (!id) {
            // Eşleştirme matcher.ts'te (arama + katı puanlama); burada tahmin yapılmaz.
            results.set(s.key, { status: "not_found", quotes: [] }); continue;
          }
          const body = new URLSearchParams({
            id, startDate: p.checkin, endDate: p.checkout, rooms: String(p.adults), originType: "Zone",
            hotelType: "Domestic", searchType: "Product", comingFromTp: "false",
          }).toString();
          const t = await domesticCall(`${BASE}/hotel/GetReservationCompletePartial`, {
            method: "POST", body, headers: { "Content-Type": "application/x-www-form-urlencoded" },
          }, c);
          const d = JSON.parse(t);
          const quotes = parseJolly(String(d?.html ?? ""), p.nights);
          results.set(s.key, { status: quotes.length ? "ok" : "no_prices", quotes, match: match as any });
        } catch (e) {
          console.error("jollytur adapter failed", s.name, e);
          results.set(s.key, { status: "error", quotes: [], error: String(e) });
        }
      }
      return { results, calls: c.calls, unlocker_calls: c.unlocker, cost_usd: c.unlocker * UNLOCKER_COST_USD };
    },
  };
}
