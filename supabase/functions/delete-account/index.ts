import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Yetkisiz" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Verify user via their JWT
    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData, error: userErr } = await userClient.auth.getUser();
    if (userErr || !userData?.user) {
      return new Response(JSON.stringify({ error: "Oturum geçersiz" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userId = userData.user.id;
    const userEmail = userData.user.email;

    let body: any = {};
    try {
      body = await req.json();
    } catch {}
    const confirmation = String(body?.confirmation || "").trim().toLowerCase();
    if (!userEmail || confirmation !== userEmail.toLowerCase()) {
      return new Response(
        JSON.stringify({ error: "Onay için e-posta adresini doğru yazmalısın." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const admin = createClient(supabaseUrl, serviceKey);

    // Cascade-delete user data (no FKs defined, so do it manually)
    const { data: bizRows } = await admin
      .from("businesses")
      .select("id")
      .eq("user_id", userId);
    const bizIds = (bizRows || []).map((b: any) => b.id);

    if (bizIds.length > 0) {
      await admin.from("reviews").delete().in("business_id", bizIds);
      await admin.from("reply_logs").delete().in("business_id", bizIds);
      await admin.from("business_credentials").delete().in("business_id", bizIds);
      await admin.from("social_connections").delete().in("business_id", bizIds);
      await admin.from("customer_contacts").delete().in("business_id", bizIds);
      await admin.from("email_campaigns").delete().in("business_id", bizIds);
      await admin.from("email_logs").delete().in("business_id", bizIds);
      await admin.from("platform_ratings").delete().in("business_id", bizIds);
      await admin.from("platform_rankings").delete().in("business_id", bizIds);
      await admin.from("performance_metrics_cache").delete().in("business_id", bizIds);
      await admin.from("integration_logs").delete().in("business_id", bizIds);
      await admin.from("ci_competitors").delete().in("business_id", bizIds);
      await admin.from("ci_review_topics").delete().in("business_id", bizIds);
      await admin.from("ci_monday_briefs").delete().in("business_id", bizIds);
      await admin.from("story_kit_templates").delete().in("business_id", bizIds);
      await admin.from("story_kit_shares").delete().in("business_id", bizIds);
      await admin.from("tiktok_videos").delete().in("business_id", bizIds);
      await admin.from("tiktok_comments").delete().in("business_id", bizIds);
      await admin.from("tiktok_reply_suggestions").delete().in("business_id", bizIds);
      await admin.from("tiktok_comment_replies").delete().in("business_id", bizIds);
      await admin.from("youtube_comments").delete().in("business_id", bizIds);
      await admin.from("businesses").delete().in("id", bizIds);
    }

    await admin.from("social_connections").delete().eq("user_id", userId);
    await admin.from("chat_conversations").delete().eq("user_id", userId);
    await admin.from("profiles").delete().eq("user_id", userId);

    const { error: delErr } = await admin.auth.admin.deleteUser(userId);
    if (delErr) {
      return new Response(JSON.stringify({ error: delErr.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Bilinmeyen hata" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});