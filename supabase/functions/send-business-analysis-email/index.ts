import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const ADMIN_EMAIL = "metecorukbasari@gmail.com";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { business_id, trigger_source } = await req.json();
    if (!business_id) throw new Error("business_id is required");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!RESEND_API_KEY) throw new Error("RESEND_API_KEY not configured");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const admin = createClient(supabaseUrl, serviceKey);

    // Fetch business + owner
    const { data: business, error: bizErr } = await admin
      .from("businesses")
      .select("id, name, user_id, city")
      .eq("id", business_id)
      .single();
    if (bizErr || !business) throw new Error("Business not found");

    const { data: userData } = await admin.auth.admin.getUserById(business.user_id);
    const ownerEmail = userData?.user?.email;

    const { data: profile } = await admin
      .from("profiles")
      .select("full_name")
      .eq("user_id", business.user_id)
      .maybeSingle();
    const ownerName = profile?.full_name || "İşletme Sahibi";

    // Get total review count
    const { count: totalReviewCount } = await admin
      .from("reviews")
      .select("*", { count: "exact", head: true })
      .eq("business_id", business_id);

    // Fetch reviews for analysis (cap at 500 for AI context)
    const { data: reviews } = await admin
      .from("reviews")
      .select("rating, text, sentiment, posted_at, status, platform")
      .eq("business_id", business_id)
      .order("posted_at", { ascending: false })
      .limit(500);

    if (!reviews || reviews.length === 0) {
      return new Response(
        JSON.stringify({ skipped: true, reason: "No reviews yet" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const sampleSize = reviews.length;
    const totalReviews = totalReviewCount ?? sampleSize;
    const avgRating = reviews.reduce((s, r) => s + r.rating, 0) / sampleSize;
    const sentimentCounts = {
      positive: reviews.filter((r) => r.sentiment === "positive").length,
      neutral: reviews.filter((r) => r.sentiment === "neutral").length,
      negative: reviews.filter((r) => r.sentiment === "negative").length,
    };
    const repliedCount = reviews.filter((r) => r.status === "replied").length;
    const replyRate = (repliedCount / sampleSize) * 100;

    const reviewSummary = reviews.slice(0, 100).map((r) => ({
      rating: r.rating,
      text: r.text?.substring(0, 250) || "",
      sentiment: r.sentiment,
      platform: r.platform,
    }));

    const prompt = `Sen bir işletme analiz uzmanısın. "${business.name}" işletmesi için Türkçe kapsamlı analiz raporu hazırla.

İSTATİSTİKLER (toplam ${totalReviews} yorum üzerinden, son ${sampleSize} yorum analiz ediliyor):
- Toplam Yorum: ${totalReviews}
- Analiz Edilen Örneklem: ${sampleSize}
- Ortalama Puan (örneklem): ${avgRating.toFixed(1)}/5
- Pozitif: ${sentimentCounts.positive}, Nötr: ${sentimentCounts.neutral}, Negatif: ${sentimentCounts.negative}
- Yanıt Oranı (örneklem): %${replyRate.toFixed(0)}

YORUMLAR:
${JSON.stringify(reviewSummary)}

Şu başlıklar altında HTML formatında yaz (h2, p, ul, li kullan, başka HTML tag yok):
<h2>📊 Genel Durum</h2>
<h2>💪 Güçlü Yönler</h2>
<h2>⚠️ İyileştirme Alanları</h2>
<h2>🎯 Aksiyon Önerileri</h2>
<h2>🔑 Anahtar Konular</h2>

Profesyonel ve net ol. Sadece HTML döndür, markdown veya code block kullanma.`;

    const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: "Profesyonel işletme danışmanısın. HTML formatında yanıt ver." },
          { role: "user", content: prompt },
        ],
      }),
    });

    if (!aiRes.ok) {
      const t = await aiRes.text();
      throw new Error(`AI failed: ${aiRes.status} ${t}`);
    }

    const aiData = await aiRes.json();
    let analysisHtml = aiData.choices?.[0]?.message?.content || "";
    // Strip code fences if any
    analysisHtml = analysisHtml.replace(/```html\s*/gi, "").replace(/```\s*$/g, "").trim();

    const sourceLabel = trigger_source === "new_connection"
      ? "🆕 Yeni Google Bağlantısı Sonrası İlk Analiz"
      : "📊 İşletme Analiz Raporu";

    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 680px; margin: 0 auto; padding: 20px; background: #ffffff;">
        <div style="background: linear-gradient(135deg, #7A5AF8 0%, #635BFF 100%); border-radius: 12px; padding: 28px; color: white; margin-bottom: 20px;">
          <p style="margin: 0 0 6px 0; opacity: 0.85; font-size: 13px;">${sourceLabel}</p>
          <h1 style="margin: 0; font-size: 22px;">${business.name}</h1>
          ${business.city ? `<p style="margin: 6px 0 0 0; opacity: 0.85; font-size: 14px;">${business.city}</p>` : ""}
        </div>

        <div style="background: #f8f9fa; border-radius: 12px; padding: 20px; margin-bottom: 20px;">
          <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
            <tr><td style="padding: 6px 0; color: #666;">Toplam Yorum</td><td style="padding: 6px 0; font-weight: 600; text-align: right;">${totalReviews}${sampleSize < totalReviews ? ` <span style="color:#999;font-weight:400;">(son ${sampleSize} analiz edildi)</span>` : ""}</td></tr>
            <tr><td style="padding: 6px 0; color: #666;">Ortalama Puan</td><td style="padding: 6px 0; font-weight: 600; text-align: right;">⭐ ${avgRating.toFixed(1)}/5</td></tr>
            <tr><td style="padding: 6px 0; color: #666;">Yanıt Oranı</td><td style="padding: 6px 0; font-weight: 600; text-align: right;">%${replyRate.toFixed(0)}</td></tr>
            <tr><td style="padding: 6px 0; color: #666;">Pozitif / Negatif</td><td style="padding: 6px 0; font-weight: 600; text-align: right;">${sentimentCounts.positive} / ${sentimentCounts.negative}</td></tr>
          </table>
        </div>

        <div style="background: #ffffff; border: 1px solid #eaeaea; border-radius: 12px; padding: 24px; line-height: 1.6; color: #222; font-size: 14px;">
          ${analysisHtml}
        </div>

        <div style="text-align: center; margin-top: 24px;">
          <a href="https://voyagerespond.com/dashboard" style="background: #7A5AF8; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px;">Dashboard'da Görüntüle</a>
        </div>

        <p style="text-align: center; color: #999; font-size: 12px; margin-top: 24px;">
          VoyageRespond — AI Yorum Analiz Raporu<br/>
          ${new Date().toLocaleString("tr-TR", { timeZone: "Europe/Istanbul" })}
        </p>
      </div>
    `;

    // Build recipient list: owner (if exists) + admin (always)
    const recipients = new Set<string>();
    if (ownerEmail) recipients.add(ownerEmail);
    recipients.add(ADMIN_EMAIL);

    const subject = `📊 ${business.name} — Analiz Raporu (${totalReviews} yorum${sampleSize < totalReviews ? `, son ${sampleSize} analiz` : ""})`;

    const sendRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "VoyageRespond <notify@voyagerespond.com>",
        reply_to: "metecorukbasari@gmail.com",
        to: Array.from(recipients),
        subject,
        html: emailHtml,
      }),
    });

    const sendResult = await sendRes.json();
    console.log("Analysis email sent:", { business: business.name, recipients: Array.from(recipients), result: sendResult });

    return new Response(
      JSON.stringify({
        success: true,
        recipients: Array.from(recipients),
        business: business.name,
        owner: ownerName,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("send-business-analysis-email error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
