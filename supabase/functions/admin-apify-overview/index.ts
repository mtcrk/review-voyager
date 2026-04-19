// Admin-only system-wide overview.
// Returns: Apify logs + ALL integration_logs + users + reply_logs + email_logs.
// Restricted to a single admin email.

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
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: authError } = await userClient.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if ((user.email || "").toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(supabaseUrl, serviceKey);
    const url = new URL(req.url);
    const days = Math.min(90, Math.max(1, parseInt(url.searchParams.get("days") || "7", 10)));
    const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

    // === Parallel fetches ===
    const [
      { data: integrationLogs },
      { data: replyLogs },
      { data: emailLogs },
      { data: businesses },
      { data: profiles },
      authUsersRes,
    ] = await Promise.all([
      supabase.from("integration_logs")
        .select("id, business_id, provider, action, status, http_status, error_code, error_message, meta, created_at")
        .gte("created_at", cutoff)
        .order("created_at", { ascending: false })
        .limit(2000),
      supabase.from("reply_logs")
        .select("id, business_id, user_id, review_id, reply_text, tone, reply_source, google_status, response_time_hours, created_at")
        .gte("created_at", cutoff)
        .order("created_at", { ascending: false })
        .limit(500),
      supabase.from("email_logs")
        .select("id, business_id, recipient_email, subject, status, error_message, resend_id, created_at")
        .gte("created_at", cutoff)
        .order("created_at", { ascending: false })
        .limit(500),
      supabase.from("businesses").select("id, name, city, user_id, created_at"),
      supabase.from("profiles").select("user_id, full_name, role, created_at"),
      supabase.auth.admin.listUsers({ page: 1, perPage: 1000 }),
    ]);

    // === Build maps ===
    const businessMap = new Map<string, { name: string; city: string | null; user_id: string }>();
    for (const b of businesses || []) businessMap.set(b.id, { name: b.name, city: b.city, user_id: b.user_id });

    const profileMap = new Map<string, { full_name: string; role: string }>();
    for (const p of profiles || []) profileMap.set(p.user_id, { full_name: p.full_name, role: p.role });

    const authUsers = authUsersRes.data?.users || [];
    const userMap = new Map<string, { email: string; last_sign_in_at: string | null; created_at: string }>();
    for (const u of authUsers) {
      userMap.set(u.id, {
        email: u.email || "",
        last_sign_in_at: u.last_sign_in_at || null,
        created_at: u.created_at,
      });
    }

    // === USERS view ===
    const usersBusinessCount = new Map<string, number>();
    for (const b of businesses || []) {
      usersBusinessCount.set(b.user_id, (usersBusinessCount.get(b.user_id) || 0) + 1);
    }
    const users = authUsers.map((u) => ({
      id: u.id,
      email: u.email || "",
      full_name: profileMap.get(u.id)?.full_name || "-",
      role: profileMap.get(u.id)?.role || "owner",
      created_at: u.created_at,
      last_sign_in_at: u.last_sign_in_at || null,
      business_count: usersBusinessCount.get(u.id) || 0,
    })).sort((a, b) => {
      const ad = a.last_sign_in_at ? new Date(a.last_sign_in_at).getTime() : 0;
      const bd = b.last_sign_in_at ? new Date(b.last_sign_in_at).getTime() : 0;
      return bd - ad;
    });

    // === APIFY (subset of integration logs) ===
    const apifyLogs = (integrationLogs || []).filter((l) => l.provider === "apify");
    const apifyTotals = { total_runs: apifyLogs.length, success: 0, skipped: 0, failed: 0, total_inserted: 0, total_updated: 0, total_fetched: 0 };
    const byPlatform: Record<string, { runs: number; inserted: number; updated: number; skipped_runs: number }> = {};
    const byBusiness: Record<string, { name: string; runs: number; inserted: number; updated: number }> = {};

    for (const l of apifyLogs) {
      const meta = (l.meta as any) || {};
      const fetched = Number(meta.fetched ?? 0);
      const inserted = Number(meta.inserted ?? 0);
      const updated = Number(meta.updated ?? 0);
      if (l.status === "success") apifyTotals.success += 1;
      else if (l.status === "skipped") apifyTotals.skipped += 1;
      else apifyTotals.failed += 1;
      apifyTotals.total_inserted += inserted;
      apifyTotals.total_updated += updated;
      apifyTotals.total_fetched += fetched;

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

    const enrichedApifyLogs = apifyLogs.map((l) => {
      const biz = businessMap.get(l.business_id);
      const meta = (l.meta as any) || {};
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

    // === ALL INTEGRATIONS (Apify + Google + TikTok + Firecrawl ...) ===
    const allIntegrations = (integrationLogs || []).map((l) => ({
      id: l.id,
      created_at: l.created_at,
      provider: l.provider,
      action: l.action,
      status: l.status,
      http_status: l.http_status,
      error_message: l.error_message,
      business_name: businessMap.get(l.business_id)?.name || "(unknown)",
      meta_summary: summarizeMeta(l.meta),
    }));

    const integrationsByProvider: Record<string, { total: number; success: number; failed: number; skipped: number }> = {};
    for (const l of integrationLogs || []) {
      const p = l.provider || "unknown";
      if (!integrationsByProvider[p]) integrationsByProvider[p] = { total: 0, success: 0, failed: 0, skipped: 0 };
      integrationsByProvider[p].total += 1;
      if (l.status === "success") integrationsByProvider[p].success += 1;
      else if (l.status === "skipped") integrationsByProvider[p].skipped += 1;
      else integrationsByProvider[p].failed += 1;
    }

    // === REPLY LOGS ===
    const enrichedReplyLogs = (replyLogs || []).map((r) => ({
      id: r.id,
      created_at: r.created_at,
      business_name: businessMap.get(r.business_id)?.name || "(unknown)",
      user_email: userMap.get(r.user_id)?.email || "(unknown)",
      reply_text: (r.reply_text || "").slice(0, 200),
      tone: r.tone,
      reply_source: r.reply_source,
      google_status: r.google_status,
      response_time_hours: r.response_time_hours,
    }));

    // === EMAIL LOGS ===
    const enrichedEmailLogs = (emailLogs || []).map((e) => ({
      id: e.id,
      created_at: e.created_at,
      business_name: businessMap.get(e.business_id)?.name || "(unknown)",
      recipient_email: e.recipient_email,
      subject: e.subject,
      status: e.status,
      error_message: e.error_message,
      resend_id: e.resend_id,
    }));

    return new Response(
      JSON.stringify({
        window_days: days,
        admin_email: ADMIN_EMAIL,
        apify: {
          totals: apifyTotals,
          by_platform: byPlatform,
          by_business: Object.entries(byBusiness)
            .map(([id, v]) => ({ business_id: id, ...v }))
            .sort((a, b) => b.runs - a.runs),
          logs: enrichedApifyLogs,
        },
        users: {
          total: users.length,
          list: users,
        },
        reply_logs: {
          total: enrichedReplyLogs.length,
          list: enrichedReplyLogs,
        },
        email_logs: {
          total: enrichedEmailLogs.length,
          list: enrichedEmailLogs,
        },
        integrations: {
          total: allIntegrations.length,
          by_provider: integrationsByProvider,
          list: allIntegrations,
        },
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e: any) {
    console.error("admin-apify-overview error:", e);
    return new Response(JSON.stringify({ error: e.message || "Internal error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

function summarizeMeta(meta: any): string {
  if (!meta || typeof meta !== "object") return "";
  const parts: string[] = [];
  if (meta.fetched != null) parts.push(`fetched:${meta.fetched}`);
  if (meta.inserted != null) parts.push(`inserted:${meta.inserted}`);
  if (meta.updated != null) parts.push(`updated:${meta.updated}`);
  if (meta.reason) parts.push(`reason:${meta.reason}`);
  return parts.join(" · ");
}
