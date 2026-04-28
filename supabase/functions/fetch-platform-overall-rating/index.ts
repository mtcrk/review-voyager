import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const FIRECRAWL_V2 = "https://api.firecrawl.dev/v2";

type PlatformKey = "tripadvisor" | "hotelscom" | "expedia" | "tripcom";

interface PlatformConfig {
  scale: number;
  buildUrl: (biz: any) => string | null;
  prompt: string;
}

const PLATFORM_CONFIG: Record<PlatformKey, PlatformConfig> = {
  tripadvisor: {
    scale: 5,
    buildUrl: (biz) => {
      const id = biz.tripadvisor_id;
      if (!id) return null;
      if (id.startsWith("http")) return id;
      // Expect Hotel_Review-gXXX-dYYY format or full path
      if (id.includes("Hotel_Review") || id.includes("Restaurant_Review")) {
        return `https://www.tripadvisor.com/${id}`;
      }
      return null;
    },
    prompt: `Extract the official overall traveler rating and total review count from this TripAdvisor page.
The rating is on a 5-point scale (e.g. "4.5"). The review count looks like "1,234 reviews" / "1.234 değerlendirme".
Return JSON. Use null when unknown. Do not invent numbers.`,
  },
  hotelscom: {
    scale: 10,
    buildUrl: (biz) => {
      const url = biz.hotelscom_url;
      if (!url) return null;
      return url.startsWith("http") ? url : `https://${url}`;
    },
    prompt: `Extract the official overall guest rating and total review count from this Hotels.com page.
The rating is on a 10-point scale (e.g. "8.4"). The review count looks like "1,234 reviews".
Return JSON. Use null when unknown. Do not invent numbers.`,
  },
  expedia: {
    scale: 10,
    buildUrl: (biz) => {
      const id = biz.expedia_hotel_id;
      if (!id) return null;
      if (id.startsWith("http")) return id;
      return `https://www.expedia.com/h${id}.Hotel-Information`;
    },
    prompt: `Extract the official overall guest rating and total review count from this Expedia hotel page.
The rating is on a 10-point scale (e.g. "8.6"). The review count looks like "1,234 reviews".
Return JSON. Use null when unknown. Do not invent numbers.`,
  },
  tripcom: {
    scale: 10,
    buildUrl: (biz) => {
      const id = biz.tripcom_hotel_id;
      if (!id) return null;
      if (id.startsWith("http")) return id;
      return `https://www.trip.com/hotels/detail/?hotelId=${id}`;
    },
    prompt: `Extract the official overall guest rating and total review count from this Trip.com hotel page.
IMPORTANT: Trip.com displays ratings on a 5-point scale on the page (e.g. "4.5") but we want the 10-point equivalent. If you see a value <= 5, multiply it by 2 to convert to the 10-point scale (e.g. 4.5 -> 9.0). If a 10-point value is shown directly, use it as-is. The review count looks like "1,234 reviews".
Return JSON with rating on a 10-point scale. Use null when unknown. Do not invent numbers.`,
  },
};

async function scrape(url: string, prompt: string) {
  const apiKey = Deno.env.get("FIRECRAWL_API_KEY");
  if (!apiKey) throw new Error("FIRECRAWL_API_KEY is not configured");

  const schema = {
    type: "object",
    properties: {
      rating: { type: ["number", "null"] },
      review_count: { type: ["integer", "null"] },
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
  return data?.data?.json || data?.json || null;
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
    const platforms: PlatformKey[] = Array.isArray(body.platforms) && body.platforms.length > 0
      ? body.platforms
      : ["tripadvisor", "hotelscom", "expedia", "tripcom"];

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
      .select(
        "id, name, tripadvisor_id, hotelscom_url, expedia_hotel_id, tripcom_hotel_id"
      )
      .in("id", business_ids);

    if (bizError) throw bizError;
    if (!businesses || businesses.length === 0) {
      return new Response(JSON.stringify({ error: "No accessible businesses" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const results: Record<string, Record<string, any>> = {};
    const errors: Record<string, Record<string, string>> = {};

    for (const biz of businesses) {
      results[biz.id] = {};
      errors[biz.id] = {};

      for (const platform of platforms) {
        const cfg = PLATFORM_CONFIG[platform];
        if (!cfg) continue;

        const url = cfg.buildUrl(biz);
        if (!url) {
          errors[biz.id][platform] = "no_id_configured";
          continue;
        }

        try {
          const r = await scrape(url, cfg.prompt);
          let rating = typeof r?.rating === "number" ? r.rating : null;
          const reviewCount = typeof r?.review_count === "number" ? r.review_count : null;

          // Sanity normalization: if platform scale is 10 but extracted value is <= 5,
          // Firecrawl likely picked up a 5-point representation — convert to 10.
          if (rating != null && cfg.scale === 10 && rating > 0 && rating <= 5) {
            rating = Math.round(rating * 2 * 10) / 10;
          }
          // Conversely, if platform scale is 5 but value > 5, it's likely a 10-point figure.
          if (rating != null && cfg.scale === 5 && rating > 5 && rating <= 10) {
            rating = Math.round((rating / 2) * 10) / 10;
          }

          if (rating == null && reviewCount == null) {
            errors[biz.id][platform] = "no_data_extracted";
            continue;
          }

          await adminClient.from("platform_ratings").upsert(
            {
              business_id: biz.id,
              platform,
              rating,
              rating_scale: cfg.scale,
              review_count: reviewCount,
              source_url: url,
              raw: r,
              fetched_at: new Date().toISOString(),
            },
            { onConflict: "business_id,platform" }
          );
          results[biz.id][platform] = { rating, review_count: reviewCount };
        } catch (e: any) {
          errors[biz.id][platform] = e?.message || "scrape_failed";
        }
      }
    }

    return new Response(
      JSON.stringify({ success: true, results, errors }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e: any) {
    console.error("fetch-platform-overall-rating error:", e);
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});