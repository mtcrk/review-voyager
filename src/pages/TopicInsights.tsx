/**
 * Konu Analizi — "hangi konuda ne durumdayım ve zaman içinde nereye gidiyor?"
 * Yalnızca KENDİ yorumlarımız (review_source = 'own'). Rakip kıyası
 * /intelligence sayfasının, iki dönem kıyası /donem-analizi sayfasının işi.
 */
import { Fragment, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  addMonths,
  addWeeks,
  differenceInCalendarDays,
  format,
  startOfWeek,
  subMonths,
} from "date-fns";
import { tr as trLocale } from "date-fns/locale";
import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  Calendar as CalendarIcon,
  ChevronDown,
  ChevronRight,
  Download,
  ExternalLink,
  MapPin,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useBusiness } from "@/contexts/BusinessContext";
import { useCiTopics } from "@/hooks/useReviewAnalysis";
import { QuoteColumns, type EvidenceQuote } from "@/components/intelligence/QuoteColumns";
import { MentionBars, ScoreBars, TrendLine } from "@/components/intelligence/TopicCharts";
import {
  DEPARTMENT_LABELS,
  departmentOf,
  sentimentToIndex100,
  type DepartmentKey,
} from "@/lib/topicDepartments";
import { downloadCsv } from "@/lib/topicCsv";
import { cn } from "@/lib/utils";

/** Bu sayının altındaki bahisler tabloda gösterilmez. */
const MIN_MENTIONS = 5;
/** Zaman grafiğinde nokta çizmek için gereken en az bahis. */
const MIN_BUCKET_MENTIONS = 3;

type Row = {
  review_id: string;
  topic_id: string;
  sentiment: number;
  excerpt: string | null;
  review_posted_at: string;
};

type Range = { start: Date; end: Date };
type BucketMode = "week" | "month";
type Preset = "3" | "6" | "12" | "24" | "custom";

function fmtDay(d: Date) {
  return format(d, "d MMM yyyy", { locale: trLocale });
}

function fmtRange(r: Range) {
  return `${format(r.start, "d MMM yyyy", { locale: trLocale })} – ${fmtDay(r.end)}`;
}

function bucketKeyOf(iso: string, mode: BucketMode) {
  if (mode === "month") return iso.slice(0, 7);
  return format(startOfWeek(new Date(iso), { weekStartsOn: 1 }), "yyyy-MM-dd");
}

function bucketLabel(key: string, mode: BucketMode) {
  if (mode === "month") {
    return format(new Date(`${key}-01T00:00:00Z`), "MMM yy", { locale: trLocale });
  }
  return format(new Date(`${key}T00:00:00Z`), "d MMM", { locale: trLocale });
}

/** Aralığı kapsayan bucket ekseni (eskiden yeniye). */
function buildAxis(range: Range, mode: BucketMode): string[] {
  const out: string[] = [];
  if (mode === "month") {
    let cur = new Date(Date.UTC(range.start.getUTCFullYear(), range.start.getUTCMonth(), 1));
    const last = new Date(Date.UTC(range.end.getUTCFullYear(), range.end.getUTCMonth(), 1));
    while (cur <= last && out.length < 60) {
      out.push(cur.toISOString().slice(0, 7));
      cur = addMonths(cur, 1);
    }
    return out;
  }
  let cur = startOfWeek(range.start, { weekStartsOn: 1 });
  const last = startOfWeek(range.end, { weekStartsOn: 1 });
  while (cur <= last && out.length < 60) {
    out.push(format(cur, "yyyy-MM-dd"));
    cur = addWeeks(cur, 1);
  }
  return out;
}

