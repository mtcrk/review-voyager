import { canonicalPath } from "@/prerenderPaths";

/**
 * Normalises an internal link target to the site's canonical trailing-slash
 * form, while preserving query strings and hashes.
 *
 * Untouched: external URLs (http/https/mailto/tel/protocol-relative),
 * hash-only links (`#faq`), query-only links (`?tab=x`) and relative paths.
 */
export function canonicalTo<T>(to: T): T {
  if (typeof to !== "string") return to;

  const value = to as string;
  if (value === "") return to;

  // External / non-path targets
  if (/^[a-z][a-z0-9+.-]*:/i.test(value) || value.startsWith("//")) return to;

  // Hash-only or query-only links stay as they are
  if (value.startsWith("#") || value.startsWith("?")) return to;

  // Only absolute internal paths are normalised
  if (!value.startsWith("/")) return to;

  const hashIndex = value.indexOf("#");
  const hash = hashIndex >= 0 ? value.slice(hashIndex) : "";
  const withoutHash = hashIndex >= 0 ? value.slice(0, hashIndex) : value;

  const queryIndex = withoutHash.indexOf("?");
  const query = queryIndex >= 0 ? withoutHash.slice(queryIndex) : "";
  const pathOnly = queryIndex >= 0 ? withoutHash.slice(0, queryIndex) : withoutHash;

  return (`${canonicalPath(pathOnly)}${query}${hash}` as unknown) as T;
}
