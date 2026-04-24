import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface YTSearchItem {
  id: { videoId: string };
  snippet: {
    title: string;
    description: string;
    channelId: string;
    channelTitle: string;
    publishedAt: string;
    thumbnails: { high?: { url: string }; medium?: { url: string }; default?: { url: string } };
  };
}

interface YTVideoStats {
  id: string;
  statistics: { viewCount?: string; likeCount?: string; commentCount?: string };
}

interface YTCommentThread {
  id: string;
  snippet: {
    topLevelComment: {
      id: string;
      snippet: {
        authorDisplayName: string;
        authorProfileImageUrl?: string;
        authorChannelId?: { value: string };
        textDisplay: string;
        textOriginal: string;
        likeCount: number;
        publishedAt: string;
      };
    };
    totalReplyCount: number;
  };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const apiKey = Deno.env.get("YOUTUBE_API_KEY");
    if (!apiKey) throw new Error("YOUTUBE_API_KEY is not configured");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Missing authorization");

    // Verify user
    const userClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: userErr } = await userClient.auth.getUser();
    if (userErr || !user) throw new Error("Unauthorized");

    const admin = createClient(supabaseUrl, serviceKey);

    const { business_id, max_videos = 15 } = await req.json();
    if (!business_id) throw new Error("business_id is required");

    // Fetch business (verify ownership)
    const { data: business, error: bizErr } = await admin
      .from("businesses")
      .select("id, name, city, user_id")
      .eq("id", business_id)
      .eq("user_id", user.id)
      .maybeSingle();
    if (bizErr || !business) throw new Error("Business not found or access denied");

    // Build search query
    const query = business.city ? `${business.name} ${business.city}` : business.name;
    console.log(`[YouTube] Searching: "${query}"`);

    // 1) Search videos
    const searchUrl = new URL("https://www.googleapis.com/youtube/v3/search");
    searchUrl.searchParams.set("part", "snippet");
    searchUrl.searchParams.set("q", query);
    searchUrl.searchParams.set("type", "video");
    searchUrl.searchParams.set("maxResults", String(Math.min(max_videos, 50)));
    searchUrl.searchParams.set("order", "relevance");
    searchUrl.searchParams.set("key", apiKey);

    const searchResp = await fetch(searchUrl.toString());
    if (!searchResp.ok) {
      const errBody = await searchResp.text();
      throw new Error(`YouTube search failed [${searchResp.status}]: ${errBody}`);
    }
    const searchData = await searchResp.json();
    const items: YTSearchItem[] = searchData.items || [];

    if (items.length === 0) {
      return new Response(JSON.stringify({ success: true, videos: 0, comments: 0, message: "Hiç video bulunamadı" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const videoIds = items.map((i) => i.id.videoId).filter(Boolean);

    // 2) Get video statistics (batched)
    const statsUrl = new URL("https://www.googleapis.com/youtube/v3/videos");
    statsUrl.searchParams.set("part", "statistics");
    statsUrl.searchParams.set("id", videoIds.join(","));
    statsUrl.searchParams.set("key", apiKey);
    const statsResp = await fetch(statsUrl.toString());
    const statsData = statsResp.ok ? await statsResp.json() : { items: [] };
    const statsMap = new Map<string, YTVideoStats["statistics"]>(
      ((statsData.items as YTVideoStats[]) || []).map((v) => [v.id, v.statistics]),
    );

    // 3) Upsert videos
    let insertedVideos = 0;
    const videoRows: Array<{ id: string; youtube_video_id: string }> = [];
    for (const item of items) {
      const vid = item.id.videoId;
      const stats = statsMap.get(vid) || {};
      const thumb = item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.medium?.url || item.snippet.thumbnails?.default?.url || null;
      const { data: upserted, error: upErr } = await admin
        .from("youtube_videos")
        .upsert({
          business_id,
          youtube_video_id: vid,
          title: item.snippet.title,
          description: item.snippet.description,
          channel_id: item.snippet.channelId,
          channel_title: item.snippet.channelTitle,
          thumbnail_url: thumb,
          permalink: `https://www.youtube.com/watch?v=${vid}`,
          published_at: item.snippet.publishedAt,
          view_count: parseInt(stats.viewCount || "0"),
          like_count: parseInt(stats.likeCount || "0"),
          comment_count: parseInt(stats.commentCount || "0"),
          raw: item as unknown as Record<string, unknown>,
          updated_at: new Date().toISOString(),
        }, { onConflict: "business_id,youtube_video_id" })
        .select("id, youtube_video_id")
        .single();
      if (!upErr && upserted) {
        videoRows.push(upserted as { id: string; youtube_video_id: string });
        insertedVideos++;
      } else if (upErr) {
        console.error("Video upsert error:", upErr);
      }
    }

    // 4) Fetch comments per video (top-level only, max 100 per video)
    let totalComments = 0;
    let commentErrors = 0;
    for (const vrow of videoRows) {
      try {
        const ctUrl = new URL("https://www.googleapis.com/youtube/v3/commentThreads");
        ctUrl.searchParams.set("part", "snippet");
        ctUrl.searchParams.set("videoId", vrow.youtube_video_id);
        ctUrl.searchParams.set("maxResults", "100");
        ctUrl.searchParams.set("order", "relevance");
        ctUrl.searchParams.set("textFormat", "plainText");
        ctUrl.searchParams.set("key", apiKey);

        const ctResp = await fetch(ctUrl.toString());
        if (!ctResp.ok) {
          // Comments may be disabled (403). Skip silently.
          commentErrors++;
          continue;
        }
        const ctData = await ctResp.json();
        const threads: YTCommentThread[] = ctData.items || [];

        for (const t of threads) {
          const top = t.snippet.topLevelComment;
          const s = top.snippet;
          const { error: cErr } = await admin
            .from("youtube_comments")
            .upsert({
              business_id,
              video_id: vrow.id,
              youtube_video_id: vrow.youtube_video_id,
              youtube_comment_id: top.id,
              author_display_name: s.authorDisplayName,
              author_channel_id: s.authorChannelId?.value || null,
              author_avatar_url: s.authorProfileImageUrl || null,
              comment_text: s.textOriginal || s.textDisplay,
              like_count: s.likeCount || 0,
              reply_count: t.snippet.totalReplyCount || 0,
              commented_at: s.publishedAt,
              raw: t as unknown as Record<string, unknown>,
              updated_at: new Date().toISOString(),
            }, { onConflict: "business_id,youtube_comment_id" });
          if (!cErr) totalComments++;
        }
      } catch (e) {
        console.error(`Comment fetch failed for ${vrow.youtube_video_id}:`, e);
        commentErrors++;
      }
    }

    return new Response(JSON.stringify({
      success: true,
      videos: insertedVideos,
      comments: totalComments,
      comment_errors: commentErrors,
      query,
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    console.error("youtube-fetch-reviews error:", msg);
    return new Response(JSON.stringify({ success: false, error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});