import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const CATEGORY_TO_PLACES_TYPE: Record<string, string> = {
  hotel: "lodging",
  lodging: "lodging",
  restaurant: "restaurant",
  cafe: "cafe",
  bar: "bar",
  clinic: "doctor",
  salon: "beauty_salon",
  spa: "spa",
};

function haversineMeters(lat1: number, lng1: number, lat2: number, lng2: number) {
  const R = 6371000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

function scoreCandidate(opts: {
  distance: number;
  radius: number;
  ownRating: number | null;
  candRating: number | null;
  ownReviewCount: number;
  candReviewCount: number;
  categoryMatch: boolean;
}) {
  const { distance, radius, ownRating, candRating, ownReviewCount, candReviewCount, categoryMatch } = opts;

  // Proximity (40 pts)
  const proximity = Math.max(0, 1 - distance / radius) * 40;

  // Rating similarity (25 pts)
  let ratingScore = 12.5;
  if (ownRating != null && candRating != null) {
    const diff = Math.abs(ownRating - candRating);
    ratingScore = Math.max(0, 1 - diff / 2) * 25;
  }

  // Review volume similarity, same order of magnitude (20 pts)
  let volumeScore = 10;
  if (ownReviewCount > 0 && candReviewCount > 0) {
    const ratio = candReviewCount / ownReviewCount;
    if (ratio < 0.3 || ratio > 3) volumeScore = 4;
    else {
      const logDiff = Math.abs(Math.log10(ratio));
      volumeScore = Math.max(0, 1 - logDiff) * 20;
    }
  }

  // Category match (15 pts)
  const categoryScore = categoryMatch ? 15 : 5;

  return Math.round(proximity + ratingScore + volumeScore + categoryScore);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { business_id, radius_m = 5000, rating_tolerance = 1.0 } = await req.json();
    if (!business_id) {
      return new Response(JSON.stringify({ error: "business_id required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const placesKey = Deno.env.get("GOOGLE_PLACES_API_KEY");
    if (!placesKey) {
      return new Response(
        JSON.stringify({ error: "GOOGLE_PLACES_API_KEY secret not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const admin = createClient(supabaseUrl, serviceKey);

    // Load business
    const { data: biz, error: bizErr } = await admin
      .from("businesses")
      .select("id, name, place_id, city, lat, lng")
      .eq("id", business_id)
      .maybeSingle();
    if (bizErr || !biz) {
      return new Response(JSON.stringify({ error: "Business not found", details: bizErr?.message }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    let bizLat: number | null = biz.lat != null ? Number(biz.lat) : null;
    let bizLng: number | null = biz.lng != null ? Number(biz.lng) : null;

    // Fallback: geocode via Places Text Search using name (+ city if available)
    if (bizLat == null || bizLng == null) {
      try {
        const query = [biz.name, biz.city].filter(Boolean).join(" ");
        const tsRes = await fetch("https://places.googleapis.com/v1/places:searchText", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Goog-Api-Key": placesKey,
            "X-Goog-FieldMask": "places.id,places.location,places.displayName",
          },
          body: JSON.stringify({ textQuery: query, pageSize: 1 }),
        });
        if (tsRes.ok) {
          const tsJson = await tsRes.json();
          const p = (tsJson.places || [])[0];
          if (p?.location) {
            bizLat = p.location.latitude;
            bizLng = p.location.longitude;
            await admin.from("businesses").update({ lat: bizLat, lng: bizLng }).eq("id", business_id);
          }
        }
      } catch (_) { /* ignore */ }
    }

    if (bizLat == null || bizLng == null) {
      return new Response(
        JSON.stringify({
          error: "Bu işletmenin konumu bulunamadı. Lütfen önce Google Business Profile bağlayın veya işletmenin Google Maps'te kayıtlı olduğundan emin olun.",
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Compute own avg rating + count
    const { data: ownReviews } = await admin
      .from("reviews")
      .select("rating")
      .eq("business_id", business_id);
    const ownReviewCount = ownReviews?.length ?? 0;
    const ownRating = ownReviewCount > 0
      ? ownReviews!.reduce((s: number, r: any) => s + (r.rating || 0), 0) / ownReviewCount
      : null;

    const mappedType = (biz as any).category ? CATEGORY_TO_PLACES_TYPE[(biz as any).category.toLowerCase()] : undefined;

    // Places API (New) — Nearby Search
    const body: Record<string, unknown> = {
      maxResultCount: 20,
      rankPreference: "DISTANCE",
      locationRestriction: {
        circle: {
          center: { latitude: bizLat, longitude: bizLng },
          radius: Math.min(Number(radius_m), 50000),
        },
      },
    };
    if (mappedType) body.includedTypes = [mappedType];

    const placesRes = await fetch("https://places.googleapis.com/v1/places:searchNearby", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": placesKey,
        "X-Goog-FieldMask":
          "places.id,places.displayName,places.location,places.rating,places.userRatingCount,places.types,places.primaryType",
      },
      body: JSON.stringify(body),
    });
    if (!placesRes.ok) {
      const text = await placesRes.text();
      return new Response(
        JSON.stringify({ error: "Places API (New) error", details: text, status: placesRes.status }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }
    const placesJson = await placesRes.json();
    const results = (placesJson.places || []) as any[];
    const candidates = [] as any[];

    for (const r of results) {
      const pid = r.id;
      if (!pid) continue;
      if (biz.place_id && pid === biz.place_id) continue;
      const candLat = r.location?.latitude;
      const candLng = r.location?.longitude;
      if (candLat == null || candLng == null) continue;
      const distance = haversineMeters(bizLat, bizLng, candLat, candLng);
      if (distance > radius_m) continue;

      const candRating = typeof r.rating === "number" ? r.rating : null;
      const candReviewCount = typeof r.userRatingCount === "number" ? r.userRatingCount : 0;

      if (ownRating != null && candRating != null && Math.abs(ownRating - candRating) > rating_tolerance + 1) {
        // soft filter; allow but heavy penalty handled in score
      }

      const categoryMatch =
        (mappedType != null) &&
        ((Array.isArray(r.types) && r.types.includes(mappedType)) || r.primaryType === mappedType);

      const match_score = scoreCandidate({
        distance,
        radius: radius_m,
        ownRating,
        candRating,
        ownReviewCount,
        candReviewCount,
        categoryMatch,
      });

      candidates.push({
        business_id,
        name: r.displayName?.text || "Unknown",
        place_id: pid,
        category: (biz as any).category || null,
        city: biz.city || null,
        lat: candLat,
        lng: candLng,
        rating: candRating,
        review_count: candReviewCount,
        match_score,
        proximity_m: Math.round(distance),
        source: "discovered",
        status: "suggested",
        is_active: true,
        discovered_at: new Date().toISOString(),
        source_urls: {
          google_maps: `https://www.google.com/maps/place/?q=place_id:${pid}`,
        },
      });
    }

    candidates.sort((a, b) => b.match_score - a.match_score);
    const top = candidates.slice(0, 15);

    let inserted = 0;
    if (top.length > 0) {
      const { error: upErr, count } = await admin
        .from("ci_competitors")
        .upsert(top, { onConflict: "business_id,place_id", count: "exact" });
      if (upErr) {
        console.error("Upsert competitors failed:", upErr);
        return new Response(
          JSON.stringify({ error: "Failed to save competitors", details: upErr.message }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
      inserted = count ?? top.length;
    }

    await admin.from("ci_discovery_runs").insert({
      business_id,
      radius_m,
      rating_tolerance,
      candidates_found: results.length,
      suggested_count: top.length,
    });

    return new Response(
      JSON.stringify({
        ok: true,
        candidates_found: results.length,
        suggested_count: top.length,
        inserted,
        competitors: top.map((c) => ({
          name: c.name,
          place_id: c.place_id,
          match_score: c.match_score,
          proximity_m: c.proximity_m,
          rating: c.rating,
          review_count: c.review_count,
        })),
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    console.error("discover-competitors error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});