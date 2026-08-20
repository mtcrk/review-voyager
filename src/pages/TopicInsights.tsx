/**
 * Konu Analizi — "hangi konuda ne durumdayım ve zaman içinde nereye gidiyor?"
 * Yalnızca KENDİ yorumlarımız (review_source = 'own'). Rakip kıyası
 * /intelligence sayfasının, iki dönem kıyası /donem-analizi sayfasının işi.
 */
import { Fragment, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { format, subMonths } from "date-fns";
import { tr as trLocale } from "date-fns/locale";
import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  ChevronDown,
  ChevronRight,
  Download,
  ExternalLink,
  MapPin,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip as RTooltip,
  XAxis,
  YAxis,
} from "recharts";
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
import { supabase } from "@/integrations/supabase/client";
import { useBusiness } from "@/contexts/BusinessContext";
import { useCiTopics } from "@/hooks/useReviewAnalysis";
import { QuoteColumns, type EvidenceQuote } from "@/components/intelligence/QuoteColumns";
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
/** Aylık grafikte nokta çizmek için gereken en az bahis. */
const MIN_MONTH_MENTIONS = 3;

type Row = {
  review_id: string;
  topic_id: string;
  sentiment: number;
  excerpt: string | null;
  review_posted_at: string;
};

function monthKey(iso: string) {
  return iso.slice(0, 7);
}

function monthLabel(key: string) {
  return format(new Date(`${key}-01T00:00:00Z`), "MMM yy", { locale: trLocale });
}

