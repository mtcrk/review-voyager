import { jsxs, jsx } from "react/jsx-runtime";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, X, Menu, Sparkles, Shield, Users, Zap, Star, RotateCcw, Check, Copy } from "lucide-react";
import { u as useAuth, B as Button, s as supabase } from "../main.mjs";
import { T as Textarea } from "./textarea-BbAnJDWe.js";
import { v as voyageRespondLogo } from "./voyage-respond-logo-C1G06huv.js";
import { L as LanguageSwitcher } from "./LanguageSwitcher-CkCZi_79.js";
import { toast } from "sonner";
import { S as SEO } from "./SEO-CentcBuw.js";
import "vite-react-ssg";
import "@radix-ui/react-toast";
import "class-variance-authority";
import "clsx";
import "tailwind-merge";
import "next-themes";
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
import "react-helmet-async";
const gtagEvent = (eventName, category, label) => {
  if (typeof window.gtag === "function") {
    window.gtag("event", eventName, {
      event_category: category,
      event_label: label
    });
  }
};
const TONES = [
  { id: "friendly", label: "Samimi", emoji: "😊" },
  { id: "formal", label: "Resmi", emoji: "👔" },
  { id: "empathetic", label: "Empatik", emoji: "🤝" },
  { id: "grateful", label: "Minnettar", emoji: "🙏" },
  { id: "apologetic", label: "Özür Dileyen", emoji: "💐" },
  { id: "enthusiastic", label: "Heyecanlı", emoji: "🎉" }
];
const SAMPLE_REVIEWS = [
  { text: "Yemekler çok lezzetliydi, personel ilgiliydi ama bekleme süresi biraz uzundu.", rating: 4, name: "Ayşe K." },
  { text: "Oda temiz değildi, klima çalışmıyordu. Çok hayal kırıklığına uğradık.", rating: 1, name: "Mehmet Y." },
  { text: "Harika bir deneyimdi! Kesinlikle tekrar geleceğiz. Herkese tavsiye ederiz.", rating: 5, name: "Elif D." },
  { text: "Kahvaltı çeşitleri yeterli değildi, ama manzara muhteşemdi.", rating: 3, name: "Ali R." },
  { text: "Check-in sırasında 40 dakika bekledik. Kabul edilemez.", rating: 2, name: "Selin T." },
  { text: "Spa hizmeti harikaydı, masaj çok profesyoneldi. Teşekkürler!", rating: 5, name: "Deniz A." },
  { text: "Gürültülü bir oda verdiler, uyuyamadık. Şikayet ettik ama çözüm sunulmadı.", rating: 1, name: "Burak M." },
  { text: "Fiyat/performans oranı gayet iyi. Temiz, düzenli ve güler yüzlü personel.", rating: 4, name: "Zeynep Ç." },
  { text: "Akşam yemeğinde servis çok yavaştı ama yemekler lezzetliydi.", rating: 3, name: "Hakan S." },
  { text: "Çocuklu aileler için mükemmel! Çocuk kulübü ve havuz çok iyiydi.", rating: 5, name: "Fatma B." },
  { text: "WiFi sürekli kopuyordu, iş seyahati için uygun değil.", rating: 2, name: "Emre K." },
  { text: "Personel çok ilgiliydi, özellikle resepsiyon görevlisi Ahmet Bey'e teşekkürler.", rating: 5, name: "Merve Y." },
  { text: "Havuz alanı çok kalabalıktı, şezlong bulmak imkansızdı.", rating: 2, name: "Oğuz D." },
  { text: "Restoranda vegan seçenekler çok kısıtlıydı. Geliştirilmeli.", rating: 3, name: "Canan E." },
  { text: "Her şey mükemmeldi! 3. gelişimiz ve her seferinde aynı kalite. Bravo!", rating: 5, name: "Kemal Ö." }
];
function DemoPage() {
  var _a, _b;
  const navigate = useNavigate();
  const { user } = useAuth();
  const [reviewText, setReviewText] = useState("");
  const [reviewerName, setReviewerName] = useState("");
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [selectedTone, setSelectedTone] = useState("friendly");
  const [generatedReply, setGeneratedReply] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(false);
  const canGenerate = reviewText.trim().length > 10 && rating > 0;
  const handleGenerate = async () => {
    var _a2;
    if (!canGenerate) return;
    setLoading(true);
    setGeneratedReply("");
    const toneName = ((_a2 = TONES.find((t) => t.id === selectedTone)) == null ? void 0 : _a2.label) || selectedTone;
    gtagEvent("generate_reply", "demo", toneName);
    try {
      const { data, error } = await supabase.functions.invoke("generate-reply", {
        body: {
          review_text: reviewText.trim(),
          reviewer_name: reviewerName.trim() || void 0,
          rating,
          tone: selectedTone,
          language: "auto",
          business_name: "Demo İşletme"
        }
      });
      if (error) throw error;
      setGeneratedReply(data.reply);
      setHasGenerated(true);
    } catch {
      toast.error("Yanıt oluşturulurken bir hata oluştu. Lütfen tekrar deneyin.");
    } finally {
      setLoading(false);
    }
  };
  const handleCopy = () => {
    var _a2;
    navigator.clipboard.writeText(generatedReply);
    setCopied(true);
    toast.success("Yanıt panoya kopyalandı!");
    const toneName = ((_a2 = TONES.find((t) => t.id === selectedTone)) == null ? void 0 : _a2.label) || selectedTone;
    gtagEvent("copy_reply", "demo", toneName);
    setTimeout(() => setCopied(false), 2e3);
  };
  const handleSampleReview = (sample) => {
    setReviewText(sample.text);
    setRating(sample.rating);
    setReviewerName(sample.name);
    setGeneratedReply("");
    gtagEvent("click_example_review", "demo", sample.name);
  };
  const handleToneSelect = (toneId) => {
    var _a2;
    setSelectedTone(toneId);
    const toneName = ((_a2 = TONES.find((t) => t.id === toneId)) == null ? void 0 : _a2.label) || toneId;
    gtagEvent("change_tone", "demo", toneName);
  };
  const handleCTAClick = (label) => {
    gtagEvent("cta_click", "conversion", label);
    navigate(user ? "/dashboard" : "/register");
  };
  const handleReset = () => {
    setReviewText("");
    setReviewerName("");
    setRating(0);
    setSelectedTone("friendly");
    setGeneratedReply("");
  };
  return /* @__PURE__ */ jsxs("div", { className: "min-h-screen bg-background", children: [
    /* @__PURE__ */ jsx(
      SEO,
      {
        title: "AI Yorum Yanıt Demo | Ücretsiz Dene | VoyageRespond",
        description: "VoyageRespond AI yorum yanıt aracını kayıt olmadan deneyin. Olumlu ve olumsuz yorumlar için saniyeler içinde profesyonel yanıtlar üretin.",
        canonical: "/demo"
      }
    ),
    /* @__PURE__ */ jsx("nav", { className: "sticky top-0 z-50 border-b border-border/60 backdrop-blur-xl bg-background/80", children: /* @__PURE__ */ jsxs("div", { className: "container mx-auto px-4 sm:px-6", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex h-16 items-center justify-between", children: [
        /* @__PURE__ */ jsxs("button", { onClick: () => navigate("/"), className: "flex items-center gap-2.5 hover:opacity-80 transition-opacity", children: [
          /* @__PURE__ */ jsx("img", { src: voyageRespondLogo, alt: "VoyageRespond", className: "h-7 w-7" }),
          /* @__PURE__ */ jsxs("span", { className: "text-base tracking-tight text-foreground", children: [
            /* @__PURE__ */ jsx("span", { className: "font-normal", children: "Voyage" }),
            /* @__PURE__ */ jsx("span", { className: "font-semibold", children: "Respond" })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "hidden md:flex items-center gap-4", children: [
          /* @__PURE__ */ jsx(LanguageSwitcher, {}),
          /* @__PURE__ */ jsx(Button, { variant: "ghost", size: "sm", onClick: () => navigate("/"), children: "Ana Sayfa" }),
          /* @__PURE__ */ jsxs(
            Button,
            {
              size: "sm",
              onClick: () => handleCTAClick("header_free_trial"),
              className: "bg-primary text-primary-foreground hover:bg-primary/90",
              children: [
                user ? "Dashboard" : "Ücretsiz Başla",
                /* @__PURE__ */ jsx(ArrowRight, { className: "w-4 h-4 ml-1" })
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsx(
          "button",
          {
            className: "md:hidden p-2",
            onClick: () => setMobileMenuOpen(!mobileMenuOpen),
            "aria-label": mobileMenuOpen ? "Menüyü kapat" : "Menüyü aç",
            "aria-expanded": mobileMenuOpen,
            children: mobileMenuOpen ? /* @__PURE__ */ jsx(X, { className: "w-5 h-5" }) : /* @__PURE__ */ jsx(Menu, { className: "w-5 h-5" })
          }
        )
      ] }),
      mobileMenuOpen && /* @__PURE__ */ jsxs("div", { className: "md:hidden pb-4 space-y-2", children: [
        /* @__PURE__ */ jsx(Button, { variant: "ghost", size: "sm", className: "w-full justify-start", onClick: () => {
          navigate("/");
          setMobileMenuOpen(false);
        }, children: "Ana Sayfa" }),
        /* @__PURE__ */ jsx(Button, { size: "sm", className: "w-full bg-primary text-primary-foreground", onClick: () => {
          handleCTAClick("header_free_trial");
          setMobileMenuOpen(false);
        }, children: user ? "Dashboard" : "Ücretsiz Başla" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxs("section", { className: "container mx-auto px-4 sm:px-6 pt-8 pb-4 text-center", children: [
      /* @__PURE__ */ jsxs("div", { className: "inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4", children: [
        /* @__PURE__ */ jsx(Sparkles, { className: "w-4 h-4" }),
        "Ücretsiz Deneyin — Kayıt Gerekmez"
      ] }),
      /* @__PURE__ */ jsx("h1", { className: "text-3xl md:text-5xl font-bold text-foreground mb-3 tracking-tight leading-tight", children: "AI ile Profesyonel Yorum Yanıtları" }),
      /* @__PURE__ */ jsx("p", { className: "text-muted-foreground text-lg max-w-2xl mx-auto", children: "Bir yorum yazın, ton seçin — yapay zeka saniyeler içinde profesyonel bir yanıt oluştursun." })
    ] }),
    /* @__PURE__ */ jsx("section", { className: "container mx-auto px-4 sm:px-6 pb-6", children: /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center justify-center gap-4 md:gap-8", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-sm text-muted-foreground", children: [
        /* @__PURE__ */ jsx(Shield, { className: "w-4 h-4 text-primary" }),
        /* @__PURE__ */ jsx("span", { children: "Google Business API Onaylı" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-sm text-muted-foreground", children: [
        /* @__PURE__ */ jsx(Users, { className: "w-4 h-4 text-primary" }),
        /* @__PURE__ */ jsx("span", { children: "25+ İşletme Kullanıyor" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-sm text-muted-foreground", children: [
        /* @__PURE__ */ jsx(Zap, { className: "w-4 h-4 text-primary" }),
        /* @__PURE__ */ jsx("span", { children: "Ortalama 8 Saniye Yanıt Süresi" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5 text-sm text-muted-foreground", children: [
        /* @__PURE__ */ jsx("div", { className: "flex", children: [1, 2, 3, 4, 5].map((s) => /* @__PURE__ */ jsx(Star, { className: `w-3.5 h-3.5 ${s <= 5 ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30"}` }, s)) }),
        /* @__PURE__ */ jsx("span", { children: "4.8/5 Kullanıcı Puanı" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsx("section", { className: "px-4 sm:px-6 lg:px-12 xl:px-20 pb-20", children: /* @__PURE__ */ jsxs("div", { className: "max-w-[1400px] mx-auto", children: [
      /* @__PURE__ */ jsxs("div", { className: "mb-8", children: [
        /* @__PURE__ */ jsx("p", { className: "text-sm font-medium text-muted-foreground mb-3", children: "👇 Bir örneğe tıklayın, hemen sonucu görün:" }),
        /* @__PURE__ */ jsx("div", { className: "flex gap-3 overflow-x-auto pb-3 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-12 lg:px-12 xl:-mx-20 xl:px-20", children: SAMPLE_REVIEWS.map((sample, i) => /* @__PURE__ */ jsxs(
          "button",
          {
            onClick: () => handleSampleReview(sample),
            className: "group text-left px-5 py-4 rounded-xl border border-border bg-card hover:border-primary/40 hover:bg-primary/5 transition-all text-sm cursor-pointer flex-shrink-0 w-[280px]",
            children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1 mb-1.5", children: [
                Array.from({ length: 5 }).map((_, s) => /* @__PURE__ */ jsx(Star, { className: `w-3.5 h-3.5 ${s < sample.rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30"}` }, s)),
                /* @__PURE__ */ jsxs("span", { className: "text-xs text-muted-foreground ml-1.5", children: [
                  "— ",
                  sample.name
                ] })
              ] }),
              /* @__PURE__ */ jsx("p", { className: "text-muted-foreground line-clamp-2", children: sample.text }),
              /* @__PURE__ */ jsxs("span", { className: "inline-flex items-center gap-1 mt-2 text-xs text-primary opacity-0 group-hover:opacity-100 transition-opacity", children: [
                /* @__PURE__ */ jsx(Sparkles, { className: "w-3 h-3" }),
                " Tıkla ve dene"
              ] })
            ]
          },
          i
        )) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "grid lg:grid-cols-2 gap-8", children: [
        /* @__PURE__ */ jsxs("div", { className: "space-y-5", children: [
          /* @__PURE__ */ jsxs("div", { className: "rounded-2xl border border-border bg-card p-6 lg:p-8 space-y-6", children: [
            /* @__PURE__ */ jsx("h2", { className: "text-lg font-semibold text-foreground", children: "Yorum Bilgileri" }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-muted-foreground mb-2", children: "Yıldız Puanı" }),
              /* @__PURE__ */ jsx("div", { className: "flex gap-1.5", children: [1, 2, 3, 4, 5].map((star) => /* @__PURE__ */ jsx(
                "button",
                {
                  onClick: () => {
                    setRating(star);
                    gtagEvent("change_rating", "demo", String(star));
                  },
                  onMouseEnter: () => setHoverRating(star),
                  onMouseLeave: () => setHoverRating(0),
                  className: "transition-transform hover:scale-110",
                  "aria-label": `${star} yıldız`,
                  children: /* @__PURE__ */ jsx(
                    Star,
                    {
                      className: `w-9 h-9 transition-colors ${star <= (hoverRating || rating) ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30"}`
                    }
                  )
                },
                star
              )) })
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-muted-foreground mb-2", children: "Yorumcunun Adı (opsiyonel)" }),
              /* @__PURE__ */ jsx(
                "input",
                {
                  type: "text",
                  value: reviewerName,
                  onChange: (e) => setReviewerName(e.target.value),
                  placeholder: "Örn: Ayşe K.",
                  className: "w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
                }
              )
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-muted-foreground mb-2", children: "Yorum Metni" }),
              /* @__PURE__ */ jsx(
                Textarea,
                {
                  value: reviewText,
                  onChange: (e) => setReviewText(e.target.value),
                  placeholder: "Müşterinin yazdığı yorumu buraya yapıştırın veya yazın...",
                  rows: 8,
                  className: "rounded-xl border-border bg-background resize-none text-sm"
                }
              ),
              /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground/60 mt-1.5", children: reviewText.length < 10 ? `En az 10 karakter yazın (${reviewText.length}/10)` : `${reviewText.length} karakter` })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "rounded-2xl border border-border bg-card p-6 lg:p-8", children: [
            /* @__PURE__ */ jsx("h2", { className: "text-lg font-semibold text-foreground mb-4", children: "Yanıt Tonu" }),
            /* @__PURE__ */ jsx("div", { className: "grid grid-cols-3 sm:grid-cols-6 gap-2", children: TONES.map((tone) => /* @__PURE__ */ jsxs(
              "button",
              {
                onClick: () => handleToneSelect(tone.id),
                className: `flex flex-col items-center gap-1.5 px-3 py-3 rounded-xl text-sm font-medium transition-all ${selectedTone === tone.id ? "bg-primary text-primary-foreground shadow-md" : "bg-muted/50 text-muted-foreground hover:bg-muted"}`,
                children: [
                  /* @__PURE__ */ jsx("span", { className: "text-lg", children: tone.emoji }),
                  /* @__PURE__ */ jsx("span", { className: "text-xs", children: tone.label })
                ]
              },
              tone.id
            )) })
          ] }),
          /* @__PURE__ */ jsx(
            Button,
            {
              onClick: handleGenerate,
              disabled: !canGenerate || loading,
              className: "w-full py-6 text-base font-semibold rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-all shadow-lg shadow-primary/20",
              children: loading ? /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
                /* @__PURE__ */ jsx("div", { className: "w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" }),
                "AI Yanıt Üretiyor..."
              ] }) : /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
                /* @__PURE__ */ jsx(Sparkles, { className: "w-5 h-5" }),
                "Yanıt Oluştur"
              ] })
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-5", children: [
          /* @__PURE__ */ jsxs("div", { className: `rounded-2xl border bg-card p-6 lg:p-8 min-h-[580px] flex flex-col transition-all ${generatedReply ? "border-primary/30 shadow-lg shadow-primary/5" : "border-border"}`, children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-4", children: [
              /* @__PURE__ */ jsx("h2", { className: "text-lg font-semibold text-foreground", children: "AI Yanıtı" }),
              generatedReply && /* @__PURE__ */ jsx("div", { className: "flex items-center gap-2", children: /* @__PURE__ */ jsx(
                "button",
                {
                  onClick: handleReset,
                  className: "p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground",
                  title: "Sıfırla",
                  "aria-label": "Sıfırla",
                  children: /* @__PURE__ */ jsx(RotateCcw, { className: "w-4 h-4" })
                }
              ) })
            ] }),
            generatedReply ? /* @__PURE__ */ jsxs("div", { className: "flex-1 flex flex-col", children: [
              /* @__PURE__ */ jsx("div", { className: "flex-1 rounded-xl bg-primary/5 border border-primary/10 p-5 mb-4", children: /* @__PURE__ */ jsx("p", { className: "text-foreground leading-relaxed whitespace-pre-wrap", children: generatedReply }) }),
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mb-4", children: [
                /* @__PURE__ */ jsxs("span", { className: "inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium", children: [
                  /* @__PURE__ */ jsx(Sparkles, { className: "w-3 h-3" }),
                  "AI Üretildi"
                ] }),
                /* @__PURE__ */ jsxs("span", { className: "inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-muted text-muted-foreground text-xs font-medium", children: [
                  (_a = TONES.find((t) => t.id === selectedTone)) == null ? void 0 : _a.emoji,
                  " ",
                  (_b = TONES.find((t) => t.id === selectedTone)) == null ? void 0 : _b.label
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "flex gap-2 mb-6", children: [
                /* @__PURE__ */ jsxs(
                  Button,
                  {
                    onClick: handleCopy,
                    variant: "outline",
                    className: "flex-1 rounded-xl",
                    children: [
                      copied ? /* @__PURE__ */ jsx(Check, { className: "w-4 h-4 mr-2" }) : /* @__PURE__ */ jsx(Copy, { className: "w-4 h-4 mr-2" }),
                      copied ? "Kopyalandı!" : "Yanıtı Kopyala"
                    ]
                  }
                ),
                /* @__PURE__ */ jsx(
                  Button,
                  {
                    onClick: handleGenerate,
                    variant: "outline",
                    disabled: loading,
                    className: "rounded-xl",
                    title: "Yeniden oluştur",
                    children: /* @__PURE__ */ jsx(RotateCcw, { className: `w-4 h-4 ${loading ? "animate-spin" : ""}` })
                  }
                )
              ] }),
              /* @__PURE__ */ jsx("div", { className: "rounded-xl border-2 border-primary/30 bg-gradient-to-br from-primary/5 to-primary/10 p-5 animate-in fade-in slide-in-from-bottom-2 duration-500", children: /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3", children: [
                /* @__PURE__ */ jsx("div", { className: "w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0", children: /* @__PURE__ */ jsx(Sparkles, { className: "w-5 h-5 text-primary" }) }),
                /* @__PURE__ */ jsxs("div", { className: "flex-1", children: [
                  /* @__PURE__ */ jsx("h4", { className: "text-sm font-semibold text-foreground mb-1", children: "Bu kalitede yanıtları tüm yorumlarınız için otomatik oluşturun" }),
                  /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground mb-3", children: "Google, Booking ve TripAdvisor yorumlarını tek panelden yönetin. 3 ay ücretsiz deneyin." }),
                  /* @__PURE__ */ jsxs(
                    Button,
                    {
                      size: "sm",
                      onClick: () => handleCTAClick("free_trial_3_month"),
                      className: "bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg shadow-md shadow-primary/20",
                      children: [
                        "3 Ay Ücretsiz Başla",
                        /* @__PURE__ */ jsx(ArrowRight, { className: "w-4 h-4 ml-1" })
                      ]
                    }
                  )
                ] })
              ] }) })
            ] }) : loading ? /* @__PURE__ */ jsxs("div", { className: "flex-1 flex flex-col items-center justify-center text-center", children: [
              /* @__PURE__ */ jsx("div", { className: "w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4", children: /* @__PURE__ */ jsx("div", { className: "w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" }) }),
              /* @__PURE__ */ jsx("p", { className: "text-muted-foreground font-medium", children: "AI yanıtınızı oluşturuyor..." }),
              /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground/60 mt-1", children: "Genellikle 3-5 saniye sürer" })
            ] }) : /* @__PURE__ */ jsxs("div", { className: "flex-1 flex flex-col items-center justify-center text-center", children: [
              /* @__PURE__ */ jsx("div", { className: "w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center mb-4", children: /* @__PURE__ */ jsx(Sparkles, { className: "w-7 h-7 text-muted-foreground/40" }) }),
              /* @__PURE__ */ jsx("p", { className: "text-muted-foreground font-medium mb-1", children: "Henüz yanıt oluşturulmadı" }),
              /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground/60 max-w-[250px]", children: 'Sol taraftaki formu doldurun ve "Yanıt Oluştur" butonuna tıklayın' })
            ] })
          ] }),
          !generatedReply && /* @__PURE__ */ jsxs("div", { className: "rounded-2xl border border-primary/20 bg-primary/5 p-6 text-center", children: [
            /* @__PURE__ */ jsx("h3", { className: "text-base font-semibold text-foreground mb-2", children: "Tüm yorumlarınızı tek panelden yönetin" }),
            /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground mb-4", children: "Google, Booking, TripAdvisor — hepsine AI ile anında yanıt verin." }),
            /* @__PURE__ */ jsxs(
              Button,
              {
                onClick: () => handleCTAClick("free_trial_3_month"),
                className: "bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl",
                children: [
                  user ? "Dashboard'a Git" : "Ücretsiz Başla",
                  /* @__PURE__ */ jsx(ArrowRight, { className: "w-4 h-4 ml-1" })
                ]
              }
            )
          ] })
        ] })
      ] })
    ] }) })
  ] });
}
export {
  DemoPage as default
};
