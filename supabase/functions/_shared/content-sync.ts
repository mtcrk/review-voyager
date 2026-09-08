// Server-only content ingestion helpers.
// Fetches items from the upstream content API, adopts every image into this
// project's own object storage and upserts the owned copy into public.site_content.
import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const API_BASE = "https://app.rankdesk.ai/api/public/v1";
const BUCKET = "content-images";
export const SITE_URL = "https://voyagerespond.com";
/** Public path pattern this site serves adopted images from. */
export const IMAGE_PATH_PREFIX = "/images/content";

export type SourceTocItem = { level: number; text: string; id: string };

export type SourcePost = {
  slug: string;
  kind: "blog" | "page";
  title: string;
  excerpt: string | null;
  content: string;
  html: string;
  youtube_url: string | null;
  meta_title: string | null;
  meta_description: string | null;
  image_url: string | null;
  image_alt: string | null;
  image_width: number | null;
  image_height: number | null;
  image_local_path: string | null;
  primary_keyword: string | null;
  word_count: number | null;
  published_at: string | null;
  updated_at: string | null;
  toc: SourceTocItem[];
  json_ld: Record<string, unknown>[];
};

type ListResponse = { posts: SourcePost[] };
type PostResponse = { post: SourcePost };

export function apiKey(): string {
  const key = Deno.env.get("RANKDESK_API_KEY");
  if (!key) throw new Error("Content API key is not configured");
  return key;
}

async function apiGet<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "x-api-key": apiKey(), accept: "application/json" },
    cache: "no-store",
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Content API ${res.status}: ${body.slice(0, 300)}`);
  }
  return (await res.json()) as T;
}

export async function listSourcePosts(limit = 50, offset = 0): Promise<SourcePost[]> {
  const data = await apiGet<ListResponse>(`/posts?kind=blog&limit=${limit}&offset=${offset}`);
  return Array.isArray(data.posts) ? data.posts : [];
}

export async function getSourcePost(slug: string): Promise<SourcePost> {
  const data = await apiGet<PostResponse>(`/posts/${encodeURIComponent(slug)}`);
  return data.post;
}

export function serviceClient(): SupabaseClient {
  return createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } },
  );
}

function fileNameFrom(url: string, fallback: string): string {
  try {
    const clean = url.split("?")[0].split("#")[0];
    const name = clean.substring(clean.lastIndexOf("/") + 1);
    return name && /\.[a-z0-9]{2,5}$/i.test(name) ? name : fallback;
  } catch {
    return fallback;
  }
}

/** Absolute image URLs found inside <img src="..."> and markdown ![alt](url). */
function collectImageUrls(html: string, markdown: string): string[] {
  const found = new Set<string>();
  const imgTag = /<img\b[^>]*?\bsrc\s*=\s*["']([^"']+)["'][^>]*>/gi;
  let m: RegExpExecArray | null;
  while ((m = imgTag.exec(html)) !== null) found.add(m[1]);
  const mdImg = /!\[[^\]]*\]\(([^)\s]+)/g;
  while ((m = mdImg.exec(markdown)) !== null) found.add(m[1]);
  return [...found].filter((u) => /^https?:\/\//i.test(u));
}

/** Uploads one remote image into owned storage and returns its site-served path. */
async function adoptImage(
  db: SupabaseClient,
  slug: string,
  url: string,
  preferredPath: string | null,
): Promise<string> {
  const name = preferredPath
    ? preferredPath.substring(preferredPath.lastIndexOf("/") + 1)
    : fileNameFrom(url, "image.jpg");
  const objectKey = `${slug}/${name}`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`image fetch ${res.status} for ${url}`);
  const contentType = res.headers.get("content-type") ?? "image/jpeg";
  if (!contentType.startsWith("image/")) throw new Error(`not an image: ${contentType}`);
  const bytes = new Uint8Array(await res.arrayBuffer());
  if (bytes.byteLength === 0) throw new Error("empty image body");
  const { error } = await db.storage.from(BUCKET).upload(objectKey, bytes, {
    contentType,
    upsert: true,
  });
  if (error) throw new Error(`storage upload failed: ${error.message}`);
  return `${IMAGE_PATH_PREFIX}/${objectKey}`;
}

function replaceAll(haystack: string, needle: string, replacement: string): string {
  return haystack.split(needle).join(replacement);
}

export type SyncedRow = { slug: string; updated_at: string | null };

/**
 * Adopts every image of one item into owned storage, rewrites all references and
 * upserts the complete owned row. Always overwrites, never compares hashes.
 */
export async function syncOne(db: SupabaseClient, post: SourcePost): Promise<SyncedRow> {
  let html = post.html ?? "";
  let markdown = post.content ?? "";
  let jsonLd = JSON.stringify(post.json_ld ?? []);
  let featuredPath: string | null = null;

  // Featured image
  if (post.image_url) {
    try {
      featuredPath = await adoptImage(db, post.slug, post.image_url, post.image_local_path);
      html = replaceAll(html, post.image_url, featuredPath);
      markdown = replaceAll(markdown, post.image_url, featuredPath);
      jsonLd = replaceAll(jsonLd, post.image_url, featuredPath);
      if (post.image_local_path && post.image_local_path !== featuredPath) {
        html = replaceAll(html, post.image_local_path, featuredPath);
        markdown = replaceAll(markdown, post.image_local_path, featuredPath);
        jsonLd = replaceAll(jsonLd, post.image_local_path, featuredPath);
      }
    } catch (e) {
      console.error(`featured image skipped for ${post.slug}:`, (e as Error).message);
    }
  }

  // Body images (iframes are never touched)
  for (const url of collectImageUrls(html, markdown)) {
    try {
      const localPath = await adoptImage(db, post.slug, url, null);
      html = replaceAll(html, url, localPath);
      markdown = replaceAll(markdown, url, localPath);
      jsonLd = replaceAll(jsonLd, url, localPath);
    } catch (e) {
      console.error(`body image skipped for ${post.slug} (${url}):`, (e as Error).message);
    }
  }

  const row = {
    slug: post.slug,
    kind: post.kind ?? "blog",
    source: "external-content",
    title: post.title,
    excerpt: post.excerpt,
    content: markdown,
    html,
    meta_title: post.meta_title,
    meta_description: post.meta_description,
    youtube_url: post.youtube_url,
    image_url: post.image_url,
    image_path: featuredPath,
    image_alt: post.image_alt,
    image_width: post.image_width,
    image_height: post.image_height,
    primary_keyword: post.primary_keyword,
    word_count: post.word_count,
    published_at: post.published_at,
    content_updated_at: post.updated_at,
    toc: post.toc ?? [],
    json_ld: JSON.parse(jsonLd) as Record<string, unknown>[],
    synced_at: new Date().toISOString(),
  };

  const { error: upsertError } = await db
    .from("site_content")
    .upsert(row, { onConflict: "slug,kind" });
  if (upsertError) throw new Error(`database upsert failed: ${upsertError.message}`);

  const { data, error: readError } = await db
    .from("site_content")
    .select("slug, content_updated_at")
    .eq("slug", post.slug)
    .eq("kind", row.kind)
    .maybeSingle();
  if (readError || !data) throw new Error(`read-back failed for ${post.slug}`);

  return { slug: data.slug as string, updated_at: (data.content_updated_at as string | null) ?? null };
}
