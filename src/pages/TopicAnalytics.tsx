/**
 * Dönem Analizi — departman gidişatı iki dönem arasında karşılaştırılır.
 * Yalnızca KENDİ yorumlarımız (review_source = 'own'). Rakip kıyası
 * /intelligence/karsilastirma sayfasının işi.
 */
import { Fragment, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useQuery } from "@tanstack/react-query";
import { addMonths, format, startOfWeek, startOfMonth, startOfYear, subDays, subMonths, subYears, differenceInCalendarDays } from "date-fns";
import { tr as trLocale } from "date-fns/locale";
import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  Calendar as CalendarIcon,
  ChevronDown,
  ChevronRight,
  Download,
  Info,
  MapPin,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
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
import { fetchOwnTopicRows } from "@/lib/ownTopicRows";
import { CompareBars, TrendLine, type CompareBarDatum } from "@/components/intelligence/TopicCharts";
import {
  DEPARTMENTS,
  DEPARTMENT_LABELS,
  departmentOf,
  sentimentToIndex100,
  type DepartmentKey,
} from "@/lib/topicDepartments";
import { downloadCsv } from "@/lib/topicCsv";
import { cn } from "@/lib/utils";

/** İki dönemden birinde bu sayının altındaki bahislerde değişim hesaplanmaz. */
const MIN_MENTIONS = 5;
/** 5-9 arası bahis: gösterilir ama "az veri" rozetiyle soluklaştırılır. */
const THIN_MENTIONS = 10;

type PeriodPreset = "week" | "month" | "quarter" | "year" | "custom";
type CompareMode = "prev" | "yoy";

type TopicRow = {
  review_id: string;
  topic_id: string;
  sentiment: number;
  excerpt: string | null;
  review_posted_at: string;
};

type Range = { start: Date; end: Date };

function fmtDay(d: Date) {
  return format(d, "d MMM yyyy", { locale: trLocale });
}

function fmtRange(r: Range) {
  return `${format(r.start, "d MMM", { locale: trLocale })} – ${fmtDay(r.end)}`;
}

function currentRange(preset: PeriodPreset, custom: Range): Range {
  const now = new Date();
  if (preset === "week") return { start: startOfWeek(now, { weekStartsOn: 1 }), end: now };
  if (preset === "month") return { start: startOfMonth(now), end: now };
  if (preset === "quarter") return { start: subMonths(now, 3), end: now };
  if (preset === "year") return { start: startOfYear(now), end: now };
  return custom;
}

function compareRange(cur: Range, mode: CompareMode): Range {
  if (mode === "yoy") {
    return { start: subYears(cur.start, 1), end: subYears(cur.end, 1) };
  }
  const days = Math.max(1, differenceInCalendarDays(cur.end, cur.start) + 1);
  const end = subDays(cur.start, 1);
  return { start: subDays(end, days - 1), end };
}

function useOwnTopics(businessId: string | undefined, range: Range) {
  const from = range.start.toISOString();
  const to = range.end.toISOString();
  return useQuery({
    queryKey: ["period_own_topics_v2", businessId, from, to],
    enabled: !!businessId,
    staleTime: 1000 * 60 * 5,
    // Tarih filtresi yorumun posted_at değerinden gelir (bkz. ownTopicRows.ts).
    queryFn: (): Promise<TopicRow[]> => fetchOwnTopicRows(businessId!, from, to),
  });
}

type Coverage = { total: number; analyzed: number };

