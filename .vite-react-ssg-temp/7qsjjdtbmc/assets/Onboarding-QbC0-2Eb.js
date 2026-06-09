import { jsxs, jsx } from "react/jsx-runtime";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { B as Button } from "../main.mjs";
import { Check, CheckSquare, Square, Sparkles, ArrowLeft, ArrowRight, Star, Globe, Hotel, UtensilsCrossed, MessageSquare, Lock, Clock } from "lucide-react";
import { v as voyageRespondLogo } from "./voyage-respond-logo-C1G06huv.js";
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
const Onboarding = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [selectedChannels, setSelectedChannels] = useState([]);
  const goals = [
    {
      id: "review-management",
      title: "Yorumları yönet ve hızlıca yanıtla",
      description: "AI destekli yanıtlarla saatler kazanın",
      icon: Star
    },
    {
      id: "multi-platform",
      title: "Tüm platformlardaki yorumları tek yerden yönet",
      description: "Google, Booking, TripAdvisor ve daha fazlası — hepsi bir arada",
      icon: Globe
    },
    {
      id: "reputation",
      title: "Online itibarımı güçlendir",
      description: "AI görünürlük skoru ve rakip analizi ile büyüyün",
      icon: Sparkles
    }
  ];
  const channels = [
    {
      id: "google-reviews",
      title: "Google Yorumları",
      description: "AI yanıt önerileri, duygu analizi, itibar yönetimi",
      icon: Star,
      status: "available"
    },
    {
      id: "booking",
      title: "Booking.com",
      description: "Otel yorumlarını çek, analiz et ve yanıtla",
      icon: Hotel,
      status: "available"
    },
    {
      id: "tripadvisor",
      title: "TripAdvisor",
      description: "Restoran ve otel yorumlarını tek panelden yönet",
      icon: UtensilsCrossed,
      status: "available"
    },
    {
      id: "expedia",
      title: "Expedia",
      description: "Expedia rezervasyon yorumlarını takip et",
      icon: Globe,
      status: "available"
    },
    {
      id: "instagram",
      title: "Instagram",
      description: "Yorum → DM otomasyonu, AI yanıtlar, satış",
      icon: MessageSquare,
      status: "early-access"
    }
  ];
  const getStatusBadge = (status) => {
    switch (status) {
      case "available":
        return /* @__PURE__ */ jsxs("span", { className: "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary", children: [
          /* @__PURE__ */ jsx(Check, { className: "w-3 h-3 mr-1" }),
          "Aktif"
        ] });
      case "early-access":
        return /* @__PURE__ */ jsxs("span", { className: "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-accent text-accent-foreground", children: [
          /* @__PURE__ */ jsx(Clock, { className: "w-3 h-3 mr-1" }),
          "Erken Erişim"
        ] });
      case "coming-soon":
        return /* @__PURE__ */ jsxs("span", { className: "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-muted text-muted-foreground", children: [
          /* @__PURE__ */ jsx(Lock, { className: "w-3 h-3 mr-1" }),
          "Yakında"
        ] });
    }
  };
  const toggleChannel = (id) => {
    setSelectedChannels(
      (prev) => prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };
  const canProceed = () => {
    switch (step) {
      case 1:
        return true;
      case 2:
        return selectedChannels.length > 0;
      case 3:
        return true;
      default:
        return false;
    }
  };
  const handleNext = () => {
    if (step < 3) {
      setStep((prev) => prev + 1);
    } else {
      localStorage.setItem("onboarding_channels", JSON.stringify(selectedChannels));
      navigate("/hub");
    }
  };
  const handleBack = () => {
    if (step > 1) {
      setStep((prev) => prev - 1);
    } else {
      navigate("/");
    }
  };
  return /* @__PURE__ */ jsxs("div", { className: "min-h-screen bg-background", children: [
    /* @__PURE__ */ jsx("div", { className: "border-b bg-card/50 backdrop-blur-sm", children: /* @__PURE__ */ jsx("div", { className: "container mx-auto px-6 py-4", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxs(
        "button",
        {
          onClick: () => navigate("/"),
          className: "flex items-center gap-2 hover:opacity-80 transition-opacity",
          children: [
            /* @__PURE__ */ jsx("img", { src: voyageRespondLogo, alt: "VoyageRespond", className: "h-7 w-7" }),
            /* @__PURE__ */ jsxs("span", { className: "text-lg text-foreground", children: [
              /* @__PURE__ */ jsx("span", { className: "font-normal", children: "Voyage" }),
              /* @__PURE__ */ jsx("span", { className: "font-semibold", children: "Respond" })
            ] })
          ]
        }
      ),
      /* @__PURE__ */ jsx("div", { className: "flex items-center gap-2", children: [1, 2, 3].map((s) => /* @__PURE__ */ jsx(
        "div",
        {
          className: `w-8 h-1.5 rounded-full transition-all ${s <= step ? "bg-primary" : "bg-muted"}`
        },
        s
      )) })
    ] }) }) }),
    /* @__PURE__ */ jsxs("div", { className: "container mx-auto px-6 py-12 max-w-3xl", children: [
      step === 1 && /* @__PURE__ */ jsxs("div", { className: "space-y-8 animate-in fade-in duration-300", children: [
        /* @__PURE__ */ jsxs("div", { className: "text-center space-y-3", children: [
          /* @__PURE__ */ jsx("h1", { className: "text-3xl md:text-4xl font-bold text-foreground", children: "VoyageRespond ile neler yapabilirsiniz?" }),
          /* @__PURE__ */ jsx("p", { className: "text-muted-foreground text-lg", children: "Tek platformdan tüm yorum süreçlerinizi yönetin." })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "grid gap-4", children: goals.map((goal) => /* @__PURE__ */ jsx(
          "div",
          {
            className: "p-6 rounded-xl border border-border bg-card text-left",
            children: /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-4", children: [
              /* @__PURE__ */ jsx("div", { className: "p-3 rounded-lg bg-primary/10", children: /* @__PURE__ */ jsx(goal.icon, { className: "w-6 h-6 text-primary" }) }),
              /* @__PURE__ */ jsxs("div", { className: "flex-1", children: [
                /* @__PURE__ */ jsx("h3", { className: "font-semibold text-foreground text-lg", children: goal.title }),
                /* @__PURE__ */ jsx("p", { className: "text-muted-foreground mt-1", children: goal.description })
              ] }),
              /* @__PURE__ */ jsx("div", { className: "w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center", children: /* @__PURE__ */ jsx(Check, { className: "w-4 h-4 text-primary" }) })
            ] })
          },
          goal.id
        )) }),
        /* @__PURE__ */ jsx("p", { className: "text-center text-muted-foreground text-sm", children: "Tüm bu özellikler planınıza dahildir. Hadi başlayalım!" })
      ] }),
      step === 2 && /* @__PURE__ */ jsxs("div", { className: "space-y-8 animate-in fade-in duration-300", children: [
        /* @__PURE__ */ jsxs("div", { className: "text-center space-y-3", children: [
          /* @__PURE__ */ jsx("h1", { className: "text-3xl md:text-4xl font-bold text-foreground", children: "Hangi platformları kullanmak istiyorsunuz?" }),
          /* @__PURE__ */ jsx("p", { className: "text-muted-foreground text-lg", children: "Bir veya daha fazla kanal seçin." })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "grid gap-4", children: channels.map((channel) => {
          const isSelected = selectedChannels.includes(channel.id);
          const isDisabled = channel.status === "coming-soon";
          return /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => !isDisabled && toggleChannel(channel.id),
              disabled: isDisabled,
              className: `p-6 rounded-xl border text-left transition-all ${isDisabled ? "opacity-60 cursor-not-allowed bg-muted/50" : isSelected ? "border-primary bg-primary/5 shadow-md" : "border-border bg-card hover:border-primary/50 hover:shadow-md"}`,
              children: /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-4", children: [
                /* @__PURE__ */ jsx("div", { className: "mt-1", children: isSelected ? /* @__PURE__ */ jsx(CheckSquare, { className: "w-6 h-6 text-primary" }) : /* @__PURE__ */ jsx(Square, { className: `w-6 h-6 ${isDisabled ? "text-muted-foreground/40" : "text-muted-foreground"}` }) }),
                /* @__PURE__ */ jsx(
                  "div",
                  {
                    className: `p-3 rounded-lg ${isSelected ? "bg-primary/10" : "bg-muted"}`,
                    children: /* @__PURE__ */ jsx(
                      channel.icon,
                      {
                        className: `w-6 h-6 ${isSelected ? "text-primary" : "text-muted-foreground"}`
                      }
                    )
                  }
                ),
                /* @__PURE__ */ jsxs("div", { className: "flex-1", children: [
                  /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 mb-1", children: [
                    /* @__PURE__ */ jsx("h3", { className: "font-semibold text-foreground text-lg", children: channel.title }),
                    getStatusBadge(channel.status)
                  ] }),
                  /* @__PURE__ */ jsx("p", { className: "text-muted-foreground", children: channel.description })
                ] })
              ] })
            },
            channel.id
          );
        }) }),
        /* @__PURE__ */ jsx("p", { className: "text-center text-muted-foreground text-sm", children: "Bir taneyle başlayıp istediğiniz zaman daha fazla ekleyebilirsiniz." })
      ] }),
      step === 3 && /* @__PURE__ */ jsxs("div", { className: "space-y-8 animate-in fade-in duration-300", children: [
        /* @__PURE__ */ jsxs("div", { className: "text-center space-y-3", children: [
          /* @__PURE__ */ jsx("h1", { className: "text-3xl md:text-4xl font-bold text-foreground", children: "Her şey hazır!" }),
          /* @__PURE__ */ jsx("p", { className: "text-muted-foreground text-lg", children: "Sizi Otomasyon Merkezi'ne yönlendirelim." })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "bg-card border border-border rounded-xl p-8 text-center space-y-6", children: [
          /* @__PURE__ */ jsx("div", { className: "w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center", children: /* @__PURE__ */ jsx(Sparkles, { className: "w-8 h-8 text-primary" }) }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsx("h3", { className: "font-semibold text-xl text-foreground", children: "Otomasyona hazır" }),
            /* @__PURE__ */ jsx("p", { className: "text-muted-foreground", children: "Seçtiğiniz platformlar yapılandırılmaya hazır." })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "flex flex-wrap justify-center gap-2", children: selectedChannels.map((ch) => {
            var _a;
            return /* @__PURE__ */ jsx(
              "span",
              {
                className: "px-3 py-1.5 bg-primary/10 text-primary rounded-full text-sm font-medium",
                children: (_a = channels.find((c) => c.id === ch)) == null ? void 0 : _a.title
              },
              ch
            );
          }) }),
          /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: "İstediğiniz zaman Hub'dan daha fazla kanal ekleyebilirsiniz." })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mt-12", children: [
        /* @__PURE__ */ jsxs(Button, { variant: "ghost", onClick: handleBack, className: "gap-2", children: [
          /* @__PURE__ */ jsx(ArrowLeft, { className: "w-4 h-4" }),
          "Geri"
        ] }),
        /* @__PURE__ */ jsxs(
          Button,
          {
            onClick: handleNext,
            disabled: !canProceed(),
            className: "gap-2 gradient-primary text-white",
            children: [
              step === 3 ? "Hub'a Devam Et" : "İleri",
              /* @__PURE__ */ jsx(ArrowRight, { className: "w-4 h-4" })
            ]
          }
        )
      ] })
    ] })
  ] });
};
export {
  Onboarding as default
};
