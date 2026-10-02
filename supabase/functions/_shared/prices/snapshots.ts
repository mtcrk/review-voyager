// competitor_price_snapshots için tek satır biçimi ve dayanıklı toplu yazım.
// Toplu insert'te satırların anahtar kümesi farklıysa PostgREST eksik kolonu NULL gönderir
// (default'u kullanmaz) → NOT NULL ihlali tüm batch'i düşürür. Bu yüzden her satır aynı
// anahtar kümesiyle, tüm kolonları açıkça dolu olarak üretilir.
const BOARDS = new Set(["room_only", "breakfast", "half_board", "full_board", "all_inclusive", "unknown"]);
const ADAPTERS = new Set(["serpapi", "booking", "manual", "etstur", "jollytur", "tatilsepeti"]);

const num = (v: unknown) => (typeof v === "number" && Number.isFinite(v) ? v : null);
const bool = (v: unknown) => (typeof v === "boolean" ? v : null);
const int = (v: unknown) => (typeof v === "number" && Number.isFinite(v) ? Math.round(v) : null);
const str = (v: unknown) => (typeof v === "string" && v.length ? v : null);

export type SnapshotInput = {
  business_id: string;
  competitor_id: string | null;
  subject_type: "own" | "competitor";
  checkin: string;
  nights: number;
  adults: number;
  source: string;
  source_adapter: string;
  market?: "international" | "domestic";
  currency?: string;
  fetched_at?: string;
  price_per_night?: number | null;
  price_total?: number | null;
  price_derived?: boolean | null;
  board_type?: string | null;
  room_name?: string | null;
  refundable?: boolean | null;
  taxes_included?: boolean | null;
  is_official?: boolean | null;
  is_ad?: boolean | null;
  num_guests?: number | null;
  no_availability?: boolean | null;
  raw?: unknown;
  price_before_discount?: number | null;
  campaign_price?: number | null;
  campaign_label?: string | null;
  remaining_allotment?: number | null;
  cancellation_details?: unknown;
  /** Kaynağın min. konaklama şartı nedeniyle fiyatın alındığı gece sayısı (seçilenden büyükse). */
  min_stay_nights?: number | null;
  queried_nights?: number | null;
};

export function toSnapshotRow(i: SnapshotInput) {
  const ppn = num(i.price_per_night);
  const board = i.board_type && BOARDS.has(i.board_type) ? i.board_type : "unknown";
  const adapter = ADAPTERS.has(i.source_adapter) ? i.source_adapter : "manual";
  const refundable = bool(i.refundable);
  return {
    business_id: i.business_id,
    competitor_id: i.subject_type === "own" ? null : i.competitor_id,
    subject_type: i.subject_type,
    checkin: i.checkin,
    nights: int(i.nights) ?? 1,
    min_stay_nights: int(i.min_stay_nights),
    queried_nights: int(i.queried_nights) ?? int(i.nights) ?? 1,
    adults: int(i.adults) ?? 2,
    source: i.source || adapter,
    source_adapter: adapter,
    market: i.market === "domestic" ? "domestic" : "international",
    currency: i.currency || "TRY",
    fetched_at: i.fetched_at ?? new Date().toISOString(),
    price: ppn, // geriye uyum: price = gecelik
    price_per_night: ppn,
    price_total: num(i.price_total),
    price_derived: i.price_derived === true,
    board_type: board,
    room_name: str(i.room_name),
    refundable,
    free_cancellation: refundable,
    taxes_included: bool(i.taxes_included),
    is_official: i.is_official === true,
    is_ad: i.is_ad === true,
    num_guests: int(i.num_guests),
    no_availability: i.no_availability === true || ppn === null,
    raw: i.raw && typeof i.raw === "object" ? i.raw : {},
    price_before_discount: num(i.price_before_discount),
    campaign_price: num(i.campaign_price),
    campaign_label: str(i.campaign_label),
    remaining_allotment: int(i.remaining_allotment),
    cancellation_details: i.cancellation_details ?? null,
  };
}

/** Toplu yazar; batch reddedilirse satır satır dener. Kaydedilen sayıyı ve hataları döndürür. */
export async function insertSnapshots(admin: any, inputs: SnapshotInput[], label: string) {
  const rows = inputs.map(toSnapshotRow);
  const errors: string[] = [];
  if (!rows.length) return { saved: 0, errors };
  const { error } = await admin.from("competitor_price_snapshots").insert(rows, { defaultToNull: false });
  if (!error) return { saved: rows.length, errors };
  console.error(`${label} batch insert failed, retrying row by row`, error);
  let saved = 0;
  const seen = new Set<string>();
  for (const r of rows) {
    const { error: e } = await admin.from("competitor_price_snapshots").insert(r, { defaultToNull: false });
    if (!e) { saved++; continue; }
    console.error(`${label} row insert failed`, e.message, JSON.stringify({ ...r, raw: undefined }).slice(0, 500));
    if (!seen.has(e.message)) { seen.add(e.message); errors.push(`${label}: ${e.message}`); }
  }
  return { saved, errors };
}
