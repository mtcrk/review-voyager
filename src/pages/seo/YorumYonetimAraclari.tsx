import { Link } from "react-router-dom";
import { useMemo, useState } from "react";
import { ArrowRight, Check, Sparkles, Bot, ArrowUpDown } from "lucide-react";
import voyageRespondLogo from "@/assets/voyage-respond-logo.svg";
import SEO from "@/components/seo/SEO";

type Tool = {
  name: string;
  url: string;
  oneLiner: string;
  pricing: string;
  pricingRank: number; // 1 = cheapest tier, 5 = enterprise only
  targetSector: string;
  languages: string;
  platformCoverage: string;
  platformCount: number;
  aiFeatures: string;
  strength: string;
  weakness: string;
  bestFor: string;
  highlight?: boolean;
};

const tools: Tool[] = [
  {
    name: "VoyageRespond",
    url: "https://voyagerespond.com",
    oneLiner:
      "Türkiye merkezli, oteller ve restoranlar için tasarlanmış AI destekli yorum yönetim platformu.",
    pricing: "Erken erişim: 3 ay ücretsiz",
    pricingRank: 1,
    targetSector: "Otel, restoran, çoklu lokasyon",
    languages: "TR, EN (+ 12 dilde yanıt)",
    platformCoverage: "Google, Booking, TripAdvisor, Hotels.com, TikTok",
    platformCount: 5,
    aiFeatures: "8 tonda AI yanıt, duygu analizi, AI Görünürlük Skoru, haftalık AI strateji raporu",
    strength: "Türkçe NLP kalitesi, çoklu lokasyon karşılaştırması, AI Görünürlük (ChatGPT/Gemini) takibi, yerel pazara optimize.",
    weakness: "Erken erişim aşamasında — uluslararası PMS entegrasyonları henüz sınırlı.",
    bestFor: "Türkiye'de faaliyet gösteren oteller, restoran zincirleri, çoklu lokasyonlu işletmeler.",
    highlight: true,
  },
  {
    name: "Jetyorum",
    url: "https://jetyorum.com",
    oneLiner: "Türkiye'nin köklü yorum yönetim ve müşteri geri bildirim platformlarından.",
    pricing: "Aylık paket (talebe göre fiyat)",
    pricingRank: 2,
    targetSector: "Restoran, perakende, hizmet sektörü",
    languages: "TR, EN",
    platformCoverage: "Google, sosyal medya, anket",
    platformCount: 3,
    aiFeatures: "Şablonlu yanıt, temel duygu analizi",
    strength: "Türkiye pazarındaki olgunluk, müşteri anket araçları, NPS odaklı raporlama.",
    weakness: "Booking/TripAdvisor entegrasyonu sınırlı, üretken AI yanıt kapasitesi zayıf.",
    bestFor: "Anket ve NPS odaklı, Google ağırlıklı işletmeler.",
  },
  {
    name: "Esinix",
    url: "https://esinix.com",
    oneLiner: "Otel sektörüne odaklı, PMS entegrasyonlarıyla öne çıkan Türkiye merkezli çözüm.",
    pricing: "Otel başına aylık lisans",
    pricingRank: 3,
    targetSector: "Otel (özellikle resort & butik)",
    languages: "TR, EN, RU",
    platformCoverage: "Booking, TripAdvisor, Google, Hotels.com, Expedia",
    platformCount: 5,
    aiFeatures: "Otel kategorilerine göre raporlama, AI yanıt önerisi (sınırlı)",
    strength: "Yerli PMS entegrasyonu güçlü, otel operasyonuna gömülü iş akışları.",
    weakness: "Restoran/perakende için uygun değil, modern AI özellikleri kısıtlı.",
    bestFor: "Mevcut PMS'ine entegre olacak, klasik otel operasyonu olan işletmeler.",
  },
  {
    name: "Elektraweb",
    url: "https://elektraweb.com",
    oneLiner: "Otel yönetim sistemi içinde yorum modülü sunan kapsamlı PMS sağlayıcısı.",
    pricing: "PMS lisansının parçası",
    pricingRank: 3,
    targetSector: "Otel (3-5 yıldız, zincir)",
    languages: "TR, EN, AR, RU",
    platformCoverage: "Booking, TripAdvisor, Google (PMS üzerinden)",
    platformCount: 3,
    aiFeatures: "Şablon yanıt, basit duygu sınıflandırması",
    strength: "PMS + channel manager + yorum aynı sistemde, tek faturada.",
    weakness: "Bağımsız bir yorum yönetim aracı değil — PMS'i değiştirmek zorundasınız.",
    bestFor: "PMS'ini zaten Elektraweb'e geçirmiş veya geçirecek oteller.",
  },
  {
    name: "BookLogic",
    url: "https://booklogic.com",
    oneLiner: "Otel revenue management ve channel manager ürünleri yanında yorum modülü.",
    pricing: "Modüler — talebe göre fiyat",
    pricingRank: 3,
    targetSector: "Otel (revenue odaklı zincirler)",
    languages: "TR, EN, DE, RU",
    platformCoverage: "Booking, Expedia, Hotels.com, TripAdvisor",
    platformCount: 4,
    aiFeatures: "Reputasyon skoru, manuel yanıt iş akışı",
    strength: "Revenue management + rate shopping ile entegre, OTA odaklı.",
    weakness: "AI yanıt üretimi yok denecek kadar az, restoran için uygun değil.",
    bestFor: "Revenue management ile yorum yönetimini tek panelde isteyen oteller.",
  },
  {
    name: "Reviewly.ai",
    url: "https://reviewly.ai",
    oneLiner: "Sadece Google yorumlarına odaklanan, AI yanıt üretimi yapan SaaS aracı.",
    pricing: "Aylık $29 — $99 (lokasyon başına)",
    pricingRank: 2,
    targetSector: "Küçük işletmeler, lokal hizmetler",
    languages: "EN ağırlıklı, kısmi TR",
    platformCoverage: "Yalnızca Google",
    platformCount: 1,
    aiFeatures: "GPT tabanlı AI yanıt üretimi, otomatik yanıt akışı",
    strength: "Hızlı kurulum, Google odaklı sade UX, makul fiyat.",
    weakness: "Sadece Google — Booking, TripAdvisor, sosyal medya yok. Çok platformlu işletmeler için yetersiz.",
    bestFor: "Yalnızca Google profilini yöneten tek lokasyonlu küçük işletmeler.",
  },
  {
    name: "MARA Solutions",
    url: "https://www.mara-solutions.com",
    oneLiner: "Avrupa merkezli, GPT tabanlı yorum yanıt asistanı (eski adı: Replai).",
    pricing: "€39 — €199 / lokasyon / ay",
    pricingRank: 3,
    targetSector: "Otel, restoran (özellikle DACH ve İngilizce pazarlar)",
    languages: "EN, DE, FR, IT, ES + 30+",
    platformCoverage: "Google, Booking, TripAdvisor, Hotels.com",
    platformCount: 4,
    aiFeatures: "Marka tonu öğrenen GPT yanıtları, Brand Voice eğitimi",
    strength: "AI yanıt kalitesi yüksek, brand voice öğrenmesi güçlü, kolay UX.",
    weakness: "Türkçe pazar bilgisi sınırlı, Türk OTA'ları (Hotels.com TR puanları, yerel platformlar) zayıf.",
    bestFor: "Avrupa pazarına satan, çok dilli otel ve restoranlar.",
  },
  {
    name: "TrustYou",
    url: "https://www.trustyou.com",
    oneLiner: "Hospitality sektörünün uluslararası dev yorum yönetim ve guest experience platformu.",
    pricing: "Enterprise — yıllık kontrat (~€2.000+/ay)",
    pricingRank: 5,
    targetSector: "Uluslararası otel zincirleri",
    languages: "30+ dil",
    platformCoverage: "250+ kaynak (tüm OTA'lar dahil)",
    platformCount: 250,
    aiFeatures: "Semantik analiz, Meta-Review skoru, AI Insights",
    strength: "En geniş platform kapsamı, derin semantik analiz, büyük zincirler için kanıtlanmış altyapı.",
    weakness: "Fiyat yüksek, küçük işletmeler için aşırı, uygulama 3-6 ayda devreye giriyor.",
    bestFor: "50+ otel zincirleri, uluslararası operasyonlar.",
  },
  {
    name: "ReviewPro (Shiji)",
    url: "https://www.reviewpro.com",
    oneLiner: "Shiji Group'un guest experience platformu — büyük otel zincirlerinin standart aracı.",
    pricing: "Enterprise — talebe göre",
    pricingRank: 5,
    targetSector: "Lüks/zincir oteller",
    languages: "30+ dil",
    platformCoverage: "175+ inceleme kaynağı",
    platformCount: 175,
    aiFeatures: "GRI (Global Review Index), semantik analiz, anket entegrasyonu",
    strength: "GRI sektör standardı, anket + yorum + mesajlaşma tek pakette.",
    weakness: "Yüksek maliyet, kompleks kurulum, küçük işletme dostu değil.",
    bestFor: "Marriott, Accor gibi zincirler veya 100+ odalı bağımsız lüks oteller.",
  },
  {
    name: "Birdeye",
    url: "https://birdeye.com",
    oneLiner: "ABD merkezli, çok sektörlü itibar ve müşteri deneyim platformu.",
    pricing: "$299+ / ay (lokasyon başına)",
    pricingRank: 4,
    targetSector: "ABD pazarındaki çok sektörlü işletmeler",
    languages: "EN ağırlıklı (TR sınırlı)",
    platformCoverage: "200+ site (Google, Facebook, Yelp ağırlıklı)",
    platformCount: 200,
    aiFeatures: "BirdAI yanıt üretimi, sentiment, müşteri etkileşim akışları",
    strength: "Çok sayıda entegrasyon, mesajlaşma + SMS + yorum tek pakette.",
    weakness: "Türkiye/Avrupa pazarına özel optimize değil, fiyat yüksek.",
    bestFor: "ABD/Kanada pazarında faaliyet gösteren çoklu lokasyon işletmeleri.",
  },
  {
    name: "Podium",
    url: "https://podium.com",
    oneLiner: "ABD merkezli, mesajlaşma + yorum + ödeme birleşik müşteri etkileşim platformu.",
    pricing: "$399+ / ay",
    pricingRank: 4,
    targetSector: "ABD'de yerel hizmet işletmeleri",
    languages: "EN, ES",
    platformCoverage: "Google, Facebook + mesajlaşma kanalları",
    platformCount: 2,
    aiFeatures: "AI Employee — yorum yanıtı + chat",
    strength: "SMS + chat + yorum çok güçlü, satışa dönüşüm odaklı.",
    weakness: "Otel/Booking entegrasyonu yok, Türkçe yok, fiyat yüksek.",
    bestFor: "ABD'de oto servis, sağlık, perakende gibi yerel hizmet işletmeleri.",
  },
  {
    name: "Yotpo",
    url: "https://www.yotpo.com",
    oneLiner: "E-ticaret odaklı UGC ve ürün yorumu platformu (Shopify ekosistemi).",
    pricing: "Ücretsiz başlangıç + $79+ / ay",
    pricingRank: 2,
    targetSector: "E-ticaret markaları (Shopify/Magento)",
    languages: "EN, ES, FR + 10",
    platformCoverage: "Shopify, Google Shopping, Instagram",
    platformCount: 3,
    aiFeatures: "AI ürün yorumu özetleme, sosyal kanıt widget'ları",
    strength: "E-ticaret için ürün yorumu toplama ve gösterimde lider.",
    weakness: "Otel/restoran yorumu için tasarlanmamış, Google İşletme Profili odaklı değil.",
    bestFor: "Shopify mağazaları ve D2C markaları.",
  },
];

