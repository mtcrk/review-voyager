import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const escapeHtml = (s: string) =>
  (s || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const platformLabel = (p: string) => {
  const map: Record<string, string> = {
    google: "Google",
    booking: "Booking.com",
    tripadvisor: "TripAdvisor",
    trustpilot: "Trustpilot",
    hotelscom: "Hotels.com",
    expedia: "Expedia",
    tripcom: "Trip.com",
  };
  return map[p] || p;
};

async function generateAISummary(reviews: any[], stats: any): Promise<string> {
  const apiKey = Deno.env.get("LOVABLE_API_KEY");
  if (!apiKey || reviews.length === 0) return "";

  const sample = reviews
    .slice(0, 20)
    .map((r) => `[${r.rating}★ ${r.platform}] ${r.reviewer_name}: ${(r.text || "").slice(0, 200)}`)
    .join("\n");

  const prompt = `Aşağıda son 24 saatte gelen yorumlar var. İşletme sahibine 2-3 cümlelik Türkçe günün özeti yaz. Trend, tekrar eden temalar, dikkat edilmesi gereken konuları vurgula. Sıcak, profesyonel, kısa.

İstatistikler: ${stats.total} yorum, ${stats.avg}★ ortalama, ${stats.positive} pozitif / ${stats.negative} negatif / ${stats.neutral} nötr.

Yorumlar:
${sample}`;

  try {
    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: "Türkçe yazan, kısa ve etkili bir analiz yazarısın." },
          { role: "user", content: prompt },
        ],
      }),
    });
    if (!res.ok) {
      console.error("AI summary failed:", res.status, await res.text());
      return "";
    }
    const data = await res.json();
    return data.choices?.[0]?.message?.content?.trim() || "";
  } catch (e) {
    console.error("AI summary error:", e);
    return "";
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);

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

    const userBusinesses = new Map<string, typeof businesses>();
    businesses.forEach((biz) => {
      const existing = userBusinesses.get(biz.user_id) || [];
      existing.push(biz);
      userBusinesses.set(biz.user_id, existing);
    });

    const now = new Date();
    const since = new Date(now.getTime() - 24 * 60 * 60 * 1000); // last 24h (daily)

    let emailsSent = 0;

    for (const [userId, userBizList] of userBusinesses) {
      const { data: userData } = await supabase.auth.admin.getUserById(userId);
      if (!userData?.user?.email) continue;

      const email = userData.user.email;
      const bizIds = userBizList.map((b) => b.id);

      // Today's reviews
      const { data: reviews } = await supabase
        .from("reviews")
        .select("id, business_id, rating, status, sentiment, posted_at, platform, reviewer_name, text, approved_reply")
        .in("business_id", bizIds)
        .gte("posted_at", since.toISOString())
        .order("posted_at", { ascending: false });

      const all = reviews || [];
      const total = all.length;

      if (total === 0) {
        console.log(`No new reviews for ${email}, skipping`);
        continue;
      }

      const avg = total > 0 ? Math.round((all.reduce((s, r) => s + r.rating, 0) / total) * 10) / 10 : 0;
      const positive = all.filter((r) => r.sentiment === "positive").length;
      const negative = all.filter((r) => r.sentiment === "negative").length;
      const neutral = total - positive - negative;
      const pending = all.filter(
        (r) => !r.approved_reply && (r.status === "pending_reply" || r.status === "pending" || r.status === null)
      );

      // Critical reviews (1-2 stars), top 3 newest
      const critical = all.filter((r) => r.rating <= 2).slice(0, 3);

      // Platform breakdown
      const platformCounts = new Map<string, { count: number; sum: number }>();
      all.forEach((r) => {
        const cur = platformCounts.get(r.platform) || { count: 0, sum: 0 };
        cur.count += 1;
        cur.sum += r.rating;
        platformCounts.set(r.platform, cur);
      });

      // AI summary
      const aiSummary = await generateAISummary(all, { total, avg, positive, negative, neutral });

      // Location summaries
      const locationSummaries = userBizList
        .map((biz) => {
          const bizReviews = all.filter((r) => r.business_id === biz.id);
          if (bizReviews.length === 0) return null;
          const bizAvg = Math.round((bizReviews.reduce((s, r) => s + r.rating, 0) / bizReviews.length) * 10) / 10;
          return `<tr><td style="padding:8px 0;color:#374151;">${escapeHtml(biz.name)}</td><td style="padding:8px 0;text-align:right;color:#6b7280;">${bizReviews.length} yorum · ${bizAvg}★</td></tr>`;
        })
        .filter(Boolean)
        .join("");

      const dashboardUrl = "https://voyagerespond.com/dashboard";
      const reviewsUrl = "https://voyagerespond.com/reviews";

      const sentimentBar = total > 0 ? `
        <div style="display:flex;height:8px;border-radius:4px;overflow:hidden;background:#f3f4f6;margin:8px 0 4px;">
          ${positive > 0 ? `<div style="width:${(positive / total) * 100}%;background:#10b981;"></div>` : ""}
          ${neutral > 0 ? `<div style="width:${(neutral / total) * 100}%;background:#9ca3af;"></div>` : ""}
          ${negative > 0 ? `<div style="width:${(negative / total) * 100}%;background:#ef4444;"></div>` : ""}
        </div>
        <div style="display:flex;justify-content:space-between;font-size:12px;color:#6b7280;">
          <span>🟢 ${positive} pozitif</span>
          <span>⚪ ${neutral} nötr</span>
          <span>🔴 ${negative} negatif</span>
        </div>
      ` : "";

      const criticalBlock = critical.length > 0 ? `
        <h2 style="font-size:16px;color:#1a1a2e;margin:32px 0 12px;">🚨 Acil İlgi Gereken Yorumlar</h2>
        ${critical.map((r) => `
          <div style="background:#fef2f2;border-left:3px solid #ef4444;border-radius:8px;padding:14px 16px;margin-bottom:10px;">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
              <strong style="color:#1a1a2e;font-size:14px;">${escapeHtml(r.reviewer_name)}</strong>
              <span style="color:#ef4444;font-size:13px;font-weight:600;">${r.rating}★ · ${platformLabel(r.platform)}</span>
            </div>
            <p style="color:#4b5563;font-size:13px;line-height:1.5;margin:0;">${escapeHtml((r.text || "").slice(0, 300))}${(r.text || "").length > 300 ? "…" : ""}</p>
          </div>
        `).join("")}
      ` : "";

      const platformBlock = platformCounts.size > 1 ? `
        <h2 style="font-size:16px;color:#1a1a2e;margin:32px 0 12px;">📍 Platform Kırılımı</h2>
        <table style="width:100%;border-collapse:collapse;font-size:14px;">
          ${Array.from(platformCounts.entries()).map(([p, v]) => `
            <tr style="border-bottom:1px solid #f0f0f0;">
              <td style="padding:10px 0;color:#374151;">${platformLabel(p)}</td>
              <td style="padding:10px 0;text-align:right;color:#6b7280;">${v.count} yorum · ${Math.round((v.sum / v.count) * 10) / 10}★</td>
            </tr>
          `).join("")}
        </table>
      ` : "";

      const pendingBlock = pending.length > 0 ? `
        <div style="background:#fffbeb;border-radius:10px;padding:16px;margin:24px 0;">
          <strong style="color:#92400e;font-size:14px;">⏳ ${pending.length} yorum yanıt bekliyor</strong>
          <p style="color:#78350f;font-size:13px;margin:6px 0 0;">Hızlı yanıtlar müşteri memnuniyetini artırır.</p>
        </div>
      ` : "";

      const aiBlock = aiSummary ? `
        <div style="background:linear-gradient(135deg,#f5f3ff,#ede9fe);border-radius:12px;padding:18px 20px;margin:24px 0;">
          <div style="font-size:12px;color:#7A5AF8;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:6px;">✨ AI Günün Özeti</div>
          <p style="color:#1a1a2e;font-size:14px;line-height:1.6;margin:0;">${escapeHtml(aiSummary)}</p>
        </div>
      ` : "";

      const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
</head>
<body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#f5f5f7;margin:0;padding:0;">
  <div style="max-width:600px;margin:40px auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.06);">
    <div style="background:linear-gradient(135deg,#7A5AF8,#6845F4);padding:28px 32px;">
      <h1 style="color:#ffffff;font-size:22px;margin:0;font-weight:600;">📊 Günlük Yorum Raporunuz</h1>
      <p style="color:rgba(255,255,255,0.85);font-size:14px;margin:6px 0 0;">${new Date().toLocaleDateString("tr-TR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</p>
    </div>

    <div style="padding:28px 32px;">
      <div style="display:flex;gap:12px;margin-bottom:20px;">
        <div style="flex:1;background:#f8f9fb;border-radius:12px;padding:16px;text-align:center;">
          <div style="font-size:26px;font-weight:700;color:#1a1a2e;">${total}</div>
          <div style="font-size:11px;color:#6b7280;margin-top:4px;text-transform:uppercase;letter-spacing:0.5px;">Yeni Yorum</div>
        </div>
        <div style="flex:1;background:#f8f9fb;border-radius:12px;padding:16px;text-align:center;">
          <div style="font-size:26px;font-weight:700;color:#1a1a2e;">${avg}★</div>
          <div style="font-size:11px;color:#6b7280;margin-top:4px;text-transform:uppercase;letter-spacing:0.5px;">Ortalama</div>
        </div>
        <div style="flex:1;background:#f8f9fb;border-radius:12px;padding:16px;text-align:center;">
          <div style="font-size:26px;font-weight:700;color:${pending.length > 0 ? "#f59e0b" : "#10b981"};">${pending.length}</div>
          <div style="font-size:11px;color:#6b7280;margin-top:4px;text-transform:uppercase;letter-spacing:0.5px;">Bekleyen</div>
        </div>
      </div>

      <div style="background:#f8f9fb;border-radius:12px;padding:16px 20px;">
        <div style="font-size:13px;color:#374151;font-weight:600;margin-bottom:6px;">Duygu Dağılımı</div>
        ${sentimentBar}
      </div>

      ${aiBlock}
      ${pendingBlock}
      ${criticalBlock}
      ${platformBlock}

      ${locationSummaries ? `
        <h2 style="font-size:16px;color:#1a1a2e;margin:32px 0 12px;">🏢 Lokasyon Özeti</h2>
        <table style="width:100%;border-collapse:collapse;font-size:14px;">${locationSummaries}</table>
      ` : ""}

      <div style="text-align:center;margin:32px 0 8px;">
        <a href="${reviewsUrl}" style="display:inline-block;background:#7A5AF8;color:#ffffff;text-decoration:none;padding:14px 32px;border-radius:10px;font-weight:600;font-size:15px;margin-right:8px;">Yorumları Yönet →</a>
      </div>
      <div style="text-align:center;">
        <a href="${dashboardUrl}" style="color:#7A5AF8;text-decoration:none;font-size:13px;">veya Dashboard'a git</a>
      </div>
    </div>

    <div style="padding:20px 32px;text-align:center;color:#9ca3af;font-size:12px;border-top:1px solid #f0f0f0;">
      VoyageRespond · AI-Powered Review Management<br>
      Bu e-postayı almak istemiyorsanız Ayarlar → Bildirimler'den günlük raporu kapatabilirsiniz.
    </div>
  </div>
</body>
</html>`;

      const resendKey = Deno.env.get("RESEND_API_KEY");
      if (!resendKey) {
        console.error("RESEND_API_KEY missing");
        continue;
      }

      const resendRes = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "VoyageRespond <notify@voyagerespond.com>",
          to: [email],
          subject: `📊 Günlük Rapor · ${total} yeni yorum${critical.length > 0 ? ` · 🚨 ${critical.length} kritik` : ""}`,
          html: htmlContent,
        }),
      });

      if (!resendRes.ok) {
        const errText = await resendRes.text();
        console.error(`Resend failed for ${email}:`, resendRes.status, errText);
        continue;
      }

      console.log(`Daily report sent to ${email}: ${total} reviews, ${pending.length} pending, ${critical.length} critical`);
      emailsSent++;
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Daily reports processed for ${emailsSent} users`,
        emailsSent,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error generating daily reports:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
