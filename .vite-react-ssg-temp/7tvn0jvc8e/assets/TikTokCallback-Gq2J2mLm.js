import { jsx, jsxs, Fragment } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { s as supabase } from "../main.mjs";
import { Music2 } from "lucide-react";
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
function TikTokCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState("loading");
  const [errorMessage, setErrorMessage] = useState("");
  useEffect(() => {
    const handleCallback = async () => {
      var _a, _b, _c;
      const code = searchParams.get("code");
      const state = searchParams.get("state");
      const error = searchParams.get("error");
      if (error) {
        console.error("TikTok OAuth error:", error, searchParams.get("error_description"));
        setStatus("error");
        setErrorMessage(searchParams.get("error_description") || "Authentication was cancelled or denied.");
        setTimeout(() => navigate("/channels/tiktok?error=1"), 2e3);
        return;
      }
      if (!code || !state) {
        setStatus("error");
        setErrorMessage("Missing authorization code or state.");
        setTimeout(() => navigate("/channels/tiktok?error=1"), 2e3);
        return;
      }
      const storedState = sessionStorage.getItem("tiktok_oauth_state");
      if (!storedState || storedState !== state) {
        console.error("State mismatch:", { stored: storedState, received: state });
        setStatus("error");
        setErrorMessage("Security validation failed. Please try again.");
        setTimeout(() => navigate("/channels/tiktok?error=1"), 2e3);
        return;
      }
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError || !session) {
          console.error("No active session:", sessionError);
          setStatus("error");
          setErrorMessage("Please log in to finish connecting TikTok.");
          const redirectBack = `${window.location.pathname}${window.location.search}`;
          setTimeout(() => navigate(`/login?redirect=${encodeURIComponent(redirectBack)}`), 500);
          return;
        }
        const response = await supabase.functions.invoke("tiktok-auth", {
          body: { action: "exchange", code, state },
          headers: { Authorization: `Bearer ${session.access_token}` }
        });
        if (response.error || !((_a = response.data) == null ? void 0 : _a.success)) {
          throw new Error(((_b = response.data) == null ? void 0 : _b.error) || ((_c = response.error) == null ? void 0 : _c.message) || "Token exchange failed");
        }
        sessionStorage.removeItem("tiktok_oauth_state");
        setStatus("success");
        setTimeout(() => navigate("/channels/tiktok?connected=1"), 1500);
      } catch (error2) {
        console.error("Callback error:", error2);
        setStatus("error");
        setErrorMessage(error2 instanceof Error ? error2.message : "Connection failed");
        setTimeout(() => navigate("/channels/tiktok?error=1"), 2e3);
      }
    };
    handleCallback();
  }, [searchParams, navigate]);
  return /* @__PURE__ */ jsx("div", { className: "flex min-h-screen items-center justify-center bg-background", children: /* @__PURE__ */ jsxs("div", { className: "text-center", children: [
    /* @__PURE__ */ jsx("div", { className: "mb-6 flex justify-center", children: /* @__PURE__ */ jsx("div", { className: "flex h-16 w-16 items-center justify-center rounded-2xl bg-black", children: /* @__PURE__ */ jsx(Music2, { className: "h-8 w-8 text-white" }) }) }),
    status === "loading" && /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsx("div", { className: "mb-4 flex justify-center", children: /* @__PURE__ */ jsx("div", { className: "h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" }) }),
      /* @__PURE__ */ jsx("h2", { className: "text-xl font-semibold", children: "Connecting TikTok..." }),
      /* @__PURE__ */ jsx("p", { className: "mt-2 text-muted-foreground", children: "Please wait while we complete the connection." })
    ] }),
    status === "success" && /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsx("div", { className: "mb-4 flex justify-center", children: /* @__PURE__ */ jsx("div", { className: "flex h-12 w-12 items-center justify-center rounded-full bg-green-100", children: /* @__PURE__ */ jsx("svg", { className: "h-6 w-6 text-green-600", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M5 13l4 4L19 7" }) }) }) }),
      /* @__PURE__ */ jsx("h2", { className: "text-xl font-semibold text-green-600", children: "Connected!" }),
      /* @__PURE__ */ jsx("p", { className: "mt-2 text-muted-foreground", children: "Redirecting you back..." })
    ] }),
    status === "error" && /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsx("div", { className: "mb-4 flex justify-center", children: /* @__PURE__ */ jsx("div", { className: "flex h-12 w-12 items-center justify-center rounded-full bg-red-100", children: /* @__PURE__ */ jsx("svg", { className: "h-6 w-6 text-red-600", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M6 18L18 6M6 6l12 12" }) }) }) }),
      /* @__PURE__ */ jsx("h2", { className: "text-xl font-semibold text-red-600", children: "Connection Failed" }),
      /* @__PURE__ */ jsx("p", { className: "mt-2 text-muted-foreground", children: errorMessage }),
      /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm text-muted-foreground", children: "Redirecting you back..." })
    ] })
  ] }) });
}
export {
  TikTokCallback as default
};
