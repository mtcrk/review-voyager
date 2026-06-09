import { jsxs, jsx } from "react/jsx-runtime";
import { ArrowLeft, Mail, Clock, MapPin } from "lucide-react";
import { B as Button } from "../main.mjs";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
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
const Contact = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  return /* @__PURE__ */ jsxs("div", { className: "min-h-screen bg-background", children: [
    /* @__PURE__ */ jsx(
      SEO,
      {
        title: "İletişim | VoyageRespond",
        description: "VoyageRespond ile iletişime geçin. Demo talep edin, sorularınızı iletin veya destek alın.",
        canonical: "/contact"
      }
    ),
    /* @__PURE__ */ jsx("header", { className: "border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50", children: /* @__PURE__ */ jsx("div", { className: "container mx-auto px-4 sm:px-6 py-4", children: /* @__PURE__ */ jsx("div", { className: "flex items-center gap-4", children: /* @__PURE__ */ jsxs(
      Button,
      {
        variant: "ghost",
        size: "sm",
        onClick: () => navigate("/"),
        className: "gap-2",
        children: [
          /* @__PURE__ */ jsx(ArrowLeft, { className: "w-4 h-4" }),
          t("contact.backToHome", "Ana Sayfa")
        ]
      }
    ) }) }) }),
    /* @__PURE__ */ jsx("main", { className: "container mx-auto px-4 sm:px-6 py-12 sm:py-20", children: /* @__PURE__ */ jsxs("div", { className: "max-w-2xl mx-auto text-center", children: [
      /* @__PURE__ */ jsx("div", { className: "inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-6", children: /* @__PURE__ */ jsx(Mail, { className: "w-10 h-10 text-primary" }) }),
      /* @__PURE__ */ jsx("h1", { className: "text-3xl sm:text-4xl font-bold text-foreground mb-4", children: t("contact.title", "Bize Ulaşın") }),
      /* @__PURE__ */ jsx("p", { className: "text-lg text-muted-foreground mb-12", children: t("contact.subtitle", "Sorularınız, önerileriniz veya destek talepleriniz için bizimle iletişime geçin.") }),
      /* @__PURE__ */ jsx("div", { className: "bg-card border border-border rounded-2xl p-6 sm:p-8 shadow-lg mb-8", children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center gap-4", children: [
        /* @__PURE__ */ jsx("div", { className: "w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center", children: /* @__PURE__ */ jsx(Mail, { className: "w-7 h-7 text-primary" }) }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h2", { className: "text-xl font-semibold text-foreground mb-2", children: t("contact.email", "E-posta") }),
          /* @__PURE__ */ jsx(
            "a",
            {
              href: "mailto:support@voyagerespond.com",
              className: "text-lg sm:text-2xl font-medium text-primary hover:underline transition-colors break-all",
              children: "support@voyagerespond.com"
            }
          )
        ] }),
        /* @__PURE__ */ jsxs(
          Button,
          {
            size: "lg",
            className: "gradient-primary text-white mt-4",
            onClick: () => window.location.href = "mailto:support@voyagerespond.com",
            children: [
              /* @__PURE__ */ jsx(Mail, { className: "w-5 h-5 mr-2" }),
              t("contact.sendEmail", "E-posta Gönder")
            ]
          }
        )
      ] }) }),
      /* @__PURE__ */ jsxs("div", { className: "grid sm:grid-cols-2 gap-6 mt-12", children: [
        /* @__PURE__ */ jsxs("div", { className: "p-6 rounded-xl border border-border bg-card/50", children: [
          /* @__PURE__ */ jsx(Clock, { className: "w-8 h-8 text-muted-foreground mx-auto mb-3" }),
          /* @__PURE__ */ jsx("h3", { className: "font-semibold text-foreground mb-1", children: t("contact.responseTime", "Yanıt Süresi") }),
          /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: t("contact.responseTimeDesc", "Genellikle 24 saat içinde yanıt veriyoruz") })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "p-6 rounded-xl border border-border bg-card/50", children: [
          /* @__PURE__ */ jsx(MapPin, { className: "w-8 h-8 text-muted-foreground mx-auto mb-3" }),
          /* @__PURE__ */ jsx("h3", { className: "font-semibold text-foreground mb-1", children: t("contact.location", "Konum") }),
          /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: t("contact.locationValue", "Türkiye") })
        ] })
      ] })
    ] }) })
  ] });
};
export {
  Contact as default
};
