CREATE TABLE IF NOT EXISTS public.site_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL,
  kind text NOT NULL DEFAULT 'blog',
  source text NOT NULL DEFAULT 'rankdesk',
  title text NOT NULL,
  excerpt text,
  content text,
  html text,
  meta_title text,
  meta_description text,
  youtube_url text,
  image_url text,
  image_path text,
  image_alt text,
  image_width integer,
  image_height integer,
  primary_keyword text,
  word_count integer,
  published_at timestamptz,
  content_updated_at timestamptz,
  toc jsonb NOT NULL DEFAULT '[]'::jsonb,
  json_ld jsonb NOT NULL DEFAULT '[]'::jsonb,
  synced_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (slug, kind)
);

GRANT SELECT ON public.site_content TO anon;
GRANT SELECT ON public.site_content TO authenticated;
GRANT ALL ON public.site_content TO service_role;

ALTER TABLE public.site_content ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Site content is publicly readable"
ON public.site_content FOR SELECT
USING (true);

CREATE TRIGGER site_content_set_updated_at
BEFORE UPDATE ON public.site_content
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX IF NOT EXISTS site_content_kind_published_idx
ON public.site_content (kind, published_at DESC);