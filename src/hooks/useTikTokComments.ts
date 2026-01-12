import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface TikTokReplySuggestion {
  id: string;
  business_id: string;
  comment_id: string;
  model: string;
  tone: string;
  language: string;
  suggested_text: string;
  intent: string | null;
  confidence: number | null;
  rationale: string | null;
  safe_to_reply: boolean;
  created_at: string;
}

export interface TikTokCommentReply {
  id: string;
  business_id: string;
  comment_id: string;
  sent_by_user_id: string | null;
  reply_text: string;
  tiktok_reply_id: string | null;
  send_status: string;
  error_message: string | null;
  sent_at: string | null;
  created_at: string;
}

export interface TikTokComment {
  id: string;
  business_id: string;
  social_connection_id: string;
  video_id: string;
  tiktok_video_id: string;
  tiktok_comment_id: string;
  parent_comment_id: string | null;
  author_username: string | null;
  author_display_name: string | null;
  author_avatar_url: string | null;
  comment_text: string;
  like_count: number;
  reply_count: number;
  status: string;
  commented_at: string | null;
  created_at: string;
  updated_at: string;
  suggestions?: TikTokReplySuggestion[];
  replies?: TikTokCommentReply[];
}

export function useTikTokComments(businessId: string | null, videoId: string | null) {
  const [comments, setComments] = useState<TikTokComment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchComments = useCallback(async (refresh = false) => {
    if (!businessId || !videoId) return;
    
    setLoading(true);
    setError(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error("Not authenticated");
      }

      if (refresh) {
        // Fetch from TikTok API
        const response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/tiktok-comments?business_id=${businessId}&video_id=${videoId}`,
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
          throw new Error(data.error || "Failed to fetch comments");
        }

        setComments(data.comments || []);
        toast({
          title: "Yorumlar güncellendi",
          description: `${data.fetched || 0} yorum TikTok'tan alındı`,
        });
      } else {
        // Just fetch from local DB
        const { data, error: dbError } = await supabase
          .from("tiktok_comments")
          .select(`
            *,
            suggestions:tiktok_reply_suggestions(*),
            replies:tiktok_comment_replies(*)
          `)
          .eq("video_id", videoId)
          .order("commented_at", { ascending: false });

        if (dbError) throw dbError;
        setComments((data as TikTokComment[]) || []);
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
  }, [businessId, videoId, toast]);

  const generateSuggestions = useCallback(async (commentId: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/tiktok-suggest-reply`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${session.access_token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ comment_id: commentId }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate suggestions");
      }

      // Update local state
      setComments(prev => prev.map(c => 
        c.id === commentId 
          ? { ...c, status: "suggested", suggestions: data.suggestions }
          : c
      ));

      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Bilinmeyen hata";
      toast({
        title: "AI Yanıt Hatası",
        description: message,
        variant: "destructive",
      });
      throw err;
    }
  }, [toast]);

  const sendReply = useCallback(async (commentId: string, replyText: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/tiktok-send-reply`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${session.access_token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ comment_id: commentId, reply_text: replyText }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to send reply");
      }

      // Update local state
      setComments(prev => prev.map(c => 
        c.id === commentId 
          ? { 
              ...c, 
              status: "sent", 
              replies: [...(c.replies || []), data.reply] 
            }
          : c
      ));

      toast({
        title: "Yanıt gönderildi",
        description: "Yanıtınız başarıyla TikTok'a gönderildi",
      });

      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Bilinmeyen hata";
      toast({
        title: "Gönderim Hatası",
        description: message,
        variant: "destructive",
      });
      throw err;
    }
  }, [toast]);

  return { 
    comments, 
    loading, 
    error, 
    fetchComments, 
    generateSuggestions,
    sendReply,
  };
}
