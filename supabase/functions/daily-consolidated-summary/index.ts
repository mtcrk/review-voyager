import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// Runs daily (cron) at 06:00 UTC = 09:00 Türkiye.
// For each owner that has at least one business with
// review_notification_type != 'none', gathers the last 24h reviews across
// ALL of that owner's eligible locations and sends ONE consolidated email
// via notify-fetch-summary.
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);

    const { data: businesses, error } = await supabase
      .from("businesses")
      .select("id, user_id, name, city, review_notification_type")
      .neq("review_notification_type", "none");
    if (error) throw error;

    // Group by owner
    const byUser = new Map<string, typeof businesses>();
    for (const b of businesses || []) {
      const arr = byUser.get(b.user_id) || [];
      arr.push(b);
      byUser.set(b.user_id, arr);
    }

    const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const results: any[] = [];

    for (const [userId, bizList] of byUser) {
      const locations: any[] = [];
      for (const biz of bizList) {
        const { data: newReviews } = await supabase
          .from("reviews")
          .select("id, reviewer_name, rating, text, sentiment, posted_at, platform")
          .eq("business_id", biz.id)
          .gte("created_at", since)
          .order("posted_at", { ascending: false });

        const { data: editedReviews } = await supabase
          .from("reviews")
          .select("id, reviewer_name, rating, previous_rating, text, previous_text, platform")
          .eq("business_id", biz.id)
          .eq("is_edited", true)
          .gte("edited_at", since);

        // Aggregate platform results from last 24h integration logs
        const { data: logs } = await supabase
          .from("integration_logs")
          .select("provider, action, status, meta, created_at")
          .eq("business_id", biz.id)
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

        const hasContent =
          (newReviews && newReviews.length > 0) ||
          (editedReviews && editedReviews.length > 0) ||
          platform_results.some((p) => p.error);
        if (!hasContent) continue;

        locations.push({
          business_id: biz.id,
          business_name: biz.name,
          city: biz.city,
          new_reviews: newReviews || [],
          edited_reviews: editedReviews || [],
          platform_results,
        });
      }

      if (locations.length === 0) {
        results.push({ user_id: userId, skipped: true });
        continue;
      }

      const resp = await fetch(`${supabaseUrl}/functions/v1/notify-fetch-summary`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${serviceKey}`,
        },
        body: JSON.stringify({ user_id: userId, locations }),
      });
      const json = await resp.json().catch(() => ({}));
      results.push({ user_id: userId, locations: locations.length, status: resp.status, json });
    }

    return new Response(JSON.stringify({ success: true, users: results.length, results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e: any) {
    console.error("daily-consolidated-summary error:", e);
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});