import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown, AlertTriangle, Trophy } from "lucide-react";
import { LocationMetrics } from "@/hooks/useMultiLocationData";

interface Props {
  locations: LocationMetrics[];
}

export function LocationHighlights({ locations }: Props) {
  if (locations.length < 2) return null;

  const sorted = [...locations].sort((a, b) => b.averageRating - a.averageRating);
  const best = sorted[0];
  const worst = sorted[sorted.length - 1];

  const mostReviewed = [...locations].sort((a, b) => b.weeklyReviews - a.weeklyReviews)[0];
  const needsAttention = [...locations].sort((a, b) => b.pendingReplies - a.pendingReplies)[0];

  const cards = [
    {
      label: "En Yüksek Puan",
      icon: Trophy,
      value: best.name,
      metric: `${best.averageRating} ★`,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
      border: "border-emerald-100",
    },
    {
      label: "Dikkat Gerektiren",
      icon: AlertTriangle,
      value: worst.name,
      metric: `${worst.averageRating} ★`,
      color: "text-amber-600",
      bg: "bg-amber-50",
      border: "border-amber-100",
    },
    {
      label: "Bu Hafta En Aktif",
      icon: TrendingUp,
      value: mostReviewed.name,
      metric: `${mostReviewed.weeklyReviews} yorum`,
      color: "text-blue-600",
      bg: "bg-blue-50",
      border: "border-blue-100",
    },
    {
      label: "En Çok Bekleyen",
      icon: TrendingDown,
      value: needsAttention.name,
      metric: `${needsAttention.pendingReplies} bekleyen`,
      color: "text-rose-600",
      bg: "bg-rose-50",
      border: "border-rose-100",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => (
        <Card key={card.label} className={`border ${card.border} ${card.bg}/30`}>
          <CardContent className="p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className={`p-2 rounded-lg ${card.bg}`}>
                <card.icon className={`h-4 w-4 ${card.color}`} />
              </div>
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                {card.label}
              </span>
            </div>
            <p className="font-semibold text-foreground text-sm truncate">{card.value}</p>
            <p className={`text-lg font-bold ${card.color} mt-0.5`}>{card.metric}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
