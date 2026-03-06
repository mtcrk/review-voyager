import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Star, Copy, Send, CheckCircle2, Search, Filter, ArrowUpDown, RefreshCw, Sparkles, Download, Globe, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
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
type PlatformFilter = "all" | "google" | "booking" | "tripadvisor" | "trustpilot" | "hotelscom";
type RatingFilter = "all" | "1" | "2" | "3" | "4" | "5";
type SortOption = "newest" | "oldest" | "rating_high" | "rating_low" | "name_az";

type ToneOption = "friendly" | "formal" | "playful" | "empathetic" | "grateful" | "witty" | "apologetic" | "enthusiastic";

const toneOptions: { value: ToneOption; label: string; emoji: string }[] = [
  { value: "friendly", label: "Samimi", emoji: "😊" },
  { value: "formal", label: "Resmi", emoji: "👔" },
  { value: "playful", label: "Eğlenceli", emoji: "🎉" },
  { value: "empathetic", label: "Empatik", emoji: "🤝" },
  { value: "grateful", label: "Minnettar", emoji: "🙏" },
  { value: "witty", label: "Espritüel", emoji: "😄" },
  { value: "apologetic", label: "Özür Dileyen", emoji: "💐" },
  { value: "enthusiastic", label: "Coşkulu", emoji: "🔥" },
];

