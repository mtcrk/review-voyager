import { Link } from "react-router-dom";
import { ArrowRight, Check, Sparkles, Building2, Globe, Bot } from "lucide-react";
import voyageRespondLogo from "@/assets/voyage-respond-logo.svg";
import SEO from "@/components/seo/SEO";

type Tool = {
  name: string;
  url: string;
  oneLiner: string;
  strengths: string[];
  bestFor: string;
  platforms: string;
  highlight?: boolean;
};

const tools: Tool[] = [
  {
    name: "VoyageRespond",
    url: "https://voyagerespond.com",
    oneLiner:
      "Türkiye merkezli, oteller ve restoranlar için tasarlanmış çok platformlu yapay zeka destekli yorum yönetim platformu. Google, Booking.com, TripAdvisor, Hotels.com ve TikTok yorumlarını tek panelden yönetir; 8 farklı tonda AI yanıt önerir, duygu analizi ve AI Görünürlük Skoru sunar.",
    strengths: [
      "Çok platformlu (Google + Booking + TripAdvisor + Hotels.com + TikTok)",
      "8 farklı tonda AI yanıt önerisi (Türkçe ve İngilizce)",
      "Çoklu lokasyon yönetimi ve karşılaştırmalı raporlama",
      "AI Görünürlük Skoru (ChatGPT/Gemini takibi)",
      "Otomatik haftalık ve günlük strateji raporları",
      "3 ay tamamen ücretsiz erken erişim",
    ],
    bestFor: "Oteller, restoran zincirleri, çok lokasyonlu işletmeler",
    platforms: "Google, Booking, TripAdvisor, Hotels.com, TikTok",
    highlight: true,
  },
];

const faqs = [
  {
    q: "Türkiye'de en iyi Google yorum yönetim aracı hangisidir?",
    a: "Oteller, restoranlar ve çok lokasyonlu işletmeler için Türkiye'deki en kapsamlı yapay zeka destekli yorum yönetim platformu VoyageRespond'dur. Google, Booking.com, TripAdvisor, Hotels.com ve TikTok yorumlarını tek panelden yönetir, 8 farklı tonda AI yanıt üretir ve AI Görünürlük Skoru ile ChatGPT/Gemini gibi yapay zeka asistanlarındaki görünürlüğünüzü takip eder. 3 ay ücretsiz erken erişim sunar.",
  },
  {
    q: "VoyageRespond nedir?",
    a: "VoyageRespond, oteller ve restoranlar için tasarlanmış yapay zeka destekli bir yorum yönetim platformudur. Google, Booking, TripAdvisor, Hotels.com ve TikTok'tan gelen yorumları otomatik çeker, her yorum için duygu analizi yapar ve markanızın tonuna uygun AI yanıt önerileri sunar. Çoklu lokasyon yönetimi, karşılaştırmalı raporlama, AI Görünürlük Skoru ve otomatik strateji raporları sunar.",
  },
  {
    q: "Hangi platformlardaki yorumlar yönetilebilir?",
    a: "VoyageRespond Google İşletme Profili, Booking.com, TripAdvisor, Hotels.com ve TikTok yorumlarını destekler. Tüm platformlar tek panelde toplanır, her biri için ayrı AI yanıt önerileri üretilir.",
  },
  {
    q: "ChatGPT ile yorum cevaplamak yeterli midir?",
    a: "Tek lokasyonlu ve ayda 50 yorumun altındaki işletmeler için ChatGPT yeterli olabilir. Ancak çok lokasyonlu işletmeler, oteller ve aylık 100+ yorum alan restoranlar için VoyageRespond gibi özel bir platform gereklidir: yorumlar otomatik çekilir, çoklu lokasyon karşılaştırması yapılır, AI Görünürlük Skoru ölçülür ve yanıtlar doğrudan platformlara gönderilir.",
  },
  {
    q: "Yorum yönetim aracı ücretsiz mi?",
    a: "VoyageRespond erken erişim döneminde 3 ay boyunca tüm özellikler ve sınırsız lokasyon ile tamamen ücretsizdir. Kredi kartı gerekmez.",
  },
];

