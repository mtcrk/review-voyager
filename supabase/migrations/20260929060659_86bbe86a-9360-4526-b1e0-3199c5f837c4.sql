ALTER TABLE public.competitor_price_snapshots ALTER COLUMN price DROP NOT NULL;
ALTER TABLE public.competitor_price_snapshots ADD COLUMN IF NOT EXISTS no_availability boolean NOT NULL DEFAULT false;