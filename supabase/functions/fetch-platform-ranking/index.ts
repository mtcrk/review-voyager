import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const FIRECRAWL_V2 = "https://api.firecrawl.dev/v2";

interface RankingResult {
  rank: number | null;
  total_in_area: number | null;
  area_name: string | null;
  source_url: string;
  raw: any;
}

function buildTripAdvisorUrl(taId: string): string | null {
  // taId examples: "Hotel_Review-g297966-d1234567-..." or just "d1234567"
  if (taId.startsWith("http")) return taId;
  if (taId.includes("Hotel_Review") || taId.includes("Restaurant_Review")) {
    return `https://www.tripadvisor.com/${taId.startsWith("/") ? taId.slice(1) : taId}`;
  }
  return null;
}

async function scrapeRanking(url: string, areaHint?: string | null): Promise<RankingResult | null> {
  const apiKey = Deno.env.get("FIRECRAWL_API_KEY");
  if (!apiKey) throw new Error("FIRECRAWL_API_KEY is not configured");

  const prompt = `Extract the hotel/property ranking on this listing page.
Look for phrases like "ranked #23 of 153 hotels in Bodrum", "23. sırada", "#23 of 153", "Bodrum City bölgesindeki 153 otel arasında 23. sırada", etc.
Return JSON with: rank (integer, the position number), total_in_area (integer, total properties in the area), area_name (string, location/city name like "Bodrum").
If a value cannot be found, set it to null.`;

  const schema = {
    type: "object",
    properties: {
      rank: { type: ["integer", "null"] },
      total_in_area: { type: ["integer", "null"] },
      area_name: { type: ["string", "null"] },
    },
    required: ["rank", "total_in_area", "area_name"],
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
  if (!json) return null;

  return {
    rank: typeof json.rank === "number" ? json.rank : null,
    total_in_area: typeof json.total_in_area === "number" ? json.total_in_area : null,
    area_name: json.area_name || areaHint || null,
    source_url: url,
    raw: json,
  };
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

    const { business_id } = await req.json();
    if (!business_id) {
      return new Response(JSON.stringify({ error: "business_id required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey, {
      global: { headers: { Authorization: authHeader } },
    });

    // Verify user owns this business
    const userClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: business, error: bizError } = await userClient
      .from("businesses")
      .select("id, name, city, tripadvisor_id, booking_hotel_id")
      .eq("id", business_id)
      .maybeSingle();

    if (bizError || !business) {
      return new Response(JSON.stringify({ error: "Business not found or access denied" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const results: Record<string, any> = {};
    const errors: Record<string, string> = {};

    // TripAdvisor
    if (business.tripadvisor_id) {
      const url = buildTripAdvisorUrl(business.tripadvisor_id);
      if (url) {
        try {
          const r = await scrapeRanking(url, business.city);
          if (r) {
            await supabase.from("platform_rankings").upsert(
              {
                business_id,
                platform: "tripadvisor",
                rank: r.rank,
                total_in_area: r.total_in_area,
                area_name: r.area_name,
                source_url: r.source_url,
                raw: r.raw,
                fetched_at: new Date().toISOString(),
              },
              { onConflict: "business_id,platform" }
            );
            results.tripadvisor = r;
          }
        } catch (e: any) {
          errors.tripadvisor = e.message;
        }
      }
    }

    // Booking
    if (business.booking_hotel_id) {
      const url = `https://www.booking.com/hotel/${business.booking_hotel_id}.html`;
      try {
        const r = await scrapeRanking(url, business.city);
        if (r) {
          await supabase.from("platform_rankings").upsert(
            {
              business_id,
              platform: "booking",
              rank: r.rank,
              total_in_area: r.total_in_area,
              area_name: r.area_name,
              source_url: r.source_url,
              raw: r.raw,
              fetched_at: new Date().toISOString(),
            },
            { onConflict: "business_id,platform" }
          );
          results.booking = r;
        }
      } catch (e: any) {
        errors.booking = e.message;
      }
    }

    return new Response(
      JSON.stringify({ success: true, results, errors }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e: any) {
    console.error("fetch-platform-ranking error:", e);
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
