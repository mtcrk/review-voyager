import { jsx, jsxs } from "react/jsx-runtime";
import { useState, useCallback, useEffect, useMemo } from "react";
import { a as useBusiness, s as supabase, t as toast, B as Button, m as Badge } from "../main.mjs";
import { C as Card, c as CardContent, a as CardHeader, e as CardTitle } from "./card-vx9BCW0t.js";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-1zED13tY.js";
import { Sparkles, MapPin, Loader2, Youtube, ThumbsUp, ThumbsDown, Minus, TrendingUp, Languages, ExternalLink } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
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
const sentimentMeta = {
  positive: { label: "Pozitif", icon: ThumbsUp, className: "bg-emerald-500/10 text-emerald-600 border-emerald-500/30" },
  negative: { label: "Negatif", icon: ThumbsDown, className: "bg-rose-500/10 text-rose-600 border-rose-500/30" },
  neutral: { label: "Nötr", icon: Minus, className: "bg-muted text-muted-foreground border-border" }
};
function SocialAnalytics() {
  const { activeBusiness, businesses, setActiveBusiness } = useBusiness();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [filter, setFilter] = useState("all");
  const load = useCallback(async () => {
    if (!activeBusiness) return;
    setLoading(true);
    const { data, error } = await supabase.from("youtube_comments").select(
      "id, comment_text, author_display_name, author_avatar_url, like_count, commented_at, sentiment, sentiment_score, sentiment_summary, sentiment_topics, sentiment_translated_text, analyzed_at, video_id, youtube_videos!inner(title, permalink)"
    ).eq("business_id", activeBusiness.id).order("commented_at", { ascending: false }).limit(500);
    if (error) {
      console.error(error);
      toast({ title: "Yorumlar yüklenemedi", description: error.message, variant: "destructive" });
    } else {
      setComments(data ?? []);
    }
    setLoading(false);
  }, [activeBusiness]);
  useEffect(() => {
    load();
  }, [load]);
  const stats = useMemo(() => {
    const total = comments.length;
    const analyzed = comments.filter((c) => c.sentiment).length;
    const positive = comments.filter((c) => c.sentiment === "positive").length;
    const negative = comments.filter((c) => c.sentiment === "negative").length;
    const neutral = comments.filter((c) => c.sentiment === "neutral").length;
    const topicCounts = {};
    comments.forEach(
      (c) => (c.sentiment_topics || []).forEach((t) => {
        const key = t.trim().toLowerCase();
        if (key) topicCounts[key] = (topicCounts[key] || 0) + 1;
      })
    );
    const topTopics = Object.entries(topicCounts).sort((a, b) => b[1] - a[1]).slice(0, 8);
    return { total, analyzed, positive, negative, neutral, topTopics };
  }, [comments]);
  const filtered = useMemo(() => {
    if (filter === "all") return comments;
    if (filter === "unanalyzed") return comments.filter((c) => !c.sentiment);
    return comments.filter((c) => c.sentiment === filter);
  }, [comments, filter]);
  const handleAnalyze = async () => {
    if (!activeBusiness) return;
    setAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke("youtube-analyze-comments", {
        body: { business_id: activeBusiness.id, only_unanalyzed: true, limit: 200 }
      });
      if (error) throw error;
      if (data == null ? void 0 : data.error) throw new Error(data.error);
      toast({
        title: "Analiz tamamlandı 🎉",
        description: `${(data == null ? void 0 : data.analyzed) ?? 0} yorum analiz edildi.`
      });
      await load();
    } catch (e) {
      toast({
        title: "Analiz hatası",
        description: e instanceof Error ? e.message : "Bilinmeyen hata",
        variant: "destructive"
      });
    } finally {
      setAnalyzing(false);
    }
  };
  const handleFetchYouTube = async () => {
    if (!activeBusiness) return;
    setFetching(true);
    try {
      const { data, error } = await supabase.functions.invoke("youtube-fetch-reviews", {
        body: { business_id: activeBusiness.id, max_videos: 15 }
      });
      if (error) throw error;
      if (!(data == null ? void 0 : data.success)) throw new Error((data == null ? void 0 : data.error) || "Bilinmeyen hata");
      toast({
        title: "YouTube verileri çekildi 🎉",
        description: `${data.videos} video, ${data.comments} yorum eklendi/güncellendi.`
      });
      await load();
    } catch (e) {
      toast({
        title: "Çekme hatası",
        description: e instanceof Error ? e.message : "Bilinmeyen hata",
        variant: "destructive"
      });
    } finally {
      setFetching(false);
    }
  };
  if (!activeBusiness) {
    return /* @__PURE__ */ jsx("div", { className: "p-8 text-muted-foreground", children: "Önce bir işletme seçin." });
  }
  const pct = (n) => stats.analyzed === 0 ? 0 : Math.round(n / stats.analyzed * 100);
  return /* @__PURE__ */ jsxs("div", { className: "container mx-auto px-4 sm:px-6 py-6 space-y-6 max-w-7xl", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-start justify-between gap-4", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 flex-wrap", children: [
          /* @__PURE__ */ jsxs("h1", { className: "text-2xl font-bold flex items-center gap-2", children: [
            /* @__PURE__ */ jsx(Sparkles, { className: "h-6 w-6 text-primary" }),
            "Sosyal Medya Analizi"
          ] }),
          businesses.length > 1 && /* @__PURE__ */ jsxs(
            Select,
            {
              value: activeBusiness.id,
              onValueChange: (id) => {
                const b = businesses.find((x) => x.id === id);
                if (b) setActiveBusiness(b);
              },
              children: [
                /* @__PURE__ */ jsxs(SelectTrigger, { className: "w-[220px] h-9 text-sm", children: [
                  /* @__PURE__ */ jsx(MapPin, { className: "h-4 w-4 mr-1.5 text-muted-foreground" }),
                  /* @__PURE__ */ jsx(SelectValue, { placeholder: "Lokasyon" })
                ] }),
                /* @__PURE__ */ jsx(SelectContent, { children: businesses.map((b) => /* @__PURE__ */ jsx(SelectItem, { value: b.id, children: b.name }, b.id)) })
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground mt-1", children: "YouTube yorumlarının duygu analizi, çevirisi ve ana konuları tek ekranda." })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex gap-2 flex-wrap", children: [
        /* @__PURE__ */ jsxs(Button, { variant: "outline", onClick: handleFetchYouTube, disabled: fetching, children: [
          fetching ? /* @__PURE__ */ jsx(Loader2, { className: "h-4 w-4 mr-2 animate-spin" }) : /* @__PURE__ */ jsx(Youtube, { className: "h-4 w-4 mr-2 text-red-600" }),
          fetching ? "Çekiliyor..." : "YouTube Yorumlarını Çek"
        ] }),
        /* @__PURE__ */ jsxs(Button, { onClick: handleAnalyze, disabled: analyzing, children: [
          analyzing ? /* @__PURE__ */ jsx(Loader2, { className: "h-4 w-4 mr-2 animate-spin" }) : /* @__PURE__ */ jsx(Sparkles, { className: "h-4 w-4 mr-2" }),
          analyzing ? "Analiz ediliyor..." : "Analiz Et"
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-4", children: [
      /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsxs(CardContent, { className: "p-4", children: [
        /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: "Toplam yorum" }),
        /* @__PURE__ */ jsx("p", { className: "text-2xl font-semibold mt-1", children: stats.total }),
        /* @__PURE__ */ jsxs("p", { className: "text-xs text-muted-foreground mt-1", children: [
          stats.analyzed,
          " analiz edildi"
        ] })
      ] }) }),
      /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsxs(CardContent, { className: "p-4", children: [
        /* @__PURE__ */ jsxs("p", { className: "text-xs text-muted-foreground flex items-center gap-1", children: [
          /* @__PURE__ */ jsx(ThumbsUp, { className: "h-3 w-3 text-emerald-600" }),
          " Pozitif"
        ] }),
        /* @__PURE__ */ jsx("p", { className: "text-2xl font-semibold mt-1 text-emerald-600", children: stats.positive }),
        /* @__PURE__ */ jsxs("p", { className: "text-xs text-muted-foreground mt-1", children: [
          "%",
          pct(stats.positive)
        ] })
      ] }) }),
      /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsxs(CardContent, { className: "p-4", children: [
        /* @__PURE__ */ jsxs("p", { className: "text-xs text-muted-foreground flex items-center gap-1", children: [
          /* @__PURE__ */ jsx(ThumbsDown, { className: "h-3 w-3 text-rose-600" }),
          " Negatif"
        ] }),
        /* @__PURE__ */ jsx("p", { className: "text-2xl font-semibold mt-1 text-rose-600", children: stats.negative }),
        /* @__PURE__ */ jsxs("p", { className: "text-xs text-muted-foreground mt-1", children: [
          "%",
          pct(stats.negative)
        ] })
      ] }) }),
      /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsxs(CardContent, { className: "p-4", children: [
        /* @__PURE__ */ jsxs("p", { className: "text-xs text-muted-foreground flex items-center gap-1", children: [
          /* @__PURE__ */ jsx(Minus, { className: "h-3 w-3" }),
          " Nötr"
        ] }),
        /* @__PURE__ */ jsx("p", { className: "text-2xl font-semibold mt-1", children: stats.neutral }),
        /* @__PURE__ */ jsxs("p", { className: "text-xs text-muted-foreground mt-1", children: [
          "%",
          pct(stats.neutral)
        ] })
      ] }) })
    ] }),
    stats.topTopics.length > 0 && /* @__PURE__ */ jsxs(Card, { children: [
      /* @__PURE__ */ jsx(CardHeader, { className: "pb-3", children: /* @__PURE__ */ jsxs(CardTitle, { className: "text-base flex items-center gap-2", children: [
        /* @__PURE__ */ jsx(TrendingUp, { className: "h-4 w-4" }),
        "En çok geçen konular"
      ] }) }),
      /* @__PURE__ */ jsx(CardContent, { className: "flex flex-wrap gap-2", children: stats.topTopics.map(([topic, count]) => /* @__PURE__ */ jsxs(Badge, { variant: "secondary", className: "text-xs", children: [
        topic,
        " ",
        /* @__PURE__ */ jsxs("span", { className: "ml-1.5 opacity-60", children: [
          "×",
          count
        ] })
      ] }, topic)) })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "flex flex-wrap gap-2", children: ["all", "positive", "negative", "neutral", "unanalyzed"].map((f) => /* @__PURE__ */ jsx(
      "button",
      {
        onClick: () => setFilter(f),
        className: `px-3 py-1.5 rounded-full text-xs border transition-colors ${filter === f ? "bg-primary text-primary-foreground border-primary" : "bg-background hover:bg-muted border-border"}`,
        children: f === "all" ? `Tümü (${stats.total})` : f === "positive" ? `Pozitif (${stats.positive})` : f === "negative" ? `Negatif (${stats.negative})` : f === "neutral" ? `Nötr (${stats.neutral})` : `Analiz edilmemiş (${stats.total - stats.analyzed})`
      },
      f
    )) }),
    loading ? /* @__PURE__ */ jsx("div", { className: "flex justify-center py-12", children: /* @__PURE__ */ jsx(Loader2, { className: "h-6 w-6 animate-spin text-muted-foreground" }) }) : filtered.length === 0 ? /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsx(CardContent, { className: "py-12 text-center text-muted-foreground", children: stats.total === 0 ? "Henüz yorum yok. Önce YouTube Yorumları sayfasından video & yorum çekin." : "Bu filtreye uyan yorum yok." }) }) : /* @__PURE__ */ jsx("div", { className: "space-y-3", children: filtered.map((c) => {
      var _a;
      const meta = c.sentiment ? sentimentMeta[c.sentiment] : null;
      const Icon = meta == null ? void 0 : meta.icon;
      return /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsx(CardContent, { className: "p-4", children: /* @__PURE__ */ jsxs("div", { className: "flex gap-3", children: [
        c.author_avatar_url ? /* @__PURE__ */ jsx("img", { src: c.author_avatar_url, alt: "", className: "w-9 h-9 rounded-full flex-shrink-0" }) : /* @__PURE__ */ jsx("div", { className: "w-9 h-9 rounded-full bg-muted flex-shrink-0" }),
        /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 flex-wrap mb-1", children: [
            /* @__PURE__ */ jsx("span", { className: "text-sm font-medium", children: c.author_display_name || "Anonim" }),
            c.commented_at && /* @__PURE__ */ jsx("span", { className: "text-xs text-muted-foreground", children: formatDistanceToNow(new Date(c.commented_at), { addSuffix: true, locale: tr }) }),
            meta && Icon && /* @__PURE__ */ jsxs(Badge, { variant: "outline", className: `text-xs ${meta.className}`, children: [
              /* @__PURE__ */ jsx(Icon, { className: "h-3 w-3 mr-1" }),
              meta.label,
              c.sentiment_score != null && /* @__PURE__ */ jsxs("span", { className: "ml-1 opacity-70", children: [
                "·",
                Math.round(c.sentiment_score * 100),
                "%"
              ] })
            ] }),
            !c.sentiment && /* @__PURE__ */ jsx(Badge, { variant: "outline", className: "text-xs", children: "Analiz edilmedi" })
          ] }),
          /* @__PURE__ */ jsx("p", { className: "text-sm whitespace-pre-wrap break-words", children: c.comment_text }),
          c.sentiment_translated_text && c.sentiment_translated_text.trim() !== c.comment_text.trim() && /* @__PURE__ */ jsxs("div", { className: "mt-2 p-2 rounded-md bg-muted/40 border-l-2 border-primary", children: [
            /* @__PURE__ */ jsxs("p", { className: "text-[10px] uppercase tracking-wide text-muted-foreground mb-1 flex items-center gap-1", children: [
              /* @__PURE__ */ jsx(Languages, { className: "h-3 w-3" }),
              " Türkçe"
            ] }),
            /* @__PURE__ */ jsx("p", { className: "text-sm whitespace-pre-wrap break-words", children: c.sentiment_translated_text })
          ] }),
          c.sentiment_summary && /* @__PURE__ */ jsxs("p", { className: "text-xs text-muted-foreground mt-2 italic", children: [
            "AI özet: ",
            c.sentiment_summary
          ] }),
          c.sentiment_topics && c.sentiment_topics.length > 0 && /* @__PURE__ */ jsx("div", { className: "flex flex-wrap gap-1 mt-2", children: c.sentiment_topics.map((t, i) => /* @__PURE__ */ jsx(Badge, { variant: "secondary", className: "text-[10px]", children: t }, i)) }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 mt-2 text-xs text-muted-foreground", children: [
            /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-1", children: [
              /* @__PURE__ */ jsx(ThumbsUp, { className: "h-3 w-3" }),
              " ",
              c.like_count ?? 0
            ] }),
            ((_a = c.youtube_videos) == null ? void 0 : _a.permalink) && /* @__PURE__ */ jsxs(
              "a",
              {
                href: c.youtube_videos.permalink,
                target: "_blank",
                rel: "noopener noreferrer",
                className: "flex items-center gap-1 hover:text-primary transition-colors truncate max-w-[40ch]",
                children: [
                  /* @__PURE__ */ jsx(Youtube, { className: "h-3 w-3 text-red-600 flex-shrink-0" }),
                  /* @__PURE__ */ jsx("span", { className: "truncate", children: c.youtube_videos.title || "Videoya git" }),
                  /* @__PURE__ */ jsx(ExternalLink, { className: "h-3 w-3 flex-shrink-0" })
                ]
              }
            )
          ] })
        ] })
      ] }) }) }, c.id);
    }) })
  ] });
}
export {
  SocialAnalytics as default
};
