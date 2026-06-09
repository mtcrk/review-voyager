import { useState, useCallback, useEffect } from "react";
import { s as supabase } from "../main.mjs";
function useTikTokConnection() {
  const [connection, setConnection] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const fetchConnection = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setConnection(null);
        return;
      }
      const { data, error: dbError } = await supabase.from("social_connections").select("id, provider_user_id, username, avatar_url, connected_at, business_id").eq("provider", "tiktok").eq("user_id", session.user.id).maybeSingle();
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
export {
  useTikTokConnection as u
};
