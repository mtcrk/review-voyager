const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const ADMIN_EMAIL = "metecorukbasari@gmail.com";
const FROM = "VoyageRespond <notify@voyagerespond.com>";
const REPLY_TO = "admin@voyagerespond.com";

const PLAN_LABELS: Record<string, string> = {
  hotel_flat: "Otel",
  restaurant_base: "Restoran",
  salon_flat: "Kuaför / Güzellik / Spa",
  clinic_flat: "Klinik",
};

const ADDON_LABELS: Record<string, string> = {
  competitor_analysis: "Rakip Analizi",
  ai_visibility: "AI Görünürlük Takibi",
};

function planLabel(code?: string | null) {
  if (!code) return "-";
  return PLAN_LABELS[code] ?? code;
}

function addonLabels(codes?: string[] | null) {
  if (!codes || codes.length === 0) return [];
  return codes.map((c) => ADDON_LABELS[c] ?? c);
}

function formatAmount(amount?: number | string | null) {
  const n = Number(amount ?? 0);
  return `${n.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} TL`;
}

function formatDate(d?: string | null) {
  if (!d) return "-";
  try {
    return new Date(d).toLocaleDateString("tr-TR", {
      timeZone: "Europe/Istanbul",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return String(d);
  }
}

function shell(title: string, subtitle: string, inner: string) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); border-radius: 12px; padding: 30px; color: white; margin-bottom: 20px;">
        <h1 style="margin: 0 0 5px 0; font-size: 20px;">${title}</h1>
        <p style="margin: 0; opacity: 0.8; font-size: 14px;">${subtitle}</p>
      </div>
      ${inner}
      <p style="text-align: center; color: #999; font-size: 12px; margin-top: 20px;">
        VoyageRespond · <a href="mailto:${REPLY_TO}" style="color:#7A5AF8; text-decoration:none;">${REPLY_TO}</a>
      </p>
    </div>
  `;
}

function rows(items: [string, string][]) {
  return `
    <div style="background: #f8f9fa; border-radius: 12px; padding: 24px;">
      <table style="width: 100%; border-collapse: collapse;">
        ${items
          .map(
            ([k, v]) => `<tr>
              <td style="padding: 8px 0; color: #666; font-size: 14px;">${k}</td>
              <td style="padding: 8px 0; font-weight: 600; font-size: 14px; text-align: right;">${v}</td>
            </tr>`,
          )
          .join("")}
      </table>
    </div>
  `;
}

async function sendMail(
  apiKey: string,
  to: string,
  subject: string,
  html: string,
) {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      from: FROM,
      reply_to: REPLY_TO,
      to: [to],
      subject,
      html,
    }),
  });
  const result = await res.json().catch(() => ({}));
  console.log("notify-subscription-email sent", { to, subject, result });
  return result;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const {
      type,
      business_id,
      to_email,
      business_name,
      plan_code,
      amount,
      location_count,
      addon_codes,
      next_billing_date,
    } = body ?? {};

    if (type !== "payment_success" && type !== "recurring_failed") {
      return new Response(JSON.stringify({ error: "invalid type" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (!RESEND_API_KEY) {
      console.log("notify-subscription-email: RESEND_API_KEY not configured, skipping", {
        type,
        business_id,
      });
      return new Response(JSON.stringify({ skipped: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const label = planLabel(plan_code);
    const addons = addonLabels(addon_codes);
    const locCount = Number(location_count ?? 1);

    if (type === "payment_success") {
      if (!to_email) {
        console.error("notify-subscription-email: missing to_email", { business_id });
      }

      const detailRows: [string, string][] = [
        ["Plan", label],
        ["Aylık tutar", formatAmount(amount)],
      ];
      if (locCount > 1) detailRows.push(["Lokasyon sayısı", String(locCount)]);
      if (addons.length) detailRows.push(["Ek modüller", addons.join(", ")]);
      detailRows.push(["Sonraki yenileme", formatDate(next_billing_date)]);

      const customerHtml = shell(
        "Aboneliğiniz aktif 🎉",
        "VoyageRespond aboneliğiniz başladı",
        `
          ${rows(detailRows)}
          <div style="background:#fff; border:1px solid #eee; border-radius:12px; padding:20px; margin-top:16px; font-size:14px; color:#444; line-height:1.6;">
            <p style="margin:0 0 10px 0;">Aboneliğiniz her ay otomatik olarak yenilenir. Dilediğiniz zaman panelinizdeki <strong>Abonelik</strong> bölümünden iptal edebilirsiniz.</p>
            <p style="margin:0;">İptal etmeniz hâlinde erişiminiz içinde bulunduğunuz dönemin sonuna kadar devam eder.</p>
          </div>
          <div style="text-align:center; margin-top:20px;">
            <a href="https://voyagerespond.com/dashboard" style="display:inline-block; background:#7A5AF8; color:#fff; text-decoration:none; padding:12px 24px; border-radius:8px; font-size:14px; font-weight:600;">Panele giriş yap</a>
          </div>
          <p style="text-align:center; font-size:12px; color:#888; margin-top:18px; line-height:1.8;">
            <a href="https://voyagerespond.com/mesafeli-satis-sozlesmesi" style="color:#7A5AF8; text-decoration:none;">Mesafeli Satış Sözleşmesi</a> ·
            <a href="https://voyagerespond.com/on-bilgilendirme-formu" style="color:#7A5AF8; text-decoration:none;">Ön Bilgilendirme Formu</a> ·
            <a href="https://voyagerespond.com/iptal-iade-kosullari" style="color:#7A5AF8; text-decoration:none;">İptal ve İade Koşulları</a>
          </p>
        `,
      );

      if (to_email) {
        await sendMail(
          RESEND_API_KEY,
          to_email,
          "Aboneliğiniz aktif — VoyageRespond",
          customerHtml,
        );
      }

      const adminHtml = shell(
        "💳 Yeni abonelik",
        "VoyageRespond'da yeni bir ödeme alındı",
        rows([
          ["İşletme", business_name || "-"],
          ["Müşteri e-postası", to_email || "-"],
          ["Plan", label],
          ["Tutar", formatAmount(amount)],
          ["Lokasyon sayısı", String(locCount)],
          ["Ek modüller", addons.length ? addons.join(", ") : "-"],
          ["Sonraki yenileme", formatDate(next_billing_date)],
        ]),
      );

      await sendMail(
        RESEND_API_KEY,
        ADMIN_EMAIL,
        `Yeni abonelik: ${business_name || "İşletme"} — ${label}`,
        adminHtml,
      );

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // recurring_failed
    if (!to_email) {
      console.error("notify-subscription-email: missing to_email for recurring_failed", {
        business_id,
      });
      return new Response(JSON.stringify({ skipped: true, reason: "no to_email" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const failedHtml = shell(
      "Ödemeniz alınamadı",
      "Aylık yenileme tahsilatı gerçekleştirilemedi",
      `
        <div style="background:#fff; border:1px solid #eee; border-radius:12px; padding:20px; font-size:14px; color:#444; line-height:1.6;">
          <p style="margin:0 0 10px 0;">${business_name ? `<strong>${business_name}</strong> için ` : ""}aylık yenileme tahsilatı kayıtlı kartınızdan alınamadı.</p>
          <p style="margin:0 0 10px 0;">Bunun nedeni kartınızın limiti, son kullanma tarihi veya bankanızın işlemi onaylamaması olabilir.</p>
          <p style="margin:0;">Tahsilat sağlanamazsa aboneliğiniz duraklatılır.</p>
        </div>
        <div style="text-align:center; margin-top:20px;">
          <a href="https://voyagerespond.com/billing/checkout?mode=update-card" style="display:inline-block; background:#7A5AF8; color:#fff; text-decoration:none; padding:12px 24px; border-radius:8px; font-size:14px; font-weight:600;">Kartı güncelle</a>
        </div>
      `,
    );

    await sendMail(
      RESEND_API_KEY,
      to_email,
      "Ödemeniz alınamadı — VoyageRespond",
      failedHtml,
    );

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("notify-subscription-email error", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "unknown" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});