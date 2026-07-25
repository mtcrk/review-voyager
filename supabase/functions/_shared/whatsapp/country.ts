// Map an E.164 phone number to an ISO 3166-1 alpha-2 country code.
// Small, dependency-free lookup — covers the countries we bill for and
// falls back to a `default` bucket that pricing.ts also handles.

const PREFIX_TO_ISO: Array<[string, string]> = [
  // Longer prefixes first so the trie-style match picks the most specific one.
  ["+90", "TR"],
  ["+49", "DE"],
  ["+44", "GB"],
  ["+7", "RU"],
  ["+31", "NL"],
  ["+33", "FR"],
  ["+39", "IT"],
  ["+34", "ES"],
  ["+971", "AE"],
  ["+966", "SA"],
  ["+1", "US"],
];

export function isoCountryFromE164(phone: string | null | undefined): string | null {
  if (!phone) return null;
  const p = phone.startsWith("whatsapp:") ? phone.slice("whatsapp:".length) : phone;
  const normalized = p.trim();
  if (!normalized.startsWith("+")) return null;
  // Sort by length desc to prefer +971 over +9, +44 over +4, etc.
  const sorted = [...PREFIX_TO_ISO].sort((a, b) => b[0].length - a[0].length);
  for (const [prefix, iso] of sorted) {
    if (normalized.startsWith(prefix)) return iso;
  }
  return null;
}