import { AlertCircle, RefreshCcw, Link as LinkIcon } from "lucide-react";
import { useGooglePerformance } from "@/hooks/useGooglePerformance";
import { useBusiness } from "@/contexts/BusinessContext";
import { useMemo, useState } from "react";
import { format, subDays } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { PerformanceSummaryCards } from "@/components/performance/PerformanceSummaryCards";
import { ImpressionsChart } from "@/components/performance/ImpressionsChart";
import { ActionsChart } from "@/components/performance/ActionsChart";
import { SearchKeywordsTable } from "@/components/performance/SearchKeywordsTable";
import { PerformanceDateFilter } from "@/components/performance/PerformanceDateFilter";
import { useNavigate } from "react-router-dom";

const RANGE_LABELS: Record<number, string> = {
  7: "Son 7 Gün",
  30: "Son 30 Gün",
  90: "Son 90 Gün",
  180: "Son 6 Ay",
};

export default function GooglePerformance() {
  const { activeBusiness } = useBusiness();
  const navigate = useNavigate();

  const [range, setRange] = useState({ from: subDays(new Date(), 30), to: new Date() });

  const dateRange = useMemo(
    () => ({ startDate: format(range.from, "yyyy-MM-dd"), endDate: format(range.to, "yyyy-MM-dd") }),
    [range]
  );

  const activeDays = Math.round((range.to.getTime() - range.from.getTime()) / (1000 * 60 * 60 * 24));
  const rangeLabel = RANGE_LABELS[activeDays] || `${activeDays} Gün`;

  const { data, isLoading, error, refetch } = useGooglePerformance(dateRange);

  // --- Empty state: no Google connection ---
  if (!activeBusiness?.google_location_id) {
    return (
      <div className="max-w-4xl mx-auto p-8 flex items-center justify-center min-h-[60vh]">
        <Card className="rounded-xl p-10 text-center max-w-md w-full">
          <LinkIcon className="h-12 w-12 mx-auto text-[#6C50FF]/60 mb-4" />
          <h2 className="text-xl font-semibold text-foreground mb-2">Google Business Profile Bağlayın</h2>
          <p className="text-muted-foreground text-sm mb-6">
            Performans verilerinizi görüntülemek için Google Business Profile hesabınızı bağlayın.
          </p>
          <Button className="bg-[#6C50FF] hover:bg-[#5A42E0]" onClick={() => navigate("/settings")}>
            Bağla
          </Button>
        </Card>
      </div>
    );
  }

  // --- Loading state ---
  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto p-6 md:p-8 space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Google Performans</h1>
          <p className="text-sm text-muted-foreground mt-1">Google performans verileri alınıyor…</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="rounded-xl">
              <CardContent className="p-6 space-y-3">
                <Skeleton className="h-10 w-10 rounded-xl" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Skeleton className="h-80 w-full rounded-xl" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-72 w-full rounded-xl" />
          <Skeleton className="h-72 w-full rounded-xl" />
        </div>
      </div>
    );
  }

  // --- Error state ---
  if (error || !data) {
    return (
      <div className="max-w-4xl mx-auto p-8 flex items-center justify-center min-h-[60vh]">
        <Card className="rounded-xl p-10 text-center max-w-md w-full">
          <AlertCircle className="h-12 w-12 mx-auto text-destructive mb-4" />
          <h2 className="text-xl font-semibold text-foreground mb-2">Veri Yüklenemedi</h2>
          <p className="text-muted-foreground text-sm mb-6">
            {(error as Error)?.message || "Google bağlantınızda bir sorun var. Lütfen yeniden bağlanın."}
          </p>
          <Button variant="outline" onClick={() => refetch()} className="gap-2">
            <RefreshCcw className="h-4 w-4" />
            Tekrar Dene
          </Button>
        </Card>
      </div>
    );
  }

  // --- Main dashboard ---
  return (
    <div className="max-w-7xl mx-auto p-6 md:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">📊 Google Performans</h1>
          <p className="text-sm text-muted-foreground mt-1">{activeBusiness.name}</p>
        </div>
        <PerformanceDateFilter range={range} onRangeChange={setRange} />
      </div>

      {/* Summary Cards */}
      <PerformanceSummaryCards data={data} />

      {/* Impressions Chart */}
      <ImpressionsChart data={data} rangeLabel={rangeLabel} />

      {/* Bottom Grid: Actions + Keywords */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ActionsChart data={data} />
        <SearchKeywordsTable keywords={data.searchKeywords} />
      </div>
    </div>
  );
}
