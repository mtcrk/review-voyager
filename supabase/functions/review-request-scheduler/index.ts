import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const MAX_PER_BUSINESS = 50;

type Lang = "tr" | "en";

function template(lang: Lang, opts: {
  businessName: string;
  senderName?: string | null;
  name?: string | null;
  intro?: string | null;
  clickUrl: string;
  unsubscribeUrl: string;
  isReminder: boolean;
}): { subject: string; html: string } {
  const isTR = lang === "tr";
  const greetName = opts.name?.trim() || (isTR ? "Değerli Misafirimiz" : "Dear Guest");
  const bizName = opts.senderName?.trim() || opts.businessName;

  const subject = isReminderSubject(isTR, opts.isReminder, bizName);

  const introText = opts.intro?.trim() || (
    opts.isReminder
      ? (isTR
          ? `Kısa bir hatırlatma — ${bizName} olarak deneyiminizi bizimle paylaşmanızı çok isteriz. Yorumunuz sadece 30 saniyenizi alır.`
          : `A gentle reminder — we'd love to hear about your experience at ${bizName}. It only takes 30 seconds.`)
      : (isTR
          ? `Bizi tercih ettiğiniz için teşekkür ederiz. ${bizName} olarak deneyiminizi bir yorumla paylaşmanız, hem bize hem de sizden sonraki misafirlere çok yardımcı olur.`
          : `Thank you for choosing ${bizName}. Sharing your experience in a short review helps us — and future guests — a lot.`)
  );

  const cta = isTR ? "Yorumunuzu paylaşın" : "Share your review";
  const unsubText = isTR ? "E-posta almak istemiyorum" : "Unsubscribe";
  const footer = isTR
    ? `${bizName} tarafından gönderildi`
    : `Sent by ${bizName}`;

  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6;">
<tr><td align="center" style="padding:40px 16px;">
<table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background:#ffffff;border-radius:12px;border:1px solid #e5e7eb;overflow:hidden;">
<tr><td style="height:4px;background:linear-gradient(90deg,#7C3AED,#6366F1);font-size:0;line-height:0;">&nbsp;</td></tr>
<tr><td style="padding:36px 32px;">
<p style="margin:0 0 16px 0;color:#111827;font-size:16px;">${escapeHtml(isTR ? "Merhaba" : "Hi")} ${escapeHtml(greetName)},</p>
<p style="margin:0 0 24px 0;color:#374151;font-size:15px;line-height:1.6;">${escapeHtml(introText)}</p>
<p style="margin:0 0 32px 0;text-align:center;">
  <a href="${opts.clickUrl}" style="display:inline-block;background:#7C3AED;color:#ffffff;text-decoration:none;padding:14px 28px;border-radius:8px;font-weight:600;font-size:15px;">${cta}</a>
</p>
<p style="margin:0;color:#6b7280;font-size:13px;">${isTR ? "Teşekkürler" : "Thank you"},<br/>${escapeHtml(bizName)}</p>
</td></tr></table>
<p style="margin:20px 0 0 0;font-size:11px;color:#9ca3af;text-align:center;">
  ${escapeHtml(footer)} · <a href="${opts.unsubscribeUrl}" style="color:#9ca3af;">${unsubText}</a>
</p>
</td></tr></table></body></html>`;
  return { subject, html };
}

function isReminderSubject(isTR: boolean, isReminder: boolean, biz: string) {
  if (isReminder) return isTR ? `Küçük bir hatırlatma — ${biz}` : `A quick reminder — ${biz}`;
  return isTR ? `${biz}: deneyiminizi paylaşır mısınız?` : `${biz}: could you share your experience?`;
}

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
  const APP_URL = Deno.env.get("APP_URL") || "https://voyagerespond.com";
  const supabase = createClient(supabaseUrl, serviceKey);

  if (!RESEND_API_KEY) {
    return json({ error: "RESEND_API_KEY not configured", provider_ready: false }, 500);
  }

  const now = new Date();
  const summary = { processed: 0, sent: 0, reminded: 0, failed: 0, businesses: 0 };

  // Load all enabled settings
  const { data: settings, error: sErr } = await supabase
    .from("review_request_settings")
    .select("*")
    .eq("enabled", true);
  if (sErr) return json({ error: sErr.message }, 500);

  for (const s of settings ?? []) {
    const { data: biz } = await supabase
      .from("businesses")
      .select("id, name, place_id")
      .eq("id", s.business_id)
      .maybeSingle();
    if (!biz) continue;

    const reviewLink = (s.review_link?.trim())
      || (biz.place_id ? `https://search.google.com/local/writereview?placeid=${biz.place_id}` : null);
    if (!reviewLink) continue;

    summary.businesses++;
    let sentThisBiz = 0;

    // ---- Initial sends: consent, pending, checkout + delay_hours <= now
    const cutoffInitial = new Date(now.getTime() - s.delay_hours * 3600 * 1000).toISOString();
    const { data: pendings } = await supabase
      .from("review_request_contacts")
      .select("*")
      .eq("business_id", biz.id)
      .eq("consent", true)
      .eq("status", "pending")
      .lte("checkout_date", cutoffInitial.slice(0, 10))
      .limit(MAX_PER_BUSINESS);

    for (const c of pendings ?? []) {
      if (sentThisBiz >= MAX_PER_BUSINESS) break;
      // Ensure delay_hours actually elapsed (checkout_date is date; treat as midnight UTC + delay)
      const checkoutMs = new Date(c.checkout_date + "T00:00:00Z").getTime() + s.delay_hours * 3600 * 1000;
      if (checkoutMs > now.getTime()) continue;

      const clickUrl = `${APP_URL}/api-click/${c.unsubscribe_token}`;
      // Actually route through edge function URL:
      const fnBase = `${supabaseUrl}/functions/v1/review-request-click`;
      const click = `${fnBase}?t=${c.unsubscribe_token}`;
      const unsub = `${fnBase}?t=${c.unsubscribe_token}&action=unsubscribe`;

      const { subject, html } = template((c.language === "en" ? "en" : "tr") as Lang, {
        businessName: biz.name,
        senderName: s.sender_name,
        name: c.name,
        intro: s.template_intro,
        clickUrl: click,
        unsubscribeUrl: unsub,
        isReminder: false,
      });

      const ok = await sendEmail(RESEND_API_KEY, biz.name, c.email, subject, html);
      if (ok.ok) {
        await supabase.from("review_request_contacts")
          .update({ status: "sent", sent_at: new Date().toISOString(), error_message: null })
          .eq("id", c.id);
        summary.sent++;
        sentThisBiz++;
      } else {
        await supabase.from("review_request_contacts")
          .update({ status: "failed", error_message: ok.error })
          .eq("id", c.id);
        summary.failed++;
      }
      summary.processed++;
    }

    // ---- Reminders
    if (s.reminder_enabled) {
      const remCutoff = new Date(now.getTime() - s.reminder_days * 24 * 3600 * 1000).toISOString();
      const { data: reminders } = await supabase
        .from("review_request_contacts")
        .select("*")
        .eq("business_id", biz.id)
        .eq("status", "sent")
        .is("clicked_at", null)
        .is("reminded_at", null)
        .lte("sent_at", remCutoff)
        .limit(MAX_PER_BUSINESS - sentThisBiz);

      for (const c of reminders ?? []) {
        if (sentThisBiz >= MAX_PER_BUSINESS) break;
        const fnBase = `${supabaseUrl}/functions/v1/review-request-click`;
        const click = `${fnBase}?t=${c.unsubscribe_token}`;
        const unsub = `${fnBase}?t=${c.unsubscribe_token}&action=unsubscribe`;
        const { subject, html } = template((c.language === "en" ? "en" : "tr") as Lang, {
          businessName: biz.name,
          senderName: s.sender_name,
          name: c.name,
          intro: s.template_intro,
          clickUrl: click,
          unsubscribeUrl: unsub,
          isReminder: true,
        });
        const ok = await sendEmail(RESEND_API_KEY, biz.name, c.email, subject, html);
        if (ok.ok) {
          await supabase.from("review_request_contacts")
            .update({ status: "reminded", reminded_at: new Date().toISOString() })
            .eq("id", c.id);
          summary.reminded++;
          sentThisBiz++;
        } else {
          summary.failed++;
        }
        summary.processed++;
      }
    }
  }

  return json({ ok: true, summary });

  function json(body: unknown, status = 200) {
    return new Response(JSON.stringify(body), {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

async function sendEmail(apiKey: string, bizName: string, to: string, subject: string, html: string): Promise<{ ok: boolean; error?: string }> {
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: `${bizName} <notify@voyagerespond.com>`,
        to: [to],
        subject,
        html,
      }),
    });
    if (!res.ok) {
      const t = await res.text();
      return { ok: false, error: `${res.status}: ${t.slice(0, 200)}` };
    }
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "send failed" };
  }
}