// paytr-list-cards: fetches the saved card summary (masked) for the current
// user's business via PayTR CAPI LIST endpoint.

import { createClient } from "npm:@supabase/supabase-js@2";
import { CORS_HEADERS, paytrUtokenListToken } from "../_shared/paytr.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS_HEADERS });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) return json({ error: "Unauthorized" }, 401);

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } },
    );
    const { data: claims, error } = await supabase.auth.getClaims(
      authHeader.replace("Bearer ", ""),
    );
    if (error || !claims?.claims) return json({ error: "Unauthorized" }, 401);
    const userId = claims.claims.sub as string;

    const { business_id } = await req.json().catch(() => ({}));
    if (!business_id) return json({ error: "business_id required" }, 400);

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

    const { data: tok } = await admin
      .from("paytr_customer_tokens")
      .select("utoken,last_4,card_brand,card_bank")
      .eq("business_id", business_id)
      .maybeSingle();

    if (!tok?.utoken) return json({ cards: [] });

    const merchant_id = Deno.env.get("PAYTR_MERCHANT_ID") ?? "";
    const merchant_key = Deno.env.get("PAYTR_MERCHANT_KEY") ?? "";
    const merchant_salt = Deno.env.get("PAYTR_MERCHANT_SALT") ?? "";
    if (!merchant_id || !merchant_key || !merchant_salt) {
      return json({
        cards: [{ last_4: tok.last_4, brand: tok.card_brand, bank: tok.card_bank }],
      });
    }

    const paytr_token = await paytrUtokenListToken({
      utoken: tok.utoken,
      merchant_key,
      merchant_salt,
    });

    const form = new URLSearchParams({
      merchant_id,
      utoken: tok.utoken,
      paytr_token,
    });

    const resp = await fetch("https://www.paytr.com/odeme/capi/list", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: form.toString(),
    });
    const data = await resp.json().catch(() => ({}));

    return json({
      raw: data,
      fallback: { last_4: tok.last_4, brand: tok.card_brand, bank: tok.card_bank },
    });
  } catch (e) {
    console.error("paytr-list-cards error", e);
    return json({ error: (e as Error).message }, 500);
  }
});

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
  });
}