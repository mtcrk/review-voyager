import { jsxs, jsx, Fragment } from "react/jsx-runtime";
import { useState, useCallback, useEffect } from "react";
import { u as useTikTokConnection } from "./useTikTokConnection-VReZ2PUi.js";
import { z as useToast, s as supabase, B as Button, m as Badge, y as cn, S as Skeleton, T as Tooltip, C as TooltipTrigger, E as TooltipContent } from "../main.mjs";
import { C as Card, c as CardContent, a as CardHeader, e as CardTitle, b as CardDescription } from "./card-vx9BCW0t.js";
import { T as Textarea } from "./textarea-BbAnJDWe.js";
import { S as ScrollArea } from "./scroll-area-C-y00E-Y.js";
import { A as Avatar, a as AvatarImage, b as AvatarFallback } from "./avatar-D1gYhgs6.js";
import { AlertTriangle, ExternalLink, Shield, UserCheck, Beaker, RefreshCw, Video, Download, MessageSquare, Clock, Sparkles, CheckCircle, AlertCircle, X, Eye, Heart, ChevronRight, Ban, Send } from "lucide-react";
import { A as Alert, b as AlertTitle, a as AlertDescription } from "./alert-BbdwpNV6.js";
import { Link } from "react-router-dom";
import { S as Switch } from "./switch-DIbAOqMh.js";
import { L as Label } from "./label-Dr59vwVb.js";
import { formatDistanceToNow } from "date-fns";
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
import "@radix-ui/react-scroll-area";
import "@radix-ui/react-avatar";
import "@radix-ui/react-switch";
import "@radix-ui/react-label";
function useTikTokVideos(socialConnectionId) {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { toast } = useToast();
  const fetchVideos = useCallback(async (refresh = false) => {
    if (!socialConnectionId) return;
    setLoading(true);
    setError(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error("Not authenticated");
      }
      if (refresh) {
        const response = await fetch(
          `${"https://pnpuhewfoxssmbpryart.supabase.co"}/functions/v1/tiktok-videos?connection_id=${socialConnectionId}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${session.access_token}`,
              "Content-Type": "application/json"
            }
          }
        );
        const data = await response.json();
        if (!response.ok) {
          if (data.code === "NOT_CONNECTED") {
            setError("TikTok hesabı bağlı değil");
            return;
          }
          if (data.code === "TOKEN_EXPIRED") {
            setError("TikTok oturumu sona erdi. Lütfen yeniden bağlayın.");
            return;
          }
          throw new Error(data.error || "Failed to fetch videos");
        }
        setVideos(data.videos || []);
        toast({
          title: "Videolar güncellendi",
          description: `${data.fetched || 0} video TikTok'tan alındı`
        });
      } else {
        const { data, error: dbError } = await supabase.from("tiktok_videos").select("*").eq("social_connection_id", socialConnectionId).order("published_at", { ascending: false });
        if (dbError) throw dbError;
        setVideos(data || []);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Bilinmeyen hata";
      setError(message);
      toast({
        title: "Hata",
        description: message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [socialConnectionId, toast]);
  return { videos, loading, error, fetchVideos, setVideos };
}
function useTikTokComments(socialConnectionId, videoId) {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { toast } = useToast();
  const fetchComments = useCallback(async (refresh = false) => {
    if (!socialConnectionId || !videoId) return;
    setLoading(true);
    setError(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error("Not authenticated");
      }
      if (refresh) {
        const response = await fetch(
          `${"https://pnpuhewfoxssmbpryart.supabase.co"}/functions/v1/tiktok-comments?connection_id=${socialConnectionId}&video_id=${videoId}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${session.access_token}`,
              "Content-Type": "application/json"
            }
          }
        );
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || "Failed to fetch comments");
        }
        setComments(data.comments || []);
        toast({
          title: "Yorumlar güncellendi",
          description: `${data.fetched || 0} yorum TikTok'tan alındı`
        });
      } else {
        const { data, error: dbError } = await supabase.from("tiktok_comments").select(`
            *,
            suggestions:tiktok_reply_suggestions(*),
            replies:tiktok_comment_replies(*)
          `).eq("video_id", videoId).order("commented_at", { ascending: false });
        if (dbError) throw dbError;
        setComments(data || []);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Bilinmeyen hata";
      setError(message);
      toast({
        title: "Hata",
        description: message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [socialConnectionId, videoId, toast]);
  const generateSuggestions = useCallback(async (commentId) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");
      const response = await fetch(
        `${"https://pnpuhewfoxssmbpryart.supabase.co"}/functions/v1/tiktok-suggest-reply`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${session.access_token}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ comment_id: commentId })
        }
      );
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to generate suggestions");
      }
      setComments((prev) => prev.map(
        (c) => c.id === commentId ? { ...c, status: "suggested", suggestions: data.suggestions } : c
      ));
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Bilinmeyen hata";
      toast({
        title: "AI Yanıt Hatası",
        description: message,
        variant: "destructive"
      });
      throw err;
    }
  }, [toast]);
  const sendReply = useCallback(async (commentId, replyText) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");
      const response = await fetch(
        `${"https://pnpuhewfoxssmbpryart.supabase.co"}/functions/v1/tiktok-send-reply`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${session.access_token}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ comment_id: commentId, reply_text: replyText })
        }
      );
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to send reply");
      }
      setComments((prev) => prev.map(
        (c) => c.id === commentId ? {
          ...c,
          status: "sent",
          replies: [...c.replies || [], data.reply]
        } : c
      ));
      toast({
        title: "Yanıt gönderildi",
        description: "Yanıtınız başarıyla TikTok'a gönderildi"
      });
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Bilinmeyen hata";
      toast({
        title: "Gönderim Hatası",
        description: message,
        variant: "destructive"
      });
      throw err;
    }
  }, [toast]);
  return {
    comments,
    loading,
    error,
    fetchComments,
    generateSuggestions,
    sendReply,
    setComments
  };
}
const TIKTOK_CONFIG = {
  // Mode: 'sandbox' or 'production'
  mode: "sandbox",
  // Demo mode enabled by default in sandbox
  demoModeEnabled: true,
  // Allow simulated send in demo mode
  allowSimulatedSend: true,
  // Helpers
  get isSandbox() {
    return this.mode === "sandbox";
  },
  get isProduction() {
    return this.mode === "production";
  },
  get canUseDemo() {
    return this.isSandbox && this.demoModeEnabled;
  },
  get canSimulateSend() {
    return this.canUseDemo && this.allowSimulatedSend;
  }
};
function useTikTokDemoMode(socialConnectionId, videoId) {
  const [isDemoMode, setIsDemoMode] = useState(TIKTOK_CONFIG.canUseDemo);
  const [isLoadingSamples, setIsLoadingSamples] = useState(false);
  const [isLoadingDemoVideo, setIsLoadingDemoVideo] = useState(false);
  const { toast } = useToast();
  const toggleDemoMode = useCallback(() => {
    if (!TIKTOK_CONFIG.canUseDemo) return;
    setIsDemoMode((prev) => !prev);
  }, []);
  const loadSampleComments = useCallback(async (tiktokVideoId, videoDbId) => {
    var _a;
    if (!socialConnectionId || !videoId) return [];
    setIsLoadingSamples(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");
      const response = await fetch(
        `${"https://pnpuhewfoxssmbpryart.supabase.co"}/functions/v1/tiktok-seed-demo-comments`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${session.access_token}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            social_connection_id: socialConnectionId,
            video_id: videoId,
            tiktok_video_id: tiktokVideoId
          })
        }
      );
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to load sample comments");
      }
      toast({
        title: "Demo yorumlar yüklendi",
        description: `${((_a = data.comments) == null ? void 0 : _a.length) || 0} örnek yorum eklendi`
      });
      return data.comments || [];
    } catch (err) {
      const message = err instanceof Error ? err.message : "Bilinmeyen hata";
      toast({
        title: "Hata",
        description: message,
        variant: "destructive"
      });
      return [];
    } finally {
      setIsLoadingSamples(false);
    }
  }, [socialConnectionId, videoId, toast]);
  const simulateSendReply = useCallback(async (commentId, replyText, onSuccess) => {
    if (!socialConnectionId) return;
    try {
      const { data: comment } = await supabase.from("tiktok_comments").select("business_id").eq("id", commentId).single();
      const { data: reply, error } = await supabase.from("tiktok_comment_replies").insert({
        business_id: (comment == null ? void 0 : comment.business_id) || socialConnectionId,
        // fallback
        comment_id: commentId,
        reply_text: replyText,
        send_status: "sent",
        tiktok_reply_id: `SIMULATED_${Date.now()}`,
        sent_at: (/* @__PURE__ */ new Date()).toISOString()
      }).select().single();
      if (error) throw error;
      await supabase.from("tiktok_comments").update({ status: "sent" }).eq("id", commentId);
      toast({
        title: "Simüle Gönderim",
        description: "Demo modunda yanıt simüle edildi (gerçek gönderim yapılmadı)"
      });
      onSuccess(reply);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Bilinmeyen hata";
      toast({
        title: "Simülasyon Hatası",
        description: message,
        variant: "destructive"
      });
    }
  }, [socialConnectionId, toast]);
  const loadDemoVideo = useCallback(async () => {
    if (!socialConnectionId) return null;
    setIsLoadingDemoVideo(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");
      const response = await fetch(
        `${"https://pnpuhewfoxssmbpryart.supabase.co"}/functions/v1/tiktok-seed-demo-video`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${session.access_token}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ social_connection_id: socialConnectionId })
        }
      );
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to load demo video");
      }
      toast({
        title: data.created ? "Demo video oluşturuldu" : "Demo video mevcut",
        description: data.message
      });
      return data.video || null;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Bilinmeyen hata";
      toast({
        title: "Hata",
        description: message,
        variant: "destructive"
      });
      return null;
    } finally {
      setIsLoadingDemoVideo(false);
    }
  }, [socialConnectionId, toast]);
  return {
    isDemoMode,
    toggleDemoMode,
    loadSampleComments,
    isLoadingSamples,
    loadDemoVideo,
    isLoadingDemoVideo,
    simulateSendReply,
    canUseDemo: TIKTOK_CONFIG.canUseDemo,
    canSimulateSend: TIKTOK_CONFIG.canSimulateSend,
    isSandbox: TIKTOK_CONFIG.isSandbox,
    isProduction: TIKTOK_CONFIG.isProduction
  };
}
function TikTokSandboxBanner({ isDemoMode }) {
  if (!TIKTOK_CONFIG.isSandbox) return null;
  return /* @__PURE__ */ jsxs(Alert, { variant: "default", className: "mb-4 border-yellow-500/50 bg-yellow-50/50 dark:bg-yellow-950/20", children: [
    /* @__PURE__ */ jsx(AlertTriangle, { className: "h-4 w-4 text-yellow-600" }),
    /* @__PURE__ */ jsx(AlertTitle, { className: "text-yellow-700 dark:text-yellow-400", children: "Sandbox Modu" }),
    /* @__PURE__ */ jsxs(AlertDescription, { className: "text-yellow-600 dark:text-yellow-300", children: [
      /* @__PURE__ */ jsxs("p", { className: "mb-2", children: [
        "TikTok API sandbox modunda çalışıyor. Sandbox, mock/boş yorum döndürebilir ve yanıt gönderimini engelleyebilir.",
        isDemoMode && " Demo Modu aktif: Örnek verilerle test yapabilirsiniz."
      ] }),
      /* @__PURE__ */ jsx("div", { className: "flex items-center gap-2", children: /* @__PURE__ */ jsx(Button, { asChild: true, variant: "outline", size: "sm", className: "h-7 text-xs", children: /* @__PURE__ */ jsxs(Link, { to: "/tiktok-review-kit", children: [
        /* @__PURE__ */ jsx(ExternalLink, { className: "h-3 w-3 mr-1" }),
        "App Review Kit"
      ] }) }) })
    ] })
  ] });
}
function TikTokComplianceCard() {
  return /* @__PURE__ */ jsx(Card, { className: "mb-4 border-primary/30 bg-primary/5", children: /* @__PURE__ */ jsx(CardContent, { className: "py-3 px-4", children: /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3", children: [
    /* @__PURE__ */ jsx(Shield, { className: "h-5 w-5 text-primary mt-0.5 flex-shrink-0" }),
    /* @__PURE__ */ jsxs("div", { className: "flex-1 space-y-1", children: [
      /* @__PURE__ */ jsx("p", { className: "text-sm font-medium", children: "Nasıl Çalışır: AI önerir, siz onaylarsınız. Otomatik gönderim yoktur." }),
      /* @__PURE__ */ jsxs("p", { className: "text-xs text-muted-foreground", children: [
        /* @__PURE__ */ jsx(UserCheck, { className: "h-3 w-3 inline mr-1" }),
        "Yanıtlar ve uyumluluk konusunda sorumluluk size aittir."
      ] })
    ] })
  ] }) }) });
}
function TikTokDemoModeToggle({ isDemoMode, onToggle }) {
  if (!TIKTOK_CONFIG.canUseDemo) return null;
  return /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 px-3 py-2 border rounded-lg bg-muted/50", children: [
    /* @__PURE__ */ jsx(Beaker, { className: "h-4 w-4 text-muted-foreground" }),
    /* @__PURE__ */ jsxs(Label, { htmlFor: "demo-mode", className: "text-sm cursor-pointer flex items-center gap-2", children: [
      "Demo Mod",
      isDemoMode && /* @__PURE__ */ jsx(Badge, { variant: "secondary", className: "text-xs", children: "Aktif" })
    ] }),
    /* @__PURE__ */ jsx(
      Switch,
      {
        id: "demo-mode",
        checked: isDemoMode,
        onCheckedChange: onToggle
      }
    )
  ] });
}
const statusConfig = {
  open: { label: "Açık", variant: "outline", icon: /* @__PURE__ */ jsx(Clock, { className: "h-3 w-3" }) },
  suggested: { label: "Öneri Hazır", variant: "secondary", icon: /* @__PURE__ */ jsx(Sparkles, { className: "h-3 w-3" }) },
  approved: { label: "Onaylandı", variant: "default", icon: /* @__PURE__ */ jsx(CheckCircle, { className: "h-3 w-3" }) },
  sent: { label: "Gönderildi", variant: "default", icon: /* @__PURE__ */ jsx(CheckCircle, { className: "h-3 w-3" }) },
  failed: { label: "Hata", variant: "destructive", icon: /* @__PURE__ */ jsx(AlertCircle, { className: "h-3 w-3" }) },
  ignored: { label: "Yoksayıldı", variant: "outline", icon: /* @__PURE__ */ jsx(X, { className: "h-3 w-3" }) }
};
function VideoCard({ video, isSelected, onClick }) {
  const isDemo = video.raw && typeof video.raw === "object" && !Array.isArray(video.raw) && "demo" in video.raw && video.raw.demo;
  return /* @__PURE__ */ jsx(
    "button",
    {
      onClick,
      className: cn(
        "w-full text-left p-3 rounded-lg border transition-all hover:bg-accent/50",
        isSelected && "bg-accent border-primary",
        isDemo && "border-dashed border-yellow-500/50"
      ),
      children: /* @__PURE__ */ jsxs("div", { className: "flex gap-3", children: [
        video.thumbnail_url ? /* @__PURE__ */ jsx(
          "img",
          {
            src: video.thumbnail_url,
            alt: "",
            className: "w-16 h-24 object-cover rounded-md bg-muted"
          }
        ) : /* @__PURE__ */ jsx("div", { className: "w-16 h-24 bg-muted rounded-md flex items-center justify-center", children: /* @__PURE__ */ jsx(Video, { className: "h-6 w-6 text-muted-foreground" }) }),
        /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mb-1", children: [
            /* @__PURE__ */ jsx("p", { className: "text-sm font-medium line-clamp-2", children: video.caption || "Video" }),
            isDemo && /* @__PURE__ */ jsxs(Tooltip, { children: [
              /* @__PURE__ */ jsx(TooltipTrigger, { asChild: true, children: /* @__PURE__ */ jsxs(Badge, { variant: "outline", className: "text-xs bg-yellow-50 text-yellow-700 border-yellow-300 shrink-0", children: [
                /* @__PURE__ */ jsx(Beaker, { className: "h-3 w-3 mr-1" }),
                "Demo"
              ] }) }),
              /* @__PURE__ */ jsx(TooltipContent, { children: /* @__PURE__ */ jsx("p", { children: "Sandbox demo için örnek video" }) })
            ] })
          ] }),
          video.published_at && /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground mb-2", children: formatDistanceToNow(new Date(video.published_at), { addSuffix: true, locale: tr }) }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 text-xs text-muted-foreground", children: [
            /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-1", children: [
              /* @__PURE__ */ jsx(Eye, { className: "h-3 w-3" }),
              video.view_count.toLocaleString()
            ] }),
            /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-1", children: [
              /* @__PURE__ */ jsx(Heart, { className: "h-3 w-3" }),
              video.like_count.toLocaleString()
            ] }),
            /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-1", children: [
              /* @__PURE__ */ jsx(MessageSquare, { className: "h-3 w-3" }),
              video.comment_count
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsx(ChevronRight, { className: "h-4 w-4 text-muted-foreground self-center" })
      ] })
    }
  );
}
function CommentCard({
  comment,
  onGenerateSuggestions,
  onSendReply,
  onSimulateSend,
  isGenerating,
  isSending,
  isDemoMode,
  canSimulateSend,
  isSandbox
}) {
  var _a, _b, _c, _d, _e;
  const [replyText, setReplyText] = useState("");
  const [showReplyBox, setShowReplyBox] = useState(false);
  const status = statusConfig[comment.status] || statusConfig.open;
  const suggestions = comment.suggestions || [];
  const replies = comment.replies || [];
  const latestReply = replies.length > 0 ? replies[replies.length - 1] : null;
  const isDemo = comment.raw && typeof comment.raw === "object" && "demo" in comment.raw && comment.raw.demo;
  const shouldIgnore = suggestions.length > 0 && suggestions[0].safe_to_reply === false;
  const handleSuggestionClick = (text) => {
    setReplyText(text);
    setShowReplyBox(true);
  };
  const handleSend = () => {
    if (!replyText.trim()) return;
    if (isDemoMode && canSimulateSend) {
      onSimulateSend(replyText.trim());
    } else {
      onSendReply(replyText.trim());
    }
  };
  const isSendDisabled = isSandbox && !isDemoMode;
  return /* @__PURE__ */ jsx(Card, { className: cn("mb-3", isDemo && "border-dashed border-yellow-500/50"), children: /* @__PURE__ */ jsxs(CardContent, { className: "p-4", children: [
    isDemo && /* @__PURE__ */ jsx("div", { className: "flex items-center gap-1 mb-2", children: /* @__PURE__ */ jsxs(Badge, { variant: "outline", className: "text-xs bg-yellow-50 text-yellow-700 border-yellow-300", children: [
      /* @__PURE__ */ jsx(Beaker, { className: "h-3 w-3 mr-1" }),
      "Demo Yorum"
    ] }) }),
    /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3 mb-3", children: [
      /* @__PURE__ */ jsxs(Avatar, { className: "h-8 w-8", children: [
        /* @__PURE__ */ jsx(AvatarImage, { src: comment.author_avatar_url || void 0 }),
        /* @__PURE__ */ jsx(AvatarFallback, { children: ((_a = comment.author_display_name) == null ? void 0 : _a.charAt(0)) || ((_b = comment.author_username) == null ? void 0 : _b.charAt(0)) || "?" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mb-1", children: [
          /* @__PURE__ */ jsx("span", { className: "font-medium text-sm", children: comment.author_display_name || comment.author_username || "Kullanıcı" }),
          comment.author_username && /* @__PURE__ */ jsxs("span", { className: "text-xs text-muted-foreground", children: [
            "@",
            comment.author_username
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "ml-auto flex items-center gap-1", children: [
            ((_c = latestReply == null ? void 0 : latestReply.tiktok_reply_id) == null ? void 0 : _c.startsWith("SIMULATED")) && /* @__PURE__ */ jsx(Badge, { variant: "outline", className: "text-xs bg-blue-50 text-blue-700 border-blue-300", children: "Simüle" }),
            /* @__PURE__ */ jsxs(Badge, { variant: status.variant, className: "gap-1", children: [
              status.icon,
              status.label
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsx("p", { className: "text-sm", children: comment.comment_text }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 mt-2 text-xs text-muted-foreground", children: [
          comment.commented_at && /* @__PURE__ */ jsx("span", { children: formatDistanceToNow(new Date(comment.commented_at), { addSuffix: true, locale: tr }) }),
          /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-1", children: [
            /* @__PURE__ */ jsx(Heart, { className: "h-3 w-3" }),
            comment.like_count
          ] })
        ] })
      ] })
    ] }),
    latestReply && latestReply.send_status === "sent" && /* @__PURE__ */ jsxs("div", { className: "ml-11 p-3 bg-primary/10 rounded-lg mb-3", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mb-1", children: [
        /* @__PURE__ */ jsx(CheckCircle, { className: "h-4 w-4 text-primary" }),
        /* @__PURE__ */ jsx("span", { className: "text-xs font-medium text-primary", children: ((_d = latestReply.tiktok_reply_id) == null ? void 0 : _d.startsWith("SIMULATED")) ? "Simüle Gönderildi" : "Gönderildi" }),
        latestReply.sent_at && /* @__PURE__ */ jsx("span", { className: "text-xs text-muted-foreground", children: formatDistanceToNow(new Date(latestReply.sent_at), { addSuffix: true, locale: tr }) })
      ] }),
      /* @__PURE__ */ jsx("p", { className: "text-sm", children: latestReply.reply_text })
    ] }),
    latestReply && latestReply.send_status === "failed" && /* @__PURE__ */ jsxs("div", { className: "ml-11 p-3 bg-destructive/10 rounded-lg mb-3", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mb-1", children: [
        /* @__PURE__ */ jsx(AlertCircle, { className: "h-4 w-4 text-destructive" }),
        /* @__PURE__ */ jsx("span", { className: "text-xs font-medium text-destructive", children: "Gönderim Başarısız" })
      ] }),
      /* @__PURE__ */ jsx("p", { className: "text-sm", children: latestReply.reply_text }),
      latestReply.error_message && /* @__PURE__ */ jsx("p", { className: "text-xs text-destructive mt-1", children: latestReply.error_message })
    ] }),
    comment.status !== "sent" && /* @__PURE__ */ jsxs("div", { className: "ml-11 space-y-3", children: [
      suggestions.length > 0 && /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsx("p", { className: "text-xs font-medium text-muted-foreground", children: "AI Önerileri:" }),
          shouldIgnore && /* @__PURE__ */ jsxs(Badge, { variant: "outline", className: "text-xs bg-red-50 text-red-700 border-red-300", children: [
            /* @__PURE__ */ jsx(Ban, { className: "h-3 w-3 mr-1" }),
            "Yoksaymak Önerilir"
          ] })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "flex flex-wrap gap-2", children: suggestions.map((s) => /* @__PURE__ */ jsxs(
          "button",
          {
            onClick: () => handleSuggestionClick(s.suggested_text),
            className: "text-left px-3 py-2 text-sm bg-secondary rounded-lg hover:bg-secondary/80 transition-colors max-w-full",
            children: [
              /* @__PURE__ */ jsx("span", { className: "text-xs text-muted-foreground block mb-1 capitalize", children: s.tone === "friendly" ? "😊 Samimi" : s.tone === "professional" ? "👔 Profesyonel" : "😄 Esprili" }),
              /* @__PURE__ */ jsx("span", { className: "line-clamp-2", children: s.suggested_text })
            ]
          },
          s.id
        )) }),
        ((_e = suggestions[0]) == null ? void 0 : _e.rationale) && /* @__PURE__ */ jsxs("p", { className: "text-xs text-muted-foreground italic", children: [
          "💡 ",
          suggestions[0].rationale
        ] })
      ] }),
      showReplyBox && /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsx(
          Textarea,
          {
            value: replyText,
            onChange: (e) => setReplyText(e.target.value),
            placeholder: "Yanıtınızı yazın...",
            className: "min-h-[80px]",
            maxLength: 500
          }
        ),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsxs("span", { className: "text-xs text-muted-foreground", children: [
            replyText.length,
            "/500"
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
            /* @__PURE__ */ jsx(
              Button,
              {
                variant: "outline",
                size: "sm",
                onClick: () => setShowReplyBox(false),
                children: "İptal"
              }
            ),
            isSendDisabled ? /* @__PURE__ */ jsxs(Tooltip, { children: [
              /* @__PURE__ */ jsx(TooltipTrigger, { asChild: true, children: /* @__PURE__ */ jsx("span", { children: /* @__PURE__ */ jsxs(Button, { size: "sm", disabled: true, children: [
                /* @__PURE__ */ jsx(Send, { className: "h-4 w-4 mr-1" }),
                "Gönder"
              ] }) }) }),
              /* @__PURE__ */ jsx(TooltipContent, { children: /* @__PURE__ */ jsxs("p", { children: [
                "Yanıt göndermek için Production onayı gereklidir.",
                /* @__PURE__ */ jsx("br", {}),
                "Akışı simüle etmek için Demo Modu'nu açın."
              ] }) })
            ] }) : /* @__PURE__ */ jsxs(
              Button,
              {
                size: "sm",
                onClick: handleSend,
                disabled: !replyText.trim() || isSending,
                className: isDemoMode && canSimulateSend ? "bg-blue-600 hover:bg-blue-700" : "",
                children: [
                  isSending ? /* @__PURE__ */ jsx(RefreshCw, { className: "h-4 w-4 animate-spin mr-1" }) : /* @__PURE__ */ jsx(Send, { className: "h-4 w-4 mr-1" }),
                  isDemoMode && canSimulateSend ? "Onayla ve Gönder (Simüle)" : "Onayla ve Gönder"
                ]
              }
            )
          ] })
        ] })
      ] }),
      !showReplyBox && /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
        /* @__PURE__ */ jsxs(
          Button,
          {
            variant: "outline",
            size: "sm",
            onClick: onGenerateSuggestions,
            disabled: isGenerating,
            children: [
              isGenerating ? /* @__PURE__ */ jsx(RefreshCw, { className: "h-4 w-4 animate-spin mr-1" }) : /* @__PURE__ */ jsx(Sparkles, { className: "h-4 w-4 mr-1" }),
              suggestions.length > 0 ? "Yeniden Öner" : "AI Yanıt"
            ]
          }
        ),
        /* @__PURE__ */ jsxs(
          Button,
          {
            variant: "secondary",
            size: "sm",
            onClick: () => setShowReplyBox(true),
            children: [
              /* @__PURE__ */ jsx(MessageSquare, { className: "h-4 w-4 mr-1" }),
              "Elle Yaz"
            ]
          }
        )
      ] })
    ] })
  ] }) });
}
function TikTokInbox() {
  var _a;
  const { connection, loading: connectionLoading } = useTikTokConnection();
  const socialConnectionId = (connection == null ? void 0 : connection.id) || null;
  const { videos, loading: videosLoading, fetchVideos, setVideos } = useTikTokVideos(socialConnectionId);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const {
    comments,
    loading: commentsLoading,
    fetchComments,
    generateSuggestions,
    sendReply,
    setComments
  } = useTikTokComments(socialConnectionId, (selectedVideo == null ? void 0 : selectedVideo.id) || null);
  const {
    isDemoMode,
    toggleDemoMode,
    loadSampleComments,
    isLoadingSamples,
    loadDemoVideo,
    isLoadingDemoVideo,
    simulateSendReply,
    canSimulateSend,
    isSandbox
  } = useTikTokDemoMode(socialConnectionId, (selectedVideo == null ? void 0 : selectedVideo.id) || null);
  const [generatingFor, setGeneratingFor] = useState(null);
  const [sendingFor, setSendingFor] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");
  useEffect(() => {
    if (socialConnectionId) {
      fetchVideos(false);
    }
  }, [socialConnectionId, fetchVideos]);
  useEffect(() => {
    if (selectedVideo) {
      fetchComments(false);
    }
  }, [selectedVideo, fetchComments]);
  const handleGenerateSuggestions = async (commentId) => {
    setGeneratingFor(commentId);
    try {
      await generateSuggestions(commentId);
    } finally {
      setGeneratingFor(null);
    }
  };
  const handleSendReply = async (commentId, text) => {
    setSendingFor(commentId);
    try {
      await sendReply(commentId, text);
    } finally {
      setSendingFor(null);
    }
  };
  const handleSimulateSend = async (commentId, text) => {
    setSendingFor(commentId);
    try {
      await simulateSendReply(commentId, text, (reply) => {
        setComments((prev) => prev.map(
          (c) => c.id === commentId ? {
            ...c,
            status: "sent",
            replies: [...c.replies || [], reply]
          } : c
        ));
      });
    } finally {
      setSendingFor(null);
    }
  };
  const handleLoadSampleComments = async () => {
    if (!selectedVideo) return;
    const newComments = await loadSampleComments(
      selectedVideo.tiktok_video_id,
      selectedVideo.id
    );
    if (newComments.length > 0) {
      setComments((prev) => [...newComments, ...prev]);
    }
  };
  const filteredComments = statusFilter === "all" ? comments : comments.filter((c) => c.status === statusFilter);
  if (connectionLoading) {
    return /* @__PURE__ */ jsx("div", { className: "flex items-center justify-center h-[60vh]", children: /* @__PURE__ */ jsx("div", { className: "h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" }) });
  }
  if (!socialConnectionId) {
    return /* @__PURE__ */ jsx("div", { className: "flex items-center justify-center h-[60vh]", children: /* @__PURE__ */ jsxs(Card, { className: "max-w-md", children: [
      /* @__PURE__ */ jsxs(CardHeader, { className: "text-center", children: [
        /* @__PURE__ */ jsx(CardTitle, { children: "TikTok Bağlantısı Gerekli" }),
        /* @__PURE__ */ jsx(CardDescription, { children: "TikTok yorumlarını görmek için önce TikTok hesabınızı bağlamanız gerekiyor." })
      ] }),
      /* @__PURE__ */ jsx(CardContent, { className: "flex justify-center", children: /* @__PURE__ */ jsx(Button, { asChild: true, children: /* @__PURE__ */ jsx(Link, { to: "/channels/tiktok", children: "TikTok Bağla" }) }) })
    ] }) });
  }
  return /* @__PURE__ */ jsxs("div", { className: "h-[calc(100vh-4rem)]", children: [
    /* @__PURE__ */ jsx(TikTokSandboxBanner, { isDemoMode }),
    /* @__PURE__ */ jsx(TikTokComplianceCard, {}),
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-4 px-1", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h1", { className: "text-2xl font-bold", children: "TikTok Inbox" }),
        /* @__PURE__ */ jsx("p", { className: "text-muted-foreground", children: "Video yorumlarını yönetin ve AI ile yanıtlayın" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsx(TikTokDemoModeToggle, { isDemoMode, onToggle: toggleDemoMode }),
        /* @__PURE__ */ jsxs(
          Button,
          {
            variant: "outline",
            onClick: () => selectedVideo ? fetchComments(true) : fetchVideos(true),
            disabled: videosLoading || commentsLoading,
            children: [
              (videosLoading || commentsLoading) && /* @__PURE__ */ jsx(RefreshCw, { className: "h-4 w-4 animate-spin mr-2" }),
              selectedVideo ? "Yorumları Yenile" : "Videoları Yenile"
            ]
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-12 gap-4 h-[calc(100%-8rem)]", children: [
      /* @__PURE__ */ jsxs("div", { className: "col-span-4 border rounded-lg bg-card", children: [
        /* @__PURE__ */ jsx("div", { className: "p-3 border-b", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsx("h2", { className: "font-semibold", children: "Videolar" }),
          /* @__PURE__ */ jsx(
            Button,
            {
              variant: "ghost",
              size: "sm",
              onClick: () => fetchVideos(true),
              disabled: videosLoading,
              children: /* @__PURE__ */ jsx(RefreshCw, { className: cn("h-4 w-4", videosLoading && "animate-spin") })
            }
          )
        ] }) }),
        /* @__PURE__ */ jsx(ScrollArea, { className: "h-[calc(100%-3.5rem)]", children: /* @__PURE__ */ jsx("div", { className: "p-2 space-y-2", children: videosLoading ? Array.from({ length: 3 }).map((_, i) => /* @__PURE__ */ jsxs("div", { className: "p-3 space-y-2", children: [
          /* @__PURE__ */ jsx(Skeleton, { className: "h-24 w-16" }),
          /* @__PURE__ */ jsx(Skeleton, { className: "h-4 w-full" }),
          /* @__PURE__ */ jsx(Skeleton, { className: "h-3 w-2/3" })
        ] }, i)) : videos.length === 0 ? /* @__PURE__ */ jsxs("div", { className: "p-6 text-center text-muted-foreground", children: [
          /* @__PURE__ */ jsx(Video, { className: "h-12 w-12 mx-auto mb-2 opacity-50" }),
          /* @__PURE__ */ jsx("p", { className: "mb-2", children: "Henüz video yok" }),
          isSandbox && /* @__PURE__ */ jsx("p", { className: "text-xs mb-3", children: "Sandbox modunda TikTok API boş video listesi döndürebilir." }),
          /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-2 items-center", children: [
            /* @__PURE__ */ jsxs(
              Button,
              {
                variant: "outline",
                size: "sm",
                onClick: () => fetchVideos(true),
                children: [
                  /* @__PURE__ */ jsx(RefreshCw, { className: "h-4 w-4 mr-1" }),
                  "TikTok'tan Al"
                ]
              }
            ),
            isSandbox && isDemoMode && /* @__PURE__ */ jsxs(
              Button,
              {
                variant: "outline",
                size: "sm",
                onClick: async () => {
                  const video = await loadDemoVideo();
                  if (video) {
                    setVideos((prev) => [video, ...prev]);
                    setSelectedVideo(video);
                  }
                },
                disabled: isLoadingDemoVideo,
                className: "text-yellow-700 border-yellow-500 hover:bg-yellow-50",
                children: [
                  isLoadingDemoVideo ? /* @__PURE__ */ jsx(RefreshCw, { className: "h-4 w-4 animate-spin mr-1" }) : /* @__PURE__ */ jsx(Download, { className: "h-4 w-4 mr-1" }),
                  "Demo Video Yükle"
                ]
              }
            )
          ] })
        ] }) : videos.map((video) => /* @__PURE__ */ jsx(
          VideoCard,
          {
            video,
            isSelected: (selectedVideo == null ? void 0 : selectedVideo.id) === video.id,
            onClick: () => setSelectedVideo(video)
          },
          video.id
        )) }) })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "col-span-8 border rounded-lg bg-card", children: selectedVideo ? /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsxs("div", { className: "p-3 border-b", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-2", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsx(
                Button,
                {
                  variant: "ghost",
                  size: "sm",
                  onClick: () => setSelectedVideo(null),
                  children: "← Geri"
                }
              ),
              /* @__PURE__ */ jsx("h2", { className: "font-semibold line-clamp-1", children: selectedVideo.caption || "Video Yorumları" })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
              isDemoMode && /* @__PURE__ */ jsxs(
                Button,
                {
                  variant: "outline",
                  size: "sm",
                  onClick: handleLoadSampleComments,
                  disabled: isLoadingSamples,
                  className: "text-yellow-700 border-yellow-500 hover:bg-yellow-50",
                  children: [
                    isLoadingSamples ? /* @__PURE__ */ jsx(RefreshCw, { className: "h-4 w-4 animate-spin mr-1" }) : /* @__PURE__ */ jsx(Download, { className: "h-4 w-4 mr-1" }),
                    "Demo Yorumları Yükle"
                  ]
                }
              ),
              /* @__PURE__ */ jsx(
                Button,
                {
                  variant: "ghost",
                  size: "sm",
                  onClick: () => fetchComments(true),
                  disabled: commentsLoading,
                  children: /* @__PURE__ */ jsx(RefreshCw, { className: cn("h-4 w-4", commentsLoading && "animate-spin") })
                }
              )
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex gap-2 flex-wrap", children: [
            /* @__PURE__ */ jsxs(
              Button,
              {
                variant: statusFilter === "all" ? "default" : "outline",
                size: "sm",
                onClick: () => setStatusFilter("all"),
                children: [
                  "Tümü (",
                  comments.length,
                  ")"
                ]
              }
            ),
            Object.entries(statusConfig).map(([key, config]) => {
              const count = comments.filter((c) => c.status === key).length;
              if (count === 0) return null;
              return /* @__PURE__ */ jsxs(
                Button,
                {
                  variant: statusFilter === key ? "default" : "outline",
                  size: "sm",
                  onClick: () => setStatusFilter(key),
                  className: "gap-1",
                  children: [
                    config.icon,
                    config.label,
                    " (",
                    count,
                    ")"
                  ]
                },
                key
              );
            })
          ] })
        ] }),
        /* @__PURE__ */ jsx(ScrollArea, { className: "h-[calc(100%-7rem)]", children: /* @__PURE__ */ jsx("div", { className: "p-3", children: commentsLoading ? Array.from({ length: 3 }).map((_, i) => /* @__PURE__ */ jsx(Card, { className: "mb-3", children: /* @__PURE__ */ jsx(CardContent, { className: "p-4 space-y-3", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsx(Skeleton, { className: "h-8 w-8 rounded-full" }),
          /* @__PURE__ */ jsxs("div", { className: "flex-1", children: [
            /* @__PURE__ */ jsx(Skeleton, { className: "h-4 w-24 mb-1" }),
            /* @__PURE__ */ jsx(Skeleton, { className: "h-4 w-full" })
          ] })
        ] }) }) }, i)) : filteredComments.length === 0 ? /* @__PURE__ */ jsxs("div", { className: "p-6 text-center text-muted-foreground", children: [
          /* @__PURE__ */ jsx(MessageSquare, { className: "h-12 w-12 mx-auto mb-2 opacity-50" }),
          /* @__PURE__ */ jsx("p", { className: "mb-2", children: statusFilter === "all" ? "Bu videoda yorum yok" : `"${(_a = statusConfig[statusFilter]) == null ? void 0 : _a.label}" durumunda yorum yok` }),
          isSandbox && isDemoMode && statusFilter === "all" && /* @__PURE__ */ jsxs(
            Button,
            {
              variant: "outline",
              size: "sm",
              onClick: handleLoadSampleComments,
              disabled: isLoadingSamples,
              className: "mt-2",
              children: [
                isLoadingSamples ? /* @__PURE__ */ jsx(RefreshCw, { className: "h-4 w-4 animate-spin mr-1" }) : /* @__PURE__ */ jsx(Download, { className: "h-4 w-4 mr-1" }),
                "Demo Yorumları Yükle"
              ]
            }
          ),
          statusFilter !== "all" && /* @__PURE__ */ jsx(
            Button,
            {
              variant: "link",
              size: "sm",
              onClick: () => setStatusFilter("all"),
              children: "Tümünü Göster"
            }
          )
        ] }) : filteredComments.map((comment) => /* @__PURE__ */ jsx(
          CommentCard,
          {
            comment,
            onGenerateSuggestions: () => handleGenerateSuggestions(comment.id),
            onSendReply: (text) => handleSendReply(comment.id, text),
            onSimulateSend: (text) => handleSimulateSend(comment.id, text),
            isGenerating: generatingFor === comment.id,
            isSending: sendingFor === comment.id,
            isDemoMode,
            canSimulateSend,
            isSandbox
          },
          comment.id
        )) }) })
      ] }) : /* @__PURE__ */ jsx("div", { className: "flex items-center justify-center h-full", children: /* @__PURE__ */ jsxs("div", { className: "text-center text-muted-foreground", children: [
        /* @__PURE__ */ jsx(Video, { className: "h-16 w-16 mx-auto mb-4 opacity-50" }),
        /* @__PURE__ */ jsx("p", { className: "text-lg font-medium mb-1", children: "Video Seçin" }),
        /* @__PURE__ */ jsx("p", { className: "text-sm", children: "Yorumları görmek için soldaki listeden bir video seçin" })
      ] }) }) })
    ] })
  ] });
}
export {
  TikTokInbox as default
};
