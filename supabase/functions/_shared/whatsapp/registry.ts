import type { Provider, WhatsAppProvider } from "./types.ts";
import { twilioProvider } from "./twilio.ts";
import { dialog360Provider } from "./dialog360.ts";

const PROVIDERS: Record<Provider, WhatsAppProvider> = {
  twilio: twilioProvider,
  "360dialog": dialog360Provider,
};

export function getProvider(name: Provider): WhatsAppProvider {
  const p = PROVIDERS[name];
  if (!p) throw new Error(`Unknown WhatsApp provider: ${name}`);
  return p;
}