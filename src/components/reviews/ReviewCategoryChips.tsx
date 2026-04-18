import { useMemo } from "react";
import { REVIEW_CATEGORIES, countCategories } from "@/lib/reviewCategories";
import { cn } from "@/lib/utils";

interface ReviewCategoryChipsProps {
  reviews: Array<{ text?: string | null; summary?: string | null }>;
  selectedCategory: string | null;
  onSelectCategory: (category: string | null) => void;
  className?: string;
}

export function ReviewCategoryChips({
  reviews,
  selectedCategory,
  onSelectCategory,
  className,
}: ReviewCategoryChipsProps) {
  const counts = useMemo(() => countCategories(reviews), [reviews]);

  // Only show categories with at least 1 match, sorted by count desc
  const visibleCategories = useMemo(
    () =>
      REVIEW_CATEGORIES
        .map((c) => ({ ...c, count: counts[c.key] || 0 }))
        .filter((c) => c.count > 0)
        .sort((a, b) => b.count - a.count),
    [counts]
  );

  if (visibleCategories.length === 0) return null;

  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      <button
        type="button"
        onClick={() => onSelectCategory(null)}
        className={cn(
          "px-3 py-1.5 rounded-full text-sm font-medium border transition-all",
          selectedCategory === null
            ? "bg-primary/10 text-primary border-primary/30"
            : "bg-background text-foreground border-border hover:bg-muted"
        )}
      >
        Tümü ({reviews.length})
      </button>
      {visibleCategories.map((cat) => {
        const isActive = selectedCategory === cat.key;
        return (
          <button
            key={cat.key}
            type="button"
            onClick={() => onSelectCategory(isActive ? null : cat.key)}
            className={cn(
              "px-3 py-1.5 rounded-full text-sm font-medium border transition-all inline-flex items-center gap-1.5",
              isActive
                ? "bg-primary/10 text-primary border-primary/30"
                : "bg-background text-foreground border-border hover:bg-muted"
            )}
          >
            <span>{cat.emoji}</span>
            <span>{cat.label}</span>
            <span className={cn("text-xs", isActive ? "text-primary/70" : "text-muted-foreground")}>
              ({cat.count})
            </span>
          </button>
        );
      })}
    </div>
  );
}
