
ALTER TABLE public.businesses 
  ADD COLUMN IF NOT EXISTS tripadvisor_id TEXT,
  ADD COLUMN IF NOT EXISTS trustpilot_url TEXT,
  ADD COLUMN IF NOT EXISTS hotelscom_url TEXT;
