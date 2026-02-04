import { useState, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Download, 
  Instagram, 
  Share2, 
  Loader2, 
  Palette,
  QrCode,
  Sparkles,
  ArrowRight,
  ImagePlus,
  X,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

const DEMO_BUSINESSES = [
  { name: "Voyage Cafe", hashtag: "#voyagecafe", tagline: "Kahvenin en güzel hali ☕" },
  { name: "Blue Restaurant", hashtag: "#bluerestaurant", tagline: "Deniz kenarında lezzet 🌊" },
  { name: "Sunset Hotel", hashtag: "#sunsethotel", tagline: "Mükemmel konaklama ✨" },
];

export function StoryKitDemo() {
  const [selectedBusiness, setSelectedBusiness] = useState(DEMO_BUSINESSES[0]);
  const [customerMessage, setCustomerMessage] = useState("Harika bir deneyimdi! Herkese tavsiye ederim 🎉");
  const [backgroundColor, setBackgroundColor] = useState("#fef3c7");
  const [accentColor, setAccentColor] = useState("#f59e0b");
  const [generating, setGenerating] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "Dosya çok büyük",
          description: "Maksimum 10MB boyutunda dosya yükleyebilirsiniz.",
          variant: "destructive",
        });
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadedImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setUploadedImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };
  const generateStoryImage = async () => {
    if (!canvasRef.current) return;

    setGenerating(true);

    try {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // Instagram Story dimensions (9:16 aspect ratio)
      canvas.width = 1080;
      canvas.height = 1920;

      const textColor = "#1f2937";

      // Background
      ctx.fillStyle = backgroundColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Add subtle gradient overlay
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, "rgba(255,255,255,0.2)");
      gradient.addColorStop(1, "rgba(0,0,0,0.05)");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw uploaded image if exists
      if (uploadedImage) {
        const img = new Image();
        img.crossOrigin = "anonymous";
        await new Promise<void>((resolve, reject) => {
          img.onload = () => {
            // Draw image in top area with rounded corners
            const imgX = 140;
            const imgY = 100;
            const imgWidth = 800;
            const imgHeight = 600;
            const radius = 30;

            ctx.save();
            ctx.beginPath();
            ctx.roundRect(imgX, imgY, imgWidth, imgHeight, radius);
            ctx.clip();

            // Calculate aspect ratio to cover the area
            const scale = Math.max(imgWidth / img.width, imgHeight / img.height);
            const scaledWidth = img.width * scale;
            const scaledHeight = img.height * scale;
            const offsetX = imgX + (imgWidth - scaledWidth) / 2;
            const offsetY = imgY + (imgHeight - scaledHeight) / 2;

            ctx.drawImage(img, offsetX, offsetY, scaledWidth, scaledHeight);
            ctx.restore();

            // Add image border
            ctx.strokeStyle = accentColor;
            ctx.lineWidth = 6;
            ctx.beginPath();
            ctx.roundRect(imgX, imgY, imgWidth, imgHeight, radius);
            ctx.stroke();

            resolve();
          };
          img.onerror = reject;
          img.src = uploadedImage;
        });

        // Adjust other elements position when image is present
        // Business name badge on top of image
        ctx.fillStyle = accentColor;
        ctx.beginPath();
        ctx.roundRect(340, 650, 400, 80, 40);
        ctx.fill();

        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 40px system-ui";
        ctx.textAlign = "center";
        ctx.fillText(selectedBusiness.name, 540, 702);

        // Message background - moved down
        ctx.fillStyle = accentColor + "20";
        ctx.beginPath();
        ctx.roundRect(100, 780, 880, 380, 30);
        ctx.fill();

        ctx.strokeStyle = accentColor + "50";
        ctx.lineWidth = 4;
        ctx.stroke();

        // Quote mark
        ctx.fillStyle = accentColor;
        ctx.font = "bold 120px Georgia";
        ctx.fillText('"', 150, 890);

        // Message text
        ctx.fillStyle = textColor;
        ctx.font = "38px system-ui";
        ctx.textAlign = "left";
        
        const words = customerMessage.split(" ");
        let line = "";
        let y = 920;
        const maxWidth = 720;
        const lineHeight = 50;

        for (const word of words) {
          const testLine = line + word + " ";
          const metrics = ctx.measureText(testLine);
          if (metrics.width > maxWidth && line !== "") {
            ctx.fillText(line.trim(), 170, y);
            line = word + " ";
            y += lineHeight;
          } else {
            line = testLine;
          }
        }
        ctx.fillText(line.trim(), 170, y);

        // Star rating
        ctx.font = "48px system-ui";
        ctx.textAlign = "center";
        ctx.fillText("⭐⭐⭐⭐⭐", 540, 1280);

        // Hashtag
        ctx.fillStyle = accentColor;
        ctx.font = "bold 44px system-ui";
        ctx.fillText(selectedBusiness.hashtag, 540, 1380);

      } else {
        // Original layout without image
        // Location icon circle
        ctx.fillStyle = accentColor;
        ctx.beginPath();
        ctx.arc(540, 400, 70, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 56px system-ui";
        ctx.textAlign = "center";
        ctx.fillText("📍", 540, 420);

        // Business name
        ctx.fillStyle = textColor;
        ctx.font = "bold 72px system-ui";
        ctx.textAlign = "center";
        ctx.fillText(selectedBusiness.name, 540, 560);

        // Tagline
        ctx.font = "36px system-ui";
        ctx.fillStyle = textColor + "99";
        ctx.fillText(selectedBusiness.tagline, 540, 640);

        // Star rating
        ctx.font = "56px system-ui";
        ctx.fillText("⭐⭐⭐⭐⭐", 540, 750);

        // Message background
        ctx.fillStyle = accentColor + "20";
        ctx.beginPath();
        ctx.roundRect(100, 850, 880, 420, 30);
        ctx.fill();

        ctx.strokeStyle = accentColor + "50";
        ctx.lineWidth = 4;
        ctx.stroke();

        // Quote mark
        ctx.fillStyle = accentColor;
        ctx.font = "bold 140px Georgia";
        ctx.fillText('"', 150, 970);

        // Message text (word wrap)
        ctx.fillStyle = textColor;
        ctx.font = "40px system-ui";
        ctx.textAlign = "left";
        
        const words = customerMessage.split(" ");
        let line = "";
        let y = 1020;
        const maxWidth = 740;
        const lineHeight = 55;

        for (const word of words) {
          const testLine = line + word + " ";
          const metrics = ctx.measureText(testLine);
          if (metrics.width > maxWidth && line !== "") {
            ctx.fillText(line.trim(), 170, y);
            line = word + " ";
            y += lineHeight;
          } else {
            line = testLine;
          }
        }
        ctx.fillText(line.trim(), 170, y);

        // Hashtag
        ctx.fillStyle = accentColor;
        ctx.font = "bold 48px system-ui";
        ctx.textAlign = "center";
        ctx.fillText(selectedBusiness.hashtag, 540, 1450);
      }

      // Powered by footer
      ctx.fillStyle = textColor + "50";
      ctx.font = "28px system-ui";
      ctx.textAlign = "center";
      ctx.fillText("Voyagerespond ile oluşturuldu", 540, 1800);

      // Convert to data URL
      const dataUrl = canvas.toDataURL("image/png");
      setPreviewUrl(dataUrl);

      toast({
        title: "Story hazır! 🎉",
        description: "Örnek story başarıyla oluşturuldu.",
      });
    } catch (error) {
      console.error("Error generating story:", error);
    } finally {
      setGenerating(false);
    }
  };

  const downloadImage = () => {
    if (!previewUrl) return;

    const link = document.createElement("a");
    link.download = `${selectedBusiness.name.replace(/\s+/g, "-")}-demo-story.png`;
    link.href = previewUrl;
    link.click();

    toast({
      title: "İndirildi!",
      description: "Story görseliniz indirildi.",
    });
  };

  return (
    <section className="py-24 bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50">
      {/* Hidden canvas */}
      <canvas ref={canvasRef} className="hidden" />

      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white">
            <Sparkles className="h-3 w-3 mr-1" />
            Yeni Özellik
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Story Kit ile Ücretsiz Pazarlama
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Müşterileriniz işletmenizi Instagram'da paylaşsın. 
            Branded story'ler oluştursun, organik reach kazanın.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Left: Controls */}
          <div className="space-y-6">
            {/* Business Selector */}
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur">
              <CardContent className="pt-6 space-y-4">
                <Label className="text-sm font-medium">Demo İşletme Seçin</Label>
                <div className="flex flex-wrap gap-2">
                  {DEMO_BUSINESSES.map((biz) => (
                    <Button
                      key={biz.name}
                      variant={selectedBusiness.name === biz.name ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedBusiness(biz)}
                    >
                      {biz.name}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Photo Upload */}
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur">
              <CardContent className="pt-6 space-y-4">
                <div className="flex items-center gap-2">
                  <ImagePlus className="h-4 w-4 text-gray-500" />
                  <Label className="text-sm font-medium">Fotoğraf Ekle (Opsiyonel)</Label>
                </div>
                
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                  accept="image/*"
                  className="hidden"
                />
                
                {uploadedImage ? (
                  <div className="relative">
                    <img
                      src={uploadedImage}
                      alt="Yüklenen fotoğraf"
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2 h-7 w-7"
                      onClick={removeImage}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <Button
                    variant="outline"
                    className="w-full h-24 border-dashed border-2 flex flex-col gap-2"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <ImagePlus className="h-6 w-6 text-gray-400" />
                    <span className="text-sm text-gray-500">Yemek, mekan veya anı fotoğrafı ekleyin</span>
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Message Input */}
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur">
              <CardContent className="pt-6 space-y-4">
                <Label className="text-sm font-medium">Müşteri Mesajı</Label>
                <Textarea
                  placeholder="Harika bir deneyimdi..."
                  value={customerMessage}
                  onChange={(e) => setCustomerMessage(e.target.value)}
                  className="min-h-[100px] resize-none"
                  maxLength={150}
                />
                <p className="text-xs text-gray-400 text-right">
                  {customerMessage.length}/150
                </p>
              </CardContent>
            </Card>

            {/* Color Customization */}
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur">
              <CardContent className="pt-6 space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <Palette className="h-4 w-4 text-gray-500" />
                  <Label className="text-sm font-medium">Renk Özelleştirme</Label>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs text-gray-500">Arka Plan</Label>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={backgroundColor}
                        onChange={(e) => setBackgroundColor(e.target.value)}
                        className="w-12 h-10 p-1 cursor-pointer"
                      />
                      <Input
                        value={backgroundColor}
                        onChange={(e) => setBackgroundColor(e.target.value)}
                        className="flex-1 font-mono text-sm"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs text-gray-500">Vurgu Rengi</Label>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={accentColor}
                        onChange={(e) => setAccentColor(e.target.value)}
                        className="w-12 h-10 p-1 cursor-pointer"
                      />
                      <Input
                        value={accentColor}
                        onChange={(e) => setAccentColor(e.target.value)}
                        className="flex-1 font-mono text-sm"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Generate Button */}
            <Button
              onClick={generateStoryImage}
              disabled={generating}
              className="w-full h-14 text-lg bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 shadow-lg"
            >
              {generating ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Oluşturuluyor...
                </>
              ) : (
                <>
                  <Share2 className="h-5 w-5 mr-2" />
                  Demo Story Oluştur
                </>
              )}
            </Button>

            {/* How it works */}
            <Card className="border-dashed border-2 border-amber-300 bg-amber-50/50">
              <CardContent className="pt-6">
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <QrCode className="h-4 w-4" />
                  Nasıl Çalışır?
                </h4>
                <ol className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-start gap-2">
                    <span className="bg-amber-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs shrink-0">1</span>
                    İşletmeniz için hashtag ve renkler belirleyin
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="bg-amber-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs shrink-0">2</span>
                    QR kodu indirip masanıza/kasanıza koyun
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="bg-amber-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs shrink-0">3</span>
                    Müşteriler tarayıp story oluşturur ve paylaşır
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="bg-amber-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs shrink-0">4</span>
                    Siz de paylaşım istatistiklerini takip edin
                  </li>
                </ol>
              </CardContent>
            </Card>
          </div>

          {/* Right: Preview */}
          <div className="flex flex-col items-center justify-center">
            <div className="relative">
              {/* Phone frame */}
              <div className="relative w-[280px] h-[580px] bg-gray-900 rounded-[40px] p-3 shadow-2xl">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-gray-900 rounded-b-2xl z-10" />
                <div className="w-full h-full bg-gray-100 rounded-[30px] overflow-hidden">
                  {previewUrl ? (
                    <img
                      src={previewUrl}
                      alt="Story preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-amber-100 to-orange-100 p-6 text-center">
                      <Instagram className="h-16 w-16 text-amber-500/50 mb-4" />
                      <p className="text-gray-500 text-sm">
                        "Demo Story Oluştur" butonuna tıklayarak örnek bir Instagram Story görseli oluşturun
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Instagram badge */}
              <div className="absolute -top-3 -right-3 bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 text-white px-3 py-1 rounded-full text-sm font-medium shadow-lg">
                <Instagram className="h-4 w-4 inline mr-1" />
                Story
              </div>
            </div>

            {/* Download button */}
            {previewUrl && (
              <Button
                onClick={downloadImage}
                variant="outline"
                className="mt-6"
              >
                <Download className="h-4 w-4 mr-2" />
                Story'yi İndir
              </Button>
            )}

            {/* CTA */}
            <div className="mt-8 text-center">
              <p className="text-gray-600 mb-4">
                İşletmeniz için Story Kit'i şimdi aktifleştirin
              </p>
              <Button 
                variant="link" 
                className="text-amber-600 hover:text-amber-700"
                onClick={() => window.location.href = '/register'}
              >
                Ücretsiz Başla <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