function useCoverage(businessId: string | undefined, range: Range) {
  const from = range.start.toISOString();
  const to = range.end.toISOString();
  return useQuery({
    queryKey: ["period_coverage", businessId, from, to],
    enabled: !!businessId,
    staleTime: 1000 * 60 * 5,
    queryFn: async (): Promise<Coverage> => {
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

type Agg = { sum: number; n: number };
function aggregate(rows: TopicRow[], keyOf: (r: TopicRow) => string) {
  const m = new Map<string, Agg>();
  for (const r of rows) {
    const k = keyOf(r);
    const e = m.get(k) ?? { sum: 0, n: 0 };
    e.sum += r.sentiment;
    e.n++;
    m.set(k, e);
  }
  return m;
}

type CompareRow = {
  key: string;
  label: string;
  cur: number | null;
  prev: number | null;
  curN: number;
  prevN: number;
  /** null = yeterli veri yok */
  delta: number | null;
  thin: boolean;
  /** kıyas döneminde hiç analiz edilmiş veri yok */
  noPrev?: boolean;
};

function buildRows(
  curAgg: Map<string, Agg>,
  prevAgg: Map<string, Agg>,
  keys: string[],
  labelOf: (k: string) => string,
  prevEmpty = false,
): CompareRow[] {
  const rows = keys.map((key) => {
    const c = curAgg.get(key);
    const p = prevAgg.get(key);
    const curN = c?.n ?? 0;
    const prevN = p?.n ?? 0;
    const cur = c && c.n ? sentimentToIndex100(c.sum / c.n) : null;
    const prev = p && p.n ? sentimentToIndex100(p.sum / p.n) : null;
    const eligible = curN >= MIN_MENTIONS && prevN >= MIN_MENTIONS;
    return {
      key,
      label: labelOf(key),
      cur,
      prev,
      curN,
      prevN,
      delta: eligible && cur != null && prev != null ? cur - prev : null,
      thin: eligible && (curN < THIN_MENTIONS || prevN < THIN_MENTIONS),
      noPrev: prevEmpty,
    };
  });
  // Kıyas dönemi tamamen boşsa: bu dönem skoruna göre (en düşük üstte).
  if (prevEmpty) {
    return rows.sort((a, b) => {
      if (a.cur == null && b.cur == null) return b.curN - a.curN;
      if (a.cur == null) return 1;
      if (b.cur == null) return -1;
      return a.cur - b.cur;
    });
  }
  // Değişime göre: en çok gerileyen en üstte. Eşiği geçmeyenler en sonda.
  return rows.sort((a, b) => {
    if (a.delta == null && b.delta == null) return b.curN - a.curN;
    if (a.delta == null) return 1;
    if (b.delta == null) return -1;
    return a.delta - b.delta;
  });
}

function DeltaCell({ row }: { row: CompareRow }) {
  if (row.delta == null) {
    if (row.noPrev) {
      return <span className="text-xs text-muted-foreground">kıyas verisi yok</span>;
    }
    return <span className="text-xs text-muted-foreground">yeterli veri yok</span>;
  }
  const d = row.delta;
  const Icon = d > 1 ? ArrowUpRight : d < -1 ? ArrowDownRight : ArrowRight;
  const cls = d > 1 ? "text-success" : d < -1 ? "text-destructive" : "text-muted-foreground";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 text-sm font-semibold tabular-nums",
        cls,
        row.thin && "opacity-60",
      )}
    >
      <Icon className="h-3.5 w-3.5" />
      {d > 0 ? "+" : ""}
      {d.toFixed(1)}
      {row.thin && (
        <Badge variant="outline" className="ml-1 h-4 px-1 text-[10px] text-muted-foreground">
          az veri
        </Badge>
      )}
    </span>
  );
}

function scoreCell(v: number | null, n: number) {
  return (
    <span className={cn("tabular-nums", n === 0 && "text-muted-foreground")}>
      {v == null ? "—" : v.toFixed(1)}
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

export default function TopicAnalytics() {
  const { activeBusiness, businesses, setActiveBusiness } = useBusiness();
  const businessId = activeBusiness?.id;
  const { labelOf } = useCiTopics();

  const [preset, setPreset] = useState<PeriodPreset>("month");
  const [compareMode, setCompareMode] = useState<CompareMode>("prev");
  const [custom, setCustom] = useState<Range>({ start: subDays(new Date(), 30), end: new Date() });
  const [openDept, setOpenDept] = useState<DepartmentKey | null>(null);
  const [openTopic, setOpenTopic] = useState<string | null>(null);

  const cur = useMemo(() => currentRange(preset, custom), [preset, custom]);
  const prev = useMemo(() => compareRange(cur, compareMode), [cur, compareMode]);

  const curQ = useOwnTopics(businessId, cur);
  const prevQ = useOwnTopics(businessId, prev);
  const curCov = useCoverage(businessId, cur);
  const prevCov = useCoverage(businessId, prev);

  const curRows = curQ.data ?? [];
  const prevRows = prevQ.data ?? [];
  const loading = curQ.isLoading || prevQ.isLoading;

  const deptRows = useMemo(() => {
    const c = aggregate(curRows, (r) => departmentOf(r.topic_id));
    const p = aggregate(prevRows, (r) => departmentOf(r.topic_id));
    return buildRows(
      c,
      p,
      [...DEPARTMENTS],
      (k) => DEPARTMENT_LABELS[k as DepartmentKey],
      prevRows.length === 0,
    );
  }, [curRows, prevRows]);

  const summary = useMemo(() => {
    const eligible = deptRows.filter((r) => r.delta != null);
    const decliners = eligible.filter((r) => (r.delta as number) < -1).slice(0, 2);
    const improvers = [...eligible]
      .filter((r) => (r.delta as number) > 1)
      .sort((a, b) => (b.delta as number) - (a.delta as number))
      .slice(0, 2);
    const parts = [
      ...decliners.map((r) => `${r.label} ${Math.abs(r.delta as number).toFixed(0)} puan geriledi`),
      ...improvers.map((r) => `${r.label} ${(r.delta as number).toFixed(0)} puan iyileşti`),
    ];
    return parts.join(" · ");
  }, [deptRows]);

  const topicRowsOfDept = useMemo(() => {
    if (!openDept) return [];
    const inDept = (r: TopicRow) => departmentOf(r.topic_id) === openDept;
    const c = aggregate(curRows.filter(inDept), (r) => r.topic_id);
    const p = aggregate(prevRows.filter(inDept), (r) => r.topic_id);
    const keys = Array.from(new Set([...c.keys(), ...p.keys()]));
    return buildRows(c, p, keys, labelOf, prevRows.length === 0);
  }, [openDept, curRows, prevRows, labelOf]);

  const quotes = useMemo(() => {
    if (!openDept) return { left: [] as EvidenceQuote[], right: [] as EvidenceQuote[] };
    const row = deptRows.find((r) => r.key === openDept);
    const declining = (row?.delta ?? 0) <= 0;
    const inDept = (r: TopicRow) =>
      departmentOf(r.topic_id) === openDept && (r.excerpt ?? "").trim().length > 0;
    const toQuote = (r: TopicRow): EvidenceQuote => ({
      excerpt: (r.excerpt as string).trim(),
      sentiment: r.sentiment,
      meta: format(new Date(r.review_posted_at), "d MMM yyyy", { locale: trLocale }),
      reviewId: r.review_id,
      topicId: r.topic_id,
    });
    // Gerileyen departmanda: kıyas döneminden en olumlu, bu dönemden en olumsuz.
    // İyileşende tersi.
    const left = prevRows
      .filter(inDept)
      .sort((a, b) => (declining ? b.sentiment - a.sentiment : a.sentiment - b.sentiment))
      .slice(0, 5)
      .map(toQuote);
    const right = curRows
      .filter(inDept)
      .sort((a, b) => (declining ? a.sentiment - b.sentiment : b.sentiment - a.sentiment))
      .slice(0, 5)
      .map(toQuote);
    return { left, right };
  }, [openDept, curRows, prevRows, deptRows]);

  const prevCovPct =
    prevCov.data && prevCov.data.total > 0
      ? Math.round((prevCov.data.analyzed / prevCov.data.total) * 100)
      : null;

  const noData = !loading && curRows.length === 0;
  const prevEmpty = !loading && curRows.length > 0 && prevRows.length === 0;

  /** Departman karşılaştırma grafiği: iki dönemde de skoru olan departmanlar. */
  const chartData = useMemo<CompareBarDatum[]>(
    () =>
      deptRows
        .filter((r) => r.curN > 0 || r.prevN > 0)
        .map((r) => ({
          key: r.key,
          label: r.label,
          cur: Number((r.cur ?? 0).toFixed(1)),
          prev: Number((r.prev ?? 0).toFixed(1)),
          curN: r.curN,
          prevN: r.prevN,
        })),
    [deptRows],
  );

  /** Kıyas dönemin başından bu dönemin sonuna kadar aylık eksen. */
  const monthAxis = useMemo(() => {
    const out: string[] = [];
    const first = prev.start < cur.start ? prev.start : cur.start;
    let m = new Date(Date.UTC(first.getUTCFullYear(), first.getUTCMonth(), 1));
    const last = new Date(Date.UTC(cur.end.getUTCFullYear(), cur.end.getUTCMonth(), 1));
    while (m <= last && out.length < 40) {
      out.push(m.toISOString().slice(0, 7));
      m = addMonths(m, 1);
    }
    return out;
  }, [prev.start, cur.start, cur.end]);

  const monthLabel = (key: string) =>
    format(new Date(`${key}-01T00:00:00Z`), "MMM yy", { locale: trLocale });

  /** Açılan konunun iki dönemi kapsayan aylık gidişatı. */
  const topicTrend = useMemo(() => {
    if (!openTopic) return [];
    const all = [...prevRows, ...curRows].filter((r) => r.topic_id === openTopic);
    const byMonth = new Map<string, TopicRow[]>();
    for (const r of all) {
      const k = r.review_posted_at.slice(0, 7);
      const list = byMonth.get(k);
      if (list) list.push(r);
      else byMonth.set(k, [r]);
    }
    return monthAxis.map((k) => {
      const list = byMonth.get(k) ?? [];
      return {
        bucket: k,
        label: monthLabel(k),
        mentions: list.length,
        score:
          list.length >= 3
            ? Number(sentimentToIndex100(list.reduce((s, r) => s + r.sentiment, 0) / list.length).toFixed(1))
            : null,
      };
    });
  }, [openTopic, prevRows, curRows, monthAxis]);

  const boundaryLabel = monthLabel(cur.start.toISOString().slice(0, 7));

  function exportCsv() {
    const cell = (v: string | number) => {
      const s = String(v).replace(/"/g, '""');
      return /[;\n"]/.test(s) ? `"${s}"` : s;
    };
    const num = (v: number | null) => (v == null ? "veri yok" : v.toFixed(1).replace(".", ","));
    const lines = [
      `Dönem;${fmtRange(cur)}`,
      `Kıyas dönem;${fmtRange(prev)}`,
      "",
      "Departman;Bu dönem (0-100);Kıyas dönem (0-100);Değişim;Bu dönem bahis;Kıyas bahis",
      ...deptRows.map((r) =>
        [
          cell(r.label),
          num(r.cur),
          num(r.prev),
          r.delta == null ? "yeterli veri yok" : num(r.delta),
          r.curN,
          r.prevN,
        ].join(";"),
      ),
    ];
    downloadCsv(`donem-analizi-${format(cur.start, "yyyyMMdd")}-${format(cur.end, "yyyyMMdd")}.csv`, lines.join("\r\n"));
  }

  return (
    <div className="space-y-6">
      <Helmet>
        <title>Dönem Analizi | VoyageRespond</title>
        <meta
          name="description"
          content="Departmanların bir önceki döneme göre gidişatını, konu kırılımını ve misafir alıntılarını karşılaştırın."
        />
      </Helmet>

      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Dönem Analizi</h1>
          <p className="text-sm text-muted-foreground">
            {fmtRange(cur)} · kıyas: {fmtRange(prev)}
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
          <p className="mt-1 text-xs text-muted-foreground">
            Bu sayfa yalnızca kendi yorumlarınızı gösterir. Rakip kıyası için Karşılaştırma sayfasını kullanın.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Select value={preset} onValueChange={(v) => setPreset(v as PeriodPreset)}>
            <SelectTrigger className="h-9 w-[150px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Bu hafta</SelectItem>
              <SelectItem value="month">Bu ay</SelectItem>
              <SelectItem value="quarter">Son 3 ay</SelectItem>
              <SelectItem value="year">Bu yıl</SelectItem>
              <SelectItem value="custom">Özel aralık</SelectItem>
            </SelectContent>
          </Select>
          <Select value={compareMode} onValueChange={(v) => setCompareMode(v as CompareMode)}>
            <SelectTrigger className="h-9 w-[210px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="prev">Önceki eşdeğer dönem</SelectItem>
              <SelectItem value="yoy">Geçen yılın aynı dönemi</SelectItem>
            </SelectContent>
          </Select>
          {preset === "custom" && (
            <div className="flex items-center gap-1">
              <DatePick date={custom.start} onChange={(d) => setCustom((p) => ({ ...p, start: d }))} />
              <span className="text-xs text-muted-foreground">–</span>
              <DatePick date={custom.end} onChange={(d) => setCustom((p) => ({ ...p, end: d }))} />
            </div>
          )}
          <Button variant="outline" size="sm" className="h-9" onClick={exportCsv} disabled={loading || noData}>
            <Download className="mr-1.5 h-3.5 w-3.5" />
            CSV
          </Button>
        </div>
      </div>

      {/* Kapsam dürüstlüğü */}
      {!loading && curCov.data && prevCov.data && (
        <p className="text-xs text-muted-foreground">
          Bu dönem: {curCov.data.total} yorumun {curCov.data.analyzed}'i analiz edildi · Kıyas dönem:{" "}
          {prevCov.data.total} yorumun {prevCov.data.analyzed}'i analiz edildi
          {prevCovPct !== null ? ` (%${prevCovPct})` : ""}
        </p>
      )}

      {!loading && !prevEmpty && prevCovPct !== null && prevCovPct < 50 && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            Kıyas dönemindeki yorumların çoğu analiz edilmemiş; değişim değerleri eksik veriye dayanıyor.
            Toplu konu analizi yalnızca son 6 ayı kapsar.
          </AlertDescription>
        </Alert>
      )}

      {loading ? (
        <Skeleton className="h-80 w-full rounded-xl" />
      ) : noData ? (
        <Card>
          <CardContent className="space-y-2 py-12 text-center">
            <p className="text-sm text-muted-foreground">
              Bu dönemde analiz edilmiş yorum yok.
            </p>
            <p className="text-xs text-muted-foreground">
              Konu analizi yalnızca son 6 ayı kapsar — daha eski dönemlerde konu verisi bulunmaz.
              Daha yakın bir dönem veya "Önceki eşdeğer dönem" kıyasını deneyin.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
        {chartData.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Departman karşılaştırması</CardTitle>
              <p className="text-xs text-muted-foreground">
                Kıyas dönem (gri) ile bu dönem yan yana · 0-100 ölçeği
              </p>
            </CardHeader>
            <CardContent>
              <CompareBars data={chartData} />
            </CardContent>
          </Card>
        )}
        <Card>
          <CardHeader className="space-y-2">
            <CardTitle className="text-base">
              {prevEmpty
                ? "Departman gidişatı — bu dönem skoruna göre sıralı"
                : "Departman gidişatı — değişime göre sıralı"}
            </CardTitle>
            {prevEmpty ? (
              <p className="text-sm text-muted-foreground">
                Kıyas döneminde analiz edilmiş yorum yok — yalnızca bu dönemin skorları gösteriliyor.
              </p>
            ) : summary ? (
              <p className="text-sm text-muted-foreground">{summary}</p>
            ) : (
              <p className="text-sm text-muted-foreground">
                Eşiği geçen ({MIN_MENTIONS} bahis) departmanlarda anlamlı bir değişim yok.
              </p>
            )}
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/40 text-xs text-muted-foreground">
                    <th className="px-4 py-2 text-left font-medium">Departman</th>
                    <th className="px-3 py-2 text-right font-medium">Bu dönem</th>
                    <th className="px-3 py-2 text-right font-medium">Kıyas dönem</th>
                    <th className="px-3 py-2 text-right font-medium">Değişim</th>
                    <th className="px-3 py-2 text-right font-medium">Bu dönem bahis</th>
                    <th className="px-4 py-2 text-right font-medium">Kıyas bahis</th>
                  </tr>
                </thead>
                <tbody>
                  {deptRows.map((r) => {
                    const open = openDept === r.key;
                    return (
                      <Fragment key={r.key}>
                        <tr
                          className="cursor-pointer border-b transition-colors hover:bg-muted/30"
                          onClick={() => setOpenDept(open ? null : (r.key as DepartmentKey))}
                        >
                          <td className="px-4 py-2.5 font-medium">
                            <span className="inline-flex items-center gap-1.5">
                              {open ? (
                                <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                              ) : (
                                <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                              )}
                              {r.label}
                            </span>
                          </td>
                          <td className="px-3 py-2.5 text-right">{scoreCell(r.cur, r.curN)}</td>
                          <td className="px-3 py-2.5 text-right">{scoreCell(r.prev, r.prevN)}</td>
                          <td className="px-3 py-2.5 text-right">
                            <DeltaCell row={r} />
                          </td>
                          <td className="px-3 py-2.5 text-right tabular-nums text-muted-foreground">
                            {r.curN}
                          </td>
                          <td className="px-4 py-2.5 text-right tabular-nums text-muted-foreground">
                            {r.prevN}
                          </td>
                        </tr>
                        {open && (
                          <tr className="border-b bg-muted/20">
                            <td colSpan={6} className="px-4 py-4">
                              <div className="space-y-4">
                                <div>
                                  <div className="mb-1.5 text-xs font-medium">
                                    {r.label} — konu kırılımı
                                  </div>
                                  {topicRowsOfDept.length === 0 ? (
                                    <p className="text-xs text-muted-foreground">
                                      Bu departmanda iki dönemde de konu bahsi yok.
                                    </p>
                                  ) : (
                                    topicRowsOfDept.map((tr2) => (
                                      <div key={tr2.key} className="border-b border-border/50 last:border-0">
                                        <button
                                          type="button"
                                          className="flex w-full items-center justify-between gap-3 py-1 text-left text-xs hover:bg-muted/40"
                                          onClick={() =>
                                            setOpenTopic(openTopic === tr2.key ? null : tr2.key)
                                          }
                                        >
                                          <span className="inline-flex min-w-0 items-center gap-1 font-medium">
                                            {openTopic === tr2.key ? (
                                              <ChevronDown className="h-3 w-3 shrink-0 text-muted-foreground" />
                                            ) : (
                                              <ChevronRight className="h-3 w-3 shrink-0 text-muted-foreground" />
                                            )}
                                            <span className="truncate">{tr2.label}</span>
                                          </span>
                                          <span className="flex shrink-0 items-center gap-3 tabular-nums">
                                            <span className="text-muted-foreground">
                                              {tr2.curN} / {tr2.prevN} bahis
                                            </span>
                                            <span>{tr2.cur == null ? "—" : tr2.cur.toFixed(1)}</span>
                                            <span className="text-muted-foreground">
                                              {tr2.prev == null ? "—" : tr2.prev.toFixed(1)}
                                            </span>
                                            <DeltaCell row={tr2} />
                                          </span>
                                        </button>
                                        {openTopic === tr2.key && (
                                          <div className="pb-3 pt-2">
                                            <p className="mb-1 text-[11px] text-muted-foreground">
                                              {tr2.label} — aylık gidişat (kıyas dönem + bu dönem, kesikli
                                              çizgi bu dönemin başı)
                                            </p>
                                            <TrendLine
                                              data={topicTrend}
                                              boundaryLabel={boundaryLabel}
                                              height={180}
                                            />
                                            <p className="text-[11px] text-muted-foreground">
                                              Ayda 3'ten az bahis olan aylar gösterilmez.
                                            </p>
                                          </div>
                                        )}
                                      </div>
                                    ))
                                  )}
                                </div>

                                <QuoteColumns
                                  leftTitle="Kıyas dönemde ne yazmışlar"
                                  rightTitle="Bu dönemde ne yazıyorlar"
                                  left={quotes.left}
                                  right={quotes.right}
                                />
                              </div>
                            </td>
                          </tr>
                        )}
                      </Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <p className="border-t px-4 py-3 text-[11px] text-muted-foreground">
              Skorlar 0-100 ölçeğindedir. İki dönemden birinde {MIN_MENTIONS} bahisin altındaki
              departmanlarda değişim hesaplanmaz ve sıralamaya girmez; {MIN_MENTIONS}-{THIN_MENTIONS - 1}
              {" "}bahis "az veri" olarak işaretlenir.
            </p>
          </CardContent>
        </Card>
        </>
      )}
    </div>
  );
}
