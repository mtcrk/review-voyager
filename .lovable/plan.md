## Amaç

İşletme, yorum cevaplarının sonuna eklenebilecek sabit bir kapanış metni kaydeder. Her cevap üretiminde bu kapanışın eklenip eklenmeyeceğini bir seçimle kontrol eder.

Örnek kayıtlı kapanış:

```text
Mete Çoruk
Genel Müdür
+90 555 000 00 00
```

## Yapılacaklar

1. **Ayarlar > Marka Sesi** bölümüne “Kayıtlı kapanış” metin alanı ekle.
   - Ad, unvan, telefon, e-posta veya istenen başka bir metin satır satır yazılabilir.
   - “Yanıt üretirken varsayılan olarak ekle” anahtarı bulunur.
   - Ayar seçili işletmeye özel olarak mevcut marka sesi kaydında saklanır.

2. Yorum yanıtı üretme alanlarına **“Kayıtlı kapanışı ekle”** seçeneği koy.
   - İşletmenin varsayılan ayarına göre açık veya kapalı gelir.
   - Kullanıcı yalnız o cevap için seçimi değiştirebilir.
   - Hem yorum listesi içindeki üretimde hem yorum detay ekranında uygulanır.

3. Kapanışı cevabın sonuna güvenilir biçimde ekle.
   - Yapay zekânın metni değiştirmesine bırakılmaz; üretilen ve kalite kontrolünden geçen cevabın sonuna aynen eklenir.
   - Kapalıysa eklenmez.
   - Aynı kapanış zaten varsa ikinci kez eklenmez.
   - Kayıtlı kapanış boşsa seçenek gösterilmez ve cevap normal üretilir.

4. Mevcut imza ve iletişim alanlarını koru.
   - Eski kayıtlar çalışmaya devam eder.
   - Yeni “Kayıtlı kapanış”, kullanıcıya tam metin ve satır düzeni üzerinde daha fazla kontrol verir.

## Doğrulama

- Kapanış açıkken üretilen cevabın sonunda kayıtlı metnin birebir yer aldığını kontrol et.
- Seçenek kapatıldığında aynı cevabın kapanışsız üretildiğini kontrol et.
- Yeniden üretme, kaydetme, kopyalama ve Google’a gönderme akışlarında görünen metnin aynı kaldığını doğrula.
- İşletme değiştirildiğinde diğer işletmenin kapanışının kullanılmadığını kontrol et.

## Teknik not

Yeni tablo gerekmiyor; kapanış metni ve varsayılan seçim mevcut işletme bazlı `brand_voice` kaydında tutulacak. Yanıt üretme isteğine o cevap için seçilen açık/kapalı değeri gönderilecek ve sunucu tarafında sonuca deterministik olarak eklenecek.
