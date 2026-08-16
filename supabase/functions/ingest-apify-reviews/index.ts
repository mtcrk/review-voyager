import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { filterBusinessIdsWithSubscription } from "../_shared/subscription-guard.ts";
import { extractReviewerCountry } from "../_shared/country.ts";
import { extractOwnerReply } from "../_shared/owner-reply.ts";

// Mirror of PROVIDER_MAP in apify-fetch-reviews so competitor ingest uses
// the same platform naming convention as the own-review pipeline.
const PROVIDER_MAP: Record<string, string> = {
  "booking.com": "booking",
  booking: "booking",
  tripadvisor: "tripadvisor",
  expedia: "expedia",
  "hotels.com": "hotelscom",
  hotelscom: "hotelscom",
  hotels: "hotelscom",
  google: "google",
  "google-maps": "google",
  yelp: "yelp",
  airbnb: "airbnb",
};

function normalizePlatform(provider?: string | null): string {
  if (!provider) return "google";
  const key = String(provider).toLowerCase().trim();
  return PROVIDER_MAP[key] || key;
}

function isTenScale(platform: string): boolean {
  return platform === "booking" || platform === "expedia" || platform === "hotelscom" || platform === "tripcom";
}

function ratingToSentiment(rating: number, platform: string): string {
  if (isTenScale(platform)) {
    if (rating >= 8) return "positive";
    if (rating >= 6) return "neutral";
    return "negative";
  }
  if (rating >= 4) return "positive";
  if (rating >= 3) return "neutral";
  return "negative";
}

function pick<T = any>(obj: any, keys: string[]): T | null {
  for (const k of keys) {
    const v = k.split(".").reduce((o: any, p: string) => (o == null ? o : o[p]), obj);
    if (v !== undefined && v !== null && v !== "") return v as T;
  }
  return null;
}

function toIsoDate(v: any): string | null {
  if (!v) return null;
  try {
    const d = new Date(v);
    if (isNaN(d.getTime())) return null;
    return d.toISOString();
  } catch {
    return null;
  }
}

