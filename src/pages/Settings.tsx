import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Loader2, LogOut, Bell, BellOff, BellRing, AlertTriangle, Mail, Send } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useBusiness } from "@/contexts/BusinessContext";
import { useNewReviews } from "@/contexts/NewReviewsContext";
import { useState, useEffect } from "react";
import { PasswordChangeCard } from "@/components/settings/PasswordChangeCard";
import { BrandVoiceCard } from "@/components/settings/BrandVoiceCard";
import { WhatsAppRecipientsCard } from "@/components/settings/WhatsAppRecipientsCard";
import { invokeAuthedFunction } from "@/lib/invokeAuthedFunction";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type NotificationType = "instant" | "negative_only" | "none";

const notificationOptions: { value: NotificationType; label: string; description: string; icon: any }[] = [
  {
    value: "instant",
    label: "Tüm Yorumlar",
    description: "Her yeni yorum geldiğinde e-posta bildirimi alın",
    icon: BellRing,
  },
  {
    value: "negative_only",
    label: "Sadece Olumsuz",
    description: "Yalnızca 1-3 yıldızlı yorumlarda bildirim alın",
    icon: AlertTriangle,
  },
  {
    value: "none",
    label: "Kapalı",
    description: "E-posta bildirimi almayın",
    icon: BellOff,
  },
];

