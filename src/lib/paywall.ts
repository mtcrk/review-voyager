// Ödeme yapmadan uygulamaya giremeyecek hesaplar.
// Bu hesaplar için Checkout'ta sadece Otel planı ve iki opsiyonel modül gösterilir.
export const FORCED_CHECKOUT_EMAILS = [
  "starlight@voyagerespond.com",
  "sales@inciclasshotel.com.tr",
];

/** Zorunlu plan (segment) */
export const FORCED_PLAN_SEGMENT = "hotel" as const;

/** Bu hesaplara sunulan opsiyonel ek modüller */
export const FORCED_ADDON_CODES = ["ai_visibility", "competitor_analysis"];

/** Ödeme duvarı dışında kalan (erişilebilir) yollar */
export const PAYWALL_ALLOWED_PATHS = ["/billing", "/auth/callback"];

export function isForcedCheckoutEmail(email?: string | null): boolean {
  if (!email) return false;
  return FORCED_CHECKOUT_EMAILS.includes(email.trim().toLowerCase());
}

const ACTIVE_STATUSES = ["active", "trialing", "past_due_grace"];
export function isActiveSubscriptionStatus(status?: string | null): boolean {
  return !!status && ACTIVE_STATUSES.includes(status);
}
