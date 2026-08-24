import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { findMatches, sentenceRanges, type TextMatch } from "@/lib/textMatch";

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
  /** Analiz sayfasından gelinen konu — o konuya ait parçalar öne çıkarılır. */
  focusTopicId?: string | null;
  className?: string;
  /** Aktif rozetin metinde aranacak parçaları (excerpt / anahtar kelime). */
  activeTerms?: string[];
  /** Aktif eşleşmenin sırası (0 tabanlı). */
  activeMatchIndex?: number;
  /** Bulunan eşleşme sayısı üst bileşene bildirilir. */
  onMatchesFound?: (count: number) => void;
  /** Aktif eşleşmenin rengi. */
  activeTone?: "positive" | "negative" | "neutral";
  /** Yalnızca eşleşmeyi içeren cümleleri göster. */
  sentencesOnly?: boolean;
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

const activeClass = (tone: "positive" | "negative" | "neutral") => {
  if (tone === "positive") return "bg-success/30 ring-1 ring-success/60";
  if (tone === "negative") return "bg-destructive/30 ring-1 ring-destructive/60";
  return "bg-primary/20 ring-1 ring-primary/50";
};

function MarkedSpan({
  children,
  span,
  label,
  focused,
}: {
  children: string;
  span: ResolvedSpan;
  label?: string;
  focused?: boolean;
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
        focused && "font-semibold ring-2 ring-primary ring-offset-1 decoration-solid",
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

/** Aktif eşleşmelerle çakışmayan temel vurgular korunur. */
function overlaps(a: TextMatch, b: TextMatch) {
  return a.start < b.end && b.start < a.end;
}

function mergeRanges(ranges: TextMatch[]): TextMatch[] {
  const sorted = [...ranges].sort((a, b) => a.start - b.start);
  const out: TextMatch[] = [];
  for (const r of sorted) {
    const last = out[out.length - 1];
    if (last && r.start <= last.end) last.end = Math.max(last.end, r.end);
    else out.push({ ...r });
  }
  return out;
}

export function HighlightedReviewText({
  text,
  highlights,
  topicLabels = {},
  focusTopicId,
  className,
  activeTerms,
  activeMatchIndex = 0,
  onMatchesFound,
  activeTone = "neutral",
  sentencesOnly = false,
}: HighlightedReviewTextProps) {
  const src = text ?? "";
  const containerRef = useRef<HTMLParagraphElement>(null);

  const spans = useMemo(() => resolveSpans(src, highlights ?? []), [src, highlights]);

  const termsKey = (activeTerms ?? []).join("␟");
  const matches = useMemo(
    () => (activeTerms && activeTerms.length ? findMatches(src, activeTerms) : []),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [src, termsKey],
  );

  useEffect(() => {
    onMatchesFound?.(matches.length);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [matches.length, termsKey]);

  /** Görünür aralıklar — "sadece ilgili cümleler" modu. */
  const visible = useMemo<TextMatch[]>(() => {
    if (!sentencesOnly || matches.length === 0) return [{ start: 0, end: src.length }];
    const sentences = sentenceRanges(src);
    const keep = sentences.filter((s) => matches.some((m) => overlaps(s, m)));
    return keep.length ? mergeRanges(keep) : [{ start: 0, end: src.length }];
  }, [sentencesOnly, matches, src]);

  const nodes = useMemo(() => {
    const dim = matches.length > 0;
    // Aktif eşleşmeler öncelikli; çakışan temel vurgular gizlenir.
    type Piece = { start: number; end: number; base?: ResolvedSpan; activeIdx?: number };
    const pieces: Piece[] = [
      ...matches.map((m, i) => ({ start: m.start, end: m.end, activeIdx: i })),
      ...spans
        .filter((s) => !matches.some((m) => overlaps(s, m)))
        .map((s) => ({ start: s.start, end: s.end, base: s })),
    ].sort((a, b) => a.start - b.start);

    const out: React.ReactNode[] = [];

    visible.forEach((range, ri) => {
      if (ri > 0) {
        out.push(
          <span key={`gap-${ri}`} className="mx-1 select-none text-muted-foreground">
            …
          </span>,
        );
      }
      let cursor = range.start;
      for (const p of pieces) {
        if (p.end <= range.start || p.start >= range.end) continue;
        const s = Math.max(p.start, range.start);
        const e = Math.min(p.end, range.end);
        if (s > cursor) {
          out.push(
            <span key={`t-${ri}-${cursor}`} className={dim ? "opacity-40" : undefined}>
              {src.slice(cursor, s)}
            </span>,
          );
        }
        if (p.activeIdx != null) {
          out.push(
            <mark
              key={`a-${ri}-${s}`}
              data-active-idx={p.activeIdx}
              className={cn(
                "rounded-sm px-0.5 py-px font-semibold text-foreground transition-colors",
                activeClass(activeTone),
              )}
            >
              {src.slice(s, e)}
            </mark>,
          );
        } else if (p.base) {
          out.push(
            <span key={`b-${ri}-${s}`} className={dim ? "opacity-40" : undefined}>
              <MarkedSpan
                span={p.base}
                label={p.base.topic_id ? topicLabels[p.base.topic_id] : undefined}
                focused={!dim && !!focusTopicId && p.base.topic_id === focusTopicId}
              >
                {src.slice(s, e)}
              </MarkedSpan>
            </span>,
          );
        }
        cursor = e;
      }
      if (cursor < range.end) {
        out.push(
          <span key={`t-end-${ri}`} className={dim ? "opacity-40" : undefined}>
            {src.slice(cursor, range.end)}
          </span>,
        );
      }
    });

    return out;
  }, [spans, matches, visible, src, topicLabels, focusTopicId, activeTone]);

  /** Aktif eşleşmeye yumuşak kaydırma + 1 sn vurgu parlaması. */
  useEffect(() => {
    if (matches.length === 0) return;
    const idx = Math.min(Math.max(activeMatchIndex, 0), matches.length - 1);
    const el = containerRef.current?.querySelector<HTMLElement>(`[data-active-idx="${idx}"]`);
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "center" });
    el.classList.add("hl-flash");
    const timer = window.setTimeout(() => el.classList.remove("hl-flash"), 1000);
    return () => window.clearTimeout(timer);
  }, [activeMatchIndex, matches.length, termsKey, sentencesOnly]);

  return (
    <p
      ref={containerRef}
      className={cn("text-sm leading-relaxed text-foreground whitespace-pre-wrap", className)}
    >
      {nodes}
    </p>
  );
}

export default HighlightedReviewText;
