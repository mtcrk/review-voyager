import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const CACHE_HOURS = 6;
const PERF_API_BASE =
  "https://businessprofileperformance.googleapis.com/v1";

interface DateObj {
  year: number;
  month: number;
  day: number;
}

function toDateObj(d: Date): DateObj {
  return {
    year: d.getFullYear(),
    month: d.getMonth() + 1,
    day: d.getDate(),
  };
}

function dateStr(y: number, m: number, d: number): string {
  return `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

// ── Token refresh ──────────────────────────────────────────────
async function getValidAccessToken(
  adminClient: ReturnType<typeof createClient>,
  businessId: string
): Promise<string> {
  const { data: creds, error } = await adminClient
    .from("business_credentials")
    .select("*")
    .eq("business_id", businessId)
    .single();

  if (error || !creds?.google_refresh_token) {
    throw new Error("Google bağlantısı bulunamadı. Lütfen önce Google Business hesabınızı bağlayın.");
  }

  // Always refresh to ensure a valid token
  const clientId = Deno.env.get("GOOGLE_BUSINESS_CLIENT_ID");
  const clientSecret = Deno.env.get("GOOGLE_BUSINESS_CLIENT_SECRET");
  if (!clientId || !clientSecret) {
    throw new Error("Google OAuth credentials not configured");
  }

  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: creds.google_refresh_token,
      client_id: clientId,
      client_secret: clientSecret,
    }),
  });

  if (!tokenRes.ok) {
    const err = await tokenRes.text();
    console.error("Token refresh failed:", err);
    throw new Error("Google token yenileme başarısız. Lütfen Google bağlantınızı yenileyin.");
  }

  const tokenData = await tokenRes.json();
  return tokenData.access_token as string;
}

// ── Fetch daily metrics ────────────────────────────────────────
async function fetchDailyMetrics(
  locationId: string,
  accessToken: string,
  startDate: DateObj,
  endDate: DateObj
) {
  const metrics = [
    "BUSINESS_IMPRESSIONS_DESKTOP_MAPS",
    "BUSINESS_IMPRESSIONS_DESKTOP_SEARCH",
    "BUSINESS_IMPRESSIONS_MOBILE_MAPS",
    "BUSINESS_IMPRESSIONS_MOBILE_SEARCH",
    "WEBSITE_CLICKS",
    "CALL_CLICKS",
    "BUSINESS_DIRECTION_REQUESTS",
    "BUSINESS_BOOKINGS",
    "BUSINESS_FOOD_ORDERS",
    "BUSINESS_CONVERSATIONS",
  ];

  const params = new URLSearchParams();
  metrics.forEach((m) => params.append("dailyMetrics", m));
  params.set("dailyRange.start_date.year", String(startDate.year));
  params.set("dailyRange.start_date.month", String(startDate.month));
  params.set("dailyRange.start_date.day", String(startDate.day));
  params.set("dailyRange.end_date.year", String(endDate.year));
  params.set("dailyRange.end_date.month", String(endDate.month));
  params.set("dailyRange.end_date.day", String(endDate.day));

  const locPath = locationId.startsWith("locations/") ? locationId : `locations/${locationId}`;
  const url = `${PERF_API_BASE}/${locPath}:fetchMultiDailyMetricsTimeSeries?${params}`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);

  try {
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${accessToken}` },
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (res.status === 429) {
      const retryAfter = res.headers.get("retry-after");
      await res.text();
      throw new Error(`Rate limit. Retry after ${retryAfter || "60"}s`);
    }
    if (res.status === 403) {
      const body = await res.text();
      console.error("Daily metrics 403 body:", body);
      throw new Error(body.includes("SERVICE_DISABLED")
        ? "Google Performance API bu OAuth projesinde aktif değil."
        : body.includes("PERMISSION_DENIED") || body.includes("The caller does not have permission")
          ? "Bu Google hesabı/lokasyon için Performance verisi erişimi reddedildi."
          : "Bu lokasyon için Performance API erişiminiz yok.");
    }
    if (res.status === 401) {
      await res.text();
      throw new Error("TOKEN_EXPIRED");
    }
    if (!res.ok) {
      const body = await res.text();
      throw new Error(`Daily metrics API error [${res.status}]: ${body}`);
    }

    return await res.json();
  } catch (e) {
    clearTimeout(timeout);
    if (e instanceof DOMException && e.name === "AbortError") {
      throw new Error("Google Performance API isteği zaman aşımına uğradı (10s).");
    }
    throw e;
  }
}

