/**
 * GEO / AI-visibility marketing pages.
 *
 * Each entry is one public route. TR and EN pages are paired via `alt`
 * so the shared template can emit reciprocal hreflang tags
 * (x-default -> the English page).
 */

export interface GeoStep {
  title: string;
  body: string;
}

export interface GeoFaq {
  question: string;
  answer: string;
}

export interface GeoFact {
  value: string;
  label: string;
}

export interface GeoPage {
  /** Route path without leading slash. */
  slug: string;
  lang: "tr" | "en";
  /** Slug of the other-language version of this page. */
  alt: string;
  title: string;
  description: string;
  eyebrow: string;
  h1: string;
  /** 40-60 word neutral definition. First text block on the page. */
  definition: string;
  stepsHeading: string;
  steps: GeoStep[];
  tableHeading: string;
  tableColumns: [string, string, string];
  tableRows: [string, string, string][];
  factsHeading: string;
  facts: GeoFact[];
  faqHeading: string;
  faqs: GeoFaq[];
  ctaHeading: string;
  ctaBody: string;
  /** Renders the AI Visibility Checker inline above the CTA. */
  showChecker?: boolean;
  /** Hub pages link out to the other pages. */
  links?: { slug: string; title: string; body: string }[];
}

const TR_FACTS: GeoFact[] = [
  { value: "15", label: "Desteklenen yorum platformu (Google, Booking, TripAdvisor, Yandex, Trip.com, Hotels.com, Expedia, Airbnb, Yemeksepeti, Trendyol, Zomato, TikTok, Instagram, Facebook, YouTube)" },
  { value: "Resmî API", label: "Google İşletme Profili API'si üzerinden bağlantı — şifre paylaşımı yok" },
  { value: "TR / EN", label: "Panel arayüzü iki dilde; yanıtlar yorumun yazıldığı dilde üretilir" },
  { value: "8", label: "Seçilebilir yanıt tonu (resmî, samimi, özür dileyen, kısa vb.)" },
];

const EN_FACTS: GeoFact[] = [
  { value: "15", label: "Supported review platforms (Google, Booking, TripAdvisor, Yandex, Trip.com, Hotels.com, Expedia, Airbnb, Yemeksepeti, Trendyol, Zomato, TikTok, Instagram, Facebook, YouTube)" },
  { value: "Official API", label: "Connected through the Google Business Profile API — no password sharing" },
  { value: "TR / EN", label: "Dashboard available in two languages; replies are drafted in the reviewer's language" },
  { value: "8", label: "Selectable reply tones (formal, friendly, apologetic, concise and more)" },
];

