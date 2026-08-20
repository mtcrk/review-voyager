import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { filterBusinessIdsWithSubscription } from "../_shared/subscription-guard.ts";

const LOVABLE_API_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";
const MODEL = "google/gemini-2.5-flash";
const PROMPT_VERSION = 1;
const MAX_ATTEMPTS = 3;
/** Hard ceiling of reviews processed per invocation (credit-cost safety belt). */
const MAX_PER_RUN = (() => {
  const raw = Number(Deno.env.get("ANALYZE_MAX_PER_RUN") ?? 50);
  return Number.isFinite(raw) && raw > 0 ? Math.min(Math.floor(raw), 200) : 50;
})();
/** Only reviews posted within this window may trigger a WhatsApp notification. */
const WA_NOTIFY_MAX_AGE_HOURS = 48;
/** Backfill window: only reviews newer than this are analyzed by the batch job. */
const WINDOW_MONTHS = 6;
const windowCutoffISO = () => {
  const d = new Date();
  d.setMonth(d.getMonth() - WINDOW_MONTHS);
  return d.toISOString();
};

type Taxo = { id: string; category: string; label: string; driver: boolean };

// ---------------------------------------------------------------------------
// Offset resolution (server-side only — the model never returns indices)
// ---------------------------------------------------------------------------

/** Build a normalized string + index map back to the original text. */
function normalizeWithMap(src: string) {
  const nfc = src.normalize("NFC");
  let out = "";
  const map: number[] = []; // map[i in out] -> index in nfc
  let prevWasSpace = false;
  for (let i = 0; i < nfc.length; i++) {
    const ch = nfc[i];
    const isSpace = /\s/.test(ch);
    if (isSpace) {
      if (prevWasSpace) continue;
      out += " ";
      map.push(i);
      prevWasSpace = true;
    } else {
      out += ch;
      map.push(i);
      prevWasSpace = false;
    }
  }
  return { out, map };
}

/**
 * Resolve a quote to [start,end) in `text`.
 * Chain: exact -> NFC+whitespace-collapsed -> case-insensitive (tr locale).
 * Returns null when unresolved. Never guesses.
 */
function resolveSpan(text: string, quote: string): { start: number; end: number } | null {
  if (!quote) return null;
  const q = quote.trim();
  if (!q) return null;

  // 1) exact
  const exact = text.indexOf(q);
  if (exact !== -1) return { start: exact, end: exact + q.length };

  // 2) NFC + collapsed whitespace, mapped back
  const t = normalizeWithMap(text);
  const nq = normalizeWithMap(q).out.trim();
  if (nq) {
    const idx = t.out.indexOf(nq);
    if (idx !== -1) {
      const start = t.map[idx];
      const lastIdx = Math.min(idx + nq.length - 1, t.map.length - 1);
      const end = t.map[lastIdx] + 1;
      if (end > start) return { start, end };
    }

    // 3) case-insensitive (Turkish locale) over the normalized forms
    const lt = t.out.toLocaleLowerCase("tr");
    const lq = nq.toLocaleLowerCase("tr");
    if (lt.length === t.out.length && lq.length === nq.length) {
      const ci = lt.indexOf(lq);
      if (ci !== -1) {
        const start = t.map[ci];
        const lastIdx = Math.min(ci + lq.length - 1, t.map.length - 1);
        const end = t.map[lastIdx] + 1;
        if (end > start) return { start, end };
      }
    }
  }

  // 4) unresolved -> drop
  return null;
}

type Highlight = {
  quote: string;
  start: number;
  end: number;
  polarity: "positive" | "negative" | "neutral";
  topic_id: string | null;
  reason: string | null;
  _sentiment: number;
};

/** Sort by start, merge/dedupe overlaps keeping the higher |sentiment|. */
function mergeSpans(spans: Highlight[]): Highlight[] {
  const sorted = [...spans].sort((a, b) => a.start - b.start || a.end - b.end);
  const out: Highlight[] = [];
  for (const s of sorted) {
    const last = out[out.length - 1];
    if (last && s.start < last.end) {
      if (Math.abs(s._sentiment) > Math.abs(last._sentiment)) out[out.length - 1] = s;
      continue;
    }
    out.push(s);
  }
  return out;
}

