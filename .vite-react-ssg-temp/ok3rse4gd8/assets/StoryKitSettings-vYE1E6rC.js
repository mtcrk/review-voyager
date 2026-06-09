import { jsxs, jsx, Fragment } from "react/jsx-runtime";
import { useRef, useState, useEffect } from "react";
import { C as Card, a as CardHeader, e as CardTitle, b as CardDescription, c as CardContent } from "./card-vx9BCW0t.js";
import { B as Button, t as toast, I as Input, a as useBusiness, s as supabase, F as AppLayout, m as Badge } from "../main.mjs";
import { L as Label } from "./label-Dr59vwVb.js";
import { S as Switch } from "./switch-DIbAOqMh.js";
import { T as Tabs, a as TabsList, b as TabsTrigger, c as TabsContent } from "./tabs-C8D1i09v.js";
import { Printer, Loader2, Download, Code, CheckCircle, Copy, ExternalLink, Instagram, BarChart3, QrCode, Link, Eye, Palette, Hash } from "lucide-react";
import { R as RadioGroup, a as RadioGroupItem } from "./radio-group-Oyal00sh.js";
import { T as Textarea } from "./textarea-BbAnJDWe.js";
import "vite-react-ssg";
import "react-router-dom";
import "@radix-ui/react-toast";
import "class-variance-authority";
import "clsx";
import "tailwind-merge";
import "next-themes";
import "sonner";
import "@radix-ui/react-tooltip";
import "@tanstack/react-query";
import "react-i18next";
import "@supabase/supabase-js";
import "@radix-ui/react-slot";
import "@radix-ui/react-separator";
import "@radix-ui/react-dialog";
import "@radix-ui/react-alert-dialog";
import "@radix-ui/react-dropdown-menu";
import "@radix-ui/react-collapsible";
import "i18next";
import "i18next-browser-languagedetector";
import "@radix-ui/react-label";
import "@radix-ui/react-switch";
import "@radix-ui/react-tabs";
import "@radix-ui/react-radio-group";
const SIZES = {
  a5: { width: 1748, height: 2480, label: "A5 (148×210mm)" },
  a6: { width: 1240, height: 1748, label: "A6 (105×148mm)" },
  square: { width: 1200, height: 1200, label: "Kare (10×10cm)" }
};
function TableStandGenerator({
  businessName,
  businessId,
  accentColor,
  tagline
}) {
  const canvasRef = useRef(null);
  const [generating, setGenerating] = useState(false);
  const [selectedSize, setSelectedSize] = useState("a6");
  const [previewUrl, setPreviewUrl] = useState(null);
  const getShareUrl = () => {
    return `${window.location.origin}/share/${businessId}`;
  };
  const getQrCodeUrl = (size = 400) => {
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
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = accentColor;
      ctx.fillRect(0, 0, canvas.width, 80);
      ctx.fillRect(0, canvas.height - 80, canvas.width, 80);
      const centerX = canvas.width / 2;
      const qrSize = Math.min(canvas.width * 0.5, canvas.height * 0.35);
      ctx.fillStyle = "#1f2937";
      ctx.font = `bold ${Math.floor(canvas.width * 0.04)}px system-ui`;
      ctx.textAlign = "center";
      ctx.fillText("📸 Deneyiminizi Paylaşın!", centerX, canvas.height * 0.15);
      ctx.font = `${Math.floor(canvas.width * 0.025)}px system-ui`;
      ctx.fillStyle = "#6b7280";
      ctx.fillText("QR kodu tarayın, story oluşturun", centerX, canvas.height * 0.2);
      const qrImg = new Image();
      qrImg.crossOrigin = "anonymous";
      await new Promise((resolve, reject) => {
        qrImg.onload = () => {
          const qrX = centerX - qrSize / 2;
          const qrY = canvas.height * 0.28;
          ctx.fillStyle = "#ffffff";
          ctx.beginPath();
          ctx.roundRect(qrX - 20, qrY - 20, qrSize + 40, qrSize + 40, 20);
          ctx.fill();
          ctx.strokeStyle = accentColor;
          ctx.lineWidth = 4;
          ctx.stroke();
          ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize);
          resolve();
        };
        qrImg.onerror = reject;
        qrImg.src = getQrCodeUrl(400);
      });
      ctx.fillStyle = accentColor;
      ctx.font = `bold ${Math.floor(canvas.width * 0.055)}px system-ui`;
      ctx.textAlign = "center";
      ctx.fillText(businessName, centerX, canvas.height * 0.72);
      if (tagline) {
        ctx.font = `${Math.floor(canvas.width * 0.028)}px system-ui`;
        ctx.fillStyle = "#6b7280";
        ctx.fillText(tagline, centerX, canvas.height * 0.78);
      }
      ctx.font = `${Math.floor(canvas.width * 0.022)}px system-ui`;
      ctx.fillStyle = "#9ca3af";
      ctx.fillText("Story'nizi paylaşırken bizi etiketlemeyi unutmayın! 🏷️", centerX, canvas.height * 0.88);
      ctx.font = `${Math.floor(canvas.width * 0.018)}px system-ui`;
      ctx.fillStyle = "#d1d5db";
      ctx.fillText("voyagerespond.com", centerX, canvas.height * 0.95);
      const dataUrl = canvas.toDataURL("image/png");
      setPreviewUrl(dataUrl);
      toast({
        title: "Masa standı hazır! 🎉",
        description: "Şimdi indirebilirsiniz."
      });
    } catch (error) {
      console.error("Error generating table stand:", error);
      toast({
        title: "Hata",
        description: "Tasarım oluşturulurken bir hata oluştu.",
        variant: "destructive"
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
      description: "Artık yazdırıp kullanabilirsiniz."
    });
  };
  return /* @__PURE__ */ jsxs(Card, { children: [
    /* @__PURE__ */ jsxs(CardHeader, { children: [
      /* @__PURE__ */ jsxs(CardTitle, { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsx(Printer, { className: "h-5 w-5" }),
        "Masa Standı / Tent Kart"
      ] }),
      /* @__PURE__ */ jsx(CardDescription, { children: "Yazdırıp masanıza koyabileceğiniz QR kodlu tasarım" })
    ] }),
    /* @__PURE__ */ jsxs(CardContent, { className: "space-y-6", children: [
      /* @__PURE__ */ jsx("canvas", { ref: canvasRef, className: "hidden" }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
        /* @__PURE__ */ jsx(Label, { children: "Boyut Seçin" }),
        /* @__PURE__ */ jsx(
          RadioGroup,
          {
            value: selectedSize,
            onValueChange: (v) => setSelectedSize(v),
            className: "flex flex-wrap gap-4",
            children: Object.entries(SIZES).map(([key, { label }]) => /* @__PURE__ */ jsxs("div", { className: "flex items-center space-x-2", children: [
              /* @__PURE__ */ jsx(RadioGroupItem, { value: key, id: key }),
              /* @__PURE__ */ jsx(Label, { htmlFor: key, className: "cursor-pointer", children: label })
            ] }, key))
          }
        )
      ] }),
      /* @__PURE__ */ jsx(
        Button,
        {
          onClick: generateTableStand,
          disabled: generating,
          className: "w-full",
          children: generating ? /* @__PURE__ */ jsxs(Fragment, { children: [
            /* @__PURE__ */ jsx(Loader2, { className: "h-4 w-4 mr-2 animate-spin" }),
            "Oluşturuluyor..."
          ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
            /* @__PURE__ */ jsx(Printer, { className: "h-4 w-4 mr-2" }),
            "Tasarım Oluştur"
          ] })
        }
      ),
      previewUrl && /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
        /* @__PURE__ */ jsx("div", { className: "border rounded-lg p-4 bg-muted/30", children: /* @__PURE__ */ jsx(
          "img",
          {
            src: previewUrl,
            alt: "Masa standı önizleme",
            className: "max-h-80 mx-auto rounded shadow-lg"
          }
        ) }),
        /* @__PURE__ */ jsxs(Button, { onClick: downloadImage, variant: "outline", className: "w-full", children: [
          /* @__PURE__ */ jsx(Download, { className: "h-4 w-4 mr-2" }),
          "PNG Olarak İndir"
        ] }),
        /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground text-center", children: "💡 İndirdikten sonra A4 kağıda yazdırıp kesin, veya doğrudan fotoğraf olarak bastırın" })
      ] })
    ] })
  ] });
}
function EmbedWidgetGenerator({
  businessName,
  businessId,
  accentColor
}) {
  const [widgetType, setWidgetType] = useState("button");
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
<\/script>`;
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
      case "button":
        return getButtonCode();
      case "popup":
        return getPopupCode();
      case "banner":
        return getBannerCode();
    }
  };
  const copyCode = () => {
    navigator.clipboard.writeText(getCode());
    setCopied(true);
    toast({
      title: "Kopyalandı!",
      description: "Kodu web sitenize yapıştırabilirsiniz."
    });
    setTimeout(() => setCopied(false), 2e3);
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
  return /* @__PURE__ */ jsxs(Card, { children: [
    /* @__PURE__ */ jsxs(CardHeader, { children: [
      /* @__PURE__ */ jsxs(CardTitle, { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsx(Code, { className: "h-5 w-5" }),
        "Website Widget"
      ] }),
      /* @__PURE__ */ jsx(CardDescription, { children: "Web sitenize ekleyebileceğiniz Story Kit butonu veya popup" })
    ] }),
    /* @__PURE__ */ jsxs(CardContent, { className: "space-y-6", children: [
      /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
        /* @__PURE__ */ jsx(Label, { children: "Widget Tipi" }),
        /* @__PURE__ */ jsxs(
          RadioGroup,
          {
            value: widgetType,
            onValueChange: (v) => setWidgetType(v),
            className: "grid grid-cols-3 gap-4",
            children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center space-x-2", children: [
                /* @__PURE__ */ jsx(RadioGroupItem, { value: "button", id: "button" }),
                /* @__PURE__ */ jsx(Label, { htmlFor: "button", className: "cursor-pointer", children: "Buton" })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "flex items-center space-x-2", children: [
                /* @__PURE__ */ jsx(RadioGroupItem, { value: "popup", id: "popup" }),
                /* @__PURE__ */ jsx(Label, { htmlFor: "popup", className: "cursor-pointer", children: "Popup" })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "flex items-center space-x-2", children: [
                /* @__PURE__ */ jsx(RadioGroupItem, { value: "banner", id: "banner" }),
                /* @__PURE__ */ jsx(Label, { htmlFor: "banner", className: "cursor-pointer", children: "Banner" })
              ] })
            ]
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsx(Label, { htmlFor: "buttonText", children: "Buton Metni" }),
        /* @__PURE__ */ jsx(
          Input,
          {
            id: "buttonText",
            value: buttonText,
            onChange: (e) => setButtonText(e.target.value),
            placeholder: "📸 Story Oluştur"
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsx(Label, { children: "Embed Kodu" }),
        /* @__PURE__ */ jsx(
          Textarea,
          {
            value: getCode(),
            readOnly: true,
            className: "font-mono text-xs h-48 bg-muted/50"
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
        /* @__PURE__ */ jsx(Button, { onClick: copyCode, className: "flex-1", children: copied ? /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsx(CheckCircle, { className: "h-4 w-4 mr-2" }),
          "Kopyalandı!"
        ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsx(Copy, { className: "h-4 w-4 mr-2" }),
          "Kodu Kopyala"
        ] }) }),
        /* @__PURE__ */ jsxs(Button, { onClick: previewWidget, variant: "outline", children: [
          /* @__PURE__ */ jsx(ExternalLink, { className: "h-4 w-4 mr-2" }),
          "Önizle"
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "text-sm text-muted-foreground space-y-2 p-4 bg-muted/30 rounded-lg", children: [
        /* @__PURE__ */ jsx("p", { className: "font-medium", children: "Nasıl Kullanılır:" }),
        /* @__PURE__ */ jsxs("ol", { className: "list-decimal list-inside space-y-1 text-xs", children: [
          /* @__PURE__ */ jsx("li", { children: "Yukarıdaki kodu kopyalayın" }),
          /* @__PURE__ */ jsx("li", { children: "Web sitenizin HTML'ine yapıştırın" }),
          /* @__PURE__ */ jsx("li", { children: widgetType === "popup" ? "Popup otomatik olarak sağ alt köşede görünecek" : widgetType === "banner" ? "Banner istediğiniz yere eklenecek" : "Buton istediğiniz yere eklenecek" })
        ] })
      ] })
    ] })
  ] });
}
function StoryKitSettings() {
  const { activeBusiness } = useBusiness();
  const [template, setTemplate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [stats, setStats] = useState({ total: 0, today: 0, thisWeek: 0 });
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
      const { data, error } = await supabase.from("story_kit_templates").select("*").eq("business_id", activeBusiness.id).maybeSingle();
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
      const now = /* @__PURE__ */ new Date();
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
      const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1e3).toISOString();
      const { count: total } = await supabase.from("story_kit_shares").select("*", { count: "exact", head: true }).eq("business_id", activeBusiness.id);
      const { count: today } = await supabase.from("story_kit_shares").select("*", { count: "exact", head: true }).eq("business_id", activeBusiness.id).gte("downloaded_at", todayStart);
      const { count: thisWeek } = await supabase.from("story_kit_shares").select("*", { count: "exact", head: true }).eq("business_id", activeBusiness.id).gte("downloaded_at", weekStart);
      setStats({
        total: total || 0,
        today: today || 0,
        thisWeek: thisWeek || 0
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
        qr_code_enabled: qrEnabled
      };
      if (template) {
        const { error } = await supabase.from("story_kit_templates").update(templateData).eq("id", template.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("story_kit_templates").insert(templateData);
        if (error) throw error;
      }
      toast({
        title: "Kaydedildi",
        description: "Story Kit ayarları güncellendi."
      });
      fetchTemplate();
    } catch (error) {
      console.error("Error saving template:", error);
      toast({
        title: "Hata",
        description: "Ayarlar kaydedilirken bir hata oluştu.",
        variant: "destructive"
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
      description: "Link panoya kopyalandı."
    });
  };
  const getQrCodeUrl = () => {
    const shareUrl = encodeURIComponent(getShareUrl());
    return `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${shareUrl}`;
  };
  if (!activeBusiness) {
    return /* @__PURE__ */ jsx(AppLayout, { children: /* @__PURE__ */ jsx("div", { className: "p-8", children: /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsx(CardContent, { className: "pt-6 text-center", children: /* @__PURE__ */ jsx("p", { className: "text-muted-foreground", children: "Lütfen önce bir işletme seçin." }) }) }) }) });
  }
  return /* @__PURE__ */ jsx(AppLayout, { children: /* @__PURE__ */ jsxs("div", { className: "p-8 space-y-6", children: [
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mb-2", children: [
        /* @__PURE__ */ jsx(Instagram, { className: "h-8 w-8 text-primary" }),
        /* @__PURE__ */ jsx("h1", { className: "text-3xl font-semibold text-foreground", children: "Story Kit" }),
        /* @__PURE__ */ jsx(Badge, { variant: "secondary", children: "Beta" })
      ] }),
      /* @__PURE__ */ jsx("p", { className: "text-muted-foreground", children: "Müşterilerinizin Instagram Story'lerinde işletmenizi paylaşmasını sağlayın" })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4", children: [
      /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsx(CardContent, { className: "pt-6", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: "Toplam Paylaşım" }),
          /* @__PURE__ */ jsx("p", { className: "text-3xl font-bold", children: stats.total })
        ] }),
        /* @__PURE__ */ jsx(BarChart3, { className: "h-8 w-8 text-primary opacity-50" })
      ] }) }) }),
      /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsx(CardContent, { className: "pt-6", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: "Bugün" }),
          /* @__PURE__ */ jsx("p", { className: "text-3xl font-bold", children: stats.today })
        ] }),
        /* @__PURE__ */ jsx(Download, { className: "h-8 w-8 text-green-500 opacity-50" })
      ] }) }) }),
      /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsx(CardContent, { className: "pt-6", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: "Bu Hafta" }),
          /* @__PURE__ */ jsx("p", { className: "text-3xl font-bold", children: stats.thisWeek })
        ] }),
        /* @__PURE__ */ jsx(Instagram, { className: "h-8 w-8 text-pink-500 opacity-50" })
      ] }) }) })
    ] }),
    /* @__PURE__ */ jsxs(Tabs, { defaultValue: "share", className: "space-y-6", children: [
      /* @__PURE__ */ jsxs(TabsList, { className: "flex-wrap", children: [
        /* @__PURE__ */ jsx(TabsTrigger, { value: "share", children: "Paylaşım" }),
        /* @__PURE__ */ jsx(TabsTrigger, { value: "materials", children: "Materyaller" }),
        /* @__PURE__ */ jsx(TabsTrigger, { value: "design", children: "Tasarım" }),
        /* @__PURE__ */ jsx(TabsTrigger, { value: "settings", children: "Ayarlar" })
      ] }),
      /* @__PURE__ */ jsx(TabsContent, { value: "share", className: "space-y-6", children: /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [
        /* @__PURE__ */ jsxs(Card, { children: [
          /* @__PURE__ */ jsxs(CardHeader, { children: [
            /* @__PURE__ */ jsxs(CardTitle, { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsx(QrCode, { className: "h-5 w-5" }),
              "QR Kod"
            ] }),
            /* @__PURE__ */ jsx(CardDescription, { children: "Masanıza veya kasanıza koyun, müşteriler taratsın" })
          ] }),
          /* @__PURE__ */ jsxs(CardContent, { className: "flex flex-col items-center gap-4", children: [
            /* @__PURE__ */ jsx("div", { className: "p-4 bg-white rounded-xl shadow-inner", children: /* @__PURE__ */ jsx(
              "img",
              {
                src: getQrCodeUrl(),
                alt: "QR Code",
                className: "w-48 h-48"
              }
            ) }),
            /* @__PURE__ */ jsx(Button, { variant: "outline", asChild: true, children: /* @__PURE__ */ jsxs("a", { href: getQrCodeUrl(), download: "story-kit-qr.png", children: [
              /* @__PURE__ */ jsx(Download, { className: "h-4 w-4 mr-2" }),
              "QR Kodu İndir"
            ] }) })
          ] })
        ] }),
        /* @__PURE__ */ jsxs(Card, { children: [
          /* @__PURE__ */ jsxs(CardHeader, { children: [
            /* @__PURE__ */ jsxs(CardTitle, { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsx(Link, { className: "h-5 w-5" }),
              "Paylaşım Linki"
            ] }),
            /* @__PURE__ */ jsx(CardDescription, { children: "Bu linki sosyal medyada veya web sitenizde paylaşın" })
          ] }),
          /* @__PURE__ */ jsxs(CardContent, { className: "space-y-4", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
              /* @__PURE__ */ jsx(Input, { value: getShareUrl(), readOnly: true, className: "font-mono text-sm" }),
              /* @__PURE__ */ jsx(Button, { variant: "outline", onClick: copyLink, children: /* @__PURE__ */ jsx(Copy, { className: "h-4 w-4" }) })
            ] }),
            /* @__PURE__ */ jsx(Button, { variant: "outline", className: "w-full", asChild: true, children: /* @__PURE__ */ jsxs("a", { href: getShareUrl(), target: "_blank", rel: "noopener noreferrer", children: [
              /* @__PURE__ */ jsx(Eye, { className: "h-4 w-4 mr-2" }),
              "Önizleme"
            ] }) })
          ] })
        ] })
      ] }) }),
      /* @__PURE__ */ jsx(TabsContent, { value: "materials", className: "space-y-6", children: /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6", children: [
        /* @__PURE__ */ jsx(
          TableStandGenerator,
          {
            businessName: activeBusiness.name,
            businessId: activeBusiness.id,
            accentColor,
            tagline
          }
        ),
        /* @__PURE__ */ jsx(
          EmbedWidgetGenerator,
          {
            businessName: activeBusiness.name,
            businessId: activeBusiness.id,
            accentColor
          }
        )
      ] }) }),
      /* @__PURE__ */ jsx(TabsContent, { value: "design", className: "space-y-6", children: /* @__PURE__ */ jsxs(Card, { children: [
        /* @__PURE__ */ jsxs(CardHeader, { children: [
          /* @__PURE__ */ jsxs(CardTitle, { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsx(Palette, { className: "h-5 w-5" }),
            "Görsel Ayarları"
          ] }),
          /* @__PURE__ */ jsx(CardDescription, { children: "Story görselinin renklerini markanıza uygun hale getirin" })
        ] }),
        /* @__PURE__ */ jsxs(CardContent, { className: "space-y-6", children: [
          /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4", children: [
            /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsx(Label, { htmlFor: "bgColor", children: "Arka Plan Rengi" }),
              /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
                /* @__PURE__ */ jsx(
                  Input,
                  {
                    id: "bgColor",
                    type: "color",
                    value: backgroundColor,
                    onChange: (e) => setBackgroundColor(e.target.value),
                    className: "w-12 h-10 p-1 cursor-pointer"
                  }
                ),
                /* @__PURE__ */ jsx(
                  Input,
                  {
                    value: backgroundColor,
                    onChange: (e) => setBackgroundColor(e.target.value),
                    className: "flex-1 font-mono"
                  }
                )
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsx(Label, { htmlFor: "textColor", children: "Yazı Rengi" }),
              /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
                /* @__PURE__ */ jsx(
                  Input,
                  {
                    id: "textColor",
                    type: "color",
                    value: textColor,
                    onChange: (e) => setTextColor(e.target.value),
                    className: "w-12 h-10 p-1 cursor-pointer"
                  }
                ),
                /* @__PURE__ */ jsx(
                  Input,
                  {
                    value: textColor,
                    onChange: (e) => setTextColor(e.target.value),
                    className: "flex-1 font-mono"
                  }
                )
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsx(Label, { htmlFor: "accentColor", children: "Vurgu Rengi" }),
              /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
                /* @__PURE__ */ jsx(
                  Input,
                  {
                    id: "accentColor",
                    type: "color",
                    value: accentColor,
                    onChange: (e) => setAccentColor(e.target.value),
                    className: "w-12 h-10 p-1 cursor-pointer"
                  }
                ),
                /* @__PURE__ */ jsx(
                  Input,
                  {
                    value: accentColor,
                    onChange: (e) => setAccentColor(e.target.value),
                    className: "flex-1 font-mono"
                  }
                )
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsx(Label, { htmlFor: "tagline", children: "Slogan / Alt Başlık" }),
            /* @__PURE__ */ jsx(
              Input,
              {
                id: "tagline",
                placeholder: "En lezzetli kahveler burada!",
                value: tagline,
                onChange: (e) => setTagline(e.target.value)
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsx(Label, { htmlFor: "placeholder", children: "Mesaj Placeholder'ı" }),
            /* @__PURE__ */ jsx(
              Input,
              {
                id: "placeholder",
                placeholder: "Harika bir deneyimdi...",
                value: placeholder,
                onChange: (e) => setPlaceholder(e.target.value)
              }
            ),
            /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: "Müşteri mesaj yazmaya başlamadan önce göreceği örnek metin" })
          ] })
        ] })
      ] }) }),
      /* @__PURE__ */ jsx(TabsContent, { value: "settings", className: "space-y-6", children: /* @__PURE__ */ jsxs(Card, { children: [
        /* @__PURE__ */ jsx(CardHeader, { children: /* @__PURE__ */ jsxs(CardTitle, { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsx(Hash, { className: "h-5 w-5" }),
          "Hashtag & Diğer Ayarlar"
        ] }) }),
        /* @__PURE__ */ jsxs(CardContent, { className: "space-y-6", children: [
          /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsx(Label, { htmlFor: "hashtag", children: "İşletme Hashtag'i" }),
            /* @__PURE__ */ jsx(
              Input,
              {
                id: "hashtag",
                placeholder: "#kafeadi",
                value: hashtag,
                onChange: (e) => setHashtag(e.target.value)
              }
            ),
            /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: "Story'de görünecek hashtag (# ile başlayın)" })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between p-4 border rounded-lg", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("p", { className: "font-medium", children: "Story Kit Aktif" }),
              /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: "Kapatırsanız müşteriler story oluşturamaz" })
            ] }),
            /* @__PURE__ */ jsx(
              Switch,
              {
                checked: isActive,
                onCheckedChange: setIsActive
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between p-4 border rounded-lg", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("p", { className: "font-medium", children: "QR Kod" }),
              /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: "QR kod indirme özelliğini etkinleştir" })
            ] }),
            /* @__PURE__ */ jsx(
              Switch,
              {
                checked: qrEnabled,
                onCheckedChange: setQrEnabled
              }
            )
          ] })
        ] })
      ] }) })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "flex justify-end", children: /* @__PURE__ */ jsx(Button, { onClick: saveTemplate, disabled: saving, size: "lg", children: saving ? /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsx(Loader2, { className: "h-4 w-4 mr-2 animate-spin" }),
      "Kaydediliyor..."
    ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsx(CheckCircle, { className: "h-4 w-4 mr-2" }),
      "Değişiklikleri Kaydet"
    ] }) }) })
  ] }) });
}
export {
  StoryKitSettings as default
};
