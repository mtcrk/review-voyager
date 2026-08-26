import { Helmet } from "react-helmet-async";
import { useLocation } from "react-router-dom";

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
}


const SITE_URL = "https://voyagerespond.com";

/**
 * Site-wide canonical form: trailing slash.
 * "/blog/foo" -> "/blog/foo/", "//blog//foo" -> "/blog/foo/", "/" stays "/".
 * Query/hash are dropped from canonical URLs on purpose.
 */
const normalizePath = (rawPath: string) => {
  const [pathOnly] = rawPath.split(/[?#]/);
  const collapsed = `/${pathOnly}`.replace(/\/{2,}/g, "/");
  if (collapsed === "/") return "/";
  return collapsed.endsWith("/") ? collapsed : `${collapsed}/`;
};

const toCanonicalUrl = (value: string) => {
  if (/^https?:\/\//i.test(value)) {
    try {
      const u = new URL(value);
      return `${u.origin}${normalizePath(u.pathname)}`;
    } catch {
      return value;
    }
  }
  return `${SITE_URL}${normalizePath(value)}`;
};

const SEO = ({ title, description, canonical, ogImage, ogType, noindex, jsonLd, alternates }: SEOProps) => {
  const location = useLocation();
  const isEn = location.pathname.startsWith("/en/") || location.pathname === "/en";

  let url = canonical ? toCanonicalUrl(canonical) : undefined;

  // For English routes, self-reference the /en/ canonical instead of the Turkish root
  if (isEn) {
    url = `${SITE_URL}${normalizePath(location.pathname)}`;
  }
  const image = ogImage || `${SITE_URL}/og-image.png`;
  const ldArray = jsonLd ? (Array.isArray(jsonLd) ? jsonLd : [jsonLd]) : [];

  return (
    <Helmet>
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
      <meta property="og:locale" content="tr_TR" />
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