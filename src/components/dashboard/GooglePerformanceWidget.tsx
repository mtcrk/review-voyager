import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, MousePointerClick, TrendingUp } from "lucide-react";
import { useGooglePerformance } from "@/hooks/useGooglePerformance";
import { useBusiness } from "@/contexts/BusinessContext";
import { useNavigate } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";

export function GooglePerformanceWidget() {
  const { activeBusiness } = useBusiness();
  const { data, isLoading } = useGooglePerformance();
  const navigate = useNavigate();

  if (!activeBusiness?.google_location_id) return null;

  return (
    <Card
      className="shadow-card h-[500px] flex flex-col cursor-pointer hover:shadow-lg transition-all"
      onClick={() => navigate("/performance")}
    >
      <CardHeader className="pb-3 border-b">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-primary/10">
            <TrendingUp className="h-5 w-5 text-primary" />
          </div>
          <div>
            <CardTitle className="text-lg">Google Performance</CardTitle>
            <p className="text-sm text-muted-foreground">Son 30 gün</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col justify-center p-6">
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : data ? (
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-muted text-primary">
                <Eye className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Gösterimler</p>
                <p className="text-2xl font-bold text-foreground">{data.summary.totalImpressions.toLocaleString()}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-muted text-emerald-600">
                <MousePointerClick className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Aksiyonlar</p>
                <p className="text-2xl font-bold text-foreground">{data.summary.totalActions.toLocaleString()}</p>
              </div>
            </div>
            {data.summary.topKeyword && (
              <div className="bg-muted/50 rounded-lg p-3">
                <p className="text-xs text-muted-foreground mb-1">En Popüler Arama</p>
                <p className="text-sm font-medium text-foreground truncate">{data.summary.topKeyword}</p>
              </div>
            )}
          </div>
        ) : (
          <p className="text-muted-foreground text-center">Veri yüklenemedi</p>
        )}
      </CardContent>
    </Card>
  );
}
