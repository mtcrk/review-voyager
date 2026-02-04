import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Copy, Code, ExternalLink, CheckCircle } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface EmbedWidgetGeneratorProps {
  businessName: string;
  businessId: string;
  accentColor: string;
}

type WidgetType = "button" | "popup" | "banner";

export function EmbedWidgetGenerator({ 
  businessName, 
  businessId, 
  accentColor 
}: EmbedWidgetGeneratorProps) {
  const [widgetType, setWidgetType] = useState<WidgetType>("button");
  const [buttonText, setButtonText] = useState("📸 Story Oluştur");
  const [copied, setCopied] = useState(false);

  const getShareUrl = () => {
    return `${window.location.origin}/share/${businessId}`;
  };

  const getButtonCode = () => {
    return `<!-- Story Kit Button - ${businessName} -->
<a 
  href="${getShareUrl()}" 
  target="_blank" 
  rel="noopener noreferrer"
  style="
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 12px 24px;
    background: ${accentColor};
    color: white;
    text-decoration: none;
    border-radius: 8px;
    font-family: system-ui, sans-serif;
    font-weight: 600;
    font-size: 16px;
    transition: opacity 0.2s;
  "
  onmouseover="this.style.opacity='0.9'"
  onmouseout="this.style.opacity='1'"
>
  ${buttonText}
</a>`;
  };

  const getPopupCode = () => {
    return `<!-- Story Kit Popup - ${businessName} -->
<script>
(function() {
  var storyKitUrl = "${getShareUrl()}";
  var buttonText = "${buttonText}";
  var accentColor = "${accentColor}";
  
  // Create floating button
  var btn = document.createElement('div');
  btn.innerHTML = buttonText;
  btn.style.cssText = 'position:fixed;bottom:20px;right:20px;padding:14px 24px;background:' + accentColor + ';color:white;border-radius:50px;cursor:pointer;font-family:system-ui,sans-serif;font-weight:600;font-size:14px;box-shadow:0 4px 20px rgba(0,0,0,0.15);z-index:9999;transition:transform 0.2s;';
  btn.onmouseover = function() { this.style.transform = 'scale(1.05)'; };
  btn.onmouseout = function() { this.style.transform = 'scale(1)'; };
  btn.onclick = function() { window.open(storyKitUrl, '_blank', 'width=420,height=700'); };
  document.body.appendChild(btn);
})();
</script>`;
  };

  const getBannerCode = () => {
    return `<!-- Story Kit Banner - ${businessName} -->
<div style="
  background: linear-gradient(135deg, ${accentColor}15, ${accentColor}05);
  border: 1px solid ${accentColor}30;
  border-radius: 12px;
  padding: 20px;
  margin: 20px 0;
  text-align: center;
  font-family: system-ui, sans-serif;
">
  <p style="margin: 0 0 12px 0; font-size: 18px; font-weight: 600; color: #1f2937;">
    📸 Deneyiminizi Paylaşın!
  </p>
  <p style="margin: 0 0 16px 0; font-size: 14px; color: #6b7280;">
    ${businessName}'da güzel vakit geçirdiniz mi? Instagram Story'nize ekleyin!
  </p>
  <a 
    href="${getShareUrl()}" 
    target="_blank" 
    rel="noopener noreferrer"
    style="
      display: inline-block;
      padding: 10px 20px;
      background: ${accentColor};
      color: white;
      text-decoration: none;
      border-radius: 6px;
      font-weight: 600;
      font-size: 14px;
    "
  >
    ${buttonText}
  </a>
</div>`;
  };

  const getCode = () => {
    switch (widgetType) {
      case "button": return getButtonCode();
      case "popup": return getPopupCode();
      case "banner": return getBannerCode();
    }
  };

  const copyCode = () => {
    navigator.clipboard.writeText(getCode());
    setCopied(true);
    toast({
      title: "Kopyalandı!",
      description: "Kodu web sitenize yapıştırabilirsiniz.",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const previewWidget = () => {
    const previewWindow = window.open("", "_blank", "width=500,height=400");
    if (previewWindow) {
      previewWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Widget Önizleme - ${businessName}</title>
          <style>
            body {
              font-family: system-ui, sans-serif;
              display: flex;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
              margin: 0;
              background: #f9fafb;
            }
          </style>
        </head>
        <body>
          ${getCode()}
        </body>
        </html>
      `);
      previewWindow.document.close();
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Code className="h-5 w-5" />
          Website Widget
        </CardTitle>
        <CardDescription>
          Web sitenize ekleyebileceğiniz Story Kit butonu veya popup
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Widget Type */}
        <div className="space-y-3">
          <Label>Widget Tipi</Label>
          <RadioGroup
            value={widgetType}
            onValueChange={(v) => setWidgetType(v as WidgetType)}
            className="grid grid-cols-3 gap-4"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="button" id="button" />
              <Label htmlFor="button" className="cursor-pointer">Buton</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="popup" id="popup" />
              <Label htmlFor="popup" className="cursor-pointer">Popup</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="banner" id="banner" />
              <Label htmlFor="banner" className="cursor-pointer">Banner</Label>
            </div>
          </RadioGroup>
        </div>

        {/* Button Text */}
        <div className="space-y-2">
          <Label htmlFor="buttonText">Buton Metni</Label>
          <Input
            id="buttonText"
            value={buttonText}
            onChange={(e) => setButtonText(e.target.value)}
            placeholder="📸 Story Oluştur"
          />
        </div>

        {/* Code Output */}
        <div className="space-y-2">
          <Label>Embed Kodu</Label>
          <Textarea
            value={getCode()}
            readOnly
            className="font-mono text-xs h-48 bg-muted/50"
          />
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button onClick={copyCode} className="flex-1">
            {copied ? (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Kopyalandı!
              </>
            ) : (
              <>
                <Copy className="h-4 w-4 mr-2" />
                Kodu Kopyala
              </>
            )}
          </Button>
          <Button onClick={previewWidget} variant="outline">
            <ExternalLink className="h-4 w-4 mr-2" />
            Önizle
          </Button>
        </div>

        {/* Instructions */}
        <div className="text-sm text-muted-foreground space-y-2 p-4 bg-muted/30 rounded-lg">
          <p className="font-medium">Nasıl Kullanılır:</p>
          <ol className="list-decimal list-inside space-y-1 text-xs">
            <li>Yukarıdaki kodu kopyalayın</li>
            <li>Web sitenizin HTML'ine yapıştırın</li>
            <li>
              {widgetType === "popup" 
                ? "Popup otomatik olarak sağ alt köşede görünecek"
                : widgetType === "banner"
                ? "Banner istediğiniz yere eklenecek"
                : "Buton istediğiniz yere eklenecek"
              }
            </li>
          </ol>
        </div>
      </CardContent>
    </Card>
  );
}
