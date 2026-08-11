import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { isActiveSubscriptionStatus, isForcedCheckoutEmail } from "@/lib/paywall";

/**
 * Ödeme duvarı: belirli hesaplar aktif aboneliği olmadan uygulamayı kullanamaz.
 */
export function usePaywall() {
  const { user, loading: authLoading } = useAuth();
  const forced = isForcedCheckoutEmail(user?.email);

  const { data, isLoading } = useQuery({
    queryKey: ["paywall-subscription", user?.id],
    enabled: !!user && forced,
    staleTime: 60_000,
    queryFn: async () => {
      const { data: biz } = await supabase
        .from("businesses")
        .select("id")
        .eq("user_id", user!.id);
      const ids = (biz ?? []).map((b) => b.id);
      if (ids.length === 0) return false;
      const { data: subs } = await supabase
        .from("subscription_billing")
        .select("status,is_test")
        .in("business_id", ids)
        .eq("is_test", false);
      return (subs ?? []).some((s) => isActiveSubscriptionStatus(s.status));
    },
  });

  return {
    forced,
    hasActiveSubscription: data === true,
    loading: authLoading || (forced && isLoading),
    /** true ise kullanıcı ödeme sayfasına yönlendirilmeli */
    mustPay: forced && !authLoading && !isLoading && data !== true,
  };
}
