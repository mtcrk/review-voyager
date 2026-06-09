import { jsxs, jsx, Fragment } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { u as useAuth, a as useBusiness, B as Button, I as Input, s as supabase } from "../main.mjs";
import { D as Dialog, a as DialogContent, b as DialogHeader, c as DialogTitle, d as DialogDescription } from "./dialog-CFYcafO1.js";
import { T as Textarea } from "./textarea-BbAnJDWe.js";
import { MessageSquare, Sparkles, Zap, Star, Bell, Music2, Phone, Users, BarChart3, Search, Check, Lock, Clock, ArrowRight } from "lucide-react";
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
const Hub = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { activeBusiness } = useBusiness();
  const [searchParams] = useSearchParams();
  const selectedFromOnboarding = searchParams.get("selected");
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [setupModal, setSetupModal] = useState(null);
  const [waitlistModal, setWaitlistModal] = useState(null);
  const [waitlistEmail, setWaitlistEmail] = useState("");
  const [tiktokConnection, setTiktokConnection] = useState({ connected: false });
  const onboardingChannels = (() => {
    try {
      return JSON.parse(localStorage.getItem("onboarding_channels") || "[]");
    } catch {
      return [];
    }
  })();
  const channelMap = {
    "google-reviews": "google",
    "booking": "google",
    // booking/tripadvisor automations are under google tab
    "tripadvisor": "google",
    "expedia": "google",
    "instagram": "instagram"
  };
  const isChannelActivated = (automationChannel) => {
    return onboardingChannels.some((ch) => channelMap[ch] === automationChannel);
  };
  useEffect(() => {
    if (selectedFromOnboarding) {
      setTimeout(() => {
        const el = document.getElementById(`automation-${selectedFromOnboarding}`);
        el == null ? void 0 : el.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 300);
    }
  }, [selectedFromOnboarding]);
  useEffect(() => {
    const fetchTikTokStatus = async () => {
      if (!(activeBusiness == null ? void 0 : activeBusiness.id)) return;
      try {
        const response = await supabase.functions.invoke("tiktok-auth", {
          body: { action: "status", business_id: activeBusiness.id }
        });
        if (!response.error && response.data) {
          setTiktokConnection(response.data);
        }
      } catch (error) {
        console.error("Failed to fetch TikTok status:", error);
      }
    };
    fetchTikTokStatus();
  }, [activeBusiness == null ? void 0 : activeBusiness.id]);
  const automations = [
    {
      id: "comment-to-dm",
      title: "Comment → DM Auto Reply",
      description: "Automatically send a DM when someone comments a keyword on your post.",
      benefit: "Convert comments into sales conversations",
      channel: "instagram",
      status: "coming-soon",
      icon: MessageSquare
    },
    {
      id: "dm-faq",
      title: "DM FAQ Assistant",
      description: "AI-powered responses to common questions in your Instagram DMs.",
      benefit: "Save 10+ hours per week on repetitive questions",
      channel: "instagram",
      status: "coming-soon",
      icon: Sparkles
    },
    {
      id: "story-mention",
      title: "Story Mention Auto-Reply",
      description: "Automatically thank users who mention you in their stories.",
      benefit: "Build stronger relationships with fans",
      channel: "instagram",
      status: "coming-soon",
      icon: Zap
    },
    {
      id: "review-reply",
      title: "AI Review Reply Suggestions",
      description: "Get smart, personalized reply suggestions for every Google review.",
      benefit: "Reply faster, sound professional every time",
      channel: "google",
      status: "available",
      icon: Star,
      link: "/reviews"
    },
    {
      id: "review-alerts",
      title: "Negative Review Alerts",
      description: "Get instant notifications when you receive a negative review.",
      benefit: "Respond quickly to unhappy customers",
      channel: "google",
      status: "available",
      icon: Bell,
      link: "/reviews"
    },
    {
      id: "tiktok-connect",
      title: "TikTok",
      description: tiktokConnection.connected ? `Connected as @${tiktokConnection.username}` : "Connect your TikTok Business account",
      benefit: "Coming soon: Inbox automation",
      channel: "tiktok",
      status: "available",
      icon: Music2,
      badge: tiktokConnection.connected ? "Connected" : "Login Kit",
      link: "/channels/tiktok"
    },
    {
      id: "whatsapp-auto",
      title: "WhatsApp Auto-Responder",
      description: "Automated responses for WhatsApp Business messages.",
      benefit: "Never miss a customer inquiry",
      channel: "whatsapp",
      status: "coming-soon",
      icon: Phone
    },
    {
      id: "team-inbox",
      title: "Team Inbox",
      description: "Unified inbox for all your channels with team collaboration.",
      benefit: "One place for all customer conversations",
      channel: "other",
      status: "coming-soon",
      icon: Users
    },
    {
      id: "analytics",
      title: "Response Analytics",
      description: "Track response times, sentiment, and team performance.",
      benefit: "Make data-driven decisions",
      channel: "other",
      status: "coming-soon",
      icon: BarChart3
    }
  ];
  const tabs = [
    { id: "all", label: "All" },
    { id: "instagram", label: "Instagram" },
    { id: "google", label: "Google Reviews" },
    { id: "tiktok", label: "TikTok" },
    { id: "whatsapp", label: "WhatsApp" },
    { id: "coming-soon", label: "Coming Soon" }
  ];
  const hasOnboardingSelection = onboardingChannels.length > 0;
  const filteredAutomations = automations.filter((a) => {
    if (hasOnboardingSelection && !isChannelActivated(a.channel)) {
      return false;
    }
    const matchesTab = activeTab === "all" || activeTab === "coming-soon" && a.status === "coming-soon" || activeTab === "instagram" && a.channel === "instagram" || activeTab === "google" && a.channel === "google" || activeTab === "tiktok" && a.channel === "tiktok" || activeTab === "whatsapp" && a.channel === "whatsapp";
    const matchesSearch = a.title.toLowerCase().includes(searchQuery.toLowerCase()) || a.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });
  const connectedChannels = onboardingChannels.length || 0;
  automations.filter(
    (a) => a.status === "available" && a.link && isChannelActivated(a.channel)
  ).length;
  const getStatusBadge = (automation) => {
    const activated = automation.status === "available" && isChannelActivated(automation.channel);
    if (automation.badge) {
      const isConnected = automation.badge === "Connected";
      return /* @__PURE__ */ jsxs("span", { className: `inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${isConnected ? "bg-primary/10 text-primary" : "bg-foreground text-background"}`, children: [
        isConnected && /* @__PURE__ */ jsx(Check, { className: "w-3 h-3 mr-1" }),
        automation.badge
      ] });
    }
    if (activated) {
      return /* @__PURE__ */ jsxs("span", { className: "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary", children: [
        /* @__PURE__ */ jsx(Check, { className: "w-3 h-3 mr-1" }),
        "Active"
      ] });
    }
    switch (automation.status) {
      case "available":
        return /* @__PURE__ */ jsxs("span", { className: "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary", children: [
          /* @__PURE__ */ jsx(Check, { className: "w-3 h-3 mr-1" }),
          "Available"
        ] });
      case "early-access":
        return /* @__PURE__ */ jsxs("span", { className: "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-accent text-accent-foreground", children: [
          /* @__PURE__ */ jsx(Clock, { className: "w-3 h-3 mr-1" }),
          "Early Access"
        ] });
      case "coming-soon":
        return /* @__PURE__ */ jsxs("span", { className: "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-muted text-muted-foreground", children: [
          /* @__PURE__ */ jsx(Lock, { className: "w-3 h-3 mr-1" }),
          "Coming Soon"
        ] });
    }
  };
  const handleAutomationAction = (automation) => {
    if (automation.link) {
      navigate(automation.link);
      return;
    }
    if (automation.status === "available") {
      setSetupModal(automation);
    } else if (automation.status === "early-access") {
      setWaitlistModal(automation);
    } else {
      setWaitlistModal(automation);
    }
  };
  const getActionButton = (automation) => {
    const activated = automation.status === "available" && isChannelActivated(automation.channel);
    if (activated && automation.link) {
      return /* @__PURE__ */ jsxs(
        Button,
        {
          size: "sm",
          className: "gradient-primary text-white",
          onClick: () => navigate(automation.link),
          children: [
            "Open",
            /* @__PURE__ */ jsx(ArrowRight, { className: "w-4 h-4 ml-1" })
          ]
        }
      );
    }
    switch (automation.status) {
      case "available":
        return /* @__PURE__ */ jsxs(
          Button,
          {
            size: "sm",
            className: "gradient-primary text-white",
            onClick: () => handleAutomationAction(automation),
            children: [
              "Set up",
              /* @__PURE__ */ jsx(ArrowRight, { className: "w-4 h-4 ml-1" })
            ]
          }
        );
      case "early-access":
        return /* @__PURE__ */ jsx(
          Button,
          {
            size: "sm",
            variant: "outline",
            className: "border-accent text-accent-foreground hover:bg-accent/50",
            onClick: () => handleAutomationAction(automation),
            children: "Join waitlist"
          }
        );
      case "coming-soon":
        return /* @__PURE__ */ jsxs(
          Button,
          {
            size: "sm",
            variant: "ghost",
            className: "text-muted-foreground",
            onClick: () => handleAutomationAction(automation),
            children: [
              /* @__PURE__ */ jsx(Bell, { className: "w-4 h-4 mr-1" }),
              "Notify me"
            ]
          }
        );
    }
  };
  return /* @__PURE__ */ jsxs("div", { className: "min-h-screen bg-background", children: [
    /* @__PURE__ */ jsx("nav", { className: "sticky top-0 z-50 border-b backdrop-blur-lg bg-white/95", children: /* @__PURE__ */ jsx("div", { className: "container mx-auto px-4 sm:px-6", children: /* @__PURE__ */ jsxs("div", { className: "flex h-16 items-center justify-between", children: [
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
      /* @__PURE__ */ jsx("div", { className: "flex items-center gap-4", children: user ? /* @__PURE__ */ jsx(Button, { variant: "ghost", onClick: () => navigate("/dashboard"), children: "Dashboard" }) : /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsx(Button, { variant: "ghost", onClick: () => navigate("/login"), children: "Login" }),
        /* @__PURE__ */ jsx(Button, { className: "gradient-primary text-white", onClick: () => navigate("/register"), children: "Get Started" })
      ] }) })
    ] }) }) }),
    /* @__PURE__ */ jsx("div", { className: "border-b bg-card/50", children: /* @__PURE__ */ jsx("div", { className: "container mx-auto px-4 sm:px-6 py-12", children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col md:flex-row md:items-center md:justify-between gap-6", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h1", { className: "text-3xl md:text-4xl font-bold text-foreground mb-2", children: hasOnboardingSelection ? "Seçtiğiniz Otomasyonlar" : "Your Automation Hub" }),
        /* @__PURE__ */ jsx("p", { className: "text-muted-foreground text-lg", children: hasOnboardingSelection ? "Bu otomasyonlar sizin için hazır. Hemen başlamak için kayıt olun." : "Pick a channel, enable automations, and start converting." })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-6", children: [
        /* @__PURE__ */ jsxs("div", { className: "text-center", children: [
          /* @__PURE__ */ jsx("div", { className: "text-2xl font-bold text-foreground", children: connectedChannels }),
          /* @__PURE__ */ jsx("div", { className: "text-sm text-muted-foreground", children: "Seçili Kanal" })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "w-px h-10 bg-border" }),
        /* @__PURE__ */ jsxs("div", { className: "text-center", children: [
          /* @__PURE__ */ jsx("div", { className: "text-2xl font-bold text-foreground", children: filteredAutomations.length }),
          /* @__PURE__ */ jsx("div", { className: "text-sm text-muted-foreground", children: "Otomasyon" })
        ] })
      ] })
    ] }) }) }),
    !user && hasOnboardingSelection && /* @__PURE__ */ jsx("div", { className: "bg-primary/5 border-b border-primary/20", children: /* @__PURE__ */ jsxs("div", { className: "container mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4", children: [
      /* @__PURE__ */ jsx("p", { className: "text-foreground font-medium", children: "🚀 Bu otomasyonları kullanmaya başlamak için hesap oluşturun — 3 ay ücretsiz!" }),
      /* @__PURE__ */ jsxs("div", { className: "flex gap-3", children: [
        /* @__PURE__ */ jsx(Button, { variant: "outline", onClick: () => navigate("/login"), children: "Giriş Yap" }),
        /* @__PURE__ */ jsx(Button, { className: "gradient-primary text-white", onClick: () => navigate("/register"), children: "3 Ay Ücretsiz Dene" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsx("div", { className: "container mx-auto px-4 sm:px-6 py-6", children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col md:flex-row md:items-center justify-between gap-4", children: [
      /* @__PURE__ */ jsx("div", { className: "flex items-center gap-2 overflow-x-auto pb-2 md:pb-0", children: tabs.map((tab) => /* @__PURE__ */ jsx(
        "button",
        {
          onClick: () => setActiveTab(tab.id),
          className: `px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${activeTab === tab.id ? "bg-primary text-white" : "bg-muted text-muted-foreground hover:bg-muted/80"}`,
          children: tab.label
        },
        tab.id
      )) }),
      /* @__PURE__ */ jsxs("div", { className: "relative", children: [
        /* @__PURE__ */ jsx(Search, { className: "absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" }),
        /* @__PURE__ */ jsx(
          Input,
          {
            placeholder: "Search automations...",
            value: searchQuery,
            onChange: (e) => setSearchQuery(e.target.value),
            className: "pl-10 w-full md:w-64"
          }
        )
      ] })
    ] }) }),
    /* @__PURE__ */ jsxs("div", { className: "container mx-auto px-4 sm:px-6 pb-12", children: [
      /* @__PURE__ */ jsx("div", { className: "grid md:grid-cols-2 lg:grid-cols-3 gap-6", children: filteredAutomations.map((automation) => /* @__PURE__ */ jsxs(
        "div",
        {
          id: `automation-${automation.id}`,
          className: `p-6 rounded-xl border bg-card transition-all hover:shadow-lg ${selectedFromOnboarding === automation.id ? "ring-2 ring-primary border-primary shadow-lg shadow-primary/20" : "border-border"}`,
          children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between mb-4", children: [
              /* @__PURE__ */ jsx("div", { className: "p-3 rounded-lg bg-primary/10", children: /* @__PURE__ */ jsx(automation.icon, { className: "w-6 h-6 text-primary" }) }),
              getStatusBadge(automation)
            ] }),
            /* @__PURE__ */ jsx("h3", { className: "font-semibold text-lg text-foreground mb-2", children: automation.title }),
            /* @__PURE__ */ jsx("p", { className: "text-muted-foreground text-sm mb-4", children: automation.description }),
            /* @__PURE__ */ jsx("p", { className: "text-sm text-primary font-medium mb-4", children: automation.benefit }),
            /* @__PURE__ */ jsx("div", { className: "flex justify-end", children: getActionButton(automation) })
          ]
        },
        automation.id
      )) }),
      filteredAutomations.length === 0 && /* @__PURE__ */ jsxs("div", { className: "text-center py-16", children: [
        /* @__PURE__ */ jsx("div", { className: "w-16 h-16 mx-auto bg-muted rounded-full flex items-center justify-center mb-4", children: /* @__PURE__ */ jsx(Search, { className: "w-8 h-8 text-muted-foreground" }) }),
        /* @__PURE__ */ jsx("h3", { className: "text-lg font-semibold text-foreground mb-2", children: "No automations found" }),
        /* @__PURE__ */ jsx("p", { className: "text-muted-foreground", children: "Try adjusting your search or filter." })
      ] })
    ] }),
    /* @__PURE__ */ jsx(Dialog, { open: !!setupModal, onOpenChange: () => setSetupModal(null), children: /* @__PURE__ */ jsxs(DialogContent, { className: "sm:max-w-md", children: [
      /* @__PURE__ */ jsxs(DialogHeader, { children: [
        /* @__PURE__ */ jsxs(DialogTitle, { children: [
          "Set up ",
          setupModal == null ? void 0 : setupModal.title
        ] }),
        /* @__PURE__ */ jsx(DialogDescription, { children: "Configure your automation settings below." })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-4 py-4", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "text-sm font-medium text-foreground mb-2 block", children: "Trigger Keywords" }),
          /* @__PURE__ */ jsx(Input, { placeholder: "e.g., price, info, details" }),
          /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground mt-1", children: "Comma-separated keywords that will trigger this automation." })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "text-sm font-medium text-foreground mb-2 block", children: "Response Template" }),
          /* @__PURE__ */ jsx(
            Textarea,
            {
              placeholder: "Hi! Thanks for your interest. Here's more info about...",
              rows: 4
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-end gap-3 pt-4", children: [
          /* @__PURE__ */ jsx(Button, { variant: "outline", onClick: () => setSetupModal(null), children: "Cancel" }),
          /* @__PURE__ */ jsx(Button, { className: "gradient-primary text-white", onClick: () => setSetupModal(null), children: "Save Automation" })
        ] })
      ] })
    ] }) }),
    /* @__PURE__ */ jsx(Dialog, { open: !!waitlistModal, onOpenChange: () => setWaitlistModal(null), children: /* @__PURE__ */ jsxs(DialogContent, { className: "sm:max-w-md", children: [
      /* @__PURE__ */ jsxs(DialogHeader, { children: [
        /* @__PURE__ */ jsx(DialogTitle, { children: (waitlistModal == null ? void 0 : waitlistModal.status) === "early-access" ? "Join Early Access" : "Get Notified" }),
        /* @__PURE__ */ jsx(DialogDescription, { children: (waitlistModal == null ? void 0 : waitlistModal.status) === "early-access" ? "Be among the first to try this feature." : "We'll let you know when this feature launches." })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-4 py-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "p-4 bg-muted rounded-lg", children: [
          /* @__PURE__ */ jsx("h4", { className: "font-semibold text-foreground mb-1", children: waitlistModal == null ? void 0 : waitlistModal.title }),
          /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: waitlistModal == null ? void 0 : waitlistModal.description })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "text-sm font-medium text-foreground mb-2 block", children: "Email Address" }),
          /* @__PURE__ */ jsx(
            Input,
            {
              type: "email",
              placeholder: "you@example.com",
              value: waitlistEmail,
              onChange: (e) => setWaitlistEmail(e.target.value)
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-end gap-3 pt-4", children: [
          /* @__PURE__ */ jsx(Button, { variant: "outline", onClick: () => setWaitlistModal(null), children: "Cancel" }),
          /* @__PURE__ */ jsx(
            Button,
            {
              className: "gradient-primary text-white",
              onClick: () => {
                setWaitlistModal(null);
                setWaitlistEmail("");
              },
              children: (waitlistModal == null ? void 0 : waitlistModal.status) === "early-access" ? "Join Waitlist" : "Notify Me"
            }
          )
        ] })
      ] })
    ] }) })
  ] });
};
export {
  Hub as default
};
