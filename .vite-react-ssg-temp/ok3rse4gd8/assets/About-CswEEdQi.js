import { jsxs, jsx } from "react/jsx-runtime";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { u as useAuth, B as Button } from "../main.mjs";
import { L as LanguageSwitcher } from "./LanguageSwitcher-CkCZi_79.js";
import { v as voyageRespondLogo } from "./voyage-respond-logo-C1G06huv.js";
import { Building2, Target, Sparkles, Users, ArrowRight } from "lucide-react";
import { S as SEO } from "./SEO-CentcBuw.js";
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
function About() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user } = useAuth();
  return /* @__PURE__ */ jsxs("div", { className: "min-h-screen bg-background overflow-x-hidden", children: [
    /* @__PURE__ */ jsx(
      SEO,
      {
        title: "Hakkımızda | VoyageRespond",
        description: "VoyageRespond, otel ve restoranlar için AI destekli yorum yönetimi sunan B2B SaaS platformudur. Misyonumuzu ve ekibimizi tanıyın.",
        canonical: "/about"
      }
    ),
    /* @__PURE__ */ jsx("nav", { className: "sticky top-0 z-50 border-b backdrop-blur-lg bg-white", style: { borderBottomColor: "#E2E8F0" }, children: /* @__PURE__ */ jsx("div", { className: "container mx-auto px-4 sm:px-6", children: /* @__PURE__ */ jsxs("div", { className: "flex h-20 items-center justify-between", children: [
      /* @__PURE__ */ jsxs(
        "button",
        {
          onClick: () => navigate("/"),
          className: "flex items-center gap-2 pl-3 pt-1 hover:opacity-80 transition-opacity",
          children: [
            /* @__PURE__ */ jsx("img", { src: voyageRespondLogo, alt: "VoyageRespond", className: "h-7 w-7" }),
            /* @__PURE__ */ jsxs("span", { className: "text-lg", style: { color: "#1F2937", letterSpacing: "0.02em" }, children: [
              /* @__PURE__ */ jsx("span", { className: "font-normal", children: "Voyage" }),
              /* @__PURE__ */ jsx("span", { className: "font-semibold", children: "Respond" })
            ] })
          ]
        }
      ),
      /* @__PURE__ */ jsxs("div", { className: "hidden md:flex items-center gap-8", children: [
        /* @__PURE__ */ jsx("button", { onClick: () => navigate("/"), className: "text-base font-medium text-foreground hover:text-primary transition-colors", children: t("nav.home", "Ana Sayfa") }),
        /* @__PURE__ */ jsx("button", { onClick: () => navigate("/#pricing"), className: "text-base font-medium text-foreground hover:text-primary transition-colors", children: t("landing.earlyAccess.badge", "Erken Erişim") }),
        /* @__PURE__ */ jsx("button", { onClick: () => navigate("/contact"), className: "text-base font-medium text-foreground hover:text-primary transition-colors", children: t("nav.contact", "İletişim") })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsx(LanguageSwitcher, {}),
        /* @__PURE__ */ jsx(Button, { onClick: () => navigate(user ? "/dashboard" : "/onboarding"), className: "gradient-primary text-white", children: t("nav.getStarted") })
      ] })
    ] }) }) }),
    /* @__PURE__ */ jsxs("section", { className: "container mx-auto px-4 sm:px-6 pt-12 sm:pt-20 pb-12 sm:pb-16 text-center", children: [
      /* @__PURE__ */ jsxs("div", { className: "inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6", children: [
        /* @__PURE__ */ jsx(Building2, { className: "w-4 h-4" }),
        t("about.badge", "Hakkımızda")
      ] }),
      /* @__PURE__ */ jsxs("h1", { className: "text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight mb-6", children: [
        t("about.title", "Yapay Zeka ile İşletmelerin"),
        " ",
        /* @__PURE__ */ jsx("span", { className: "bg-gradient-to-r from-purple-600 via-primary to-blue-600 bg-clip-text text-transparent", children: t("about.titleHighlight", "Çevrimiçi İtibarını Yönetiyoruz") })
      ] }),
      /* @__PURE__ */ jsx("p", { className: "text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed", children: t("about.subtitle", "VoyageRespond, yapay zeka destekli yorum yönetimi ve itibar optimizasyonu ile işletmelerin çevrimiçi itibarını güçlendiren bir teknoloji platformudur. Google, Booking.com, TripAdvisor ve sosyal medya platformlarındaki yorumları tek noktadan yönetin.") })
    ] }),
    /* @__PURE__ */ jsxs("section", { className: "container mx-auto px-4 sm:px-6 py-12 sm:py-16", children: [
      /* @__PURE__ */ jsx("h2", { className: "text-3xl md:text-4xl font-bold text-foreground text-center mb-10", children: "Misyonumuz ve Değerlerimiz" }),
      /* @__PURE__ */ jsxs("div", { className: "grid sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8 max-w-5xl mx-auto", children: [
        /* @__PURE__ */ jsxs("div", { className: "text-center p-6 sm:p-8 rounded-2xl border border-border bg-card hover:shadow-lg transition-shadow", children: [
          /* @__PURE__ */ jsx("div", { className: "w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-5", children: /* @__PURE__ */ jsx(Target, { className: "w-7 h-7 text-primary" }) }),
          /* @__PURE__ */ jsx("h3", { className: "text-xl font-semibold text-foreground mb-3", children: t("about.mission.title", "Misyonumuz") }),
          /* @__PURE__ */ jsx("p", { className: "text-muted-foreground leading-relaxed", children: t("about.mission.description", "İşletmelerin çevrimiçi itibarını yapay zeka ile yönetmek ve güçlendirmek. Her yorum, markanızın dijital itibarını şekillendiren bir fırsattır.") })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "text-center p-6 sm:p-8 rounded-2xl border border-border bg-card hover:shadow-lg transition-shadow", children: [
          /* @__PURE__ */ jsx("div", { className: "w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-5", children: /* @__PURE__ */ jsx(Sparkles, { className: "w-7 h-7 text-primary" }) }),
          /* @__PURE__ */ jsx("h3", { className: "text-xl font-semibold text-foreground mb-3", children: t("about.vision.title", "Vizyonumuz") }),
          /* @__PURE__ */ jsx("p", { className: "text-muted-foreground leading-relaxed", children: t("about.vision.description", "Her işletmenin çevrimiçi itibarını yapay zeka ile kolayca yönetebileceği, olumsuz yorumları fırsata çevirebileceği ve müşteri memnuniyetini artırabileceği bir dünya.") })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "text-center p-6 sm:p-8 rounded-2xl border border-border bg-card hover:shadow-lg transition-shadow", children: [
          /* @__PURE__ */ jsx("div", { className: "w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-5", children: /* @__PURE__ */ jsx(Users, { className: "w-7 h-7 text-primary" }) }),
          /* @__PURE__ */ jsx("h3", { className: "text-xl font-semibold text-foreground mb-3", children: t("about.values.title", "Değerlerimiz") }),
          /* @__PURE__ */ jsx("p", { className: "text-muted-foreground leading-relaxed", children: t("about.values.description", "Şeffaflık, yenilikçilik ve müşteri odaklılık. Veriye dayalı kararlar ile işletmelerin büyümesine katkıda bulunuyoruz.") })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsx("section", { className: "container mx-auto px-4 sm:px-6 py-12 sm:py-16", children: /* @__PURE__ */ jsxs("div", { className: "max-w-4xl mx-auto", children: [
      /* @__PURE__ */ jsx("h2", { className: "text-3xl md:text-4xl font-bold text-foreground text-center mb-12", children: t("about.whatWeDo.title", "Ne Yapıyoruz?") }),
      /* @__PURE__ */ jsxs("div", { className: "grid md:grid-cols-2 gap-8", children: [
        /* @__PURE__ */ jsxs("div", { className: "p-6 rounded-xl border border-border bg-card", children: [
          /* @__PURE__ */ jsx("h3", { className: "text-lg font-semibold text-foreground mb-2", children: "🤖 AI Visibility Engine" }),
          /* @__PURE__ */ jsx("p", { className: "text-muted-foreground", children: t("about.whatWeDo.aiVisibility", "İşletmenizin Google arama ve yapay zeka asistanlarındaki görünürlüğünü ölçen ve optimize eden teknoloji.") })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "p-6 rounded-xl border border-border bg-card", children: [
          /* @__PURE__ */ jsx("h3", { className: "text-lg font-semibold text-foreground mb-2", children: "💬 Akıllı Yanıt Önerileri" }),
          /* @__PURE__ */ jsx("p", { className: "text-muted-foreground", children: t("about.whatWeDo.smartReply", "Yapay zeka destekli, markanızın tonuna uygun otomatik yorum yanıtı önerileri. Google, Booking, TripAdvisor ve Expedia desteği.") })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "p-6 rounded-xl border border-border bg-card", children: [
          /* @__PURE__ */ jsx("h3", { className: "text-lg font-semibold text-foreground mb-2", children: "📊 Performans Analitikleri" }),
          /* @__PURE__ */ jsx("p", { className: "text-muted-foreground", children: t("about.whatWeDo.analytics", "Duygu analizi, trend takibi ve rekabet karşılaştırması ile işletmenizin çevrimiçi itibarını anlık olarak izleyin.") })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "p-6 rounded-xl border border-border bg-card", children: [
          /* @__PURE__ */ jsx("h3", { className: "text-lg font-semibold text-foreground mb-2", children: "📱 Çoklu Platform" }),
          /* @__PURE__ */ jsx("p", { className: "text-muted-foreground", children: t("about.whatWeDo.multiPlatform", "Google, Instagram, TikTok, Booking.com, TripAdvisor ve daha fazla platformdan gelen yorumları tek bir panelden yönetin.") })
        ] })
      ] })
    ] }) }),
    /* @__PURE__ */ jsx("section", { className: "container mx-auto px-4 sm:px-6 py-12 sm:py-20", children: /* @__PURE__ */ jsxs("div", { className: "max-w-3xl mx-auto text-center rounded-2xl border border-primary/10 bg-gradient-to-br from-primary/5 via-background to-background p-8 sm:p-12", children: [
      /* @__PURE__ */ jsx("h2", { className: "text-3xl font-bold text-foreground mb-4", children: t("about.cta.title", "İşletmenizi Büyütmeye Başlayın") }),
      /* @__PURE__ */ jsx("p", { className: "text-muted-foreground mb-8 max-w-xl mx-auto", children: t("about.cta.subtitle", "AI Visibility Score'unuzu ücretsiz öğrenin ve dijital görünürlüğünüzü artırın.") }),
      /* @__PURE__ */ jsxs(
        Button,
        {
          size: "lg",
          onClick: () => navigate("/onboarding"),
          className: "gradient-primary text-white shadow-lg text-base sm:text-lg px-8 sm:px-10 py-6 w-full sm:w-auto min-h-[48px] hover:shadow-2xl transition-all duration-300 hover:scale-105",
          children: [
            t("landing.heroCta", "See Your AI Visibility Score"),
            /* @__PURE__ */ jsx(ArrowRight, { className: "w-5 h-5 ml-2" })
          ]
        }
      )
    ] }) }),
    /* @__PURE__ */ jsx("footer", { className: "border-t border-border bg-card/50 backdrop-blur-sm", children: /* @__PURE__ */ jsxs("div", { className: "container mx-auto px-4 sm:px-6 py-8 sm:py-12", children: [
      /* @__PURE__ */ jsxs("div", { className: "grid sm:grid-cols-2 md:grid-cols-3 gap-8 mb-8", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mb-4", children: [
            /* @__PURE__ */ jsx("img", { src: voyageRespondLogo, alt: "VoyageRespond", className: "h-6 w-6" }),
            /* @__PURE__ */ jsx("span", { className: "font-semibold text-foreground", children: "VoyageRespond" })
          ] }),
          /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground leading-relaxed", children: "AI-powered review management & visibility optimization platform." })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h4", { className: "font-semibold text-foreground mb-3", children: t("footer.quickLinks", "Hızlı Bağlantılar") }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsx("button", { onClick: () => navigate("/"), className: "block text-sm text-muted-foreground hover:text-foreground transition-colors", children: t("nav.home", "Ana Sayfa") }),
            /* @__PURE__ */ jsx("button", { onClick: () => navigate("/#pricing"), className: "block text-sm text-muted-foreground hover:text-foreground transition-colors", children: t("landing.earlyAccess.badge", "Erken Erişim") }),
            /* @__PURE__ */ jsx("button", { onClick: () => navigate("/contact"), className: "block text-sm text-muted-foreground hover:text-foreground transition-colors", children: t("nav.contact", "İletişim") }),
            /* @__PURE__ */ jsx("button", { onClick: () => navigate("/about"), className: "block text-sm text-muted-foreground hover:text-foreground transition-colors", children: t("about.badge", "Hakkımızda") })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h4", { className: "font-semibold text-foreground mb-3", children: t("about.companyInfo.address", "Adres") }),
          /* @__PURE__ */ jsxs("p", { className: "text-sm text-muted-foreground leading-relaxed", children: [
            "Bilkent Cyberpark, Üniversiteler Mah.",
            /* @__PURE__ */ jsx("br", {}),
            "Bilkent Blv., 06520 Çankaya",
            /* @__PURE__ */ jsx("br", {}),
            "Ankara, Türkiye"
          ] }),
          /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground mt-2", children: "support@voyagerespond.com" })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "border-t border-border pt-6 flex flex-col md:flex-row items-center justify-center gap-6 text-sm text-muted-foreground", children: [
        /* @__PURE__ */ jsx("span", { children: t("footer.copyright") }),
        /* @__PURE__ */ jsx("span", { className: "hidden md:block", children: "•" }),
        /* @__PURE__ */ jsx("button", { onClick: () => navigate("/privacy-policy"), className: "hover:text-foreground transition-colors", children: t("footer.privacy") }),
        /* @__PURE__ */ jsx("span", { className: "hidden md:block", children: "•" }),
        /* @__PURE__ */ jsx("button", { onClick: () => navigate("/terms-of-service"), className: "hover:text-foreground transition-colors", children: t("footer.terms") })
      ] })
    ] }) })
  ] });
}
export {
  About as default
};
