import { AlertTriangle, Info, ExternalLink } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Link } from "@/components/Link";
import { TIKTOK_CONFIG } from "@/lib/tiktokConfig";

interface TikTokSandboxBannerProps {
  isDemoMode: boolean;
}

export function TikTokSandboxBanner({ isDemoMode }: TikTokSandboxBannerProps) {
  if (!TIKTOK_CONFIG.isSandbox) return null;

  return (
    <Alert variant="default" className="mb-4 border-yellow-500/50 bg-yellow-50/50 dark:bg-yellow-950/20">
      <AlertTriangle className="h-4 w-4 text-yellow-600" />
      <AlertTitle className="text-yellow-700 dark:text-yellow-400">Sandbox Modu</AlertTitle>
      <AlertDescription className="text-yellow-600 dark:text-yellow-300">
        <p className="mb-2">
          TikTok API sandbox modunda çalışıyor. Sandbox, mock/boş yorum döndürebilir ve yanıt gönderimini engelleyebilir.
          {isDemoMode && " Demo Modu aktif: Örnek verilerle test yapabilirsiniz."}
        </p>
        <div className="flex items-center gap-2">
          <Button asChild variant="outline" size="sm" className="h-7 text-xs">
            <Link to="/tiktok-review-kit">
              <ExternalLink className="h-3 w-3 mr-1" />
              App Review Kit
            </Link>
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
}
