import { jsx, jsxs } from "react/jsx-runtime";
import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { C as Card, c as CardContent, a as CardHeader, e as CardTitle, b as CardDescription } from "./card-vx9BCW0t.js";
import { a as useBusiness, s as supabase, B as Button, m as Badge } from "../main.mjs";
import { Brain, Loader2, Star, MessageSquare, ThumbsUp, ThumbsDown, Send, AlertTriangle, TrendingUp, BarChart3, Clock, CheckCircle2 } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, BarChart, CartesianGrid, XAxis, YAxis, Bar, Legend, Line, AreaChart, Area } from "recharts";
import ReactMarkdown from "react-markdown";
import { eachMonthOfInterval, subMonths, startOfMonth, format } from "date-fns";
import { tr } from "date-fns/locale";
import "vite-react-ssg";
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
const COLORS = {
  positive: "#10b981",
  neutral: "#f59e0b",
  negative: "#ef4444",
  primary: "#8b5cf6",
  secondary: "#6366f1"
};
function Statistics() {
  var _a;
  const { activeBusiness } = useBusiness();
  const navigate = useNavigate();
  const [aiReport, setAiReport] = useState(null);
  const { data: reviews = [], isLoading } = useQuery({
    queryKey: ["reviews-stats", activeBusiness == null ? void 0 : activeBusiness.id],
    queryFn: async () => {
      if (!activeBusiness) return [];
      const { data, error } = await supabase.from("reviews").select("*").eq("business_id", activeBusiness.id).order("posted_at", { ascending: true });
      if (error) throw error;
      return data || [];
    },
    enabled: !!activeBusiness
  });
  const { data: replyLogs = [] } = useQuery({
    queryKey: ["reply-logs", activeBusiness == null ? void 0 : activeBusiness.id],
    queryFn: async () => {
      if (!activeBusiness) return [];
      const { data, error } = await supabase.from("reply_logs").select("*").eq("business_id", activeBusiness.id).order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!activeBusiness
  });
  const analysisMutation = useMutation({
    mutationFn: async () => {
      if (!activeBusiness) throw new Error("No business");
      const response = await supabase.functions.invoke("business-analysis", {
        body: { business_id: activeBusiness.id }
      });
      if (response.error) throw new Error(response.error.message);
      return response.data;
    },
    onSuccess: (data) => {
      setAiReport(data.analysis);
    }
  });
  const stats = useMemo(() => {
    if (!reviews.length) return null;
    const totalReviews = reviews.length;
    const avgRating = reviews.reduce((s, r) => s + r.rating, 0) / totalReviews;
    const sentimentCounts = {
      positive: reviews.filter((r) => r.sentiment === "positive").length,
      neutral: reviews.filter((r) => r.sentiment === "neutral").length,
      negative: reviews.filter((r) => r.sentiment === "negative").length
    };
    const repliedCount = reviews.filter((r) => r.status === "replied").length;
    const pendingCount = reviews.filter((r) => !r.status || r.status === "pending_reply").length;
    const replyRate = totalReviews > 0 ? repliedCount / totalReviews * 100 : 0;
    return { totalReviews, avgRating, sentimentCounts, repliedCount, pendingCount, replyRate };
  }, [reviews]);
  const sentimentPieData = useMemo(() => {
    if (!stats) return [];
    return [
      { name: "Pozitif", value: stats.sentimentCounts.positive, color: COLORS.positive },
      { name: "Nötr", value: stats.sentimentCounts.neutral, color: COLORS.neutral },
      { name: "Negatif", value: stats.sentimentCounts.negative, color: COLORS.negative }
    ];
  }, [stats]);
  const monthlyData = useMemo(() => {
    if (!reviews.length) return [];
    const now = /* @__PURE__ */ new Date();
    const months = eachMonthOfInterval({
      start: subMonths(startOfMonth(now), 5),
      end: startOfMonth(now)
    });
    return months.map((month) => {
      const monthEnd = new Date(month.getFullYear(), month.getMonth() + 1, 0);
      const monthReviews = reviews.filter((r) => {
        const d = new Date(r.posted_at);
        return d >= month && d <= monthEnd;
      });
      const avg = monthReviews.length > 0 ? monthReviews.reduce((s, r) => s + r.rating, 0) / monthReviews.length : 0;
      return {
        month: format(month, "MMM yy", { locale: tr }),
        count: monthReviews.length,
        avgRating: parseFloat(avg.toFixed(1)),
        positive: monthReviews.filter((r) => r.sentiment === "positive").length,
        negative: monthReviews.filter((r) => r.sentiment === "negative").length
      };
    });
  }, [reviews]);
  const ratingDistribution = useMemo(() => {
    if (!reviews.length) return [];
    return [5, 4, 3, 2, 1].map((rating) => ({
      rating: `${rating} ⭐`,
      count: reviews.filter((r) => r.rating === rating).length
    }));
  }, [reviews]);
  const replyPerformance = useMemo(() => {
    if (!replyLogs.length) return [];
    const now = /* @__PURE__ */ new Date();
    const months = eachMonthOfInterval({
      start: subMonths(startOfMonth(now), 5),
      end: startOfMonth(now)
    });
    return months.map((month) => {
      const monthEnd = new Date(month.getFullYear(), month.getMonth() + 1, 0);
      const logs = replyLogs.filter((l) => {
        const d = new Date(l.created_at);
        return d >= month && d <= monthEnd;
      });
      const avgTime = logs.length > 0 ? logs.reduce((s, l) => s + (l.response_time_hours || 0), 0) / logs.length : 0;
      return {
        month: format(month, "MMM yy", { locale: tr }),
        replies: logs.length,
        avgResponseHours: parseFloat(avgTime.toFixed(1))
      };
    });
  }, [replyLogs]);
  if (!activeBusiness) {
    return /* @__PURE__ */ jsx("div", { className: "p-8", children: /* @__PURE__ */ jsx(Card, { className: "p-12 text-center", children: /* @__PURE__ */ jsx("p", { className: "text-muted-foreground", children: "İşletme seçilmedi." }) }) });
  }
  if (isLoading) {
    return /* @__PURE__ */ jsx("div", { className: "flex items-center justify-center min-h-screen", children: /* @__PURE__ */ jsx("div", { className: "animate-spin rounded-full h-8 w-8 border-b-2 border-primary" }) });
  }
  if (!reviews.length) {
    return /* @__PURE__ */ jsxs("div", { className: "p-8 space-y-6", children: [
      /* @__PURE__ */ jsx("h1", { className: "text-3xl font-semibold text-foreground", children: "İstatistikler & Analiz" }),
      /* @__PURE__ */ jsxs(Card, { className: "p-12 text-center", children: [
        /* @__PURE__ */ jsx(Brain, { className: "h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" }),
        /* @__PURE__ */ jsx("p", { className: "text-muted-foreground text-lg", children: "Henüz analiz edilecek yorum yok." }),
        /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground mt-1", children: "Yorumlar geldikçe grafikler ve AI raporu burada görünecek." })
      ] })
    ] });
  }
  return /* @__PURE__ */ jsxs("div", { className: "p-8 space-y-8", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h1", { className: "text-3xl font-semibold text-foreground", children: "İstatistikler & Analiz" }),
        /* @__PURE__ */ jsxs("p", { className: "text-muted-foreground mt-1", children: [
          activeBusiness.name,
          " — ",
          stats == null ? void 0 : stats.totalReviews,
          " yorum analizi"
        ] })
      ] }),
      /* @__PURE__ */ jsxs(
        Button,
        {
          onClick: () => analysisMutation.mutate(),
          disabled: analysisMutation.isPending,
          className: "gap-2",
          children: [
            analysisMutation.isPending ? /* @__PURE__ */ jsx(Loader2, { className: "h-4 w-4 animate-spin" }) : /* @__PURE__ */ jsx(Brain, { className: "h-4 w-4" }),
            analysisMutation.isPending ? "Analiz ediliyor..." : "AI Rapor Oluştur"
          ]
        }
      )
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4", children: [
      /* @__PURE__ */ jsx(Card, { className: "shadow-card", children: /* @__PURE__ */ jsxs(CardContent, { className: "pt-5 pb-4 text-center", children: [
        /* @__PURE__ */ jsx(Star, { className: "h-5 w-5 mx-auto mb-1 text-primary fill-primary" }),
        /* @__PURE__ */ jsx("div", { className: "text-2xl font-bold", children: stats == null ? void 0 : stats.avgRating.toFixed(1) }),
        /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: "Ort. Puan" })
      ] }) }),
      /* @__PURE__ */ jsx(Card, { className: "shadow-card cursor-pointer hover:ring-2 hover:ring-primary/30 transition-all", onClick: () => navigate("/reviews"), children: /* @__PURE__ */ jsxs(CardContent, { className: "pt-5 pb-4 text-center", children: [
        /* @__PURE__ */ jsx(MessageSquare, { className: "h-5 w-5 mx-auto mb-1 text-primary" }),
        /* @__PURE__ */ jsx("div", { className: "text-2xl font-bold", children: stats == null ? void 0 : stats.totalReviews }),
        /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: "Toplam Yorum" })
      ] }) }),
      /* @__PURE__ */ jsx(Card, { className: "shadow-card cursor-pointer hover:ring-2 hover:ring-emerald-400/30 transition-all", onClick: () => navigate("/reviews?sentiment=positive"), children: /* @__PURE__ */ jsxs(CardContent, { className: "pt-5 pb-4 text-center", children: [
        /* @__PURE__ */ jsx(ThumbsUp, { className: "h-5 w-5 mx-auto mb-1 text-emerald-500" }),
        /* @__PURE__ */ jsx("div", { className: "text-2xl font-bold", children: stats == null ? void 0 : stats.sentimentCounts.positive }),
        /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: "Pozitif" })
      ] }) }),
      /* @__PURE__ */ jsx(Card, { className: "shadow-card cursor-pointer hover:ring-2 hover:ring-rose-400/30 transition-all", onClick: () => navigate("/reviews?sentiment=negative"), children: /* @__PURE__ */ jsxs(CardContent, { className: "pt-5 pb-4 text-center", children: [
        /* @__PURE__ */ jsx(ThumbsDown, { className: "h-5 w-5 mx-auto mb-1 text-rose-500" }),
        /* @__PURE__ */ jsx("div", { className: "text-2xl font-bold", children: stats == null ? void 0 : stats.sentimentCounts.negative }),
        /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: "Negatif" })
      ] }) }),
      /* @__PURE__ */ jsx(Card, { className: "shadow-card", children: /* @__PURE__ */ jsxs(CardContent, { className: "pt-5 pb-4 text-center", children: [
        /* @__PURE__ */ jsx(Send, { className: "h-5 w-5 mx-auto mb-1 text-blue-500" }),
        /* @__PURE__ */ jsxs("div", { className: "text-2xl font-bold", children: [
          "%",
          stats == null ? void 0 : stats.replyRate.toFixed(0)
        ] }),
        /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: "Yanıt Oranı" })
      ] }) }),
      /* @__PURE__ */ jsx(Card, { className: "shadow-card cursor-pointer hover:ring-2 hover:ring-amber-400/30 transition-all", onClick: () => navigate("/reviews?status=pending_reply"), children: /* @__PURE__ */ jsxs(CardContent, { className: "pt-5 pb-4 text-center", children: [
        /* @__PURE__ */ jsx(AlertTriangle, { className: "h-5 w-5 mx-auto mb-1 text-amber-500" }),
        /* @__PURE__ */ jsx("div", { className: "text-2xl font-bold", children: stats == null ? void 0 : stats.pendingCount }),
        /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: "Bekleyen" })
      ] }) })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6", children: [
      /* @__PURE__ */ jsxs(Card, { className: "shadow-card", children: [
        /* @__PURE__ */ jsxs(CardHeader, { children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsx(ThumbsUp, { className: "h-5 w-5 text-primary" }),
            /* @__PURE__ */ jsx(CardTitle, { className: "text-lg", children: "Duygu Dağılımı" })
          ] }),
          /* @__PURE__ */ jsx(CardDescription, { children: "Yorumlardaki duygu oranları" })
        ] }),
        /* @__PURE__ */ jsx(CardContent, { children: /* @__PURE__ */ jsx("div", { className: "h-64", children: /* @__PURE__ */ jsx(ResponsiveContainer, { width: "100%", height: "100%", children: /* @__PURE__ */ jsxs(PieChart, { children: [
          /* @__PURE__ */ jsx(
            Pie,
            {
              data: sentimentPieData,
              cx: "50%",
              cy: "50%",
              innerRadius: 60,
              outerRadius: 90,
              paddingAngle: 4,
              dataKey: "value",
              label: ({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`,
              children: sentimentPieData.map((entry, index) => /* @__PURE__ */ jsx(Cell, { fill: entry.color }, index))
            }
          ),
          /* @__PURE__ */ jsx(Tooltip, {})
        ] }) }) }) })
      ] }),
      /* @__PURE__ */ jsxs(Card, { className: "shadow-card", children: [
        /* @__PURE__ */ jsxs(CardHeader, { children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsx(Star, { className: "h-5 w-5 text-primary" }),
            /* @__PURE__ */ jsx(CardTitle, { className: "text-lg", children: "Puan Dağılımı" })
          ] }),
          /* @__PURE__ */ jsx(CardDescription, { children: "Yıldız bazında yorum sayıları" })
        ] }),
        /* @__PURE__ */ jsx(CardContent, { children: /* @__PURE__ */ jsx("div", { className: "h-64", children: /* @__PURE__ */ jsx(ResponsiveContainer, { width: "100%", height: "100%", children: /* @__PURE__ */ jsxs(BarChart, { data: ratingDistribution, layout: "vertical", children: [
          /* @__PURE__ */ jsx(CartesianGrid, { strokeDasharray: "3 3" }),
          /* @__PURE__ */ jsx(XAxis, { type: "number" }),
          /* @__PURE__ */ jsx(YAxis, { type: "category", dataKey: "rating", width: 50 }),
          /* @__PURE__ */ jsx(Tooltip, {}),
          /* @__PURE__ */ jsx(Bar, { dataKey: "count", fill: COLORS.primary, radius: [0, 4, 4, 0] })
        ] }) }) }) })
      ] }),
      /* @__PURE__ */ jsxs(Card, { className: "shadow-card", children: [
        /* @__PURE__ */ jsxs(CardHeader, { children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsx(TrendingUp, { className: "h-5 w-5 text-primary" }),
            /* @__PURE__ */ jsx(CardTitle, { className: "text-lg", children: "Aylık Yorum Trendi" })
          ] }),
          /* @__PURE__ */ jsx(CardDescription, { children: "Son 6 ay yorum sayısı ve ortalama puan" })
        ] }),
        /* @__PURE__ */ jsx(CardContent, { children: /* @__PURE__ */ jsx("div", { className: "h-64", children: /* @__PURE__ */ jsx(ResponsiveContainer, { width: "100%", height: "100%", children: /* @__PURE__ */ jsxs(BarChart, { data: monthlyData, children: [
          /* @__PURE__ */ jsx(CartesianGrid, { strokeDasharray: "3 3" }),
          /* @__PURE__ */ jsx(XAxis, { dataKey: "month" }),
          /* @__PURE__ */ jsx(YAxis, { yAxisId: "left" }),
          /* @__PURE__ */ jsx(YAxis, { yAxisId: "right", orientation: "right", domain: [0, 5] }),
          /* @__PURE__ */ jsx(Tooltip, {}),
          /* @__PURE__ */ jsx(Legend, {}),
          /* @__PURE__ */ jsx(Bar, { yAxisId: "left", dataKey: "count", name: "Yorum Sayısı", fill: COLORS.primary, radius: [4, 4, 0, 0] }),
          /* @__PURE__ */ jsx(Line, { yAxisId: "right", type: "monotone", dataKey: "avgRating", name: "Ort. Puan", stroke: COLORS.positive, strokeWidth: 2, dot: true })
        ] }) }) }) })
      ] }),
      /* @__PURE__ */ jsxs(Card, { className: "shadow-card", children: [
        /* @__PURE__ */ jsxs(CardHeader, { children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsx(BarChart3, { className: "h-5 w-5 text-primary" }),
            /* @__PURE__ */ jsx(CardTitle, { className: "text-lg", children: "Duygu Trendi" })
          ] }),
          /* @__PURE__ */ jsx(CardDescription, { children: "Aylık pozitif vs negatif yorum sayısı" })
        ] }),
        /* @__PURE__ */ jsx(CardContent, { children: /* @__PURE__ */ jsx("div", { className: "h-64", children: /* @__PURE__ */ jsx(ResponsiveContainer, { width: "100%", height: "100%", children: /* @__PURE__ */ jsxs(AreaChart, { data: monthlyData, children: [
          /* @__PURE__ */ jsx(CartesianGrid, { strokeDasharray: "3 3" }),
          /* @__PURE__ */ jsx(XAxis, { dataKey: "month" }),
          /* @__PURE__ */ jsx(YAxis, {}),
          /* @__PURE__ */ jsx(Tooltip, {}),
          /* @__PURE__ */ jsx(Legend, {}),
          /* @__PURE__ */ jsx(Area, { type: "monotone", dataKey: "positive", name: "Pozitif", stackId: "1", fill: COLORS.positive, stroke: COLORS.positive, fillOpacity: 0.6 }),
          /* @__PURE__ */ jsx(Area, { type: "monotone", dataKey: "negative", name: "Negatif", stackId: "1", fill: COLORS.negative, stroke: COLORS.negative, fillOpacity: 0.6 })
        ] }) }) }) })
      ] })
    ] }),
    replyLogs.length > 0 && /* @__PURE__ */ jsxs(Card, { className: "shadow-card", children: [
      /* @__PURE__ */ jsxs(CardHeader, { children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsx(Clock, { className: "h-5 w-5 text-primary" }),
          /* @__PURE__ */ jsx(CardTitle, { className: "text-lg", children: "Yanıt Performansı" })
        ] }),
        /* @__PURE__ */ jsx(CardDescription, { children: "Aylık yanıt sayısı ve ortalama yanıt süresi" })
      ] }),
      /* @__PURE__ */ jsx(CardContent, { children: /* @__PURE__ */ jsx("div", { className: "h-64", children: /* @__PURE__ */ jsx(ResponsiveContainer, { width: "100%", height: "100%", children: /* @__PURE__ */ jsxs(BarChart, { data: replyPerformance, children: [
        /* @__PURE__ */ jsx(CartesianGrid, { strokeDasharray: "3 3" }),
        /* @__PURE__ */ jsx(XAxis, { dataKey: "month" }),
        /* @__PURE__ */ jsx(YAxis, { yAxisId: "left" }),
        /* @__PURE__ */ jsx(YAxis, { yAxisId: "right", orientation: "right" }),
        /* @__PURE__ */ jsx(Tooltip, {}),
        /* @__PURE__ */ jsx(Legend, {}),
        /* @__PURE__ */ jsx(Bar, { yAxisId: "left", dataKey: "replies", name: "Yanıt Sayısı", fill: COLORS.secondary, radius: [4, 4, 0, 0] }),
        /* @__PURE__ */ jsx(Line, { yAxisId: "right", type: "monotone", dataKey: "avgResponseHours", name: "Ort. Süre (saat)", stroke: COLORS.negative, strokeWidth: 2, dot: true })
      ] }) }) }) })
    ] }),
    analysisMutation.isError && /* @__PURE__ */ jsx(Card, { className: "shadow-card border-destructive/50", children: /* @__PURE__ */ jsxs(CardContent, { className: "pt-6", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-destructive mb-2", children: [
        /* @__PURE__ */ jsx(AlertTriangle, { className: "h-5 w-5" }),
        /* @__PURE__ */ jsx("span", { className: "font-medium", children: "Analiz oluşturulamadı" })
      ] }),
      /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: ((_a = analysisMutation.error) == null ? void 0 : _a.message) || "Bir hata oluştu." })
    ] }) }),
    aiReport && /* @__PURE__ */ jsxs(Card, { className: "shadow-card", children: [
      /* @__PURE__ */ jsx(CardHeader, { children: /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsx(Brain, { className: "h-5 w-5 text-primary" }),
          /* @__PURE__ */ jsx(CardTitle, { className: "text-lg", children: "AI İşletme Analiz Raporu" })
        ] }),
        /* @__PURE__ */ jsxs(Badge, { variant: "secondary", className: "text-xs", children: [
          /* @__PURE__ */ jsx(CheckCircle2, { className: "h-3 w-3 mr-1" }),
          reviews.length,
          " yorum analiz edildi"
        ] })
      ] }) }),
      /* @__PURE__ */ jsx(CardContent, { children: /* @__PURE__ */ jsx("div", { className: "prose prose-sm max-w-none dark:prose-invert", children: /* @__PURE__ */ jsx(ReactMarkdown, { children: aiReport }) }) })
    ] }),
    !aiReport && !analysisMutation.isPending && /* @__PURE__ */ jsx(Card, { className: "shadow-card border-dashed", children: /* @__PURE__ */ jsxs(CardContent, { className: "py-12 text-center", children: [
      /* @__PURE__ */ jsx(Brain, { className: "h-12 w-12 mx-auto mb-4 text-muted-foreground/40" }),
      /* @__PURE__ */ jsx("h3", { className: "text-lg font-medium text-foreground mb-2", children: "AI Analiz Raporu" }),
      /* @__PURE__ */ jsxs("p", { className: "text-sm text-muted-foreground mb-4", children: [
        "Yapay zeka ile yorumlarınızdan detaylı işletme analizi oluşturun.",
        /* @__PURE__ */ jsx("br", {}),
        "Güçlü yönler, iyileştirme alanları, trend analizi ve aksiyon önerileri."
      ] }),
      /* @__PURE__ */ jsxs(Button, { onClick: () => analysisMutation.mutate(), className: "gap-2", children: [
        /* @__PURE__ */ jsx(Brain, { className: "h-4 w-4" }),
        "Rapor Oluştur"
      ] })
    ] }) })
  ] });
}
export {
  Statistics as default
};
