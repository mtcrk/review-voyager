import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageSquare, Send, Loader2, Sparkles, Bot, User, Lock } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const SUGGESTED_QUESTIONS = [
  "Son 30 gündeki negatif yorumların ortak sorunu ne?",
  "En çok hangi konularda övgü alıyoruz?",
  "Müşteri memnuniyetini artırmak için önerilerin neler?",
];

// Demo responses simulating AI analysis
const DEMO_RESPONSES: Record<string, string> = {
  "Son 30 gündeki negatif yorumların ortak sorunu ne?": `## Negatif Yorum Analizi 📊

Son 30 günde **3 ana sorun** tespit edildi:

1. **Bekleme Süresi** (45%) - Müşteriler uzun bekleme sürelerinden şikayet ediyor
2. **İletişim Eksikliği** (30%) - Sipariş takibi konusunda bilgilendirme yetersiz
3. **Ürün Kalitesi** (25%) - Bazı ürünlerde kalite tutarsızlığı

**Öneri:** Bekleme sürelerini azaltmak için operasyonel süreçleri gözden geçirin.`,

  "En çok hangi konularda övgü alıyoruz?": `## Övgü Analizi ⭐

Müşterileriniz en çok şu konularda memnun:

1. **Personel Güler Yüzlülüğü** (52%) - "Çok ilgili ve yardımsever"
2. **Ürün Çeşitliliği** (28%) - "Her zaman aradığımı buluyorum"
3. **Konum/Ulaşım** (20%) - "Merkezi konum, kolay ulaşım"

💡 **AI Önerisi:** Bu güçlü yönlerinizi pazarlama materyallerinizde vurgulayın!`,

  "Müşteri memnuniyetini artırmak için önerilerin neler?": `## AI Önerileri 🚀

**Hemen Uygulanabilir:**
1. Tüm yorumlara 24 saat içinde yanıt verin (+15% memnuniyet)
2. Negatif yorumlara özel çözüm sunun
3. Sadık müşterilere teşekkür mesajı gönderin

**Orta Vadeli:**
- Bekleme süresini %20 azaltın
- SMS ile sipariş takibi bildirimi ekleyin

**AI Visibility Skoru:** Bu adımlarla skorunuz **72 → 85** çıkabilir!`,
};

export function ChatWithReviewsDemo() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [demoUsed, setDemoUsed] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const simulateResponse = async (question: string) => {
    setIsLoading(true);
    
    // Simulate typing delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const response = DEMO_RESPONSES[question] || 
      `Bu soruyu analiz ettim. Gerçek verilerinizle tam analiz için **ücretsiz kayıt olun** ve tüm yorumlarınızı bağlayın.

Demo'da sınırlı özellikler mevcuttur. Tam AI analizi için:
- Tüm yorumlarınızı bağlayın
- Gerçek zamanlı analiz alın
- Sınırsız soru sorun`;

    // Simulate streaming effect
    let currentText = "";
    const words = response.split(" ");
    
    for (let i = 0; i < words.length; i++) {
      currentText += (i === 0 ? "" : " ") + words[i];
      setMessages(prev => {
        const last = prev[prev.length - 1];
        if (last?.role === "assistant") {
          return prev.map((m, idx) => 
            idx === prev.length - 1 ? { ...m, content: currentText } : m
          );
        }
        return [...prev, { role: "assistant", content: currentText }];
      });
      await new Promise(resolve => setTimeout(resolve, 30));
    }
    
    setIsLoading(false);
    setDemoUsed(true);
  };

  const handleSend = async (messageToSend?: string) => {
    const userMessage = messageToSend || input.trim();
    if (!userMessage || isLoading) return;

    if (demoUsed) {
      toast.info("Demo limitine ulaştınız. Devam etmek için kayıt olun.");
      return;
    }

    setInput("");
    setMessages(prev => [...prev, { role: "user", content: userMessage }]);
    
    await simulateResponse(userMessage);
  };

  return (
    <Card className="shadow-lg border-2 border-primary/20 h-[480px] flex flex-col bg-card/80 backdrop-blur">
      <CardHeader className="pb-3 border-b bg-gradient-to-r from-primary/5 to-transparent">
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
          <div className="ml-auto">
            <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-full font-medium">
              Demo
            </span>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
        {messages.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-6">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Sparkles className="w-8 h-8 text-primary" />
            </div>
            <p className="text-muted-foreground text-center mb-6">
              Örnek bir soru seçin
            </p>
            <div className="grid gap-2 w-full max-w-sm">
              {SUGGESTED_QUESTIONS.map((question, i) => (
                <Button
                  key={i}
                  variant="outline"
                  size="sm"
                  className="text-left h-auto py-2 px-3 text-sm justify-start hover:bg-primary/5 hover:border-primary/30"
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
                    className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                      msg.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    }`}
                  >
                    {msg.role === "assistant" ? (
                      <div className="prose prose-sm dark:prose-invert max-w-none text-sm">
                        {msg.content.split('\n').map((line, idx) => (
                          <p key={idx} className="mb-1 last:mb-0">
                            {line.startsWith('##') ? (
                              <strong>{line.replace('##', '').trim()}</strong>
                            ) : line.startsWith('**') ? (
                              <span dangerouslySetInnerHTML={{ __html: line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
                            ) : (
                              line
                            )}
                          </p>
                        ))}
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
        
        {/* CTA or Input */}
        <div className="p-4 border-t">
          {demoUsed ? (
            <Button 
              className="w-full gradient-primary text-white"
              onClick={() => navigate("/register")}
            >
              <Lock className="w-4 h-4 mr-2" />
              Sınırsız Analiz için Ücretsiz Kayıt Ol
            </Button>
          ) : (
            <form 
              onSubmit={(e) => { e.preventDefault(); handleSend(); }}
              className="flex gap-2"
            >
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Bir soru yazın..."
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
          )}
        </div>
      </CardContent>
    </Card>
  );
}
