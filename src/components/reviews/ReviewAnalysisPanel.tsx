import { Fragment, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useQueryClient } from "@tanstack/react-query";
import {
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  LifeBuoy,
  RefreshCw,
  Undo2,
  ShieldAlert,
  Sparkles,
  Loader2,
} from "lucide-react";
import { Badge, badgeVariants } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { countMatches } from "@/lib/textMatch";
import { HighlightedReviewText } from "@/components/reviews/HighlightedReviewText";
import {
  useCiTopics,
  useSingleReviewAnalysis,
  sentimentTone,
  type AnalysisKeyword,
} from "@/hooks/useReviewAnalysis";

interface ReviewAnalysisPanelProps {
  reviewId: string;
  text: string;
  analysisStatus?: string | null;
  className?: string;
  /** Analiz sayfalarından "Yoruma git" ile gelindiğinde vurgulanacak konu. */
  focusTopicId?: string | null;
}

const toneChip = (tone: "positive" | "negative" | "neutral") =>
  tone === "positive"
    ? "bg-success/10 text-success border-success/30"
    : tone === "negative"
      ? "bg-destructive/10 text-destructive border-destructive/30"
      : "bg-muted text-muted-foreground border-border";

export function ReviewAnalysisPanel({
  reviewId,
  text,
  analysisStatus,
  className,
  focusTopicId,
}: ReviewAnalysisPanelProps) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { data, isLoading } = useSingleReviewAnalysis(reviewId);
  const { topicsById, labels, labelOf } = useCiTopics();
  const [running, setRunning] = useState(false);

  // Konu vurgusu varsa analiz bölümünü görünür alana getir.
  useEffect(() => {
    if (!focusTopicId || isLoading) return;
    const el = document.getElementById("review-analysis");
    el?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [focusTopicId, isLoading]);

  const analysis = data?.analysis ?? null;
  const highlights = useMemo(
    () => (Array.isArray(analysis?.highlights) ? (analysis!.highlights as any[]) : []),
    [analysis],
  );
  const keywords = useMemo(
    () => (Array.isArray(analysis?.keywords) ? (analysis!.keywords as AnalysisKeyword[]) : []),
    [analysis],
  );
  const flags = (analysis?.flags ?? {}) as Record<string, any>;
  const staffNamed: string[] = Array.isArray(flags.staff_named) ? flags.staff_named : [];

  const chips = useMemo(() => {
    const rows = data?.topics ?? [];
    return [...rows].sort((a, b) => {
      // Vurgulanan konu her zaman başta.
      if (focusTopicId) {
        if (a.topic_id === focusTopicId) return -1;
        if (b.topic_id === focusTopicId) return 1;
      }
      const da = topicsById[a.topic_id]?.is_decision_driver ? 1 : 0;
      const db = topicsById[b.topic_id]?.is_decision_driver ? 1 : 0;
      if (da !== db) return db - da;
      return Math.abs(b.sentiment) - Math.abs(a.sentiment);
    });
  }, [data?.topics, topicsById, focusTopicId]);

  // ---- Tıklanabilir rozetler: metinde konum bulma ----
  const [active, setActive] = useState<{ kind: "topic" | "keyword"; key: string } | null>(null);
  const [matchIndex, setMatchIndex] = useState(0);
  const [sentencesOnly, setSentencesOnly] = useState(false);

  /** Bir konu rozetinin metinde aranacak parçaları: excerpt + o konunun vurguları. */
  const termsForTopic = useMemo(
    () => (topicId: string) => {
      const row = (data?.topics ?? []).find((r) => r.topic_id === topicId);
      const fromHighlights = highlights
        .filter((h) => h?.topic_id === topicId && typeof h?.quote === "string")
        .map((h) => h.quote as string);
      return [row?.excerpt ?? "", ...fromHighlights].filter(Boolean) as string[];
    },
    [data?.topics, highlights],
  );

  const topicMatchCounts = useMemo(() => {
    const map: Record<string, number> = {};
    for (const c of chips) map[c.topic_id] = countMatches(text, termsForTopic(c.topic_id));
    return map;
  }, [chips, text, termsForTopic]);

  const keywordMatchCounts = useMemo(() => {
    const map: Record<string, number> = {};
    for (const k of keywords) map[k.term] = countMatches(text, [k.term]);
    return map;
  }, [keywords, text]);

  const activeTerms = useMemo(() => {
    if (!active) return undefined;
    return active.kind === "topic" ? termsForTopic(active.key) : [active.key];
  }, [active, termsForTopic]);

  const activeCount = active
    ? active.kind === "topic"
      ? topicMatchCounts[active.key] ?? 0
      : keywordMatchCounts[active.key] ?? 0
    : 0;

  const activeTone: "positive" | "negative" | "neutral" = useMemo(() => {
    if (!active) return "neutral";
    if (active.kind === "topic") {
      const row = (data?.topics ?? []).find((r) => r.topic_id === active.key);
      return sentimentTone(Number(row?.sentiment ?? 0));
    }
    const k = keywords.find((x) => x.term === active.key);
    return k?.polarity === "positive" ? "positive" : k?.polarity === "negative" ? "negative" : "neutral";
  }, [active, data?.topics, keywords]);

  const toggleActive = (kind: "topic" | "keyword", key: string) => {
    setMatchIndex(0);
    setSentencesOnly(false);
    setActive((prev) => (prev && prev.kind === kind && prev.key === key ? null : { kind, key }));
  };

  const step = (delta: number) => {
    if (activeCount === 0) return;
    setMatchIndex((i) => (i + delta + activeCount) % activeCount);
  };

  const navControls = (
    <span className="inline-flex items-center gap-1 rounded-full border border-primary/30 bg-primary/5 px-1.5 py-0.5 text-xs">
      {activeCount > 1 && (
        <>
          <button
            type="button"
            aria-label="Önceki eşleşme"
            onClick={() => step(-1)}
            className="rounded p-0.5 hover:bg-primary/10"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </button>
          <span className="tabular-nums font-medium">
            {matchIndex + 1}/{activeCount}
          </span>
          <button
            type="button"
            aria-label="Sonraki eşleşme"
            onClick={() => step(1)}
            className="rounded p-0.5 hover:bg-primary/10"
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </>
      )}
      <button
        type="button"
        onClick={() => setSentencesOnly((v) => !v)}
        className={cn(
          "ml-0.5 rounded-full px-2 py-0.5 text-[11px] font-medium transition-colors",
          sentencesOnly ? "bg-primary text-primary-foreground" : "hover:bg-primary/10",
        )}
      >
        Sadece ilgili cümleler
      </button>
    </span>
  );

  const handleRetry = async () => {
    const { error } = await supabase
      .from("reviews")
      .update({ analysis_status: "pending", analysis_attempts: 0, analysis_error: null })
      .eq("id", reviewId);
    if (error) {
      toast.error(t("analysis.retryError"));
      return;
    }
    toast.success(t("analysis.retryQueued"));
    queryClient.invalidateQueries({ queryKey: ["review", reviewId] });
  };

  /** On-demand analysis for reviews outside the 6-month backfill window. */
  const handleAnalyzeNow = async () => {
    if (running) return;
    setRunning(true);
    try {
      const { data: res, error } = await supabase.functions.invoke("analyze-review", {
        body: { review_id: reviewId },
      });
      if (error || (res as any)?.error) throw error ?? new Error((res as any).error);
      toast.success(t("analysis.analyzeDone"));
      await queryClient.invalidateQueries({ queryKey: ["review_analysis_single", reviewId] });
      await queryClient.invalidateQueries({ queryKey: ["review", reviewId] });
      await queryClient.invalidateQueries({ queryKey: ["reviews"] });
    } catch {
      toast.error(t("analysis.analyzeError"));
    } finally {
      setRunning(false);
    }
  };

  const body = () => {
    if (isLoading) {
      return (
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-4/5" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      );
    }

    if (analysisStatus === "skipped" && !analysis) {
      return <p className="text-sm text-muted-foreground">{t("analysis.skipped")}</p>;
    }

    if (!analysis) {
      if (analysisStatus === "deferred") {
        return (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">{t("analysis.deferred")}</p>
            <p className="text-xs text-muted-foreground">{t("analysis.deferredHint")}</p>
            <Button size="sm" onClick={handleAnalyzeNow} disabled={running} className="gap-1.5">
              {running ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Sparkles className="h-3.5 w-3.5" />
              )}
              {running ? t("analysis.analyzing") : t("analysis.analyzeNow")}
            </Button>
          </div>
        );
      }
      if (analysisStatus === "failed") {
        return (
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground">{t("analysis.failed")}</p>
            <Button variant="ghost" size="sm" onClick={handleRetry} className="gap-1.5">
              <RefreshCw className="h-3.5 w-3.5" />
              {t("analysis.retry")}
            </Button>
          </div>
        );
      }
      return (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">{t("analysis.pending")}</p>
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
          <p className="text-xs text-muted-foreground">{t("analysis.pendingHint")}</p>
        </div>
      );
    }

    const score = Number(analysis.overall_sentiment ?? 0);
    const tone = sentimentTone(score);
    const label =
      analysis.sentiment_label === "mixed"
        ? t("analysis.labels.mixed")
        : t(`analysis.labels.${tone}`);

    return (
      <div className="space-y-5">
        {/* Highlighted text */}
        <div className="space-y-1.5">
          <HighlightedReviewText
            text={text}
            highlights={highlights}
            topicLabels={labels}
            focusTopicId={focusTopicId}
            activeTerms={activeTerms}
            activeMatchIndex={matchIndex}
            activeTone={activeTone}
            sentencesOnly={sentencesOnly}
          />
          {active && sentencesOnly && (
            <p className="text-xs text-muted-foreground">
              Yalnızca eşleşen cümleler gösteriliyor. Tümünü görmek için geçişi kapat.
            </p>
          )}
          {highlights.length > 0 && !active && (
            <p className="text-xs text-muted-foreground">{t("analysis.highlightsHint")}</p>
          )}
        </div>

        {/* Flags */}
        {(flags.legal_risk ||
          flags.recovery_needed ||
          flags.refund_request ||
          flags.is_fake_suspect) && (
          <div className="flex flex-wrap items-center gap-2">
            {flags.legal_risk && (
              <Badge className="gap-1.5 bg-destructive text-destructive-foreground border-transparent text-sm px-3 py-1">
                <ShieldAlert className="h-4 w-4" />
                {t("analysis.flags.legal_risk")}
              </Badge>
            )}
            {flags.recovery_needed && (
              <Badge variant="outline" className="gap-1.5 border-warning/40 bg-warning/10 text-warning">
                <LifeBuoy className="h-3.5 w-3.5" />
                {t("analysis.flags.recovery_needed")}
              </Badge>
            )}
            {flags.refund_request && (
              <Badge variant="outline" className="gap-1.5">
                <Undo2 className="h-3.5 w-3.5" />
                {t("analysis.flags.refund_request")}
              </Badge>
            )}
            {flags.is_fake_suspect && (
              <Badge variant="outline" className="gap-1.5 text-muted-foreground">
                <AlertTriangle className="h-3.5 w-3.5" />
                {t("analysis.flags.is_fake_suspect")}
              </Badge>
            )}
          </div>
        )}

        {staffNamed.length > 0 && (
          <p className="text-xs text-muted-foreground">
            <span className="font-medium text-foreground">{t("analysis.staffNamed")}:</span>{" "}
            {staffNamed.join(", ")}
          </p>
        )}

        {/* Sentiment */}
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">{t("analysis.sentiment")}</span>
          <Badge variant="outline" className={cn("gap-1.5", toneChip(tone))}>
            {label}
            <span className="opacity-70">{score > 0 ? `+${score.toFixed(2)}` : score.toFixed(2)}</span>
          </Badge>
          <div className="hidden sm:block h-1.5 flex-1 rounded-full bg-muted overflow-hidden">
            <div
              className={cn(
                "h-full rounded-full",
                tone === "positive" ? "bg-success" : tone === "negative" ? "bg-destructive" : "bg-muted-foreground/40",
              )}
              style={{ width: `${Math.max(6, Math.abs(score) * 100)}%` }}
            />
          </div>
        </div>

        {/* Summary */}
        {analysis.summary && (
          <div>
            <h4 className="text-sm font-semibold mb-1">{t("analysis.summary")}</h4>
            <p className="text-sm text-muted-foreground leading-relaxed">{analysis.summary}</p>
          </div>
        )}

        {/* Topics */}
        {chips.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold mb-2">{t("analysis.topics")}</h4>
            <div className="flex flex-wrap items-center gap-2">
              {chips.map((c) => {
                const count = topicMatchCounts[c.topic_id] ?? 0;
                const isActive = active?.kind === "topic" && active.key === c.topic_id;
                return (
                  <Fragment key={c.topic_id}>
                    <button
                      type="button"
                      disabled={count === 0}
                      onClick={() => toggleActive("topic", c.topic_id)}
                      title={count === 0 ? "Bu konu metinde bulunamadı" : "Metinde göster"}
                      className={cn(
                        badgeVariants({ variant: "outline" }),
                        "font-medium",
                        toneChip(sentimentTone(Number(c.sentiment ?? 0))),
                        count === 0 ? "opacity-50 cursor-default" : "cursor-pointer",
                        isActive && "border-primary ring-2 ring-primary ring-offset-1 font-bold",
                        !isActive &&
                          c.topic_id === focusTopicId &&
                          "font-bold border-primary ring-2 ring-primary ring-offset-1",
                      )}
                    >
                      {labelOf(c.topic_id)}
                    </button>
                    {isActive && navControls}
                  </Fragment>
                );
              })}
            </div>
          </div>
        )}

        {/* Keywords */}
        {keywords.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold mb-2">{t("analysis.keywords")}</h4>
            <div className="flex flex-wrap items-center gap-1.5">
              {keywords.map((k, i) => {
                const count = keywordMatchCounts[k.term] ?? 0;
                const isActive = active?.kind === "keyword" && active.key === k.term;
                return (
                  <Fragment key={`${k.term}-${i}`}>
                    <button
                      type="button"
                      disabled={count === 0}
                      onClick={() => toggleActive("keyword", k.term)}
                      title={count === 0 ? "Bu kelime metinde bulunamadı" : "Metinde göster"}
                      className={cn(
                        "text-xs rounded-full border px-2 py-0.5",
                        toneChip(
                          k.polarity === "positive"
                            ? "positive"
                            : k.polarity === "negative"
                              ? "negative"
                              : "neutral",
                        ),
                        count === 0 ? "opacity-50 cursor-default" : "cursor-pointer",
                        isActive && "border-primary ring-2 ring-primary ring-offset-1 font-semibold",
                      )}
                    >
                      {k.term}
                    </button>
                    {isActive && navControls}
                  </Fragment>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  };

  return <div className={cn("space-y-4", className)}>{body()}</div>;
}

export default ReviewAnalysisPanel;