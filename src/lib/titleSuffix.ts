const BRAND = "VoyageRespond";

/**
 * Append `suffix` to `title` idempotently so the brand name never appears
 * twice.
 *
 * - If `title` already ends with "| VoyageRespond", that trailing brand
 *   segment is reused and only the suffix's non-brand tail is attached
 *   (e.g. "...| VoyageRespond" + "VoyageRespond Blog" -> "...| VoyageRespond Blog").
 * - If the brand already appears elsewhere in the title, the suffix is
 *   skipped entirely.
 * - Otherwise the full ` | suffix` is appended.
 *
 * Used for page <title> (and the og:title / twitter:title that inherit it).
 */
export function withBrandSuffix(title: string, suffix: string): string {
  const t = title.trim();
  if (!t) return suffix;

  // Title already ends with "| VoyageRespond": reuse the trailing brand and
  // attach only the suffix's non-brand tail (e.g. " Blog").
  const brandEnd = new RegExp(`\\s*\\|\\s*${BRAND}\\s*$`, "i");
  if (brandEnd.test(t)) {
    const tail = suffix.replace(new RegExp(`^${BRAND}\\s*`, "i"), "").trim();
    return tail ? `${t} ${tail}` : t;
  }

  // Brand already present elsewhere in the title: don't add another.
  if (new RegExp(`\\b${BRAND}\\b`, "i").test(t)) return t;

  return `${t} | ${suffix}`;
}
