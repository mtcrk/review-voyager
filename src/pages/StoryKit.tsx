import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Download, Instagram, Share2, Loader2, MapPin, Star } from "lucide-react";
import { toast } from "@/hooks/use-toast";

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
}

interface Business {
  id: string;
  name: string;
}

export default function StoryKit() {
  const { businessSlug } = useParams<{ businessSlug: string }>();
  const [template, setTemplate] = useState<StoryTemplate | null>(null);
  const [business, setBusiness] = useState<Business | null>(null);
  const [customerMessage, setCustomerMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    fetchTemplateAndBusiness();
  }, [businessSlug]);

  const fetchTemplateAndBusiness = async () => {
    if (!businessSlug) return;

    try {
      // First find the business by ID or slug (using ID for now)
      const { data: businessData, error: businessError } = await supabase
        .from("businesses")
        .select("id, name")
        .eq("id", businessSlug)
        .single();

      if (businessError || !businessData) {
        toast({
          title: "İşletme bulunamadı",
          description: "Bu bağlantı geçersiz olabilir.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      setBusiness(businessData);

      // Then fetch the active template for this business
      const { data: templateData, error: templateError } = await supabase
        .from("story_kit_templates")
        .select("*")
        .eq("business_id", businessData.id)
        .eq("is_active", true)
        .maybeSingle();

      if (templateError) {
        console.error("Template fetch error:", templateError);
      }

      setTemplate(templateData);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const generateStoryImage = async () => {
    if (!business || !canvasRef.current) return;

    setGenerating(true);

    try {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // Instagram Story dimensions (9:16 aspect ratio)
      canvas.width = 1080;
      canvas.height = 1920;

      const bgColor = template?.background_color || "#ffffff";
      const textColor = template?.text_color || "#000000";
      const accentColor = template?.accent_color || "#8b5cf6";

      // Background
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Add subtle gradient overlay
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, "rgba(255,255,255,0.1)");
      gradient.addColorStop(1, "rgba(0,0,0,0.05)");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Location icon and business name
      ctx.fillStyle = accentColor;
      ctx.beginPath();
      ctx.arc(540, 400, 60, 0, Math.PI * 2);
      ctx.fill();

      // Location pin symbol
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 48px system-ui";
      ctx.textAlign = "center";
      ctx.fillText("📍", 540, 420);

      // Business name
      ctx.fillStyle = textColor;
      ctx.font = "bold 64px system-ui";
      ctx.textAlign = "center";
      ctx.fillText(business.name, 540, 550);

      // Tagline
      if (template?.tagline) {
        ctx.font = "32px system-ui";
        ctx.fillStyle = textColor + "99";
        ctx.fillText(template.tagline, 540, 620);
      }

      // Star rating decoration
      ctx.font = "48px system-ui";
      ctx.fillText("⭐⭐⭐⭐⭐", 540, 720);

      // Customer message box
      const message = customerMessage || "Harika bir deneyimdi! 🎉";
      
      // Message background
      ctx.fillStyle = accentColor + "15";
      ctx.beginPath();
      ctx.roundRect(100, 820, 880, 400, 30);
      ctx.fill();

      // Message border
      ctx.strokeStyle = accentColor + "40";
      ctx.lineWidth = 3;
      ctx.stroke();

      // Quote mark
      ctx.fillStyle = accentColor;
      ctx.font = "bold 120px Georgia";
      ctx.fillText('"', 150, 920);

      // Message text (word wrap)
      ctx.fillStyle = textColor;
      ctx.font = "36px system-ui";
      ctx.textAlign = "left";
      
      const words = message.split(" ");
      let line = "";
      let y = 960;
      const maxWidth = 760;
      const lineHeight = 50;

      for (const word of words) {
        const testLine = line + word + " ";
        const metrics = ctx.measureText(testLine);
        if (metrics.width > maxWidth && line !== "") {
          ctx.fillText(line.trim(), 160, y);
          line = word + " ";
          y += lineHeight;
        } else {
          line = testLine;
        }
      }
      ctx.fillText(line.trim(), 160, y);

      // Hashtag
      if (template?.hashtag) {
        ctx.fillStyle = accentColor;
        ctx.font = "bold 42px system-ui";
        ctx.textAlign = "center";
        ctx.fillText(template.hashtag, 540, 1400);
      }

      // Powered by footer
      ctx.fillStyle = textColor + "60";
      ctx.font = "24px system-ui";
      ctx.fillText("Voyagerespond ile oluşturuldu", 540, 1800);

      // Convert to data URL
      const dataUrl = canvas.toDataURL("image/png");
      setPreviewUrl(dataUrl);

      // Track the share
      if (template) {
        await supabase.from("story_kit_shares").insert({
          template_id: template.id,
          business_id: business.id,
          customer_message: customerMessage,
          platform: "instagram",
        });
      }

      toast({
        title: "Story hazır! 🎉",
        description: "Şimdi indirebilir ve Instagram'da paylaşabilirsiniz.",
      });
    } catch (error) {
      console.error("Error generating story:", error);
      toast({
        title: "Hata",
        description: "Story oluşturulurken bir hata oluştu.",
        variant: "destructive",
      });
    } finally {
      setGenerating(false);
    }
  };

  const downloadImage = () => {
    if (!previewUrl || !business) return;

    const link = document.createElement("a");
    link.download = `${business.name.replace(/\s+/g, "-")}-story.png`;
    link.href = previewUrl;
    link.click();

    toast({
      title: "İndirildi!",
      description: "Story'nizi Instagram'da paylaşın.",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!business) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50">
        <Card className="max-w-md mx-4">
          <CardContent className="pt-6 text-center">
            <MapPin className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">İşletme Bulunamadı</h2>
            <p className="text-muted-foreground">
              Bu bağlantı geçersiz olabilir. Lütfen işletmeden yeni bir QR kod veya link isteyin.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
      {/* Hidden canvas for generation */}
      <canvas ref={canvasRef} className="hidden" />

      <div className="container max-w-lg mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <Badge className="mb-4 bg-gradient-to-r from-purple-500 to-pink-500">
            <Instagram className="h-3 w-3 mr-1" />
            Instagram Story
          </Badge>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {business.name}'da mıydınız?
          </h1>
          <p className="text-gray-600">
            Deneyiminizi paylaşın, indirin ve Instagram Story'nize ekleyin!
          </p>
        </div>

        {/* Message Input */}
        <Card className="mb-6 shadow-lg border-0 bg-white/80 backdrop-blur">
          <CardContent className="pt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Deneyiminizi yazın ✨
            </label>
            <Textarea
              placeholder={template?.custom_message_placeholder || "Harika bir deneyimdi! Herkese tavsiye ederim..."}
              value={customerMessage}
              onChange={(e) => setCustomerMessage(e.target.value)}
              className="min-h-[120px] resize-none border-gray-200 focus:border-purple-300"
              maxLength={200}
            />
            <p className="text-xs text-gray-400 mt-2 text-right">
              {customerMessage.length}/200
            </p>
          </CardContent>
        </Card>

        {/* Generate Button */}
        <Button
          onClick={generateStoryImage}
          disabled={generating}
          className="w-full h-14 text-lg bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 shadow-lg"
        >
          {generating ? (
            <>
              <Loader2 className="h-5 w-5 mr-2 animate-spin" />
              Oluşturuluyor...
            </>
          ) : (
            <>
              <Share2 className="h-5 w-5 mr-2" />
              Story Oluştur
            </>
          )}
        </Button>

        {/* Preview */}
        {previewUrl && (
          <div className="mt-8 space-y-4">
            <h3 className="text-center font-medium text-gray-700">Önizleme</h3>
            <div className="relative aspect-[9/16] max-w-xs mx-auto rounded-2xl overflow-hidden shadow-2xl">
              <img
                src={previewUrl}
                alt="Story preview"
                className="w-full h-full object-cover"
              />
            </div>

            <Button
              onClick={downloadImage}
              variant="outline"
              className="w-full h-12 border-2"
            >
              <Download className="h-5 w-5 mr-2" />
              Story'yi İndir
            </Button>

            <p className="text-center text-sm text-gray-500">
              İndirdikten sonra Instagram'da Story olarak paylaşın! 📱
            </p>
          </div>
        )}

        {/* Hashtag hint */}
        {template?.hashtag && (
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              Paylaşırken şu hashtag'i kullanmayı unutmayın:
            </p>
            <Badge variant="secondary" className="mt-2 text-base">
              {template.hashtag}
            </Badge>
          </div>
        )}

        {/* Footer */}
        <div className="mt-12 text-center text-xs text-gray-400">
          <p>Powered by Voyagerespond</p>
        </div>
      </div>
    </div>
  );
}
