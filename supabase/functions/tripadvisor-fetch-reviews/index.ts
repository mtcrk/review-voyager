import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const APIFY_BASE = "https://api.apify.com/v2";
const ACTOR_ID = "maxcopell~tripadvisor-reviews";

interface TripAdvisorReview {
  id?: string;
  title?: string;
  text?: string;
  rating?: number;
  publishedDate?: string;
  lang?: string;
  user?: {
    username?: string;
    name?: string;
    firstName?: string;
  };
  ownerResponse?: { text?: string; publishedDate?: string } | string | null;
  responseFromOwnerText?: string | null;
  responseFromOwnerDate?: string | null;
  managementResponse?: { text?: string; publishedDate?: string } | string | null;
}

function extractTAOwnerReply(it: any): { text: string | null; date: string | null } {
  const candidates = [it.ownerResponse, it.managementResponse, it.responseFromOwnerText, it.response];
  for (const c of candidates) {
    if (typeof c === "string" && c.trim()) return { text: c.trim(), date: null };
    if (c && typeof c === "object") {
      const t = c.text || c.body || c.message || "";
      const d = c.publishedDate || c.date || null;
      if (t) return { text: String(t).trim(), date: d };
    }
  }
  if (it.responseFromOwnerDate) return { text: null, date: it.responseFromOwnerDate };
  return { text: null, date: null };
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

async function fetchDatasetItems(datasetId: string, token: string): Promise<TripAdvisorReview[]> {
  const items: TripAdvisorReview[] = [];
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

    const { business_id, run_id, force = false } = await req.json();

    if (!business_id) {
      return new Response(
        JSON.stringify({ error: "business_id is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // 🧠 Smart skip: Cron (service-role) çağrılarında, son 48 saat içinde
    // bu işletme için TripAdvisor scrape edilmişse → tekrar scrape etme.
    // TripAdvisor en pahalı aktörlerden biri (her run ~$0.30+), bu yüzden
    // yeni yorum 0 olmasa bile cooldown uygula.
    if (!run_id && isServiceRole && !force) {
      const cutoff = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();
      const { data: lastLogs } = await supabase
        .from("integration_logs")
        .select("created_at, meta, status")
        .eq("business_id", business_id)
        .eq("provider", "apify")
        .eq("action", "tripadvisor_reviews_fetch")
        .eq("status", "success")
        .gte("created_at", cutoff)
        .order("created_at", { ascending: false })
        .limit(1);

      const lastRun = lastLogs?.[0];
      if (lastRun) {
        console.log(
          `⏭️ Skipping TripAdvisor for business ${business_id} — last run at ${lastRun.created_at} (within 48h cooldown).`
        );
        await supabase.from("integration_logs").insert({
          business_id,
          provider: "apify",
          action: "tripadvisor_reviews_fetch",
          status: "skipped",
          meta: {
            reason: "smart_skip_within_48h",
            last_run_at: lastRun.created_at,
          },
        });
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

    // If run_id provided, check existing run
    if (run_id) {
      console.log(`Checking existing TripAdvisor run: ${run_id}`);
      const runData = await getRunStatus(run_id, APIFY_API_TOKEN);

      if (!runData || !isTerminalStatus(runData.status)) {
        return new Response(
          JSON.stringify({ status: "running", run_id, message: "Actor is still running." }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      if (runData.status !== "SUCCEEDED" || !runData.defaultDatasetId) {
        return new Response(
          JSON.stringify({
            success: false,
            status: "failed",
            run_id,
            message: `Apify run failed: ${runData.statusMessage || runData.status}`,
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const items = await fetchDatasetItems(runData.defaultDatasetId, APIFY_API_TOKEN);
      const result = await insertReviews(supabase, items, business_id);
      await logSuccess(supabase, business_id, items.length, result.inserted, result.skipped);

      return new Response(
        JSON.stringify({ success: true, ...result, fetched: items.length }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get business to find tripadvisor_id
    const { data: business, error: bizError } = await supabaseAuth
      .from("businesses")
      .select("id, tripadvisor_id, name")
      .eq("id", business_id)
      .maybeSingle();

    if (bizError || !business) {
      return new Response(
        JSON.stringify({ error: "Business not found or access denied" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!business.tripadvisor_id) {
      return new Response(
        JSON.stringify({ error: "TripAdvisor ID bulunamadı. Lütfen önce TripAdvisor URL'sini ekleyin." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Build TripAdvisor URL from stored value
    const storedTripadvisorValue = business.tripadvisor_id.trim();
    let tripAdvisorUrl = storedTripadvisorValue;

    if (!storedTripadvisorValue.startsWith("http")) {
      const numericId = storedTripadvisorValue.match(/(\d{5,})/)?.[1];
      if (!numericId) {
        return new Response(
          JSON.stringify({ error: "TripAdvisor URL/ID formatı geçersiz. Lütfen tam TripAdvisor URL'si kaydedin." }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Hotel-first fallback for numeric IDs (project is hotel-focused)
      tripAdvisorUrl = `https://www.tripadvisor.com/Hotel_Review-d${numericId}-Reviews`;
    }

    tripAdvisorUrl = tripAdvisorUrl.split('?')[0].split('#')[0];

    console.log(`Starting TripAdvisor actor (maxcopell/tripadvisor-reviews) for business ${business_id}, URL: ${tripAdvisorUrl}`);

    const actorInput = {
      startUrls: [{ url: tripAdvisorUrl }],
      maxItemsPerQuery: 200,
      scrapeReviewerInfo: true,
    };

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

    if (!newRunId) {
      throw new Error("Failed to get run ID from Apify");
    }

    console.log(`TripAdvisor actor run started: ${newRunId}`);

    return new Response(
      JSON.stringify({
        status: "running",
        run_id: newRunId,
        message: "TripAdvisor actor started. Call again with run_id to check progress.",
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in tripadvisor-fetch-reviews:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

async function insertReviews(supabase: any, items: TripAdvisorReview[], businessId: string) {
  const transformed = items
    .filter(item => item.text || item.title)
    .map(item => {
      const reviewId = item.id || `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      
      let rating = item.rating;
      if (!rating || isNaN(Number(rating))) rating = 3;
      rating = Math.min(5, Math.max(1, Math.round(Number(rating))));

      let text = item.text || "";
      if (item.title && text) text = `${item.title}\n\n${text}`;
      else if (item.title) text = item.title;

      const reviewerName = 
        item.user?.name || item.user?.username || item.user?.firstName || "Anonymous";

      const postedAt = toSafeIsoDate(item.publishedDate);

      const reply = extractTAOwnerReply(item);
      const ownerReply = reply.text;
      const ownerReplyAt = reply.date ? toSafeIsoDate(reply.date) : (ownerReply ? postedAt : null);

      return {
        business_id: businessId,
        platform: "tripadvisor",
        google_review_id: `tripadvisor-${reviewId}`,
        reviewer_name: reviewerName,
        rating: Number(rating),
        text: text || null,
        posted_at: postedAt,
        status: ownerReply ? "replied" : "pending_reply",
        sentiment: Number(rating) >= 4 ? "positive" : Number(rating) >= 3 ? "neutral" : "negative",
        approved_reply: ownerReply,
        replied_at: ownerReplyAt,
        reply_source: ownerReply ? "platform" : null,
      };
    });

  // Check existing
  const existingMap = new Map<string, { id: string; approved_reply: string | null; reply_source: string | null }>();
  const allIds = transformed.map(r => r.google_review_id);
  const CHECK_BATCH = 200;
  for (let i = 0; i < allIds.length; i += CHECK_BATCH) {
    const batch = allIds.slice(i, i + CHECK_BATCH);
    const { data: existing } = await supabase
      .from("reviews")
      .select("id, google_review_id, approved_reply, reply_source")
      .eq("business_id", businessId)
      .in("google_review_id", batch);
    if (existing) {
      for (const row of existing) existingMap.set(row.google_review_id!, row);
    }
  }

  const newReviews = transformed.filter(r => !existingMap.has(r.google_review_id));
  let inserted = 0;
  let updated = 0;

  // Insert new
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

  // Update owner replies for existing reviews that didn't have one yet
  for (const r of transformed) {
    const existing = existingMap.get(r.google_review_id);
    if (!existing) continue;
    if (!r.approved_reply) continue;
    if (existing.approved_reply && existing.reply_source !== "platform") continue;
    if (existing.approved_reply === r.approved_reply) continue;

    const { error } = await supabase
      .from("reviews")
      .update({
        approved_reply: r.approved_reply,
        replied_at: r.replied_at,
        reply_source: "platform",
        status: "replied",
      })
      .eq("id", existing.id);
    if (!error) updated += 1;
  }

  const skipped = transformed.length - newReviews.length - updated;
  console.log(`TripAdvisor: ${inserted} inserted, ${updated} updated, ${skipped} skipped out of ${transformed.length} total`);
  return { inserted, updated, skipped, total: transformed.length };
}

async function logSuccess(supabase: any, businessId: string, fetched: number, inserted: number, skipped: number) {
  await supabase.from("integration_logs").insert({
    business_id: businessId,
    provider: "apify",
    action: "tripadvisor_reviews_fetch",
    status: "success",
    meta: { fetched, inserted, skipped },
  });
}
