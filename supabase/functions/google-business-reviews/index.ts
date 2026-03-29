import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Refresh Google access token using stored refresh_token
async function refreshAccessToken(refreshToken: string): Promise<string> {
  const clientId = Deno.env.get("GOOGLE_BUSINESS_CLIENT_ID")!;
  const clientSecret = Deno.env.get("GOOGLE_BUSINESS_CLIENT_SECRET")!;

  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error("Token refresh error:", error);
    throw new Error("Failed to refresh Google access token");
  }

  const data = await response.json();
  return data.access_token;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

    // Optional: accept business_id from body for manual trigger, else fetch all connected businesses
    let targetBusinessIds: string[] = [];

    if (req.method === "POST") {
      try {
        const body = await req.json();
        if (body.business_id) {
          targetBusinessIds = [body.business_id];
        }
      } catch {
        // No body - fetch all
      }
    }

    // Get Google-connected businesses
    let query = supabaseAdmin
      .from("businesses")
      .select("id, name, google_account_id, google_location_id")
      .eq("google_connected", true)
      .not("google_location_id", "is", null);

    if (targetBusinessIds.length > 0) {
      query = query.in("id", targetBusinessIds);
    }

    const { data: businesses, error: bizError } = await query;
    if (bizError) throw bizError;

    if (!businesses || businesses.length === 0) {
      return new Response(
        JSON.stringify({ message: "No Google-connected businesses found" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const results: any[] = [];

    for (const biz of businesses) {
      try {
        // Get refresh token from secure credentials table
        const { data: credentials, error: credError } = await supabaseAdmin
          .from("business_credentials")
          .select("google_refresh_token")
          .eq("business_id", biz.id)
          .single();

        if (credError || !credentials?.google_refresh_token) {
          results.push({ business: biz.name, error: "No Google credentials found" });
          continue;
        }

        // Refresh access token
        const accessToken = await refreshAccessToken(credentials.google_refresh_token);

        // Fetch reviews from Google Business Profile API with pagination
        const baseReviewsUrl = `https://mybusiness.googleapis.com/v4/${biz.google_account_id}/${biz.google_location_id}/reviews`;
        console.log(`Fetching reviews from: ${baseReviewsUrl}`);

        const reviews: any[] = [];
        let nextPageToken: string | undefined = undefined;
        let pageCount = 0;
        const MAX_PAGES = 50; // Safety limit (~50 reviews per page = ~2500 max)

        do {
          const url = new URL(baseReviewsUrl);
          url.searchParams.set("pageSize", "50");
          if (nextPageToken) {
            url.searchParams.set("pageToken", nextPageToken);
          }

          const reviewsResponse = await fetch(url.toString(), {
            headers: { Authorization: `Bearer ${accessToken}` },
          });

          if (!reviewsResponse.ok) {
            const errorText = await reviewsResponse.text();
            console.error(`Google API error for ${biz.name} (page ${pageCount}):`, errorText);

            // Log the error only if first page fails
            if (pageCount === 0) {
              await supabaseAdmin.from("integration_logs").insert({
                business_id: biz.id,
                provider: "google",
                action: "fetch_reviews",
                status: "error",
                http_status: reviewsResponse.status,
                error_message: errorText.substring(0, 500),
              });
              results.push({ business: biz.name, error: `HTTP ${reviewsResponse.status}` });
            }
            break;
          }

          const reviewsData = await reviewsResponse.json();
          const pageReviews = reviewsData.reviews || [];
          reviews.push(...pageReviews);
          nextPageToken = reviewsData.nextPageToken;
          pageCount++;

          console.log(`Page ${pageCount}: fetched ${pageReviews.length} reviews, total so far: ${reviews.length}`);
        } while (nextPageToken && pageCount < MAX_PAGES);

        if (pageCount === 0 && reviews.length === 0) {
          continue; // Error was already logged above
        }

        console.log(`Total reviews fetched for ${biz.name}: ${reviews.length} across ${pageCount} pages`);
        let insertedCount = 0;
        let updatedCount = 0;

        for (const review of reviews) {
          const googleReviewId = review.reviewId;
          const reviewName = review.name; // Full resource name for API calls
          const reviewerName = review.reviewer?.displayName || "Anonymous";
          const rating = review.starRating
            ? { ONE: 1, TWO: 2, THREE: 3, FOUR: 4, FIVE: 5 }[review.starRating as string] || 3
            : 3;
          const text = review.comment || null;
          const postedAt = review.createTime || new Date().toISOString();
          const hasReply = !!review.reviewReply;

          // Extract review photos
          const photos: { url: string; thumbnail?: string }[] = [];
          if (review.reviewPhotos && Array.isArray(review.reviewPhotos)) {
            for (const photo of review.reviewPhotos) {
              const photoUrl = photo.photoUri || photo.googleUrl || photo.url;
              if (photoUrl) {
                photos.push({
                  url: photoUrl,
                  thumbnail: photo.thumbnailUri || photo.thumbnailUrl || photoUrl,
                });
              }
            }
          }

          // Check if review already exists
          const { data: existing } = await supabaseAdmin
            .from("reviews")
            .select("id, status")
            .eq("business_id", biz.id)
            .eq("google_review_id", googleReviewId)
            .eq("platform", "google")
            .maybeSingle();

          if (existing) {
            // Update if reply status changed or reply text missing
            if (hasReply) {
              const replyText = review.reviewReply?.comment || null;
              const updates: Record<string, any> = {};
              if (existing.status !== "replied") {
                updates.status = "replied";
                updates.replied_at = review.reviewReply?.updateTime || new Date().toISOString();
              }
              if (replyText) {
                updates.approved_reply = replyText;
              }
              if (Object.keys(updates).length > 0) {
                await supabaseAdmin
                  .from("reviews")
                  .update(updates)
                  .eq("id", existing.id);
                updatedCount++;
              }
            }
            continue;
          }

          // Determine sentiment from rating
          const sentiment =
            (rating as number) >= 4 ? "positive" : (rating as number) >= 3 ? "neutral" : "negative";

          // Insert new review
          const replyComment = review.reviewReply?.comment || null;
          const { error: insertError } = await supabaseAdmin.from("reviews").insert({
            business_id: biz.id,
            platform: "google",
            google_review_id: googleReviewId,
            google_review_name: reviewName,
            reviewer_name: reviewerName,
            rating: rating as number,
            text,
            posted_at: postedAt,
            status: hasReply ? "replied" : "pending_reply",
            replied_at: hasReply ? review.reviewReply?.updateTime : null,
            approved_reply: hasReply ? replyComment : null,
            sentiment,
            photos: photos.length > 0 ? photos : [],
          });

          if (!insertError) insertedCount++;
          else console.error("Insert error:", insertError);
        }

        // Log success
        await supabaseAdmin.from("integration_logs").insert({
          business_id: biz.id,
          provider: "google",
          action: "fetch_reviews",
          status: "success",
          http_status: 200,
          meta: {
            total_fetched: reviews.length,
            inserted: insertedCount,
            updated: updatedCount,
          },
        });

        results.push({
          business: biz.name,
          fetched: reviews.length,
          inserted: insertedCount,
          updated: updatedCount,
        });
      } catch (err: any) {
        console.error(`Error processing ${biz.name}:`, err);
        results.push({ business: biz.name, error: err.message });
      }
    }

    console.log("Google reviews fetch results:", JSON.stringify(results));

    return new Response(JSON.stringify({ success: true, results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Error in google-business-reviews:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
