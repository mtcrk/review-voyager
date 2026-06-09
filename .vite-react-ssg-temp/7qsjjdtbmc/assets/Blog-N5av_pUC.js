import { jsxs, jsx } from "react/jsx-runtime";
import { useNavigate } from "react-router-dom";
import { Tag, Clock, ArrowRight } from "lucide-react";
import { f as blogPosts } from "../main.mjs";
import { v as voyageRespondLogo } from "./voyage-respond-logo-C1G06huv.js";
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
import "react-helmet-async";
const Blog = () => {
  const navigate = useNavigate();
  return /* @__PURE__ */ jsxs("div", { className: "min-h-screen bg-background", children: [
    /* @__PURE__ */ jsx(
      SEO,
      {
        title: "Blog | Yorum Yönetimi ve AI Rehberleri - VoyageRespond",
        description: "Google yorum yönetimi, AI görünürlük, müşteri analizi ve dijital itibar yönetimi hakkında rehberler ve ipuçları. VoyageRespond Blog.",
        canonical: "/blog"
      }
    ),
    /* @__PURE__ */ jsx("nav", { className: "sticky top-0 z-50 border-b backdrop-blur-lg bg-white/95", children: /* @__PURE__ */ jsx("div", { className: "container mx-auto px-4 sm:px-6", children: /* @__PURE__ */ jsxs("div", { className: "flex h-16 items-center justify-between", children: [
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
        /* @__PURE__ */ jsx("button", { onClick: () => navigate("/"), className: "text-sm font-medium text-muted-foreground hover:text-foreground transition-colors", children: "Ana Sayfa" }),
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: () => navigate("/onboarding"),
            className: "px-4 py-2 rounded-md text-sm font-medium text-white transition-all",
            style: { backgroundColor: "#7A5AF8" },
            children: "Ücretsiz Dene"
          }
        )
      ] })
    ] }) }) }),
    /* @__PURE__ */ jsxs("section", { className: "container mx-auto px-4 sm:px-6 py-10 sm:py-16 text-center", children: [
      /* @__PURE__ */ jsx("h1", { className: "text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-4", children: "Blog" }),
      /* @__PURE__ */ jsx("p", { className: "text-lg text-muted-foreground max-w-2xl mx-auto", children: "Google yorum yönetimi, AI görünürlük ve dijital itibar stratejileri hakkında rehberler." })
    ] }),
    /* @__PURE__ */ jsx("section", { className: "container mx-auto px-4 sm:px-6 pb-20", children: /* @__PURE__ */ jsx("div", { className: "grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 max-w-6xl mx-auto", children: blogPosts.map((post) => /* @__PURE__ */ jsxs(
      "article",
      {
        onClick: () => navigate(`/blog/${post.slug}`),
        className: "group cursor-pointer rounded-2xl border border-border bg-card overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1",
        children: [
          /* @__PURE__ */ jsx("div", { className: "h-2 w-full", style: { background: "linear-gradient(90deg, #7A5AF8, #3B82F6)" } }),
          /* @__PURE__ */ jsxs("div", { className: "p-6 space-y-4", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 text-sm text-muted-foreground", children: [
              /* @__PURE__ */ jsxs("span", { className: "inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium", children: [
                /* @__PURE__ */ jsx(Tag, { className: "w-3 h-3" }),
                post.category
              ] }),
              /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-1", children: [
                /* @__PURE__ */ jsx(Clock, { className: "w-3 h-3" }),
                post.readTime
              ] })
            ] }),
            /* @__PURE__ */ jsx("h2", { className: "text-xl font-bold text-foreground group-hover:text-primary transition-colors leading-tight", children: post.title }),
            /* @__PURE__ */ jsx("p", { className: "text-muted-foreground text-sm leading-relaxed line-clamp-3", children: post.description }),
            /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between pt-2", children: [
              /* @__PURE__ */ jsx("span", { className: "text-xs text-muted-foreground", children: new Date(post.publishedAt).toLocaleDateString("tr-TR", {
                year: "numeric",
                month: "long",
                day: "numeric"
              }) }),
              /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-1 text-primary text-sm font-medium group-hover:gap-2 transition-all", children: [
                "Oku ",
                /* @__PURE__ */ jsx(ArrowRight, { className: "w-4 h-4" })
              ] })
            ] })
          ] })
        ]
      },
      post.slug
    )) }) }),
    /* @__PURE__ */ jsx("section", { className: "container mx-auto px-4 sm:px-6 pb-20", children: /* @__PURE__ */ jsxs("div", { className: "max-w-3xl mx-auto text-center p-8 sm:p-12 rounded-2xl border border-primary/10 bg-gradient-to-br from-primary/5 via-background to-background", children: [
      /* @__PURE__ */ jsx("h2", { className: "text-2xl md:text-3xl font-bold text-foreground mb-4", children: "Yorumlarınızı AI ile yönetmeye başlayın" }),
      /* @__PURE__ */ jsx("p", { className: "text-muted-foreground mb-6", children: "3 ay ücretsiz, tüm özellikler dahil." }),
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: () => navigate("/onboarding"),
          className: "px-8 py-3 rounded-md text-white font-medium transition-all hover:shadow-lg min-h-[48px]",
          style: { backgroundColor: "#7A5AF8" },
          children: "Ücretsiz Dene"
        }
      )
    ] }) }),
    /* @__PURE__ */ jsx("footer", { className: "border-t border-border bg-card/50", children: /* @__PURE__ */ jsx("div", { className: "container mx-auto px-4 sm:px-6 py-8", children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col md:flex-row items-center justify-center gap-4 text-sm text-muted-foreground", children: [
      /* @__PURE__ */ jsx("span", { children: "© 2024 VoyageRespond" }),
      /* @__PURE__ */ jsx("span", { className: "hidden md:block", children: "•" }),
      /* @__PURE__ */ jsx("button", { onClick: () => navigate("/privacy-policy"), className: "hover:text-foreground", children: "Gizlilik Politikası" }),
      /* @__PURE__ */ jsx("span", { className: "hidden md:block", children: "•" }),
      /* @__PURE__ */ jsx("button", { onClick: () => navigate("/terms-of-service"), className: "hover:text-foreground", children: "Kullanım Koşulları" })
    ] }) }) })
  ] });
};
export {
  Blog as default
};
