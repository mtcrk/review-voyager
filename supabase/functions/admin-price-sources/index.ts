// Fiyat kaynakları yönetimi (yalnız platform yöneticisi). GET: liste + son 24 saat sağlık; POST: { adapter, enabled?, note? }.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { isPlatformAdmin } from "../_shared/platformAdmin.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};
const json = (b: unknown, status = 200) => new Response(JSON.stringify(b), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
const ADAPTERS = ["etstur", "jollytur", "tatilsepeti", "booking", "serpapi"];

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  const auth = req.headers.get("Authorization");
  if (!auth) return json({ error: "No auth" }, 401);
  const url = Deno.env.get("SUPABASE_URL")!;
  const user = createClient(url, Deno.env.get("SUPABASE_ANON_KEY")!, { global: { headers: { Authorization: auth } } });
  const { data: u, error: ue } = await user.auth.getUser();
  if (ue || !u.user) return json({ error: "Invalid token" }, 401);
  if (!isPlatformAdmin(u.user.email)) return json({ error: "Forbidden" }, 403);
  const admin = createClient(url, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

  try {
    if (req.method === "POST") {
      const b = await req.json().catch(() => ({}));
      if (!ADAPTERS.includes(b?.adapter)) return json({ error: "Geçersiz kaynak" }, 400);
      const patch: Record<string, unknown> = {};
      if (typeof b.enabled === "boolean") patch.enabled = b.enabled;
      if (typeof b.note === "string") patch.note = b.note.slice(0, 500) || null;
      if (!Object.keys(patch).length) return json({ error: "Değişiklik yok" }, 400);
      const { error } = await admin.from("price_source_settings").upsert({ adapter: b.adapter, ...patch });
      if (error) throw error;
      return json({ ok: true });
    }
    const since = new Date(Date.now() - 86400_000).toISOString();
    const [{ data: settings }, { data: logs }, { data: last }] = await Promise.all([
      admin.from("price_source_settings").select("adapter, enabled, note, updated_at"),
      admin.from("price_fetch_log").select("adapter, ok_count, no_prices_count, error_count, calls, estimated_cost_usd").gte("created_at", since).in("adapter", ADAPTERS).limit(10000),
      admin.from("price_fetch_log").select("adapter, created_at").in("adapter", ADAPTERS).order("created_at", { ascending: false }).limit(500),
    ]);
    const sources = ADAPTERS.map((a) => {
      const s = (settings ?? []).find((r: any) => r.adapter === a);
      const l = (logs ?? []).filter((r: any) => r.adapter === a);
      const sum = (k: string) => l.reduce((t: number, r: any) => t + Number(r[k] ?? 0), 0);
      return {
        adapter: a, enabled: s?.enabled ?? true, note: s?.note ?? null, updated_at: s?.updated_at ?? null,
        ok: sum("ok_count"), no_prices: sum("no_prices_count"), error: sum("error_count"),
        calls: sum("calls"), cost_usd: Number(sum("estimated_cost_usd").toFixed(4)),
        last_call_at: (last ?? []).find((r: any) => r.adapter === a)?.created_at ?? null,
      };
    });
    return json({ sources });
  } catch (e) {
    console.error("admin-price-sources failed", e);
    return json({ error: e instanceof Error ? e.message : String(e) }, 500);
  }
});
