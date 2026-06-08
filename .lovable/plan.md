## Hedef

Şu an rakip analizi "puan + yorum sayısı + sentiment" gösteriyor — bu yetmez. Otelci 3 kararı verebilmeli:

1. **Fiyat & pozisyon**: Aynı yıldız/segmentteki rakiplere göre fiyatımı yukarı mı çekmeliyim, aşağı mı?
2. **Operasyon**: Bu hafta hangi servisi düzeltirsem en çok puan kazanırım?
3. **Yanıt yönetimi**: Rakiplerim yorumlara ne kadar hızlı/sıkı yanıtlıyor, ben neredeyim?

Çıktı: Comparison sayfası üstünde **3 canlı aksiyon kartı** + her Pazartesi otomatik gönderilen **haftalık brief e-postası**.

## Yeni veri (1 migration)

`ci_competitor_reviews` zaten ham yorumları + `raw_payload` tutuyor. Owner reply'leri çoğunlukla `raw_payload.ownerResponse` içinde geliyor. Yeni alanlar:

- `ci_competitor_reviews.owner_reply_text TEXT` — varsa rakibin yorumun altına yazdığı cevap
- `ci_competitor_reviews.owner_reply_at TIMESTAMPTZ` — cevap tarihi (yanıt süresi hesabı için)
- `ci_competitors.price_estimate_eur NUMERIC` — kullanıcının manuel girebileceği rakip oda fiyatı (opsiyonel, fiyat ekseni için)
- `businesses.price_estimate_eur NUMERIC` — kendi ortalama oda fiyatı

Owner reply alanlarını mevcut Apify ingest fonksiyonu (`ingest-apify-reviews`) `raw_payload.ownerResponse.text/date` yoksa `ownerResponseText`/`reply` gibi sık bilinen alanlardan dener.

## Action Pack — 3 kart (Comparison sayfasında)

### Kart 1 — Fiyat & Pozisyon Önerisi

- Aynı **segment + yıldız** filtreli rakipleri al → ortalama puanını ve (varsa) fiyat tier/EUR'unu hesapla.
- **Value Index = rating × 20 − price_tier × 10** (yüksek = aşırı değerli)
- Öneri kuralları:
  - Sizin rating > rakip ortalama + 0.2 **ve** price ≤ rakip ortalama → "Fiyatı %5-10 artırma fırsatı var"
  - Sizin rating < rakip ortalama − 0.2 → "Fiyatı sabit tut, önce 2. kartı çöz"
  - Rating ≈ ortalama, price > rakip → "Promosyon/paket önerisi"
- Görsel: küçük bar — siz vs segment ortalaması (rating + fiyat tier), altta tek cümle öneri.

### Kart 2 — Bu Haftaki Operasyonel Öncelik

`ci_review_topics` zaten doluyor. Her topic için ROI skoru:

```
priority = (own_negative_count * 2) + (comp_negative_count * 1) − (own_positive_count * 0.5)
boost = comp_avg_sentiment > 0.1 ise 1.5×  (rakip iyi, siz kötü → en kritik)
```

Top 3 topic'i "şu hafta şuna odaklan" listesi olarak göster. Her satır: konu adı + "X şikayetiniz, rakipte Y şikayet" + tahmini puan etkisi.

### Kart 3 — Yanıt Benchmark

- **Sizin reply rate** (mevcut `reviews.approved_reply` / `status='replied'`)
- **Rakip reply rate** (`owner_reply_text IS NOT NULL` / toplam)
- **Sizin medyan yanıt süresi** (replied_at − posted_at)
- **Rakip medyan yanıt süresi**
- Renk kodlu rozet: yeşil (rakipten iyi), amber (yakın), kırmızı (kötü).
- Altta CTA: "Cevapsız 12 yorumunuza git" → `/reviews?status=unanswered`

## Haftalık Otomatik E-posta (Pazartesi 09:00 TR)

Yeni edge function: `weekly-competitive-brief`
- pg_cron: `0 6 * * 1` UTC (09:00 TR)
- Tüm `businesses` üzerinde döner; en az 1 `confirmed` rakibi olanları işler
- İçeriği DB'den çeker (yukarıdaki 3 kartla aynı mantık) → React Email template (Lovable Emails)
- Resend connector yerine **Lovable Emails** kullanılır (mevcut altyapı `notify.voyagerespond.com`)
- Template: `weekly-competitive-brief.tsx`
  - Üst: "Bu hafta sizin için 3 aksiyon" (1 satırlık öneriler)
  - Geçen haftayla karşılaştırma: rating Δ, yorum hacmi Δ, en çok artan/azalan konu
  - Alt: "Panele git" CTA → `/intelligence/comparison`

## Teknik

```text
1. Migration: 4 yeni kolon
2. ingest-apify-reviews → owner_reply_text/at extraction
3. src/lib/intelligence/actionPack.ts → tüm hesap fonksiyonları (test edilebilir, paylaşılan)
4. src/components/intelligence/ActionPack.tsx → 3 kart bileşeni
5. IntelligenceComparison.tsx → ActionPack en üste eklenir
6. Settings > Locations → "Ortalama oda fiyatı (EUR)" alanı (price_estimate_eur)
7. supabase/functions/weekly-competitive-brief/index.ts
8. supabase/functions/_shared/transactional-email-templates/weekly-competitive-brief.tsx
9. pg_cron job (insert tool ile)
```

## Kapsam dışı (bu turda)

- PDF export (zaten Reporting modülünde var)
- Fiyat **otomatik** scraping (Booking fiyatları manuel girilecek; otomasyon ayrı bir faz)
- 5'ten fazla rakip karşılaştırma (UI 5 ile sınırlanır; daha fazlası için "Tümünü görüntüle" linki)

Onaylarsan migration ile başlıyorum.
