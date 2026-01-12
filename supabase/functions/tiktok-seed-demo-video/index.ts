import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get auth token from header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "No authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create Supabase clients
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
    const supabaseUser = createClient(supabaseUrl, supabaseServiceKey, {
      global: { headers: { Authorization: authHeader } },
    });

    // Verify JWT and get user
    const { data: { user }, error: userError } = await supabaseUser.auth.getUser(
      authHeader.replace("Bearer ", "")
    );

    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: "Invalid token", details: userError?.message }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse request body
    const { social_connection_id } = await req.json();

    if (!social_connection_id) {
      return new Response(
        JSON.stringify({ error: "Missing social_connection_id" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify ownership of social connection
    const { data: connection, error: connError } = await supabaseUser
      .from("social_connections")
      .select("id, business_id, provider")
      .eq("id", social_connection_id)
      .single();

    if (connError || !connection) {
      return new Response(
        JSON.stringify({ error: "Social connection not found or access denied" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (connection.provider !== "tiktok") {
      return new Response(
        JSON.stringify({ error: "Invalid provider, expected tiktok" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get or create business_id for this connection
    let businessId = connection.business_id;
    
    if (!businessId) {
      // Check if user has any business
      const { data: businesses } = await supabaseUser
        .from("businesses")
        .select("id")
        .eq("user_id", user.id)
        .limit(1);
      
      if (businesses && businesses.length > 0) {
        businessId = businesses[0].id;
        // Update connection with business_id
        await supabaseAdmin
          .from("social_connections")
          .update({ business_id: businessId })
          .eq("id", social_connection_id);
      } else {
        return new Response(
          JSON.stringify({ error: "No business found for user. Please create a business first." }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // Check if demo video already exists
    const { data: existingVideos } = await supabaseAdmin
      .from("tiktok_videos")
      .select("id")
      .eq("social_connection_id", social_connection_id)
      .eq("tiktok_video_id", "DEMO_VIDEO_001")
      .limit(1);

    if (existingVideos && existingVideos.length > 0) {
      // Return existing video
      const { data: video } = await supabaseAdmin
        .from("tiktok_videos")
        .select("*")
        .eq("id", existingVideos[0].id)
        .single();

      return new Response(
        JSON.stringify({ video, created: false, message: "Demo video already exists" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create demo video
    const demoVideo = {
      business_id: businessId,
      social_connection_id: social_connection_id,
      tiktok_video_id: "DEMO_VIDEO_001",
      caption: "Muhteşem bir akşam yemeği deneyimi 🍽️ #restaurant #foodie #dinner",
      thumbnail_url: null, // No thumbnail for demo
      permalink: null,
      published_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
      view_count: 12500,
      like_count: 892,
      comment_count: 6,
      share_count: 45,
      raw: { demo: true, seeded_at: new Date().toISOString() },
    };

    const { data: video, error: insertError } = await supabaseAdmin
      .from("tiktok_videos")
      .insert(demoVideo)
      .select()
      .single();

    if (insertError) {
      console.error("Failed to insert demo video:", insertError);
      return new Response(
        JSON.stringify({ error: "Failed to create demo video", details: insertError.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Log the action
    await supabaseAdmin.from("integration_logs").insert({
      business_id: businessId,
      provider: "tiktok",
      action: "seed_demo_video",
      status: "success",
      http_status: 200,
      meta: { video_id: video.id },
    });

    return new Response(
      JSON.stringify({ video, created: true, message: "Demo video created successfully" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: unknown) {
    console.error("Error in tiktok-seed-demo-video:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: "Internal server error", details: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
