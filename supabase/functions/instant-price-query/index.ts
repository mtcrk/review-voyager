// Anlık Fiyat Sorgusu — ücretli, kredi bazlı. 1 kredi = 1 otel × 1 tarih × 1 pazar.
// Aksiyonlar:
//   quote  → gereken kredi + bakiye (düşüm yok)
//   start  → doğrulama + atomik kredi düşümü (consume_price_credits RPC: kilit, bakiye, dakikada 1 sorgu)
//   run    → tek parça (tarih × pazar) canlı çekim; hiçbir kaynaktan cevap alınamayan otellerin kredisi iade
//   finish → çalıştırılmamış parçaların kredisini iade eder, sorguyu kapatır
// Kredi tutarı her zaman sunucuda hesaplanır; istemciden gelen sayıya güvenilmez.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { runPriceFetch } from "../_shared/prices/engine.ts";
import { addDays } from "../_shared/prices/types.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

const MAX_CREDITS = 20;
const MAX_DAYS = 7;
const UUID = /^[0-9a-f-]{36}$/i;
const DATE = /^\d{4}-\d{2}-\d{2}$/;
type Market = "domestic" | "international";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const auth = req.headers.get("Authorization") ?? "";
    const isService = auth === `Bearer ${serviceKey}`;
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
    const action = String(body?.action ?? "");
    const business_id = String(body?.business_id ?? "");
    if (!UUID.test(business_id)) return json({ error: "Geçersiz işletme" }, 400);

    if (!isService) {
      const { data: can } = await admin.rpc("user_can_access_business", { _user_id: userId, _business_id: business_id });
      if (!can) return json({ error: "Bu işletmeye erişiminiz yok" }, 403);
    }

    const balance = async () => {
      const { data } = await admin.from("price_credit_ledger").select("delta").eq("business_id", business_id);
      return (data ?? []).reduce((a: number, r: any) => a + r.delta, 0);
    };

    if (action === "quote" || action === "start") {
      // --- Girdi doğrulama ---
      const rawSubjects: unknown[] = Array.isArray(body?.subjects) ? body.subjects : [];
      const subjects = Array.from(new Set(rawSubjects.filter((x): x is string => typeof x === "string" && (x === "own" || UUID.test(x)))));
      if (!subjects.length) return json({ error: "En az bir otel seçin" }, 400);
      const compIds = subjects.filter((s) => s !== "own");
      if (compIds.length) {
        const { data: comps } = await admin.from("ci_competitors").select("id").eq("business_id", business_id).in("id", compIds);
        if ((comps ?? []).length !== compIds.length) return json({ error: "Geçersiz rakip seçimi" }, 400);
      }
      const from = String(body?.from ?? "");
      const to = String(body?.to ?? from);
      if (!DATE.test(from) || !DATE.test(to) || to < from) return json({ error: "Geçersiz tarih" }, 400);
      const today = new Date().toISOString().slice(0, 10);
      if (from < today) return json({ error: "Geçmiş tarih sorgulanamaz" }, 400);
      const dates: string[] = [];
      for (let d = from; d <= to; d = addDays(d, 1)) { dates.push(d); if (dates.length > MAX_DAYS) break; }
      if (dates.length > MAX_DAYS) return json({ error: `En fazla ${MAX_DAYS} günlük aralık` }, 400);
      const mk = String(body?.market ?? "both");
      const markets: Market[] = mk === "domestic" ? ["domestic"] : mk === "international" ? ["international"] : ["domestic", "international"];
      const nights = Math.max(1, Math.min(14, Math.round(Number(body?.nights) || 1)));
      const adults = Math.max(1, Math.min(6, Math.round(Number(body?.adults) || 2)));
      const credits = subjects.length * dates.length * markets.length;
      const bal = await balance();

      if (action === "quote") return json({ credits, balance: bal, max: MAX_CREDITS, dates, markets });
      if (credits > MAX_CREDITS) return json({ error: `Tek seferde en fazla ${MAX_CREDITS} kredi`, code: "too_many", credits }, 400);

      const { data: q, error: qe } = await admin.from("price_instant_queries").insert({
        business_id, created_by: userId, subjects, dates, markets, nights, adults, credits,
      }).select("id").single();
      if (qe || !q) return json({ error: qe?.message ?? "Sorgu oluşturulamadı" }, 500);

      const { error: ce } = await admin.rpc("consume_price_credits", { _business_id: business_id, _amount: credits, _ref: q.id, _user: userId });
      if (ce) {
        await admin.from("price_instant_queries").delete().eq("id", q.id);
        const code = /insufficient_credits/.test(ce.message) ? "insufficient" : /rate_limited/.test(ce.message) ? "rate_limited" : "error";
        const msg = code === "insufficient" ? "Kredi yetersiz" : code === "rate_limited" ? "Dakikada en fazla 1 anlık sorgu yapılabilir" : ce.message;
        return json({ error: msg, code, credits, balance: bal }, code === "error" ? 500 : 402);
      }
      const chunks = dates.flatMap((d) => markets.map((m) => ({ date: d, market: m })));
      return json({ query_id: q.id, credits, balance: bal - credits, chunks });
    }

    const query_id = String(body?.query_id ?? "");
    if (!UUID.test(query_id)) return json({ error: "Geçersiz sorgu" }, 400);
    const { data: q } = await admin.from("price_instant_queries").select("*").eq("id", query_id).eq("business_id", business_id).maybeSingle();
    if (!q) return json({ error: "Sorgu bulunamadı" }, 404);
    const subjects: string[] = q.subjects;

    const refund = async (n: number, note: string) => {
      if (n <= 0) return;
      await admin.from("price_credit_ledger").insert({ business_id, delta: n, reason: "refund", ref_id: query_id, note, created_by: userId });
      const { data: cur } = await admin.from("price_instant_queries").select("refunded").eq("id", query_id).single();
      await admin.from("price_instant_queries").update({ refunded: (cur?.refunded ?? 0) + n }).eq("id", query_id);
    };

    if (action === "run") {
      const date = String(body?.date ?? "");
      const market = String(body?.market ?? "") as Market;
      if (!q.dates.includes(date) || !q.markets.includes(market)) return json({ error: "Parça bu sorguya ait değil" }, 400);
      if (q.status !== "running") return json({ error: "Sorgu kapalı" }, 409);
      const chunk = `${date}|${market}`;
      // Parça yalnızca bir kez çalışır (aynı krediyle tekrar çekim yapılamaz).
      if (q.done_chunks.includes(chunk)) return json({ error: "Bu parça zaten çalıştırıldı" }, 409);
      await admin.from("price_instant_queries").update({ done_chunks: [...q.done_chunks, chunk] }).eq("id", query_id);

      const { data: biz } = await admin.from("businesses")
        .select("id, name, city, serpapi_property_token, booking_url, price_source_preference, price_source_checked_at, price_compare_board_type, etstur_slug, etstur_hotel_id, etstur_checked_at, jollytur_hotel_id, jollytur_slug, jollytur_checked_at, tatilsepeti_slug, tatilsepeti_checked_at")
        .eq("id", business_id).single();
      const t0 = new Date(Date.now() - 1000).toISOString();
      let result: any = null;
      let failure: string | null = null;
      try {
        result = await runPriceFetch({
          admin, business: biz as any,
          competitorIds: subjects.filter((s) => s !== "own"),
          includeOwn: subjects.includes("own"),
          dates: [date], nights: q.nights, intlNights: q.nights, adults: q.adults,
          cacheHours: 0, force: true, maxCalls: 200, allowBooking: true,
          deadline: Date.now() + 135_000, trigger: "instant", markets: [market],
        });
      } catch (e) {
        failure = e instanceof Error ? e.message : String(e);
        console.error("instant run failed", failure);
      }
      const { data: rows } = await admin.from("competitor_price_snapshots")
        .select("subject_type, competitor_id, source, source_adapter, room_name, board_type, refundable, price_per_night, price_total, no_availability, min_stay_nights, queried_nights, fetched_at, raw")
        .eq("business_id", business_id).eq("checkin", date).eq("market", market).eq("nights", q.nights)
        .eq("fetch_trigger", "instant").gte("fetched_at", t0).limit(2000);
      const got = new Set((rows ?? []).map((r: any) => (r.subject_type === "own" ? "own" : r.competitor_id)));
      const missing = subjects.filter((s) => !got.has(s));
      await refund(missing.length, `İade: ${date} ${market === "domestic" ? "yurt içi" : "uluslararası"} — ${missing.length} otel için cevap alınamadı`);
      return json({
        date, market, refunded: missing.length, missing, failure,
        calls: result?.calls ?? 0, cost_usd: result?.cost_usd ?? 0, errors: result?.errors ?? [],
        rows: (rows ?? []).map((r: any) => ({ ...r, raw: undefined, reason: r.raw?.reason ?? null })),
      });
    }

    if (action === "finish") {
      if (q.status === "running") {
        const all = q.dates.flatMap((d: string) => q.markets.map((m: string) => `${d}|${m}`));
        const undone = all.filter((c: string) => !q.done_chunks.includes(c)).length;
        await refund(undone * subjects.length, `İade: ${undone} parça çalıştırılmadı`);
        await admin.from("price_instant_queries").update({ status: "done", finished_at: new Date().toISOString() }).eq("id", query_id);
      }
      const { data: fin } = await admin.from("price_instant_queries").select("credits, refunded").eq("id", query_id).single();
      return json({ ok: true, credits: fin?.credits, refunded: fin?.refunded, balance: await balance() });
    }

    return json({ error: "Bilinmeyen işlem" }, 400);
  } catch (e) {
    console.error("instant-price-query error", e);
    return json({ error: e instanceof Error ? e.message : "Beklenmeyen hata" }, 500);
  }
});
