// paytr-cancel-subscription: flags the active subscription to stop renewing at
// the end of the current period (access continues until next_billing_date).
// Pass { resume: true } to undo. Does NOT delete anything on PayTR's side.

import { createClient } from "npm:@supabase/supabase-js@2";
import { CORS_HEADERS } from "../_shared/paytr.ts";

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

    const { business_id, resume } = await req.json().catch(() => ({}));
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

    const { error: updErr } = await admin
      .from("subscription_billing")
      .update(
        resume === true
          ? {
              cancel_at_period_end: false,
              canceled_at: null,
              updated_at: new Date().toISOString(),
            }
          : {
              cancel_at_period_end: true,
              canceled_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
      )
      .eq("business_id", business_id)
      .in("status", ["active", "past_due"]);
    if (updErr) throw updErr;

    return json({ ok: true, resumed: resume === true });
  } catch (e) {
    console.error("paytr-cancel-subscription error", e);
    return json({ error: (e as Error).message }, 500);
  }
});

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
  });
}