// ---------------------------------------------------------------------------
// LLM
// ---------------------------------------------------------------------------

function buildSystemPrompt(taxonomy: Taxo[]) {
  const list = taxonomy
    .map((t) => `- ${t.id} (${t.category})${t.driver ? " [decision driver]" : ""}: ${t.label}`)
    .join("\n");

  return `You are a hospitality/service review analyst. You perform deep per-review analysis.

CLOSED TOPIC TAXONOMY — you may ONLY use topic_id values from this exact list:
${list}

HARD RULES:
1. topic_id MUST be copied verbatim from the taxonomy list above. Never invent a topic id.
2. "quote" MUST be a VERBATIM contiguous substring of the review text exactly as supplied to you.
   - Do NOT paraphrase, re-type, translate, fix typos, change casing/punctuation, or use ellipsis.
   - Copy the characters exactly as they appear. Max ~160 characters.
   - If you cannot copy an exact substring for a topic, omit the quote field for that topic.
3. Some texts contain a Google wrapper: "(Translated by Google) <english> (Original) <original>".
   When both segments are present, prefer quoting from the ORIGINAL-language segment.
   The quote must still be verbatim from the full text you were given.
4. Derive overall_sentiment from the TEXT itself. The star rating is only weak context and must not override the text.
5. flags.legal_risk = true for claims of theft, injury, harassment, food poisoning, or discrimination.
6. flags.recovery_needed = true when a negative experience warrants operational follow-up with the guest.
7. "detected_language" is the language the guest actually wrote in (the ORIGINAL segment when a
   Google translation wrapper is present), as a 2-letter ISO code.
   "summary" must be ONE sentence and MUST be written in that same detected_language.
8. keywords: short salient terms (1-3 words) drawn from the review, with polarity and weight 0..1.

Respond with strict JSON only, no markdown, matching exactly:
{"detected_language":"tr","overall_sentiment":0.0,"sentiment_label":"positive|neutral|negative|mixed","summary":"...","topics":[{"topic_id":"...","sentiment":0.0,"confidence":0.0,"quote":"...","reason":"short why"}],"keywords":[{"term":"...","polarity":"positive|negative|neutral","weight":0.0}],"flags":{"recovery_needed":false,"refund_request":false,"legal_risk":false,"staff_named":[],"is_fake_suspect":false}}`;
}

async function callLLM(
  apiKey: string,
  taxonomy: Taxo[],
  review: { text: string; rating: number | null; platform: string | null },
) {
  const res = await fetch(LOVABLE_API_URL, {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: MODEL,
      temperature: 0.2,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: buildSystemPrompt(taxonomy) },
        {
          role: "user",
          content: `Weak context only — platform: ${review.platform ?? "unknown"}, star rating: ${
            review.rating ?? "n/a"
          }.\n\nREVIEW TEXT (quote verbatim from this exact string):\n"""\n${review.text}\n"""`,
        },
      ],
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(
      `LLM call failed — HTTP ${res.status} ${res.statusText || ""} | body: ${body.slice(0, 800)}`,
    );
  }
  const data = await res.json();
  const content = data?.choices?.[0]?.message?.content || "{}";
  let parsed: any = {};
  try {
    parsed = JSON.parse(content);
  } catch {
    throw new Error(`LLM returned non-JSON content: ${String(content).slice(0, 500)}`);
  }
  return { parsed, usage: data?.usage ?? null };
}

const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, n));

/**
 * Postgres rejects an INSERT ... ON CONFLICT DO UPDATE whose payload contains
 * duplicate constrained tuples (SQLSTATE 21000). The model can legitimately map
 * two separate quotes to the same topic_id, so collapse them here:
 * keep the highest confidence, break ties by higher |sentiment|.
 * NOTE: highlights are NOT deduped by topic — every distinct quote stays.
 */
