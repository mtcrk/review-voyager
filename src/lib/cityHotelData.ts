export interface CityHotelData {
  slug: string;
  name: string;
  nameLocative: string; // "İstanbul'da", "Antalya'da"
  region: string;
  hotelCount: string;
  avgRating: number;
  topPlatforms: string[];
  description: string;
  highlights: string[];
  competitors: string[];
  seoTitle: string;
  seoDescription: string;
}

export const cityHotelData: CityHotelData[] = [
  {
    slug: "istanbul",
    name: "İstanbul",
    nameLocative: "İstanbul'da",
    region: "Marmara",
    hotelCount: "3.500+",
    avgRating: 4.2,
    topPlatforms: ["Google", "Booking.com", "TripAdvisor", "Hotels.com"],
    description:
      "İstanbul, Türkiye'nin en yoğun otel pazarı. Sultanahmet'ten Beyoğlu'na, Levent'ten Kadıköy'e binlerce otel her gün yüzlerce yeni yorum alıyor. Yoğun rekabet nedeniyle Google Otel sıralamalarında üst sıralarda kalmak için yorum yönetimi kritik.",
    highlights: [
      "Sultanahmet butik otelleri için TripAdvisor öncelikli",
      "Levent & Maslak iş otelleri için Booking.com kritik",
      "Çoklu dil (TR/EN/AR/RU) yanıt zorunlu",
      "Günlük 50+ yorum gelen oteller için otomasyon şart",
    ],
    competitors: ["Four Seasons Sultanahmet", "Çırağan Palace Kempinski", "Raffles Istanbul"],
    seoTitle: "İstanbul Otel Yorum Yönetimi | Google, Booking, TripAdvisor",
    seoDescription:
      "İstanbul'daki otelinizin Google, Booking.com ve TripAdvisor yorumlarını tek panelden yönetin. AI destekli çok dilli yanıt sistemi ile saatler içinde tüm yorumlara cevap verin.",
  },
  {
    slug: "antalya",
    name: "Antalya",
    nameLocative: "Antalya'da",
    region: "Akdeniz",
    hotelCount: "2.800+",
    avgRating: 4.4,
    topPlatforms: ["Booking.com", "Google", "TripAdvisor", "Hotels.com"],
    description:
      "Antalya, Türkiye turizminin başkenti. Konyaaltı, Lara ve Kemer bölgelerindeki resort otelleri sezonda haftada 500+ yorum alıyor. Rus, Alman ve İngiliz misafirler için çok dilli yanıt yönetimi zorunlu.",
    highlights: [
      "Yaz sezonunda günlük 30-80 yorum hacmi",
      "Almanca, Rusça, İngilizce yanıt gerekliliği",
      "All-inclusive otellerde yiyecek/içecek yorumları öncelikli",
      "Sezon kapanışında yorum hızı düşse de yanıt oranı %90+ olmalı",
    ],
    competitors: ["Maxx Royal Belek", "Regnum Carya", "Rixos Premium Belek"],
    seoTitle: "Antalya Otel Yorum Yönetimi | All-Inclusive & Resort",
    seoDescription:
      "Antalya'daki resort ve all-inclusive otellerinizin Booking.com, Google ve TripAdvisor yorumlarını çok dilli AI ile yönetin. Sezonda günde 50+ yoruma saniyeler içinde profesyonel yanıt.",
  },
  {
    slug: "bodrum",
    name: "Bodrum",
    nameLocative: "Bodrum'da",
    region: "Ege",
    hotelCount: "950+",
    avgRating: 4.5,
    topPlatforms: ["Booking.com", "TripAdvisor", "Google", "Airbnb"],
    description:
      "Bodrum, lüks butik otellerin ve villa kiralamalarının merkezi. Yalıkavak, Türkbükü ve Gümbet bölgelerindeki tesisler Instagram ve TripAdvisor üzerinden yoğun ilgi görüyor. Yerel ve yabancı misafirler için ayrı yanıt stratejisi gerekli.",
    highlights: [
      "Lüks butik otellerde TripAdvisor #1 öncelik",
      "Yalıkavak & Türkbükü villa kiralamalarında Airbnb yönetimi kritik",
      "Influencer & ünlü misafir yorumlarına özel ilgi",
      "Sezon dışı (Kasım-Mart) bakım yorumlarına proaktif yanıt",
    ],
    competitors: ["Mandarin Oriental Bodrum", "Maxx Royal Bodrum", "Six Senses Kaplankaya"],
    seoTitle: "Bodrum Otel Yorum Yönetimi | Butik & Villa & Resort",
    seoDescription:
      "Bodrum'daki butik otel ve villalarınızın Booking, TripAdvisor, Airbnb yorumlarını profesyonelce yönetin. AI ile saniyeler içinde lüks tona uygun yanıtlar.",
  },
  {
    slug: "kapadokya",
    name: "Kapadokya",
    nameLocative: "Kapadokya'da",
    region: "İç Anadolu",
    hotelCount: "650+",
    avgRating: 4.6,
    topPlatforms: ["TripAdvisor", "Booking.com", "Google", "Hotels.com"],
    description:
      "Kapadokya, Türkiye'nin en yüksek puanlı bölgesi. Göreme, Ürgüp ve Uçhisar'daki cave hotel ve butik otelleri yabancı turistler için dünya çapında popüler. TripAdvisor yorumları rezervasyonların %70'ini etkiliyor.",
    highlights: [
      "TripAdvisor sıralaması rezervasyonların belirleyicisi",
      "Balon turu deneyimi yorumları otel puanını etkiliyor",
      "Yüksek beklenti = küçük şikayetler bile büyük etki",
      "İngilizce, Japonca, Çince yanıt sıklığı artıyor",
    ],
    competitors: ["Museum Hotel", "Argos in Cappadocia", "Sultan Cave Suites"],
    seoTitle: "Kapadokya Otel Yorum Yönetimi | Cave Hotel & Butik",
    seoDescription:
      "Kapadokya'daki cave hotel ve butik otellerinizin TripAdvisor, Booking ve Google yorumlarını yönetin. Çok dilli AI ile dünya çapındaki misafirlere profesyonel yanıt.",
  },
  {
    slug: "izmir",
    name: "İzmir",
    nameLocative: "İzmir'de",
    region: "Ege",
    hotelCount: "780+",
    avgRating: 4.3,
    topPlatforms: ["Google", "Booking.com", "TripAdvisor"],
    description:
      "İzmir, hem iş seyahatleri hem de Ege turizminin geçiş noktası. Alsancak, Konak ve havalimanı çevresindeki oteller yoğun şehir trafiği alıyor. Çeşme ve Alaçatı için ayrı strateji gerekli.",
    highlights: [
      "İş otelleri için hızlı yanıt süresi kritik (4 saat içinde)",
      "Konum, ulaşım ve check-in hızı yorumlarda öne çıkıyor",
      "Fuar dönemlerinde yorum hacmi 3x artıyor",
      "Çeşme & Alaçatı için ayrı sosyal medya stratejisi",
    ],
    competitors: ["Swissôtel Büyük Efes", "Mövenpick İzmir", "Wyndham Grand İzmir Özdilek"],
    seoTitle: "İzmir Otel Yorum Yönetimi | İş & Tatil Otelleri",
    seoDescription:
      "İzmir'deki iş ve tatil otellerinizin Google, Booking ve TripAdvisor yorumlarını AI ile yönetin. Fuar sezonunda artan yorum hacmini saniyeler içinde karşılayın.",
  },
  {
    slug: "ankara",
    name: "Ankara",
    nameLocative: "Ankara'da",
    region: "İç Anadolu",
    hotelCount: "420+",
    avgRating: 4.2,
    topPlatforms: ["Google", "Booking.com"],
    description:
      "Ankara, Türkiye'nin yönetim merkezi. Kavaklıdere, Çankaya ve havalimanı çevresindeki oteller ağırlıklı olarak iş seyahati misafirleri alıyor. Google ve Booking.com kritik kanallar.",
    highlights: [
      "İş seyahatleri için Google Otel sıralaması belirleyici",
      "Toplantı salonu, kahvaltı ve ulaşım yorumları en sık",
      "Hafta içi rezervasyonlar yorum çıktısının %75'i",
      "Kurumsal misafir yorumları için resmi ton gerekli",
    ],
    competitors: ["JW Marriott Ankara", "Swissôtel Ankara", "Sheraton Ankara"],
    seoTitle: "Ankara Otel Yorum Yönetimi | İş Otelleri",
    seoDescription:
      "Ankara'daki iş otellerinizin Google ve Booking.com yorumlarını AI ile profesyonel ton ile yönetin. Kurumsal misafirlere uygun yanıtları saniyeler içinde üretin.",
  },
  {
    slug: "alanya",
    name: "Alanya",
    nameLocative: "Alanya'da",
    region: "Akdeniz",
    hotelCount: "1.150+",
    avgRating: 4.3,
    topPlatforms: ["Booking.com", "Google", "TripAdvisor"],
    description:
      "Alanya, Rus, Alman ve İskandinav turistlerinin yoğun ilgi gösterdiği resort bölgesi. All-inclusive otellerinde sezonda yoğun yorum trafiği var. Çok dilli yanıt yönetimi şart.",
    highlights: [
      "Rusça yorum oranı %35-40 arası",
      "Almanca ve İngilizce zorunlu",
      "Plaj, havuz ve büfe yorumları en sık",
      "Aile otellerinde çocuk dostu yorumları önemli",
    ],
    competitors: ["Granada Luxury Belek", "Delphin Imperial", "Kirman Hotels"],
    seoTitle: "Alanya Otel Yorum Yönetimi | Resort & Aile Otelleri",
    seoDescription:
      "Alanya'daki resort ve aile otellerinin Booking, Google ve TripAdvisor yorumlarını çok dilli (TR/RU/DE/EN) AI ile yönetin.",
  },
  {
    slug: "marmaris",
    name: "Marmaris",
    nameLocative: "Marmaris'te",
    region: "Ege",
    hotelCount: "580+",
    avgRating: 4.3,
    topPlatforms: ["Booking.com", "TripAdvisor", "Google"],
    description:
      "Marmaris, İngiliz ve İskandinav turistlerinin tercih ettiği Ege incisi. İçmeler, Turunç ve marina çevresindeki oteller yoğun rezervasyon alıyor. TripAdvisor ve Booking en kritik.",
    highlights: [
      "İngilizce yorum oranı %50+",
      "Tekne turu ve gezi yorumları otel puanını etkiliyor",
      "Aile + genç çift karışık misafir profili",
      "Sezon yoğunluğunda hızlı yanıt kritik",
    ],
    competitors: ["D-Resort Grand Azur", "Maritim Pine Beach", "Hotel Munamar Beach"],
    seoTitle: "Marmaris Otel Yorum Yönetimi | Resort & Marina Otelleri",
    seoDescription:
      "Marmaris'teki resort ve marina otellerinizin Booking, TripAdvisor yorumlarını İngilizce ağırlıklı AI yanıtlarla yönetin.",
  },
  {
    slug: "kemer",
    name: "Kemer",
    nameLocative: "Kemer'de",
    region: "Akdeniz",
    hotelCount: "470+",
    avgRating: 4.4,
    topPlatforms: ["Booking.com", "Google", "TripAdvisor"],
    description:
      "Kemer, Antalya'nın en yoğun all-inclusive bölgelerinden. Beldibi, Göynük ve Tekirova'daki oteller Rus ve Alman misafirler için ana destinasyon.",
    highlights: [
      "Rusça ve Almanca yanıt zorunlu",
      "All-inclusive yorumlarında yiyecek-içecek %60 ağırlık",
      "Sezon kapanışında bakım & yenileme yorumları",
    ],
    competitors: ["Maxx Royal Kemer", "Rixos Sungate", "Amara Dolce Vita"],
    seoTitle: "Kemer Otel Yorum Yönetimi | All-Inclusive Resort",
    seoDescription:
      "Kemer'deki all-inclusive otellerinizin Booking, Google ve TripAdvisor yorumlarını çok dilli AI ile yönetin.",
  },
  {
    slug: "fethiye",
    name: "Fethiye",
    nameLocative: "Fethiye'de",
    region: "Ege",
    hotelCount: "520+",
    avgRating: 4.4,
    topPlatforms: ["Booking.com", "TripAdvisor", "Google", "Airbnb"],
    description:
      "Fethiye, Ölüdeniz ve Hisarönü bölgesiyle butik otel ve villa kiralamasının merkezi. İngiliz turistleri için dünya çapında popüler. TripAdvisor sıralaması kritik.",
    highlights: [
      "İngilizce yorum oranı %55+",
      "Yamaç paraşütü deneyimi otel puanını etkiliyor",
      "Villa kiralamalarında Airbnb yönetimi öne çıkıyor",
    ],
    competitors: ["Hillside Beach Club", "D-Resort Göcek", "Liberty Hotels Lykia"],
    seoTitle: "Fethiye Otel Yorum Yönetimi | Butik & Villa",
    seoDescription:
      "Fethiye'deki butik otel ve villalarınızın TripAdvisor, Booking ve Airbnb yorumlarını AI ile yönetin.",
  },
  {
    slug: "cesme",
    name: "Çeşme",
    nameLocative: "Çeşme'de",
    region: "Ege",
    hotelCount: "320+",
    avgRating: 4.5,
    topPlatforms: ["Google", "Booking.com", "TripAdvisor", "Instagram"],
    description:
      "Çeşme & Alaçatı, lüks butik otellerin ve dizayn otellerinin Türkiye merkezi. Yerli misafir ağırlıklı sezon, Instagram ve Google yorumları öncelikli.",
    highlights: [
      "Lüks butik otellerde Instagram yorum yönetimi kritik",
      "Hafta sonu yoğunluğu, hafta içi sakin",
      "Influencer ziyaretleri yorum trafiğini artırıyor",
    ],
    competitors: ["Alavya Hotel", "La Capria Suite", "Beymarmara Suit Hotel"],
    seoTitle: "Çeşme Alaçatı Otel Yorum Yönetimi | Butik & Lüks",
    seoDescription:
      "Çeşme & Alaçatı'daki butik otellerin Google, Booking ve Instagram yorumlarını AI ile profesyonelce yönetin.",
  },
  {
    slug: "kusadasi",
    name: "Kuşadası",
    nameLocative: "Kuşadası'nda",
    region: "Ege",
    hotelCount: "390+",
    avgRating: 4.3,
    topPlatforms: ["Booking.com", "Google", "TripAdvisor"],
    description:
      "Kuşadası, kruvaziyer turizmi ve aile otellerinin merkezi. Ephesus turlarıyla bağlantılı, uluslararası yoğun misafir trafiği.",
    highlights: [
      "Kruvaziyer misafirlerinden günlük yorum akışı",
      "İngilizce ve Almanca ağırlıklı",
      "Ephesus turu deneyimleri otel yorumunda yer alıyor",
    ],
    competitors: ["Pine Bay Holiday Resort", "Korumar Ephesus", "Sunis Efes Royal"],
    seoTitle: "Kuşadası Otel Yorum Yönetimi | Resort & Aile",
    seoDescription:
      "Kuşadası'ndaki resort ve aile otellerinin Booking ve Google yorumlarını AI ile çok dilli yönetin.",
  },
  {
    slug: "bursa",
    name: "Bursa",
    nameLocative: "Bursa'da",
    region: "Marmara",
    hotelCount: "240+",
    avgRating: 4.2,
    topPlatforms: ["Google", "Booking.com"],
    description:
      "Bursa, kış turizmi (Uludağ) ve termal otelleri ile yıl boyu yoğun. İş ve aile misafirleri karışık.",
    highlights: [
      "Uludağ kış sezonunda yorum hacmi 4x artıyor",
      "Termal otel yorumlarında detay (sıcaklık, hijyen) önemli",
      "İskender, kahvaltı ve yerel lezzet yorumları sıkça çıkıyor",
    ],
    competitors: ["Crowne Plaza Bursa", "Sheraton Bursa", "Le Chalet Yazıcı"],
    seoTitle: "Bursa Otel Yorum Yönetimi | Termal & Uludağ",
    seoDescription:
      "Bursa'daki termal ve Uludağ otellerinizin Google ve Booking yorumlarını AI ile yönetin.",
  },
  {
    slug: "trabzon",
    name: "Trabzon",
    nameLocative: "Trabzon'da",
    region: "Karadeniz",
    hotelCount: "210+",
    avgRating: 4.1,
    topPlatforms: ["Booking.com", "Google", "TripAdvisor"],
    description:
      "Trabzon, Körfez Arap turistlerinin (özellikle Suudi, Kuveyt, Katar) tercih ettiği şehir. Yaz aylarında yoğun Arapça yorum trafiği.",
    highlights: [
      "Arapça yorum oranı %40+",
      "Helal yiyecek ve namaz odası yorumlarda öne çıkıyor",
      "Uzungöl ve Sümela tur deneyimleri yorumlara yansıyor",
    ],
    competitors: ["Radisson Blu Trabzon", "Ramada Plaza Trabzon", "Novotel Trabzon"],
    seoTitle: "Trabzon Otel Yorum Yönetimi | Arap Turisti & Karadeniz",
    seoDescription:
      "Trabzon'daki otellerinizin Booking, Google ve TripAdvisor yorumlarını Türkçe + Arapça AI ile yönetin.",
  },
  {
    slug: "kayseri",
    name: "Kayseri",
    nameLocative: "Kayseri'de",
    region: "İç Anadolu",
    hotelCount: "130+",
    avgRating: 4.2,
    topPlatforms: ["Google", "Booking.com"],
    description:
      "Kayseri, Erciyes kış turizmi ve şehir merkezi iş otelleri ile yıl boyu aktif. Sanayi şehri olması nedeniyle iş seyahati ağırlıklı.",
    highlights: [
      "Erciyes sezonunda otel yorum hacmi 3x artıyor",
      "İş misafirleri için Wi-Fi & toplantı salonu kritik",
      "Yerel lezzetler (mantı, pastırma) yorumlarda öne çıkıyor",
    ],
    competitors: ["Radisson Blu Kayseri", "Hilton Garden Inn Kayseri", "Mirada Del Lago"],
    seoTitle: "Kayseri Otel Yorum Yönetimi | Erciyes & İş Otelleri",
    seoDescription:
      "Kayseri'deki Erciyes ve iş otellerinizin Google ve Booking yorumlarını AI ile yönetin.",
  },
];

export const getCityHotelData = (slug: string): CityHotelData | undefined =>
  cityHotelData.find((c) => c.slug === slug);