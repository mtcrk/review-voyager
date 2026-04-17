import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function renderStars(rating: number): string {
  return "★".repeat(rating) + "☆".repeat(5 - rating);
}

function getRatingColor(rating: number): string {
  if (rating >= 4) return "#16a34a";
  if (rating >= 3) return "#d97706";
  return "#dc2626";
}

function getSentimentLabel(rating: number): string {
  if (rating >= 4) return "Olumlu";
  if (rating >= 3) return "Nötr";
  return "Olumsuz";
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

    if (!RESEND_API_KEY) {
      console.error("RESEND_API_KEY not configured");
      return new Response(JSON.stringify({ error: "RESEND_API_KEY not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey);
    const { reviews, business_id } = await req.json();

    if (!reviews || !Array.isArray(reviews) || reviews.length === 0) {
      return new Response(JSON.stringify({ message: "No reviews" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: business, error: bizError } = await supabase
      .from("businesses")
      .select("id, name, user_id, review_notification_type, language")
      .eq("id", business_id)
      .single();

    if (bizError || !business) {
      console.error("Business not found:", bizError);
      return new Response(JSON.stringify({ error: "Business not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ============================================================
    // HARD GUARD #1: Only 'instant' mode sends real-time emails.
    // 'daily', 'negative_only', 'none' → SKIP entirely.
    // ============================================================
    if (business.review_notification_type !== "instant") {
      console.log(`Skipping — "${business.name}" is on '${business.review_notification_type}' mode`);
      return new Response(JSON.stringify({ message: "Not in instant mode" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ============================================================
    // HARD GUARD #2: Burst protection.
    // If >5 reviews ingested in last hour → SKIP (likely backfill).
    // ============================================================
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const { count: recentCount } = await supabase
      .from("reviews")
      .select("id", { count: "exact", head: true })
      .eq("business_id", business_id)
      .gte("created_at", oneHourAgo);

    if ((recentCount ?? 0) > 5) {
      console.log(`Skipping — burst detected (${recentCount} reviews/h for "${business.name}")`);
      return new Response(
        JSON.stringify({ message: "Burst protection triggered", recentCount }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const filteredReviews = reviews;

    const { data: { user }, error: userError } = await supabase.auth.admin.getUserById(business.user_id);

    if (userError || !user?.email) {
      console.error("User not found:", userError);
      return new Response(JSON.stringify({ error: "User email not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const APP_URL = "https://voyagerespondcom.lovable.app";

    const reviewCards = filteredReviews.map((review: any) => {
      const ratingColor = getRatingColor(review.rating);
      const stars = renderStars(review.rating);
      const sentimentLabel = getSentimentLabel(review.rating);
      const reviewUrl = `${APP_URL}/reviews/${review.id}`;
      const truncatedText = review.text
        ? review.text.length > 300
          ? review.text.substring(0, 300) + "..."
          : review.text
        : "Yorum metni yok";

      return `
        <div style="background:#fff;border:1px solid #e5e7eb;border-radius:12px;padding:24px;margin-bottom:16px;">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
            <div>
              <span style="font-weight:600;font-size:16px;color:#111827;">${review.reviewer_name}</span>
              <span style="color:${ratingColor};font-size:18px;margin-left:8px;letter-spacing:2px;">${stars}</span>
            </div>
            <span style="background:${ratingColor}15;color:${ratingColor};padding:4px 10px;border-radius:20px;font-size:12px;font-weight:500;">${sentimentLabel}</span>
          </div>
          <div style="background:#f9fafb;border-radius:8px;padding:16px;margin-bottom:16px;">
            <p style="margin:0;font-size:14px;color:#374151;line-height:1.6;">"${truncatedText}"</p>
          </div>
          ${review.suggested_reply ? `
          <div style="border-left:3px solid #6366f1;padding-left:16px;margin-bottom:16px;">
            <p style="margin:0 0 6px 0;font-size:12px;font-weight:600;color:#6366f1;text-transform:uppercase;letter-spacing:0.5px;">🤖 AI Önerilen Yanıt</p>
            <p style="margin:0;font-size:14px;color:#4b5563;line-height:1.6;">${review.suggested_reply.length > 400 ? review.suggested_reply.substring(0, 400) + "..." : review.suggested_reply}</p>
          </div>` : ""}
          <div style="text-align:center;">
            <a href="${reviewUrl}" style="display:inline-block;background:#6366f1;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px;">Yorumu İncele ve Yanıtla</a>
          </div>
        </div>`;
    }).join("");

    const reviewCount = filteredReviews.length;
    const subject = reviewCount === 1
      ? `⭐ Yeni Yorum: ${filteredReviews[0].reviewer_name} — ${renderStars(filteredReviews[0].rating)} | ${business.name}`
      : `⭐ ${reviewCount} Yeni Yorum | ${business.name}`;

    const emailHtml = `<!DOCTYPE html><html><head><meta charset="utf-8"></head>
      <body style="margin:0;padding:0;background:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
        <div style="max-width:600px;margin:0 auto;padding:24px;">
          <div style="background:linear-gradient(135deg,#1a1a2e 0%,#16213e 100%);border-radius:12px;padding:28px;color:white;margin-bottom:20px;text-align:center;">
            <h1 style="margin:0 0 8px 0;font-size:22px;font-weight:700;">${reviewCount === 1 ? "Yeni Yorum Geldi!" : `${reviewCount} Yeni Yorum Geldi!`}</h1>
            <p style="margin:0;opacity:0.85;font-size:14px;">${business.name}</p>
          </div>
          ${reviewCards}
          <div style="text-align:center;margin-top:24px;">
            <a href="${APP_URL}/reviews" style="display:inline-block;background:#fff;color:#6366f1;border:2px solid #6366f1;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px;">Tüm Yorumları Gör</a>
          </div>
          <div style="text-align:center;margin-top:32px;padding-top:20px;border-top:1px solid #e5e7eb;">
            <p style="color:#9ca3af;font-size:12px;margin:0;">VoyageRespond • Yorum Bildirim Sistemi</p>
            <p style="color:#9ca3af;font-size:11px;margin:4px 0 0 0;">Bildirim tercihlerinizi <a href="${APP_URL}/settings?tab=notifications" style="color:#6366f1;">Ayarlar</a> sayfasından değiştirebilirsiniz.</p>
          </div>
        </div>
      </body></html>`;

    const ADMIN_BCC = "metecorukbasari@gmail.com";

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "VoyageRespond <notify@voyagerespond.com>",
        to: [user.email],
        bcc: user.email === ADMIN_BCC ? undefined : [ADMIN_BCC],
        subject,
        html: emailHtml,
      }),
    });

    const result = await res.json();
    console.log(`Notification email sent to ${user.email} for ${reviewCount} reviews:`, result);

    return new Response(JSON.stringify({ success: true, emailsSent: 1, reviewsNotified: reviewCount }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Error in notify-new-review:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
