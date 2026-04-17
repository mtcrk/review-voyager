import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const ADMIN_EMAIL = "metecorukbasari@gmail.com";
const APP_URL = "https://voyagerespondcom.lovable.app";

interface ReviewLite {
  id?: string;
  reviewer_name?: string;
  rating: number;
  text?: string | null;
  platform?: string;
}

interface PlatformResult {
  platform: string;
  fetched: number;
  inserted: number;
  error?: string;
}

function getRatingColor(rating: number): string {
  if (rating >= 4) return "#16a34a";
  if (rating >= 3) return "#d97706";
  return "#dc2626";
}

async function generateAISummary(reviews: ReviewLite[], businessName: string): Promise<{
  overview: string;
  topIssues: string[];
  topPraises: string[];
  recommendations: string[];
} | null> {
  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  if (!LOVABLE_API_KEY || reviews.length === 0) return null;

  const reviewsText = reviews
    .filter((r) => r.text)
    .slice(0, 30)
    .map((r, i) => `${i + 1}. [${r.rating}★ ${r.platform || ""}] ${r.reviewer_name || "Anonim"}: "${r.text}"`)
    .join("\n");

  if (!reviewsText) return null;

  try {
    const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: `Sen bir otel/işletme yorum analisti uzmanısın. Türkçe, kısa ve net yaz. Yorumlardaki kalıpları, somut şikayet ve övgü temalarını çıkar. Genel ifadeler ('iyi hizmet') yerine spesifik konular ('kahvaltıda çeşit azlığı', 'resepsiyon karşılama sıcaklığı') kullan.`,
          },
          {
            role: "user",
            content: `${businessName} için son ${reviews.length} yorumu analiz et:\n\n${reviewsText}\n\nÇıkarımlarını yapılandırılmış formatta döndür.`,
          },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "review_analysis",
              description: "Yorumlardan çıkarılan analiz",
              parameters: {
                type: "object",
                properties: {
                  overview: {
                    type: "string",
                    description: "1-2 cümlelik genel durum özeti (Türkçe)",
                  },
                  topIssues: {
                    type: "array",
                    items: { type: "string" },
                    description: "En çok geçen 3-5 spesifik şikayet teması (her biri kısa, 3-7 kelime)",
                  },
                  topPraises: {
                    type: "array",
                    items: { type: "string" },
                    description: "En çok geçen 3-5 spesifik övgü teması (her biri kısa, 3-7 kelime)",
                  },
                  recommendations: {
                    type: "array",
                    items: { type: "string" },
                    description: "İşletmeye 2-3 somut aksiyon önerisi (her biri 1 cümle)",
                  },
                },
                required: ["overview", "topIssues", "topPraises", "recommendations"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "review_analysis" } },
      }),
    });

    if (!resp.ok) {
      console.error("AI gateway error:", resp.status, await resp.text());
      return null;
    }

    const data = await resp.json();
    const args = data?.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments;
    if (!args) return null;
    return JSON.parse(args);
  } catch (e) {
    console.error("AI summary failed:", e);
    return null;
  }
}

function summarizeIssuesPraises(reviews: ReviewLite[]) {
  const negatives = reviews.filter((r) => r.rating <= 3 && r.text);
  const positives = reviews.filter((r) => r.rating >= 4 && r.text);

  // Simple keyword extraction (Turkish + English common terms)
  const issueKeywords = [
    "kirli", "pis", "kötü", "yavaş", "geç", "soğuk", "gürültü", "gürültülü",
    "personel", "pahalı", "küçük", "eski", "bozuk", "kokulu", "berbat",
    "dirty", "bad", "slow", "cold", "noisy", "rude", "broken", "small", "old", "expensive",
  ];
  const praiseKeywords = [
    "temiz", "harika", "mükemmel", "güzel", "lezzetli", "ilgili", "samimi",
    "konforlu", "manzara", "kahvaltı", "personel", "hızlı",
    "clean", "great", "perfect", "amazing", "delicious", "friendly", "comfortable", "view",
  ];

  const countMatches = (texts: string[], keywords: string[]) => {
    const counts: Record<string, number> = {};
    for (const t of texts) {
      const lower = t.toLowerCase();
      for (const kw of keywords) {
        if (lower.includes(kw)) counts[kw] = (counts[kw] || 0) + 1;
      }
    }
    return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 5);
  };

  const topIssues = countMatches(negatives.map((r) => r.text || ""), issueKeywords);
  const topPraises = countMatches(positives.map((r) => r.text || ""), praiseKeywords);

  return { topIssues, topPraises, negativeCount: negatives.length, positiveCount: positives.length };
}

