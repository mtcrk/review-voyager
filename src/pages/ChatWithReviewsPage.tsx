import { useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  MessageSquare,
  Send,
  Loader2,
  Sparkles,
  Bot,
  User,
  Brain,
  Plus,
  Trash2,
  History,
  ChevronLeft,
} from "lucide-react";
import { useBusiness } from "@/contexts/BusinessContext";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import { useChatHistory } from "@/hooks/useChatHistory";

const SUGGESTED_QUESTIONS = [
  "Son 30 gündeki negatif yorumların ortak sorunu ne?",
  "En çok hangi konularda övgü alıyoruz?",
  "Yanıt bekleyen kritik yorumlar hangileri?",
  "Müşteri memnuniyetini artırmak için önerilerin neler?",
  "Rakiplerimize göre güçlü ve zayıf yönlerimiz neler?",
  "Bu haftaki yorum trendleri nasıl?",
];

export default function ChatWithReviewsPage() {
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
    newChat,
  } = useChatHistory(activeBusiness?.id);

  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [historyPanelOpen, setHistoryPanelOpen] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const streamChat = async (userMessage: string, conversationId: string) => {
    if (!activeBusiness?.id) return;

    const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat-with-reviews`;

    const resp = await fetch(CHAT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
      },
      body: JSON.stringify({
        message: userMessage,
        businessId: activeBusiness.id,
      }),
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

      let newlineIndex: number;
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
          const content = parsed.choices?.[0]?.delta?.content;
          if (content) {
            assistantContent += content;
            setMessages((prev) => {
              const last = prev[prev.length - 1];
              if (last?.role === "assistant") {
                return prev.map((m, i) =>
                  i === prev.length - 1 ? { ...m, content: assistantContent } : m
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

  const handleSend = async (messageToSend?: string) => {
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
      inputRef.current?.focus();
    }
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

  return (
    <div className="flex h-[calc(100vh-3.5rem)] overflow-hidden md:h-screen">
      <aside
        className={`${showSidebar ? "translate-x-0" : "-translate-x-full"} fixed inset-y-0 left-0 z-30 h-full w-[320px] max-w-[85vw] overflow-hidden border-r bg-background transition-transform duration-200 md:relative md:inset-auto md:z-0 md:max-w-none md:translate-x-0 ${
          historyPanelOpen ? "md:w-80 md:opacity-100" : "md:w-0 md:border-r-0 md:opacity-0 md:pointer-events-none"
        }`}
      >
        <div className="flex h-full w-[320px] max-w-[85vw] flex-col bg-background md:w-full md:max-w-none">
          <div className="flex items-center justify-between border-b p-3">
            <h3 className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <History className="h-4 w-4" />
              Sohbet Geçmişi
            </h3>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => {
                  newChat();
                  setShowSidebar(false);
                }}
              >
                <Plus className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="hidden h-8 w-8 md:inline-flex"
                onClick={() => setHistoryPanelOpen(false)}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <ScrollArea className="flex-1">
            <div className="space-y-1 p-2">
              {conversations.length === 0 && (
                <p className="py-4 text-center text-xs text-muted-foreground">Henüz sohbet yok</p>
              )}

              {conversations.map((conv) => (
                <div
                  key={conv.id}
                  className={`grid w-full grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors ${
                    activeConversationId === conv.id
                      ? "bg-accent text-accent-foreground"
                      : "hover:bg-muted"
                  }`}
                >
                  <button
                    type="button"
                    className="contents"
                    onClick={() => {
                      loadMessages(conv.id);
                      setShowSidebar(false);
                    }}
                  >
                    <MessageSquare className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                    <span className="block min-w-0 truncate text-left">{conv.title}</span>
                  </button>

                  <button
                    type="button"
                    aria-label="Sohbeti sil"
                    title="Sohbeti sil"
                    className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md border border-border bg-background text-destructive transition-colors hover:bg-destructive/10"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteConversation(conv.id);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      </aside>

      {showSidebar && (
        <div
          className="fixed inset-0 z-20 bg-black/30 md:hidden"
          onClick={() => setShowSidebar(false)}
        />
      )}

      <div className="flex min-w-0 flex-1 flex-col transition-all duration-200">
        <div className="border-b bg-background px-4 pb-3 pt-4 md:px-8 md:pb-4 md:pt-6">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 md:hidden"
              onClick={() => setShowSidebar(true)}
            >
              <History className="h-5 w-5" />
            </Button>

            <Button
              variant="outline"
              size="sm"
              className="hidden gap-2 md:inline-flex"
              onClick={() => setHistoryPanelOpen((prev) => !prev)}
            >
              <ChevronLeft
                className={`h-4 w-4 transition-transform duration-200 ${
                  historyPanelOpen ? "rotate-0" : "rotate-180"
                }`}
              />
              {historyPanelOpen ? "Geçmişi Gizle" : "Geçmişi Göster"}
            </Button>

            <div className="rounded-xl bg-primary/10 p-2.5">
              <Brain className="h-6 w-6 text-primary" />
            </div>

            <div className="min-w-0 flex-1">
              <h1 className="text-lg font-semibold text-foreground md:text-2xl">Yorumlarla Sohbet</h1>
              <p className="truncate text-sm text-muted-foreground">
                {activeBusiness.name} — AI'a yorumlarınız hakkında her şeyi sorun
              </p>
            </div>

            <Button variant="outline" size="sm" onClick={newChat} className="hidden gap-1.5 sm:flex">
              <Plus className="h-4 w-4" />
              Yeni Sohbet
            </Button>
          </div>
        </div>

        <div className="flex flex-1 flex-col overflow-hidden">
          {loadingHistory ? (
            <div className="flex flex-1 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center p-4 md:p-8">
              <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10">
                <Sparkles className="h-10 w-10 text-primary" />
              </div>
              <h2 className="mb-2 text-xl font-medium text-foreground">Yorumlarınız hakkında soru sorun</h2>
              <p className="mb-8 max-w-md text-center text-muted-foreground">
                AI, tüm yorumlarınızı analiz ederek sorularınıza detaylı yanıtlar verir.
                Trendler, müşteri duyguları, iyileştirme önerileri ve daha fazlası.
              </p>
              <div className="grid w-full max-w-2xl grid-cols-1 gap-3 sm:grid-cols-2">
                {SUGGESTED_QUESTIONS.map((question, i) => (
                  <Button
                    key={i}
                    variant="outline"
                    className="h-auto justify-start px-4 py-3 text-left text-sm transition-colors hover:bg-accent/50"
                    onClick={() => handleSend(question)}
                    disabled={isLoading}
                  >
                    <MessageSquare className="mr-2 h-4 w-4 flex-shrink-0 text-primary" />
                    <span className="line-clamp-2">{question}</span>
                  </Button>
                ))}
              </div>
            </div>
          ) : (
            <ScrollArea className="flex-1 px-4 py-4 md:px-8 md:py-6" ref={scrollRef}>
              <div className="mx-auto max-w-3xl space-y-6">
                {messages.map((msg, i) => (
                  <div
                    key={i}
                    className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    {msg.role === "assistant" && (
                      <div className="mt-1 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-primary/10">
                        <Bot className="h-5 w-5 text-primary" />
                      </div>
                    )}
                    <div
                      className={`max-w-[75%] rounded-2xl px-5 py-3 ${
                        msg.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted"
                      }`}
                    >
                      {msg.role === "assistant" ? (
                        <div className="prose prose-sm max-w-none dark:prose-invert">
                          <ReactMarkdown>{msg.content}</ReactMarkdown>
                        </div>
                      ) : (
                        <p className="text-sm">{msg.content}</p>
                      )}
                    </div>
                    {msg.role === "user" && (
                      <div className="mt-1 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-primary">
                        <User className="h-5 w-5 text-primary-foreground" />
                      </div>
                    )}
                  </div>
                ))}
                {isLoading && messages[messages.length - 1]?.role === "user" && (
                  <div className="flex justify-start gap-3">
                    <div className="mt-1 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-primary/10">
                      <Bot className="h-5 w-5 text-primary" />
                    </div>
                    <div className="rounded-2xl bg-muted px-5 py-3">
                      <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
          )}

          <div className="border-t bg-background px-4 py-3 md:px-8 md:py-4">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="mx-auto flex max-w-3xl gap-3"
            >
              <Input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Yorumlarınız hakkında bir soru sorun..."
                disabled={isLoading}
                className="h-12 flex-1 text-base"
              />
              <Button
                type="submit"
                size="lg"
                disabled={!input.trim() || isLoading}
                className="h-12 px-6"
              >
                {isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Send className="h-5 w-5" />
                )}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
