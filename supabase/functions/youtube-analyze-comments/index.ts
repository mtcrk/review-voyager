import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CommentRow {
  id: string;
  comment_text: string;
}

interface AnalysisItem {
  id: string;
  sentiment: "positive" | "negative" | "neutral";
  score: number;
  summary_tr: string;
  topics: string[];
  translated_tr: string;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { business_id, only_unanalyzed = true, limit = 100 } = await req.json();
    if (!business_id) throw new Error("business_id required");

    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) throw new Error("LOVABLE_API_KEY missing");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    let query = supabase
      .from("youtube_comments")
      .select("id, comment_text")
      .eq("business_id", business_id)
      .order("commented_at", { ascending: false })
      .limit(limit);
    if (only_unanalyzed) query = query.is("sentiment", null);

    const { data: rows, error } = await query;
    if (error) throw error;
    const comments = (rows ?? []) as CommentRow[];

    if (comments.length === 0) {
      return new Response(JSON.stringify({ success: true, analyzed: 0 }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Process in batches of 20 to fit context windows
    const batchSize = 20;
    let totalAnalyzed = 0;

    for (let i = 0; i < comments.length; i += batchSize) {
      const batch = comments.slice(i, i + batchSize);
      const payload = batch.map((c) => ({ id: c.id, text: c.comment_text }));

      const aiResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            {
              role: "system",
              content:
                "Sen bir sosyal medya yorum analisti'sın. Verilen YouTube yorumlarını analiz et: her biri için sentiment (positive/negative/neutral), 0-1 arası confidence score, kısa Türkçe özet (max 80 karakter), 1-3 ana konu (Türkçe, kısa etiket), ve yorumun TÜRKÇE çevirisi (zaten Türkçeyse aynı metin). Mutlaka analyze_comments tool'unu kullan.",
            },
            { role: "user", content: JSON.stringify(payload) },
          ],
          tools: [
            {
              type: "function",
              function: {
                name: "analyze_comments",
                description: "Her yorum için sentiment analizi sonuçlarını döndür.",
                parameters: {
                  type: "object",
                  properties: {
                    items: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          id: { type: "string" },
                          sentiment: { type: "string", enum: ["positive", "negative", "neutral"] },
                          score: { type: "number" },
                          summary_tr: { type: "string" },
                          topics: { type: "array", items: { type: "string" } },
                          translated_tr: { type: "string" },
                        },
                        required: ["id", "sentiment", "score", "summary_tr", "topics", "translated_tr"],
                        additionalProperties: false,
                      },
                    },
                  },
                  required: ["items"],
                  additionalProperties: false,
                },
              },
            },
          ],
          tool_choice: { type: "function", function: { name: "analyze_comments" } },
        }),
      });

      if (!aiResp.ok) {
        const errText = await aiResp.text();
        console.error("AI error:", aiResp.status, errText);
        if (aiResp.status === 429) {
          return new Response(JSON.stringify({ error: "Rate limit aşıldı, biraz sonra tekrar deneyin." }), {
            status: 429,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        if (aiResp.status === 402) {
          return new Response(JSON.stringify({ error: "Lovable AI kredisi tükendi, lütfen kredi ekleyin." }), {
            status: 402,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        throw new Error(`AI gateway error: ${aiResp.status}`);
      }

      const aiData = await aiResp.json();
      const toolCall = aiData?.choices?.[0]?.message?.tool_calls?.[0];
      if (!toolCall) {
        console.error("No tool call returned", JSON.stringify(aiData));
        continue;
      }
      let parsed: { items: AnalysisItem[] };
      try {
        parsed = JSON.parse(toolCall.function.arguments);
      } catch (e) {
        console.error("Failed to parse tool args:", e);
        continue;
      }

      // Update each row
      const now = new Date().toISOString();
      await Promise.all(
        parsed.items.map((it) =>
          supabase
            .from("youtube_comments")
            .update({
              sentiment: it.sentiment,
              sentiment_score: it.score,
              sentiment_summary: it.summary_tr,
              sentiment_topics: it.topics,
              sentiment_translated_text: it.translated_tr,
              analyzed_at: now,
            })
            .eq("id", it.id)
            .eq("business_id", business_id),
        ),
      );
      totalAnalyzed += parsed.items.length;
    }

    return new Response(JSON.stringify({ success: true, analyzed: totalAnalyzed }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("youtube-analyze-comments error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : String(e) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});