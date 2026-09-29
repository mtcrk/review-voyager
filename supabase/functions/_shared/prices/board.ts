import type { BoardType } from "./types.ts";

/**
 * Oda adı / rate açıklaması / meal plan metinlerinden pansiyon tipini çıkarır (TR + EN).
 * Emin olunamıyorsa "unknown" döner — yanlış kıyas yapmaktansa kıyaslamamak tercih edilir.
 */
export function detectBoard(...texts: Array<string | null | undefined>): BoardType {
  const t = texts
    .filter((x): x is string => typeof x === "string" && x.length > 0)
    .join(" | ")
    .toLocaleLowerCase("tr");
  if (!t) return "unknown";

  if (/(ultra\s*)?(all[\s-]*inclusive|her\s*ş?s?ey\s*dahil|herşey\s*dahil|hersey\s*dahil)/.test(t)) {
    return "all_inclusive";
  }
  if (/(full\s*board|tam\s*pansiyon|all\s*meals\s*included)/.test(t)) return "full_board";
  if (/(half\s*board|yar[ıi]m\s*pansiyon|breakfast\s*(&|and|\+)\s*dinner|kahvalt[ıi]\s*(ve|&|\+)\s*ak[şs]am)/.test(t)) {
    return "half_board";
  }
  if (
    /(room\s*only|sadece\s*oda|yaln[ıi]zca\s*oda|no\s*meals|kahvalt[ıi]\s*hari[çc]|breakfast\s*not\s*included|breakfast\s*(costs|for)?\s*(tl|try|₺|€|\$|\d))/.test(t)
  ) {
    return "room_only";
  }
  if (/(breakfast\s*included|free\s*breakfast|bed\s*(&|and)\s*breakfast|\bb&b\b|oda\s*kahvalt[ıi]|kahvalt[ıi]\s*dahil|breakfast)/.test(t)) {
    return "breakfast";
  }
  return "unknown";
}
