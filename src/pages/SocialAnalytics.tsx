import { useState, useEffect, useCallback, useMemo } from "react";
import { useBusiness } from "@/contexts/BusinessContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import {
  Loader2,
  Sparkles,
  ThumbsUp,
  ThumbsDown,
  Minus,
  MapPin,
  Youtube,
  ExternalLink,
  TrendingUp,
  Languages,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { tr } from "date-fns/locale";

interface AnalyzedComment {
  id: string;
  comment_text: string;
  author_display_name: string | null;
  author_avatar_url: string | null;
  like_count: number | null;
  commented_at: string | null;
  sentiment: "positive" | "negative" | "neutral" | null;
  sentiment_score: number | null;
  sentiment_summary: string | null;
  sentiment_topics: string[] | null;
  sentiment_translated_text: string | null;
  analyzed_at: string | null;
  video_id: string;
  youtube_videos?: { title: string | null; permalink: string | null } | null;
}

type SentimentFilter = "all" | "positive" | "negative" | "neutral" | "unanalyzed";

const sentimentMeta = {
  positive: { label: "Pozitif", icon: ThumbsUp, className: "bg-emerald-500/10 text-emerald-600 border-emerald-500/30" },
  negative: { label: "Negatif", icon: ThumbsDown, className: "bg-rose-500/10 text-rose-600 border-rose-500/30" },
  neutral: { label: "Nötr", icon: Minus, className: "bg-muted text-muted-foreground border-border" },
} as const;

