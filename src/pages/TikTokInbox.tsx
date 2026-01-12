import { useState, useEffect } from "react";
import { useBusiness } from "@/contexts/BusinessContext";
import { useTikTokVideos, TikTokVideo } from "@/hooks/useTikTokVideos";
import { useTikTokComments, TikTokComment } from "@/hooks/useTikTokComments";
import { useTikTokDemoMode } from "@/hooks/useTikTokDemoMode";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { TikTokSandboxBanner } from "@/components/tiktok/TikTokSandboxBanner";
import { TikTokComplianceCard } from "@/components/tiktok/TikTokComplianceCard";
import { TikTokDemoModeToggle } from "@/components/tiktok/TikTokDemoModeToggle";
import { 
  RefreshCw, 
  MessageSquare, 
  Eye, 
  Heart, 
  Share2, 
  Sparkles,
  Send,
  AlertCircle,
  CheckCircle,
  Clock,
  X,
  Video,
  ChevronRight,
  Download,
  Ban,
  Beaker,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { tr } from "date-fns/locale";
import { Link } from "react-router-dom";
import { TIKTOK_CONFIG } from "@/lib/tiktokConfig";

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline"; icon: React.ReactNode }> = {
  open: { label: "Açık", variant: "outline", icon: <Clock className="h-3 w-3" /> },
  suggested: { label: "Öneri Hazır", variant: "secondary", icon: <Sparkles className="h-3 w-3" /> },
  approved: { label: "Onaylandı", variant: "default", icon: <CheckCircle className="h-3 w-3" /> },
  sent: { label: "Gönderildi", variant: "default", icon: <CheckCircle className="h-3 w-3" /> },
  failed: { label: "Hata", variant: "destructive", icon: <AlertCircle className="h-3 w-3" /> },
  ignored: { label: "Yoksayıldı", variant: "outline", icon: <X className="h-3 w-3" /> },
};

function VideoCard({ video, isSelected, onClick }: { video: TikTokVideo; isSelected: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full text-left p-3 rounded-lg border transition-all hover:bg-accent/50",
        isSelected && "bg-accent border-primary"
      )}
    >
      <div className="flex gap-3">
        {video.thumbnail_url ? (
          <img 
            src={video.thumbnail_url} 
            alt="" 
            className="w-16 h-24 object-cover rounded-md bg-muted"
          />
        ) : (
          <div className="w-16 h-24 bg-muted rounded-md flex items-center justify-center">
            <Video className="h-6 w-6 text-muted-foreground" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium line-clamp-2 mb-1">
            {video.caption || "Video"}
          </p>
          {video.published_at && (
            <p className="text-xs text-muted-foreground mb-2">
              {formatDistanceToNow(new Date(video.published_at), { addSuffix: true, locale: tr })}
            </p>
          )}
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Eye className="h-3 w-3" />
              {video.view_count.toLocaleString()}
            </span>
            <span className="flex items-center gap-1">
              <Heart className="h-3 w-3" />
              {video.like_count.toLocaleString()}
            </span>
            <span className="flex items-center gap-1">
              <MessageSquare className="h-3 w-3" />
              {video.comment_count}
            </span>
          </div>
        </div>
        <ChevronRight className="h-4 w-4 text-muted-foreground self-center" />
      </div>
    </button>
  );
}

interface CommentCardProps {
  comment: TikTokComment;
  onGenerateSuggestions: () => void;
  onSendReply: (text: string) => void;
  onSimulateSend: (text: string) => void;
  isGenerating: boolean;
  isSending: boolean;
  isDemoMode: boolean;
  canSimulateSend: boolean;
  isSandbox: boolean;
}

