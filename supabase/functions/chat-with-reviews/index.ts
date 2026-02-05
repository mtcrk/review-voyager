import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, businessId } = await req.json();
    
    if (!message || !businessId) {
      return new Response(
        JSON.stringify({ error: "Message and businessId are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch reviews for the business
    const { data: reviews, error: reviewsError } = await supabase
      .from("reviews")
      .select("*")
      .eq("business_id", businessId)
      .order("posted_at", { ascending: false })
      .limit(100);

    if (reviewsError) {
      throw new Error(`Failed to fetch reviews: ${reviewsError.message}`);
    }

    // Prepare review context
    const reviewContext = reviews?.length > 0 
      ? reviews.map(r => ({
          reviewer: r.reviewer_name,
          rating: r.rating,
          text: r.text || "Metin yok",
          sentiment: r.sentiment || "bilinmiyor",
          status: r.status,
          date: r.posted_at,
          issues: r.issues || [],
          praises: r.praises || []
        }))
      : [];

    const systemPrompt = `Sen bir işletmenin müşteri yorumlarını analiz eden uzman bir AI asistansın. 
Türkçe yanıt ver. İşletmenin toplam ${reviewContext.length} yorumu var.

İşte yorumların özeti:
- Toplam Yorum: ${reviewContext.length}
- Ortalama Puan: ${reviewContext.length > 0 ? (reviewContext.reduce((sum, r) => sum + r.rating, 0) / reviewContext.length).toFixed(1) : 'N/A'}
- Pozitif Yorumlar: ${reviewContext.filter(r => r.sentiment === 'positive').length}
- Nötr Yorumlar: ${reviewContext.filter(r => r.sentiment === 'neutral').length}
- Negatif Yorumlar: ${reviewContext.filter(r => r.sentiment === 'negative').length}
- Yanıt Bekleyen: ${reviewContext.filter(r => r.status === 'pending_reply').length}

Son 20 yorum detayı:
${JSON.stringify(reviewContext.slice(0, 20), null, 2)}

Kullanıcının sorularına bu veriler ışığında yanıt ver. Spesifik örnekler ve rakamlar ver.
Eğer kullanıcı genel bir soru sorarsa, önemli trendleri ve önerileri paylaş.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: message },
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required. Please add funds." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error("AI gateway error");
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });

  } catch (error) {
    console.error("Chat error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
