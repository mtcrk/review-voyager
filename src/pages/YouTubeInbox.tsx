import { useState, useEffect, useCallback } from "react";
import { useBusiness } from "@/contexts/BusinessContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { Loader2, RefreshCw, ExternalLink, ThumbsUp, MessageCircle, Youtube } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { tr } from "date-fns/locale";

interface YouTubeVideo {
  id: string;
  youtube_video_id: string;
  title: string;
  channel_title: string;
  thumbnail_url: string | null;
  permalink: string;
  published_at: string;
  view_count: number;
  like_count: number;
  comment_count: number;
}

interface YouTubeComment {
  id: string;
  video_id: string;
  youtube_comment_id: string;
  author_display_name: string;
  author_avatar_url: string | null;
  comment_text: string;
  like_count: number;
  commented_at: string;
}

export default function YouTubeInbox() {
  const { activeBusiness } = useBusiness();
  const [videos, setVideos] = useState<YouTubeVideo[]>([]);
  const [comments, setComments] = useState<YouTubeComment[]>([]);
  const [selectedVideoId, setSelectedVideoId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);

  const loadData = useCallback(async () => {
    if (!activeBusiness) return;
    setLoading(true);
    const { data: vids } = await supabase
      .from("youtube_videos")
      .select("*")
      .eq("business_id", activeBusiness.id)
      .order("published_at", { ascending: false });
    setVideos((vids as YouTubeVideo[]) || []);
    if (vids && vids.length > 0 && !selectedVideoId) {
      setSelectedVideoId(vids[0].id);
    }
    setLoading(false);
  }, [activeBusiness, selectedVideoId]);

  const loadComments = useCallback(async (videoId: string) => {
    const { data } = await supabase
      .from("youtube_comments")
      .select("*")
      .eq("video_id", videoId)
      .order("like_count", { ascending: false });
    setComments((data as YouTubeComment[]) || []);
  }, []);

  useEffect(() => { loadData(); }, [loadData]);
  useEffect(() => { if (selectedVideoId) loadComments(selectedVideoId); }, [selectedVideoId, loadComments]);

  const handleFetch = async () => {
    if (!activeBusiness) return;
    setFetching(true);
    try {
      const { data, error } = await supabase.functions.invoke("youtube-fetch-reviews", {
        body: { business_id: activeBusiness.id, max_videos: 15 },
      });
      if (error) throw error;
      if (!data?.success) throw new Error(data?.error || "Bilinmeyen hata");
      toast({
        title: "YouTube verileri çekildi 🎉",
        description: `${data.videos} video, ${data.comments} yorum eklendi/güncellendi.`,
      });
      await loadData();
    } catch (e) {
      toast({
        title: "Hata",
        description: e instanceof Error ? e.message : "Çekme başarısız",
        variant: "destructive",
      });
    } finally {
      setFetching(false);
    }
  };

  if (!activeBusiness) {
    return <div className="p-8 text-muted-foreground">Önce bir işletme seçin.</div>;
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 py-6 space-y-6 max-w-7xl">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Youtube className="h-7 w-7 text-red-600" />
            YouTube Yorumları
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            "{activeBusiness.name}" adı geçen videoları ve yorumlarını çek.
          </p>
        </div>
        <Button onClick={handleFetch} disabled={fetching}>
          {fetching ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <RefreshCw className="h-4 w-4 mr-2" />}
          {fetching ? "Çekiliyor..." : "Videoları & Yorumları Çek"}
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
      ) : videos.length === 0 ? (
        <Card><CardContent className="py-12 text-center text-muted-foreground">
          Henüz veri yok. "Videoları & Yorumları Çek" butonuna basarak başla.
        </CardContent></Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Video list */}
          <div className="lg:col-span-1 space-y-3 max-h-[80vh] overflow-y-auto">
            {videos.map((v) => (
              <Card
                key={v.id}
                className={`cursor-pointer transition-colors ${selectedVideoId === v.id ? "border-primary" : ""}`}
                onClick={() => setSelectedVideoId(v.id)}
              >
                <CardContent className="p-3 flex gap-3">
                  {v.thumbnail_url && (
                    <img src={v.thumbnail_url} alt="" className="w-24 h-16 object-cover rounded" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium line-clamp-2">{v.title}</p>
                    <p className="text-xs text-muted-foreground mt-1">{v.channel_title}</p>
                    <div className="flex gap-2 mt-1 text-xs text-muted-foreground">
                      <span>{v.view_count.toLocaleString()} 👁</span>
                      <span>{v.comment_count} 💬</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Comments */}
          <div className="lg:col-span-2">
            {selectedVideoId && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center justify-between">
                    <span>Yorumlar ({comments.length})</span>
                    {videos.find((v) => v.id === selectedVideoId)?.permalink && (
                      <a
                        href={videos.find((v) => v.id === selectedVideoId)?.permalink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary flex items-center gap-1 hover:underline"
                      >
                        Videoya git <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 max-h-[70vh] overflow-y-auto">
                  {comments.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-6">
                      Bu video için yorum bulunamadı (yorumlar kapalı olabilir).
                    </p>
                  ) : comments.map((c) => (
                    <div key={c.id} className="flex gap-3 pb-4 border-b last:border-0">
                      {c.author_avatar_url ? (
                        <img src={c.author_avatar_url} alt="" className="w-8 h-8 rounded-full" />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-muted" />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-medium">{c.author_display_name}</span>
                          <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(c.commented_at), { addSuffix: true, locale: tr })}
                          </span>
                        </div>
                        <p className="text-sm mt-1 whitespace-pre-wrap break-words">{c.comment_text}</p>
                        <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1"><ThumbsUp className="h-3 w-3" /> {c.like_count}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  );
}