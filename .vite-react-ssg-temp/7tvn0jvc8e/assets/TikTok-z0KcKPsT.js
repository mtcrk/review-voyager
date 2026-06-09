import { jsxs, jsx, Fragment } from "react/jsx-runtime";
import { useState, useEffect, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { a as useBusiness, s as supabase, B as Button, m as Badge, A as AlertDialog, n as AlertDialogContent, o as AlertDialogHeader, q as AlertDialogTitle, r as AlertDialogDescription, v as AlertDialogFooter, w as AlertDialogCancel, x as AlertDialogAction } from "../main.mjs";
import { C as Card, a as CardHeader, e as CardTitle, b as CardDescription, c as CardContent } from "./card-vx9BCW0t.js";
import { A as Avatar, a as AvatarImage, b as AvatarFallback } from "./avatar-D1gYhgs6.js";
import { ArrowLeft, Music2, Check, Clock, Lock, MessagesSquare, MessageSquare, Zap } from "lucide-react";
import { toast } from "sonner";
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
import "@radix-ui/react-avatar";
function TikTokChannel() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { activeBusiness } = useBusiness();
  const [connection, setConnection] = useState(null);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);
  const [showDisconnectDialog, setShowDisconnectDialog] = useState(false);
  useEffect(() => {
    if (searchParams.get("connected") === "1") {
      toast.success("TikTok account connected successfully.");
      navigate("/channels/tiktok", { replace: true });
    }
    if (searchParams.get("error")) {
      toast.error("TikTok connection failed. Please try again.");
      navigate("/channels/tiktok", { replace: true });
    }
  }, [searchParams, navigate]);
  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          setLoading(false);
          return;
        }
        const response = await supabase.functions.invoke("tiktok-auth", {
          body: { action: "status", business_id: (activeBusiness == null ? void 0 : activeBusiness.id) || null },
          headers: { Authorization: `Bearer ${session.access_token}` }
        });
        if (response.error) {
          console.error("Status fetch error:", response.error);
        } else {
          setConnection(response.data);
        }
      } catch (error) {
        console.error("Failed to fetch TikTok status:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStatus();
  }, [activeBusiness == null ? void 0 : activeBusiness.id]);
  const handleConnect = useCallback(async () => {
    var _a, _b;
    setConnecting(true);
    try {
      console.log("Initiating TikTok OAuth", (activeBusiness == null ? void 0 : activeBusiness.id) ? `for business: ${activeBusiness.id}` : "at user level");
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("Please log in to connect TikTok.");
        navigate(`/login?redirect=${encodeURIComponent("/channels/tiktok?autoConnect=1")}`);
        setConnecting(false);
        return;
      }
      const response = await supabase.functions.invoke("tiktok-auth", {
        body: { action: "initiate", business_id: (activeBusiness == null ? void 0 : activeBusiness.id) || null },
        headers: { Authorization: `Bearer ${session.access_token}` }
      });
      console.log("TikTok auth response:", response);
      if (response.error) {
        console.error("Edge function error:", response.error);
        throw new Error(response.error.message || "Failed to initiate OAuth");
      }
      if (!((_a = response.data) == null ? void 0 : _a.auth_url)) {
        console.error("No auth_url in response:", response.data);
        throw new Error(((_b = response.data) == null ? void 0 : _b.error) || "Failed to get authorization URL");
      }
      sessionStorage.setItem("tiktok_oauth_state", response.data.state);
      console.log("Redirecting to TikTok:", response.data.auth_url);
      const authUrl = response.data.auth_url;
      const isInIframe = window.self !== window.top;
      if (isInIframe) {
        const opened = window.open(authUrl, "_blank", "noopener,noreferrer");
        if (!opened) {
          toast.error("Pop-up blocked. Please allow pop-ups and try again.");
        }
      } else {
        window.location.href = authUrl;
      }
    } catch (error) {
      console.error("Connect error:", error);
      toast.error(error instanceof Error ? error.message : "TikTok connection failed. Please try again.");
      setConnecting(false);
    }
  }, [activeBusiness == null ? void 0 : activeBusiness.id, navigate]);
  useEffect(() => {
    if (searchParams.get("autoConnect") !== "1") return;
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      navigate("/channels/tiktok", { replace: true });
      handleConnect();
    })();
  }, [searchParams, navigate, handleConnect]);
  const handleDisconnect = async () => {
    setDisconnecting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("Please log in to disconnect TikTok.");
        navigate("/login?redirect=/channels/tiktok");
        return;
      }
      const response = await supabase.functions.invoke("tiktok-auth", {
        body: { action: "disconnect", business_id: (activeBusiness == null ? void 0 : activeBusiness.id) || null },
        headers: { Authorization: `Bearer ${session.access_token}` }
      });
      if (response.error) {
        throw new Error(response.error.message);
      }
      setConnection({ connected: false });
      toast.success("TikTok account disconnected.");
    } catch (error) {
      console.error("Disconnect error:", error);
      toast.error("Failed to disconnect. Please try again.");
    } finally {
      setDisconnecting(false);
      setShowDisconnectDialog(false);
    }
  };
  const activeFeatures = [
    { icon: MessagesSquare, label: "Comment Inbox", description: "Reply to comments on your videos with AI suggestions", path: "/tiktok-inbox" }
  ];
  const comingSoonFeatures = [
    { icon: MessageSquare, label: "Inbox (DM)", description: "Manage TikTok direct messages" },
    { icon: Zap, label: "Auto-reply workflows", description: "Automate responses based on keywords" }
  ];
  return /* @__PURE__ */ jsxs("div", { className: "min-h-screen bg-background", children: [
    /* @__PURE__ */ jsx("header", { className: "sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60", children: /* @__PURE__ */ jsxs("div", { className: "container flex h-16 items-center gap-4 px-4 md:px-6", children: [
      /* @__PURE__ */ jsx(
        Button,
        {
          variant: "ghost",
          size: "icon",
          onClick: () => navigate("/hub"),
          children: /* @__PURE__ */ jsx(ArrowLeft, { className: "h-5 w-5" })
        }
      ),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsx("div", { className: "flex h-10 w-10 items-center justify-center rounded-lg bg-black", children: /* @__PURE__ */ jsx(Music2, { className: "h-5 w-5 text-white" }) }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h1", { className: "text-lg font-semibold", children: "TikTok" }),
          /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: "Channel Settings" })
        ] })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxs("main", { className: "container max-w-3xl px-4 py-8 md:px-6", children: [
      /* @__PURE__ */ jsxs(Card, { className: "mb-6", children: [
        /* @__PURE__ */ jsx(CardHeader, { children: /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx(CardTitle, { children: "Connection Status" }),
            /* @__PURE__ */ jsx(CardDescription, { children: (connection == null ? void 0 : connection.connected) ? "Your TikTok account is connected" : "Connect your TikTok Business account to get started" })
          ] }),
          (connection == null ? void 0 : connection.connected) ? /* @__PURE__ */ jsxs(Badge, { className: "bg-green-100 text-green-800 hover:bg-green-100", children: [
            /* @__PURE__ */ jsx(Check, { className: "mr-1 h-3 w-3" }),
            "Connected"
          ] }) : /* @__PURE__ */ jsxs(Badge, { variant: "secondary", children: [
            /* @__PURE__ */ jsx(Clock, { className: "mr-1 h-3 w-3" }),
            "Not connected"
          ] })
        ] }) }),
        /* @__PURE__ */ jsx(CardContent, { children: loading ? /* @__PURE__ */ jsx("div", { className: "flex items-center justify-center py-8", children: /* @__PURE__ */ jsx("div", { className: "h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" }) }) : (connection == null ? void 0 : connection.connected) ? /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4 rounded-lg border p-4", children: [
            /* @__PURE__ */ jsxs(Avatar, { className: "h-14 w-14", children: [
              /* @__PURE__ */ jsx(AvatarImage, { src: connection.avatar_url, alt: connection.username }),
              /* @__PURE__ */ jsx(AvatarFallback, { className: "bg-black text-white", children: /* @__PURE__ */ jsx(Music2, { className: "h-6 w-6" }) })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex-1", children: [
              /* @__PURE__ */ jsxs("p", { className: "font-medium", children: [
                "@",
                connection.username
              ] }),
              /* @__PURE__ */ jsxs("p", { className: "text-sm text-muted-foreground", children: [
                "TikTok ID: ",
                connection.provider_user_id
              ] }),
              /* @__PURE__ */ jsxs("p", { className: "text-xs text-muted-foreground", children: [
                "Connected ",
                connection.connected_at ? new Date(connection.connected_at).toLocaleDateString() : "recently"
              ] })
            ] }),
            /* @__PURE__ */ jsx(Badge, { variant: "outline", children: "Login Kit" })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "flex gap-3", children: /* @__PURE__ */ jsx(
            Button,
            {
              variant: "outline",
              className: "flex-1",
              onClick: () => window.open("https://www.tiktok.com/business", "_blank"),
              children: "Open TikTok settings"
            }
          ) })
        ] }) : /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
          /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: "Connect your TikTok account to enable future automation features." }),
          /* @__PURE__ */ jsx(
            Button,
            {
              className: "w-full bg-black text-white hover:bg-black/90",
              onClick: handleConnect,
              disabled: connecting,
              children: connecting ? /* @__PURE__ */ jsxs(Fragment, { children: [
                /* @__PURE__ */ jsx("div", { className: "mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" }),
                "Connecting..."
              ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
                /* @__PURE__ */ jsx(Music2, { className: "mr-2 h-4 w-4" }),
                "Connect TikTok"
              ] })
            }
          ),
          /* @__PURE__ */ jsx("p", { className: "text-center text-xs text-muted-foreground", children: "Coming soon: Inbox automation" })
        ] }) })
      ] }),
      (connection == null ? void 0 : connection.connected) && /* @__PURE__ */ jsxs(Card, { className: "mb-6", children: [
        /* @__PURE__ */ jsxs(CardHeader, { children: [
          /* @__PURE__ */ jsxs(CardTitle, { className: "flex items-center gap-2", children: [
            "Available Features",
            /* @__PURE__ */ jsx(Badge, { className: "bg-green-100 text-green-800 hover:bg-green-100", children: "Active" })
          ] }),
          /* @__PURE__ */ jsx(CardDescription, { children: "Features you can use right now" })
        ] }),
        /* @__PURE__ */ jsx(CardContent, { children: /* @__PURE__ */ jsx("div", { className: "space-y-3", children: activeFeatures.map((feature) => /* @__PURE__ */ jsxs(
          "div",
          {
            className: "flex items-center gap-4 rounded-lg border p-4 cursor-pointer hover:bg-muted/50 transition-colors",
            onClick: () => navigate(feature.path),
            children: [
              /* @__PURE__ */ jsx("div", { className: "flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10", children: /* @__PURE__ */ jsx(feature.icon, { className: "h-5 w-5 text-primary" }) }),
              /* @__PURE__ */ jsxs("div", { className: "flex-1", children: [
                /* @__PURE__ */ jsx("p", { className: "font-medium", children: feature.label }),
                /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: feature.description })
              ] }),
              /* @__PURE__ */ jsx(Button, { variant: "outline", size: "sm", children: "Open" })
            ]
          },
          feature.label
        )) }) })
      ] }),
      /* @__PURE__ */ jsxs(Card, { className: "mb-6", children: [
        /* @__PURE__ */ jsxs(CardHeader, { children: [
          /* @__PURE__ */ jsxs(CardTitle, { className: "flex items-center gap-2", children: [
            "Coming Soon",
            /* @__PURE__ */ jsxs(Badge, { variant: "secondary", children: [
              /* @__PURE__ */ jsx(Lock, { className: "mr-1 h-3 w-3" }),
              "Preview"
            ] })
          ] }),
          /* @__PURE__ */ jsx(CardDescription, { children: "These features will be available once TikTok approves additional permissions" })
        ] }),
        /* @__PURE__ */ jsx(CardContent, { children: /* @__PURE__ */ jsx("div", { className: "space-y-3", children: comingSoonFeatures.map((feature) => /* @__PURE__ */ jsxs(
          "div",
          {
            className: "flex items-center gap-4 rounded-lg border border-dashed p-4 opacity-60",
            children: [
              /* @__PURE__ */ jsx("div", { className: "flex h-10 w-10 items-center justify-center rounded-lg bg-muted", children: /* @__PURE__ */ jsx(feature.icon, { className: "h-5 w-5 text-muted-foreground" }) }),
              /* @__PURE__ */ jsxs("div", { className: "flex-1", children: [
                /* @__PURE__ */ jsx("p", { className: "font-medium", children: feature.label }),
                /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: feature.description })
              ] }),
              /* @__PURE__ */ jsxs(Badge, { variant: "secondary", children: [
                /* @__PURE__ */ jsx(Clock, { className: "mr-1 h-3 w-3" }),
                "Coming Soon"
              ] })
            ]
          },
          feature.label
        )) }) })
      ] }),
      (connection == null ? void 0 : connection.connected) && /* @__PURE__ */ jsxs(Card, { children: [
        /* @__PURE__ */ jsxs(CardHeader, { children: [
          /* @__PURE__ */ jsx(CardTitle, { children: "Manage Connection" }),
          /* @__PURE__ */ jsx(CardDescription, { children: "You can disconnect your TikTok account anytime" })
        ] }),
        /* @__PURE__ */ jsx(CardContent, { children: /* @__PURE__ */ jsx(
          Button,
          {
            variant: "destructive",
            onClick: () => setShowDisconnectDialog(true),
            disabled: disconnecting,
            children: "Disconnect"
          }
        ) })
      ] })
    ] }),
    /* @__PURE__ */ jsx(AlertDialog, { open: showDisconnectDialog, onOpenChange: setShowDisconnectDialog, children: /* @__PURE__ */ jsxs(AlertDialogContent, { children: [
      /* @__PURE__ */ jsxs(AlertDialogHeader, { children: [
        /* @__PURE__ */ jsx(AlertDialogTitle, { children: "Disconnect TikTok?" }),
        /* @__PURE__ */ jsx(AlertDialogDescription, { children: "This will remove the connected TikTok account from VoyageRespond. You can reconnect anytime." })
      ] }),
      /* @__PURE__ */ jsxs(AlertDialogFooter, { children: [
        /* @__PURE__ */ jsx(AlertDialogCancel, { children: "Cancel" }),
        /* @__PURE__ */ jsx(
          AlertDialogAction,
          {
            onClick: handleDisconnect,
            className: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
            disabled: disconnecting,
            children: disconnecting ? "Disconnecting..." : "Disconnect"
          }
        )
      ] })
    ] }) })
  ] });
}
export {
  TikTokChannel as default
};
