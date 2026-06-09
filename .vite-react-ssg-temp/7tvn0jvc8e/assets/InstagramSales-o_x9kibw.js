import { jsxs, jsx } from "react/jsx-runtime";
import { useNavigate } from "react-router-dom";
import { B as Button } from "../main.mjs";
import { MessageSquare, ArrowRight, Zap, Check, DollarSign, Calendar, HelpCircle } from "lucide-react";
import { v as voyageRespondLogo } from "./voyage-respond-logo-C1G06huv.js";
import "vite-react-ssg";
import "react";
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
const InstagramSales = () => {
  const navigate = useNavigate();
  const useCases = [
    {
      icon: DollarSign,
      title: "Price request automation",
      description: "When someone comments 'price' or 'how much', automatically send them a DM with your pricing."
    },
    {
      icon: Calendar,
      title: "Appointment booking",
      description: "Turn interested commenters into booked appointments with automated DM sequences."
    },
    {
      icon: HelpCircle,
      title: "Product link + FAQ",
      description: "Share product links and answer common questions automatically in DMs."
    }
  ];
  const features = [
    "Keyword-triggered DM automation",
    "AI-powered response suggestions",
    "Customizable message templates",
    "Multi-language support",
    "Analytics and conversion tracking",
    "Works with Instagram Business accounts"
  ];
  return /* @__PURE__ */ jsxs("div", { className: "min-h-screen bg-background", children: [
    /* @__PURE__ */ jsx("nav", { className: "sticky top-0 z-50 border-b backdrop-blur-lg bg-white/95", children: /* @__PURE__ */ jsx("div", { className: "container mx-auto px-6", children: /* @__PURE__ */ jsxs("div", { className: "flex h-16 items-center justify-between", children: [
      /* @__PURE__ */ jsxs(
        "button",
        {
          onClick: () => navigate("/"),
          className: "flex items-center gap-2 hover:opacity-80 transition-opacity",
          children: [
            /* @__PURE__ */ jsx("img", { src: voyageRespondLogo, alt: "VoyageRespond", className: "h-7 w-7" }),
            /* @__PURE__ */ jsxs("span", { className: "text-lg", style: { color: "#1F2937" }, children: [
              /* @__PURE__ */ jsx("span", { className: "font-normal", children: "Voyage" }),
              /* @__PURE__ */ jsx("span", { className: "font-semibold", children: "Respond" })
            ] })
          ]
        }
      ),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4", children: [
        /* @__PURE__ */ jsx(Button, { variant: "ghost", onClick: () => navigate("/hub"), children: "Automation Hub" }),
        /* @__PURE__ */ jsx(Button, { className: "gradient-primary text-white", onClick: () => navigate("/onboarding"), children: "Get Started" })
      ] })
    ] }) }) }),
    /* @__PURE__ */ jsxs("section", { className: "container mx-auto px-6 py-20 relative overflow-hidden", children: [
      /* @__PURE__ */ jsx("div", { className: "absolute inset-0 gradient-hero" }),
      /* @__PURE__ */ jsx("div", { className: "absolute inset-0 gradient-mesh" }),
      /* @__PURE__ */ jsxs("div", { className: "relative z-10 max-w-4xl mx-auto text-center", children: [
        /* @__PURE__ */ jsxs("div", { className: "inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6", children: [
          /* @__PURE__ */ jsx(MessageSquare, { className: "w-4 h-4 mr-2" }),
          "Instagram Automation"
        ] }),
        /* @__PURE__ */ jsxs("h1", { className: "text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6", children: [
          "Turn Comments into DMs.",
          /* @__PURE__ */ jsx("br", {}),
          /* @__PURE__ */ jsx("span", { className: "text-primary", children: "Turn DMs into Sales." })
        ] }),
        /* @__PURE__ */ jsx("p", { className: "text-xl text-muted-foreground mb-8 max-w-2xl mx-auto", children: "Automate your Instagram engagement. When someone shows interest, instantly continue the conversation in their DMs." }),
        /* @__PURE__ */ jsxs("div", { className: "flex flex-col sm:flex-row items-center justify-center gap-4", children: [
          /* @__PURE__ */ jsxs(
            Button,
            {
              size: "lg",
              className: "gradient-primary text-white px-8",
              onClick: () => navigate("/onboarding"),
              children: [
                "Start Free Trial",
                /* @__PURE__ */ jsx(ArrowRight, { className: "w-5 h-5 ml-2" })
              ]
            }
          ),
          /* @__PURE__ */ jsx(Button, { size: "lg", variant: "outline", onClick: () => navigate("/hub"), children: "View All Automations" })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsx("section", { className: "container mx-auto px-6 py-16", children: /* @__PURE__ */ jsx("div", { className: "max-w-4xl mx-auto", children: /* @__PURE__ */ jsxs("div", { className: "bg-card border border-border rounded-2xl p-8 md:p-12", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 mb-6", children: [
        /* @__PURE__ */ jsx(Zap, { className: "w-6 h-6 text-primary" }),
        /* @__PURE__ */ jsx("span", { className: "text-sm font-medium text-primary", children: "How it works" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "grid md:grid-cols-2 gap-8 items-center", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h3", { className: "text-2xl font-bold text-foreground mb-4", children: "Comment → DM in seconds" }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3", children: [
              /* @__PURE__ */ jsx("div", { className: "w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0", children: /* @__PURE__ */ jsx("span", { className: "text-sm font-semibold text-primary", children: "1" }) }),
              /* @__PURE__ */ jsx("div", { children: /* @__PURE__ */ jsx("p", { className: "font-medium text-foreground", children: 'User comments "price" on your post' }) })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3", children: [
              /* @__PURE__ */ jsx("div", { className: "w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0", children: /* @__PURE__ */ jsx("span", { className: "text-sm font-semibold text-primary", children: "2" }) }),
              /* @__PURE__ */ jsx("div", { children: /* @__PURE__ */ jsx("p", { className: "font-medium text-foreground", children: "VoyageRespond detects the keyword" }) })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3", children: [
              /* @__PURE__ */ jsx("div", { className: "w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0", children: /* @__PURE__ */ jsx("span", { className: "text-sm font-semibold text-primary", children: "3" }) }),
              /* @__PURE__ */ jsx("div", { children: /* @__PURE__ */ jsx("p", { className: "font-medium text-foreground", children: "Automatic DM sent with pricing & next steps" }) })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "bg-muted rounded-xl p-6", children: /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
          /* @__PURE__ */ jsxs("div", { className: "bg-card rounded-lg p-4 border border-border", children: [
            /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground mb-1", children: "@customer commented:" }),
            /* @__PURE__ */ jsx("p", { className: "font-medium text-foreground", children: '"How much for this? 💰"' })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "flex justify-center", children: /* @__PURE__ */ jsx(ArrowRight, { className: "w-5 h-5 text-primary animate-pulse" }) }),
          /* @__PURE__ */ jsxs("div", { className: "bg-primary/10 rounded-lg p-4 border border-primary/20", children: [
            /* @__PURE__ */ jsx("p", { className: "text-sm text-primary mb-1", children: "Auto DM sent:" }),
            /* @__PURE__ */ jsx("p", { className: "font-medium text-foreground", children: '"Hi! Thanks for your interest! 🙌 This item is $49. Want me to send you the direct link?"' })
          ] })
        ] }) })
      ] })
    ] }) }) }),
    /* @__PURE__ */ jsxs("section", { className: "container mx-auto px-6 py-16", children: [
      /* @__PURE__ */ jsxs("div", { className: "text-center mb-12", children: [
        /* @__PURE__ */ jsx("h2", { className: "text-3xl font-bold text-foreground mb-4", children: "Perfect for these use cases" }),
        /* @__PURE__ */ jsx("p", { className: "text-muted-foreground text-lg", children: "Turn every interaction into an opportunity." })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "grid md:grid-cols-3 gap-8 max-w-5xl mx-auto", children: useCases.map((useCase, index) => /* @__PURE__ */ jsxs(
        "div",
        {
          className: "p-6 rounded-xl border border-border bg-card hover:shadow-lg transition-all",
          children: [
            /* @__PURE__ */ jsx("div", { className: "w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4", children: /* @__PURE__ */ jsx(useCase.icon, { className: "w-6 h-6 text-primary" }) }),
            /* @__PURE__ */ jsx("h3", { className: "font-semibold text-lg text-foreground mb-2", children: useCase.title }),
            /* @__PURE__ */ jsx("p", { className: "text-muted-foreground", children: useCase.description })
          ]
        },
        index
      )) })
    ] }),
    /* @__PURE__ */ jsx("section", { className: "container mx-auto px-6 py-16", children: /* @__PURE__ */ jsxs("div", { className: "max-w-4xl mx-auto bg-card border border-border rounded-2xl p-8 md:p-12", children: [
      /* @__PURE__ */ jsxs("div", { className: "text-center mb-8", children: [
        /* @__PURE__ */ jsx("h2", { className: "text-2xl font-bold text-foreground mb-2", children: "What's included" }),
        /* @__PURE__ */ jsx("p", { className: "text-muted-foreground", children: "Everything you need to automate Instagram sales." })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "grid md:grid-cols-2 gap-4", children: features.map((feature, index) => /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsx(Check, { className: "w-5 h-5 text-primary flex-shrink-0" }),
        /* @__PURE__ */ jsx("span", { className: "text-foreground", children: feature })
      ] }, index)) })
    ] }) }),
    /* @__PURE__ */ jsx("section", { className: "container mx-auto px-6 py-20", children: /* @__PURE__ */ jsxs("div", { className: "max-w-3xl mx-auto text-center", children: [
      /* @__PURE__ */ jsx("h2", { className: "text-3xl md:text-4xl font-bold text-foreground mb-4", children: "Ready to automate your Instagram?" }),
      /* @__PURE__ */ jsx("p", { className: "text-lg text-muted-foreground mb-8", children: "Start converting comments into customers today." }),
      /* @__PURE__ */ jsxs(
        Button,
        {
          size: "lg",
          className: "gradient-primary text-white px-8",
          onClick: () => navigate("/onboarding"),
          children: [
            "Get Started Free",
            /* @__PURE__ */ jsx(ArrowRight, { className: "w-5 h-5 ml-2" })
          ]
        }
      )
    ] }) }),
    /* @__PURE__ */ jsx("footer", { className: "border-t border-border bg-card/50", children: /* @__PURE__ */ jsx("div", { className: "container mx-auto px-6 py-8", children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col md:flex-row items-center justify-center gap-4 text-sm text-muted-foreground", children: [
      /* @__PURE__ */ jsx("span", { children: "© 2024 VoyageRespond" }),
      /* @__PURE__ */ jsx("span", { className: "hidden md:block", children: "•" }),
      /* @__PURE__ */ jsx("button", { onClick: () => navigate("/privacy-policy"), className: "hover:text-foreground", children: "Privacy Policy" }),
      /* @__PURE__ */ jsx("span", { className: "hidden md:block", children: "•" }),
      /* @__PURE__ */ jsx("button", { onClick: () => navigate("/terms-of-service"), className: "hover:text-foreground", children: "Terms of Service" })
    ] }) }) })
  ] });
};
export {
  InstagramSales as default
};
