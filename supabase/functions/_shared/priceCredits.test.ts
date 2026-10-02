// deno test supabase/functions/_shared/priceCredits.test.ts
import { assertEquals } from "https://deno.land/std@0.224.0/assert/mod.ts";
import { handleCreditPayment } from "./priceCredits.ts";
import { paytrNotificationHash } from "./paytr.ts";

// Bellek içi sahte veritabanı: yalnız handler'ın kullandığı zincirler.
function fakeAdmin(order: any) {
  const ledger: any[] = [];
  const orders = order ? [order] : [];
  const admin = {
    ledger, orders,
    from(table: string) {
      let filter: [string, unknown] | null = null;
      const api: any = {
        select() { return api; },
        eq(k: string, v: unknown) { filter = [k, v]; return api; },
        async maybeSingle() { return { data: orders.find((o) => filter && o[filter[0]] === filter[1]) ?? null }; },
        update(patch: any) {
          return { eq: async (k: string, v: unknown) => { orders.filter((o) => o[k] === v).forEach((o) => Object.assign(o, patch)); return { error: null }; } };
        },
        async insert(row: any) {
          if (table === "price_credit_ledger" && row.reason === "purchase" && ledger.some((l) => l.reason === "purchase" && l.ref_id === row.ref_id)) {
            return { error: { code: "23505", message: "duplicate" } };
          }
          ledger.push(row);
          return { error: null };
        },
      };
      return api;
    },
  };
  return admin;
}

const order = () => ({ merchant_oid: "VCtest1", business_id: "b1", credits: 100, amount_try: 1490, status: "initiated", created_by: "u1" });

Deno.test("başarılı ödeme paket kredisini bir kez yükler", async () => {
  const a = fakeAdmin(order());
  const r = await handleCreditPayment(a, { merchant_oid: "VCtest1", status: "success", total_amount: "149000" });
  assertEquals(r.credited, 100);
  assertEquals(a.ledger.length, 1);
  assertEquals(a.ledger[0].delta, 100);
  assertEquals(a.orders[0].status, "paid");
});

Deno.test("aynı merchant_oid ikinci bildirimde kredi yüklemez", async () => {
  const a = fakeAdmin(order());
  await handleCreditPayment(a, { merchant_oid: "VCtest1", status: "success", total_amount: "149000" });
  const r2 = await handleCreditPayment(a, { merchant_oid: "VCtest1", status: "success", total_amount: "149000" });
  assertEquals(r2.credited, 0);
  // sipariş durumu "paid" olmasa bile tekil index ikinci yüklemeyi engeller
  a.orders[0].status = "initiated";
  const r3 = await handleCreditPayment(a, { merchant_oid: "VCtest1", status: "success", total_amount: "149000" });
  assertEquals(r3.credited, 0);
  assertEquals(a.ledger.length, 1);
});

Deno.test("tutar uyuşmazsa (ör. 100x) kredi yüklenmez", async () => {
  const a = fakeAdmin(order());
  const r = await handleCreditPayment(a, { merchant_oid: "VCtest1", status: "success", total_amount: "14900000" });
  assertEquals(r.credited, 0);
  assertEquals(r.error, "amount_mismatch");
  assertEquals(a.ledger.length, 0);
});

Deno.test("başarısız ödeme kredi yüklemez", async () => {
  const a = fakeAdmin(order());
  const r = await handleCreditPayment(a, { merchant_oid: "VCtest1", status: "failed", total_amount: "149000" });
  assertEquals(r.credited, 0);
  assertEquals(a.orders[0].status, "failed");
});

Deno.test("kredi siparişi olmayan oid abonelik akışına bırakılır", async () => {
  const a = fakeAdmin(null);
  const r = await handleCreditPayment(a, { merchant_oid: "VCnone", status: "success", total_amount: "149000" });
  assertEquals(r.handled, false);
});

Deno.test("bildirim hash'i sahte imzayı ayırt eder", async () => {
  const p = { merchant_oid: "VCtest1", status: "success", total_amount: "149000", merchant_key: "k", merchant_salt: "s" };
  const h = await paytrNotificationHash(p);
  const forged = await paytrNotificationHash({ ...p, total_amount: "14900000" });
  assertEquals(h === forged, false);
});
