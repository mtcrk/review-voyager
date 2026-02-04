import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Helper: Refresh Google access token
async function refreshAccessToken(refreshToken: string): Promise<string> {
  const clientId = Deno.env.get("GOOGLE_BUSINESS_CLIENT_ID")!;
  const clientSecret = Deno.env.get("GOOGLE_BUSINESS_CLIENT_SECRET")!;

  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error("Token refresh error:", error);
    throw new Error("Failed to refresh Google access token");
  }

  const data = await response.json();
  return data.access_token;
}

// Helper: Send reply to Google Business Profile
async function sendReplyToGoogle(
  accessToken: string,
  reviewName: string,
  replyText: string
): Promise<{ success: boolean; error?: string }> {
  // Google Business Profile API endpoint for replying to reviews
  // Format: accounts/{account_id}/locations/{location_id}/reviews/{review_id}/reply
  const url = `https://mybusiness.googleapis.com/v4/${reviewName}/reply`;

  const response = await fetch(url, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      comment: replyText,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error("Google API error:", error);
    return { success: false, error: `Google API error: ${response.status}` };
  }

  return { success: true };
}

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

    // Get review details with business info
    const { data: review, error: reviewError } = await supabase
      .from("reviews")
      .select("*, businesses(*)")
      .eq("id", reviewId)
      .single();

    if (reviewError) {
      throw reviewError;
    }

    // Update data object
    const updateData: Record<string, unknown> = {
      approved_reply: approvedReply,
      reply_source: sendToGoogle ? "google_api" : "manual_copy",
    };

    if (sendToGoogle) {
      // Check if Google is connected
      if (!review.businesses?.google_connected) {
        throw new Error("Google Business account not connected");
      }

      // Check if we have the Google review name for API call
      if (!review.google_review_name) {
        throw new Error("Google review name not found - cannot send reply via API");
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

      try {
        // Refresh access token
        const accessToken = await refreshAccessToken(credentials.google_refresh_token);

        // Send reply to Google
        const result = await sendReplyToGoogle(accessToken, review.google_review_name, approvedReply);

        if (result.success) {
          updateData.google_reply_status = "sent";
          updateData.status = "replied";
          updateData.replied_at = new Date().toISOString();
          console.log("Reply sent to Google successfully");
        } else {
          updateData.google_reply_status = "failed";
          updateData.google_reply_error_message = result.error;
          console.error("Failed to send reply to Google:", result.error);
        }
      } catch (apiError) {
        console.error("Google API error:", apiError);
        updateData.google_reply_status = "failed";
        updateData.google_reply_error_message = apiError instanceof Error ? apiError.message : "Unknown API error";
      }

      // Log the integration attempt
      await supabaseAdmin.from("integration_logs").insert({
        business_id: review.business_id,
        provider: "google",
        action: "send_reply",
        status: updateData.google_reply_status === "sent" ? "success" : "error",
        error_message: updateData.google_reply_error_message || null,
        http_status: updateData.google_reply_status === "sent" ? 200 : 500,
        meta: { review_id: reviewId },
      });
    } else {
      // Manual copy - just mark as replied
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
          ? updateData.google_reply_status === "sent"
            ? "Reply sent to Google successfully"
            : "Reply approved but failed to send to Google"
          : "Reply approved and copied",
        review: data,
        googleStatus: updateData.google_reply_status,
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
