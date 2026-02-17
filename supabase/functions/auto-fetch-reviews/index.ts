import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const WEXTRACTOR_API_TOKEN = Deno.env.get("WEXTRACTOR_API_TOKEN");
    if (!WEXTRACTOR_API_TOKEN) {
      return new Response(JSON.stringify({ error: "WEXTRACTOR_API_TOKEN not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get all businesses with a booking_hotel_id
    const { data: businesses, error: bizError } = await supabase
      .from("businesses")
      .select("id, booking_hotel_id, name")
      .not("booking_hotel_id", "is", null);

    if (bizError) throw bizError;
    if (!businesses || businesses.length === 0) {
      return new Response(JSON.stringify({ message: "No businesses with booking_hotel_id" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const results: any[] = [];

    for (const biz of businesses) {
      try {
        const apiUrl = `https://wextractor.com/api/v1/reviews/booking?id=${encodeURIComponent(biz.booking_hotel_id!)}&auth_token=${WEXTRACTOR_API_TOKEN}&offset=0`;
        const wextResponse = await fetch(apiUrl);

        if (!wextResponse.ok) {
          results.push({ business: biz.name, error: `HTTP ${wextResponse.status}` });
          continue;
        }

        const wextData = await wextResponse.json();
        let insertedCount = 0;

        for (const review of wextData.reviews || []) {
          const reviewId = review.id || `booking-${biz.booking_hotel_id}-${review.author || review.author_name}-${review.date}`;

          let normalizedRating = review.rating || 3;
          if (normalizedRating > 5) normalizedRating = Math.round(normalizedRating / 2);

          const parts: string[] = [];
          if (review.positive) parts.push(`👍 ${review.positive}`);
          if (review.negative) parts.push(`👎 ${review.negative}`);
          const reviewText = parts.length > 0 ? parts.join("\n\n") : (review.text || "");

          const { data: existing } = await supabase
            .from("reviews")
            .select("id")
            .eq("business_id", biz.id)
            .eq("google_review_id", reviewId)
            .eq("platform", "booking")
            .maybeSingle();

          if (existing) continue;

          const { error: insertError } = await supabase.from("reviews").insert({
            business_id: biz.id,
            platform: "booking",
            google_review_id: reviewId,
            reviewer_name: review.author || review.author_name || "Anonymous",
            rating: normalizedRating,
            text: reviewText || null,
            posted_at: review.date ? new Date(review.date).toISOString() : new Date().toISOString(),
            status: "pending_reply",
            sentiment: normalizedRating >= 4 ? "positive" : normalizedRating >= 3 ? "neutral" : "negative",
          });

          if (!insertError) insertedCount++;
        }

        results.push({ business: biz.name, fetched: wextData.reviews?.length || 0, inserted: insertedCount });
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
