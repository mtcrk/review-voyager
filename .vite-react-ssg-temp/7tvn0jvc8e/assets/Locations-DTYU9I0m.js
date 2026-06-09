import { jsx, jsxs } from "react/jsx-runtime";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Building2, Star, MessageSquare, BarChart3, Trophy, AlertTriangle, TrendingUp, TrendingDown, Clock, MapPin, Loader2, RefreshCw, Plus } from "lucide-react";
import { m as Badge, B as Button, s as supabase, a as useBusiness, t as toast$1 } from "../main.mjs";
import { u as useMultiLocationData } from "./useMultiLocationData-BhPpGhxg.js";
import { C as Card, c as CardContent, a as CardHeader, e as CardTitle } from "./card-vx9BCW0t.js";
import { P as Progress } from "./progress-LK13s5oA.js";
import { ResponsiveContainer, LineChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Line } from "recharts";
import { toast } from "sonner";
import { B as BusinessOnboarding } from "./BusinessOnboarding-D7tyeIp4.js";
import "vite-react-ssg";
import "@radix-ui/react-toast";
import "class-variance-authority";
import "clsx";
import "tailwind-merge";
import "next-themes";
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
import "./ratingScale-DXJYGEIV.js";
import "@radix-ui/react-progress";
import "./dialog-CFYcafO1.js";
import "./label-Dr59vwVb.js";
import "@radix-ui/react-label";
import "./alert-BbdwpNV6.js";
function LocationOverviewStats({ locations }) {
  const totalLocations = locations.length;
  const totalReviews = locations.reduce((s, l) => s + l.totalReviews, 0);
  const overallRating = totalReviews > 0 ? Math.round(
    locations.reduce((s, l) => s + l.averageRating * l.totalReviews, 0) / totalReviews * 10
  ) / 10 : 0;
  locations.reduce((s, l) => s + l.pendingReplies, 0);
  const avgResponseRate = totalLocations > 0 ? Math.round(locations.reduce((s, l) => s + l.responseRate, 0) / totalLocations) : 0;
  const stats = [
    {
      label: "Toplam Lokasyon",
      value: totalLocations,
      icon: Building2,
      color: "text-primary",
      bg: "bg-primary/10"
    },
    {
      label: "Genel Puan",
      value: `${overallRating} ★`,
      icon: Star,
      color: "text-amber-600",
      bg: "bg-amber-50"
    },
    {
      label: "Toplam Yorum",
      value: totalReviews.toLocaleString(),
      icon: MessageSquare,
      color: "text-blue-600",
      bg: "bg-blue-50"
    },
    {
      label: "Ort. Yanıt Oranı",
      value: `${avgResponseRate}%`,
      icon: BarChart3,
      color: "text-emerald-600",
      bg: "bg-emerald-50"
    }
  ];
  return /* @__PURE__ */ jsx("div", { className: "grid grid-cols-2 lg:grid-cols-4 gap-4", children: stats.map((stat) => /* @__PURE__ */ jsx(Card, { className: "border-border/60", children: /* @__PURE__ */ jsxs(CardContent, { className: "p-5", children: [
    /* @__PURE__ */ jsx("div", { className: "flex items-center gap-3 mb-2", children: /* @__PURE__ */ jsx("div", { className: `p-2 rounded-lg ${stat.bg}`, children: /* @__PURE__ */ jsx(stat.icon, { className: `h-4 w-4 ${stat.color}` }) }) }),
    /* @__PURE__ */ jsx("p", { className: "text-2xl font-bold text-foreground", children: stat.value }),
    /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground mt-0.5", children: stat.label })
  ] }) }, stat.label)) });
}
function LocationHighlights({ locations }) {
  if (locations.length < 2) return null;
  const sorted = [...locations].sort((a, b) => b.averageRating - a.averageRating);
  const best = sorted[0];
  const worst = sorted[sorted.length - 1];
  const mostReviewed = [...locations].sort((a, b) => b.weeklyReviews - a.weeklyReviews)[0];
  const needsAttention = [...locations].sort((a, b) => b.pendingReplies - a.pendingReplies)[0];
  const cards = [
    {
      label: "En Yüksek Puan",
      icon: Trophy,
      value: best.name,
      metric: `${best.averageRating} ★`,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
      border: "border-emerald-100"
    },
    {
      label: "Dikkat Gerektiren",
      icon: AlertTriangle,
      value: worst.name,
      metric: `${worst.averageRating} ★`,
      color: "text-amber-600",
      bg: "bg-amber-50",
      border: "border-amber-100"
    },
    {
      label: "Bu Hafta En Aktif",
      icon: TrendingUp,
      value: mostReviewed.name,
      metric: `${mostReviewed.weeklyReviews} yorum`,
      color: "text-blue-600",
      bg: "bg-blue-50",
      border: "border-blue-100"
    },
    {
      label: "En Çok Bekleyen",
      icon: TrendingDown,
      value: needsAttention.name,
      metric: `${needsAttention.pendingReplies} bekleyen`,
      color: "text-rose-600",
      bg: "bg-rose-50",
      border: "border-rose-100"
    }
  ];
  return /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4", children: cards.map((card) => /* @__PURE__ */ jsx(Card, { className: `border ${card.border} ${card.bg}/30`, children: /* @__PURE__ */ jsxs(CardContent, { className: "p-5", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 mb-3", children: [
      /* @__PURE__ */ jsx("div", { className: `p-2 rounded-lg ${card.bg}`, children: /* @__PURE__ */ jsx(card.icon, { className: `h-4 w-4 ${card.color}` }) }),
      /* @__PURE__ */ jsx("span", { className: "text-xs font-medium text-muted-foreground uppercase tracking-wider", children: card.label })
    ] }),
    /* @__PURE__ */ jsx("p", { className: "font-semibold text-foreground text-sm truncate", children: card.value }),
    /* @__PURE__ */ jsx("p", { className: `text-lg font-bold ${card.color} mt-0.5`, children: card.metric })
  ] }) }, card.label)) });
}
function LocationComparisonTable({ locations, onSelectLocation }) {
  const sorted = [...locations].sort((a, b) => b.averageRating - a.averageRating);
  return /* @__PURE__ */ jsxs(Card, { children: [
    /* @__PURE__ */ jsx(CardHeader, { className: "pb-3", children: /* @__PURE__ */ jsxs(CardTitle, { className: "text-base font-semibold flex items-center gap-2", children: [
      /* @__PURE__ */ jsx(TrendingUp, { className: "h-4 w-4 text-primary" }),
      "Lokasyon Karşılaştırması"
    ] }) }),
    /* @__PURE__ */ jsx(CardContent, { className: "p-0", children: /* @__PURE__ */ jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxs("table", { className: "w-full text-sm", children: [
      /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", { className: "border-b border-border bg-muted/30", children: [
        /* @__PURE__ */ jsx("th", { className: "text-left px-5 py-3 font-medium text-muted-foreground", children: "Lokasyon" }),
        /* @__PURE__ */ jsx("th", { className: "text-center px-4 py-3 font-medium text-muted-foreground", children: "Puan" }),
        /* @__PURE__ */ jsx("th", { className: "text-center px-4 py-3 font-medium text-muted-foreground", children: "Toplam Yorum" }),
        /* @__PURE__ */ jsx("th", { className: "text-center px-4 py-3 font-medium text-muted-foreground", children: "Bu Hafta" }),
        /* @__PURE__ */ jsx("th", { className: "text-center px-4 py-3 font-medium text-muted-foreground", children: "Yanıt Oranı" }),
        /* @__PURE__ */ jsx("th", { className: "text-center px-4 py-3 font-medium text-muted-foreground", children: "Bekleyen" }),
        /* @__PURE__ */ jsx("th", { className: "text-center px-4 py-3 font-medium text-muted-foreground", children: "Duygu" })
      ] }) }),
      /* @__PURE__ */ jsx("tbody", { children: sorted.map((loc, i) => {
        const positiveRatio = loc.totalReviews > 0 ? Math.round(loc.sentimentBreakdown.positive / loc.totalReviews * 100) : 0;
        return /* @__PURE__ */ jsxs(
          "tr",
          {
            onClick: () => onSelectLocation(loc.id),
            className: "border-b border-border/50 hover:bg-muted/20 cursor-pointer transition-colors",
            children: [
              /* @__PURE__ */ jsx("td", { className: "px-5 py-4", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
                /* @__PURE__ */ jsx("div", { className: "w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary", children: i + 1 }),
                /* @__PURE__ */ jsxs("div", { children: [
                  /* @__PURE__ */ jsx("p", { className: "font-medium text-foreground", children: loc.name }),
                  loc.city && /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: loc.city })
                ] })
              ] }) }),
              /* @__PURE__ */ jsx("td", { className: "text-center px-4 py-4", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-center gap-1", children: [
                /* @__PURE__ */ jsx(Star, { className: "h-3.5 w-3.5 text-amber-400 fill-amber-400" }),
                /* @__PURE__ */ jsx("span", { className: "font-semibold text-foreground", children: loc.averageRating })
              ] }) }),
              /* @__PURE__ */ jsx("td", { className: "text-center px-4 py-4", children: /* @__PURE__ */ jsx("span", { className: "font-medium text-foreground", children: loc.totalReviews }) }),
              /* @__PURE__ */ jsx("td", { className: "text-center px-4 py-4", children: /* @__PURE__ */ jsxs(Badge, { variant: loc.weeklyReviews > 0 ? "default" : "secondary", className: "text-xs", children: [
                "+",
                loc.weeklyReviews
              ] }) }),
              /* @__PURE__ */ jsx("td", { className: "text-center px-4 py-4", children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center gap-1", children: [
                /* @__PURE__ */ jsxs("span", { className: "text-xs font-medium text-foreground", children: [
                  loc.responseRate,
                  "%"
                ] }),
                /* @__PURE__ */ jsx(Progress, { value: loc.responseRate, className: "w-16 h-1.5" })
              ] }) }),
              /* @__PURE__ */ jsx("td", { className: "text-center px-4 py-4", children: loc.pendingReplies > 0 ? /* @__PURE__ */ jsxs(Badge, { variant: "destructive", className: "text-xs", children: [
                /* @__PURE__ */ jsx(Clock, { className: "h-3 w-3 mr-1" }),
                loc.pendingReplies
              ] }) : /* @__PURE__ */ jsx(Badge, { variant: "outline", className: "text-xs text-emerald-600 border-emerald-200 bg-emerald-50", children: "✓ Tamam" }) }),
              /* @__PURE__ */ jsx("td", { className: "text-center px-4 py-4", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-center gap-0.5", children: [
                /* @__PURE__ */ jsx(
                  "div",
                  {
                    className: "h-2 rounded-l-full bg-emerald-400",
                    style: { width: `${Math.max(positiveRatio * 0.6, 4)}px` }
                  }
                ),
                /* @__PURE__ */ jsx(
                  "div",
                  {
                    className: "h-2 bg-amber-300",
                    style: {
                      width: `${Math.max(
                        loc.sentimentBreakdown.neutral / Math.max(loc.totalReviews, 1) * 100 * 0.6,
                        4
                      )}px`
                    }
                  }
                ),
                /* @__PURE__ */ jsx(
                  "div",
                  {
                    className: "h-2 rounded-r-full bg-rose-400",
                    style: {
                      width: `${Math.max(
                        loc.sentimentBreakdown.negative / Math.max(loc.totalReviews, 1) * 100 * 0.6,
                        4
                      )}px`
                    }
                  }
                )
              ] }) })
            ]
          },
          loc.id
        );
      }) })
    ] }) }) })
  ] });
}
const LINE_COLORS = [
  "hsl(255, 75%, 70%)",
  // primary purple
  "hsl(215, 85%, 65%)",
  // blue
  "hsl(160, 60%, 50%)",
  // emerald
  "hsl(35, 90%, 55%)",
  // amber
  "hsl(340, 70%, 60%)",
  // rose
  "hsl(280, 60%, 65%)",
  // violet
  "hsl(190, 70%, 50%)",
  // cyan
  "hsl(15, 80%, 55%)"
  // orange
];
function LocationTrendChart({ locations }) {
  const chartData = useMemo(() => {
    const allDates = /* @__PURE__ */ new Set();
    locations.forEach((loc) => {
      loc.ratingTrend.forEach((t) => allDates.add(t.date));
    });
    const sortedDates = Array.from(allDates).sort();
    return sortedDates.map((date) => {
      const point = {
        date: date.slice(5)
        // "MM-DD"
      };
      locations.forEach((loc) => {
        const entry = loc.ratingTrend.find((t) => t.date === date);
        if (entry) {
          point[loc.name] = entry.avgRating;
        }
      });
      return point;
    });
  }, [locations]);
  if (chartData.length === 0) {
    return /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsx(CardContent, { className: "p-8 text-center text-muted-foreground", children: "Trend verisi henüz yeterli değil." }) });
  }
  return /* @__PURE__ */ jsxs(Card, { children: [
    /* @__PURE__ */ jsx(CardHeader, { className: "pb-2", children: /* @__PURE__ */ jsx(CardTitle, { className: "text-base font-semibold", children: "Puan Trendi (Son 30 Gün)" }) }),
    /* @__PURE__ */ jsx(CardContent, { className: "pt-2", children: /* @__PURE__ */ jsx("div", { className: "h-[300px]", children: /* @__PURE__ */ jsx(ResponsiveContainer, { width: "100%", height: "100%", children: /* @__PURE__ */ jsxs(LineChart, { data: chartData, margin: { top: 5, right: 20, left: 0, bottom: 5 }, children: [
      /* @__PURE__ */ jsx(CartesianGrid, { strokeDasharray: "3 3", stroke: "hsl(220, 13%, 92%)" }),
      /* @__PURE__ */ jsx(
        XAxis,
        {
          dataKey: "date",
          tick: { fontSize: 11, fill: "hsl(217, 11%, 50%)" },
          tickLine: false,
          axisLine: { stroke: "hsl(220, 13%, 92%)" }
        }
      ),
      /* @__PURE__ */ jsx(
        YAxis,
        {
          domain: [1, 5],
          tick: { fontSize: 11, fill: "hsl(217, 11%, 50%)" },
          tickLine: false,
          axisLine: false,
          width: 30
        }
      ),
      /* @__PURE__ */ jsx(
        Tooltip,
        {
          contentStyle: {
            borderRadius: "8px",
            border: "1px solid hsl(220, 13%, 92%)",
            boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
            fontSize: "12px"
          }
        }
      ),
      /* @__PURE__ */ jsx(
        Legend,
        {
          iconType: "circle",
          wrapperStyle: { fontSize: "12px", paddingTop: "8px" }
        }
      ),
      locations.map((loc, i) => /* @__PURE__ */ jsx(
        Line,
        {
          type: "monotone",
          dataKey: loc.name,
          stroke: LINE_COLORS[i % LINE_COLORS.length],
          strokeWidth: 2.5,
          dot: { r: 3, strokeWidth: 0, fill: LINE_COLORS[i % LINE_COLORS.length] },
          activeDot: { r: 5, strokeWidth: 2, stroke: "#fff" },
          connectNulls: true
        },
        loc.id
      ))
    ] }) }) }) })
  ] });
}
function LocationMapView({ locations, onRefresh }) {
  const [syncing, setSyncing] = useState(false);
  const [selectedLocationId, setSelectedLocationId] = useState(null);
  const locationsWithCoords = locations.filter((l) => l.lat && l.lng);
  const selectedLocation = locationsWithCoords.find((l) => l.id === selectedLocationId) || locationsWithCoords[0];
  const handleSyncLocations = async () => {
    setSyncing(true);
    try {
      const googleLocations = locations.filter((l) => l.id);
      if (!googleLocations.length) {
        toast.error("Google bağlantılı işletme bulunamadı");
        return;
      }
      const results = await Promise.allSettled(
        googleLocations.map(
          (l) => supabase.functions.invoke("google-business-info", {
            body: { business_id: l.id }
          })
        )
      );
      const successCount = results.filter((r) => r.status === "fulfilled").length;
      toast.success(`${successCount} işletmenin bilgileri güncellendi`);
      onRefresh == null ? void 0 : onRefresh();
    } catch (error) {
      console.error("Sync error:", error);
      toast.error("Bilgiler güncellenirken hata oluştu");
    } finally {
      setSyncing(false);
    }
  };
  if (locationsWithCoords.length === 0) {
    return /* @__PURE__ */ jsxs(Card, { children: [
      /* @__PURE__ */ jsx(CardHeader, { className: "pb-2", children: /* @__PURE__ */ jsxs(CardTitle, { className: "text-base font-semibold flex items-center gap-2", children: [
        /* @__PURE__ */ jsx(MapPin, { className: "h-4 w-4 text-primary" }),
        "Harita Görünümü"
      ] }) }),
      /* @__PURE__ */ jsx(CardContent, { children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center justify-center py-12 text-center", children: [
        /* @__PURE__ */ jsx("div", { className: "w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4", children: /* @__PURE__ */ jsx(MapPin, { className: "h-8 w-8 text-muted-foreground/50" }) }),
        /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground max-w-xs mb-4", children: "Lokasyon koordinatları henüz yok. Google Business'tan otomatik çekebilirsiniz." }),
        /* @__PURE__ */ jsxs(Button, { onClick: handleSyncLocations, disabled: syncing, variant: "outline", className: "gap-2", children: [
          syncing ? /* @__PURE__ */ jsx(Loader2, { className: "h-4 w-4 animate-spin" }) : /* @__PURE__ */ jsx(RefreshCw, { className: "h-4 w-4" }),
          syncing ? "Çekiliyor..." : "Google'dan Koordinatları Çek"
        ] })
      ] }) })
    ] });
  }
  const allMarkersUrl = locationsWithCoords.length === 1 ? `https://maps.google.com/maps?q=${locationsWithCoords[0].lat},${locationsWithCoords[0].lng}&z=14&output=embed` : selectedLocationId ? `https://maps.google.com/maps?q=${selectedLocation.lat},${selectedLocation.lng}&z=14&output=embed` : `https://maps.google.com/maps?q=${locationsWithCoords.map((l) => `${l.lat},${l.lng}`).join("|")}&z=6&output=embed`;
  return /* @__PURE__ */ jsxs(Card, { children: [
    /* @__PURE__ */ jsx(CardHeader, { className: "pb-2", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxs(CardTitle, { className: "text-base font-semibold flex items-center gap-2", children: [
        /* @__PURE__ */ jsx(MapPin, { className: "h-4 w-4 text-primary" }),
        "Harita Görünümü"
      ] }),
      selectedLocationId && locationsWithCoords.length > 1 && /* @__PURE__ */ jsx(
        Button,
        {
          variant: "ghost",
          size: "sm",
          onClick: () => setSelectedLocationId(null),
          className: "text-xs text-muted-foreground",
          children: "Tümünü Göster"
        }
      )
    ] }) }),
    /* @__PURE__ */ jsxs(CardContent, { className: "space-y-4", children: [
      /* @__PURE__ */ jsx("div", { className: "h-72 rounded-xl border border-border/60 overflow-hidden bg-muted/20", children: /* @__PURE__ */ jsx(
        "iframe",
        {
          title: "Lokasyon harita görünümü",
          src: allMarkersUrl,
          className: "w-full h-full",
          loading: "lazy",
          referrerPolicy: "no-referrer-when-downgrade"
        }
      ) }),
      /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-3", children: locationsWithCoords.map((loc) => {
        const isActive = selectedLocation.id === loc.id;
        return /* @__PURE__ */ jsxs(
          "button",
          {
            type: "button",
            onClick: () => setSelectedLocationId(loc.id),
            className: `flex items-start gap-3 p-3 rounded-xl border transition-colors text-left ${isActive ? "border-primary/40 bg-primary/10" : "border-border/60 bg-muted/20 hover:bg-muted/40"}`,
            children: [
              /* @__PURE__ */ jsx("div", { className: "w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0", children: /* @__PURE__ */ jsx(MapPin, { className: "h-5 w-5 text-primary" }) }),
              /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
                /* @__PURE__ */ jsx("p", { className: "font-medium text-foreground text-sm truncate", children: loc.name }),
                /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: loc.city || "Konum belirtilmedi" }),
                /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mt-1", children: [
                  /* @__PURE__ */ jsx(Star, { className: "h-3 w-3 text-primary fill-primary" }),
                  /* @__PURE__ */ jsx("span", { className: "text-xs font-semibold text-foreground", children: loc.averageRating }),
                  /* @__PURE__ */ jsxs("span", { className: "text-xs text-muted-foreground", children: [
                    "· ",
                    loc.totalReviews,
                    " yorum"
                  ] })
                ] })
              ] })
            ]
          },
          loc.id
        );
      }) })
    ] })
  ] });
}
function Locations() {
  const navigate = useNavigate();
  const { businesses, setActiveBusiness } = useBusiness();
  const { data: locations = [], isLoading, refetch } = useMultiLocationData();
  const [showAddBusiness, setShowAddBusiness] = useState(false);
  const handleSelectLocation = (id) => {
    const selected = businesses.find((b) => b.id === id);
    if (selected) {
      setActiveBusiness(selected);
      toast$1({
        title: `${selected.name} seçildi`,
        description: "Dashboard bu lokasyona göre güncellendi."
      });
      navigate("/dashboard");
    }
  };
  if (isLoading) {
    return /* @__PURE__ */ jsx("div", { className: "flex items-center justify-center min-h-[60vh]", children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center gap-3", children: [
      /* @__PURE__ */ jsx(Loader2, { className: "h-8 w-8 animate-spin text-primary" }),
      /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: "Lokasyonlar yükleniyor..." })
    ] }) });
  }
  if (locations.length === 0) {
    return /* @__PURE__ */ jsx("div", { className: "p-6 md:p-8", children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center justify-center min-h-[50vh] text-center", children: [
      /* @__PURE__ */ jsx("div", { className: "w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mb-6", children: /* @__PURE__ */ jsx(Building2, { className: "h-10 w-10 text-primary/60" }) }),
      /* @__PURE__ */ jsx("h2", { className: "text-xl font-semibold text-foreground mb-2", children: "Henüz lokasyon yok" }),
      /* @__PURE__ */ jsx("p", { className: "text-muted-foreground max-w-md mb-6", children: "İşletme ekleyerek çoklu lokasyon yönetimini kullanmaya başlayın. Her lokasyonun yorumlarını tek panelden takip edin." }),
      /* @__PURE__ */ jsxs(Button, { onClick: () => setShowAddBusiness(true), className: "gap-2", children: [
        /* @__PURE__ */ jsx(Plus, { className: "h-4 w-4" }),
        "İşletme Ekle"
      ] }),
      /* @__PURE__ */ jsx(
        BusinessOnboarding,
        {
          open: showAddBusiness,
          onBusinessCreated: () => {
            setShowAddBusiness(false);
            refetch();
          },
          onDismiss: () => setShowAddBusiness(false)
        }
      )
    ] }) });
  }
  return /* @__PURE__ */ jsxs("div", { className: "p-6 md:p-8 space-y-6 max-w-[1400px] mx-auto", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsxs("h1", { className: "text-2xl font-bold text-foreground flex items-center gap-3", children: [
          /* @__PURE__ */ jsx("div", { className: "p-2 rounded-xl bg-primary/10", children: /* @__PURE__ */ jsx(Building2, { className: "h-5 w-5 text-primary" }) }),
          "Lokasyonlar"
        ] }),
        /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground mt-1", children: "Tüm şubelerinizin performansını tek panelden yönetin" })
      ] }),
      /* @__PURE__ */ jsxs(Button, { variant: "outline", size: "sm", onClick: () => setShowAddBusiness(true), className: "gap-2", children: [
        /* @__PURE__ */ jsx(Plus, { className: "h-4 w-4" }),
        "Lokasyon Ekle"
      ] })
    ] }),
    /* @__PURE__ */ jsx(LocationOverviewStats, { locations }),
    /* @__PURE__ */ jsx(LocationHighlights, { locations }),
    /* @__PURE__ */ jsx(LocationComparisonTable, { locations, onSelectLocation: handleSelectLocation }),
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6", children: [
      /* @__PURE__ */ jsx(LocationTrendChart, { locations }),
      /* @__PURE__ */ jsx(LocationMapView, { locations, onRefresh: () => refetch() })
    ] }),
    /* @__PURE__ */ jsx(
      BusinessOnboarding,
      {
        open: showAddBusiness,
        onBusinessCreated: () => {
          setShowAddBusiness(false);
          refetch();
        },
        onDismiss: () => setShowAddBusiness(false)
      }
    )
  ] });
}
export {
  Locations as default
};
