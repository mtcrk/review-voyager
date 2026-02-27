import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  BarChart3, TrendingUp, Brain, MessageSquare, 
  ThumbsUp, ThumbsDown, Clock, Send, Star, Loader2,
  AlertTriangle, CheckCircle2
} from "lucide-react";
import { useBusiness } from "@/contexts/BusinessContext";
import { useQuery, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Line, Legend, Area, AreaChart
} from "recharts";
import ReactMarkdown from "react-markdown";
import { format, startOfMonth, subMonths, eachMonthOfInterval } from "date-fns";
import { tr } from "date-fns/locale";

const COLORS = {
  positive: "#10b981",
  neutral: "#f59e0b",
  negative: "#ef4444",
  primary: "#8b5cf6",
  secondary: "#6366f1",
};

export default function Statistics() {
  const { activeBusiness } = useBusiness();
  const [aiReport, setAiReport] = useState<string | null>(null);

  // Fetch reviews
  const { data: reviews = [], isLoading } = useQuery({
    queryKey: ["reviews-stats", activeBusiness?.id],
    queryFn: async () => {
      if (!activeBusiness) return [];
      const { data, error } = await supabase
        .from("reviews")
        .select("*")
        .eq("business_id", activeBusiness.id)
        .order("posted_at", { ascending: true });
      if (error) throw error;
      return data || [];
    },
    enabled: !!activeBusiness,
  });

  // Fetch reply logs
  const { data: replyLogs = [] } = useQuery({
    queryKey: ["reply-logs", activeBusiness?.id],
    queryFn: async () => {
      if (!activeBusiness) return [];
      const { data, error } = await supabase
        .from("reply_logs")
        .select("*")
        .eq("business_id", activeBusiness.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!activeBusiness,
  });

  // AI Analysis mutation
  const analysisMutation = useMutation({
    mutationFn: async () => {
      if (!activeBusiness) throw new Error("No business");
      const response = await supabase.functions.invoke("business-analysis", {
        body: { business_id: activeBusiness.id },
      });
      if (response.error) throw new Error(response.error.message);
      return response.data;
    },
    onSuccess: (data) => {
      setAiReport(data.analysis);
    },
  });

  // Computed stats
  const stats = useMemo(() => {
    if (!reviews.length) return null;

    const totalReviews = reviews.length;
    const avgRating = reviews.reduce((s, r) => s + r.rating, 0) / totalReviews;
    const sentimentCounts = {
      positive: reviews.filter(r => r.sentiment === "positive").length,
      neutral: reviews.filter(r => r.sentiment === "neutral").length,
      negative: reviews.filter(r => r.sentiment === "negative").length,
    };
    const repliedCount = reviews.filter(r => r.status === "replied").length;
    const pendingCount = reviews.filter(r => !r.status || r.status === "pending_reply").length;
    const replyRate = totalReviews > 0 ? (repliedCount / totalReviews) * 100 : 0;

    return { totalReviews, avgRating, sentimentCounts, repliedCount, pendingCount, replyRate };
  }, [reviews]);

  // Sentiment pie data
  const sentimentPieData = useMemo(() => {
    if (!stats) return [];
    return [
      { name: "Pozitif", value: stats.sentimentCounts.positive, color: COLORS.positive },
      { name: "Nötr", value: stats.sentimentCounts.neutral, color: COLORS.neutral },
      { name: "Negatif", value: stats.sentimentCounts.negative, color: COLORS.negative },
    ];
  }, [stats]);

  // Monthly review trend
  const monthlyData = useMemo(() => {
    if (!reviews.length) return [];
    const now = new Date();
    const months = eachMonthOfInterval({
      start: subMonths(startOfMonth(now), 5),
      end: startOfMonth(now),
    });

    return months.map(month => {
      const monthEnd = new Date(month.getFullYear(), month.getMonth() + 1, 0);
      const monthReviews = reviews.filter(r => {
        const d = new Date(r.posted_at);
        return d >= month && d <= monthEnd;
      });
      const avg = monthReviews.length > 0
        ? monthReviews.reduce((s, r) => s + r.rating, 0) / monthReviews.length
        : 0;
      return {
        month: format(month, "MMM yy", { locale: tr }),
        count: monthReviews.length,
        avgRating: parseFloat(avg.toFixed(1)),
        positive: monthReviews.filter(r => r.sentiment === "positive").length,
        negative: monthReviews.filter(r => r.sentiment === "negative").length,
      };
    });
  }, [reviews]);

  // Rating distribution
  const ratingDistribution = useMemo(() => {
    if (!reviews.length) return [];
    return [5, 4, 3, 2, 1].map(rating => ({
      rating: `${rating} ⭐`,
      count: reviews.filter(r => r.rating === rating).length,
    }));
  }, [reviews]);

  // Reply performance over time
  const replyPerformance = useMemo(() => {
    if (!replyLogs.length) return [];
    // Group by month
    const now = new Date();
    const months = eachMonthOfInterval({
      start: subMonths(startOfMonth(now), 5),
      end: startOfMonth(now),
    });

    return months.map(month => {
      const monthEnd = new Date(month.getFullYear(), month.getMonth() + 1, 0);
      const logs = replyLogs.filter(l => {
        const d = new Date(l.created_at);
        return d >= month && d <= monthEnd;
      });
      const avgTime = logs.length > 0
        ? logs.reduce((s, l) => s + (l.response_time_hours || 0), 0) / logs.length
        : 0;
      return {
        month: format(month, "MMM yy", { locale: tr }),
        replies: logs.length,
        avgResponseHours: parseFloat(avgTime.toFixed(1)),
      };
    });
  }, [replyLogs]);

  if (!activeBusiness) {
    return (
      <div className="p-8">
        <Card className="p-12 text-center">
          <p className="text-muted-foreground">İşletme seçilmedi.</p>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!reviews.length) {
    return (
      <div className="p-8 space-y-6">
        <h1 className="text-3xl font-semibold text-foreground">İstatistikler & Analiz</h1>
        <Card className="p-12 text-center">
          <Brain className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
          <p className="text-muted-foreground text-lg">Henüz analiz edilecek yorum yok.</p>
          <p className="text-sm text-muted-foreground mt-1">Yorumlar geldikçe grafikler ve AI raporu burada görünecek.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-foreground">İstatistikler & Analiz</h1>
          <p className="text-muted-foreground mt-1">
            {activeBusiness.name} — {stats?.totalReviews} yorum analizi
          </p>
        </div>
        <Button
          onClick={() => analysisMutation.mutate()}
          disabled={analysisMutation.isPending}
          className="gap-2"
        >
          {analysisMutation.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Brain className="h-4 w-4" />
          )}
          {analysisMutation.isPending ? "Analiz ediliyor..." : "AI Rapor Oluştur"}
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <Card className="shadow-card">
          <CardContent className="pt-5 pb-4 text-center">
            <Star className="h-5 w-5 mx-auto mb-1 text-primary fill-primary" />
            <div className="text-2xl font-bold">{stats?.avgRating.toFixed(1)}</div>
            <p className="text-xs text-muted-foreground">Ort. Puan</p>
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardContent className="pt-5 pb-4 text-center">
            <MessageSquare className="h-5 w-5 mx-auto mb-1 text-primary" />
            <div className="text-2xl font-bold">{stats?.totalReviews}</div>
            <p className="text-xs text-muted-foreground">Toplam Yorum</p>
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardContent className="pt-5 pb-4 text-center">
            <ThumbsUp className="h-5 w-5 mx-auto mb-1 text-emerald-500" />
            <div className="text-2xl font-bold">{stats?.sentimentCounts.positive}</div>
            <p className="text-xs text-muted-foreground">Pozitif</p>
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardContent className="pt-5 pb-4 text-center">
            <ThumbsDown className="h-5 w-5 mx-auto mb-1 text-rose-500" />
            <div className="text-2xl font-bold">{stats?.sentimentCounts.negative}</div>
            <p className="text-xs text-muted-foreground">Negatif</p>
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardContent className="pt-5 pb-4 text-center">
            <Send className="h-5 w-5 mx-auto mb-1 text-blue-500" />
            <div className="text-2xl font-bold">%{stats?.replyRate.toFixed(0)}</div>
            <p className="text-xs text-muted-foreground">Yanıt Oranı</p>
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardContent className="pt-5 pb-4 text-center">
            <AlertTriangle className="h-5 w-5 mx-auto mb-1 text-amber-500" />
            <div className="text-2xl font-bold">{stats?.pendingCount}</div>
            <p className="text-xs text-muted-foreground">Bekleyen</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sentiment Distribution */}
        <Card className="shadow-card">
          <CardHeader>
            <div className="flex items-center gap-2">
              <ThumbsUp className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">Duygu Dağılımı</CardTitle>
            </div>
            <CardDescription>Yorumlardaki duygu oranları</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={sentimentPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={4}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {sentimentPieData.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Rating Distribution */}
        <Card className="shadow-card">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Star className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">Puan Dağılımı</CardTitle>
            </div>
            <CardDescription>Yıldız bazında yorum sayıları</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={ratingDistribution} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis type="category" dataKey="rating" width={50} />
                  <Tooltip />
                  <Bar dataKey="count" fill={COLORS.primary} radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Monthly Trend */}
        <Card className="shadow-card">
          <CardHeader>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">Aylık Yorum Trendi</CardTitle>
            </div>
            <CardDescription>Son 6 ay yorum sayısı ve ortalama puan</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" domain={[0, 5]} />
                  <Tooltip />
                  <Legend />
                  <Bar yAxisId="left" dataKey="count" name="Yorum Sayısı" fill={COLORS.primary} radius={[4, 4, 0, 0]} />
                  <Line yAxisId="right" type="monotone" dataKey="avgRating" name="Ort. Puan" stroke={COLORS.positive} strokeWidth={2} dot />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Sentiment Trend */}
        <Card className="shadow-card">
          <CardHeader>
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">Duygu Trendi</CardTitle>
            </div>
            <CardDescription>Aylık pozitif vs negatif yorum sayısı</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Area type="monotone" dataKey="positive" name="Pozitif" stackId="1" fill={COLORS.positive} stroke={COLORS.positive} fillOpacity={0.6} />
                  <Area type="monotone" dataKey="negative" name="Negatif" stackId="1" fill={COLORS.negative} stroke={COLORS.negative} fillOpacity={0.6} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Reply Performance */}
      {replyLogs.length > 0 && (
        <Card className="shadow-card">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">Yanıt Performansı</CardTitle>
            </div>
            <CardDescription>Aylık yanıt sayısı ve ortalama yanıt süresi</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={replyPerformance}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Bar yAxisId="left" dataKey="replies" name="Yanıt Sayısı" fill={COLORS.secondary} radius={[4, 4, 0, 0]} />
                  <Line yAxisId="right" type="monotone" dataKey="avgResponseHours" name="Ort. Süre (saat)" stroke={COLORS.negative} strokeWidth={2} dot />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* AI Report */}
      {analysisMutation.isError && (
        <Card className="shadow-card border-destructive/50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-destructive mb-2">
              <AlertTriangle className="h-5 w-5" />
              <span className="font-medium">Analiz oluşturulamadı</span>
            </div>
            <p className="text-sm text-muted-foreground">
              {(analysisMutation.error as Error)?.message || "Bir hata oluştu."}
            </p>
          </CardContent>
        </Card>
      )}

      {aiReport && (
        <Card className="shadow-card">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg">AI İşletme Analiz Raporu</CardTitle>
              </div>
              <Badge variant="secondary" className="text-xs">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                {reviews.length} yorum analiz edildi
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm max-w-none dark:prose-invert">
              <ReactMarkdown>{aiReport}</ReactMarkdown>
            </div>
          </CardContent>
        </Card>
      )}

      {!aiReport && !analysisMutation.isPending && (
        <Card className="shadow-card border-dashed">
          <CardContent className="py-12 text-center">
            <Brain className="h-12 w-12 mx-auto mb-4 text-muted-foreground/40" />
            <h3 className="text-lg font-medium text-foreground mb-2">AI Analiz Raporu</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Yapay zeka ile yorumlarınızdan detaylı işletme analizi oluşturun.<br />
              Güçlü yönler, iyileştirme alanları, trend analizi ve aksiyon önerileri.
            </p>
            <Button onClick={() => analysisMutation.mutate()} className="gap-2">
              <Brain className="h-4 w-4" />
              Rapor Oluştur
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
