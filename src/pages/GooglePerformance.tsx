import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Eye, MousePointerClick, Search, AlertCircle } from "lucide-react";
import { useGooglePerformance } from "@/hooks/useGooglePerformance";
import { useBusiness } from "@/contexts/BusinessContext";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar,
} from "recharts";
import { useMemo } from "react";

const CHART_COLORS = {
  maps: "hsl(var(--primary))",
  search: "hsl(var(--chart-2, 280 65% 60%))",
  actions: "hsl(var(--chart-3, 160 60% 45%))",
};

export default function GooglePerformance() {
  const { activeBusiness } = useBusiness();
  const { data, isLoading, error } = useGooglePerformance();

  // Merge impression data by date for the chart
  const impressionChartData = useMemo(() => {
    if (!data) return [];
    const dateMap = new Map<string, Record<string, number>>();
    const addSeries = (series: { date: string; value: number }[], key: string) => {
      series.forEach(({ date, value }) => {
        const entry = dateMap.get(date) || {};
        entry[key] = (entry[key] || 0) + value;
        dateMap.set(date, entry);
      });
    };
    addSeries(data.dailyMetrics.impressions.desktop_maps, "maps");
    addSeries(data.dailyMetrics.impressions.mobile_maps, "maps");
    addSeries(data.dailyMetrics.impressions.desktop_search, "search");
    addSeries(data.dailyMetrics.impressions.mobile_search, "search");
    return Array.from(dateMap.entries())
      .map(([date, vals]) => ({ date: date.slice(5), maps: vals.maps || 0, search: vals.search || 0 }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [data]);

  // Merge action data
  const actionChartData = useMemo(() => {
    if (!data) return [];
    const dateMap = new Map<string, Record<string, number>>();
    const addSeries = (series: { date: string; value: number }[], key: string) => {
      series.forEach(({ date, value }) => {
        const entry = dateMap.get(date) || {};
        entry[key] = value;
        dateMap.set(date, entry);
      });
    };
    addSeries(data.dailyMetrics.actions.website_clicks, "website");
    addSeries(data.dailyMetrics.actions.call_clicks, "calls");
    addSeries(data.dailyMetrics.actions.direction_requests, "directions");
    return Array.from(dateMap.entries())
      .map(([date, vals]) => ({ date: date.slice(5), website: vals.website || 0, calls: vals.calls || 0, directions: vals.directions || 0 }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [data]);

  if (!activeBusiness?.google_location_id) {
    return (
      <div className="max-w-7xl mx-auto p-8">
        <Card className="p-12 text-center">
          <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold text-foreground mb-2">Google Business Bağlı Değil</h2>
          <p className="text-muted-foreground">Performance verilerini görmek için önce Google Business hesabınızı bağlayın.</p>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto p-8 space-y-6">
        <h1 className="text-3xl font-semibold text-foreground">Google Performance</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <Card key={i}><CardContent className="p-6"><Skeleton className="h-20 w-full" /></CardContent></Card>
          ))}
        </div>
        <Skeleton className="h-80 w-full" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="max-w-7xl mx-auto p-8">
        <Card className="p-12 text-center">
          <AlertCircle className="h-12 w-12 mx-auto text-destructive mb-4" />
          <h2 className="text-xl font-semibold text-foreground mb-2">Veri Yüklenemedi</h2>
          <p className="text-muted-foreground">{(error as Error)?.message || "Performance verileri alınamadı. Google bağlantınızı veya bu lokasyon için erişim iznini kontrol edin."}</p>
        </Card>
      </div>
    );
  }

  const summaryCards = [
    { title: "Toplam Gösterim", value: data.summary.totalImpressions.toLocaleString(), icon: Eye, color: "text-primary" },
    { title: "Toplam Aksiyon", value: data.summary.totalActions.toLocaleString(), icon: MousePointerClick, color: "text-emerald-600" },
    { title: "En Popüler Anahtar Kelime", value: data.summary.topKeyword || "—", icon: Search, color: "text-amber-600", isText: true },
  ];

  return (
    <div className="max-w-7xl mx-auto p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-semibold text-foreground">Google Performance</h1>
        <p className="text-muted-foreground mt-1">
          {data.summary.periodStart} — {data.summary.periodEnd} · {activeBusiness.name}
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {summaryCards.map((card, i) => (
          <Card key={i} className="shadow-card hover:shadow-lg transition-all">
            <CardContent className="p-6 flex items-center gap-4">
              <div className={`p-3 rounded-xl bg-muted ${card.color}`}>
                <card.icon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{card.title}</p>
                <p className={`font-bold ${card.isText ? "text-lg" : "text-2xl"} text-foreground`}>{card.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Impressions Chart */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5 text-primary" />
            Gösterimler (Maps vs Search)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={320}>
            <AreaChart data={impressionChartData}>
              <defs>
                <linearGradient id="colorMaps" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={CHART_COLORS.maps} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={CHART_COLORS.maps} stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorSearch" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={CHART_COLORS.search} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={CHART_COLORS.search} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="date" className="text-xs" tick={{ fill: "hsl(var(--muted-foreground))" }} />
              <YAxis className="text-xs" tick={{ fill: "hsl(var(--muted-foreground))" }} />
              <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }} />
              <Area type="monotone" dataKey="maps" name="Maps" stroke={CHART_COLORS.maps} fill="url(#colorMaps)" strokeWidth={2} />
              <Area type="monotone" dataKey="search" name="Search" stroke={CHART_COLORS.search} fill="url(#colorSearch)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Actions Chart */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MousePointerClick className="h-5 w-5 text-emerald-600" />
            Kullanıcı Aksiyonları
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={actionChartData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="date" className="text-xs" tick={{ fill: "hsl(var(--muted-foreground))" }} />
              <YAxis className="text-xs" tick={{ fill: "hsl(var(--muted-foreground))" }} />
              <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }} />
              <Bar dataKey="website" name="Web Sitesi" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              <Bar dataKey="calls" name="Aramalar" fill="hsl(var(--chart-2, 280 65% 60%))" radius={[4, 4, 0, 0]} />
              <Bar dataKey="directions" name="Yol Tarifi" fill="hsl(var(--chart-3, 160 60% 45%))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Search Keywords */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5 text-amber-600" />
            Arama Anahtar Kelimeleri
          </CardTitle>
        </CardHeader>
        <CardContent>
          {data.searchKeywords.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">Henüz anahtar kelime verisi yok.</p>
          ) : (
            <div className="space-y-3">
              {data.searchKeywords.slice(0, 20).map((kw, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-muted-foreground w-6">{i + 1}</span>
                    <span className="text-sm text-foreground">{kw.keyword}</span>
                  </div>
                  <Badge variant="secondary" className="font-mono">
                    {kw.impressions.toLocaleString()}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
