import { jsx, jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { Link } from "react-router-dom";
import { B as Button, I as Input, s as supabase } from "../main.mjs";
import { L as Label } from "./label-Dr59vwVb.js";
import { C as Card, a as CardHeader, b as CardDescription, c as CardContent, d as CardFooter } from "./card-vx9BCW0t.js";
import { A as Alert, a as AlertDescription } from "./alert-BbdwpNV6.js";
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
import "@radix-ui/react-label";
function ForgotPassword() {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const redirectUrl = `${window.location.origin}/auth/reset`;
      const { error: error2 } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectUrl
      });
      if (error2) {
        setError(error2.message);
      } else {
        setSuccess(true);
      }
    } catch (err) {
      setError(t("auth.forgotPassword.error"));
    } finally {
      setLoading(false);
    }
  };
  if (success) {
    return /* @__PURE__ */ jsx("div", { className: "flex items-center justify-center min-h-screen bg-background", children: /* @__PURE__ */ jsxs(Card, { className: "w-full max-w-md", children: [
      /* @__PURE__ */ jsxs(CardHeader, { children: [
        /* @__PURE__ */ jsx("h1", { className: "text-2xl font-semibold leading-none tracking-tight", children: t("auth.forgotPassword.success") }),
        /* @__PURE__ */ jsx(CardDescription, { children: t("auth.forgotPassword.subtitle") })
      ] }),
      /* @__PURE__ */ jsx(CardContent, { className: "space-y-4", children: /* @__PURE__ */ jsx(Alert, { children: /* @__PURE__ */ jsxs(AlertDescription, { children: [
        /* @__PURE__ */ jsx("strong", { children: email }),
        " - ",
        t("auth.forgotPassword.success")
      ] }) }) }),
      /* @__PURE__ */ jsx(CardFooter, { children: /* @__PURE__ */ jsx(Link, { to: "/login", className: "w-full", children: /* @__PURE__ */ jsx(Button, { variant: "outline", className: "w-full", children: t("auth.forgotPassword.backToLogin") }) }) })
    ] }) });
  }
  return /* @__PURE__ */ jsx("div", { className: "flex items-center justify-center min-h-screen bg-background", children: /* @__PURE__ */ jsxs(Card, { className: "w-full max-w-md", children: [
    /* @__PURE__ */ jsxs(CardHeader, { className: "space-y-1", children: [
      /* @__PURE__ */ jsx("h1", { className: "text-2xl font-semibold leading-none tracking-tight", children: t("auth.forgotPassword.title") }),
      /* @__PURE__ */ jsx(CardDescription, { children: t("auth.forgotPassword.subtitle") })
    ] }),
    /* @__PURE__ */ jsxs("form", { onSubmit: handleResetPassword, children: [
      /* @__PURE__ */ jsxs(CardContent, { className: "space-y-4", children: [
        error && /* @__PURE__ */ jsx(Alert, { variant: "destructive", children: /* @__PURE__ */ jsx(AlertDescription, { children: error }) }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsx(Label, { htmlFor: "email", children: t("auth.forgotPassword.email") }),
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
        ] })
      ] }),
      /* @__PURE__ */ jsxs(CardFooter, { className: "flex flex-col space-y-4", children: [
        /* @__PURE__ */ jsx(
          Button,
          {
            type: "submit",
            className: "w-full",
            disabled: loading,
            children: loading ? `${t("auth.forgotPassword.submit")}...` : t("auth.forgotPassword.submit")
          }
        ),
        /* @__PURE__ */ jsx("div", { className: "text-sm text-center text-muted-foreground", children: /* @__PURE__ */ jsx(Link, { to: "/login", className: "text-primary hover:underline", children: t("auth.forgotPassword.backToLogin") }) })
      ] })
    ] })
  ] }) });
}
export {
  ForgotPassword as default
};
