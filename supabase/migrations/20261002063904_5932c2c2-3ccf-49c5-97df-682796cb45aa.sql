ALTER TABLE public.businesses
  ADD COLUMN IF NOT EXISTS etstur_slug text,
  ADD COLUMN IF NOT EXISTS etstur_hotel_id text,
  ADD COLUMN IF NOT EXISTS etstur_matched_name text,
  ADD COLUMN IF NOT EXISTS etstur_checked_at timestamptz;
ALTER TABLE public.ci_competitors
  ADD COLUMN IF NOT EXISTS etstur_slug text,
  ADD COLUMN IF NOT EXISTS etstur_hotel_id text,
  ADD COLUMN IF NOT EXISTS etstur_matched_name text,
  ADD COLUMN IF NOT EXISTS etstur_checked_at timestamptz;
ALTER TABLE public.competitor_price_snapshots
  ADD COLUMN IF NOT EXISTS market text NOT NULL DEFAULT 'international',
  ADD COLUMN IF NOT EXISTS price_before_discount numeric,
  ADD COLUMN IF NOT EXISTS campaign_price numeric,
  ADD COLUMN IF NOT EXISTS campaign_label text,
  ADD COLUMN IF NOT EXISTS remaining_allotment integer,
  ADD COLUMN IF NOT EXISTS cancellation_details jsonb;
ALTER TABLE public.competitor_price_snapshots DROP CONSTRAINT IF EXISTS cps_adapter_chk;
ALTER TABLE public.competitor_price_snapshots ADD CONSTRAINT cps_adapter_chk CHECK (source_adapter IN ('serpapi','booking','manual','etstur'));
ALTER TABLE public.competitor_price_snapshots ADD CONSTRAINT cps_market_chk CHECK (market IN ('international','domestic'));
CREATE INDEX IF NOT EXISTS cps_market_idx ON public.competitor_price_snapshots (business_id, market, checkin, fetched_at DESC);