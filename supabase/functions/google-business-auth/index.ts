import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("Missing authorization header");
    }

    const accessToken = authHeader.replace(/^Bearer\s+/i, "").trim();
    if (!accessToken) {
      throw new Error("Missing access token");
    }

    // User client for RLS-protected queries (with caller auth context)
    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: { Authorization: `Bearer ${accessToken}` },
      },
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Service role client for accessing secure credentials table
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();

    if (userError || !user) {
      throw new Error("Unauthorized");
    }

    const requestBody = await req.json();
    const { action, code, businesses } = requestBody;

    // Initiate OAuth flow
    if (action === "initiate") {
      const redirectUri = `${req.headers.get("origin")}/auth/google-business/callback`;
      const clientId = Deno.env.get("GOOGLE_BUSINESS_CLIENT_ID");
      
      if (!clientId) {
        throw new Error("Google Business Client ID not configured");
      }

      const authUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
      authUrl.searchParams.set("client_id", clientId);
      authUrl.searchParams.set("redirect_uri", redirectUri);
      authUrl.searchParams.set("response_type", "code");
      authUrl.searchParams.set("scope", "https://www.googleapis.com/auth/business.manage");
      authUrl.searchParams.set("access_type", "offline");
      authUrl.searchParams.set("prompt", "consent select_account");
      authUrl.searchParams.set("state", user.id);

      return new Response(
        JSON.stringify({ authUrl: authUrl.toString() }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Exchange code for tokens
    if (action === "exchange" && code) {
      const clientId = Deno.env.get("GOOGLE_BUSINESS_CLIENT_ID");
      const clientSecret = Deno.env.get("GOOGLE_BUSINESS_CLIENT_SECRET");
      const redirectUri = `${req.headers.get("origin")}/auth/google-business/callback`;

      if (!clientId || !clientSecret) {
        throw new Error("Google Business credentials not configured");
      }

      const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          code,
          client_id: clientId,
          client_secret: clientSecret,
          redirect_uri: redirectUri,
          grant_type: "authorization_code",
        }),
      });

      if (!tokenResponse.ok) {
        const error = await tokenResponse.text();
        console.error("Token exchange error:", error);
        throw new Error("Failed to exchange authorization code");
      }

      const tokens = await tokenResponse.json();
      const { access_token, refresh_token } = tokens;

      // Fetch accounts
      const accountsResponse = await fetch(
        "https://mybusinessaccountmanagement.googleapis.com/v1/accounts",
        {
          headers: { Authorization: `Bearer ${access_token}` },
        }
      );

      const accountsBody = await accountsResponse.text();
      console.log("Accounts response status:", accountsResponse.status);
      console.log("Accounts response body:", accountsBody);

      if (!accountsResponse.ok) {
        throw new Error(`Failed to fetch Google Business accounts: ${accountsBody}`);
      }

      const accountsData = JSON.parse(accountsBody);
      const accounts = accountsData.accounts || [];
      console.log("Found accounts:", accounts.length);

      // Fetch locations for each account
      const businessList = [];
      for (const account of accounts) {
        const locationsUrl = `https://mybusinessbusinessinformation.googleapis.com/v1/${account.name}/locations?readMask=name,title,metadata,storefrontAddress`;
        console.log("Fetching locations from:", locationsUrl);
        
        const locationsResponse = await fetch(locationsUrl, {
          headers: { Authorization: `Bearer ${access_token}` },
        });

        const locationsBody = await locationsResponse.text();
        console.log("Locations response status:", locationsResponse.status, "body:", locationsBody);

        if (locationsResponse.ok) {
          const locationsData = JSON.parse(locationsBody);
          const locations = locationsData.locations || [];
          
          for (const location of locations) {
            businessList.push({
              account_id: account.name,
              location_id: location.name,
              name: location.title || location.locationName,
              place_id: location.metadata?.placeId,
            });
          }
        } else {
          console.error("Locations API failed for account:", account.name, "status:", locationsResponse.status);
        }
      }

      return new Response(
        JSON.stringify({ 
          businesses: businessList,
          refresh_token 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Save selected businesses
    if (action === "save" && businesses && businesses.length > 0) {
      const refresh_token = requestBody.refresh_token;
      
      for (const business of businesses) {
        // Check if user already has a business with this google_location_id or an unconnected business
        const { data: existingByLocation } = await supabaseClient
          .from("businesses")
          .select("id")
          .eq("user_id", user.id)
          .eq("google_location_id", business.location_id)
          .maybeSingle();

        let businessId: string;

        if (existingByLocation) {
          // Update existing business that already has this location
          const { data: updated, error: updateError } = await supabaseClient
            .from("businesses")
            .update({
              name: business.name,
              place_id: business.place_id,
              google_account_id: business.account_id,
              google_location_id: business.location_id,
              google_connected: true,
            })
            .eq("id", existingByLocation.id)
            .select()
            .single();

          if (updateError) throw updateError;
          businessId = updated.id;
        } else {
          // Try to match an existing unconnected business by name (case-insensitive)
          const { data: nameMatch } = await supabaseClient
            .from("businesses")
            .select("id")
            .eq("user_id", user.id)
            .eq("google_connected", false)
            .ilike("name", business.name)
            .limit(1)
            .maybeSingle();

          if (nameMatch) {
            // Update matched business — keep its existing name
            const { data: updated, error: updateError } = await supabaseClient
              .from("businesses")
              .update({
                place_id: business.place_id,
                google_account_id: business.account_id,
                google_location_id: business.location_id,
                google_connected: true,
              })
              .eq("id", nameMatch.id)
              .select()
              .single();

            if (updateError) throw updateError;
            businessId = updated.id;
          } else {
            // Create new business
            const { data: inserted, error: insertError } = await supabaseClient
              .from("businesses")
              .insert({
                user_id: user.id,
                name: business.name,
                place_id: business.place_id,
                google_account_id: business.account_id,
                google_location_id: business.location_id,
                google_connected: true,
              })
              .select()
              .single();

            if (insertError) throw insertError;
            businessId = inserted.id;
          }
        }

        // Upsert refresh token in secure credentials table
        const { error: credError } = await supabaseAdmin
          .from("business_credentials")
          .upsert({
            business_id: businessId,
            google_refresh_token: refresh_token,
          }, { onConflict: "business_id" });

        if (credError) {
          console.error("Error storing credentials:", credError);
          throw credError;
        }
      }

      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    throw new Error("Invalid action");

  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});