export default function Settings() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, profile, refreshProfile } = useAuth();
  const { activeBusiness } = useBusiness();
  const [fullName, setFullName] = useState('');
  const [saving, setSaving] = useState(false);
  const [googleConnecting, setGoogleConnecting] = useState(false);
  const [notificationType, setNotificationType] = useState<NotificationType>("instant");
  const [savingNotification, setSavingNotification] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name);
    }
  }, [profile]);

  // Load notification preference from active business
  useEffect(() => {
    if (activeBusiness) {
      // Cast to access the new column (types may not be updated yet)
      const biz = activeBusiness as any;
      setNotificationType(biz.review_notification_type || "instant");
    }
  }, [activeBusiness]);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "Çıkış Yapıldı",
        description: "Başarıyla çıkış yaptınız.",
      });
      navigate('/login');
    } catch (error) {
      toast({
        title: "Hata",
        description: "Çıkış yapılırken bir hata oluştu.",
        variant: "destructive",
      });
    }
  };

  const handleSaveProfile = async () => {
    if (!user || !profile) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ full_name: fullName })
        .eq('user_id', user.id);

      if (error) throw error;

      await refreshProfile();

      toast({
        title: "Başarılı",
        description: "Profil bilgileriniz güncellendi.",
      });
    } catch (error) {
      toast({
        title: "Hata",
        description: "Profil güncellenirken bir hata oluştu.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSaveNotification = async (type: NotificationType) => {
    if (!activeBusiness) return;

    setSavingNotification(true);
    setNotificationType(type);

    try {
      const { error } = await supabase
        .from('businesses')
        .update({ review_notification_type: type } as any)
        .eq('id', activeBusiness.id);

      if (error) throw error;

      toast({
        title: "Başarılı",
        description: "Bildirim tercihiniz güncellendi.",
      });
    } catch (error) {
      toast({
        title: "Hata",
        description: "Bildirim tercihi güncellenirken bir hata oluştu.",
        variant: "destructive",
      });
    } finally {
      setSavingNotification(false);
    }
  };

  const handleGoogleConnect = async () => {
    setGoogleConnecting(true);

    try {
      const response = await invokeAuthedFunction<{ authUrl?: string }>('google-business-auth', {
        body: { action: 'initiate' },
      });

      if (!response?.authUrl) {
        throw new Error("Google bağlantı adresi alınamadı");
      }

      window.location.href = response.authUrl;
    } catch (error: any) {
      toast({
        title: "Bağlantı Hatası",
        description: error.message || "Google Business bağlantısı başlatılamadı.",
        variant: "destructive",
      });
    } finally {
      setGoogleConnecting(false);
    }
  };

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-foreground mb-2">Ayarlar</h1>
          <p className="text-muted-foreground">Hesabınızı ve tercihlerinizi yönetin</p>
          {profile && (
            <Badge variant="secondary" className="mt-2">
              Rol: {profile.role}
            </Badge>
          )}
        </div>
        <Button variant="outline" onClick={() => setShowLogoutDialog(true)}>
          <LogOut className="mr-2 h-4 w-4" />
          Çıkış Yap
        </Button>

        <AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Çıkış yapmak istediğinize emin misiniz?</AlertDialogTitle>
              <AlertDialogDescription>
                Oturumunuz sonlandırılacak ve giriş sayfasına yönlendirileceksiniz.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>İptal</AlertDialogCancel>
              <AlertDialogAction
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                onClick={handleLogout}
              >
                Evet, Çıkış Yap
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      <Tabs defaultValue={searchParams.get('tab') || 'profile'} className="space-y-6">
        <TabsList className="bg-muted/30">
          <TabsTrigger value="profile">Profil</TabsTrigger>
          <TabsTrigger value="business">İşletme Bilgileri</TabsTrigger>
          <TabsTrigger value="google">Google Entegrasyonu</TabsTrigger>
          
          <TabsTrigger value="brand-voice">Marka Sesi</TabsTrigger>
          <TabsTrigger value="notifications">Bildirimler</TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-6">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Profil Bilgileri</CardTitle>
              <CardDescription>Kişisel bilgilerinizi güncelleyin</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Tam Ad</Label>
                <Input
                  id="fullName"
                  placeholder="Ahmet Yılmaz"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  disabled={saving}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">E-posta</Label>
                <Input
                  id="email"
                  type="email"
                  value={user?.email || ''}
                  disabled
                />
                <p className="text-xs text-muted-foreground">E-posta değiştirilemez</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Rol</Label>
                <Input
                  id="role"
                  value={profile?.role || 'owner'}
                  disabled
                />
                <p className="text-xs text-muted-foreground">Rolünüzü değiştirmek için yöneticiyle iletişime geçin</p>
              </div>
              <Button onClick={handleSaveProfile} disabled={saving}>
                {saving ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
              </Button>
            </CardContent>
          </Card>

          <PasswordChangeCard />
          <DeleteAccountCard />
        </TabsContent>

        {/* Business Info Tab */}
        <TabsContent value="business" className="space-y-6">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>İşletme Bilgileri</CardTitle>
              <CardDescription>İşletme bilgilerinizi yönetin</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="businessName">İşletme Adı</Label>
                <Input id="businessName" placeholder="İşletmem" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="placeId">Google Place ID</Label>
                <Input id="placeId" placeholder="ChIJ..." />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bookingHotelId">Booking.com Otel ID</Label>
                <Input id="bookingHotelId" placeholder="us/hotel-name" />
                <p className="text-xs text-muted-foreground">
                  Booking.com URL'sindeki otel yolunu girin. Örn: "tr/hotel-sultanahmet-palace"
                </p>
              </div>
              <Button>Değişiklikleri Kaydet</Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Google Integration Tab */}
        <TabsContent value="google" className="space-y-6">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Google Business Entegrasyonu</CardTitle>
              <CardDescription>Google Business Profilinize bağlanın</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="p-4 rounded-lg border border-border bg-muted/30">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="font-medium text-foreground">Bağlantı Durumu</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Google Business hesap durumunuz
                    </p>
                  </div>
                  <Badge variant="secondary">Bağlı Değil</Badge>
                </div>
                <Button
                  className="w-full"
                  onClick={handleGoogleConnect}
                  disabled={googleConnecting}
                >
                  {googleConnecting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Bağlanıyor...
                    </>
                  ) : (
                    "Google Business'a Bağlan"
                  )}
                </Button>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/10">
                  <span className="text-sm text-muted-foreground">Hesap</span>
                  <span className="text-sm font-medium">-</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/10">
                  <span className="text-sm text-muted-foreground">Konum ID</span>
                  <span className="text-sm font-medium">-</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/10">
                  <span className="text-sm text-muted-foreground">Son Senkronizasyon</span>
                  <span className="text-sm font-medium">Hiçbir zaman</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Brand Voice Tab */}
        <TabsContent value="brand-voice" className="space-y-6">
          <BrandVoiceCard />
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-6">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Yorum Bildirimleri
              </CardTitle>
              <CardDescription>
                Yeni yorumlar geldiğinde nasıl bildirim almak istediğinizi seçin.
                {activeBusiness && (
                  <span className="block mt-1 font-medium text-foreground">
                    İşletme: {activeBusiness.name}
                  </span>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {notificationOptions.map((option) => {
                  const Icon = option.icon;
                  const isSelected = notificationType === option.value;

                  return (
                    <button
                      key={option.value}
                      onClick={() => handleSaveNotification(option.value)}
                      disabled={savingNotification}
                      className={`w-full flex items-start gap-4 p-4 rounded-lg border-2 transition-all text-left ${
                        isSelected
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/40 hover:bg-muted/30"
                      }`}
                    >
                      <div className={`p-2 rounded-lg ${isSelected ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <p className={`font-medium ${isSelected ? "text-primary" : "text-foreground"}`}>
                          {option.label}
                        </p>
                        <p className="text-sm text-muted-foreground mt-0.5">
                          {option.description}
                        </p>
                      </div>
                      {isSelected && (
                        <Badge variant="default" className="mt-1">Aktif</Badge>
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="mt-6 p-4 rounded-lg bg-muted/30 border border-border">
                <p className="text-sm text-muted-foreground">
                  <strong>Bildirimler nasıl çalışır?</strong> Yeni yorumlar çekildiğinde, tercihlerinize göre kayıtlı e-posta adresinize ({user?.email}) bildirim gönderilir. E-postada yorum detayı ve AI tarafından önerilen yanıt yer alır.
                </p>
              </div>
            </CardContent>
          </Card>

          <WhatsAppRecipientsCard />

          <WeeklyReportCard />
          <BrowserPushCard />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function WeeklyReportCard() {
  const { user } = useAuth();
  const [businesses, setBusinesses] = useState<{ id: string; name: string; weekly_report_enabled: boolean }[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  const load = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('businesses')
      .select('id, name, weekly_report_enabled')
      .eq('user_id', user.id)
      .order('name');
    setBusinesses(data || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, [user]);

  const toggle = async (id: string, value: boolean) => {
    setSavingId(id);
    setBusinesses(prev => prev.map(b => b.id === id ? { ...b, weekly_report_enabled: value } : b));
    const { error } = await supabase.from('businesses').update({ weekly_report_enabled: value }).eq('id', id);
    setSavingId(null);
    if (error) {
      toast({ title: "Hata", description: "Güncellenemedi.", variant: "destructive" });
      load();
    }
  };

  const toggleAll = async (value: boolean) => {
    if (!user) return;
    setBusinesses(prev => prev.map(b => ({ ...b, weekly_report_enabled: value })));
    await supabase.from('businesses').update({ weekly_report_enabled: value }).eq('user_id', user.id);
    toast({ title: value ? "Tüm raporlar açıldı" : "Tüm raporlar kapatıldı" });
  };

  const sendNow = async () => {
    setSending(true);
    try {
      const { error } = await supabase.functions.invoke('weekly-report', { body: {} });
      if (error) throw error;
      toast({ title: "Rapor gönderildi", description: `${user?.email} adresine birazdan ulaşacak.` });
    } catch (e: any) {
      toast({ title: "Hata", description: e.message || "Rapor gönderilemedi", variant: "destructive" });
    } finally {
      setSending(false);
    }
  };

  const allOn = businesses.length > 0 && businesses.every(b => b.weekly_report_enabled);

  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-5 w-5" />
          Haftalık E-posta Raporu
        </CardTitle>
        <CardDescription>
          Her Pazartesi sabah 11:00'de seçili işletmelerinin haftalık özetini {user?.email} adresine gönderiyoruz.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between p-4 rounded-lg border bg-muted/30 gap-3 flex-wrap">
          <div className="flex items-center gap-3 flex-wrap">
            <Button onClick={sendNow} disabled={sending} size="sm">
              {sending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Send className="h-4 w-4 mr-2" />}
              Şimdi Raporu Gönder
            </Button>
            {businesses.length > 1 && (
              <Button variant="outline" size="sm" onClick={() => toggleAll(!allOn)}>
                {allOn ? "Hepsini kapat" : "Hepsini aç"}
              </Button>
            )}
          </div>
        </div>

        {loading ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> Yükleniyor...</div>
        ) : businesses.length === 0 ? (
          <p className="text-sm text-muted-foreground">Henüz işletme yok.</p>
        ) : (
          <div className="space-y-2">
            {businesses.map((b) => (
              <div key={b.id} className="flex items-center justify-between p-3 rounded-lg border">
                <span className="text-sm font-medium truncate pr-3">{b.name}</span>
                <Switch
                  checked={b.weekly_report_enabled}
                  disabled={savingId === b.id}
                  onCheckedChange={(v) => toggle(b.id, v)}
                />
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function DeleteAccountCard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [deleting, setDeleting] = useState(false);

  const canDelete =
    !!user?.email && confirmText.trim().toLowerCase() === user.email.toLowerCase();

  const handleDelete = async () => {
    if (!canDelete) return;
    setDeleting(true);
    try {
      await invokeAuthedFunction("delete-account", {
        body: { confirmation: confirmText.trim() },
      });
      await supabase.auth.signOut();
      toast({
        title: "Hesabın silindi",
        description: "Tüm verilerin kalıcı olarak kaldırıldı.",
      });
      navigate("/login");
    } catch (e: any) {
      toast({
        title: "Hata",
        description: e.message || "Hesap silinemedi.",
        variant: "destructive",
      });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Card className="shadow-card border-destructive/40">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-destructive">
          <AlertTriangle className="h-5 w-5" />
          Hesabımı Sil
        </CardTitle>
        <CardDescription>
          Hesabını ve tüm verilerini kalıcı olarak siler. Bu işlem geri alınamaz.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-muted-foreground space-y-2 rounded-lg border border-destructive/30 bg-destructive/5 p-4">
          <p className="font-medium text-foreground">Silindiğinde aşağıdakiler de kalıcı olarak silinir:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Tüm işletmelerin ve lokasyonların</li>
            <li>Tüm yorumların (Google, Booking, TripAdvisor, Trustpilot, Hotels.com vb.)</li>
            <li>AI yanıtların, yanıt geçmişin ve tonların</li>
            <li>Bağlı Google / TikTok / YouTube hesapları ve token'ların</li>
            <li>E-posta listen, kampanyaların ve gönderim geçmişin</li>
            <li>Sohbet geçmişin, raporların ve rakip analizlerin</li>
            <li>Profil bilgilerin ve giriş hesabın</li>
          </ul>
          <p className="text-xs pt-2">
            Sadece bağlantıyı kesmek istiyorsan, "Google Hesapları" sayfasından
            "Bağlantıyı Kes"i kullan — yorumların kalır.
          </p>
        </div>
        <Button variant="destructive" onClick={() => setOpen(true)}>
          Hesabımı Kalıcı Olarak Sil
        </Button>
      </CardContent>

      <AlertDialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) setConfirmText(""); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-destructive">Son onay</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-3 text-sm">
                <p>
                  Bu işlem <strong className="text-foreground">geri alınamaz</strong>. Hesabın,
                  tüm işletmelerin, yorumların, raporların ve bağlı entegrasyonların kalıcı
                  olarak silinir.
                </p>
                <p>
                  Onaylamak için e-posta adresini yaz:{" "}
                  <code className="px-1.5 py-0.5 rounded bg-muted text-foreground font-mono text-xs">
                    {user?.email}
                  </code>
                </p>
                <Input
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  placeholder={user?.email || ""}
                  autoComplete="off"
                  disabled={deleting}
                />
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Vazgeç</AlertDialogCancel>
            <AlertDialogAction
              disabled={!canDelete || deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={(e) => { e.preventDefault(); handleDelete(); }}
            >
              {deleting ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Siliniyor...</>
              ) : (
                "Evet, hesabımı sil"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}

function BrowserPushCard() {
  const { pushPermission, requestPushPermission } = useNewReviews();

  const status =
    pushPermission === "granted"
      ? { label: "Aktif", variant: "default" as const, description: "Yeni yorum geldiğinde tarayıcı bildirimi alacaksın." }
      : pushPermission === "denied"
      ? { label: "Reddedildi", variant: "destructive" as const, description: "Tarayıcı ayarlarından bu site için bildirimleri tekrar etkinleştirmen gerekiyor." }
      : pushPermission === "unsupported"
      ? { label: "Desteklenmiyor", variant: "secondary" as const, description: "Tarayıcın bildirim API'sini desteklemiyor." }
      : { label: "Pasif", variant: "secondary" as const, description: "Tarayıcı bildirimlerini etkinleştir, sekmen kapalıyken bile yeni yorumdan haberdar ol." };

  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BellRing className="h-5 w-5" />
          Tarayıcı Bildirimleri
        </CardTitle>
        <CardDescription>
          Sekmen açık değilken bile yeni yorum geldiğinde anlık tarayıcı bildirimi al.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between p-4 rounded-lg border bg-muted/30">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-medium text-sm">Durum:</span>
              <Badge variant={status.variant}>{status.label}</Badge>
            </div>
            <p className="text-sm text-muted-foreground">{status.description}</p>
          </div>
          {pushPermission === "default" && (
            <Button onClick={requestPushPermission} size="sm" className="ml-4">
              Etkinleştir
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
