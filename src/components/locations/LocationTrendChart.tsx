import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { LocationMetrics } from "@/hooks/useMultiLocationData";
import { useMemo } from "react";

interface Props {
  locations: LocationMetrics[];
}

// Curated color palette for location lines
const LINE_COLORS = [
  "hsl(255, 75%, 70%)",  // primary purple
  "hsl(215, 85%, 65%)",  // blue
  "hsl(160, 60%, 50%)",  // emerald
  "hsl(35, 90%, 55%)",   // amber
  "hsl(340, 70%, 60%)",  // rose
  "hsl(280, 60%, 65%)",  // violet
  "hsl(190, 70%, 50%)",  // cyan
  "hsl(15, 80%, 55%)",   // orange
];

export function LocationTrendChart({ locations }: Props) {
  const chartData = useMemo(() => {
    // Collect all unique dates across all locations
    const allDates = new Set<string>();
    locations.forEach((loc) => {
      loc.ratingTrend.forEach((t) => allDates.add(t.date));
    });

    const sortedDates = Array.from(allDates).sort();

    return sortedDates.map((date) => {
      const point: Record<string, string | number> = {
        date: date.slice(5), // "MM-DD"
      };
      locations.forEach((loc) => {
        const entry = loc.ratingTrend.find((t) => t.date === date);
        if (entry) {
          point[loc.name] = entry.avgRating;
        }
      });
      return point;
    });
  }, [locations]);

  if (chartData.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center text-muted-foreground">
          Trend verisi henüz yeterli değil.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">
          Puan Trendi (Son 30 Gün)
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-2">
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 13%, 92%)" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11, fill: "hsl(217, 11%, 50%)" }}
                tickLine={false}
                axisLine={{ stroke: "hsl(220, 13%, 92%)" }}
              />
              <YAxis
                domain={[1, 5]}
                tick={{ fontSize: 11, fill: "hsl(217, 11%, 50%)" }}
                tickLine={false}
                axisLine={false}
                width={30}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: "8px",
                  border: "1px solid hsl(220, 13%, 92%)",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                  fontSize: "12px",
                }}
              />
              <Legend
                iconType="circle"
                wrapperStyle={{ fontSize: "12px", paddingTop: "8px" }}
              />
              {locations.map((loc, i) => (
                <Line
                  key={loc.id}
                  type="monotone"
                  dataKey={loc.name}
                  stroke={LINE_COLORS[i % LINE_COLORS.length]}
                  strokeWidth={2.5}
                  dot={{ r: 3, strokeWidth: 0, fill: LINE_COLORS[i % LINE_COLORS.length] }}
                  activeDot={{ r: 5, strokeWidth: 2, stroke: "#fff" }}
                  connectNulls
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
