// Admin: fiyat kredisi elle verme (admin_grant) ve son 30 gün anlık sorgu maliyet özeti.
import { createClient } from "npm:@supabase/supabase-js@2";
import { CORS_HEADERS } from "../_shared/paytr.ts";

const ADMIN_EMAIL = "metecorukbasari@gmail.com";
const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS_HEADERS });
  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const auth = req.headers.get("Authorization") ?? "";
    const admin = createClient(supabaseUrl, serviceKey);
    let userId: string | null = null;
    if (auth !== `Bearer ${serviceKey}`) {
      const uc = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, { global: { headers: { Authorization: auth } } });
      const { data: { user } } = await uc.auth.getUser();
      if (!user) return json({ error: "Unauthorized" }, 401);
      const { data: isAdmin } = await admin.rpc("has_role", { _user_id: user.id, _role: "admin" });
      if (!isAdmin && user.email?.toLowerCase() !== ADMIN_EMAIL) return json({ error: "Forbidden" }, 403);
      userId = user.id;
    }

    const body = await req.json().catch(() => ({}));
    const action = String(body?.action ?? "stats");

    if (action === "grant") {
      const business_id = String(body?.business_id ?? "");
      const credits = Math.round(Number(body?.credits));
      if (!/^[0-9a-f-]{36}$/i.test(business_id) || !(credits > 0 && credits <= 10000)) return json({ error: "Geçersiz istek" }, 400);
      const { data: biz } = await admin.from("businesses").select("id, name").eq("id", business_id).maybeSingle();
      if (!biz) return json({ error: "İşletme bulunamadı" }, 404);
      const note = String(body?.note ?? "").slice(0, 200) || "Admin kredi tanımı";
      const { error } = await admin.from("price_credit_ledger").insert({ business_id, delta: credits, reason: "admin_grant", note, created_by: userId });
      if (error) return json({ error: error.message }, 500);
      return json({ ok: true, business: biz.name, credits });
    }

    if (action === "search") {
      const q = String(body?.q ?? "").trim();
      if (q.length < 2) return json({ businesses: [] });
      const { data } = await admin.from("businesses").select("id, name, city").ilike("name", `%${q}%`).limit(20);
      return json({ businesses: data ?? [] });
    }

    // stats — son 30 gün
    const since = new Date(Date.now() - 30 * 86400_000).toISOString();
    const [{ data: led }, { data: logs }, { data: bizs }] = await Promise.all([
      admin.from("price_credit_ledger").select("business_id, delta, reason, created_at").gte("created_at", since).limit(10000),
      admin.from("price_fetch_log").select("business_id, adapter, calls, estimated_cost_usd").eq("trigger", "instant").gte("created_at", since).limit(10000),
      admin.from("businesses").select("id, name").limit(5000),
    ]);
    const names = new Map((bizs ?? []).map((b: any) => [b.id, b.name]));
    let spent = 0, refunded = 0, purchased = 0, granted = 0;
    const per = new Map<string, { spent: number; refunded: number; cost: number }>();
    const row = (id: string) => { if (!per.has(id)) per.set(id, { spent: 0, refunded: 0, cost: 0 }); return per.get(id)!; };
    for (const l of led ?? []) {
      if (l.reason === "instant_query") { spent += -l.delta; row(l.business_id).spent += -l.delta; }
      else if (l.reason === "refund") { refunded += l.delta; row(l.business_id).refunded += l.delta; }
      else if (l.reason === "purchase") purchased += l.delta;
      else if (l.reason === "admin_grant") granted += l.delta;
    }
    let cost = 0;
    const byAdapter: Record<string, { calls: number; cost: number }> = {};
    for (const g of logs ?? []) {
      const c = Number(g.estimated_cost_usd) || 0;
      cost += c; row(g.business_id).cost += c;
      byAdapter[g.adapter] ??= { calls: 0, cost: 0 };
      byAdapter[g.adapter].calls += g.calls; byAdapter[g.adapter].cost += c;
    }
    const net = spent - refunded;
    return json({
      window_days: 30, spent, refunded, net_credits: net, purchased, granted,
      cost_usd: Number(cost.toFixed(4)), cost_per_credit_usd: net > 0 ? Number((cost / net).toFixed(4)) : null,
      by_adapter: byAdapter,
      by_business: Array.from(per, ([id, v]) => ({ business_id: id, name: names.get(id) ?? id, ...v, cost: Number(v.cost.toFixed(4)) }))
        .sort((a, b) => b.spent - a.spent),
    });
  } catch (e) {
    console.error("price-credits-admin error", e);
    return json({ error: (e as Error).message }, 500);
  }
});
