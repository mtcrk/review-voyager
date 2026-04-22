DROP INDEX IF EXISTS public.reviews_business_platform_google_review_id_key;

ALTER TABLE public.reviews
ADD CONSTRAINT reviews_business_platform_google_review_id_key
UNIQUE (business_id, platform, google_review_id);