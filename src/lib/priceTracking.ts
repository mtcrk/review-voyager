export type BoardType =
  | "room_only"
  | "breakfast"
  | "half_board"
  | "full_board"
  | "all_inclusive"
  | "unknown";

export const BOARD_LABELS: Record<BoardType, string> = {
  room_only: "Sadece oda",
  breakfast: "Oda kahvaltı",
  half_board: "Yarım pansiyon",
  full_board: "Tam pansiyon",
  all_inclusive: "Her şey dahil",
  unknown: "Belirsiz",
};

export type RoomTier = "standard" | "superior" | "deluxe" | "family" | "suite" | "villa" | "unknown";
export type TierFilter = "standard" | "all" | "superior" | "deluxe" | "suite";
export const TIER_LABELS: Record<RoomTier, string> = {
  standard: "Standart", superior: "Superior", deluxe: "Deluxe", family: "Aile", suite: "Suit", villa: "Villa", unknown: "Belirsiz",
};
export const TIER_FILTERS: { v: TierFilter; label: string }[] = [
  { v: "standard", label: "Standart" }, { v: "all", label: "Tümü (en ucuz müsait)" },
  { v: "superior", label: "Superior" }, { v: "deluxe", label: "Deluxe" }, { v: "suite", label: "Suit" },
];

export const COMPARABLE_BOARDS: BoardType[] = ["room_only", "breakfast", "half_board", "full_board", "all_inclusive"];

export const ADAPTER_LABELS: Record<string, string> = {
  serpapi: "Google Hotels",
  booking: "Booking.com",
  etstur: "ETS Tur",
  jollytur: "Jolly Tur",
  tatilsepeti: "Tatil Sepeti",
  manual: "Otel tarafından girildi",
  none: "Kaynak yok",
};

/** CSV / serbest metin → pansiyon tipi */
export function parseBoard(input: string): BoardType | null {
  const t = input.trim().toLocaleLowerCase("tr").replace(/[_-]/g, " ");
  if (!t) return null;
  if (/(all inclusive|her ?ş?s?ey dahil|ai|uai|ultra)/.test(t)) return "all_inclusive";
  if (/(full board|tam pansiyon|fb)$/.test(t) || t === "tp") return "full_board";
  if (/(half board|yar[ıi]m pansiyon|hb)$/.test(t) || t === "yp") return "half_board";
  if (/(room only|sadece oda|ro)$/.test(t)) return "room_only";
  if (/(breakfast|kahvalt|bb|b&b)/.test(t)) return "breakfast";
  if ((COMPARABLE_BOARDS as string[]).includes(t.replace(/ /g, "_"))) return t.replace(/ /g, "_") as BoardType;
  return null;
}

export type Snapshot = {
  id: string;
  competitor_id: string | null;
  subject_type: "own" | "competitor";
  checkin: string;
  adults: number;
  source: string;
  source_adapter: string;
  price_per_night: number | null;
  price_total: number | null;
  price_derived: boolean;
  board_type: BoardType;
  room_name: string | null;
  refundable: boolean | null;
  taxes_included: boolean | null;
  no_availability: boolean;
  fetched_at: string;
  /** raw.reason: "min_stay" | "not_on_sale" | null */
  reason?: string | null;
  min_stay?: string | number | null;
  min_stay_nights?: number | null;
  room_tier?: RoomTier | null;
};

export type OwnRate = {
  id: string;
  date: string;
  board_type: BoardType;
  room_name: string | null;
  price_per_night: number;
  refundable: boolean | null;
  note: string | null;
};

export type Cell =
  | { kind: "none" }
  | { kind: "sold_out"; fetchedAt: string; source: string; label: string; details: string[]; refs?: RefPrice[] }
  | {
      /** Pansiyon uyuyor ama seçili oda kategorisi yok: kıyasa/medyana girmez. */
      kind: "no_tier";
      fetchedAt: string;
      tier: TierFilter;
      cheapest: { value: number; roomName: string | null; tier: RoomTier; source: string };
      rows: Snapshot[];
      refs?: RefPrice[];
    }
  | { kind: "incomparable"; fetchedAt: string; reason: string; rows: Snapshot[]; refs?: RefPrice[] }
  | {
      kind: "value";
      value: number;
      badge: "manual" | "estimated";
      source: string;
      adapter: string;
      fetchedAt: string | null;
      board: BoardType;
      roomName: string | null;
      refundable: boolean | null;
      taxesIncluded: boolean | null;
      prev?: number;
      changePct?: number;
      /** Fiyat kaynağın min. konaklama şartı nedeniyle bu kadar gecelik sorguyla alındı. */
      minStay?: number | null;
      refs?: RefPrice[];
      tier?: RoomTier | null;
      /** Aynı çekim turundaki tüm odalar (detay listesi için). */
      rows?: Snapshot[];
    };

/** Pansiyon tipi belirtilmemiş fiyatlar: kıyasa girmez, yalnızca referans olarak gösterilir. */
export type RefPrice = { source: string; price: number };

function unknownBoardRefs(rows: Snapshot[]): RefPrice[] {
  const m = new Map<string, number>();
  for (const r of rows) {
    if (r.no_availability || r.board_type !== "unknown" || !r.price_per_night) continue;
    const v = Number(r.price_per_night);
    if (!m.has(r.source) || v < m.get(r.source)!) m.set(r.source, v);
  }
  return Array.from(m, ([source, price]) => ({ source, price }));
}

export const subjectKey = (s: { subject_type: string; competitor_id: string | null }) =>
  s.subject_type === "own" ? "own" : (s.competitor_id as string);

