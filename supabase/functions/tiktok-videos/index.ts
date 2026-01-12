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

interface TikTokTokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  open_id: string;
  scope: string;
}

async function refreshTikTokToken(refreshToken: string): Promise<TikTokTokenResponse | null> {
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

async function fetchTikTokVideos(accessToken: string, openId: string, cursor?: string) {
  const fields = "id,title,video_description,create_time,share_url,duration,cover_image_url,like_count,comment_count,share_count,view_count";
  
  let url = `https://open.tiktokapis.com/v2/video/list/?fields=${fields}`;
  if (cursor) {
    url += `&cursor=${cursor}`;
  }
  url += "&max_count=20";

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
    console.error("TikTok video fetch error:", response.status, errorText);
    throw new Error(`TikTok API error: ${response.status}`);
  }

  return await response.json();
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get auth token from header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing authorization header" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Create authenticated client
    const supabaseClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const supabaseAuth = createClient(SUPABASE_URL, authHeader.replace("Bearer ", ""), {
      global: { headers: { Authorization: authHeader } },
    });

    // Get user
    const { data: { user }, error: userError } = await supabaseAuth.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const url = new URL(req.url);
    const businessId = url.searchParams.get("business_id");

    if (!businessId) {
      return new Response(JSON.stringify({ error: "business_id is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Verify user has access to this business
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

    // Get TikTok connection
    const { data: connection, error: connError } = await supabaseClient
      .from("social_connections")
      .select("*")
      .eq("business_id", businessId)
      .eq("provider", "tiktok")
      .single();

    if (connError || !connection) {
      // Try user-level connection
      const { data: userConnection, error: userConnError } = await supabaseClient
        .from("social_connections")
        .select("*")
        .eq("user_id", user.id)
        .eq("provider", "tiktok")
        .single();

      if (userConnError || !userConnection) {
        return new Response(JSON.stringify({ error: "TikTok not connected", code: "NOT_CONNECTED" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Use user-level connection
      Object.assign(connection || {}, userConnection);
    }

    let accessToken = connection?.access_token || (connection as any)?.access_token;
    const refreshToken = connection?.refresh_token || (connection as any)?.refresh_token;
    const expiresAt = connection?.expires_at || (connection as any)?.expires_at;
    const connectionId = connection?.id || (connection as any)?.id;
    const openId = connection?.provider_user_id || (connection as any)?.provider_user_id;

    // Check if token is expired
    if (expiresAt && new Date(expiresAt) < new Date()) {
      console.log("Token expired, refreshing...");
      const newTokens = await refreshTikTokToken(refreshToken);
      
      if (!newTokens) {
        return new Response(JSON.stringify({ error: "Token refresh failed. Please reconnect TikTok.", code: "TOKEN_EXPIRED" }), {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Update tokens in database
      await supabaseClient
        .from("social_connections")
        .update({
          access_token: newTokens.access_token,
          refresh_token: newTokens.refresh_token,
          expires_at: new Date(Date.now() + newTokens.expires_in * 1000).toISOString(),
        })
        .eq("id", connectionId);

      accessToken = newTokens.access_token;
    }

    // Fetch videos from TikTok
    console.log("Fetching videos from TikTok...");
    const videosResponse = await fetchTikTokVideos(accessToken, openId);
    
    if (videosResponse.error?.code) {
      console.error("TikTok API error:", videosResponse.error);
      return new Response(JSON.stringify({ error: videosResponse.error.message || "TikTok API error" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const videos = videosResponse.data?.videos || [];
    console.log(`Found ${videos.length} videos`);

    // Upsert videos into database
    const upsertData = videos.map((video: any) => ({
      business_id: businessId,
      social_connection_id: connectionId,
      tiktok_video_id: video.id,
      caption: video.video_description || video.title || "",
      permalink: video.share_url,
      thumbnail_url: video.cover_image_url,
      published_at: video.create_time ? new Date(video.create_time * 1000).toISOString() : null,
      view_count: video.view_count || 0,
      like_count: video.like_count || 0,
      comment_count: video.comment_count || 0,
      share_count: video.share_count || 0,
      raw: video,
    }));

    if (upsertData.length > 0) {
      const { error: upsertError } = await supabaseClient
        .from("tiktok_videos")
        .upsert(upsertData, { 
          onConflict: "business_id,tiktok_video_id",
          ignoreDuplicates: false 
        });

      if (upsertError) {
        console.error("Video upsert error:", upsertError);
      }
    }

    // Fetch updated videos from database
    const { data: dbVideos, error: fetchError } = await supabaseClient
      .from("tiktok_videos")
      .select("*")
      .eq("business_id", businessId)
      .order("published_at", { ascending: false });

    if (fetchError) {
      console.error("Fetch videos error:", fetchError);
    }

    return new Response(JSON.stringify({ 
      videos: dbVideos || [],
      fetched: videos.length,
      has_more: videosResponse.data?.has_more || false,
      cursor: videosResponse.data?.cursor || null,
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