export const geoPages: GeoPage[] = [
  // ------------------------------------------------------------ 1 TR
  {
    slug: "google-yorum-yonetimi",
    lang: "tr",
    alt: "google-review-management",
    title: "Google Yorum Yönetimi Nedir, Nasıl Yapılır? | VoyageRespond",
    description:
      "Google yorum yönetimi nedir, nasıl yapılır? Google İşletme Profili yorumlarını tek panelden takip etme, cevaplama ve raporlama adımları.",
    eyebrow: "Google Yorum Yönetimi",
    h1: "Google Yorum Yönetimi: Yorumları Tek Yerden Takip Edin ve Cevaplayın",
    definition:
      "Google yorum yönetimi, bir işletmenin Google İşletme Profili'ne gelen yorumları düzenli olarak takip etmesi, yanıtlaması ve bu geri bildirimleri işletme kararlarına dönüştürmesi sürecidir. VoyageRespond, Google'ın resmî İşletme Profili API'si üzerinden yorumları çeker, her yoruma marka diline uygun cevap taslağı üretir ve onayınızla yayınlar.",
    stepsHeading: "Nasıl çalışır?",
    steps: [
      { title: "Profilinizi bağlayın", body: "Google İşletme Profilinizi tek tıkla bağlarsınız (resmî API, şifre paylaşımı yok)." },
      { title: "Geçmiş yorumlar içeri aktarılır", body: "Geçmiş yorumlarınız içeri aktarılır ve konu başlıklarına ayrılır." },
      { title: "Bildirim alırsınız", body: "Yeni yorum geldiğinde WhatsApp'tan bildirim alırsınız." },
      { title: "Taslağı onaylarsınız", body: "Hazır cevap taslağını onaylar veya düzenlersiniz; cevap Google'a gider." },
      { title: "Raporu okursunuz", body: "Aylık raporda hangi konunun puanınızı düşürdüğünü görürsünüz." },
    ],
    tableHeading: "Manuel yönetim ile VoyageRespond karşılaştırması",
    tableColumns: ["", "Manuel yönetim", "VoyageRespond"],
    tableRows: [
      ["Yeni yorumdan haberdar olma", "Panele girince", "WhatsApp bildirimi, anında"],
      ["Cevap yazma süresi", "Yorum başına 5-10 dk", "Onay ile ~15 sn"],
      ["Cevap dili", "Tek dil", "Yorumun dilinde otomatik"],
      ["Konu analizi", "Yok", "Otomatik konu ve duygu kırılımı"],
      ["Bağlantı yöntemi", "—", "Google resmî API partneri"],
    ],
    factsHeading: "Kapsam ve teknik bilgiler",
    facts: TR_FACTS,
    faqHeading: "Sıkça sorulan sorular",
    faqs: [
      {
        question: "Google yorumlarına cevap vermek sıralamayı etkiler mi?",
        answer:
          "Google, yorumlara yanıt vermeyi işletme profili kalitesinin bir parçası olarak sayar ve bunu açıkça önerir. Doğrudan bir sıralama garantisi yoktur; etki daha çok yorum hacmi, puan ortalaması ve profil bütünlüğü üzerinden dolaylı gerçekleşir.",
      },
      {
        question: "Olumsuz bir yoruma nasıl cevap vermeliyim?",
        answer:
          "Şikâyeti kabul edin, savunmaya geçmeden somut bir düzeltme veya iletişim kanalı sunun ve yanıtı kısa tutun. Yanıtı yazarken hedef kitleniz yorumu yazan kişi değil, o yorumu sonradan okuyacak potansiyel müşterilerdir.",
      },
      {
        question: "Google'dan yorum silinebilir mi?",
        answer:
          "İşletmeler yorumları kendileri silemez; yalnızca Google'ın içerik politikalarını ihlal eden yorumları (spam, alakasız içerik, hakaret) şikâyet edebilir. Şikâyet sonrası kararı Google verir ve inceleme birkaç gün sürebilir.",
      },
      {
        question: "Cevaplar otomatik mi yayınlanıyor?",
        answer:
          "Hayır. VoyageRespond cevabı taslak olarak üretir, siz onaylayana kadar Google'a gönderilmez. İsterseniz taslağı düzenleyip yayınlayabilir, isterseniz tamamen kendi metninizi yazabilirsiniz.",
      },
      {
        question: "Birden fazla şubem var, hepsi tek panelde görünür mü?",
        answer:
          "Evet. Her fiziksel adresin ayrı bir Google İşletme Profili olur; VoyageRespond bunları tek hesap altında toplar. Şubeleri yan yana karşılaştırabilir, konu bazında hangi lokasyonun geride kaldığını görebilirsiniz.",
      },
      {
        question: "Yorum toplama isteği göndermek Google politikalarına uygun mu?",
        answer:
          "Gerçek müşterilerden ayrım gözetmeden yorum istemek Google politikalarına uygundur. Yasak olan; yorum karşılığı indirim veya hediye vermek, yalnızca memnun müşterilere istek göndermek (review gating) ve yorumu satın almaktır.",
      },
    ],
    ctaHeading: "İşletmeniz yapay zekâ asistanlarında görünüyor mu?",
    ctaBody:
      "İşletme adınızı girin; ChatGPT, Gemini ve Perplexity'nin sorulara verdiği yanıtlarda çıkıp çıkmadığınızı ücretsiz kontrol edin.",
  },

  // ------------------------------------------------------------ 1 EN
  {
    slug: "google-review-management",
    lang: "en",
    alt: "google-yorum-yonetimi",
    title: "Google Review Management: How It Works | VoyageRespond",
    description:
      "What Google review management is and how to do it: monitor, reply to and analyse Google Business Profile reviews from a single dashboard.",
    eyebrow: "Google Review Management",
    h1: "Google Review Management: Track and Reply to Every Review in One Place",
    definition:
      "Google review management is the process by which a business monitors the reviews left on its Google Business Profile, replies to them, and turns that feedback into operational decisions. VoyageRespond pulls reviews through Google's official Business Profile API, drafts a reply in your brand's voice for each one, and publishes it after your approval.",
    stepsHeading: "How it works",
    steps: [
      { title: "Connect your profile", body: "You connect your Google Business Profile in one click through the official API — no password sharing." },
      { title: "Historical reviews are imported", body: "Your past reviews are imported and split into topics." },
      { title: "You get notified", body: "When a new review arrives you receive a WhatsApp notification." },
      { title: "You approve the draft", body: "You approve or edit the suggested reply; the reply is posted to Google." },
      { title: "You read the report", body: "The monthly report shows which topic is pulling your rating down." },
    ],
    tableHeading: "Manual management vs VoyageRespond",
    tableColumns: ["", "Manual management", "VoyageRespond"],
    tableRows: [
      ["Learning about a new review", "Only when you open the dashboard", "Instant WhatsApp notification"],
      ["Time to write a reply", "5-10 minutes per review", "About 15 seconds with approval"],
      ["Reply language", "One language", "Automatically in the reviewer's language"],
      ["Topic analysis", "None", "Automatic topic and sentiment breakdown"],
      ["Connection method", "—", "Official Google Business Profile API"],
    ],
    factsHeading: "Scope and technical details",
    facts: EN_FACTS,
    faqHeading: "Frequently asked questions",
    faqs: [
      {
        question: "Does replying to Google reviews affect rankings?",
        answer:
          "Google counts replying to reviews as part of profile quality and explicitly recommends it. There is no direct ranking guarantee; the effect is indirect, through review volume, average rating and profile completeness.",
      },
      {
        question: "How should I reply to a negative review?",
        answer:
          "Acknowledge the complaint, offer a concrete fix or a direct contact channel instead of defending yourself, and keep it short. Your real audience is not the reviewer but the prospective customers who will read the exchange later.",
      },
      {
        question: "Can a review be deleted from Google?",
        answer:
          "Businesses cannot delete reviews themselves; they can only flag reviews that break Google's content policies, such as spam, off-topic content or abuse. Google makes the final call and the review can take several days.",
      },
      {
        question: "Are replies published automatically?",
        answer:
          "No. VoyageRespond produces a draft and nothing is sent to Google until you approve it. You can edit the draft before publishing or replace it with your own text entirely.",
      },
      {
        question: "I have several locations — can I see them all in one dashboard?",
        answer:
          "Yes. Each physical address has its own Google Business Profile, and VoyageRespond groups them under one account. You can compare locations side by side and see which one lags on a specific topic.",
      },
      {
        question: "Is asking customers for reviews allowed by Google?",
        answer:
          "Asking all genuine customers for a review is allowed. What is prohibited is offering discounts or gifts in exchange for reviews, requesting reviews only from happy customers (review gating), and buying reviews.",
      },
    ],
    ctaHeading: "Does an AI assistant mention your business?",
    ctaBody:
      "Enter your business name and check for free whether ChatGPT, Gemini and Perplexity name you when someone asks for a recommendation.",
  },

  // ------------------------------------------------------------ 2 TR
  {
    slug: "yapay-zeka-yorum-cevaplama",
    lang: "tr",
    alt: "ai-review-response",
    title: "Yapay Zekâ ile Yorum Cevaplama Nasıl Yapılır? | VoyageRespond",
    description:
      "Yapay zekâ ile yorum cevaplama nedir, nasıl çalışır? Yorumun dilinde yanıt, geçmiş cevaplardan öğrenen marka sesi ve yayın öncesi insan onayı.",
    eyebrow: "AI Yanıt Üretimi",
    h1: "Yapay Zekâ ile Yorum Cevaplama: Yorumun Dilinde, Markanızın Sesiyle",
    definition:
      "Yapay zekâ ile yorum cevaplama, bir dil modelinin müşteri yorumunu okuyup içeriğine, tonuna ve diline uygun bir yanıt taslağı üretmesidir. VoyageRespond bu taslağı işletmenin geçmiş yanıtlarından çıkarılan marka sesi profiline göre yazar, yorumun yazıldığı dilde üretir ve yayınlamadan önce insan onayı ister.",
    stepsHeading: "Nasıl çalışır?",
    steps: [
      { title: "Marka sesi profili çıkarılır", body: "Geçmişte yazdığınız yanıtlar incelenir; hitap biçimi, uzunluk, imza ve sık kullandığınız ifadeler bir marka sesi profiline dönüştürülür." },
      { title: "Yorum analiz edilir", body: "Yorumun dili, duygu tonu ve içindeki konular (oda, kahvaltı, personel, fiyat gibi) ayrıştırılır." },
      { title: "Taslak üretilir", body: "Yanıt, yorumun yazıldığı dilde ve seçtiğiniz tonda hazırlanır; şikâyet varsa somut bir aksiyon cümlesi eklenir." },
      { title: "İnsan onayı", body: "Taslağı okur, gerekirse düzenler ve onaylarsınız. Onay olmadan hiçbir yanıt yayınlanmaz." },
      { title: "Yayın ve kayıt", body: "Yanıt ilgili platforma gönderilir; hangi tonun kullanıldığı ve yanıtın kaynağı (AI / manuel) kaydedilir." },
    ],
    tableHeading: "Elle yanıt yazmak ile VoyageRespond karşılaştırması",
    tableColumns: ["", "Elle yanıt yazma", "VoyageRespond"],
    tableRows: [
      ["Yabancı dildeki yorum", "Çeviri aracı gerekir", "Yorumun dilinde doğrudan yanıt"],
      ["Ton tutarlılığı", "Yazan kişiye göre değişir", "Tek marka sesi profili"],
      ["Yanıt süresi", "Yorum başına 5-10 dk", "Onay ile ~15 sn"],
      ["Yayın kontrolü", "Tamamen elle", "Taslak + zorunlu insan onayı"],
      ["Kayıt ve ölçüm", "Yok", "Ton, kaynak ve süre kaydı"],
    ],
    factsHeading: "Kapsam ve teknik bilgiler",
    facts: TR_FACTS,
    faqHeading: "Sıkça sorulan sorular",
    faqs: [
      {
        question: "Yapay zekâ yanıtları robotik durur mu?",
        answer:
          "Genel amaçlı bir modele yorumu yapıştırıp yanıt istemek çoğunlukla şablon bir metin verir. Fark, modele yorumun konusunu, işletmenin geçmiş yanıtlarını ve ton tercihini birlikte vermekten çıkar; VoyageRespond taslağı bu bağlamla üretir.",
      },
      {
        question: "Yanıtlar yorumun dilinde mi yazılıyor?",
        answer:
          "Evet. Yorumun dili otomatik olarak algılanır ve yanıt aynı dilde üretilir. İsterseniz sabit bir yanıt dili de seçebilirsiniz.",
      },
      {
        question: "Marka sesi profili nasıl oluşuyor?",
        answer:
          "Platformlarda daha önce yazdığınız yanıtlar ve ayarlar sayfasındaki tercihleriniz birlikte kullanılır. Hitap biçimi, imza, yasaklı ifadeler ve uzunluk gibi kuralları elle de düzenleyebilirsiniz.",
      },
      {
        question: "Yanıt yayınlanmadan önce onay zorunlu mu?",
        answer:
          "Evet, yayın için onay adımı gereklidir. Bu, yanlış bilgi içeren veya bağlamı kaçıran bir yanıtın müşteriye gitmesini engeller.",
      },
      {
        question: "Olumsuz yorumlarda yapay zekâ ne yapıyor?",
        answer:
          "Şikâyetin konusu ayrıştırılır ve yanıt; kabul, açıklama ve somut aksiyon sırasıyla kurulur. Tartışmacı ifadeler ve boş vaatler taslaktan çıkarılır.",
      },
      {
        question: "Hangi platformlarda yanıt üretilebiliyor?",
        answer:
          "Yorum toplanan tüm platformlar için taslak üretilir. Google gibi resmî API'si olan platformlarda yanıt doğrudan gönderilir; API'si olmayanlarda taslak kopyalanıp ilgili panelde yayınlanır.",
      },
    ],
    ctaHeading: "Yanıtlarınız yapay zekâ asistanlarına yansıyor mu?",
    ctaBody:
      "İşletmenizin AI asistanlarındaki görünürlüğünü ücretsiz ölçün; hangi sorularda anıldığınızı görün.",
  },

  // ------------------------------------------------------------ 2 EN
  {
    slug: "ai-review-response",
    lang: "en",
    alt: "yapay-zeka-yorum-cevaplama",
    title: "AI Review Response: How Automated Replies Work | VoyageRespond",
    description:
      "How AI review response works: replies in the reviewer's own language, a brand-voice profile learned from past replies, and human approval before publishing.",
    eyebrow: "AI Reply Generation",
    h1: "AI Review Response: Replies in the Reviewer's Language, in Your Brand Voice",
    definition:
      "AI review response is the practice of having a language model read a customer review and draft a reply matching its content, tone and language. VoyageRespond writes that draft using a brand-voice profile derived from the business's own past replies, produces it in the language the review was written in, and requires human approval before anything is published.",
    stepsHeading: "How it works",
    steps: [
      { title: "A brand-voice profile is built", body: "Your previous replies are analysed; salutation style, length, sign-off and recurring phrases become a brand-voice profile." },
      { title: "The review is analysed", body: "The review's language, sentiment and topics (room, breakfast, staff, price and so on) are extracted." },
      { title: "A draft is generated", body: "The reply is written in the reviewer's language and your chosen tone; if there is a complaint, a concrete action sentence is added." },
      { title: "A human approves", body: "You read the draft, edit it if needed and approve it. Nothing is published without approval." },
      { title: "Publish and record", body: "The reply is sent to the platform, and the tone used and its source (AI or manual) are recorded." },
    ],
    tableHeading: "Writing replies by hand vs VoyageRespond",
    tableColumns: ["", "By hand", "VoyageRespond"],
    tableRows: [
      ["Foreign-language review", "Needs a translation tool", "Answered directly in that language"],
      ["Tone consistency", "Varies by whoever writes", "One brand-voice profile"],
      ["Time per reply", "5-10 minutes", "About 15 seconds with approval"],
      ["Publishing control", "Fully manual", "Draft plus mandatory human approval"],
      ["Record keeping", "None", "Tone, source and response time logged"],
    ],
    factsHeading: "Scope and technical details",
    facts: EN_FACTS,
    faqHeading: "Frequently asked questions",
    faqs: [
      {
        question: "Do AI replies sound robotic?",
        answer:
          "Pasting a review into a general-purpose model usually returns generic text. The difference comes from giving the model the review's topics, the business's past replies and a tone preference together, which is how VoyageRespond builds the draft.",
      },
      {
        question: "Are replies written in the reviewer's language?",
        answer:
          "Yes. The review's language is detected automatically and the reply is drafted in the same language. You can also pin a single fixed reply language if you prefer.",
      },
      {
        question: "How is the brand-voice profile created?",
        answer:
          "It combines the replies you have already published on your platforms with the preferences you set in the settings page. Salutation, sign-off, banned phrases and reply length can all be edited by hand.",
      },
      {
        question: "Is approval required before publishing?",
        answer:
          "Yes, the approval step is mandatory. It prevents a reply that contains wrong information or misses context from reaching a customer.",
      },
      {
        question: "What does the AI do with negative reviews?",
        answer:
          "The complaint topic is isolated and the reply is structured as acknowledgement, explanation and concrete action. Argumentative wording and empty promises are removed from the draft.",
      },
      {
        question: "Which platforms can replies be generated for?",
        answer:
          "Drafts are produced for every platform whose reviews are collected. Where an official API exists, such as Google, the reply is sent directly; elsewhere the draft is copied into that platform's own dashboard.",
      },
    ],
    ctaHeading: "Do AI assistants reflect your replies?",
    ctaBody:
      "Measure your business's visibility in AI assistants for free and see which questions you are named in.",
  },

  // ------------------------------------------------------------ 3 TR
  {
    slug: "google-isletme-profili-optimizasyonu",
    lang: "tr",
    alt: "google-business-profile-optimization",
    title: "Google İşletme Profili Optimizasyonu Rehberi | VoyageRespond",
    description:
      "Google İşletme Profili optimizasyonu nedir, eksiksiz bir profil neleri içerir ve yerel aramada neden fark yaratır? Adım adım rehber.",
    eyebrow: "Google İşletme Profili",
    h1: "Google İşletme Profili Optimizasyonu: Eksiksiz Profil Neleri İçerir?",
    definition:
      "Google İşletme Profili optimizasyonu, bir işletmenin Google Arama ve Haritalar'da görünen profilindeki bilgileri eksiksiz, doğru ve güncel tutma çalışmasıdır. Kategori, çalışma saatleri, hizmetler, fotoğraflar, sorular ve yorum yanıtları bu kapsama girer. VoyageRespond profili resmî API üzerinden bağlar, yorum ve yanıt tarafını güncel tutar.",
    stepsHeading: "Nasıl çalışır?",
    steps: [
      { title: "Profil doğrulaması", body: "Profilin doğrulanmış olduğundan emin olun. Doğrulanmamış profiller aramada sınırlı görünür ve API üzerinden yönetilemez." },
      { title: "Temel bilgiler", body: "Ana kategori, ikincil kategoriler, adres, telefon, web sitesi ve çalışma saatleri tam ve tutarlı doldurulur." },
      { title: "İçerik katmanı", body: "Hizmetler, olanaklar, güncel fotoğraflar ve işletme açıklaması eklenir; tatil saatleri sezon başında güncellenir." },
      { title: "Yorum katmanı", body: "Gelen yorumlar yanıtlanır, soru-cevap bölümü boş bırakılmaz. VoyageRespond bu adımı bildirim ve taslakla otomatikleştirir." },
      { title: "Ölçüm", body: "Arama görünümleri, yön tarifi ve arama tıklamaları izlenir; hangi sorgularla bulunduğunuz raporlanır." },
    ],
    tableHeading: "Profili elle yönetmek ile VoyageRespond karşılaştırması",
    tableColumns: ["", "Elle yönetim", "VoyageRespond"],
    tableRows: [
      ["Yorum yanıt oranı", "Takibi elle yapılır", "Yanıtsız yorumlar listelenir ve hatırlatılır"],
      ["Çoklu şube", "Her profil ayrı ayrı açılır", "Tüm profiller tek panelde"],
      ["Performans verisi", "Panelden elle bakılır", "Arama görünümleri ve tıklamalar raporda"],
      ["Yorum konuları", "Elle okuma", "Otomatik konu ve duygu kırılımı"],
      ["Bağlantı yöntemi", "—", "Google resmî İşletme Profili API'si"],
    ],
    factsHeading: "Kapsam ve teknik bilgiler",
    facts: TR_FACTS,
    faqHeading: "Sıkça sorulan sorular",
    faqs: [
      {
        question: "Profil kategorisi neden bu kadar önemli?",
        answer:
          "Ana kategori, Google'ın işletmenizi hangi aramalarda aday göstereceğini belirleyen en güçlü sinyallerden biridir. Yanlış veya fazla genel bir kategori, doğru sorgularda hiç görünmemenize yol açabilir.",
      },
      {
        question: "Fotoğraf eklemek sıralamayı değiştirir mi?",
        answer:
          "Fotoğraflar doğrudan bir sıralama faktörü olarak açıklanmamıştır, ancak profil etkileşimini ve tıklama oranını etkiler. Güncel ve gerçek fotoğraflar, kullanıcı kararına en çok yardımcı olan içeriklerdir.",
      },
      {
        question: "Çalışma saatlerini güncellememek ne yapar?",
        answer:
          "Kapalıyken açık görünen bir işletme, olumsuz yorum ve düşük puan üretir. Google, kullanıcı düzeltmeleri geldikçe saat bilgisini de sorgulayabilir hale getirir.",
      },
      {
        question: "Aynı işletme için birden fazla profil açabilir miyim?",
        answer:
          "Her fiziksel adres için bir profil kuralı geçerlidir. Aynı adres için birden fazla profil açmak yinelenen kayıt sayılır ve profillerin askıya alınmasına neden olabilir.",
      },
      {
        question: "Soru-cevap bölümünü kim dolduruyor?",
        answer:
          "Soruları kullanıcılar sorar ve yine kullanıcılar cevaplayabilir; bu da yanlış bilgi riskini doğurur. İşletmenin sık sorulan soruları kendi hesabından sorup yanıtlaması Google tarafından desteklenir.",
      },
      {
        question: "Profil optimizasyonu ne sıklıkla gözden geçirilmeli?",
        answer:
          "Temel bilgileri ayda bir kontrol etmek çoğu işletme için yeterlidir. Sezon değişimleri, tatiller ve menü veya hizmet güncellemeleri ayrıca gözden geçirme gerektirir.",
      },
    ],
    ctaHeading: "Profiliniz yapay zekâ yanıtlarına yansıyor mu?",
    ctaBody:
      "İşletme adınızı girin, AI asistanlarında görünürlüğünüzü ücretsiz ölçün.",
  },

  // ------------------------------------------------------------ 3 EN
  {
    slug: "google-business-profile-optimization",
    lang: "en",
    alt: "google-isletme-profili-optimizasyonu",
    title: "Google Business Profile Optimization Guide | VoyageRespond",
    description:
      "What Google Business Profile optimization is, what a complete profile contains, why it affects local discovery, and how to keep it current.",
    eyebrow: "Google Business Profile",
    h1: "Google Business Profile Optimization: What a Complete Profile Contains",
    definition:
      "Google Business Profile optimization is the work of keeping the information shown on a business's profile in Google Search and Maps complete, accurate and current. It covers categories, opening hours, services, photos, questions and review replies. VoyageRespond connects the profile through the official API and keeps the review and reply layer up to date.",
    stepsHeading: "How it works",
    steps: [
      { title: "Verify the profile", body: "Make sure the profile is verified. Unverified profiles have limited visibility in search and cannot be managed through the API." },
      { title: "Core information", body: "Primary category, secondary categories, address, phone, website and opening hours are filled in completely and consistently." },
      { title: "Content layer", body: "Services, amenities, current photos and the business description are added; holiday hours are updated before each season." },
      { title: "Review layer", body: "Incoming reviews are answered and the Q&A section is not left empty. VoyageRespond automates this step with notifications and drafts." },
      { title: "Measurement", body: "Search views, direction requests and website clicks are tracked, and the queries you were found with are reported." },
    ],
    tableHeading: "Managing the profile by hand vs VoyageRespond",
    tableColumns: ["", "By hand", "VoyageRespond"],
    tableRows: [
      ["Review response rate", "Tracked manually", "Unanswered reviews listed and flagged"],
      ["Multiple locations", "Each profile opened separately", "All profiles in one dashboard"],
      ["Performance data", "Checked manually in the console", "Search views and clicks in the report"],
      ["Review topics", "Read one by one", "Automatic topic and sentiment breakdown"],
      ["Connection method", "—", "Official Google Business Profile API"],
    ],
    factsHeading: "Scope and technical details",
    facts: EN_FACTS,
    faqHeading: "Frequently asked questions",
    faqs: [
      {
        question: "Why does the profile category matter so much?",
        answer:
          "The primary category is one of the strongest signals Google uses to decide which searches your business is a candidate for. A wrong or overly generic category can keep you out of the queries that matter most.",
      },
      {
        question: "Do photos change rankings?",
        answer:
          "Photos are not documented as a direct ranking factor, but they affect profile engagement and click-through. Current, genuine photos are the content that helps a user decide fastest.",
      },
      {
        question: "What happens if opening hours are out of date?",
        answer:
          "A business shown as open while closed collects negative reviews and lower ratings. Google also starts surfacing user-suggested corrections to your hours, which erodes trust in the listing.",
      },
      {
        question: "Can I create more than one profile for the same business?",
        answer:
          "The rule is one profile per physical address. Creating a second profile for the same address counts as a duplicate listing and can lead to suspension.",
      },
      {
        question: "Who fills in the Q&A section?",
        answer:
          "Questions are asked by users and can also be answered by users, which creates a risk of wrong information. Google supports businesses posting and answering their own frequently asked questions.",
      },
      {
        question: "How often should the profile be reviewed?",
        answer:
          "Checking core information once a month is enough for most businesses. Seasonal changes, public holidays and menu or service updates warrant an extra review.",
      },
    ],
    ctaHeading: "Does your profile show up in AI answers?",
    ctaBody:
      "Enter your business name and measure your visibility in AI assistants for free.",
  },

  // ------------------------------------------------------------ 4 TR
  {
    slug: "ai-gorunurluk",
    lang: "tr",
    alt: "ai-search-visibility",
    title: "Yapay Zekâda Görünürlük (GEO) Nedir, Nasıl Ölçülür? | VoyageRespond",
    description:
      "Yapay zekâda görünürlük (GEO) nedir? ChatGPT, Gemini ve Perplexity işletmenizi öneriyor mu? İşletme adınızla ücretsiz kontrol edin.",
    eyebrow: "AI Görünürlük / GEO",
    h1: "Yapay Zekâda Görünürlük (GEO) Nedir ve İşletmeniz Görünüyor mu?",
    definition:
      "Yapay zekâda görünürlük, kısaca GEO (generative engine optimization), bir işletmenin ChatGPT, Gemini, Perplexity ve Google AI Overviews gibi üretken yanıt motorlarının verdiği cevaplarda anılma durumudur. Ölçüm, kullanıcıların soracağı gerçek soruların bu motorlara sorulup yanıtta işletmenin adının, sırasının ve bağlamının kaydedilmesiyle yapılır.",
    stepsHeading: "Nasıl çalışır?",
    steps: [
      { title: "Soru seti hazırlanır", body: "İşletmenizin kategorisi ve şehri için satın alma niyeti taşıyan sorular oluşturulur (\"Antalya'da aile oteli önerir misin\" gibi)." },
      { title: "Motorlara sorulur", body: "Aynı sorular birden fazla yanıt motoruna paralel olarak sorulur ve dönen metinler saklanır." },
      { title: "Yanıt taranır", body: "İşletme adı ve yakın yazımları yanıt içinde aranır; anıldıysa kaçıncı sırada ve hangi bağlamda geçtiği kaydedilir." },
      { title: "Skor hesaplanır", body: "Anılma oranı, sıra ve duygu birleştirilerek bir görünürlük skoru üretilir; aynı sorularda çıkan rakipler listelenir." },
      { title: "Aksiyon çıkarılır", body: "Motorların sizi anmadığı sorular, eksik bilgi ve zayıf konu başlıkları aksiyon listesine dönüşür." },
    ],
    tableHeading: "Elle kontrol ile VoyageRespond karşılaştırması",
    tableColumns: ["", "Elle kontrol", "VoyageRespond"],
    tableRows: [
      ["Motor kapsamı", "Tek tek elle sorulur", "Birden fazla motor paralel sorgulanır"],
      ["Tekrarlanabilirlik", "Her seferinde farklı soru", "Sabit soru seti, karşılaştırılabilir sonuç"],
      ["Rakip görünümü", "Yok", "Aynı soruda çıkan rakipler listelenir"],
      ["Kayıt", "Ekran görüntüsü", "Zaman içinde saklanan skor geçmişi"],
      ["Aksiyon", "Yorum", "Eksik konu başlıklarına göre öneri listesi"],
    ],
    factsHeading: "Kapsam ve teknik bilgiler",
    facts: TR_FACTS,
    faqHeading: "Sıkça sorulan sorular",
    faqs: [
      {
        question: "GEO ile SEO arasındaki fark nedir?",
        answer:
          "SEO, arama sonuç sayfasındaki sıralamayı hedefler; GEO ise üretilmiş bir yanıt metninde anılmayı hedefler. Yanıt motoru tek bir cevap ürettiği için ikinci sayfa diye bir şey yoktur: ya metinde geçersiniz ya geçmezsiniz.",
      },
      {
        question: "Yapay zekâ asistanları bilgiyi nereden alıyor?",
        answer:
          "Modelin eğitim verisi ile canlı web araması birlikte kullanılır. Pratikte işletme adınızla ilgili açık web içerikleri, harita profilleri ve yorumlar yanıtın kaynağını oluşturur.",
      },
      {
        question: "Aynı soruyu iki kez sorunca neden farklı yanıt geliyor?",
        answer:
          "Üretken modeller olasılıksal çalışır ve canlı arama sonuçları da değişir. Bu yüzden ölçüm tek bir denemeye değil, sabit bir soru setinin tekrarlı çalıştırılmasına dayandırılır.",
      },
      {
        question: "Yorumlar yapay zekâ görünürlüğünü etkiler mi?",
        answer:
          "Yorum hacmi, güncelliği ve içeriğinde geçen konular, asistanların bir işletmeyi tarif ederken kullandığı ana malzemedir. Yanıtsız ve eski yorumlar, işletmeyi tarif edecek güncel metin bırakmaz.",
      },
      {
        question: "Görünürlük skoru neyi ifade ediyor?",
        answer:
          "Skor; sorulan sorularda anılma oranını, yanıt içindeki sırayı ve anılma bağlamının olumluluğunu birleştirir. Mutlak bir değer değil, zaman içindeki değişimi ve rakiplerle farkı okumak için bir göstergedir.",
      },
      {
        question: "Sonuç kötü çıkarsa ne yapılabilir?",
        answer:
          "İlk adım harita profilinin eksiksiz olması ve yorumların düzenli yanıtlanmasıdır. Ardından, motorların sizi anmadığı sorulardaki konu başlıklarını (örneğin \"aile dostu\", \"otopark\") gerçek içerikle karşılamak gerekir.",
      },
    ],
    ctaHeading: "Ücretsiz AI görünürlük kontrolü",
    ctaBody:
      "İşletme adınızı yazın; yanıt motorlarının sizi anıp anmadığını ve aynı soruda hangi rakiplerin çıktığını görün.",
    showChecker: true,
  },

  // ------------------------------------------------------------ 4 EN
  {
    slug: "ai-search-visibility",
    lang: "en",
    alt: "ai-gorunurluk",
    title: "AI Visibility (GEO): Is Your Business Cited? | VoyageRespond",
    description:
      "What AI visibility and GEO mean, why AI assistants now answer questions that used to go to search, and how to check whether your business appears.",
    eyebrow: "AI Visibility / GEO",
    h1: "AI Visibility (GEO): Does ChatGPT Mention Your Business?",
    definition:
      "AI visibility, also called GEO (generative engine optimization), is whether a business is named in the answers produced by generative engines such as ChatGPT, Gemini, Perplexity and Google AI Overviews. It is measured by asking those engines the real questions customers ask and recording whether the business appears, in what position, and in what context.",
    stepsHeading: "How it works",
    steps: [
      { title: "A question set is built", body: "Buying-intent questions are generated for your category and city, such as \"recommend a family hotel in Antalya\"." },
      { title: "Engines are queried", body: "The same questions are sent to several answer engines in parallel and the returned text is stored." },
      { title: "Answers are scanned", body: "Your business name and close spellings are searched inside each answer; if named, its position and context are recorded." },
      { title: "A score is calculated", body: "Mention rate, position and sentiment are combined into a visibility score, and the competitors that appear in the same answers are listed." },
      { title: "Actions are derived", body: "Questions where the engines skip you, missing information and weak topics become an action list." },
    ],
    tableHeading: "Checking by hand vs VoyageRespond",
    tableColumns: ["", "By hand", "VoyageRespond"],
    tableRows: [
      ["Engine coverage", "Asked one engine at a time", "Several engines queried in parallel"],
      ["Repeatability", "A different question every time", "Fixed question set, comparable results"],
      ["Competitor view", "None", "Competitors appearing in the same answer listed"],
      ["Record keeping", "Screenshots", "Score history kept over time"],
      ["Next step", "Interpretation", "Suggestions based on the missing topics"],
    ],
    factsHeading: "Scope and technical details",
    facts: EN_FACTS,
    faqHeading: "Frequently asked questions",
    faqs: [
      {
        question: "How is GEO different from SEO?",
        answer:
          "SEO targets a position on a results page, while GEO targets being named inside a generated answer. Because the engine produces a single answer, there is no second page: either you are in the text or you are not.",
      },
      {
        question: "Where do AI assistants get their information?",
        answer:
          "They combine the model's training data with live web search. In practice the open web pages about your business, its map profiles and its reviews are what the answer is built from.",
      },
      {
        question: "Why does the same question give different answers?",
        answer:
          "Generative models are probabilistic and live search results change too. That is why measurement relies on repeatedly running a fixed question set rather than a single attempt.",
      },
      {
        question: "Do reviews affect AI visibility?",
        answer:
          "Review volume, recency and the topics mentioned inside them are the main material assistants use to describe a business. Old, unanswered reviews leave nothing current to describe you with.",
      },
      {
        question: "What does the visibility score mean?",
        answer:
          "The score combines how often you are mentioned, where you appear in the answer, and how positive the context is. It is an indicator for tracking change over time and the gap to competitors, not an absolute value.",
      },
      {
        question: "What can be done if the result is poor?",
        answer:
          "Start with a complete map profile and a steady habit of replying to reviews. Then cover the topics that appear in the questions you are missing from, such as family friendliness or parking, with real content.",
      },
    ],
    ctaHeading: "Free AI visibility check",
    ctaBody:
      "Enter your business name to see whether answer engines mention you and which competitors show up in the same answer.",
    showChecker: true,
  },

  // ------------------------------------------------------------ 5 TR (hub)
  {
    slug: "isletme-yorum-yonetimi",
    lang: "tr",
    alt: "business-review-management",
    title: "İşletme Yorum Yönetimi: Kapsamlı Rehber | VoyageRespond",
    description:
      "İşletme yorum yönetimi nedir? Google yorumları, AI yanıt üretimi, işletme profili optimizasyonu ve yapay zekâda görünürlük rehberlerine tek sayfadan ulaşın.",
    eyebrow: "Rehber Merkezi",
    h1: "İşletme Yorum Yönetimi Nedir ve Nereden Başlanır?",
    definition:
      "İşletme yorum yönetimi, bir işletme hakkında farklı platformlarda yazılan yorumların toplanması, yanıtlanması, konu ve duygu bazında analiz edilmesi ve sonuçların operasyona geri beslenmesidir. Kapsamı; harita profilinin doğruluğu, yanıt hızı ve tutarlılığı ile bu içeriklerin arama ve yapay zekâ yanıtlarındaki yansımasını içerir.",
    stepsHeading: "Yorum yönetimi programı nasıl kurulur?",
    steps: [
      { title: "Kaynakları toplayın", body: "İşletmenizin yorum aldığı tüm platformları listeleyin ve hepsini tek bir görünümde birleştirin." },
      { title: "Yanıt standardı belirleyin", body: "Kimin, ne kadar sürede, hangi tonda yanıt yazacağını yazılı bir kurala bağlayın." },
      { title: "Konuları ölçün", body: "Yorumları konu başlıklarına ayırın; puanı düşüren konuyu operasyona iletin." },
      { title: "Profili güncel tutun", body: "Harita profilindeki bilgiler eksikse yorum yönetiminin etkisi sınırlı kalır." },
      { title: "Görünürlüğü izleyin", body: "Arama ve yapay zekâ yanıtlarında nasıl anıldığınızı düzenli olarak ölçün." },
    ],
    tableHeading: "Dağınık yönetim ile tek panel karşılaştırması",
    tableColumns: ["", "Dağınık yönetim", "VoyageRespond"],
    tableRows: [
      ["Platform sayısı", "Her platform ayrı hesap", "15 platform tek panelde"],
      ["Yanıt tutarlılığı", "Kişiye göre değişir", "Tek marka sesi profili"],
      ["Analiz", "Elle okuma", "Otomatik konu ve duygu kırılımı"],
      ["Çoklu lokasyon", "Ayrı ayrı takip", "Lokasyonlar arası karşılaştırma"],
      ["AI görünürlüğü", "Ölçülmüyor", "Yanıt motorlarında anılma ölçümü"],
    ],
    factsHeading: "Kapsam ve teknik bilgiler",
    facts: TR_FACTS,
    faqHeading: "Sıkça sorulan sorular",
    faqs: [
      {
        question: "Yorum yönetimine nereden başlamalıyım?",
        answer:
          "Google İşletme Profili çoğu işletme için en yüksek hacimli kaynaktır, bu yüzden oradan başlamak mantıklıdır. Profil doğrulandıktan ve yanıtsız yorumlar kapatıldıktan sonra diğer platformlar eklenir.",
      },
      {
        question: "Her yoruma cevap vermek gerekir mi?",
        answer:
          "Olumsuz ve detaylı yorumlar önceliklidir; bunlar potansiyel müşteriler tarafından en çok okunanlardır. Olumlu yorumlara kısa ve kişiselleştirilmiş yanıtlar yanıt oranını ve profil canlılığını korur.",
      },
      {
        question: "Yanıt süresi ne kadar olmalı?",
        answer:
          "Pratikte 24-48 saat içinde yanıtlamak, konunun taze olduğu dönemde yanıt vermenizi sağlar. Bildirim kurulmadığında bu süre çoğu işletmede haftalara çıkar.",
      },
      {
        question: "Yorum yönetimi ile itibar yönetimi aynı şey mi?",
        answer:
          "Yorum yönetimi, itibar yönetiminin ölçülebilir ve operasyonel parçasıdır. İtibar yönetimi ayrıca basın, sosyal medya ve marka iletişimini de kapsar.",
      },
      {
        question: "Küçük bir işletme için de anlamlı mı?",
        answer:
          "Evet; yorum sayısı azaldıkça tek bir olumsuz yorumun ortalamaya etkisi artar. Az sayıda yorumu olan işletmelerde düzenli yanıt ve yorum toplama alışkanlığı en hızlı sonucu verir.",
      },
    ],
    ctaHeading: "Görünürlüğünüzü ölçerek başlayın",
    ctaBody:
      "İşletme adınızı girin; yapay zekâ asistanlarında nasıl göründüğünüzü ücretsiz kontrol edin.",
    links: [
      {
        slug: "google-yorum-yonetimi",
        title: "Google Yorum Yönetimi",
        body: "Google İşletme Profili'ne gelen yorumları resmî API üzerinden tek panelde toplama, WhatsApp bildirimiyle anında haberdar olma ve onayınızla yanıt yayınlama sürecinin tamamı. Yanıt yazma süresini yorum başına dakikalardan saniyelere indiren akış burada anlatılıyor.",
      },
      {
        slug: "yapay-zeka-yorum-cevaplama",
        title: "Yapay Zekâ ile Yorum Cevaplama",
        body: "Yanıtın yorumun yazıldığı dilde üretilmesi, geçmiş yanıtlarınızdan çıkarılan marka sesi profili ve yayın öncesi zorunlu insan onayı. Yapay zekâ taslağının neden şablon bir metinden farklı olduğunu ve süreçte kontrolün nasıl sizde kaldığını açıklıyor.",
      },
      {
        slug: "google-isletme-profili-optimizasyonu",
        title: "Google İşletme Profili Optimizasyonu",
        body: "Eksiksiz bir profilin neleri içerdiği, kategori seçiminin yerel keşifteki rolü, fotoğraf ve çalışma saatlerinin etkisi. Profili doğruladıktan sonra yorum ve yanıt katmanının nasıl güncel tutulacağını adım adım gösteriyor.",
      },
      {
        slug: "ai-gorunurluk",
        title: "Yapay Zekâda Görünürlük (GEO)",
        body: "ChatGPT, Gemini ve Perplexity'nin ürettiği yanıtlarda anılmanın ne anlama geldiği, ölçümün nasıl yapıldığı ve skorun nasıl okunacağı. Sayfadaki ücretsiz kontrol aracıyla işletme adınızı girip sonucu hemen görebilirsiniz.",
      },
    ],
  },

  // ------------------------------------------------------------ 5 EN (hub)
  {
    slug: "business-review-management",
    lang: "en",
    alt: "isletme-yorum-yonetimi",
    title: "Business Review Management: Complete Guide | VoyageRespond",
    description:
      "What business review management is, and guides to Google reviews, AI review response, Business Profile optimization and AI visibility in one place.",
    eyebrow: "Guide Hub",
    h1: "Business Review Management: What It Is and Where to Start",
    definition:
      "Business review management is the practice of collecting the reviews written about a business across platforms, replying to them, analysing them by topic and sentiment, and feeding the findings back into operations. Its scope covers the accuracy of the map profile, the speed and consistency of replies, and how that content surfaces in search and AI answers.",
    stepsHeading: "How to set up a review management programme",
    steps: [
      { title: "Collect the sources", body: "List every platform where your business receives reviews and bring them into a single view." },
      { title: "Set a reply standard", body: "Write down who replies, within what time, and in what tone." },
      { title: "Measure topics", body: "Split reviews into topics and pass the topic that drags your rating down to operations." },
      { title: "Keep the profile current", body: "If the map profile is incomplete, review management alone has limited effect." },
      { title: "Track visibility", body: "Regularly measure how you are mentioned in search and in AI-generated answers." },
    ],
    tableHeading: "Scattered management vs one dashboard",
    tableColumns: ["", "Scattered management", "VoyageRespond"],
    tableRows: [
      ["Platform count", "A separate login for each", "15 platforms in one dashboard"],
      ["Reply consistency", "Varies per person", "One brand-voice profile"],
      ["Analysis", "Reading one by one", "Automatic topic and sentiment breakdown"],
      ["Multiple locations", "Tracked separately", "Side-by-side location comparison"],
      ["AI visibility", "Not measured", "Mention tracking across answer engines"],
    ],
    factsHeading: "Scope and technical details",
    facts: EN_FACTS,
    faqHeading: "Frequently asked questions",
    faqs: [
      {
        question: "Where should I start with review management?",
        answer:
          "Google Business Profile is the highest-volume source for most businesses, so it is the sensible starting point. Once the profile is verified and unanswered reviews are cleared, other platforms can be added.",
      },
      {
        question: "Do I need to reply to every review?",
        answer:
          "Negative and detailed reviews come first because prospective customers read those most. Short, personalised replies to positive reviews keep the response rate and the profile's activity up.",
      },
      {
        question: "How quickly should I reply?",
        answer:
          "Replying within 24 to 48 hours keeps the exchange relevant while the visit is still recent. Without a notification in place, that window stretches into weeks for most businesses.",
      },
      {
        question: "Is review management the same as reputation management?",
        answer:
          "Review management is the measurable, operational part of reputation management. Reputation management also covers press, social media and wider brand communication.",
      },
      {
        question: "Is it worthwhile for a small business?",
        answer:
          "Yes; the fewer reviews you have, the more a single negative one moves the average. For low-volume businesses, replying consistently and asking customers for reviews produces the fastest change.",
      },
    ],
    ctaHeading: "Start by measuring your visibility",
    ctaBody:
      "Enter your business name and check for free how you appear in AI assistants.",
    links: [
      {
        slug: "google-review-management",
        title: "Google Review Management",
        body: "The full flow for collecting Google Business Profile reviews through the official API, being notified instantly on WhatsApp, and publishing replies after your approval. It explains how reply time drops from minutes per review to seconds.",
      },
      {
        slug: "ai-review-response",
        title: "AI Review Response",
        body: "Replies drafted in the reviewer's own language, a brand-voice profile learned from your past replies, and a mandatory human approval step. It explains why an AI draft differs from a template and how control stays with you.",
      },
      {
        slug: "google-business-profile-optimization",
        title: "Google Business Profile Optimization",
        body: "What a complete profile contains, the role of category selection in local discovery, and the effect of photos and opening hours. It walks through keeping the review and reply layer current after verification.",
      },
      {
        slug: "ai-search-visibility",
        title: "AI Visibility (GEO)",
        body: "What it means to be named in answers produced by ChatGPT, Gemini and Perplexity, how the measurement works, and how to read the score. The free checker on that page returns a result for your business name straight away.",
      },
    ],
  },
];

export const geoPageBySlug = (slug: string): GeoPage | undefined =>
  geoPages.find((p) => p.slug === slug);

export const geoSlugs = (): string[] => geoPages.map((p) => p.slug);
