import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, LifeBuoy, RefreshCw, Undo2, ShieldAlert } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
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
}: ReviewAnalysisPanelProps) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { data, isLoading } = useSingleReviewAnalysis(reviewId);
  const { topicsById, labels, labelOf } = useCiTopics();

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
      const da = topicsById[a.topic_id]?.is_decision_driver ? 1 : 0;
      const db = topicsById[b.topic_id]?.is_decision_driver ? 1 : 0;
      if (da !== db) return db - da;
      return Math.abs(b.sentiment) - Math.abs(a.sentiment);
    });
  }, [data?.topics, topicsById]);

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
          <HighlightedReviewText text={text} highlights={highlights} topicLabels={labels} />
          {highlights.length > 0 && (
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
            <div className="flex flex-wrap gap-2">
              {chips.map((c) => (
                <Badge
                  key={`${c.topic_id}`}
                  variant="outline"
                  className={cn("font-medium", toneChip(sentimentTone(Number(c.sentiment ?? 0))))}
                >
                  {labelOf(c.topic_id)}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Keywords */}
        {keywords.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold mb-2">{t("analysis.keywords")}</h4>
            <div className="flex flex-wrap gap-1.5">
              {keywords.map((k, i) => (
                <span
                  key={`${k.term}-${i}`}
                  className={cn(
                    "text-xs rounded-full border px-2 py-0.5",
                    toneChip(
                      k.polarity === "positive"
                        ? "positive"
                        : k.polarity === "negative"
                          ? "negative"
                          : "neutral",
                    ),
                  )}
                >
                  {k.term}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return <div className={cn("space-y-4", className)}>{body()}</div>;
}

export default ReviewAnalysisPanel;