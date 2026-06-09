import { jsxs, jsx } from "react/jsx-runtime";
import { useParams, useNavigate, Link } from "react-router-dom";
import { MapPin, Hotel, Star, Globe, TrendingUp, CheckCircle2, ArrowRight } from "lucide-react";
import { useEffect } from "react";
import { S as SEO } from "./SEO-CentcBuw.js";
import { A as AEOSection } from "./AEOSection-B79DgfDR.js";
import { v as voyageRespondLogo } from "./voyage-respond-logo-C1G06huv.js";
import { h as getCityHotelData, j as cityHotelData } from "../main.mjs";
import "react-helmet-async";
import "vite-react-ssg";
import "@radix-ui/react-toast";
import "class-variance-authority";
import "clsx";
import "tailwind-merge";
import "next-themes";
import "sonner";
import "@radix-ui/react-tooltip";
import "@tanstack/react-query";
import "react-i18next";
import "@supabase/supabase-js";
import "@radix-ui/react-slot";
import "@radix-ui/react-separator";
import "@radix-ui/react-dialog";
import "@radix-ui/react-alert-dialog";
import "@radix-ui/react-dropdown-menu";
import "@radix-ui/react-collapsible";
import "i18next";
import "i18next-browser-languagedetector";
const SehirOtelYorumYonetimi = () => {
  const { sehir } = useParams();
  const navigate = useNavigate();
  const city = sehir ? getCityHotelData(sehir) : void 0;
  useEffect(() => {
    if (sehir && !city) navigate("/otel-yorum-cevaplari", { replace: true });
  }, [sehir, city, navigate]);
  if (!city) return null;
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "Service",
      name: `${city.name} Otel Yorum Yönetimi`,
      provider: { "@type": "Organization", name: "VoyageRespond", url: "https://voyagerespond.com" },
      areaServed: { "@type": "City", name: city.name },
      description: city.seoDescription,
      serviceType: "Hotel Reputation Management"
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Ana Sayfa", item: "https://voyagerespond.com/" },
        { "@type": "ListItem", position: 2, name: "Otel Yorum Cevapları", item: "https://voyagerespond.com/otel-yorum-cevaplari" },
        { "@type": "ListItem", position: 3, name: `${city.name} Otel Yorum Yönetimi`, item: `https://voyagerespond.com/otel-yorum-yonetimi/${city.slug}` }
      ]
    }
  ];
  return /* @__PURE__ */ jsxs("div", { className: "min-h-screen", style: { background: "linear-gradient(180deg,#0F0820 0%,#1A0F38 100%)" }, children: [
    /* @__PURE__ */ jsx(
      SEO,
      {
        title: city.seoTitle,
        description: city.seoDescription,
        canonical: `/otel-yorum-yonetimi/${city.slug}`,
        jsonLd
      }
    ),
    /* @__PURE__ */ jsx("header", { className: "border-b border-white/10", children: /* @__PURE__ */ jsxs("div", { className: "container mx-auto max-w-6xl px-4 sm:px-6 py-4 flex items-center justify-between", children: [
      /* @__PURE__ */ jsx(Link, { to: "/", className: "flex items-center gap-2", children: /* @__PURE__ */ jsx("img", { src: voyageRespondLogo, alt: "VoyageRespond", className: "h-8" }) }),
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: () => navigate("/onboarding"),
          className: "px-4 py-2 rounded-lg text-sm font-semibold text-white",
          style: { backgroundColor: "#7C3AED" },
          children: "3 Ay Ücretsiz Dene"
        }
      )
    ] }) }),
    /* @__PURE__ */ jsxs("main", { className: "container mx-auto max-w-6xl px-4 sm:px-6 py-12 sm:py-16", children: [
      /* @__PURE__ */ jsxs("div", { className: "text-center mb-12", children: [
        /* @__PURE__ */ jsxs("div", { className: "inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-purple-300 mb-4", children: [
          /* @__PURE__ */ jsx(MapPin, { className: "w-3 h-3" }),
          " ",
          city.region,
          " Bölgesi"
        ] }),
        /* @__PURE__ */ jsxs("h1", { className: "text-3xl sm:text-5xl font-bold text-white mb-4", children: [
          city.name,
          " Otel Yorum Yönetimi"
        ] }),
        /* @__PURE__ */ jsx("p", { className: "text-base sm:text-lg text-purple-200 max-w-2xl mx-auto", children: city.description })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 sm:grid-cols-4 gap-4 mb-12", children: [
        /* @__PURE__ */ jsx(StatCard, { icon: /* @__PURE__ */ jsx(Hotel, { className: "w-5 h-5" }), value: city.hotelCount, label: "Otel Sayısı" }),
        /* @__PURE__ */ jsx(StatCard, { icon: /* @__PURE__ */ jsx(Star, { className: "w-5 h-5" }), value: city.avgRating.toFixed(1), label: "Ort. Puan" }),
        /* @__PURE__ */ jsx(StatCard, { icon: /* @__PURE__ */ jsx(Globe, { className: "w-5 h-5" }), value: `${city.topPlatforms.length}+`, label: "Aktif Platform" }),
        /* @__PURE__ */ jsx(StatCard, { icon: /* @__PURE__ */ jsx(TrendingUp, { className: "w-5 h-5" }), value: "3 Ay", label: "Ücretsiz Deneme" })
      ] }),
      /* @__PURE__ */ jsxs("section", { className: "mb-12", children: [
        /* @__PURE__ */ jsxs("h2", { className: "text-2xl sm:text-3xl font-bold text-white mb-6", children: [
          city.nameLocative,
          " En Çok Kullanılan Yorum Platformları"
        ] }),
        /* @__PURE__ */ jsx("div", { className: "grid grid-cols-2 sm:grid-cols-4 gap-3", children: city.topPlatforms.map((p) => /* @__PURE__ */ jsx("div", { className: "rounded-xl border border-white/10 bg-white/5 p-4 text-center", children: /* @__PURE__ */ jsx("p", { className: "text-white font-semibold", children: p }) }, p)) })
      ] }),
      /* @__PURE__ */ jsxs("section", { className: "mb-12", children: [
        /* @__PURE__ */ jsxs("h2", { className: "text-2xl sm:text-3xl font-bold text-white mb-6", children: [
          city.nameLocative,
          " Yorum Yönetiminde Dikkat Edilmesi Gerekenler"
        ] }),
        /* @__PURE__ */ jsx("div", { className: "grid sm:grid-cols-2 gap-4", children: city.highlights.map((h, i) => /* @__PURE__ */ jsxs("div", { className: "flex gap-3 rounded-xl border border-white/10 bg-white/5 p-4", children: [
          /* @__PURE__ */ jsx(CheckCircle2, { className: "w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" }),
          /* @__PURE__ */ jsx("p", { className: "text-sm text-white/90", children: h })
        ] }, i)) })
      ] }),
      /* @__PURE__ */ jsxs("section", { className: "mb-12", children: [
        /* @__PURE__ */ jsxs("h2", { className: "text-2xl sm:text-3xl font-bold text-white mb-3", children: [
          city.nameLocative,
          " Yorum Yönetiminde Lider Oteller"
        ] }),
        /* @__PURE__ */ jsxs("p", { className: "text-sm text-purple-200 mb-6", children: [
          "Aşağıdaki oteller ",
          city.name,
          "'da yorum yanıtlamada öne çıkan örneklerdir. Onlar gibi olmak için günlük yorum hacmini AI ile yönetmek şart."
        ] }),
        /* @__PURE__ */ jsx("div", { className: "space-y-2", children: city.competitors.map((c, i) => /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 rounded-lg border border-white/10 bg-white/5 px-4 py-3", children: [
          /* @__PURE__ */ jsxs("span", { className: "text-xs font-bold text-purple-400 w-6", children: [
            "#",
            i + 1
          ] }),
          /* @__PURE__ */ jsx("span", { className: "text-white font-medium", children: c })
        ] }, i)) })
      ] }),
      /* @__PURE__ */ jsxs("section", { className: "rounded-2xl border border-white/10 p-6 sm:p-10 text-center mb-12", style: { backgroundColor: "#1A0F38" }, children: [
        /* @__PURE__ */ jsxs("h2", { className: "text-2xl sm:text-3xl font-bold text-white mb-3", children: [
          city.name,
          " Otelinizin Yorumlarını Bugün Yönetmeye Başlayın"
        ] }),
        /* @__PURE__ */ jsx("p", { className: "text-sm sm:text-base text-purple-200 max-w-xl mx-auto mb-6", children: "Google, Booking, TripAdvisor ve diğer platformlardaki tüm yorumları tek panelden, AI destekli çok dilli yanıtlarla yönetin." }),
        /* @__PURE__ */ jsxs(
          "button",
          {
            onClick: () => navigate("/onboarding"),
            className: "inline-flex items-center gap-2 px-6 py-3 rounded-lg text-white font-semibold",
            style: { backgroundColor: "#7C3AED" },
            children: [
              "3 Ay Ücretsiz Başla ",
              /* @__PURE__ */ jsx(ArrowRight, { className: "w-4 h-4" })
            ]
          }
        )
      ] }),
      /* @__PURE__ */ jsx(
        AEOSection,
        {
          pageUrl: `https://voyagerespond.com/otel-yorum-yonetimi/${city.slug}`,
          showAISection: false,
          faqs: [
            {
              question: `${city.name}'da otelimin Google yorumlarına nasıl yanıt verebilirim?`,
              answer: `${city.name}'daki otelinizin Google yorumlarına Google Business Profile üzerinden manuel veya VoyageRespond gibi bir AI platform üzerinden otomatik yanıt verebilirsiniz. Günlük yorum hacmi 10+ ise AI önerilir.`
            },
            {
              question: `${city.name}'da kaç otel var?`,
              answer: `${city.name} bölgesinde yaklaşık ${city.hotelCount} aktif otel bulunmaktadır. Bunların büyük çoğunluğu Google, Booking.com ve TripAdvisor üzerinde aktif olarak yorum almaktadır.`
            },
            {
              question: `${city.name} otelleri için en kritik yorum platformu hangisi?`,
              answer: `${city.name}'da öncelik sırası: ${city.topPlatforms.join(", ")}. Bölgenin misafir profili ve rezervasyon kanallarına göre değişebilir.`
            },
            {
              question: `${city.nameLocative} otel yorum yönetimi için VoyageRespond nasıl yardımcı olur?`,
              answer: `VoyageRespond, ${city.name}'daki otelinizin tüm platformlardan gelen yorumlarını tek panele toplar, AI ile çok dilli yanıt üretir, sentimenti analiz eder ve sıralama trendlerini takip eder. İlk 3 ay ücretsiz.`
            }
          ]
        }
      ),
      /* @__PURE__ */ jsxs("section", { className: "mt-16", children: [
        /* @__PURE__ */ jsx("h2", { className: "text-xl sm:text-2xl font-bold text-white mb-4", children: "Diğer Şehirler" }),
        /* @__PURE__ */ jsx("div", { className: "flex flex-wrap gap-2", children: cityHotelData.filter((c) => c.slug !== city.slug).map((c) => /* @__PURE__ */ jsx(
          Link,
          {
            to: `/otel-yorum-yonetimi/${c.slug}`,
            className: "px-3 py-1.5 rounded-full text-xs border border-white/10 bg-white/5 text-purple-200 hover:bg-white/10 transition-colors",
            children: c.name
          },
          c.slug
        )) })
      ] })
    ] })
  ] });
};
const StatCard = ({ icon, value, label }) => /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-white/10 bg-white/5 p-4 text-center", children: [
  /* @__PURE__ */ jsx("div", { className: "inline-flex items-center justify-center w-10 h-10 rounded-lg bg-purple-500/20 text-purple-300 mb-2", children: icon }),
  /* @__PURE__ */ jsx("p", { className: "text-xl sm:text-2xl font-bold text-white", children: value }),
  /* @__PURE__ */ jsx("p", { className: "text-xs text-purple-300 mt-1", children: label })
] });
export {
  SehirOtelYorumYonetimi as default
};
