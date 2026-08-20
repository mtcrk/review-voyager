/**
 * Side-by-side guest excerpt columns.
 * Shared by the competitor comparison (biz vs rakip) and the period analysis
 * (kıyas dönem vs bu dönem) so both surfaces read identically.
 */
import { sentimentToIndex100 } from "@/lib/topicDepartments";

export type EvidenceQuote = {
  excerpt: string;
  sentiment: number;
  /** Optional prefix line: competitor name, date, etc. */
  meta?: string | null;
};

const MAX_LEN = 200;

function QuoteList({ title, quotes, keyPrefix }: { title: string; quotes: EvidenceQuote[]; keyPrefix: string }) {
  return (
    <div className="space-y-1.5">
      <div className="text-xs font-medium">{title}</div>
      {quotes.map((q, i) => (
        <div key={`${keyPrefix}-${i}`} className="rounded-md border bg-background px-2.5 py-2">
          <p className="text-xs leading-relaxed">“{q.excerpt.slice(0, MAX_LEN)}”</p>
          <div className="text-[10px] text-muted-foreground mt-1 tabular-nums">
            {q.meta ? `${q.meta} · ` : ""}
            {sentimentToIndex100(q.sentiment).toFixed(0)}/100
          </div>
        </div>
      ))}
    </div>
  );
}

export function QuoteColumns({
  leftTitle,
  rightTitle,
  left,
  right,
}: {
  leftTitle: string;
  rightTitle: string;
  left: EvidenceQuote[];
  right: EvidenceQuote[];
}) {
  if (left.length === 0 && right.length === 0) return null;
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {left.length > 0 && <QuoteList title={leftTitle} quotes={left} keyPrefix="left" />}
      {right.length > 0 && <QuoteList title={rightTitle} quotes={right} keyPrefix="right" />}
    </div>
  );
}
