import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { REVIEW_CATEGORIES, countCategories } from "@/lib/reviewCategories";
import type { ReviewAnalysisRow, ReviewTopicRow } from "@/hooks/useReviewAnalysis";

export type ChipSelection = { type: "topic" | "category"; key: string } | null;

interface ReviewAnalysisChipsProps {
  reviews: Array<{ id: string; text?: string | null; summary?: string | null }>;
  analysisByReview: Map<string, ReviewAnalysisRow>;
  topicsByReview: Map<string, ReviewTopicRow[]>;
  topicLabels: Record<string, string>;
  selected: ChipSelection;
  onSelect: (sel: ChipSelection) => void;
  className?: string;
}

export function ReviewAnalysisChips({
  reviews,
  analysisByReview,
  topicsByReview,
  topicLabels,
  selected,
  onSelect,
  className,
}: ReviewAnalysisChipsProps) {
  const { t } = useTranslation();

  const topicChips = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const r of reviews) {
      const rows = topicsByReview.get(r.id);
      if (!rows) continue;
      const seen = new Set<string>();
      for (const row of rows) {
        if (seen.has(row.topic_id)) continue;
        seen.add(row.topic_id);
        counts[row.topic_id] = (counts[row.topic_id] || 0) + 1;
      }
    }
    return Object.entries(counts)
      .map(([id, count]) => ({ id, count, label: topicLabels[id] || id }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 14);
  }, [reviews, topicsByReview, topicLabels]);

  // Fallback: keyword categories, computed only over reviews without an analysis row,
  // so nothing looks empty while the backfill drains.
  const fallbackChips = useMemo(() => {
    const unanalysed = reviews.filter((r) => !analysisByReview.has(r.id));
    if (unanalysed.length === 0) return [];
    const counts = countCategories(unanalysed);
    return REVIEW_CATEGORIES.map((c) => ({ ...c, count: counts[c.key] || 0 }))
      .filter((c) => c.count > 0)
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);
  }, [reviews, analysisByReview]);

  if (topicChips.length === 0 && fallbackChips.length === 0) return null;

  const base =
    "px-3 py-1.5 rounded-full text-sm font-medium border transition-all inline-flex items-center gap-1.5";
  const activeCls = "bg-primary/10 text-primary border-primary/30";
  const idleCls = "bg-background text-foreground border-border hover:bg-muted";

  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      <button
        type="button"
        onClick={() => onSelect(null)}
        className={cn(base, selected === null ? activeCls : idleCls)}
      >
        {t("analysis.chips.all")} ({reviews.length})
      </button>

      {topicChips.map((c) => {
        const isActive = selected?.type === "topic" && selected.key === c.id;
        return (
          <button
            key={`topic-${c.id}`}
            type="button"
            onClick={() => onSelect(isActive ? null : { type: "topic", key: c.id })}
            className={cn(base, isActive ? activeCls : idleCls)}
          >
            <span>{c.label}</span>
            <span className={cn("text-xs", isActive ? "text-primary/70" : "text-muted-foreground")}>
              ({c.count})
            </span>
          </button>
        );
      })}

      {fallbackChips.map((c) => {
        const isActive = selected?.type === "category" && selected.key === c.key;
        return (
          <button
            key={`cat-${c.key}`}
            type="button"
            onClick={() => onSelect(isActive ? null : { type: "category", key: c.key })}
            className={cn(base, "border-dashed", isActive ? activeCls : idleCls)}
            title={t("analysis.chips.fallbackHint")}
          >
            <span>{c.emoji}</span>
            <span>{c.label}</span>
            <span className={cn("text-xs", isActive ? "text-primary/70" : "text-muted-foreground")}>
              ({c.count})
            </span>
          </button>
        );
      })}
    </div>
  );
}

export default ReviewAnalysisChips;