function dedupeTopicRows(rows: any[]): any[] {
  const byTopic = new Map<string, any>();
  for (const row of rows) {
    const key = String(row.topic_id);
    const prev = byTopic.get(key);
    if (!prev) {
      byTopic.set(key, row);
      continue;
    }
    const better =
      row.confidence > prev.confidence ||
      (row.confidence === prev.confidence &&
        Math.abs(row.sentiment) > Math.abs(prev.sentiment));
    if (better) byTopic.set(key, row);
  }
  return Array.from(byTopic.values());
}

function labelOf(v: any): "positive" | "neutral" | "negative" | "mixed" {
  const s = String(v || "").toLowerCase();
  return s === "positive" || s === "negative" || s === "mixed" ? (s as any) : "neutral";
}

/** Never produce "[object Object]" — Supabase/PostgREST errors are plain objects. */
function serializeError(e: unknown): string {
  if (e instanceof Error) {
    const extra = (e as any).cause ? ` | cause: ${safeJson((e as any).cause)}` : "";
    return `${e.name}: ${e.message}${extra}`;
  }
  if (typeof e === "string") return e;
  if (e && typeof e === "object") {
    const o = e as any;
    // PostgREST error shape
    if (o.message || o.code || o.details || o.hint) {
      return [
        o.code ? `[${o.code}]` : null,
        o.message ?? null,
        o.details ? `details: ${o.details}` : null,
        o.hint ? `hint: ${o.hint}` : null,
      ]
        .filter(Boolean)
        .join(" ");
    }
    return safeJson(o);
  }
  return String(e);
}

function safeJson(v: unknown): string {
  try {
    return JSON.stringify(v);
  } catch {
    return String(v);
  }
}

/**
 * Reconcile a possibly inconsistent (score, label) pair from the model.
 * The score is kept; the label is derived from it when the signs disagree.
 */
function reconcileSentiment(
  score: number,
  label: "positive" | "neutral" | "negative" | "mixed",
): { score: number; label: "positive" | "neutral" | "negative" | "mixed" } {
  const derived: "positive" | "neutral" | "negative" =
    score <= -0.15 ? "negative" : score >= 0.15 ? "positive" : "neutral";
  if (label === "mixed") return { score, label };
  if (label === derived) return { score, label };
  return { score, label: derived };
}

