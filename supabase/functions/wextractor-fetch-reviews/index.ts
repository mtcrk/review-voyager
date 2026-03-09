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

const FETCH_ALL_LIMITS: Record<string, number> = {
  booking: 2000,
  tripadvisor: 500,
  trustpilot: 1000,
  hotelscom: 1000,
};

async function fetchPage(apiBaseUrl: string, offset: number): Promise<WextractorResponse> {
  const url = `${apiBaseUrl}&offset=${offset}`;
  const resp = await fetch(url);
  if (!resp.ok) {
    const errorBody = await resp.text().catch(() => "");
    if (resp.status === 403) {
      throw new Error("Wextractor erişimi reddedildi (403). Büyük olasılıkla kredi limitiniz doldu veya plan erişimi yok.");
    }
    if (resp.status === 404) {
      throw new Error("Kaynak bulunamadı (404). Platform ID/URL formatını kontrol edin.");
    }
    if (resp.status === 400 && errorBody.includes("BAD_PLACE_ID")) {
      throw new Error("Geçersiz platform ID (BAD_PLACE_ID). TripAdvisor için URL'deki d ile başlayan sayıyı (örn: d4291665 → 4291665) kaydedin.");
    }
    throw new Error(`Wextractor API error: ${resp.status}${errorBody ? ` - ${errorBody}` : ""}`);
  }
  return resp.json();
}

function toSafeIsoDate(input?: string): string {
  if (!input) return new Date().toISOString();
  const parsed = new Date(input);
  return Number.isNaN(parsed.getTime()) ? new Date().toISOString() : parsed.toISOString();
}

function getPlatformId(business: any, platform: string): string | null {
  switch (platform) {
    case "booking":
      return business.booking_hotel_id;
    case "tripadvisor": {
      const raw = business.tripadvisor_id;
      if (!raw) return null;
      const slugMatch = String(raw).match(/(?:Hotel|Restaurant|Attraction)_Review-g\d+-d(\d+)/i);
      if (slugMatch) return slugMatch[1];
      const dMatch = String(raw).match(/-d(\d+)/i);
      if (dMatch) return dMatch[1];
      return String(raw).trim();
    }
    case "trustpilot":
      return business.trustpilot_url;
    case "hotelscom":
      return business.hotelscom_url;
    default:
      return null;
  }
}

