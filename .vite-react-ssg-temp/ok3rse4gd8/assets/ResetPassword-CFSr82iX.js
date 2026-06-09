import { jsx, jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { I as Input, B as Button, s as supabase } from "../main.mjs";
import { L as Label } from "./label-Dr59vwVb.js";
import { C as Card, a as CardHeader, e as CardTitle, b as CardDescription, c as CardContent, d as CardFooter } from "./card-vx9BCW0t.js";
import { A as Alert, a as AlertDescription } from "./alert-BbdwpNV6.js";
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
import "@radix-ui/react-label";
function ResetPassword() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError("");
    if (password.length < 6) {
      setError("Şifre en az 6 karakter olmalı.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Şifreler eşleşmiyor.");
      return;
    }
    setLoading(true);
    try {
      const { error: error2 } = await supabase.auth.updateUser({
        password
      });
      if (error2) {
        setError(error2.message);
      } else {
        alert("Şifren başarıyla güncellendi! Giriş sayfasına yönlendiriliyorsun...");
        setTimeout(() => navigate("/login"), 1e3);
      }
    } catch (err) {
      setError("Bir hata oluştu. Lütfen tekrar dene.");
    } finally {
      setLoading(false);
    }
  };
  return /* @__PURE__ */ jsx("div", { className: "flex items-center justify-center min-h-screen bg-background", children: /* @__PURE__ */ jsxs(Card, { className: "w-full max-w-md", children: [
    /* @__PURE__ */ jsxs(CardHeader, { className: "space-y-1", children: [
      /* @__PURE__ */ jsx(CardTitle, { className: "text-2xl font-bold", children: "Yeni Şifre Belirle" }),
      /* @__PURE__ */ jsx(CardDescription, { children: "Hesabın için yeni bir şifre oluştur" })
    ] }),
    /* @__PURE__ */ jsxs("form", { onSubmit: handleResetPassword, children: [
      /* @__PURE__ */ jsxs(CardContent, { className: "space-y-4", children: [
        error && /* @__PURE__ */ jsx(Alert, { variant: "destructive", children: /* @__PURE__ */ jsx(AlertDescription, { children: error }) }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsx(Label, { htmlFor: "password", children: "Yeni Şifre" }),
          /* @__PURE__ */ jsx(
            Input,
            {
              id: "password",
              type: "password",
              placeholder: "En az 6 karakter",
              value: password,
              onChange: (e) => setPassword(e.target.value),
              required: true,
              disabled: loading
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsx(Label, { htmlFor: "confirmPassword", children: "Yeni Şifre (Tekrar)" }),
          /* @__PURE__ */ jsx(
            Input,
            {
              id: "confirmPassword",
              type: "password",
              placeholder: "Şifreni tekrar gir",
              value: confirmPassword,
              onChange: (e) => setConfirmPassword(e.target.value),
              required: true,
              disabled: loading
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsx(CardFooter, { children: /* @__PURE__ */ jsx(
        Button,
        {
          type: "submit",
          className: "w-full",
          disabled: loading,
          children: loading ? "Güncelleniyor..." : "Şifreyi Güncelle"
        }
      ) })
    ] })
  ] }) });
}
export {
  ResetPassword as default
};
