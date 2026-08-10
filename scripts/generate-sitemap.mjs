import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";

const BASE_URL = "https://voyagerespond.com";

const staticRoutes = [
  { path: "/", changefreq: "weekly", priority: "1.0", lastmod: "2026-05-14" },
  { path: "/pricing", changefreq: "monthly", priority: "0.8", lastmod: "2026-03-10" },
  { path: "/about", changefreq: "monthly", priority: "0.6", lastmod: "2026-03-10" },
  { path: "/contact", changefreq: "monthly", priority: "0.6", lastmod: "2026-03-10" },
  { path: "/demo", changefreq: "weekly", priority: "0.9", lastmod: "2026-05-14" },
  { path: "/hub", changefreq: "weekly", priority: "0.7", lastmod: "2026-03-16" },
  { path: "/automations/google-reviews", changefreq: "weekly", priority: "0.8", lastmod: "2026-03-16" },
  { path: "/blog", changefreq: "weekly", priority: "0.8", lastmod: "2026-05-14" },
  { path: "/google-yorum-cevap-ornekleri", changefreq: "monthly", priority: "0.8", lastmod: "2026-03-19" },
  { path: "/restoran-yorum-cevaplari", changefreq: "monthly", priority: "0.8", lastmod: "2026-03-19" },
  { path: "/otel-yorum-cevaplari", changefreq: "monthly", priority: "0.8", lastmod: "2026-03-19" },
  { path: "/yorum-yonetim-araclari", changefreq: "monthly", priority: "0.9", lastmod: "2026-06-03" },
  { path: "/online-itibar-yonetimi", changefreq: "monthly", priority: "0.9", lastmod: "2026-06-05" },
  { path: "/musteri-memnuniyeti", changefreq: "monthly", priority: "0.9", lastmod: "2026-06-05" },
  { path: "/restoran-musteri-memnuniyeti", changefreq: "monthly", priority: "0.9", lastmod: "2026-06-05" },
  { path: "/saglik-itibar-yonetimi", changefreq: "monthly", priority: "0.9", lastmod: "2026-06-16" },
  { path: "/dis-hekimi-yorum-yonetimi", changefreq: "monthly", priority: "0.85", lastmod: "2026-06-16" },
  { path: "/estetik-klinik-yorum-yonetimi", changefreq: "monthly", priority: "0.85", lastmod: "2026-06-16" },
  { path: "/zincir-restoran-yorum-yonetimi", changefreq: "monthly", priority: "0.9", lastmod: "2026-06-17" },
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
  { path: "/privacy-policy", changefreq: "yearly", priority: "0.3", lastmod: "2026-01-01" },
  { path: "/terms-of-service", changefreq: "yearly", priority: "0.3", lastmod: "2026-01-01" },
  { path: "/login", changefreq: "yearly", priority: "0.2", lastmod: "2026-01-01" },
  { path: "/register", changefreq: "yearly", priority: "0.2", lastmod: "2026-01-01" },
  { path: "/forgot-password", changefreq: "yearly", priority: "0.2", lastmod: "2026-01-01" },
  { path: "/onboarding", changefreq: "monthly", priority: "0.6", lastmod: "2026-05-14" },
];

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
const allEntries = [...staticRoutes, ...blogPosts, ...cityHotelPages];

// Sort by path for consistent output
allEntries.sort((a, b) => a.path.localeCompare(b.path));

// Site-wide canonical form: trailing slash. Deduplicate after normalizing.
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
const outputPath = resolve("public/sitemap.xml");
writeFileSync(outputPath, sitemapXml);

// ---- public/_redirects (Cloudflare Pages) --------------------------------
// 301 every slash-less URL to its trailing-slash canonical. Rules are exact
// (no splats), so static files (.xml/.txt/.js/.css/.png/.svg/.ico/.json) and
// /auth/*, /~oauth/* are never matched and can't loop.
const redirectLines = canonicalEntries
  .filter((e) => e.path !== "/")
  .map((e) => `${e.path.replace(/\/$/, "")}  ${e.path}  301`);

const redirectsFile = [
  "# Generated by scripts/generate-sitemap.mjs — do not edit by hand.",
  "# Trailing-slash canonicalization (301) + SPA fallback.",
  ...redirectLines,
  "",
  "/*  /index.html  200",
  "",
].join("\n");
writeFileSync(resolve("public/_redirects"), redirectsFile);

console.log(
  `sitemap.xml written (${canonicalEntries.length} entries, ${blogPosts.length} blog posts, ${cityHotelPages.length} city pages); _redirects written (${redirectLines.length} rules)`
);