export default function SocialAnalytics() {
  const { activeBusiness, businesses, setActiveBusiness } = useBusiness();
  const [comments, setComments] = useState<AnalyzedComment[]>([]);
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [filter, setFilter] = useState<SentimentFilter>("all");

  const load = useCallback(async () => {
    if (!activeBusiness) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("youtube_comments")
      .select(
        "id, comment_text, author_display_name, author_avatar_url, like_count, commented_at, sentiment, sentiment_score, sentiment_summary, sentiment_topics, sentiment_translated_text, analyzed_at, video_id, youtube_videos!inner(title, permalink)",
      )
      .eq("business_id", activeBusiness.id)
      .order("commented_at", { ascending: false })
      .limit(500);
    if (error) {
      console.error(error);
      toast({ title: "Yorumlar yüklenemedi", description: error.message, variant: "destructive" });
    } else {
      setComments((data ?? []) as unknown as AnalyzedComment[]);
    }
    setLoading(false);
  }, [activeBusiness]);

  useEffect(() => {
    load();
  }, [load]);

  const stats = useMemo(() => {
    const total = comments.length;
    const analyzed = comments.filter((c) => c.sentiment).length;
    const positive = comments.filter((c) => c.sentiment === "positive").length;
    const negative = comments.filter((c) => c.sentiment === "negative").length;
    const neutral = comments.filter((c) => c.sentiment === "neutral").length;
    const topicCounts: Record<string, number> = {};
    comments.forEach((c) =>
      (c.sentiment_topics || []).forEach((t) => {
        const key = t.trim().toLowerCase();
        if (key) topicCounts[key] = (topicCounts[key] || 0) + 1;
      }),
    );
    const topTopics = Object.entries(topicCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8);
    return { total, analyzed, positive, negative, neutral, topTopics };
  }, [comments]);

  const filtered = useMemo(() => {
    if (filter === "all") return comments;
    if (filter === "unanalyzed") return comments.filter((c) => !c.sentiment);
    return comments.filter((c) => c.sentiment === filter);
  }, [comments, filter]);

  const handleAnalyze = async () => {
    if (!activeBusiness) return;
    setAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke("youtube-analyze-comments", {
        body: { business_id: activeBusiness.id, only_unanalyzed: true, limit: 200 },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      toast({
        title: "Analiz tamamlandı 🎉",
        description: `${data?.analyzed ?? 0} yorum analiz edildi.`,
      });
      await load();
    } catch (e) {
      toast({
        title: "Analiz hatası",
        description: e instanceof Error ? e.message : "Bilinmeyen hata",
        variant: "destructive",
      });
    } finally {
      setAnalyzing(false);
    }
  };

  if (!activeBusiness) {
    return <div className="p-8 text-muted-foreground">Önce bir işletme seçin.</div>;
  }

  const pct = (n: number) => (stats.analyzed === 0 ? 0 : Math.round((n / stats.analyzed) * 100));

  return (
    <div className="container mx-auto px-4 sm:px-6 py-6 space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-primary" />
              Sosyal Medya Analizi
            </h1>
            {businesses.length > 1 && (
              <Select
                value={activeBusiness.id}
                onValueChange={(id) => {
                  const b = businesses.find((x) => x.id === id);
                  if (b) setActiveBusiness(b);
                }}
              >
                <SelectTrigger className="w-[220px] h-9 text-sm">
                  <MapPin className="h-4 w-4 mr-1.5 text-muted-foreground" />
                  <SelectValue placeholder="Lokasyon" />
                </SelectTrigger>
                <SelectContent>
                  {businesses.map((b) => (
                    <SelectItem key={b.id} value={b.id}>
                      {b.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            YouTube yorumlarının duygu analizi, çevirisi ve ana konuları tek ekranda.
          </p>
        </div>
        <Button onClick={handleAnalyze} disabled={analyzing}>
          {analyzing ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Sparkles className="h-4 w-4 mr-2" />
          )}
          {analyzing ? "Analiz ediliyor..." : "Analiz Et"}
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Toplam yorum</p>
            <p className="text-2xl font-semibold mt-1">{stats.total}</p>
            <p className="text-xs text-muted-foreground mt-1">{stats.analyzed} analiz edildi</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <ThumbsUp className="h-3 w-3 text-emerald-600" /> Pozitif
            </p>
            <p className="text-2xl font-semibold mt-1 text-emerald-600">{stats.positive}</p>
            <p className="text-xs text-muted-foreground mt-1">%{pct(stats.positive)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <ThumbsDown className="h-3 w-3 text-rose-600" /> Negatif
            </p>
            <p className="text-2xl font-semibold mt-1 text-rose-600">{stats.negative}</p>
            <p className="text-xs text-muted-foreground mt-1">%{pct(stats.negative)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Minus className="h-3 w-3" /> Nötr
            </p>
            <p className="text-2xl font-semibold mt-1">{stats.neutral}</p>
            <p className="text-xs text-muted-foreground mt-1">%{pct(stats.neutral)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Top topics */}
      {stats.topTopics.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              En çok geçen konular
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {stats.topTopics.map(([topic, count]) => (
              <Badge key={topic} variant="secondary" className="text-xs">
                {topic} <span className="ml-1.5 opacity-60">×{count}</span>
              </Badge>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Filter chips */}
      <div className="flex flex-wrap gap-2">
        {(["all", "positive", "negative", "neutral", "unanalyzed"] as SentimentFilter[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-full text-xs border transition-colors ${
              filter === f
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-background hover:bg-muted border-border"
            }`}
          >
            {f === "all"
              ? `Tümü (${stats.total})`
              : f === "positive"
              ? `Pozitif (${stats.positive})`
              : f === "negative"
              ? `Negatif (${stats.negative})`
              : f === "neutral"
              ? `Nötr (${stats.neutral})`
              : `Analiz edilmemiş (${stats.total - stats.analyzed})`}
          </button>
        ))}
      </div>

      {/* Comments list */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            {stats.total === 0
              ? "Henüz yorum yok. Önce YouTube Yorumları sayfasından video & yorum çekin."
              : "Bu filtreye uyan yorum yok."}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((c) => {
            const meta = c.sentiment ? sentimentMeta[c.sentiment] : null;
            const Icon = meta?.icon;
            return (
              <Card key={c.id}>
                <CardContent className="p-4">
                  <div className="flex gap-3">
                    {c.author_avatar_url ? (
                      <img src={c.author_avatar_url} alt="" className="w-9 h-9 rounded-full flex-shrink-0" />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-muted flex-shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="text-sm font-medium">{c.author_display_name || "Anonim"}</span>
                        {c.commented_at && (
                          <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(c.commented_at), { addSuffix: true, locale: tr })}
                          </span>
                        )}
                        {meta && Icon && (
                          <Badge variant="outline" className={`text-xs ${meta.className}`}>
                            <Icon className="h-3 w-3 mr-1" />
                            {meta.label}
                            {c.sentiment_score != null && (
                              <span className="ml-1 opacity-70">·{Math.round(c.sentiment_score * 100)}%</span>
                            )}
                          </Badge>
                        )}
                        {!c.sentiment && (
                          <Badge variant="outline" className="text-xs">
                            Analiz edilmedi
                          </Badge>
                        )}
                      </div>

                      <p className="text-sm whitespace-pre-wrap break-words">{c.comment_text}</p>

                      {c.sentiment_translated_text &&
                        c.sentiment_translated_text.trim() !== c.comment_text.trim() && (
                          <div className="mt-2 p-2 rounded-md bg-muted/40 border-l-2 border-primary">
                            <p className="text-[10px] uppercase tracking-wide text-muted-foreground mb-1 flex items-center gap-1">
                              <Languages className="h-3 w-3" /> Türkçe
                            </p>
                            <p className="text-sm whitespace-pre-wrap break-words">
                              {c.sentiment_translated_text}
                            </p>
                          </div>
                        )}

                      {c.sentiment_summary && (
                        <p className="text-xs text-muted-foreground mt-2 italic">
                          AI özet: {c.sentiment_summary}
                        </p>
                      )}

                      {c.sentiment_topics && c.sentiment_topics.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {c.sentiment_topics.map((t, i) => (
                            <Badge key={i} variant="secondary" className="text-[10px]">
                              {t}
                            </Badge>
                          ))}
                        </div>
                      )}

                      <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <ThumbsUp className="h-3 w-3" /> {c.like_count ?? 0}
                        </span>
                        {c.youtube_videos?.permalink && (
                          <a
                            href={c.youtube_videos.permalink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 hover:text-primary transition-colors truncate max-w-[40ch]"
                          >
                            <Youtube className="h-3 w-3 text-red-600 flex-shrink-0" />
                            <span className="truncate">{c.youtube_videos.title || "Videoya git"}</span>
                            <ExternalLink className="h-3 w-3 flex-shrink-0" />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}