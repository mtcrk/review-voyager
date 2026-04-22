-- Önce mükerrer (duplicate) kayıtları temizle, sadece en yenisini bırak
DELETE FROM public.reviews a
USING public.reviews b
WHERE a.id < b.id
  AND a.business_id = b.business_id
  AND a.platform = b.platform
  AND a.google_review_id IS NOT NULL
  AND a.google_review_id = b.google_review_id;

-- Yorum çekme fonksiyonunun ON CONFLICT yapabilmesi için unique index ekle
CREATE UNIQUE INDEX IF NOT EXISTS reviews_business_platform_google_review_id_key
ON public.reviews (business_id, platform, google_review_id)
WHERE google_review_id IS NOT NULL;