import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { reviewText, rating, tone, language, summary, issues, praises } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log("Generating AI reply for review:", { rating, tone, language });

    // Build context from analysis
    let context = "";
    if (summary) {
      context += `Summary: ${summary}\n`;
    }
    if (praises && praises.length > 0) {
      context += `Praises: ${praises.join(", ")}\n`;
    }
    if (issues && issues.length > 0) {
      context += `Issues: ${issues.join(", ")}\n`;
    }

    // Create prompt based on tone and language
    const systemPrompt = `You are a professional review response writer. Generate a ${tone} response in ${language === "tr" ? "Turkish" : "English"}.

Guidelines:
- Keep responses concise (2-3 sentences)
- Be authentic and personable
- Acknowledge specific points from the review
- Thank the reviewer
- ${rating >= 4 ? "Express appreciation" : "Address concerns professionally and offer solutions"}
${tone === "formal" ? "- Use professional language" : ""}
${tone === "playful" ? "- Use casual, fun language with appropriate emojis" : ""}
${tone === "friendly" ? "- Be warm and approachable" : ""}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: `Generate a reply for this ${rating}-star review:\n\n${reviewText}\n\n${context}`,
          },
        ],
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("AI gateway error:", response.status, error);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required. Please add credits to your workspace." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      throw new Error(`AI gateway error: ${error}`);
    }

    const data = await response.json();
    const generatedReply = data.choices[0].message.content;

    console.log("AI reply generated successfully");

    return new Response(
      JSON.stringify({ reply: generatedReply }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in generate-reply function:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
