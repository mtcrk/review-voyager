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
  { path: "/privacy-policy", changefreq: "yearly", priority: "0.3", lastmod: "2026-01-01" },
  { path: "/terms-of-service", changefreq: "yearly", priority: "0.3", lastmod: "2026-01-01" },
  { path: "/login", changefreq: "yearly", priority: "0.2", lastmod: "2026-01-01" },
  { path: "/register", changefreq: "yearly", priority: "0.2", lastmod: "2026-01-01" },
  { path: "/forgot-password", changefreq: "yearly", priority: "0.2", lastmod: "2026-01-01" },
  { path: "/onboarding", changefreq: "monthly", priority: "0.6", lastmod: "2026-05-14" },
];

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
const allEntries = [...staticRoutes, ...blogPosts];

// Sort by path for consistent output
allEntries.sort((a, b) => a.path.localeCompare(b.path));

const sitemapXml = generateSitemap(allEntries);
const outputPath = resolve("public/sitemap.xml");
writeFileSync(outputPath, sitemapXml);

console.log(`sitemap.xml written (${allEntries.length} entries, ${blogPosts.length} blog posts)`);
