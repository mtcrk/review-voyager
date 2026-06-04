import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const LOVABLE_API_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";
const MODEL = "google/gemini-2.5-flash";

function isoMonday(d = new Date()): string {
  const date = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  const day = date.getUTCDay(); // 0..6, Sun=0
  const diff = (day === 0 ? -6 : 1 - day);
  date.setUTCDate(date.getUTCDate() + diff);
  return date.toISOString().slice(0, 10);
}

function avg(nums: number[]): number | null {
  if (!nums.length) return null;
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}

async function llmJson(apiKey: string, system: string, user: string) {
  const res = await fetch(LOVABLE_API_URL, {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
      temperature: 0.3,
      response_format: { type: "json_object" },
    }),
  });
  if (!res.ok) throw new Error(`LLM ${res.status}: ${await res.text()}`);
  const data = await res.json();
  const content = data?.choices?.[0]?.message?.content || "{}";
  return JSON.parse(content);
}

async function processBusiness(admin: any, business: any, lovableKey: string) {
  const business_id = business.id;
  const language = (business.language || "en").toLowerCase();

  const now = new Date();
  const ninetyDaysAgo = new Date(now.getTime() - 90 * 86400000).toISOString();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 86400000).toISOString();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 86400000).toISOString();
  const sixtyDaysAgo = new Date(now.getTime() - 60 * 86400000).toISOString();
  const bucket_week = isoMonday(now);

  // confirmed competitors
  const { data: comps } = await admin
    .from("ci_competitors")
    .select("id, name")
    .eq("business_id", business_id)
    .eq("status", "confirmed")
    .eq("is_active", true);
  const competitorIds = (comps || []).map((c: any) => c.id);
  const compName: Record<string, string> = {};
  for (const c of comps || []) compName[c.id] = c.name;

  // 90-day topic mentions for own + competitors of this business
  const { data: topicRows } = await admin
    .from("ci_review_topics")
    .select("topic_id, sentiment, review_source, competitor_id, review_posted_at")
    .eq("business_id", business_id)
    .gte("review_posted_at", ninetyDaysAgo);

  const competitorReviewCount90 = (topicRows || []).filter(
    (r: any) => r.review_source === "competitor",
  ).length;

  // Insufficient data → stub
  if (competitorReviewCount90 < 30) {
    const stub = {
      headline: language.startsWith("tr")
        ? "Yeterli veri yok — daha fazla rakip yorumu topluyoruz."
        : "Not enough data yet — gathering more competitor reviews.",
      strongest_advantage: null,
      biggest_gap: null,
      most_active_competitor: null,
      topics_on_the_rise: [],
      three_actions: [],
      confidence_level: "low",
    };
    await admin.from("ci_monday_briefs").upsert(
      {
        business_id,
        bucket_week,
        sections: stub,
        signal_strength: Math.min(20, competitorReviewCount90),
        reviews_analysed: competitorReviewCount90,
        competitors_count: competitorIds.length,
        generated_at: new Date().toISOString(),
      },
      { onConflict: "business_id,bucket_week" },
    );
    return { business_id, status: "stub", reviews: competitorReviewCount90 };
  }

  // Per-topic aggregation
  const own: Record<string, number[]> = {};
  const comp: Record<string, number[]> = {};
  for (const r of topicRows || []) {
    const bucket = r.review_source === "own" ? own : comp;
    if (!bucket[r.topic_id]) bucket[r.topic_id] = [];
    bucket[r.topic_id].push(Number(r.sentiment));
  }

  const allTopicIds = Array.from(new Set([...Object.keys(own), ...Object.keys(comp)]));
  const perTopic = allTopicIds
    .map((tid) => {
      const oArr = own[tid] || [];
      const cArr = comp[tid] || [];
      const oAvg = avg(oArr);
      const cAvg = avg(cArr);
      return {
        topic_id: tid,
        own_avg: oAvg,
        own_mentions: oArr.length,
        comp_avg: cAvg,
        comp_mentions: cArr.length,
        gap: oAvg != null && cAvg != null ? +(oAvg - cAvg).toFixed(3) : null,
      };
    })
    .filter((t) => (t.own_mentions + t.comp_mentions) >= 3);

  const topicsWithGap = perTopic.filter((t) => t.gap != null);
  const advantages = [...topicsWithGap].sort((a, b) => (b.gap! - a.gap!)).slice(0, 5);
  const gaps = [...topicsWithGap].sort((a, b) => (a.gap! - b.gap!)).slice(0, 5);

  // Most active competitor in last 7 days
  let mostActive: { competitor_id: string; name: string; count: number } | null = null;
  if (competitorIds.length > 0) {
    const { data: recent } = await admin
      .from("ci_competitor_reviews")
      .select("competitor_id")
      .in("competitor_id", competitorIds)
      .gte("posted_at", sevenDaysAgo);
    const counts: Record<string, number> = {};
    for (const r of recent || []) counts[r.competitor_id] = (counts[r.competitor_id] || 0) + 1;
    const entries = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    if (entries.length > 0) {
      mostActive = {
        competitor_id: entries[0][0],
        name: compName[entries[0][0]] || "Competitor",
        count: entries[0][1],
      };
    }
  }

  // Topics rising: mentions last 30d vs prior 30d
  const last30: Record<string, number> = {};
  const prior30: Record<string, number> = {};
  for (const r of topicRows || []) {
    if (!r.review_posted_at) continue;
    if (r.review_posted_at >= thirtyDaysAgo) {
      last30[r.topic_id] = (last30[r.topic_id] || 0) + 1;
    } else if (r.review_posted_at >= sixtyDaysAgo) {
      prior30[r.topic_id] = (prior30[r.topic_id] || 0) + 1;
    }
  }
  const rising = Object.keys(last30)
    .map((tid) => ({
      topic_id: tid,
      last_30: last30[tid],
      prior_30: prior30[tid] || 0,
      delta: last30[tid] - (prior30[tid] || 0),
    }))
    .filter((t) => t.last_30 >= 3 && t.delta > 0)
    .sort((a, b) => b.delta - a.delta)
    .slice(0, 5);

  // Signal strength
  const reviewVol = Math.min(50, Math.round((competitorReviewCount90 / 200) * 50));
  const compScore = Math.min(25, competitorIds.length * 5);
  const spreadScore = Math.min(25, Math.round((perTopic.length / 30) * 25));
  const signal_strength = Math.min(100, reviewVol + compScore + spreadScore);

  // Build aggregate fact sheet for LLM
  const factSheet = {
    business_name: business.name,
    language,
    window_days: 90,
    competitors_count: competitorIds.length,
    competitor_reviews_analysed: competitorReviewCount90,
    advantages: advantages.map((a) => ({
      topic_id: a.topic_id,
      own_sentiment: a.own_avg,
      competitor_sentiment: a.comp_avg,
      gap: a.gap,
      own_mentions: a.own_mentions,
      competitor_mentions: a.comp_mentions,
    })),
    gaps: gaps.map((g) => ({
      topic_id: g.topic_id,
      own_sentiment: g.own_avg,
      competitor_sentiment: g.comp_avg,
      gap: g.gap,
      own_mentions: g.own_mentions,
      competitor_mentions: g.comp_mentions,
    })),
    most_active_competitor: mostActive,
    topics_on_the_rise: rising,
  };

  const langName =
    language.startsWith("tr") ? "Turkish"
    : language.startsWith("de") ? "German"
    : language.startsWith("es") ? "Spanish"
    : "English";

  const system = `You generate a weekly competitive intelligence brief for a hospitality/SMB business.
Write in ${langName}. Every field must be ≤18 words.
Use ONLY the numbers/topics provided in the fact sheet. Do not invent competitors, numbers, or topics.
Reference real numbers from the data (e.g. "+0.42 sentiment gap on cleanliness, 28 mentions").
Respond with strict JSON, no markdown.`;

  const user = `Fact sheet:\n${JSON.stringify(factSheet, null, 2)}\n\nReturn JSON in this exact shape:\n{
  "headline": "string",
  "strongest_advantage": "string",
  "biggest_gap": "string",
  "most_active_competitor": "string",
  "topics_on_the_rise": ["string", "string"],
  "three_actions": ["string", "string", "string"],
  "confidence_level": "low|medium|high"
}`;

  let sections: any;
  try {
    sections = await llmJson(lovableKey, system, user);
  } catch (e) {
    console.error("LLM failed for business", business_id, e);
    sections = {
      headline: "Brief generation failed — using raw data fallback.",
      strongest_advantage: advantages[0]?.topic_id || null,
      biggest_gap: gaps[0]?.topic_id || null,
      most_active_competitor: mostActive?.name || null,
      topics_on_the_rise: rising.slice(0, 3).map((r) => r.topic_id),
      three_actions: [],
      confidence_level: "low",
    };
  }

  // Attach raw aggregates for the UI to render alongside narrative
  sections._aggregates = factSheet;

  await admin.from("ci_monday_briefs").upsert(
    {
      business_id,
      bucket_week,
      sections,
      signal_strength,
      reviews_analysed: competitorReviewCount90,
      competitors_count: competitorIds.length,
      generated_at: new Date().toISOString(),
    },
    { onConflict: "business_id,bucket_week" },
  );

  return {
    business_id,
    status: "ok",
    signal_strength,
    reviews_analysed: competitorReviewCount90,
    competitors_count: competitorIds.length,
  };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { business_id } = (await req.json().catch(() => ({}))) as { business_id?: string };

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const lovableKey = Deno.env.get("LOVABLE_API_KEY");
    if (!lovableKey) {
      return new Response(JSON.stringify({ error: "LOVABLE_API_KEY not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const admin = createClient(supabaseUrl, serviceKey);

    let businesses: any[] = [];
    if (business_id) {
      const { data, error } = await admin
        .from("businesses")
        .select("id, name, language")
        .eq("id", business_id);
      if (error) throw error;
      businesses = data || [];
    } else {
      // All businesses with ≥1 confirmed competitor
      const { data: confirmed } = await admin
        .from("ci_competitors")
        .select("business_id")
        .eq("status", "confirmed")
        .eq("is_active", true);
      const ids = Array.from(new Set((confirmed || []).map((c: any) => c.business_id)));
      if (ids.length > 0) {
        const { data } = await admin
          .from("businesses")
          .select("id, name, language")
          .in("id", ids);
        businesses = data || [];
      }
    }

    const results: any[] = [];
    for (const b of businesses) {
      try {
        results.push(await processBusiness(admin, b, lovableKey));
      } catch (e) {
        console.error("processBusiness failed:", b.id, e);
        results.push({ business_id: b.id, status: "error", error: e instanceof Error ? e.message : String(e) });
      }
    }

    return new Response(
      JSON.stringify({ ok: true, processed: results.length, results }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    console.error("generate-monday-brief error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});