import { jsxs, jsx } from "react/jsx-runtime";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { B as Button } from "../main.mjs";
import { ArrowLeft } from "lucide-react";
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
function TermsOfService() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const sections = [
    "introduction",
    "definitions",
    "serviceDescription",
    "accountRules",
    "acceptableUse",
    "googleApi",
    "payments",
    "termination",
    "limitationOfLiability",
    "governingLaw",
    "contact"
  ];
  return /* @__PURE__ */ jsxs("div", { className: "min-h-screen bg-background", children: [
    /* @__PURE__ */ jsx(
      SEO,
      {
        title: "Kullanım Koşulları | VoyageRespond",
        description: "VoyageRespond kullanım koşulları: hizmet kapsamı, hesap kuralları, ödeme, sorumluluk ve fesih şartları hakkında bilmeniz gerekenler.",
        canonical: "https://voyagerespond.com/terms-of-service"
      }
    ),
    /* @__PURE__ */ jsxs("div", { className: "container mx-auto px-6 py-12 max-w-4xl", children: [
      /* @__PURE__ */ jsxs(
        Button,
        {
          variant: "ghost",
          onClick: () => navigate("/"),
          className: "mb-8",
          children: [
            /* @__PURE__ */ jsx(ArrowLeft, { className: "mr-2 h-4 w-4" }),
            t("terms.backToHome")
          ]
        }
      ),
      /* @__PURE__ */ jsx("h1", { className: "text-4xl font-bold text-foreground mb-4", children: t("terms.title") }),
      /* @__PURE__ */ jsx("p", { className: "text-muted-foreground mb-8", children: t("terms.lastUpdated") }),
      /* @__PURE__ */ jsx("div", { className: "prose prose-gray dark:prose-invert max-w-none space-y-8", children: sections.map((section) => /* @__PURE__ */ jsxs("section", { className: "mb-8", children: [
        /* @__PURE__ */ jsx("h2", { className: "text-2xl font-semibold text-foreground mb-4", children: t(`terms.sections.${section}.title`) }),
        /* @__PURE__ */ jsx("p", { className: "text-muted-foreground leading-relaxed", children: t(`terms.sections.${section}.content`) })
      ] }, section)) })
    ] })
  ] });
}
export {
  TermsOfService as default
};
