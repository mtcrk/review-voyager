import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { filterBusinessIdsWithSubscription } from "../_shared/subscription-guard.ts";

const LOVABLE_API_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";
const MODEL = "google/gemini-2.5-flash";
/** Hard ceiling of reviews processed per invocation (credit-cost safety belt). */
const MAX_PER_RUN = (() => {
  const raw = Number(Deno.env.get("EXTRACT_TOPICS_MAX_PER_RUN") ?? 50);
  return Number.isFinite(raw) && raw > 0 ? Math.min(Math.floor(raw), 200) : 50;
})();

async function callLLM(apiKey: string, taxonomy: { id: string; label: string; category: string }[], review: { text: string; language?: string | null; rating?: number | null }) {
  const taxonomyList = taxonomy.map((t) => `- ${t.id} (${t.category}): ${t.label}`).join("\n");
  const systemPrompt = `You extract structured topic mentions from customer reviews.
You will receive a closed taxonomy of topic IDs. ONLY use topic_id values from this list — never invent new ones.
For each topic clearly mentioned in the review, output sentiment toward THAT topic from -1 (very negative) to 1 (very positive), and a confidence 0..1.
Provide an excerpt in the ORIGINAL language of the review (max 140 chars).
Skip topics that are not actually mentioned. If nothing is mentioned, return empty mentions.
Respond with strict JSON only, no markdown.`;

  const userPrompt = `Taxonomy:\n${taxonomyList}\n\nReview${review.rating != null ? ` (rating ${review.rating})` : ""}${review.language ? ` [lang ${review.language}]` : ""}:\n"""\n${review.text}\n"""\n\nReturn JSON: {"mentions":[{"topic_id":"...","sentiment":0.0,"confidence":0.0,"excerpt":"..."}]}`;

  const res = await fetch(LOVABLE_API_URL, {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.2,
      response_format: { type: "json_object" },
    }),
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`LLM ${res.status}: ${t}`);
  }
  const data = await res.json();
  const content = data?.choices?.[0]?.message?.content || "{}";
  try {
    const parsed = JSON.parse(content);
    return Array.isArray(parsed?.mentions) ? parsed.mentions : [];
  } catch {
    return [];
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { review_source = "competitor", limit: rawLimit = 20 } = (await req.json().catch(() => ({}))) as {
      review_source?: "own" | "competitor";
      limit?: number;
    };
    const limit = Math.max(1, Math.min(Number(rawLimit) || 20, MAX_PER_RUN));
    if (!["own", "competitor"].includes(review_source)) {
      return new Response(JSON.stringify({ error: "review_source must be 'own' or 'competitor'" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

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

    // Load taxonomy
    const { data: topics, error: topicsErr } = await admin
      .from("ci_topics")
      .select("id, category, display_name");
    if (topicsErr || !topics) {
      return new Response(JSON.stringify({ error: "Failed to load taxonomy", details: topicsErr?.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const validIds = new Set(topics.map((t: any) => t.id));
    const taxonomyForPrompt = topics.map((t: any) => ({
      id: t.id,
      category: t.category,
      label: (t.display_name?.en || t.display_name?.tr || t.id) as string,
    }));

    // Collect reviews to process
    type Job = {
      review_id: string;
      business_id: string;
      competitor_id: string | null;
      text: string;
      language: string | null;
      rating: number | null;
      posted_at: string | null;
    };
    const jobs: Job[] = [];

    if (review_source === "competitor") {
      const { data: rows, error } = await admin
        .from("ci_competitor_reviews")
        .select("id, competitor_id, body, language, rating, posted_at")
        .is("topics_extracted_at", null)
        .not("body", "is", null)
        .limit(limit);
      if (error) throw error;

      const compIds = Array.from(new Set((rows || []).map((r: any) => r.competitor_id)));
      const compMap: Record<string, string> = {};
      if (compIds.length > 0) {
        const { data: comps } = await admin
          .from("ci_competitors")
          .select("id, business_id")
          .in("id", compIds);
        for (const c of comps || []) compMap[c.id] = c.business_id;
      }

      for (const r of rows || []) {
        const business_id = compMap[r.competitor_id];
        if (!business_id) continue;
        if (!r.body || String(r.body).trim().length < 5) continue;
        jobs.push({
          review_id: r.id,
          business_id,
          competitor_id: r.competitor_id,
          text: r.body,
          language: r.language,
          rating: r.rating,
          posted_at: r.posted_at,
        });
      }
    } else {
      // own reviews
      const { data: rows, error } = await admin
        .from("reviews")
        .select("id, business_id, text, rating, posted_at")
        .not("text", "is", null)
        .limit(limit * 5); // we will filter out those already extracted
      if (error) throw error;

      const ids = (rows || []).map((r: any) => r.id);
      const already = new Set<string>();
      if (ids.length > 0) {
        const { data: existing } = await admin
          .from("ci_review_topics")
          .select("review_id")
          .eq("review_source", "own")
          .in("review_id", ids);
        for (const e of existing || []) already.add(e.review_id);
      }

      for (const r of rows || []) {
        if (already.has(r.id)) continue;
        if (!r.text || String(r.text).trim().length < 5) continue;
        jobs.push({
          review_id: r.id,
          business_id: r.business_id,
          competitor_id: null,
          text: r.text,
          language: null,
          rating: r.rating,
          posted_at: r.posted_at,
        });
        if (jobs.length >= limit) break;
      }
    }

    let processed = 0;
    let mentionsInserted = 0;
    let errors = 0;

    // Yalnızca aktif aboneliği olan işletmeler için AI kredisi harcanır.
    const eligible = await filterBusinessIdsWithSubscription(
      supabaseUrl,
      serviceKey,
      Array.from(new Set(jobs.map((j) => j.business_id).filter(Boolean))),
    );
    const eligibleJobs = jobs.filter((j) => eligible.has(j.business_id)).slice(0, limit);
    const skippedNoSub = jobs.length - eligibleJobs.length;
    if (skippedNoSub > 0) {
      console.log(`extract-topics: skipped ${skippedNoSub} reviews (no active subscription)`);
    }

    for (const job of eligibleJobs) {
      try {
        const mentions = await callLLM(lovableKey, taxonomyForPrompt, {
          text: job.text,
          language: job.language,
          rating: job.rating,
        });

        const rows: any[] = [];
        for (const m of mentions) {
          if (!m || typeof m !== "object") continue;
          const topic_id = String(m.topic_id || "").trim();
          if (!topic_id || !validIds.has(topic_id)) continue;
          const confidence = Number(m.confidence);
          if (!isFinite(confidence) || confidence < 0.5) continue;
          let sentiment = Number(m.sentiment);
          if (!isFinite(sentiment)) continue;
          sentiment = Math.max(-1, Math.min(1, sentiment));
          rows.push({
            review_id: job.review_id,
            review_source,
            business_id: job.business_id,
            competitor_id: job.competitor_id,
            topic_id,
            sentiment,
            confidence: Math.min(1, Math.max(0, confidence)),
            excerpt: m.excerpt ? String(m.excerpt).slice(0, 280) : null,
            language: job.language,
            review_posted_at: job.posted_at,
          });
        }

        if (rows.length > 0) {
          const { error: insErr, count } = await admin
            .from("ci_review_topics")
            .upsert(rows, { onConflict: "review_id,review_source,topic_id", count: "exact" });
          if (insErr) {
            console.error("ci_review_topics upsert failed:", insErr);
            errors++;
            continue;
          }
          mentionsInserted += count ?? rows.length;
        }

        // Mark extracted on source
        if (review_source === "competitor") {
          await admin
            .from("ci_competitor_reviews")
            .update({ topics_extracted_at: new Date().toISOString() })
            .eq("id", job.review_id);
        }
        // For 'own' reviews we rely on presence of ci_review_topics rows.

        processed++;
      } catch (e) {
        console.error("Job failed:", job.review_id, e);
        errors++;
      }
    }

    return new Response(
      JSON.stringify({
        ok: true,
        review_source,
        considered: eligibleJobs.length,
        skipped_no_subscription: skippedNoSub,
        processed,
        mentions_inserted: mentionsInserted,
        errors,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    console.error("extract-topics error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});