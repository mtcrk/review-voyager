import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// Public routes prerendered by vite-react-ssg.
// Kept in sync with src/routes.tsx PRERENDER_PUBLIC_PATHS but duplicated here
// because vite.config runs in Node and we don't want to import the React tree.
const PUBLIC_PATHS = [
  "/",
  "/login",
  "/register",
  "/forgot-password",
  "/privacy-policy",
  "/terms-of-service",
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

// Protected app routes prerendered as a loading shell (see PRERENDER_APP_SHELL_PATHS
// in src/routes.tsx). Without these files, direct URL entry / F5 falls back to the
// prerendered landing HTML and hydration mismatches (React #418/#423) occur.
const APP_SHELL_PATHS = [
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
  "/ai-visibility",
  "/story-kit",
  "/channels/tiktok",
  "/tiktok-inbox",
  "/tiktok-review-kit",
  "/tiktok-dm",
];

// https://vitejs.dev/config/
// `ssgOptions` is consumed by vite-react-ssg and isn't part of Vite's UserConfig,
// so we cast through `any` to keep TS happy without losing the rest of the config.
export default defineConfig(({ mode, isSsrBuild, command }) => {
  // vite-react-ssg's SSR pass sets neither `isSsrBuild` reliably nor a custom flag,
  // but it does pass `--ssr` to vite. Detect either signal.
  const isSsr =
    isSsrBuild === true ||
    process.argv.includes("--ssr") ||
    process.argv.some((a) => a.startsWith("--ssr"));
  return (({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  ssr: {
    // react-helmet-async holds Helmet state in a module-scoped React Context.
    // If both vite-react-ssg's runtime (from node_modules) AND our SSR bundle
    // each load their own copy, the provider and consumer end up on different
    // Context instances and helmetInstances becomes undefined. Externalizing
    // forces a single shared module instance.
    external: ["react-helmet-async"],
  },
  ssgOptions: {
    script: "async",
    formatting: "none",
    dirStyle: "nested",
    mock: true,
    concurrency: 8,
    // Dynamic routes (`/blog/:slug`, `/platform/:slug`, `/otel-yorum-yonetimi/:sehir`)
    // contribute their getStaticPaths() output to `paths`. We keep ALL dynamic-route
    // paths and ONLY the public static paths from `PUBLIC_PATHS`.
    includedRoutes(paths: string[]) {
      // eslint-disable-next-line no-console
      console.log("[ssg] includedRoutes input:", paths);
      const norm = (p: string) => (p.startsWith("/") ? p : `/${p}`);
      const allowed = [...PUBLIC_PATHS, ...APP_SHELL_PATHS];
      const publicSet = new Set(allowed);
      const result = new Set<string>(allowed);
      for (const raw of paths) {
        const p = norm(raw);
        if (
          p.startsWith("/blog/") ||
          p.startsWith("/platform/") ||
          p.startsWith("/otel-yorum-yonetimi/")
        ) {
          result.add(p);
        }
        if (publicSet.has(p)) result.add(p);
      }
      return [...result];
    },
  },
  build: {
    minify: "esbuild",
    cssMinify: true,
    sourcemap: false,
    chunkSizeWarningLimit: 800,
    rollupOptions: isSsr
      ? {}
      : {
          output: {
            manualChunks: {
              "react-vendor": ["react", "react-dom", "react-router-dom"],
              "ui-vendor": [
                "@radix-ui/react-dialog",
                "@radix-ui/react-dropdown-menu",
                "@radix-ui/react-popover",
                "@radix-ui/react-tabs",
                "@radix-ui/react-tooltip",
                "@radix-ui/react-select",
                "@radix-ui/react-accordion",
              ],
              "chart-vendor": ["recharts"],
              "supabase-vendor": ["@supabase/supabase-js"],
              "query-vendor": ["@tanstack/react-query"],
              "i18n-vendor": ["i18next", "react-i18next"],
            },
          },
        },
  },
}) as any);
});
