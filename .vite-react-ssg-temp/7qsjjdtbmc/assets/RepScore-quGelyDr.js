import { jsx, jsxs, Fragment } from "react/jsx-runtime";
import { C as Card, c as CardContent, a as CardHeader, e as CardTitle } from "./card-vx9BCW0t.js";
import { a as useBusiness, s as supabase, m as Badge, T as Tooltip, C as TooltipTrigger, E as TooltipContent } from "../main.mjs";
import { P as Progress } from "./progress-LK13s5oA.js";
import { Trophy, MapPin, Info, TrendingUp, TrendingDown } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { c as calculateRepScore, C as COMPONENT_INFO } from "./repScore-bTsCLOBT.js";
import "react";
import "vite-react-ssg";
import "react-router-dom";
import "@radix-ui/react-toast";
import "class-variance-authority";
import "clsx";
import "tailwind-merge";
import "next-themes";
import "sonner";
import "@radix-ui/react-tooltip";
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
import "@radix-ui/react-progress";
function RepScore() {
  const { activeBusiness } = useBusiness();
  const { data: reviews = [], isLoading } = useQuery({
    queryKey: ["reviews-for-repscore", activeBusiness == null ? void 0 : activeBusiness.id],
    queryFn: async () => {
      if (!activeBusiness) return [];
      const { data, error } = await supabase.from("reviews").select("rating, text, platform, posted_at, status, sentiment, approved_reply, replied_at").eq("business_id", activeBusiness.id);
      if (error) throw error;
      return data || [];
    },
    enabled: !!activeBusiness
  });
  const score = calculateRepScore(reviews);
  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const progress = score.totalScore / 1e3;
  const strokeDashoffset = circumference * (1 - progress);
  const components = Object.entries(score.breakdown).map(([key, value]) => ({
    key,
    value,
    ...COMPONENT_INFO[key],
    percentage: Math.round(value / COMPONENT_INFO[key].maxScore * 100)
  })).sort((a, b) => b.percentage - a.percentage);
  const recommendations = components.filter((c) => c.percentage < 70).sort((a, b) => a.percentage - b.percentage).slice(0, 4).map((comp) => {
    const recs = {
      reviewSentiment: "Müşteri deneyimini iyileştirerek yıldız ortalamanızı yükseltin.",
      reviewVolume: "Daha fazla müşteriden yorum talep edin. Minimum 500 yorum hedefleyin.",
      reviewSpread: "Google dışında Booking, TripAdvisor gibi platformlarda da yorum toplayın.",
      reviewRecency: "Düzenli yorum toplama stratejisi oluşturun. Son 90 gün kritik.",
      reviewResponse: "Tüm olumsuz yorumlara %100, olumlu yorumlara en az %20 yanıt verin.",
      reviewQuality: "Müşterilerden detaylı yorum bırakmalarını teşvik edin (2-3 cümle).",
      aiVisibility: "Pozitif duygu oranını artırmak için müşteri memnuniyetine odaklanın."
    };
    return { ...comp, recommendation: recs[comp.key] };
  });
  if (isLoading) {
    return /* @__PURE__ */ jsx("div", { className: "flex items-center justify-center min-h-screen", children: /* @__PURE__ */ jsx("div", { className: "animate-spin rounded-full h-8 w-8 border-b-2 border-primary" }) });
  }
  return /* @__PURE__ */ jsx("div", { className: "min-h-screen bg-background", children: /* @__PURE__ */ jsxs("div", { className: "max-w-5xl mx-auto p-8 space-y-8", children: [
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 mb-1", children: [
        /* @__PURE__ */ jsx(Trophy, { className: "h-7 w-7 text-primary" }),
        /* @__PURE__ */ jsx("h1", { className: "text-3xl font-semibold text-foreground", children: "Rep Score" })
      ] }),
      /* @__PURE__ */ jsx("p", { className: "text-muted-foreground", children: "Tüm platformlardan tek bir itibar puanı — 7 bileşen, 1000 puan üzerinden" }),
      activeBusiness && /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mt-2 text-sm", children: [
        /* @__PURE__ */ jsx(MapPin, { className: "h-4 w-4 text-primary" }),
        /* @__PURE__ */ jsx("span", { className: "font-medium text-foreground", children: activeBusiness.name }),
        activeBusiness.city && /* @__PURE__ */ jsxs("span", { className: "text-muted-foreground", children: [
          "• ",
          activeBusiness.city
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsx(Card, { className: "shadow-card overflow-hidden", children: /* @__PURE__ */ jsx("div", { className: "bg-gradient-to-br from-primary/5 via-background to-primary/10 p-8", children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col md:flex-row items-center gap-8", children: [
      /* @__PURE__ */ jsxs("div", { className: "relative flex-shrink-0", children: [
        /* @__PURE__ */ jsxs("svg", { width: "200", height: "200", viewBox: "0 0 200 200", children: [
          /* @__PURE__ */ jsx(
            "circle",
            {
              cx: "100",
              cy: "100",
              r: radius,
              fill: "none",
              stroke: "hsl(var(--muted))",
              strokeWidth: "12",
              strokeLinecap: "round"
            }
          ),
          /* @__PURE__ */ jsx(
            "circle",
            {
              cx: "100",
              cy: "100",
              r: radius,
              fill: "none",
              stroke: score.gradeColor,
              strokeWidth: "12",
              strokeLinecap: "round",
              strokeDasharray: circumference,
              strokeDashoffset,
              transform: "rotate(-90 100 100)",
              className: "transition-all duration-1000 ease-out"
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "absolute inset-0 flex flex-col items-center justify-center", children: [
          /* @__PURE__ */ jsx("span", { className: "text-5xl font-bold text-foreground", children: score.totalScore }),
          /* @__PURE__ */ jsx("span", { className: "text-sm text-muted-foreground mt-1", children: "/ 1000" })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex-1 text-center md:text-left space-y-3", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 justify-center md:justify-start", children: [
          /* @__PURE__ */ jsx(
            Badge,
            {
              className: "text-2xl font-bold px-4 py-2 border-0",
              style: { backgroundColor: score.gradeColor + "20", color: score.gradeColor },
              children: score.grade
            }
          ),
          /* @__PURE__ */ jsx("span", { className: "text-xl font-semibold", style: { color: score.gradeColor }, children: score.gradeLabel })
        ] }),
        /* @__PURE__ */ jsx("p", { className: "text-muted-foreground max-w-md", children: score.totalScore >= 750 ? "İtibarınız mükemmel seviyede! Bu performansı korumaya devam edin." : score.totalScore >= 500 ? "İyi bir itibar puanınız var. Birkaç alanı iyileştirerek daha da yükselebilirsiniz." : score.totalScore > 0 ? "İtibar puanınızda iyileştirme fırsatları var. Aşağıdaki önerileri inceleyin." : "Henüz yeterli veri yok. Yorum toplamaya başlayın!" }),
        /* @__PURE__ */ jsxs("div", { className: "flex gap-4 text-sm text-muted-foreground justify-center md:justify-start", children: [
          /* @__PURE__ */ jsxs("span", { children: [
            reviews.length,
            " toplam yorum"
          ] }),
          /* @__PURE__ */ jsx("span", { children: "•" }),
          /* @__PURE__ */ jsxs("span", { children: [
            new Set(reviews.map((r) => r.platform)).size,
            " platform"
          ] })
        ] })
      ] })
    ] }) }) }),
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx("h2", { className: "text-xl font-semibold text-foreground mb-4", children: "Bileşen Analizi" }),
      /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4", children: components.map((comp) => /* @__PURE__ */ jsx(Card, { className: "shadow-card hover:shadow-md transition-all", children: /* @__PURE__ */ jsxs(CardContent, { className: "p-5 space-y-3", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsx("span", { className: "text-lg", children: comp.icon }),
            /* @__PURE__ */ jsx("span", { className: "font-medium text-sm text-foreground", children: comp.label })
          ] }),
          /* @__PURE__ */ jsxs(Tooltip, { children: [
            /* @__PURE__ */ jsx(TooltipTrigger, { children: /* @__PURE__ */ jsx(Info, { className: "h-3.5 w-3.5 text-muted-foreground" }) }),
            /* @__PURE__ */ jsx(TooltipContent, { children: /* @__PURE__ */ jsx("p", { className: "max-w-[200px] text-xs", children: comp.tip }) })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between text-sm", children: [
            /* @__PURE__ */ jsxs("span", { className: "text-muted-foreground", children: [
              comp.value,
              " / ",
              comp.maxScore
            ] }),
            /* @__PURE__ */ jsxs("span", { className: "font-semibold text-foreground", children: [
              comp.percentage,
              "%"
            ] })
          ] }),
          /* @__PURE__ */ jsx(Progress, { value: comp.percentage, className: "h-2" })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "flex items-center gap-1.5 text-xs", children: comp.percentage >= 70 ? /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsx(TrendingUp, { className: "h-3 w-3 text-emerald-500" }),
          /* @__PURE__ */ jsx("span", { className: "text-emerald-600", children: "İyi performans" })
        ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsx(TrendingDown, { className: "h-3 w-3 text-amber-500" }),
          /* @__PURE__ */ jsx("span", { className: "text-amber-600", children: "İyileştirme alanı" })
        ] }) })
      ] }) }, comp.key)) })
    ] }),
    recommendations.length > 0 && /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx("h2", { className: "text-xl font-semibold text-foreground mb-4", children: "İyileştirme Önerileri" }),
      /* @__PURE__ */ jsx("div", { className: "space-y-3", children: recommendations.map((rec, i) => /* @__PURE__ */ jsx(Card, { className: "shadow-card", children: /* @__PURE__ */ jsxs(CardContent, { className: "p-5 flex items-start gap-4", children: [
        /* @__PURE__ */ jsx(
          "div",
          {
            className: "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold",
            style: { backgroundColor: score.gradeColor + "15", color: score.gradeColor },
            children: i + 1
          }
        ),
        /* @__PURE__ */ jsxs("div", { className: "flex-1", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mb-1", children: [
            /* @__PURE__ */ jsx("span", { children: rec.icon }),
            /* @__PURE__ */ jsx("span", { className: "font-medium text-foreground", children: rec.label }),
            /* @__PURE__ */ jsxs(Badge, { variant: "outline", className: "text-xs", children: [
              rec.percentage,
              "%"
            ] })
          ] }),
          /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: rec.recommendation })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex-shrink-0 text-right", children: [
          /* @__PURE__ */ jsx("span", { className: "text-xs text-muted-foreground", children: "Potansiyel" }),
          /* @__PURE__ */ jsxs("p", { className: "font-semibold text-primary text-sm", children: [
            "+",
            rec.maxScore - rec.value,
            " puan"
          ] })
        ] })
      ] }) }, rec.key)) })
    ] }),
    /* @__PURE__ */ jsxs(Card, { className: "shadow-card", children: [
      /* @__PURE__ */ jsx(CardHeader, { children: /* @__PURE__ */ jsx(CardTitle, { className: "text-base", children: "Nasıl Hesaplanır?" }) }),
      /* @__PURE__ */ jsx(CardContent, { children: /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-3 text-sm", children: [
        components.map((comp) => /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-muted-foreground", children: [
          /* @__PURE__ */ jsx("span", { children: comp.icon }),
          /* @__PURE__ */ jsxs("span", { children: [
            comp.label,
            ": ",
            /* @__PURE__ */ jsx("strong", { className: "text-foreground", children: comp.maxScore })
          ] })
        ] }, comp.key)),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 font-semibold text-foreground col-span-2 md:col-span-4 pt-2 border-t", children: [
          /* @__PURE__ */ jsx("span", { children: "🏆" }),
          /* @__PURE__ */ jsx("span", { children: "Toplam: 1000 puan" })
        ] })
      ] }) })
    ] })
  ] }) });
}
export {
  RepScore as default
};
