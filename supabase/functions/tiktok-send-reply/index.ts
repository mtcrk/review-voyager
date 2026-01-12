import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const TIKTOK_CLIENT_KEY = Deno.env.get("TIKTOK_CLIENT_KEY")!;
const TIKTOK_CLIENT_SECRET = Deno.env.get("TIKTOK_CLIENT_SECRET")!;

async function refreshTikTokToken(refreshToken: string) {
  try {
    const response = await fetch("https://open.tiktokapis.com/v2/oauth/token/", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_key: TIKTOK_CLIENT_KEY,
        client_secret: TIKTOK_CLIENT_SECRET,
        grant_type: "refresh_token",
        refresh_token: refreshToken,
      }),
    });

    if (!response.ok) {
      console.error("Token refresh failed:", await response.text());
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error("Token refresh error:", error);
    return null;
  }
}

async function postTikTokReply(accessToken: string, videoId: string, commentId: string, text: string) {
  const response = await fetch("https://open.tiktokapis.com/v2/comment/reply/", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      video_id: videoId,
      comment_id: commentId,
      text: text,
    }),
  });

  const responseData = await response.json();
  
  if (!response.ok || responseData.error?.code) {
    console.error("TikTok reply error:", response.status, responseData);
    throw new Error(responseData.error?.message || `TikTok API error: ${response.status}`);
  }

  return responseData;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing authorization header" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const supabaseAuth = createClient(SUPABASE_URL, authHeader.replace("Bearer ", ""), {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: userError } = await supabaseAuth.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { comment_id, reply_text } = await req.json();

    if (!comment_id || !reply_text) {
      return new Response(JSON.stringify({ error: "comment_id and reply_text are required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (reply_text.length > 500) {
      return new Response(JSON.stringify({ error: "Reply text too long (max 500 characters)" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get comment with video
    const { data: comment, error: commentError } = await supabaseClient
      .from("tiktok_comments")
      .select("*, video:tiktok_videos(*)")
      .eq("id", comment_id)
      .single();

    if (commentError || !comment) {
      return new Response(JSON.stringify({ error: "Comment not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Verify business access
    const { data: business, error: bizError } = await supabaseClient
      .from("businesses")
      .select("id, user_id")
      .eq("id", comment.business_id)
      .eq("user_id", user.id)
      .single();

    if (bizError || !business) {
      return new Response(JSON.stringify({ error: "Business not found or access denied" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get TikTok connection
    const { data: connection, error: connError } = await supabaseClient
      .from("social_connections")
      .select("*")
      .eq("id", comment.social_connection_id)
      .single();

    if (connError || !connection) {
      return new Response(JSON.stringify({ error: "TikTok connection not found" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let accessToken = connection.access_token;
    const refreshToken = connection.refresh_token;
    const expiresAt = connection.expires_at;

    // Check token expiry
    if (expiresAt && new Date(expiresAt) < new Date()) {
      console.log("Token expired, refreshing...");
      const newTokens = await refreshTikTokToken(refreshToken);
      
      if (!newTokens) {
        return new Response(JSON.stringify({ error: "Token refresh failed. Please reconnect TikTok.", code: "TOKEN_EXPIRED" }), {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      await supabaseClient
        .from("social_connections")
        .update({
          access_token: newTokens.access_token,
          refresh_token: newTokens.refresh_token,
          expires_at: new Date(Date.now() + newTokens.expires_in * 1000).toISOString(),
        })
        .eq("id", connection.id);

      accessToken = newTokens.access_token;
    }

    // Create pending reply record
    const { data: replyRecord, error: insertError } = await supabaseClient
      .from("tiktok_comment_replies")
      .insert({
        business_id: comment.business_id,
        comment_id: comment_id,
        sent_by_user_id: user.id,
        reply_text: reply_text,
        send_status: "pending",
      })
      .select()
      .single();

    if (insertError) {
      console.error("Insert reply record error:", insertError);
      return new Response(JSON.stringify({ error: "Failed to create reply record" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Send reply to TikTok
    let sendStatus = "sent";
    let errorMessage = null;
    let tiktokReplyId = null;

    try {
      console.log(`Sending reply to comment ${comment.tiktok_comment_id}...`);
      const replyResponse = await postTikTokReply(
        accessToken,
        comment.tiktok_video_id,
        comment.tiktok_comment_id,
        reply_text
      );
      
      tiktokReplyId = replyResponse.data?.comment_id || null;
      console.log("Reply sent successfully:", tiktokReplyId);
    } catch (sendError) {
      console.error("Failed to send reply:", sendError);
      sendStatus = "failed";
      errorMessage = sendError instanceof Error ? sendError.message.substring(0, 500) : "Unknown error";
    }

    // Update reply record
    await supabaseClient
      .from("tiktok_comment_replies")
      .update({
        send_status: sendStatus,
        error_message: errorMessage,
        tiktok_reply_id: tiktokReplyId,
        sent_at: sendStatus === "sent" ? new Date().toISOString() : null,
      })
      .eq("id", replyRecord.id);

    // Update comment status
    await supabaseClient
      .from("tiktok_comments")
      .update({ status: sendStatus === "sent" ? "sent" : "failed" })
      .eq("id", comment_id);

    // Fetch updated reply
    const { data: updatedReply } = await supabaseClient
      .from("tiktok_comment_replies")
      .select("*")
      .eq("id", replyRecord.id)
      .single();

    if (sendStatus === "failed") {
      return new Response(JSON.stringify({ 
        error: errorMessage || "Failed to send reply",
        reply: updatedReply,
      }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ 
      success: true,
      reply: updatedReply,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
