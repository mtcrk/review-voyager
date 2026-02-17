import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useState, useEffect } from "react";

export default function Settings() {
  const navigate = useNavigate();
  const { user, profile, refreshProfile } = useAuth();
  const [fullName, setFullName] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name);
    }
  }, [profile]);

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
        <Button variant="outline" onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          Çıkış Yap
        </Button>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
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
                <Button className="w-full">Google Business'a Bağlan</Button>
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
              <CardTitle>Bildirim Tercihleri</CardTitle>
              <CardDescription>Bildirimleri nasıl alacağınızı yönetin</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Bildirim ayarları yakında.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}