// Admin-only overview of Apify scraping activity & admin emails.
// Returns aggregated logs from integration_logs (provider=apify) plus
// a list of recent admin notification emails (Resend logs are not stored,
// so we surface a synthetic "expected_email" entry per successful scrape).

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const ADMIN_EMAIL = "metecorukbasari@gmail.com";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing authorization" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    // Verify the caller and ensure they are the designated admin email.
    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: authError } = await userClient.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if ((user.email || "").toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(supabaseUrl, serviceKey);

    const url = new URL(req.url);
    const days = Math.min(90, Math.max(1, parseInt(url.searchParams.get("days") || "7", 10)));
    const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

    // 1) All Apify integration_logs in window
    const { data: logs, error: logsErr } = await supabase
      .from("integration_logs")
      .select("id, business_id, provider, action, status, http_status, error_code, error_message, meta, created_at")
      .eq("provider", "apify")
      .gte("created_at", cutoff)
      .order("created_at", { ascending: false })
      .limit(1000);
    if (logsErr) throw logsErr;

    // 2) Resolve business names
    const bizIds = Array.from(new Set((logs || []).map((l) => l.business_id).filter(Boolean)));
    let businessMap = new Map<string, { name: string; city: string | null; user_id: string }>();
    if (bizIds.length) {
      const { data: bizs } = await supabase
        .from("businesses")
        .select("id, name, city, user_id")
        .in("id", bizIds);
      for (const b of bizs || []) {
        businessMap.set(b.id, { name: b.name, city: b.city, user_id: b.user_id });
      }
    }

    // 3) Aggregations
    const totals = {
      total_runs: logs?.length || 0,
      success: 0,
      skipped: 0,
      failed: 0,
      total_inserted: 0,
      total_updated: 0,
      total_fetched: 0,
    };
    const byPlatform: Record<string, { runs: number; inserted: number; updated: number; skipped_runs: number }> = {};
    const byBusiness: Record<string, { name: string; runs: number; inserted: number; updated: number }> = {};

    for (const l of logs || []) {
      const meta = (l.meta as any) || {};
      const fetched = Number(meta.fetched ?? 0);
      const inserted = Number(meta.inserted ?? 0);
      const updated = Number(meta.updated ?? 0);

      if (l.status === "success") totals.success += 1;
      else if (l.status === "skipped") totals.skipped += 1;
      else totals.failed += 1;

      totals.total_inserted += inserted;
      totals.total_updated += updated;
      totals.total_fetched += fetched;

      const platform = String(l.action || "").replace(/_reviews_fetch$/, "") || "unknown";
      if (!byPlatform[platform]) byPlatform[platform] = { runs: 0, inserted: 0, updated: 0, skipped_runs: 0 };
      byPlatform[platform].runs += 1;
      byPlatform[platform].inserted += inserted;
      byPlatform[platform].updated += updated;
      if (l.status === "skipped") byPlatform[platform].skipped_runs += 1;

      const bizName = businessMap.get(l.business_id)?.name || l.business_id;
      if (!byBusiness[l.business_id]) byBusiness[l.business_id] = { name: bizName, runs: 0, inserted: 0, updated: 0 };
      byBusiness[l.business_id].runs += 1;
      byBusiness[l.business_id].inserted += inserted;
      byBusiness[l.business_id].updated += updated;
    }

    // 4) Enrich logs with business name + estimated email status
    const enrichedLogs = (logs || []).map((l) => {
      const biz = businessMap.get(l.business_id);
      const meta = (l.meta as any) || {};
      // Admin email is sent only on successful runs (see notifyAdmin).
      const adminEmailSent = l.status === "success";
      return {
        id: l.id,
        created_at: l.created_at,
        business_id: l.business_id,
        business_name: biz?.name || "(unknown)",
        business_city: biz?.city || null,
        platform: String(l.action || "").replace(/_reviews_fetch$/, ""),
        status: l.status,
        fetched: Number(meta.fetched ?? 0),
        inserted: Number(meta.inserted ?? 0),
        updated: Number(meta.updated ?? 0),
        skipped: Number(meta.skipped ?? 0),
        skip_reason: meta.reason || null,
        last_run_at: meta.last_run_at || null,
        error_message: l.error_message,
        admin_email_sent: adminEmailSent,
        admin_email_to: adminEmailSent ? ADMIN_EMAIL : null,
      };
    });

    return new Response(
      JSON.stringify({
        window_days: days,
        admin_email: ADMIN_EMAIL,
        totals,
        by_platform: byPlatform,
        by_business: Object.entries(byBusiness)
          .map(([id, v]) => ({ business_id: id, ...v }))
          .sort((a, b) => b.runs - a.runs),
        logs: enrichedLogs,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e: any) {
    console.error("admin-apify-overview error:", e);
    return new Response(JSON.stringify({ error: e.message || "Internal error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