/** subject|date → fetched_at'e göre azalan sıralı batch listesi */
export function groupBatches(rows: Snapshot[]) {
  const map = new Map<string, Map<string, Snapshot[]>>();
  for (const r of rows) {
    const k = `${subjectKey(r)}|${r.checkin}`;
    let m = map.get(k);
    if (!m) map.set(k, (m = new Map()));
    const arr = m.get(r.fetched_at) ?? [];
    arr.push(r);
    m.set(r.fetched_at, arr);
  }
  const out = new Map<string, Snapshot[][]>();
  map.forEach((m, k) => {
    out.set(
      k,
      Array.from(m.entries())
        .sort((a, b) => (a[0] < b[0] ? 1 : -1))
        .map(([, v]) => v),
    );
  });
  return out;
}

const tierOk = (r: Snapshot, tier: TierFilter) => tier === "all" || (r.room_tier ?? "unknown") === tier;

function cheapest(rows: Snapshot[], board: BoardType, tier: TierFilter = "all") {
  let best: Snapshot | null = null;
  for (const r of rows) {
    if (r.no_availability || r.board_type !== board || !r.price_per_night || !tierOk(r, tier)) continue;
    if (!best || Number(r.price_per_night) < Number(best.price_per_night)) best = r;
  }
  return best;
}

function incomparableReason(rows: Snapshot[]) {
  const boards = new Set(rows.filter((r) => !r.no_availability).map((r) => r.board_type));
  if (boards.size === 1 && boards.has("unknown")) return "Pansiyon tipi belirlenemedi (kaynak belirtmiyor)";
  const known = Array.from(boards).filter((b) => b !== "unknown");
  if (known.length === 1 && known[0] === "room_only") return "Yalnızca oda fiyatı bulundu";
  return `Yalnızca ${known.map((b) => BOARD_LABELS[b as BoardType].toLocaleLowerCase("tr")).join(", ")} fiyatı bulundu`;
}

export function computeCell(batches: Snapshot[][] | undefined, board: BoardType, manual?: OwnRate[], tier: TierFilter = "standard"): Cell {
  const manualBest = (manual ?? [])
    .filter((m) => m.board_type === board)
    .sort((a, b) => a.price_per_night - b.price_per_night)[0];
  if (manualBest) {
    return {
      kind: "value",
      value: Number(manualBest.price_per_night),
      badge: "manual",
      source: "Otel tarafından girildi",
      adapter: "manual",
      fetchedAt: null,
      board,
      roomName: manualBest.room_name,
      refundable: manualBest.refundable,
      taxesIncluded: null,
    };
  }
  if (!batches?.length) return { kind: "none" };
  // Aynı çekim turunda kaynaklar ayrı anlarda yazılır (ör. Google hemen, Booking sonra) — 15 dk içindekiler tek tur sayılır.
  const fetchedAt = batches[0][0].fetched_at;
  const t0 = new Date(fetchedAt).getTime();
  let used = 0;
  const latest: Snapshot[] = [];
  for (const b of batches) {
    if (t0 - new Date(b[0].fetched_at).getTime() > 15 * 60_000) break;
    latest.push(...b); used++;
  }
  const refs = unknownBoardRefs(latest);
  const priced = latest.filter((r) => !r.no_availability && r.price_per_night);
  if (!priced.length) {
    // "muhtemelen dolu" yalnızca hiçbir kaynak min. konaklama / satış kapalı bilgisi vermediyse.
    const details = latest.map((r) =>
      r.reason === "min_stay" && r.min_stay
        ? `${r.source}: en az ${r.min_stay} gece konaklama şartı`
        : r.reason === "not_on_sale"
        ? `${r.source}'de bu tarihte satışta değil`
        : `${r.source}: fiyat vermedi`,
    );
    const ms = latest.filter((r) => r.reason === "min_stay" && r.min_stay).map((r) => Number(r.min_stay));
    const nos = latest.filter((r) => r.reason === "not_on_sale");
    const label = ms.length
      ? `en az ${Math.min(...ms)} gece`
      : nos.length === latest.length
      ? "satışta değil"
      : nos.length
      ? `${nos.map((r) => r.source).join(", ")}'de satışta değil`
      : "dolu";
    return { kind: "sold_out", fetchedAt, source: latest[0].source, label, details };
  }
  const anyBoard = cheapest(latest, board, "all");
  if (!anyBoard) return { kind: "incomparable", fetchedAt, reason: incomparableReason(latest), rows: latest, refs };
  const best = cheapest(latest, board, tier);
  if (!best) {
    return {
      kind: "no_tier", fetchedAt, tier, rows: latest, refs,
      cheapest: { value: Number(anyBoard.price_per_night), roomName: anyBoard.room_name, tier: (anyBoard.room_tier ?? "unknown") as RoomTier, source: anyBoard.source },
    };
  }
  let prev: number | undefined;
  for (const b of batches.slice(used)) {
    const p = cheapest(b, board, tier);
    if (p) { prev = Number(p.price_per_night); break; }
  }
  const value = Number(best.price_per_night);
  return {
    kind: "value",
    value,
    badge: "estimated",
    source: best.source,
    adapter: best.source_adapter,
    fetchedAt,
    board,
    roomName: best.room_name,
    refundable: best.refundable,
    taxesIncluded: best.taxes_included,
    minStay: best.min_stay_nights ?? null,
    refs,
    tier: best.room_tier ?? null,
    rows: latest,
    prev,
    changePct: prev ? ((value - prev) / prev) * 100 : undefined,
  };
}

export function median(nums: number[]) {
  if (!nums.length) return null;
  const s = [...nums].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}

export const fmtTry = (n: number) =>
  new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY", maximumFractionDigits: 0 }).format(n);

export function isoDay(offset: number) {
  const d = new Date(Date.now() + 3 * 3600_000 + offset * 86400_000);
  return d.toISOString().slice(0, 10);
}
