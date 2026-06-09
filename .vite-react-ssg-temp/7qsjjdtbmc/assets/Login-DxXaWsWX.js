import { jsxs, jsx } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { u as useAuth, B as Button, I as Input, s as supabase } from "../main.mjs";
import { l as lovable } from "./index-BeSLZD-2.js";
import { L as Label } from "./label-Dr59vwVb.js";
import { C as Card, a as CardHeader, b as CardDescription, c as CardContent, d as CardFooter } from "./card-vx9BCW0t.js";
import { A as Alert, a as AlertDescription } from "./alert-BbdwpNV6.js";
import { useTranslation } from "react-i18next";
import { S as SEO } from "./SEO-CentcBuw.js";
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
import "@lovable.dev/cloud-auth-js";
import "@radix-ui/react-label";
import "react-helmet-async";
function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectParam = searchParams.get("redirect");
  const redirectTo = redirectParam && redirectParam.startsWith("/") ? redirectParam : "/dashboard";
  const { user } = useAuth();
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    if (user) {
      navigate(redirectTo);
    }
  }, [user, navigate, redirectTo]);
  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { error: error2 } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      if (error2) {
        if (error2.message.includes("Email not confirmed")) {
          setError(t("auth.login.emailNotVerified"));
        } else if (error2.message.includes("Invalid login credentials")) {
          setError(t("auth.login.error"));
        } else {
          setError(error2.message);
        }
      } else {
        try {
          const { trackEvent } = await import("./analytics-C1JJo_xK.js");
          trackEvent("login", { method: "email" });
        } catch {
        }
        navigate(redirectTo);
      }
    } catch (err) {
      setError(t("auth.login.error"));
    } finally {
      setLoading(false);
    }
  };
  const handleGoogleSignIn = async () => {
    try {
      const { error: error2 } = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: window.location.origin
      });
      if (error2) {
        setError(error2.message || t("auth.login.error"));
      }
    } catch {
      setError(t("auth.login.error"));
    }
  };
  return /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-center min-h-screen bg-background", children: [
    /* @__PURE__ */ jsx(
      SEO,
      {
        title: "Giriş Yap | VoyageRespond",
        description: "VoyageRespond hesabınıza giriş yaparak Google, Booking ve TripAdvisor yorumlarınızı tek panelden yönetin, AI yanıtlar oluşturun ve raporlarınızı görüntüleyin.",
        canonical: "/login",
        noindex: true
      }
    ),
    /* @__PURE__ */ jsxs(Card, { className: "w-full max-w-md", children: [
      /* @__PURE__ */ jsxs(CardHeader, { className: "space-y-1", children: [
        /* @__PURE__ */ jsx("h1", { className: "text-2xl font-semibold leading-none tracking-tight", children: t("auth.login.title") }),
        /* @__PURE__ */ jsx(CardDescription, { children: t("auth.login.subtitle") })
      ] }),
      /* @__PURE__ */ jsxs(CardContent, { className: "space-y-4", children: [
        error && /* @__PURE__ */ jsx(Alert, { variant: "destructive", children: /* @__PURE__ */ jsx(AlertDescription, { children: error }) }),
        /* @__PURE__ */ jsxs(
          Button,
          {
            type: "button",
            variant: "outline",
            className: "w-full flex items-center gap-3",
            onClick: handleGoogleSignIn,
            disabled: loading,
            children: [
              /* @__PURE__ */ jsxs("svg", { className: "w-5 h-5", viewBox: "0 0 24 24", children: [
                /* @__PURE__ */ jsx("path", { d: "M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z", fill: "#4285F4" }),
                /* @__PURE__ */ jsx("path", { d: "M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z", fill: "#34A853" }),
                /* @__PURE__ */ jsx("path", { d: "M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z", fill: "#FBBC05" }),
                /* @__PURE__ */ jsx("path", { d: "M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z", fill: "#EA4335" })
              ] }),
              t("auth.login.googleSignIn", "Google ile Giriş Yap")
            ]
          }
        ),
        /* @__PURE__ */ jsxs("div", { className: "relative", children: [
          /* @__PURE__ */ jsx("div", { className: "absolute inset-0 flex items-center", children: /* @__PURE__ */ jsx("span", { className: "w-full border-t" }) }),
          /* @__PURE__ */ jsx("div", { className: "relative flex justify-center text-xs uppercase", children: /* @__PURE__ */ jsx("span", { className: "bg-background px-2 text-muted-foreground", children: t("auth.login.orEmail", "veya email ile") }) })
        ] }),
        /* @__PURE__ */ jsxs("form", { onSubmit: handleLogin, className: "space-y-4", children: [
          /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsx(Label, { htmlFor: "email", children: t("auth.login.email") }),
            /* @__PURE__ */ jsx(
              Input,
              {
                id: "email",
                type: "email",
                placeholder: "example@email.com",
                value: email,
                onChange: (e) => setEmail(e.target.value),
                required: true,
                disabled: loading
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsx(Label, { htmlFor: "password", children: t("auth.login.password") }),
            /* @__PURE__ */ jsx(
              Input,
              {
                id: "password",
                type: "password",
                value: password,
                onChange: (e) => setPassword(e.target.value),
                required: true,
                disabled: loading
              }
            )
          ] }),
          /* @__PURE__ */ jsx("div", { className: "text-sm", children: /* @__PURE__ */ jsx(
            Link,
            {
              to: "/forgot-password",
              className: "text-primary hover:underline",
              children: t("auth.login.forgotPassword")
            }
          ) }),
          /* @__PURE__ */ jsx(
            Button,
            {
              type: "submit",
              className: "w-full",
              disabled: loading,
              children: loading ? `${t("auth.login.submit")}...` : t("auth.login.submit")
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsx(CardFooter, { children: /* @__PURE__ */ jsxs("div", { className: "text-sm text-center text-muted-foreground w-full", children: [
        t("auth.login.noAccount"),
        " ",
        /* @__PURE__ */ jsx(Link, { to: "/register", className: "text-primary hover:underline", children: t("auth.login.register") })
      ] }) })
    ] })
  ] });
}
export {
  Login as default
};
