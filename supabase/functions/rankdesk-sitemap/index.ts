// Server generated sitemap: keeps every URL of the built static sitemap and
// appends one entry per owned imported article.
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { SITE_URL, serviceClient } from "../_shared/content-sync.ts";

const headers = { ...corsHeaders, "Content-Type": "application/xml; charset=utf-8", "Cache-Control": "public, max-age=60" };

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  let base = "";
  try {
    const res = await fetch(`${SITE_URL}/sitemap-base.xml`, { cache: "no-store" });
    if (res.ok) base = await res.text();
  } catch (e) {
    console.error("base sitemap fetch failed:", (e as Error).message);
  }

  let extra = "";
  try {
    const db = serviceClient();
    const { data } = await db
      .from("site_content")
      .select("slug, published_at, content_updated_at")
      .eq("kind", "blog")
      .order("published_at", { ascending: false });
    for (const row of data ?? []) {
      const lastmod = String(row.content_updated_at ?? row.published_at ?? "").slice(0, 10);
      extra +=
        `  <url>\n    <loc>${SITE_URL}/blog/${row.slug}/</loc>\n` +
        (lastmod ? `    <lastmod>${lastmod}</lastmod>\n` : "") +
        `    <changefreq>weekly</changefreq>\n    <priority>0.8</priority>\n  </url>\n`;
    }
  } catch (e) {
    console.error("owned article list failed:", (e as Error).message);
  }

  if (base.includes("</urlset>")) {
    return new Response(base.replace("</urlset>", `${extra}</urlset>`), { headers });
  }

  const fallback =
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    `  <url>\n    <loc>${SITE_URL}/</loc>\n  </url>\n${extra}</urlset>\n`;
  return new Response(fallback, { headers });
});
