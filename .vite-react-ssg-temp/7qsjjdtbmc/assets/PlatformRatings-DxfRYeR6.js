import { jsxs, jsx } from "react/jsx-runtime";
import { useNavigate } from "react-router-dom";
import { LayoutGrid, Star, Loader2, RefreshCw } from "lucide-react";
import { useState } from "react";
import { u as useMultiLocationData } from "./useMultiLocationData-BhPpGhxg.js";
import { C as Card, a as CardHeader, e as CardTitle, c as CardContent } from "./card-vx9BCW0t.js";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { s as supabase, B as Button } from "../main.mjs";
import { toast } from "sonner";
import "./ratingScale-DXJYGEIV.js";
import "vite-react-ssg";
import "@radix-ui/react-toast";
import "class-variance-authority";
import "clsx";
import "tailwind-merge";
import "next-themes";
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
const PLATFORMS = [
  { key: "google", label: "Google", dot: "bg-blue-500", scale: 5 },
  { key: "booking", label: "Booking", dot: "bg-indigo-500", scale: 10 },
  { key: "tripadvisor", label: "TripAdvisor", dot: "bg-emerald-500", scale: 5 },
  { key: "hotelscom", label: "Hotels.com", dot: "bg-rose-500", scale: 10 },
  { key: "expedia", label: "Expedia", dot: "bg-amber-500", scale: 10 },
  { key: "tripcom", label: "Trip.com", dot: "bg-orange-500", scale: 10 },
  { key: "trustpilot", label: "Trustpilot", dot: "bg-teal-500", scale: 5 }
];
const normalizeRatingForScale = (rating, scale) => {
  if (rating == null) return null;
  let normalized = Number(rating);
  if (scale === 10) {
    if (normalized > 10 && normalized <= 20) {
      normalized = normalized / 2;
    } else if (normalized > 0 && normalized <= 5) {
      normalized = normalized * 2;
    }
  }
  if (scale === 5 && normalized > 5 && normalized <= 10) {
    normalized = normalized / 2;
  }
  return Math.round(Math.min(normalized, scale) * 10) / 10;
};
function PlatformRatingsMatrix({ locations, onSelectLocation }) {
  const businessIds = locations.map((l) => l.id);
  const { data: overrides = [] } = useQuery({
    queryKey: ["platform-ratings-overrides", businessIds.join(",")],
    queryFn: async () => {
      if (businessIds.length === 0) return [];
      const { data, error } = await supabase.from("platform_ratings").select("business_id, platform, rating, rating_scale, review_count").in("business_id", businessIds);
      if (error) throw error;
      return data || [];
    },
    enabled: businessIds.length > 0
  });
  const overrideMap = /* @__PURE__ */ new Map();
  overrides.forEach((o) => overrideMap.set(`${o.business_id}:${o.platform}`, o));
  const activePlatforms = PLATFORMS.filter(
    (p) => locations.some(
      (l) => {
        var _a;
        return ((_a = l.platformBreakdown[p.key]) == null ? void 0 : _a.count) > 0 || overrideMap.has(`${l.id}:${p.key}`);
      }
    )
  );
  const sorted = [...locations].sort((a, b) => b.averageRating - a.averageRating);
  return /* @__PURE__ */ jsxs(Card, { children: [
    /* @__PURE__ */ jsxs(CardHeader, { className: "pb-3", children: [
      /* @__PURE__ */ jsxs(CardTitle, { className: "text-base font-semibold flex items-center gap-2", children: [
        /* @__PURE__ */ jsx(LayoutGrid, { className: "h-4 w-4 text-primary" }),
        "Platform Bazlı Puanlar"
      ] }),
      /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground mt-1", children: "Her otelin hangi platformda kaç puan aldığını tek bakışta görün" })
    ] }),
    /* @__PURE__ */ jsx(CardContent, { className: "p-0", children: /* @__PURE__ */ jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxs("table", { className: "w-full text-sm border-collapse", children: [
      /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", { className: "border-b border-border bg-muted/30", children: [
        /* @__PURE__ */ jsx("th", { className: "text-left px-5 py-3 font-medium text-muted-foreground sticky left-0 bg-muted/30 z-10 min-w-[220px]", children: "Lokasyon" }),
        activePlatforms.map((p) => /* @__PURE__ */ jsx(
          "th",
          {
            className: "text-center px-4 py-3 font-medium text-muted-foreground min-w-[110px]",
            children: /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-center gap-1.5", children: [
              /* @__PURE__ */ jsx("span", { className: `w-1.5 h-1.5 rounded-full ${p.dot}` }),
              p.label
            ] })
          },
          p.key
        ))
      ] }) }),
      /* @__PURE__ */ jsx("tbody", { children: sorted.map((loc, i) => /* @__PURE__ */ jsxs(
        "tr",
        {
          onClick: () => onSelectLocation(loc.id),
          className: "border-b border-border/50 hover:bg-muted/20 cursor-pointer transition-colors",
          children: [
            /* @__PURE__ */ jsx("td", { className: "px-5 py-4 sticky left-0 bg-card z-10", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
              /* @__PURE__ */ jsx("div", { className: "w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary shrink-0", children: i + 1 }),
              /* @__PURE__ */ jsxs("div", { className: "min-w-0", children: [
                /* @__PURE__ */ jsx("p", { className: "font-medium text-foreground truncate", children: loc.name }),
                loc.city && /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground truncate", children: loc.city })
              ] })
            ] }) }),
            activePlatforms.map((p) => {
              const override = overrideMap.get(`${loc.id}:${p.key}`);
              const data = loc.platformBreakdown[p.key];
              const scale = p.scale;
              let displayRating = null;
              if ((override == null ? void 0 : override.rating) != null) {
                displayRating = normalizeRatingForScale(override.rating, scale);
              } else if ((data == null ? void 0 : data.avgRating) != null) {
                displayRating = normalizeRatingForScale(data.avgRating, scale);
              }
              const officialCount = (override == null ? void 0 : override.review_count) ?? null;
              const fetchedCount = (data == null ? void 0 : data.count) ?? 0;
              const displayCount = officialCount ?? fetchedCount;
              if (displayRating == null && displayCount === 0) {
                return /* @__PURE__ */ jsx("td", { className: "text-center px-4 py-4", children: /* @__PURE__ */ jsx("span", { className: "text-xs text-muted-foreground/50", children: "—" }) }, p.key);
              }
              const hasGap = officialCount != null && fetchedCount < officialCount;
              const coveragePct = officialCount && officialCount > 0 ? Math.round(fetchedCount / officialCount * 100) : null;
              const lowCoverage = coveragePct != null && coveragePct < 50;
              return /* @__PURE__ */ jsx("td", { className: "text-center px-4 py-4", children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center gap-0.5", children: [
                /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1", children: [
                  /* @__PURE__ */ jsx(Star, { className: "h-3 w-3 text-amber-400 fill-amber-400" }),
                  /* @__PURE__ */ jsx("span", { className: "font-semibold text-foreground", children: displayRating != null ? displayRating : "—" }),
                  /* @__PURE__ */ jsxs("span", { className: "text-[10px] text-muted-foreground", children: [
                    "/",
                    scale
                  ] })
                ] }),
                hasGap ? /* @__PURE__ */ jsxs(
                  "span",
                  {
                    className: "text-[10px] text-muted-foreground",
                    title: `Booking'de toplam ${officialCount} yorum, biz ${fetchedCount} tanesini çektik (%${coveragePct})`,
                    children: [
                      officialCount,
                      " yorum",
                      /* @__PURE__ */ jsxs(
                        "span",
                        {
                          className: lowCoverage ? "ml-1 text-amber-600 font-medium" : "ml-1 text-muted-foreground/70",
                          children: [
                            "· ",
                            fetchedCount,
                            " çekildi"
                          ]
                        }
                      )
                    ]
                  }
                ) : /* @__PURE__ */ jsxs("span", { className: "text-[10px] text-muted-foreground", children: [
                  displayCount,
                  " yorum"
                ] })
              ] }) }, p.key);
            })
          ]
        },
        loc.id
      )) })
    ] }) }) })
  ] });
}
function PlatformRatings() {
  const navigate = useNavigate();
  const { data: locations = [], isLoading } = useMultiLocationData();
  const [refreshing, setRefreshing] = useState(false);
  const queryClient = useQueryClient();
  const handleSelectLocation = (id) => {
    navigate(`/locations/platform-ratings/${id}`);
  };
  const handleRefreshAll = async () => {
    var _a, _b, _c, _d;
    if (locations.length === 0) return;
    setRefreshing(true);
    const business_ids = locations.map((l) => l.id);
    try {
      const tid = toast.loading("Tüm platform puanları çekiliyor...");
      const [bookingRes, otherRes] = await Promise.all([
        supabase.functions.invoke("fetch-booking-overall-rating", {
          body: { business_ids }
        }),
        supabase.functions.invoke("fetch-platform-overall-rating", {
          body: {
            business_ids,
            platforms: ["tripadvisor", "hotelscom", "expedia", "tripcom"]
          }
        })
      ]);
      toast.dismiss(tid);
      let success = 0;
      let missing = 0;
      if (!bookingRes.error) {
        success += Object.keys(((_a = bookingRes.data) == null ? void 0 : _a.results) || {}).length;
        missing += Object.keys(((_b = bookingRes.data) == null ? void 0 : _b.errors) || {}).length;
      }
      if (!otherRes.error && ((_c = otherRes.data) == null ? void 0 : _c.results)) {
        for (const bizId of Object.keys(otherRes.data.results)) {
          success += Object.keys(otherRes.data.results[bizId] || {}).length;
          missing += Object.keys(((_d = otherRes.data.errors) == null ? void 0 : _d[bizId]) || {}).length;
        }
      }
      toast.success(
        `Puanlar güncellendi: ${success} başarılı${missing ? `, ${missing} eksik/atlandı` : ""}`
      );
      queryClient.invalidateQueries({ queryKey: ["platform-ratings-overrides"] });
    } catch (e) {
      toast.error((e == null ? void 0 : e.message) || "Puanlar güncellenemedi");
    } finally {
      setRefreshing(false);
    }
  };
  if (isLoading) {
    return /* @__PURE__ */ jsx("div", { className: "flex items-center justify-center min-h-[60vh]", children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center gap-3", children: [
      /* @__PURE__ */ jsx(Loader2, { className: "h-8 w-8 animate-spin text-primary" }),
      /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: "Platform puanları yükleniyor..." })
    ] }) });
  }
  return /* @__PURE__ */ jsxs("div", { className: "p-6 md:p-8 space-y-6 max-w-[1400px] mx-auto", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsxs("h1", { className: "text-2xl font-bold text-foreground flex items-center gap-3", children: [
          /* @__PURE__ */ jsx("div", { className: "p-2 rounded-xl bg-primary/10", children: /* @__PURE__ */ jsx(LayoutGrid, { className: "h-5 w-5 text-primary" }) }),
          "Platform Puanları"
        ] }),
        /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground mt-1", children: "Google 5 üzerinden; Booking, Hotels.com, Expedia ve Trip.com 10 üzerinden; TripAdvisor 5 üzerinden gösterilir — her platformun kendi resmi skalası kullanılır." })
      ] }),
      /* @__PURE__ */ jsxs(
        Button,
        {
          variant: "outline",
          size: "sm",
          onClick: handleRefreshAll,
          disabled: refreshing || locations.length === 0,
          children: [
            /* @__PURE__ */ jsx(RefreshCw, { className: `h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}` }),
            "Tüm platform puanlarını güncelle"
          ]
        }
      )
    ] }),
    locations.length === 0 ? /* @__PURE__ */ jsx("div", { className: "text-center py-16 text-muted-foreground", children: "Henüz lokasyon yok. Önce bir işletme ekleyin." }) : /* @__PURE__ */ jsx(PlatformRatingsMatrix, { locations, onSelectLocation: handleSelectLocation })
  ] });
}
export {
  PlatformRatings as default
};
