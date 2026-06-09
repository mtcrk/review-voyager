import { jsx, jsxs, Fragment } from "react/jsx-runtime";
import { useState, useMemo } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { ResponsiveContainer, LineChart, CartesianGrid, XAxis, YAxis, Tooltip as Tooltip$1, Legend, Line, ScatterChart, ZAxis, ReferenceLine, Scatter, LabelList, BarChart, Bar, Cell } from "recharts";
import { s as supabase, S as Skeleton, V as TooltipProvider, B as Button, m as Badge, T as Tooltip, C as TooltipTrigger, E as TooltipContent, t as toast, a as useBusiness } from "../main.mjs";
import { C as Card, a as CardHeader, e as CardTitle, c as CardContent } from "./card-vx9BCW0t.js";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-1zED13tY.js";
import { Sparkles, Loader2, Target, TrendingDown, AlertTriangle, DollarSign, ArrowRight, Wrench, MessageCircle, TrendingUp, Minus, MapPin, Star, MessageSquare, Reply, Calendar } from "lucide-react";
import { I as IntelligenceTabs } from "./IntelligenceTabs-Cfq6fxMs.js";
import "vite-react-ssg";
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
import "@radix-ui/react-select";
function topicName(t) {
  var _a, _b;
  return ((_a = t.display_name) == null ? void 0 : _a.tr) ?? ((_b = t.display_name) == null ? void 0 : _b.en) ?? t.id;
}
function sentimentColor(avg, count) {
  if (count === 0) return "bg-muted/30 text-muted-foreground";
  if (avg >= 0.3) return "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300";
  if (avg >= -0.1) return "bg-amber-500/15 text-amber-700 dark:text-amber-300";
  return "bg-rose-500/15 text-rose-700 dark:text-rose-300";
}
function TopicAnalysis({ businessId }) {
  const [analyzing, setAnalyzing] = useState(false);
  const qc = useQueryClient();
  const topicsQ = useQuery({
    queryKey: ["ci_topics_all"],
    queryFn: async () => {
      const { data } = await supabase.from("ci_topics").select("id, category, display_name, applies_to_verticals");
      return (data ?? []).filter(
        (t) => Array.isArray(t.applies_to_verticals) && t.applies_to_verticals.includes("hotel")
      );
    }
  });
  const rowsQ = useQuery({
    queryKey: ["ci_review_topics", businessId],
    enabled: !!businessId,
    queryFn: async () => {
      const { data, error } = await supabase.from("ci_review_topics").select("topic_id, review_source, competitor_id, sentiment, excerpt, review_posted_at").eq("business_id", businessId);
      if (error) throw error;
      return data ?? [];
    }
  });
  const pendingQ = useQuery({
    queryKey: ["ci_topics_pending", businessId],
    enabled: !!businessId,
    queryFn: async () => {
      const [{ count: ownPending }, { data: comps }] = await Promise.all([
        supabase.from("reviews").select("id", { count: "exact", head: true }).eq("business_id", businessId).is("topics_extracted_at", null).not("comment", "is", null),
        supabase.from("ci_competitors").select("id").eq("business_id", businessId).eq("status", "confirmed")
      ]);
      const compIds = (comps ?? []).map((c) => c.id);
      let compPending = 0;
      if (compIds.length > 0) {
        const { count } = await supabase.from("ci_competitor_reviews").select("id", { count: "exact", head: true }).in("competitor_id", compIds).is("topics_extracted_at", null).not("body", "is", null);
        compPending = count ?? 0;
      }
      return { own: ownPending ?? 0, competitor: compPending };
    }
  });
  const topics = topicsQ.data ?? [];
  const rows = rowsQ.data ?? [];
  const stats = useMemo(() => {
    const byTopic = /* @__PURE__ */ new Map();
    for (const r of rows) {
      const e = byTopic.get(r.topic_id) ?? { ownCount: 0, ownSum: 0, compCount: 0, compSum: 0, recentExcerpts: [] };
      if (r.review_source === "own") {
        e.ownCount++;
        e.ownSum += r.sentiment;
      } else {
        e.compCount++;
        e.compSum += r.sentiment;
      }
      if (r.excerpt) e.recentExcerpts.push(r);
      byTopic.set(r.topic_id, e);
    }
    return byTopic;
  }, [rows]);
  const opportunities = useMemo(() => {
    const out = [];
    for (const t of topics) {
      const s = stats.get(t.id);
      if (!s) continue;
      const compAvg = s.compCount > 0 ? s.compSum / s.compCount : 0;
      const ownAvg = s.ownCount > 0 ? s.ownSum / s.ownCount : null;
      if (s.compCount >= 3 && compAvg <= -0.2 && (ownAvg == null || ownAvg >= 0.1)) {
        out.push({ topic: t, compAvg, compCount: s.compCount, ownAvg, ownCount: s.ownCount });
      }
    }
    return out.sort((a, b) => a.compAvg - b.compAvg).slice(0, 6);
  }, [topics, stats]);
  const risks = useMemo(() => {
    const out = [];
    for (const t of topics) {
      const s = stats.get(t.id);
      if (!s) continue;
      const ownAvg = s.ownCount > 0 ? s.ownSum / s.ownCount : 0;
      const compAvg = s.compCount > 0 ? s.compSum / s.compCount : null;
      if (s.ownCount >= 2 && ownAvg <= -0.2 && (compAvg == null || compAvg >= 0.1)) {
        out.push({ topic: t, ownAvg, ownCount: s.ownCount, compAvg, compCount: s.compCount });
      }
    }
    return out.sort((a, b) => a.ownAvg - b.ownAvg).slice(0, 6);
  }, [topics, stats]);
  const heatmap = useMemo(() => {
    const active = topics.map((t) => {
      const s = stats.get(t.id);
      const total = ((s == null ? void 0 : s.ownCount) ?? 0) + ((s == null ? void 0 : s.compCount) ?? 0);
      return { t, s, total };
    }).filter((x) => x.total >= 2).sort((a, b) => b.total - a.total).slice(0, 12);
    return active;
  }, [topics, stats]);
  const totalMentions = rows.length;
  const pending = pendingQ.data;
  const hasPending = ((pending == null ? void 0 : pending.own) ?? 0) + ((pending == null ? void 0 : pending.competitor) ?? 0) > 0;
  async function runAnalysis() {
    setAnalyzing(true);
    const { data, error } = await supabase.functions.invoke("analyze-competitor-topics", {
      body: { business_id: businessId, limit: 80 }
    });
    setAnalyzing(false);
    if (error) {
      toast({ title: "Analiz başarısız", description: error.message, variant: "destructive" });
      return;
    }
    const analyzed = (data == null ? void 0 : data.analyzed) ?? 0;
    const mentions = (data == null ? void 0 : data.mentions) ?? 0;
    toast({
      title: analyzed === 0 ? "Yeni yorum yok" : "Konu analizi tamamlandı",
      description: analyzed === 0 ? "Analiz edilecek yeni yorum bulunamadı." : `${analyzed} yorum işlendi, ${mentions} konu bahsi çıkarıldı.`
    });
    qc.invalidateQueries({ queryKey: ["ci_review_topics", businessId] });
    qc.invalidateQueries({ queryKey: ["ci_topics_pending", businessId] });
  }
  if (topicsQ.isLoading || rowsQ.isLoading) {
    return /* @__PURE__ */ jsx(Skeleton, { className: "h-64 w-full" });
  }
  return /* @__PURE__ */ jsx(TooltipProvider, { delayDuration: 200, children: /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsxs(CardHeader, { className: "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 space-y-0", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsxs(CardTitle, { className: "text-base flex items-center gap-2", children: [
          /* @__PURE__ */ jsx(Sparkles, { className: "h-4 w-4 text-primary" }),
          " Konu & Sentiment Analizi"
        ] }),
        /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground mt-1", children: totalMentions === 0 ? "Yorumlardan konu çıkarımı henüz yapılmadı." : `${totalMentions} konu bahsi · ${hasPending ? `${((pending == null ? void 0 : pending.own) ?? 0) + ((pending == null ? void 0 : pending.competitor) ?? 0)} yeni yorum analiz bekliyor` : "Tümü güncel"}` })
      ] }),
      /* @__PURE__ */ jsxs(Button, { size: "sm", onClick: runAnalysis, disabled: analyzing || !hasPending && totalMentions > 0, children: [
        analyzing ? /* @__PURE__ */ jsx(Loader2, { className: "h-4 w-4 animate-spin" }) : /* @__PURE__ */ jsx(Sparkles, { className: "h-4 w-4" }),
        totalMentions === 0 ? "Konuları Analiz Et" : "Yeniden Analiz"
      ] })
    ] }) }),
    totalMentions === 0 ? /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsx(CardContent, { className: "p-8 text-center text-sm text-muted-foreground", children: hasPending ? `Hazır: ${(pending == null ? void 0 : pending.own) ?? 0} yorumunuz ve ${(pending == null ? void 0 : pending.competitor) ?? 0} rakip yorumu analiz bekliyor. "Konuları Analiz Et" butonuna basın.` : "Henüz analiz edilecek yorum yok. Önce kendi yorumlarınızı çekin ve rakip yorumlarını toplayın." }) }) : /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [
        /* @__PURE__ */ jsxs(Card, { children: [
          /* @__PURE__ */ jsxs(CardHeader, { className: "pb-3", children: [
            /* @__PURE__ */ jsxs(CardTitle, { className: "text-sm flex items-center gap-2", children: [
              /* @__PURE__ */ jsx(Target, { className: "h-4 w-4 text-emerald-600" }),
              " Sizin için fırsatlar"
            ] }),
            /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: "Rakiplerde negatif yükseliyor — sizin reklamlarınızda öne çıkarabilirsiniz." })
          ] }),
          /* @__PURE__ */ jsx(CardContent, { className: "space-y-2", children: opportunities.length === 0 ? /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: "Şu an belirgin fırsat yok." }) : opportunities.map(({ topic, compAvg, compCount, ownAvg }) => /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between gap-2 text-sm py-1.5 border-b last:border-b-0", children: [
            /* @__PURE__ */ jsxs("div", { className: "min-w-0", children: [
              /* @__PURE__ */ jsx("div", { className: "font-medium truncate", children: topicName(topic) }),
              /* @__PURE__ */ jsxs("div", { className: "text-xs text-muted-foreground", children: [
                "Rakipte ",
                compCount,
                " negatif şikayet",
                ownAvg != null && ` · sizde ${ownAvg > 0 ? "pozitif" : "nötr"}`
              ] })
            ] }),
            /* @__PURE__ */ jsxs(Badge, { variant: "outline", className: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30", children: [
              /* @__PURE__ */ jsx(TrendingDown, { className: "h-3 w-3 mr-1" }),
              compAvg.toFixed(2)
            ] })
          ] }, topic.id)) })
        ] }),
        /* @__PURE__ */ jsxs(Card, { children: [
          /* @__PURE__ */ jsxs(CardHeader, { className: "pb-3", children: [
            /* @__PURE__ */ jsxs(CardTitle, { className: "text-sm flex items-center gap-2", children: [
              /* @__PURE__ */ jsx(AlertTriangle, { className: "h-4 w-4 text-rose-600" }),
              " Sizin için riskler"
            ] }),
            /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: "Sizde tekrarlayan şikayet, rakiplerinizde yok — acil aksiyon alın." })
          ] }),
          /* @__PURE__ */ jsx(CardContent, { className: "space-y-2", children: risks.length === 0 ? /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: "Belirgin risk yok." }) : risks.map(({ topic, ownAvg, ownCount, compAvg }) => /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between gap-2 text-sm py-1.5 border-b last:border-b-0", children: [
            /* @__PURE__ */ jsxs("div", { className: "min-w-0", children: [
              /* @__PURE__ */ jsx("div", { className: "font-medium truncate", children: topicName(topic) }),
              /* @__PURE__ */ jsxs("div", { className: "text-xs text-muted-foreground", children: [
                ownCount,
                " negatif yorumunuz",
                compAvg != null && ` · rakipte ${compAvg > 0 ? "pozitif" : "nötr"}`
              ] })
            ] }),
            /* @__PURE__ */ jsxs(Badge, { variant: "outline", className: "bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/30", children: [
              /* @__PURE__ */ jsx(TrendingDown, { className: "h-3 w-3 mr-1" }),
              ownAvg.toFixed(2)
            ] })
          ] }, topic.id)) })
        ] })
      ] }),
      /* @__PURE__ */ jsxs(Card, { children: [
        /* @__PURE__ */ jsxs(CardHeader, { className: "pb-3", children: [
          /* @__PURE__ */ jsx(CardTitle, { className: "text-sm", children: "Konu sentiment matrisi" }),
          /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: "Yeşil pozitif, kırmızı negatif. Hover ile yorum sayısı." })
        ] }),
        /* @__PURE__ */ jsxs(CardContent, { children: [
          /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-2", children: heatmap.map(({ t, s }) => {
            const ownAvg = s && s.ownCount > 0 ? s.ownSum / s.ownCount : 0;
            const compAvg = s && s.compCount > 0 ? s.compSum / s.compCount : 0;
            return /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-sm", children: [
              /* @__PURE__ */ jsx("div", { className: "flex-1 truncate font-medium", children: topicName(t) }),
              /* @__PURE__ */ jsxs(Tooltip, { children: [
                /* @__PURE__ */ jsx(TooltipTrigger, { asChild: true, children: /* @__PURE__ */ jsx("div", { className: `h-8 w-16 rounded text-xs font-medium flex items-center justify-center ${sentimentColor(ownAvg, (s == null ? void 0 : s.ownCount) ?? 0)}`, children: (s == null ? void 0 : s.ownCount) ? ownAvg.toFixed(2) : "—" }) }),
                /* @__PURE__ */ jsxs(TooltipContent, { children: [
                  "Sizde: ",
                  (s == null ? void 0 : s.ownCount) ?? 0,
                  " yorum"
                ] })
              ] }),
              /* @__PURE__ */ jsxs(Tooltip, { children: [
                /* @__PURE__ */ jsx(TooltipTrigger, { asChild: true, children: /* @__PURE__ */ jsx("div", { className: `h-8 w-16 rounded text-xs font-medium flex items-center justify-center ${sentimentColor(compAvg, (s == null ? void 0 : s.compCount) ?? 0)}`, children: (s == null ? void 0 : s.compCount) ? compAvg.toFixed(2) : "—" }) }),
                /* @__PURE__ */ jsxs(TooltipContent, { children: [
                  "Rakipte: ",
                  (s == null ? void 0 : s.compCount) ?? 0,
                  " yorum"
                ] })
              ] })
            ] }, t.id);
          }) }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 text-xs text-muted-foreground mt-4 pt-3 border-t", children: [
            /* @__PURE__ */ jsxs("span", { children: [
              "Sol: ",
              /* @__PURE__ */ jsx("span", { className: "font-medium text-foreground", children: "Siz" })
            ] }),
            /* @__PURE__ */ jsx("span", { children: "·" }),
            /* @__PURE__ */ jsxs("span", { children: [
              "Sağ: ",
              /* @__PURE__ */ jsx("span", { className: "font-medium text-foreground", children: "Rakip ortalaması" })
            ] })
          ] })
        ] })
      ] })
    ] })
  ] }) });
}
function topicLabel(t) {
  var _a, _b;
  if (!t) return "—";
  return ((_a = t.display_name) == null ? void 0 : _a.tr) ?? ((_b = t.display_name) == null ? void 0 : _b.en) ?? t.id;
}
function median(values) {
  if (values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}
function hoursBetween(a, b) {
  return (new Date(b).getTime() - new Date(a).getTime()) / 36e5;
}
function fmtHours(h) {
  if (h == null) return "—";
  if (h < 1) return "<1 sa";
  if (h < 48) return `${Math.round(h)} sa`;
  return `${Math.round(h / 24)} gün`;
}
function ActionPack({ businessId }) {
  const q = useQuery({
    queryKey: ["action-pack", businessId],
    enabled: !!businessId,
    queryFn: async () => {
      const [{ data: biz2 }, { data: comps2 }, { data: ownReviews2 }, { data: topics2 }] = await Promise.all([
        supabase.from("businesses").select("id,name,star_rating,segment,price_tier,price_estimate_eur").eq("id", businessId).maybeSingle(),
        supabase.from("ci_competitors").select("id,name,rating,review_count,star_rating,segment,price_tier,price_estimate_eur").eq("business_id", businessId).eq("status", "confirmed"),
        supabase.from("reviews").select("rating,status,approved_reply,posted_at,replied_at").eq("business_id", businessId).order("posted_at", { ascending: false }).limit(1e3),
        supabase.from("ci_topics").select("id,display_name,applies_to_verticals")
      ]);
      const compIds = (comps2 ?? []).map((c) => c.id);
      let compReviews2 = [];
      let topicRows2 = [];
      if (compIds.length > 0) {
        const [crRes, trRes] = await Promise.all([
          supabase.from("ci_competitor_reviews").select("competitor_id,rating,posted_at,owner_reply_text,owner_reply_at").in("competitor_id", compIds).limit(2e4),
          supabase.from("ci_review_topics").select("topic_id,review_source,sentiment,competitor_id").eq("business_id", businessId)
        ]);
        compReviews2 = crRes.data ?? [];
        topicRows2 = trRes.data ?? [];
      }
      return {
        biz: biz2,
        comps: comps2 ?? [],
        ownReviews: ownReviews2 ?? [],
        topics: (topics2 ?? []).filter(
          (t) => Array.isArray(t.applies_to_verticals) && t.applies_to_verticals.includes("hotel")
        ),
        compReviews: compReviews2,
        topicRows: topicRows2
      };
    }
  });
  if (q.isLoading) {
    return /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-3", children: [0, 1, 2].map((i) => /* @__PURE__ */ jsx(Skeleton, { className: "h-56 w-full" }, i)) });
  }
  const data = q.data;
  if (!data || data.comps.length === 0) return null;
  const { biz, comps, ownReviews, topics, compReviews, topicRows } = data;
  const ownRatings = ownReviews.map((r) => r.rating).filter((n) => n != null);
  const ownAvg = ownRatings.length ? ownRatings.reduce((a, b) => a + b, 0) / ownRatings.length : null;
  const peers = comps.filter((c) => {
    if ((biz == null ? void 0 : biz.segment) && c.segment) return c.segment === biz.segment;
    if ((biz == null ? void 0 : biz.star_rating) != null && c.star_rating != null)
      return Math.abs(Number(biz.star_rating) - Number(c.star_rating)) < 0.6;
    return true;
  });
  const peerSet = peers.length > 0 ? peers : comps;
  const peerRatings = peerSet.map((c) => c.rating).filter((n) => n != null);
  const peerAvg = peerRatings.length ? peerRatings.reduce((a, b) => a + b, 0) / peerRatings.length : null;
  const peerPriceTiers = peerSet.map((c) => c.price_tier).filter((n) => n != null);
  peerPriceTiers.length ? peerPriceTiers.reduce((a, b) => a + b, 0) / peerPriceTiers.length : null;
  const peerPriceEur = (() => {
    const arr = peerSet.map((c) => c.price_estimate_eur).filter((n) => n != null);
    return arr.length ? arr.reduce((a, b) => Number(a) + Number(b), 0) / arr.length : null;
  })();
  const ownPriceEur = (biz == null ? void 0 : biz.price_estimate_eur) != null ? Number(biz.price_estimate_eur) : null;
  let priceVerdict;
  if (ownAvg == null || peerAvg == null) {
    priceVerdict = {
      tone: "info",
      title: "Daha fazla veri gerekli",
      detail: "Kendi yorumlarınızı bağlayın ve segment + yıldız bilgisini girin."
    };
  } else if (ownAvg >= peerAvg + 0.2 && (ownPriceEur == null || peerPriceEur == null || ownPriceEur <= peerPriceEur)) {
    priceVerdict = {
      tone: "good",
      title: "Fiyatı yukarı çekme fırsatı",
      detail: `Puanınız emsalin ${(ownAvg - peerAvg).toFixed(1)} üzerinde. %5-10 fiyat artışını test edin.`
    };
  } else if (ownAvg <= peerAvg - 0.2) {
    priceVerdict = {
      tone: "bad",
      title: "Fiyatı sabit tutun",
      detail: "Puan emsalin altında. Önce operasyonel sorunları çözmeden fiyat artışı riskli."
    };
  } else if (ownPriceEur != null && peerPriceEur != null && ownPriceEur > peerPriceEur * 1.1) {
    priceVerdict = {
      tone: "warn",
      title: "Promosyon/paket önerisi",
      detail: "Puan emsalle aynı ama fiyatınız yüksek. Erken rezervasyon paketi düşünün."
    };
  } else {
    priceVerdict = {
      tone: "good",
      title: "Konumunuz dengeli",
      detail: "Puan ve fiyat emsalle uyumlu. Volume artırma odaklı kampanyalar deneyin."
    };
  }
  const ownTopicStats = /* @__PURE__ */ new Map();
  const compTopicStats = /* @__PURE__ */ new Map();
  for (const r of topicRows) {
    const target = r.review_source === "own" ? ownTopicStats : compTopicStats;
    const e = target.get(r.topic_id) ?? { neg: 0, pos: 0, total: 0, sentSum: 0 };
    e.total += 1;
    e.sentSum = (e.sentSum ?? 0) + Number(r.sentiment);
    if (Number(r.sentiment) <= -0.2) e.neg += 1;
    else if (Number(r.sentiment) >= 0.2) e.pos += 1;
    target.set(r.topic_id, e);
  }
  const opsList = topics.map((t) => {
    const o = ownTopicStats.get(t.id) ?? { neg: 0, pos: 0, total: 0 };
    const c = compTopicStats.get(t.id) ?? { neg: 0, pos: 0, total: 0, sentSum: 0 };
    const compAvg = c.total > 0 ? (c.sentSum ?? 0) / c.total : 0;
    let priority = o.neg * 2 + c.neg * 1 - o.pos * 0.5;
    if (compAvg > 0.1 && o.neg > 0) priority *= 1.5;
    return { topic: t, ownNeg: o.neg, compNeg: c.neg, compAvg, priority };
  }).filter((x) => x.priority > 0).sort((a, b) => b.priority - a.priority).slice(0, 3);
  const ownTotal = ownReviews.length;
  const ownReplied = ownReviews.filter((r) => r.approved_reply || r.status === "replied");
  const ownReplyRate = ownTotal > 0 ? ownReplied.length / ownTotal * 100 : 0;
  const ownReplyTimes = ownReplied.filter((r) => r.posted_at && r.replied_at).map((r) => hoursBetween(r.posted_at, r.replied_at));
  const ownMedianReply = median(ownReplyTimes);
  const compTotal = compReviews.length;
  const compRepliedRows = compReviews.filter((r) => r.owner_reply_text);
  const compReplyRate = compTotal > 0 ? compRepliedRows.length / compTotal * 100 : null;
  const compReplyTimes = compRepliedRows.filter((r) => r.posted_at && r.owner_reply_at).map((r) => hoursBetween(r.posted_at, r.owner_reply_at));
  const compMedianReply = median(compReplyTimes);
  const unansweredCount = ownReviews.filter(
    (r) => !r.approved_reply && r.status !== "replied"
  ).length;
  function rateTone(own, comp, higherBetter = true) {
    if (own == null || comp == null) return "info";
    const diff = own - comp;
    const good = higherBetter ? diff > 5 : diff < -5;
    const bad = higherBetter ? diff < -5 : diff > 5;
    if (good) return "good";
    if (bad) return "bad";
    return "warn";
  }
  const rateBadge = rateTone(ownReplyRate, compReplyRate, true);
  const timeBadge = rateTone(
    ownMedianReply == null ? null : -ownMedianReply,
    compMedianReply == null ? null : -compMedianReply,
    true
  );
  const toneClass = (t) => t === "good" ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30" : t === "bad" ? "bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/30" : t === "warn" ? "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30" : "bg-muted text-muted-foreground border-border";
  const ToneIcon = ({ t }) => t === "good" ? /* @__PURE__ */ jsx(TrendingUp, { className: "h-3 w-3" }) : t === "bad" ? /* @__PURE__ */ jsx(TrendingDown, { className: "h-3 w-3" }) : /* @__PURE__ */ jsx(Minus, { className: "h-3 w-3" });
  return /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-3", children: [
    /* @__PURE__ */ jsxs(Card, { children: [
      /* @__PURE__ */ jsxs(CardHeader, { className: "pb-3", children: [
        /* @__PURE__ */ jsxs(CardTitle, { className: "text-sm flex items-center gap-2", children: [
          /* @__PURE__ */ jsx(DollarSign, { className: "h-4 w-4 text-primary" }),
          " Fiyat & Pozisyon"
        ] }),
        /* @__PURE__ */ jsxs("p", { className: "text-xs text-muted-foreground", children: [
          peerSet.length,
          " emsal rakiple karşılaştırma"
        ] })
      ] }),
      /* @__PURE__ */ jsxs(CardContent, { className: "space-y-3", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between text-sm", children: [
          /* @__PURE__ */ jsx("span", { className: "text-muted-foreground", children: "Puanınız" }),
          /* @__PURE__ */ jsx("span", { className: "font-semibold", children: ownAvg != null ? ownAvg.toFixed(2) : "—" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between text-sm", children: [
          /* @__PURE__ */ jsx("span", { className: "text-muted-foreground", children: "Emsal ortalama" }),
          /* @__PURE__ */ jsx("span", { className: "font-semibold", children: peerAvg != null ? peerAvg.toFixed(2) : "—" })
        ] }),
        (ownPriceEur != null || peerPriceEur != null) && /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between text-sm", children: [
          /* @__PURE__ */ jsx("span", { className: "text-muted-foreground", children: "Fiyat (€/gece)" }),
          /* @__PURE__ */ jsxs("span", { className: "font-semibold", children: [
            ownPriceEur != null ? `€${Math.round(ownPriceEur)}` : "—",
            /* @__PURE__ */ jsx("span", { className: "text-muted-foreground font-normal", children: " / " }),
            peerPriceEur != null ? `€${Math.round(peerPriceEur)}` : "—"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: `rounded-md border p-3 text-sm ${toneClass(priceVerdict.tone)}`, children: [
          /* @__PURE__ */ jsxs("div", { className: "font-medium flex items-center gap-1.5", children: [
            /* @__PURE__ */ jsx(ToneIcon, { t: priceVerdict.tone }),
            priceVerdict.title
          ] }),
          /* @__PURE__ */ jsx("p", { className: "text-xs mt-1 opacity-90", children: priceVerdict.detail })
        ] }),
        ownPriceEur == null && /* @__PURE__ */ jsx(Button, { asChild: true, variant: "ghost", size: "sm", className: "w-full h-8 text-xs", children: /* @__PURE__ */ jsxs(Link, { to: "/settings?tab=locations", children: [
          "Oda fiyatı girin ",
          /* @__PURE__ */ jsx(ArrowRight, { className: "h-3 w-3 ml-1" })
        ] }) })
      ] })
    ] }),
    /* @__PURE__ */ jsxs(Card, { children: [
      /* @__PURE__ */ jsxs(CardHeader, { className: "pb-3", children: [
        /* @__PURE__ */ jsxs(CardTitle, { className: "text-sm flex items-center gap-2", children: [
          /* @__PURE__ */ jsx(Wrench, { className: "h-4 w-4 text-primary" }),
          " Bu Hafta Önceliğin"
        ] }),
        /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: "Şikayet sıklığı + rakip kıyaslamasına göre sıralandı" })
      ] }),
      /* @__PURE__ */ jsx(CardContent, { className: "space-y-2", children: opsList.length === 0 ? /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground py-4 text-center", children: "Belirgin operasyonel öncelik yok. Konuları analiz edin." }) : opsList.map((row, idx) => /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-2 py-1.5 border-b last:border-b-0", children: [
        /* @__PURE__ */ jsx("div", { className: "flex-shrink-0 h-6 w-6 rounded-full bg-primary/10 text-primary text-xs font-semibold flex items-center justify-center", children: idx + 1 }),
        /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
          /* @__PURE__ */ jsx("div", { className: "font-medium text-sm truncate", children: topicLabel(row.topic) }),
          /* @__PURE__ */ jsxs("div", { className: "text-xs text-muted-foreground", children: [
            row.ownNeg > 0 && /* @__PURE__ */ jsxs(Fragment, { children: [
              "Sizde ",
              row.ownNeg,
              " şikayet"
            ] }),
            row.ownNeg > 0 && row.compNeg > 0 && " · ",
            row.compNeg > 0 && /* @__PURE__ */ jsxs(Fragment, { children: [
              "rakipte ",
              row.compNeg
            ] }),
            row.compAvg > 0.1 && /* @__PURE__ */ jsxs("span", { className: "text-rose-600 dark:text-rose-400", children: [
              " · ",
              "rakip bu konuda iyi"
            ] })
          ] })
        ] })
      ] }, row.topic.id)) })
    ] }),
    /* @__PURE__ */ jsxs(Card, { children: [
      /* @__PURE__ */ jsxs(CardHeader, { className: "pb-3", children: [
        /* @__PURE__ */ jsxs(CardTitle, { className: "text-sm flex items-center gap-2", children: [
          /* @__PURE__ */ jsx(MessageCircle, { className: "h-4 w-4 text-primary" }),
          " Yanıt Performansı"
        ] }),
        /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: "Rakip yanıtları toplanan platformlardan ölçülür" })
      ] }),
      /* @__PURE__ */ jsxs(CardContent, { className: "space-y-3", children: [
        /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between text-sm", children: [
            /* @__PURE__ */ jsx("span", { className: "text-muted-foreground", children: "Yanıt oranı" }),
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsxs("span", { className: "font-semibold", children: [
                Math.round(ownReplyRate),
                "%"
              ] }),
              /* @__PURE__ */ jsxs("span", { className: "text-xs text-muted-foreground", children: [
                "/ ",
                compReplyRate != null ? `${Math.round(compReplyRate)}%` : "—"
              ] }),
              /* @__PURE__ */ jsx(Badge, { variant: "outline", className: `${toneClass(rateBadge)} text-[10px] h-5`, children: /* @__PURE__ */ jsx(ToneIcon, { t: rateBadge }) })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between text-sm", children: [
            /* @__PURE__ */ jsx("span", { className: "text-muted-foreground", children: "Medyan yanıt süresi" }),
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsx("span", { className: "font-semibold", children: fmtHours(ownMedianReply) }),
              /* @__PURE__ */ jsxs("span", { className: "text-xs text-muted-foreground", children: [
                "/ ",
                fmtHours(compMedianReply)
              ] }),
              /* @__PURE__ */ jsx(Badge, { variant: "outline", className: `${toneClass(timeBadge)} text-[10px] h-5`, children: /* @__PURE__ */ jsx(ToneIcon, { t: timeBadge }) })
            ] })
          ] })
        ] }),
        unansweredCount > 0 && /* @__PURE__ */ jsx(Button, { asChild: true, size: "sm", variant: "outline", className: "w-full", children: /* @__PURE__ */ jsxs(Link, { to: "/reviews?status=unanswered", children: [
          "Cevapsız ",
          unansweredCount,
          " yoruma git ",
          /* @__PURE__ */ jsx(ArrowRight, { className: "h-3 w-3 ml-1" })
        ] }) }),
        compReplyRate == null && /* @__PURE__ */ jsx("p", { className: "text-[11px] text-muted-foreground", children: "Rakip yanıt verisi henüz toplanmadı. Yorumlar tekrar çekildiğinde dolacak." })
      ] })
    ] })
  ] });
}
const PRIMARY = "hsl(var(--primary))";
const MUTED = "hsl(var(--muted-foreground))";
const PLATFORMS = [
  { key: "google", label: "Google" },
  { key: "booking", label: "Booking" },
  { key: "tripadvisor", label: "TripAdvisor" },
  { key: "expedia", label: "Expedia" },
  { key: "hotels", label: "Hotels.com" }
];
function normalizePlatform(p) {
  if (!p) return null;
  const s = p.toLowerCase();
  if (s.includes("google")) return "google";
  if (s.includes("booking")) return "booking";
  if (s.includes("tripadvisor") || s === "ta") return "tripadvisor";
  if (s.includes("expedia")) return "expedia";
  if (s.includes("hotels") || s === "hotelscom") return "hotels";
  return s;
}
function fmtNum(n) {
  if (n == null) return "—";
  return new Intl.NumberFormat("tr-TR").format(Math.round(n));
}
function fmtRating(n) {
  if (n == null) return "—";
  return n.toFixed(1);
}
function truncate(s, n = 18) {
  return s.length > n ? s.slice(0, n - 1) + "…" : s;
}
function isoDaysAgo(d) {
  return new Date(Date.now() - d * 864e5).toISOString();
}
function weekKey(iso) {
  const d = new Date(iso);
  const day = d.getUTCDay();
  const diff = d.getUTCDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), diff));
  return monday.toISOString().slice(0, 10);
}
function IntelligenceComparison() {
  var _a, _b, _c, _d, _e;
  const { activeBusiness, businesses, setActiveBusiness, loading: businessLoading } = useBusiness();
  const businessId = activeBusiness == null ? void 0 : activeBusiness.id;
  const dataQuery = useQuery({
    queryKey: ["comparison-v2", businessId],
    enabled: !!businessId,
    queryFn: async () => {
      var _a2, _b2;
      const since90 = isoDaysAgo(90);
      const [competitorsRes, ownReviewsRes] = await Promise.all([
        supabase.from("ci_competitors").select("id,name,rating,review_count,proximity_m,match_score").eq("business_id", businessId).eq("status", "confirmed"),
        supabase.from("reviews").select("platform,rating,posted_at,status,approved_reply").eq("business_id", businessId).order("posted_at", { ascending: false }).limit(5e3)
      ]);
      if (competitorsRes.error) throw competitorsRes.error;
      if (ownReviewsRes.error) throw ownReviewsRes.error;
      const competitors2 = competitorsRes.data ?? [];
      const compIds = competitors2.map((c) => c.id);
      let compReviews = [];
      if (compIds.length) {
        const { data: crd } = await supabase.from("ci_competitor_reviews").select("competitor_id,platform,rating,posted_at").in("competitor_id", compIds).gte("posted_at", since90).limit(2e4);
        compReviews = crd ?? [];
      }
      let compTotals2 = {};
      let compPlatformAgg2 = {};
      if (compIds.length) {
        const { data: allRows } = await supabase.from("ci_competitor_reviews").select("competitor_id,platform,rating").in("competitor_id", compIds).limit(5e4);
        for (const r of allRows ?? []) {
          compTotals2[r.competitor_id] = (compTotals2[r.competitor_id] ?? 0) + 1;
          const p = normalizePlatform(r.platform);
          if (!p || r.rating == null) continue;
          compPlatformAgg2[_a2 = r.competitor_id] ?? (compPlatformAgg2[_a2] = {});
          (_b2 = compPlatformAgg2[r.competitor_id])[p] ?? (_b2[p] = { sum: 0, n: 0 });
          compPlatformAgg2[r.competitor_id][p].sum += Number(r.rating);
          compPlatformAgg2[r.competitor_id][p].n += 1;
        }
      }
      return {
        competitors: competitors2,
        compReviews90: compReviews,
        compTotals: compTotals2,
        compPlatformAgg: compPlatformAgg2,
        ownReviews: ownReviewsRes.data ?? []
      };
    }
  });
  const competitors = ((_a = dataQuery.data) == null ? void 0 : _a.competitors) ?? [];
  const ownReviews = ((_b = dataQuery.data) == null ? void 0 : _b.ownReviews) ?? [];
  const compReviews90 = ((_c = dataQuery.data) == null ? void 0 : _c.compReviews90) ?? [];
  const compTotals = ((_d = dataQuery.data) == null ? void 0 : _d.compTotals) ?? {};
  const compPlatformAgg = ((_e = dataQuery.data) == null ? void 0 : _e.compPlatformAgg) ?? {};
  const ownName = (activeBusiness == null ? void 0 : activeBusiness.name) ?? "Siz";
  const ownRatings = ownReviews.map((r) => r.rating).filter((n) => n != null);
  const ownAvg = ownRatings.length ? ownRatings.reduce((a, b) => a + b, 0) / ownRatings.length : null;
  const ownTotal = ownReviews.length;
  const ownReplied = ownReviews.filter((r) => r.approved_reply || r.status === "replied").length;
  const ownReplyRate = ownTotal > 0 ? ownReplied / ownTotal * 100 : null;
  const since30 = isoDaysAgo(30);
  const own30d = ownReviews.filter((r) => r.posted_at && r.posted_at >= since30).length;
  const ownPlatformAgg = {};
  for (const r of ownReviews) {
    const p = normalizePlatform(r.platform) ?? "google";
    if (r.rating == null) continue;
    ownPlatformAgg[p] ?? (ownPlatformAgg[p] = { sum: 0, n: 0 });
    ownPlatformAgg[p].sum += Number(r.rating);
    ownPlatformAgg[p].n += 1;
  }
  const compAvgs = competitors.map((c) => c.rating).filter((n) => n != null);
  const compAvgOfAvg = compAvgs.length ? compAvgs.reduce((a, b) => a + b, 0) / compAvgs.length : null;
  const compTotalSum = competitors.reduce((acc, c) => acc + (compTotals[c.id] ?? c.review_count ?? 0), 0);
  const compAvgTotal = competitors.length ? compTotalSum / competitors.length : null;
  const comp30dPerComp = {};
  for (const r of compReviews90) {
    if (!r.posted_at || r.posted_at < since30) continue;
    comp30dPerComp[r.competitor_id] = (comp30dPerComp[r.competitor_id] ?? 0) + 1;
  }
  const comp30dValues = competitors.map((c) => comp30dPerComp[c.id] ?? 0);
  const compAvg30d = comp30dValues.length ? comp30dValues.reduce((a, b) => a + b, 0) / comp30dValues.length : null;
  const ranked = useMemo(() => {
    const rows = [
      {
        id: "__own__",
        name: ownName,
        rating: ownAvg,
        review_count: ownTotal,
        proximity_m: null,
        match_score: null,
        isOwn: true
      },
      ...competitors.map((c) => ({
        id: c.id,
        name: c.name,
        rating: c.rating,
        review_count: compTotals[c.id] ?? c.review_count,
        proximity_m: c.proximity_m,
        match_score: c.match_score,
        isOwn: false
      }))
    ];
    rows.sort((a, b) => (b.rating ?? -1) - (a.rating ?? -1));
    return rows;
  }, [competitors, ownAvg, ownTotal, ownName, JSON.stringify(compTotals)]);
  const ownRank = ranked.findIndex((r) => r.isOwn) + 1;
  const trendData = useMemo(() => {
    const buckets = {};
    for (let i = 12; i >= 0; i--) {
      const d = new Date(Date.now() - i * 7 * 864e5);
      const wk = weekKey(d.toISOString());
      buckets[wk] = { week: wk, you: 0, competitorsAvg: 0, _compCount: 0 };
    }
    for (const r of ownReviews) {
      if (!r.posted_at) continue;
      if (r.posted_at < isoDaysAgo(90)) continue;
      const wk = weekKey(r.posted_at);
      if (buckets[wk]) buckets[wk].you += 1;
    }
    for (const r of compReviews90) {
      if (!r.posted_at) continue;
      const wk = weekKey(r.posted_at);
      if (buckets[wk]) buckets[wk]._compCount += 1;
    }
    const compN = Math.max(1, competitors.length);
    return Object.values(buckets).sort((a, b) => a.week.localeCompare(b.week)).map((b) => ({
      ...b,
      competitorsAvg: Math.round(b._compCount / compN * 10) / 10,
      weekLabel: b.week.slice(5)
      // MM-DD
    }));
  }, [ownReviews, compReviews90, competitors.length]);
  const scatterCompetitors = competitors.filter((c) => c.rating != null && (compTotals[c.id] ?? c.review_count) != null).map((c) => ({
    x: compTotals[c.id] ?? c.review_count,
    y: c.rating,
    name: truncate(c.name),
    fullName: c.name
  }));
  const scatterOwn = ownAvg != null ? [{ x: ownTotal, y: ownAvg, name: truncate(ownName), fullName: ownName }] : [];
  const allRatings = [...scatterCompetitors.map((d) => d.y), ...scatterOwn.map((d) => d.y)];
  const yMin = allRatings.length ? Math.max(1, Math.floor(Math.min(...allRatings) * 2) / 2 - 0.2) : 3;
  const yMax = 5;
  const allX = [...scatterCompetitors.map((d) => d.x), ...scatterOwn.map((d) => d.x)];
  const xMax = allX.length ? Math.max(...allX) * 1.1 : 100;
  const xMid = xMax / 2;
  const yMid = (yMin + yMax) / 2;
  const platformMatrix = useMemo(() => {
    const rows = [
      {
        id: "__own__",
        name: ownName,
        isOwn: true,
        cells: PLATFORMS.map((p) => {
          const agg = ownPlatformAgg[p.key];
          return { platform: p.key, avg: agg && agg.n ? agg.sum / agg.n : null, n: (agg == null ? void 0 : agg.n) ?? 0 };
        })
      },
      ...competitors.map((c) => ({
        id: c.id,
        name: c.name,
        isOwn: false,
        cells: PLATFORMS.map((p) => {
          var _a2;
          const agg = (_a2 = compPlatformAgg[c.id]) == null ? void 0 : _a2[p.key];
          return { platform: p.key, avg: agg && agg.n ? agg.sum / agg.n : null, n: (agg == null ? void 0 : agg.n) ?? 0 };
        })
      }))
    ];
    return rows;
  }, [competitors, ownName, JSON.stringify(ownPlatformAgg), JSON.stringify(compPlatformAgg)]);
  if (businessLoading) {
    return /* @__PURE__ */ jsxs("div", { className: "p-4 sm:p-6 max-w-6xl mx-auto space-y-6", children: [
      /* @__PURE__ */ jsx(Skeleton, { className: "h-8 w-48" }),
      /* @__PURE__ */ jsx(Skeleton, { className: "h-96 w-full" })
    ] });
  }
  if (!businessId) {
    return /* @__PURE__ */ jsx("div", { className: "p-6", children: /* @__PURE__ */ jsx("p", { className: "text-muted-foreground", children: "Önce bir işletme seçin." }) });
  }
  const loading = dataQuery.isLoading;
  const isEmpty = !loading && competitors.length === 0;
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(Helmet, { children: /* @__PURE__ */ jsx("title", { children: "Pazar Karşılaştırması · VoyageRespond" }) }),
    /* @__PURE__ */ jsxs("div", { className: "p-4 sm:p-6 max-w-6xl mx-auto space-y-6", children: [
      /* @__PURE__ */ jsx(IntelligenceTabs, {}),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h1", { className: "text-2xl sm:text-3xl font-semibold tracking-tight", children: "Pazar Karşılaştırması" }),
        /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground mt-1", children: "Otelinizin rakipleriniz arasındaki konumu, platform bazlı performans ve 90 günlük trend." }),
        businesses.length > 1 && /* @__PURE__ */ jsxs("div", { className: "mt-3 flex items-center gap-2", children: [
          /* @__PURE__ */ jsx(MapPin, { className: "h-4 w-4 text-muted-foreground" }),
          /* @__PURE__ */ jsxs(
            Select,
            {
              value: activeBusiness == null ? void 0 : activeBusiness.id,
              onValueChange: (id) => {
                const b = businesses.find((x) => x.id === id);
                if (b) setActiveBusiness(b);
              },
              children: [
                /* @__PURE__ */ jsx(SelectTrigger, { className: "w-full sm:w-[280px] h-9", children: /* @__PURE__ */ jsx(SelectValue, { placeholder: "Lokasyon seçin" }) }),
                /* @__PURE__ */ jsx(SelectContent, { children: businesses.map((b) => /* @__PURE__ */ jsx(SelectItem, { value: b.id, children: b.name }, b.id)) })
              ]
            }
          )
        ] }),
        !loading && !isEmpty && /* @__PURE__ */ jsxs("div", { className: "text-xs text-muted-foreground mt-2", children: [
          competitors.length,
          " rakiple karşılaştırılıyor ·",
          " ",
          /* @__PURE__ */ jsxs("span", { className: "font-medium text-foreground", children: [
            ownRank,
            "."
          ] }),
          " sıradasınız"
        ] })
      ] }),
      loading ? /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
        /* @__PURE__ */ jsx("div", { className: "grid grid-cols-2 lg:grid-cols-4 gap-3", children: [0, 1, 2, 3].map((i) => /* @__PURE__ */ jsx(Skeleton, { className: "h-24 w-full" }, i)) }),
        /* @__PURE__ */ jsx(Skeleton, { className: "h-96 w-full" })
      ] }) : isEmpty ? /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsxs(CardContent, { className: "p-8 text-center space-y-3", children: [
        /* @__PURE__ */ jsx(Sparkles, { className: "h-8 w-8 mx-auto text-muted-foreground" }),
        /* @__PURE__ */ jsx("h3", { className: "font-medium", children: "Karşılaştırılacak rakip yok" }),
        /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground max-w-md mx-auto", children: "Karşılaştırma için önce Rakip Seçimi sekmesinden en az 1 rakip onaylayın." }),
        /* @__PURE__ */ jsx(Button, { asChild: true, children: /* @__PURE__ */ jsx(Link, { to: "/intelligence", children: "Rakip Seçimine Git" }) })
      ] }) }) : /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsx(ActionPack, { businessId }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 lg:grid-cols-4 gap-3", children: [
          /* @__PURE__ */ jsx(
            KpiCard,
            {
              label: "Ortalama Puan",
              icon: /* @__PURE__ */ jsx(Star, { className: "h-4 w-4" }),
              ownValue: ownAvg,
              compValue: compAvgOfAvg,
              format: (v) => v.toFixed(2),
              higherIsBetter: true
            }
          ),
          /* @__PURE__ */ jsx(
            KpiCard,
            {
              label: "Toplam Yorum",
              icon: /* @__PURE__ */ jsx(MessageSquare, { className: "h-4 w-4" }),
              ownValue: ownTotal,
              compValue: compAvgTotal,
              format: fmtNum,
              higherIsBetter: true
            }
          ),
          /* @__PURE__ */ jsx(
            KpiCard,
            {
              label: "Yanıt Oranı",
              icon: /* @__PURE__ */ jsx(Reply, { className: "h-4 w-4" }),
              ownValue: ownReplyRate,
              compValue: null,
              format: (v) => `${Math.round(v)}%`,
              hint: "Rakip yanıt verisi yok",
              higherIsBetter: true
            }
          ),
          /* @__PURE__ */ jsx(
            KpiCard,
            {
              label: "Son 30 gün hacim",
              icon: /* @__PURE__ */ jsx(Calendar, { className: "h-4 w-4" }),
              ownValue: own30d,
              compValue: compAvg30d,
              format: fmtNum,
              higherIsBetter: true
            }
          )
        ] }),
        /* @__PURE__ */ jsxs(Card, { children: [
          /* @__PURE__ */ jsxs(CardHeader, { className: "pb-3", children: [
            /* @__PURE__ */ jsx(CardTitle, { className: "text-base", children: "Son 90 gün — Yorum hacmi trendi" }),
            /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: "Haftalık yeni yorum sayısı. Rakipler için ortalama gösterilir." })
          ] }),
          /* @__PURE__ */ jsx(CardContent, { children: /* @__PURE__ */ jsx("div", { className: "h-64 w-full", children: /* @__PURE__ */ jsx(ResponsiveContainer, { width: "100%", height: "100%", children: /* @__PURE__ */ jsxs(LineChart, { data: trendData, margin: { top: 8, right: 16, bottom: 4, left: 0 }, children: [
            /* @__PURE__ */ jsx(CartesianGrid, { strokeDasharray: "3 3", stroke: "hsl(var(--border))" }),
            /* @__PURE__ */ jsx(XAxis, { dataKey: "weekLabel", tick: { fontSize: 10, fill: MUTED } }),
            /* @__PURE__ */ jsx(YAxis, { tick: { fontSize: 10, fill: MUTED }, allowDecimals: false }),
            /* @__PURE__ */ jsx(
              Tooltip$1,
              {
                content: ({ active, payload, label }) => {
                  if (!active || !(payload == null ? void 0 : payload.length)) return null;
                  return /* @__PURE__ */ jsxs("div", { className: "rounded-md border bg-popover px-3 py-2 text-xs shadow-sm", children: [
                    /* @__PURE__ */ jsxs("div", { className: "font-medium mb-1", children: [
                      "Hafta: ",
                      label
                    ] }),
                    payload.map((p) => /* @__PURE__ */ jsxs("div", { style: { color: p.color }, children: [
                      p.name,
                      ": ",
                      p.value
                    ] }, p.dataKey))
                  ] });
                }
              }
            ),
            /* @__PURE__ */ jsx(Legend, { wrapperStyle: { fontSize: 11 } }),
            /* @__PURE__ */ jsx(
              Line,
              {
                type: "monotone",
                dataKey: "you",
                name: ownName,
                stroke: PRIMARY,
                strokeWidth: 2.5,
                dot: false
              }
            ),
            /* @__PURE__ */ jsx(
              Line,
              {
                type: "monotone",
                dataKey: "competitorsAvg",
                name: "Rakip ortalaması",
                stroke: MUTED,
                strokeWidth: 2,
                strokeDasharray: "4 4",
                dot: false
              }
            )
          ] }) }) }) })
        ] }),
        /* @__PURE__ */ jsxs(Card, { children: [
          /* @__PURE__ */ jsxs(CardHeader, { className: "pb-3", children: [
            /* @__PURE__ */ jsx(CardTitle, { className: "text-base", children: "Platform bazlı puan" }),
            /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: "Her platformdaki ortalama puan (toplanmış rakip yorumlarından)." })
          ] }),
          /* @__PURE__ */ jsxs(CardContent, { className: "p-0", children: [
            /* @__PURE__ */ jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxs("table", { className: "w-full text-sm", children: [
              /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", { className: "text-left text-xs text-muted-foreground border-b", children: [
                /* @__PURE__ */ jsx("th", { className: "py-2 px-4 font-medium", children: "İşletme" }),
                PLATFORMS.map((p) => /* @__PURE__ */ jsx("th", { className: "py-2 px-3 font-medium text-center", children: p.label }, p.key))
              ] }) }),
              /* @__PURE__ */ jsx("tbody", { children: platformMatrix.map((row) => /* @__PURE__ */ jsxs(
                "tr",
                {
                  className: row.isOwn ? "bg-primary/5 font-medium border-b last:border-0" : "border-b last:border-0",
                  children: [
                    /* @__PURE__ */ jsx("td", { className: "py-2.5 px-4", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
                      /* @__PURE__ */ jsx("span", { className: "truncate max-w-[180px]", children: row.name }),
                      row.isOwn && /* @__PURE__ */ jsx(Badge, { variant: "default", className: "h-5 text-[10px]", children: "Siz" })
                    ] }) }),
                    row.cells.map((cell) => /* @__PURE__ */ jsx("td", { className: "py-2.5 px-3 text-center", children: cell.avg != null ? /* @__PURE__ */ jsxs("div", { children: [
                      /* @__PURE__ */ jsxs("div", { className: "inline-flex items-center gap-1", children: [
                        /* @__PURE__ */ jsx(Star, { className: "h-3 w-3 fill-amber-400 text-amber-400" }),
                        cell.avg.toFixed(1)
                      ] }),
                      /* @__PURE__ */ jsx("div", { className: "text-[10px] text-muted-foreground", children: fmtNum(cell.n) })
                    ] }) : /* @__PURE__ */ jsx("span", { className: "text-muted-foreground text-xs", children: "—" }) }, cell.platform))
                  ]
                },
                row.id
              )) })
            ] }) }),
            /* @__PURE__ */ jsx("p", { className: "text-[11px] text-muted-foreground px-4 py-3 border-t", children: 'Rakip yorumları henüz çekilmediyse hücreler boş görünür. "Rakip Seçimi" sekmesinden yorumları çekin.' })
          ] })
        ] }),
        /* @__PURE__ */ jsxs(Card, { children: [
          /* @__PURE__ */ jsxs(CardHeader, { className: "pb-3", children: [
            /* @__PURE__ */ jsx(CardTitle, { className: "text-base", children: "Pazar Konumu" }),
            /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: "Yatay: yorum sayısı · Dikey: puan" })
          ] }),
          /* @__PURE__ */ jsxs(CardContent, { children: [
            /* @__PURE__ */ jsx("div", { className: "h-[360px] w-full", children: /* @__PURE__ */ jsx(ResponsiveContainer, { width: "100%", height: "100%", children: /* @__PURE__ */ jsxs(ScatterChart, { margin: { top: 20, right: 30, bottom: 30, left: 10 }, children: [
              /* @__PURE__ */ jsx(CartesianGrid, { strokeDasharray: "3 3", stroke: "hsl(var(--border))" }),
              /* @__PURE__ */ jsx(
                XAxis,
                {
                  type: "number",
                  dataKey: "x",
                  name: "Yorum",
                  domain: [0, xMax],
                  tick: { fontSize: 11, fill: MUTED },
                  label: {
                    value: "Yorum sayısı",
                    position: "insideBottom",
                    offset: -15,
                    fontSize: 11,
                    fill: MUTED
                  }
                }
              ),
              /* @__PURE__ */ jsx(
                YAxis,
                {
                  type: "number",
                  dataKey: "y",
                  name: "Puan",
                  domain: [yMin, yMax],
                  tick: { fontSize: 11, fill: MUTED },
                  label: {
                    value: "Puan",
                    angle: -90,
                    position: "insideLeft",
                    fontSize: 11,
                    fill: MUTED
                  }
                }
              ),
              /* @__PURE__ */ jsx(ZAxis, { type: "number", range: [80, 80] }),
              /* @__PURE__ */ jsx(ReferenceLine, { x: xMid, stroke: "hsl(var(--border))", strokeDasharray: "2 4" }),
              /* @__PURE__ */ jsx(ReferenceLine, { y: yMid, stroke: "hsl(var(--border))", strokeDasharray: "2 4" }),
              /* @__PURE__ */ jsx(
                Tooltip$1,
                {
                  cursor: { strokeDasharray: "3 3" },
                  content: ({ active, payload }) => {
                    if (!active || !(payload == null ? void 0 : payload.length)) return null;
                    const d = payload[0].payload;
                    return /* @__PURE__ */ jsxs("div", { className: "rounded-md border bg-popover px-3 py-2 text-xs shadow-sm", children: [
                      /* @__PURE__ */ jsx("div", { className: "font-medium", children: d.fullName }),
                      /* @__PURE__ */ jsxs("div", { className: "text-muted-foreground", children: [
                        "Puan: ",
                        d.y.toFixed(1),
                        " · Yorum: ",
                        fmtNum(d.x)
                      ] })
                    ] });
                  }
                }
              ),
              /* @__PURE__ */ jsx(Scatter, { name: "Rakipler", data: scatterCompetitors, fill: MUTED, children: /* @__PURE__ */ jsx(
                LabelList,
                {
                  dataKey: "name",
                  position: "top",
                  style: { fontSize: 10, fill: "hsl(var(--muted-foreground))" }
                }
              ) }),
              /* @__PURE__ */ jsx(
                Scatter,
                {
                  name: "Siz",
                  data: scatterOwn,
                  fill: PRIMARY,
                  shape: "star",
                  legendType: "star",
                  children: /* @__PURE__ */ jsx(
                    LabelList,
                    {
                      dataKey: "name",
                      position: "top",
                      style: { fontSize: 11, fill: "hsl(var(--primary))", fontWeight: 600 }
                    }
                  )
                }
              )
            ] }) }) }),
            /* @__PURE__ */ jsxs("div", { className: "mt-3 grid grid-cols-2 gap-x-4 gap-y-1 text-[11px] text-muted-foreground", children: [
              /* @__PURE__ */ jsx("span", { children: "↗ Liderler (yüksek puan, yüksek hacim)" }),
              /* @__PURE__ */ jsx("span", { children: "↖ Yükselenler (yüksek puan, düşük hacim)" }),
              /* @__PURE__ */ jsx("span", { children: "↘ Hacimli ama riskli" }),
              /* @__PURE__ */ jsx("span", { children: "↙ Zayıf" })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs(Card, { children: [
          /* @__PURE__ */ jsxs(CardHeader, { className: "pb-3", children: [
            /* @__PURE__ */ jsx(CardTitle, { className: "text-base", children: "Sıralama" }),
            /* @__PURE__ */ jsxs("p", { className: "text-xs text-muted-foreground", children: [
              "Pazarda ",
              /* @__PURE__ */ jsxs("span", { className: "font-medium text-foreground", children: [
                ownRank,
                "."
              ] }),
              " sıradasınız (",
              ranked.length,
              " işletme arasında)"
            ] })
          ] }),
          /* @__PURE__ */ jsx(CardContent, { className: "p-0", children: /* @__PURE__ */ jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxs("table", { className: "w-full text-sm", children: [
            /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", { className: "text-left text-xs text-muted-foreground border-b", children: [
              /* @__PURE__ */ jsx("th", { className: "py-2 px-4 font-medium", children: "#" }),
              /* @__PURE__ */ jsx("th", { className: "py-2 px-4 font-medium", children: "İşletme" }),
              /* @__PURE__ */ jsx("th", { className: "py-2 px-4 font-medium", children: "Puan" }),
              /* @__PURE__ */ jsx("th", { className: "py-2 px-4 font-medium", children: "Yorum" }),
              /* @__PURE__ */ jsx("th", { className: "py-2 px-4 font-medium", children: "Mesafe" }),
              /* @__PURE__ */ jsx("th", { className: "py-2 px-4 font-medium", children: "Eşleşme" })
            ] }) }),
            /* @__PURE__ */ jsx("tbody", { children: ranked.map((r, i) => /* @__PURE__ */ jsxs(
              "tr",
              {
                className: r.isOwn ? "bg-primary/5 font-medium border-b last:border-0" : "border-b last:border-0",
                children: [
                  /* @__PURE__ */ jsx("td", { className: "py-2.5 px-4 text-muted-foreground", children: i + 1 }),
                  /* @__PURE__ */ jsx("td", { className: "py-2.5 px-4", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
                    /* @__PURE__ */ jsx("span", { className: "truncate", children: r.name }),
                    r.isOwn && /* @__PURE__ */ jsx(Badge, { variant: "default", className: "h-5 text-[10px]", children: "Siz" })
                  ] }) }),
                  /* @__PURE__ */ jsx("td", { className: "py-2.5 px-4", children: /* @__PURE__ */ jsxs("span", { className: "inline-flex items-center gap-1", children: [
                    /* @__PURE__ */ jsx(Star, { className: "h-3 w-3 fill-amber-400 text-amber-400" }),
                    fmtRating(r.rating)
                  ] }) }),
                  /* @__PURE__ */ jsx("td", { className: "py-2.5 px-4", children: fmtNum(r.review_count) }),
                  /* @__PURE__ */ jsx("td", { className: "py-2.5 px-4 text-muted-foreground", children: r.proximity_m != null ? `${(r.proximity_m / 1e3).toFixed(1)} km` : "—" }),
                  /* @__PURE__ */ jsx("td", { className: "py-2.5 px-4", children: r.match_score != null ? /* @__PURE__ */ jsx(Badge, { variant: "secondary", className: "h-5", children: Math.round(r.match_score) }) : /* @__PURE__ */ jsx("span", { className: "text-muted-foreground", children: "—" }) })
                ]
              },
              r.id
            )) })
          ] }) }) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [
          /* @__PURE__ */ jsx(
            BarCard,
            {
              title: "Puan karşılaştırması",
              rows: ranked,
              dataKey: "rating",
              domain: [yMin, 5],
              formatter: (v) => v.toFixed(1)
            }
          ),
          /* @__PURE__ */ jsx(
            BarCard,
            {
              title: "Yorum hacmi",
              rows: ranked,
              dataKey: "review_count",
              formatter: (v) => fmtNum(v)
            }
          )
        ] }),
        (activeBusiness == null ? void 0 : activeBusiness.id) && /* @__PURE__ */ jsx(TopicAnalysis, { businessId: activeBusiness.id })
      ] })
    ] })
  ] });
}
function KpiCard({
  label,
  icon,
  ownValue,
  compValue,
  format,
  higherIsBetter,
  hint
}) {
  let delta = null;
  if (ownValue != null && compValue != null && compValue !== 0) {
    delta = ownValue - compValue;
  }
  const positive = delta != null && delta > 0;
  const negative = delta != null && delta < 0;
  const goodBad = higherIsBetter ? positive ? "good" : negative ? "bad" : "neutral" : "neutral";
  return /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsxs(CardContent, { className: "p-4 space-y-1.5", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-xs text-muted-foreground", children: [
      icon,
      /* @__PURE__ */ jsx("span", { children: label })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "text-2xl font-semibold tabular-nums", children: ownValue != null ? format(ownValue) : "—" }),
    compValue != null ? /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5 text-xs", children: [
      delta != null && Math.abs(delta) > 1e-3 ? goodBad === "good" ? /* @__PURE__ */ jsxs("span", { className: "inline-flex items-center gap-0.5 text-emerald-600 font-medium", children: [
        /* @__PURE__ */ jsx(TrendingUp, { className: "h-3 w-3" }),
        format(Math.abs(delta))
      ] }) : goodBad === "bad" ? /* @__PURE__ */ jsxs("span", { className: "inline-flex items-center gap-0.5 text-rose-600 font-medium", children: [
        /* @__PURE__ */ jsx(TrendingDown, { className: "h-3 w-3" }),
        format(Math.abs(delta))
      ] }) : /* @__PURE__ */ jsx("span", { className: "inline-flex items-center gap-0.5 text-muted-foreground", children: /* @__PURE__ */ jsx(Minus, { className: "h-3 w-3" }) }) : /* @__PURE__ */ jsx("span", { className: "text-muted-foreground", children: "aynı" }),
      /* @__PURE__ */ jsxs("span", { className: "text-muted-foreground", children: [
        "vs rakip ort. (",
        format(compValue),
        ")"
      ] })
    ] }) : /* @__PURE__ */ jsx("div", { className: "text-xs text-muted-foreground", children: hint ?? "" })
  ] }) });
}
function BarCard({
  title,
  rows,
  dataKey,
  domain,
  formatter
}) {
  const data = rows.filter((r) => r[dataKey] != null).map((r) => ({
    name: truncate(r.name, 14),
    fullName: r.name,
    value: r[dataKey],
    isOwn: r.isOwn
  }));
  return /* @__PURE__ */ jsxs(Card, { children: [
    /* @__PURE__ */ jsx(CardHeader, { className: "pb-3", children: /* @__PURE__ */ jsx(CardTitle, { className: "text-base", children: title }) }),
    /* @__PURE__ */ jsx(CardContent, { children: /* @__PURE__ */ jsx("div", { className: "h-64 w-full", children: /* @__PURE__ */ jsx(ResponsiveContainer, { width: "100%", height: "100%", children: /* @__PURE__ */ jsxs(BarChart, { data, layout: "vertical", margin: { top: 4, right: 24, bottom: 4, left: 8 }, children: [
      /* @__PURE__ */ jsx(CartesianGrid, { strokeDasharray: "3 3", stroke: "hsl(var(--border))", horizontal: false }),
      /* @__PURE__ */ jsx(XAxis, { type: "number", domain, tick: { fontSize: 10, fill: MUTED } }),
      /* @__PURE__ */ jsx(
        YAxis,
        {
          type: "category",
          dataKey: "name",
          width: 90,
          tick: { fontSize: 11, fill: MUTED }
        }
      ),
      /* @__PURE__ */ jsx(
        Tooltip$1,
        {
          cursor: { fill: "hsl(var(--muted))", opacity: 0.4 },
          content: ({ active, payload }) => {
            if (!active || !(payload == null ? void 0 : payload.length)) return null;
            const d = payload[0].payload;
            return /* @__PURE__ */ jsxs("div", { className: "rounded-md border bg-popover px-3 py-2 text-xs shadow-sm", children: [
              /* @__PURE__ */ jsx("div", { className: "font-medium", children: d.fullName }),
              /* @__PURE__ */ jsx("div", { className: "text-muted-foreground", children: formatter(d.value) })
            ] });
          }
        }
      ),
      /* @__PURE__ */ jsx(Bar, { dataKey: "value", radius: [4, 4, 4, 4], children: data.map((d, i) => /* @__PURE__ */ jsx(Cell, { fill: d.isOwn ? PRIMARY : "hsl(var(--muted-foreground) / 0.4)" }, i)) })
    ] }) }) }) })
  ] });
}
export {
  IntelligenceComparison as default
};
