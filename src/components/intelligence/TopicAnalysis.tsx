import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/hooks/use-toast";
import { Loader2, Sparkles, TrendingDown, TrendingUp, AlertTriangle, Target } from "lucide-react";
import {
  Tooltip as UITooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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

function topicName(t: Topic) {
  return t.display_name?.tr ?? t.display_name?.en ?? t.id;
}

function sentimentColor(avg: number, count: number) {
  if (count === 0) return "bg-muted/30 text-muted-foreground";
  if (avg >= 0.3) return "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300";
  if (avg >= -0.1) return "bg-amber-500/15 text-amber-700 dark:text-amber-300";
  return "bg-rose-500/15 text-rose-700 dark:text-rose-300";
}

export function TopicAnalysis({ businessId }: { businessId: string }) {
  const [analyzing, setAnalyzing] = useState(false);
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

  const pendingQ = useQuery({
    queryKey: ["ci_topics_pending", businessId],
    enabled: !!businessId,
    queryFn: async () => {
      const [{ count: ownPending }, { data: comps }] = await Promise.all([
        supabase
          .from("reviews")
          .select("id", { count: "exact", head: true })
          .eq("business_id", businessId)
          .is("topics_extracted_at", null)
          .not("comment", "is", null),
        supabase
          .from("ci_competitors")
          .select("id")
          .eq("business_id", businessId)
          .eq("status", "confirmed"),
      ]);
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
      return { own: ownPending ?? 0, competitor: compPending };
    },
  });

  const topics = topicsQ.data ?? [];
  const rows = rowsQ.data ?? [];

  const stats = useMemo(() => {
    const byTopic = new Map<string, { ownCount: number; ownSum: number; compCount: number; compSum: number; recentExcerpts: TopicRow[] }>();
    for (const r of rows) {
      const e = byTopic.get(r.topic_id) ?? { ownCount: 0, ownSum: 0, compCount: 0, compSum: 0, recentExcerpts: [] };
      if (r.review_source === "own") {
        e.ownCount++;
        e.ownSum += r.sentiment;
      } else {
        e.compCount++;
        e.compSum += r.sentiment;
      }
      if (r.excerpt) e.recentExcerpts.push(r);
      byTopic.set(r.topic_id, e);
    }
    return byTopic;
  }, [rows]);

  // Opportunities: rakipte negatif (avg <= -0.2) + en az 3 yorum, sende ya yok ya pozitif
  const opportunities = useMemo(() => {
    const out: { topic: Topic; compAvg: number; compCount: number; ownAvg: number | null; ownCount: number }[] = [];
    for (const t of topics) {
      const s = stats.get(t.id);
      if (!s) continue;
      const compAvg = s.compCount > 0 ? s.compSum / s.compCount : 0;
      const ownAvg = s.ownCount > 0 ? s.ownSum / s.ownCount : null;
      if (s.compCount >= 3 && compAvg <= -0.2 && (ownAvg == null || ownAvg >= 0.1)) {
        out.push({ topic: t, compAvg, compCount: s.compCount, ownAvg, ownCount: s.ownCount });
      }
    }
    return out.sort((a, b) => a.compAvg - b.compAvg).slice(0, 6);
  }, [topics, stats]);

  // Risks: sende negatif + rakipte pozitif veya yok
  const risks = useMemo(() => {
    const out: { topic: Topic; ownAvg: number; ownCount: number; compAvg: number | null; compCount: number }[] = [];
    for (const t of topics) {
      const s = stats.get(t.id);
      if (!s) continue;
      const ownAvg = s.ownCount > 0 ? s.ownSum / s.ownCount : 0;
      const compAvg = s.compCount > 0 ? s.compSum / s.compCount : null;
      if (s.ownCount >= 2 && ownAvg <= -0.2 && (compAvg == null || compAvg >= 0.1)) {
        out.push({ topic: t, ownAvg, ownCount: s.ownCount, compAvg, compCount: s.compCount });
      }
    }
    return out.sort((a, b) => a.ownAvg - b.ownAvg).slice(0, 6);
  }, [topics, stats]);

  // Heatmap: top categories with most activity
  const heatmap = useMemo(() => {
    const active = topics
      .map((t) => {
        const s = stats.get(t.id);
        const total = (s?.ownCount ?? 0) + (s?.compCount ?? 0);
        return { t, s, total };
      })
      .filter((x) => x.total >= 2)
      .sort((a, b) => b.total - a.total)
      .slice(0, 12);
    return active;
  }, [topics, stats]);

  const totalMentions = rows.length;
  const pending = pendingQ.data;
  const hasPending = (pending?.own ?? 0) + (pending?.competitor ?? 0) > 0;

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
      description: analyzed === 0
        ? "Analiz edilecek yeni yorum bulunamadı."
        : `${analyzed} yorum işlendi, ${mentions} konu bahsi çıkarıldı.`,
    });
    qc.invalidateQueries({ queryKey: ["ci_review_topics", businessId] });
    qc.invalidateQueries({ queryKey: ["ci_topics_pending", businessId] });
  }

  if (topicsQ.isLoading || rowsQ.isLoading) {
    return <Skeleton className="h-64 w-full" />;
  }

  return (
    <TooltipProvider delayDuration={200}>
      <div className="space-y-4">
        <Card>
          <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 space-y-0">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" /> Konu & Sentiment Analizi
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-1">
                {totalMentions === 0
                  ? "Yorumlardan konu çıkarımı henüz yapılmadı."
                  : `${totalMentions} konu bahsi · ${hasPending ? `${(pending?.own ?? 0) + (pending?.competitor ?? 0)} yeni yorum analiz bekliyor` : "Tümü güncel"}`}
              </p>
            </div>
            <Button size="sm" onClick={runAnalysis} disabled={analyzing || (!hasPending && totalMentions > 0)}>
              {analyzing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              {totalMentions === 0 ? "Konuları Analiz Et" : "Yeniden Analiz"}
            </Button>
          </CardHeader>
        </Card>

        {totalMentions === 0 ? (
          <Card>
            <CardContent className="p-8 text-center text-sm text-muted-foreground">
              {hasPending
                ? `Hazır: ${pending?.own ?? 0} yorumunuz ve ${pending?.competitor ?? 0} rakip yorumu analiz bekliyor. "Konuları Analiz Et" butonuna basın.`
                : "Henüz analiz edilecek yorum yok. Önce kendi yorumlarınızı çekin ve rakip yorumlarını toplayın."}
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Target className="h-4 w-4 text-emerald-600" /> Sizin için fırsatlar
                  </CardTitle>
                  <p className="text-xs text-muted-foreground">
                    Rakiplerde negatif yükseliyor — sizin reklamlarınızda öne çıkarabilirsiniz.
                  </p>
                </CardHeader>
                <CardContent className="space-y-2">
                  {opportunities.length === 0 ? (
                    <p className="text-xs text-muted-foreground">Şu an belirgin fırsat yok.</p>
                  ) : (
                    opportunities.map(({ topic, compAvg, compCount, ownAvg }) => (
                      <div key={topic.id} className="flex items-center justify-between gap-2 text-sm py-1.5 border-b last:border-b-0">
                        <div className="min-w-0">
                          <div className="font-medium truncate">{topicName(topic)}</div>
                          <div className="text-xs text-muted-foreground">
                            Rakipte {compCount} negatif şikayet
                            {ownAvg != null && ` · sizde ${ownAvg > 0 ? "pozitif" : "nötr"}`}
                          </div>
                        </div>
                        <Badge variant="outline" className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30">
                          <TrendingDown className="h-3 w-3 mr-1" />
                          {compAvg.toFixed(2)}
                        </Badge>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-rose-600" /> Sizin için riskler
                  </CardTitle>
                  <p className="text-xs text-muted-foreground">
                    Sizde tekrarlayan şikayet, rakiplerinizde yok — acil aksiyon alın.
                  </p>
                </CardHeader>
                <CardContent className="space-y-2">
                  {risks.length === 0 ? (
                    <p className="text-xs text-muted-foreground">Belirgin risk yok.</p>
                  ) : (
                    risks.map(({ topic, ownAvg, ownCount, compAvg }) => (
                      <div key={topic.id} className="flex items-center justify-between gap-2 text-sm py-1.5 border-b last:border-b-0">
                        <div className="min-w-0">
                          <div className="font-medium truncate">{topicName(topic)}</div>
                          <div className="text-xs text-muted-foreground">
                            {ownCount} negatif yorumunuz
                            {compAvg != null && ` · rakipte ${compAvg > 0 ? "pozitif" : "nötr"}`}
                          </div>
                        </div>
                        <Badge variant="outline" className="bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/30">
                          <TrendingDown className="h-3 w-3 mr-1" />
                          {ownAvg.toFixed(2)}
                        </Badge>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Konu sentiment matrisi</CardTitle>
                <p className="text-xs text-muted-foreground">
                  Yeşil pozitif, kırmızı negatif. Hover ile yorum sayısı.
                </p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {heatmap.map(({ t, s }) => {
                    const ownAvg = s && s.ownCount > 0 ? s.ownSum / s.ownCount : 0;
                    const compAvg = s && s.compCount > 0 ? s.compSum / s.compCount : 0;
                    return (
                      <div key={t.id} className="flex items-center gap-2 text-sm">
                        <div className="flex-1 truncate font-medium">{topicName(t)}</div>
                        <UITooltip>
                          <TooltipTrigger asChild>
                            <div className={`h-8 w-16 rounded text-xs font-medium flex items-center justify-center ${sentimentColor(ownAvg, s?.ownCount ?? 0)}`}>
                              {s?.ownCount ? ownAvg.toFixed(2) : "—"}
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>Sizde: {s?.ownCount ?? 0} yorum</TooltipContent>
                        </UITooltip>
                        <UITooltip>
                          <TooltipTrigger asChild>
                            <div className={`h-8 w-16 rounded text-xs font-medium flex items-center justify-center ${sentimentColor(compAvg, s?.compCount ?? 0)}`}>
                              {s?.compCount ? compAvg.toFixed(2) : "—"}
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>Rakipte: {s?.compCount ?? 0} yorum</TooltipContent>
                        </UITooltip>
                      </div>
                    );
                  })}
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground mt-4 pt-3 border-t">
                  <span>Sol: <span className="font-medium text-foreground">Siz</span></span>
                  <span>·</span>
                  <span>Sağ: <span className="font-medium text-foreground">Rakip ortalaması</span></span>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </TooltipProvider>
  );
}