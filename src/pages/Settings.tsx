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
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        throw new Error("Lütfen önce giriş yapın");
      }

      const response = await supabase.functions.invoke('google-business-auth', {
        body: { action: 'initiate' },
      });

      if (response.error) throw response.error;

      if (!response.data?.authUrl) {
        throw new Error("Google bağlantı adresi alınamadı");
      }

      window.location.href = response.data.authUrl;
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
          <TabsTrigger value="auto-reply">Otomatik Yanıt</TabsTrigger>
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

        {/* Auto Reply Tab */}
        <TabsContent value="auto-reply" className="space-y-6">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Otomatik Yanıt Ayarları</CardTitle>
              <CardDescription>Otomatik yanıtları yapılandırın</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Otomatik yanıt ayarlarını Otomatik Yanıt sayfasından yapılandırın.
              </p>
            </CardContent>
          </Card>
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

          <WeeklyReportCard />
          <BrowserPushCard />
        </TabsContent>
      </Tabs>
    </div>
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
