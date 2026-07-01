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
    } = body ?? {};

    if (!business_id || !amount || !email || !user_name || !city) {
      return json({ error: "Missing required fields" }, 400);
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
    // PayTR wants payment_amount as integer (kuruş = amount * 100)
    const payment_amount = String(Math.round(Number(amount) * 100));
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
      basket ?? [[plan_code, String(amount), 1]],
    );

    // Log the initiated attempt
    await admin.from("paytr_payment_log").insert({
      business_id,
      merchant_oid,
      payment_amount: Number(amount),
      is_recurring: false,
      status: "initiated",
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