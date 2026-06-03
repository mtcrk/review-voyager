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
  const filePath = resolve("src/lib/blogPosts.ts");
  const content = readFileSync(filePath, "utf-8");

  const posts = [];
  // Extract slug and publishedAt from each blog post object
  const postRegex = /\{\s*slug:\s*"([^"]+)"[\s\S]*?publishedAt:\s*"([^"]+)"[\s\S]*?\},?/g;

  let match;
  while ((match = postRegex.exec(content)) !== null) {
    const slug = match[1];
    const publishedAt = match[2];
    posts.push({
      path: `/blog/${slug}`,
      lastmod: publishedAt,
      changefreq: "monthly",
      priority: "0.8",
    });
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

const sitemapXml = generateSitemap(allEntries);
const outputPath = resolve("public/sitemap.xml");
writeFileSync(outputPath, sitemapXml);

console.log(
  `sitemap.xml written (${allEntries.length} entries, ${blogPosts.length} blog posts, ${cityHotelPages.length} city pages)`
);
