import { useState, useMemo, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import {
  FileDown, Mail, CalendarIcon, Star, MessageSquare, ThumbsUp, ThumbsDown,
  Send, AlertTriangle, TrendingUp, BarChart3, Brain, Loader2, CheckCircle2,
} from "lucide-react";
import { useBusiness } from "@/contexts/BusinessContext";
import { useQuery, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Line, Legend, Area, AreaChart,
} from "recharts";
import ReactMarkdown from "react-markdown";
import { format, startOfMonth, subMonths, eachMonthOfInterval, isWithinInterval, subDays, startOfDay, endOfDay } from "date-fns";
import { tr } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import logo from "@/assets/logo.png";

const COLORS = {
  positive: "#10b981",
  neutral: "#f59e0b",
  negative: "#ef4444",
  primary: "#8b5cf6",
  secondary: "#6366f1",
};

const DATE_PRESETS = [
  { label: "Son 7 gün", days: 7 },
  { label: "Son 30 gün", days: 30 },
  { label: "Son 90 gün", days: 90 },
  { label: "Son 6 ay", days: 180 },
  { label: "Son 1 yıl", days: 365 },
];

export default function Report() {
  const { activeBusiness } = useBusiness();
  const reportRef = useRef<HTMLDivElement>(null);
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
    from: subDays(new Date(), 30),
    to: new Date(),
  });
  const [aiReport, setAiReport] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const [emailTo, setEmailTo] = useState("");
  const [isSendingEmail, setIsSendingEmail] = useState(false);

  // Fetch all reviews
  const { data: allReviews = [], isLoading } = useQuery({
    queryKey: ["reviews-report", activeBusiness?.id],
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
    queryKey: ["reply-logs-report", activeBusiness?.id],
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

  // Filter reviews by date range
  const reviews = useMemo(() => {
    return allReviews.filter((r) => {
      const d = new Date(r.posted_at);
      return isWithinInterval(d, { start: startOfDay(dateRange.from), end: endOfDay(dateRange.to) });
    });
  }, [allReviews, dateRange]);

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
      positive: reviews.filter((r) => r.sentiment === "positive").length,
      neutral: reviews.filter((r) => r.sentiment === "neutral").length,
      negative: reviews.filter((r) => r.sentiment === "negative").length,
    };
    const repliedCount = reviews.filter((r) => r.status === "replied").length;
    const pendingCount = reviews.filter((r) => !r.status || r.status === "pending_reply").length;
    const replyRate = totalReviews > 0 ? (repliedCount / totalReviews) * 100 : 0;

    // Platform breakdown
    const platformCounts: Record<string, number> = {};
    reviews.forEach((r) => {
      platformCounts[r.platform] = (platformCounts[r.platform] || 0) + 1;
    });

    return { totalReviews, avgRating, sentimentCounts, repliedCount, pendingCount, replyRate, platformCounts };
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

  // Monthly data
  const monthlyData = useMemo(() => {
    if (!reviews.length) return [];
    const months = eachMonthOfInterval({
      start: startOfMonth(dateRange.from),
      end: startOfMonth(dateRange.to),
    });
    return months.map((month) => {
      const monthEnd = new Date(month.getFullYear(), month.getMonth() + 1, 0);
      const monthReviews = reviews.filter((r) => {
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
        positive: monthReviews.filter((r) => r.sentiment === "positive").length,
        negative: monthReviews.filter((r) => r.sentiment === "negative").length,
      };
    });
  }, [reviews, dateRange]);

  // Rating distribution
  const ratingDistribution = useMemo(() => {
    if (!reviews.length) return [];
    return [5, 4, 3, 2, 1].map((rating) => ({
      rating: `${rating} ⭐`,
      count: reviews.filter((r) => r.rating === rating).length,
    }));
  }, [reviews]);

  // Platform breakdown for chart
  const platformData = useMemo(() => {
    if (!stats?.platformCounts) return [];
    const names: Record<string, string> = {
      google: "Google",
      booking: "Booking",
      tripadvisor: "TripAdvisor",
      trustpilot: "Trustpilot",
      hotelscom: "Hotels.com",
    };
    return Object.entries(stats.platformCounts).map(([key, count]) => ({
      name: names[key] || key,
      count,
    }));
  }, [stats]);

  // Export PDF
  const handleExportPDF = async () => {
    if (!reportRef.current) return;
    setIsExporting(true);
    try {
      const html2canvas = (await import("html2canvas")).default;
      const { jsPDF } = await import("jspdf");

      const element = reportRef.current;
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
        logging: false,
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pdfWidth - 20;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 10;

      pdf.addImage(imgData, "PNG", 10, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight - 20;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight + 10;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 10, position, imgWidth, imgHeight);
        heightLeft -= pdfHeight - 20;
      }

      const fileName = `${activeBusiness?.name || "rapor"}-${format(dateRange.from, "dd.MM.yyyy")}-${format(dateRange.to, "dd.MM.yyyy")}.pdf`;
      pdf.save(fileName);
      toast({ title: "PDF İndirildi", description: `${fileName} başarıyla indirildi.` });
    } catch (err) {
      console.error("PDF export error:", err);
      toast({ title: "Hata", description: "PDF oluşturulurken bir hata oluştu.", variant: "destructive" });
    } finally {
      setIsExporting(false);
    }
  };

  // Send email
  const handleSendEmail = async () => {
    if (!emailTo || !activeBusiness) return;
    setIsSendingEmail(true);
    try {
      const reportHtml = generateEmailReportHtml();
      const { error } = await supabase.functions.invoke("send-customer-email", {
        body: {
          business_id: activeBusiness.id,
          to: emailTo,
          subject: `${activeBusiness.name} — Yorum Raporu (${format(dateRange.from, "dd.MM.yyyy")} – ${format(dateRange.to, "dd.MM.yyyy")})`,
          html: reportHtml,
        },
      });
      if (error) throw error;
      toast({ title: "E-posta Gönderildi", description: `Rapor ${emailTo} adresine gönderildi.` });
      setEmailDialogOpen(false);
      setEmailTo("");
    } catch (err: any) {
      console.error("Email send error:", err);
      toast({ title: "Hata", description: err.message || "E-posta gönderilemedi.", variant: "destructive" });
    } finally {
      setIsSendingEmail(false);
    }
  };

  const generateEmailReportHtml = () => {
    if (!stats || !activeBusiness) return "";
    const platformNames: Record<string, string> = {
      google: "Google",
      booking: "Booking",
      tripadvisor: "TripAdvisor",
      trustpilot: "Trustpilot",
      hotelscom: "Hotels.com",
    };
    const platformRows = Object.entries(stats.platformCounts)
      .map(([k, v]) => `<tr><td style="padding:8px 16px;border-bottom:1px solid #f0f0f0">${platformNames[k] || k}</td><td style="padding:8px 16px;border-bottom:1px solid #f0f0f0;text-align:right;font-weight:600">${v}</td></tr>`)
      .join("");

    return `
<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#ffffff;font-family:Arial,Helvetica,sans-serif">
<div style="max-width:600px;margin:0 auto;padding:32px 24px">
  <div style="text-align:center;margin-bottom:32px">
    <h1 style="color:#1a1a2e;font-size:24px;margin:0 0 4px">${activeBusiness.name}</h1>
    <p style="color:#6b7280;font-size:14px;margin:0">Yorum Raporu — ${format(dateRange.from, "dd MMM yyyy", { locale: tr })} – ${format(dateRange.to, "dd MMM yyyy", { locale: tr })}</p>
  </div>
  
  <div style="display:flex;flex-wrap:wrap;gap:12px;margin-bottom:24px">
    <div style="flex:1;min-width:120px;background:#f8f9fa;border-radius:12px;padding:16px;text-align:center">
      <div style="font-size:28px;font-weight:700;color:#8b5cf6">⭐ ${stats.avgRating.toFixed(1)}</div>
      <div style="font-size:12px;color:#6b7280;margin-top:4px">Ort. Puan</div>
    </div>
    <div style="flex:1;min-width:120px;background:#f8f9fa;border-radius:12px;padding:16px;text-align:center">
      <div style="font-size:28px;font-weight:700;color:#1a1a2e">${stats.totalReviews}</div>
      <div style="font-size:12px;color:#6b7280;margin-top:4px">Toplam Yorum</div>
    </div>
    <div style="flex:1;min-width:120px;background:#f8f9fa;border-radius:12px;padding:16px;text-align:center">
      <div style="font-size:28px;font-weight:700;color:#10b981">%${stats.replyRate.toFixed(0)}</div>
      <div style="font-size:12px;color:#6b7280;margin-top:4px">Yanıt Oranı</div>
    </div>
  </div>

  <div style="margin-bottom:24px">
    <h2 style="font-size:16px;color:#1a1a2e;margin:0 0 8px">Duygu Analizi</h2>
    <div style="background:#f8f9fa;border-radius:12px;padding:16px">
      <div style="display:flex;gap:16px;justify-content:center">
        <span style="color:#10b981;font-weight:600">✅ ${stats.sentimentCounts.positive} Pozitif</span>
        <span style="color:#f59e0b;font-weight:600">⚡ ${stats.sentimentCounts.neutral} Nötr</span>
        <span style="color:#ef4444;font-weight:600">❌ ${stats.sentimentCounts.negative} Negatif</span>
      </div>
    </div>
  </div>

  ${Object.keys(stats.platformCounts).length > 1 ? `
  <div style="margin-bottom:24px">
    <h2 style="font-size:16px;color:#1a1a2e;margin:0 0 8px">Platform Dağılımı</h2>
    <table style="width:100%;border-collapse:collapse;background:#f8f9fa;border-radius:12px;overflow:hidden">
      <thead><tr style="background:#e5e7eb"><th style="padding:8px 16px;text-align:left;font-size:13px">Platform</th><th style="padding:8px 16px;text-align:right;font-size:13px">Yorum</th></tr></thead>
      <tbody>${platformRows}</tbody>
    </table>
  </div>` : ""}

  ${aiReport ? `
  <div style="margin-bottom:24px">
    <h2 style="font-size:16px;color:#1a1a2e;margin:0 0 8px">AI Analiz Raporu</h2>
    <div style="background:#f8f9fa;border-radius:12px;padding:16px;font-size:14px;color:#374151;line-height:1.6">
      ${aiReport.replace(/\n/g, "<br/>")}
    </div>
  </div>` : ""}

  <div style="text-align:center;padding-top:24px;border-top:1px solid #e5e7eb">
    <p style="color:#9ca3af;font-size:12px;margin:0">Bu rapor VoyageRespond tarafından otomatik oluşturulmuştur.</p>
  </div>
</div>
</body>
</html>`;
  };

  const handlePresetClick = (days: number) => {
    setDateRange({ from: subDays(new Date(), days), to: new Date() });
  };

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

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold text-foreground">Rapor Oluştur</h1>
          <p className="text-muted-foreground mt-1">{activeBusiness.name} — Profesyonel yorum raporu</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={() => analysisMutation.mutate()}
            disabled={analysisMutation.isPending || !reviews.length}
            variant="outline"
            className="gap-2"
          >
            {analysisMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Brain className="h-4 w-4" />}
            {analysisMutation.isPending ? "Analiz..." : "AI Analiz"}
          </Button>
          <Button
            onClick={handleExportPDF}
            disabled={isExporting || !reviews.length}
            className="gap-2"
          >
            {isExporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileDown className="h-4 w-4" />}
            PDF İndir
          </Button>
          <Button
            onClick={() => setEmailDialogOpen(true)}
            disabled={!reviews.length}
            variant="secondary"
            className="gap-2"
          >
            <Mail className="h-4 w-4" />
            E-posta
          </Button>
        </div>
      </div>

      {/* Date Range Selector */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-sm font-medium text-muted-foreground">Tarih Aralığı:</span>
            {DATE_PRESETS.map((preset) => (
              <Button
                key={preset.days}
                variant="outline"
                size="sm"
                onClick={() => handlePresetClick(preset.days)}
                className={cn(
                  "text-xs",
                  Math.abs(
                    Math.round((dateRange.to.getTime() - dateRange.from.getTime()) / (1000 * 60 * 60 * 24)) - preset.days
                  ) <= 1 && "bg-primary text-primary-foreground hover:bg-primary/90"
                )}
              >
                {preset.label}
              </Button>
            ))}
            <div className="flex items-center gap-2 ml-auto">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-1 text-xs">
                    <CalendarIcon className="h-3.5 w-3.5" />
                    {format(dateRange.from, "dd MMM yyyy", { locale: tr })}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dateRange.from}
                    onSelect={(d) => d && setDateRange((prev) => ({ ...prev, from: d }))}
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
              <span className="text-muted-foreground text-sm">—</span>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-1 text-xs">
                    <CalendarIcon className="h-3.5 w-3.5" />
                    {format(dateRange.to, "dd MMM yyyy", { locale: tr })}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dateRange.to}
                    onSelect={(d) => d && setDateRange((prev) => ({ ...prev, to: d }))}
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Report Content (this is what gets exported) */}
      <div ref={reportRef} className="space-y-6 bg-background">
        {/* Report Header (visible in PDF) */}
        <div className="flex items-center justify-between border-b pb-4">
          <div className="flex items-center gap-3">
            <img src={logo} alt="VoyageRespond" className="h-8 w-8" />
            <div>
              <h2 className="text-xl font-bold text-foreground">{activeBusiness.name}</h2>
              <p className="text-sm text-muted-foreground">
                {format(dateRange.from, "dd MMM yyyy", { locale: tr })} – {format(dateRange.to, "dd MMM yyyy", { locale: tr })}
              </p>
            </div>
          </div>
          <Badge variant="outline" className="text-xs">
            {reviews.length} yorum
          </Badge>
        </div>

        {!reviews.length ? (
          <Card className="p-12 text-center">
            <BarChart3 className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground text-lg">Seçili tarih aralığında yorum bulunamadı.</p>
            <p className="text-sm text-muted-foreground mt-1">Farklı bir tarih aralığı deneyin.</p>
          </Card>
        ) : (
          <>
            {/* KPI Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              <Card>
                <CardContent className="pt-4 pb-3 text-center">
                  <Star className="h-5 w-5 mx-auto mb-1 text-primary fill-primary" />
                  <div className="text-2xl font-bold">{stats?.avgRating.toFixed(1)}</div>
                  <p className="text-xs text-muted-foreground">Ort. Puan</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4 pb-3 text-center">
                  <MessageSquare className="h-5 w-5 mx-auto mb-1 text-primary" />
                  <div className="text-2xl font-bold">{stats?.totalReviews}</div>
                  <p className="text-xs text-muted-foreground">Toplam Yorum</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4 pb-3 text-center">
                  <ThumbsUp className="h-5 w-5 mx-auto mb-1 text-emerald-500" />
                  <div className="text-2xl font-bold">{stats?.sentimentCounts.positive}</div>
                  <p className="text-xs text-muted-foreground">Pozitif</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4 pb-3 text-center">
                  <ThumbsDown className="h-5 w-5 mx-auto mb-1 text-rose-500" />
                  <div className="text-2xl font-bold">{stats?.sentimentCounts.negative}</div>
                  <p className="text-xs text-muted-foreground">Negatif</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4 pb-3 text-center">
                  <Send className="h-5 w-5 mx-auto mb-1 text-blue-500" />
                  <div className="text-2xl font-bold">%{stats?.replyRate.toFixed(0)}</div>
                  <p className="text-xs text-muted-foreground">Yanıt Oranı</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4 pb-3 text-center">
                  <AlertTriangle className="h-5 w-5 mx-auto mb-1 text-amber-500" />
                  <div className="text-2xl font-bold">{stats?.pendingCount}</div>
                  <p className="text-xs text-muted-foreground">Bekleyen</p>
                </CardContent>
              </Card>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Sentiment Pie */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <ThumbsUp className="h-4 w-4 text-primary" />
                    Duygu Dağılımı
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-56">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={sentimentPieData}
                          cx="50%"
                          cy="50%"
                          innerRadius={55}
                          outerRadius={85}
                          paddingAngle={4}
                          dataKey="value"
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                          {sentimentPieData.map((entry, i) => (
                            <Cell key={i} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Rating Distribution */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Star className="h-4 w-4 text-primary" />
                    Puan Dağılımı
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-56">
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
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-primary" />
                    Aylık Yorum Trendi
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-56">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={monthlyData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis yAxisId="left" />
                        <YAxis yAxisId="right" orientation="right" domain={[0, 5]} />
                        <Tooltip />
                        <Legend />
                        <Bar yAxisId="left" dataKey="count" name="Yorum" fill={COLORS.primary} radius={[4, 4, 0, 0]} />
                        <Line yAxisId="right" type="monotone" dataKey="avgRating" name="Ort. Puan" stroke={COLORS.positive} strokeWidth={2} dot />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Sentiment Trend */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <BarChart3 className="h-4 w-4 text-primary" />
                    Duygu Trendi
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-56">
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

            {/* Platform Breakdown */}
            {platformData.length > 1 && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <BarChart3 className="h-4 w-4 text-primary" />
                    Platform Dağılımı
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={platformData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="count" name="Yorum" fill={COLORS.secondary} radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* AI Report */}
            {aiReport && (
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Brain className="h-4 w-4 text-primary" />
                      AI İşletme Analiz Raporu
                    </CardTitle>
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

            {/* Footer */}
            <div className="flex items-center justify-between pt-4 border-t text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <img src={logo} alt="VoyageRespond" className="h-5 w-5" />
                <span>VoyageRespond ile oluşturulmuştur</span>
              </div>
              <span>{format(new Date(), "dd MMM yyyy HH:mm", { locale: tr })}</span>
            </div>
          </>
        )}
      </div>

      {/* Email Dialog */}
      <Dialog open={emailDialogOpen} onOpenChange={setEmailDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Raporu E-posta ile Gönder</DialogTitle>
            <DialogDescription>
              Rapor, seçili tarih aralığındaki metrikleri ve AI analizini (varsa) içerecektir.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium mb-1.5 block">Alıcı E-posta</label>
              <Input
                type="email"
                value={emailTo}
                onChange={(e) => setEmailTo(e.target.value)}
                placeholder="ornek@email.com"
              />
            </div>
            <div className="bg-muted/50 rounded-lg p-3 text-sm text-muted-foreground">
              <p className="font-medium text-foreground mb-1">Rapor İçeriği:</p>
              <ul className="list-disc list-inside space-y-0.5">
                <li>Genel metrikler (puan, yorum sayısı, yanıt oranı)</li>
                <li>Duygu dağılımı</li>
                <li>Platform dağılımı</li>
                {aiReport && <li>AI analiz raporu</li>}
              </ul>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEmailDialogOpen(false)}>
              İptal
            </Button>
            <Button onClick={handleSendEmail} disabled={!emailTo || isSendingEmail} className="gap-2">
              {isSendingEmail ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
              Gönder
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
