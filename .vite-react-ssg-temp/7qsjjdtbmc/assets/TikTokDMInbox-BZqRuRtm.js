import { jsx, jsxs } from "react/jsx-runtime";
import { F as AppLayout, B as Button, m as Badge } from "../main.mjs";
import { C as Card, c as CardContent, a as CardHeader, e as CardTitle, b as CardDescription } from "./card-vx9BCW0t.js";
import { MessageSquare, Lock, ExternalLink } from "lucide-react";
import { u as useTikTokConnection } from "./useTikTokConnection-VReZ2PUi.js";
import { Link } from "react-router-dom";
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
function TikTokDMInbox() {
  const { connection, loading } = useTikTokConnection();
  if (loading) {
    return /* @__PURE__ */ jsx(AppLayout, { children: /* @__PURE__ */ jsx("div", { className: "flex items-center justify-center min-h-[50vh]", children: /* @__PURE__ */ jsx("div", { className: "animate-spin rounded-full h-8 w-8 border-b-2 border-primary" }) }) });
  }
  if (!connection) {
    return /* @__PURE__ */ jsx(AppLayout, { children: /* @__PURE__ */ jsx("div", { className: "p-6 max-w-2xl mx-auto", children: /* @__PURE__ */ jsx(Card, { className: "border-dashed", children: /* @__PURE__ */ jsxs(CardContent, { className: "flex flex-col items-center justify-center py-12 text-center", children: [
      /* @__PURE__ */ jsx(MessageSquare, { className: "h-12 w-12 text-muted-foreground mb-4" }),
      /* @__PURE__ */ jsx("h3", { className: "text-lg font-semibold mb-2", children: "TikTok Bağlantısı Gerekli" }),
      /* @__PURE__ */ jsx("p", { className: "text-muted-foreground mb-4", children: "DM Inbox özelliğini kullanmak için önce TikTok hesabınızı bağlamanız gerekiyor." }),
      /* @__PURE__ */ jsx(Button, { asChild: true, children: /* @__PURE__ */ jsx(Link, { to: "/channels/tiktok", children: "TikTok'u Bağla" }) })
    ] }) }) }) });
  }
  return /* @__PURE__ */ jsx(AppLayout, { children: /* @__PURE__ */ jsxs("div", { className: "p-6 max-w-4xl mx-auto space-y-6", children: [
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsxs("h1", { className: "text-2xl font-bold mb-2 flex items-center gap-2", children: [
        "TikTok DM Inbox",
        /* @__PURE__ */ jsx(Badge, { variant: "secondary", className: "text-xs", children: "Yakında" })
      ] }),
      /* @__PURE__ */ jsx("p", { className: "text-muted-foreground", children: "TikTok direkt mesajlarınızı yönetin" })
    ] }),
    /* @__PURE__ */ jsxs(Card, { className: "border-dashed", children: [
      /* @__PURE__ */ jsxs(CardHeader, { children: [
        /* @__PURE__ */ jsxs(CardTitle, { className: "flex items-center gap-2 text-lg", children: [
          /* @__PURE__ */ jsx(Lock, { className: "h-5 w-5 text-amber-500" }),
          "TikTok API Kısıtlaması"
        ] }),
        /* @__PURE__ */ jsx(CardDescription, { children: "DM özelliği şu an için kısıtlı" })
      ] }),
      /* @__PURE__ */ jsxs(CardContent, { className: "space-y-4", children: [
        /* @__PURE__ */ jsx("div", { className: "bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4", children: /* @__PURE__ */ jsx("p", { className: "text-sm text-amber-800 dark:text-amber-200", children: "TikTok'un resmi API'si şu anda DM (Direkt Mesaj) erişimini desteklemiyor. Bu özellik TikTok tarafından yalnızca belirli iş ortaklarına açılmıştır." }) }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsx("h4", { className: "font-medium", children: "Mevcut Alternatifler:" }),
          /* @__PURE__ */ jsxs("ul", { className: "list-disc list-inside text-sm text-muted-foreground space-y-1", children: [
            /* @__PURE__ */ jsx("li", { children: "Video yorumlarına AI destekli yanıt verebilirsiniz" }),
            /* @__PURE__ */ jsx("li", { children: "Yorum üzerinden müşterilerinizi yönlendirebilirsiniz" }),
            /* @__PURE__ */ jsx("li", { children: "TikTok Shop entegrasyonu ile satış yapabilirsiniz" })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex gap-3", children: [
          /* @__PURE__ */ jsx(Button, { asChild: true, variant: "default", children: /* @__PURE__ */ jsxs(Link, { to: "/tiktok-inbox", children: [
            /* @__PURE__ */ jsx(MessageSquare, { className: "mr-2 h-4 w-4" }),
            "Video Yorumlarına Git"
          ] }) }),
          /* @__PURE__ */ jsx(Button, { asChild: true, variant: "outline", children: /* @__PURE__ */ jsxs(
            "a",
            {
              href: "https://developers.tiktok.com/doc/login-kit-manage-user-access-tokens/",
              target: "_blank",
              rel: "noopener noreferrer",
              children: [
                /* @__PURE__ */ jsx(ExternalLink, { className: "mr-2 h-4 w-4" }),
                "TikTok API Dökümanları"
              ]
            }
          ) })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs(Card, { children: [
      /* @__PURE__ */ jsx(CardHeader, { children: /* @__PURE__ */ jsx(CardTitle, { className: "text-lg", children: "Gelecek Özellikler" }) }),
      /* @__PURE__ */ jsx(CardContent, { children: /* @__PURE__ */ jsxs("div", { className: "grid gap-4 md:grid-cols-2", children: [
        /* @__PURE__ */ jsxs("div", { className: "p-4 border rounded-lg bg-muted/30", children: [
          /* @__PURE__ */ jsx("h4", { className: "font-medium mb-1", children: "AI Destekli DM Yanıtları" }),
          /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: "TikTok API'si açıldığında otomatik DM yanıtları" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "p-4 border rounded-lg bg-muted/30", children: [
          /* @__PURE__ */ jsx("h4", { className: "font-medium mb-1", children: "Müşteri Segmentasyonu" }),
          /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: "DM'lerinizi kategorilere ayırın ve önceliklendirin" })
        ] })
      ] }) })
    ] })
  ] }) });
}
export {
  TikTokDMInbox as default
};
