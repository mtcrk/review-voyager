import { jsx, jsxs, Fragment } from "react/jsx-runtime";
import { useState } from "react";
import { D as Dialog, a as DialogContent, b as DialogHeader, c as DialogTitle, d as DialogDescription } from "./dialog-CFYcafO1.js";
import { L as Label } from "./label-Dr59vwVb.js";
import { u as useAuth, B as Button, I as Input, s as supabase, t as toast, i as invokeAuthedFunction } from "../main.mjs";
import { A as Alert, a as AlertDescription } from "./alert-BbdwpNV6.js";
import { Building2, CheckCircle2, MapPin, Globe, Search, ExternalLink, Loader2 } from "lucide-react";
function getEmailDomain(email) {
  var _a;
  return ((_a = email.split("@")[1]) == null ? void 0 : _a.toLowerCase()) || "";
}
function getCompanyNameFromEmail(email) {
  const domain = getEmailDomain(email);
  const parts = domain.split(".");
  if (parts.length >= 2) {
    return parts[0].charAt(0).toUpperCase() + parts[0].slice(1);
  }
  return domain;
}
function BusinessOnboarding({ open, onBusinessCreated, onDismiss }) {
  const { user } = useAuth();
  const [businessName, setBusinessName] = useState("");
  const [placeId, setPlaceId] = useState("");
  const [mapsUrl, setMapsUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [showManualForm, setShowManualForm] = useState(false);
  const [placeDetails, setPlaceDetails] = useState(null);
  const [verificationError, setVerificationError] = useState("");
  const extractPlaceId = (url) => {
    const placeIdMatch = url.match(/place_id[=:]([A-Za-z0-9_-]+)/);
    if (placeIdMatch) return placeIdMatch[1];
    const chijMatch = url.match(/(ChIJ[A-Za-z0-9_-]+)/);
    if (chijMatch) return chijMatch[1];
    const dataMatch = url.match(/!1s(0x[a-f0-9]+:[a-f0-9]+)/);
    if (dataMatch) return dataMatch[1];
    return null;
  };
  const handleMapsUrlChange = (url) => {
    setMapsUrl(url);
    setVerificationError("");
    setPlaceDetails(null);
    const extracted = extractPlaceId(url);
    if (extracted) {
      setPlaceId(extracted);
    }
  };
  const handlePlaceIdChange = (value) => {
    setPlaceId(value);
    setVerificationError("");
    setPlaceDetails(null);
  };
  const suggestedName = (user == null ? void 0 : user.email) ? getCompanyNameFromEmail(user.email) : "";
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    try {
      const { error } = await supabase.from("businesses").insert({
        user_id: user.id,
        name: businessName || suggestedName,
        place_id: placeId || null
      });
      if (error) throw error;
      toast({
        title: "Başarılı",
        description: "İşletmeniz eklendi!"
      });
      onBusinessCreated();
      resetForm();
    } catch (error) {
      toast({
        title: "Hata",
        description: error.message || "İşletme oluşturulamadı",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  const resetForm = () => {
    setBusinessName("");
    setPlaceId("");
    setMapsUrl("");
    setPlaceDetails(null);
    setVerificationError("");
  };
  const handleGoogleConnect = async () => {
    setLoading(true);
    try {
      const response = await invokeAuthedFunction("google-business-auth", {
        body: { action: "initiate" }
      });
      if (response == null ? void 0 : response.authUrl) {
        window.location.href = response.authUrl;
      }
    } catch (error) {
      console.error("Google connect error:", error);
      toast({
        title: "Bağlantı Hatası",
        description: error.message || "Google hesabına bağlanılamadı",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  return /* @__PURE__ */ jsx(Dialog, { open, onOpenChange: (isOpen) => {
    if (!isOpen && onDismiss) onDismiss();
  }, children: /* @__PURE__ */ jsxs(DialogContent, { className: "sm:max-w-lg", children: [
    /* @__PURE__ */ jsxs(DialogHeader, { children: [
      /* @__PURE__ */ jsxs(DialogTitle, { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsx(Building2, { className: "w-5 h-5 text-primary" }),
        "İşletmenizi Doğrulayın"
      ] }),
      /* @__PURE__ */ jsx(DialogDescription, { children: "İşletme bilgilerinizi ekleyerek hesabınızı doğrulayın" })
    ] }),
    (user == null ? void 0 : user.email) && /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 p-3 rounded-lg bg-primary/5 border border-primary/20", children: [
      /* @__PURE__ */ jsx(CheckCircle2, { className: "w-4 h-4 text-primary shrink-0" }),
      /* @__PURE__ */ jsxs("div", { className: "text-sm", children: [
        /* @__PURE__ */ jsx("span", { className: "text-muted-foreground", children: "Giriş yapılan e-posta: " }),
        /* @__PURE__ */ jsx("span", { className: "font-medium text-foreground", children: user.email })
      ] })
    ] }),
    !showManualForm ? /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
      /* @__PURE__ */ jsxs(
        Button,
        {
          type: "button",
          variant: "outline",
          className: "w-full h-12 text-base",
          onClick: handleGoogleConnect,
          disabled: loading,
          children: [
            /* @__PURE__ */ jsxs("svg", { className: "w-5 h-5 mr-2", viewBox: "0 0 24 24", children: [
              /* @__PURE__ */ jsx("path", { fill: "#4285F4", d: "M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" }),
              /* @__PURE__ */ jsx("path", { fill: "#34A853", d: "M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" }),
              /* @__PURE__ */ jsx("path", { fill: "#FBBC05", d: "M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" }),
              /* @__PURE__ */ jsx("path", { fill: "#EA4335", d: "M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" })
            ] }),
            "Google Business ile Bağlan"
          ]
        }
      ),
      /* @__PURE__ */ jsxs("div", { className: "relative", children: [
        /* @__PURE__ */ jsx("div", { className: "absolute inset-0 flex items-center", children: /* @__PURE__ */ jsx("span", { className: "w-full border-t" }) }),
        /* @__PURE__ */ jsx("div", { className: "relative flex justify-center text-xs uppercase", children: /* @__PURE__ */ jsx("span", { className: "bg-background px-2 text-muted-foreground", children: "veya" }) })
      ] }),
      /* @__PURE__ */ jsxs(
        Button,
        {
          type: "button",
          variant: "outline",
          className: "w-full",
          onClick: () => setShowManualForm(true),
          children: [
            /* @__PURE__ */ jsx(MapPin, { className: "w-4 h-4 mr-2" }),
            "Manuel Olarak Ekle"
          ]
        }
      )
    ] }) : /* @__PURE__ */ jsxs("form", { onSubmit: handleSubmit, className: "space-y-5", children: [
      /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsx(Label, { htmlFor: "businessName", children: "İşletme Adı" }),
        /* @__PURE__ */ jsx(
          Input,
          {
            id: "businessName",
            placeholder: suggestedName || "Otel / Restoran Adı",
            value: businessName,
            onChange: (e) => setBusinessName(e.target.value),
            required: true,
            disabled: loading
          }
        ),
        suggestedName && !businessName && /* @__PURE__ */ jsxs("p", { className: "text-xs text-muted-foreground", children: [
          "E-posta adresinizden önerilen: ",
          /* @__PURE__ */ jsx("button", { type: "button", className: "text-primary underline", onClick: () => setBusinessName(suggestedName), children: suggestedName })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
        /* @__PURE__ */ jsx(Label, { children: "Google Maps Bağlantısı veya Place ID" }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxs("div", { className: "relative", children: [
            /* @__PURE__ */ jsx(Globe, { className: "absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" }),
            /* @__PURE__ */ jsx(
              Input,
              {
                placeholder: "Google Maps URL yapıştırın...",
                value: mapsUrl,
                onChange: (e) => handleMapsUrlChange(e.target.value),
                disabled: loading || verifying,
                className: "pl-10"
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "relative", children: [
            /* @__PURE__ */ jsx("div", { className: "absolute inset-0 flex items-center", children: /* @__PURE__ */ jsx("span", { className: "w-full border-t border-dashed" }) }),
            /* @__PURE__ */ jsx("div", { className: "relative flex justify-center text-xs", children: /* @__PURE__ */ jsx("span", { className: "bg-background px-2 text-muted-foreground", children: "veya" }) })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "relative", children: [
            /* @__PURE__ */ jsx(Search, { className: "absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" }),
            /* @__PURE__ */ jsx(
              Input,
              {
                placeholder: "Google Place ID (ChIJ...)",
                value: placeId,
                onChange: (e) => handlePlaceIdChange(e.target.value),
                disabled: loading || verifying,
                className: "pl-10"
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "text-xs text-muted-foreground space-y-1", children: [
          /* @__PURE__ */ jsxs("p", { className: "flex items-center gap-1", children: [
            /* @__PURE__ */ jsx(ExternalLink, { className: "w-3 h-3" }),
            /* @__PURE__ */ jsx(
              "a",
              {
                href: "https://developers.google.com/maps/documentation/places/web-service/place-id",
                target: "_blank",
                rel: "noopener noreferrer",
                className: "text-primary hover:underline",
                children: "Place ID nasıl bulunur?"
              }
            )
          ] }),
          /* @__PURE__ */ jsx("p", { children: "Google Maps'te işletmenizi arayın → paylaş → bağlantıyı buraya yapıştırın." })
        ] }),
        verificationError && /* @__PURE__ */ jsx(Alert, { variant: "destructive", children: /* @__PURE__ */ jsx(AlertDescription, { children: verificationError }) }),
        placeDetails && /* @__PURE__ */ jsxs("div", { className: "p-4 rounded-lg border border-primary/20 bg-primary/5 space-y-2", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsx(CheckCircle2, { className: "w-5 h-5 text-primary" }),
            /* @__PURE__ */ jsx("span", { className: "font-medium text-foreground", children: placeDetails.name })
          ] }),
          /* @__PURE__ */ jsxs("p", { className: "text-sm text-muted-foreground flex items-center gap-1", children: [
            /* @__PURE__ */ jsx(MapPin, { className: "w-3 h-3" }),
            placeDetails.address
          ] }),
          placeDetails.rating && /* @__PURE__ */ jsxs("p", { className: "text-sm text-muted-foreground", children: [
            "⭐ ",
            placeDetails.rating,
            " (",
            placeDetails.totalReviews,
            " yorum)"
          ] })
        ] }),
        placeId && !placeDetails && /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-sm text-muted-foreground", children: [
          /* @__PURE__ */ jsx(CheckCircle2, { className: "w-4 h-4 text-primary" }),
          /* @__PURE__ */ jsxs("span", { children: [
            "Place ID algılandı: ",
            /* @__PURE__ */ jsxs("code", { className: "bg-muted px-1.5 py-0.5 rounded text-xs", children: [
              placeId.substring(0, 20),
              "..."
            ] })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex gap-2 pt-2", children: [
        /* @__PURE__ */ jsx(
          Button,
          {
            type: "button",
            variant: "ghost",
            className: "flex-1",
            onClick: () => {
              setShowManualForm(false);
              resetForm();
            },
            disabled: loading,
            children: "Geri"
          }
        ),
        /* @__PURE__ */ jsx(
          Button,
          {
            type: "submit",
            className: "flex-1",
            disabled: loading || verifying,
            children: loading ? /* @__PURE__ */ jsxs(Fragment, { children: [
              /* @__PURE__ */ jsx(Loader2, { className: "w-4 h-4 mr-2 animate-spin" }),
              "Oluşturuluyor..."
            ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
              /* @__PURE__ */ jsx(Building2, { className: "w-4 h-4 mr-2" }),
              "İşletme Oluştur"
            ] })
          }
        )
      ] })
    ] })
  ] }) });
}
export {
  BusinessOnboarding as B
};