function buildApiUrl(platform: string, platformId: string, token: string): string | null {
  switch (platform) {
    case "booking":
      return `https://wextractor.com/api/v1/reviews/booking?id=${encodeURIComponent(platformId)}&auth_token=${token}`;
    case "tripadvisor":
      return `https://wextractor.com/api/v1/reviews/tripadvisor?id=${encodeURIComponent(platformId)}&auth_token=${token}`;
    case "trustpilot":
      return `https://wextractor.com/api/v1/reviews/trustpilot?id=${encodeURIComponent(platformId)}&auth_token=${token}`;
    case "hotelscom":
      return `https://wextractor.com/api/v1/reviews/expedia?id=${encodeURIComponent(platformId)}&auth_token=${token}`;
    default:
      return null;
  }
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

    const { business_id, platform = "booking", offset = 0, fetch_all = false } = await req.json();

    if (!business_id) {
      return new Response(
        JSON.stringify({ error: "business_id is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data: business, error: bizError } = await supabaseAuth
      .from("businesses")
      .select("id, booking_hotel_id, tripadvisor_id, trustpilot_url, hotelscom_url, name")
      .eq("id", business_id)
      .maybeSingle();

    if (bizError || !business) {
      return new Response(
        JSON.stringify({ error: "Business not found or access denied" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const platformId = getPlatformId(business, platform);
    if (!platformId) {
      const platformNames: Record<string, string> = {
        booking: "Booking.com",
        tripadvisor: "TripAdvisor",
        trustpilot: "Trustpilot",
        hotelscom: "Hotels.com",
      };
      return new Response(
        JSON.stringify({ error: `${platformNames[platform] || platform} ID/URL henüz yapılandırılmamış.` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const apiBaseUrl = buildApiUrl(platform, platformId, WEXTRACTOR_API_TOKEN);
    if (!apiBaseUrl) {
      return new Response(
        JSON.stringify({ error: `Desteklenmeyen platform: ${platform}` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Collect all reviews - either single page or all pages
    let allReviews: WextractorReview[] = [];
    let totalAvailable: number | undefined;
    let averageRating: string | undefined;

    if (fetch_all) {
      const maxReviews = FETCH_ALL_LIMITS[platform] || 1000;
      console.log(`Fetching first page to get total count (limit: ${maxReviews})...`);
      const firstPage = await fetchPage(apiBaseUrl, 0);
      totalAvailable = firstPage.totals?.review_count;
      averageRating = firstPage.totals?.average_rating;
      allReviews.push(...(firstPage.reviews || []));
      
      const pageSize = firstPage.reviews?.length || 10;
      
      if (totalAvailable && totalAvailable > pageSize) {
        const cappedTotal = Math.min(totalAvailable, maxReviews);
        const totalPages = Math.ceil(cappedTotal / pageSize);
        console.log(`Total reviews: ${totalAvailable}, capped to: ${cappedTotal}, pages: ${totalPages}. Fetching in parallel batches...`);
        
        const BATCH_SIZE = 5;
        for (let batchStart = 1; batchStart < totalPages; batchStart += BATCH_SIZE) {
          if (allReviews.length >= maxReviews) break;
          const batchEnd = Math.min(batchStart + BATCH_SIZE, totalPages);
          const promises = [];
          for (let page = batchStart; page < batchEnd; page++) {
            promises.push(
              fetchPage(apiBaseUrl, page * pageSize).catch(err => {
                console.error(`Failed to fetch page ${page}:`, err.message);
                return { reviews: [] } as WextractorResponse;
              })
            );
          }
          const results = await Promise.all(promises);
          for (const result of results) {
            allReviews.push(...(result.reviews || []));
          }
          console.log(`Fetched batch ${batchStart}-${batchEnd - 1}, total reviews so far: ${allReviews.length}`);
        }
        // Trim to limit
        if (allReviews.length > maxReviews) {
          allReviews = allReviews.slice(0, maxReviews);
        }
      }
    } else {
      console.log(`Fetching ${platform} reviews for business ${business_id}, offset ${offset}`);
      const pageData = await fetchPage(apiBaseUrl, offset);
      allReviews = pageData.reviews || [];
      totalAvailable = pageData.totals?.review_count;
      averageRating = pageData.totals?.average_rating;
    }

    console.log(`Total reviews fetched: ${allReviews.length}`);

    // Transform all reviews first
    const transformedReviews = allReviews.map((review) => {
      const reviewerName = review.reviewer || review.author || review.author_name || "Anonymous";
      const reviewDate = review.datetime || review.date;
      const posText = review.pros || review.positive || "";
      const negText = review.cons || review.negative || "";
      const reviewId = review.id || `${platform}-${platformId}-${reviewerName}-${reviewDate}`;

      let normalizedRating = typeof review.rating === "string" ? parseFloat(review.rating) : (review.rating || 3);
      if (platform === "booking" && normalizedRating > 5) {
        normalizedRating = Math.round(normalizedRating / 2);
      }

      let reviewText = review.text || "";
      if (platform === "booking") {
        const parts: string[] = [];
        if (posText) parts.push(`👍 ${posText}`);
        if (negText) parts.push(`👎 ${negText}`);
        if (parts.length > 0) reviewText = parts.join("\n\n");
      }
      if (review.title && reviewText) reviewText = `${review.title}\n\n${reviewText}`;
      else if (review.title) reviewText = review.title;

      return {
        business_id,
        platform,
        google_review_id: reviewId,
        reviewer_name: reviewerName,
        rating: normalizedRating,
        text: reviewText || null,
        posted_at: toSafeIsoDate(reviewDate),
        status: "pending_reply",
        sentiment: normalizedRating >= 4 ? "positive" : normalizedRating >= 3 ? "neutral" : "negative",
      };
    });

    // Batch check existing reviews (query in chunks of 200)
    const existingIds = new Set<string>();
    const allGoogleIds = transformedReviews.map(r => r.google_review_id);
    const CHECK_BATCH = 200;
    for (let i = 0; i < allGoogleIds.length; i += CHECK_BATCH) {
      const batch = allGoogleIds.slice(i, i + CHECK_BATCH);
      const { data: existingRows } = await supabase
        .from("reviews")
        .select("google_review_id")
        .eq("business_id", business_id)
        .eq("platform", platform)
        .in("google_review_id", batch);
      if (existingRows) {
        for (const row of existingRows) {
          existingIds.add(row.google_review_id!);
        }
      }
    }

    const newReviews = transformedReviews.filter(r => !existingIds.has(r.google_review_id));
    const skippedCount = transformedReviews.length - newReviews.length;
    let insertedCount = 0;

    // Batch insert in chunks of 100
    const INSERT_BATCH = 100;
    for (let i = 0; i < newReviews.length; i += INSERT_BATCH) {
      const batch = newReviews.slice(i, i + INSERT_BATCH);
      const { error: insertError, data: inserted } = await supabase
        .from("reviews")
        .insert(batch)
        .select("id");

      if (insertError) {
        console.error(`Batch insert error at ${i}:`, insertError.message);
      } else {
        insertedCount += (inserted?.length || 0);
      }
    }
    console.log(`Done: ${insertedCount} inserted, ${skippedCount} skipped`);

    // Log success
    await supabase.from("integration_logs").insert({
      business_id,
      provider: "wextractor",
      action: `${platform}_reviews_fetch`,
      status: "success",
      meta: {
        total_fetched: allReviews.length,
        inserted: insertedCount,
        skipped: skippedCount,
        offset: fetch_all ? "all" : offset,
        total_available: totalAvailable,
      },
    });

    return new Response(
      JSON.stringify({
        success: true,
        fetched: allReviews.length,
        inserted: insertedCount,
        skipped: skippedCount,
        total_available: totalAvailable || null,
        average_rating: averageRating || null,
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
