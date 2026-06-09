import { jsxs, jsx } from "react/jsx-runtime";
import { useState } from "react";
import { C as Card, a as CardHeader, e as CardTitle, b as CardDescription, c as CardContent } from "./card-vx9BCW0t.js";
import { L as Label } from "./label-Dr59vwVb.js";
import { S as Switch } from "./switch-DIbAOqMh.js";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-1zED13tY.js";
import { R as RadioGroup, a as RadioGroupItem } from "./radio-group-Oyal00sh.js";
import { Sparkles } from "lucide-react";
import "../main.mjs";
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
import "@radix-ui/react-label";
import "@radix-ui/react-switch";
import "@radix-ui/react-select";
import "@radix-ui/react-radio-group";
function AutoReply() {
  var _a;
  const [autoReplyEnabled, setAutoReplyEnabled] = useState(false);
  const [tone, setTone] = useState("friendly");
  const [language, setLanguage] = useState("en");
  const [reviewRule, setReviewRule] = useState("positive");
  const toneOptions = [
    { value: "formal", label: "Resmi", description: "Profesyonel ve iş benzeri" },
    { value: "friendly", label: "Arkadaş Canlısı", description: "Sıcak ve samimi" },
    { value: "playful", label: "Eğlenceli", description: "Eğlenceli ve rahat" }
  ];
  const previewReplies = {
    formal: "Yorumunuz için teşekkür ederiz. Geri bildiriminizi takdir ediyoruz ve beklentilerinizi karşılamaktan memnuniyet duyuyoruz. Gelecekte sizlere tekrar hizmet etmeyi dört gözle bekliyoruz.",
    friendly: "Harika yorumunuz için çok teşekkür ederiz! Harika bir deneyim yaşadığınızı duymak bizi çok mutlu etti. Sizi tekrar görmek için sabırsızlanıyoruz! 😊",
    playful: "Vay be, teşekkürler! 🎉 Muhteşem yorumunuz günümüzü aydınlattı! Sizi tekrar ağırlamak ve daha fazla harika deneyim yaşatmak için sabırsızlanıyoruz! ⭐"
  };
  return /* @__PURE__ */ jsxs("div", { className: "p-8 space-y-6", children: [
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx("h1", { className: "text-3xl font-semibold text-foreground mb-2", children: "Otomatik Yanıt" }),
      /* @__PURE__ */ jsx("p", { className: "text-muted-foreground", children: "AI destekli otomatik yanıtları yapılandırın" })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-6", children: [
      /* @__PURE__ */ jsxs("div", { className: "lg:col-span-2 space-y-6", children: [
        /* @__PURE__ */ jsxs(Card, { className: "shadow-card", children: [
          /* @__PURE__ */ jsxs(CardHeader, { children: [
            /* @__PURE__ */ jsx(CardTitle, { className: "text-lg", children: "Otomatik Yanıt Durumu" }),
            /* @__PURE__ */ jsx(CardDescription, { children: "Yorumlara otomatik yanıt vermek için AI'yı etkinleştirin" })
          ] }),
          /* @__PURE__ */ jsx(CardContent, { children: /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
            /* @__PURE__ */ jsxs("div", { className: "space-y-0.5", children: [
              /* @__PURE__ */ jsx(Label, { htmlFor: "auto-reply", className: "text-base font-medium", children: "Otomatik Yanıt" }),
              /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: autoReplyEnabled ? "Şu anda aktif" : "Şu anda aktif değil" })
            ] }),
            /* @__PURE__ */ jsx(
              Switch,
              {
                id: "auto-reply",
                checked: autoReplyEnabled,
                onCheckedChange: setAutoReplyEnabled
              }
            )
          ] }) })
        ] }),
        /* @__PURE__ */ jsxs(Card, { className: "shadow-card", children: [
          /* @__PURE__ */ jsxs(CardHeader, { children: [
            /* @__PURE__ */ jsx(CardTitle, { className: "text-lg", children: "Yanıt Tonu" }),
            /* @__PURE__ */ jsx(CardDescription, { children: "AI tarafından oluşturulan yanıtlar için ton seçin" })
          ] }),
          /* @__PURE__ */ jsx(CardContent, { className: "space-y-4", children: toneOptions.map((option) => /* @__PURE__ */ jsx(
            "div",
            {
              className: `p-4 rounded-lg border transition-smooth cursor-pointer ${tone === option.value ? "border-primary bg-primary/5" : "border-border hover:bg-muted/30"}`,
              onClick: () => setTone(option.value),
              children: /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3", children: [
                /* @__PURE__ */ jsx(
                  "div",
                  {
                    className: `w-4 h-4 rounded-full border-2 mt-1 flex items-center justify-center ${tone === option.value ? "border-primary" : "border-muted-foreground"}`,
                    children: tone === option.value && /* @__PURE__ */ jsx("div", { className: "w-2 h-2 rounded-full bg-primary" })
                  }
                ),
                /* @__PURE__ */ jsxs("div", { className: "flex-1", children: [
                  /* @__PURE__ */ jsx("p", { className: "font-medium text-foreground", children: option.label }),
                  /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: option.description })
                ] })
              ] })
            },
            option.value
          )) })
        ] }),
        /* @__PURE__ */ jsxs(Card, { className: "shadow-card", children: [
          /* @__PURE__ */ jsxs(CardHeader, { children: [
            /* @__PURE__ */ jsx(CardTitle, { className: "text-lg", children: "Dil ve Kurallar" }),
            /* @__PURE__ */ jsx(CardDescription, { children: "Dil ve yanıt kurallarını yapılandırın" })
          ] }),
          /* @__PURE__ */ jsxs(CardContent, { className: "space-y-6", children: [
            /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsx(Label, { children: "Dil" }),
              /* @__PURE__ */ jsxs(Select, { value: language, onValueChange: setLanguage, children: [
                /* @__PURE__ */ jsx(SelectTrigger, { children: /* @__PURE__ */ jsx(SelectValue, {}) }),
                /* @__PURE__ */ jsxs(SelectContent, { children: [
                  /* @__PURE__ */ jsx(SelectItem, { value: "en", children: "İngilizce" }),
                  /* @__PURE__ */ jsx(SelectItem, { value: "tr", children: "Türkçe" })
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
              /* @__PURE__ */ jsx(Label, { children: "Yanıt Kuralları" }),
              /* @__PURE__ */ jsxs(RadioGroup, { value: reviewRule, onValueChange: setReviewRule, children: [
                /* @__PURE__ */ jsxs("div", { className: "flex items-center space-x-2", children: [
                  /* @__PURE__ */ jsx(RadioGroupItem, { value: "positive", id: "positive" }),
                  /* @__PURE__ */ jsx(Label, { htmlFor: "positive", className: "font-normal cursor-pointer", children: "Sadece olumlu yorumlar (4-5 yıldız)" })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "flex items-center space-x-2", children: [
                  /* @__PURE__ */ jsx(RadioGroupItem, { value: "all", id: "all" }),
                  /* @__PURE__ */ jsx(Label, { htmlFor: "all", className: "font-normal cursor-pointer", children: "Tüm yorumlar" })
                ] })
              ] })
            ] })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsx("div", { children: /* @__PURE__ */ jsxs(Card, { className: "shadow-card sticky top-8", children: [
        /* @__PURE__ */ jsxs(CardHeader, { children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsx(Sparkles, { className: "h-5 w-5 text-primary" }),
            /* @__PURE__ */ jsx(CardTitle, { className: "text-lg", children: "Önizleme" })
          ] }),
          /* @__PURE__ */ jsx(CardDescription, { children: "Örnek AI tarafından oluşturulan yanıt" })
        ] }),
        /* @__PURE__ */ jsxs(CardContent, { children: [
          /* @__PURE__ */ jsx("div", { className: "p-4 rounded-lg bg-muted/30 border border-border", children: /* @__PURE__ */ jsx("p", { className: "text-sm text-foreground leading-relaxed", children: previewReplies[tone] }) }),
          /* @__PURE__ */ jsxs("div", { className: "mt-4 pt-4 border-t border-border space-y-2", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex justify-between text-xs", children: [
              /* @__PURE__ */ jsx("span", { className: "text-muted-foreground", children: "Ton:" }),
              /* @__PURE__ */ jsx("span", { className: "font-medium text-foreground capitalize", children: (_a = toneOptions.find((t) => t.value === tone)) == null ? void 0 : _a.label })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex justify-between text-xs", children: [
              /* @__PURE__ */ jsx("span", { className: "text-muted-foreground", children: "Dil:" }),
              /* @__PURE__ */ jsx("span", { className: "font-medium text-foreground", children: language === "en" ? "İngilizce" : "Türkçe" })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex justify-between text-xs", children: [
              /* @__PURE__ */ jsx("span", { className: "text-muted-foreground", children: "Kural:" }),
              /* @__PURE__ */ jsx("span", { className: "font-medium text-foreground", children: reviewRule === "positive" ? "Sadece olumlu" : "Tüm yorumlar" })
            ] })
          ] })
        ] })
      ] }) })
    ] })
  ] });
}
export {
  AutoReply as default
};