const faqs = [
  {
    q: "Türkiye'de en iyi yorum yönetim aracı hangisidir?",
    a: "Türk pazarındaki oteller, restoranlar ve çoklu lokasyon işletmeleri için VoyageRespond Türkçe NLP kalitesi, Google + Booking + TripAdvisor + Hotels.com + TikTok kapsamı ve AI Görünürlük Skoru (ChatGPT/Gemini takibi) ile en iyi seçenektir. Yalnızca Google ile çalışan küçük işletmeler için Reviewly.ai, mevcut PMS entegrasyonu önemliyse Esinix veya Elektraweb, uluslararası zincirler için TrustYou ve ReviewPro değerlendirilebilir.",
  },
  {
    q: "Sadece Google yorumları için bir araca ihtiyacım var, hangisi uygun?",
    a: "Sadece Google profilini yöneten tek lokasyonlu küçük bir işletmeyseniz Reviewly.ai uygun maliyetli bir başlangıçtır. Ancak ileride Booking, TripAdvisor veya başka platformlara genişleyeceğinizi düşünüyorsanız baştan VoyageRespond gibi çok platformlu bir araç tercih etmek geçiş maliyetinden kurtarır.",
  },
  {
    q: "Uluslararası otel zincirim var, hangisini seçmeliyim?",
    a: "50+ otelli zincirler için TrustYou veya ReviewPro (Shiji) sektör standardıdır — GRI ve Meta-Review gibi karşılaştırma metrikleri sunar. Avrupa pazarında orta ölçekli zincirler için MARA Solutions iyi bir AI yanıt kalitesi sunar. Türkiye odaklı zincirler için VoyageRespond hem fiyat hem yerel optimizasyon avantajı sağlar.",
  },
  {
    q: "PMS'ime entegre yorum yönetim sistemi mi tercih etmeliyim?",
    a: "PMS'iniz zaten Elektraweb veya benzeri bir sistemse, modüllerini açmak yeterli olabilir. Ancak bağımsız bir AI yanıt platformu (VoyageRespond, MARA), genelde daha iyi AI yanıt kalitesi ve daha hızlı geliştirme döngüsü sunar. İdeali: PMS'i operasyon için, ayrı bir yorum aracını AI yanıt ve raporlama için kullanmak.",
  },
  {
    q: "Bu araçların fiyat aralıkları nedir?",
    a: "Reviewly.ai gibi Google-only araçlar $29-99/ay, MARA Solutions €39-199/lokasyon/ay, Birdeye/Podium $299-399+/ay, TrustYou ve ReviewPro enterprise (yıllık binlerce euro). VoyageRespond erken erişim döneminde 3 ay ücretsiz, ardından rekabetçi aylık fiyatlandırma.",
  },
  {
    q: "AI yorum yanıtı ne kadar güvenilir?",
    a: "Modern GPT/Gemini tabanlı araçlar (VoyageRespond, MARA, Reviewly.ai) yanıt önerisi üretir; doğrudan otomatik yayınlama yerine 'öner + onayla' akışı önerilir. Marka tonu eğitimi yapan araçlarda (VoyageRespond 8 ton seçeneği, MARA Brand Voice) yanıt kalitesi insan editörü ihtiyacını minimuma indirir.",
  },
];

