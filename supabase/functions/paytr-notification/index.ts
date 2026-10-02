// paytr-notification: PUBLIC webhook. PayTR posts here after each payment.
// Must always respond with "OK" (text/plain) so PayTR stops retrying.

import { createClient } from "npm:@supabase/supabase-js@2";
import { CORS_HEADERS, formToRecord, paytrNotificationHash } from "../_shared/paytr.ts";
import { CREDIT_OID_PREFIX, handleCreditPayment } from "../_shared/priceCredits.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS_HEADERS });

  try {
    const fd = await req.formData();
    const p = formToRecord(fd);
    const {
      merchant_oid = "",
      status = "",
      total_amount = "",
      hash = "",
    } = p;

    // Trim: secret'ta kaçak boşluk/newline olursa HMAC byte-exact tutmaz ve
    // ödeme alınmasına rağmen abonelik sessizce aktive olmaz.
    const merchant_key = (Deno.env.get("PAYTR_MERCHANT_KEY") ?? "").trim();
    const merchant_salt = (Deno.env.get("PAYTR_MERCHANT_SALT") ?? "").trim();

    const expected = await paytrNotificationHash({
      merchant_oid,
      status,
      total_amount,
      merchant_key,
      merchant_salt,
    });

    if (expected !== hash) {
      console.warn("PayTR notification hash mismatch", { merchant_oid });
      return ok();
    }

    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // Fiyat kredisi siparişleri abonelik akışından tamamen ayrı işlenir.
    if (merchant_oid.startsWith(CREDIT_OID_PREFIX)) {
      const r = await handleCreditPayment(admin, { merchant_oid, status, total_amount });
      if (r.handled) return ok();
    }

    const { data: origLog } = await admin
      .from("paytr_payment_log")
      .select("business_id,is_recurring,user_ip,plan_code,plan_id,location_count,computed_total,addon_codes,payment_amount,status,is_test")
      .eq("merchant_oid", merchant_oid)
      .maybeSingle();

    const business_id = origLog?.business_id ?? null;
    const alreadySucceeded = origLog?.status === "success";
    const is_recurring = origLog?.is_recurring ?? false;
    const orig_plan_code = origLog?.plan_code ?? "pro_monthly";
    const orig_user_ip = origLog?.user_ip ?? null;
    const orig_plan_id = origLog?.plan_id ?? null;
    const orig_location_count = origLog?.location_count ?? 1;
    const orig_computed_total = origLog?.computed_total ?? null;
    const orig_addon_codes = origLog?.addon_codes ?? [];
    const orig_is_test = origLog?.is_test ?? false;

    // Tutar doğrulaması: hash doğrulandığı için tutar güvenilir, ancak
    // beklenen ile gelen tutar arasındaki fark görünür bir iz bırakmalı.
    const receivedAmount = Number(total_amount) / 100;
    const expectedAmount = origLog?.computed_total ?? origLog?.payment_amount ?? null;
    let amountMismatchNote: string | null = null;
    if (
      status === "success" &&
      expectedAmount != null &&
      Math.abs(Number(expectedAmount) - receivedAmount) > 0.01
    ) {
      amountMismatchNote = `expected=${Number(expectedAmount)} received=${receivedAmount}`;
      console.error("paytr-notification: amount_mismatch", {
        merchant_oid,
        business_id,
        expected: Number(expectedAmount),
        received: receivedAmount,
      });
    }

    await admin
      .from("paytr_payment_log")
      .upsert({
        merchant_oid,
        business_id,
        payment_amount: receivedAmount,
        is_recurring,
        status: status === "success" ? "success" : "failed",
        error_message: amountMismatchNote ?? p.failed_reason_msg ?? null,
        raw_notification: p,
      }, { onConflict: "merchant_oid" });

    if (status === "success" && business_id) {
      if (p.utoken && p.ctoken) {
        await admin.from("paytr_customer_tokens").upsert({
          business_id,
          utoken: p.utoken,
          ctoken: p.ctoken,
          last_4: p.last_4 ?? null,
          card_brand: p.card_type ?? null,
          card_bank: p.card_bank ?? null,
          require_cvv: p.require_cvv === "1",
          last_payment_ip: orig_user_ip,
        }, { onConflict: "business_id" });
      }

      const next = new Date();
      next.setMonth(next.getMonth() + 1);
      const nextDate = next.toISOString().slice(0, 10);

      const { data: existingSub } = await admin
        .from("subscription_billing")
        .select("id,started_at")
        .eq("business_id", business_id)
        .maybeSingle();

      const nowIso = new Date().toISOString();

      if (existingSub) {
        await admin
          .from("subscription_billing")
          .update({
            status: "active",
            next_billing_date: nextDate,
            retry_count: 0,
            last_payment_status: "success",
            last_payment_at: nowIso,
            current_period_start: nowIso,
            canceled_at: null,
            cancel_at_period_end: false,
            started_at: existingSub.started_at ?? nowIso,
            plan_code: orig_plan_code,
            amount: Number(total_amount) / 100,
            plan_id: orig_plan_id,
            location_count: orig_location_count,
            computed_total: orig_computed_total ?? Number(total_amount) / 100,
            addon_codes: orig_addon_codes,
            is_test: orig_is_test,
          })
          .eq("business_id", business_id);
      } else {
        await admin.from("subscription_billing").insert({
          business_id,
          plan_code: orig_plan_code,
          amount: Number(total_amount) / 100,
          currency: "TL",
          status: "active",
          next_billing_date: nextDate,
          last_payment_status: "success",
          last_payment_at: nowIso,
          started_at: nowIso,
          current_period_start: nowIso,
          plan_id: orig_plan_id,
          location_count: orig_location_count,
          computed_total: orig_computed_total ?? Number(total_amount) / 100,
          addon_codes: orig_addon_codes,
          is_test: orig_is_test,
        });
      }

      if (!alreadySucceeded) {
        try {
          const { data: biz } = await admin
            .from("businesses")
            .select("user_id,name")
            .eq("id", business_id)
            .maybeSingle();
          const userRes = biz?.user_id
            ? await admin.auth.admin.getUserById(biz.user_id)
            : null;
          const email = userRes?.data?.user?.email ?? null;

          await notifySubscription({
            type: "payment_success",
            business_id,
            to_email: email,
            business_name: biz?.name ?? null,
            plan_code: orig_plan_code,
            amount: orig_computed_total ?? receivedAmount,
            location_count: orig_location_count,
            addon_codes: orig_addon_codes,
            next_billing_date: nextDate,
          });
        } catch (mailErr) {
          console.error("paytr-notification: payment_success mail failed", mailErr);
        }
      }
    } else if (status !== "success" && business_id && is_recurring) {
      // Only recurring failures should degrade the subscription. First-payment
      // attempts (is_recurring=false) must not push an existing active plan
      // into past_due when a user mistypes card details at checkout.
      const { data: sub } = await admin
        .from("subscription_billing")
        .select("retry_count")
        .eq("business_id", business_id)
        .maybeSingle();
      const rc = (sub?.retry_count ?? 0) + 1;
      await admin
        .from("subscription_billing")
        .update({
          retry_count: rc,
          last_payment_status: "failed",
          last_payment_at: new Date().toISOString(),
          status: rc >= 3 ? "past_due" : "active",
        })
        .eq("business_id", business_id);

      if (!alreadySucceeded) {
        try {
          const { data: biz } = await admin
            .from("businesses")
            .select("user_id,name")
            .eq("id", business_id)
            .maybeSingle();
          const userRes = biz?.user_id
            ? await admin.auth.admin.getUserById(biz.user_id)
            : null;
          const email = userRes?.data?.user?.email ?? null;

          await notifySubscription({
            type: "recurring_failed",
            business_id,
            to_email: email,
            business_name: biz?.name ?? null,
            plan_code: orig_plan_code,
            amount: orig_computed_total ?? receivedAmount,
            location_count: orig_location_count,
            addon_codes: orig_addon_codes,
          });
        } catch (mailErr) {
          console.error("paytr-notification: recurring_failed mail failed", mailErr);
        }
      }
    }

    return ok();
  } catch (e) {
    console.error("paytr-notification error", e);
    return ok();
  }
});

function ok() {
  return new Response("OK", { status: 200, headers: { "Content-Type": "text/plain" } });
}

async function notifySubscription(payload: Record<string, unknown>) {
  const url = `${Deno.env.get("SUPABASE_URL")}/functions/v1/notify-subscription-email`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    console.error("notify-subscription-email failed", res.status, await res.text());
  }
}