import { jsxs, jsx } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { I as Input, B as Button } from "../main.mjs";
import { Sparkles, ArrowRight, Check, Star, Zap, Eye, Shield, BarChart3, Globe, Building2 } from "lucide-react";
import { v as voyageRespondLogo } from "./voyage-respond-logo-C1G06huv.js";
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
const GoogleReviews = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  useEffect(() => {
    document.title = "Google Yorum Yönetimi | AI ile Akıllı Yanıt ve Analiz - VoyageRespond";
    const meta = document.querySelector('meta[name="description"]');
    if (meta) {
      meta.setAttribute("content", "Google yorumlarınızı yapay zeka ile yönetin. AI destekli akıllı yanıt önerileri, duygu analizi, rakip karşılaştırma ve AI Visibility Score. Otel ve restoranlar için #1 yorum yönetim platformu.");
    }
  }, []);
  const features = [
    {
      icon: Zap,
      title: "AI Destekli Akıllı Yanıtlar",
      description: "Her yorum için kişiselleştirilmiş, markanıza uygun profesyonel yanıt önerileri. Tek tıkla onaylayın ve gönderin."
    },
    {
      icon: Eye,
      title: "AI Visibility Score",
      description: "İşletmenizin ChatGPT, Gemini ve diğer AI asistanlarında nasıl göründüğünü takip edin."
    },
    {
      icon: Shield,
      title: "Duygu Analizi",
      description: "Olumsuz yorumları anında tespit edin, öncelikli aksiyon alın. Müşteri sesini dinleyin."
    },
    {
      icon: BarChart3,
      title: "Performans Analitikleri",
      description: "Puan trendleri, yanıt süreleri ve rakip karşılaştırmaları ile veri odaklı kararlar alın."
    },
    {
      icon: Globe,
      title: "Çok Platformlu Yönetim",
      description: "Google, Booking, TripAdvisor ve Hotels.com yorumlarını tek panelden yönetin."
    },
    {
      icon: Building2,
      title: "Çok Lokasyonlu Destek",
      description: "Tüm şubelerinizi tek hesaptan yönetin. Lokasyon bazlı performans karşılaştırması yapın."
    }
  ];
  const stats = [
    { value: "%89", label: "Müşterilerin yorumları okuyor" },
    { value: "24s", label: "İdeal yanıt süresi" },
    { value: "%35", label: "Daha fazla güven kazanımı" },
    { value: "4.8★", label: "Ortalama kullanıcı puanı" }
  ];
  const comparisons = [
    { feature: "AI yanıt önerileri", us: true, others: false },
    { feature: "AI Visibility Score", us: true, others: false },
    { feature: "Çok platform desteği", us: true, others: false },
    { feature: "Duygu analizi", us: true, others: false },
    { feature: "Çok lokasyon yönetimi", us: true, others: false },
    { feature: "Türkçe destek", us: true, others: false },
    { feature: "Ücretsiz başlangıç", us: true, others: true }
  ];
  const useCases = [
    {
      title: "Oteller & Butik Oteller",
      description: "Google, Booking ve TripAdvisor yorumlarını merkezi olarak yönetin. Çok dilli misafir yorumlarına AI ile yanıt verin.",
      icon: "🏨"
    },
    {
      title: "Restoranlar & Kafeler",
      description: "Google yorumlarında öne çıkan şikayetleri anında tespit edin. Menü ve servis kalitesi hakkında müşteri içgörüleri alın.",
      icon: "🍽️"
    },
    {
      title: "Zincir İşletmeler",
      description: "Tüm lokasyonlarınızı tek panelden yönetin. Şubeler arası performans karşılaştırması yapın.",
      icon: "🏢"
    }
  ];
  const handleSubmit = (e) => {
    e.preventDefault();
    if (email) setSubmitted(true);
  };
  return /* @__PURE__ */ jsxs("div", { className: "min-h-screen bg-background", children: [
    /* @__PURE__ */ jsx("nav", { className: "sticky top-0 z-50 border-b backdrop-blur-lg bg-white/95", children: /* @__PURE__ */ jsx("div", { className: "container mx-auto px-6", children: /* @__PURE__ */ jsxs("div", { className: "flex h-16 items-center justify-between", children: [
      /* @__PURE__ */ jsxs(
        "button",
        {
          onClick: () => navigate("/"),
          className: "flex items-center gap-2 hover:opacity-80 transition-opacity",
          children: [
            /* @__PURE__ */ jsx("img", { src: voyageRespondLogo, alt: "VoyageRespond", className: "h-7 w-7" }),
            /* @__PURE__ */ jsxs("span", { className: "text-lg", style: { color: "#1F2937" }, children: [
              /* @__PURE__ */ jsx("span", { className: "font-normal", children: "Voyage" }),
              /* @__PURE__ */ jsx("span", { className: "font-semibold", children: "Respond" })
            ] })
          ]
        }
      ),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4", children: [
        /* @__PURE__ */ jsx("button", { onClick: () => navigate("/blog"), className: "text-sm font-medium text-muted-foreground hover:text-foreground transition-colors hidden md:block", children: "Blog" }),
        /* @__PURE__ */ jsx("button", { onClick: () => navigate("/hub"), className: "text-sm font-medium text-muted-foreground hover:text-foreground transition-colors hidden md:block", children: "Hub" }),
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: () => navigate("/onboarding"),
            className: "px-5 py-2.5 rounded-md text-sm font-medium text-white transition-all shadow-sm hover:shadow-md",
            style: { backgroundColor: "#7A5AF8" },
            children: "Ücretsiz Başla"
          }
        )
      ] })
    ] }) }) }),
    /* @__PURE__ */ jsxs("section", { className: "container mx-auto px-6 py-20 md:py-28 relative overflow-hidden", children: [
      /* @__PURE__ */ jsx("div", { className: "absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" }),
      /* @__PURE__ */ jsxs("div", { className: "relative z-10 max-w-4xl mx-auto text-center", children: [
        /* @__PURE__ */ jsxs("div", { className: "inline-flex items-center px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-8", children: [
          /* @__PURE__ */ jsx(Sparkles, { className: "w-4 h-4 mr-2" }),
          "AI Destekli Google Yorum Yönetimi"
        ] }),
        /* @__PURE__ */ jsxs("h1", { className: "text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight", children: [
          "Google Yorumlarınızı",
          " ",
          /* @__PURE__ */ jsx("span", { className: "bg-gradient-to-r from-purple-600 via-primary to-blue-600 bg-clip-text text-transparent", children: "Yapay Zeka" }),
          " ",
          "ile Yönetin"
        ] }),
        /* @__PURE__ */ jsx("p", { className: "text-xl text-muted-foreground mb-10 max-w-3xl mx-auto leading-relaxed", children: "Müşterinizin sesini dinleyin, AI destekli akıllı yanıtlar oluşturun, duygu analizi yapın ve işletmenizin AI asistanlarındaki görünürlüğünü takip edin." }),
        /* @__PURE__ */ jsx("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto mb-10", children: stats.map((stat, i) => /* @__PURE__ */ jsxs("div", { className: "text-center", children: [
          /* @__PURE__ */ jsx("div", { className: "text-3xl font-bold text-primary", children: stat.value }),
          /* @__PURE__ */ jsx("div", { className: "text-sm text-muted-foreground mt-1", children: stat.label })
        ] }, i)) }),
        !submitted ? /* @__PURE__ */ jsxs("form", { onSubmit: handleSubmit, className: "max-w-md mx-auto", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex gap-3", children: [
            /* @__PURE__ */ jsx(
              Input,
              {
                type: "email",
                placeholder: "E-posta adresiniz",
                value: email,
                onChange: (e) => setEmail(e.target.value),
                className: "flex-1",
                required: true
              }
            ),
            /* @__PURE__ */ jsxs(Button, { type: "submit", className: "gradient-primary text-white whitespace-nowrap", children: [
              "Ücretsiz Başla",
              /* @__PURE__ */ jsx(ArrowRight, { className: "w-4 h-4 ml-2" })
            ] })
          ] }),
          /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground mt-3", children: "3 ay ücretsiz • Kredi kartı gereksiz • 2 dakikada kurulum" })
        ] }) : /* @__PURE__ */ jsxs("div", { className: "bg-green-50 border border-green-200 rounded-xl p-6 max-w-md mx-auto", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-center gap-2 text-green-700 mb-2", children: [
            /* @__PURE__ */ jsx(Check, { className: "w-5 h-5" }),
            /* @__PURE__ */ jsx("span", { className: "font-semibold", children: "Kaydınız alındı!" })
          ] }),
          /* @__PURE__ */ jsx("p", { className: "text-green-600 text-sm", children: "En kısa sürede erken erişim detaylarını paylaşacağız." })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("section", { className: "container mx-auto px-6 py-20 bg-muted/30", children: [
      /* @__PURE__ */ jsxs("div", { className: "text-center mb-14", children: [
        /* @__PURE__ */ jsx("h2", { className: "text-3xl md:text-4xl font-bold text-foreground mb-4", children: "Google Yorum Yönetiminde İhtiyacınız Olan Her Şey" }),
        /* @__PURE__ */ jsx("p", { className: "text-lg text-muted-foreground max-w-2xl mx-auto", children: "Yapay zeka destekli araçlarla yorumlarınızı profesyonelce yönetin, müşteri memnuniyetini artırın." })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto", children: features.map((feature, index) => /* @__PURE__ */ jsxs(
        "div",
        {
          className: "p-7 rounded-2xl border border-border bg-card hover:shadow-xl transition-all duration-300 hover:-translate-y-1",
          children: [
            /* @__PURE__ */ jsx("div", { className: "w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-5", children: /* @__PURE__ */ jsx(feature.icon, { className: "w-6 h-6 text-primary" }) }),
            /* @__PURE__ */ jsx("h3", { className: "font-bold text-lg text-foreground mb-2", children: feature.title }),
            /* @__PURE__ */ jsx("p", { className: "text-muted-foreground text-sm leading-relaxed", children: feature.description })
          ]
        },
        index
      )) })
    ] }),
    /* @__PURE__ */ jsxs("section", { className: "container mx-auto px-6 py-20", children: [
      /* @__PURE__ */ jsxs("div", { className: "text-center mb-14", children: [
        /* @__PURE__ */ jsx("h2", { className: "text-3xl md:text-4xl font-bold text-foreground mb-4", children: "Hangi Sektöre Hizmet Ediyoruz?" }),
        /* @__PURE__ */ jsx("p", { className: "text-lg text-muted-foreground", children: "Her sektöre özel yorum yönetim stratejileri" })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "grid md:grid-cols-3 gap-8 max-w-5xl mx-auto", children: useCases.map((uc, i) => /* @__PURE__ */ jsxs("div", { className: "p-8 rounded-2xl border border-border bg-card text-center hover:shadow-lg transition-all", children: [
        /* @__PURE__ */ jsx("div", { className: "text-5xl mb-4", children: uc.icon }),
        /* @__PURE__ */ jsx("h3", { className: "text-xl font-bold text-foreground mb-3", children: uc.title }),
        /* @__PURE__ */ jsx("p", { className: "text-muted-foreground text-sm leading-relaxed", children: uc.description })
      ] }, i)) })
    ] }),
    /* @__PURE__ */ jsx("section", { className: "container mx-auto px-6 py-20 bg-muted/30", children: /* @__PURE__ */ jsxs("div", { className: "max-w-4xl mx-auto", children: [
      /* @__PURE__ */ jsxs("div", { className: "text-center mb-12", children: [
        /* @__PURE__ */ jsx("h2", { className: "text-3xl md:text-4xl font-bold text-foreground mb-4", children: "Yorumdan Yanıta Saniyeler İçinde" }),
        /* @__PURE__ */ jsx("p", { className: "text-lg text-muted-foreground", children: "AI, yorumu analiz eder, duygu durumunu belirler ve marka tonunuza uygun yanıt önerir." })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "grid md:grid-cols-2 gap-8 items-start", children: [
        /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
          /* @__PURE__ */ jsxs("div", { className: "bg-card rounded-xl p-5 border border-border", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mb-2", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex", children: [
                [1, 2].map((i) => /* @__PURE__ */ jsx(Star, { className: "w-4 h-4 fill-amber-400 text-amber-400" }, i)),
                [3, 4, 5].map((i) => /* @__PURE__ */ jsx(Star, { className: "w-4 h-4 text-gray-300" }, i))
              ] }),
              /* @__PURE__ */ jsx("span", { className: "text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700 font-medium", children: "Olumsuz" })
            ] }),
            /* @__PURE__ */ jsx("p", { className: "text-foreground text-sm", children: '"Oda temizliği beklediğimiz gibi değildi, banyoda sorun vardı. Personel ilgisizdi."' }),
            /* @__PURE__ */ jsx("span", { className: "text-xs text-muted-foreground mt-2 block", children: "— Mehmet K., 2 saat önce" })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "bg-card rounded-xl p-5 border border-border", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mb-2", children: [
              /* @__PURE__ */ jsx("div", { className: "flex", children: [1, 2, 3, 4, 5].map((i) => /* @__PURE__ */ jsx(Star, { className: "w-4 h-4 fill-amber-400 text-amber-400" }, i)) }),
              /* @__PURE__ */ jsx("span", { className: "text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-medium", children: "Olumlu" })
            ] }),
            /* @__PURE__ */ jsx("p", { className: "text-foreground text-sm", children: '"Muhteşem bir deneyimdi! Yemekler harikaydı, personel çok ilgiliydi. Kesinlikle tekrar geleceğiz."' }),
            /* @__PURE__ */ jsx("span", { className: "text-xs text-muted-foreground mt-2 block", children: "— Ayşe T., 5 saat önce" })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
          /* @__PURE__ */ jsxs("div", { className: "bg-primary/5 rounded-xl p-5 border border-primary/20", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mb-3", children: [
              /* @__PURE__ */ jsx(Sparkles, { className: "w-4 h-4 text-primary" }),
              /* @__PURE__ */ jsx("span", { className: "text-xs text-primary font-semibold", children: "AI Yanıt Önerisi — Olumsuz" })
            ] }),
            /* @__PURE__ */ jsx("p", { className: "text-foreground text-sm leading-relaxed", children: '"Merhaba Mehmet Bey, geri bildiriminiz için teşekkür ederiz. Oda temizliği ve banyo konusundaki deneyiminiz standartlarımızın altında kalmış, bunun için çok üzgünüz. Ekibimizle durumu derhal değerlendirdik. Sizi doğrudan arayarak telafi etmek isteriz. 🙏"' })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "bg-primary/5 rounded-xl p-5 border border-primary/20", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mb-3", children: [
              /* @__PURE__ */ jsx(Sparkles, { className: "w-4 h-4 text-primary" }),
              /* @__PURE__ */ jsx("span", { className: "text-xs text-primary font-semibold", children: "AI Yanıt Önerisi — Olumlu" })
            ] }),
            /* @__PURE__ */ jsx("p", { className: "text-foreground text-sm leading-relaxed", children: '"Ayşe Hanım, güzel sözleriniz için çok teşekkür ederiz! Yemeklerimizi ve ekibimizin ilgisini beğenmenize çok sevindik. Sizi tekrar ağırlamak için sabırsızlanıyoruz! 😊"' })
          ] })
        ] })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxs("section", { className: "container mx-auto px-6 py-20", children: [
      /* @__PURE__ */ jsxs("div", { className: "text-center mb-12", children: [
        /* @__PURE__ */ jsx("h2", { className: "text-3xl md:text-4xl font-bold text-foreground mb-4", children: "Neden VoyageRespond?" }),
        /* @__PURE__ */ jsx("p", { className: "text-lg text-muted-foreground", children: "Diğer araçlarla karşılaştırma" })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "max-w-2xl mx-auto", children: /* @__PURE__ */ jsxs("div", { className: "rounded-2xl border border-border overflow-hidden", children: [
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-3 bg-muted p-4 font-semibold text-sm", children: [
          /* @__PURE__ */ jsx("span", { children: "Özellik" }),
          /* @__PURE__ */ jsx("span", { className: "text-center text-primary", children: "VoyageRespond" }),
          /* @__PURE__ */ jsx("span", { className: "text-center text-muted-foreground", children: "Diğerleri" })
        ] }),
        comparisons.map((row, i) => /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-3 p-4 border-t border-border text-sm items-center", children: [
          /* @__PURE__ */ jsx("span", { className: "text-foreground", children: row.feature }),
          /* @__PURE__ */ jsx("span", { className: "text-center", children: /* @__PURE__ */ jsx(Check, { className: "w-5 h-5 text-green-500 mx-auto" }) }),
          /* @__PURE__ */ jsx("span", { className: "text-center", children: row.others ? /* @__PURE__ */ jsx(Check, { className: "w-5 h-5 text-gray-400 mx-auto" }) : /* @__PURE__ */ jsx("span", { className: "text-gray-300 text-lg", children: "✗" }) })
        ] }, i))
      ] }) })
    ] }),
    /* @__PURE__ */ jsx("section", { className: "container mx-auto px-6 py-20", children: /* @__PURE__ */ jsxs("div", { className: "max-w-3xl mx-auto text-center p-12 rounded-2xl border border-primary/10 bg-gradient-to-br from-primary/5 via-background to-background", children: [
      /* @__PURE__ */ jsx("h2", { className: "text-3xl md:text-4xl font-bold text-foreground mb-4", children: "Google yorumlarınızı AI ile yönetmeye başlayın" }),
      /* @__PURE__ */ jsx("p", { className: "text-lg text-muted-foreground mb-8", children: "3 ay ücretsiz • Tüm özellikler dahil • Kredi kartı gereksiz" }),
      !submitted && /* @__PURE__ */ jsx("form", { onSubmit: handleSubmit, className: "max-w-md mx-auto", children: /* @__PURE__ */ jsxs("div", { className: "flex gap-3", children: [
        /* @__PURE__ */ jsx(
          Input,
          {
            type: "email",
            placeholder: "E-posta adresiniz",
            value: email,
            onChange: (e) => setEmail(e.target.value),
            className: "flex-1",
            required: true
          }
        ),
        /* @__PURE__ */ jsx(Button, { type: "submit", className: "gradient-primary text-white", children: "Başla" })
      ] }) }),
      /* @__PURE__ */ jsx("div", { className: "mt-6", children: /* @__PURE__ */ jsx("button", { onClick: () => navigate("/blog"), className: "text-sm text-primary hover:underline", children: "Blog yazılarımızı okuyun →" }) })
    ] }) }),
    /* @__PURE__ */ jsx("footer", { className: "border-t border-border bg-card/50", children: /* @__PURE__ */ jsx("div", { className: "container mx-auto px-6 py-8", children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col md:flex-row items-center justify-center gap-4 text-sm text-muted-foreground", children: [
      /* @__PURE__ */ jsx("span", { children: "© 2024 VoyageRespond" }),
      /* @__PURE__ */ jsx("span", { className: "hidden md:block", children: "•" }),
      /* @__PURE__ */ jsx("button", { onClick: () => navigate("/blog"), className: "hover:text-foreground", children: "Blog" }),
      /* @__PURE__ */ jsx("span", { className: "hidden md:block", children: "•" }),
      /* @__PURE__ */ jsx("button", { onClick: () => navigate("/privacy-policy"), className: "hover:text-foreground", children: "Gizlilik Politikası" }),
      /* @__PURE__ */ jsx("span", { className: "hidden md:block", children: "•" }),
      /* @__PURE__ */ jsx("button", { onClick: () => navigate("/terms-of-service"), className: "hover:text-foreground", children: "Kullanım Koşulları" })
    ] }) }) }),
    /* @__PURE__ */ jsx(
      "script",
      {
        type: "application/ld+json",
        dangerouslySetInnerHTML: {
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            name: "Google Yorum Yönetimi - VoyageRespond",
            description: "Google yorumlarınızı yapay zeka ile yönetin. AI destekli akıllı yanıt önerileri, duygu analizi ve AI Visibility Score.",
            url: "https://voyagerespond.com/automations/google-reviews",
            mainEntity: {
              "@type": "SoftwareApplication",
              name: "VoyageRespond Google Review Management",
              applicationCategory: "BusinessApplication",
              operatingSystem: "Web"
            }
          })
        }
      }
    )
  ] });
};
export {
  GoogleReviews as default
};
