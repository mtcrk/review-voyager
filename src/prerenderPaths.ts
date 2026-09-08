// Public routes that SHOULD be prerendered. Used by ssgOptions.includedRoutes in vite.config.
export const PRERENDER_PUBLIC_PATHS = [
  "/",
  "/login",
  "/register",
  "/forgot-password",
  "/privacy-policy",
  "/terms-of-service",
  "/mesafeli-satis-sozlesmesi",
  "/on-bilgilendirme-formu",
  "/iptal-iade-kosullari",
  "/onboarding",
  "/hub",
  "/contact",
  "/demo",
  "/about",
  "/rapor",
  "/blog",
  "/makaleler",

  "/google-yorum-cevap-ornekleri",
  "/restoran-yorum-cevaplari",
  "/otel-yorum-cevaplari",
  "/yorum-yonetim-araclari",
  "/online-itibar-yonetimi",
  "/musteri-memnuniyeti",
  "/restoran-musteri-memnuniyeti",
  "/saglik-itibar-yonetimi",
  "/dis-hekimi-yorum-yonetimi",
  "/estetik-klinik-yorum-yonetimi",
  "/zincir-restoran-yorum-yonetimi",
  "/google-yorum-yonetimi",
  "/google-review-management",
  "/yapay-zeka-yorum-cevaplama",
  "/ai-review-response",
  "/google-isletme-profili-optimizasyonu",
  "/google-business-profile-optimization",
  "/ai-gorunurluk",
  "/ai-search-visibility",
  "/isletme-yorum-yonetimi",
  "/business-review-management",
  "/online-reputation-management",
  "/review-management-software",
  "/google-review-response-examples",
  "/hotel-review-response-examples",
  "/restaurant-review-response-examples",
  "/multi-location-restaurant-review-management",
  "/healthcare-reputation-management",
  "/dental-practice-review-management",
  "/aesthetic-clinic-review-management",
  "/customer-satisfaction-management",
  "/restaurant-customer-satisfaction",
  "/hotel-review-management/istanbul",
  "/hotel-review-management/antalya",
  "/hotel-review-management/bodrum",
  "/hotel-review-management/kapadokya",
  "/hotel-review-management/izmir",
  "/hotel-review-management/ankara",
  "/hotel-review-management/alanya",
  "/hotel-review-management/marmaris",
  "/hotel-review-management/kemer",
  "/hotel-review-management/fethiye",
  "/hotel-review-management/cesme",
  "/hotel-review-management/kusadasi",
  "/hotel-review-management/bursa",
  "/hotel-review-management/trabzon",
  "/hotel-review-management/kayseri",
  "/platform/ai-for-google-reviews",
  "/platform/ai-for-instagram-comments",
  "/platform/ai-for-tripadvisor-reviews",
  "/platform/ai-for-booking-com-reviews",
  "/platform/ai-for-tiktok-comments",
  "/platform/ai-review-reply-writer",
  "/platform/ai-for-facebook-reviews",
  "/platform/ai-for-youtube-comments",
  "/platform/ai-for-hotels-com-reviews",
  "/platform/ai-for-trendyol-reviews",
  "/platform/ai-for-yemeksepeti-reviews",
  "/platform/ai-for-airbnb-reviews",
  "/platform/ai-for-zomato-reviews",
  "/automations/instagram-sales",
  "/automations/google-reviews",
  "/automations/whatsapp",
  "/automations/other",
];

// Protected app routes. These are prerendered as an *app shell* (ProtectedRoute
// renders only a loading spinner while the session is resolving, which is
// exactly what the client renders on first paint). Prerendering them prevents
// the SPA fallback from serving the prerendered marketing page HTML on direct
// URL entry / F5, which caused React #418/#423 hydration mismatches and the
// landing page appearing instead of the app.
export const PRERENDER_APP_SHELL_PATHS = [
  "/dashboard",
  "/reviews",
  "/inbox",
  "/locations",
  "/locations/platform-ratings",
  "/statistics",
  "/report",
  "/chat",
  "/settings",
  "/email",
  "/performance",
  "/rep-score",
  "/google-accounts",
  "/billing",
  "/billing/checkout",
  "/youtube",
  "/social-analytics",
  "/intelligence",
  "/intelligence/karsilastirma",
  "/konu-analizi",
  "/donem-analizi",
  "/ai-visibility",
  "/story-kit",
  "/channels/tiktok",
  "/tiktok-inbox",
  "/tiktok-review-kit",
  "/tiktok-dm",
];

// ---------------------------------------------------------------------------
// Canonical URL rule (single source of truth)
// ---------------------------------------------------------------------------
// Site-wide form: every path ends with a trailing slash, except the homepage.
// Used by <SEO> (canonical + hreflang), the sitemap generator and internal
// links so the same URL is never served in two forms.

export const SITE_URL = "https://voyagerespond.com";

/** "/foo" -> "/foo/", "//foo//" -> "/foo/", "/" stays "/". Query/hash dropped. */
export function canonicalPath(rawPath: string): string {
  const [pathOnly] = String(rawPath).split(/[?#]/);
  const collapsed = `/${pathOnly}`.replace(/\/{2,}/g, "/");
  if (collapsed === "/") return "/";
  return collapsed.endsWith("/") ? collapsed : `${collapsed}/`;
}

/** Absolute canonical URL for a path or an already absolute URL. */
export function canonicalUrl(value: string): string {
  if (/^https?:\/\//i.test(value)) {
    try {
      const u = new URL(value);
      return `${u.origin}${canonicalPath(u.pathname)}`;
    } catch {
      return value;
    }
  }
  return `${SITE_URL}${canonicalPath(value)}`;
}
