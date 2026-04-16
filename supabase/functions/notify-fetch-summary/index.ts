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

function buildEmailHtml(opts: {
  businessName: string;
  totalNew: number;
  avgRating: number;
  platformResults: PlatformResult[];
  summary: ReturnType<typeof summarizeIssuesPraises>;
  sampleReviews: ReviewLite[];
  aiSummary: Awaited<ReturnType<typeof generateAISummary>>;
}): string {
  const { businessName, totalNew, avgRating, platformResults, summary, sampleReviews, aiSummary } = opts;

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

  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <div style="max-width:640px;margin:0 auto;padding:24px;">
    <div style="background:linear-gradient(135deg,#7A5AF8 0%,#635BFF 100%);border-radius:12px;padding:28px;color:white;margin-bottom:20px;">
      <h1 style="margin:0 0 6px 0;font-size:22px;font-weight:700;">📊 Günlük Yorum Raporu</h1>
      <p style="margin:0;opacity:0.9;font-size:14px;">${businessName}</p>
    </div>

    <div style="background:white;border-radius:12px;padding:24px;margin-bottom:16px;border:1px solid #e5e7eb;">
      <div style="display:flex;gap:16px;margin-bottom:20px;">
        <div style="flex:1;background:#f9fafb;padding:16px;border-radius:8px;text-align:center;">
          <div style="font-size:28px;font-weight:700;color:#7A5AF8;">${totalNew}</div>
          <div style="font-size:12px;color:#6b7280;margin-top:4px;">Yeni Yorum</div>
        </div>
        <div style="flex:1;background:#f9fafb;padding:16px;border-radius:8px;text-align:center;">
          <div style="font-size:28px;font-weight:700;color:${getRatingColor(avgRating)};">${avgRating.toFixed(1)}★</div>
          <div style="font-size:12px;color:#6b7280;margin-top:4px;">Ort. Puan</div>
        </div>
        <div style="flex:1;background:#f9fafb;padding:16px;border-radius:8px;text-align:center;">
          <div style="font-size:28px;font-weight:700;color:#16a34a;">${summary.positiveCount}</div>
          <div style="font-size:12px;color:#6b7280;margin-top:4px;">Olumlu</div>
        </div>
        <div style="flex:1;background:#f9fafb;padding:16px;border-radius:8px;text-align:center;">
          <div style="font-size:28px;font-weight:700;color:#dc2626;">${summary.negativeCount}</div>
          <div style="font-size:12px;color:#6b7280;margin-top:4px;">Olumsuz</div>
        </div>
      </div>

      ${aiOverviewBlock}

      <h3 style="margin:0 0 10px 0;font-size:15px;color:#111827;">Platform Bazında</h3>
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

      <div style="display:flex;gap:16px;margin-bottom:20px;">
        <div style="flex:1;background:#fef2f2;padding:16px;border-radius:8px;">
          <h4 style="margin:0 0 10px 0;font-size:13px;color:#dc2626;">⚠️ Şikayet Konuları</h4>
          <ul style="margin:0;padding-left:18px;font-size:13px;color:#374151;line-height:1.6;">${issuesItems}</ul>
        </div>
        <div style="flex:1;background:#f0fdf4;padding:16px;border-radius:8px;">
          <h4 style="margin:0 0 10px 0;font-size:13px;color:#16a34a;">✓ Övgü Konuları</h4>
          <ul style="margin:0;padding-left:18px;font-size:13px;color:#374151;line-height:1.6;">${praisesItems}</ul>
        </div>
      </div>

      ${recommendationsBlock}

      ${sampleCards ? `<h3 style="margin:0 0 10px 0;font-size:15px;color:#111827;">Örnek Yorumlar</h3>${sampleCards}` : ""}

      <div style="text-align:center;margin-top:24px;">
        <a href="${APP_URL}/reviews" style="display:inline-block;background:#7A5AF8;color:white;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px;">
          Tüm Yorumları Gör →
        </a>
      </div>
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
    const { business_id, new_reviews = [], platform_results = [] } = await req.json();

    if (!business_id) {
      return new Response(JSON.stringify({ error: "business_id required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Skip if nothing new and no errors worth reporting
    const hasErrors = (platform_results as PlatformResult[]).some((p) => p.error);
    if (new_reviews.length === 0 && !hasErrors) {
      return new Response(JSON.stringify({ skipped: true, reason: "no new reviews" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: business } = await supabase
      .from("businesses")
      .select("id, name, user_id")
      .eq("id", business_id)
      .single();

    if (!business) {
      return new Response(JSON.stringify({ error: "Business not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: { user } } = await supabase.auth.admin.getUserById(business.user_id);
    const ownerEmail = user?.email;

    const reviews = new_reviews as ReviewLite[];
    const totalNew = reviews.length;
    const avgRating = totalNew > 0
      ? reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / totalNew
      : 0;
    const summary = summarizeIssuesPraises(reviews);
    const aiSummary = await generateAISummary(reviews, business.name);

    const html = buildEmailHtml({
      businessName: business.name,
      totalNew,
      avgRating,
      platformResults: platform_results as PlatformResult[],
      summary,
      sampleReviews: reviews,
      aiSummary,
    });

    const subject = totalNew > 0
      ? `📊 ${business.name} — ${totalNew} yeni yorum (${avgRating.toFixed(1)}★)`
      : `⚠️ ${business.name} — Yorum çekme uyarısı`;

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
    console.log(`Summary email sent to ${Array.from(recipients).join(", ")}:`, result);

    return new Response(JSON.stringify({ success: true, recipients: Array.from(recipients) }), {
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
