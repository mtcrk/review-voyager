-- Add platform column to reviews table to distinguish data sources
ALTER TABLE public.reviews 
ADD COLUMN platform text NOT NULL DEFAULT 'google';

-- Add index for platform filtering
CREATE INDEX idx_reviews_platform ON public.reviews(platform);

-- Add booking_hotel_id to businesses for Wextractor integration
ALTER TABLE public.businesses
ADD COLUMN booking_hotel_id text NULL;