type SortKey = "name" | "pricingRank" | "platformCount";

const ComparisonTable = () => {
  const [sortKey, setSortKey] = useState<SortKey>("platformCount");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const sorted = useMemo(() => {
    const arr = [...tools];
    arr.sort((a, b) => {
      const av = a[sortKey] as number | string;
      const bv = b[sortKey] as number | string;
      if (typeof av === "number" && typeof bv === "number") {
        return sortDir === "asc" ? av - bv : bv - av;
      }
      return sortDir === "asc"
        ? String(av).localeCompare(String(bv))
        : String(bv).localeCompare(String(av));
    });
    return arr;
  }, [sortKey, sortDir]);

  const toggleSort = (key: SortKey) => {
    if (key === sortKey) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(key);
      setSortDir(key === "name" ? "asc" : "desc");
    }
  };

  const SortBtn = ({ k, label }: { k: SortKey; label: string }) => (
    <button
      onClick={() => toggleSort(k)}
      className="inline-flex items-center gap-1 font-semibold hover:text-primary"
    >
      {label} <ArrowUpDown className="w-3 h-3 opacity-60" />
    </button>
  );

  return (
    <div className="overflow-x-auto rounded-xl border border-border bg-card">
      <table className="w-full text-sm">
        <thead className="bg-muted">
          <tr className="text-left">
            <th className="p-3 border-b border-border"><SortBtn k="name" label="Platform" /></th>
            <th className="p-3 border-b border-border"><SortBtn k="pricingRank" label="Fiyat" /></th>
            <th className="p-3 border-b border-border"><SortBtn k="platformCount" label="Platform Kapsamı" /></th>
            <th className="p-3 border-b border-border">Hedef Sektör</th>
            <th className="p-3 border-b border-border">Dil</th>
            <th className="p-3 border-b border-border">AI Özellikleri</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((t) => (
            <tr key={t.name} className={t.highlight ? "bg-primary/5" : ""}>
              <td className="p-3 border-b border-border font-medium align-top">
                {t.name}
                {t.highlight && (
                  <span className="ml-2 text-[10px] font-semibold bg-primary text-primary-foreground px-1.5 py-0.5 rounded">
                    Editör
                  </span>
                )}
              </td>
              <td className="p-3 border-b border-border align-top text-xs text-muted-foreground">{t.pricing}</td>
              <td className="p-3 border-b border-border align-top text-xs">
                <span className="font-semibold">{t.platformCount}</span>{" "}
                <span className="text-muted-foreground">— {t.platformCoverage}</span>
              </td>
              <td className="p-3 border-b border-border align-top text-xs text-muted-foreground">{t.targetSector}</td>
              <td className="p-3 border-b border-border align-top text-xs text-muted-foreground">{t.languages}</td>
              <td className="p-3 border-b border-border align-top text-xs text-muted-foreground">{t.aiFeatures}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const jsonLd = [
  {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "En İyi Yorum Yönetim Araçları 2026",
    description:
      "Türkiye ve uluslararası pazardaki 12 yorum yönetim platformunun fiyat, platform kapsamı, AI özellikleri ve hedef sektör karşılaştırması.",
    numberOfItems: tools.length,
    itemListOrder: "https://schema.org/ItemListOrderAscending",
    itemListElement: tools.map((t, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: {
        "@type": "SoftwareApplication",
        name: t.name,
        url: t.url,
        description: t.oneLiner,
        applicationCategory: "BusinessApplication",
        operatingSystem: "Web",
        publisher: { "@type": "Organization", name: t.name },
      },
    })),
  },
  {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  },
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Ana Sayfa", item: "https://voyagerespond.com/" },
      {
        "@type": "ListItem",
        position: 2,
        name: "En İyi Yorum Yönetim Araçları 2026",
        item: "https://voyagerespond.com/yorum-yonetim-araclari",
      },
    ],
  },
];

