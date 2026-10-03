// Oda kategorisi sınıflandırması (TR + EN). Kıyas standardı: aynı pansiyon + standart kategori.
// Kategori kelimesi olmayan oda adlarında ("Jade Room", "Double Room") aynı mülk+kaynak+çekimdeki
// en ucuz isimsiz oda grubu 'standard' sayılır — ancak o grupta açıkça standart oda yoksa.
export type RoomTier = "standard" | "superior" | "deluxe" | "family" | "suite" | "villa" | "unknown";

const f = (s: string) =>
  s.replace(/[İI]/g, "i").toLowerCase()
    .replace(/ı/g, "i").replace(/ş/g, "s").replace(/ğ/g, "g").replace(/ü/g, "u").replace(/ö/g, "o").replace(/ç/g, "c");

export function classifyRoom(name: string | null | undefined): RoomTier {
  const t = f(String(name ?? ""));
  if (!t.trim()) return "unknown";
  if (/(villa|bungalo|residence|rezidans|mustakil)/.test(t)) return "villa";
  if (/(suit|suite)/.test(t)) return "suite";
  if (/(aile|family|connect|baglant|interconnect)/.test(t)) return "family";
  if (/superior|superyor/.test(t)) return "superior";
  if (/(standar|ekonomi|economy|classic|klasik|iki kisilik|basic)/.test(t)) return "standard";
  if (/(deluxe|delux|premium|club|kulup|luxury|lux|executive)/.test(t)) return "deluxe";
  return "unknown";
}

/** Bir grup (mülk × kaynak × çekim) içindeki odalara kategori atar; en ucuz isimsiz grubu standart sayar. */
export function assignTiers<T extends { room_name?: string | null; price_per_night?: number | null; room_tier?: string | null }>(rows: T[]): T[] {
  for (const r of rows) r.room_tier = classifyRoom(r.room_name);
  if (rows.some((r) => r.room_tier === "standard")) return rows;
  let best: T | null = null;
  for (const r of rows) {
    if (r.room_tier !== "unknown" || !r.room_name || !(Number(r.price_per_night) > 0)) continue;
    if (!best || Number(r.price_per_night) < Number(best.price_per_night)) best = r;
  }
  if (best) {
    // Kategorisiz en ucuz oda, kategori sahibi en ucuz odadan da ucuzsa standart sayılır.
    const cheapestTiered = Math.min(...rows.filter((r) => r.room_tier !== "unknown" && Number(r.price_per_night) > 0).map((r) => Number(r.price_per_night)));
    if (!(Number(best.price_per_night) > cheapestTiered)) {
      for (const r of rows) if (r.room_tier === "unknown" && r.room_name === best.room_name) r.room_tier = "standard";
    }
  }
  return rows;
}

export const hasStandard = (rows: { room_name?: string | null; price_per_night?: number | null }[]) =>
  assignTiers(rows.map((r) => ({ room_name: r.room_name, price_per_night: r.price_per_night, room_tier: null as string | null }))).some((r) => r.room_tier === "standard");
