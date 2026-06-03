import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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
    const { user_email, full_name, created_at } = await req.json();

    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (!RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY not configured");
    }

    const formattedDate = new Date(created_at).toLocaleString("tr-TR", {
      timeZone: "Europe/Istanbul",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); border-radius: 12px; padding: 30px; color: white; margin-bottom: 20px;">
          <h1 style="margin: 0 0 5px 0; font-size: 20px;">🎉 Yeni Kayıt!</h1>
          <p style="margin: 0; opacity: 0.8; font-size: 14px;">VoyageRespond'a yeni bir kullanıcı katıldı</p>
        </div>
        <div style="background: #f8f9fa; border-radius: 12px; padding: 24px;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; color: #666; font-size: 14px;">Ad Soyad</td>
              <td style="padding: 8px 0; font-weight: 600; font-size: 14px;">${full_name || "Belirtilmemiş"}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #666; font-size: 14px;">E-posta</td>
              <td style="padding: 8px 0; font-weight: 600; font-size: 14px;">${user_email}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #666; font-size: 14px;">Kayıt Tarihi</td>
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
        reply_to: "metecorukbasari@gmail.com",
        to: [ADMIN_EMAIL],
        subject: `🎉 Yeni Kayıt: ${full_name || user_email}`,
        html: emailHtml,
      }),
    });

    const result = await res.json();
    console.log("Email sent:", result);

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
