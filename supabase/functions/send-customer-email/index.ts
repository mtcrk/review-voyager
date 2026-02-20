import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "npm:resend@4.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface SendEmailRequest {
  business_id: string;
  campaign_id?: string;
  recipients: { email: string; name?: string; contact_id?: string }[];
  subject: string;
  body_html: string;
  reply_to?: string;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const resendApiKey = Deno.env.get("RESEND_API_KEY");

    if (!resendApiKey) {
      throw new Error("RESEND_API_KEY is not configured");
    }

    const resend = new Resend(resendApiKey);
    const supabase = createClient(supabaseUrl, serviceKey);

    // Verify JWT
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header");

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) throw new Error("Unauthorized");

    const body: SendEmailRequest = await req.json();
    const { business_id, campaign_id, recipients, subject, body_html, reply_to } = body;

    if (!business_id || !recipients?.length || !subject || !body_html) {
      throw new Error("Missing required fields: business_id, recipients, subject, body_html");
    }

    // Verify user owns the business
    const { data: business, error: bizError } = await supabase
      .from("businesses")
      .select("id, name, user_id")
      .eq("id", business_id)
      .eq("user_id", user.id)
      .maybeSingle();

    if (bizError || !business) throw new Error("Business not found or access denied");

    // Update campaign status if provided
    if (campaign_id) {
      await supabase
        .from("email_campaigns")
        .update({ status: "sending", recipient_count: recipients.length })
        .eq("id", campaign_id);
    }

    let sentCount = 0;
    let failedCount = 0;

    for (const recipient of recipients) {
      try {
        const { data: emailResult, error: sendError } = await resend.emails.send({
          from: `${business.name} <notify@voyagerespond.com>`,
          to: [recipient.email],
          subject,
          html: body_html,
          reply_to: reply_to || undefined,
        });

        if (sendError) throw sendError;

        // Log success
        await supabase.from("email_logs").insert({
          campaign_id: campaign_id || null,
          business_id,
          contact_id: recipient.contact_id || null,
          recipient_email: recipient.email,
          subject,
          status: "sent",
          resend_id: emailResult?.id || null,
        });

        sentCount++;
      } catch (err) {
        failedCount++;
        console.error(`Failed to send to ${recipient.email}:`, err);

        await supabase.from("email_logs").insert({
          campaign_id: campaign_id || null,
          business_id,
          contact_id: recipient.contact_id || null,
          recipient_email: recipient.email,
          subject,
          status: "failed",
          error_message: err instanceof Error ? err.message : "Unknown error",
        });
      }
    }

    // Update campaign final status
    if (campaign_id) {
      await supabase
        .from("email_campaigns")
        .update({
          status: failedCount === recipients.length ? "failed" : "sent",
          sent_count: sentCount,
          failed_count: failedCount,
          sent_at: new Date().toISOString(),
        })
        .eq("id", campaign_id);
    }

    return new Response(
      JSON.stringify({ success: true, sentCount, failedCount }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error sending customer email:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
