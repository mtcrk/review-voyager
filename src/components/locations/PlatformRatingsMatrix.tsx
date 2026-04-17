import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Star, LayoutGrid } from "lucide-react";
import { LocationMetrics } from "@/hooks/useMultiLocationData";

interface Props {
  locations: LocationMetrics[];
  onSelectLocation: (id: string) => void;
}

// Note: clicking a row navigates to the location's platform detail page (handled by parent).

const PLATFORMS: { key: string; label: string; dot: string }[] = [
  { key: "google", label: "Google", dot: "bg-blue-500" },
  { key: "booking", label: "Booking", dot: "bg-indigo-500" },
  { key: "tripadvisor", label: "TripAdvisor", dot: "bg-emerald-500" },
  { key: "hotelscom", label: "Hotels.com", dot: "bg-rose-500" },
  { key: "expedia", label: "Expedia", dot: "bg-amber-500" },
  { key: "tripcom", label: "Trip.com", dot: "bg-orange-500" },
  { key: "trustpilot", label: "Trustpilot", dot: "bg-teal-500" },
];

export function PlatformRatingsMatrix({ locations, onSelectLocation }: Props) {
  // Only show platforms that at least one location has data for
  const activePlatforms = PLATFORMS.filter((p) =>
    locations.some((l) => l.platformBreakdown[p.key]?.count > 0)
  );

  const sorted = [...locations].sort((a, b) => b.averageRating - a.averageRating);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <LayoutGrid className="h-4 w-4 text-primary" />
          Platform Bazlı Puanlar
        </CardTitle>
        <p className="text-xs text-muted-foreground mt-1">
          Her otelin hangi platformda kaç puan aldığını tek bakışta görün
        </p>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left px-5 py-3 font-medium text-muted-foreground sticky left-0 bg-muted/30 z-10 min-w-[220px]">
                  Lokasyon
                </th>
                {activePlatforms.map((p) => (
                  <th
                    key={p.key}
                    className="text-center px-4 py-3 font-medium text-muted-foreground min-w-[110px]"
                  >
                    <div className="flex items-center justify-center gap-1.5">
                      <span className={`w-1.5 h-1.5 rounded-full ${p.dot}`} />
                      {p.label}
                    </div>
                  </th>
                ))}
                <th className="text-center px-4 py-3 font-medium text-foreground min-w-[100px] bg-primary/5">
                  Ortalama
                </th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((loc, i) => (
                <tr
                  key={loc.id}
                  onClick={() => onSelectLocation(loc.id)}
                  className="border-b border-border/50 hover:bg-muted/20 cursor-pointer transition-colors"
                >
                  <td className="px-5 py-4 sticky left-0 bg-card z-10">
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary shrink-0">
                        {i + 1}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-foreground truncate">{loc.name}</p>
                        {loc.city && (
                          <p className="text-xs text-muted-foreground truncate">{loc.city}</p>
                        )}
                      </div>
                    </div>
                  </td>
                  {activePlatforms.map((p) => {
                    const data = loc.platformBreakdown[p.key];
                    if (!data || data.count === 0) {
                      return (
                        <td key={p.key} className="text-center px-4 py-4">
                          <span className="text-xs text-muted-foreground/50">—</span>
                        </td>
                      );
                    }
                    return (
                      <td key={p.key} className="text-center px-4 py-4">
                        <div className="flex flex-col items-center gap-0.5">
                          <div className="flex items-center gap-1">
                            <Star className="h-3 w-3 text-amber-400 fill-amber-400" />
                            <span className="font-semibold text-foreground">
                              {data.avgRating}
                            </span>
                          </div>
                          <span className="text-[10px] text-muted-foreground">
                            {data.count} yorum
                          </span>
                        </div>
                      </td>
                    );
                  })}
                  <td className="text-center px-4 py-4 bg-primary/5">
                    <div className="flex flex-col items-center gap-0.5">
                      <div className="flex items-center gap-1">
                        <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
                        <span className="font-bold text-foreground">{loc.averageRating}</span>
                      </div>
                      <span className="text-[10px] text-muted-foreground">
                        {loc.totalReviews} toplam
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
