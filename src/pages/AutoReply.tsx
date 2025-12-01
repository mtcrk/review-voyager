import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Sparkles } from "lucide-react";

export default function AutoReply() {
  const [autoReplyEnabled, setAutoReplyEnabled] = useState(false);
  const [tone, setTone] = useState("friendly");
  const [language, setLanguage] = useState("en");
  const [reviewRule, setReviewRule] = useState("positive");

  const toneOptions = [
    { value: "formal", label: "Resmi", description: "Profesyonel ve iş benzeri" },
    { value: "friendly", label: "Arkadaş Canlısı", description: "Sıcak ve samimi" },
    { value: "playful", label: "Eğlenceli", description: "Eğlenceli ve rahat" },
  ];

  const previewReplies = {
    formal: "Yorumunuz için teşekkür ederiz. Geri bildiriminizi takdir ediyoruz ve beklentilerinizi karşılamaktan memnuniyet duyuyoruz. Gelecekte sizlere tekrar hizmet etmeyi dört gözle bekliyoruz.",
    friendly: "Harika yorumunuz için çok teşekkür ederiz! Harika bir deneyim yaşadığınızı duymak bizi çok mutlu etti. Sizi tekrar görmek için sabırsızlanıyoruz! 😊",
    playful: "Vay be, teşekkürler! 🎉 Muhteşem yorumunuz günümüzü aydınlattı! Sizi tekrar ağırlamak ve daha fazla harika deneyim yaşatmak için sabırsızlanıyoruz! ⭐",
  };

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-foreground mb-2">Otomatik Yanıt</h1>
        <p className="text-muted-foreground">AI destekli otomatik yanıtları yapılandırın</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Settings */}
        <div className="lg:col-span-2 space-y-6">
          {/* Enable Auto Reply */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="text-lg">Otomatik Yanıt Durumu</CardTitle>
              <CardDescription>
                Yorumlara otomatik yanıt vermek için AI'yı etkinleştirin
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="auto-reply" className="text-base font-medium">
                    Otomatik Yanıt
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    {autoReplyEnabled ? "Şu anda aktif" : "Şu anda aktif değil"}
                  </p>
                </div>
                <Switch
                  id="auto-reply"
                  checked={autoReplyEnabled}
                  onCheckedChange={setAutoReplyEnabled}
                />
              </div>
            </CardContent>
          </Card>

          {/* Tone Selection */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="text-lg">Yanıt Tonu</CardTitle>
              <CardDescription>
                AI tarafından oluşturulan yanıtlar için ton seçin
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {toneOptions.map((option) => (
                <div
                  key={option.value}
                  className={`p-4 rounded-lg border transition-smooth cursor-pointer ${
                    tone === option.value
                      ? "border-primary bg-primary/5"
                      : "border-border hover:bg-muted/30"
                  }`}
                  onClick={() => setTone(option.value)}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-4 h-4 rounded-full border-2 mt-1 flex items-center justify-center ${
                        tone === option.value
                          ? "border-primary"
                          : "border-muted-foreground"
                      }`}
                    >
                      {tone === option.value && (
                        <div className="w-2 h-2 rounded-full bg-primary" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-foreground">{option.label}</p>
                      <p className="text-sm text-muted-foreground">{option.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Language & Rules */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="text-lg">Dil ve Kurallar</CardTitle>
              <CardDescription>
                Dil ve yanıt kurallarını yapılandırın
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Dil</Label>
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">İngilizce</SelectItem>
                    <SelectItem value="tr">Türkçe</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <Label>Yanıt Kuralları</Label>
                <RadioGroup value={reviewRule} onValueChange={setReviewRule}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="positive" id="positive" />
                    <Label htmlFor="positive" className="font-normal cursor-pointer">
                      Sadece olumlu yorumlar (4-5 yıldız)
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="all" id="all" />
                    <Label htmlFor="all" className="font-normal cursor-pointer">
                      Tüm yorumlar
                    </Label>
                  </div>
                </RadioGroup>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Preview */}
        <div>
          <Card className="shadow-card sticky top-8">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg">Önizleme</CardTitle>
              </div>
              <CardDescription>
                Örnek AI tarafından oluşturulan yanıt
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="p-4 rounded-lg bg-muted/30 border border-border">
                <p className="text-sm text-foreground leading-relaxed">
                  {previewReplies[tone as keyof typeof previewReplies]}
                </p>
              </div>
              <div className="mt-4 pt-4 border-t border-border space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Ton:</span>
                  <span className="font-medium text-foreground capitalize">{toneOptions.find(t => t.value === tone)?.label}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Dil:</span>
                  <span className="font-medium text-foreground">
                    {language === "en" ? "İngilizce" : "Türkçe"}
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Kural:</span>
                  <span className="font-medium text-foreground">
                    {reviewRule === "positive" ? "Sadece olumlu" : "Tüm yorumlar"}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
