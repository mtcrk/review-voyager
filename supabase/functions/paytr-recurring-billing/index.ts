// paytr-recurring-billing: pg_cron triggers this daily. Uses saved utoken/ctoken
// to charge via PayTR "Kayıtlı Karttan Tekrarlayan Ödeme" (non_3d=1, recurring_payment=1).
// GATED behind app_settings.paytr_non3d_enabled — no-ops when disabled.

import { createClient } from "npm:@supabase/supabase-js@2";
import {
  CORS_HEADERS,
  newMerchantOid,
  paytrPaymentToken,
} from "../_shared/paytr.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS_HEADERS });

  const admin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  const { data: flagRow } = await admin
    .from("app_settings")
    .select("value")
    .eq("key", "paytr_non3d_enabled")
    .maybeSingle();
  const enabled = flagRow?.value === true;
  if (!enabled) {
    return json({ skipped: true, reason: "paytr_non3d_enabled is false" });
  }

  const merchant_id = Deno.env.get("PAYTR_MERCHANT_ID") ?? "";
  const merchant_key = Deno.env.get("PAYTR_MERCHANT_KEY") ?? "";
  const merchant_salt = Deno.env.get("PAYTR_MERCHANT_SALT") ?? "";
  if (!merchant_id || !merchant_key || !merchant_salt) {
    return json({ error: "PayTR credentials not configured" }, 500);
  }

  const { data: testRow } = await admin
    .from("app_settings")
    .select("value")
    .eq("key", "paytr_test_mode")
    .maybeSingle();
  const test_mode = testRow?.value === false ? "0" : "1";

  const today = new Date().toISOString().slice(0, 10);
  const { data: due } = await admin
    .from("subscription_billing")
    .select("business_id,plan_code,amount,currency,retry_count")
    .eq("status", "active")
    .lte("next_billing_date", today);

  const results: unknown[] = [];

  for (const sub of due ?? []) {
    try {
      const { data: tok } = await admin
        .from("paytr_customer_tokens")
        .select("utoken,ctoken")
        .eq("business_id", sub.business_id)
        .maybeSingle();

      const { data: biz } = await admin
        .from("businesses")
        .select("user_id,name")
        .eq("id", sub.business_id)
        .maybeSingle();

      const userRes = biz?.user_id
        ? await admin.auth.admin.getUserById(biz.user_id)
        : null;
      const email = userRes?.data?.user?.email ?? "";

      if (!tok?.utoken || !tok?.ctoken || !email) {
        results.push({ business_id: sub.business_id, skipped: "missing token/email" });
        continue;
      }

      const merchant_oid = newMerchantOid("VRR");
      const payment_amount = String(Math.round(Number(sub.amount) * 100));
      const currency = sub.currency ?? "TL";
      const payment_type = "card";
      const installment_count = "0";
      const non_3d = "1";
      const user_ip = "127.0.0.1";

      const paytr_token = await paytrPaymentToken({
        merchant_id,
        user_ip,
        merchant_oid,
        email,
        payment_amount,
        payment_type,
        installment_count,
        currency,
        test_mode,
        non_3d,
        merchant_key,
        merchant_salt,
      });

      await admin.from("paytr_payment_log").insert({
        business_id: sub.business_id,
        merchant_oid,
        payment_amount: Number(sub.amount),
        is_recurring: true,
        status: "initiated",
      });

      const form = new URLSearchParams({
        merchant_id,
        user_ip,
        merchant_oid,
        email,
        payment_type,
        payment_amount,
        installment_count,
        currency,
        test_mode,
        non_3d,
        utoken: tok.utoken,
        ctoken: tok.ctoken,
        recurring_payment: "1",
        user_name: biz?.name ?? "Customer",
        user_address: "N/A",
        user_phone: "N/A",
        user_basket: JSON.stringify([[sub.plan_code, String(sub.amount), 1]]),
        paytr_token,
      });

      const resp = await fetch("https://www.paytr.com/odeme/capi/recurring", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: form.toString(),
      });
      const data = await resp.json().catch(() => ({}));
      const status = String(data?.status ?? "");

      if (status === "success") {
        const next = new Date();
        next.setMonth(next.getMonth() + 1);
        await admin.from("subscription_billing").update({
          next_billing_date: next.toISOString().slice(0, 10),
          retry_count: 0,
          last_payment_status: "success",
          last_payment_at: new Date().toISOString(),
          status: "active",
        }).eq("business_id", sub.business_id);

        await admin.from("paytr_payment_log").update({
          status: "success",
          raw_notification: data,
        }).eq("merchant_oid", merchant_oid);
      } else if (status === "wait_callback") {
        await admin.from("paytr_payment_log").update({
          status: "wait_callback",
          raw_notification: data,
        }).eq("merchant_oid", merchant_oid);
      } else {
        const rc = (sub.retry_count ?? 0) + 1;
        await admin.from("subscription_billing").update({
          retry_count: rc,
          last_payment_status: "failed",
          last_payment_at: new Date().toISOString(),
          status: rc >= 3 ? "past_due" : "active",
        }).eq("business_id", sub.business_id);

        await admin.from("paytr_payment_log").update({
          status: "failed",
          error_message: data?.err_msg ?? "unknown",
          raw_notification: data,
        }).eq("merchant_oid", merchant_oid);
      }

      results.push({ business_id: sub.business_id, status });
    } catch (e) {
      console.error("recurring error", sub.business_id, e);
      results.push({ business_id: sub.business_id, error: (e as Error).message });
    }
  }

  return json({ processed: results.length, results });
});

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
  });
}