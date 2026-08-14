// Twilio WhatsApp provider — the ONLY file that knows Twilio specifics.
// A future 360dialog provider must export the same three functions with the
// same signatures; nothing Twilio-specific may leak outside this module.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

export interface SendContext {
  businessId: string;
  recipientId?: string | null;
}

export interface SendTemplateArgs extends SendContext {
  to: string;                          // E.164, e.g. +905551112233
  contentSid: string;                  // approved Content Template SID
  variables?: Record<string, string>;  // {"1": "...", "2": "..."}
  templateName?: string;
}

export interface SendFreeformArgs extends SendContext {
  to: string;
  body: string;
}

export interface WaSendResult {
  ok: boolean;
  providerMessageId: string | null;
  status: string;
  errorCode?: string | null;
  errorMessage?: string | null;
}

export interface NormalizedWebhook {
  from: string;                 // E.164, no whatsapp: prefix
  body: string;
  buttonPayload: string | null; // approve | edit | skip
  messageSid: string;
}

function env(name: string): string {
  const v = Deno.env.get(name);
  if (!v) throw new Error(`Missing secret: ${name}`);
  return v;
}

function admin() {
  return createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );
}

function waAddr(e164: string): string {
  return e164.startsWith("whatsapp:") ? e164 : `whatsapp:${e164}`;
}

function stripWa(v: string): string {
  return (v ?? "").replace(/^whatsapp:/, "");
}

async function logMessage(row: Record<string, unknown>) {
  try {
    await admin().from("wa_messages").insert(row);
  } catch (e) {
    console.error("wa_messages log failed:", e);
  }
}

async function post(form: URLSearchParams) {
  const sid = env("TWILIO_ACCOUNT_SID");
  const token = env("TWILIO_AUTH_TOKEN");
  const res = await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`,
    {
      method: "POST",
      headers: {
        Authorization: "Basic " + btoa(`${sid}:${token}`),
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: form,
    },
  );
  const text = await res.text();
  let json: any = null;
  try { json = JSON.parse(text); } catch { /* non-JSON error body */ }
  return { ok: res.ok, status: res.status, json, text };
}

async function send(
  ctx: SendContext,
  form: URLSearchParams,
  meta: { category: string; templateName: string | null; preview: string },
): Promise<WaSendResult> {
  form.set("From", waAddr(env("TWILIO_WHATSAPP_FROM")));

  let result: WaSendResult;
  try {
    const r = await post(form);
    if (!r.ok) {
      console.error(`Twilio send failed [${r.status}]: ${r.text}`);
      result = {
        ok: false,
        providerMessageId: null,
        status: "failed",
        errorCode: r.json?.code ? String(r.json.code) : String(r.status),
        errorMessage: r.json?.message ?? r.text,
      };
    } else {
      result = {
        ok: true,
        providerMessageId: r.json?.sid ?? null,
        status: r.json?.status ?? "queued",
      };
    }
  } catch (e) {
    result = {
      ok: false,
      providerMessageId: null,
      status: "failed",
      errorMessage: e instanceof Error ? e.message : String(e),
    };
  }

  await logMessage({
    business_id: ctx.businessId,
    recipient_id: ctx.recipientId ?? null,
    direction: "outbound",
    provider: "twilio",
    provider_message_id: result.providerMessageId,
    template_name: meta.templateName,
    category: meta.category,
    body: meta.preview.slice(0, 500),
    status: result.status,
    error_code: result.errorCode ?? null,
    error_message: result.errorMessage ?? null,
    sent_at: result.ok ? new Date().toISOString() : null,
  });

  return result;
}

/** Approved template send (outside the 24h window). */
export async function sendTemplate(args: SendTemplateArgs): Promise<WaSendResult> {
  const form = new URLSearchParams();
  form.set("To", waAddr(args.to));
  form.set("ContentSid", args.contentSid);
  if (args.variables && Object.keys(args.variables).length > 0) {
    form.set("ContentVariables", JSON.stringify(args.variables));
  }
  return await send(args, form, {
    category: "template",
    templateName: args.templateName ?? args.contentSid,
    preview: JSON.stringify(args.variables ?? {}),
  });
}

/** Plain text send — only valid inside the 24h service window. */
export async function sendFreeform(args: SendFreeformArgs): Promise<WaSendResult> {
  const form = new URLSearchParams();
  form.set("To", waAddr(args.to));
  form.set("Body", args.body);
  return await send(args, form, {
    category: "freeform",
    templateName: null,
    preview: args.body,
  });
}

/** Normalize an inbound Twilio webhook request. */
export async function parseWebhook(request: Request): Promise<NormalizedWebhook | null> {
  const ct = request.headers.get("content-type") ?? "";
  let p: Record<string, string>;
  if (ct.includes("application/json")) {
    p = await request.json();
  } else {
    const form = await request.formData();
    p = Object.fromEntries(
      Array.from(form.entries()).map(([k, v]) => [k, String(v)]),
    );
  }
  if (!p.MessageSid || !p.From) return null;
  return {
    from: stripWa(p.From),
    body: p.Body ?? "",
    buttonPayload: p.ButtonPayload ?? p.ButtonText ?? null,
    messageSid: p.MessageSid,
  };
}
