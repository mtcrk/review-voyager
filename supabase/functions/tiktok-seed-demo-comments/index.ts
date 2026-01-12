import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

// Sample comments for demo mode
const SAMPLE_COMMENTS = [
  {
    author_username: "curious_buyer",
    author_display_name: "Meraklı Alıcı",
    comment_text: "Fiyat ne kadar? 💰",
    like_count: 12,
    reply_count: 0,
    intent: "price",
  },
  {
    author_username: "location_seeker",
    author_display_name: "Konum Arayan",
    comment_text: "Neredesiniz? Mağazanız var mı?",
    like_count: 8,
    reply_count: 0,
    intent: "location",
  },
  {
    author_username: "reservation_king",
    author_display_name: "Rezervasyon Kralı",
    comment_text: "Nasıl rezervasyon yapabilirim? 📅",
    like_count: 5,
    reply_count: 0,
    intent: "reservation",
  },
  {
    author_username: "happy_customer",
    author_display_name: "Mutlu Müşteri",
    comment_text: "Harika bir ürün! Çok memnun kaldım 🔥👏",
    like_count: 45,
    reply_count: 2,
    intent: "praise",
  },
  {
    author_username: "unhappy_user",
    author_display_name: "Şikayetçi Kullanıcı",
    comment_text: "Kargo çok geç geldi, beklediğim gibi değildi 😤",
    like_count: 3,
    reply_count: 0,
    intent: "complaint",
  },
  {
    author_username: "troll_account123",
    author_display_name: "Troll",
    comment_text: "Bu ne ya berbat 🤮🤮🤮",
    like_count: 1,
    reply_count: 0,
    intent: "troll",
  },
  {
    author_username: "genuine_question",
    author_display_name: "Soru Soran",
    comment_text: "Bu ürün hangi renklerde mevcut?",
    like_count: 15,
    reply_count: 1,
    intent: "question",
  },
  {
    author_username: "size_checker",
    author_display_name: "Beden Kontrolcüsü",
    comment_text: "XL beden var mı stokta?",
    like_count: 7,
    reply_count: 0,
    intent: "question",
  },
];

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get auth token
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create clients
    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const supabaseUser = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      global: { headers: { Authorization: authHeader } },
    });

    // Get user
    const { data: { user }, error: authError } = await supabaseUser.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse request body
    const { social_connection_id, video_id, tiktok_video_id } = await req.json();

    if (!social_connection_id || !video_id || !tiktok_video_id) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: social_connection_id, video_id, tiktok_video_id" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify connection access - user must own the connection
    const { data: connection, error: connError } = await supabaseAdmin
      .from("social_connections")
      .select("id, user_id, business_id")
      .eq("id", social_connection_id)
      .single();

    if (connError || !connection) {
      return new Response(
        JSON.stringify({ error: "Connection not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (connection.user_id !== user.id) {
      return new Response(
        JSON.stringify({ error: "Access denied" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify video exists and belongs to this connection
    const { data: video, error: videoError } = await supabaseAdmin
      .from("tiktok_videos")
      .select("id, business_id")
      .eq("id", video_id)
      .eq("social_connection_id", social_connection_id)
      .single();

    if (videoError || !video) {
      return new Response(
        JSON.stringify({ error: "Video not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Use video's business_id or connection id as fallback
    const effectiveBusinessId = video.business_id || social_connection_id;

    // Generate sample comments
    const now = new Date();
    const commentsToInsert = SAMPLE_COMMENTS.map((sample, index) => {
      const commentedAt = new Date(now.getTime() - (index + 1) * 3600000); // 1 hour apart
      return {
        business_id: effectiveBusinessId,
        social_connection_id,
        video_id,
        tiktok_video_id,
        tiktok_comment_id: `DEMO_${Date.now()}_${index}`,
        author_username: sample.author_username,
        author_display_name: sample.author_display_name,
        author_avatar_url: null,
        comment_text: sample.comment_text,
        like_count: sample.like_count,
        reply_count: sample.reply_count,
        status: "open",
        commented_at: commentedAt.toISOString(),
        raw: { demo: true, intent: sample.intent },
      };
    });

    // Insert sample comments
    const { data: insertedComments, error: insertError } = await supabaseAdmin
      .from("tiktok_comments")
      .insert(commentsToInsert)
      .select(`
        *,
        suggestions:tiktok_reply_suggestions(*),
        replies:tiktok_comment_replies(*)
      `);

    if (insertError) {
      console.error("Insert error:", insertError);
      return new Response(
        JSON.stringify({ error: "Failed to insert sample comments" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Log the action
    await supabaseAdmin.from("integration_logs").insert({
      business_id: effectiveBusinessId,
      provider: "tiktok",
      action: "seed_demo_comments",
      status: "ok",
      http_status: 200,
      meta: { comments_count: insertedComments?.length || 0, video_id },
    });

    return new Response(
      JSON.stringify({ 
        success: true, 
        comments: insertedComments,
        message: `${insertedComments?.length || 0} sample comments created` 
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("Error:", error);
    const message = error instanceof Error ? error.message : "Internal server error";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
