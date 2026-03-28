const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const ADMIN_EMAIL = "metecorukbasari@gmail.com";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { name, business_name, contact } = await req.json();

    if (!name || !business_name || !contact) {
      return new Response(JSON.stringify({ error: "Missing fields" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (!RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY not configured");
    }

    const formattedDate = new Date().toLocaleString("tr-TR", {
      timeZone: "Europe/Istanbul",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #7C3AED 0%, #4F46E5 100%); border-radius: 12px; padding: 30px; color: white; margin-bottom: 20px;">
          <h1 style="margin: 0 0 5px 0; font-size: 20px;">📩 Yeni Demo Talebi!</h1>
          <p style="margin: 0; opacity: 0.8; font-size: 14px;">VoyageRespond demo formu dolduruldu</p>
        </div>
        <div style="background: #f8f9fa; border-radius: 12px; padding: 24px;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; color: #666; font-size: 14px;">İsim</td>
              <td style="padding: 8px 0; font-weight: 600; font-size: 14px;">${name}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #666; font-size: 14px;">İşletme Adı</td>
              <td style="padding: 8px 0; font-weight: 600; font-size: 14px;">${business_name}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #666; font-size: 14px;">İletişim</td>
              <td style="padding: 8px 0; font-weight: 600; font-size: 14px;">${contact}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #666; font-size: 14px;">Tarih</td>
              <td style="padding: 8px 0; font-weight: 600; font-size: 14px;">${formattedDate}</td>
            </tr>
          </table>
        </div>
        <p style="text-align: center; color: #999; font-size: 12px; margin-top: 20px;">
          VoyageRespond Bildirim Sistemi
        </p>
      </div>
    `;

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "VoyageRespond <notify@voyagerespond.com>",
        to: [ADMIN_EMAIL],
        subject: `📩 Demo Talebi: ${name} — ${business_name}`,
        html: emailHtml,
      }),
    });

    const result = await res.json();
    console.log("Demo notification sent:", result);

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
