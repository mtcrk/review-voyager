import { jsx, jsxs } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Star, Loader2 } from "lucide-react";
import { s as supabase, B as Button, m as Badge } from "../main.mjs";
import { C as Card, a as CardHeader, e as CardTitle, c as CardContent } from "./card-vx9BCW0t.js";
import { T as Textarea } from "./textarea-BbAnJDWe.js";
import { toast } from "sonner";
import { useQueryClient, useQuery, useMutation } from "@tanstack/react-query";
import "vite-react-ssg";
import "@radix-ui/react-toast";
import "class-variance-authority";
import "clsx";
import "tailwind-merge";
import "next-themes";
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
const toneMap = {
  Friendly: "friendly",
  Professional: "empathetic",
  Formal: "formal"
};
const ReviewDetailPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const queryClient = useQueryClient();
  const [selectedTone, setSelectedTone] = useState("Friendly");
  const [aiReply, setAiReply] = useState("");
  const { data: review, isLoading } = useQuery({
    queryKey: ["review", id],
    queryFn: async () => {
      if (!id) throw new Error("No review ID");
      const { data, error } = await supabase.from("reviews").select("*, businesses(*)").eq("id", id).maybeSingle();
      if (error) throw error;
      if (!data) throw new Error("Review not found");
      return data;
    },
    enabled: !!id
  });
  useEffect(() => {
    if (review == null ? void 0 : review.approved_reply) {
      setAiReply(review.approved_reply);
    } else if (review == null ? void 0 : review.suggested_reply) {
      setAiReply(review.suggested_reply);
    } else if (review && !review.suggested_reply && !review.approved_reply) {
      regenerateMutation.mutate();
    }
  }, [review == null ? void 0 : review.id]);
  const approveMutation = useMutation({
    mutationFn: async () => {
      if (!id) throw new Error("No review ID");
      const { error } = await supabase.from("reviews").update({ status: "approved" }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["review", id] });
      queryClient.invalidateQueries({ queryKey: ["reviews"] });
      toast.success("Review marked as approved!");
    },
    onError: () => {
      toast.error("Failed to approve review");
    }
  });
  const sendMutation = useMutation({
    mutationFn: async () => {
      var _a, _b;
      if (!id || !aiReply) throw new Error("Missing data");
      const biz = review;
      const canSendViaAPI = (biz == null ? void 0 : biz.platform) === "google" && (biz == null ? void 0 : biz.google_review_name) && ((_a = biz == null ? void 0 : biz.businesses) == null ? void 0 : _a.google_connected);
      if (canSendViaAPI) {
        const { data: userData } = await supabase.auth.getUser();
        const { data, error } = await supabase.functions.invoke("approve-reply", {
          body: {
            reviewId: id,
            approvedReply: aiReply,
            sendToGoogle: true,
            userId: (_b = userData == null ? void 0 : userData.user) == null ? void 0 : _b.id
          }
        });
        if (error) throw error;
        if (data == null ? void 0 : data.error) throw new Error(data.error);
        return data;
      } else {
        await navigator.clipboard.writeText(aiReply);
        const { error } = await supabase.from("reviews").update({
          status: "replied",
          approved_reply: aiReply,
          replied_at: (/* @__PURE__ */ new Date()).toISOString()
        }).eq("id", id);
        if (error) throw error;
        return { copied: true };
      }
    },
    onSuccess: (data) => {
      var _a;
      queryClient.invalidateQueries({ queryKey: ["review", id] });
      queryClient.invalidateQueries({ queryKey: ["reviews"] });
      if ((data == null ? void 0 : data.googleStatus) === "sent") {
        toast.success("Yanıt Google'a başarıyla gönderildi! ✅");
      } else if ((data == null ? void 0 : data.googleStatus) === "failed") {
        toast.error("Yanıt onaylandı ama Google'a gönderilemedi. Hata: " + (((_a = data == null ? void 0 : data.review) == null ? void 0 : _a.google_reply_error_message) || "Bilinmeyen hata"));
      } else if (data == null ? void 0 : data.copied) {
        toast.success("Yanıt panoya kopyalandı. Platforma yapıştırın.");
      } else {
        toast.success("Yanıt onaylandı!");
      }
      setTimeout(() => navigate("/reviews"), 1500);
    },
    onError: () => {
      toast.error("Yanıt gönderilemedi");
    }
  });
  const getSentimentColor = (sentiment) => {
    switch (sentiment == null ? void 0 : sentiment.toLowerCase()) {
      case "positive":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "negative":
        return "bg-rose-50 text-rose-700 border-rose-200";
      default:
        return "bg-amber-50 text-amber-700 border-amber-200";
    }
  };
  const getStatusColor = (status) => {
    switch (status) {
      case "approved":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "replied":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      default:
        return "bg-amber-50 text-amber-700 border-amber-200";
    }
  };
  const handleMarkAsApproved = () => {
    approveMutation.mutate();
  };
  const handleSendToGoogle = () => {
    sendMutation.mutate();
  };
  const regenerateMutation = useMutation({
    mutationFn: async () => {
      if (!review) throw new Error("No review");
      const { data, error } = await supabase.functions.invoke("generate-reply", {
        body: {
          review_text: review.text,
          reviewer_name: review.reviewer_name,
          rating: review.rating,
          tone: toneMap[selectedTone],
          language: "auto",
          summary: review.summary,
          issues: review.issues,
          praises: review.praises,
          sentiment: review.sentiment
        }
      });
      if (error) throw error;
      if (data == null ? void 0 : data.error) throw new Error(data.error);
      const reply = data.reply;
      await supabase.from("reviews").update({ suggested_reply: reply }).eq("id", review.id);
      return reply;
    },
    onSuccess: (reply) => {
      setAiReply(reply);
      queryClient.invalidateQueries({ queryKey: ["review", id] });
      toast.success("Yanıt üretildi!");
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Yanıt üretilemedi");
    }
  });
  const handleRegenerateReply = () => {
    regenerateMutation.mutate();
  };
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric"
    });
  };
  if (isLoading) {
    return /* @__PURE__ */ jsx("div", { className: "flex items-center justify-center min-h-screen", children: /* @__PURE__ */ jsx("div", { className: "animate-spin rounded-full h-8 w-8 border-b-2 border-primary" }) });
  }
  if (!review) {
    return /* @__PURE__ */ jsx("div", { className: "flex items-center justify-center min-h-screen", children: /* @__PURE__ */ jsxs(Card, { className: "p-8 text-center", children: [
      /* @__PURE__ */ jsx("p", { className: "text-muted-foreground", children: "Review not found" }),
      /* @__PURE__ */ jsx(Button, { onClick: () => navigate("/reviews"), className: "mt-4", children: "Back to Reviews" })
    ] }) });
  }
  return /* @__PURE__ */ jsxs("div", { className: "min-h-screen bg-background flex flex-col", children: [
    /* @__PURE__ */ jsx("div", { className: "sticky top-0 z-10 border-b bg-background/95 backdrop-blur-sm h-16", children: /* @__PURE__ */ jsxs("div", { className: "container mx-auto max-w-[720px] px-6 h-full flex items-center justify-between", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4", children: [
        /* @__PURE__ */ jsx(
          Button,
          {
            variant: "ghost",
            size: "sm",
            onClick: () => navigate("/reviews"),
            className: "gap-2",
            children: /* @__PURE__ */ jsx(ArrowLeft, { className: "h-4 w-4" })
          }
        ),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsx("span", { className: "font-semibold text-base", children: review.reviewer_name }),
          /* @__PURE__ */ jsx("div", { className: "flex gap-1", children: [...Array(5)].map((_, i) => /* @__PURE__ */ jsx(
            Star,
            {
              className: `h-4 w-4 ${i < review.rating ? "fill-primary text-primary" : "fill-muted text-muted"}`
            },
            i
          )) })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
        review.sentiment && /* @__PURE__ */ jsx(Badge, { variant: "outline", className: getSentimentColor(review.sentiment), children: review.sentiment }),
        /* @__PURE__ */ jsx(Badge, { variant: "outline", className: getStatusColor(review.status), children: review.status === "replied" ? "Replied" : review.status === "approved" ? "Approved" : "Pending" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsx("div", { className: "flex-1 overflow-auto", children: /* @__PURE__ */ jsxs("div", { className: "container mx-auto max-w-[720px] px-6 py-6 space-y-6", children: [
      /* @__PURE__ */ jsxs(Card, { className: "rounded-xl shadow-sm border", children: [
        /* @__PURE__ */ jsx(CardHeader, { children: /* @__PURE__ */ jsx(CardTitle, { className: "text-lg", children: "Original Review" }) }),
        /* @__PURE__ */ jsxs(CardContent, { className: "space-y-4", children: [
          /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between text-sm", children: [
              /* @__PURE__ */ jsx("span", { className: "text-muted-foreground", children: "Reviewer" }),
              /* @__PURE__ */ jsx("span", { className: "font-medium", children: review.reviewer_name })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between text-sm", children: [
              /* @__PURE__ */ jsx("span", { className: "text-muted-foreground", children: "Rating" }),
              /* @__PURE__ */ jsx("div", { className: "flex gap-1", children: [...Array(review.rating)].map((_, i) => /* @__PURE__ */ jsx(Star, { className: "h-4 w-4 fill-primary text-primary" }, i)) })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between text-sm", children: [
              /* @__PURE__ */ jsx("span", { className: "text-muted-foreground", children: "Date" }),
              /* @__PURE__ */ jsx("span", { className: "font-medium", children: formatDate(review.posted_at) })
            ] })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "pt-4 border-t", children: /* @__PURE__ */ jsx("p", { className: "text-sm leading-relaxed text-foreground", children: review.text || "No review text" }) }),
          review.photos && Array.isArray(review.photos) && review.photos.length > 0 && /* @__PURE__ */ jsxs("div", { className: "pt-4 border-t", children: [
            /* @__PURE__ */ jsx("h4", { className: "text-sm font-semibold mb-3", children: "Fotoğraflar" }),
            /* @__PURE__ */ jsx("div", { className: "grid grid-cols-2 sm:grid-cols-3 gap-3", children: review.photos.map((photo, i) => /* @__PURE__ */ jsx(
              "a",
              {
                href: photo.url,
                target: "_blank",
                rel: "noopener noreferrer",
                className: "relative aspect-square rounded-lg overflow-hidden border hover:opacity-90 transition-opacity",
                children: /* @__PURE__ */ jsx(
                  "img",
                  {
                    src: photo.thumbnail || photo.url,
                    alt: `Review photo ${i + 1}`,
                    className: "w-full h-full object-cover",
                    loading: "lazy"
                  }
                )
              },
              i
            )) })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs(Card, { className: "rounded-xl shadow-sm border", children: [
        /* @__PURE__ */ jsx(CardHeader, { children: /* @__PURE__ */ jsx(CardTitle, { className: "text-lg", children: "AI Insights" }) }),
        /* @__PURE__ */ jsxs(CardContent, { className: "space-y-4", children: [
          review.summary && /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("h4", { className: "text-sm font-semibold mb-2", children: "Summary" }),
            /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground leading-relaxed", children: review.summary })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [
            review.praises && Array.isArray(review.praises) && review.praises.length > 0 && /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("h4", { className: "text-sm font-semibold mb-2", children: "Praises" }),
              /* @__PURE__ */ jsx("div", { className: "flex flex-wrap gap-2", children: review.praises.map((praise, i) => /* @__PURE__ */ jsx(
                Badge,
                {
                  variant: "secondary",
                  className: "bg-emerald-50 text-emerald-700",
                  children: praise
                },
                i
              )) })
            ] }),
            review.issues && Array.isArray(review.issues) && review.issues.length > 0 && /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("h4", { className: "text-sm font-semibold mb-2", children: "Issues" }),
              /* @__PURE__ */ jsx("div", { className: "flex flex-wrap gap-2", children: review.issues.map((issue, i) => /* @__PURE__ */ jsx(
                Badge,
                {
                  variant: "secondary",
                  className: "bg-rose-50 text-rose-700",
                  children: issue
                },
                i
              )) })
            ] })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs(Card, { className: "rounded-xl shadow-sm border", children: [
        /* @__PURE__ */ jsx(CardHeader, { children: /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsx(CardTitle, { className: "text-lg", children: review.approved_reply && (review.status === "replied" || review.status === "approved") ? "Mevcut Yanıt" : "AI Suggested Reply" }),
            review.approved_reply && review.status === "replied" && /* @__PURE__ */ jsx(Badge, { variant: "outline", className: "text-xs text-emerald-600 border-emerald-200 bg-emerald-50", children: "Yanıtlandı" })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsx("div", { className: "flex rounded-lg border bg-muted/30 p-1", children: ["Friendly", "Professional", "Formal"].map((tone) => /* @__PURE__ */ jsx(
              "button",
              {
                onClick: () => setSelectedTone(tone),
                className: `px-3 py-1 text-sm font-medium rounded transition-all ${selectedTone === tone ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`,
                children: tone
              },
              tone
            )) }),
            /* @__PURE__ */ jsxs(
              Button,
              {
                variant: "outline",
                size: "sm",
                onClick: handleRegenerateReply,
                disabled: regenerateMutation.isPending,
                children: [
                  regenerateMutation.isPending && /* @__PURE__ */ jsx(Loader2, { className: "h-4 w-4 animate-spin mr-1" }),
                  regenerateMutation.isPending ? "Üretiliyor..." : "Yeniden Üret"
                ]
              }
            )
          ] })
        ] }) }),
        /* @__PURE__ */ jsx(CardContent, { children: /* @__PURE__ */ jsx(
          Textarea,
          {
            value: aiReply,
            onChange: (e) => setAiReply(e.target.value),
            className: "min-h-[200px] text-sm leading-relaxed resize-none",
            placeholder: "AI suggested reply will appear here..."
          }
        ) })
      ] })
    ] }) }),
    /* @__PURE__ */ jsx("div", { className: "sticky bottom-0 border-t bg-background/95 backdrop-blur-sm py-4", children: /* @__PURE__ */ jsxs("div", { className: "container mx-auto max-w-[720px] px-6 flex items-center justify-between gap-4", children: [
      /* @__PURE__ */ jsx(
        Button,
        {
          variant: "outline",
          onClick: handleMarkAsApproved,
          disabled: approveMutation.isPending || review.status === "approved" || review.status === "replied",
          className: "flex-1",
          children: review.status === "approved" || review.status === "replied" ? "Approved" : "Approve Reply"
        }
      ),
      /* @__PURE__ */ jsx(
        Button,
        {
          onClick: handleSendToGoogle,
          disabled: sendMutation.isPending || !aiReply,
          className: "flex-1",
          children: "Send to Google"
        }
      )
    ] }) })
  ] });
};
export {
  ReviewDetailPage as default
};
