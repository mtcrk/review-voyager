import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useBusiness } from "@/contexts/BusinessContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { Loader2, Plus, Star, CheckCircle2, AlertCircle } from "lucide-react";

export default function GoogleAccounts() {
  const { businesses, loading } = useBusiness();
  const [connecting, setConnecting] = useState(false);

  const connectedBusinesses = businesses.filter((b) => b.google_connected);

  const handleConnect = async () => {
    setConnecting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Lütfen önce giriş yapın");

      const response = await supabase.functions.invoke("google-business-auth", {
        body: { action: "initiate" },
      });

      if (response.error) throw response.error;
      if (!response.data?.authUrl) throw new Error("Google bağlantı adresi alınamadı");

      window.location.href = response.data.authUrl;
    } catch (error: any) {
      toast({
        title: "Bağlantı Hatası",
        description: error.message || "Google Business bağlantısı başlatılamadı.",
        variant: "destructive",
      });
      setConnecting(false);
    }
  };

  return (
    <div className="p-8 space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-foreground mb-2">Google Hesapları</h1>
          <p className="text-muted-foreground">
            Birden fazla Google Business hesabı ve lokasyonu bağlayabilirsiniz
          </p>
        </div>
        <Button onClick={handleConnect} disabled={connecting}>
          {connecting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Yönlendiriliyor...
            </>
          ) : (
            <>
              <Plus className="mr-2 h-4 w-4" />
              Yeni Google Hesabı Bağla
            </>
          )}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-primary" />
            Bağlı Lokasyonlar
            <Badge variant="secondary" className="ml-2">
              {connectedBusinesses.length}
            </Badge>
          </CardTitle>
          <CardDescription>
            Her lokasyon ayrı bir işletme olarak listelenir. Farklı bir Google hesabıyla giriş
            yaparak ek lokasyonlar ekleyebilirsiniz.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : connectedBusinesses.length === 0 ? (
            <div className="text-center py-12 space-y-3">
              <AlertCircle className="h-10 w-10 text-muted-foreground mx-auto" />
              <p className="text-muted-foreground">
                Henüz bağlı bir Google işletmesi yok.
              </p>
              <Button onClick={handleConnect} disabled={connecting} variant="outline">
                <Plus className="mr-2 h-4 w-4" />
                İlk Hesabınızı Bağlayın
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              {connectedBusinesses.map((b) => (
                <div
                  key={b.id}
                  className="flex items-start justify-between gap-4 p-4 rounded-lg border bg-card hover:bg-accent/30 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" />
                      <p className="font-medium text-foreground truncate">{b.name}</p>
                    </div>
                    {b.city && (
                      <p className="text-sm text-muted-foreground mt-1 ml-6">{b.city}</p>
                    )}
                    {b.place_id && (
                      <p className="text-xs text-muted-foreground mt-1 ml-6 font-mono truncate">
                        Place ID: {b.place_id}
                      </p>
                    )}
                  </div>
                  <Badge variant="outline" className="shrink-0">
                    Bağlı
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="bg-muted/30">
        <CardContent className="pt-6 text-sm text-muted-foreground space-y-2">
          <p className="font-medium text-foreground">💡 Nasıl çalışır?</p>
          <ul className="list-disc list-inside space-y-1">
            <li>"Yeni Google Hesabı Bağla" ile farklı bir Google hesabıyla giriş yapın.</li>
            <li>Açılan ekranda eklemek istediğiniz lokasyonları seçin.</li>
            <li>Aynı hesaptan tekrar bağlanırsanız mükerrer kayıt oluşmaz.</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
