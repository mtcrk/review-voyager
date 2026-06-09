import { jsxs, jsx } from "react/jsx-runtime";
import { C as Card, a as CardHeader, e as CardTitle, b as CardDescription, c as CardContent } from "./card-vx9BCW0t.js";
import { B as Button, m as Badge } from "../main.mjs";
import { S as ScrollArea } from "./scroll-area-C-y00E-Y.js";
import { FileText, Shield, CheckCircle, AlertTriangle, Play, Download, Video, RefreshCw, Eye, MessageSquare, ToggleLeft, Sparkles, Send } from "lucide-react";
import { Link } from "react-router-dom";
import "react";
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
import "@radix-ui/react-scroll-area";
const CHECKLIST_ITEMS = [
  {
    id: "scopes",
    label: "Minimal API scopes requested",
    description: "Only user.info.basic, video.list, comment.list, comment.reply scopes",
    completed: true
  },
  {
    id: "no-auto",
    label: "No automatic replies",
    description: "All replies require manual user approval before sending",
    completed: true
  },
  {
    id: "demo-mode",
    label: "Demo Mode is sandbox-only",
    description: "Simulated features are hidden in production builds",
    completed: true
  },
  {
    id: "privacy",
    label: "Privacy notice present",
    description: "Clear disclosure about data handling and user responsibility",
    completed: true
  },
  {
    id: "rate-limit",
    label: "Rate limit handling",
    description: "Exponential backoff with user-friendly error messages",
    completed: true
  },
  {
    id: "token-refresh",
    label: "Token refresh mechanism",
    description: "Automatic token refresh before expiration",
    completed: true
  },
  {
    id: "error-handling",
    label: "Robust error handling",
    description: "Clear error messages and logging for debugging",
    completed: true
  },
  {
    id: "manual-approval",
    label: "Manual approval workflow",
    description: "AI suggests, user reviews and explicitly approves",
    completed: true
  }
];
const DEMO_SCRIPT = [
  {
    step: 1,
    title: "Connect TikTok Account",
    description: "Navigate to TikTok channel page and click 'Connect TikTok'. Complete OAuth flow.",
    icon: /* @__PURE__ */ jsx(Video, { className: "h-5 w-5" }),
    duration: "15 sec"
  },
  {
    step: 2,
    title: "Refresh Videos",
    description: "Click 'Videoları Yenile' button to fetch videos from TikTok API.",
    icon: /* @__PURE__ */ jsx(RefreshCw, { className: "h-5 w-5" }),
    duration: "10 sec"
  },
  {
    step: 3,
    title: "Select a Video",
    description: "Click on any video from the list to view its comments.",
    icon: /* @__PURE__ */ jsx(Eye, { className: "h-5 w-5" }),
    duration: "5 sec"
  },
  {
    step: 4,
    title: "Fetch Comments",
    description: "Click refresh to fetch comments. If empty in sandbox, proceed to step 5.",
    icon: /* @__PURE__ */ jsx(MessageSquare, { className: "h-5 w-5" }),
    duration: "10 sec"
  },
  {
    step: 5,
    title: "Enable Demo Mode",
    description: "Toggle 'Demo Mod' switch and click 'Demo Yorumları Yükle' to load sample comments.",
    icon: /* @__PURE__ */ jsx(ToggleLeft, { className: "h-5 w-5" }),
    duration: "10 sec"
  },
  {
    step: 6,
    title: "Generate AI Suggestions",
    description: "Click 'AI Yanıt' button on any comment. Show the 3 different tone suggestions.",
    icon: /* @__PURE__ */ jsx(Sparkles, { className: "h-5 w-5" }),
    duration: "15 sec"
  },
  {
    step: 7,
    title: "Approve & Send (Simulated)",
    description: "Select a suggestion, review in textarea, click 'Onayla ve Gönder (Simüle)'. Show status update to 'Gönderildi'.",
    icon: /* @__PURE__ */ jsx(Send, { className: "h-5 w-5" }),
    duration: "15 sec"
  },
  {
    step: 8,
    title: "Explain Production Behavior",
    description: "Highlight: In production, this uses real TikTok API. Manual approval is always required. No auto-replies.",
    icon: /* @__PURE__ */ jsx(Shield, { className: "h-5 w-5" }),
    duration: "20 sec"
  }
];
function TikTokReviewKit() {
  return /* @__PURE__ */ jsxs("div", { className: "container max-w-4xl py-8", children: [
    /* @__PURE__ */ jsxs("div", { className: "mb-8", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mb-2", children: [
        /* @__PURE__ */ jsx(FileText, { className: "h-8 w-8 text-primary" }),
        /* @__PURE__ */ jsx("h1", { className: "text-3xl font-bold", children: "TikTok App Review Kit" })
      ] }),
      /* @__PURE__ */ jsx("p", { className: "text-muted-foreground", children: "Checklist and demo script for TikTok production app approval submission" })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "flex gap-2 mb-6", children: [
      /* @__PURE__ */ jsx(Button, { asChild: true, variant: "outline", children: /* @__PURE__ */ jsx(Link, { to: "/tiktok-inbox", children: "← TikTok Inbox" }) }),
      /* @__PURE__ */ jsx(Button, { asChild: true, variant: "outline", children: /* @__PURE__ */ jsx(Link, { to: "/channels/tiktok", children: "TikTok Bağlantısı" }) })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "grid gap-6", children: [
      /* @__PURE__ */ jsxs(Card, { children: [
        /* @__PURE__ */ jsxs(CardHeader, { children: [
          /* @__PURE__ */ jsxs(CardTitle, { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsx(Shield, { className: "h-5 w-5 text-primary" }),
            "Compliance Checklist"
          ] }),
          /* @__PURE__ */ jsx(CardDescription, { children: "All items must be completed before submitting for TikTok production approval" })
        ] }),
        /* @__PURE__ */ jsx(CardContent, { children: /* @__PURE__ */ jsx("div", { className: "space-y-4", children: CHECKLIST_ITEMS.map((item) => /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3", children: [
          /* @__PURE__ */ jsx("div", { className: `mt-0.5 ${item.completed ? "text-green-500" : "text-muted-foreground"}`, children: /* @__PURE__ */ jsx(CheckCircle, { className: "h-5 w-5" }) }),
          /* @__PURE__ */ jsxs("div", { className: "flex-1", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsx("span", { className: "font-medium", children: item.label }),
              item.completed && /* @__PURE__ */ jsx(Badge, { variant: "secondary", className: "text-xs", children: "Completed" })
            ] }),
            /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: item.description })
          ] })
        ] }, item.id)) }) })
      ] }),
      /* @__PURE__ */ jsxs(Card, { className: "border-yellow-500/50 bg-yellow-50/50 dark:bg-yellow-950/20", children: [
        /* @__PURE__ */ jsx(CardHeader, { children: /* @__PURE__ */ jsxs(CardTitle, { className: "flex items-center gap-2 text-yellow-700 dark:text-yellow-400", children: [
          /* @__PURE__ */ jsx(AlertTriangle, { className: "h-5 w-5" }),
          "Important Review Notes"
        ] }) }),
        /* @__PURE__ */ jsxs(CardContent, { className: "space-y-3 text-sm", children: [
          /* @__PURE__ */ jsxs("p", { children: [
            "• ",
            /* @__PURE__ */ jsx("strong", { children: "Keep your camera on the UI" }),
            " at all times during the demo video."
          ] }),
          /* @__PURE__ */ jsxs("p", { children: [
            "• ",
            /* @__PURE__ */ jsx("strong", { children: "Clearly show" }),
            ' the "AI önerir; kullanıcı onaylar" text in the interface.'
          ] }),
          /* @__PURE__ */ jsxs("p", { children: [
            "• ",
            /* @__PURE__ */ jsx("strong", { children: "Highlight" }),
            " that the send button requires explicit user click."
          ] }),
          /* @__PURE__ */ jsxs("p", { children: [
            "• ",
            /* @__PURE__ */ jsx("strong", { children: "Mention verbally" }),
            " that there are no automatic/scheduled replies."
          ] }),
          /* @__PURE__ */ jsxs("p", { children: [
            "• ",
            /* @__PURE__ */ jsx("strong", { children: "Demo Mode" }),
            " simulates the workflow; production uses real TikTok API."
          ] }),
          /* @__PURE__ */ jsxs("p", { children: [
            "• ",
            /* @__PURE__ */ jsx("strong", { children: "Total video length" }),
            " should be 1-2 minutes."
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs(Card, { children: [
        /* @__PURE__ */ jsxs(CardHeader, { children: [
          /* @__PURE__ */ jsxs(CardTitle, { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsx(Play, { className: "h-5 w-5 text-primary" }),
            "Demo Video Script (1-2 min)"
          ] }),
          /* @__PURE__ */ jsx(CardDescription, { children: "Follow these steps while recording your screen for TikTok app review" })
        ] }),
        /* @__PURE__ */ jsx(CardContent, { children: /* @__PURE__ */ jsx(ScrollArea, { className: "h-[500px] pr-4", children: /* @__PURE__ */ jsx("div", { className: "space-y-6", children: DEMO_SCRIPT.map((step) => /* @__PURE__ */ jsxs("div", { className: "relative pl-8 pb-6 border-l-2 border-muted last:border-l-0", children: [
          /* @__PURE__ */ jsx("div", { className: "absolute left-0 top-0 -translate-x-1/2 bg-background border-2 border-primary rounded-full p-2", children: step.icon }),
          /* @__PURE__ */ jsxs("div", { className: "ml-4", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mb-1", children: [
              /* @__PURE__ */ jsxs(Badge, { variant: "outline", className: "text-xs", children: [
                "Step ",
                step.step
              ] }),
              /* @__PURE__ */ jsx(Badge, { variant: "secondary", className: "text-xs", children: step.duration })
            ] }),
            /* @__PURE__ */ jsx("h4", { className: "font-semibold text-lg", children: step.title }),
            /* @__PURE__ */ jsx("p", { className: "text-muted-foreground", children: step.description })
          ] })
        ] }, step.step)) }) }) })
      ] }),
      /* @__PURE__ */ jsxs(Card, { children: [
        /* @__PURE__ */ jsxs(CardHeader, { children: [
          /* @__PURE__ */ jsxs(CardTitle, { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsx(FileText, { className: "h-5 w-5 text-primary" }),
            "Voiceover Script (Optional)"
          ] }),
          /* @__PURE__ */ jsx(CardDescription, { children: "Read this while recording if you want to add narration" })
        ] }),
        /* @__PURE__ */ jsx(CardContent, { children: /* @__PURE__ */ jsxs("div", { className: "bg-muted/50 p-4 rounded-lg space-y-4 text-sm italic", children: [
          /* @__PURE__ */ jsx("p", { children: `"This is VoyageRespond's TikTok comment management feature. Let me show you how it works."` }),
          /* @__PURE__ */ jsx("p", { children: `"First, I'll connect my TikTok business account using the secure OAuth flow."` }),
          /* @__PURE__ */ jsx("p", { children: '"Now I can see all my videos. Let me select one to view its comments."' }),
          /* @__PURE__ */ jsx("p", { children: `"For each comment, I can click 'AI Reply' to generate suggestions. The AI provides three different tones: friendly, professional, and witty."` }),
          /* @__PURE__ */ jsx("p", { children: `"Important: The AI only suggests - it never sends automatically. I must review, edit if needed, and explicitly click 'Approve & Send'."` }),
          /* @__PURE__ */ jsx("p", { children: '"As you can see, there are no automatic or scheduled replies. Every response requires manual user approval before posting to TikTok."' }),
          /* @__PURE__ */ jsx("p", { children: '"Thank you for reviewing our application."' })
        ] }) })
      ] }),
      /* @__PURE__ */ jsxs(Card, { children: [
        /* @__PURE__ */ jsx(CardHeader, { children: /* @__PURE__ */ jsxs(CardTitle, { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsx(Download, { className: "h-5 w-5 text-primary" }),
          "Submission Assets"
        ] }) }),
        /* @__PURE__ */ jsx(CardContent, { children: /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between p-3 border rounded-lg", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("p", { className: "font-medium", children: "Privacy Policy URL" }),
              /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: "https://app.voyagerespond.com/privacy-policy" })
            ] }),
            /* @__PURE__ */ jsx(Button, { variant: "outline", size: "sm", onClick: () => window.open("/privacy-policy", "_blank"), children: "View" })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between p-3 border rounded-lg", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("p", { className: "font-medium", children: "Terms of Service URL" }),
              /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: "https://app.voyagerespond.com/terms-of-service" })
            ] }),
            /* @__PURE__ */ jsx(Button, { variant: "outline", size: "sm", onClick: () => window.open("/terms-of-service", "_blank"), children: "View" })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "flex items-center justify-between p-3 border rounded-lg", children: /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("p", { className: "font-medium", children: "App Description" }),
            /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: "VoyageRespond helps businesses manage TikTok comments with AI-suggested replies. All replies require manual user approval. No automatic sending." })
          ] }) })
        ] }) })
      ] })
    ] })
  ] });
}
export {
  TikTokReviewKit as default
};
