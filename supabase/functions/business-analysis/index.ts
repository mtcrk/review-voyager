import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Missing authorization header");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const {
      business_id,
      start_date,
      end_date,
      platforms,
      language = "tr",
      report_type = "executive",
    } = await req.json();
    if (!business_id) throw new Error("business_id is required");

    // Determine period window
    const now = new Date();
    const to = end_date ? new Date(end_date) : now;
    const from = start_date ? new Date(start_date) : new Date(to.getTime() - 30 * 86400000);
    const windowMs = to.getTime() - from.getTime();
    const prevTo = new Date(from.getTime() - 1);
    const prevFrom = new Date(prevTo.getTime() - windowMs);

    // Fetch reviews inside window (+ small buffer for prev period metrics)
    let query = supabase
      .from("reviews")
      .select("*")
      .eq("business_id", business_id)
      .gte("posted_at", prevFrom.toISOString())
      .lte("posted_at", to.toISOString())
      .order("posted_at", { ascending: false });

    if (Array.isArray(platforms) && platforms.length > 0) {
      query = query.in("platform", platforms);
    }
    const { data: allReviews, error: reviewError } = await query;

    if (reviewError) throw reviewError;

    const inWindow = (r: any, a: Date, b: Date) => {
      const d = new Date(r.posted_at).getTime();
      return d >= a.getTime() && d <= b.getTime();
    };
    const reviews = (allReviews || []).filter((r: any) => inWindow(r, from, to));
    const prevReviews = (allReviews || []).filter((r: any) => inWindow(r, prevFrom, prevTo));

    if (reviews.length === 0) {
      return new Response(
        JSON.stringify({ error: "Seçili dönemde yorum bulunamadı." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch reply logs for performance metrics
    const { data: replyLogs } = await supabase
      .from("reply_logs")
      .select("*")
      .eq("business_id", business_id)
      .gte("created_at", from.toISOString())
      .lte("created_at", to.toISOString())
      .order("created_at", { ascending: false });

    // ---- Compute stats for current & previous period ----
    const computeStats = (arr: any[]) => {
      const total = arr.length;
      const avg = total > 0 ? arr.reduce((s, r) => s + (r.rating || 0), 0) / total : 0;
      const sent = {
        positive: arr.filter((r) => r.sentiment === "positive").length,
        neutral: arr.filter((r) => r.sentiment === "neutral").length,
        negative: arr.filter((r) => r.sentiment === "negative").length,
      };
      const replied = arr.filter((r) => r.status === "replied").length;
      const replyRate = total > 0 ? (replied / total) * 100 : 0;
      return { total, avg, sent, replied, replyRate };
    };
    const cur = computeStats(reviews);
    const prev = computeStats(prevReviews);

    const avgResponseTime = replyLogs && replyLogs.length > 0
      ? replyLogs.reduce((s: number, l: any) => s + (l.response_time_hours || 0), 0) / replyLogs.length
      : null;

    const pct = (a: number, b: number) => (b === 0 ? null : ((a - b) / b) * 100);

    // Platform breakdown
    const platformCounts: Record<string, number> = {};
    reviews.forEach((r: any) => {
      platformCounts[r.platform] = (platformCounts[r.platform] || 0) + 1;
    });

    // Build compact review sample for AI (cap tokens)
    const sample = reviews.slice(0, 180).map((r: any) => ({
      r: r.rating,
      s: r.sentiment,
      p: r.platform,
      d: r.posted_at?.substring(0, 10),
      t: (r.text || r.content || "").substring(0, 260),
    }));

    const isEN = language === "en";
    const langInstr = isEN
      ? "Write ALL output text in professional English business language."
      : "TÜM çıktı metnini profesyonel Türkçe iş dilinde yaz. Pazarlama dili, emoji, abartı KULLANMA.";

    const reportTypeInstr = report_type === "detailed"
      ? (isEN ? "Deep detailed analysis. 6-8 themes each side, 5-7 actions." : "Detaylı analiz. Her taraf için 6-8 tema, 5-7 aksiyon.")
      : report_type === "competitor"
      ? (isEN ? "Executive summary framed as competitive benchmarking against local hospitality standards." : "Rakip kıyaslama çerçevesinde yönetici özeti; yerel sektör standartlarına göre konumlan.")
      : (isEN ? "Concise executive summary. 4 themes each side, 4-5 actions." : "Kısa yönetici özeti. Her taraf için 4 tema, 4-5 aksiyon.");

    const prompt = `${langInstr}
${reportTypeInstr}

CONTEXT DATA (do not repeat verbatim; derive insights):
- Period: ${from.toISOString().slice(0,10)} → ${to.toISOString().slice(0,10)}
- Reviews: ${cur.total} (prev period: ${prev.total})
- Avg rating: ${cur.avg.toFixed(2)}/5 (prev: ${prev.avg.toFixed(2)})
- Sentiment: +${cur.sent.positive} / =${cur.sent.neutral} / -${cur.sent.negative}
- Reply rate: ${cur.replyRate.toFixed(0)}%${avgResponseTime !== null ? ` • Avg response time: ${avgResponseTime.toFixed(1)}h` : ""}
- Platforms: ${JSON.stringify(platformCounts)}

REVIEWS (JSON, ${sample.length} most recent):
${JSON.stringify(sample)}

Return ONLY valid JSON matching this exact TypeScript shape — no prose, no markdown fences:
{
  "executiveSummary": string[],            // 4-6 bullets, action-oriented, <=22 words each
  "strengths": Array<{ "topic": string, "description": string, "count": number, "quote": string }>,   // count = approx mentions, quote 5-12 words in original language
  "improvements": Array<{ "topic": string, "description": string, "count": number, "quote": string }>,
  "themes": Array<{ "name": string, "count": number, "sentiment": "positive"|"neutral"|"negative" }>, // 8-12 recurring themes
  "actions": Array<{ "title": string, "description": string, "impact": "high"|"medium"|"low", "effort": "high"|"medium"|"low" }>,   // ordered by priority
  "trend": string[]                        // 3-4 bullets comparing current vs previous period
}

Rules: Use ONLY facts derivable from the data. Never invent numbers. Quotes must be real fragments from reviews. Keep each bullet <=22 words. No emoji anywhere.`;

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content: isEN
              ? "You are a senior customer experience consultant producing enterprise-grade B2B reports. Return strict JSON only."
              : "Sen kurumsal B2B raporlar üreten kıdemli bir müşteri deneyimi danışmanısın. Sadece geçerli JSON döndür.",
          },
          { role: "user", content: prompt },
        ],
      }),
    });

    if (!aiResponse.ok) {
      if (aiResponse.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit aşıldı, lütfen biraz bekleyin." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (aiResponse.status === 402) {
        return new Response(JSON.stringify({ error: "AI kredi limiti doldu." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errText = await aiResponse.text();
      console.error("AI gateway error:", aiResponse.status, errText);
      throw new Error("AI analysis failed");
    }

    const aiData = await aiResponse.json();
    const raw = aiData.choices?.[0]?.message?.content || "{}";
    let structured: any = {};
    try {
      structured = JSON.parse(raw);
    } catch {
      const m = raw.match(/\{[\s\S]*\}/);
      structured = m ? JSON.parse(m[0]) : {};
    }

    return new Response(
      JSON.stringify({
        structured,
        stats: {
          totalReviews: cur.total,
          avgRating: parseFloat(cur.avg.toFixed(2)),
          sentimentCounts: cur.sent,
          replyRate: parseFloat(cur.replyRate.toFixed(0)),
          avgResponseTimeHours: avgResponseTime ? parseFloat(avgResponseTime.toFixed(1)) : null,
          repliedCount: cur.replied,
          pendingCount: reviews.filter((r: any) => r.status === "pending_reply" || !r.status).length,
          platformCounts,
        },
        deltas: {
          totalReviews: pct(cur.total, prev.total),
          avgRating: pct(cur.avg, prev.avg),
          replyRate: pct(cur.replyRate, prev.replyRate),
          positive: pct(cur.sent.positive, prev.sent.positive),
          negative: pct(cur.sent.negative, prev.sent.negative),
        },
        period: { from: from.toISOString(), to: to.toISOString() },
        previousPeriod: { from: prevFrom.toISOString(), to: prevTo.toISOString() },
        replyLogs: replyLogs || [],
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in business-analysis:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
