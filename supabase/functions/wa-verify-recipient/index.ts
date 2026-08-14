// deno-lint-ignore-file no-explicit-any
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { sendTemplate } from "../_shared/wa/twilio.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const ANON = Deno.env.get("SUPABASE_ANON_KEY")!;

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization") ?? "";
    if (!authHeader.startsWith("Bearer ")) return json({ error: "Unauthorized" }, 401);

    const userClient = createClient(SUPABASE_URL, ANON, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData } = await userClient.auth.getUser();
    const user = userData?.user;
    if (!user) return json({ error: "Unauthorized" }, 401);

    const body = await req.json().catch(() => ({}));
    const recipientId = String(body?.recipient_id ?? "");
    if (!recipientId) return json({ error: "recipient_id gerekli" }, 400);

    const admin = createClient(SUPABASE_URL, SERVICE_ROLE);

    const { data: recipient, error: rErr } = await admin
      .from("wa_recipients")
      .select("id, business_id, phone_e164, status, verification_sent_at")
      .eq("id", recipientId)
      .maybeSingle();
    if (rErr) throw rErr;
    if (!recipient) return json({ error: "Alıcı bulunamadı" }, 404);

    const { data: business, error: bErr } = await admin
      .from("businesses")
      .select("id, name, user_id")
      .eq("id", recipient.business_id)
      .maybeSingle();
    if (bErr) throw bErr;
    if (!business || business.user_id !== user.id) return json({ error: "Forbidden" }, 403);

    if (recipient.status === "verified") {
      return json({ ok: true, already_verified: true });
    }

    if (recipient.verification_sent_at) {
      const sent = new Date(recipient.verification_sent_at).getTime();
      if (Date.now() - sent < 24 * 60 * 60 * 1000) {
        return json(
          { error: "Bu numaraya son 24 saat içinde doğrulama mesajı gönderildi. Lütfen daha sonra tekrar deneyin." },
          429,
        );
      }
    }

    const contentSid = Deno.env.get("WA_TEMPLATE_OPTIN_SID");
    if (!contentSid) {
      return json(
        { error: "WhatsApp doğrulama şablonu henüz yapılandırılmadı (WA_TEMPLATE_OPTIN_SID eksik)." },
        503,
      );
    }

    const result = await sendTemplate({
      businessId: recipient.business_id,
      recipientId: recipient.id,
      to: recipient.phone_e164,
      contentSid,
      variables: { "1": business.name ?? "İşletmeniz" },
      templateName: "alici_dogrulama",
    });

    if (!result.ok) {
      return json(
        { error: result.errorMessage ?? "Doğrulama mesajı gönderilemedi.", code: result.errorCode ?? null },
        502,
      );
    }

    await admin
      .from("wa_recipients")
      .update({ verification_sent_at: new Date().toISOString() })
      .eq("id", recipient.id);

    return json({ ok: true, status: result.status });
  } catch (e) {
    console.error("wa-verify-recipient error:", e);
    return json({ error: e instanceof Error ? e.message : String(e) }, 500);
  }
});
