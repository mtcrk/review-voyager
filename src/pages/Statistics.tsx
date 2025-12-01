import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, TrendingUp } from "lucide-react";

export default function Statistics() {
  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-foreground mb-2">İstatistikler</h1>
        <p className="text-muted-foreground">Yorumlarınızdan analizler ve görüşler</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sentiment Trend */}
        <Card className="shadow-card">
          <CardHeader>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">Duygu Eğilimi</CardTitle>
            </div>
            <CardDescription>Zaman içinde yorum duyguları</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center border border-dashed border-border rounded-lg">
              <div className="text-center text-muted-foreground">
                <BarChart3 className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Grafik görselleştirme yakında</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Monthly Review Count */}
        <Card className="shadow-card">
          <CardHeader>
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">Aylık Yorumlar</CardTitle>
            </div>
            <CardDescription>Aylık yorum sayısı</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center border border-dashed border-border rounded-lg">
              <div className="text-center text-muted-foreground">
                <BarChart3 className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Grafik görselleştirme yakında</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Reply Rate */}
        <Card className="shadow-card">
          <CardHeader>
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">Yanıt Oranı</CardTitle>
            </div>
            <CardDescription>Zaman içinde yanıt oranı</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center border border-dashed border-border rounded-lg">
              <div className="text-center text-muted-foreground">
                <BarChart3 className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Grafik görselleştirme yakında</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Word Cloud */}
        <Card className="shadow-card">
          <CardHeader>
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">Anahtar Konular</CardTitle>
            </div>
            <CardDescription>Yorumlarda en çok bahsedilen kelimeler</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center border border-dashed border-border rounded-lg">
              <div className="text-center text-muted-foreground">
                <BarChart3 className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Kelime bulutu görselleştirme yakında</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