// ── Fetch search keywords ──────────────────────────────────────
async function fetchSearchKeywords(
  locationId: string,
  accessToken: string,
  startMonth: { year: number; month: number },
  endMonth: { year: number; month: number }
) {
  const params = new URLSearchParams();
  params.set("monthly_range.start_month.year", String(startMonth.year));
  params.set("monthly_range.start_month.month", String(startMonth.month));
  params.set("monthly_range.end_month.year", String(endMonth.year));
  params.set("monthly_range.end_month.month", String(endMonth.month));

  const locPath = locationId.startsWith("locations/") ? locationId : `locations/${locationId}`;
  const url = `${PERF_API_BASE}/${locPath}/searchkeywords/impressions/monthly?${params}`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);

  try {
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${accessToken}` },
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (res.status === 429) {
      await res.text();
      throw new Error("Rate limit on search keywords");
    }
    if (res.status === 403 || res.status === 401) {
      const body = await res.text();
      console.error(`Search keywords ${res.status} body:`, body);
      return { searchKeywordsCounts: [] };
    }
    if (!res.ok) {
      const body = await res.text();
      console.error("Search keywords error:", body);
      return { searchKeywordsCounts: [] };
    }

    return await res.json();
  } catch (e) {
    clearTimeout(timeout);
    console.error("Search keywords fetch failed:", e);
    return { searchKeywordsCounts: [] };
  }
}

// ── Parse helpers ──────────────────────────────────────────────
function parseDailyMetrics(raw: any) {
  const metricMap: Record<string, string> = {
    BUSINESS_IMPRESSIONS_DESKTOP_MAPS: "desktop_maps",
    BUSINESS_IMPRESSIONS_DESKTOP_SEARCH: "desktop_search",
    BUSINESS_IMPRESSIONS_MOBILE_MAPS: "mobile_maps",
    BUSINESS_IMPRESSIONS_MOBILE_SEARCH: "mobile_search",
    WEBSITE_CLICKS: "website_clicks",
    CALL_CLICKS: "call_clicks",
    BUSINESS_DIRECTION_REQUESTS: "direction_requests",
    BUSINESS_BOOKINGS: "bookings",
    BUSINESS_FOOD_ORDERS: "food_orders",
    BUSINESS_CONVERSATIONS: "conversations",
  };

  const impressions: Record<string, Array<{ date: string; value: number }>> = {};
  const actions: Record<string, Array<{ date: string; value: number }>> = {};

  const impressionKeys = new Set([
    "desktop_maps", "desktop_search", "mobile_maps", "mobile_search",
  ]);

  const series = raw?.multiDailyMetricTimeSeries || [];
  for (const s of series) {
    const metricName = s.dailyMetric;
    const key = metricMap[metricName];
    if (!key) continue;

    const points: Array<{ date: string; value: number }> = [];
    const tsData = s.timeSeries?.datedValues || [];
    for (const dv of tsData) {
      const d = dv.date;
      if (!d) continue;
      points.push({
        date: dateStr(d.year, d.month, d.day),
        value: parseInt(dv.value || "0", 10),
      });
    }

    if (impressionKeys.has(key)) {
      impressions[key] = points;
    } else {
      actions[key] = points;
    }
  }

  return { impressions, actions };
}

function parseSearchKeywords(raw: any) {
  const counts = raw?.searchKeywordsCounts || [];
  const aggregated: Record<string, number> = {};

  for (const entry of counts) {
    const kw = entry?.searchKeyword || "unknown";
    const impressions =
      entry?.insightsValue?.value
        ? parseInt(entry.insightsValue.value, 10)
        : entry?.insightsValue?.threshold || 0;
    aggregated[kw] = (aggregated[kw] || 0) + impressions;
  }

  return Object.entries(aggregated)
    .map(([keyword, impressions]) => ({ keyword, impressions }))
    .sort((a, b) => b.impressions - a.impressions);
}

function buildSummary(
  impressions: Record<string, Array<{ date: string; value: number }>>,
  actions: Record<string, Array<{ date: string; value: number }>>,
  keywords: Array<{ keyword: string; impressions: number }>,
  periodStart: string,
  periodEnd: string
) {
  let totalImpressions = 0;
  for (const arr of Object.values(impressions)) {
    for (const p of arr) totalImpressions += p.value;
  }
  let totalActions = 0;
  for (const arr of Object.values(actions)) {
    for (const p of arr) totalActions += p.value;
  }

  return {
    totalImpressions,
    totalActions,
    topKeyword: keywords[0]?.keyword || null,
    periodStart,
    periodEnd,
  };
}

// ── Main handler ───────────────────────────────────────────────
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // User client for auth check
    const userClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: userError } = await userClient.auth.getUser();
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Admin client for credentials
    const adminClient = createClient(supabaseUrl, serviceKey);

    const { business_id } = await req.json();
    if (!business_id) {
      return new Response(
        JSON.stringify({ error: "business_id required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get business info
    const { data: business, error: bizErr } = await userClient
      .from("businesses")
      .select("id, google_location_id, google_account_id")
      .eq("id", business_id)
      .single();

    if (bizErr || !business?.google_location_id) {
      return new Response(
        JSON.stringify({ error: "Google Business bağlantısı bulunamadı." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const locationId = business.google_location_id;

    // Date ranges
    const now = new Date();
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const startDate = toDateObj(thirtyDaysAgo);
    const endDate = toDateObj(now);
    const periodStart = dateStr(startDate.year, startDate.month, startDate.day);
    const periodEnd = dateStr(endDate.year, endDate.month, endDate.day);

    // Check cache (6 hours)
    const cacheThreshold = new Date(now.getTime() - CACHE_HOURS * 60 * 60 * 1000).toISOString();
    const { data: cached } = await adminClient
      .from("performance_metrics_cache")
      .select("*")
      .eq("location_id", locationId)
      .eq("period_start", periodStart)
      .eq("period_end", periodEnd)
      .gte("fetched_at", cacheThreshold)
      .order("fetched_at", { ascending: false })
      .limit(1)
      .single();

    if (cached) {
      console.log("Returning cached performance metrics");
      return new Response(
        JSON.stringify({
          dailyMetrics: cached.metric_data,
          searchKeywords: cached.search_keywords,
          summary: buildSummary(
            (cached.metric_data as any)?.impressions || {},
            (cached.metric_data as any)?.actions || {},
            (cached.search_keywords as any[]) || [],
            periodStart,
            periodEnd
          ),
          cached: true,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get access token
    const accessToken = await getValidAccessToken(adminClient, business_id);

    // Search keywords month range (3 months)
    const threeMonthsAgo = new Date(now);
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

    // Parallel API calls
    const [dailyRaw, keywordsRaw] = await Promise.all([
      fetchDailyMetrics(locationId, accessToken, startDate, endDate),
      fetchSearchKeywords(
        locationId,
        accessToken,
        { year: threeMonthsAgo.getFullYear(), month: threeMonthsAgo.getMonth() + 1 },
        { year: now.getFullYear(), month: now.getMonth() + 1 }
      ),
    ]);

    // Parse
    const { impressions, actions } = parseDailyMetrics(dailyRaw);
    const searchKeywords = parseSearchKeywords(keywordsRaw);
    const summary = buildSummary(impressions, actions, searchKeywords, periodStart, periodEnd);

    const metricData = { impressions, actions };

    // Cache result
    await adminClient.from("performance_metrics_cache").insert({
      location_id: locationId,
      business_id: business_id,
      metric_data: metricData,
      search_keywords: searchKeywords,
      period_start: periodStart,
      period_end: periodEnd,
    });

    return new Response(
      JSON.stringify({
        dailyMetrics: metricData,
        searchKeywords,
        summary,
        cached: false,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Performance metrics error:", err);
    const message = err instanceof Error ? err.message : "Bilinmeyen hata";
    const status =
      message === "Unauthorized"
        ? 401
        : message === "Google bağlantısı bulunamadı. Lütfen önce Google Business hesabınızı bağlayın."
          ? 400
          : message === "Bu lokasyon için Performance API erişiminiz yok."
            ? 403
            : message.includes("Google bağlantınızı yenileyin")
              ? 401
              : message.includes("zaman aşımına uğradı")
                ? 504
                : 500;
    return new Response(
      JSON.stringify({ error: message }),
      { status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
