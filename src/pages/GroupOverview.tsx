import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Building2, Loader2, ArrowUp, ArrowDown, ArrowUpDown, Star, MessageSquare, Percent } from "lucide-react";
import { subDays } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PerformanceDateFilter } from "@/components/performance/PerformanceDateFilter";
import { useAdminGroup, useGroupSummary, type GroupPropertyRow } from "@/hooks/useBusinessGroup";
import { useBusiness } from "@/contexts/BusinessContext";

const MIN_SAMPLE = 30;

type SortKey = keyof Pick<
  GroupPropertyRow,
  "business_name" | "review_count" | "avg_rating" | "reply_rate" | "avg_reply_hours"
> | "delta";

export default function GroupOverview() {
  const navigate = useNavigate();
  const { businesses, setActiveBusiness } = useBusiness();
  const { data: group, isLoading: groupLoading } = useAdminGroup();
  const [range, setRange] = useState<{ from: Date; to: Date }>({ from: subDays(new Date(), 30), to: new Date() });
  const [sortKey, setSortKey] = useState<SortKey>("review_count");
  const [sortDesc, setSortDesc] = useState(true);

  const { data: rows = [], isLoading } = useGroupSummary(group?.groupId, range.from, range.to);

  const totals = useMemo(() => {
    const totalReviews = rows.reduce((s, r) => s + (r.review_count ?? 0), 0);
    const weightedRating =
      totalReviews > 0
        ? rows.reduce((s, r) => s + (Number(r.avg_rating) || 0) * (r.review_count ?? 0), 0) / totalReviews
        : 0;
    const weightedReply =
      totalReviews > 0
        ? rows.reduce((s, r) => s + (Number(r.reply_rate) || 0) * (r.review_count ?? 0), 0) / totalReviews
        : 0;
    return {
      properties: rows.length,
      totalReviews,
      avgRating: Math.round(weightedRating * 100) / 100,
      replyRate: Math.round(weightedReply * 10) / 10,
    };
  }, [rows]);

  const delta = (r: GroupPropertyRow) =>
    r.avg_rating != null && r.prev_avg_rating != null
      ? Math.round((Number(r.avg_rating) - Number(r.prev_avg_rating)) * 100) / 100
      : null;

  const sorted = useMemo(() => {
    const copy = [...rows];
    copy.sort((a, b) => {
      let av: number | string, bv: number | string;
      if (sortKey === "delta") {
        av = delta(a) ?? -99;
        bv = delta(b) ?? -99;
      } else if (sortKey === "business_name") {
        av = a.business_name ?? "";
        bv = b.business_name ?? "";
      } else {
        av = Number(a[sortKey] ?? -1);
        bv = Number(b[sortKey] ?? -1);
      }
      if (typeof av === "string" && typeof bv === "string") {
        return sortDesc ? bv.localeCompare(av, "tr") : av.localeCompare(bv, "tr");
      }
      return sortDesc ? Number(bv) - Number(av) : Number(av) - Number(bv);
    });
    return copy;
  }, [rows, sortKey, sortDesc]);

  const toggleSort = (key: SortKey) => {
    if (key === sortKey) setSortDesc((d) => !d);
    else {
      setSortKey(key);
      setSortDesc(key !== "business_name");
    }
  };

  const goToProperty = (businessId: string) => {
    const biz = businesses.find((b) => b.id === businessId);
    if (biz) setActiveBusiness(biz);
    navigate("/dashboard");
  };

  if (groupLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!group) {
    return (
      <div className="p-6 md:p-8">
        <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
          <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
            <Building2 className="h-10 w-10 text-primary/60" />
          </div>
          <h2 className="text-xl font-semibold mb-2">Grup yetkiniz yok</h2>
          <p className="text-muted-foreground max-w-md">
            Bu ekran otel gruplarına özeldir. Grup yöneticisi olarak tanımlandığınızda tüm tesisleriniz burada listelenir.
          </p>
        </div>
      </div>
    );
  }

  const SortHead = ({ label, k, className }: { label: string; k: SortKey; className?: string }) => (
    <TableHead className={className}>
      <button className="inline-flex items-center gap-1 hover:text-foreground" onClick={() => toggleSort(k)}>
        {label}
        {sortKey === k ? (
          sortDesc ? <ArrowDown className="h-3.5 w-3.5" /> : <ArrowUp className="h-3.5 w-3.5" />
        ) : (
          <ArrowUpDown className="h-3.5 w-3.5 opacity-40" />
        )}
      </button>
    </TableHead>
  );

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6 max-w-[1400px] mx-auto">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary/10">
              <Building2 className="h-5 w-5 text-primary" />
            </div>
            {group.groupName}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Grubunuzdaki tüm tesislerin performansı tek ekranda</p>
        </div>
        <PerformanceDateFilter
          range={range}
          onRangeChange={setRange}
          presets={[
            { label: "30 Gün", days: 30 },
            { label: "90 Gün", days: 90 },
            { label: "12 Ay", days: 365 },
          ]}
        />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard icon={<Building2 className="h-4 w-4" />} label="Tesis" value={String(totals.properties)} />
        <SummaryCard icon={<MessageSquare className="h-4 w-4" />} label="Yorum (dönem)" value={totals.totalReviews.toLocaleString("tr-TR")} />
        <SummaryCard icon={<Star className="h-4 w-4" />} label="Ağırlıklı ortalama puan" value={totals.avgRating ? totals.avgRating.toFixed(2) : "—"} />
        <SummaryCard icon={<Percent className="h-4 w-4" />} label="Yanıt oranı" value={`${totals.replyRate}%`} />
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Tesis karşılaştırması</CardTitle>
        </CardHeader>
        <CardContent className="p-0 sm:p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : sorted.length === 0 ? (
            <p className="text-sm text-muted-foreground px-6 py-10 text-center">
              Bu gruba bağlı tesis bulunamadı.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <SortHead label="Tesis" k="business_name" />
                    <SortHead label="Yorum" k="review_count" className="text-right" />
                    <SortHead label="Ort. puan" k="avg_rating" />
                    <SortHead label="Yanıt oranı" k="reply_rate" />
                    <SortHead label="Ort. yanıt süresi" k="avg_reply_hours" />
                    <SortHead label="Puan değişimi" k="delta" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sorted.map((r) => {
                    const d = delta(r);
                    const low = (r.review_count ?? 0) < MIN_SAMPLE;
                    return (
                      <TableRow key={r.business_id} className="cursor-pointer" onClick={() => goToProperty(r.business_id)}>
                        <TableCell className="font-medium text-primary hover:underline">{r.business_name}</TableCell>
                        <TableCell>{(r.review_count ?? 0).toLocaleString("tr-TR")}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span>{r.avg_rating != null ? Number(r.avg_rating).toFixed(2) : "—"}</span>
                            {low && (
                              <Badge variant="outline" className="text-[10px] font-normal">
                                yetersiz örneklem
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{r.reply_rate != null ? `${Number(r.reply_rate).toFixed(1)}%` : "—"}</TableCell>
                        <TableCell>
                          {r.avg_reply_hours != null ? `${Number(r.avg_reply_hours).toFixed(1)} sa` : "—"}
                        </TableCell>
                        <TableCell>
                          {d == null ? (
                            <span className="text-muted-foreground">—</span>
                          ) : (
                            <span className={d > 0 ? "text-emerald-600" : d < 0 ? "text-destructive" : "text-muted-foreground"}>
                              {d > 0 ? "+" : ""}
                              {d.toFixed(2)}
                            </span>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

    </div>
  );
}

function SummaryCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-2 text-muted-foreground text-xs">
          {icon}
          <span>{label}</span>
        </div>
        <p className="mt-2 text-2xl font-bold">{value}</p>
      </CardContent>
    </Card>
  );
}
