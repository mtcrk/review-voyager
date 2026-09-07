import { Helmet } from "react-helmet-async";
import { useLocation } from "react-router-dom";
import { canonicalPath as normalizePath, canonicalUrl as toCanonicalUrl, SITE_URL } from "@/prerenderPaths";
import { hreflangFor } from "@/lib/hreflangPairs";

interface SEOProps {
  title: string;
  description: string;
  canonical?: string;
  ogImage?: string;
  ogType?: string;
  noindex?: boolean;
  jsonLd?: Record<string, any> | Record<string, any>[];
  /** Reciprocal hreflang links (include an x-default entry). */
  alternates?: { hrefLang: string; href: string }[];
  /** Explicit language override; otherwise derived from alternates/path. */
  locale?: "tr" | "en";
}

const SEO = ({ title, description, canonical, ogImage, ogType, noindex, jsonLd, alternates, locale }: SEOProps) => {

  const location = useLocation();
  const isEnPath = location.pathname.startsWith("/en/") || location.pathname === "/en";

  let url = canonical ? toCanonicalUrl(canonical) : undefined;

  // For English routes, self-reference the /en/ canonical instead of the Turkish root
  if (isEnPath) {
    url = `${SITE_URL}${normalizePath(location.pathname)}`;
  }
  const image = ogImage || `${SITE_URL}/og-image.png`;
  const ldArray = jsonLd ? (Array.isArray(jsonLd) ? jsonLd : [jsonLd]) : [];

  // Derive language: explicit prop > /en/ prefix > matching hreflang alternate > tr
  const selfUrl = url ?? `${SITE_URL}${normalizePath(location.pathname)}`;
  const matchAlt = (lang: string) =>
    (alternates ?? []).some(
      (a) => a.hrefLang.toLowerCase() === lang && toCanonicalUrl(a.href) === selfUrl
    );
  const resolvedLocale: "tr" | "en" =
    locale ?? (isEnPath || matchAlt("en") ? "en" : matchAlt("tr") ? "tr" : "tr");
  const ogLocale = resolvedLocale === "en" ? "en_US" : "tr_TR";

  return (
    <Helmet htmlAttributes={{ lang: resolvedLocale }}>
      <title>{title}</title>
      <meta name="description" content={description} />
      {url && <link rel="canonical" href={url} />}
      {(alternates ?? []).map((a) => (
        <link key={a.hrefLang} rel="alternate" hrefLang={a.hrefLang} href={a.href} />
      ))}
      <meta
        name="robots"
        content={
          noindex
            ? "noindex, nofollow"
            : "index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1"
        }
      />

      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      {url && <meta property="og:url" content={url} />}
      <meta property="og:image" content={image} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:type" content={ogType || "website"} />
      <meta property="og:locale" content={ogLocale} />
      <meta property="og:site_name" content="VoyageRespond" />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      {ldArray.map((ld, i) => (
        <script key={i} type="application/ld+json">
          {JSON.stringify(ld)}
        </script>
      ))}
    </Helmet>
  );
};

export default SEO;