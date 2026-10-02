ALTER TABLE public.competitor_price_snapshots
  ADD COLUMN IF NOT EXISTS min_stay_nights integer,
  ADD COLUMN IF NOT EXISTS queried_nights integer;