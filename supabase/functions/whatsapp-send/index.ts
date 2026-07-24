// deno-lint-ignore-file no-explicit-any
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { getProvider } from "../_shared/whatsapp/registry.ts";
import { estimateCost } from "../_shared/whatsapp/pricing.ts";
import type { MessageCategory, Provider } from "../_shared/whatsapp/types.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

// Single entry point for business logic to send WhatsApp messages.
// Body:
// {
//   business_id, guest_id,
//   category: 'utility' | 'marketing' | 'authentication' | 'service' | 'freeform',
//   template_id?: uuid,          // required when window is closed / marketing
//   template_params?: {..},
//   body?: string,               // used for freeform inside window
// }
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    if (req.method !== "POST") {
      return new Response(JSON.stringify({ error: "method_not_allowed" }), {
        status: 405,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const {
      business_id,
      guest_id,
      category,
      template_id,
      template_params,
      body: freeformBody,
    } = body as {
      business_id: string;
      guest_id: string;
      category: MessageCategory;
      template_id?: string;
      template_params?: Record<string, string>;
      body?: string;
    };

    if (!business_id || !guest_id || !category) {
      return new Response(JSON.stringify({ error: "missing_required_fields" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE);

    // Load guest
    const { data: guest, error: guestErr } = await supabase
      .from("guests")
      .select("id, phone_number, country_code, opted_out_at, consent_status")
      .eq("id", guest_id)
      .eq("business_id", business_id)
      .maybeSingle();
    if (guestErr) throw guestErr;
    if (!guest) {
      return new Response(JSON.stringify({ error: "guest_not_found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 1. Opt-out blocks everything
    if (guest.opted_out_at) {
      return new Response(JSON.stringify({ error: "guest_opted_out" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 2. Marketing requires explicit consent
    if (category === "marketing" && guest.consent_status !== "granted") {
      return new Response(JSON.stringify({ error: "marketing_consent_missing" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Load active channel
    const { data: channel, error: chErr } = await supabase
      .from("whatsapp_channels")
      .select("id, business_id, provider, phone_number, provider_account_ref")
      .eq("business_id", business_id)
      .eq("status", "active")
      .maybeSingle();
    if (chErr) throw chErr;
    if (!channel) {
      return new Response(JSON.stringify({ error: "no_active_channel" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 3. Determine window state
    const now = new Date();
    const { data: latestWin } = await supabase
      .from("conversation_windows")
      .select("expires_at")
      .eq("guest_id", guest_id)
      .order("expires_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    const windowOpen = !!latestWin && new Date(latestWin.expires_at) > now;

    const provider = getProvider(channel.provider as Provider);

    // 4. Decide freeform vs template
    let sendResult;
    let bodyTextForLog = "";
    let templateIdForLog: string | null = null;

    if (windowOpen && category !== "marketing" && category !== "authentication" && freeformBody) {
      // Freeform allowed inside window (except marketing/authentication which always require template)
      sendResult = await provider.sendFreeform(channel, guest.phone_number, freeformBody);
      bodyTextForLog = freeformBody;
    } else {
      // Template required
      if (!template_id) {
        return new Response(JSON.stringify({ error: "template_required" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const { data: tpl, error: tplErr } = await supabase
        .from("whatsapp_templates")
        .select("id, name, language, category, body_text, provider_template_ref, status")
        .eq("id", template_id)
        .eq("business_id", business_id)
        .maybeSingle();
      if (tplErr) throw tplErr;
      if (!tpl || tpl.status !== "approved") {
        return new Response(JSON.stringify({ error: "template_not_approved" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (category !== tpl.category) {
        return new Response(JSON.stringify({ error: "category_template_mismatch" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      sendResult = await provider.sendTemplate(
        channel,
        guest.phone_number,
        tpl.provider_template_ref ?? tpl.name,
        template_params ?? {},
        tpl.category as "utility" | "marketing" | "authentication",
      );
      bodyTextForLog = tpl.body_text;
      templateIdForLog = tpl.id;
    }

    // 5. Log outbound with cost estimate
    const cost = estimateCost({
      provider: channel.provider as Provider,
      category,
      recipientCountry: guest.country_code,
      serviceWindowOpen: windowOpen,
      direction: "outbound",
    });

    const { data: logged, error: logErr } = await supabase
      .from("whatsapp_messages")
      .insert({
        business_id,
        channel_id: channel.id,
        guest_id,
        provider: channel.provider,
        provider_message_id: sendResult.providerMessageId,
        direction: "outbound",
        category,
        recipient_country: guest.country_code,
        template_id: templateIdForLog,
        body_text: bodyTextForLog,
        status: sendResult.status,
        service_window_open: windowOpen,
        provider_fee: cost.provider_fee,
        meta_fee: cost.meta_fee,
        cost_estimate: cost.cost_estimate,
        cost_currency: cost.cost_currency,
      })
      .select("id")
      .single();
    if (logErr) throw logErr;

    return new Response(
      JSON.stringify({
        ok: true,
        message_id: logged.id,
        provider_message_id: sendResult.providerMessageId,
        status: sendResult.status,
        cost,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    console.error("whatsapp-send error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : String(e) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});