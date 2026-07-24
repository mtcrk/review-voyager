// deno-lint-ignore-file no-explicit-any
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { getProvider } from "../_shared/whatsapp/registry.ts";
import { isOptOutMessage } from "../_shared/whatsapp/optout.ts";
import { estimateCost } from "../_shared/whatsapp/pricing.ts";
import type { Provider } from "../_shared/whatsapp/types.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

// This function is called by the provider (Twilio) — public, no JWT.
// URL convention: /functions/v1/whatsapp-webhook?provider=twilio
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const url = new URL(req.url);
    const providerName = (url.searchParams.get("provider") ?? "twilio") as Provider;
    const provider = getProvider(providerName);

    // Parse payload depending on content-type
    const ct = req.headers.get("content-type") ?? "";
    let raw: any;
    if (ct.includes("application/json")) {
      raw = await req.json();
    } else {
      const form = await req.formData();
      raw = Object.fromEntries(form.entries());
    }

    const msg = provider.parseWebhook(raw);
    if (!msg) {
      return new Response(JSON.stringify({ ok: true, ignored: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE);

    // Locate channel by business phone number
    const { data: channel, error: chErr } = await supabase
      .from("whatsapp_channels")
      .select("id, business_id, provider, phone_number")
      .eq("phone_number", msg.to)
      .maybeSingle();

    if (chErr) throw chErr;
    if (!channel) {
      console.warn("whatsapp-webhook: no channel found for", msg.to);
      return new Response(JSON.stringify({ ok: true, ignored: "no_channel" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Find or create guest
    let guestId: string | null = null;
    {
      const { data: existing } = await supabase
        .from("guests")
        .select("id, opted_out_at")
        .eq("business_id", channel.business_id)
        .eq("phone_number", msg.from)
        .maybeSingle();

      if (existing) {
        guestId = existing.id;
      } else {
        const { data: inserted, error: insErr } = await supabase
          .from("guests")
          .insert({
            business_id: channel.business_id,
            phone_number: msg.from,
            consent_status: "none",
            consent_source: "whatsapp_inbound",
          })
          .select("id")
          .single();
        if (insErr) throw insErr;
        guestId = inserted.id;
      }
    }

    // Handle opt-out keyword
    if (isOptOutMessage(msg.body)) {
      await supabase
        .from("guests")
        .update({
          opted_out_at: new Date().toISOString(),
          consent_status: "rejected",
        })
        .eq("id", guestId!);
    }

    // Open or refresh 24h conversation window
    const now = new Date();
    const expires = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    {
      // Look up latest window for this guest
      const { data: latest } = await supabase
        .from("conversation_windows")
        .select("id, expires_at")
        .eq("guest_id", guestId!)
        .order("expires_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (latest && new Date(latest.expires_at) > now) {
        await supabase
          .from("conversation_windows")
          .update({ opened_at: now.toISOString(), expires_at: expires.toISOString() })
          .eq("id", latest.id);
      } else {
        await supabase.from("conversation_windows").insert({
          business_id: channel.business_id,
          channel_id: channel.id,
          guest_id: guestId!,
          opened_at: now.toISOString(),
          expires_at: expires.toISOString(),
        });
      }
    }

    // Log inbound message (inbound is always inside the window it just opened)
    const cost = estimateCost({
      provider: channel.provider as Provider,
      category: "service",
      recipientCountry: null,
      serviceWindowOpen: true,
      direction: "inbound",
    });

    await supabase.from("whatsapp_messages").insert({
      business_id: channel.business_id,
      channel_id: channel.id,
      guest_id: guestId,
      provider: channel.provider,
      provider_message_id: msg.providerMessageId,
      direction: "inbound",
      category: "service",
      body_text: msg.body,
      status: "delivered",
      service_window_open: true,
      provider_fee: cost.provider_fee,
      meta_fee: cost.meta_fee,
      cost_estimate: cost.cost_estimate,
      cost_currency: cost.cost_currency,
    });

    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("whatsapp-webhook error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : String(e) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});