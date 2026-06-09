import { jsxs, jsx } from "react/jsx-runtime";
import { u as useAuth, B as Button } from "../main.mjs";
import { useNavigate } from "react-router-dom";
import { X, Menu, Sparkles, ArrowRight, Users, Star, Zap, MessageSquare, Eye, TrendingUp, Target, Shield, Check } from "lucide-react";
import { useState } from "react";
import { v as voyageRespondLogo } from "./voyage-respond-logo-C1G06huv.js";
import { useTranslation } from "react-i18next";
import { L as LanguageSwitcher } from "./LanguageSwitcher-CkCZi_79.js";
import { S as SEO } from "./SEO-CentcBuw.js";
import "vite-react-ssg";
import "@radix-ui/react-toast";
import "class-variance-authority";
import "clsx";
import "tailwind-merge";
import "next-themes";
import "sonner";
import "@radix-ui/react-tooltip";
import "@tanstack/react-query";
import "@supabase/supabase-js";
import "@radix-ui/react-slot";
import "@radix-ui/react-separator";
import "@radix-ui/react-dialog";
import "@radix-ui/react-alert-dialog";
import "@radix-ui/react-dropdown-menu";
import "@radix-ui/react-collapsible";
import "i18next";
import "i18next-browser-languagedetector";
import "react-helmet-async";
const demoPoster = "/assets/voyagerespond-demo-poster-D40xXiSD.jpg";
const Index = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useTranslation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  return /* @__PURE__ */ jsxs("div", { className: "min-h-screen bg-background overflow-x-hidden", children: [
    /* @__PURE__ */ jsx(
      SEO,
      {
        title: "VoyageRespond — AI Google Yorum Yönetimi",
        description: "Google, Booking ve TripAdvisor yorumlarını yapay zeka ile yönetin. Otomatik yanıt önerileri, duygu analizi, AI görünürlük skoru. 3 ay ücretsiz deneyin.",
        canonical: "https://voyagerespond.com/",
        jsonLd: {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: [
            {
              "@type": "Question",
              name: "Google yorumlarını yapay zeka ile nasıl yönetebilirim?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "VoyageRespond, Google Business Profile'ınızı bağladıktan sonra tüm yorumlarınızı otomatik olarak çeker. Yapay zeka her yorum için duygu analizi yapar, akıllı yanıt önerileri sunar ve tek tıkla yanıt göndermenizi sağlar."
              }
            },
            {
              "@type": "Question",
              name: "AI Visibility Score nedir?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "AI Visibility Score, işletmenizin ChatGPT, Google Gemini ve diğer yapay zeka asistanlarında ne kadar görünür olduğunu ölçen bir metriktir. Yorumlarınız, puanlarınız ve online varlığınız analiz edilerek 0-100 arasında bir skor hesaplanır."
              }
            },
            {
              "@type": "Question",
              name: "Hangi platformlardan yorum çekiliyor?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "VoyageRespond; Google, Booking.com, TripAdvisor ve Hotels.com platformlarından yorumları otomatik olarak çeker ve tek bir panelde yönetmenizi sağlar."
              }
            },
            {
              "@type": "Question",
              name: "VoyageRespond ücretsiz mi?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Evet, VoyageRespond erken erişim döneminde 3 ay boyunca tüm özellikler ve sınırsız lokasyon ile tamamen ücretsizdir."
              }
            }
          ]
        }
      }
    ),
    /* @__PURE__ */ jsx("nav", { className: "sticky top-0 z-50 border-b border-border/60 backdrop-blur-xl bg-background/80", children: /* @__PURE__ */ jsxs("div", { className: "container mx-auto px-4 sm:px-6", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex h-16 items-center justify-between", children: [
        /* @__PURE__ */ jsxs(
          "button",
          {
            onClick: () => navigate("/"),
            className: "flex items-center gap-2.5 hover:opacity-80 transition-opacity",
            children: [
              /* @__PURE__ */ jsx("img", { src: voyageRespondLogo, alt: "VoyageRespond", className: "h-7 w-7" }),
              /* @__PURE__ */ jsxs("span", { className: "text-base tracking-tight text-foreground", children: [
                /* @__PURE__ */ jsx("span", { className: "font-normal", children: "Voyage" }),
                /* @__PURE__ */ jsx("span", { className: "font-semibold", children: "Respond" })
              ] })
            ]
          }
        ),
        /* @__PURE__ */ jsxs("div", { className: "hidden md:flex items-center gap-8", children: [
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => {
                var _a;
                return (_a = document.getElementById("features")) == null ? void 0 : _a.scrollIntoView({ behavior: "smooth" });
              },
              className: "text-sm font-medium text-muted-foreground hover:text-foreground transition-colors",
              children: t("indexPage.nav.features")
            }
          ),
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => {
                var _a;
                return (_a = document.getElementById("pricing")) == null ? void 0 : _a.scrollIntoView({ behavior: "smooth" });
              },
              className: "text-sm font-medium text-muted-foreground hover:text-foreground transition-colors",
              children: t("indexPage.nav.pricing")
            }
          ),
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => navigate("/blog"),
              className: "text-sm font-medium text-muted-foreground hover:text-foreground transition-colors",
              children: t("indexPage.nav.blog")
            }
          ),
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => navigate("/contact"),
              className: "text-sm font-medium text-muted-foreground hover:text-foreground transition-colors",
              children: t("indexPage.nav.contact")
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "hidden md:flex items-center gap-3", children: [
          /* @__PURE__ */ jsx(LanguageSwitcher, {}),
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => navigate(user ? "/dashboard" : "/login"),
              className: "text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-3 py-2",
              children: user ? t("indexPage.nav.dashboard") : t("indexPage.nav.login")
            }
          ),
          /* @__PURE__ */ jsx(
            Button,
            {
              onClick: () => navigate("/onboarding"),
              className: "gradient-primary text-white text-sm px-5 py-2 h-9 hover:shadow-lg transition-all duration-200",
              children: t("indexPage.nav.startFree")
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "md:hidden flex items-center gap-2", children: [
          /* @__PURE__ */ jsx(LanguageSwitcher, {}),
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => setMobileMenuOpen(!mobileMenuOpen),
              className: "p-2 text-foreground",
              "aria-label": mobileMenuOpen ? "Menüyü kapat" : "Menüyü aç",
              "aria-expanded": mobileMenuOpen,
              children: mobileMenuOpen ? /* @__PURE__ */ jsx(X, { className: "w-5 h-5" }) : /* @__PURE__ */ jsx(Menu, { className: "w-5 h-5" })
            }
          )
        ] })
      ] }),
      mobileMenuOpen && /* @__PURE__ */ jsxs("div", { className: "md:hidden border-t border-border py-4 space-y-1", children: [
        [
          { label: t("indexPage.nav.features"), action: () => {
            var _a;
            (_a = document.getElementById("features")) == null ? void 0 : _a.scrollIntoView({ behavior: "smooth" });
            setMobileMenuOpen(false);
          } },
          { label: t("indexPage.nav.pricing"), action: () => {
            var _a;
            (_a = document.getElementById("pricing")) == null ? void 0 : _a.scrollIntoView({ behavior: "smooth" });
            setMobileMenuOpen(false);
          } },
          { label: t("indexPage.nav.blog"), action: () => {
            navigate("/blog");
            setMobileMenuOpen(false);
          } },
          { label: t("indexPage.nav.contact"), action: () => {
            navigate("/contact");
            setMobileMenuOpen(false);
          } },
          { label: user ? t("indexPage.nav.dashboard") : t("indexPage.nav.login"), action: () => {
            navigate(user ? "/dashboard" : "/login");
            setMobileMenuOpen(false);
          } }
        ].map((item) => /* @__PURE__ */ jsx(
          "button",
          {
            onClick: item.action,
            className: "block w-full text-left px-4 py-2.5 text-sm font-medium text-foreground hover:bg-muted rounded-lg transition-colors",
            children: item.label
          },
          item.label
        )),
        /* @__PURE__ */ jsx("div", { className: "px-4 pt-2", children: /* @__PURE__ */ jsx(
          Button,
          {
            onClick: () => {
              navigate("/onboarding");
              setMobileMenuOpen(false);
            },
            className: "w-full gradient-primary text-white",
            children: t("indexPage.nav.startFree")
          }
        ) })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxs("section", { className: "relative overflow-hidden", children: [
      /* @__PURE__ */ jsx("div", { className: "absolute inset-0 gradient-hero" }),
      /* @__PURE__ */ jsx("div", { className: "absolute inset-0 gradient-mesh" }),
      /* @__PURE__ */ jsxs("div", { className: "container mx-auto px-4 sm:px-6 pt-20 pb-16 md:pt-32 md:pb-24 relative z-10", children: [
        /* @__PURE__ */ jsxs("div", { className: "max-w-3xl mx-auto text-center space-y-6", children: [
          /* @__PURE__ */ jsxs("div", { className: "inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/8 border border-primary/15 text-primary text-xs font-medium", children: [
            /* @__PURE__ */ jsx(Sparkles, { className: "w-3.5 h-3.5" }),
            t("indexPage.hero.badge")
          ] }),
          /* @__PURE__ */ jsxs("h1", { className: "text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-foreground leading-[1.1] tracking-tight", children: [
            "Google Yorumlarınızı",
            " ",
            /* @__PURE__ */ jsx("span", { className: "bg-gradient-to-r from-primary to-purple-700 bg-clip-text text-transparent", children: "Yapay Zeka ile Otomatik Yönetin" })
          ] }),
          /* @__PURE__ */ jsx("p", { className: "text-lg md:text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto", children: "VoyageRespond, Google, Booking, TripAdvisor ve 80+ platformdaki müşteri yorumlarınızı tek bir panelde toplar. Yapay zeka her yoruma kişiselleştirilmiş yanıt üretir, duygu analizi yapar ve işletmenizin AI görünürlük skorunu takip eder." }),
          /* @__PURE__ */ jsxs("div", { className: "flex flex-col sm:flex-row items-center justify-center gap-3 pt-2", children: [
            /* @__PURE__ */ jsxs(
              Button,
              {
                size: "lg",
                onClick: () => navigate("/onboarding"),
                className: "gradient-primary text-white shadow-lg text-base px-8 py-6 w-full sm:w-auto hover:shadow-xl hover:scale-[1.02] transition-all duration-200 group",
                children: [
                  "3 Ay Ücretsiz Deneyin",
                  /* @__PURE__ */ jsx(ArrowRight, { className: "w-4 h-4 ml-2 group-hover:translate-x-0.5 transition-transform" })
                ]
              }
            ),
            /* @__PURE__ */ jsx(
              Button,
              {
                size: "lg",
                variant: "outline",
                onClick: () => navigate("/demo"),
                className: "text-base px-8 py-6 w-full sm:w-auto border-border hover:bg-muted/50 transition-all duration-200",
                children: t("indexPage.hero.ctaSecondary")
              }
            )
          ] }),
          /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground pt-1", children: t("indexPage.hero.trust") })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "mt-16 max-w-4xl mx-auto", children: /* @__PURE__ */ jsxs("div", { className: "relative rounded-xl overflow-hidden border border-border/60 shadow-2xl shadow-primary/5 bg-card", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 px-4 py-3 border-b border-border/40 bg-muted/30", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex gap-1.5", children: [
              /* @__PURE__ */ jsx("div", { className: "w-3 h-3 rounded-full bg-red-400/70" }),
              /* @__PURE__ */ jsx("div", { className: "w-3 h-3 rounded-full bg-yellow-400/70" }),
              /* @__PURE__ */ jsx("div", { className: "w-3 h-3 rounded-full bg-green-400/70" })
            ] }),
            /* @__PURE__ */ jsx("div", { className: "flex-1 mx-4", children: /* @__PURE__ */ jsx("div", { className: "h-6 rounded-md bg-muted/60 max-w-xs mx-auto flex items-center justify-center", children: /* @__PURE__ */ jsx("span", { className: "text-[10px] text-muted-foreground font-mono", children: "voyagerespond.com/dashboard" }) }) })
          ] }),
          /* @__PURE__ */ jsx(
            "img",
            {
              src: demoPoster,
              alt: t("indexPage.hero.screenshotAlt"),
              className: "w-full h-auto block",
              width: 1280,
              height: 800,
              fetchPriority: "high",
              decoding: "async"
            }
          )
        ] }) })
      ] })
    ] }),
    /* @__PURE__ */ jsx("section", { className: "border-y border-border/40 bg-muted/20", children: /* @__PURE__ */ jsx("div", { className: "container mx-auto px-4 sm:px-6 py-6", children: /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center justify-center gap-x-10 gap-y-3 text-sm text-muted-foreground", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsx(Users, { className: "w-4 h-4 text-primary" }),
        /* @__PURE__ */ jsxs("span", { children: [
          /* @__PURE__ */ jsx("strong", { className: "text-foreground", children: "100+" }),
          " ",
          t("indexPage.socialProof.businesses")
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsx(Star, { className: "w-4 h-4 text-primary" }),
        /* @__PURE__ */ jsxs("span", { children: [
          /* @__PURE__ */ jsx("strong", { className: "text-foreground", children: "50K+" }),
          " ",
          t("indexPage.socialProof.reviews")
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsx(Zap, { className: "w-4 h-4 text-primary" }),
        /* @__PURE__ */ jsxs("span", { children: [
          t("indexPage.socialProof.avgResponse"),
          " ",
          /* @__PURE__ */ jsx("strong", { className: "text-foreground", children: "< 2 dk" })
        ] })
      ] })
    ] }) }) }),
    /* @__PURE__ */ jsxs("section", { id: "features", className: "container mx-auto px-4 sm:px-6 py-20 md:py-28", children: [
      /* @__PURE__ */ jsxs("div", { className: "text-center mb-16", children: [
        /* @__PURE__ */ jsx("h2", { className: "text-3xl md:text-4xl font-bold text-foreground mb-4", children: t("indexPage.featuresSection.title") }),
        /* @__PURE__ */ jsx("p", { className: "text-lg text-muted-foreground max-w-2xl mx-auto", children: t("indexPage.featuresSection.subtitle") })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto", children: [
        {
          icon: MessageSquare,
          title: t("indexPage.featuresSection.aiReplyTitle"),
          desc: t("indexPage.featuresSection.aiReplyDesc")
        },
        {
          icon: Eye,
          title: t("indexPage.featuresSection.visibilityTitle"),
          desc: t("indexPage.featuresSection.visibilityDesc")
        },
        {
          icon: Star,
          title: t("indexPage.featuresSection.centralTitle"),
          desc: t("indexPage.featuresSection.centralDesc")
        },
        {
          icon: TrendingUp,
          title: t("indexPage.featuresSection.sentimentTitle"),
          desc: t("indexPage.featuresSection.sentimentDesc")
        },
        {
          icon: Target,
          title: t("indexPage.featuresSection.multiLocTitle"),
          desc: t("indexPage.featuresSection.multiLocDesc")
        },
        {
          icon: Shield,
          title: t("indexPage.featuresSection.competitorTitle"),
          desc: t("indexPage.featuresSection.competitorDesc")
        }
      ].map((feature, i) => /* @__PURE__ */ jsxs(
        "div",
        {
          className: "group p-6 rounded-xl border border-border bg-card hover:border-primary/20 hover:shadow-lg transition-all duration-300",
          children: [
            /* @__PURE__ */ jsx("div", { className: "w-10 h-10 rounded-lg bg-primary/8 flex items-center justify-center mb-4 group-hover:bg-primary/12 transition-colors", children: /* @__PURE__ */ jsx(feature.icon, { className: "w-5 h-5 text-primary" }) }),
            /* @__PURE__ */ jsx("h3", { className: "text-base font-semibold text-foreground mb-2", children: feature.title }),
            /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground leading-relaxed", children: feature.desc })
          ]
        },
        i
      )) })
    ] }),
    /* @__PURE__ */ jsxs("section", { id: "pricing", className: "relative py-20 md:py-28 overflow-hidden", children: [
      /* @__PURE__ */ jsx("div", { className: "absolute inset-0 gradient-pricing" }),
      /* @__PURE__ */ jsx("div", { className: "container mx-auto px-4 sm:px-6 relative z-10", children: /* @__PURE__ */ jsx("div", { className: "max-w-2xl mx-auto", children: /* @__PURE__ */ jsxs("div", { className: "rounded-2xl border border-primary/15 bg-card p-8 sm:p-12 shadow-xl relative overflow-hidden", children: [
        /* @__PURE__ */ jsx("div", { className: "absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" }),
        /* @__PURE__ */ jsxs("div", { className: "text-center space-y-6", children: [
          /* @__PURE__ */ jsxs("div", { className: "inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/8 border border-primary/15 text-primary text-xs font-medium", children: [
            /* @__PURE__ */ jsx(Sparkles, { className: "w-3.5 h-3.5" }),
            t("indexPage.pricingSection.badge")
          ] }),
          /* @__PURE__ */ jsx("h2", { className: "text-3xl md:text-4xl font-bold text-foreground", children: t("indexPage.pricingSection.title") }),
          /* @__PURE__ */ jsx("p", { className: "text-muted-foreground max-w-lg mx-auto leading-relaxed", children: t("indexPage.pricingSection.subtitle") }),
          /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-3 text-left max-w-md mx-auto pt-2", children: [
            t("indexPage.pricingSection.perk1"),
            t("indexPage.pricingSection.perk2")
          ].map((perk, i) => /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2.5", children: [
            /* @__PURE__ */ jsx(Check, { className: "w-4 h-4 text-primary flex-shrink-0" }),
            /* @__PURE__ */ jsx("span", { className: "text-sm text-foreground", children: perk })
          ] }, i)) }),
          /* @__PURE__ */ jsx("div", { className: "pt-4", children: /* @__PURE__ */ jsxs(
            Button,
            {
              size: "lg",
              onClick: () => navigate("/register"),
              className: "gradient-primary text-white shadow-lg text-base px-10 py-6 hover:shadow-xl hover:scale-[1.02] transition-all duration-200 group w-full sm:w-auto",
              children: [
                t("indexPage.pricingSection.cta"),
                /* @__PURE__ */ jsx(ArrowRight, { className: "w-4 h-4 ml-2 group-hover:translate-x-0.5 transition-transform" })
              ]
            }
          ) })
        ] })
      ] }) }) })
    ] }),
    /* @__PURE__ */ jsxs("footer", { className: "border-t border-border bg-card/50", children: [
      /* @__PURE__ */ jsx("div", { className: "container mx-auto px-4 sm:px-6 pt-10", children: /* @__PURE__ */ jsxs("div", { className: "max-w-4xl mx-auto p-6 rounded-xl bg-muted/40 border border-border", children: [
        /* @__PURE__ */ jsx("h2", { className: "text-base font-semibold text-foreground mb-4", children: "Popüler Rehberler" }),
        /* @__PURE__ */ jsxs("ul", { className: "grid sm:grid-cols-2 gap-2", children: [
          /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsx("button", { onClick: () => navigate("/google-yorum-cevap-ornekleri"), className: "text-sm text-primary hover:underline text-left", children: "Google Yorum Cevap Örnekleri (25 Şablon) →" }) }),
          /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsx("button", { onClick: () => navigate("/otel-yorum-cevaplari"), className: "text-sm text-primary hover:underline text-left", children: "Otel Yorum Cevapları →" }) }),
          /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsx("button", { onClick: () => navigate("/restoran-yorum-cevaplari"), className: "text-sm text-primary hover:underline text-left", children: "Restoran Yorum Cevapları →" }) }),
          /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsx("button", { onClick: () => navigate("/blog/google-yorumlarina-nasil-yanit-verilir"), className: "text-sm text-primary hover:underline text-left", children: "Google Yorumlarına Nasıl Yanıt Verilir? →" }) }),
          /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsx("button", { onClick: () => navigate("/blog/ai-gorunurluk-skoru-nedir"), className: "text-sm text-primary hover:underline text-left", children: "AI Görünürlük Skoru Nedir? →" }) }),
          /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsx("button", { onClick: () => navigate("/blog/kotu-yorumlara-nasil-cevap-verilir"), className: "text-sm text-primary hover:underline text-left", children: "Kötü Yorumlara Nasıl Cevap Verilir? →" }) })
        ] })
      ] }) }),
      /* @__PURE__ */ jsxs("div", { className: "container mx-auto px-4 sm:px-6 py-10", children: [
        /* @__PURE__ */ jsxs("div", { className: "grid sm:grid-cols-3 gap-8 mb-8", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mb-3", children: [
              /* @__PURE__ */ jsx("img", { src: voyageRespondLogo, alt: "VoyageRespond", className: "h-5 w-5" }),
              /* @__PURE__ */ jsx("span", { className: "font-semibold text-foreground text-sm", children: "VoyageRespond" })
            ] }),
            /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground leading-relaxed mb-3", children: t("indexPage.footerSection.tagline") }),
            /* @__PURE__ */ jsx(
              "a",
              {
                href: "https://www.instagram.com/voyagerespond",
                target: "_blank",
                rel: "noopener noreferrer",
                className: "inline-flex text-muted-foreground hover:text-foreground transition-colors",
                "aria-label": "Instagram",
                children: /* @__PURE__ */ jsx("svg", { className: "h-4 w-4", viewBox: "0 0 24 24", fill: "currentColor", children: /* @__PURE__ */ jsx("path", { d: "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" }) })
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("h4", { className: "font-medium text-foreground text-sm mb-3", children: t("indexPage.footerSection.links") }),
            /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsx("button", { onClick: () => navigate("/about"), className: "block text-sm text-muted-foreground hover:text-foreground transition-colors", children: t("indexPage.footerSection.about") }),
              /* @__PURE__ */ jsx("button", { onClick: () => navigate("/blog"), className: "block text-sm text-muted-foreground hover:text-foreground transition-colors", children: t("indexPage.footerSection.blog") }),
              /* @__PURE__ */ jsx("button", { onClick: () => navigate("/contact"), className: "block text-sm text-muted-foreground hover:text-foreground transition-colors", children: t("indexPage.footerSection.contact") }),
              /* @__PURE__ */ jsx("button", { onClick: () => navigate("/hub"), className: "block text-sm text-muted-foreground hover:text-foreground transition-colors", children: t("indexPage.footerSection.hub") })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("h4", { className: "font-medium text-foreground text-sm mb-3", children: t("indexPage.footerSection.legal") }),
            /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsx("button", { onClick: () => navigate("/privacy-policy"), className: "block text-sm text-muted-foreground hover:text-foreground transition-colors", children: t("indexPage.footerSection.privacy") }),
              /* @__PURE__ */ jsx("button", { onClick: () => navigate("/terms-of-service"), className: "block text-sm text-muted-foreground hover:text-foreground transition-colors", children: t("indexPage.footerSection.terms") }),
              /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground pt-1", children: "support@voyagerespond.com" })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "border-t border-border pt-6 text-center text-xs text-muted-foreground", children: [
          "© ",
          (/* @__PURE__ */ new Date()).getFullYear(),
          " VoyageRespond. ",
          t("indexPage.footerSection.rights")
        ] }),
        /* @__PURE__ */ jsx("div", { className: "mt-6 pt-6 border-t border-border", children: /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-xs text-muted-foreground", children: [
          /* @__PURE__ */ jsx("span", { className: "uppercase tracking-wide text-[10px] font-medium", children: "Verified on" }),
          /* @__PURE__ */ jsxs(
            "a",
            {
              href: "https://www.capterra.com/p/10042872/VoyageRespond/",
              target: "_blank",
              rel: "noopener noreferrer",
              className: "inline-flex items-center gap-1.5 hover:text-foreground transition-colors",
              "aria-label": "Verified on Capterra",
              children: [
                /* @__PURE__ */ jsx("span", { className: "inline-flex items-center justify-center h-5 w-5 rounded bg-[#FF9D28] text-white text-[10px] font-bold", children: "C" }),
                /* @__PURE__ */ jsx("span", { children: "Capterra" })
              ]
            }
          ),
          /* @__PURE__ */ jsxs(
            "a",
            {
              href: "https://www.getapp.com/customer-service-support-software/a/voyagerespond/",
              target: "_blank",
              rel: "noopener noreferrer",
              className: "inline-flex items-center gap-1.5 hover:text-foreground transition-colors",
              "aria-label": "Listed on GetApp",
              children: [
                /* @__PURE__ */ jsx("span", { className: "inline-flex items-center justify-center h-5 w-5 rounded bg-[#FF6F4D] text-white text-[10px] font-bold", children: "G" }),
                /* @__PURE__ */ jsx("span", { children: "GetApp" })
              ]
            }
          ),
          /* @__PURE__ */ jsxs("span", { className: "inline-flex items-center gap-1.5 opacity-50", "aria-label": "G2 coming soon", children: [
            /* @__PURE__ */ jsx("span", { className: "inline-flex items-center justify-center h-5 w-5 rounded bg-muted text-muted-foreground text-[10px] font-bold", children: "G2" }),
            /* @__PURE__ */ jsx("span", { children: "G2 (soon)" })
          ] }),
          /* @__PURE__ */ jsxs("span", { className: "inline-flex items-center gap-1.5 opacity-50", "aria-label": "Product Hunt coming soon", children: [
            /* @__PURE__ */ jsx("span", { className: "inline-flex items-center justify-center h-5 w-5 rounded bg-muted text-muted-foreground text-[10px] font-bold", children: "PH" }),
            /* @__PURE__ */ jsx("span", { children: "Product Hunt (soon)" })
          ] })
        ] }) })
      ] })
    ] })
  ] });
};
export {
  Index as default
};
