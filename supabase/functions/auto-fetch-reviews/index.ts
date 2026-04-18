import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// This function delegates the actual scraping to the proven, working
// `apify-fetch-reviews` (and `tripadvisor-fetch-reviews`) edge functions.
// Those functions use the correct, per-platform Apify actors that are known
// to return data, instead of the broken aggregator pattern used previously.

interface PlatformPlan {
  platform: "booking" | "tripadvisor" | "hotelscom" | "expedia" | "trustpilot";
  functionName: "apify-fetch-reviews" | "tripadvisor-fetch-reviews";
}

function planFor(biz: any, allowed?: Set<string>): PlatformPlan[] {
  const ok = (p: string) => !allowed || allowed.has(p);
  const plans: PlatformPlan[] = [];
  if (ok("booking") && biz.booking_hotel_id) plans.push({ platform: "booking", functionName: "apify-fetch-reviews" });
  if (ok("tripadvisor") && biz.tripadvisor_id) plans.push({ platform: "tripadvisor", functionName: "tripadvisor-fetch-reviews" });
  if (ok("hotelscom") && (biz.hotelscom_url || biz.place_id)) plans.push({ platform: "hotelscom", functionName: "apify-fetch-reviews" });
  if (ok("expedia") && biz.expedia_hotel_id) plans.push({ platform: "expedia", functionName: "apify-fetch-reviews" });
  if (ok("trustpilot") && biz.trustpilot_url) plans.push({ platform: "trustpilot", functionName: "apify-fetch-reviews" });
  return plans;
}

async function invokePlatformFetch(
  supabaseUrl: string,
  serviceKey: string,
  fnName: string,
  payload: any
): Promise<any> {
  const resp = await fetch(`${supabaseUrl}/functions/v1/${fnName}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${serviceKey}`,
      "apikey": serviceKey,
    },
    body: JSON.stringify(payload),
  });
  const text = await resp.text();
  let data: any = {};
  try { data = text ? JSON.parse(text) : {}; } catch { data = { raw: text }; }
  return { ok: resp.ok, status: resp.status, data };
}

// Poll a "running" run until it completes (or times out).
async function pollUntilDone(
  supabaseUrl: string,
  serviceKey: string,
  fnName: string,
  basePayload: any,
  runId: string,
  maxWaitMs = 8 * 60 * 1000,
  intervalMs = 8000
): Promise<any> {
  const start = Date.now();
  while (Date.now() - start < maxWaitMs) {
    await new Promise((r) => setTimeout(r, intervalMs));
    const res = await invokePlatformFetch(supabaseUrl, serviceKey, fnName, { ...basePayload, run_id: runId });
    if (!res.ok) continue;
    if (res.data?.status === "running") continue;
    return res.data; // success or failed
  }
  return { success: false, message: "poll timeout" };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);

    const url = new URL(req.url);
    const platformsParam = url.searchParams.get("platforms");
    const allowed = platformsParam
      ? new Set(platformsParam.split(",").map((s) => s.trim().toLowerCase()).filter(Boolean))
      : undefined;
    console.log("Allowed platforms:", allowed ? [...allowed].join(",") : "ALL");

    const { data: businesses, error } = await supabase
      .from("businesses")
      .select("id, user_id, name, place_id, booking_hotel_id, tripadvisor_id, hotelscom_url, expedia_hotel_id, trustpilot_url, city")
      .or("booking_hotel_id.not.is.null,tripadvisor_id.not.is.null,hotelscom_url.not.is.null,expedia_hotel_id.not.is.null,trustpilot_url.not.is.null");
    if (error) throw error;
    if (!businesses?.length) {
      return new Response(JSON.stringify({ message: "No businesses configured" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const results: any[] = [];

    for (const biz of businesses) {
      const plans = planFor(biz, allowed);
      for (const plan of plans) {
        try {
          console.log(`[${biz.name}] start ${plan.platform} via ${plan.functionName}`);
          const payload: any = { business_id: biz.id };
          if (plan.functionName === "apify-fetch-reviews") payload.platform = plan.platform;

          let res = await invokePlatformFetch(supabaseUrl, serviceKey, plan.functionName, payload);
          let data = res.data;

          if (data?.status === "running" && data?.run_id) {
            data = await pollUntilDone(supabaseUrl, serviceKey, plan.functionName, payload, data.run_id);
          }

          if (data?.success) {
            console.log(`[${biz.name}] ${plan.platform}: fetched=${data.fetched ?? "?"} inserted=${data.inserted ?? 0}`);
            results.push({ business: biz.name, platform: plan.platform, fetched: data.fetched ?? 0, inserted: data.inserted ?? 0 });
          } else {
            const msg = data?.message || data?.error || `status ${res.status}`;
            console.error(`[${biz.name}] ${plan.platform} failed: ${msg}`);
            results.push({ business: biz.name, platform: plan.platform, error: msg });
          }
        } catch (err: any) {
          console.error(`[${biz.name}] ${plan.platform} exception:`, err.message);
          results.push({ business: biz.name, platform: plan.platform, error: err.message });
        }
      }
    }

    console.log("Auto-fetch done:", JSON.stringify(results));
    return new Response(JSON.stringify({ success: true, results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e: any) {
    console.error("auto-fetch-reviews error:", e);
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