function useOwnTopics(businessId: string | undefined, months: number) {
  const from = subMonths(new Date(), months).toISOString();
  return useQuery({
    queryKey: ["topic_insights_rows", businessId, months],
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

function useCoverage(businessId: string | undefined, months: number) {
  const from = subMonths(new Date(), months).toISOString();
  return useQuery({
    queryKey: ["topic_insights_coverage", businessId, months],
    enabled: !!businessId,
    staleTime: 1000 * 60 * 5,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("reviews")
        .select("analysis_status")
        .eq("business_id", businessId!)
        .gte("posted_at", from)
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
  /** son 3 ay - önceki 3 ay, 0-100 puan farkı. null = yeterli veri yok */
  trend: number | null;
};

function scoreColor(score: number) {
  if (score >= 70) return "hsl(var(--success))";
  if (score >= 55) return "hsl(var(--warning))";
  return "hsl(var(--destructive))";
}

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
      const cur = list.filter((r) => recent.has(monthKey(r.review_posted_at)));
      const prev = list.filter((r) => previous.has(monthKey(r.review_posted_at)));
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

const csvCell = (v: string | number) => {
  const s = String(v).replace(/"/g, '""');
  return /[;\n"]/.test(s) ? `"${s}"` : s;
};
const csvNum = (v: number | null) => (v == null ? "veri yok" : v.toFixed(1).replace(".", ","));

export default function TopicInsights() {
  const { activeBusiness, businesses, setActiveBusiness } = useBusiness();
  const businessId = activeBusiness?.id;
  const { labelOf } = useCiTopics();

  const [months, setMonths] = useState(12);
  const [openDept, setOpenDept] = useState<DepartmentKey | null>(null);
  const [topicId, setTopicId] = useState<string | null>(null);

  const rowsQ = useOwnTopics(businessId, months);
  const covQ = useCoverage(businessId, months);
  const rows = rowsQ.data ?? [];
  const loading = rowsQ.isLoading;

  // Ay ekseni (eskiden yeniye)
  const axis = useMemo(() => {
    const out: string[] = [];
    const now = new Date();
    for (let i = months - 1; i >= 0; i--) {
      const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i, 1));
      out.push(d.toISOString().slice(0, 7));
    }
    return out;
  }, [months]);

  const recentMonths = useMemo(() => new Set(axis.slice(-3)), [axis]);
  const previousMonths = useMemo(() => new Set(axis.slice(-6, -3)), [axis]);

  const deptStats = useMemo(
    () =>
      buildStats(
        rows,
        (r) => departmentOf(r.topic_id),
        (k) => DEPARTMENT_LABELS[k as DepartmentKey],
        recentMonths,
        previousMonths,
      ),
    [rows, recentMonths, previousMonths],
  );

  const visibleDepts = deptStats.filter((d) => d.mentions >= MIN_MENTIONS);
  const hiddenDepts = deptStats.length - visibleDepts.length;

  const allTopicStats = useMemo(
    () => buildStats(rows, (r) => r.topic_id, labelOf, recentMonths, previousMonths),
    [rows, labelOf, recentMonths, previousMonths],
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
    const stats = buildStats(inDept, (r) => r.topic_id, labelOf, recentMonths, previousMonths);
    const visible = stats.filter((s) => s.mentions >= MIN_MENTIONS);
    return { visible, hidden: stats.length - visible.length };
  }, [openDept, rows, labelOf, recentMonths, previousMonths]);

  const topicRows = useMemo(
    () => (topicId ? rows.filter((r) => r.topic_id === topicId) : []),
    [rows, topicId],
  );

  const monthly = useMemo(() => {
    const byMonth = new Map<string, Row[]>();
    for (const r of topicRows) {
      const k = monthKey(r.review_posted_at);
      const list = byMonth.get(k);
      if (list) list.push(r);
      else byMonth.set(k, [r]);
    }
    return axis.map((m) => {
      const list = byMonth.get(m) ?? [];
      const negatives = list.filter((r) => r.sentiment <= -0.15).length;
      return {
        month: m,
        label: monthLabel(m),
        mentions: list.length,
        // Az veriden sahte dalgalanma çıkmasın: 3'ten az bahiste nokta çizilmez.
        score: list.length >= MIN_MONTH_MENTIONS ? Number(avgScore(list).toFixed(1)) : null,
        rawScore: list.length ? avgScore(list) : null,
        negativeShare: list.length ? (negatives / list.length) * 100 : null,
      };
    });
  }, [topicRows, axis]);

  const monthlyWithData = monthly.filter((m) => m.mentions > 0);

  const quotes = useMemo(() => {
    const withText = topicRows.filter((r) => (r.excerpt ?? "").trim().length > 0);
    const toQuote = (r: Row): EvidenceQuote => ({
      excerpt: (r.excerpt as string).trim(),
      sentiment: r.sentiment,
      meta: format(new Date(r.review_posted_at), "d MMM yyyy", { locale: trLocale }),
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
      `Dönem;son ${months} ay`,
      "",
      `${heading};Skor (0-100);Bahis;Pay (%);Son 3 ay trendi`,
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
    downloadCsv(`konu-analizi-${months}ay.csv`, lines.join("\r\n"));
  }

  function exportMonthlyCsv() {
    if (!topicId) return;
    const lines = [
      `Konu;${csvCell(labelOf(topicId))}`,
      "",
      "Ay;Skor (0-100);Bahis;Olumsuz oran (%)",
      ...monthlyWithData.map((m) =>
        [csvCell(m.label), csvNum(m.rawScore), m.mentions, csvNum(m.negativeShare)].join(";"),
      ),
    ];
    downloadCsv(`konu-${topicId}-aylik.csv`, lines.join("\r\n"));
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
            Hangi konuda ne durumdasınız ve zaman içinde nereye gidiyor?
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
          <Select value={String(months)} onValueChange={(v) => setMonths(Number(v))}>
            <SelectTrigger className="h-9 w-[150px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="3">Son 3 ay</SelectItem>
              <SelectItem value="6">Son 6 ay</SelectItem>
              <SelectItem value="12">Son 12 ay</SelectItem>
              <SelectItem value="24">Son 24 ay</SelectItem>
            </SelectContent>
          </Select>
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
          Son {months} ayda {covQ.data.total} yorumun {covQ.data.analyzed}'i analiz edildi ·{" "}
          {rows.length} konu bahsi
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

      {/* Bölüm C — öne çıkanlar şeridi */}
      {!loading && (highlights.decliners.length > 0 || highlights.improvers.length > 0) && (
        <div className="flex flex-wrap items-center gap-2 rounded-lg border bg-muted/40 px-3 py-2">
          <span className="text-xs text-muted-foreground">Son 3 ay:</span>
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

      {/* Bölüm A — departman özeti */}
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
                      <th className="px-4 py-2 text-right font-medium">Son 3 ay</th>
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
              <ResponsiveContainer width="100%" height={Math.max(200, visibleDepts.length * 34)}>
                <BarChart
                  data={visibleDepts}
                  layout="vertical"
                  margin={{ left: 8, right: 24, top: 4, bottom: 4 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11 }} />
                  <YAxis
                    type="category"
                    dataKey="label"
                    width={110}
                    tick={{ fontSize: 10 }}
                    interval={0}
                  />
                  <RTooltip
                    formatter={(v: any, _n: any, p: any) => [
                      `${Number(v).toFixed(1)} / 100 · ${p?.payload?.mentions} bahis`,
                      "Skor",
                    ]}
                  />
                  <Bar dataKey="score" radius={[0, 4, 4, 0]}>
                    {visibleDepts.map((d) => (
                      <Cell key={d.key} fill={scoreColor(d.score)} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Bölüm B — seçili konunun zaman içindeki gidişatı */}
      {!loading && topicId && topicRows.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <CardTitle className="text-base">{labelOf(topicId)} — zaman içindeki gidişat</CardTitle>
                <p className="text-xs text-muted-foreground">
                  {topicRows.length} bahis · {topicReviewCount} yorum · son {months} ay
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="h-8" onClick={exportMonthlyCsv}>
                  <Download className="mr-1.5 h-3.5 w-3.5" />
                  Aylık CSV
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
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={monthly} margin={{ left: 0, right: 12, top: 4, bottom: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="label" tick={{ fontSize: 10 }} interval="preserveStartEnd" />
                  <YAxis domain={[0, 100]} width={34} tick={{ fontSize: 10 }} />
                  <RTooltip
                    formatter={(v: any, _n: any, p: any) => [
                      `${Number(v).toFixed(1)} / 100 · ${p?.payload?.mentions} bahis`,
                      "Skor",
                    ]}
                  />
                  <Line
                    type="monotone"
                    dataKey="score"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                    connectNulls={false}
                  />
                </LineChart>
              </ResponsiveContainer>
              <p className="mt-1 text-xs text-muted-foreground">
                Ayda {MIN_MONTH_MENTIONS}'ten az bahis olan aylar gösterilmez.
              </p>
            </div>

            <div>
              <p className="mb-1 text-xs font-medium">Aylık bahis hacmi</p>
              <ResponsiveContainer width="100%" height={140}>
                <BarChart data={monthly} margin={{ left: 0, right: 12, top: 4, bottom: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="label" tick={{ fontSize: 10 }} interval="preserveStartEnd" />
                  <YAxis width={34} tick={{ fontSize: 10 }} allowDecimals={false} />
                  <RTooltip formatter={(v: any) => [`${v} bahis`, "Bahis"]} />
                  <Bar dataKey="mentions" fill="hsl(var(--primary))" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {monthlyWithData.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-xs text-muted-foreground">
                      <th className="py-2 pr-2 text-left font-medium">Ay</th>
                      <th className="px-2 py-2 text-right font-medium">Skor</th>
                      <th className="px-2 py-2 text-right font-medium">Bahis</th>
                      <th className="py-2 pl-2 text-right font-medium">Olumsuz oran %</th>
                    </tr>
                  </thead>
                  <tbody>
                    {monthlyWithData.map((m) => (
                      <tr key={m.month} className="border-b last:border-0">
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