function CommentCard({ 
  comment, 
  onGenerateSuggestions,
  onSendReply,
  onSimulateSend,
  isGenerating,
  isSending,
  isDemoMode,
  canSimulateSend,
  isSandbox,
}: CommentCardProps) {
  const [replyText, setReplyText] = useState("");
  const [showReplyBox, setShowReplyBox] = useState(false);

  const status = statusConfig[comment.status] || statusConfig.open;
  const suggestions = comment.suggestions || [];
  const replies = comment.replies || [];
  const latestReply = replies.length > 0 ? replies[replies.length - 1] : null;
  
  // Check if this is a demo comment
  const isDemo = comment.raw && typeof comment.raw === 'object' && 'demo' in comment.raw && (comment.raw as any).demo;
  
  // Check if suggestion recommends ignoring
  const shouldIgnore = suggestions.length > 0 && suggestions[0].safe_to_reply === false;

  const handleSuggestionClick = (text: string) => {
    setReplyText(text);
    setShowReplyBox(true);
  };

  const handleSend = () => {
    if (!replyText.trim()) return;
    
    if (isDemoMode && canSimulateSend) {
      onSimulateSend(replyText.trim());
    } else {
      onSendReply(replyText.trim());
    }
  };
  
  // Determine if send is disabled
  const isSendDisabled = isSandbox && !isDemoMode;

  return (
    <Card className={cn("mb-3", isDemo && "border-dashed border-yellow-500/50")}>
      <CardContent className="p-4">
        {/* Demo badge */}
        {isDemo && (
          <div className="flex items-center gap-1 mb-2">
            <Badge variant="outline" className="text-xs bg-yellow-50 text-yellow-700 border-yellow-300">
              <Beaker className="h-3 w-3 mr-1" />
              Demo Yorum
            </Badge>
          </div>
        )}
        
        {/* Comment Header */}
        <div className="flex items-start gap-3 mb-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={comment.author_avatar_url || undefined} />
            <AvatarFallback>
              {comment.author_display_name?.charAt(0) || comment.author_username?.charAt(0) || "?"}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-medium text-sm">
                {comment.author_display_name || comment.author_username || "Kullanıcı"}
              </span>
              {comment.author_username && (
                <span className="text-xs text-muted-foreground">@{comment.author_username}</span>
              )}
              <div className="ml-auto flex items-center gap-1">
                {latestReply?.tiktok_reply_id?.startsWith("SIMULATED") && (
                  <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-300">
                    Simüle
                  </Badge>
                )}
                <Badge variant={status.variant} className="gap-1">
                  {status.icon}
                  {status.label}
                </Badge>
              </div>
            </div>
            <p className="text-sm">{comment.comment_text}</p>
            <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
              {comment.commented_at && (
                <span>
                  {formatDistanceToNow(new Date(comment.commented_at), { addSuffix: true, locale: tr })}
                </span>
              )}
              <span className="flex items-center gap-1">
                <Heart className="h-3 w-3" />
                {comment.like_count}
              </span>
            </div>
          </div>
        </div>

        {/* Sent Reply Display */}
        {latestReply && latestReply.send_status === "sent" && (
          <div className="ml-11 p-3 bg-primary/10 rounded-lg mb-3">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle className="h-4 w-4 text-primary" />
              <span className="text-xs font-medium text-primary">
                {latestReply.tiktok_reply_id?.startsWith("SIMULATED") ? "Simüle Gönderildi" : "Gönderildi"}
              </span>
              {latestReply.sent_at && (
                <span className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(latestReply.sent_at), { addSuffix: true, locale: tr })}
                </span>
              )}
            </div>
            <p className="text-sm">{latestReply.reply_text}</p>
          </div>
        )}

        {/* Failed Reply Display */}
        {latestReply && latestReply.send_status === "failed" && (
          <div className="ml-11 p-3 bg-destructive/10 rounded-lg mb-3">
            <div className="flex items-center gap-2 mb-1">
              <AlertCircle className="h-4 w-4 text-destructive" />
              <span className="text-xs font-medium text-destructive">Gönderim Başarısız</span>
            </div>
            <p className="text-sm">{latestReply.reply_text}</p>
            {latestReply.error_message && (
              <p className="text-xs text-destructive mt-1">{latestReply.error_message}</p>
            )}
          </div>
        )}

        {/* Actions for non-sent comments */}
        {comment.status !== "sent" && (
          <div className="ml-11 space-y-3">
            {/* AI Suggestions */}
            {suggestions.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <p className="text-xs font-medium text-muted-foreground">AI Önerileri:</p>
                  {shouldIgnore && (
                    <Badge variant="outline" className="text-xs bg-red-50 text-red-700 border-red-300">
                      <Ban className="h-3 w-3 mr-1" />
                      Yoksaymak Önerilir
                    </Badge>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {suggestions.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => handleSuggestionClick(s.suggested_text)}
                      className="text-left px-3 py-2 text-sm bg-secondary rounded-lg hover:bg-secondary/80 transition-colors max-w-full"
                    >
                      <span className="text-xs text-muted-foreground block mb-1 capitalize">
                        {s.tone === "friendly" ? "😊 Samimi" : s.tone === "professional" ? "👔 Profesyonel" : "😄 Esprili"}
                      </span>
                      <span className="line-clamp-2">{s.suggested_text}</span>
                    </button>
                  ))}
                </div>
                {suggestions[0]?.rationale && (
                  <p className="text-xs text-muted-foreground italic">
                    💡 {suggestions[0].rationale}
                  </p>
                )}
              </div>
            )}

            {/* Reply Box */}
            {showReplyBox && (
              <div className="space-y-2">
                <Textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Yanıtınızı yazın..."
                  className="min-h-[80px]"
                  maxLength={500}
                />
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    {replyText.length}/500
                  </span>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setShowReplyBox(false)}
                    >
                      İptal
                    </Button>
                    {isSendDisabled ? (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span>
                            <Button size="sm" disabled>
                              <Send className="h-4 w-4 mr-1" />
                              Gönder
                            </Button>
                          </span>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Yanıt göndermek için Production onayı gereklidir.<br/>Akışı simüle etmek için Demo Modu'nu açın.</p>
                        </TooltipContent>
                      </Tooltip>
                    ) : (
                      <Button 
                        size="sm"
                        onClick={handleSend}
                        disabled={!replyText.trim() || isSending}
                        className={isDemoMode && canSimulateSend ? "bg-blue-600 hover:bg-blue-700" : ""}
                      >
                        {isSending ? (
                          <RefreshCw className="h-4 w-4 animate-spin mr-1" />
                        ) : (
                          <Send className="h-4 w-4 mr-1" />
                        )}
                        {isDemoMode && canSimulateSend ? "Onayla ve Gönder (Simüle)" : "Onayla ve Gönder"}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            {!showReplyBox && (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onGenerateSuggestions}
                  disabled={isGenerating}
                >
                  {isGenerating ? (
                    <RefreshCw className="h-4 w-4 animate-spin mr-1" />
                  ) : (
                    <Sparkles className="h-4 w-4 mr-1" />
                  )}
                  {suggestions.length > 0 ? "Yeniden Öner" : "AI Yanıt"}
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setShowReplyBox(true)}
                >
                  <MessageSquare className="h-4 w-4 mr-1" />
                  Elle Yaz
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function TikTokInbox() {
  const { activeBusiness } = useBusiness();
  const businessId = activeBusiness?.id || null;
  
  const { videos, loading: videosLoading, fetchVideos } = useTikTokVideos(businessId);
  const [selectedVideo, setSelectedVideo] = useState<TikTokVideo | null>(null);
  
  const { 
    comments, 
    loading: commentsLoading, 
    fetchComments,
    generateSuggestions,
    sendReply,
    setComments,
  } = useTikTokComments(businessId, selectedVideo?.id || null);

  const {
    isDemoMode,
    toggleDemoMode,
    loadSampleComments,
    isLoadingSamples,
    simulateSendReply,
    canSimulateSend,
    isSandbox,
  } = useTikTokDemoMode(businessId, selectedVideo?.id || null);

  const [generatingFor, setGeneratingFor] = useState<string | null>(null);
  const [sendingFor, setSendingFor] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Load videos on mount
  useEffect(() => {
    if (businessId) {
      fetchVideos(false);
    }
  }, [businessId, fetchVideos]);

  // Load comments when video selected
  useEffect(() => {
    if (selectedVideo) {
      fetchComments(false);
    }
  }, [selectedVideo, fetchComments]);

  const handleGenerateSuggestions = async (commentId: string) => {
    setGeneratingFor(commentId);
    try {
      await generateSuggestions(commentId);
    } finally {
      setGeneratingFor(null);
    }
  };

  const handleSendReply = async (commentId: string, text: string) => {
    setSendingFor(commentId);
    try {
      await sendReply(commentId, text);
    } finally {
      setSendingFor(null);
    }
  };

  const handleSimulateSend = async (commentId: string, text: string) => {
    setSendingFor(commentId);
    try {
      await simulateSendReply(commentId, text, (reply) => {
        // Update local comments state
        setComments(prev => prev.map(c => 
          c.id === commentId 
            ? { 
                ...c, 
                status: "sent", 
                replies: [...(c.replies || []), reply] 
              }
            : c
        ));
      });
    } finally {
      setSendingFor(null);
    }
  };

  const handleLoadSampleComments = async () => {
    if (!selectedVideo) return;
    const newComments = await loadSampleComments(
      selectedVideo.tiktok_video_id, 
      selectedVideo.social_connection_id
    );
    if (newComments.length > 0) {
      setComments(prev => [...newComments, ...prev]);
    }
  };

  const filteredComments = statusFilter === "all" 
    ? comments 
    : comments.filter(c => c.status === statusFilter);

  if (!businessId) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Card className="max-w-md">
          <CardHeader className="text-center">
            <CardTitle>İşletme Seçin</CardTitle>
            <CardDescription>
              TikTok yorumlarını görmek için önce bir işletme seçmeniz gerekiyor.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Button asChild>
              <Link to="/settings">Ayarlara Git</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-4rem)]">
      {/* Sandbox Banner */}
      <TikTokSandboxBanner isDemoMode={isDemoMode} />
      
      {/* Compliance Card */}
      <TikTokComplianceCard />
      
      <div className="flex items-center justify-between mb-4 px-1">
        <div>
          <h1 className="text-2xl font-bold">TikTok Inbox</h1>
          <p className="text-muted-foreground">Video yorumlarını yönetin ve AI ile yanıtlayın</p>
        </div>
        <div className="flex items-center gap-2">
          <TikTokDemoModeToggle isDemoMode={isDemoMode} onToggle={toggleDemoMode} />
          <Button 
            variant="outline"
            onClick={() => selectedVideo ? fetchComments(true) : fetchVideos(true)}
            disabled={videosLoading || commentsLoading}
          >
            {(videosLoading || commentsLoading) && <RefreshCw className="h-4 w-4 animate-spin mr-2" />}
            {selectedVideo ? "Yorumları Yenile" : "Videoları Yenile"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-4 h-[calc(100%-8rem)]">
        {/* Video List */}
        <div className="col-span-4 border rounded-lg bg-card">
          <div className="p-3 border-b">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold">Videolar</h2>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => fetchVideos(true)}
                disabled={videosLoading}
              >
                <RefreshCw className={cn("h-4 w-4", videosLoading && "animate-spin")} />
              </Button>
            </div>
          </div>
          <ScrollArea className="h-[calc(100%-3.5rem)]">
            <div className="p-2 space-y-2">
              {videosLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="p-3 space-y-2">
                    <Skeleton className="h-24 w-16" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-3 w-2/3" />
                  </div>
                ))
              ) : videos.length === 0 ? (
                <div className="p-6 text-center text-muted-foreground">
                  <Video className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>Henüz video yok</p>
                  <Button 
                    variant="link" 
                    size="sm"
                    onClick={() => fetchVideos(true)}
                  >
                    TikTok'tan Al
                  </Button>
                </div>
              ) : (
                videos.map((video) => (
                  <VideoCard
                    key={video.id}
                    video={video}
                    isSelected={selectedVideo?.id === video.id}
                    onClick={() => setSelectedVideo(video)}
                  />
                ))
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Comments Panel */}
        <div className="col-span-8 border rounded-lg bg-card">
          {selectedVideo ? (
            <>
              <div className="p-3 border-b">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => setSelectedVideo(null)}
                    >
                      ← Geri
                    </Button>
                    <h2 className="font-semibold line-clamp-1">
                      {selectedVideo.caption || "Video Yorumları"}
                    </h2>
                  </div>
                  <div className="flex items-center gap-2">
                    {isDemoMode && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={handleLoadSampleComments}
                        disabled={isLoadingSamples}
                        className="text-yellow-700 border-yellow-500 hover:bg-yellow-50"
                      >
                        {isLoadingSamples ? (
                          <RefreshCw className="h-4 w-4 animate-spin mr-1" />
                        ) : (
                          <Download className="h-4 w-4 mr-1" />
                        )}
                        Demo Yorumları Yükle
                      </Button>
                    )}
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => fetchComments(true)}
                      disabled={commentsLoading}
                    >
                      <RefreshCw className={cn("h-4 w-4", commentsLoading && "animate-spin")} />
                    </Button>
                  </div>
                </div>
                
                {/* Status Filter */}
                <div className="flex gap-2 flex-wrap">
                  <Button
                    variant={statusFilter === "all" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setStatusFilter("all")}
                  >
                    Tümü ({comments.length})
                  </Button>
                  {Object.entries(statusConfig).map(([key, config]) => {
                    const count = comments.filter(c => c.status === key).length;
                    if (count === 0) return null;
                    return (
                      <Button
                        key={key}
                        variant={statusFilter === key ? "default" : "outline"}
                        size="sm"
                        onClick={() => setStatusFilter(key)}
                        className="gap-1"
                      >
                        {config.icon}
                        {config.label} ({count})
                      </Button>
                    );
                  })}
                </div>
              </div>
              
              <ScrollArea className="h-[calc(100%-7rem)]">
                <div className="p-3">
                  {commentsLoading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                      <Card key={i} className="mb-3">
                        <CardContent className="p-4 space-y-3">
                          <div className="flex items-center gap-3">
                            <Skeleton className="h-8 w-8 rounded-full" />
                            <div className="flex-1">
                              <Skeleton className="h-4 w-24 mb-1" />
                              <Skeleton className="h-4 w-full" />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  ) : filteredComments.length === 0 ? (
                    <div className="p-6 text-center text-muted-foreground">
                      <MessageSquare className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p className="mb-2">
                        {statusFilter === "all" 
                          ? "Bu videoda yorum yok" 
                          : `"${statusConfig[statusFilter]?.label}" durumunda yorum yok`}
                      </p>
                      {isSandbox && isDemoMode && statusFilter === "all" && (
                        <Button 
                          variant="outline"
                          size="sm"
                          onClick={handleLoadSampleComments}
                          disabled={isLoadingSamples}
                          className="mt-2"
                        >
                          {isLoadingSamples ? (
                            <RefreshCw className="h-4 w-4 animate-spin mr-1" />
                          ) : (
                            <Download className="h-4 w-4 mr-1" />
                          )}
                          Demo Yorumları Yükle
                        </Button>
                      )}
                      {statusFilter !== "all" && (
                        <Button 
                          variant="link" 
                          size="sm"
                          onClick={() => setStatusFilter("all")}
                        >
                          Tümünü Göster
                        </Button>
                      )}
                    </div>
                  ) : (
                    filteredComments.map((comment) => (
                      <CommentCard
                        key={comment.id}
                        comment={comment}
                        onGenerateSuggestions={() => handleGenerateSuggestions(comment.id)}
                        onSendReply={(text) => handleSendReply(comment.id, text)}
                        onSimulateSend={(text) => handleSimulateSend(comment.id, text)}
                        isGenerating={generatingFor === comment.id}
                        isSending={sendingFor === comment.id}
                        isDemoMode={isDemoMode}
                        canSimulateSend={canSimulateSend}
                        isSandbox={isSandbox}
                      />
                    ))
                  )}
                </div>
              </ScrollArea>
            </>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center text-muted-foreground">
                <Video className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium mb-1">Video Seçin</p>
                <p className="text-sm">Yorumları görmek için soldaki listeden bir video seçin</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
