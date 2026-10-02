import { detectBoard } from "./board.ts";
import type { AdapterResult, BatchResult, FetchParams, PriceAdapter, PriceQuote, Subject } from "./types.ts";
import { similarity } from "./types.ts";

// Apify actor: voyager/booking-scraper
// Input: search | startUrls[{url}], checkIn, checkOut (YYYY-MM-DD), adults, rooms, currency, language, maxItems
// Output item: { name, url, price (konaklama toplamı), currency, address{city}, rooms[{ roomType, persons,
//   options[{ price, displayedPrice, excludedTaxesPrice, persons, freeCancellation, cancellationType, yourChoices[] }] }] }
const ACTOR = "voyager~booking-scraper";
// Apify sonuç başı tahmini maliyet (compute + proxy). Tahmini değer.
const COST_PER_ITEM_USD = 0.005;

export function cleanBookingUrl(url: string) {
  try {
    const u = new URL(url);
    return `${u.origin}${u.pathname}`.replace(/\.[a-z]{2}(-[a-z]{2})?\.html$/i, ".html");
  } catch {
    return url;
  }
}

function slugOf(url: string) {
  const m = cleanBookingUrl(url).match(/\/hotel\/[a-z]{2}\/([^./]+)/i);
  return m ? m[1].toLowerCase() : cleanBookingUrl(url).toLowerCase();
}

function datedUrl(url: string, p: FetchParams) {
  const u = new URL(cleanBookingUrl(url));
  u.searchParams.set("checkin", p.checkin);
  u.searchParams.set("checkout", p.checkout);
  u.searchParams.set("group_adults", String(p.adults));
  u.searchParams.set("no_rooms", "1");
  u.searchParams.set("group_children", "0");
  u.searchParams.set("selected_currency", "TRY");
  return u.toString();
}

function quotesFromItem(item: any, p: FetchParams): PriceQuote[] {
  const out: PriceQuote[] = [];
  const rooms: any[] = Array.isArray(item?.rooms) ? item.rooms : [];
  // Oda + pansiyon tipi başına en ucuz opsiyonu tut.
  const best = new Map<string, PriceQuote>();
  for (const room of rooms) {
    if (room?.available === false) continue;
    for (const opt of room?.options ?? []) {
      const persons = typeof opt?.persons === "number" ? opt.persons : room?.persons;
      if (typeof persons === "number" && persons < p.adults) continue;
      const total = Number(opt?.price);
      if (!(total > 0)) continue;
      const choices: string[] = Array.isArray(opt?.yourChoices) ? opt.yourChoices : [];
      const board = detectBoard(room?.roomType, ...choices, opt?.mealPlan, item?.breakfast);
      const q: PriceQuote = {
        source: "Booking.com",
        source_adapter: "booking",
        price_total: total,
        price_per_night: total / p.nights,
        price_derived: true,
        board_type: board,
        room_name: room?.roomType ? String(room.roomType) : null,
        refundable:
          typeof opt?.freeCancellation === "boolean"
            ? opt.freeCancellation
            : opt?.cancellationType === "non_refundable"
            ? false
            : null,
        // price = displayedPrice + excludedTaxesPrice → vergiler dahil
        taxes_included: typeof opt?.excludedTaxesPrice === "number" ? true : null,
        is_official: false,
        is_ad: false,
        num_guests: typeof persons === "number" ? persons : null,
        raw: { room: room?.roomType, option: opt },
      };
      const k = `${q.room_name}|${board}`;
      const prev = best.get(k);
      if (!prev || q.price_total < prev.price_total) best.set(k, q);
    }
  }
  out.push(...best.values());
  return out;
}

async function runActor(token: string, input: Record<string, unknown>, timeoutSec = 150): Promise<any[]> {
  const res = await fetch(
    `https://api.apify.com/v2/acts/${ACTOR}/run-sync-get-dataset-items?token=${token}&timeout=${timeoutSec}`,
    { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(input), signal: AbortSignal.timeout((timeoutSec + 5) * 1000) },
  );
  if (!res.ok) throw new Error(`Apify ${res.status}: ${(await res.text()).slice(0, 300)}`);
  const data = await res.json();
  return Array.isArray(data) ? data : [];
}

export function createBookingAdapter(apifyToken: string): PriceAdapter {
  return {
    id: "booking",
    async fetchMany(subjects: Subject[], p: FetchParams): Promise<BatchResult> {
      const results = new Map<string, AdapterResult>();
      let calls = 0;
      let items = 0;
      const common = {
        checkIn: p.checkin,
        checkOut: p.checkout,
        adults: p.adults,
        rooms: 1,
        children: 0,
        currency: "TRY",
        language: "en-gb",
      };

      // 1) URL'si bilinenler: tek actor run'ında toplu.
      const withUrl = subjects.filter((s) => s.booking_url);
      if (withUrl.length) {
        try {
          calls++;
          const data = await runActor(apifyToken, {
            ...common,
            startUrls: withUrl.map((s) => ({ url: datedUrl(s.booking_url!, p) })),
            maxItems: withUrl.length,
          }, p.timeoutSec ?? 150);
          items += data.length;
          const bySlug = new Map<string, any>();
          for (const it of data) if (it?.url) bySlug.set(slugOf(String(it.url)), it);
          for (const s of withUrl) {
            const it = bySlug.get(slugOf(s.booking_url!));
            if (!it) {
              results.set(s.key, { status: "no_prices", quotes: [] });
              continue;
            }
            const quotes = quotesFromItem(it, p);
            results.set(s.key, { status: quotes.length ? "ok" : "no_prices", quotes });
          }
        } catch (e) {
          console.error("booking batch failed", e);
          for (const s of withUrl) results.set(s.key, { status: "error", quotes: [], error: String(e) });
        }
      }

      // 2) URL'si olmayanlar: isim + şehir ile ara, isim benzerliğiyle eşleştir.
      for (const s of subjects.filter((x) => !x.booking_url)) {
        results.set(s.key, { status: "not_found", quotes: [] });
      }

      return { results, calls, cost_usd: Math.max(items, calls) * COST_PER_ITEM_USD };
    },
  };
}
