import { Card, CardContent } from "@/components/ui/card";
import { Building2, Star, MessageSquare, BarChart3 } from "lucide-react";
import { LocationMetrics } from "@/hooks/useMultiLocationData";

interface Props {
  locations: LocationMetrics[];
}

export function LocationOverviewStats({ locations }: Props) {
  const totalLocations = locations.length;
  const totalReviews = locations.reduce((s, l) => s + l.totalReviews, 0);
  const overallRating =
    totalReviews > 0
      ? Math.round(
          (locations.reduce((s, l) => s + l.averageRating * l.totalReviews, 0) / totalReviews) * 10
        ) / 10
      : 0;
  const totalPending = locations.reduce((s, l) => s + l.pendingReplies, 0);
  const avgResponseRate =
    totalLocations > 0
      ? Math.round(locations.reduce((s, l) => s + l.responseRate, 0) / totalLocations)
      : 0;

  const stats = [
    {
      label: "Toplam Lokasyon",
      value: totalLocations,
      icon: Building2,
      color: "text-primary",
      bg: "bg-primary/10",
    },
    {
      label: "Genel Puan",
      value: `${overallRating} ★`,
      icon: Star,
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
    {
      label: "Toplam Yorum",
      value: totalReviews.toLocaleString(),
      icon: MessageSquare,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      label: "Ort. Yanıt Oranı",
      value: `${avgResponseRate}%`,
      icon: BarChart3,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <Card key={stat.label} className="border-border/60">
          <CardContent className="p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className={`p-2 rounded-lg ${stat.bg}`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </div>
            <p className="text-2xl font-bold text-foreground">{stat.value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
