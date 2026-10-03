ALTER TABLE public.competitor_price_snapshots ADD COLUMN IF NOT EXISTS room_tier text NOT NULL DEFAULT 'unknown';
ALTER TABLE public.competitor_price_snapshots DROP CONSTRAINT IF EXISTS cps_room_tier_chk;
ALTER TABLE public.competitor_price_snapshots ADD CONSTRAINT cps_room_tier_chk CHECK (room_tier IN ('standard','superior','deluxe','family','suite','villa','unknown'));
ALTER TABLE public.businesses ADD COLUMN IF NOT EXISTS province text;
ALTER TABLE public.ci_competitors ADD COLUMN IF NOT EXISTS province text;