import { useState, useMemo, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import {
  FileDown, Mail, CalendarIcon, Star, MessageSquare, Send, AlertTriangle,
  TrendingUp, TrendingDown, Minus, BarChart3, Brain, Loader2, CheckCircle2,
  Building2, Filter, Languages, FileText, ArrowRight,
} from "lucide-react";
import { useBusiness } from "@/contexts/BusinessContext";
import { useQuery, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, LineChart, Line,
} from "recharts";
import { format, startOfMonth, eachMonthOfInterval, isWithinInterval, subDays, startOfDay, endOfDay, startOfMonth as som, endOfMonth as eom } from "date-fns";
import { tr, enUS } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import logo from "@/assets/logo.png";

// ---------- constants ----------
const CHART = {
  primary: "#7A5AF8",
  primarySoft: "#B9A6FF",
  ink: "#111827",
  positive: "#059669",
  neutral: "#D97706",
  negative: "#DC2626",
  grid: "#E5E7EB",
};

const PLATFORM_LABEL: Record<string, string> = {
  google: "Google",
  booking: "Booking",
  tripadvisor: "TripAdvisor",
  expedia: "Expedia",
  hotelscom: "Hotels.com",
  yandex: "Yandex",
  trustpilot: "Trustpilot",
};

type Lang = "tr" | "en";
type ReportType = "executive" | "detailed" | "competitor";
type Preset = "7" | "30" | "this_month" | "last_month" | "custom";

const t = (lang: Lang, k: string) => {
  const dict: Record<string, { tr: string; en: string }> = {
    title: { tr: "Rapor Oluştur", en: "Generate Report" },
    subtitle: { tr: "Kurumsal düzeyde yorum analiz raporu", en: "Enterprise-grade review analysis report" },
    config: { tr: "Rapor Yapılandırması", en: "Report Configuration" },
    dateRange: { tr: "Tarih Aralığı", en: "Date Range" },
    platforms: { tr: "Platformlar", en: "Platforms" },
    allPlatforms: { tr: "Tüm platformlar", en: "All platforms" },
    location: { tr: "Şube / Lokasyon", en: "Location" },
    reportType: { tr: "Rapor Tipi", en: "Report Type" },
    executive: { tr: "Yönetici Özeti", en: "Executive Summary" },
    detailed: { tr: "Detaylı Analiz", en: "Detailed Analysis" },
    competitor: { tr: "Rakip Karşılaştırma", en: "Competitor Benchmark" },
    language: { tr: "Rapor Dili", en: "Report Language" },
    includeReviews: { tr: "Yorumları rapora ekle", en: "Include reviews in report" },
    includeReviewsHint: { tr: "Yorumların tam metni ekte yer alır.", en: "Full review texts will be appended." },
    generate: { tr: "Rapor Oluştur", en: "Generate Report" },
    generating: { tr: "Oluşturuluyor...", en: "Generating..." },
    downloadPdf: { tr: "PDF İndir", en: "Download PDF" },
    sendEmail: { tr: "E-posta Gönder", en: "Send Email" },
    preview: { tr: "Rapor Önizlemesi", en: "Report Preview" },
    p1: { tr: "Yorumlar toplanıyor", en: "Collecting reviews" },
    p2: { tr: "Veri analiz ediliyor", en: "Analyzing data" },
    p3: { tr: "Rapor yazılıyor", en: "Composing report" },
    empty: { tr: "Yapılandırmayı tamamlayıp rapor oluşturun.", en: "Configure and generate the report." },
    noData: { tr: "Seçili dönemde yorum bulunamadı.", en: "No reviews found in the selected period." },
    coverPeriod: { tr: "Rapor Dönemi", en: "Reporting Period" },
    generatedAt: { tr: "Oluşturma Tarihi", en: "Generated" },
    reportOf: { tr: "Yorum Performans Raporu", en: "Review Performance Report" },
    execSummary: { tr: "Yönetici Özeti", en: "Executive Summary" },
    kpis: { tr: "Temel Göstergeler", en: "Key Performance Indicators" },
    totalReviews: { tr: "Toplam Yorum", en: "Total Reviews" },
    avgRating: { tr: "Ortalama Puan", en: "Average Rating" },
    replyRate: { tr: "Yanıt Oranı", en: "Reply Rate" },
    avgResponse: { tr: "Ort. Yanıt Süresi", en: "Avg. Response Time" },
    pending: { tr: "Bekleyen Yanıt", en: "Pending Replies" },
    sentimentDist: { tr: "Duygu Dağılımı", en: "Sentiment Distribution" },
    ratingTrend: { tr: "Puan Trendi", en: "Rating Trend" },
    platformDist: { tr: "Platform Dağılımı", en: "Platform Distribution" },
    strengths: { tr: "Öne Çıkan Güçlü Yönler", en: "Recurring Strengths" },
    improvements: { tr: "İyileştirme Alanları", en: "Improvement Areas" },
    actions: { tr: "Öncelikli Aksiyon Önerileri", en: "Priority Action Items" },
    reviewsAppendix: { tr: "Ek: Dönem Yorumları", en: "Appendix: Period Reviews" },
    impact: { tr: "Etki", en: "Impact" },
    effort: { tr: "Çaba", en: "Effort" },
    high: { tr: "Yüksek", en: "High" },
    medium: { tr: "Orta", en: "Medium" },
    low: { tr: "Düşük", en: "Low" },
    positive: { tr: "Pozitif", en: "Positive" },
    neutral: { tr: "Nötr", en: "Neutral" },
    negative: { tr: "Negatif", en: "Negative" },
    mentions: { tr: "geçme", en: "mentions" },
    vsPrev: { tr: "önceki döneme göre", en: "vs. previous period" },
    footer: { tr: "VoyageRespond • Kurumsal Yorum Yönetimi", en: "VoyageRespond • Enterprise Review Management" },
    page: { tr: "Sayfa", en: "Page" },
    preset7: { tr: "Son 7 gün", en: "Last 7 days" },
    preset30: { tr: "Son 30 gün", en: "Last 30 days" },
    presetThis: { tr: "Bu ay", en: "This month" },
    presetLast: { tr: "Geçen ay", en: "Last month" },
    presetCustom: { tr: "Özel", en: "Custom" },
    emailTo: { tr: "Alıcı E-posta", en: "Recipient Email" },
    cancel: { tr: "İptal", en: "Cancel" },
    send: { tr: "Gönder", en: "Send" },
    sendDialogTitle: { tr: "Raporu E-posta ile Gönder", en: "Send Report via Email" },
    sendDialogDesc: { tr: "Rapor, seçili yapılandırmayla PDF olarak gönderilir.", en: "The report will be sent as PDF with the selected configuration." },
  };
  return dict[k]?.[lang] ?? k;
};

// ---------- delta chip ----------
function DeltaChip({ value, invert = false }: { value: number | null | undefined; invert?: boolean }) {
  if (value === null || value === undefined || !isFinite(value)) {
    return <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground"><Minus className="h-3 w-3" />—</span>;
  }
  const up = value > 0;
  const positive = invert ? !up : up;
  const color = value === 0 ? "text-muted-foreground" : positive ? "text-emerald-600" : "text-rose-600";
  const Icon = value === 0 ? Minus : up ? TrendingUp : TrendingDown;
  return (
    <span className={cn("inline-flex items-center gap-1 text-[11px] font-medium", color)}>
      <Icon className="h-3 w-3" />
      {Math.abs(value).toFixed(0)}%
    </span>
  );
}

// ---------- main ----------
export default function Report() {
  const { activeBusiness, businesses } = useBusiness();
  const previewRef = useRef<HTMLDivElement>(null);

  // config state
  const [lang, setLang] = useState<Lang>("tr");
  const [reportType, setReportType] = useState<ReportType>("executive");
  const [preset, setPreset] = useState<Preset>("30");
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
    from: subDays(new Date(), 30),
    to: new Date(),
  });
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [locationId, setLocationId] = useState<string>("current");
  const [includeReviews, setIncludeReviews] = useState(false);

  // report state
  const [aiPayload, setAiPayload] = useState<any | null>(null);
  const [step, setStep] = useState<0 | 1 | 2 | 3>(0);

  const [isExporting, setIsExporting] = useState(false);
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const [emailTo, setEmailTo] = useState("");
  const [isSendingEmail, setIsSendingEmail] = useState(false);

  const locale = lang === "tr" ? tr : enUS;

  // sibling locations
  const locations = useMemo(() => {
    if (!activeBusiness) return [];
    return businesses.filter(b => b.id === activeBusiness.id || b.parent_business_id === activeBusiness.id);
  }, [businesses, activeBusiness]);

  const targetBusinessId = locationId === "current" ? activeBusiness?.id : locationId;

  // preset -> daterange
  useEffect(() => {
    if (preset === "custom") return;
    const now = new Date();
    if (preset === "7") setDateRange({ from: subDays(now, 7), to: now });
    else if (preset === "30") setDateRange({ from: subDays(now, 30), to: now });
    else if (preset === "this_month") setDateRange({ from: som(now), to: now });
    else if (preset === "last_month") {
      const lm = subDays(som(now), 1);
      setDateRange({ from: som(lm), to: eom(lm) });
    }
  }, [preset]);

  // fetch reviews for preview
  const { data: allReviews = [], isLoading: reviewsLoading } = useQuery({
    queryKey: ["report-reviews", targetBusinessId],
    queryFn: async () => {
      if (!targetBusinessId) return [];
      const { data, error } = await supabase
        .from("reviews")
        .select("*")
        .eq("business_id", targetBusinessId)
        .order("posted_at", { ascending: true });
      if (error) throw error;
      return data || [];
    },
    enabled: !!targetBusinessId,
  });

  const reviews = useMemo(() => {
    return allReviews.filter((r) => {
      const d = new Date(r.posted_at);
      const inRange = isWithinInterval(d, { start: startOfDay(dateRange.from), end: endOfDay(dateRange.to) });
      const platformOk = selectedPlatforms.length === 0 || selectedPlatforms.includes(r.platform);
      return inRange && platformOk;
    });
  }, [allReviews, dateRange, selectedPlatforms]);

  const availablePlatforms = useMemo(() => {
    const set = new Set<string>();
    allReviews.forEach((r: any) => set.add(r.platform));
    return Array.from(set);
  }, [allReviews]);

  // generate
  const generateMutation = useMutation({
    mutationFn: async () => {
      if (!targetBusinessId) throw new Error("No business");
      setStep(1);
      await new Promise(r => setTimeout(r, 400));
      setStep(2);
      const response = await supabase.functions.invoke("business-analysis", {
        body: {
          business_id: targetBusinessId,
          start_date: startOfDay(dateRange.from).toISOString(),
          end_date: endOfDay(dateRange.to).toISOString(),
          platforms: selectedPlatforms.length > 0 ? selectedPlatforms : undefined,
          language: lang,
          report_type: reportType,
        },
      });
      setStep(3);
      if (response.error) throw new Error(response.error.message);
      return response.data;
    },
    onSuccess: (data) => {
      setAiPayload(data);
      setStep(0);
    },
    onError: (err: any) => {
      setStep(0);
      toast({ title: lang === "tr" ? "Hata" : "Error", description: err.message, variant: "destructive" });
    },
  });

  // stats (from live reviews for immediate preview; ai overrides once loaded)
  const stats = useMemo(() => {
    if (!reviews.length) return null;
    const total = reviews.length;
    const avg = reviews.reduce((s, r) => s + r.rating, 0) / total;
    const sent = {
      positive: reviews.filter((r) => r.sentiment === "positive").length,
      neutral: reviews.filter((r) => r.sentiment === "neutral").length,
      negative: reviews.filter((r) => r.sentiment === "negative").length,
    };
    const replied = reviews.filter((r) => r.status === "replied").length;
    const pending = reviews.filter((r) => !r.status || r.status === "pending_reply").length;
    const replyRate = total > 0 ? (replied / total) * 100 : 0;
    const platformCounts: Record<string, number> = {};
    reviews.forEach((r) => (platformCounts[r.platform] = (platformCounts[r.platform] || 0) + 1));
    return { total, avg, sent, replied, pending, replyRate, platformCounts };
  }, [reviews]);

  const effectiveStats = aiPayload?.stats ? {
    total: aiPayload.stats.totalReviews,
    avg: aiPayload.stats.avgRating,
    sent: aiPayload.stats.sentimentCounts,
    replied: aiPayload.stats.repliedCount,
    pending: aiPayload.stats.pendingCount,
    replyRate: aiPayload.stats.replyRate,
    platformCounts: aiPayload.stats.platformCounts,
    avgResponseTimeHours: aiPayload.stats.avgResponseTimeHours,
  } : stats;

  const deltas = aiPayload?.deltas;

  // charts data
  const sentimentPie = useMemo(() => {
    if (!effectiveStats) return [];
    return [
      { name: t(lang, "positive"), value: effectiveStats.sent.positive, color: CHART.positive },
      { name: t(lang, "neutral"), value: effectiveStats.sent.neutral, color: CHART.neutral },
      { name: t(lang, "negative"), value: effectiveStats.sent.negative, color: CHART.negative },
    ];
  }, [effectiveStats, lang]);

  const monthlyTrend = useMemo(() => {
    if (!reviews.length) return [];
    const months = eachMonthOfInterval({ start: startOfMonth(dateRange.from), end: startOfMonth(dateRange.to) });
    return months.map((m) => {
      const end = new Date(m.getFullYear(), m.getMonth() + 1, 0);
      const mReviews = reviews.filter((r) => { const d = new Date(r.posted_at); return d >= m && d <= end; });
      const avg = mReviews.length > 0 ? mReviews.reduce((s, r) => s + r.rating, 0) / mReviews.length : 0;
      return { month: format(m, "MMM yy", { locale }), avg: parseFloat(avg.toFixed(2)), count: mReviews.length };
    });
  }, [reviews, dateRange, locale]);

  const platformBar = useMemo(() => {
    if (!effectiveStats?.platformCounts) return [];
    return Object.entries(effectiveStats.platformCounts).map(([k, v]: any) => ({
      name: PLATFORM_LABEL[k] || k, count: v,
    }));
  }, [effectiveStats]);

  // PDF export — per-section rendering to avoid mid-chart breaks
  const handleExportPDF = async () => {
    if (!previewRef.current) return;
    setIsExporting(true);
    try {
      const html2canvas = (await import("html2canvas")).default;
      const { jsPDF } = await import("jspdf");
      const pdf = new jsPDF("p", "mm", "a4");
      const pageW = pdf.internal.pageSize.getWidth();
      const pageH = pdf.internal.pageSize.getHeight();
      const marginX = 12;
      const marginY = 14;
      const usableW = pageW - marginX * 2;
      const usableH = pageH - marginY * 2 - 8; // reserve footer

      const sections = Array.from(previewRef.current.querySelectorAll<HTMLElement>("[data-pdf-section]"));
      let pageNum = 0;
      let cursorY = marginY;
      let first = true;

      const drawFooter = (n: number) => {
        const business = activeBusiness?.name || "";
        pdf.setFontSize(8);
        pdf.setTextColor(120);
        pdf.text(`${business}  •  ${t(lang, "footer")}`, marginX, pageH - 6);
        pdf.text(`${t(lang, "page")} ${n}`, pageW - marginX, pageH - 6, { align: "right" });
        pdf.setTextColor(0);
      };

      for (let i = 0; i < sections.length; i++) {
        const el = sections[i];
        const forcePage = el.dataset.pdfPage === "true";
        const canvas = await html2canvas(el, { scale: 2, useCORS: true, backgroundColor: "#ffffff", logging: false });
        const imgData = canvas.toDataURL("image/png");
        const imgW = usableW;
        const imgH = (canvas.height * imgW) / canvas.width;

        if (first || forcePage || cursorY + imgH > marginY + usableH) {
          if (!first) drawFooter(pageNum);
          if (!first) pdf.addPage();
          pageNum += 1;
          cursorY = marginY;
          first = false;
        }

        // if a single section is taller than a page, scale it to fit
        if (imgH > usableH) {
          const scaledH = usableH;
          const scaledW = (canvas.width * scaledH) / canvas.height;
          const centerX = marginX + (usableW - scaledW) / 2;
          pdf.addImage(imgData, "PNG", centerX, cursorY, scaledW, scaledH);
          cursorY += scaledH + 6;
        } else {
          pdf.addImage(imgData, "PNG", marginX, cursorY, imgW, imgH);
          cursorY += imgH + 6;
        }
      }
      drawFooter(pageNum);

      const fileName = `${activeBusiness?.name || "rapor"}-${format(dateRange.from, "yyyy-MM-dd")}-${format(dateRange.to, "yyyy-MM-dd")}.pdf`;
      pdf.save(fileName);
      toast({ title: lang === "tr" ? "PDF İndirildi" : "PDF Downloaded", description: fileName });
    } catch (err) {
      console.error("PDF export error:", err);
      toast({ title: lang === "tr" ? "Hata" : "Error", description: lang === "tr" ? "PDF oluşturulamadı." : "Failed to build PDF.", variant: "destructive" });
    } finally {
      setIsExporting(false);
    }
  };

  // Email — send an HTML summary via existing send-customer-email
  const handleSendEmail = async () => {
    if (!emailTo || !activeBusiness || !effectiveStats) return;
    setIsSendingEmail(true);
    try {
      const html = buildEmailHtml({
        business: activeBusiness.name,
        lang,
        stats: effectiveStats,
        period: dateRange,
        structured: aiPayload?.structured,
        includeReviews,
        reviews,
      });
      const { error } = await supabase.functions.invoke("send-customer-email", {
        body: {
          business_id: activeBusiness.id,
          recipients: [{ email: emailTo }],
          subject: `${activeBusiness.name} — ${t(lang, "reportOf")} (${format(dateRange.from, "dd MMM yyyy", { locale })} – ${format(dateRange.to, "dd MMM yyyy", { locale })})`,
          body_html: html,
        },
      });
      if (error) throw error;
      toast({ title: lang === "tr" ? "Gönderildi" : "Sent", description: emailTo });
      setEmailDialogOpen(false);
      setEmailTo("");
    } catch (err: any) {
      toast({ title: lang === "tr" ? "Hata" : "Error", description: err.message, variant: "destructive" });
    } finally {
      setIsSendingEmail(false);
    }
  };

  if (!activeBusiness) {
    return <div className="p-8"><Card className="p-12 text-center"><p className="text-muted-foreground">{lang === "tr" ? "İşletme seçilmedi." : "No business selected."}</p></Card></div>;
  }

  const structured = aiPayload?.structured;

  return (
    <div className="min-h-screen bg-muted/20">
      <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-0 min-h-screen">
        {/* ------- LEFT: CONFIG PANEL ------- */}
        <aside className="border-r border-border bg-card lg:sticky lg:top-0 lg:h-screen lg:overflow-y-auto">
          <div className="p-6 space-y-6">
            <div>
              <h1 className="text-xl font-semibold text-foreground tracking-tight">{t(lang, "title")}</h1>
              <p className="text-sm text-muted-foreground mt-1">{t(lang, "subtitle")}</p>
            </div>

            <div className="space-y-5">
              {/* Date range */}
              <ConfigGroup icon={CalendarIcon} label={t(lang, "dateRange")}>
                <Select value={preset} onValueChange={(v) => setPreset(v as Preset)}>
                  <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7">{t(lang, "preset7")}</SelectItem>
                    <SelectItem value="30">{t(lang, "preset30")}</SelectItem>
                    <SelectItem value="this_month">{t(lang, "presetThis")}</SelectItem>
                    <SelectItem value="last_month">{t(lang, "presetLast")}</SelectItem>
                    <SelectItem value="custom">{t(lang, "presetCustom")}</SelectItem>
                  </SelectContent>
                </Select>
                {preset === "custom" && (
                  <div className="flex items-center gap-2 mt-2">
                    <DatePick date={dateRange.from} onChange={(d) => setDateRange(p => ({ ...p, from: d }))} locale={locale} />
                    <span className="text-muted-foreground">—</span>
                    <DatePick date={dateRange.to} onChange={(d) => setDateRange(p => ({ ...p, to: d }))} locale={locale} />
                  </div>
                )}
                <p className="text-[11px] text-muted-foreground mt-2">
                  {format(dateRange.from, "dd MMM yyyy", { locale })} – {format(dateRange.to, "dd MMM yyyy", { locale })}
                </p>
              </ConfigGroup>

              {/* Platforms */}
              <ConfigGroup icon={Filter} label={t(lang, "platforms")}>
                {availablePlatforms.length === 0 ? (
                  <p className="text-xs text-muted-foreground">—</p>
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    {availablePlatforms.map((p) => {
                      const on = selectedPlatforms.includes(p);
                      return (
                        <button
                          key={p}
                          type="button"
                          onClick={() => setSelectedPlatforms(s => s.includes(p) ? s.filter(x => x !== p) : [...s, p])}
                          className={cn(
                            "px-2.5 py-1 rounded-md text-xs font-medium border transition-colors",
                            on ? "bg-primary text-primary-foreground border-primary" : "bg-background text-foreground border-border hover:border-primary/40"
                          )}
                        >
                          {PLATFORM_LABEL[p] || p}
                        </button>
                      );
                    })}
                  </div>
                )}
                <p className="text-[11px] text-muted-foreground mt-2">
                  {selectedPlatforms.length === 0 ? t(lang, "allPlatforms") : `${selectedPlatforms.length} seçili`}
                </p>
              </ConfigGroup>

              {/* Location */}
              {locations.length > 1 && (
                <ConfigGroup icon={Building2} label={t(lang, "location")}>
                  <Select value={locationId} onValueChange={setLocationId}>
                    <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="current">{activeBusiness.name}</SelectItem>
                      {locations.filter(l => l.id !== activeBusiness.id).map((l) => (
                        <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </ConfigGroup>
              )}

              {/* Report type */}
              <ConfigGroup icon={FileText} label={t(lang, "reportType")}>
                <div className="space-y-1.5">
                  {(["executive", "detailed", "competitor"] as ReportType[]).map((rt) => (
                    <button
                      key={rt}
                      type="button"
                      onClick={() => setReportType(rt)}
                      className={cn(
                        "w-full text-left px-3 py-2 rounded-md text-xs border transition-colors",
                        reportType === rt ? "bg-primary/5 border-primary/40 text-foreground" : "bg-background border-border hover:border-primary/30 text-muted-foreground"
                      )}
                    >
                      <span className="font-medium text-foreground">{t(lang, rt)}</span>
                    </button>
                  ))}
                </div>
              </ConfigGroup>

              {/* Language */}
              <ConfigGroup icon={Languages} label={t(lang, "language")}>
                <div className="inline-flex rounded-md border border-border overflow-hidden">
                  {(["tr", "en"] as Lang[]).map((l) => (
                    <button
                      key={l}
                      type="button"
                      onClick={() => setLang(l)}
                      className={cn(
                        "px-3 py-1.5 text-xs font-medium transition-colors",
                        lang === l ? "bg-primary text-primary-foreground" : "bg-background text-foreground hover:bg-muted"
                      )}
                    >
                      {l.toUpperCase()}
                    </button>
                  ))}
                </div>
              </ConfigGroup>

              {/* Include reviews toggle */}
              <div className="flex items-start justify-between gap-3 rounded-md border border-border p-3">
                <div className="flex-1">
                  <Label htmlFor="inc-rev" className="text-xs font-medium">{t(lang, "includeReviews")}</Label>
                  <p className="text-[11px] text-muted-foreground mt-0.5">{t(lang, "includeReviewsHint")}</p>
                </div>
                <Switch id="inc-rev" checked={includeReviews} onCheckedChange={setIncludeReviews} />
              </div>
            </div>

            <Button
              onClick={() => generateMutation.mutate()}
              disabled={generateMutation.isPending || !reviews.length}
              className="w-full h-11 gap-2 font-medium"
              size="lg"
            >
              {generateMutation.isPending
                ? <><Loader2 className="h-4 w-4 animate-spin" />{t(lang, "generating")}</>
                : <><Brain className="h-4 w-4" />{t(lang, "generate")}</>}
            </Button>

            {/* Progress steps */}
            {step > 0 && (
              <div className="space-y-2 pt-2 border-t border-border">
                {[1, 2, 3].map((n) => {
                  const active = step === n;
                  const done = step > n;
                  return (
                    <div key={n} className="flex items-center gap-2 text-xs">
                      <div className={cn(
                        "h-5 w-5 rounded-full flex items-center justify-center text-[10px] font-semibold",
                        done ? "bg-emerald-500/15 text-emerald-600" : active ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground"
                      )}>
                        {done ? <CheckCircle2 className="h-3 w-3" /> : active ? <Loader2 className="h-3 w-3 animate-spin" /> : n}
                      </div>
                      <span className={cn(active ? "text-foreground font-medium" : done ? "text-muted-foreground" : "text-muted-foreground/60")}>
                        {t(lang, `p${n}` as any)}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </aside>

        {/* ------- RIGHT: PREVIEW ------- */}
        <section className="flex flex-col min-h-screen">
          {/* Sticky action bar */}
          <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border px-6 py-3 flex items-center justify-between">
            <div className="text-xs text-muted-foreground uppercase tracking-wider font-medium">{t(lang, "preview")}</div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setEmailDialogOpen(true)}
                disabled={!effectiveStats}
                className="gap-2"
              >
                <Mail className="h-3.5 w-3.5" />
                {t(lang, "sendEmail")}
              </Button>
              <Button
                size="sm"
                onClick={handleExportPDF}
                disabled={isExporting || !effectiveStats}
                className="gap-2"
              >
                {isExporting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <FileDown className="h-3.5 w-3.5" />}
                {t(lang, "downloadPdf")}
              </Button>
            </div>
          </div>

          {/* Preview canvas */}
          <div className="flex-1 p-6 lg:p-10 overflow-x-hidden">
            <div ref={previewRef} className="mx-auto max-w-[820px] space-y-6">
              {reviewsLoading ? (
                <PreviewSkeleton />
              ) : !effectiveStats ? (
                <div className="rounded-xl border border-dashed border-border bg-card p-16 text-center">
                  <FileText className="h-12 w-12 mx-auto text-muted-foreground/40 mb-4" />
                  <p className="text-sm text-muted-foreground">{reviews.length ? t(lang, "empty") : t(lang, "noData")}</p>
                </div>
              ) : (
                <>
                  {/* COVER */}
                  <div data-pdf-section data-pdf-page="true" className="rounded-xl border border-border bg-card overflow-hidden">
                    <div className="h-2 bg-gradient-to-r from-primary via-primary/70 to-primary/30" />
                    <div className="p-10 space-y-10">
                      <div className="flex items-center gap-3">
                        <img src={logo} alt="VoyageRespond" className="h-9 w-9" />
                        <div className="text-sm text-muted-foreground font-medium tracking-wide">VoyageRespond</div>
                      </div>
                      <div className="space-y-3 py-8">
                        <div className="text-xs uppercase tracking-widest text-primary font-semibold">{t(lang, "reportOf")}</div>
                        <h2 className="text-3xl md:text-4xl font-semibold text-foreground tracking-tight leading-tight">
                          {activeBusiness.name}
                        </h2>
                        <p className="text-sm text-muted-foreground">{t(lang, reportType)}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-6 pt-6 border-t border-border">
                        <div>
                          <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-1">{t(lang, "coverPeriod")}</div>
                          <div className="text-sm font-medium text-foreground">
                            {format(dateRange.from, "dd MMM yyyy", { locale })} – {format(dateRange.to, "dd MMM yyyy", { locale })}
                          </div>
                        </div>
                        <div>
                          <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-1">{t(lang, "generatedAt")}</div>
                          <div className="text-sm font-medium text-foreground">
                            {format(new Date(), "dd MMM yyyy, HH:mm", { locale })}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* EXECUTIVE SUMMARY */}
                  {structured?.executiveSummary?.length > 0 && (
                    <SectionCard title={t(lang, "execSummary")} data-pdf-section data-pdf-page="true">
                      <ul className="space-y-2.5">
                        {structured.executiveSummary.map((b: string, i: number) => (
                          <li key={i} className="flex gap-3 text-sm text-foreground/90 leading-relaxed">
                            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                            <span>{b}</span>
                          </li>
                        ))}
                      </ul>
                    </SectionCard>
                  )}

                  {/* KPIs */}
                  <div data-pdf-section>
                    <SectionHeader label={t(lang, "kpis")} />
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <KpiCard label={t(lang, "totalReviews")} value={String(effectiveStats.total)} delta={deltas?.totalReviews} />
                      <KpiCard label={t(lang, "avgRating")} value={effectiveStats.avg.toFixed(2)} suffix="/5" delta={deltas?.avgRating} icon={Star} />
                      <KpiCard label={t(lang, "replyRate")} value={`${effectiveStats.replyRate.toFixed(0)}%`} delta={deltas?.replyRate} />
      <KpiCard label={t(lang, "avgResponse")} value={(effectiveStats as any).avgResponseTimeHours != null ? `${(effectiveStats as any).avgResponseTimeHours}h` : "—"} />
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
                      <KpiMini label={t(lang, "positive")} value={effectiveStats.sent.positive} color={CHART.positive} />
                      <KpiMini label={t(lang, "neutral")} value={effectiveStats.sent.neutral} color={CHART.neutral} />
                      <KpiMini label={t(lang, "negative")} value={effectiveStats.sent.negative} color={CHART.negative} />
                      <KpiMini label={t(lang, "pending")} value={effectiveStats.pending} color={CHART.primary} />
                    </div>
                  </div>

                  {/* CHARTS */}
                  <div data-pdf-section data-pdf-page="true">
                    <SectionHeader label={t(lang, "sentimentDist")} />
                    <ChartCard>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                        <div className="h-56">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie data={sentimentPie} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={2} dataKey="value">
                                {sentimentPie.map((e, i) => <Cell key={i} fill={e.color} />)}
                              </Pie>
                              <Tooltip />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                        <div className="space-y-3">
                          {sentimentPie.map((s) => {
                            const total = sentimentPie.reduce((a, b) => a + b.value, 0);
                            const pct = total > 0 ? (s.value / total) * 100 : 0;
                            return (
                              <div key={s.name}>
                                <div className="flex justify-between text-xs mb-1">
                                  <span className="text-foreground/90 font-medium">{s.name}</span>
                                  <span className="text-muted-foreground">{s.value} • {pct.toFixed(0)}%</span>
                                </div>
                                <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                                  <div className="h-full rounded-full" style={{ width: `${pct}%`, background: s.color }} />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </ChartCard>
                  </div>

                  {monthlyTrend.length > 1 && (
                    <div data-pdf-section>
                      <SectionHeader label={t(lang, "ratingTrend")} />
                      <ChartCard>
                        <div className="h-64">
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={monthlyTrend} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                              <CartesianGrid strokeDasharray="3 3" stroke={CHART.grid} />
                              <XAxis dataKey="month" stroke="#6B7280" fontSize={11} />
                              <YAxis domain={[0, 5]} stroke="#6B7280" fontSize={11} />
                              <Tooltip />
                              <Line type="monotone" dataKey="avg" stroke={CHART.primary} strokeWidth={2} dot={{ r: 3, fill: CHART.primary }} />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>
                      </ChartCard>
                    </div>
                  )}

                  {platformBar.length > 1 && (
                    <div data-pdf-section>
                      <SectionHeader label={t(lang, "platformDist")} />
                      <ChartCard>
                        <div className="h-56">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={platformBar} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                              <CartesianGrid strokeDasharray="3 3" stroke={CHART.grid} />
                              <XAxis dataKey="name" stroke="#6B7280" fontSize={11} />
                              <YAxis stroke="#6B7280" fontSize={11} />
                              <Tooltip />
                              <Bar dataKey="count" fill={CHART.primary} radius={[4, 4, 0, 0]} />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </ChartCard>
                    </div>
                  )}

                  {/* STRENGTHS & IMPROVEMENTS */}
                  {(structured?.strengths?.length > 0 || structured?.improvements?.length > 0) && (
                    <div data-pdf-section data-pdf-page="true" className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {structured?.strengths?.length > 0 && (
                        <ThemeList
                          title={t(lang, "strengths")}
                          accent={CHART.positive}
                          items={structured.strengths}
                          mentionsLabel={t(lang, "mentions")}
                        />
                      )}
                      {structured?.improvements?.length > 0 && (
                        <ThemeList
                          title={t(lang, "improvements")}
                          accent={CHART.negative}
                          items={structured.improvements}
                          mentionsLabel={t(lang, "mentions")}
                        />
                      )}
                    </div>
                  )}

                  {/* ACTIONS */}
                  {structured?.actions?.length > 0 && (
                    <div data-pdf-section data-pdf-page="true">
                      <SectionHeader label={t(lang, "actions")} />
                      <div className="space-y-2">
                        {structured.actions.map((a: any, i: number) => (
                          <div key={i} className="rounded-lg border border-border bg-card p-4">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex items-start gap-3 flex-1 min-w-0">
                                <div className="mt-1 h-6 w-6 rounded-md bg-primary/10 text-primary text-xs font-semibold flex items-center justify-center shrink-0">
                                  {i + 1}
                                </div>
                                <div className="min-w-0">
                                  <div className="text-sm font-semibold text-foreground">{a.title}</div>
                                  <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{a.description}</p>
                                </div>
                              </div>
                              <div className="flex flex-col gap-1 items-end shrink-0">
                                <ImpactBadge type="impact" value={a.impact} lang={lang} />
                                <ImpactBadge type="effort" value={a.effort} lang={lang} />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* REVIEWS APPENDIX */}
                  {includeReviews && reviews.length > 0 && (
                    <div data-pdf-section data-pdf-page="true">
                      <SectionHeader label={`${t(lang, "reviewsAppendix")} (${reviews.length})`} />
                      <div className="rounded-xl border border-border bg-card divide-y divide-border">
                        {reviews.map((r: any) => (
                          <div key={r.id} className="p-4">
                            <div className="flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground mb-1.5">
                              <Badge variant="outline" className="text-[10px] capitalize font-normal">{PLATFORM_LABEL[r.platform] || r.platform}</Badge>
                              <span className="flex items-center gap-0.5 text-amber-500">
                                {Array.from({ length: r.rating }).map((_, i) => <Star key={i} className="h-3 w-3 fill-current" />)}
                              </span>
                              <span>•</span>
                              <span>{format(new Date(r.posted_at), "dd MMM yyyy", { locale })}</span>
                              {r.reviewer_name && <><span>•</span><span>{r.reviewer_name}</span></>}
                            </div>
                            {(r.content || r.text) && (
                              <p className="text-sm text-foreground/90 whitespace-pre-wrap leading-relaxed">{r.content || r.text}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </section>
      </div>

      {/* Email dialog */}
      <Dialog open={emailDialogOpen} onOpenChange={setEmailDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t(lang, "sendDialogTitle")}</DialogTitle>
            <DialogDescription>{t(lang, "sendDialogDesc")}</DialogDescription>
          </DialogHeader>
          <div className="py-2 space-y-3">
            <Label className="text-sm">{t(lang, "emailTo")}</Label>
            <Input type="email" value={emailTo} onChange={(e) => setEmailTo(e.target.value)} placeholder="ornek@email.com" />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEmailDialogOpen(false)}>{t(lang, "cancel")}</Button>
            <Button onClick={handleSendEmail} disabled={!emailTo || isSendingEmail} className="gap-2">
              {isSendingEmail ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              {t(lang, "send")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ---------- subcomponents ----------
function ConfigGroup({ icon: Icon, label, children }: any) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">
        <Icon className="h-3 w-3" />
        {label}
      </div>
      {children}
    </div>
  );
}

function DatePick({ date, onChange, locale }: { date: Date; onChange: (d: Date) => void; locale: any }) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="flex-1 justify-start text-xs font-normal h-8">
          <CalendarIcon className="h-3 w-3 mr-1.5" />
          {format(date, "dd MMM yyyy", { locale })}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar mode="single" selected={date} onSelect={(d) => d && onChange(d)} className="p-3 pointer-events-auto" />
      </PopoverContent>
    </Popover>
  );
}

function SectionHeader({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 mb-3">
      <h3 className="text-sm font-semibold text-foreground tracking-tight uppercase">{label}</h3>
      <div className="flex-1 h-px bg-border" />
    </div>
  );
}

function SectionCard({ title, children, ...rest }: any) {
  return (
    <div {...rest} className="rounded-xl border border-border bg-card">
      <div className="px-6 pt-5 pb-3 border-b border-border">
        <div className="text-[11px] uppercase tracking-widest text-primary font-semibold">{title}</div>
      </div>
      <div className="px-6 py-5">{children}</div>
    </div>
  );
}

function ChartCard({ children }: any) {
  return <div className="rounded-xl border border-border bg-card p-5">{children}</div>;
}

function KpiCard({ label, value, suffix, delta, icon: Icon }: any) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">{label}</div>
        {Icon && <Icon className="h-3.5 w-3.5 text-primary/60" />}
      </div>
      <div className="flex items-baseline gap-1">
        <div className="text-2xl font-semibold text-foreground tracking-tight">{value}</div>
        {suffix && <div className="text-sm text-muted-foreground">{suffix}</div>}
      </div>
      {delta !== undefined && <div className="mt-1"><DeltaChip value={delta} /></div>}
    </div>
  );
}

function KpiMini({ label, value, color }: any) {
  return (
    <div className="rounded-lg border border-border bg-card px-3 py-2.5 flex items-center gap-2">
      <div className="h-8 w-1 rounded-full" style={{ background: color }} />
      <div className="flex-1">
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
        <div className="text-lg font-semibold text-foreground">{value}</div>
      </div>
    </div>
  );
}

function ImpactBadge({ type, value, lang }: { type: "impact" | "effort"; value?: string; lang: Lang }) {
  const label = t(lang, type);
  const v = (value || "medium").toLowerCase();
  const map: Record<string, { bg: string; text: string }> = {
    high: type === "impact"
      ? { bg: "bg-emerald-500/10", text: "text-emerald-700" }
      : { bg: "bg-rose-500/10", text: "text-rose-700" },
    medium: { bg: "bg-amber-500/10", text: "text-amber-700" },
    low: type === "impact"
      ? { bg: "bg-slate-500/10", text: "text-slate-700" }
      : { bg: "bg-emerald-500/10", text: "text-emerald-700" },
  };
  const style = map[v] || map.medium;
  const vLabel = v === "high" ? t(lang, "high") : v === "low" ? t(lang, "low") : t(lang, "medium");
  return (
    <span className={cn("text-[10px] font-medium px-2 py-0.5 rounded-md whitespace-nowrap", style.bg, style.text)}>
      {label}: {vLabel}
    </span>
  );
}

function ThemeList({ title, accent, items, mentionsLabel }: any) {
  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="px-5 py-3 border-b border-border flex items-center gap-2">
        <div className="h-2 w-2 rounded-full" style={{ background: accent }} />
        <div className="text-xs font-semibold text-foreground uppercase tracking-wider">{title}</div>
      </div>
      <div className="divide-y divide-border">
        {items.map((it: any, i: number) => (
          <div key={i} className="px-5 py-3.5">
            <div className="flex items-center justify-between gap-2 mb-1">
              <div className="text-sm font-semibold text-foreground">{it.topic}</div>
              {it.count > 0 && <div className="text-[11px] text-muted-foreground">{it.count} {mentionsLabel}</div>}
            </div>
            {it.description && <p className="text-xs text-muted-foreground leading-relaxed">{it.description}</p>}
            {it.quote && (
              <blockquote className="mt-2 pl-3 border-l-2 border-border text-xs text-foreground/80 italic">
                "{it.quote}"
              </blockquote>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function PreviewSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-56 w-full rounded-xl" />
      <div className="grid grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
      </div>
      <Skeleton className="h-64 w-full rounded-xl" />
      <Skeleton className="h-48 w-full rounded-xl" />
    </div>
  );
}

// ---------- email HTML ----------
function buildEmailHtml({ business, lang, stats, period, structured, includeReviews, reviews }: any) {
  const locale = lang === "tr" ? tr : enUS;
  const platformNames: Record<string, string> = PLATFORM_LABEL;

  const kpi = (label: string, value: string) => `
    <td style="padding:14px 16px;background:#F9FAFB;border-radius:10px;text-align:center;width:25%">
      <div style="font-size:11px;color:#6B7280;text-transform:uppercase;letter-spacing:.06em;margin-bottom:4px">${label}</div>
      <div style="font-size:22px;font-weight:600;color:#111827">${value}</div>
    </td>`;

  const list = (arr: any[]) =>
    (arr || []).map((b: any) => `<li style="margin:0 0 8px;padding-left:14px;text-indent:-14px;color:#374151;font-size:14px;line-height:1.55">• ${typeof b === "string" ? b : (b.topic || b.title || "")}${(b.description ? ` — <span style="color:#6B7280">${b.description}</span>` : "")}</li>`).join("");

  const reviewsBlock = includeReviews && reviews?.length ? `
  <h2 style="font-size:14px;color:#111827;margin:32px 0 12px;text-transform:uppercase;letter-spacing:.08em">${t(lang, "reviewsAppendix")} (${reviews.length})</h2>
  <div style="border:1px solid #E5E7EB;border-radius:10px">
    ${reviews.map((r: any) => `
      <div style="padding:14px 16px;border-bottom:1px solid #F3F4F6">
        <div style="font-size:11px;color:#6B7280;margin-bottom:4px">${platformNames[r.platform] || r.platform} • ${r.rating}★ • ${format(new Date(r.posted_at), "dd MMM yyyy", { locale })}${r.reviewer_name ? ` • ${r.reviewer_name}` : ""}</div>
        <div style="font-size:13px;color:#374151;line-height:1.55">${(r.content || r.text || "").replace(/</g, "&lt;")}</div>
      </div>`).join("")}
  </div>` : "";

  return `<!DOCTYPE html><html><body style="margin:0;padding:0;background:#F3F4F6;font-family:-apple-system,'Segoe UI',Roboto,Arial,sans-serif">
<div style="max-width:640px;margin:0 auto;background:#ffffff;padding:40px 32px">
  <div style="border-bottom:1px solid #E5E7EB;padding-bottom:20px;margin-bottom:24px">
    <div style="font-size:11px;color:#7A5AF8;text-transform:uppercase;letter-spacing:.1em;font-weight:600">${t(lang, "reportOf")}</div>
    <h1 style="font-size:24px;color:#111827;margin:6px 0 4px;font-weight:600">${business}</h1>
    <div style="font-size:13px;color:#6B7280">${format(period.from, "dd MMM yyyy", { locale })} – ${format(period.to, "dd MMM yyyy", { locale })}</div>
  </div>

  <table style="width:100%;border-spacing:8px 0;margin-bottom:24px"><tr>
    ${kpi(t(lang, "totalReviews"), String(stats.total))}
    ${kpi(t(lang, "avgRating"), `${stats.avg.toFixed(2)}/5`)}
    ${kpi(t(lang, "replyRate"), `${stats.replyRate.toFixed(0)}%`)}
    ${kpi(t(lang, "positive"), String(stats.sent.positive))}
  </tr></table>

  ${structured?.executiveSummary?.length ? `
  <h2 style="font-size:14px;color:#111827;margin:24px 0 12px;text-transform:uppercase;letter-spacing:.08em">${t(lang, "execSummary")}</h2>
  <ul style="padding:0;margin:0;list-style:none">${list(structured.executiveSummary)}</ul>` : ""}

  ${structured?.actions?.length ? `
  <h2 style="font-size:14px;color:#111827;margin:24px 0 12px;text-transform:uppercase;letter-spacing:.08em">${t(lang, "actions")}</h2>
  <ul style="padding:0;margin:0;list-style:none">${list(structured.actions)}</ul>` : ""}

  ${reviewsBlock}

  <div style="margin-top:32px;padding-top:16px;border-top:1px solid #E5E7EB;text-align:center;font-size:11px;color:#9CA3AF">
    ${t(lang, "footer")}
  </div>
</div></body></html>`;
}