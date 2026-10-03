// Manuel "Şimdi yenile": kullanıcı oturumu + işletme erişimi (sahip veya grup üyesi).
// 6 saatlik cache korunur; force_refresh ile atlanır. Tek tarih veya en fazla 14 günlük aralık.
import { isServiceAuth } from "../_shared/serviceAuth.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { runPriceFetch } from "../_shared/prices/engine.ts";
import { addDays } from "../_shared/prices/types.ts";
import { hasActiveSubscription } from "../_shared/subscription-guard.ts";
import { resolveAllowlistBusinessIds } from "../_shared/analysis-allowlist.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

const CACHE_HOURS = 6;
const MANUAL_MAX_CALLS = 150;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    if (!Deno.env.get("SERPAPI_API_KEY")) return json({ error: "SERPAPI_API_KEY tanımlı değil" }, 500);
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const auth = req.headers.get("Authorization") ?? "";
    const isService = await isServiceAuth(auth, supabaseUrl, serviceKey);
    let userId: string | null = null;
    if (!isService) {
      const userClient = createClient(supabaseUrl, anonKey, { global: { headers: { Authorization: auth } } });
      const { data: { user } } = await userClient.auth.getUser();
      if (!user) return json({ error: "Oturum doğrulanamadı" }, 401);
      userId = user.id;
    }
    const admin = createClient(supabaseUrl, serviceKey);

    let body: any = {};
    try { body = await req.json(); } catch {}
    const business_id = String(body?.business_id ?? "");
    const checkin = String(body?.checkin ?? "");
    const days = Math.max(1, Math.min(14, Number(body?.days) || 1));
    const nights = Math.max(1, Math.min(30, Number(body?.nights) || 1));
    const adults = Math.max(1, Math.min(10, Number(body?.adults) || 2));
    const force = body?.force_refresh === true;
    const competitor_ids: string[] | undefined = Array.isArray(body?.competitor_ids)
      ? body.competitor_ids.filter((x: unknown) => typeof x === "string")
      : undefined;
    const include_own = body?.include_own !== false;
    if (!/^[0-9a-f-]{36}$/i.test(business_id) || !/^\d{4}-\d{2}-\d{2}$/.test(checkin)) {
      return json({ error: "Geçersiz istek: business_id ve checkin gerekli" }, 400);
    }

    if (!isService) {
      const { data: can } = await admin.rpc("user_can_access_business", { _user_id: userId, _business_id: business_id });
      if (!can) return json({ error: "Bu işletmeye erişiminiz yok" }, 403);
    }

    const { data: biz } = await admin
      .from("businesses")
      .select("id, name, city, serpapi_property_token, booking_url, price_source_preference, price_source_checked_at, price_compare_board_type, etstur_slug, etstur_hotel_id, etstur_checked_at, jollytur_hotel_id, jollytur_slug, jollytur_checked_at, tatilsepeti_slug, tatilsepeti_checked_at")
      .eq("id", business_id)
      .single();

    // Apify (Booking) yalnızca ödeme yapan veya allowlist'teki işletmeler için.
    let allowBooking = (await hasActiveSubscription(supabaseUrl, serviceKey, business_id)).active;
    if (!allowBooking) {
      const a = await resolveAllowlistBusinessIds(supabaseUrl, serviceKey, "PRICE_TRACKING_ALLOWLIST_EMAILS");
      allowBooking = a.businessIds.has(business_id);
    }

    const dates = Array.from({ length: days }, (_, i) => addDays(checkin, i));
    const result = await runPriceFetch({
      admin,
      business: biz as any,
      competitorIds: competitor_ids,
      includeOwn: include_own,
      dates,
      nights,
      adults,
      cacheHours: CACHE_HOURS,
      force,
      maxCalls: MANUAL_MAX_CALLS,
      allowBooking,
      deadline: Date.now() + 130_000,
      trigger: "manual",
      intlNights: body?.intl_nights ? Math.max(1, Math.min(30, Number(body.intl_nights) || nights)) : undefined,
      markets: Array.isArray(body?.markets) ? body.markets.filter((m: unknown) => m === "domestic" || m === "international") : undefined,
    });
    return json({ ok: true, dates, nights, adults, booking_enabled: allowBooking, ...result });
  } catch (e) {
    console.error("fetch-competitor-prices error", e);
    return json({ error: e instanceof Error ? e.message : "Beklenmeyen hata" }, 500);
  }
});
