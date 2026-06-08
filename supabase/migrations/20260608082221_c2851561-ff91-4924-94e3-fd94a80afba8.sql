
ALTER TABLE public.ci_competitors
  ADD COLUMN IF NOT EXISTS star_rating numeric,
  ADD COLUMN IF NOT EXISTS segment text,
  ADD COLUMN IF NOT EXISTS price_tier integer,
  ADD COLUMN IF NOT EXISTS room_count integer,
  ADD COLUMN IF NOT EXISTS match_score_breakdown jsonb;

ALTER TABLE public.businesses
  ADD COLUMN IF NOT EXISTS star_rating numeric,
  ADD COLUMN IF NOT EXISTS segment text,
  ADD COLUMN IF NOT EXISTS price_tier integer,
  ADD COLUMN IF NOT EXISTS room_count integer;
