import type { BlogPost } from "./blogPosts";

const UPDATED = "2026-06-05";
const AUTHOR = "VoyageRespond Ekibi";

export const memnuniyetClusterPosts: BlogPost[] = [
  {
    slug: "google-yorumlarim-nasil-yonetilir",
    title: "Google Yorumlarımı Görüntüleme ve Yönetme Paneli Rehberi (2026)",
    metaTitle: "Google Yorumlarımı Görüntüleme ve Yönetme | 2026 Rehberi",
    metaDescription:
      "Google yorumlarınızı görüntüleme, yanıtlama, raporlama ve kaldırma: Google Business Profile panelinde yorum yönetimi ve AI ipuçları.",
    description:
      "Google yorumlarınızı tek panelden yönetmenin yolları: yorumları görmek, yanıtlamak, raporlamak, kaldırmak ve AI ile otomatikleştirmek.",
    ogTitle: "Google Yorumlarımı Görüntüleme ve Yönetme | VoyageRespond",
    ogDescription:
      "Google Business Profile üzerinden yorum görme, yanıtlama, silme ve AI otomasyonu — tek rehberde.",
    author: AUTHOR,
    publishedAt: "2026-06-05",
    updatedAt: UPDATED,
    category: "Google Yorumları",
    readTime: "10 dk",
    keywords: [
      "google yorumlarım",
      "google yorumları nasıl yönetilir",
      "google işletme yorumları",
      "google yorum paneli",
      "google yorum silme",
    ],
    faqs: [
      {
        question: "Google yorumlarımı nereden görebilirim?",
        answer:
          "Google'da işletme adınızla arama yapıp 'Yorumları yönet' düğmesine tıklayarak ya da business.google.com adresinden Google Business Profile panelinize girerek tüm yorumlarınızı görebilirsiniz. Mobilden Google Haritalar uygulamasındaki 'İşletmeniz' sekmesinden de erişilebilir.",
      },
      {
        question: "Google yorumlarıma neden yanıt vermem gerekir?",
        answer:
          "Tüketicilerin %89'u karar vermeden önce yorumları okur ve yanıtlanmış yorumlar olan işletmelere %35 daha çok güvenir. Ayrıca Google'ın algoritması yanıtlanan profillere yerel aramalarda öncelik verir.",
      },
      {
        question: "Haksız bir Google yorumunu silebilir miyim?",
        answer:
          "Yorum Google'ın içerik politikalarını ihlal ediyorsa (hakaret, sahte içerik, çıkar çatışması, ilgisiz konu) 'Uygunsuz olarak işaretle' ile şikayet edebilirsiniz. Süreç 5-15 gün sürer ve her başvuru kabul edilmez; o yüzden bu süre içinde profesyonel bir yanıt da yazmanızı öneririz.",
      },
      {
        question: "Yorum yanıtlarımı AI ile yazdırabilir miyim?",
        answer:
          "Evet. VoyageRespond gibi AI destekli platformlar Google yorumlarınızı otomatik çeker, markanızın tonunu öğrenir ve her yoruma kişiselleştirilmiş yanıt önerir. Onayladığınız yanıt doğrudan Google'a gönderilir.",
      },
      {
        question: "Yorum yönetimi için günde kaç dakika ayırmalıyım?",
        answer:
          "Manuel yönetimde her 10 yorum yaklaşık 25-30 dakika alır. AI destekli sistemlerde aynı iş 3-5 dakikaya iner; çünkü AI taslakları üretir, siz sadece onaylarsınız.",
      },
    ],
    content: `
Google yorumlarım nereden görünür, nasıl yanıtlanır, nasıl silinir ve nasıl otomatikleştirilir? Bu rehberde Google Business Profile (eski adıyla Google My Business) üzerinden yorum yönetiminin **tüm adımlarını** ve manuel yönetimden AI destekli yönetime geçişin nasıl yapıldığını göreceksiniz.

İşletmenizin Google'daki yıldız ortalaması ve yorum sayısı, yerel aramalarda kaç sıra üstte göründüğünüzü doğrudan etkiler. BrightLocal'in 2025 raporuna göre tüketicilerin **%87'si** bir işletmeyi ziyaret etmeden önce Google yorumlarını okuyor. Yani "Google yorumlarım" sadece bir geri bildirim akışı değil; satış kanalınız.

## Google Yorumlarımı Nereden Görürüm?

Google yorumlarınıza üç farklı şekilde erişebilirsiniz:

1. **Doğrudan arama:** Google'da işletme adınızı yazın. Sağdaki kutuda "Yorumları yönet" butonu çıkar.
2. **Google Business Profile paneli:** business.google.com adresine giriş yapın, sol menüden "Yorumlar" sekmesine tıklayın.
3. **Mobilden:** Google Haritalar uygulaması → profil simgeniz → "İşletmeniz" → "Yorumlar".

Her üçü de aynı veriyi gösterir. Birden fazla lokasyonunuz varsa Business Profile Manager, hepsini tek listede toplar.

## Yorumlara Nasıl Yanıt Verilir?

Yanıt yazmak için yorumun yanındaki **"Yanıtla"** butonuna tıklayın. Yanıt aynı dakikada müşteriye e-posta olarak gider ve **herkese açık** olarak yorumun altında görünür. Yani yanıtınız sadece yorum yazana değil, sonradan o yorumu okuyacak yüzlerce potansiyel müşteriye yazılıyor.

### İyi yanıtın 4 kuralı

- **Adıyla hitap edin.** "Ayşe Hanım, …" otomatik şablona göre %3x daha samimi algılanır.
- **Spesifik detaya değinin.** Müşteri "kahvaltı çok güzeldi" dediyse "ev yapımı reçellerimizi sevmenize sevindik" deyin — şefin tarifi gibi somut bir şey ekleyin.
- **Maks. 3-4 cümle.** Uzun yanıtlar okunmaz.
- **24 saat içinde yanıtlayın.** İlk gün gelen yanıtlar müşteri kararını %33 oranında değiştiriyor.

### Olumsuz yoruma örnek yanıt

> Merhaba [İsim], yaşadığınız deneyim için samimiyetle özür dileriz. [Spesifik sorun] konusunu hemen ekibimizle değerlendirdik ve [aksiyon] adımını attık. Sizinle doğrudan iletişime geçmek isteriz — [iletişim] üzerinden bize ulaşır mısınız?

Olumsuz yorumların detaylı yanıt çerçevesi için → [Olumsuz Google Yorumu Nasıl Cevaplanır?](/blog/olumsuz-google-yorumu-nasil-cevaplanir) rehberimize bakın.

## Bir Yorumu Nasıl Silerim (veya Silinmesini Talep Ederim)?

İşletme sahibi olarak siz **doğrudan** silemezsiniz. Sadece Google'ın silmesini talep edebilirsiniz.

### Silinme talep edilebilir yorum türleri

- Hakaret, küfür içeren
- Açıkça sahte / başkası tarafından yazılmış
- Rakip işletme tarafından yazılmış (çıkar çatışması)
- İşletmenizle ilgisiz konu (politika, kişisel hesaplaşma)
- Spam veya reklam linki içeren

### Adımlar

1. Yorumun yanındaki üç noktaya tıklayın → **"Uygunsuz olarak işaretle"**.
2. Açılan formda kategoriyi seçin ve **detaylı açıklama** yazın (ne kadar somutsa o kadar iyi).
3. Bekleyin: Google ortalama **5-15 gün** içinde karar verir.
4. Reddedilirse Google Business Profile Yardım üzerinden itiraz edebilirsiniz.

Önemli: Bekleme sürecinde **mutlaka profesyonel bir yanıt yazın**. Yorum silinmezse en azından okuyan herkes sizin tarafınızı görmüş olur.

## Yorumlarımı Tek Panelden Yönetmenin Yolları

10'dan fazla yorum gelmeye başladığında Google'ın kendi paneli yetersiz kalır:

- Filtreleme yok (yıldıza/tarihe göre)
- AI yanıt önerisi yok
- Çoklu lokasyon için sürekli profil değiştirmek gerekir
- Raporlama yok

### Yorum yönetim yazılımı ne yapar?

| Özellik | Google Paneli | Yönetim Yazılımı |
|---|---|---|
| Yorum çekme | Manuel | Otomatik (saatlik) |
| AI yanıt önerisi | Yok | 8 farklı tonda |
| Çoklu lokasyon | Profil değiştirmek lazım | Tek dashboard |
| Raporlama | Yok | Haftalık/aylık |
| Duygu analizi | Yok | Var |
| Çoklu platform (Booking, TripAdvisor, vb.) | Yok | Var |

VoyageRespond, bu işi otomatikleştiren bir platformdur. Google işletme hesabınızı bağlarsınız, sistem son 2.500 yorumu çeker, her yenisi için yanıt taslağı önerir, siz onaylayınca doğrudan Google'a gönderir.

## AI ile Yorum Yanıtlama: Nasıl Çalışır?

1. Google işletme profilinizi bağlayın (OAuth ile 30 saniye)
2. Marka tonunuzu seçin: profesyonel, samimi, esprili, resmi, …
3. Sistem her yeni yorumu işler ve **kişiselleştirilmiş 3 yanıt önerisi** üretir
4. Onayladığınız yanıt anında yayınlanır

10 yorum için manuel cevapta 25-30 dakika harcanırken AI'da bu süre **3-5 dakikaya** düşer. Detaylar → [AI ile Yorum Cevaplama](/blog/ai-ile-yorum-cevaplama).

## Sık Karşılaşılan Sorunlar

- **Yorum gelmiyor.** Müşterilere yorum bırakma linkini gönderin: business profile → "Daha fazla yorum alın". QR kod yazdırıp masaya/resepsiyona koyun.
- **Düşük yıldızlar arttı.** İlk 7 gün **her gün** yanıt yazın. Ortalamayı düzeltmek 30-90 gün sürer.
- **Aynı yorumu iki kez gördüm.** Google bazen yorumu yeniden indeksler; profil panelinde duplicate görünebilir, müşteriye iki kez yanıt yazmayın.
- **Yanıt yazdım, görünmüyor.** Bazen 24 saat sürer. Şüpheli karakter (emoji yığını, link) varsa Google filtreleyebilir.

## Sonraki Adım

Eğer yoğun bir işletmeyseniz (haftada 5+ yorum), manuel yönetim sürdürülebilir değil. VoyageRespond'un 3 ay ücretsiz planıyla Google yorumlarınızı tek panelden AI destekli yönetmeye başlayabilirsiniz.

## İlgili Rehberler

- [Google Yorumlarına Nasıl Yanıt Verilir? 2026 Rehberi](/blog/google-yorumlarina-nasil-yanit-verilir)
- [Google Yorum Cevap Şablonları (25 Örnek)](/blog/google-yorum-cevap-sablonlari)
- [Olumsuz Google Yorumu Nasıl Cevaplanır?](/blog/olumsuz-google-yorumu-nasil-cevaplanir)
- [Online İtibar Yönetimi Rehberi](/online-itibar-yonetimi)
`,
  },
  {
    slug: "google-yorum-nedir-nasil-yapilir",
    title: "Google Yorum Nedir, Nasıl Yapılır ve Nasıl Yönetilir?",
    metaTitle: "Google Yorum: Nedir, Nasıl Yazılır, Nasıl Yanıtlanır?",
    metaDescription:
      "Google yorum nedir, nasıl yazılır, nasıl yanıtlanır, nasıl silinir? İşletmeler ve müşteriler için kapsamlı 2026 rehberi.",
    description:
      "Google yorum sisteminin nasıl çalıştığını, müşteri olarak nasıl yorum yazılacağını ve işletme olarak yorumların nasıl yönetileceğini öğrenin.",
    ogTitle: "Google Yorum Nedir, Nasıl Yapılır? | VoyageRespond",
    ogDescription:
      "Google yorum yazma, yanıtlama, silme ve işletmeler için yorum yönetimi — tek kapsamlı rehber.",
    author: AUTHOR,
    publishedAt: "2026-06-05",
    updatedAt: UPDATED,
    category: "Google Yorumları",
    readTime: "9 dk",
    keywords: [
      "google yorum",
      "google yorum nedir",
      "google yorum nasıl yapılır",
      "google yorum yazma",
      "google yorum yanıtlama",
    ],
    faqs: [
      {
        question: "Google yorum nedir?",
        answer:
          "Google yorum, Google Haritalar veya Arama üzerindeki bir işletme profilinde kullanıcıların 1-5 yıldız ve metin olarak paylaştığı değerlendirmedir. Yerel SEO sıralamasını ve potansiyel müşteri kararını doğrudan etkiler.",
      },
      {
        question: "Google'a nasıl yorum yazılır?",
        answer:
          "Google Haritalar veya Arama'da işletme adını arayın, profil sağ panelinden 'Yorum yaz' butonuna tıklayın, 1-5 yıldız verin ve metni yazın. Google hesabı zorunludur ve yorum birkaç saatte yayınlanır.",
      },
      {
        question: "Google yorumumu nasıl silerim veya düzenlerim?",
        answer:
          "Google Haritalar uygulamasında 'Katkıların' sekmesine gidin, yorumunuzun yanındaki üç noktaya tıklayın ve 'Düzenle' veya 'Sil' seçeneğini kullanın. İşlem anında uygulanır.",
      },
      {
        question: "Bir işletme bana neden Google yorumu için ısrar ediyor?",
        answer:
          "Çünkü Google yorumları işletmenin yerel arama sıralamasını ve güvenilirliğini doğrudan belirler. Yorum sayısı ve yıldız ortalaması ne kadar yüksekse, işletme o kadar üst sırada görünür ve daha fazla müşteri çeker.",
      },
      {
        question: "İşletme olarak Google yorumlarımı nasıl yönetirim?",
        answer:
          "Google Business Profile'a giriş yapıp manuel yanıtlayabilir ya da VoyageRespond gibi AI destekli platformlarla otomatik yanıt taslakları alabilir, çoklu lokasyonlu işletmelerde tek panelden tüm şubeleri yönetebilirsiniz.",
      },
    ],
    content: `
Google yorum nedir, nasıl yazılır, nasıl silinir, işletme olarak nasıl yönetilir? Bu rehber hem müşteri hem işletme tarafından Google yorum sisteminin nasıl çalıştığını ve yerel SEO için neden bu kadar önemli olduğunu adım adım açıklıyor.

## Google Yorum Nedir?

Google yorum, **Google Haritalar** ve **Google Arama** üzerinden bir işletme profilinde paylaşılan değerlendirmedir. Üç parçası vardır:

- **Yıldız** (1-5 arası)
- **Metin** (isteğe bağlı)
- **Fotoğraf** (isteğe bağlı)

Yorumlar herkese açıktır ve işletme profilinin altında **kalıcı** olarak yayınlanır. Toplam yıldız ortalamanız + yorum sayınız, Google'ın yerel arama (örn. "yanımdaki restoran") sıralamasını doğrudan etkileyen 3 temel faktörden biridir.

## Müşteri Olarak Google'a Nasıl Yorum Yazılır?

### Mobilden (en hızlı yol)

1. Google Haritalar uygulamasını açın
2. İşletme adını arayın → profile girin
3. Aşağı kaydırın, **"Yorum yaz"** butonuna tıklayın
4. 1-5 yıldız seçin → kısa metin yazın → isterseniz fotoğraf ekleyin
5. **Yayınla**

### Bilgisayardan

1. google.com.tr'de işletme adını arayın
2. Sağdaki bilgi kutusunda **"Yorum yaz"** butonuna tıklayın
3. Aynı adımlar

Google hesabı zorunludur. Yorumunuz **1-24 saat** içinde yayınlanır; Google'ın spam filtresi şüphe duyarsa daha uzun sürebilir.

## Yorumumu Nasıl Silerim veya Düzenlerim?

1. Google Haritalar → profil simgeniz → **"Katkıların"**
2. **"Yorumlar"** sekmesi
3. Düzenlemek istediğiniz yorumun yanındaki **üç nokta** → "Düzenle" veya "Sil"

Sildiğiniz yorum **anında** kaldırılır. Düzenlediğinizde Google yorumu tekrar onay sürecinden geçirebilir.

## İşletme Olarak Google Yorumlarımı Nasıl Görürüm?

- **business.google.com** → Yorumlar sekmesi
- Veya Google'da işletme adınızı aratıp **"Yorumları yönet"** butonu

Yorum sayınız 20'yi geçtiyse manuel takip zorlaşır. Detaylar → [Google Yorumlarım Nasıl Yönetilir?](/blog/google-yorumlarim-nasil-yonetilir)

## Google Yorumuna Nasıl Yanıt Verilir?

Yorumun altındaki **"Yanıtla"** butonuna tıklayın. Yanıtınız:

- Müşteriye e-posta olarak iletilir
- **Herkese açık** olarak yorumun altında yayınlanır
- Sonradan düzenlenebilir

### 3 cümlelik yanıt formülü

1. **Teşekkür / özür** ("Geri bildiriminiz için teşekkürler.")
2. **Spesifik detay** ("Bahsettiğiniz [yemek/oda/personel] hakkında…")
3. **Çağrı** ("Tekrar bekleriz" / "Sizinle doğrudan iletişime geçmek isteriz")

25 hazır örnek için → [Google Yorum Cevap Şablonları](/blog/google-yorum-cevap-sablonlari)

## Sahte Yorum Nasıl Anlaşılır ve Nasıl Şikayet Edilir?

Sahte yorum belirtileri:

- Profil resimsiz, başka yorum yok
- Generic metin ("güzeldi", "kötüydü") — detay yok
- Aynı anda 3-4 olumsuz yorum
- Rakip işletme adının geçmesi

Şikayet için yorumun yanındaki **üç nokta → "Uygunsuz olarak işaretle"**. Google 5-15 gün içinde değerlendirir. Bu sırada yine de **profesyonel bir yanıt** yazın — herkes okuyor.

## Daha Fazla Google Yorumu Nasıl Toplanır?

- **QR kod:** İşletmenizin yorum linkini QR'a çevirin, masa/resepsiyon/fatura altına koyun
- **SMS / e-posta hatırlatma:** Servis sonrası 24 saat içinde
- **Personel teşviki:** Garson/resepsiyon "memnun musunuz, Google'a yorum yazar mısınız" deyince yorum oranı 3x artar
- **Yorum talebi otomasyonu:** VoyageRespond gibi platformlarla her ödeme sonrası otomatik istek gönderilebilir

## Google Yorum Yönetimi: Manuel vs AI Destekli

| Kriter | Manuel | AI (VoyageRespond) |
|---|---|---|
| Ortalama yanıt süresi | 18 saat | 5 dk |
| Yanıtlanan oran | %40 | %100 |
| 10 yoruma harcanan süre | 25-30 dk | 3-5 dk |
| Çoklu lokasyon yönetimi | Profil değiştirmek lazım | Tek panel |
| Duygu analizi & raporlama | Yok | Var |

## Sonraki Adım

İşletmenizin tüm Google yorumlarını AI ile yöneten bir panel arıyorsanız VoyageRespond'u **3 ay ücretsiz** deneyebilirsiniz.

## İlgili Rehberler

- [Google Yorumlarım Nasıl Yönetilir?](/blog/google-yorumlarim-nasil-yonetilir)
- [Google Yorum Cevap Şablonları](/blog/google-yorum-cevap-sablonlari)
- [Olumlu Yorum Cevap Örnekleri](/blog/olumlu-yorum-cevap-ornekleri)
- [Online İtibar Yönetimi Rehberi](/online-itibar-yonetimi)
`,
  },
  {
    slug: "musteri-memnuniyet-anketi-ornekleri",
    title: "Müşteri Memnuniyet Anketi Örnekleri: 20 Hazır Soru + 5 Şablon (2026)",
    metaTitle: "Müşteri Memnuniyet Anketi Örnekleri | 20 Soru, 5 Şablon",
    metaDescription:
      "Müşteri memnuniyet anketi nasıl hazırlanır? Restoran, otel, e-ticaret ve hizmet sektörü için 20 hazır soru ve 5 anket şablonu. Hemen kullanabilirsiniz.",
    description:
      "Müşteri memnuniyet anketi tasarlamanın 5 kuralı, NPS/CSAT/CES farkları ve sektöre göre 20 hazır soru.",
    ogTitle: "Müşteri Memnuniyet Anketi Örnekleri | 20 Hazır Soru",
    ogDescription:
      "NPS, CSAT, CES anketleri ve sektöre göre uyarlanmış 20 örnek soruyla anket hazırlama rehberi.",
    author: AUTHOR,
    publishedAt: "2026-06-05",
    updatedAt: UPDATED,
    category: "Müşteri Memnuniyeti",
    readTime: "8 dk",
    keywords: [
      "müşteri memnuniyet anketi",
      "müşteri memnuniyet anket örnekleri",
      "nps anketi",
      "csat anketi",
      "memnuniyet anketi soruları",
    ],
    faqs: [
      {
        question: "Müşteri memnuniyet anketinde kaç soru olmalı?",
        answer:
          "İdeal anket 5-8 sorudur. 10 sorunun üstüne çıkıldığında tamamlanma oranı %60'tan %20'lere düşer. Tek soruluk NPS anketleri en yüksek yanıt oranını verir (%40+).",
      },
      {
        question: "NPS, CSAT ve CES arasındaki fark nedir?",
        answer:
          "NPS (Net Promoter Score) sadakati ölçer ('Bizi tavsiye eder misiniz, 0-10?'). CSAT (Customer Satisfaction) genel memnuniyeti ölçer ('Ne kadar memnunsunuz, 1-5?'). CES (Customer Effort Score) işin ne kadar kolay halledildiğini ölçer ('Sorununuzu çözmek ne kadar kolaydı?').",
      },
      {
        question: "Anket ne zaman gönderilmeli?",
        answer:
          "Hizmet sonrası ilk 24 saat içinde gönderilen anketler en yüksek yanıt oranını alır. Restoranlarda ödeme sonrası 2 saat, otellerde check-out gününde, e-ticarette ürün teslimat gününde idealdir.",
      },
      {
        question: "Anket sonuçlarını nasıl analiz ederim?",
        answer:
          "NPS için 'destekçiler - eleştirenler' formülü kullanılır. CSAT için memnun olanların yüzdesi alınır. AI destekli platformlar (VoyageRespond gibi) açık uçlu yanıtları otomatik kategorize edip duygu analizi yapar.",
      },
    ],
    content: `
Müşteri memnuniyet anketi örnekleri, soru sayısı, sıklık ve sektöre göre uyarlama — hepsi tek rehberde. NPS, CSAT, CES farkını öğrenecek ve restoran, otel, e-ticaret, hizmet sektörü için **kopyala-yapıştır 20 hazır soru** bulacaksınız.

## Müşteri Memnuniyet Anketi Neden Önemli?

- Tutulması yeni müşteri kazanmaktan **5x daha ucuz** (Harvard Business Review)
- Memnuniyet skoru 1 puan artınca tekrar satın alma %42 artar
- Eleştirenleri zamanında yakalamazsanız Google yoruma yansır — kaybedilen 1 yıldız ortalama %5-9 ciro kaybı demek

Anket, sorunu **müşteri sosyal medyada yazmadan önce** yakalamanın en hızlı yoludur.

## 3 Temel Anket Türü

### 1. NPS (Net Promoter Score)

Tek soru: *"Bizi bir arkadaşınıza tavsiye etme olasılığınız 0-10 arası kaçtır?"*

- **9-10:** Destekçiler (Promoters)
- **7-8:** Pasifler
- **0-6:** Eleştirenler (Detractors)

**NPS = % Destekçi - % Eleştiren**

50+ mükemmel, 30+ iyi, 0+ kabul edilebilir, negatif kritik.

### 2. CSAT (Customer Satisfaction)

*"Hizmetimizden ne kadar memnun kaldınız? (1-5)"*

CSAT = (4 ve 5 verenler / toplam) × 100. %80+ hedeftir.

### 3. CES (Customer Effort Score)

*"Sorununuzu çözmek ne kadar kolaydı? (1-7)"*

Müşteri hizmetleri ekibinin verimliliğini ölçer.

## 5 Sektör için 20 Hazır Soru

### 🍽️ Restoran (5 soru)

1. Yemeklerimizden ne kadar memnun kaldınız? (1-5)
2. Servis hızımızı nasıl değerlendirirsiniz? (1-5)
3. Mekanın atmosferi beklentinizi karşıladı mı? (1-5)
4. Fiyat-kalite dengesi sizin için nasıldı? (1-5)
5. Bizi bir arkadaşınıza tavsiye eder misiniz? (0-10)

### 🏨 Otel (5 soru)

1. Odanızın temizliğinden memnun kaldınız mı? (1-5)
2. Check-in / check-out süreci ne kadar kolaydı? (1-5)
3. Kahvaltı / restoran deneyiminiz nasıldı? (1-5)
4. Personelimizin ilgisi beklentinizi karşıladı mı? (1-5)
5. Tekrar konaklamayı düşünür müsünüz? (0-10)

### 🛒 E-ticaret (4 soru)

1. Ürün açıklamasıyla geleni eşleşti mi? (1-5)
2. Teslimat süresi sizin için uygun muydu? (1-5)
3. Paketleme kalitesi nasıldı? (1-5)
4. Tekrar alışveriş yapma olasılığınız nedir? (0-10)

### 💼 Hizmet / B2B (3 soru)

1. Hizmetimiz beklentilerinizi karşıladı mı? (1-5)
2. İletişim sürecimiz net miydi? (1-5)
3. Bu hizmeti meslektaşınıza tavsiye eder misiniz? (0-10)

### 💆 Kuaför / Güzellik (3 soru)

1. Hizmetinizden memnun kaldınız mı? (1-5)
2. Bekleme süreniz uygun muydu? (1-5)
3. Bizi tekrar tercih eder misiniz? (1-5)

## 5 Anket Şablonu

### Şablon 1 — Mikro NPS (Tek soru, %40+ yanıt oranı)

> Merhaba [İsim], dün bizi tercih ettiğiniz için teşekkürler! Hızlı bir sorumuz var: Bizi bir arkadaşınıza tavsiye etme olasılığınız 0-10 arasında kaçtır?

### Şablon 2 — Standart CSAT (5 soru, 1 dk)

> Değerli müşterimiz, kısa anketimiz yalnızca 60 saniyenizi alacak. Yanıtlarınız hizmetimizi geliştirmemize yardımcı olacak. (5 soru bağlantısı)

### Şablon 3 — Çıkış sonrası (Otel/restoran)

> Ziyaretiniz nasıldı? Bizi 1-5 arası nasıl değerlendirirsiniz? Çok memnun kaldıysanız Google'da yorum bırakır mısınız? [Google linki]

### Şablon 4 — Eleştiri sonrası takip

> Geri bildiriminiz için teşekkürler. Yaşadığınız sorunu çözmek için bize biraz daha detay verebilir misiniz? (3 açık uçlu soru)

### Şablon 5 — Çeyreklik B2B ilişki anketi

> Son 3 ayda hizmetimizden memnun musunuz? Hangi alanları geliştirmemizi istersiniz? (CES + açık uçlu)

## Anket Hazırlarken 5 Kural

1. **5-8 soru.** Daha fazlası tamamlanma oranını çökertir.
2. **Açık uçlu sorular en sonda.** İnsanlar başta motiveyken yazmaz.
3. **Mobil-first.** %70 mobilden açılır; ekranda sığsın.
4. **Tek tıkla başla.** "Anket bağlantısı" değil, ilk soru e-postada gözüksün.
5. **Anonim seçeneği sunun.** Açık ad zorunluysa yanıt %30 düşer.

## Anket Sonuçları → Aksiyon Akışı

| Skor | Eylem |
|---|---|
| NPS 9-10 | Google/Tripadvisor yoruma yönlendir |
| NPS 7-8 | Teşekkür + bir sonraki için ipucu |
| NPS 0-6 | **24 saat içinde** ekip lideri arasın, sorunu çözsün |

AI destekli platformlar açık uçlu yanıtları otomatik kategorize eder ("temizlik", "personel", "fiyat") ve trendleri haftalık rapor olarak gönderir.

## Anket → Google Yorum Dönüşümü

Memnun müşteriyi (9-10 verenler) doğrudan Google yorum linkine yönlendirin. VoyageRespond'un ücretsiz QR kod ve kısa link üretici aracıyla bunu otomatikleştirebilirsiniz.

## İlgili Rehberler

- [Müşteri Memnuniyet Mesajı Örnekleri (50 Şablon)](/blog/musteri-memnuniyet-mesaji-ornekleri)
- [Restoran Müşteri Memnuniyeti Rehberi](/restoran-musteri-memnuniyeti)
- [Müşteri Memnuniyeti Nedir?](/musteri-memnuniyeti)
- [Olumlu Yorum Cevap Örnekleri](/blog/olumlu-yorum-cevap-ornekleri)
`,
  },
  {
    slug: "musteri-memnuniyet-mesaji-ornekleri",
    title: "Müşteri Memnuniyet Mesajı Örnekleri: 50 Hazır Şablon (2026)",
    metaTitle: "Müşteri Memnuniyet Mesajı Örnekleri | 50 Şablon",
    metaDescription:
      "Müşteri memnuniyet mesajı örnekleri: teşekkür, geri bildirim, takip, özür ve teşvik mesajları için 50 hazır şablon. Hemen kopyalayın.",
    description:
      "Restoran, otel ve e-ticaret işletmeleri için müşteri memnuniyet mesajı şablonları — teşekkür, özür, takip, yorum talebi ve teşvik.",
    ogTitle: "Müşteri Memnuniyet Mesajı Örnekleri | 50 Şablon",
    ogDescription:
      "50 hazır müşteri memnuniyet mesajı: SMS, WhatsApp, e-posta ve sosyal medya için sektöre göre uyarlanabilir.",
    author: AUTHOR,
    publishedAt: "2026-06-05",
    updatedAt: UPDATED,
    category: "Müşteri Memnuniyeti",
    readTime: "9 dk",
    keywords: [
      "müşteri memnuniyet mesajı",
      "müşteri memnuniyet mesajları",
      "müşteri memnuniyet sözleri",
      "memnuniyet yazısı örneği",
      "müşteri memnuniyeti cümleleri",
    ],
    faqs: [
      {
        question: "Müşteri memnuniyet mesajı ne zaman gönderilmeli?",
        answer:
          "İdeal zaman hizmet sonrası ilk 24 saattir. Restoranda ödeme sonrası 2 saat, otelde check-out gününde, e-ticarette teslimat gününde gönderilen mesajlar en yüksek yanıt oranını alır.",
      },
      {
        question: "Hangi kanal kullanılmalı: SMS mi e-posta mı WhatsApp mı?",
        answer:
          "Açılma oranı: WhatsApp %98, SMS %95, e-posta %22. Türkiye'de WhatsApp veya SMS çok daha etkilidir. Resmi B2B iletişimde e-posta tercih edilir.",
      },
      {
        question: "Memnun müşteriden Google yorumu nasıl istenir?",
        answer:
          "Önce 1-5 arası mikro memnuniyet sorusu sorun; 4-5 verenleri Google yorum linkine yönlendirin. Aksi halde 1-3 verenler de yoruma giderse ortalama yıldızınız düşer. VoyageRespond bu akışı otomatik yapar.",
      },
      {
        question: "Aynı mesajı herkese göndermek doğru mu?",
        answer:
          "Hayır. Müşterinin adı, sipariş/oda numarası veya bahsettiği ürün gibi en az bir kişisel detay olmalı. Kişiselleştirilmiş mesajlar generic mesajlardan 3x daha çok yanıt alır.",
      },
    ],
    content: `
Müşteri memnuniyet mesajı örnekleri — teşekkür, özür, geri bildirim talebi, sadakat ve yorum daveti için **50 hazır şablon**. Restoran, otel ve e-ticaret için sektörel uyarlamalar; SMS, WhatsApp ve e-posta için optimize edilmiş kısa mesajlar.

## İyi Bir Memnuniyet Mesajı Nasıl Yazılır?

- **Kısa olsun.** SMS için 160 karakter, WhatsApp için 2 satır.
- **İsim kullanın.** "Sayın müşterimiz" değil, "Ayşe Hanım".
- **Spesifik detay olsun.** Sipariş no, oda no, ürün adı, tarih.
- **Tek bir çağrı (CTA) olsun.** "Yorum bırakın" veya "Anketi doldurun" — ikisi birden değil.
- **Mesai saatinde gönderin.** 10:00-19:00 arası 2x yanıt alır.

## 1. Teşekkür Mesajları (10 örnek)

1. Merhaba [İsim], bugün bizi tercih ettiğiniz için teşekkürler! Tekrar bekleriz. 🙏
2. [İsim] Hanım, ziyaretinizden çok mutlu olduk. Görüşmek üzere!
3. Değerli misafirimiz, bizi seçtiğiniz için teşekkür ederiz. İyi günler!
4. Merhaba [İsim], deneyiminiz için teşekkürler! Memnuniyetiniz bizim için her şey demek.
5. [İsim] Bey, bizi tercih etmeniz çok değerli. Yine bekleriz!
6. Sevgili müşterimiz, bugün sizi ağırlamaktan mutluluk duyduk. ☕
7. [İsim], güveniniz için minnettarız. Bir sonraki ziyaretinizde sizi yine ağırlamak isteriz.
8. Merhaba [İsim], hizmetimizi tercih ettiğiniz için teşekkürler. Her geri bildiriminiz bizim için değerli.
9. Değerli müşterimiz, ekibimiz adına teşekkür ederiz. İyi günler dileriz!
10. [İsim] Hanım, bugün sizi ağırlamak güzeldi. Tekrar görüşmek üzere.

## 2. Geri Bildirim Talebi (10 örnek)

11. Merhaba [İsim], deneyiminiz nasıldı? 60 saniyenizi alır: [link]
12. [İsim], 1-5 arasında bize kaç verirsiniz? Yanıtlamak için cevaplayın.
13. Sevgili müşterimiz, hizmetimizi daha iyi yapmamız için fikirleriniz çok değerli: [link]
14. [İsim] Bey, ziyaretiniz beklentilerinizi karşıladı mı? Kısa anketimiz: [link]
15. Merhaba [İsim], sizi 30 saniyelik bir ankete davet ediyoruz. Yanıtlarınız ekibimizi motive ediyor: [link]
16. [İsim], dürüst yorumunuz bizim için bir hediye. Lütfen birkaç dakika ayırın: [link]
17. Değerli misafirimiz, ne iyi gitti, ne daha iyi olabilir? Yanıtlamak için cevaplayın.
18. [İsim] Hanım, kısa bir sorumuz var: Bizi bir arkadaşınıza tavsiye eder misiniz? (0-10)
19. Merhaba [İsim], geri bildiriminiz hizmetimizi geliştiriyor. Anketimiz: [link]
20. [İsim], 1 dakika ayırırsanız çok seviniriz: [link]

## 3. Olumlu Yorum Talebi (10 örnek)

21. Merhaba [İsim], ziyaretinizi beğendiyseniz Google'da yorum bırakır mısınız? [link]
22. [İsim] Hanım, deneyiminizi diğer müşterilerimizle paylaşır mısınız? [Google linki]
23. Sevgili müşterimiz, memnun kaldıysanız 30 saniyenizi rica edelim: [Google linki]
24. [İsim], güzel sözleriniz başkalarına yol göstersin: [yorum linki]
25. Merhaba [İsim], hizmetimizi sevdiyseniz bir yorum bırakmanız bize çok güç verir: [link]
26. [İsim] Bey, dürüst değerlendirmeniz bizim için altın değerinde: [Google linki]
27. Sevgili misafirimiz, deneyiminizi anlatır mısınız? Tek tıkla: [link]
28. [İsim], Google'da bir yorum kahvaltı tabağı kadar mutlu eder bizi. 😊 [link]
29. Merhaba [İsim], kısa bir yorum yazarsanız ekibimizin günü güzel başlar: [link]
30. [İsim], memnuniyetinizi paylaşır mısınız? [Google linki]

## 4. Özür Mesajları (10 örnek)

31. Sayın [İsim], yaşadığınız deneyim için samimiyetle özür dileriz. Lütfen bize ulaşın: [iletişim]
32. [İsim] Hanım, sizi üzdüğümüz için çok üzgünüz. Konuyu çözmek istiyoruz, bize 5 dakika ayırır mısınız?
33. Değerli müşterimiz, geri bildiriminizi aldık. Sorunu hemen ekibimize ilettik. Sizinle ayrıca iletişime geçeceğiz.
34. [İsim], beklentilerinizi karşılayamamak bizi de üzdü. Telafi etmek için bize bir şans verir misiniz?
35. Sevgili misafirimiz, yaşadıklarınız için çok özür dileriz. Lütfen bizi [tel] üzerinden arayın.
36. [İsim] Bey, sorunu öğrendiğimiz için minnettarız ve gerekli aksiyonu aldık. Bir sonraki ziyaretinizde farkı göreceksiniz.
37. Merhaba [İsim], bu deneyim standartlarımızın altında. Sizi gerçekten dinlemek istiyoruz: [iletişim]
38. Değerli müşterimiz, yanlışımızı kabul ediyor ve özür diliyoruz. Telafi için size özel teklif sunmak isteriz.
39. [İsim], geri bildiriminiz değişim için bir fırsat. Konuyu bizzat takip ediyorum. — [Yönetici]
40. Sayın [İsim], yaşadıklarınız için samimiyetle özür dileriz. Bir sonraki ziyaretinize özel hazırlık yaptık.

## 5. Sadakat / Teşvik Mesajları (10 örnek)

41. [İsim], bugün size özel %15 indirim! Kod: TEKRAR15
42. Merhaba [İsim], 3. ziyaretinizde tatlı ikram. Sizi bekliyoruz!
43. Sevgili [İsim], doğum gününüz yaklaşıyor. Size özel sürprizimiz var: [link]
44. [İsim] Hanım, sizi özlüyoruz! Bu hafta sonu özel menümüz var.
45. Değerli misafirimiz, sadakat programımıza katılmak ister misiniz? Avantajlar: [link]
46. [İsim], son ziyaretinizden bu yana yeni lezzetlerimiz var. Denemek için: [link]
47. Merhaba [İsim], bu hafta sizin için özel bir kampanyamız var! Detaylar: [link]
48. [İsim], birinci yıl dönümümüzde sizi unutmadık. Hediyenizi almak için: [link]
49. Sevgili müşterimiz, sezonun yeni koleksiyonu yayında! İlk siz görün: [link]
50. [İsim] Hanım, sizi tekrar ağırlamak için sabırsızlanıyoruz. Rezervasyon: [link]

## Kanal Bazlı Karşılaştırma

| Kanal | Açılma | Tavsiye |
|---|---|---|
| WhatsApp | %98 | Yorum talebi, takip |
| SMS | %95 | Teşekkür, kısa anket |
| E-posta | %22 | Detaylı anket, kampanya |
| Push notification | %40 | Sadakat hatırlatma |

## Otomatikleştirme

50 mesajı manuel yazmak yerine, **müşteri yolculuğunun** her aşamasına bir mesaj eşleştirip otomatik tetiklenmesini sağlayabilirsiniz: ödeme → teşekkür, 2 saat sonra → anket, 4-5 puan → yorum talebi, 1-3 puan → özür + telefon. VoyageRespond bu akışı kuran AI destekli yorum yönetim platformudur.

## İlgili Rehberler

- [Müşteri Memnuniyet Anketi Örnekleri](/blog/musteri-memnuniyet-anketi-ornekleri)
- [Restoran Müşteri Memnuniyeti Rehberi](/restoran-musteri-memnuniyeti)
- [Müşteri Memnuniyeti Nedir?](/musteri-memnuniyeti)
- [Olumlu Yorum Cevap Örnekleri](/blog/olumlu-yorum-cevap-ornekleri)
`,
  },
];