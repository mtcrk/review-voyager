import { jsxs, jsx, Fragment } from "react/jsx-runtime";
import { useState } from "react";
import { a as useBusiness, B as Button, m as Badge, A as AlertDialog, n as AlertDialogContent, o as AlertDialogHeader, q as AlertDialogTitle, r as AlertDialogDescription, v as AlertDialogFooter, w as AlertDialogCancel, x as AlertDialogAction, s as supabase, t as toast, i as invokeAuthedFunction } from "../main.mjs";
import { C as Card, a as CardHeader, e as CardTitle, b as CardDescription, c as CardContent } from "./card-vx9BCW0t.js";
import { Loader2, Plus, Star, AlertCircle, CheckCircle2, Unlink } from "lucide-react";
import "vite-react-ssg";
import "react-router-dom";
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
function GoogleAccounts() {
  const businessCtx = useBusiness();
  const { businesses, loading } = businessCtx;
  const refetch = businessCtx.refetch || businessCtx.refresh;
  const [connecting, setConnecting] = useState(false);
  const [disconnectId, setDisconnectId] = useState(null);
  const [disconnecting, setDisconnecting] = useState(false);
  const connectedBusinesses = businesses.filter((b) => b.google_connected);
  const target = connectedBusinesses.find((b) => b.id === disconnectId);
  const handleDisconnect = async () => {
    if (!target) return;
    setDisconnecting(true);
    try {
      const { error: bizErr } = await supabase.from("businesses").update({
        google_connected: false,
        google_location_id: null,
        google_account_id: null,
        place_id: null
      }).eq("id", target.id);
      if (bizErr) throw bizErr;
      await supabase.from("business_credentials").delete().eq("business_id", target.id);
      toast({
        title: "Bağlantı kesildi",
        description: "Mevcut Google yorumlarınız panelde görünmeye devam edecek (salt-okunur)."
      });
      setDisconnectId(null);
      if (typeof refetch === "function") await refetch();
    } catch (e) {
      toast({
        title: "Hata",
        description: e.message || "Bağlantı kesilemedi.",
        variant: "destructive"
      });
    } finally {
      setDisconnecting(false);
    }
  };
  const handleConnect = async () => {
    setConnecting(true);
    try {
      const response = await invokeAuthedFunction("google-business-auth", {
        body: { action: "initiate" }
      });
      if (!(response == null ? void 0 : response.authUrl)) throw new Error("Google bağlantı adresi alınamadı");
      window.location.href = response.authUrl;
    } catch (error) {
      toast({
        title: "Bağlantı Hatası",
        description: error.message || "Google Business bağlantısı başlatılamadı.",
        variant: "destructive"
      });
      setConnecting(false);
    }
  };
  return /* @__PURE__ */ jsxs("div", { className: "p-8 space-y-6 max-w-5xl mx-auto", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between flex-wrap gap-4", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h1", { className: "text-3xl font-semibold text-foreground mb-2", children: "Google Hesapları" }),
        /* @__PURE__ */ jsx("p", { className: "text-muted-foreground", children: "Birden fazla Google Business hesabı ve lokasyonu bağlayabilirsiniz" })
      ] }),
      /* @__PURE__ */ jsx(Button, { onClick: handleConnect, disabled: connecting, children: connecting ? /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsx(Loader2, { className: "mr-2 h-4 w-4 animate-spin" }),
        "Yönlendiriliyor..."
      ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsx(Plus, { className: "mr-2 h-4 w-4" }),
        "Yeni Google Hesabı Bağla"
      ] }) })
    ] }),
    /* @__PURE__ */ jsxs(Card, { children: [
      /* @__PURE__ */ jsxs(CardHeader, { children: [
        /* @__PURE__ */ jsxs(CardTitle, { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsx(Star, { className: "h-5 w-5 text-primary" }),
          "Bağlı Lokasyonlar",
          /* @__PURE__ */ jsx(Badge, { variant: "secondary", className: "ml-2", children: connectedBusinesses.length })
        ] }),
        /* @__PURE__ */ jsx(CardDescription, { children: "Her lokasyon ayrı bir işletme olarak listelenir. Farklı bir Google hesabıyla giriş yaparak ek lokasyonlar ekleyebilirsiniz." })
      ] }),
      /* @__PURE__ */ jsx(CardContent, { children: loading ? /* @__PURE__ */ jsx("div", { className: "flex items-center justify-center py-12", children: /* @__PURE__ */ jsx(Loader2, { className: "h-6 w-6 animate-spin text-muted-foreground" }) }) : connectedBusinesses.length === 0 ? /* @__PURE__ */ jsxs("div", { className: "text-center py-12 space-y-3", children: [
        /* @__PURE__ */ jsx(AlertCircle, { className: "h-10 w-10 text-muted-foreground mx-auto" }),
        /* @__PURE__ */ jsx("p", { className: "text-muted-foreground", children: "Henüz bağlı bir Google işletmesi yok." }),
        /* @__PURE__ */ jsxs(Button, { onClick: handleConnect, disabled: connecting, variant: "outline", children: [
          /* @__PURE__ */ jsx(Plus, { className: "mr-2 h-4 w-4" }),
          "İlk Hesabınızı Bağlayın"
        ] })
      ] }) : /* @__PURE__ */ jsx("div", { className: "space-y-2", children: connectedBusinesses.map((b) => /* @__PURE__ */ jsxs(
        "div",
        {
          className: "flex items-start justify-between gap-4 p-4 rounded-lg border bg-card hover:bg-accent/30 transition-colors",
          children: [
            /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
                /* @__PURE__ */ jsx(CheckCircle2, { className: "h-4 w-4 text-primary shrink-0" }),
                /* @__PURE__ */ jsx("p", { className: "font-medium text-foreground truncate", children: b.name })
              ] }),
              b.city && /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground mt-1 ml-6", children: b.city }),
              b.place_id && /* @__PURE__ */ jsxs("p", { className: "text-xs text-muted-foreground mt-1 ml-6 font-mono truncate", children: [
                "Place ID: ",
                b.place_id
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 shrink-0", children: [
              /* @__PURE__ */ jsx(Badge, { variant: "outline", children: "Bağlı" }),
              /* @__PURE__ */ jsxs(
                Button,
                {
                  variant: "ghost",
                  size: "sm",
                  className: "text-destructive hover:text-destructive hover:bg-destructive/10",
                  onClick: () => setDisconnectId(b.id),
                  children: [
                    /* @__PURE__ */ jsx(Unlink, { className: "h-4 w-4 mr-1" }),
                    "Bağlantıyı Kes"
                  ]
                }
              )
            ] })
          ]
        },
        b.id
      )) }) })
    ] }),
    /* @__PURE__ */ jsx(Card, { className: "bg-muted/30", children: /* @__PURE__ */ jsxs(CardContent, { className: "pt-6 text-sm text-muted-foreground space-y-2", children: [
      /* @__PURE__ */ jsx("p", { className: "font-medium text-foreground", children: "💡 Nasıl çalışır?" }),
      /* @__PURE__ */ jsxs("ul", { className: "list-disc list-inside space-y-1", children: [
        /* @__PURE__ */ jsx("li", { children: '"Yeni Google Hesabı Bağla" ile farklı bir Google hesabıyla giriş yapın.' }),
        /* @__PURE__ */ jsx("li", { children: "Açılan ekranda eklemek istediğiniz lokasyonları seçin." }),
        /* @__PURE__ */ jsx("li", { children: "Aynı hesaptan tekrar bağlanırsanız mükerrer kayıt oluşmaz." })
      ] })
    ] }) }),
    /* @__PURE__ */ jsx(AlertDialog, { open: !!disconnectId, onOpenChange: (o) => !o && setDisconnectId(null), children: /* @__PURE__ */ jsxs(AlertDialogContent, { children: [
      /* @__PURE__ */ jsxs(AlertDialogHeader, { children: [
        /* @__PURE__ */ jsx(AlertDialogTitle, { children: "Google bağlantısını kesmek istiyor musun?" }),
        /* @__PURE__ */ jsx(AlertDialogDescription, { asChild: true, children: /* @__PURE__ */ jsxs("div", { className: "space-y-2 text-sm", children: [
          /* @__PURE__ */ jsxs("p", { children: [
            /* @__PURE__ */ jsx("strong", { children: target == null ? void 0 : target.name }),
            " için Google Business bağlantısı kesilecek."
          ] }),
          /* @__PURE__ */ jsxs("ul", { className: "list-disc list-inside space-y-1 text-muted-foreground", children: [
            /* @__PURE__ */ jsx("li", { children: "Yeni Google yorumları otomatik çekilmeyecek." }),
            /* @__PURE__ */ jsx("li", { children: "Panelden Google'a doğrudan yanıt gönderemeyeceksin." }),
            /* @__PURE__ */ jsxs("li", { children: [
              /* @__PURE__ */ jsx("strong", { className: "text-foreground", children: "Mevcut yorumların silinmez" }),
              " — geçmiş tüm Google yorumların panelde salt-okunur kalmaya devam eder."
            ] }),
            /* @__PURE__ */ jsx("li", { children: 'İstediğin zaman tekrar "Yeni Google Hesabı Bağla" ile bağlayabilirsin.' })
          ] })
        ] }) })
      ] }),
      /* @__PURE__ */ jsxs(AlertDialogFooter, { children: [
        /* @__PURE__ */ jsx(AlertDialogCancel, { disabled: disconnecting, children: "Vazgeç" }),
        /* @__PURE__ */ jsx(
          AlertDialogAction,
          {
            disabled: disconnecting,
            className: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
            onClick: (e) => {
              e.preventDefault();
              handleDisconnect();
            },
            children: disconnecting ? /* @__PURE__ */ jsxs(Fragment, { children: [
              /* @__PURE__ */ jsx(Loader2, { className: "mr-2 h-4 w-4 animate-spin" }),
              "Kesiliyor..."
            ] }) : "Evet, Bağlantıyı Kes"
          }
        )
      ] })
    ] }) })
  ] });
}
export {
  GoogleAccounts as default
};
