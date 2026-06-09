import { jsx, jsxs } from "react/jsx-runtime";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowRight, Sparkles } from "lucide-react";
import { v as voyageRespondLogo } from "./voyage-respond-logo-C1G06huv.js";
import { A as AEOSection } from "./AEOSection-B79DgfDR.js";
import { S as SEO } from "./SEO-CentcBuw.js";
import { k as getPlatformLandingPage, p as platformLandingPages } from "../main.mjs";
import { l } from "../main.mjs";
import NotFound from "./NotFound-ehSaTFZl.js";
import "react-helmet-async";
import "vite-react-ssg";
import "react";
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
const SITE_URL = "https://voyagerespond.com";
const PlatformLanding = () => {
  const navigate = useNavigate();
  const { slug } = useParams();
  const data = slug ? getPlatformLandingPage(slug) : void 0;
  if (!data) return /* @__PURE__ */ jsx(NotFound, {});
  const pageUrl = `${SITE_URL}/platform/${data.slug}`;
  const related = data.relatedSlugs.map((s) => platformLandingPages.find((p) => p.slug === s)).filter(Boolean);
  return /* @__PURE__ */ jsxs("div", { className: "min-h-screen bg-background", children: [
    /* @__PURE__ */ jsx(
      SEO,
      {
        title: data.metaTitle,
        description: data.metaDescription,
        canonical: pageUrl,
        ogType: "article",
        jsonLd: {
          "@context": "https://schema.org",
          "@type": "Article",
          headline: data.h1,
          description: data.metaDescription,
          author: { "@type": "Organization", name: "VoyageRespond", url: SITE_URL },
          publisher: {
            "@type": "Organization",
            name: "VoyageRespond",
            logo: { "@type": "ImageObject", url: `${SITE_URL}/og-image.png` }
          },
          mainEntityOfPage: pageUrl,
          inLanguage: "tr-TR"
        }
      }
    ),
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
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: () => navigate("/blog"),
            className: "text-sm font-medium text-muted-foreground hover:text-foreground transition-colors",
            children: "Blog"
          }
        ),
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: () => navigate("/onboarding"),
            className: "px-4 py-2 rounded-md text-sm font-medium text-white transition-all",
            style: { backgroundColor: "#7A5AF8" },
            children: "3 Ay Ücretsiz Dene"
          }
        )
      ] })
    ] }) }) }),
    /* @__PURE__ */ jsxs("article", { className: "container mx-auto px-4 sm:px-6 py-12 sm:py-16 max-w-3xl", children: [
      /* @__PURE__ */ jsxs("header", { className: "mb-10", children: [
        /* @__PURE__ */ jsxs("div", { className: "inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs sm:text-sm font-medium mb-4", children: [
          /* @__PURE__ */ jsx("span", { children: data.emoji }),
          /* @__PURE__ */ jsx("span", { children: data.badgeText })
        ] }),
        /* @__PURE__ */ jsx("h1", { className: "text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-5 leading-tight", children: data.h1 }),
        /* @__PURE__ */ jsx("p", { className: "text-base sm:text-lg text-muted-foreground leading-relaxed", children: data.intro }),
        /* @__PURE__ */ jsxs("div", { className: "mt-6 flex flex-col sm:flex-row gap-3", children: [
          /* @__PURE__ */ jsxs(
            "button",
            {
              onClick: () => navigate("/onboarding"),
              className: "inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg text-white text-sm font-medium transition-all hover:shadow-lg",
              style: { backgroundColor: "#7A5AF8" },
              children: [
                "Ücretsiz Başla",
                /* @__PURE__ */ jsx(ArrowRight, { className: "w-4 h-4" })
              ]
            }
          ),
          /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground self-center", children: "Kredi kartı gerekmez · İlk 3 ay ücretsiz" })
        ] })
      ] }),
      /* @__PURE__ */ jsxs(
        "nav",
        {
          "aria-label": "İçindekiler",
          className: "mb-12 p-5 rounded-xl border border-border bg-muted/30",
          children: [
            /* @__PURE__ */ jsx("h2", { className: "text-sm font-semibold text-foreground mb-3", children: "İçindekiler" }),
            /* @__PURE__ */ jsxs("ol", { className: "space-y-2 text-sm", children: [
              data.sections.map((s, i) => /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsxs(
                "a",
                {
                  href: `#${s.id}`,
                  className: "text-muted-foreground hover:text-primary transition-colors",
                  children: [
                    i + 1,
                    ". ",
                    s.heading
                  ]
                }
              ) }, s.id)),
              /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsxs(
                "a",
                {
                  href: "#sss",
                  className: "text-muted-foreground hover:text-primary transition-colors",
                  children: [
                    data.sections.length + 1,
                    ". Sıkça Sorulan Sorular"
                  ]
                }
              ) })
            ] })
          ]
        }
      ),
      data.sections.map((s) => /* @__PURE__ */ jsxs("section", { id: s.id, className: "mb-12 scroll-mt-20", children: [
        /* @__PURE__ */ jsx("h2", { className: "text-2xl sm:text-3xl font-bold text-foreground mb-5", children: s.heading }),
        s.paragraphs.map((p, i) => /* @__PURE__ */ jsx(
          "p",
          {
            className: "text-muted-foreground leading-relaxed mb-4 text-base",
            children: p
          },
          i
        )),
        s.bullets && /* @__PURE__ */ jsx("ul", { className: "mt-4 space-y-2", children: s.bullets.map((b, i) => /* @__PURE__ */ jsxs(
          "li",
          {
            className: "flex gap-3 text-muted-foreground leading-relaxed",
            children: [
              /* @__PURE__ */ jsx("span", { className: "mt-1.5 w-1.5 h-1.5 rounded-full bg-primary shrink-0" }),
              /* @__PURE__ */ jsx("span", { children: b })
            ]
          },
          i
        )) })
      ] }, s.id)),
      /* @__PURE__ */ jsxs("div", { className: "my-14 p-8 sm:p-10 rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 via-background to-background text-center", children: [
        /* @__PURE__ */ jsx(Sparkles, { className: "w-6 h-6 text-primary mx-auto mb-3" }),
        /* @__PURE__ */ jsxs("h2", { className: "text-2xl font-bold text-foreground mb-2", children: [
          data.platformName,
          " yönetimini bugün otomatikleştirin"
        ] }),
        /* @__PURE__ */ jsx("p", { className: "text-muted-foreground mb-6 max-w-xl mx-auto", children: "VoyageRespond ile yorumlarınızı tek panelden, marka sesinde ve saniyeler içinde yanıtlayın. İlk 3 ay ücretsiz." }),
        /* @__PURE__ */ jsxs(
          "button",
          {
            onClick: () => navigate("/onboarding"),
            className: "inline-flex items-center gap-2 px-7 py-3 rounded-md text-white font-medium transition-all hover:shadow-lg",
            style: { backgroundColor: "#7A5AF8" },
            children: [
              "Şimdi Ücretsiz Başla",
              /* @__PURE__ */ jsx(ArrowRight, { className: "w-4 h-4" })
            ]
          }
        )
      ] }),
      /* @__PURE__ */ jsx("div", { id: "sss", className: "scroll-mt-20", children: /* @__PURE__ */ jsx(AEOSection, { pageUrl, faqs: data.faqs, showAISection: false }) }),
      related.length > 0 && /* @__PURE__ */ jsxs("aside", { className: "mt-12 p-6 rounded-xl bg-muted/40 border border-border", children: [
        /* @__PURE__ */ jsx("h3", { className: "font-semibold text-foreground mb-4", children: "İlgili Sayfalar" }),
        /* @__PURE__ */ jsxs("ul", { className: "space-y-2", children: [
          related.map((r) => /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsxs(
            "button",
            {
              onClick: () => navigate(`/platform/${r.slug}`),
              className: "text-primary hover:underline text-sm text-left",
              children: [
                r.emoji,
                " ",
                r.metaTitle,
                " →"
              ]
            }
          ) }, r.slug)),
          /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => navigate("/otel-yorum-cevaplari"),
              className: "text-primary hover:underline text-sm text-left",
              children: "🏨 Otel Yorum Cevapları (30 Şablon) →"
            }
          ) }),
          /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => navigate("/google-yorum-cevap-ornekleri"),
              className: "text-primary hover:underline text-sm text-left",
              children: "⭐ Google Yorum Cevap Örnekleri (25 Şablon) →"
            }
          ) })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsx("footer", { className: "border-t border-border bg-card/50 mt-12", children: /* @__PURE__ */ jsx("div", { className: "container mx-auto px-6 py-8", children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col md:flex-row items-center justify-center gap-4 text-sm text-muted-foreground", children: [
      /* @__PURE__ */ jsx("span", { children: "© 2026 VoyageRespond" }),
      /* @__PURE__ */ jsx("span", { className: "hidden md:block", children: "•" }),
      /* @__PURE__ */ jsx("button", { onClick: () => navigate("/privacy-policy"), className: "hover:text-foreground", children: "Gizlilik Politikası" }),
      /* @__PURE__ */ jsx("span", { className: "hidden md:block", children: "•" }),
      /* @__PURE__ */ jsx("button", { onClick: () => navigate("/terms-of-service"), className: "hover:text-foreground", children: "Kullanım Koşulları" })
    ] }) }) })
  ] });
};
export {
  PlatformLanding as default,
  l as getPlatformLandingSlugs
};
