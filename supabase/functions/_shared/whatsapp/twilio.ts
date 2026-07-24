import type {
  ChannelRef,
  MessageCategory,
  NormalizedInboundMessage,
  NormalizedStatusUpdate,
  SendResult,
  WhatsAppProvider,
} from "./types.ts";

// Twilio WhatsApp implementation.
// All secrets read from env: TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN.
// Never store these in DB.

function requireEnv(name: string): string {
  const v = Deno.env.get(name);
  if (!v) throw new Error(`Missing env: ${name}`);
  return v;
}

function twilioStatusToNormalized(s: string): SendResult["status"] {
  switch (s) {
    case "queued":
    case "accepted":
    case "scheduled":
      return "queued";
    case "sending":
    case "sent":
      return "sent";
    case "delivered":
      return "delivered";
    case "read":
      return "read";
    case "failed":
    case "undelivered":
      return "failed";
    default:
      return "queued";
  }
}

async function twilioPost(body: URLSearchParams): Promise<any> {
  const sid = requireEnv("TWILIO_ACCOUNT_SID");
  const token = requireEnv("TWILIO_AUTH_TOKEN");
  const url = `https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: "Basic " + btoa(`${sid}:${token}`),
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  });
  const text = await res.text();
  if (!res.ok) {
    throw new Error(`Twilio API ${res.status}: ${text}`);
  }
  return JSON.parse(text);
}

function waAddr(e164: string): string {
  return e164.startsWith("whatsapp:") ? e164 : `whatsapp:${e164}`;
}

export const twilioProvider: WhatsAppProvider = {
  name: "twilio",

  async sendTemplate(channel, to, templateName, params, _category): Promise<SendResult> {
    const form = new URLSearchParams();
    form.set("From", waAddr(channel.phone_number));
    form.set("To", waAddr(to));
    // Twilio Content API expects ContentSid + ContentVariables JSON
    form.set("ContentSid", templateName); // caller passes provider_template_ref (HXxxxx)
    if (params && Object.keys(params).length > 0) {
      form.set("ContentVariables", JSON.stringify(params));
    }
    if (channel.provider_account_ref) {
      form.set("MessagingServiceSid", channel.provider_account_ref);
    }
    const data = await twilioPost(form);
    return {
      providerMessageId: data.sid,
      status: twilioStatusToNormalized(data.status ?? "queued"),
    };
  },

  async sendFreeform(channel, to, body): Promise<SendResult> {
    const form = new URLSearchParams();
    form.set("From", waAddr(channel.phone_number));
    form.set("To", waAddr(to));
    form.set("Body", body);
    if (channel.provider_account_ref) {
      form.set("MessagingServiceSid", channel.provider_account_ref);
    }
    const data = await twilioPost(form);
    return {
      providerMessageId: data.sid,
      status: twilioStatusToNormalized(data.status ?? "queued"),
    };
  },

  parseWebhook(rawPayload: unknown): NormalizedInboundMessage | null {
    // Twilio posts application/x-www-form-urlencoded; caller should pass the parsed object.
    const p = rawPayload as Record<string, string> | null;
    if (!p || !p.MessageSid || !p.From) return null;
    const from = (p.From ?? "").replace(/^whatsapp:/, "");
    const to = (p.To ?? "").replace(/^whatsapp:/, "");
    const numMedia = parseInt(p.NumMedia ?? "0", 10);
    let type: NormalizedInboundMessage["type"] = "text";
    if (numMedia > 0) {
      const ct = p.MediaContentType0 ?? "";
      if (ct.startsWith("image/")) type = "image";
      else if (ct.startsWith("audio/")) type = "audio";
      else if (ct.startsWith("video/")) type = "video";
      else type = "document";
    } else if (p.Latitude && p.Longitude) {
      type = "location";
    }
    return {
      providerMessageId: p.MessageSid,
      from,
      to,
      body: p.Body ?? "",
      type,
      timestamp: new Date().toISOString(),
      raw: p,
    };
  },

  parseStatusCallback(rawPayload: unknown): NormalizedStatusUpdate | null {
    const p = rawPayload as Record<string, string> | null;
    if (!p || !p.MessageSid) return null;
    return {
      providerMessageId: p.MessageSid,
      status: twilioStatusToNormalized(p.MessageStatus ?? "queued"),
      errorCode: p.ErrorCode ?? null,
      errorMessage: p.ErrorMessage ?? null,
      raw: p,
    };
  },
};