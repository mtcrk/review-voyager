import { jsx, jsxs, Fragment } from "react/jsx-runtime";
import { useState, useRef, useEffect, useMemo } from "react";
import { Helmet } from "react-helmet-async";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { s as supabase, M as Sheet, N as SheetContent, O as SheetHeader, P as SheetTitle, Q as SheetDescription, B as Button, S as Skeleton, m as Badge, a as useBusiness, V as TooltipProvider, I as Input, t as toast, T as Tooltip, C as TooltipTrigger, E as TooltipContent } from "../main.mjs";
import { C as Card, c as CardContent, a as CardHeader, e as CardTitle } from "./card-vx9BCW0t.js";
import { T as Tabs, a as TabsList, b as TabsTrigger, c as TabsContent } from "./tabs-C8D1i09v.js";
import { D as Dialog, f as DialogTrigger, a as DialogContent, b as DialogHeader, c as DialogTitle, e as DialogFooter } from "./dialog-CFYcafO1.js";
import { MessageSquare, Star, MapPin, Clock, Plus, Loader2, Sparkles, Download, X, CheckCircle2, Check, RefreshCw } from "lucide-react";
import { I as IntelligenceTabs } from "./IntelligenceTabs-Cfq6fxMs.js";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-1zED13tY.js";
import { A as Alert, a as AlertDescription } from "./alert-BbdwpNV6.js";
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
import "@radix-ui/react-tabs";
import "@radix-ui/react-select";
const PLATFORM_LABEL = {
  google: "Google",
  booking: "Booking.com",
  tripadvisor: "TripAdvisor",
  expedia: "Expedia",
  hotels: "Hotels.com",
  hotelscom: "Hotels.com"
};
function fmtDate(iso) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString("tr-TR", { year: "numeric", month: "short", day: "numeric" });
  } catch {
    return "—";
  }
}
function CompetitorReviewsDrawer({
  open,
  onOpenChange,
  competitorId,
  competitorName,
  totalCount
}) {
  const [platform, setPlatform] = useState("all");
  const q = useQuery({
    queryKey: ["ci_comp_reviews_drawer", competitorId, platform],
    enabled: open && !!competitorId,
    queryFn: async () => {
      let query = supabase.from("ci_competitor_reviews").select("id,platform,rating,title,body,author_name,author_country,posted_at,language").eq("competitor_id", competitorId).order("posted_at", { ascending: false, nullsFirst: false }).limit(200);
      if (platform !== "all") query = query.eq("platform", platform);
      const { data, error } = await query;
      if (error) throw error;
      return data ?? [];
    }
  });
  const rows = q.data ?? [];
  const platforms = Array.from(new Set(rows.map((r) => r.platform))).sort();
  return /* @__PURE__ */ jsx(Sheet, { open, onOpenChange, children: /* @__PURE__ */ jsxs(SheetContent, { side: "right", className: "w-full sm:max-w-2xl overflow-y-auto", children: [
    /* @__PURE__ */ jsxs(SheetHeader, { children: [
      /* @__PURE__ */ jsx(SheetTitle, { className: "text-base", children: competitorName }),
      /* @__PURE__ */ jsxs(SheetDescription, { children: [
        "Toplanan ",
        totalCount,
        " yorum · en yeni 200 tanesi gösteriliyor"
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap gap-2 mt-4", children: [
      /* @__PURE__ */ jsx(
        Button,
        {
          size: "sm",
          variant: platform === "all" ? "default" : "outline",
          onClick: () => setPlatform("all"),
          children: "Hepsi"
        }
      ),
      platforms.map((p) => /* @__PURE__ */ jsx(
        Button,
        {
          size: "sm",
          variant: platform === p ? "default" : "outline",
          onClick: () => setPlatform(p),
          children: PLATFORM_LABEL[p] ?? p
        },
        p
      ))
    ] }),
    /* @__PURE__ */ jsx("div", { className: "mt-4 space-y-3", children: q.isLoading ? Array.from({ length: 5 }).map((_, i) => /* @__PURE__ */ jsx(Skeleton, { className: "h-24 w-full" }, i)) : rows.length === 0 ? /* @__PURE__ */ jsxs("div", { className: "text-sm text-muted-foreground text-center py-12", children: [
      /* @__PURE__ */ jsx(MessageSquare, { className: "h-6 w-6 mx-auto mb-2 opacity-50" }),
      "Henüz yorum toplanmadı."
    ] }) : rows.map((r) => /* @__PURE__ */ jsxs("div", { className: "border rounded-md p-3 space-y-2", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between gap-2 text-xs", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 flex-wrap", children: [
          /* @__PURE__ */ jsx(Badge, { variant: "outline", className: "text-[10px]", children: PLATFORM_LABEL[r.platform] ?? r.platform }),
          r.rating != null && /* @__PURE__ */ jsxs("span", { className: "inline-flex items-center gap-1 font-medium", children: [
            /* @__PURE__ */ jsx(Star, { className: "h-3 w-3 fill-current text-amber-500" }),
            Number(r.rating).toFixed(1)
          ] }),
          r.author_name && /* @__PURE__ */ jsx("span", { className: "text-muted-foreground", children: r.author_name }),
          r.author_country && /* @__PURE__ */ jsxs("span", { className: "text-muted-foreground", children: [
            "· ",
            r.author_country
          ] })
        ] }),
        /* @__PURE__ */ jsx("span", { className: "text-muted-foreground", children: fmtDate(r.posted_at) })
      ] }),
      r.title && /* @__PURE__ */ jsx("div", { className: "font-medium text-sm", children: r.title }),
      r.body && /* @__PURE__ */ jsx("p", { className: "text-sm text-foreground/80 whitespace-pre-wrap", children: r.body })
    ] }, r.id)) })
  ] }) });
}
const RADIUS_OPTIONS = [
  { label: "2 km", value: 2e3 },
  { label: "5 km", value: 5e3 },
  { label: "10 km", value: 1e4 }
];
const SEGMENT_LABEL = {
  luxury: "Lüks",
  boutique: "Butik",
  resort: "Resort",
  business: "Business",
  budget: "Ekonomik",
  bnb: "B&B",
  hostel: "Hostel",
  apart: "Apart"
};
function priceLabel(t) {
  if (!t) return null;
  return "₺".repeat(Math.max(1, Math.min(4, t)));
}
function scoreColor(score) {
  if (score == null) return "bg-muted text-muted-foreground";
  if (score >= 70) return "bg-green-100 text-green-700 border-green-200";
  if (score >= 40) return "bg-amber-100 text-amber-700 border-amber-200";
  return "bg-muted text-muted-foreground";
}
function relativeTime(iso) {
  if (!iso) return null;
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 6e4);
  if (m < 1) return "az önce";
  if (m < 60) return `${m} dk önce`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} sa önce`;
  const d = Math.floor(h / 24);
  return `${d} gün önce`;
}
function Intelligence() {
  const { activeBusiness, businesses, setActiveBusiness, loading: businessLoading } = useBusiness();
  const businessId = activeBusiness == null ? void 0 : activeBusiness.id;
  const queryClient = useQueryClient();
  const [discovering, setDiscovering] = useState(false);
  const [radius, setRadius] = useState(5e3);
  const [generatingBrief, setGeneratingBrief] = useState(false);
  const [fetchingId, setFetchingId] = useState(null);
  const [fetchingAll, setFetchingAll] = useState(false);
  const [bulkOpen, setBulkOpen] = useState(false);
  const [filterSameSegment, setFilterSameSegment] = useState(false);
  const [filterSameStar, setFilterSameStar] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [addingPlaceId, setAddingPlaceId] = useState(null);
  const searchSeq = useRef(0);
  const PENDING_KEY = businessId ? `ci_pending_fetches_${businessId}` : "ci_pending_fetches";
  const [pendingFetches, setPendingFetches] = useState(() => {
    if (typeof window === "undefined") return {};
    try {
      const raw = localStorage.getItem(PENDING_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  });
  useEffect(() => {
    try {
      const raw = localStorage.getItem(PENDING_KEY);
      setPendingFetches(raw ? JSON.parse(raw) : {});
    } catch {
      setPendingFetches({});
    }
  }, [PENDING_KEY]);
  function markPending(ids) {
    setPendingFetches((prev) => {
      const next = { ...prev };
      const now = Date.now();
      for (const id of ids) next[id] = now;
      try {
        localStorage.setItem(PENDING_KEY, JSON.stringify(next));
      } catch {
      }
      return next;
    });
  }
  function clearPending(id) {
    setPendingFetches((prev) => {
      const next = { ...prev };
      delete next[id];
      try {
        localStorage.setItem(PENDING_KEY, JSON.stringify(next));
      } catch {
      }
      return next;
    });
  }
  const competitorsKey = ["ci_competitors", businessId];
  const reviewStatsKey = ["ci_competitor_review_stats", businessId];
  useEffect(() => {
    if (!addOpen) {
      setSearchQuery("");
      setSuggestions([]);
      return;
    }
  }, [addOpen]);
  useEffect(() => {
    const q = searchQuery.trim();
    if (q.length < 2) {
      setSuggestions([]);
      setSearching(false);
      return;
    }
    const seq = ++searchSeq.current;
    setSearching(true);
    const t = setTimeout(async () => {
      const { data, error } = await supabase.functions.invoke("places-autocomplete", {
        body: {
          query: q,
          lat: (activeBusiness == null ? void 0 : activeBusiness.lat) ? Number(activeBusiness.lat) : void 0,
          lng: (activeBusiness == null ? void 0 : activeBusiness.lng) ? Number(activeBusiness.lng) : void 0
        }
      });
      if (seq !== searchSeq.current) return;
      setSearching(false);
      if (error) {
        setSuggestions([]);
        return;
      }
      setSuggestions((data == null ? void 0 : data.suggestions) ?? []);
    }, 300);
    return () => clearTimeout(t);
  }, [searchQuery, activeBusiness == null ? void 0 : activeBusiness.lat, activeBusiness == null ? void 0 : activeBusiness.lng]);
  const competitorsQuery = useQuery({
    queryKey: competitorsKey,
    enabled: !!businessId,
    queryFn: async () => {
      const { data, error } = await supabase.from("ci_competitors").select("*").eq("business_id", businessId).neq("status", "rejected").order("match_score", { ascending: false });
      if (error) throw error;
      return data ?? [];
    }
  });
  const briefQuery = useQuery({
    queryKey: ["ci_monday_brief", businessId],
    enabled: !!businessId,
    queryFn: async () => {
      const { data, error } = await supabase.from("ci_monday_briefs").select("*").eq("business_id", businessId).order("bucket_week", { ascending: false }).limit(1).maybeSingle();
      if (error) throw error;
      return data ?? null;
    }
  });
  const lastRunQuery = useQuery({
    queryKey: ["ci_last_run", businessId],
    enabled: !!businessId,
    queryFn: async () => {
      const { data } = await supabase.from("ci_discovery_runs").select("ran_at").eq("business_id", businessId).order("ran_at", { ascending: false }).limit(1).maybeSingle();
      return (data == null ? void 0 : data.ran_at) ?? null;
    }
  });
  const reviewStatsQuery = useQuery({
    queryKey: reviewStatsKey,
    enabled: !!businessId,
    refetchInterval: Object.keys(pendingFetches).length > 0 ? 15e3 : false,
    queryFn: async () => {
      const { data: comps } = await supabase.from("ci_competitors").select("id").eq("business_id", businessId).eq("status", "confirmed");
      const ids = (comps ?? []).map((c) => c.id);
      if (ids.length === 0) return {};
      const { data } = await supabase.from("ci_competitor_reviews").select("competitor_id").in("competitor_id", ids);
      const counts = {};
      for (const r of data ?? []) {
        counts[r.competitor_id] = (counts[r.competitor_id] ?? 0) + 1;
      }
      return counts;
    }
  });
  const reviewCounts = reviewStatsQuery.data ?? {};
  useEffect(() => {
    const now = Date.now();
    const TIMEOUT_MS = 15 * 60 * 1e3;
    for (const [id, startedAt] of Object.entries(pendingFetches)) {
      if ((reviewCounts[id] ?? 0) > 0 || now - startedAt > TIMEOUT_MS) {
        clearPending(id);
      }
    }
  }, [reviewCounts]);
  const competitors = competitorsQuery.data ?? [];
  const loadingComp = competitorsQuery.isLoading;
  const brief = briefQuery.data ?? null;
  const loadingBrief = briefQuery.isLoading;
  const suggested = useMemo(
    () => competitors.filter((c) => c.status === "suggested").filter((c) => {
      if (!filterSameSegment) return true;
      return c.segment && (activeBusiness == null ? void 0 : activeBusiness.segment) && c.segment === activeBusiness.segment;
    }).filter((c) => {
      if (!filterSameStar) return true;
      const own = activeBusiness == null ? void 0 : activeBusiness.star_rating;
      return c.star_rating != null && own != null && Math.abs(Number(c.star_rating) - Number(own)) < 0.5;
    }).sort((a, b) => (b.match_score ?? 0) - (a.match_score ?? 0)),
    [competitors, filterSameSegment, filterSameStar, activeBusiness]
  );
  const confirmed = useMemo(
    () => competitors.filter((c) => c.status === "confirmed"),
    [competitors]
  );
  async function discover() {
    if (!businessId) return;
    const before = competitors.filter((c) => c.status === "suggested").length;
    setDiscovering(true);
    const { data, error } = await supabase.functions.invoke("discover-competitors", {
      body: { business_id: businessId, radius_m: radius }
    });
    setDiscovering(false);
    if (error) {
      toast({ title: "Keşif başarısız", description: error.message, variant: "destructive" });
      return;
    }
    queryClient.invalidateQueries({ queryKey: ["ci_last_run", businessId] });
    const fresh = await queryClient.fetchQuery({
      queryKey: competitorsKey,
      queryFn: async () => {
        const { data: d } = await supabase.from("ci_competitors").select("*").eq("business_id", businessId).neq("status", "rejected").order("match_score", { ascending: false });
        return d ?? [];
      }
    });
    const found = (data == null ? void 0 : data.candidates_found) ?? 0;
    const suggestedCount = (data == null ? void 0 : data.suggested_count) ?? 0;
    const afterSuggested = fresh.filter((c) => c.status === "suggested").length;
    const newCount = Math.max(0, afterSuggested - before);
    if (suggestedCount === 0 || newCount === 0) {
      toast({
        title: "Yeni öneri bulunamadı",
        description: "Daha geniş bir yarıçap deneyin (örn. 10 km)."
      });
    } else {
      toast({
        title: "Tarama tamamlandı",
        description: `${found} işletme tarandı, ${newCount} yeni öneri eklendi.`
      });
    }
  }
  async function setStatus(id, status) {
    const prev = queryClient.getQueryData(competitorsKey) ?? [];
    queryClient.setQueryData(
      competitorsKey,
      status === "rejected" ? prev.filter((c) => c.id !== id) : prev.map((c) => c.id === id ? { ...c, status } : c)
    );
    const { error } = await supabase.from("ci_competitors").update({ status }).eq("id", id);
    if (error) {
      queryClient.setQueryData(competitorsKey, prev);
      toast({ title: "Hata", description: error.message, variant: "destructive" });
    }
  }
  async function selectSuggestion(s) {
    if (!businessId) return;
    setAddingPlaceId(s.place_id);
    const { data, error } = await supabase.functions.invoke("places-autocomplete", {
      body: { place_id: s.place_id, details: true }
    });
    const place = data == null ? void 0 : data.place;
    const name = (place == null ? void 0 : place.name) || s.main_text || s.full_text;
    const { error: insErr } = await supabase.from("ci_competitors").insert({
      business_id: businessId,
      name,
      place_id: s.place_id,
      lat: (place == null ? void 0 : place.lat) ?? null,
      lng: (place == null ? void 0 : place.lng) ?? null,
      rating: (place == null ? void 0 : place.rating) ?? null,
      review_count: (place == null ? void 0 : place.review_count) ?? null,
      source: "manual",
      status: "confirmed"
    });
    setAddingPlaceId(null);
    if (error || insErr) {
      toast({
        title: "Eklenemedi",
        description: (insErr == null ? void 0 : insErr.message) ?? (error == null ? void 0 : error.message) ?? "Bilinmeyen hata",
        variant: "destructive"
      });
      return;
    }
    setAddOpen(false);
    queryClient.invalidateQueries({ queryKey: competitorsKey });
    toast({ title: "Eklendi", description: `${name} rakip olarak eklendi.` });
  }
  async function generateBrief() {
    if (!businessId) return;
    setGeneratingBrief(true);
    const { error } = await supabase.functions.invoke("generate-monday-brief", {
      body: { business_id: businessId }
    });
    setGeneratingBrief(false);
    if (error) {
      toast({ title: "Brief oluşturulamadı", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Brief hazır", description: "En son brief yüklendi." });
    queryClient.invalidateQueries({ queryKey: ["ci_monday_brief", businessId] });
  }
  async function fetchReviewsFor(c) {
    var _a, _b, _c;
    setFetchingId(c.id);
    const { data, error } = await supabase.functions.invoke("fetch-competitor-reviews", {
      body: { competitor_id: c.id }
    });
    setFetchingId(null);
    if (error) {
      toast({ title: "Yorum çekme başlatılamadı", description: error.message, variant: "destructive" });
      return;
    }
    const skipped = (_a = data == null ? void 0 : data.skipped) == null ? void 0 : _a[0];
    const noPlace = (_b = data == null ? void 0 : data.no_place_id) == null ? void 0 : _b[0];
    if (noPlace) {
      toast({ title: `${c.name}`, description: "Place ID bulunamadı, çekme atlandı." });
    } else if ((skipped == null ? void 0 : skipped.reason) === "within_7d_cooldown") {
      toast({ title: `${c.name}`, description: "Son 7 günde tarandı (tekrar için bekleyin)." });
    } else if ((_c = data == null ? void 0 : data.started) == null ? void 0 : _c.length) {
      markPending([c.id]);
      toast({
        title: `${c.name} için yorum toplama başlatıldı`,
        description: "Apify yorumları çekiyor. 2-5 dk sürer, bu sayfada otomatik güncellenir."
      });
    } else {
      toast({ title: `${c.name}`, description: "İşlem başlatılamadı." });
    }
    queryClient.invalidateQueries({ queryKey: competitorsKey });
    queryClient.invalidateQueries({ queryKey: reviewStatsKey });
  }
  async function fetchReviewsAll() {
    var _a, _b;
    if (!businessId) return;
    setFetchingAll(true);
    const { data, error } = await supabase.functions.invoke("fetch-competitor-reviews", {
      body: { business_id: businessId }
    });
    setFetchingAll(false);
    setBulkOpen(false);
    if (error) {
      toast({ title: "Toplu çekme başarısız", description: error.message, variant: "destructive" });
      return;
    }
    const startedN = ((_a = data == null ? void 0 : data.started) == null ? void 0 : _a.length) ?? 0;
    const skippedN = ((_b = data == null ? void 0 : data.skipped) == null ? void 0 : _b.length) ?? 0;
    const startedIds = ((data == null ? void 0 : data.started) ?? []).map((s) => s.competitor_id);
    if (startedIds.length) markPending(startedIds);
    toast({
      title: "Yorum çekme başlatıldı",
      description: `${startedN} rakip için başlatıldı, ${skippedN} atlandı. Sonuçlar 2-5 dk içinde otomatik gelir.`
    });
    queryClient.invalidateQueries({ queryKey: competitorsKey });
    queryClient.invalidateQueries({ queryKey: reviewStatsKey });
  }
  if (businessLoading) {
    return /* @__PURE__ */ jsxs("div", { className: "p-4 sm:p-6 max-w-6xl mx-auto space-y-6", children: [
      /* @__PURE__ */ jsx(Skeleton, { className: "h-8 w-48" }),
      /* @__PURE__ */ jsx(Skeleton, { className: "h-4 w-96 max-w-full" }),
      /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-3", children: [0, 1, 2, 3].map((i) => /* @__PURE__ */ jsx(Skeleton, { className: "h-28 w-full" }, i)) })
    ] });
  }
  if (!businessId) {
    return /* @__PURE__ */ jsx("div", { className: "p-6", children: /* @__PURE__ */ jsx("p", { className: "text-muted-foreground", children: "Önce bir işletme seçin." }) });
  }
  const lastRun = relativeTime(lastRunQuery.data);
  return /* @__PURE__ */ jsxs(TooltipProvider, { delayDuration: 200, children: [
    /* @__PURE__ */ jsx(Helmet, { children: /* @__PURE__ */ jsx("title", { children: "Rakip Analizi · VoyageRespond" }) }),
    /* @__PURE__ */ jsxs("div", { className: "p-4 sm:p-6 max-w-6xl mx-auto space-y-6", children: [
      /* @__PURE__ */ jsx(IntelligenceTabs, {}),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h1", { className: "text-2xl sm:text-3xl font-semibold tracking-tight", children: "Rakip Analizi" }),
        /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground mt-1", children: "Bölgenizdeki rakipleri otomatik keşfedin ve haftalık stratejik brief alın." }),
        businesses.length > 1 && /* @__PURE__ */ jsxs("div", { className: "mt-3 flex items-center gap-2", children: [
          /* @__PURE__ */ jsx(MapPin, { className: "h-4 w-4 text-muted-foreground" }),
          /* @__PURE__ */ jsxs(
            Select,
            {
              value: activeBusiness == null ? void 0 : activeBusiness.id,
              onValueChange: (id) => {
                const b = businesses.find((x) => x.id === id);
                if (b) setActiveBusiness(b);
              },
              children: [
                /* @__PURE__ */ jsx(SelectTrigger, { className: "w-full sm:w-[280px] h-9", children: /* @__PURE__ */ jsx(SelectValue, { placeholder: "Lokasyon seçin" }) }),
                /* @__PURE__ */ jsx(SelectContent, { children: businesses.map((b) => /* @__PURE__ */ jsx(SelectItem, { value: b.id, children: b.name }, b.id)) })
              ]
            }
          )
        ] }),
        !loadingComp && /* @__PURE__ */ jsxs("div", { className: "text-xs text-muted-foreground mt-2 flex flex-wrap gap-x-2 gap-y-1", children: [
          /* @__PURE__ */ jsxs("span", { children: [
            confirmed.length,
            " rakip takip ediliyor"
          ] }),
          /* @__PURE__ */ jsx("span", { children: "·" }),
          /* @__PURE__ */ jsxs("span", { children: [
            suggested.length,
            " öneri bekliyor"
          ] }),
          lastRun && /* @__PURE__ */ jsxs(Fragment, { children: [
            /* @__PURE__ */ jsx("span", { children: "·" }),
            /* @__PURE__ */ jsxs("span", { children: [
              "son keşif: ",
              lastRun
            ] })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs(Tabs, { defaultValue: "competitors", children: [
        /* @__PURE__ */ jsxs(TabsList, { children: [
          /* @__PURE__ */ jsx(TabsTrigger, { value: "competitors", children: "Rakipler" }),
          /* @__PURE__ */ jsx(TabsTrigger, { value: "brief", children: "Haftalık Brief" })
        ] }),
        /* @__PURE__ */ jsxs(TabsContent, { value: "competitors", className: "space-y-6 mt-4", children: [
          /* @__PURE__ */ jsx(
            OwnProfileCard,
            {
              business: activeBusiness,
              onSaved: () => {
                queryClient.invalidateQueries({ queryKey: ["business"] });
                queryClient.invalidateQueries({ queryKey: competitorsKey });
              }
            }
          ),
          Object.keys(pendingFetches).length > 0 && /* @__PURE__ */ jsxs(Alert, { className: "border-primary/40 bg-primary/5", children: [
            /* @__PURE__ */ jsx(Clock, { className: "h-4 w-4 text-primary" }),
            /* @__PURE__ */ jsxs(AlertDescription, { className: "text-sm", children: [
              /* @__PURE__ */ jsxs("span", { className: "font-medium text-foreground", children: [
                Object.keys(pendingFetches).length,
                " rakip için yorumlar Apify'dan çekiliyor."
              ] }),
              " ",
              "Genellikle 2-5 dakika sürer. Sayfa açık kaldığı sürece otomatik güncellenir — beklemek zorunda değilsiniz, başka bir sekmeye geçebilirsiniz."
            ] })
          ] }),
          /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsxs(CardContent, { className: "p-4 sm:p-6 flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center gap-2", children: [
              /* @__PURE__ */ jsx("span", { className: "text-sm text-muted-foreground mr-1", children: "Yarıçap:" }),
              RADIUS_OPTIONS.map((r) => /* @__PURE__ */ jsx(
                Button,
                {
                  size: "sm",
                  variant: radius === r.value ? "default" : "outline",
                  onClick: () => setRadius(r.value),
                  children: r.label
                },
                r.value
              ))
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex flex-col sm:flex-row gap-2", children: [
              /* @__PURE__ */ jsxs(Dialog, { open: addOpen, onOpenChange: setAddOpen, children: [
                /* @__PURE__ */ jsx(DialogTrigger, { asChild: true, children: /* @__PURE__ */ jsxs(Button, { variant: "outline", size: "sm", className: "w-full sm:w-auto", children: [
                  /* @__PURE__ */ jsx(Plus, { className: "h-4 w-4" }),
                  " Rakip Ekle"
                ] }) }),
                /* @__PURE__ */ jsxs(DialogContent, { children: [
                  /* @__PURE__ */ jsx(DialogHeader, { children: /* @__PURE__ */ jsx(DialogTitle, { children: "Rakip Ekle" }) }),
                  /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
                    /* @__PURE__ */ jsxs("div", { className: "relative", children: [
                      /* @__PURE__ */ jsx(
                        Input,
                        {
                          placeholder: "Rakip otel ara...",
                          value: searchQuery,
                          onChange: (e) => setSearchQuery(e.target.value),
                          autoFocus: true
                        }
                      ),
                      searching && /* @__PURE__ */ jsx(Loader2, { className: "h-4 w-4 animate-spin absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" })
                    ] }),
                    /* @__PURE__ */ jsx("div", { className: "max-h-80 overflow-y-auto border rounded-md divide-y", children: searchQuery.trim().length < 2 ? /* @__PURE__ */ jsx("div", { className: "p-4 text-sm text-muted-foreground text-center", children: "Aramak için en az 2 karakter yazın." }) : suggestions.length === 0 && !searching ? /* @__PURE__ */ jsx("div", { className: "p-4 text-sm text-muted-foreground text-center", children: "Sonuç bulunamadı" }) : suggestions.map((s) => /* @__PURE__ */ jsxs(
                      "button",
                      {
                        type: "button",
                        onClick: () => selectSuggestion(s),
                        disabled: addingPlaceId !== null,
                        className: "w-full text-left px-3 py-2.5 hover:bg-accent transition-colors flex items-start gap-2 disabled:opacity-50",
                        children: [
                          /* @__PURE__ */ jsx(MapPin, { className: "h-4 w-4 text-muted-foreground mt-0.5 shrink-0" }),
                          /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
                            /* @__PURE__ */ jsx("div", { className: "text-sm font-medium truncate", children: s.main_text }),
                            s.secondary_text && /* @__PURE__ */ jsx("div", { className: "text-xs text-muted-foreground truncate", children: s.secondary_text })
                          ] }),
                          addingPlaceId === s.place_id && /* @__PURE__ */ jsx(Loader2, { className: "h-4 w-4 animate-spin text-muted-foreground" })
                        ]
                      },
                      s.place_id
                    )) })
                  ] })
                ] })
              ] }),
              /* @__PURE__ */ jsx(Button, { onClick: discover, disabled: discovering, className: "w-full sm:w-auto", children: discovering ? /* @__PURE__ */ jsxs(Fragment, { children: [
                /* @__PURE__ */ jsx(Loader2, { className: "h-4 w-4 animate-spin" }),
                " Bölgeniz taranıyor..."
              ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
                /* @__PURE__ */ jsx(Sparkles, { className: "h-4 w-4" }),
                " Rakipleri Keşfet"
              ] }) })
            ] })
          ] }) }),
          loadingComp ? /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-3", children: [0, 1, 2, 3].map((i) => /* @__PURE__ */ jsx(Skeleton, { className: "h-28 w-full" }, i)) }) : /* @__PURE__ */ jsxs(Fragment, { children: [
            confirmed.length > 0 && /* @__PURE__ */ jsxs("section", { children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between gap-2 mb-2 flex-wrap", children: [
                /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
                  /* @__PURE__ */ jsx("h2", { className: "text-sm font-medium", children: "Rakiplerim" }),
                  /* @__PURE__ */ jsx(Badge, { variant: "secondary", className: "h-5", children: confirmed.length })
                ] }),
                /* @__PURE__ */ jsxs(Dialog, { open: bulkOpen, onOpenChange: setBulkOpen, children: [
                  /* @__PURE__ */ jsx(DialogTrigger, { asChild: true, children: /* @__PURE__ */ jsxs(Button, { size: "sm", variant: "outline", disabled: fetchingAll, children: [
                    fetchingAll ? /* @__PURE__ */ jsx(Loader2, { className: "h-4 w-4 animate-spin" }) : /* @__PURE__ */ jsx(Download, { className: "h-4 w-4" }),
                    "Tüm rakiplerin yorumlarını çek"
                  ] }) }),
                  /* @__PURE__ */ jsxs(DialogContent, { children: [
                    /* @__PURE__ */ jsx(DialogHeader, { children: /* @__PURE__ */ jsx(DialogTitle, { children: "Tüm rakipler için yorum çekilsin mi?" }) }),
                    /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: "Bu işlem Apify üzerinden onaylı rakipleriniz için yorum toplamayı tetikler ve birkaç dakika sürebilir. Son 7 gün içinde taranan rakipler atlanır." }),
                    /* @__PURE__ */ jsxs(DialogFooter, { children: [
                      /* @__PURE__ */ jsx(Button, { variant: "outline", onClick: () => setBulkOpen(false), children: "Vazgeç" }),
                      /* @__PURE__ */ jsxs(Button, { onClick: fetchReviewsAll, disabled: fetchingAll, children: [
                        fetchingAll && /* @__PURE__ */ jsx(Loader2, { className: "h-4 w-4 animate-spin" }),
                        "Başlat"
                      ] })
                    ] })
                  ] })
                ] })
              ] }),
              /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-3", children: confirmed.map((c) => /* @__PURE__ */ jsx(
                CompetitorCard,
                {
                  c,
                  confirmed: true,
                  reviewCount: reviewCounts[c.id] ?? 0,
                  fetching: fetchingId === c.id,
                  pending: !!pendingFetches[c.id],
                  actions: /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
                    /* @__PURE__ */ jsxs(
                      Button,
                      {
                        size: "sm",
                        variant: "outline",
                        onClick: () => fetchReviewsFor(c),
                        disabled: fetchingId === c.id || !c.place_id,
                        children: [
                          fetchingId === c.id ? /* @__PURE__ */ jsx(Loader2, { className: "h-4 w-4 animate-spin" }) : /* @__PURE__ */ jsx(Download, { className: "h-4 w-4" }),
                          "Yorumları Çek"
                        ]
                      }
                    ),
                    /* @__PURE__ */ jsxs(
                      Button,
                      {
                        size: "sm",
                        variant: "ghost",
                        onClick: () => setStatus(c.id, "rejected"),
                        children: [
                          /* @__PURE__ */ jsx(X, { className: "h-4 w-4" }),
                          " Çıkar"
                        ]
                      }
                    )
                  ] })
                },
                c.id
              )) })
            ] }),
            /* @__PURE__ */ jsxs("section", { children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mb-2", children: [
                /* @__PURE__ */ jsx("h2", { className: "text-sm font-medium", children: "Önerilen Rakipler" }),
                /* @__PURE__ */ jsx(Badge, { variant: "secondary", className: "h-5", children: suggested.length }),
                ((activeBusiness == null ? void 0 : activeBusiness.segment) || (activeBusiness == null ? void 0 : activeBusiness.star_rating) != null) && /* @__PURE__ */ jsxs("div", { className: "ml-auto flex items-center gap-2", children: [
                  (activeBusiness == null ? void 0 : activeBusiness.segment) && /* @__PURE__ */ jsx(
                    Button,
                    {
                      size: "sm",
                      variant: filterSameSegment ? "default" : "outline",
                      className: "h-7 text-xs",
                      onClick: () => setFilterSameSegment((v) => !v),
                      children: "Sadece aynı segment"
                    }
                  ),
                  (activeBusiness == null ? void 0 : activeBusiness.star_rating) != null && /* @__PURE__ */ jsx(
                    Button,
                    {
                      size: "sm",
                      variant: filterSameStar ? "default" : "outline",
                      className: "h-7 text-xs",
                      onClick: () => setFilterSameStar((v) => !v),
                      children: "Sadece aynı yıldız"
                    }
                  )
                ] })
              ] }),
              suggested.length === 0 && confirmed.length === 0 ? /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsxs(CardContent, { className: "p-8 text-center space-y-3", children: [
                /* @__PURE__ */ jsx(Sparkles, { className: "h-8 w-8 mx-auto text-muted-foreground" }),
                /* @__PURE__ */ jsx("h3", { className: "font-medium", children: "Henüz rakip yok" }),
                /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground max-w-md mx-auto", children: "Sisteminiz lokasyonunuza ve seviyenize göre benzer işletmeleri otomatik keşfeder. Başlamak için aşağıdaki butona tıklayın." }),
                /* @__PURE__ */ jsxs(Button, { onClick: discover, disabled: discovering, children: [
                  discovering ? /* @__PURE__ */ jsx(Loader2, { className: "h-4 w-4 animate-spin" }) : /* @__PURE__ */ jsx(Sparkles, { className: "h-4 w-4" }),
                  "Rakipleri Keşfet"
                ] })
              ] }) }) : suggested.length === 0 ? /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsxs(CardContent, { className: "p-6 text-center space-y-2", children: [
                /* @__PURE__ */ jsx(CheckCircle2, { className: "h-7 w-7 mx-auto text-green-600" }),
                /* @__PURE__ */ jsx("h3", { className: "font-medium", children: "Tüm öneriler incelendi" }),
                /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: "Harika iş! Haftalık Brief sekmesinden stratejik özetinize göz atın." })
              ] }) }) : /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-3", children: suggested.map((c) => /* @__PURE__ */ jsx(
                CompetitorCard,
                {
                  c,
                  actions: /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
                    /* @__PURE__ */ jsxs(Button, { size: "sm", onClick: () => setStatus(c.id, "confirmed"), children: [
                      /* @__PURE__ */ jsx(Check, { className: "h-4 w-4" }),
                      " Rakibim"
                    ] }),
                    /* @__PURE__ */ jsxs(
                      Button,
                      {
                        size: "sm",
                        variant: "ghost",
                        onClick: () => setStatus(c.id, "rejected"),
                        children: [
                          /* @__PURE__ */ jsx(X, { className: "h-4 w-4" }),
                          " Rakip Değil"
                        ]
                      }
                    )
                  ] })
                },
                c.id
              )) })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsx(TabsContent, { value: "brief", className: "mt-4", children: loadingBrief ? /* @__PURE__ */ jsx(Skeleton, { className: "h-64 w-full" }) : brief ? /* @__PURE__ */ jsx(
          BriefView,
          {
            brief,
            businessName: (activeBusiness == null ? void 0 : activeBusiness.name) ?? "",
            onRegenerate: generateBrief,
            regenerating: generatingBrief
          }
        ) : /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsxs(CardContent, { className: "p-8 text-center space-y-3", children: [
          /* @__PURE__ */ jsx("h3", { className: "font-medium", children: "Brief henüz oluşturulmadı" }),
          /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground max-w-md mx-auto", children: "İlk brief'iniz, en az 1 rakibi onayladıktan sonra oluşturulacak." }),
          /* @__PURE__ */ jsxs(Button, { onClick: generateBrief, disabled: generatingBrief || confirmed.length === 0, children: [
            generatingBrief ? /* @__PURE__ */ jsx(Loader2, { className: "h-4 w-4 animate-spin" }) : /* @__PURE__ */ jsx(Sparkles, { className: "h-4 w-4" }),
            "Brief Oluştur"
          ] })
        ] }) }) })
      ] })
    ] })
  ] });
}
function CompetitorCard({
  c,
  actions,
  confirmed,
  reviewCount,
  fetching,
  pending
}) {
  const distanceKm = c.proximity_m != null ? (c.proximity_m / 1e3).toFixed(1) : null;
  const [reviewsOpen, setReviewsOpen] = useState(false);
  return /* @__PURE__ */ jsxs(Card, { className: confirmed ? "border-l-2 border-l-primary" : "", children: [
    /* @__PURE__ */ jsxs(CardContent, { className: "p-4 space-y-3", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between gap-3", children: [
        /* @__PURE__ */ jsxs("div", { className: "min-w-0 flex-1", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 min-w-0", children: [
            confirmed && /* @__PURE__ */ jsx(CheckCircle2, { className: "h-4 w-4 text-primary flex-shrink-0" }),
            /* @__PURE__ */ jsxs(Tooltip, { children: [
              /* @__PURE__ */ jsx(TooltipTrigger, { asChild: true, children: /* @__PURE__ */ jsx("h3", { className: "font-medium truncate", children: c.name }) }),
              /* @__PURE__ */ jsx(TooltipContent, { children: c.name })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 text-xs text-muted-foreground mt-1 flex-wrap", children: [
            c.rating != null && /* @__PURE__ */ jsxs("span", { className: "inline-flex items-center gap-1", children: [
              /* @__PURE__ */ jsx(Star, { className: "h-3 w-3 fill-current text-amber-500" }),
              c.rating.toFixed(1)
            ] }),
            c.review_count != null && /* @__PURE__ */ jsxs("span", { children: [
              c.review_count,
              " yorum"
            ] }),
            distanceKm && /* @__PURE__ */ jsxs("span", { className: "inline-flex items-center gap-1", children: [
              /* @__PURE__ */ jsx(MapPin, { className: "h-3 w-3" }),
              distanceKm,
              " km"
            ] }),
            c.star_rating != null && /* @__PURE__ */ jsx("span", { className: "inline-flex items-center gap-0.5 text-amber-600", children: Array.from({ length: Math.round(Number(c.star_rating)) }).map((_, i) => /* @__PURE__ */ jsx(Star, { className: "h-3 w-3 fill-current" }, i)) }),
            c.segment && SEGMENT_LABEL[c.segment] && /* @__PURE__ */ jsx(Badge, { variant: "outline", className: "h-5 px-1.5 text-[10px] font-normal", children: SEGMENT_LABEL[c.segment] }),
            priceLabel(c.price_tier) && /* @__PURE__ */ jsx("span", { className: "text-foreground/70 font-medium", children: priceLabel(c.price_tier) })
          ] })
        ] }),
        c.match_score != null && /* @__PURE__ */ jsxs(Tooltip, { children: [
          /* @__PURE__ */ jsx(TooltipTrigger, { asChild: true, children: /* @__PURE__ */ jsx(Badge, { variant: "outline", className: `${scoreColor(c.match_score)} cursor-help`, children: Math.round(c.match_score) }) }),
          /* @__PURE__ */ jsx(TooltipContent, { className: "text-xs", children: c.match_score_breakdown ? /* @__PURE__ */ jsxs("div", { className: "space-y-0.5", children: [
            /* @__PURE__ */ jsx("div", { className: "font-medium mb-1", children: "Eşleşme skoru kırılımı" }),
            /* @__PURE__ */ jsxs("div", { children: [
              "Yakınlık: ",
              c.match_score_breakdown.proximity ?? 0,
              "/40"
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              "Yıldız uyumu: ",
              c.match_score_breakdown.star ?? 0,
              "/20"
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              "Segment uyumu: ",
              c.match_score_breakdown.segment ?? 0,
              "/15"
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              "Fiyat uyumu: ",
              c.match_score_breakdown.price ?? 0,
              "/15"
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              "Yorum hacmi: ",
              c.match_score_breakdown.volume ?? 0,
              "/10"
            ] })
          ] }) : /* @__PURE__ */ jsx("span", { children: "Eşleşme skoru" }) })
        ] })
      ] }),
      confirmed && /* @__PURE__ */ jsxs("div", { className: "text-xs text-muted-foreground flex flex-wrap gap-x-2", children: [
        reviewCount && reviewCount > 0 ? /* @__PURE__ */ jsxs(
          "button",
          {
            type: "button",
            onClick: () => setReviewsOpen(true),
            className: "text-primary hover:underline font-medium",
            children: [
              reviewCount,
              " yorum toplandı — görüntüle"
            ]
          }
        ) : /* @__PURE__ */ jsx("span", { children: "0 yorum toplandı" }),
        c.last_scraped_at && /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsx("span", { children: "·" }),
          /* @__PURE__ */ jsxs("span", { children: [
            "son tarama: ",
            relativeTime(c.last_scraped_at)
          ] })
        ] }),
        fetching && /* @__PURE__ */ jsx("span", { className: "text-primary", children: "başlatılıyor…" }),
        !fetching && pending && /* @__PURE__ */ jsxs("span", { className: "text-primary inline-flex items-center gap-1", children: [
          /* @__PURE__ */ jsx(Loader2, { className: "h-3 w-3 animate-spin" }),
          " yorumlar çekiliyor (~2-5 dk)"
        ] })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "flex justify-end", children: actions })
    ] }),
    confirmed && /* @__PURE__ */ jsx(
      CompetitorReviewsDrawer,
      {
        open: reviewsOpen,
        onOpenChange: setReviewsOpen,
        competitorId: c.id,
        competitorName: c.name,
        totalCount: reviewCount ?? 0
      }
    )
  ] });
}
function BriefView({
  brief,
  businessName,
  onRegenerate,
  regenerating
}) {
  const s = brief.sections || {};
  const rising = Array.isArray(s.topics_on_the_rise) ? s.topics_on_the_rise : [];
  const actions = Array.isArray(s.three_actions) ? s.three_actions : [];
  return /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between gap-3", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsxs("p", { className: "text-xs uppercase tracking-wider text-muted-foreground", children: [
          "Bu hafta pazarınızda · ",
          businessName
        ] }),
        /* @__PURE__ */ jsx("h2", { className: "text-2xl sm:text-3xl font-semibold tracking-tight mt-2 max-w-2xl", children: s.headline ?? "Bu hafta için brief" })
      ] }),
      /* @__PURE__ */ jsxs(Button, { variant: "outline", size: "sm", onClick: onRegenerate, disabled: regenerating, children: [
        regenerating ? /* @__PURE__ */ jsx(Loader2, { className: "h-4 w-4 animate-spin" }) : /* @__PURE__ */ jsx(RefreshCw, { className: "h-4 w-4" }),
        "Yenile"
      ] })
    ] }),
    /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsxs(CardContent, { className: "p-6 divide-y", children: [
      /* @__PURE__ */ jsx(BriefRow, { label: "En güçlü avantajınız", value: s.strongest_advantage }),
      /* @__PURE__ */ jsx(BriefRow, { label: "En büyük açığınız", value: s.biggest_gap }),
      /* @__PURE__ */ jsx(BriefRow, { label: "En aktif rakip", value: s.most_active_competitor }),
      /* @__PURE__ */ jsxs("div", { className: "py-4", children: [
        /* @__PURE__ */ jsx("p", { className: "text-xs uppercase tracking-wider text-muted-foreground mb-2", children: "Yükselen konular" }),
        rising.length > 0 ? /* @__PURE__ */ jsx("div", { className: "flex flex-wrap gap-2", children: rising.map((t, i) => /* @__PURE__ */ jsx(Badge, { variant: "secondary", children: t }, i)) }) : /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: "—" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxs(Card, { children: [
      /* @__PURE__ */ jsx(CardHeader, { children: /* @__PURE__ */ jsx(CardTitle, { className: "text-base", children: "Bu hafta yapılacak 3 şey" }) }),
      /* @__PURE__ */ jsx(CardContent, { children: actions.length > 0 ? /* @__PURE__ */ jsx("ol", { className: "space-y-3", children: actions.map((a, i) => /* @__PURE__ */ jsxs("li", { className: "flex gap-3", children: [
        /* @__PURE__ */ jsx("span", { className: "flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-medium flex items-center justify-center", children: i + 1 }),
        /* @__PURE__ */ jsx("span", { className: "text-sm", children: a })
      ] }, i)) }) : /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: "Henüz aksiyon yok." }) })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center gap-2 text-xs text-muted-foreground", children: [
      brief.signal_strength != null && /* @__PURE__ */ jsxs(Badge, { variant: "outline", children: [
        "Sinyal: ",
        brief.signal_strength,
        "/10"
      ] }),
      /* @__PURE__ */ jsxs("span", { children: [
        brief.reviews_analysed ?? 0,
        " yorum · ",
        brief.competitors_count ?? 0,
        " rakip analiz edildi"
      ] })
    ] })
  ] });
}
function BriefRow({ label, value }) {
  return /* @__PURE__ */ jsxs("div", { className: "py-4 first:pt-0 last:pb-0", children: [
    /* @__PURE__ */ jsx("p", { className: "text-xs uppercase tracking-wider text-muted-foreground mb-1", children: label }),
    /* @__PURE__ */ jsx("p", { className: "text-sm", children: value ?? "—" })
  ] });
}
const SEGMENT_OPTIONS = [
  { value: "luxury", label: "Lüks" },
  { value: "boutique", label: "Butik" },
  { value: "resort", label: "Resort" },
  { value: "business", label: "Business" },
  { value: "budget", label: "Ekonomik" },
  { value: "bnb", label: "B&B" },
  { value: "hostel", label: "Hostel" },
  { value: "apart", label: "Apart" }
];
function OwnProfileCard({
  business,
  onSaved
}) {
  const [open, setOpen] = useState(false);
  const [star, setStar] = useState((business == null ? void 0 : business.star_rating) != null ? String(business.star_rating) : "");
  const [segment, setSegment] = useState((business == null ? void 0 : business.segment) ?? "");
  const [price, setPrice] = useState((business == null ? void 0 : business.price_tier) != null ? String(business.price_tier) : "");
  const [priceEur, setPriceEur] = useState(
    (business == null ? void 0 : business.price_estimate_eur) != null ? String(business.price_estimate_eur) : ""
  );
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    setStar((business == null ? void 0 : business.star_rating) != null ? String(business.star_rating) : "");
    setSegment((business == null ? void 0 : business.segment) ?? "");
    setPrice((business == null ? void 0 : business.price_tier) != null ? String(business.price_tier) : "");
    setPriceEur((business == null ? void 0 : business.price_estimate_eur) != null ? String(business.price_estimate_eur) : "");
  }, [business == null ? void 0 : business.id, business == null ? void 0 : business.star_rating, business == null ? void 0 : business.segment, business == null ? void 0 : business.price_tier]);
  if (!business) return null;
  const hasAll = business.star_rating != null && business.segment && business.price_tier != null;
  async function save() {
    setSaving(true);
    const { error } = await supabase.from("businesses").update({
      star_rating: star ? Number(star) : null,
      segment: segment || null,
      price_tier: price ? Number(price) : null,
      price_estimate_eur: priceEur ? Number(priceEur) : null
    }).eq("id", business.id);
    setSaving(false);
    if (error) {
      toast({ title: "Kaydedilemedi", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Otel profili güncellendi", description: "Akıllı eşleştirme aktif." });
    setOpen(false);
    onSaved();
  }
  return /* @__PURE__ */ jsx(Card, { className: hasAll ? "" : "border-primary/40 bg-primary/5", children: /* @__PURE__ */ jsxs(CardContent, { className: "p-4 flex flex-col sm:flex-row sm:items-center gap-3 justify-between", children: [
    /* @__PURE__ */ jsxs("div", { className: "text-sm", children: [
      /* @__PURE__ */ jsx("div", { className: "font-medium", children: "Otelinizin profili" }),
      /* @__PURE__ */ jsx("div", { className: "text-xs text-muted-foreground mt-0.5", children: hasAll ? /* @__PURE__ */ jsxs(Fragment, { children: [
        Number(business.star_rating),
        "★ · ",
        SEGMENT_LABEL[business.segment] ?? business.segment,
        " · ",
        priceLabel(business.price_tier),
        " — akıllı eşleştirme aktif"
      ] }) : "Yıldız, segment ve fiyat seviyenizi girin; rakip eşleştirme çok daha hassas olsun." })
    ] }),
    /* @__PURE__ */ jsxs(Dialog, { open, onOpenChange: setOpen, children: [
      /* @__PURE__ */ jsx(DialogTrigger, { asChild: true, children: /* @__PURE__ */ jsx(Button, { size: "sm", variant: hasAll ? "outline" : "default", children: hasAll ? "Düzenle" : "Profili tamamla" }) }),
      /* @__PURE__ */ jsxs(DialogContent, { children: [
        /* @__PURE__ */ jsx(DialogHeader, { children: /* @__PURE__ */ jsx(DialogTitle, { children: "Otelinizin profili" }) }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "text-xs font-medium mb-1.5 block", children: "Yıldız" }),
            /* @__PURE__ */ jsxs(Select, { value: star, onValueChange: setStar, children: [
              /* @__PURE__ */ jsx(SelectTrigger, { children: /* @__PURE__ */ jsx(SelectValue, { placeholder: "Seçin" }) }),
              /* @__PURE__ */ jsx(SelectContent, { children: [1, 2, 3, 4, 5].map((n) => /* @__PURE__ */ jsxs(SelectItem, { value: String(n), children: [
                n,
                " yıldız"
              ] }, n)) })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "text-xs font-medium mb-1.5 block", children: "Segment" }),
            /* @__PURE__ */ jsxs(Select, { value: segment, onValueChange: setSegment, children: [
              /* @__PURE__ */ jsx(SelectTrigger, { children: /* @__PURE__ */ jsx(SelectValue, { placeholder: "Seçin" }) }),
              /* @__PURE__ */ jsx(SelectContent, { children: SEGMENT_OPTIONS.map((s) => /* @__PURE__ */ jsx(SelectItem, { value: s.value, children: s.label }, s.value)) })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "text-xs font-medium mb-1.5 block", children: "Fiyat seviyesi" }),
            /* @__PURE__ */ jsxs(Select, { value: price, onValueChange: setPrice, children: [
              /* @__PURE__ */ jsx(SelectTrigger, { children: /* @__PURE__ */ jsx(SelectValue, { placeholder: "Seçin" }) }),
              /* @__PURE__ */ jsxs(SelectContent, { children: [
                /* @__PURE__ */ jsx(SelectItem, { value: "1", children: "₺ — Ekonomik" }),
                /* @__PURE__ */ jsx(SelectItem, { value: "2", children: "₺₺ — Orta" }),
                /* @__PURE__ */ jsx(SelectItem, { value: "3", children: "₺₺₺ — Üst" }),
                /* @__PURE__ */ jsx(SelectItem, { value: "4", children: "₺₺₺₺ — Lüks" })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsxs("label", { className: "text-xs font-medium mb-1.5 block", children: [
              "Ortalama oda fiyatı (€/gece) ",
              /* @__PURE__ */ jsx("span", { className: "text-muted-foreground font-normal", children: "— opsiyonel" })
            ] }),
            /* @__PURE__ */ jsx(
              Input,
              {
                type: "number",
                inputMode: "decimal",
                min: 0,
                placeholder: "örn. 120",
                value: priceEur,
                onChange: (e) => setPriceEur(e.target.value)
              }
            ),
            /* @__PURE__ */ jsx("p", { className: "text-[11px] text-muted-foreground mt-1", children: "Fiyat pozisyonu kartı için kullanılır." })
          ] })
        ] }),
        /* @__PURE__ */ jsxs(DialogFooter, { children: [
          /* @__PURE__ */ jsx(Button, { variant: "outline", onClick: () => setOpen(false), children: "Vazgeç" }),
          /* @__PURE__ */ jsxs(Button, { onClick: save, disabled: saving, children: [
            saving && /* @__PURE__ */ jsx(Loader2, { className: "h-4 w-4 animate-spin" }),
            "Kaydet"
          ] })
        ] })
      ] })
    ] })
  ] }) });
}
export {
  Intelligence as default
};
