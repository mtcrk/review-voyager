import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Star, Copy, Send, CheckCircle2, Search, Filter, ArrowUpDown, RefreshCw, Sparkles, Download, Globe } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useBusiness } from "@/contexts/BusinessContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

type SortField = "posted_at" | "rating" | "reviewer_name";
type SortOrder = "asc" | "desc";
type StatusFilter = "all" | "pending" | "approved" | "replied";
type SentimentFilter = "all" | "positive" | "negative" | "neutral";
type PlatformFilter = "all" | "google" | "booking" | "tripadvisor";

const platformLabels: Record<string, { label: string; color: string }> = {
  google: { label: "Google", color: "bg-blue-50 text-blue-700 border-blue-200" },
  booking: { label: "Booking.com", color: "bg-indigo-50 text-indigo-700 border-indigo-200" },
  tripadvisor: { label: "TripAdvisor", color: "bg-green-50 text-green-700 border-green-200" },
};

export default function Reviews() {
  const { activeBusiness, refetchBusinesses } = useBusiness();
  const queryClient = useQueryClient();
  const [selectedReview, setSelectedReview] = useState<any>(null);
  const [replyText, setReplyText] = useState("");
  
  // Filters and sorting
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [sentimentFilter, setSentimentFilter] = useState<SentimentFilter>("all");
  const [platformFilter, setPlatformFilter] = useState<PlatformFilter>("all");
  const [sortField, setSortField] = useState<SortField>("posted_at");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [isFetchingBooking, setIsFetchingBooking] = useState(false);
  
  // Inline Booking ID setup
  const [bookingIdInput, setBookingIdInput] = useState("");
  const [savingBookingId, setSavingBookingId] = useState(false);
  
  // Bulk selection
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isGeneratingReply, setIsGeneratingReply] = useState(false);

  // Fetch reviews from Supabase
  const { data: reviews = [], isLoading, refetch } = useQuery({
    queryKey: ['reviews', activeBusiness?.id],
    queryFn: async () => {
      if (!activeBusiness) return [];

      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('business_id', activeBusiness.id)
        .order('posted_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!activeBusiness,
  });

  // Filtered and sorted reviews
  const filteredReviews = useMemo(() => {
    let result = [...reviews];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (r) =>
          r.reviewer_name?.toLowerCase().includes(query) ||
          r.text?.toLowerCase().includes(query) ||
          r.summary?.toLowerCase().includes(query)
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      result = result.filter((r) => {
        if (statusFilter === "pending") return !r.status || r.status === "pending";
        return r.status === statusFilter;
      });
    }

    // Platform filter
    if (platformFilter !== "all") {
      result = result.filter((r) => (r as any).platform === platformFilter);
    }

    // Sentiment filter
    if (sentimentFilter !== "all") {
      result = result.filter((r) => r.sentiment?.toLowerCase() === sentimentFilter);
    }

    // Sorting
    result.sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case "posted_at":
          comparison = new Date(a.posted_at).getTime() - new Date(b.posted_at).getTime();
          break;
        case "rating":
          comparison = a.rating - b.rating;
          break;
        case "reviewer_name":
          comparison = (a.reviewer_name || "").localeCompare(b.reviewer_name || "");
          break;
      }
      return sortOrder === "desc" ? -comparison : comparison;
    });

    return result;
  }, [reviews, searchQuery, statusFilter, sentimentFilter, platformFilter, sortField, sortOrder]);

  // Bulk approve mutation
  const bulkApproveMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      const { error } = await supabase
        .from('reviews')
        .update({ status: 'approved' })
        .in('id', ids);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
      setSelectedIds(new Set());
      toast({
        title: "Toplu Onaylama",
        description: `${selectedIds.size} yorum onaylandı.`,
      });
    },
    onError: () => {
      toast({
        title: "Hata",
        description: "Yorumlar onaylanırken hata oluştu.",
        variant: "destructive",
      });
    },
  });

  // Single approve mutation
  const approveMutation = useMutation({
    mutationFn: async (reviewId: string) => {
      const { error } = await supabase
        .from('reviews')
        .update({ status: 'approved' })
        .eq('id', reviewId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
      toast({
        title: "Yanıt Onaylandı",
        description: "Yanıt onaylandı olarak işaretlendi.",
      });
    },
    onError: () => {
      toast({
        title: "Hata",
        description: "Yanıt onaylanırken hata oluştu.",
        variant: "destructive",
      });
    },
  });

  // Send to Google mutation (using edge function)
  const sendMutation = useMutation({
    mutationFn: async ({ reviewId, reply }: { reviewId: string; reply: string }) => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      const response = await supabase.functions.invoke('approve-reply', {
        body: { reviewId, approvedReply: reply, sendToGoogle: true },
      });

      if (response.error) {
        // Fallback to clipboard copy if API fails
        await navigator.clipboard.writeText(reply);
        throw new Error(response.error.message || "API hatası - yanıt panoya kopyalandı");
      }

      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
      if (data?.googleStatus === "sent") {
        toast({
          title: "Başarılı!",
          description: "Yanıt Google'a gönderildi.",
        });
      } else {
        toast({
          title: "Yanıt Kaydedildi",
          description: data?.message || "Yanıt kaydedildi.",
        });
      }
      setSelectedReview(null);
    },
    onError: (error: any) => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
      toast({
        title: "Uyarı",
        description: error.message || "API bağlantısı kurulamadı, yanıt panoya kopyalandı.",
        variant: "destructive",
      });
      setSelectedReview(null);
    },
  });

  // Generate AI reply mutation
  const generateReplyMutation = useMutation({
    mutationFn: async (review: any) => {
      setIsGeneratingReply(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      const response = await supabase.functions.invoke('generate-reply', {
        body: {
          review_text: review.text,
          reviewer_name: review.reviewer_name,
          rating: review.rating,
          sentiment: review.sentiment,
          tone: activeBusiness?.tone || 'Friendly',
          language: activeBusiness?.language || 'TR',
        },
      });

      if (response.error) throw response.error;
      return response.data?.reply || "";
    },
    onSuccess: (reply) => {
      setReplyText(reply);
      toast({
        title: "AI Yanıt Oluşturuldu",
        description: "Yeni bir yanıt önerisi oluşturuldu.",
      });
    },
    onError: () => {
      toast({
        title: "Hata",
        description: "AI yanıt oluşturulamadı.",
        variant: "destructive",
      });
    },
    onSettled: () => {
      setIsGeneratingReply(false);
    },
  });

  const handleReviewClick = (review: any) => {
    setSelectedReview(review);
    setReplyText(review.suggested_reply || "");
  };

  const handleApprove = () => {
    if (selectedReview) {
      approveMutation.mutate(selectedReview.id);
    }
  };

  const handleSendToGoogle = () => {
    if (selectedReview && replyText) {
      sendMutation.mutate({ reviewId: selectedReview.id, reply: replyText });
    }
  };

  const handleBulkApprove = () => {
    if (selectedIds.size > 0) {
      bulkApproveMutation.mutate(Array.from(selectedIds));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(new Set(filteredReviews.map((r) => r.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleSelectOne = (id: string, checked: boolean) => {
    const newSet = new Set(selectedIds);
    if (checked) {
      newSet.add(id);
    } else {
      newSet.delete(id);
    }
    setSelectedIds(newSet);
  };

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("desc");
    }
  };

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

  const getStatusBadge = (status: string | null) => {
    switch (status) {
      case "replied":
        return { label: "Yanıtlandı", variant: "default" as const };
      case "approved":
        return { label: "Onaylandı", variant: "secondary" as const };
      default:
        return { label: "Beklemede", variant: "outline" as const };
    }
  };

  const pendingCount = reviews.filter((r) => !r.status || r.status === "pending").length;
  const repliedCount = reviews.filter((r) => r.status === "replied").length;

  if (!activeBusiness) {
    return (
      <div className="p-8">
        <Card className="p-12 text-center">
          <p className="text-muted-foreground">İşletme seçilmedi. Lütfen önce bir işletme ekleyin.</p>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-foreground mb-2">Yorumlar</h1>
          <p className="text-muted-foreground">
            {reviews.length} yorum • {pendingCount} beklemede • {repliedCount} yanıtlandı
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Yenile
          </Button>
          <Button 
            size="sm" 
            onClick={async () => {
              if (!activeBusiness) return;
              setIsFetchingBooking(true);
              try {
                const response = await supabase.functions.invoke('wextractor-fetch-reviews', {
                  body: { business_id: activeBusiness.id, platform: 'booking', offset: 0 },
                });
                if (response.error) throw new Error(response.error.message);
                const result = response.data;
                if (result?.error) {
                  toast({ title: "Hata", description: result.error, variant: "destructive" });
                } else {
                  toast({
                    title: "Booking Yorumları Çekildi",
                    description: `${result.inserted} yeni yorum eklendi, ${result.skipped} zaten mevcut.`,
                  });
                  refetch();
                }
              } catch (err: any) {
                toast({ title: "Hata", description: err.message || "Yorumlar çekilemedi.", variant: "destructive" });
              } finally {
                setIsFetchingBooking(false);
              }
            }}
            disabled={isFetchingBooking}
          >
            <Download className="h-4 w-4 mr-2" />
            {isFetchingBooking ? 'Çekiliyor...' : 'Booking Yorumları Çek'}
          </Button>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Yorum veya yorumcu ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as StatusFilter)}>
            <SelectTrigger className="w-[140px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Durum" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tüm Durumlar</SelectItem>
              <SelectItem value="pending">Beklemede</SelectItem>
              <SelectItem value="approved">Onaylandı</SelectItem>
              <SelectItem value="replied">Yanıtlandı</SelectItem>
            </SelectContent>
          </Select>
          <Select value={sentimentFilter} onValueChange={(v) => setSentimentFilter(v as SentimentFilter)}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Duygu" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tüm Duygular</SelectItem>
              <SelectItem value="positive">Pozitif</SelectItem>
              <SelectItem value="neutral">Nötr</SelectItem>
              <SelectItem value="negative">Negatif</SelectItem>
            </SelectContent>
          </Select>
          <Select value={platformFilter} onValueChange={(v) => setPlatformFilter(v as PlatformFilter)}>
            <SelectTrigger className="w-[160px]">
              <Globe className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Platform" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tüm Platformlar</SelectItem>
              <SelectItem value="google">Google</SelectItem>
              <SelectItem value="booking">Booking.com</SelectItem>
              <SelectItem value="tripadvisor">TripAdvisor</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedIds.size > 0 && (
        <div className="flex items-center gap-4 p-3 bg-primary/5 rounded-lg border border-primary/20">
          <span className="text-sm font-medium">{selectedIds.size} yorum seçildi</span>
          <Button size="sm" variant="outline" onClick={handleBulkApprove} disabled={bulkApproveMutation.isPending}>
            <CheckCircle2 className="h-4 w-4 mr-2" />
            Toplu Onayla
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setSelectedIds(new Set())}>
            Seçimi Temizle
          </Button>
        </div>
      )}

      {/* Inline Booking Setup - show when no booking_hotel_id and no reviews */}
      {reviews.length === 0 && !activeBusiness.booking_hotel_id && (
        <Card className="p-8 shadow-card border-dashed border-2 border-primary/30 bg-primary/5">
          <div className="max-w-lg mx-auto text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
              <Download className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">Booking.com Yorumlarınızı Çekin</h3>
            <p className="text-sm text-muted-foreground">
              Booking.com URL'nizdeki otel yolunu girin ve yorumlarınızı otomatik olarak çekelim.
            </p>
            <div className="flex gap-2 max-w-md mx-auto">
              <Input
                placeholder="örn: tr/hotel-sultanahmet-palace"
                value={bookingIdInput}
                onChange={(e) => setBookingIdInput(e.target.value)}
                disabled={savingBookingId}
                className="flex-1"
              />
              <Button
                disabled={!bookingIdInput.trim() || savingBookingId}
                onClick={async () => {
                  if (!activeBusiness || !bookingIdInput.trim()) return;
                  setSavingBookingId(true);
                  try {
                    // Save booking_hotel_id
                    const { error: updateError } = await supabase
                      .from('businesses')
                      .update({ booking_hotel_id: bookingIdInput.trim() })
                      .eq('id', activeBusiness.id);
                    if (updateError) throw updateError;

                    // Immediately fetch reviews
                    const response = await supabase.functions.invoke('wextractor-fetch-reviews', {
                      body: { business_id: activeBusiness.id, platform: 'booking', offset: 0 },
                    });
                    
                    if (response.error) throw new Error(response.error.message);
                    const result = response.data;
                    if (result?.error) {
                      toast({ title: "Hata", description: result.error, variant: "destructive" });
                    } else {
                      toast({
                        title: "Yorumlar Çekildi! 🎉",
                        description: `${result.inserted} yorum eklendi.`,
                      });
                      refetch();
                      refetchBusinesses();
                    }
                  } catch (err: any) {
                    toast({ title: "Hata", description: err.message || "Bir sorun oluştu.", variant: "destructive" });
                  } finally {
                    setSavingBookingId(false);
                  }
                }}
              >
                {savingBookingId ? 'Çekiliyor...' : 'Yorumları Çek'}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Booking.com otel sayfanızın URL'sinden alabilirsiniz. Örn: booking.com/hotel/<strong>tr/hotel-sultanahmet-palace</strong>
            </p>
          </div>
        </Card>
      )}

      {/* Reviews Table */}
      {filteredReviews.length === 0 && (reviews.length > 0 || activeBusiness.booking_hotel_id) ? (
        <Card className="p-12 text-center shadow-card">
          <p className="text-muted-foreground text-lg">
            {reviews.length === 0 ? "Yorumlar yükleniyor veya henüz çekilmedi." : "Arama kriterlerine uygun yorum bulunamadı."}
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            {reviews.length === 0 ? "'Booking Yorumları Çek' butonunu kullanın." : "Filtreleri değiştirmeyi deneyin."}
          </p>
        </Card>
      ) : filteredReviews.length === 0 && reviews.length === 0 && !activeBusiness.booking_hotel_id ? null : (
        <Card className="shadow-card">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-12">
                  <Checkbox
                    checked={selectedIds.size === filteredReviews.length && filteredReviews.length > 0}
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
                <TableHead className="font-semibold">
                  <button
                    onClick={() => toggleSort("reviewer_name")}
                    className="flex items-center gap-1 hover:text-foreground"
                  >
                    Yorumcu
                    {sortField === "reviewer_name" && <ArrowUpDown className="h-3 w-3" />}
                  </button>
                </TableHead>
                <TableHead className="font-semibold">
                  <button
                    onClick={() => toggleSort("rating")}
                    className="flex items-center gap-1 hover:text-foreground"
                  >
                    Puan
                    {sortField === "rating" && <ArrowUpDown className="h-3 w-3" />}
                  </button>
                </TableHead>
                <TableHead className="font-semibold">Platform</TableHead>
                <TableHead className="font-semibold">Duygu</TableHead>
                <TableHead className="font-semibold">
                  <button
                    onClick={() => toggleSort("posted_at")}
                    className="flex items-center gap-1 hover:text-foreground"
                  >
                    Tarih
                    {sortField === "posted_at" && <ArrowUpDown className="h-3 w-3" />}
                  </button>
                </TableHead>
                <TableHead className="font-semibold">Durum</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredReviews.map((review) => {
                const statusInfo = getStatusBadge(review.status);
                return (
                  <TableRow
                    key={review.id}
                    className="cursor-pointer transition-smooth hover:bg-muted/30"
                    onClick={() => handleReviewClick(review)}
                  >
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <Checkbox
                        checked={selectedIds.has(review.id)}
                        onCheckedChange={(checked) => handleSelectOne(review.id, !!checked)}
                      />
                    </TableCell>
                    <TableCell className="font-medium">{review.reviewer_name}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: review.rating }).map((_, i) => (
                          <Star key={i} className="h-4 w-4 fill-primary text-primary" />
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      {(() => {
                        const p = platformLabels[(review as any).platform || 'google'] || platformLabels.google;
                        return (
                          <Badge className={p.color} variant="outline">
                            {p.label}
                          </Badge>
                        );
                      })()}
                    </TableCell>
                    <TableCell>
                      {review.sentiment && (
                        <Badge className={getSentimentColor(review.sentiment)} variant="outline">
                          {review.sentiment}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {format(new Date(review.posted_at), 'd MMM yyyy', { locale: tr })}
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusInfo.variant}>
                        {statusInfo.label}
                      </Badge>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Card>
      )}

      {/* Review Detail Sheet */}
      <Sheet open={!!selectedReview} onOpenChange={() => setSelectedReview(null)}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="text-2xl flex items-center gap-2">
              Yorum Detayları
              {selectedReview && (
                <Badge className={platformLabels[(selectedReview as any).platform || 'google']?.color} variant="outline">
                  {platformLabels[(selectedReview as any).platform || 'google']?.label}
                </Badge>
              )}
            </SheetTitle>
            <SheetDescription>
              Yorumcu: {selectedReview?.reviewer_name}
            </SheetDescription>
          </SheetHeader>

          {selectedReview && (
            <div className="mt-6 space-y-6">
              {/* Review Text */}
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-2">Yorum</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {selectedReview.text || 'Yorum metni yok'}
                </p>
              </div>

              {/* Rating */}
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-2">Puan</h3>
                <div className="flex items-center gap-1">
                  {Array.from({ length: selectedReview.rating }).map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-primary text-primary" />
                  ))}
                </div>
              </div>

              {/* Summary */}
              {selectedReview.summary && (
                <div>
                  <h3 className="text-sm font-semibold text-foreground mb-2">Özet</h3>
                  <p className="text-sm text-muted-foreground">{selectedReview.summary}</p>
                </div>
              )}

              {/* Praises */}
              {selectedReview.praises && Array.isArray(selectedReview.praises) && selectedReview.praises.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-foreground mb-2">Övgüler</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedReview.praises.map((praise: string, i: number) => (
                      <Badge key={i} variant="secondary" className="bg-emerald-50 text-emerald-700">
                        {praise}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Issues */}
              {selectedReview.issues && Array.isArray(selectedReview.issues) && selectedReview.issues.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-foreground mb-2">Sorunlar</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedReview.issues.map((issue: string, i: number) => (
                      <Badge key={i} variant="secondary" className="bg-rose-50 text-rose-700">
                        {issue}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* AI Suggested Reply */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-foreground">
                    AI Önerilen Yanıt
                  </h3>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => generateReplyMutation.mutate(selectedReview)}
                    disabled={isGeneratingReply}
                  >
                    <Sparkles className={`h-4 w-4 mr-1 ${isGeneratingReply ? 'animate-spin' : ''}`} />
                    {isGeneratingReply ? 'Oluşturuluyor...' : 'Yeniden Oluştur'}
                  </Button>
                </div>
                <Textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  className="min-h-[120px] resize-none"
                  placeholder="Önerilen yanıtı düzenleyin..."
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  className="flex-1 gap-2"
                  onClick={handleApprove}
                  disabled={approveMutation.isPending || selectedReview.status === 'approved' || selectedReview.status === 'replied'}
                >
                  <CheckCircle2 className="h-4 w-4" />
                  {selectedReview.status === 'approved' || selectedReview.status === 'replied' ? 'Onaylandı' : 'Yanıtı Onayla'}
                </Button>
                {(selectedReview as any).platform === 'google' || !(selectedReview as any).platform ? (
                  <Button 
                    className="flex-1 gap-2"
                    onClick={handleSendToGoogle}
                    disabled={sendMutation.isPending || !replyText}
                  >
                    <Send className="h-4 w-4" />
                    Google'a Gönder
                  </Button>
                ) : (
                  <Button 
                    className="flex-1 gap-2"
                    onClick={async () => {
                      await navigator.clipboard.writeText(replyText);
                      // Also approve the review
                      handleApprove();
                      toast({
                        title: "Panoya Kopyalandı",
                        description: `Yanıtı ${platformLabels[(selectedReview as any).platform]?.label || 'platform'} paneline yapıştırın.`,
                      });
                    }}
                    disabled={!replyText}
                  >
                    <Copy className="h-4 w-4" />
                    Kopyala & Onayla
                  </Button>
                )}
              </div>

              {/* Copy button for fallback */}
              <Button
                variant="ghost"
                className="w-full"
                onClick={async () => {
                  await navigator.clipboard.writeText(replyText);
                  toast({
                    title: "Kopyalandı",
                    description: "Yanıt panoya kopyalandı.",
                  });
                }}
                disabled={!replyText}
              >
                <Copy className="h-4 w-4 mr-2" />
                Panoya Kopyala
              </Button>

              {/* Status */}
              <div className="pt-4 border-t border-border">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Durum:</span>
                  <Badge variant={getStatusBadge(selectedReview.status).variant}>
                    {getStatusBadge(selectedReview.status).label}
                  </Badge>
                </div>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
