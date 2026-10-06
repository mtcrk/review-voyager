import { useState, useEffect } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { ArrowLeft, Star, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useTranslation } from "react-i18next";
import { ReviewAnalysisPanel } from "@/components/reviews/ReviewAnalysisPanel";
import { WhatsAppActionStatus } from "@/components/reviews/WhatsAppActionStatus";

type ToneOption = "Friendly" | "Professional" | "Formal";
const toneMap: Record<ToneOption, string> = {
  Friendly: "friendly",
  Professional: "empathetic",
  Formal: "formal",
};

const languageOptions: { value: string; label: string }[] = [
  { value: "auto", label: "🌐 Misafirin dili" },
  { value: "TR", label: "🇹🇷 Türkçe" },
  { value: "EN", label: "🇬🇧 İngilizce" },
  { value: "DE", label: "🇩🇪 Almanca" },
  { value: "RU", label: "🇷🇺 Rusça" },
  { value: "FR", label: "🇫🇷 Fransızca" },
  { value: "AR", label: "🇸🇦 Arapça" },
];

const ReviewDetailPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  // Konu/Dönem/Rakip analizinden "Yoruma git" ile gelindiğinde vurgulanacak konu.
  const focusTopic = searchParams.get("topic");
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [selectedTone, setSelectedTone] = useState<ToneOption>("Friendly");
  const [replyLanguage, setReplyLanguage] = useState<string>("auto");
  const [aiReply, setAiReply] = useState("");
  const [includeClosing, setIncludeClosing] = useState<boolean | null>(null);
  const brandVoice = (review as any)?.businesses?.brand_voice || {};
  const hasClosing = !!brandVoice.closing_text?.trim();
  const closingChecked = includeClosing ?? brandVoice.closing_enabled_by_default === true;

  // Fetch review from Supabase
  const { data: review, isLoading } = useQuery({
    queryKey: ['review', id],
    queryFn: async () => {
      if (!id) throw new Error('No review ID');

      const { data, error } = await supabase
        .from('reviews')
        .select('*, businesses(*)')
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;
      if (!data) throw new Error('Review not found');
      
      return data;
    },
    enabled: !!id,
  });

  // Set initial AI reply when review loads — prioritize approved_reply (existing response)
  useEffect(() => {
    if (review?.approved_reply) {
      setAiReply(review.approved_reply);
    } else if (review?.suggested_reply) {
      setAiReply(review.suggested_reply);
    } else if (review && !review.suggested_reply && !review.approved_reply) {
      // Auto-generate only if no reply exists at all
      regenerateMutation.mutate();
    }
  }, [review?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Approve mutation
  const approveMutation = useMutation({
    mutationFn: async () => {
      if (!id) throw new Error('No review ID');

      const { error } = await supabase
        .from('reviews')
        .update({ status: 'approved' })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['review', id] });
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
      toast.success("Review marked as approved!");
    },
    onError: () => {
      toast.error("Failed to approve review");
    },
  });

  // Send to Google mutation
  const sendMutation = useMutation({
    mutationFn: async () => {
      if (!id || !aiReply) throw new Error('Missing data');

      // Check if this is a Google review with google_review_name (can send via API)
      const biz = review as any;
      const canSendViaAPI = biz?.platform === 'google' && biz?.google_review_name && biz?.businesses?.google_connected;

      if (canSendViaAPI) {
        // Send via Google API through approve-reply edge function
        const { data: userData } = await supabase.auth.getUser();
        const { data, error } = await supabase.functions.invoke('approve-reply', {
          body: {
            reviewId: id,
            approvedReply: aiReply,
            sendToGoogle: true,
            userId: userData?.user?.id,
          },
        });

        if (error) throw error;
        if (data?.error) throw new Error(data.error);

        return data;
      } else {
        // Non-Google or no API access — copy to clipboard and mark as replied
        await navigator.clipboard.writeText(aiReply);

        // Yandex has no public reply API — also open the Yandex review page so
        // the owner can paste the reply in their browser.
        const yandexOrgId = biz?.businesses?.yandex_org_id;
        if (biz?.platform === 'yandex' && yandexOrgId) {
          window.open(`https://yandex.com.tr/maps/org/${yandexOrgId}/reviews/`, '_blank');
        }

        const { error } = await supabase
          .from('reviews')
          .update({ 
            status: 'replied',
            approved_reply: aiReply,
            replied_at: new Date().toISOString(),
            reply_source: 'manual',
          })
          .eq('id', id);

        if (error) throw error;
        return { copied: true, yandex: biz?.platform === 'yandex' };
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['review', id] });
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
      if (data?.googleStatus === 'sent') {
        toast.success("Yanıt Google'a başarıyla gönderildi! ✅");
      } else if (data?.googleStatus === 'failed') {
        toast.error("Yanıt onaylandı ama Google'a gönderilemedi. Hata: " + (data?.review?.google_reply_error_message || "Bilinmeyen hata"));
      } else if (data?.yandex) {
        toast.success("Yanıt kopyalandı ve Yandex sayfası açıldı. Yandex'te yapıştırıp gönderin.");
      } else if (data?.copied) {
        toast.success("Yanıt panoya kopyalandı. Platforma yapıştırın.");
      } else {
        toast.success("Yanıt onaylandı!");
      }
      setTimeout(() => navigate('/reviews'), 1500);
    },
    onError: () => {
      toast.error("Yanıt gönderilemedi");
    },
  });

  const getSentimentColor = (sentiment: string | null) => {
    switch (sentiment?.toLowerCase()) {
      case "positive":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "negative":
        return "bg-rose-50 text-rose-700 border-rose-200";
      default:
        return "bg-amber-50 text-amber-700 border-amber-200";
    }
  };

  const getStatusColor = (status: string | null) => {
    switch (status) {
      case "approved":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "replied":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      default:
        return "bg-amber-50 text-amber-700 border-amber-200";
    }
  };

  const handleCopyReply = () => {
    navigator.clipboard.writeText(aiReply);
    toast.success("Reply copied to clipboard!");
  };

  const handleMarkAsApproved = () => {
    approveMutation.mutate();
  };

  const handleSendToGoogle = () => {
    sendMutation.mutate();
  };

  const regenerateMutation = useMutation({
    mutationFn: async () => {
      if (!review) throw new Error('No review');

      const { data, error } = await supabase.functions.invoke('generate-reply', {
        body: {
          review_text: review.text,
          review_id: review.id,
          reviewer_name: review.reviewer_name,
          rating: review.rating,
          tone: toneMap[selectedTone],
          language: replyLanguage,
          summary: review.summary,
          issues: review.issues,
          praises: review.praises,
          sentiment: review.sentiment,
          business_id: review.business_id,
          platform: review.platform,
          include_closing: includeClosing ?? (review as any)?.businesses?.brand_voice?.closing_enabled_by_default === true,
        },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      const reply = data.reply;

      await supabase
        .from('reviews')
        .update({ suggested_reply: reply })
        .eq('id', review.id);

      return reply;
    },
    onSuccess: (reply) => {
      setAiReply(reply);
      queryClient.invalidateQueries({ queryKey: ['review', id] });
      toast.success("Yanıt üretildi!");
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Yanıt üretilemedi");
    },
  });

  const handleRegenerateReply = () => {
    regenerateMutation.mutate();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!review) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">Review not found</p>
          <Button onClick={() => navigate('/reviews')} className="mt-4">
            Back to Reviews
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Sticky Header */}
      <div className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur-sm h-16">
        <div className="container mx-auto max-w-[720px] px-6 h-full flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/reviews")}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-3">
              <span className="font-semibold text-base">{review.reviewer_name}</span>
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${
                      i < review.rating
                        ? "fill-primary text-primary"
                        : "fill-muted text-muted"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {review.sentiment && (
              <Badge variant="outline" className={getSentimentColor(review.sentiment)}>
                {review.sentiment}
              </Badge>
            )}
            <Badge variant="outline" className={getStatusColor(review.status)}>
              {review.status === 'replied' ? 'Replied' : review.status === 'approved' ? 'Approved' : 'Pending'}
            </Badge>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="container mx-auto max-w-[720px] px-6 py-6 space-y-6">
          {/* Original Review Card */}
          <Card className="rounded-xl shadow-sm border">
            <CardHeader>
              <CardTitle className="text-lg">Original Review</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Reviewer</span>
                  <span className="font-medium">{review.reviewer_name}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Rating</span>
                  <div className="flex gap-1">
                    {[...Array(review.rating)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-primary text-primary" />
                    ))}
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Date</span>
                  <span className="font-medium">{formatDate(review.posted_at)}</span>
                </div>
              </div>
              <div className="pt-4 border-t">
                <p className="text-sm leading-relaxed text-foreground">
                  {review.text || 'No review text'}
                </p>
              </div>

              {/* Review Photos */}
              {review.photos && Array.isArray(review.photos) && (review.photos as any[]).length > 0 && (
                <div className="pt-4 border-t">
                  <h4 className="text-sm font-semibold mb-3">Fotoğraflar</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {(review.photos as any[]).map((photo: any, i: number) => (
                      <a
                        key={i}
                        href={photo.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="relative aspect-square rounded-lg overflow-hidden border hover:opacity-90 transition-opacity"
                      >
                        <img
                          src={photo.thumbnail || photo.url}
                          alt={`Review photo ${i + 1}`}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* AI Insights Card */}
          <Card id="review-analysis" className="rounded-xl shadow-sm border">
            <CardHeader>
              <CardTitle className="text-lg">{t("analysis.title")}</CardTitle>
            </CardHeader>
            <CardContent>
              <ReviewAnalysisPanel
                reviewId={review.id}
                text={review.text || ""}
                analysisStatus={(review as any).analysis_status}
                focusTopicId={focusTopic}
              />
              <div className="mt-4">
                <WhatsAppActionStatus reviewId={review.id} />
              </div>
            </CardContent>
          </Card>

          {/* Legacy AI Insights Card */}
          <Card className="rounded-xl shadow-sm border">
            <CardHeader>
              <CardTitle className="text-lg">AI Insights</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {review.summary && (
                <div>
                  <h4 className="text-sm font-semibold mb-2">Summary</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {review.summary}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {review.praises && Array.isArray(review.praises) && review.praises.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold mb-2">Praises</h4>
                    <div className="flex flex-wrap gap-2">
                      {review.praises.map((praise: string, i: number) => (
                        <Badge
                          key={i}
                          variant="secondary"
                          className="bg-emerald-50 text-emerald-700"
                        >
                          {praise}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {review.issues && Array.isArray(review.issues) && review.issues.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold mb-2">Issues</h4>
                    <div className="flex flex-wrap gap-2">
                      {review.issues.map((issue: string, i: number) => (
                        <Badge
                          key={i}
                          variant="secondary"
                          className="bg-rose-50 text-rose-700"
                        >
                          {issue}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* AI Reply Card */}
          <Card className="rounded-xl shadow-sm border">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CardTitle className="text-lg">
                    {review.approved_reply && (review.status === 'replied' || review.status === 'approved') 
                      ? 'Mevcut Yanıt' 
                      : 'AI Suggested Reply'}
                  </CardTitle>
                  {review.approved_reply && review.status === 'replied' && (
                    <Badge variant="outline" className="text-xs text-emerald-600 border-emerald-200 bg-emerald-50">
                      Yanıtlandı
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {/* Tone Selector */}
                  <div className="flex rounded-lg border bg-muted/30 p-1">
                    {(["Friendly", "Professional", "Formal"] as ToneOption[]).map((tone) => (
                      <button
                        key={tone}
                        onClick={() => setSelectedTone(tone)}
                        className={`px-3 py-1 text-sm font-medium rounded transition-all ${
                          selectedTone === tone
                            ? "bg-background text-foreground shadow-sm"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {tone}
                      </button>
                    ))}
                  </div>
                  <Select value={replyLanguage} onValueChange={setReplyLanguage}>
                    <SelectTrigger className="h-9 w-auto px-2 gap-1" title="Yanıt dili">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {languageOptions.map((l) => (
                        <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRegenerateReply}
                    disabled={regenerateMutation.isPending}
                  >
                    {regenerateMutation.isPending && <Loader2 className="h-4 w-4 animate-spin mr-1" />}
                    {regenerateMutation.isPending ? "Üretiliyor..." : "Yeniden Üret"}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {hasClosing && (
                <div className="mb-4 flex items-center justify-between rounded-lg border p-3">
                  <div>
                    <p className="text-sm font-medium">Kayıtlı kapanışı ekle</p>
                    <p className="text-xs text-muted-foreground">Bu seçim yalnız bu yanıt için geçerlidir.</p>
                  </div>
                  <Switch checked={closingChecked} onCheckedChange={setIncludeClosing} />
                </div>
              )}
              <Textarea
                value={aiReply}
                onChange={(e) => setAiReply(e.target.value)}
                className="min-h-[200px] text-sm leading-relaxed resize-none"
                placeholder="AI suggested reply will appear here..."
              />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Sticky Footer */}
      <div className="sticky bottom-0 border-t bg-background/95 backdrop-blur-sm py-4">
        <div className="container mx-auto max-w-[720px] px-6 flex items-center justify-between gap-4">
          <Button
            variant="outline"
            onClick={handleMarkAsApproved}
            disabled={approveMutation.isPending || review.status === 'approved' || review.status === 'replied'}
            className="flex-1"
          >
            {review.status === 'approved' || review.status === 'replied' ? 'Approved' : 'Approve Reply'}
          </Button>
          <Button
            onClick={handleSendToGoogle}
            disabled={sendMutation.isPending || !aiReply}
            className="flex-1"
          >
            {(review as any)?.platform === 'yandex'
              ? "Yandex'te Yanıtla"
              : (review as any)?.platform && (review as any).platform !== 'google'
                ? 'Kopyala & Onayla'
                : 'Send to Google'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ReviewDetailPage;
