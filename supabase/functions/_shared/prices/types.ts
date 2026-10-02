// Ortak fiyat adapter sözleşmesi. Yeni kaynak (Jolly Tur, ETS, Tatilbudur…) eklemek için
// PriceAdapter arayüzünü uygulayan bir modül yazıp engine.ts'deki zincire eklemek yeterli.

export type BoardType =
  | "room_only"
  | "breakfast"
  | "half_board"
  | "full_board"
  | "all_inclusive"
  | "unknown";

export type AdapterId = "serpapi" | "booking" | "etstur";
export type Market = "international" | "domestic";

export type Subject = {
  key: string; // "own" | competitor id
  subject_type: "own" | "competitor";
  competitor_id: string | null;
  name: string;
  city: string | null;
  serpapi_property_token: string | null;
  booking_url: string | null;
  price_source_preference: string | null;
  price_source_checked_at: string | null;
  etstur_slug?: string | null;
  etstur_hotel_id?: string | null;
};

export type PriceQuote = {
  source: string;
  source_adapter: AdapterId;
  price_per_night: number;
  price_total: number;
  price_derived: boolean;
  board_type: BoardType;
  room_name: string | null;
  refundable: boolean | null;
  taxes_included: boolean | null;
  is_official: boolean;
  is_ad: boolean;
  num_guests: number | null;
  price_before_discount?: number | null;
  campaign_price?: number | null;
  campaign_label?: string | null;
  remaining_allotment?: number | null;
  cancellation_details?: unknown;
  raw: unknown;
};

export type MatchUpdate = {
  serpapi_property_token?: string;
  serpapi_matched_name?: string;
  booking_url?: string;
  booking_matched_name?: string;
};

export type AdapterResult = {
  /** ok: fiyat var · no_prices: mülk bulundu ama o tarihte fiyat yok · not_found: eşleşme yok · error */
  status: "ok" | "no_prices" | "not_found" | "error";
  quotes: PriceQuote[];
  match?: MatchUpdate;
  error?: string;
};

export type FetchParams = { checkin: string; checkout: string; nights: number; adults: number };

export type BatchResult = {
  results: Map<string, AdapterResult>;
  calls: number;
  cost_usd: number;
};

export interface PriceAdapter {
  id: AdapterId;
  /** Birden çok mülk için aynı tarihte fiyat getirir (toplu çalıştırma destekleyen kaynaklar tek istekte yapar). */
  fetchMany(subjects: Subject[], p: FetchParams): Promise<BatchResult>;
}

export function addDays(iso: string, n: number) {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

export function norm(s: string) {
  return s.toLowerCase().replace(/[^\p{L}\p{N}\s]/gu, " ").replace(/\s+/g, " ").trim();
}

/** Basit isim benzerliği: normalize edilmiş token kesişimi. */
export function similarity(a: string, b: string) {
  const ta = new Set(norm(a).split(" ").filter(Boolean));
  const tb = new Set(norm(b).split(" ").filter(Boolean));
  if (!ta.size || !tb.size) return 0;
  let hit = 0;
  for (const t of ta) if (tb.has(t)) hit++;
  return hit / Math.max(ta.size, tb.size);
}

/** Gecelik / toplam fiyatı ayrı ayrı normalize eder; eksik olanı gece sayısından türetir. */
export function splitPrice(
  perNight: number | null | undefined,
  total: number | null | undefined,
  nights: number,
): { price_per_night: number; price_total: number; price_derived: boolean } | null {
  const pn = typeof perNight === "number" && perNight > 0 ? perNight : null;
  const tt = typeof total === "number" && total > 0 ? total : null;
  if (pn && tt) return { price_per_night: pn, price_total: tt, price_derived: false };
  if (pn) return { price_per_night: pn, price_total: pn * nights, price_derived: true };
  if (tt) return { price_per_night: tt / nights, price_total: tt, price_derived: true };
  return null;
}
