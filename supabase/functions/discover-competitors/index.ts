import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const CATEGORY_TO_PLACES_TYPE: Record<string, string> = {
  hotel: "hotel",
  lodging: "lodging",
  motel: "motel",
  resort: "resort_hotel",
  resort_hotel: "resort_hotel",
  bed_and_breakfast: "bed_and_breakfast",
  bnb: "bed_and_breakfast",
  inn: "inn",
  guest_house: "guest_house",
  restaurant: "restaurant",
  cafe: "cafe",
  bar: "bar",
  clinic: "doctor",
  salon: "beauty_salon",
  spa: "spa",
};

const LODGING_TYPES = new Set([
  "hotel",
  "motel",
  "resort_hotel",
  "bed_and_breakfast",
  "lodging",
  "inn",
  "guest_house",
]);

// Broader accept-set used as a post-filter on candidate primaryType.
// Search uses the narrow set, but Google sometimes classifies real hotels as
// "lodging" or "extended_stay_hotel" — accept those, reject everything else.
const LODGING_ACCEPT_SET = new Set([
  "hotel",
  "resort_hotel",
  "motel",
  "lodging",
  "bed_and_breakfast",
  "inn",
  "guest_house",
  "extended_stay_hotel",
]);

// Narrower set used for the actual Places search — paid, reviewable hotels only.
const LODGING_SEARCH_TYPES = ["hotel", "resort_hotel", "motel"];
const LODGING_SEARCH_SET = new Set(LODGING_SEARCH_TYPES);

const KNOWN_BUSINESS_TYPES = new Set([
  ...LODGING_TYPES,
  "restaurant",
  "cafe",
  "bar",
  "doctor",
  "beauty_salon",
  "spa",
  "tourist_attraction",
  "museum",
  "gym",
  "store",
  "shopping_mall",
]);

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
  ownStar?: number | null;
  candStar?: number | null;
  ownSegment?: string | null;
  candSegment?: string | null;
  ownPriceTier?: number | null;
  candPriceTier?: number | null;
}) {
  const {
    distance, radius, ownReviewCount, candReviewCount, categoryMatch,
    ownStar, candStar, ownSegment, candSegment, ownPriceTier, candPriceTier,
  } = opts;

  // 40% Yakınlık
  const proximity = Math.max(0, 1 - distance / radius) * 40;

  // 20% Yıldız uyumu
  let starScore = 12; // neutral when unknown
  if (ownStar != null && candStar != null) {
    const diff = Math.abs(ownStar - candStar);
    if (diff < 0.5) starScore = 20;
    else if (diff <= 1) starScore = 12;
    else starScore = 4;
  }

  // 15% Segment uyumu
  let segmentScore = 9;
  if (ownSegment && candSegment) {
    segmentScore = ownSegment === candSegment ? 15 : 5;
  }

  // 15% Fiyat tier uyumu
  let priceScore = 9;
  if (ownPriceTier != null && candPriceTier != null) {
    const diff = Math.abs(ownPriceTier - candPriceTier);
    if (diff === 0) priceScore = 15;
    else if (diff === 1) priceScore = 9;
    else priceScore = 3;
  }

  // 10% Yorum hacmi benzerliği (log scale) - category match required
  let volumeScore = categoryMatch ? 4 : 2;
  if (ownReviewCount > 0 && candReviewCount > 0) {
    const logDiff = Math.abs(Math.log10(candReviewCount / ownReviewCount));
    volumeScore = Math.max(0, 1 - logDiff / 1.5) * 10;
  } else if (candReviewCount > 0) {
    volumeScore = Math.min(6, Math.log10(candReviewCount + 1) * 2);
  }

  const total = Math.round(proximity + starScore + segmentScore + priceScore + volumeScore);
  return {
    total,
    breakdown: {
      proximity: Math.round(proximity),
      star: Math.round(starScore),
      segment: Math.round(segmentScore),
      price: Math.round(priceScore),
      volume: Math.round(volumeScore),
    },
  };
}

// Parse star rating from name/description (Turkish hotel naming conventions)
function parseStarFromText(text: string | null | undefined): number | null {
  if (!text) return null;
  const t = text.toLowerCase();
  // "5 star", "5-star", "5 yıldız", "5*"
  const m = t.match(/(\d)\s*[-]?\s*(?:star|y[ıi]ld[ıi]z|\*)/);
  if (m) {
    const n = parseInt(m[1], 10);
    if (n >= 1 && n <= 5) return n;
  }
  return null;
}

async function inferSegment(
  apiKey: string,
  name: string,
  types: string[],
  summary: string | null,
  priceLevel: number | null,
): Promise<string | null> {
  try {
    const prompt = `Aşağıdaki konaklama işletmesini tek bir segment etiketiyle sınıflandır.
Sadece şu seçeneklerden BIRINI cevap ver (başka kelime yok):
luxury, boutique, resort, business, budget, bnb, hostel, apart

İsim: ${name}
Tipler: ${types.join(", ") || "n/a"}
Açıklama: ${summary ?? "n/a"}
Google fiyat seviyesi (1-4): ${priceLevel ?? "n/a"}`;
    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 10,
      }),
    });
    if (!res.ok) return null;
    const j = await res.json();
    const raw = j.choices?.[0]?.message?.content?.trim().toLowerCase() ?? "";
    const valid = ["luxury", "boutique", "resort", "business", "budget", "bnb", "hostel", "apart"];
    return valid.find((v) => raw.includes(v)) ?? null;
  } catch (_) {
    return null;
  }
}

