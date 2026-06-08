
ALTER TABLE public.reviews ADD COLUMN IF NOT EXISTS topics_extracted_at timestamptz;
CREATE INDEX IF NOT EXISTS reviews_topics_pending_idx ON public.reviews (business_id) WHERE topics_extracted_at IS NULL;
