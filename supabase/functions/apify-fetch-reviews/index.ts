import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const APIFY_BASE = "https://api.apify.com/v2";
const ACTOR_ID = "tri_angle~hotel-review-aggregator";

// Map Apify provider names to our platform names
const PROVIDER_MAP: Record<string, string> = {
  "booking.com": "booking",
  booking: "booking",
  tripadvisor: "tripadvisor",
  expedia: "expedia",
  "hotels.com": "hotelscom",
  hotelscom: "hotelscom",
  "hotels": "hotelscom",
  google: "google",
  "google-maps": "google",
  yelp: "yelp",
  airbnb: "airbnb",
};

// Our platform names → Apify provider filter values
const PLATFORM_TO_APIFY_PROVIDER: Record<string, string[]> = {
  booking: ["booking"],
  tripadvisor: ["tripadvisor"],
  hotelscom: ["hotels", "expedia"],
  expedia: ["expedia"],
  all: ["booking", "tripadvisor", "expedia", "hotels", "airbnb", "yelp"], // exclude google - already fetched via GBP API
};

interface ApifyReview {
  googleMapsPlaceId?: string;
  placeName?: string;
  placeUrl?: string;
  placeAddress?: string;
  provider: string;
  reviewId: string;
  reviewUrl?: string | null;
  reviewTitle?: string | null;
  reviewText?: string | null;
  reviewDate?: string | null;
  reviewRating?: number | string | null;
  authorName?: string | null;
  reviewImages?: string[];
  reviewResponses?: string[];
}

function normalizeRating(rating: number | string | null | undefined, provider: string): number {
  if (rating == null) return 3;
  const num = typeof rating === "string" ? parseFloat(rating) : rating;
  if (isNaN(num)) return 3;
  // Booking.com and Expedia use 1-10 scale
  if ((provider === "booking" || provider === "booking.com" || provider === "expedia") && num > 5) {
    return Math.round(num / 2);
  }
  return Math.min(5, Math.max(1, Math.round(num)));
}

function normalizePlatform(provider: string): string {
  return PROVIDER_MAP[provider.toLowerCase()] || provider.toLowerCase();
}

function toSafeIsoDate(input?: string | null): string {
  if (!input) return new Date().toISOString();
  const parsed = new Date(input);
  return Number.isNaN(parsed.getTime()) ? new Date().toISOString() : parsed.toISOString();
}

async function pollRunStatus(runId: string, token: string, maxWaitMs = 55000): Promise<any> {
  const start = Date.now();
  while (Date.now() - start < maxWaitMs) {
    const resp = await fetch(`${APIFY_BASE}/actor-runs/${runId}?token=${token}`);
    if (!resp.ok) throw new Error(`Failed to check run status: ${resp.status}`);
    const data = await resp.json();
    const status = data.data?.status;
    if (status === "SUCCEEDED") return data.data;
    if (status === "FAILED" || status === "ABORTED" || status === "TIMED-OUT") {
      throw new Error(`Actor run ${status}: ${data.data?.statusMessage || "Unknown error"}`);
    }
    // Wait 3 seconds before next poll
    await new Promise(r => setTimeout(r, 3000));
  }
  return null; // Timed out waiting
}

