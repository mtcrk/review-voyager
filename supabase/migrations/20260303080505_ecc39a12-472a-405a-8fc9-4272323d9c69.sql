
-- Add photos column to reviews table (JSONB array of photo URLs)
ALTER TABLE public.reviews ADD COLUMN photos jsonb DEFAULT '[]'::jsonb;

-- Add comment for documentation
COMMENT ON COLUMN public.reviews.photos IS 'Array of photo URLs from Google reviews, e.g. [{"url": "https://...", "thumbnail": "https://..."}]';