function useOwnTopics(businessId: string | undefined, range: Range) {
  const from = range.start.toISOString();
  const to = range.end.toISOString();
  return useQuery({
    queryKey: ["topic_insights_rows", businessId, from, to],
    enabled: !!businessId,
    staleTime: 1000 * 60 * 5,
    queryFn: async (): Promise<Row[]> => {
      const { data, error } = await supabase
        .from("ci_review_topics")
        .select("review_id, topic_id, sentiment, excerpt, review_posted_at")
        .eq("business_id", businessId!)
        .eq("review_source", "own")
        .is("competitor_id", null)
        .gte("review_posted_at", from)
        .lte("review_posted_at", to)
        .limit(8000);
      if (error) throw error;
      return (data ?? []).map((r: any) => ({
        review_id: r.review_id,
        topic_id: r.topic_id,
        sentiment: Number(r.sentiment),
        excerpt: r.excerpt,
        review_posted_at: r.review_posted_at,
      }));
    },
  });
}

function useCoverage(businessId: string | undefined, range: Range) {
  const from = range.start.toISOString();
  const to = range.end.toISOString();
  return useQuery({
    queryKey: ["topic_insights_coverage", businessId, from, to],
    enabled: !!businessId,
    staleTime: 1000 * 60 * 5,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("reviews")
        .select("analysis_status")
        .eq("business_id", businessId!)
        .gte("posted_at", from)
        .lte("posted_at", to)
        .limit(8000);
      if (error) throw error;
      const rows = data ?? [];
      return {
        total: rows.length,
        analyzed: rows.filter((r: any) => r.analysis_status === "done").length,
      };
    },
  });
}

type Stat = {
  key: string;
  label: string;
  score: number;
  mentions: number;
  share: number;
  /** son 3 bucket - önceki 3 bucket, 0-100 puan farkı. null = yeterli veri yok */
  trend: number | null;
};

function avgScore(rows: Row[]) {
  if (rows.length === 0) return 0;
  return sentimentToIndex100(rows.reduce((s, r) => s + r.sentiment, 0) / rows.length);
}

function buildStats(
  rows: Row[],
  keyOf: (r: Row) => string,
  labelOf: (k: string) => string,
  recent: Set<string>,
  previous: Set<string>,
  mode: BucketMode,
): Stat[] {
  const groups = new Map<string, Row[]>();
  for (const r of rows) {
    const k = keyOf(r);
    const list = groups.get(k);
    if (list) list.push(r);
    else groups.set(k, [r]);
  }
  const total = rows.length;
  return Array.from(groups.entries())
    .map(([key, list]) => {
      const cur = list.filter((r) => recent.has(bucketKeyOf(r.review_posted_at, mode)));
      const prev = list.filter((r) => previous.has(bucketKeyOf(r.review_posted_at, mode)));
      const trend =
        cur.length >= MIN_MENTIONS && prev.length >= MIN_MENTIONS
          ? avgScore(cur) - avgScore(prev)
          : null;
      return {
        key,
        label: labelOf(key),
        score: avgScore(list),
        mentions: list.length,
        share: total ? (list.length / total) * 100 : 0,
        trend,
      };
    })
    .sort((a, b) => a.score - b.score);
}

function TrendCell({ trend }: { trend: number | null }) {
  if (trend == null) {
    return <span className="text-xs text-muted-foreground">yeterli veri yok</span>;
  }
  const Icon = trend > 1 ? ArrowUpRight : trend < -1 ? ArrowDownRight : ArrowRight;
  const cls = trend > 1 ? "text-success" : trend < -1 ? "text-destructive" : "text-muted-foreground";
  return (
    <span className={cn("inline-flex items-center gap-1 text-sm font-semibold tabular-nums", cls)}>
      <Icon className="h-3.5 w-3.5" />
      {trend > 0 ? "+" : ""}
      {trend.toFixed(1)}
    </span>
  );
}

function DatePick({ date, onChange }: { date: Date; onChange: (d: Date) => void }) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="h-9 justify-start text-xs font-normal">
          <CalendarIcon className="mr-1.5 h-3 w-3" />
          {fmtDay(date)}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={(d) => d && onChange(d)}
          className="p-3 pointer-events-auto"
        />
      </PopoverContent>
    </Popover>
  );
}

