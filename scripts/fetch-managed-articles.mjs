// Reads imported (Rankdesk) articles from the database at build time so that
// sitemap.xml and llms.txt include them. Fails soft: on any error we return an
// empty list and the build continues with the static pages only.
import { readFileSync } from "fs";
import { resolve } from "path";

function env(name) {
  if (process.env[name]) return process.env[name];
  try {
    const raw = readFileSync(resolve(".env"), "utf-8");
    const line = raw.split("\n").find((l) => l.startsWith(`${name}=`));
    return line ? line.slice(name.length + 1).trim().replace(/^"|"$/g, "") : "";
  } catch {
    return "";
  }
}

export async function fetchManagedArticles() {
  const url = env("VITE_SUPABASE_URL");
  const key = env("VITE_SUPABASE_PUBLISHABLE_KEY");
  if (!url || !key) return [];
  try {
    const res = await fetch(
      `${url}/rest/v1/site_content?select=slug,title,meta_description,excerpt,content_updated_at,updated_at&order=updated_at.desc&limit=1000`,
      { headers: { apikey: key, Authorization: `Bearer ${key}` } }
    );
    if (!res.ok) return [];
    const rows = await res.json();
    if (!Array.isArray(rows)) return [];
    return rows
      .filter((r) => r && typeof r.slug === "string" && r.slug.length > 0)
      .map((r) => ({
        slug: r.slug,
        title: typeof r.title === "string" ? r.title : r.slug,
        description: typeof r.description === "string" ? r.description : "",
        lastmod: (r.updated_at || "").slice(0, 10),
      }));
  } catch {
    return [];
  }
}
