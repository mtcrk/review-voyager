import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MousePointerClick } from "lucide-react";
import {
  Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie,
} from "recharts";
import { useMemo } from "react";
import type { PerformanceData } from "@/hooks/useGooglePerformance";

const CATEGORIES = [
  { key: "website_clicks", label: "Web Sitesi", color: "#6C50FF" },
  { key: "call_clicks", label: "Telefon", color: "#9B7FFF" },
  { key: "direction_requests", label: "Yol Tarifi", color: "#C4B5FD" },
  { key: "bookings", label: "Rezervasyon", color: "#10B981" },
  { key: "food_orders", label: "Sipariş", color: "#F59E0B" },
  { key: "conversations", label: "Mesaj", color: "#EC4899" },
] as const;

interface Props {
  data: PerformanceData;
}

export function ActionsChart({ data }: Props) {
  const pieData = useMemo(() => {
    return CATEGORIES.map((cat) => {
      const series = data.dailyMetrics.actions[cat.key as keyof typeof data.dailyMetrics.actions];
      const total = series.reduce((sum, d) => sum + d.value, 0);
      return { name: cat.label, value: total, color: cat.color };
    }).filter((d) => d.value > 0);
  }, [data]);

  if (pieData.length === 0) {
    return (
      <Card className="rounded-xl bg-card shadow-sm border border-border">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
            <MousePointerClick className="h-5 w-5 text-emerald-600" />
            Aksiyon Dağılımı
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-12">Henüz aksiyon verisi yok.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="rounded-xl bg-card shadow-sm border border-border h-full">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          <MousePointerClick className="h-5 w-5 text-emerald-600" />
          Aksiyon Dağılımı
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={320}>
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={110}
              paddingAngle={3}
              dataKey="value"
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              labelLine={false}
              style={{ fontSize: 12 }}
            >
              {pieData.map((entry, i) => (
                <Cell key={i} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "10px",
                fontSize: 13,
              }}
            />
          </PieChart>
        </ResponsiveContainer>

        {/* Legend */}
        <div className="flex flex-wrap gap-3 mt-2 justify-center">
          {pieData.map((d) => (
            <div key={d.name} className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }} />
              {d.name}: <span className="font-medium text-foreground">{d.value.toLocaleString("tr-TR")}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
