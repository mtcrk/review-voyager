import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";
import { fetchManagedArticles } from "./fetch-managed-articles.mjs";

const BASE_URL = "https://voyagerespond.com";

// Routes that exist in PRERENDER_PUBLIC_PATHS but must stay out of the sitemap
// (functional / auth / redirect-only pages).
const EXCLUDED_PATHS = new Set([
  "/login",
  "/register",
  "/forgot-password",
  "/onboarding",
  "/hub",
  "/pricing",
]);

// Per-path sitemap metadata. Anything missing falls back to DEFAULT_META.
const DEFAULT_META = { changefreq: "monthly", priority: "0.7", lastmod: "2026-08-10" };
const META = {
  "/": { changefreq: "weekly", priority: "1.0", lastmod: "2026-05-14" },
  "/about": { changefreq: "monthly", priority: "0.6", lastmod: "2026-03-10" },
  "/contact": { changefreq: "monthly", priority: "0.6", lastmod: "2026-03-10" },
  "/demo": { changefreq: "weekly", priority: "0.9", lastmod: "2026-05-14" },
  "/blog": { changefreq: "weekly", priority: "0.8", lastmod: "2026-05-14" },
  "/automations/google-reviews": { changefreq: "weekly", priority: "0.8", lastmod: "2026-03-16" },
  "/automations/instagram-sales": { changefreq: "weekly", priority: "0.8", lastmod: "2026-08-10" },
  "/automations/whatsapp": { changefreq: "weekly", priority: "0.8", lastmod: "2026-08-10" },
  "/automations/other": { changefreq: "weekly", priority: "0.7", lastmod: "2026-08-10" },
  "/google-yorum-cevap-ornekleri": { changefreq: "monthly", priority: "0.8", lastmod: "2026-03-19" },
  "/restoran-yorum-cevaplari": { changefreq: "monthly", priority: "0.8", lastmod: "2026-03-19" },
  "/otel-yorum-cevaplari": { changefreq: "monthly", priority: "0.8", lastmod: "2026-03-19" },
  "/yorum-yonetim-araclari": { changefreq: "monthly", priority: "0.9", lastmod: "2026-06-03" },
  "/online-itibar-yonetimi": { changefreq: "monthly", priority: "0.9", lastmod: "2026-06-05" },
  "/musteri-memnuniyeti": { changefreq: "monthly", priority: "0.9", lastmod: "2026-06-05" },
  "/restoran-musteri-memnuniyeti": { changefreq: "monthly", priority: "0.9", lastmod: "2026-06-05" },
  "/saglik-itibar-yonetimi": { changefreq: "monthly", priority: "0.9", lastmod: "2026-06-16" },
  "/dis-hekimi-yorum-yonetimi": { changefreq: "monthly", priority: "0.85", lastmod: "2026-06-16" },
  "/estetik-klinik-yorum-yonetimi": { changefreq: "monthly", priority: "0.85", lastmod: "2026-06-16" },
  "/zincir-restoran-yorum-yonetimi": { changefreq: "monthly", priority: "0.9", lastmod: "2026-06-17" },
  "/isletme-yorum-yonetimi": { changefreq: "monthly", priority: "0.9", lastmod: "2026-08-26" },
  "/business-review-management": { changefreq: "monthly", priority: "0.9", lastmod: "2026-08-26" },
  "/google-yorum-yonetimi": { changefreq: "monthly", priority: "0.9", lastmod: "2026-08-26" },
  "/online-reputation-management": { changefreq: "monthly", priority: "0.85", lastmod: "2026-08-26" },
  "/review-management-software": { changefreq: "monthly", priority: "0.85", lastmod: "2026-08-26" },
  "/google-review-response-examples": { changefreq: "monthly", priority: "0.85", lastmod: "2026-08-26" },
  "/hotel-review-response-examples": { changefreq: "monthly", priority: "0.85", lastmod: "2026-08-26" },
  "/restaurant-review-response-examples": { changefreq: "monthly", priority: "0.85", lastmod: "2026-08-26" },
  "/multi-location-restaurant-review-management": { changefreq: "monthly", priority: "0.85", lastmod: "2026-08-26" },
  "/google-review-management": { changefreq: "monthly", priority: "0.85", lastmod: "2026-08-26" },
  "/yapay-zeka-yorum-cevaplama": { changefreq: "monthly", priority: "0.9", lastmod: "2026-08-26" },
  "/ai-review-response": { changefreq: "monthly", priority: "0.85", lastmod: "2026-08-26" },
  "/google-isletme-profili-optimizasyonu": { changefreq: "monthly", priority: "0.9", lastmod: "2026-08-26" },
  "/google-business-profile-optimization": { changefreq: "monthly", priority: "0.85", lastmod: "2026-08-26" },
  "/ai-gorunurluk": { changefreq: "monthly", priority: "0.9", lastmod: "2026-08-26" },
  "/ai-search-visibility": { changefreq: "monthly", priority: "0.85", lastmod: "2026-08-26" },
  "/privacy-policy": { changefreq: "yearly", priority: "0.3", lastmod: "2026-01-01" },
  "/terms-of-service": { changefreq: "yearly", priority: "0.3", lastmod: "2026-01-01" },
  "/mesafeli-satis-sozlesmesi": { changefreq: "yearly", priority: "0.3", lastmod: "2026-08-05" },
  "/on-bilgilendirme-formu": { changefreq: "yearly", priority: "0.3", lastmod: "2026-08-05" },
  "/iptal-iade-kosullari": { changefreq: "yearly", priority: "0.3", lastmod: "2026-08-05" },
};

