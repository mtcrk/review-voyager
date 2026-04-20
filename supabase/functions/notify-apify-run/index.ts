// Lightweight per-run admin notification for Apify/TripAdvisor scrape triggers.
// Sends a short email to the admin every time a scrape function is invoked
// (success, skipped, or error) so cost & frequency can be monitored.

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const ADMIN_EMAIL = "metecorukbasari@gmail.com";

interface RunPayload {
  platform: string;
  business_id: string;
  business_name?: string;
  status: "success" | "skipped" | "error" | "started";
  reason?: string;
  fetched?: number;
  inserted?: number;
  duration_ms?: number;
  estimated_cost_usd?: number;
  error_message?: string;
  triggered_by?: string; // cron / manual / n8n / unknown
}

function statusBadge(status: string): string {
  const colors: Record<string, string> = {
    success: "#16a34a",
    skipped: "#6b7280",
    error: "#dc2626",
    started: "#2563eb",
  };
  const labels: Record<string, string> = {
    success: "✅ BAŞARILI",
    skipped: "⏭️ ATLANDI",
    error: "❌ HATA",
    started: "▶️ BAŞLADI",
  };
  return `<span style="background:${colors[status] || "#6b7280"};color:#fff;padding:3px 10px;border-radius:4px;font-size:12px;font-weight:600;">${labels[status] || status.toUpperCase()}</span>`;
}

function buildHtml(p: RunPayload): string {
  const ts = new Date().toLocaleString("tr-TR", { timeZone: "Europe/Istanbul" });
  const rows: Array<[string, string]> = [
    ["Platform", `<strong>${p.platform}</strong>`],
    ["İşletme", p.business_name || p.business_id],
    ["Durum", statusBadge(p.status)],
    ["Zaman", ts],
  ];
  if (p.triggered_by) rows.push(["Tetikleyen", p.triggered_by]);
  if (p.reason) rows.push(["Sebep", p.reason]);
  if (typeof p.fetched === "number") rows.push(["Çekilen", String(p.fetched)]);
  if (typeof p.inserted === "number") rows.push(["Yeni eklenen", String(p.inserted)]);
  if (typeof p.duration_ms === "number") rows.push(["Süre", `${(p.duration_ms / 1000).toFixed(1)}s`]);
  if (typeof p.estimated_cost_usd === "number") rows.push(["Tahmini maliyet", `$${p.estimated_cost_usd.toFixed(3)}`]);
  if (p.error_message) rows.push(["Hata", `<code style="color:#dc2626;">${p.error_message.slice(0, 300)}</code>`]);

  const rowsHtml = rows
    .map(
      ([k, v]) =>
        `<tr><td style="padding:6px 12px;color:#6b7280;font-size:13px;border-bottom:1px solid #f3f4f6;">${k}</td><td style="padding:6px 12px;font-size:13px;border-bottom:1px solid #f3f4f6;">${v}</td></tr>`,
    )
    .join("");

  return `<!doctype html><html><body style="font-family:-apple-system,Segoe UI,Roboto,Arial,sans-serif;background:#f9fafb;padding:20px;margin:0;">
<div style="max-width:560px;margin:0 auto;background:#fff;border:1px solid #e5e7eb;border-radius:8px;overflow:hidden;">
  <div style="padding:14px 18px;background:#111827;color:#fff;font-size:14px;font-weight:600;">🔔 Apify Run — ${p.platform}</div>
  <table style="width:100%;border-collapse:collapse;">${rowsHtml}</table>
  <div style="padding:10px 18px;background:#f9fafb;color:#9ca3af;font-size:11px;">VoyageRespond · Apify Cost Monitor</div>
</div></body></html>`;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const payload = (await req.json()) as RunPayload;
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (!RESEND_API_KEY) {
      return new Response(JSON.stringify({ error: "RESEND_API_KEY missing" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const subject = `[Apify ${payload.status.toUpperCase()}] ${payload.platform} · ${payload.business_name || payload.business_id.slice(0, 8)}`;

    const resp = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "VoyageRespond <notify@voyagerespond.com>",
        to: [ADMIN_EMAIL],
        subject,
        html: buildHtml(payload),
      }),
    });

    if (!resp.ok) {
      const errText = await resp.text();
      console.error("notify-apify-run resend error:", errText);
      return new Response(JSON.stringify({ error: errText }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    console.error("notify-apify-run error:", err);
    return new Response(JSON.stringify({ error: err?.message || "unknown" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
