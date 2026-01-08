import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const TIKTOK_CLIENT_KEY = Deno.env.get("TIKTOK_CLIENT_KEY")!;
const TIKTOK_CLIENT_SECRET = Deno.env.get("TIKTOK_CLIENT_SECRET")!;
const TIKTOK_REDIRECT_URI = Deno.env.get("TIKTOK_REDIRECT_URI") || "https://app.voyagerespond.com/auth/tiktok/callback";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const authHeader = req.headers.get("Authorization");

    // Create user client for authenticated requests
    const userClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader || "" } },
    });

    // Verify user is authenticated
    const { data: { user }, error: authError } = await userClient.auth.getUser();
    if (authError || !user) {
      console.error("Auth error:", authError);
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json().catch(() => ({}));
    const { action, code, state, business_id } = body;

    console.log(`TikTok auth action: ${action}, business_id: ${business_id}`);

    // ACTION: Initiate OAuth flow
    if (action === "initiate") {
      // business_id is now optional - can do user-level connections
      
      // Generate CSRF state token
      const csrfState = crypto.randomUUID();
      const statePayload = JSON.stringify({ csrf: csrfState, business_id: business_id || null, user_id: user.id });
      const encodedState = btoa(statePayload);

      // Build TikTok authorization URL (using exact redirect URI from config)
      const authUrl = new URL("https://www.tiktok.com/v2/auth/authorize/");
      authUrl.searchParams.set("client_key", TIKTOK_CLIENT_KEY);
      authUrl.searchParams.set("redirect_uri", TIKTOK_REDIRECT_URI);
      authUrl.searchParams.set("response_type", "code");
      authUrl.searchParams.set("scope", "user.info.basic");
      authUrl.searchParams.set("state", encodedState);

      console.log("Generated TikTok auth URL with redirect:", TIKTOK_REDIRECT_URI);

      return new Response(JSON.stringify({ 
        auth_url: authUrl.toString(),
        state: encodedState 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ACTION: Exchange code for tokens
    if (action === "exchange") {
      if (!code || !state) {
        return new Response(JSON.stringify({ error: "code and state are required" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Verify state
      let statePayload;
      try {
        statePayload = JSON.parse(atob(state));
      } catch {
        return new Response(JSON.stringify({ error: "Invalid state" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      if (statePayload.user_id !== user.id) {
        return new Response(JSON.stringify({ error: "State mismatch" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const businessId = statePayload.business_id;

      console.log("Exchanging code for tokens with redirect_uri:", TIKTOK_REDIRECT_URI);

      // Exchange code for access token
      const tokenResponse = await fetch("https://open.tiktokapis.com/v2/oauth/token/", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          client_key: TIKTOK_CLIENT_KEY,
          client_secret: TIKTOK_CLIENT_SECRET,
          code,
          grant_type: "authorization_code",
          redirect_uri: TIKTOK_REDIRECT_URI,
        }),
      });

      const tokenData = await tokenResponse.json();
      console.log("Token response status:", tokenResponse.status);

      if (!tokenResponse.ok || tokenData.error) {
        console.error("Token exchange failed:", tokenData);
        return new Response(JSON.stringify({ 
          error: "Failed to exchange code",
          details: tokenData.error_description || tokenData.error 
        }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { access_token, refresh_token, expires_in, open_id, scope } = tokenData;

      console.log("Fetching user info for open_id:", open_id);

      // Fetch user info
      const userInfoResponse = await fetch(
        `https://open.tiktokapis.com/v2/user/info/?fields=open_id,union_id,avatar_url,display_name,username`,
        {
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        }
      );

      const userInfoData = await userInfoResponse.json();
      console.log("User info response:", userInfoResponse.status);

      if (!userInfoResponse.ok || userInfoData.error?.code) {
        console.error("User info fetch failed:", userInfoData);
        return new Response(JSON.stringify({ 
          error: "Failed to fetch user info",
          details: userInfoData.error?.message 
        }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const userInfo = userInfoData.data?.user || {};
      const username = userInfo.username || userInfo.display_name || "TikTok User";
      const avatarUrl = userInfo.avatar_url || null;

      // Calculate expiration time
      const expiresAt = new Date(Date.now() + (expires_in * 1000)).toISOString();

      // Use admin client to store tokens (bypasses RLS for secure storage)
      const adminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

      // Build connection data - support both user-level and business-level connections
      const connectionData: Record<string, unknown> = {
        provider: "tiktok",
        provider_user_id: open_id,
        username,
        avatar_url: avatarUrl,
        access_token,
        refresh_token,
        expires_at: expiresAt,
        scopes: scope ? scope.split(",") : ["user.info.basic"],
        connected_at: new Date().toISOString(),
        user_id: user.id,
      };
      
      if (businessId) {
        connectionData.business_id = businessId;
      }

      // First check if connection exists for this user/provider
      const { data: existingConnection } = await adminClient
        .from("social_connections")
        .select("id")
        .eq("user_id", user.id)
        .eq("provider", "tiktok")
        .maybeSingle();

      let upsertError;
      if (existingConnection) {
        // Update existing
        const { error } = await adminClient
          .from("social_connections")
          .update(connectionData)
          .eq("id", existingConnection.id);
        upsertError = error;
      } else {
        // Insert new
        const { error } = await adminClient
          .from("social_connections")
          .insert(connectionData);
        upsertError = error;
      }

      if (upsertError) {
        console.error("Failed to save connection:", upsertError);
        return new Response(JSON.stringify({ error: "Failed to save connection" }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      console.log("TikTok connection saved successfully for user:", user.id);

      return new Response(JSON.stringify({
        success: true,
        username,
        avatar_url: avatarUrl,
        provider_user_id: open_id,
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ACTION: Disconnect
    if (action === "disconnect") {
      // Use admin client to delete (ensures we can remove the tokens)
      const adminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

      // Delete by user_id (user-level) or business_id
      let query = adminClient
        .from("social_connections")
        .delete()
        .eq("provider", "tiktok");
      
      if (business_id) {
        query = query.eq("business_id", business_id);
      } else {
        query = query.eq("user_id", user.id);
      }

      const { error: deleteError } = await query;

      if (deleteError) {
        console.error("Failed to disconnect:", deleteError);
        return new Response(JSON.stringify({ error: "Failed to disconnect" }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      console.log("TikTok disconnected for user:", user.id);

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ACTION: Get connection status
    if (action === "status") {
      // Check for user-level connection first, then business-level
      let query = userClient
        .from("social_connections")
        .select("provider_user_id, username, avatar_url, connected_at")
        .eq("provider", "tiktok");
      
      if (business_id) {
        query = query.eq("business_id", business_id);
      } else {
        query = query.eq("user_id", user.id);
      }

      const { data: connection, error } = await query.maybeSingle();

      if (error) {
        console.error("Failed to fetch status:", error);
        return new Response(JSON.stringify({ error: "Failed to fetch status" }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify({
        connected: !!connection,
        ...connection,
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Invalid action" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("TikTok auth error:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
