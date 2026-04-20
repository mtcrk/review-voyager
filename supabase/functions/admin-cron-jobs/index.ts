import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const ADMIN_EMAIL = "metecorukbasari@gmail.com";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;

async function assertAdmin(req: Request): Promise<Response | null> {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader) {
    return new Response(JSON.stringify({ error: "No auth" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
  const userClient = createClient(SUPABASE_URL, ANON_KEY, {
    global: { headers: { Authorization: authHeader } },
  });
  const { data: userData, error } = await userClient.auth.getUser();
  if (error || !userData.user) {
    return new Response(JSON.stringify({ error: "Invalid token" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
  if (userData.user.email?.toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
    return new Response(JSON.stringify({ error: "Forbidden" }), {
      status: 403,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
  return null;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const adminCheck = await assertAdmin(req);
  if (adminCheck) return adminCheck;

  const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);
  const url = new URL(req.url);
  const action = url.searchParams.get("action") ?? "list";

  try {
    // List cron jobs
    if (action === "list" && req.method === "GET") {
      const { data, error } = await admin.rpc("admin_get_cron_jobs" as any);
      if (error) {
        // fallback raw SQL
        const { data: raw, error: rawErr } = await admin
          .from("cron_jobs_view" as any)
          .select("*");
        if (rawErr) throw error;
        return new Response(JSON.stringify({ jobs: raw ?? [] }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      return new Response(JSON.stringify({ jobs: data ?? [] }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Trigger a function manually
    if (action === "trigger" && req.method === "POST") {
      const body = await req.json().catch(() => ({}));
      const functionName = body.function_name as string;
      const queryString = (body.query_string as string) ?? "";
      if (!functionName) {
        return new Response(JSON.stringify({ error: "function_name required" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const targetUrl = `${SUPABASE_URL}/functions/v1/${functionName}${queryString ? `?${queryString}` : ""}`;
      const startedAt = Date.now();
      const resp = await fetch(targetUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
        },
        body: JSON.stringify({ triggered_at: new Date().toISOString(), manual: true }),
      });
      const durationMs = Date.now() - startedAt;
      const text = await resp.text();
      let parsed: any = null;
      try { parsed = JSON.parse(text); } catch { parsed = text; }

      return new Response(
        JSON.stringify({
          ok: resp.ok,
          status: resp.status,
          duration_ms: durationMs,
          response: parsed,
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    return new Response(JSON.stringify({ error: "Unknown action" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    console.error("admin-cron-jobs error", err);
    return new Response(JSON.stringify({ error: err?.message ?? String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
