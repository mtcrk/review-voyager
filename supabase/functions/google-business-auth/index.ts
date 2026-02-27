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

    // User client for RLS-protected queries
    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Service role client for accessing secure credentials table
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("Missing authorization header");
    }

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(
      authHeader.replace("Bearer ", "")
    );

    if (userError || !user) {
      throw new Error("Unauthorized");
    }

    const { action, code, businesses } = await req.json();

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
          // Fallback: If Business Information API is not enabled,
          // add the account itself so the user can still proceed
          console.log("Locations API failed, using account as fallback for:", account.accountName);
          businessList.push({
            account_id: account.name,
            location_id: account.name, // use account name as location fallback
            name: account.accountName || "İşletme",
            place_id: null,
          });
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
      const { refresh_token } = await req.json();
      
      for (const business of businesses) {
        // Insert business (without refresh token - it goes to separate secure table)
        const { data: insertedBusiness, error: insertError } = await supabaseClient
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

        if (insertError) {
          console.error("Error inserting business:", insertError);
          throw insertError;
        }

        // Store refresh token in secure credentials table (service role only)
        const { error: credError } = await supabaseAdmin
          .from("business_credentials")
          .insert({
            business_id: insertedBusiness.id,
            google_refresh_token: refresh_token,
          });

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