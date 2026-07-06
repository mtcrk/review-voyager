// paytr-first-payment: prepares the fields the browser will POST to
// https://www.paytr.com/odeme (Yeni Kart Ekleme, 3D). Card details are NEVER
// touched here — they go directly from the user's browser to PayTR.

import { createClient } from "npm:@supabase/supabase-js@2";
import {
  CORS_HEADERS,
  getClientIp,
  newMerchantOid,
  paytrPaymentToken,
} from "../_shared/paytr.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS_HEADERS });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return json({ error: "Unauthorized" }, 401);
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } },
    );
    const { data: claims, error: claimsErr } = await supabase.auth.getClaims(
      authHeader.replace("Bearer ", ""),
    );
    if (claimsErr || !claims?.claims) return json({ error: "Unauthorized" }, 401);
    const userId = claims.claims.sub as string;

    const body = await req.json().catch(() => ({}));
    const {
      business_id,
      plan_code = "pro_monthly",
      amount, // TL, integer or float
      user_name,
      email,
      city,
      country,
      basket, // optional
      plan_id = null,
      location_count = 1,
      computed_total = null,
      addon_codes = [],
    } = body ?? {};

    if (!business_id || !amount || !email || !user_name || !city) {
      return json({ error: "Missing required fields" }, 400);
    }
    if (!plan_id || typeof plan_id !== "string") {
      return json({ error: "invalid_plan" }, 400);
    }

    // Verify the user owns this business
    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );
    const { data: biz } = await admin
      .from("businesses")
      .select("id,user_id")
      .eq("id", business_id)
      .maybeSingle();
    if (!biz || biz.user_id !== userId) return json({ error: "Forbidden" }, 403);

    // ============ SERVER-SIDE AMOUNT AUTHORITY ============
    // Never trust client-supplied amount. Recompute from plans/addons.
    const { data: planRow } = await admin
      .from("plans")
      .select("id,plan_code,base_amount,unit_type,is_active")
      .eq("id", plan_id)
      .maybeSingle();
    if (!planRow || planRow.is_active === false) {
      return json({ error: "invalid_plan" }, 400);
    }

    const rawLocationCount = Math.trunc(Number(location_count));
    if (!Number.isFinite(rawLocationCount) || rawLocationCount < 1 || rawLocationCount > 500) {
      console.warn("paytr-first-payment: location_count_out_of_range", {
        business_id,
        plan_id,
        raw: location_count,
      });
      return json({ error: "location_count_out_of_range" }, 400);
    }
    const safeLocationCount = rawLocationCount;
    const planSubtotal = planRow.unit_type === "per_location"
      ? Number(planRow.base_amount) * safeLocationCount
      : Number(planRow.base_amount);

    const requestedAddonCodes: string[] = Array.isArray(addon_codes)
      ? addon_codes.filter((c: unknown): c is string => typeof c === "string")
      : [];
    let addonSubtotal = 0;
    let validAddonCodes: string[] = [];
    if (requestedAddonCodes.length) {
      const { data: addonRows } = await admin
        .from("addons")
        .select("addon_code,amount,is_active")
        .in("addon_code", requestedAddonCodes)
        .eq("is_active", true);
      const known = new Set((addonRows ?? []).map((a) => a.addon_code));
      const unknown = requestedAddonCodes.filter((c) => !known.has(c));
      if (unknown.length) {
        console.warn("paytr-first-payment: ignoring unknown/inactive addons", unknown);
      }
      for (const a of addonRows ?? []) addonSubtotal += Number(a.amount);
      validAddonCodes = (addonRows ?? []).map((a) => a.addon_code);
    }

    const serverComputedTotal = Math.round((planSubtotal + addonSubtotal) * 100) / 100;
    const clientAmount = Number(computed_total ?? amount);
    if (!Number.isFinite(clientAmount) || Math.abs(clientAmount - serverComputedTotal) > 0.01) {
      console.warn("paytr-first-payment: amount_mismatch", {
        business_id,
        plan_id,
        clientAmount,
        serverComputedTotal,
      });
      await admin.from("paytr_payment_log").insert({
        business_id,
        merchant_oid: newMerchantOid(),
        payment_amount: clientAmount || 0,
        is_recurring: false,
        status: "rejected_amount_mismatch",
        user_ip: getClientIp(req),
        plan_code: planRow.plan_code,
        plan_id: planRow.id,
        location_count: safeLocationCount,
        computed_total: serverComputedTotal,
        addon_codes: validAddonCodes,
        error_message: `client=${clientAmount} server=${serverComputedTotal}`,
      });
      return json({ error: "amount_mismatch", server_total: serverComputedTotal }, 400);
    }
    // From here on, use serverComputedTotal as the single source of truth.
    const authoritativeAmount = serverComputedTotal;
    const authoritativePlanCode = planRow.plan_code;
    // ======================================================

    // PayTR requires user_address to be non-empty. Build it from the city/country
    // supplied by the user on the checkout form (no invoice flow yet).
    const safeCity = String(city).trim();
    const safeCountry = (country ? String(country).trim() : "") || "Türkiye";
    const user_address = `${safeCity}, ${safeCountry}`;
    // We no longer collect a real phone number; PayTR only requires the field
    // to be non-empty for the request to be accepted.
    const user_phone = "0000000000";

    const merchant_id = Deno.env.get("PAYTR_MERCHANT_ID") ?? "";
    const merchant_key = Deno.env.get("PAYTR_MERCHANT_KEY") ?? "";
    const merchant_salt = Deno.env.get("PAYTR_MERCHANT_SALT") ?? "";
    if (!merchant_id || !merchant_key || !merchant_salt) {
      return json({ error: "PayTR credentials not configured" }, 500);
    }

    // test_mode from app_settings
    const { data: setting } = await admin
      .from("app_settings")
      .select("value")
      .eq("key", "paytr_test_mode")
      .maybeSingle();
    const test_mode = setting?.value === false ? "0" : "1";

    // Existing utoken (returning customer)
    const { data: existing } = await admin
      .from("paytr_customer_tokens")
      .select("utoken")
      .eq("business_id", business_id)
      .maybeSingle();

    const merchant_oid = newMerchantOid();
    const user_ip = getClientIp(req);
    // PayTR Direkt API expects payment_amount as decimal with two digits (e.g. "999.00").
    // Do NOT multiply by 100 — that's the iFrame API format and would cause a 100x overcharge.
    const payment_amount = authoritativeAmount.toFixed(2);
    const payment_type = "card";
    const installment_count = "0";
    const currency = "TL";
    const non_3d = "0";

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

    const origin = req.headers.get("origin") ?? "https://voyagerespondcom.lovable.app";

    const user_basket = JSON.stringify(
      basket ?? [[authoritativePlanCode, payment_amount, 1]],
    );

    // Log the initiated attempt
    await admin.from("paytr_payment_log").insert({
      business_id,
      merchant_oid,
      payment_amount: authoritativeAmount,
      is_recurring: false,
      status: "initiated",
      user_ip,
      plan_code: authoritativePlanCode,
      plan_id: planRow.id,
      location_count: safeLocationCount,
      computed_total: authoritativeAmount,
      addon_codes: validAddonCodes,
    });

    const fields: Record<string, string> = {
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
      merchant_ok_url: `${origin}/billing/success`,
      merchant_fail_url: `${origin}/billing/failed`,
      user_name,
      user_address,
      user_phone,
      user_basket,
      debug_on: "1",
      store_card: "1",
      paytr_token,
      // PayTR Kart Saklama / Yeni Kart Ekleme akışında zorunlu; hash'e DAHİL DEĞİL.
      // no_installment=1 → taksit seçenekleri gösterme (abonelik/kart saklamada standart).
      // max_installment=0 → taksit limiti belirtme (zaten kapalı).
      no_installment: "1",
      max_installment: "0",
      // PayTR arayüz dili ("tr" | "en"). Hash'e dahil değil.
      // Direkt API dokümanı `client_lang` ismini kullanıyor; iFrame API ise `lang`
      // kullanıyor. PayTR hata mesajı "lang" diyor, ikisini de göndererek her iki
      // varyantı kapsıyoruz — fazlalık alanlar PayTR tarafından yok sayılır.
      lang: "tr",
      client_lang: "tr",
    };
    if (existing?.utoken) fields.utoken = existing.utoken;

    return json({
      action: "https://www.paytr.com/odeme",
      fields,
      merchant_oid,
    });
  } catch (e) {
    console.error("paytr-first-payment error", e);
    return json({ error: (e as Error).message }, 500);
  }
});

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
  });
}