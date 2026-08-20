import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { filterBusinessIdsWithSubscription } from "../_shared/subscription-guard.ts";

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
  platform: "booking" | "tripadvisor" | "hotelscom" | "expedia" | "trustpilot" | "tripcom" | "yandex";
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
  if (ok("tripcom") && biz.tripcom_hotel_id) plans.push({ platform: "tripcom", functionName: "apify-fetch-reviews" });
  if (ok("yandex") && biz.yandex_org_id) plans.push({ platform: "yandex", functionName: "apify-fetch-reviews" });
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
    const body = await req.json().catch(() => ({}));
    const platformsParam = url.searchParams.get("platforms");
    const allowed = platformsParam
      ? new Set(platformsParam.split(",").map((s) => s.trim().toLowerCase()).filter(Boolean))
      : undefined;
    const force = Boolean(body?.force || body?.manual);
    const maxReviews = Number(body?.max_reviews) || undefined;
    const businessIdFilter: string | undefined = body?.business_id;
    console.log("Allowed platforms:", allowed ? [...allowed].join(",") : "ALL");

    let query = supabase
      .from("businesses")
      .select("id, user_id, name, place_id, booking_hotel_id, tripadvisor_id, hotelscom_url, expedia_hotel_id, trustpilot_url, tripcom_hotel_id, yandex_org_id, city")
      .eq("fetch_disabled", false)
      .or("booking_hotel_id.not.is.null,tripadvisor_id.not.is.null,hotelscom_url.not.is.null,expedia_hotel_id.not.is.null,trustpilot_url.not.is.null,tripcom_hotel_id.not.is.null,yandex_org_id.not.is.null");
    if (businessIdFilter) query = supabase
      .from("businesses")
      .select("id, user_id, name, place_id, booking_hotel_id, tripadvisor_id, hotelscom_url, expedia_hotel_id, trustpilot_url, tripcom_hotel_id, yandex_org_id, city")
      .eq("fetch_disabled", false)
      .eq("id", businessIdFilter);
    const { data: businesses, error } = await query;
    if (error) throw error;
    if (!businesses?.length) {
      return new Response(JSON.stringify({ message: "No businesses configured" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 🚫 Ödeme yapmayan müşterilerin Apify işleri ASLA çalışmaz.
    const subscribed = await filterBusinessIdsWithSubscription(
      supabaseUrl,
      serviceKey,
      businesses.map((b) => b.id)
    );
    const skippedNoSub: string[] = [];
    const eligibleBusinesses = businesses.filter((b) => {
      if (subscribed.has(b.id)) return true;
      skippedNoSub.push(b.name);
      return false;
    });
    if (skippedNoSub.length) {
      console.log(`⛔ Skipped ${skippedNoSub.length} business(es) without active subscription: ${skippedNoSub.join(", ")}`);
    }
    if (!eligibleBusinesses.length) {
      return new Response(JSON.stringify({ message: "No businesses with active subscription", skipped_no_subscription: skippedNoSub }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const jobs: Array<Promise<any>> = [];
    const triggered: any[] = [];
    for (const biz of eligibleBusinesses) {
      const plans = planFor(biz, allowed);
      for (const plan of plans) {
        const payload: any = { business_id: biz.id, force };
        if (maxReviews) payload.max_reviews = maxReviews;
        if (plan.functionName === "apify-fetch-reviews") payload.platform = plan.platform;

        jobs.push((async () => {
          const res = await invokePlatformFetch(supabaseUrl, serviceKey, plan.functionName, payload);
          const d = res.data;

          if (d?.success) {
            console.log(`[${biz.name}] ${plan.platform}: inserted=${d.inserted ?? 0}`);
            return { business: biz.name, platform: plan.platform, success: true, inserted: d.inserted ?? 0 };
          }

          if (d?.status === "running" && d?.run_id) {
            console.log(`[${biz.name}] ${plan.platform}: started run_id=${d.run_id}`);
            const done = await pollUntilDone(supabaseUrl, serviceKey, plan.functionName, payload, d.run_id);
            if (done?.success) {
              console.log(`[${biz.name}] ${plan.platform}: completed inserted=${done.inserted ?? 0}`);
              return { business: biz.name, platform: plan.platform, success: true, inserted: done.inserted ?? 0 };
            }

            console.error(`[${biz.name}] ${plan.platform} poll failed: ${done?.message || done?.error || "unknown"}`);
            return { business: biz.name, platform: plan.platform, success: false, error: done?.message || done?.error || "poll_failed" };
          }

          console.error(`[${biz.name}] ${plan.platform} failed: ${d?.message || d?.error || res.status}`);
          return { business: biz.name, platform: plan.platform, success: false, error: d?.message || d?.error || String(res.status) };
        })().catch((err) => {
          console.error(`[${biz.name}] ${plan.platform} ex:`, err.message);
          return { business: biz.name, platform: plan.platform, success: false, error: err.message };
        }));
        triggered.push({ business: biz.name, platform: plan.platform });
      }
    }

    const results = await Promise.all(jobs);
    const completed = results.filter((r) => r?.success);
    const failed = results.filter((r) => !r?.success);

    console.log(`Auto-fetch completed ${completed.length}/${triggered.length} jobs`);
    return new Response(JSON.stringify({ success: failed.length === 0, triggered: triggered.length, completed: completed.length, failed: failed.length, jobs: results }), {
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
