import { Card, CardContent } from "@/components/ui/card";
import { Eye, MousePointerClick, Search, Percent, TrendingUp, TrendingDown } from "lucide-react";
import type { PerformanceData } from "@/hooks/useGooglePerformance";

interface Props {
  data: PerformanceData;
}

export function PerformanceSummaryCards({ data }: Props) {
  const totalImpressions = data.summary.totalImpressions;
  const totalActions = data.summary.totalActions;
  const conversionRate = totalImpressions > 0
    ? ((totalActions / totalImpressions) * 100).toFixed(2)
    : "0.00";
  const topKeyword = data.searchKeywords[0];

  const cards = [
    {
      title: "Toplam Görüntülenme",
      value: totalImpressions.toLocaleString("tr-TR"),
      icon: Eye,
      iconBg: "bg-[#6C50FF]/10",
      iconColor: "text-[#6C50FF]",
      trend: null as null | { up: boolean; percent: string },
      hint: "Sektör ortalaması: ~12.500",
    },
    {
      title: "Toplam Aksiyon",
      value: totalActions.toLocaleString("tr-TR"),
      icon: MousePointerClick,
      iconBg: "bg-emerald-500/10",
      iconColor: "text-emerald-600",
      trend: null,
      hint: "Sektör ortalaması: ~850",
    },
    {
      title: "En Çok Aranan Kelime",
      value: topKeyword?.keyword || "—",
      icon: Search,
      iconBg: "bg-amber-500/10",
      iconColor: "text-amber-600",
      subValue: topKeyword ? `${topKeyword.impressions.toLocaleString("tr-TR")} gösterim` : undefined,
      isText: true,
      hint: "Google'da en çok aranan anahtar kelime",
    },
    {
      title: "Dönüşüm Oranı",
      value: `%${conversionRate}`,
      icon: Percent,
      iconBg: "bg-rose-500/10",
      iconColor: "text-rose-600",
      trend: null,
      hint: "Sektör ortalaması: ~%5.2",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {cards.map((card, i) => (
        <Card
          key={i}
          className="rounded-xl bg-card shadow-sm border border-border hover:shadow-md transition-all"
        >
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className={`p-2.5 rounded-xl ${card.iconBg}`}>
                <card.icon className={`h-5 w-5 ${card.iconColor}`} />
              </div>
              {card.trend && (
                <div className={`flex items-center gap-1 text-xs font-medium ${card.trend.up ? "text-emerald-600" : "text-red-500"}`}>
                  {card.trend.up ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
                  {card.trend.percent}
                </div>
              )}
            </div>
            <div className="mt-4">
              <p className="text-sm text-muted-foreground">{card.title}</p>
              <p className={`font-bold mt-1 ${card.isText ? "text-base truncate" : "text-2xl"} text-foreground`}>
                {card.value}
              </p>
              {card.subValue && (
                <p className="text-xs text-muted-foreground mt-0.5">{card.subValue}</p>
              )}
            </div>
            <p className="text-[11px] text-muted-foreground/60 mt-3">{card.hint}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
