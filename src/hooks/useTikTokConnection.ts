import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface TikTokConnectionInfo {
  id: string;
  provider_user_id: string;
  username: string | null;
  avatar_url: string | null;
  connected_at: string;
  business_id: string | null;
}

export function useTikTokConnection() {
  const [connection, setConnection] = useState<TikTokConnectionInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchConnection = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setConnection(null);
        return;
      }

      // Get user's TikTok connection
      const { data, error: dbError } = await supabase
        .from("social_connections")
        .select("id, provider_user_id, username, avatar_url, connected_at, business_id")
        .eq("provider", "tiktok")
        .eq("user_id", session.user.id)
        .maybeSingle();

      if (dbError) throw dbError;
      
      setConnection(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Bağlantı bilgisi alınamadı";
      setError(message);
      setConnection(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchConnection();
  }, [fetchConnection]);

  return { connection, loading, error, refetch: fetchConnection };
}
