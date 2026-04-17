import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);

    // Get all businesses with weekly_report_enabled
    const { data: businesses, error: bizError } = await supabase
      .from("businesses")
      .select("id, name, user_id, weekly_report_enabled")
      .eq("weekly_report_enabled", true);

    if (bizError) throw bizError;
    if (!businesses || businesses.length === 0) {
      return new Response(
        JSON.stringify({ success: true, message: "No businesses with reports enabled" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Group businesses by user
    const userBusinesses = new Map<string, typeof businesses>();
    businesses.forEach((biz) => {
      const existing = userBusinesses.get(biz.user_id) || [];
      existing.push(biz);
      userBusinesses.set(biz.user_id, existing);
    });

    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    let emailsSent = 0;

    for (const [userId, userBizList] of userBusinesses) {
      // Get user email
      const { data: userData } = await supabase.auth.admin.getUserById(userId);
      if (!userData?.user?.email) continue;

      const email = userData.user.email;
      const bizIds = userBizList.map((b) => b.id);

      // Get weekly review stats
      const { data: reviews } = await supabase
        .from("reviews")
        .select("id, business_id, rating, status, sentiment, posted_at")
        .in("business_id", bizIds)
        .gte("posted_at", oneWeekAgo.toISOString());

      const totalNewReviews = reviews?.length || 0;
      const avgRating =
        totalNewReviews > 0
          ? Math.round(
              ((reviews || []).reduce((s, r) => s + r.rating, 0) / totalNewReviews) * 10
            ) / 10
          : 0;
      const pending = (reviews || []).filter(
        (r) => r.status === "pending_reply" || r.status === "pending"
      ).length;

      // Build a simple summary for each location
      const locationSummaries = userBizList
        .map((biz) => {
          const bizReviews = (reviews || []).filter((r) => r.business_id === biz.id);
          const bizAvg =
            bizReviews.length > 0
              ? Math.round(
                  (bizReviews.reduce((s, r) => s + r.rating, 0) / bizReviews.length) * 10
                ) / 10
              : 0;
          return `• ${biz.name}: ${bizReviews.length} yeni yorum, ${bizAvg} ★ ortalama`;
        })
        .join("\n");

      // Send notification email via Supabase Auth (using invite/magic link style)
      // We use a simple approach: send via Supabase's built-in email
      const dashboardUrl = `${supabaseUrl.replace(".supabase.co", ".lovable.app")}/locations`;
      
      const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f5f5f7; margin: 0; padding: 0; }
    .container { max-width: 560px; margin: 40px auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 2px 12px rgba(0,0,0,0.06); }
    .header { background: linear-gradient(135deg, #7A5AF8, #6845F4); padding: 32px 40px; }
    .header h1 { color: #ffffff; font-size: 22px; margin: 0; font-weight: 600; }
    .header p { color: rgba(255,255,255,0.85); font-size: 14px; margin: 8px 0 0; }
    .body { padding: 32px 40px; }
    .stat-row { display: flex; gap: 16px; margin-bottom: 24px; }
    .stat { flex: 1; background: #f8f9fb; border-radius: 12px; padding: 16px; text-align: center; }
    .stat-value { font-size: 28px; font-weight: 700; color: #1a1a2e; }
    .stat-label { font-size: 12px; color: #6b7280; margin-top: 4px; text-transform: uppercase; letter-spacing: 0.5px; }
    .locations { background: #f8f9fb; border-radius: 12px; padding: 20px; margin: 16px 0 24px; font-size: 14px; color: #374151; line-height: 1.8; }
    .cta { display: inline-block; background: #7A5AF8; color: #ffffff !important; text-decoration: none; padding: 14px 32px; border-radius: 10px; font-weight: 600; font-size: 15px; }
    .footer { padding: 24px 40px; text-align: center; color: #9ca3af; font-size: 12px; border-top: 1px solid #f0f0f0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📊 Haftalık Raporunuz Hazır</h1>
      <p>${new Date().toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" })}</p>
    </div>
    <div class="body">
      <div class="stat-row">
        <div class="stat">
          <div class="stat-value">${totalNewReviews}</div>
          <div class="stat-label">Yeni Yorum</div>
        </div>
        <div class="stat">
          <div class="stat-value">${avgRating} ★</div>
          <div class="stat-label">Ortalama</div>
        </div>
        <div class="stat">
          <div class="stat-value">${pending}</div>
          <div class="stat-label">Bekleyen</div>
        </div>
      </div>
      
      <div class="locations">
        <strong>Lokasyon Özeti:</strong><br>
        ${locationSummaries.replace(/\n/g, "<br>")}
      </div>

      <div style="text-align: center;">
        <a href="${dashboardUrl}" class="cta">Dashboard'a Git →</a>
      </div>
      
      <p style="color: #9ca3af; font-size: 13px; margin-top: 24px; text-align: center;">
        Detaylı analiz ve yanıt yönetimi için dashboard'unuzu ziyaret edin.
      </p>
    </div>
    <div class="footer">
      VoyageRespond · AI-Powered Review Management<br>
      Bu e-postayı almak istemiyorsanız, ayarlardan haftalık raporu kapatabilirsiniz.
    </div>
  </div>
</body>
</html>`;

      // Send via Resend
      const resendKey = Deno.env.get("RESEND_API_KEY");
      if (!resendKey) {
        console.error("RESEND_API_KEY missing");
        continue;
      }

      const resendRes = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${resendKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "VoyageRespond <notify@voyagerespond.com>",
          to: [email],
          subject: `📊 Haftalık Raporunuz - ${totalNewReviews} yeni yorum`,
          html: htmlContent,
        }),
      });

      if (!resendRes.ok) {
        const errText = await resendRes.text();
        console.error(`Resend failed for ${email}:`, resendRes.status, errText);
        continue;
      }

      console.log(`Weekly report sent to ${email}: ${totalNewReviews} reviews, ${pending} pending`);
      emailsSent++;
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Weekly reports processed for ${emailsSent} users`,
        emailsSent,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error generating weekly reports:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
