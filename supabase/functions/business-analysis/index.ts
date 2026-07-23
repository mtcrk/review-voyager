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

    const { business_id } = await req.json();
    if (!business_id) throw new Error("business_id is required");

    // Fetch reviews
    const { data: reviews, error: reviewError } = await supabase
      .from("reviews")
      .select("*")
      .eq("business_id", business_id)
      .order("posted_at", { ascending: false })
      .limit(200);

    if (reviewError) throw reviewError;

    if (!reviews || reviews.length === 0) {
      return new Response(
        JSON.stringify({ error: "No reviews found for analysis" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch reply logs for performance metrics
    const { data: replyLogs } = await supabase
      .from("reply_logs")
      .select("*")
      .eq("business_id", business_id)
      .order("created_at", { ascending: false })
      .limit(200);

    // Build review summary for AI
    const reviewSummary = reviews.map((r: any) => ({
      rating: r.rating,
      text: r.text?.substring(0, 300) || "",
      sentiment: r.sentiment,
      posted_at: r.posted_at,
      status: r.status,
      platform: r.platform,
    }));

    // Calculate basic stats
    const totalReviews = reviews.length;
    const avgRating = reviews.reduce((s: number, r: any) => s + r.rating, 0) / totalReviews;
    const sentimentCounts = {
      positive: reviews.filter((r: any) => r.sentiment === "positive").length,
      neutral: reviews.filter((r: any) => r.sentiment === "neutral").length,
      negative: reviews.filter((r: any) => r.sentiment === "negative").length,
    };
    const repliedCount = reviews.filter((r: any) => r.status === "replied").length;
    const replyRate = totalReviews > 0 ? (repliedCount / totalReviews) * 100 : 0;

    // Reply performance
    const avgResponseTime = replyLogs && replyLogs.length > 0
      ? replyLogs.reduce((s: number, l: any) => s + (l.response_time_hours || 0), 0) / replyLogs.length
      : null;

    const prompt = `Sen kıdemli bir müşteri deneyimi analistisin. Aşağıdaki yorumları analiz edip TÜRKÇE, TEMİZ ve MADDE MADDE bir rapor yaz.

VERİLER:
- Toplam Yorum: ${totalReviews}
- Ortalama Puan: ${avgRating.toFixed(1)}/5
- Duygu: Pozitif ${sentimentCounts.positive} • Nötr ${sentimentCounts.neutral} • Negatif ${sentimentCounts.negative}
- Yanıt Oranı: %${replyRate.toFixed(0)}${avgResponseTime !== null ? ` • Ortalama Yanıt Süresi: ${avgResponseTime.toFixed(1)} saat` : ""}

YORUMLAR (JSON, en yeni ${Math.min(totalReviews, 200)}):
${JSON.stringify(reviewSummary, null, 0)}

ÇIKTI KURALLARI (ÇOK ÖNEMLİ):
- Sadece Markdown döndür. Girişe/kapanışa selamlama, açıklama, "işte rapor" gibi cümleler EKLEME.
- Her başlık altında SADECE kısa bullet maddeler kullan; paragraf yazma.
- Her bullet en fazla 1 cümle (maks. 20 kelime). Süslü dil yok, net ve iş odaklı yaz.
- Somut örnek verirken tırnak içinde 5-10 kelimelik alıntı kullan.
- Yüzde/sayı verdiğinde net rakam yaz. Uydurma; sadece verilerden çıkar.
- Aynı fikri iki başlıkta tekrarlama.
- Emoji SADECE başlıklarda kullan.

TAM OLARAK ŞU YAPIYI KULLAN:

## 📊 Özet
- 3-4 madde: genel durum, ortalama puan yorumu, en dikkat çekici trend, öncelikli aksiyon.

## 💪 Güçlü Yönler
- 4-6 madde. Format: **Konu** — kısa açıklama. Örn: **Temizlik** — "odalar tertemiz" (12 yorumda geçiyor).

## ⚠️ İyileştirme Alanları
- 4-6 madde. Format: **Sorun** — etkisi + örnek alıntı.

## 📈 Trend
- 3-4 madde: son 30/90 gün karşılaştırması, puan yönü, artan/azalan şikayet konuları.

## 🎯 Aksiyon Önerileri
- 4-6 madde. Her madde şu formatta: **Aksiyon** — beklenen etki (kısa).
- Öncelik sırasına göre yaz (en kritik en üstte).

## 🔑 Anahtar Konular
- Tek satırda virgülle ayrılmış 8-12 konu (ör: temizlik (24), personel (18), kahvaltı (15) ...). Parantez içinde yaklaşık geçme sayısı.`;

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: "Sen profesyonel bir işletme danışmanı ve yorum analiz uzmanısın." },
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
    const analysisText = aiData.choices?.[0]?.message?.content || "";

    // Return everything
    return new Response(
      JSON.stringify({
        analysis: analysisText,
        stats: {
          totalReviews,
          avgRating: parseFloat(avgRating.toFixed(1)),
          sentimentCounts,
          replyRate: parseFloat(replyRate.toFixed(0)),
          avgResponseTimeHours: avgResponseTime ? parseFloat(avgResponseTime.toFixed(1)) : null,
          repliedCount,
          pendingCount: reviews.filter((r: any) => r.status === "pending_reply" || !r.status).length,
        },
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
