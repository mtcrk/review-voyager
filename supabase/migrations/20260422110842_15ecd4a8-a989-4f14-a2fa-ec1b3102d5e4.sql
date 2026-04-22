ALTER TABLE public.reviews DROP CONSTRAINT IF EXISTS reviews_rating_check;

ALTER TABLE public.reviews
ADD CONSTRAINT reviews_rating_check
CHECK (
  rating >= 1
  AND (
    (platform IN ('booking', 'expedia', 'hotelscom', 'tripcom') AND rating <= 10)
    OR
    (platform NOT IN ('booking', 'expedia', 'hotelscom', 'tripcom') AND rating <= 5)
  )
);