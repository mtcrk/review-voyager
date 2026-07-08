// Shared PayTR helpers (Deno / Web Crypto)

function b64(bytes: ArrayBuffer): string {
  const b = new Uint8Array(bytes);
  let s = "";
  for (let i = 0; i < b.length; i++) s += String.fromCharCode(b[i]);
  return btoa(s);
}

export async function hmacSha256Base64(key: string, message: string): Promise<string> {
  const enc = new TextEncoder();
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    enc.encode(key),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", cryptoKey, enc.encode(message));
  return b64(sig);
}

/**
 * Payment token (Yeni Kart / Recurring):
 *   hash_str = merchant_id + user_ip + merchant_oid + email + payment_amount
 *            + payment_type + installment_count + currency + test_mode + non_3d
 *   token    = base64(HMAC_SHA256(merchant_key, hash_str + merchant_salt))
 */
export async function paytrPaymentToken(params: {
  merchant_id: string;
  user_ip: string;
  merchant_oid: string;
  email: string;
  payment_amount: string | number;
  payment_type: string;
  installment_count: string | number;
  currency: string;
  test_mode: string | number;
  non_3d: string | number;
  merchant_key: string;
  merchant_salt: string;
}): Promise<string> {
  const hashStr =
    String(params.merchant_id) +
    String(params.user_ip) +
    String(params.merchant_oid) +
    String(params.email) +
    String(params.payment_amount) +
    String(params.payment_type) +
    String(params.installment_count) +
    String(params.currency) +
    String(params.test_mode) +
    String(params.non_3d);
  return await hmacSha256Base64(params.merchant_key, hashStr + params.merchant_salt);
}

/**
 * iFrame / Yönlendirmeli API token (POST to https://www.paytr.com/odeme or
 * /odeme/api/get-token). Hash formula:
 *   hash_str = merchant_id + user_ip + merchant_oid + email + payment_amount
 *            + user_basket + no_installment + max_installment + currency + test_mode
 *   token    = base64(HMAC_SHA256(merchant_key, hash_str + merchant_salt))
 */
export async function paytrIframeToken(params: {
  merchant_id: string;
  user_ip: string;
  merchant_oid: string;
  email: string;
  payment_amount: string | number;
  user_basket: string;
  no_installment: string | number;
  max_installment: string | number;
  currency: string;
  test_mode: string | number;
  merchant_key: string;
  merchant_salt: string;
}): Promise<{ token: string; hashStr: string }> {
  const hashStr =
    String(params.merchant_id) +
    String(params.user_ip) +
    String(params.merchant_oid) +
    String(params.email) +
    String(params.payment_amount) +
    String(params.user_basket) +
    String(params.no_installment) +
    String(params.max_installment) +
    String(params.currency) +
    String(params.test_mode);
  const token = await hmacSha256Base64(
    params.merchant_key,
    hashStr + params.merchant_salt,
  );
  return { token, hashStr };
}

/**
 * Notification callback verification:
 *   expected = base64(HMAC_SHA256(merchant_key, merchant_oid + merchant_salt + status + total_amount))
 */
export async function paytrNotificationHash(params: {
  merchant_oid: string;
  status: string;
  total_amount: string;
  merchant_key: string;
  merchant_salt: string;
}): Promise<string> {
  const msg =
    params.merchant_oid + params.merchant_salt + params.status + params.total_amount;
  return await hmacSha256Base64(params.merchant_key, msg);
}

/**
 * CAPI LIST (kayıtlı kart listesi) token:
 *   token = base64(HMAC_SHA256(merchant_key, utoken + merchant_salt))
 */
export async function paytrUtokenListToken(params: {
  utoken: string;
  merchant_key: string;
  merchant_salt: string;
}): Promise<string> {
  return await hmacSha256Base64(params.merchant_key, params.utoken + params.merchant_salt);
}

export function newMerchantOid(prefix = "VR"): string {
  const ts = Date.now().toString(36);
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}${ts}${rand}`.replace(/[^A-Za-z0-9]/g, "").slice(0, 64);
}

export const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
};

export function getClientIp(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for") ?? "";
  const first = fwd.split(",")[0]?.trim();
  return first || req.headers.get("cf-connecting-ip") || "0.0.0.0";
}

export function formToRecord(fd: FormData): Record<string, string> {
  const o: Record<string, string> = {};
  fd.forEach((v, k) => (o[k] = String(v)));
  return o;
}