// Fiyat kredisi satın alma: PayTR bildirimini işler. Hash doğrulaması çağıran tarafta (paytr-notification) yapılır.
// Kredi miktarı ve beklenen tutar yalnızca sunucuda oluşturulan siparişten (price_credit_orders) okunur.
// İdempotent: ledger'da (reason='purchase', ref_id=merchant_oid) tekil index'i aynı ödemenin iki kez kredi yüklemesini engeller.
export const CREDIT_OID_PREFIX = "VC";

export async function handleCreditPayment(
  admin: any,
  p: { merchant_oid: string; status: string; total_amount: string },
): Promise<{ handled: boolean; credited: number; error?: string }> {
  const { data: order } = await admin.from("price_credit_orders").select("*").eq("merchant_oid", p.merchant_oid).maybeSingle();
  if (!order) return { handled: false, credited: 0 };
  if (order.status === "paid") return { handled: true, credited: 0 };
  if (p.status !== "success") {
    await admin.from("price_credit_orders").update({ status: "failed" }).eq("merchant_oid", p.merchant_oid);
    return { handled: true, credited: 0 };
  }
  const received = Number(p.total_amount) / 100;
  if (!(Math.abs(received - Number(order.amount_try)) <= 0.01)) {
    console.error("credit payment amount_mismatch", { oid: p.merchant_oid, expected: order.amount_try, received });
    await admin.from("price_credit_orders").update({ status: "amount_mismatch" }).eq("merchant_oid", p.merchant_oid);
    return { handled: true, credited: 0, error: "amount_mismatch" };
  }
  const { error } = await admin.from("price_credit_ledger").insert({
    business_id: order.business_id, delta: order.credits, reason: "purchase", ref_id: p.merchant_oid,
    note: `${order.credits} kredi paketi (${Number(order.amount_try).toLocaleString("tr-TR")} TL)`, created_by: order.created_by,
  });
  if (error && error.code !== "23505") throw new Error(error.message);
  await admin.from("price_credit_orders").update({ status: "paid", paid_at: new Date().toISOString() }).eq("merchant_oid", p.merchant_oid);
  return { handled: true, credited: error ? 0 : order.credits };
}
