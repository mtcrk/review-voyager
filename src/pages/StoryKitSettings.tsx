import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  QrCode, 
  Link as LinkIcon, 
  Copy, 
  Palette, 
  Hash, 
  Download,
  Eye,
  BarChart3,
  Loader2,
  CheckCircle,
  Instagram,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useBusiness } from "@/contexts/BusinessContext";
import { toast } from "@/hooks/use-toast";
import { AppLayout } from "@/components/layout/AppLayout";

interface StoryTemplate {
  id: string;
  business_id: string;
  template_name: string;
  hashtag: string | null;
  tagline: string | null;
  background_color: string;
  text_color: string;
  accent_color: string;
  logo_url: string | null;
  custom_message_placeholder: string;
  is_active: boolean;
  qr_code_enabled: boolean;
}

interface ShareStats {
  total: number;
  today: number;
  thisWeek: number;
}

export default function StoryKitSettings() {
  const { activeBusiness } = useBusiness();
  const [template, setTemplate] = useState<StoryTemplate | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [stats, setStats] = useState<ShareStats>({ total: 0, today: 0, thisWeek: 0 });

  // Form state
  const [hashtag, setHashtag] = useState("");
  const [tagline, setTagline] = useState("");
  const [backgroundColor, setBackgroundColor] = useState("#ffffff");
  const [textColor, setTextColor] = useState("#000000");
  const [accentColor, setAccentColor] = useState("#8b5cf6");
  const [placeholder, setPlaceholder] = useState("Deneyimimi paylaşmak istiyorum...");
  const [isActive, setIsActive] = useState(true);
  const [qrEnabled, setQrEnabled] = useState(true);

  useEffect(() => {
    if (activeBusiness) {
      fetchTemplate();
      fetchStats();
    }
  }, [activeBusiness]);

  const fetchTemplate = async () => {
    if (!activeBusiness) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("story_kit_templates")
        .select("*")
        .eq("business_id", activeBusiness.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setTemplate(data);
        setHashtag(data.hashtag || "");
        setTagline(data.tagline || "");
        setBackgroundColor(data.background_color);
        setTextColor(data.text_color);
        setAccentColor(data.accent_color);
        setPlaceholder(data.custom_message_placeholder);
        setIsActive(data.is_active);
        setQrEnabled(data.qr_code_enabled);
      }
    } catch (error) {
      console.error("Error fetching template:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    if (!activeBusiness) return;

    try {
      const now = new Date();
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
      const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();

      // Total shares
      const { count: total } = await supabase
        .from("story_kit_shares")
        .select("*", { count: "exact", head: true })
        .eq("business_id", activeBusiness.id);

      // Today's shares
      const { count: today } = await supabase
        .from("story_kit_shares")
        .select("*", { count: "exact", head: true })
        .eq("business_id", activeBusiness.id)
        .gte("downloaded_at", todayStart);

      // This week's shares
      const { count: thisWeek } = await supabase
        .from("story_kit_shares")
        .select("*", { count: "exact", head: true })
        .eq("business_id", activeBusiness.id)
        .gte("downloaded_at", weekStart);

      setStats({
        total: total || 0,
        today: today || 0,
        thisWeek: thisWeek || 0,
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const saveTemplate = async () => {
    if (!activeBusiness) return;

    setSaving(true);
    try {
      const templateData = {
        business_id: activeBusiness.id,
        hashtag: hashtag || null,
        tagline: tagline || null,
        background_color: backgroundColor,
        text_color: textColor,
        accent_color: accentColor,
        custom_message_placeholder: placeholder,
        is_active: isActive,
        qr_code_enabled: qrEnabled,
      };

      if (template) {
        // Update existing
        const { error } = await supabase
          .from("story_kit_templates")
          .update(templateData)
          .eq("id", template.id);

        if (error) throw error;
      } else {
        // Create new
        const { error } = await supabase
          .from("story_kit_templates")
          .insert(templateData);

        if (error) throw error;
      }

      toast({
        title: "Kaydedildi",
        description: "Story Kit ayarları güncellendi.",
      });

      fetchTemplate();
    } catch (error) {
      console.error("Error saving template:", error);
      toast({
        title: "Hata",
        description: "Ayarlar kaydedilirken bir hata oluştu.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const getShareUrl = () => {
    if (!activeBusiness) return "";
    return `${window.location.origin}/share/${activeBusiness.id}`;
  };

  const copyLink = () => {
    navigator.clipboard.writeText(getShareUrl());
    toast({
      title: "Kopyalandı!",
      description: "Link panoya kopyalandı.",
    });
  };

  const getQrCodeUrl = () => {
    const shareUrl = encodeURIComponent(getShareUrl());
    return `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${shareUrl}`;
  };

  if (!activeBusiness) {
    return (
      <AppLayout>
        <div className="p-8">
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-muted-foreground">Lütfen önce bir işletme seçin.</p>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="p-8 space-y-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Instagram className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-semibold text-foreground">Story Kit</h1>
            <Badge variant="secondary">Beta</Badge>
          </div>
          <p className="text-muted-foreground">
            Müşterilerinizin Instagram Story'lerinde işletmenizi paylaşmasını sağlayın
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Toplam Paylaşım</p>
                  <p className="text-3xl font-bold">{stats.total}</p>
                </div>
                <BarChart3 className="h-8 w-8 text-primary opacity-50" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Bugün</p>
                  <p className="text-3xl font-bold">{stats.today}</p>
                </div>
                <Download className="h-8 w-8 text-green-500 opacity-50" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Bu Hafta</p>
                  <p className="text-3xl font-bold">{stats.thisWeek}</p>
                </div>
                <Instagram className="h-8 w-8 text-pink-500 opacity-50" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="share" className="space-y-6">
          <TabsList>
            <TabsTrigger value="share">Paylaşım Linki</TabsTrigger>
            <TabsTrigger value="design">Tasarım</TabsTrigger>
            <TabsTrigger value="settings">Ayarlar</TabsTrigger>
          </TabsList>

          {/* Share Tab */}
          <TabsContent value="share" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* QR Code */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <QrCode className="h-5 w-5" />
                    QR Kod
                  </CardTitle>
                  <CardDescription>
                    Masanıza veya kasanıza koyun, müşteriler taratsın
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center gap-4">
                  <div className="p-4 bg-white rounded-xl shadow-inner">
                    <img
                      src={getQrCodeUrl()}
                      alt="QR Code"
                      className="w-48 h-48"
                    />
                  </div>
                  <Button variant="outline" asChild>
                    <a href={getQrCodeUrl()} download="story-kit-qr.png">
                      <Download className="h-4 w-4 mr-2" />
                      QR Kodu İndir
                    </a>
                  </Button>
                </CardContent>
              </Card>

              {/* Share Link */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <LinkIcon className="h-5 w-5" />
                    Paylaşım Linki
                  </CardTitle>
                  <CardDescription>
                    Bu linki sosyal medyada veya web sitenizde paylaşın
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-2">
                    <Input value={getShareUrl()} readOnly className="font-mono text-sm" />
                    <Button variant="outline" onClick={copyLink}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <Button variant="outline" className="w-full" asChild>
                    <a href={getShareUrl()} target="_blank" rel="noopener noreferrer">
                      <Eye className="h-4 w-4 mr-2" />
                      Önizleme
                    </a>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Design Tab */}
          <TabsContent value="design" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="h-5 w-5" />
                  Görsel Ayarları
                </CardTitle>
                <CardDescription>
                  Story görselinin renklerini markanıza uygun hale getirin
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="bgColor">Arka Plan Rengi</Label>
                    <div className="flex gap-2">
                      <Input
                        id="bgColor"
                        type="color"
                        value={backgroundColor}
                        onChange={(e) => setBackgroundColor(e.target.value)}
                        className="w-12 h-10 p-1 cursor-pointer"
                      />
                      <Input
                        value={backgroundColor}
                        onChange={(e) => setBackgroundColor(e.target.value)}
                        className="flex-1 font-mono"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="textColor">Yazı Rengi</Label>
                    <div className="flex gap-2">
                      <Input
                        id="textColor"
                        type="color"
                        value={textColor}
                        onChange={(e) => setTextColor(e.target.value)}
                        className="w-12 h-10 p-1 cursor-pointer"
                      />
                      <Input
                        value={textColor}
                        onChange={(e) => setTextColor(e.target.value)}
                        className="flex-1 font-mono"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="accentColor">Vurgu Rengi</Label>
                    <div className="flex gap-2">
                      <Input
                        id="accentColor"
                        type="color"
                        value={accentColor}
                        onChange={(e) => setAccentColor(e.target.value)}
                        className="w-12 h-10 p-1 cursor-pointer"
                      />
                      <Input
                        value={accentColor}
                        onChange={(e) => setAccentColor(e.target.value)}
                        className="flex-1 font-mono"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tagline">Slogan / Alt Başlık</Label>
                  <Input
                    id="tagline"
                    placeholder="En lezzetli kahveler burada!"
                    value={tagline}
                    onChange={(e) => setTagline(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="placeholder">Mesaj Placeholder'ı</Label>
                  <Input
                    id="placeholder"
                    placeholder="Harika bir deneyimdi..."
                    value={placeholder}
                    onChange={(e) => setPlaceholder(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Müşteri mesaj yazmaya başlamadan önce göreceği örnek metin
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Hash className="h-5 w-5" />
                  Hashtag & Diğer Ayarlar
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="hashtag">İşletme Hashtag'i</Label>
                  <Input
                    id="hashtag"
                    placeholder="#kafeadi"
                    value={hashtag}
                    onChange={(e) => setHashtag(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Story'de görünecek hashtag (# ile başlayın)
                  </p>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">Story Kit Aktif</p>
                    <p className="text-sm text-muted-foreground">
                      Kapatırsanız müşteriler story oluşturamaz
                    </p>
                  </div>
                  <Switch
                    checked={isActive}
                    onCheckedChange={setIsActive}
                  />
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">QR Kod</p>
                    <p className="text-sm text-muted-foreground">
                      QR kod indirme özelliğini etkinleştir
                    </p>
                  </div>
                  <Switch
                    checked={qrEnabled}
                    onCheckedChange={setQrEnabled}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button onClick={saveTemplate} disabled={saving} size="lg">
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Kaydediliyor...
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Değişiklikleri Kaydet
              </>
            )}
          </Button>
        </div>
      </div>
    </AppLayout>
  );
}