function buildLocationSection(opts: {
  businessName: string;
  totalNew: number;
  avgRating: number;
  platformResults: PlatformResult[];
  summary: ReturnType<typeof summarizeIssuesPraises>;
  sampleReviews: ReviewLite[];
  aiSummary: Awaited<ReturnType<typeof generateAISummary>>;
  yesterdayCount: number;
  unansweredCount: number;
}): string {
  const { businessName, totalNew, avgRating, platformResults, summary, sampleReviews, aiSummary, yesterdayCount, unansweredCount } = opts;

  // Urgency banner: 3+ negative reviews
  const urgencyBanner = summary.negativeCount >= 3
    ? `<div style="background:linear-gradient(135deg,#dc2626 0%,#b91c1c 100%);color:white;padding:14px 20px;border-radius:10px;margin-bottom:16px;display:flex;align-items:center;gap:10px;">
        <div style="font-size:20px;">⚠️</div>
        <div>
          <div style="font-weight:700;font-size:14px;">Acil Aksiyon Gerekli</div>
          <div style="font-size:12px;opacity:0.9;margin-top:2px;">${summary.negativeCount} olumsuz yorum bugün geldi — hemen yanıtlamayı düşünün.</div>
        </div>
      </div>`
    : "";

  // Trend vs yesterday
  let trendBadge = "";
  if (yesterdayCount > 0) {
    const diff = totalNew - yesterdayCount;
    const pct = Math.round((diff / yesterdayCount) * 100);
    const isUp = diff > 0;
    const isFlat = diff === 0;
    const color = isFlat ? "#6b7280" : isUp ? "#16a34a" : "#dc2626";
    const arrow = isFlat ? "→" : isUp ? "↑" : "↓";
    trendBadge = `<div style="font-size:11px;color:${color};margin-top:4px;font-weight:600;">${arrow} Dün: ${yesterdayCount} ${isFlat ? "" : `(${isUp ? "+" : ""}${pct}%)`}</div>`;
  } else if (totalNew > 0) {
    trendBadge = `<div style="font-size:11px;color:#16a34a;margin-top:4px;font-weight:600;">↑ Dün: 0</div>`;
  }


  const platformRows = platformResults
    .map(
      (p) => `
    <tr>
      <td style="padding: 8px 12px; border-bottom: 1px solid #e5e7eb; font-size: 13px; color: #374151; text-transform: capitalize;">${p.platform}</td>
      <td style="padding: 8px 12px; border-bottom: 1px solid #e5e7eb; font-size: 13px; color: #6b7280; text-align: right;">${p.fetched}</td>
      <td style="padding: 8px 12px; border-bottom: 1px solid #e5e7eb; font-size: 13px; color: #16a34a; text-align: right; font-weight: 600;">${p.inserted}</td>
      <td style="padding: 8px 12px; border-bottom: 1px solid #e5e7eb; font-size: 12px; color: ${p.error ? "#dc2626" : "#9ca3af"};">${p.error ? "❌ " + p.error.substring(0, 40) : "✓"}</td>
    </tr>`
    )
    .join("");

  const issuesItems = aiSummary?.topIssues?.length
    ? aiSummary.topIssues.map((s) => `<li style="margin-bottom:6px;">${s}</li>`).join("")
    : summary.topIssues.length
      ? summary.topIssues.map(([kw, n]) => `<li style="margin-bottom:4px;"><strong>${kw}</strong> <span style="color:#9ca3af;">(${n}x)</span></li>`).join("")
      : `<li style="color:#9ca3af;">Belirgin şikayet yok</li>`;

  const praisesItems = aiSummary?.topPraises?.length
    ? aiSummary.topPraises.map((s) => `<li style="margin-bottom:6px;">${s}</li>`).join("")
    : summary.topPraises.length
      ? summary.topPraises.map(([kw, n]) => `<li style="margin-bottom:4px;"><strong>${kw}</strong> <span style="color:#9ca3af;">(${n}x)</span></li>`).join("")
      : `<li style="color:#9ca3af;">Belirgin övgü yok</li>`;

  const aiOverviewBlock = aiSummary?.overview
    ? `<div style="background:linear-gradient(135deg,#faf5ff 0%,#f5f3ff 100%);border:1px solid #ddd6fe;padding:16px;border-radius:8px;margin-bottom:20px;">
        <div style="font-size:11px;color:#7A5AF8;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:6px;">🤖 AI Özet</div>
        <div style="font-size:14px;color:#111827;line-height:1.6;">${aiSummary.overview}</div>
      </div>`
    : "";

  const recommendationsBlock = aiSummary?.recommendations?.length
    ? `<div style="background:#fffbeb;border:1px solid #fde68a;padding:16px;border-radius:8px;margin-bottom:20px;">
        <h4 style="margin:0 0 10px 0;font-size:13px;color:#b45309;">💡 Öneriler</h4>
        <ul style="margin:0;padding-left:18px;font-size:13px;color:#374151;line-height:1.6;">
          ${aiSummary.recommendations.map((r) => `<li style="margin-bottom:4px;">${r}</li>`).join("")}
        </ul>
      </div>`
    : "";

  const sampleCards = sampleReviews
    .slice(0, 3)
    .map((r) => {
      const color = getRatingColor(r.rating);
      const text = r.text ? (r.text.length > 200 ? r.text.substring(0, 200) + "..." : r.text) : "—";
      return `
      <div style="background:#f9fafb;border-left:3px solid ${color};padding:12px 16px;margin-bottom:10px;border-radius:6px;">
        <div style="font-size:12px;color:#6b7280;margin-bottom:4px;">
          <strong style="color:#111827;">${r.reviewer_name || "Anonim"}</strong> • ${r.rating}★ • ${r.platform || ""}
        </div>
        <div style="font-size:13px;color:#374151;line-height:1.5;">"${text}"</div>
      </div>`;
    })
    .join("");

  return `
    <div style="background:white;border-radius:12px;padding:24px;margin-bottom:16px;border:1px solid #e5e7eb;">
      <div style="border-bottom:1px solid #f3f4f6;padding-bottom:14px;margin-bottom:18px;">
        <h2 style="margin:0;font-size:17px;font-weight:700;color:#111827;">📍 ${businessName}</h2>
      </div>

      ${urgencyBanner}

      ${unansweredCount > 0 ? `<div style="background:#eff6ff;border:1px solid #bfdbfe;padding:14px 18px;border-radius:10px;margin-bottom:16px;display:flex;align-items:center;justify-content:space-between;gap:12px;">
        <div>
          <div style="font-weight:600;font-size:13px;color:#1e40af;">📬 ${unansweredCount} yeni yorum yanıt bekliyor</div>
          <div style="font-size:12px;color:#3730a3;margin-top:2px;">Hızlı yanıt itibar puanınızı yükseltir.</div>
        </div>
        <a href="${APP_URL}/reviews?status=unanswered" style="background:#1e40af;color:white;padding:8px 14px;border-radius:6px;text-decoration:none;font-size:12px;font-weight:600;white-space:nowrap;">Yanıtla →</a>
      </div>` : ""}

      <div style="display:flex;gap:12px;margin-bottom:20px;flex-wrap:wrap;">
        <div style="flex:1;min-width:120px;background:#f9fafb;padding:16px;border-radius:8px;text-align:center;">
          <div style="font-size:28px;font-weight:700;color:#7A5AF8;">${totalNew}</div>
          <div style="font-size:12px;color:#6b7280;margin-top:4px;">Yeni Yorum</div>
          ${trendBadge}
        </div>
        <div style="flex:1;min-width:120px;background:#f9fafb;padding:16px;border-radius:8px;text-align:center;">
          <div style="font-size:28px;font-weight:700;color:${getRatingColor(avgRating)};">${avgRating.toFixed(1)}★</div>
          <div style="font-size:12px;color:#6b7280;margin-top:4px;">Ort. Puan</div>
        </div>
        <div style="flex:1;min-width:120px;background:#f9fafb;padding:16px;border-radius:8px;text-align:center;">
          <div style="font-size:28px;font-weight:700;color:#16a34a;">${summary.positiveCount}</div>
          <div style="font-size:12px;color:#6b7280;margin-top:4px;">Olumlu</div>
        </div>
        <div style="flex:1;min-width:120px;background:#f9fafb;padding:16px;border-radius:8px;text-align:center;">
          <div style="font-size:28px;font-weight:700;color:#dc2626;">${summary.negativeCount}</div>
          <div style="font-size:12px;color:#6b7280;margin-top:4px;">Olumsuz</div>
        </div>
      </div>

      ${aiOverviewBlock}

      <h3 style="margin:0 0 10px 0;font-size:14px;color:#111827;">Platform Bazında</h3>
      <table style="width:100%;border-collapse:collapse;margin-bottom:20px;">
        <thead>
          <tr style="background:#f9fafb;">
            <th style="padding:8px 12px;text-align:left;font-size:11px;color:#6b7280;text-transform:uppercase;">Platform</th>
            <th style="padding:8px 12px;text-align:right;font-size:11px;color:#6b7280;text-transform:uppercase;">Çekilen</th>
            <th style="padding:8px 12px;text-align:right;font-size:11px;color:#6b7280;text-transform:uppercase;">Yeni</th>
            <th style="padding:8px 12px;text-align:left;font-size:11px;color:#6b7280;text-transform:uppercase;">Durum</th>
          </tr>
        </thead>
        <tbody>${platformRows}</tbody>
      </table>

      <div style="display:flex;gap:16px;margin-bottom:20px;flex-wrap:wrap;">
        <div style="flex:1;min-width:200px;background:#fef2f2;padding:16px;border-radius:8px;">
          <h4 style="margin:0 0 10px 0;font-size:13px;color:#dc2626;">⚠️ Şikayet Konuları</h4>
          <ul style="margin:0;padding-left:18px;font-size:13px;color:#374151;line-height:1.6;">${issuesItems}</ul>
        </div>
        <div style="flex:1;min-width:200px;background:#f0fdf4;padding:16px;border-radius:8px;">
          <h4 style="margin:0 0 10px 0;font-size:13px;color:#16a34a;">✓ Övgü Konuları</h4>
          <ul style="margin:0;padding-left:18px;font-size:13px;color:#374151;line-height:1.6;">${praisesItems}</ul>
        </div>
      </div>

      ${recommendationsBlock}

      ${sampleCards ? `<h3 style="margin:0 0 10px 0;font-size:14px;color:#111827;">Örnek Yorumlar</h3>${sampleCards}` : ""}
    </div>`;
}

