import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, Clock, TrendingUp } from "lucide-react";
import { LocationMetrics } from "@/hooks/useMultiLocationData";
import { Progress } from "@/components/ui/progress";

interface Props {
  locations: LocationMetrics[];
  onSelectLocation: (id: string) => void;
}

const PLATFORM_META: Record<string, { label: string; dot: string; text: string; bg: string }> = {
  google: { label: "Google", dot: "bg-blue-500", text: "text-blue-700", bg: "bg-blue-50" },
  booking: { label: "Booking", dot: "bg-indigo-500", text: "text-indigo-700", bg: "bg-indigo-50" },
  tripadvisor: { label: "TripAdvisor", dot: "bg-emerald-500", text: "text-emerald-700", bg: "bg-emerald-50" },
  hotelscom: { label: "Hotels.com", dot: "bg-rose-500", text: "text-rose-700", bg: "bg-rose-50" },
  expedia: { label: "Expedia", dot: "bg-amber-500", text: "text-amber-700", bg: "bg-amber-50" },
  trustpilot: { label: "Trustpilot", dot: "bg-teal-500", text: "text-teal-700", bg: "bg-teal-50" },
  tripcom: { label: "Trip.com", dot: "bg-orange-500", text: "text-orange-700", bg: "bg-orange-50" },
};

function platformMeta(key: string) {
  return PLATFORM_META[key] || { label: key, dot: "bg-muted-foreground", text: "text-foreground", bg: "bg-muted" };
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
                <th className="text-center px-4 py-3 font-medium text-muted-foreground">Genel Puan</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Platform Puanları</th>
                <th className="text-center px-4 py-3 font-medium text-muted-foreground">Toplam</th>
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
                    <td className="px-4 py-4">
                      {Object.keys(loc.platformBreakdown).length === 0 ? (
                        <span className="text-xs text-muted-foreground">—</span>
                      ) : (
                        <div className="flex flex-wrap gap-1.5 max-w-[260px]">
                          {Object.entries(loc.platformBreakdown)
                            .sort((a, b) => b[1].count - a[1].count)
                            .map(([key, val]) => {
                              const meta = platformMeta(key);
                              return (
                                <div
                                  key={key}
                                  className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md ${meta.bg} ${meta.text} text-xs`}
                                  title={`${meta.label} • ${val.count} yorum`}
                                >
                                  <span className={`w-1.5 h-1.5 rounded-full ${meta.dot}`} />
                                  <span className="font-medium">{meta.label}</span>
                                  <span className="font-semibold">{val.avgRating}★</span>
                                  <span className="opacity-60">({val.count})</span>
                                </div>
                              );
                            })}
                        </div>
                      )}
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
