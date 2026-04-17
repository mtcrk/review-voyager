import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, Clock, TrendingUp } from "lucide-react";
import { LocationMetrics } from "@/hooks/useMultiLocationData";
import { Progress } from "@/components/ui/progress";

interface Props {
  locations: LocationMetrics[];
  onSelectLocation: (id: string) => void;
}

export function LocationComparisonTable({ locations, onSelectLocation }: Props) {
  const sorted = [...locations].sort((a, b) => b.averageRating - a.averageRating);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-primary" />
          Lokasyon Karşılaştırması
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left px-5 py-3 font-medium text-muted-foreground">Lokasyon</th>
                <th className="text-center px-4 py-3 font-medium text-muted-foreground">Puan</th>
                <th className="text-center px-4 py-3 font-medium text-muted-foreground">Toplam Yorum</th>
                <th className="text-center px-4 py-3 font-medium text-muted-foreground">Bu Hafta</th>
                <th className="text-center px-4 py-3 font-medium text-muted-foreground">Yanıt Oranı</th>
                <th className="text-center px-4 py-3 font-medium text-muted-foreground">Bekleyen</th>
                <th className="text-center px-4 py-3 font-medium text-muted-foreground">Duygu</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((loc, i) => {
                const positiveRatio =
                  loc.totalReviews > 0
                    ? Math.round((loc.sentimentBreakdown.positive / loc.totalReviews) * 100)
                    : 0;

                return (
                  <tr
                    key={loc.id}
                    onClick={() => onSelectLocation(loc.id)}
                    className="border-b border-border/50 hover:bg-muted/20 cursor-pointer transition-colors"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                          {i + 1}
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{loc.name}</p>
                          {loc.city && (
                            <p className="text-xs text-muted-foreground">{loc.city}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="text-center px-4 py-4">
                      <div className="flex items-center justify-center gap-1">
                        <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
                        <span className="font-semibold text-foreground">{loc.averageRating}</span>
                      </div>
                    </td>
                    <td className="text-center px-4 py-4">
                      <span className="font-medium text-foreground">{loc.totalReviews}</span>
                    </td>
                    <td className="text-center px-4 py-4">
                      <Badge variant={loc.weeklyReviews > 0 ? "default" : "secondary"} className="text-xs">
                        +{loc.weeklyReviews}
                      </Badge>
                    </td>
                    <td className="text-center px-4 py-4">
                      <div className="flex flex-col items-center gap-1">
                        <span className="text-xs font-medium text-foreground">{loc.responseRate}%</span>
                        <Progress value={loc.responseRate} className="w-16 h-1.5" />
                      </div>
                    </td>
                    <td className="text-center px-4 py-4">
                      {loc.pendingReplies > 0 ? (
                        <Badge variant="destructive" className="text-xs">
                          <Clock className="h-3 w-3 mr-1" />
                          {loc.pendingReplies}
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-xs text-emerald-600 border-emerald-200 bg-emerald-50">
                          ✓ Tamam
                        </Badge>
                      )}
                    </td>
                    <td className="text-center px-4 py-4">
                      <div className="flex items-center justify-center gap-0.5">
                        <div
                          className="h-2 rounded-l-full bg-emerald-400"
                          style={{ width: `${Math.max(positiveRatio * 0.6, 4)}px` }}
                        />
                        <div
                          className="h-2 bg-amber-300"
                          style={{
                            width: `${Math.max(
                              ((loc.sentimentBreakdown.neutral / Math.max(loc.totalReviews, 1)) * 100) * 0.6,
                              4
                            )}px`,
                          }}
                        />
                        <div
                          className="h-2 rounded-r-full bg-rose-400"
                          style={{
                            width: `${Math.max(
                              ((loc.sentimentBreakdown.negative / Math.max(loc.totalReviews, 1)) * 100) * 0.6,
                              4
                            )}px`,
                          }}
                        />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
