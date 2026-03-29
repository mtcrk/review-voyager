import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function renderStars(rating: number): string {
  const filled = "★";
  const empty = "☆";
  return filled.repeat(rating) + empty.repeat(5 - rating);
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
      return new Response(JSON.stringify({ message: "No reviews to notify" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get business info and owner email
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

    // Check notification preference
    if (business.review_notification_type === "none") {
      console.log("Notifications disabled for business:", business.name);
      return new Response(JSON.stringify({ message: "Notifications disabled" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Filter reviews based on preference
    let filteredReviews = reviews;
    if (business.review_notification_type === "negative_only") {
      filteredReviews = reviews.filter((r: any) => r.rating <= 3);
      if (filteredReviews.length === 0) {
        console.log("No negative reviews to notify about");
        return new Response(JSON.stringify({ message: "No negative reviews" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    // Get owner email from auth
    const { data: { user }, error: userError } = await supabase.auth.admin.getUserById(business.user_id);

    if (userError || !user?.email) {
      console.error("User not found:", userError);
      return new Response(JSON.stringify({ error: "User email not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const APP_URL = "https://voyagerespondcom.lovable.app";

    // Build email for each review (or batch if multiple)
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
        <div style="background: #ffffff; border: 1px solid #e5e7eb; border-radius: 12px; padding: 24px; margin-bottom: 16px;">
          <!-- Review Header -->
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
            <div>
              <span style="font-weight: 600; font-size: 16px; color: #111827;">${review.reviewer_name}</span>
              <span style="color: ${ratingColor}; font-size: 18px; margin-left: 8px; letter-spacing: 2px;">${stars}</span>
            </div>
            <span style="background: ${ratingColor}15; color: ${ratingColor}; padding: 4px 10px; border-radius: 20px; font-size: 12px; font-weight: 500;">
              ${sentimentLabel}
            </span>
          </div>

          <!-- Review Text -->
          <div style="background: #f9fafb; border-radius: 8px; padding: 16px; margin-bottom: 16px;">
            <p style="margin: 0; font-size: 14px; color: #374151; line-height: 1.6;">"${truncatedText}"</p>
          </div>

          ${review.suggested_reply ? `
          <!-- AI Suggested Reply -->
          <div style="border-left: 3px solid #6366f1; padding-left: 16px; margin-bottom: 16px;">
            <p style="margin: 0 0 6px 0; font-size: 12px; font-weight: 600; color: #6366f1; text-transform: uppercase; letter-spacing: 0.5px;">🤖 AI Önerilen Yanıt</p>
            <p style="margin: 0; font-size: 14px; color: #4b5563; line-height: 1.6;">${review.suggested_reply.length > 400 ? review.suggested_reply.substring(0, 400) + "..." : review.suggested_reply}</p>
          </div>
          ` : ""}

          <!-- Action Buttons -->
          <div style="text-align: center;">
            <a href="${reviewUrl}" style="display: inline-block; background: #6366f1; color: #ffffff; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px; margin-right: 8px;">
              Yorumu İncele ve Yanıtla
            </a>
          </div>
        </div>
      `;
    }).join("");

    const reviewCount = filteredReviews.length;
    const subject = reviewCount === 1
      ? `⭐ Yeni Yorum: ${filteredReviews[0].reviewer_name} — ${renderStars(filteredReviews[0].rating)} | ${business.name}`
      : `⭐ ${reviewCount} Yeni Yorum | ${business.name}`;

    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head><meta charset="utf-8"></head>
      <body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
        <div style="max-width: 600px; margin: 0 auto; padding: 24px;">
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); border-radius: 12px; padding: 28px; color: white; margin-bottom: 20px; text-align: center;">
            <h1 style="margin: 0 0 8px 0; font-size: 22px; font-weight: 700;">
              ${reviewCount === 1 ? "Yeni Yorum Geldi!" : `${reviewCount} Yeni Yorum Geldi!`}
            </h1>
            <p style="margin: 0; opacity: 0.85; font-size: 14px;">${business.name}</p>
          </div>

          <!-- Review Cards -->
          ${reviewCards}

          <!-- All Reviews Button -->
          <div style="text-align: center; margin-top: 24px;">
            <a href="${APP_URL}/reviews" style="display: inline-block; background: #ffffff; color: #6366f1; border: 2px solid #6366f1; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px;">
              Tüm Yorumları Gör
            </a>
          </div>

          <!-- Footer -->
          <div style="text-align: center; margin-top: 32px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            <p style="color: #9ca3af; font-size: 12px; margin: 0;">
              VoyageRespond • Yorum Bildirim Sistemi
            </p>
            <p style="color: #9ca3af; font-size: 11px; margin: 4px 0 0 0;">
              Bildirim tercihlerinizi <a href="${APP_URL}/settings?tab=notifications" style="color: #6366f1;">Ayarlar</a> sayfasından değiştirebilirsiniz.
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Send email via Resend
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "VoyageRespond <notify@voyagerespond.com>",
        to: [user.email],
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
