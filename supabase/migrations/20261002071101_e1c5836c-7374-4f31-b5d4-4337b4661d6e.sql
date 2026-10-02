ALTER TABLE public.businesses
  ADD COLUMN IF NOT EXISTS jollytur_hotel_id text,
  ADD COLUMN IF NOT EXISTS jollytur_slug text,
  ADD COLUMN IF NOT EXISTS jollytur_matched_name text,
  ADD COLUMN IF NOT EXISTS jollytur_checked_at timestamptz,
  ADD COLUMN IF NOT EXISTS tatilsepeti_slug text,
  ADD COLUMN IF NOT EXISTS tatilsepeti_matched_name text,
  ADD COLUMN IF NOT EXISTS tatilsepeti_checked_at timestamptz;
ALTER TABLE public.ci_competitors
  ADD COLUMN IF NOT EXISTS jollytur_hotel_id text,
  ADD COLUMN IF NOT EXISTS jollytur_slug text,
  ADD COLUMN IF NOT EXISTS jollytur_matched_name text,
  ADD COLUMN IF NOT EXISTS jollytur_checked_at timestamptz,
  ADD COLUMN IF NOT EXISTS tatilsepeti_slug text,
  ADD COLUMN IF NOT EXISTS tatilsepeti_matched_name text,
  ADD COLUMN IF NOT EXISTS tatilsepeti_checked_at timestamptz;