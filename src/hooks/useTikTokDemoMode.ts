import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { TIKTOK_CONFIG } from "@/lib/tiktokConfig";
import { TikTokComment } from "@/hooks/useTikTokComments";
import { TikTokVideo } from "@/hooks/useTikTokVideos";

export function useTikTokDemoMode(socialConnectionId: string | null, videoId: string | null) {
  const [isDemoMode, setIsDemoMode] = useState(TIKTOK_CONFIG.canUseDemo);
  const [isLoadingSamples, setIsLoadingSamples] = useState(false);
  const [isLoadingDemoVideo, setIsLoadingDemoVideo] = useState(false);
  const { toast } = useToast();

  const toggleDemoMode = useCallback(() => {
    if (!TIKTOK_CONFIG.canUseDemo) return;
    setIsDemoMode(prev => !prev);
  }, []);

  const loadSampleComments = useCallback(async (tiktokVideoId: string, videoDbId: string): Promise<TikTokComment[]> => {
    if (!socialConnectionId || !videoId) return [];
    
    setIsLoadingSamples(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/tiktok-seed-demo-comments`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${session.access_token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ 
            social_connection_id: socialConnectionId,
            video_id: videoId,
            tiktok_video_id: tiktokVideoId,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to load sample comments");
      }

      toast({
        title: "Demo yorumlar yüklendi",
        description: `${data.comments?.length || 0} örnek yorum eklendi`,
      });

      return data.comments || [];
    } catch (err) {
      const message = err instanceof Error ? err.message : "Bilinmeyen hata";
      toast({
        title: "Hata",
        description: message,
        variant: "destructive",
      });
      return [];
    } finally {
      setIsLoadingSamples(false);
    }
  }, [socialConnectionId, videoId, toast]);

  const simulateSendReply = useCallback(async (
    commentId: string, 
    replyText: string,
    onSuccess: (reply: any) => void
  ) => {
    if (!socialConnectionId) return;
    
    try {
      // Get the comment to find its business_id
      const { data: comment } = await supabase
        .from("tiktok_comments")
        .select("business_id")
        .eq("id", commentId)
        .single();

      // Create simulated reply in database
      const { data: reply, error } = await supabase
        .from("tiktok_comment_replies")
        .insert({
          business_id: comment?.business_id || socialConnectionId, // fallback
          comment_id: commentId,
          reply_text: replyText,
          send_status: "sent",
          tiktok_reply_id: `SIMULATED_${Date.now()}`,
          sent_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      // Update comment status
      await supabase
        .from("tiktok_comments")
        .update({ status: "sent" })
        .eq("id", commentId);

      toast({
        title: "Simüle Gönderim",
        description: "Demo modunda yanıt simüle edildi (gerçek gönderim yapılmadı)",
      });

      onSuccess(reply);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Bilinmeyen hata";
      toast({
        title: "Simülasyon Hatası",
        description: message,
        variant: "destructive",
      });
    }
  }, [socialConnectionId, toast]);

  const loadDemoVideo = useCallback(async (): Promise<TikTokVideo | null> => {
    if (!socialConnectionId) return null;
    
    setIsLoadingDemoVideo(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/tiktok-seed-demo-video`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${session.access_token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ social_connection_id: socialConnectionId }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to load demo video");
      }

      toast({
        title: data.created ? "Demo video oluşturuldu" : "Demo video mevcut",
        description: data.message,
      });

      return data.video || null;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Bilinmeyen hata";
      toast({
        title: "Hata",
        description: message,
        variant: "destructive",
      });
      return null;
    } finally {
      setIsLoadingDemoVideo(false);
    }
  }, [socialConnectionId, toast]);

  return {
    isDemoMode,
    toggleDemoMode,
    loadSampleComments,
    isLoadingSamples,
    loadDemoVideo,
    isLoadingDemoVideo,
    simulateSendReply,
    canUseDemo: TIKTOK_CONFIG.canUseDemo,
    canSimulateSend: TIKTOK_CONFIG.canSimulateSend,
    isSandbox: TIKTOK_CONFIG.isSandbox,
    isProduction: TIKTOK_CONFIG.isProduction,
  };
}
