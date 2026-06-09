import { jsx, jsxs, Fragment } from "react/jsx-runtime";
import { useState, useRef, useEffect } from "react";
import { useParams } from "react-router-dom";
import { s as supabase, t as toast, m as Badge, B as Button } from "../main.mjs";
import { T as Textarea } from "./textarea-BbAnJDWe.js";
import { C as Card, c as CardContent } from "./card-vx9BCW0t.js";
import { Loader2, MapPin, Instagram, ImagePlus, X, Share2, Download } from "lucide-react";
import "vite-react-ssg";
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
function StoryKit() {
  const { businessSlug } = useParams();
  const [template, setTemplate] = useState(null);
  const [business, setBusiness] = useState(null);
  const [customerMessage, setCustomerMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [uploadedImage, setUploadedImage] = useState(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const handleImageUpload = (event) => {
    var _a;
    const file = (_a = event.target.files) == null ? void 0 : _a[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "Dosya çok büyük",
          description: "Maksimum 10MB boyutunda dosya yükleyebilirsiniz.",
          variant: "destructive"
        });
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        var _a2;
        setUploadedImage((_a2 = e.target) == null ? void 0 : _a2.result);
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
  useEffect(() => {
    fetchTemplateAndBusiness();
  }, [businessSlug]);
  const fetchTemplateAndBusiness = async () => {
    if (!businessSlug) return;
    try {
      const { data: businessData, error: businessError } = await supabase.from("businesses").select("id, name").eq("id", businessSlug).single();
      if (businessError || !businessData) {
        toast({
          title: "İşletme bulunamadı",
          description: "Bu bağlantı geçersiz olabilir.",
          variant: "destructive"
        });
        setLoading(false);
        return;
      }
      setBusiness(businessData);
      const { data: templateData, error: templateError } = await supabase.from("story_kit_templates").select("*").eq("business_id", businessData.id).eq("is_active", true).maybeSingle();
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
      canvas.width = 1080;
      canvas.height = 1920;
      const bgColor = (template == null ? void 0 : template.background_color) || "#ffffff";
      const textColor = (template == null ? void 0 : template.text_color) || "#000000";
      const accentColor = (template == null ? void 0 : template.accent_color) || "#8b5cf6";
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, "rgba(255,255,255,0.1)");
      gradient.addColorStop(1, "rgba(0,0,0,0.05)");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      const message = customerMessage || "Harika bir deneyimdi! 🎉";
      if (uploadedImage) {
        const img = new Image();
        img.crossOrigin = "anonymous";
        await new Promise((resolve, reject) => {
          img.onload = () => {
            const imgX = 140;
            const imgY = 100;
            const imgWidth = 800;
            const imgHeight = 600;
            const radius = 30;
            ctx.save();
            ctx.beginPath();
            ctx.roundRect(imgX, imgY, imgWidth, imgHeight, radius);
            ctx.clip();
            const scale = Math.max(imgWidth / img.width, imgHeight / img.height);
            const scaledWidth = img.width * scale;
            const scaledHeight = img.height * scale;
            const offsetX = imgX + (imgWidth - scaledWidth) / 2;
            const offsetY = imgY + (imgHeight - scaledHeight) / 2;
            ctx.drawImage(img, offsetX, offsetY, scaledWidth, scaledHeight);
            ctx.restore();
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
        ctx.fillStyle = accentColor;
        ctx.beginPath();
        ctx.roundRect(340, 650, 400, 80, 40);
        ctx.fill();
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 40px system-ui";
        ctx.textAlign = "center";
        ctx.fillText(business.name, 540, 702);
        ctx.fillStyle = accentColor + "15";
        ctx.beginPath();
        ctx.roundRect(100, 780, 880, 350, 30);
        ctx.fill();
        ctx.strokeStyle = accentColor + "40";
        ctx.lineWidth = 3;
        ctx.stroke();
        ctx.fillStyle = accentColor;
        ctx.font = "bold 100px Georgia";
        ctx.fillText('"', 150, 870);
        ctx.fillStyle = textColor;
        ctx.font = "34px system-ui";
        ctx.textAlign = "left";
        const words = message.split(" ");
        let line = "";
        let y = 900;
        const maxWidth = 700;
        const lineHeight = 46;
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
        ctx.font = "44px system-ui";
        ctx.textAlign = "center";
        ctx.fillText("⭐⭐⭐⭐⭐", 540, 1240);
        if (template == null ? void 0 : template.hashtag) {
          ctx.fillStyle = accentColor;
          ctx.font = "bold 40px system-ui";
          ctx.fillText(template.hashtag, 540, 1340);
        }
      } else {
        ctx.fillStyle = accentColor;
        ctx.beginPath();
        ctx.arc(540, 400, 60, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 48px system-ui";
        ctx.textAlign = "center";
        ctx.fillText("📍", 540, 420);
        ctx.fillStyle = textColor;
        ctx.font = "bold 64px system-ui";
        ctx.fillText(business.name, 540, 550);
        if (template == null ? void 0 : template.tagline) {
          ctx.font = "32px system-ui";
          ctx.fillStyle = textColor + "99";
          ctx.fillText(template.tagline, 540, 620);
        }
        ctx.font = "48px system-ui";
        ctx.fillText("⭐⭐⭐⭐⭐", 540, 720);
        ctx.fillStyle = accentColor + "15";
        ctx.beginPath();
        ctx.roundRect(100, 820, 880, 400, 30);
        ctx.fill();
        ctx.strokeStyle = accentColor + "40";
        ctx.lineWidth = 3;
        ctx.stroke();
        ctx.fillStyle = accentColor;
        ctx.font = "bold 120px Georgia";
        ctx.fillText('"', 150, 920);
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
        if (template == null ? void 0 : template.hashtag) {
          ctx.fillStyle = accentColor;
          ctx.font = "bold 42px system-ui";
          ctx.textAlign = "center";
          ctx.fillText(template.hashtag, 540, 1400);
        }
      }
      ctx.fillStyle = textColor + "60";
      ctx.font = "24px system-ui";
      ctx.textAlign = "center";
      ctx.fillText("Voyagerespond ile oluşturuldu", 540, 1800);
      const dataUrl = canvas.toDataURL("image/png");
      setPreviewUrl(dataUrl);
      if (template) {
        await supabase.from("story_kit_shares").insert({
          template_id: template.id,
          business_id: business.id,
          customer_message: customerMessage,
          platform: "instagram"
        });
      }
      toast({
        title: "Story hazır! 🎉",
        description: "Şimdi indirebilir ve Instagram'da paylaşabilirsiniz."
      });
    } catch (error) {
      console.error("Error generating story:", error);
      toast({
        title: "Hata",
        description: "Story oluşturulurken bir hata oluştu.",
        variant: "destructive"
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
      description: "Story'nizi Instagram'da paylaşın."
    });
  };
  if (loading) {
    return /* @__PURE__ */ jsx("div", { className: "min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50", children: /* @__PURE__ */ jsx(Loader2, { className: "h-8 w-8 animate-spin text-primary" }) });
  }
  if (!business) {
    return /* @__PURE__ */ jsx("div", { className: "min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50", children: /* @__PURE__ */ jsx(Card, { className: "max-w-md mx-4", children: /* @__PURE__ */ jsxs(CardContent, { className: "pt-6 text-center", children: [
      /* @__PURE__ */ jsx(MapPin, { className: "h-12 w-12 mx-auto text-muted-foreground mb-4" }),
      /* @__PURE__ */ jsx("h2", { className: "text-xl font-semibold mb-2", children: "İşletme Bulunamadı" }),
      /* @__PURE__ */ jsx("p", { className: "text-muted-foreground", children: "Bu bağlantı geçersiz olabilir. Lütfen işletmeden yeni bir QR kod veya link isteyin." })
    ] }) }) });
  }
  return /* @__PURE__ */ jsxs("div", { className: "min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50", children: [
    /* @__PURE__ */ jsx("canvas", { ref: canvasRef, className: "hidden" }),
    /* @__PURE__ */ jsxs("div", { className: "container max-w-lg mx-auto px-4 py-8", children: [
      /* @__PURE__ */ jsxs("div", { className: "text-center mb-8", children: [
        /* @__PURE__ */ jsxs(Badge, { className: "mb-4 bg-gradient-to-r from-purple-500 to-pink-500", children: [
          /* @__PURE__ */ jsx(Instagram, { className: "h-3 w-3 mr-1" }),
          "Instagram Story"
        ] }),
        /* @__PURE__ */ jsxs("h1", { className: "text-2xl font-bold text-gray-900 mb-2", children: [
          business.name,
          "'da mıydınız?"
        ] }),
        /* @__PURE__ */ jsx("p", { className: "text-gray-600", children: "Deneyiminizi paylaşın, indirin ve Instagram Story'nize ekleyin!" })
      ] }),
      /* @__PURE__ */ jsx(Card, { className: "mb-4 shadow-lg border-0 bg-white/80 backdrop-blur", children: /* @__PURE__ */ jsxs(CardContent, { className: "pt-6", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mb-3", children: [
          /* @__PURE__ */ jsx(ImagePlus, { className: "h-4 w-4 text-purple-500" }),
          /* @__PURE__ */ jsx("label", { className: "text-sm font-medium text-gray-700", children: "Fotoğraf Ekle (Opsiyonel) 📸" })
        ] }),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "file",
            ref: fileInputRef,
            onChange: handleImageUpload,
            accept: "image/*",
            className: "hidden"
          }
        ),
        uploadedImage ? /* @__PURE__ */ jsxs("div", { className: "relative", children: [
          /* @__PURE__ */ jsx(
            "img",
            {
              src: uploadedImage,
              alt: "Yüklenen fotoğraf",
              className: "w-full h-40 object-cover rounded-xl"
            }
          ),
          /* @__PURE__ */ jsx(
            Button,
            {
              variant: "destructive",
              size: "icon",
              className: "absolute top-2 right-2 h-8 w-8 rounded-full",
              onClick: removeImage,
              children: /* @__PURE__ */ jsx(X, { className: "h-4 w-4" })
            }
          )
        ] }) : /* @__PURE__ */ jsxs(
          Button,
          {
            variant: "outline",
            className: "w-full h-28 border-dashed border-2 border-purple-200 flex flex-col gap-2 hover:border-purple-400 hover:bg-purple-50",
            onClick: () => {
              var _a;
              return (_a = fileInputRef.current) == null ? void 0 : _a.click();
            },
            children: [
              /* @__PURE__ */ jsx(ImagePlus, { className: "h-8 w-8 text-purple-400" }),
              /* @__PURE__ */ jsx("span", { className: "text-sm text-gray-500", children: "Yemek, mekan veya anı fotoğrafı" })
            ]
          }
        )
      ] }) }),
      /* @__PURE__ */ jsx(Card, { className: "mb-6 shadow-lg border-0 bg-white/80 backdrop-blur", children: /* @__PURE__ */ jsxs(CardContent, { className: "pt-6", children: [
        /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Deneyiminizi yazın ✨" }),
        /* @__PURE__ */ jsx(
          Textarea,
          {
            placeholder: (template == null ? void 0 : template.custom_message_placeholder) || "Harika bir deneyimdi! Herkese tavsiye ederim...",
            value: customerMessage,
            onChange: (e) => setCustomerMessage(e.target.value),
            className: "min-h-[100px] resize-none border-gray-200 focus:border-purple-300",
            maxLength: 200
          }
        ),
        /* @__PURE__ */ jsxs("p", { className: "text-xs text-gray-400 mt-2 text-right", children: [
          customerMessage.length,
          "/200"
        ] })
      ] }) }),
      /* @__PURE__ */ jsx(
        Button,
        {
          onClick: generateStoryImage,
          disabled: generating,
          className: "w-full h-14 text-lg bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 shadow-lg",
          children: generating ? /* @__PURE__ */ jsxs(Fragment, { children: [
            /* @__PURE__ */ jsx(Loader2, { className: "h-5 w-5 mr-2 animate-spin" }),
            "Oluşturuluyor..."
          ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
            /* @__PURE__ */ jsx(Share2, { className: "h-5 w-5 mr-2" }),
            "Story Oluştur"
          ] })
        }
      ),
      previewUrl && /* @__PURE__ */ jsxs("div", { className: "mt-8 space-y-4", children: [
        /* @__PURE__ */ jsx("h3", { className: "text-center font-medium text-gray-700", children: "Önizleme" }),
        /* @__PURE__ */ jsx("div", { className: "relative aspect-[9/16] max-w-xs mx-auto rounded-2xl overflow-hidden shadow-2xl", children: /* @__PURE__ */ jsx(
          "img",
          {
            src: previewUrl,
            alt: "Story preview",
            className: "w-full h-full object-cover"
          }
        ) }),
        /* @__PURE__ */ jsxs(
          Button,
          {
            onClick: downloadImage,
            variant: "outline",
            className: "w-full h-12 border-2",
            children: [
              /* @__PURE__ */ jsx(Download, { className: "h-5 w-5 mr-2" }),
              "Story'yi İndir"
            ]
          }
        ),
        /* @__PURE__ */ jsx("p", { className: "text-center text-sm text-gray-500", children: "İndirdikten sonra Instagram'da Story olarak paylaşın! 📱" })
      ] }),
      (template == null ? void 0 : template.hashtag) && /* @__PURE__ */ jsxs("div", { className: "mt-6 text-center", children: [
        /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-500", children: "Paylaşırken şu hashtag'i kullanmayı unutmayın:" }),
        /* @__PURE__ */ jsx(Badge, { variant: "secondary", className: "mt-2 text-base", children: template.hashtag })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "mt-12 text-center text-xs text-gray-400", children: /* @__PURE__ */ jsx("p", { children: "Powered by Voyagerespond" }) })
    ] })
  ] });
}
export {
  StoryKit as default
};
