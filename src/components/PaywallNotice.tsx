import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Lock, ArrowRight, ShieldCheck, X } from "lucide-react";

/**
 * Ödeme yapması gereken hesaplara sert yönlendirme yerine
 * nazik, kapatılabilir bir bilgilendirme modalı gösterir.
 * Kullanıcı kapatabilir; sayfa/tab değişince tekrar görünür.
 */
export function PaywallNotice({
  overlay = false,
  onClose,
}: {
  overlay?: boolean;
  onClose?: () => void;
}) {
  const navigate = useNavigate();

  const content = (
    <Card className="w-full max-w-md border-primary/20 shadow-lg relative">
      {onClose && (
        <button
          onClick={onClose}
          aria-label="Kapat"
          className="absolute top-3 right-3 p-1.5 rounded-full text-muted-foreground hover:bg-muted transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      )}
      <CardContent className="p-6 sm:p-8 text-center space-y-4">
        <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
          <Lock className="w-5 h-5 text-primary" />
        </div>
        <h1 className="text-xl font-semibold">Aboneliğiniz aktif değil</h1>
        <p className="text-sm text-muted-foreground">
          VoyageRespond'u kullanmaya devam etmek için aboneliğinizi başlatmanız
          gerekiyor. Ödemenizi tamamladıktan sonra tüm panele anında erişebilirsiniz.
        </p>
        <Button className="w-full h-12" onClick={() => navigate("/billing/checkout")}>
          Ödemeye devam et
          <ArrowRight className="w-4 h-4 ml-1" />
        </Button>
        <p className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
          <ShieldCheck className="w-3.5 h-3.5" />
          Güvenli ödeme · İstediğiniz zaman iptal
        </p>
      </CardContent>
    </Card>
  );

  if (overlay) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm px-4">
        {content}
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      {content}
    </div>
  );
}