function buildConsolidatedEmailHtml(locations: Array<{
  name: string;
  city: string | null;
  totalNew: number;
  avgRating: number;
  summary: ReturnType<typeof summarizeIssuesPraises>;
  aiSummary: Awaited<ReturnType<typeof generateAISummary>>;
  platformResults: PlatformResult[];
  sampleReviews: ReviewLite[];
  yesterdayCount: number;
  unansweredCount: number;
}>): string {
  const totalNewAll = locations.reduce((s, l) => s + l.totalNew, 0);
  const totalNegAll = locations.reduce((s, l) => s + l.summary.negativeCount, 0);
  const totalUnansweredAll = locations.reduce((s, l) => s + l.unansweredCount, 0);
  const isMulti = locations.length > 1;

  // Overview header for multi-location
  const portfolioOverview = isMulti ? `
    <div style="background:white;border-radius:12px;padding:20px;margin-bottom:16px;border:1px solid #e5e7eb;">
      <div style="font-size:11px;color:#7A5AF8;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:10px;">Portföy Özeti</div>
      <div style="display:flex;gap:12px;flex-wrap:wrap;">
        <div style="flex:1;min-width:100px;text-align:center;">
          <div style="font-size:24px;font-weight:700;color:#7A5AF8;">${locations.length}</div>
          <div style="font-size:11px;color:#6b7280;">Lokasyon</div>
        </div>
        <div style="flex:1;min-width:100px;text-align:center;">
          <div style="font-size:24px;font-weight:700;color:#111827;">${totalNewAll}</div>
          <div style="font-size:11px;color:#6b7280;">Toplam Yeni</div>
        </div>
        <div style="flex:1;min-width:100px;text-align:center;">
          <div style="font-size:24px;font-weight:700;color:#16a34a;">${locations.reduce((s, l) => s + l.summary.positiveCount, 0)}</div>
          <div style="font-size:11px;color:#6b7280;">Olumlu</div>
        </div>
        <div style="flex:1;min-width:100px;text-align:center;">
          <div style="font-size:24px;font-weight:700;color:#dc2626;">${totalNegAll}</div>
          <div style="font-size:11px;color:#6b7280;">Olumsuz</div>
        </div>
        <div style="flex:1;min-width:100px;text-align:center;">
          <div style="font-size:24px;font-weight:700;color:#1e40af;">${totalUnansweredAll}</div>
          <div style="font-size:11px;color:#6b7280;">Yanıt Bekleyen</div>
        </div>
      </div>
    </div>` : "";

  // Sort: most negative first (urgency), then by total new
  const sorted = [...locations].sort((a, b) => {
    if (b.summary.negativeCount !== a.summary.negativeCount) return b.summary.negativeCount - a.summary.negativeCount;
    return b.totalNew - a.totalNew;
  });

  const sections = sorted.map((loc) => buildLocationSection({
    businessName: loc.name + (loc.city ? ` · ${loc.city}` : ""),
    totalNew: loc.totalNew,
    avgRating: loc.avgRating,
    platformResults: loc.platformResults,
    summary: loc.summary,
    sampleReviews: loc.sampleReviews,
    aiSummary: loc.aiSummary,
    yesterdayCount: loc.yesterdayCount,
    unansweredCount: loc.unansweredCount,
  })).join("\n");

  const headerTitle = isMulti
    ? `📊 Günlük Yorum Raporu — ${locations.length} Lokasyon`
    : `📊 Günlük Yorum Raporu`;
  const headerSub = isMulti
    ? `Tüm lokasyonlarınızın özeti`
    : locations[0].name;

  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <div style="max-width:680px;margin:0 auto;padding:24px;">
    <div style="background:linear-gradient(135deg,#7A5AF8 0%,#635BFF 100%);border-radius:12px;padding:28px;color:white;margin-bottom:20px;">
      <h1 style="margin:0 0 6px 0;font-size:22px;font-weight:700;">${headerTitle}</h1>
      <p style="margin:0;opacity:0.9;font-size:14px;">${headerSub}</p>
    </div>

    ${portfolioOverview}

    ${sections}

    <div style="text-align:center;margin-top:8px;margin-bottom:20px;">
      <a href="${APP_URL}/reviews" style="display:inline-block;background:#7A5AF8;color:white;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px;">
        Tüm Yorumları Gör →
      </a>
    </div>

    <div style="text-align:center;padding-top:12px;">
      <p style="color:#9ca3af;font-size:11px;margin:0;">VoyageRespond • Otomatik Günlük Rapor</p>
    </div>
  </div>
</body></html>`;
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
      return new Response(JSON.stringify({ error: "RESEND_API_KEY not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey);
    const body = await req.json();

    // Normalize payload: support both old (single business) and new (user + locations) formats
    let userId: string | undefined = body.user_id;
    let locations: Array<{
      business_id: string;
      business_name?: string;
      city?: string | null;
      new_reviews: ReviewLite[];
      platform_results: PlatformResult[];
    }> = [];

    if (body.locations && Array.isArray(body.locations)) {
      locations = body.locations;
    } else if (body.business_id) {
      // Legacy single-business payload
      locations = [{
        business_id: body.business_id,
        new_reviews: body.new_reviews || [],
        platform_results: body.platform_results || [],
      }];
    } else {
      return new Response(JSON.stringify({ error: "user_id+locations or business_id required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Skip if nothing new and no errors across all locations
    const hasAnyContent = locations.some((loc) =>
      loc.new_reviews.length > 0 || loc.platform_results.some((p) => p.error)
    );
    if (!hasAnyContent) {
      return new Response(JSON.stringify({ skipped: true, reason: "no new reviews" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Resolve business names + user_id (for legacy single-business path)
    const bizIds = locations.map((l) => l.business_id);
    const { data: bizRows } = await supabase
      .from("businesses")
      .select("id, name, user_id, city")
      .in("id", bizIds);
    const bizMap = new Map((bizRows || []).map((b) => [b.id, b]));

    if (!userId) {
      const firstBiz = bizRows?.[0];
      if (firstBiz) userId = firstBiz.user_id;
    }

    // Enrich locations with name/city + compute per-location stats
    const enrichedLocations = await Promise.all(locations.map(async (loc) => {
      const biz = bizMap.get(loc.business_id);
      const name = loc.business_name || biz?.name || "İşletme";
      const reviews = loc.new_reviews || [];
      const totalNew = reviews.length;
      const avgRating = totalNew > 0
        ? reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / totalNew
        : 0;
      const summary = summarizeIssuesPraises(reviews);

      // Yesterday count
      const { count: yesterdayCount } = await supabase
        .from("reviews")
        .select("id", { count: "exact", head: true })
        .eq("business_id", loc.business_id)
        .gte("posted_at", new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString())
        .lt("posted_at", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

      // Unanswered count
      const newReviewIds = reviews.map((r) => r.id).filter(Boolean);
      let unansweredCount = 0;
      if (newReviewIds.length > 0) {
        const { count } = await supabase
          .from("reviews")
          .select("id", { count: "exact", head: true })
          .in("id", newReviewIds)
          .is("approved_reply", null);
        unansweredCount = count || 0;
      }

      const aiSummary = totalNew > 0 ? await generateAISummary(reviews, name) : null;

      return {
        business_id: loc.business_id,
        name,
        city: loc.city || biz?.city || null,
        totalNew,
        avgRating,
        summary,
        aiSummary,
        platformResults: loc.platform_results || [],
        sampleReviews: reviews,
        yesterdayCount: yesterdayCount || 0,
        unansweredCount,
      };
    }));

    // Resolve owner email
    let ownerEmail: string | undefined;
    if (userId) {
      const { data: { user } } = await supabase.auth.admin.getUserById(userId);
      ownerEmail = user?.email;
    }

    // Build email
    const html = buildConsolidatedEmailHtml(enrichedLocations);

    const totalAcrossAll = enrichedLocations.reduce((s, l) => s + l.totalNew, 0);
    const totalNegative = enrichedLocations.reduce((s, l) => s + l.summary.negativeCount, 0);
    const urgencyPrefix = totalNegative >= 3 ? "🚨 ACİL — " : "📊 ";
    const locLabel = enrichedLocations.length > 1
      ? `${enrichedLocations.length} lokasyon`
      : enrichedLocations[0].name;
    const subject = totalAcrossAll > 0
      ? `${urgencyPrefix}${locLabel} — ${totalAcrossAll} yeni yorum`
      : `⚠️ ${locLabel} — Yorum çekme uyarısı`;

    const recipients = new Set<string>([ADMIN_EMAIL]);
    if (ownerEmail) recipients.add(ownerEmail);

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "VoyageRespond <notify@voyagerespond.com>",
        to: Array.from(recipients),
        subject,
        html,
      }),
    });

    const result = await res.json();
    console.log(`Consolidated summary sent to ${Array.from(recipients).join(", ")} (${enrichedLocations.length} locations):`, result);

    return new Response(JSON.stringify({ success: true, recipients: Array.from(recipients), locations: enrichedLocations.length }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("notify-fetch-summary error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
