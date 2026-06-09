import { jsxs, jsx } from "react/jsx-runtime";
import { useState, useEffect, useMemo } from "react";
import { Navigate } from "react-router-dom";
import { B as Button, m as Badge, s as supabase, t as toast, u as useAuth, I as Input } from "../main.mjs";
import { C as Card, a as CardHeader, e as CardTitle, c as CardContent } from "./card-vx9BCW0t.js";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-1zED13tY.js";
import { T as Tabs, a as TabsList, b as TabsTrigger, c as TabsContent } from "./tabs-C8D1i09v.js";
import { T as Table, a as TableHeader, b as TableRow, c as TableHead, d as TableBody, e as TableCell } from "./table-Ni8R8e0b.js";
import { Clock, RefreshCw, Loader2, CheckCircle2, XCircle, Play, Search, Mail, MailX, ChevronLeft, ChevronRight } from "lucide-react";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import "vite-react-ssg";
import "@radix-ui/react-toast";
import "class-variance-authority";
import "clsx";
import "tailwind-merge";
import "next-themes";
import "sonner";
import "@radix-ui/react-tooltip";
import "@tanstack/react-query";
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
import "@radix-ui/react-select";
import "@radix-ui/react-tabs";
const FUNCTION_MAP = {
  "google-reviews-auto-sync": { fn: "google-business-reviews", label: "Google Yorumları Çek" },
  "auto-fetch-apify-only-daily-06": {
    fn: "auto-fetch-reviews",
    query: "platforms=booking,tripadvisor,hotelscom,expedia,trustpilot",
    label: "Apify Yorumları Çek"
  },
  "weekly-report-daily-tr-11": { fn: "weekly-report", label: "Haftalık Rapor Gönder" }
};
function describeCron(expr) {
  const parts = expr.trim().split(/\s+/);
  if (parts.length !== 5) return expr;
  const [min, hour, dom, mon, dow] = parts;
  if (min.startsWith("*/") && hour === "*" && dom === "*" && mon === "*" && dow === "*") {
    return `Her ${min.slice(2)} dakikada bir`;
  }
  if (min === "0" && hour.startsWith("*/") && dom === "*" && mon === "*" && dow === "*") {
    return `Her ${hour.slice(2)} saatte bir`;
  }
  if (min !== "*" && hour !== "*" && !hour.includes("*") && dom === "*" && mon === "*" && dow === "*") {
    const h = parseInt(hour, 10);
    const m = parseInt(min, 10);
    const trH = (h + 3) % 24;
    return `Her gün TSİ ${String(trH).padStart(2, "0")}:${String(m).padStart(2, "0")} (UTC ${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")})`;
  }
  return expr;
}
function AdminCronJobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [triggering, setTriggering] = useState(null);
  const [lastResult, setLastResult] = useState({});
  const fetchJobs = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke(
        "admin-cron-jobs?action=list",
        { method: "GET" }
      );
      if (error) throw error;
      setJobs((data == null ? void 0 : data.jobs) ?? []);
    } catch (e) {
      toast({ title: "Hata", description: (e == null ? void 0 : e.message) ?? "Cron jobs alınamadı", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchJobs();
  }, []);
  const triggerJob = async (jobname) => {
    const map = FUNCTION_MAP[jobname];
    if (!map) {
      toast({
        title: "Tetiklenemiyor",
        description: "Bu cron için manuel tetikleme tanımlanmamış.",
        variant: "destructive"
      });
      return;
    }
    setTriggering(jobname);
    try {
      const { data, error } = await supabase.functions.invoke(
        "admin-cron-jobs?action=trigger",
        {
          method: "POST",
          body: { function_name: map.fn, query_string: map.query ?? "" }
        }
      );
      if (error) throw error;
      setLastResult((prev) => ({ ...prev, [jobname]: data }));
      toast({
        title: (data == null ? void 0 : data.ok) ? "Tetiklendi ✓" : "Hata",
        description: `${map.label} — ${data == null ? void 0 : data.duration_ms}ms (HTTP ${data == null ? void 0 : data.status})`,
        variant: (data == null ? void 0 : data.ok) ? "default" : "destructive"
      });
    } catch (e) {
      toast({ title: "Tetiklenemedi", description: e == null ? void 0 : e.message, variant: "destructive" });
    } finally {
      setTriggering(null);
    }
  };
  return /* @__PURE__ */ jsxs(Card, { children: [
    /* @__PURE__ */ jsx(CardHeader, { children: /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between flex-wrap gap-3", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsxs(CardTitle, { className: "text-base flex items-center gap-2", children: [
          /* @__PURE__ */ jsx(Clock, { className: "h-4 w-4" }),
          "Zamanlanmış İşler (",
          jobs.length,
          ")"
        ] }),
        /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground mt-1", children: "Otomatik çalışan tüm cron joblar. Manuel tetikleme için ▶ butonuna bas." })
      ] }),
      /* @__PURE__ */ jsx(Button, { variant: "outline", size: "sm", onClick: fetchJobs, disabled: loading, children: /* @__PURE__ */ jsx(RefreshCw, { className: `h-4 w-4 ${loading ? "animate-spin" : ""}` }) })
    ] }) }),
    /* @__PURE__ */ jsx(CardContent, { children: loading && jobs.length === 0 ? /* @__PURE__ */ jsx("div", { className: "flex items-center justify-center py-8", children: /* @__PURE__ */ jsx(Loader2, { className: "h-6 w-6 animate-spin text-primary" }) }) : /* @__PURE__ */ jsxs(Table, { children: [
      /* @__PURE__ */ jsx(TableHeader, { children: /* @__PURE__ */ jsxs(TableRow, { children: [
        /* @__PURE__ */ jsx(TableHead, { children: "Job Adı" }),
        /* @__PURE__ */ jsx(TableHead, { children: "Zamanlama" }),
        /* @__PURE__ */ jsx(TableHead, { children: "Durum" }),
        /* @__PURE__ */ jsx(TableHead, { children: "Son Manuel Çağrı" }),
        /* @__PURE__ */ jsx(TableHead, { className: "text-right", children: "Tetikle" })
      ] }) }),
      /* @__PURE__ */ jsxs(TableBody, { children: [
        jobs.map((job) => {
          const map = FUNCTION_MAP[job.jobname];
          const result = lastResult[job.jobname];
          return /* @__PURE__ */ jsxs(TableRow, { children: [
            /* @__PURE__ */ jsxs(TableCell, { children: [
              /* @__PURE__ */ jsx("div", { className: "font-medium", children: job.jobname }),
              map && /* @__PURE__ */ jsxs("div", { className: "text-xs text-muted-foreground", children: [
                "→ ",
                map.fn
              ] })
            ] }),
            /* @__PURE__ */ jsxs(TableCell, { children: [
              /* @__PURE__ */ jsx("div", { className: "text-sm", children: describeCron(job.schedule) }),
              /* @__PURE__ */ jsx("div", { className: "text-xs text-muted-foreground font-mono", children: job.schedule })
            ] }),
            /* @__PURE__ */ jsx(TableCell, { children: job.active ? /* @__PURE__ */ jsx(Badge, { variant: "secondary", children: "Aktif" }) : /* @__PURE__ */ jsx(Badge, { variant: "outline", children: "Pasif" }) }),
            /* @__PURE__ */ jsx(TableCell, { children: result ? /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5 text-xs", children: [
              result.ok ? /* @__PURE__ */ jsx(CheckCircle2, { className: "h-3.5 w-3.5 text-primary" }) : /* @__PURE__ */ jsx(XCircle, { className: "h-3.5 w-3.5 text-destructive" }),
              /* @__PURE__ */ jsxs("span", { children: [
                "HTTP ",
                result.status,
                " • ",
                result.duration_ms,
                "ms"
              ] })
            ] }) : /* @__PURE__ */ jsx("span", { className: "text-xs text-muted-foreground", children: "—" }) }),
            /* @__PURE__ */ jsx(TableCell, { className: "text-right", children: map ? /* @__PURE__ */ jsxs(
              Button,
              {
                size: "sm",
                variant: "outline",
                onClick: () => triggerJob(job.jobname),
                disabled: triggering === job.jobname,
                children: [
                  triggering === job.jobname ? /* @__PURE__ */ jsx(Loader2, { className: "h-3.5 w-3.5 animate-spin mr-1" }) : /* @__PURE__ */ jsx(Play, { className: "h-3.5 w-3.5 mr-1" }),
                  "Çalıştır"
                ]
              }
            ) : /* @__PURE__ */ jsx("span", { className: "text-xs text-muted-foreground", children: "—" }) })
          ] }, job.jobid);
        }),
        jobs.length === 0 && /* @__PURE__ */ jsx(TableRow, { children: /* @__PURE__ */ jsx(TableCell, { colSpan: 5, className: "text-center text-muted-foreground py-8", children: "Cron job bulunamadı." }) })
      ] })
    ] }) })
  ] });
}
const ADMIN_EMAIL = "metecorukbasari@gmail.com";
const PAGE_SIZE = 25;
function paginate(items, page) {
  const totalPages = Math.max(1, Math.ceil(items.length / PAGE_SIZE));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const start = (safePage - 1) * PAGE_SIZE;
  return {
    pageItems: items.slice(start, start + PAGE_SIZE),
    totalPages,
    safePage,
    total: items.length
  };
}
function Pager({
  page,
  totalPages,
  total,
  onPage
}) {
  if (total === 0) return null;
  const start = (page - 1) * PAGE_SIZE + 1;
  const end = Math.min(page * PAGE_SIZE, total);
  return /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between gap-3 pt-3 mt-3 border-t text-xs text-muted-foreground flex-wrap", children: [
    /* @__PURE__ */ jsxs("div", { children: [
      start.toLocaleString("tr-TR"),
      "–",
      end.toLocaleString("tr-TR"),
      " / ",
      total.toLocaleString("tr-TR")
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1", children: [
      /* @__PURE__ */ jsx(Button, { variant: "outline", size: "sm", className: "h-7 px-2", onClick: () => onPage(1), disabled: page <= 1, children: "«" }),
      /* @__PURE__ */ jsx(Button, { variant: "outline", size: "sm", className: "h-7 px-2", onClick: () => onPage(page - 1), disabled: page <= 1, children: /* @__PURE__ */ jsx(ChevronLeft, { className: "h-3.5 w-3.5" }) }),
      /* @__PURE__ */ jsxs("span", { className: "px-2", children: [
        "Sayfa ",
        page,
        " / ",
        totalPages
      ] }),
      /* @__PURE__ */ jsx(Button, { variant: "outline", size: "sm", className: "h-7 px-2", onClick: () => onPage(page + 1), disabled: page >= totalPages, children: /* @__PURE__ */ jsx(ChevronRight, { className: "h-3.5 w-3.5" }) }),
      /* @__PURE__ */ jsx(Button, { variant: "outline", size: "sm", className: "h-7 px-2", onClick: () => onPage(totalPages), disabled: page >= totalPages, children: "»" })
    ] })
  ] });
}
function AdminApifyLogs() {
  var _a;
  const { user, loading: authLoading } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [days, setDays] = useState("7");
  const [search, setSearch] = useState("");
  const [platformFilter, setPlatformFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [providerFilter, setProviderFilter] = useState("all");
  const [apifyPage, setApifyPage] = useState(1);
  const [usersPage, setUsersPage] = useState(1);
  const [repliesPage, setRepliesPage] = useState(1);
  const [emailsPage, setEmailsPage] = useState(1);
  const [integrationsPage, setIntegrationsPage] = useState(1);
  useEffect(() => {
    setApifyPage(1);
  }, [search, platformFilter, statusFilter, days]);
  useEffect(() => {
    setUsersPage(1);
  }, [search, days]);
  useEffect(() => {
    setRepliesPage(1);
  }, [search, days]);
  useEffect(() => {
    setEmailsPage(1);
  }, [search, days]);
  useEffect(() => {
    setIntegrationsPage(1);
  }, [search, providerFilter, days]);
  const isAdmin = ((_a = user == null ? void 0 : user.email) == null ? void 0 : _a.toLowerCase()) === ADMIN_EMAIL.toLowerCase();
  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: resp, error } = await supabase.functions.invoke(
        `admin-apify-overview?days=${days}`,
        { method: "GET" }
      );
      if (error) throw error;
      setData(resp);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    if (isAdmin) fetchData();
  }, [isAdmin, days]);
  const filteredApifyLogs = useMemo(() => {
    if (!data) return [];
    const q = search.toLowerCase();
    return data.apify.logs.filter((l) => {
      if (platformFilter !== "all" && l.platform !== platformFilter) return false;
      if (statusFilter !== "all" && l.status !== statusFilter) return false;
      if (q && !`${l.business_name} ${l.platform}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [data, platformFilter, statusFilter, search]);
  const filteredIntegrations = useMemo(() => {
    if (!data) return [];
    const q = search.toLowerCase();
    return data.integrations.list.filter((l) => {
      if (providerFilter !== "all" && l.provider !== providerFilter) return false;
      if (q && !`${l.business_name} ${l.provider} ${l.action}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [data, providerFilter, search]);
  const filteredUsers = useMemo(() => {
    if (!data) return [];
    const q = search.toLowerCase();
    if (!q) return data.users.list;
    return data.users.list.filter(
      (u) => `${u.email} ${u.full_name}`.toLowerCase().includes(q)
    );
  }, [data, search]);
  const filteredReplies = useMemo(() => {
    if (!data) return [];
    const q = search.toLowerCase();
    if (!q) return data.reply_logs.list;
    return data.reply_logs.list.filter(
      (r) => `${r.business_name} ${r.user_email} ${r.reply_text}`.toLowerCase().includes(q)
    );
  }, [data, search]);
  const filteredEmails = useMemo(() => {
    if (!data) return [];
    const q = search.toLowerCase();
    if (!q) return data.email_logs.list;
    return data.email_logs.list.filter(
      (e) => `${e.recipient_email} ${e.subject} ${e.business_name}`.toLowerCase().includes(q)
    );
  }, [data, search]);
  const apifyPaged = useMemo(() => paginate(filteredApifyLogs, apifyPage), [filteredApifyLogs, apifyPage]);
  const usersPaged = useMemo(() => paginate(filteredUsers, usersPage), [filteredUsers, usersPage]);
  const repliesPaged = useMemo(() => paginate(filteredReplies, repliesPage), [filteredReplies, repliesPage]);
  const emailsPaged = useMemo(() => paginate(filteredEmails, emailsPage), [filteredEmails, emailsPage]);
  const integrationsPaged = useMemo(() => paginate(filteredIntegrations, integrationsPage), [filteredIntegrations, integrationsPage]);
  if (authLoading) {
    return /* @__PURE__ */ jsx("div", { className: "flex items-center justify-center min-h-screen", children: /* @__PURE__ */ jsx(Loader2, { className: "h-8 w-8 animate-spin text-primary" }) });
  }
  if (!user) return /* @__PURE__ */ jsx(Navigate, { to: "/login?redirect=/admin/apify-logs", replace: true });
  if (!isAdmin) return /* @__PURE__ */ jsx(Navigate, { to: "/dashboard", replace: true });
  const platforms = data ? Object.keys(data.apify.by_platform).sort() : [];
  const providers = data ? Object.keys(data.integrations.by_provider).sort() : [];
  return /* @__PURE__ */ jsx("div", { className: "min-h-screen bg-background p-4 sm:p-6 lg:p-8", children: /* @__PURE__ */ jsxs("div", { className: "max-w-7xl mx-auto space-y-6", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between flex-wrap gap-3", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h1", { className: "text-2xl sm:text-3xl font-bold", children: "Admin Aktivite Paneli" }),
        /* @__PURE__ */ jsxs("p", { className: "text-sm text-muted-foreground mt-1", children: [
          "Yalnızca ",
          ADMIN_EMAIL,
          " erişebilir. Sistemdeki her aktiviteyi gör."
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxs("div", { className: "relative", children: [
          /* @__PURE__ */ jsx(Search, { className: "absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" }),
          /* @__PURE__ */ jsx(
            Input,
            {
              placeholder: "Ara...",
              value: search,
              onChange: (e) => setSearch(e.target.value),
              className: "pl-8 w-[200px]"
            }
          )
        ] }),
        /* @__PURE__ */ jsxs(Select, { value: days, onValueChange: setDays, children: [
          /* @__PURE__ */ jsx(SelectTrigger, { className: "w-[140px]", children: /* @__PURE__ */ jsx(SelectValue, {}) }),
          /* @__PURE__ */ jsxs(SelectContent, { children: [
            /* @__PURE__ */ jsx(SelectItem, { value: "1", children: "Son 24 saat" }),
            /* @__PURE__ */ jsx(SelectItem, { value: "3", children: "Son 3 gün" }),
            /* @__PURE__ */ jsx(SelectItem, { value: "7", children: "Son 7 gün" }),
            /* @__PURE__ */ jsx(SelectItem, { value: "30", children: "Son 30 gün" }),
            /* @__PURE__ */ jsx(SelectItem, { value: "90", children: "Son 90 gün" })
          ] })
        ] }),
        /* @__PURE__ */ jsx(Button, { variant: "outline", size: "icon", onClick: fetchData, disabled: loading, children: /* @__PURE__ */ jsx(RefreshCw, { className: `h-4 w-4 ${loading ? "animate-spin" : ""}` }) })
      ] })
    ] }),
    loading && !data && /* @__PURE__ */ jsx("div", { className: "flex items-center justify-center py-12", children: /* @__PURE__ */ jsx(Loader2, { className: "h-8 w-8 animate-spin text-primary" }) }),
    data && /* @__PURE__ */ jsxs(Tabs, { defaultValue: "apify", className: "space-y-4", children: [
      /* @__PURE__ */ jsxs(TabsList, { className: "grid grid-cols-6 w-full max-w-3xl", children: [
        /* @__PURE__ */ jsxs(TabsTrigger, { value: "apify", children: [
          "Apify (",
          data.apify.totals.total_runs,
          ")"
        ] }),
        /* @__PURE__ */ jsxs(TabsTrigger, { value: "users", children: [
          "Kullanıcılar (",
          data.users.total,
          ")"
        ] }),
        /* @__PURE__ */ jsxs(TabsTrigger, { value: "replies", children: [
          "Yanıtlar (",
          data.reply_logs.total,
          ")"
        ] }),
        /* @__PURE__ */ jsxs(TabsTrigger, { value: "emails", children: [
          "Mailler (",
          data.email_logs.total,
          ")"
        ] }),
        /* @__PURE__ */ jsxs(TabsTrigger, { value: "integrations", children: [
          "Tüm Logs (",
          data.integrations.total,
          ")"
        ] }),
        /* @__PURE__ */ jsx(TabsTrigger, { value: "cron", children: "Cron Joblar" })
      ] }),
      /* @__PURE__ */ jsx(TabsContent, { value: "cron", children: /* @__PURE__ */ jsx(AdminCronJobs, {}) }),
      /* @__PURE__ */ jsxs(TabsContent, { value: "apify", className: "space-y-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-3", children: [
          /* @__PURE__ */ jsx(SummaryCard, { label: "Toplam Run", value: data.apify.totals.total_runs }),
          /* @__PURE__ */ jsx(SummaryCard, { label: "Başarılı", value: data.apify.totals.success, tone: "success" }),
          /* @__PURE__ */ jsx(SummaryCard, { label: "Skip", value: data.apify.totals.skipped, tone: "muted" }),
          /* @__PURE__ */ jsx(SummaryCard, { label: "Hatalı", value: data.apify.totals.failed, tone: "error" }),
          /* @__PURE__ */ jsx(SummaryCard, { label: "Çekilen Toplam", value: data.apify.totals.total_fetched }),
          /* @__PURE__ */ jsx(SummaryCard, { label: "Yeni Eklenen", value: data.apify.totals.total_inserted, tone: "success" }),
          /* @__PURE__ */ jsx(SummaryCard, { label: "Güncellenen", value: data.apify.totals.total_updated }),
          /* @__PURE__ */ jsx(SummaryCard, { label: "Admin Mail", value: data.apify.totals.success, tone: "info" })
        ] }),
        /* @__PURE__ */ jsxs(Card, { children: [
          /* @__PURE__ */ jsx(CardHeader, { children: /* @__PURE__ */ jsx(CardTitle, { className: "text-base", children: "Platform Dağılımı" }) }),
          /* @__PURE__ */ jsx(CardContent, { children: /* @__PURE__ */ jsxs(Table, { children: [
            /* @__PURE__ */ jsx(TableHeader, { children: /* @__PURE__ */ jsxs(TableRow, { children: [
              /* @__PURE__ */ jsx(TableHead, { children: "Platform" }),
              /* @__PURE__ */ jsx(TableHead, { className: "text-right", children: "Run" }),
              /* @__PURE__ */ jsx(TableHead, { className: "text-right", children: "Skip" }),
              /* @__PURE__ */ jsx(TableHead, { className: "text-right", children: "Yeni" }),
              /* @__PURE__ */ jsx(TableHead, { className: "text-right", children: "Güncel" })
            ] }) }),
            /* @__PURE__ */ jsx(TableBody, { children: Object.entries(data.apify.by_platform).sort().map(([p, v]) => /* @__PURE__ */ jsxs(TableRow, { children: [
              /* @__PURE__ */ jsx(TableCell, { className: "font-medium capitalize", children: p }),
              /* @__PURE__ */ jsx(TableCell, { className: "text-right", children: v.runs }),
              /* @__PURE__ */ jsx(TableCell, { className: "text-right text-muted-foreground", children: v.skipped_runs }),
              /* @__PURE__ */ jsx(TableCell, { className: "text-right font-semibold text-green-600", children: v.inserted }),
              /* @__PURE__ */ jsx(TableCell, { className: "text-right", children: v.updated })
            ] }, p)) })
          ] }) })
        ] }),
        /* @__PURE__ */ jsxs(Card, { children: [
          /* @__PURE__ */ jsx(CardHeader, { children: /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between flex-wrap gap-3", children: [
            /* @__PURE__ */ jsxs(CardTitle, { className: "text-base", children: [
              "Detaylı Log (",
              filteredApifyLogs.length,
              ")"
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
              /* @__PURE__ */ jsxs(Select, { value: platformFilter, onValueChange: setPlatformFilter, children: [
                /* @__PURE__ */ jsx(SelectTrigger, { className: "w-[160px]", children: /* @__PURE__ */ jsx(SelectValue, {}) }),
                /* @__PURE__ */ jsxs(SelectContent, { children: [
                  /* @__PURE__ */ jsx(SelectItem, { value: "all", children: "Tüm platformlar" }),
                  platforms.map((p) => /* @__PURE__ */ jsx(SelectItem, { value: p, className: "capitalize", children: p }, p))
                ] })
              ] }),
              /* @__PURE__ */ jsxs(Select, { value: statusFilter, onValueChange: setStatusFilter, children: [
                /* @__PURE__ */ jsx(SelectTrigger, { className: "w-[140px]", children: /* @__PURE__ */ jsx(SelectValue, {}) }),
                /* @__PURE__ */ jsxs(SelectContent, { children: [
                  /* @__PURE__ */ jsx(SelectItem, { value: "all", children: "Tüm durumlar" }),
                  /* @__PURE__ */ jsx(SelectItem, { value: "success", children: "Başarılı" }),
                  /* @__PURE__ */ jsx(SelectItem, { value: "skipped", children: "Skip" }),
                  /* @__PURE__ */ jsx(SelectItem, { value: "error", children: "Hata" })
                ] })
              ] })
            ] })
          ] }) }),
          /* @__PURE__ */ jsxs(CardContent, { className: "overflow-auto", children: [
            /* @__PURE__ */ jsxs(Table, { children: [
              /* @__PURE__ */ jsx(TableHeader, { children: /* @__PURE__ */ jsxs(TableRow, { children: [
                /* @__PURE__ */ jsx(TableHead, { children: "Tarih" }),
                /* @__PURE__ */ jsx(TableHead, { children: "İşletme" }),
                /* @__PURE__ */ jsx(TableHead, { children: "Platform" }),
                /* @__PURE__ */ jsx(TableHead, { children: "Durum" }),
                /* @__PURE__ */ jsx(TableHead, { className: "text-right", children: "Çekilen" }),
                /* @__PURE__ */ jsx(TableHead, { className: "text-right", children: "Yeni" }),
                /* @__PURE__ */ jsx(TableHead, { className: "text-right", children: "Güncel" }),
                /* @__PURE__ */ jsx(TableHead, { children: "Admin Mail" }),
                /* @__PURE__ */ jsx(TableHead, { children: "Detay" })
              ] }) }),
              /* @__PURE__ */ jsxs(TableBody, { children: [
                apifyPaged.pageItems.map((l) => /* @__PURE__ */ jsxs(TableRow, { children: [
                  /* @__PURE__ */ jsx(TableCell, { className: "whitespace-nowrap text-xs", children: format(new Date(l.created_at), "dd MMM HH:mm", { locale: tr }) }),
                  /* @__PURE__ */ jsxs(TableCell, { children: [
                    /* @__PURE__ */ jsx("div", { className: "font-medium", children: l.business_name }),
                    l.business_city && /* @__PURE__ */ jsx("div", { className: "text-xs text-muted-foreground", children: l.business_city })
                  ] }),
                  /* @__PURE__ */ jsx(TableCell, { className: "capitalize", children: l.platform }),
                  /* @__PURE__ */ jsx(TableCell, { children: /* @__PURE__ */ jsx(StatusBadge, { status: l.status }) }),
                  /* @__PURE__ */ jsx(TableCell, { className: "text-right", children: l.fetched || "-" }),
                  /* @__PURE__ */ jsx(TableCell, { className: "text-right font-semibold text-green-600", children: l.inserted || "-" }),
                  /* @__PURE__ */ jsx(TableCell, { className: "text-right", children: l.updated || "-" }),
                  /* @__PURE__ */ jsx(TableCell, { children: l.admin_email_sent ? /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1 text-xs text-green-700", children: [
                    /* @__PURE__ */ jsx(Mail, { className: "h-3.5 w-3.5" }),
                    /* @__PURE__ */ jsx("span", { className: "truncate max-w-[140px]", children: l.admin_email_to })
                  ] }) : /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1 text-xs text-muted-foreground", children: [
                    /* @__PURE__ */ jsx(MailX, { className: "h-3.5 w-3.5" }),
                    /* @__PURE__ */ jsx("span", { children: "Yok" })
                  ] }) }),
                  /* @__PURE__ */ jsxs(TableCell, { className: "text-xs text-muted-foreground max-w-[220px]", children: [
                    l.skip_reason && /* @__PURE__ */ jsx("span", { children: l.skip_reason }),
                    l.error_message && /* @__PURE__ */ jsx("span", { className: "text-destructive", children: l.error_message })
                  ] })
                ] }, l.id)),
                filteredApifyLogs.length === 0 && /* @__PURE__ */ jsx(TableRow, { children: /* @__PURE__ */ jsx(TableCell, { colSpan: 9, className: "text-center text-muted-foreground py-8", children: "Kayıt yok." }) })
              ] })
            ] }),
            /* @__PURE__ */ jsx(Pager, { page: apifyPaged.safePage, totalPages: apifyPaged.totalPages, total: apifyPaged.total, onPage: setApifyPage })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsx(TabsContent, { value: "users", children: /* @__PURE__ */ jsxs(Card, { children: [
        /* @__PURE__ */ jsx(CardHeader, { children: /* @__PURE__ */ jsxs(CardTitle, { className: "text-base", children: [
          "Tüm Kullanıcılar (",
          filteredUsers.length,
          ")"
        ] }) }),
        /* @__PURE__ */ jsxs(CardContent, { className: "overflow-auto", children: [
          /* @__PURE__ */ jsxs(Table, { children: [
            /* @__PURE__ */ jsx(TableHeader, { children: /* @__PURE__ */ jsxs(TableRow, { children: [
              /* @__PURE__ */ jsx(TableHead, { children: "E-posta" }),
              /* @__PURE__ */ jsx(TableHead, { children: "Ad Soyad" }),
              /* @__PURE__ */ jsx(TableHead, { children: "Rol" }),
              /* @__PURE__ */ jsx(TableHead, { className: "text-right", children: "İşletme" }),
              /* @__PURE__ */ jsx(TableHead, { children: "Kayıt" }),
              /* @__PURE__ */ jsx(TableHead, { children: "Son Giriş" })
            ] }) }),
            /* @__PURE__ */ jsxs(TableBody, { children: [
              usersPaged.pageItems.map((u) => /* @__PURE__ */ jsxs(TableRow, { children: [
                /* @__PURE__ */ jsx(TableCell, { className: "font-medium text-sm", children: u.email }),
                /* @__PURE__ */ jsx(TableCell, { className: "text-sm", children: u.full_name }),
                /* @__PURE__ */ jsx(TableCell, { children: /* @__PURE__ */ jsx(Badge, { variant: "outline", className: "capitalize", children: u.role }) }),
                /* @__PURE__ */ jsx(TableCell, { className: "text-right", children: u.business_count }),
                /* @__PURE__ */ jsx(TableCell, { className: "text-xs text-muted-foreground", children: format(new Date(u.created_at), "dd MMM yyyy", { locale: tr }) }),
                /* @__PURE__ */ jsx(TableCell, { className: "text-xs text-muted-foreground", children: u.last_sign_in_at ? format(new Date(u.last_sign_in_at), "dd MMM HH:mm", { locale: tr }) : "Hiç" })
              ] }, u.id)),
              filteredUsers.length === 0 && /* @__PURE__ */ jsx(TableRow, { children: /* @__PURE__ */ jsx(TableCell, { colSpan: 6, className: "text-center text-muted-foreground py-8", children: "Kayıt yok." }) })
            ] })
          ] }),
          /* @__PURE__ */ jsx(Pager, { page: usersPaged.safePage, totalPages: usersPaged.totalPages, total: usersPaged.total, onPage: setUsersPage })
        ] })
      ] }) }),
      /* @__PURE__ */ jsx(TabsContent, { value: "replies", children: /* @__PURE__ */ jsxs(Card, { children: [
        /* @__PURE__ */ jsx(CardHeader, { children: /* @__PURE__ */ jsxs(CardTitle, { className: "text-base", children: [
          "Yorum Yanıtları (",
          filteredReplies.length,
          ")"
        ] }) }),
        /* @__PURE__ */ jsxs(CardContent, { className: "overflow-auto", children: [
          /* @__PURE__ */ jsxs(Table, { children: [
            /* @__PURE__ */ jsx(TableHeader, { children: /* @__PURE__ */ jsxs(TableRow, { children: [
              /* @__PURE__ */ jsx(TableHead, { children: "Tarih" }),
              /* @__PURE__ */ jsx(TableHead, { children: "Kullanıcı" }),
              /* @__PURE__ */ jsx(TableHead, { children: "İşletme" }),
              /* @__PURE__ */ jsx(TableHead, { children: "Kaynak" }),
              /* @__PURE__ */ jsx(TableHead, { children: "Ton" }),
              /* @__PURE__ */ jsx(TableHead, { children: "Yanıt" }),
              /* @__PURE__ */ jsx(TableHead, { children: "Google" })
            ] }) }),
            /* @__PURE__ */ jsxs(TableBody, { children: [
              repliesPaged.pageItems.map((r) => /* @__PURE__ */ jsxs(TableRow, { children: [
                /* @__PURE__ */ jsx(TableCell, { className: "whitespace-nowrap text-xs", children: format(new Date(r.created_at), "dd MMM HH:mm", { locale: tr }) }),
                /* @__PURE__ */ jsx(TableCell, { className: "text-sm", children: r.user_email }),
                /* @__PURE__ */ jsx(TableCell, { className: "text-sm", children: r.business_name }),
                /* @__PURE__ */ jsx(TableCell, { children: /* @__PURE__ */ jsx(Badge, { variant: "outline", className: "capitalize", children: r.reply_source || "-" }) }),
                /* @__PURE__ */ jsx(TableCell, { className: "text-xs capitalize", children: r.tone || "-" }),
                /* @__PURE__ */ jsx(TableCell, { className: "text-xs max-w-[300px] truncate", title: r.reply_text, children: r.reply_text }),
                /* @__PURE__ */ jsxs(TableCell, { children: [
                  r.google_status === "sent" && /* @__PURE__ */ jsx(Badge, { className: "bg-green-100 text-green-800", children: "Gönderildi" }),
                  r.google_status && r.google_status !== "sent" && /* @__PURE__ */ jsx(Badge, { variant: "destructive", children: r.google_status }),
                  !r.google_status && /* @__PURE__ */ jsx("span", { className: "text-muted-foreground text-xs", children: "-" })
                ] })
              ] }, r.id)),
              filteredReplies.length === 0 && /* @__PURE__ */ jsx(TableRow, { children: /* @__PURE__ */ jsx(TableCell, { colSpan: 7, className: "text-center text-muted-foreground py-8", children: "Kayıt yok." }) })
            ] })
          ] }),
          /* @__PURE__ */ jsx(Pager, { page: repliesPaged.safePage, totalPages: repliesPaged.totalPages, total: repliesPaged.total, onPage: setRepliesPage })
        ] })
      ] }) }),
      /* @__PURE__ */ jsx(TabsContent, { value: "emails", children: /* @__PURE__ */ jsxs(Card, { children: [
        /* @__PURE__ */ jsx(CardHeader, { children: /* @__PURE__ */ jsxs(CardTitle, { className: "text-base", children: [
          "E-posta Logları (",
          filteredEmails.length,
          ")"
        ] }) }),
        /* @__PURE__ */ jsxs(CardContent, { className: "overflow-auto", children: [
          /* @__PURE__ */ jsxs(Table, { children: [
            /* @__PURE__ */ jsx(TableHeader, { children: /* @__PURE__ */ jsxs(TableRow, { children: [
              /* @__PURE__ */ jsx(TableHead, { children: "Tarih" }),
              /* @__PURE__ */ jsx(TableHead, { children: "Alıcı" }),
              /* @__PURE__ */ jsx(TableHead, { children: "Konu" }),
              /* @__PURE__ */ jsx(TableHead, { children: "İşletme" }),
              /* @__PURE__ */ jsx(TableHead, { children: "Durum" }),
              /* @__PURE__ */ jsx(TableHead, { children: "Hata" })
            ] }) }),
            /* @__PURE__ */ jsxs(TableBody, { children: [
              emailsPaged.pageItems.map((e) => /* @__PURE__ */ jsxs(TableRow, { children: [
                /* @__PURE__ */ jsx(TableCell, { className: "whitespace-nowrap text-xs", children: format(new Date(e.created_at), "dd MMM HH:mm", { locale: tr }) }),
                /* @__PURE__ */ jsx(TableCell, { className: "text-sm", children: e.recipient_email }),
                /* @__PURE__ */ jsx(TableCell, { className: "text-sm max-w-[280px] truncate", title: e.subject, children: e.subject }),
                /* @__PURE__ */ jsx(TableCell, { className: "text-sm", children: e.business_name }),
                /* @__PURE__ */ jsx(TableCell, { children: /* @__PURE__ */ jsx(StatusBadge, { status: e.status }) }),
                /* @__PURE__ */ jsx(TableCell, { className: "text-xs text-destructive max-w-[200px] truncate", children: e.error_message || "-" })
              ] }, e.id)),
              filteredEmails.length === 0 && /* @__PURE__ */ jsx(TableRow, { children: /* @__PURE__ */ jsx(TableCell, { colSpan: 6, className: "text-center text-muted-foreground py-8", children: "Kayıt yok." }) })
            ] })
          ] }),
          /* @__PURE__ */ jsx(Pager, { page: emailsPaged.safePage, totalPages: emailsPaged.totalPages, total: emailsPaged.total, onPage: setEmailsPage })
        ] })
      ] }) }),
      /* @__PURE__ */ jsxs(TabsContent, { value: "integrations", className: "space-y-4", children: [
        /* @__PURE__ */ jsx("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-3", children: Object.entries(data.integrations.by_provider).map(([p, v]) => /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsxs(CardContent, { className: "p-4", children: [
          /* @__PURE__ */ jsx("div", { className: "text-xs text-muted-foreground capitalize", children: p }),
          /* @__PURE__ */ jsx("div", { className: "text-2xl font-bold mt-1", children: v.total }),
          /* @__PURE__ */ jsxs("div", { className: "text-[11px] text-muted-foreground mt-1", children: [
            "✅ ",
            v.success,
            " · ⏭ ",
            v.skipped,
            " · ❌ ",
            v.failed
          ] })
        ] }) }, p)) }),
        /* @__PURE__ */ jsxs(Card, { children: [
          /* @__PURE__ */ jsx(CardHeader, { children: /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between flex-wrap gap-3", children: [
            /* @__PURE__ */ jsxs(CardTitle, { className: "text-base", children: [
              "Tüm Entegrasyon Logları (",
              filteredIntegrations.length,
              ")"
            ] }),
            /* @__PURE__ */ jsxs(Select, { value: providerFilter, onValueChange: setProviderFilter, children: [
              /* @__PURE__ */ jsx(SelectTrigger, { className: "w-[160px]", children: /* @__PURE__ */ jsx(SelectValue, {}) }),
              /* @__PURE__ */ jsxs(SelectContent, { children: [
                /* @__PURE__ */ jsx(SelectItem, { value: "all", children: "Tüm provider'lar" }),
                providers.map((p) => /* @__PURE__ */ jsx(SelectItem, { value: p, className: "capitalize", children: p }, p))
              ] })
            ] })
          ] }) }),
          /* @__PURE__ */ jsxs(CardContent, { className: "overflow-auto", children: [
            /* @__PURE__ */ jsxs(Table, { children: [
              /* @__PURE__ */ jsx(TableHeader, { children: /* @__PURE__ */ jsxs(TableRow, { children: [
                /* @__PURE__ */ jsx(TableHead, { children: "Tarih" }),
                /* @__PURE__ */ jsx(TableHead, { children: "Provider" }),
                /* @__PURE__ */ jsx(TableHead, { children: "Action" }),
                /* @__PURE__ */ jsx(TableHead, { children: "İşletme" }),
                /* @__PURE__ */ jsx(TableHead, { children: "Durum" }),
                /* @__PURE__ */ jsx(TableHead, { children: "HTTP" }),
                /* @__PURE__ */ jsx(TableHead, { children: "Detay / Hata" })
              ] }) }),
              /* @__PURE__ */ jsxs(TableBody, { children: [
                integrationsPaged.pageItems.map((l) => /* @__PURE__ */ jsxs(TableRow, { children: [
                  /* @__PURE__ */ jsx(TableCell, { className: "whitespace-nowrap text-xs", children: format(new Date(l.created_at), "dd MMM HH:mm", { locale: tr }) }),
                  /* @__PURE__ */ jsx(TableCell, { className: "capitalize", children: /* @__PURE__ */ jsx(Badge, { variant: "outline", children: l.provider }) }),
                  /* @__PURE__ */ jsx(TableCell, { className: "text-xs", children: l.action }),
                  /* @__PURE__ */ jsx(TableCell, { className: "text-sm", children: l.business_name }),
                  /* @__PURE__ */ jsx(TableCell, { children: /* @__PURE__ */ jsx(StatusBadge, { status: l.status }) }),
                  /* @__PURE__ */ jsx(TableCell, { className: "text-xs", children: l.http_status || "-" }),
                  /* @__PURE__ */ jsx(TableCell, { className: "text-xs max-w-[280px] truncate", children: l.error_message ? /* @__PURE__ */ jsx("span", { className: "text-destructive", children: l.error_message }) : /* @__PURE__ */ jsx("span", { className: "text-muted-foreground", children: l.meta_summary }) })
                ] }, l.id)),
                filteredIntegrations.length === 0 && /* @__PURE__ */ jsx(TableRow, { children: /* @__PURE__ */ jsx(TableCell, { colSpan: 7, className: "text-center text-muted-foreground py-8", children: "Kayıt yok." }) })
              ] })
            ] }),
            /* @__PURE__ */ jsx(Pager, { page: integrationsPaged.safePage, totalPages: integrationsPaged.totalPages, total: integrationsPaged.total, onPage: setIntegrationsPage })
          ] })
        ] })
      ] })
    ] })
  ] }) });
}
function StatusBadge({ status }) {
  if (status === "success" || status === "sent") return /* @__PURE__ */ jsx(Badge, { className: "bg-green-100 text-green-800 hover:bg-green-100", children: status });
  if (status === "skipped") return /* @__PURE__ */ jsx(Badge, { variant: "secondary", children: "Skip" });
  return /* @__PURE__ */ jsx(Badge, { variant: "destructive", children: status });
}
function SummaryCard({ label, value, tone }) {
  const toneClass = tone === "success" ? "text-green-600" : tone === "error" ? "text-destructive" : tone === "muted" ? "text-muted-foreground" : tone === "info" ? "text-primary" : "text-foreground";
  return /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsxs(CardContent, { className: "p-4", children: [
    /* @__PURE__ */ jsx("div", { className: "text-xs text-muted-foreground", children: label }),
    /* @__PURE__ */ jsx("div", { className: `text-2xl font-bold mt-1 ${toneClass}`, children: value.toLocaleString("tr-TR") })
  ] }) });
}
export {
  AdminApifyLogs as default
};
