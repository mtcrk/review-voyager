import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

/**
 * Subscription guard for Apify/scraping jobs.
 *
 * Ödeme yapmayan müşterilerin Apify işleri ASLA çalışmaz.
 * Bir işletmenin aktif (test olmayan) aboneliği var mı kontrol eder.
 */

const ACTIVE_STATUSES = ["active", "trialing", "past_due_grace"];

/**
 * Verilen business_id için aktif, test olmayan bir abonelik var mı?
 * Service-role client ile çağrılmalı (RLS bypass için).
 */
export async function hasActiveSubscription(
  supabaseUrl: string,
  serviceKey: string,
  businessId: string
): Promise<{ active: boolean; status?: string; reason?: string }> {
  const admin = createClient(supabaseUrl, serviceKey);
  const { data, error } = await admin
    .from("subscription_billing")
    .select("status, is_test")
    .eq("business_id", businessId)
    .eq("is_test", false);

  if (error) {
    console.error("subscription-guard query error:", error.message);
    return { active: false, reason: `query_error: ${error.message}` };
  }

  const activeRow = (data || []).find((r) =>
    ACTIVE_STATUSES.includes(r.status)
  );

  return {
    active: !!activeRow,
    status: activeRow?.status,
    reason: activeRow ? undefined : "no_active_subscription",
  };
}

/**
 * Birden fazla business_id için aktif aboneliği olanları döndürür.
 * auto-fetch-reviews gibi toplu işlerde tek sorgu ile filtreleme için.
 */
export async function filterBusinessIdsWithSubscription(
  supabaseUrl: string,
  serviceKey: string,
  businessIds: string[]
): Promise<Set<string>> {
  if (businessIds.length === 0) return new Set();
  const admin = createClient(supabaseUrl, serviceKey);

  const active = new Set<string>();
  // IN sorgusu çok uzun olmasın diye 500'er parçala
  for (let i = 0; i < businessIds.length; i += 500) {
    const chunk = businessIds.slice(i, i + 500);
    const { data, error } = await admin
      .from("subscription_billing")
      .select("business_id")
      .in("business_id", chunk)
      .eq("is_test", false)
      .in("status", ACTIVE_STATUSES);

    if (error) {
      console.error("subscription-guard bulk query error:", error.message);
      continue;
    }
    for (const row of data || []) {
      active.add(row.business_id);
    }
  }
  return active;
}