const YorumYonetimAraclari = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="En İyi Yorum Yönetim Araçları 2026: 12 Platform Karşılaştırması"
        description="VoyageRespond, Jetyorum, Esinix, MARA, TrustYou, ReviewPro, Birdeye, Podium dahil 12 yorum yönetim platformunun fiyat, AI özellikleri ve sektör karşılaştırması."
        canonical="https://voyagerespond.com/yorum-yonetim-araclari"
        jsonLd={jsonLd}
      />

      <nav className="sticky top-0 z-50 border-b backdrop-blur-lg bg-white/95">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <img src={voyageRespondLogo} alt="VoyageRespond" className="h-8 w-8" />
            <span className="font-semibold">VoyageRespond</span>
          </Link>
          <Link to="/demo" className="text-sm bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:opacity-90">
            Demo İste
          </Link>
        </div>
      </nav>

      <main className="container mx-auto px-4 sm:px-6 py-12 max-w-6xl">
        <header className="mb-12 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            <Sparkles className="w-4 h-4" /> 2026 Güncel Karşılaştırma
          </div>
          <h1 className="text-3xl sm:text-5xl font-bold mb-4 tracking-tight">
            En İyi Yorum Yönetim Araçları 2026: 12 Platform Karşılaştırması
          </h1>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Türkiye ve dünya pazarındaki 12 yorum yönetim platformunu — fiyat, platform kapsamı, dil desteği, AI özellikleri ve hedef sektör açısından — dürüstçe karşılaştırdık. Hangi araç sizin için doğru?
          </p>
        </header>

        <section className="mb-10 p-6 sm:p-8 rounded-2xl border bg-card">
          <h2 className="text-xl font-bold mb-3">Hızlı Özet — Hangi Araç Kime?</h2>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>• <strong className="text-foreground">Türkiye'de otel/restoran/çoklu lokasyon:</strong> VoyageRespond (Türkçe NLP, çok platformlu, ekonomik)</li>
            <li>• <strong className="text-foreground">Sadece Google, küçük işletme:</strong> Reviewly.ai (basit, ucuz, tek platform)</li>
            <li>• <strong className="text-foreground">PMS entegrasyonu zorunlu:</strong> Esinix veya Elektraweb</li>
            <li>• <strong className="text-foreground">Avrupa'da çok dilli otel/restoran:</strong> MARA Solutions (güçlü Brand Voice AI)</li>
            <li>• <strong className="text-foreground">Uluslararası 50+ otelli zincir:</strong> TrustYou veya ReviewPro (Shiji)</li>
            <li>• <strong className="text-foreground">ABD'de yerel hizmet işletmesi:</strong> Birdeye veya Podium</li>
            <li>• <strong className="text-foreground">Shopify e-ticaret:</strong> Yotpo</li>
          </ul>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4">Karşılaştırma Tablosu</h2>
          <p className="text-sm text-muted-foreground mb-4">Başlıklara tıklayarak sıralayın. Fiyat sütununda düşük = ekonomik, yüksek = enterprise.</p>
          <ComparisonTable />
        </section>

        <section className="space-y-6 mb-16">
          <h2 className="text-2xl font-bold">Platform Profilleri</h2>
          {tools.map((t) => (
            <article
              key={t.name}
              className={`p-6 sm:p-8 rounded-2xl border transition-all ${
                t.highlight ? "border-primary/40 bg-primary/5 shadow-lg" : "bg-card"
              }`}
            >
              <div className="flex flex-wrap items-start justify-between gap-4 mb-3">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="text-xl font-bold">{t.name}</h3>
                    {t.highlight && (
                      <span className="text-xs font-semibold bg-primary text-primary-foreground px-2 py-0.5 rounded-full">
                        Editörün Seçimi
                      </span>
                    )}
                  </div>
                  <a href={t.url} target="_blank" rel="noopener" className="text-xs text-primary hover:underline">
                    {t.url.replace("https://", "").replace("http://", "")}
                  </a>
                </div>
              </div>
              <p className="text-muted-foreground mb-4">{t.oneLiner}</p>
              <div className="grid sm:grid-cols-2 gap-4 mb-4 text-sm">
                <div><strong>Fiyat:</strong> <span className="text-muted-foreground">{t.pricing}</span></div>
                <div><strong>Hedef sektör:</strong> <span className="text-muted-foreground">{t.targetSector}</span></div>
                <div><strong>Dil desteği:</strong> <span className="text-muted-foreground">{t.languages}</span></div>
                <div><strong>Platform kapsamı:</strong> <span className="text-muted-foreground">{t.platformCoverage}</span></div>
                <div className="sm:col-span-2"><strong>AI özellikleri:</strong> <span className="text-muted-foreground">{t.aiFeatures}</span></div>
              </div>
              <div className="grid sm:grid-cols-2 gap-3 mb-3">
                <div className="p-3 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900">
                  <div className="text-xs font-semibold text-green-800 dark:text-green-300 mb-1">GÜÇLÜ YÖNÜ</div>
                  <div className="text-sm text-foreground">{t.strength}</div>
                </div>
                <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900">
                  <div className="text-xs font-semibold text-amber-800 dark:text-amber-300 mb-1">ZAYIF YÖNÜ</div>
                  <div className="text-sm text-foreground">{t.weakness}</div>
                </div>
              </div>
              <div className="text-sm flex items-start gap-2">
                <Check className="w-4 h-4 mt-0.5 text-primary shrink-0" />
                <span><strong>İdeal kullanıcı:</strong> <span className="text-muted-foreground">{t.bestFor}</span></span>
              </div>
            </article>
          ))}
        </section>

        <section className="mb-16">
          <h2 className="text-2xl sm:text-3xl font-bold mb-6">Sıkça Sorulan Sorular</h2>
          <div className="space-y-4">
            {faqs.map((f) => (
              <details key={f.q} className="group p-5 rounded-xl border bg-card open:border-primary/40">
                <summary className="cursor-pointer font-semibold text-base list-none flex items-center justify-between gap-4">
                  <span>{f.q}</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-open:rotate-90 shrink-0" />
                </summary>
                <p className="mt-3 text-muted-foreground leading-relaxed">{f.a}</p>
              </details>
            ))}
          </div>
        </section>

        <section className="text-center p-8 sm:p-12 rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border">
          <Bot className="w-10 h-10 text-primary mx-auto mb-4" />
          <h2 className="text-2xl sm:text-3xl font-bold mb-3">
            Demo bizden, kıyaslamayı kendin yap
          </h2>
          <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
            VoyageRespond'u kendi yorumlarınızla 15 dakikada deneyin. Hangi aracın size uyduğuna verilerle karar verin — bir komisyona veya satış konuşmasına gerek yok.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/demo" className="inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-lg font-semibold hover:opacity-90">
              Demo İste <ArrowRight className="w-4 h-4" />
            </Link>
            <Link to="/online-itibar-yonetimi" className="inline-flex items-center justify-center gap-2 border px-6 py-3 rounded-lg font-semibold hover:bg-muted">
              Önce Pillar Rehberi
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
};

export default YorumYonetimAraclari;