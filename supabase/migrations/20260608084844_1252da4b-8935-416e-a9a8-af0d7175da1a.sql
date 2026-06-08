ALTER TABLE public.ci_competitor_reviews
  ADD COLUMN IF NOT EXISTS owner_reply_text text,
  ADD COLUMN IF NOT EXISTS owner_reply_at timestamptz;

ALTER TABLE public.ci_competitors
  ADD COLUMN IF NOT EXISTS price_estimate_eur numeric(10,2);

ALTER TABLE public.businesses
  ADD COLUMN IF NOT EXISTS price_estimate_eur numeric(10,2);

CREATE INDEX IF NOT EXISTS ci_comp_reviews_owner_reply_idx
  ON public.ci_competitor_reviews (competitor_id)
  WHERE owner_reply_text IS NOT NULL;