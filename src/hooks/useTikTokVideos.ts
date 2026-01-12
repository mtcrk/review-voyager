import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface TikTokVideo {
  id: string;
  business_id: string;
  social_connection_id: string;
  tiktok_video_id: string;
  caption: string | null;
  permalink: string | null;
  thumbnail_url: string | null;
  published_at: string | null;
  view_count: number;
  like_count: number;
  comment_count: number;
  share_count: number;
  created_at: string;
  updated_at: string;
}

export function useTikTokVideos(socialConnectionId: string | null) {
  const [videos, setVideos] = useState<TikTokVideo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchVideos = useCallback(async (refresh = false) => {
    if (!socialConnectionId) return;
    
    setLoading(true);
    setError(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error("Not authenticated");
      }

      if (refresh) {
        // Fetch from TikTok API and update DB - use connection_id instead of business_id
        const response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/tiktok-videos?connection_id=${socialConnectionId}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${session.access_token}`,
              "Content-Type": "application/json",
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          if (data.code === "NOT_CONNECTED") {
            setError("TikTok hesabı bağlı değil");
            return;
          }
          if (data.code === "TOKEN_EXPIRED") {
            setError("TikTok oturumu sona erdi. Lütfen yeniden bağlayın.");
            return;
          }
          throw new Error(data.error || "Failed to fetch videos");
        }

        setVideos(data.videos || []);
        toast({
          title: "Videolar güncellendi",
          description: `${data.fetched || 0} video TikTok'tan alındı`,
        });
      } else {
        // Just fetch from local DB using social_connection_id
        const { data, error: dbError } = await supabase
          .from("tiktok_videos")
          .select("*")
          .eq("social_connection_id", socialConnectionId)
          .order("published_at", { ascending: false });

        if (dbError) throw dbError;
        setVideos(data || []);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Bilinmeyen hata";
      setError(message);
      toast({
        title: "Hata",
        description: message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [socialConnectionId, toast]);

  return { videos, loading, error, fetchVideos };
}
