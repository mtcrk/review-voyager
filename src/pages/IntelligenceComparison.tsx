import { useMemo } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
  Cell,
  LabelList,
  ReferenceLine,
  LineChart,
  Line,
  Legend,
} from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { useBusiness } from "@/contexts/BusinessContext";
import { normalizeRatingTo5 } from "@/lib/ratingScale";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Star,
  Sparkles,
  TrendingUp,
  TrendingDown,
  Minus,
  MessageSquare,
  Reply,
  Calendar,
  MapPin,
  Clock,
} from "lucide-react";
import { IntelligenceTabs } from "@/components/intelligence/IntelligenceTabs";
import { TopicAnalysis } from "@/components/intelligence/TopicAnalysis";
import { ActionPack } from "@/components/intelligence/ActionPack";
import { GuestOriginBreakdown } from "@/components/intelligence/GuestOriginBreakdown";

type Competitor = {
  id: string;
  name: string;
  rating: number | null;
  review_count: number | null;
  proximity_m: number | null;
  match_score: number | null;
};

type CompReviewRow = {
  competitor_id: string;
  platform: string | null;
  rating: number | null;
  posted_at: string | null;
};

type OwnReviewRow = {
  platform: string | null;
  rating: number | null;
  posted_at: string | null;
  status: string | null;
  approved_reply: string | null;
  replied_at: string | null;
};

type CompAllRow = {
  competitor_id: string;
  platform: string | null;
  rating: number | null;
  posted_at: string | null;
  owner_reply_text: string | null;
  owner_reply_at: string | null;
};

const PRIMARY = "hsl(var(--primary))";
const MUTED = "hsl(var(--muted-foreground))";

const PLATFORMS: { key: string; label: string }[] = [
  { key: "google", label: "Google (/5)" },
  { key: "booking", label: "Booking (/10)" },
  { key: "tripadvisor", label: "TripAdvisor (/5)" },
  { key: "expedia", label: "Expedia (/10)" },
  { key: "hotels", label: "Hotels.com (/10)" },
];

/** Map our internal platform keys to the keys used by ratingScale.ts */
function scaleKey(p: string | null | undefined): string {
  if (!p) return "google";
  if (p === "hotels") return "hotelscom";
  return p;
}

/** 0–100 reputation index from a native-scale rating. */
function toIndex100(rating: number, platform: string | null | undefined): number {
  return (normalizeRatingTo5(rating, scaleKey(platform)) / 5) * 100;
}

function median(values: number[]): number | null {
  if (!values.length) return null;
  const s = [...values].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
}

function daysBetween(from: string, to: string): number | null {
  const a = new Date(from).getTime();
  const b = new Date(to).getTime();
  if (isNaN(a) || isNaN(b) || b < a) return null;
  return (b - a) / 86400_000;
}

function normalizePlatform(p: string | null | undefined): string | null {
  if (!p) return null;
  const s = p.toLowerCase();
  if (s.includes("google")) return "google";
  if (s.includes("booking")) return "booking";
  if (s.includes("tripadvisor") || s === "ta") return "tripadvisor";
  if (s.includes("expedia")) return "expedia";
  if (s.includes("hotels") || s === "hotelscom") return "hotels";
  return s;
}

function fmtNum(n: number | null | undefined) {
  if (n == null) return "—";
  return new Intl.NumberFormat("tr-TR").format(Math.round(n));
}
function fmtRating(n: number | null | undefined) {
  if (n == null) return "—";
  return n.toFixed(1);
}
function truncate(s: string, n = 18) {
  return s.length > n ? s.slice(0, n - 1) + "…" : s;
}

function isoDaysAgo(d: number) {
  return new Date(Date.now() - d * 86400_000).toISOString();
}

function weekKey(iso: string) {
  const d = new Date(iso);
  const day = d.getUTCDay();
  const diff = d.getUTCDate() - day + (day === 0 ? -6 : 1); // Mon start
  const monday = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), diff));
  return monday.toISOString().slice(0, 10);
}

