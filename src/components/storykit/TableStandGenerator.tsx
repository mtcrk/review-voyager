import { useRef, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Download, Printer, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface TableStandGeneratorProps {
  businessName: string;
  businessId: string;
  accentColor: string;
  tagline?: string;
}

type StandSize = "a5" | "a6" | "square";

const SIZES = {
  a5: { width: 1748, height: 2480, label: "A5 (148×210mm)" },
  a6: { width: 1240, height: 1748, label: "A6 (105×148mm)" },
  square: { width: 1200, height: 1200, label: "Kare (10×10cm)" },
};

export function TableStandGenerator({ 
  businessName, 
  businessId, 
  accentColor,
  tagline 
}: TableStandGeneratorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [generating, setGenerating] = useState(false);
  const [selectedSize, setSelectedSize] = useState<StandSize>("a6");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const getShareUrl = () => {
    return `${window.location.origin}/share/${businessId}`;
  };

  const getQrCodeUrl = (size: number = 400) => {
    const shareUrl = encodeURIComponent(getShareUrl());
    return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${shareUrl}&format=png&margin=0`;
  };

  const generateTableStand = async () => {
    if (!canvasRef.current) return;

    setGenerating(true);

    try {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const size = SIZES[selectedSize];
      canvas.width = size.width;
      canvas.height = size.height;

      // Background - white with subtle pattern
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Top accent bar
      ctx.fillStyle = accentColor;
      ctx.fillRect(0, 0, canvas.width, 80);

      // Bottom accent bar
      ctx.fillRect(0, canvas.height - 80, canvas.width, 80);

      // Main content area
      const centerX = canvas.width / 2;
      const qrSize = Math.min(canvas.width * 0.5, canvas.height * 0.35);

      // Instagram icon and CTA
      ctx.fillStyle = "#1f2937";
      ctx.font = `bold ${Math.floor(canvas.width * 0.04)}px system-ui`;
      ctx.textAlign = "center";
      ctx.fillText("📸 Deneyiminizi Paylaşın!", centerX, canvas.height * 0.15);

      // Subtitle
      ctx.font = `${Math.floor(canvas.width * 0.025)}px system-ui`;
      ctx.fillStyle = "#6b7280";
      ctx.fillText("QR kodu tarayın, story oluşturun", centerX, canvas.height * 0.20);

      // QR Code
      const qrImg = new Image();
      qrImg.crossOrigin = "anonymous";
      
      await new Promise<void>((resolve, reject) => {
        qrImg.onload = () => {
          const qrX = centerX - qrSize / 2;
          const qrY = canvas.height * 0.28;
          
          // QR background
          ctx.fillStyle = "#ffffff";
          ctx.beginPath();
          ctx.roundRect(qrX - 20, qrY - 20, qrSize + 40, qrSize + 40, 20);
          ctx.fill();
          
          // QR border
          ctx.strokeStyle = accentColor;
          ctx.lineWidth = 4;
          ctx.stroke();

          ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize);
          resolve();
        };
        qrImg.onerror = reject;
        qrImg.src = getQrCodeUrl(400);
      });

      // Business name
      ctx.fillStyle = accentColor;
      ctx.font = `bold ${Math.floor(canvas.width * 0.055)}px system-ui`;
      ctx.textAlign = "center";
      ctx.fillText(businessName, centerX, canvas.height * 0.72);

      // Tagline if exists
      if (tagline) {
        ctx.font = `${Math.floor(canvas.width * 0.028)}px system-ui`;
        ctx.fillStyle = "#6b7280";
        ctx.fillText(tagline, centerX, canvas.height * 0.78);
      }

      // Instagram handle hint
      ctx.font = `${Math.floor(canvas.width * 0.022)}px system-ui`;
      ctx.fillStyle = "#9ca3af";
      ctx.fillText("Story'nizi paylaşırken bizi etiketlemeyi unutmayın! 🏷️", centerX, canvas.height * 0.88);

      // Powered by
      ctx.font = `${Math.floor(canvas.width * 0.018)}px system-ui`;
      ctx.fillStyle = "#d1d5db";
      ctx.fillText("voyagerespond.com", centerX, canvas.height * 0.95);

      const dataUrl = canvas.toDataURL("image/png");
      setPreviewUrl(dataUrl);

      toast({
        title: "Masa standı hazır! 🎉",
        description: "Şimdi indirebilirsiniz.",
      });
    } catch (error) {
      console.error("Error generating table stand:", error);
      toast({
        title: "Hata",
        description: "Tasarım oluşturulurken bir hata oluştu.",
        variant: "destructive",
      });
    } finally {
      setGenerating(false);
    }
  };

  const downloadImage = () => {
    if (!previewUrl) return;

    const link = document.createElement("a");
    link.download = `${businessName.replace(/\s+/g, "-")}-masa-standi-${selectedSize}.png`;
    link.href = previewUrl;
    link.click();

    toast({
      title: "İndirildi!",
      description: "Artık yazdırıp kullanabilirsiniz.",
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Printer className="h-5 w-5" />
          Masa Standı / Tent Kart
        </CardTitle>
        <CardDescription>
          Yazdırıp masanıza koyabileceğiniz QR kodlu tasarım
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Hidden canvas */}
        <canvas ref={canvasRef} className="hidden" />

        {/* Size selector */}
        <div className="space-y-3">
          <Label>Boyut Seçin</Label>
          <RadioGroup
            value={selectedSize}
            onValueChange={(v) => setSelectedSize(v as StandSize)}
            className="flex flex-wrap gap-4"
          >
            {Object.entries(SIZES).map(([key, { label }]) => (
              <div key={key} className="flex items-center space-x-2">
                <RadioGroupItem value={key} id={key} />
                <Label htmlFor={key} className="cursor-pointer">{label}</Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        {/* Generate button */}
        <Button 
          onClick={generateTableStand} 
          disabled={generating}
          className="w-full"
        >
          {generating ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Oluşturuluyor...
            </>
          ) : (
            <>
              <Printer className="h-4 w-4 mr-2" />
              Tasarım Oluştur
            </>
          )}
        </Button>

        {/* Preview */}
        {previewUrl && (
          <div className="space-y-4">
            <div className="border rounded-lg p-4 bg-muted/30">
              <img
                src={previewUrl}
                alt="Masa standı önizleme"
                className="max-h-80 mx-auto rounded shadow-lg"
              />
            </div>
            <Button onClick={downloadImage} variant="outline" className="w-full">
              <Download className="h-4 w-4 mr-2" />
              PNG Olarak İndir
            </Button>
            <p className="text-xs text-muted-foreground text-center">
              💡 İndirdikten sonra A4 kağıda yazdırıp kesin, veya doğrudan fotoğraf olarak bastırın
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
