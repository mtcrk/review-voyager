import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye } from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { useMemo } from "react";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import type { PerformanceData } from "@/hooks/useGooglePerformance";

const COLORS = {
  desktop_maps: "#6C50FF",
  mobile_maps: "#9B7FFF",
  desktop_search: "#C4B5FD",
  mobile_search: "#E9DEFB",
};

interface Props {
  data: PerformanceData;
  rangeLabel: string;
}

export function ImpressionsChart({ data, rangeLabel }: Props) {
  const chartData = useMemo(() => {
    const dateMap = new Map<string, Record<string, number>>();
    const add = (series: { date: string; value: number }[], key: string) => {
      series.forEach(({ date, value }) => {
        const entry = dateMap.get(date) || {};
        entry[key] = value;
        dateMap.set(date, entry);
      });
    };
    const imp = data.dailyMetrics.impressions;
    add(imp.desktop_maps, "desktop_maps");
    add(imp.mobile_maps, "mobile_maps");
    add(imp.desktop_search, "desktop_search");
    add(imp.mobile_search, "mobile_search");

    return Array.from(dateMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, vals]) => ({
        date: format(new Date(date), "dd MMM yy", { locale: tr }),
        "Maps Desktop": vals.desktop_maps || 0,
        "Maps Mobil": vals.mobile_maps || 0,
        "Search Desktop": vals.desktop_search || 0,
        "Search Mobil": vals.mobile_search || 0,
      }));
  }, [data]);

  return (
    <Card className="rounded-xl bg-card shadow-sm border border-border">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          <Eye className="h-5 w-5 text-[#6C50FF]" />
          Görüntülenme Trendi — {rangeLabel}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={340}>
          <AreaChart data={chartData}>
            <defs>
              {Object.entries(COLORS).map(([key, color]) => (
                <linearGradient key={key} id={`grad-${key}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={color} stopOpacity={0.25} />
                  <stop offset="95%" stopColor={color} stopOpacity={0} />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted/40" />
            <XAxis dataKey="date" className="text-xs" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
            <YAxis className="text-xs" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "10px",
                fontSize: 13,
              }}
            />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Area type="monotone" dataKey="Maps Desktop" stroke={COLORS.desktop_maps} fill={`url(#grad-desktop_maps)`} strokeWidth={2} />
            <Area type="monotone" dataKey="Maps Mobil" stroke={COLORS.mobile_maps} fill={`url(#grad-mobile_maps)`} strokeWidth={2} />
            <Area type="monotone" dataKey="Search Desktop" stroke={COLORS.desktop_search} fill={`url(#grad-desktop_search)`} strokeWidth={2} />
            <Area type="monotone" dataKey="Search Mobil" stroke={COLORS.mobile_search} fill={`url(#grad-mobile_search)`} strokeWidth={1.5} />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
