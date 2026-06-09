import { jsx, jsxs, Fragment } from "react/jsx-runtime";
import { useRef, useState, useMemo } from "react";
import { C as Card, c as CardContent, a as CardHeader, e as CardTitle } from "./card-vx9BCW0t.js";
import { a as useBusiness, s as supabase, B as Button, y as cn, R as logo, m as Badge, I as Input, t as toast } from "../main.mjs";
import { C as Calendar } from "./calendar-B5v0tS8S.js";
import { P as Popover, a as PopoverTrigger, b as PopoverContent } from "./popover-DkUGUX0H.js";
import { D as Dialog, a as DialogContent, b as DialogHeader, c as DialogTitle, d as DialogDescription, e as DialogFooter } from "./dialog-CFYcafO1.js";
import { Loader2, Brain, FileDown, Mail, CalendarIcon, BarChart3, Star, MessageSquare, ThumbsUp, ThumbsDown, Send, AlertTriangle, TrendingUp, CheckCircle2 } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, BarChart, CartesianGrid, XAxis, YAxis, Bar, Legend, Line, AreaChart, Area } from "recharts";
import ReactMarkdown from "react-markdown";
import { subDays, isWithinInterval, startOfDay, endOfDay, eachMonthOfInterval, startOfMonth, format } from "date-fns";
import { tr } from "date-fns/locale";
import "vite-react-ssg";
import "react-router-dom";
import "@radix-ui/react-toast";
import "class-variance-authority";
import "clsx";
import "tailwind-merge";
import "next-themes";
import "sonner";
import "@radix-ui/react-tooltip";
import "react-i18next";
import "@supabase/supabase-js";
import "@radix-ui/react-slot";
import "@radix-ui/react-separator";
import "@radix-ui/react-dialog";
import "@radix-ui/react-alert-dialog";
import "@radix-ui/react-dropdown-menu";
import "@radix-ui/react-collapsible";
import "i18next";
import "i18next-browser-languagedetector";
import "react-day-picker";
import "@radix-ui/react-popover";
const COLORS = {
  positive: "#10b981",
  neutral: "#f59e0b",
  negative: "#ef4444",
  primary: "#8b5cf6",
  secondary: "#6366f1"
};
const DATE_PRESETS = [
  { label: "Son 7 gün", days: 7 },
  { label: "Son 30 gün", days: 30 },
  { label: "Son 90 gün", days: 90 },
  { label: "Son 6 ay", days: 180 },
  { label: "Son 1 yıl", days: 365 }
];
function Report() {
  const { activeBusiness } = useBusiness();
  const reportRef = useRef(null);
  const [dateRange, setDateRange] = useState({
    from: subDays(/* @__PURE__ */ new Date(), 30),
    to: /* @__PURE__ */ new Date()
  });
  const [aiReport, setAiReport] = useState(null);
  const [isExporting, setIsExporting] = useState(false);
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const [emailTo, setEmailTo] = useState("");
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const { data: allReviews = [], isLoading } = useQuery({
    queryKey: ["reviews-report", activeBusiness == null ? void 0 : activeBusiness.id],
    queryFn: async () => {
      if (!activeBusiness) return [];
      const { data, error } = await supabase.from("reviews").select("*").eq("business_id", activeBusiness.id).order("posted_at", { ascending: true });
      if (error) throw error;
      return data || [];
    },
    enabled: !!activeBusiness
  });
  const reviews = useMemo(() => {
    return allReviews.filter((r) => {
      const d = new Date(r.posted_at);
      return isWithinInterval(d, { start: startOfDay(dateRange.from), end: endOfDay(dateRange.to) });
    });
  }, [allReviews, dateRange]);
  const analysisMutation = useMutation({
    mutationFn: async () => {
      if (!activeBusiness) throw new Error("No business");
      const response = await supabase.functions.invoke("business-analysis", {
        body: { business_id: activeBusiness.id }
      });
      if (response.error) throw new Error(response.error.message);
      return response.data;
    },
    onSuccess: (data) => {
      setAiReport(data.analysis);
    }
  });
  const stats = useMemo(() => {
    if (!reviews.length) return null;
    const totalReviews = reviews.length;
    const avgRating = reviews.reduce((s, r) => s + r.rating, 0) / totalReviews;
    const sentimentCounts = {
      positive: reviews.filter((r) => r.sentiment === "positive").length,
      neutral: reviews.filter((r) => r.sentiment === "neutral").length,
      negative: reviews.filter((r) => r.sentiment === "negative").length
    };
    const repliedCount = reviews.filter((r) => r.status === "replied").length;
    const pendingCount = reviews.filter((r) => !r.status || r.status === "pending_reply").length;
    const replyRate = totalReviews > 0 ? repliedCount / totalReviews * 100 : 0;
    const platformCounts = {};
    reviews.forEach((r) => {
      platformCounts[r.platform] = (platformCounts[r.platform] || 0) + 1;
    });
    return { totalReviews, avgRating, sentimentCounts, repliedCount, pendingCount, replyRate, platformCounts };
  }, [reviews]);
  const sentimentPieData = useMemo(() => {
    if (!stats) return [];
    return [
      { name: "Pozitif", value: stats.sentimentCounts.positive, color: COLORS.positive },
      { name: "Nötr", value: stats.sentimentCounts.neutral, color: COLORS.neutral },
      { name: "Negatif", value: stats.sentimentCounts.negative, color: COLORS.negative }
    ];
  }, [stats]);
  const monthlyData = useMemo(() => {
    if (!reviews.length) return [];
    const months = eachMonthOfInterval({
      start: startOfMonth(dateRange.from),
      end: startOfMonth(dateRange.to)
    });
    return months.map((month) => {
      const monthEnd = new Date(month.getFullYear(), month.getMonth() + 1, 0);
      const monthReviews = reviews.filter((r) => {
        const d = new Date(r.posted_at);
        return d >= month && d <= monthEnd;
      });
      const avg = monthReviews.length > 0 ? monthReviews.reduce((s, r) => s + r.rating, 0) / monthReviews.length : 0;
      return {
        month: format(month, "MMM yy", { locale: tr }),
        count: monthReviews.length,
        avgRating: parseFloat(avg.toFixed(1)),
        positive: monthReviews.filter((r) => r.sentiment === "positive").length,
        negative: monthReviews.filter((r) => r.sentiment === "negative").length
      };
    });
  }, [reviews, dateRange]);
  const ratingDistribution = useMemo(() => {
    if (!reviews.length) return [];
    return [5, 4, 3, 2, 1].map((rating) => ({
      rating: `${rating} ⭐`,
      count: reviews.filter((r) => r.rating === rating).length
    }));
  }, [reviews]);
  const platformData = useMemo(() => {
    if (!(stats == null ? void 0 : stats.platformCounts)) return [];
    const names = {
      google: "Google",
      booking: "Booking",
      tripadvisor: "TripAdvisor",
      expedia: "Expedia",
      hotelscom: "Hotels.com"
    };
    return Object.entries(stats.platformCounts).map(([key, count]) => ({
      name: names[key] || key,
      count
    }));
  }, [stats]);
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
        logging: false
      });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pdfWidth - 20;
      const imgHeight = canvas.height * imgWidth / canvas.width;
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
      const fileName = `${(activeBusiness == null ? void 0 : activeBusiness.name) || "rapor"}-${format(dateRange.from, "dd.MM.yyyy")}-${format(dateRange.to, "dd.MM.yyyy")}.pdf`;
      pdf.save(fileName);
      toast({ title: "PDF İndirildi", description: `${fileName} başarıyla indirildi.` });
    } catch (err) {
      console.error("PDF export error:", err);
      toast({ title: "Hata", description: "PDF oluşturulurken bir hata oluştu.", variant: "destructive" });
    } finally {
      setIsExporting(false);
    }
  };
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
          html: reportHtml
        }
      });
      if (error) throw error;
      toast({ title: "E-posta Gönderildi", description: `Rapor ${emailTo} adresine gönderildi.` });
      setEmailDialogOpen(false);
      setEmailTo("");
    } catch (err) {
      console.error("Email send error:", err);
      toast({ title: "Hata", description: err.message || "E-posta gönderilemedi.", variant: "destructive" });
    } finally {
      setIsSendingEmail(false);
    }
  };
  const generateEmailReportHtml = () => {
    if (!stats || !activeBusiness) return "";
    const platformNames = {
      google: "Google",
      booking: "Booking",
      tripadvisor: "TripAdvisor",
      expedia: "Expedia",
      hotelscom: "Hotels.com"
    };
    const platformRows = Object.entries(stats.platformCounts).map(([k, v]) => `<tr><td style="padding:8px 16px;border-bottom:1px solid #f0f0f0">${platformNames[k] || k}</td><td style="padding:8px 16px;border-bottom:1px solid #f0f0f0;text-align:right;font-weight:600">${v}</td></tr>`).join("");
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
  const handlePresetClick = (days) => {
    setDateRange({ from: subDays(/* @__PURE__ */ new Date(), days), to: /* @__PURE__ */ new Date() });
  };
  if (!activeBusiness) {
    return /* @__PURE__ */ jsx("div", { className: "p-8", children: /* @__PURE__ */ jsx(Card, { className: "p-12 text-center", children: /* @__PURE__ */ jsx("p", { className: "text-muted-foreground", children: "İşletme seçilmedi." }) }) });
  }
  if (isLoading) {
    return /* @__PURE__ */ jsx("div", { className: "flex items-center justify-center min-h-screen", children: /* @__PURE__ */ jsx("div", { className: "animate-spin rounded-full h-8 w-8 border-b-2 border-primary" }) });
  }
  return /* @__PURE__ */ jsxs("div", { className: "p-4 md:p-8 space-y-6 max-w-6xl mx-auto", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex flex-col md:flex-row md:items-center justify-between gap-4", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h1", { className: "text-2xl md:text-3xl font-semibold text-foreground", children: "Rapor Oluştur" }),
        /* @__PURE__ */ jsxs("p", { className: "text-muted-foreground mt-1", children: [
          activeBusiness.name,
          " — Profesyonel yorum raporu"
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxs(
          Button,
          {
            onClick: () => analysisMutation.mutate(),
            disabled: analysisMutation.isPending || !reviews.length,
            variant: "outline",
            className: "gap-2",
            children: [
              analysisMutation.isPending ? /* @__PURE__ */ jsx(Loader2, { className: "h-4 w-4 animate-spin" }) : /* @__PURE__ */ jsx(Brain, { className: "h-4 w-4" }),
              analysisMutation.isPending ? "Analiz..." : "AI Analiz"
            ]
          }
        ),
        /* @__PURE__ */ jsxs(
          Button,
          {
            onClick: handleExportPDF,
            disabled: isExporting || !reviews.length,
            className: "gap-2",
            children: [
              isExporting ? /* @__PURE__ */ jsx(Loader2, { className: "h-4 w-4 animate-spin" }) : /* @__PURE__ */ jsx(FileDown, { className: "h-4 w-4" }),
              "PDF İndir"
            ]
          }
        ),
        /* @__PURE__ */ jsxs(
          Button,
          {
            onClick: () => setEmailDialogOpen(true),
            disabled: !reviews.length,
            variant: "secondary",
            className: "gap-2",
            children: [
              /* @__PURE__ */ jsx(Mail, { className: "h-4 w-4" }),
              "E-posta"
            ]
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsx(CardContent, { className: "pt-6", children: /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center gap-3", children: [
      /* @__PURE__ */ jsx("span", { className: "text-sm font-medium text-muted-foreground", children: "Tarih Aralığı:" }),
      DATE_PRESETS.map((preset) => /* @__PURE__ */ jsx(
        Button,
        {
          variant: "outline",
          size: "sm",
          onClick: () => handlePresetClick(preset.days),
          className: cn(
            "text-xs",
            Math.abs(
              Math.round((dateRange.to.getTime() - dateRange.from.getTime()) / (1e3 * 60 * 60 * 24)) - preset.days
            ) <= 1 && "bg-primary text-primary-foreground hover:bg-primary/90"
          ),
          children: preset.label
        },
        preset.days
      )),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 ml-auto", children: [
        /* @__PURE__ */ jsxs(Popover, { children: [
          /* @__PURE__ */ jsx(PopoverTrigger, { asChild: true, children: /* @__PURE__ */ jsxs(Button, { variant: "outline", size: "sm", className: "gap-1 text-xs", children: [
            /* @__PURE__ */ jsx(CalendarIcon, { className: "h-3.5 w-3.5" }),
            format(dateRange.from, "dd MMM yyyy", { locale: tr })
          ] }) }),
          /* @__PURE__ */ jsx(PopoverContent, { className: "w-auto p-0", align: "start", children: /* @__PURE__ */ jsx(
            Calendar,
            {
              mode: "single",
              selected: dateRange.from,
              onSelect: (d) => d && setDateRange((prev) => ({ ...prev, from: d })),
              className: cn("p-3 pointer-events-auto")
            }
          ) })
        ] }),
        /* @__PURE__ */ jsx("span", { className: "text-muted-foreground text-sm", children: "—" }),
        /* @__PURE__ */ jsxs(Popover, { children: [
          /* @__PURE__ */ jsx(PopoverTrigger, { asChild: true, children: /* @__PURE__ */ jsxs(Button, { variant: "outline", size: "sm", className: "gap-1 text-xs", children: [
            /* @__PURE__ */ jsx(CalendarIcon, { className: "h-3.5 w-3.5" }),
            format(dateRange.to, "dd MMM yyyy", { locale: tr })
          ] }) }),
          /* @__PURE__ */ jsx(PopoverContent, { className: "w-auto p-0", align: "start", children: /* @__PURE__ */ jsx(
            Calendar,
            {
              mode: "single",
              selected: dateRange.to,
              onSelect: (d) => d && setDateRange((prev) => ({ ...prev, to: d })),
              className: cn("p-3 pointer-events-auto")
            }
          ) })
        ] })
      ] })
    ] }) }) }),
    /* @__PURE__ */ jsxs("div", { ref: reportRef, className: "space-y-6 bg-background", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between border-b pb-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsx("img", { src: logo, alt: "VoyageRespond", className: "h-8 w-8" }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("h2", { className: "text-xl font-bold text-foreground", children: activeBusiness.name }),
            /* @__PURE__ */ jsxs("p", { className: "text-sm text-muted-foreground", children: [
              format(dateRange.from, "dd MMM yyyy", { locale: tr }),
              " – ",
              format(dateRange.to, "dd MMM yyyy", { locale: tr })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs(Badge, { variant: "outline", className: "text-xs", children: [
          reviews.length,
          " yorum"
        ] })
      ] }),
      !reviews.length ? /* @__PURE__ */ jsxs(Card, { className: "p-12 text-center", children: [
        /* @__PURE__ */ jsx(BarChart3, { className: "h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" }),
        /* @__PURE__ */ jsx("p", { className: "text-muted-foreground text-lg", children: "Seçili tarih aralığında yorum bulunamadı." }),
        /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground mt-1", children: "Farklı bir tarih aralığı deneyin." })
      ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3", children: [
          /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsxs(CardContent, { className: "pt-4 pb-3 text-center", children: [
            /* @__PURE__ */ jsx(Star, { className: "h-5 w-5 mx-auto mb-1 text-primary fill-primary" }),
            /* @__PURE__ */ jsx("div", { className: "text-2xl font-bold", children: stats == null ? void 0 : stats.avgRating.toFixed(1) }),
            /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: "Ort. Puan" })
          ] }) }),
          /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsxs(CardContent, { className: "pt-4 pb-3 text-center", children: [
            /* @__PURE__ */ jsx(MessageSquare, { className: "h-5 w-5 mx-auto mb-1 text-primary" }),
            /* @__PURE__ */ jsx("div", { className: "text-2xl font-bold", children: stats == null ? void 0 : stats.totalReviews }),
            /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: "Toplam Yorum" })
          ] }) }),
          /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsxs(CardContent, { className: "pt-4 pb-3 text-center", children: [
            /* @__PURE__ */ jsx(ThumbsUp, { className: "h-5 w-5 mx-auto mb-1 text-emerald-500" }),
            /* @__PURE__ */ jsx("div", { className: "text-2xl font-bold", children: stats == null ? void 0 : stats.sentimentCounts.positive }),
            /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: "Pozitif" })
          ] }) }),
          /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsxs(CardContent, { className: "pt-4 pb-3 text-center", children: [
            /* @__PURE__ */ jsx(ThumbsDown, { className: "h-5 w-5 mx-auto mb-1 text-rose-500" }),
            /* @__PURE__ */ jsx("div", { className: "text-2xl font-bold", children: stats == null ? void 0 : stats.sentimentCounts.negative }),
            /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: "Negatif" })
          ] }) }),
          /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsxs(CardContent, { className: "pt-4 pb-3 text-center", children: [
            /* @__PURE__ */ jsx(Send, { className: "h-5 w-5 mx-auto mb-1 text-blue-500" }),
            /* @__PURE__ */ jsxs("div", { className: "text-2xl font-bold", children: [
              "%",
              stats == null ? void 0 : stats.replyRate.toFixed(0)
            ] }),
            /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: "Yanıt Oranı" })
          ] }) }),
          /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsxs(CardContent, { className: "pt-4 pb-3 text-center", children: [
            /* @__PURE__ */ jsx(AlertTriangle, { className: "h-5 w-5 mx-auto mb-1 text-amber-500" }),
            /* @__PURE__ */ jsx("div", { className: "text-2xl font-bold", children: stats == null ? void 0 : stats.pendingCount }),
            /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: "Bekleyen" })
          ] }) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6", children: [
          /* @__PURE__ */ jsxs(Card, { children: [
            /* @__PURE__ */ jsx(CardHeader, { className: "pb-2", children: /* @__PURE__ */ jsxs(CardTitle, { className: "text-base flex items-center gap-2", children: [
              /* @__PURE__ */ jsx(ThumbsUp, { className: "h-4 w-4 text-primary" }),
              "Duygu Dağılımı"
            ] }) }),
            /* @__PURE__ */ jsx(CardContent, { children: /* @__PURE__ */ jsx("div", { className: "h-56", children: /* @__PURE__ */ jsx(ResponsiveContainer, { width: "100%", height: "100%", children: /* @__PURE__ */ jsxs(PieChart, { children: [
              /* @__PURE__ */ jsx(
                Pie,
                {
                  data: sentimentPieData,
                  cx: "50%",
                  cy: "50%",
                  innerRadius: 55,
                  outerRadius: 85,
                  paddingAngle: 4,
                  dataKey: "value",
                  label: ({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`,
                  children: sentimentPieData.map((entry, i) => /* @__PURE__ */ jsx(Cell, { fill: entry.color }, i))
                }
              ),
              /* @__PURE__ */ jsx(Tooltip, {})
            ] }) }) }) })
          ] }),
          /* @__PURE__ */ jsxs(Card, { children: [
            /* @__PURE__ */ jsx(CardHeader, { className: "pb-2", children: /* @__PURE__ */ jsxs(CardTitle, { className: "text-base flex items-center gap-2", children: [
              /* @__PURE__ */ jsx(Star, { className: "h-4 w-4 text-primary" }),
              "Puan Dağılımı"
            ] }) }),
            /* @__PURE__ */ jsx(CardContent, { children: /* @__PURE__ */ jsx("div", { className: "h-56", children: /* @__PURE__ */ jsx(ResponsiveContainer, { width: "100%", height: "100%", children: /* @__PURE__ */ jsxs(BarChart, { data: ratingDistribution, layout: "vertical", children: [
              /* @__PURE__ */ jsx(CartesianGrid, { strokeDasharray: "3 3" }),
              /* @__PURE__ */ jsx(XAxis, { type: "number" }),
              /* @__PURE__ */ jsx(YAxis, { type: "category", dataKey: "rating", width: 50 }),
              /* @__PURE__ */ jsx(Tooltip, {}),
              /* @__PURE__ */ jsx(Bar, { dataKey: "count", fill: COLORS.primary, radius: [0, 4, 4, 0] })
            ] }) }) }) })
          ] }),
          /* @__PURE__ */ jsxs(Card, { children: [
            /* @__PURE__ */ jsx(CardHeader, { className: "pb-2", children: /* @__PURE__ */ jsxs(CardTitle, { className: "text-base flex items-center gap-2", children: [
              /* @__PURE__ */ jsx(TrendingUp, { className: "h-4 w-4 text-primary" }),
              "Aylık Yorum Trendi"
            ] }) }),
            /* @__PURE__ */ jsx(CardContent, { children: /* @__PURE__ */ jsx("div", { className: "h-56", children: /* @__PURE__ */ jsx(ResponsiveContainer, { width: "100%", height: "100%", children: /* @__PURE__ */ jsxs(BarChart, { data: monthlyData, children: [
              /* @__PURE__ */ jsx(CartesianGrid, { strokeDasharray: "3 3" }),
              /* @__PURE__ */ jsx(XAxis, { dataKey: "month" }),
              /* @__PURE__ */ jsx(YAxis, { yAxisId: "left" }),
              /* @__PURE__ */ jsx(YAxis, { yAxisId: "right", orientation: "right", domain: [0, 5] }),
              /* @__PURE__ */ jsx(Tooltip, {}),
              /* @__PURE__ */ jsx(Legend, {}),
              /* @__PURE__ */ jsx(Bar, { yAxisId: "left", dataKey: "count", name: "Yorum", fill: COLORS.primary, radius: [4, 4, 0, 0] }),
              /* @__PURE__ */ jsx(Line, { yAxisId: "right", type: "monotone", dataKey: "avgRating", name: "Ort. Puan", stroke: COLORS.positive, strokeWidth: 2, dot: true })
            ] }) }) }) })
          ] }),
          /* @__PURE__ */ jsxs(Card, { children: [
            /* @__PURE__ */ jsx(CardHeader, { className: "pb-2", children: /* @__PURE__ */ jsxs(CardTitle, { className: "text-base flex items-center gap-2", children: [
              /* @__PURE__ */ jsx(BarChart3, { className: "h-4 w-4 text-primary" }),
              "Duygu Trendi"
            ] }) }),
            /* @__PURE__ */ jsx(CardContent, { children: /* @__PURE__ */ jsx("div", { className: "h-56", children: /* @__PURE__ */ jsx(ResponsiveContainer, { width: "100%", height: "100%", children: /* @__PURE__ */ jsxs(AreaChart, { data: monthlyData, children: [
              /* @__PURE__ */ jsx(CartesianGrid, { strokeDasharray: "3 3" }),
              /* @__PURE__ */ jsx(XAxis, { dataKey: "month" }),
              /* @__PURE__ */ jsx(YAxis, {}),
              /* @__PURE__ */ jsx(Tooltip, {}),
              /* @__PURE__ */ jsx(Legend, {}),
              /* @__PURE__ */ jsx(Area, { type: "monotone", dataKey: "positive", name: "Pozitif", stackId: "1", fill: COLORS.positive, stroke: COLORS.positive, fillOpacity: 0.6 }),
              /* @__PURE__ */ jsx(Area, { type: "monotone", dataKey: "negative", name: "Negatif", stackId: "1", fill: COLORS.negative, stroke: COLORS.negative, fillOpacity: 0.6 })
            ] }) }) }) })
          ] })
        ] }),
        platformData.length > 1 && /* @__PURE__ */ jsxs(Card, { children: [
          /* @__PURE__ */ jsx(CardHeader, { className: "pb-2", children: /* @__PURE__ */ jsxs(CardTitle, { className: "text-base flex items-center gap-2", children: [
            /* @__PURE__ */ jsx(BarChart3, { className: "h-4 w-4 text-primary" }),
            "Platform Dağılımı"
          ] }) }),
          /* @__PURE__ */ jsx(CardContent, { children: /* @__PURE__ */ jsx("div", { className: "h-48", children: /* @__PURE__ */ jsx(ResponsiveContainer, { width: "100%", height: "100%", children: /* @__PURE__ */ jsxs(BarChart, { data: platformData, children: [
            /* @__PURE__ */ jsx(CartesianGrid, { strokeDasharray: "3 3" }),
            /* @__PURE__ */ jsx(XAxis, { dataKey: "name" }),
            /* @__PURE__ */ jsx(YAxis, {}),
            /* @__PURE__ */ jsx(Tooltip, {}),
            /* @__PURE__ */ jsx(Bar, { dataKey: "count", name: "Yorum", fill: COLORS.secondary, radius: [4, 4, 0, 0] })
          ] }) }) }) })
        ] }),
        aiReport && /* @__PURE__ */ jsxs(Card, { children: [
          /* @__PURE__ */ jsx(CardHeader, { className: "pb-2", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
            /* @__PURE__ */ jsxs(CardTitle, { className: "text-base flex items-center gap-2", children: [
              /* @__PURE__ */ jsx(Brain, { className: "h-4 w-4 text-primary" }),
              "AI İşletme Analiz Raporu"
            ] }),
            /* @__PURE__ */ jsxs(Badge, { variant: "secondary", className: "text-xs", children: [
              /* @__PURE__ */ jsx(CheckCircle2, { className: "h-3 w-3 mr-1" }),
              reviews.length,
              " yorum analiz edildi"
            ] })
          ] }) }),
          /* @__PURE__ */ jsx(CardContent, { children: /* @__PURE__ */ jsx("div", { className: "prose prose-sm max-w-none dark:prose-invert", children: /* @__PURE__ */ jsx(ReactMarkdown, { children: aiReport }) }) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between pt-4 border-t text-xs text-muted-foreground", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsx("img", { src: logo, alt: "VoyageRespond", className: "h-5 w-5" }),
            /* @__PURE__ */ jsx("span", { children: "VoyageRespond ile oluşturulmuştur" })
          ] }),
          /* @__PURE__ */ jsx("span", { children: format(/* @__PURE__ */ new Date(), "dd MMM yyyy HH:mm", { locale: tr }) })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsx(Dialog, { open: emailDialogOpen, onOpenChange: setEmailDialogOpen, children: /* @__PURE__ */ jsxs(DialogContent, { children: [
      /* @__PURE__ */ jsxs(DialogHeader, { children: [
        /* @__PURE__ */ jsx(DialogTitle, { children: "Raporu E-posta ile Gönder" }),
        /* @__PURE__ */ jsx(DialogDescription, { children: "Rapor, seçili tarih aralığındaki metrikleri ve AI analizini (varsa) içerecektir." })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-4 py-4", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "text-sm font-medium mb-1.5 block", children: "Alıcı E-posta" }),
          /* @__PURE__ */ jsx(
            Input,
            {
              type: "email",
              value: emailTo,
              onChange: (e) => setEmailTo(e.target.value),
              placeholder: "ornek@email.com"
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "bg-muted/50 rounded-lg p-3 text-sm text-muted-foreground", children: [
          /* @__PURE__ */ jsx("p", { className: "font-medium text-foreground mb-1", children: "Rapor İçeriği:" }),
          /* @__PURE__ */ jsxs("ul", { className: "list-disc list-inside space-y-0.5", children: [
            /* @__PURE__ */ jsx("li", { children: "Genel metrikler (puan, yorum sayısı, yanıt oranı)" }),
            /* @__PURE__ */ jsx("li", { children: "Duygu dağılımı" }),
            /* @__PURE__ */ jsx("li", { children: "Platform dağılımı" }),
            aiReport && /* @__PURE__ */ jsx("li", { children: "AI analiz raporu" })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsx(Button, { variant: "outline", onClick: () => setEmailDialogOpen(false), children: "İptal" }),
        /* @__PURE__ */ jsxs(Button, { onClick: handleSendEmail, disabled: !emailTo || isSendingEmail, className: "gap-2", children: [
          isSendingEmail ? /* @__PURE__ */ jsx(Loader2, { className: "h-4 w-4 animate-spin" }) : /* @__PURE__ */ jsx(Mail, { className: "h-4 w-4" }),
          "Gönder"
        ] })
      ] })
    ] }) })
  ] });
}
export {
  Report as default
};