export default function IntelligenceComparison() {
  const { activeBusiness, businesses, setActiveBusiness, loading: businessLoading } = useBusiness();
  const businessId = activeBusiness?.id;

  const dataQuery = useQuery({
    queryKey: ["comparison-v2", businessId],
    enabled: !!businessId,
    queryFn: async () => {
      const since90 = isoDaysAgo(90);

      const [competitorsRes, ownReviewsRes] = await Promise.all([
        supabase
          .from("ci_competitors")
          .select("id,name,rating,review_count,proximity_m,match_score")
          .eq("business_id", businessId!)
          .eq("status", "confirmed"),
        supabase
          .from("reviews")
          .select("platform,rating,posted_at,status,approved_reply,replied_at")
          .eq("business_id", businessId!)
          .order("posted_at", { ascending: false })
          .limit(5000),
      ]);
      if (competitorsRes.error) throw competitorsRes.error;
      if (ownReviewsRes.error) throw ownReviewsRes.error;

      const competitors = (competitorsRes.data ?? []) as Competitor[];
      const compIds = competitors.map((c) => c.id);

      let compReviews: CompReviewRow[] = [];
      if (compIds.length) {
        const { data: crd } = await supabase
          .from("ci_competitor_reviews")
          .select("competitor_id,platform,rating,posted_at")
          .in("competitor_id", compIds)
          .gte("posted_at", since90)
          .limit(20000);
        compReviews = (crd ?? []) as CompReviewRow[];
      }
      // For overall totals (not just 90d), also count rows per competitor
      let compTotals: Record<string, number> = {};
      let compPlatformAgg: Record<string, Record<string, { sum: number; n: number }>> = {};
      let compAllRows: CompAllRow[] = [];
      if (compIds.length) {
        const { data: allRows } = await supabase
          .from("ci_competitor_reviews")
          .select("competitor_id,platform,rating,posted_at,owner_reply_text,owner_reply_at")
          .in("competitor_id", compIds)
          .limit(50000);
        compAllRows = (allRows ?? []) as CompAllRow[];
        for (const r of compAllRows) {
          compTotals[r.competitor_id] = (compTotals[r.competitor_id] ?? 0) + 1;
          const p = normalizePlatform(r.platform);
          if (!p || r.rating == null) continue;
          compPlatformAgg[r.competitor_id] ??= {};
          compPlatformAgg[r.competitor_id][p] ??= { sum: 0, n: 0 };
          compPlatformAgg[r.competitor_id][p].sum += Number(r.rating);
          compPlatformAgg[r.competitor_id][p].n += 1;
        }
      }

      return {
        competitors,
        compReviews90: compReviews,
        compTotals,
        compPlatformAgg,
        compAllRows,
        ownReviews: (ownReviewsRes.data ?? []) as OwnReviewRow[],
      };
    },
  });

  const competitors = dataQuery.data?.competitors ?? [];
  const ownReviews = dataQuery.data?.ownReviews ?? [];
  const compReviews90 = dataQuery.data?.compReviews90 ?? [];
  const compTotals = dataQuery.data?.compTotals ?? {};
  const compPlatformAgg = dataQuery.data?.compPlatformAgg ?? {};
  const compAllRows = dataQuery.data?.compAllRows ?? [];

  const ownName = activeBusiness?.name ?? "Siz";

  // === Own metrics ===
  // Ratings are normalized per platform (Booking /10, Google /5 …) then expressed
  // as a 0–100 reputation index so every business sits on the same scale.
  const ownIndexes = ownReviews
    .filter((r) => r.rating != null)
    .map((r) => toIndex100(Number(r.rating), normalizePlatform(r.platform) ?? "google"));
  const ownAvg = ownIndexes.length
    ? ownIndexes.reduce((a, b) => a + b, 0) / ownIndexes.length
    : null;
  const ownTotal = ownReviews.length;
  const ownReplied = ownReviews.filter((r) => r.approved_reply || r.status === "replied").length;
  const ownReplyRate = ownTotal > 0 ? (ownReplied / ownTotal) * 100 : null;
  const since30 = isoDaysAgo(30);
  const own30d = ownReviews.filter((r) => r.posted_at && r.posted_at >= since30).length;

  // Own platform averages (normalize Google rating: own scale is 1-5 already)
  const ownPlatformAgg: Record<string, { sum: number; n: number }> = {};
  for (const r of ownReviews) {
    const p = normalizePlatform(r.platform) ?? "google"; // own reviews default to google
    if (r.rating == null) continue;
    ownPlatformAgg[p] ??= { sum: 0, n: 0 };
    ownPlatformAgg[p].sum += Number(r.rating);
    ownPlatformAgg[p].n += 1;
  }

  // === Competitor aggregate metrics ===
  // Per-competitor index computed from their scraped reviews (normalized per platform).
  // Falls back to the Google Places lifetime rating when no reviews were scraped yet.
  const compIndexInfo = useMemo(() => {
    const agg: Record<string, { sum: number; n: number }> = {};
    for (const r of compAllRows) {
      if (r.rating == null) continue;
      const p = normalizePlatform(r.platform) ?? "google";
      agg[r.competitor_id] ??= { sum: 0, n: 0 };
      agg[r.competitor_id].sum += toIndex100(Number(r.rating), p);
      agg[r.competitor_id].n += 1;
    }
    const out: Record<string, { index: number | null; fromPlaces: boolean }> = {};
    for (const c of competitors) {
      const a = agg[c.id];
      if (a && a.n > 0) out[c.id] = { index: a.sum / a.n, fromPlaces: false };
      else if (c.rating != null) out[c.id] = { index: toIndex100(Number(c.rating), "google"), fromPlaces: true };
      else out[c.id] = { index: null, fromPlaces: false };
    }
    return out;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [competitors, compAllRows]);

  const compIndexValues = competitors
    .map((c) => compIndexInfo[c.id]?.index)
    .filter((n): n is number => n != null);
  const compAvgOfAvg = compIndexValues.length
    ? compIndexValues.reduce((a, b) => a + b, 0) / compIndexValues.length
    : null;
  const compTotalSum = competitors.reduce((acc, c) => acc + (compTotals[c.id] ?? c.review_count ?? 0), 0);
  const compAvgTotal = competitors.length ? compTotalSum / competitors.length : null;

  // Competitor reply rate + median response time (real data from scraped replies)
  const compRepliedCount = compAllRows.filter((r) => r.owner_reply_text).length;
  const compReplyRate = compAllRows.length ? (compRepliedCount / compAllRows.length) * 100 : null;

  const ownResponseDays = ownReviews
    .map((r) => (r.posted_at && r.replied_at ? daysBetween(r.posted_at, r.replied_at) : null))
    .filter((n): n is number => n != null);
  const ownMedianResponse = median(ownResponseDays);
  const compResponseDays = compAllRows
    .map((r) =>
      r.posted_at && r.owner_reply_text && r.owner_reply_at
        ? daysBetween(r.posted_at, r.owner_reply_at)
        : null,
    )
    .filter((n): n is number => n != null);
  const compMedianResponse = median(compResponseDays);

  // 30d competitor avg per competitor
  const comp30dPerComp: Record<string, number> = {};
  for (const r of compReviews90) {
    if (!r.posted_at || r.posted_at < since30) continue;
    comp30dPerComp[r.competitor_id] = (comp30dPerComp[r.competitor_id] ?? 0) + 1;
  }
  const comp30dValues = competitors.map((c) => comp30dPerComp[c.id] ?? 0);
  const compAvg30d = comp30dValues.length
    ? comp30dValues.reduce((a, b) => a + b, 0) / comp30dValues.length
    : null;

  // === Ranking ===
  const ranked = useMemo(() => {
    const rows = [
      {
        id: "__own__",
        name: ownName,
        rating: ownAvg,
        review_count: ownTotal,
        proximity_m: null as number | null,
        match_score: null as number | null,
        isOwn: true,
      },
      ...competitors.map((c) => ({
        id: c.id,
        name: c.name,
        rating: compIndexInfo[c.id]?.index ?? null,
        fromPlaces: compIndexInfo[c.id]?.fromPlaces ?? false,
        review_count: compTotals[c.id] ?? c.review_count,
        proximity_m: c.proximity_m,
        match_score: c.match_score,
        isOwn: false,
      })),
    ];
    rows.sort((a, b) => (b.rating ?? -1) - (a.rating ?? -1));
    return rows;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [competitors, ownAvg, ownTotal, ownName, compIndexInfo, JSON.stringify(compTotals)]);

  const ownRank = ranked.findIndex((r) => r.isOwn) + 1;

  // === 90d trend (weekly buckets) ===
  const trendData = useMemo(() => {
    const buckets: Record<string, { week: string; you: number; competitorsAvg: number; _compCount: number }> = {};
    // 13 weeks
    for (let i = 12; i >= 0; i--) {
      const d = new Date(Date.now() - i * 7 * 86400_000);
      const wk = weekKey(d.toISOString());
      buckets[wk] = { week: wk, you: 0, competitorsAvg: 0, _compCount: 0 };
    }
    for (const r of ownReviews) {
      if (!r.posted_at) continue;
      if (r.posted_at < isoDaysAgo(90)) continue;
      const wk = weekKey(r.posted_at);
      if (buckets[wk]) buckets[wk].you += 1;
    }
    // competitor reviews per week summed, then divided by competitor count
    for (const r of compReviews90) {
      if (!r.posted_at) continue;
      const wk = weekKey(r.posted_at);
      if (buckets[wk]) buckets[wk]._compCount += 1;
    }
    const compN = Math.max(1, competitors.length);
    return Object.values(buckets)
      .sort((a, b) => a.week.localeCompare(b.week))
      .map((b) => ({
        ...b,
        competitorsAvg: Math.round((b._compCount / compN) * 10) / 10,
        weekLabel: b.week.slice(5), // MM-DD
      }));
  }, [ownReviews, compReviews90, competitors.length]);

  // === Scatter ===
  const scatterCompetitors = competitors
    .filter((c) => compIndexInfo[c.id]?.index != null && (compTotals[c.id] ?? c.review_count) != null)
    .map((c) => ({
      x: compTotals[c.id] ?? c.review_count!,
      y: compIndexInfo[c.id]!.index!,
      name: truncate(c.name),
      fullName: c.name,
    }));
  const scatterOwn =
    ownAvg != null
      ? [{ x: ownTotal, y: ownAvg, name: truncate(ownName), fullName: ownName }]
      : [];
  const allRatings = [...scatterCompetitors.map((d) => d.y), ...scatterOwn.map((d) => d.y)];
  // 0–100 reputation index axis
  const yMin = allRatings.length ? Math.max(0, Math.floor(Math.min(...allRatings) / 5) * 5 - 5) : 50;
  const yMax = 100;
  const allX = [...scatterCompetitors.map((d) => d.x), ...scatterOwn.map((d) => d.x)];
  const xMax = allX.length ? Math.max(...allX) * 1.1 : 100;
  const xMid = xMax / 2;
  const yMid = (yMin + yMax) / 2;

  // === Platform matrix ===
  const platformMatrix = useMemo(() => {
    const rows = [
      {
        id: "__own__",
        name: ownName,
        isOwn: true,
        cells: PLATFORMS.map((p) => {
          const agg = ownPlatformAgg[p.key];
          return { platform: p.key, avg: agg && agg.n ? agg.sum / agg.n : null, n: agg?.n ?? 0 };
        }),
      },
      ...competitors.map((c) => ({
        id: c.id,
        name: c.name,
        isOwn: false,
        cells: PLATFORMS.map((p) => {
          const agg = compPlatformAgg[c.id]?.[p.key];
          return { platform: p.key, avg: agg && agg.n ? agg.sum / agg.n : null, n: agg?.n ?? 0 };
        }),
      })),
    ];
    return rows;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [competitors, ownName, JSON.stringify(ownPlatformAgg), JSON.stringify(compPlatformAgg)]);

  if (businessLoading) {
    return (
      <div className="p-4 sm:p-6 max-w-6xl mx-auto space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-96 w-full" />
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

  const loading = dataQuery.isLoading;
  const isEmpty = !loading && competitors.length === 0;

  return (
    <>
      <Helmet>
        <title>Pazar Karşılaştırması · VoyageRespond</title>
      </Helmet>
      <div className="p-4 sm:p-6 max-w-6xl mx-auto space-y-6">
        <IntelligenceTabs />

        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">
            Pazar Karşılaştırması
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Otelinizin rakipleriniz arasındaki konumu, platform bazlı performans ve 90 günlük trend.
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
          {!loading && !isEmpty && (
            <div className="text-xs text-muted-foreground mt-2">
              {competitors.length} rakiple karşılaştırılıyor ·{" "}
              <span className="font-medium text-foreground">{ownRank}.</span> sıradasınız
            </div>
          )}
        </div>

        {loading ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {[0, 1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-24 w-full" />
              ))}
            </div>
            <Skeleton className="h-96 w-full" />
          </div>
        ) : isEmpty ? (
          <Card>
            <CardContent className="p-8 text-center space-y-3">
              <Sparkles className="h-8 w-8 mx-auto text-muted-foreground" />
              <h3 className="font-medium">Karşılaştırılacak rakip yok</h3>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                Karşılaştırma için önce Rakip Seçimi sekmesinden en az 1 rakip onaylayın.
              </p>
              <Button asChild>
                <Link to="/intelligence">Rakip Seçimine Git</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Action Pack — actionable cards */}
            <ActionPack businessId={businessId} />

            {/* KPI cards */}
            <p className="text-xs text-muted-foreground">
              Farklı platformların puanları (Booking 10, Google 5) tek ölçeğe normalize edilmiştir.
            </p>
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
              <KpiCard
                label="İtibar indeksi (0-100)"
                icon={<Star className="h-4 w-4" />}
                ownValue={ownAvg}
                compValue={compAvgOfAvg}
                format={(v) => v.toFixed(1)}
                higherIsBetter
              />
              <KpiCard
                label="Toplam Yorum"
                icon={<MessageSquare className="h-4 w-4" />}
                ownValue={ownTotal}
                compValue={compAvgTotal}
                format={fmtNum}
                higherIsBetter
              />
              <KpiCard
                label="Yanıt Oranı"
                icon={<Reply className="h-4 w-4" />}
                ownValue={ownReplyRate}
                compValue={compReplyRate}
                format={(v) => `${Math.round(v)}%`}
                higherIsBetter
              />
              <KpiCard
                label="Ort. yanıt süresi"
                icon={<Clock className="h-4 w-4" />}
                ownValue={ownMedianResponse}
                compValue={compMedianResponse}
                format={(v) => `${v.toFixed(1)} gün`}
                hint={`Medyan · siz ${ownResponseDays.length}, rakip ${compResponseDays.length} yanıtlı yorum`}
                higherIsBetter={false}
              />
              <KpiCard
                label="Son 30 gün hacim"
                icon={<Calendar className="h-4 w-4" />}
                ownValue={own30d}
                compValue={compAvg30d}
                format={fmtNum}
                higherIsBetter
              />
            </div>

            {/* 90d trend */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Son 90 gün — Yorum hacmi trendi</CardTitle>
                <p className="text-xs text-muted-foreground">
                  Haftalık yeni yorum sayısı. Rakipler için ortalama gösterilir.
                </p>
              </CardHeader>
              <CardContent>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={trendData} margin={{ top: 8, right: 16, bottom: 4, left: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="weekLabel" tick={{ fontSize: 10, fill: MUTED }} />
                      <YAxis tick={{ fontSize: 10, fill: MUTED }} allowDecimals={false} />
                      <Tooltip
                        content={({ active, payload, label }) => {
                          if (!active || !payload?.length) return null;
                          return (
                            <div className="rounded-md border bg-popover px-3 py-2 text-xs shadow-sm">
                              <div className="font-medium mb-1">Hafta: {label}</div>
                              {payload.map((p) => (
                                <div key={p.dataKey} style={{ color: p.color }}>
                                  {p.name}: {p.value}
                                </div>
                              ))}
                            </div>
                          );
                        }}
                      />
                      <Legend wrapperStyle={{ fontSize: 11 }} />
                      <Line
                        type="monotone"
                        dataKey="you"
                        name={ownName}
                        stroke={PRIMARY}
                        strokeWidth={2.5}
                        dot={false}
                      />
                      <Line
                        type="monotone"
                        dataKey="competitorsAvg"
                        name="Rakip ortalaması"
                        stroke={MUTED}
                        strokeWidth={2}
                        strokeDasharray="4 4"
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Platform matrix */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Platform bazlı puan</CardTitle>
                <p className="text-xs text-muted-foreground">
                  Her platformdaki ortalama puan (toplanmış rakip yorumlarından).
                </p>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-xs text-muted-foreground border-b">
                        <th className="py-2 px-4 font-medium">İşletme</th>
                        {PLATFORMS.map((p) => (
                          <th key={p.key} className="py-2 px-3 font-medium text-center">
                            {p.label}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {platformMatrix.map((row) => (
                        <tr
                          key={row.id}
                          className={
                            row.isOwn
                              ? "bg-primary/5 font-medium border-b last:border-0"
                              : "border-b last:border-0"
                          }
                        >
                          <td className="py-2.5 px-4">
                            <div className="flex items-center gap-2">
                              <span className="truncate max-w-[180px]">{row.name}</span>
                              {row.isOwn && (
                                <Badge variant="default" className="h-5 text-[10px]">
                                  Siz
                                </Badge>
                              )}
                            </div>
                          </td>
                          {row.cells.map((cell) => (
                            <td key={cell.platform} className="py-2.5 px-3 text-center">
                              {cell.avg != null ? (
                                <div>
                                  <div className="inline-flex items-center gap-1">
                                    <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                                    {cell.avg.toFixed(1)}
                                  </div>
                                  <div className="text-[10px] text-muted-foreground">
                                    {fmtNum(cell.n)}
                                  </div>
                                </div>
                              ) : (
                                <span className="text-muted-foreground text-xs">—</span>
                              )}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="text-[11px] text-muted-foreground px-4 py-3 border-t">
                  Rakip yorumları henüz çekilmediyse hücreler boş görünür. "Rakip Seçimi" sekmesinden
                  yorumları çekin.
                </p>
              </CardContent>
            </Card>

            {/* Positioning map */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Pazar Konumu</CardTitle>
                <p className="text-xs text-muted-foreground">
                  Yatay: yorum sayısı · Dikey: puan
                </p>
              </CardHeader>
              <CardContent>
                <div className="h-[360px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <ScatterChart margin={{ top: 20, right: 30, bottom: 30, left: 10 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis
                        type="number"
                        dataKey="x"
                        name="Yorum"
                        domain={[0, xMax]}
                        tick={{ fontSize: 11, fill: MUTED }}
                        label={{
                          value: "Yorum sayısı",
                          position: "insideBottom",
                          offset: -15,
                          fontSize: 11,
                          fill: MUTED,
                        }}
                      />
                      <YAxis
                        type="number"
                        dataKey="y"
                        name="Puan"
                        domain={[yMin, yMax]}
                        tick={{ fontSize: 11, fill: MUTED }}
                        label={{
                          value: "Puan",
                          angle: -90,
                          position: "insideLeft",
                          fontSize: 11,
                          fill: MUTED,
                        }}
                      />
                      <ZAxis type="number" range={[80, 80]} />
                      <ReferenceLine x={xMid} stroke="hsl(var(--border))" strokeDasharray="2 4" />
                      <ReferenceLine y={yMid} stroke="hsl(var(--border))" strokeDasharray="2 4" />
                      <Tooltip
                        cursor={{ strokeDasharray: "3 3" }}
                        content={({ active, payload }) => {
                          if (!active || !payload?.length) return null;
                          const d = payload[0].payload as any;
                          return (
                            <div className="rounded-md border bg-popover px-3 py-2 text-xs shadow-sm">
                              <div className="font-medium">{d.fullName}</div>
                              <div className="text-muted-foreground">
                                Puan: {d.y.toFixed(1)} · Yorum: {fmtNum(d.x)}
                              </div>
                            </div>
                          );
                        }}
                      />
                      <Scatter name="Rakipler" data={scatterCompetitors} fill={MUTED}>
                        <LabelList
                          dataKey="name"
                          position="top"
                          style={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                        />
                      </Scatter>
                      <Scatter
                        name="Siz"
                        data={scatterOwn}
                        fill={PRIMARY}
                        shape="star"
                        legendType="star"
                      >
                        <LabelList
                          dataKey="name"
                          position="top"
                          style={{ fontSize: 11, fill: "hsl(var(--primary))", fontWeight: 600 }}
                        />
                      </Scatter>
                    </ScatterChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1 text-[11px] text-muted-foreground">
                  <span>↗ Liderler (yüksek puan, yüksek hacim)</span>
                  <span>↖ Yükselenler (yüksek puan, düşük hacim)</span>
                  <span>↘ Hacimli ama riskli</span>
                  <span>↙ Zayıf</span>
                </div>
              </CardContent>
            </Card>

            {/* Ranking table */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Sıralama</CardTitle>
                <p className="text-xs text-muted-foreground">
                  Pazarda <span className="font-medium text-foreground">{ownRank}.</span> sıradasınız
                  ({ranked.length} işletme arasında)
                </p>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-xs text-muted-foreground border-b">
                        <th className="py-2 px-4 font-medium">#</th>
                        <th className="py-2 px-4 font-medium">İşletme</th>
                        <th className="py-2 px-4 font-medium">Puan</th>
                        <th className="py-2 px-4 font-medium">Yorum</th>
                        <th className="py-2 px-4 font-medium">Mesafe</th>
                        <th className="py-2 px-4 font-medium">Eşleşme</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ranked.map((r, i) => (
                        <tr
                          key={r.id}
                          className={
                            r.isOwn
                              ? "bg-primary/5 font-medium border-b last:border-0"
                              : "border-b last:border-0"
                          }
                        >
                          <td className="py-2.5 px-4 text-muted-foreground">{i + 1}</td>
                          <td className="py-2.5 px-4">
                            <div className="flex items-center gap-2">
                              <span className="truncate">{r.name}</span>
                              {r.isOwn && (
                                <Badge variant="default" className="h-5 text-[10px]">
                                  Siz
                                </Badge>
                              )}
                            </div>
                          </td>
                          <td className="py-2.5 px-4">
                            <span className="inline-flex items-center gap-1">
                              <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                              {fmtRating(r.rating)}
                            </span>
                          </td>
                          <td className="py-2.5 px-4">{fmtNum(r.review_count)}</td>
                          <td className="py-2.5 px-4 text-muted-foreground">
                            {r.proximity_m != null ? `${(r.proximity_m / 1000).toFixed(1)} km` : "—"}
                          </td>
                          <td className="py-2.5 px-4">
                            {r.match_score != null ? (
                              <Badge variant="secondary" className="h-5">
                                {Math.round(r.match_score)}
                              </Badge>
                            ) : (
                              <span className="text-muted-foreground">—</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Bar charts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <BarCard
                title="Puan karşılaştırması"
                rows={ranked}
                dataKey="rating"
                domain={[yMin, 5]}
                formatter={(v) => v.toFixed(1)}
              />
              <BarCard
                title="Yorum hacmi"
                rows={ranked}
                dataKey="review_count"
                formatter={(v) => fmtNum(v)}
              />
            </div>

            {/* Topic Analysis */}
            {activeBusiness?.id && <TopicAnalysis businessId={activeBusiness.id} />}

            {/* Ülke ve dil kırılımı */}
            {activeBusiness?.id && <GuestOriginBreakdown businessId={activeBusiness.id} />}
          </>
        )}
      </div>
    </>
  );
}

function KpiCard({
  label,
  icon,
  ownValue,
  compValue,
  format,
  higherIsBetter,
  hint,
}: {
  label: string;
  icon: React.ReactNode;
  ownValue: number | null;
  compValue: number | null;
  format: (v: number) => string;
  higherIsBetter?: boolean;
  hint?: string;
}) {
  let delta: number | null = null;
  if (ownValue != null && compValue != null && compValue !== 0) {
    delta = ownValue - compValue;
  }
  const positive = delta != null && delta > 0;
  const negative = delta != null && delta < 0;
  const goodBad =
    higherIsBetter === undefined
      ? "neutral"
      : higherIsBetter
        ? positive
          ? "good"
          : negative
            ? "bad"
            : "neutral"
        : negative
          ? "good"
          : positive
            ? "bad"
            : "neutral";

  return (
    <Card>
      <CardContent className="p-4 space-y-1.5">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          {icon}
          <span>{label}</span>
        </div>
        <div className="text-2xl font-semibold tabular-nums">
          {ownValue != null ? format(ownValue) : "—"}
        </div>
        {compValue != null ? (
          <div className="flex items-center gap-1.5 text-xs">
            {delta != null && Math.abs(delta) > 0.001 ? (
              goodBad === "good" ? (
                <span className="inline-flex items-center gap-0.5 text-emerald-600 font-medium">
                  <TrendingUp className="h-3 w-3" />
                  {format(Math.abs(delta))}
                </span>
              ) : goodBad === "bad" ? (
                <span className="inline-flex items-center gap-0.5 text-rose-600 font-medium">
                  <TrendingDown className="h-3 w-3" />
                  {format(Math.abs(delta))}
                </span>
              ) : (
                <span className="inline-flex items-center gap-0.5 text-muted-foreground">
                  <Minus className="h-3 w-3" />
                </span>
              )
            ) : (
              <span className="text-muted-foreground">aynı</span>
            )}
            <span className="text-muted-foreground">vs rakip ort. ({format(compValue)})</span>
          </div>
        ) : (
          <div className="text-xs text-muted-foreground">{hint ?? ""}</div>
        )}
        {compValue != null && hint ? (
          <div className="text-[11px] text-muted-foreground">{hint}</div>
        ) : null}
      </CardContent>
    </Card>
  );
}

function BarCard({
  title,
  rows,
  dataKey,
  domain,
  formatter,
}: {
  title: string;
  rows: Array<{ name: string; rating: number | null; review_count: number | null; isOwn: boolean }>;
  dataKey: "rating" | "review_count";
  domain?: [number, number];
  formatter: (v: number) => string;
}) {
  const data = rows
    .filter((r) => r[dataKey] != null)
    .map((r) => ({
      name: truncate(r.name, 14),
      fullName: r.name,
      value: r[dataKey] as number,
      isOwn: r.isOwn,
    }));
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} layout="vertical" margin={{ top: 4, right: 24, bottom: 4, left: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
              <XAxis type="number" domain={domain} tick={{ fontSize: 10, fill: MUTED }} />
              <YAxis
                type="category"
                dataKey="name"
                width={90}
                tick={{ fontSize: 11, fill: MUTED }}
              />
              <Tooltip
                cursor={{ fill: "hsl(var(--muted))", opacity: 0.4 }}
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  const d = payload[0].payload as any;
                  return (
                    <div className="rounded-md border bg-popover px-3 py-2 text-xs shadow-sm">
                      <div className="font-medium">{d.fullName}</div>
                      <div className="text-muted-foreground">{formatter(d.value)}</div>
                    </div>
                  );
                }}
              />
              <Bar dataKey="value" radius={[4, 4, 4, 4]}>
                {data.map((d, i) => (
                  <Cell key={i} fill={d.isOwn ? PRIMARY : "hsl(var(--muted-foreground) / 0.4)"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
