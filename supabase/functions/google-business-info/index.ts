import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

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
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

    const { business_id } = await req.json();
    if (!business_id) {
      throw new Error("business_id is required");
    }

    // Get business details (RLS ensures user owns this business)
    const { data: business, error: bizError } = await supabase
      .from("businesses")
      .select("*")
      .eq("id", business_id)
      .single();

    if (bizError || !business) {
      throw new Error("Business not found or access denied");
    }

    if (!business.google_connected || !business.google_location_id) {
      throw new Error("Google Business not connected for this business");
    }

    // Get refresh token
    const { data: credentials, error: credError } = await supabaseAdmin
      .from("business_credentials")
      .select("google_refresh_token")
      .eq("business_id", business_id)
      .single();

    if (credError || !credentials?.google_refresh_token) {
      throw new Error("Google credentials not found");
    }

    const accessToken = await refreshAccessToken(credentials.google_refresh_token);

    // Fetch location details from GBP API
    const locationUrl = `https://mybusinessbusinessinformation.googleapis.com/v1/${business.google_location_id}?readMask=name,title,phoneNumbers,categories,storefrontAddress,websiteUri,regularHours,metadata,latlng`;

    console.log(`Fetching business info from: ${locationUrl}`);

    const locationResponse = await fetch(locationUrl, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!locationResponse.ok) {
      const errorText = await locationResponse.text();
      console.error("Google Business Info API error:", errorText);

      await supabaseAdmin.from("integration_logs").insert({
        business_id,
        provider: "google",
        action: "fetch_business_info",
        status: "error",
        http_status: locationResponse.status,
        error_message: errorText.substring(0, 500),
      });

      throw new Error(`Google API error: ${locationResponse.status}`);
    }

    const locationData = await locationResponse.json();

    // Parse the response into a clean format
    const businessInfo = {
      name: locationData.title || business.name,
      phone: locationData.phoneNumbers?.primaryPhone || null,
      additionalPhones: locationData.phoneNumbers?.additionalPhones || [],
      address: locationData.storefrontAddress
        ? formatAddress(locationData.storefrontAddress)
        : null,
      addressComponents: locationData.storefrontAddress || null,
      website: locationData.websiteUri || null,
      categories: {
        primary: locationData.categories?.primaryCategory?.displayName || null,
        additional:
          locationData.categories?.additionalCategories?.map(
            (c: any) => c.displayName
          ) || [],
      },
      regularHours: formatHours(locationData.regularHours),
      placeId: locationData.metadata?.placeId || business.place_id,
      mapsUri: locationData.metadata?.mapsUri || null,
    };

    // Update business name and place_id if different
    const updates: Record<string, unknown> = {};
    if (businessInfo.name && businessInfo.name !== business.name) {
      updates.name = businessInfo.name;
    }
    if (businessInfo.placeId && businessInfo.placeId !== business.place_id) {
      updates.place_id = businessInfo.placeId;
    }
    if (locationData.storefrontAddress?.locality && !business.city) {
      updates.city = locationData.storefrontAddress.locality;
    }
    const latlng = locationData.latlng || locationData.metadata?.latlng;
    if (latlng) {
      updates.lat = latlng.latitude;
      updates.lng = latlng.longitude;
    }

    if (Object.keys(updates).length > 0) {
      await supabase.from("businesses").update(updates).eq("id", business_id);
    }

    // Log success
    await supabaseAdmin.from("integration_logs").insert({
      business_id,
      provider: "google",
      action: "fetch_business_info",
      status: "success",
      http_status: 200,
    });

    return new Response(JSON.stringify({ success: true, businessInfo }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Error in google-business-info:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

function formatAddress(address: any): string {
  const parts = [];
  if (address.addressLines) parts.push(...address.addressLines);
  if (address.locality) parts.push(address.locality);
  if (address.administrativeArea) parts.push(address.administrativeArea);
  if (address.postalCode) parts.push(address.postalCode);
  if (address.regionCode) parts.push(address.regionCode);
  return parts.join(", ");
}

function formatHours(regularHours: any): any[] | null {
  if (!regularHours?.periods) return null;

  const dayNames: Record<string, string> = {
    MONDAY: "Pazartesi",
    TUESDAY: "Salı",
    WEDNESDAY: "Çarşamba",
    THURSDAY: "Perşembe",
    FRIDAY: "Cuma",
    SATURDAY: "Cumartesi",
    SUNDAY: "Pazar",
  };

  return regularHours.periods.map((period: any) => ({
    day: dayNames[period.openDay] || period.openDay,
    openTime: `${String(period.openTime?.hours || 0).padStart(2, "0")}:${String(period.openTime?.minutes || 0).padStart(2, "0")}`,
    closeTime: `${String(period.closeTime?.hours || 0).padStart(2, "0")}:${String(period.closeTime?.minutes || 0).padStart(2, "0")}`,
  }));
}
