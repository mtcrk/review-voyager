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
  | { kind: "sold_out"; fetchedAt: string; source: string }
  | { kind: "incomparable"; fetchedAt: string; reason: string; rows: Snapshot[] }
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
    };

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

function cheapest(rows: Snapshot[], board: BoardType) {
  let best: Snapshot | null = null;
  for (const r of rows) {
    if (r.no_availability || r.board_type !== board || !r.price_per_night) continue;
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

export function computeCell(batches: Snapshot[][] | undefined, board: BoardType, manual?: OwnRate[]): Cell {
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
  const latest = batches[0];
  const fetchedAt = latest[0].fetched_at;
  const priced = latest.filter((r) => !r.no_availability && r.price_per_night);
  if (!priced.length) return { kind: "sold_out", fetchedAt, source: latest[0].source };
  const best = cheapest(latest, board);
  if (!best) return { kind: "incomparable", fetchedAt, reason: incomparableReason(latest), rows: latest };
  let prev: number | undefined;
  for (const b of batches.slice(1)) {
    const p = cheapest(b, board);
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