// Platform landing pages are expanded from route params, so they are not part
// of PRERENDER_PUBLIC_PATHS and stay listed here.
const platformRoutes = [
  { path: "/platform/yorumlara-yapay-zeka-ile-cevap-yazma", changefreq: "weekly", priority: "0.9", lastmod: "2026-05-22" },
  { path: "/platform/google-yorumlari-icin-yapay-zeka", changefreq: "weekly", priority: "0.9", lastmod: "2026-05-22" },
  { path: "/platform/instagram-yorumlari-icin-yapay-zeka", changefreq: "weekly", priority: "0.9", lastmod: "2026-05-22" },
  { path: "/platform/tiktok-yorumlari-icin-yapay-zeka", changefreq: "weekly", priority: "0.9", lastmod: "2026-05-22" },
  { path: "/platform/booking-yorumlari-icin-yapay-zeka", changefreq: "weekly", priority: "0.9", lastmod: "2026-05-22" },
  { path: "/platform/tripadvisor-yorumlari-icin-yapay-zeka", changefreq: "weekly", priority: "0.9", lastmod: "2026-05-22" },
  { path: "/platform/facebook-yorumlari-icin-yapay-zeka", changefreq: "weekly", priority: "0.9", lastmod: "2026-05-22" },
  { path: "/platform/youtube-yorumlari-icin-yapay-zeka", changefreq: "weekly", priority: "0.9", lastmod: "2026-05-22" },
  { path: "/platform/hotels-com-yorumlari-icin-yapay-zeka", changefreq: "weekly", priority: "0.9", lastmod: "2026-05-22" },
  { path: "/platform/trendyol-yorumlari-icin-yapay-zeka", changefreq: "weekly", priority: "0.9", lastmod: "2026-05-22" },
  { path: "/platform/yemeksepeti-yorumlari-icin-yapay-zeka", changefreq: "weekly", priority: "0.9", lastmod: "2026-05-22" },
  { path: "/platform/airbnb-yorumlari-icin-yapay-zeka", changefreq: "weekly", priority: "0.9", lastmod: "2026-05-22" },
  { path: "/platform/zomato-yorumlari-icin-yapay-zeka", changefreq: "weekly", priority: "0.9", lastmod: "2026-05-22" },
];

// Derive the static route list from src/prerenderPaths.ts so new public routes land in the
// sitemap automatically.
function extractPrerenderPaths() {
  const content = readFileSync(resolve("src/prerenderPaths.ts"), "utf-8");
  const block = content.match(/PRERENDER_PUBLIC_PATHS\s*=\s*\[([\s\S]*?)\]/);
  if (!block) throw new Error("PRERENDER_PUBLIC_PATHS not found in src/prerenderPaths.ts");
  const paths = [...block[1].matchAll(/"([^"]+)"/g)].map((m) => m[1]);
  return paths
    .filter((p) => !EXCLUDED_PATHS.has(p))
    .map((p) => ({ path: p, ...(META[p] || DEFAULT_META) }));
}