function googlePriceLevelToTier(pl: string | number | null | undefined): number | null {
  if (pl == null) return null;
  if (typeof pl === "number") return pl >= 1 && pl <= 4 ? pl : null;
  const map: Record<string, number> = {
    PRICE_LEVEL_FREE: 1,
    PRICE_LEVEL_INEXPENSIVE: 1,
    PRICE_LEVEL_MODERATE: 2,
    PRICE_LEVEL_EXPENSIVE: 3,
    PRICE_LEVEL_VERY_EXPENSIVE: 4,
  };
  return map[pl] ?? null;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { business_id, radius_m = 5000, rating_tolerance = 1.0, category, min_reviews = 30 } = await req.json();
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
      .select("id, name, place_id, city, lat, lng, booking_hotel_id, expedia_hotel_id, hotelscom_url, tripadvisor_id, tripcom_hotel_id")
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

    // Resolve search type: (a) request override, (b) Place Details on biz.place_id,
    // (c) hotel-platform IDs imply lodging, (d) Text Search lookup, (e) error
    let resolvedType: string | null = null;
    if (typeof category === "string" && category.trim()) {
      resolvedType = CATEGORY_TO_PLACES_TYPE[category.trim().toLowerCase()] ?? null;
    }
    if (!resolvedType && biz.place_id) {
      try {
        const detailsRes = await fetch(`https://places.googleapis.com/v1/places/${biz.place_id}`, {
          method: "GET",
          headers: {
            "X-Goog-Api-Key": placesKey,
            "X-Goog-FieldMask": "id,types,primaryType",
          },
        });
        if (detailsRes.ok) {
          const dJson = await detailsRes.json();
          const primary = typeof dJson.primaryType === "string" ? dJson.primaryType : null;
          if (primary) {
            resolvedType = primary;
          } else if (Array.isArray(dJson.types)) {
            resolvedType = dJson.types.find((t: string) => KNOWN_BUSINESS_TYPES.has(t)) ?? null;
          }
        } else {
          console.warn("Place Details failed", detailsRes.status, await detailsRes.text());
        }
      } catch (e) {
        console.warn("Place Details error", e);
      }
    }
    // Hotel-platform IDs strongly imply lodging
    if (!resolvedType) {
      const b = biz as any;
      if (b.booking_hotel_id || b.expedia_hotel_id || b.hotelscom_url || b.tripadvisor_id || b.tripcom_hotel_id) {
        resolvedType = "hotel";
      }
    }
    // Text Search fallback using business name + lat/lng
    if (!resolvedType && biz.name) {
      try {
        const tsRes = await fetch("https://places.googleapis.com/v1/places:searchText", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Goog-Api-Key": placesKey,
            "X-Goog-FieldMask": "places.id,places.primaryType,places.types",
          },
          body: JSON.stringify({
            textQuery: biz.name,
            locationBias: { circle: { center: { latitude: bizLat, longitude: bizLng }, radius: 500 } },
            maxResultCount: 1,
          }),
        });
        if (tsRes.ok) {
          const tsJson = await tsRes.json();
          const p = (tsJson.places || [])[0];
          if (p) {
            if (typeof p.primaryType === "string") {
              resolvedType = p.primaryType;
            } else if (Array.isArray(p.types)) {
              resolvedType = p.types.find((t: string) => KNOWN_BUSINESS_TYPES.has(t)) ?? null;
            }
            if (p.id && !biz.place_id) {
              await admin.from("businesses").update({ place_id: p.id }).eq("id", business_id);
              (biz as any).place_id = p.id;
            }
          }
        } else {
          console.warn("Text Search type-resolve failed", tsRes.status, await tsRes.text());
        }
      } catch (e) {
        console.warn("Text Search type-resolve error", e);
      }
    }
    if (!resolvedType) {
      return new Response(
        JSON.stringify({ error: "Could not determine business category. Provide a category." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const isLodging = LODGING_TYPES.has(resolvedType);
    const searchTypes = isLodging ? LODGING_SEARCH_TYPES : [resolvedType];

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
      includedTypes: searchTypes,
    };

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
    let filteredOutLowReviews = 0;
    let filteredOutWrongType = 0;

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
      const candTypesEarly: string[] = Array.isArray(r.types) ? r.types : [];
      const primaryType: string | null = typeof r.primaryType === "string" ? r.primaryType : null;

      // Hard type filter: candidate's MAIN identity must match what we're searching for.
      // This blocks vet clinics, event venues, etc. that have a stray "hotel" in types.
      let typeOk: boolean;
      if (isLodging) {
        typeOk = primaryType
          ? LODGING_ACCEPT_SET.has(primaryType)
          : candTypesEarly.some((t) => LODGING_ACCEPT_SET.has(t));
      } else {
        typeOk = primaryType
          ? primaryType === resolvedType
          : candTypesEarly.includes(resolvedType);
      }
      if (!typeOk) {
        filteredOutWrongType++;
        continue;
      }

      // Hard filter: a competitor without a meaningful review base is useless for review intelligence
      if (candReviewCount == null || candReviewCount < Number(min_reviews)) {
        filteredOutLowReviews++;
        continue;
      }

      if (ownRating != null && candRating != null && Math.abs(ownRating - candRating) > rating_tolerance + 1) {
        // soft filter; allow but heavy penalty handled in score
      }

      const candTypes: string[] = Array.isArray(r.types) ? r.types : [];
      const categoryMatch = isLodging
        ? (LODGING_SEARCH_SET.has(r.primaryType) || candTypes.some((t) => LODGING_SEARCH_SET.has(t)))
        : (r.primaryType === resolvedType || candTypes.includes(resolvedType));

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
        category: resolvedType,
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
        search_type: isLodging ? `${resolvedType} (lodging family)` : resolvedType,
        candidates_found: results.length,
        filtered_out_wrong_type: filteredOutWrongType,
        filtered_out_low_reviews: filteredOutLowReviews,
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