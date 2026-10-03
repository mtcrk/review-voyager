// Kalıcı "giriş odası" (mülk × kaynak): room_tier='standard' bu oda adına göre atanır.
// Her çekimde "o günkü en ucuz oda" seçilmez — standart oda doluysa Suite'e kayma hatasını önler.
import { classifyRoom } from "./roomTier.ts";

export const baseKey = (subjectType: string, competitorId: string | null, adapter: string) =>
  `${subjectType}|${subjectType === "own" ? "" : competitorId ?? ""}|${adapter}`;

export async function loadBaseRooms(admin: any, businessId: string): Promise<Map<string, string>> {
  const { data } = await admin.from("price_base_rooms").select("subject_type, competitor_id, source_adapter, room_name").eq("business_id", businessId);
  const m = new Map<string, string>();
  for (const r of data ?? []) m.set(baseKey(r.subject_type, r.competitor_id, r.source_adapter), r.room_name);
  return m;
}

const median = (a: number[]) => { const s = [...a].sort((x, y) => x - y); const n = s.length; return n % 2 ? s[(n - 1) / 2] : (s[n / 2 - 1] + s[n / 2]) / 2; };
const EXCLUDED = new Set(["villa", "suite", "family"]);

type Seen = { dates: Set<string>; prices: number[]; fetches: Set<string> };

/** Son 30 günün oda adlarından otomatik giriş odasını seçer. Veri azsa null (geçici gruplama kuralı kalır). */
export function pickBaseRoom(rooms: Map<string, Seen>): string | null {
  const list = [...rooms.entries()].map(([name, s]) => ({ name, tier: classifyRoom(name), dates: s.dates.size, fetches: s.fetches.size, med: median(s.prices) }));
  const std = list.filter((r) => r.tier === "standard" && r.dates >= 3);
  if (std.length) return std.sort((a, b) => b.fetches - a.fetches || a.med - b.med)[0].name;
  const cand = list.filter((r) => !EXCLUDED.has(r.tier) && r.dates >= 3);
  if (!cand.length) return null;
  const maxF = Math.max(...cand.map((r) => r.fetches));
  return cand.filter((r) => r.fetches >= maxF * 0.5).sort((a, b) => a.med - b.med)[0].name;
}

/** Bir mülk+kaynağın tüm snapshot'larında room_tier'ı giriş odasına göre yeniden yazar. */
export async function applyBaseRoom(admin: any, businessId: string, subjectType: string, competitorId: string | null, adapter: string, base: string | null) {
  const scope = (q: any) => {
    q = q.eq("business_id", businessId).eq("subject_type", subjectType).eq("source_adapter", adapter);
    return subjectType === "own" ? q.is("competitor_id", null) : q.eq("competitor_id", competitorId);
  };
  if (!base) return;
  await scope(admin.from("competitor_price_snapshots").update({ room_tier: "standard" })).eq("room_name", base).neq("room_tier", "standard");
  // Önceki geçici kuralla 'standard' yapılmış ama adı standart olmayan diğer odalar asıl kategorisine döner.
  const { data } = await scope(admin.from("competitor_price_snapshots").select("room_name")).eq("room_tier", "standard").neq("room_name", base).limit(5000);
  const names = [...new Set((data ?? []).map((r: any) => r.room_name).filter(Boolean))] as string[];
  for (const n of names) {
    const t = classifyRoom(n);
    if (t !== "standard") await scope(admin.from("competitor_price_snapshots").update({ room_tier: t })).eq("room_name", n);
  }
}

/** Son 30 gün verisinden otomatik giriş odalarını günceller; 'manual' kayıtlara dokunmaz. */
export async function refreshBaseRooms(admin: any, businessId: string) {
  const since = new Date(Date.now() - 30 * 86400_000).toISOString();
  const groups = new Map<string, { st: string; cid: string | null; ad: string; rooms: Map<string, Seen> }>();
  for (let from = 0; from < 50000; from += 1000) {
    const { data, error } = await admin.from("competitor_price_snapshots")
      .select("subject_type, competitor_id, source_adapter, room_name, checkin, fetched_at, price_per_night")
      .eq("business_id", businessId).gte("fetched_at", since).not("room_name", "is", null).not("price_per_night", "is", null)
      .neq("source_adapter", "manual").order("id").range(from, from + 999);
    if (error) throw error;
    for (const r of data ?? []) {
      const k = baseKey(r.subject_type, r.competitor_id, r.source_adapter);
      const g = groups.get(k) ?? { st: r.subject_type, cid: r.subject_type === "own" ? null : r.competitor_id, ad: r.source_adapter, rooms: new Map() };
      groups.set(k, g);
      const s = g.rooms.get(r.room_name) ?? { dates: new Set(), prices: [], fetches: new Set() };
      g.rooms.set(r.room_name, s);
      s.dates.add(r.checkin); s.fetches.add(`${r.checkin}|${r.fetched_at}`); s.prices.push(Number(r.price_per_night));
    }
    if (!data || data.length < 1000) break;
  }
  const { data: existing } = await admin.from("price_base_rooms").select("id, subject_type, competitor_id, source_adapter, room_name, determined_by").eq("business_id", businessId);
  const ex = new Map<string, any>((existing ?? []).map((r: any) => [baseKey(r.subject_type, r.competitor_id, r.source_adapter), r]));
  const changed: string[] = [];
  for (const [k, g] of groups) {
    const cur = ex.get(k);
    if (cur?.determined_by === "manual") continue;
    const pick = pickBaseRoom(g.rooms);
    if (!pick || cur?.room_name === pick) continue;
    if (cur) await admin.from("price_base_rooms").update({ room_name: pick, determined_by: "auto" }).eq("id", cur.id);
    else await admin.from("price_base_rooms").insert({ business_id: businessId, subject_type: g.st, competitor_id: g.cid, source_adapter: g.ad, room_name: pick, determined_by: "auto" });
    await applyBaseRoom(admin, businessId, g.st, g.cid, g.ad, pick);
    changed.push(`${k}=${pick}`);
  }
  return changed;
}
