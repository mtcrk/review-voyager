import { jsxs, jsx } from "react/jsx-runtime";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { B as Button, I as Input } from "../main.mjs";
import { Lock, Bell, Check, Phone, ArrowRight, MessageSquare, Zap, Users } from "lucide-react";
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
const WhatsAppAutomation = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const plannedFeatures = [
    {
      icon: MessageSquare,
      title: "Auto-Responder",
      description: "Automatic replies for common questions and after-hours messages."
    },
    {
      icon: Zap,
      title: "Quick Replies",
      description: "Pre-saved templates for faster response times."
    },
    {
      icon: Users,
      title: "Team Inbox",
      description: "Multiple team members managing one WhatsApp number."
    },
    {
      icon: Bell,
      title: "Smart Notifications",
      description: "Get alerted for priority messages and escalations."
    }
  ];
  const handleSubmit = (e) => {
    e.preventDefault();
    if (email) {
      setSubmitted(true);
    }
  };
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
        /* @__PURE__ */ jsxs("div", { className: "inline-flex items-center px-3 py-1 rounded-full bg-gray-100 text-gray-600 text-sm font-medium mb-6", children: [
          /* @__PURE__ */ jsx(Lock, { className: "w-4 h-4 mr-2" }),
          "Coming Soon"
        ] }),
        /* @__PURE__ */ jsxs("h1", { className: "text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6", children: [
          "WhatsApp Automation",
          /* @__PURE__ */ jsx("br", {}),
          /* @__PURE__ */ jsx("span", { className: "text-primary", children: "is on the way." })
        ] }),
        /* @__PURE__ */ jsx("p", { className: "text-xl text-muted-foreground mb-8 max-w-2xl mx-auto", children: "Automate your WhatsApp Business conversations. Fast responses, happy customers." }),
        !submitted ? /* @__PURE__ */ jsxs("form", { onSubmit: handleSubmit, className: "max-w-md mx-auto", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex gap-3", children: [
            /* @__PURE__ */ jsx(
              Input,
              {
                type: "email",
                placeholder: "Enter your email",
                value: email,
                onChange: (e) => setEmail(e.target.value),
                className: "flex-1",
                required: true
              }
            ),
            /* @__PURE__ */ jsxs(Button, { type: "submit", className: "gradient-primary text-white", children: [
              /* @__PURE__ */ jsx(Bell, { className: "w-4 h-4 mr-2" }),
              "Notify Me"
            ] })
          ] }),
          /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground mt-3", children: "We'll let you know as soon as it's ready." })
        ] }) : /* @__PURE__ */ jsxs("div", { className: "bg-green-50 border border-green-200 rounded-xl p-6 max-w-md mx-auto", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-center gap-2 text-green-700 mb-2", children: [
            /* @__PURE__ */ jsx(Check, { className: "w-5 h-5" }),
            /* @__PURE__ */ jsx("span", { className: "font-semibold", children: "You're on the list!" })
          ] }),
          /* @__PURE__ */ jsx("p", { className: "text-green-600 text-sm", children: "We'll notify you when WhatsApp automation launches." })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("section", { className: "container mx-auto px-6 py-16", children: [
      /* @__PURE__ */ jsxs("div", { className: "text-center mb-12", children: [
        /* @__PURE__ */ jsx("h2", { className: "text-3xl font-bold text-foreground mb-4", children: "What we're building" }),
        /* @__PURE__ */ jsx("p", { className: "text-muted-foreground text-lg", children: "Powerful features to streamline your WhatsApp communications." })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto", children: plannedFeatures.map((feature, index) => /* @__PURE__ */ jsxs(
        "div",
        {
          className: "p-6 rounded-xl border border-border bg-card/50",
          children: [
            /* @__PURE__ */ jsx("div", { className: "w-12 h-12 rounded-lg bg-muted flex items-center justify-center mb-4", children: /* @__PURE__ */ jsx(feature.icon, { className: "w-6 h-6 text-muted-foreground" }) }),
            /* @__PURE__ */ jsx("h3", { className: "font-semibold text-lg text-foreground mb-2", children: feature.title }),
            /* @__PURE__ */ jsx("p", { className: "text-muted-foreground text-sm", children: feature.description })
          ]
        },
        index
      )) })
    ] }),
    /* @__PURE__ */ jsx("section", { className: "container mx-auto px-6 py-16", children: /* @__PURE__ */ jsxs("div", { className: "max-w-2xl mx-auto text-center bg-card border border-border rounded-2xl p-8 md:p-12", children: [
      /* @__PURE__ */ jsx(Phone, { className: "w-12 h-12 text-primary mx-auto mb-4" }),
      /* @__PURE__ */ jsx("h2", { className: "text-2xl font-bold text-foreground mb-4", children: "In the meantime..." }),
      /* @__PURE__ */ jsx("p", { className: "text-muted-foreground mb-6", children: "Check out our available automations for Instagram and Google Reviews." }),
      /* @__PURE__ */ jsxs("div", { className: "flex flex-col sm:flex-row items-center justify-center gap-4", children: [
        /* @__PURE__ */ jsxs(Button, { onClick: () => navigate("/automations/instagram-sales"), children: [
          "Instagram Automation",
          /* @__PURE__ */ jsx(ArrowRight, { className: "w-4 h-4 ml-2" })
        ] }),
        /* @__PURE__ */ jsx(Button, { variant: "outline", onClick: () => navigate("/automations/google-reviews"), children: "Google Reviews" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsx("footer", { className: "border-t border-border bg-card/50 mt-16", children: /* @__PURE__ */ jsx("div", { className: "container mx-auto px-6 py-8", children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col md:flex-row items-center justify-center gap-4 text-sm text-muted-foreground", children: [
      /* @__PURE__ */ jsx("span", { children: "© 2024 VoyageRespond" }),
      /* @__PURE__ */ jsx("span", { className: "hidden md:block", children: "•" }),
      /* @__PURE__ */ jsx("button", { onClick: () => navigate("/privacy-policy"), className: "hover:text-foreground", children: "Privacy Policy" }),
      /* @__PURE__ */ jsx("span", { className: "hidden md:block", children: "•" }),
      /* @__PURE__ */ jsx("button", { onClick: () => navigate("/terms-of-service"), className: "hover:text-foreground", children: "Terms of Service" })
    ] }) }) })
  ] });
};
export {
  WhatsAppAutomation as default
};
