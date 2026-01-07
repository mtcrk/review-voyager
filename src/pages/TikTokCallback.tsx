import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Music2 } from "lucide-react";

export default function TikTokCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get("code");
      const state = searchParams.get("state");
      const error = searchParams.get("error");

      // Handle TikTok error response
      if (error) {
        console.error("TikTok OAuth error:", error, searchParams.get("error_description"));
        setStatus("error");
        setErrorMessage(searchParams.get("error_description") || "Authentication was cancelled or denied.");
        setTimeout(() => navigate("/channels/tiktok?error=1"), 2000);
        return;
      }

      // Validate required params
      if (!code || !state) {
        setStatus("error");
        setErrorMessage("Missing authorization code or state.");
        setTimeout(() => navigate("/channels/tiktok?error=1"), 2000);
        return;
      }

      // Verify state matches what we stored
      const storedState = sessionStorage.getItem("tiktok_oauth_state");
      if (!storedState || storedState !== state) {
        console.error("State mismatch:", { stored: storedState, received: state });
        setStatus("error");
        setErrorMessage("Security validation failed. Please try again.");
        setTimeout(() => navigate("/channels/tiktok?error=1"), 2000);
        return;
      }

      // Clear stored state
      sessionStorage.removeItem("tiktok_oauth_state");

      try {
        // Exchange code for tokens via edge function
        const response = await supabase.functions.invoke("tiktok-auth", {
          body: { action: "exchange", code, state },
        });

        if (response.error || !response.data?.success) {
          throw new Error(response.data?.error || response.error?.message || "Token exchange failed");
        }

        setStatus("success");
        setTimeout(() => navigate("/channels/tiktok?connected=1"), 1500);
      } catch (error) {
        console.error("Callback error:", error);
        setStatus("error");
        setErrorMessage(error instanceof Error ? error.message : "Connection failed");
        setTimeout(() => navigate("/channels/tiktok?error=1"), 2000);
      }
    };

    handleCallback();
  }, [searchParams, navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center">
        <div className="mb-6 flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-black">
            <Music2 className="h-8 w-8 text-white" />
          </div>
        </div>

        {status === "loading" && (
          <>
            <div className="mb-4 flex justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
            <h2 className="text-xl font-semibold">Connecting TikTok...</h2>
            <p className="mt-2 text-muted-foreground">Please wait while we complete the connection.</p>
          </>
        )}

        {status === "success" && (
          <>
            <div className="mb-4 flex justify-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
            <h2 className="text-xl font-semibold text-green-600">Connected!</h2>
            <p className="mt-2 text-muted-foreground">Redirecting you back...</p>
          </>
        )}

        {status === "error" && (
          <>
            <div className="mb-4 flex justify-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
            </div>
            <h2 className="text-xl font-semibold text-red-600">Connection Failed</h2>
            <p className="mt-2 text-muted-foreground">{errorMessage}</p>
            <p className="mt-1 text-sm text-muted-foreground">Redirecting you back...</p>
          </>
        )}
      </div>
    </div>
  );
}