const platformLabels: Record<string, { label: string; color: string }> = {
  google: { label: "Google", color: "bg-blue-50 text-blue-700 border-blue-200" },
  booking: { label: "Booking.com", color: "bg-indigo-50 text-indigo-700 border-indigo-200" },
  tripadvisor: { label: "TripAdvisor", color: "bg-green-50 text-green-700 border-green-200" },
  trustpilot: { label: "Trustpilot", color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  hotelscom: { label: "Hotels.com", color: "bg-red-50 text-red-700 border-red-200" },
};

export default function Reviews() {
  const { activeBusiness, refetchBusinesses } = useBusiness();
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const urlPlatform = searchParams.get("platform") as PlatformFilter | null;
  
  const [selectedReview, setSelectedReview] = useState<any>(null);
  const [replyText, setReplyText] = useState("");
  
  // Filters and sorting
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [sentimentFilter, setSentimentFilter] = useState<SentimentFilter>("all");
  const [platformFilter, setPlatformFilter] = useState<PlatformFilter>(urlPlatform || "all");
  const [ratingFilter, setRatingFilter] = useState<RatingFilter>("all");
  const [sortOption, setSortOption] = useState<SortOption>("newest");
  // Sync platformFilter with URL changes (sidebar navigation)
  useEffect(() => {
    const newPlatform = searchParams.get("platform") as PlatformFilter | null;
    setPlatformFilter(newPlatform || "all");
    setCurrentPage(1);
  }, [searchParams]);

  const sortField: SortField = sortOption === "name_az" ? "reviewer_name" : sortOption?.includes("rating") ? "rating" : "posted_at";
  const sortOrder: SortOrder = sortOption === "oldest" || sortOption === "rating_low" || sortOption === "name_az" ? "asc" : "desc";
  const [isFetchingBooking, setIsFetchingBooking] = useState(false);
  
  // Inline platform setup
  const [platformUrlInput, setPlatformUrlInput] = useState("");
  const [savingPlatformUrl, setSavingPlatformUrl] = useState(false);

  // Platform setup config for Wextractor-based platforms
  const platformSetupConfig: Record<string, {
    label: string;
    placeholder: string;
    hint: string;
    dbField: string;
    getIdFromBusiness: (b: any) => string | null;
  }> = {
    booking: {
      label: "Booking.com",
      placeholder: "Booking.com URL'sini yapıştırın",
      hint: "Booking.com'da otelinizin sayfasını açın, URL'yi kopyalayıp buraya yapıştırın. Otomatik olarak doğru kısmı alacağız.",
      dbField: "booking_hotel_id",
      getIdFromBusiness: (b) => b.booking_hotel_id,
    },
    tripadvisor: {
      label: "TripAdvisor",
      placeholder: "TripAdvisor URL'sini yapıştırın",
      hint: "TripAdvisor'da otelinizin sayfasını açın, URL'yi kopyalayıp buraya yapıştırın.",
      dbField: "tripadvisor_id",
      getIdFromBusiness: (b) => b.tripadvisor_id,
    },
    trustpilot: {
      label: "Trustpilot",
      placeholder: "Trustpilot URL'sini yapıştırın",
      hint: "Trustpilot'ta işletmenizin sayfasını açın, URL'yi kopyalayıp buraya yapıştırın.",
      dbField: "trustpilot_url",
      getIdFromBusiness: (b) => b.trustpilot_url,
    },
    hotelscom: {
      label: "Hotels.com",
      placeholder: "Hotels.com URL'sini yapıştırın",
      hint: "Hotels.com'da otelinizin sayfasını açın, URL'yi kopyalayıp buraya yapıştırın.",
      dbField: "hotelscom_url",
      getIdFromBusiness: (b) => b.hotelscom_url,
    },
  };

  const parseUrlId = (input: string, platform: string): string => {
    const trimmed = input.trim();
    if (platform === "booking") {
      const match = trimmed.match(/hotel\/([a-z]{2})\/([a-z0-9_-]+)/i);
      if (match) return `${match[1]}/${match[2]}`;
    }
    if (platform === "tripadvisor") {
      const slugMatch = trimmed.match(/(?:Hotel|Restaurant|Attraction)_Review-g\d+-d(\d+)/i);
      if (slugMatch) return slugMatch[1];
      const numericMatch = trimmed.match(/(?:^|\D)(\d{5,})(?:\D|$)/);
      if (numericMatch) return numericMatch[1];
    }
    if (platform === "trustpilot") {
      const match = trimmed.match(/trustpilot\.com\/review\/([^\s/?#]+)/i);
      if (match) return match[1];
    }
    if (platform === "hotelscom") {
      const match = trimmed.match(/h[oe](\d+)/i);
      if (match) return match[1];
    }
    return trimmed;
  };

  const handlePlatformSetup = async (platform: string) => {
    const config = platformSetupConfig[platform];
    if (!activeBusiness || !platformUrlInput.trim() || !config) return;
    setSavingPlatformUrl(true);
    const parsedId = parseUrlId(platformUrlInput, platform);
    try {
      // Delete old reviews for this platform before updating
      await supabase
        .from("reviews")
        .delete()
        .eq("business_id", activeBusiness.id)
        .eq("platform", platform);

      const { error: updateError } = await supabase
        .from('businesses')
        .update({ [config.dbField]: parsedId })
        .eq('id', activeBusiness.id);
      if (updateError) throw updateError;

      const response = await supabase.functions.invoke('wextractor-fetch-reviews', {
        body: { business_id: activeBusiness.id, platform, fetch_all: true },
      });
      
      if (response.error) throw new Error(response.error.message);
      const result = response.data;
      if (result?.error) {
        toast({ title: "Hata", description: result.error, variant: "destructive" });
      } else {
        toast({
          title: "Yorumlar Çekildi! 🎉",
          description: `${result.inserted} yorum eklendi${result.skipped ? `, ${result.skipped} zaten mevcut` : ''}.`,
        });
        setPlatformUrlInput("");
        refetch();
        refetchBusinesses();
      }
    } catch (err: any) {
      toast({ title: "Hata", description: err.message || "Bir sorun oluştu.", variant: "destructive" });
    } finally {
      setSavingPlatformUrl(false);
    }
  };
  
  // Bulk selection
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isGeneratingReply, setIsGeneratingReply] = useState(false);
  const [generatingIds, setGeneratingIds] = useState<Set<string>>(new Set());
  const [tonePerId, setTonePerId] = useState<Record<string, ToneOption>>({});
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 25;

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

    // Rating filter
    if (ratingFilter !== "all") {
      const targetRating = parseInt(ratingFilter);
      result = result.filter((r) => r.rating === targetRating);
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
  }, [reviews, searchQuery, statusFilter, sentimentFilter, platformFilter, ratingFilter, sortField, sortOrder]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredReviews.length / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const paginatedReviews = filteredReviews.slice((safeCurrentPage - 1) * pageSize, safeCurrentPage * pageSize);

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
        body: { reviewId, approvedReply: reply, sendToGoogle: true, userId: session.user.id },
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

  // Generate AI reply mutation (for detail sheet)
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
      return { reply: response.data?.reply || "", reviewId: review.id };
    },
    onSuccess: ({ reply, reviewId }) => {
      setReplyText(reply);
      // Save to DB
      supabase.from('reviews').update({ suggested_reply: reply }).eq('id', reviewId).then(() => {
        queryClient.invalidateQueries({ queryKey: ['reviews'] });
      });
      toast({ title: "AI Yanıt Oluşturuldu", description: "Yeni bir yanıt önerisi oluşturuldu." });
    },
    onError: () => {
      toast({ title: "Hata", description: "AI yanıt oluşturulamadı.", variant: "destructive" });
    },
    onSettled: () => {
      setIsGeneratingReply(false);
    },
  });

  const getReviewTone = (reviewId: string): ToneOption => tonePerId[reviewId] || "friendly";
  const setReviewTone = (reviewId: string, tone: ToneOption) => {
    setTonePerId(prev => ({ ...prev, [reviewId]: tone }));
  };

  // Inline AI reply generation for table rows
  const inlineGenerateMutation = useMutation({
    mutationFn: async (review: any) => {
      setGeneratingIds(prev => new Set(prev).add(review.id));
      const tone = getReviewTone(review.id);
      const response = await supabase.functions.invoke('generate-reply', {
        body: {
          review_text: review.text,
          reviewer_name: review.reviewer_name,
          rating: review.rating,
          sentiment: review.sentiment,
          tone,
          language: "auto",
        },
      });
      if (response.error) throw response.error;
      return { reply: response.data?.reply || "", reviewId: review.id };
    },
    onSuccess: async ({ reply, reviewId }) => {
      await supabase.from('reviews').update({ suggested_reply: reply }).eq('id', reviewId);
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
      toast({ title: "AI Yanıt Hazır ✨", description: "Yanıt oluşturuldu, kopyalayabilirsiniz." });
    },
    onError: () => {
      toast({ title: "Hata", description: "AI yanıt oluşturulamadı.", variant: "destructive" });
    },
    onSettled: (_, __, review) => {
      setGeneratingIds(prev => {
        const next = new Set(prev);
        next.delete(review.id);
        return next;
      });
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
    if (field === "posted_at") {
      setSortOption(sortOption === "newest" ? "oldest" : "newest");
    } else if (field === "rating") {
      setSortOption(sortOption === "rating_high" ? "rating_low" : "rating_high");
    } else if (field === "reviewer_name") {
      setSortOption("name_az");
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
          {activeBusiness?.google_connected && (
            <Button 
              size="sm" 
              onClick={async () => {
                if (!activeBusiness) return;
                setIsFetchingBooking(true);
                try {
                  const response = await supabase.functions.invoke('google-business-reviews', {
                    body: { business_id: activeBusiness.id },
                  });
                  if (response.error) throw new Error(response.error.message);
                  const result = response.data;
                  if (result?.error) {
                    toast({ title: "Hata", description: result.error, variant: "destructive" });
                  } else {
                    toast({
                      title: "Google Yorumları Çekildi",
                      description: `${result.inserted || 0} yeni yorum eklendi, ${result.skipped || 0} zaten mevcut.`,
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
              {isFetchingBooking ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Download className="h-4 w-4 mr-2" />}
              {isFetchingBooking ? 'Çekiliyor...' : 'Google Yorumları Çek'}
            </Button>
          )}
          {platformFilter !== "all" && platformFilter !== "google" && (
            <Button 
              size="sm" 
              onClick={async () => {
                if (!activeBusiness) return;
                setIsFetchingBooking(true);
                try {
                  const response = await supabase.functions.invoke('wextractor-fetch-reviews', {
                    body: { business_id: activeBusiness.id, platform: platformFilter, fetch_all: true },
                  });
                  if (response.error) throw new Error(response.error.message);
                  const result = response.data;
                  if (result?.error) {
                    toast({ title: "Hata", description: result.error, variant: "destructive" });
                  } else {
                    toast({
                      title: `${platformLabels[platformFilter]?.label} Yorumları Çekildi`,
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
              {isFetchingBooking ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Download className="h-4 w-4 mr-2" />}
              {isFetchingBooking ? 'Çekiliyor...' : `${platformLabels[platformFilter]?.label} Yorumları Çek`}
            </Button>
          )}
        </div>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Yorum veya yorumcu ara..."
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v as StatusFilter); setCurrentPage(1); }}>
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
          <Select value={sentimentFilter} onValueChange={(v) => { setSentimentFilter(v as SentimentFilter); setCurrentPage(1); }}>
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
          <Select value={platformFilter} onValueChange={(v) => { setPlatformFilter(v as PlatformFilter); setCurrentPage(1); }}>
            <SelectTrigger className="w-[160px]">
              <Globe className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Platform" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tüm Platformlar</SelectItem>
              <SelectItem value="google">Google</SelectItem>
              <SelectItem value="booking">Booking.com</SelectItem>
              <SelectItem value="tripadvisor">TripAdvisor</SelectItem>
              <SelectItem value="trustpilot">Trustpilot</SelectItem>
              <SelectItem value="hotelscom">Hotels.com</SelectItem>
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

      {/* Platform Setup Card - shows when a specific wextractor platform is selected and not configured */}
      {platformFilter !== "all" && platformFilter !== "google" && platformSetupConfig[platformFilter] && (() => {
        const config = platformSetupConfig[platformFilter];
        const hasId = config.getIdFromBusiness(activeBusiness);
        const platformReviews = reviews.filter((r: any) => r.platform === platformFilter);
        if (platformReviews.length > 0 || !config) return null;
        return (
          <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-transparent shadow-card">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-foreground mb-1">
                {hasId ? `${config.label} Bağlı ✅` : `${config.label} Yorumlarını Çekin`}
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                {hasId 
                  ? `${config.label} bağlı (${hasId}). Yorumlarınızı çekebilirsiniz.`
                  : config.hint
                }
              </p>
              {!hasId ? (
                <div className="flex gap-2 items-center">
                  <Input
                    placeholder={config.placeholder}
                    value={platformUrlInput}
                    onChange={(e) => setPlatformUrlInput(e.target.value)}
                    disabled={savingPlatformUrl}
                    className="flex-1"
                  />
                  <Button 
                    onClick={() => handlePlatformSetup(platformFilter)} 
                    disabled={!platformUrlInput.trim() || savingPlatformUrl}
                  >
                    {savingPlatformUrl ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Download className="h-4 w-4 mr-2" />}
                    {savingPlatformUrl ? "Çekiliyor..." : "Yorumları Çek"}
                  </Button>
                </div>
              ) : (
                <Button
                  onClick={async () => {
                    setIsFetchingBooking(true);
                    try {
                      const response = await supabase.functions.invoke('wextractor-fetch-reviews', {
                        body: { business_id: activeBusiness.id, platform: platformFilter, fetch_all: true },
                      });
                      if (response.error) throw new Error(response.error.message);
                      const result = response.data;
                      if (result?.error) {
                        toast({ title: "Hata", description: result.error, variant: "destructive" });
                      } else {
                        toast({
                          title: `${config.label} Yorumları Çekildi! 🎉`,
                          description: `${result.inserted} yorum eklendi.`,
                        });
                        refetch();
                      }
                    } catch (err: any) {
                      toast({ title: "Hata", description: err.message, variant: "destructive" });
                    } finally {
                      setIsFetchingBooking(false);
                    }
                  }}
                  disabled={isFetchingBooking}
                >
                  {isFetchingBooking ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Download className="h-4 w-4 mr-2" />}
                  {isFetchingBooking ? "Çekiliyor..." : `${config.label} Yorumlarını Çek`}
                </Button>
              )}
            </div>
          </Card>
        );
      })()}

      {/* Google empty state */}
      {filteredReviews.length === 0 && platformFilter === "google" && activeBusiness.google_connected && (
        <Card className="p-8 shadow-card border-dashed border-2 border-primary/30 bg-primary/5">
          <div className="max-w-lg mx-auto text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
              <Download className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">Google Yorumlarınızı Çekin</h3>
            <p className="text-sm text-muted-foreground">
              Google Business hesabınız bağlı. Yorumlarınızı API üzerinden otomatik çekebilirsiniz.
            </p>
            <Button
              onClick={async () => {
                if (!activeBusiness) return;
                setIsFetchingBooking(true);
                try {
                  const response = await supabase.functions.invoke('google-business-reviews', {
                    body: { business_id: activeBusiness.id },
                  });
                  if (response.error) throw new Error(response.error.message);
                  const result = response.data;
                  if (result?.error) {
                    toast({ title: "Hata", description: result.error, variant: "destructive" });
                  } else {
                    toast({
                      title: "Google Yorumları Çekildi! 🎉",
                      description: `${result.inserted || 0} yorum eklendi.`,
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
              {isFetchingBooking && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {isFetchingBooking ? 'Çekiliyor...' : 'Google Yorumlarını Çek'}
            </Button>
          </div>
        </Card>
      )}

      {/* Reviews Table */}
      {filteredReviews.length === 0 && reviews.length > 0 ? (
        <Card className="p-12 text-center shadow-card">
          <p className="text-muted-foreground text-lg">Arama kriterlerine uygun yorum bulunamadı.</p>
          <p className="text-sm text-muted-foreground mt-2">Filtreleri değiştirmeyi deneyin.</p>
        </Card>
      ) : filteredReviews.length > 0 ? (
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
                <TableHead className="font-semibold min-w-[200px]">Yorum</TableHead>
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
                <TableHead className="font-semibold min-w-[280px]">AI Yanıt</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedReviews.map((review) => {
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
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      {review.text ? (
                        <Popover>
                          <PopoverTrigger asChild>
                            <p className="text-xs text-muted-foreground line-clamp-2 max-w-[200px] cursor-pointer hover:text-foreground transition-colors">
                              {review.text}
                            </p>
                          </PopoverTrigger>
                          <PopoverContent className="w-96 max-h-72 overflow-auto" side="bottom">
                            <p className="text-sm leading-relaxed whitespace-pre-wrap">{review.text}</p>
                          </PopoverContent>
                        </Popover>
                      ) : (
                        <span className="text-xs text-muted-foreground italic">Metin yok</span>
                      )}
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
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      {review.suggested_reply ? (
                        <div className="flex items-start gap-2">
                          <Popover>
                            <PopoverTrigger asChild>
                              <p className="text-xs text-muted-foreground line-clamp-2 flex-1 max-w-[200px] cursor-pointer hover:text-foreground transition-colors">
                                {review.suggested_reply}
                              </p>
                            </PopoverTrigger>
                            <PopoverContent className="w-80 max-h-60 overflow-auto" side="left">
                              <p className="text-sm leading-relaxed whitespace-pre-wrap">{review.suggested_reply}</p>
                            </PopoverContent>
                          </Popover>
                          <div className="flex gap-1 shrink-0">
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-7 w-7"
                              title="Kopyala"
                              onClick={async () => {
                                await navigator.clipboard.writeText(review.suggested_reply!);
                                toast({ title: "Kopyalandı ✓", description: "Yanıt panoya kopyalandı." });
                              }}
                            >
                              <Copy className="h-3.5 w-3.5" />
                            </Button>
                            <Select
                              value={getReviewTone(review.id)}
                              onValueChange={(v) => setReviewTone(review.id, v as ToneOption)}
                            >
                              <SelectTrigger className="h-7 w-7 p-0 border-0 bg-transparent shadow-none [&>svg:last-child]:hidden" title="Ton seç">
                                <span className="text-sm">{toneOptions.find(t => t.value === getReviewTone(review.id))?.emoji}</span>
                              </SelectTrigger>
                              <SelectContent>
                                {toneOptions.map((t) => (
                                  <SelectItem key={t.value} value={t.value}>
                                    {t.emoji} {t.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-7 w-7"
                              title="Yeniden üret"
                              disabled={generatingIds.has(review.id)}
                              onClick={() => inlineGenerateMutation.mutate(review)}
                            >
                              <RefreshCw className={`h-3.5 w-3.5 ${generatingIds.has(review.id) ? 'animate-spin' : ''}`} />
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1">
                          <Select
                            value={getReviewTone(review.id)}
                            onValueChange={(v) => setReviewTone(review.id, v as ToneOption)}
                          >
                            <SelectTrigger className="h-8 w-auto px-2 border rounded bg-background shadow-sm gap-1" title="Ton seç">
                              <span className="text-sm">{toneOptions.find(t => t.value === getReviewTone(review.id))?.emoji}</span>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {toneOptions.map((t) => (
                                <SelectItem key={t.value} value={t.value}>
                                  {t.emoji} {t.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-xs gap-1.5"
                            disabled={generatingIds.has(review.id)}
                            onClick={() => inlineGenerateMutation.mutate(review)}
                          >
                            <Sparkles className={`h-3.5 w-3.5 ${generatingIds.has(review.id) ? 'animate-spin' : ''}`} />
                            {generatingIds.has(review.id) ? 'Üretiliyor...' : 'AI Yanıt Üret'}
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t">
              <p className="text-sm text-muted-foreground">
                {filteredReviews.length} yorumdan {(safeCurrentPage - 1) * pageSize + 1}–{Math.min(safeCurrentPage * pageSize, filteredReviews.length)} arası gösteriliyor
              </p>
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={safeCurrentPage <= 1}
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(p => p === 1 || p === totalPages || Math.abs(p - safeCurrentPage) <= 1)
                  .reduce<(number | string)[]>((acc, p, idx, arr) => {
                    if (idx > 0 && p - (arr[idx - 1] as number) > 1) acc.push('...');
                    acc.push(p);
                    return acc;
                  }, [])
                  .map((p, i) =>
                    typeof p === 'string' ? (
                      <span key={`ellipsis-${i}`} className="px-2 text-muted-foreground text-sm">…</span>
                    ) : (
                      <Button
                        key={p}
                        variant={p === safeCurrentPage ? "default" : "outline"}
                        size="sm"
                        className="min-w-[36px]"
                        onClick={() => setCurrentPage(p)}
                      >
                        {p}
                      </Button>
                    )
                  )}
                <Button
                  variant="outline"
                  size="sm"
                  disabled={safeCurrentPage >= totalPages}
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </Card>
      ) : null}

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
