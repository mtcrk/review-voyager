import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import {
  Loader2,
  Sparkles,
  TrendingDown,
  TrendingUp,
  Minus,
  AlertTriangle,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import {
  DEPARTMENTS,
  DEPARTMENT_LABELS,
  type DepartmentKey,
  departmentOf,
  sentimentToIndex100,
} from "@/lib/topicDepartments";

type Topic = {
  id: string;
  category: string;
  display_name: any;
};

type TopicRow = {
  topic_id: string;
  review_source: "own" | "competitor";
  competitor_id: string | null;
  sentiment: number;
  excerpt: string | null;
  review_posted_at: string | null;
};

const MIN_MENTIONS = 3;

function topicName(t: Topic) {
  return t.display_name?.tr ?? t.display_name?.en ?? t.id;
}

function deltaClass(d: number | null) {
  if (d == null) return "text-muted-foreground";
  if (d >= 2) return "text-emerald-600 dark:text-emerald-400";
  if (d <= -2) return "text-rose-600 dark:text-rose-400";
  return "text-muted-foreground";
}

function fmtDelta(d: number | null) {
  if (d == null) return "—";
  const s = d > 0 ? "+" : d < 0 ? "−" : "";
  return `${s}${Math.abs(d).toFixed(1)}`;
}

function isoDaysAgo(days: number) {
  return new Date(Date.now() - days * 86400_000).toISOString();
}

export function TopicAnalysis({ businessId }: { businessId: string }) {
  const [analyzing, setAnalyzing] = useState(false);
  const [dept, setDept] = useState<"all" | DepartmentKey>("all");
  const [openTopic, setOpenTopic] = useState<string | null>(null);
  const qc = useQueryClient();

  const topicsQ = useQuery({
    queryKey: ["ci_topics_all"],
    queryFn: async () => {
      const { data } = await supabase
        .from("ci_topics")
        .select("id, category, display_name, applies_to_verticals");
      return ((data ?? []) as any[]).filter((t) =>
        Array.isArray(t.applies_to_verticals) && t.applies_to_verticals.includes("hotel"),
      ) as Topic[];
    },
  });

  const rowsQ = useQuery({
    queryKey: ["ci_review_topics", businessId],
    enabled: !!businessId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ci_review_topics")
        .select("topic_id, review_source, competitor_id, sentiment, excerpt, review_posted_at")
        .eq("business_id", businessId);
      if (error) throw error;
      return (data ?? []) as TopicRow[];
    },
  });

  const competitorsQ = useQuery({
    queryKey: ["ci_competitor_names", businessId],
    enabled: !!businessId,
    queryFn: async () => {
      const { data } = await supabase
        .from("ci_competitors")
        .select("id, name")
        .eq("business_id", businessId)
        .eq("status", "confirmed");
      const map: Record<string, string> = {};
      for (const c of (data ?? []) as any[]) map[c.id] = c.name;
      return map;
    },
  });

  const pendingQ = useQuery({
    queryKey: ["ci_topics_pending", businessId],
    enabled: !!businessId,
    queryFn: async () => {
      const { data: comps } = await supabase
        .from("ci_competitors")
        .select("id")
        .eq("business_id", businessId)
        .eq("status", "confirmed");
      const compIds = (comps ?? []).map((c: any) => c.id);
      let compPending = 0;
      if (compIds.length > 0) {
        const { count } = await supabase
          .from("ci_competitor_reviews")
          .select("id", { count: "exact", head: true })
          .in("competitor_id", compIds)
          .is("topics_extracted_at", null)
          .not("body", "is", null);
        compPending = count ?? 0;
      }
      return { competitor: compPending };
    },
  });

  const topics = topicsQ.data ?? [];
  const rows = rowsQ.data ?? [];
  const compNames = competitorsQ.data ?? {};

  const nameById = useMemo(() => {
    const m: Record<string, Topic> = {};
    for (const t of topics) m[t.id] = t;
    return m;
  }, [topics]);

  /** Per-topic aggregation, incl. per-competitor breakdown and own 90d trend. */
  const perTopic = useMemo(() => {
    const since90 = isoDaysAgo(90);
    const since180 = isoDaysAgo(180);
    type Agg = {
      ownCount: number;
      ownSum: number;
      compCount: number;
      compSum: number;
      recentSum: number;
      recentN: number;
      prevSum: number;
      prevN: number;
      byComp: Map<string, { count: number; sum: number }>;
    };
    const map = new Map<string, Agg>();
    for (const r of rows) {
      const e =
        map.get(r.topic_id) ??
        ({
          ownCount: 0,
          ownSum: 0,
          compCount: 0,
          compSum: 0,
          recentSum: 0,
          recentN: 0,
          prevSum: 0,
          prevN: 0,
          byComp: new Map(),
        } as Agg);
      if (r.review_source === "own") {
        e.ownCount++;
        e.ownSum += r.sentiment;
        if (r.review_posted_at) {
          if (r.review_posted_at >= since90) {
            e.recentSum += r.sentiment;
            e.recentN++;
          } else if (r.review_posted_at >= since180) {
            e.prevSum += r.sentiment;
            e.prevN++;
          }
        }
      } else {
        e.compCount++;
        e.compSum += r.sentiment;
        if (r.competitor_id) {
          const c = e.byComp.get(r.competitor_id) ?? { count: 0, sum: 0 };
          c.count++;
          c.sum += r.sentiment;
          e.byComp.set(r.competitor_id, c);
        }
      }
      map.set(r.topic_id, e);
    }
    return map;
  }, [rows]);

  const totalMentions = rows.length;

  /** Flat table rows on the 0-100 scale. */
  const tableRows = useMemo(() => {
    const out = topics
      .map((t) => {
        const a = perTopic.get(t.id);
        if (!a) return null;
        const mentions = a.ownCount + a.compCount;
        if (mentions === 0) return null;
        const own = a.ownCount ? sentimentToIndex100(a.ownSum / a.ownCount) : null;
        const comp = a.compCount ? sentimentToIndex100(a.compSum / a.compCount) : null;
        const delta = own != null && comp != null ? own - comp : null;
        const recent = a.recentN >= 2 ? sentimentToIndex100(a.recentSum / a.recentN) : null;
        const prev = a.prevN >= 2 ? sentimentToIndex100(a.prevSum / a.prevN) : null;
        const trend = recent != null && prev != null ? recent - prev : null;
        const competitors = Array.from(a.byComp.entries())
          .map(([id, c]) => ({
            id,
            name: compNames[id] ?? "Rakip",
            count: c.count,
            index: sentimentToIndex100(c.sum / c.count),
          }))
          .map((c) => ({ ...c, delta: own != null ? own - c.index : null }))
          .sort((a2, b2) => b2.index - a2.index);
        return {
          topic: t,
          dept: departmentOf(t.id),
          mentions,
          ownCount: a.ownCount,
          compCount: a.compCount,
          own,
          comp,
          delta,
          trend,
          competitors,
        };
      })
      .filter((x): x is NonNullable<typeof x> => x != null);

    const visible = out.filter((r) => r.mentions >= MIN_MENTIONS);
    const hidden = out.length - visible.length;
    visible.sort((a, b) => {
      const av = a.delta ?? 999;
      const bv = b.delta ?? 999;
      return av - bv;
    });
    return { visible, hidden, totalTopics: out.length };
  }, [topics, perTopic, compNames]);

  /** Department summary — mention share + own/comp index + delta. */
  const departments = useMemo(() => {
    const agg = new Map<
      DepartmentKey,
      { mentions: number; ownSum: number; ownN: number; compSum: number; compN: number }
    >();
    for (const r of rows) {
      const key = departmentOf(r.topic_id);
      const e = agg.get(key) ?? { mentions: 0, ownSum: 0, ownN: 0, compSum: 0, compN: 0 };
      e.mentions++;
      if (r.review_source === "own") {
        e.ownSum += r.sentiment;
        e.ownN++;
      } else {
        e.compSum += r.sentiment;
        e.compN++;
      }
      agg.set(key, e);
    }
    const total = rows.length;
    return DEPARTMENTS.map((key) => {
      const e = agg.get(key);
      if (!e || e.mentions === 0) return null;
      const own = e.ownN ? sentimentToIndex100(e.ownSum / e.ownN) : null;
      const comp = e.compN ? sentimentToIndex100(e.compSum / e.compN) : null;
      return {
        key,
        label: DEPARTMENT_LABELS[key],
        mentions: e.mentions,
        share: total ? (e.mentions / total) * 100 : 0,
        ownN: e.ownN,
        compN: e.compN,
        own,
        comp,
        delta: own != null && comp != null ? own - comp : null,
      };
    })
      .filter((x): x is NonNullable<typeof x> => x != null)
      .sort((a, b) => (a.delta ?? 999) - (b.delta ?? 999));
  }, [rows]);

  const availableDepts = useMemo(
    () => Array.from(new Set(tableRows.visible.map((r) => r.dept))),
    [tableRows.visible],
  );

  const filteredRows = useMemo(
    () => (dept === "all" ? tableRows.visible : tableRows.visible.filter((r) => r.dept === dept)),
    [tableRows.visible, dept],
  );

  const worstThree = useMemo(
    () =>
      tableRows.visible
        .filter((r) => r.delta != null && r.delta < -2)
        .slice(0, 3),
    [tableRows.visible],
  );

  const pending = pendingQ.data;
  const hasPending = (pending?.competitor ?? 0) > 0;

  async function runAnalysis() {
    setAnalyzing(true);
    const { data, error } = await supabase.functions.invoke("analyze-competitor-topics", {
      body: { business_id: businessId, limit: 80 },
    });
    setAnalyzing(false);
    if (error) {
      toast({ title: "Analiz başarısız", description: error.message, variant: "destructive" });
      return;
    }
    const analyzed = (data as any)?.analyzed ?? 0;
    const mentions = (data as any)?.mentions ?? 0;
    toast({
      title: analyzed === 0 ? "Yeni yorum yok" : "Konu analizi tamamlandı",
      description:
        analyzed === 0
          ? "Analiz edilecek yeni yorum bulunamadı."
          : `${analyzed} yorum işlendi, ${mentions} konu bahsi çıkarıldı.`,
    });
    qc.invalidateQueries({ queryKey: ["ci_review_topics", businessId] });
    qc.invalidateQueries({ queryKey: ["ci_topics_pending", businessId] });
  }

  if (topicsQ.isLoading || rowsQ.isLoading) {
    return <Skeleton className="h-64 w-full" />;
  }

  if (totalMentions === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center space-y-3">
          <Sparkles className="h-7 w-7 mx-auto text-muted-foreground" />
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            {hasPending
              ? `${pending?.competitor ?? 0} rakip yorumu konu analizi bekliyor.`
              : "Henüz analiz edilecek rakip yorumu yok. Önce Rakip Seçimi sekmesinden rakip yorumlarını toplayın."}
          </p>
          {hasPending && (
            <Button size="sm" onClick={runAnalysis} disabled={analyzing}>
              {analyzing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4" />
              )}
              Rakip Yorumlarını Analiz Et
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* ===== Departman özeti ===== */}
      <Card>
        <CardHeader className="pb-3 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 space-y-0">
          <div>
            <CardTitle className="text-base">Departman kırılımı</CardTitle>
            <p className="text-xs text-muted-foreground mt-1">
              Hangi departmanda rakiplerinizin gerisindesiniz? Tüm skorlar 0-100 ölçeğinde
              (İtibar indeksiyle aynı). {totalMentions} konu bahsi üzerinden.
            </p>
          </div>
          {hasPending && (
            <Button size="sm" variant="outline" onClick={runAnalysis} disabled={analyzing}>
              {analyzing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4" />
              )}
              {pending?.competitor} rakip yorumunu analiz et
            </Button>
          )}
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-muted-foreground border-b">
                  <th className="py-2 px-4 font-medium">Departman</th>
                  <th className="py-2 px-3 font-medium text-right">Pay</th>
                  <th className="py-2 px-3 font-medium text-right">Siz</th>
                  <th className="py-2 px-3 font-medium text-right">Rakip ort.</th>
                  <th className="py-2 px-4 font-medium text-right">Fark</th>
                </tr>
              </thead>
              <tbody>
                {departments.map((d) => (
                  <tr key={d.key} className="border-b last:border-0">
                    <td className="py-2.5 px-4 font-medium">{d.label}</td>
                    <td className="py-2.5 px-3 text-right tabular-nums">
                      %{d.share.toFixed(1)}
                      <div className="text-[10px] text-muted-foreground">{d.mentions} bahis</div>
                    </td>
                    <td className="py-2.5 px-3 text-right tabular-nums">
                      {d.own != null ? d.own.toFixed(1) : "veri yok"}
                      {d.own != null && (
                        <div className="text-[10px] text-muted-foreground">
                          {d.ownN} bahis üzerinden
                        </div>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-right tabular-nums">
                      {d.comp != null ? d.comp.toFixed(1) : "veri yok"}
                      {d.comp != null && (
                        <div className="text-[10px] text-muted-foreground">
                          {d.compN} bahis üzerinden
                        </div>
                      )}
                    </td>
                    <td
                      className={`py-2.5 px-4 text-right tabular-nums font-medium ${deltaClass(d.delta)}`}
                    >
                      {fmtDelta(d.delta)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* ===== Aksiyon şeridi ===== */}
      {worstThree.length > 0 && (
        <div className="rounded-lg border border-rose-500/30 bg-rose-500/5 px-4 py-3">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-sm">
            <span className="inline-flex items-center gap-1.5 font-medium text-rose-700 dark:text-rose-300 shrink-0">
              <AlertTriangle className="h-4 w-4" /> Öncelik
            </span>
            <span className="text-muted-foreground">
              {worstThree
                .map(
                  (r) =>
                    `Rakipler ${topicName(r.topic)} konusunda sizden ${Math.abs(r.delta!).toFixed(0)} puan önde`,
                )
                .join(" · ")}
            </span>
          </div>
        </div>
      )}

      {/* ===== Konu tablosu ===== */}
      <Card>
        <CardHeader className="pb-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 space-y-0">
          <div>
            <CardTitle className="text-base">Konu bazlı karşılaştırma</CardTitle>
            <p className="text-xs text-muted-foreground mt-1">
              Farka göre sıralı, en kötü üstte. Satıra tıklayarak rakip bazlı kırılımı görün.
            </p>
          </div>
          <Select value={dept} onValueChange={(v) => setDept(v as any)}>
            <SelectTrigger className="w-full sm:w-[240px] h-9">
              <SelectValue placeholder="Departman" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tüm departmanlar</SelectItem>
              {availableDepts.map((d) => (
                <SelectItem key={d} value={d}>
                  {DEPARTMENT_LABELS[d]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-muted-foreground border-b">
                  <th className="py-2 px-4 font-medium">Konu</th>
                  <th className="py-2 px-3 font-medium">Departman</th>
                  <th className="py-2 px-3 font-medium text-right">Bahis</th>
                  <th className="py-2 px-3 font-medium text-right">Pay</th>
                  <th className="py-2 px-3 font-medium text-right">Siz</th>
                  <th className="py-2 px-3 font-medium text-right">Rakip ort.</th>
                  <th className="py-2 px-3 font-medium text-right">Fark</th>
                  <th className="py-2 px-4 font-medium text-right">Trend</th>
                </tr>
              </thead>
              <tbody>
                {filteredRows.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-6 px-4 text-center text-sm text-muted-foreground">
                      Bu departmanda yeterli bahis yok.
                    </td>
                  </tr>
                ) : (
                  filteredRows.map((r) => {
                    const open = openTopic === r.topic.id;
                    return (
                      <>
                        <tr
                          key={r.topic.id}
                          className="border-b last:border-0 cursor-pointer hover:bg-muted/40"
                          onClick={() => setOpenTopic(open ? null : r.topic.id)}
                        >
                          <td className="py-2.5 px-4 font-medium">
                            <span className="inline-flex items-center gap-1.5">
                              {open ? (
                                <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                              ) : (
                                <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                              )}
                              {topicName(r.topic)}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-xs text-muted-foreground">
                            {DEPARTMENT_LABELS[r.dept]}
                          </td>
                          <td className="py-2.5 px-3 text-right tabular-nums">{r.mentions}</td>
                          <td className="py-2.5 px-3 text-right tabular-nums">
                            %{((r.mentions / totalMentions) * 100).toFixed(1)}
                          </td>
                          <td className="py-2.5 px-3 text-right tabular-nums">
                            {r.own != null ? r.own.toFixed(1) : "veri yok"}
                            {r.own != null && (
                              <div className="text-[10px] text-muted-foreground">
                                {r.ownCount} bahis
                              </div>
                            )}
                          </td>
                          <td className="py-2.5 px-3 text-right tabular-nums">
                            {r.comp != null ? r.comp.toFixed(1) : "veri yok"}
                            {r.comp != null && (
                              <div className="text-[10px] text-muted-foreground">
                                {r.compCount} bahis
                              </div>
                            )}
                          </td>
                          <td
                            className={`py-2.5 px-3 text-right tabular-nums font-medium ${deltaClass(r.delta)}`}
                          >
                            {fmtDelta(r.delta)}
                          </td>
                          <td className="py-2.5 px-4 text-right">
                            {r.trend == null ? (
                              <span className="text-xs text-muted-foreground">—</span>
                            ) : r.trend >= 2 ? (
                              <span className="inline-flex items-center gap-1 text-xs text-emerald-600">
                                <TrendingUp className="h-3.5 w-3.5" />
                                {r.trend.toFixed(0)}
                              </span>
                            ) : r.trend <= -2 ? (
                              <span className="inline-flex items-center gap-1 text-xs text-rose-600">
                                <TrendingDown className="h-3.5 w-3.5" />
                                {Math.abs(r.trend).toFixed(0)}
                              </span>
                            ) : (
                              <span className="inline-flex items-center text-xs text-muted-foreground">
                                <Minus className="h-3.5 w-3.5" />
                              </span>
                            )}
                          </td>
                        </tr>
                        {open && (
                          <tr key={`${r.topic.id}-detail`} className="border-b last:border-0 bg-muted/30">
                            <td colSpan={8} className="px-4 py-3">
                              {r.competitors.length === 0 ? (
                                <p className="text-xs text-muted-foreground">
                                  Bu konuda rakip bahsi yok.
                                </p>
                              ) : (
                                <div className="space-y-1.5">
                                  <div className="text-xs font-medium">
                                    {topicName(r.topic)} — rakip bazlı kırılım
                                  </div>
                                  {r.competitors.map((c) => (
                                    <div
                                      key={c.id}
                                      className="flex items-center justify-between gap-3 text-xs py-1 border-b last:border-0 border-border/50"
                                    >
                                      <span className="truncate font-medium">{c.name}</span>
                                      <span className="flex items-center gap-3 shrink-0 tabular-nums">
                                        <span className="text-muted-foreground">
                                          {c.count} bahis
                                        </span>
                                        <span>{c.index.toFixed(1)}</span>
                                        <Badge
                                          variant="outline"
                                          className={`h-5 ${deltaClass(c.delta)}`}
                                        >
                                          {fmtDelta(c.delta)}
                                        </Badge>
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </td>
                          </tr>
                        )}
                      </>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
          {tableRows.hidden > 0 && (
            <p className="text-[11px] text-muted-foreground px-4 py-3 border-t">
              {tableRows.hidden} konu az bahis nedeniyle gizlendi ({MIN_MENTIONS} bahisin altı).
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
