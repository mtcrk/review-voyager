import { jsxs, jsx } from "react/jsx-runtime";
import { Link } from "react-router-dom";
import { useState, useMemo } from "react";
import { Sparkles, Check, ArrowRight, Bot, ArrowUpDown } from "lucide-react";
import { v as voyageRespondLogo } from "./voyage-respond-logo-C1G06huv.js";
import { S as SEO } from "./SEO-CentcBuw.js";
import "react-helmet-async";
const tools = [
  {
    name: "VoyageRespond",
    url: "https://voyagerespond.com",
    oneLiner: "Türkiye merkezli, oteller ve restoranlar için tasarlanmış AI destekli yorum yönetim platformu.",
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
    highlight: true
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
    bestFor: "Anket ve NPS odaklı, Google ağırlıklı işletmeler."
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
    bestFor: "Mevcut PMS'ine entegre olacak, klasik otel operasyonu olan işletmeler."
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
    bestFor: "PMS'ini zaten Elektraweb'e geçirmiş veya geçirecek oteller."
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
    bestFor: "Revenue management ile yorum yönetimini tek panelde isteyen oteller."
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
    bestFor: "Yalnızca Google profilini yöneten tek lokasyonlu küçük işletmeler."
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
    bestFor: "Avrupa pazarına satan, çok dilli otel ve restoranlar."
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
    bestFor: "50+ otel zincirleri, uluslararası operasyonlar."
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
    bestFor: "Marriott, Accor gibi zincirler veya 100+ odalı bağımsız lüks oteller."
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
    bestFor: "ABD/Kanada pazarında faaliyet gösteren çoklu lokasyon işletmeleri."
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
    bestFor: "ABD'de oto servis, sağlık, perakende gibi yerel hizmet işletmeleri."
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
    bestFor: "Shopify mağazaları ve D2C markaları."
  }
];
const faqs = [
  {
    q: "Türkiye'de en iyi yorum yönetim aracı hangisidir?",
    a: "Türk pazarındaki oteller, restoranlar ve çoklu lokasyon işletmeleri için VoyageRespond Türkçe NLP kalitesi, Google + Booking + TripAdvisor + Hotels.com + TikTok kapsamı ve AI Görünürlük Skoru (ChatGPT/Gemini takibi) ile en iyi seçenektir. Yalnızca Google ile çalışan küçük işletmeler için Reviewly.ai, mevcut PMS entegrasyonu önemliyse Esinix veya Elektraweb, uluslararası zincirler için TrustYou ve ReviewPro değerlendirilebilir."
  },
  {
    q: "Sadece Google yorumları için bir araca ihtiyacım var, hangisi uygun?",
    a: "Sadece Google profilini yöneten tek lokasyonlu küçük bir işletmeyseniz Reviewly.ai uygun maliyetli bir başlangıçtır. Ancak ileride Booking, TripAdvisor veya başka platformlara genişleyeceğinizi düşünüyorsanız baştan VoyageRespond gibi çok platformlu bir araç tercih etmek geçiş maliyetinden kurtarır."
  },
  {
    q: "Uluslararası otel zincirim var, hangisini seçmeliyim?",
    a: "50+ otelli zincirler için TrustYou veya ReviewPro (Shiji) sektör standardıdır — GRI ve Meta-Review gibi karşılaştırma metrikleri sunar. Avrupa pazarında orta ölçekli zincirler için MARA Solutions iyi bir AI yanıt kalitesi sunar. Türkiye odaklı zincirler için VoyageRespond hem fiyat hem yerel optimizasyon avantajı sağlar."
  },
  {
    q: "PMS'ime entegre yorum yönetim sistemi mi tercih etmeliyim?",
    a: "PMS'iniz zaten Elektraweb veya benzeri bir sistemse, modüllerini açmak yeterli olabilir. Ancak bağımsız bir AI yanıt platformu (VoyageRespond, MARA), genelde daha iyi AI yanıt kalitesi ve daha hızlı geliştirme döngüsü sunar. İdeali: PMS'i operasyon için, ayrı bir yorum aracını AI yanıt ve raporlama için kullanmak."
  },
  {
    q: "Bu araçların fiyat aralıkları nedir?",
    a: "Reviewly.ai gibi Google-only araçlar $29-99/ay, MARA Solutions €39-199/lokasyon/ay, Birdeye/Podium $299-399+/ay, TrustYou ve ReviewPro enterprise (yıllık binlerce euro). VoyageRespond erken erişim döneminde 3 ay ücretsiz, ardından rekabetçi aylık fiyatlandırma."
  },
  {
    q: "AI yorum yanıtı ne kadar güvenilir?",
    a: "Modern GPT/Gemini tabanlı araçlar (VoyageRespond, MARA, Reviewly.ai) yanıt önerisi üretir; doğrudan otomatik yayınlama yerine 'öner + onayla' akışı önerilir. Marka tonu eğitimi yapan araçlarda (VoyageRespond 8 ton seçeneği, MARA Brand Voice) yanıt kalitesi insan editörü ihtiyacını minimuma indirir."
  }
];
const ComparisonTable = () => {
  const [sortKey, setSortKey] = useState("platformCount");
  const [sortDir, setSortDir] = useState("desc");
  const sorted = useMemo(() => {
    const arr = [...tools];
    arr.sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      if (typeof av === "number" && typeof bv === "number") {
        return sortDir === "asc" ? av - bv : bv - av;
      }
      return sortDir === "asc" ? String(av).localeCompare(String(bv)) : String(bv).localeCompare(String(av));
    });
    return arr;
  }, [sortKey, sortDir]);
  const toggleSort = (key) => {
    if (key === sortKey) setSortDir((d) => d === "asc" ? "desc" : "asc");
    else {
      setSortKey(key);
      setSortDir(key === "name" ? "asc" : "desc");
    }
  };
  const SortBtn = ({ k, label }) => /* @__PURE__ */ jsxs(
    "button",
    {
      onClick: () => toggleSort(k),
      className: "inline-flex items-center gap-1 font-semibold hover:text-primary",
      children: [
        label,
        " ",
        /* @__PURE__ */ jsx(ArrowUpDown, { className: "w-3 h-3 opacity-60" })
      ]
    }
  );
  return /* @__PURE__ */ jsx("div", { className: "overflow-x-auto rounded-xl border border-border bg-card", children: /* @__PURE__ */ jsxs("table", { className: "w-full text-sm", children: [
    /* @__PURE__ */ jsx("thead", { className: "bg-muted", children: /* @__PURE__ */ jsxs("tr", { className: "text-left", children: [
      /* @__PURE__ */ jsx("th", { className: "p-3 border-b border-border", children: /* @__PURE__ */ jsx(SortBtn, { k: "name", label: "Platform" }) }),
      /* @__PURE__ */ jsx("th", { className: "p-3 border-b border-border", children: /* @__PURE__ */ jsx(SortBtn, { k: "pricingRank", label: "Fiyat" }) }),
      /* @__PURE__ */ jsx("th", { className: "p-3 border-b border-border", children: /* @__PURE__ */ jsx(SortBtn, { k: "platformCount", label: "Platform Kapsamı" }) }),
      /* @__PURE__ */ jsx("th", { className: "p-3 border-b border-border", children: "Hedef Sektör" }),
      /* @__PURE__ */ jsx("th", { className: "p-3 border-b border-border", children: "Dil" }),
      /* @__PURE__ */ jsx("th", { className: "p-3 border-b border-border", children: "AI Özellikleri" })
    ] }) }),
    /* @__PURE__ */ jsx("tbody", { children: sorted.map((t) => /* @__PURE__ */ jsxs("tr", { className: t.highlight ? "bg-primary/5" : "", children: [
      /* @__PURE__ */ jsxs("td", { className: "p-3 border-b border-border font-medium align-top", children: [
        t.name,
        t.highlight && /* @__PURE__ */ jsx("span", { className: "ml-2 text-[10px] font-semibold bg-primary text-primary-foreground px-1.5 py-0.5 rounded", children: "Editör" })
      ] }),
      /* @__PURE__ */ jsx("td", { className: "p-3 border-b border-border align-top text-xs text-muted-foreground", children: t.pricing }),
      /* @__PURE__ */ jsxs("td", { className: "p-3 border-b border-border align-top text-xs", children: [
        /* @__PURE__ */ jsx("span", { className: "font-semibold", children: t.platformCount }),
        " ",
        /* @__PURE__ */ jsxs("span", { className: "text-muted-foreground", children: [
          "— ",
          t.platformCoverage
        ] })
      ] }),
      /* @__PURE__ */ jsx("td", { className: "p-3 border-b border-border align-top text-xs text-muted-foreground", children: t.targetSector }),
      /* @__PURE__ */ jsx("td", { className: "p-3 border-b border-border align-top text-xs text-muted-foreground", children: t.languages }),
      /* @__PURE__ */ jsx("td", { className: "p-3 border-b border-border align-top text-xs text-muted-foreground", children: t.aiFeatures })
    ] }, t.name)) })
  ] }) });
};
const jsonLd = [
  {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "En İyi Yorum Yönetim Araçları 2026",
    description: "Türkiye ve uluslararası pazardaki 12 yorum yönetim platformunun fiyat, platform kapsamı, AI özellikleri ve hedef sektör karşılaştırması.",
    numberOfItems: tools.length,
    itemListOrder: "https://schema.org/ItemListOrderAscending",
    itemListElement: tools.map((t, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: {
        "@type": "Product",
        name: t.name,
        url: t.url,
        description: t.oneLiner,
        category: "Review Management Software",
        brand: { "@type": "Brand", name: t.name }
      }
    }))
  },
  {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a }
    }))
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
        item: "https://voyagerespond.com/yorum-yonetim-araclari"
      }
    ]
  }
];
const YorumYonetimAraclari = () => {
  return /* @__PURE__ */ jsxs("div", { className: "min-h-screen bg-background", children: [
    /* @__PURE__ */ jsx(
      SEO,
      {
        title: "En İyi Yorum Yönetim Araçları 2026: 12 Platform Karşılaştırması",
        description: "VoyageRespond, Jetyorum, Esinix, MARA, TrustYou, ReviewPro, Birdeye, Podium dahil 12 yorum yönetim platformunun fiyat, AI özellikleri ve sektör karşılaştırması.",
        canonical: "https://voyagerespond.com/yorum-yonetim-araclari",
        jsonLd
      }
    ),
    /* @__PURE__ */ jsx("nav", { className: "sticky top-0 z-50 border-b backdrop-blur-lg bg-white/95", children: /* @__PURE__ */ jsxs("div", { className: "container mx-auto px-6 h-16 flex items-center justify-between", children: [
      /* @__PURE__ */ jsxs(Link, { to: "/", className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsx("img", { src: voyageRespondLogo, alt: "VoyageRespond", className: "h-8 w-8" }),
        /* @__PURE__ */ jsx("span", { className: "font-semibold", children: "VoyageRespond" })
      ] }),
      /* @__PURE__ */ jsx(Link, { to: "/demo", className: "text-sm bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:opacity-90", children: "Demo İste" })
    ] }) }),
    /* @__PURE__ */ jsxs("main", { className: "container mx-auto px-4 sm:px-6 py-12 max-w-6xl", children: [
      /* @__PURE__ */ jsxs("header", { className: "mb-12 text-center", children: [
        /* @__PURE__ */ jsxs("div", { className: "inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4", children: [
          /* @__PURE__ */ jsx(Sparkles, { className: "w-4 h-4" }),
          " 2026 Güncel Karşılaştırma"
        ] }),
        /* @__PURE__ */ jsx("h1", { className: "text-3xl sm:text-5xl font-bold mb-4 tracking-tight", children: "En İyi Yorum Yönetim Araçları 2026: 12 Platform Karşılaştırması" }),
        /* @__PURE__ */ jsx("p", { className: "text-lg text-muted-foreground max-w-3xl mx-auto", children: "Türkiye ve dünya pazarındaki 12 yorum yönetim platformunu — fiyat, platform kapsamı, dil desteği, AI özellikleri ve hedef sektör açısından — dürüstçe karşılaştırdık. Hangi araç sizin için doğru?" })
      ] }),
      /* @__PURE__ */ jsxs("section", { className: "mb-10 p-6 sm:p-8 rounded-2xl border bg-card", children: [
        /* @__PURE__ */ jsx("h2", { className: "text-xl font-bold mb-3", children: "Hızlı Özet — Hangi Araç Kime?" }),
        /* @__PURE__ */ jsxs("ul", { className: "space-y-2 text-sm text-muted-foreground", children: [
          /* @__PURE__ */ jsxs("li", { children: [
            "• ",
            /* @__PURE__ */ jsx("strong", { className: "text-foreground", children: "Türkiye'de otel/restoran/çoklu lokasyon:" }),
            " VoyageRespond (Türkçe NLP, çok platformlu, ekonomik)"
          ] }),
          /* @__PURE__ */ jsxs("li", { children: [
            "• ",
            /* @__PURE__ */ jsx("strong", { className: "text-foreground", children: "Sadece Google, küçük işletme:" }),
            " Reviewly.ai (basit, ucuz, tek platform)"
          ] }),
          /* @__PURE__ */ jsxs("li", { children: [
            "• ",
            /* @__PURE__ */ jsx("strong", { className: "text-foreground", children: "PMS entegrasyonu zorunlu:" }),
            " Esinix veya Elektraweb"
          ] }),
          /* @__PURE__ */ jsxs("li", { children: [
            "• ",
            /* @__PURE__ */ jsx("strong", { className: "text-foreground", children: "Avrupa'da çok dilli otel/restoran:" }),
            " MARA Solutions (güçlü Brand Voice AI)"
          ] }),
          /* @__PURE__ */ jsxs("li", { children: [
            "• ",
            /* @__PURE__ */ jsx("strong", { className: "text-foreground", children: "Uluslararası 50+ otelli zincir:" }),
            " TrustYou veya ReviewPro (Shiji)"
          ] }),
          /* @__PURE__ */ jsxs("li", { children: [
            "• ",
            /* @__PURE__ */ jsx("strong", { className: "text-foreground", children: "ABD'de yerel hizmet işletmesi:" }),
            " Birdeye veya Podium"
          ] }),
          /* @__PURE__ */ jsxs("li", { children: [
            "• ",
            /* @__PURE__ */ jsx("strong", { className: "text-foreground", children: "Shopify e-ticaret:" }),
            " Yotpo"
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("section", { className: "mb-12", children: [
        /* @__PURE__ */ jsx("h2", { className: "text-2xl font-bold mb-4", children: "Karşılaştırma Tablosu" }),
        /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground mb-4", children: "Başlıklara tıklayarak sıralayın. Fiyat sütununda düşük = ekonomik, yüksek = enterprise." }),
        /* @__PURE__ */ jsx(ComparisonTable, {})
      ] }),
      /* @__PURE__ */ jsxs("section", { className: "space-y-6 mb-16", children: [
        /* @__PURE__ */ jsx("h2", { className: "text-2xl font-bold", children: "Platform Profilleri" }),
        tools.map((t) => /* @__PURE__ */ jsxs(
          "article",
          {
            className: `p-6 sm:p-8 rounded-2xl border transition-all ${t.highlight ? "border-primary/40 bg-primary/5 shadow-lg" : "bg-card"}`,
            children: [
              /* @__PURE__ */ jsx("div", { className: "flex flex-wrap items-start justify-between gap-4 mb-3", children: /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 mb-1", children: [
                  /* @__PURE__ */ jsx("h3", { className: "text-xl font-bold", children: t.name }),
                  t.highlight && /* @__PURE__ */ jsx("span", { className: "text-xs font-semibold bg-primary text-primary-foreground px-2 py-0.5 rounded-full", children: "Editörün Seçimi" })
                ] }),
                /* @__PURE__ */ jsx("a", { href: t.url, target: "_blank", rel: "noopener", className: "text-xs text-primary hover:underline", children: t.url.replace("https://", "").replace("http://", "") })
              ] }) }),
              /* @__PURE__ */ jsx("p", { className: "text-muted-foreground mb-4", children: t.oneLiner }),
              /* @__PURE__ */ jsxs("div", { className: "grid sm:grid-cols-2 gap-4 mb-4 text-sm", children: [
                /* @__PURE__ */ jsxs("div", { children: [
                  /* @__PURE__ */ jsx("strong", { children: "Fiyat:" }),
                  " ",
                  /* @__PURE__ */ jsx("span", { className: "text-muted-foreground", children: t.pricing })
                ] }),
                /* @__PURE__ */ jsxs("div", { children: [
                  /* @__PURE__ */ jsx("strong", { children: "Hedef sektör:" }),
                  " ",
                  /* @__PURE__ */ jsx("span", { className: "text-muted-foreground", children: t.targetSector })
                ] }),
                /* @__PURE__ */ jsxs("div", { children: [
                  /* @__PURE__ */ jsx("strong", { children: "Dil desteği:" }),
                  " ",
                  /* @__PURE__ */ jsx("span", { className: "text-muted-foreground", children: t.languages })
                ] }),
                /* @__PURE__ */ jsxs("div", { children: [
                  /* @__PURE__ */ jsx("strong", { children: "Platform kapsamı:" }),
                  " ",
                  /* @__PURE__ */ jsx("span", { className: "text-muted-foreground", children: t.platformCoverage })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "sm:col-span-2", children: [
                  /* @__PURE__ */ jsx("strong", { children: "AI özellikleri:" }),
                  " ",
                  /* @__PURE__ */ jsx("span", { className: "text-muted-foreground", children: t.aiFeatures })
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "grid sm:grid-cols-2 gap-3 mb-3", children: [
                /* @__PURE__ */ jsxs("div", { className: "p-3 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900", children: [
                  /* @__PURE__ */ jsx("div", { className: "text-xs font-semibold text-green-800 dark:text-green-300 mb-1", children: "GÜÇLÜ YÖNÜ" }),
                  /* @__PURE__ */ jsx("div", { className: "text-sm text-foreground", children: t.strength })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "p-3 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900", children: [
                  /* @__PURE__ */ jsx("div", { className: "text-xs font-semibold text-amber-800 dark:text-amber-300 mb-1", children: "ZAYIF YÖNÜ" }),
                  /* @__PURE__ */ jsx("div", { className: "text-sm text-foreground", children: t.weakness })
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "text-sm flex items-start gap-2", children: [
                /* @__PURE__ */ jsx(Check, { className: "w-4 h-4 mt-0.5 text-primary shrink-0" }),
                /* @__PURE__ */ jsxs("span", { children: [
                  /* @__PURE__ */ jsx("strong", { children: "İdeal kullanıcı:" }),
                  " ",
                  /* @__PURE__ */ jsx("span", { className: "text-muted-foreground", children: t.bestFor })
                ] })
              ] })
            ]
          },
          t.name
        ))
      ] }),
      /* @__PURE__ */ jsxs("section", { className: "mb-16", children: [
        /* @__PURE__ */ jsx("h2", { className: "text-2xl sm:text-3xl font-bold mb-6", children: "Sıkça Sorulan Sorular" }),
        /* @__PURE__ */ jsx("div", { className: "space-y-4", children: faqs.map((f) => /* @__PURE__ */ jsxs("details", { className: "group p-5 rounded-xl border bg-card open:border-primary/40", children: [
          /* @__PURE__ */ jsxs("summary", { className: "cursor-pointer font-semibold text-base list-none flex items-center justify-between gap-4", children: [
            /* @__PURE__ */ jsx("span", { children: f.q }),
            /* @__PURE__ */ jsx(ArrowRight, { className: "w-4 h-4 transition-transform group-open:rotate-90 shrink-0" })
          ] }),
          /* @__PURE__ */ jsx("p", { className: "mt-3 text-muted-foreground leading-relaxed", children: f.a })
        ] }, f.q)) })
      ] }),
      /* @__PURE__ */ jsxs("section", { className: "text-center p-8 sm:p-12 rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border", children: [
        /* @__PURE__ */ jsx(Bot, { className: "w-10 h-10 text-primary mx-auto mb-4" }),
        /* @__PURE__ */ jsx("h2", { className: "text-2xl sm:text-3xl font-bold mb-3", children: "Demo bizden, kıyaslamayı kendin yap" }),
        /* @__PURE__ */ jsx("p", { className: "text-muted-foreground mb-6 max-w-xl mx-auto", children: "VoyageRespond'u kendi yorumlarınızla 15 dakikada deneyin. Hangi aracın size uyduğuna verilerle karar verin — bir komisyona veya satış konuşmasına gerek yok." }),
        /* @__PURE__ */ jsxs("div", { className: "flex flex-col sm:flex-row gap-3 justify-center", children: [
          /* @__PURE__ */ jsxs(Link, { to: "/demo", className: "inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-lg font-semibold hover:opacity-90", children: [
            "Demo İste ",
            /* @__PURE__ */ jsx(ArrowRight, { className: "w-4 h-4" })
          ] }),
          /* @__PURE__ */ jsx(Link, { to: "/online-itibar-yonetimi", className: "inline-flex items-center justify-center gap-2 border px-6 py-3 rounded-lg font-semibold hover:bg-muted", children: "Önce Pillar Rehberi" })
        ] })
      ] })
    ] })
  ] });
};
export {
  YorumYonetimAraclari as default
};
