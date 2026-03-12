import { Button } from "@/components/ui/button";
import { Sparkles, ArrowRight, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

interface DemoModeBannerProps {
  onDismiss?: () => void;
}

export function DemoModeBanner({ onDismiss }: DemoModeBannerProps) {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <div className="relative rounded-xl border border-primary/20 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 p-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Sparkles className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">
              {t('dashboard.demo.bannerTitle', 'Demo Modu Aktif')}
            </h3>
            <p className="text-sm text-muted-foreground">
              {t('dashboard.demo.bannerSubtitle', 'Örnek verilerle platformu keşfediyorsunuz. Gerçek verilerinizi görmek için hesabınızı bağlayın.')}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button
            onClick={() => navigate("/settings?tab=google")}
            className="gradient-primary text-white"
          >
            {t('dashboard.demo.connectCta', 'Google Business Bağla')}
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
          {onDismiss && (
            <Button variant="ghost" size="icon" onClick={onDismiss} className="shrink-0">
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
