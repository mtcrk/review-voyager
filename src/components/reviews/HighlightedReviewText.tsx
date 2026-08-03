import { Fragment, useMemo, useState } from "react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export type ReviewHighlight = {
  quote: string;
  start: number;
  end: number;
  polarity: "positive" | "negative" | "neutral" | string;
  topic_id: string | null;
  reason: string | null;
};

interface HighlightedReviewTextProps {
  text: string;
  highlights: ReviewHighlight[];
  /** topic_id -> localized display name */
  topicLabels?: Record<string, string>;
  className?: string;
}

type ResolvedSpan = ReviewHighlight & { start: number; end: number };

/**
 * Offsets come from the backend, produced with JS `indexOf` — i.e. UTF-16 code units.
 * We therefore slice the string DIRECTLY (`text.slice`). Never convert the text to an
 * array of code points (no Array.from / spread / per-character map): that would shift
 * every offset that sits after an emoji or other surrogate pair.
 */
function resolveSpans(text: string, highlights: ReviewHighlight[]): ResolvedSpan[] {
  const resolved: ResolvedSpan[] = [];

  for (const h of highlights ?? []) {
    if (!h || typeof h.quote !== "string" || h.quote.length === 0) continue;

    let start = Number(h.start);
    let end = Number(h.end);

    if (
      !Number.isFinite(start) ||
      !Number.isFinite(end) ||
      end <= start ||
      text.slice(start, end) !== h.quote
    ) {
      // Self-healing: stale offset -> re-resolve from the quote itself.
      const idx = text.indexOf(h.quote);
      if (idx === -1) continue; // still not found -> drop the highlight
      start = idx;
      end = idx + h.quote.length;
    }

    resolved.push({ ...h, start, end });
  }

  resolved.sort((a, b) => a.start - b.start || b.end - a.end);

  const out: ResolvedSpan[] = [];
  let cursor = 0;
  for (const s of resolved) {
    if (s.start < cursor) continue; // overlaps an already emitted span
    out.push(s);
    cursor = s.end;
  }
  return out;
}

const polarityClass = (polarity: string) => {
  if (polarity === "positive") return "bg-success/15 text-foreground decoration-success/60";
  if (polarity === "negative") return "bg-destructive/15 text-foreground decoration-destructive/60";
  return "bg-muted text-foreground decoration-muted-foreground/60";
};

function MarkedSpan({
  children,
  span,
  label,
}: {
  children: string;
  span: ResolvedSpan;
  label?: string;
}) {
  // Controlled so a tap (touch) opens the tooltip too, not just hover/focus.
  const [open, setOpen] = useState(false);
  const hasTip = !!(label || span.reason);

  const mark = (
    <mark
      onClick={() => setOpen((v) => !v)}
      className={cn(
        "rounded-sm px-0.5 py-px underline decoration-dotted underline-offset-2 cursor-help",
        polarityClass(String(span.polarity)),
      )}
    >
      {children}
    </mark>
  );

  if (!hasTip) return mark;

  return (
    <Tooltip open={open} onOpenChange={setOpen} delayDuration={150}>
      <TooltipTrigger asChild>{mark}</TooltipTrigger>
      <TooltipContent side="top" className="max-w-[260px] space-y-1">
        {label && <p className="text-xs font-semibold">{label}</p>}
        {span.reason && <p className="text-xs text-muted-foreground">{span.reason}</p>}
      </TooltipContent>
    </Tooltip>
  );
}

export function HighlightedReviewText({
  text,
  highlights,
  topicLabels = {},
  className,
}: HighlightedReviewTextProps) {
  const spans = useMemo(() => resolveSpans(text ?? "", highlights ?? []), [text, highlights]);

  const nodes = useMemo(() => {
    const src = text ?? "";
    const parts: React.ReactNode[] = [];
    let cursor = 0;

    spans.forEach((span, i) => {
      if (span.start > cursor) {
        parts.push(<Fragment key={`p-${i}`}>{src.slice(cursor, span.start)}</Fragment>);
      }
      parts.push(
        <MarkedSpan
          key={`m-${i}`}
          span={span}
          label={span.topic_id ? topicLabels[span.topic_id] : undefined}
        >
          {src.slice(span.start, span.end)}
        </MarkedSpan>,
      );
      cursor = span.end;
    });

    if (cursor < src.length) {
      parts.push(<Fragment key="p-last">{src.slice(cursor)}</Fragment>);
    }
    return parts;
  }, [spans, text, topicLabels]);

  return (
    <p className={cn("text-sm leading-relaxed text-foreground whitespace-pre-wrap", className)}>
      {nodes}
    </p>
  );
}

export default HighlightedReviewText;