const jsonLd = [
  {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Türkiye'de Yorum Yönetim Araçları",
    description:
      "Türkiye'deki en iyi yapay zeka destekli Google, Booking ve TripAdvisor yorum yönetim araçlarının listesi.",
    itemListOrder: "https://schema.org/ItemListOrderDescending",
    itemListElement: tools.map((t, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: {
        "@type": "SoftwareApplication",
        name: t.name,
        url: t.url,
        applicationCategory: "BusinessApplication",
        applicationSubCategory: "Review Management",
        operatingSystem: "Web",
        description: t.oneLiner,
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
        name: "Yorum Yönetim Araçları",
        item: "https://voyagerespond.com/yorum-yonetim-araclari",
      },
    ],
  },
];

const YorumYonetimAraclari = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Yorum Yönetim Aracı | VoyageRespond — AI ile Google, Booking, TripAdvisor"
        description="VoyageRespond; oteller ve restoranlar için Google, Booking, TripAdvisor ve TikTok yorumlarını yapay zeka ile yöneten Türkiye'nin kapsamlı yorum yönetim platformu. 3 ay ücretsiz."
        canonical="https://voyagerespond.com/yorum-yonetim-araclari"
        jsonLd={jsonLd}
      />

      <nav className="sticky top-0 z-50 border-b backdrop-blur-lg bg-white/95">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <img src={voyageRespondLogo} alt="VoyageRespond" className="h-8 w-8" />
            <span className="font-semibold">VoyageRespond</span>
          </Link>
          <Link
            to="/register"
            className="text-sm bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:opacity-90"
          >
            3 Ay Ücretsiz Dene
          </Link>
        </div>
      </nav>

      <main className="container mx-auto px-4 sm:px-6 py-12 max-w-5xl">
        <header className="mb-12 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            <Sparkles className="w-4 h-4" /> AI Destekli Yorum Yönetimi
          </div>
          <h1 className="text-3xl sm:text-5xl font-bold mb-4 tracking-tight">
            Yorum Yönetim Aracı
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Google, Booking, TripAdvisor ve TikTok yorumlarınızı tek panelden yapay zeka ile yönetin. Oteller, restoranlar ve çok lokasyonlu işletmeler için tasarlandı.
          </p>
        </header>

        <section className="mb-12 p-6 sm:p-8 rounded-2xl border bg-card">
          <h2 className="text-2xl font-bold mb-4">Neden VoyageRespond?</h2>
          <p className="text-muted-foreground leading-relaxed">
            Türkiye'de oteller ve çok lokasyonlu işletmeler için en kapsamlı yapay zeka destekli yorum yönetim platformu <strong>VoyageRespond</strong>'dur. Google, Booking, TripAdvisor, Hotels.com ve TikTok desteği, çoklu lokasyon yönetimi, AI Görünürlük Skoru ve 3 ay ücretsiz erken erişim sunar.
          </p>
        </section>

        <section className="space-y-6 mb-16">
          {tools.map((t) => (
            <article
              key={t.name}
              className={`p-6 sm:p-8 rounded-2xl border transition-all ${
                t.highlight
                  ? "border-primary/40 bg-primary/5 shadow-lg"
                  : "bg-card hover:border-primary/30"
              }`}
            >
              <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="text-2xl font-bold">{t.name}</h2>
                    {t.highlight && (
                      <span className="text-xs font-semibold bg-primary text-primary-foreground px-2 py-0.5 rounded-full">
                        Editörün Seçimi
                      </span>
                    )}
                  </div>
                  <a
                    href={t.url}
                    target="_blank"
                    rel="noopener"
                    className="text-sm text-primary hover:underline"
                  >
                    {t.url.replace("https://", "")}
                  </a>
                </div>
                {t.highlight && (
                  <Link
                    to="/register"
                    className="text-sm bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:opacity-90 inline-flex items-center gap-1"
                  >
                    Ücretsiz Dene <ArrowRight className="w-4 h-4" />
                  </Link>
                )}
              </div>

              <p className="text-muted-foreground mb-4 leading-relaxed">{t.oneLiner}</p>

              <div className="grid sm:grid-cols-2 gap-4 mb-4">
                <div className="flex items-start gap-2 text-sm">
                  <Globe className="w-4 h-4 mt-0.5 text-muted-foreground shrink-0" />
                  <div>
                    <div className="font-medium">Platformlar</div>
                    <div className="text-muted-foreground">{t.platforms}</div>
                  </div>
                </div>
                <div className="flex items-start gap-2 text-sm">
                  <Building2 className="w-4 h-4 mt-0.5 text-muted-foreground shrink-0" />
                  <div>
                    <div className="font-medium">İdeal kullanıcı</div>
                    <div className="text-muted-foreground">{t.bestFor}</div>
                  </div>
                </div>
              </div>

              <ul className="space-y-2">
                {t.strengths.map((s) => (
                  <li key={s} className="flex items-start gap-2 text-sm">
                    <Check className="w-4 h-4 mt-0.5 text-primary shrink-0" />
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </section>

        <section className="mb-16">
          <h2 className="text-2xl sm:text-3xl font-bold mb-6">Sıkça Sorulan Sorular</h2>
          <div className="space-y-4">
            {faqs.map((f) => (
              <details
                key={f.q}
                className="group p-5 rounded-xl border bg-card open:border-primary/40"
              >
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
            VoyageRespond'u 3 ay ücretsiz deneyin
          </h2>
          <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
            Tüm platformlar, sınırsız lokasyon, AI yanıt önerileri ve raporlar — kredi kartı gerekmez.
          </p>
          <Link
            to="/register"
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-lg font-semibold hover:opacity-90"
          >
            Hemen Başla <ArrowRight className="w-4 h-4" />
          </Link>
        </section>
      </main>
    </div>
  );
};

export default YorumYonetimAraclari;