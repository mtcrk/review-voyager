import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const APIFY_BASE = "https://api.apify.com/v2";
const ACTOR_ID = "tri_angle~hotel-review-aggregator";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const APIFY_API_TOKEN = Deno.env.get("APIFY_API_TOKEN");
    if (!APIFY_API_TOKEN) {
      return new Response(JSON.stringify({ error: "APIFY_API_TOKEN not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get all businesses with a place_id
    const { data: businesses, error: bizError } = await supabase
      .from("businesses")
      .select("id, place_id, name")
      .not("place_id", "is", null);

    if (bizError) throw bizError;
    if (!businesses || businesses.length === 0) {
      return new Response(JSON.stringify({ message: "No businesses with place_id" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const results: any[] = [];

    for (const biz of businesses) {
      try {
        // Start Apify actor run
        const startResp = await fetch(
          `${APIFY_BASE}/acts/${ACTOR_ID}/runs?token=${APIFY_API_TOKEN}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              startIds: [biz.place_id],
              scrapeReviewPictures: false,
              scrapeReviewResponses: true,
              providers: ["booking", "tripadvisor", "expedia", "hotels"],
            }),
          }
        );

        if (!startResp.ok) {
          const errBody = await startResp.text();
          results.push({ business: biz.name, error: `Apify start failed: ${startResp.status} - ${errBody}` });
          continue;
        }

        const startData = await startResp.json();
        const runId = startData.data?.id;
        const datasetId = startData.data?.defaultDatasetId;

        if (!runId) {
          results.push({ business: biz.name, error: "No run ID returned" });
          continue;
        }

        // Poll for completion (max 120s)
        let runData = null;
        const maxWait = 120000;
        const start = Date.now();
        while (Date.now() - start < maxWait) {
          await new Promise(r => setTimeout(r, 5000));
          const statusResp = await fetch(`${APIFY_BASE}/actor-runs/${runId}?token=${APIFY_API_TOKEN}`);
          if (!statusResp.ok) continue;
          const statusData = await statusResp.json();
          const status = statusData.data?.status;
          if (status === "SUCCEEDED") {
            runData = statusData.data;
            break;
          }
          if (["FAILED", "ABORTED", "TIMED-OUT"].includes(status)) {
            results.push({ business: biz.name, error: `Apify run ${status}` });
            break;
          }
        }

        if (!runData || !runData.defaultDatasetId) {
          if (!results.find(r => r.business === biz.name)) {
            results.push({ business: biz.name, error: "Apify run timed out" });
          }
          continue;
        }

        // Fetch dataset items
        const itemsResp = await fetch(
          `${APIFY_BASE}/datasets/${runData.defaultDatasetId}/items?token=${APIFY_API_TOKEN}&format=json&limit=1000`
        );
        if (!itemsResp.ok) {
          results.push({ business: biz.name, error: `Dataset fetch failed: ${itemsResp.status}` });
          continue;
        }

        const items = await itemsResp.json();
        let insertedCount = 0;

        const PROVIDER_MAP: Record<string, string> = {
          "booking.com": "booking", booking: "booking",
          tripadvisor: "tripadvisor",
          expedia: "hotelscom", "hotels.com": "hotelscom", hotelscom: "hotelscom", hotels: "hotelscom",
        };

        for (const item of items) {
          if (!item.reviewText && !item.reviewTitle) continue;

          const platform = PROVIDER_MAP[item.provider?.toLowerCase()] || item.provider?.toLowerCase() || "unknown";
          const reviewId = `apify-${item.provider}-${item.reviewId}`;

          let rating = typeof item.reviewRating === "string" ? parseFloat(item.reviewRating) : (item.reviewRating || 3);
          if (isNaN(rating)) rating = 3;
          if ((platform === "booking" || item.provider === "expedia") && rating > 5) {
            rating = Math.round(rating / 2);
          }
          rating = Math.min(5, Math.max(1, Math.round(rating)));

          let text = item.reviewText || "";
          if (item.reviewTitle && text) text = `${item.reviewTitle}\n\n${text}`;
          else if (item.reviewTitle) text = item.reviewTitle;

          const postedAt = item.reviewDate ? new Date(item.reviewDate) : new Date();
          const safeDate = isNaN(postedAt.getTime()) ? new Date().toISOString() : postedAt.toISOString();

          const { data: existing } = await supabase
            .from("reviews")
            .select("id")
            .eq("business_id", biz.id)
            .eq("google_review_id", reviewId)
            .maybeSingle();

          if (existing) continue;

          const { error: insertError } = await supabase.from("reviews").insert({
            business_id: biz.id,
            platform,
            google_review_id: reviewId,
            reviewer_name: item.authorName || "Anonymous",
            rating,
            text: text || null,
            posted_at: safeDate,
            status: "pending_reply",
            sentiment: rating >= 4 ? "positive" : rating >= 3 ? "neutral" : "negative",
          });

          if (!insertError) insertedCount++;
        }

        results.push({ business: biz.name, fetched: items.length, inserted: insertedCount });
      } catch (err: any) {
        results.push({ business: biz.name, error: err.message });
      }
    }

    console.log("Auto-fetch results:", JSON.stringify(results));

    return new Response(JSON.stringify({ success: true, results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Error in auto-fetch-reviews:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
