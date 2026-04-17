CREATE TABLE public.platform_rankings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  platform text NOT NULL,
  rank integer,
  total_in_area integer,
  area_name text,
  source_url text,
  raw jsonb,
  fetched_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (business_id, platform)
);

ALTER TABLE public.platform_rankings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their business rankings"
  ON public.platform_rankings FOR SELECT
  USING (business_id IN (SELECT id FROM public.businesses WHERE user_id = auth.uid()));

CREATE POLICY "Service role can insert rankings"
  ON public.platform_rankings FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Service role can update rankings"
  ON public.platform_rankings FOR UPDATE
  USING (true);

CREATE POLICY "Users can delete their business rankings"
  ON public.platform_rankings FOR DELETE
  USING (business_id IN (SELECT id FROM public.businesses WHERE user_id = auth.uid()));

CREATE INDEX idx_platform_rankings_business ON public.platform_rankings(business_id);