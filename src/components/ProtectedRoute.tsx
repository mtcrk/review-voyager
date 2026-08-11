import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { usePaywall } from '@/hooks/usePaywall';
import { PAYWALL_ALLOWED_PATHS } from '@/lib/paywall';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export function ProtectedRoute({ children, requireAdmin = false }: ProtectedRouteProps) {
  const location = useLocation();
  const { user, role, loading } = useAuth();
  const { mustPay, loading: paywallLoading } = usePaywall();

  if (loading || paywallLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    const redirect = encodeURIComponent(`${location.pathname}${location.search}`);
    return <Navigate to={`/login?redirect=${redirect}`} replace />;
  }

  // Ödeme duvarı: aboneliği olmayan belirli hesaplar sadece ödeme sayfasını görebilir.
  if (mustPay && !PAYWALL_ALLOWED_PATHS.some((p) => location.pathname.startsWith(p))) {
    return <Navigate to="/billing/checkout" replace />;
  }

  if (requireAdmin && role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

