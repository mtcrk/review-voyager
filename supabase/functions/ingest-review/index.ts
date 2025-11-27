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
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { business, review } = await req.json();

    console.log("Ingesting review from n8n:", {
      businessName: business.name,
      placeId: business.place_id,
      reviewId: review.google_review_id,
    });

    // Find or create business
    let businessRecord;
    const { data: existingBusiness } = await supabase
      .from("businesses")
      .select("*")
      .eq("place_id", business.place_id)
      .single();

    if (existingBusiness) {
      businessRecord = existingBusiness;
      console.log("Found existing business:", businessRecord.id);
    } else {
      // Create new business - will need to be associated with a user later
      const { data: newBusiness, error: businessError } = await supabase
        .from("businesses")
        .insert({
          name: business.name,
          place_id: business.place_id,
          // Note: user_id will need to be set when user connects their Google account
        })
        .select()
        .single();

      if (businessError) {
        throw businessError;
      }

      businessRecord = newBusiness;
      console.log("Created new business:", businessRecord.id);
    }

    // Check for duplicate review
    const { data: existingReview } = await supabase
      .from("reviews")
      .select("id")
      .eq("google_review_id", review.google_review_id)
      .single();

    if (existingReview) {
      console.log("Review already exists, skipping:", review.google_review_id);
      return new Response(
        JSON.stringify({ message: "Review already exists", reviewId: existingReview.id }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get AI-generated reply
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    let suggestedReply = "";

    if (LOVABLE_API_KEY) {
      try {
        const replyResponse = await fetch(`${supabaseUrl}/functions/v1/generate-reply`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${supabaseKey}`,
          },
          body: JSON.stringify({
            reviewText: review.text,
            rating: review.rating,
            tone: "friendly",
            language: "en",
            summary: review.summary,
            issues: review.issues,
            praises: review.praises,
          }),
        });

        if (replyResponse.ok) {
          const replyData = await replyResponse.json();
          suggestedReply = replyData.reply;
          console.log("Generated AI reply successfully");
        }
      } catch (error) {
        console.error("Failed to generate AI reply:", error);
      }
    }

    // Insert review
    const { data: newReview, error: reviewError } = await supabase
      .from("reviews")
      .insert({
        business_id: businessRecord.id,
        google_review_id: review.google_review_id,
        google_review_name: review.google_review_name,
        reviewer_name: review.reviewer,
        rating: review.rating,
        text: review.text,
        posted_at: review.posted_at,
        summary: review.summary,
        sentiment: review.sentiment,
        issues: review.issues || [],
        praises: review.praises || [],
        suggested_reply: suggestedReply,
        status: "pending_reply",
      })
      .select()
      .single();

    if (reviewError) {
      throw reviewError;
    }

    console.log("Review ingested successfully:", newReview.id);

    return new Response(
      JSON.stringify({
        message: "Review ingested successfully",
        reviewId: newReview.id,
        businessId: businessRecord.id,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in ingest-review function:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
