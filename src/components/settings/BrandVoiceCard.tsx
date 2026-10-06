import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Loader2, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useBusiness } from "@/contexts/BusinessContext";
import { toast } from "@/hooks/use-toast";

type BrandVoice = {
  signature_name?: string;
  signature_role?: string;
  contact_channel?: string;
  closing_text?: string;
  closing_enabled_by_default?: boolean;
  brand_values?: string;
  forbidden_phrases?: string[];
  seo_optimized?: boolean;
  high_touch?: boolean;
};

export function BrandVoiceCard() {
  const { activeBusiness, refetchBusinesses } = useBusiness();
  const [voice, setVoice] = useState<BrandVoice>({});
  const [forbiddenText, setForbiddenText] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const v = (activeBusiness as any)?.brand_voice || {};
    setVoice(v);
    setForbiddenText((v.forbidden_phrases || []).join(", "));
  }, [activeBusiness?.id]);

  const save = async () => {
    if (!activeBusiness) return;
    setSaving(true);
    const payload: BrandVoice = {
      ...voice,
      forbidden_phrases: forbiddenText
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      seo_optimized: voice.seo_optimized !== false,
    };
    const { error } = await supabase
      .from("businesses")
      .update({ brand_voice: payload } as any)
      .eq("id", activeBusiness.id);
    setSaving(false);
    if (error) {
      toast({ title: "Hata", description: "Marka sesi kaydedilemedi.", variant: "destructive" });
      return;
    }
    await refetchBusinesses();
    toast({ title: "Kaydedildi", description: "Marka sesi güncellendi." });
  };

  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5" />
          Marka Sesi (AI Yanıt Profili)
        </CardTitle>
        <CardDescription>
          AI yanıt kalitesini işletmenize göre kişiselleştirin. Bu bilgiler her yorum yanıtında kullanılır.
          {activeBusiness && (
            <span className="block mt-1 font-medium text-foreground">
              İşletme: {activeBusiness.name}
            </span>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>İmza — Ad Soyad</Label>
            <Input
              placeholder="Ör: Mete Çoruk"
              value={voice.signature_name || ""}
              onChange={(e) => setVoice({ ...voice, signature_name: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>İmza — Ünvan</Label>
            <Input
              placeholder="Ör: Misafir İlişkileri Müdürü"
              value={voice.signature_role || ""}
              onChange={(e) => setVoice({ ...voice, signature_role: e.target.value })}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Özel İletişim Kanalı (olumsuz yorumlarda gösterilir)</Label>
          <Input
            placeholder="Ör: iletisim@voyagerespond.com veya +90 555 000 00 00"
            value={voice.contact_channel || ""}
            onChange={(e) => setVoice({ ...voice, contact_channel: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label>Kayıtlı Kapanış</Label>
          <Textarea
            rows={4}
            placeholder={"Ör:\nMete Çoruk\nGenel Müdür\n+90 555 000 00 00"}
            value={voice.closing_text || ""}
            onChange={(e) => setVoice({ ...voice, closing_text: e.target.value })}
          />
          <p className="text-xs text-muted-foreground">
            Seçtiğiniz yanıtlarda metnin sonuna, satır düzeni korunarak aynen eklenir.
          </p>
        </div>

        <div className="flex items-center justify-between p-3 rounded-lg border">
          <div>
            <p className="text-sm font-medium">Yanıtlara varsayılan olarak ekle</p>
            <p className="text-xs text-muted-foreground">
              Yanıt üretirken bu seçimi tek seferlik kapatabilirsiniz.
            </p>
          </div>
          <Switch
            checked={voice.closing_enabled_by_default === true}
            disabled={!voice.closing_text?.trim()}
            onCheckedChange={(v) => setVoice({ ...voice, closing_enabled_by_default: v })}
          />
        </div>

        <div className="space-y-2">
          <Label>Marka Değerleri (yanıtlarda ince ince yansıtılır)</Label>
          <Textarea
            rows={2}
            placeholder="Ör: sıcak misafirperverlik, Ege mutfağı, sürdürülebilirlik"
            value={voice.brand_values || ""}
            onChange={(e) => setVoice({ ...voice, brand_values: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label>Yasaklı Kelimeler / Kalıplar (virgülle ayırın)</Label>
          <Textarea
            rows={2}
            placeholder="Ör: garanti ederiz, ücretsiz konaklama, tazminat"
            value={forbiddenText}
            onChange={(e) => setForbiddenText(e.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            AI QA kontrolü bu ifadeleri kullanan yanıtları otomatik reddedip yeniden üretir.
          </p>
        </div>

        <div className="flex items-center justify-between p-3 rounded-lg border">
          <div>
            <p className="text-sm font-medium">Google için Yerel SEO Optimizasyonu</p>
            <p className="text-xs text-muted-foreground">
              Google yorumlarında işletme adı ve şehir doğal olarak yanıta işlenir.
            </p>
          </div>
          <Switch
            checked={voice.seo_optimized !== false}
            onCheckedChange={(v) => setVoice({ ...voice, seo_optimized: v })}
          />
        </div>

        <div className="flex items-center justify-between p-3 rounded-lg border">
          <div>
            <p className="text-sm font-medium">Premium Kalite Modu</p>
            <p className="text-xs text-muted-foreground">
              Tüm yanıtlar en güçlü modelle (Gemini 2.5 Pro) üretilir. Daha yavaş ama daha kaliteli.
            </p>
          </div>
          <Switch
            checked={!!voice.high_touch}
            onCheckedChange={(v) => setVoice({ ...voice, high_touch: v })}
          />
        </div>

        <Button onClick={save} disabled={saving || !activeBusiness}>
          {saving ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Kaydediliyor...</> : "Marka Sesini Kaydet"}
        </Button>
      </CardContent>
    </Card>
  );
}