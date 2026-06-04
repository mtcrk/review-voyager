import { useMemo } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
  Cell,
  LabelList,
  ReferenceLine,
} from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { useBusiness } from "@/contexts/BusinessContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Star, Sparkles, TrendingUp } from "lucide-react";
import { IntelligenceTabs } from "@/components/intelligence/IntelligenceTabs";

type Competitor = {
  id: string;
  name: string;
  rating: number | null;
  review_count: number | null;
  proximity_m: number | null;
  match_score: number | null;
};

const PRIMARY = "hsl(var(--primary))";
const MUTED = "hsl(var(--muted-foreground))";

function fmtNum(n: number | null | undefined) {
  if (n == null) return "—";
  return new Intl.NumberFormat("tr-TR").format(Math.round(n));
}
function fmtRating(n: number | null | undefined) {
  if (n == null) return "—";
  return n.toFixed(1);
}
function truncate(s: string, n = 18) {
  return s.length > n ? s.slice(0, n - 1) + "…" : s;
}

export default function IntelligenceComparison() {
  const { activeBusiness, loading: businessLoading } = useBusiness();
  const businessId = activeBusiness?.id;

  const dataQuery = useQuery({
    queryKey: ["comparison", businessId],
    enabled: !!businessId,
    queryFn: async () => {
      const [competitorsRes, reviewsRes] = await Promise.all([
        supabase
          .from("ci_competitors")
          .select("id,name,rating,review_count,proximity_m,match_score")
          .eq("business_id", businessId!)
          .eq("status", "confirmed"),
        supabase
          .from("reviews")
          .select("rating", { count: "exact" })
          .eq("business_id", businessId!),
      ]);
      if (competitorsRes.error) throw competitorsRes.error;
      if (reviewsRes.error) throw reviewsRes.error;
      const rows = (reviewsRes.data ?? []) as { rating: number | null }[];
      const ratings = rows.map((r) => r.rating).filter((r): r is number => r != null);
      const ownReviewCount = reviewsRes.count ?? rows.length;
      const ownAvg = ratings.length
        ? ratings.reduce((a, b) => a + b, 0) / ratings.length
        : null;
      return {
        competitors: (competitorsRes.data ?? []) as Competitor[],
        ownAvg,
        ownReviewCount,
      };
    },
  });

  const competitors = dataQuery.data?.competitors ?? [];
  const ownAvg = dataQuery.data?.ownAvg ?? null;
  const ownReviewCount = dataQuery.data?.ownReviewCount ?? 0;
  const ownName = activeBusiness?.name ?? "Siz";

  const stats = useMemo(() => {
    const ratings = competitors.map((c) => c.rating).filter((r): r is number => r != null);
    const counts = competitors.map((c) => c.review_count).filter((r): r is number => r != null);
    const avgRating = ratings.length ? ratings.reduce((a, b) => a + b, 0) / ratings.length : null;
    const avgCount = counts.length ? counts.reduce((a, b) => a + b, 0) / counts.length : null;
    return { avgRating, avgCount };
  }, [competitors]);

  const ranked = useMemo(() => {
    const rows: Array<{
      id: string;
      name: string;
      rating: number | null;
      review_count: number | null;
      proximity_m: number | null;
      match_score: number | null;
      isOwn: boolean;
    }> = [
      {
        id: "__own__",
        name: ownName,
        rating: ownAvg,
        review_count: ownReviewCount,
        proximity_m: null,
        match_score: null,
        isOwn: true,
      },
      ...competitors.map((c) => ({ ...c, isOwn: false })),
    ];
    rows.sort((a, b) => (b.rating ?? -1) - (a.rating ?? -1));
    return rows;
  }, [competitors, ownAvg, ownReviewCount, ownName]);

  const ownRank = ranked.findIndex((r) => r.isOwn) + 1;

  const insight = useMemo(() => {
    if (ownAvg == null || stats.avgRating == null) return null;
    const ratingDelta = ownAvg - stats.avgRating;
    const volumeDelta =
      stats.avgCount != null && stats.avgCount > 0
        ? (ownReviewCount - stats.avgCount) / stats.avgCount
        : 0;
    const ratingPhrase =
      Math.abs(ratingDelta) < 0.1
        ? "rakip ortalamasıyla aynı seviyede"
        : ratingDelta > 0
          ? `rakip ortalamasının (${stats.avgRating.toFixed(1)}) üzerinde`
          : `rakip ortalamasının (${stats.avgRating.toFixed(1)}) altında`;
    const volumePhrase =
      Math.abs(volumeDelta) < 0.1
        ? "yorum hacminiz pazarla aynı seviyede"
        : volumeDelta > 0
          ? "yorum hacminiz pazarın üzerinde"
          : "yorum hacminiz pazarın altında";
    return `Puanınız (${ownAvg.toFixed(1)}) ${ratingPhrase}; ${volumePhrase}.`;
  }, [ownAvg, ownReviewCount, stats]);

  // Scatter data
  const scatterCompetitors = competitors
    .filter((c) => c.rating != null && c.review_count != null)
    .map((c) => ({
      x: c.review_count!,
      y: c.rating!,
      name: truncate(c.name),
      fullName: c.name,
    }));
  const scatterOwn =
    ownAvg != null && ownReviewCount != null
      ? [{ x: ownReviewCount, y: ownAvg, name: truncate(ownName), fullName: ownName }]
      : [];

  const allRatings = [
    ...scatterCompetitors.map((d) => d.y),
    ...scatterOwn.map((d) => d.y),
  ];
  const yMin = allRatings.length ? Math.max(1, Math.floor(Math.min(...allRatings) * 2) / 2 - 0.2) : 3;
  const yMax = 5;
  const allX = [...scatterCompetitors.map((d) => d.x), ...scatterOwn.map((d) => d.x)];
  const xMax = allX.length ? Math.max(...allX) * 1.1 : 100;
  const xMid = xMax / 2;
  const yMid = (yMin + yMax) / 2;

  if (businessLoading) {
    return (
      <div className="p-4 sm:p-6 max-w-6xl mx-auto space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-96 max-w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!businessId) {
    return (
      <div className="p-6">
        <p className="text-muted-foreground">Önce bir işletme seçin.</p>
      </div>
    );
  }

  const loading = dataQuery.isLoading;
  const isEmpty = !loading && competitors.length === 0;

  return (
    <>
      <Helmet>
        <title>Pazar Karşılaştırması · VoyageRespond</title>
      </Helmet>
      <div className="p-4 sm:p-6 max-w-6xl mx-auto space-y-6">
        <IntelligenceTabs />

        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">
            Pazar Karşılaştırması
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Otelinizin rakipleriniz arasındaki konumu.
          </p>
          {!loading && !isEmpty && (
            <div className="text-xs text-muted-foreground mt-2">
              {competitors.length} rakiple karşılaştırılıyor
            </div>
          )}
        </div>

        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-96 w-full" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Skeleton className="h-64 w-full" />
              <Skeleton className="h-64 w-full" />
            </div>
          </div>
        ) : isEmpty ? (
          <Card>
            <CardContent className="p-8 text-center space-y-3">
              <Sparkles className="h-8 w-8 mx-auto text-muted-foreground" />
              <h3 className="font-medium">Karşılaştırılacak rakip yok</h3>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                Karşılaştırma için önce Rakip Seçimi sekmesinden en az 1 rakip onaylayın.
              </p>
              <Button asChild>
                <Link to="/intelligence">Rakip Seçimine Git</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Positioning map */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Pazar Konumu</CardTitle>
                <p className="text-xs text-muted-foreground">
                  Yatay: yorum sayısı · Dikey: puan
                </p>
              </CardHeader>
              <CardContent>
                <div className="h-[360px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <ScatterChart margin={{ top: 20, right: 30, bottom: 30, left: 10 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis
                        type="number"
                        dataKey="x"
                        name="Yorum"
                        domain={[0, xMax]}
                        tick={{ fontSize: 11, fill: MUTED }}
                        label={{
                          value: "Yorum sayısı",
                          position: "insideBottom",
                          offset: -15,
                          fontSize: 11,
                          fill: MUTED,
                        }}
                      />
                      <YAxis
                        type="number"
                        dataKey="y"
                        name="Puan"
                        domain={[yMin, yMax]}
                        tick={{ fontSize: 11, fill: MUTED }}
                        label={{
                          value: "Puan",
                          angle: -90,
                          position: "insideLeft",
                          fontSize: 11,
                          fill: MUTED,
                        }}
                      />
                      <ZAxis type="number" range={[80, 80]} />
                      <ReferenceLine x={xMid} stroke="hsl(var(--border))" strokeDasharray="2 4" />
                      <ReferenceLine y={yMid} stroke="hsl(var(--border))" strokeDasharray="2 4" />
                      <Tooltip
                        cursor={{ strokeDasharray: "3 3" }}
                        content={({ active, payload }) => {
                          if (!active || !payload?.length) return null;
                          const d = payload[0].payload as any;
                          return (
                            <div className="rounded-md border bg-popover px-3 py-2 text-xs shadow-sm">
                              <div className="font-medium">{d.fullName}</div>
                              <div className="text-muted-foreground">
                                Puan: {d.y.toFixed(1)} · Yorum: {fmtNum(d.x)}
                              </div>
                            </div>
                          );
                        }}
                      />
                      <Scatter name="Rakipler" data={scatterCompetitors} fill={MUTED}>
                        <LabelList
                          dataKey="name"
                          position="top"
                          style={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                        />
                      </Scatter>
                      <Scatter
                        name="Siz"
                        data={scatterOwn}
                        fill={PRIMARY}
                        shape="star"
                        legendType="star"
                      >
                        <LabelList
                          dataKey="name"
                          position="top"
                          style={{ fontSize: 11, fill: "hsl(var(--primary))", fontWeight: 600 }}
                        />
                      </Scatter>
                    </ScatterChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1 text-[11px] text-muted-foreground">
                  <span>↗ Liderler (yüksek puan, yüksek hacim)</span>
                  <span>↖ Yükselenler (yüksek puan, düşük hacim)</span>
                  <span>↘ Hacimli ama riskli</span>
                  <span>↙ Zayıf</span>
                </div>
                {insight && (
                  <div className="mt-4 rounded-md border bg-muted/40 p-3 text-sm flex gap-2 items-start">
                    <TrendingUp className="h-4 w-4 mt-0.5 text-primary shrink-0" />
                    <span>{insight}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Ranking table */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Sıralama</CardTitle>
                <p className="text-xs text-muted-foreground">
                  Pazarda <span className="font-medium text-foreground">{ownRank}.</span> sıradasınız
                  ({ranked.length} işletme arasında)
                </p>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-xs text-muted-foreground border-b">
                        <th className="py-2 px-4 font-medium">#</th>
                        <th className="py-2 px-4 font-medium">İşletme</th>
                        <th className="py-2 px-4 font-medium">Puan</th>
                        <th className="py-2 px-4 font-medium">Yorum</th>
                        <th className="py-2 px-4 font-medium">Mesafe</th>
                        <th className="py-2 px-4 font-medium">Eşleşme</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ranked.map((r, i) => (
                        <tr
                          key={r.id}
                          className={
                            r.isOwn
                              ? "bg-primary/5 font-medium border-b last:border-0"
                              : "border-b last:border-0"
                          }
                        >
                          <td className="py-2.5 px-4 text-muted-foreground">{i + 1}</td>
                          <td className="py-2.5 px-4">
                            <div className="flex items-center gap-2">
                              <span className="truncate">{r.name}</span>
                              {r.isOwn && (
                                <Badge variant="default" className="h-5 text-[10px]">
                                  Siz
                                </Badge>
                              )}
                            </div>
                          </td>
                          <td className="py-2.5 px-4">
                            <span className="inline-flex items-center gap-1">
                              <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                              {fmtRating(r.rating)}
                            </span>
                          </td>
                          <td className="py-2.5 px-4">{fmtNum(r.review_count)}</td>
                          <td className="py-2.5 px-4 text-muted-foreground">
                            {r.proximity_m != null ? `${(r.proximity_m / 1000).toFixed(1)} km` : "—"}
                          </td>
                          <td className="py-2.5 px-4">
                            {r.match_score != null ? (
                              <Badge variant="secondary" className="h-5">
                                {Math.round(r.match_score)}
                              </Badge>
                            ) : (
                              <span className="text-muted-foreground">—</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Bar charts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <BarCard
                title="Puan karşılaştırması"
                rows={ranked}
                dataKey="rating"
                domain={[yMin, 5]}
                formatter={(v) => v.toFixed(1)}
              />
              <BarCard
                title="Yorum hacmi"
                rows={ranked}
                dataKey="review_count"
                formatter={(v) => fmtNum(v)}
              />
            </div>

            {/* Teaser */}
            <Card className="border-dashed">
              <CardContent className="p-5 flex items-start gap-3">
                <Sparkles className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                <div>
                  <div className="text-sm font-medium">
                    Yakında: Kategori bazlı analiz
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Kahvaltı, temizlik, personel gibi kategorilerde rakip karşılaştırması, rakip
                    yorumları toplandığında burada görünecek.
                  </p>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </>
  );
}

function BarCard({
  title,
  rows,
  dataKey,
  domain,
  formatter,
}: {
  title: string;
  rows: Array<{ name: string; rating: number | null; review_count: number | null; isOwn: boolean }>;
  dataKey: "rating" | "review_count";
  domain?: [number, number];
  formatter: (v: number) => string;
}) {
  const data = rows
    .filter((r) => r[dataKey] != null)
    .map((r) => ({ name: truncate(r.name, 14), fullName: r.name, value: r[dataKey] as number, isOwn: r.isOwn }));
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} layout="vertical" margin={{ top: 4, right: 24, bottom: 4, left: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
              <XAxis type="number" domain={domain} tick={{ fontSize: 10, fill: MUTED }} />
              <YAxis
                type="category"
                dataKey="name"
                width={90}
                tick={{ fontSize: 11, fill: MUTED }}
              />
              <Tooltip
                cursor={{ fill: "hsl(var(--muted))", opacity: 0.4 }}
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  const d = payload[0].payload as any;
                  return (
                    <div className="rounded-md border bg-popover px-3 py-2 text-xs shadow-sm">
                      <div className="font-medium">{d.fullName}</div>
                      <div className="text-muted-foreground">{formatter(d.value)}</div>
                    </div>
                  );
                }}
              />
              <Bar dataKey="value" radius={[4, 4, 4, 4]}>
                {data.map((d, i) => (
                  <Cell key={i} fill={d.isOwn ? PRIMARY : "hsl(var(--muted-foreground) / 0.4)"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}