import { jsx, jsxs } from "react/jsx-runtime";
import { useMemo, useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Tag, Clock, Share2, List } from "lucide-react";
import { g as getBlogPost, f as blogPosts } from "../main.mjs";
import { v as voyageRespondLogo } from "./voyage-respond-logo-C1G06huv.js";
import { A as AEOSection } from "./AEOSection-B79DgfDR.js";
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
const BlogPost = () => {
  var _a;
  const navigate = useNavigate();
  const { slug } = useParams();
  const post = slug ? getBlogPost(slug) : void 0;
  const toc = useMemo(() => {
    if (!post) return [];
    const slugify = (s) => s.toLowerCase().replace(/[^\w\s-]/g, "").trim().replace(/\s+/g, "-");
    return post.content.split("\n").filter((l) => l.startsWith("## ")).map((l) => {
      const text = l.slice(3).trim();
      return { id: slugify(text), text };
    });
  }, [post]);
  const [activeId, setActiveId] = useState("");
  useEffect(() => {
    if (!toc.length) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveId(entry.target.id);
        });
      },
      { rootMargin: "-80px 0px -70% 0px", threshold: 0.1 }
    );
    toc.forEach((h) => {
      const el = document.getElementById(h.id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [toc, slug]);
  if (!post) {
    return /* @__PURE__ */ jsx("div", { className: "min-h-screen flex items-center justify-center", children: /* @__PURE__ */ jsxs("div", { className: "text-center space-y-4", children: [
      /* @__PURE__ */ jsx("h1", { className: "text-2xl font-bold", children: "Yazı bulunamadı" }),
      /* @__PURE__ */ jsx("button", { onClick: () => navigate("/blog"), className: "text-primary hover:underline", children: "Blog'a dön" })
    ] }) });
  }
  const renderMarkdown = (md) => {
    const lines = md.trim().split("\n");
    const html = [];
    let inTable = false;
    let inList = false;
    for (let i = 0; i < lines.length; i++) {
      let line = lines[i];
      if (inList && !line.startsWith("- ") && !line.startsWith("1.") && !line.match(/^\d+\./)) {
        html.push("</ul>");
        inList = false;
      }
      if (line.startsWith("|")) {
        if (!inTable) {
          inTable = true;
          html.push('<div class="overflow-x-auto my-6"><table class="w-full border-collapse text-sm">');
          const cells2 = line.split("|").filter(Boolean).map((c) => c.trim());
          html.push("<thead><tr>" + cells2.map((c) => `<th class="border border-border px-4 py-2 bg-muted text-left font-semibold">${c}</th>`).join("") + "</tr></thead><tbody>");
          i++;
          continue;
        }
        const cells = line.split("|").filter(Boolean).map((c) => c.trim());
        html.push("<tr>" + cells.map((c) => `<td class="border border-border px-4 py-2">${formatInline(c)}</td>`).join("") + "</tr>");
        continue;
      } else if (inTable) {
        inTable = false;
        html.push("</tbody></table></div>");
      }
      if (line.startsWith("### ")) {
        html.push(`<h3 class="text-xl font-bold text-foreground mt-8 mb-3">${formatInline(line.slice(4))}</h3>`);
      } else if (line.startsWith("## ")) {
        const text = line.slice(3).trim();
        const id = text.toLowerCase().replace(/[^\w\s-]/g, "").trim().replace(/\s+/g, "-");
        html.push(`<h2 id="${id}" class="scroll-mt-24 text-2xl font-bold text-foreground mt-10 mb-4">${formatInline(text)}</h2>`);
      } else if (line.startsWith("> ")) {
        html.push(`<blockquote class="border-l-4 border-primary/30 pl-4 py-2 my-4 bg-muted/50 rounded-r-lg text-muted-foreground italic">${formatInline(line.slice(2))}</blockquote>`);
      } else if (line.startsWith("- ")) {
        if (!inList) {
          inList = true;
          html.push('<ul class="space-y-2 my-4 ml-6 list-disc text-muted-foreground">');
        }
        html.push(`<li>${formatInline(line.slice(2))}</li>`);
      } else if (line.match(/^\d+\.\s/)) {
        if (!inList) {
          inList = true;
          html.push('<ul class="space-y-2 my-4 ml-6 list-decimal text-muted-foreground">');
        }
        html.push(`<li>${formatInline(line.replace(/^\d+\.\s/, ""))}</li>`);
      } else if (line.trim() === "") ;
      else {
        html.push(`<p class="text-muted-foreground leading-relaxed my-3">${formatInline(line)}</p>`);
      }
    }
    if (inList) html.push("</ul>");
    if (inTable) html.push("</tbody></table></div>");
    return html.join("\n");
  };
  const formatInline = (text) => {
    return text.replace(/\*\*(.*?)\*\*/g, '<strong class="text-foreground font-semibold">$1</strong>').replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-primary hover:underline font-medium">$1</a>').replace(/`([^`]+)`/g, '<code class="bg-muted px-1.5 py-0.5 rounded text-sm">$1</code>');
  };
  const otherPosts = blogPosts.filter((p) => p.slug !== slug).slice(0, 2);
  return /* @__PURE__ */ jsxs("div", { className: "min-h-screen bg-background", children: [
    /* @__PURE__ */ jsx(
      SEO,
      {
        title: post.metaTitle ?? `${post.ogTitle} | VoyageRespond Blog`,
        description: post.metaDescription ?? post.ogDescription,
        canonical: `/blog/${post.slug}`,
        ogType: "article",
        jsonLd: {
          "@context": "https://schema.org",
          "@type": "BlogPosting",
          headline: post.title,
          description: post.description,
          author: { "@type": "Organization", name: post.author },
          publisher: {
            "@type": "Organization",
            name: "VoyageRespond",
            logo: { "@type": "ImageObject", url: "https://voyagerespond.com/email-logo.png" }
          },
          datePublished: post.publishedAt,
          dateModified: post.updatedAt ?? post.publishedAt,
          keywords: (_a = post.keywords) == null ? void 0 : _a.join(", "),
          mainEntityOfPage: `https://voyagerespond.com/blog/${post.slug}`
        }
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
        /* @__PURE__ */ jsx("button", { onClick: () => navigate("/blog"), className: "text-sm font-medium text-muted-foreground hover:text-foreground transition-colors", children: "Blog" }),
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
    /* @__PURE__ */ jsx("div", { className: "container mx-auto px-4 sm:px-6 py-12", children: /* @__PURE__ */ jsxs("div", { className: "mx-auto max-w-3xl xl:max-w-6xl xl:grid xl:grid-cols-[1fr_240px] xl:gap-12", children: [
      /* @__PURE__ */ jsxs("article", { className: "min-w-0", children: [
        /* @__PURE__ */ jsxs(
          "button",
          {
            onClick: () => navigate("/blog"),
            className: "flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8",
            children: [
              /* @__PURE__ */ jsx(ArrowLeft, { className: "w-4 h-4" }),
              "Back to Blog"
            ]
          }
        ),
        /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-6", children: [
          /* @__PURE__ */ jsxs("span", { className: "inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium", children: [
            /* @__PURE__ */ jsx(Tag, { className: "w-3 h-3" }),
            post.category
          ] }),
          /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-1", children: [
            /* @__PURE__ */ jsx(Clock, { className: "w-3.5 h-3.5" }),
            post.readTime,
            " okuma"
          ] }),
          /* @__PURE__ */ jsx("span", { children: new Date(post.publishedAt).toLocaleDateString("tr-TR", {
            year: "numeric",
            month: "long",
            day: "numeric"
          }) })
        ] }),
        /* @__PURE__ */ jsx("h1", { className: "text-3xl md:text-4xl lg:text-5xl font-bold text-foreground leading-tight mb-6", children: post.title }),
        /* @__PURE__ */ jsx("p", { className: "text-lg text-muted-foreground leading-relaxed mb-10 pb-10 border-b border-border", children: post.description }),
        /* @__PURE__ */ jsx(
          "div",
          {
            className: "prose-custom",
            dangerouslySetInnerHTML: { __html: renderMarkdown(post.content) }
          }
        ),
        /* @__PURE__ */ jsxs("div", { className: "mt-12 p-6 sm:p-8 rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/10 via-primary/5 to-background flex flex-col sm:flex-row items-center justify-between gap-4", children: [
          /* @__PURE__ */ jsxs("div", { className: "text-center sm:text-left", children: [
            /* @__PURE__ */ jsx("h3", { className: "text-lg sm:text-xl font-bold text-foreground", children: "Manage all your reviews in one place" }),
            /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground mt-1", children: "Reply to Google, Booking & TripAdvisor with AI — in seconds." })
          ] }),
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => navigate("/onboarding"),
              className: "px-6 py-3 rounded-md text-white font-medium transition-all hover:shadow-lg whitespace-nowrap min-h-[48px]",
              style: { backgroundColor: "#7A5AF8" },
              children: "Start Free Trial →"
            }
          )
        ] }),
        /* @__PURE__ */ jsx(
          AEOSection,
          {
            pageUrl: `https://voyagerespond.com/blog/${post.slug}`,
            faqs: post.faqs ?? [
              { question: "Google yorumlarına nasıl cevap verilir?", answer: "Google Business profilinizden yorumları görüntüleyip tek tek yanıt verebilirsiniz. Daha hızlı ve tutarlı yanıtlar için VoyageRespond gibi AI destekli yorum yönetim platformlarını kullanabilirsiniz." },
              { question: "AI yorum cevabı yazabilir mi?", answer: "Evet, VoyageRespond gibi AI destekli yorum yönetim platformları her yorumu analiz ederek kişiselleştirilmiş, marka uyumlu yanıtlar üretir. Manuel cevap yazmaya kıyasla %90 zaman tasarrufu sağlar." },
              { question: "Kötü yorumlara nasıl yanıt verilir?", answer: "Sakin kalın, özür dileyin, sorunu kabul edin ve somut bir çözüm sunun. VoyageRespond olumsuz yorumları anında tespit eder ve empatik yanıt önerileri sunar." }
            ]
          }
        ),
        /* @__PURE__ */ jsx("div", { className: "mt-12 pt-8 border-t border-border", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4", children: [
          /* @__PURE__ */ jsx(Share2, { className: "w-5 h-5 text-muted-foreground" }),
          /* @__PURE__ */ jsx("span", { className: "text-sm text-muted-foreground", children: "Bu yazıyı paylaşın" }),
          /* @__PURE__ */ jsx(
            "a",
            {
              href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(`https://voyagerespond.com/blog/${post.slug}`)}`,
              target: "_blank",
              rel: "noopener noreferrer",
              className: "text-sm text-primary hover:underline",
              children: "Twitter/X"
            }
          ),
          /* @__PURE__ */ jsx(
            "a",
            {
              href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(`https://voyagerespond.com/blog/${post.slug}`)}`,
              target: "_blank",
              rel: "noopener noreferrer",
              className: "text-sm text-primary hover:underline",
              children: "LinkedIn"
            }
          )
        ] }) })
      ] }),
      toc.length > 0 && /* @__PURE__ */ jsx("aside", { className: "hidden xl:block", children: /* @__PURE__ */ jsxs("div", { className: "sticky top-24", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-sm font-semibold text-foreground mb-3", children: [
          /* @__PURE__ */ jsx(List, { className: "w-4 h-4" }),
          "On this page"
        ] }),
        /* @__PURE__ */ jsx("nav", { className: "space-y-1 border-l border-border", children: toc.map((h) => /* @__PURE__ */ jsx(
          "a",
          {
            href: `#${h.id}`,
            className: `block pl-4 py-1.5 text-sm leading-snug border-l-2 -ml-px transition-colors ${activeId === h.id ? "border-primary text-primary font-medium" : "border-transparent text-muted-foreground hover:text-foreground"}`,
            children: h.text
          },
          h.id
        )) })
      ] }) })
    ] }) }),
    otherPosts.length > 0 && /* @__PURE__ */ jsxs("section", { className: "container mx-auto px-4 sm:px-6 py-12 max-w-3xl", children: [
      /* @__PURE__ */ jsx("h2", { className: "text-2xl font-bold text-foreground mb-6", children: "Diğer Yazılar" }),
      /* @__PURE__ */ jsx("div", { className: "grid md:grid-cols-2 gap-6", children: otherPosts.map((p) => /* @__PURE__ */ jsxs(
        "article",
        {
          onClick: () => navigate(`/blog/${p.slug}`),
          className: "cursor-pointer rounded-xl border border-border bg-card p-5 hover:shadow-lg transition-all group",
          children: [
            /* @__PURE__ */ jsx("span", { className: "text-xs text-primary font-medium", children: p.category }),
            /* @__PURE__ */ jsx("h3", { className: "text-lg font-semibold text-foreground mt-2 group-hover:text-primary transition-colors", children: p.title }),
            /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground mt-2 line-clamp-2", children: p.description })
          ]
        },
        p.slug
      )) })
    ] }),
    /* @__PURE__ */ jsx("section", { className: "container mx-auto px-4 sm:px-6 py-16 max-w-3xl", children: /* @__PURE__ */ jsxs("div", { className: "text-center p-10 rounded-2xl border border-primary/10 bg-gradient-to-br from-primary/5 via-background to-background", children: [
      /* @__PURE__ */ jsx("h2", { className: "text-2xl font-bold text-foreground mb-3", children: "Yapay zeka ile yorum yönetimine başlayın" }),
      /* @__PURE__ */ jsx("p", { className: "text-muted-foreground mb-6", children: "3 ay ücretsiz, tüm özellikler dahil." }),
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: () => navigate("/onboarding"),
          className: "px-8 py-3 rounded-md text-white font-medium transition-all hover:shadow-lg",
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
  BlogPost as default
};
