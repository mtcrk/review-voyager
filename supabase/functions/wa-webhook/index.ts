// deno-lint-ignore-file no-explicit-any
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { parseWebhook, sendFreeform } from "../_shared/wa/twilio.ts";
import { publishReply } from "../_shared/wa/publish.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

function ok(body: unknown = { ok: true }) {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

/** Twilio signature: base64(HMAC-SHA1(authToken, url + sorted(key+value)...)) */
async function validTwilioSignature(
  signature: string,
  url: string,
  params: Record<string, string>,
): Promise<boolean> {
  const token = Deno.env.get("TWILIO_AUTH_TOKEN");
  if (!token || !signature) return false;
  const data =
    url +
    Object.keys(params)
      .sort()
      .map((k) => k + params[k])
      .join("");
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(token),
    { name: "HMAC", hash: "SHA-1" },
    false,
    ["sign"],
  );
  const mac = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(data));
  const expected = btoa(String.fromCharCode(...new Uint8Array(mac)));
  if (expected.length !== signature.length) return false;
  let diff = 0;
  for (let i = 0; i < expected.length; i++) diff |= expected.charCodeAt(i) ^ signature.charCodeAt(i);
  return diff === 0;
}

function normalizeText(v: string): string {
  return (v ?? "")
    .trim()
    .toLocaleLowerCase("tr")
    .replace(/ı/g, "i")
    .replace(/İ/g, "i")
    .replace(/ç/g, "c")
    .replace(/ğ/g, "g")
    .replace(/ö/g, "o")
    .replace(/ş/g, "s")
    .replace(/ü/g, "u")
    .replace(/[^a-z]/g, "");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    // 1) Signature validation — this endpoint is public, so it cannot be skipped.
    const signature = req.headers.get("X-Twilio-Signature") ?? "";
    const clone = req.clone();
    let params: Record<string, string> = {};
    const ct = req.headers.get("content-type") ?? "";
    if (!ct.includes("application/json")) {
      const form = await clone.formData();
      params = Object.fromEntries(
        Array.from(form.entries()).map(([k, v]) => [k, String(v)]),
      );
    } else {
      params = await clone.json().catch(() => ({}));
    }

    const publicUrl = req.headers.get("X-Forwarded-Proto")
      ? `${req.headers.get("X-Forwarded-Proto")}://${req.headers.get("host")}${new URL(req.url).pathname}${new URL(req.url).search}`
      : req.url;

    const valid = await validTwilioSignature(signature, publicUrl, params);
    if (!valid) {
      console.warn("wa-webhook: invalid Twilio signature");
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const msg = await parseWebhook(req);
    if (!msg) return ok({ ok: true, ignored: true });

    const admin = createClient(SUPABASE_URL, SERVICE_ROLE);
    const from = (msg.from ?? "").replace(/^whatsapp:/, "");

    const { data: recipient } = await admin
      .from("wa_recipients")
      .select("id, business_id, status")
      .eq("phone_e164", from)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    // Log inbound message (recipient may be unknown)
    if (recipient) {
      await admin.from("wa_messages").insert({
        business_id: recipient.business_id,
        recipient_id: recipient.id,
        direction: "inbound",
        provider: "twilio",
        provider_message_id: msg.messageSid,
        category: "inbound",
        body: (msg.body ?? "").slice(0, 500),
        status: "received",
      });
    }

    if (!recipient) {
      console.warn("wa-webhook: no recipient for", from);
      return ok({ ok: true, ignored: "no_recipient" });
    }

    // 24h service window bookkeeping
    const now = new Date();
    const expires = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const { data: convo } = await admin
      .from("wa_conversations")
      .select("id")
      .eq("recipient_id", recipient.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (convo) {
      await admin
        .from("wa_conversations")
        .update({ last_inbound_at: now.toISOString(), window_expires_at: expires.toISOString() })
        .eq("id", convo.id);
    } else {
      await admin.from("wa_conversations").insert({
        business_id: recipient.business_id,
        recipient_id: recipient.id,
        window_opened_at: now.toISOString(),
        window_expires_at: expires.toISOString(),
        last_inbound_at: now.toISOString(),
      });
    }

    const payload = (msg.buttonPayload ?? "").trim();
    const text = normalizeText(msg.body ?? "");

    let decision: "accept" | "decline" | "stop" | null = null;
    if (payload === "optin_yes" || text === "evet") decision = "accept";
    else if (payload === "optin_no") decision = "decline";
    else if (text === "durdur" || text === "stop") decision = "stop";

    // TODO (Faz 2): approve / edit / skip buton aksiyonlarını burada işle.

    if (decision === "accept") {
      await admin
        .from("wa_recipients")
        .update({ status: "verified", verified_at: now.toISOString(), opt_in_at: now.toISOString() })
        .eq("id", recipient.id);
      await sendFreeform({
        businessId: recipient.business_id,
        recipientId: recipient.id,
        to: from,
        body:
          "Teşekkürler. Bundan sonra yeni yorumları buradan ileteceğiz. Çıkmak için istediğiniz zaman DURDUR yazabilirsiniz.",
      });
    } else if (decision === "decline" || decision === "stop") {
      await admin
        .from("wa_recipients")
        .update(
          decision === "decline"
            ? { status: "declined", opt_out_at: now.toISOString() }
            : { status: "opted_out", opt_out_at: now.toISOString(), is_active: false },
        )
        .eq("id", recipient.id);
      await sendFreeform({
        businessId: recipient.business_id,
        recipientId: recipient.id,
        to: from,
        body: "Anlaşıldı, bu numaraya bildirim göndermeyeceğiz.",
      });
    }

    return ok({ ok: true, decision });
  } catch (e) {
    // Never return 5xx: Twilio would retry indefinitely.
    console.error("wa-webhook error:", e);
    return ok({ ok: true, error: e instanceof Error ? e.message : String(e) });
  }
});
