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
const EXPEDIA_ACTOR_ID = "shahidirfan~expedia-reviews-scraper";
const TRIPCOM_ACTOR_ID = "shahidirfan~trip-com-hotel-reviews-scraper";
const BOOKING_ACTOR_ID = "voyager~booking-reviews-scraper";

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

// Returns the rating in its NATIVE scale (1-5 for Google/TripAdvisor/Trustpilot, 1-10 for Booking/Expedia/Hotels/Trip.com)
function normalizeRating(rating: number | string | null | undefined, provider: string): number {
  const p = provider.toLowerCase();
  const isTenScale = p === "booking" || p === "booking.com" || p === "expedia" ||
    p === "hotels" || p === "hotelscom" || p === "hotels.com" ||
    p === "tripcom" || p === "trip.com";
  const max = isTenScale ? 10 : 5;
  const fallback = isTenScale ? 6 : 3;
  if (rating == null) return fallback;
  const num = typeof rating === "string" ? parseFloat(rating) : rating;
  if (isNaN(num)) return fallback;
  return Math.min(max, Math.max(1, Math.round(num)));
}

// Sentiment based on the platform's native scale
function ratingToSentiment(rating: number, platform: string): string {
  const p = platform.toLowerCase();
  const isTenScale = p === "booking" || p === "expedia" || p === "hotelscom" || p === "tripcom";
  if (isTenScale) {
    if (rating >= 8) return "positive";
    if (rating >= 6) return "neutral";
    return "negative";
  }
  if (rating >= 4) return "positive";
  if (rating >= 3) return "neutral";
  return "negative";
}

function normalizePlatform(provider: string): string {
  return PROVIDER_MAP[provider.toLowerCase()] || provider.toLowerCase();
}

function toSafeIsoDate(input?: string | null): string {
  if (!input) return new Date().toISOString();
  const parsed = new Date(input);
  return Number.isNaN(parsed.getTime()) ? new Date().toISOString() : parsed.toISOString();
}

function sanitizeStoredUrl(input?: string | null): string | null {
  if (!input) return null;
  const trimmed = input.trim();
  if (!trimmed) return null;
  return trimmed.split("#")[0].split("?")[0];
}

function extractExpediaHotelId(value?: string | null): string | null {
  const sanitized = sanitizeStoredUrl(value);
  if (!sanitized) return null;
  if (/^\d{4,}$/.test(sanitized)) return sanitized;

  const match = sanitized.match(/h(\d{4,})\.Hotel-Information/i)
    || sanitized.match(/[?&]hotelId=(\d{4,})/i)
    || sanitized.match(/\/hotels?\/(\d{4,})/i);

  return match?.[1] ?? null;
}

