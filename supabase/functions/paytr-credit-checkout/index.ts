// Fiyat kredisi paketi satın alma — PayTR iFrame (tek seferlik 3D) token'ı üretir.
// Tutar ve kredi miktarı YALNIZCA package_id'den sunucuda belirlenir; istemciden tutar alınmaz.
import { createClient } from "npm:@supabase/supabase-js@2";
import { CORS_HEADERS, getClientIp, newMerchantOid, paytrIframeToken } from "../_shared/paytr.ts";
import { CREDIT_OID_PREFIX } from "../_shared/priceCredits.ts";

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } });

function b64Utf8(s: string): string {
  const bytes = new TextEncoder().encode(s);
  let bin = "";
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS_HEADERS });
  try {
    const authHeader = req.headers.get("Authorization") ?? "";
    if (!authHeader.startsWith("Bearer ")) return json({ error: "Unauthorized" }, 401);
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const userClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, { global: { headers: { Authorization: authHeader } } });
    const { data: { user } } = await userClient.auth.getUser();
    if (!user?.email) return json({ error: "Unauthorized" }, 401);
    const admin = createClient(supabaseUrl, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

    const body = await req.json().catch(() => ({}));
    const business_id = String(body?.business_id ?? "");
    const package_id = String(body?.package_id ?? "");
    if (!/^[0-9a-f-]{36}$/i.test(business_id) || !/^[0-9a-f-]{36}$/i.test(package_id)) return json({ error: "Geçersiz istek" }, 400);

    const { data: can } = await admin.rpc("user_can_access_business", { _user_id: user.id, _business_id: business_id });
    if (!can) return json({ error: "Forbidden" }, 403);

    const { data: pkg } = await admin.from("price_credit_packages").select("id, name, credits, price_try, is_active").eq("id", package_id).maybeSingle();
    if (!pkg || !pkg.is_active) return json({ error: "Paket bulunamadı" }, 400);
    const amount = Number(pkg.price_try); // tek doğruluk kaynağı

    const merchant_id = (Deno.env.get("PAYTR_MERCHANT_ID") ?? "").trim();
    const merchant_key = (Deno.env.get("PAYTR_MERCHANT_KEY") ?? "").trim();
    const merchant_salt = (Deno.env.get("PAYTR_MERCHANT_SALT") ?? "").trim();
    if (!merchant_id || !merchant_key || !merchant_salt) return json({ error: "PayTR yapılandırılmamış" }, 500);

    const { data: setting } = await admin.from("app_settings").select("value").eq("key", "paytr_test_mode").maybeSingle();
    const test_mode = setting?.value === false ? "0" : "1";

    const merchant_oid = newMerchantOid(CREDIT_OID_PREFIX);
    const user_ip = getClientIp(req);
    const payment_amount = String(Math.round(amount * 100)); // kuruş
    const currency = "TL";
    const no_installment = "1";
    const max_installment = "0";
    const user_basket = b64Utf8(JSON.stringify([[`Fiyat kredisi - ${pkg.name}`, amount.toFixed(2), 1]]));
    const origin = req.headers.get("origin") ?? "https://voyagerespondcom.lovable.app";
    const back = test_mode === "0" ? "https://voyagerespond.com" : origin;

    const { token: paytr_token } = await paytrIframeToken({
      merchant_id, user_ip, merchant_oid, email: user.email, payment_amount, user_basket,
      no_installment, max_installment, currency, test_mode, merchant_key, merchant_salt,
    });

    const { error: oe } = await admin.from("price_credit_orders").insert({
      merchant_oid, business_id, package_id: pkg.id, credits: pkg.credits, amount_try: amount,
      is_test: test_mode === "1", created_by: user.id,
    });
    if (oe) return json({ error: oe.message }, 500);

    const { data: prof } = await admin.from("profiles").select("full_name").eq("user_id", user.id).maybeSingle();
    const fields: Record<string, string> = {
      merchant_id, user_ip, merchant_oid, email: user.email, payment_amount, paytr_token, user_basket,
      debug_on: test_mode === "1" ? "1" : "0", no_installment, max_installment,
      user_name: prof?.full_name || user.email, user_address: "Türkiye", user_phone: "0000000000",
      merchant_ok_url: `${back}/settings?tab=price-tracking&credits=ok`,
      merchant_fail_url: `${back}/settings?tab=price-tracking&credits=failed`,
      timeout_limit: "30", currency, test_mode, lang: "tr",
    };
    const res = await fetch("https://www.paytr.com/odeme/api/get-token", {
      method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: new URLSearchParams(fields),
    });
    const text = await res.text();
    let pj: { status?: string; token?: string; reason?: string } = {};
    try { pj = JSON.parse(text); } catch { return json({ error: "PayTR geçersiz yanıt" }, 502); }
    if (pj.status !== "success" || !pj.token) {
      await admin.from("price_credit_orders").update({ status: "token_failed" }).eq("merchant_oid", merchant_oid);
      return json({ error: "PayTR token alınamadı", reason: pj.reason ?? "unknown" }, 400);
    }
    return json({ iframe_token: pj.token, merchant_oid, credits: pkg.credits, amount });
  } catch (e) {
    console.error("paytr-credit-checkout error", e);
    return json({ error: (e as Error).message }, 500);
  }
});
