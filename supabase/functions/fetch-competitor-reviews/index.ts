import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const APIFY_BASE = "https://api.apify.com/v2";
const ACTOR_ID = "tri_angle~hotel-review-aggregator";
const SMART_SKIP_HOURS = 24 * 7; // 7 days

type Started = { competitor_id: string; name: string; run_id: string; place_id: string };
type Skipped = { competitor_id: string; name: string; reason: string };

function isoHoursAgo(h: number) {
  return new Date(Date.now() - h * 3600_000).toISOString();
}

async function notifyAdmin(opts: {
  name: string;
  competitorId: string;
  placeId: string;
  runId: string;
}) {
  const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
  if (!RESEND_API_KEY) return;
  const subject = `[Apify] competitor • ${opts.name}`;
  const html = `
    <div style="font-family:Arial,sans-serif;max-width:560px;color:#111">
      <h2 style="margin:0 0 12px">Competitor Apify Run Started</h2>
      <table style="border-collapse:collapse;width:100%;font-size:14px">
        <tr><td style="padding:6px 8px;background:#f6f6f7"><b>Rakip</b></td><td style="padding:6px 8px">${opts.name}</td></tr>
        <tr><td style="padding:6px 8px;background:#f6f6f7"><b>Competitor ID</b></td><td style="padding:6px 8px"><code>${opts.competitorId}</code></td></tr>
        <tr><td style="padding:6px 8px;background:#f6f6f7"><b>Place ID</b></td><td style="padding:6px 8px"><code>${opts.placeId}</code></td></tr>
        <tr><td style="padding:6px 8px;background:#f6f6f7"><b>Run ID</b></td><td style="padding:6px 8px"><code>${opts.runId}</code></td></tr>
        <tr><td style="padding:6px 8px;background:#f6f6f7"><b>Zaman</b></td><td style="padding:6px 8px">${new Date().toLocaleString("tr-TR", { timeZone: "Europe/Istanbul" })}</td></tr>
      </table>
      <p style="margin-top:16px;color:#888;font-size:12px">VoyageRespond • Apify Monitor (Competitor)</p>
    </div>`;
  try {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: "VoyageRespond Monitor <notify@voyagerespond.com>",
        reply_to: "metecorukbasari@gmail.com",
        to: ["metecorukbasari@gmail.com"],
        subject,
        html,
      }),
    });
  } catch (e) {
    console.error("notifyAdmin (competitor) failed:", e);
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const APIFY_API_TOKEN = Deno.env.get("APIFY_API_TOKEN");
    if (!APIFY_API_TOKEN) {
      return new Response(JSON.stringify({ error: "APIFY_API_TOKEN not configured" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const admin = createClient(supabaseUrl, serviceKey);

    const ingestUrl = `${supabaseUrl}/functions/v1/ingest-apify-reviews`;

    let body: any = {};
    try { body = await req.json(); } catch {}
    const { competitor_id, business_id, force } = body || {};

    if (!competitor_id && !business_id) {
      return new Response(JSON.stringify({ error: "competitor_id or business_id required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let query = admin.from("ci_competitors").select("id, name, place_id, last_scraped_at, business_id");
    if (competitor_id) {
      query = query.eq("id", competitor_id);
    } else {
      query = query.eq("business_id", business_id).eq("status", "confirmed");
    }
    const { data: competitors, error: cErr } = await query;
    if (cErr) {
      return new Response(JSON.stringify({ error: cErr.message }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!competitors || competitors.length === 0) {
      return new Response(JSON.stringify({ error: "No competitors found" }), {
        status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const started: Started[] = [];
    const skipped: Skipped[] = [];
    const no_place_id: { competitor_id: string; name: string }[] = [];
    const cutoff = isoHoursAgo(SMART_SKIP_HOURS);

    // Webhook payload (base64 JSON) – attaches to each actor run.
    const webhooksParam = btoa(JSON.stringify([
      {
        eventTypes: ["ACTOR.RUN.SUCCEEDED"],
        requestUrl: ingestUrl,
      },
    ]));

    for (const c of competitors) {
      if (!c.place_id) {
        no_place_id.push({ competitor_id: c.id, name: c.name });
        continue;
      }
      if (!force && c.last_scraped_at && c.last_scraped_at > cutoff) {
        skipped.push({ competitor_id: c.id, name: c.name, reason: "within_7d_cooldown" });
        continue;
      }

      const input = {
        startIds: [c.place_id],
        providers: ["booking", "tripadvisor", "expedia", "hotels"],
        maxReviewsPerQuery: 40,
        scrapeReviewPictures: false,
        scrapeReviewResponses: false,
        proxyConfiguration: {
          useApifyProxy: true,
          apifyProxyGroups: ["RESIDENTIAL"],
          apifyProxyCountry: "TR",
        },
      };

      try {
        const resp = await fetch(
          `${APIFY_BASE}/acts/${ACTOR_ID}/runs?token=${APIFY_API_TOKEN}&webhooks=${webhooksParam}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(input),
          },
        );
        if (!resp.ok) {
          const t = await resp.text();
          console.error("Apify start failed for competitor", c.id, resp.status, t);
          await admin.from("integration_logs").insert({
            business_id: c.business_id,
            provider: "apify",
            action: "competitor_reviews_fetch",
            status: "error",
            meta: { competitor_id: c.id, place_id: c.place_id, error: t.slice(0, 500) },
          });
          skipped.push({ competitor_id: c.id, name: c.name, reason: `apify_error_${resp.status}` });
          continue;
        }
        const data = await resp.json();
        const runId = data?.data?.id;
        started.push({ competitor_id: c.id, name: c.name, run_id: runId, place_id: c.place_id });

        await admin.from("integration_logs").insert({
          business_id: c.business_id,
          provider: "apify",
          action: "competitor_reviews_fetch",
          status: "success",
          meta: { competitor_id: c.id, run_id: runId, place_id: c.place_id, ingest_url: ingestUrl },
        });

        notifyAdmin({ name: c.name, competitorId: c.id, placeId: c.place_id, runId })
          .catch((e) => console.error("notifyAdmin err:", e));
      } catch (e) {
        console.error("Start error competitor", c.id, e);
        skipped.push({ competitor_id: c.id, name: c.name, reason: "exception" });
      }
    }

    return new Response(
      JSON.stringify({ ok: true, started, skipped, no_place_id, ingest_url: ingestUrl }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    console.error("fetch-competitor-reviews error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});