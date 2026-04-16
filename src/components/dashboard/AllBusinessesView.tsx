import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useBusiness } from "@/contexts/BusinessContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, MessageSquare, AlertCircle, Building2, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function AllBusinessesView() {
  const { businesses, setActiveBusiness } = useBusiness();
  const navigate = useNavigate();

  const businessIds = useMemo(() => businesses.map((b) => b.id), [businesses]);

  const { data: reviews = [], isLoading } = useQuery({
    queryKey: ["all-businesses-reviews", businessIds.join(",")],
    queryFn: async () => {
      if (businessIds.length === 0) return [];
      const pageSize = 1000;
      let from = 0;
      const all: any[] = [];
      while (true) {
        const { data, error } = await supabase
          .from("reviews")
          .select("id,business_id,rating,status,approved_reply,posted_at")
          .in("business_id", businessIds)
          .order("posted_at", { ascending: false })
          .range(from, from + pageSize - 1);
        if (error) throw error;
        if (!data || data.length === 0) break;
        all.push(...data);
        if (data.length < pageSize) break;
        from += pageSize;
      }
      return all;
    },
    enabled: businessIds.length > 0,
  });

  const { totals, perBusiness } = useMemo(() => {
    const map = new Map<string, { count: number; sum: number; pending: number }>();
    businesses.forEach((b) => map.set(b.id, { count: 0, sum: 0, pending: 0 }));
    let totalCount = 0;
    let totalSum = 0;
    let totalPending = 0;
    reviews.forEach((r: any) => {
      const m = map.get(r.business_id);
      if (!m) return;
      m.count += 1;
      m.sum += r.rating;
      const isPending = !r.approved_reply && r.status !== "replied";
      if (isPending) m.pending += 1;
      totalCount += 1;
      totalSum += r.rating;
      if (isPending) totalPending += 1;
    });
    const avg = totalCount > 0 ? totalSum / totalCount : 0;
    return {
      totals: {
        avg: avg.toFixed(1),
        count: totalCount,
        pending: totalPending,
        businesses: businesses.length,
      },
      perBusiness: businesses.map((b) => {
        const m = map.get(b.id)!;
        return {
          ...b,
          count: m.count,
          avg: m.count > 0 ? m.sum / m.count : 0,
          pending: m.pending,
        };
      }).sort((a, b) => b.count - a.count),
    };
  }, [reviews, businesses]);

  const summaryCards = [
    { title: "Toplam İşletme", value: totals.businesses.toString(), icon: Building2, subtitle: "tüm oteller" },
    { title: "Ortalama Puan", value: totals.avg, icon: Star, subtitle: "ağırlıklı ortalama" },
    { title: "Toplam Yorum", value: totals.count.toLocaleString(), icon: MessageSquare, subtitle: "tüm zamanlar" },
    { title: "Bekleyen Yanıt", value: totals.pending.toLocaleString(), icon: AlertCircle, subtitle: "tüm otellerde" },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-16">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-semibold text-foreground">Tüm Oteller</h1>
        <p className="text-muted-foreground mt-1">
          {totals.businesses} otelin birleşik özeti
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {summaryCards.map((c) => (
          <Card key={c.title} className="shadow-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">{c.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center gap-2">
                <c.icon className="h-5 w-5 text-primary" />
                <div className="text-2xl sm:text-3xl font-bold text-foreground">{c.value}</div>
              </div>
              <p className="text-xs text-muted-foreground">{c.subtitle}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Per-business cards */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">Otellere Göre Özet</h2>
          <p className="text-xs text-muted-foreground">Bir otele tıkla → o otelin Dashboard'ı</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {perBusiness.map((b) => (
            <button
              key={b.id}
              onClick={() => {
                setActiveBusiness(b);
                navigate("/");
              }}
              className="text-left bg-card border border-border rounded-lg p-4 hover:border-primary/40 hover:shadow-md transition-all group"
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <h3 className="font-semibold text-foreground truncate">{b.name}</h3>
                    {b.count === 0 && (
                      <Badge variant="outline" className="text-xs bg-amber-50 text-amber-700 border-amber-200">
                        Kurulum gerekli
                      </Badge>
                    )}
                  </div>
                  {b.city && <p className="text-xs text-muted-foreground">{b.city}</p>}
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all shrink-0 mt-1" />
              </div>

              <div className="grid grid-cols-3 gap-2 pt-3 border-t border-border">
                <div>
                  <div className="flex items-center gap-1">
                    <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                    <span className="font-semibold text-sm text-foreground">
                      {b.count > 0 ? b.avg.toFixed(1) : "—"}
                    </span>
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-0.5">Puan</p>
                </div>
                <div>
                  <span className="font-semibold text-sm text-foreground">{b.count.toLocaleString()}</span>
                  <p className="text-[10px] text-muted-foreground mt-0.5">Yorum</p>
                </div>
                <div>
                  <span className={`font-semibold text-sm ${b.pending > 0 ? "text-amber-700" : "text-foreground"}`}>
                    {b.pending.toLocaleString()}
                  </span>
                  <p className="text-[10px] text-muted-foreground mt-0.5">Bekleyen</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
