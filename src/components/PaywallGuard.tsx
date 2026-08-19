import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { usePaywall } from "@/hooks/usePaywall";
import { PaywallNotice } from "@/components/PaywallNotice";

/**
 * Global paywall guard: belirli hesaplara abonelik başlatana kadar
 * kapatılabilir bir bilgilendirme modalı gösterir.
 *
 * - Sayfa veya tab değiştirdikçe modal tekrar görünür.
 * - Kullanıcı "Kapat" ile kapatırsa, bir sonraki gezinmeye kadar gizli kalır
 *   ve arkasındaki sayfayı kullanmaya devam edebilir.
 * - Billing/auth akışlarında hiç görünmez (ödeme tamamlayabilsin).
 */
const ALLOWED = [
  "/billing",
  "/auth/callback",
  "/auth/reset",
  "/billing/success",
  "/billing/failed",
];

export function PaywallGuard() {
  const location = useLocation();
  const { mustPay, loading } = usePaywall();
  const [dismissed, setDismissed] = useState(false);
  const [lastPath, setLastPath] = useState(location.pathname);

  // Yol değişince kapatma durumunu sıfırla — modal tekrar görünür.
  useEffect(() => {
    if (location.pathname !== lastPath) {
      setLastPath(location.pathname);
      setDismissed(false);
    }
  }, [location.pathname, lastPath]);

  if (loading) return null;
  if (!mustPay) return null;
  if (ALLOWED.some((p) => location.pathname.startsWith(p))) return null;
  if (dismissed) return null;

  return <PaywallNotice overlay onClose={() => setDismissed(true)} />;
}
