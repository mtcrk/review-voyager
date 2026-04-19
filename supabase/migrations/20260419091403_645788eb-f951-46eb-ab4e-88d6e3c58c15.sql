
-- 1) Mevcut duplikeleri temizle: her (business_id, platform, google_review_id) için en eski kaydı tut
DELETE FROM public.reviews r
USING public.reviews r2
WHERE r.business_id = r2.business_id
  AND r.platform = r2.platform
  AND r.google_review_id = r2.google_review_id
  AND r.google_review_id IS NOT NULL
  AND r.created_at > r2.created_at;

-- created_at eşit olan kalan duplikeler için id karşılaştırması
DELETE FROM public.reviews r
USING public.reviews r2
WHERE r.business_id = r2.business_id
  AND r.platform = r2.platform
  AND r.google_review_id = r2.google_review_id
  AND r.google_review_id IS NOT NULL
  AND r.id > r2.id;

-- 2) Unique constraint ekle (sadece google_review_id NOT NULL olanlar için partial unique index)
CREATE UNIQUE INDEX IF NOT EXISTS reviews_unique_google_review
ON public.reviews (business_id, platform, google_review_id)
WHERE google_review_id IS NOT NULL;
