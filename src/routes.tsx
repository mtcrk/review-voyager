import type { RouteRecord } from "vite-react-ssg";
import { Navigate, useLocation } from "react-router-dom";
import RootLayout from "./App";
import { AppLayout } from "@/components/layout/AppLayout";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { cityHotelData } from "./lib/cityHotelData";
import { platformLandingPages } from "./lib/platformLandingData";
import { blogPosts } from "./lib/blogPosts";
import { restoranClusterPosts } from "./lib/blogClusterRestoran";
import { memnuniyetClusterPosts } from "./lib/blogClusterMemnuniyet";
import { saglikClusterPosts } from "./lib/blogClusterSaglik";
import { restoranZinciriClusterPosts } from "./lib/blogClusterRestoranZinciri";

// Convert default-export pages into the { Component } shape data-router lazy expects.
const lazyDefault =
  (importer: () => Promise<{ default: React.ComponentType<any> }>) =>
  async () => ({ Component: (await importer()).default });

// Wraps a lazy default-exported page in <ProtectedRoute><AppLayout>...</AppLayout></ProtectedRoute>
const lazyProtectedLayout =
  (importer: () => Promise<{ default: React.ComponentType<any> }>) =>
  async () => {
    const Page = (await importer()).default;
    return {
      Component: () => (
        <ProtectedRoute>
          <AppLayout>
            <Page />
          </AppLayout>
        </ProtectedRoute>
      ),
    };
  };

const lazyProtected =
  (importer: () => Promise<{ default: React.ComponentType<any> }>) =>
  async () => {
    const Page = (await importer()).default;
    return {
      Component: () => (
        <ProtectedRoute>
          <Page />
        </ProtectedRoute>
      ),
    };
  };

const lazyProtectedTiktokLayout =
  (importer: () => Promise<{ default: React.ComponentType<any> }>) =>
  async () => {
    const Page = (await importer()).default;
    return {
      Component: () => (
        <ProtectedRoute>
          <AppLayout>
            <Page />
          </AppLayout>
        </ProtectedRoute>
      ),
    };
  };

// /en/* runtime redirector — strips /en prefix and navigates to TR canonical.
function EnRedirect() {
  const loc = useLocation();
  const target = loc.pathname.replace(/^\/en/, "") || "/";
  return <Navigate to={target + loc.search + loc.hash} replace />;
}

const loadCityHotelSlugs = (): string[] =>
  cityHotelData.map((x) => x.slug).filter(Boolean);
const loadPlatformSlugs = (): string[] =>
  platformLandingPages.map((x) => x.slug).filter(Boolean);
const loadBlogSlugs = (): string[] => {
  const all = [...blogPosts, ...restoranClusterPosts, ...memnuniyetClusterPosts, ...saglikClusterPosts, ...restoranZinciriClusterPosts];
  return [...new Set(all.map((p) => p.slug).filter(Boolean))];
};

