import { jsxs, jsx, Fragment } from "react/jsx-runtime";
import { C as Card, a as CardHeader, e as CardTitle, b as CardDescription, c as CardContent } from "./card-vx9BCW0t.js";
import { T as Tabs, a as TabsList, b as TabsTrigger, c as TabsContent } from "./tabs-C8D1i09v.js";
import { L as Label } from "./label-Dr59vwVb.js";
import { z as useToast, I as Input, B as Button, s as supabase, u as useAuth, a as useBusiness, m as Badge, A as AlertDialog, n as AlertDialogContent, o as AlertDialogHeader, q as AlertDialogTitle, r as AlertDialogDescription, v as AlertDialogFooter, w as AlertDialogCancel, x as AlertDialogAction, t as toast, i as invokeAuthedFunction, H as useNewReviews } from "../main.mjs";
import { useNavigate, useSearchParams } from "react-router-dom";
import { KeyRound, LogOut, Loader2, Bell, BellRing, AlertTriangle, BellOff, Mail, Send } from "lucide-react";
import { S as Switch } from "./switch-DIbAOqMh.js";
import { useState, useEffect } from "react";
import { z } from "zod";
import "@radix-ui/react-tabs";
import "@radix-ui/react-label";
import "class-variance-authority";
import "vite-react-ssg";
import "@radix-ui/react-toast";
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
import "@radix-ui/react-switch";
const passwordSchema = z.object({
  newPassword: z.string().min(8, { message: "Şifre en az 8 karakter olmalı" }).max(72, { message: "Şifre en fazla 72 karakter olabilir" }),
  confirmPassword: z.string()
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Şifreler eşleşmiyor",
  path: ["confirmPassword"]
});
function PasswordChangeCard() {
  const { toast: toast2 } = useToast();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const handleChangePassword = async () => {
    var _a;
    const result = passwordSchema.safeParse({ newPassword, confirmPassword });
    if (!result.success) {
      toast2({
        title: "Geçersiz şifre",
        description: ((_a = result.error.issues[0]) == null ? void 0 : _a.message) ?? "Lütfen kontrol edin",
        variant: "destructive"
      });
      return;
    }
    setSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) {
        toast2({
          title: "Şifre güncellenemedi",
          description: error.message,
          variant: "destructive"
        });
        return;
      }
      toast2({
        title: "Şifre güncellendi",
        description: "Yeni şifren ile giriş yapabilirsin."
      });
      setNewPassword("");
      setConfirmPassword("");
    } catch {
      toast2({
        title: "Bir hata oluştu",
        description: "Lütfen tekrar dene.",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };
  return /* @__PURE__ */ jsxs(Card, { className: "shadow-card", children: [
    /* @__PURE__ */ jsxs(CardHeader, { children: [
      /* @__PURE__ */ jsxs(CardTitle, { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsx(KeyRound, { className: "h-5 w-5" }),
        "Şifre Değiştir"
      ] }),
      /* @__PURE__ */ jsx(CardDescription, { children: "Hesap şifrenizi güvenli bir şekilde güncelleyin" })
    ] }),
    /* @__PURE__ */ jsxs(CardContent, { className: "space-y-4", children: [
      /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsx(Label, { htmlFor: "newPassword", children: "Yeni Şifre" }),
        /* @__PURE__ */ jsx(
          Input,
          {
            id: "newPassword",
            type: "password",
            placeholder: "En az 8 karakter",
            value: newPassword,
            onChange: (e) => setNewPassword(e.target.value),
            disabled: saving,
            autoComplete: "new-password"
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
            disabled: saving,
            autoComplete: "new-password"
          }
        )
      ] }),
      /* @__PURE__ */ jsx(Button, { onClick: handleChangePassword, disabled: saving || !newPassword || !confirmPassword, children: saving ? "Güncelleniyor..." : "Şifreyi Güncelle" })
    ] })
  ] });
}
const notificationOptions = [
  {
    value: "instant",
    label: "Tüm Yorumlar",
    description: "Her yeni yorum geldiğinde e-posta bildirimi alın",
    icon: BellRing
  },
  {
    value: "negative_only",
    label: "Sadece Olumsuz",
    description: "Yalnızca 1-3 yıldızlı yorumlarda bildirim alın",
    icon: AlertTriangle
  },
  {
    value: "none",
    label: "Kapalı",
    description: "E-posta bildirimi almayın",
    icon: BellOff
  }
];
function Settings() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, profile, refreshProfile } = useAuth();
  const { activeBusiness } = useBusiness();
  const [fullName, setFullName] = useState("");
  const [saving, setSaving] = useState(false);
  const [googleConnecting, setGoogleConnecting] = useState(false);
  const [notificationType, setNotificationType] = useState("instant");
  const [savingNotification, setSavingNotification] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name);
    }
  }, [profile]);
  useEffect(() => {
    if (activeBusiness) {
      const biz = activeBusiness;
      setNotificationType(biz.review_notification_type || "instant");
    }
  }, [activeBusiness]);
  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "Çıkış Yapıldı",
        description: "Başarıyla çıkış yaptınız."
      });
      navigate("/login");
    } catch (error) {
      toast({
        title: "Hata",
        description: "Çıkış yapılırken bir hata oluştu.",
        variant: "destructive"
      });
    }
  };
  const handleSaveProfile = async () => {
    if (!user || !profile) return;
    setSaving(true);
    try {
      const { error } = await supabase.from("profiles").update({ full_name: fullName }).eq("user_id", user.id);
      if (error) throw error;
      await refreshProfile();
      toast({
        title: "Başarılı",
        description: "Profil bilgileriniz güncellendi."
      });
    } catch (error) {
      toast({
        title: "Hata",
        description: "Profil güncellenirken bir hata oluştu.",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };
  const handleSaveNotification = async (type) => {
    if (!activeBusiness) return;
    setSavingNotification(true);
    setNotificationType(type);
    try {
      const { error } = await supabase.from("businesses").update({ review_notification_type: type }).eq("id", activeBusiness.id);
      if (error) throw error;
      toast({
        title: "Başarılı",
        description: "Bildirim tercihiniz güncellendi."
      });
    } catch (error) {
      toast({
        title: "Hata",
        description: "Bildirim tercihi güncellenirken bir hata oluştu.",
        variant: "destructive"
      });
    } finally {
      setSavingNotification(false);
    }
  };
  const handleGoogleConnect = async () => {
    setGoogleConnecting(true);
    try {
      const response = await invokeAuthedFunction("google-business-auth", {
        body: { action: "initiate" }
      });
      if (!(response == null ? void 0 : response.authUrl)) {
        throw new Error("Google bağlantı adresi alınamadı");
      }
      window.location.href = response.authUrl;
    } catch (error) {
      toast({
        title: "Bağlantı Hatası",
        description: error.message || "Google Business bağlantısı başlatılamadı.",
        variant: "destructive"
      });
    } finally {
      setGoogleConnecting(false);
    }
  };
  return /* @__PURE__ */ jsxs("div", { className: "p-8 space-y-6", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h1", { className: "text-3xl font-semibold text-foreground mb-2", children: "Ayarlar" }),
        /* @__PURE__ */ jsx("p", { className: "text-muted-foreground", children: "Hesabınızı ve tercihlerinizi yönetin" }),
        profile && /* @__PURE__ */ jsxs(Badge, { variant: "secondary", className: "mt-2", children: [
          "Rol: ",
          profile.role
        ] })
      ] }),
      /* @__PURE__ */ jsxs(Button, { variant: "outline", onClick: () => setShowLogoutDialog(true), children: [
        /* @__PURE__ */ jsx(LogOut, { className: "mr-2 h-4 w-4" }),
        "Çıkış Yap"
      ] }),
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
              onClick: handleLogout,
              children: "Evet, Çıkış Yap"
            }
          )
        ] })
      ] }) })
    ] }),
    /* @__PURE__ */ jsxs(Tabs, { defaultValue: searchParams.get("tab") || "profile", className: "space-y-6", children: [
      /* @__PURE__ */ jsxs(TabsList, { className: "bg-muted/30", children: [
        /* @__PURE__ */ jsx(TabsTrigger, { value: "profile", children: "Profil" }),
        /* @__PURE__ */ jsx(TabsTrigger, { value: "business", children: "İşletme Bilgileri" }),
        /* @__PURE__ */ jsx(TabsTrigger, { value: "google", children: "Google Entegrasyonu" }),
        /* @__PURE__ */ jsx(TabsTrigger, { value: "auto-reply", children: "Otomatik Yanıt" }),
        /* @__PURE__ */ jsx(TabsTrigger, { value: "notifications", children: "Bildirimler" })
      ] }),
      /* @__PURE__ */ jsxs(TabsContent, { value: "profile", className: "space-y-6", children: [
        /* @__PURE__ */ jsxs(Card, { className: "shadow-card", children: [
          /* @__PURE__ */ jsxs(CardHeader, { children: [
            /* @__PURE__ */ jsx(CardTitle, { children: "Profil Bilgileri" }),
            /* @__PURE__ */ jsx(CardDescription, { children: "Kişisel bilgilerinizi güncelleyin" })
          ] }),
          /* @__PURE__ */ jsxs(CardContent, { className: "space-y-4", children: [
            /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsx(Label, { htmlFor: "fullName", children: "Tam Ad" }),
              /* @__PURE__ */ jsx(
                Input,
                {
                  id: "fullName",
                  placeholder: "Ahmet Yılmaz",
                  value: fullName,
                  onChange: (e) => setFullName(e.target.value),
                  disabled: saving
                }
              )
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsx(Label, { htmlFor: "email", children: "E-posta" }),
              /* @__PURE__ */ jsx(
                Input,
                {
                  id: "email",
                  type: "email",
                  value: (user == null ? void 0 : user.email) || "",
                  disabled: true
                }
              ),
              /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: "E-posta değiştirilemez" })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsx(Label, { htmlFor: "role", children: "Rol" }),
              /* @__PURE__ */ jsx(
                Input,
                {
                  id: "role",
                  value: (profile == null ? void 0 : profile.role) || "owner",
                  disabled: true
                }
              ),
              /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: "Rolünüzü değiştirmek için yöneticiyle iletişime geçin" })
            ] }),
            /* @__PURE__ */ jsx(Button, { onClick: handleSaveProfile, disabled: saving, children: saving ? "Kaydediliyor..." : "Değişiklikleri Kaydet" })
          ] })
        ] }),
        /* @__PURE__ */ jsx(PasswordChangeCard, {}),
        /* @__PURE__ */ jsx(DeleteAccountCard, {})
      ] }),
      /* @__PURE__ */ jsx(TabsContent, { value: "business", className: "space-y-6", children: /* @__PURE__ */ jsxs(Card, { className: "shadow-card", children: [
        /* @__PURE__ */ jsxs(CardHeader, { children: [
          /* @__PURE__ */ jsx(CardTitle, { children: "İşletme Bilgileri" }),
          /* @__PURE__ */ jsx(CardDescription, { children: "İşletme bilgilerinizi yönetin" })
        ] }),
        /* @__PURE__ */ jsxs(CardContent, { className: "space-y-4", children: [
          /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsx(Label, { htmlFor: "businessName", children: "İşletme Adı" }),
            /* @__PURE__ */ jsx(Input, { id: "businessName", placeholder: "İşletmem" })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsx(Label, { htmlFor: "placeId", children: "Google Place ID" }),
            /* @__PURE__ */ jsx(Input, { id: "placeId", placeholder: "ChIJ..." })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsx(Label, { htmlFor: "bookingHotelId", children: "Booking.com Otel ID" }),
            /* @__PURE__ */ jsx(Input, { id: "bookingHotelId", placeholder: "us/hotel-name" }),
            /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: `Booking.com URL'sindeki otel yolunu girin. Örn: "tr/hotel-sultanahmet-palace"` })
          ] }),
          /* @__PURE__ */ jsx(Button, { children: "Değişiklikleri Kaydet" })
        ] })
      ] }) }),
      /* @__PURE__ */ jsx(TabsContent, { value: "google", className: "space-y-6", children: /* @__PURE__ */ jsxs(Card, { className: "shadow-card", children: [
        /* @__PURE__ */ jsxs(CardHeader, { children: [
          /* @__PURE__ */ jsx(CardTitle, { children: "Google Business Entegrasyonu" }),
          /* @__PURE__ */ jsx(CardDescription, { children: "Google Business Profilinize bağlanın" })
        ] }),
        /* @__PURE__ */ jsxs(CardContent, { className: "space-y-6", children: [
          /* @__PURE__ */ jsxs("div", { className: "p-4 rounded-lg border border-border bg-muted/30", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-3", children: [
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("p", { className: "font-medium text-foreground", children: "Bağlantı Durumu" }),
                /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground mt-1", children: "Google Business hesap durumunuz" })
              ] }),
              /* @__PURE__ */ jsx(Badge, { variant: "secondary", children: "Bağlı Değil" })
            ] }),
            /* @__PURE__ */ jsx(
              Button,
              {
                className: "w-full",
                onClick: handleGoogleConnect,
                disabled: googleConnecting,
                children: googleConnecting ? /* @__PURE__ */ jsxs(Fragment, { children: [
                  /* @__PURE__ */ jsx(Loader2, { className: "mr-2 h-4 w-4 animate-spin" }),
                  "Bağlanıyor..."
                ] }) : "Google Business'a Bağlan"
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between p-3 rounded-lg bg-muted/10", children: [
              /* @__PURE__ */ jsx("span", { className: "text-sm text-muted-foreground", children: "Hesap" }),
              /* @__PURE__ */ jsx("span", { className: "text-sm font-medium", children: "-" })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between p-3 rounded-lg bg-muted/10", children: [
              /* @__PURE__ */ jsx("span", { className: "text-sm text-muted-foreground", children: "Konum ID" }),
              /* @__PURE__ */ jsx("span", { className: "text-sm font-medium", children: "-" })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between p-3 rounded-lg bg-muted/10", children: [
              /* @__PURE__ */ jsx("span", { className: "text-sm text-muted-foreground", children: "Son Senkronizasyon" }),
              /* @__PURE__ */ jsx("span", { className: "text-sm font-medium", children: "Hiçbir zaman" })
            ] })
          ] })
        ] })
      ] }) }),
      /* @__PURE__ */ jsx(TabsContent, { value: "auto-reply", className: "space-y-6", children: /* @__PURE__ */ jsxs(Card, { className: "shadow-card", children: [
        /* @__PURE__ */ jsxs(CardHeader, { children: [
          /* @__PURE__ */ jsx(CardTitle, { children: "Otomatik Yanıt Ayarları" }),
          /* @__PURE__ */ jsx(CardDescription, { children: "Otomatik yanıtları yapılandırın" })
        ] }),
        /* @__PURE__ */ jsx(CardContent, { children: /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: "Otomatik yanıt ayarlarını Otomatik Yanıt sayfasından yapılandırın." }) })
      ] }) }),
      /* @__PURE__ */ jsxs(TabsContent, { value: "notifications", className: "space-y-6", children: [
        /* @__PURE__ */ jsxs(Card, { className: "shadow-card", children: [
          /* @__PURE__ */ jsxs(CardHeader, { children: [
            /* @__PURE__ */ jsxs(CardTitle, { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsx(Bell, { className: "h-5 w-5" }),
              "Yorum Bildirimleri"
            ] }),
            /* @__PURE__ */ jsxs(CardDescription, { children: [
              "Yeni yorumlar geldiğinde nasıl bildirim almak istediğinizi seçin.",
              activeBusiness && /* @__PURE__ */ jsxs("span", { className: "block mt-1 font-medium text-foreground", children: [
                "İşletme: ",
                activeBusiness.name
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxs(CardContent, { children: [
            /* @__PURE__ */ jsx("div", { className: "space-y-3", children: notificationOptions.map((option) => {
              const Icon = option.icon;
              const isSelected = notificationType === option.value;
              return /* @__PURE__ */ jsxs(
                "button",
                {
                  onClick: () => handleSaveNotification(option.value),
                  disabled: savingNotification,
                  className: `w-full flex items-start gap-4 p-4 rounded-lg border-2 transition-all text-left ${isSelected ? "border-primary bg-primary/5" : "border-border hover:border-primary/40 hover:bg-muted/30"}`,
                  children: [
                    /* @__PURE__ */ jsx("div", { className: `p-2 rounded-lg ${isSelected ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`, children: /* @__PURE__ */ jsx(Icon, { className: "h-5 w-5" }) }),
                    /* @__PURE__ */ jsxs("div", { className: "flex-1", children: [
                      /* @__PURE__ */ jsx("p", { className: `font-medium ${isSelected ? "text-primary" : "text-foreground"}`, children: option.label }),
                      /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground mt-0.5", children: option.description })
                    ] }),
                    isSelected && /* @__PURE__ */ jsx(Badge, { variant: "default", className: "mt-1", children: "Aktif" })
                  ]
                },
                option.value
              );
            }) }),
            /* @__PURE__ */ jsx("div", { className: "mt-6 p-4 rounded-lg bg-muted/30 border border-border", children: /* @__PURE__ */ jsxs("p", { className: "text-sm text-muted-foreground", children: [
              /* @__PURE__ */ jsx("strong", { children: "Bildirimler nasıl çalışır?" }),
              " Yeni yorumlar çekildiğinde, tercihlerinize göre kayıtlı e-posta adresinize (",
              user == null ? void 0 : user.email,
              ") bildirim gönderilir. E-postada yorum detayı ve AI tarafından önerilen yanıt yer alır."
            ] }) })
          ] })
        ] }),
        /* @__PURE__ */ jsx(WeeklyReportCard, {}),
        /* @__PURE__ */ jsx(BrowserPushCard, {})
      ] })
    ] })
  ] });
}
function WeeklyReportCard() {
  const { user } = useAuth();
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);
  const [sending, setSending] = useState(false);
  const load = async () => {
    if (!user) return;
    const { data } = await supabase.from("businesses").select("id, name, weekly_report_enabled").eq("user_id", user.id).order("name");
    setBusinesses(data || []);
    setLoading(false);
  };
  useEffect(() => {
    load();
  }, [user]);
  const toggle = async (id, value) => {
    setSavingId(id);
    setBusinesses((prev) => prev.map((b) => b.id === id ? { ...b, weekly_report_enabled: value } : b));
    const { error } = await supabase.from("businesses").update({ weekly_report_enabled: value }).eq("id", id);
    setSavingId(null);
    if (error) {
      toast({ title: "Hata", description: "Güncellenemedi.", variant: "destructive" });
      load();
    }
  };
  const toggleAll = async (value) => {
    if (!user) return;
    setBusinesses((prev) => prev.map((b) => ({ ...b, weekly_report_enabled: value })));
    await supabase.from("businesses").update({ weekly_report_enabled: value }).eq("user_id", user.id);
    toast({ title: value ? "Tüm raporlar açıldı" : "Tüm raporlar kapatıldı" });
  };
  const sendNow = async () => {
    setSending(true);
    try {
      const { error } = await supabase.functions.invoke("weekly-report", { body: {} });
      if (error) throw error;
      toast({ title: "Rapor gönderildi", description: `${user == null ? void 0 : user.email} adresine birazdan ulaşacak.` });
    } catch (e) {
      toast({ title: "Hata", description: e.message || "Rapor gönderilemedi", variant: "destructive" });
    } finally {
      setSending(false);
    }
  };
  const allOn = businesses.length > 0 && businesses.every((b) => b.weekly_report_enabled);
  return /* @__PURE__ */ jsxs(Card, { className: "shadow-card", children: [
    /* @__PURE__ */ jsxs(CardHeader, { children: [
      /* @__PURE__ */ jsxs(CardTitle, { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsx(Mail, { className: "h-5 w-5" }),
        "Haftalık E-posta Raporu"
      ] }),
      /* @__PURE__ */ jsxs(CardDescription, { children: [
        "Her Pazartesi sabah 11:00'de seçili işletmelerinin haftalık özetini ",
        user == null ? void 0 : user.email,
        " adresine gönderiyoruz."
      ] })
    ] }),
    /* @__PURE__ */ jsxs(CardContent, { className: "space-y-4", children: [
      /* @__PURE__ */ jsx("div", { className: "flex items-center justify-between p-4 rounded-lg border bg-muted/30 gap-3 flex-wrap", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 flex-wrap", children: [
        /* @__PURE__ */ jsxs(Button, { onClick: sendNow, disabled: sending, size: "sm", children: [
          sending ? /* @__PURE__ */ jsx(Loader2, { className: "h-4 w-4 mr-2 animate-spin" }) : /* @__PURE__ */ jsx(Send, { className: "h-4 w-4 mr-2" }),
          "Şimdi Raporu Gönder"
        ] }),
        businesses.length > 1 && /* @__PURE__ */ jsx(Button, { variant: "outline", size: "sm", onClick: () => toggleAll(!allOn), children: allOn ? "Hepsini kapat" : "Hepsini aç" })
      ] }) }),
      loading ? /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-sm text-muted-foreground", children: [
        /* @__PURE__ */ jsx(Loader2, { className: "h-4 w-4 animate-spin" }),
        " Yükleniyor..."
      ] }) : businesses.length === 0 ? /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: "Henüz işletme yok." }) : /* @__PURE__ */ jsx("div", { className: "space-y-2", children: businesses.map((b) => /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between p-3 rounded-lg border", children: [
        /* @__PURE__ */ jsx("span", { className: "text-sm font-medium truncate pr-3", children: b.name }),
        /* @__PURE__ */ jsx(
          Switch,
          {
            checked: b.weekly_report_enabled,
            disabled: savingId === b.id,
            onCheckedChange: (v) => toggle(b.id, v)
          }
        )
      ] }, b.id)) })
    ] })
  ] });
}
function DeleteAccountCard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [deleting, setDeleting] = useState(false);
  const canDelete = !!(user == null ? void 0 : user.email) && confirmText.trim().toLowerCase() === user.email.toLowerCase();
  const handleDelete = async () => {
    if (!canDelete) return;
    setDeleting(true);
    try {
      await invokeAuthedFunction("delete-account", {
        body: { confirmation: confirmText.trim() }
      });
      await supabase.auth.signOut();
      toast({
        title: "Hesabın silindi",
        description: "Tüm verilerin kalıcı olarak kaldırıldı."
      });
      navigate("/login");
    } catch (e) {
      toast({
        title: "Hata",
        description: e.message || "Hesap silinemedi.",
        variant: "destructive"
      });
    } finally {
      setDeleting(false);
    }
  };
  return /* @__PURE__ */ jsxs(Card, { className: "shadow-card border-destructive/40", children: [
    /* @__PURE__ */ jsxs(CardHeader, { children: [
      /* @__PURE__ */ jsxs(CardTitle, { className: "flex items-center gap-2 text-destructive", children: [
        /* @__PURE__ */ jsx(AlertTriangle, { className: "h-5 w-5" }),
        "Hesabımı Sil"
      ] }),
      /* @__PURE__ */ jsx(CardDescription, { children: "Hesabını ve tüm verilerini kalıcı olarak siler. Bu işlem geri alınamaz." })
    ] }),
    /* @__PURE__ */ jsxs(CardContent, { className: "space-y-4", children: [
      /* @__PURE__ */ jsxs("div", { className: "text-sm text-muted-foreground space-y-2 rounded-lg border border-destructive/30 bg-destructive/5 p-4", children: [
        /* @__PURE__ */ jsx("p", { className: "font-medium text-foreground", children: "Silindiğinde aşağıdakiler de kalıcı olarak silinir:" }),
        /* @__PURE__ */ jsxs("ul", { className: "list-disc list-inside space-y-1", children: [
          /* @__PURE__ */ jsx("li", { children: "Tüm işletmelerin ve lokasyonların" }),
          /* @__PURE__ */ jsx("li", { children: "Tüm yorumların (Google, Booking, TripAdvisor, Trustpilot, Hotels.com vb.)" }),
          /* @__PURE__ */ jsx("li", { children: "AI yanıtların, yanıt geçmişin ve tonların" }),
          /* @__PURE__ */ jsx("li", { children: "Bağlı Google / TikTok / YouTube hesapları ve token'ların" }),
          /* @__PURE__ */ jsx("li", { children: "E-posta listen, kampanyaların ve gönderim geçmişin" }),
          /* @__PURE__ */ jsx("li", { children: "Sohbet geçmişin, raporların ve rakip analizlerin" }),
          /* @__PURE__ */ jsx("li", { children: "Profil bilgilerin ve giriş hesabın" })
        ] }),
        /* @__PURE__ */ jsx("p", { className: "text-xs pt-2", children: 'Sadece bağlantıyı kesmek istiyorsan, "Google Hesapları" sayfasından "Bağlantıyı Kes"i kullan — yorumların kalır.' })
      ] }),
      /* @__PURE__ */ jsx(Button, { variant: "destructive", onClick: () => setOpen(true), children: "Hesabımı Kalıcı Olarak Sil" })
    ] }),
    /* @__PURE__ */ jsx(AlertDialog, { open, onOpenChange: (o) => {
      setOpen(o);
      if (!o) setConfirmText("");
    }, children: /* @__PURE__ */ jsxs(AlertDialogContent, { children: [
      /* @__PURE__ */ jsxs(AlertDialogHeader, { children: [
        /* @__PURE__ */ jsx(AlertDialogTitle, { className: "text-destructive", children: "Son onay" }),
        /* @__PURE__ */ jsx(AlertDialogDescription, { asChild: true, children: /* @__PURE__ */ jsxs("div", { className: "space-y-3 text-sm", children: [
          /* @__PURE__ */ jsxs("p", { children: [
            "Bu işlem ",
            /* @__PURE__ */ jsx("strong", { className: "text-foreground", children: "geri alınamaz" }),
            ". Hesabın, tüm işletmelerin, yorumların, raporların ve bağlı entegrasyonların kalıcı olarak silinir."
          ] }),
          /* @__PURE__ */ jsxs("p", { children: [
            "Onaylamak için e-posta adresini yaz:",
            " ",
            /* @__PURE__ */ jsx("code", { className: "px-1.5 py-0.5 rounded bg-muted text-foreground font-mono text-xs", children: user == null ? void 0 : user.email })
          ] }),
          /* @__PURE__ */ jsx(
            Input,
            {
              value: confirmText,
              onChange: (e) => setConfirmText(e.target.value),
              placeholder: (user == null ? void 0 : user.email) || "",
              autoComplete: "off",
              disabled: deleting
            }
          )
        ] }) })
      ] }),
      /* @__PURE__ */ jsxs(AlertDialogFooter, { children: [
        /* @__PURE__ */ jsx(AlertDialogCancel, { disabled: deleting, children: "Vazgeç" }),
        /* @__PURE__ */ jsx(
          AlertDialogAction,
          {
            disabled: !canDelete || deleting,
            className: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
            onClick: (e) => {
              e.preventDefault();
              handleDelete();
            },
            children: deleting ? /* @__PURE__ */ jsxs(Fragment, { children: [
              /* @__PURE__ */ jsx(Loader2, { className: "mr-2 h-4 w-4 animate-spin" }),
              "Siliniyor..."
            ] }) : "Evet, hesabımı sil"
          }
        )
      ] })
    ] }) })
  ] });
}
function BrowserPushCard() {
  const { pushPermission, requestPushPermission } = useNewReviews();
  const status = pushPermission === "granted" ? { label: "Aktif", variant: "default", description: "Yeni yorum geldiğinde tarayıcı bildirimi alacaksın." } : pushPermission === "denied" ? { label: "Reddedildi", variant: "destructive", description: "Tarayıcı ayarlarından bu site için bildirimleri tekrar etkinleştirmen gerekiyor." } : pushPermission === "unsupported" ? { label: "Desteklenmiyor", variant: "secondary", description: "Tarayıcın bildirim API'sini desteklemiyor." } : { label: "Pasif", variant: "secondary", description: "Tarayıcı bildirimlerini etkinleştir, sekmen kapalıyken bile yeni yorumdan haberdar ol." };
  return /* @__PURE__ */ jsxs(Card, { className: "shadow-card", children: [
    /* @__PURE__ */ jsxs(CardHeader, { children: [
      /* @__PURE__ */ jsxs(CardTitle, { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsx(BellRing, { className: "h-5 w-5" }),
        "Tarayıcı Bildirimleri"
      ] }),
      /* @__PURE__ */ jsx(CardDescription, { children: "Sekmen açık değilken bile yeni yorum geldiğinde anlık tarayıcı bildirimi al." })
    ] }),
    /* @__PURE__ */ jsx(CardContent, { className: "space-y-4", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between p-4 rounded-lg border bg-muted/30", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex-1", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mb-1", children: [
          /* @__PURE__ */ jsx("span", { className: "font-medium text-sm", children: "Durum:" }),
          /* @__PURE__ */ jsx(Badge, { variant: status.variant, children: status.label })
        ] }),
        /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: status.description })
      ] }),
      pushPermission === "default" && /* @__PURE__ */ jsx(Button, { onClick: requestPushPermission, size: "sm", className: "ml-4", children: "Etkinleştir" })
    ] }) })
  ] });
}
export {
  Settings as default
};
