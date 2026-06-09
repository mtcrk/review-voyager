import { jsx, jsxs } from "react/jsx-runtime";
import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { a as useBusiness, H as useNewReviews, s as supabase, D as DropdownMenu, c as DropdownMenuTrigger, B as Button, d as DropdownMenuContent, J as DropdownMenuLabel, K as DropdownMenuSeparator, L as DropdownMenuCheckboxItem, I as Input, m as Badge } from "../main.mjs";
import { C as Card, c as CardContent } from "./card-vx9BCW0t.js";
import { T as Tabs, a as TabsList, b as TabsTrigger } from "./tabs-C8D1i09v.js";
import { Loader2, Inbox as Inbox$1, Building2, ChevronDown, Filter, Search, MessageSquare, Star, CheckCircle2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { tr } from "date-fns/locale";
import { R as REVIEW_CATEGORIES, m as matchesCategory, a as ReviewCategoryChips } from "./ReviewCategoryChips-DnDaTAgd.js";
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
import "@radix-ui/react-tabs";
const PLATFORM_META = {
  google: { label: "Google", classes: "bg-blue-50 text-blue-700 border-blue-200" },
  booking: { label: "Booking.com", classes: "bg-indigo-50 text-indigo-700 border-indigo-200" },
  expedia: { label: "Expedia", classes: "bg-yellow-50 text-yellow-700 border-yellow-200" },
  tripadvisor: { label: "TripAdvisor", classes: "bg-green-50 text-green-700 border-green-200" },
  hotelscom: { label: "Hotels.com", classes: "bg-red-50 text-red-700 border-red-200" },
  tripcom: { label: "Trip.com", classes: "bg-orange-50 text-orange-700 border-orange-200" }
};
const PLATFORM_OPTIONS = ["google", "booking", "expedia", "tripadvisor", "hotelscom", "tripcom"];
function Inbox() {
  const navigate = useNavigate();
  const { businesses, loading: businessLoading } = useBusiness();
  const { markAllRead } = useNewReviews();
  const [selectedBusinessIds, setSelectedBusinessIds] = useState([]);
  const [selectedPlatforms, setSelectedPlatforms] = useState(PLATFORM_OPTIONS);
  const [statusTab, setStatusTab] = useState("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [categoryFilter, setCategoryFilter] = useState(null);
  const PAGE_SIZE = 50;
  useEffect(() => {
    if (businesses.length > 0 && selectedBusinessIds.length === 0) {
      setSelectedBusinessIds(businesses.map((b) => b.id));
    }
  }, [businesses, selectedBusinessIds.length]);
  useEffect(() => {
    markAllRead();
  }, [markAllRead]);
  const businessIdSet = useMemo(() => new Set(selectedBusinessIds), [selectedBusinessIds]);
  const businessNameMap = useMemo(() => {
    const m = {};
    businesses.forEach((b) => m[b.id] = b.name);
    return m;
  }, [businesses]);
  const { data: reviews = [], isLoading } = useQuery({
    queryKey: ["inbox-reviews", selectedBusinessIds.join(",")],
    queryFn: async () => {
      if (selectedBusinessIds.length === 0) return [];
      const pageSize = 1e3;
      let from = 0;
      const all = [];
      while (true) {
        const { data, error } = await supabase.from("reviews").select("*").in("business_id", selectedBusinessIds).order("posted_at", { ascending: false }).range(from, from + pageSize - 1);
        if (error) throw error;
        if (!data || data.length === 0) break;
        all.push(...data);
        if (data.length < pageSize) break;
        from += pageSize;
      }
      return all;
    },
    enabled: selectedBusinessIds.length > 0
  });
  const filtered = useMemo(() => {
    const cat = categoryFilter ? REVIEW_CATEGORIES.find((c) => c.key === categoryFilter) : null;
    return reviews.filter((r) => {
      if (!businessIdSet.has(r.business_id)) return false;
      if (!selectedPlatforms.includes(r.platform || "google")) return false;
      if (statusTab === "unanswered" && (r.approved_reply || r.status === "replied")) return false;
      if (statusTab === "negative" && r.rating > 3) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        const hay = `${r.reviewer_name || ""} ${r.text || ""} ${businessNameMap[r.business_id] || ""}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      if (cat && !matchesCategory(`${r.text || ""} ${r.summary || ""}`, cat)) return false;
      return true;
    });
  }, [reviews, businessIdSet, selectedPlatforms, statusTab, search, businessNameMap, categoryFilter]);
  const stats = useMemo(() => {
    const unanswered = reviews.filter((r) => !r.approved_reply && r.status !== "replied").length;
    const negative = reviews.filter((r) => r.rating <= 3).length;
    return { total: reviews.length, unanswered, negative };
  }, [reviews]);
  useEffect(() => {
    setPage(1);
  }, [selectedBusinessIds, selectedPlatforms, statusTab, search, categoryFilter]);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paginated = useMemo(
    () => filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE),
    [filtered, currentPage]
  );
  const toggleBusiness = (id) => {
    setSelectedBusinessIds(
      (prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };
  const togglePlatform = (p) => {
    setSelectedPlatforms((prev) => prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]);
  };
  if (businessLoading) {
    return /* @__PURE__ */ jsx("div", { className: "flex items-center justify-center min-h-[60vh]", children: /* @__PURE__ */ jsx(Loader2, { className: "h-8 w-8 animate-spin text-primary" }) });
  }
  return /* @__PURE__ */ jsx("div", { className: "min-h-screen bg-background", children: /* @__PURE__ */ jsxs("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6", children: [
    /* @__PURE__ */ jsx("div", { className: "flex items-start justify-between gap-4 flex-wrap", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
      /* @__PURE__ */ jsx("div", { className: "h-11 w-11 rounded-xl bg-primary/10 flex items-center justify-center", children: /* @__PURE__ */ jsx(Inbox$1, { className: "h-6 w-6 text-primary" }) }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h1", { className: "text-2xl sm:text-3xl font-semibold text-foreground", children: "Tüm Yorumlar" }),
        /* @__PURE__ */ jsxs("p", { className: "text-sm text-muted-foreground mt-0.5", children: [
          businesses.length,
          " işletme · ",
          stats.total,
          " yorum · ",
          stats.unanswered,
          " yanıtlanmamış"
        ] })
      ] })
    ] }) }),
    /* @__PURE__ */ jsx(Card, { className: "shadow-card", children: /* @__PURE__ */ jsxs(CardContent, { className: "p-4 space-y-3", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center gap-2", children: [
        /* @__PURE__ */ jsxs(DropdownMenu, { children: [
          /* @__PURE__ */ jsx(DropdownMenuTrigger, { asChild: true, children: /* @__PURE__ */ jsxs(Button, { variant: "outline", size: "sm", className: "h-9", children: [
            /* @__PURE__ */ jsx(Building2, { className: "h-4 w-4 mr-2" }),
            selectedBusinessIds.length === businesses.length ? "Tüm İşletmeler" : `${selectedBusinessIds.length} işletme`,
            /* @__PURE__ */ jsx(ChevronDown, { className: "h-4 w-4 ml-2" })
          ] }) }),
          /* @__PURE__ */ jsxs(DropdownMenuContent, { align: "start", className: "w-64 max-h-80 overflow-y-auto", children: [
            /* @__PURE__ */ jsxs(DropdownMenuLabel, { className: "flex items-center justify-between", children: [
              /* @__PURE__ */ jsx("span", { children: "İşletmeler" }),
              /* @__PURE__ */ jsx(
                "button",
                {
                  className: "text-xs text-primary hover:underline",
                  onClick: () => setSelectedBusinessIds(
                    selectedBusinessIds.length === businesses.length ? [] : businesses.map((b) => b.id)
                  ),
                  children: selectedBusinessIds.length === businesses.length ? "Temizle" : "Tümü"
                }
              )
            ] }),
            /* @__PURE__ */ jsx(DropdownMenuSeparator, {}),
            businesses.map((b) => /* @__PURE__ */ jsx(
              DropdownMenuCheckboxItem,
              {
                checked: selectedBusinessIds.includes(b.id),
                onCheckedChange: () => toggleBusiness(b.id),
                onSelect: (e) => e.preventDefault(),
                children: b.name
              },
              b.id
            ))
          ] })
        ] }),
        /* @__PURE__ */ jsxs(DropdownMenu, { children: [
          /* @__PURE__ */ jsx(DropdownMenuTrigger, { asChild: true, children: /* @__PURE__ */ jsxs(Button, { variant: "outline", size: "sm", className: "h-9", children: [
            /* @__PURE__ */ jsx(Filter, { className: "h-4 w-4 mr-2" }),
            selectedPlatforms.length === PLATFORM_OPTIONS.length ? "Tüm Platformlar" : `${selectedPlatforms.length} platform`,
            /* @__PURE__ */ jsx(ChevronDown, { className: "h-4 w-4 ml-2" })
          ] }) }),
          /* @__PURE__ */ jsxs(DropdownMenuContent, { align: "start", className: "w-56", children: [
            /* @__PURE__ */ jsxs(DropdownMenuLabel, { className: "flex items-center justify-between", children: [
              /* @__PURE__ */ jsx("span", { children: "Platformlar" }),
              /* @__PURE__ */ jsx(
                "button",
                {
                  className: "text-xs text-primary hover:underline",
                  onClick: () => setSelectedPlatforms(
                    selectedPlatforms.length === PLATFORM_OPTIONS.length ? [] : PLATFORM_OPTIONS
                  ),
                  children: selectedPlatforms.length === PLATFORM_OPTIONS.length ? "Temizle" : "Tümü"
                }
              )
            ] }),
            /* @__PURE__ */ jsx(DropdownMenuSeparator, {}),
            PLATFORM_OPTIONS.map((p) => /* @__PURE__ */ jsx(
              DropdownMenuCheckboxItem,
              {
                checked: selectedPlatforms.includes(p),
                onCheckedChange: () => togglePlatform(p),
                onSelect: (e) => e.preventDefault(),
                children: PLATFORM_META[p].label
              },
              p
            ))
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "relative flex-1 min-w-[200px]", children: [
          /* @__PURE__ */ jsx(Search, { className: "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" }),
          /* @__PURE__ */ jsx(
            Input,
            {
              placeholder: "Yorum, müşteri veya otel ara...",
              value: search,
              onChange: (e) => setSearch(e.target.value),
              className: "pl-9 h-9"
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsx(Tabs, { value: statusTab, onValueChange: (v) => setStatusTab(v), children: /* @__PURE__ */ jsxs(TabsList, { children: [
        /* @__PURE__ */ jsxs(TabsTrigger, { value: "all", children: [
          "Tümü (",
          stats.total,
          ")"
        ] }),
        /* @__PURE__ */ jsxs(TabsTrigger, { value: "unanswered", children: [
          "Yanıtlanmamış (",
          stats.unanswered,
          ")"
        ] }),
        /* @__PURE__ */ jsxs(TabsTrigger, { value: "negative", children: [
          "Olumsuz (",
          stats.negative,
          ")"
        ] })
      ] }) }),
      reviews.length > 0 && /* @__PURE__ */ jsx(
        ReviewCategoryChips,
        {
          reviews,
          selectedCategory: categoryFilter,
          onSelectCategory: setCategoryFilter,
          className: "mt-2"
        }
      )
    ] }) }),
    isLoading ? /* @__PURE__ */ jsx("div", { className: "flex items-center justify-center p-16", children: /* @__PURE__ */ jsx(Loader2, { className: "h-8 w-8 animate-spin text-primary" }) }) : filtered.length === 0 ? /* @__PURE__ */ jsxs(Card, { className: "p-12 text-center shadow-card", children: [
      /* @__PURE__ */ jsx(MessageSquare, { className: "h-12 w-12 text-muted-foreground/40 mx-auto mb-3" }),
      /* @__PURE__ */ jsx("p", { className: "text-muted-foreground", children: reviews.length === 0 ? "Henüz yorum yok. Platformlar bağlandıkça buraya akacak." : "Bu filtrelerle eşleşen yorum bulunamadı." })
    ] }) : /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
      paginated.map((r) => {
        const platform = PLATFORM_META[r.platform || "google"] || PLATFORM_META.google;
        const isAnswered = !!r.approved_reply || r.status === "replied";
        const isNegative = r.rating <= 3;
        return /* @__PURE__ */ jsx(
          "button",
          {
            onClick: () => navigate(`/reviews/${r.id}`),
            className: "w-full text-left bg-card border border-border rounded-lg p-4 hover:border-primary/40 hover:shadow-md transition-all",
            children: /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3", children: [
              /* @__PURE__ */ jsx("div", { className: "flex flex-col items-center min-w-[44px] pt-0.5", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-0.5", children: [
                /* @__PURE__ */ jsx(Star, { className: "h-4 w-4 fill-amber-400 text-amber-400" }),
                /* @__PURE__ */ jsx("span", { className: "font-semibold text-sm", children: r.rating })
              ] }) }),
              /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
                /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center gap-1.5 mb-1", children: [
                  /* @__PURE__ */ jsx("span", { className: "font-medium text-sm text-foreground", children: r.reviewer_name || "Anonim" }),
                  /* @__PURE__ */ jsx("span", { className: "text-muted-foreground text-xs", children: "·" }),
                  /* @__PURE__ */ jsx(Badge, { variant: "outline", className: `${platform.classes} text-xs px-1.5 py-0`, children: platform.label }),
                  /* @__PURE__ */ jsx("span", { className: "text-muted-foreground text-xs", children: "·" }),
                  /* @__PURE__ */ jsxs("span", { className: "text-xs text-muted-foreground inline-flex items-center gap-1", children: [
                    /* @__PURE__ */ jsx(Building2, { className: "h-3 w-3" }),
                    businessNameMap[r.business_id] || "—"
                  ] }),
                  /* @__PURE__ */ jsx("span", { className: "text-muted-foreground text-xs", children: "·" }),
                  /* @__PURE__ */ jsx("span", { className: "text-xs text-muted-foreground", children: formatDistanceToNow(new Date(r.posted_at), { addSuffix: true, locale: tr }) })
                ] }),
                r.text && /* @__PURE__ */ jsx("p", { className: "text-sm text-foreground/80 line-clamp-2", children: r.text }),
                /* @__PURE__ */ jsx("div", { className: "flex items-center gap-2 mt-2", children: isAnswered ? /* @__PURE__ */ jsxs(Badge, { variant: "outline", className: "text-xs bg-emerald-50 text-emerald-700 border-emerald-200", children: [
                  /* @__PURE__ */ jsx(CheckCircle2, { className: "h-3 w-3 mr-1" }),
                  "Yanıtlandı"
                ] }) : /* @__PURE__ */ jsx(Badge, { variant: "outline", className: `text-xs ${isNegative ? "bg-red-50 text-red-700 border-red-200" : "bg-amber-50 text-amber-700 border-amber-200"}`, children: isNegative ? "🔴 Acil yanıtla" : "Yanıt bekliyor" }) })
              ] })
            ] })
          },
          r.id
        );
      }),
      totalPages > 1 && /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between pt-4 border-t border-border", children: [
        /* @__PURE__ */ jsxs("p", { className: "text-xs text-muted-foreground", children: [
          (currentPage - 1) * PAGE_SIZE + 1,
          "–",
          Math.min(currentPage * PAGE_SIZE, filtered.length),
          " / ",
          filtered.length
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsx(
            Button,
            {
              variant: "outline",
              size: "sm",
              onClick: () => setPage((p) => Math.max(1, p - 1)),
              disabled: currentPage === 1,
              children: "Önceki"
            }
          ),
          /* @__PURE__ */ jsxs("span", { className: "text-sm text-muted-foreground px-2", children: [
            currentPage,
            " / ",
            totalPages
          ] }),
          /* @__PURE__ */ jsx(
            Button,
            {
              variant: "outline",
              size: "sm",
              onClick: () => setPage((p) => Math.min(totalPages, p + 1)),
              disabled: currentPage === totalPages,
              children: "Sonraki"
            }
          )
        ] })
      ] })
    ] })
  ] }) });
}
export {
  Inbox as default
};
