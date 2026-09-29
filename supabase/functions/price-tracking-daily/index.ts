// Günlük fiyat takibi (cron, 06:00 TR). Önümüzdeki 14 gün her gün; 15–60 gün pazartesi.
// Yalnızca price_tracking_enabled = true VE PRICE_TRACKING_ALLOWLIST_EMAILS'teki işletmeler.
// Liste boşsa hiçbir şey çalışmaz. 20 saatlik cache sayesinde tekrar çağrılar maliyet üretmez;
// zaman bütçesi dolarsa kaldığı işletmeden kendini yeniden çağırır.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { runPriceFetch } from "../_shared/prices/engine.ts";
import { addDays } from "../_shared/prices/types.ts";
import { resolveAllowlistBusinessIds } from "../_shared/analysis-allowlist.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

const MAX_CALLS_PER_BUSINESS_RUN = 400;
const MAX_HOPS = 12;

function todayTR() {
  return new Date(Date.now() + 3 * 3600_000).toISOString().slice(0, 10);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  const started = Date.now();
  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const admin = createClient(supabaseUrl, serviceKey);
    let body: any = {};
    try { body = await req.json(); } catch {}
    const cursor = Math.max(0, Number(body?.cursor) || 0);
    const hop = Math.max(0, Number(body?.hop) || 0);

    const allow = await resolveAllowlistBusinessIds(supabaseUrl, serviceKey, "PRICE_TRACKING_ALLOWLIST_EMAILS");
    if (allow.businessIds.size === 0) return json({ ok: true, skipped: "allowlist_empty" });

    const { data: businesses } = await admin
      .from("businesses")
      .select("id, name, city, serpapi_property_token, booking_url, price_source_preference, price_source_checked_at, price_compare_board_type")
      .eq("price_tracking_enabled", true)
      .in("id", Array.from(allow.businessIds))
      .order("id");
    const list = businesses ?? [];

    const today = todayTR();
    const isMonday = new Date(`${today}T00:00:00Z`).getUTCDay() === 1;
    const dates = Array.from({ length: 14 }, (_, i) => addDays(today, i));
    if (isMonday) for (let i = 14; i < 60; i++) dates.push(addDays(today, i));

    const summary: any[] = [];
    for (let i = cursor; i < list.length; i++) {
      const deadline = started + 110_000;
      const r = await runPriceFetch({
        admin,
        business: list[i],
        dates,
        nights: 1,
        adults: 2,
        cacheHours: 20,
        force: false,
        maxCalls: MAX_CALLS_PER_BUSINESS_RUN,
        allowBooking: true, // allowlist, abonelik kontrolünün yerini alır
        deadline,
        trigger: "cron",
      });
      summary.push({ business_id: list[i].id, ...r });
      if (!r.complete && !r.capped) {
        if (hop < MAX_HOPS) {
          // Kalan işi yeni bir çağrıda sürdür (cache sayesinde yapılanlar atlanır).
          fetch(`${supabaseUrl}/functions/v1/price-tracking-daily`, {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${serviceKey}` },
            body: JSON.stringify({ cursor: i, hop: hop + 1 }),
          }).catch((e) => console.error("self-invoke failed", e));
        }
        return json({ ok: true, continued_from: i, summary });
      }
    }
    return json({ ok: true, businesses: list.length, dates: dates.length, summary });
  } catch (e) {
    console.error("price-tracking-daily error", e);
    return json({ error: e instanceof Error ? e.message : "Beklenmeyen hata" }, 500);
  }
});
