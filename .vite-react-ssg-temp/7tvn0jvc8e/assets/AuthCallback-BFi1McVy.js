import { jsx, jsxs } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { s as supabase } from "../main.mjs";
import { C as Card, a as CardHeader, e as CardTitle, c as CardContent } from "./card-vx9BCW0t.js";
import { useTranslation } from "react-i18next";
import "vite-react-ssg";
import "@radix-ui/react-toast";
import "class-variance-authority";
import "lucide-react";
import "clsx";
import "tailwind-merge";
import "next-themes";
import "sonner";
import "@radix-ui/react-tooltip";
import "@tanstack/react-query";
import "@supabase/supabase-js";
import "@radix-ui/react-slot";
import "@radix-ui/react-separator";
import "@radix-ui/react-dialog";
import "@radix-ui/react-alert-dialog";
import "@radix-ui/react-dropdown-menu";
import "@radix-ui/react-collapsible";
import "i18next";
import "i18next-browser-languagedetector";
function AuthCallback() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [message, setMessage] = useState(t("auth.authCallback.verifying"));
  useEffect(() => {
    const handleCallback = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) {
          setMessage(t("auth.authCallback.error"));
          setTimeout(() => navigate("/login"), 3e3);
          return;
        }
        if (data.session) {
          setMessage(t("auth.authCallback.success"));
          setTimeout(() => navigate("/dashboard"), 2e3);
        } else {
          setMessage(t("auth.authCallback.noSession"));
          setTimeout(() => navigate("/login"), 2e3);
        }
      } catch (err) {
        setMessage(t("auth.authCallback.error"));
        setTimeout(() => navigate("/login"), 3e3);
      }
    };
    handleCallback();
  }, [navigate]);
  return /* @__PURE__ */ jsx("div", { className: "flex items-center justify-center min-h-screen bg-background", children: /* @__PURE__ */ jsxs(Card, { className: "w-full max-w-md", children: [
    /* @__PURE__ */ jsx(CardHeader, { children: /* @__PURE__ */ jsx(CardTitle, { className: "text-2xl font-bold text-center", children: t("auth.authCallback.title") }) }),
    /* @__PURE__ */ jsx(CardContent, { className: "text-center", children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center space-y-4", children: [
      /* @__PURE__ */ jsx("div", { className: "animate-spin rounded-full h-8 w-8 border-b-2 border-primary" }),
      /* @__PURE__ */ jsx("p", { className: "text-muted-foreground", children: message })
    ] }) })
  ] }) });
}
export {
  AuthCallback as default
};
