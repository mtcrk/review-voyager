// Otel eşleştirme (fiyat çekmeden). Kullanıcı: işletmeye erişimi olan oturum. Servis: service role ile
// (bir kerelik toplu çalıştırma). Body: { business_id, subject?: "own" | competitor_id, force?, sources? }
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { MATCH_COLS, matchRow, SOURCES, type SourceId } from "../_shared/prices/matcher.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const url = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const admin: any = createClient(url, serviceKey);
    const auth = req.headers.get("Authorization") ?? "";
    const isService = auth === `Bearer ${serviceKey}`;

    let body: any = {};
    try { body = await req.json(); } catch {}
    const business_id = String(body?.business_id ?? "");
    if (!/^[0-9a-f-]{36}$/i.test(business_id)) return json({ error: "business_id gerekli" }, 400);

    if (!isService) {
      const userClient = createClient(url, Deno.env.get("SUPABASE_ANON_KEY")!, { global: { headers: { Authorization: auth } } });
      const { data: { user } } = await userClient.auth.getUser();
      if (!user) return json({ error: "Oturum doğrulanamadı" }, 401);
      const { data: can } = await admin.rpc("user_can_access_business", { _user_id: user.id, _business_id: business_id });
      if (!can) return json({ error: "Bu işletmeye erişiminiz yok" }, 403);
    }

    const force = body?.force === true;
    const sources: SourceId[] | undefined = Array.isArray(body?.sources) ? body.sources.filter((s: string) => SOURCES.includes(s as SourceId)) : undefined;
    const subject: string | undefined = typeof body?.subject === "string" ? body.subject : undefined;

    const targets: { table: string; id: string; row: any }[] = [];
    if (!subject || subject === "own") {
      const { data } = await admin.from("businesses").select(`id, name, city, ${MATCH_COLS}`).eq("id", business_id).single();
      if (data) targets.push({ table: "businesses", id: data.id, row: data });
    }
    if (!subject || subject !== "own") {
      let q = admin.from("ci_competitors").select(`id, name, city, ${MATCH_COLS}`).eq("business_id", business_id).eq("is_active", true);
      if (subject) q = q.eq("id", subject);
      const { data } = await q;
      for (const r of data ?? []) targets.push({ table: "ci_competitors", id: r.id, row: { ...r, city: r.city } });
    }
    // Rakiplerde şehir yoksa işletmenin şehri referans alınır.
    const { data: biz } = await admin.from("businesses").select("city, province").eq("id", business_id).single();

    const work = async () => {
      const results: any[] = [];
      let calls = 0, unlocker = 0, cost = 0;
      for (const t of targets) {
        const row = { ...t.row, city: t.row.city ?? biz?.city ?? null, province: t.row.province ?? biz?.province ?? null };
        const r = await matchRow(row, { force, sources });
        calls += r.calls; unlocker += r.unlocker; cost += r.cost_usd;
        const { error } = await admin.from(t.table).update(r.patch).eq("id", t.id);
        if (error) console.error("match update failed", t.id, error);
        results.push({ key: t.table === "businesses" ? "own" : t.id, name: t.row.name, outcomes: r.outcomes });
      }
      await admin.from("price_fetch_log").insert({
        business_id, adapter: "matching", trigger: isService ? "cron" : "manual", calls, estimated_cost_usd: Number(cost.toFixed(4)),
      }).then(({ error }: any) => error && console.warn("log insert failed", error.message));
      return { results, calls, unlocker_calls: unlocker, cost_usd: cost };
    };

    if (targets.length > 2 && body?.background !== false) {
      (globalThis as any).EdgeRuntime?.waitUntil?.(work().then((r) => console.log("match-hotels done", JSON.stringify(r).slice(0, 4000))));
      return json({ ok: true, started: targets.length });
    }
    return json({ ok: true, ...(await work()) });
  } catch (e) {
    console.error("match-hotels error", e);
    return json({ error: e instanceof Error ? e.message : "Beklenmeyen hata" }, 500);
  }
});
