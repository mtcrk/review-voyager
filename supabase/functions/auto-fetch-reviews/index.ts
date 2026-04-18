import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const APIFY_BASE = "https://api.apify.com/v2";
const ACTOR_ID = "tri_angle~hotel-review-aggregator";
const TRUSTPILOT_ACTOR_ID = "zen-studio~trustpilot-review-scraper";

const PROVIDER_MAP: Record<string, string> = {
  "booking.com": "booking", booking: "booking",
  tripadvisor: "tripadvisor",
  expedia: "hotelscom", "hotels.com": "hotelscom", hotelscom: "hotelscom", hotels: "hotelscom",
};

function normalizeRating(rating: number | string | null | undefined, provider: string): number {
  if (rating == null) return 3;
  const num = typeof rating === "string" ? parseFloat(rating) : rating;
  if (isNaN(num)) return 3;
  const p = provider.toLowerCase();
  if ((p === "booking" || p === "booking.com" || p === "expedia" || p === "hotels" || p === "hotelscom" || p === "hotels.com") && num > 5) {
    return Math.round(num / 2);
  }
  return Math.min(5, Math.max(1, Math.round(num)));
}

function toSafeIsoDate(input?: string | null): string {
  if (!input) return new Date().toISOString();
  const parsed = new Date(input);
  return Number.isNaN(parsed.getTime()) ? new Date().toISOString() : parsed.toISOString();
}

interface FetchJob {
  business: any;
  platform: string;
  actorId: string;
  actorInput: any;
}

