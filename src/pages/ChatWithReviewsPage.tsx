import { useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageSquare, Send, Loader2, Sparkles, Bot, User, Brain } from "lucide-react";
import { useBusiness } from "@/contexts/BusinessContext";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";

interface Message {
  role: "user" | "assistant";
  content: string;
}

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
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const streamChat = async (userMessage: string) => {
    if (!activeBusiness?.id) {
      toast.error("Lütfen önce bir işletme seçin");
      return;
    }

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
  };

  const handleSend = async (messageToSend?: string) => {
    const userMessage = messageToSend || input.trim();
    if (!userMessage || isLoading) return;

    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);

    try {
      await streamChat(userMessage);
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
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      {/* Header */}
      <div className="px-8 pt-6 pb-4 border-b bg-background">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-primary/10">
            <Brain className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Yorumlarla Sohbet</h1>
            <p className="text-sm text-muted-foreground">
              {activeBusiness.name} — AI'a yorumlarınız hakkında her şeyi sorun
            </p>
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {messages.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8">
            <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
              <Sparkles className="w-10 h-10 text-primary" />
            </div>
            <h2 className="text-xl font-medium text-foreground mb-2">
              Yorumlarınız hakkında soru sorun
            </h2>
            <p className="text-muted-foreground text-center mb-8 max-w-md">
              AI, tüm yorumlarınızı analiz ederek sorularınıza detaylı yanıtlar verir.
              Trendler, müşteri duyguları, iyileştirme önerileri ve daha fazlası.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-2xl">
              {SUGGESTED_QUESTIONS.map((question, i) => (
                <Button
                  key={i}
                  variant="outline"
                  className="text-left h-auto py-3 px-4 text-sm justify-start hover:bg-accent/50 transition-colors"
                  onClick={() => handleSend(question)}
                  disabled={isLoading}
                >
                  <MessageSquare className="h-4 w-4 mr-2 flex-shrink-0 text-primary" />
                  <span className="line-clamp-2">{question}</span>
                </Button>
              ))}
            </div>
          </div>
        ) : (
          <ScrollArea className="flex-1 px-8 py-6" ref={scrollRef}>
            <div className="max-w-3xl mx-auto space-y-6">
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  {msg.role === "assistant" && (
                    <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1">
                      <Bot className="w-5 h-5 text-primary" />
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
                      <div className="prose prose-sm dark:prose-invert max-w-none">
                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                      </div>
                    ) : (
                      <p className="text-sm">{msg.content}</p>
                    )}
                  </div>
                  {msg.role === "user" && (
                    <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center flex-shrink-0 mt-1">
                      <User className="w-5 h-5 text-primary-foreground" />
                    </div>
                  )}
                </div>
              ))}
              {isLoading && messages[messages.length - 1]?.role === "user" && (
                <div className="flex gap-3 justify-start">
                  <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1">
                    <Bot className="w-5 h-5 text-primary" />
                  </div>
                  <div className="bg-muted rounded-2xl px-5 py-3">
                    <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
        )}

        {/* Input Bar */}
        <div className="px-8 py-4 border-t bg-background">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="max-w-3xl mx-auto flex gap-3"
          >
            <Input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Yorumlarınız hakkında bir soru sorun..."
              disabled={isLoading}
              className="flex-1 h-12 text-base"
            />
            <Button
              type="submit"
              size="lg"
              disabled={!input.trim() || isLoading}
              className="h-12 px-6"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
