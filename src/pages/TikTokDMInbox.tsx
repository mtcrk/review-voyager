import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MessageSquare, Lock, ExternalLink } from "lucide-react";
import { useTikTokConnection } from "@/hooks/useTikTokConnection";
import { Link } from "react-router-dom";

export default function TikTokDMInbox() {
  const { connection, loading } = useTikTokConnection();

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </AppLayout>
    );
  }

  if (!connection) {
    return (
      <AppLayout>
        <div className="p-6 max-w-2xl mx-auto">
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">TikTok Bağlantısı Gerekli</h3>
              <p className="text-muted-foreground mb-4">
                DM Inbox özelliğini kullanmak için önce TikTok hesabınızı bağlamanız gerekiyor.
              </p>
              <Button asChild>
                <Link to="/channels/tiktok">TikTok'u Bağla</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="p-6 max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold mb-2 flex items-center gap-2">
            TikTok DM Inbox
            <Badge variant="secondary" className="text-xs">Yakında</Badge>
          </h1>
          <p className="text-muted-foreground">
            TikTok direkt mesajlarınızı yönetin
          </p>
        </div>

        <Card className="border-dashed">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Lock className="h-5 w-5 text-amber-500" />
              TikTok API Kısıtlaması
            </CardTitle>
            <CardDescription>
              DM özelliği şu an için kısıtlı
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
              <p className="text-sm text-amber-800 dark:text-amber-200">
                TikTok'un resmi API'si şu anda DM (Direkt Mesaj) erişimini desteklemiyor. 
                Bu özellik TikTok tarafından yalnızca belirli iş ortaklarına açılmıştır.
              </p>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium">Mevcut Alternatifler:</h4>
              <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                <li>Video yorumlarına AI destekli yanıt verebilirsiniz</li>
                <li>Yorum üzerinden müşterilerinizi yönlendirebilirsiniz</li>
                <li>TikTok Shop entegrasyonu ile satış yapabilirsiniz</li>
              </ul>
            </div>

            <div className="flex gap-3">
              <Button asChild variant="default">
                <Link to="/tiktok-inbox">
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Video Yorumlarına Git
                </Link>
              </Button>
              <Button asChild variant="outline">
                <a 
                  href="https://developers.tiktok.com/doc/login-kit-manage-user-access-tokens/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  TikTok API Dökümanları
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Placeholder for future DM feature */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Gelecek Özellikler</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="p-4 border rounded-lg bg-muted/30">
                <h4 className="font-medium mb-1">AI Destekli DM Yanıtları</h4>
                <p className="text-sm text-muted-foreground">
                  TikTok API'si açıldığında otomatik DM yanıtları
                </p>
              </div>
              <div className="p-4 border rounded-lg bg-muted/30">
                <h4 className="font-medium mb-1">Müşteri Segmentasyonu</h4>
                <p className="text-sm text-muted-foreground">
                  DM'lerinizi kategorilere ayırın ve önceliklendirin
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