function buildFetchJobs(biz: any, allowedPlatforms?: Set<string>): FetchJob[] {
  const jobs: FetchJob[] = [];

  // Daily fetch limit per platform — economical mode
  const MAX_PER_QUERY = 50;
  const allow = (p: string) => !allowedPlatforms || allowedPlatforms.has(p);

  // Booking.com — always use direct URL if booking_hotel_id exists
  if (biz.booking_hotel_id) {
    jobs.push({
      business: biz,
      platform: "booking",
      actorId: ACTOR_ID,
      actorInput: {
        startUrls: [{ url: `https://www.booking.com/hotel/${biz.booking_hotel_id}.html` }],
        providers: ["booking"],
        maxReviewsPerQuery: MAX_PER_QUERY,
        scrapeReviewPictures: false,
        scrapeReviewResponses: true,
      },
    });
  } else if (biz.place_id) {
    jobs.push({
      business: biz,
      platform: "booking",
      actorId: ACTOR_ID,
      actorInput: {
        startIds: [biz.place_id],
        providers: ["booking"],
        maxReviewsPerQuery: MAX_PER_QUERY,
        scrapeReviewPictures: false,
        scrapeReviewResponses: true,
      },
    });
  }

  // TripAdvisor
  if (biz.tripadvisor_id) {
    const taUrl = biz.tripadvisor_id.startsWith("http")
      ? biz.tripadvisor_id
      : `https://www.tripadvisor.com/Hotel_Review-${biz.tripadvisor_id}`;
    jobs.push({
      business: biz,
      platform: "tripadvisor",
      actorId: ACTOR_ID,
      actorInput: {
        startUrls: [{ url: taUrl }],
        providers: ["tripadvisor"],
        maxReviewsPerQuery: MAX_PER_QUERY,
        scrapeReviewPictures: false,
        scrapeReviewResponses: true,
      },
    });
  } else if (biz.place_id) {
    jobs.push({
      business: biz,
      platform: "tripadvisor",
      actorId: ACTOR_ID,
      actorInput: {
        startIds: [biz.place_id],
        providers: ["tripadvisor"],
        maxReviewsPerQuery: MAX_PER_QUERY,
        scrapeReviewPictures: false,
        scrapeReviewResponses: true,
      },
    });
  }

  // Hotels.com / Expedia
  if (biz.place_id) {
    jobs.push({
      business: biz,
      platform: "hotelscom",
      actorId: ACTOR_ID,
      actorInput: {
        startIds: [biz.place_id],
        providers: ["hotels", "expedia"],
        maxReviewsPerQuery: MAX_PER_QUERY,
        scrapeReviewPictures: false,
        scrapeReviewResponses: true,
      },
    });
  }

  // Expedia direct
  if (biz.expedia_hotel_id) {
    jobs.push({
      business: biz,
      platform: "expedia",
      actorId: ACTOR_ID,
      actorInput: {
        startUrls: [{ url: `https://www.expedia.com/h${biz.expedia_hotel_id}.Hotel-Information` }],
        providers: ["expedia"],
        maxReviewsPerQuery: MAX_PER_QUERY,
        scrapeReviewPictures: false,
        scrapeReviewResponses: true,
      },
    });
  }

  // Trustpilot
  if (biz.trustpilot_url) {
    const domain = biz.trustpilot_url.replace(/^https?:\/\/(www\.)?trustpilot\.[a-z.]+\/review\//i, "").replace(/\/.*$/, "");
    jobs.push({
      business: biz,
      platform: "trustpilot",
      actorId: TRUSTPILOT_ACTOR_ID,
      actorInput: {
        businessUrl: `https://www.trustpilot.com/review/${domain}`,
        maxResults: MAX_PER_QUERY,
      },
    });
  }

  return jobs;
}

async function runActorAndWait(actorId: string, input: any, token: string, maxWaitMs = 600000): Promise<any[]> {
  const startResp = await fetch(
    `${APIFY_BASE}/acts/${actorId}/runs?token=${token}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    }
  );

  if (!startResp.ok) {
    const errBody = await startResp.text();
    throw new Error(`Apify start failed: ${startResp.status} - ${errBody}`);
  }

  const startData = await startResp.json();
  const runId = startData.data?.id;
  if (!runId) throw new Error("No run ID returned");

  // Poll for completion
  const start = Date.now();
  while (Date.now() - start < maxWaitMs) {
    await new Promise(r => setTimeout(r, 5000));
    const statusResp = await fetch(`${APIFY_BASE}/actor-runs/${runId}?token=${token}`);
    if (!statusResp.ok) continue;
    const statusData = await statusResp.json();
    const status = statusData.data?.status;
    if (status === "SUCCEEDED") {
      const datasetId = statusData.data?.defaultDatasetId;
      if (!datasetId) return [];
      const itemsResp = await fetch(
        `${APIFY_BASE}/datasets/${datasetId}/items?token=${token}&format=json&limit=1000`
      );
      if (!itemsResp.ok) throw new Error(`Dataset fetch failed: ${itemsResp.status}`);
      return await itemsResp.json();
    }
    if (["FAILED", "ABORTED", "TIMED-OUT"].includes(status)) {
      throw new Error(`Apify run ${status}`);
    }
  }
  throw new Error("Apify run timed out");
}

function extractOwnerReply(it: any): { text: string | null; date: string | null } {
  if (Array.isArray(it.reviewResponses) && it.reviewResponses.length > 0) {
    const first = it.reviewResponses[0];
    if (typeof first === "string" && first.trim()) return { text: first.trim(), date: null };
    if (first && typeof first === "object") {
      const t = first.text || first.responseText || first.body || first.message || "";
      const d = first.date || first.responseDate || first.createdAt || null;
      if (t) return { text: String(t).trim(), date: d };
    }
  }
  const candidates = [
    it.responseFromOwnerText, it.ownerResponse, it.ownerReply, it.replyText,
    it.managementResponse, it.hotelResponse, it.hotelReply, it.reply,
    it.response, it.responseText, it.replyContent,
  ];
  for (const c of candidates) {
    if (typeof c === "string" && c.trim()) return { text: c.trim(), date: null };
    if (c && typeof c === "object") {
      const t = c.text || c.body || c.message || c.content || "";
      const d = c.date || c.createdAt || c.responseDate || null;
      if (t) return { text: String(t).trim(), date: d };
    }
  }
  return { text: null, date: null };
}

function transformItems(items: any[], businessId: string, platform: string): any[] {
  return items
    .filter(item => item.reviewText || item.reviewTitle || item.text || item.title)
    .map(item => {
      const isTrustpilotFormat = item.author || item.consumer;
      const resolvedPlatform = isTrustpilotFormat ? "trustpilot" : (PROVIDER_MAP[item.provider?.toLowerCase()] || platform);

      let rating: number;
      let text: string;
      let reviewerName: string;
      let postedAt: string;
      let reviewId: string;

      if (isTrustpilotFormat) {
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
      const ownerReply = reply.text;
      const ownerReplyAt = reply.date ? toSafeIsoDate(reply.date) : (ownerReply ? postedAt : null);

      return {
        business_id: businessId,
        platform: resolvedPlatform,
        google_review_id: `apify-${resolvedPlatform}-${reviewId}`,
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
}

async function insertNewReviews(supabase: any, reviews: any[], businessId: string) {
  if (reviews.length === 0) return { inserted: 0, newReviews: [] };

  // Batch check existing
  const existingIds = new Set<string>();
  const allIds = reviews.map(r => r.google_review_id);
  const BATCH = 200;
  for (let i = 0; i < allIds.length; i += BATCH) {
    const batch = allIds.slice(i, i + BATCH);
    const { data: existing } = await supabase
      .from("reviews")
      .select("google_review_id")
      .eq("business_id", businessId)
      .in("google_review_id", batch);
    if (existing) {
      for (const row of existing) existingIds.add(row.google_review_id);
    }
  }

  const newReviews = reviews.filter(r => !existingIds.has(r.google_review_id));
  let inserted = 0;
  const insertedReviews: any[] = [];

  const INSERT_BATCH = 100;
  for (let i = 0; i < newReviews.length; i += INSERT_BATCH) {
    const batch = newReviews.slice(i, i + INSERT_BATCH);
    const { data, error } = await supabase.from("reviews").insert(batch).select("id, reviewer_name, rating, text, suggested_reply, platform");
    if (error) {
      console.error(`Insert error:`, error.message);
    } else if (data) {
      inserted += data.length;
      insertedReviews.push(...data);
    }
  }

  return { inserted, newReviews: insertedReviews };
}

async function sendNotification(supabaseUrl: string, serviceKey: string, businessId: string, reviews: any[]) {
  if (reviews.length === 0) return;

  try {
    const resp = await fetch(`${supabaseUrl}/functions/v1/notify-new-review`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${serviceKey}`,
      },
      body: JSON.stringify({ business_id: businessId, reviews }),
    });
    const result = await resp.json();
    console.log(`Notification sent for ${reviews.length} reviews:`, result);
  } catch (err: any) {
    console.error(`Failed to send notification for business ${businessId}:`, err.message);
  }
}

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

    // Get all businesses with any platform configured
    const { data: businesses, error: bizError } = await supabase
      .from("businesses")
      .select("id, user_id, place_id, name, booking_hotel_id, tripadvisor_id, trustpilot_url, hotelscom_url, expedia_hotel_id, city")
      .or("place_id.not.is.null,booking_hotel_id.not.is.null,tripadvisor_id.not.is.null,trustpilot_url.not.is.null,expedia_hotel_id.not.is.null");

    if (bizError) throw bizError;
    if (!businesses || businesses.length === 0) {
      return new Response(JSON.stringify({ message: "No businesses with platform IDs" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const results: any[] = [];
    // Group fetch results by user_id for consolidated reporting
    const userReports: Map<string, Array<{
      business_id: string;
      business_name: string;
      city: string | null;
      new_reviews: any[];
      platform_results: { platform: string; fetched: number; inserted: number; error?: string }[];
    }>> = new Map();

    for (const biz of businesses) {
      const jobs = buildFetchJobs(biz);
      const allNewReviews: any[] = [];
      const platformResults: { platform: string; fetched: number; inserted: number; error?: string }[] = [];

      for (const job of jobs) {
        try {
          console.log(`[${biz.name}] Fetching ${job.platform} reviews...`);
          const items = await runActorAndWait(job.actorId, job.actorInput, APIFY_API_TOKEN);
          const transformed = transformItems(items, biz.id, job.platform);
          const { inserted, newReviews } = await insertNewReviews(supabase, transformed, biz.id);

          allNewReviews.push(...newReviews);
          platformResults.push({ platform: job.platform, fetched: items.length, inserted });

          results.push({ business: biz.name, platform: job.platform, fetched: items.length, inserted });
          console.log(`[${biz.name}] ${job.platform}: ${items.length} fetched, ${inserted} new`);
        } catch (err: any) {
          platformResults.push({ platform: job.platform, fetched: 0, inserted: 0, error: err.message });
          results.push({ business: biz.name, platform: job.platform, error: err.message });
          console.error(`[${biz.name}] ${job.platform} error:`, err.message);
        }
      }

      // Per-review instant notifications (existing behavior)
      if (allNewReviews.length > 0) {
        await sendNotification(supabaseUrl, supabaseServiceKey, biz.id, allNewReviews);
      }

      // Collect for consolidated user-level report
      const hasErrors = platformResults.some((p) => p.error);
      if (allNewReviews.length > 0 || hasErrors) {
        if (!userReports.has(biz.user_id)) userReports.set(biz.user_id, []);
        userReports.get(biz.user_id)!.push({
          business_id: biz.id,
          business_name: biz.name,
          city: biz.city,
          new_reviews: allNewReviews,
          platform_results: platformResults,
        });
      }
    }

    // Send ONE consolidated email per user (covers all their locations)
    for (const [userId, locations] of userReports.entries()) {
      try {
        await fetch(`${supabaseUrl}/functions/v1/notify-fetch-summary`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${supabaseServiceKey}`,
          },
          body: JSON.stringify({ user_id: userId, locations }),
        });
        console.log(`Consolidated report sent to user ${userId} (${locations.length} locations)`);
      } catch (err: any) {
        console.error(`Consolidated report failed for user ${userId}:`, err.message);
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
