-- Eski partial index'i kaldır (ON CONFLICT desteklemiyor)
DROP INDEX IF EXISTS public.reviews_business_platform_google_review_id_key;

-- google_review_id NULL olanları platform-spesifik bir placeholder ile doldur
-- (apify-fetched ve diğer kaynaklar için review_id zaten farklı kolonlarda olabilir; bu sadece google için lazım)
-- ON CONFLICT için tam constraint ekleyelim — NULL'ları dahil etmek için COALESCE kullanan expression index
CREATE UNIQUE INDEX reviews_business_platform_google_review_id_key
ON public.reviews (
  business_id,
  platform,
  COALESCE(google_review_id, id::text)
);