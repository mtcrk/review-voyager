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

async function fetchTikTokComments(accessToken: string, videoId: string, cursor?: string) {
  const fields = "id,video_id,text,like_count,reply_count,parent_comment_id,create_time";
  
  let url = `https://open.tiktokapis.com/v2/comment/list/?fields=${fields}&video_id=${videoId}&max_count=50`;
  if (cursor) {
    url += `&cursor=${cursor}`;
  }

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({}),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("TikTok comments fetch error:", response.status, errorText);
    throw new Error(`TikTok API error: ${response.status}`);
  }

  return await response.json();
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

    const url = new URL(req.url);
    const businessId = url.searchParams.get("business_id");
    const videoId = url.searchParams.get("video_id"); // DB video id
    const tiktokVideoId = url.searchParams.get("tiktok_video_id");

    if (!businessId) {
      return new Response(JSON.stringify({ error: "business_id is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Verify business access
    const { data: business, error: bizError } = await supabaseClient
      .from("businesses")
      .select("id, user_id")
      .eq("id", businessId)
      .eq("user_id", user.id)
      .single();

    if (bizError || !business) {
      return new Response(JSON.stringify({ error: "Business not found or access denied" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get video info
    let video;
    if (videoId) {
      const { data: v, error: vErr } = await supabaseClient
        .from("tiktok_videos")
        .select("*")
        .eq("id", videoId)
        .eq("business_id", businessId)
        .single();
      
      if (vErr || !v) {
        return new Response(JSON.stringify({ error: "Video not found" }), {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      video = v;
    } else if (tiktokVideoId) {
      const { data: v, error: vErr } = await supabaseClient
        .from("tiktok_videos")
        .select("*")
        .eq("tiktok_video_id", tiktokVideoId)
        .eq("business_id", businessId)
        .single();
      
      if (vErr || !v) {
        return new Response(JSON.stringify({ error: "Video not found" }), {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      video = v;
    } else {
      return new Response(JSON.stringify({ error: "video_id or tiktok_video_id is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get TikTok connection
    const { data: connection, error: connError } = await supabaseClient
      .from("social_connections")
      .select("*")
      .eq("id", video.social_connection_id)
      .single();

    if (connError || !connection) {
      return new Response(JSON.stringify({ error: "TikTok connection not found", code: "NOT_CONNECTED" }), {
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

    // Fetch comments from TikTok
    console.log(`Fetching comments for video ${video.tiktok_video_id}...`);
    const commentsResponse = await fetchTikTokComments(accessToken, video.tiktok_video_id);
    
    if (commentsResponse.error?.code) {
      console.error("TikTok API error:", commentsResponse.error);
      return new Response(JSON.stringify({ error: commentsResponse.error.message || "TikTok API error" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const comments = commentsResponse.data?.comments || [];
    console.log(`Found ${comments.length} comments`);

    // Upsert comments
    const upsertData = comments.map((comment: any) => ({
      business_id: businessId,
      social_connection_id: connection.id,
      video_id: video.id,
      tiktok_video_id: video.tiktok_video_id,
      tiktok_comment_id: comment.id,
      parent_comment_id: comment.parent_comment_id || null,
      author_username: comment.user?.unique_id || null,
      author_display_name: comment.user?.nickname || null,
      author_avatar_url: comment.user?.avatar_url || null,
      comment_text: comment.text,
      like_count: comment.like_count || 0,
      reply_count: comment.reply_count || 0,
      commented_at: comment.create_time ? new Date(comment.create_time * 1000).toISOString() : null,
      raw: comment,
    }));

    if (upsertData.length > 0) {
      const { error: upsertError } = await supabaseClient
        .from("tiktok_comments")
        .upsert(upsertData, { 
          onConflict: "business_id,tiktok_comment_id",
          ignoreDuplicates: false 
        });

      if (upsertError) {
        console.error("Comment upsert error:", upsertError);
      }
    }

    // Fetch updated comments from database
    const { data: dbComments, error: fetchError } = await supabaseClient
      .from("tiktok_comments")
      .select(`
        *,
        suggestions:tiktok_reply_suggestions(*),
        replies:tiktok_comment_replies(*)
      `)
      .eq("video_id", video.id)
      .order("commented_at", { ascending: false });

    if (fetchError) {
      console.error("Fetch comments error:", fetchError);
    }

    return new Response(JSON.stringify({ 
      comments: dbComments || [],
      fetched: comments.length,
      has_more: commentsResponse.data?.has_more || false,
      cursor: commentsResponse.data?.cursor || null,
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
