import { jsx, jsxs } from "react/jsx-runtime";
import { useState, useCallback, useEffect, useRef } from "react";
import { C as Card } from "./card-vx9BCW0t.js";
import { s as supabase, a as useBusiness, B as Button, I as Input } from "../main.mjs";
import { S as ScrollArea } from "./scroll-area-C-y00E-Y.js";
import { History, Plus, ChevronLeft, MessageSquare, Trash2, Brain, Loader2, Sparkles, Bot, User, Send } from "lucide-react";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import "vite-react-ssg";
import "react-router-dom";
import "@radix-ui/react-toast";
import "class-variance-authority";
import "clsx";
import "tailwind-merge";
import "next-themes";
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
function useChatHistory(businessId) {
  const [conversations, setConversations] = useState([]);
  const [activeConversationId, setActiveConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const loadConversations = useCallback(async () => {
    if (!businessId) return;
    const { data } = await supabase.from("chat_conversations").select("*").eq("business_id", businessId).order("updated_at", { ascending: false }).limit(50);
    if (data) setConversations(data);
  }, [businessId]);
  useEffect(() => {
    loadConversations();
  }, [loadConversations]);
  const loadMessages = useCallback(async (conversationId) => {
    setLoadingHistory(true);
    setActiveConversationId(conversationId);
    const { data } = await supabase.from("chat_messages").select("*").eq("conversation_id", conversationId).order("created_at", { ascending: true });
    if (data) {
      setMessages(data.map((m) => ({ id: m.id, role: m.role, content: m.content })));
    }
    setLoadingHistory(false);
  }, []);
  const startNewConversation = useCallback(async (firstMessage) => {
    if (!businessId) return null;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    const title = firstMessage.length > 50 ? firstMessage.slice(0, 50) + "…" : firstMessage;
    const { data, error } = await supabase.from("chat_conversations").insert({ business_id: businessId, user_id: user.id, title }).select().single();
    if (error || !data) return null;
    const conv = data;
    setActiveConversationId(conv.id);
    setConversations((prev) => [conv, ...prev]);
    setMessages([]);
    return conv.id;
  }, [businessId]);
  const saveMessage = useCallback(async (conversationId, role, content) => {
    await supabase.from("chat_messages").insert({ conversation_id: conversationId, role, content });
    await supabase.from("chat_conversations").update({ updated_at: (/* @__PURE__ */ new Date()).toISOString() }).eq("id", conversationId);
  }, []);
  const deleteConversation = useCallback(async (conversationId) => {
    await supabase.from("chat_conversations").delete().eq("id", conversationId);
    setConversations((prev) => prev.filter((c) => c.id !== conversationId));
    if (activeConversationId === conversationId) {
      setActiveConversationId(null);
      setMessages([]);
    }
  }, [activeConversationId]);
  const newChat = useCallback(() => {
    setActiveConversationId(null);
    setMessages([]);
  }, []);
  return {
    conversations,
    activeConversationId,
    messages,
    setMessages,
    loadingHistory,
    loadConversations,
    loadMessages,
    startNewConversation,
    saveMessage,
    deleteConversation,
    newChat
  };
}
const SUGGESTED_QUESTIONS = [
  "Son 30 gündeki negatif yorumların ortak sorunu ne?",
  "En çok hangi konularda övgü alıyoruz?",
  "Yanıt bekleyen kritik yorumlar hangileri?",
  "Müşteri memnuniyetini artırmak için önerilerin neler?",
  "Rakiplerimize göre güçlü ve zayıf yönlerimiz neler?",
  "Bu haftaki yorum trendleri nasıl?"
];
function ChatWithReviewsPage() {
  var _a;
  const { activeBusiness } = useBusiness();
  const {
    conversations,
    activeConversationId,
    messages,
    setMessages,
    loadingHistory,
    loadMessages,
    startNewConversation,
    saveMessage,
    deleteConversation,
    newChat
  } = useChatHistory(activeBusiness == null ? void 0 : activeBusiness.id);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [historyPanelOpen, setHistoryPanelOpen] = useState(true);
  const scrollRef = useRef(null);
  const inputRef = useRef(null);
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);
  const streamChat = async (userMessage, conversationId) => {
    var _a2, _b, _c;
    if (!(activeBusiness == null ? void 0 : activeBusiness.id)) return;
    const CHAT_URL = `${"https://pnpuhewfoxssmbpryart.supabase.co"}/functions/v1/chat-with-reviews`;
    const resp = await fetch(CHAT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBucHVoZXdmb3hzc21icHJ5YXJ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQyNTExNDcsImV4cCI6MjA3OTgyNzE0N30.mF2d8PwkoFTYEGy_gvEcTYSEzEOglmRBUzVbZE1G4PM"}`
      },
      body: JSON.stringify({
        message: userMessage,
        businessId: activeBusiness.id
      })
    });
    if (resp.status === 429) throw new Error("Rate limit aşıldı. Lütfen biraz bekleyin.");
    if (resp.status === 402) throw new Error("Kredi yetersiz. Lütfen kredi ekleyin.");
    if (!resp.ok || !resp.body) throw new Error("Bağlantı hatası");
    const reader = resp.body.getReader();
    const decoder = new TextDecoder();
    let textBuffer = "";
    let assistantContent = "";
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      textBuffer += decoder.decode(value, { stream: true });
      let newlineIndex;
      while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
        let line = textBuffer.slice(0, newlineIndex);
        textBuffer = textBuffer.slice(newlineIndex + 1);
        if (line.endsWith("\r")) line = line.slice(0, -1);
        if (line.startsWith(":") || line.trim() === "") continue;
        if (!line.startsWith("data: ")) continue;
        const jsonStr = line.slice(6).trim();
        if (jsonStr === "[DONE]") break;
        try {
          const parsed = JSON.parse(jsonStr);
          const content = (_c = (_b = (_a2 = parsed.choices) == null ? void 0 : _a2[0]) == null ? void 0 : _b.delta) == null ? void 0 : _c.content;
          if (content) {
            assistantContent += content;
            setMessages((prev) => {
              const last = prev[prev.length - 1];
              if ((last == null ? void 0 : last.role) === "assistant") {
                return prev.map(
                  (m, i) => i === prev.length - 1 ? { ...m, content: assistantContent } : m
                );
              }
              return [...prev, { role: "assistant", content: assistantContent }];
            });
          }
        } catch {
          textBuffer = line + "\n" + textBuffer;
          break;
        }
      }
    }
    if (assistantContent) {
      await saveMessage(conversationId, "assistant", assistantContent);
    }
  };
  const handleSend = async (messageToSend) => {
    var _a2;
    const userMessage = messageToSend || input.trim();
    if (!userMessage || isLoading) return;
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);
    try {
      let convId = activeConversationId;
      if (!convId) {
        convId = await startNewConversation(userMessage);
        if (!convId) throw new Error("Sohbet oluşturulamadı");
      }
      await saveMessage(convId, "user", userMessage);
      await streamChat(userMessage, convId);
    } catch (error) {
      console.error("Chat error:", error);
      toast.error(error instanceof Error ? error.message : "Bir hata oluştu");
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      setIsLoading(false);
      (_a2 = inputRef.current) == null ? void 0 : _a2.focus();
    }
  };
  if (!activeBusiness) {
    return /* @__PURE__ */ jsx("div", { className: "p-8", children: /* @__PURE__ */ jsx(Card, { className: "p-12 text-center", children: /* @__PURE__ */ jsx("p", { className: "text-muted-foreground", children: "İşletme seçilmedi." }) }) });
  }
  return /* @__PURE__ */ jsxs("div", { className: "flex h-[calc(100vh-3.5rem)] overflow-hidden md:h-screen", children: [
    /* @__PURE__ */ jsx(
      "aside",
      {
        className: `${showSidebar ? "translate-x-0" : "-translate-x-full"} fixed inset-y-0 left-0 z-30 h-full w-[320px] max-w-[85vw] overflow-hidden border-r bg-background transition-transform duration-200 md:relative md:inset-auto md:z-0 md:max-w-none md:translate-x-0 ${historyPanelOpen ? "md:w-80 md:opacity-100" : "md:w-0 md:border-r-0 md:opacity-0 md:pointer-events-none"}`,
        children: /* @__PURE__ */ jsxs("div", { className: "flex h-full w-[320px] max-w-[85vw] flex-col bg-background md:w-full md:max-w-none", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between border-b p-3", children: [
            /* @__PURE__ */ jsxs("h3", { className: "flex items-center gap-2 text-sm font-medium text-muted-foreground", children: [
              /* @__PURE__ */ jsx(History, { className: "h-4 w-4" }),
              "Sohbet Geçmişi"
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1", children: [
              /* @__PURE__ */ jsx(
                Button,
                {
                  variant: "ghost",
                  size: "icon",
                  className: "h-8 w-8",
                  onClick: () => {
                    newChat();
                    setShowSidebar(false);
                  },
                  children: /* @__PURE__ */ jsx(Plus, { className: "h-4 w-4" })
                }
              ),
              /* @__PURE__ */ jsx(
                Button,
                {
                  variant: "ghost",
                  size: "icon",
                  className: "hidden h-8 w-8 md:inline-flex",
                  onClick: () => setHistoryPanelOpen(false),
                  children: /* @__PURE__ */ jsx(ChevronLeft, { className: "h-4 w-4" })
                }
              )
            ] })
          ] }),
          /* @__PURE__ */ jsx(ScrollArea, { className: "flex-1", children: /* @__PURE__ */ jsxs("div", { className: "space-y-1 p-2", children: [
            conversations.length === 0 && /* @__PURE__ */ jsx("p", { className: "py-4 text-center text-xs text-muted-foreground", children: "Henüz sohbet yok" }),
            conversations.map((conv) => /* @__PURE__ */ jsxs(
              "div",
              {
                className: `grid w-full grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors ${activeConversationId === conv.id ? "bg-accent text-accent-foreground" : "hover:bg-muted"}`,
                children: [
                  /* @__PURE__ */ jsxs(
                    "button",
                    {
                      type: "button",
                      className: "contents",
                      onClick: () => {
                        loadMessages(conv.id);
                        setShowSidebar(false);
                      },
                      children: [
                        /* @__PURE__ */ jsx(MessageSquare, { className: "h-4 w-4 flex-shrink-0 text-muted-foreground" }),
                        /* @__PURE__ */ jsx("span", { className: "block min-w-0 truncate text-left", children: conv.title })
                      ]
                    }
                  ),
                  /* @__PURE__ */ jsx(
                    "button",
                    {
                      type: "button",
                      "aria-label": "Sohbeti sil",
                      title: "Sohbeti sil",
                      className: "flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md border border-border bg-background text-destructive transition-colors hover:bg-destructive/10",
                      onClick: (e) => {
                        e.stopPropagation();
                        deleteConversation(conv.id);
                      },
                      children: /* @__PURE__ */ jsx(Trash2, { className: "h-4 w-4" })
                    }
                  )
                ]
              },
              conv.id
            ))
          ] }) })
        ] })
      }
    ),
    showSidebar && /* @__PURE__ */ jsx(
      "div",
      {
        className: "fixed inset-0 z-20 bg-black/30 md:hidden",
        onClick: () => setShowSidebar(false)
      }
    ),
    /* @__PURE__ */ jsxs("div", { className: "flex min-w-0 flex-1 flex-col transition-all duration-200", children: [
      /* @__PURE__ */ jsx("div", { className: "border-b bg-background px-4 pb-3 pt-4 md:px-8 md:pb-4 md:pt-6", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsx(
          Button,
          {
            variant: "ghost",
            size: "icon",
            className: "h-9 w-9 md:hidden",
            onClick: () => setShowSidebar(true),
            children: /* @__PURE__ */ jsx(History, { className: "h-5 w-5" })
          }
        ),
        /* @__PURE__ */ jsxs(
          Button,
          {
            variant: "outline",
            size: "sm",
            className: "hidden gap-2 md:inline-flex",
            onClick: () => setHistoryPanelOpen((prev) => !prev),
            children: [
              /* @__PURE__ */ jsx(
                ChevronLeft,
                {
                  className: `h-4 w-4 transition-transform duration-200 ${historyPanelOpen ? "rotate-0" : "rotate-180"}`
                }
              ),
              historyPanelOpen ? "Geçmişi Gizle" : "Geçmişi Göster"
            ]
          }
        ),
        /* @__PURE__ */ jsx("div", { className: "rounded-xl bg-primary/10 p-2.5", children: /* @__PURE__ */ jsx(Brain, { className: "h-6 w-6 text-primary" }) }),
        /* @__PURE__ */ jsxs("div", { className: "min-w-0 flex-1", children: [
          /* @__PURE__ */ jsx("h1", { className: "text-lg font-semibold text-foreground md:text-2xl", children: "Yorumlarla Sohbet" }),
          /* @__PURE__ */ jsxs("p", { className: "truncate text-sm text-muted-foreground", children: [
            activeBusiness.name,
            " — AI'a yorumlarınız hakkında her şeyi sorun"
          ] })
        ] }),
        /* @__PURE__ */ jsxs(Button, { variant: "outline", size: "sm", onClick: newChat, className: "hidden gap-1.5 sm:flex", children: [
          /* @__PURE__ */ jsx(Plus, { className: "h-4 w-4" }),
          "Yeni Sohbet"
        ] })
      ] }) }),
      /* @__PURE__ */ jsxs("div", { className: "flex flex-1 flex-col overflow-hidden", children: [
        loadingHistory ? /* @__PURE__ */ jsx("div", { className: "flex flex-1 items-center justify-center", children: /* @__PURE__ */ jsx(Loader2, { className: "h-8 w-8 animate-spin text-muted-foreground" }) }) : messages.length === 0 ? /* @__PURE__ */ jsxs("div", { className: "flex flex-1 flex-col items-center justify-center p-4 md:p-8", children: [
          /* @__PURE__ */ jsx("div", { className: "mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10", children: /* @__PURE__ */ jsx(Sparkles, { className: "h-10 w-10 text-primary" }) }),
          /* @__PURE__ */ jsx("h2", { className: "mb-2 text-xl font-medium text-foreground", children: "Yorumlarınız hakkında soru sorun" }),
          /* @__PURE__ */ jsx("p", { className: "mb-8 max-w-md text-center text-muted-foreground", children: "AI, tüm yorumlarınızı analiz ederek sorularınıza detaylı yanıtlar verir. Trendler, müşteri duyguları, iyileştirme önerileri ve daha fazlası." }),
          /* @__PURE__ */ jsx("div", { className: "grid w-full max-w-2xl grid-cols-1 gap-3 sm:grid-cols-2", children: SUGGESTED_QUESTIONS.map((question, i) => /* @__PURE__ */ jsxs(
            Button,
            {
              variant: "outline",
              className: "h-auto justify-start px-4 py-3 text-left text-sm transition-colors hover:bg-accent/50",
              onClick: () => handleSend(question),
              disabled: isLoading,
              children: [
                /* @__PURE__ */ jsx(MessageSquare, { className: "mr-2 h-4 w-4 flex-shrink-0 text-primary" }),
                /* @__PURE__ */ jsx("span", { className: "line-clamp-2", children: question })
              ]
            },
            i
          )) })
        ] }) : /* @__PURE__ */ jsx(ScrollArea, { className: "flex-1 px-4 py-4 md:px-8 md:py-6", ref: scrollRef, children: /* @__PURE__ */ jsxs("div", { className: "mx-auto max-w-3xl space-y-6", children: [
          messages.map((msg, i) => /* @__PURE__ */ jsxs(
            "div",
            {
              className: `flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`,
              children: [
                msg.role === "assistant" && /* @__PURE__ */ jsx("div", { className: "mt-1 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-primary/10", children: /* @__PURE__ */ jsx(Bot, { className: "h-5 w-5 text-primary" }) }),
                /* @__PURE__ */ jsx(
                  "div",
                  {
                    className: `max-w-[75%] rounded-2xl px-5 py-3 ${msg.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"}`,
                    children: msg.role === "assistant" ? /* @__PURE__ */ jsx("div", { className: "prose prose-sm max-w-none dark:prose-invert", children: /* @__PURE__ */ jsx(ReactMarkdown, { children: msg.content }) }) : /* @__PURE__ */ jsx("p", { className: "text-sm", children: msg.content })
                  }
                ),
                msg.role === "user" && /* @__PURE__ */ jsx("div", { className: "mt-1 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-primary", children: /* @__PURE__ */ jsx(User, { className: "h-5 w-5 text-primary-foreground" }) })
              ]
            },
            i
          )),
          isLoading && ((_a = messages[messages.length - 1]) == null ? void 0 : _a.role) === "user" && /* @__PURE__ */ jsxs("div", { className: "flex justify-start gap-3", children: [
            /* @__PURE__ */ jsx("div", { className: "mt-1 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-primary/10", children: /* @__PURE__ */ jsx(Bot, { className: "h-5 w-5 text-primary" }) }),
            /* @__PURE__ */ jsx("div", { className: "rounded-2xl bg-muted px-5 py-3", children: /* @__PURE__ */ jsx(Loader2, { className: "h-5 w-5 animate-spin text-muted-foreground" }) })
          ] })
        ] }) }),
        /* @__PURE__ */ jsx("div", { className: "border-t bg-background px-4 py-3 md:px-8 md:py-4", children: /* @__PURE__ */ jsxs(
          "form",
          {
            onSubmit: (e) => {
              e.preventDefault();
              handleSend();
            },
            className: "mx-auto flex max-w-3xl gap-3",
            children: [
              /* @__PURE__ */ jsx(
                Input,
                {
                  ref: inputRef,
                  value: input,
                  onChange: (e) => setInput(e.target.value),
                  placeholder: "Yorumlarınız hakkında bir soru sorun...",
                  disabled: isLoading,
                  className: "h-12 flex-1 text-base"
                }
              ),
              /* @__PURE__ */ jsx(
                Button,
                {
                  type: "submit",
                  size: "lg",
                  disabled: !input.trim() || isLoading,
                  className: "h-12 px-6",
                  children: isLoading ? /* @__PURE__ */ jsx(Loader2, { className: "h-5 w-5 animate-spin" }) : /* @__PURE__ */ jsx(Send, { className: "h-5 w-5" })
                }
              )
            ]
          }
        ) })
      ] })
    ] })
  ] });
}
export {
  ChatWithReviewsPage as default
};