async function fetchDatasetItems(datasetId: string, token: string): Promise<ApifyReview[]> {
  const items: ApifyReview[] = [];
  let offset = 0;
  const limit = 1000;
  while (true) {
    const resp = await fetch(
      `${APIFY_BASE}/datasets/${datasetId}/items?token=${token}&format=json&limit=${limit}&offset=${offset}`
    );
    if (!resp.ok) throw new Error(`Failed to fetch dataset items: ${resp.status}`);
    const data = await resp.json();
    if (!Array.isArray(data) || data.length === 0) break;
    items.push(...data);
    if (data.length < limit) break;
    offset += limit;
  }
  return items;
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

    const APIFY_API_TOKEN = Deno.env.get("APIFY_API_TOKEN");
    if (!APIFY_API_TOKEN) {
      return new Response(
        JSON.stringify({ error: "Apify API token not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Auth check
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

    const { business_id, platform = "all", run_id } = await req.json();

    if (!business_id) {
      return new Response(
        JSON.stringify({ error: "business_id is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // If run_id is provided, we're checking an existing run
    if (run_id) {
      console.log(`Checking existing run: ${run_id}`);
      const runData = await pollRunStatus(run_id, APIFY_API_TOKEN, 55000);
      
      if (!runData) {
        return new Response(
          JSON.stringify({ status: "running", run_id, message: "Actor is still running. Try again in a few seconds." }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const datasetId = runData.defaultDatasetId;
      const items = await fetchDatasetItems(datasetId, APIFY_API_TOKEN);
      const result = await insertReviews(supabase, items, business_id, platform === "hotelscom" ? "hotelscom" : undefined);

      await logSuccess(supabase, business_id, platform, items.length, result.inserted, result.skipped);

      return new Response(
        JSON.stringify({ success: true, ...result, fetched: items.length }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get business
    const { data: business, error: bizError } = await supabaseAuth
      .from("businesses")
      .select("id, place_id, name, booking_hotel_id, tripadvisor_id, trustpilot_url, hotelscom_url")
      .eq("id", business_id)
      .maybeSingle();

    if (bizError || !business) {
      return new Response(
        JSON.stringify({ error: "Business not found or access denied" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // If no place_id, fall back to Wextractor-style direct platform scraping
    if (!business.place_id) {
      console.log("No place_id found, falling back to Wextractor");
      return await handleWextractorFallback(req, supabase, business, platform, business_id);
    }

    // Build Apify actor input
    const providers = PLATFORM_TO_APIFY_PROVIDER[platform] || [];
    const actorInput: any = {
      startIds: [business.place_id],
      scrapeReviewPictures: false,
      scrapeReviewResponses: true,
    };
    if (providers.length > 0) {
      actorInput.providers = providers;
    }

    console.log(`Starting Apify actor for business ${business_id}, platform: ${platform}, place_id: ${business.place_id}`);

    // Start actor run (async)
    const startResp = await fetch(
      `${APIFY_BASE}/acts/${ACTOR_ID}/runs?token=${APIFY_API_TOKEN}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(actorInput),
      }
    );

    if (!startResp.ok) {
      const errBody = await startResp.text();
      console.error("Apify start error:", errBody);
      throw new Error(`Apify actor start failed: ${startResp.status} - ${errBody}`);
    }

    const startData = await startResp.json();
    const newRunId = startData.data?.id;
    const datasetId = startData.data?.defaultDatasetId;

    if (!newRunId) {
      throw new Error("Failed to get run ID from Apify");
    }

    console.log(`Actor run started: ${newRunId}, dataset: ${datasetId}`);

    // Try to wait for completion within this request
    const runData = await pollRunStatus(newRunId, APIFY_API_TOKEN, 50000);

    if (!runData) {
      // Still running - return run_id for frontend to poll
      return new Response(
        JSON.stringify({ status: "running", run_id: newRunId, message: "Actor is still running. Call again with run_id to check." }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Run completed - fetch and insert results
    const items = await fetchDatasetItems(runData.defaultDatasetId, APIFY_API_TOKEN);
    const result = await insertReviews(supabase, items, business_id, platform === "hotelscom" ? "hotelscom" : undefined);

    await logSuccess(supabase, business_id, platform, items.length, result.inserted, result.skipped);

    return new Response(
      JSON.stringify({ success: true, ...result, fetched: items.length }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in apify-fetch-reviews:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

async function insertReviews(supabase: any, items: ApifyReview[], businessId: string, forcedPlatform?: string) {
  // Transform reviews
  const transformed = items
    .filter(item => item.reviewText || item.reviewTitle)
    .map(item => {
      const platform = forcedPlatform || normalizePlatform(item.provider);
      const rating = normalizeRating(item.reviewRating, item.provider);
      let text = item.reviewText || "";
      if (item.reviewTitle && text) text = `${item.reviewTitle}\n\n${text}`;
      else if (item.reviewTitle) text = item.reviewTitle;

      return {
        business_id: businessId,
        platform,
        google_review_id: `apify-${item.provider}-${item.reviewId}`,
        reviewer_name: item.authorName || "Anonymous",
        rating,
        text: text || null,
        posted_at: toSafeIsoDate(item.reviewDate),
        status: "pending_reply",
        sentiment: rating >= 4 ? "positive" : rating >= 3 ? "neutral" : "negative",
      };
    });

  // Batch check existing reviews
  const existingIds = new Set<string>();
  const allIds = transformed.map(r => r.google_review_id);
  const CHECK_BATCH = 200;
  for (let i = 0; i < allIds.length; i += CHECK_BATCH) {
    const batch = allIds.slice(i, i + CHECK_BATCH);
    const { data: existing } = await supabase
      .from("reviews")
      .select("google_review_id")
      .eq("business_id", businessId)
      .in("google_review_id", batch);
    if (existing) {
      for (const row of existing) existingIds.add(row.google_review_id!);
    }
  }

  const newReviews = transformed.filter(r => !existingIds.has(r.google_review_id));
  const skipped = transformed.length - newReviews.length;
  let inserted = 0;

  // Batch insert
  const INSERT_BATCH = 100;
  for (let i = 0; i < newReviews.length; i += INSERT_BATCH) {
    const batch = newReviews.slice(i, i + INSERT_BATCH);
    const { data, error } = await supabase.from("reviews").insert(batch).select("id");
    if (error) {
      console.error(`Batch insert error at ${i}:`, error.message);
    } else {
      inserted += data?.length || 0;
    }
  }

  console.log(`Done: ${inserted} inserted, ${skipped} skipped out of ${transformed.length} total`);
  return { inserted, skipped, total: transformed.length };
}

async function logSuccess(supabase: any, businessId: string, platform: string, fetched: number, inserted: number, skipped: number) {
  await supabase.from("integration_logs").insert({
    business_id: businessId,
    provider: "apify",
    action: `${platform}_reviews_fetch`,
    status: "success",
    meta: { fetched, inserted, skipped },
  });
}

// ====== Wextractor Fallback (for businesses without Google Place ID) ======

function getWextractorPlatformId(business: any, platform: string): string | null {
  switch (platform) {
    case "booking": return business.booking_hotel_id;
    case "tripadvisor": {
      const raw = business.tripadvisor_id;
      if (!raw) return null;
      const slugMatch = String(raw).match(/(?:Hotel|Restaurant|Attraction)_Review-g\d+-d(\d+)/i);
      if (slugMatch) return slugMatch[1];
      const dMatch = String(raw).match(/-d(\d+)/i);
      if (dMatch) return dMatch[1];
      return String(raw).trim();
    }
    case "trustpilot": return business.trustpilot_url;
    case "hotelscom": return business.hotelscom_url;
    default: return null;
  }
}

function buildWextractorUrl(platform: string, platformId: string, token: string): string | null {
  switch (platform) {
    case "booking": return `https://wextractor.com/api/v1/reviews/booking?id=${encodeURIComponent(platformId)}&auth_token=${token}`;
    case "tripadvisor": return `https://wextractor.com/api/v1/reviews/tripadvisor?id=${encodeURIComponent(platformId)}&auth_token=${token}`;
    case "trustpilot": return `https://wextractor.com/api/v1/reviews/trustpilot?id=${encodeURIComponent(platformId)}&auth_token=${token}`;
    case "hotelscom": return `https://wextractor.com/api/v1/reviews/expedia?id=${encodeURIComponent(platformId)}&auth_token=${token}`;
    default: return null;
  }
}

async function handleWextractorFallback(req: Request, supabase: any, business: any, platform: string, businessId: string) {
  const WEXTRACTOR_API_TOKEN = Deno.env.get("WEXTRACTOR_API_TOKEN");
  if (!WEXTRACTOR_API_TOKEN) {
    return new Response(
      JSON.stringify({ error: "Google Place ID eksik ve Wextractor API token da yapılandırılmamış." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  // If platform is "all", try each platform
  const platforms = platform === "all" 
    ? ["booking", "tripadvisor", "trustpilot", "hotelscom"] 
    : [platform];

  let totalInserted = 0;
  let totalSkipped = 0;
  let totalFetched = 0;

  for (const p of platforms) {
    const platformId = getWextractorPlatformId(business, p);
    if (!platformId) continue;

    const apiUrl = buildWextractorUrl(p, platformId, WEXTRACTOR_API_TOKEN);
    if (!apiUrl) continue;

    try {
      // Fetch first page
      const resp = await fetch(`${apiUrl}&offset=0`);
      if (!resp.ok) {
        console.error(`Wextractor ${p} error: ${resp.status}`);
        continue;
      }
      const data = await resp.json();
      const reviews = data.reviews || [];
      totalFetched += reviews.length;

      // Transform to our format
      const transformed = reviews.map((review: any) => {
        const reviewerName = review.reviewer || review.author || review.author_name || "Anonymous";
        const reviewDate = review.datetime || review.date;
        const posText = review.pros || review.positive || "";
        const negText = review.cons || review.negative || "";
        const reviewId = review.id || `${p}-${platformId}-${reviewerName}-${reviewDate}`;

        let normalizedRating = typeof review.rating === "string" ? parseFloat(review.rating) : (review.rating || 3);
        if (p === "booking" && normalizedRating > 5) normalizedRating = Math.round(normalizedRating / 2);

        let reviewText = review.text || "";
        if (p === "booking") {
          const parts: string[] = [];
          if (posText) parts.push(`👍 ${posText}`);
          if (negText) parts.push(`👎 ${negText}`);
          if (parts.length > 0) reviewText = parts.join("\n\n");
        }
        if (review.title && reviewText) reviewText = `${review.title}\n\n${reviewText}`;
        else if (review.title) reviewText = review.title;

        return {
          business_id: businessId,
          platform: p,
          google_review_id: reviewId,
          reviewer_name: reviewerName,
          rating: normalizedRating,
          text: reviewText || null,
          posted_at: toSafeIsoDate(reviewDate),
          status: "pending_reply",
          sentiment: normalizedRating >= 4 ? "positive" : normalizedRating >= 3 ? "neutral" : "negative",
        };
      });

      // Dedup & insert
      const allIds = transformed.map((r: any) => r.google_review_id);
      const existingIds = new Set<string>();
      for (let i = 0; i < allIds.length; i += 200) {
        const batch = allIds.slice(i, i + 200);
        const { data: existing } = await supabase
          .from("reviews")
          .select("google_review_id")
          .eq("business_id", businessId)
          .eq("platform", p)
          .in("google_review_id", batch);
        if (existing) for (const row of existing) existingIds.add(row.google_review_id!);
      }

      const newReviews = transformed.filter((r: any) => !existingIds.has(r.google_review_id));
      totalSkipped += transformed.length - newReviews.length;

      for (let i = 0; i < newReviews.length; i += 100) {
        const batch = newReviews.slice(i, i + 100);
        const { data: inserted, error } = await supabase.from("reviews").insert(batch).select("id");
        if (error) console.error(`Wextractor insert error:`, error.message);
        else totalInserted += inserted?.length || 0;
      }
    } catch (err: any) {
      console.error(`Wextractor fallback error for ${p}:`, err.message);
    }
  }

  await supabase.from("integration_logs").insert({
    business_id: businessId,
    provider: "wextractor-fallback",
    action: `${platform}_reviews_fetch`,
    status: "success",
    meta: { fetched: totalFetched, inserted: totalInserted, skipped: totalSkipped },
  });

  return new Response(
    JSON.stringify({ success: true, fetched: totalFetched, inserted: totalInserted, skipped: totalSkipped }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}
