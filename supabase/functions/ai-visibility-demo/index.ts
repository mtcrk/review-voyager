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
    const { businessName } = await req.json();

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

    const systemPrompt = `Sen bir AI Visibility uzmanısın. Kullanıcının verdiği işletme adını analiz edip, o işletmenin Google ve AI arama motorlarında nasıl göründüğü hakkında demo amaçlı bir analiz oluştur.

KURALLAR:
- Bu bir DEMO, gerçek veri değil. Makul ve gerçekçi değerler üret.
- Türkçe yanıt ver.
- JSON formatında yanıt ver, başka hiçbir şey yazma.

JSON formatı:
{
  "visibilityScore": 45-85 arası bir sayı,
  "strengths": ["güçlü yön 1", "güçlü yön 2"],
  "improvements": ["geliştirilmesi gereken 1", "geliştirilmesi gereken 2"],
  "aiPerception": "AI asistanların bu işletmeyi nasıl algıladığına dair 1-2 cümle",
  "recommendation": "Ana öneri (1 cümle)"
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
          { role: "user", content: `İşletme adı: "${businessName}"` },
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
      // Try to extract JSON from the response
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
        strengths: ["İşletme adı akılda kalıcı", "Sektörde potansiyel var"],
        improvements: ["Online varlık güçlendirilebilir", "Müşteri yorumları artırılabilir"],
        aiPerception: "AI asistanlar bu işletmeyi henüz yeterince tanımıyor olabilir.",
        recommendation: "Google Business Profile oluşturup müşteri yorumlarına yanıt vermeye başlayın.",
      };
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        businessName: businessName.trim(),
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
