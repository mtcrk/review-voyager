import { jsx, jsxs } from "react/jsx-runtime";
import { Eye, MousePointerClick, Search, Percent, TrendingUp, TrendingDown, CalendarIcon, Link, AlertCircle, RefreshCcw } from "lucide-react";
import { u as useGooglePerformance } from "./useGooglePerformance-BZTBFIkl.js";
import { B as Button, a as useBusiness, S as Skeleton } from "../main.mjs";
import { useMemo, useState } from "react";
import { format, subDays } from "date-fns";
import { C as Card, c as CardContent, a as CardHeader, e as CardTitle } from "./card-vx9BCW0t.js";
import { ResponsiveContainer, AreaChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Area, PieChart, Pie, Cell } from "recharts";
import { tr } from "date-fns/locale";
import { P as Popover, a as PopoverTrigger, b as PopoverContent } from "./popover-DkUGUX0H.js";
import { C as Calendar } from "./calendar-B5v0tS8S.js";
import { useNavigate } from "react-router-dom";
import "@tanstack/react-query";
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
import "@radix-ui/react-popover";
import "react-day-picker";
function PerformanceSummaryCards({ data }) {
  const totalImpressions = data.summary.totalImpressions;
  const totalActions = data.summary.totalActions;
  const conversionRate = totalImpressions > 0 ? (totalActions / totalImpressions * 100).toFixed(2) : "0.00";
  const topKeyword = data.searchKeywords[0];
  const cards = [
    {
      title: "Toplam Görüntülenme",
      value: totalImpressions.toLocaleString("tr-TR"),
      icon: Eye,
      iconBg: "bg-[#6C50FF]/10",
      iconColor: "text-[#6C50FF]",
      trend: null,
      hint: "Sektör ortalaması: ~12.500"
    },
    {
      title: "Toplam Aksiyon",
      value: totalActions.toLocaleString("tr-TR"),
      icon: MousePointerClick,
      iconBg: "bg-emerald-500/10",
      iconColor: "text-emerald-600",
      trend: null,
      hint: "Sektör ortalaması: ~850"
    },
    {
      title: "En Çok Aranan Kelime",
      value: (topKeyword == null ? void 0 : topKeyword.keyword) || "—",
      icon: Search,
      iconBg: "bg-amber-500/10",
      iconColor: "text-amber-600",
      subValue: topKeyword ? `${topKeyword.impressions.toLocaleString("tr-TR")} gösterim` : void 0,
      isText: true,
      hint: "Google'da en çok aranan anahtar kelime"
    },
    {
      title: "Dönüşüm Oranı",
      value: `%${conversionRate}`,
      icon: Percent,
      iconBg: "bg-rose-500/10",
      iconColor: "text-rose-600",
      trend: null,
      hint: "Sektör ortalaması: ~%5.2"
    }
  ];
  return /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4", children: cards.map((card, i) => /* @__PURE__ */ jsx(
    Card,
    {
      className: "rounded-xl bg-card shadow-sm border border-border hover:shadow-md transition-all",
      children: /* @__PURE__ */ jsxs(CardContent, { className: "p-6", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between", children: [
          /* @__PURE__ */ jsx("div", { className: `p-2.5 rounded-xl ${card.iconBg}`, children: /* @__PURE__ */ jsx(card.icon, { className: `h-5 w-5 ${card.iconColor}` }) }),
          card.trend && /* @__PURE__ */ jsxs("div", { className: `flex items-center gap-1 text-xs font-medium ${card.trend.up ? "text-emerald-600" : "text-red-500"}`, children: [
            card.trend.up ? /* @__PURE__ */ jsx(TrendingUp, { className: "h-3.5 w-3.5" }) : /* @__PURE__ */ jsx(TrendingDown, { className: "h-3.5 w-3.5" }),
            card.trend.percent
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "mt-4", children: [
          /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: card.title }),
          /* @__PURE__ */ jsx("p", { className: `font-bold mt-1 ${card.isText ? "text-base truncate" : "text-2xl"} text-foreground`, children: card.value }),
          card.subValue && /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground mt-0.5", children: card.subValue })
        ] }),
        /* @__PURE__ */ jsx("p", { className: "text-[11px] text-muted-foreground/60 mt-3", children: card.hint })
      ] })
    },
    i
  )) });
}
const COLORS = {
  desktop_maps: "#6C50FF",
  mobile_maps: "#9B7FFF",
  desktop_search: "#C4B5FD",
  mobile_search: "#E9DEFB"
};
function ImpressionsChart({ data, rangeLabel }) {
  const chartData = useMemo(() => {
    const dateMap = /* @__PURE__ */ new Map();
    const add = (series, key) => {
      series.forEach(({ date, value }) => {
        const entry = dateMap.get(date) || {};
        entry[key] = value;
        dateMap.set(date, entry);
      });
    };
    const imp = data.dailyMetrics.impressions;
    add(imp.desktop_maps, "desktop_maps");
    add(imp.mobile_maps, "mobile_maps");
    add(imp.desktop_search, "desktop_search");
    add(imp.mobile_search, "mobile_search");
    return Array.from(dateMap.entries()).sort(([a], [b]) => a.localeCompare(b)).map(([date, vals]) => ({
      date: format(new Date(date), "dd MMM yy", { locale: tr }),
      "Maps Desktop": vals.desktop_maps || 0,
      "Maps Mobil": vals.mobile_maps || 0,
      "Search Desktop": vals.desktop_search || 0,
      "Search Mobil": vals.mobile_search || 0
    }));
  }, [data]);
  return /* @__PURE__ */ jsxs(Card, { className: "rounded-xl bg-card shadow-sm border border-border", children: [
    /* @__PURE__ */ jsx(CardHeader, { className: "pb-2", children: /* @__PURE__ */ jsxs(CardTitle, { className: "flex items-center gap-2 text-base font-semibold", children: [
      /* @__PURE__ */ jsx(Eye, { className: "h-5 w-5 text-[#6C50FF]" }),
      "Görüntülenme Trendi — ",
      rangeLabel
    ] }) }),
    /* @__PURE__ */ jsx(CardContent, { children: /* @__PURE__ */ jsx(ResponsiveContainer, { width: "100%", height: 340, children: /* @__PURE__ */ jsxs(AreaChart, { data: chartData, children: [
      /* @__PURE__ */ jsx("defs", { children: Object.entries(COLORS).map(([key, color]) => /* @__PURE__ */ jsxs("linearGradient", { id: `grad-${key}`, x1: "0", y1: "0", x2: "0", y2: "1", children: [
        /* @__PURE__ */ jsx("stop", { offset: "5%", stopColor: color, stopOpacity: 0.25 }),
        /* @__PURE__ */ jsx("stop", { offset: "95%", stopColor: color, stopOpacity: 0 })
      ] }, key)) }),
      /* @__PURE__ */ jsx(CartesianGrid, { strokeDasharray: "3 3", className: "stroke-muted/40" }),
      /* @__PURE__ */ jsx(XAxis, { dataKey: "date", className: "text-xs", tick: { fill: "hsl(var(--muted-foreground))", fontSize: 11 } }),
      /* @__PURE__ */ jsx(YAxis, { className: "text-xs", tick: { fill: "hsl(var(--muted-foreground))", fontSize: 11 } }),
      /* @__PURE__ */ jsx(
        Tooltip,
        {
          contentStyle: {
            backgroundColor: "hsl(var(--card))",
            border: "1px solid hsl(var(--border))",
            borderRadius: "10px",
            fontSize: 13
          }
        }
      ),
      /* @__PURE__ */ jsx(Legend, { wrapperStyle: { fontSize: 12 } }),
      /* @__PURE__ */ jsx(Area, { type: "monotone", dataKey: "Maps Desktop", stroke: COLORS.desktop_maps, fill: `url(#grad-desktop_maps)`, strokeWidth: 2 }),
      /* @__PURE__ */ jsx(Area, { type: "monotone", dataKey: "Maps Mobil", stroke: COLORS.mobile_maps, fill: `url(#grad-mobile_maps)`, strokeWidth: 2 }),
      /* @__PURE__ */ jsx(Area, { type: "monotone", dataKey: "Search Desktop", stroke: COLORS.desktop_search, fill: `url(#grad-desktop_search)`, strokeWidth: 2 }),
      /* @__PURE__ */ jsx(Area, { type: "monotone", dataKey: "Search Mobil", stroke: COLORS.mobile_search, fill: `url(#grad-mobile_search)`, strokeWidth: 1.5 })
    ] }) }) })
  ] });
}
const CATEGORIES = [
  { key: "website_clicks", label: "Web Sitesi", color: "#6C50FF" },
  { key: "call_clicks", label: "Telefon", color: "#9B7FFF" },
  { key: "direction_requests", label: "Yol Tarifi", color: "#C4B5FD" },
  { key: "bookings", label: "Rezervasyon", color: "#10B981" },
  { key: "food_orders", label: "Sipariş", color: "#F59E0B" },
  { key: "conversations", label: "Mesaj", color: "#EC4899" }
];
function ActionsChart({ data }) {
  const pieData = useMemo(() => {
    return CATEGORIES.map((cat) => {
      const series = data.dailyMetrics.actions[cat.key];
      const total = series.reduce((sum, d) => sum + d.value, 0);
      return { name: cat.label, value: total, color: cat.color };
    }).filter((d) => d.value > 0);
  }, [data]);
  if (pieData.length === 0) {
    return /* @__PURE__ */ jsxs(Card, { className: "rounded-xl bg-card shadow-sm border border-border", children: [
      /* @__PURE__ */ jsx(CardHeader, { className: "pb-2", children: /* @__PURE__ */ jsxs(CardTitle, { className: "flex items-center gap-2 text-base font-semibold", children: [
        /* @__PURE__ */ jsx(MousePointerClick, { className: "h-5 w-5 text-emerald-600" }),
        "Aksiyon Dağılımı"
      ] }) }),
      /* @__PURE__ */ jsx(CardContent, { children: /* @__PURE__ */ jsx("p", { className: "text-muted-foreground text-center py-12", children: "Henüz aksiyon verisi yok." }) })
    ] });
  }
  return /* @__PURE__ */ jsxs(Card, { className: "rounded-xl bg-card shadow-sm border border-border h-full", children: [
    /* @__PURE__ */ jsx(CardHeader, { className: "pb-2", children: /* @__PURE__ */ jsxs(CardTitle, { className: "flex items-center gap-2 text-base font-semibold", children: [
      /* @__PURE__ */ jsx(MousePointerClick, { className: "h-5 w-5 text-emerald-600" }),
      "Aksiyon Dağılımı"
    ] }) }),
    /* @__PURE__ */ jsxs(CardContent, { children: [
      /* @__PURE__ */ jsx(ResponsiveContainer, { width: "100%", height: 320, children: /* @__PURE__ */ jsxs(PieChart, { children: [
        /* @__PURE__ */ jsx(
          Pie,
          {
            data: pieData,
            cx: "50%",
            cy: "50%",
            innerRadius: 60,
            outerRadius: 110,
            paddingAngle: 3,
            dataKey: "value",
            label: ({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`,
            labelLine: false,
            style: { fontSize: 12 },
            children: pieData.map((entry, i) => /* @__PURE__ */ jsx(Cell, { fill: entry.color }, i))
          }
        ),
        /* @__PURE__ */ jsx(
          Tooltip,
          {
            contentStyle: {
              backgroundColor: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "10px",
              fontSize: 13
            }
          }
        )
      ] }) }),
      /* @__PURE__ */ jsx("div", { className: "flex flex-wrap gap-3 mt-2 justify-center", children: pieData.map((d) => /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5 text-xs text-muted-foreground", children: [
        /* @__PURE__ */ jsx("div", { className: "w-2.5 h-2.5 rounded-full", style: { backgroundColor: d.color } }),
        d.name,
        ": ",
        /* @__PURE__ */ jsx("span", { className: "font-medium text-foreground", children: d.value.toLocaleString("tr-TR") })
      ] }, d.name)) })
    ] })
  ] });
}
function SearchKeywordsTable({ keywords }) {
  const maxImpressions = keywords.length > 0 ? keywords[0].impressions : 1;
  return /* @__PURE__ */ jsxs(Card, { className: "rounded-xl bg-card shadow-sm border border-border h-full", children: [
    /* @__PURE__ */ jsx(CardHeader, { className: "pb-2", children: /* @__PURE__ */ jsxs(CardTitle, { className: "flex items-center gap-2 text-base font-semibold", children: [
      /* @__PURE__ */ jsx(Search, { className: "h-5 w-5 text-amber-600" }),
      "Arama Anahtar Kelimeleri"
    ] }) }),
    /* @__PURE__ */ jsx(CardContent, { children: keywords.length === 0 ? /* @__PURE__ */ jsx("p", { className: "text-muted-foreground text-center py-12", children: "Henüz anahtar kelime verisi yok." }) : /* @__PURE__ */ jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxs("table", { className: "w-full text-sm", children: [
      /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", { className: "border-b border-border text-muted-foreground text-xs", children: [
        /* @__PURE__ */ jsx("th", { className: "text-left py-2 pr-2 w-8", children: "#" }),
        /* @__PURE__ */ jsx("th", { className: "text-left py-2 pr-4", children: "Anahtar Kelime" }),
        /* @__PURE__ */ jsx("th", { className: "text-right py-2 pr-4 w-24", children: "Gösterim" }),
        /* @__PURE__ */ jsx("th", { className: "py-2 w-32" })
      ] }) }),
      /* @__PURE__ */ jsx("tbody", { children: keywords.slice(0, 20).map((kw, i) => {
        const pct = kw.impressions / maxImpressions * 100;
        return /* @__PURE__ */ jsxs("tr", { className: "border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors", children: [
          /* @__PURE__ */ jsx("td", { className: "py-2.5 pr-2 text-muted-foreground font-medium", children: i + 1 }),
          /* @__PURE__ */ jsx("td", { className: "py-2.5 pr-4 text-foreground", children: kw.keyword }),
          /* @__PURE__ */ jsx("td", { className: "py-2.5 pr-4 text-right font-mono text-foreground", children: kw.impressions.toLocaleString("tr-TR") }),
          /* @__PURE__ */ jsx("td", { className: "py-2.5", children: /* @__PURE__ */ jsx("div", { className: "w-full bg-muted rounded-full h-2", children: /* @__PURE__ */ jsx(
            "div",
            {
              className: "h-2 rounded-full bg-gradient-to-r from-[#6C50FF] to-[#9B7FFF]",
              style: { width: `${pct}%` }
            }
          ) }) })
        ] }, i);
      }) })
    ] }) }) })
  ] });
}
const PRESETS = [
  { label: "7 Gün", days: 7 },
  { label: "30 Gün", days: 30 },
  { label: "90 Gün", days: 90 },
  { label: "6 Ay", days: 180 }
];
function PerformanceDateFilter({ range, onRangeChange }) {
  const activeDays = Math.round((range.to.getTime() - range.from.getTime()) / (1e3 * 60 * 60 * 24));
  return /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center gap-2", children: [
    PRESETS.map((preset) => /* @__PURE__ */ jsx(
      Button,
      {
        variant: activeDays === preset.days ? "default" : "outline",
        size: "sm",
        className: activeDays === preset.days ? "bg-[#6C50FF] hover:bg-[#5A42E0]" : "",
        onClick: () => onRangeChange({ from: subDays(/* @__PURE__ */ new Date(), preset.days), to: /* @__PURE__ */ new Date() }),
        children: preset.label
      },
      preset.days
    )),
    /* @__PURE__ */ jsxs(Popover, { children: [
      /* @__PURE__ */ jsx(PopoverTrigger, { asChild: true, children: /* @__PURE__ */ jsxs(Button, { variant: "outline", size: "sm", className: "gap-2", children: [
        /* @__PURE__ */ jsx(CalendarIcon, { className: "h-4 w-4" }),
        format(range.from, "dd MMM", { locale: tr }),
        " – ",
        format(range.to, "dd MMM yyyy", { locale: tr })
      ] }) }),
      /* @__PURE__ */ jsx(PopoverContent, { className: "w-auto p-0", align: "end", children: /* @__PURE__ */ jsx(
        Calendar,
        {
          mode: "range",
          selected: { from: range.from, to: range.to },
          onSelect: (r) => {
            if ((r == null ? void 0 : r.from) && (r == null ? void 0 : r.to)) onRangeChange({ from: r.from, to: r.to });
            else if (r == null ? void 0 : r.from) onRangeChange({ from: r.from, to: r.from });
          },
          numberOfMonths: 2,
          disabled: { after: /* @__PURE__ */ new Date() },
          locale: tr
        }
      ) })
    ] })
  ] });
}
const RANGE_LABELS = {
  7: "Son 7 Gün",
  30: "Son 30 Gün",
  90: "Son 90 Gün",
  180: "Son 6 Ay"
};
function GooglePerformance() {
  const { activeBusiness } = useBusiness();
  const navigate = useNavigate();
  const [range, setRange] = useState({ from: subDays(/* @__PURE__ */ new Date(), 30), to: /* @__PURE__ */ new Date() });
  const dateRange = useMemo(
    () => ({ startDate: format(range.from, "yyyy-MM-dd"), endDate: format(range.to, "yyyy-MM-dd") }),
    [range]
  );
  const activeDays = Math.round((range.to.getTime() - range.from.getTime()) / (1e3 * 60 * 60 * 24));
  const rangeLabel = RANGE_LABELS[activeDays] || `${activeDays} Gün`;
  const { data, isLoading, error, refetch } = useGooglePerformance(dateRange);
  if (!(activeBusiness == null ? void 0 : activeBusiness.google_location_id)) {
    return /* @__PURE__ */ jsx("div", { className: "max-w-4xl mx-auto p-8 flex items-center justify-center min-h-[60vh]", children: /* @__PURE__ */ jsxs(Card, { className: "rounded-xl p-10 text-center max-w-md w-full", children: [
      /* @__PURE__ */ jsx(Link, { className: "h-12 w-12 mx-auto text-[#6C50FF]/60 mb-4" }),
      /* @__PURE__ */ jsx("h2", { className: "text-xl font-semibold text-foreground mb-2", children: "Google Business Profile Bağlayın" }),
      /* @__PURE__ */ jsx("p", { className: "text-muted-foreground text-sm mb-6", children: "Performans verilerinizi görüntülemek için Google Business Profile hesabınızı bağlayın." }),
      /* @__PURE__ */ jsx(Button, { className: "bg-[#6C50FF] hover:bg-[#5A42E0]", onClick: () => navigate("/settings"), children: "Bağla" })
    ] }) });
  }
  if (isLoading) {
    return /* @__PURE__ */ jsxs("div", { className: "max-w-7xl mx-auto p-6 md:p-8 space-y-6", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h1", { className: "text-2xl font-semibold text-foreground", children: "Google Performans" }),
        /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground mt-1", children: "Google performans verileri alınıyor…" })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4", children: [1, 2, 3, 4].map((i) => /* @__PURE__ */ jsx(Card, { className: "rounded-xl", children: /* @__PURE__ */ jsxs(CardContent, { className: "p-6 space-y-3", children: [
        /* @__PURE__ */ jsx(Skeleton, { className: "h-10 w-10 rounded-xl" }),
        /* @__PURE__ */ jsx(Skeleton, { className: "h-4 w-24" }),
        /* @__PURE__ */ jsx(Skeleton, { className: "h-8 w-32" })
      ] }) }, i)) }),
      /* @__PURE__ */ jsx(Skeleton, { className: "h-80 w-full rounded-xl" }),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6", children: [
        /* @__PURE__ */ jsx(Skeleton, { className: "h-72 w-full rounded-xl" }),
        /* @__PURE__ */ jsx(Skeleton, { className: "h-72 w-full rounded-xl" })
      ] })
    ] });
  }
  if (error || !data) {
    return /* @__PURE__ */ jsx("div", { className: "max-w-4xl mx-auto p-8 flex items-center justify-center min-h-[60vh]", children: /* @__PURE__ */ jsxs(Card, { className: "rounded-xl p-10 text-center max-w-md w-full", children: [
      /* @__PURE__ */ jsx(AlertCircle, { className: "h-12 w-12 mx-auto text-destructive mb-4" }),
      /* @__PURE__ */ jsx("h2", { className: "text-xl font-semibold text-foreground mb-2", children: "Veri Yüklenemedi" }),
      /* @__PURE__ */ jsx("p", { className: "text-muted-foreground text-sm mb-6", children: (error == null ? void 0 : error.message) || "Google bağlantınızda bir sorun var. Lütfen yeniden bağlanın." }),
      /* @__PURE__ */ jsxs(Button, { variant: "outline", onClick: () => refetch(), className: "gap-2", children: [
        /* @__PURE__ */ jsx(RefreshCcw, { className: "h-4 w-4" }),
        "Tekrar Dene"
      ] })
    ] }) });
  }
  return /* @__PURE__ */ jsxs("div", { className: "max-w-7xl mx-auto p-6 md:p-8 space-y-6", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex flex-col md:flex-row md:items-end md:justify-between gap-4", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h1", { className: "text-2xl font-semibold text-foreground", children: "📊 Google Performans" }),
        /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground mt-1", children: activeBusiness.name })
      ] }),
      /* @__PURE__ */ jsx(PerformanceDateFilter, { range, onRangeChange: setRange })
    ] }),
    /* @__PURE__ */ jsx(PerformanceSummaryCards, { data }),
    /* @__PURE__ */ jsx(ImpressionsChart, { data, rangeLabel }),
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6", children: [
      /* @__PURE__ */ jsx(ActionsChart, { data }),
      /* @__PURE__ */ jsx(SearchKeywordsTable, { keywords: data.searchKeywords })
    ] })
  ] });
}
export {
  GooglePerformance as default
};
