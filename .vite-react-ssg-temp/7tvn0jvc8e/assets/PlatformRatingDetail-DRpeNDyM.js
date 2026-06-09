import { jsx, jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { Loader2, ArrowLeft, RefreshCw, Star, ExternalLink, TrendingUp, Trophy, Calendar, MessageSquare } from "lucide-react";
import { C as Card, c as CardContent, a as CardHeader, e as CardTitle } from "./card-vx9BCW0t.js";
import { a as useBusiness, s as supabase, B as Button, m as Badge, t as toast } from "../main.mjs";
import { u as useMultiLocationData } from "./useMultiLocationData-BhPpGhxg.js";
import { formatDistanceToNow } from "date-fns";
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
import "./ratingScale-DXJYGEIV.js";
const PLATFORM_META = {
  google: { label: "Google", dot: "bg-blue-500", idField: "place_id", buildUrl: (id) => `https://search.google.com/local/reviews?placeid=${id}` },
  booking: { label: "Booking.com", dot: "bg-indigo-500", idField: "booking_hotel_id", buildUrl: (id) => `https://www.booking.com/hotel/${id}.html` },
  tripadvisor: { label: "TripAdvisor", dot: "bg-emerald-500", idField: "tripadvisor_id" },
  hotelscom: { label: "Hotels.com", dot: "bg-rose-500", urlField: "hotelscom_url" },
  expedia: { label: "Expedia", dot: "bg-amber-500", idField: "expedia_hotel_id" },
  tripcom: { label: "Trip.com", dot: "bg-orange-500", idField: "tripcom_hotel_id" },
  trustpilot: { label: "Trustpilot", dot: "bg-teal-500", urlField: "trustpilot_url" }
};
function PlatformRatingDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { businesses, setActiveBusiness } = useBusiness();
  const { data: locations = [], isLoading } = useMultiLocationData();
  const location = locations.find((l) => l.id === id);
  const business = businesses.find((b) => b.id === id);
  const queryClient = useQueryClient();
  const [refreshing, setRefreshing] = useState(false);
  const { data: recentReviews = [] } = useQuery({
    queryKey: ["platform-detail-reviews", id],
    queryFn: async () => {
      if (!id) return [];
      const { data, error } = await supabase.from("reviews").select("id, reviewer_name, rating, text, platform, posted_at").eq("business_id", id).order("posted_at", { ascending: false }).limit(200);
      if (error) throw error;
      return data || [];
    },
    enabled: !!id
  });
  const { data: rankings = [] } = useQuery({
    queryKey: ["platform-rankings", id],
    queryFn: async () => {
      if (!id) return [];
      const { data, error } = await supabase.from("platform_rankings").select("*").eq("business_id", id);
      if (error) throw error;
      return data || [];
    },
    enabled: !!id
  });
  const handleRefreshRankings = async () => {
    if (!id) return;
    setRefreshing(true);
    try {
      const { error } = await supabase.functions.invoke("fetch-platform-ranking", {
        body: { business_id: id }
      });
      if (error) throw error;
      await queryClient.invalidateQueries({ queryKey: ["platform-rankings", id] });
      toast({ title: "Sıralama güncellendi", description: "Platform sıralamaları yenilendi." });
    } catch (e) {
      toast({
        title: "Hata",
        description: e.message || "Sıralama çekilemedi.",
        variant: "destructive"
      });
    } finally {
      setRefreshing(false);
    }
  };
  if (isLoading) {
    return /* @__PURE__ */ jsx("div", { className: "flex items-center justify-center min-h-[60vh]", children: /* @__PURE__ */ jsx(Loader2, { className: "h-8 w-8 animate-spin text-primary" }) });
  }
  if (!location || !business) {
    return /* @__PURE__ */ jsxs("div", { className: "p-8 text-center text-muted-foreground", children: [
      "Lokasyon bulunamadı.",
      /* @__PURE__ */ jsx("div", { className: "mt-4", children: /* @__PURE__ */ jsxs(Button, { variant: "outline", onClick: () => navigate("/locations/platform-ratings"), children: [
        /* @__PURE__ */ jsx(ArrowLeft, { className: "h-4 w-4 mr-2" }),
        " Geri Dön"
      ] }) })
    ] });
  }
  const platforms = Object.entries(location.platformBreakdown).filter(([, v]) => v.count > 0).sort((a, b) => b[1].avgRating - a[1].avgRating);
  const goToReviews = (platformKey) => {
    setActiveBusiness(business);
    navigate(`/reviews?platform=${platformKey}`);
  };
  const getExternalUrl = (platformKey) => {
    const meta = PLATFORM_META[platformKey];
    if (!meta) return null;
    if (meta.urlField) return business[meta.urlField] || null;
    if (meta.idField && meta.buildUrl) {
      const val = business[meta.idField];
      return val ? meta.buildUrl(val) : null;
    }
    return null;
  };
  return /* @__PURE__ */ jsxs("div", { className: "p-6 md:p-8 space-y-6 max-w-[1400px] mx-auto", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between gap-4 flex-wrap", children: [
      /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsxs(Button, { variant: "ghost", size: "sm", onClick: () => navigate("/locations/platform-ratings"), className: "-ml-2", children: [
          /* @__PURE__ */ jsx(ArrowLeft, { className: "h-4 w-4 mr-1" }),
          " Platform Puanları"
        ] }),
        /* @__PURE__ */ jsx("h1", { className: "text-2xl font-bold text-foreground", children: location.name }),
        location.city && /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: location.city }),
        /* @__PURE__ */ jsxs(
          Button,
          {
            variant: "outline",
            size: "sm",
            onClick: handleRefreshRankings,
            disabled: refreshing,
            className: "mt-2",
            children: [
              refreshing ? /* @__PURE__ */ jsx(Loader2, { className: "h-3.5 w-3.5 mr-1.5 animate-spin" }) : /* @__PURE__ */ jsx(RefreshCw, { className: "h-3.5 w-3.5 mr-1.5" }),
              "Sıralamayı Yenile"
            ]
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-6 bg-card border rounded-xl px-5 py-3", children: [
        /* @__PURE__ */ jsxs("div", { className: "text-center", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1 justify-center", children: [
            /* @__PURE__ */ jsx(Star, { className: "h-4 w-4 text-amber-500 fill-amber-500" }),
            /* @__PURE__ */ jsx("span", { className: "text-2xl font-bold", children: location.averageRating })
          ] }),
          /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground mt-0.5", children: "Genel Ortalama" })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "h-10 w-px bg-border" }),
        /* @__PURE__ */ jsxs("div", { className: "text-center", children: [
          /* @__PURE__ */ jsx("p", { className: "text-2xl font-bold", children: location.totalReviews }),
          /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground mt-0.5", children: "Toplam Yorum" })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "h-10 w-px bg-border" }),
        /* @__PURE__ */ jsxs("div", { className: "text-center", children: [
          /* @__PURE__ */ jsxs("p", { className: "text-2xl font-bold", children: [
            "%",
            location.responseRate
          ] }),
          /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground mt-0.5", children: "Yanıt Oranı" })
        ] })
      ] })
    ] }),
    platforms.length === 0 ? /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsx(CardContent, { className: "py-12 text-center text-muted-foreground", children: "Bu lokasyon için henüz platform verisi yok." }) }) : /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4", children: platforms.map(([key, stats]) => {
      var _a, _b;
      const meta = PLATFORM_META[key] || { label: key, dot: "bg-muted" };
      const platformReviews = recentReviews.filter((r) => (r.platform || "google").toLowerCase() === key);
      const latest = platformReviews.slice(0, 3);
      const externalUrl = getExternalUrl(key);
      const dist = [5, 4, 3, 2, 1].map((star) => ({
        star,
        count: platformReviews.filter((r) => r.rating === star).length
      }));
      const maxCount = Math.max(...dist.map((d) => d.count), 1);
      const ranking = rankings.find((r) => r.platform === key);
      return /* @__PURE__ */ jsxs(Card, { className: "hover:shadow-md transition-shadow", children: [
        /* @__PURE__ */ jsx(CardHeader, { className: "pb-3 border-b", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsxs(CardTitle, { className: "text-base flex items-center gap-2", children: [
            /* @__PURE__ */ jsx("span", { className: `w-2 h-2 rounded-full ${meta.dot}` }),
            meta.label
          ] }),
          externalUrl && /* @__PURE__ */ jsx(
            "a",
            {
              href: externalUrl,
              target: "_blank",
              rel: "noopener noreferrer",
              className: "text-muted-foreground hover:text-primary transition-colors",
              title: "Platformda aç",
              children: /* @__PURE__ */ jsx(ExternalLink, { className: "h-4 w-4" })
            }
          )
        ] }) }),
        /* @__PURE__ */ jsxs(CardContent, { className: "pt-4 space-y-4", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-end justify-between", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5", children: [
                /* @__PURE__ */ jsx(Star, { className: "h-5 w-5 text-amber-500 fill-amber-500" }),
                /* @__PURE__ */ jsx("span", { className: "text-3xl font-bold", children: stats.avgRating }),
                /* @__PURE__ */ jsx("span", { className: "text-sm text-muted-foreground", children: "/ 5" })
              ] }),
              /* @__PURE__ */ jsxs("p", { className: "text-xs text-muted-foreground mt-1", children: [
                stats.count,
                " yorum"
              ] })
            ] }),
            /* @__PURE__ */ jsxs(Badge, { variant: "secondary", className: "text-xs", children: [
              /* @__PURE__ */ jsx(TrendingUp, { className: "h-3 w-3 mr-1" }),
              Math.round(stats.count / location.totalReviews * 100),
              "%"
            ] })
          ] }),
          ranking && (ranking.rank || ((_a = ranking.raw) == null ? void 0 : _a.property_rating) || ((_b = ranking.raw) == null ? void 0 : _b.property_review_count)) && /* @__PURE__ */ jsxs("div", { className: "space-y-2 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900", children: [
            ranking.rank && ranking.total_in_area && /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-2", children: [
              /* @__PURE__ */ jsx(Trophy, { className: "h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" }),
              /* @__PURE__ */ jsxs("p", { className: "text-xs font-semibold text-foreground", children: [
                ranking.area_name || location.city || "Bölge",
                "'de ",
                /* @__PURE__ */ jsx("span", { className: "text-amber-700 dark:text-amber-300", children: ranking.total_in_area }),
                " otel arasında ",
                /* @__PURE__ */ jsxs("span", { className: "text-amber-700 dark:text-amber-300", children: [
                  ranking.rank,
                  "."
                ] }),
                " sırada"
              ] })
            ] }),
            (() => {
              const raw = ranking.raw || {};
              const items = [];
              if (raw.property_rating != null) {
                const scale = raw.rating_scale || 5;
                items.push({ label: "Platform puanı", value: `${raw.property_rating} / ${scale}` });
              }
              if (raw.property_review_count != null) {
                items.push({ label: "Platform yorum sayısı", value: Number(raw.property_review_count).toLocaleString("tr-TR") });
              }
              if (raw.property_category) {
                items.push({ label: "Kategori", value: raw.property_category });
              }
              if (raw.award) {
                items.push({ label: "Ödül", value: raw.award });
              }
              if (items.length === 0) return null;
              return /* @__PURE__ */ jsx("div", { className: "grid grid-cols-2 gap-x-3 gap-y-1.5 pl-6", children: items.map((it) => /* @__PURE__ */ jsxs("div", { className: "text-[11px]", children: [
                /* @__PURE__ */ jsx("p", { className: "text-muted-foreground", children: it.label }),
                /* @__PURE__ */ jsx("p", { className: "font-medium text-foreground truncate", children: it.value })
              ] }, it.label)) });
            })(),
            /* @__PURE__ */ jsxs("p", { className: "text-[10px] text-muted-foreground pl-6", children: [
              "Güncellendi: ",
              formatDistanceToNow(new Date(ranking.fetched_at), { addSuffix: true, locale: tr })
            ] })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "space-y-1", children: dist.map((d) => /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-xs", children: [
            /* @__PURE__ */ jsx("span", { className: "w-3 text-muted-foreground", children: d.star }),
            /* @__PURE__ */ jsx(Star, { className: "h-2.5 w-2.5 text-amber-400 fill-amber-400 shrink-0" }),
            /* @__PURE__ */ jsx("div", { className: "flex-1 h-1.5 bg-muted rounded-full overflow-hidden", children: /* @__PURE__ */ jsx(
              "div",
              {
                className: "h-full bg-amber-400 rounded-full",
                style: { width: `${d.count / maxCount * 100}%` }
              }
            ) }),
            /* @__PURE__ */ jsx("span", { className: "w-6 text-right text-muted-foreground", children: d.count })
          ] }, d.star)) }),
          latest.length > 0 && /* @__PURE__ */ jsxs("div", { className: "space-y-2 pt-2 border-t", children: [
            /* @__PURE__ */ jsxs("p", { className: "text-xs font-medium text-muted-foreground flex items-center gap-1", children: [
              /* @__PURE__ */ jsx(Calendar, { className: "h-3 w-3" }),
              " Son Yorumlar"
            ] }),
            latest.map((r) => /* @__PURE__ */ jsxs("div", { className: "text-xs space-y-0.5", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
                /* @__PURE__ */ jsx("span", { className: "font-medium text-foreground truncate", children: r.reviewer_name }),
                /* @__PURE__ */ jsx("div", { className: "flex items-center gap-0.5 shrink-0", children: Array.from({ length: r.rating }).map((_, i) => /* @__PURE__ */ jsx(Star, { className: "h-2.5 w-2.5 text-amber-400 fill-amber-400" }, i)) })
              ] }),
              r.text && /* @__PURE__ */ jsx("p", { className: "text-muted-foreground line-clamp-2", children: r.text }),
              /* @__PURE__ */ jsx("p", { className: "text-[10px] text-muted-foreground/70", children: formatDistanceToNow(new Date(r.posted_at), { addSuffix: true, locale: tr }) })
            ] }, r.id))
          ] }),
          /* @__PURE__ */ jsxs(
            Button,
            {
              variant: "outline",
              size: "sm",
              className: "w-full",
              onClick: () => goToReviews(key),
              children: [
                /* @__PURE__ */ jsx(MessageSquare, { className: "h-3.5 w-3.5 mr-1.5" }),
                "Tüm ",
                meta.label,
                " Yorumları"
              ]
            }
          )
        ] })
      ] }, key);
    }) })
  ] });
}
export {
  PlatformRatingDetail as default
};
