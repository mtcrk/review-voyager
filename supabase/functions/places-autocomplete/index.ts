import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';

const API_KEY = Deno.env.get('GOOGLE_PLACES_API_KEY') ?? '';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), {
      status,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  try {
    const body = await req.json().catch(() => ({}));
    if (!API_KEY) return json({ suggestions: [], error: 'Missing API key' });

    // Details mode
    if (body?.details && typeof body.place_id === 'string') {
      const res = await fetch(`https://places.googleapis.com/v1/places/${encodeURIComponent(body.place_id)}`, {
        headers: {
          'X-Goog-Api-Key': API_KEY,
          'X-Goog-FieldMask': 'id,displayName,location,rating,userRatingCount,primaryType',
        },
      });
      const data = await res.json();
      if (!res.ok) return json({ place: null, error: data?.error?.message ?? 'details_failed' });
      return json({
        place: {
          place_id: data.id,
          name: data.displayName?.text ?? null,
          lat: data.location?.latitude ?? null,
          lng: data.location?.longitude ?? null,
          rating: data.rating ?? null,
          review_count: data.userRatingCount ?? null,
          primary_type: data.primaryType ?? null,
        },
      });
    }

    const query = typeof body?.query === 'string' ? body.query.trim() : '';
    if (query.length < 2) return json({ suggestions: [] });

    const lat = typeof body?.lat === 'number' ? body.lat : null;
    const lng = typeof body?.lng === 'number' ? body.lng : null;

    const buildBody = (withType: boolean) => {
      const b: any = { input: query };
      if (withType) b.includedPrimaryTypes = ['lodging'];
      if (lat != null && lng != null) {
        b.locationBias = { circle: { center: { latitude: lat, longitude: lng }, radius: 30000 } };
      }
      return b;
    };

    let res = await fetch('https://places.googleapis.com/v1/places:autocomplete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Goog-Api-Key': API_KEY },
      body: JSON.stringify(buildBody(true)),
    });
    if (!res.ok) {
      // Retry without includedPrimaryTypes
      res = await fetch('https://places.googleapis.com/v1/places:autocomplete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Goog-Api-Key': API_KEY },
        body: JSON.stringify(buildBody(false)),
      });
    }
    const data = await res.json();
    if (!res.ok) return json({ suggestions: [], error: data?.error?.message ?? 'autocomplete_failed' });

    const suggestions = (data?.suggestions ?? [])
      .map((s: any) => s.placePrediction)
      .filter(Boolean)
      .slice(0, 6)
      .map((p: any) => ({
        place_id: p.placeId,
        main_text: p.structuredFormat?.mainText?.text ?? p.text?.text ?? '',
        secondary_text: p.structuredFormat?.secondaryText?.text ?? '',
        full_text: p.text?.text ?? '',
      }));

    return json({ suggestions });
  } catch (e) {
    return json({ suggestions: [], error: e instanceof Error ? e.message : 'unknown' });
  }
});