import { jsx, jsxs, Fragment } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { a as useBusiness, t as toast, i as invokeAuthedFunction, B as Button, s as supabase } from "../main.mjs";
import { C as Card, a as CardHeader, e as CardTitle, b as CardDescription, c as CardContent } from "./card-vx9BCW0t.js";
import { C as Checkbox } from "./checkbox-JmtvmXQr.js";
import { L as Label } from "./label-Dr59vwVb.js";
import { Loader2 } from "lucide-react";
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
import "@radix-ui/react-checkbox";
import "@radix-ui/react-label";
function GoogleBusinessCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { refetchBusinesses } = useBusiness();
  const [loading, setLoading] = useState(true);
  const [businesses, setBusinesses] = useState([]);
  const [selectedBusinesses, setSelectedBusinesses] = useState(/* @__PURE__ */ new Set());
  const [refreshToken, setRefreshToken] = useState("");
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    const code = searchParams.get("code");
    const error = searchParams.get("error");
    if (error) {
      toast({
        title: "Hata",
        description: "Google Business bağlantısı iptal edildi",
        variant: "destructive"
      });
      navigate("/dashboard");
      return;
    }
    if (!code) {
      navigate("/dashboard");
      return;
    }
    exchangeCode(code);
  }, [searchParams]);
  const exchangeCode = async (code) => {
    try {
      const response = await invokeAuthedFunction("google-business-auth", {
        body: { action: "exchange", code }
      });
      const businessResults = (response == null ? void 0 : response.businesses) || [];
      setBusinesses(businessResults);
      setRefreshToken((response == null ? void 0 : response.refresh_token) || "");
      const allIds = new Set(businessResults.map((b) => b.location_id));
      setSelectedBusinesses(allIds);
    } catch (error) {
      console.error("Exchange error:", error);
      toast({
        title: "Hata",
        description: error.message || "İşletmeler getirilemedi",
        variant: "destructive"
      });
      navigate("/dashboard");
    } finally {
      setLoading(false);
    }
  };
  const handleToggle = (locationId) => {
    setSelectedBusinesses((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(locationId)) {
        newSet.delete(locationId);
      } else {
        newSet.add(locationId);
      }
      return newSet;
    });
  };
  const handleSave = async () => {
    if (selectedBusinesses.size === 0) {
      toast({
        title: "Uyarı",
        description: "Lütfen en az bir işletme seçin",
        variant: "destructive"
      });
      return;
    }
    setSaving(true);
    try {
      const selectedBizList = businesses.filter((b) => selectedBusinesses.has(b.location_id));
      await invokeAuthedFunction("google-business-auth", {
        body: {
          action: "save",
          businesses: selectedBizList,
          refresh_token: refreshToken
        }
      });
      try {
        const { data: userBusinesses } = await supabase.from("businesses").select("id, google_connected, google_location_id").eq("google_connected", true);
        if (userBusinesses) {
          await Promise.allSettled(
            userBusinesses.filter((b) => b.google_location_id).map(
              (b) => invokeAuthedFunction("google-business-info", {
                body: { business_id: b.id }
              })
            )
          );
        }
      } catch (infoError) {
        console.warn("Auto-fetch business info failed:", infoError);
      }
      setTimeout(() => {
        selectedBizList.forEach(async (biz) => {
          try {
            const { data: matchingBiz } = await supabase.from("businesses").select("id").eq("google_location_id", biz.location_id).maybeSingle();
            if (matchingBiz == null ? void 0 : matchingBiz.id) {
              await supabase.functions.invoke("send-business-analysis-email", {
                body: { business_id: matchingBiz.id, trigger_source: "new_connection" }
              });
            }
          } catch (e) {
            console.warn("Analysis email trigger failed for", biz.name, e);
          }
        });
      }, 3e4);
      await refetchBusinesses();
      toast({
        title: "Başarılı",
        description: `${selectedBusinesses.size} işletme eklendi`
      });
      navigate("/dashboard", { replace: true });
    } catch (error) {
      console.error("Save error:", error);
      toast({
        title: "Hata",
        description: error.message || "İşletmeler kaydedilemedi",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };
  if (loading) {
    return /* @__PURE__ */ jsx("div", { className: "min-h-screen flex items-center justify-center", children: /* @__PURE__ */ jsx(Loader2, { className: "h-8 w-8 animate-spin text-primary" }) });
  }
  return /* @__PURE__ */ jsx("div", { className: "min-h-screen flex items-center justify-center p-4 bg-background", children: /* @__PURE__ */ jsxs(Card, { className: "w-full max-w-2xl", children: [
    /* @__PURE__ */ jsxs(CardHeader, { children: [
      /* @__PURE__ */ jsx(CardTitle, { children: "İşletmelerinizi Seçin" }),
      /* @__PURE__ */ jsxs(CardDescription, { children: [
        "Google Business Profile hesabınızdan ",
        businesses.length,
        " işletme bulundu"
      ] })
    ] }),
    /* @__PURE__ */ jsxs(CardContent, { children: [
      /* @__PURE__ */ jsx("div", { className: "space-y-4 mb-6 max-h-96 overflow-y-auto", children: businesses.map((business) => /* @__PURE__ */ jsxs(
        "div",
        {
          className: "flex items-start space-x-3 p-3 rounded-lg border hover:bg-accent/50 transition-colors",
          children: [
            /* @__PURE__ */ jsx(
              Checkbox,
              {
                id: business.location_id,
                checked: selectedBusinesses.has(business.location_id),
                onCheckedChange: () => handleToggle(business.location_id)
              }
            ),
            /* @__PURE__ */ jsxs("div", { className: "flex-1", children: [
              /* @__PURE__ */ jsx(
                Label,
                {
                  htmlFor: business.location_id,
                  className: "text-base font-medium cursor-pointer",
                  children: business.name
                }
              ),
              business.place_id && /* @__PURE__ */ jsxs("p", { className: "text-sm text-muted-foreground mt-1", children: [
                "Place ID: ",
                business.place_id
              ] })
            ] })
          ]
        },
        business.location_id
      )) }),
      /* @__PURE__ */ jsxs("div", { className: "flex gap-3", children: [
        /* @__PURE__ */ jsx(
          Button,
          {
            variant: "outline",
            onClick: () => navigate("/dashboard"),
            disabled: saving,
            className: "flex-1",
            children: "İptal"
          }
        ),
        /* @__PURE__ */ jsx(
          Button,
          {
            onClick: handleSave,
            disabled: saving || selectedBusinesses.size === 0,
            className: "flex-1",
            children: saving ? /* @__PURE__ */ jsxs(Fragment, { children: [
              /* @__PURE__ */ jsx(Loader2, { className: "mr-2 h-4 w-4 animate-spin" }),
              "Kaydediliyor..."
            ] }) : `${selectedBusinesses.size} İşletme Ekle`
          }
        )
      ] })
    ] })
  ] }) });
}
export {
  GoogleBusinessCallback as default
};
