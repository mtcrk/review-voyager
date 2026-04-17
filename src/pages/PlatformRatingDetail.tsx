import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Star, MessageSquare, ExternalLink, Loader2, TrendingUp, Calendar, Trophy, RefreshCw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useMultiLocationData } from "@/hooks/useMultiLocationData";
import { useBusiness } from "@/contexts/BusinessContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import { tr } from "date-fns/locale";

const PLATFORM_META: Record<string, { label: string; dot: string; urlField?: string; idField?: string; buildUrl?: (val: string) => string }> = {
  google: { label: "Google", dot: "bg-blue-500", idField: "place_id", buildUrl: (id) => `https://search.google.com/local/reviews?placeid=${id}` },
  booking: { label: "Booking.com", dot: "bg-indigo-500", idField: "booking_hotel_id", buildUrl: (id) => `https://www.booking.com/hotel/${id}.html` },
  tripadvisor: { label: "TripAdvisor", dot: "bg-emerald-500", idField: "tripadvisor_id" },
  hotelscom: { label: "Hotels.com", dot: "bg-rose-500", urlField: "hotelscom_url" },
  expedia: { label: "Expedia", dot: "bg-amber-500", idField: "expedia_hotel_id" },
  tripcom: { label: "Trip.com", dot: "bg-orange-500", idField: "tripcom_hotel_id" },
  trustpilot: { label: "Trustpilot", dot: "bg-teal-500", urlField: "trustpilot_url" },
};

