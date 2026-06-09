import { jsx, jsxs } from "react/jsx-runtime";
import { useState, useCallback, useEffect } from "react";
import { a as useBusiness, s as supabase, B as Button, t as toast } from "../main.mjs";
import { C as Card, c as CardContent, a as CardHeader, e as CardTitle } from "./card-vx9BCW0t.js";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-1zED13tY.js";
import { Youtube, MapPin, Loader2, RefreshCw, Languages, ExternalLink, ThumbsUp } from "lucide-react";
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
function YouTubeInbox() {
  var _a, _b;
  const { activeBusiness, businesses, setActiveBusiness } = useBusiness();
  const [videos, setVideos] = useState([]);
  const [comments, setComments] = useState([]);
  const [selectedVideoId, setSelectedVideoId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [translations, setTranslations] = useState({});
  const [translatingId, setTranslatingId] = useState(null);
  const [translatingAll, setTranslatingAll] = useState(false);
  const loadData = useCallback(async () => {
    if (!activeBusiness) return;
    setLoading(true);
    const { data: vids } = await supabase.from("youtube_videos").select("*").eq("business_id", activeBusiness.id).order("published_at", { ascending: false });
    setVideos(vids || []);
    if (vids && vids.length > 0 && !selectedVideoId) {
      setSelectedVideoId(vids[0].id);
    }
    setLoading(false);
  }, [activeBusiness, selectedVideoId]);
  const loadComments = useCallback(async (videoId) => {
    const { data } = await supabase.from("youtube_comments").select("*").eq("video_id", videoId).order("like_count", { ascending: false });
    setComments(data || []);
  }, []);
  useEffect(() => {
    loadData();
  }, [loadData]);
  useEffect(() => {
    if (selectedVideoId) {
      loadComments(selectedVideoId);
      setTranslations({});
    }
  }, [selectedVideoId, loadComments]);
  const translateOne = async (c) => {
    if (translations[c.id]) {
      setTranslations((prev) => {
        const { [c.id]: _, ...rest } = prev;
        return rest;
      });
      return;
    }
    setTranslatingId(c.id);
    try {
      const { data, error } = await supabase.functions.invoke("translate-text", {
        body: { text: c.comment_text, target: "tr" }
      });
      if (error) throw error;
      if (data == null ? void 0 : data.translated) {
        setTranslations((prev) => ({ ...prev, [c.id]: data.translated }));
      } else {
        throw new Error("Çeviri alınamadı");
      }
    } catch (e) {
      toast({
        title: "Çeviri hatası",
        description: e instanceof Error ? e.message : "Bilinmeyen hata",
        variant: "destructive"
      });
    } finally {
      setTranslatingId(null);
    }
  };
  const translateAll = async () => {
    const pending = comments.filter((c) => !translations[c.id]);
    if (pending.length === 0) return;
    setTranslatingAll(true);
    try {
      const results = await Promise.all(
        pending.map(async (c) => {
          try {
            const { data, error } = await supabase.functions.invoke("translate-text", {
              body: { text: c.comment_text, target: "tr" }
            });
            if (error || !(data == null ? void 0 : data.translated)) return null;
            return [c.id, data.translated];
          } catch {
            return null;
          }
        })
      );
      setTranslations((prev) => {
        const next = { ...prev };
        for (const r of results) if (r) next[r[0]] = r[1];
        return next;
      });
    } finally {
      setTranslatingAll(false);
    }
  };
  const handleFetch = async () => {
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
      await loadData();
    } catch (e) {
      toast({
        title: "Hata",
        description: e instanceof Error ? e.message : "Çekme başarısız",
        variant: "destructive"
      });
    } finally {
      setFetching(false);
    }
  };
  if (!activeBusiness) {
    return /* @__PURE__ */ jsx("div", { className: "p-8 text-muted-foreground", children: "Önce bir işletme seçin." });
  }
  return /* @__PURE__ */ jsxs("div", { className: "container mx-auto px-4 sm:px-6 py-6 space-y-6 max-w-7xl", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between gap-4 flex-wrap", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 flex-wrap", children: [
          /* @__PURE__ */ jsxs("h1", { className: "text-2xl font-bold flex items-center gap-2", children: [
            /* @__PURE__ */ jsx(Youtube, { className: "h-7 w-7 text-red-600" }),
            "YouTube Yorumları"
          ] }),
          businesses.length > 1 && /* @__PURE__ */ jsxs(
            Select,
            {
              value: activeBusiness.id,
              onValueChange: (id) => {
                const b = businesses.find((x) => x.id === id);
                if (b) {
                  setActiveBusiness(b);
                  setSelectedVideoId(null);
                  setComments([]);
                }
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
        /* @__PURE__ */ jsxs("p", { className: "text-sm text-muted-foreground mt-1", children: [
          '"',
          activeBusiness.name,
          '" adı geçen videoları ve yorumlarını çek.'
        ] })
      ] }),
      /* @__PURE__ */ jsxs(Button, { onClick: handleFetch, disabled: fetching, children: [
        fetching ? /* @__PURE__ */ jsx(Loader2, { className: "h-4 w-4 mr-2 animate-spin" }) : /* @__PURE__ */ jsx(RefreshCw, { className: "h-4 w-4 mr-2" }),
        fetching ? "Çekiliyor..." : "Videoları & Yorumları Çek"
      ] })
    ] }),
    loading ? /* @__PURE__ */ jsx("div", { className: "flex justify-center py-12", children: /* @__PURE__ */ jsx(Loader2, { className: "h-6 w-6 animate-spin text-muted-foreground" }) }) : videos.length === 0 ? /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsx(CardContent, { className: "py-12 text-center text-muted-foreground", children: 'Henüz veri yok. "Videoları & Yorumları Çek" butonuna basarak başla.' }) }) : /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-6", children: [
      /* @__PURE__ */ jsx("div", { className: "lg:col-span-1 space-y-3 max-h-[80vh] overflow-y-auto", children: videos.map((v) => /* @__PURE__ */ jsx(
        Card,
        {
          className: `cursor-pointer transition-colors ${selectedVideoId === v.id ? "border-primary" : ""}`,
          onClick: () => setSelectedVideoId(v.id),
          children: /* @__PURE__ */ jsxs(CardContent, { className: "p-3 flex gap-3", children: [
            v.thumbnail_url && /* @__PURE__ */ jsx("img", { src: v.thumbnail_url, alt: "", className: "w-24 h-16 object-cover rounded" }),
            /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
              /* @__PURE__ */ jsx("p", { className: "text-sm font-medium line-clamp-2", children: v.title }),
              /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground mt-1", children: v.channel_title }),
              /* @__PURE__ */ jsxs("div", { className: "flex gap-2 mt-1 text-xs text-muted-foreground", children: [
                /* @__PURE__ */ jsxs("span", { children: [
                  v.view_count.toLocaleString(),
                  " 👁"
                ] }),
                /* @__PURE__ */ jsxs("span", { children: [
                  v.comment_count,
                  " 💬"
                ] })
              ] })
            ] })
          ] })
        },
        v.id
      )) }),
      /* @__PURE__ */ jsx("div", { className: "lg:col-span-2", children: selectedVideoId && /* @__PURE__ */ jsxs(Card, { children: [
        /* @__PURE__ */ jsx(CardHeader, { children: /* @__PURE__ */ jsxs(CardTitle, { className: "text-base flex items-center justify-between", children: [
          /* @__PURE__ */ jsxs("span", { children: [
            "Yorumlar (",
            comments.length,
            ")"
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
            comments.length > 0 && /* @__PURE__ */ jsxs(
              Button,
              {
                variant: "outline",
                size: "sm",
                onClick: translateAll,
                disabled: translatingAll,
                className: "h-8",
                children: [
                  translatingAll ? /* @__PURE__ */ jsx(Loader2, { className: "h-3.5 w-3.5 mr-1.5 animate-spin" }) : /* @__PURE__ */ jsx(Languages, { className: "h-3.5 w-3.5 mr-1.5" }),
                  "Tümünü Türkçeye Çevir"
                ]
              }
            ),
            ((_a = videos.find((v) => v.id === selectedVideoId)) == null ? void 0 : _a.permalink) && /* @__PURE__ */ jsxs(
              "a",
              {
                href: (_b = videos.find((v) => v.id === selectedVideoId)) == null ? void 0 : _b.permalink,
                target: "_blank",
                rel: "noopener noreferrer",
                className: "text-sm text-primary flex items-center gap-1 hover:underline",
                children: [
                  "Videoya git ",
                  /* @__PURE__ */ jsx(ExternalLink, { className: "h-3 w-3" })
                ]
              }
            )
          ] })
        ] }) }),
        /* @__PURE__ */ jsx(CardContent, { className: "space-y-4 max-h-[70vh] overflow-y-auto", children: comments.length === 0 ? /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground text-center py-6", children: "Bu video için yorum bulunamadı (yorumlar kapalı olabilir)." }) : comments.map((c) => /* @__PURE__ */ jsxs("div", { className: "flex gap-3 pb-4 border-b last:border-0", children: [
          c.author_avatar_url ? /* @__PURE__ */ jsx("img", { src: c.author_avatar_url, alt: "", className: "w-8 h-8 rounded-full" }) : /* @__PURE__ */ jsx("div", { className: "w-8 h-8 rounded-full bg-muted" }),
          /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 flex-wrap", children: [
              /* @__PURE__ */ jsx("span", { className: "text-sm font-medium", children: c.author_display_name }),
              /* @__PURE__ */ jsx("span", { className: "text-xs text-muted-foreground", children: formatDistanceToNow(new Date(c.commented_at), { addSuffix: true, locale: tr }) })
            ] }),
            /* @__PURE__ */ jsx("p", { className: "text-sm mt-1 whitespace-pre-wrap break-words", children: c.comment_text }),
            translations[c.id] && /* @__PURE__ */ jsxs("div", { className: "mt-2 p-2 rounded-md bg-muted/50 border-l-2 border-primary", children: [
              /* @__PURE__ */ jsxs("p", { className: "text-[10px] uppercase tracking-wide text-muted-foreground mb-1 flex items-center gap-1", children: [
                /* @__PURE__ */ jsx(Languages, { className: "h-3 w-3" }),
                " Türkçe çeviri"
              ] }),
              /* @__PURE__ */ jsx("p", { className: "text-sm whitespace-pre-wrap break-words", children: translations[c.id] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 mt-2 text-xs text-muted-foreground", children: [
              /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-1", children: [
                /* @__PURE__ */ jsx(ThumbsUp, { className: "h-3 w-3" }),
                " ",
                c.like_count
              ] }),
              /* @__PURE__ */ jsxs(
                "button",
                {
                  onClick: () => translateOne(c),
                  disabled: translatingId === c.id,
                  className: "flex items-center gap-1 hover:text-primary transition-colors disabled:opacity-50",
                  children: [
                    translatingId === c.id ? /* @__PURE__ */ jsx(Loader2, { className: "h-3 w-3 animate-spin" }) : /* @__PURE__ */ jsx(Languages, { className: "h-3 w-3" }),
                    translations[c.id] ? "Orijinali göster" : "Türkçeye çevir"
                  ]
                }
              )
            ] })
          ] })
        ] }, c.id)) })
      ] }) })
    ] })
  ] });
}
export {
  YouTubeInbox as default
};
