import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("Missing authorization header");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // User client for RLS-protected queries
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: {
        headers: { Authorization: authHeader },
      },
    });

    // Service role client for accessing secure credentials table
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

    const { reviewId, approvedReply, sendToGoogle } = await req.json();

    console.log("Approving reply for review:", reviewId, { sendToGoogle });

    // Update review with approved reply
    const updateData: any = {
      approved_reply: approvedReply,
      reply_source: sendToGoogle ? "google_api" : "manual_copy",
    };

    if (sendToGoogle) {
      // Get review details with business info
      const { data: review, error: reviewError } = await supabase
        .from("reviews")
        .select("*, businesses(*)")
        .eq("id", reviewId)
        .single();

      if (reviewError) {
        throw reviewError;
      }

      // Check if Google is connected
      if (!review.businesses?.google_connected) {
        throw new Error("Google Business account not connected");
      }

      // Get refresh token from secure credentials table (service role only)
      const { data: credentials, error: credError } = await supabaseAdmin
        .from("business_credentials")
        .select("google_refresh_token")
        .eq("business_id", review.business_id)
        .single();

      if (credError || !credentials?.google_refresh_token) {
        throw new Error("Google Business credentials not found");
      }

      // TODO: Implement Google Business API reply using credentials.google_refresh_token
      // For now, we'll mark it as pending
      updateData.google_reply_status = "pending_send";
      updateData.status = "replied";
      updateData.replied_at = new Date().toISOString();

      console.log("Google API integration pending - reply approved but not sent");
    } else {
      updateData.status = "replied";
      updateData.replied_at = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from("reviews")
      .update(updateData)
      .eq("id", reviewId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    console.log("Reply approved successfully");

    return new Response(
      JSON.stringify({
        message: sendToGoogle
          ? "Reply approved and will be sent to Google"
          : "Reply approved and copied",
        review: data,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in approve-reply function:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});