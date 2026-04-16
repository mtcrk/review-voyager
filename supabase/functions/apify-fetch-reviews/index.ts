import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const APIFY_BASE = "https://api.apify.com/v2";
const ACTOR_ID = "tri_angle~hotel-review-aggregator";
const HOTELSCOM_ACTOR_ID = "memo23~hotels-scraper";
const TRUSTPILOT_ACTOR_ID = "zen-studio~trustpilot-review-scraper";
const EXPEDIA_ACTOR_ID = "memo23~expedia-scraper";

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
  // Booking.com, Expedia, and Hotels.com use 1-10 scale
  const p = provider.toLowerCase();
  if ((p === "booking" || p === "booking.com" || p === "expedia" || p === "hotels" || p === "hotelscom" || p === "hotels.com") && num > 5) {
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


async function getRunStatus(runId: string, token: string): Promise<any> {
  const resp = await fetch(`${APIFY_BASE}/actor-runs/${runId}?token=${token}`);
  if (!resp.ok) throw new Error(`Failed to check run status: ${resp.status}`);
  const data = await resp.json();
  return data.data;
}

function isTerminalStatus(status?: string): boolean {
  return ["SUCCEEDED", "FAILED", "ABORTED", "TIMED-OUT"].includes(status || "");
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
      const runData = await getRunStatus(run_id, APIFY_API_TOKEN);

      if (!runData) {
        return new Response(
          JSON.stringify({ status: "running", run_id, message: "Actor is still running. Try again in a few seconds." }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      if (!isTerminalStatus(runData.status)) {
        return new Response(
          JSON.stringify({ status: "running", run_id, message: "Actor is still running. Try again in a few seconds." }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      if (runData.status !== "SUCCEEDED" || !runData.defaultDatasetId) {
        return new Response(
          JSON.stringify({
            success: false,
            status: "failed",
            run_id,
            message: `Apify run failed: ${runData.statusMessage || runData.status || "Unknown error"}`,
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const datasetId = runData.defaultDatasetId;
      const items = await fetchDatasetItems(datasetId, APIFY_API_TOKEN);

      const cappedItems = (platform === "hotelscom" || platform === "expedia") ? items.slice(0, 200) : items;
      const forcedPlatform = (platform === "hotelscom" || platform === "expedia" || platform === "trustpilot") ? platform : undefined;
      const result = await insertReviews(supabase, cappedItems, business_id, forcedPlatform);

      await logSuccess(supabase, business_id, platform, items.length, result.inserted, result.skipped);

      return new Response(
        JSON.stringify({ success: true, ...result, fetched: items.length }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get business
    const { data: business, error: bizError } = await supabaseAuth
      .from("businesses")
      .select("id, place_id, name, city, booking_hotel_id, tripadvisor_id, trustpilot_url, hotelscom_url, expedia_hotel_id")
      .eq("id", business_id)
      .maybeSingle();

    if (bizError || !business) {
      return new Response(
        JSON.stringify({ error: "Business not found or access denied" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Determine which actor to use
    let actorId = ACTOR_ID;
    let actorInput: any;

    // Use dedicated Hotels.com scraper when platform is hotelscom and URL is available
    if (platform === "hotelscom" && business.hotelscom_url) {
      actorId = HOTELSCOM_ACTOR_ID;
      const hotelId = business.hotelscom_url.replace(/\D/g, ""); // Extract numeric ID
      actorInput = {
        startUrls: [`https://www.hotels.com/ho${hotelId}/`],
        maxItems: 200,
        maxReviewsPerHotel: 200,
        sortBy: "newest_first",
      };
      console.log(`Using dedicated Hotels.com scraper for hotel ID: ${hotelId}`);
    } else if (platform === "expedia" && business.expedia_hotel_id) {
      // Use dedicated memo23/expedia-scraper - reliable and actively maintained
      actorId = EXPEDIA_ACTOR_ID;
      const expediaUrl = `https://www.expedia.com/h${business.expedia_hotel_id}.Hotel-Information`;
      actorInput = {
        startUrls: [expediaUrl],
        maxItems: 200,
      };
      console.log(`Using memo23/expedia-scraper for: ${expediaUrl}`);
    } else if (platform === "trustpilot") {
      // Trustpilot is NOT supported by hotel-review-aggregator, use dedicated actor
      if (!business.trustpilot_url) {
        return new Response(
          JSON.stringify({ error: "Trustpilot URL bulunamadı. Lütfen önce Trustpilot URL'sini ekleyin." }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      actorId = TRUSTPILOT_ACTOR_ID;
      // trustpilot_url stores domain like "example.com" or full URL
      const domain = business.trustpilot_url.replace(/^https?:\/\/(www\.)?trustpilot\.[a-z.]+\/review\//i, "").replace(/\/.*$/, "");
      const businessUrl = `https://www.trustpilot.com/review/${domain}`;
      actorInput = {
        businessUrl,
        maxResults: 200,
      };
      console.log(`Using dedicated Trustpilot scraper for: ${businessUrl}`);
    } else if (platform === "booking" && business.booking_hotel_id) {
      // Booking.com with direct URL — always prefer booking_hotel_id when available
      const bookingUrl = `https://www.booking.com/hotel/${business.booking_hotel_id}.html`;
      actorInput = {
        startUrls: [{ url: bookingUrl }],
        providers: ["booking"],
        maxReviewsPerQuery: 200,
        scrapeReviewPictures: false,
        scrapeReviewResponses: true,
      };
      console.log(`Using direct Booking URL: ${bookingUrl}`);
    } else {
      // Use the general hotel-review-aggregator
      const providers = PLATFORM_TO_APIFY_PROVIDER[platform] || [];
      actorInput = {
        maxReviewsPerQuery: 200,
        scrapeReviewPictures: false,
        scrapeReviewResponses: true,
      };

      if (business.place_id) {
        actorInput.startIds = [business.place_id];
      } else {
        const searchQuery = encodeURIComponent(`${business.name} ${business.city || ""}`).trim();
        actorInput.startUrls = [{ url: `https://www.google.com/maps/search/${searchQuery}` }];
        console.log(`No place_id, using Google Maps search for: ${business.name} ${business.city || ""}`);
      }

      if (providers.length > 0) {
        actorInput.providers = providers;
      }
    }

    console.log(`Starting Apify actor ${actorId} for business ${business_id}, platform: ${platform}`);

    // Start actor run (async)
    const startResp = await fetch(
      `${APIFY_BASE}/acts/${actorId}/runs?token=${APIFY_API_TOKEN}`,
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

    // Return immediately; frontend will poll with run_id
    return new Response(
      JSON.stringify({
        status: "running",
        run_id: newRunId,
        message: "Actor started. Call again with run_id to check progress.",
      }),
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

async function insertReviews(supabase: any, items: any[], businessId: string, forcedPlatform?: string) {
  // Transform reviews - handle both aggregator format and Trustpilot format
  const transformed = items
    .filter(item => item.reviewText || item.reviewTitle || item.text || item.title)
    .map(item => {
      const isTrustpilotFormat = item.author || item.consumer;
      const isExpediaDedicated = forcedPlatform === "expedia" && (item.userName || item.submissionTime || item.overallSatisfaction != null);
      const platform = forcedPlatform || (isTrustpilotFormat ? "trustpilot" : normalizePlatform(item.provider || "unknown"));
      
      let rating: number;
      let text: string;
      let reviewerName: string;
      let postedAt: string;
      let reviewId: string;

      if (isExpediaDedicated) {
        // Dedicated Expedia scraper format (tri_angle/expedia-hotels-com-reviews-scraper)
        const rawRating = Number(item.overallSatisfaction ?? item.rating ?? 3);
        rating = rawRating > 5 ? Math.round(rawRating / 2) : Math.min(5, Math.max(1, Math.round(rawRating)));
        text = item.text || item.reviewText || "";
        if (item.title && text) text = `${item.title}\n\n${text}`;
        else if (item.title) text = item.title;
        reviewerName = item.userName || item.authorName || "Anonymous";
        postedAt = toSafeIsoDate(item.submissionTime || item.reviewDate || item.date);
        reviewId = item.id || item.reviewId || `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      } else if (isTrustpilotFormat) {
        rating = Math.min(5, Math.max(1, Math.round(Number(item.rating || item.stars || 3))));
        text = item.text || item.reviewText || "";
        if (item.title && text) text = `${item.title}\n\n${text}`;
        else if (item.title) text = item.title;
        reviewerName = item.author?.name || item.consumer?.displayName || item.authorName || "Anonymous";
        postedAt = toSafeIsoDate(item.date || item.createdAt || item.publishedDate);
        reviewId = item.id || `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      } else {
        rating = normalizeRating(item.reviewRating, item.provider || "");
        text = item.reviewText || "";
        if (item.reviewTitle && text) text = `${item.reviewTitle}\n\n${text}`;
        else if (item.reviewTitle) text = item.reviewTitle;
        reviewerName = item.authorName || "Anonymous";
        postedAt = toSafeIsoDate(item.reviewDate);
        reviewId = item.reviewId || `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      }

      return {
        business_id: businessId,
        platform,
        google_review_id: `apify-${platform}-${reviewId}`,
        reviewer_name: reviewerName,
        rating,
        text: text || null,
        posted_at: postedAt,
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

