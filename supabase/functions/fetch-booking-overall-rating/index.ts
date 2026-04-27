import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const FIRECRAWL_V2 = "https://api.firecrawl.dev/v2";

function buildBookingUrl(hotelId: string): string | null {
  if (!hotelId) return null;
  if (hotelId.startsWith("http")) return hotelId;
  // expected format like "tr/antwell" or "antwell.tr.html"
  if (hotelId.includes("/")) {
    return `https://www.booking.com/hotel/${hotelId}${hotelId.endsWith(".html") ? "" : ".html"}`;
  }
  return `https://www.booking.com/hotel/tr/${hotelId}.html`;
}

async function scrapeBooking(url: string) {
  const apiKey = Deno.env.get("FIRECRAWL_API_KEY");
  if (!apiKey) throw new Error("FIRECRAWL_API_KEY is not configured");

  const prompt = `Extract the official overall guest review score and total review count for this Booking.com hotel page.
The score is on a 10-point scale (e.g. "8.9", "Müthiş 8,9", "Wonderful 9.1"). The review count looks like "816 değerlendirme" / "816 reviews".
Return JSON. Use null when unknown. Do not invent numbers.`;

  const schema = {
    type: "object",
    properties: {
      rating: { type: ["number", "null"], description: "Overall guest score on 10-point scale" },
      review_count: { type: ["integer", "null"] },
      rating_word: { type: ["string", "null"], description: "e.g. Müthiş, Wonderful" },
    },
    required: ["rating", "review_count"],
  };

  const resp = await fetch(`${FIRECRAWL_V2}/scrape`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      url,
      formats: [{ type: "json", schema, prompt }],
      onlyMainContent: true,
    }),
  });

  const data = await resp.json();
  if (!resp.ok) {
    throw new Error(`Firecrawl error ${resp.status}: ${JSON.stringify(data)}`);
  }
  const json = data?.data?.json || data?.json;
  return json || null;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing authorization" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json().catch(() => ({}));
    const business_ids: string[] = Array.isArray(body.business_ids)
      ? body.business_ids
      : body.business_id
      ? [body.business_id]
      : [];

    if (business_ids.length === 0) {
      return new Response(JSON.stringify({ error: "business_id(s) required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const adminClient = createClient(supabaseUrl, serviceKey);

    const { data: businesses, error: bizError } = await userClient
      .from("businesses")
      .select("id, name, booking_hotel_id")
      .in("id", business_ids);

    if (bizError) throw bizError;
    if (!businesses || businesses.length === 0) {
      return new Response(JSON.stringify({ error: "No accessible businesses" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const results: Record<string, any> = {};
    const errors: Record<string, string> = {};

    for (const biz of businesses) {
      if (!biz.booking_hotel_id) {
        errors[biz.id] = "no_booking_hotel_id";
        continue;
      }
      const url = buildBookingUrl(biz.booking_hotel_id);
      if (!url) {
        errors[biz.id] = "invalid_booking_hotel_id";
        continue;
      }
      try {
        const r = await scrapeBooking(url);
        const rating = typeof r?.rating === "number" ? r.rating : null;
        const reviewCount = typeof r?.review_count === "number" ? r.review_count : null;

        if (rating == null && reviewCount == null) {
          errors[biz.id] = "no_data_extracted";
          continue;
        }

        await adminClient.from("platform_ratings").upsert(
          {
            business_id: biz.id,
            platform: "booking",
            rating,
            rating_scale: 10,
            review_count: reviewCount,
            source_url: url,
            raw: r,
            fetched_at: new Date().toISOString(),
          },
          { onConflict: "business_id,platform" }
        );
        results[biz.id] = { rating, review_count: reviewCount };
      } catch (e: any) {
        errors[biz.id] = e?.message || "scrape_failed";
      }
    }

    return new Response(
      JSON.stringify({ success: true, results, errors }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e: any) {
    console.error("fetch-booking-overall-rating error:", e);
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});