function normalizeItem(item: any) {
  const place_id =
    pick<string>(item, [
      "googleMapsPlaceId",
      "placeId",
      "place_id",
      "sourcePlaceId",
      "source.placeId",
      "google.placeId",
      "googlePlaceId",
    ]) || null;

  const external_id =
    pick<string>(item, [
      "reviewId",
      "id",
      "review_id",
      "externalId",
      "external_id",
      "reviewIdStr",
    ]) || null;

  const ratingRaw = pick<number | string>(item, ["reviewRating", "rating", "stars", "score", "ratingValue"]);
  const bodyRaw = pick<string>(item, ["reviewText", "text", "comment", "body", "review", "content"]);
  const title = pick<string>(item, ["reviewTitle", "title", "headline"]);
  const body = title && bodyRaw ? `${title}\n\n${bodyRaw}` : (bodyRaw || title || null);
  const author_name = pick<string>(item, [
    "authorName",
    "author_name",
    "reviewerName",
    "name",
    "user.name",
    "userName",
  ]);
  const language = pick<string>(item, ["language", "lang", "originalLanguage", "detectedLanguage"]);
  const providerRaw =
    pick<string>(item, ["provider", "platform", "source", "site"]) || "google";
  const platform = normalizePlatform(providerRaw);
  const posted_at = toIsoDate(
    pick(item, ["publishedAtDate", "publishedAt", "date", "createdAt", "reviewDate", "time"]),
  );

  // Owner / business reply — shared extractor (same shapes as own-review pipeline)
  const extracted = extractOwnerReply(item);
  const owner_reply_text =
    extracted.text ??
    pick<string>(item, [
      "ownerResponse.text",
      "ownerResponse.body",
      "ownerResponseText",
      "ownerReply.text",
      "reply.text",
      "managementResponse.text",
      "hotelResponse.text",
    ]);
  const owner_reply_at =
    toIsoDate(extracted.date) ??
    toIsoDate(
      pick(item, [
        "responseFromOwnerDate",
        "ownerResponse.date",
        "ownerResponse.publishedAt",
        "ownerResponseDate",
        "reply.date",
        "managementResponse.date",
        "hotelResponse.date",
      ]),
    ) ??
    null;

  // Keep rating in NATIVE scale and clamp to that scale's max.
  let rating: number | null = null;
  if (ratingRaw != null && ratingRaw !== "") {
    const num = typeof ratingRaw === "string" ? parseFloat(ratingRaw) : Number(ratingRaw);
    if (!isNaN(num)) {
      const max = isTenScale(platform) ? 10 : 5;
      rating = Math.min(max, Math.max(1, num));
    }
  }
  const sentiment = rating != null ? ratingToSentiment(rating, platform) : null;

  return {
    place_id,
    external_id,
    rating,
    sentiment,
    body,
    title,
    author_name,
    language,
    platform,
    posted_at,
    owner_reply_text: typeof owner_reply_text === "string" ? owner_reply_text.slice(0, 4000) : null,
    // Mirror own-review pipeline: when a reply exists without a date, fall back to posted_at
    owner_reply_at: owner_reply_at ?? (owner_reply_text ? posted_at : null),
  };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const apifyToken = Deno.env.get("APIFY_API_TOKEN");
    if (!apifyToken) {
      return new Response(
        JSON.stringify({ error: "APIFY_API_TOKEN secret not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const admin = createClient(supabaseUrl, serviceKey);

    let payload: any = {};
    try { payload = await req.json(); } catch {}

    // Apify webhook shape: { eventType, resource:{ defaultDatasetId, actId, actorRunId, ... } }
    // Also allow direct invocation with { datasetId } for testing.
    const datasetId =
      payload?.resource?.defaultDatasetId ||
      payload?.defaultDatasetId ||
      payload?.datasetId;
    const actorRunId = payload?.resource?.actorRunId || payload?.actorRunId || null;

    if (!datasetId) {
      return new Response(
        JSON.stringify({ error: "datasetId (resource.defaultDatasetId) is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Fetch dataset items (paginated; default 1000 is fine for most runs, loop just in case)
    const allItems: any[] = [];
    let offset = 0;
    const limit = 1000;
    while (true) {
      const url = `https://api.apify.com/v2/datasets/${datasetId}/items?token=${apifyToken}&clean=true&limit=${limit}&offset=${offset}`;
      const res = await fetch(url);
      if (!res.ok) {
        const text = await res.text();
        return new Response(JSON.stringify({ error: "Apify dataset fetch failed", details: text }), {
          status: 502,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const items = (await res.json()) as any[];
      allItems.push(...items);
      if (items.length < limit) break;
      offset += limit;
      if (offset > 20000) break; // safety
    }

    // Group items by place_id and resolve competitor_ids
    const placeIds = Array.from(
      new Set(allItems.map((i) => normalizeItem(i).place_id).filter(Boolean) as string[]),
    );

    let competitorsByPlace: Record<string, string> = {};
    if (placeIds.length > 0) {
      const { data: comps } = await admin
        .from("ci_competitors")
        .select("id, place_id, business_id")
        .in("place_id", placeIds);
      const bizIds = Array.from(
        new Set((comps || []).map((c: any) => c.business_id).filter(Boolean)),
      ) as string[];
      const activeBiz = await filterBusinessIdsWithSubscription(supabaseUrl, serviceKey, bizIds);
      let skippedNoSub = 0;
      for (const c of comps || []) {
        if (!c.place_id) continue;
        // Ödeme yapmayan müşterilerin Apify verisi ASLA işlenmez
        if (!c.business_id || !activeBiz.has(c.business_id)) {
          skippedNoSub++;
          continue;
        }
        competitorsByPlace[c.place_id] = c.id;
      }
      if (skippedNoSub > 0) {
        console.log(`⛔ Skipped ${skippedNoSub} competitor(s) without active subscription`);
      }
    }

    const rows: any[] = [];
    let skippedNoCompetitor = 0;
    let skippedNoId = 0;
    for (const raw of allItems) {
      const n = normalizeItem(raw);
      if (!n.place_id || !competitorsByPlace[n.place_id]) {
        skippedNoCompetitor++;
        continue;
      }
      if (!n.external_id) {
        skippedNoId++;
        continue;
      }
      rows.push({
        competitor_id: competitorsByPlace[n.place_id],
        external_id: String(n.external_id),
        platform: n.platform || "google",
        rating: n.rating,
        sentiment: n.sentiment,
        language: n.language,
        title: n.title,
        body: n.body,
        author_name: n.author_name,
        posted_at: n.posted_at,
        owner_reply_text: n.owner_reply_text,
        owner_reply_at: n.owner_reply_at,
        ...extractReviewerCountry(raw, n.platform || "google"),
        raw_payload: raw,
      });
    }

    let inserted = 0;
    // Rows without an owner reply omit the reply columns entirely, so an existing
    // reply is never overwritten with null; rows with a reply insert/backfill it.
    const withReply = rows.filter((r) => r.owner_reply_text);
    const withoutReply = rows
      .filter((r) => !r.owner_reply_text)
      .map(({ owner_reply_text: _t, owner_reply_at: _d, ...rest }) => rest);

    const chunkSize = 500;
    for (const group of [withReply, withoutReply]) {
      for (let i = 0; i < group.length; i += chunkSize) {
        const chunk = group.slice(i, i + chunkSize);
        const { error, count } = await admin
          .from("ci_competitor_reviews")
          .upsert(chunk, { onConflict: "platform,external_id", count: "exact", ignoreDuplicates: false });
        if (error) {
          console.error("Upsert ci_competitor_reviews failed:", error);
          return new Response(
            JSON.stringify({
              error: "Insert failed",
              details: error.message,
              inserted_so_far: inserted,
            }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
          );
        }
        inserted += count ?? chunk.length;
      }
    }

    // Mark last_scraped_at on touched competitors
    const touched = Array.from(new Set(rows.map((r) => r.competitor_id)));
    if (touched.length > 0) {
      await admin
        .from("ci_competitors")
        .update({ last_scraped_at: new Date().toISOString() })
        .in("id", touched);
    }

    return new Response(
      JSON.stringify({
        ok: true,
        actorRunId,
        datasetId,
        total_items: allItems.length,
        inserted,
        skipped_no_competitor: skippedNoCompetitor,
        skipped_no_id: skippedNoId,
        competitors_updated: touched.length,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    console.error("ingest-apify-reviews error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});