async function resolveExpediaUrl(business: { name: string; city?: string | null; expedia_hotel_id?: string | null }): Promise<string | null> {
  const storedValue = business.expedia_hotel_id?.trim();
  if (!storedValue) return null;

  if (/^https?:\/\/(?:www\.)?expedia\./i.test(storedValue) || /^https?:\/\/expe\.app\.link\//i.test(storedValue)) {
    return sanitizeStoredUrl(storedValue);
  }

  const hotelId = extractExpediaHotelId(storedValue);
  if (!hotelId) return null;

  const firecrawlApiKey = Deno.env.get("FIRECRAWL_API_KEY");
  if (!firecrawlApiKey) return null;

  const searchQueries = [
    `${business.name} ${business.city || ""} site:expedia.com ${hotelId}`.trim(),
    `${business.name} ${business.city || ""} site:expedia.com`.trim(),
  ];

  for (const query of searchQueries) {
    try {
      const response = await fetch("https://api.firecrawl.dev/v1/search", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${firecrawlApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query, limit: 5 }),
      });

      if (!response.ok) {
        console.error(`Firecrawl Expedia search failed: ${response.status}`);
        continue;
      }

      const data = await response.json();
      for (const item of data.data || []) {
        const candidateUrl = sanitizeStoredUrl(item.url);
        if (!candidateUrl || !/^https?:\/\/(?:www\.)?expedia\./i.test(candidateUrl)) continue;

        const candidateHotelId = extractExpediaHotelId(candidateUrl);
        if (candidateHotelId === hotelId) {
          return candidateUrl;
        }
      }
    } catch (error) {
      console.error("Error resolving Expedia URL:", error);
    }
  }

  return null;
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

    // Detect service-role calls (used by auto-fetch-reviews cron) and skip user auth.
    const bearer = authHeader.replace(/^Bearer\s+/i, "").trim();
    const isServiceRole = bearer === supabaseServiceKey;

    const supabaseAuth = isServiceRole
      ? createClient(supabaseUrl, supabaseServiceKey)
      : createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
          global: { headers: { Authorization: authHeader } },
        });
    if (!isServiceRole) {
      const { data: { user }, error: authError } = await supabaseAuth.auth.getUser();
      if (authError || !user) {
        return new Response(
          JSON.stringify({ error: "Unauthorized" }),
          { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    const { business_id, platform = "all", run_id, force = false } = await req.json();

    if (!business_id) {
      return new Response(
        JSON.stringify({ error: "business_id is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // 🧠 GÜÇLENDİRİLMİŞ smart skip: cron (service-role) çağrılarında,
    // son 48 saat içinde bu işletme-platform için BAŞARILI BİR SCRAPE
    // yapıldıysa → tekrar scrape ETME. (Eskiden sadece 0-yeni-yorum durumda
    // skip ediyordu; bu Apify maliyetini patlatıyordu.)
    // Manuel UI tetiklemeleri (force=true veya user-token) etkilenmez.
    if (!run_id && isServiceRole && !force) {
      const cutoff = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();
      const { data: lastLogs } = await supabase
        .from("integration_logs")
        .select("created_at, meta, status")
        .eq("business_id", business_id)
        .eq("provider", "apify")
        .eq("action", `${platform}_reviews_fetch`)
        .eq("status", "success")
        .gte("created_at", cutoff)
        .order("created_at", { ascending: false })
        .limit(1);

      const lastRun = lastLogs?.[0];
      if (lastRun) {
        console.log(
          `⏭️ Skipping ${platform} for business ${business_id} — last successful run at ${lastRun.created_at} (within 48h cooldown).`
        );
        await supabase.from("integration_logs").insert({
          business_id,
          provider: "apify",
          action: `${platform}_reviews_fetch`,
          status: "skipped",
          meta: {
            reason: "smart_skip_within_48h",
            last_run_at: lastRun.created_at,
          },
        });
        notifyAdmin(business_id, platform, 0, 0, 0, 0, undefined, "skipped", {
          reason: "smart_skip_within_48h",
          triggered_by: "service-role (cron/n8n)",
        }).catch((e) => console.error("notifyAdmin skip failed:", e));
        return new Response(
          JSON.stringify({
            success: true,
            skipped: true,
            reason: "smart_skip_within_48h",
            last_run_at: lastRun.created_at,
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

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

      const actorMessage = (items.find((item: any) => typeof item?.message === "string") as any)?.message;
      const hasReviewPayload = items.some((item: any) =>
        item.reviewText || item.reviewTitle || item.text || item.title ||
        item.reviewOriginalText || item.reviewTranslatedText || item.review_text ||
        item.reviewTextLiked || item.reviewTextDisliked || item.likedText || item.dislikedText
      );

      if (items.length > 0 && !hasReviewPayload && actorMessage) {
        return new Response(
          JSON.stringify({
            success: false,
            status: "failed",
            run_id,
            message: actorMessage,
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const cappedItems = platform === "booking"
        ? items.slice(0, 1000)
        : (platform === "hotelscom" || platform === "expedia" || platform === "tripcom")
          ? items.slice(0, 200)
          : items;
      const forcedPlatform = (platform === "hotelscom" || platform === "expedia" || platform === "trustpilot" || platform === "tripcom" || platform === "booking") ? platform : undefined;
      const result = await insertReviews(supabase, cappedItems, business_id, forcedPlatform);

      await logSuccess(supabase, business_id, platform, items.length, result.inserted, result.updated, result.skipped);
      // Fire-and-forget admin notification
      notifyAdmin(business_id, platform, items.length, result.inserted, result.updated, result.skipped, run_id).catch(
        (e) => console.error("notifyAdmin failed:", e)
      );

      // Fire-and-forget consolidated summary email (only if new reviews inserted)
      if (result.inserted > 0) {
        (async () => {
          try {
            const platformName = forcedPlatform || (platform === "all" ? "booking" : platform);
            const { data: newReviews } = await supabase
              .from("reviews")
              .select("id, reviewer_name, rating, text, sentiment, posted_at, platform")
              .eq("business_id", business_id)
              .eq("platform", platformName)
              .order("created_at", { ascending: false })
              .limit(result.inserted);

            if (newReviews && newReviews.length > 0) {
              await fetch(`${supabaseUrl}/functions/v1/notify-fetch-summary`, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${supabaseServiceKey}`,
                },
                body: JSON.stringify({
                  business_id,
                  new_reviews: newReviews,
                  platform_results: [{
                    platform: platformName,
                    fetched: items.length,
                    inserted: result.inserted,
                  }],
                }),
              });
              console.log(`Summary email triggered for ${newReviews.length} new ${platformName} reviews`);
            }
          } catch (e) {
            console.error("notify-fetch-summary trigger failed:", e);
          }
        })();
      }

      return new Response(
        JSON.stringify({ success: true, ...result, fetched: items.length }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get business
    const { data: business, error: bizError } = await supabaseAuth
      .from("businesses")
      .select("id, place_id, name, city, booking_hotel_id, tripadvisor_id, trustpilot_url, hotelscom_url, expedia_hotel_id, tripcom_hotel_id")
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
        maxItems: 50,
        maxReviewsPerHotel: 50,
        sortBy: "newest_first",
      };
      console.log(`Using dedicated Hotels.com scraper for hotel ID: ${hotelId}`);
    } else if (platform === "expedia" && business.expedia_hotel_id) {
      // Use shahidirfan/expedia-reviews-scraper - works reliably with residential proxies
      actorId = EXPEDIA_ACTOR_ID;
      const expediaUrl = await resolveExpediaUrl(business);
      if (!expediaUrl) {
        return new Response(
          JSON.stringify({ error: "Expedia URL bulunamadı. Lütfen Expedia sayfasının tam URL'sini yeniden kaydedin." }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      actorInput = {
        startUrl: expediaUrl,
        results_wanted: 50,
        max_pages: 5,
        proxyConfiguration: { useApifyProxy: true, apifyProxyGroups: ["RESIDENTIAL"] },
      };
      console.log(`Using shahidirfan/expedia-reviews-scraper for: ${expediaUrl}`);
    } else if (platform === "tripcom") {
      // Trip.com requires dedicated actor - shahidirfan/trip-com-hotel-reviews-scraper
      if (!business.tripcom_hotel_id) {
        return new Response(
          JSON.stringify({ error: "Trip.com hotel ID bulunamadı. Lütfen önce Trip.com URL'sini ekleyin." }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      actorId = TRIPCOM_ACTOR_ID;
      actorInput = {
        hotelId: parseInt(business.tripcom_hotel_id, 10),
        results_wanted: 50,
      };
      console.log(`Using Trip.com scraper for hotel ID: ${business.tripcom_hotel_id}`);
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
        maxResults: 50,
      };
      console.log(`Using dedicated Trustpilot scraper for: ${businessUrl}`);
    } else if (platform === "booking" && business.booking_hotel_id) {
      // Booking.com — use dedicated voyager scraper (much more reliable than aggregator)
      const bookingUrl = `https://www.booking.com/hotel/${business.booking_hotel_id}.html`;
      actorId = BOOKING_ACTOR_ID;
      // voyager~booking-reviews-scraper supports several limit fields; set them all to be safe
      actorInput = {
        startUrls: [{ url: bookingUrl }],
        maxReviewsPerHotel: 50,
        maxReviews: 50,
        maxItems: 50,
        sortBy: "newest_first",
      };
      console.log(`Using dedicated Booking scraper for: ${bookingUrl}`);
    } else {
      // Use the general hotel-review-aggregator
      const providers = PLATFORM_TO_APIFY_PROVIDER[platform] || [];
      actorInput = {
        maxReviewsPerQuery: 50,
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

    // Notify admin that a new Apify run was triggered (cost event!)
    notifyAdmin(business_id, platform, 0, 0, 0, 0, newRunId, "success", {
      reason: "actor_started",
      triggered_by: isServiceRole ? "service-role (cron/n8n)" : "user",
    }).catch((e) => console.error("notifyAdmin start failed:", e));

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
    try {
      const body = await req.clone().json().catch(() => ({}));
      const bid = body?.business_id || "unknown";
      const plat = body?.platform || "unknown";
      notifyAdmin(bid, plat, 0, 0, 0, 0, undefined, "error", {
        error: errorMessage,
      }).catch(() => {});
    } catch (_) { /* noop */ }
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

async function insertReviews(supabase: any, items: any[], businessId: string, forcedPlatform?: string) {
  // Transform reviews - handle multiple actor formats
  const transformed = items
    .filter(item =>
      item.reviewText || item.reviewTitle || item.text || item.title ||
      item.reviewOriginalText || item.reviewTranslatedText || item.review_text ||
      item.reviewTextLiked || item.reviewTextDisliked || item.likedText || item.dislikedText
    )
    .map(item => {
      const isTrustpilotFormat = item.author || item.consumer;
      const isExpediaDedicated = forcedPlatform === "expedia" && (
        item.review_text || item.traveler_name || item.published_date || item.hotel_id
      );
      const isTripcomDedicated = forcedPlatform === "tripcom";
      const isBookingDedicated = forcedPlatform === "booking";
      const platform = forcedPlatform || (isTrustpilotFormat ? "trustpilot" : normalizePlatform(item.provider || "unknown"));

      let rating: number;
      let text: string;
      let reviewerName: string;
      let postedAt: string;
      let reviewId: string;
      let ownerReply: string | null = null;
      let ownerReplyAt: string | null = null;

      // Generic owner-response extractor (covers most actor shapes)
      const extractOwnerReply = (it: any): { text: string | null; date: string | null } => {
        // Aggregator: reviewResponses is an array of strings or objects
        if (Array.isArray(it.reviewResponses) && it.reviewResponses.length > 0) {
          const first = it.reviewResponses[0];
          if (typeof first === "string" && first.trim()) return { text: first.trim(), date: null };
          if (first && typeof first === "object") {
            const t = first.text || first.responseText || first.body || first.message || "";
            const d = first.date || first.responseDate || first.createdAt || null;
            if (t) return { text: String(t).trim(), date: d };
          }
        }
        // Common single-field variants across actors
        const candidates = [
          it.responseFromOwnerText, it.ownerResponse, it.ownerReply, it.replyText,
          it.managementResponse, it.hotelResponse, it.hotelReply, it.reply,
          it.response, it.responseText, it.replyContent,
          // Booking voyager scraper
          it.propertyResponse, it.propertyReply, it.hostResponse, it.hostReply,
          // TripAdvisor / Hotels.com / Expedia variants
          it.managementResponseText, it.responseFromManagement, it.hotelResponseText,
          it.responseFromHotel, it.responseFromProperty,
        ];
        for (const c of candidates) {
          if (typeof c === "string" && c.trim()) return { text: c.trim(), date: null };
          if (c && typeof c === "object") {
            const t = c.text || c.body || c.message || c.content || "";
            const d = c.date || c.createdAt || c.responseDate || null;
            if (t) return { text: String(t).trim(), date: d };
          }
        }
        const dateCandidates = [it.responseFromOwnerDate, it.ownerResponseDate, it.replyDate, it.responseDate];
        const d = dateCandidates.find(x => typeof x === "string" && x);
        return { text: null, date: d || null };
      };

      if (isBookingDedicated) {
        // voyager/booking-reviews-scraper — rating is 0-10 scale
        const rawRating = Number(item.rating ?? item.reviewScore ?? item.reviewRating ?? 6);
        rating = rawRating > 5 ? Math.round(rawRating / 2) : Math.min(5, Math.max(1, Math.round(rawRating)));
        const liked = item.reviewTextLiked || item.likedText || "";
        const disliked = item.reviewTextDisliked || item.dislikedText || "";
        const title = item.reviewTitle || item.title || "";
        const parts: string[] = [];
        if (title) parts.push(title);
        if (liked) parts.push(`👍 ${liked}`);
        if (disliked) parts.push(`👎 ${disliked}`);
        if (!parts.length && (item.reviewText || item.text)) parts.push(item.reviewText || item.text);
        text = parts.join("\n\n");
        reviewerName = item.userName || item.reviewerName || item.authorName || item.guestName || "Anonymous";
        postedAt = toSafeIsoDate(item.reviewDate || item.date || item.publishedDate);
        reviewId = item.reviewId || item.id || `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      } else if (isTripcomDedicated) {
        // Trip.com scraper format (shahidirfan/trip-com-hotel-reviews-scraper) — rating is 0-10
        const rawRating = Number(item.reviewRating ?? 6);
        rating = rawRating > 5 ? Math.round(rawRating / 2) : Math.min(5, Math.max(1, Math.round(rawRating)));
        const original = item.reviewOriginalText || "";
        const translated = item.reviewTranslatedText || "";
        text = translated && translated !== original ? `${original}\n\n[Translated]\n${translated}` : (original || translated || "");
        reviewerName = item.reviewerName || "Anonymous";
        postedAt = toSafeIsoDate(item.reviewDate);
        reviewId = item.reviewId ? String(item.reviewId) : `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      } else if (isExpediaDedicated) {
        // Dedicated Expedia scraper format (shahidirfan/expedia-reviews-scraper) — rating 0-10
        const rawRating = Number(item.rating ?? item.overallSatisfaction ?? 6);
        rating = rawRating > 5 ? Math.round(rawRating / 2) : Math.min(5, Math.max(1, Math.round(rawRating)));
        text = item.review_text || item.text || item.reviewText || "";
        if (item.title && text) text = `${item.title}\n\n${text}`;
        else if (item.title) text = item.title;
        reviewerName = item.traveler_name || item.userName || item.authorName || "Anonymous";
        postedAt = toSafeIsoDate(item.published_date || item.submissionTime || item.reviewDate || item.date);
        reviewId = item.review_id || item.id || item.reviewId || `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
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

      const reply = extractOwnerReply(item);
      ownerReply = reply.text;
      ownerReplyAt = reply.date ? toSafeIsoDate(reply.date) : (ownerReply ? postedAt : null);

      return {
        business_id: businessId,
        platform,
        google_review_id: `apify-${platform}-${reviewId}`,
        reviewer_name: reviewerName,
        rating,
        text: text || null,
        posted_at: postedAt,
        status: ownerReply ? "replied" : "pending_reply",
        sentiment: rating >= 4 ? "positive" : rating >= 3 ? "neutral" : "negative",
        approved_reply: ownerReply,
        replied_at: ownerReplyAt,
        reply_source: ownerReply ? "platform" : null,
      };
    });

  // Batch check existing reviews
  const existingReviews = new Map<string, {
    id: string;
    approved_reply: string | null;
    reply_source: string | null;
    replied_at: string | null;
    status: string | null;
  }>();
  const allIds = transformed.map(r => r.google_review_id);
  const CHECK_BATCH = 200;
  for (let i = 0; i < allIds.length; i += CHECK_BATCH) {
    const batch = allIds.slice(i, i + CHECK_BATCH);
    const { data: existing } = await supabase
      .from("reviews")
      .select("id, google_review_id, approved_reply, reply_source, replied_at, status")
      .eq("business_id", businessId)
      .in("google_review_id", batch);
    if (existing) {
      for (const row of existing) {
        if (row.google_review_id) {
          existingReviews.set(row.google_review_id, row);
        }
      }
    }
  }

  const newReviews: typeof transformed = [];
  const replyUpdates: Array<{
    id: string;
    approved_reply: string;
    replied_at: string | null;
    reply_source: "platform";
    status: "replied";
  }> = [];

  for (const review of transformed) {
    const existing = existingReviews.get(review.google_review_id);

    if (!existing) {
      newReviews.push(review);
      continue;
    }

    const canApplyPlatformReply = Boolean(review.approved_reply) && (!existing.approved_reply || existing.reply_source === "platform");
    const replyChanged = canApplyPlatformReply && (
      existing.approved_reply !== review.approved_reply ||
      existing.reply_source !== "platform" ||
      existing.status !== "replied" ||
      existing.replied_at !== review.replied_at
    );

    if (replyChanged && review.approved_reply) {
      replyUpdates.push({
        id: existing.id,
        approved_reply: review.approved_reply,
        replied_at: review.replied_at,
        reply_source: "platform",
        status: "replied",
      });
    }
  }

  let inserted = 0;
  let updated = 0;

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

  // Per-row update for existing reviews (upsert would null-out business_id)
  for (const u of replyUpdates) {
    const { error } = await supabase
      .from("reviews")
      .update({
        approved_reply: u.approved_reply,
        replied_at: u.replied_at,
        reply_source: u.reply_source,
        status: u.status,
      })
      .eq("id", u.id);

    if (error) {
      console.error(`Reply update error for ${u.id}:`, error.message);
    } else {
      updated += 1;
    }
  }

  const skipped = transformed.length - newReviews.length - replyUpdates.length;
  console.log(`Done: ${inserted} inserted, ${updated} updated, ${skipped} skipped out of ${transformed.length} total`);
  return { inserted, updated, skipped, total: transformed.length };
}

async function logSuccess(
  supabase: any,
  businessId: string,
  platform: string,
  fetched: number,
  inserted: number,
  updated: number,
  skipped: number,
) {
  await supabase.from("integration_logs").insert({
    business_id: businessId,
    provider: "apify",
    action: `${platform}_reviews_fetch`,
    status: "success",
    meta: { fetched, inserted, updated, skipped },
  });
}

type NotifyStatus = "success" | "skipped" | "error";

async function notifyAdmin(
  businessId: string,
  platform: string,
  fetched: number,
  inserted: number,
  updated: number,
  skipped: number,
  runId?: string,
  status: NotifyStatus = "success",
  extra?: { reason?: string; error?: string; triggered_by?: string },
) {
  const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
  if (!RESEND_API_KEY) {
    console.warn("RESEND_API_KEY not set, skipping admin notification");
    return;
  }

  let businessName = businessId;
  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const sb = createClient(supabaseUrl, supabaseServiceKey);
    const { data } = await sb.from("businesses").select("name, city").eq("id", businessId).maybeSingle();
    if (data?.name) businessName = `${data.name}${data.city ? ` (${data.city})` : ""}`;
  } catch (_) { /* noop */ }

  const statusMeta: Record<NotifyStatus, { label: string; color: string; tag: string }> = {
    success: { label: "✅ BAŞARILI", color: "#16a34a", tag: "OK" },
    skipped: { label: "⏭️ ATLANDI", color: "#6b7280", tag: "SKIP" },
    error:   { label: "❌ HATA",     color: "#dc2626", tag: "ERR" },
  };
  const meta = statusMeta[status];
  const subject = `[Apify ${meta.tag}] ${platform} • ${businessName}${status === "success" ? ` • +${inserted} new` : ""}`;

  const rows: Array<[string, string]> = [
    ["Durum", `<span style="background:${meta.color};color:#fff;padding:2px 8px;border-radius:4px;font-size:12px;font-weight:600">${meta.label}</span>`],
    ["İşletme", businessName],
    ["Platform", platform],
  ];
  if (extra?.triggered_by) rows.push(["Tetikleyen", extra.triggered_by]);
  if (extra?.reason) rows.push(["Sebep", extra.reason]);
  if (status === "success") {
    rows.push(["Çekilen", String(fetched)]);
    rows.push(["Yeni eklenen", `<b style="color:#16a34a">${inserted}</b>`]);
    rows.push(["Güncellenen", String(updated)]);
    rows.push(["Atlanan (duplike)", String(skipped)]);
  }
  if (extra?.error) rows.push(["Hata", `<code style="color:#dc2626">${extra.error.slice(0, 400)}</code>`]);
  rows.push(["Run ID", `<span style="font-family:monospace;font-size:12px">${runId || "-"}</span>`]);
  rows.push(["Business ID", `<span style="font-family:monospace;font-size:12px">${businessId}</span>`]);
  rows.push(["Zaman", new Date().toLocaleString("tr-TR", { timeZone: "Europe/Istanbul" })]);

  const html = `
    <div style="font-family:Arial,sans-serif;max-width:560px;color:#111">
      <h2 style="margin:0 0 12px">Apify Run — ${meta.label}</h2>
      <table style="border-collapse:collapse;width:100%;font-size:14px">
        ${rows.map(([k, v]) => `<tr><td style="padding:6px 8px;background:#f6f6f7;width:35%"><b>${k}</b></td><td style="padding:6px 8px">${v}</td></tr>`).join("")}
      </table>
      <p style="margin-top:16px;color:#888;font-size:12px">VoyageRespond • Apify Monitor</p>
    </div>
  `;

  try {
    const resp = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: "VoyageRespond Monitor <notify@voyagerespond.com>",
        to: ["metecorukbasari@gmail.com"],
        subject,
        html,
      }),
    });
    if (!resp.ok) {
      const t = await resp.text();
      console.error("Resend admin notify failed:", resp.status, t);
    } else {
      console.log(`✉️ Admin notified [${status}]:`, platform, businessName);
    }
  } catch (e) {
    console.error("Resend admin notify error:", e);
  }
}

