ALTER TABLE public.reviews
  ADD COLUMN IF NOT EXISTS reviewer_country text,
  ADD COLUMN IF NOT EXISTS reviewer_country_raw text,
  ADD COLUMN IF NOT EXISTS reviewer_country_source text;

ALTER TABLE public.ci_competitor_reviews
  ADD COLUMN IF NOT EXISTS reviewer_country text,
  ADD COLUMN IF NOT EXISTS reviewer_country_raw text,
  ADD COLUMN IF NOT EXISTS reviewer_country_source text;

CREATE INDEX IF NOT EXISTS idx_reviews_business_country
  ON public.reviews (business_id, reviewer_country)
  WHERE reviewer_country IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_ci_competitor_reviews_competitor_country
  ON public.ci_competitor_reviews (competitor_id, reviewer_country)
  WHERE reviewer_country IS NOT NULL;