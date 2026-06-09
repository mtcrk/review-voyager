import { jsxs, jsx, Fragment } from "react/jsx-runtime";
import { C as Card, a as CardHeader, e as CardTitle, c as CardContent } from "./card-vx9BCW0t.js";
import { n as normalizeRatingTo5, a as averageRating5 } from "./ratingScale-DXJYGEIV.js";
import { B as Button, m as Badge, I as Input, s as supabase, a as useBusiness, G as useReviewFetch, t as toast$1, S as Skeleton } from "../main.mjs";
import { CheckCircle, AlertTriangle, ArrowRight, Clock, MessageSquare, Star, Users, Loader2, Search, Eye, TrendingUp, TrendingDown, Minus, Sparkles, X, Building2, AlertCircle, Lock, CheckCircle2, Circle, ExternalLink, Check, Map as Map$1, Hotel, Trophy, MousePointerClick, PartyPopper, Inbox, ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useMemo, useEffect } from "react";
import { startOfWeek, addDays, startOfDay, endOfDay, format, isSameDay } from "date-fns";
import { B as BusinessOnboarding } from "./BusinessOnboarding-D7tyeIp4.js";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { T as Tabs, a as TabsList, b as TabsTrigger, c as TabsContent } from "./tabs-C8D1i09v.js";
import { P as Progress } from "./progress-LK13s5oA.js";
import { C as COMPONENT_INFO, c as calculateRepScore } from "./repScore-bTsCLOBT.js";
import { u as useGooglePerformance } from "./useGooglePerformance-BZTBFIkl.js";
import { D as Dialog, a as DialogContent, b as DialogHeader, c as DialogTitle, d as DialogDescription } from "./dialog-CFYcafO1.js";
import "vite-react-ssg";
import "@radix-ui/react-toast";
import "class-variance-authority";
import "clsx";
import "tailwind-merge";
import "next-themes";
import "@radix-ui/react-tooltip";
import "@supabase/supabase-js";
import "@radix-ui/react-slot";
import "@radix-ui/react-separator";
import "@radix-ui/react-dialog";
import "@radix-ui/react-alert-dialog";
import "@radix-ui/react-dropdown-menu";
import "@radix-ui/react-collapsible";
import "i18next";
import "i18next-browser-languagedetector";
import "./label-Dr59vwVb.js";
import "@radix-ui/react-label";
import "./alert-BbdwpNV6.js";
import "@radix-ui/react-tabs";
import "@radix-ui/react-progress";
function PriorityActions({ reviews }) {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState("all");
  const priorityReviews = useMemo(() => {
    const now2 = /* @__PURE__ */ new Date();
    const threeDaysAgo = new Date(now2.getTime() - 3 * 24 * 60 * 60 * 1e3);
    const pending = reviews.filter((r) => r.status === "pending_reply");
    const critical = pending.filter(
      (r) => r.rating <= 2 || r.sentiment === "negative"
    );
    const urgent = pending.filter((r) => {
      const postedDate = new Date(r.posted_at);
      return postedDate >= threeDaysAgo && !critical.includes(r);
    });
    const normal = pending.filter(
      (r) => !critical.includes(r) && !urgent.includes(r)
    );
    return {
      critical: critical.slice(0, 3),
      urgent: urgent.slice(0, 2),
      normal: normal.slice(0, 2),
      totalPending: pending.length
    };
  }, [reviews]);
  const getTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now2 = /* @__PURE__ */ new Date();
    const diffMs = now2.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1e3 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays > 0) return `${diffDays}g önce`;
    if (diffHours > 0) return `${diffHours}s önce`;
    return "Az önce";
  };
  const allPriorityReviews = useMemo(() => {
    const all = [
      ...priorityReviews.critical.map((r) => ({ ...r, priority: "critical" })),
      ...priorityReviews.urgent.map((r) => ({ ...r, priority: "urgent" })),
      ...priorityReviews.normal.map((r) => ({ ...r, priority: "normal" }))
    ];
    if (activeFilter === "all") return all;
    return all.filter((r) => r.priority === activeFilter);
  }, [priorityReviews, activeFilter]);
  const toggleFilter = (filter) => {
    setActiveFilter((prev) => prev === filter ? "all" : filter);
  };
  if (priorityReviews.totalPending === 0) {
    return /* @__PURE__ */ jsxs(Card, { className: "shadow-card", children: [
      /* @__PURE__ */ jsx(CardHeader, { className: "pb-3", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsx("div", { className: "p-2 rounded-lg bg-green-100", children: /* @__PURE__ */ jsx(CheckCircle, { className: "h-5 w-5 text-green-600" }) }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx(CardTitle, { className: "text-lg", children: "Öncelikli İşlemler" }),
          /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: "Tüm yorumlar yanıtlandı!" })
        ] })
      ] }) }),
      /* @__PURE__ */ jsx(CardContent, { children: /* @__PURE__ */ jsxs("div", { className: "text-center py-8", children: [
        /* @__PURE__ */ jsx(CheckCircle, { className: "w-12 h-12 text-green-500 mx-auto mb-3" }),
        /* @__PURE__ */ jsx("p", { className: "text-muted-foreground", children: "Harika! Bekleyen yorum yok." })
      ] }) })
    ] });
  }
  return /* @__PURE__ */ jsxs(Card, { className: "shadow-card", children: [
    /* @__PURE__ */ jsx(CardHeader, { className: "pb-3", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsx("div", { className: "p-2 rounded-lg bg-amber-100", children: /* @__PURE__ */ jsx(AlertTriangle, { className: "h-5 w-5 text-amber-600" }) }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx(CardTitle, { className: "text-lg", children: "Bugün Yanıtla" }),
          /* @__PURE__ */ jsxs("p", { className: "text-sm text-muted-foreground", children: [
            priorityReviews.totalPending,
            " yorum bekliyor"
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs(
        Button,
        {
          variant: "ghost",
          size: "sm",
          onClick: () => navigate("/reviews"),
          children: [
            "Tümünü Gör",
            /* @__PURE__ */ jsx(ArrowRight, { className: "w-4 h-4 ml-1" })
          ]
        }
      )
    ] }) }),
    /* @__PURE__ */ jsxs(CardContent, { className: "space-y-3", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex gap-2 flex-wrap", children: [
        priorityReviews.critical.length > 0 && /* @__PURE__ */ jsxs(
          Badge,
          {
            variant: "destructive",
            className: `gap-1 cursor-pointer transition-all ${activeFilter === "critical" ? "ring-2 ring-destructive ring-offset-2" : "opacity-80 hover:opacity-100"}`,
            onClick: () => toggleFilter("critical"),
            children: [
              /* @__PURE__ */ jsx(AlertTriangle, { className: "w-3 h-3" }),
              priorityReviews.critical.length,
              " Kritik"
            ]
          }
        ),
        priorityReviews.urgent.length > 0 && /* @__PURE__ */ jsxs(
          Badge,
          {
            className: `bg-amber-100 text-amber-800 gap-1 cursor-pointer transition-all ${activeFilter === "urgent" ? "ring-2 ring-amber-400 ring-offset-2" : "opacity-80 hover:opacity-100"}`,
            onClick: () => toggleFilter("urgent"),
            children: [
              /* @__PURE__ */ jsx(Clock, { className: "w-3 h-3" }),
              priorityReviews.urgent.length,
              " Acil"
            ]
          }
        ),
        priorityReviews.normal.length > 0 && /* @__PURE__ */ jsxs(
          Badge,
          {
            variant: "secondary",
            className: `gap-1 cursor-pointer transition-all ${activeFilter === "normal" ? "ring-2 ring-secondary ring-offset-2" : "opacity-80 hover:opacity-100"}`,
            onClick: () => toggleFilter("normal"),
            children: [
              /* @__PURE__ */ jsx(MessageSquare, { className: "w-3 h-3" }),
              priorityReviews.normal.length,
              " Normal"
            ]
          }
        )
      ] }),
      /* @__PURE__ */ jsx("div", { className: "space-y-2", children: allPriorityReviews.slice(0, 5).map((review) => /* @__PURE__ */ jsx(
        "button",
        {
          onClick: () => navigate(`/reviews/${review.id}`),
          className: "w-full p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors text-left",
          children: /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between gap-2", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mb-1", children: [
                /* @__PURE__ */ jsx("span", { className: "font-medium text-sm truncate", children: review.reviewer_name }),
                /* @__PURE__ */ jsx("div", { className: "flex items-center gap-0.5", children: Array.from({ length: review.rating }).map((_, i) => /* @__PURE__ */ jsx(
                  Star,
                  {
                    className: "w-3 h-3 fill-primary text-primary"
                  },
                  i
                )) })
              ] }),
              /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground line-clamp-1", children: review.text || "Yorum metni yok" })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 flex-shrink-0", children: [
              /* @__PURE__ */ jsx("span", { className: "text-xs text-muted-foreground", children: getTimeAgo(review.posted_at) }),
              review.priority === "critical" && /* @__PURE__ */ jsx("span", { className: "w-2 h-2 rounded-full bg-red-500" }),
              review.priority === "urgent" && /* @__PURE__ */ jsx("span", { className: "w-2 h-2 rounded-full bg-amber-500" })
            ] })
          ] })
        },
        review.id
      )) }),
      priorityReviews.totalPending > 5 && /* @__PURE__ */ jsxs("p", { className: "text-xs text-center text-muted-foreground pt-2", children: [
        "+",
        priorityReviews.totalPending - 5,
        " daha fazla yorum bekliyor"
      ] })
    ] })
  ] });
}
function CompetitorComparison() {
  const [competitorName, setCompetitorName] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const handleCompare = async () => {
    var _a, _b, _c, _d, _e;
    if (!competitorName.trim()) {
      toast.error("Lütfen rakip işletme adı girin");
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      const { data, error } = await supabase.functions.invoke("ai-visibility-demo", {
        body: {
          businessName: competitorName.trim(),
          location: "",
          isCompetitorCheck: true
        }
      });
      if (error) throw error;
      const yourBusinessData = {
        name: "Sizin İşletmeniz",
        visibilityScore: 72,
        rating: 4.3,
        reviewCount: 156,
        responseRate: 87
      };
      const competitorData = {
        name: competitorName.trim(),
        visibilityScore: ((_a = data == null ? void 0 : data.analysis) == null ? void 0 : _a.visibilityScore) || Math.floor(Math.random() * 40) + 50,
        rating: ((_c = (_b = data == null ? void 0 : data.analysis) == null ? void 0 : _b.customerSentiment) == null ? void 0 : _c.overallRating) || (Math.random() * 1.5 + 3.5).toFixed(1),
        reviewCount: ((_e = (_d = data == null ? void 0 : data.analysis) == null ? void 0 : _d.customerSentiment) == null ? void 0 : _e.totalReviews) || Math.floor(Math.random() * 200) + 50,
        responseRate: Math.floor(Math.random() * 40) + 50
      };
      const insights = [];
      if (yourBusinessData.visibilityScore > competitorData.visibilityScore) {
        insights.push(`AI görünürlüğünüz rakibinizden ${yourBusinessData.visibilityScore - competitorData.visibilityScore} puan daha yüksek!`);
      } else {
        insights.push(`Rakibiniz AI'da sizden ${competitorData.visibilityScore - yourBusinessData.visibilityScore} puan daha görünür.`);
      }
      if (yourBusinessData.rating > Number(competitorData.rating)) {
        insights.push("Müşteri puanınız rakibinizden daha yüksek - bunu vurgulayın!");
      }
      if (yourBusinessData.responseRate > competitorData.responseRate) {
        insights.push("Yanıt oranınız çok iyi! Bu AI görünürlüğünüzü artırıyor.");
      } else {
        insights.push("Yanıt oranınızı artırarak AI sıralamalarınızı yükseltebilirsiniz.");
      }
      setResult({
        yourBusiness: yourBusinessData,
        competitor: { ...competitorData, rating: Number(competitorData.rating) },
        insights
      });
    } catch (error) {
      console.error("Comparison error:", error);
      toast.error("Karşılaştırma yapılırken bir hata oluştu");
    } finally {
      setLoading(false);
    }
  };
  const getComparisonIcon = (yours, theirs) => {
    if (yours > theirs) return /* @__PURE__ */ jsx(TrendingUp, { className: "w-4 h-4 text-green-600" });
    if (yours < theirs) return /* @__PURE__ */ jsx(TrendingDown, { className: "w-4 h-4 text-red-600" });
    return /* @__PURE__ */ jsx(Minus, { className: "w-4 h-4 text-muted-foreground" });
  };
  const getComparisonColor = (yours, theirs) => {
    if (yours > theirs) return "text-green-600";
    if (yours < theirs) return "text-red-600";
    return "text-muted-foreground";
  };
  return /* @__PURE__ */ jsxs(Card, { className: "shadow-card", children: [
    /* @__PURE__ */ jsx(CardHeader, { className: "pb-3", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
      /* @__PURE__ */ jsx("div", { className: "p-2 rounded-lg bg-blue-100", children: /* @__PURE__ */ jsx(Users, { className: "h-5 w-5 text-blue-600" }) }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx(CardTitle, { className: "text-lg", children: "Rakip Karşılaştırması" }),
        /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: "AI görünürlüğünüzü rakiplerle karşılaştırın" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxs(CardContent, { className: "space-y-4", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
        /* @__PURE__ */ jsx(
          Input,
          {
            value: competitorName,
            onChange: (e) => setCompetitorName(e.target.value),
            placeholder: "Rakip işletme adı...",
            onKeyDown: (e) => e.key === "Enter" && handleCompare(),
            disabled: loading
          }
        ),
        /* @__PURE__ */ jsx(
          Button,
          {
            onClick: handleCompare,
            disabled: loading || !competitorName.trim(),
            size: "icon",
            children: loading ? /* @__PURE__ */ jsx(Loader2, { className: "w-4 h-4 animate-spin" }) : /* @__PURE__ */ jsx(Search, { className: "w-4 h-4" })
          }
        )
      ] }),
      result && /* @__PURE__ */ jsxs("div", { className: "space-y-4 animate-fade-in", children: [
        /* @__PURE__ */ jsxs("div", { className: "rounded-lg border overflow-hidden", children: [
          /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-3 bg-muted/50 px-4 py-2 text-sm font-medium", children: [
            /* @__PURE__ */ jsx("div", { children: "Metrik" }),
            /* @__PURE__ */ jsx("div", { className: "text-center", children: "Siz" }),
            /* @__PURE__ */ jsx("div", { className: "text-center", children: result.competitor.name })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-3 px-4 py-3 border-t items-center", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-sm", children: [
              /* @__PURE__ */ jsx(Eye, { className: "w-4 h-4 text-muted-foreground" }),
              "AI Skoru"
            ] }),
            /* @__PURE__ */ jsx("div", { className: `text-center font-semibold ${getComparisonColor(result.yourBusiness.visibilityScore, result.competitor.visibilityScore)}`, children: /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-center gap-1", children: [
              result.yourBusiness.visibilityScore,
              getComparisonIcon(result.yourBusiness.visibilityScore, result.competitor.visibilityScore)
            ] }) }),
            /* @__PURE__ */ jsx("div", { className: "text-center font-semibold text-muted-foreground", children: result.competitor.visibilityScore })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-3 px-4 py-3 border-t items-center", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-sm", children: [
              /* @__PURE__ */ jsx(Star, { className: "w-4 h-4 text-muted-foreground" }),
              "Puan"
            ] }),
            /* @__PURE__ */ jsx("div", { className: `text-center font-semibold ${getComparisonColor(result.yourBusiness.rating, result.competitor.rating)}`, children: /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-center gap-1", children: [
              result.yourBusiness.rating,
              getComparisonIcon(result.yourBusiness.rating, result.competitor.rating)
            ] }) }),
            /* @__PURE__ */ jsx("div", { className: "text-center font-semibold text-muted-foreground", children: result.competitor.rating })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-3 px-4 py-3 border-t items-center", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-sm", children: [
              /* @__PURE__ */ jsx(MessageSquare, { className: "w-4 h-4 text-muted-foreground" }),
              "Yorum"
            ] }),
            /* @__PURE__ */ jsx("div", { className: `text-center font-semibold ${getComparisonColor(result.yourBusiness.reviewCount, result.competitor.reviewCount)}`, children: /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-center gap-1", children: [
              result.yourBusiness.reviewCount,
              getComparisonIcon(result.yourBusiness.reviewCount, result.competitor.reviewCount)
            ] }) }),
            /* @__PURE__ */ jsx("div", { className: "text-center font-semibold text-muted-foreground", children: result.competitor.reviewCount })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-3 px-4 py-3 border-t items-center", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-sm", children: [
              /* @__PURE__ */ jsx(TrendingUp, { className: "w-4 h-4 text-muted-foreground" }),
              "Yanıt %"
            ] }),
            /* @__PURE__ */ jsx("div", { className: `text-center font-semibold ${getComparisonColor(result.yourBusiness.responseRate, result.competitor.responseRate)}`, children: /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-center gap-1", children: [
              "%",
              result.yourBusiness.responseRate,
              getComparisonIcon(result.yourBusiness.responseRate, result.competitor.responseRate)
            ] }) }),
            /* @__PURE__ */ jsxs("div", { className: "text-center font-semibold text-muted-foreground", children: [
              "%",
              result.competitor.responseRate
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsx("p", { className: "text-sm font-medium", children: "AI Önerileri:" }),
          result.insights.map((insight, i) => /* @__PURE__ */ jsxs(
            "div",
            {
              className: "flex items-start gap-2 p-3 rounded-lg bg-muted/50 text-sm",
              children: [
                /* @__PURE__ */ jsx("span", { className: "text-primary", children: "💡" }),
                /* @__PURE__ */ jsx("span", { children: insight })
              ]
            },
            i
          ))
        ] })
      ] }),
      !result && !loading && /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground text-center py-4", children: "Rakip işletme adı girerek AI görünürlük karşılaştırması yapın" })
    ] })
  ] });
}
function DemoModeBanner({ onDismiss }) {
  const navigate = useNavigate();
  const { t } = useTranslation();
  return /* @__PURE__ */ jsx("div", { className: "relative rounded-xl border border-primary/20 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 p-6", children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col md:flex-row items-start md:items-center justify-between gap-4", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
      /* @__PURE__ */ jsx("div", { className: "p-2 rounded-lg bg-primary/10", children: /* @__PURE__ */ jsx(Sparkles, { className: "h-5 w-5 text-primary" }) }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h3", { className: "font-semibold text-foreground", children: t("dashboard.demo.bannerTitle", "Demo Modu Aktif") }),
        /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: t("dashboard.demo.bannerSubtitle", "Örnek verilerle platformu keşfediyorsunuz. Gerçek verilerinizi görmek için hesabınızı bağlayın.") })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
      /* @__PURE__ */ jsxs(
        Button,
        {
          onClick: () => navigate("/settings?tab=google"),
          className: "gradient-primary text-white",
          children: [
            t("dashboard.demo.connectCta", "Google Business Bağla"),
            /* @__PURE__ */ jsx(ArrowRight, { className: "w-4 h-4 ml-2" })
          ]
        }
      ),
      onDismiss && /* @__PURE__ */ jsx(Button, { variant: "ghost", size: "icon", onClick: onDismiss, className: "shrink-0", children: /* @__PURE__ */ jsx(X, { className: "w-4 h-4" }) })
    ] })
  ] }) });
}
function AllBusinessesView() {
  const { businesses, setActiveBusiness } = useBusiness();
  const navigate = useNavigate();
  const businessIds = useMemo(() => businesses.map((b) => b.id), [businesses]);
  const { data: reviews = [], isLoading } = useQuery({
    queryKey: ["all-businesses-reviews", businessIds.join(",")],
    queryFn: async () => {
      if (businessIds.length === 0) return [];
      const pageSize = 1e3;
      let from = 0;
      const all = [];
      while (true) {
        const { data, error } = await supabase.from("reviews").select("id,business_id,rating,status,approved_reply,posted_at,platform").in("business_id", businessIds).order("posted_at", { ascending: false }).range(from, from + pageSize - 1);
        if (error) throw error;
        if (!data || data.length === 0) break;
        all.push(...data);
        if (data.length < pageSize) break;
        from += pageSize;
      }
      return all;
    },
    enabled: businessIds.length > 0
  });
  const { totals, perBusiness } = useMemo(() => {
    const map = /* @__PURE__ */ new Map();
    businesses.forEach((b) => map.set(b.id, { count: 0, sum: 0, pending: 0 }));
    let totalCount = 0;
    let totalSum = 0;
    let totalPending = 0;
    reviews.forEach((r) => {
      const m = map.get(r.business_id);
      if (!m) return;
      const r5 = normalizeRatingTo5(r.rating, r.platform);
      m.count += 1;
      m.sum += r5;
      const isPending = !r.approved_reply && r.status !== "replied";
      if (isPending) m.pending += 1;
      totalCount += 1;
      totalSum += r5;
      if (isPending) totalPending += 1;
    });
    const avg = totalCount > 0 ? totalSum / totalCount : 0;
    return {
      totals: {
        avg: avg.toFixed(1),
        count: totalCount,
        pending: totalPending,
        businesses: businesses.length
      },
      perBusiness: businesses.map((b) => {
        const m = map.get(b.id);
        return {
          ...b,
          count: m.count,
          avg: m.count > 0 ? m.sum / m.count : 0,
          pending: m.pending
        };
      }).sort((a, b) => b.count - a.count)
    };
  }, [reviews, businesses]);
  const summaryCards = [
    { title: "Toplam İşletme", value: totals.businesses.toString(), icon: Building2, subtitle: "tüm oteller" },
    { title: "Ortalama Puan", value: totals.avg, icon: Star, subtitle: "ağırlıklı ortalama" },
    { title: "Toplam Yorum", value: totals.count.toLocaleString(), icon: MessageSquare, subtitle: "tüm zamanlar" },
    { title: "Bekleyen Yanıt", value: totals.pending.toLocaleString(), icon: AlertCircle, subtitle: "tüm otellerde" }
  ];
  if (isLoading) {
    return /* @__PURE__ */ jsx("div", { className: "flex items-center justify-center p-16", children: /* @__PURE__ */ jsx("div", { className: "animate-spin rounded-full h-8 w-8 border-b-2 border-primary" }) });
  }
  return /* @__PURE__ */ jsxs("div", { className: "space-y-8", children: [
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx("h1", { className: "text-3xl font-semibold text-foreground", children: "Tüm Oteller" }),
      /* @__PURE__ */ jsxs("p", { className: "text-muted-foreground mt-1", children: [
        totals.businesses,
        " otelin birleşik özeti"
      ] })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6", children: summaryCards.map((c) => /* @__PURE__ */ jsxs(Card, { className: "shadow-card", children: [
      /* @__PURE__ */ jsx(CardHeader, { className: "pb-3", children: /* @__PURE__ */ jsx(CardTitle, { className: "text-sm font-medium text-muted-foreground", children: c.title }) }),
      /* @__PURE__ */ jsxs(CardContent, { className: "space-y-2", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsx(c.icon, { className: "h-5 w-5 text-primary" }),
          /* @__PURE__ */ jsx("div", { className: "text-2xl sm:text-3xl font-bold text-foreground", children: c.value })
        ] }),
        /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: c.subtitle })
      ] })
    ] }, c.title)) }),
    /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ jsx("h2", { className: "text-lg font-semibold text-foreground", children: "Otellere Göre Özet" }),
        /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: "Bir otele tıkla → o otelin Dashboard'ı" })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-3", children: perBusiness.map((b) => /* @__PURE__ */ jsxs(
        "button",
        {
          onClick: () => {
            setActiveBusiness(b);
            navigate("/");
          },
          className: "text-left bg-card border border-border rounded-lg p-4 hover:border-primary/40 hover:shadow-md transition-all group",
          children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between gap-3 mb-3", children: [
              /* @__PURE__ */ jsxs("div", { className: "min-w-0 flex-1", children: [
                /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 flex-wrap mb-1", children: [
                  /* @__PURE__ */ jsx("h3", { className: "font-semibold text-foreground truncate", children: b.name }),
                  b.count === 0 && /* @__PURE__ */ jsx(Badge, { variant: "outline", className: "text-xs bg-amber-50 text-amber-700 border-amber-200", children: "Kurulum gerekli" })
                ] }),
                b.city && /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: b.city })
              ] }),
              /* @__PURE__ */ jsx(ArrowRight, { className: "h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all shrink-0 mt-1" })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-3 gap-2 pt-3 border-t border-border", children: [
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1", children: [
                  /* @__PURE__ */ jsx(Star, { className: "h-3.5 w-3.5 fill-amber-400 text-amber-400" }),
                  /* @__PURE__ */ jsx("span", { className: "font-semibold text-sm text-foreground", children: b.count > 0 ? b.avg.toFixed(1) : "—" })
                ] }),
                /* @__PURE__ */ jsx("p", { className: "text-[10px] text-muted-foreground mt-0.5", children: "Puan" })
              ] }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("span", { className: "font-semibold text-sm text-foreground", children: b.count.toLocaleString() }),
                /* @__PURE__ */ jsx("p", { className: "text-[10px] text-muted-foreground mt-0.5", children: "Yorum" })
              ] }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("span", { className: `font-semibold text-sm ${b.pending > 0 ? "text-amber-700" : "text-foreground"}`, children: b.pending.toLocaleString() }),
                /* @__PURE__ */ jsx("p", { className: "text-[10px] text-muted-foreground mt-0.5", children: "Bekleyen" })
              ] })
            ] })
          ]
        },
        b.id
      )) })
    ] })
  ] });
}
function UpgradeCTA({ feature, compact = false }) {
  const navigate = useNavigate();
  const { t } = useTranslation();
  if (compact) {
    return /* @__PURE__ */ jsxs(
      "button",
      {
        onClick: () => navigate("/#pricing"),
        className: "flex items-center gap-2 px-3 py-1.5 rounded-md bg-primary/10 border border-primary/20 text-primary text-xs font-medium hover:bg-primary/20 transition-colors",
        children: [
          /* @__PURE__ */ jsx(Lock, { className: "w-3 h-3" }),
          t("dashboard.demo.upgradePro", "Pro'ya Geç")
        ]
      }
    );
  }
  return /* @__PURE__ */ jsxs("div", { className: "mt-4 p-4 rounded-lg border border-dashed border-primary/30 bg-primary/5 text-center", children: [
    /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground mb-2", children: t("dashboard.demo.upgradeText", "{{feature}} gerçek verilerle kullanmak için Pro'ya geçin", { feature }) }),
    /* @__PURE__ */ jsxs(
      Button,
      {
        size: "sm",
        onClick: () => navigate("/#pricing"),
        className: "gradient-primary text-white",
        children: [
          t("dashboard.demo.upgradeButton", "Pro Planı Keşfet"),
          /* @__PURE__ */ jsx(ArrowRight, { className: "w-3 h-3 ml-1" })
        ]
      }
    )
  ] });
}
const now = /* @__PURE__ */ new Date();
startOfWeek(now, { weekStartsOn: 1 });
const DEMO_REVIEWS = [
  {
    id: "demo-1",
    business_id: "demo",
    reviewer_name: "Ahmet Y.",
    rating: 1,
    text: "Berbat deneyim. Siparişim 2 saat geç geldi ve yemekler soğuktu. Bir daha asla gelmeyeceğim.",
    posted_at: (/* @__PURE__ */ new Date()).toISOString(),
    status: "pending_reply",
    sentiment: "negative",
    summary: null,
    suggested_reply: null,
    approved_reply: null,
    replied_at: null,
    reply_source: null,
    google_review_id: null,
    google_review_name: null,
    google_reply_status: null,
    google_reply_error_message: null,
    issues: null,
    praises: null,
    created_at: (/* @__PURE__ */ new Date()).toISOString()
  },
  {
    id: "demo-2",
    business_id: "demo",
    reviewer_name: "Zeynep K.",
    rating: 2,
    text: "Beklentilerimi karşılamadı. Personel ilgisizdi ve fiyatlar çok yüksek.",
    posted_at: (/* @__PURE__ */ new Date()).toISOString(),
    status: "pending_reply",
    sentiment: "negative",
    summary: null,
    suggested_reply: null,
    approved_reply: null,
    replied_at: null,
    reply_source: null,
    google_review_id: null,
    google_review_name: null,
    google_reply_status: null,
    google_reply_error_message: null,
    issues: null,
    praises: null,
    created_at: (/* @__PURE__ */ new Date()).toISOString()
  },
  {
    id: "demo-3",
    business_id: "demo",
    reviewer_name: "Mehmet S.",
    rating: 3,
    text: "Ortalama bir deneyim. Fiyat/performans uyumlu değil ama mekan güzel.",
    posted_at: addDays(now, -1).toISOString(),
    status: "pending_reply",
    sentiment: "neutral",
    summary: null,
    suggested_reply: null,
    approved_reply: null,
    replied_at: null,
    reply_source: null,
    google_review_id: null,
    google_review_name: null,
    google_reply_status: null,
    google_reply_error_message: null,
    issues: null,
    praises: null,
    created_at: addDays(now, -1).toISOString()
  },
  {
    id: "demo-4",
    business_id: "demo",
    reviewer_name: "Elif D.",
    rating: 4,
    text: "Genel olarak memnun kaldım, sadece servis biraz yavaştı. Yemekler lezzetliydi.",
    posted_at: addDays(now, -2).toISOString(),
    status: "pending_reply",
    sentiment: "positive",
    summary: null,
    suggested_reply: null,
    approved_reply: null,
    replied_at: null,
    reply_source: null,
    google_review_id: null,
    google_review_name: null,
    google_reply_status: null,
    google_reply_error_message: null,
    issues: null,
    praises: null,
    created_at: addDays(now, -2).toISOString()
  },
  {
    id: "demo-5",
    business_id: "demo",
    reviewer_name: "Can B.",
    rating: 5,
    text: "Harika! Hem yemekler hem servis mükemmeldi. Kesinlikle tekrar geleceğim.",
    posted_at: addDays(now, -3).toISOString(),
    status: "replied",
    sentiment: "positive",
    summary: null,
    suggested_reply: "Teşekkür ederiz Can Bey! Sizi tekrar ağırlamayı dört gözle bekliyoruz.",
    approved_reply: "Teşekkür ederiz Can Bey! Sizi tekrar ağırlamayı dört gözle bekliyoruz.",
    replied_at: addDays(now, -3).toISOString(),
    reply_source: "ai",
    google_review_id: null,
    google_review_name: null,
    google_reply_status: null,
    google_reply_error_message: null,
    issues: null,
    praises: null,
    created_at: addDays(now, -3).toISOString()
  },
  {
    id: "demo-6",
    business_id: "demo",
    reviewer_name: "Selin T.",
    rating: 5,
    text: "Muhteşem atmosfer ve lezzetler. Arkadaşlarıma da tavsiye ettim!",
    posted_at: addDays(now, -4).toISOString(),
    status: "replied",
    sentiment: "positive",
    summary: null,
    suggested_reply: null,
    approved_reply: null,
    replied_at: null,
    reply_source: null,
    google_review_id: null,
    google_review_name: null,
    google_reply_status: null,
    google_reply_error_message: null,
    issues: null,
    praises: null,
    created_at: addDays(now, -4).toISOString()
  },
  {
    id: "demo-7",
    business_id: "demo",
    reviewer_name: "Burak A.",
    rating: 4,
    text: "Güzel mekan, kahveleri harika. Tatlıları daha iyi olabilir.",
    posted_at: addDays(now, -5).toISOString(),
    status: "replied",
    sentiment: "positive",
    summary: null,
    suggested_reply: null,
    approved_reply: null,
    replied_at: null,
    reply_source: null,
    google_review_id: null,
    google_review_name: null,
    google_reply_status: null,
    google_reply_error_message: null,
    issues: null,
    praises: null,
    created_at: addDays(now, -5).toISOString()
  }
];
const DEMO_METRICS = {
  avgRating: "4.1",
  totalReviews: 156,
  reviewsThisWeek: 12,
  pendingReplies: 4
};
function SetupWizard({ onDismiss, onComplete }) {
  const { activeBusiness } = useBusiness();
  const navigate = useNavigate();
  const hasReviewPlatform = !!((activeBusiness == null ? void 0 : activeBusiness.google_connected) || (activeBusiness == null ? void 0 : activeBusiness.booking_hotel_id) || (activeBusiness == null ? void 0 : activeBusiness.tripadvisor_id) || (activeBusiness == null ? void 0 : activeBusiness.trustpilot_url) || (activeBusiness == null ? void 0 : activeBusiness.hotelscom_url));
  const steps = [
    { num: 1, label: "Hesap Oluştur", done: true },
    { num: 2, label: "Platform Bağla", done: hasReviewPlatform },
    { num: 3, label: "Yorumları Yönet", done: false }
  ];
  return /* @__PURE__ */ jsxs(Card, { className: "border-primary/20 bg-gradient-to-r from-primary/5 to-transparent shadow-card relative", children: [
    /* @__PURE__ */ jsx(
      Button,
      {
        variant: "ghost",
        size: "icon",
        className: "absolute right-2 top-2 h-8 w-8",
        onClick: onDismiss,
        children: /* @__PURE__ */ jsx(X, { className: "h-4 w-4" })
      }
    ),
    /* @__PURE__ */ jsxs(CardContent, { className: "p-6", children: [
      /* @__PURE__ */ jsx("h3", { className: "text-lg font-semibold text-foreground mb-1", children: "Hoş Geldiniz! 👋" }),
      /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground mb-6", children: "3 adımda yorumlarınızı yönetmeye başlayın" }),
      /* @__PURE__ */ jsx("div", { className: "flex items-center gap-2 mb-6", children: steps.map((s, i) => /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxs("div", { className: `flex items-center gap-2 px-3 py-1.5 rounded-full text-sm ${s.done ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`, children: [
          s.done ? /* @__PURE__ */ jsx(CheckCircle2, { className: "h-4 w-4" }) : /* @__PURE__ */ jsx(Circle, { className: "h-4 w-4" }),
          s.label
        ] }),
        i < steps.length - 1 && /* @__PURE__ */ jsx("div", { className: "w-8 h-px bg-border" })
      ] }, s.num)) }),
      !hasReviewPlatform ? /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: "Sidebar'dan bir yorum platformu seçerek (Google, Booking, TripAdvisor vb.) bağlantı kurabilirsiniz." }),
        /* @__PURE__ */ jsx(Button, { variant: "outline", size: "sm", onClick: () => navigate("/reviews?platform=booking"), children: "Platformları Gör" })
      ] }) : /* @__PURE__ */ jsx("p", { className: "text-sm text-primary font-medium", children: "✅ Platform bağlı! Sidebar'dan yorumlarınızı yönetmeye başlayın." })
    ] })
  ] });
}
const platformIcons = {
  tripadvisor: /* @__PURE__ */ jsx(Map$1, { className: "h-5 w-5 text-green-600" }),
  booking: /* @__PURE__ */ jsx(Hotel, { className: "h-5 w-5 text-blue-700" }),
  trustpilot: /* @__PURE__ */ jsx(Star, { className: "h-5 w-5 text-emerald-500" }),
  hotelscom: /* @__PURE__ */ jsx(Building2, { className: "h-5 w-5 text-red-600" }),
  expedia: /* @__PURE__ */ jsx(Building2, { className: "h-5 w-5 text-yellow-600" }),
  tripcom: /* @__PURE__ */ jsx(Building2, { className: "h-5 w-5 text-orange-600" })
};
const platformBadgeStyles = {
  tripadvisor: "bg-green-100 text-green-700 border-green-200",
  booking: "bg-blue-100 text-blue-700 border-blue-200",
  trustpilot: "bg-emerald-100 text-emerald-700 border-emerald-200",
  hotelscom: "bg-red-100 text-red-700 border-red-200",
  expedia: "bg-yellow-100 text-yellow-700 border-yellow-200",
  tripcom: "bg-orange-100 text-orange-700 border-orange-200"
};
const platformDisplayName = {
  tripadvisor: "TripAdvisor",
  booking: "Booking.com",
  trustpilot: "Trustpilot",
  hotelscom: "Hotels.com",
  expedia: "Expedia",
  tripcom: "Trip.com"
};
const platformDbField = {
  tripadvisor: "tripadvisor_id",
  booking: "booking_hotel_id",
  trustpilot: "trustpilot_url",
  hotelscom: "hotelscom_url",
  expedia: "expedia_hotel_id",
  tripcom: "tripcom_hotel_id"
};
function PlatformDiscovery() {
  const { activeBusiness, refetchBusinesses } = useBusiness();
  const { startFetch } = useReviewFetch();
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [searched, setSearched] = useState(false);
  const [confirming, setConfirming] = useState(null);
  const [dismissed, setDismissed] = useState([]);
  const [connectedUrls, setConnectedUrls] = useState([]);
  const handleDiscover = async () => {
    if (!activeBusiness) return;
    setLoading(true);
    setResults([]);
    setDismissed([]);
    try {
      const { data, error } = await supabase.functions.invoke("discover-platforms", {
        body: {
          business_name: activeBusiness.name,
          city: activeBusiness.city || void 0
        }
      });
      if (error) throw error;
      const connected = {
        tripadvisor: activeBusiness.tripadvisor_id,
        booking: activeBusiness.booking_hotel_id,
        trustpilot: activeBusiness.trustpilot_url,
        hotelscom: activeBusiness.hotelscom_url,
        expedia: activeBusiness.expedia_hotel_id,
        tripcom: activeBusiness.tripcom_hotel_id
      };
      const filtered = (data.results || []).filter(
        (r) => !connected[r.platform]
      );
      setResults(filtered);
      setSearched(true);
      if (filtered.length === 0) {
        toast$1({
          title: "Sonuç bulunamadı",
          description: "Yeni platform profili bulunamadı veya tümü zaten bağlı."
        });
      }
    } catch (err) {
      toast$1({
        title: "Arama hatası",
        description: err.message || "Platform araması başarısız oldu.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  const handleConfirm = async (result) => {
    if (!activeBusiness) return;
    setConfirming(result.url);
    try {
      const field = platformDbField[result.platform];
      if (!field) throw new Error("Bilinmeyen platform");
      const sanitizedUrl = result.url ? result.url.split("?")[0].split("#")[0] : null;
      const valueToStore = result.platform === "tripadvisor" || result.platform === "expedia" ? sanitizedUrl || result.extractedId : result.extractedId;
      if (!valueToStore) throw new Error("Geçerli platform kimliği bulunamadı");
      const { error } = await supabase.from("businesses").update({ [field]: valueToStore }).eq("id", activeBusiness.id);
      if (error) throw error;
      await refetchBusinesses();
      toast$1({
        title: `${result.platformLabel} bağlandı!`,
        description: "İlk senkronizasyon başlatılıyor."
      });
      setConnectedUrls((prev) => [...prev, result.url]);
      try {
        const functionName = result.platform === "tripadvisor" ? "tripadvisor-fetch-reviews" : "apify-fetch-reviews";
        const fetchResult = await startFetch({
          businessId: activeBusiness.id,
          businessName: activeBusiness.name,
          platform: result.platform,
          functionName
        });
        if ((fetchResult == null ? void 0 : fetchResult.status) === "started") {
          toast$1({
            title: "Yorumlar çekiliyor",
            description: `${result.platformLabel} yorumları arka planda çekiliyor...`
          });
        } else if (fetchResult == null ? void 0 : fetchResult.success) {
          toast$1({
            title: "Yorumlar çekildi",
            description: `${fetchResult.inserted ?? 0} yeni yorum eklendi.`
          });
        }
      } catch {
      }
    } catch (err) {
      toast$1({
        title: "Hata",
        description: err.message || "Platform bağlanamadı.",
        variant: "destructive"
      });
    } finally {
      setConfirming(null);
    }
  };
  const handleDismiss = (url) => {
    setDismissed((prev) => [...prev, url]);
  };
  const visibleResults = results.filter((r) => !dismissed.includes(r.url));
  if (!activeBusiness) return null;
  const allConnected = !!(activeBusiness.tripadvisor_id && activeBusiness.booking_hotel_id && activeBusiness.trustpilot_url && activeBusiness.hotelscom_url && activeBusiness.expedia_hotel_id);
  if (allConnected && !searched) return null;
  return /* @__PURE__ */ jsxs(Card, { className: "border-primary/20 bg-gradient-to-r from-primary/5 to-transparent shadow-card", children: [
    /* @__PURE__ */ jsx(CardHeader, { className: "pb-3", children: /* @__PURE__ */ jsxs(CardTitle, { className: "text-base flex items-center gap-2", children: [
      /* @__PURE__ */ jsx(Sparkles, { className: "h-5 w-5 text-primary" }),
      "Platform Keşfi"
    ] }) }),
    /* @__PURE__ */ jsx(CardContent, { className: "space-y-4", children: !searched ? /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
      /* @__PURE__ */ jsxs("p", { className: "text-sm text-muted-foreground", children: [
        /* @__PURE__ */ jsx("strong", { children: activeBusiness.name }),
        " için TripAdvisor, Booking.com, Trustpilot ve Hotels.com profillerini otomatik bulalım."
      ] }),
      /* @__PURE__ */ jsx(Button, { onClick: handleDiscover, disabled: loading, className: "w-full", children: loading ? /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsx(Loader2, { className: "mr-2 h-4 w-4 animate-spin" }),
        "Aranıyor..."
      ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsx(Search, { className: "mr-2 h-4 w-4" }),
        "Platformları Keşfet"
      ] }) })
    ] }) : visibleResults.length === 0 ? /* @__PURE__ */ jsxs("div", { className: "text-center py-2", children: [
      /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: "Tüm profiller bağlı veya yeni profil bulunamadı." }),
      /* @__PURE__ */ jsx(Button, { variant: "ghost", size: "sm", onClick: handleDiscover, className: "mt-2", children: "Tekrar Ara" })
    ] }) : /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
      visibleResults.map((result) => {
        const isConnected = connectedUrls.includes(result.url);
        return /* @__PURE__ */ jsxs(
          "div",
          {
            className: `flex items-start gap-3 p-3 rounded-lg border ${isConnected ? "bg-emerald-50 border-emerald-200" : "bg-background"}`,
            children: [
              /* @__PURE__ */ jsx("span", { className: "mt-0.5", children: platformIcons[result.platform] || /* @__PURE__ */ jsx(Building2, { className: "h-5 w-5" }) }),
              /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
                /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center gap-2 mb-1", children: [
                  /* @__PURE__ */ jsx(
                    Badge,
                    {
                      variant: "outline",
                      className: `text-[10px] px-1.5 py-0 font-semibold ${platformBadgeStyles[result.platform] || ""}`,
                      children: platformDisplayName[result.platform] || result.platform
                    }
                  ),
                  /* @__PURE__ */ jsx("span", { className: "font-medium text-sm truncate", children: result.title }),
                  isConnected ? /* @__PURE__ */ jsx(Badge, { className: "text-[10px] px-1.5 py-0 bg-emerald-600 hover:bg-emerald-600", children: "Bağlandı ✓" }) : /* @__PURE__ */ jsx(
                    Badge,
                    {
                      variant: result.confidence === "high" ? "default" : "secondary",
                      className: "text-[10px] px-1.5 py-0",
                      children: result.confidence === "high" ? "Eşleşme ✓" : result.confidence === "medium" ? "Olası" : "Düşük"
                    }
                  )
                ] }),
                /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground truncate", children: result.description || result.url }),
                result.extractedId && /* @__PURE__ */ jsxs("p", { className: "text-xs text-muted-foreground mt-1", children: [
                  "ID: ",
                  /* @__PURE__ */ jsx("code", { className: "bg-muted px-1 rounded", children: result.extractedId })
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1 shrink-0", children: [
                /* @__PURE__ */ jsx(
                  Button,
                  {
                    variant: "ghost",
                    size: "icon",
                    className: "h-8 w-8",
                    onClick: () => window.open(result.url, "_blank"),
                    title: "Sayfayı aç",
                    children: /* @__PURE__ */ jsx(ExternalLink, { className: "h-4 w-4" })
                  }
                ),
                !isConnected && /* @__PURE__ */ jsxs(Fragment, { children: [
                  /* @__PURE__ */ jsx(
                    Button,
                    {
                      variant: "ghost",
                      size: "icon",
                      className: "h-8 w-8 text-destructive",
                      onClick: () => handleDismiss(result.url),
                      title: "Reddet",
                      children: /* @__PURE__ */ jsx(X, { className: "h-4 w-4" })
                    }
                  ),
                  (result.extractedId || result.platform === "tripadvisor" && result.url) && /* @__PURE__ */ jsx(
                    Button,
                    {
                      size: "icon",
                      className: "h-8 w-8",
                      onClick: () => handleConfirm(result),
                      disabled: confirming === result.url,
                      title: "Onayla ve bağla",
                      children: confirming === result.url ? /* @__PURE__ */ jsx(Loader2, { className: "h-4 w-4 animate-spin" }) : /* @__PURE__ */ jsx(Check, { className: "h-4 w-4" })
                    }
                  )
                ] })
              ] })
            ]
          },
          result.url
        );
      }),
      /* @__PURE__ */ jsx(Button, { variant: "ghost", size: "sm", onClick: handleDiscover, disabled: loading, children: loading ? "Aranıyor..." : "Tekrar Ara" })
    ] }) })
  ] });
}
function RepScoreWidget({ score }) {
  const navigate = useNavigate();
  const radius = 58;
  const circumference = 2 * Math.PI * radius;
  const progress = score.totalScore / 1e3;
  const strokeDashoffset = circumference * (1 - progress);
  const sortedComponents = Object.entries(score.breakdown).map(([key, value]) => ({
    key,
    value,
    ...COMPONENT_INFO[key],
    percentage: Math.round(value / COMPONENT_INFO[key].maxScore * 100)
  })).sort((a, b) => a.percentage - b.percentage);
  const weakest = sortedComponents.slice(0, 2);
  return /* @__PURE__ */ jsxs(Card, { className: "shadow-card hover:shadow-md transition-all", children: [
    /* @__PURE__ */ jsx(CardHeader, { className: "pb-3 border-b", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsx("div", { className: "p-2 rounded-lg bg-primary/10", children: /* @__PURE__ */ jsx(Trophy, { className: "h-5 w-5 text-primary" }) }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx(CardTitle, { className: "text-lg", children: "Rep Score" }),
          /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: "İtibar Puanınız" })
        ] })
      ] }),
      /* @__PURE__ */ jsx(
        Badge,
        {
          className: "text-sm font-bold px-3 py-1 border-0",
          style: { backgroundColor: score.gradeColor + "20", color: score.gradeColor },
          children: score.grade
        }
      )
    ] }) }),
    /* @__PURE__ */ jsx(CardContent, { className: "pt-6", children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center gap-4", children: [
      /* @__PURE__ */ jsxs("div", { className: "relative", children: [
        /* @__PURE__ */ jsxs("svg", { width: "140", height: "140", viewBox: "0 0 140 140", children: [
          /* @__PURE__ */ jsx(
            "circle",
            {
              cx: "70",
              cy: "70",
              r: radius,
              fill: "none",
              stroke: "hsl(var(--muted))",
              strokeWidth: "10",
              strokeLinecap: "round"
            }
          ),
          /* @__PURE__ */ jsx(
            "circle",
            {
              cx: "70",
              cy: "70",
              r: radius,
              fill: "none",
              stroke: score.gradeColor,
              strokeWidth: "10",
              strokeLinecap: "round",
              strokeDasharray: circumference,
              strokeDashoffset,
              transform: "rotate(-90 70 70)",
              className: "transition-all duration-1000 ease-out"
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "absolute inset-0 flex flex-col items-center justify-center", children: [
          /* @__PURE__ */ jsx("span", { className: "text-3xl font-bold text-foreground", children: score.totalScore }),
          /* @__PURE__ */ jsx("span", { className: "text-xs text-muted-foreground", children: "/ 1000" })
        ] })
      ] }),
      /* @__PURE__ */ jsx("p", { className: "text-sm font-medium", style: { color: score.gradeColor }, children: score.gradeLabel }),
      weakest.length > 0 && score.totalScore > 0 && /* @__PURE__ */ jsxs("div", { className: "w-full space-y-2 mt-2", children: [
        /* @__PURE__ */ jsx("p", { className: "text-xs font-medium text-muted-foreground", children: "İyileştirme Alanları" }),
        weakest.map((comp) => /* @__PURE__ */ jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between text-xs", children: [
            /* @__PURE__ */ jsxs("span", { className: "text-muted-foreground", children: [
              comp.icon,
              " ",
              comp.label
            ] }),
            /* @__PURE__ */ jsxs("span", { className: "font-medium text-foreground", children: [
              comp.percentage,
              "%"
            ] })
          ] }),
          /* @__PURE__ */ jsx(Progress, { value: comp.percentage, className: "h-1.5" })
        ] }, comp.key))
      ] }),
      /* @__PURE__ */ jsxs(
        Button,
        {
          variant: "outline",
          size: "sm",
          className: "w-full mt-2",
          onClick: () => navigate("/rep-score"),
          children: [
            "Detaylı Analiz ",
            /* @__PURE__ */ jsx(ArrowRight, { className: "h-4 w-4 ml-1" })
          ]
        }
      )
    ] }) })
  ] });
}
function GooglePerformanceWidget() {
  const { activeBusiness } = useBusiness();
  const { data, isLoading } = useGooglePerformance();
  const navigate = useNavigate();
  if (!(activeBusiness == null ? void 0 : activeBusiness.google_location_id)) return null;
  return /* @__PURE__ */ jsxs(
    Card,
    {
      className: "shadow-card h-[500px] flex flex-col cursor-pointer hover:shadow-lg transition-all",
      onClick: () => navigate("/performance"),
      children: [
        /* @__PURE__ */ jsx(CardHeader, { className: "pb-3 border-b", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsx("div", { className: "p-2 rounded-lg bg-primary/10", children: /* @__PURE__ */ jsx(TrendingUp, { className: "h-5 w-5 text-primary" }) }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx(CardTitle, { className: "text-lg", children: "Google Performance" }),
            /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: "Son 30 gün" })
          ] })
        ] }) }),
        /* @__PURE__ */ jsx(CardContent, { className: "flex-1 flex flex-col justify-center p-6", children: isLoading ? /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
          /* @__PURE__ */ jsx(Skeleton, { className: "h-12 w-full" }),
          /* @__PURE__ */ jsx(Skeleton, { className: "h-12 w-full" })
        ] }) : data ? /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4", children: [
            /* @__PURE__ */ jsx("div", { className: "p-3 rounded-xl bg-muted text-primary", children: /* @__PURE__ */ jsx(Eye, { className: "h-6 w-6" }) }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: "Gösterimler" }),
              /* @__PURE__ */ jsx("p", { className: "text-2xl font-bold text-foreground", children: data.summary.totalImpressions.toLocaleString() })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4", children: [
            /* @__PURE__ */ jsx("div", { className: "p-3 rounded-xl bg-muted text-emerald-600", children: /* @__PURE__ */ jsx(MousePointerClick, { className: "h-6 w-6" }) }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: "Aksiyonlar" }),
              /* @__PURE__ */ jsx("p", { className: "text-2xl font-bold text-foreground", children: data.summary.totalActions.toLocaleString() })
            ] })
          ] }),
          data.summary.topKeyword && /* @__PURE__ */ jsxs("div", { className: "bg-muted/50 rounded-lg p-3", children: [
            /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground mb-1", children: "En Popüler Arama" }),
            /* @__PURE__ */ jsx("p", { className: "text-sm font-medium text-foreground truncate", children: data.summary.topKeyword })
          ] })
        ] }) : /* @__PURE__ */ jsx("p", { className: "text-muted-foreground text-center", children: "Veri yüklenemedi" }) })
      ]
    }
  );
}
const STORAGE_KEY = "vr_first_success_seen";
function hasSeen(businessId) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return false;
    const map = JSON.parse(raw);
    return !!map[businessId];
  } catch {
    return false;
  }
}
function markSeen(businessId) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const map = raw ? JSON.parse(raw) : {};
    map[businessId] = (/* @__PURE__ */ new Date()).toISOString();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  } catch {
  }
}
function FirstSuccessModal() {
  const navigate = useNavigate();
  const { activeBusiness } = useBusiness();
  const { hasPendingRuns } = useReviewFetch();
  const [open, setOpen] = useState(false);
  const [reviewCount, setReviewCount] = useState(0);
  const [wasFetching, setWasFetching] = useState(false);
  useEffect(() => {
    if (hasPendingRuns) {
      setWasFetching(true);
    }
  }, [hasPendingRuns]);
  useEffect(() => {
    if (!activeBusiness) return;
    if (hasPendingRuns) return;
    if (!wasFetching) return;
    if (hasSeen(activeBusiness.id)) return;
    let cancelled = false;
    (async () => {
      const { count } = await supabase.from("reviews").select("id", { count: "exact", head: true }).eq("business_id", activeBusiness.id);
      if (cancelled) return;
      if (count && count > 0) {
        setReviewCount(count);
        setOpen(true);
        markSeen(activeBusiness.id);
        setWasFetching(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [hasPendingRuns, wasFetching, activeBusiness]);
  const handleGoToInbox = () => {
    setOpen(false);
    navigate("/inbox");
  };
  return /* @__PURE__ */ jsx(Dialog, { open, onOpenChange: setOpen, children: /* @__PURE__ */ jsxs(DialogContent, { className: "sm:max-w-md", children: [
    /* @__PURE__ */ jsxs(DialogHeader, { children: [
      /* @__PURE__ */ jsx("div", { className: "mx-auto h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-2", children: /* @__PURE__ */ jsx(PartyPopper, { className: "h-8 w-8 text-primary" }) }),
      /* @__PURE__ */ jsx(DialogTitle, { className: "text-center text-2xl", children: "Harika! Hazırsın 🎉" }),
      /* @__PURE__ */ jsxs(DialogDescription, { className: "text-center text-base pt-2", children: [
        /* @__PURE__ */ jsxs("span", { className: "font-semibold text-foreground", children: [
          reviewCount,
          " yorum"
        ] }),
        " başarıyla çekildi.",
        /* @__PURE__ */ jsx("br", {}),
        "Şimdi ilk yanıtını yazmaya hazırsın."
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "space-y-3 mt-4", children: [
      /* @__PURE__ */ jsxs(Button, { onClick: handleGoToInbox, className: "w-full h-12", size: "lg", children: [
        /* @__PURE__ */ jsx(Inbox, { className: "h-5 w-5 mr-2" }),
        "Tüm Yorumları Aç"
      ] }),
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: () => setOpen(false),
          className: "w-full text-sm text-muted-foreground hover:text-foreground py-2",
          children: "Daha sonra"
        }
      )
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "mt-2 pt-4 border-t flex items-start gap-2 text-xs text-muted-foreground", children: [
      /* @__PURE__ */ jsx(Sparkles, { className: "h-4 w-4 text-primary flex-shrink-0 mt-0.5" }),
      /* @__PURE__ */ jsxs("p", { children: [
        /* @__PURE__ */ jsx("strong", { className: "text-foreground", children: "İpucu:" }),
        " Sidebar'dan",
        " ",
        /* @__PURE__ */ jsx("strong", { className: "text-foreground", children: "Tüm Yorumlar" }),
        " menüsüyle tüm otellerin ve tüm platformların yorumlarını tek ekranda görebilirsin."
      ] })
    ] })
  ] }) });
}
function Dashboard() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { activeBusiness, businesses, loading: businessLoading, refetchBusinesses } = useBusiness();
  const { hasPendingRuns } = useReviewFetch();
  const [currentWeekStart, setCurrentWeekStart] = useState(
    () => startOfWeek(/* @__PURE__ */ new Date(), { weekStartsOn: 1 })
  );
  const [selectedDay, setSelectedDay] = useState(() => /* @__PURE__ */ new Date());
  const [demoDismissed, setDemoDismissed] = useState(false);
  const [onboardingDismissed, setOnboardingDismissed] = useState(false);
  const [wizardDismissed, setWizardDismissed] = useState(false);
  const { data: reviews = [], isLoading: reviewsLoading } = useQuery({
    queryKey: ["reviews", activeBusiness == null ? void 0 : activeBusiness.id],
    queryFn: async () => {
      if (!activeBusiness) return [];
      const { data, error } = await supabase.from("reviews").select("*").eq("business_id", activeBusiness.id).order("posted_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!activeBusiness
  });
  const isDemoMode = !!activeBusiness && !reviewsLoading && reviews.length === 0 && !activeBusiness.google_connected;
  const effectiveReviews = isDemoMode ? DEMO_REVIEWS : reviews;
  function getDayHeatColor(avgRating) {
    if (avgRating <= 2) return { bg: "#FEF2F2", border: "#FCA5A5", text: "#B91C1C" };
    if (avgRating <= 3.5) return { bg: "#FFFBEB", border: "#FACC15", text: "#92400E" };
    if (avgRating <= 4.3) return { bg: "#ECFDF3", border: "#4ADE80", text: "#166534" };
    return { bg: "#ECFEFF", border: "#22D3EE", text: "#115E59" };
  }
  const metrics = useMemo(() => {
    if (isDemoMode) return DEMO_METRICS;
    if (!reviews.length) return { avgRating: 0, totalReviews: 0, reviewsThisWeek: 0, pendingReplies: 0 };
    const avgRating = averageRating5(reviews);
    const weekStart = startOfDay(currentWeekStart);
    const weekEnd = endOfDay(addDays(currentWeekStart, 6));
    const reviewsThisWeek = reviews.filter((r) => {
      const date = new Date(r.posted_at);
      return date >= weekStart && date <= weekEnd;
    }).length;
    const pendingReplies = reviews.filter((r) => r.status === "pending_reply").length;
    return { avgRating: avgRating.toFixed(1), totalReviews: reviews.length, reviewsThisWeek, pendingReplies };
  }, [reviews, currentWeekStart, isDemoMode]);
  const weeklyData = useMemo(() => {
    return Array.from({ length: 7 }, (_, index) => {
      const date = addDays(currentWeekStart, index);
      const dayStart = startOfDay(date);
      const dayEnd = endOfDay(date);
      const dayReviews = effectiveReviews.filter((r) => {
        const reviewDate = new Date(r.posted_at);
        return reviewDate >= dayStart && reviewDate <= dayEnd;
      });
      const avgRating = averageRating5(dayReviews);
      return {
        date,
        day: format(date, "EEE"),
        dayNumber: format(date, "d"),
        reviewCount: dayReviews.length,
        avgRating
      };
    });
  }, [currentWeekStart, effectiveReviews]);
  const weekRange = useMemo(() => {
    const weekEnd = addDays(currentWeekStart, 6);
    return `${format(currentWeekStart, "MMM d")} – ${format(weekEnd, "MMM d, yyyy")}`;
  }, [currentWeekStart]);
  const goToPreviousWeek = () => setCurrentWeekStart((prev) => addDays(prev, -7));
  const goToNextWeek = () => setCurrentWeekStart((prev) => addDays(prev, 7));
  const filteredReviews = useMemo(() => {
    const dayStart = startOfDay(selectedDay);
    const dayEnd = endOfDay(selectedDay);
    return effectiveReviews.filter((review) => {
      const reviewDate = new Date(review.posted_at);
      return reviewDate >= dayStart && reviewDate <= dayEnd;
    });
  }, [effectiveReviews, selectedDay]);
  const selectedDayName = format(selectedDay, "EEE");
  const getSentimentColor = (sentiment) => {
    switch (sentiment == null ? void 0 : sentiment.toLowerCase()) {
      case "positive":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "neutral":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "negative":
        return "bg-rose-50 text-rose-700 border-rose-200";
      default:
        return "bg-muted text-muted-foreground border-border";
    }
  };
  const getTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now2 = /* @__PURE__ */ new Date();
    const diffMs = now2.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 6e4);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays > 0) return `${diffDays} gün önce`;
    if (diffHours > 0) return `${diffHours} saat önce`;
    if (diffMins > 0) return `${diffMins} dakika önce`;
    return "Az önce";
  };
  const analyticsData = [
    { title: t("dashboard.metrics.avgRating", "Ortalama Puan"), value: metrics.avgRating, icon: Star, subtitle: t("dashboard.metrics.outOf5", "5 üzerinden") },
    { title: t("dashboard.metrics.totalReviews", "Toplam Yorumlar"), value: typeof metrics.totalReviews === "number" ? metrics.totalReviews.toLocaleString() : metrics.totalReviews, subtitle: t("dashboard.metrics.allTime", "tüm zamanlar") },
    { title: t("dashboard.metrics.weeklyReviews", "Bu Haftanın Yorumları"), value: metrics.reviewsThisWeek.toString(), subtitle: weekRange },
    { title: t("dashboard.metrics.pendingReplies", "Bekleyen Yanıtlar"), value: metrics.pendingReplies.toString(), subtitle: t("dashboard.metrics.needsAttention", "dikkat gerekiyor") }
  ];
  if (businessLoading) {
    return /* @__PURE__ */ jsx("div", { className: "flex items-center justify-center min-h-screen", children: /* @__PURE__ */ jsx("div", { className: "animate-spin rounded-full h-8 w-8 border-b-2 border-primary" }) });
  }
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(
      BusinessOnboarding,
      {
        open: !businessLoading && !activeBusiness && !onboardingDismissed,
        onBusinessCreated: refetchBusinesses,
        onDismiss: () => setOnboardingDismissed(true)
      }
    ),
    /* @__PURE__ */ jsx(FirstSuccessModal, {}),
    /* @__PURE__ */ jsx("div", { className: "min-h-screen bg-background", children: /* @__PURE__ */ jsx("div", { className: "max-w-7xl mx-auto p-8 space-y-6", children: activeBusiness && businesses.length > 1 ? /* @__PURE__ */ jsxs(Tabs, { defaultValue: "active", className: "w-full", children: [
      /* @__PURE__ */ jsxs(TabsList, { children: [
        /* @__PURE__ */ jsx(TabsTrigger, { value: "active", children: "Aktif Otel" }),
        /* @__PURE__ */ jsxs(TabsTrigger, { value: "all", children: [
          "Tüm Oteller (",
          businesses.length,
          ")"
        ] })
      ] }),
      /* @__PURE__ */ jsx(TabsContent, { value: "all", className: "mt-6", children: /* @__PURE__ */ jsx(AllBusinessesView, {}) }),
      /* @__PURE__ */ jsx(TabsContent, { value: "active", className: "mt-6 space-y-10", children: /* @__PURE__ */ jsx(DashboardActiveContent, {}) })
    ] }) : /* @__PURE__ */ jsx("div", { className: "space-y-10", children: /* @__PURE__ */ jsx(DashboardActiveContent, {}) }) }) })
  ] });
  function DashboardActiveContent() {
    return /* @__PURE__ */ jsxs(Fragment, { children: [
      activeBusiness && /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between gap-4", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
            /* @__PURE__ */ jsx("h1", { className: "text-3xl font-semibold text-foreground", children: activeBusiness.name }),
            activeBusiness.google_connected ? /* @__PURE__ */ jsxs(Badge, { className: "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-50", children: [
              /* @__PURE__ */ jsx(CheckCircle2, { className: "h-3 w-3 mr-1" }),
              "Google Bağlı"
            ] }) : /* @__PURE__ */ jsxs(Badge, { variant: "secondary", className: "text-muted-foreground", children: [
              /* @__PURE__ */ jsx(AlertCircle, { className: "h-3 w-3 mr-1" }),
              "Google Bağlı Değil"
            ] }),
            activeBusiness.booking_hotel_id && /* @__PURE__ */ jsxs(Badge, { className: "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-50", children: [
              /* @__PURE__ */ jsx(CheckCircle2, { className: "h-3 w-3 mr-1" }),
              "Booking.com"
            ] })
          ] }),
          /* @__PURE__ */ jsxs("p", { className: "text-muted-foreground mt-1", children: [
            activeBusiness.city ? `${activeBusiness.city} · ` : "",
            t("dashboard.subtitle", "Dashboard Özeti")
          ] })
        ] }),
        activeBusiness.place_id && /* @__PURE__ */ jsxs(
          "a",
          {
            href: `https://search.google.com/local/reviews?placeid=${activeBusiness.place_id}`,
            target: "_blank",
            rel: "noopener noreferrer",
            className: "text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors",
            children: [
              /* @__PURE__ */ jsx(ExternalLink, { className: "h-3.5 w-3.5" }),
              "Google'da Gör"
            ]
          }
        )
      ] }),
      activeBusiness && !wizardDismissed && /* @__PURE__ */ jsx(
        SetupWizard,
        {
          onDismiss: () => setWizardDismissed(true),
          onComplete: () => {
            refetchBusinesses();
            queryClient.invalidateQueries({ queryKey: ["reviews"] });
          }
        }
      ),
      /* @__PURE__ */ jsx(PlatformDiscovery, {}),
      isDemoMode && !demoDismissed && /* @__PURE__ */ jsx(DemoModeBanner, { onDismiss: () => setDemoDismissed(true) }),
      /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6", children: analyticsData.map((item, index) => /* @__PURE__ */ jsxs(Card, { className: "shadow-card hover:shadow-lg transition-all duration-300 hover:scale-[1.02]", children: [
        /* @__PURE__ */ jsx(CardHeader, { className: "pb-3", children: /* @__PURE__ */ jsx(CardTitle, { className: "text-sm font-medium text-muted-foreground", children: item.title }) }),
        /* @__PURE__ */ jsxs(CardContent, { className: "space-y-2", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
            item.icon && /* @__PURE__ */ jsx(item.icon, { className: "h-5 w-5 text-primary fill-primary" }),
            /* @__PURE__ */ jsx("div", { className: "text-3xl font-bold text-foreground", children: item.value })
          ] }),
          /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: item.subtitle })
        ] })
      ] }, index)) }),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-4 gap-6", children: [
        /* @__PURE__ */ jsx("div", { className: "space-y-0", children: /* @__PURE__ */ jsx(RepScoreWidget, { score: calculateRepScore(effectiveReviews.map((r) => ({
          rating: r.rating,
          text: r.text,
          platform: r.platform || "google",
          posted_at: r.posted_at,
          status: r.status,
          sentiment: r.sentiment,
          approved_reply: r.approved_reply,
          replied_at: r.replied_at
        }))) }) }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-0", children: [
          /* @__PURE__ */ jsx(PriorityActions, { reviews: effectiveReviews }),
          isDemoMode && /* @__PURE__ */ jsx(UpgradeCTA, { feature: t("dashboard.demo.features.priorityActions", "Öncelikli İşlemler") })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-0", children: [
          /* @__PURE__ */ jsxs(Card, { className: "shadow-card h-[500px] flex flex-col cursor-pointer hover:shadow-md transition-all", onClick: () => navigate("/chat"), children: [
            /* @__PURE__ */ jsx(CardHeader, { className: "pb-3 border-b", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsx("div", { className: "p-2 rounded-lg bg-primary/10", children: /* @__PURE__ */ jsx(Star, { className: "h-5 w-5 text-primary" }) }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx(CardTitle, { className: "text-lg", children: "Yorumlarınızla Sohbet" }),
                /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: "AI'a yorumlarınız hakkında sorular sorun" })
              ] })
            ] }) }),
            /* @__PURE__ */ jsxs(CardContent, { className: "flex-1 flex flex-col items-center justify-center p-6", children: [
              /* @__PURE__ */ jsx("div", { className: "w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4", children: /* @__PURE__ */ jsx(Star, { className: "w-8 h-8 text-primary" }) }),
              /* @__PURE__ */ jsx("p", { className: "text-muted-foreground text-center mb-4", children: "Yorumlarınız hakkında sorular sorun" }),
              /* @__PURE__ */ jsx(Button, { variant: "outline", size: "sm", children: "Sohbete Git →" })
            ] })
          ] }),
          isDemoMode && /* @__PURE__ */ jsx(UpgradeCTA, { feature: t("dashboard.demo.features.chatWithReviews", "Yorumlarla Sohbet") })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "space-y-0", children: /* @__PURE__ */ jsx(GooglePerformanceWidget, {}) }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-0", children: [
          /* @__PURE__ */ jsx(CompetitorComparison, {}),
          isDemoMode && /* @__PURE__ */ jsx(UpgradeCTA, { feature: t("dashboard.demo.features.competitorAnalysis", "Rakip Analizi") })
        ] })
      ] }),
      reviewsLoading && !isDemoMode ? /* @__PURE__ */ jsx("div", { className: "flex items-center justify-center p-12", children: /* @__PURE__ */ jsx("div", { className: "animate-spin rounded-full h-8 w-8 border-b-2 border-primary" }) }) : effectiveReviews.length === 0 ? /* @__PURE__ */ jsx(Card, { className: "p-12 text-center shadow-card space-y-4", children: hasPendingRuns ? /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsx("div", { className: "flex justify-center", children: /* @__PURE__ */ jsx("div", { className: "h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center", children: /* @__PURE__ */ jsx("div", { className: "animate-spin rounded-full h-8 w-8 border-b-2 border-primary" }) }) }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("p", { className: "text-foreground text-lg font-medium", children: "Yorumların çekiliyor..." }),
          /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground mt-1", children: "Bu işlem 1-2 dakika sürebilir. Bittiğinde sana haber vereceğiz." })
        ] })
      ] }) : (activeBusiness == null ? void 0 : activeBusiness.google_connected) ? /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsx("div", { className: "flex justify-center", children: /* @__PURE__ */ jsx("div", { className: "h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center", children: /* @__PURE__ */ jsx(Star, { className: "h-8 w-8 text-primary" }) }) }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("p", { className: "text-foreground text-lg font-medium", children: "Google Business bağlı, yorumları çekelim!" }),
          /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground mt-1", children: `Sidebar'dan Google Business → Google Yorumları sayfasına gidin ve "Yorumları Çek" butonuna tıklayın.` })
        ] }),
        /* @__PURE__ */ jsx(Button, { onClick: () => navigate("/reviews"), className: "mt-2", children: "Yorumlar Sayfasına Git" })
      ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsx("p", { className: "text-muted-foreground text-lg", children: t("dashboard.noReviews", "Bu işletme için henüz yorum yok.") }),
        /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: t("dashboard.noReviewsSub", "Yorumlar eklendiğinde burada görünecek.") })
      ] }) }) : /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("h2", { className: "text-2xl font-semibold text-foreground", children: t("dashboard.weeklyTitle", "Bu Haftanın Yorumları") }),
              /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground mt-1", children: weekRange })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsx(Button, { variant: "ghost", size: "icon", className: "h-8 w-8", onClick: goToPreviousWeek, children: /* @__PURE__ */ jsx(ChevronLeft, { className: "h-4 w-4" }) }),
              /* @__PURE__ */ jsx(Button, { variant: "ghost", size: "icon", className: "h-8 w-8", onClick: goToNextWeek, children: /* @__PURE__ */ jsx(ChevronRight, { className: "h-4 w-4" }) })
            ] })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "grid grid-cols-7 gap-1.5 md:gap-3", children: weeklyData.map((dayData, index) => {
            const colors = dayData.avgRating > 0 ? getDayHeatColor(dayData.avgRating) : { bg: "#F9FAFB", border: "#E5E7EB", text: "#9CA3AF" };
            const isSelected = isSameDay(selectedDay, dayData.date);
            return /* @__PURE__ */ jsx(
              "button",
              {
                onClick: () => setSelectedDay(dayData.date),
                className: `p-2 md:p-4 rounded-lg transition-all duration-200 ${isSelected ? "shadow-md scale-105" : "shadow-soft hover:shadow-card hover:scale-[1.02]"}`,
                style: {
                  backgroundColor: colors.bg,
                  borderWidth: "2px",
                  borderColor: isSelected ? colors.border : "transparent"
                },
                children: /* @__PURE__ */ jsxs("div", { className: "space-y-1 md:space-y-2 text-center", children: [
                  /* @__PURE__ */ jsx("div", { className: "text-[10px] md:text-xs font-semibold", style: { color: colors.text }, children: dayData.day }),
                  /* @__PURE__ */ jsx("div", { className: "text-sm md:text-lg font-bold", style: { color: colors.text }, children: dayData.dayNumber }),
                  /* @__PURE__ */ jsxs("div", { className: "text-[9px] md:text-[10px] font-medium", style: { color: colors.text }, children: [
                    dayData.reviewCount,
                    " yorum"
                  ] })
                ] })
              },
              index
            );
          }) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
          /* @__PURE__ */ jsxs("h2", { className: "text-2xl font-semibold text-foreground", children: [
            selectedDayName,
            " ",
            t("dashboard.dayReviews", "Günü Yorumları"),
            " (",
            format(selectedDay, "MMM d"),
            ")"
          ] }),
          filteredReviews.length === 0 ? /* @__PURE__ */ jsx(Card, { className: "p-16 text-center shadow-card", children: /* @__PURE__ */ jsx("p", { className: "text-muted-foreground text-lg", children: t("dashboard.noDayReviews", "Bu gün için yorum bulunamadı.") }) }) : /* @__PURE__ */ jsx("div", { className: "space-y-4", children: filteredReviews.map((review) => /* @__PURE__ */ jsx(
            Card,
            {
              className: "shadow-card hover:shadow-md transition-all duration-300 hover:scale-[1.005] cursor-pointer",
              onClick: () => !isDemoMode && navigate(`/reviews/${review.id}`),
              children: /* @__PURE__ */ jsx(CardContent, { className: "p-6", children: /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between gap-6", children: [
                /* @__PURE__ */ jsxs("div", { className: "flex-1 space-y-3", children: [
                  /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 flex-wrap", children: [
                    /* @__PURE__ */ jsx("h3", { className: "font-semibold text-foreground text-base", children: review.reviewer_name }),
                    /* @__PURE__ */ jsx("div", { className: "flex items-center gap-0.5", children: Array.from({ length: review.rating }).map((_, i) => /* @__PURE__ */ jsx(Star, { className: "h-4 w-4 fill-primary text-primary" }, i)) }),
                    isDemoMode && /* @__PURE__ */ jsx(Badge, { variant: "outline", className: "text-xs bg-primary/5 text-primary border-primary/20", children: "Demo" })
                  ] }),
                  /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground line-clamp-2 leading-relaxed", children: review.text || "Yorum metni yok" }),
                  /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
                    /* @__PURE__ */ jsx("span", { className: "text-xs text-muted-foreground", children: getTimeAgo(review.posted_at) }),
                    review.sentiment && /* @__PURE__ */ jsx(Badge, { variant: "outline", className: `${getSentimentColor(review.sentiment)} text-xs capitalize`, children: review.sentiment })
                  ] })
                ] }),
                /* @__PURE__ */ jsx(Button, { variant: "outline", size: "sm", className: "shrink-0", children: isDemoMode ? t("dashboard.demo.seeExample", "Örnek Yanıt") : t("dashboard.seeReply", "Yanıtı Gör") })
              ] }) })
            },
            review.id
          )) })
        ] }),
        isDemoMode && /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-primary/20 bg-gradient-to-r from-primary/5 via-background to-primary/5 p-8 text-center space-y-4", children: [
          /* @__PURE__ */ jsx("h3", { className: "text-xl font-semibold text-foreground", children: t("dashboard.demo.bottomCta.title", "Gerçek verilerinizle çalışmaya hazır mısınız?") }),
          /* @__PURE__ */ jsx("p", { className: "text-muted-foreground max-w-lg mx-auto", children: t("dashboard.demo.bottomCta.subtitle", "Google Business hesabınızı bağlayın ve gerçek müşteri yorumlarınızı AI ile yönetmeye başlayın.") }),
          /* @__PURE__ */ jsx(Button, { onClick: () => navigate("/settings"), className: "gradient-primary text-white px-8 py-6 text-base", children: t("dashboard.demo.bottomCta.button", "Hesabımı Bağla ve Başla") })
        ] })
      ] })
    ] });
  }
}
export {
  Dashboard as default
};
