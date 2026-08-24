import { Fragment, useMemo, useState } from "react";
import { ChevronDown, ChevronRight, Loader2, TrendingDown, TrendingUp, Info } from "lucide-react";
import { format } from "date-fns";
import { tr as trLocale } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { DEPARTMENTS, DEPARTMENT_LABELS, departmentOf, type DepartmentKey } from "@/lib/topicDepartments";
import {
  useGroupTopicMatrix,
  useGroupTopicQuotes,
  useTopicLabels,
  type GroupTopicCell,
} from "@/hooks/useBusinessGroup";
import HighlightedReviewText from "@/components/reviews/HighlightedReviewText";

/** Bir hücrede değer gösterebilmek için gerekli minimum bahis sayısı. */
const MIN_CELL_MENTIONS = 10;
/** Grup ortalamasından "belirgin" sapma eşiği (yüzde puan). */
const DEV_STRONG = 12;
const DEV_MILD = 5;

type CellKey = string;
const key = (bizId: string, topicId: string): CellKey => `${bizId}::${topicId}`;

interface Props {
  groupId: string;
  from: Date;
  to: Date;
}

export function GroupTopicMatrix({ groupId, from, to }: Props) {
  const { data: cells = [], isLoading } = useGroupTopicMatrix(groupId, from, to);
  const { data: topicLabels = {} } = useTopicLabels();

  const [open, setOpen] = useState<Set<DepartmentKey>>(new Set(["food", "room"]));
  const [selected, setSelected] = useState<{ businessId: string; businessName: string; topicId: string } | null>(null);

  const model = useMemo(() => {
    const businessMap = new Map<string, string>();
    const cellMap = new Map<CellKey, GroupTopicCell>();
    const topicTotals = new Map<string, { total: number; pos: number }>();

    for (const c of cells) {
      businessMap.set(c.business_id, c.business_name);
      cellMap.set(key(c.business_id, c.topic_id), c);
      const t = topicTotals.get(c.topic_id) ?? { total: 0, pos: 0 };
      t.total += c.total_mentions;
      t.pos += c.positive_mentions;
      topicTotals.set(c.topic_id, t);
    }

    const businesses = Array.from(businessMap.entries())
      .map(([id, name]) => ({ id, name }))
      .sort((a, b) => a.name.localeCompare(b.name, "tr"));

    const groupRate = new Map<string, number>();
    topicTotals.forEach((v, topicId) => {
      if (v.total > 0) groupRate.set(topicId, (v.pos / v.total) * 100);
    });

    // Departman -> konular (grup genelinde en çok bahis alan konu önce)
    const byDept = new Map<DepartmentKey, string[]>();
    Array.from(topicTotals.keys())
      .sort((a, b) => (topicTotals.get(b)!.total ?? 0) - (topicTotals.get(a)!.total ?? 0))
      .forEach((topicId) => {
        const d = departmentOf(topicId);
        const arr = byDept.get(d) ?? [];
        arr.push(topicId);
        byDept.set(d, arr);
      });

    return { businesses, cellMap, topicTotals, groupRate, byDept };
  }, [cells]);

  /** Sayısal veriden üretilen özet — LLM yok. */
  const insights = useMemo(() => {
    const out: { tone: "bad" | "good" | "neutral"; text: string }[] = [];
    const label = (id: string) => topicLabels[id] ?? id;

    const ranked = Array.from(model.topicTotals.entries())
      .filter(([, v]) => v.total >= 3 * MIN_CELL_MENTIONS)
      .map(([id, v]) => ({ id, total: v.total, rate: (v.pos / v.total) * 100 }))
      .sort((a, b) => a.rate - b.rate);

    if (ranked.length > 0) {
      const w = ranked[0];
      out.push({
        tone: "bad",
        text: `Grup genelinde en zayıf konu: ${label(w.id)} — %${w.rate.toFixed(0)} pozitif (${w.total} bahis).`,
      });
      const s = ranked[ranked.length - 1];
      if (s.id !== w.id) {
        out.push({
          tone: "good",
          text: `En güçlü konu: ${label(s.id)} — %${s.rate.toFixed(0)} pozitif (${s.total} bahis).`,
        });
      }
    }

    const deviations: { text: string; abs: number; tone: "bad" | "good" }[] = [];
    model.cellMap.forEach((c) => {
      if (c.total_mentions < MIN_CELL_MENTIONS) return;
      const avg = model.groupRate.get(c.topic_id);
      if (avg == null) return;
      const rate = (c.positive_mentions / c.total_mentions) * 100;
      const diff = rate - avg;
      if (Math.abs(diff) < DEV_STRONG) return;
      deviations.push({
        abs: Math.abs(diff),
        tone: diff < 0 ? "bad" : "good",
        text: `${label(c.topic_id)}: ${c.business_name} grup ortalamasının ${Math.abs(diff).toFixed(0)} puan ${
          diff < 0 ? "altında" : "üstünde"
        } (%${rate.toFixed(0)} / %${avg.toFixed(0)}).`,
      });
    });
    deviations
      .sort((a, b) => b.abs - a.abs)
      .slice(0, 3)
      .forEach((d) => out.push({ tone: d.tone, text: d.text }));

    return out;
  }, [model, topicLabels]);

  const toggleDept = (d: DepartmentKey) =>
    setOpen((prev) => {
      const next = new Set(prev);
      next.has(d) ? next.delete(d) : next.add(d);
      return next;
    });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (model.businesses.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-sm text-muted-foreground">
          Seçili dönemde konu analizi verisi bulunamadı. Yorumlar analiz edildikçe bu tablo dolar.
        </CardContent>
      </Card>
    );
  }

  const departments = DEPARTMENTS.filter((d) => (model.byDept.get(d)?.length ?? 0) > 0);

  return (
    <div className="space-y-6">
      {insights.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Info className="h-4 w-4 text-primary" />
              Öne çıkanlar
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {insights.map((i, idx) => (
              <div key={idx} className="flex items-start gap-2 text-sm">
                {i.tone === "bad" ? (
                  <TrendingDown className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
                ) : (
                  <TrendingUp className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                )}
                <span>{i.text}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Konu ısı haritası</CardTitle>
          <p className="text-xs text-muted-foreground">
            Hücreler pozitif bahis oranını gösterir. Renk, grup ortalamasına göre sapmadır — yeşil ortalamanın üstü,
            kırmızı altı. {MIN_CELL_MENTIONS} bahisten az olan hücrelerde değer gösterilmez.
          </p>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/40">
                  <th className="sticky left-0 z-10 bg-muted/40 px-4 py-2 text-left font-medium min-w-[220px]">
                    Konu
                  </th>
                  <th className="px-2 py-2 text-center font-medium whitespace-nowrap">Grup ort.</th>
                  {model.businesses.map((b) => (
                    <th key={b.id} className="px-2 py-2 text-center font-medium min-w-[110px]">
                      <span className="line-clamp-2 text-xs">{b.name}</span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {departments.map((d) => {
                  const isOpen = open.has(d);
                  const topics = model.byDept.get(d) ?? [];
                  return (
                    <Fragment key={`dept-${d}`}>
                      <tr className="border-b bg-muted/20">
                        <td
                          className="sticky left-0 z-10 bg-muted/20 px-4 py-2 cursor-pointer"
                          onClick={() => toggleDept(d)}
                          colSpan={1}
                        >
                          <span className="inline-flex items-center gap-1.5 font-medium">
                            {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                            {DEPARTMENT_LABELS[d]}
                            <Badge variant="outline" className="ml-1 text-[10px] font-normal">
                              {topics.length}
                            </Badge>
                          </span>
                        </td>
                        <td colSpan={model.businesses.length + 1} />
                      </tr>
                      {isOpen &&
                        topics.map((topicId) => {
                          const avg = model.groupRate.get(topicId) ?? null;
                          const totals = model.topicTotals.get(topicId);
                          return (
                            <tr key={`${d}-${topicId}`} className="border-b hover:bg-muted/20">
                              <td className="sticky left-0 z-10 bg-background px-4 py-1.5 pl-10">
                                <span className="text-sm">{topicLabels[topicId] ?? topicId}</span>
                              </td>
                              <td className="px-2 py-1.5 text-center tabular-nums text-muted-foreground">
                                {avg != null ? `%${avg.toFixed(0)}` : "—"}
                                <span className="ml-1 text-[10px]">({totals?.total ?? 0})</span>
                              </td>
                              {model.businesses.map((b) => {
                                const c = model.cellMap.get(key(b.id, topicId));
                                return (
                                  <MatrixCell
                                    key={b.id}
                                    cell={c}
                                    groupAvg={avg}
                                    onClick={() =>
                                      c &&
                                      c.total_mentions > 0 &&
                                      setSelected({ businessId: b.id, businessName: b.name, topicId })
                                    }
                                  />
                                );
                              })}
                            </tr>
                          );
                        })}
                    </Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <QuotesSheet
        groupId={groupId}
        from={from}
        to={to}
        selection={selected}
        topicLabel={selected ? topicLabels[selected.topicId] ?? selected.topicId : ""}
        onClose={() => setSelected(null)}
      />
    </div>
  );
}

function cellTone(diff: number) {
  if (diff >= DEV_STRONG) return "bg-emerald-500/25 text-emerald-900 dark:text-emerald-200";
  if (diff >= DEV_MILD) return "bg-emerald-500/12";
  if (diff <= -DEV_STRONG) return "bg-destructive/25 text-destructive";
  if (diff <= -DEV_MILD) return "bg-destructive/12";
  return "bg-muted/40";
}

function MatrixCell({
  cell,
  groupAvg,
  onClick,
}: {
  cell?: GroupTopicCell;
  groupAvg: number | null;
  onClick: () => void;
}) {
  if (!cell || cell.total_mentions === 0) {
    return <td className="px-2 py-1.5 text-center text-xs text-muted-foreground">—</td>;
  }

  const insufficient = cell.total_mentions < MIN_CELL_MENTIONS;
  const rate = (cell.positive_mentions / cell.total_mentions) * 100;
  const diff = groupAvg != null ? rate - groupAvg : 0;

  return (
    <td className="p-1">
      <button
        onClick={onClick}
        className={cn(
          "w-full rounded-md px-2 py-1.5 text-center transition-colors hover:ring-2 hover:ring-primary/40",
          insufficient ? "bg-muted/30 text-muted-foreground" : cellTone(diff),
        )}
      >
        {insufficient ? (
          <span className="text-[10px]">yetersiz veri</span>
        ) : (
          <span className="font-medium tabular-nums">%{rate.toFixed(0)}</span>
        )}
        <span className="block text-[10px] text-muted-foreground tabular-nums">{cell.total_mentions} bahis</span>
      </button>
    </td>
  );
}

const PAGE_SIZE = 20;

function QuotesSheet({
  groupId,
  from,
  to,
  selection,
  topicLabel,
  onClose,
}: {
  groupId: string;
  from: Date;
  to: Date;
  selection: { businessId: string; businessName: string; topicId: string } | null;
  topicLabel: string;
  onClose: () => void;
}) {
  const [page, setPage] = useState(0);
  const { data: quotes = [], isLoading } = useGroupTopicQuotes(
    groupId,
    selection?.businessId,
    selection?.topicId,
    from,
    to,
    PAGE_SIZE,
    page * PAGE_SIZE,
  );

  const total = quotes[0]?.total_count ? Number(quotes[0].total_count) : 0;
  const positives = quotes.filter((q) => Number(q.sentiment) > 0.15);
  const negatives = quotes.filter((q) => Number(q.sentiment) < -0.15);

  return (
    <Sheet
      open={!!selection}
      onOpenChange={(o) => {
        if (!o) {
          setPage(0);
          onClose();
        }
      }}
    >
      <SheetContent side="right" className="w-full sm:max-w-xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="text-base">
            {topicLabel} · {selection?.businessName}
          </SheetTitle>
        </SheetHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
          </div>
        ) : quotes.length === 0 ? (
          <p className="py-10 text-center text-sm text-muted-foreground">Bu konuda misafir cümlesi bulunamadı.</p>
        ) : (
          <div className="mt-4 space-y-6">
            <p className="text-xs text-muted-foreground">
              {total} bahis · {page * PAGE_SIZE + 1}-{page * PAGE_SIZE + quotes.length} arası gösteriliyor
            </p>

            <QuoteGroup title="Olumlu" quotes={positives} topicId={selection!.topicId} topicLabel={topicLabel} />
            <QuoteGroup title="Olumsuz" quotes={negatives} topicId={selection!.topicId} topicLabel={topicLabel} />

            <div className="flex items-center justify-between border-t pt-3">
              <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage((p) => p - 1)}>
                Önceki
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={(page + 1) * PAGE_SIZE >= total}
                onClick={() => setPage((p) => p + 1)}
              >
                Sonraki
              </Button>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}

function QuoteGroup({
  title,
  quotes,
  topicId,
  topicLabel,
}: {
  title: string;
  quotes: { review_id: string; excerpt: string | null; posted_at: string; platform: string | null; review_text: string | null; highlights: any }[];
  topicId: string;
  topicLabel: string;
}) {
  if (quotes.length === 0) return null;
  return (
    <div className="space-y-3">
      <h4 className="text-sm font-semibold">
        {title} <span className="text-muted-foreground font-normal">({quotes.length})</span>
      </h4>
      {quotes.map((q) => {
        const text = q.review_text || q.excerpt || "";
        const highlights = Array.isArray(q.highlights) ? q.highlights : [];
        return (
          <div key={`${q.review_id}-${title}`} className="rounded-lg border p-3">
            <div className="mb-1.5 flex items-center gap-2 text-[11px] text-muted-foreground">
              <span>{format(new Date(q.posted_at), "d MMM yyyy", { locale: trLocale })}</span>
              {q.platform && <Badge variant="outline" className="text-[10px] font-normal">{q.platform}</Badge>}
            </div>
            <HighlightedReviewText
              text={text}
              highlights={highlights}
              topicLabels={{ [topicId]: topicLabel }}
              focusTopicId={topicId}
            />
          </div>
        );
      })}
    </div>
  );
}

export default GroupTopicMatrix;
