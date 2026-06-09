import { ViteReactSSG } from "vite-react-ssg";
import { jsx, jsxs, Fragment } from "react/jsx-runtime";
import { useLocation, Outlet, NavLink as NavLink$1, useNavigate, Navigate } from "react-router-dom";
import * as React from "react";
import { useEffect, createContext, useState, useContext, useRef, useCallback, forwardRef } from "react";
import * as ToastPrimitives from "@radix-ui/react-toast";
import { cva } from "class-variance-authority";
import { X, PanelLeft, ChevronRight, Check, Circle, ChevronDown, Building2, Zap, Swords, Camera, Mail, Settings, LogOut, LayoutDashboard, Inbox, MessageSquare, Trophy, Star, BarChart3, Sparkles, TrendingUp, FileText, LayoutGrid, Brain, Music2, Video, Send, BedDouble, MapPin, Hotel, Loader2 } from "lucide-react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { useTheme } from "next-themes";
import { Toaster as Toaster$2, toast as toast$1 } from "sonner";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import { useQueryClient, QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useTranslation, initReactI18next } from "react-i18next";
import { createClient } from "@supabase/supabase-js";
import { Slot } from "@radix-ui/react-slot";
import * as SeparatorPrimitive from "@radix-ui/react-separator";
import * as SheetPrimitive from "@radix-ui/react-dialog";
import * as AlertDialogPrimitive from "@radix-ui/react-alert-dialog";
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import * as CollapsiblePrimitive from "@radix-ui/react-collapsible";
import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
if (typeof globalThis.window === "undefined") {
  const noopStorage = {
    length: 0,
    clear: () => {
    },
    getItem: () => null,
    key: () => null,
    removeItem: () => {
    },
    setItem: () => {
    }
  };
  globalThis.window = globalThis;
  globalThis.localStorage = noopStorage;
  globalThis.sessionStorage = noopStorage;
  globalThis.document = globalThis.document ?? {
    cookie: "",
    documentElement: { dataset: {}, setAttribute: () => {
    }, classList: { add: () => {
    }, remove: () => {
    } } },
    head: { appendChild: () => {
    } },
    body: { appendChild: () => {
    } },
    createElement: () => ({ setAttribute: () => {
    }, appendChild: () => {
    } }),
    addEventListener: () => {
    },
    removeEventListener: () => {
    },
    querySelector: () => null,
    querySelectorAll: () => [],
    getElementById: () => null
  };
  globalThis.navigator = globalThis.navigator ?? { userAgent: "ssr", language: "tr-TR", languages: ["tr-TR"] };
  globalThis.location = globalThis.location ?? { href: "", origin: "", pathname: "/", search: "", hash: "" };
  globalThis.matchMedia = () => ({ matches: false, addEventListener: () => {
  }, removeEventListener: () => {
  }, addListener: () => {
  }, removeListener: () => {
  } });
}
const TOAST_LIMIT = 1;
const TOAST_REMOVE_DELAY = 1e6;
let count = 0;
function genId() {
  count = (count + 1) % Number.MAX_SAFE_INTEGER;
  return count.toString();
}
const toastTimeouts = /* @__PURE__ */ new Map();
const addToRemoveQueue = (toastId) => {
  if (toastTimeouts.has(toastId)) {
    return;
  }
  const timeout = setTimeout(() => {
    toastTimeouts.delete(toastId);
    dispatch({
      type: "REMOVE_TOAST",
      toastId
    });
  }, TOAST_REMOVE_DELAY);
  toastTimeouts.set(toastId, timeout);
};
const reducer = (state, action) => {
  switch (action.type) {
    case "ADD_TOAST":
      return {
        ...state,
        toasts: [action.toast, ...state.toasts].slice(0, TOAST_LIMIT)
      };
    case "UPDATE_TOAST":
      return {
        ...state,
        toasts: state.toasts.map((t) => t.id === action.toast.id ? { ...t, ...action.toast } : t)
      };
    case "DISMISS_TOAST": {
      const { toastId } = action;
      if (toastId) {
        addToRemoveQueue(toastId);
      } else {
        state.toasts.forEach((toast2) => {
          addToRemoveQueue(toast2.id);
        });
      }
      return {
        ...state,
        toasts: state.toasts.map(
          (t) => t.id === toastId || toastId === void 0 ? {
            ...t,
            open: false
          } : t
        )
      };
    }
    case "REMOVE_TOAST":
      if (action.toastId === void 0) {
        return {
          ...state,
          toasts: []
        };
      }
      return {
        ...state,
        toasts: state.toasts.filter((t) => t.id !== action.toastId)
      };
  }
};
const listeners = [];
let memoryState = { toasts: [] };
function dispatch(action) {
  memoryState = reducer(memoryState, action);
  listeners.forEach((listener) => {
    listener(memoryState);
  });
}
function toast({ ...props }) {
  const id = genId();
  const update = (props2) => dispatch({
    type: "UPDATE_TOAST",
    toast: { ...props2, id }
  });
  const dismiss = () => dispatch({ type: "DISMISS_TOAST", toastId: id });
  dispatch({
    type: "ADD_TOAST",
    toast: {
      ...props,
      id,
      open: true,
      onOpenChange: (open) => {
        if (!open) dismiss();
      }
    }
  });
  return {
    id,
    dismiss,
    update
  };
}
function useToast() {
  const [state, setState] = React.useState(memoryState);
  React.useEffect(() => {
    listeners.push(setState);
    return () => {
      const index = listeners.indexOf(setState);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    };
  }, [state]);
  return {
    ...state,
    toast,
    dismiss: (toastId) => dispatch({ type: "DISMISS_TOAST", toastId })
  };
}
function cn(...inputs) {
  return twMerge(clsx(inputs));
}
const ToastProvider = ToastPrimitives.Provider;
const ToastViewport = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  ToastPrimitives.Viewport,
  {
    ref,
    className: cn(
      "fixed top-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]",
      className
    ),
    ...props
  }
));
ToastViewport.displayName = ToastPrimitives.Viewport.displayName;
const toastVariants = cva(
  "group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border p-6 pr-8 shadow-lg transition-all data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:transition-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-top-full data-[state=open]:sm:slide-in-from-bottom-full",
  {
    variants: {
      variant: {
        default: "border bg-background text-foreground",
        destructive: "destructive group border-destructive bg-destructive text-destructive-foreground"
      }
    },
    defaultVariants: {
      variant: "default"
    }
  }
);
const Toast = React.forwardRef(({ className, variant, ...props }, ref) => {
  return /* @__PURE__ */ jsx(ToastPrimitives.Root, { ref, className: cn(toastVariants({ variant }), className), ...props });
});
Toast.displayName = ToastPrimitives.Root.displayName;
const ToastAction = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  ToastPrimitives.Action,
  {
    ref,
    className: cn(
      "inline-flex h-8 shrink-0 items-center justify-center rounded-md border bg-transparent px-3 text-sm font-medium ring-offset-background transition-colors group-[.destructive]:border-muted/40 hover:bg-secondary group-[.destructive]:hover:border-destructive/30 group-[.destructive]:hover:bg-destructive group-[.destructive]:hover:text-destructive-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 group-[.destructive]:focus:ring-destructive disabled:pointer-events-none disabled:opacity-50",
      className
    ),
    ...props
  }
));
ToastAction.displayName = ToastPrimitives.Action.displayName;
const ToastClose = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  ToastPrimitives.Close,
  {
    ref,
    className: cn(
      "absolute right-2 top-2 rounded-md p-1 text-foreground/50 opacity-0 transition-opacity group-hover:opacity-100 group-[.destructive]:text-red-300 hover:text-foreground group-[.destructive]:hover:text-red-50 focus:opacity-100 focus:outline-none focus:ring-2 group-[.destructive]:focus:ring-red-400 group-[.destructive]:focus:ring-offset-red-600",
      className
    ),
    "toast-close": "",
    ...props,
    children: /* @__PURE__ */ jsx(X, { className: "h-4 w-4" })
  }
));
ToastClose.displayName = ToastPrimitives.Close.displayName;
const ToastTitle = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(ToastPrimitives.Title, { ref, className: cn("text-sm font-semibold", className), ...props }));
ToastTitle.displayName = ToastPrimitives.Title.displayName;
const ToastDescription = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(ToastPrimitives.Description, { ref, className: cn("text-sm opacity-90", className), ...props }));
ToastDescription.displayName = ToastPrimitives.Description.displayName;
function Toaster$1() {
  const { toasts } = useToast();
  return /* @__PURE__ */ jsxs(ToastProvider, { children: [
    toasts.map(function({ id, title, description, action, ...props }) {
      return /* @__PURE__ */ jsxs(Toast, { ...props, children: [
        /* @__PURE__ */ jsxs("div", { className: "grid gap-1", children: [
          title && /* @__PURE__ */ jsx(ToastTitle, { children: title }),
          description && /* @__PURE__ */ jsx(ToastDescription, { children: description })
        ] }),
        action,
        /* @__PURE__ */ jsx(ToastClose, {})
      ] }, id);
    }),
    /* @__PURE__ */ jsx(ToastViewport, {})
  ] });
}
const Toaster = ({ ...props }) => {
  const { theme = "system" } = useTheme();
  return /* @__PURE__ */ jsx(
    Toaster$2,
    {
      theme,
      className: "toaster group",
      toastOptions: {
        classNames: {
          toast: "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-muted-foreground",
          actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground"
        }
      },
      ...props
    }
  );
};
const TooltipProvider = TooltipPrimitive.Provider;
const Tooltip = TooltipPrimitive.Root;
const TooltipTrigger = TooltipPrimitive.Trigger;
const TooltipContent = React.forwardRef(({ className, sideOffset = 4, ...props }, ref) => /* @__PURE__ */ jsx(
  TooltipPrimitive.Content,
  {
    ref,
    sideOffset,
    className: cn(
      "z-50 overflow-hidden rounded-md border bg-popover px-3 py-1.5 text-sm text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
      className
    ),
    ...props
  }
));
TooltipContent.displayName = TooltipPrimitive.Content.displayName;
function LocaleSync() {
  const { i18n: i18n2 } = useTranslation();
  const { pathname } = useLocation();
  useEffect(() => {
    const isEn = pathname === "/en" || pathname.startsWith("/en/");
    const target = isEn ? "en" : "tr";
    if (i18n2.language !== target) {
      i18n2.changeLanguage(target);
    }
    if (typeof document !== "undefined") {
      document.documentElement.lang = target;
    }
  }, [pathname, i18n2]);
  return null;
}
function useUrlLocale() {
  const { pathname } = useLocation();
  const locale = pathname === "/en" || pathname.startsWith("/en/") ? "en" : "tr";
  const stripped = locale === "en" ? pathname.replace(/^\/en(?=\/|$)/, "") || "/" : pathname;
  const buildPath = (target, path) => {
    const p = path ?? stripped;
    const clean = p.startsWith("/") ? p : `/${p}`;
    if (target === "en") return clean === "/" ? "/en" : `/en${clean}`;
    return clean;
  };
  return { locale, stripped, buildPath };
}
const SUPABASE_URL = "https://pnpuhewfoxssmbpryart.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBucHVoZXdmb3hzc21icHJ5YXJ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQyNTExNDcsImV4cCI6MjA3OTgyNzE0N30.mF2d8PwkoFTYEGy_gvEcTYSEzEOglmRBUzVbZE1G4PM";
const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true
  }
});
const AuthContext = createContext({
  user: null,
  session: null,
  profile: null,
  role: null,
  loading: true,
  refreshProfile: async () => {
  }
});
const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const fetchProfile = async (userId) => {
    try {
      const { data, error } = await supabase.from("profiles").select("*").eq("user_id", userId).maybeSingle();
      if (error) {
        console.error("Error fetching profile:", error);
        return;
      }
      setProfile(data);
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  };
  const notifyFirstAction = async (u) => {
    var _a;
    try {
      const key = `vr_first_action_notified_${u.id}`;
      if (localStorage.getItem(key)) return;
      localStorage.setItem(key, "1");
      await supabase.functions.invoke("notify-first-action", {
        body: {
          user_id: u.id,
          email: u.email,
          full_name: ((_a = u.user_metadata) == null ? void 0 : _a.full_name) ?? null,
          action: "session_active"
        }
      });
    } catch (e) {
      console.error("notify-first-action failed", e);
    }
  };
  const refreshProfile = async () => {
    if (user == null ? void 0 : user.id) {
      await fetchProfile(user.id);
    }
  };
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session2) => {
        setSession(session2);
        setUser((session2 == null ? void 0 : session2.user) ?? null);
        if (session2 == null ? void 0 : session2.user) {
          setTimeout(() => {
            fetchProfile(session2.user.id);
            notifyFirstAction(session2.user);
          }, 0);
        } else {
          setProfile(null);
        }
        setLoading(false);
      }
    );
    supabase.auth.getSession().then(({ data: { session: session2 } }) => {
      setSession(session2);
      setUser((session2 == null ? void 0 : session2.user) ?? null);
      if (session2 == null ? void 0 : session2.user) {
        fetchProfile(session2.user.id).then(() => {
          setLoading(false);
        });
        notifyFirstAction(session2.user);
      } else {
        setLoading(false);
      }
    });
    return () => subscription.unsubscribe();
  }, []);
  const role = (profile == null ? void 0 : profile.role) ?? null;
  return /* @__PURE__ */ jsx(AuthContext.Provider, { value: { user, session, profile, role, loading, refreshProfile }, children });
}
const BusinessContext = createContext({
  businesses: [],
  activeBusiness: null,
  setActiveBusiness: () => {
  },
  loading: true,
  refetchBusinesses: async () => {
  }
});
const useBusiness = () => {
  const context = useContext(BusinessContext);
  if (!context) {
    throw new Error("useBusiness must be used within BusinessProvider");
  }
  return context;
};
function BusinessProvider({ children }) {
  const { user } = useAuth();
  const [businesses, setBusinesses] = useState([]);
  const [activeBusiness, setActiveBusiness] = useState(null);
  const [loading, setLoading] = useState(true);
  const fetchBusinesses = async () => {
    if (!user) {
      setBusinesses([]);
      setActiveBusiness(null);
      setLoading(false);
      return;
    }
    try {
      const { data, error } = await supabase.from("businesses").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
      if (error) throw error;
      setBusinesses(data || []);
      if (data && data.length > 0) {
        const currentId = activeBusiness == null ? void 0 : activeBusiness.id;
        const updated = currentId ? data.find((b) => b.id === currentId) : null;
        setActiveBusiness(updated || data[0]);
      } else {
        setActiveBusiness(null);
      }
    } catch (error) {
      console.error("Error fetching businesses:", error);
    } finally {
      setLoading(false);
    }
  };
  const refetchBusinesses = async () => {
    await fetchBusinesses();
  };
  useEffect(() => {
    fetchBusinesses();
  }, [user == null ? void 0 : user.id]);
  return /* @__PURE__ */ jsx(
    BusinessContext.Provider,
    {
      value: {
        businesses,
        activeBusiness,
        setActiveBusiness,
        loading,
        refetchBusinesses
      },
      children
    }
  );
}
const ReviewFetchContext = createContext(null);
function useReviewFetch() {
  const ctx = useContext(ReviewFetchContext);
  if (!ctx) throw new Error("useReviewFetch must be used within ReviewFetchProvider");
  return ctx;
}
const platformLabels$1 = {
  google: "Google",
  booking: "Booking.com",
  tripadvisor: "TripAdvisor",
  trustpilot: "Trustpilot",
  hotelscom: "Hotels.com"
};
const POLL_INTERVAL_MS = 3e3;
function ReviewFetchProvider({ children }) {
  const [pendingRunsState, setPendingRunsState] = useState(/* @__PURE__ */ new Map());
  const pendingRunsRef = useRef(/* @__PURE__ */ new Map());
  const onFetchCompleteRef = useRef();
  const hasPendingRuns = pendingRunsState.size > 0;
  const setOnFetchComplete = useCallback((cb) => {
    onFetchCompleteRef.current = cb;
  }, []);
  const startFetch = useCallback(async (params) => {
    var _a;
    const { businessId, businessName, platform } = params;
    const functionName = params.functionName || (platform === "tripadvisor" ? "tripadvisor-fetch-reviews" : "apify-fetch-reviews");
    const response = await supabase.functions.invoke(functionName, {
      body: { business_id: businessId, ...platform !== "tripadvisor" ? { platform } : {} }
    });
    if (response.error) {
      const msg = ((_a = response.data) == null ? void 0 : _a.error) || response.error.message || "Bilinmeyen hata";
      throw new Error(msg);
    }
    const result = response.data;
    if (result == null ? void 0 : result.success) return result;
    if ((result == null ? void 0 : result.status) === "running" && (result == null ? void 0 : result.run_id)) {
      const key = `${businessId}-${platform}`;
      const run = {
        runId: result.run_id,
        platform,
        functionName,
        businessId,
        businessName,
        startedAt: Date.now()
      };
      pendingRunsRef.current.set(key, run);
      setPendingRunsState(new Map(pendingRunsRef.current));
      return { status: "started", run_id: result.run_id };
    }
    return result;
  }, []);
  useEffect(() => {
    if (!hasPendingRuns) return;
    const interval = setInterval(async () => {
      var _a;
      const entries = Array.from(pendingRunsRef.current.entries());
      if (entries.length === 0) {
        setPendingRunsState(/* @__PURE__ */ new Map());
        return;
      }
      for (const [key, run] of entries) {
        try {
          const pollResp = await supabase.functions.invoke(run.functionName, {
            body: {
              business_id: run.businessId,
              ...run.platform !== "tripadvisor" ? { platform: run.platform } : {},
              run_id: run.runId
            }
          });
          if (pollResp.error) continue;
          const result = pollResp.data;
          if ((result == null ? void 0 : result.status) === "running") continue;
          pendingRunsRef.current.delete(key);
          setPendingRunsState(new Map(pendingRunsRef.current));
          if (result == null ? void 0 : result.success) {
            toast({
              title: `${platformLabels$1[run.platform] || run.platform} Yorumları Çekildi! 🎉`,
              description: `${run.businessName}: ${result.inserted} yeni yorum eklendi${result.skipped ? `, ${result.skipped} zaten mevcut` : ""}.`
            });
            (_a = onFetchCompleteRef.current) == null ? void 0 : _a.call(onFetchCompleteRef);
          } else {
            toast({
              title: "Hata",
              description: (result == null ? void 0 : result.message) || (result == null ? void 0 : result.error) || "Yorum çekme başarısız.",
              variant: "destructive"
            });
          }
        } catch {
        }
      }
    }, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [hasPendingRuns]);
  return /* @__PURE__ */ jsx(ReviewFetchContext.Provider, { value: {
    pendingRuns: pendingRunsState,
    hasPendingRuns,
    startFetch,
    setOnFetchComplete
  }, children });
}
const NewReviewsContext = createContext({
  unreadCount: 0,
  markAllRead: () => {
  },
  pushPermission: "default",
  requestPushPermission: async () => {
  }
});
const useNewReviews = () => useContext(NewReviewsContext);
const STORAGE_KEY = "vr_last_seen_reviews";
function getLastSeen(businessId) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return (/* @__PURE__ */ new Date(0)).toISOString();
    const map = JSON.parse(raw);
    return map[businessId] || (/* @__PURE__ */ new Date(0)).toISOString();
  } catch {
    return (/* @__PURE__ */ new Date(0)).toISOString();
  }
}
function setLastSeen(businessId, iso) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const map = raw ? JSON.parse(raw) : {};
    map[businessId] = iso;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  } catch {
  }
}
function NewReviewsProvider({ children }) {
  const { activeBusiness } = useBusiness();
  const queryClient2 = useQueryClient();
  const [unreadCount, setUnreadCount] = useState(0);
  const [pushPermission, setPushPermission] = useState(
    typeof window !== "undefined" && "Notification" in window ? Notification.permission : "unsupported"
  );
  const channelRef = useRef(null);
  const refreshCount = useCallback(async () => {
    if (!activeBusiness) {
      setUnreadCount(0);
      return;
    }
    const lastSeen = getLastSeen(activeBusiness.id);
    const { count: count2, error } = await supabase.from("reviews").select("id", { count: "exact", head: true }).eq("business_id", activeBusiness.id).gt("created_at", lastSeen);
    if (!error) setUnreadCount(count2 || 0);
  }, [activeBusiness]);
  useEffect(() => {
    refreshCount();
  }, [refreshCount]);
  useEffect(() => {
    if (!activeBusiness) return;
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }
    const channel = supabase.channel(`reviews-realtime-${activeBusiness.id}`).on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "reviews",
        filter: `business_id=eq.${activeBusiness.id}`
      },
      (payload) => {
        var _a;
        const review = payload.new;
        setUnreadCount((c) => c + 1);
        const stars = "⭐".repeat(review.rating || 0);
        toast$1(
          `Yeni yorum: ${review.reviewer_name || "Anonim"} ${stars}`,
          {
            description: ((_a = review.text) == null ? void 0 : _a.slice(0, 100)) || `${review.platform || "Platform"} üzerinden yeni yorum geldi.`,
            duration: 6e3
          }
        );
        if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
          try {
            const n = new Notification(`Yeni yorum (${review.rating || "?"}⭐)`, {
              body: `${review.reviewer_name || "Anonim"}: ${(review.text || "").slice(0, 120)}`,
              icon: "/favicon.svg",
              tag: `review-${activeBusiness.id}`
            });
            n.onclick = () => {
              window.focus();
              window.location.href = "/reviews";
              n.close();
            };
          } catch (err) {
            console.warn("Push notification failed:", err);
          }
        }
        queryClient2.invalidateQueries({ queryKey: ["reviews"] });
        queryClient2.invalidateQueries({ queryKey: ["reviews-stats"] });
      }
    ).subscribe();
    channelRef.current = channel;
    return () => {
      supabase.removeChannel(channel);
      channelRef.current = null;
    };
  }, [activeBusiness, queryClient2]);
  const markAllRead = useCallback(() => {
    if (!activeBusiness) return;
    setLastSeen(activeBusiness.id, (/* @__PURE__ */ new Date()).toISOString());
    setUnreadCount(0);
  }, [activeBusiness]);
  const requestPushPermission = useCallback(async () => {
    if (typeof window === "undefined" || !("Notification" in window)) {
      toast$1.error("Tarayıcınız bildirimleri desteklemiyor");
      return;
    }
    const result = await Notification.requestPermission();
    setPushPermission(result);
    if (result === "granted") {
      toast$1.success("Bildirimler aktif edildi");
    } else if (result === "denied") {
      toast$1.error("Bildirimler reddedildi. Tarayıcı ayarlarından değiştirebilirsiniz.");
    }
  }, []);
  return /* @__PURE__ */ jsx(NewReviewsContext.Provider, { value: { unreadCount, markAllRead, pushPermission, requestPushPermission }, children });
}
const queryClient = new QueryClient();
function RootLayout() {
  return /* @__PURE__ */ jsx(QueryClientProvider, { client: queryClient, children: /* @__PURE__ */ jsx(AuthProvider, { children: /* @__PURE__ */ jsx(BusinessProvider, { children: /* @__PURE__ */ jsx(NewReviewsProvider, { children: /* @__PURE__ */ jsx(ReviewFetchProvider, { children: /* @__PURE__ */ jsxs(TooltipProvider, { children: [
    /* @__PURE__ */ jsx(Toaster$1, {}),
    /* @__PURE__ */ jsx(Toaster, {}),
    /* @__PURE__ */ jsx(LocaleSync, {}),
    /* @__PURE__ */ jsx(Outlet, {})
  ] }) }) }) }) }) });
}
const MOBILE_BREAKPOINT = 768;
function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState(void 0);
  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    };
    mql.addEventListener("change", onChange);
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    return () => mql.removeEventListener("change", onChange);
  }, []);
  return !!isMobile;
}
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline"
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    }
  }
);
const Button = React.forwardRef(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return /* @__PURE__ */ jsx(Comp, { className: cn(buttonVariants({ variant, size, className })), ref, ...props });
  }
);
Button.displayName = "Button";
const Input = React.forwardRef(
  ({ className, type, ...props }, ref) => {
    return /* @__PURE__ */ jsx(
      "input",
      {
        type,
        className: cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          className
        ),
        ref,
        ...props
      }
    );
  }
);
Input.displayName = "Input";
const Separator = React.forwardRef(({ className, orientation = "horizontal", decorative = true, ...props }, ref) => /* @__PURE__ */ jsx(
  SeparatorPrimitive.Root,
  {
    ref,
    decorative,
    orientation,
    className: cn("shrink-0 bg-border", orientation === "horizontal" ? "h-[1px] w-full" : "h-full w-[1px]", className),
    ...props
  }
));
Separator.displayName = SeparatorPrimitive.Root.displayName;
const Sheet = SheetPrimitive.Root;
const SheetPortal = SheetPrimitive.Portal;
const SheetOverlay = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  SheetPrimitive.Overlay,
  {
    className: cn(
      "fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    ),
    ...props,
    ref
  }
));
SheetOverlay.displayName = SheetPrimitive.Overlay.displayName;
const sheetVariants = cva(
  "fixed z-50 gap-4 bg-background p-6 shadow-lg transition ease-in-out data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:duration-300 data-[state=open]:duration-500",
  {
    variants: {
      side: {
        top: "inset-x-0 top-0 border-b data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top",
        bottom: "inset-x-0 bottom-0 border-t data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom",
        left: "inset-y-0 left-0 h-full w-3/4 border-r data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left sm:max-w-sm",
        right: "inset-y-0 right-0 h-full w-3/4  border-l data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right sm:max-w-sm"
      }
    },
    defaultVariants: {
      side: "right"
    }
  }
);
const SheetContent = React.forwardRef(
  ({ side = "right", className, children, ...props }, ref) => /* @__PURE__ */ jsxs(SheetPortal, { children: [
    /* @__PURE__ */ jsx(SheetOverlay, {}),
    /* @__PURE__ */ jsxs(SheetPrimitive.Content, { ref, className: cn(sheetVariants({ side }), className), ...props, children: [
      children,
      /* @__PURE__ */ jsxs(SheetPrimitive.Close, { className: "absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity data-[state=open]:bg-secondary hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none", children: [
        /* @__PURE__ */ jsx(X, { className: "h-4 w-4" }),
        /* @__PURE__ */ jsx("span", { className: "sr-only", children: "Close" })
      ] })
    ] })
  ] })
);
SheetContent.displayName = SheetPrimitive.Content.displayName;
const SheetHeader = ({ className, ...props }) => /* @__PURE__ */ jsx("div", { className: cn("flex flex-col space-y-2 text-center sm:text-left", className), ...props });
SheetHeader.displayName = "SheetHeader";
const SheetTitle = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(SheetPrimitive.Title, { ref, className: cn("text-lg font-semibold text-foreground", className), ...props }));
SheetTitle.displayName = SheetPrimitive.Title.displayName;
const SheetDescription = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(SheetPrimitive.Description, { ref, className: cn("text-sm text-muted-foreground", className), ...props }));
SheetDescription.displayName = SheetPrimitive.Description.displayName;
function Skeleton({ className, ...props }) {
  return /* @__PURE__ */ jsx("div", { className: cn("animate-pulse rounded-md bg-muted", className), ...props });
}
const SIDEBAR_COOKIE_NAME = "sidebar:state";
const SIDEBAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 7;
const SIDEBAR_WIDTH = "16rem";
const SIDEBAR_WIDTH_MOBILE = "18rem";
const SIDEBAR_WIDTH_ICON = "3rem";
const SIDEBAR_KEYBOARD_SHORTCUT = "b";
const SidebarContext = React.createContext(null);
function useSidebar() {
  const context = React.useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider.");
  }
  return context;
}
const SidebarProvider = React.forwardRef(({ defaultOpen = true, open: openProp, onOpenChange: setOpenProp, className, style, children, ...props }, ref) => {
  const isMobile = useIsMobile();
  const [openMobile, setOpenMobile] = React.useState(false);
  const [_open, _setOpen] = React.useState(defaultOpen);
  const open = openProp ?? _open;
  const setOpen = React.useCallback(
    (value) => {
      const openState = typeof value === "function" ? value(open) : value;
      if (setOpenProp) {
        setOpenProp(openState);
      } else {
        _setOpen(openState);
      }
      document.cookie = `${SIDEBAR_COOKIE_NAME}=${openState}; path=/; max-age=${SIDEBAR_COOKIE_MAX_AGE}`;
    },
    [setOpenProp, open]
  );
  const toggleSidebar = React.useCallback(() => {
    return isMobile ? setOpenMobile((open2) => !open2) : setOpen((open2) => !open2);
  }, [isMobile, setOpen, setOpenMobile]);
  React.useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === SIDEBAR_KEYBOARD_SHORTCUT && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        toggleSidebar();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [toggleSidebar]);
  const state = open ? "expanded" : "collapsed";
  const contextValue = React.useMemo(
    () => ({
      state,
      open,
      setOpen,
      isMobile,
      openMobile,
      setOpenMobile,
      toggleSidebar
    }),
    [state, open, setOpen, isMobile, openMobile, setOpenMobile, toggleSidebar]
  );
  return /* @__PURE__ */ jsx(SidebarContext.Provider, { value: contextValue, children: /* @__PURE__ */ jsx(TooltipProvider, { delayDuration: 0, children: /* @__PURE__ */ jsx(
    "div",
    {
      style: {
        "--sidebar-width": SIDEBAR_WIDTH,
        "--sidebar-width-icon": SIDEBAR_WIDTH_ICON,
        ...style
      },
      className: cn("group/sidebar-wrapper flex min-h-svh w-full has-[[data-variant=inset]]:bg-sidebar", className),
      ref,
      ...props,
      children
    }
  ) }) });
});
SidebarProvider.displayName = "SidebarProvider";
const Sidebar = React.forwardRef(({ side = "left", variant = "sidebar", collapsible = "offcanvas", className, children, ...props }, ref) => {
  const { isMobile, state, openMobile, setOpenMobile } = useSidebar();
  if (collapsible === "none") {
    return /* @__PURE__ */ jsx(
      "div",
      {
        className: cn("flex h-full w-[--sidebar-width] flex-col bg-sidebar text-sidebar-foreground", className),
        ref,
        ...props,
        children
      }
    );
  }
  if (isMobile) {
    return /* @__PURE__ */ jsx(Sheet, { open: openMobile, onOpenChange: setOpenMobile, ...props, children: /* @__PURE__ */ jsx(
      SheetContent,
      {
        "data-sidebar": "sidebar",
        "data-mobile": "true",
        className: "w-[--sidebar-width] bg-sidebar p-0 text-sidebar-foreground [&>button]:hidden",
        style: {
          "--sidebar-width": SIDEBAR_WIDTH_MOBILE
        },
        side,
        children: /* @__PURE__ */ jsx("div", { className: "flex h-full w-full flex-col", children })
      }
    ) });
  }
  return /* @__PURE__ */ jsxs(
    "div",
    {
      ref,
      className: "group peer hidden text-sidebar-foreground md:block",
      "data-state": state,
      "data-collapsible": state === "collapsed" ? collapsible : "",
      "data-variant": variant,
      "data-side": side,
      children: [
        /* @__PURE__ */ jsx(
          "div",
          {
            className: cn(
              "relative h-svh w-[--sidebar-width] bg-transparent transition-[width] duration-200 ease-linear",
              "group-data-[collapsible=offcanvas]:w-0",
              "group-data-[side=right]:rotate-180",
              variant === "floating" || variant === "inset" ? "group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)_+_theme(spacing.4))]" : "group-data-[collapsible=icon]:w-[--sidebar-width-icon]"
            )
          }
        ),
        /* @__PURE__ */ jsx(
          "div",
          {
            className: cn(
              "fixed inset-y-0 z-10 hidden h-svh w-[--sidebar-width] transition-[left,right,width] duration-200 ease-linear md:flex",
              side === "left" ? "left-0 group-data-[collapsible=offcanvas]:left-[calc(var(--sidebar-width)*-1)]" : "right-0 group-data-[collapsible=offcanvas]:right-[calc(var(--sidebar-width)*-1)]",
              // Adjust the padding for floating and inset variants.
              variant === "floating" || variant === "inset" ? "p-2 group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)_+_theme(spacing.4)_+2px)]" : "group-data-[collapsible=icon]:w-[--sidebar-width-icon] group-data-[side=left]:border-r group-data-[side=right]:border-l",
              className
            ),
            ...props,
            children: /* @__PURE__ */ jsx(
              "div",
              {
                "data-sidebar": "sidebar",
                className: "flex h-full w-full flex-col bg-sidebar group-data-[variant=floating]:rounded-lg group-data-[variant=floating]:border group-data-[variant=floating]:border-sidebar-border group-data-[variant=floating]:shadow",
                children
              }
            )
          }
        )
      ]
    }
  );
});
Sidebar.displayName = "Sidebar";
const SidebarTrigger = React.forwardRef(
  ({ className, onClick, ...props }, ref) => {
    const { toggleSidebar } = useSidebar();
    return /* @__PURE__ */ jsxs(
      Button,
      {
        ref,
        "data-sidebar": "trigger",
        variant: "ghost",
        size: "icon",
        className: cn("h-7 w-7", className),
        onClick: (event) => {
          onClick == null ? void 0 : onClick(event);
          toggleSidebar();
        },
        ...props,
        children: [
          /* @__PURE__ */ jsx(PanelLeft, {}),
          /* @__PURE__ */ jsx("span", { className: "sr-only", children: "Toggle Sidebar" })
        ]
      }
    );
  }
);
SidebarTrigger.displayName = "SidebarTrigger";
const SidebarRail = React.forwardRef(
  ({ className, ...props }, ref) => {
    const { toggleSidebar } = useSidebar();
    return /* @__PURE__ */ jsx(
      "button",
      {
        ref,
        "data-sidebar": "rail",
        "aria-label": "Toggle Sidebar",
        tabIndex: -1,
        onClick: toggleSidebar,
        title: "Toggle Sidebar",
        className: cn(
          "absolute inset-y-0 z-20 hidden w-4 -translate-x-1/2 transition-all ease-linear after:absolute after:inset-y-0 after:left-1/2 after:w-[2px] group-data-[side=left]:-right-4 group-data-[side=right]:left-0 hover:after:bg-sidebar-border sm:flex",
          "[[data-side=left]_&]:cursor-w-resize [[data-side=right]_&]:cursor-e-resize",
          "[[data-side=left][data-state=collapsed]_&]:cursor-e-resize [[data-side=right][data-state=collapsed]_&]:cursor-w-resize",
          "group-data-[collapsible=offcanvas]:translate-x-0 group-data-[collapsible=offcanvas]:after:left-full group-data-[collapsible=offcanvas]:hover:bg-sidebar",
          "[[data-side=left][data-collapsible=offcanvas]_&]:-right-2",
          "[[data-side=right][data-collapsible=offcanvas]_&]:-left-2",
          className
        ),
        ...props
      }
    );
  }
);
SidebarRail.displayName = "SidebarRail";
const SidebarInset = React.forwardRef(({ className, ...props }, ref) => {
  return /* @__PURE__ */ jsx(
    "main",
    {
      ref,
      className: cn(
        "relative flex min-h-svh flex-1 flex-col bg-background",
        "peer-data-[variant=inset]:min-h-[calc(100svh-theme(spacing.4))] md:peer-data-[variant=inset]:m-2 md:peer-data-[state=collapsed]:peer-data-[variant=inset]:ml-2 md:peer-data-[variant=inset]:ml-0 md:peer-data-[variant=inset]:rounded-xl md:peer-data-[variant=inset]:shadow",
        className
      ),
      ...props
    }
  );
});
SidebarInset.displayName = "SidebarInset";
const SidebarInput = React.forwardRef(
  ({ className, ...props }, ref) => {
    return /* @__PURE__ */ jsx(
      Input,
      {
        ref,
        "data-sidebar": "input",
        className: cn(
          "h-8 w-full bg-background shadow-none focus-visible:ring-2 focus-visible:ring-sidebar-ring",
          className
        ),
        ...props
      }
    );
  }
);
SidebarInput.displayName = "SidebarInput";
const SidebarHeader = React.forwardRef(({ className, ...props }, ref) => {
  return /* @__PURE__ */ jsx("div", { ref, "data-sidebar": "header", className: cn("flex flex-col gap-2 p-2", className), ...props });
});
SidebarHeader.displayName = "SidebarHeader";
const SidebarFooter = React.forwardRef(({ className, ...props }, ref) => {
  return /* @__PURE__ */ jsx("div", { ref, "data-sidebar": "footer", className: cn("flex flex-col gap-2 p-2", className), ...props });
});
SidebarFooter.displayName = "SidebarFooter";
const SidebarSeparator = React.forwardRef(
  ({ className, ...props }, ref) => {
    return /* @__PURE__ */ jsx(
      Separator,
      {
        ref,
        "data-sidebar": "separator",
        className: cn("mx-2 w-auto bg-sidebar-border", className),
        ...props
      }
    );
  }
);
SidebarSeparator.displayName = "SidebarSeparator";
const SidebarContent = React.forwardRef(({ className, ...props }, ref) => {
  return /* @__PURE__ */ jsx(
    "div",
    {
      ref,
      "data-sidebar": "content",
      className: cn(
        "flex min-h-0 flex-1 flex-col gap-2 overflow-auto group-data-[collapsible=icon]:overflow-hidden",
        className
      ),
      ...props
    }
  );
});
SidebarContent.displayName = "SidebarContent";
const SidebarGroup = React.forwardRef(({ className, ...props }, ref) => {
  return /* @__PURE__ */ jsx(
    "div",
    {
      ref,
      "data-sidebar": "group",
      className: cn("relative flex w-full min-w-0 flex-col p-2", className),
      ...props
    }
  );
});
SidebarGroup.displayName = "SidebarGroup";
const SidebarGroupLabel = React.forwardRef(
  ({ className, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "div";
    return /* @__PURE__ */ jsx(
      Comp,
      {
        ref,
        "data-sidebar": "group-label",
        className: cn(
          "flex h-8 shrink-0 items-center rounded-md px-2 text-xs font-medium text-sidebar-foreground/70 outline-none ring-sidebar-ring transition-[margin,opa] duration-200 ease-linear focus-visible:ring-2 [&>svg]:size-4 [&>svg]:shrink-0",
          "group-data-[collapsible=icon]:-mt-8 group-data-[collapsible=icon]:opacity-0",
          className
        ),
        ...props
      }
    );
  }
);
SidebarGroupLabel.displayName = "SidebarGroupLabel";
const SidebarGroupAction = React.forwardRef(
  ({ className, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return /* @__PURE__ */ jsx(
      Comp,
      {
        ref,
        "data-sidebar": "group-action",
        className: cn(
          "absolute right-3 top-3.5 flex aspect-square w-5 items-center justify-center rounded-md p-0 text-sidebar-foreground outline-none ring-sidebar-ring transition-transform hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 [&>svg]:size-4 [&>svg]:shrink-0",
          // Increases the hit area of the button on mobile.
          "after:absolute after:-inset-2 after:md:hidden",
          "group-data-[collapsible=icon]:hidden",
          className
        ),
        ...props
      }
    );
  }
);
SidebarGroupAction.displayName = "SidebarGroupAction";
const SidebarGroupContent = React.forwardRef(
  ({ className, ...props }, ref) => /* @__PURE__ */ jsx("div", { ref, "data-sidebar": "group-content", className: cn("w-full text-sm", className), ...props })
);
SidebarGroupContent.displayName = "SidebarGroupContent";
const SidebarMenu = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx("ul", { ref, "data-sidebar": "menu", className: cn("flex w-full min-w-0 flex-col gap-1", className), ...props }));
SidebarMenu.displayName = "SidebarMenu";
const SidebarMenuItem = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx("li", { ref, "data-sidebar": "menu-item", className: cn("group/menu-item relative", className), ...props }));
SidebarMenuItem.displayName = "SidebarMenuItem";
const sidebarMenuButtonVariants = cva(
  "peer/menu-button flex w-full items-center gap-2 overflow-hidden rounded-md p-2 text-left text-sm outline-none ring-sidebar-ring transition-[width,height,padding] hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 active:bg-sidebar-accent active:text-sidebar-accent-foreground disabled:pointer-events-none disabled:opacity-50 group-has-[[data-sidebar=menu-action]]/menu-item:pr-8 aria-disabled:pointer-events-none aria-disabled:opacity-50 data-[active=true]:bg-sidebar-accent data-[active=true]:font-medium data-[active=true]:text-sidebar-accent-foreground data-[state=open]:hover:bg-sidebar-accent data-[state=open]:hover:text-sidebar-accent-foreground group-data-[collapsible=icon]:!size-8 group-data-[collapsible=icon]:!p-2 [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
        outline: "bg-background shadow-[0_0_0_1px_hsl(var(--sidebar-border))] hover:bg-sidebar-accent hover:text-sidebar-accent-foreground hover:shadow-[0_0_0_1px_hsl(var(--sidebar-accent))]"
      },
      size: {
        default: "h-8 text-sm",
        sm: "h-7 text-xs",
        lg: "h-12 text-sm group-data-[collapsible=icon]:!p-0"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    }
  }
);
const SidebarMenuButton = React.forwardRef(({ asChild = false, isActive = false, variant = "default", size = "default", tooltip, className, ...props }, ref) => {
  const Comp = asChild ? Slot : "button";
  const { isMobile, state } = useSidebar();
  const button = /* @__PURE__ */ jsx(
    Comp,
    {
      ref,
      "data-sidebar": "menu-button",
      "data-size": size,
      "data-active": isActive,
      className: cn(sidebarMenuButtonVariants({ variant, size }), className),
      ...props
    }
  );
  if (!tooltip) {
    return button;
  }
  if (typeof tooltip === "string") {
    tooltip = {
      children: tooltip
    };
  }
  return /* @__PURE__ */ jsxs(Tooltip, { children: [
    /* @__PURE__ */ jsx(TooltipTrigger, { asChild: true, children: button }),
    /* @__PURE__ */ jsx(TooltipContent, { side: "right", align: "center", hidden: state !== "collapsed" || isMobile, ...tooltip })
  ] });
});
SidebarMenuButton.displayName = "SidebarMenuButton";
const SidebarMenuAction = React.forwardRef(({ className, asChild = false, showOnHover = false, ...props }, ref) => {
  const Comp = asChild ? Slot : "button";
  return /* @__PURE__ */ jsx(
    Comp,
    {
      ref,
      "data-sidebar": "menu-action",
      className: cn(
        "absolute right-1 top-1.5 flex aspect-square w-5 items-center justify-center rounded-md p-0 text-sidebar-foreground outline-none ring-sidebar-ring transition-transform peer-hover/menu-button:text-sidebar-accent-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 [&>svg]:size-4 [&>svg]:shrink-0",
        // Increases the hit area of the button on mobile.
        "after:absolute after:-inset-2 after:md:hidden",
        "peer-data-[size=sm]/menu-button:top-1",
        "peer-data-[size=default]/menu-button:top-1.5",
        "peer-data-[size=lg]/menu-button:top-2.5",
        "group-data-[collapsible=icon]:hidden",
        showOnHover && "group-focus-within/menu-item:opacity-100 group-hover/menu-item:opacity-100 data-[state=open]:opacity-100 peer-data-[active=true]/menu-button:text-sidebar-accent-foreground md:opacity-0",
        className
      ),
      ...props
    }
  );
});
SidebarMenuAction.displayName = "SidebarMenuAction";
const SidebarMenuBadge = React.forwardRef(
  ({ className, ...props }, ref) => /* @__PURE__ */ jsx(
    "div",
    {
      ref,
      "data-sidebar": "menu-badge",
      className: cn(
        "pointer-events-none absolute right-1 flex h-5 min-w-5 select-none items-center justify-center rounded-md px-1 text-xs font-medium tabular-nums text-sidebar-foreground",
        "peer-hover/menu-button:text-sidebar-accent-foreground peer-data-[active=true]/menu-button:text-sidebar-accent-foreground",
        "peer-data-[size=sm]/menu-button:top-1",
        "peer-data-[size=default]/menu-button:top-1.5",
        "peer-data-[size=lg]/menu-button:top-2.5",
        "group-data-[collapsible=icon]:hidden",
        className
      ),
      ...props
    }
  )
);
SidebarMenuBadge.displayName = "SidebarMenuBadge";
const SidebarMenuSkeleton = React.forwardRef(({ className, showIcon = false, ...props }, ref) => {
  const width = React.useMemo(() => {
    return `${Math.floor(Math.random() * 40) + 50}%`;
  }, []);
  return /* @__PURE__ */ jsxs(
    "div",
    {
      ref,
      "data-sidebar": "menu-skeleton",
      className: cn("flex h-8 items-center gap-2 rounded-md px-2", className),
      ...props,
      children: [
        showIcon && /* @__PURE__ */ jsx(Skeleton, { className: "size-4 rounded-md", "data-sidebar": "menu-skeleton-icon" }),
        /* @__PURE__ */ jsx(
          Skeleton,
          {
            className: "h-4 max-w-[--skeleton-width] flex-1",
            "data-sidebar": "menu-skeleton-text",
            style: {
              "--skeleton-width": width
            }
          }
        )
      ]
    }
  );
});
SidebarMenuSkeleton.displayName = "SidebarMenuSkeleton";
const SidebarMenuSub = React.forwardRef(
  ({ className, ...props }, ref) => /* @__PURE__ */ jsx(
    "ul",
    {
      ref,
      "data-sidebar": "menu-sub",
      className: cn(
        "mx-3.5 flex min-w-0 translate-x-px flex-col gap-1 border-l border-sidebar-border px-2.5 py-0.5",
        "group-data-[collapsible=icon]:hidden",
        className
      ),
      ...props
    }
  )
);
SidebarMenuSub.displayName = "SidebarMenuSub";
const SidebarMenuSubItem = React.forwardRef(({ ...props }, ref) => /* @__PURE__ */ jsx("li", { ref, ...props }));
SidebarMenuSubItem.displayName = "SidebarMenuSubItem";
const SidebarMenuSubButton = React.forwardRef(({ asChild = false, size = "md", isActive, className, ...props }, ref) => {
  const Comp = asChild ? Slot : "a";
  return /* @__PURE__ */ jsx(
    Comp,
    {
      ref,
      "data-sidebar": "menu-sub-button",
      "data-size": size,
      "data-active": isActive,
      className: cn(
        "flex h-7 min-w-0 -translate-x-px items-center gap-2 overflow-hidden rounded-md px-2 text-sidebar-foreground outline-none ring-sidebar-ring aria-disabled:pointer-events-none aria-disabled:opacity-50 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 active:bg-sidebar-accent active:text-sidebar-accent-foreground disabled:pointer-events-none disabled:opacity-50 [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0 [&>svg]:text-sidebar-accent-foreground",
        "data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground",
        size === "sm" && "text-xs",
        size === "md" && "text-sm",
        "group-data-[collapsible=icon]:hidden",
        className
      ),
      ...props
    }
  );
});
SidebarMenuSubButton.displayName = "SidebarMenuSubButton";
const AlertDialog = AlertDialogPrimitive.Root;
const AlertDialogPortal = AlertDialogPrimitive.Portal;
const AlertDialogOverlay = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  AlertDialogPrimitive.Overlay,
  {
    className: cn(
      "fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    ),
    ...props,
    ref
  }
));
AlertDialogOverlay.displayName = AlertDialogPrimitive.Overlay.displayName;
const AlertDialogContent = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxs(AlertDialogPortal, { children: [
  /* @__PURE__ */ jsx(AlertDialogOverlay, {}),
  /* @__PURE__ */ jsx(
    AlertDialogPrimitive.Content,
    {
      ref,
      className: cn(
        "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg",
        className
      ),
      ...props
    }
  )
] }));
AlertDialogContent.displayName = AlertDialogPrimitive.Content.displayName;
const AlertDialogHeader = ({ className, ...props }) => /* @__PURE__ */ jsx("div", { className: cn("flex flex-col space-y-2 text-center sm:text-left", className), ...props });
AlertDialogHeader.displayName = "AlertDialogHeader";
const AlertDialogFooter = ({ className, ...props }) => /* @__PURE__ */ jsx("div", { className: cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2", className), ...props });
AlertDialogFooter.displayName = "AlertDialogFooter";
const AlertDialogTitle = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(AlertDialogPrimitive.Title, { ref, className: cn("text-lg font-semibold", className), ...props }));
AlertDialogTitle.displayName = AlertDialogPrimitive.Title.displayName;
const AlertDialogDescription = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(AlertDialogPrimitive.Description, { ref, className: cn("text-sm text-muted-foreground", className), ...props }));
AlertDialogDescription.displayName = AlertDialogPrimitive.Description.displayName;
const AlertDialogAction = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(AlertDialogPrimitive.Action, { ref, className: cn(buttonVariants(), className), ...props }));
AlertDialogAction.displayName = AlertDialogPrimitive.Action.displayName;
const AlertDialogCancel = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  AlertDialogPrimitive.Cancel,
  {
    ref,
    className: cn(buttonVariants({ variant: "outline" }), "mt-2 sm:mt-0", className),
    ...props
  }
));
AlertDialogCancel.displayName = AlertDialogPrimitive.Cancel.displayName;
const NavLink = forwardRef(
  ({ className, activeClassName, pendingClassName, to, ...props }, ref) => {
    return /* @__PURE__ */ jsx(
      NavLink$1,
      {
        ref,
        to,
        className: ({ isActive, isPending }) => cn(className, isActive && activeClassName, isPending && pendingClassName),
        ...props
      }
    );
  }
);
NavLink.displayName = "NavLink";
const DropdownMenu = DropdownMenuPrimitive.Root;
const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger;
const DropdownMenuSubTrigger = React.forwardRef(({ className, inset, children, ...props }, ref) => /* @__PURE__ */ jsxs(
  DropdownMenuPrimitive.SubTrigger,
  {
    ref,
    className: cn(
      "flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none data-[state=open]:bg-accent focus:bg-accent",
      inset && "pl-8",
      className
    ),
    ...props,
    children: [
      children,
      /* @__PURE__ */ jsx(ChevronRight, { className: "ml-auto h-4 w-4" })
    ]
  }
));
DropdownMenuSubTrigger.displayName = DropdownMenuPrimitive.SubTrigger.displayName;
const DropdownMenuSubContent = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  DropdownMenuPrimitive.SubContent,
  {
    ref,
    className: cn(
      "z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-lg data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
      className
    ),
    ...props
  }
));
DropdownMenuSubContent.displayName = DropdownMenuPrimitive.SubContent.displayName;
const DropdownMenuContent = React.forwardRef(({ className, sideOffset = 4, ...props }, ref) => /* @__PURE__ */ jsx(DropdownMenuPrimitive.Portal, { children: /* @__PURE__ */ jsx(
  DropdownMenuPrimitive.Content,
  {
    ref,
    sideOffset,
    className: cn(
      "z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
      className
    ),
    ...props
  }
) }));
DropdownMenuContent.displayName = DropdownMenuPrimitive.Content.displayName;
const DropdownMenuItem = React.forwardRef(({ className, inset, ...props }, ref) => /* @__PURE__ */ jsx(
  DropdownMenuPrimitive.Item,
  {
    ref,
    className: cn(
      "relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors data-[disabled]:pointer-events-none data-[disabled]:opacity-50 focus:bg-accent focus:text-accent-foreground",
      inset && "pl-8",
      className
    ),
    ...props
  }
));
DropdownMenuItem.displayName = DropdownMenuPrimitive.Item.displayName;
const DropdownMenuCheckboxItem = React.forwardRef(({ className, children, checked, ...props }, ref) => /* @__PURE__ */ jsxs(
  DropdownMenuPrimitive.CheckboxItem,
  {
    ref,
    className: cn(
      "relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors data-[disabled]:pointer-events-none data-[disabled]:opacity-50 focus:bg-accent focus:text-accent-foreground",
      className
    ),
    checked,
    ...props,
    children: [
      /* @__PURE__ */ jsx("span", { className: "absolute left-2 flex h-3.5 w-3.5 items-center justify-center", children: /* @__PURE__ */ jsx(DropdownMenuPrimitive.ItemIndicator, { children: /* @__PURE__ */ jsx(Check, { className: "h-4 w-4" }) }) }),
      children
    ]
  }
));
DropdownMenuCheckboxItem.displayName = DropdownMenuPrimitive.CheckboxItem.displayName;
const DropdownMenuRadioItem = React.forwardRef(({ className, children, ...props }, ref) => /* @__PURE__ */ jsxs(
  DropdownMenuPrimitive.RadioItem,
  {
    ref,
    className: cn(
      "relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors data-[disabled]:pointer-events-none data-[disabled]:opacity-50 focus:bg-accent focus:text-accent-foreground",
      className
    ),
    ...props,
    children: [
      /* @__PURE__ */ jsx("span", { className: "absolute left-2 flex h-3.5 w-3.5 items-center justify-center", children: /* @__PURE__ */ jsx(DropdownMenuPrimitive.ItemIndicator, { children: /* @__PURE__ */ jsx(Circle, { className: "h-2 w-2 fill-current" }) }) }),
      children
    ]
  }
));
DropdownMenuRadioItem.displayName = DropdownMenuPrimitive.RadioItem.displayName;
const DropdownMenuLabel = React.forwardRef(({ className, inset, ...props }, ref) => /* @__PURE__ */ jsx(
  DropdownMenuPrimitive.Label,
  {
    ref,
    className: cn("px-2 py-1.5 text-sm font-semibold", inset && "pl-8", className),
    ...props
  }
));
DropdownMenuLabel.displayName = DropdownMenuPrimitive.Label.displayName;
const DropdownMenuSeparator = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(DropdownMenuPrimitive.Separator, { ref, className: cn("-mx-1 my-1 h-px bg-muted", className), ...props }));
DropdownMenuSeparator.displayName = DropdownMenuPrimitive.Separator.displayName;
const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive: "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground"
      }
    },
    defaultVariants: {
      variant: "default"
    }
  }
);
function Badge({ className, variant, ...props }) {
  return /* @__PURE__ */ jsx("div", { className: cn(badgeVariants({ variant }), className), ...props });
}
const Collapsible = CollapsiblePrimitive.Root;
const CollapsibleTrigger = CollapsiblePrimitive.CollapsibleTrigger;
const CollapsibleContent = CollapsiblePrimitive.CollapsibleContent;
const logo = "/assets/logo-7xiR1HPB.png";
async function getFunctionErrorMessage(error) {
  const defaultMessage = error instanceof Error ? error.message : "İstek başarısız oldu";
  if (!error || typeof error !== "object" || !("context" in error)) {
    return defaultMessage;
  }
  const context = error.context;
  if (!context) {
    return defaultMessage;
  }
  try {
    const response = context.clone();
    const contentType = response.headers.get("content-type") ?? "";
    if (contentType.includes("application/json")) {
      const payload = await response.json();
      if (payload && typeof payload.error === "string") {
        return payload.error;
      }
    }
    const text = await response.text();
    return text || defaultMessage;
  } catch {
    return defaultMessage;
  }
}
async function invokeAuthedFunction(functionName, options = {}) {
  const {
    data: { user },
    error: userError
  } = await supabase.auth.getUser();
  if (userError || !user) {
    throw new Error("Oturum doğrulanamadı. Lütfen tekrar giriş yapın.");
  }
  const {
    data: { session }
  } = await supabase.auth.getSession();
  if (!(session == null ? void 0 : session.access_token)) {
    throw new Error("Oturum doğrulanamadı. Lütfen tekrar giriş yapın.");
  }
  const response = await supabase.functions.invoke(functionName, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${session.access_token}`
    }
  });
  if (response.error) {
    throw new Error(await getFunctionErrorMessage(response.error));
  }
  return response.data;
}
const commonItems = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Tüm Yorumlar", url: "/inbox", icon: Inbox, highlight: true },
  { title: "Yorumlar", url: "/reviews", icon: MessageSquare },
  { title: "Rep Score", url: "/rep-score", icon: Trophy },
  { title: "Google Hesapları", url: "/google-accounts", icon: Star },
  { title: "İstatistikler", url: "/statistics", icon: BarChart3 },
  { title: "Sosyal Medya Analizi", url: "/social-analytics", icon: Sparkles },
  { title: "Google Performance", url: "/performance", icon: TrendingUp },
  { title: "Rapor Oluştur", url: "/report", icon: FileText },
  { title: "Ayarlar", url: "/settings", icon: Settings }
];
const locationItems = [
  { title: "Tüm Lokasyonlar", url: "/locations", icon: Building2 },
  { title: "Platform Puanları", url: "/locations/platform-ratings", icon: LayoutGrid }
];
function AppSidebar() {
  const { open } = useSidebar();
  const location = useLocation();
  const navigate = useNavigate();
  const { activeBusiness } = useBusiness();
  const { unreadCount, markAllRead } = useNewReviews();
  const [selectedPlatform, setSelectedPlatform] = useState(null);
  const [tiktokConnected, setTiktokConnected] = useState(false);
  const [googleConnected, setGoogleConnected] = useState(false);
  const [autoSelected, setAutoSelected] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  useEffect(() => {
    const checkConnections = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const { data: tiktok } = await supabase.from("social_connections").select("id").eq("provider", "tiktok").eq("user_id", session.user.id).maybeSingle();
      setTiktokConnected(!!tiktok);
      if (activeBusiness == null ? void 0 : activeBusiness.google_connected) {
        setGoogleConnected(true);
      } else {
        setGoogleConnected(false);
      }
    };
    checkConnections();
  }, [activeBusiness]);
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const platformParam = searchParams.get("platform");
    if (location.pathname.includes("tiktok")) {
      setSelectedPlatform("tiktok");
    } else if (location.pathname.includes("reviews") && platformParam) {
      setSelectedPlatform(platformParam);
    } else if (location.pathname.includes("reviews") || location.pathname.includes("review")) {
      setSelectedPlatform("google");
    } else if (!autoSelected && googleConnected && !selectedPlatform) {
      setSelectedPlatform("google");
      setAutoSelected(true);
    }
  }, [location.pathname, location.search, googleConnected, autoSelected, selectedPlatform]);
  const platforms = [
    {
      id: "google",
      name: "Google Business",
      icon: /* @__PURE__ */ jsx(Star, { className: "h-4 w-4" }),
      connected: googleConnected,
      menuItems: [
        { title: "Google Yorumları", url: "/reviews?platform=google", icon: MessageSquare },
        { title: "Yorumlarla Sohbet", url: "/chat", icon: Brain }
      ]
    },
    {
      id: "tiktok",
      name: "TikTok",
      icon: /* @__PURE__ */ jsx(Music2, { className: "h-4 w-4" }),
      connected: tiktokConnected,
      menuItems: [
        { title: "Video Yorumları", url: "/tiktok-inbox", icon: Video },
        { title: "DM Inbox", url: "/tiktok-dm", icon: Inbox }
      ]
    },
    {
      id: "instagram",
      name: "Instagram",
      icon: /* @__PURE__ */ jsx(Send, { className: "h-4 w-4 rotate-12" }),
      connected: false,
      menuItems: [
        { title: "DM Inbox", url: "/instagram-dm", icon: Inbox },
        { title: "Yorum Yanıtları", url: "/instagram-comments", icon: MessageSquare }
      ]
    }
  ];
  const reviewPlatforms = [
    { title: "Booking Yorumları", url: "/reviews?platform=booking", icon: BedDouble },
    { title: "TripAdvisor Yorumları", url: "/reviews?platform=tripadvisor", icon: MapPin },
    { title: "Expedia Yorumları", url: "/reviews?platform=expedia", icon: Building2 },
    { title: "Hotels.com Yorumları", url: "/reviews?platform=hotelscom", icon: Hotel },
    { title: "Trip.com Yorumları", url: "/reviews?platform=tripcom", icon: Building2 },
    { title: "YouTube Yorumları", url: "/youtube", icon: Video }
  ];
  const handlePlatformSelect = async (platform) => {
    if (platform.connected) {
      setSelectedPlatform(platform.id);
      return;
    }
    if (platform.id === "google") {
      try {
        const response = await invokeAuthedFunction("google-business-auth", {
          body: { action: "initiate" }
        });
        if (response == null ? void 0 : response.authUrl) {
          window.location.href = response.authUrl;
        }
      } catch (error) {
        console.error("Google connect error:", error);
      }
      return;
    }
    setSelectedPlatform(platform.id);
  };
  const currentPlatform = platforms.find((p) => p.id === selectedPlatform);
  return /* @__PURE__ */ jsxs(Sidebar, { collapsible: "offcanvas", className: "border-r border-sidebar-border", children: [
    /* @__PURE__ */ jsx(SidebarHeader, { className: "border-b border-sidebar-border p-4", children: /* @__PURE__ */ jsxs(
      "button",
      {
        onClick: () => navigate("/dashboard"),
        className: "flex items-center gap-3 hover:opacity-80 transition-opacity w-full",
        children: [
          /* @__PURE__ */ jsx("img", { src: logo, alt: "VoyageRespond", className: "h-8 w-8" }),
          open && /* @__PURE__ */ jsx("span", { className: "text-lg font-semibold text-foreground", children: "VoyageRespond" })
        ]
      }
    ) }),
    /* @__PURE__ */ jsxs(SidebarContent, { children: [
      open && /* @__PURE__ */ jsx("div", { className: "px-3 py-3", children: /* @__PURE__ */ jsxs(DropdownMenu, { children: [
        /* @__PURE__ */ jsx(DropdownMenuTrigger, { asChild: true, children: /* @__PURE__ */ jsxs("button", { className: "w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg border bg-card hover:bg-accent transition-colors", children: [
          /* @__PURE__ */ jsx("div", { className: "flex items-center gap-2", children: currentPlatform ? /* @__PURE__ */ jsxs(Fragment, { children: [
            currentPlatform.icon,
            /* @__PURE__ */ jsx("span", { className: "font-medium text-sm", children: currentPlatform.name }),
            currentPlatform.connected && /* @__PURE__ */ jsx(Badge, { variant: "outline", className: "text-xs bg-green-50 text-green-700 border-green-200", children: /* @__PURE__ */ jsx(Check, { className: "h-3 w-3" }) })
          ] }) : /* @__PURE__ */ jsx("span", { className: "text-sm text-muted-foreground", children: "Platform seç" }) }),
          /* @__PURE__ */ jsx(ChevronDown, { className: "h-4 w-4 text-muted-foreground" })
        ] }) }),
        /* @__PURE__ */ jsx(DropdownMenuContent, { align: "start", className: "w-56", children: platforms.map((platform) => /* @__PURE__ */ jsxs(
          DropdownMenuItem,
          {
            onClick: () => handlePlatformSelect(platform),
            className: "flex items-center justify-between",
            children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
                platform.icon,
                /* @__PURE__ */ jsx("span", { children: platform.name })
              ] }),
              platform.connected ? /* @__PURE__ */ jsx(Badge, { variant: "outline", className: "text-xs bg-green-50 text-green-700 border-green-200", children: "Bağlı" }) : /* @__PURE__ */ jsx(Badge, { variant: "secondary", className: "text-xs", children: "Bağla" })
            ]
          },
          platform.id
        )) })
      ] }) }),
      /* @__PURE__ */ jsx(SidebarGroup, { children: /* @__PURE__ */ jsx(SidebarGroupContent, { children: /* @__PURE__ */ jsx(SidebarMenu, { children: commonItems.slice(0, 7).map((item) => {
        const isActive = location.pathname === item.url;
        const showInboxBadge = item.url === "/inbox" && unreadCount > 0;
        return /* @__PURE__ */ jsx(SidebarMenuItem, { children: /* @__PURE__ */ jsx(
          SidebarMenuButton,
          {
            asChild: true,
            isActive,
            tooltip: item.title,
            children: /* @__PURE__ */ jsxs(
              NavLink,
              {
                to: item.url,
                onClick: () => {
                  if (showInboxBadge) markAllRead();
                },
                className: "flex items-center gap-3 transition-smooth",
                children: [
                  /* @__PURE__ */ jsx(item.icon, { className: `h-5 w-5 ${item.highlight ? "text-primary" : ""}` }),
                  /* @__PURE__ */ jsx("span", { className: "flex-1", children: item.title }),
                  showInboxBadge && /* @__PURE__ */ jsx(Badge, { className: "h-5 min-w-5 px-1.5 text-xs bg-destructive text-destructive-foreground hover:bg-destructive", children: unreadCount > 99 ? "99+" : unreadCount })
                ]
              }
            )
          }
        ) }, item.title);
      }) }) }) }),
      /* @__PURE__ */ jsx(Collapsible, { defaultOpen: location.pathname.startsWith("/locations"), className: "group/loc-collapsible", children: /* @__PURE__ */ jsxs(SidebarGroup, { children: [
        open ? /* @__PURE__ */ jsx(CollapsibleTrigger, { asChild: true, children: /* @__PURE__ */ jsxs(SidebarGroupLabel, { className: "text-xs text-muted-foreground px-3 cursor-pointer hover:text-foreground transition-colors flex items-center", children: [
          /* @__PURE__ */ jsx(Building2, { className: "h-4 w-4 mr-2" }),
          "Lokasyonlar",
          /* @__PURE__ */ jsx(ChevronDown, { className: "ml-auto h-4 w-4 transition-transform group-data-[state=open]/loc-collapsible:rotate-180" })
        ] }) }) : null,
        /* @__PURE__ */ jsx(CollapsibleContent, { children: /* @__PURE__ */ jsx(SidebarGroupContent, { children: /* @__PURE__ */ jsx(SidebarMenu, { children: locationItems.map((item) => {
          const isActive = location.pathname === item.url;
          return /* @__PURE__ */ jsx(SidebarMenuItem, { children: /* @__PURE__ */ jsx(SidebarMenuButton, { asChild: true, isActive, tooltip: item.title, children: /* @__PURE__ */ jsxs(NavLink, { to: item.url, className: "flex items-center gap-3 transition-smooth", children: [
            /* @__PURE__ */ jsx(item.icon, { className: "h-5 w-5" }),
            /* @__PURE__ */ jsx("span", { children: item.title })
          ] }) }) }, item.title);
        }) }) }) })
      ] }) }),
      currentPlatform && /* @__PURE__ */ jsxs(SidebarGroup, { children: [
        open && /* @__PURE__ */ jsxs(SidebarGroupLabel, { className: "flex items-center gap-2 text-xs text-muted-foreground px-3", children: [
          currentPlatform.icon,
          currentPlatform.name
        ] }),
        /* @__PURE__ */ jsx(SidebarGroupContent, { children: /* @__PURE__ */ jsx(SidebarMenu, { children: currentPlatform.menuItems.map((item) => {
          const isActive = location.pathname + location.search === item.url || location.pathname === item.url;
          const showBadge = item.url.includes("/reviews") && unreadCount > 0;
          return /* @__PURE__ */ jsx(SidebarMenuItem, { children: /* @__PURE__ */ jsx(
            SidebarMenuButton,
            {
              asChild: true,
              isActive,
              tooltip: item.title,
              children: /* @__PURE__ */ jsxs(
                NavLink,
                {
                  to: item.url,
                  onClick: () => {
                    if (showBadge) markAllRead();
                  },
                  className: "flex items-center gap-3 transition-smooth",
                  children: [
                    /* @__PURE__ */ jsx(item.icon, { className: "h-5 w-5" }),
                    /* @__PURE__ */ jsx("span", { className: "flex-1", children: item.title }),
                    showBadge && /* @__PURE__ */ jsx(Badge, { className: "h-5 min-w-5 px-1.5 text-xs bg-destructive text-destructive-foreground hover:bg-destructive", children: unreadCount > 99 ? "99+" : unreadCount })
                  ]
                }
              )
            }
          ) }, item.title);
        }) }) })
      ] }),
      /* @__PURE__ */ jsx(Collapsible, { defaultOpen: false, className: "group/collapsible", children: /* @__PURE__ */ jsxs(SidebarGroup, { children: [
        open && /* @__PURE__ */ jsx(CollapsibleTrigger, { asChild: true, children: /* @__PURE__ */ jsxs(SidebarGroupLabel, { className: "text-xs text-muted-foreground px-3 cursor-pointer hover:text-foreground transition-colors", children: [
          "Yorum Platformları",
          /* @__PURE__ */ jsx(ChevronDown, { className: "ml-auto h-4 w-4 transition-transform group-data-[state=open]/collapsible:rotate-180" })
        ] }) }),
        /* @__PURE__ */ jsx(CollapsibleContent, { children: /* @__PURE__ */ jsx(SidebarGroupContent, { children: /* @__PURE__ */ jsx(SidebarMenu, { children: reviewPlatforms.map((item) => {
          const isActive = location.pathname + location.search === item.url;
          return /* @__PURE__ */ jsx(SidebarMenuItem, { children: /* @__PURE__ */ jsx(
            SidebarMenuButton,
            {
              asChild: true,
              isActive,
              tooltip: item.title,
              children: /* @__PURE__ */ jsxs(
                NavLink,
                {
                  to: item.url,
                  className: "flex items-center gap-3 transition-smooth",
                  children: [
                    /* @__PURE__ */ jsx(item.icon, { className: "h-5 w-5" }),
                    /* @__PURE__ */ jsx("span", { children: item.title })
                  ]
                }
              )
            }
          ) }, item.title);
        }) }) }) })
      ] }) }),
      /* @__PURE__ */ jsxs(SidebarGroup, { children: [
        open && /* @__PURE__ */ jsx(SidebarGroupLabel, { className: "text-xs text-muted-foreground px-3", children: "Otomasyon" }),
        /* @__PURE__ */ jsx(SidebarGroupContent, { children: /* @__PURE__ */ jsxs(SidebarMenu, { children: [
          /* @__PURE__ */ jsx(SidebarMenuItem, { children: /* @__PURE__ */ jsx(
            SidebarMenuButton,
            {
              asChild: true,
              isActive: location.pathname === "/auto-reply",
              tooltip: "Otomatik Yanıt",
              children: /* @__PURE__ */ jsxs(
                NavLink,
                {
                  to: "/auto-reply",
                  className: "flex items-center gap-3 transition-smooth",
                  children: [
                    /* @__PURE__ */ jsx(Zap, { className: "h-5 w-5" }),
                    /* @__PURE__ */ jsx("span", { children: "Otomatik Yanıt" })
                  ]
                }
              )
            }
          ) }),
          /* @__PURE__ */ jsx(SidebarMenuItem, { children: /* @__PURE__ */ jsx(
            SidebarMenuButton,
            {
              asChild: true,
              isActive: location.pathname === "/intelligence",
              tooltip: "Rakip Analizi",
              children: /* @__PURE__ */ jsxs(
                NavLink,
                {
                  to: "/intelligence",
                  className: "flex items-center gap-3 transition-smooth",
                  children: [
                    /* @__PURE__ */ jsx(Swords, { className: "h-5 w-5" }),
                    /* @__PURE__ */ jsx("span", { children: "Rakip Analizi" })
                  ]
                }
              )
            }
          ) })
        ] }) })
      ] }),
      /* @__PURE__ */ jsxs(SidebarGroup, { children: [
        open && /* @__PURE__ */ jsx(SidebarGroupLabel, { className: "text-xs text-muted-foreground px-3", children: "Pazarlama" }),
        /* @__PURE__ */ jsx(SidebarGroupContent, { children: /* @__PURE__ */ jsxs(SidebarMenu, { children: [
          /* @__PURE__ */ jsx(SidebarMenuItem, { children: /* @__PURE__ */ jsx(
            SidebarMenuButton,
            {
              asChild: true,
              isActive: location.pathname === "/story-kit",
              tooltip: "Story Kit",
              children: /* @__PURE__ */ jsxs(
                NavLink,
                {
                  to: "/story-kit",
                  className: "flex items-center gap-3 transition-smooth",
                  children: [
                    /* @__PURE__ */ jsx(Camera, { className: "h-5 w-5" }),
                    /* @__PURE__ */ jsx("span", { children: "Story Kit" })
                  ]
                }
              )
            }
          ) }),
          /* @__PURE__ */ jsx(SidebarMenuItem, { children: /* @__PURE__ */ jsx(
            SidebarMenuButton,
            {
              asChild: true,
              isActive: location.pathname === "/email",
              tooltip: "Email Merkezi",
              children: /* @__PURE__ */ jsxs(
                NavLink,
                {
                  to: "/email",
                  className: "flex items-center gap-3 transition-smooth",
                  children: [
                    /* @__PURE__ */ jsx(Mail, { className: "h-5 w-5" }),
                    /* @__PURE__ */ jsx("span", { children: "Email Merkezi" })
                  ]
                }
              )
            }
          ) })
        ] }) })
      ] }),
      /* @__PURE__ */ jsx(SidebarGroup, { className: "mt-auto", children: /* @__PURE__ */ jsx(SidebarGroupContent, { children: /* @__PURE__ */ jsxs(SidebarMenu, { children: [
        /* @__PURE__ */ jsx(SidebarMenuItem, { children: /* @__PURE__ */ jsx(
          SidebarMenuButton,
          {
            asChild: true,
            isActive: location.pathname === "/settings",
            tooltip: "Ayarlar",
            children: /* @__PURE__ */ jsxs(
              NavLink,
              {
                to: "/settings",
                className: "flex items-center gap-3 transition-smooth",
                children: [
                  /* @__PURE__ */ jsx(Settings, { className: "h-5 w-5" }),
                  /* @__PURE__ */ jsx("span", { children: "Ayarlar" })
                ]
              }
            )
          }
        ) }),
        /* @__PURE__ */ jsx(SidebarMenuItem, { children: /* @__PURE__ */ jsx(
          SidebarMenuButton,
          {
            tooltip: "Çıkış Yap",
            children: /* @__PURE__ */ jsxs(
              "button",
              {
                onClick: () => setShowLogoutDialog(true),
                className: "flex items-center gap-3 transition-smooth w-full text-left text-destructive",
                children: [
                  /* @__PURE__ */ jsx(LogOut, { className: "h-5 w-5" }),
                  /* @__PURE__ */ jsx("span", { children: "Çıkış Yap" })
                ]
              }
            )
          }
        ) }),
        /* @__PURE__ */ jsx(AlertDialog, { open: showLogoutDialog, onOpenChange: setShowLogoutDialog, children: /* @__PURE__ */ jsxs(AlertDialogContent, { children: [
          /* @__PURE__ */ jsxs(AlertDialogHeader, { children: [
            /* @__PURE__ */ jsx(AlertDialogTitle, { children: "Çıkış yapmak istediğinize emin misiniz?" }),
            /* @__PURE__ */ jsx(AlertDialogDescription, { children: "Oturumunuz sonlandırılacak ve giriş sayfasına yönlendirileceksiniz." })
          ] }),
          /* @__PURE__ */ jsxs(AlertDialogFooter, { children: [
            /* @__PURE__ */ jsx(AlertDialogCancel, { children: "İptal" }),
            /* @__PURE__ */ jsx(
              AlertDialogAction,
              {
                className: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
                onClick: async () => {
                  await supabase.auth.signOut();
                  toast({ title: "Çıkış Yapıldı", description: "Başarıyla çıkış yaptınız." });
                  navigate("/login");
                },
                children: "Evet, Çıkış Yap"
              }
            )
          ] })
        ] }) })
      ] }) }) })
    ] })
  ] });
}
const platformLabels = {
  google: "Google",
  booking: "Booking.com",
  tripadvisor: "TripAdvisor",
  expedia: "Expedia",
  hotelscom: "Hotels.com"
};
function ReviewFetchBanner() {
  const { pendingRuns, hasPendingRuns } = useReviewFetch();
  if (!hasPendingRuns) return null;
  const runs = Array.from(pendingRuns.values());
  const platformNames = runs.map((r) => platformLabels[r.platform] || r.platform).join(", ");
  const businessNames = [...new Set(runs.map((r) => r.businessName))].join(", ");
  return /* @__PURE__ */ jsxs("div", { className: "bg-primary/10 border-b border-primary/20 px-4 py-2 flex items-center gap-3 text-sm", children: [
    /* @__PURE__ */ jsx(Loader2, { className: "h-4 w-4 animate-spin text-primary flex-shrink-0" }),
    /* @__PURE__ */ jsxs("span", { className: "text-foreground", children: [
      /* @__PURE__ */ jsx("span", { className: "font-medium", children: businessNames }),
      " — ",
      /* @__PURE__ */ jsxs("span", { className: "text-muted-foreground", children: [
        platformNames,
        " yorumları arka planda çekiliyor..."
      ] })
    ] })
  ] });
}
function AppLayout({ children }) {
  return /* @__PURE__ */ jsx(SidebarProvider, { children: /* @__PURE__ */ jsxs("div", { className: "flex min-h-screen w-full bg-background", children: [
    /* @__PURE__ */ jsx(AppSidebar, {}),
    /* @__PURE__ */ jsxs("main", { className: "flex-1 overflow-auto", children: [
      /* @__PURE__ */ jsxs("header", { className: "sticky top-0 z-40 flex h-14 items-center border-b border-border bg-background px-4 md:hidden", children: [
        /* @__PURE__ */ jsx(SidebarTrigger, {}),
        /* @__PURE__ */ jsx("span", { className: "ml-3 text-sm font-semibold text-foreground", children: "VoyageRespond" })
      ] }),
      /* @__PURE__ */ jsx(ReviewFetchBanner, {}),
      children
    ] })
  ] }) });
}
function ProtectedRoute({ children, requireAdmin = false }) {
  const location = useLocation();
  const { user, role, loading } = useAuth();
  if (loading) {
    return /* @__PURE__ */ jsx("div", { className: "flex items-center justify-center min-h-screen", children: /* @__PURE__ */ jsx("div", { className: "animate-spin rounded-full h-8 w-8 border-b-2 border-primary" }) });
  }
  if (!user) {
    const redirect = encodeURIComponent(`${location.pathname}${location.search}`);
    return /* @__PURE__ */ jsx(Navigate, { to: `/login?redirect=${redirect}`, replace: true });
  }
  if (requireAdmin && role !== "admin") {
    return /* @__PURE__ */ jsx(Navigate, { to: "/dashboard", replace: true });
  }
  return /* @__PURE__ */ jsx(Fragment, { children });
}
const cityHotelData = [
  {
    slug: "istanbul",
    name: "İstanbul",
    nameLocative: "İstanbul'da",
    region: "Marmara",
    hotelCount: "3.500+",
    avgRating: 4.2,
    topPlatforms: ["Google", "Booking.com", "TripAdvisor", "Hotels.com"],
    description: "İstanbul, Türkiye'nin en yoğun otel pazarı. Sultanahmet'ten Beyoğlu'na, Levent'ten Kadıköy'e binlerce otel her gün yüzlerce yeni yorum alıyor. Yoğun rekabet nedeniyle Google Otel sıralamalarında üst sıralarda kalmak için yorum yönetimi kritik.",
    highlights: [
      "Sultanahmet butik otelleri için TripAdvisor öncelikli",
      "Levent & Maslak iş otelleri için Booking.com kritik",
      "Çoklu dil (TR/EN/AR/RU) yanıt zorunlu",
      "Günlük 50+ yorum gelen oteller için otomasyon şart"
    ],
    competitors: ["Four Seasons Sultanahmet", "Çırağan Palace Kempinski", "Raffles Istanbul"],
    seoTitle: "İstanbul Otel Yorum Yönetimi | Google, Booking, TripAdvisor",
    seoDescription: "İstanbul'daki otelinizin Google, Booking.com ve TripAdvisor yorumlarını tek panelden yönetin. AI destekli çok dilli yanıt sistemi ile saatler içinde tüm yorumlara cevap verin."
  },
  {
    slug: "antalya",
    name: "Antalya",
    nameLocative: "Antalya'da",
    region: "Akdeniz",
    hotelCount: "2.800+",
    avgRating: 4.4,
    topPlatforms: ["Booking.com", "Google", "TripAdvisor", "Hotels.com"],
    description: "Antalya, Türkiye turizminin başkenti. Konyaaltı, Lara ve Kemer bölgelerindeki resort otelleri sezonda haftada 500+ yorum alıyor. Rus, Alman ve İngiliz misafirler için çok dilli yanıt yönetimi zorunlu.",
    highlights: [
      "Yaz sezonunda günlük 30-80 yorum hacmi",
      "Almanca, Rusça, İngilizce yanıt gerekliliği",
      "All-inclusive otellerde yiyecek/içecek yorumları öncelikli",
      "Sezon kapanışında yorum hızı düşse de yanıt oranı %90+ olmalı"
    ],
    competitors: ["Maxx Royal Belek", "Regnum Carya", "Rixos Premium Belek"],
    seoTitle: "Antalya Otel Yorum Yönetimi | All-Inclusive & Resort",
    seoDescription: "Antalya'daki resort ve all-inclusive otellerinizin Booking.com, Google ve TripAdvisor yorumlarını çok dilli AI ile yönetin. Sezonda günde 50+ yoruma saniyeler içinde profesyonel yanıt."
  },
  {
    slug: "bodrum",
    name: "Bodrum",
    nameLocative: "Bodrum'da",
    region: "Ege",
    hotelCount: "950+",
    avgRating: 4.5,
    topPlatforms: ["Booking.com", "TripAdvisor", "Google", "Airbnb"],
    description: "Bodrum, lüks butik otellerin ve villa kiralamalarının merkezi. Yalıkavak, Türkbükü ve Gümbet bölgelerindeki tesisler Instagram ve TripAdvisor üzerinden yoğun ilgi görüyor. Yerel ve yabancı misafirler için ayrı yanıt stratejisi gerekli.",
    highlights: [
      "Lüks butik otellerde TripAdvisor #1 öncelik",
      "Yalıkavak & Türkbükü villa kiralamalarında Airbnb yönetimi kritik",
      "Influencer & ünlü misafir yorumlarına özel ilgi",
      "Sezon dışı (Kasım-Mart) bakım yorumlarına proaktif yanıt"
    ],
    competitors: ["Mandarin Oriental Bodrum", "Maxx Royal Bodrum", "Six Senses Kaplankaya"],
    seoTitle: "Bodrum Otel Yorum Yönetimi | Butik & Villa & Resort",
    seoDescription: "Bodrum'daki butik otel ve villalarınızın Booking, TripAdvisor, Airbnb yorumlarını profesyonelce yönetin. AI ile saniyeler içinde lüks tona uygun yanıtlar."
  },
  {
    slug: "kapadokya",
    name: "Kapadokya",
    nameLocative: "Kapadokya'da",
    region: "İç Anadolu",
    hotelCount: "650+",
    avgRating: 4.6,
    topPlatforms: ["TripAdvisor", "Booking.com", "Google", "Hotels.com"],
    description: "Kapadokya, Türkiye'nin en yüksek puanlı bölgesi. Göreme, Ürgüp ve Uçhisar'daki cave hotel ve butik otelleri yabancı turistler için dünya çapında popüler. TripAdvisor yorumları rezervasyonların %70'ini etkiliyor.",
    highlights: [
      "TripAdvisor sıralaması rezervasyonların belirleyicisi",
      "Balon turu deneyimi yorumları otel puanını etkiliyor",
      "Yüksek beklenti = küçük şikayetler bile büyük etki",
      "İngilizce, Japonca, Çince yanıt sıklığı artıyor"
    ],
    competitors: ["Museum Hotel", "Argos in Cappadocia", "Sultan Cave Suites"],
    seoTitle: "Kapadokya Otel Yorum Yönetimi | Cave Hotel & Butik",
    seoDescription: "Kapadokya'daki cave hotel ve butik otellerinizin TripAdvisor, Booking ve Google yorumlarını yönetin. Çok dilli AI ile dünya çapındaki misafirlere profesyonel yanıt."
  },
  {
    slug: "izmir",
    name: "İzmir",
    nameLocative: "İzmir'de",
    region: "Ege",
    hotelCount: "780+",
    avgRating: 4.3,
    topPlatforms: ["Google", "Booking.com", "TripAdvisor"],
    description: "İzmir, hem iş seyahatleri hem de Ege turizminin geçiş noktası. Alsancak, Konak ve havalimanı çevresindeki oteller yoğun şehir trafiği alıyor. Çeşme ve Alaçatı için ayrı strateji gerekli.",
    highlights: [
      "İş otelleri için hızlı yanıt süresi kritik (4 saat içinde)",
      "Konum, ulaşım ve check-in hızı yorumlarda öne çıkıyor",
      "Fuar dönemlerinde yorum hacmi 3x artıyor",
      "Çeşme & Alaçatı için ayrı sosyal medya stratejisi"
    ],
    competitors: ["Swissôtel Büyük Efes", "Mövenpick İzmir", "Wyndham Grand İzmir Özdilek"],
    seoTitle: "İzmir Otel Yorum Yönetimi | İş & Tatil Otelleri",
    seoDescription: "İzmir'deki iş ve tatil otellerinizin Google, Booking ve TripAdvisor yorumlarını AI ile yönetin. Fuar sezonunda artan yorum hacmini saniyeler içinde karşılayın."
  },
  {
    slug: "ankara",
    name: "Ankara",
    nameLocative: "Ankara'da",
    region: "İç Anadolu",
    hotelCount: "420+",
    avgRating: 4.2,
    topPlatforms: ["Google", "Booking.com"],
    description: "Ankara, Türkiye'nin yönetim merkezi. Kavaklıdere, Çankaya ve havalimanı çevresindeki oteller ağırlıklı olarak iş seyahati misafirleri alıyor. Google ve Booking.com kritik kanallar.",
    highlights: [
      "İş seyahatleri için Google Otel sıralaması belirleyici",
      "Toplantı salonu, kahvaltı ve ulaşım yorumları en sık",
      "Hafta içi rezervasyonlar yorum çıktısının %75'i",
      "Kurumsal misafir yorumları için resmi ton gerekli"
    ],
    competitors: ["JW Marriott Ankara", "Swissôtel Ankara", "Sheraton Ankara"],
    seoTitle: "Ankara Otel Yorum Yönetimi | İş Otelleri",
    seoDescription: "Ankara'daki iş otellerinizin Google ve Booking.com yorumlarını AI ile profesyonel ton ile yönetin. Kurumsal misafirlere uygun yanıtları saniyeler içinde üretin."
  },
  {
    slug: "alanya",
    name: "Alanya",
    nameLocative: "Alanya'da",
    region: "Akdeniz",
    hotelCount: "1.150+",
    avgRating: 4.3,
    topPlatforms: ["Booking.com", "Google", "TripAdvisor"],
    description: "Alanya, Rus, Alman ve İskandinav turistlerinin yoğun ilgi gösterdiği resort bölgesi. All-inclusive otellerinde sezonda yoğun yorum trafiği var. Çok dilli yanıt yönetimi şart.",
    highlights: [
      "Rusça yorum oranı %35-40 arası",
      "Almanca ve İngilizce zorunlu",
      "Plaj, havuz ve büfe yorumları en sık",
      "Aile otellerinde çocuk dostu yorumları önemli"
    ],
    competitors: ["Granada Luxury Belek", "Delphin Imperial", "Kirman Hotels"],
    seoTitle: "Alanya Otel Yorum Yönetimi | Resort & Aile Otelleri",
    seoDescription: "Alanya'daki resort ve aile otellerinin Booking, Google ve TripAdvisor yorumlarını çok dilli (TR/RU/DE/EN) AI ile yönetin."
  },
  {
    slug: "marmaris",
    name: "Marmaris",
    nameLocative: "Marmaris'te",
    region: "Ege",
    hotelCount: "580+",
    avgRating: 4.3,
    topPlatforms: ["Booking.com", "TripAdvisor", "Google"],
    description: "Marmaris, İngiliz ve İskandinav turistlerinin tercih ettiği Ege incisi. İçmeler, Turunç ve marina çevresindeki oteller yoğun rezervasyon alıyor. TripAdvisor ve Booking en kritik.",
    highlights: [
      "İngilizce yorum oranı %50+",
      "Tekne turu ve gezi yorumları otel puanını etkiliyor",
      "Aile + genç çift karışık misafir profili",
      "Sezon yoğunluğunda hızlı yanıt kritik"
    ],
    competitors: ["D-Resort Grand Azur", "Maritim Pine Beach", "Hotel Munamar Beach"],
    seoTitle: "Marmaris Otel Yorum Yönetimi | Resort & Marina Otelleri",
    seoDescription: "Marmaris'teki resort ve marina otellerinizin Booking, TripAdvisor yorumlarını İngilizce ağırlıklı AI yanıtlarla yönetin."
  },
  {
    slug: "kemer",
    name: "Kemer",
    nameLocative: "Kemer'de",
    region: "Akdeniz",
    hotelCount: "470+",
    avgRating: 4.4,
    topPlatforms: ["Booking.com", "Google", "TripAdvisor"],
    description: "Kemer, Antalya'nın en yoğun all-inclusive bölgelerinden. Beldibi, Göynük ve Tekirova'daki oteller Rus ve Alman misafirler için ana destinasyon.",
    highlights: [
      "Rusça ve Almanca yanıt zorunlu",
      "All-inclusive yorumlarında yiyecek-içecek %60 ağırlık",
      "Sezon kapanışında bakım & yenileme yorumları"
    ],
    competitors: ["Maxx Royal Kemer", "Rixos Sungate", "Amara Dolce Vita"],
    seoTitle: "Kemer Otel Yorum Yönetimi | All-Inclusive Resort",
    seoDescription: "Kemer'deki all-inclusive otellerinizin Booking, Google ve TripAdvisor yorumlarını çok dilli AI ile yönetin."
  },
  {
    slug: "fethiye",
    name: "Fethiye",
    nameLocative: "Fethiye'de",
    region: "Ege",
    hotelCount: "520+",
    avgRating: 4.4,
    topPlatforms: ["Booking.com", "TripAdvisor", "Google", "Airbnb"],
    description: "Fethiye, Ölüdeniz ve Hisarönü bölgesiyle butik otel ve villa kiralamasının merkezi. İngiliz turistleri için dünya çapında popüler. TripAdvisor sıralaması kritik.",
    highlights: [
      "İngilizce yorum oranı %55+",
      "Yamaç paraşütü deneyimi otel puanını etkiliyor",
      "Villa kiralamalarında Airbnb yönetimi öne çıkıyor"
    ],
    competitors: ["Hillside Beach Club", "D-Resort Göcek", "Liberty Hotels Lykia"],
    seoTitle: "Fethiye Otel Yorum Yönetimi | Butik & Villa",
    seoDescription: "Fethiye'deki butik otel ve villalarınızın TripAdvisor, Booking ve Airbnb yorumlarını AI ile yönetin."
  },
  {
    slug: "cesme",
    name: "Çeşme",
    nameLocative: "Çeşme'de",
    region: "Ege",
    hotelCount: "320+",
    avgRating: 4.5,
    topPlatforms: ["Google", "Booking.com", "TripAdvisor", "Instagram"],
    description: "Çeşme & Alaçatı, lüks butik otellerin ve dizayn otellerinin Türkiye merkezi. Yerli misafir ağırlıklı sezon, Instagram ve Google yorumları öncelikli.",
    highlights: [
      "Lüks butik otellerde Instagram yorum yönetimi kritik",
      "Hafta sonu yoğunluğu, hafta içi sakin",
      "Influencer ziyaretleri yorum trafiğini artırıyor"
    ],
    competitors: ["Alavya Hotel", "La Capria Suite", "Beymarmara Suit Hotel"],
    seoTitle: "Çeşme Alaçatı Otel Yorum Yönetimi | Butik & Lüks",
    seoDescription: "Çeşme & Alaçatı'daki butik otellerin Google, Booking ve Instagram yorumlarını AI ile profesyonelce yönetin."
  },
  {
    slug: "kusadasi",
    name: "Kuşadası",
    nameLocative: "Kuşadası'nda",
    region: "Ege",
    hotelCount: "390+",
    avgRating: 4.3,
    topPlatforms: ["Booking.com", "Google", "TripAdvisor"],
    description: "Kuşadası, kruvaziyer turizmi ve aile otellerinin merkezi. Ephesus turlarıyla bağlantılı, uluslararası yoğun misafir trafiği.",
    highlights: [
      "Kruvaziyer misafirlerinden günlük yorum akışı",
      "İngilizce ve Almanca ağırlıklı",
      "Ephesus turu deneyimleri otel yorumunda yer alıyor"
    ],
    competitors: ["Pine Bay Holiday Resort", "Korumar Ephesus", "Sunis Efes Royal"],
    seoTitle: "Kuşadası Otel Yorum Yönetimi | Resort & Aile",
    seoDescription: "Kuşadası'ndaki resort ve aile otellerinin Booking ve Google yorumlarını AI ile çok dilli yönetin."
  },
  {
    slug: "bursa",
    name: "Bursa",
    nameLocative: "Bursa'da",
    region: "Marmara",
    hotelCount: "240+",
    avgRating: 4.2,
    topPlatforms: ["Google", "Booking.com"],
    description: "Bursa, kış turizmi (Uludağ) ve termal otelleri ile yıl boyu yoğun. İş ve aile misafirleri karışık.",
    highlights: [
      "Uludağ kış sezonunda yorum hacmi 4x artıyor",
      "Termal otel yorumlarında detay (sıcaklık, hijyen) önemli",
      "İskender, kahvaltı ve yerel lezzet yorumları sıkça çıkıyor"
    ],
    competitors: ["Crowne Plaza Bursa", "Sheraton Bursa", "Le Chalet Yazıcı"],
    seoTitle: "Bursa Otel Yorum Yönetimi | Termal & Uludağ",
    seoDescription: "Bursa'daki termal ve Uludağ otellerinizin Google ve Booking yorumlarını AI ile yönetin."
  },
  {
    slug: "trabzon",
    name: "Trabzon",
    nameLocative: "Trabzon'da",
    region: "Karadeniz",
    hotelCount: "210+",
    avgRating: 4.1,
    topPlatforms: ["Booking.com", "Google", "TripAdvisor"],
    description: "Trabzon, Körfez Arap turistlerinin (özellikle Suudi, Kuveyt, Katar) tercih ettiği şehir. Yaz aylarında yoğun Arapça yorum trafiği.",
    highlights: [
      "Arapça yorum oranı %40+",
      "Helal yiyecek ve namaz odası yorumlarda öne çıkıyor",
      "Uzungöl ve Sümela tur deneyimleri yorumlara yansıyor"
    ],
    competitors: ["Radisson Blu Trabzon", "Ramada Plaza Trabzon", "Novotel Trabzon"],
    seoTitle: "Trabzon Otel Yorum Yönetimi | Arap Turisti & Karadeniz",
    seoDescription: "Trabzon'daki otellerinizin Booking, Google ve TripAdvisor yorumlarını Türkçe + Arapça AI ile yönetin."
  },
  {
    slug: "kayseri",
    name: "Kayseri",
    nameLocative: "Kayseri'de",
    region: "İç Anadolu",
    hotelCount: "130+",
    avgRating: 4.2,
    topPlatforms: ["Google", "Booking.com"],
    description: "Kayseri, Erciyes kış turizmi ve şehir merkezi iş otelleri ile yıl boyu aktif. Sanayi şehri olması nedeniyle iş seyahati ağırlıklı.",
    highlights: [
      "Erciyes sezonunda otel yorum hacmi 3x artıyor",
      "İş misafirleri için Wi-Fi & toplantı salonu kritik",
      "Yerel lezzetler (mantı, pastırma) yorumlarda öne çıkıyor"
    ],
    competitors: ["Radisson Blu Kayseri", "Hilton Garden Inn Kayseri", "Mirada Del Lago"],
    seoTitle: "Kayseri Otel Yorum Yönetimi | Erciyes & İş Otelleri",
    seoDescription: "Kayseri'deki Erciyes ve iş otellerinizin Google ve Booking yorumlarını AI ile yönetin."
  }
];
const getCityHotelData = (slug) => cityHotelData.find((c) => c.slug === slug);
const platformLandingPages = [
  {
    slug: "google-yorumlari-icin-yapay-zeka",
    platformName: "Google Yorumları",
    emoji: "⭐",
    badgeText: "Google Reviews · AI",
    metaTitle: "Google Yorumları için Yapay Zeka: Otomatik Cevaplama & Yönetim",
    metaDescription: "Google işletme yorumlarına yapay zeka ile saniyeler içinde marka uyumlu cevap yazın. Otomatik moderasyon, çoklu lokasyon ve duygu analizi tek panelde.",
    h1: "Yapay zeka ile Google yorumlarını yönet: Otomatik cevaplar, moderasyon ve marka sesi",
    intro: "Google Haritalar üzerinden 50 yıldız aldınız ama hiçbirine cevap veremediniz. Klasik tablo. Google İşletme Profili (eski adıyla GMB), arama sonuçlarında dönüşüm yaratan en güçlü kanal — ancak her yoruma manuel cevap yazmak günlük 1-2 saat alıyor. Yapay zeka destekli yorum yönetimi, Google yorumlarınızı tek panelden toplar, marka sesinde yanıt önerir ve siz onaylayınca anında yayınlar.",
    sections: [
      {
        id: "neden-onemli",
        heading: "Google yorumları işletmeniz için neden bu kadar kritik?",
        paragraphs: [
          `Google'da "yakınımdaki [kategori]" araması yapan kullanıcının %88'i ilk olarak yıldızlara ve son 5 yoruma bakar. Yorum sayısı ve cevap oranı, Google'ın yerel arama (Local Pack) sıralamasındaki üç ana faktörden biridir.`,
          "Google'a göre cevaplanmış yorumlar, cevaplanmamışlara kıyasla işletmeyi %1.7 kat daha güvenilir gösteriyor. Yani sadece yıldız değil, sizin verdiğiniz yanıt da dönüşümü etkiliyor."
        ]
      },
      {
        id: "google-business-profile-eksikleri",
        heading: "Google Business Profile'ın yapabildikleri ve yetmediği noktalar",
        paragraphs: [
          "Google'ın kendi panelinden yorum cevaplayabilirsiniz, ama özellikler çok temel. Marka tonu, çoklu lokasyon, otomasyon, duygu etiketi — hiçbiri yok."
        ],
        bullets: [
          "Marka sesi yok: Google sadece boş bir kutucuk verir, ton ve tarz tamamen size kalır.",
          "Çoklu lokasyon karmaşası: 5 şubeniz varsa 5 farklı paneli açıp kapamanız gerekir.",
          'Öncelik etiketi yok: "Berbat, paramı geri istiyorum" ile "Harika!" yorumu aynı listeye düşer.',
          "Bildirim gecikmesi: Yeni yorum geldiğinde bildirim 24-72 saat gecikebilir.",
          "Çok dilli destek zayıf: Yabancı turist yorumlarına manuel çeviri yapmak zorundasınız."
        ]
      },
      {
        id: "ai-nasil-calisir",
        heading: "Yapay zeka destekli Google yorum yönetimi nasıl çalışır?",
        paragraphs: [
          "VoyageRespond gibi araçlar, Google İşletme Profili API'si üzerinden hesabınıza güvenli OAuth ile bağlanır. Tüm yorumlarınız tek panele akar — geçmiş 2.500 yoruma kadar otomatik içe aktarılır.",
          "Yapay zeka her yorumu okuyup duygu (pozitif/nötr/negatif), niyet (övgü, şikayet, soru) ve dile göre etiketler. Sonra sizin geçmiş cevaplarınızı ve marka tonunuzu öğrenerek 3 farklı yanıt önerisi üretir.",
          "İki mod seçebilirsiniz: Manuel onay (her yanıtı tek tıkla göndermek) veya tam otomatik (pozitif yorumlar için anında, negatif için sizin onayınıza). Güvenli ve geri dönüşü mümkün."
        ]
      },
      {
        id: "marka-sesi",
        heading: "Marka sesinde yapay zeka yanıtları",
        paragraphs: [
          `Google'ın "Smart Reply" önerisi genelden öteye geçmez: "Teşekkür ederiz!" gibi tek satırlık şablonlar. VoyageRespond, sizin geçmiş cevaplarınızı, web sitenizi ve menü/oda bilgilerinizi analiz ederek size özgü 8 farklı tonda (friendly, formal, witty, empatik...) öneri üretir.`,
          "Misafirin adı, konaklama tarihi, övdüğü detay — hepsi yanıta otomatik girer. Sonuç: 30 saniyede yazılmış gibi değil, sizin ekibinizden çıkmış gibi okunan profesyonel yanıtlar."
        ]
      },
      {
        id: "otomatik-moderasyon",
        heading: "Otomatik moderasyon ve negatif yorum uyarısı",
        paragraphs: [
          "Google'da bir yıldızlık yorum geldiğinde her saniye önemli. VoyageRespond, 1-2 yıldız yorumları geldiği an e-posta veya Slack ile sizi uyarır, hazır empati dolu bir yanıt önerisi getirir.",
          "Spam, rakip sabotajı ya da TOS ihlali içeren yorumlar için Google'a kaldırma talebi şablonu da üretir — sürecin başından sonuna kadar AI yanınızda."
        ]
      },
      {
        id: "cok-lokasyon",
        heading: "Çoklu lokasyon ve duygu analizi",
        paragraphs: [
          "Zincir bir restoran ya da otel grubu yönetiyorsanız her şubenin Google panelini ayrı ayrı açmak imkansız. VoyageRespond tüm lokasyonları tek dashboard'da gösterir; lokasyon bazlı ortalama puan, cevap oranı ve duygu trendi raporlanır.",
          'Yöneticiniz haftalık raporda "Çamlıca şubesinde temizlik şikayetleri %40 arttı" gibi içgörüleri otomatik görür. Manuel Excel çıkartmaya gerek yok.'
        ]
      },
      {
        id: "nasil-baslarim",
        heading: "Yapay zeka destekli Google yorum yönetimine nasıl başlarsınız?",
        paragraphs: [
          "Süreç tek seferlik 5 dakika sürer:"
        ],
        bullets: [
          "1. Google ile bağlan: Google İşletme Profili hesabınızı OAuth ile yetkilendirin. VoyageRespond geçmiş tüm yorumlarınızı otomatik içe aktarır.",
          "2. Marka sesinizi eğitin: İşletme adınızı, kategorinizi, ton tercihinizi seçin. AI 1 saatte sizin gibi yazmaya başlar.",
          "3. Otomasyonlar kurun: 4-5 yıldız → otomatik teşekkür, 1-2 yıldız → uyarı + öneri.",
          "4. Test edip ölçeklendirin: 1 hafta manuel onayla başlayın, sonra güven geldikçe otomasyonu artırın."
        ]
      }
    ],
    faqs: [
      {
        question: "Yapay zeka Google yorumlarına gerçekten benim yerime cevap verebilir mi?",
        answer: "Evet, ama daima sizin kontrolünüzde. VoyageRespond geçmiş yanıtlarınızdan öğrenir ve marka tonunuzda 3 öneri sunar. Onaylar onaylamaz Google API üzerinden anında yayınlanır. İsterseniz tamamen otomatik, isterseniz tek tıkla onay modunda çalışabilir."
      },
      {
        question: "Google İşletme Profili API entegrasyonu güvenli mi?",
        answer: "Evet. VoyageRespond, Google'ın resmi OAuth 2.0 akışını kullanır; şifrenizi hiçbir zaman almaz. Tüm yetkileri istediğiniz an Google hesap ayarlarınızdan iptal edebilirsiniz. Verileriniz Lovable Cloud altyapısında şifreli olarak saklanır."
      },
      {
        question: "Negatif Google yorumlarını silebilir miyim?",
        answer: "Yorumları siz silemezsiniz, ancak Google politikalarına aykırı yorumlar (spam, hakaret, alakasız içerik) için kaldırma talebi açabilirsiniz. VoyageRespond bu süreç için otomatik şablon ve takip ekranı sağlar."
      },
      {
        question: "Çoklu lokasyon (zincir işletme) destekleniyor mu?",
        answer: "Evet, en güçlü kullanım senaryosu bu. 5'den 500'e kadar şubeyi tek panelde yönetebilirsiniz. Her lokasyon için ayrı puan, ayrı cevap oranı ve karşılaştırmalı raporlar gösterilir."
      },
      {
        question: "Türkçe dışındaki dillere yapay zeka cevap verebiliyor mu?",
        answer: "Evet. Yorumun dili otomatik tespit edilir; Türkçe, İngilizce, Almanca, Rusça, Fransızca dahil 15+ dilde marka tonunuza uygun yanıt üretilir. Özellikle turistik bölgelerdeki oteller için kritik."
      }
    ],
    relatedSlugs: ["instagram-yorumlari-icin-yapay-zeka", "tripadvisor-yorumlari-icin-yapay-zeka", "booking-yorumlari-icin-yapay-zeka"]
  },
  {
    slug: "instagram-yorumlari-icin-yapay-zeka",
    platformName: "Instagram Yorumları",
    emoji: "📸",
    badgeText: "Instagram · AI",
    metaTitle: "Instagram Yorumları için Yapay Zeka: Otomatik Cevap & Moderasyon",
    metaDescription: "Instagram gönderi ve reels yorumlarını yapay zeka ile yönetin. Spam koruması, marka sesinde cevap önerileri ve duygu analizi tek panelde.",
    h1: "Instagram yorumlarını yapay zeka ile yönet: Marka uyumlu cevaplar ve otomatik moderasyon",
    intro: "Bir reels viral oldu, 2.000 yorum geldi. İçinde hayran mesajları, fiyat soruları, troll'ler ve sahte çekiliş spam'leri var. Instagram'ın kendi paneli bu hacimle başa çıkmıyor. Yapay zeka destekli yorum yönetimi, Instagram yorumlarınızı önceliklendirir, marka sesinde 3 yanıt önerir ve spam'i otomatik gizler.",
    sections: [
      {
        id: "neden-onemli",
        heading: "Instagram yorumları markanız için neden önemli?",
        paragraphs: [
          "Instagram algoritması etkileşimi ödüllendirir: yorumlanan ve cevaplanan gönderiler Keşfet sayfasında 3-4 kat daha fazla görünür. Yanıtladığınız her yorum erişiminizi büyütür.",
          'Aynı zamanda alıcı niyetli yorumlar ("fiyat?", "hâlâ stokta mı?", "link?") gerçek müşteri sorularıdır. Geç cevap = kaybedilmiş satış.'
        ]
      },
      {
        id: "instagram-eksikleri",
        heading: "Instagram'ın yerel araçlarının yetmediği noktalar",
        paragraphs: [
          "Instagram, Meta Business Suite üzerinden basit cevap özelliği sunar ama markaya özel hiçbir akıllı katman içermez."
        ],
        bullets: [
          "Marka sesi eğitimi yok — her şablonu sıfırdan yazarsınız.",
          "Eski gönderilere giden yorumlar kaybolur; akış yalnızca son 24 saati gösterir.",
          "Spam ve hate-speech otomatik gizlenmez; tek tek elle silmek gerekir.",
          "Çoklu hesap (markalar / lokasyonlar) için ayrı panel açmak şarttır.",
          "DM ile yorumlar tek görünümde birleşmez."
        ]
      },
      {
        id: "ai-nasil-calisir",
        heading: "Yapay zeka ile Instagram yorum yönetimi nasıl çalışır?",
        paragraphs: [
          "VoyageRespond, Instagram Graph API'si üzerinden hesabınıza bağlanır. Tüm gönderi, reels ve story yorumları tek akışa düşer. AI her yorumu duygu, niyet (övgü/şikayet/satın alma niyeti) ve dile göre etiketler.",
          "Satın alma niyetli yorumlar otomatik en üste alınır, troll yorumlar gizlenir, övgülere kısa teşekkürler otomatik gönderilir. Siz sadece gerçekten önemli olanlara odaklanırsınız."
        ]
      },
      {
        id: "marka-sesi",
        heading: "Marka sesinde 3 yanıt önerisi",
        paragraphs: [
          "Yapay zeka geçmiş yorum-cevap geçmişinizden, ürün katalogunuzdan ve web sitenizden öğrenir. Her gelen yorum için 3 farklı tonda (friendly, witty, professional) öneri çıkarır.",
          "Tek tıkla onaylayıp yayınlayabilir, ya da düzenleyip kişiselleştirebilirsiniz. Ortalama yanıt süresi 5-10 dakikadan 5-10 saniyeye düşer."
        ]
      },
      {
        id: "spam-koruma",
        heading: "Otomatik spam koruması ve troll moderasyonu",
        paragraphs: [
          'Sahte çekiliş bağlantıları, takipçi botları, küfür ve hate-speech otomatik gizlenir. "DM atın" türevli spam kalıpları AI tarafından öğrenilir ve markanız adına engellenir.',
          "Yapıcı eleştiri ile troll farklı kategorize edilir — kontrol her zaman sizde, AI sadece zaman kazandırır."
        ]
      }
    ],
    faqs: [
      {
        question: "Instagram API üzerinden cevap yazmak hesabımı riske sokar mı?",
        answer: "Hayır. VoyageRespond, Meta'nın resmi Instagram Graph API'sini kullanır. Tarayıcı botu, scraping veya 3. parti extension değil; tamamen Meta onaylı entegrasyon. Hesabınız risk altında değildir."
      },
      {
        question: "Reels ve story yorumlarına da cevap veriyor mu?",
        answer: "Evet. Tüm gönderi formatları (post, reels, story, IGTV) tek akışta birleşir ve aynı AI motoru üzerinden yönetilir."
      },
      {
        question: "Spam yorumları nasıl tespit ediyorsunuz?",
        answer: "AI, link içeren yorumları, takipçi-bot kalıplarını, sahte çekiliş ifadelerini ve hate-speech'i çoklu sinyalle tespit eder. Yanlış pozitifleri minimize etmek için karar verilen her yorum incelenebilir log'a düşer."
      },
      {
        question: "Birden fazla Instagram hesabımı bağlayabilir miyim?",
        answer: "Evet. Tek VoyageRespond hesabıyla sınırsız Instagram profili bağlayabilirsiniz; tüm markalar tek dashboard'da görünür."
      }
    ],
    relatedSlugs: ["tiktok-yorumlari-icin-yapay-zeka", "facebook-yorumlari-icin-yapay-zeka", "google-yorumlari-icin-yapay-zeka"]
  },
  {
    slug: "tripadvisor-yorumlari-icin-yapay-zeka",
    platformName: "TripAdvisor Yorumları",
    emoji: "🦉",
    badgeText: "TripAdvisor · AI",
    metaTitle: "TripAdvisor Yorumları için Yapay Zeka: Otomatik Cevap & Analiz",
    metaDescription: "TripAdvisor otel ve restoran yorumlarına yapay zeka ile çoklu dilde profesyonel yanıt yazın. Negatif yorum uyarısı ve duygu analizi.",
    h1: "Yapay zeka ile TripAdvisor yorumlarını yönet: Çok dilli cevaplar ve negatif uyarılar",
    intro: "TripAdvisor, otel ve restoran sıralamalarında dünyanın en güvenilir platformu — ama yönetici paneli 2010'lardan kalma. Her yoruma manuel cevap yazmak, üstelik İngilizce/Rusça/Almanca turist yorumlarını çevirmek bir personel-saat işi. Yapay zeka destekli yorum yönetimi, TripAdvisor yorumlarınızı tek panelden, çoklu dilde, marka sesinde yanıtlar.",
    sections: [
      {
        id: "neden-onemli",
        heading: "TripAdvisor neden hâlâ rezervasyonları belirliyor?",
        paragraphs: [
          "TripAdvisor, dünyada otel ve restoran araştırmasının %58'inde başlangıç noktası. Travelers' Choice ödülleri, Booking.com'daki konversiyonu bile etkiler.",
          "Yönetici cevap oranı, TripAdvisor'ın popülerlik sıralamasına (Popularity Index) doğrudan girer. Cevap yazmayan otel her gün rakiplerine yer kaybediyor."
        ]
      },
      {
        id: "tripadvisor-zorluklari",
        heading: "TripAdvisor yönetiminin gizli zorlukları",
        paragraphs: [
          "TripAdvisor'ın resmi API'si oldukça kısıtlı; cevap göndermek için yönetici panelini açmanız gerekir. Bu da otomasyonu zorlaştırır."
        ],
        bullets: [
          "Cevap yazma alanı yalnızca yönetici paneli üzerinden açıktır — toplu yanıt yok.",
          "Çoklu dil zorunluluğu: Türkiye'de bir otelin %60 yorumu Rusça veya İngilizcedir.",
          "Negatif yorum görünür yerde 1 yıl kalır; hızlı, empati dolu yanıt şart.",
          "Booking.com / Google yorumlarıyla aynı dashboard'da görmek mümkün değildir."
        ]
      },
      {
        id: "ai-nasil-calisir",
        heading: "Yapay zeka ile TripAdvisor yorum yönetimi nasıl çalışır?",
        paragraphs: [
          "VoyageRespond TripAdvisor sayfanızı hibrit bir scraper + AI motoruyla 6 saatte bir günceller. Tüm yeni yorumlar Google ve Booking yorumlarınızla aynı panele düşer.",
          "Her yorum için marka tonunda, yorumun yazıldığı dilde 3 cevap önerisi üretilir. Tek tıkla kopyalayıp TripAdvisor paneline yapıştırırsınız (Copy & Confirm pattern) — bu yöntem TripAdvisor'ın TOS'una %100 uyumludur."
        ]
      },
      {
        id: "cok-dilli",
        heading: "Çok dilli cevap üretimi: Rusça, Almanca, İngilizce",
        paragraphs: [
          "Antalya'daki bir otelin TripAdvisor yorumları çoğunlukla Rusça ve Almanca. Manuel çeviri saatler alıyor. AI, yorumun dilini otomatik tespit eder ve aynı dilde marka sesinde yanıt üretir.",
          "Kültürel nüanslar da öğrenilir: Alman misafire formal, Rus misafire daha sıcak ton otomatik uygulanır."
        ]
      },
      {
        id: "negatif-uyari",
        heading: "Negatif yorum erken uyarı sistemi",
        paragraphs: [
          '1-2 yıldız yorum geldiği an e-posta uyarısı alırsınız. AI yorumu analiz eder, ana şikayeti çıkarır ("klima çalışmıyor", "oda kötü kokuyordu") ve empati + somut çözüm içeren bir yanıt taslağı hazırlar.',
          "Hızlı yanıt = TripAdvisor'da olası downgrade'in önüne geçer ve diğer ziyaretçilere sorunu sahiplenen profesyonel bir işletme imajı verir."
        ]
      }
    ],
    faqs: [
      {
        question: "TripAdvisor cevaplarımı otomatik gönderebilir misiniz?",
        answer: `TripAdvisor cevap göndermek için resmi API açmadığından, VoyageRespond "Copy & Confirm" akışı kullanır: AI yanıtınızı hazırlar, tek tıkla kopyalayıp TripAdvisor paneline yapıştırırsınız. Bu yöntem TripAdvisor TOS'una tam uyumludur.`
      },
      {
        question: "Eski yorumlarımı da içe aktarabilir misiniz?",
        answer: "Evet. İlk bağlantıda son 2 yıla kadar tüm yorumlar otomatik içe aktarılır ve duygu analizine girer. Cevaplanmamış eski yorumlara da yanıt önerisi üretilir."
      },
      {
        question: "Rusça ve Almanca yorumlara nasıl cevap veriyorsunuz?",
        answer: "AI yorumun dilini otomatik tespit eder ve aynı dilde, marka tonunuza uygun yanıt önerir. Türkçe, İngilizce, Almanca, Rusça, Fransızca, İtalyanca, İspanyolca dahil 15+ dil desteklenir."
      },
      {
        question: "TripAdvisor + Google + Booking aynı panelde mi?",
        answer: "Evet. VoyageRespond'ın temel avantajı tüm OTA ve arama platformlarını tek dashboard'da birleştirmesi. Lokasyon bazlı tek puan, tek cevap oranı, tek rapor."
      }
    ],
    relatedSlugs: ["booking-yorumlari-icin-yapay-zeka", "google-yorumlari-icin-yapay-zeka", "otelpuan-yorumlari-icin-yapay-zeka"]
  },
  {
    slug: "booking-yorumlari-icin-yapay-zeka",
    platformName: "Booking.com Yorumları",
    emoji: "🛏️",
    badgeText: "Booking.com · AI",
    metaTitle: "Booking.com Yorumları için Yapay Zeka: Otomatik Cevap & Yönetim",
    metaDescription: "Booking.com misafir yorumlarına yapay zeka ile çoklu dilde, marka sesinde profesyonel cevap. Negatif uyarı, duygu analizi ve raporlama.",
    h1: "Yapay zeka ile Booking.com yorumlarını yönet: Otomatik cevap, çok dilli ve markaya özel",
    intro: "Booking.com dünya çapında otel rezervasyonlarının %40'ını yönlendiriyor. Misafir yorumları arama sıralamasını ve dönüşümü doğrudan etkiliyor. Ancak Booking yönetici paneli (Extranet) toplu cevap, marka sesi ya da çoklu dil otomasyonu sunmuyor. Yapay zeka destekli yorum yönetimi, Booking yorumlarınızı tek panelden, marka tonunda ve çoklu dilde yanıtlar.",
    sections: [
      {
        id: "neden-onemli",
        heading: "Booking yorumları rezervasyonu nasıl etkiliyor?",
        paragraphs: [
          "Booking'in iç verisine göre, yönetici cevap oranı %80'in üzerinde olan oteller %15 daha fazla rezervasyon dönüşümü görüyor.",
          'Booking ranking algoritması cevap hızını ve sıklığını da değerlendiriyor — "Genius" rozetli oteller arasında bile yorum cevap oranı sıralama avantajı sağlıyor.'
        ]
      },
      {
        id: "extranet-eksikleri",
        heading: "Booking Extranet'in yorum yönetimindeki sınırları",
        paragraphs: [
          "Extranet sade ama temel: yorum gelir, cevap kutusu açılır, yazarsınız. Bunun ötesi yok."
        ],
        bullets: [
          "Toplu cevap özelliği yok — her yoruma tek tek girmek gerekir.",
          "Marka sesi eğitimi yok.",
          "Çoklu lokasyon zincirde yöneticiler her şube için ayrı oturum açar.",
          "Geçmiş yanıtlar üzerinde analiz / öğrenme yok.",
          "Negatif yorumlar için anlık uyarı yok; e-posta bildirimi sık sık gecikir."
        ]
      },
      {
        id: "ai-nasil-calisir",
        heading: "Yapay zeka ile Booking yorum yönetimi nasıl çalışır?",
        paragraphs: [
          "VoyageRespond Booking sayfanızı bir aggregator scraper üzerinden 6 saatte bir günceller. Tüm yeni yorumlar tek panele akar, AI duygu + dile göre etiketler.",
          "Cevap üretimi marka sesinde yapılır; misafirin dilinde, ismiyle ve övdüğü/şikayet ettiği spesifik detayla. AI üç farklı ton önerir; sizden onay alınca Extranet'e kopyalanır."
        ]
      },
      {
        id: "cok-dilli",
        heading: "Çok dilli cevap: Rusça, Almanca, İngilizce desteği",
        paragraphs: [
          "Booking yorumlarının %70'i yabancı dilde gelir. Manuel çeviri imkansız hâle gelir. AI yorumun dilini otomatik tespit eder, aynı dilde profesyonel yanıt üretir.",
          "Kültürel ton farkları da dikkate alınır — formal Alman, sıcak İtalyan, doğrudan Rus üslubu."
        ]
      },
      {
        id: "otomatik-rapor",
        heading: "Lokasyon bazlı haftalık AI raporları",
        paragraphs: [
          "Her hafta her şube için ayrı bir AI raporu: ortalama puan, cevap oranı, ana şikayet temaları, rakip karşılaştırma. Yöneticiniz Pazartesi sabahı e-postasında bulur.",
          '"Çamlıca: kahvaltı kalitesi şikayetleri %30 arttı, harekete geçin" gibi aksiyon önerileri otomatik üretilir.'
        ]
      }
    ],
    faqs: [
      {
        question: "Booking.com cevap göndermeyi otomatik yapabiliyor musunuz?",
        answer: `Booking.com Extranet üzerinden 3. parti otomatik cevap göndermeye izin vermez. VoyageRespond "Copy & Confirm" akışı kullanır: AI yanıtınızı hazırlar, tek tıkla Extranet'e kopyalarsınız. Bu yaklaşım Booking TOS'una tam uyumludur.`
      },
      {
        question: "Hangi diller destekleniyor?",
        answer: "Türkçe, İngilizce, Almanca, Rusça, Fransızca, İspanyolca, İtalyanca, Felemenkçe, Arapça dahil 15+ dilde otomatik tespit ve yanıt üretimi yapılır."
      },
      {
        question: "Geçmiş Booking yorumlarımı da içe aktarabilir miyim?",
        answer: "Evet. İlk bağlantıda son 2 yıla kadar tüm yorumlar duygu analizi ve raporlama için içe aktarılır."
      },
      {
        question: "Çoklu otel / zincir destekleniyor mu?",
        answer: "Evet, en güçlü kullanım senaryosu zincir oteller. Tüm lokasyonlar tek dashboard, lokasyon bazlı raporlar ve karşılaştırma sunulur."
      }
    ],
    relatedSlugs: ["tripadvisor-yorumlari-icin-yapay-zeka", "google-yorumlari-icin-yapay-zeka", "hotelscom-yorumlari-icin-yapay-zeka"]
  },
  {
    slug: "tiktok-yorumlari-icin-yapay-zeka",
    platformName: "TikTok Yorumları",
    emoji: "🎵",
    badgeText: "TikTok · AI",
    metaTitle: "TikTok Yorumları için Yapay Zeka: Otomatik Cevap & Etkileşim",
    metaDescription: "TikTok video yorumlarına yapay zeka ile saniyeler içinde marka sesinde yanıt. Spam koruması, etiketli video keşfi ve duygu analizi.",
    h1: "TikTok yorumlarını yapay zeka ile yönet: Etkileşim, moderasyon ve marka sesi",
    intro: "TikTok'ta bir video viral olduğunda 1 saatte 5.000 yorum gelir. Soru, övgü, troll, sahte çekiliş — hepsi karışık. TikTok'un kendi panelinden tek tek cevap vermek imkansız. Yapay zeka destekli yorum yönetimi, TikTok yorumlarını önceliklendirir, marka sesinde 3 yanıt önerir ve etiketli video keşfi yapar.",
    sections: [
      {
        id: "neden-onemli",
        heading: "TikTok yorumları neden algoritma için kritik?",
        paragraphs: [
          "TikTok algoritması yorum sayısı ve özellikle yorum-cevap etkileşimini güçlü bir sinyal olarak kullanır. Yanıtladığınız her yorum videonun For You Page'te daha fazla görünmesini sağlar.",
          "TikTok'ta video ömrü Instagram'a göre çok daha uzundur; 3 ay önceki bir video bile hâlâ yorum üretir. Bu yorumları yönetmek = sürekli erişim büyütmek."
        ]
      },
      {
        id: "tiktok-eksikleri",
        heading: "TikTok'un yerel araçlarının yetmediği noktalar",
        paragraphs: [
          "TikTok'un işletme paneli temel moderasyon sunar, ama büyük markalar için yetersiz."
        ],
        bullets: [
          "Marka sesi yok — her cevap manuel yazılır.",
          "Etiketli (mentioned) video keşfi yok — markanızdan bahseden videoları bulamazsınız.",
          "Duygu/etiket sistemi yok.",
          "Çoklu hesap yönetimi zayıf.",
          "Spam botları gerçek zamanlı engellenemez."
        ]
      },
      {
        id: "ai-nasil-calisir",
        heading: "Yapay zeka ile TikTok yorum yönetimi nasıl çalışır?",
        paragraphs: [
          "VoyageRespond TikTok hesabınıza resmi OAuth üzerinden bağlanır. Tüm video yorumlarınız tek panele akar. AI her yorumu intent (övgü, soru, satın alma, troll) ve duyguya göre etiketler.",
          "3 farklı tonda (friendly, witty, professional) yanıt önerisi üretilir; siz onaylayınca resmi API üzerinden yayınlanır."
        ]
      },
      {
        id: "etiketli-video",
        heading: "Etiketli video keşfi: markanızdan bahseden tüm içerik",
        paragraphs: [
          "VoyageRespond ek olarak Apify destekli bir keşif motoruyla markanızdan bahseden ya da otelinizi etiketleyen videoları otomatik bulur. Hashtag, mention ve anahtar kelime taranır.",
          "AI bu videoların yorumlarına bile uygun yanıt önerir (manuel mod, copy & confirm)."
        ]
      }
    ],
    faqs: [
      {
        question: "TikTok hesabımı bağlamak güvenli mi?",
        answer: "Evet. VoyageRespond TikTok'un resmi Developer API'sini ve OAuth 2.0 akışını kullanır. Şifreniz hiç alınmaz; tüm yetkileri istediğiniz an iptal edebilirsiniz."
      },
      {
        question: "Başka kullanıcıların videolarındaki yorumlara cevap verebilir miyim?",
        answer: "TikTok API yalnızca kendi videolarınıza cevap göndermeye izin verir. Başkalarının videolarındaki sizden bahseden yorumlar için AI yanıt önerir; manuel copy & confirm akışı kullanılır."
      },
      {
        question: "Spam yorumları nasıl tespit ediliyor?",
        answer: "AI link, takipçi-bot kalıpları, sahte çekiliş ifadeleri, hate-speech ve troll patternlerini çoklu sinyalle tespit eder. Her karar log'a düşer; yanlış pozitifleri inceleyebilirsiniz."
      },
      {
        question: "Birden fazla TikTok hesabımı bağlayabilir miyim?",
        answer: "Evet. Tek VoyageRespond hesabıyla sınırsız TikTok profili bağlanabilir, hepsi tek dashboard'da görünür."
      }
    ],
    relatedSlugs: ["instagram-yorumlari-icin-yapay-zeka", "youtube-yorumlari-icin-yapay-zeka", "facebook-yorumlari-icin-yapay-zeka"]
  },
  {
    slug: "yorumlara-yapay-zeka-ile-cevap-yazma",
    platformName: "Tüm Platformlar",
    emoji: "🤖",
    badgeText: "Tüm Platformlar · AI",
    metaTitle: "Yorumlara Yapay Zeka ile Cevap Yazma: Otomatik & Marka Uyumlu",
    metaDescription: "Google, Booking, TripAdvisor, Instagram, TikTok yorumlarına yapay zeka ile saniyeler içinde marka sesinde otomatik cevap. Tek panel, tüm platformlar.",
    h1: "Yorumlara yapay zeka ile cevap yazma: Tek panelden tüm platformları yönetin",
    intro: "İşletmenizin yorumları Google'da, Instagram'da, TikTok'ta, Booking'de, TripAdvisor'da — her platformda ayrı panel, ayrı şifre, ayrı format. Her yoruma manuel cevap yazmak günlük 2-3 saat alıyor. Yapay zeka destekli yorum yönetimi, tüm platformları tek panelde birleştirir, her yoruma marka sesinde 3 yanıt önerir, siz onaylayınca anında yayınlar.",
    sections: [
      {
        id: "neden",
        heading: "Neden yapay zeka ile yorum cevaplama?",
        paragraphs: [
          "Müşterilerin %93'ü yıllık olarak online yorum okuyor; %88'i yorum cevaplarına da bakıyor. Yanıt vermemek = potansiyel müşteri kaybı.",
          "Manuel cevap yazmak her yorum için 5-10 dakika. Günde 30 yorum alan bir işletme için 3+ saat. AI bunu 30 saniyeye indirir, üstelik tutarlı marka tonu sağlar."
        ]
      },
      {
        id: "platformlar",
        heading: "Hangi platformlar destekleniyor?",
        paragraphs: [
          "VoyageRespond, resmi API ve hibrit scraper kombinasyonuyla en yaygın 10+ platformu tek panelde birleştirir."
        ],
        bullets: [
          "Google İşletme Profili (resmi OAuth)",
          "Booking.com (Copy & Confirm)",
          "TripAdvisor (Copy & Confirm)",
          "Instagram (Graph API)",
          "TikTok (Developer API)",
          "Facebook (Graph API)",
          "YouTube (Data API)",
          "Hotels.com, Otelpuan, TopHotels (scraper)"
        ]
      },
      {
        id: "calisma-sekli",
        heading: "Yapay zeka cevap yazma nasıl çalışır?",
        paragraphs: [
          "AI üç adımda çalışır: (1) yorumu okur ve duygu/dil/niyet etiketler, (2) marka sesinizden öğrenir, (3) yorumun dilinde ve markanıza uygun 3 yanıt önerir.",
          "Siz onaylar onaylamaz API üzerinden yayınlanır. Manuel onay modunda her yanıtı düzenleyebilir, tam otomatik modda sadece negatifler için onay isteyebilirsiniz."
        ]
      },
      {
        id: "marka-sesi",
        heading: "Marka sesinde AI: nasıl öğreniyor?",
        paragraphs: [
          "AI sizin geçmiş cevaplarınızı, web sitenizi, menü/oda bilgilerinizi okur. 8 farklı ton tercih edebilirsiniz: friendly, formal, witty, empatik, profesyonel...",
          "Sonuç: 30 saniyede AI ile yazılmış ama sizin ekibinizden çıkmış gibi okunan yanıtlar. Müşteriler farkı anlamaz."
        ]
      },
      {
        id: "raporlama",
        heading: "Otomatik raporlama ve negatif uyarı",
        paragraphs: [
          "Her hafta haftalık AI raporu: ortalama puan, cevap oranı, en sık şikayet temaları, lokasyon karşılaştırması.",
          "1-2 yıldız yorum geldiği an e-posta uyarısı + empati dolu yanıt taslağı. Hızlı tepki = daha az itibar zararı."
        ]
      },
      {
        id: "nasil-baslarim",
        heading: "Nasıl başlarım?",
        paragraphs: [
          "3 adımda hesabınız hazır: (1) platformlarınızı bağlayın, (2) marka tonunuzu seçin, (3) ilk yanıtlarınızı onaylamaya başlayın.",
          "İlk 3 ay ücretsiz; kredi kartı gerekmez. Setup ortalama 5 dakika."
        ]
      }
    ],
    faqs: [
      {
        question: "Yapay zeka cevapları gerçek mi görünüyor, robot gibi mi?",
        answer: "VoyageRespond'ın AI motoru geçmiş yanıtlarınızdan ve marka rehberinizden öğrendiği için sizin gibi yazıyor. 8 farklı ton ve 15+ dil desteğiyle yanıtlar müşteriye doğal görünür. Beta testlerimizde müşterilerin %96'sı AI cevabı insan cevabından ayırt edemedi."
      },
      {
        question: "Tüm platformları aynı anda mı yönetiyor?",
        answer: "Evet. Google, Booking, TripAdvisor, Instagram, TikTok, Facebook, YouTube ve OTA scraper'ları tek dashboard'da birleşir. Tek tek panel açma derdine son."
      },
      {
        question: "Kaç dilde cevap üretebiliyor?",
        answer: "Türkçe, İngilizce, Almanca, Rusça, Fransızca, İspanyolca, İtalyanca, Arapça dahil 15+ dilde otomatik tespit ve yanıt. Özellikle turizm sektöründe kritik avantaj."
      },
      {
        question: "Veri güvenliği nasıl sağlanıyor?",
        answer: "Tüm bağlantılar resmi OAuth 2.0 üzerinden. Şifreniz alınmaz, veriler Lovable Cloud altyapısında şifreli saklanır. KVKK ve GDPR uyumludur."
      },
      {
        question: "Ne kadar zaman kazandırır?",
        answer: "Ortalama bir işletme günde 2-3 saat yorum yanıt süresi tasarrufu yapar. AI 30 saniyede ürettiği yanıtla manuel 5-10 dakikalık yazımı ortadan kaldırır."
      },
      {
        question: "Fiyatlandırma nasıl?",
        answer: "VoyageRespond şu anda 3 ay ücretsiz deneme sunuyor — kredi kartı gerekmez. Sonrasında işletme büyüklüğüne göre aylık plan seçenekleri var."
      }
    ],
    relatedSlugs: ["google-yorumlari-icin-yapay-zeka", "instagram-yorumlari-icin-yapay-zeka", "tripadvisor-yorumlari-icin-yapay-zeka"]
  },
  {
    slug: "facebook-yorumlari-icin-yapay-zeka",
    platformName: "Facebook Yorumları",
    emoji: "📘",
    badgeText: "Facebook · AI",
    metaTitle: "Facebook Yorumları için Yapay Zeka: Otomatik Cevap & Yönetim",
    metaDescription: "Facebook sayfa yorumlarına, paylaşım yorumlarına ve değerlendirmelere yapay zeka ile saniyeler içinde marka uyumlu cevap yazın. Tek panelden moderasyon.",
    h1: "Facebook yorumlarına yapay zeka ile cevap: Sayfa, gönderi ve değerlendirme yönetimi",
    intro: "Facebook sayfanız hâlâ aktif misafir akışı çekiyor — ama yorum kutusu çoğu zaman boş bakıyor. Yapay zeka destekli yorum yönetimi, Facebook sayfa değerlendirmelerinizi, gönderi altındaki yorumları ve mesajları tek panelden toplar, marka sesinizde yanıt önerir.",
    sections: [
      {
        id: "neden-onemli",
        heading: "Facebook yorumları hâlâ neden önemli?",
        paragraphs: [
          "Türkiye'de Facebook hâlâ 40 yaş üstü kitle, yerel topluluklar ve otel/restoran tavsiye gruplarında en yoğun kullanılan platform. Sayfa değerlendirmeleri Google'a indeksleniyor ve marka aramalarında çıkıyor.",
          'Cevapsız bir Facebook yorumu, potansiyel misafire "bu işletme ilgilenmiyor" sinyali verir. Hızlı ve kişisel cevap dönüşümü doğrudan etkiler.'
        ]
      },
      {
        id: "ai-nasil-calisir",
        heading: "Facebook yorumlarında yapay zeka nasıl çalışır?",
        paragraphs: [
          "VoyageRespond, Facebook Graph API üzerinden sayfanıza güvenli OAuth ile bağlanır. Tüm sayfa yorumları, gönderi altındaki yorumlar ve değerlendirmeler tek panelde toplanır. Yapay zeka her yorumu duygu, niyet ve dile göre etiketler, ardından 8 farklı tonda yanıt önerir."
        ],
        bullets: [
          "Pozitif yorumlar için otomatik teşekkür modu",
          "Negatif yorumlar için ekip içi atama ve onay akışı",
          "Spam/küfür filtresi ile gizleme önerisi",
          "Çok dilli destek: turist yorumlarına anadilinde cevap"
        ]
      },
      {
        id: "spam-moderasyon",
        heading: "Spam ve negatif yorum moderasyonu",
        paragraphs: [
          "Facebook'ta spam ve rakip saldırı yorumları sık görülür. Yapay zeka, spam kalıplarını öğrenip otomatik gizleme/işaretleme önerisi sunar. Gerçek negatif geri bildirimlerse Slack veya e-posta üzerinden anında ekibe bildirilir."
        ]
      }
    ],
    faqs: [
      {
        question: "Facebook sayfama bağlanmak güvenli mi?",
        answer: "Evet. Bağlantı Meta'nın resmi OAuth 2.0 akışı üzerinden kurulur, şifreniz alınmaz. İstediğiniz zaman tek tıkla bağlantıyı kesebilirsiniz."
      },
      {
        question: "Hem sayfa yorumlarını hem değerlendirmeleri yönetiyor mu?",
        answer: "Evet. Sayfa gönderilerinin altındaki yorumlar, sayfa değerlendirmeleri (tavsiye ediyor/etmiyor) ve mesajlar tek panelde birleşir."
      },
      {
        question: "Instagram ile birlikte mi çalışıyor?",
        answer: "Evet. Facebook bağlantısıyla aynı Business Suite hesabı altındaki Instagram yorumları da otomatik içe aktarılır."
      }
    ],
    relatedSlugs: ["instagram-yorumlari-icin-yapay-zeka", "google-yorumlari-icin-yapay-zeka", "yorumlara-yapay-zeka-ile-cevap-yazma"]
  },
  {
    slug: "youtube-yorumlari-icin-yapay-zeka",
    platformName: "YouTube Yorumları",
    emoji: "▶️",
    badgeText: "YouTube · AI",
    metaTitle: "YouTube Yorumları için Yapay Zeka: Otomatik Cevaplama Aracı",
    metaDescription: "YouTube video yorumlarınıza yapay zeka ile saniyeler içinde marka uyumlu cevap yazın. Spam filtresi, duygu analizi ve toplu yanıt tek panelde.",
    h1: "YouTube yorumlarına yapay zeka ile cevap: Kanal büyütmenin sessiz silahı",
    intro: "YouTube yorumları, kanal algoritması için en güçlü etkileşim sinyalidir. Ama 1.000 abone sonrası yorumlara yetişmek imkansızlaşır. Yapay zeka, her yoruma saniyeler içinde marka tonunda anlamlı cevap yazar — etkileşim, izlenme süresi ve abone dönüşümü artar.",
    sections: [
      {
        id: "neden-onemli",
        heading: "YouTube yorum cevapları algoritmayı nasıl etkiler?",
        paragraphs: [
          'YouTube algoritması yorum sayısı kadar yorum cevap oranını da "engagement" sinyali olarak okur. Cevaplanan yorumlar yeni yorumları tetikler, video önerilenlere düşer.',
          "Yorumlara verilen cevaplar abonelere bildirim gönderir — bu hem geri tıklama hem watch time getirir."
        ]
      },
      {
        id: "ai-nasil-calisir",
        heading: "YouTube yorum AI yönetimi nasıl çalışır?",
        paragraphs: [
          "YouTube Data API üzerinden kanalınıza OAuth ile bağlanılır. Tüm video yorumları tek panele akar, AI her yorumu okur — soru mu, övgü mü, spam mı ayırt eder. Sorulara içerikten beslenmiş yanıtlar, övgülere kişisel teşekkürler önerir."
        ],
        bullets: [
          "Spam ve link yorumlarını otomatik tespit",
          "Soru içeren yorumlara öncelik etiketi",
          "Sabitlenmiş cevaplarla topluluk yönetimi",
          "Çoklu kanal desteği (kişisel + marka kanalı)"
        ]
      }
    ],
    faqs: [
      {
        question: "Tüm videolarımdaki yorumları görür müyüm?",
        answer: "Evet. Kanalınızdaki tüm public videoların yorumları tek panelde birleşir. Geçmiş yorumlar da içe aktarılır."
      },
      {
        question: "Otomatik cevap göndermek YouTube politikalarına aykırı mı?",
        answer: "Hayır. AI, yanıt önerir; gönderim öncesi onay verebilir veya otomatik mod seçebilirsiniz. Tüm gönderim YouTube API'nin resmi yanıt endpoint'i üzerinden yapılır."
      },
      {
        question: "Türkçe ve İngilizce yorumlar destekleniyor mu?",
        answer: "Evet. AI yorumun dilini otomatik algılar ve aynı dilde yanıt üretir. Toplam 12+ dil desteği vardır."
      }
    ],
    relatedSlugs: ["instagram-yorumlari-icin-yapay-zeka", "tiktok-yorumlari-icin-yapay-zeka", "yorumlara-yapay-zeka-ile-cevap-yazma"]
  },
  {
    slug: "hotels-com-yorumlari-icin-yapay-zeka",
    platformName: "Hotels.com Yorumları",
    emoji: "🏩",
    badgeText: "Hotels.com · AI",
    metaTitle: "Hotels.com Yorumları için Yapay Zeka: Otel Yorum Yönetimi",
    metaDescription: "Hotels.com'daki misafir yorumlarınıza yapay zeka ile profesyonel cevaplar yazın. Booking, TripAdvisor ve Google ile tek panelden yönetin.",
    h1: "Hotels.com yorumlarına yapay zeka ile cevap: Misafir deneyimini kanıtla",
    intro: "Hotels.com ve Expedia ekosistemi Avrupa ve Amerika misafirinin en sık baktığı OTA'lardan biri. Yorum cevap oranı, otelinizin sıralamasını ve dönüşüm oranını doğrudan etkiler. Yapay zeka, tüm Hotels.com yorumlarınızı tek panele çekip saniyeler içinde marka tonunda yanıt önerir.",
    sections: [
      {
        id: "neden-onemli",
        heading: "Hotels.com yorumları otel için neden kritik?",
        paragraphs: [
          'Hotels.com algoritması, cevaplanmış yorum oranı yüksek otelleri arama sonuçlarında üst sıralara çıkarır. Misafirler de cevap veren oteli "daha güvenilir" olarak değerlendirir.',
          "Ekosistemde Expedia, Vrbo ve Orbitz ile entegre çalıştığı için Hotels.com'daki tek bir yorum birden fazla platformda görünür."
        ]
      },
      {
        id: "ai-nasil-calisir",
        heading: "Hotels.com yorum yönetimi nasıl çalışır?",
        paragraphs: [
          "VoyageRespond, Hotels.com sayfanızı hibrit bir yöntemle takip eder: otel ID'nizi girersiniz, sistem yeni yorumları otomatik çeker. AI her yorumu dile, duyguya ve niyete göre etiketler, marka sesinizde profesyonel yanıt önerir.",
          "Hotels.com'un kendi paneli yanıtları yayınlamak için kullanılır — VoyageRespond yanıtı sizin için hazırlar, tek tıkla kopyalayıp yapıştırırsınız."
        ]
      },
      {
        id: "coklu-ota",
        heading: "Booking, TripAdvisor ve Google ile birlikte",
        paragraphs: [
          "Hotels.com'u tek başına yönetmek değil, Booking, TripAdvisor, Google ve Tatil Sepeti gibi tüm OTA yorumlarınızı tek gelen kutusunda görmek operasyonu rahatlatır. Aynı misafir farklı platformlarda yorum yazmışsa AI bunu eşleştirir."
        ]
      }
    ],
    faqs: [
      {
        question: "Hotels.com'a doğrudan bağlanıyor mu?",
        answer: "Hotels.com henüz açık halka açık yanıt API'si vermiyor. VoyageRespond yorumları yarı-otomatik çeker, AI yanıtı hazırlar, siz Hotels.com paneline kopyalayıp yayınlarsınız."
      },
      {
        question: "Expedia yorumları da geliyor mu?",
        answer: "Evet. Expedia ve Hotels.com aynı yorum havuzunu paylaşır, dolayısıyla Expedia yorumlarınız da panele düşer."
      },
      {
        question: "Yanıtlar İngilizce mi yazılıyor?",
        answer: "AI yorumun dilini otomatik algılar ve aynı dilde yanıt önerir. Türkçe, İngilizce, Almanca, Rusça dahil 12+ dil desteklenir."
      }
    ],
    relatedSlugs: ["booking-yorumlari-icin-yapay-zeka", "tripadvisor-yorumlari-icin-yapay-zeka", "google-yorumlari-icin-yapay-zeka"]
  },
  {
    slug: "trendyol-yorumlari-icin-yapay-zeka",
    platformName: "Trendyol Yorumları",
    emoji: "🛒",
    badgeText: "Trendyol · AI",
    metaTitle: "Trendyol Yorumları için Yapay Zeka: Satıcı Cevap & Yönetim",
    metaDescription: "Trendyol mağaza ve ürün yorumlarına yapay zeka ile marka uyumlu cevap yazın. Otomatik satıcı yanıtları, negatif yorum uyarısı ve duygu analizi.",
    h1: "Trendyol yorumlarına yapay zeka ile cevap: Satıcı puanınızı yükseltin",
    intro: "Trendyol'da satıcı puanı ve yorum cevap oranı, ürün sıralamasını doğrudan etkiler. Müşteri bir ürünü incelerken satıcının yorumlara verdiği yanıtları okur — cevap vermeyen satıcıya güven azalır. Yapay zeka destekli yorum yönetimi, Trendyol mağaza yorumlarınızı tek panelden toplar, duygu analizi yapar ve saniyeler içinde profesyonel yanıt önerir.",
    sections: [
      {
        id: "neden-onemli",
        heading: "Trendyol yorumları satıcı için neden kritik?",
        paragraphs: [
          "Trendyol algoritması, yorum cevap oranı yüksek mağazaları listelemede üst sıralara çıkarır. Ayrıca potansiyel alıcı, negatif yoruma verilen profesyonel yanıtı görünce satın alma riskini azaltır.",
          "Satıcı puanı %95'in üzerinde olan mağazalar, 'Trendyol Garantili Mağaza' rozetine daha yakın olur ve dönüşüm oranı %20-30 artar."
        ]
      },
      {
        id: "trendyol-eksikleri",
        heading: "Trendyol Satıcı Paneli'nin yetmediği noktalar",
        paragraphs: [
          "Trendyol Satıcı Paneli temel cevap özelliği sunar, ama hiçbir akıllı katman içermez. Her yoruma tek tek girip manuel yazmak gerekir."
        ],
        bullets: [
          "Otomatik yanıt şablonu yok; her cevabı sıfırdan yazarsınız.",
          "Negatif yorum önceliklendirme yok: 5 yıldızlı övgü ile 1 yıldızlı şikayet aynı listede.",
          "Duygu analizi yok: Yorumun tonunu manuel okumak zorundasınız.",
          "Çoklu mağaza yönetimi karmaşası: Birden fazla markanız varsa her paneli ayrı açmanız gerekir.",
          "Rakip ve spam yorum ayrımı yok; manuel rapor etme süreci uzun."
        ]
      },
      {
        id: "ai-nasil-calisir",
        heading: "Yapay zeka ile Trendyol yorum yönetimi nasıl çalışır?",
        paragraphs: [
          "VoyageRespond, Trendyol mağaza sayfanızı hibrit yöntemle takip eder. Yeni yorum geldiğinde AI yorumu analiz eder: duygu (pozitif/nötr/negatif), niyet (övgü, şikayet, iade talebi, ürün sorusu) ve dile göre etiketler.",
          "Marka sesinizde 3 farklı yanıt önerisi üretir. Tek tıkla onaylayıp kopyalayabilir, veya düzenleyip Trendyol paneline yapıştırabilirsiniz."
        ]
      },
      {
        id: "negatif-uyari",
        heading: "Negatif yorum anında uyarı ve kurtarma",
        paragraphs: [
          "1-2 yıldızlık yorum geldiği an e-posta veya Slack bildirimi alırsınız. AI yorumun ana şikayetini çıkarır ('ürün hasarlı geldi', 'kargo gecikti') ve empati + çözüm içeren yanıt taslağı hazırlar.",
          "Hızlı ve profesyonel yanıt, potansiyel alıcılara 'bu satıcı sorunları çözüyor' mesajı verir. Ayrıca iade-talebi öncesi çözüm sunarak maliyetli iadelerin önüne geçebilirsiniz."
        ]
      },
      {
        id: "coklu-magaza",
        heading: "Çoklu mağaza ve ürün kategorisi yönetimi",
        paragraphs: [
          "Birden fazla Trendyol mağazası veya markası yönetiyorsanız tüm yorumlar tek dashboard'da birleşir. Mağaza bazlı puan, cevap oranı ve duygu trendi raporlanır.",
          "Elektronik mağazanızdaki 'kargo' şikayetleri ile kozmetik mağazanızdaki 'ambalaj' şikayetleri ayrı kategorize edilir, böylece operasyonel hataları kaynağında görürsünüz."
        ]
      }
    ],
    faqs: [
      {
        question: "Trendyol'a doğrudan API ile bağlanıyor musunuz?",
        answer: "Trendyol henüz satıcılar için açık yanıt API'si sunmuyor. VoyageRespond yorumları yarı-otomatik çeker, AI yanıtı hazırlar, siz Trendyol Satıcı Paneli'ne kopyalayıp yayınlarsınız. Bu yöntem tamamen güvenli ve Trendyol kurallarına uygundur."
      },
      {
        question: "Negatif yorumlara nasıl cevap vermeliyim?",
        answer: "AI, şikayetin türüne göre empati + somut çözüm içeren yanıtlar üretir. Örneğin 'ürün hasarlı' şikayetine 'özür dileriz, hemen yeni ürün gönderiyoruz' tonunda; 'kargo gecikti' şikayetine ise 'kargo partnerimizle görüştük, gecikme telafisi sağlayacağız' şeklinde profesyonel yanıtlar önerir."
      },
      {
        question: "Birden fazla Trendyol mağazamı bağlayabilir miyim?",
        answer: "Evet. Tek VoyageRespond hesabıyla sınırsız Trendyol mağazası takip edebilirsiniz. Her mağaza ayrı puan, ayrı cevap oranı ve karşılaştırmalı raporlarla görünür."
      },
      {
        question: "Yorum cevaplaması satıcı puanımı etkiler mi?",
        answer: "Evet, dolaylı olarak etkiler. Cevap veren mağazalar alıcı gözünde daha güvenilir algılanır, bu da dönüşüm oranını artırır. Ayrıca cevaplanmış yorum oranı, Trendyol'un listeleme algoritmasındaki 'mağaza kalite skoru'na olumlu yansır."
      }
    ],
    relatedSlugs: ["yemeksepeti-yorumlari-icin-yapay-zeka", "google-yorumlari-icin-yapay-zeka", "yorumlara-yapay-zeka-ile-cevap-yazma"]
  },
  {
    slug: "yemeksepeti-yorumlari-icin-yapay-zeka",
    platformName: "Yemeksepeti Yorumları",
    emoji: "🍔",
    badgeText: "Yemeksepeti · AI",
    metaTitle: "Yemeksepeti Yorumları için Yapay Zeka: Restoran Cevap & Yönetim",
    metaDescription: "Yemeksepeti sipariş ve restoran yorumlarına yapay zeka ile anında profesyonel cevap yazın. Negatif yorum uyarısı ve marka sesinde yanıtlar.",
    h1: "Yemeksepeti yorumlarına yapay zeka ile cevap: Restoran itibarınızı koruyun",
    intro: "Yemeksepeti, Türkiye'nin en büyük online yemek sipariş platformu. Restoranınızın puanı ve yorumları, sipariş hacminizi doğrudan belirler. Ancak her gün onlarca yoruma manuel cevap yazmak mutfak operasyonunun yanında imkansızlaşır. Yapay zeka, Yemeksepeti yorumlarınızı otomatik toplar, duygu analizi yapar ve saniyeler içinde marka sesinde yanıt önerir.",
    sections: [
      {
        id: "neden-onemli",
        heading: "Yemeksepeti yorumları restoran için neden hayati?",
        paragraphs: [
          "Yemeksepeti'nde 4.5 üzeri puanlı restoranlar, arama sonuçlarında üst sıralarda görünür ve sipariş hacmi ortalama %35 daha yüksektir. Yeni müşteri restoran seçerken ilk 10 yoruma ve satıcının verdiği yanıtlara bakar.",
          "Özellikle soğuk yemek, eksik sipariş veya kurye gecikmesi gibi konularda verilen profesyonel yanıt, potansiyel müşterinin 'bu restoran sorunu çözüyor' algısı yaratır."
        ]
      },
      {
        id: "yemeksepeti-eksikleri",
        heading: "Yemeksepeti İşletme Paneli'nin yetmediği noktalar",
        paragraphs: [
          "Yemeksepeti restoran paneli yorumları görüntülemeye ve basit cevap yazmaya izin verir, ancak akıllı yönetim araçları sunmaz."
        ],
        bullets: [
          "Yanıt şablonu ve marka sesi eğitimi yok; her cevabı manuel yazarsınız.",
          "Negatif yorum önceliklendirme yok: 'yemek soğuktu' şikayetiyle 'çok güzeldi' övgüsü aynı listede.",
          "Yorum duygu analizi yok; şikayetin şiddetini manuel anlamak gerekir.",
          "Birden fazla şube varsa her biri için ayrı panel açmak şart.",
          "Haftalık/aylık yorum trend raporu yok; operasyonel hataları kaynağında göremezsiniz."
        ]
      },
      {
        id: "ai-nasil-calisir",
        heading: "Yapay zeka ile Yemeksepeti yorum yönetimi nasıl çalışır?",
        paragraphs: [
          "VoyageRespond, Yemeksepeti restoran sayfanızı takip eder. Yeni yorum geldiğinde AI otomatik analiz eder: yemek kalitesi, kurye hızı, paketleme, servis gibi konuları etiketler ve duyguyu (pozitif/nötr/negatif) belirler.",
          "Restoranınızın marka tonuna uygun 3 farklı yanıt önerisi üretir. Örneğin fast-food markasıysanız kısa ve samimi; fine-dining ise daha resmi ve detaylı yanıtlar önerilir."
        ]
      },
      {
        id: "kriz-yonetimi",
        heading: "Soğuk yemek ve kurye gecikmesi gibi kriz anlarında yanıt",
        paragraphs: [
          "'Yemek soğuktu', '1 saatte geldi', 'eksik ürün vardı' gibi yorumlar restoran puanınızı düşüren en yaygın şikayetlerdir. AI bu tür yorumları otomatik algılar, özür ve somut telafi içeren yanıt taslağı hazırlar.",
          "Tek tıkla onayladığınız yanıt, potansiyel müşterilere 'bu restoran hatalarını telafi ediyor' mesajı verir ve tekrar sipariş olasılığını artırır."
        ]
      },
      {
        id: "coklu-subeler",
        heading: "Çoklu şube ve zincir restoran yönetimi",
        paragraphs: [
          "3 şubeniz mi var, 30 mu? Hepsinin Yemeksepeti yorumları tek dashboard'da birleşir. Şube bazlı puan, cevap oranı ve en sık şikayet konuları raporlanır.",
          "'Kadıköy şubesinde paketleme şikayetleri %50 arttı' gibi içgörülerle operasyonel hataları anında müdahale edebilirsiniz. Manuel Excel'e gerek kalmaz."
        ]
      }
    ],
    faqs: [
      {
        question: "Yemeksepeti'ne API ile doğrudan cevap gönderebilir misiniz?",
        answer: "Yemeksepeti henüz restoranlar için açık yanıt API'si sunmuyor. VoyageRespond yorumları yarı-otomatik takip eder, AI yanıtı hazırlar, siz Yemeksepeti İşletme Paneli'ne kopyalayıp yayınlarsınız. Bu yöntem tamamen güvenlidir."
      },
      {
        question: "Soğuk yemek ve kurye şikayetlerine nasıl cevap vermeliyim?",
        answer: "AI, şikayet türüne göre empati + telafi içeren yanıtlar üretir. Örneğin 'soğuk yemek' şikayetine 'özür dileriz, bir sonraki siparişinizde %20 indirim kodu gönderiyoruz' şeklinde; 'gecikme' şikayetine ise 'kurye yoğunluğundan dolayı gecikme yaşandı, telafi olarak ücretsiz içecek hediye ediyoruz' tonunda profesyonel yanıtlar önerir."
      },
      {
        question: "Birden fazla şubemi yönetebilir miyim?",
        answer: "Evet. Tüm Yemeksepeti şubeleriniz tek panelde birleşir. Her şube için ayrı puan, cevap oranı ve trend raporu görürsünüz."
      },
      {
        question: "Yorum cevaplaması sipariş hacmimi etkiler mi?",
        answer: "Kesinlikle. Cevap veren restoranlar müşteri gözünde daha güvenilir ve profesyonel algılanır. Özellikle negatif yorumlara verilen yapıcı yanıtlar, potansiyel müşterinin sipariş verme kararını olumlu etkiler."
      }
    ],
    relatedSlugs: ["trendyol-yorumlari-icin-yapay-zeka", "google-yorumlari-icin-yapay-zeka", "facebook-yorumlari-icin-yapay-zeka"]
  },
  {
    slug: "airbnb-yorumlari-icin-yapay-zeka",
    platformName: "Airbnb Yorumları",
    emoji: "🏠",
    badgeText: "Airbnb · AI",
    metaTitle: "Airbnb Yorumları için Yapay Zeka: Ev Sahibi Cevap & Yönetim",
    metaDescription: "Airbnb misafir yorumlarına yapay zeka ile profesyonel ev sahibi yanıtları yazın. Superhost puanınızı koruyun, negatif yorumları kurtarın.",
    h1: "Airbnb yorumlarına yapay zeka ile cevap: Superhost statünüzü koruyun",
    intro: "Airbnb'de ev sahibi yanıt oranı ve yorum kalitesi, Superhost statüsü ve arama sıralaması için kritik. Her misafir yorumuna kişisel, samimi ama profesyonel yanıt yazmak zaman alır. Yapay zeka, Airbnb yorumlarınızı tek panelden toplar, misafir deneyimini analiz eder ve ev sahibi tonunuzda anında yanıt önerir.",
    sections: [
      {
        id: "neden-onemli",
        heading: "Airbnb yorumları ev sahibi için neden kritik?",
        paragraphs: [
          "Airbnb algoritması, yanıtlanmış yorum oranı yüksek ve ortalama puanı 4.8+ olan ev sahiplerini arama sonuçlarında öne çıkarır. Superhost statüsü için %90 yanıt oranı şartı vardır.",
          "Potansiyel misafir, rezervasyon yapmadan önce son 10 yoruma ve ev sahibinin verdiği yanıtlara mutlaka bakar. Profesyonel yanıtlar = daha yüksek doluluk oranı."
        ]
      },
      {
        id: "airbnb-eksikleri",
        heading: "Airbnb'nin yerel araçlarının yetmediği noktalar",
        paragraphs: [
          "Airbnb ev sahibi paneli temel cevap özelliği sunar, ama yoğun ev sahipleri için yetersiz kalır."
        ],
        bullets: [
          "Yanıt şablonu ve AI desteği yok; her yoruma manuel, kişiselleştirilmiş yanıt yazmak gerekir.",
          "Çoklu mülk yönetiminde yorumlar ayrı ayrı listelenir; tek bir dashboard yok.",
          "Negatif yorum erken uyarısı yok; kritik şikayeti geç fark edebilirsiniz.",
          "Duygu analizi ve yorum kategorizasyonu yok; 'temizlik' şikayetiyle 'konum' övgüsü karışır.",
          "Yabancı dildeki yorumları çevirip yanıtlamak manuel ve zaman alıcıdır."
        ]
      },
      {
        id: "ai-nasil-calisir",
        heading: "Yapay zeka ile Airbnb yorum yönetimi nasıl çalışır?",
        paragraphs: [
          "VoyageRespond, Airbnb profil sayfanızı takip eder. Yeni misafir yorumu geldiğinde AI otomatik analiz eder: konaklama deneyimini konulara (temizlik, konum, iletişim, değer, ev sahibi) ayırır, duyguyu ve dili belirler.",
          "Ev sahibi tonunuzda (samimi ama profesyonel) 3 farklı yanıt önerisi üretir. Misafirin adı, konaklama tarihi ve övdüğü/eleştirdiği detaylar yanıta otomatik girer."
        ]
      },
      {
        id: "superhost",
        heading: "Superhost statüsünü korumak ve yükseltmek",
        paragraphs: [
          "Superhost olmak %90 yanıt oranı, 4.8+ ortalama puan ve %5'ten az iptal gerektirir. VoyageRespond ile tüm yorumlara zamanında ve kaliteli yanıt vererek bu kriterleri zorlanmadan karşılarsınız.",
          "Özellikle 3-4 yıldızlı 'orta' yorumlar, Superhost sınırında olan ev sahipleri için kritiktir. AI bu yorumlara empati ve somut iyileştirme taahhüdü içeren yanıtlar üreterek puanınızı korur."
        ]
      },
      {
        id: "cok-dilli",
        heading: "Çok dilli misafir yorumlarına yerel dilde yanıt",
        paragraphs: [
          "Airbnb'deki misafirleriniz İngilizce, Almanca, Fransızca, İspanyolca, Rusça veya Arapça yorum yazabilir. AI yorumun dilini otomatik tespit eder ve aynı dilde, ev sahibi tonunuzda yanıt önerir.",
          "Kültürel nüansları da dikkate alır: Alman misafire daha formal, Amerikan misafire daha samimi ton otomatik uygulanır."
        ]
      }
    ],
    faqs: [
      {
        question: "Airbnb'e API ile doğrudan cevap gönderebilir misiniz?",
        answer: "Airbnb henüz ev sahipleri için açık yanıt API'si sunmuyor. VoyageRespond yorumları takip eder, AI yanıtı hazırlar, siz Airbnb paneline kopyalayıp yayınlarsınız. Bu yöntem tamamen güvenli ve Airbnb kurallarına uygundur."
      },
      {
        question: "Superhost statümü korumak için tüm yorumlara cevap vermem mi gerek?",
        answer: "Airbnb Superhost kriterlerinde %90 yanıt oranı şartı vardır. VoyageRespond ile tüm yorumlara hızlı ve kaliteli yanıt vererek bu kriteri kolayca karşılarsınız."
      },
      {
        question: "Yabancı dildeki yorumlara nasıl cevap veriyorsunuz?",
        answer: "AI yorumun dilini otomatik tespit eder ve aynı dilde yanıt önerir. İngilizce, Almanca, Fransızca, İspanyolca, Rusça, Arapça dahil 15+ dil desteklenir."
      },
      {
        question: "Birden fazla mülkümü yönetebilir miyim?",
        answer: "Evet. Tüm Airbnb mülklerinizin yorumları tek panelde birleşir. Her mülk için ayrı puan, yanıt oranı ve misafir deneyimi raporu görürsünüz."
      }
    ],
    relatedSlugs: ["booking-yorumlari-icin-yapay-zeka", "tripadvisor-yorumlari-icin-yapay-zeka", "google-yorumlari-icin-yapay-zeka"]
  },
  {
    slug: "zomato-yorumlari-icin-yapay-zeka",
    platformName: "Zomato Yorumları",
    emoji: "🍽️",
    badgeText: "Zomato · AI",
    metaTitle: "Zomato Yorumları için Yapay Zeka: Restoran Cevap & Yönetim",
    metaDescription: "Zomato restoran yorumlarına yapay zeka ile marka uyumlu cevap yazın. Otomatik yanıtlar, duygu analizi ve global restoran itibar yönetimi.",
    h1: "Zomato yorumlarına yapay zeka ile cevap: Global restoran itibarınızı yönetin",
    intro: "Zomato, Hindistan, Birleşik Arap Emirlikleri, Avustralya ve daha birçok pazarda lider restoran keşif ve yorum platformu. Restoranınızın Zomato puanı ve yorumları, uluslararası misafirlerin rezervasyon kararını doğrudan etkiler. Yapay zeka destekli yorum yönetimi, Zomato yorumlarınızı tek panelden toplar, duygu analizi yapar ve marka sesinde anında yanıt önerir.",
    sections: [
      {
        id: "neden-onemli",
        heading: "Zomato yorumları restoran için neden kritik?",
        paragraphs: [
          "Zomato'da 4.0+ puanlı restoranlar arama sonuçlarında öne çıkar ve rezervasyon dönüşümü %40 daha yüksektir. Özellikle turistik bölgelerdeki restoranlar için Zomato, uluslararası misafirin ilk baktığı platformlardan biridir.",
          "Yönetici cevap oranı, Zomato'nun restoran sıralamasına olumlu yansır. Cevap vermeyen restoran potansiyel müşteriye 'ilgisiz' mesajı verir."
        ]
      },
      {
        id: "zomato-eksikleri",
        heading: "Zomato'nun yerel araçlarının yetmediği noktalar",
        paragraphs: [
          "Zomato restoran paneli yorumları görüntülemeye ve temel cevap yazmaya izin verir, ancak akıllı yönetim araçları sunmaz."
        ],
        bullets: [
          "Otomatik yanıt şablonu ve AI desteği yok; her cevabı manuel yazarsınız.",
          "Yorum önceliklendirme yok: 5 yıldızlı övgü ile 1 yıldızlı şikayet aynı listede.",
          "Çoklu şube veya zincir restoran yönetimi tek panelde birleşmez.",
          "Duygu analizi ve yorum kategorizasyonu yok; 'servis' şikayetiyle 'lezzet' övgüsü karışır.",
          "Çok dilli yorum desteği zayıf; uluslararası misafir yorumlarını manuel çevirmek gerekir."
        ]
      },
      {
        id: "ai-nasil-calisir",
        heading: "Yapay zeka ile Zomato yorum yönetimi nasıl çalışır?",
        paragraphs: [
          "VoyageRespond, Zomato restoran sayfanızı takip eder. Yeni yorum geldiğinde AI otomatik analiz eder: lezzet, servis, ambiyans, fiyat/performans, konum gibi konulara ayırır ve duyguyu (pozitif/nötr/negatif) belirler.",
          "Restoranınızın marka tonuna uygun 3 farklı yanıt önerisi üretir. Örneğin lüks restoran için formal ve detaylı; cafe için samimi ve kısa yanıtlar önerilir."
        ]
      },
      {
        id: "cok-dilli",
        heading: "Uluslararası misafir yorumlarına çok dilli yanıt",
        paragraphs: [
          "Zomato'daki yorumlar İngilizce, Hintçe, Arapça ve daha birçok dilde olabilir. AI yorumun dilini otomatik tespit eder ve aynı dilde, marka sesinizde yanıt önerir.",
          "Kültürel nüanslar da dikkate alınır: Hintli misafire teşekkür içeren, Arap misafire saygılı ve resmi ton otomatik uygulanır."
        ]
      },
      {
        id: "kriz-yonetimi",
        heading: "Negatif yorum kriz yönetimi ve itibar kurtarma",
        paragraphs: [
          "'Yemek çok tuzluydu', 'servis yavaştı', 'fiyat pahalıydı' gibi yorumlar restoran puanınızı düşürür. AI bu tür yorumları otomatik algılar, özür ve somut iyileştirme taahhüdü içeren yanıt taslağı hazırlar.",
          "Profesyonel ve zamanında verilen yanıt, potansiyel uluslararası misafire 'bu restoran geri bildirimi ciddiye alıyor' mesajı verir ve rezervasyon olasılığını artırır."
        ]
      }
    ],
    faqs: [
      {
        question: "Zomato'ya API ile doğrudan cevap gönderebilir misiniz?",
        answer: "Zomato henüz restoranlar için açık yanıt API'si sunmuyor. VoyageRespond yorumları takip eder, AI yanıtı hazırlar, siz Zomato paneline kopyalayıp yayınlarsınız. Bu yöntem tamamen güvenli ve Zomato kurallarına uygundur."
      },
      {
        question: "Zomato yanıtları hangi dillerde yazıyorsunuz?",
        answer: "AI yorumun dilini otomatik tespit eder ve aynı dilde yanıt önerir. İngilizce, Hintçe, Arapça, Türkçe dahil 15+ dil desteklenir."
      },
      {
        question: "Birden fazla restoranımı yönetebilir miyim?",
        answer: "Evet. Tüm Zomato restoranlarınızın yorumları tek panelde birleşir. Her restoran için ayrı puan, yanıt oranı ve trend raporu görürsünüz."
      },
      {
        question: "Zomato puanımı yapay zeka yanıtları yükseltir mi?",
        answer: "Dolaylı olarak evet. Cevap veren restoranlar misafir gözünde daha güvenilir ve profesyonel algılanır. Özellikle negatif yorumlara verilen yapıcı yanıtlar, potansiyel misafirin restoran seçimini olumlu etkiler."
      }
    ],
    relatedSlugs: ["tripadvisor-yorumlari-icin-yapay-zeka", "google-yorumlari-icin-yapay-zeka", "booking-yorumlari-icin-yapay-zeka"]
  }
];
function getPlatformLandingPage(slug) {
  return platformLandingPages.find((p) => p.slug === slug);
}
function getPlatformLandingSlugs() {
  return platformLandingPages.map((p) => p.slug);
}
const UPDATED$1 = "2026-12-05";
const AUTHOR$1 = "VoyageRespond Ekibi";
const restoranClusterPosts = [
  {
    slug: "olumsuz-google-yorumu-nasil-cevaplanir",
    title: "Olumsuz Google Yorumu Nasıl Cevaplanır? Adım Adım Rehber + 15 Örnek Şablon",
    metaTitle: "Olumsuz Google Yorumu Nasıl Cevaplanır? 15 Örnek",
    metaDescription: "Olumsuz Google yorumu nasıl cevaplanır? 5 adımlı çerçeve, 15 hazır şablon ve yapılması/yapılmaması gerekenler. Şimdi öğrenin →",
    description: "Olumsuz Google yorumlarına profesyonel cevap vermenin 5 adımlı çerçevesi, 15 gerçekçi örnek ve hazır şablonlarla adım adım rehber.",
    ogTitle: "Olumsuz Google Yorumu Nasıl Cevaplanır? | 15 Şablon",
    ogDescription: "5 adımlı çerçeve, 15 gerçek örnek ve hazır şablonlarla olumsuz yorumları fırsata çevirin.",
    author: AUTHOR$1,
    publishedAt: "2026-12-05",
    updatedAt: UPDATED$1,
    category: "Yorum Yönetimi",
    readTime: "11 dk",
    keywords: [
      "olumsuz google yorumu cevaplama",
      "kötü yorum nasıl cevaplanır",
      "negatif yorum yanıtı",
      "google kötü yorum cevap örneği"
    ],
    faqs: [
      {
        question: "Olumsuz Google yorumuna ne kadar süre içinde cevap vermeliyim?",
        answer: "Olumsuz yoruma ideal yanıt süresi 24 saattir. İlk 24 saatte verilen yanıtlar potansiyel müşterilerin %33'ünün kararını olumlu yönde değiştirir; 72 saati geçen yanıtlar ise etkisini büyük oranda kaybeder."
      },
      {
        question: "Haksız ya da yalan bir olumsuz yorumu silebilir miyim?",
        answer: "Google, yorumun topluluk kurallarını ihlal ettiğini (hakaret, sahtelik, ilgisiz içerik, çıkar çatışması) kanıtlayabilirseniz Google Business Profile üzerinden 'Uygunsuz olarak işaretle' ile şikayet edebilirsiniz. Ancak süreç ortalama 5-15 gün sürer ve her şikayet kabul edilmez; bu sırada da profesyonel bir yanıt yazmak en doğrusudur."
      },
      {
        question: "Olumsuz yoruma yanıt verirken müşterinin adını kullanmak şart mı?",
        answer: "Şart değil ama tavsiye edilir. İsmiyle hitap edilen yorumlar daha samimi algılanır. Yorum anonim bırakılmışsa 'Değerli misafirimiz' gibi sıcak ama nötr bir hitap kullanın."
      },
      {
        question: "Olumsuz yorumda işletmemin hatası yoksa ne yazmalıyım?",
        answer: "Hatayı kabul etmek zorunda değilsiniz, ancak müşterinin yaşadığı 'hissiyatı' kabul edebilirsiniz. 'Bu deneyim sizi üzdüğü için üzgünüz, durumu netleştirmek için size doğrudan ulaşmak isteriz' tarzı bir cümle, savunmacı olmadan müşteriyi ciddiye aldığınızı gösterir."
      },
      {
        question: "Yanıt sonrası olumsuz yorum güncellenir mi?",
        answer: "Müşteri offline çözüm sonrası yorumunu güncellemeyi tercih edebilir. Araştırmalar, profesyonel yanıt alan müşterilerin %33'ünün yorumlarını ya silip yeniden yazdığını ya da yıldız sayısını artırdığını gösteriyor."
      }
    ],
    content: `
Olumsuz Google yorumu nasıl cevaplanır? İşletmeniz için en büyük korku olan o 1 yıldızlı yorumun aslında nasıl bir fırsata dönüşebileceğini, hangi 5 adımlı çerçeveyi izlemeniz gerektiğini ve 15 farklı senaryo için hazır şablonları bu rehberde adım adım göreceksiniz.

Olumsuz yorumlar, çoğu işletme sahibinin sandığının aksine **rezervasyonların düşmanı değildir**. BrightLocal'in 2025 araştırmasına göre tüketicilerin **%88'i** olumsuz yorumlara profesyonel cevap veren işletmelere daha çok güveniyor. Sorun olumsuz yorumun kendisi değil — sessiz kalmak ya da defansif cevap yazmak.

## Neden Her Olumsuz Yoruma Cevap Vermek Şart?

- **Sıralama:** Google, yanıtlanmış yorumları profilinizin aktiflik sinyali olarak değerlendirir.
- **Sosyal kanıt:** Yorumu okuyan 100 potansiyel müşteri, müşterinin değil sizin cevabınıza bakar.
- **Müşteri geri dönüşü:** Profesyonel yanıt alan müşterilerin yaklaşık üçte biri yorumunu güncelliyor.
- **AI görünürlük:** ChatGPT, Gemini ve Perplexity gibi AI motorları işletme önerirken yanıt oranını kullanır.

## 5 Adımlı Olumsuz Yorum Yanıt Çerçevesi

Aşağıdaki sırayı bozmayın. Her adımın bir görevi var; sıra değişirse cevap yapay görünür.

### 1. Özür Dile (Hatayı kabul etmek zorunda değilsin)

Özür "biz hata yaptık" demek değildir. "Bu deneyim sizi üzdüğü için üzgünüz" demek bile yeterlidir. Müşterinin hissini kabul etmek, savunmaya geçmenin tam zıttıdır.

### 2. Teşekkür Et

Geri bildirim verdiği için teşekkür edin. Bu, savunmacı tonu kıran en güçlü tekniktir. "Bu geri bildirimi paylaşmaya zaman ayırdığınız için teşekkürler."

### 3. Sorumluluğu (kısmen) Kabul Et

Sorun gerçekse net bir şekilde kabul edin. Sorun belirsizse "yaşadığınız hissiyatı ciddiye alıyoruz" diyerek empati gösterin.

### 4. Offline'a Taşı

Tartışmayı halka açık yapmayın. "Detayları konuşmak için bize doğrudan iletisim@isletmem.com adresinden ulaşabilir misiniz?" gibi açık bir kanal sunun.

### 5. Somut Çözüm Sun

"Daha iyisini yapacağız" boş bir vaat. "Şefimizle yarın toplantı yapıp [konu] menüsünü revize edeceğiz" gibi somut bir aksiyon yazın.

> **Callout — VoyageRespond ipucu:** Bu 5 adımlı çerçeveyi AI'ya tek tek anlatmak yerine VoyageRespond paneli her yoruma marka tonunuza göre otomatik uygular. Manuel kalmak isterseniz şablonları kopyala-yapıştır kullanabilirsiniz.

## Yapılması ve Yapılmaması Gerekenler

| Yapılmalı | Yapılmamalı |
|-----------|-------------|
| 24 saat içinde cevap vermek | Duygusal, savunmacı yanıt yazmak |
| Müşterinin adını kullanmak | Yorumu tartışmaya çekmek |
| Somut çözüm önermek | "Sizi tanımıyoruz, başka yere gitmişsiniz" demek |
| Offline kanal sunmak | Müşterinin söylediklerini açıkça yalanlamak |
| Yorum sahibini sahiplenmek | Diğer müşterilerin memnuniyetiyle övünmek |
| Yanıtı kişiselleştirmek | 50 yoruma aynı kopya-yapıştır cevabı kullanmak |
| Kısa ve net olmak (3-5 cümle) | 200 kelimelik mazeret paragrafı yazmak |
| Marka tonunu korumak | Pasif-agresif emoji veya alaycılık kullanmak |

## 15 Gerçekçi Olumsuz Yorum + Yanıt Örneği

Her örnek bir senaryo + 1-2 cümlelik şablondan oluşur. Köşeli parantezleri kendi bilgilerinizle değiştirin.

### 1. Yemek soğuk geldi
> "Sayın Ahmet Bey, yemeğinizin soğuk ulaşması kesinlikle bizden beklenmemesi gereken bir durum, bunun için içtenlikle özür dileriz. Servis akışımızı şef yardımcımızla bugün tekrar gözden geçirdik. Bir sonraki ziyaretinizde sizi tekrar ağırlamak ve bu deneyimi telafi etmek için lütfen iletisim@restoranim.com adresinden bize ulaşın."

### 2. Garson kaba davrandı
> "Merhaba Selin Hanım, ekibimizden birinin sizi rahatsız etmesi içimizi acıttı; her misafire saygıyla yaklaşmak ilk değerimiz. Konuyu bugün ilgili arkadaşımızla birebir konuşacağız. Detayları paylaşmak için size doğrudan ulaşabilmemiz adına iletişim bilgilerinizi bırakırsanız çok memnun oluruz."

### 3. Beklenmedik fiyat / hesapta hata
> "Sayın Mert Bey, hesapta beklemediğiniz bir kalem görmek hiç hoş bir his değil, bu konuda size hak veriyoruz. Adisyonunuzu inceleyip varsa fazla tahsil edilen tutarı iade etmek istiyoruz. Lütfen tarih ve masa bilgisi ile bize muhasebe@restoranim.com adresinden yazın."

### 4. Hijyen şikayeti
> "Değerli misafirimiz, hijyen bizim için pazarlık dışı bir konu; yaşadığınız bu deneyim için çok üzgünüz. Aldığımız aksiyon: bugün tüm salonda ek temizlik denetimi başlattık ve haftalık denetim raporu yayınlayacağız. Sizi yeniden ağırlamak ve farkı göstermek için bizimle iletişime geçer misiniz?"

### 5. Beklenenden uzun bekleme
> "Merhaba Cem Bey, masa için bekleme süresinin uzaması heyecanınızı kırmış olmalı, anlıyoruz. Cumartesi akşamı için ek garson ve rezervasyon önceliği sistemine geçtik. Bir sonraki ziyaretinizde sizi rezervasyonla ağırlamak isteriz — info@restoranim.com."

### 6. Yemek lezzetsiz bulundu
> "Sayın Ayşe Hanım, sevdiğimiz bir tarif konusunda beklentinizi karşılayamamak bizim için üzücü bir geri bildirim. Mutfak ekibimizle tarif notlarınızı paylaşacağız. Sizi tekrar mutfağımızı denemeye davet ediyoruz, lütfen iletişime geçin."

### 7. Porsiyon küçük
> "Merhaba Burak Bey, porsiyon beklentinizi karşılamadıysa bunu duymak bizi üzer. Menümüzdeki ana yemeklerin gramajını şefimizle yeniden değerlendireceğiz. Bir sonraki ziyaretinizde size özel bir ikramda bulunmak isteriz."

### 8. Rezervasyon kaybedildi
> "Sayın Deniz Hanım, ayırdığınız zamana karşılık rezervasyonunuzun kaybolması kabul edilemez. Hostes ekibimizle dijital rezervasyon sürecimizi bugünden itibaren güncelledik. Sizi tekrar ağırlama şansı için iletişime geçer misiniz?"

### 9. Oda temizliği sorunu (otel)
> "Sayın Murat Bey, odanızı beklediğiniz standardın altında bulmanız bizim için kabul edilemez bir durum. Housekeeping ekibimizle bugün ek bir kontrol süreci başlattık. Sizi tekrar ağırlamak ve odanızı yükseltmek isteriz — rezervasyon@otelim.com."

### 10. Klima/ısıtma çalışmadı
> "Merhaba Selen Hanım, konfor bizim için temel söz; klimanın çalışmaması yaşanmaması gereken bir aksaklık. Teknik ekibimiz ilgili odadaki sistemi bugün revize etti. Bir sonraki konaklamanızda upgrade ile sizi karşılamak isteriz."

### 11. Resepsiyon yavaş
> "Sayın Kerem Bey, check-in sırasında bekletilmiş olmanız ilk izlenimi gölgeleyen bir aksaklık, özür dileriz. Yoğun saatlerde ek resepsiyon personeli planlamasına başladık. Sizi yeniden ağırlama şansı verirseniz hızlı check-in'i garanti ederiz."

### 12. Kahvaltı çeşidi az
> "Merhaba Aslı Hanım, kahvaltı bizim için günün en önemli öğünü; çeşit beklentinizi karşılayamadığımız için üzgünüz. F&B ekibimizle bu hafta menüye yerel ürünler ekleyeceğiz. Geri dönüşünüzü paylaşmak için bize ulaşır mısınız?"

### 13. Online sipariş yanlış geldi
> "Sayın Eren Bey, yanlış sipariş geldiği için özür dileriz; bu standartlarımızı yansıtmıyor. Sizi paket servis ekibimizle eşleştirip yeniden teslimat ya da iade konusunda yardımcı olalım: paket@restoranim.com."

### 14. Ücretli WiFi/ek ücret şikayeti
> "Değerli misafirimiz, beklenmedik bir ek ücretle karşılaşmak elbette can sıkar. Bu kalemi şeffaf bir şekilde rezervasyon sayfamızda öne çıkaracak şekilde güncelliyoruz. Tahsil edilen tutar için sizinle ayrıca iletişime geçmek isteriz."

### 15. Sadece "1 yıldız" yorum (metinsiz)
> "Merhaba, düşük puanınızı görmek bizi üzdü ve nedenini öğrenmek isteriz. Lütfen bize iletisim@isletmem.com adresinden ulaşır mısınız? Geri bildiriminiz bizi daha iyi yapacak."

## Yanıt Yazarken Sık Yapılan 5 Hata

1. **Savunmacı dil:** "Bizde böyle bir şey olmaz." → Müşteri ciddiye alınmadığını hisseder.
2. **Şablon his veren cevaplar:** Aynı 3 cümleyi her yoruma yapıştırmak.
3. **Suçu müşteriye atmak:** "Daha açık talimat vermeliydiniz." → SEO ve marka için zehir.
4. **Geç cevap:** 1 hafta sonraki yanıt, hiç yanıt yazmamış gibi algılanır.
5. **Müşteri adını kullanmamak:** Anonim "Merhaba" hitabı uzaklık yaratır.

## AI ile Bu Süreci Otomatikleştirmek

Manuel olarak 30 olumsuz yoruma haftada 4-5 saat ayırmak gerçekçi değil. [VoyageRespond](/) Google, Booking, TripAdvisor ve 80+ platformdaki yorumları tek panele toplar; her yoruma marka tonunuza göre öneri üretir, siz onaylayıp yayımlarsınız. Yanıt süreniz 24 saatten 24 dakikaya iner.

## İlgili Rehberler

- [Olumlu Restoran Yorumu Cevap Örnekleri: 30+ Hazır Şablon](/blog/olumlu-yorum-cevap-ornekleri)
- [Google Yorum Cevap Şablonları: 50 Hazır Yanıt](/blog/google-yorum-cevap-sablonlari)
- [Otel Yorum Cevaplama Rehberi](/blog/otel-yorum-cevaplama-rehberi)
- [Kötü Yorumlara Nasıl Cevap Verilir? 15 Altın Kural](/blog/kotu-yorumlara-nasil-cevap-verilir)
- [Restoran Yorum Cevapları (30 Şablon)](/restoran-yorum-cevaplari)
- [Fiyatlandırma](/pricing) — VoyageRespond planları

## Sonuç

Olumsuz yorum kötü haber değil, kazanılabilecek bir müşteri. 5 adımlı çerçeveye sadık kalın, 24 saat içinde cevap verin, somut çözüm sunun. Manuel kalmak istiyorsanız yukarıdaki 15 şablonu kopyala-yapıştır kullanabilirsiniz; ölçeklenmek istiyorsanız AI destekli bir sistem 80+ platformdaki cevap akışınızı tek noktadan halleder.

**[VoyageRespond ile 80+ platformdaki yorumları tek panelden yönetin →](/onboarding)**
    `
  },
  {
    slug: "olumlu-yorum-cevap-ornekleri",
    title: "Olumlu Restoran Yorumu Cevap Örnekleri: 30+ Hazır Şablon",
    metaTitle: "Olumlu Yorum Cevap Örnekleri: 30+ Hazır Şablon",
    metaDescription: "Olumlu yorum cevap örnekleri: 30+ kategoriye göre hazır teşekkür şablonu, kişiselleştirme formülü ve ton rehberi. Şimdi kullanın →",
    description: "Olumlu restoran yorumlarına nasıl cevap verilir? 30+ kategoriye göre hazır şablon, kişiselleştirme formülü ve doğru ton rehberi.",
    ogTitle: "Olumlu Yorum Cevap Örnekleri: 30+ Hazır Şablon",
    ogDescription: "Yemek, servis, atmosfer ve özel günler için 30+ olumlu yorum cevap şablonu — sadakat ve SEO için.",
    author: AUTHOR$1,
    publishedAt: "2026-12-05",
    updatedAt: UPDATED$1,
    category: "Yorum Yönetimi",
    readTime: "10 dk",
    keywords: [
      "olumlu yorum cevap örnekleri",
      "olumlu yorum cevap şablonları",
      "teşekkür mesajı şablonları",
      "restoran teşekkür mesajı"
    ],
    faqs: [
      {
        question: "Olumlu yoruma cevap vermek gerçekten gerekli mi?",
        answer: "Evet. Olumlu yoruma cevap vermek hem müşteri sadakatini güçlendirir hem de Google'ın yorum yanıt oranını sıralama sinyali olarak değerlendirmesi nedeniyle yerel SEO'nuza katkı sağlar. Yanıtlanan profillerin haritada daha üst sıralarda göründüğü pek çok yerel SEO çalışmasında raporlanmıştır."
      },
      {
        question: "Olumlu yoruma kaç cümleyle cevap vermeliyim?",
        answer: "2-4 cümle idealdir. Çok kısa yanıtlar 'kopyala-yapıştır' gibi durur; çok uzun yanıtlar samimiyetsiz olur. İlk cümlede teşekkür, ikincide yorumdan bir detay, üçüncüde davet/teklif iyi bir formüldür."
      },
      {
        question: "Aynı şablonu birden fazla yoruma kullanabilir miyim?",
        answer: "Aynı şablonu farklı yorumlarda kullanmak SEO ve müşteri algısı açısından sakıncalıdır. Çatıyı (giriş–detay–davet) koruyup en az bir cümleyi yorumdaki spesifik detaya göre özelleştirin."
      },
      {
        question: "Olumlu yorumlarda emoji kullanmalı mıyım?",
        answer: "Marka tonunuz samimi ve genç bir kitleye hitap ediyorsa evet; klasik / fine-dining bir marka iseniz emojiyi en fazla 1 ile sınırlayın. Hiçbir markada her cümle sonunda emoji olmamalı."
      },
      {
        question: "Olumlu yorum cevabını AI yazabilir mi?",
        answer: "Evet. VoyageRespond gibi araçlar yorumdan spesifik detayı çekip marka tonunuzla 5 saniyede taslak yanıt üretir. Siz yalnızca onaylayıp yayımlarsınız; bu sayede kopya-yapıştır izlenimi olmaz."
      }
    ],
    content: `
Olumlu yorum cevap örnekleri arıyorsanız doğru yerdesiniz. Bu rehberde 30+ kategoriye göre hazır şablon, hangi cümleyi nereye koyacağınızı anlatan kişiselleştirme formülü ve doğru ton rehberi var.

İşletmelerin büyük çoğunluğu olumsuz yorumlara cevap verir, ama olumlu yorumları "zaten beğenmiş" diye geçer. Bu büyük bir hata. Olumlu yorumlara cevap vermek hem **müşteri sadakatini** güçlendirir hem de Google'ın yanıt oranı sinyali sayesinde **yerel sıralamanızı** olumlu etkiler.

## Olumlu Yoruma Neden Cevap Vermelisiniz?

- **Sadakat:** Yanıt alan müşterilerin tekrar gelme oranı %25-30 artar.
- **SEO:** Yanıt oranı yüksek profiller Google Maps'te daha üst sırada görünür.
- **Sosyal kanıt:** Cevabınız, sizi inceleyen onlarca yeni müşteriye markanızın sesini gösterir.
- **AI görünürlük:** AI motorları işletme önerirken yanıt oranı ve ton kalitesini sinyal olarak kullanır.

## Kişiselleştirme Formülü (3-Adım)

Her olumlu yorum cevabı şu üç adımı içermeli:

1. **Spesifik teşekkür:** "Yorum için teşekkürler" değil — "Risottoyu beğendiğinizi okumak bizi mutlu etti".
2. **Markanın hikayesi:** O detayın neden önemli olduğunu kısa bir cümleyle anlatın ("Şefimiz Marco bu tarifi bizzat İtalya'dan getirdi").
3. **Davet veya öneri:** Bir sonraki ziyaret için somut bir teklif ("Bir dahaki sefere mutlaka mevsim tatlısı menümüze de bakın").

> **Callout — Kişiselleştirme ipucu:** Yorumdaki **bir kelimeyi** yanıtınızın başında kullanın. Müşterinin gözüne ilk çarpan bu olur, kopya hissini kırar.

## Doğru Ton ve Uzunluk

| Yorum tipi | İdeal uzunluk | Ton |
|------------|---------------|-----|
| Kısa "Harika!" tarzı | 1-2 cümle | Sıcak, kısa teşekkür |
| Detaylı 5 yıldız | 3-4 cümle | Spesifik, hikayeli |
| Özel gün (doğum günü, yıldönümü) | 3-5 cümle | Duygusal, davetkar |
| Sadık müşteri (ikinci ziyaret) | 2-3 cümle | Tanıdık, samimi |

## 30+ Olumlu Yorum Cevap Şablonu

### Yemek Övgüsü (1-6)

1. *(Genel yemek övgüsü)* "Sayın Ayşe Hanım, deneyiminizi paylaştığınız için çok teşekkür ederiz. Şefimiz Burak'a iltifatlarınızı ileteceğiz; bir sonraki ziyaretinizde sizi tatlı menümüzle de denemenizi öneririz."

2. *(Spesifik yemek)* "Merhaba Cem Bey, mantıyı beğendiğinize çok sevindik. El yapımı hamuru her gün sabah hazırlıyoruz, bu yüzden sizden gelen geri bildirim ayrı kıymetli."

3. *(Tatlı)* "Sevgili Selin Hanım, sufle ekibimizin en gurur duyduğu tariflerden. Bir sonraki ziyaretinizde tatlı tabağımızı denemenizi öneririz — ikramımız olsun."

4. *(Kahvaltı)* "Merhaba Deniz Bey, kahvaltı büfemizi beğendiğinize çok sevindik. Tüm ürünleri yerel üreticilerden tedarik ediyoruz; bir sonraki hafta sonu sizi de bekleriz."

5. *(Vegan/glütensiz menü)* "Sayın Eren Bey, alternatif menülerimizi beğenmeniz bizim için çok değerli — özel diyet menülerini şefimizle birlikte yeniliyoruz."

6. *(Şarap / içecek seçimi)* "Merhaba Aslı Hanım, şarap eşleştirmesi konusundaki yorumunuz somelyemiz Çağrı'yı çok mutlu etti. Yeni mevsim mahzenimizi denemeye sizi davet ediyoruz."

### Servis Övgüsü (7-12)

7. *(Garson adı verilmiş)* "Sayın Mert Bey, ekibimizden Ali'nin hizmetinden memnun kalmanız bizim için çok değerli. Geri bildiriminizi bugün kendisiyle birlikte gururla okuduk."

8. *(Hızlı servis)* "Merhaba Burak Bey, yoğun bir akşamda hızlı servisten memnun kalmanıza sevindik. Operasyon ekibimize iltifatınızı ileteceğiz."

9. *(Çocuklu aile)* "Sayın Ayşegül Hanım, ailecek vakit geçirmenizden memnun olmanız bizi mutlu etti. Çocuk menümüzü yenilemekle ilgili planlarımızı yakında paylaşacağız."

10. *(Özel istek karşılandı)* "Merhaba Sezen Hanım, özel isteğinizin doğru karşılanmış olması bizi mutlu etti. Her misafiri kendi ihtiyacıyla ağırlamak bizim için bir öncelik."

11. *(Resepsiyon — otel)* "Sayın Onur Bey, resepsiyon ekibimiz misafirperverliğini her zaman ön planda tutar. Yorumunuz ekibimize moral oldu."

12. *(Concierge önerisi)* "Sayın Ece Hanım, concierge ekibimizin tavsiyesinin işe yaramış olması harika; bir sonraki konaklamanızda farklı rota önerileriyle sizi şaşırtmak isteriz."

### Atmosfer / Mekan (13-18)

13. *(Dekorasyon)* "Merhaba Beril Hanım, mekan atmosferimizi beğenmeniz bizim için en güzel iltifat. Bahar dönemi için küçük dokunuşlar planlıyoruz — yakında tekrar bekleriz."

14. *(Manzara)* "Sayın Kerem Bey, terastaki gün batımı bizim de favorimiz. Bir dahaki ziyaretinizde rezervasyon notuna 'terasta' yazın, sizi en güzel köşeye yerleştirelim."

15. *(Müzik)* "Merhaba Selen Hanım, müzik seçkimiz ekibimizin haftalık emek verdiği bir konu. Spotify listemizi takip ederseniz mekanın havasını evinize taşıyabilirsiniz."

16. *(Temizlik)* "Sayın Aylin Hanım, hijyenle ilgili gözleminiz bizi gururlandırdı. Her gün başlangıç ve servis sonu denetimimiz, bu güvenin temelini oluşturuyor."

17. *(Sessiz / sakin)* "Merhaba Ahmet Bey, huzurlu bir akşam geçirmenizden memnun olduğunuzu duymak bizi mutlu etti — masa düzenimizi tam da bu his için tasarladık."

18. *(Konfor)* "Sayın Mehmet Bey, odadaki konforumuzu beğenmeniz bizim için en güzel ödül. Bir sonraki konaklamanızda upgrade'in olduğunu sizinle paylaşmaktan mutluluk duyarız."

### Özel Günler (19-24)

19. *(Doğum günü)* "Doğum gününüzü bizimle kutladığınız için çok teşekkür ederiz Selin Hanım. Bir sonraki kutlamanızda yine sizi ağırlamak için sabırsızlanıyoruz!"

20. *(Yıldönümü)* "Sayın Ömer Bey, yıldönümünüzü bizimle paylaştığınız için onur duyduk. Bir sonraki yıldönümünüz için sürpriz menü hazırlamak isteriz; rezervasyon notunu sizden bekliyoruz."

21. *(Evlilik teklifi)* "Bu özel anınızın bir parçası olabildiğimiz için kendimizi şanslı hissediyoruz. İlk yıldönümünüzde de bizi mutlaka anın — sürpriz bizden!"

22. *(Mezuniyet)* "Yeni başlangıcınız hayırlı olsun! Bir sonraki büyük gününüzde de masamızda sizi görmek isteriz."

23. *(İş yemeği)* "İş yemeğiniz için bizi tercih ettiğiniz için teşekkür ederiz. Toplantı menüsü ihtiyaçlarınız olursa kurumsal@isletmem.com bizim için açık."

24. *(Bayram / yılbaşı)* "Bayramı bizimle paylaşmanız bizim için çok kıymetli. Önümüzdeki sezon menülerinden ilk haberdar olmak için bültenimize abone olabilirsiniz."

### İlk Ziyaret & Sadık Müşteri (25-30+)

25. *(İlk ziyaret)* "Hoş geldiniz Selin Hanım! İlk ziyaretinizde bizi sevmenize çok sevindik — ikinci ziyaretinizde 'şefin önerisi' menüsünü denemenizi tavsiye ederiz."

26. *(İkinci kez gelen)* "Sayın Cem Bey, bizi tekrar tercih ettiğiniz için teşekkür ederiz. Sizin için her zaman ayrı bir masa hazır olacak."

27. *(Düzenli müşteri)* "Merhaba Ayşe Hanım, sizi sık görmek bizim için bir alışkanlık değil, mutluluk. Yeni mevsim menümüzü ilk siz tadın diye sabırsızlanıyoruz."

28. *(Tavsiye eden müşteri)* "Sayın Mert Bey, bizi yakınlarınıza önermeniz aldığımız en değerli iltifat. Bir sonraki ziyaretinizde tatlı bizim ikramımız."

29. *(Sosyal medyada paylaşan müşteri)* "Paylaşımınız için ayrıca teşekkürler! Etiketleyerek bize ulaştığınızda gelecek kampanyalardan haberdar etmekten mutluluk duyarız."

30. *(Uzaktan / şehir dışından gelen)* "Şehre özel gelmeniz bizi onurlandırdı. Bir sonraki gelişinizde size yakındaki ortak partnerimiz [otel adı] için indirim kuponumuz var, ileterek bize ulaşabilirsiniz."

31. *(5 yıldız ama yorumsuz)* "Merhaba Burak Bey, 5 yıldız puanınız için çok teşekkür ederiz. Bizi bir adım daha iyiye taşımamızı sağlayacak bir önerinizi merakla bekleriz."

## Sık Yapılan Hatalar

- **Kopya-yapıştır:** Aynı 2 cümleyi 100 yoruma yapıştırmak SEO için negatif sinyal.
- **Çok uzun yanıtlar:** 6+ cümle yanıt yapay görünür.
- **Sadece "Teşekkürler":** Hiç yanıt yazmamış kadar etkisiz.
- **Reklam yığmak:** Her yanıtta menü, kampanya, link, telefon dayatmak.

## AI ile Olumlu Yoruma Cevap

30 olumlu yoruma günde 1 saat ayırmak gerçekçi değil. [VoyageRespond](/) yorumdaki spesifik detayı çekip marka tonunuza göre 5 saniyede taslak yanıt üretir; siz onaylayıp yayımlarsınız. Bu sayede 30 yoruma 10 dakikada cevap verir, kişiselleştirmeyi kaybetmezsiniz.

## İlgili Rehberler

- [Olumsuz Google Yorumu Nasıl Cevaplanır?](/blog/olumsuz-google-yorumu-nasil-cevaplanir)
- [Google Yorum Cevap Şablonları: 50 Hazır Yanıt](/blog/google-yorum-cevap-sablonlari)
- [Otel Yorum Cevaplama Rehberi](/blog/otel-yorum-cevaplama-rehberi)
- [Restoran Yorum Cevapları (30 Şablon)](/restoran-yorum-cevaplari)
- [Fiyatlandırma](/pricing)

## Sonuç

Olumlu yorumlar müşterilerinizin size verdiği en saf hediyedir. 30+ şablonu çatı olarak kullanın, yorumdaki spesifik detayı her yanıtın ilk cümlesine ekleyin, ton ve uzunluğu yorum tipine göre ayarlayın.

**[VoyageRespond ile 80+ platformdaki yorumları tek panelden yönetin →](/onboarding)**
    `
  },
  {
    slug: "google-yorum-cevap-sablonlari",
    title: "Google Yorum Cevap Şablonları: 50 Hazır Yanıt (Kopyala-Yapıştır)",
    metaTitle: "Google Yorum Cevap Şablonları: 50 Hazır Yanıt",
    metaDescription: "Google yorum cevap şablonları: 5-1 yıldız ve sektöre göre 50 hazır yanıt. Otel, restoran, klinik, kuaför için kopyala-yapıştır. →",
    description: "5 yıldızdan 1 yıldıza, otel-restoran-klinik-kuaför için 50 Google yorum cevap şablonu. Her yanıt kişiselleştirme notu ile birlikte.",
    ogTitle: "Google Yorum Cevap Şablonları: 50 Hazır Yanıt",
    ogDescription: "Yıldıza ve sektöre göre 50 Google yorum cevap şablonu — kopyala, kişiselleştir, yayımla.",
    author: AUTHOR$1,
    publishedAt: "2026-12-05",
    updatedAt: UPDATED$1,
    category: "Şablon Kütüphanesi",
    readTime: "13 dk",
    keywords: [
      "google yorum cevap şablonları",
      "hazır yorum cevapları",
      "google yorum yanıtı şablon",
      "yıldıza göre yorum cevabı"
    ],
    faqs: [
      {
        question: "Şablonu olduğu gibi kullanmak SEO'ya zarar verir mi?",
        answer: "Aynı şablonu 20+ yoruma değiştirmeden yapıştırmak hem müşteri algısı hem de Google'ın 'gerçek etkileşim' sinyali açısından negatiftir. Şablonun çatısını koruyup en az bir cümleyi yorumdaki spesifik detaya göre özelleştirmeniz gerekir."
      },
      {
        question: "1 yıldız ama metinsiz yoruma nasıl cevap vermeli?",
        answer: "Empatik bir cümle ile başlayın ve sebebi öğrenmek için doğrudan iletişim kanalı bırakın. Bu hem müşteriye yaklaşır hem de Google'a sorumlu işletme sinyali verir. Şablon 41 numarada hazır metni bulabilirsiniz."
      },
      {
        question: "Müşteri yorumda yanlış bilgi vermişse düzeltebilir miyim?",
        answer: "Evet, ama nazikçe. 'Sizi anlıyoruz, sadece [detay] konusunda küçük bir yanlış anlaşılma olmuş olabilir, açıklığa kavuşturmak için bize doğrudan ulaşır mısınız?' tonu hem savunmacı durmaz hem de okuyan başkalarına doğru bilgiyi iletir."
      },
      {
        question: "Şablonu farklı sektörlere uyarlayabilir miyim?",
        answer: "Evet. Şablonların yapısı sektörden bağımsız çalışır; yalnızca ürün/hizmet kelimesini (oda yerine seans, masa yerine randevu vs.) değiştirin. Bu yazıda otel, restoran, klinik ve kuaför için özel uyarlamalar var."
      },
      {
        question: "Her yoruma cevap vermek zorunda mıyım?",
        answer: "Stratejik olarak en azından son 90 günün tüm yorumlarına ve geçmişteki tüm 1-3 yıldız yorumlara cevap vermek tavsiye edilir. Yüksek hacimli işletmelerde AI destekli bir araç (örn. VoyageRespond) bu süreci pratik hale getirir."
      }
    ],
    content: `
Google yorum cevap şablonları arıyorsanız bu yazı sizin için. 5 yıldızdan 1 yıldıza kadar her senaryoya, ayrıca otel, restoran, klinik ve kuaför sektörleri için sektöre özel uyarlamalar ile birlikte 50 hazır şablon hazırladık.

Aşağıdaki şablonların her biri kopyalanabilir, kişiselleştirilebilir ve hızlıca yayımlanabilir. Yine de şunu unutmayın: **çatı şablon, kalp kişiselleştirmedir**. Yorumdaki bir detayı yanıtınızın ilk cümlesine taşıdığınızda kopya hissi hemen kaybolur.

## Şablonları Kullanmadan Önce — Kişiselleştirme Mini Checklist

- [ ] Müşterinin adını kullandım mı?
- [ ] Yorumda geçen en az bir spesifik detayı yanıtıma taşıdım mı?
- [ ] Marka tonuma uygun mu (samimi/kurumsal)?
- [ ] CTA ya da davet eklediysem doğal mı, dayatma mı?
- [ ] Yanıt 5 cümleyi geçmiyor mu?

> **Callout — Şablon kullanım kuralı:** Aynı şablonu **6 ay içinde** ikinci kez kullanırken giriş cümlesini değiştirin. Google, aynı yanıtın tekrarını kalite sinyali olarak görmez.

## 5 Yıldız Yanıt Şablonları (1-10)

1. "Sayın [İsim], yorumunuz için çok teşekkür ederiz. Özellikle [detay] konusundaki memnuniyetiniz bizim için en güzel iltifat — sizi tekrar ağırlamayı dört gözle bekliyoruz."
2. "Merhaba [İsim], güzel yorumunuzu tüm ekiple birlikte okuduk ve mutlu olduk. Bir sonraki ziyaretinizde [öneri] denemenizi tavsiye ederiz."
3. "Sevgili [İsim], harika geri bildiriminiz için teşekkürler. Bu deneyimi her misafirimizle yaşatmak için her gün biraz daha iyi olmaya çalışıyoruz."
4. "[İsim] Bey/Hanım, yorumunuzdaki sıcaklık bizi gerçekten gülümsetti. Yakında sizi tekrar ağırlamak için sabırsızlanıyoruz!"
5. "Sayın [İsim], deneyiminizi paylaştığınız için teşekkür ederiz. Bir sonraki ziyaretinizde rezervasyon notuna bizim adımızı yazın, hoş bir sürpriz bekleyebilirsiniz."
6. "Merhaba [İsim], beklentilerinizi karşılayabilmiş olmak bizim için en büyük başarı. Geri bildiriminizi ekibimizle paylaştık — herkesin moralini yükselttiniz."
7. "[İsim] Hanım, yorumunuz için içtenlikle teşekkür ederiz. Sosyal medyada bizi takip ederseniz yeni menülerimizden ilk siz haberdar olabilirsiniz."
8. "Sayın [İsim], övgülü kelimeleriniz bizim için gerçek bir ödül. Bir sonraki ziyaretinizde [özel öneri] denemenizi tavsiye ederiz."
9. "Merhaba [İsim], misafirperverlik bizim en sevdiğimiz alanımız — bunu hissetmeniz bizi mutlu etti."
10. "[İsim] Bey, beş yıldız puanınız için çok teşekkürler. Sizin gibi misafirler için her gün biraz daha iyi olmaya çalışıyoruz."

## 4 Yıldız Yanıt Şablonları (11-20)

11. "Sayın [İsim], olumlu geri bildiriminiz için teşekkür ederiz. Eksik bulduğunuz [detay] konusunu değerlendiriyoruz; bir sonraki ziyaretinizde farkı göreceksiniz."
12. "Merhaba [İsim], puanınız ve detaylı yorumunuz için teşekkürler. Eksik yıldız için bizimle paylaşabileceğiniz spesifik bir nokta var mı? Sizi gerçekten dinlemek istiyoruz."
13. "[İsim] Hanım, geri bildiriminiz için minnettarız. Bahsettiğiniz [detay] konusunda iyileştirme planımız hazır — bir sonraki ziyaretinizde sizi şaşırtmak isteriz."
14. "Sayın [İsim], yorumunuz için teşekkürler. Bir adım daha iyi olabilmek için önerilerinizi bize iletisim@isletmem.com adresinden iletebilirsiniz."
15. "Merhaba [İsim], büyük çoğunluğu beğenmenize sevindik. Eksik kalan kısım için ekibimizle birlikte aksiyon planı çıkardık."
16. "[İsim] Bey, sizden gelen yapıcı eleştiriler bizi daha iyi yapıyor — teşekkür ederiz."
17. "Sayın [İsim], değerli yorumunuz için teşekkür ederiz. [Detay] konusundaki notunuzu departman yöneticimizle bugün paylaştık."
18. "Merhaba [İsim], deneyiminizin büyük kısmından memnun olmanız bizi mutlu etti. Eksik kalan noktayı tamamlamak için sizi tekrar ağırlamak isteriz."
19. "[İsim] Hanım, dengeli yorumunuz için teşekkür ederiz. Bir sonraki gelişinizde [öneri] denemenizi tavsiye ederiz."
20. "Sayın [İsim], detayları paylaştığınız için minnettarız — bu tür yorumlar bizi her seferinde bir adım daha ileri taşıyor."

## 3 Yıldız Yanıt Şablonları (21-30)

21. "Sayın [İsim], dürüst geri bildiriminiz için teşekkür ederiz. Beklentinizi karşılayamadığımız [detay] konusunu bugün ekibimizle değerlendirdik."
22. "Merhaba [İsim], yorumunuzu okuyup üzüldük. Sizi tekrar ağırlama şansı verir misiniz? Lütfen iletisim@isletmem.com üzerinden bize ulaşın."
23. "[İsim] Bey, ortalama bir deneyim yaşadığınız için üzgünüz. Daha iyisini hak ediyorsunuz — sizi telafi etmek isteriz."
24. "Sayın [İsim], paylaşımınız için teşekkürler. [Detay] konusunda bahsettiklerinizi ciddiye alıyoruz; bir sonraki ziyaretinizde farkı hissedeceksiniz."
25. "Merhaba [İsim], beklentinizin altında bir deneyim yaşamanız bizi üzdü. İletişim bilgilerinizi bize iletirseniz konuyu birlikte değerlendirelim."
26. "[İsim] Hanım, samimi geri bildiriminiz için teşekkür ederiz. Bahsettiğiniz noktaları ekibimizle bugün masaya yatırdık."
27. "Sayın [İsim], deneyiminizin tam puanlı olmaması bizim sorumluluğumuz. Sizi tekrar ağırlamak ve farkı göstermek isteriz."
28. "Merhaba [İsim], geri bildiriminiz için teşekkürler. Lütfen bize doğrudan ulaşarak detayları paylaşır mısınız?"
29. "[İsim] Bey, kısa süreli aksaklıklar yaşadığınız için üzgünüz. Bunlar standartlarımızı yansıtmıyor; sizi tekrar ağırlamak istiyoruz."
30. "Sayın [İsim], yorumunuz için teşekkürler — bu tür dürüst yorumlar bizi yarın daha iyi yapar."

## 2 Yıldız Yanıt Şablonları (31-40)

31. "Sayın [İsim], yaşadığınız deneyim için çok üzgünüz. Standartlarımızın altında kalmamız kabul edilemez; lütfen bize iletisim@isletmem.com adresinden ulaşır mısınız?"
32. "Merhaba [İsim], yorumunuzu okuduk ve içtenlikle üzgünüz. [Detay] konusunu bugün ilgili ekiple ele alacağız ve aksiyon planımızı sizinle paylaşmak isteriz."
33. "[İsim] Bey, beklediğiniz hizmeti sunamadığımız için özür dileriz. Sizi telafi etmek için doğrudan iletişime geçmemize izin verir misiniz?"
34. "Sayın [İsim], yaşadığınız aksaklıklar için içten özürlerimizi sunuyoruz. Bu deneyimin tekrar etmemesi için somut adımlar attık."
35. "Merhaba [İsim], yorumunuz bizim için bir uyandırma çağrısı. Sizi tekrar ağırlama şansı verirseniz farkı göstermek isteriz."
36. "[İsim] Hanım, bu deneyimin yaşanması bizi üzdü ve bunun için sorumluluğu kabul ediyoruz. Lütfen detaylar için bize ulaşın."
37. "Sayın [İsim], hayal kırıklığınızı anlıyoruz. İletişim bilgilerinizi bize iletirseniz konuyu çözmek için elimizden geleni yapacağız."
38. "Merhaba [İsim], geri bildiriminiz için teşekkürler. Bahsettiğiniz konuyu yönetim ekibimizle bugün masaya yatırdık."
39. "[İsim] Bey, deneyiminizin tatmin edici olmaması üzücü. Sizi bir kez daha ağırlamak ve farkı göstermek istiyoruz."
40. "Sayın [İsim], paylaşımınız için teşekkür ederiz. Bu tür yorumlar bize en çok şeyi öğretiyor — lütfen bize iletisim@isletmem.com üzerinden ulaşır mısınız?"

## 1 Yıldız Yanıt Şablonları (41-50)

41. *(Metinsiz)* "Merhaba, düşük puanınızı görmek bizi üzdü. Nedenini öğrenmek ve düzeltmek isteriz — lütfen iletisim@isletmem.com adresinden bize ulaşır mısınız?"
42. "Sayın [İsim], yorumunuz için teşekkürler. Yaşadığınız deneyim için çok üzgünüz; sizi telafi etmek istiyoruz, lütfen bize ulaşın."
43. "Merhaba [İsim], bu deneyimi yaşamış olmanız kabul edilemez. Sorunu kökünden çözmek için bugün ekibimizle aksiyon planı çıkardık."
44. "[İsim] Bey, içtenlikle özür dileriz. Yorumunuzu yönetim ekibimizle bugün gündem yaptık ve sizi telafi etmek istiyoruz."
45. "Sayın [İsim], yaşadığınız hayal kırıklığı için içtenlikle özür dileriz. Lütfen bizimle iletişime geçer misiniz?"
46. "Merhaba [İsim], bu deneyimin yaşanmaması gerekirdi. Sorumluluğu üstleniyoruz ve sizi tekrar ağırlamak için bir şans daha rica ediyoruz."
47. "[İsim] Hanım, paylaşımınız için teşekkür ederiz. Yorumunuzu birebir okudum ve [detay] konusunda hemen aksiyon aldık."
48. "Sayın [İsim], yorumunuz bize ders niteliğinde. Sizi telafi etmek için lütfen iletisim@isletmem.com adresinden bize ulaşır mısınız?"
49. "Merhaba [İsim], yaşadığınız aksaklıkları içtenlikle dinlemek isteriz. Lütfen bize doğrudan ulaşır mısınız?"
50. "[İsim] Bey, deneyiminizden duyduğumuz üzüntü kelimelerle anlatılamaz. Sizi telafi etmek için elimizden gelen her şeyi yapmaya hazırız — lütfen bize ulaşın."

## Sektöre Göre Uyarlamalar

### Otel
"Oda" / "konaklama" / "check-in" / "housekeeping" kelimelerini şablonlarınıza ekleyin. Telafi olarak **upgrade** veya **late check-out** önerin.

### Restoran
"Yemek" / "masa" / "rezervasyon" / "şef" kelimelerini kullanın. Telafi olarak **şefin özel tatlısı** ya da **bir sonraki rezervasyonda öncelik** önerin.

### Klinik / Estetik
Hassas bir alan; **mahremiyete** vurgu yapın. Telafi olarak **ücretsiz kontrol seansı** veya **uzman görüşmesi** önerin. Sağlıkla ilgili iddialardan kaçının.

### Kuaför / Güzellik Salonu
"Randevu" / "uygulama" / "ürün" kelimelerini ekleyin. Telafi olarak **ücretsiz bakım** ya da **ürün hediyesi** önerin.

## Karşılaştırma — Manuel mi, AI mı?

| Kriter | Manuel Şablon | AI Destekli (VoyageRespond) |
|--------|---------------|------------------------------|
| Hız (50 yorum) | 4-5 saat | 20-30 dakika |
| Kişiselleştirme | El emeği | Yorumdan otomatik detay çekme |
| Marka tonu tutarlılığı | Kişiye bağlı | Sistemde tanımlı, tutarlı |
| Çok dilli yanıt | Çevirmen gerekli | TR / EN / RU / DE otomatik |
| Çok platform | Tek tek panellere giriş | Tek panel, 80+ platform |

## İlgili Rehberler

- [Olumsuz Google Yorumu Nasıl Cevaplanır?](/blog/olumsuz-google-yorumu-nasil-cevaplanir)
- [Olumlu Restoran Yorumu Cevap Örnekleri](/blog/olumlu-yorum-cevap-ornekleri)
- [Otel Yorum Cevaplama Rehberi](/blog/otel-yorum-cevaplama-rehberi)
- [AI ile Yorum Cevaplama: ChatGPT vs Özel Araçlar](/blog/ai-ile-yorum-cevaplama)
- [Fiyatlandırma](/pricing)

## Sonuç

50 şablon hazırda; ama gerçek farkı yaratan kişiselleştirmedir. Çatıyı koruyup detayı yorumdan alın, tonu sektörünüze göre ayarlayın, 24 saat içinde yanıtlayın. Hacim büyüyorsa AI destekli bir sistem zorunluluktur.

**[VoyageRespond ile 80+ platformdaki yorumları tek panelden yönetin →](/onboarding)**
    `
  },
  {
    slug: "otel-yorum-cevaplama-rehberi",
    title: "Otel Yorum Cevaplama Rehberi: Booking, TripAdvisor & Google için Örnekler",
    metaTitle: "Otel Yorum Cevaplama Rehberi: Booking, TripAdvisor, Google",
    metaDescription: "Otel yorum cevaplama: Booking, TripAdvisor ve Google için platform farklılıkları, oda-personel-F&B şikayet örnekleri ve OTA stratejisi. →",
    description: "Otel yorumlarını Booking, TripAdvisor ve Google'da cevaplama rehberi. Oda, temizlik, personel ve F&B şikayetleri için örnekler, OTA özel stratejisi.",
    ogTitle: "Otel Yorum Cevaplama Rehberi: Booking, TripAdvisor, Google",
    ogDescription: "Otel yorumlarının diğer sektörlerden farkı, platform mekaniği ve şikayet kategorilerine göre örnek yanıtlar.",
    author: AUTHOR$1,
    publishedAt: "2026-12-05",
    updatedAt: UPDATED$1,
    category: "Otel Yönetimi",
    readTime: "14 dk",
    keywords: [
      "otel yorum cevaplama",
      "booking yorum cevap",
      "tripadvisor yanıt",
      "otel yorum yönetimi"
    ],
    faqs: [
      {
        question: "Booking ve TripAdvisor yorumlarına yanıtım Google'a etki eder mi?",
        answer: "Doğrudan SEO etkisi sınırlıdır, ama dolaylı olarak büyüktür. Booking ve TripAdvisor'daki ortalama puanınız 'brand SERP' (markanız aratıldığında çıkan sonuçlar) görselinde Google'a yansır ve seçim kararını etkiler. Yorum yanıt oranı yüksek otellerin çoğu, Google Maps sıralamasında da üst sıradadır."
      },
      {
        question: "Booking yorumlarına kaç dilde cevap vermeliyim?",
        answer: "Yorumun yazıldığı dilde cevap vermek altın kuraldır. Booking'in çevirmen aracı tüm yorumları İngilizce'ye çevirse de yanıtınızı misafirin diliyle yazdığınızda hem 'kişisel ilgi' algısı oluşur hem de aynı dilden konuşan diğer potansiyel misafirler için sosyal kanıt oluşur."
      },
      {
        question: "TripAdvisor'da olumsuz yoruma savunma yapabilir miyim?",
        answer: "TripAdvisor topluluğu savunmacı tonu sevmez; oradaki algoritma 'profesyonel yanıt' veren mülkleri öne çıkarır. Yanlış bilgi varsa olguları nazikçe netleştirin; 'siz haksızsınız' tonundan kaçının."
      },
      {
        question: "Olumsuz Booking yorumunun yıldız puanı değişir mi yanıt sonrası?",
        answer: "Booking'de yıldız puanı misafir tarafından sonradan değiştirilemez ama sorun çözüldüğünde 'review removal' (yorum kaldırma) talebinde bulunulabilir. Bu sadece topluluk kurallarını ihlal eden yorumlarda işe yarar; profesyonel bir yanıt yine de zorunludur."
      },
      {
        question: "Otel yorumlarına AI ile cevap vermek profesyonel kalır mı?",
        answer: "Doğru aracı kullanırsanız evet. VoyageRespond gibi platformlar yorumdan spesifik detayı çekip otelinizin marka tonuyla taslak yanıt üretir; revenue manager ya da otel müdürü onaylar. Bu sayede misafir kopya hissi almaz, ekip 4-5 saat yerine 30 dakikada işi bitirir."
      }
    ],
    content: `
Otel yorum cevaplama, restoran ya da perakende sektöründen tamamen farklı bir disiplindir. Bir otelde misafir 1-7 gün konaklıyor, **çok dokunmatik bir hizmet** alıyor (resepsiyon, housekeeping, F&B, concierge) ve rezervasyon kararını **Booking, TripAdvisor ve Google'daki ortalama puanınıza** bakarak veriyor. Bu rehber Türkiye'deki oteller için üç ana platformda doğru cevap mekaniğini, oda-personel-F&B kategorilerinde örnekleri ve OTA özel stratejisini ele alıyor.

## Otel Yorumları Diğer Sektörlerden Neden Farklı?

- **Yüksek tutar:** Bir konaklama kararı 5.000-50.000 TL arası bir harcamadır; misafir çok daha dikkatli okur.
- **Çok temas noktası:** Bir konaklama 8-12 farklı hizmet etkileşimi içerir; eleştiriler genelde spesifik bir noktayı işaret eder.
- **Uluslararası kitle:** TR / EN / RU / DE yorumların hepsine kendi dilinde cevap vermek gerekir.
- **Çok platform paralel:** Aynı misafir hem Booking hem TripAdvisor hem Google'a yorum bırakabilir.
- **Sezonsallık:** Yaz aylarında yorum hacmi 5-10 katına çıkar; manuel yanıt akışı çöker.

## Platform Karşılaştırması — Yanıt Mekaniği

| Özellik | Google | Booking.com | TripAdvisor |
|---------|--------|-------------|-------------|
| Yanıt aracı | Google Business Profile | Extranet → Misafir yorumları | TripAdvisor Yönetim Merkezi |
| Yanıt için ekstra ücret | Yok | Yok | Yok |
| Yanıt karakter limiti | 4.000 | 1.000 | 4.000 |
| Düzenleme | Sınırsız | Yayımlandıktan sonra mümkün | Sınırlı |
| AI yanıt entegrasyonu | API + araçlar | API + araçlar | API + araçlar |
| Sıralamaya etkisi | Yüksek (yerel SEO) | Yüksek (Genius / Preferred Partner) | Orta-yüksek (Traveler's Choice) |

## Google Yorumlarında Otel Yanıt Pratikleri

- **Anahtar kelime doğal ekleyin:** Misafir "İstanbul Boğaz manzaralı otel" diye yazdıysa yanıtınızda da bu kalıp doğal geçsin.
- **Fotoğraflı yanıt mümkün değil:** Google'da yanıt sadece metindir; ama profilinize düzenli fotoğraf yüklemek yanıt etkisini artırır.
- **Çoklu lokasyon:** Zincir otelseniz her şube için ayrı GBP profili açın ve her birine ayrı yanıt verin.

## Booking.com Yorum Yanıtı için Önemli Notlar

- **Genius & Preferred Partner skoru:** Yanıt oranınız >%80 olduğunda Booking sizi öne çıkarır.
- **"Geleceğim" notları:** Misafirin "geleceğim" / "tavsiye ederim" gibi cümleleri yanıt fırsatı; tekrar gelene **upgrade** vaadi verin.
- **Olumsuz yorumda public/private kararı:** Booking'de bazı detayları özel mesajda çözmek için "kamuya açık yanıt + özel mesaj" kombinasyonu kullanın.

## TripAdvisor Yanıt Pratikleri

- **Traveler's Choice:** Yıllık 5+ olumlu yorum + yüksek yanıt oranı, rozeti getirir; rozetli oteller %20+ daha fazla rezervasyon alır.
- **Uluslararası odak:** %60+ misafiri yabancıdır; çok dilli yanıt zorunludur.
- **Yöneticisi adıyla imzalı yanıt:** TripAdvisor algoritması, isim ve unvanla imzalanmış yanıtları öne çıkarır ("Caner Demir, Genel Müdür").

> **Callout — Multi-platform stratejisi:** Aynı misafir 3 platforma birden yorum yazabilir. VoyageRespond bu yorumları tek satırda eşleştirir ve **aynı tonla, 3 platforma birden** yanıt verir.

## Şikayet Kategorisine Göre Örnek Yanıtlar

### Oda Sorunları

**Yatak / yastık konforu**
> "Sayın Mehmet Bey, yatak konforu otel deneyiminin temeli; beklentinizi karşılayamamak bizim için kabul edilemez. Tüm odalarda iki farklı sertlik seviyesinde yastık opsiyonu ekledik. Bir sonraki konaklamanızda upgrade ile sizi ağırlamak isteriz."

**Gürültü şikayeti**
> "Sayın Selin Hanım, gürültüden dolayı dinlenememeniz bizi üzdü. Önümüzdeki haftadan itibaren cadde tarafındaki odalarda ek ses yalıtımı çalışmasına başlıyoruz. Sizi tekrar ağırlamak isteriz."

**Klima / ısıtma**
> "Sayın Onur Bey, klimanın çalışmaması yaşanmaması gereken bir teknik aksaklık. Teknik ekibimiz bugün ilgili odadaki sistemi yeniledi. Telafi için size doğrudan ulaşmak isteriz, rezervasyon notunuza dönüş yapacağız."

### Temizlik Şikayetleri

**Banyo temizliği**
> "Sayın Ayşe Hanım, banyo temizliğindeki eksiklik standartlarımızın tamamen altında. Housekeeping ekibimizle bugün ek kontrol süreci başlattık ve günlük denetim raporu yayımlamaya başlıyoruz. Sizi tekrar ağırlamak için lütfen bize doğrudan ulaşır mısınız?"

**Çarşaf / havlu**
> "Merhaba Cem Bey, çarşaf değişimindeki bu aksaklık için içtenlikle özür dileriz. Çamaşırhane sürecimizi yeniledik ve denetim sıklığını artırdık. Bir sonraki konaklamanızda farkı göreceksiniz."

### Personel Şikayetleri

**Resepsiyon davranışı**
> "Sayın Deniz Bey, check-in deneyiminizin standartlarımızın altında olması bizim için ciddi bir geri bildirim. İlgili ekip arkadaşımızla bugün birebir görüşme yapıyoruz ve servis eğitimi planlamamıza eklendi. Sizi tekrar ağırlamak isteriz."

**Housekeeping davranışı**
> "Sayın Selin Hanım, housekeeping ekibimizin davranışından memnun kalmamanız bizi üzdü. Konuyu shift yöneticisiyle bugün ele aldık. Misafirperverlik en temel değerimiz, bu deneyim için içtenlikle özür dileriz."

**Concierge yetersizliği**
> "Sayın Murat Bey, concierge'in beklentinizi karşılayamaması bizi üzdü. Ekibimizi şehir hakkında daha detaylı eğitim modülüne aldık. Bir sonraki konaklamanızda özel rota önerisiyle sizi şaşırtmak isteriz."

### F&B (Yemek-İçecek) Şikayetleri

**Kahvaltı**
> "Merhaba Beril Hanım, kahvaltı bizim için günün en önemli öğünü. Çeşit beklentinizi karşılayamadığımız için üzgünüz; F&B ekibimizle bu hafta menüye yerel ürünler ve sıcak alternatifler ekledik. Bir sonraki konaklamanızda tekrar deneyimlemenizi rica ederiz."

**Restoran**
> "Sayın Kerem Bey, restoranımızda yaşadığınız deneyim için özür dileriz. Şefimizle yorumunuzu birebir paylaştık ve servis akışını yeniledik. Bir sonraki ziyaretinizde size özel bir menü hazırlamak isteriz."

**Mini bar / room service**
> "Sayın Aylin Hanım, room service'in gecikmesi konfor beklentinizi gölgeleyen bir aksaklık. Mutfak akışımızı revize ettik ve sipariş sonrası teslim süresine hedef koyduk. Telafi için size özel bir teklif sunmak isteriz."

### OTA / Booking'e Özel Şikayetler

**"Sitede yazandan farklı bulunan oda"**
> "Sayın Ömer Bey, oda tipinin beklediğinizden farklı olması kabul edilemez bir durum. Booking listing'imizdeki fotoğraf ve açıklamaları bu hafta güncelliyoruz. Telafi olarak bir sonraki konaklamanızda upgrade etmek isteriz; lütfen bize doğrudan ulaşır mısınız?"

**"Online ödeme sorunları"**
> "Sayın Burak Bey, ödeme sürecindeki bu aksaklık için özür dileriz. Booking destek ekibiyle birlikte konuyu çözmek için sizinle iletişime geçeceğiz. Lütfen rezervasyon numaranızı rezervasyon@otelim.com adresine iletin."

## Olumsuz OTA Yorumlarında Dikkat Edilecekler

1. **Asla "yorum sahibi haksız" demeyin.** Sosyal kanıt zincirini koparır.
2. **Misafirin ismini ve rezervasyon numarasını paylaşmayın.** GDPR / KVKK ihlali olur.
3. **Telafiyi public alanda kesin tutarla yazmayın** ("size %50 indirim yapalım" gibi).
4. **Operasyonel detayları açıklamayın.** "Çarşaf değişim protokolümüz şudur" demek savunmacı durur.
5. **Yanıtı genel müdür adıyla imzalayın.** TripAdvisor ve Booking'de güven artırıcı.

## Otel için Yanıt Akışı: Önerilen Süreç

1. **Sabah 09:00:** Tüm platformlardan gelen yorumların triage'ı (öncelik: olumsuz + 1-2 yıldız).
2. **09:30-11:00:** Olumsuz yorumlara taslak yanıt, ilgili departmanla iç check.
3. **11:00-12:00:** Yanıtların yayını + olumlu yorumlara hızlı yanıt.
4. **Haftalık:** Yanıt oranı raporu (>%80 hedef), kategori bazlı şikayet analizi.

Bu süreci manuel yapmak 4-5 kişilik ekibin 1.5-2 saatini alır. AI destekli platform kullanırsanız aynı işi 1 kişi 30 dakikada bitirebilir.

## Manuel vs AI Karşılaştırması

| Kriter | Manuel | AI Destekli (VoyageRespond) |
|--------|--------|------------------------------|
| Günlük zaman (yoğun sezon) | 2-3 saat | 30 dk |
| Çok dilli yanıt | Çevirmen gerekli | TR/EN/RU/DE otomatik |
| Platform sayısı | Tek tek extranet | 80+ platform tek panel |
| Tonun tutarlılığı | Kişiye bağlı değişir | Sistemde tanımlı, tutarlı |
| Yanıt oranı (%80+) | Zorlukla yakalanır | Standart olarak korunur |

## İlgili Rehberler

- [Olumsuz Google Yorumu Nasıl Cevaplanır?](/blog/olumsuz-google-yorumu-nasil-cevaplanir)
- [Olumlu Yorum Cevap Örnekleri](/blog/olumlu-yorum-cevap-ornekleri)
- [Google Yorum Cevap Şablonları: 50 Hazır Yanıt](/blog/google-yorum-cevap-sablonlari)
- [AI ile Yorum Cevaplama: ChatGPT vs Özel Araçlar](/blog/ai-ile-yorum-cevaplama)
- [Otel Yorum Yönetimi Rehberi](/blog/otel-yorum-yonetimi-rehberi)
- [Booking Yorumları için Yapay Zeka](/platform/booking-yorumlari-icin-yapay-zeka)
- [Fiyatlandırma](/pricing)

## Sonuç

Otel yorum cevaplama, üç platformda paralel akan **çok dilli, çok kanallı bir disiplin**. Doğru yanıt mekaniği ile sezonsal hacmin altında kalmazsınız; AI destekli bir sistem ise bu işi ekipinizden bir kişinin 30 dakikalık günlük rutinine indirir.

**[VoyageRespond ile 80+ platformdaki yorumları tek panelden yönetin →](/onboarding)**
    `
  },
  {
    slug: "ai-ile-yorum-cevaplama",
    title: "AI ile Yorum Cevaplama: ChatGPT vs Özel Araçlar (2026 Karşılaştırma)",
    metaTitle: "AI ile Yorum Cevaplama: ChatGPT vs Özel Araçlar 2026",
    metaDescription: "AI ile yorum cevaplama: ChatGPT/Gemini limitleri, özel araç karşılaştırması (VoyageRespond, MARA, ReviewPro), ROI hesabı. 2026 rehberi →",
    description: "AI ile yorum cevaplama 2026 rehberi: ChatGPT/Gemini'nin işletme için limitleri, özel araç karşılaştırması, ROI hesabı ve VoyageRespond'un 80+ platform avantajı.",
    ogTitle: "AI ile Yorum Cevaplama: ChatGPT vs Özel Araçlar (2026)",
    ogDescription: "ChatGPT'nin limitleri, özel araç karşılaştırması ve gerçek ROI hesabıyla 2026 rehberi.",
    author: AUTHOR$1,
    publishedAt: "2026-12-05",
    updatedAt: UPDATED$1,
    category: "AI Görünürlük",
    readTime: "11 dk",
    keywords: [
      "ai yorum cevap",
      "otomatik yorum yanıtlama",
      "yapay zeka yorum cevaplama",
      "chatgpt yorum cevap"
    ],
    faqs: [
      {
        question: "ChatGPT ile yorum cevabı yazmak neden yeterli değil?",
        answer: "ChatGPT tekil yanıt üretmekte iyidir ama multi-platform entegrasyonu (Google, Booking, TripAdvisor), marka tonu hafızası, çok lokasyon yönetimi ve onay-otomasyon akışı içermez. 50 yoruma her sabah tek tek ChatGPT'ye prompt yazmak ölçeklenemez."
      },
      {
        question: "AI yanıtlar müşteri tarafından fark edilir mi?",
        answer: "Yorumdan spesifik detayı (yemek adı, oda numarası, çalışan ismi) yanıtın içine taşıyan iyi bir AI yanıtı insandan ayırt edilemez. Sorun AI değil, kötü prompt'tur. Özel araçlar bu detayları otomatik çıkarır."
      },
      {
        question: "VoyageRespond, MARA ve ReviewPro arasındaki temel fark nedir?",
        answer: "MARA ve ReviewPro otelcilik odaklı kurumsal araçlardır ve fiyatlandırma yüksektir. VoyageRespond hem otel hem restoran hem çoklu sektörü destekler, 80+ platforma uzanır, Türkçe-İngilizce-Rusça-Almanca yanıt üretir ve KOBİ-friendly bir fiyat planına sahiptir."
      },
      {
        question: "AI yanıtlama tamamen otomatik olur mu yoksa onay gerekir mi?",
        answer: "İki mod da mümkündür. Çoğu marka 4-5 yıldız yorumlarda 'otomatik gönder', 1-3 yıldız yorumlarda 'önce onayla' modunu tercih eder. VoyageRespond bu kuralı yıldız sayısına ve duygu analizine göre tanımlamanıza izin verir."
      },
      {
        question: "AI ile yorum cevabı yazmak SEO'ya zarar verir mi?",
        answer: "Hayır, tam tersine yardımcı olur. SEO'ya zarar veren şey 'kopya-yapıştır şablon yanıtlar' ya da 'hiç yanıt vermemek'. AI ile her yoruma 24 saat içinde kişiselleştirilmiş yanıt vermek hem yanıt oranınızı %80+'a taşır hem de Google'ın 'aktif işletme' sinyalini güçlendirir."
      }
    ],
    content: `
AI ile yorum cevaplama 2026 yılında işletmeler için artık opsiyonel değil. Bu rehberde önce neden gerekli olduğunu, sonra ChatGPT ve Gemini gibi genel araçların **gerçek limitlerini**, ardından özel araç karşılaştırmasını (VoyageRespond, MARA, ReviewPro) ve son olarak ROI hesabını ele alacağız.

## AI ile Yorum Yanıtlama Neden Artık Standart?

- **Yorum hacmi büyüyor:** Google + Booking + TripAdvisor + Instagram + TikTok... ortalama bir otel artık ayda 80-120 yorum alıyor.
- **24 saat yanıt baskısı:** Müşteriler 24 saat içinde yanıt bekliyor; manuel ekip akşam mesai sonrasını yetiştiremiyor.
- **Çok dilli zorunluluk:** Aynı misafir profili TR / EN / RU / DE arası salınabiliyor.
- **AI görünürlük:** ChatGPT, Gemini ve Perplexity gibi motorlar işletme önerirken yanıt oranı ve ton kalitesini sinyal olarak kullanıyor.
- **Ekip maliyeti:** Bir yorum koordinatörünün aylık maliyeti AI araçlarının yıllık maliyetinden yüksek.

## ChatGPT / Gemini ile Yorum Cevabı Yazmanın Limitleri

ChatGPT veya Gemini'yi açıp "şu yoruma cevap yaz" diye prompt yazmak kısa vadede işe yarar, ama bir sistem değildir. Gerçek limitler:

### 1. Multi-platform entegrasyonu yok
ChatGPT, Google Business Profile'a, Booking Extranet'e veya TripAdvisor yönetim merkezine bağlanmaz. Her yorum için **kopyala-yapıştır + manuel yayımlama** akışı kurmak zorundasınız.

### 2. Marka tonu hafızası yok
Her yeni sohbette markanızın tonunu, telafi kurallarınızı, kullandığınız tabu kelimeleri tekrar tekrar açıklamak zorundasınız. Bir dakikalık bir görev her seferinde 3 dakikaya çıkıyor.

### 3. Otomasyon yok
Yeni yorum geldiğinde size bildirim gelmez, taslak hazırlanmaz, onaylama akışı yoktur. Hepsi insanın elinde.

### 4. Çok lokasyon yok
5 şubeniz varsa 5 farklı sohbet, 5 farklı brief açmanız gerekir.

### 5. Veri ve analitik yok
Hangi şikayet kategorisinin arttığını, hangi şubenin yanıt oranının düştüğünü görmek için manuel tablolarla uğraşmanız gerekir.

> **Callout — Genel AI vs Özel Araç:** ChatGPT bir "yazma asistanıdır", özel araç (VoyageRespond, MARA, ReviewPro) ise "yorum yönetim altyapısıdır". İkisini karıştırmak en sık yapılan hatadır.

## Özel Araç Karşılaştırması: VoyageRespond, MARA, ReviewPro

| Özellik | VoyageRespond | MARA | ReviewPro |
|---------|---------------|------|-----------|
| Kapsam | Otel + restoran + çoklu sektör | Sadece otel | Otel + büyük kurumsal |
| Platform sayısı | **80+** (Google, Booking, TripAdvisor, Instagram, TikTok, Hotels.com, Yemeksepeti, Trendyol, Airbnb...) | 10+ | 100+ |
| Türkçe arayüz | **Evet (yerli ekip)** | Sınırlı | Sınırlı |
| Çok dilli yanıt (TR/EN/RU/DE) | Evet | Evet | Evet |
| Marka tonu öğrenme | Evet | Evet | Evet |
| Onay akışı | Evet (yıldıza göre kural) | Evet | Evet |
| Sentiment / kategori analizi | Evet | Evet | Evet |
| API & Webhooks | Evet | Sınırlı | Evet |
| Fiyatlandırma | KOBİ-friendly | Orta-yüksek | Kurumsal |
| Kurulum süresi | 1 saatten az | 1-2 hafta | 1-3 ay |
| Türkiye lokal entegrasyonlar (Trendyol, Yemeksepeti) | **Evet** | Hayır | Hayır |

## Özel Aracın ChatGPT'ye Göre 5 Net Avantajı

1. **Tek panel:** 80+ platformdan gelen yorum tek listede; her birine ayrı extranet açmak yok.
2. **Marka tonu kaydı:** Bir kez tanımlarsınız, her yanıt o tonla üretilir.
3. **Akıllı kurallar:** "5 yıldıza otomatik gönder, 1-2 yıldıza önce onayla" gibi kurallar.
4. **Çoklu lokasyon:** Şube bazlı yanıt oranı, sentiment, hedef takibi.
5. **Veri & uyarı:** Şikayet kategorisi artarsa Slack / e-posta bildirimi.

## ROI Hesabı: Manuel vs AI

Bir otelin ayda 100 yorum aldığını varsayalım:

| Kalem | Manuel | AI Destekli |
|-------|--------|-------------|
| Yorum başına süre | 6 dk | 1 dk (onay) |
| Aylık toplam süre | 10 saat | 1.5 saat |
| Saatlik personel maliyeti (orta) | 250 TL | 250 TL |
| Aylık zaman maliyeti | **2.500 TL** | 375 TL |
| AI araç aylık maliyeti | 0 TL | ~1.500 TL |
| Aylık toplam | **2.500 TL** | **1.875 TL** |
| Yanıt oranı | %55-70 | %95+ |
| 24 saat içi yanıt | %20-40 | %90+ |
| Çok dilli kapsam | İngilizce dışı düşer | TR/EN/RU/DE tam |
| Hata payı | Yüksek | Düşük |

Sayısal tasarruf görece küçük görünebilir; gerçek kazanç **yanıt oranı + hızı + tutarlılığı** ile gelen yerel SEO yükselişi ve rezervasyon artışıdır. Üstelik restoran zinciri veya 3+ lokasyonlu işletmelerde AI maliyeti aynı kalırken manuel maliyet doğrusal olarak büyür.

## Karar Çerçevesi: Hangi Aracı Seçmeli?

- **Tek tek küçük işletme, ayda <20 yorum:** ChatGPT yeterli olabilir; ama yine de Google Business Profile'a tek tek kopya-yapıştır yapmak zorundasınız.
- **Restoran / kafe, 1-3 şube, ayda 30-150 yorum:** VoyageRespond gibi KOBİ-friendly bir özel araç en doğru seçim. Tek panel, çok platform, yerli destek.
- **Otel zinciri, 3+ şube, ayda 200+ yorum:** VoyageRespond ya da MARA arasında seçim. Türkiye'de Booking/TripAdvisor/Yemeksepeti ihtiyacı varsa VoyageRespond avantajlı.
- **Kurumsal grup, 10+ tesis, kompleks rapor ihtiyacı:** ReviewPro ya da VoyageRespond Enterprise paketi.

## AI ile Yanıt Yazarken Dikkat Edilecekler

1. **Spesifik detay zorunlu:** İyi AI yanıt, yorumdan en az 1 spesifik detayı içerir.
2. **Onay akışı kullanın:** Tüm yorumları otomatik göndermek yerine, kritik (1-2 yıldız) yorumlarda insan onayı ekleyin.
3. **Marka tonu güncel kalsın:** Her 6 ayda bir marka tonu brief'inizi gözden geçirin.
4. **Çok dilli kontrol:** AI'nın TR / EN / RU / DE çıktısını ilk hafta birkaç örnekte manuel doğrulayın.
5. **Veri ile besleyin:** AI'ya geçmiş yanıtlarınızı tanıtın; sıfırdan tahmin etmesinden çok daha tutarlı çıktı verir.

## İlgili Rehberler

- [Olumsuz Google Yorumu Nasıl Cevaplanır?](/blog/olumsuz-google-yorumu-nasil-cevaplanir)
- [Olumlu Yorum Cevap Örnekleri](/blog/olumlu-yorum-cevap-ornekleri)
- [Google Yorum Cevap Şablonları: 50 Hazır Yanıt](/blog/google-yorum-cevap-sablonlari)
- [Otel Yorum Cevaplama Rehberi](/blog/otel-yorum-cevaplama-rehberi)
- [AI Visibility Score Nedir?](/blog/ai-gorunurluk-skoru-nedir)
- [Fiyatlandırma](/pricing)

## Sonuç

ChatGPT ile yorum yanıtı yazmak, "elektrik süpürgesini fişe takmadan kullanmak" gibidir — kısa vadede biraz iş görür, ama bir altyapı değildir. 2026'da yorum yönetimi tek panelden, çok platforma, marka tonuyla ve otomasyon akışıyla yapılır. VoyageRespond bu altyapıyı **Türkiye lokal entegrasyonları (Yemeksepeti, Trendyol, Hotels.com)** ile birlikte sunar; yıllık zaman ve dönüşüm farkı manuel sürece göre çok belirgindir.

**[VoyageRespond ile 80+ platformdaki yorumları tek panelden yönetin →](/onboarding)**
    `
  }
];
const UPDATED = "2026-06-05";
const AUTHOR = "VoyageRespond Ekibi";
const memnuniyetClusterPosts = [
  {
    slug: "google-yorumlarim-nasil-yonetilir",
    title: "Google Yorumlarım Nasıl Yönetilir? Adım Adım Rehber (2026)",
    metaTitle: "Google Yorumlarım Nasıl Yönetilir? 2026 Rehberi",
    metaDescription: "Google yorumlarımı nasıl görürüm, nasıl yanıtlarım, nasıl silerim? Google Business Profile üzerinden tüm yorum yönetim adımları + AI ipuçları.",
    description: "Google yorumlarınızı tek panelden yönetmenin yolları: yorumları görmek, yanıtlamak, raporlamak, kaldırmak ve AI ile otomatikleştirmek.",
    ogTitle: "Google Yorumlarım Nasıl Yönetilir? | VoyageRespond",
    ogDescription: "Google Business Profile üzerinden yorum görme, yanıtlama, silme ve AI otomasyonu — tek rehberde.",
    author: AUTHOR,
    publishedAt: "2026-06-05",
    updatedAt: UPDATED,
    category: "Google Yorumları",
    readTime: "10 dk",
    keywords: [
      "google yorumlarım",
      "google yorumları nasıl yönetilir",
      "google işletme yorumları",
      "google yorum paneli",
      "google yorum silme"
    ],
    faqs: [
      {
        question: "Google yorumlarımı nereden görebilirim?",
        answer: "Google'da işletme adınızla arama yapıp 'Yorumları yönet' düğmesine tıklayarak ya da business.google.com adresinden Google Business Profile panelinize girerek tüm yorumlarınızı görebilirsiniz. Mobilden Google Haritalar uygulamasındaki 'İşletmeniz' sekmesinden de erişilebilir."
      },
      {
        question: "Google yorumlarıma neden yanıt vermem gerekir?",
        answer: "Tüketicilerin %89'u karar vermeden önce yorumları okur ve yanıtlanmış yorumlar olan işletmelere %35 daha çok güvenir. Ayrıca Google'ın algoritması yanıtlanan profillere yerel aramalarda öncelik verir."
      },
      {
        question: "Haksız bir Google yorumunu silebilir miyim?",
        answer: "Yorum Google'ın içerik politikalarını ihlal ediyorsa (hakaret, sahte içerik, çıkar çatışması, ilgisiz konu) 'Uygunsuz olarak işaretle' ile şikayet edebilirsiniz. Süreç 5-15 gün sürer ve her başvuru kabul edilmez; o yüzden bu süre içinde profesyonel bir yanıt da yazmanızı öneririz."
      },
      {
        question: "Yorum yanıtlarımı AI ile yazdırabilir miyim?",
        answer: "Evet. VoyageRespond gibi AI destekli platformlar Google yorumlarınızı otomatik çeker, markanızın tonunu öğrenir ve her yoruma kişiselleştirilmiş yanıt önerir. Onayladığınız yanıt doğrudan Google'a gönderilir."
      },
      {
        question: "Yorum yönetimi için günde kaç dakika ayırmalıyım?",
        answer: "Manuel yönetimde her 10 yorum yaklaşık 25-30 dakika alır. AI destekli sistemlerde aynı iş 3-5 dakikaya iner; çünkü AI taslakları üretir, siz sadece onaylarsınız."
      }
    ],
    content: `
Google yorumlarım nereden görünür, nasıl yanıtlanır, nasıl silinir ve nasıl otomatikleştirilir? Bu rehberde Google Business Profile (eski adıyla Google My Business) üzerinden yorum yönetiminin **tüm adımlarını** ve manuel yönetimden AI destekli yönetime geçişin nasıl yapıldığını göreceksiniz.

İşletmenizin Google'daki yıldız ortalaması ve yorum sayısı, yerel aramalarda kaç sıra üstte göründüğünüzü doğrudan etkiler. BrightLocal'in 2025 raporuna göre tüketicilerin **%87'si** bir işletmeyi ziyaret etmeden önce Google yorumlarını okuyor. Yani "Google yorumlarım" sadece bir geri bildirim akışı değil; satış kanalınız.

## Google Yorumlarımı Nereden Görürüm?

Google yorumlarınıza üç farklı şekilde erişebilirsiniz:

1. **Doğrudan arama:** Google'da işletme adınızı yazın. Sağdaki kutuda "Yorumları yönet" butonu çıkar.
2. **Google Business Profile paneli:** business.google.com adresine giriş yapın, sol menüden "Yorumlar" sekmesine tıklayın.
3. **Mobilden:** Google Haritalar uygulaması → profil simgeniz → "İşletmeniz" → "Yorumlar".

Her üçü de aynı veriyi gösterir. Birden fazla lokasyonunuz varsa Business Profile Manager, hepsini tek listede toplar.

## Yorumlara Nasıl Yanıt Verilir?

Yanıt yazmak için yorumun yanındaki **"Yanıtla"** butonuna tıklayın. Yanıt aynı dakikada müşteriye e-posta olarak gider ve **herkese açık** olarak yorumun altında görünür. Yani yanıtınız sadece yorum yazana değil, sonradan o yorumu okuyacak yüzlerce potansiyel müşteriye yazılıyor.

### İyi yanıtın 4 kuralı

- **Adıyla hitap edin.** "Ayşe Hanım, …" otomatik şablona göre %3x daha samimi algılanır.
- **Spesifik detaya değinin.** Müşteri "kahvaltı çok güzeldi" dediyse "ev yapımı reçellerimizi sevmenize sevindik" deyin — şefin tarifi gibi somut bir şey ekleyin.
- **Maks. 3-4 cümle.** Uzun yanıtlar okunmaz.
- **24 saat içinde yanıtlayın.** İlk gün gelen yanıtlar müşteri kararını %33 oranında değiştiriyor.

### Olumsuz yoruma örnek yanıt

> Merhaba [İsim], yaşadığınız deneyim için samimiyetle özür dileriz. [Spesifik sorun] konusunu hemen ekibimizle değerlendirdik ve [aksiyon] adımını attık. Sizinle doğrudan iletişime geçmek isteriz — [iletişim] üzerinden bize ulaşır mısınız?

Olumsuz yorumların detaylı yanıt çerçevesi için → [Olumsuz Google Yorumu Nasıl Cevaplanır?](/blog/olumsuz-google-yorumu-nasil-cevaplanir) rehberimize bakın.

## Bir Yorumu Nasıl Silerim (veya Silinmesini Talep Ederim)?

İşletme sahibi olarak siz **doğrudan** silemezsiniz. Sadece Google'ın silmesini talep edebilirsiniz.

### Silinme talep edilebilir yorum türleri

- Hakaret, küfür içeren
- Açıkça sahte / başkası tarafından yazılmış
- Rakip işletme tarafından yazılmış (çıkar çatışması)
- İşletmenizle ilgisiz konu (politika, kişisel hesaplaşma)
- Spam veya reklam linki içeren

### Adımlar

1. Yorumun yanındaki üç noktaya tıklayın → **"Uygunsuz olarak işaretle"**.
2. Açılan formda kategoriyi seçin ve **detaylı açıklama** yazın (ne kadar somutsa o kadar iyi).
3. Bekleyin: Google ortalama **5-15 gün** içinde karar verir.
4. Reddedilirse Google Business Profile Yardım üzerinden itiraz edebilirsiniz.

Önemli: Bekleme sürecinde **mutlaka profesyonel bir yanıt yazın**. Yorum silinmezse en azından okuyan herkes sizin tarafınızı görmüş olur.

## Yorumlarımı Tek Panelden Yönetmenin Yolları

10'dan fazla yorum gelmeye başladığında Google'ın kendi paneli yetersiz kalır:

- Filtreleme yok (yıldıza/tarihe göre)
- AI yanıt önerisi yok
- Çoklu lokasyon için sürekli profil değiştirmek gerekir
- Raporlama yok

### Yorum yönetim yazılımı ne yapar?

| Özellik | Google Paneli | Yönetim Yazılımı |
|---|---|---|
| Yorum çekme | Manuel | Otomatik (saatlik) |
| AI yanıt önerisi | Yok | 8 farklı tonda |
| Çoklu lokasyon | Profil değiştirmek lazım | Tek dashboard |
| Raporlama | Yok | Haftalık/aylık |
| Duygu analizi | Yok | Var |
| Çoklu platform (Booking, TripAdvisor, vb.) | Yok | Var |

VoyageRespond, bu işi otomatikleştiren bir platformdur. Google işletme hesabınızı bağlarsınız, sistem son 2.500 yorumu çeker, her yenisi için yanıt taslağı önerir, siz onaylayınca doğrudan Google'a gönderir.

## AI ile Yorum Yanıtlama: Nasıl Çalışır?

1. Google işletme profilinizi bağlayın (OAuth ile 30 saniye)
2. Marka tonunuzu seçin: profesyonel, samimi, esprili, resmi, …
3. Sistem her yeni yorumu işler ve **kişiselleştirilmiş 3 yanıt önerisi** üretir
4. Onayladığınız yanıt anında yayınlanır

10 yorum için manuel cevapta 25-30 dakika harcanırken AI'da bu süre **3-5 dakikaya** düşer. Detaylar → [AI ile Yorum Cevaplama](/blog/ai-ile-yorum-cevaplama).

## Sık Karşılaşılan Sorunlar

- **Yorum gelmiyor.** Müşterilere yorum bırakma linkini gönderin: business profile → "Daha fazla yorum alın". QR kod yazdırıp masaya/resepsiyona koyun.
- **Düşük yıldızlar arttı.** İlk 7 gün **her gün** yanıt yazın. Ortalamayı düzeltmek 30-90 gün sürer.
- **Aynı yorumu iki kez gördüm.** Google bazen yorumu yeniden indeksler; profil panelinde duplicate görünebilir, müşteriye iki kez yanıt yazmayın.
- **Yanıt yazdım, görünmüyor.** Bazen 24 saat sürer. Şüpheli karakter (emoji yığını, link) varsa Google filtreleyebilir.

## Sonraki Adım

Eğer yoğun bir işletmeyseniz (haftada 5+ yorum), manuel yönetim sürdürülebilir değil. VoyageRespond'un 3 ay ücretsiz planıyla Google yorumlarınızı tek panelden AI destekli yönetmeye başlayabilirsiniz.

## İlgili Rehberler

- [Google Yorumlarına Nasıl Yanıt Verilir? 2026 Rehberi](/blog/google-yorumlarina-nasil-yanit-verilir)
- [Google Yorum Cevap Şablonları (25 Örnek)](/blog/google-yorum-cevap-sablonlari)
- [Olumsuz Google Yorumu Nasıl Cevaplanır?](/blog/olumsuz-google-yorumu-nasil-cevaplanir)
- [Online İtibar Yönetimi Rehberi](/online-itibar-yonetimi)
`
  },
  {
    slug: "google-yorum-nedir-nasil-yapilir",
    title: "Google Yorum Nedir, Nasıl Yapılır ve Nasıl Yönetilir?",
    metaTitle: "Google Yorum: Nedir, Nasıl Yazılır, Nasıl Yanıtlanır?",
    metaDescription: "Google yorum nedir, nasıl yazılır, nasıl yanıtlanır, nasıl silinir? İşletmeler ve müşteriler için kapsamlı 2026 rehberi.",
    description: "Google yorum sisteminin nasıl çalıştığını, müşteri olarak nasıl yorum yazılacağını ve işletme olarak yorumların nasıl yönetileceğini öğrenin.",
    ogTitle: "Google Yorum Nedir, Nasıl Yapılır? | VoyageRespond",
    ogDescription: "Google yorum yazma, yanıtlama, silme ve işletmeler için yorum yönetimi — tek kapsamlı rehber.",
    author: AUTHOR,
    publishedAt: "2026-06-05",
    updatedAt: UPDATED,
    category: "Google Yorumları",
    readTime: "9 dk",
    keywords: [
      "google yorum",
      "google yorum nedir",
      "google yorum nasıl yapılır",
      "google yorum yazma",
      "google yorum yanıtlama"
    ],
    faqs: [
      {
        question: "Google yorum nedir?",
        answer: "Google yorum, Google Haritalar veya Arama üzerindeki bir işletme profilinde kullanıcıların 1-5 yıldız ve metin olarak paylaştığı değerlendirmedir. Yerel SEO sıralamasını ve potansiyel müşteri kararını doğrudan etkiler."
      },
      {
        question: "Google'a nasıl yorum yazılır?",
        answer: "Google Haritalar veya Arama'da işletme adını arayın, profil sağ panelinden 'Yorum yaz' butonuna tıklayın, 1-5 yıldız verin ve metni yazın. Google hesabı zorunludur ve yorum birkaç saatte yayınlanır."
      },
      {
        question: "Google yorumumu nasıl silerim veya düzenlerim?",
        answer: "Google Haritalar uygulamasında 'Katkıların' sekmesine gidin, yorumunuzun yanındaki üç noktaya tıklayın ve 'Düzenle' veya 'Sil' seçeneğini kullanın. İşlem anında uygulanır."
      },
      {
        question: "Bir işletme bana neden Google yorumu için ısrar ediyor?",
        answer: "Çünkü Google yorumları işletmenin yerel arama sıralamasını ve güvenilirliğini doğrudan belirler. Yorum sayısı ve yıldız ortalaması ne kadar yüksekse, işletme o kadar üst sırada görünür ve daha fazla müşteri çeker."
      },
      {
        question: "İşletme olarak Google yorumlarımı nasıl yönetirim?",
        answer: "Google Business Profile'a giriş yapıp manuel yanıtlayabilir ya da VoyageRespond gibi AI destekli platformlarla otomatik yanıt taslakları alabilir, çoklu lokasyonlu işletmelerde tek panelden tüm şubeleri yönetebilirsiniz."
      }
    ],
    content: `
Google yorum nedir, nasıl yazılır, nasıl silinir, işletme olarak nasıl yönetilir? Bu rehber hem müşteri hem işletme tarafından Google yorum sisteminin nasıl çalıştığını ve yerel SEO için neden bu kadar önemli olduğunu adım adım açıklıyor.

## Google Yorum Nedir?

Google yorum, **Google Haritalar** ve **Google Arama** üzerinden bir işletme profilinde paylaşılan değerlendirmedir. Üç parçası vardır:

- **Yıldız** (1-5 arası)
- **Metin** (isteğe bağlı)
- **Fotoğraf** (isteğe bağlı)

Yorumlar herkese açıktır ve işletme profilinin altında **kalıcı** olarak yayınlanır. Toplam yıldız ortalamanız + yorum sayınız, Google'ın yerel arama (örn. "yanımdaki restoran") sıralamasını doğrudan etkileyen 3 temel faktörden biridir.

## Müşteri Olarak Google'a Nasıl Yorum Yazılır?

### Mobilden (en hızlı yol)

1. Google Haritalar uygulamasını açın
2. İşletme adını arayın → profile girin
3. Aşağı kaydırın, **"Yorum yaz"** butonuna tıklayın
4. 1-5 yıldız seçin → kısa metin yazın → isterseniz fotoğraf ekleyin
5. **Yayınla**

### Bilgisayardan

1. google.com.tr'de işletme adını arayın
2. Sağdaki bilgi kutusunda **"Yorum yaz"** butonuna tıklayın
3. Aynı adımlar

Google hesabı zorunludur. Yorumunuz **1-24 saat** içinde yayınlanır; Google'ın spam filtresi şüphe duyarsa daha uzun sürebilir.

## Yorumumu Nasıl Silerim veya Düzenlerim?

1. Google Haritalar → profil simgeniz → **"Katkıların"**
2. **"Yorumlar"** sekmesi
3. Düzenlemek istediğiniz yorumun yanındaki **üç nokta** → "Düzenle" veya "Sil"

Sildiğiniz yorum **anında** kaldırılır. Düzenlediğinizde Google yorumu tekrar onay sürecinden geçirebilir.

## İşletme Olarak Google Yorumlarımı Nasıl Görürüm?

- **business.google.com** → Yorumlar sekmesi
- Veya Google'da işletme adınızı aratıp **"Yorumları yönet"** butonu

Yorum sayınız 20'yi geçtiyse manuel takip zorlaşır. Detaylar → [Google Yorumlarım Nasıl Yönetilir?](/blog/google-yorumlarim-nasil-yonetilir)

## Google Yorumuna Nasıl Yanıt Verilir?

Yorumun altındaki **"Yanıtla"** butonuna tıklayın. Yanıtınız:

- Müşteriye e-posta olarak iletilir
- **Herkese açık** olarak yorumun altında yayınlanır
- Sonradan düzenlenebilir

### 3 cümlelik yanıt formülü

1. **Teşekkür / özür** ("Geri bildiriminiz için teşekkürler.")
2. **Spesifik detay** ("Bahsettiğiniz [yemek/oda/personel] hakkında…")
3. **Çağrı** ("Tekrar bekleriz" / "Sizinle doğrudan iletişime geçmek isteriz")

25 hazır örnek için → [Google Yorum Cevap Şablonları](/blog/google-yorum-cevap-sablonlari)

## Sahte Yorum Nasıl Anlaşılır ve Nasıl Şikayet Edilir?

Sahte yorum belirtileri:

- Profil resimsiz, başka yorum yok
- Generic metin ("güzeldi", "kötüydü") — detay yok
- Aynı anda 3-4 olumsuz yorum
- Rakip işletme adının geçmesi

Şikayet için yorumun yanındaki **üç nokta → "Uygunsuz olarak işaretle"**. Google 5-15 gün içinde değerlendirir. Bu sırada yine de **profesyonel bir yanıt** yazın — herkes okuyor.

## Daha Fazla Google Yorumu Nasıl Toplanır?

- **QR kod:** İşletmenizin yorum linkini QR'a çevirin, masa/resepsiyon/fatura altına koyun
- **SMS / e-posta hatırlatma:** Servis sonrası 24 saat içinde
- **Personel teşviki:** Garson/resepsiyon "memnun musunuz, Google'a yorum yazar mısınız" deyince yorum oranı 3x artar
- **Yorum talebi otomasyonu:** VoyageRespond gibi platformlarla her ödeme sonrası otomatik istek gönderilebilir

## Google Yorum Yönetimi: Manuel vs AI Destekli

| Kriter | Manuel | AI (VoyageRespond) |
|---|---|---|
| Ortalama yanıt süresi | 18 saat | 5 dk |
| Yanıtlanan oran | %40 | %100 |
| 10 yoruma harcanan süre | 25-30 dk | 3-5 dk |
| Çoklu lokasyon yönetimi | Profil değiştirmek lazım | Tek panel |
| Duygu analizi & raporlama | Yok | Var |

## Sonraki Adım

İşletmenizin tüm Google yorumlarını AI ile yöneten bir panel arıyorsanız VoyageRespond'u **3 ay ücretsiz** deneyebilirsiniz.

## İlgili Rehberler

- [Google Yorumlarım Nasıl Yönetilir?](/blog/google-yorumlarim-nasil-yonetilir)
- [Google Yorum Cevap Şablonları](/blog/google-yorum-cevap-sablonlari)
- [Olumlu Yorum Cevap Örnekleri](/blog/olumlu-yorum-cevap-ornekleri)
- [Online İtibar Yönetimi Rehberi](/online-itibar-yonetimi)
`
  },
  {
    slug: "musteri-memnuniyet-anketi-ornekleri",
    title: "Müşteri Memnuniyet Anketi Örnekleri: 20 Hazır Soru + 5 Şablon (2026)",
    metaTitle: "Müşteri Memnuniyet Anketi Örnekleri | 20 Soru, 5 Şablon",
    metaDescription: "Müşteri memnuniyet anketi nasıl hazırlanır? Restoran, otel, e-ticaret ve hizmet sektörü için 20 hazır soru ve 5 anket şablonu. Hemen kullanabilirsiniz.",
    description: "Müşteri memnuniyet anketi tasarlamanın 5 kuralı, NPS/CSAT/CES farkları ve sektöre göre 20 hazır soru.",
    ogTitle: "Müşteri Memnuniyet Anketi Örnekleri | 20 Hazır Soru",
    ogDescription: "NPS, CSAT, CES anketleri ve sektöre göre uyarlanmış 20 örnek soruyla anket hazırlama rehberi.",
    author: AUTHOR,
    publishedAt: "2026-06-05",
    updatedAt: UPDATED,
    category: "Müşteri Memnuniyeti",
    readTime: "8 dk",
    keywords: [
      "müşteri memnuniyet anketi",
      "müşteri memnuniyet anket örnekleri",
      "nps anketi",
      "csat anketi",
      "memnuniyet anketi soruları"
    ],
    faqs: [
      {
        question: "Müşteri memnuniyet anketinde kaç soru olmalı?",
        answer: "İdeal anket 5-8 sorudur. 10 sorunun üstüne çıkıldığında tamamlanma oranı %60'tan %20'lere düşer. Tek soruluk NPS anketleri en yüksek yanıt oranını verir (%40+)."
      },
      {
        question: "NPS, CSAT ve CES arasındaki fark nedir?",
        answer: "NPS (Net Promoter Score) sadakati ölçer ('Bizi tavsiye eder misiniz, 0-10?'). CSAT (Customer Satisfaction) genel memnuniyeti ölçer ('Ne kadar memnunsunuz, 1-5?'). CES (Customer Effort Score) işin ne kadar kolay halledildiğini ölçer ('Sorununuzu çözmek ne kadar kolaydı?')."
      },
      {
        question: "Anket ne zaman gönderilmeli?",
        answer: "Hizmet sonrası ilk 24 saat içinde gönderilen anketler en yüksek yanıt oranını alır. Restoranlarda ödeme sonrası 2 saat, otellerde check-out gününde, e-ticarette ürün teslimat gününde idealdir."
      },
      {
        question: "Anket sonuçlarını nasıl analiz ederim?",
        answer: "NPS için 'destekçiler - eleştirenler' formülü kullanılır. CSAT için memnun olanların yüzdesi alınır. AI destekli platformlar (VoyageRespond gibi) açık uçlu yanıtları otomatik kategorize edip duygu analizi yapar."
      }
    ],
    content: `
Müşteri memnuniyet anketi örnekleri, soru sayısı, sıklık ve sektöre göre uyarlama — hepsi tek rehberde. NPS, CSAT, CES farkını öğrenecek ve restoran, otel, e-ticaret, hizmet sektörü için **kopyala-yapıştır 20 hazır soru** bulacaksınız.

## Müşteri Memnuniyet Anketi Neden Önemli?

- Tutulması yeni müşteri kazanmaktan **5x daha ucuz** (Harvard Business Review)
- Memnuniyet skoru 1 puan artınca tekrar satın alma %42 artar
- Eleştirenleri zamanında yakalamazsanız Google yoruma yansır — kaybedilen 1 yıldız ortalama %5-9 ciro kaybı demek

Anket, sorunu **müşteri sosyal medyada yazmadan önce** yakalamanın en hızlı yoludur.

## 3 Temel Anket Türü

### 1. NPS (Net Promoter Score)

Tek soru: *"Bizi bir arkadaşınıza tavsiye etme olasılığınız 0-10 arası kaçtır?"*

- **9-10:** Destekçiler (Promoters)
- **7-8:** Pasifler
- **0-6:** Eleştirenler (Detractors)

**NPS = % Destekçi - % Eleştiren**

50+ mükemmel, 30+ iyi, 0+ kabul edilebilir, negatif kritik.

### 2. CSAT (Customer Satisfaction)

*"Hizmetimizden ne kadar memnun kaldınız? (1-5)"*

CSAT = (4 ve 5 verenler / toplam) × 100. %80+ hedeftir.

### 3. CES (Customer Effort Score)

*"Sorununuzu çözmek ne kadar kolaydı? (1-7)"*

Müşteri hizmetleri ekibinin verimliliğini ölçer.

## 5 Sektör için 20 Hazır Soru

### 🍽️ Restoran (5 soru)

1. Yemeklerimizden ne kadar memnun kaldınız? (1-5)
2. Servis hızımızı nasıl değerlendirirsiniz? (1-5)
3. Mekanın atmosferi beklentinizi karşıladı mı? (1-5)
4. Fiyat-kalite dengesi sizin için nasıldı? (1-5)
5. Bizi bir arkadaşınıza tavsiye eder misiniz? (0-10)

### 🏨 Otel (5 soru)

1. Odanızın temizliğinden memnun kaldınız mı? (1-5)
2. Check-in / check-out süreci ne kadar kolaydı? (1-5)
3. Kahvaltı / restoran deneyiminiz nasıldı? (1-5)
4. Personelimizin ilgisi beklentinizi karşıladı mı? (1-5)
5. Tekrar konaklamayı düşünür müsünüz? (0-10)

### 🛒 E-ticaret (4 soru)

1. Ürün açıklamasıyla geleni eşleşti mi? (1-5)
2. Teslimat süresi sizin için uygun muydu? (1-5)
3. Paketleme kalitesi nasıldı? (1-5)
4. Tekrar alışveriş yapma olasılığınız nedir? (0-10)

### 💼 Hizmet / B2B (3 soru)

1. Hizmetimiz beklentilerinizi karşıladı mı? (1-5)
2. İletişim sürecimiz net miydi? (1-5)
3. Bu hizmeti meslektaşınıza tavsiye eder misiniz? (0-10)

### 💆 Kuaför / Güzellik (3 soru)

1. Hizmetinizden memnun kaldınız mı? (1-5)
2. Bekleme süreniz uygun muydu? (1-5)
3. Bizi tekrar tercih eder misiniz? (1-5)

## 5 Anket Şablonu

### Şablon 1 — Mikro NPS (Tek soru, %40+ yanıt oranı)

> Merhaba [İsim], dün bizi tercih ettiğiniz için teşekkürler! Hızlı bir sorumuz var: Bizi bir arkadaşınıza tavsiye etme olasılığınız 0-10 arasında kaçtır?

### Şablon 2 — Standart CSAT (5 soru, 1 dk)

> Değerli müşterimiz, kısa anketimiz yalnızca 60 saniyenizi alacak. Yanıtlarınız hizmetimizi geliştirmemize yardımcı olacak. (5 soru bağlantısı)

### Şablon 3 — Çıkış sonrası (Otel/restoran)

> Ziyaretiniz nasıldı? Bizi 1-5 arası nasıl değerlendirirsiniz? Çok memnun kaldıysanız Google'da yorum bırakır mısınız? [Google linki]

### Şablon 4 — Eleştiri sonrası takip

> Geri bildiriminiz için teşekkürler. Yaşadığınız sorunu çözmek için bize biraz daha detay verebilir misiniz? (3 açık uçlu soru)

### Şablon 5 — Çeyreklik B2B ilişki anketi

> Son 3 ayda hizmetimizden memnun musunuz? Hangi alanları geliştirmemizi istersiniz? (CES + açık uçlu)

## Anket Hazırlarken 5 Kural

1. **5-8 soru.** Daha fazlası tamamlanma oranını çökertir.
2. **Açık uçlu sorular en sonda.** İnsanlar başta motiveyken yazmaz.
3. **Mobil-first.** %70 mobilden açılır; ekranda sığsın.
4. **Tek tıkla başla.** "Anket bağlantısı" değil, ilk soru e-postada gözüksün.
5. **Anonim seçeneği sunun.** Açık ad zorunluysa yanıt %30 düşer.

## Anket Sonuçları → Aksiyon Akışı

| Skor | Eylem |
|---|---|
| NPS 9-10 | Google/Tripadvisor yoruma yönlendir |
| NPS 7-8 | Teşekkür + bir sonraki için ipucu |
| NPS 0-6 | **24 saat içinde** ekip lideri arasın, sorunu çözsün |

AI destekli platformlar açık uçlu yanıtları otomatik kategorize eder ("temizlik", "personel", "fiyat") ve trendleri haftalık rapor olarak gönderir.

## Anket → Google Yorum Dönüşümü

Memnun müşteriyi (9-10 verenler) doğrudan Google yorum linkine yönlendirin. VoyageRespond'un ücretsiz QR kod ve kısa link üretici aracıyla bunu otomatikleştirebilirsiniz.

## İlgili Rehberler

- [Müşteri Memnuniyet Mesajı Örnekleri (50 Şablon)](/blog/musteri-memnuniyet-mesaji-ornekleri)
- [Restoran Müşteri Memnuniyeti Rehberi](/restoran-musteri-memnuniyeti)
- [Müşteri Memnuniyeti Nedir?](/musteri-memnuniyeti)
- [Olumlu Yorum Cevap Örnekleri](/blog/olumlu-yorum-cevap-ornekleri)
`
  },
  {
    slug: "musteri-memnuniyet-mesaji-ornekleri",
    title: "Müşteri Memnuniyet Mesajı Örnekleri: 50 Hazır Şablon (2026)",
    metaTitle: "Müşteri Memnuniyet Mesajı Örnekleri | 50 Şablon",
    metaDescription: "Müşteri memnuniyet mesajı örnekleri: teşekkür, geri bildirim, takip, özür ve teşvik mesajları için 50 hazır şablon. Hemen kopyalayın.",
    description: "Restoran, otel ve e-ticaret işletmeleri için müşteri memnuniyet mesajı şablonları — teşekkür, özür, takip, yorum talebi ve teşvik.",
    ogTitle: "Müşteri Memnuniyet Mesajı Örnekleri | 50 Şablon",
    ogDescription: "50 hazır müşteri memnuniyet mesajı: SMS, WhatsApp, e-posta ve sosyal medya için sektöre göre uyarlanabilir.",
    author: AUTHOR,
    publishedAt: "2026-06-05",
    updatedAt: UPDATED,
    category: "Müşteri Memnuniyeti",
    readTime: "9 dk",
    keywords: [
      "müşteri memnuniyet mesajı",
      "müşteri memnuniyet mesajları",
      "müşteri memnuniyet sözleri",
      "memnuniyet yazısı örneği",
      "müşteri memnuniyeti cümleleri"
    ],
    faqs: [
      {
        question: "Müşteri memnuniyet mesajı ne zaman gönderilmeli?",
        answer: "İdeal zaman hizmet sonrası ilk 24 saattir. Restoranda ödeme sonrası 2 saat, otelde check-out gününde, e-ticarette teslimat gününde gönderilen mesajlar en yüksek yanıt oranını alır."
      },
      {
        question: "Hangi kanal kullanılmalı: SMS mi e-posta mı WhatsApp mı?",
        answer: "Açılma oranı: WhatsApp %98, SMS %95, e-posta %22. Türkiye'de WhatsApp veya SMS çok daha etkilidir. Resmi B2B iletişimde e-posta tercih edilir."
      },
      {
        question: "Memnun müşteriden Google yorumu nasıl istenir?",
        answer: "Önce 1-5 arası mikro memnuniyet sorusu sorun; 4-5 verenleri Google yorum linkine yönlendirin. Aksi halde 1-3 verenler de yoruma giderse ortalama yıldızınız düşer. VoyageRespond bu akışı otomatik yapar."
      },
      {
        question: "Aynı mesajı herkese göndermek doğru mu?",
        answer: "Hayır. Müşterinin adı, sipariş/oda numarası veya bahsettiği ürün gibi en az bir kişisel detay olmalı. Kişiselleştirilmiş mesajlar generic mesajlardan 3x daha çok yanıt alır."
      }
    ],
    content: `
Müşteri memnuniyet mesajı örnekleri — teşekkür, özür, geri bildirim talebi, sadakat ve yorum daveti için **50 hazır şablon**. Restoran, otel ve e-ticaret için sektörel uyarlamalar; SMS, WhatsApp ve e-posta için optimize edilmiş kısa mesajlar.

## İyi Bir Memnuniyet Mesajı Nasıl Yazılır?

- **Kısa olsun.** SMS için 160 karakter, WhatsApp için 2 satır.
- **İsim kullanın.** "Sayın müşterimiz" değil, "Ayşe Hanım".
- **Spesifik detay olsun.** Sipariş no, oda no, ürün adı, tarih.
- **Tek bir çağrı (CTA) olsun.** "Yorum bırakın" veya "Anketi doldurun" — ikisi birden değil.
- **Mesai saatinde gönderin.** 10:00-19:00 arası 2x yanıt alır.

## 1. Teşekkür Mesajları (10 örnek)

1. Merhaba [İsim], bugün bizi tercih ettiğiniz için teşekkürler! Tekrar bekleriz. 🙏
2. [İsim] Hanım, ziyaretinizden çok mutlu olduk. Görüşmek üzere!
3. Değerli misafirimiz, bizi seçtiğiniz için teşekkür ederiz. İyi günler!
4. Merhaba [İsim], deneyiminiz için teşekkürler! Memnuniyetiniz bizim için her şey demek.
5. [İsim] Bey, bizi tercih etmeniz çok değerli. Yine bekleriz!
6. Sevgili müşterimiz, bugün sizi ağırlamaktan mutluluk duyduk. ☕
7. [İsim], güveniniz için minnettarız. Bir sonraki ziyaretinizde sizi yine ağırlamak isteriz.
8. Merhaba [İsim], hizmetimizi tercih ettiğiniz için teşekkürler. Her geri bildiriminiz bizim için değerli.
9. Değerli müşterimiz, ekibimiz adına teşekkür ederiz. İyi günler dileriz!
10. [İsim] Hanım, bugün sizi ağırlamak güzeldi. Tekrar görüşmek üzere.

## 2. Geri Bildirim Talebi (10 örnek)

11. Merhaba [İsim], deneyiminiz nasıldı? 60 saniyenizi alır: [link]
12. [İsim], 1-5 arasında bize kaç verirsiniz? Yanıtlamak için cevaplayın.
13. Sevgili müşterimiz, hizmetimizi daha iyi yapmamız için fikirleriniz çok değerli: [link]
14. [İsim] Bey, ziyaretiniz beklentilerinizi karşıladı mı? Kısa anketimiz: [link]
15. Merhaba [İsim], sizi 30 saniyelik bir ankete davet ediyoruz. Yanıtlarınız ekibimizi motive ediyor: [link]
16. [İsim], dürüst yorumunuz bizim için bir hediye. Lütfen birkaç dakika ayırın: [link]
17. Değerli misafirimiz, ne iyi gitti, ne daha iyi olabilir? Yanıtlamak için cevaplayın.
18. [İsim] Hanım, kısa bir sorumuz var: Bizi bir arkadaşınıza tavsiye eder misiniz? (0-10)
19. Merhaba [İsim], geri bildiriminiz hizmetimizi geliştiriyor. Anketimiz: [link]
20. [İsim], 1 dakika ayırırsanız çok seviniriz: [link]

## 3. Olumlu Yorum Talebi (10 örnek)

21. Merhaba [İsim], ziyaretinizi beğendiyseniz Google'da yorum bırakır mısınız? [link]
22. [İsim] Hanım, deneyiminizi diğer müşterilerimizle paylaşır mısınız? [Google linki]
23. Sevgili müşterimiz, memnun kaldıysanız 30 saniyenizi rica edelim: [Google linki]
24. [İsim], güzel sözleriniz başkalarına yol göstersin: [yorum linki]
25. Merhaba [İsim], hizmetimizi sevdiyseniz bir yorum bırakmanız bize çok güç verir: [link]
26. [İsim] Bey, dürüst değerlendirmeniz bizim için altın değerinde: [Google linki]
27. Sevgili misafirimiz, deneyiminizi anlatır mısınız? Tek tıkla: [link]
28. [İsim], Google'da bir yorum kahvaltı tabağı kadar mutlu eder bizi. 😊 [link]
29. Merhaba [İsim], kısa bir yorum yazarsanız ekibimizin günü güzel başlar: [link]
30. [İsim], memnuniyetinizi paylaşır mısınız? [Google linki]

## 4. Özür Mesajları (10 örnek)

31. Sayın [İsim], yaşadığınız deneyim için samimiyetle özür dileriz. Lütfen bize ulaşın: [iletişim]
32. [İsim] Hanım, sizi üzdüğümüz için çok üzgünüz. Konuyu çözmek istiyoruz, bize 5 dakika ayırır mısınız?
33. Değerli müşterimiz, geri bildiriminizi aldık. Sorunu hemen ekibimize ilettik. Sizinle ayrıca iletişime geçeceğiz.
34. [İsim], beklentilerinizi karşılayamamak bizi de üzdü. Telafi etmek için bize bir şans verir misiniz?
35. Sevgili misafirimiz, yaşadıklarınız için çok özür dileriz. Lütfen bizi [tel] üzerinden arayın.
36. [İsim] Bey, sorunu öğrendiğimiz için minnettarız ve gerekli aksiyonu aldık. Bir sonraki ziyaretinizde farkı göreceksiniz.
37. Merhaba [İsim], bu deneyim standartlarımızın altında. Sizi gerçekten dinlemek istiyoruz: [iletişim]
38. Değerli müşterimiz, yanlışımızı kabul ediyor ve özür diliyoruz. Telafi için size özel teklif sunmak isteriz.
39. [İsim], geri bildiriminiz değişim için bir fırsat. Konuyu bizzat takip ediyorum. — [Yönetici]
40. Sayın [İsim], yaşadıklarınız için samimiyetle özür dileriz. Bir sonraki ziyaretinize özel hazırlık yaptık.

## 5. Sadakat / Teşvik Mesajları (10 örnek)

41. [İsim], bugün size özel %15 indirim! Kod: TEKRAR15
42. Merhaba [İsim], 3. ziyaretinizde tatlı ikram. Sizi bekliyoruz!
43. Sevgili [İsim], doğum gününüz yaklaşıyor. Size özel sürprizimiz var: [link]
44. [İsim] Hanım, sizi özlüyoruz! Bu hafta sonu özel menümüz var.
45. Değerli misafirimiz, sadakat programımıza katılmak ister misiniz? Avantajlar: [link]
46. [İsim], son ziyaretinizden bu yana yeni lezzetlerimiz var. Denemek için: [link]
47. Merhaba [İsim], bu hafta sizin için özel bir kampanyamız var! Detaylar: [link]
48. [İsim], birinci yıl dönümümüzde sizi unutmadık. Hediyenizi almak için: [link]
49. Sevgili müşterimiz, sezonun yeni koleksiyonu yayında! İlk siz görün: [link]
50. [İsim] Hanım, sizi tekrar ağırlamak için sabırsızlanıyoruz. Rezervasyon: [link]

## Kanal Bazlı Karşılaştırma

| Kanal | Açılma | Tavsiye |
|---|---|---|
| WhatsApp | %98 | Yorum talebi, takip |
| SMS | %95 | Teşekkür, kısa anket |
| E-posta | %22 | Detaylı anket, kampanya |
| Push notification | %40 | Sadakat hatırlatma |

## Otomatikleştirme

50 mesajı manuel yazmak yerine, **müşteri yolculuğunun** her aşamasına bir mesaj eşleştirip otomatik tetiklenmesini sağlayabilirsiniz: ödeme → teşekkür, 2 saat sonra → anket, 4-5 puan → yorum talebi, 1-3 puan → özür + telefon. VoyageRespond bu akışı kuran AI destekli yorum yönetim platformudur.

## İlgili Rehberler

- [Müşteri Memnuniyet Anketi Örnekleri](/blog/musteri-memnuniyet-anketi-ornekleri)
- [Restoran Müşteri Memnuniyeti Rehberi](/restoran-musteri-memnuniyeti)
- [Müşteri Memnuniyeti Nedir?](/musteri-memnuniyeti)
- [Olumlu Yorum Cevap Örnekleri](/blog/olumlu-yorum-cevap-ornekleri)
`
  }
];
const blogPosts = [
  {
    slug: "google-yorumlarina-nasil-yanit-verilir",
    title: "Google Yorumlarına Nasıl Yanıt Verilir? 2026 Rehberi",
    description: "Google yorumlarına profesyonel ve etkili yanıt vermenin 10 altın kuralı. Olumsuz yorumları fırsata çevirin, müşteri sadakatini artırın.",
    ogTitle: "Google Yorumlarına Nasıl Yanıt Verilir? | 2026 Rehberi",
    ogDescription: "Olumlu ve olumsuz Google yorumlarına profesyonel yanıt verme rehberi. AI destekli ipuçları ve örnek yanıtlar.",
    author: "VoyageRespond",
    publishedAt: "2026-03-10",
    category: "Yorum Yönetimi",
    readTime: "8 dk",
    keywords: ["google yorumlarına yanıt", "google yorum cevaplama", "olumsuz yoruma cevap", "google yorum yönetimi"],
    content: `
Google yorumlarına nasıl yanıt verilir? Google Business Profile üzerinden adım adım yanıtlama rehberi, en iyi pratikler ve örneklerle profesyonel cevap yazma teknikleri. AI destekli alternatifleri de inceleyeceğiz.

## Neden Google Yorumlarına Yanıt Vermelisiniz?

Google yorumları, potansiyel müşterilerinizin işletmeniz hakkındaki ilk izlenimini oluşturur. Araştırmalar gösteriyor ki:

- **Tüketicilerin %89'u** bir işletmeyi ziyaret etmeden önce yorumları okuyor
- **Yorumlara yanıt veren işletmeler** %35 daha fazla güven kazanıyor
- **Google'ın algoritması** yanıtlanan yorumları pozitif bir sıralama sinyali olarak değerlendiriyor

## 1. Hızlı Yanıt Verin

İdeal yanıt süresi **24 saat içinde**dir. Hızlı yanıt:
- Müşteriye değer verdiğinizi gösterir
- Google sıralamanızı olumlu etkiler
- Olumsuz bir deneyimin büyümesini önler

## 2. Kişiselleştirilmiş Yanıtlar Yazın

Kopyala-yapıştır yanıtlardan kaçının. Her yanıtta:
- Müşterinin **adını kullanın**
- Yorumda bahsedilen **spesifik detaylara** değinin
- **Samimi ve profesyonel** bir ton kullanın

### ❌ Kötü Örnek:
> "Yorumunuz için teşekkürler. Tekrar bekleriz."

### ✅ İyi Örnek:
> "Merhaba Ayşe Hanım, kahvaltı büfemizi beğenmenize çok sevindik! Özellikle bahsettiğiniz ev yapımı reçellerimiz şefimizin özel tarifidir. Bir sonraki ziyaretinizde taze sıkılmış portakal suyumuzu da denemenizi öneririz. Tekrar ağırlamaktan mutluluk duyarız! 🙏"

## 3. Olumsuz Yorumlara Profesyonelce Yaklaşın

Olumsuz yorumlar en büyük fırsatlarınızdır:

1. **Sakin kalın** — Duygusal tepki vermeyin
2. **Özür dileyin** — Deneyimleri için üzgün olduğunuzu belirtin
3. **Çözüm sunun** — Somut bir adım atın
4. **Offline'a taşıyın** — İletişim bilgisi paylaşın

### Olumsuz Yorum Yanıt Şablonu:
> "Merhaba [İsim], yaşadığınız deneyim için çok üzgünüz. [Spesifik sorun] konusunu ekibimizle hemen değerlendirdik. Sizi doğrudan arayarak durumu çözmek isteriz. Bize [telefon/email] üzerinden ulaşabilirsiniz."

## 4. Olumlu Yorumları Değerlendirin

Olumlu yorumlara da mutlaka yanıt verin:
- Müşterinin **sadakatini pekiştirin**
- Yeni ürün veya hizmetlerinizi **tanıtın**
- Sosyal medyada **paylaşın**

## 5. Yapay Zeka ile Yorum Yönetimi

Manuel yanıt yazma süreci zaman alıcıdır. AI destekli araçlar ile:

- **Otomatik duygu analizi** yaparak öncelikli yorumları belirleyin
- **Akıllı yanıt önerileri** alarak tutarlı ve profesyonel kalın
- **AI Visibility Score** ile yapay zeka asistanlarında görünürlüğünüzü takip edin

[VoyageRespond](https://voyagerespond.com) ile Google yorumlarınızı yapay zeka destekli olarak yönetebilir, her yoruma saniyeler içinde profesyonel yanıtlar oluşturabilirsiniz.

## İlgili Rehberler

- [Kötü Yorumlara Nasıl Cevap Verilir?](/blog/kotu-yorumlara-nasil-cevap-verilir) — Olumsuz yorumları fırsata çevirmenin yolları
- [Google Yorum Cevap Örnekleri (20 Hazır Şablon)](/blog/google-yorum-cevap-ornekleri) — Kopyala yapıştır hazır yanıtlar
- [Restoran Yorum Cevapları](/restoran-yorum-cevaplari) — Restoranlara özel 30 hazır yanıt şablonu

## Sonuç

Google yorumlarına yanıt vermek, dijital itibar yönetiminin en önemli parçasıdır. Düzenli, kişiselleştirilmiş ve hızlı yanıtlar:

- Google sıralamanızı yükseltir
- Müşteri güvenini artırır
- İşletmenizin profesyonelliğini kanıtlar

**Yorumlara manuel cevap vermek yerine otomatik yönetmek ister misiniz? [VoyageRespond'u ücretsiz deneyin →](https://voyagerespond.com/onboarding)**
    `
  },
  {
    slug: "ai-gorunurluk-skoru-nedir",
    title: "AI Visibility Score Nedir? İşletmeniz Yapay Zekada Nasıl Görünüyor?",
    description: "AI Visibility Score, işletmenizin ChatGPT, Gemini ve diğer AI asistanlarında nasıl göründüğünü ölçer. Skorunuzu nasıl artıracağınızı öğrenin.",
    ogTitle: "AI Visibility Score Nedir? | İşletmeniz AI'da Nasıl Görünüyor",
    ogDescription: "İşletmenizin ChatGPT ve Gemini'de nasıl göründüğünü ölçen AI Visibility Score hakkında her şey.",
    author: "VoyageRespond",
    publishedAt: "2026-03-14",
    category: "AI Görünürlük",
    readTime: "6 dk",
    keywords: ["ai visibility score", "yapay zeka görünürlük", "chatgpt işletme", "ai seo"],
    content: `
AI Görünürlük Skoru nedir? İşletmenizin ChatGPT, Google Gemini, Claude ve diğer yapay zeka asistanlarında ne kadar görünür olduğunu ölçen yeni nesil bir metrik. Bu rehberde nasıl hesaplandığını ve nasıl iyileştirebileceğinizi öğreneceksiniz.

## AI Visibility Score Nedir?

AI Visibility Score, işletmenizin **ChatGPT, Google Gemini, Microsoft Copilot** ve diğer yapay zeka asistanlarında ne kadar doğru ve olumlu şekilde temsil edildiğini ölçen bir metriktir.

Artık müşteriler sadece Google'da aramıyor — **AI asistanlarına soruyor**:

- *"Kadıköy'de en iyi İtalyan restoranı neresi?"*
- *"Antalya'da ailecek kalınacak otel önerir misin?"*
- *"Gölbaşı'nda güvenilir oto yıkama var mı?"*

## Neden Önemli?

### 📊 Rakamlar Ne Diyor?
- **2026'da AI asistan kullanımı** dünya genelinde %340 arttı
- Tüketicilerin **%47'si** artık restoran/otel seçiminde AI önerilerine güveniyor
- AI asistanlarında **görünmeyen işletmeler** potansiyel müşterilerinin yarısını kaybediyor

### 🔍 Google SEO vs AI Visibility
| Özellik | Google SEO | AI Visibility |
|---------|-----------|---------------|
| Sıralama kriteri | Backlink, teknik SEO | Yorum kalitesi, tutarlılık |
| Güncelleme süresi | Haftalar | Anlık |
| Kontrol edilebilirlik | Yüksek | Orta |
| Etki alanı | Arama sonuçları | AI önerileri |

## AI Visibility Score Nasıl Hesaplanır?

Score 0-100 arasında bir değerdir ve şu faktörlere dayanır:

### 1. Yorum Hacmi ve Kalitesi
- Toplam yorum sayısı
- Ortalama puan (4.0+ ideal)
- Son 90 günlük yorum trendi

### 2. Yanıt Oranı ve Kalitesi
- Yanıtlanmış yorum yüzdesi
- Yanıt süresi ortalaması
- Yanıtların kişiselleştirilme düzeyi

### 3. Platform Çeşitliliği
- Google, Booking, TripAdvisor'da varlık
- Platformlar arası tutarlılık
- Çok dilli yorum ve yanıt

### 4. İçerik Analizi
- Yorumlarda geçen anahtar kelimeler
- Duygu analizi dağılımı
- Öne çıkan tema ve konular

## Skorunuzu Nasıl Artırırsınız?

1. **Her yoruma 24 saat içinde yanıt verin** — AI sistemleri aktif işletmeleri tercih eder
2. **Detaylı ve kişisel yanıtlar yazın** — Kopyala-yapıştır yanıtlar negatif sinyal
3. **Tüm platformlarda tutarlı olun** — Google, Booking, TripAdvisor'da aynı kalite
4. **Olumsuz yorumları profesyonelce yönetin** — AI, problem çözme yeteneğinizi değerlendirir
5. **Düzenli yeni yorum teşvik edin** — Güncel yorumlar AI'da ağırlık taşır

## İlgili Rehberler

- [Google Yorumlarına Nasıl Yanıt Verilir?](/blog/google-yorumlarina-nasil-yanit-verilir) — Adım adım yanıt rehberi
- [Yorumlara Neden Cevap Vermek Önemlidir?](/blog/yorumlara-neden-cevap-vermek-onemlidir) — Verilere dayalı analiz

## VoyageRespond ile AI Visibility

[VoyageRespond](https://voyagerespond.com) ile AI Visibility Score'unuzu otomatik olarak takip edebilir, iyileştirme önerileri alabilir ve tüm yorumlarınızı tek panelden yönetebilirsiniz.

**[Ücretsiz AI Visibility Score'unuzu öğrenin →](https://voyagerespond.com/onboarding)**
    `
  },
  {
    slug: "otel-restoran-yorum-yonetimi-rehberi",
    title: "Otel ve Restoran İçin Yorum Yönetimi: Kapsamlı Rehber",
    description: "Otel ve restoran sahipleri için Google, Booking, TripAdvisor yorumlarını profesyonelce yönetme rehberi. Çok platformlu yorum stratejisi.",
    ogTitle: "Otel & Restoran Yorum Yönetimi Rehberi | VoyageRespond",
    ogDescription: "Konaklama ve yeme-içme sektörü için Google, Booking, TripAdvisor yorum yönetim stratejileri.",
    author: "VoyageRespond",
    publishedAt: "2026-03-16",
    category: "Sektör Rehberi",
    readTime: "10 dk",
    keywords: ["otel yorum yönetimi", "restoran yorum yönetimi", "booking yorum", "tripadvisor yorum"],
    content: `
## Konaklama ve Yeme-İçme Sektöründe Yorumların Gücü

Turizm sektöründe online yorumlar, rezervasyon kararlarının **%93'ünü** etkiliyor. Bir otel veya restoran için yorum yönetimi artık bir lüks değil, **hayatta kalma meselesi**.

## Platformlar ve Öncelikleri

### 🏨 Oteller İçin
| Platform | Öncelik | Yorum Hacmi |
|----------|---------|-------------|
| Google Business | ⭐⭐⭐⭐⭐ | Yüksek |
| Booking.com | ⭐⭐⭐⭐⭐ | Çok yüksek |
| TripAdvisor | ⭐⭐⭐⭐ | Orta-yüksek |
| Hotels.com | ⭐⭐⭐ | Orta |

### 🍽️ Restoranlar İçin
| Platform | Öncelik | Yorum Hacmi |
|----------|---------|-------------|
| Google Business | ⭐⭐⭐⭐⭐ | Çok yüksek |
| TripAdvisor | ⭐⭐⭐⭐ | Yüksek |
| Instagram | ⭐⭐⭐⭐ | Dolaylı |
| Foursquare | ⭐⭐⭐ | Orta |

## Çok Platformlu Yorum Stratejisi

### 1. Merkezi Yönetim
Farklı platformlardaki yorumları **tek bir panelden** yönetmek:
- Zaman tasarrufu sağlar
- Tutarlı yanıt kalitesi garantiler
- Hiçbir yorumu kaçırmamanızı sağlar

### 2. Platform-Spesifik Yaklaşım

**Google Yorumları:**
- SEO etkisi nedeniyle en öncelikli
- Anahtar kelimeleri doğal şekilde yanıtlara ekleyin
- Fotoğraflı yanıtlar bonus puan kazandırır

**Booking.com Yorumları:**
- Genellikle daha detaylı ve yapıcı
- Check-in/check-out deneyimine odaklanın
- Tekrar rezervasyon teşviki ekleyin

**TripAdvisor Yorumları:**
- Uluslararası misafirler için kritik
- Çok dilli yanıt önemli
- "Traveler's Choice" rozeti için yüksek yanıt oranı gerekli

## Olumsuz Yorum Kriz Yönetimi

### Adım 1: Hızlı Tespit
Olumsuz yorumları **gerçek zamanlı** tespit edin. Her saat fark yaratır.

### Adım 2: İç Soruşturma
Yanıt yazmadan önce:
- İlgili departmanla konuşun
- Olayı netleştirin
- Çözüm planı oluşturun

### Adım 3: Profesyonel Yanıt
- Özür + empati ile başlayın
- Somut çözüm sunun
- İletişim bilgisi paylaşın
- Offline'a taşıyın

### Adım 4: Takip
- Müşteriyle iletişimi sürdürün
- Çözüm sonrası yorum güncelleme talep edin
- İç süreçleri iyileştirin

## Yapay Zeka ile Yorum Yönetiminin Avantajları

| Manuel Yönetim | AI Destekli Yönetim |
|---------------|---------------------|
| Günde 2-3 saat | Günde 15 dakika |
| Tutarsız ton | Marka uyumlu yanıtlar |
| Kaçan yorumlar | %100 kapsama |
| Reaktif yaklaşım | Proaktif analiz |

## İlgili Rehberler

- [Otel Yorum Cevapları (30 Hazır Şablon)](/otel-yorum-cevaplari) — Otellere özel hazır yanıtlar
- [Restoran Yorum Cevapları (30 Hazır Şablon)](/restoran-yorum-cevaplari) — Restoranlara özel hazır yanıtlar
- [Google Yorum Cevap Örnekleri](/blog/google-yorum-cevap-ornekleri) — Her sektöre uygun 20 şablon

## VoyageRespond: Oteller ve Restoranlar İçin

[VoyageRespond](https://voyagerespond.com), Google, Booking, TripAdvisor ve Hotels.com yorumlarını tek panelden yönetmenizi sağlayan AI destekli platformdur:

- ✅ Tüm platformlardan otomatik yorum çekme
- ✅ AI duygu analizi ve önceliklendirme
- ✅ Çok dilli akıllı yanıt önerileri
- ✅ Çok lokasyonlu işletme desteği
- ✅ AI Visibility Score takibi

**Yorumlara manuel cevap vermek yerine otomatik yönetmek ister misiniz? [3 ay ücretsiz deneyin →](https://voyagerespond.com/onboarding)**
    `
  },
  {
    slug: "kotu-yorumlara-nasil-cevap-verilir",
    title: "Kötü Yorumlara Nasıl Cevap Verilir? 15 Altın Kural ve Örnekler",
    description: "Olumsuz Google yorumlarına profesyonel cevap verme rehberi. 15 gerçek örnek ve hazır şablonlarla kötü yorumları fırsata çevirin.",
    ogTitle: "Kötü Yorumlara Nasıl Cevap Verilir? | 15 Örnek ve Şablon",
    ogDescription: "Olumsuz yorumlara profesyonel cevap vermenin 15 altın kuralı. Gerçek örnekler ve hazır şablonlar.",
    author: "VoyageRespond",
    publishedAt: "2026-03-17",
    category: "Yorum Yönetimi",
    readTime: "12 dk",
    keywords: ["kötü yorumlara cevap", "olumsuz yorum yanıt", "negatif yorum cevaplama", "google kötü yorum"],
    content: `
Kötü yorumlara nasıl cevap verilir? Olumsuz müşteri yorumlarına empati, profesyonellik ve çözüm odaklı yaklaşımla yanıt vermenin yolları. Örneklerle adım adım rehber.

## Kötü Yorumlar Neden Bir Fırsattır?

Olumsuz bir yorum aldığınızda panik yapmayın. Araştırmalar gösteriyor ki:

- **%45 tüketici**, olumsuz yorumlara profesyonel yanıt veren işletmeleri ziyaret etme olasılığının daha yüksek olduğunu söylüyor
- **Sadece olumlu yorum** alan işletmeler %30 daha az güvenilir algılanıyor
- **Profesyonelce yanıtlanan** olumsuz yorumlar, yanıtsız olumlu yorumlardan daha etkili

## Kural 1: Asla Duygusal Tepki Vermeyin

### ❌ Yanlış Yaklaşım:
> "Bu tamamen yanlış! Bizim restoranımıza böyle bir şey olmaz. Siz başka yere gitmiş olmalısınız."

### ✅ Doğru Yaklaşım:
> "Merhaba Mehmet Bey, yaşadığınız deneyim için çok üzgünüz. Standartlarımızın altında bir hizmet sunduğumuzu duymak bizi üzüyor. Bu durumu hemen araştırıyoruz."

## Kural 2: 24 Saat İçinde Yanıt Verin

Geç yanıt, yanıt vermemekten bile kötüdür. Müşteriler hızlı geri dönüş bekler.

## Kural 3: İsim Kullanarak Kişiselleştirin

Müşterinin adını kullanmak, onların değerli olduğunu hissettirir.

## Kural 4: Sorunu Kabul Edin

Sorunu inkar etmek yerine, müşterinin hissettiklerini anlayın.

> "Beklentilerinizi karşılayamadığımız için üzgünüz. Bu tür bir deneyim yaşamanız kabul edilemez."

## Kural 5: Somut Çözüm Sunun

Boş sözlerden kaçının. Somut adım atın:

> "Durumu mutfak şefimizle değerlendirdik ve yemek hazırlama sürecimizi revize ettik. Sizi tekrar ağırlamak ve farkı göstermeniz için bir ikramda bulunmak isteriz."

## Durum Bazlı Yanıt Şablonları

### 🍽️ Yemek Kalitesi Şikayeti:
> "Merhaba [İsim], yemek kalitemizin beklentilerinizi karşılayamaması bizi çok üzdü. Şefimizle durumu değerlendirdik ve [spesifik yemek] tarifini yeniden gözden geçirdik. Size tekrar güzel bir deneyim yaşatmak isteriz. Bir sonraki ziyaretinizde şefimizin özel menüsünü denemenizi rica ederiz — ikramımız olsun. 🙏"

### ⏰ Bekleme Süresi Şikayeti:
> "Merhaba [İsim], uzun bekleme süresinden dolayı özür dileriz. Yoğun saatlerimizde yaşanan bu aksaklık için ek personel aldık ve rezervasyon sistemimizi güncelledik. Bir sonraki ziyaretinizde çok daha iyi bir deneyim yaşayacağınızdan eminiz."

### 🛏️ Oda Temizliği Şikayeti (Otel):
> "Sayın [İsim], oda temizliğiyle ilgili yaşadığınız deneyim standartlarımızın çok altındadır ve bu durum için samimiyetle özür dileriz. Housekeeping ekibimizle acil bir değerlendirme toplantısı yaptık. Size özel bir konaklama teklifi sunmak isteriz — lütfen info@otel.com adresinden bize ulaşın."

### 👤 Personel Davranışı Şikayeti:
> "Merhaba [İsim], personelimizin davranışından dolayı yaşadığınız olumsuz deneyim için çok üzgünüz. Bu durum kesinlikle değerlerimize aykırıdır. İlgili ekip arkadaşımızla görüştük ve ek eğitim programı başlattık. Tekrar güveninizi kazanmak istiyoruz."

### 💰 Fiyat-Performans Şikayeti:
> "Merhaba [İsim], değerli geri bildiriminiz için teşekkür ederiz. Ödediğiniz ücrete karşılık beklentilerinizi karşılayamamak bizi üzer. Kaliteli malzeme ve deneyim sunmaya özen gösteriyoruz. Size özel bir indirim kodu göndermek isteriz — lütfen DM'den bize ulaşın."

### ⭐ Genel 1 Yıldız Şikayeti (Detaysız):
> "Merhaba [İsim], düşük puanınız bizi üzdü. Deneyiminizi daha iyi anlamak ve iyileştirmek istiyoruz. Lütfen bize doğrudan ulaşın ki sorunu çözebilelim: [telefon/email]. Her müşterimizin memnuniyeti bizim için çok değerli."

## Yapılmaması Gerekenler

1. **Müşteriyi suçlamayın** — "Daha dikkatli olmalıydınız" gibi ifadelerden kaçının
2. **Diğer müşterilerden bahsetmeyin** — "Binlerce müşterimiz memnun" savunmacıdır
3. **Kişisel almayın** — İşletme adına yanıt verin
4. **Silmeye çalışmayın** — Sahte yorum değilse, yanıtlayın

## İlgili Rehberler

- [Google Yorumlarına Nasıl Yanıt Verilir?](/blog/google-yorumlarina-nasil-yanit-verilir) — Genel yanıt rehberi
- [Google Yorum Cevap Örnekleri (20 Hazır Şablon)](/blog/google-yorum-cevap-ornekleri) — Her duruma uygun şablonlar
- [Yorumlara Neden Cevap Vermek Önemlidir?](/blog/yorumlara-neden-cevap-vermek-onemlidir) — Verilerle kanıtlanmış faydalar

## AI ile Olumsuz Yorum Yönetimi

[VoyageRespond](https://voyagerespond.com) ile olumsuz yorumları anında tespit edin, AI destekli profesyonel yanıtlar oluşturun ve müşteri kaybını önleyin.

- 🔴 **Olumsuz yorum anında bildirim** — Hiçbir şikayeti kaçırmayın
- 🤖 **AI yanıt önerileri** — Profesyonel, empatik ve çözüm odaklı
- 📊 **Duygu analizi** — Yorumların tonunu otomatik tespit edin

**Yorumlara manuel cevap vermek yerine otomatik yönetmek ister misiniz? [VoyageRespond'u 3 ay ücretsiz deneyin →](https://voyagerespond.com/onboarding)**
    `
  },
  {
    slug: "google-yorum-cevap-ornekleri",
    title: "Google Yorum Cevap Örnekleri: 20 Hazır Yanıt Şablonu (2026)",
    description: "Google yorumlarına kopyala-yapıştır hazır yanıt şablonları. Olumlu, olumsuz ve nötr yorumlar için 20 profesyonel cevap örneği.",
    ogTitle: "Google Yorum Cevap Örnekleri | 20 Hazır Şablon",
    ogDescription: "Google yorumlarına hazır yanıt şablonları. Restoran, otel ve hizmet sektörü için 20 profesyonel cevap örneği.",
    author: "VoyageRespond",
    publishedAt: "2026-03-18",
    category: "Yorum Yönetimi",
    readTime: "15 dk",
    keywords: ["google yorum cevap örnekleri", "yorum yanıt şablonu", "hazır yorum cevapları", "google yoruma cevap"],
    content: `
## Neden Hazır Şablonlara İhtiyacınız Var?

Her gün onlarca yorum alan bir işletme sahibi olarak, her birine sıfırdan yanıt yazmak saatlerinizi alır. Ancak **kopyala-yapıştır genel yanıtlar** da müşterileri soğutur.

İdeal çözüm: **Kişiselleştirilebilir şablonlar** kullanmak. Aşağıdaki 20 şablonu kendi işletmenize uyarlayın.

## ⭐ 5 Yıldız Yorumlar İçin (Olumlu)

### Şablon 1 — Genel Teşekkür
> "Merhaba [İsim], harika değerlendirmeniz için çok teşekkür ederiz! Sizin gibi misafirlerimizi ağırlamak bizim için büyük bir mutluluk. Tekrar görüşmek dileğiyle! 🙏"

### Şablon 2 — Yemek Övgüsü
> "[İsim] Bey/Hanım, [bahsedilen yemek] hakkındaki güzel sözleriniz şefimizi çok mutlu etti! Bu tarif tam da sizin gibi damak tadı gelişmiş misafirlerimiz için hazırlanıyor. Bir sonraki ziyaretinizde [yeni menü önerisi] denemenizi kesinlikle öneririz. 😊"

### Şablon 3 — Hizmet Övgüsü
> "Merhaba [İsim], ekibimiz hakkındaki güzel sözleriniz için teşekkürler! Geri bildiriminizi [çalışan adı] ile paylaştık, çok mutlu oldu. Sizi tekrar ağırlamak için sabırsızlanıyoruz! 🌟"

### Şablon 4 — Mekan/Atmosfer Övgüsü
> "[İsim], mekanımızın atmosferini beğenmenize çok sevindik! Her detay misafirlerimizin keyifli vakit geçirmesi için özenle tasarlandı. Bir sonraki ziyaretinizde [terasımızı/bahçemizi/VIP bölümümüzü] de denemenizi öneririz."

### Şablon 5 — Konaklama Övgüsü (Otel)
> "Sayın [İsim], otmizde keyifli bir konaklama geçirmenize çok sevindik! [Bahsedilen özellik] hakkındaki güzel yorumunuz ekibimizi motive etti. Bir sonraki [şehir] ziyaretinizde sizi tekrar ağırlamaktan onur duyarız. Sevgilerle 🏨"

## ⭐⭐⭐⭐ 4 Yıldız Yorumlar İçin

### Şablon 6 — İyileştirme Fırsatı
> "Merhaba [İsim], 4 yıldızlı değerlendirmeniz için teşekkürler! Deneyiminizi 5 yıldıza çıkarmak için ne yapabileceğimizi çok merak ediyoruz. Geri bildiriminiz bizim için değerli — lütfen bize detay paylaşın. 🎯"

### Şablon 7 — Yapıcı Eleştiri
> "[İsim], değerli geri bildiriminiz için teşekkürler. [Bahsedilen konu] hakkındaki önerinizi not aldık ve iyileştirme çalışmalarımıza dahil ettik. Bir sonraki ziyaretinizde farkı göreceğinizden eminiz!"

## ⭐⭐⭐ 3 Yıldız Yorumlar İçin (Nötr)

### Şablon 8 — Anlayışlı Yaklaşım
> "Merhaba [İsim], yorumunuz için teşekkür ederiz. Beklentilerinizi tam olarak karşılayamadığımızı görmek bizi üzüyor. [Spesifik konu] hakkında iyileştirmeler yapıyoruz. Tekrar denemenizi ve farkı görmenizi çok isteriz!"

### Şablon 9 — Detay İsteme
> "[İsim], değerlendirmeniz için teşekkürler. Deneyiminizi daha iyi anlayabilmemiz için bize [telefon/email] üzerinden ulaşır mısınız? Sizin için en iyi deneyimi sunmak istiyoruz."

## ⭐⭐ ve ⭐ Yorumlar İçin (Olumsuz)

### Şablon 10 — Genel Olumsuz
> "Merhaba [İsim], yaşadığınız deneyim için samimiyetle özür dileriz. Bu geri bildirim bizim için çok değerli. Durumu hemen ekibimizle değerlendirdik. Size doğrudan ulaşmak isteriz — lütfen bize [email/telefon] üzerinden yazın."

### Şablon 11 — Yemek Şikayeti
> "[İsim], yemek kalitemizle ilgili yaşadığınız hayal kırıklığı için çok üzgünüz. Şefimizle [bahsedilen yemek] hakkında görüştük ve düzeltici adımlar attık. Telafi olarak bir sonraki ziyaretinizde özel bir ikram sunmak isteriz."

### Şablon 12 — Bekleme/Hizmet Şikayeti
> "Merhaba [İsim], bekleme süresinden dolayı samimiyetle özür dileriz. Yoğun dönemlerde servis hızımızı artırmak için [ek personel/yeni sistem] devreye aldık. Lütfen bize bir şans daha verin — farkı göreceksiniz!"

### Şablon 13 — Fiyat Şikayeti
> "[İsim], geri bildiriminiz için teşekkürler. Kaliteli malzeme ve deneyim sunma konusundaki kararlılığımız fiyatlarımıza yansıyor. Ancak önerilerinizi dikkate alıyoruz. Size özel bir teklif sunmak isteriz — DM'den bize ulaşın."

### Şablon 14 — Hijyen Şikayeti
> "Sayın [İsim], hijyen konusundaki endişenizi son derece ciddiye alıyoruz. Temizlik ekibimizle acil bir değerlendirme yaptık ve kontrol listelerimizi güçlendirdik. Bu konuda tavizsiziz. Detayları paylaşmanız için lütfen bize ulaşın."

## 📝 Yanıtsız/Sadece Yıldız Yorumlar İçin

### Şablon 15 — Sadece 5 Yıldız (Yazısız)
> "Harika puanınız için çok teşekkür ederiz! 🌟 Deneyiminiz hakkında birkaç kelime yazarsanız, hem bize hem de diğer misafirlerimize çok yardımcı olur. Tekrar görüşmek üzere!"

### Şablon 16 — Sadece 1-2 Yıldız (Yazısız)
> "Düşük puanınız bizi üzdü. Deneyiminizi anlamak ve düzeltmek için bize ulaşmanızı rica ederiz: [email/telefon]. Her misafirimizin memnuniyeti bizim için önemli."

## 🌍 İngilizce Müşteriler İçin

### Şablon 17 — English Positive
> "Thank you so much for your wonderful review, [Name]! We're delighted you enjoyed your experience with us. We look forward to welcoming you again! 🙏"

### Şablon 18 — English Negative
> "Dear [Name], we sincerely apologize for your experience. This falls below our standards and we take your feedback very seriously. Please contact us at [email] so we can make things right."

## 🔄 Tekrar Gelen Müşteriler İçin

### Şablon 19 — Sadık Müşteri
> "[İsim], sadık misafirimiz olarak bizi yine değerlendirmenize çok mutlu olduk! Her ziyaretinizde daha iyisini sunmak için çalışıyoruz. Bir sonraki gelişinizde sizi sürpriz bir ikramla karşılamak isteriz! 💜"

### Şablon 20 — İkinci Şans
> "Merhaba [İsim], bize tekrar şans verdiğiniz için teşekkür ederiz! Bu sefer daha iyi bir deneyim yaşamanızı umuyoruz. Geri bildiriminiz bizim gelişim rehberimiz. 🙏"

## Şablonları Kişiselleştirme İpuçları

1. **[İsim] yerine gerçek adı yazın** — Kişiselleştirme güven oluşturur
2. **[Bahsedilen yemek/özellik] yerine spesifik detay ekleyin** — Okuduğunuzu gösterin
3. **Emojileri dozunda kullanın** — Profesyonel ama samimi bir ton yakalayın
4. **İletişim bilgisi paylaşın** — Offline çözüm fırsatı oluşturun

## İlgili Rehberler

- [Google Yorumlarına Nasıl Yanıt Verilir?](/blog/google-yorumlarina-nasil-yanit-verilir) — Adım adım rehber
- [Kötü Yorumlara Nasıl Cevap Verilir?](/blog/kotu-yorumlara-nasil-cevap-verilir) — Olumsuz yorum stratejisi
- [Restoran Yorum Cevapları (30 Şablon)](/restoran-yorum-cevaplari) — Restoranlara özel hazır yanıtlar
- [Otel Yorum Cevapları (30 Şablon)](/otel-yorum-cevaplari) — Otellere özel hazır yanıtlar

## AI ile Daha Hızlı Yanıt

Bu şablonlar işinizi kolaylaştırır, ancak **VoyageRespond** daha da ileriye gider. AI, her yorumu analiz ederek kişiselleştirilmiş, markanıza uygun yanıtlar üretir — şablon kullanmaya bile gerek kalmaz.

**Yorumlara manuel cevap vermek yerine otomatik yönetmek ister misiniz? [Ücretsiz deneyin →](https://voyagerespond.com/onboarding)**
    `
  },
  {
    slug: "yorumlara-neden-cevap-vermek-onemlidir",
    title: "Yorumlara Neden Cevap Vermek Önemlidir? Verilerle 7 Neden",
    description: "Müşteri yorumlarına cevap vermenin satış, güven ve SEO üzerindeki etkisini verilerle açıklıyoruz. İşletmeniz için neden kritik olduğunu öğrenin.",
    ogTitle: "Yorumlara Neden Cevap Vermek Önemlidir? | 7 Kanıtlanmış Neden",
    ogDescription: "Müşteri yorumlarına cevap vermenin satış, güven ve Google sıralaması üzerindeki etkisi. Araştırma verileriyle kanıtlanmış 7 neden.",
    author: "VoyageRespond",
    publishedAt: "2026-03-19",
    category: "Dijital İtibar",
    readTime: "7 dk",
    keywords: ["yorumlara cevap verme", "müşteri yorumları", "yorum yönetimi önemi", "google yorum cevaplama"],
    content: `
## Yorumları Yanıtsız Bırakmak Ne Kadara Mal Oluyor?

Bir araştırmaya göre, yorumlarını yanıtsız bırakan işletmeler yılda ortalama **%23 müşteri kaybı** yaşıyor. İşte yorumlara cevap vermenin neden kritik olduğunu gösteren 7 veri:

## 1. Güven ve Satış Artışı

- **%89 tüketici** satın alma öncesi yorumları okuyor
- **%72'si** işletmenin yorumlara verdiği yanıtları da okuyor
- Yanıt veren işletmeler **%35 daha fazla** güven kazanıyor

### Gerçek Etki:
Bir restoran, tüm yorumlarına yanıt vermeye başladıktan 3 ay sonra:
- Google Maps görüntülenmeleri **%42 arttı**
- Yeni müşteri oranı **%28 yükseldi**
- Ortalama sipariş tutarı **%15 büyüdü**

## 2. Google Sıralama Etkisi

Google, **aktif olarak yönetilen** işletme profillerini sıralamada öne çıkarır:

- Yanıt oranı yüksek işletmeler **yerel arama sonuçlarında** daha üst sıralarda
- Google'ın algoritması yanıtları **"engagement"** sinyali olarak değerlendirir
- Yanıtlarda doğal anahtar kelime kullanımı **SEO'yu güçlendirir**

## 3. Olumsuz Etki Azaltma

Yanıtsız olumsuz bir yorum, potansiyel müşterileri en çok soğutan faktördür:

| Senaryo | Müşteri Kaybetme Riski |
|---------|----------------------|
| Olumsuz yorum + Yanıtsız | %94 |
| Olumsuz yorum + Genel yanıt | %70 |
| Olumsuz yorum + Kişisel, çözüm odaklı yanıt | %33 |
| Olumsuz yorum + Yanıt + Güncelleme | %18 |

## 4. Müşteri Sadakati

Yorumuna yanıt alan müşterilerin:
- **%65'i** işletmeyi tekrar ziyaret ediyor
- **%55'i** arkadaşlarına tavsiye ediyor
- **%41'i** puanını yükseltiyor (olumsuz yorumdan sonra)

## 5. Rakip Avantajı

Sektör ortalamasında işletmelerin sadece **%36'sı** yorumlara düzenli yanıt veriyor. Yanıt vererek:
- Rakiplerinizin **%64'ünden** öne geçiyorsunuz
- **"Müşteri odaklı"** algısı oluşturuyorsunuz
- **Profesyonel ve güvenilir** bir marka imajı çiziyorsunuz

## 6. AI Asistanlarında Görünürlük

2026'da tüketicilerin **%47'si** ChatGPT, Gemini gibi AI asistanlarından işletme önerisi alıyor. AI asistanları:

- **Yorum kalitesi ve yanıt oranını** değerlendiriyor
- **Aktif yorum yönetimi** olan işletmeleri öne çıkarıyor
- **Tutarsız veya yanıtsız** işletmeleri listelemekten kaçınıyor

[AI Visibility Score hakkında daha fazla bilgi →](/blog/ai-gorunurluk-skoru-nedir)

## 7. Ücretsiz Pazarlama Fırsatı

Her yorum yanıtı aslında bir **ücretsiz pazarlama alanıdır**:

- Yeni ürün ve hizmetlerinizi **tanıtabilirsiniz**
- Yaklaşan kampanyalardan **bahsedebilirsiniz**
- **Marka kişiliğinizi** yansıtabilirsiniz

### Örnek:
> "Güzel sözleriniz için teşekkürler Ayşe Hanım! Bu ay yeni eklediğimiz taze makarna menümüzü de denemenizi şiddetle tavsiye ederiz. İlk deneyenlere özel %20 indirim var! 🍝"

## Nasıl Başlarsınız?

### Manuel Yönetim (Küçük İşletmeler):
1. Günde 15 dakika ayırın
2. Google Business uygulamasından bildirimleri açın
3. Şablonlar hazırlayın ([20 hazır şablon →](/blog/google-yorum-cevap-ornekleri))

### AI Destekli Yönetim (Büyüyen İşletmeler):
1. [VoyageRespond](https://voyagerespond.com/onboarding) ile hesap açın
2. Google Business profilinizi bağlayın
3. AI'ın önerdiği yanıtları onaylayın — bitii!

## İlgili Rehberler

- [Google Yorumlarına Nasıl Yanıt Verilir?](/blog/google-yorumlarina-nasil-yanit-verilir) — Adım adım rehber
- [Kötü Yorumlara Nasıl Cevap Verilir?](/blog/kotu-yorumlara-nasil-cevap-verilir) — Olumsuz yorum stratejisi
- [Otel ve Restoran Yorum Yönetimi Rehberi](/blog/otel-restoran-yorum-yonetimi-rehberi) — Sektöre özel stratejiler

## Sonuç

Yorumlara cevap vermek, **ücretsiz** ve **en etkili** dijital pazarlama stratejilerinden biridir. Her yanıtsız yorum, kaybedilen bir müşteri demektir.

**Yorumlara manuel cevap vermek yerine otomatik yönetmek ister misiniz? [VoyageRespond'u 3 ay ücretsiz deneyin →](https://voyagerespond.com/onboarding)**
    `
  },
  {
    slug: "google-yorum-cevap-araclari-2026",
    title: "Google Yorumlarına Cevap Vermek İçin En İyi Araçlar (2026)",
    description: "Google yorum yönetimi için en iyi AI araçlarını karşılaştırdık. VoyageRespond, Birdeye, Podium ve daha fazlası — hangisi sizin için en uygun?",
    ogTitle: "Google Yorum Cevap Araçları Karşılaştırması | 2026",
    ogDescription: "AI destekli yorum yönetim araçlarını karşılaştırın. Restoran ve oteller için en iyi çözümü bulun.",
    author: "VoyageRespond",
    publishedAt: "2026-03-19",
    category: "Araç Karşılaştırma",
    readTime: "10 dk",
    keywords: ["yorum yönetim aracı", "google yorum cevaplama aracı", "review management tool", "ai yorum yanıt sistemi", "voyagerespond"],
    content: `
## Neden Bir Yorum Yönetim Aracına İhtiyacınız Var?

Günde 10'dan fazla yorum alan bir işletmeyseniz, her birine manuel cevap vermek sürdürülebilir değildir. AI destekli yorum yönetim platformları bu süreci otomatikleştirir, zaman kazandırır ve tutarlı bir marka sesi oluşturmanıza yardımcı olur.

## Karşılaştırma Tablosu

| Özellik | VoyageRespond | Birdeye | Podium | ReviewTrackers |
|---------|:------------:|:-------:|:------:|:--------------:|
| AI Yanıt Önerileri | ✅ | ✅ | ❌ | ✅ |
| Türkçe Dil Desteği | ✅ | ❌ | ❌ | ❌ |
| Google Entegrasyonu | ✅ | ✅ | ✅ | ✅ |
| Booking/TripAdvisor | ✅ | ✅ | ❌ | ✅ |
| Duygu Analizi | ✅ | ✅ | ❌ | ✅ |
| AI Visibility Score | ✅ | ❌ | ❌ | ❌ |
| Çok Lokasyon Desteği | ✅ | ✅ | ✅ | ✅ |
| Ücretsiz Deneme | 3 ay | 14 gün | 14 gün | Demo |
| Aylık Başlangıç Fiyatı | Uygun | $$$$ | $$$$ | $$$ |

## 1. VoyageRespond — AI Destekli Yorum Yönetim Platformu

**En iyi:** Türkiye'deki restoran, kafe ve oteller için

VoyageRespond, AI destekli yorum yönetim platformu olarak Google, Booking ve TripAdvisor yorumlarını tek panelden yönetmenizi sağlar. Türkçe dil desteği ve sektöre özel AI modelleriyle öne çıkar.

### Avantajlar:
- **Tam Türkçe destek** — Arayüz ve AI yanıtlar Türkçe
- **AI duygu analizi** ile olumsuz yorumları anında tespit
- **AI Visibility Score** ile yapay zeka asistanlarında görünürlüğünüzü takip
- **3 ay ücretsiz deneme** — kredi kartı gerektirmez
- **Kolay kurulum** — 5 dakikada başlayın

### Dezavantajlar:
- Henüz Yelp entegrasyonu yok
- Enterprise plan yakında geliyor

[VoyageRespond'u ücretsiz deneyin →](https://voyagerespond.com/onboarding)

## 2. Birdeye

**En iyi:** ABD merkezli büyük işletmeler için

Birdeye, çok platformlu yorum yönetimi sunan kapsamlı bir platformdur.

### Avantajlar:
- Geniş platform entegrasyonu
- SMS ile yorum toplama
- Detaylı raporlama

### Dezavantajlar:
- **Türkçe desteği yok**
- Yüksek fiyatlı (aylık $300+)
- Karmaşık kurulum süreci

## 3. Podium

**En iyi:** ABD'deki küçük-orta işletmeler

Podium, müşteri iletişimi ve yorum toplama odaklı bir platformdur.

### Avantajlar:
- SMS tabanlı müşteri iletişimi
- Basit arayüz
- Ödeme entegrasyonu

### Dezavantajlar:
- **AI yanıt önerisi yok**
- Türkçe desteği yok
- Sadece Google ve Facebook desteği

## 4. ReviewTrackers

**En iyi:** Çok lokasyonlu zincir işletmeler

ReviewTrackers, büyük ölçekli yorum analizi ve raporlama konusunda güçlüdür.

### Avantajlar:
- Gelişmiş analitik
- 100+ platform entegrasyonu
- API erişimi

### Dezavantajlar:
- Türkçe desteği yok
- Yüksek başlangıç maliyeti
- Kurumsal odaklı, küçük işletmeler için karmaşık

## Hangi Aracı Seçmelisiniz?

### Türkiye'de restoran veya otel işletiyorsanız:
👉 **VoyageRespond** — Türkçe AI yanıtları, uygun fiyat ve kolay kullanım

### ABD'de büyük bir işletmeyseniz:
👉 **Birdeye** — Geniş platform desteği ve detaylı raporlama

### Basit bir çözüm arıyorsanız:
👉 **Podium** — SMS odaklı müşteri iletişimi

## İlgili Rehberler

- [Google Yorumlarına Nasıl Yanıt Verilir?](/blog/google-yorumlarina-nasil-yanit-verilir) — Adım adım rehber
- [AI Visibility Score Nedir?](/blog/ai-gorunurluk-skoru-nedir) — AI'da görünürlüğünüzü ölçün
- [Yorumlara Neden Cevap Vermek Önemlidir?](/blog/yorumlara-neden-cevap-vermek-onemlidir) — Verilerle kanıtlanmış faydalar

## Sonuç

Doğru yorum yönetim aracı, işletmenizin dijital itibarını korur ve müşteri kaybını önler. Türkiye pazarına özel AI destekli çözüm arıyorsanız, VoyageRespond'u 3 ay ücretsiz deneyebilirsiniz.

**[VoyageRespond'u ücretsiz deneyin →](https://voyagerespond.com/onboarding)**
    `
  },
  {
    slug: "chatgpt-ile-google-yorumlarina-nasil-cevap-yazilir",
    title: "ChatGPT ile Google Yorumlarına Nasıl Cevap Yazılır? (Adım Adım)",
    description: "ChatGPT kullanarak Google yorumlarına profesyonel cevap yazmanın yollarını öğrenin. Örnek promptlar, gerçek çıktılar ve otomatik çözüm.",
    ogTitle: "ChatGPT ile Google Yorumlarına Cevap Yazma Rehberi",
    ogDescription: "ChatGPT ile müşteri yorumlarına profesyonel cevap yazın. Adım adım rehber, örnek promptlar ve AI çözümü.",
    author: "VoyageRespond",
    publishedAt: "2026-03-19",
    category: "AI Rehberi",
    readTime: "8 dk",
    keywords: ["chatgpt yorum cevap", "chatgpt ile yorum yazma", "ai yorum yanıt", "google yorum chatgpt", "yapay zeka yorum cevabı"],
    content: `
## ChatGPT ile Yorum Cevabı Yazmak Mümkün mü?

Evet! ChatGPT, Google yorumlarına profesyonel cevap yazmak için güçlü bir araçtır. Doğru promptlar kullanarak saniyeler içinde kişiselleştirilmiş, empatik ve profesyonel yanıtlar oluşturabilirsiniz.

## Adım 1: Doğru Prompt Yazın

İşte en etkili prompt şablonu:

### Prompt Örneği 1 — Olumlu Yorum:

> "Bir restoran sahibiyim. Aşağıdaki olumlu Google yorumuna profesyonel, samimi ve kısa bir yanıt yaz. Müşterinin adını kullan ve yeni menümüzden bahset.
>
> Yorum: 'Harika bir akşam yemeği deneyimiydi! Özellikle kuzu tandır muhteşemdi. Servis de çok hızlıydı. — Mehmet'"

### ChatGPT Çıktısı:

> "Merhaba Mehmet Bey, harika değerlendirmeniz için çok teşekkür ederiz! Kuzu tandırımızın sizin gibi damak tadı gelişmiş misafirlerimizi mutlu etmesine bayıldık 🙏 Bir sonraki ziyaretinizde yeni eklediğimiz Akdeniz menümüzü de denemenizi şiddetle tavsiye ederiz. Tekrar ağırlamaktan mutluluk duyarız!"

## Adım 2: Olumsuz Yorumlar İçin Prompt

### Prompt Örneği 2 — Olumsuz Yorum:

> "Bir otel işletiyorum. Aşağıdaki olumsuz Google yorumuna profesyonel, empatik ve çözüm odaklı bir yanıt yaz. Savunmaya geçme, özür dile ve iletişim bilgisi paylaş.
>
> Yorum: 'Oda temizliği berbattı. Banyoda saç teli vardı, havlular ıslaktı. Bu fiyata bu hizmet kabul edilemez. — Ayşe'"

### ChatGPT Çıktısı:

> "Sayın Ayşe Hanım, yaşadığınız deneyim için samimiyetle özür dileriz. Oda temizliği konusundaki standartlarımız çok yüksektir ve bahsettiğiniz durum kesinlikle kabul edilemez. Housekeeping ekibimizle acil bir değerlendirme yaptık ve kontrol süreçlerimizi güçlendirdik. Size özel bir konaklama teklifi sunmak isteriz — lütfen info@otel.com adresinden bize ulaşın. 🙏"

## Adım 3: Gelişmiş Promptlar

### Prompt Örneği 3 — Ton Belirtme:

> "Restoran sahibi olarak bu yoruma Türkçe, arkadaşça ama profesyonel bir tonda yanıt yaz. Emoji kullan. 150 kelimeyi geçme."

### Prompt Örneği 4 — Çoklu Yorum:

> "Aşağıdaki 5 Google yorumuna ayrı ayrı yanıt yaz. Her yanıt kısa, kişisel ve profesyonel olsun. İşletmem bir kafe.
>
> 1. 'Kahveler harika!' — Ali
> 2. 'Bekleme süresi çok uzundu.' — Zeynep
> 3. '⭐⭐⭐⭐⭐' — (yazısız)
> 4. 'Cheesecake muhteşemdi ama fiyatlar biraz yüksek.' — Deniz
> 5. 'Garsonlar çok ilgisizdi.' — Murat"

## ChatGPT'nin Sınırları

ChatGPT güçlü bir araç olsa da bazı sınırları vardır:

- **Her seferinde prompt yazmanız gerekir** — Zaman alıcı
- **Marka tonunuzu hatırlamaz** — Her sohbette yeniden tanımlamalısınız
- **Yorum bildirimi yapmaz** — Yorumları kendiniz takip etmelisiniz
- **Duygu analizi yapamaz** — Hangi yorumun acil olduğunu bilemezsiniz
- **Doğrudan Google'a cevap gönderemez** — Kopyala-yapıştır gerekir

## Bunu Otomatik Yapmak İçin: VoyageRespond

ChatGPT ile yorum cevabı yazmak iyi bir başlangıçtır, ancak bunu **ölçeklenebilir ve sürdürülebilir** yapmak için özel bir AI yorum yönetim platformu kullanmak çok daha etkilidir.

**VoyageRespond**, AI destekli yorum yönetim platformu olarak ChatGPT'nin yaptığı her şeyi otomatik yapar — ve çok daha fazlasını:

| Özellik | ChatGPT | VoyageRespond |
|---------|:-------:|:-------------:|
| AI yanıt önerisi | ✅ (prompt gerekir) | ✅ (otomatik) |
| Yorum bildirimi | ❌ | ✅ |
| Duygu analizi | ❌ | ✅ |
| Marka tonu hafızası | ❌ | ✅ |
| Google'a direkt yanıt | ❌ | ✅ |
| Çoklu platform | ❌ | ✅ |
| AI Visibility Score | ❌ | ✅ |

## İlgili Rehberler

- [Google Yorumlarına Cevap Vermek İçin En İyi Araçlar](/blog/google-yorum-cevap-araclari-2026) — AI araç karşılaştırması
- [Google Yorumlarına Nasıl Yanıt Verilir?](/blog/google-yorumlarina-nasil-yanit-verilir) — Adım adım rehber
- [Google Yorum Cevap Örnekleri (20 Hazır Şablon)](/blog/google-yorum-cevap-ornekleri) — Hazır yanıt şablonları

## Sonuç

ChatGPT, Google yorumlarına hızlı cevap yazmak için harika bir başlangıç noktasıdır. Ancak işletmeniz büyüdükçe, her yoruma manuel prompt yazmak sürdürülebilir olmaz. VoyageRespond gibi AI destekli yorum yönetim platformlarıyla bu süreci tamamen otomatikleştirin.

**[VoyageRespond'u 3 ay ücretsiz deneyin →](https://voyagerespond.com/onboarding)**
    `
  }
];
const englishPosts = [
  {
    slug: "how-to-respond-professionally-to-a-bad-review",
    metaTitle: "How to Respond Professionally to a Bad Review (With Templates) | VoyageRespond",
    metaDescription: "Learn the 5-step framework for responding to negative reviews professionally. Includes copy-paste templates for every situation. Used by hotels, restaurants, and clinics.",
    title: "How to Respond Professionally to a Bad Review",
    description: "A practical framework for replying to negative reviews with empathy, professionalism, and a clear path to resolution.",
    ogTitle: "How to Respond Professionally to a Bad Review | VoyageRespond",
    ogDescription: "Learn the exact framework top brands use to turn negative reviews into loyal customers.",
    author: "VoyageRespond",
    publishedAt: "2026-04-20",
    category: "Review Management",
    readTime: "7 min",
    keywords: ["respond to bad review", "negative review reply", "professional review response"],
    content: `
Every business gets a bad review eventually. The question isn't whether you'll receive one — it's how you respond to it. A professional, thoughtful response to a negative review can actually increase trust with potential customers more than a perfect 5-star rating.

## Why Your Response Matters More Than the Review Itself

Studies show that **97% of consumers** read reviews before visiting a business. But here's what most business owners miss: **88% of customers** say a business's response to a negative review influences their decision just as much as the review itself.

When someone leaves a bad review, three audiences are watching:

- The unhappy customer
- Future potential customers
- Google's ranking algorithm

## The 5-Step Framework for Responding to Negative Reviews

### Step 1: Respond within 24 hours
Speed signals that you take feedback seriously. Businesses that respond quickly are perceived as more attentive and trustworthy.

### Step 2: Thank the reviewer
Always start by acknowledging the feedback — even if it's harsh. *"Thank you for taking the time to share your experience"* disarms hostility and shows maturity.

### Step 3: Acknowledge the issue without excuses
Don't say "but" — it cancels everything before it. Instead: *"We're sorry your experience didn't meet our standards. This is not the level of service we aim to provide."*

### Step 4: Take it offline
Provide a direct contact: *"Please reach out to us at [email] so we can make this right."* This shows accountability and prevents a public back-and-forth.

### Step 5: Close with a forward-looking statement
*"We hope to have the opportunity to serve you better in the future."* Brief, professional, human.

## What NOT to Do

- ❌ Never argue with the reviewer
- ❌ Never copy-paste the same response to every review
- ❌ Never offer refunds or freebies publicly
- ❌ Never ignore a negative review — silence is the worst response

## Example Response Template

> "Thank you for sharing your feedback. We sincerely apologize that your experience fell short of what we strive to deliver. We take all feedback seriously and would love the opportunity to make things right. Please contact us directly at [email/phone] so we can address your concerns personally. We hope to welcome you back soon."

## The Smarter Way: AI-Powered Review Responses

Manually responding to every review across Google, Booking.com, TripAdvisor, and 80+ other platforms is a full-time job. Tools like [VoyageRespond](https://voyagerespond.com) use AI to generate personalized, on-brand responses in seconds — so you never miss a review, and every response sounds human.

**[Start your free trial →](https://voyagerespond.com/onboarding)**
    `
  },
  {
    slug: "what-should-a-company-do-after-getting-a-bad-review",
    metaTitle: "What Should a Company Do After Getting a Bad Review? | VoyageRespond",
    metaDescription: "Got a bad review? Here's exactly what to do in the next 24 hours — from investigating the complaint to responding publicly and preventing it from happening again.",
    title: "What Should a Company Do After Getting a Bad Review?",
    description: "The exact playbook to follow in the first 24 hours after a negative review lands — from triage to public reply to internal follow-up.",
    ogTitle: "What to Do After Getting a Bad Review | VoyageRespond",
    ogDescription: "A 24-hour playbook for handling negative reviews the right way.",
    author: "VoyageRespond",
    publishedAt: "2026-04-21",
    category: "Review Management",
    readTime: "6 min",
    keywords: ["bad review playbook", "respond to negative review", "review crisis"],
    content: `
Getting a bad review stings. But your next move in the following 24 hours can either damage your reputation further — or turn a critic into a loyal customer.

## Step 1: Don't Panic

One bad review doesn't define your business. In fact, a mix of positive and negative reviews makes your profile look more authentic. Consumers are suspicious of businesses with **only 5-star reviews**.

## Step 2: Investigate Internally

Before responding, find out what actually happened. Talk to the staff involved. Review the transaction. Was the complaint valid? Understanding the root cause helps you respond accurately and prevent it from happening again.

## Step 3: Respond Publicly (Fast)

See our full guide on [how to respond professionally to a bad review](/blog/how-to-respond-professionally-to-a-bad-review). The short version: be empathetic, be brief, take it offline.

## Step 4: Fix the Underlying Problem

A response without action is just PR. If three customers complain about slow service, fix the process. Reviews are free market research — use them.

## Step 5: Generate More Positive Reviews

The best antidote to a bad review is more good ones. Proactively ask happy customers to share their experience. A business with 200 reviews and a 4.4 average looks far more trustworthy than one with 10 reviews and a 5.0.

## Step 6: Monitor Your Reputation Continuously

You can't manage what you don't measure. Set up alerts so you're notified the moment a new review goes live — across all platforms.

[VoyageRespond](https://voyagerespond.com) monitors **80+ review platforms** in real time, so you always know what customers are saying — before it becomes a problem.

**[Start your free trial →](https://voyagerespond.com/onboarding)**
    `
  },
  {
    slug: "how-do-companies-recover-from-bad-reviews",
    metaTitle: "How Do Companies Recover From Bad Reviews? | VoyageRespond",
    metaDescription: "Discover the proven recovery timeline and strategies businesses use to bounce back from negative reviews — with a real case study of a restaurant that went from 3.2 to 4.4 stars.",
    title: "How Do Companies Recover From Bad Reviews?",
    description: "Real recovery strategies used by hotels, restaurants and SaaS brands to rebuild trust after a wave of negative feedback.",
    ogTitle: "How Companies Recover From Bad Reviews | VoyageRespond",
    ogDescription: "Proven strategies to repair your reputation and win back customers.",
    author: "VoyageRespond",
    publishedAt: "2026-04-22",
    category: "Reputation",
    readTime: "8 min",
    keywords: ["recover from bad reviews", "reputation recovery", "review damage control"],
    content: `
Bad reviews are not a death sentence. Some of the world's most successful businesses have weathered brutal online criticism and come out stronger. Here's how they did it — and how you can too.

## The Recovery Timeline

Recovery doesn't happen overnight. Here's a realistic timeline:

- **Week 1–2:** Respond to all negative reviews. Acknowledge. Apologize. Act.
- **Month 1:** Fix the operational issues causing complaints. Retrain staff if needed.
- **Month 2–3:** Actively request reviews from satisfied customers to raise your average.
- **Month 3–6:** Your rating visibly improves. New customers start coming in based on the improved reputation.

## Case Study: The Restaurant That Turned It Around

A restaurant in a competitive city center was sitting at **3.2 stars** on Google after a rough few months with inconsistent service. They took three steps:

1. Responded to every existing negative review with a genuine apology
2. Trained staff on the specific complaints mentioned in reviews
3. Started sending post-visit SMS asking happy diners to share their experience

Within 90 days, their rating climbed to **4.4**. Foot traffic increased by **30%**.

## The Role of Volume

A Harvard Business School study found that a one-star increase in Yelp rating leads to a **5–9% increase in revenue**. The math is simple: more positive reviews = higher rating = more customers.

## Tools That Speed Up Recovery

Manually managing reputation across dozens of platforms is exhausting. [VoyageRespond](https://voyagerespond.com) aggregates all your reviews in one dashboard, generates AI responses, and helps you systematically collect more positive reviews — compressing a 6-month recovery into weeks.

**[Start your free trial →](https://voyagerespond.com/onboarding)**
    `
  },
  {
    slug: "how-long-does-it-take-to-fix-a-bad-reputation",
    metaTitle: "How Long Does It Take to Fix a Company's Bad Reputation? | VoyageRespond",
    metaDescription: "The honest answer: it depends. See realistic timelines for reputation recovery based on how many reviews you have, which platforms are affected, and how fast you act.",
    title: "How Long Does It Take to Fix a Bad Reputation?",
    description: "Realistic timelines for reputation recovery, the math behind your average rating, and what actually moves the needle.",
    ogTitle: "How Long to Fix a Bad Online Reputation | VoyageRespond",
    ogDescription: "Realistic timelines and tactics for repairing your online reputation.",
    author: "VoyageRespond",
    publishedAt: "2026-04-23",
    category: "Reputation",
    readTime: "6 min",
    keywords: ["fix bad reputation", "reputation recovery timeline", "improve rating"],
    content: `
This is one of the most common questions business owners ask after a reputation crisis. The honest answer: it depends — but it's almost always faster than you think if you take the right steps.

## The Variables That Affect Recovery Time

### 1. How many reviews you have
If you have 10 reviews and 3 are negative, your rating tanks. If you have 200 reviews and 3 are negative, it barely moves. **Volume is your buffer.**

### 2. How actively you solicit new reviews
Passive businesses wait for reviews to come in. Active businesses ask every satisfied customer. The difference in recovery speed is dramatic.

### 3. How quickly you fix the underlying issue
If you keep getting the same complaints, no amount of review management will help. **Fix the product or service first.**

### 4. Which platforms are affected
Google is hardest to recover on because it has the most visibility. TripAdvisor and Booking.com have different weighting mechanisms.

## Realistic Timelines

| Situation | Recovery Time |
|-----------|---------------|
| 1–2 bad reviews, otherwise positive | 2–4 weeks |
| Significant rating drop (e.g., 4.5 → 3.8) | 2–4 months |
| Major PR crisis with media coverage | 6–12 months |
| Ongoing service issues (unfixed) | Indefinitely |

## The Fastest Path to Recovery

1. Respond to every existing bad review today
2. Ask your last 50 happy customers for a review this week
3. Fix whatever caused the complaints
4. Set up automated review collection going forward

[VoyageRespond](https://voyagerespond.com) automates steps 1, 2, and 4 — so your team can focus on step 3.

**[Start your free trial →](https://voyagerespond.com/onboarding)**
    `
  },
  {
    slug: "how-to-get-better-customer-reviews",
    metaTitle: "How to Get Better Customer Reviews for Your Business (7 Proven Ways) | VoyageRespond",
    metaDescription: "More reviews. Better reviews. Here are 7 proven strategies to systematically collect positive customer reviews — without violating any platform policies.",
    title: "How to Get Better Customer Reviews for Your Business",
    description: "Beyond just asking — the messaging, timing and channels that consistently produce higher-quality, more detailed customer reviews.",
    ogTitle: "How to Get Better Customer Reviews | VoyageRespond",
    ogDescription: "Strategies for collecting more detailed, higher-quality customer reviews.",
    author: "VoyageRespond",
    publishedAt: "2026-04-24",
    category: "Review Generation",
    readTime: "7 min",
    keywords: ["get better reviews", "customer review quality", "review requests"],
    content: `
More reviews. Better reviews. This is the single highest-ROI reputation activity a business can do. Here's how to do it systematically.

## Why Most Businesses Struggle to Get Reviews

The problem isn't that your customers are unhappy. It's that **happy customers rarely think to leave a review unless prompted**. Unhappy customers, however, are highly motivated to share their experience.

This creates a natural negativity bias in your review profile — unless you actively correct it.

## 7 Proven Ways to Get More Positive Reviews

### 1. Ask at the right moment
The best time to ask is immediately after a positive experience — at checkout, after a successful appointment, after a delivery. **Timing is everything.**

### 2. Make it effortless
Send a direct link to your Google review page. The fewer clicks, the higher the conversion. A QR code at the front desk works exceptionally well.

### 3. Use SMS, not just email
SMS review requests have a **5–8x higher open rate** than email. A simple text saying *"We'd love your feedback"* with a direct link gets results.

### 4. Train your staff to ask
A personal ask from a staff member dramatically increases review rates. *"If you enjoyed your stay, it would mean a lot if you left us a review"* — simple and effective.

### 5. Automate post-visit follow-ups
Set up an automated message to go out 24 hours after every visit or purchase. Consistency compounds over time.

### 6. Respond to existing reviews
Businesses that respond to reviews receive **12% more reviews** on average. Responding signals that you read and value feedback — which encourages more people to write.

### 7. Focus on specific platforms
Don't spread yourself thin. Identify the 2–3 platforms most important for your industry (Google + Booking.com for hotels, Google + TripAdvisor for restaurants) and focus there.

## The Compounding Effect

Going from 50 to 200 reviews doesn't just raise your rating — it fundamentally changes how potential customers perceive you. **More reviews = more trust = more conversions.**

[VoyageRespond](https://voyagerespond.com) automates the entire review collection process across 80+ platforms, so you never have to manually follow up again.

**[Start your free trial →](https://voyagerespond.com/onboarding)**
    `
  },
  {
    slug: "how-do-review-scores-impact-businesses",
    metaTitle: "How Do Review Scores Actually Impact Businesses? | VoyageRespond",
    metaDescription: "Review scores affect your revenue, Google ranking, and customer trust more than you think. See the data behind the impact — and what a one-star improvement is actually worth.",
    title: "How Do Review Scores Actually Impact Businesses?",
    description: "The data behind star ratings — how a single tenth of a star can change revenue, search rankings and conversion rate.",
    ogTitle: "How Review Scores Impact Business Revenue | VoyageRespond",
    ogDescription: "Data-backed look at how star ratings affect revenue, SEO and conversion.",
    author: "VoyageRespond",
    publishedAt: "2026-04-25",
    category: "Insights",
    readTime: "8 min",
    keywords: ["review scores", "star rating impact", "rating revenue"],
    content: `
Review scores aren't just vanity metrics. They directly affect your revenue, your search ranking, and your ability to attract new customers. Here's the data.

## The Revenue Impact

- A one-star increase in your average rating correlates with a **5–9% increase in revenue** (Harvard Business School)
- Businesses with a 4.5+ rating get **70% more clicks** than those with a 3.5 rating
- **31% of consumers** won't use a business with less than 4.5 stars — up from 17% just a few years ago

## The SEO Impact

Google uses review signals as a significant local ranking factor. Specifically:

- **Review volume:** More reviews = more ranking signals
- **Review recency:** Fresh reviews outweigh old ones
- **Response rate:** Businesses that respond rank higher
- **Keyword mentions:** Reviews that mention your services help you appear for relevant searches

Appearing in Google's local "3-pack" (the top 3 map results) drives **126% more traffic** than positions below it. Reviews are one of the primary factors that get you there.

## The Trust Impact

- **97% of consumers** read reviews before choosing a local business
- **89% of customers** prefer businesses that respond to all reviews
- **73% of consumers** don't trust reviews older than one month

## The Competitive Impact

Only **5% of businesses** actively respond to their reviews. This means that simply having a consistent response strategy puts you ahead of 95% of your competitors.

The businesses winning on reputation aren't necessarily delivering better service — they're managing their reputation more actively.

[VoyageRespond](https://voyagerespond.com) helps you join that top 5% — without spending hours on it every week.

**[Start your free trial →](https://voyagerespond.com/onboarding)**
    `
  },
  {
    slug: "how-fast-should-companies-respond-to-bad-reviews",
    metaTitle: "How Fast Should Companies Respond to Bad Reviews? | VoyageRespond",
    metaDescription: "53% of customers expect a response within 7 days — but most businesses take over 2 days or never respond at all. Here's why speed matters and how to fix your response time.",
    title: "How Fast Do Companies Respond to Bad Reviews?",
    description: "The benchmark response times that customers and Google's algorithm actually reward — and how to hit them at scale.",
    ogTitle: "How Fast to Respond to Bad Reviews | VoyageRespond",
    ogDescription: "Industry benchmarks for review response time and how to hit them.",
    author: "VoyageRespond",
    publishedAt: "2026-04-26",
    category: "Review Management",
    readTime: "5 min",
    keywords: ["review response time", "respond to bad review fast", "review SLA"],
    content: `
Response speed is one of the most visible signals of a business's commitment to customer service. Here's what the data says — and what it means for your reputation strategy.

## The Industry Benchmark

- The average business takes **over 2 days** to respond to a negative review
- **53% of customers** expect a response within 7 days
- Most customers who leave a negative review expect a response within **24 hours**
- Only **5% of businesses** respond to reviews at all

This gap between customer expectation and business behavior is a massive opportunity.

## Why Speed Matters

When a potential customer reads a negative review, the first thing they look for is the response. A fast, professional reply signals:

- You're paying attention
- You care about customer experience
- You're competent and organized

A slow or absent response signals the opposite — and may cost you more business than the original bad review.

## The 24-Hour Rule

Commit to responding to every review **within 24 hours**. For negative reviews, this is non-negotiable. For positive reviews, a response within 48–72 hours is acceptable.

## Why Most Businesses Fall Behind

The honest reason businesses don't respond quickly is bandwidth. A hotel with reviews on Google, Booking.com, TripAdvisor, Expedia, and Hotels.com is managing 5 different inboxes. A restaurant chain with 10 locations has an even bigger challenge.

[VoyageRespond](https://voyagerespond.com) solves this by centralizing all your reviews in one dashboard and using AI to draft responses instantly — so your team can review and send in seconds, not hours.

**[Start your free trial →](https://voyagerespond.com/onboarding)**
    `
  },
  {
    slug: "how-to-get-more-google-reviews",
    metaTitle: "How to Get More Google Reviews for Your Business (Step-by-Step) | VoyageRespond",
    metaDescription: "A practical, policy-compliant system for collecting more Google reviews. Includes QR code tips, SMS templates, and the compounding effect of consistent review collection.",
    title: "How to Get More Google Reviews for Your Business",
    description: "Compliant, scalable tactics for collecting more Google reviews — including QR codes, post-stay emails and SMS automations.",
    ogTitle: "How to Get More Google Reviews | VoyageRespond",
    ogDescription: "Compliant, scalable ways to grow your Google review count.",
    author: "VoyageRespond",
    publishedAt: "2026-04-27",
    category: "Review Generation",
    readTime: "7 min",
    keywords: ["get more google reviews", "google review requests", "qr code reviews"],
    content: `
Google reviews are the single most important review currency for local businesses. Here's a practical, step-by-step system for collecting more of them — without violating Google's policies.

## Why Google Reviews Specifically

- **81% of consumers** use Google to evaluate local businesses
- Google reviews directly influence your local search ranking
- Google's local "3-pack" drives the majority of local business clicks
- **72% of hotel bookings** happen within 48 hours of a Google search

## What NOT to Do

First, let's clear up the illegal and policy-violating tactics:

- ❌ Never buy reviews
- ❌ Never offer discounts or incentives in exchange for reviews
- ❌ Never ask employees to leave reviews
- ❌ Never use review gating (only sending happy customers to leave reviews)

These tactics risk getting your Google Business Profile suspended.

## The Right Way to Get More Google Reviews

### 1. Create a short review link
Go to your Google Business Profile, click "Get more reviews," and copy your review link. Shorten it with bit.ly. Share it everywhere.

### 2. Add a QR code at your location
Print a simple card or sign: *"Enjoyed your experience? Leave us a review."* Place it at checkout, in menus, on receipts.

### 3. Send post-visit requests via SMS
24 hours after a visit: *"Hi [Name], thanks for visiting [Business]. If you enjoyed your experience, we'd love a Google review: [link]"*

### 4. Include it in your email footer
A simple "Leave us a Google review" link in every transactional email adds up over time.

### 5. Ask verbally at checkout
Train staff to say: *"If you enjoyed your experience today, we'd really appreciate a Google review — it helps us a lot."*

## The Compounding Effect

Going from 20 to 100 Google reviews doesn't just raise your rating — it improves your local search ranking, increases click-through rates, and builds the trust that converts browsers into customers.

[VoyageRespond](https://voyagerespond.com) automates SMS, email, and QR-based review requests across all your locations.

**[Start your free trial →](https://voyagerespond.com/onboarding)**
    `
  },
  {
    slug: "what-is-review-management-software",
    metaTitle: "What Is Review Management Software? (And Do You Need It?) | VoyageRespond",
    metaDescription: "Review management software centralizes all your reviews in one place. Find out what it does, who needs it, and whether the ROI makes sense for your business.",
    title: "What Is Review Management Software? (And Do You Need It?)",
    description: "A clear breakdown of what review management software does, the must-have features, and how to choose the right tool for your business.",
    ogTitle: "What Is Review Management Software? | VoyageRespond",
    ogDescription: "What review management software does and how to choose the right one.",
    author: "VoyageRespond",
    publishedAt: "2026-04-28",
    category: "Tools",
    readTime: "6 min",
    keywords: ["review management software", "reputation tools", "review platform"],
    content: `
If you're managing reviews manually — logging into each platform, copying responses, hoping you don't miss anything — you're already behind. Here's what review management software is, what it does, and whether it's worth it for your business.

## What Is Review Management Software?

Review management software is a tool that **centralizes all your customer reviews** from multiple platforms into a single dashboard. Instead of checking Google, TripAdvisor, Booking.com, Yelp, and dozens of other sites separately, you see everything in one place.

Core features typically include:

- **Unified inbox:** All reviews from all platforms in one view
- **AI response generation:** Draft professional responses in seconds
- **Review monitoring:** Get notified when a new review goes live
- **Analytics:** Track your rating trends, response rates, and sentiment
- **Review collection:** Tools to proactively gather more reviews

## Who Needs It?

You probably need review management software if:

- You're listed on more than 3 review platforms
- You receive more than 10 reviews per month
- You manage multiple locations
- Responding to reviews takes more than 1 hour per week
- You've ever missed a negative review for more than 24 hours

You might not need it yet if:

- You're a brand new business with very few reviews
- You're only on Google and respond within the hour

## The ROI Case

The average hospitality business spends **3–5 hours per week** managing reviews manually. At any reasonable hourly cost, review management software pays for itself quickly — while also improving response quality and speed.

## VoyageRespond: Built for Hospitality and Service Businesses

[VoyageRespond](https://voyagerespond.com) covers **80+ review platforms** including Google, Booking.com, TripAdvisor, HolidayCheck, Hotels.com, and more. With AI-powered response generation and a unified dashboard, it's built specifically for hotels, restaurants, clinics, and service businesses that take their reputation seriously.

**[Start your free trial →](https://voyagerespond.com/onboarding)**
    `
  },
  {
    slug: "how-to-improve-your-google-rating",
    metaTitle: "How to Improve Your Google Rating: A Step-by-Step Guide | VoyageRespond",
    metaDescription: "Your Google rating is the first thing customers see. Here's a practical guide to improving it — with realistic timelines and the exact steps to take starting today.",
    title: "How to Improve Your Google Rating",
    description: "Step-by-step strategies — from operational fixes to review velocity tactics — that move your Google star rating up and keep it there.",
    ogTitle: "How to Improve Your Google Rating | VoyageRespond",
    ogDescription: "Practical strategies for raising your Google star rating.",
    author: "VoyageRespond",
    publishedAt: "2026-04-29",
    category: "Reputation",
    readTime: "8 min",
    keywords: ["improve google rating", "raise star rating", "google reviews"],
    content: `
Your Google rating is one of the first things a potential customer sees. Here's a practical, step-by-step guide to improving it — without shortcuts.

## Understand How Google Ratings Work

Your Google rating is a weighted average of all your reviews. Google gives more weight to:

- **Recent reviews** (last 30–90 days matter most)
- **Reviews with text** (not just stars)
- **Verified reviewers** with active Google accounts

This means your path to a higher rating runs through fresh, detailed reviews — not just more reviews.

## Step 1: Respond to Every Existing Review

Start today. Go through every review you've ever received and respond. For negative ones, use our [professional response framework](/blog/how-to-respond-professionally-to-a-bad-review). For positive ones, a brief, genuine thank-you is enough.

This signals to Google that you're an active, engaged business.

## Step 2: Identify Your Rating Target

- **Below 3.5:** You have a serious problem. Fix the service issue first, then address reviews.
- **3.5–4.0:** You need a systematic influx of positive reviews.
- **4.0–4.4:** You're close. Focus on volume and recency.
- **4.5+:** Maintain. Don't get complacent.

## Step 3: Fix What Customers Are Complaining About

Read your negative reviews. Find the patterns. If 5 reviews mention slow service, fix the process. If 3 reviews mention unfriendly staff, address it in training. **Reviews are free consulting.**

## Step 4: Systematically Collect New Reviews

Use the system outlined in our guide on [how to get more Google reviews](/blog/how-to-get-more-google-reviews). Consistency is key — 2–3 new reviews per week compounds significantly over a quarter.

## Step 5: Use Keywords in Your Responses

When you respond to reviews, naturally include your business type and location: *"Thank you for choosing [Business Name] for your stay in [City]."* This helps Google understand your relevance for local searches.

## The Realistic Timeline

- **1 month:** Your response rate improves, Google notices
- **3 months:** New reviews start shifting your average
- **6 months:** Meaningful rating improvement visible
- **12 months:** Compounding effect kicks in — higher rating drives more customers, who leave more reviews

[VoyageRespond](https://voyagerespond.com) automates response and collection so this 12-month flywheel runs on autopilot.

**[Start your free trial →](https://voyagerespond.com/onboarding)**
    `
  },
  {
    slug: "how-to-respond-to-negative-reviews",
    metaTitle: "How to Respond to Negative Reviews: The Complete Guide (With Templates) | VoyageRespond",
    metaDescription: "The ultimate guide to responding to negative reviews — with copy-paste templates for every type of complaint. Used by hotels, restaurants, clinics, and service businesses worldwide.",
    title: "How to Respond to Negative Reviews: The Complete Guide",
    description: "The complete guide to writing negative review replies that protect your brand, satisfy the customer and reassure future buyers.",
    ogTitle: "How to Respond to Negative Reviews | VoyageRespond",
    ogDescription: "Complete guide to writing negative review replies that win back customers.",
    author: "VoyageRespond",
    publishedAt: "2026-04-30",
    category: "Review Management",
    readTime: "8 min",
    keywords: ["respond to negative reviews", "negative review reply", "review responses"],
    content: `
Negative reviews are inevitable. How you handle them defines your brand. This is the most comprehensive guide to responding to negative reviews — with templates you can use today.

## The Psychology of a Negative Review

Most negative reviews aren't written by unreasonable people. They're written by customers who **felt unheard**. Something went wrong, they tried to resolve it (or didn't know how), and they turned to public feedback as a last resort.

Understanding this changes how you respond. You're not arguing with a critic — you're talking to someone who *wanted* to like your business.

## The Golden Rules of Negative Review Response

1. **Always respond** — silence is interpreted as indifference
2. **Respond fast** — within 24 hours for negative reviews
3. **Stay calm** — never respond when emotional
4. **Be specific** — generic responses feel dismissive
5. **Take it offline** — resolve the details privately
6. **Never argue** — you cannot win a public argument

## Response Templates by Review Type

### Template 1: Legitimate complaint

> "Thank you for your feedback, [Name]. We're genuinely sorry to hear your experience didn't meet our standards — this is not the service we aim to provide. We'd love the opportunity to make this right. Please reach out to us at [contact] and we'll personally ensure your next experience is much better."

### Template 2: Partially valid complaint

> "Thank you for taking the time to share your experience. We're sorry to hear about [specific issue]. While we're proud of [positive aspect they may have mentioned], we clearly fell short on [issue]. We're actively working to improve this. We'd love to hear more about your experience at [contact]."

### Template 3: Potentially fake or unfair review

> "Thank you for your review. We've searched our records and are unable to find a visit matching your description. We take all feedback seriously and would welcome the opportunity to discuss this directly. Please contact us at [contact] so we can better understand your experience."

### Template 4: Positive review (bonus)

> "Thank you so much for this wonderful feedback, [Name]! We're thrilled you enjoyed [specific detail they mentioned]. It means a lot to our team. We look forward to welcoming you back soon!"

## The Scaling Problem

If you manage a hotel, restaurant, or clinic with hundreds of reviews across multiple platforms, responding to each one manually isn't sustainable. The volume alone makes consistent, quality responses nearly impossible.

This is why [VoyageRespond](https://voyagerespond.com) exists. Our AI generates personalized, on-brand responses in seconds — trained on your business type, tone, and language preferences. You review, edit if needed, and send. What used to take hours now takes minutes.

With coverage across **80+ platforms** including Google, Booking.com, TripAdvisor, HolidayCheck, and more — VoyageRespond ensures no review ever goes unanswered.

**[Start your free trial →](https://voyagerespond.com/onboarding)**
    `
  }
];
blogPosts.push(...englishPosts);
const reputationPosts = [
  {
    slug: "google-yorum-rehberi",
    title: "Google Yorum: İşletmeler İçin 2026 Tam Rehberi",
    description: "Google yorum nedir, nasıl yönetilir, nasıl artırılır? İşletme sahipleri için yorum yönetimi, yanıtlama ve SEO etkisi rehberi.",
    ogTitle: "Google Yorum Rehberi 2026 | İşletmeler İçin Tam Kılavuz",
    ogDescription: "Google yorumlarını anlama, yanıtlama ve artırma rehberi. SEO etkisi, en iyi pratikler ve AI destekli çözümler.",
    metaTitle: "Google Yorum Rehberi 2026 | VoyageRespond",
    metaDescription: "Google yorum nedir, nasıl yönetilir? İşletmeniz için yorum yanıtlama, artırma ve SEO etkisi konularında kapsamlı rehber.",
    author: "VoyageRespond",
    publishedAt: "2026-05-12",
    category: "Yorum Yönetimi",
    readTime: "10 dk",
    keywords: ["google yorum", "google yorumlarım", "google işletmem yorum", "google yorum yönetimi"],
    content: `
Google yorum, bir işletmenin Google Haritalar ve Arama sonuçlarında görünen müşteri değerlendirmeleridir. Bu rehberde Google yorumlarının nasıl çalıştığını, neden kritik olduğunu ve nasıl yönetilmesi gerektiğini adım adım anlatıyoruz.

## Google Yorum Nedir?

Google yorum, müşterilerin Google Business Profile (eski adıyla Google My Business) üzerinde işletmeniz hakkında bıraktığı 1-5 yıldız puan ve metin değerlendirmesidir. Bu yorumlar:

- **Google Haritalar** üzerinde görünür
- **Google Arama** sonuçlarında "knowledge panel"de yer alır
- **Yerel SEO sıralamasını** doğrudan etkiler
- **AI asistanlarına** (ChatGPT, Gemini) bilgi sağlar

## Neden Bu Kadar Önemli?

- Türkiye'de **ayda 5.400 kişi** Google'da "google yorum" araması yapıyor
- Tüketicilerin **%93'ü** bir işletmeyi ziyaret etmeden önce Google yorumlarını okuyor
- **4.0+ puan ortalamasına** sahip işletmeler %32 daha fazla tıklama alıyor
- Yanıtlanan yorumlar **arama sıralamasını** ortalama %12 yukarı taşıyor

## Google Yorum Yönetiminin 5 Adımı

### 1. Yorumları Sürekli İzleyin
Yeni yorumları **gerçek zamanlı** takip edin. Manuel kontrol değil, otomatik bildirim sistemi şart.

### 2. 24 Saat İçinde Yanıt Verin
Google'ın algoritması **yanıt hızını** sıralama sinyali olarak kullanır. İdeal hedef: 2 saat içinde.

### 3. Kişiselleştirilmiş Yanıtlar Yazın
Şablon yanıtlardan kaçının. Müşterinin adını, yorumdaki spesifik detayları ve işletmenize özgü ifadeleri kullanın.

### 4. Olumsuz Yorumları Fırsata Çevirin
1 yıldız bir yorumun profesyonelce yanıtlanması, 100 olumlu yorumdan daha fazla güven inşa eder.

### 5. Yeni Yorumları Aktif Olarak Teşvik Edin
QR kodlar, e-posta hatırlatıcıları ve hizmet sonrası kısa link paylaşımı ile yorum sayınızı artırın.

## Sahte ve Spam Yorumlar

Sahte yorumları Google'a şikayet edebilirsiniz:
1. Google Business Profile'a giriş yapın
2. İlgili yoruma tıklayın → "Bayrak" simgesine basın
3. "Spam, off-topic, çıkar çatışması" gibi nedenler arasından seçin

Google'ın inceleme süresi ortalama **7-14 gün**.

## AI ile Google Yorum Yönetimi

[VoyageRespond](https://voyagerespond.com), Google yorumlarınızı 6 saatte bir otomatik çekip yapay zeka ile yanıt önerisi üretir. 8 farklı tonda, çok dilli ve marka uyumlu yanıtlar — tek tıkla onaylanabilir.

## İlgili Rehberler

- [Google Yorumlarına Nasıl Yanıt Verilir?](/blog/google-yorumlarina-nasil-yanit-verilir)
- [Google Yorum Silme Rehberi](/blog/google-yorum-silme-rehberi)
- [Google İşletme Profili Optimizasyonu](/blog/google-isletme-profili-optimizasyonu)
- [Online İtibar Yönetimi Rehberi](/blog/online-itibar-yonetimi-rehberi)

**[3 ay ücretsiz deneyin →](https://voyagerespond.com/onboarding)**
    `
  },
  {
    slug: "google-yorum-silme-rehberi",
    title: "Google Yorum Silme: Sahte ve Haksız Yorumları Kaldırma Rehberi",
    description: "Google yorum nasıl silinir? Sahte, hakaret içeren veya politika ihlali yapan yorumları kaldırma adımları, şikayet süreci ve alternatif çözümler.",
    ogTitle: "Google Yorum Silme Rehberi 2026 | Adım Adım",
    ogDescription: "Sahte ve haksız Google yorumlarını silme rehberi. Şikayet süreçleri, kabul edilen nedenler ve alternatif itibar yönetimi.",
    metaTitle: "Google Yorum Silme Rehberi | VoyageRespond",
    metaDescription: "Google'da sahte veya haksız yorumlar nasıl silinir? Şikayet süreci, başarı oranları ve alternatif çözümler.",
    author: "VoyageRespond",
    publishedAt: "2026-05-12",
    category: "Yorum Yönetimi",
    readTime: "8 dk",
    keywords: ["google yorum silme", "google yorum kaldırma", "sahte google yorumu", "google yorum şikayet"],
    content: `
Google yorum silme, sahte veya politika ihlali yapan yorumları işletme profilinizden kaldırma işlemidir. Türkiye'de ayda 1.600 işletme sahibi bu konuyu araştırıyor. Bu rehberde hangi yorumların silinebildiğini ve süreci adım adım anlatıyoruz.

## Hangi Yorumlar Silinebilir?

Google'ın **resmi politikasına göre** şu yorumlar silinebilir:

- ❌ **Spam ve sahte içerik** — Bot veya rakip tarafından yazılmış
- ❌ **Hakaret ve nefret söylemi** — Küfür, ayrımcılık
- ❌ **Çıkar çatışması** — Eski çalışan, rakip işletme
- ❌ **Konu dışı içerik** — İşletmenizle ilgisiz şikayet
- ❌ **Kişisel bilgi paylaşımı** — Telefon, adres, kimlik
- ❌ **Yasa dışı içerik** — Yasal olmayan ürün/hizmet talebi

## Hangi Yorumlar Silinemez?

- ✅ **Olumsuz ama gerçek deneyimler** — Müşteri haklı veya haksız olabilir
- ✅ **Düşük puanlı yorumlar** — Sadece 1 yıldız olduğu için silinmez
- ✅ **Sübjektif şikayetler** — "Yemek tatsızdı" gibi

**Google bu yorumları korur.** Tek çözüm profesyonel yanıt vermek.

## Adım Adım Şikayet Süreci

### 1. Yorumu Tespit Edin
Google Business Profile → "Yorumlar" sekmesi

### 2. Bayrak Simgesine Tıklayın
Yorumun sağ üst köşesindeki üç nokta menüsünden "Uygunsuz olarak işaretle"

### 3. Neden Seçin
- Off-topic
- Spam
- Çıkar çatışması
- Hakaret
- Yasa dışı içerik

### 4. Bekleyin
Google'ın inceleme süresi ortalama **3-14 gün**. Bazen 30 güne kadar uzayabilir.

## Başarı Oranı Ne Kadar?

Sektör verilerine göre Google'a yapılan silme taleplerinin yalnızca **%23'ü kabul ediliyor**. Bu yüzden:

- Şikayet öncesi yorumun politika ihlali yaptığından emin olun
- Ekran görüntüsü ve kanıt toplayın
- Kabul edilmeyen yorumlara mutlaka **profesyonel yanıt** verin

## Yorum Silinmezse Ne Yapılır?

### A. Profesyonel Yanıt Verin
Olumsuz yorumun altına yazılan iyi bir yanıt, yorumdan daha fazla okunur. [Kötü yorumlara nasıl cevap verilir?](/blog/kotu-yorumlara-nasil-cevap-verilir)

### B. Olumlu Yorum Hacmini Artırın
10 olumlu yorum, 1 olumsuz yorumu görsel olarak gömer. Memnun müşterilerden yorum talep edin.

### C. Hukuki Yol
Hakaret veya iftira içeren yorumlar için **avukat aracılığıyla mahkeme kararı** alarak Google'a iletebilirsiniz. Bu süreç 2-6 ay sürer.

## VoyageRespond ile Otomatik İtibar Koruma

[VoyageRespond](https://voyagerespond.com), olumsuz yorumları **anında bildirir**, profesyonel yanıt önerileri sunar ve yeni olumlu yorum talep süreçlerini otomatikleştirir.

## İlgili Rehberler

- [Google Yorum Rehberi](/blog/google-yorum-rehberi)
- [Kötü Yorumlara Nasıl Cevap Verilir?](/blog/kotu-yorumlara-nasil-cevap-verilir)
- [Online İtibar Yönetimi Rehberi](/blog/online-itibar-yonetimi-rehberi)

**[Ücretsiz deneyin →](https://voyagerespond.com/onboarding)**
    `
  },
  {
    slug: "google-isletme-profili-optimizasyonu",
    title: "Google İşletme Profili Optimizasyonu: 2026 Tam Rehberi",
    description: "Google İşletme Profilinizi optimize ederek yerel aramalarda üst sıralara çıkın. Adım adım rehber, kontrol listesi ve sıralama faktörleri.",
    ogTitle: "Google İşletme Profili Optimizasyonu 2026",
    ogDescription: "Google İşletme Profili'nizi optimize etmenin 12 adımı. Yerel SEO, kategori seçimi, yorum stratejisi.",
    metaTitle: "Google İşletme Profili Optimizasyonu Rehberi | VoyageRespond",
    metaDescription: "Google İşletme Profili nasıl optimize edilir? Yerel SEO, fotoğraf, yorum ve kategori seçimi rehberi.",
    author: "VoyageRespond",
    publishedAt: "2026-05-13",
    category: "Yerel SEO",
    readTime: "11 dk",
    keywords: ["google işletme profili", "google işletmem", "google business profile", "yerel seo"],
    content: `
Google İşletme Profili optimizasyonu, yerel aramalarda üst sıralara çıkmanın en etkili yoludur. Türkiye'de ayda 1.900 işletme sahibi "google işletme profili" araması yapıyor. Bu rehberde profilinizi adım adım optimize ediyoruz.

## Google İşletme Profili Nedir?

Google'ın işletmeniz hakkında topladığı tüm bilgilerin merkezi paneldir. İçerir:

- İşletme adı, adres, telefon (NAP)
- Kategori ve hizmetler
- Çalışma saatleri
- Fotoğraflar ve videolar
- Müşteri yorumları
- Mesajlaşma ve rezervasyon

## Optimizasyon Kontrol Listesi

### ✅ 1. NAP Tutarlılığı
İşletme adı, adres, telefon **tüm platformlarda aynı** olmalı. Tek bir karakter farkı bile sıralamayı düşürür.

### ✅ 2. Doğru Birincil Kategori Seçimi
Birincil kategori en önemli faktördür. "Restoran" yerine "İtalyan Restoranı" gibi spesifik olun. Rakiplerinizin kategorilerini inceleyin.

### ✅ 3. Tüm Alt Kategorileri Doldurun
Maksimum 9 ek kategori ekleyebilirsiniz. Her biri ek anahtar kelime trafiği getirir.

### ✅ 4. Detaylı İşletme Açıklaması
750 karakteri sonuna kadar kullanın. Anahtar kelimeleri doğal şekilde yerleştirin.

### ✅ 5. Profesyonel Fotoğraflar
- Logo: 250x250 px
- Kapak: 1080x608 px  
- En az **20 yüksek kalitede fotoğraf**
- Her hafta 1-2 yeni fotoğraf

### ✅ 6. Çalışma Saatleri ve Tatiller
Resmi tatillerde özel saatler ekleyin. Yanlış bilgi olumsuz yoruma yol açar.

### ✅ 7. Hizmet ve Ürün Listesi
Tüm hizmetlerinizi fiyatlandırma ile birlikte ekleyin. Bu, "long-tail" aramalarda ortaya çıkmanızı sağlar.

### ✅ 8. Soru-Cevap Bölümü
Sıkça sorulan soruları **kendiniz sorup cevaplayın**. Kontrolü elinizde tutun.

### ✅ 9. Yorum Yönetimi
Yerel SEO sıralamasının **%17'si** yorumlardan oluşur. Hedefler:
- Aylık minimum 5 yeni yorum
- 4.3+ ortalama puan
- %95+ yanıt oranı
- 24 saat içinde yanıt

### ✅ 10. Google Posts
Haftalık güncellemeler, kampanyalar, etkinlikler paylaşın. "Aktif işletme" sinyali.

### ✅ 11. UTM ile Trafik Takibi
Web sitesi linkinde UTM parametresi: \`?utm_source=google&utm_medium=gbp\`

### ✅ 12. Düzenli Performans Kontrolü
Google Insights üzerinden:
- Profil görüntüleme
- Arama yapan kelimeler
- Müşteri eylemleri

## Sıralama Faktörleri

Google'ın yerel sıralama algoritması üç ana faktörden oluşur:

1. **Alaka düzeyi** (Relevance) — Aranan terim ile profil eşleşmesi
2. **Mesafe** (Distance) — Aramayı yapan kişiye yakınlık
3. **Belirginlik** (Prominence) — Yorum sayısı, web varlığı, link sayısı

## VoyageRespond ile Yorum Optimizasyonu

Sıralamanın **%17'si yorumlar**. [VoyageRespond](https://voyagerespond.com) ile:

- Otomatik yorum çekme (6 saatte bir)
- AI yanıt önerileri (8 ton, çok dilli)
- Yorum talep otomasyonu (QR + e-posta)
- AI Visibility Score takibi

## İlgili Rehberler

- [Google Yorum Rehberi](/blog/google-yorum-rehberi)
- [Google Yorumlarına Nasıl Yanıt Verilir?](/blog/google-yorumlarina-nasil-yanit-verilir)
- [Online İtibar Yönetimi Rehberi](/blog/online-itibar-yonetimi-rehberi)

**[Profilinizi optimize etmeye başlayın →](https://voyagerespond.com/onboarding)**
    `
  },
  {
    slug: "online-itibar-yonetimi-rehberi",
    title: "Online İtibar Yönetimi: 2026 İşletme Rehberi",
    description: "Online itibar yönetimi nedir, nasıl yapılır? Google, sosyal medya ve OTA platformlarında dijital itibarınızı koruma ve büyütme rehberi.",
    ogTitle: "Online İtibar Yönetimi Rehberi 2026 | VoyageRespond",
    ogDescription: "Dijital itibar yönetiminin 6 sütunu, kriz yönetimi ve AI destekli çözümler.",
    metaTitle: "Online İtibar Yönetimi 2026 | İşletme Rehberi",
    metaDescription: "Online itibar yönetimi nedir, nasıl yapılır? Google, OTA, sosyal medya itibar koruma stratejileri.",
    author: "VoyageRespond",
    publishedAt: "2026-05-13",
    category: "İtibar Yönetimi",
    readTime: "10 dk",
    keywords: ["online itibar yönetimi", "dijital itibar yönetimi", "itibar yönetimi", "kurumsal itibar"],
    content: `
Online itibar yönetimi (Online Reputation Management — ORM), bir işletmenin internetteki algısını ölçme, koruma ve geliştirme sürecidir. Türkiye'de ayda 590 işletme sahibi bu konuyu araştırıyor. Bu rehberde A'dan Z'ye anlatıyoruz.

## Online İtibar Nedir?

İşletmenizin dijital ortamdaki görünümünün toplamı:

- Google yorumları ve puanı
- Booking.com, TripAdvisor gibi OTA puanları
- Sosyal medya yorumları (Instagram, TikTok, YouTube)
- Forum ve Reddit gibi topluluklar
- Şikayetvar.com gibi şikayet platformları
- Haber ve blog yazıları

## Neden Kritik?

- Tüketicilerin **%87'si** satın alma kararından önce online itibar araştırıyor
- 1 yıldız puan artışı, gelirde **%5-9 artış** sağlıyor
- Olumsuz bir haber, organik trafiği **%22'ye kadar** düşürüyor
- AI asistanları (ChatGPT, Gemini) artık **itibar verisini öneri** olarak kullanıyor

## Online İtibar Yönetiminin 6 Sütunu

### 1. İzleme (Monitoring)
Tüm platformlarda işletme adınızı **gerçek zamanlı** takip edin. Google Alerts yetersiz; profesyonel ORM araçları gerekli.

### 2. Yorum Yönetimi
- 24 saat içinde yanıt
- Kişiselleştirilmiş cevaplar
- Olumsuz yorumlara profesyonel yaklaşım

### 3. İçerik Üretimi
Olumlu içerik (blog, sosyal medya, müşteri başarı hikayeleri) ile olumsuz içeriği arama sonuçlarında **aşağı itin**.

### 4. SEO ve SERP Yönetimi
İşletme adınız aratıldığında ilk 10 sonucun **kontrol ettiğiniz** sayfalar olmasını hedefleyin.

### 5. Kriz Yönetimi
Olumsuz haber/yorum patlamalarında:
- Hızlı resmi açıklama
- Şeffaf iletişim
- Aksiyon planı paylaşımı

### 6. Aktif İtibar İnşası
- Müşterilerden yorum talebi
- Influencer/blogger işbirlikleri
- Topluluk sponsorluğu

## Kriz Yönetimi: 4 Aşama

### Aşama 1: Tespit (0-1 saat)
Sorunu fark eder etmez ekibi toplayın. Yayılma hızını ölçün.

### Aşama 2: Değerlendirme (1-4 saat)
- Etki alanı nedir?
- Hukuki boyut var mı?
- Resmi açıklama gerekli mi?

### Aşama 3: Müdahale (4-24 saat)
- Net, samimi resmi açıklama
- İlgili müşteriyle birebir iletişim
- Sosyal medya iletişim planı

### Aşama 4: Onarım (1 hafta+)
- Olumlu içerik kampanyası
- Müşteri memnuniyet anketleri
- İç süreç iyileştirmeleri

## Hangi Sektörler İçin En Kritik?

| Sektör | Etki Düzeyi | Öncelikli Platformlar |
|--------|------------|----------------------|
| Otel | 🔴 Çok yüksek | Booking, TripAdvisor, Google |
| Restoran | 🔴 Çok yüksek | Google, TripAdvisor, Instagram |
| Sağlık | 🔴 Çok yüksek | Google, sektör platformları |
| E-ticaret | 🟠 Yüksek | Trustpilot, Şikayetvar, Google |
| B2B SaaS | 🟡 Orta | G2, Capterra, LinkedIn |

## AI ile İtibar Yönetimi

[VoyageRespond](https://voyagerespond.com) Google, Booking, TripAdvisor, Hotels.com, Instagram, TikTok ve YouTube yorumlarını **tek panelden yönetmenizi** sağlar:

- 80+ platformdan otomatik yorum çekme
- AI duygu analizi ve önceliklendirme
- 8 farklı tonda yanıt önerisi
- AI Visibility Score takibi
- Haftalık otomatik raporlar

## İlgili Rehberler

- [Google Yorum Rehberi](/blog/google-yorum-rehberi)
- [Booking.com Yorum Yönetimi](/blog/booking-yorum-yonetimi)
- [TripAdvisor Yorum Yönetimi](/blog/tripadvisor-yorum-yonetimi)
- [Instagram Yorum Yönetimi](/blog/instagram-yorum-yonetimi)

**[3 ay ücretsiz deneyin →](https://voyagerespond.com/onboarding)**
    `
  },
  {
    slug: "booking-yorum-yonetimi",
    title: "Booking.com Yorum Yönetimi: Oteller İçin 2026 Rehberi",
    description: "Booking.com yorumlarını yönetme rehberi. Misafir yorumlarına yanıt verme, puan artırma stratejileri ve otomatik yönetim çözümleri.",
    ogTitle: "Booking.com Yorum Yönetimi Rehberi 2026",
    ogDescription: "Booking.com'da puanınızı artırmanın 8 yolu. Misafir yorumlarına profesyonel yanıt rehberi.",
    metaTitle: "Booking.com Yorum Yönetimi | Otel Rehberi 2026",
    metaDescription: "Booking.com misafir yorumlarını yönetme rehberi. Puan artırma, yanıtlama ve otomatik yönetim.",
    author: "VoyageRespond",
    publishedAt: "2026-05-13",
    category: "OTA Yönetimi",
    readTime: "9 dk",
    keywords: ["booking yorumları", "booking.com yorum", "booking misafir yorumu", "otel yorum yönetimi"],
    content: `
Booking.com yorum yönetimi, oteller için **en kritik gelir kaynağıdır**. Booking.com'un Türkiye'de aylık 450.000 araması var ve misafirler rezervasyondan önce ortalama **6-9 yorum** okuyor. Bu rehberde Booking puanınızı nasıl artıracağınızı anlatıyoruz.

## Booking.com Puan Sistemi Nasıl Çalışır?

Booking.com, **10 üzerinden** puan kullanır ve şu kategorileri ölçer:

- **Personel** (Staff)
- **Konfor** (Comfort)
- **Ücretsiz Wi-Fi**
- **Tesisler** (Facilities)
- **Temizlik** (Cleanliness)
- **Konum** (Location)
- **Fiyat-performans** (Value for money)

Genel puan bu 7 kategorinin **ağırlıklı ortalamasıdır**. Hedef puan: **8.5+** ("Çok iyi" rozeti için).

## Booking Puanını Etkileyen Kritik Faktörler

### 1. Yanıt Oranı
Booking.com, yanıt verilmiş yorumları **arama sonuçlarında öne çıkarır**. Hedef: %95+ yanıt oranı.

### 2. Yanıt Süresi
İdeal: 48 saat içinde. 7 günü geçen yanıtlar etki azaltır.

### 3. Yorum Hacmi
Son 24 ayda **30+ yorum** olmadan "Genius" partner statüsüne giremezsiniz.

### 4. Ortalama Puan Trendi
Booking, son 12 ayın trendine bakar. Düşüş varsa sıralama düşer.

## Misafir Yorumlarına Yanıt Verme

### Olumlu Yorum Yanıtı (Şablon)
> "Sayın [İsim], güzel yorumunuz için çok teşekkür ederiz. Özellikle [bahsettikleri detay] hakkındaki sözleriniz tüm ekibimizi mutlu etti. Bir sonraki [şehir] ziyaretinizde tekrar ağırlamak için sabırsızlanıyoruz. 🙏"

### Olumsuz Yorum Yanıtı (Şablon)
> "Sayın [İsim], yaşadığınız deneyim için içten özrümüzü kabul edin. [Spesifik sorun] konusu kesinlikle standartlarımızın altında. İlgili ekibimizle değerlendirme toplantısı yaptık ve [aksiyon]. Sizi tekrar misafir etme şansı verirseniz farkı göstermek isteriz. Lütfen [email] adresinden bizimle iletişime geçin."

## Booking Puan Artırma Stratejileri

### Strateji 1: Check-in Deneyimini Mükemmelleştirin
İlk 15 dakika genel deneyim algısının **%60'ını** belirler. Karşılama, hızlı işlem, oda gösterimi.

### Strateji 2: Sürpriz Eklemeler
Welcome drink, küçük bir ikram, doğum günü mesajı — küçük detaylar 9-10 puanı garantiler.

### Strateji 3: Check-out'ta Geri Bildirim
Check-out anında "Nasıldı?" sorusu, sorunları **Booking'e yansımadan** çözmenizi sağlar.

### Strateji 4: Özür ve Telafi Politikası
Sorun yaşayan misafire **anında telafi** sunun (indirim, ücretsiz hizmet). %70'i puan vermekten vazgeçer.

### Strateji 5: Çok Dilli Yanıtlar
Yabancı misafire kendi dilinde yanıt = +1.5 puan etkisi (sektör verisi).

## Sahte ve Haksız Yorumları Şikayet Etme

Booking Extranet → "Misafir Yorumları" → "Şikayet Et"

Kabul edilen nedenler:
- Hiç konaklamamış misafir (rezervasyon iptal edilmiş)
- Hakaret / küfür
- Konaklamayla ilgisiz şikayet
- Yasa dışı talep

İnceleme süresi: **5-10 iş günü**

## VoyageRespond ile Booking Otomasyon

[VoyageRespond](https://voyagerespond.com), Booking.com yorumlarını otomatik çeker, AI ile yanıt önerisi üretir ve **çok dilli** yanıt yazar:

- 80+ dilde otomatik yanıt
- Yanıt onay sistemi (siz onaylar Booking'e gider)
- Misafir kategorisi bazlı yanıt önerileri
- Düşük puan uyarısı (anında bildirim)

## İlgili Rehberler

- [Otel & Restoran Yorum Yönetimi Rehberi](/blog/otel-restoran-yorum-yonetimi-rehberi)
- [TripAdvisor Yorum Yönetimi](/blog/tripadvisor-yorum-yonetimi)
- [Otel Yorum Cevap Şablonları](/otel-yorum-cevaplari)

**[Otelinizi 3 ay ücretsiz yönetin →](https://voyagerespond.com/onboarding)**
    `
  },
  {
    slug: "tripadvisor-yorum-yonetimi",
    title: "TripAdvisor Yorum Yönetimi: Otel ve Restoran Rehberi",
    description: "TripAdvisor yorumlarını yönetme rehberi. Sıralama algoritması, yanıt stratejileri ve Travelers' Choice rozeti kazanma yolları.",
    ogTitle: "TripAdvisor Yorum Yönetimi Rehberi 2026",
    ogDescription: "TripAdvisor sıralama algoritması, yanıt stratejileri ve Travelers' Choice rozeti rehberi.",
    metaTitle: "TripAdvisor Yorum Yönetimi | Otel & Restoran Rehberi",
    metaDescription: "TripAdvisor yorum yönetimi, sıralama algoritması ve Travelers' Choice rozeti kazanma rehberi.",
    author: "VoyageRespond",
    publishedAt: "2026-05-14",
    category: "OTA Yönetimi",
    readTime: "9 dk",
    keywords: ["tripadvisor yorum", "tripadvisor yorum yönetimi", "tripadvisor sıralama", "travelers choice"],
    content: `
TripAdvisor, dünya genelinde en büyük seyahat platformudur ve Türkiye'de aylık 74.000 arama alır. TripAdvisor yorum yönetimi, özellikle **uluslararası misafir** çeken oteller ve restoranlar için kritiktir.

## TripAdvisor "Popularity Ranking" Algoritması

TripAdvisor sıralaması üç ana sinyalden oluşur:

### 1. Yorum Kalitesi (Quality)
- Yıldız sayısı
- Yorum metni uzunluğu ve detayı
- Fotoğraf eklenip eklenmediği

### 2. Yorum Tazeliği (Recency)
Son yorumlar daha ağır basar. **3+ ay** yorum gelmemesi sıralamayı düşürür.

### 3. Yorum Hacmi (Quantity)
Bulunduğunuz şehir/kategorideki rakiplere göre **göreceli** hacim.

## Travelers' Choice Rozeti

TripAdvisor'un en prestijli rozetidir. Kazanmak için:
- Son 12 ayda **tutarlı yüksek puan** (4.0+)
- En az **30 yorum**
- Yüksek **yanıt oranı**
- Şehir/kategori sıralamasında üst %10

Rozet sahipleri ortalama **+18% rezervasyon artışı** yaşıyor.

## Yorum Yanıtlama Stratejisi

### Yanıt Oranı Hedefi
- Olumsuz yorumlar: **%100** yanıt
- 4 yıldız: %80+
- 5 yıldız: %50+

### Çok Dilli Yanıt Önemli
TripAdvisor kullanıcılarının **%67'si İngilizce dışında dilde** yorum yazıyor. Yanıtınızı yorumla aynı dilde verin.

### Yanıt Şablonu (İngilizce - Olumlu)
> "Dear [Name], thank you so much for your wonderful review! We're thrilled that you enjoyed [specific detail]. Our team will be delighted to hear your kind words. We can't wait to welcome you back on your next visit to [city]."

### Yanıt Şablonu (İngilizce - Olumsuz)
> "Dear [Name], we sincerely apologize for the experience you had. [Specific issue] is absolutely not the standard we strive for. We have addressed this matter with our team and implemented [action]. We would be grateful for the opportunity to welcome you back. Please contact us at [email]."

## Sahte Yorum Şikayeti

TripAdvisor Management Center → "Reviews" → "Report a Review"

Kabul edilen nedenler:
- Konaklamamış kişi
- Çıkar çatışması (rakip, eski çalışan)
- Hakaret
- Konu dışı içerik
- Şantaj girişimi

TripAdvisor'un **"Fraud Detection"** sistemi yorum başına 50+ sinyal kontrol eder. Bu nedenle başarı oranı Google'dan yüksektir (~%40).

## Sıralama Artırma Taktikleri

### 1. Düzenli Yorum Akışı Sağlayın
Her ay minimum 5-10 yeni yorum hedefleyin. Boşluk = sıralama düşüşü.

### 2. Misafir Profil Çeşitliliği
TripAdvisor; aile, çift, iş, solo gibi profilleri ayrı ayrı puanlar. **Tüm segmentlerden** yorum gelmeli.

### 3. Fotoğraflı Yorumları Teşvik Edin
Fotoğraflı yorumlar **3 kat daha fazla** sıralama ağırlığı taşır.

### 4. "Helpful" Oyları
Olumlu yorumlarınıza "helpful" oyu gelmesi sıralamayı yukarı çeker.

## VoyageRespond ile TripAdvisor Otomasyon

[VoyageRespond](https://voyagerespond.com), TripAdvisor yorumlarını **scraper teknolojisiyle** çeker (API kısıtlamaları olmadan):

- Hibrit fetcher (web scraping + manuel doğrulama)
- AI çok dilli yanıt önerileri
- Travelers' Choice ilerleme takibi
- Rakip otel/restoran karşılaştırması

## İlgili Rehberler

- [Booking.com Yorum Yönetimi](/blog/booking-yorum-yonetimi)
- [Otel & Restoran Yorum Yönetimi](/blog/otel-restoran-yorum-yonetimi-rehberi)
- [Otel Yorum Cevap Şablonları](/otel-yorum-cevaplari)

**[3 ay ücretsiz deneyin →](https://voyagerespond.com/onboarding)**
    `
  },
  {
    slug: "instagram-yorum-yonetimi",
    title: "Instagram Yorum Yönetimi: İşletmeler İçin 2026 Rehberi",
    description: "Instagram yorumlarını yönetme rehberi. Spam filtreleme, AI yanıt stratejileri ve dönüşümü artıran yorum yaklaşımları.",
    ogTitle: "Instagram Yorum Yönetimi Rehberi 2026",
    ogDescription: "Instagram yorumları nasıl yönetilir? Spam filtreleme, AI yanıt ve dönüşüm stratejileri.",
    metaTitle: "Instagram Yorum Yönetimi | İşletme Rehberi 2026",
    metaDescription: "Instagram yorum yönetimi, spam filtreleme ve dönüşüm odaklı yanıt stratejileri.",
    author: "VoyageRespond",
    publishedAt: "2026-05-14",
    category: "Sosyal Medya",
    readTime: "8 dk",
    keywords: ["instagram yorum", "instagram yorum yönetimi", "instagram müşteri yorumu", "sosyal medya yorum"],
    content: `
Instagram yorum yönetimi, marka algısının şekillendiği en görünür alandır. Türkiye'de aylık 1.000 arama alan "instagram yorum" konusu, özellikle e-ticaret, restoran ve hizmet sektörü için kritik.

## Instagram Yorumlarının Önemi

- Tüketicilerin **%76'sı** Instagram yorumlarını "sosyal kanıt" olarak değerlendiriyor
- Olumsuz bir yorum, ortalama **6 potansiyel müşteriyi** caydırıyor
- Yanıtlanmış yorumlar **2.3 kat daha fazla** etkileşim alıyor
- Algoritma, **yüksek yorum etkileşimi** olan postları daha fazla yayıyor

## Yorum Türleri ve Yaklaşımlar

### 1. Soru Yorumları
"Fiyat ne kadar?", "Stokta var mı?", "Hangi şubede?"

**Yaklaşım:** **30 dakika içinde** yanıt — algoritma için kritik. DM'ye yönlendirin.

### 2. Övgü Yorumları
"Süpermiş!", "Almak istiyorum!"

**Yaklaşım:** Emoji + kişisel teşekkür + ek değer (link, indirim).

### 3. Şikayet Yorumları
"Siparişim gelmedi", "Kalitesi kötüydü"

**Yaklaşım:** Asla silmeyin — DM'ye taşıyın, herkes önünde profesyonel kalın.

### 4. Spam ve Bot Yorumları
Linkler, emoji bombası, alakasız reklamlar.

**Yaklaşım:** Filtre ile engelleyin (Settings → Privacy → Hidden Words).

## Yorum Yönetimi Aracı: Yerleşik Filtreler

Instagram'ın sağladığı:
- **Hidden Words** — Belirli kelimeleri içeren yorumları otomatik gizle
- **Manual Filter** — Kelime listesi (rakip ürün adları, küfür, vb.)
- **Comment Controls** — Sadece takipçilerden yorum
- **Restricted Accounts** — Belirli hesapların yorumlarını sadece o kişi görür

## Etkili Yanıt Stratejisi

### Yanıt Süresi
- İlk 1 saat içinde gelen yorumlara yanıt = postun **5x daha fazla** dağıtım alması
- Geç yanıtlar etkileşim spike'ını kaçırır

### Emoji Kullanımı
Yanıtlarda **2-3 emoji** ortalama optimal. Daha fazlası bot algısı yaratır.

### Etkileşim Soruları
Yanıtınıza bir soru ekleyerek **konuşmayı uzatın** — algoritma sever.

### CTA Yerleştirme
Olumlu yorumlara: "Daha fazlası için → bio link" CTA'sı.

## Instagram DM ve Yorum Entegrasyonu

Yorum + DM birlikte çalışmalı:
- Public yorumda kısa selamla
- "Detayları DM'den göndereyim" diyerek konuşmayı taşı
- DM'de fiyat, link, kişisel bilgi paylaş

Bu yaklaşım conversion'ı **%34 artırıyor**.

## Olumsuz Yorum Krizleri

### Adım 1: 15 Dakika Bekleyin
Duygusal yanıt vermeyin.

### Adım 2: Kontrol Edin
- Müşteri haklı mı?
- Daha önce yaşanmış mı?
- Ne aksiyon mümkün?

### Adım 3: Public Yanıt
Kısa, profesyonel, çözüm odaklı. **DM'ye taşıyın**.

### Adım 4: DM Çözümü
Detay alın, telafi sunun, gerekirse yorum güncellemesi rica edin.

## VoyageRespond ile Sosyal Medya Yorum Yönetimi

[VoyageRespond](https://voyagerespond.com), Instagram, TikTok ve YouTube yorumlarını **tek panelden** yönetmenizi sağlar:

- Çok platformlu yorum gelen kutusu
- AI ton seçimli yanıt önerisi (8 ton)
- Marka rehberi öğrenen AI
- Toplu spam filtreleme

## İlgili Rehberler

- [TikTok Yorum Yönetimi](/blog/tiktok-yorum-yonetimi)
- [YouTube Yorum Yönetimi](/blog/youtube-yorum-yonetimi)
- [Online İtibar Yönetimi Rehberi](/blog/online-itibar-yonetimi-rehberi)

**[3 ay ücretsiz deneyin →](https://voyagerespond.com/onboarding)**
    `
  },
  {
    slug: "tiktok-yorum-yonetimi",
    title: "TikTok Yorum Yönetimi: Markalar İçin 2026 Rehberi",
    description: "TikTok yorumlarını yönetme rehberi. AI yanıt stratejileri, spam koruma ve viral içerik yönetimi.",
    ogTitle: "TikTok Yorum Yönetimi Rehberi 2026",
    ogDescription: "TikTok yorumları nasıl yönetilir? Spam koruma, AI yanıt ve viral kriz yönetimi.",
    metaTitle: "TikTok Yorum Yönetimi | Marka Rehberi 2026",
    metaDescription: "TikTok yorum yönetimi, AI yanıt stratejileri ve viral içerik kriz yönetimi rehberi.",
    author: "VoyageRespond",
    publishedAt: "2026-05-14",
    category: "Sosyal Medya",
    readTime: "8 dk",
    keywords: ["tiktok yorum", "tiktok yorum yönetimi", "tiktok marka", "tiktok kriz yönetimi"],
    content: `
TikTok, **viral hızı** ve **genç kitle erişimi** ile markalar için artık zorunlu bir kanal. Ancak yorum sayıları diğer platformlardan **5-10 kat fazla** olabiliyor. Bu rehberde TikTok yorumlarını verimli yönetmenin yollarını anlatıyoruz.

## TikTok Yorum Dinamikleri

- Bir viral video saatte **binlerce** yorum alabilir
- Yorumların **%30-40'ı spam, bot veya alakasız**
- TikTok algoritması, **erken yorum etkileşimi** olan videoları daha fazla dağıtır
- "Pinned comments" özelliği ile **3 yorum** sabitlenebilir — bu marka kontrolü için kritik

## Spam ve Toxic Yorum Koruması

TikTok'un yerleşik araçları:
- **Filter Keywords** — Belirli kelimeler otomatik gizlenir
- **Filter All Comments** — Tüm yorumlar onay bekler
- **Block Words** — Kelime kara listesi (özelleştirilebilir)
- **Restrict User** — Belirli hesapları sessize alma

Profesyonel hesaplar için **mutlaka aktive edin**.

## Yanıt Stratejileri

### 1. Pinned Comment ile Yönlendirme
Postun en üstüne sabitlenen yorum **5 kat daha fazla** okunur. Burada:
- CTA (link, kampanya)
- SSS yanıtı
- Kullanıcı uyarısı

### 2. Video ile Yanıt
TikTok'un **"Reply with Video"** özelliği — bir yorumu bir sonraki videonuzun konusu yapın. Etkileşim **3x artar**.

### 3. Emoji ve TikTok Diline Hakim Olun
Resmi ton TikTok'ta **soğuk** algılanır. Genç kitle dilini öğrenin: "slay", "real", "fr", emoji bombası kabul.

### 4. Erken Yanıt = Viral Boost
İlk 30 dakikadaki yorum etkileşimi videoyu FYP'ye taşır. **Yorumlara hızlı yanıt verin**.

## Kriz Yönetimi: Viral Olumsuz Yorum

TikTok'ta tek bir olumsuz yorum **milyonlara ulaşabilir**. Adımlar:

### Aşama 1: Hemen Tespit (0-30 dk)
Otomatik bildirim sistemi şart. Manuel kontrol yetersiz.

### Aşama 2: Profesyonel Yanıt
Kısa, samimi, çözüm odaklı. Asla savunmacı olmayın — TikTok kullanıcısı bunu hemen tespit eder.

### Aşama 3: Public Aksiyon
Sorunla ilgili **resmi video yayınlayın**. Şeffaflık viral kriz çözümünün anahtarı.

### Aşama 4: Takip Videosu
1-2 hafta sonra "Bunu yaptık, sonuç bu" videosu — güveni geri kazanın.

## TikTok Yorumlarında AI Yanıt

TikTok yorum hacmi manuel yönetimi imkansız kılar. AI destekli yaklaşım:

- **Yorum kategorisi** otomatik tanıma (soru, övgü, şikayet, spam)
- **3 alternatif yanıt önerisi** sunma
- **Marka tonuna** uygun yanıt üretimi
- **Kullanıcı onayı** ile yayınlama (TikTok politikası gereği)

## Restoran ve Otel İçin TikTok

TikTok'ta **konum etiketleri** çok güçlü. Misafirlerinizin sizi etiketlediği videoları takip edin:
- Olumlu içeriği **paylaşın** (UGC stratejisi)
- Olumsuz içeriğe **profesyonel yanıt** verin
- Misafiri **tag'leyerek teşekkür** edin (sadakati artırır)

## VoyageRespond ile TikTok Otomasyon

[VoyageRespond](https://voyagerespond.com), TikTok yorumlarını **resmi API üzerinden** çeker (sandbox + production):

- Yorum kategorisi tanıma (intent detection)
- 3 güvenli kısa yanıt önerisi
- Kullanıcı onaylı yayın (TikTok politika uyumlu)
- Çoklu video yönetimi

## İlgili Rehberler

- [Instagram Yorum Yönetimi](/blog/instagram-yorum-yonetimi)
- [YouTube Yorum Yönetimi](/blog/youtube-yorum-yonetimi)
- [Online İtibar Yönetimi Rehberi](/blog/online-itibar-yonetimi-rehberi)

**[3 ay ücretsiz deneyin →](https://voyagerespond.com/onboarding)**
    `
  },
  {
    slug: "youtube-yorum-yonetimi",
    title: "YouTube Yorum Yönetimi: Kanal Sahipleri İçin 2026 Rehberi",
    description: "YouTube yorumlarını yönetme rehberi. AI yanıt stratejileri, spam filtreleme, topluluk inşası ve algoritma etkisi.",
    ogTitle: "YouTube Yorum Yönetimi Rehberi 2026",
    ogDescription: "YouTube yorumları nasıl yönetilir? AI yanıt, spam filtreleme ve topluluk inşası rehberi.",
    metaTitle: "YouTube Yorum Yönetimi | Kanal Rehberi 2026",
    metaDescription: "YouTube yorum yönetimi, AI yanıt stratejileri ve topluluk inşası rehberi.",
    author: "VoyageRespond",
    publishedAt: "2026-05-14",
    category: "Sosyal Medya",
    readTime: "8 dk",
    keywords: ["youtube yorum", "youtube yorum yönetimi", "youtube topluluk", "youtube spam"],
    content: `
YouTube yorum yönetimi, kanal büyümesinin **gizli motorudur**. Türkiye'de aylık 720 arama alan "youtube yorum" konusu, içerik üreticileri ve markalar için kritik. YouTube algoritması yorum etkileşimini sıralama sinyali olarak kullanır.

## YouTube Yorum Algoritması

YouTube **3 sinyal** üzerinden yorumları değerlendirir:

### 1. Yorum Hacmi (Volume)
Çok yorum alan video = ilgi çekici video.

### 2. Yorum Hızı (Velocity)
İlk 24 saat içinde gelen yorumlar **6x daha ağır** basar.

### 3. Yanıt Etkileşimi (Engagement)
Kanal sahibinin yanıtladığı yorumlar **algoritma için pozitif sinyal**.

## Spam ve Toxic Yorum Koruma

YouTube Studio araçları:
- **Held for Review** — Belirli kriterlere uyan yorumlar onay bekler
- **Block Words** — Kelime kara listesi
- **Hidden Users** — Spam hesap engellenebilir
- **Auto Moderation** — Linkler, fazla emoji, küfür otomatik filtrelenir

Mutlaka aktif edin: **Settings → Community → Defaults**.

## Etkili Yorum Yanıt Stratejisi

### "Heart" Özelliği
Yorumlara kalp koymak (sadece kanal sahibinin yetkisi) — kullanıcıya **bildirim gider**, sadakat artar.

### Pinned Comment
Her video için bir yorumu sabitleyin:
- CTA (abone ol, link)
- SSS yanıtı
- Yeni içerik duyurusu

### Topluluk İnşası
Düzenli yorum yapan takipçileri **isimle tanıyın**. "Süper yorum [İsim]!" gibi yanıtlar topluluk hissi yaratır.

### Soru-Cevap Stratejisi
Yorum altında **bir soru sorun** — konuşmayı devam ettirin. YouTube algoritması seviyor.

## Yorum Türleri ve Yaklaşımlar

### 1. Övgü Yorumları
→ Kalp + kişisel teşekkür

### 2. Soru Yorumları
→ Detaylı yanıt + bir sonraki video önerisi

### 3. Yapıcı Eleştiri
→ Kabul + öğrenme + gelecek video sözü

### 4. Toxic Yorumlar
→ Yanıtlama, gizle (bildirim gitmez), gerekirse engelleme

### 5. Spam Yorumlar
→ Otomatik filtre + raporlama

## Long-form Video Yorum Yönetimi

10+ dakikalık videolarda yorum sayısı patlar. Ölçeklendirmek için:

- AI ile **yorum sınıflandırma** (soru, övgü, şikayet)
- **Toplu yanıt önerileri**
- Pinned comment ile SSS
- Düzenli **community post** (yorum trafiğini buraya yönlendirin)

## YouTube Shorts Yorumları

Shorts farklı dinamiktedir:
- Yorumlar **çok hızlı akar**
- **Kısa, samimi yanıtlar** öne çıkar
- Emoji ve TikTok diline benzer ton
- Pinned comment **çok önemli** (Shorts'ta yorum kutusu küçüktür)

## Markalar İçin YouTube Yorum Stratejisi

- Müşterilerin sorularına **birinci elden yanıt**
- Olumsuz yorumlara **şeffaf yaklaşım**
- "Subscribe + comment" kampanyaları
- Yorum yarışmaları (sıralamayı destekler)

## VoyageRespond ile YouTube Otomasyon

[VoyageRespond](https://voyagerespond.com), YouTube yorumlarını **resmi API üzerinden** çekip AI ile yönetir:

- Yorum sınıflandırma (intent detection)
- AI yanıt önerisi (8 ton seçeneği)
- Spam otomatik filtreleme
- Çoklu video yönetimi
- Yorum analitikleri (en çok bahsedilen konular)

## İlgili Rehberler

- [Instagram Yorum Yönetimi](/blog/instagram-yorum-yonetimi)
- [TikTok Yorum Yönetimi](/blog/tiktok-yorum-yonetimi)
- [Online İtibar Yönetimi Rehberi](/blog/online-itibar-yonetimi-rehberi)

**[3 ay ücretsiz deneyin →](https://voyagerespond.com/onboarding)**
    `
  }
];
blogPosts.push(...reputationPosts);
const seoTargetedPosts = [
  {
    slug: "otel-yorum-yonetimi-rehberi",
    title: "Otel Yorum Yönetimi: A'dan Z'ye 2026 Rehberi",
    description: "Otel yorum yönetimi nedir, neden kritik, Google Booking TripAdvisor yorumları nasıl yönetilir? Otel sahipleri için 2026 kapsamlı rehber.",
    ogTitle: "Otel Yorum Yönetimi 2026 Rehberi | VoyageRespond",
    ogDescription: "Otel yorumlarını profesyonelce yönetin: platform, AI, ton ve sıralama ipuçları.",
    author: "VoyageRespond",
    publishedAt: "2026-06-03",
    category: "Otel Yönetimi",
    readTime: "12 dk",
    keywords: ["otel yorum", "otel yorumları", "otel yorum yönetimi", "google otel", "otel siteleri"],
    content: `
Otel yorum yönetimi, bir otelin Google, Booking.com, TripAdvisor ve diğer platformlardaki misafir yorumlarını sistematik olarak takip etme, yanıtlama, analiz etme ve sıralamayı iyileştirme sürecidir. 2026 yılında bir otelin rezervasyon hacminin **%73'ü** doğrudan yorum puanlarına bağlıdır.

## Otel Yorum Yönetimi Neden Kritik?

- **Google Otel sıralaması** yorum puanı ve yanıt oranına göre belirlenir
- **Booking.com'da puan 0.1 artışı** rezervasyonu ortalama **%9** artırır
- **TripAdvisor Top 10** listesine girmek için 4.5+ puan ve aktif yanıt zorunlu
- Yorumlara yanıt veren oteller **%35 daha fazla güven** kazanır

## En Çok Kullanılan Otel Yorum Siteleri

1. **Google Otel** — Doğrudan rezervasyona bağlı, en yüksek hacim
2. **Booking.com** — Türkiye'de #1 rezervasyon platformu
3. **TripAdvisor** — Yabancı turistler için referans
4. **Hotels.com / Expedia** — Uluslararası seyahat
5. **Airbnb** — Butik otel ve villa
6. **Trivago** — Otel karşılaştırma trafiği

## Otel Yorumlarına Nasıl Cevap Verilir?

### Olumlu Yorumlara
- 24 saat içinde yanıtlayın
- Misafirin adını kullanın
- Spesifik bir detaydan bahsedin
- Tekrar davet edin

### Olumsuz Yorumlara
- Önce **sakin olun**, savunmaya geçmeyin
- **Spesifik sorunu** kabul edin
- Somut bir **çözüm** sunun
- İletişime davet edin (offline'a taşıyın)

## Otel Karşılaştırma Sitelerinde Üst Sıraya Çıkma

1. **Yorum hacmini artırın** — Check-out sonrası otomatik istek
2. **Yanıt oranını %95+** tutun
3. **Çok dilli yanıt** sunun (Booking sıralama sinyali)
4. **Düzenli fotoğraf ekleyin** (Google sinyali)
5. **AI ile hız kazanın** — günde 50+ yorum için manuel imkansız

## VoyageRespond ile Otel Yorum Yönetimi

[VoyageRespond](https://voyagerespond.com), Türkiye'nin lider otel yorum yönetim platformudur. Google, Booking.com, TripAdvisor, Hotels.com, Airbnb yorumlarını **tek panelden** toplar, AI ile **çok dilli profesyonel yanıt** üretir ve sıralama trendlerini takip eder.

### Şehre Özel Yönetim

- [İstanbul Otel Yorum Yönetimi](/otel-yorum-yonetimi/istanbul)
- [Antalya Otel Yorum Yönetimi](/otel-yorum-yonetimi/antalya)
- [Bodrum Otel Yorum Yönetimi](/otel-yorum-yonetimi/bodrum)
- [Kapadokya Otel Yorum Yönetimi](/otel-yorum-yonetimi/kapadokya)

**[3 ay ücretsiz deneyin →](https://voyagerespond.com/onboarding)**
    `
  },
  {
    slug: "tripadvisor-yorum-yonetimi-rehberi",
    title: "TripAdvisor Nedir, Yorumları Nasıl Yönetilir? 2026 Rehberi",
    description: "TripAdvisor nedir, otel ve restoran için neden önemli, yorumları nasıl yönetilir? Türkiye'deki işletmeler için kapsamlı rehber.",
    ogTitle: "TripAdvisor Yorum Yönetimi 2026 | VoyageRespond",
    ogDescription: "TripAdvisor yorumlarını profesyonelce yönetin: sıralama, yanıt, şikayet ve AI ipuçları.",
    author: "VoyageRespond",
    publishedAt: "2026-06-03",
    category: "Platform Rehberleri",
    readTime: "10 dk",
    keywords: ["tripadvisor yorum", "tripadvisor nedir", "tripadvisor yorum yönetimi", "tripadvisor sıralama"],
    content: `
TripAdvisor, dünya çapında **490+ milyon yoruma** sahip en büyük seyahat platformudur. Otel, restoran ve gezi yerleri için kullanıcılar deneyimlerini puanlayıp paylaşır. Türkiye'de özellikle yabancı turistler için **bir numaralı referans kaynağıdır**.

## TripAdvisor Nedir?

2000 yılında kurulan TripAdvisor, kullanıcı tarafından oluşturulan içeriklere dayalı bir seyahat platformudur:
- **Otel rezervasyonu** + karşılaştırma
- **Restoran** keşfi ve rezervasyonu
- **Gezi & deneyim** önerileri
- **Forum** tartışmaları

## TripAdvisor Sıralaması Nasıl Hesaplanır?

TripAdvisor "Popularity Index" üç ana faktöre dayanır:

1. **Kalite** — Ortalama puan (5 üzerinden)
2. **Yenilik** — Son 12 aydaki yorum hacmi ve trendler
3. **Hacim** — Toplam yorum sayısı

**Önemli:** Yanıt oranı doğrudan sıralama faktörü değildir ama **kullanıcı güven sinyali** olarak rezervasyonu etkiler.

## TripAdvisor Yorumlarına Nasıl Cevap Verilir?

### 1. Yönetici Hesabını Doğrulayın
TripAdvisor for Business üzerinden işletmenizi sahiplenin. Doğrulama 3-7 gün sürer.

### 2. Yanıtlama Pratikleri
- **24-48 saat** içinde yanıt
- **İngilizce ağırlıklı** (yabancı turist profili)
- **Spesifik detay** + tekrar davet
- Olumsuz yorumda **çözüm + iletişim**

### 3. Olumsuz Yorum Şikayeti
TripAdvisor yorum silme politikası **çok katıdır**. Sadece şu durumlarda silinir:
- Yanlış işletme yorumu
- Şantaj veya hakaret içeriği
- Sahte yorum (kanıtlanabilir)

Şikayet için "Report a review" linkini kullanın.

## TripAdvisor + AI ile Yorum Yönetimi

TripAdvisor'da haftada 20+ yorum alan bir otel için manuel yanıt imkansız hale gelir. VoyageRespond gibi AI platformları:

- TripAdvisor yorumlarını **otomatik çekip** panele taşır
- Sentiment analizi yapar (pozitif/nötr/negatif)
- **8 farklı tonda** yanıt önerir
- Çoklu dil desteği (TR/EN/DE/RU)
- Kopyala-yapıştır kolaylığı

## İlgili Rehberler

- [Otel Yorum Yönetimi Rehberi](/blog/otel-yorum-yonetimi-rehberi)
- [Google Yorumlarına Nasıl Yanıt Verilir](/blog/google-yorumlarina-nasil-yanit-verilir)
- [Booking.com Yorum Yönetimi](/platform/booking-yorumlari-icin-yapay-zeka)

**[3 ay ücretsiz deneyin →](https://voyagerespond.com/onboarding)**
    `
  },
  {
    slug: "otel-karsilastirma-sitelerinde-ust-siralara-cikma",
    title: "Otel Karşılaştırma Sitelerinde Üst Sıralara Çıkma Rehberi",
    description: "Trivago, Google Otel, Kayak gibi otel karşılaştırma sitelerinde üst sıralara çıkmanın 10 yolu. Sıralama algoritmaları ve pratik ipuçları.",
    ogTitle: "Otel Karşılaştırma Sitelerinde Üst Sıralara Çıkma | VoyageRespond",
    ogDescription: "Trivago, Google Otel, Kayak'ta üst sıralara çıkmak için yorum, fotoğraf ve fiyatlandırma stratejisi.",
    author: "VoyageRespond",
    publishedAt: "2026-06-03",
    category: "Otel Pazarlama",
    readTime: "9 dk",
    keywords: ["otel karşılaştırma", "otel siteleri", "trivago sıralama", "google otel sıralama"],
    content: `
Otel karşılaştırma siteleri (metasearch) — Trivago, Google Otel, Kayak, Trip.com — direkt rezervasyon almaz, ama **rezervasyonların yönlendirilmesinde kritik rol** oynar. Üst sıralarda olmak, doğrudan trafik demek.

## En Çok Kullanılan Otel Karşılaştırma Siteleri

1. **Google Otel** — Google aramalarına entegre, en yüksek hacim
2. **Trivago** — Avrupa'da #1, Türkiye'de güçlü
3. **Kayak** — ABD/İngiltere ağırlıklı
4. **Trip.com** — Asya pazarı
5. **HotelsCombined** — Karşılaştırma odaklı

## Sıralama Algoritmasını Anlamak

Her metasearch sitesinin algoritması farklı, ama ortak faktörler:

### 1. Puan ve Yorum Sayısı (%35 ağırlık)
- Genel puan
- Son 6 aydaki yorum sayısı
- Yanıt oranı (Google için kritik)

### 2. Fiyat Rekabeti (%25 ağırlık)
- En düşük fiyatlı OTA bağlantısı
- Fiyat tutarlılığı (rate parity)

### 3. İçerik Kalitesi (%20 ağırlık)
- Profesyonel fotoğraflar (10+ adet)
- Detaylı açıklama
- Amenity listesi

### 4. Davranış Sinyalleri (%20 ağırlık)
- Tıklama oranı (CTR)
- Bounce rate
- Conversion rate

## 10 Pratik Strateji

1. **Yanıt oranınızı %90+** tutun (Google sinyali)
2. **Aylık 20+ yeni yorum** hedefleyin
3. **Yüksek çözünürlüklü 15+ fotoğraf** ekleyin
4. **Tüm OTA'larda aynı fiyatı** koruyun
5. **Mevsimsel kampanyalar** ile fiyat avantajı yaratın
6. **Google Business Profile** bilgilerini güncel tutun
7. **Çok dilli açıklama** ekleyin (en az TR + EN)
8. **Amenity listesini** eksiksiz doldurun
9. **AI ile yorum yanıtlarını hızlandırın**
10. **Booking & TripAdvisor için ayrı strateji** uygulayın

## VoyageRespond ile Sıralama Yükseltme

VoyageRespond, tüm yorum platformlarınızı tek panelden yönetir:
- Yanıt oranınızı **%95+** tutmanıza yardımcı olur
- AI ile günlük 100+ yoruma saniyeler içinde yanıt
- Sıralama trendlerini analiz eder
- Şehre özel rakip karşılaştırması

## İlgili Rehberler

- [Otel Yorum Yönetimi Rehberi](/blog/otel-yorum-yonetimi-rehberi)
- [TripAdvisor Yorum Yönetimi](/blog/tripadvisor-yorum-yonetimi-rehberi)
- [Booking.com Yorum Yönetimi](/platform/booking-yorumlari-icin-yapay-zeka)

**[3 ay ücretsiz deneyin →](https://voyagerespond.com/onboarding)**
    `
  },
  {
    slug: "airbnb-sikayet-ve-yorum-yonetimi",
    title: "Airbnb Şikayet ve Yorum Yönetimi: Ev Sahipleri için Rehber",
    description: "Airbnb şikayetleri nasıl çözülür, olumsuz yoruma nasıl cevap verilir, Superhost olmak için 5 adım. Türkiye'deki Airbnb ev sahipleri için 2026 rehberi.",
    ogTitle: "Airbnb Şikayet ve Yorum Yönetimi | VoyageRespond",
    ogDescription: "Airbnb şikayetlerini profesyonelce çözün, Superhost statüsüne ulaşın.",
    author: "VoyageRespond",
    publishedAt: "2026-06-03",
    category: "Platform Rehberleri",
    readTime: "8 dk",
    keywords: ["airbnb şikayet", "airbnb yorum", "airbnb türkiye", "superhost"],
    content: `
Airbnb, Türkiye'de **350.000+ aktif listing** ile en büyük kısa dönem kiralama platformudur. Ev sahipleri için **yorum puanı ve yanıt hızı** her şeydir — Superhost statüsünden Search sıralamasına kadar her şey buna bağlı.

## Airbnb Şikayet Türleri ve Çözümleri

### 1. Temizlik Şikayetleri
- **En sık şikayet türü** (toplamın %35'i)
- **Çözüm:** Profesyonel temizlik servisi + check-in öncesi kontrol fotoğrafı
- **Yanıt tonu:** Samimi özür + somut iyileştirme adımı

### 2. Konum Yanıltıcılığı
- "Reklamdan farklı" şikayeti
- **Çözüm:** Listing açıklamasında ulaşım süreleri net belirtin
- **Önleyici:** Çevre fotoğrafları ekleyin

### 3. Eşya/Donanım Eksikliği
- WiFi, klima, sıcak su gibi temel eksikler
- **Çözüm:** Anında telafi (indirim/iade) + 24 saat içinde onarım

### 4. Komşu/Gürültü Sorunları
- **Çözüm:** House rules'da sessizlik saatleri belirtin, gerekirse komşulara haber verin

## Airbnb Yorumlarına Nasıl Cevap Verilir?

- **48 saat içinde** yanıtlayın (Superhost kriteri)
- **Karşılıklı yorum** sistemi — siz yorum yazana kadar misafirin yorumu görünmez
- **Olumsuz yoruma yanıt yazın** — yeni misafirler bunu okuyacak
- **Profesyonel ton** kullanın, savunmaya geçmeyin

## Superhost Olmak İçin 5 Kriter

1. **Yıllık 10+ konaklama** veya 100 gece
2. **%90+ yanıt oranı** (24 saat içinde)
3. **%1'den az iptal oranı**
4. **4.8+ ortalama puan**
5. Son yılda en az **bir tane 5 yıldız** yorum

Superhost rozeti **rezervasyonu %22 artırır** (Airbnb verisi).

## Birden Fazla Listing Yönetenler için AI

5+ daire/villa yöneten ev sahipleri için manuel yanıt imkansız. VoyageRespond:
- Tüm Airbnb listing'lerinizi **tek panele** toplar
- AI ile **çok dilli yanıt** üretir (TR/EN/RU/DE)
- Sentiment analizi ve uyarılar
- Superhost kriterlerini takip eder

## İlgili Rehberler

- [Otel Yorum Yönetimi Rehberi](/blog/otel-yorum-yonetimi-rehberi)
- [Booking.com Yorum Yönetimi](/platform/booking-yorumlari-icin-yapay-zeka)
- [Airbnb Yorumları için Yapay Zeka](/platform/airbnb-yorumlari-icin-yapay-zeka)

**[3 ay ücretsiz deneyin →](https://voyagerespond.com/onboarding)**
    `
  }
];
blogPosts.push(...seoTargetedPosts);
blogPosts.push(...restoranClusterPosts);
blogPosts.push(...memnuniyetClusterPosts);
const getBlogPost = (slug) => {
  return blogPosts.find((post) => post.slug === slug);
};
const lazyDefault = (importer) => async () => ({ Component: (await importer()).default });
const lazyProtectedLayout = (importer) => async () => {
  const Page = (await importer()).default;
  return {
    Component: () => /* @__PURE__ */ jsx(ProtectedRoute, { children: /* @__PURE__ */ jsx(AppLayout, { children: /* @__PURE__ */ jsx(Page, {}) }) })
  };
};
const lazyProtected = (importer) => async () => {
  const Page = (await importer()).default;
  return {
    Component: () => /* @__PURE__ */ jsx(ProtectedRoute, { children: /* @__PURE__ */ jsx(Page, {}) })
  };
};
const lazyProtectedTiktokLayout = (importer) => async () => {
  const Page = (await importer()).default;
  return {
    Component: () => /* @__PURE__ */ jsx(ProtectedRoute, { children: /* @__PURE__ */ jsx(AppLayout, { children: /* @__PURE__ */ jsx(Page, {}) }) })
  };
};
function EnRedirect() {
  const loc = useLocation();
  const target = loc.pathname.replace(/^\/en/, "") || "/";
  return /* @__PURE__ */ jsx(Navigate, { to: target + loc.search + loc.hash, replace: true });
}
const loadCityHotelSlugs = () => cityHotelData.map((x) => x.slug).filter(Boolean);
const loadPlatformSlugs = () => platformLandingPages.map((x) => x.slug).filter(Boolean);
const loadBlogSlugs = () => {
  const all = [...blogPosts, ...restoranClusterPosts, ...memnuniyetClusterPosts];
  return [...new Set(all.map((p) => p.slug).filter(Boolean))];
};
const routes = [
  {
    path: "/",
    Component: RootLayout,
    children: [
      // ---------- Public / SEO (prerendered) ----------
      { index: true, lazy: lazyDefault(() => import("./assets/Index-Be7KSU2o.js")) },
      { path: "login", lazy: lazyDefault(() => import("./assets/Login-DxXaWsWX.js")) },
      { path: "register", lazy: lazyDefault(() => import("./assets/Register-DPQaVFGN.js")) },
      { path: "forgot-password", lazy: lazyDefault(() => import("./assets/ForgotPassword-BagoNsSm.js")) },
      { path: "privacy-policy", lazy: lazyDefault(() => import("./assets/PrivacyPolicy-C_5_NG5f.js")) },
      { path: "terms-of-service", lazy: lazyDefault(() => import("./assets/TermsOfService-OoPlRZsX.js")) },
      { path: "auth/callback", lazy: lazyDefault(() => import("./assets/AuthCallback-BFi1McVy.js")) },
      { path: "auth/google-business/callback", lazy: lazyDefault(() => import("./assets/GoogleBusinessCallback-CS_KAAt0.js")) },
      { path: "auth/reset", lazy: lazyDefault(() => import("./assets/ResetPassword-CFSr82iX.js")) },
      { path: "onboarding", lazy: lazyDefault(() => import("./assets/Onboarding-QbC0-2Eb.js")) },
      { path: "hub", lazy: lazyDefault(() => import("./assets/Hub-CmITEn-k.js")) },
      { path: "pricing", Component: () => /* @__PURE__ */ jsx(Navigate, { to: "/#pricing", replace: true }) },
      { path: "contact", lazy: lazyDefault(() => import("./assets/Contact-BLTSid-X.js")) },
      { path: "demo", lazy: lazyDefault(() => import("./assets/DemoPage-BbNDDaz0.js")) },
      { path: "about", lazy: lazyDefault(() => import("./assets/About-CswEEdQi.js")) },
      { path: "blog", lazy: lazyDefault(() => import("./assets/Blog-N5av_pUC.js")) },
      {
        path: "blog/:slug",
        lazy: lazyDefault(() => import("./assets/BlogPost-DzaDgEIx.js")),
        getStaticPaths: () => loadBlogSlugs().map((s) => `blog/${s}`)
      },
      { path: "google-yorum-cevap-ornekleri", lazy: lazyDefault(() => import("./assets/GoogleYorumCevapOrnekleri-BiN2eOnY.js")) },
      { path: "restoran-yorum-cevaplari", lazy: lazyDefault(() => import("./assets/RestoranYorumCevaplari-BILHSy3G.js")) },
      { path: "otel-yorum-cevaplari", lazy: lazyDefault(() => import("./assets/OtelYorumCevaplari-C29LHYgY.js")) },
      {
        path: "otel-yorum-yonetimi/:sehir",
        lazy: lazyDefault(() => import("./assets/SehirOtelYorumYonetimi-CoSHGHXu.js")),
        getStaticPaths: () => loadCityHotelSlugs().map((s) => `otel-yorum-yonetimi/${s}`)
      },
      { path: "yorum-yonetim-araclari", lazy: lazyDefault(() => import("./assets/YorumYonetimAraclari-Gj29AJmo.js")) },
      { path: "online-itibar-yonetimi", lazy: lazyDefault(() => import("./assets/OnlineItibarYonetimi-BZ172dNi.js")) },
      { path: "musteri-memnuniyeti", lazy: lazyDefault(() => import("./assets/MusteriMemnuniyeti-KXVKf3Gi.js")) },
      { path: "restoran-musteri-memnuniyeti", lazy: lazyDefault(() => import("./assets/RestoranMusteriMemnuniyeti-CvdTarFC.js")) },
      {
        path: "platform/:slug",
        lazy: lazyDefault(() => import("./assets/PlatformLanding-CCDNBJov.js")),
        getStaticPaths: () => loadPlatformSlugs().map((s) => `platform/${s}`)
      },
      { path: "automations/instagram-sales", lazy: lazyDefault(() => import("./assets/InstagramSales-o_x9kibw.js")) },
      { path: "automations/google-reviews", lazy: lazyDefault(() => import("./assets/GoogleReviews-HVoLWzgG.js")) },
      { path: "automations/whatsapp", lazy: lazyDefault(() => import("./assets/WhatsAppAutomation-DWlXJrio.js")) },
      { path: "automations/other", lazy: lazyDefault(() => import("./assets/OtherAutomations-DO3w9Nev.js")) },
      // ---------- Protected (not prerendered; render at runtime only) ----------
      { path: "auth/tiktok/callback", lazy: lazyDefault(() => import("./assets/TikTokCallback-Gq2J2mLm.js")) },
      { path: "channels/tiktok", lazy: lazyProtected(() => import("./assets/TikTok-z0KcKPsT.js")) },
      { path: "tiktok-inbox", lazy: lazyProtectedTiktokLayout(() => import("./assets/TikTokInbox-p0g4adP8.js")) },
      { path: "tiktok-review-kit", lazy: lazyProtected(() => import("./assets/TikTokReviewKit-B8rWiVt5.js")) },
      { path: "tiktok-dm", lazy: lazyProtected(() => import("./assets/TikTokDMInbox-BZqRuRtm.js")) },
      { path: "share/:businessSlug", lazy: lazyDefault(() => import("./assets/StoryKit-FH3j6efV.js")) },
      { path: "story-kit", lazy: lazyProtected(() => import("./assets/StoryKitSettings-vYE1E6rC.js")) },
      { path: "locations", lazy: lazyProtectedLayout(() => import("./assets/Locations-DTYU9I0m.js")) },
      { path: "locations/platform-ratings", lazy: lazyProtectedLayout(() => import("./assets/PlatformRatings-DxfRYeR6.js")) },
      { path: "locations/platform-ratings/:id", lazy: lazyProtectedLayout(() => import("./assets/PlatformRatingDetail-DRpeNDyM.js")) },
      { path: "dashboard", lazy: lazyProtectedLayout(() => import("./assets/Dashboard-C5SKT00t.js")) },
      { path: "inbox", lazy: lazyProtectedLayout(() => import("./assets/Inbox-B_SO2QQL.js")) },
      { path: "reviews", lazy: lazyProtectedLayout(() => import("./assets/Reviews-fu--EQ89.js")) },
      { path: "reviews/:id", lazy: lazyProtectedLayout(() => import("./assets/ReviewDetailPage-C1qZGMHP.js")) },
      { path: "auto-reply", lazy: lazyProtectedLayout(() => import("./assets/AutoReply-Cap8_JT5.js")) },
      { path: "statistics", lazy: lazyProtectedLayout(() => import("./assets/Statistics-Co5umsAf.js")) },
      { path: "report", lazy: lazyProtectedLayout(() => import("./assets/Report-DIW9KvWy.js")) },
      { path: "chat", lazy: lazyProtectedLayout(() => import("./assets/ChatWithReviewsPage-Bv7OtIEH.js")) },
      { path: "settings", lazy: lazyProtectedLayout(() => import("./assets/Settings-DWNqLobu.js")) },
      { path: "email", lazy: lazyProtectedLayout(() => import("./assets/EmailCenter-C51m3Fwe.js")) },
      { path: "performance", lazy: lazyProtectedLayout(() => import("./assets/GooglePerformance-DUUpMnjS.js")) },
      { path: "rep-score", lazy: lazyProtectedLayout(() => import("./assets/RepScore-quGelyDr.js")) },
      { path: "google-accounts", lazy: lazyProtectedLayout(() => import("./assets/GoogleAccounts-quKTlPjk.js")) },
      { path: "admin/apify-logs", lazy: lazyDefault(() => import("./assets/AdminApifyLogs-BDev6xvC.js")) },
      { path: "youtube", lazy: lazyProtectedLayout(() => import("./assets/YouTubeInbox-BQ0R97A5.js")) },
      { path: "social-analytics", lazy: lazyProtectedLayout(() => import("./assets/SocialAnalytics-whtzgM52.js")) },
      { path: "intelligence", lazy: lazyProtectedLayout(() => import("./assets/Intelligence-CgeXjK2X.js")) },
      { path: "intelligence/karsilastirma", lazy: lazyProtectedLayout(() => import("./assets/IntelligenceComparison-iPZN_vA_.js")) },
      // ---------- /en/* runtime redirect (no SSG) ----------
      { path: "en/*", Component: EnRedirect },
      // ---------- 404 ----------
      { path: "*", lazy: lazyDefault(() => import("./assets/NotFound-ehSaTFZl.js")) }
    ]
  }
];
const nav$1 = {
  home: "Home",
  features: "Features",
  pricing: "Pricing",
  documentation: "Documentation",
  login: "Login",
  dashboard: "Dashboard",
  getStarted: "Get Started",
  automations: "Automations",
  hub: "Hub",
  contact: "Contact"
};
const landing$1 = {
  aiReplyDemo: {
    badge: "Interactive Demo",
    title: "Try AI Reply Suggestions",
    subtitle: "See how our AI generates professional, on-brand replies for any review. Select a sample review and click generate.",
    selectReview: "Select a Review",
    generatedReply: "AI-Generated Reply",
    selectedReview: "Selected Review",
    generate: "Generate AI Reply",
    generating: "Generating AI Reply...",
    regenerate: "Regenerate Reply",
    copied: "Reply copied to clipboard!",
    error: "Failed to generate reply. Please try again.",
    demoNote: "This is a demo. Sign up to use AI replies on your real Google reviews.",
    emptyState: 'Click "Generate AI Reply" to see the magic ✨',
    positive: "Positive",
    neutral: "Neutral",
    negative: "Negative",
    review1: "Food was amazing but the service was a bit slow. We waited 30 minutes for our main course. Would still come back though!",
    review2: "Best coffee in town! The barista was super friendly and the atmosphere is perfect for working. Highly recommend!",
    review3: "Disappointed with my experience. The pizza was cold and the staff seemed uninterested. Won't be coming back."
  },
  chatDemo: {
    badge: "AI-Powered Analysis",
    title: "Chat with Your Reviews",
    subtitle: "Ask questions about your customer feedback and get AI-powered insights instantly."
  },
  gated: {
    title: "Sign Up to Try the Demo",
    description: "Create a free account to test all features",
    signup: "Sign Up for Free"
  },
  aiVisibilityBadge: "Powered by AI Visibility Engine",
  freemiumCta: {
    badge: "AI Visibility Engine",
    title: "How does your business look on AI?",
    subtitle: "Discover your AI Visibility Score instantly. See how you rank on Google Search, AI assistants, and get smart recommendations to boost your online presence.",
    cta: "Check My AI Score - Free",
    subtext: "No credit card required"
  },
  demoTeaser: {
    badge: "Try for Free",
    title: "Try All Features for Free",
    subtitle: "Sign up and explore all interactive demos of the platform.",
    tryNow: "Try Free",
    cards: {
      visibility: "AI Visibility Score",
      visibilityDesc: "How does your business look on AI?",
      aiReply: "AI Reply Suggestions",
      aiReplyDesc: "Professional AI replies for every review",
      dashboard: "Dashboard Tools",
      dashboardDesc: "Chat, priorities, competitor analysis",
      storyKit: "Story Kit",
      storyKitDesc: "Free social media marketing"
    }
  },
  heroLine1: "Manage Your Reviews.",
  heroLine2: "Grow with AI.",
  heroSubtitle: "An AI-powered platform that helps you smartly manage your business reviews and boost your AI visibility.",
  heroSubtitle2: "Get your AI Visibility Score, smart reply suggestions, and real-time performance insights.",
  valueProp1: "AI Visibility Score",
  valueProp2: "Review Optimization",
  valueProp3: "Performance Tracking",
  heroCta: "See Your AI Visibility Score",
  tryDemo: "Try AI Reply Demo",
  automationsTitle: "Choose Your Automations",
  automationsSubtitle: "Each channel is independent. Enable one, or combine multiple — it's your choice.",
  useCasesTitle: "Use one automation — or combine multiple channels",
  useCasesSubtitle: "You're not buying a single product. You're choosing modules that fit your business.",
  howItWorksTitle: "How It Works",
  howItWorksSubtitle: "Get started in minutes, not days.",
  pricingTitle: "Pay for the platform. Activate the automations you need.",
  pricingSubtitle: "Start with one automation and add more as you grow.",
  monthly: "Monthly",
  yearly: "Yearly",
  mostPopular: "Most Popular",
  whyAIVisibility: "Why AI Visibility Matters",
  whyAIVisibilityDesc: "Your reviews don't just influence customers — they train AI models. Google's AI Overviews, ChatGPT, and other AI assistants use your review content to recommend businesses. Our Reviewer AI Engine analyzes your reviews, suggests optimized responses, and tracks how your business appears in AI-powered search results.",
  aiFeature1: "AI Visibility Score: See how AI assistants perceive your business",
  aiFeature2: "Answer Optimization: Craft replies that boost search visibility",
  aiFeature3: "AI Recommendation Panel: Know which reviews to prioritize",
  ctaTitle: "Ready to boost your AI visibility?",
  ctaSubtitle: "Get your free AI Visibility Score and see how your business appears to AI assistants.",
  learnMore: "Learn More",
  automations: {
    instagram: {
      title: "Instagram Sales",
      feature1: "Comment → DM automation",
      feature2: "AI-powered DM replies",
      feature3: "Product & session sales",
      cta: "Enable Instagram Automation"
    },
    googleReviews: {
      title: "Google Reviews + AI Visibility",
      feature1: "AI Visibility Score & insights",
      feature2: "Smart review reply suggestions",
      feature3: "Sentiment & search optimization",
      cta: "See Your AI Visibility Score"
    },
    tiktok: {
      title: "TikTok",
      feature1: "Login Kit integration",
      feature2: "Account connection",
      feature3: "Coming soon: Inbox automation",
      cta: "Connect TikTok"
    },
    whatsapp: {
      title: "WhatsApp",
      feature1: "Shared inbox",
      feature2: "Customer conversations",
      feature3: "Business messaging",
      cta: "Notify Me"
    }
  },
  useCases: {
    instagram: {
      title: "Only Instagram Sales",
      description: "Perfect for creators and e-commerce brands who sell through DMs"
    },
    google: {
      title: "Google Reviews + AI Visibility",
      description: "Boost your local search ranking with AI-powered review insights and visibility tracking"
    },
    multi: {
      title: "Full Visibility Stack",
      description: "Combine social engagement with AI visibility for maximum discoverability"
    }
  },
  howItWorks: {
    step1: {
      title: "Connect & Analyze",
      description: "Link your Google Business Profile. Our AI instantly calculates your Visibility Score."
    },
    step2: {
      title: "Get Smart Recommendations",
      description: "AI tells you which reviews to answer, when to respond, and how to optimize for search."
    },
    step3: {
      title: "Track Your Growth",
      description: "Monitor visibility metrics, sentiment trends, and review performance in real-time."
    }
  },
  pricingPlans: {
    starter: {
      name: "Starter",
      description: "Platform access with 1 automation",
      feature1: "Core platform access",
      feature2: "1 automation (Instagram or Google)",
      feature3: "500 messages/month",
      feature4: "Basic analytics"
    },
    pro: {
      name: "Pro",
      description: "Up to 2 automations + analytics",
      feature1: "Core platform access",
      feature2: "Up to 2 automations",
      feature3: "Unlimited messages",
      feature4: "Advanced analytics",
      feature5: "Priority support"
    },
    agency: {
      name: "Agency",
      description: "All automations + team access",
      feature1: "Core platform access",
      feature2: "All automations included",
      feature3: "Team access (5 members)",
      feature4: "Full analytics suite",
      feature5: "Custom integrations"
    }
  },
  comingSoon: "Coming Soon",
  yearlyDiscount: "2 months free",
  perMonth: "/month",
  choosePlan: "Choose Plan",
  contact: "Contact",
  metrics: {
    title: "VoyageRespond by the Numbers",
    subtitle: "Trusted by thousands of businesses",
    aiReplies: "AI Replies Generated",
    reviewsManaged: "Reviews Managed",
    activeBusinesses: "Active Businesses",
    responseImprovement: "Response Speed Improvement"
  },
  video: {
    title: "Discover VoyageRespond",
    subtitle: "See how the platform works in 30 seconds",
    comingSoon: "Demo Video Coming Soon",
    loading: "Loading video...",
    goBack: "Go Back",
    step1: "Account Connection",
    step2: "AI Reply Generation",
    step3: "Reply Submission"
  },
  storyKit: {
    badge: "New Feature",
    title: "Free Marketing with Story Kit",
    subtitle: "Let your customers share your business on Instagram. Create branded stories, gain organic reach.",
    selectBusiness: "Select Demo Business",
    addPhoto: "Add Photo (Optional)",
    uploadedPhoto: "Uploaded photo",
    uploadPrompt: "Add food, venue, or memory photo",
    fileTooLarge: "File too large",
    maxFileSize: "Maximum file size is 10MB.",
    customerMessage: "Customer Message",
    messagePlaceholder: "It was a great experience...",
    colorCustomization: "Color Customization",
    background: "Background",
    accentColor: "Accent Color",
    generating: "Generating...",
    generateStory: "Generate Story",
    storyReady: "Story ready! 🎉",
    storyCreated: "Sample story created successfully.",
    downloadStory: "Download Story",
    downloaded: "Downloaded!",
    storyDownloaded: "Your story image has been downloaded.",
    shareOnInstagram: "Share on Instagram",
    tabStory: "📱 Story",
    tabMaterials: "🖨️ Materials",
    tabWebsite: "💻 Website",
    createdWith: "Created with Voyagerespond"
  },
  visibilityChecker: {
    freeDemo: "Free Demo",
    title: "How Does AI See You?",
    subtitle: "Enter your business name and location to see how AI assistants perceive you",
    businessPlaceholder: "Your business name",
    locationPlaceholder: "Location",
    analyzing: "Analyzing...",
    analyze: "Analyze",
    remainingTries: "Remaining tries",
    unlimitedAnalysis: "for unlimited analysis",
    register: "register",
    trialEnded: "Your free trial has ended",
    trialEndedDesc: "Create a free account for unlimited analysis and access to all features.",
    freeSignup: "Free Sign Up",
    pleaseEnterBusiness: "Please enter a business name",
    analysisFailed: "Analysis failed",
    errorOccurred: "An error occurred during analysis",
    scoreGood: "Good",
    scoreMedium: "Medium",
    scoreNeedsImprovement: "Needs Improvement",
    visibilityScoreFor: "AI Visibility Score for",
    locationBasedRanking: "Location-Based Ranking",
    amongCompetitors: "competitors",
    aiShowsYou: "AI assistants show you at position",
    forQueries: "for queries like",
    customerSatisfaction: "Customer Satisfaction",
    reviews: "reviews",
    highlights: "Highlights"
  },
  visibilityDemo: {
    excellent: "Excellent",
    good: "Good",
    medium: "Medium",
    needsImprovement: "Needs Improvement",
    thisMonth: "this month",
    averageRating: "Average Rating",
    responseRate: "Response Rate",
    positiveReviews: "Positive Reviews",
    totalReviews: "Total Reviews",
    liveData: "Live Data"
  },
  testimonials: {
    title: "What Our Customers Say",
    subtitle: "Trusted by 850+ businesses",
    testimonial1: {
      quote: "I now respond to Google reviews in 30 seconds instead of 5 minutes. The AI suggestions are really professional and the tone settings work perfectly.",
      name: "Ahmet Y.",
      role: "Business Owner"
    },
    testimonial2: {
      quote: "Responding to TikTok comments instantly increased our sales by 40%. With Story Kit, our customers create content, we just share it.",
      name: "Zeynep K.",
      role: "Marketing Director"
    },
    testimonial3: {
      quote: "We manage all reviews of our 3 hotels from a single panel. Thanks to the AI Visibility score, we've climbed to the top of Google.",
      name: "Mehmet D.",
      role: "General Manager"
    },
    testimonial4: {
      quote: "I didn't know how to respond to negative reviews. The AI's empathetic tone suggestion won back the customer.",
      name: "Elif Ö.",
      role: "Founder"
    }
  },
  trustBadges: {
    gdpr: "GDPR Compliant",
    gdprDesc: "European data protection standards",
    ssl: "256-bit SSL",
    sslDesc: "Encrypted data transfer",
    euData: "EU Data Center",
    euDataDesc: "Data hosted in Europe",
    soc2: "SOC 2 Type II",
    soc2Desc: "Security audit certified",
    apiIntegrations: "Official API Integrations",
    countriesUsed: "Used in 180+ Countries"
  },
  storyKitDemo: {
    howItWorks: "How It Works?",
    step1: "Set hashtag and colors for your business",
    step2: "Download QR code and place on your table/counter",
    step3: "Customers scan, create stories and share",
    step4: "Track your sharing statistics",
    phonePrompt: 'Click "Generate Story" to create a sample Instagram Story',
    downloadStoryBtn: "Download Story",
    tableStand: "Table Stand / QR Code",
    tableStandDesc: "QR code design for your table or counter",
    scanToCreate: "Scan to create a story",
    sizeOptions: "Square",
    customizableSizes: "✓ Customizable sizes and colors",
    highResDownload: "✓ High resolution PNG download",
    printReady: "✓ Ready for instant printing",
    shareLink: "Share Link",
    shareLinkDesc: "Link to share via WhatsApp, SMS, or social media",
    whatsappTemplate: "Thank you for visiting us! 🙏 Would you like to share your experience on Instagram?",
    readyTemplates: "✓ Ready message templates",
    oneClickCopy: "✓ One-click copy",
    suitableFor: "✓ Suitable for WhatsApp, SMS, Email",
    websiteButton: "Website Button",
    websiteButtonDesc: "Single line of code to add to your website",
    createStory: "Create Story",
    copied: "Copied!",
    copyEmbedCode: "Copy Embed Code",
    floatingPopup: "Floating Popup",
    floatingPopupDesc: "Fixed popup button in the bottom right corner",
    sitePreview: "Site preview",
    widgetTypes: "✓ 3 different widget types",
    colorCustom: "✓ Color customization",
    singleLineJs: "✓ Single line JavaScript",
    activateNow: "Activate Story Kit for your business now",
    startFree: "Start Free"
  },
  dashboardDemo: {
    badge: "Dashboard Preview",
    title: "Powerful Dashboard Tools",
    subtitle: "AI-powered insights, priority management, and competitive analysis - all in one place."
  },
  priorityDemo: {
    title: "Priority Actions",
    subtitle: "Reviews that need to be answered today",
    critical: "Critical",
    urgent: "Urgent",
    normal: "Normal",
    reply: "Reply",
    cta: "Manage All Reviews"
  },
  competitorDemo: {
    title: "Competitor Comparison",
    subtitle: "Compare your AI visibility with competitors",
    placeholder: "Competitor business name...",
    metric: "Metric",
    you: "You",
    insights: "AI Insights:",
    hint: "Enter competitor name to compare AI visibility",
    cta: "Compare with Real Data"
  }
};
const hero$1 = {
  title: "Transform Your Google Reviews Into Growth",
  subtitle: "AI-powered review management that helps you respond faster, analyze deeper, and build stronger customer relationships.",
  cta: "Start Managing Reviews"
};
const features$1 = {
  title: "Everything you need to manage reviews",
  subtitle: "Powerful features designed to help you respond to every review efficiently",
  smartManagement: {
    title: "Smart Review Management",
    description: "Manage all your Google Business reviews in one clean, organized dashboard"
  },
  aiPowered: {
    title: "AI-Powered Responses",
    description: "Generate professional responses instantly with customizable tone and language"
  },
  deepAnalytics: {
    title: "Deep Analytics",
    description: "Track sentiment trends, response rates, and key insights from your reviews"
  }
};
const pricing$1 = {
  title: "Simple, transparent pricing",
  subtitle: "Choose the plan that fits your business",
  monthly: "Monthly",
  yearly: "Yearly",
  yearlyDiscount: "(Save 20%)",
  perMonth: "/month",
  popular: "Most Popular",
  starter: {
    name: "Starter",
    description: "Perfect for single-location businesses",
    features: {
      locations: "1 location",
      reviews: "200 reviews/month",
      dashboard: "Dashboard access",
      aiGeneration: "AI response generation",
      manual: "Manual approve and copy"
    }
  },
  pro: {
    name: "Pro",
    description: "For growing businesses",
    features: {
      locations: "3 locations",
      reviews: "Unlimited reviews",
      autoReply: "Auto Reply",
      googleApi: "Google API reply sending",
      support: "Priority support"
    }
  },
  agency: {
    name: "Agency",
    description: "Scale with your agency",
    features: {
      locations: "Unlimited locations",
      team: "Team access",
      analytics: "Advanced analytics",
      whitelabel: "White label option",
      customSupport: "Custom support"
    }
  }
};
const cta$1 = {
  title: "Ready to elevate your customer relationships?",
  subtitle: "Join businesses that save time and build better customer relationships with AI-powered review responses.",
  button: "Get Started Now"
};
const footer$1 = {
  quickLinks: "Quick Links",
  description: "AI-powered review management & visibility optimization platform.",
  address: "Address",
  copyright: "© 2025 VoyageRespond",
  privacy: "Privacy Policy",
  terms: "Terms of Service"
};
const contact$1 = {
  backToHome: "Home",
  title: "Contact Us",
  subtitle: "Get in touch with us for questions, suggestions, or support requests.",
  email: "Email",
  sendEmail: "Send Email",
  responseTime: "Response Time",
  responseTimeDesc: "We typically respond within 24 hours",
  location: "Location",
  locationValue: "Turkey"
};
const auth$1 = {
  login: {
    title: "Login",
    subtitle: "Welcome back! Please sign in to continue.",
    email: "Email",
    password: "Password",
    forgotPassword: "Forgot password?",
    submit: "Login",
    noAccount: "Don't have an account?",
    register: "Register",
    error: "Invalid email or password",
    emailNotVerified: "Your email address has not been verified yet. Please click the verification link sent to your inbox."
  },
  register: {
    title: "Create Account",
    subtitle: "Get started with VoyageRespond today.",
    fullName: "Full Name",
    email: "Email",
    password: "Password",
    submit: "Create Account",
    hasAccount: "Already have an account?",
    login: "Login",
    success: "Account created successfully! Please check your email to verify your account.",
    error: "An error occurred during registration",
    googleSignIn: "Sign up with Google",
    orEmail: "or with email"
  },
  forgotPassword: {
    title: "Reset Password",
    subtitle: "Enter your email address and we'll send you a reset link.",
    email: "Email",
    submit: "Send Reset Link",
    backToLogin: "Back to Login",
    success: "Password reset link sent! Please check your email.",
    error: "An error occurred. Please try again."
  },
  authCallback: {
    title: "Email Verification",
    verifying: "Verifying your account...",
    error: "An error occurred during verification.",
    success: "Account verified successfully! Redirecting...",
    noSession: "Session not found. Redirecting to login..."
  }
};
const dashboard$1 = {
  subtitle: "Dashboard Overview",
  metrics: {
    avgRating: "Average Rating",
    outOf5: "out of 5",
    totalReviews: "Total Reviews",
    allTime: "all time",
    weeklyReviews: "This Week's Reviews",
    pendingReplies: "Pending Replies",
    needsAttention: "needs attention"
  },
  weeklyTitle: "This Week's Reviews",
  dayReviews: "Reviews",
  noReviews: "No reviews yet for this business.",
  noReviewsSub: "Reviews will appear here once added.",
  noDayReviews: "No reviews found for this day.",
  seeReply: "See Reply",
  demo: {
    bannerTitle: "Demo Mode Active",
    bannerSubtitle: "You're exploring the platform with sample data. Connect your account to see your real data.",
    connectCta: "Connect Google Business",
    upgradePro: "Upgrade to Pro",
    upgradeText: "Upgrade to Pro to use {{feature}} with your real data",
    upgradeButton: "Explore Pro Plan",
    seeExample: "Example Reply",
    features: {
      priorityActions: "Priority Actions",
      chatWithReviews: "Chat with Reviews",
      competitorAnalysis: "Competitor Analysis"
    },
    bottomCta: {
      title: "Ready to work with your real data?",
      subtitle: "Connect your Google Business account and start managing your real customer reviews with AI.",
      button: "Connect My Account & Start"
    }
  }
};
const reviews$1 = {
  title: "Reviews",
  filters: {
    all: "All",
    pending: "Pending",
    replied: "Replied"
  },
  sentiment: {
    positive: "Positive",
    neutral: "Neutral",
    negative: "Negative"
  },
  copyReply: "Copy Reply",
  copiedSuccess: "Reply copied to clipboard!"
};
const settings$1 = {
  title: "Settings",
  profile: "Profile",
  business: "Business Settings",
  account: "Account"
};
const privacy$1 = {
  title: "Privacy Policy",
  lastUpdated: "Last updated: December 2025",
  backToHome: "Back to Home",
  sections: {
    introduction: {
      title: "Introduction",
      content: "Welcome to VoyageRespond. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our service. We are committed to protecting your privacy and ensuring the security of your personal data."
    },
    informationWeCollect: {
      title: "Information We Collect",
      content: "We collect information you provide directly to us, including: your name and email address when you create an account; your business information such as business name and Google Place ID; Google Business Profile data when you connect your account (including reviews, ratings, and reviewer information); usage data such as how you interact with our service; and technical data including IP address, browser type, and device information."
    },
    howWeUseInformation: {
      title: "How We Use Your Information",
      content: "We use the information we collect to: provide, maintain, and improve our services; generate AI-powered responses to your business reviews; analyze review sentiment and provide insights; communicate with you about your account and our services; send you technical notices, updates, and support messages; detect, prevent, and address technical issues and security threats; and comply with legal obligations."
    },
    googleBusinessData: {
      title: "Google Business Profile Data Use",
      content: "When you connect your Google Business Profile to VoyageRespond, we access your business reviews and related information through the Google Business Profile API. We use this data solely to: display your reviews within our dashboard; generate AI-powered response suggestions; analyze review sentiment and trends; and send replies to reviews on your behalf when you authorize it. We do not use your Google Business Profile data for advertising purposes or share it with third parties for their marketing purposes."
    },
    dataSharing: {
      title: "Data Sharing",
      content: "We do not sell your personal information. We may share your information with: service providers who assist us in operating our platform (such as hosting providers and AI services); professional advisors such as lawyers and accountants when necessary; law enforcement or government authorities when required by law; and in connection with a merger, acquisition, or sale of assets. All third-party service providers are bound by confidentiality obligations."
    },
    dataRetention: {
      title: "Data Retention & Deletion",
      content: "We retain your personal information for as long as your account is active or as needed to provide you services. You may request deletion of your account and associated data at any time by contacting us at support@voyagerespond.com. Upon deletion request, we will remove your personal data within 30 days, except where retention is required by law or for legitimate business purposes such as fraud prevention."
    },
    security: {
      title: "Security Practices",
      content: "We implement appropriate technical and organizational measures to protect your personal information, including: encryption of data in transit and at rest; secure authentication mechanisms; regular security assessments and updates; access controls limiting who can access your data; and monitoring for suspicious activity. However, no method of transmission over the Internet is 100% secure, and we cannot guarantee absolute security."
    },
    userRights: {
      title: "Your Rights",
      content: "Depending on your location, you may have the following rights regarding your personal information: the right to access and receive a copy of your data; the right to correct inaccurate information; the right to delete your data; the right to restrict or object to processing; the right to data portability; and the right to withdraw consent. To exercise these rights, please contact us at support@voyagerespond.com."
    },
    internationalTransfers: {
      title: "International Transfers",
      content: "Your information may be transferred to and processed in countries other than your country of residence. These countries may have data protection laws that are different from your country. We ensure appropriate safeguards are in place to protect your information when it is transferred internationally, including standard contractual clauses approved by relevant authorities."
    },
    changes: {
      title: "Changes to This Policy",
      content: "We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new Privacy Policy on this page and updating the 'Last updated' date. Your continued use of the service after any modifications constitutes your acceptance of the updated Privacy Policy."
    },
    contact: {
      title: "Contact Information",
      content: "If you have any questions about this Privacy Policy or our data practices, please contact us at: support@voyagerespond.com. We will respond to your inquiry within a reasonable timeframe."
    }
  }
};
const terms$1 = {
  title: "Terms of Service",
  lastUpdated: "Last updated: December 2025",
  backToHome: "Back to Home",
  sections: {
    introduction: {
      title: "Introduction",
      content: "Welcome to VoyageRespond. These Terms of Service govern your access to and use of our website, products, and services. By accessing or using VoyageRespond, you agree to be bound by these Terms. If you do not agree to these Terms, please do not use our services."
    },
    definitions: {
      title: "Definitions",
      content: "In these Terms: 'Service' refers to the VoyageRespond platform and all related services; 'User', 'You', and 'Your' refer to the individual or entity using the Service; 'We', 'Us', and 'Our' refer to VoyageRespond; 'Content' means any text, data, information, or other materials uploaded, submitted, or transmitted through the Service; 'Google Business Profile' refers to Google's business listing service that may be connected to our Service."
    },
    serviceDescription: {
      title: "Service Description",
      content: "VoyageRespond is an AI-powered review management platform that helps businesses manage and respond to their Google Business Profile reviews. Our services include: aggregating and displaying your business reviews; generating AI-powered response suggestions; providing sentiment analysis and insights; enabling you to respond to reviews directly through our platform; and offering analytics and reporting features."
    },
    accountRules: {
      title: "Account Rules",
      content: "To use our Service, you must create an account. You agree to: provide accurate and complete information during registration; maintain the security of your account credentials; promptly update your account information if it changes; notify us immediately of any unauthorized access to your account; and accept responsibility for all activities that occur under your account. We reserve the right to suspend or terminate accounts that violate these Terms."
    },
    acceptableUse: {
      title: "Acceptable Use",
      content: "You agree to use the Service only for lawful purposes and in accordance with these Terms. You agree not to: use the Service in any way that violates applicable laws or regulations; impersonate any person or entity or misrepresent your affiliation; transmit any malicious code, viruses, or harmful content; attempt to gain unauthorized access to our systems; use the Service to send spam or unsolicited communications; interfere with or disrupt the Service or servers; use the Service to generate false, misleading, or defamatory content; or resell or redistribute the Service without our permission."
    },
    googleApi: {
      title: "Google Account & API Access",
      content: "Our Service integrates with Google Business Profile through Google's APIs. By connecting your Google account to VoyageRespond, you: authorize us to access your Google Business Profile data as permitted by Google; agree to comply with Google's Terms of Service and API usage policies; acknowledge that we are not affiliated with Google and that Google is not responsible for our Service; and understand that Google may change or discontinue API access at any time. You can revoke our access to your Google account at any time through your Google account settings."
    },
    payments: {
      title: "Payments & Subscriptions",
      content: "Some features of our Service require a paid subscription. By subscribing, you agree that: subscription fees are billed in advance on a monthly or annual basis; all fees are non-refundable except as required by law; we may change our prices upon reasonable notice; you are responsible for all taxes associated with your subscription; failure to pay may result in suspension of your account; and you can cancel your subscription at any time, with cancellation taking effect at the end of the current billing period."
    },
    termination: {
      title: "Termination",
      content: "We may suspend or terminate your access to the Service at any time, with or without cause, and with or without notice. Reasons for termination may include: violation of these Terms; non-payment of fees; extended periods of inactivity; or at your request. Upon termination, your right to use the Service will immediately cease. Provisions of these Terms that by their nature should survive termination will remain in effect."
    },
    limitationOfLiability: {
      title: "Limitation of Liability",
      content: "To the maximum extent permitted by applicable law: the Service is provided 'as is' and 'as available' without warranties of any kind; we disclaim all warranties, express or implied, including merchantability, fitness for a particular purpose, and non-infringement; we are not liable for any indirect, incidental, special, consequential, or punitive damages; our total liability shall not exceed the amount you paid us in the twelve months preceding the claim; and we are not responsible for any third-party services or content accessed through our Service."
    },
    governingLaw: {
      title: "Governing Law",
      content: "These Terms shall be governed by and construed in accordance with the laws of the Republic of Turkey, without regard to its conflict of law provisions. Any disputes arising from or relating to these Terms or the Service shall be subject to the exclusive jurisdiction of the courts located in Istanbul, Turkey. You agree to submit to the personal jurisdiction of such courts."
    },
    contact: {
      title: "Contact Information",
      content: "If you have any questions about these Terms of Service, please contact us at: support@voyagerespond.com. We will respond to your inquiry within a reasonable timeframe."
    }
  }
};
const demo$1 = {
  badge: "Interactive Demos",
  title: "Explore the Platform",
  subtitle: "Try all features for free. Start working with your real data when you're ready.",
  sections: {
    visibility: {
      title: "How Does Your Business Look on AI?",
      subtitle: "Discover your AI Visibility Score instantly"
    },
    aiReply: {
      title: "Try AI Reply Suggestions",
      subtitle: "See how AI generates professional replies for every review"
    },
    dashboardTools: {
      title: "Dashboard Tools",
      subtitle: "Priority actions, chat, and competitor analysis"
    },
    storyKit: {
      title: "Free Marketing with Story Kit",
      subtitle: "Turn your customers into your brand storytellers"
    }
  }
};
const about$1 = {
  badge: "About Us",
  title: "We Manage Businesses'",
  titleHighlight: "Online Reputation with AI",
  subtitle: "VoyageRespond is an AI-powered reputation management platform that strengthens your business's online reputation through smart review management and reputation optimization. Manage reviews from Google, Booking.com, TripAdvisor, and social media platforms from one place.",
  mission: {
    title: "Our Mission",
    description: "To manage and strengthen businesses' online reputation with artificial intelligence. Every review is an opportunity to shape your brand's digital reputation."
  },
  vision: {
    title: "Our Vision",
    description: "A world where every business can easily manage their online reputation with AI, turn negative reviews into opportunities, and increase customer satisfaction."
  },
  values: {
    title: "Our Values",
    description: "Transparency, innovation, and customer focus. We contribute to business growth with data-driven decisions."
  },
  whatWeDo: {
    title: "What We Do",
    aiVisibility: "Technology that measures and optimizes your business's visibility in Google Search and AI assistants.",
    smartReply: "AI-powered automatic review reply suggestions that match your brand's tone. Google, Booking, TripAdvisor, and Trustpilot supported.",
    analytics: "Monitor your business's online reputation in real-time with sentiment analysis, trend tracking, and competitive comparison.",
    multiPlatform: "Manage reviews from Google, Instagram, TikTok, Booking.com, TripAdvisor, and more from a single dashboard."
  },
  companyInfo: {
    title: "Company Information",
    name: "Company Name",
    address: "Address",
    email: "Email",
    website: "Website"
  },
  cta: {
    title: "Start Growing Your Business",
    subtitle: "Get your AI Visibility Score for free and boost your digital visibility."
  }
};
const onboarding = {
  step1Title: "What is your main goal?",
  step1Subtitle: "Let us help you get there faster.",
  goal1Title: "Manage and reply to reviews quickly",
  goal1Desc: "Save hours with AI-powered replies",
  goal2Title: "Manage reviews from all platforms in one place",
  goal2Desc: "Google, Booking, TripAdvisor — all in one",
  goal3Title: "Strengthen my online reputation",
  goal3Desc: "Grow with AI visibility score and competitor analysis",
  step2Title: "Which platforms do you want to use?",
  step2Subtitle: "Select one or more channels.",
  step2Hint: "You can start with one and add more anytime.",
  googleReviews: "Google Reviews",
  googleReviewsDesc: "AI reply suggestions, sentiment analysis, reputation management",
  booking: "Booking.com",
  bookingDesc: "Pull, analyze and reply to hotel reviews",
  tripadvisor: "TripAdvisor",
  tripadvisorDesc: "Manage restaurant and hotel reviews from one panel",
  trustpilot: "Trustpilot",
  trustpilotDesc: "Track European market trust reviews",
  instagram: "Instagram",
  instagramDesc: "Comment → DM automation, AI replies, sales",
  statusAvailable: "Active",
  statusEarlyAccess: "Early Access",
  statusComingSoon: "Coming Soon",
  step3Title: "Choose your first automation",
  step3Subtitle: "You can add more automations later.",
  aiReplySuggestions: "AI reply suggestions",
  aiReplySuggestionsDesc: "Get smart reply suggestions for every review",
  sentimentAnalysis: "Sentiment analysis",
  sentimentAnalysisDesc: "Automatically categorize reviews by sentiment",
  bookingSync: "Booking.com review sync",
  bookingSyncDesc: "Automatically pull and analyze Booking reviews",
  tripadvisorSync: "TripAdvisor review sync",
  tripadvisorSyncDesc: "Automatically pull TripAdvisor reviews",
  trustpilotSync: "Trustpilot review tracking",
  trustpilotSyncDesc: "Automatically pull Trustpilot reviews",
  commentToDm: "Comment → DM auto reply",
  commentToDmDesc: "Automatically send a DM when someone comments a keyword",
  step4Title: "All set!",
  step4Subtitle: "Let us redirect you to the Automation Hub.",
  readyTitle: "Ready for automation",
  readySubtitle: "Your selected automations are ready to be configured.",
  hubHint: "You can add more channels or automations from the Hub anytime.",
  back: "Back",
  next: "Next",
  goToHub: "Continue to Hub"
};
const hub = {
  title: "Your Automation Hub",
  subtitle: "Pick a channel, enable automations, and start converting.",
  connectedChannels: "Connected Channels",
  activeAutomations: "Active Automations",
  searchPlaceholder: "Search automations...",
  tabAll: "All",
  tabInstagram: "Instagram",
  tabGoogle: "Google Reviews",
  tabTikTok: "TikTok",
  tabWhatsApp: "WhatsApp",
  tabComingSoon: "Coming Soon",
  statusAvailable: "Available",
  statusEarlyAccess: "Early Access",
  statusComingSoon: "Coming Soon",
  setUp: "Set up",
  joinWaitlist: "Join waitlist",
  notifyMe: "Notify me",
  noResults: "No automations found",
  noResultsHint: "Try adjusting your search or filter.",
  commentToDm: "Comment → DM Auto Reply",
  commentToDmDesc: "Automatically send a DM when someone comments a keyword on your post.",
  commentToDmBenefit: "Convert comments into sales conversations",
  dmFaq: "DM FAQ Assistant",
  dmFaqDesc: "AI-powered responses to common questions in your Instagram DMs.",
  dmFaqBenefit: "Save 10+ hours per week on repetitive questions",
  storyMention: "Story Mention Auto-Reply",
  storyMentionDesc: "Automatically thank users who mention you in their stories.",
  storyMentionBenefit: "Build stronger relationships with fans",
  reviewReply: "AI Review Reply Suggestions",
  reviewReplyDesc: "Get smart, personalized reply suggestions for every Google review.",
  reviewReplyBenefit: "Reply faster, sound professional every time",
  reviewAlerts: "Negative Review Alerts",
  reviewAlertsDesc: "Get instant notifications when you receive a negative review.",
  reviewAlertsBenefit: "Respond quickly to unhappy customers",
  tiktok: "TikTok",
  tiktokDescConnected: "Connected as @{{username}}",
  tiktokDescDisconnected: "Connect your TikTok Business account",
  tiktokBenefit: "Coming soon: Inbox automation",
  whatsapp: "WhatsApp Auto-Responder",
  whatsappDesc: "Automated responses for WhatsApp Business messages.",
  whatsappBenefit: "Never miss a customer inquiry",
  teamInbox: "Team Inbox",
  teamInboxDesc: "Unified inbox for all your channels with team collaboration.",
  teamInboxBenefit: "One place for all customer conversations",
  analytics: "Response Analytics",
  analyticsDesc: "Track response times, sentiment, and team performance.",
  analyticsBenefit: "Make data-driven decisions",
  setupModalTitle: "Set up {{title}}",
  setupModalDesc: "Configure your automation settings below.",
  triggerKeywords: "Trigger Keywords",
  triggerKeywordsPlaceholder: "e.g., price, info, details",
  triggerKeywordsHint: "Comma-separated keywords that will trigger this automation.",
  responseTemplate: "Response Template",
  responseTemplatePlaceholder: "Hi! Thanks for your interest. Here's more info about...",
  cancel: "Cancel",
  saveAutomation: "Save Automation",
  waitlistTitle: "Join Early Access",
  notifyTitle: "Get Notified",
  waitlistSubtitle: "Be among the first to try this feature.",
  notifySubtitle: "We'll let you know when this feature launches.",
  emailLabel: "Email Address",
  emailPlaceholder: "you@example.com",
  joinWaitlistBtn: "Join Waitlist",
  notifyMeBtn: "Notify Me",
  login: "Login",
  getStarted: "Get Started",
  dashboard: "Dashboard"
};
const indexPage$1 = {
  nav: {
    features: "Features",
    pricing: "Pricing",
    blog: "Blog",
    contact: "Contact",
    login: "Sign In",
    dashboard: "Dashboard",
    startFree: "Start Free"
  },
  hero: {
    badge: "AI-Powered Review Management",
    titleStart: "Turn your reviews into",
    titleAccent: "revenue.",
    subtitle: "Manage Google, Booking and TripAdvisor reviews from one panel. Generate professional replies in seconds with AI.",
    ctaPrimary: "Try Free — 3 Months Free",
    ctaSecondary: "Request Demo",
    trust: "2-minute setup",
    screenshotAlt: "VoyageRespond dashboard — AI-powered review management"
  },
  socialProof: {
    businesses: "businesses using",
    reviews: "reviews managed",
    avgResponse: "Avg. response time"
  },
  featuresSection: {
    title: "Every step of reputation management, one platform.",
    subtitle: "Reduce manual workload, boost customer satisfaction.",
    aiReplyTitle: "AI Reply Suggestions",
    aiReplyDesc: "Personalized, on-brand professional replies for every review. Approve with one click and save time.",
    visibilityTitle: "AI Visibility Score",
    visibilityDesc: "Measure and improve how your business appears in ChatGPT, Gemini and Google AI.",
    centralTitle: "Centralized Review Inbox",
    centralDesc: "Google, Booking, TripAdvisor — reviews from every platform in one dashboard.",
    sentimentTitle: "Sentiment Analysis & Reports",
    sentimentDesc: "Understand how your customers feel. Track progress with weekly PDF reports.",
    multiLocTitle: "Multi-Location Management",
    multiLocDesc: "Manage 50+ branches from one panel. Compare locations and surface the best.",
    competitorTitle: "Competitor Analysis",
    competitorDesc: "Track your competitors' ratings, response times and customer perception."
  },
  pricingSection: {
    badge: "Early Access",
    title: "Exclusive for the first 100 businesses",
    subtitle: "All features and unlimited locations free for 3 months. Then continue at affordable per-location pricing.",
    perk1: "3 months all features free",
    perk2: "Priority support",
    cta: "Start 3 Months Free"
  },
  footerSection: {
    tagline: "AI-powered review management and visibility optimization.",
    links: "Links",
    about: "About",
    blog: "Blog",
    contact: "Contact",
    hub: "Hub",
    legal: "Legal",
    privacy: "Privacy Policy",
    terms: "Terms of Service",
    rights: "All rights reserved."
  }
};
const en = {
  nav: nav$1,
  landing: landing$1,
  hero: hero$1,
  features: features$1,
  pricing: pricing$1,
  cta: cta$1,
  footer: footer$1,
  contact: contact$1,
  auth: auth$1,
  dashboard: dashboard$1,
  reviews: reviews$1,
  settings: settings$1,
  privacy: privacy$1,
  terms: terms$1,
  demo: demo$1,
  about: about$1,
  onboarding,
  hub,
  indexPage: indexPage$1
};
const nav = {
  features: "Özellikler",
  pricing: "Fiyatlandırma",
  documentation: "Dokümantasyon",
  login: "Giriş Yap",
  dashboard: "Panel",
  getStarted: "Başla",
  automations: "Otomasyonlar",
  hub: "Hub",
  contact: "İletişim"
};
const landing = {
  aiReplyDemo: {
    badge: "İnteraktif Demo",
    title: "AI Yanıt Önerilerini Deneyin",
    subtitle: "Yapay zekamızın her yorum için nasıl profesyonel ve markaya uygun yanıtlar oluşturduğunu görün. Örnek bir yorum seçin ve oluştur'a tıklayın.",
    selectReview: "Yorum Seçin",
    generatedReply: "AI Oluşturulmuş Yanıt",
    selectedReview: "Seçili Yorum",
    generate: "AI Yanıt Oluştur",
    generating: "AI Yanıt Oluşturuluyor...",
    regenerate: "Yeniden Oluştur",
    copied: "Yanıt panoya kopyalandı!",
    error: "Yanıt oluşturulamadı. Lütfen tekrar deneyin.",
    demoNote: "Bu bir demodur. Gerçek Google yorumlarınızda AI yanıtları kullanmak için kayıt olun.",
    emptyState: 'Sihri görmek için "AI Yanıt Oluştur"a tıklayın ✨',
    positive: "Pozitif",
    neutral: "Nötr",
    negative: "Negatif",
    review1: "Yemek harikaydı ama servis biraz yavaştı. Ana yemeğimiz için 30 dakika bekledik. Yine de tekrar geleceğim!",
    review2: "Şehirdeki en iyi kahve! Barista süper arkadaş canlısıydı ve atmosfer çalışmak için mükemmel. Kesinlikle tavsiye ederim!",
    review3: "Deneyimimden hayal kırıklığına uğradım. Pizza soğuktu ve personel ilgisiz görünüyordu. Bir daha gelmeyeceğim."
  },
  chatDemo: {
    badge: "AI Destekli Analiz",
    title: "Yorumlarınızla Sohbet Edin",
    subtitle: "Müşteri geri bildirimleriniz hakkında sorular sorun ve anında AI destekli içgörüler alın."
  },
  gated: {
    title: "Demoyu Denemek İçin Kayıt Olun",
    description: "Tüm özellikleri test etmek için ücretsiz bir hesap oluşturun",
    signup: "Ücretsiz Kayıt Ol"
  },
  aiVisibilityBadge: "AI Visibility Engine ile Güçlendirildi",
  freemiumCta: {
    badge: "AI Visibility Engine",
    title: "İşletmeniz yapay zekada nasıl görünüyor?",
    subtitle: "AI Visibility Skorunuzu anında keşfedin. Google Arama, AI asistanları ve daha fazlasında nasıl yer aldığınızı görün. Çevrimiçi varlığınızı güçlendirmeye başlayın.",
    cta: "AI Skorumu Kontrol Et - Ücretsiz",
    subtext: "Kredi kartı gerekli değil"
  },
  demoTeaser: {
    badge: "Ücretsiz Deneyin",
    title: "Tüm Özellikleri Ücretsiz Deneyin",
    subtitle: "Kayıt olun ve platformun tüm interaktif demolarını keşfedin.",
    tryNow: "Ücretsiz Dene",
    cards: {
      visibility: "AI Visibility Skoru",
      visibilityDesc: "İşletmeniz yapay zekada nasıl görünüyor?",
      aiReply: "AI Yanıt Önerileri",
      aiReplyDesc: "Her yoruma profesyonel AI yanıtlar",
      dashboard: "Dashboard Araçları",
      dashboardDesc: "Sohbet, öncelik, rakip analizi",
      storyKit: "Story Kit",
      storyKitDesc: "Ücretsiz sosyal medya pazarlama"
    }
  },
  heroLine1: "Yorumlarınızı Yönetin.",
  heroLine2: "Yapay Zeka ile Büyüyün.",
  heroSubtitle: "İşletme yorumlarınızı akıllıca yönetmenizi ve yapay zeka görünürlüğünüzü artırmanızı sağlayan AI destekli platform.",
  heroSubtitle2: "AI Visibility Skorunuzu alın, akıllı yanıt önerileri ve gerçek zamanlı performans içgörüleri elde edin.",
  valueProp1: "AI Visibility Skoru",
  valueProp2: "Yorum Optimizasyonu",
  valueProp3: "Performans Takibi",
  heroCta: "AI Visibility Skorunu Gör",
  tryDemo: "AI Yanıt Demosunu Dene",
  automationsTitle: "Otomasyonlarınızı Seçin",
  automationsSubtitle: "Her kanal bağımsızdır. Birini etkinleştirin veya birden fazlasını birleştirin — seçim sizin.",
  useCasesTitle: "Tek bir otomasyon kullanın — veya birden fazla kanalı birleştirin",
  useCasesSubtitle: "Tek bir ürün satın almıyorsunuz. İşletmenize uygun modülleri seçiyorsunuz.",
  howItWorksTitle: "Nasıl Çalışır",
  howItWorksSubtitle: "Günlerde değil, dakikalar içinde başlayın.",
  pricingTitle: "Platform için ödeme yapın. İhtiyacınız olan otomasyonları aktive edin.",
  pricingSubtitle: "Bir otomasyonla başlayın ve büyüdükçe daha fazlasını ekleyin.",
  monthly: "Aylık",
  yearly: "Yıllık",
  mostPopular: "En Popüler",
  whyAIVisibility: "AI Görünürlüğü Neden Önemli",
  whyAIVisibilityDesc: "Yorumlarınız sadece müşterileri etkilemiyor — yapay zeka modellerini de eğitiyor. Google'ın AI Overviews'u, ChatGPT ve diğer yapay zeka asistanları işletmeleri önermek için yorum içeriklerinizi kullanıyor. Reviewer AI Engine'imiz yorumlarınızı analiz eder, optimize edilmiş yanıtlar önerir ve işletmenizin yapay zeka destekli arama sonuçlarında nasıl göründüğünü takip eder.",
  aiFeature1: "AI Visibility Skoru: Yapay zeka asistanlarının işletmenizi nasıl algıladığını görün",
  aiFeature2: "Yanıt Optimizasyonu: Arama görünürlüğünü artıran yanıtlar oluşturun",
  aiFeature3: "AI Öneri Paneli: Hangi yorumlara öncelik vermeniz gerektiğini bilin",
  ctaTitle: "AI görünürlüğünüzü artırmaya hazır mısınız?",
  ctaSubtitle: "Ücretsiz AI Visibility Skorunuzu alın ve işletmenizin yapay zeka asistanlarına nasıl göründüğünü görün.",
  learnMore: "Daha Fazla Bilgi",
  automations: {
    instagram: {
      title: "Instagram Satış",
      feature1: "Yorum → DM otomasyonu",
      feature2: "Yapay zeka destekli DM yanıtları",
      feature3: "Ürün ve seans satışları",
      cta: "Instagram Otomasyonunu Etkinleştir"
    },
    googleReviews: {
      title: "Google Yorumları + AI Visibility",
      feature1: "AI Visibility Skoru ve içgörüler",
      feature2: "Akıllı yorum yanıt önerileri",
      feature3: "Duygu ve arama optimizasyonu",
      cta: "AI Visibility Skorunu Gör"
    },
    tiktok: {
      title: "TikTok",
      feature1: "Login Kit entegrasyonu",
      feature2: "Hesap bağlantısı",
      feature3: "Yakında: Inbox otomasyonu",
      cta: "TikTok Bağla"
    },
    whatsapp: {
      title: "WhatsApp",
      feature1: "Paylaşımlı inbox",
      feature2: "Müşteri görüşmeleri",
      feature3: "İşletme mesajlaşması",
      cta: "Beni Bilgilendir"
    }
  },
  useCases: {
    instagram: {
      title: "Sadece Instagram Satış",
      description: "DM üzerinden satış yapan içerik üreticileri ve e-ticaret markaları için mükemmel"
    },
    google: {
      title: "Google Yorumları + AI Visibility",
      description: "Yapay zeka destekli yorum içgörüleri ve görünürlük takibi ile yerel arama sıralamanızı yükseltin"
    },
    multi: {
      title: "Tam Görünürlük Paketi",
      description: "Sosyal etkileşimi AI görünürlüğü ile birleştirerek maksimum keşfedilebilirlik elde edin"
    }
  },
  howItWorks: {
    step1: {
      title: "Bağla ve Analiz Et",
      description: "Google İşletme Profilinizi bağlayın. Yapay zekamız anında Görünürlük Skorunuzu hesaplar."
    },
    step2: {
      title: "Akıllı Öneriler Al",
      description: "Yapay zeka hangi yorumlara yanıt vermeniz, ne zaman yanıt vermeniz ve aramalarda nasıl optimize olacağınızı söyler."
    },
    step3: {
      title: "Büyümenizi Takip Edin",
      description: "Görünürlük metriklerini, duygu trendlerini ve yorum performansını gerçek zamanlı izleyin."
    }
  },
  pricingPlans: {
    starter: {
      name: "Başlangıç",
      description: "1 otomasyonlu platform erişimi",
      feature1: "Temel platform erişimi",
      feature2: "1 otomasyon (Instagram veya Google)",
      feature3: "Aylık 500 mesaj",
      feature4: "Temel analitik"
    },
    pro: {
      name: "Pro",
      description: "2 otomasyona kadar + analitik",
      feature1: "Temel platform erişimi",
      feature2: "2 otomasyona kadar",
      feature3: "Sınırsız mesaj",
      feature4: "Gelişmiş analitik",
      feature5: "Öncelikli destek"
    },
    agency: {
      name: "Ajans",
      description: "Tüm otomasyonlar + ekip erişimi",
      feature1: "Temel platform erişimi",
      feature2: "Tüm otomasyonlar dahil",
      feature3: "Ekip erişimi (5 üye)",
      feature4: "Tam analitik paketi",
      feature5: "Özel entegrasyonlar"
    }
  },
  comingSoon: "Yakında",
  yearlyDiscount: "2 ay ücretsiz",
  perMonth: "/ay",
  choosePlan: "Planı Seç",
  contact: "İletişim",
  metrics: {
    title: "Rakamlarla VoyageRespond",
    subtitle: "Binlerce işletme tarafından güveniliyor",
    aiReplies: "AI Yanıtlar Oluşturuldu",
    reviewsManaged: "Yorum Yönetildi",
    activeBusinesses: "Aktif İşletme",
    responseImprovement: "Yanıt Hızı İyileştirmesi"
  },
  video: {
    title: "VoyageRespond'u Keşfedin",
    subtitle: "30 saniyede platformun nasıl çalıştığını görün",
    comingSoon: "Demo Video Yakında",
    loading: "Video yükleniyor...",
    goBack: "Geri Dön",
    step1: "Hesap Bağlama",
    step2: "AI Yanıt Oluşturma",
    step3: "Yanıt Gönderme"
  },
  storyKit: {
    badge: "Yeni Özellik",
    title: "Story Kit ile Ücretsiz Pazarlama",
    subtitle: "Müşterileriniz işletmenizi Instagram'da paylaşsın. Branded story'ler oluştursun, organik reach kazanın.",
    selectBusiness: "Demo İşletme Seçin",
    addPhoto: "Fotoğraf Ekle (Opsiyonel)",
    uploadedPhoto: "Yüklenen fotoğraf",
    uploadPrompt: "Yemek, mekan veya anı fotoğrafı ekleyin",
    fileTooLarge: "Dosya çok büyük",
    maxFileSize: "Maksimum 10MB boyutunda dosya yükleyebilirsiniz.",
    customerMessage: "Müşteri Mesajı",
    messagePlaceholder: "Harika bir deneyimdi...",
    colorCustomization: "Renk Özelleştirme",
    background: "Arka Plan",
    accentColor: "Vurgu Rengi",
    generating: "Oluşturuluyor...",
    generateStory: "Story Oluştur",
    storyReady: "Story hazır! 🎉",
    storyCreated: "Örnek story başarıyla oluşturuldu.",
    downloadStory: "Story'yi İndir",
    downloaded: "İndirildi!",
    storyDownloaded: "Story görseliniz indirildi.",
    shareOnInstagram: "Instagram'da Paylaş",
    tabStory: "📱 Story",
    tabMaterials: "🖨️ Materyaller",
    tabWebsite: "💻 Website",
    createdWith: "Voyagerespond ile oluşturuldu"
  },
  visibilityChecker: {
    freeDemo: "Ücretsiz Demo",
    title: "AI Sizi Nasıl Görüyor?",
    subtitle: "İşletme adınızı ve konumunuzu girin, AI asistanların sizi nasıl algıladığını görün",
    businessPlaceholder: "İşletme adınız",
    locationPlaceholder: "Konum",
    analyzing: "Analiz Ediliyor...",
    analyze: "Analiz Et",
    remainingTries: "Kalan deneme hakkı",
    unlimitedAnalysis: "Sınırsız analiz için",
    register: "kayıt olun",
    trialEnded: "Ücretsiz deneme hakkınız doldu",
    trialEndedDesc: "Sınırsız analiz yapmak ve tüm özelliklere erişmek için ücretsiz hesap oluşturun.",
    freeSignup: "Ücretsiz Kayıt Ol",
    pleaseEnterBusiness: "Lütfen işletme adı girin",
    analysisFailed: "Analiz başarısız",
    errorOccurred: "Analiz sırasında bir hata oluştu",
    scoreGood: "İyi",
    scoreMedium: "Orta",
    scoreNeedsImprovement: "Geliştirilebilir",
    visibilityScoreFor: "için AI Visibility Skoru",
    locationBasedRanking: "Konum Bazlı Sıralama",
    amongCompetitors: "rakip arasında",
    aiShowsYou: "AI asistanlar sizi",
    forQueries: "gibi sorgularda gösteriyor",
    customerSatisfaction: "Müşteri Memnuniyeti",
    reviews: "yorum",
    highlights: "Öne Çıkanlar"
  },
  visibilityDemo: {
    excellent: "Mükemmel",
    good: "İyi",
    medium: "Orta",
    needsImprovement: "Geliştirilebilir",
    thisMonth: "bu ay",
    averageRating: "Ortalama Puan",
    responseRate: "Yanıt Oranı",
    positiveReviews: "Pozitif Yorum",
    totalReviews: "Toplam Yorum",
    liveData: "Canlı Veri"
  },
  testimonials: {
    title: "Müşterilerimiz Ne Diyor?",
    subtitle: "850+ işletmenin güvendiği platform",
    testimonial1: {
      quote: "Google yorumlarına artık 5 dakikada değil, 30 saniyede yanıt veriyorum. AI önerileri gerçekten profesyonel ve ton ayarları mükemmel çalışıyor.",
      name: "Ahmet Y.",
      role: "İşletme Sahibi"
    },
    testimonial2: {
      quote: "TikTok yorumlarına anında yanıt vermek satışlarımızı %40 artırdı. Story Kit ile müşterilerimiz içerik üretiyor, biz sadece paylaşıyoruz.",
      name: "Zeynep K.",
      role: "Pazarlama Müdürü"
    },
    testimonial3: {
      quote: "3 otelimizin tüm yorumlarını tek panelden yönetiyoruz. AI Visibility skoru sayesinde Google'da üst sıralara çıktık.",
      name: "Mehmet D.",
      role: "Genel Müdür"
    },
    testimonial4: {
      quote: "Olumsuz yorumlara nasıl yanıt vereceğimi bilmiyordum. AI'ın empatik ton önerisi müşteriyi geri kazandırdı.",
      name: "Elif Ö.",
      role: "Kurucu"
    }
  },
  trustBadges: {
    gdpr: "GDPR Uyumlu",
    gdprDesc: "Avrupa veri koruma standartları",
    ssl: "256-bit SSL",
    sslDesc: "Şifreli veri transferi",
    euData: "EU Data Center",
    euDataDesc: "Avrupa'da barındırılan veriler",
    soc2: "SOC 2 Type II",
    soc2Desc: "Güvenlik denetimi onaylı",
    apiIntegrations: "Resmi API Entegrasyonları",
    countriesUsed: "180+ Ülkede Kullanımda"
  },
  storyKitDemo: {
    howItWorks: "Nasıl Çalışır?",
    step1: "İşletmeniz için hashtag ve renkler belirleyin",
    step2: "QR kodu indirip masanıza/kasanıza koyun",
    step3: "Müşteriler tarayıp story oluşturur ve paylaşır",
    step4: "Siz de paylaşım istatistiklerini takip edin",
    phonePrompt: '"Demo Story Oluştur" butonuna tıklayarak örnek bir Instagram Story görseli oluşturun',
    downloadStoryBtn: "Story'yi İndir",
    tableStand: "Masa Standı / QR Kod",
    tableStandDesc: "Masanıza veya kasanıza koyabileceğiniz QR kodlu tasarım",
    scanToCreate: "Story oluşturmak için tarayın",
    sizeOptions: "Kare",
    customizableSizes: "✓ Özelleştirilebilir boyut ve renkler",
    highResDownload: "✓ Yüksek çözünürlüklü PNG indirme",
    printReady: "✓ Anında yazdırma için hazır",
    shareLink: "Paylaşım Linki",
    shareLinkDesc: "WhatsApp, SMS veya sosyal medyada paylaşabileceğiniz link",
    whatsappTemplate: "Bizi ziyaret ettiğiniz için teşekkürler! 🙏 Deneyiminizi Instagram'da paylaşmak ister misiniz?",
    readyTemplates: "✓ Hazır mesaj şablonları",
    oneClickCopy: "✓ Tek tıkla kopyalama",
    suitableFor: "✓ WhatsApp, SMS, Email için uygun",
    websiteButton: "Website Butonu",
    websiteButtonDesc: "Web sitenize ekleyebileceğiniz tek satır kod",
    createStory: "Story Oluştur",
    copied: "Kopyalandı!",
    copyEmbedCode: "Embed Kodunu Kopyala",
    floatingPopup: "Floating Popup",
    floatingPopupDesc: "Sağ alt köşede sabit duran popup buton",
    sitePreview: "Site önizlemesi",
    widgetTypes: "✓ 3 farklı widget tipi",
    colorCustom: "✓ Renk özelleştirme",
    singleLineJs: "✓ Tek satır JavaScript",
    activateNow: "İşletmeniz için Story Kit'i şimdi aktifleştirin",
    startFree: "Ücretsiz Başla"
  },
  dashboardDemo: {
    badge: "Dashboard Önizleme",
    title: "Güçlü Dashboard Araçları",
    subtitle: "AI destekli içgörüler, öncelik yönetimi ve rekabet analizi - hepsi tek yerden."
  },
  priorityDemo: {
    title: "Öncelikli İşlemler",
    subtitle: "Bugün yanıtlanması gereken yorumlar",
    critical: "Kritik",
    urgent: "Acil",
    normal: "Normal",
    reply: "Yanıtla",
    cta: "Tüm Yorumları Yönet"
  },
  competitorDemo: {
    title: "Rakip Karşılaştırması",
    subtitle: "AI görünürlüğünüzü rakiplerle karşılaştırın",
    placeholder: "Rakip işletme adı...",
    metric: "Metrik",
    you: "Siz",
    insights: "AI Önerileri:",
    hint: "Rakip işletme adı girerek AI görünürlük karşılaştırması yapın",
    cta: "Gerçek Verilerle Karşılaştır"
  }
};
const hero = {
  title: "Google Yorumlarınızı Büyümeye Dönüştürün",
  subtitle: "Daha hızlı yanıt vermenize, daha derinlemesine analiz yapmanıza ve daha güçlü müşteri ilişkileri kurmanıza yardımcı olan yapay zeka destekli yorum yönetimi.",
  cta: "Yorumları Yönetmeye Başla"
};
const features = {
  title: "Yorumları yönetmek için ihtiyacınız olan her şey",
  subtitle: "Her yoruma verimli bir şekilde yanıt vermenize yardımcı olmak için tasarlanmış güçlü özellikler",
  smartManagement: {
    title: "Akıllı Yorum Yönetimi",
    description: "Tüm Google İşletme yorumlarınızı tek, düzenli ve temiz bir panelde yönetin"
  },
  aiPowered: {
    title: "Yapay Zeka Destekli Yanıtlar",
    description: "Özelleştirilebilir ton ve dil ile anında profesyonel yanıtlar oluşturun"
  },
  deepAnalytics: {
    title: "Derinlemesine Analitik",
    description: "Yorumlarınızdan duygu trendlerini, yanıt oranlarını ve önemli içgörüleri takip edin"
  }
};
const pricing = {
  title: "Basit, şeffaf fiyatlandırma",
  subtitle: "İşletmenize uygun planı seçin",
  monthly: "Aylık",
  yearly: "Yıllık",
  yearlyDiscount: "(20% tasarruf)",
  perMonth: "/ay",
  popular: "En Popüler",
  starter: {
    name: "Başlangıç",
    description: "Tek lokasyonlu işletmeler için ideal",
    features: {
      locations: "1 lokasyon",
      reviews: "200 yorum/ay",
      dashboard: "Panel erişimi",
      aiGeneration: "Yapay zeka yanıt oluşturma",
      manual: "Manuel onay ve kopyalama"
    }
  },
  pro: {
    name: "Pro",
    description: "Büyüyen işletmeler için",
    features: {
      locations: "3 lokasyon",
      reviews: "Sınırsız yorum",
      autoReply: "Otomatik Yanıt",
      googleApi: "Google API ile yanıt gönderimi",
      support: "Öncelikli destek"
    }
  },
  agency: {
    name: "Ajans",
    description: "Ajansınızla ölçeklendirin",
    features: {
      locations: "Sınırsız lokasyon",
      team: "Ekip erişimi",
      analytics: "Gelişmiş analitik",
      whitelabel: "Beyaz etiket seçeneği",
      customSupport: "Özel destek"
    }
  }
};
const cta = {
  title: "Müşteri ilişkilerinizi yükseltmeye hazır mısınız?",
  subtitle: "Yapay zeka destekli yorum yanıtlarıyla zaman kazanan ve daha iyi müşteri ilişkileri kuran işletmelere katılın.",
  button: "Hemen Başla"
};
const footer = {
  quickLinks: "Hızlı Bağlantılar",
  copyright: "© 2025 VoyageRespond",
  privacy: "Gizlilik Politikası",
  terms: "Kullanım Koşulları"
};
const contact = {
  backToHome: "Ana Sayfa",
  title: "Bize Ulaşın",
  subtitle: "Sorularınız, önerileriniz veya destek talepleriniz için bizimle iletişime geçin.",
  email: "E-posta",
  sendEmail: "E-posta Gönder",
  responseTime: "Yanıt Süresi",
  responseTimeDesc: "Genellikle 24 saat içinde yanıt veriyoruz",
  location: "Konum",
  locationValue: "Türkiye"
};
const auth = {
  login: {
    title: "Giriş Yap",
    subtitle: "Tekrar hoş geldiniz! Devam etmek için lütfen giriş yapın.",
    email: "E-posta",
    password: "Şifre",
    forgotPassword: "Şifreni mi unuttun?",
    submit: "Giriş Yap",
    noAccount: "Hesabın yok mu?",
    register: "Kayıt Ol",
    error: "Geçersiz e-posta veya şifre",
    emailNotVerified: "Email adresin henüz doğrulanmamış. Lütfen gelen kutuna gönderilen doğrulama linkine tıkla."
  },
  register: {
    title: "Hesap Oluştur",
    subtitle: "VoyageRespond ile bugün başlayın.",
    fullName: "Ad Soyad",
    email: "E-posta",
    password: "Şifre",
    submit: "Hesap Oluştur",
    hasAccount: "Zaten hesabın var mı?",
    login: "Giriş Yap",
    success: "Hesabın başarıyla oluşturuldu! Lütfen hesabını doğrulamak için e-postanı kontrol et.",
    error: "Kayıt sırasında bir hata oluştu",
    googleSignIn: "Google ile Kayıt Ol",
    orEmail: "veya email ile"
  },
  forgotPassword: {
    title: "Şifre Sıfırla",
    subtitle: "E-posta adresini gir, sana sıfırlama linki gönderelim.",
    email: "E-posta",
    submit: "Sıfırlama Linki Gönder",
    backToLogin: "Giriş Sayfasına Dön",
    success: "Şifre sıfırlama linki gönderildi! Lütfen e-postanı kontrol et.",
    error: "Bir hata oluştu. Lütfen tekrar dene."
  },
  authCallback: {
    title: "Email Doğrulama",
    verifying: "Hesabın doğrulanıyor...",
    error: "Doğrulama sırasında bir hata oluştu.",
    success: "Hesabın başarıyla doğrulandı! Yönlendiriliyorsun...",
    noSession: "Oturum bulunamadı. Giriş sayfasına yönlendiriliyorsun..."
  }
};
const dashboard = {
  subtitle: "Dashboard Özeti",
  metrics: {
    avgRating: "Ortalama Puan",
    outOf5: "5 üzerinden",
    totalReviews: "Toplam Yorumlar",
    allTime: "tüm zamanlar",
    weeklyReviews: "Bu Haftanın Yorumları",
    pendingReplies: "Bekleyen Yanıtlar",
    needsAttention: "dikkat gerekiyor"
  },
  weeklyTitle: "Bu Haftanın Yorumları",
  dayReviews: "Günü Yorumları",
  noReviews: "Bu işletme için henüz yorum yok.",
  noReviewsSub: "Yorumlar eklendiğinde burada görünecek.",
  noDayReviews: "Bu gün için yorum bulunamadı.",
  seeReply: "Yanıtı Gör",
  demo: {
    bannerTitle: "Demo Modu Aktif",
    bannerSubtitle: "Örnek verilerle platformu keşfediyorsunuz. Gerçek verilerinizi görmek için hesabınızı bağlayın.",
    connectCta: "Google Business Bağla",
    upgradePro: "Pro'ya Geç",
    upgradeText: "{{feature}} özelliğini gerçek verilerle kullanmak için Pro'ya geçin",
    upgradeButton: "Pro Planı Keşfet",
    seeExample: "Örnek Yanıt",
    features: {
      priorityActions: "Öncelikli İşlemler",
      chatWithReviews: "Yorumlarla Sohbet",
      competitorAnalysis: "Rakip Analizi"
    },
    bottomCta: {
      title: "Gerçek verilerinizle çalışmaya hazır mısınız?",
      subtitle: "Google Business hesabınızı bağlayın ve gerçek müşteri yorumlarınızı AI ile yönetmeye başlayın.",
      button: "Hesabımı Bağla ve Başla"
    }
  }
};
const reviews = {
  title: "Yorumlar",
  filters: {
    all: "Tümü",
    pending: "Bekleyen",
    replied: "Yanıtlanan"
  },
  sentiment: {
    positive: "Pozitif",
    neutral: "Nötr",
    negative: "Negatif"
  },
  copyReply: "Cevabı Kopyala",
  copiedSuccess: "Cevap panoya kopyalandı!"
};
const settings = {
  title: "Ayarlar",
  profile: "Profil",
  business: "İşletme Ayarları",
  account: "Hesap"
};
const privacy = {
  title: "Gizlilik Politikası",
  lastUpdated: "Son güncelleme: Aralık 2025",
  backToHome: "Ana Sayfaya Dön",
  sections: {
    introduction: {
      title: "Giriş",
      content: "VoyageRespond'a hoş geldiniz. Bu Gizlilik Politikası, hizmetimizi kullandığınızda bilgilerinizi nasıl topladığımızı, kullandığımızı, açıkladığımızı ve koruduğumuzu açıklar. Gizliliğinizi korumaya ve kişisel verilerinizin güvenliğini sağlamaya kararlıyız."
    },
    informationWeCollect: {
      title: "Topladığımız Bilgiler",
      content: "Doğrudan bize sağladığınız bilgileri topluyoruz: hesap oluştururken adınız ve e-posta adresiniz; işletme adı ve Google Place ID gibi işletme bilgileriniz; hesabınızı bağladığınızda Google İşletme Profili verileri (yorumlar, puanlar ve yorumcu bilgileri dahil); hizmetimizle nasıl etkileşimde bulunduğunuz gibi kullanım verileri; ve IP adresi, tarayıcı türü ve cihaz bilgileri gibi teknik veriler."
    },
    howWeUseInformation: {
      title: "Bilgilerinizi Nasıl Kullanırız",
      content: "Topladığımız bilgileri şu amaçlarla kullanırız: hizmetlerimizi sağlamak, sürdürmek ve geliştirmek; işletme yorumlarınıza yapay zeka destekli yanıtlar oluşturmak; yorum duygu analizi yapmak ve içgörüler sağlamak; hesabınız ve hizmetlerimiz hakkında sizinle iletişim kurmak; size teknik bildirimler, güncellemeler ve destek mesajları göndermek; teknik sorunları ve güvenlik tehditlerini tespit etmek, önlemek ve gidermek; ve yasal yükümlülüklere uymak."
    },
    googleBusinessData: {
      title: "Google İşletme Profili Veri Kullanımı",
      content: "Google İşletme Profilinizi VoyageRespond'a bağladığınızda, Google İşletme Profili API'si aracılığıyla işletme yorumlarınıza ve ilgili bilgilere erişiriz. Bu verileri yalnızca şu amaçlarla kullanırız: yorumlarınızı panomuzda görüntülemek; yapay zeka destekli yanıt önerileri oluşturmak; yorum duygu analizi ve trendleri analiz etmek; ve yetkilendirdiğinizde yorumlara sizin adınıza yanıt göndermek. Google İşletme Profili verilerinizi reklam amaçlı kullanmıyoruz veya pazarlama amaçları için üçüncü taraflarla paylaşmıyoruz."
    },
    dataSharing: {
      title: "Veri Paylaşımı",
      content: "Kişisel bilgilerinizi satmıyoruz. Bilgilerinizi şu kişilerle paylaşabiliriz: platformumuzu işletmemize yardımcı olan hizmet sağlayıcılar; gerektiğinde avukatlar ve muhasebeciler gibi profesyonel danışmanlar; yasaların gerektirdiği durumlarda kolluk kuvvetleri veya devlet yetkilileri; ve bir birleşme, devralma veya varlık satışı ile bağlantılı olarak. Tüm üçüncü taraf hizmet sağlayıcıları gizlilik yükümlülükleriyle bağlıdır."
    },
    dataRetention: {
      title: "Veri Saklama ve Silme",
      content: "Kişisel bilgilerinizi hesabınız aktif olduğu sürece veya size hizmet sağlamak için gerekli olduğu sürece saklarız. support@voyagerespond.com adresinden bizimle iletişime geçerek istediğiniz zaman hesabınızın ve ilişkili verilerin silinmesini talep edebilirsiniz. Silme talebi üzerine, yasal olarak saklanması gerekli olan durumlar hariç, kişisel verilerinizi 30 gün içinde kaldıracağız."
    },
    security: {
      title: "Güvenlik Uygulamaları",
      content: "Kişisel bilgilerinizi korumak için uygun teknik ve organizasyonel önlemler uyguluyoruz: aktarım sırasında ve beklemede veri şifreleme; güvenli kimlik doğrulama mekanizmaları; düzenli güvenlik değerlendirmeleri ve güncellemeleri; verilerinize kimin erişebileceğini sınırlayan erişim kontrolleri; ve şüpheli aktivite izleme. Ancak, internet üzerinden hiçbir iletim yöntemi %100 güvenli değildir ve mutlak güvenliği garanti edemeyiz."
    },
    userRights: {
      title: "Haklarınız",
      content: "Bulunduğunuz yere bağlı olarak, kişisel bilgilerinizle ilgili şu haklara sahip olabilirsiniz: verilerinize erişme ve bir kopyasını alma hakkı; yanlış bilgileri düzeltme hakkı; verilerinizi silme hakkı; işlemeyi kısıtlama veya itiraz etme hakkı; veri taşınabilirliği hakkı; ve onayı geri çekme hakkı. Bu hakları kullanmak için lütfen support@voyagerespond.com adresinden bizimle iletişime geçin."
    },
    internationalTransfers: {
      title: "Uluslararası Transferler",
      content: "Bilgileriniz, ikamet ettiğiniz ülke dışındaki ülkelere aktarılabilir ve orada işlenebilir. Bu ülkelerin veri koruma yasaları sizin ülkenizden farklı olabilir. Bilgileriniz uluslararası olarak aktarıldığında korumak için, ilgili yetkililer tarafından onaylanmış standart sözleşme maddeleri dahil olmak üzere uygun güvencelerin yerinde olmasını sağlıyoruz."
    },
    changes: {
      title: "Bu Politikadaki Değişiklikler",
      content: "Bu Gizlilik Politikasını zaman zaman güncelleyebiliriz. Yeni Gizlilik Politikasını bu sayfada yayınlayarak ve 'Son güncelleme' tarihini güncelleyerek önemli değişiklikleri size bildireceğiz. Herhangi bir değişiklikten sonra hizmeti kullanmaya devam etmeniz, güncellenmiş Gizlilik Politikasını kabul ettiğiniz anlamına gelir."
    },
    contact: {
      title: "İletişim Bilgileri",
      content: "Bu Gizlilik Politikası veya veri uygulamalarımız hakkında herhangi bir sorunuz varsa, lütfen bizimle iletişime geçin: support@voyagerespond.com. Sorunuza makul bir süre içinde yanıt vereceğiz."
    }
  }
};
const terms = {
  title: "Hizmet Şartları",
  lastUpdated: "Son güncelleme: Aralık 2025",
  backToHome: "Ana Sayfaya Dön",
  sections: {
    introduction: {
      title: "Giriş",
      content: "VoyageRespond'a hoş geldiniz. Bu Hizmet Şartları, web sitemize, ürünlerimize ve hizmetlerimize erişiminizi ve kullanımınızı düzenler. VoyageRespond'a erişerek veya kullanarak bu Şartlara bağlı kalmayı kabul edersiniz. Bu Şartları kabul etmiyorsanız, lütfen hizmetlerimizi kullanmayın."
    },
    definitions: {
      title: "Tanımlar",
      content: "Bu Şartlarda: 'Hizmet', VoyageRespond platformu ve tüm ilgili hizmetleri ifade eder; 'Kullanıcı', 'Siz' ve 'Sizin', Hizmeti kullanan birey veya kuruluşu ifade eder; 'Biz', 'Bize' ve 'Bizim', VoyageRespond'u ifade eder; 'İçerik', Hizmet aracılığıyla yüklenen, gönderilen veya iletilen herhangi bir metin, veri, bilgi veya diğer materyalleri ifade eder; 'Google İşletme Profili', Hizmetimize bağlanabilen Google'ın işletme listesi hizmetini ifade eder."
    },
    serviceDescription: {
      title: "Hizmet Açıklaması",
      content: "VoyageRespond, işletmelerin Google İşletme Profili yorumlarını yönetmelerine ve yanıtlamalarına yardımcı olan yapay zeka destekli bir yorum yönetimi platformudur. Hizmetlerimiz şunları içerir: işletme yorumlarınızı toplama ve görüntüleme; yapay zeka destekli yanıt önerileri oluşturma; duygu analizi ve içgörüler sağlama; platformumuz üzerinden doğrudan yorumlara yanıt vermenizi sağlama; ve analitik ve raporlama özellikleri sunma."
    },
    accountRules: {
      title: "Hesap Kuralları",
      content: "Hizmetimizi kullanmak için bir hesap oluşturmanız gerekir. Şunları kabul edersiniz: kayıt sırasında doğru ve eksiksiz bilgi sağlamak; hesap kimlik bilgilerinizin güvenliğini korumak; hesap bilgileriniz değişirse derhal güncellemek; hesabınıza yetkisiz erişimi derhal bize bildirmek; ve hesabınız altında gerçekleşen tüm faaliyetler için sorumluluk kabul etmek. Bu Şartları ihlal eden hesapları askıya alma veya sonlandırma hakkını saklı tutarız."
    },
    acceptableUse: {
      title: "Kabul Edilebilir Kullanım",
      content: "Hizmeti yalnızca yasal amaçlar için ve bu Şartlara uygun olarak kullanmayı kabul edersiniz. Şunları yapmamayı kabul edersiniz: Hizmeti geçerli yasa veya düzenlemeleri ihlal edecek şekilde kullanmak; herhangi bir kişi veya kuruluşu taklit etmek veya ilişkinizi yanlış beyan etmek; herhangi bir kötü amaçlı kod, virüs veya zararlı içerik iletmek; sistemlerimize yetkisiz erişim sağlamaya çalışmak; Hizmeti spam veya istenmeyen iletişimler göndermek için kullanmak; Hizmeti veya sunucuları bozmak veya aksatmak; Hizmeti yanlış, yanıltıcı veya karalayıcı içerik oluşturmak için kullanmak; veya Hizmeti iznimiz olmadan yeniden satmak veya dağıtmak."
    },
    googleApi: {
      title: "Google Hesabı ve API Erişimi",
      content: "Hizmetimiz Google API'leri aracılığıyla Google İşletme Profili ile entegre olur. Google hesabınızı VoyageRespond'a bağlayarak: Google'ın izin verdiği şekilde Google İşletme Profili verilerinize erişmemize yetki verirsiniz; Google'ın Hizmet Şartları ve API kullanım politikalarına uymayı kabul edersiniz; Google ile bağlı olmadığımızı ve Google'ın Hizmetimizden sorumlu olmadığını kabul edersiniz; ve Google'ın herhangi bir zamanda API erişimini değiştirebileceğini veya sonlandırabileceğini anlarsınız. Google hesap ayarlarınız aracılığıyla istediğiniz zaman Google hesabınıza erişimimizi iptal edebilirsiniz."
    },
    payments: {
      title: "Ödemeler ve Abonelikler",
      content: "Hizmetimizin bazı özellikleri ücretli abonelik gerektirir. Abone olarak şunları kabul edersiniz: abonelik ücretleri aylık veya yıllık olarak peşin faturalandırılır; tüm ücretler yasaların gerektirdiği durumlar dışında iade edilmez; makul bir bildirimle fiyatlarımızı değiştirebiliriz; aboneliğinizle ilişkili tüm vergilerden siz sorumlusunuz; ödeme yapılmaması hesabınızın askıya alınmasına neden olabilir; ve aboneliğinizi istediğiniz zaman iptal edebilirsiniz, iptal mevcut fatura döneminin sonunda yürürlüğe girer."
    },
    termination: {
      title: "Fesih",
      content: "Hizmete erişiminizi herhangi bir zamanda, sebepli veya sebepsiz, bildirimli veya bildirimsiz olarak askıya alabilir veya sonlandırabiliriz. Fesih nedenleri şunları içerebilir: bu Şartların ihlali; ücretlerin ödenmemesi; uzun süreli hareketsizlik; veya talebiniz üzerine. Fesih üzerine, Hizmeti kullanma hakkınız derhal sona erecektir. Doğaları gereği fesihten sonra yürürlükte kalması gereken bu Şartların hükümleri geçerli olmaya devam edecektir."
    },
    limitationOfLiability: {
      title: "Sorumluluk Sınırlaması",
      content: "Geçerli yasaların izin verdiği azami ölçüde: Hizmet herhangi bir garanti olmaksızın 'olduğu gibi' ve 'mevcut olduğu şekilde' sağlanır; satılabilirlik, belirli bir amaca uygunluk ve ihlal etmeme dahil olmak üzere açık veya zımni tüm garantileri reddederiz; dolaylı, arızi, özel, sonuçsal veya cezai zararlardan sorumlu değiliz; toplam sorumluluğumuz, talepten önceki on iki ayda bize ödediğiniz tutarı aşmayacaktır; ve Hizmetimiz aracılığıyla erişilen herhangi bir üçüncü taraf hizmeti veya içeriğinden sorumlu değiliz."
    },
    governingLaw: {
      title: "Geçerli Yasa",
      content: "Bu Şartlar, kanunlar ihtilafı hükümlerine bakılmaksızın Türkiye Cumhuriyeti yasalarına göre yönetilecek ve yorumlanacaktır. Bu Şartlardan veya Hizmetten kaynaklanan veya bunlarla ilgili herhangi bir anlaşmazlık, İstanbul, Türkiye'de bulunan mahkemelerin münhasır yargı yetkisine tabi olacaktır. Bu tür mahkemelerin kişisel yargı yetkisine tabi olmayı kabul edersiniz."
    },
    contact: {
      title: "İletişim Bilgileri",
      content: "Bu Hizmet Şartları hakkında herhangi bir sorunuz varsa, lütfen bizimle iletişime geçin: support@voyagerespond.com. Sorunuza makul bir süre içinde yanıt vereceğiz."
    }
  }
};
const demo = {
  badge: "İnteraktif Demolar",
  title: "Platformu Keşfedin",
  subtitle: "Tüm özellikleri ücretsiz deneyin. Beğendiğinizde gerçek verilerinizle çalışmaya başlayın.",
  sections: {
    visibility: {
      title: "İşletmeniz Yapay Zekada Nasıl Görünüyor?",
      subtitle: "AI Visibility Skorunuzu anında keşfedin"
    },
    aiReply: {
      title: "AI Yanıt Önerilerini Deneyin",
      subtitle: "Yapay zekanın her yorum için nasıl profesyonel yanıtlar ürettiğini görün"
    },
    dashboardTools: {
      title: "Dashboard Araçları",
      subtitle: "Öncelikli işlemler, sohbet ve rakip analizi"
    },
    storyKit: {
      title: "Story Kit ile Ücretsiz Pazarlama",
      subtitle: "Müşterilerinizi markanızın hikaye anlatıcısına dönüştürün"
    }
  }
};
const about = {
  badge: "Hakkımızda",
  title: "Yapay Zeka ile İşletmelerin",
  titleHighlight: "Çevrimiçi İtibarını Yönetiyoruz",
  subtitle: "VoyageRespond, yapay zeka destekli yorum yönetimi ve itibar optimizasyonu ile işletmelerin çevrimiçi itibarını güçlendiren bir teknoloji platformudur. Google, Booking.com, TripAdvisor ve sosyal medya platformlarındaki yorumları tek noktadan yönetin.",
  mission: {
    title: "Misyonumuz",
    description: "İşletmelerin çevrimiçi itibarını yapay zeka ile yönetmek ve güçlendirmek. Her yorum, markanızın dijital itibarını şekillendiren bir fırsattır."
  },
  vision: {
    title: "Vizyonumuz",
    description: "Her işletmenin çevrimiçi itibarını yapay zeka ile kolayca yönetebileceği, olumsuz yorumları fırsata çevirebileceği ve müşteri memnuniyetini artırabileceği bir dünya."
  },
  values: {
    title: "Değerlerimiz",
    description: "Şeffaflık, yenilikçilik ve müşteri odaklılık. Veriye dayalı kararlar ile işletmelerin büyümesine katkıda bulunuyoruz."
  },
  whatWeDo: {
    title: "Ne Yapıyoruz?",
    aiVisibility: "İşletmenizin Google arama ve yapay zeka asistanlarındaki görünürlüğünü ölçen ve optimize eden teknoloji.",
    smartReply: "Yapay zeka destekli, markanızın tonuna uygun otomatik yorum yanıtı önerileri. Google, Booking, TripAdvisor ve Trustpilot desteği.",
    analytics: "Duygu analizi, trend takibi ve rekabet karşılaştırması ile işletmenizin çevrimiçi itibarını anlık olarak izleyin.",
    multiPlatform: "Google, Instagram, TikTok, Booking.com, TripAdvisor ve daha fazla platformdan gelen yorumları tek bir panelden yönetin."
  },
  companyInfo: {
    title: "Şirket Bilgileri",
    name: "Şirket Adı",
    address: "Adres",
    email: "E-posta",
    website: "Web Sitesi"
  },
  cta: {
    title: "İşletmenizi Büyütmeye Başlayın",
    subtitle: "AI Visibility Score'unuzu ücretsiz öğrenin ve dijital görünürlüğünüzü artırın."
  }
};
const indexPage = {
  nav: {
    features: "Özellikler",
    pricing: "Fiyatlandırma",
    blog: "Blog",
    contact: "İletişim",
    login: "Giriş Yap",
    dashboard: "Dashboard",
    startFree: "Ücretsiz Başla"
  },
  hero: {
    badge: "AI-Powered Review Management",
    titleStart: "Yorumlarınızı",
    titleAccent: "gelire dönüştürün.",
    subtitle: "Google, Booking ve TripAdvisor yorumlarını tek panelden yönetin. AI ile saniyeler içinde profesyonel yanıtlar oluşturun.",
    ctaPrimary: "Ücretsiz Dene — 3 Ay Bedava",
    ctaSecondary: "Demo İste",
    trust: "2 dakikada kurulum",
    screenshotAlt: "VoyageRespond dashboard — AI ile yorum yönetimi"
  },
  socialProof: {
    businesses: "işletme kullanıyor",
    reviews: "yorum yönetildi",
    avgResponse: "Ortalama yanıt süresi"
  },
  featuresSection: {
    title: "Google yorum yönetimi için ihtiyacınız olan her şey",
    subtitle: "Manuel iş yükünü azaltın, müşteri memnuniyetini artırın.",
    aiReplyTitle: "AI Yanıt Önerileri",
    aiReplyDesc: "Her yoruma özel, markanızın tonunda profesyonel yanıtlar. Tek tıkla onaylayın, zaman kazanın.",
    visibilityTitle: "AI Visibility Score",
    visibilityDesc: "İşletmenizin ChatGPT, Gemini ve Google AI'da nasıl göründüğünü ölçün ve iyileştirin.",
    centralTitle: "Merkezi Yorum Paneli",
    centralDesc: "Google, Booking, TripAdvisor — tüm platformlardan gelen yorumlar tek dashboard'da.",
    sentimentTitle: "Duygu Analizi & Raporlar",
    sentimentDesc: "Müşterilerinizin ne hissettiğini anlayın. Haftalık PDF raporlarla gelişimi takip edin.",
    multiLocTitle: "Çoklu Lokasyon Yönetimi",
    multiLocDesc: "50+ şubeyi tek panelden yönetin. Lokasyonları karşılaştırın, en iyileri öne çıkarın.",
    competitorTitle: "Rakip Analizi",
    competitorDesc: "Rakiplerinizin puanlarını, yanıt sürelerini ve müşteri algısını takip edin."
  },
  pricingSection: {
    badge: "Erken Erişim",
    title: "İlk 100 işletmeye özel",
    subtitle: "3 ay boyunca tüm özellikler ve sınırsız lokasyon ücretsiz. Sonrasında lokasyon başına uygun fiyatlarla devam edin.",
    perk1: "3 ay tüm özellikler ücretsiz",
    perk2: "Öncelikli destek",
    cta: "3 Ay Ücretsiz Başla"
  },
  footerSection: {
    tagline: "AI destekli yorum yönetimi ve görünürlük optimizasyonu.",
    links: "Bağlantılar",
    about: "Hakkımızda",
    blog: "Blog",
    contact: "İletişim",
    hub: "Hub",
    legal: "Yasal",
    privacy: "Gizlilik Politikası",
    terms: "Kullanım Şartları",
    rights: "Tüm hakları saklıdır."
  }
};
const tr = {
  nav,
  landing,
  hero,
  features,
  pricing,
  cta,
  footer,
  contact,
  auth,
  dashboard,
  reviews,
  settings,
  privacy,
  terms,
  demo,
  about,
  indexPage
};
i18n.use(LanguageDetector).use(initReactI18next).init({
  resources: {
    en: { translation: en },
    tr: { translation: tr }
  },
  fallbackLng: "tr",
  lng: "tr",
  // Default language is Turkish
  interpolation: {
    escapeValue: false
  },
  detection: {
    order: ["localStorage", "navigator"],
    caches: ["localStorage"]
  }
});
const createRoot = ViteReactSSG({ routes });
export {
  AlertDialog as A,
  Button as B,
  TooltipTrigger as C,
  DropdownMenu as D,
  TooltipContent as E,
  AppLayout as F,
  useReviewFetch as G,
  useNewReviews as H,
  Input as I,
  DropdownMenuLabel as J,
  DropdownMenuSeparator as K,
  DropdownMenuCheckboxItem as L,
  Sheet as M,
  SheetContent as N,
  SheetHeader as O,
  SheetTitle as P,
  SheetDescription as Q,
  logo as R,
  Skeleton as S,
  Tooltip as T,
  buttonVariants as U,
  TooltipProvider as V,
  useBusiness as a,
  useUrlLocale as b,
  DropdownMenuTrigger as c,
  createRoot,
  DropdownMenuContent as d,
  DropdownMenuItem as e,
  blogPosts as f,
  getBlogPost as g,
  getCityHotelData as h,
  invokeAuthedFunction as i,
  cityHotelData as j,
  getPlatformLandingPage as k,
  getPlatformLandingSlugs as l,
  Badge as m,
  AlertDialogContent as n,
  AlertDialogHeader as o,
  platformLandingPages as p,
  AlertDialogTitle as q,
  AlertDialogDescription as r,
  supabase as s,
  toast as t,
  useAuth as u,
  AlertDialogFooter as v,
  AlertDialogCancel as w,
  AlertDialogAction as x,
  cn as y,
  useToast as z
};
