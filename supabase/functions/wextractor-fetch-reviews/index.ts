import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface WextractorReview {
  id?: string;
  title?: string;
  text?: string;
  rating?: string | number;
  date?: string;
  datetime?: string;
  author?: string;
  author_name?: string;
  reviewer?: string;
  positive?: string;
  negative?: string;
  pros?: string;
  cons?: string;
  reply?: string | null;
  room_type?: string;
  stay_date?: string;
  traveller_type?: string;
  country?: string;
  language?: string;
}

interface WextractorResponse {
  totals?: {
    review_count: number;
    average_rating: string;
  };
  reviews: WextractorReview[];
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const WEXTRACTOR_API_TOKEN = Deno.env.get("WEXTRACTOR_API_TOKEN");
    if (!WEXTRACTOR_API_TOKEN) {
      console.error("WEXTRACTOR_API_TOKEN not configured");
      return new Response(
        JSON.stringify({ error: "Wextractor API token not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Create authenticated client to verify user
    const supabaseAuth = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: authError } = await supabaseAuth.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { business_id, platform = "booking", offset = 0 } = await req.json();

    if (!business_id) {
      return new Response(
        JSON.stringify({ error: "business_id is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Use service role client for DB operations
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify user owns this business
    const { data: business, error: bizError } = await supabaseAuth
      .from("businesses")
      .select("id, booking_hotel_id, name")
      .eq("id", business_id)
      .maybeSingle();

    if (bizError || !business) {
      return new Response(
        JSON.stringify({ error: "Business not found or access denied" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!business.booking_hotel_id) {
      return new Response(
        JSON.stringify({ error: "Booking hotel ID not configured for this business. Please add it in Settings." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Determine Wextractor endpoint based on platform
    let apiUrl: string;
    if (platform === "booking") {
      apiUrl = `https://wextractor.com/api/v1/reviews/booking?id=${encodeURIComponent(business.booking_hotel_id)}&auth_token=${WEXTRACTOR_API_TOKEN}&offset=${offset}`;
    } else if (platform === "tripadvisor") {
      apiUrl = `https://wextractor.com/api/v1/reviews/tripadvisor?id=${encodeURIComponent(business.booking_hotel_id)}&auth_token=${WEXTRACTOR_API_TOKEN}&offset=${offset}`;
    } else {
      return new Response(
        JSON.stringify({ error: "Unsupported platform. Use 'booking' or 'tripadvisor'." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Fetching ${platform} reviews for business ${business_id}, offset ${offset}`);

    // Fetch reviews from Wextractor
    const wextResponse = await fetch(apiUrl);
    if (!wextResponse.ok) {
      const errorText = await wextResponse.text();
      console.error(`Wextractor API error [${wextResponse.status}]:`, errorText);

      // Log the error
      await supabase.from("integration_logs").insert({
        business_id,
        provider: "wextractor",
        action: `${platform}_reviews_fetch`,
        status: "error",
        http_status: wextResponse.status,
        error_message: errorText.substring(0, 500),
      });

      return new Response(
        JSON.stringify({ error: `Wextractor API error: ${wextResponse.status}` }),
        { status: wextResponse.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const wextData: WextractorResponse = await wextResponse.json();
    console.log(`Received ${wextData.reviews?.length || 0} reviews from Wextractor`);
    // Log first review for debugging field names
    if (wextData.reviews?.length > 0) {
      console.log("Sample review keys:", JSON.stringify(Object.keys(wextData.reviews[0])));
      console.log("Sample review data:", JSON.stringify(wextData.reviews[0]));
    }

    // Transform and upsert reviews
    let insertedCount = 0;
    let skippedCount = 0;

    for (const review of wextData.reviews || []) {
      // Resolve field name differences between API versions
      const reviewerName = review.reviewer || review.author || review.author_name || "Anonymous";
      const reviewDate = review.datetime || review.date;
      const posText = review.pros || review.positive || "";
      const negText = review.cons || review.negative || "";

      // Create a unique identifier for deduplication
      const reviewId = review.id || `${platform}-${business.booking_hotel_id}-${reviewerName}-${reviewDate}`;

      // Normalize rating: Booking uses 1-10 scale, we use 1-5
      let normalizedRating = typeof review.rating === "string" ? parseFloat(review.rating) : (review.rating || 3);
      if (platform === "booking" && normalizedRating > 5) {
        normalizedRating = Math.round(normalizedRating / 2);
      }

      // Combine positive and negative text for Booking reviews
      let reviewText = review.text || "";
      if (platform === "booking") {
        const parts: string[] = [];
        if (posText) parts.push(`👍 ${posText}`);
        if (negText) parts.push(`👎 ${negText}`);
        if (parts.length > 0) reviewText = parts.join("\n\n");
      }
      // Add title if available
      if (review.title && reviewText) reviewText = `${review.title}\n\n${reviewText}`;
      else if (review.title) reviewText = review.title;

      // Check if review already exists
      const { data: existing } = await supabase
        .from("reviews")
        .select("id")
        .eq("business_id", business_id)
        .eq("google_review_id", reviewId)
        .eq("platform", platform)
        .maybeSingle();

      if (existing) {
        skippedCount++;
        continue;
      }

      const { error: insertError } = await supabase.from("reviews").insert({
        business_id,
        platform,
        google_review_id: reviewId,
        reviewer_name: reviewerName,
        rating: normalizedRating,
        text: reviewText || null,
        posted_at: reviewDate ? new Date(reviewDate).toISOString() : new Date().toISOString(),
        status: "pending_reply",
        sentiment: normalizedRating >= 4 ? "positive" : normalizedRating >= 3 ? "neutral" : "negative",
      });

      if (insertError) {
        console.error("Insert error:", insertError);
      } else {
        insertedCount++;
      }
    }

    // Log success
    await supabase.from("integration_logs").insert({
      business_id,
      provider: "wextractor",
      action: `${platform}_reviews_fetch`,
      status: "success",
      meta: {
        total_fetched: wextData.reviews?.length || 0,
        inserted: insertedCount,
        skipped: skippedCount,
        offset,
        total_available: wextData.totals?.review_count,
      },
    });

    return new Response(
      JSON.stringify({
        success: true,
        fetched: wextData.reviews?.length || 0,
        inserted: insertedCount,
        skipped: skippedCount,
        total_available: wextData.totals?.review_count || null,
        average_rating: wextData.totals?.average_rating || null,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in wextractor-fetch-reviews:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
