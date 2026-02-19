
-- Add multi-location support columns to businesses
ALTER TABLE public.businesses 
  ADD COLUMN IF NOT EXISTS parent_business_id uuid REFERENCES public.businesses(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS lat numeric,
  ADD COLUMN IF NOT EXISTS lng numeric,
  ADD COLUMN IF NOT EXISTS city text,
  ADD COLUMN IF NOT EXISTS weekly_report_enabled boolean NOT NULL DEFAULT false;

-- Index for fast branch lookups
CREATE INDEX IF NOT EXISTS idx_businesses_parent_id ON public.businesses(parent_business_id);