export default function PlatformRatingDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { businesses, setActiveBusiness } = useBusiness();
  const { data: locations = [], isLoading } = useMultiLocationData();

  const location = locations.find((l) => l.id === id);
  const business = businesses.find((b) => b.id === id);

  const queryClient = useQueryClient();
  const [refreshing, setRefreshing] = useState(false);

  // Latest reviews per platform (top 3 each)
  const { data: recentReviews = [] } = useQuery({
    queryKey: ["platform-detail-reviews", id],
    queryFn: async () => {
      if (!id) return [];
      const { data, error } = await supabase
        .from("reviews")
        .select("id, reviewer_name, rating, text, platform, posted_at")
        .eq("business_id", id)
        .order("posted_at", { ascending: false })
        .limit(200);
      if (error) throw error;
      return data || [];
    },
    enabled: !!id,
  });

  // Platform rankings (TripAdvisor #X of Y in area, etc.)
  const { data: rankings = [] } = useQuery({
    queryKey: ["platform-rankings", id],
    queryFn: async () => {
      if (!id) return [];
      const { data, error } = await supabase
        .from("platform_rankings")
        .select("*")
        .eq("business_id", id);
      if (error) throw error;
      return data || [];
    },
    enabled: !!id,
  });

  const handleRefreshRankings = async () => {
    if (!id) return;
    setRefreshing(true);
    try {
      const { error } = await supabase.functions.invoke("fetch-platform-ranking", {
        body: { business_id: id },
      });
      if (error) throw error;
      await queryClient.invalidateQueries({ queryKey: ["platform-rankings", id] });
      toast({ title: "Sıralama güncellendi", description: "Platform sıralamaları yenilendi." });
    } catch (e: any) {
      toast({
        title: "Hata",
        description: e.message || "Sıralama çekilemedi.",
        variant: "destructive",
      });
    } finally {
      setRefreshing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!location || !business) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        Lokasyon bulunamadı.
        <div className="mt-4">
          <Button variant="outline" onClick={() => navigate("/locations/platform-ratings")}>
            <ArrowLeft className="h-4 w-4 mr-2" /> Geri Dön
          </Button>
        </div>
      </div>
    );
  }

  const platforms = Object.entries(location.platformBreakdown)
    .filter(([, v]) => v.count > 0)
    .sort((a, b) => b[1].avgRating - a[1].avgRating);

  const goToReviews = (platformKey: string) => {
    setActiveBusiness(business);
    navigate(`/reviews?platform=${platformKey}`);
  };

  const getExternalUrl = (platformKey: string): string | null => {
    const meta = PLATFORM_META[platformKey];
    if (!meta) return null;
    if (meta.urlField) return (business as any)[meta.urlField] || null;
    if (meta.idField && meta.buildUrl) {
      const val = (business as any)[meta.idField];
      return val ? meta.buildUrl(val) : null;
    }
    return null;
  };

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="space-y-2">
          <Button variant="ghost" size="sm" onClick={() => navigate("/locations/platform-ratings")} className="-ml-2">
            <ArrowLeft className="h-4 w-4 mr-1" /> Platform Puanları
          </Button>
          <h1 className="text-2xl font-bold text-foreground">{location.name}</h1>
          {location.city && <p className="text-sm text-muted-foreground">{location.city}</p>}
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefreshRankings}
            disabled={refreshing}
            className="mt-2"
          >
            {refreshing ? (
              <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
            ) : (
              <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
            )}
            Sıralamayı Yenile
          </Button>
        </div>
        <div className="flex items-center gap-6 bg-card border rounded-xl px-5 py-3">
          <div className="text-center">
            <div className="flex items-center gap-1 justify-center">
              <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
              <span className="text-2xl font-bold">{location.averageRating}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">Genel Ortalama</p>
          </div>
          <div className="h-10 w-px bg-border" />
          <div className="text-center">
            <p className="text-2xl font-bold">{location.totalReviews}</p>
            <p className="text-xs text-muted-foreground mt-0.5">Toplam Yorum</p>
          </div>
          <div className="h-10 w-px bg-border" />
          <div className="text-center">
            <p className="text-2xl font-bold">%{location.responseRate}</p>
            <p className="text-xs text-muted-foreground mt-0.5">Yanıt Oranı</p>
          </div>
        </div>
      </div>

      {/* Platform Cards */}
      {platforms.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            Bu lokasyon için henüz platform verisi yok.
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {platforms.map(([key, stats]) => {
            const meta = PLATFORM_META[key] || { label: key, dot: "bg-muted" };
            const platformReviews = recentReviews.filter((r) => (r.platform || "google").toLowerCase() === key);
            const latest = platformReviews.slice(0, 3);
            const externalUrl = getExternalUrl(key);

            // Rating distribution
            const dist = [5, 4, 3, 2, 1].map((star) => ({
              star,
              count: platformReviews.filter((r) => r.rating === star).length,
            }));
            const maxCount = Math.max(...dist.map((d) => d.count), 1);

            const ranking = rankings.find((r: any) => r.platform === key);

            return (
              <Card key={key} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3 border-b">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${meta.dot}`} />
                      {meta.label}
                    </CardTitle>
                    {externalUrl && (
                      <a
                        href={externalUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-muted-foreground hover:text-primary transition-colors"
                        title="Platformda aç"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="pt-4 space-y-4">
                  {/* Score */}
                  <div className="flex items-end justify-between">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <Star className="h-5 w-5 text-amber-500 fill-amber-500" />
                        <span className="text-3xl font-bold">{stats.avgRating}</span>
                        <span className="text-sm text-muted-foreground">/ 5</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{stats.count} yorum</p>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      {Math.round((stats.count / location.totalReviews) * 100)}%
                    </Badge>
                  </div>

                  {/* Ranking */}
                  {ranking && ranking.rank && ranking.total_in_area && (
                    <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900">
                      <Trophy className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                      <div className="text-xs">
                        <p className="font-semibold text-foreground">
                          {ranking.area_name || location.city || "Bölge"}
                          {"'de "}
                          <span className="text-amber-700 dark:text-amber-300">{ranking.total_in_area}</span>
                          {" otel arasında "}
                          <span className="text-amber-700 dark:text-amber-300">{ranking.rank}.</span>
                          {" sırada"}
                        </p>
                        <p className="text-muted-foreground mt-0.5">
                          Güncellendi: {formatDistanceToNow(new Date(ranking.fetched_at), { addSuffix: true, locale: tr })}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Distribution */}
                  <div className="space-y-1">
                    {dist.map((d) => (
                      <div key={d.star} className="flex items-center gap-2 text-xs">
                        <span className="w-3 text-muted-foreground">{d.star}</span>
                        <Star className="h-2.5 w-2.5 text-amber-400 fill-amber-400 shrink-0" />
                        <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-amber-400 rounded-full"
                            style={{ width: `${(d.count / maxCount) * 100}%` }}
                          />
                        </div>
                        <span className="w-6 text-right text-muted-foreground">{d.count}</span>
                      </div>
                    ))}
                  </div>

                  {/* Latest reviews */}
                  {latest.length > 0 && (
                    <div className="space-y-2 pt-2 border-t">
                      <p className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                        <Calendar className="h-3 w-3" /> Son Yorumlar
                      </p>
                      {latest.map((r) => (
                        <div key={r.id} className="text-xs space-y-0.5">
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-foreground truncate">{r.reviewer_name}</span>
                            <div className="flex items-center gap-0.5 shrink-0">
                              {Array.from({ length: r.rating }).map((_, i) => (
                                <Star key={i} className="h-2.5 w-2.5 text-amber-400 fill-amber-400" />
                              ))}
                            </div>
                          </div>
                          {r.text && (
                            <p className="text-muted-foreground line-clamp-2">{r.text}</p>
                          )}
                          <p className="text-[10px] text-muted-foreground/70">
                            {formatDistanceToNow(new Date(r.posted_at), { addSuffix: true, locale: tr })}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}

                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => goToReviews(key)}
                  >
                    <MessageSquare className="h-3.5 w-3.5 mr-1.5" />
                    Tüm {meta.label} Yorumları
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
