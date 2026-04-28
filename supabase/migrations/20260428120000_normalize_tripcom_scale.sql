-- Trip.com ve Hotels.com için 10-point skalasını standardize et
-- Eski 5-point kayıtları 10-point'e yükselt
UPDATE public.platform_ratings
SET rating = ROUND((rating * 2)::numeric, 1),
    rating_scale = 10
WHERE platform = 'tripcom'
  AND rating_scale = 5
  AND rating IS NOT NULL
  AND rating <= 5;

UPDATE public.platform_ratings
SET rating_scale = 10
WHERE platform = 'tripcom' AND rating_scale = 5;

-- Hotels.com'da yanlışlıkla 5'lik gelen değerleri düzelt
UPDATE public.platform_ratings
SET rating = ROUND((rating * 2)::numeric, 1)
WHERE platform = 'hotelscom'
  AND rating_scale = 10
  AND rating IS NOT NULL
  AND rating <= 5;
