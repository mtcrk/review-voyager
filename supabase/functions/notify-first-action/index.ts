import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const ADMIN_EMAIL = "metecoruk83@gmail.com";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { user_id, email, full_name, action } = await req.json();
    if (!user_id) {
      return new Response(JSON.stringify({ error: "user_id required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // Atomic insert — if user already notified, returns no rows
    const { data: inserted, error: insErr } = await supabase
      .from("user_first_action_notified")
      .insert({ user_id, email: email ?? null, action: action ?? "first_action" })
      .select("user_id")
      .maybeSingle();

    if (insErr) {
      // Unique violation = already notified, that's fine
      if ((insErr as any).code === "23505") {
        return new Response(JSON.stringify({ already_notified: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw insErr;
    }

    if (!inserted) {
      return new Response(JSON.stringify({ already_notified: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Send notification email via Resend
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (RESEND_API_KEY) {
      const html = `
        <div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;padding:24px;">
          <h2 style="color:#7A5AF8;margin:0 0 12px;">Yeni kullan\u0131c\u0131 aktivite</h2>
          <p style="color:#333;font-size:14px;line-height:1.5;">
            Bir kullan\u0131c\u0131 VoyageRespond'da ilk aksiyonunu ger\u00e7ekle\u015ftirdi.
          </p>
          <table style="font-size:14px;color:#333;border-collapse:collapse;">
            <tr><td style="padding:4px 8px;color:#666;">\u0130sim:</td><td style="padding:4px 8px;">${full_name ?? "-"}</td></tr>
            <tr><td style="padding:4px 8px;color:#666;">Email:</td><td style="padding:4px 8px;">${email ?? "-"}</td></tr>
            <tr><td style="padding:4px 8px;color:#666;">User ID:</td><td style="padding:4px 8px;font-family:monospace;font-size:12px;">${user_id}</td></tr>
            <tr><td style="padding:4px 8px;color:#666;">Aksiyon:</td><td style="padding:4px 8px;">${action ?? "first_action"}</td></tr>
            <tr><td style="padding:4px 8px;color:#666;">Zaman:</td><td style="padding:4px 8px;">${new Date().toISOString()}</td></tr>
          </table>
          <p style="color:#999;font-size:12px;margin-top:24px;">Bu mail kullan\u0131c\u0131 ba\u015f\u0131na yaln\u0131zca 1 kez g\u00f6nderilir.</p>
        </div>`;

      const r = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "VoyageRespond <notify@voyagerespond.com>",
          to: [ADMIN_EMAIL],
          subject: `\ud83d\udfe3 Yeni aktivite: ${full_name ?? email ?? user_id}`,
          html,
        }),
      });
      if (!r.ok) {
        console.error("Resend error", r.status, await r.text());
      }
    }

    return new Response(JSON.stringify({ notified: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("notify-first-action error", e);
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});