import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// One-off helper: aggregate last 24h (or window_hours) of reviews for a single
// business and hand off to notify-fetch-summary with extra_recipients.
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);

    const { business_id, window_hours = 24, extra_recipients = [], skip_owner = true, skip_admin = false } =
      await req.json();
    if (!business_id) throw new Error("business_id required");

    const { data: biz, error: bizErr } = await supabase
      .from("businesses")
      .select("id, user_id, name, city, review_notification_type")
      .eq("id", business_id)
      .single();
    if (bizErr || !biz) throw new Error("business not found");

    const since = new Date(Date.now() - window_hours * 60 * 60 * 1000).toISOString();

    const { data: newReviews } = await supabase
      .from("reviews")
      .select("id, reviewer_name, rating, text, sentiment, posted_at, platform")
      .eq("business_id", business_id)
      .gte("created_at", since)
      .order("posted_at", { ascending: false });

    const { data: editedReviews } = await supabase
      .from("reviews")
      .select("id, reviewer_name, rating, previous_rating, text, previous_text, platform")
      .eq("business_id", business_id)
      .eq("is_edited", true)
      .gte("edited_at", since);

    const { data: logs } = await supabase
      .from("integration_logs")
      .select("provider, action, status, meta, created_at")
      .eq("business_id", business_id)
      .gte("created_at", since)
      .ilike("action", "%reviews_fetch%");

    const platformAgg = new Map<string, { fetched: number; inserted: number; error?: string }>();
    for (const log of logs || []) {
      const platform = (log.action || "").replace(/_reviews_fetch$/, "");
      const cur = platformAgg.get(platform) || { fetched: 0, inserted: 0 };
      const meta: any = log.meta || {};
      cur.fetched += Number(meta.fetched || 0);
      cur.inserted += Number(meta.inserted || 0);
      if (log.status === "error" && !cur.error) cur.error = meta.error_message || "fetch error";
      platformAgg.set(platform, cur);
    }
    const platform_results = Array.from(platformAgg, ([platform, v]) => ({ platform, ...v }));

    const payload = {
      user_id: biz.user_id,
      extra_recipients,
      skip_owner,
      skip_admin,
      locations: [{
        business_id: biz.id,
        business_name: biz.name,
        city: biz.city,
        new_reviews: newReviews || [],
        edited_reviews: editedReviews || [],
        platform_results,
      }],
    };

    const resp = await fetch(`${supabaseUrl}/functions/v1/notify-fetch-summary`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${serviceKey}` },
      body: JSON.stringify(payload),
    });
    const json = await resp.json().catch(() => ({}));

    return new Response(JSON.stringify({ success: resp.ok, status: resp.status, result: json,
      counts: { new: newReviews?.length || 0, edited: editedReviews?.length || 0 } }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e: any) {
    console.error("manual-daily-summary error:", e);
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});