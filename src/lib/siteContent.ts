// Reads the site's own owned copy of imported articles (public.site_content).
// Public pages never talk to any external content API — the database row is the
// authoritative render source.
import { supabase } from "@/integrations/supabase/client";

export type ArticleTocItem = { level: number; text: string; id: string };

export type ManagedArticle = {
  slug: string;
  kind: string;
  title: string;
  excerpt: string | null;
  content: string | null;
  html: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  youtubeUrl: string | null;
  imagePath: string | null;
  imageUrl: string | null;
  imageAlt: string | null;
  imageWidth: number | null;
  imageHeight: number | null;
  primaryKeyword: string | null;
  wordCount: number | null;
  publishedAt: string | null;
  updatedAt: string | null;
  toc: ArticleTocItem[];
  jsonLd: Record<string, unknown>[];
};

type Row = {
  slug: string;
  kind: string;
  title: string;
  excerpt: string | null;
  content: string | null;
  html: string | null;
  meta_title: string | null;
  meta_description: string | null;
  youtube_url: string | null;
  image_path: string | null;
  image_url: string | null;
  image_alt: string | null;
  image_width: number | null;
  image_height: number | null;
  primary_keyword: string | null;
  word_count: number | null;
  published_at: string | null;
  content_updated_at: string | null;
  toc: unknown;
  json_ld: unknown;
};

const COLUMNS =
  "slug, kind, title, excerpt, content, html, meta_title, meta_description, youtube_url, image_path, image_url, image_alt, image_width, image_height, primary_keyword, word_count, published_at, content_updated_at, toc, json_ld";

function toArticle(row: Row): ManagedArticle {
  const toc = Array.isArray(row.toc) ? (row.toc as ArticleTocItem[]) : [];
  const jsonLd = Array.isArray(row.json_ld) ? (row.json_ld as Record<string, unknown>[]) : [];
  return {
    slug: row.slug,
    kind: row.kind,
    title: row.title,
    excerpt: row.excerpt,
    content: row.content,
    html: row.html,
    metaTitle: row.meta_title,
    metaDescription: row.meta_description,
    youtubeUrl: row.youtube_url,
    imagePath: row.image_path,
    imageUrl: row.image_url,
    imageAlt: row.image_alt,
    imageWidth: row.image_width,
    imageHeight: row.image_height,
    primaryKeyword: row.primary_keyword,
    wordCount: row.word_count,
    publishedAt: row.published_at,
    updatedAt: row.content_updated_at,
    toc,
    jsonLd,
  };
}

/** All owned imported blog articles, newest first. Never throws. */
export async function listManagedArticles(): Promise<ManagedArticle[]> {
  try {
    const { data, error } = await supabase
      .from("site_content")
      .select(COLUMNS)
      .eq("kind", "blog")
      .order("published_at", { ascending: false });
    if (error) throw error;
    return (data as Row[] | null)?.map(toArticle) ?? [];
  } catch (e) {
    console.error("managed article list failed", e);
    return [];
  }
}

/** One owned imported article, or null when this slug is not managed here. */
export async function getManagedArticle(slug: string): Promise<ManagedArticle | null> {
  try {
    const { data, error } = await supabase
      .from("site_content")
      .select(COLUMNS)
      .eq("slug", slug)
      .eq("kind", "blog")
      .maybeSingle();
    if (error) throw error;
    return data ? toArticle(data as Row) : null;
  } catch (e) {
    console.error("managed article fetch failed", e);
    return null;
  }
}

/** Featured image source: owned storage path first, absolute source URL as fallback. */
export function articleImageSrc(a: ManagedArticle): string | null {
  return a.imagePath ?? a.imageUrl ?? null;
}

/** Reading time label in the same style the existing blog uses. */
export function readTimeLabel(a: ManagedArticle): string {
  const words = a.wordCount ?? 0;
  const minutes = Math.max(1, Math.round(words / 200));
  return `${minutes} dk`;
}
