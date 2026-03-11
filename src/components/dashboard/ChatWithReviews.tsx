import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageSquare, Send, Loader2, Sparkles, Bot, User } from "lucide-react";
import { useBusiness } from "@/contexts/BusinessContext";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import { useNavigate } from "react-router-dom";
import { useChatHistory } from "@/hooks/useChatHistory";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const SUGGESTED_QUESTIONS = [
  "Son 30 gündeki negatif yorumların ortak sorunu ne?",
  "En çok hangi konularda övgü alıyoruz?",
  "Yanıt bekleyen kritik yorumlar hangileri?",
  "Müşteri memnuniyetini artırmak için önerilerin neler?",
];

export function ChatWithReviews() {
  const { activeBusiness } = useBusiness();
  const navigate = useNavigate();
  const {
    activeConversationId, messages, setMessages,
    startNewConversation, saveMessage,
  } = useChatHistory(activeBusiness?.id);

  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const streamChat = async (userMessage: string, conversationId: string) => {
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
        businessId: activeBusiness.id 
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
            setMessages(prev => {
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
    setMessages(prev => [...prev, { role: "user", content: userMessage }]);
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
      setMessages(prev => prev.slice(0, -1));
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  return (
    <Card className="shadow-card h-[500px] flex flex-col">
      <CardHeader className="pb-3 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10">
              <MessageSquare className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">Yorumlarınızla Sohbet</CardTitle>
              <p className="text-sm text-muted-foreground">
                AI'a yorumlarınız hakkında sorular sorun
              </p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={() => navigate("/chat")} className="text-xs text-muted-foreground">
            Tüm Sohbetler →
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
        {messages.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-6">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Sparkles className="w-8 h-8 text-primary" />
            </div>
            <p className="text-muted-foreground text-center mb-6">
              Yorumlarınız hakkında sorular sorun
            </p>
            <div className="grid gap-2 w-full max-w-sm">
              {SUGGESTED_QUESTIONS.map((question, i) => (
                <Button
                  key={i}
                  variant="outline"
                  size="sm"
                  className="text-left h-auto py-2 px-3 text-sm justify-start"
                  onClick={() => handleSend(question)}
                  disabled={isLoading}
                >
                  <span className="line-clamp-1">{question}</span>
                </Button>
              ))}
            </div>
          </div>
        ) : (
          <ScrollArea className="flex-1 p-4" ref={scrollRef}>
            <div className="space-y-4">
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  {msg.role === "assistant" && (
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Bot className="w-4 h-4 text-primary" />
                    </div>
                  )}
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-3 ${
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
                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                      <User className="w-4 h-4 text-primary-foreground" />
                    </div>
                  )}
                </div>
              ))}
              {isLoading && messages[messages.length - 1]?.role === "user" && (
                <div className="flex gap-3 justify-start">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Bot className="w-4 h-4 text-primary" />
                  </div>
                  <div className="bg-muted rounded-2xl px-4 py-3">
                    <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
        )}
        
        {/* Input */}
        <div className="p-4 border-t">
          <form 
            onSubmit={(e) => { e.preventDefault(); handleSend(); }}
            className="flex gap-2"
          >
            <Input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Yorumlarınız hakkında bir soru sorun..."
              disabled={isLoading}
              className="flex-1"
            />
            <Button 
              type="submit" 
              size="icon" 
              disabled={!input.trim() || isLoading}
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </form>
        </div>
      </CardContent>
    </Card>
  );
}