export const routes: RouteRecord[] = [
  {
    path: "/",
    Component: RootLayout,
    children: [
      // ---------- Public / SEO (prerendered) ----------
      { index: true, lazy: lazyDefault(() => import("./pages/Index")) },
      { path: "login", lazy: lazyDefault(() => import("./pages/Login")) },
      { path: "register", lazy: lazyDefault(() => import("./pages/Register")) },
      { path: "~oauth/initiate", lazy: lazyDefault(() => import("./pages/OAuthInitiateRedirect")) },
      { path: "forgot-password", lazy: lazyDefault(() => import("./pages/ForgotPassword")) },
      { path: "privacy-policy", lazy: lazyDefault(() => import("./pages/PrivacyPolicy")) },
      { path: "terms-of-service", lazy: lazyDefault(() => import("./pages/TermsOfService")) },
      { path: "mesafeli-satis-sozlesmesi", lazy: lazyDefault(() => import("./pages/legal/DistanceSalesAgreement")) },
      { path: "on-bilgilendirme-formu", lazy: lazyDefault(() => import("./pages/legal/PreliminaryInfoForm")) },
      { path: "iptal-iade-kosullari", lazy: lazyDefault(() => import("./pages/legal/CancellationPolicy")) },
      { path: "auth/callback", lazy: lazyDefault(() => import("./pages/AuthCallback")) },
      { path: "auth/google-business/callback", lazy: lazyDefault(() => import("./pages/GoogleBusinessCallback")) },
      { path: "auth/reset", lazy: lazyDefault(() => import("./pages/ResetPassword")) },
      { path: "onboarding", lazy: lazyDefault(() => import("./pages/Onboarding")) },
      { path: "hub", lazy: lazyDefault(() => import("./pages/Hub")) },
      { path: "pricing", Component: () => <Navigate to="/#pricing" replace /> },
      { path: "contact", lazy: lazyDefault(() => import("./pages/Contact")) },
      { path: "demo", lazy: lazyDefault(() => import("./pages/DemoPage")) },
      { path: "about", lazy: lazyDefault(() => import("./pages/About")) },
      { path: "rapor", lazy: lazyDefault(() => import("./pages/RaporIndir")) },
      { path: "blog", lazy: lazyDefault(() => import("./pages/Blog")) },
      {
        path: "blog/:slug",
        lazy: lazyDefault(() => import("./pages/BlogPost")),
        getStaticPaths: () => loadBlogSlugs().map((s) => `blog/${s}`),
      },
      { path: "google-yorum-cevap-ornekleri", lazy: lazyDefault(() => import("./pages/seo/GoogleYorumCevapOrnekleri")) },
      { path: "restoran-yorum-cevaplari", lazy: lazyDefault(() => import("./pages/seo/RestoranYorumCevaplari")) },
      { path: "otel-yorum-cevaplari", lazy: lazyDefault(() => import("./pages/seo/OtelYorumCevaplari")) },
      {
        path: "otel-yorum-yonetimi/:sehir",
        lazy: lazyDefault(() => import("./pages/seo/SehirOtelYorumYonetimi")),
        getStaticPaths: () => loadCityHotelSlugs().map((s) => `otel-yorum-yonetimi/${s}`),
      },
      { path: "yorum-yonetim-araclari", lazy: lazyDefault(() => import("./pages/seo/YorumYonetimAraclari")) },
      { path: "online-itibar-yonetimi", lazy: lazyDefault(() => import("./pages/seo/OnlineItibarYonetimi")) },
      { path: "musteri-memnuniyeti", lazy: lazyDefault(() => import("./pages/seo/MusteriMemnuniyeti")) },
      { path: "restoran-musteri-memnuniyeti", lazy: lazyDefault(() => import("./pages/seo/RestoranMusteriMemnuniyeti")) },
      { path: "saglik-itibar-yonetimi", lazy: lazyDefault(() => import("./pages/seo/SaglikItibarYonetimi")) },
      { path: "dis-hekimi-yorum-yonetimi", lazy: lazyDefault(() => import("./pages/seo/DisHekimiYorumYonetimi")) },
      { path: "estetik-klinik-yorum-yonetimi", lazy: lazyDefault(() => import("./pages/seo/EstetikKlinikYorumYonetimi")) },
      { path: "zincir-restoran-yorum-yonetimi", lazy: lazyDefault(() => import("./pages/seo/ZincirRestoranYorumYonetimi")) },
      // ---------- GEO / AI-visibility marketing pages (TR + EN pairs) ----------
      { path: "google-yorum-yonetimi", lazy: lazyDefault(() => import("./pages/seo/GeoLanding")) },
      { path: "google-review-management", lazy: lazyDefault(() => import("./pages/seo/GeoLanding")) },
      { path: "yapay-zeka-yorum-cevaplama", lazy: lazyDefault(() => import("./pages/seo/GeoLanding")) },
      { path: "ai-review-response", lazy: lazyDefault(() => import("./pages/seo/GeoLanding")) },
      { path: "google-isletme-profili-optimizasyonu", lazy: lazyDefault(() => import("./pages/seo/GeoLanding")) },
      { path: "google-business-profile-optimization", lazy: lazyDefault(() => import("./pages/seo/GeoLanding")) },
      { path: "ai-gorunurluk", lazy: lazyDefault(() => import("./pages/seo/GeoLanding")) },
      { path: "ai-search-visibility", lazy: lazyDefault(() => import("./pages/seo/GeoLanding")) },
      { path: "isletme-yorum-yonetimi", lazy: lazyDefault(() => import("./pages/seo/GeoLanding")) },
      { path: "business-review-management", lazy: lazyDefault(() => import("./pages/seo/GeoLanding")) },
      // ---------- English adaptations of the Turkish SEO pages ----------
      { path: "platform/ai-for-google-reviews", lazy: lazyDefault(() => import("./pages/seo/GeoLanding")) },
      { path: "platform/ai-for-instagram-comments", lazy: lazyDefault(() => import("./pages/seo/GeoLanding")) },
      { path: "platform/ai-for-tripadvisor-reviews", lazy: lazyDefault(() => import("./pages/seo/GeoLanding")) },
      { path: "platform/ai-for-booking-com-reviews", lazy: lazyDefault(() => import("./pages/seo/GeoLanding")) },
      { path: "platform/ai-for-tiktok-comments", lazy: lazyDefault(() => import("./pages/seo/GeoLanding")) },
      { path: "platform/ai-review-reply-writer", lazy: lazyDefault(() => import("./pages/seo/GeoLanding")) },
      { path: "platform/ai-for-facebook-reviews", lazy: lazyDefault(() => import("./pages/seo/GeoLanding")) },
      { path: "platform/ai-for-youtube-comments", lazy: lazyDefault(() => import("./pages/seo/GeoLanding")) },
      { path: "platform/ai-for-hotels-com-reviews", lazy: lazyDefault(() => import("./pages/seo/GeoLanding")) },
      { path: "platform/ai-for-trendyol-reviews", lazy: lazyDefault(() => import("./pages/seo/GeoLanding")) },
      { path: "platform/ai-for-yemeksepeti-reviews", lazy: lazyDefault(() => import("./pages/seo/GeoLanding")) },
      { path: "platform/ai-for-airbnb-reviews", lazy: lazyDefault(() => import("./pages/seo/GeoLanding")) },
      { path: "platform/ai-for-zomato-reviews", lazy: lazyDefault(() => import("./pages/seo/GeoLanding")) },
      { path: "online-reputation-management", lazy: lazyDefault(() => import("./pages/seo/GeoLanding")) },
      { path: "review-management-software", lazy: lazyDefault(() => import("./pages/seo/GeoLanding")) },
      { path: "google-review-response-examples", lazy: lazyDefault(() => import("./pages/seo/GeoLanding")) },
      { path: "hotel-review-response-examples", lazy: lazyDefault(() => import("./pages/seo/GeoLanding")) },
      { path: "restaurant-review-response-examples", lazy: lazyDefault(() => import("./pages/seo/GeoLanding")) },
      { path: "multi-location-restaurant-review-management", lazy: lazyDefault(() => import("./pages/seo/GeoLanding")) },
      { path: "healthcare-reputation-management", lazy: lazyDefault(() => import("./pages/seo/GeoLanding")) },
      { path: "dental-practice-review-management", lazy: lazyDefault(() => import("./pages/seo/GeoLanding")) },
      { path: "aesthetic-clinic-review-management", lazy: lazyDefault(() => import("./pages/seo/GeoLanding")) },
      { path: "customer-satisfaction-management", lazy: lazyDefault(() => import("./pages/seo/GeoLanding")) },
      { path: "restaurant-customer-satisfaction", lazy: lazyDefault(() => import("./pages/seo/GeoLanding")) },
      {
        path: "hotel-review-management/:sehir",
        lazy: lazyDefault(() => import("./pages/seo/GeoLanding")),
        getStaticPaths: () => loadCityHotelSlugs().map((s) => `hotel-review-management/${s}`),
      },
      {
        path: "platform/:slug",
        lazy: lazyDefault(() => import("./pages/seo/PlatformLanding")),
        getStaticPaths: () => loadPlatformSlugs().map((s) => `platform/${s}`),
      },
      { path: "automations/instagram-sales", lazy: lazyDefault(() => import("./pages/automations/InstagramSales")) },
      { path: "automations/google-reviews", lazy: lazyDefault(() => import("./pages/automations/GoogleReviews")) },
      { path: "automations/whatsapp", lazy: lazyDefault(() => import("./pages/automations/WhatsAppAutomation")) },
      { path: "automations/other", lazy: lazyDefault(() => import("./pages/automations/OtherAutomations")) },

      // ---------- Protected (not prerendered; render at runtime only) ----------
      { path: "auth/tiktok/callback", lazy: lazyDefault(() => import("./pages/TikTokCallback")) },
      { path: "channels/tiktok", lazy: lazyProtected(() => import("./pages/channels/TikTok")) },
      { path: "tiktok-inbox", lazy: lazyProtectedTiktokLayout(() => import("./pages/TikTokInbox")) },
      { path: "tiktok-review-kit", lazy: lazyProtected(() => import("./pages/TikTokReviewKit")) },
      { path: "tiktok-dm", lazy: lazyProtected(() => import("./pages/TikTokDMInbox")) },
      { path: "share/:businessSlug", lazy: lazyDefault(() => import("./pages/StoryKit")) },
      { path: "story-kit", lazy: lazyProtected(() => import("./pages/StoryKitSettings")) },
      { path: "group", lazy: lazyProtectedLayout(() => import("./pages/GroupOverview")) },
      { path: "locations", lazy: lazyProtectedLayout(() => import("./pages/Locations")) },
      { path: "locations/platform-ratings", lazy: lazyProtectedLayout(() => import("./pages/PlatformRatings")) },
      { path: "locations/platform-ratings/:id", lazy: lazyProtectedLayout(() => import("./pages/PlatformRatingDetail")) },
      { path: "dashboard", lazy: lazyProtectedLayout(() => import("./pages/Dashboard")) },
      { path: "inbox", lazy: lazyProtectedLayout(() => import("./pages/Inbox")) },
      { path: "reviews", lazy: lazyProtectedLayout(() => import("./pages/Reviews")) },
      { path: "reviews/:id", lazy: lazyProtectedLayout(() => import("./pages/ReviewDetailPage")) },
      
      { path: "statistics", lazy: lazyProtectedLayout(() => import("./pages/Statistics")) },
      { path: "report", lazy: lazyProtectedLayout(() => import("./pages/Report")) },
      { path: "chat", lazy: lazyProtectedLayout(() => import("./pages/ChatWithReviewsPage")) },
      { path: "settings", lazy: lazyProtectedLayout(() => import("./pages/Settings")) },
      { path: "email", lazy: lazyProtectedLayout(() => import("./pages/EmailCenter")) },
      { path: "performance", lazy: lazyProtectedLayout(() => import("./pages/GooglePerformance")) },
      { path: "rep-score", lazy: lazyProtectedLayout(() => import("./pages/RepScore")) },
      { path: "google-accounts", lazy: lazyProtectedLayout(() => import("./pages/GoogleAccounts")) },
      { path: "billing", lazy: lazyProtectedLayout(() => import("./pages/billing/Billing")) },
      { path: "billing/checkout", lazy: lazyProtected(() => import("./pages/billing/Checkout")) },
      { path: "billing/success", lazy: lazyDefault(() => import("./pages/billing/Success")) },
      { path: "billing/failed", lazy: lazyDefault(() => import("./pages/billing/Failed")) },
      { path: "admin/apify-logs", lazy: lazyDefault(() => import("./pages/AdminApifyLogs")) },
      { path: "youtube", lazy: lazyProtectedLayout(() => import("./pages/YouTubeInbox")) },
      { path: "social-analytics", lazy: lazyProtectedLayout(() => import("./pages/SocialAnalytics")) },
      { path: "intelligence", lazy: lazyProtectedLayout(() => import("./pages/Intelligence")) },
      { path: "intelligence/karsilastirma", lazy: lazyProtectedLayout(() => import("./pages/IntelligenceComparison")) },
      { path: "intelligence/konu-analizi", Component: () => <Navigate to="/konu-analizi" replace /> },
      { path: "konu-analizi", lazy: lazyProtectedLayout(() => import("./pages/TopicInsights")) },
      { path: "donem-analizi", lazy: lazyProtectedLayout(() => import("./pages/TopicAnalytics")) },
      { path: "ai-visibility", lazy: lazyProtectedLayout(() => import("./pages/AIVisibility")) },

      // ---------- /en/* runtime redirect (no SSG) ----------
      { path: "en/*", Component: EnRedirect },

      // ---------- 404 ----------
      { path: "*", lazy: lazyDefault(() => import("./pages/NotFound")) },
    ],
  },
];

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
