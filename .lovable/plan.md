# Rakip Analizi — Derinleştirme Planı

4 alanı sırayla, küçük PR'lar halinde inşa edeceğiz. Her faz tek başına çalışır ve test edilebilir.

---

## Faz 1 — Karşılaştırma Dashboard'u (en yüksek görünür etki)

Rakip Analizi sayfasına **3. tab: "Karşılaştırma"** eklenecek. Senin oteline vs onaylı rakiplere yan yana metrikler.

**Görseller:**
- KPI kartları (4 adet): Ortalama Puan, Toplam Yorum, Yanıt Oranı, Son 30g Yorum Hacmi — sen vs rakip ortalaması delta'sı ile
- Bar grafiği: Her rakip + sen, ortalama puan karşılaştırması (Recharts)
- Çizgi grafiği: Son 90 günde yorum hacmi trendi (sen vs en yakın 3 rakip)
- Platform dağılımı tablosu: Booking / TripAdvisor / Expedia / Hotels.com / Google başına ortalama puan (sen + her rakip)
- Sıralama (rank) rozeti: "Bölgenizde X. sıradasın"

**Veri kaynağı:**
- Senin: `reviews` (business_id'ye göre)
- Rakip: `ci_competitor_reviews` (competitor_id → ci_competitors)

**Lokasyon dropdown'u** zaten mevcut; bu tab da onu kullanır.

---

## Faz 2 — Konu & Sentiment Analizi

Mevcut `ci_review_topics` ve `ci_topics` tablolarını canlandır + zenginleştir.

**Yeni edge function: `analyze-competitor-topics`**
- Trigger: Apify ingest sonrası otomatik (webhook) + manuel "Yeniden analiz et" butonu
- Gemini 2.5 Flash ile rakip yorumlarından konu çıkarımı (temizlik, personel, kahvaltı, gürültü, fiyat, konum, vb.)
- Her konu için: pozitif/negatif sayısı, son 30g delta, hangi rakipte daha çok

**UI: Tab "Karşılaştırma" altında "Konu Analizi" bölümü**
- Heat map / matris: Konular × Rakipler, hücre rengi sentiment'a göre
- "Sende fırsat" kartı: Rakipte negatif yükseliyor, sende henüz şikayet yok
- "Sende risk" kartı: Sende negatif var, rakiplerde yok
- Konuya tıklayınca o konudaki son yorum örnekleri

---

## Faz 3 — Otomatik Alertler (Email)

**Yeni edge function: `competitor-alerts-cron`** (haftalık pg_cron, Pazartesi 09:00)

**Tetikleyiciler:**
- Rakip ortalama puanı ±0.2 değişti
- Rakip yorum hacmi son 7g'de %50+ arttı
- Yeni rakip otomatik keşfedildi (suggested)
- Rakipte yükselen şikayet konusu (Faz 2'ye bağlı)
- Sen bir konuda rakiplerin tamamını geçtin (kazanım)

**Email:** Resend / `notify@voyagerespond.com` üzerinden VoyageRespond brand template (mevcut Approach A). Markdown bullet'lı haftalık özet + dashboard linki.

**Ayarlar UI:** Intelligence sayfasında küçük "Bildirim Tercihleri" pop-over — alert tipleri açık/kapalı, e-posta adresi.

**Yeni tablo: `ci_alert_preferences`** (business_id, alert_types jsonb, email, enabled, last_sent_at)

---

## Faz 4 — Akıllı Eşleştirme (match_score iyileştirme)

`discover-competitors` edge function'ını ve `ci_competitors` tablosunu güçlendir.

**Yeni alanlar (`ci_competitors`):**
- `star_rating` (otel yıldız sayısı, 1-5)
- `segment` (boutique / resort / business / budget / luxury)
- `price_tier` (1-4, Google Places price_level)
- `room_count` (varsa)

**Yeni match_score formülü (0-100):**
```
40% Yakınlık (proximity, mevcut)
20% Yıldız uyumu (aynı yıldız = 100, ±1 = 60, diğer = 20)
15% Segment uyumu (aynı segment = 100)
15% Fiyat tier uyumu
10% Yorum hacmi benzerliği (log scale)
```

**Segment çıkarımı:** Gemini 2.5 Flash, otel adı + Google açıklaması üzerinden tek sefer (rakip eklenirken).

**UI:**
- Rakip kartında yeni rozetler: yıldız, segment, fiyat
- Filtre çubuğu: "Sadece aynı segment" / "Sadece aynı yıldız"
- Match score breakdown tooltip (neden bu skor?)

---

## Sıra & Tahmini Süre

1. **Faz 1** (Karşılaştırma Dashboard) — en hızlı görünür değer, sadece frontend + read-only sorgular
2. **Faz 4** (Akıllı Eşleştirme) — keşif kalitesini artırır, Faz 2'yi besler
3. **Faz 2** (Konu Analizi) — AI maliyeti var, Apify'dan veri olgunlaşınca anlamlı
4. **Faz 3** (Alertler) — Faz 2 sinyallerine dayanır, en sona

## Teknik notlar

- Tüm yeni edge function'lar: `verify_jwt = false` + Authorization header forwarding (mevcut pattern)
- RLS: tüm yeni tablolar `business_id` üzerinden, mevcut `has_role` pattern
- AI: Gemini 2.5 Flash via Lovable AI Gateway (`LOVABLE_API_KEY` zaten var)
- Apify ek maliyet yok (mevcut veriyi işliyoruz)
- pg_cron job Faz 3'te eklenir

Hangi fazdan başlayalım — sırayla 1'den mi, yoksa farklı bir öncelik mi?
