import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const MAX_REVIEWS_PER_RUN = 80;
const BATCH_SIZE = 8; // reviews per Gemini call

type TopicRow = { id: string; category: string; display_name: any };

function buildPrompt(topics: TopicRow[], reviews: { idx: number; text: string }[]): string {
  const topicList = topics
    .map((t) => `${t.id} (${t.category}: ${t.display_name?.tr ?? t.display_name?.en ?? t.id})`)
    .join("\n");
  const reviewBlock = reviews
    .map((r) => `[${r.idx}] ${r.text.replace(/\n+/g, " ").slice(0, 600)}`)
    .join("\n\n");
  return `Aşağıda yorum ID'leri ve metinleri var. Her yorum için, listedeki konulardan SADECE bahsedilenleri çıkar.
Her bahis için: topic_id (listeden BİREBİR), sentiment (-1.0 ile 1.0 arası), excerpt (yorumdan ilgili kısa kesit, max 120 karakter).
Bahis yoksa o yorum için boş array döndür. Sadece JSON döndür.

KONULAR:
${topicList}

YORUMLAR:
${reviewBlock}

JSON formatı:
{"results":[{"idx":0,"mentions":[{"topic_id":"breakfast","sentiment":0.8,"excerpt":"kahvaltı harikaydı"}]}]}`;
}

async function geminiExtract(
  apiKey: string,
  topics: TopicRow[],
  reviews: { idx: number; text: string }[],
): Promise<Record<number, { topic_id: string; sentiment: number; excerpt: string }[]>> {
  const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages: [{ role: "user", content: buildPrompt(topics, reviews) }],
      response_format: { type: "json_object" },
    }),
  });
  if (!res.ok) {
    console.warn("Gemini failed", res.status, await res.text());
    return {};
  }
  const j = await res.json();
  const raw = j.choices?.[0]?.message?.content ?? "{}";
  let parsed: any;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return {};
  }
  const out: Record<number, any[]> = {};
  const topicIds = new Set(topics.map((t) => t.id));
  for (const r of parsed.results ?? []) {
    const idx = Number(r.idx);
    if (Number.isNaN(idx)) continue;
    const mentions = (r.mentions ?? []).filter(
      (m: any) =>
        m?.topic_id &&
        topicIds.has(m.topic_id) &&
        typeof m.sentiment === "number" &&
        m.sentiment >= -1 && m.sentiment <= 1,
    );
    out[idx] = mentions;
  }
  return out;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const { business_id, limit = MAX_REVIEWS_PER_RUN } = await req.json();
    if (!business_id) {
      return new Response(JSON.stringify({ error: "business_id required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const url = Deno.env.get("SUPABASE_URL")!;
    const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const lovableKey = Deno.env.get("LOVABLE_API_KEY");
    if (!lovableKey) {
      return new Response(JSON.stringify({ error: "LOVABLE_API_KEY missing" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const admin = createClient(url, key);

    // Topic taxonomy (hotel-applicable)
    const { data: topics } = await admin
      .from("ci_topics")
      .select("id, category, display_name, applies_to_verticals");
    const usable: TopicRow[] = (topics ?? []).filter((t: any) =>
      Array.isArray(t.applies_to_verticals) && t.applies_to_verticals.includes("hotel"),
    );
    if (usable.length === 0) {
      return new Response(JSON.stringify({ error: "No topics available" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // NOTE: Own (business) reviews are intentionally NOT processed here.
    // Deep per-review analysis of our own reviews is exclusively `analyze-review`'s job;
    // both jobs used to race on reviews.topics_extracted_at and corrupt own topic data.
    // COMPETITOR reviews pending (for this business's confirmed competitors)
    const { data: comps } = await admin
      .from("ci_competitors")
      .select("id")
      .eq("business_id", business_id)
      .eq("status", "confirmed");
    const compIds = (comps ?? []).map((c: any) => c.id);

    let compReviews: any[] = [];
    if (compIds.length > 0) {
      const { data: cr } = await admin
        .from("ci_competitor_reviews")
        .select("id, competitor_id, body, title, rating, posted_at, language")
        .in("competitor_id", compIds)
        .is("topics_extracted_at", null)
        .not("body", "is", null)
        .order("posted_at", { ascending: false, nullsFirst: false })
        .limit(limit);
      compReviews = cr ?? [];
    }

    const items: {
      idx: number;
      review_id: string;
      source: "own" | "competitor";
      competitor_id: string | null;
      text: string;
      language: string | null;
      posted_at: string | null;
    }[] = [];
    let idx = 0;
    for (const r of compReviews) {
      const t = `${r.title ?? ""}\n${r.body ?? ""}`.trim();
      if (!t) continue;
      items.push({ idx: idx++, review_id: r.id, source: "competitor", competitor_id: r.competitor_id, text: t, language: r.language ?? null, posted_at: r.posted_at });
    }

    if (items.length === 0) {
      return new Response(JSON.stringify({ ok: true, analyzed: 0, mentions: 0, message: "Yeni yorum yok." }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let totalMentions = 0;
    const insertedReviewIds = { own: new Set<string>(), competitor: new Set<string>() };

    for (let i = 0; i < items.length; i += BATCH_SIZE) {
      const batch = items.slice(i, i + BATCH_SIZE);
      const extracted = await geminiExtract(lovableKey, usable, batch.map((b) => ({ idx: b.idx, text: b.text })));
      const rows: any[] = [];
      for (const item of batch) {
        const mentions = extracted[item.idx] ?? [];
        for (const m of mentions) {
          rows.push({
            review_id: item.review_id,
            review_source: item.source,
            business_id,
            competitor_id: item.competitor_id,
            topic_id: m.topic_id,
            sentiment: Math.max(-1, Math.min(1, m.sentiment)),
            confidence: 0.8,
            excerpt: (m.excerpt ?? "").slice(0, 200),
            language: item.language,
            review_posted_at: item.posted_at,
          });
        }
        insertedReviewIds[item.source].add(item.review_id);
      }
      if (rows.length > 0) {
        // Dedupe within batch (Gemini sometimes returns same topic twice per review)
        const seen = new Set<string>();
        const deduped = rows.filter((r) => {
          const k = `${r.review_id}|${r.review_source}|${r.topic_id}`;
          if (seen.has(k)) return false;
          seen.add(k);
          return true;
        });
        const { error: insErr } = await admin
          .from("ci_review_topics")
          .upsert(deduped, { onConflict: "review_id,review_source,topic_id", ignoreDuplicates: true });
        if (insErr) console.warn("topic insert err", insErr);
        else totalMentions += deduped.length;
      }
    }

    const now = new Date().toISOString();
    if (insertedReviewIds.own.size > 0) {
      await admin
        .from("reviews")
        .update({ topics_extracted_at: now })
        .in("id", Array.from(insertedReviewIds.own));
    }
    if (insertedReviewIds.competitor.size > 0) {
      await admin
        .from("ci_competitor_reviews")
        .update({ topics_extracted_at: now })
        .in("id", Array.from(insertedReviewIds.competitor));
    }

    return new Response(
      JSON.stringify({
        ok: true,
        analyzed: items.length,
        own_analyzed: insertedReviewIds.own.size,
        competitor_analyzed: insertedReviewIds.competitor.size,
        mentions: totalMentions,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    console.error("analyze-competitor-topics error", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});