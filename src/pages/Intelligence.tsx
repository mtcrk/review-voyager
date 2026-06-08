import { useEffect, useMemo, useRef, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useBusiness } from "@/contexts/BusinessContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Loader2,
  Plus,
  RefreshCw,
  Sparkles,
  Star,
  X,
  Check,
  MapPin,
  CheckCircle2,
  Download,
} from "lucide-react";
import { IntelligenceTabs } from "@/components/intelligence/IntelligenceTabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Clock } from "lucide-react";

type Competitor = {
  id: string;
  business_id: string;
  name: string;
  place_id: string | null;
  rating: number | null;
  review_count: number | null;
  match_score: number | null;
  proximity_m: number | null;
  status: string;
  source: string;
  created_at: string;
  star_rating?: number | null;
  segment?: string | null;
  price_tier?: number | null;
  match_score_breakdown?: {
    proximity?: number;
    star?: number;
    segment?: number;
    price?: number;
    volume?: number;
  } | null;
};

type Brief = {
  id: string;
  business_id: string;
  bucket_week: string;
  sections: any;
  signal_strength: number | null;
  reviews_analysed: number | null;
  competitors_count: number | null;
  generated_at: string;
};

const RADIUS_OPTIONS = [
  { label: "2 km", value: 2000 },
  { label: "5 km", value: 5000 },
  { label: "10 km", value: 10000 },
];

const SEGMENT_LABEL: Record<string, string> = {
  luxury: "Lüks",
  boutique: "Butik",
  resort: "Resort",
  business: "Business",
  budget: "Ekonomik",
  bnb: "B&B",
  hostel: "Hostel",
  apart: "Apart",
};

function priceLabel(t?: number | null) {
  if (!t) return null;
  return "₺".repeat(Math.max(1, Math.min(4, t)));
}

function scoreColor(score: number | null) {
  if (score == null) return "bg-muted text-muted-foreground";
  if (score >= 70) return "bg-green-100 text-green-700 border-green-200";
  if (score >= 40) return "bg-amber-100 text-amber-700 border-amber-200";
  return "bg-muted text-muted-foreground";
}