const csvCell = (v: string | number) => {
  const s = String(v).replace(/"/g, '""');
  return /[;\n"]/.test(s) ? `"${s}"` : s;
};
const csvNum = (v: number | null) => (v == null ? "veri yok" : v.toFixed(1).replace(".", ","));

export default function TopicInsights() {
  const { activeBusiness, businesses, setActiveBusiness } = useBusiness();
  const businessId = activeBusiness?.id;
  const { labelOf } = useCiTopics();

  const [preset, setPreset] = useState<Preset>("12");
  const [custom, setCustom] = useState<Range>({ start: subMonths(new Date(), 3), end: new Date() });
  const [openDept, setOpenDept] = useState<DepartmentKey | null>(null);
  const [topicId, setTopicId] = useState<string | null>(null);

  const range = useMemo<Range>(
    () => (preset === "custom" ? custom : { start: subMonths(new Date(), Number(preset)), end: new Date() }),
    [preset, custom],
  );

  const days = Math.max(1, differenceInCalendarDays(range.end, range.start) + 1);
  // 2 aydan kısa aralıkta aylık kırılım anlamsız — haftalığa düşülür.
  const bucketMode: BucketMode = days < 62 ? "week" : "month";
  const unitLabel = bucketMode === "week" ? "hafta" : "ay";

  const rowsQ = useOwnTopics(businessId, range);
  const covQ = useCoverage(businessId, range);
  const rows = rowsQ.data ?? [];
  const loading = rowsQ.isLoading;

  const axis = useMemo(() => buildAxis(range, bucketMode), [range, bucketMode]);
  const recentBuckets = useMemo(() => new Set(axis.slice(-3)), [axis]);
  const previousBuckets = useMemo(() => new Set(axis.slice(-6, -3)), [axis]);

  const deptStats = useMemo(
    () =>
      buildStats(
        rows,
        (r) => departmentOf(r.topic_id),
        (k) => DEPARTMENT_LABELS[k as DepartmentKey],
        recentBuckets,
        previousBuckets,
        bucketMode,
      ),
    [rows, recentBuckets, previousBuckets, bucketMode],
  );

  const visibleDepts = deptStats.filter((d) => d.mentions >= MIN_MENTIONS);
  const hiddenDepts = deptStats.length - visibleDepts.length;

  const allTopicStats = useMemo(
    () => buildStats(rows, (r) => r.topic_id, labelOf, recentBuckets, previousBuckets, bucketMode),
    [rows, labelOf, recentBuckets, previousBuckets, bucketMode],
  );

  const highlights = useMemo(() => {
    const eligible = allTopicStats.filter((t) => t.trend != null);
    const decliners = eligible
      .filter((t) => (t.trend as number) < -1)
      .sort((a, b) => (a.trend as number) - (b.trend as number))
      .slice(0, 2);
    const improvers = eligible
      .filter((t) => (t.trend as number) > 1)
      .sort((a, b) => (b.trend as number) - (a.trend as number))
      .slice(0, 2);
    return { decliners, improvers };
  }, [allTopicStats]);

  const deptTopics = useMemo(() => {
    if (!openDept) return { visible: [] as Stat[], hidden: 0 };
    const inDept = rows.filter((r) => departmentOf(r.topic_id) === openDept);
    const stats = buildStats(inDept, (r) => r.topic_id, labelOf, recentBuckets, previousBuckets, bucketMode);
    const visible = stats.filter((s) => s.mentions >= MIN_MENTIONS);
    return { visible, hidden: stats.length - visible.length };
  }, [openDept, rows, labelOf, recentBuckets, previousBuckets, bucketMode]);

  const topicRows = useMemo(
    () => (topicId ? rows.filter((r) => r.topic_id === topicId) : []),
    [rows, topicId],
  );

  const trend = useMemo(() => {
    const byBucket = new Map<string, Row[]>();
    for (const r of topicRows) {
      const k = bucketKeyOf(r.review_posted_at, bucketMode);
      const list = byBucket.get(k);
      if (list) list.push(r);
      else byBucket.set(k, [r]);
    }
    return axis.map((b) => {
      const list = byBucket.get(b) ?? [];
      const negatives = list.filter((r) => r.sentiment <= -0.15).length;
      return {
        bucket: b,
        label: bucketLabel(b, bucketMode),
        mentions: list.length,
        // Az veriden sahte dalgalanma çıkmasın.
        score: list.length >= MIN_BUCKET_MENTIONS ? Number(avgScore(list).toFixed(1)) : null,
        rawScore: list.length ? avgScore(list) : null,
        negativeShare: list.length ? (negatives / list.length) * 100 : null,
      };
    });
  }, [topicRows, axis, bucketMode]);

  const trendWithData = trend.filter((m) => m.mentions > 0);

  const quotes = useMemo(() => {
    const withText = topicRows.filter((r) => (r.excerpt ?? "").trim().length > 0);
    const toQuote = (r: Row): EvidenceQuote => ({
      excerpt: (r.excerpt as string).trim(),
      sentiment: r.sentiment,
      meta: format(new Date(r.review_posted_at), "d MMM yyyy", { locale: trLocale }),
      reviewId: r.review_id,
      topicId: r.topic_id,
    });
    return {
      left: [...withText].sort((a, b) => a.sentiment - b.sentiment).slice(0, 5).map(toQuote),
      right: [...withText].sort((a, b) => b.sentiment - a.sentiment).slice(0, 5).map(toQuote),
    };
  }, [topicRows]);

  const topicReviewCount = useMemo(
    () => new Set(topicRows.map((r) => r.review_id)).size,
    [topicRows],
  );

  function exportTopicCsv() {
    const source = openDept ? deptTopics.visible : visibleDepts;
    const heading = openDept ? "Konu" : "Departman";
    const lines = [
      `Dönem;${fmtRange(range)}`,
      "",
      `${heading};Skor (0-100);Bahis;Pay (%);Son 3 ${unitLabel} trendi`,
      ...source.map((s) =>
        [
          csvCell(s.label),
          csvNum(s.score),
          s.mentions,
          csvNum(s.share),
          s.trend == null ? "yeterli veri yok" : csvNum(s.trend),
        ].join(";"),
      ),
    ];
    downloadCsv(`konu-analizi-${format(range.start, "yyyyMMdd")}-${format(range.end, "yyyyMMdd")}.csv`, lines.join("\r\n"));
  }

  function exportTrendCsv() {
    if (!topicId) return;
    const lines = [
      `Konu;${csvCell(labelOf(topicId))}`,
      "",
      `${bucketMode === "week" ? "Hafta" : "Ay"};Skor (0-100);Bahis;Olumsuz oran (%)`,
      ...trendWithData.map((m) =>
        [csvCell(m.label), csvNum(m.rawScore), m.mentions, csvNum(m.negativeShare)].join(";"),
      ),
    ];
    downloadCsv(`konu-${topicId}-${bucketMode === "week" ? "haftalik" : "aylik"}.csv`, lines.join("\r\n"));
  }

  const noData = !loading && rows.length === 0;

  return (
    <div className="space-y-6">
      <Helmet>
        <title>Konu Analizi | VoyageRespond</title>
        <meta
          name="description"
          content="Hangi konuda ne durumda olduğunuzu ve zaman içindeki gidişatı departman ve konu bazında görün."
        />
      </Helmet>

      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Konu Analizi</h1>
          <p className="text-sm text-muted-foreground">
            {fmtRange(range)} · {bucketMode === "week" ? "haftalık" : "aylık"} kırılım
          </p>
          <div className="mt-3 flex items-center gap-2">
            <MapPin className="h-4 w-4 shrink-0 text-muted-foreground" />
            {businesses.length > 1 ? (
              <Select
                value={activeBusiness?.id}
                onValueChange={(id) => {
                  const b = businesses.find((x) => x.id === id);
                  if (b) setActiveBusiness(b);
                }}
              >
                <SelectTrigger className="h-9 w-full sm:w-[280px]">
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
            ) : (
              <span className="text-sm font-medium">{activeBusiness?.name}</span>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Select value={preset} onValueChange={(v) => setPreset(v as Preset)}>
            <SelectTrigger className="h-9 w-[150px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="3">Son 3 ay</SelectItem>
              <SelectItem value="6">Son 6 ay</SelectItem>
              <SelectItem value="12">Son 12 ay</SelectItem>
              <SelectItem value="24">Son 24 ay</SelectItem>
              <SelectItem value="custom">Özel aralık</SelectItem>
            </SelectContent>
          </Select>
          {preset === "custom" && (
            <div className="flex items-center gap-1">
              <DatePick date={custom.start} onChange={(d) => setCustom((p) => ({ ...p, start: d }))} />
              <span className="text-xs text-muted-foreground">–</span>
              <DatePick date={custom.end} onChange={(d) => setCustom((p) => ({ ...p, end: d }))} />
            </div>
          )}
          <Button
            variant="outline"
            size="sm"
            className="h-9"
            onClick={exportTopicCsv}
            disabled={loading || noData}
          >
            <Download className="mr-1.5 h-3.5 w-3.5" />
            CSV
          </Button>
        </div>
      </div>

      {!loading && covQ.data && (
        <p className="text-xs text-muted-foreground">
          Bu aralıkta {covQ.data.total} yorumun {covQ.data.analyzed}'i analiz edildi · {rows.length}{" "}
          konu bahsi
        </p>
      )}

      {loading && <Skeleton className="h-64 w-full" />}

      {noData && (
        <Card>
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            Bu dönemde analiz edilmiş yorum bulunamadı.
          </CardContent>
        </Card>
      )}

      {/* Öne çıkanlar şeridi */}
      {!loading && (highlights.decliners.length > 0 || highlights.improvers.length > 0) && (
        <div className="flex flex-wrap items-center gap-2 rounded-lg border bg-muted/40 px-3 py-2">
          <span className="text-xs text-muted-foreground">Son 3 {unitLabel}:</span>
          {highlights.decliners.map((t) => (
            <Badge key={t.key} variant="outline" className="border-destructive/40 text-destructive">
              {t.label} {(t.trend as number).toFixed(1)} puan · {t.mentions} bahis
            </Badge>
          ))}
          {highlights.improvers.map((t) => (
            <Badge key={t.key} variant="outline" className="border-success/40 text-success">
              {t.label} +{(t.trend as number).toFixed(1)} puan · {t.mentions} bahis
            </Badge>
          ))}
        </div>
      )}

      {/* Departman özeti */}
      {!loading && visibleDepts.length > 0 && (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Departman özeti</CardTitle>
              <p className="text-xs text-muted-foreground">
                En düşük skor üstte — önce buraya bakın. Skorlar 0-100 ölçeğinde.
              </p>
            </CardHeader>
            <CardContent className="px-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-xs text-muted-foreground">
                      <th className="px-4 py-2 text-left font-medium">Departman</th>
                      <th className="px-2 py-2 text-right font-medium">Skor</th>
                      <th className="px-2 py-2 text-right font-medium">Bahis</th>
                      <th className="px-2 py-2 text-right font-medium">Pay %</th>
                      <th className="px-4 py-2 text-right font-medium">Son 3 {unitLabel}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visibleDepts.map((d) => {
                      const isOpen = openDept === d.key;
                      return (
                        <Fragment key={d.key}>
                          <tr
                            className={cn(
                              "cursor-pointer border-b transition-colors hover:bg-muted/50",
                              isOpen && "bg-muted/40",
                            )}
                            onClick={() => {
                              setOpenDept(isOpen ? null : (d.key as DepartmentKey));
                              setTopicId(null);
                            }}
                          >
                            <td className="px-4 py-2">
                              <span className="inline-flex items-center gap-1.5">
                                {isOpen ? (
                                  <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                                ) : (
                                  <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                                )}
                                {d.label}
                              </span>
                            </td>
                            <td className="px-2 py-2 text-right font-semibold tabular-nums">
                              {d.score.toFixed(1)}
                            </td>
                            <td className="px-2 py-2 text-right tabular-nums">{d.mentions}</td>
                            <td className="px-2 py-2 text-right tabular-nums text-muted-foreground">
                              {d.share.toFixed(1)}
                            </td>
                            <td className="px-4 py-2 text-right">
                              <TrendCell trend={d.trend} />
                            </td>
                          </tr>
                          {isOpen && deptTopics.visible.length > 0 && (
                            <tr className="border-b bg-muted/20">
                              <td colSpan={5} className="px-4 py-3">
                                <div className="flex flex-wrap gap-1.5">
                                  {deptTopics.visible.map((t) => (
                                    <Button
                                      key={t.key}
                                      size="sm"
                                      variant={topicId === t.key ? "default" : "outline"}
                                      className="h-7 text-xs"
                                      onClick={() => setTopicId(t.key)}
                                    >
                                      {t.label} · {t.score.toFixed(0)} · {t.mentions} bahis
                                    </Button>
                                  ))}
                                </div>
                                {deptTopics.hidden > 0 && (
                                  <p className="mt-2 text-xs text-muted-foreground">
                                    {deptTopics.hidden} konu az bahis nedeniyle gizlendi.
                                  </p>
                                )}
                              </td>
                            </tr>
                          )}
                        </Fragment>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              {hiddenDepts > 0 && (
                <p className="px-4 pt-3 text-xs text-muted-foreground">
                  {hiddenDepts} departman az bahis nedeniyle gizlendi (en az {MIN_MENTIONS} bahis).
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Departman skorları</CardTitle>
              <p className="text-xs text-muted-foreground">
                {rows.length} bahse dayanıyor · 0-100 ölçeği
              </p>
            </CardHeader>
            <CardContent>
              <ScoreBars data={visibleDepts} />
            </CardContent>
          </Card>
        </div>
      )}

      {/* Seçili konunun zaman içindeki gidişatı */}
      {!loading && topicId && topicRows.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <CardTitle className="text-base">{labelOf(topicId)} — zaman içindeki gidişat</CardTitle>
                <p className="text-xs text-muted-foreground">
                  {topicRows.length} bahis · {topicReviewCount} yorum · {fmtRange(range)}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="h-8" onClick={exportTrendCsv}>
                  <Download className="mr-1.5 h-3.5 w-3.5" />
                  {bucketMode === "week" ? "Haftalık CSV" : "Aylık CSV"}
                </Button>
                <Button asChild variant="secondary" size="sm" className="h-8">
                  <Link to={`/reviews?topic=${encodeURIComponent(topicId)}`}>
                    Bu konudaki {topicReviewCount} yoruma git
                    <ExternalLink className="ml-1.5 h-3.5 w-3.5" />
                  </Link>
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <TrendLine data={trend} />
              <p className="mt-1 text-xs text-muted-foreground">
                {bucketMode === "week" ? "Haftada" : "Ayda"} {MIN_BUCKET_MENTIONS}'ten az bahis olan
                dönemler gösterilmez.
              </p>
            </div>

            <div>
              <p className="mb-1 text-xs font-medium">
                {bucketMode === "week" ? "Haftalık" : "Aylık"} bahis hacmi
              </p>
              <MentionBars data={trend} />
            </div>

            {trendWithData.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-xs text-muted-foreground">
                      <th className="py-2 pr-2 text-left font-medium">
                        {bucketMode === "week" ? "Hafta" : "Ay"}
                      </th>
                      <th className="px-2 py-2 text-right font-medium">Skor</th>
                      <th className="px-2 py-2 text-right font-medium">Bahis</th>
                      <th className="py-2 pl-2 text-right font-medium">Olumsuz oran %</th>
                    </tr>
                  </thead>
                  <tbody>
                    {trendWithData.map((m) => (
                      <tr key={m.bucket} className="border-b last:border-0">
                        <td className="py-2 pr-2">{m.label}</td>
                        <td className="px-2 py-2 text-right tabular-nums">
                          {m.rawScore == null ? "—" : m.rawScore.toFixed(1)}
                        </td>
                        <td className="px-2 py-2 text-right tabular-nums">{m.mentions}</td>
                        <td className="py-2 pl-2 text-right tabular-nums">
                          {m.negativeShare == null ? "—" : m.negativeShare.toFixed(0)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <QuoteColumns
              leftTitle="En olumsuz"
              rightTitle="En olumlu"
              left={quotes.left}
              right={quotes.right}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
