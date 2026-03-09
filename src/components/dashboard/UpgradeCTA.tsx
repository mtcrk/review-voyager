import { Button } from "@/components/ui/button";
import { Lock, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

interface UpgradeCTAProps {
  feature: string;
  compact?: boolean;
}

export function UpgradeCTA({ feature, compact = false }: UpgradeCTAProps) {
  const navigate = useNavigate();
  const { t } = useTranslation();

  if (compact) {
    return (
      <button
        onClick={() => navigate("/#pricing")}
        className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-primary/10 border border-primary/20 text-primary text-xs font-medium hover:bg-primary/20 transition-colors"
      >
        <Lock className="w-3 h-3" />
        {t('dashboard.demo.upgradePro', 'Pro\'ya Geç')}
      </button>
    );
  }

  return (
    <div className="mt-4 p-4 rounded-lg border border-dashed border-primary/30 bg-primary/5 text-center">
      <p className="text-sm text-muted-foreground mb-2">
        {t('dashboard.demo.upgradeText', '{{feature}} gerçek verilerle kullanmak için Pro\'ya geçin', { feature })}
      </p>
      <Button
        size="sm"
        onClick={() => navigate("/#pricing")}
        className="gradient-primary text-white"
      >
        {t('dashboard.demo.upgradeButton', 'Pro Planı Keşfet')}
        <ArrowRight className="w-3 h-3 ml-1" />
      </Button>
    </div>
  );
}
