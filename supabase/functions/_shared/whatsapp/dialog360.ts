import type {
  NormalizedInboundMessage,
  NormalizedStatusUpdate,
  SendResult,
  WhatsAppProvider,
} from "./types.ts";

// 360dialog implementation — skeleton. Interface is exact; bodies throw until wired.
// Secrets (when implemented) will come from env: DIALOG360_API_KEY.

function notImplemented(): never {
  throw new Error("360dialog provider is not implemented yet");
}

export const dialog360Provider: WhatsAppProvider = {
  name: "360dialog",

  async sendTemplate(_channel, _to, _templateName, _params, _category): Promise<SendResult> {
    notImplemented();
  },

  async sendFreeform(_channel, _to, _body): Promise<SendResult> {
    notImplemented();
  },

  parseWebhook(_rawPayload: unknown): NormalizedInboundMessage | null {
    notImplemented();
  },

  parseStatusCallback(_rawPayload: unknown): NormalizedStatusUpdate | null {
    notImplemented();
  },
};