// ---------------------------------------------------------------------------
// Handler
// ---------------------------------------------------------------------------

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  try {
    const body = (await req.json().catch(() => ({}))) as {
      limit?: number;
      business_id?: string;
      review_id?: string;
    };

    const limit = clamp(Number(body.limit ?? 25) || 25, 1, MAX_PER_RUN);
    const businessId = body.business_id;
    const singleReviewId = body.review_id ? String(body.review_id) : null;

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const lovableKey = Deno.env.get("LOVABLE_API_KEY");
    if (!lovableKey) return json({ error: "LOVABLE_API_KEY not configured" }, 500);

    const admin = createClient(supabaseUrl, serviceKey);

    let reviews: any[] | null = null;

    if (singleReviewId) {
      // ---- on-demand: analyze exactly one review, bypassing the window/batch.
      // Ownership is verified against the caller's JWT — never trust the id alone.
      const authHeader = req.headers.get("Authorization") ?? "";
      if (!authHeader.startsWith("Bearer ")) return json({ error: "Unauthorized" }, 401);
      const userClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
        global: { headers: { Authorization: authHeader } },
      });
      const { data: userData, error: userErr } = await userClient.auth.getUser();
      const userId = userData?.user?.id;
      if (userErr || !userId) return json({ error: "Unauthorized" }, 401);

      const { data: row, error: rowErr } = await admin
        .from("reviews")
        .select("id, business_id, platform, rating, text, posted_at, analysis_attempts")
        .eq("id", singleReviewId)
        .maybeSingle();
      if (rowErr) throw rowErr;
      if (!row) return json({ error: "Review not found" }, 404);

      const { data: biz, error: bizErr } = await admin
        .from("businesses")
        .select("id")
        .eq("id", row.business_id)
        .eq("user_id", userId)
        .maybeSingle();
      if (bizErr) throw bizErr;
      if (!biz) return json({ error: "Forbidden" }, 403);

      if (!row.text) return json({ error: "Review has no text to analyze" }, 400);

      // reset attempts so a previously exhausted review can be retried on demand
      await admin
        .from("reviews")
        .update({ analysis_status: "pending", analysis_attempts: 0, analysis_error: null })
        .eq("id", row.id);

      reviews = [{ ...row, analysis_attempts: 0 }];
    } else {
      // ---- claim a batch using the indexed status column.
      // Only the last WINDOW_MONTHS are analyzed; older rows sit in 'deferred'.
      // Over-fetch, then keep only businesses with an active subscription.
      // Non-subscribed businesses' rows stay 'pending' (never marked failed).
      const candidateLimit = Math.min(limit * 10, 1000);
      let q = admin
        .from("reviews")
        .select("id, business_id, platform, rating, text, posted_at, analysis_attempts")
        .in("analysis_status", ["pending", "failed"])
        .lt("analysis_attempts", MAX_ATTEMPTS)
        .not("text", "is", null)
        .gt("posted_at", windowCutoffISO())
        .order("posted_at", { ascending: false })
        .limit(candidateLimit);
      if (businessId) q = q.eq("business_id", businessId);

      const { data, error: selErr } = await q;
      if (selErr) throw selErr;
      const candidates = data ?? [];
      const candidateBizIds = Array.from(
        new Set(candidates.map((r: any) => r.business_id).filter(Boolean)),
      );
      const eligible = await filterBusinessIdsWithSubscription(
        supabaseUrl,
        serviceKey,
        candidateBizIds,
      );
      const skippedNoSub = candidates.filter((r: any) => !eligible.has(r.business_id)).length;
      if (skippedNoSub > 0) {
        console.log(
          `analyze-review: skipped ${skippedNoSub} queued reviews (no active subscription)`,
        );
      }
      reviews = candidates
        .filter((r: any) => eligible.has(r.business_id))
        .slice(0, limit);
    }

    const considered = reviews?.length ?? 0;
    if (considered === 0) {
      return json({
        ok: true,
        considered: 0,
        processed: 0,
        topics_inserted: 0,
        highlights_resolved: 0,
        unresolved_quotes: 0,
        errors: 0,
        model: MODEL,
      });
    }

    // ---- taxonomy filtered by each business's vertical
    const bizIds = Array.from(new Set(reviews!.map((r: any) => r.business_id)));
    const { data: bizRows } = await admin
      .from("businesses")
      .select("id, vertical")
      .in("id", bizIds);
    const verticalOf: Record<string, string> = {};
    for (const b of bizRows ?? []) verticalOf[b.id] = b.vertical ?? "hotel";

    const { data: topics, error: topErr } = await admin
      .from("ci_topics")
      .select("id, category, display_name, is_decision_driver, applies_to_verticals");
    if (topErr || !topics) throw topErr ?? new Error("Failed to load taxonomy");

    const validIds = new Set(topics.map((t: any) => t.id));
    const taxoByVertical = new Map<string, Taxo[]>();
    const taxonomyFor = (vertical: string): Taxo[] => {
      const cached = taxoByVertical.get(vertical);
      if (cached) return cached;
      const filtered = topics
        .filter((t: any) => (t.applies_to_verticals ?? []).includes(vertical))
        .map((t: any) => ({
          id: t.id,
          category: t.category,
          label: (t.display_name?.tr || t.display_name?.en || t.id) as string,
          driver: !!t.is_decision_driver,
        }));
      taxoByVertical.set(vertical, filtered);
      return filtered;
    };

    let processed = 0;
    let topicsInserted = 0;
    let highlightsResolved = 0;
    let unresolvedQuotes = 0;
    let errors = 0;
    let promptTokens = 0;
    let completionTokens = 0;

    for (const r of reviews!) {
      const text: string = r.text ?? "";
      try {
        const vertical = verticalOf[r.business_id] ?? "hotel";
        const taxonomy = taxonomyFor(vertical);
        if (taxonomy.length === 0) throw new Error(`Empty taxonomy for vertical '${vertical}'`);

        const { parsed, usage } = await callLLM(lovableKey, taxonomy, {
          text,
          rating: r.rating,
          platform: r.platform,
        });
        if (usage) {
          promptTokens += Number(usage.prompt_tokens ?? 0);
          completionTokens += Number(usage.completion_tokens ?? 0);
        }

        const allowed = new Set(taxonomy.map((t) => t.id));

        // ---- highlights (server-resolved offsets)
        const rawTopics: any[] = Array.isArray(parsed?.topics) ? parsed.topics : [];
        const spans: Highlight[] = [];
        const topicRows: any[] = [];

        for (const m of rawTopics) {
          if (!m || typeof m !== "object") continue;
          const topicId = String(m.topic_id ?? "").trim();
          const okTopic = topicId && validIds.has(topicId) && allowed.has(topicId);

          let sentiment = Number(m.sentiment);
          if (!isFinite(sentiment)) sentiment = 0;
          sentiment = clamp(sentiment, -1, 1);
          const confidence = Number(m.confidence);

          if (okTopic && isFinite(confidence) && confidence >= 0.5) {
            topicRows.push({
              review_id: r.id,
              review_source: "own",
              business_id: r.business_id,
              competitor_id: null,
              topic_id: topicId,
              sentiment,
              confidence: clamp(confidence, 0, 1),
              excerpt: m.quote ? String(m.quote).slice(0, 280) : null,
              language: parsed?.detected_language ? String(parsed.detected_language).slice(0, 8) : null,
              review_posted_at: r.posted_at ?? null,
            });
          }

          const quote = m.quote ? String(m.quote).slice(0, 400) : "";
          if (!quote) continue;
          const span = resolveSpan(text, quote);
          if (!span) {
            unresolvedQuotes++;
            continue;
          }
          spans.push({
            quote: text.slice(span.start, span.end),
            start: span.start,
            end: span.end,
            polarity: sentiment > 0.15 ? "positive" : sentiment < -0.15 ? "negative" : "neutral",
            topic_id: okTopic ? topicId : null,
            reason: m.reason ? String(m.reason).slice(0, 240) : null,
            _sentiment: sentiment,
          });
        }

        const highlights = mergeSpans(spans).map(({ _sentiment, ...h }) => h);
        highlightsResolved += highlights.length;

        // ---- keywords
        const keywords = (Array.isArray(parsed?.keywords) ? parsed.keywords : [])
          .filter((k: any) => k && k.term)
          .slice(0, 25)
          .map((k: any) => ({
            term: String(k.term).slice(0, 80),
            polarity: ["positive", "negative", "neutral"].includes(String(k.polarity))
              ? String(k.polarity)
              : "neutral",
            weight: clamp(Number(k.weight) || 0, 0, 1),
          }));

        // ---- flags
        const f = parsed?.flags ?? {};
        const flags = {
          recovery_needed: !!f.recovery_needed,
          refund_request: !!f.refund_request,
          legal_risk: !!f.legal_risk,
          staff_named: Array.isArray(f.staff_named)
            ? f.staff_named.slice(0, 10).map((s: any) => String(s).slice(0, 80))
            : [],
          is_fake_suspect: !!f.is_fake_suspect,
        };

        const reconciled = reconcileSentiment(
          clamp(Number(parsed?.overall_sentiment) || 0, -1, 1),
          labelOf(parsed?.sentiment_label),
        );
        const overall = reconciled.score;
        const sentimentLabel = reconciled.label;
        const summary = parsed?.summary ? String(parsed.summary).slice(0, 1000) : null;

        // ---- write: review_analysis
        const { error: raErr } = await admin.from("review_analysis").upsert(
          {
            review_id: r.id,
            business_id: r.business_id,
            overall_sentiment: overall,
            sentiment_label: sentimentLabel,
            detected_language: parsed?.detected_language
              ? String(parsed.detected_language).slice(0, 8)
              : null,
            summary,
            highlights,
            keywords,
            flags,
            model: MODEL,
            prompt_version: PROMPT_VERSION,
            analyzed_at: new Date().toISOString(),
          },
          { onConflict: "review_id" },
        );
        if (raErr) throw raErr;

        // ---- write: ci_review_topics (same shape as extract-topics)
        const uniqueTopicRows = dedupeTopicRows(topicRows);
        if (uniqueTopicRows.length > 0) {
          const { error: topInsErr, count } = await admin
            .from("ci_review_topics")
            .upsert(uniqueTopicRows, {
              onConflict: "review_id,review_source,topic_id",
              count: "exact",
            });
          if (topInsErr) throw topInsErr;
          topicsInserted += count ?? uniqueTopicRows.length;
        }

        // ---- write: legacy columns + status
        const praises = highlights.filter((h) => h.polarity === "positive").map((h) => h.quote);
        const issues = highlights.filter((h) => h.polarity === "negative").map((h) => h.quote);

        const { error: updErr } = await admin
          .from("reviews")
          .update({
            analysis_status: "done",
            analysis_version: PROMPT_VERSION,
            analysis_error: null,
            topics_extracted_at: new Date().toISOString(),
            sentiment: sentimentLabel,
            summary,
            praises,
            issues,
          })
          .eq("id", r.id);
        if (updErr) throw updErr;

        processed++;

        // WhatsApp bildirimi — ana akışı bozmasın, sadece logla.
        // Sadece son 48 saatte gelmiş yorumlar bildirim üretir; birikmiş eski
        // yorumlar analiz edilir ama bildirim yağmuru oluşturmaz.
        const postedAtMs = r.posted_at ? new Date(r.posted_at).getTime() : NaN;
        const isFresh =
          Number.isFinite(postedAtMs) &&
          Date.now() - postedAtMs <= WA_NOTIFY_MAX_AGE_HOURS * 3600 * 1000;
        if (!isFresh) {
          console.log(`wa-notify skipped (stale review ${r.id}, posted_at=${r.posted_at})`);
        } else try {
          const waRes = await fetch(`${Deno.env.get("SUPABASE_URL")}/functions/v1/wa-notify`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
            },
            body: JSON.stringify({ review_id: r.id }),
          });
          if (!waRes.ok) {
            console.error("wa-notify call failed", waRes.status, await waRes.text());
          }
        } catch (waErr) {
          console.error("wa-notify call error:", waErr instanceof Error ? waErr.message : waErr);
        }
      } catch (e) {
        errors++;
        const message = serializeError(e);
        console.error(`analyze-review failed for ${r.id}:`, message);
        const attempts = Number(r.analysis_attempts ?? 0) + 1;
        await admin
          .from("reviews")
          .update({
            analysis_attempts: attempts,
            analysis_error: message.slice(0, 1000),
            analysis_status: attempts >= MAX_ATTEMPTS ? "failed" : "pending",
          })
          .eq("id", r.id);
      }
    }

    const result = {
      ok: true,
      considered,
      processed,
      topics_inserted: topicsInserted,
      highlights_resolved: highlightsResolved,
      unresolved_quotes: unresolvedQuotes,
      errors,
      model: MODEL,
      prompt_version: PROMPT_VERSION,
      usage: { prompt_tokens: promptTokens, completion_tokens: completionTokens },
    };
    console.log("analyze-review run:", JSON.stringify(result));
    return json(result);
  } catch (e) {
    console.error("analyze-review error:", e);
    return json({ error: serializeError(e) }, 500);
  }
});
