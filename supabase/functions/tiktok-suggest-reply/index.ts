import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY")!;

const SYSTEM_PROMPT = `You are a social media community manager for a small business. Write concise, natural TikTok comment replies.

Rules:
- Keep replies under 180 characters unless necessary
- Use emojis lightly (0-2 max)
- Be friendly and authentic
- Never spam or over-promise
- Don't say "DM me" unless user explicitly asks about price/reservation
- If comment is troll/harassment: suggest a polite, non-escalating response or recommend ignoring
- Match the energy of the original comment

You MUST respond with a JSON object in this exact format:
{
  "intent": "price|location|reservation|praise|complaint|troll|question|other",
  "safe_to_reply": true|false,
  "rationale": "brief explanation",
  "suggestions": [
    {"tone": "friendly", "text": "your reply here"},
    {"tone": "professional", "text": "your reply here"},
    {"tone": "witty", "text": "your reply here"}
  ]
}`;

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

    const { comment_id, tone = "friendly", language = "tr" } = await req.json();

    if (!comment_id) {
      return new Response(JSON.stringify({ error: "comment_id is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get comment
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
      .select("id, user_id, name, tone, language")
      .eq("id", comment.business_id)
      .eq("user_id", user.id)
      .single();

    if (bizError || !business) {
      return new Response(JSON.stringify({ error: "Business not found or access denied" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const businessTone = business.tone || tone;
    const businessLanguage = business.language || language;

    // Build user prompt
    const userPrompt = `Business: ${business.name}
Preferred tone: ${businessTone}
Language: ${businessLanguage === 'tr' ? 'Turkish' : 'English'}

Comment from @${comment.author_username || 'user'}:
"${comment.comment_text}"

${comment.video?.caption ? `Video context: "${comment.video.caption}"` : ''}

Generate 3 reply suggestions with different tones (friendly, professional, witty). Respond in ${businessLanguage === 'tr' ? 'Turkish' : 'English'}.`;

    console.log("Generating AI suggestions...");

    // Call Lovable AI
    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.7,
      }),
    });

    if (!aiResponse.ok) {
      if (aiResponse.status === 429) {
        return new Response(JSON.stringify({ error: "AI rate limit exceeded. Please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (aiResponse.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits to continue." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await aiResponse.text();
      console.error("AI API error:", aiResponse.status, errorText);
      return new Response(JSON.stringify({ error: "AI service error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiData = await aiResponse.json();
    const aiContent = aiData.choices?.[0]?.message?.content;

    if (!aiContent) {
      return new Response(JSON.stringify({ error: "No AI response generated" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Parse AI response
    let parsed;
    try {
      // Extract JSON from response (handle markdown code blocks)
      const jsonMatch = aiContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsed = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No JSON found in response");
      }
    } catch (parseError) {
      console.error("Failed to parse AI response:", aiContent);
      return new Response(JSON.stringify({ error: "Failed to parse AI response" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Delete old suggestions for this comment
    await supabaseClient
      .from("tiktok_reply_suggestions")
      .delete()
      .eq("comment_id", comment_id);

    // Save new suggestions
    const suggestions = parsed.suggestions || [];
    const insertData = suggestions.map((s: any) => ({
      business_id: comment.business_id,
      comment_id: comment_id,
      model: "gemini-3-flash-preview",
      tone: s.tone,
      language: businessLanguage,
      suggested_text: s.text,
      intent: parsed.intent,
      safe_to_reply: parsed.safe_to_reply,
      rationale: parsed.rationale,
    }));

    if (insertData.length > 0) {
      const { error: insertError } = await supabaseClient
        .from("tiktok_reply_suggestions")
        .insert(insertData);

      if (insertError) {
        console.error("Insert suggestions error:", insertError);
      }
    }

    // Update comment status
    await supabaseClient
      .from("tiktok_comments")
      .update({ status: "suggested" })
      .eq("id", comment_id);

    // Fetch saved suggestions
    const { data: savedSuggestions } = await supabaseClient
      .from("tiktok_reply_suggestions")
      .select("*")
      .eq("comment_id", comment_id)
      .order("created_at", { ascending: true });

    return new Response(JSON.stringify({ 
      suggestions: savedSuggestions || [],
      intent: parsed.intent,
      safe_to_reply: parsed.safe_to_reply,
      rationale: parsed.rationale,
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