const staticRoutes = [...extractPrerenderPaths(), ...platformRoutes];

function extractCityHotelPages() {
  const filePath = resolve("src/lib/cityHotelData.ts");
  const content = readFileSync(filePath, "utf-8");
  const slugs = [];
  const slugRegex = /slug:\s*"([^"]+)"/g;
  let match;
  while ((match = slugRegex.exec(content)) !== null) {
    slugs.push({
      path: `/otel-yorum-yonetimi/${match[1]}`,
      changefreq: "monthly",
      priority: "0.85",
      lastmod: "2026-06-03",
    });
  }
  return slugs;
}

function extractBlogPosts() {
  const files = [
    "src/lib/blogPosts.ts",
    "src/lib/blogClusterRestoran.ts",
    "src/lib/blogClusterMemnuniyet.ts",
    "src/lib/blogClusterSaglik.ts",
    "src/lib/blogClusterRestoranZinciri.ts",
  ];
  const posts = [];
  const seen = new Set();
  const postRegex = /\{\s*slug:\s*"([^"]+)"[\s\S]*?publishedAt:\s*"([^"]+)"[\s\S]*?\},?/g;
  for (const f of files) {
    let content;
    try { content = readFileSync(resolve(f), "utf-8"); } catch { continue; }
    let match;
    while ((match = postRegex.exec(content)) !== null) {
      const slug = match[1];
      if (seen.has(slug)) continue;
      seen.add(slug);
      posts.push({
        path: `/blog/${slug}`,
        lastmod: match[2],
        changefreq: "monthly",
        priority: "0.8",
      });
    }
  }
  return posts;
}

function generateSitemap(entries) {
  const urls = entries.map((e) =>
    [
      `  <url>`,
      `    <loc>${BASE_URL}${e.path}</loc>`,
      e.lastmod ? `    <lastmod>${e.lastmod}</lastmod>` : null,
      e.changefreq ? `    <changefreq>${e.changefreq}</changefreq>` : null,
      e.priority ? `    <priority>${e.priority}</priority>` : null,
      `  </url>`,
    ]
      .filter(Boolean)
      .join("\n")
  );

  return [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
    ...urls,
    `</urlset>`,
    "",
  ].join("\n");
}

const blogPosts = extractBlogPosts();
const cityHotelPages = extractCityHotelPages();
const managedArticles = (await fetchManagedArticles()).map((a) => ({
  path: `/blog/${a.slug}`,
  lastmod: a.lastmod || undefined,
  changefreq: "monthly",
  priority: "0.8",
}));
const allEntries = [...staticRoutes, ...blogPosts, ...cityHotelPages, ...managedArticles];

// Sort by path for consistent output
allEntries.sort((a, b) => a.path.localeCompare(b.path));

// Site-wide canonical form: trailing slash. Mirrors canonicalPath() in
// src/prerenderPaths.ts (single source of truth for the URL rule).
const normalizePath = (p) => {
  const collapsed = `/${p}`.replace(/\/{2,}/g, "/");
  if (collapsed === "/") return "/";
  return collapsed.endsWith("/") ? collapsed : `${collapsed}/`;
};

const seenPaths = new Set();
const canonicalEntries = [];
for (const e of allEntries) {
  const path = normalizePath(e.path);
  if (seenPaths.has(path)) continue;
  seenPaths.add(path);
  canonicalEntries.push({ ...e, path });
}

const sitemapXml = generateSitemap(canonicalEntries);
writeFileSync(resolve("public/sitemap.xml"), sitemapXml);
// Base copy consumed by the generated (server side) sitemap, which appends
// imported articles stored in the database.
writeFileSync(resolve("public/sitemap-base.xml"), sitemapXml);

console.log(
  `sitemap.xml written (${canonicalEntries.length} entries, ${blogPosts.length} blog posts, ${cityHotelPages.length} city pages)`
);
