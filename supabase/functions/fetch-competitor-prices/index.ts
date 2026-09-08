import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const CACHE_HOURS = 6;

function addDays(iso: string, n: number) {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

/** Basit isim benzerliği: normalize edilmiş token kesişimi. */
function norm(s: string) {
  return s
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}
function similarity(a: string, b: string) {
  const ta = new Set(norm(a).split(" ").filter(Boolean));
  const tb = new Set(norm(b).split(" ").filter(Boolean));
  if (!ta.size || !tb.size) return 0;
  let hit = 0;
  for (const t of ta) if (tb.has(t)) hit++;
  return hit / Math.max(ta.size, tb.size);
}

type PriceRow = {
  source: string;
  price: number;
  is_official: boolean;
  is_ad: boolean;
  num_guests: number | null;
  free_cancellation: boolean | null;
  raw: unknown;
};

function extractPrice(row: any): number | null {
  const t = row?.total_rate?.extracted_lowest;
  if (typeof t === "number" && t > 0) return t;
  const p = row?.rate_per_night?.extracted_lowest;
  if (typeof p === "number" && p > 0) return p;
  return null;
}

function mapRows(list: any[], isAd: boolean): PriceRow[] {
  const out: PriceRow[] = [];
  for (const row of list ?? []) {
    const price = extractPrice(row);
    if (price == null) continue;
    out.push({
      source: String(row?.source ?? "Bilinmeyen kaynak"),
      price,
      is_official: !!row?.official,
      is_ad: isAd,
      num_guests: typeof row?.num_guests === "number" ? row.num_guests : null,
      free_cancellation:
        typeof row?.free_cancellation === "boolean" ? row.free_cancellation : null,
      raw: row,
    });
  }
  return out;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const SERPAPI_API_KEY = Deno.env.get("SERPAPI_API_KEY");
    if (!SERPAPI_API_KEY) {
      return json({ error: "SERPAPI_API_KEY tanımlı değil" }, 500);
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const authHeader = req.headers.get("Authorization") ?? "";
    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const {
      data: { user },
    } = await userClient.auth.getUser();
    if (!user) return json({ error: "Oturum doğrulanamadı" }, 401);

    const admin = createClient(supabaseUrl, serviceKey);

    let body: any = {};
    try {
      body = await req.json();
    } catch {}

    const business_id = String(body?.business_id ?? "");
    const competitor_ids: string[] = Array.isArray(body?.competitor_ids)
      ? body.competitor_ids.filter((x: unknown) => typeof x === "string")
      : [];
    const checkin = String(body?.checkin ?? "");
    const nights = Math.max(1, Math.min(30, Number(body?.nights) || 1));
    const adults = Math.max(1, Math.min(10, Number(body?.adults) || 2));
    const force_refresh = body?.force_refresh === true;

    if (!business_id || !competitor_ids.length || !/^\d{4}-\d{2}-\d{2}$/.test(checkin)) {
      return json({ error: "Geçersiz istek: business_id, competitor_ids ve checkin gerekli" }, 400);
    }

    // Tenant doğrulaması — işletme bu kullanıcıya mı ait?
    const { data: biz } = await admin
      .from("businesses")
      .select("id")
      .eq("id", business_id)
      .eq("user_id", user.id)
      .maybeSingle();
    if (!biz) return json({ error: "Bu işletmeye erişiminiz yok" }, 403);

    const { data: comps, error: compErr } = await admin
      .from("ci_competitors")
      .select("id, name, serpapi_property_token")
      .eq("business_id", business_id)
      .in("id", competitor_ids);
    if (compErr) throw compErr;

    const checkout = addDays(checkin, nights);
    const cacheSince = new Date(Date.now() - CACHE_HOURS * 3600_000).toISOString();

    const results: any[] = [];

    for (const comp of comps ?? []) {
      // --- c) Cache ---
      if (!force_refresh) {
        const { data: cached } = await admin
          .from("competitor_price_snapshots")
          .select("*")
          .eq("competitor_id", comp.id)
          .eq("checkin", checkin)
          .eq("nights", nights)
          .eq("adults", adults)
          .gte("fetched_at", cacheSince)
          .order("fetched_at", { ascending: false });
        if (cached && cached.length) {
          results.push({
            competitor_id: comp.id,
            name: comp.name,
            status: "ok",
            cached: true,
            fetched_at: cached[0].fetched_at,
            prices: cached,
          });
          continue;
        }
      }

      // --- a) Token yoksa bul ---
      let token: string | null = comp.serpapi_property_token ?? null;
      if (!token) {
        const searchUrl =
          `https://serpapi.com/search.json?engine=google_hotels&q=${encodeURIComponent(comp.name)}` +
          `&gl=tr&hl=tr&currency=TRY&check_in_date=${checkin}&check_out_date=${checkout}` +
          `&adults=${adults}&api_key=${SERPAPI_API_KEY}`;
        let props: any[] = [];
        try {
          const res = await fetch(searchUrl);
          const data = await res.json();
          props = Array.isArray(data?.properties) ? data.properties : [];
        } catch (e) {
          console.error("serpapi search failed", comp.name, e);
        }
        let best: { token: string; score: number } | null = null;
        for (const p of props) {
          if (!p?.property_token) continue;
          const score = similarity(comp.name, String(p?.name ?? ""));
          if (!best || score > best.score) best = { token: String(p.property_token), score };
        }
        if (!best || best.score < 0.34) {
          results.push({ competitor_id: comp.id, name: comp.name, status: "not_found" });
          continue;
        }
        token = best.token;
        await admin
          .from("ci_competitors")
          .update({ serpapi_property_token: token })
          .eq("id", comp.id);
      }

      // --- b) Fiyatları çek ---
      const priceUrl =
        `https://serpapi.com/search.json?engine=google_hotels&property_token=${encodeURIComponent(token)}` +
        `&gl=tr&hl=tr&currency=TRY&check_in_date=${checkin}&check_out_date=${checkout}` +
        `&adults=${adults}&api_key=${SERPAPI_API_KEY}`;

      let payload: any = null;
      try {
        const res = await fetch(priceUrl);
        payload = await res.json();
      } catch (e) {
        console.error("serpapi property failed", comp.name, e);
        results.push({ competitor_id: comp.id, name: comp.name, status: "error" });
        continue;
      }

      let rows = mapRows(payload?.prices ?? [], false);
      if (!rows.length) rows = mapRows(payload?.featured_prices ?? [], true);

      if (!rows.length) {
        results.push({
          competitor_id: comp.id,
          name: comp.name,
          status: "no_prices",
          cached: false,
          prices: [],
        });
        continue;
      }

      const fetchedAt = new Date().toISOString();
      const insertRows = rows.map((r) => ({
        competitor_id: comp.id,
        business_id,
        checkin,
        nights,
        adults,
        source: r.source,
        price: r.price,
        currency: "TRY",
        is_official: r.is_official,
        is_ad: r.is_ad,
        num_guests: r.num_guests,
        free_cancellation: r.free_cancellation,
        raw: r.raw as any,
        fetched_at: fetchedAt,
      }));

      const { data: inserted, error: insErr } = await admin
        .from("competitor_price_snapshots")
        .insert(insertRows)
        .select("*");
      if (insErr) console.error("snapshot insert failed", insErr);

      results.push({
        competitor_id: comp.id,
        name: comp.name,
        status: "ok",
        cached: false,
        fetched_at: fetchedAt,
        prices: inserted ?? insertRows,
      });
    }

    return json({ checkin, checkout, nights, adults, results });
  } catch (e) {
    console.error("fetch-competitor-prices error", e);
    return json({ error: e instanceof Error ? e.message : "Beklenmeyen hata" }, 500);
  }
});
