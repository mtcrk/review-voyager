import { Info, Shield, UserCheck } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export function TikTokComplianceCard() {
  return (
    <Card className="mb-4 border-primary/30 bg-primary/5">
      <CardContent className="py-3 px-4">
        <div className="flex items-start gap-3">
          <Shield className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
          <div className="flex-1 space-y-1">
            <p className="text-sm font-medium">
              Nasıl Çalışır: AI önerir, siz onaylarsınız. Otomatik gönderim yoktur.
            </p>
            <p className="text-xs text-muted-foreground">
              <UserCheck className="h-3 w-3 inline mr-1" />
              Yanıtlar ve uyumluluk konusunda sorumluluk size aittir.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
