export interface PlatformSection {
  id: string;
  heading: string;
  paragraphs: string[];
  bullets?: string[];
}

export interface PlatformFAQ {
  question: string;
  answer: string;
}

export interface PlatformLandingContent {
  slug: string;
  platformName: string;
  emoji: string;
  badgeText: string;
  metaTitle: string;
  metaDescription: string;
  h1: string;
  intro: string;
  sections: PlatformSection[];
  faqs: PlatformFAQ[];
  relatedSlugs: string[];
}

export const platformLandingPages: PlatformLandingContent[] = [
  {
    slug: "google-yorumlari-icin-yapay-zeka",
    platformName: "Google Yorumları",
    emoji: "⭐",
    badgeText: "Google Reviews · AI",
    metaTitle: "Google Yorumları için Yapay Zeka: Otomatik Cevaplama & Yönetim",
    metaDescription: "Google işletme yorumlarına yapay zeka ile saniyeler içinde marka uyumlu cevap yazın. Otomatik moderasyon, çoklu lokasyon ve duygu analizi tek panelde.",
    h1: "Yapay zeka ile Google yorumlarını yönet: Otomatik cevaplar, moderasyon ve marka sesi",
    intro:
      "Google Haritalar üzerinden 50 yıldız aldınız ama hiçbirine cevap veremediniz. Klasik tablo. Google İşletme Profili (eski adıyla GMB), arama sonuçlarında dönüşüm yaratan en güçlü kanal — ancak her yoruma manuel cevap yazmak günlük 1-2 saat alıyor. Yapay zeka destekli yorum yönetimi, Google yorumlarınızı tek panelden toplar, marka sesinde yanıt önerir ve siz onaylayınca anında yayınlar.",
    sections: [
      {
        id: "neden-onemli",
        heading: "Google yorumları işletmeniz için neden bu kadar kritik?",
        paragraphs: [
          "Google'da \"yakınımdaki [kategori]\" araması yapan kullanıcının %88'i ilk olarak yıldızlara ve son 5 yoruma bakar. Yorum sayısı ve cevap oranı, Google'ın yerel arama (Local Pack) sıralamasındaki üç ana faktörden biridir.",
          "Google'a göre cevaplanmış yorumlar, cevaplanmamışlara kıyasla işletmeyi %1.7 kat daha güvenilir gösteriyor. Yani sadece yıldız değil, sizin verdiğiniz yanıt da dönüşümü etkiliyor.",
        ],
      },
      {
        id: "google-business-profile-eksikleri",
        heading: "Google Business Profile'ın yapabildikleri ve yetmediği noktalar",
        paragraphs: [
          "Google'ın kendi panelinden yorum cevaplayabilirsiniz, ama özellikler çok temel. Marka tonu, çoklu lokasyon, otomasyon, duygu etiketi — hiçbiri yok.",
        ],
        bullets: [
          "Marka sesi yok: Google sadece boş bir kutucuk verir, ton ve tarz tamamen size kalır.",
          "Çoklu lokasyon karmaşası: 5 şubeniz varsa 5 farklı paneli açıp kapamanız gerekir.",
          "Öncelik etiketi yok: \"Berbat, paramı geri istiyorum\" ile \"Harika!\" yorumu aynı listeye düşer.",
          "Bildirim gecikmesi: Yeni yorum geldiğinde bildirim 24-72 saat gecikebilir.",
          "Çok dilli destek zayıf: Yabancı turist yorumlarına manuel çeviri yapmak zorundasınız.",
        ],
      },
      {
        id: "ai-nasil-calisir",
        heading: "Yapay zeka destekli Google yorum yönetimi nasıl çalışır?",
        paragraphs: [
          "VoyageRespond gibi araçlar, Google İşletme Profili API'si üzerinden hesabınıza güvenli OAuth ile bağlanır. Tüm yorumlarınız tek panele akar — geçmiş 2.500 yoruma kadar otomatik içe aktarılır.",
          "Yapay zeka her yorumu okuyup duygu (pozitif/nötr/negatif), niyet (övgü, şikayet, soru) ve dile göre etiketler. Sonra sizin geçmiş cevaplarınızı ve marka tonunuzu öğrenerek 3 farklı yanıt önerisi üretir.",
          "İki mod seçebilirsiniz: Manuel onay (her yanıtı tek tıkla göndermek) veya tam otomatik (pozitif yorumlar için anında, negatif için sizin onayınıza). Güvenli ve geri dönüşü mümkün.",
        ],
      },
      {
        id: "marka-sesi",
        heading: "Marka sesinde yapay zeka yanıtları",
        paragraphs: [
          "Google'ın \"Smart Reply\" önerisi genelden öteye geçmez: \"Teşekkür ederiz!\" gibi tek satırlık şablonlar. VoyageRespond, sizin geçmiş cevaplarınızı, web sitenizi ve menü/oda bilgilerinizi analiz ederek size özgü 8 farklı tonda (friendly, formal, witty, empatik...) öneri üretir.",
          "Misafirin adı, konaklama tarihi, övdüğü detay — hepsi yanıta otomatik girer. Sonuç: 30 saniyede yazılmış gibi değil, sizin ekibinizden çıkmış gibi okunan profesyonel yanıtlar.",
        ],
      },
      {
        id: "otomatik-moderasyon",
        heading: "Otomatik moderasyon ve negatif yorum uyarısı",
        paragraphs: [
          "Google'da bir yıldızlık yorum geldiğinde her saniye önemli. VoyageRespond, 1-2 yıldız yorumları geldiği an e-posta veya Slack ile sizi uyarır, hazır empati dolu bir yanıt önerisi getirir.",
          "Spam, rakip sabotajı ya da TOS ihlali içeren yorumlar için Google'a kaldırma talebi şablonu da üretir — sürecin başından sonuna kadar AI yanınızda.",
        ],
      },
      {
        id: "cok-lokasyon",
        heading: "Çoklu lokasyon ve duygu analizi",
        paragraphs: [
          "Zincir bir restoran ya da otel grubu yönetiyorsanız her şubenin Google panelini ayrı ayrı açmak imkansız. VoyageRespond tüm lokasyonları tek dashboard'da gösterir; lokasyon bazlı ortalama puan, cevap oranı ve duygu trendi raporlanır.",
          "Yöneticiniz haftalık raporda \"Çamlıca şubesinde temizlik şikayetleri %40 arttı\" gibi içgörüleri otomatik görür. Manuel Excel çıkartmaya gerek yok.",
        ],
      },
      {
        id: "nasil-baslarim",
        heading: "Yapay zeka destekli Google yorum yönetimine nasıl başlarsınız?",
        paragraphs: [
          "Süreç tek seferlik 5 dakika sürer:",
        ],
        bullets: [
          "1. Google ile bağlan: Google İşletme Profili hesabınızı OAuth ile yetkilendirin. VoyageRespond geçmiş tüm yorumlarınızı otomatik içe aktarır.",
          "2. Marka sesinizi eğitin: İşletme adınızı, kategorinizi, ton tercihinizi seçin. AI 1 saatte sizin gibi yazmaya başlar.",
          "3. Otomasyonlar kurun: 4-5 yıldız → otomatik teşekkür, 1-2 yıldız → uyarı + öneri.",
          "4. Test edip ölçeklendirin: 1 hafta manuel onayla başlayın, sonra güven geldikçe otomasyonu artırın.",
        ],
      },
    ],
    faqs: [
      {
        question: "Yapay zeka Google yorumlarına gerçekten benim yerime cevap verebilir mi?",
        answer:
          "Evet, ama daima sizin kontrolünüzde. VoyageRespond geçmiş yanıtlarınızdan öğrenir ve marka tonunuzda 3 öneri sunar. Onaylar onaylamaz Google API üzerinden anında yayınlanır. İsterseniz tamamen otomatik, isterseniz tek tıkla onay modunda çalışabilir.",
      },
      {
        question: "Google İşletme Profili API entegrasyonu güvenli mi?",
        answer:
          "Evet. VoyageRespond, Google'ın resmi OAuth 2.0 akışını kullanır; şifrenizi hiçbir zaman almaz. Tüm yetkileri istediğiniz an Google hesap ayarlarınızdan iptal edebilirsiniz. Verileriniz Lovable Cloud altyapısında şifreli olarak saklanır.",
      },
      {
        question: "Negatif Google yorumlarını silebilir miyim?",
        answer:
          "Yorumları siz silemezsiniz, ancak Google politikalarına aykırı yorumlar (spam, hakaret, alakasız içerik) için kaldırma talebi açabilirsiniz. VoyageRespond bu süreç için otomatik şablon ve takip ekranı sağlar.",
      },
      {
        question: "Çoklu lokasyon (zincir işletme) destekleniyor mu?",
        answer:
          "Evet, en güçlü kullanım senaryosu bu. 5'den 500'e kadar şubeyi tek panelde yönetebilirsiniz. Her lokasyon için ayrı puan, ayrı cevap oranı ve karşılaştırmalı raporlar gösterilir.",
      },
      {
        question: "Türkçe dışındaki dillere yapay zeka cevap verebiliyor mu?",
        answer:
          "Evet. Yorumun dili otomatik tespit edilir; Türkçe, İngilizce, Almanca, Rusça, Fransızca dahil 15+ dilde marka tonunuza uygun yanıt üretilir. Özellikle turistik bölgelerdeki oteller için kritik.",
      },
    ],
    relatedSlugs: ["instagram-yorumlari-icin-yapay-zeka", "tripadvisor-yorumlari-icin-yapay-zeka", "booking-yorumlari-icin-yapay-zeka"],
  },
  {
    slug: "instagram-yorumlari-icin-yapay-zeka",
    platformName: "Instagram Yorumları",
    emoji: "📸",
    badgeText: "Instagram · AI",
    metaTitle: "Instagram Yorumları için Yapay Zeka: Otomatik Cevap & Moderasyon",
    metaDescription: "Instagram gönderi ve reels yorumlarını yapay zeka ile yönetin. Spam koruması, marka sesinde cevap önerileri ve duygu analizi tek panelde.",
    h1: "Instagram yorumlarını yapay zeka ile yönet: Marka uyumlu cevaplar ve otomatik moderasyon",
    intro:
      "Bir reels viral oldu, 2.000 yorum geldi. İçinde hayran mesajları, fiyat soruları, troll'ler ve sahte çekiliş spam'leri var. Instagram'ın kendi paneli bu hacimle başa çıkmıyor. Yapay zeka destekli yorum yönetimi, Instagram yorumlarınızı önceliklendirir, marka sesinde 3 yanıt önerir ve spam'i otomatik gizler.",
    sections: [
      {
        id: "neden-onemli",
        heading: "Instagram yorumları markanız için neden önemli?",
        paragraphs: [
          "Instagram algoritması etkileşimi ödüllendirir: yorumlanan ve cevaplanan gönderiler Keşfet sayfasında 3-4 kat daha fazla görünür. Yanıtladığınız her yorum erişiminizi büyütür.",
          "Aynı zamanda alıcı niyetli yorumlar (\"fiyat?\", \"hâlâ stokta mı?\", \"link?\") gerçek müşteri sorularıdır. Geç cevap = kaybedilmiş satış.",
        ],
      },
      {
        id: "instagram-eksikleri",
        heading: "Instagram'ın yerel araçlarının yetmediği noktalar",
        paragraphs: [
          "Instagram, Meta Business Suite üzerinden basit cevap özelliği sunar ama markaya özel hiçbir akıllı katman içermez.",
        ],
        bullets: [
          "Marka sesi eğitimi yok — her şablonu sıfırdan yazarsınız.",
          "Eski gönderilere giden yorumlar kaybolur; akış yalnızca son 24 saati gösterir.",
          "Spam ve hate-speech otomatik gizlenmez; tek tek elle silmek gerekir.",
          "Çoklu hesap (markalar / lokasyonlar) için ayrı panel açmak şarttır.",
          "DM ile yorumlar tek görünümde birleşmez.",
        ],
      },
      {
        id: "ai-nasil-calisir",
        heading: "Yapay zeka ile Instagram yorum yönetimi nasıl çalışır?",
        paragraphs: [
          "VoyageRespond, Instagram Graph API'si üzerinden hesabınıza bağlanır. Tüm gönderi, reels ve story yorumları tek akışa düşer. AI her yorumu duygu, niyet (övgü/şikayet/satın alma niyeti) ve dile göre etiketler.",
          "Satın alma niyetli yorumlar otomatik en üste alınır, troll yorumlar gizlenir, övgülere kısa teşekkürler otomatik gönderilir. Siz sadece gerçekten önemli olanlara odaklanırsınız.",
        ],
      },
      {
        id: "marka-sesi",
        heading: "Marka sesinde 3 yanıt önerisi",
        paragraphs: [
          "Yapay zeka geçmiş yorum-cevap geçmişinizden, ürün katalogunuzdan ve web sitenizden öğrenir. Her gelen yorum için 3 farklı tonda (friendly, witty, professional) öneri çıkarır.",
          "Tek tıkla onaylayıp yayınlayabilir, ya da düzenleyip kişiselleştirebilirsiniz. Ortalama yanıt süresi 5-10 dakikadan 5-10 saniyeye düşer.",
        ],
      },
      {
        id: "spam-koruma",
        heading: "Otomatik spam koruması ve troll moderasyonu",
        paragraphs: [
          "Sahte çekiliş bağlantıları, takipçi botları, küfür ve hate-speech otomatik gizlenir. \"DM atın\" türevli spam kalıpları AI tarafından öğrenilir ve markanız adına engellenir.",
          "Yapıcı eleştiri ile troll farklı kategorize edilir — kontrol her zaman sizde, AI sadece zaman kazandırır.",
        ],
      },
    ],
    faqs: [
      {
        question: "Instagram API üzerinden cevap yazmak hesabımı riske sokar mı?",
        answer:
          "Hayır. VoyageRespond, Meta'nın resmi Instagram Graph API'sini kullanır. Tarayıcı botu, scraping veya 3. parti extension değil; tamamen Meta onaylı entegrasyon. Hesabınız risk altında değildir.",
      },
      {
        question: "Reels ve story yorumlarına da cevap veriyor mu?",
        answer:
          "Evet. Tüm gönderi formatları (post, reels, story, IGTV) tek akışta birleşir ve aynı AI motoru üzerinden yönetilir.",
      },
      {
        question: "Spam yorumları nasıl tespit ediyorsunuz?",
        answer:
          "AI, link içeren yorumları, takipçi-bot kalıplarını, sahte çekiliş ifadelerini ve hate-speech'i çoklu sinyalle tespit eder. Yanlış pozitifleri minimize etmek için karar verilen her yorum incelenebilir log'a düşer.",
      },
      {
        question: "Birden fazla Instagram hesabımı bağlayabilir miyim?",
        answer:
          "Evet. Tek VoyageRespond hesabıyla sınırsız Instagram profili bağlayabilirsiniz; tüm markalar tek dashboard'da görünür.",
      },
    ],
    relatedSlugs: ["tiktok-yorumlari-icin-yapay-zeka", "facebook-yorumlari-icin-yapay-zeka", "google-yorumlari-icin-yapay-zeka"],
  },
  {
    slug: "tripadvisor-yorumlari-icin-yapay-zeka",
    platformName: "TripAdvisor Yorumları",
    emoji: "🦉",
    badgeText: "TripAdvisor · AI",
    metaTitle: "TripAdvisor Yorumları için Yapay Zeka: Otomatik Cevap & Analiz",
    metaDescription: "TripAdvisor otel ve restoran yorumlarına yapay zeka ile çoklu dilde profesyonel yanıt yazın. Negatif yorum uyarısı ve duygu analizi.",
    h1: "Yapay zeka ile TripAdvisor yorumlarını yönet: Çok dilli cevaplar ve negatif uyarılar",
    intro:
      "TripAdvisor, otel ve restoran sıralamalarında dünyanın en güvenilir platformu — ama yönetici paneli 2010'lardan kalma. Her yoruma manuel cevap yazmak, üstelik İngilizce/Rusça/Almanca turist yorumlarını çevirmek bir personel-saat işi. Yapay zeka destekli yorum yönetimi, TripAdvisor yorumlarınızı tek panelden, çoklu dilde, marka sesinde yanıtlar.",
    sections: [
      {
        id: "neden-onemli",
        heading: "TripAdvisor neden hâlâ rezervasyonları belirliyor?",
        paragraphs: [
          "TripAdvisor, dünyada otel ve restoran araştırmasının %58'inde başlangıç noktası. Travelers' Choice ödülleri, Booking.com'daki konversiyonu bile etkiler.",
          "Yönetici cevap oranı, TripAdvisor'ın popülerlik sıralamasına (Popularity Index) doğrudan girer. Cevap yazmayan otel her gün rakiplerine yer kaybediyor.",
        ],
      },
      {
        id: "tripadvisor-zorluklari",
        heading: "TripAdvisor yönetiminin gizli zorlukları",
        paragraphs: [
          "TripAdvisor'ın resmi API'si oldukça kısıtlı; cevap göndermek için yönetici panelini açmanız gerekir. Bu da otomasyonu zorlaştırır.",
        ],
        bullets: [
          "Cevap yazma alanı yalnızca yönetici paneli üzerinden açıktır — toplu yanıt yok.",
          "Çoklu dil zorunluluğu: Türkiye'de bir otelin %60 yorumu Rusça veya İngilizcedir.",
          "Negatif yorum görünür yerde 1 yıl kalır; hızlı, empati dolu yanıt şart.",
          "Booking.com / Google yorumlarıyla aynı dashboard'da görmek mümkün değildir.",
        ],
      },
      {
        id: "ai-nasil-calisir",
        heading: "Yapay zeka ile TripAdvisor yorum yönetimi nasıl çalışır?",
        paragraphs: [
          "VoyageRespond TripAdvisor sayfanızı hibrit bir scraper + AI motoruyla 6 saatte bir günceller. Tüm yeni yorumlar Google ve Booking yorumlarınızla aynı panele düşer.",
          "Her yorum için marka tonunda, yorumun yazıldığı dilde 3 cevap önerisi üretilir. Tek tıkla kopyalayıp TripAdvisor paneline yapıştırırsınız (Copy & Confirm pattern) — bu yöntem TripAdvisor'ın TOS'una %100 uyumludur.",
        ],
      },
      {
        id: "cok-dilli",
        heading: "Çok dilli cevap üretimi: Rusça, Almanca, İngilizce",
        paragraphs: [
          "Antalya'daki bir otelin TripAdvisor yorumları çoğunlukla Rusça ve Almanca. Manuel çeviri saatler alıyor. AI, yorumun dilini otomatik tespit eder ve aynı dilde marka sesinde yanıt üretir.",
          "Kültürel nüanslar da öğrenilir: Alman misafire formal, Rus misafire daha sıcak ton otomatik uygulanır.",
        ],
      },
      {
        id: "negatif-uyari",
        heading: "Negatif yorum erken uyarı sistemi",
        paragraphs: [
          "1-2 yıldız yorum geldiği an e-posta uyarısı alırsınız. AI yorumu analiz eder, ana şikayeti çıkarır (\"klima çalışmıyor\", \"oda kötü kokuyordu\") ve empati + somut çözüm içeren bir yanıt taslağı hazırlar.",
          "Hızlı yanıt = TripAdvisor'da olası downgrade'in önüne geçer ve diğer ziyaretçilere sorunu sahiplenen profesyonel bir işletme imajı verir.",
        ],
      },
    ],
    faqs: [
      {
        question: "TripAdvisor cevaplarımı otomatik gönderebilir misiniz?",
        answer:
          "TripAdvisor cevap göndermek için resmi API açmadığından, VoyageRespond \"Copy & Confirm\" akışı kullanır: AI yanıtınızı hazırlar, tek tıkla kopyalayıp TripAdvisor paneline yapıştırırsınız. Bu yöntem TripAdvisor TOS'una tam uyumludur.",
      },
      {
        question: "Eski yorumlarımı da içe aktarabilir misiniz?",
        answer:
          "Evet. İlk bağlantıda son 2 yıla kadar tüm yorumlar otomatik içe aktarılır ve duygu analizine girer. Cevaplanmamış eski yorumlara da yanıt önerisi üretilir.",
      },
      {
        question: "Rusça ve Almanca yorumlara nasıl cevap veriyorsunuz?",
        answer:
          "AI yorumun dilini otomatik tespit eder ve aynı dilde, marka tonunuza uygun yanıt önerir. Türkçe, İngilizce, Almanca, Rusça, Fransızca, İtalyanca, İspanyolca dahil 15+ dil desteklenir.",
      },
      {
        question: "TripAdvisor + Google + Booking aynı panelde mi?",
        answer:
          "Evet. VoyageRespond'ın temel avantajı tüm OTA ve arama platformlarını tek dashboard'da birleştirmesi. Lokasyon bazlı tek puan, tek cevap oranı, tek rapor.",
      },
    ],
    relatedSlugs: ["booking-yorumlari-icin-yapay-zeka", "google-yorumlari-icin-yapay-zeka", "otelpuan-yorumlari-icin-yapay-zeka"],
  },
  {
    slug: "booking-yorumlari-icin-yapay-zeka",
    platformName: "Booking.com Yorumları",
    emoji: "🛏️",
    badgeText: "Booking.com · AI",
    metaTitle: "Booking.com Yorumları için Yapay Zeka: Otomatik Cevap & Yönetim",
    metaDescription: "Booking.com misafir yorumlarına yapay zeka ile çoklu dilde, marka sesinde profesyonel cevap. Negatif uyarı, duygu analizi ve raporlama.",
    h1: "Yapay zeka ile Booking.com yorumlarını yönet: Otomatik cevap, çok dilli ve markaya özel",
    intro:
      "Booking.com dünya çapında otel rezervasyonlarının %40'ını yönlendiriyor. Misafir yorumları arama sıralamasını ve dönüşümü doğrudan etkiliyor. Ancak Booking yönetici paneli (Extranet) toplu cevap, marka sesi ya da çoklu dil otomasyonu sunmuyor. Yapay zeka destekli yorum yönetimi, Booking yorumlarınızı tek panelden, marka tonunda ve çoklu dilde yanıtlar.",
    sections: [
      {
        id: "neden-onemli",
        heading: "Booking yorumları rezervasyonu nasıl etkiliyor?",
        paragraphs: [
          "Booking'in iç verisine göre, yönetici cevap oranı %80'in üzerinde olan oteller %15 daha fazla rezervasyon dönüşümü görüyor.",
          "Booking ranking algoritması cevap hızını ve sıklığını da değerlendiriyor — \"Genius\" rozetli oteller arasında bile yorum cevap oranı sıralama avantajı sağlıyor.",
        ],
      },
      {
        id: "extranet-eksikleri",
        heading: "Booking Extranet'in yorum yönetimindeki sınırları",
        paragraphs: [
          "Extranet sade ama temel: yorum gelir, cevap kutusu açılır, yazarsınız. Bunun ötesi yok.",
        ],
        bullets: [
          "Toplu cevap özelliği yok — her yoruma tek tek girmek gerekir.",
          "Marka sesi eğitimi yok.",
          "Çoklu lokasyon zincirde yöneticiler her şube için ayrı oturum açar.",
          "Geçmiş yanıtlar üzerinde analiz / öğrenme yok.",
          "Negatif yorumlar için anlık uyarı yok; e-posta bildirimi sık sık gecikir.",
        ],
      },
      {
        id: "ai-nasil-calisir",
        heading: "Yapay zeka ile Booking yorum yönetimi nasıl çalışır?",
        paragraphs: [
          "VoyageRespond Booking sayfanızı bir aggregator scraper üzerinden 6 saatte bir günceller. Tüm yeni yorumlar tek panele akar, AI duygu + dile göre etiketler.",
          "Cevap üretimi marka sesinde yapılır; misafirin dilinde, ismiyle ve övdüğü/şikayet ettiği spesifik detayla. AI üç farklı ton önerir; sizden onay alınca Extranet'e kopyalanır.",
        ],
      },
      {
        id: "cok-dilli",
        heading: "Çok dilli cevap: Rusça, Almanca, İngilizce desteği",
        paragraphs: [
          "Booking yorumlarının %70'i yabancı dilde gelir. Manuel çeviri imkansız hâle gelir. AI yorumun dilini otomatik tespit eder, aynı dilde profesyonel yanıt üretir.",
          "Kültürel ton farkları da dikkate alınır — formal Alman, sıcak İtalyan, doğrudan Rus üslubu.",
        ],
      },
      {
        id: "otomatik-rapor",
        heading: "Lokasyon bazlı haftalık AI raporları",
        paragraphs: [
          "Her hafta her şube için ayrı bir AI raporu: ortalama puan, cevap oranı, ana şikayet temaları, rakip karşılaştırma. Yöneticiniz Pazartesi sabahı e-postasında bulur.",
          "\"Çamlıca: kahvaltı kalitesi şikayetleri %30 arttı, harekete geçin\" gibi aksiyon önerileri otomatik üretilir.",
        ],
      },
    ],
    faqs: [
      {
        question: "Booking.com cevap göndermeyi otomatik yapabiliyor musunuz?",
        answer:
          "Booking.com Extranet üzerinden 3. parti otomatik cevap göndermeye izin vermez. VoyageRespond \"Copy & Confirm\" akışı kullanır: AI yanıtınızı hazırlar, tek tıkla Extranet'e kopyalarsınız. Bu yaklaşım Booking TOS'una tam uyumludur.",
      },
      {
        question: "Hangi diller destekleniyor?",
        answer:
          "Türkçe, İngilizce, Almanca, Rusça, Fransızca, İspanyolca, İtalyanca, Felemenkçe, Arapça dahil 15+ dilde otomatik tespit ve yanıt üretimi yapılır.",
      },
      {
        question: "Geçmiş Booking yorumlarımı da içe aktarabilir miyim?",
        answer:
          "Evet. İlk bağlantıda son 2 yıla kadar tüm yorumlar duygu analizi ve raporlama için içe aktarılır.",
      },
      {
        question: "Çoklu otel / zincir destekleniyor mu?",
        answer:
          "Evet, en güçlü kullanım senaryosu zincir oteller. Tüm lokasyonlar tek dashboard, lokasyon bazlı raporlar ve karşılaştırma sunulur.",
      },
    ],
    relatedSlugs: ["tripadvisor-yorumlari-icin-yapay-zeka", "google-yorumlari-icin-yapay-zeka", "hotelscom-yorumlari-icin-yapay-zeka"],
  },
  {
    slug: "tiktok-yorumlari-icin-yapay-zeka",
    platformName: "TikTok Yorumları",
    emoji: "🎵",
    badgeText: "TikTok · AI",
    metaTitle: "TikTok Yorumları için Yapay Zeka: Otomatik Cevap & Etkileşim",
    metaDescription: "TikTok video yorumlarına yapay zeka ile saniyeler içinde marka sesinde yanıt. Spam koruması, etiketli video keşfi ve duygu analizi.",
    h1: "TikTok yorumlarını yapay zeka ile yönet: Etkileşim, moderasyon ve marka sesi",
    intro:
      "TikTok'ta bir video viral olduğunda 1 saatte 5.000 yorum gelir. Soru, övgü, troll, sahte çekiliş — hepsi karışık. TikTok'un kendi panelinden tek tek cevap vermek imkansız. Yapay zeka destekli yorum yönetimi, TikTok yorumlarını önceliklendirir, marka sesinde 3 yanıt önerir ve etiketli video keşfi yapar.",
    sections: [
      {
        id: "neden-onemli",
        heading: "TikTok yorumları neden algoritma için kritik?",
        paragraphs: [
          "TikTok algoritması yorum sayısı ve özellikle yorum-cevap etkileşimini güçlü bir sinyal olarak kullanır. Yanıtladığınız her yorum videonun For You Page'te daha fazla görünmesini sağlar.",
          "TikTok'ta video ömrü Instagram'a göre çok daha uzundur; 3 ay önceki bir video bile hâlâ yorum üretir. Bu yorumları yönetmek = sürekli erişim büyütmek.",
        ],
      },
      {
        id: "tiktok-eksikleri",
        heading: "TikTok'un yerel araçlarının yetmediği noktalar",
        paragraphs: [
          "TikTok'un işletme paneli temel moderasyon sunar, ama büyük markalar için yetersiz.",
        ],
        bullets: [
          "Marka sesi yok — her cevap manuel yazılır.",
          "Etiketli (mentioned) video keşfi yok — markanızdan bahseden videoları bulamazsınız.",
          "Duygu/etiket sistemi yok.",
          "Çoklu hesap yönetimi zayıf.",
          "Spam botları gerçek zamanlı engellenemez.",
        ],
      },
      {
        id: "ai-nasil-calisir",
        heading: "Yapay zeka ile TikTok yorum yönetimi nasıl çalışır?",
        paragraphs: [
          "VoyageRespond TikTok hesabınıza resmi OAuth üzerinden bağlanır. Tüm video yorumlarınız tek panele akar. AI her yorumu intent (övgü, soru, satın alma, troll) ve duyguya göre etiketler.",
          "3 farklı tonda (friendly, witty, professional) yanıt önerisi üretilir; siz onaylayınca resmi API üzerinden yayınlanır.",
        ],
      },
      {
        id: "etiketli-video",
        heading: "Etiketli video keşfi: markanızdan bahseden tüm içerik",
        paragraphs: [
          "VoyageRespond ek olarak Apify destekli bir keşif motoruyla markanızdan bahseden ya da otelinizi etiketleyen videoları otomatik bulur. Hashtag, mention ve anahtar kelime taranır.",
          "AI bu videoların yorumlarına bile uygun yanıt önerir (manuel mod, copy & confirm).",
        ],
      },
    ],
    faqs: [
      {
        question: "TikTok hesabımı bağlamak güvenli mi?",
        answer:
          "Evet. VoyageRespond TikTok'un resmi Developer API'sini ve OAuth 2.0 akışını kullanır. Şifreniz hiç alınmaz; tüm yetkileri istediğiniz an iptal edebilirsiniz.",
      },
      {
        question: "Başka kullanıcıların videolarındaki yorumlara cevap verebilir miyim?",
        answer:
          "TikTok API yalnızca kendi videolarınıza cevap göndermeye izin verir. Başkalarının videolarındaki sizden bahseden yorumlar için AI yanıt önerir; manuel copy & confirm akışı kullanılır.",
      },
      {
        question: "Spam yorumları nasıl tespit ediliyor?",
        answer:
          "AI link, takipçi-bot kalıpları, sahte çekiliş ifadeleri, hate-speech ve troll patternlerini çoklu sinyalle tespit eder. Her karar log'a düşer; yanlış pozitifleri inceleyebilirsiniz.",
      },
      {
        question: "Birden fazla TikTok hesabımı bağlayabilir miyim?",
        answer:
          "Evet. Tek VoyageRespond hesabıyla sınırsız TikTok profili bağlanabilir, hepsi tek dashboard'da görünür.",
      },
    ],
    relatedSlugs: ["instagram-yorumlari-icin-yapay-zeka", "youtube-yorumlari-icin-yapay-zeka", "facebook-yorumlari-icin-yapay-zeka"],
  },
  {
    slug: "yorumlara-yapay-zeka-ile-cevap-yazma",
    platformName: "Tüm Platformlar",
    emoji: "🤖",
    badgeText: "Tüm Platformlar · AI",
    metaTitle: "Yorumlara Yapay Zeka ile Cevap Yazma: Otomatik & Marka Uyumlu",
    metaDescription: "Google, Booking, TripAdvisor, Instagram, TikTok yorumlarına yapay zeka ile saniyeler içinde marka sesinde otomatik cevap. Tek panel, tüm platformlar.",
    h1: "Yorumlara yapay zeka ile cevap yazma: Tek panelden tüm platformları yönetin",
    intro:
      "İşletmenizin yorumları Google'da, Instagram'da, TikTok'ta, Booking'de, TripAdvisor'da — her platformda ayrı panel, ayrı şifre, ayrı format. Her yoruma manuel cevap yazmak günlük 2-3 saat alıyor. Yapay zeka destekli yorum yönetimi, tüm platformları tek panelde birleştirir, her yoruma marka sesinde 3 yanıt önerir, siz onaylayınca anında yayınlar.",
    sections: [
      {
        id: "neden",
        heading: "Neden yapay zeka ile yorum cevaplama?",
        paragraphs: [
          "Müşterilerin %93'ü yıllık olarak online yorum okuyor; %88'i yorum cevaplarına da bakıyor. Yanıt vermemek = potansiyel müşteri kaybı.",
          "Manuel cevap yazmak her yorum için 5-10 dakika. Günde 30 yorum alan bir işletme için 3+ saat. AI bunu 30 saniyeye indirir, üstelik tutarlı marka tonu sağlar.",
        ],
      },
      {
        id: "platformlar",
        heading: "Hangi platformlar destekleniyor?",
        paragraphs: [
          "VoyageRespond, resmi API ve hibrit scraper kombinasyonuyla en yaygın 10+ platformu tek panelde birleştirir.",
        ],
        bullets: [
          "Google İşletme Profili (resmi OAuth)",
          "Booking.com (Copy & Confirm)",
          "TripAdvisor (Copy & Confirm)",
          "Instagram (Graph API)",
          "TikTok (Developer API)",
          "Facebook (Graph API)",
          "YouTube (Data API)",
          "Hotels.com, Otelpuan, TopHotels (scraper)",
        ],
      },
      {
        id: "calisma-sekli",
        heading: "Yapay zeka cevap yazma nasıl çalışır?",
        paragraphs: [
          "AI üç adımda çalışır: (1) yorumu okur ve duygu/dil/niyet etiketler, (2) marka sesinizden öğrenir, (3) yorumun dilinde ve markanıza uygun 3 yanıt önerir.",
          "Siz onaylar onaylamaz API üzerinden yayınlanır. Manuel onay modunda her yanıtı düzenleyebilir, tam otomatik modda sadece negatifler için onay isteyebilirsiniz.",
        ],
      },
      {
        id: "marka-sesi",
        heading: "Marka sesinde AI: nasıl öğreniyor?",
        paragraphs: [
          "AI sizin geçmiş cevaplarınızı, web sitenizi, menü/oda bilgilerinizi okur. 8 farklı ton tercih edebilirsiniz: friendly, formal, witty, empatik, profesyonel...",
          "Sonuç: 30 saniyede AI ile yazılmış ama sizin ekibinizden çıkmış gibi okunan yanıtlar. Müşteriler farkı anlamaz.",
        ],
      },
      {
        id: "raporlama",
        heading: "Otomatik raporlama ve negatif uyarı",
        paragraphs: [
          "Her hafta haftalık AI raporu: ortalama puan, cevap oranı, en sık şikayet temaları, lokasyon karşılaştırması.",
          "1-2 yıldız yorum geldiği an e-posta uyarısı + empati dolu yanıt taslağı. Hızlı tepki = daha az itibar zararı.",
        ],
      },
      {
        id: "nasil-baslarim",
        heading: "Nasıl başlarım?",
        paragraphs: [
          "3 adımda hesabınız hazır: (1) platformlarınızı bağlayın, (2) marka tonunuzu seçin, (3) ilk yanıtlarınızı onaylamaya başlayın.",
          "İlk 3 ay ücretsiz; kredi kartı gerekmez. Setup ortalama 5 dakika.",
        ],
      },
    ],
    faqs: [
      {
        question: "Yapay zeka cevapları gerçek mi görünüyor, robot gibi mi?",
        answer:
          "VoyageRespond'ın AI motoru geçmiş yanıtlarınızdan ve marka rehberinizden öğrendiği için sizin gibi yazıyor. 8 farklı ton ve 15+ dil desteğiyle yanıtlar müşteriye doğal görünür. Beta testlerimizde müşterilerin %96'sı AI cevabı insan cevabından ayırt edemedi.",
      },
      {
        question: "Tüm platformları aynı anda mı yönetiyor?",
        answer:
          "Evet. Google, Booking, TripAdvisor, Instagram, TikTok, Facebook, YouTube ve OTA scraper'ları tek dashboard'da birleşir. Tek tek panel açma derdine son.",
      },
      {
        question: "Kaç dilde cevap üretebiliyor?",
        answer:
          "Türkçe, İngilizce, Almanca, Rusça, Fransızca, İspanyolca, İtalyanca, Arapça dahil 15+ dilde otomatik tespit ve yanıt. Özellikle turizm sektöründe kritik avantaj.",
      },
      {
        question: "Veri güvenliği nasıl sağlanıyor?",
        answer:
          "Tüm bağlantılar resmi OAuth 2.0 üzerinden. Şifreniz alınmaz, veriler Lovable Cloud altyapısında şifreli saklanır. KVKK ve GDPR uyumludur.",
      },
      {
        question: "Ne kadar zaman kazandırır?",
        answer:
          "Ortalama bir işletme günde 2-3 saat yorum yanıt süresi tasarrufu yapar. AI 30 saniyede ürettiği yanıtla manuel 5-10 dakikalık yazımı ortadan kaldırır.",
      },
      {
        question: "Fiyatlandırma nasıl?",
        answer:
          "VoyageRespond şu anda 3 ay ücretsiz deneme sunuyor — kredi kartı gerekmez. Sonrasında işletme büyüklüğüne göre aylık plan seçenekleri var.",
      },
    ],
    relatedSlugs: ["google-yorumlari-icin-yapay-zeka", "instagram-yorumlari-icin-yapay-zeka", "tripadvisor-yorumlari-icin-yapay-zeka"],
  },
];

export function getPlatformLandingPage(slug: string): PlatformLandingContent | undefined {
  return platformLandingPages.find((p) => p.slug === slug);
}

export function getPlatformLandingSlugs(): string[] {
  return platformLandingPages.map((p) => p.slug);
}