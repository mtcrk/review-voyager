CREATE TABLE IF NOT EXISTS public.platform_ratings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID NOT NULL,
  platform TEXT NOT NULL,
  rating NUMERIC,
  rating_scale INTEGER NOT NULL DEFAULT 10,
  review_count INTEGER,
  source_url TEXT,
  raw JSONB,
  fetched_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (business_id, platform)
);

ALTER TABLE public.platform_ratings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their business platform ratings"
ON public.platform_ratings FOR SELECT
USING (business_id IN (SELECT id FROM public.businesses WHERE user_id = auth.uid()));

CREATE POLICY "Service role can insert platform ratings"
ON public.platform_ratings FOR INSERT
WITH CHECK (true);

CREATE POLICY "Service role can update platform ratings"
ON public.platform_ratings FOR UPDATE
USING (true);

CREATE POLICY "Users can delete their business platform ratings"
ON public.platform_ratings FOR DELETE
USING (business_id IN (SELECT id FROM public.businesses WHERE user_id = auth.uid()));

CREATE INDEX IF NOT EXISTS idx_platform_ratings_business ON public.platform_ratings(business_id);