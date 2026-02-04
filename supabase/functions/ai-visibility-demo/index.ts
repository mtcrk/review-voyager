import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { businessName, location } = await req.json();

    if (!businessName || businessName.trim().length < 2) {
      return new Response(
        JSON.stringify({ error: "İşletme adı gerekli" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const locationContext = location ? `Konum: ${location}` : "Konum belirtilmedi (Türkiye geneli)";

    const systemPrompt = `Sen bir AI Visibility ve yerel SEO uzmanısın. Kullanıcının verdiği işletme adını ve konumu analiz edip, o işletmenin Google ve AI arama motorlarında nasıl göründüğü hakkında DETAYLI ve GERÇEKÇİ bir analiz oluştur.

KURALLAR:
- Bu bir DEMO, gerçek veri değil ama ÇOK GERÇEKÇİ olmalı.
- İşletme adından sektörü tahmin et (örn: "Shell" = akaryakıt, "Cafe Botanica" = kafe).
- Konum verilmişse o bölgeye özel analiz yap.
- Türkçe yanıt ver.
- JSON formatında yanıt ver, başka hiçbir şey yazma.

JSON formatı:
{
  "visibilityScore": 45-85 arası bir sayı,
  "sector": "Tahmin edilen sektör (örn: Akaryakıt İstasyonu, Kafe, Restoran)",
  "localRanking": {
    "position": 1-10 arası tahmini sıralama,
    "totalCompetitors": 5-20 arası rakip sayısı,
    "query": "Bu sıralama için kullanılan örnek sorgu (örn: 'Gölbaşı en iyi Shell')"
  },
  "customerSentiment": {
    "overallRating": 3.5-4.8 arası puan,
    "totalReviews": 50-500 arası yorum sayısı,
    "highlights": ["Öne çıkan olumlu özellik 1", "Öne çıkan olumlu özellik 2"],
    "concerns": ["Dikkat edilmesi gereken konu 1"]
  },
  "featuredReviews": [
    {
      "category": "Kategori adı (örn: Hizmet Kalitesi)",
      "summary": "Bu kategorideki yorumların özeti (1-2 cümle)"
    },
    {
      "category": "İkinci kategori",
      "summary": "Özet"
    }
  ],
  "competitors": [
    {
      "name": "Rakip 1 adı",
      "rating": 3.5-4.5 arası,
      "comparison": "Kısa karşılaştırma (örn: 'Daha yüksek puanlı ama daha uzak')"
    },
    {
      "name": "Rakip 2 adı", 
      "rating": 2.5-4.0 arası,
      "comparison": "Kısa karşılaştırma"
    }
  ],
  "aiPerception": "AI asistanların (ChatGPT, Gemini, Copilot) bu işletmeyi nasıl algıladığına dair 2-3 cümle",
  "strengths": ["Güçlü yön 1", "Güçlü yön 2", "Güçlü yön 3"],
  "improvements": ["Geliştirilmesi gereken 1", "Geliştirilmesi gereken 2"],
  "recommendation": "Ana öneri (1-2 cümle)"
}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `İşletme adı: "${businessName}"\n${locationContext}` },
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Çok fazla istek. Lütfen biraz bekleyip tekrar deneyin." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Servis geçici olarak kullanılamıyor." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error("AI servisine bağlanılamadı");
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("AI yanıtı alınamadı");
    }

    // Parse JSON from response
    let analysis;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysis = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("JSON bulunamadı");
      }
    } catch (parseError) {
      console.error("JSON parse error:", parseError, "Content:", content);
      // Fallback response
      analysis = {
        visibilityScore: 62,
        sector: "İşletme",
        localRanking: {
          position: 3,
          totalCompetitors: 8,
          query: `"${businessName} yakınımda"`
        },
        customerSentiment: {
          overallRating: 4.0,
          totalReviews: 127,
          highlights: ["Hızlı hizmet", "Uygun fiyat"],
          concerns: ["Yoğun saatlerde bekleme"]
        },
        featuredReviews: [
          { category: "Hizmet", summary: "Müşteriler genel olarak hizmetten memnun." },
          { category: "Konum", summary: "Ulaşımı kolay bir konumda." }
        ],
        competitors: [
          { name: "Rakip A", rating: 4.2, comparison: "Daha yüksek puanlı" },
          { name: "Rakip B", rating: 3.5, comparison: "Daha düşük puanlı" }
        ],
        aiPerception: "AI asistanlar bu işletmeyi henüz yeterince tanımıyor olabilir.",
        strengths: ["İşletme adı akılda kalıcı", "Sektörde potansiyel var"],
        improvements: ["Online varlık güçlendirilebilir", "Müşteri yorumları artırılabilir"],
        recommendation: "Google Business Profile oluşturup müşteri yorumlarına yanıt vermeye başlayın.",
      };
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        businessName: businessName.trim(),
        location: location?.trim() || null,
        analysis 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("ai-visibility-demo error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Beklenmeyen bir hata oluştu" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});