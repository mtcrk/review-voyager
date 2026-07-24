// Provider-agnostic WhatsApp types. Business logic depends ONLY on these types.

export type Provider = "twilio" | "360dialog";
export type MessageCategory = "utility" | "marketing" | "authentication" | "service" | "freeform";
export type MessageStatus = "queued" | "sent" | "delivered" | "read" | "failed";

export interface ChannelRef {
  id: string;
  business_id: string;
  provider: Provider;
  phone_number: string;
  provider_account_ref: string | null;
}

export interface SendResult {
  providerMessageId: string;
  status: MessageStatus;
}

export interface NormalizedInboundMessage {
  providerMessageId: string;
  from: string;         // E.164 sender
  to: string;           // E.164 business number
  body: string;
  type: "text" | "image" | "audio" | "video" | "document" | "location" | "other";
  timestamp: string;    // ISO 8601
  raw: unknown;
}

export interface NormalizedStatusUpdate {
  providerMessageId: string;
  status: MessageStatus;
  errorCode?: string | null;
  errorMessage?: string | null;
  raw: unknown;
}

export interface WhatsAppProvider {
  readonly name: Provider;

  sendTemplate(
    channel: ChannelRef,
    to: string,
    templateName: string,
    params: Record<string, string>,
    category: Exclude<MessageCategory, "service" | "freeform">,
  ): Promise<SendResult>;

  sendFreeform(
    channel: ChannelRef,
    to: string,
    body: string,
  ): Promise<SendResult>;

  parseWebhook(rawPayload: unknown): NormalizedInboundMessage | null;
  parseStatusCallback(rawPayload: unknown): NormalizedStatusUpdate | null;
}