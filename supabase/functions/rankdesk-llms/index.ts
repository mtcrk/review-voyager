// Server generated /llms.txt: keeps the built static file exactly as it is and
// appends the 50 most recent owned imported articles.
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { SITE_URL, serviceClient } from "../_shared/content-sync.ts";

const headers = {
  ...corsHeaders,
  "Content-Type": "text/plain; charset=utf-8",
  "Cache-Control": "public, max-age=60",
};

function shorten(s: string, max = 140): string {
  const clean = s.replace(/\s+/g, " ").trim();
  return clean.length <= max ? clean : `${clean.slice(0, max - 1).trimEnd()}…`;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  let base = "";
  try {
    const res = await fetch(`${SITE_URL}/llms-base.txt`, { cache: "no-store" });
    if (res.ok) base = await res.text();
  } catch (e) {
    console.error("base llms fetch failed:", (e as Error).message);
  }

  let lines: string[] = [];
  try {
    const db = serviceClient();
    const { data } = await db
      .from("site_content")
      .select("slug, title, excerpt, meta_description, published_at")
      .eq("kind", "blog")
      .order("published_at", { ascending: false })
      .limit(50);
    lines = (data ?? []).map((row) => {
      const desc = shorten(String(row.excerpt ?? row.meta_description ?? ""));
      return `- [${row.title}](/blog/${row.slug}/): ${desc}`;
    });
  } catch (e) {
    console.error("owned article list failed:", (e as Error).message);
  }

  if (!lines.length) {
    return new Response(base || `# VoyageRespond\n`, { headers });
  }

  // Append under the existing "## Blog" section when present, otherwise add a section.
  if (base.includes("\n## Blog\n")) {
    const parts = base.split("\n## Blog\n");
    const rest = parts[1];
    const nextSection = rest.indexOf("\n## ");
    const blogBody = nextSection === -1 ? rest : rest.slice(0, nextSection);
    const tail = nextSection === -1 ? "" : rest.slice(nextSection);
    const merged = `${parts[0]}\n## Blog\n${blogBody.replace(/\s*$/, "\n")}${lines.join("\n")}\n${tail}`;
    return new Response(merged, { headers });
  }

  return new Response(`${base.replace(/\s*$/, "\n")}\n## Blog\n\n${lines.join("\n")}\n`, { headers });
});
