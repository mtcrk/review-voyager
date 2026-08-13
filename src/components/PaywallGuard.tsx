import { Navigate, useLocation } from "react-router-dom";
import { usePaywall } from "@/hooks/usePaywall";

/**
 * Global paywall guard: forces certain accounts to the checkout page
 * regardless of which route they browse — including public/SEO pages.
 * Mounted once at the RootLayout level (inside Router + AuthProvider).
 *
 * Allowed browsing paths are limited to billing + auth flows so the user
 * can complete payment or sign out without a redirect loop.
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

  if (loading) return null;
  if (!mustPay) return null;
  if (ALLOWED.some((p) => location.pathname.startsWith(p))) return null;

  return <Navigate to="/billing/checkout" replace />;
}