function relativeTime(iso?: string | null) {
  if (!iso) return null;
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "az önce";
  if (m < 60) return `${m} dk önce`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} sa önce`;
  const d = Math.floor(h / 24);
  return `${d} gün önce`;
}

export default function Intelligence() {
  const { activeBusiness, businesses, setActiveBusiness, loading: businessLoading } = useBusiness();
  const businessId = activeBusiness?.id;
  const queryClient = useQueryClient();

  const [discovering, setDiscovering] = useState(false);
  const [radius, setRadius] = useState(5000);
  const [generatingBrief, setGeneratingBrief] = useState(false);
  const [fetchingId, setFetchingId] = useState<string | null>(null);
  const [fetchingAll, setFetchingAll] = useState(false);
  const [bulkOpen, setBulkOpen] = useState(false);

  // Phase 4 filters
  const [filterSameSegment, setFilterSameSegment] = useState(false);
  const [filterSameStar, setFilterSameStar] = useState(false);

  const [addOpen, setAddOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [suggestions, setSuggestions] = useState<
    { place_id: string; main_text: string; secondary_text: string; full_text: string }[]
  >([]);
  const [addingPlaceId, setAddingPlaceId] = useState<string | null>(null);
  const searchSeq = useRef(0);

  // Pending fetch tracking: competitor_id -> started timestamp
  const PENDING_KEY = businessId ? `ci_pending_fetches_${businessId}` : "ci_pending_fetches";
  const [pendingFetches, setPendingFetches] = useState<Record<string, number>>(() => {
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

  function markPending(ids: string[]) {
    setPendingFetches((prev) => {
      const next = { ...prev };
      const now = Date.now();
      for (const id of ids) next[id] = now;
      try {
        localStorage.setItem(PENDING_KEY, JSON.stringify(next));
      } catch {}
      return next;
    });
  }

  function clearPending(id: string) {
    setPendingFetches((prev) => {
      const next = { ...prev };
      delete next[id];
      try {
        localStorage.setItem(PENDING_KEY, JSON.stringify(next));
      } catch {}
      return next;
    });
  }

  const competitorsKey = ["ci_competitors", businessId] as const;
  const reviewStatsKey = ["ci_competitor_review_stats", businessId] as const;

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
          lat: activeBusiness?.lat ? Number(activeBusiness.lat) : undefined,
          lng: activeBusiness?.lng ? Number(activeBusiness.lng) : undefined,
        },
      });
      if (seq !== searchSeq.current) return;
      setSearching(false);
      if (error) {
        setSuggestions([]);
        return;
      }
      setSuggestions((data as any)?.suggestions ?? []);
    }, 300);
    return () => clearTimeout(t);
  }, [searchQuery, activeBusiness?.lat, activeBusiness?.lng]);

  const competitorsQuery = useQuery({
    queryKey: competitorsKey,
    enabled: !!businessId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ci_competitors")
        .select("*")
        .eq("business_id", businessId!)
        .neq("status", "rejected")
        .order("match_score", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Competitor[];
    },
  });

  const briefQuery = useQuery({
    queryKey: ["ci_monday_brief", businessId],
    enabled: !!businessId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ci_monday_briefs")
        .select("*")
        .eq("business_id", businessId!)
        .order("bucket_week", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return (data as Brief) ?? null;
    },
  });

  const lastRunQuery = useQuery({
    queryKey: ["ci_last_run", businessId],
    enabled: !!businessId,
    queryFn: async () => {
      const { data } = await supabase
        .from("ci_discovery_runs")
        .select("ran_at")
        .eq("business_id", businessId!)
        .order("ran_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      return (data?.ran_at as string | undefined) ?? null;
    },
  });

  const reviewStatsQuery = useQuery({
    queryKey: reviewStatsKey,
    enabled: !!businessId,
    refetchInterval: Object.keys(pendingFetches).length > 0 ? 15000 : false,
    queryFn: async () => {
      const { data: comps } = await supabase
        .from("ci_competitors")
        .select("id")
        .eq("business_id", businessId!)
        .eq("status", "confirmed");
      const ids = (comps ?? []).map((c) => c.id);
      if (ids.length === 0) return {} as Record<string, number>;
      const { data } = await supabase
        .from("ci_competitor_reviews")
        .select("competitor_id")
        .in("competitor_id", ids);
      const counts: Record<string, number> = {};
      for (const r of data ?? []) {
        counts[r.competitor_id] = (counts[r.competitor_id] ?? 0) + 1;
      }
      return counts;
    },
  });
  const reviewCounts = reviewStatsQuery.data ?? {};

  // Auto-clear pending when reviews arrive or after 15 min timeout
  useEffect(() => {
    const now = Date.now();
    const TIMEOUT_MS = 15 * 60 * 1000;
    for (const [id, startedAt] of Object.entries(pendingFetches)) {
      if ((reviewCounts[id] ?? 0) > 0 || now - startedAt > TIMEOUT_MS) {
        clearPending(id);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reviewCounts]);

  const competitors = competitorsQuery.data ?? [];
  const loadingComp = competitorsQuery.isLoading;
  const brief = briefQuery.data ?? null;
  const loadingBrief = briefQuery.isLoading;

  const suggested = useMemo(
    () =>
      competitors
        .filter((c) => c.status === "suggested")
        .filter((c) => {
          if (!filterSameSegment) return true;
          return c.segment && (activeBusiness as any)?.segment && c.segment === (activeBusiness as any).segment;
        })
        .filter((c) => {
          if (!filterSameStar) return true;
          const own = (activeBusiness as any)?.star_rating;
          return c.star_rating != null && own != null && Math.abs(Number(c.star_rating) - Number(own)) < 0.5;
        })
        .sort((a, b) => (b.match_score ?? 0) - (a.match_score ?? 0)),
    [competitors, filterSameSegment, filterSameStar, activeBusiness],
  );
  const confirmed = useMemo(
    () => competitors.filter((c) => c.status === "confirmed"),
    [competitors],
  );

  async function discover() {
    if (!businessId) return;
    const before = competitors.filter((c) => c.status === "suggested").length;
    setDiscovering(true);
    const { data, error } = await supabase.functions.invoke("discover-competitors", {
      body: { business_id: businessId, radius_m: radius },
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
        const { data: d } = await supabase
          .from("ci_competitors")
          .select("*")
          .eq("business_id", businessId)
          .neq("status", "rejected")
          .order("match_score", { ascending: false });
        return (d ?? []) as Competitor[];
      },
    });
    const found = data?.candidates_found ?? 0;
    const suggestedCount = data?.suggested_count ?? 0;
    const afterSuggested = fresh.filter((c) => c.status === "suggested").length;
    const newCount = Math.max(0, afterSuggested - before);
    if (suggestedCount === 0 || newCount === 0) {
      toast({
        title: "Yeni öneri bulunamadı",
        description: "Daha geniş bir yarıçap deneyin (örn. 10 km).",
      });
    } else {
      toast({
        title: "Tarama tamamlandı",
        description: `${found} işletme tarandı, ${newCount} yeni öneri eklendi.`,
      });
    }
  }

  async function setStatus(id: string, status: "confirmed" | "rejected") {
    const prev = queryClient.getQueryData<Competitor[]>(competitorsKey) ?? [];
    queryClient.setQueryData<Competitor[]>(
      competitorsKey,
      status === "rejected"
        ? prev.filter((c) => c.id !== id)
        : prev.map((c) => (c.id === id ? { ...c, status } : c)),
    );
    const { error } = await supabase.from("ci_competitors").update({ status }).eq("id", id);
    if (error) {
      queryClient.setQueryData(competitorsKey, prev);
      toast({ title: "Hata", description: error.message, variant: "destructive" });
    }
  }

  async function selectSuggestion(s: { place_id: string; main_text: string; full_text: string }) {
    if (!businessId) return;
    setAddingPlaceId(s.place_id);
    const { data, error } = await supabase.functions.invoke("places-autocomplete", {
      body: { place_id: s.place_id, details: true },
    });
    const place = (data as any)?.place;
    const name = place?.name || s.main_text || s.full_text;
    const { error: insErr } = await supabase.from("ci_competitors").insert({
      business_id: businessId,
      name,
      place_id: s.place_id,
      lat: place?.lat ?? null,
      lng: place?.lng ?? null,
      rating: place?.rating ?? null,
      review_count: place?.review_count ?? null,
      source: "manual",
      status: "confirmed",
    });
    setAddingPlaceId(null);
    if (error || insErr) {
      toast({
        title: "Eklenemedi",
        description: insErr?.message ?? error?.message ?? "Bilinmeyen hata",
        variant: "destructive",
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
      body: { business_id: businessId },
    });
    setGeneratingBrief(false);
    if (error) {
      toast({ title: "Brief oluşturulamadı", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Brief hazır", description: "En son brief yüklendi." });
    queryClient.invalidateQueries({ queryKey: ["ci_monday_brief", businessId] });
  }

  async function fetchReviewsFor(c: Competitor) {
    setFetchingId(c.id);
    const { data, error } = await supabase.functions.invoke("fetch-competitor-reviews", {
      body: { competitor_id: c.id },
    });
    setFetchingId(null);
    if (error) {
      toast({ title: "Yorum çekme başlatılamadı", description: error.message, variant: "destructive" });
      return;
    }
    const skipped = (data as any)?.skipped?.[0];
    const noPlace = (data as any)?.no_place_id?.[0];
    if (noPlace) {
      toast({ title: `${c.name}`, description: "Place ID bulunamadı, çekme atlandı." });
    } else if (skipped?.reason === "within_7d_cooldown") {
      toast({ title: `${c.name}`, description: "Son 7 günde tarandı (tekrar için bekleyin)." });
    } else if ((data as any)?.started?.length) {
      markPending([c.id]);
      toast({
        title: `${c.name} için yorum toplama başlatıldı`,
        description: "Apify yorumları çekiyor. 2-5 dk sürer, bu sayfada otomatik güncellenir.",
      });
    } else {
      toast({ title: `${c.name}`, description: "İşlem başlatılamadı." });
    }
    queryClient.invalidateQueries({ queryKey: competitorsKey });
    queryClient.invalidateQueries({ queryKey: reviewStatsKey });
  }

  async function fetchReviewsAll() {
    if (!businessId) return;
    setFetchingAll(true);
    const { data, error } = await supabase.functions.invoke("fetch-competitor-reviews", {
      body: { business_id: businessId },
    });
    setFetchingAll(false);
    setBulkOpen(false);
    if (error) {
      toast({ title: "Toplu çekme başarısız", description: error.message, variant: "destructive" });
      return;
    }
    const startedN = (data as any)?.started?.length ?? 0;
    const skippedN = (data as any)?.skipped?.length ?? 0;
    const startedIds = ((data as any)?.started ?? []).map((s: any) => s.competitor_id);
    if (startedIds.length) markPending(startedIds);
    toast({
      title: "Yorum çekme başlatıldı",
      description: `${startedN} rakip için başlatıldı, ${skippedN} atlandı. Sonuçlar 2-5 dk içinde otomatik gelir.`,
    });
    queryClient.invalidateQueries({ queryKey: competitorsKey });
    queryClient.invalidateQueries({ queryKey: reviewStatsKey });
  }

  // Business context still loading — show skeleton instead of "select a business"
  if (businessLoading) {
    return (
      <div className="p-4 sm:p-6 max-w-6xl mx-auto space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-96 max-w-full" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-28 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (!businessId) {
    return (
      <div className="p-6">
        <p className="text-muted-foreground">Önce bir işletme seçin.</p>
      </div>
    );
  }

  const lastRun = relativeTime(lastRunQuery.data);

  return (
    <TooltipProvider delayDuration={200}>
      <Helmet>
        <title>Rakip Analizi · VoyageRespond</title>
      </Helmet>
      <div className="p-4 sm:p-6 max-w-6xl mx-auto space-y-6">
        <IntelligenceTabs />
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">Rakip Analizi</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Bölgenizdeki rakipleri otomatik keşfedin ve haftalık stratejik brief alın.
          </p>
          {businesses.length > 1 && (
            <div className="mt-3 flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <Select
                value={activeBusiness?.id}
                onValueChange={(id) => {
                  const b = businesses.find((x) => x.id === id);
                  if (b) setActiveBusiness(b);
                }}
              >
                <SelectTrigger className="w-full sm:w-[280px] h-9">
                  <SelectValue placeholder="Lokasyon seçin" />
                </SelectTrigger>
                <SelectContent>
                  {businesses.map((b) => (
                    <SelectItem key={b.id} value={b.id}>
                      {b.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          {!loadingComp && (
            <div className="text-xs text-muted-foreground mt-2 flex flex-wrap gap-x-2 gap-y-1">
              <span>{confirmed.length} rakip takip ediliyor</span>
              <span>·</span>
              <span>{suggested.length} öneri bekliyor</span>
              {lastRun && (
                <>
                  <span>·</span>
                  <span>son keşif: {lastRun}</span>
                </>
              )}
            </div>
          )}
        </div>

        <Tabs defaultValue="competitors">
          <TabsList>
            <TabsTrigger value="competitors">Rakipler</TabsTrigger>
            <TabsTrigger value="brief">Haftalık Brief</TabsTrigger>
          </TabsList>

          {/* ===== TAB 1: COMPETITORS ===== */}
          <TabsContent value="competitors" className="space-y-6 mt-4">
            {Object.keys(pendingFetches).length > 0 && (
              <Alert className="border-primary/40 bg-primary/5">
                <Clock className="h-4 w-4 text-primary" />
                <AlertDescription className="text-sm">
                  <span className="font-medium text-foreground">
                    {Object.keys(pendingFetches).length} rakip için yorumlar Apify'dan çekiliyor.
                  </span>{" "}
                  Genellikle 2-5 dakika sürer. Sayfa açık kaldığı sürece otomatik güncellenir — beklemek
                  zorunda değilsiniz, başka bir sekmeye geçebilirsiniz.
                </AlertDescription>
              </Alert>
            )}
            <Card>
              <CardContent className="p-4 sm:p-6 flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm text-muted-foreground mr-1">Yarıçap:</span>
                  {RADIUS_OPTIONS.map((r) => (
                    <Button
                      key={r.value}
                      size="sm"
                      variant={radius === r.value ? "default" : "outline"}
                      onClick={() => setRadius(r.value)}
                    >
                      {r.label}
                    </Button>
                  ))}
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Dialog open={addOpen} onOpenChange={setAddOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" className="w-full sm:w-auto">
                        <Plus className="h-4 w-4" /> Rakip Ekle
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Rakip Ekle</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-3">
                        <div className="relative">
                          <Input
                            placeholder="Rakip otel ara..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            autoFocus
                          />
                          {searching && (
                            <Loader2 className="h-4 w-4 animate-spin absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                          )}
                        </div>
                        <div className="max-h-80 overflow-y-auto border rounded-md divide-y">
                          {searchQuery.trim().length < 2 ? (
                            <div className="p-4 text-sm text-muted-foreground text-center">
                              Aramak için en az 2 karakter yazın.
                            </div>
                          ) : suggestions.length === 0 && !searching ? (
                            <div className="p-4 text-sm text-muted-foreground text-center">
                              Sonuç bulunamadı
                            </div>
                          ) : (
                            suggestions.map((s) => (
                              <button
                                key={s.place_id}
                                type="button"
                                onClick={() => selectSuggestion(s)}
                                disabled={addingPlaceId !== null}
                                className="w-full text-left px-3 py-2.5 hover:bg-accent transition-colors flex items-start gap-2 disabled:opacity-50"
                              >
                                <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                                <div className="flex-1 min-w-0">
                                  <div className="text-sm font-medium truncate">{s.main_text}</div>
                                  {s.secondary_text && (
                                    <div className="text-xs text-muted-foreground truncate">
                                      {s.secondary_text}
                                    </div>
                                  )}
                                </div>
                                {addingPlaceId === s.place_id && (
                                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                                )}
                              </button>
                            ))
                          )}
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                  <Button onClick={discover} disabled={discovering} className="w-full sm:w-auto">
                    {discovering ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" /> Bölgeniz taranıyor...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4" /> Rakipleri Keşfet
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {loadingComp ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[0, 1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-28 w-full" />
                ))}
              </div>
            ) : (
              <>
                {/* Confirmed FIRST */}
                {confirmed.length > 0 && (
                  <section>
                    <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
                      <div className="flex items-center gap-2">
                        <h2 className="text-sm font-medium">Rakiplerim</h2>
                        <Badge variant="secondary" className="h-5">
                          {confirmed.length}
                        </Badge>
                      </div>
                      <Dialog open={bulkOpen} onOpenChange={setBulkOpen}>
                        <DialogTrigger asChild>
                          <Button size="sm" variant="outline" disabled={fetchingAll}>
                            {fetchingAll ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Download className="h-4 w-4" />
                            )}
                            Tüm rakiplerin yorumlarını çek
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Tüm rakipler için yorum çekilsin mi?</DialogTitle>
                          </DialogHeader>
                          <p className="text-sm text-muted-foreground">
                            Bu işlem Apify üzerinden onaylı rakipleriniz için yorum toplamayı tetikler
                            ve birkaç dakika sürebilir. Son 7 gün içinde taranan rakipler atlanır.
                          </p>
                          <DialogFooter>
                            <Button variant="outline" onClick={() => setBulkOpen(false)}>
                              Vazgeç
                            </Button>
                            <Button onClick={fetchReviewsAll} disabled={fetchingAll}>
                              {fetchingAll && <Loader2 className="h-4 w-4 animate-spin" />}
                              Başlat
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {confirmed.map((c) => (
                        <CompetitorCard
                          key={c.id}
                          c={c}
                          confirmed
                          reviewCount={reviewCounts[c.id] ?? 0}
                          fetching={fetchingId === c.id}
                          pending={!!pendingFetches[c.id]}
                          actions={
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => fetchReviewsFor(c)}
                                disabled={fetchingId === c.id || !c.place_id}
                              >
                                {fetchingId === c.id ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Download className="h-4 w-4" />
                                )}
                                Yorumları Çek
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setStatus(c.id, "rejected")}
                              >
                                <X className="h-4 w-4" /> Çıkar
                              </Button>
                            </div>
                          }
                        />
                      ))}
                    </div>
                  </section>
                )}

                {/* Suggested */}
                <section>
                  <div className="flex items-center gap-2 mb-2">
                    <h2 className="text-sm font-medium">Önerilen Rakipler</h2>
                    <Badge variant="secondary" className="h-5">
                      {suggested.length}
                    </Badge>
                    {((activeBusiness as any)?.segment || (activeBusiness as any)?.star_rating != null) && (
                      <div className="ml-auto flex items-center gap-2">
                        {(activeBusiness as any)?.segment && (
                          <Button
                            size="sm"
                            variant={filterSameSegment ? "default" : "outline"}
                            className="h-7 text-xs"
                            onClick={() => setFilterSameSegment((v) => !v)}
                          >
                            Sadece aynı segment
                          </Button>
                        )}
                        {(activeBusiness as any)?.star_rating != null && (
                          <Button
                            size="sm"
                            variant={filterSameStar ? "default" : "outline"}
                            className="h-7 text-xs"
                            onClick={() => setFilterSameStar((v) => !v)}
                          >
                            Sadece aynı yıldız
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                  {suggested.length === 0 && confirmed.length === 0 ? (
                    <Card>
                      <CardContent className="p-8 text-center space-y-3">
                        <Sparkles className="h-8 w-8 mx-auto text-muted-foreground" />
                        <h3 className="font-medium">Henüz rakip yok</h3>
                        <p className="text-sm text-muted-foreground max-w-md mx-auto">
                          Sisteminiz lokasyonunuza ve seviyenize göre benzer işletmeleri otomatik
                          keşfeder. Başlamak için aşağıdaki butona tıklayın.
                        </p>
                        <Button onClick={discover} disabled={discovering}>
                          {discovering ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Sparkles className="h-4 w-4" />
                          )}
                          Rakipleri Keşfet
                        </Button>
                      </CardContent>
                    </Card>
                  ) : suggested.length === 0 ? (
                    <Card>
                      <CardContent className="p-6 text-center space-y-2">
                        <CheckCircle2 className="h-7 w-7 mx-auto text-green-600" />
                        <h3 className="font-medium">Tüm öneriler incelendi</h3>
                        <p className="text-sm text-muted-foreground">
                          Harika iş! Haftalık Brief sekmesinden stratejik özetinize göz atın.
                        </p>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {suggested.map((c) => (
                        <CompetitorCard
                          key={c.id}
                          c={c}
                          actions={
                            <div className="flex gap-2">
                              <Button size="sm" onClick={() => setStatus(c.id, "confirmed")}>
                                <Check className="h-4 w-4" /> Rakibim
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setStatus(c.id, "rejected")}
                              >
                                <X className="h-4 w-4" /> Rakip Değil
                              </Button>
                            </div>
                          }
                        />
                      ))}
                    </div>
                  )}
                </section>
              </>
            )}
          </TabsContent>

          {/* ===== TAB 2: BRIEF ===== */}
          <TabsContent value="brief" className="mt-4">
            {loadingBrief ? (
              <Skeleton className="h-64 w-full" />
            ) : brief ? (
              <BriefView
                brief={brief}
                businessName={activeBusiness?.name ?? ""}
                onRegenerate={generateBrief}
                regenerating={generatingBrief}
              />
            ) : (
              <Card>
                <CardContent className="p-8 text-center space-y-3">
                  <h3 className="font-medium">Brief henüz oluşturulmadı</h3>
                  <p className="text-sm text-muted-foreground max-w-md mx-auto">
                    İlk brief'iniz, en az 1 rakibi onayladıktan sonra oluşturulacak.
                  </p>
                  <Button onClick={generateBrief} disabled={generatingBrief || confirmed.length === 0}>
                    {generatingBrief ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Sparkles className="h-4 w-4" />
                    )}
                    Brief Oluştur
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </TooltipProvider>
  );
}

function CompetitorCard({
  c,
  actions,
  confirmed,
  reviewCount,
  fetching,
  pending,
}: {
  c: Competitor;
  actions: React.ReactNode;
  confirmed?: boolean;
  reviewCount?: number;
  fetching?: boolean;
  pending?: boolean;
}) {
  const distanceKm = c.proximity_m != null ? (c.proximity_m / 1000).toFixed(1) : null;
  return (
    <Card className={confirmed ? "border-l-2 border-l-primary" : ""}>
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 min-w-0">
              {confirmed && <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0" />}
              <Tooltip>
                <TooltipTrigger asChild>
                  <h3 className="font-medium truncate">{c.name}</h3>
                </TooltipTrigger>
                <TooltipContent>{c.name}</TooltipContent>
              </Tooltip>
            </div>
            <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1 flex-wrap">
              {c.rating != null && (
                <span className="inline-flex items-center gap-1">
                  <Star className="h-3 w-3 fill-current text-amber-500" />
                  {c.rating.toFixed(1)}
                </span>
              )}
              {c.review_count != null && <span>{c.review_count} yorum</span>}
              {distanceKm && (
                <span className="inline-flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {distanceKm} km
                </span>
              )}
            </div>
          </div>
          {c.match_score != null && (
            <Badge variant="outline" className={scoreColor(c.match_score)}>
              {Math.round(c.match_score)}
            </Badge>
          )}
        </div>
        {confirmed && (
          <div className="text-xs text-muted-foreground flex flex-wrap gap-x-2">
            <span>{reviewCount ?? 0} yorum toplandı</span>
            {(c as any).last_scraped_at && (
              <>
                <span>·</span>
                <span>son tarama: {relativeTime((c as any).last_scraped_at)}</span>
              </>
            )}
            {fetching && <span className="text-primary">başlatılıyor…</span>}
            {!fetching && pending && (
              <span className="text-primary inline-flex items-center gap-1">
                <Loader2 className="h-3 w-3 animate-spin" /> yorumlar çekiliyor (~2-5 dk)
              </span>
            )}
          </div>
        )}
        <div className="flex justify-end">{actions}</div>
      </CardContent>
    </Card>
  );
}

function BriefView({
  brief,
  businessName,
  onRegenerate,
  regenerating,
}: {
  brief: Brief;
  businessName: string;
  onRegenerate: () => void;
  regenerating: boolean;
}) {
  const s = brief.sections || {};
  const rising: string[] = Array.isArray(s.topics_on_the_rise) ? s.topics_on_the_rise : [];
  const actions: string[] = Array.isArray(s.three_actions) ? s.three_actions : [];

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-wider text-muted-foreground">
            Bu hafta pazarınızda · {businessName}
          </p>
          <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight mt-2 max-w-2xl">
            {s.headline ?? "Bu hafta için brief"}
          </h2>
        </div>
        <Button variant="outline" size="sm" onClick={onRegenerate} disabled={regenerating}>
          {regenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
          Yenile
        </Button>
      </div>

      <Card>
        <CardContent className="p-6 divide-y">
          <BriefRow label="En güçlü avantajınız" value={s.strongest_advantage} />
          <BriefRow label="En büyük açığınız" value={s.biggest_gap} />
          <BriefRow label="En aktif rakip" value={s.most_active_competitor} />
          <div className="py-4">
            <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
              Yükselen konular
            </p>
            {rising.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {rising.map((t, i) => (
                  <Badge key={i} variant="secondary">
                    {t}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">—</p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Bu hafta yapılacak 3 şey</CardTitle>
        </CardHeader>
        <CardContent>
          {actions.length > 0 ? (
            <ol className="space-y-3">
              {actions.map((a, i) => (
                <li key={i} className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-medium flex items-center justify-center">
                    {i + 1}
                  </span>
                  <span className="text-sm">{a}</span>
                </li>
              ))}
            </ol>
          ) : (
            <p className="text-sm text-muted-foreground">Henüz aksiyon yok.</p>
          )}
        </CardContent>
      </Card>

      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        {brief.signal_strength != null && (
          <Badge variant="outline">Sinyal: {brief.signal_strength}/10</Badge>
        )}
        <span>
          {brief.reviews_analysed ?? 0} yorum · {brief.competitors_count ?? 0} rakip analiz edildi
        </span>
      </div>
    </div>
  );
}

function BriefRow({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="py-4 first:pt-0 last:pb-0">
      <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">{label}</p>
      <p className="text-sm">{value ?? "—"}</p>
    </div>
  );
}
