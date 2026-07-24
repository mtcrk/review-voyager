import type { MessageCategory } from "./types.ts";

// Meta conversation fees (USD). Keys are ISO 3166-1 alpha-2 codes of the RECIPIENT.
type MetaTable = Partial<Record<"marketing" | "utility" | "authentication", number>>;
const META_FEES: Record<string, MetaTable> = {
  TR: { marketing: 0.0109, utility: 0.0009, authentication: 0.0009 },
  DE: { marketing: 0.1365, utility: 0.055, authentication: 0.055 },
  US: { marketing: 0.025, utility: 0.0034, authentication: 0.0034 },
  CA: { marketing: 0.025, utility: 0.0034, authentication: 0.0034 },
  GB: { marketing: 0.053, utility: 0.0264, authentication: 0.0264 },
  FR: { marketing: 0.1432, utility: 0.077, authentication: 0.077 },
  RU: { marketing: 0.0621, utility: 0.006, authentication: 0.006 },
  SA: { marketing: 0.0356, utility: 0.006, authentication: 0.006 },
  AE: { marketing: 0.0343, utility: 0.006, authentication: 0.006 },
};
const META_FEES_DEFAULT: MetaTable = { marketing: 0.05, utility: 0.005, authentication: 0.005 };

export const TWILIO_PROVIDER_FEE = 0.005;

export interface CostBreakdown {
  provider_fee: number;
  meta_fee: number;
  cost_estimate: number;
  cost_currency: string;
}

export function estimateCost(params: {
  provider: "twilio" | "360dialog";
  category: MessageCategory;
  recipientCountry: string | null;
  serviceWindowOpen: boolean;
  direction: "inbound" | "outbound";
}): CostBreakdown {
  const { provider, category, recipientCountry, serviceWindowOpen, direction } = params;
  const provider_fee = provider === "twilio" ? TWILIO_PROVIDER_FEE : 0;

  let meta_fee = 0;
  if (direction === "outbound") {
    const insideWindowFree =
      serviceWindowOpen && (category === "utility" || category === "freeform" || category === "service");
    if (!insideWindowFree) {
      const cc = (recipientCountry ?? "").toUpperCase();
      const table = META_FEES[cc] ?? META_FEES_DEFAULT;
      const key: "marketing" | "utility" | "authentication" =
        category === "marketing" || category === "utility" || category === "authentication"
          ? category
          : "utility";
      meta_fee = table[key] ?? META_FEES_DEFAULT[key] ?? 0;
    }
  }

  return {
    provider_fee,
    meta_fee,
    cost_estimate: +(provider_fee + meta_fee).toFixed(6),
    cost_currency: "USD",
  };
}