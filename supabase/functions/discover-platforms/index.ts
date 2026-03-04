import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface PlatformResult {
  platform: string;
  platformLabel: string;
  url: string;
  extractedId: string | null;
  confidence: "high" | "medium" | "low";
  title: string;
  description: string;
}

function extractPlatformId(platform: string, url: string): string | null {
  try {
    switch (platform) {
      case "tripadvisor": {
        // e.g. tripadvisor.com/Hotel_Review-g293974-d325309-Reviews-...
        const match = url.match(/Hotel_Review-g\d+-d(\d+)/i) ||
                      url.match(/Restaurant_Review-g\d+-d(\d+)/i) ||
                      url.match(/Attraction_Review-g\d+-d(\d+)/i);
        if (match) return match[0]; // return full slug like Hotel_Review-g293974-d325309
        // Try location ID
        const locMatch = url.match(/-d(\d+)/);
        return locMatch ? locMatch[1] : null;
      }
      case "booking": {
        // e.g. booking.com/hotel/tr/hotel-name.html
        const match = url.match(/booking\.com\/hotel\/([a-z]{2}\/[^.?#]+)/i);
        return match ? match[1] : null;
      }
      case "trustpilot": {
        // e.g. trustpilot.com/review/example.com
        const match = url.match(/trustpilot\.com\/review\/([^/?#]+)/i);
        return match ? match[1] : null;
      }
      case "hotelscom": {
        // e.g. hotels.com/ho123456
        const match = url.match(/hotels\.com\/h[oe](\d+)/i);
        return match ? `ho${match[1]}` : url;
      }
      default:
        return null;
    }
  } catch {
    return null;
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const FIRECRAWL_API_KEY = Deno.env.get("FIRECRAWL_API_KEY");
    if (!FIRECRAWL_API_KEY) {
      return new Response(
        JSON.stringify({ error: "Firecrawl API key not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAuth = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: authError } = await supabaseAuth.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { business_name, city } = await req.json();
    if (!business_name) {
      return new Response(
        JSON.stringify({ error: "business_name is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const platforms = [
      { key: "tripadvisor", label: "TripAdvisor", site: "tripadvisor.com" },
      { key: "booking", label: "Booking.com", site: "booking.com" },
      { key: "trustpilot", label: "Trustpilot", site: "trustpilot.com" },
      { key: "hotelscom", label: "Hotels.com", site: "hotels.com" },
    ];

    const searchQuery = city
      ? `${business_name} ${city}`
      : business_name;

    // Search all platforms in parallel
    const searchPromises = platforms.map(async (platform) => {
      try {
        const query = `${searchQuery} site:${platform.site}`;
        console.log(`Searching: ${query}`);

        const response = await fetch("https://api.firecrawl.dev/v1/search", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${FIRECRAWL_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            query,
            limit: 3,
          }),
        });

        if (!response.ok) {
          console.error(`Firecrawl search failed for ${platform.key}: ${response.status}`);
          return [];
        }

        const data = await response.json();
        const results: PlatformResult[] = [];

        for (const item of data.data || []) {
          const url = item.url || "";
          if (!url.includes(platform.site)) continue;

          const extractedId = extractPlatformId(platform.key, url);
          
          // Determine confidence based on name similarity
          const title = (item.title || "").toLowerCase();
          const nameLower = business_name.toLowerCase();
          const confidence = title.includes(nameLower) ? "high" 
            : title.split(" ").some((w: string) => nameLower.includes(w) && w.length > 3) ? "medium" 
            : "low";

          results.push({
            platform: platform.key,
            platformLabel: platform.label,
            url,
            extractedId,
            confidence,
            title: item.title || url,
            description: item.description || "",
          });
        }

        return results;
      } catch (err) {
        console.error(`Error searching ${platform.key}:`, err);
        return [];
      }
    });

    const allResults = await Promise.all(searchPromises);
    const flatResults = allResults.flat();

    // Sort: high confidence first
    flatResults.sort((a, b) => {
      const order = { high: 0, medium: 1, low: 2 };
      return order[a.confidence] - order[b.confidence];
    });

    // Deduplicate: keep only the best result per platform
    const bestPerPlatform = new Map<string, PlatformResult>();
    for (const result of flatResults) {
      if (!bestPerPlatform.has(result.platform)) {
        bestPerPlatform.set(result.platform, result);
      }
    }
    const dedupedResults = Array.from(bestPerPlatform.values());

    console.log(`Found ${dedupedResults.length} platform results (deduped from ${flatResults.length}) for "${business_name}"`);

    return new Response(
      JSON.stringify({ success: true, results: dedupedResults }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in discover-platforms:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
