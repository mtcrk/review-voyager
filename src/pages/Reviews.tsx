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
import { Star, Copy, Send, CheckCircle2, Search, Filter, ArrowUpDown, RefreshCw, Sparkles, Download, Globe, ChevronLeft, ChevronRight, Loader2, MapPin } from "lucide-react";
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
import { useReviewFetch } from "@/contexts/ReviewFetchContext";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { ReviewTranslator } from "@/components/reviews/ReviewTranslator";
import { ReviewAnalysisChips, type ChipSelection } from "@/components/reviews/ReviewAnalysisChips";
import { ReviewAnalysisPanel } from "@/components/reviews/ReviewAnalysisPanel";
import { matchesCategory, REVIEW_CATEGORIES } from "@/lib/reviewCategories";
import { useReviewAnalyses, useCiTopics, sentimentTone } from "@/hooks/useReviewAnalysis";
import { useTranslation } from "react-i18next";

type SortField = "posted_at" | "rating" | "reviewer_name";
type SortOrder = "asc" | "desc";
type StatusFilter = "all" | "pending" | "approved" | "replied" | "not_replied";
type SentimentFilter = "all" | "positive" | "negative" | "neutral";
type PlatformFilter = "all" | "google" | "booking" | "tripadvisor" | "expedia" | "hotelscom" | "tripcom" | "yandex";
type RatingFilter = "all" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "10";
type SortOption = "newest" | "oldest" | "rating_high" | "rating_low" | "name_az";

// Booking, Expedia, Hotels.com, Trip.com use a 1-10 native scale; others use 1-5
const TEN_SCALE_PLATFORMS = new Set(["booking", "expedia", "hotelscom", "tripcom"]);
const getRatingScale = (platform?: string | null): 5 | 10 =>
  platform && TEN_SCALE_PLATFORMS.has(platform.toLowerCase()) ? 10 : 5;

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

const languageOptions: { value: string; label: string; flag: string }[] = [
  { value: "auto", label: "Misafirin dili", flag: "🌐" },
  { value: "TR", label: "Türkçe", flag: "🇹🇷" },
  { value: "EN", label: "İngilizce", flag: "🇬🇧" },
  { value: "DE", label: "Almanca", flag: "🇩🇪" },
  { value: "RU", label: "Rusça", flag: "🇷🇺" },
  { value: "FR", label: "Fransızca", flag: "🇫🇷" },
  { value: "AR", label: "Arapça", flag: "🇸🇦" },
];

const platformLabels: Record<string, { label: string; color: string }> = {
  google: { label: "Google", color: "bg-blue-50 text-blue-700 border-blue-200" },
  booking: { label: "Booking.com", color: "bg-indigo-50 text-indigo-700 border-indigo-200" },
  tripadvisor: { label: "TripAdvisor", color: "bg-green-50 text-green-700 border-green-200" },
  expedia: { label: "Expedia", color: "bg-yellow-50 text-yellow-700 border-yellow-200" },
  hotelscom: { label: "Hotels.com", color: "bg-red-50 text-red-700 border-red-200" },
  tripcom: { label: "Trip.com", color: "bg-orange-50 text-orange-700 border-orange-200" },
  yandex: { label: "Yandex", color: "bg-red-50 text-red-700 border-red-200" },
};

export default function Reviews() {
  const { activeBusiness, businesses, refetchBusinesses } = useBusiness();
  const { t: tt } = useTranslation();
  const { startFetch, hasPendingRuns, setOnFetchComplete } = useReviewFetch();
  const [locationFilter, setLocationFilter] = useState<string>("active");
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const urlPlatform = searchParams.get("platform") as PlatformFilter | null;
  
  const [selectedReview, setSelectedReview] = useState<any>(null);
  const [replyText, setReplyText] = useState("");
  const [replyLanguage, setReplyLanguage] = useState<string>("auto");
  
  // Filters and sorting
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [sentimentFilter, setSentimentFilter] = useState<SentimentFilter>("all");
  const [platformFilter, setPlatformFilter] = useState<PlatformFilter>(urlPlatform || "all");
  const [ratingFilter, setRatingFilter] = useState<RatingFilter>("all");
  const [sortOption, setSortOption] = useState<SortOption>("newest");
  const [chipFilter, setChipFilter] = useState<ChipSelection>(null);
  const [topicFilter, setTopicFilter] = useState<string>("all");
  const [attentionFilter, setAttentionFilter] = useState<"all" | "needed">("all");
  // Sync platformFilter with URL changes (sidebar navigation)
  useEffect(() => {
    const newPlatform = searchParams.get("platform") as PlatformFilter | null;
    const newSentiment = searchParams.get("sentiment") as SentimentFilter | null;
    const newStatus = searchParams.get("status") as StatusFilter | null;
    setPlatformFilter(newPlatform || "all");
    if (newSentiment) setSentimentFilter(newSentiment);
    if (newStatus) setStatusFilter(newStatus);
    setCurrentPage(1);
  }, [searchParams]);

  const sortField: SortField = sortOption === "name_az" ? "reviewer_name" : sortOption?.includes("rating") ? "rating" : "posted_at";
  const sortOrder: SortOrder = sortOption === "oldest" || sortOption === "rating_low" || sortOption === "name_az" ? "asc" : "desc";
  const [isFetchingBooking, setIsFetchingBooking] = useState(false);
  const [isAutoDiscovering, setIsAutoDiscovering] = useState(false);
  
  // Inline platform setup
  const [platformUrlInput, setPlatformUrlInput] = useState("");
  const [savingPlatformUrl, setSavingPlatformUrl] = useState(false);

  const getTargetBusiness = () => {
    if (!activeBusiness) return null;
    if (locationFilter === "active") return activeBusiness;
    if (locationFilter === "all") return null;
    return businesses.find((b) => b.id === locationFilter) || null;
  };

  // Auto-discover platform URL
  const handleAutoDiscover = async (platform: string) => {
    const targetBusiness = getTargetBusiness();
    if (!targetBusiness) {
      toast({
        title: "Lokasyon seçin",
        description: "Bu işlem için tek bir lokasyon seçmelisiniz.",
        variant: "destructive",
      });
      return;
    }

    setIsAutoDiscovering(true);
    try {
      const { data, error } = await supabase.functions.invoke("discover-platforms", {
        body: { business_name: targetBusiness.name, city: targetBusiness.city || "" },
      });
      if (error) throw error;

      // Only accept high-confidence matches to avoid wrong associations
      const match = data?.results?.find((r: any) => r.platform === platform && r.confidence === "high");
      if (match?.url && match?.extractedId) {
        // Auto-save the discovered URL
        const config = platformSetupConfig[platform];
        if (config) {
          const parsedId = parseUrlId(match.url, platform);
          // Delete old reviews
          await supabase
            .from("reviews")
            .delete()
            .eq("business_id", targetBusiness.id)
            .eq("platform", platform);
          // Save to DB
          await supabase
            .from("businesses")
            .update({ [config.dbField]: parsedId } as any)
            .eq("id", targetBusiness.id);
          // Fetch reviews
          const result = await invokeApifyFetchWithPolling(platform);
          if (result?.error) {
            toast({ title: "Hata", description: result.error, variant: "destructive" });
          } else if (result?.status === "started") {
            toast({
              title: `${config.label} yorumları çekiliyor`,
              description: "İlk senkronizasyon arka planda başladı. Tamamlanınca bildirim göreceksiniz.",
            });
            refetchBusinesses();
          } else {
            toast({
              title: `${config.label} Yorumları Çekildi! 🎉`,
              description: `${result.inserted} yeni yorum eklendi.`,
            });
            refetch();
            refetchBusinesses();
          }
        }
      } else {
        toast({ title: "Bulunamadı", description: `${platform} profili otomatik bulunamadı. Lütfen URL'yi manuel yapıştırın.`, variant: "destructive" });
      }
    } catch (err: any) {
      toast({ title: "Hata", description: err.message || "Otomatik arama başarısız.", variant: "destructive" });
    } finally {
      setIsAutoDiscovering(false);
    }
  };

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
    hotelscom: {
      label: "Hotels.com",
      placeholder: "Hotels.com URL'sini yapıştırın",
      hint: "Hotels.com'da otelinizin sayfasını açın, URL'yi kopyalayıp buraya yapıştırın.",
      dbField: "hotelscom_url",
      getIdFromBusiness: (b) => b.hotelscom_url,
    },
    expedia: {
      label: "Expedia",
      placeholder: "Expedia URL'sini yapıştırın (örn. .../h12345.Hotel-Information)",
      hint: "Expedia'da otelinizin sayfasını açın ve tam URL'yi yapıştırın. Bu bağlantıyı tam URL olarak kaydedeceğiz.",
      dbField: "expedia_hotel_id",
      getIdFromBusiness: (b) => b.expedia_hotel_id,
    },
    tripcom: {
      label: "Trip.com",
      placeholder: "Trip.com URL'sini veya hotel ID'sini yapıştırın",
      hint: "Trip.com'da otelinizin sayfasını açın, URL'yi kopyalayıp buraya yapıştırın. Hotel ID'yi otomatik çıkaracağız.",
      dbField: "tripcom_hotel_id",
      getIdFromBusiness: (b) => (b as any).tripcom_hotel_id,
    },
    yandex: {
      label: "Yandex Haritalar",
      placeholder: "https://yandex.com.tr/maps/org/.../52632836783/ veya 52632836783",
      hint: "Yandex Haritalar'daki işletme sayfanızın linkini yapıştırın.",
      dbField: "yandex_org_id",
      getIdFromBusiness: (b) => (b as any).yandex_org_id,
    },
  };

  const parseUrlId = (input: string, platform: string): string => {
    const trimmed = input.trim();
    if (platform === "booking") {
      const match = trimmed.match(/hotel\/([a-z]{2})\/([a-z0-9_-]+)/i);
      if (match) return `${match[1]}/${match[2]}`;
    }
    if (platform === "tripadvisor") {
      // Store the full TripAdvisor URL for the dedicated scraper
      const urlMatch = trimmed.match(/(https?:\/\/(?:www\.)?tripadvisor\.[a-z.]+\/(?:Hotel|Restaurant|Attraction)_Review[^\s]*)/i);
      if (urlMatch) return urlMatch[1];
      // If just a numeric ID, return as-is
      const numericMatch = trimmed.match(/(?:^|\D)(\d{5,})(?:\D|$)/);
      if (numericMatch) return numericMatch[1];
    }
    if (platform === "hotelscom") {
      const match = trimmed.match(/h[oe](\d+)/i);
      if (match) return match[1];
    }
    if (platform === "expedia") {
      if (/^https?:\/\/(?:www\.)?expedia\./i.test(trimmed) || /^https?:\/\/expe\.app\.link\//i.test(trimmed)) {
        return trimmed.split("#")[0].split("?")[0];
      }
      const m1 = trimmed.match(/h(\d{4,})\.Hotel-Information/i);
      if (m1) return m1[1];
      const m2 = trimmed.match(/[?&]hotelId=(\d{4,})/i);
      if (m2) return m2[1];
      const m3 = trimmed.match(/\/hotels?\/(\d{4,})/i);
      if (m3) return m3[1];
      if (/^\d{4,}$/.test(trimmed)) return trimmed;
    }
    if (platform === "tripcom") {
      const m1 = trimmed.match(/[?&]hotelId=(\d{4,})/i);
      if (m1) return m1[1];
      const m2 = trimmed.match(/hotel-detail-(\d{4,})/i);
      if (m2) return m2[1];
      if (/^\d{4,}$/.test(trimmed)) return trimmed;
    }
    if (platform === "yandex") {
      const m1 = trimmed.match(/\/maps\/org\/[^/]+\/(\d{4,})/i);
      if (m1) return m1[1];
      if (/^\d{4,}$/.test(trimmed)) return trimmed;
    }
    return trimmed;
  };

  // Fire-and-forget using global context
  const invokeApifyFetchStart = async (platform: string) => {
    const targetBusiness = getTargetBusiness();
    if (!targetBusiness) throw new Error("Bu işlem için tek bir lokasyon seçmelisiniz");

    return startFetch({
      businessId: targetBusiness.id,
      businessName: targetBusiness.name,
      platform,
    });
  };

  // Register refetch callback so global context can refresh reviews list
  useEffect(() => {
    setOnFetchComplete(() => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
    });
    return () => setOnFetchComplete(undefined);
  }, [setOnFetchComplete, queryClient]);

  // Legacy wrapper for places that still use the old API (platform setup with URL)
  const invokeApifyFetchWithPolling = async (platform: string) => {
    return invokeApifyFetchStart(platform);
  };

  const handlePlatformSetup = async (platform: string) => {
    const config = platformSetupConfig[platform];
    const targetBusiness = getTargetBusiness();

    if (!targetBusiness || !platformUrlInput.trim() || !config) {
      if (!targetBusiness) {
        toast({
          title: "Lokasyon seçin",
          description: "Bu işlem için tek bir lokasyon seçmelisiniz.",
          variant: "destructive",
        });
      }
      return;
    }

    setSavingPlatformUrl(true);
    const parsedId = parseUrlId(platformUrlInput, platform);
    try {
      // Delete old reviews for this platform before updating
      await supabase
        .from("reviews")
        .delete()
        .eq("business_id", targetBusiness.id)
        .eq("platform", platform);

      const { error: updateError } = await supabase
        .from('businesses')
        .update({ [config.dbField]: parsedId } as any)
        .eq('id', targetBusiness.id);
      if (updateError) throw updateError;

      const result = await invokeApifyFetchWithPolling(platform);
      if (result?.error) {
        toast({ title: "Hata", description: result.error, variant: "destructive" });
      } else if (result?.status === "started") {
        toast({
          title: `${config.label} yorumları çekiliyor`,
          description: "İlk senkronizasyon arka planda başladı. Tamamlanınca bildirim göreceksiniz.",
        });
        setPlatformUrlInput("");
        refetchBusinesses();
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
  const [langPerId, setLangPerId] = useState<Record<string, string>>({});
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 25;

  // Determine which business IDs to query
  const queryBusinessIds = useMemo(() => {
    if (locationFilter === "all") return businesses.map(b => b.id);
    if (locationFilter === "active") return activeBusiness ? [activeBusiness.id] : [];
    return [locationFilter]; // specific business id
  }, [locationFilter, activeBusiness, businesses]);

  const businessNameMap = useMemo(() => {
    const map: Record<string, string> = {};
    businesses.forEach(b => { map[b.id] = b.name; });
    return map;
  }, [businesses]);

  // Batched analysis data (one query per table for the whole business scope)
  const { analysisByReview, topicsByReview } = useReviewAnalyses(queryBusinessIds);
  const { labels: topicLabels } = useCiTopics();

  // Topics present in the current data set (for the dropdown filter)
  const availableTopics = useMemo(() => {
    const ids = new Set<string>();
    topicsByReview.forEach((rows) => rows.forEach((r) => ids.add(r.topic_id)));
    return Array.from(ids)
      .map((id) => ({ id, label: topicLabels[id] || id }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [topicsByReview, topicLabels]);

  // Fetch reviews from Supabase (paginated to bypass 1000-row limit)
  const { data: reviews = [], isLoading, refetch } = useQuery({
    queryKey: ['reviews', queryBusinessIds],
    queryFn: async () => {
      if (queryBusinessIds.length === 0) return [];

      const pageSize = 1000;
      let from = 0;
      const all: any[] = [];

      while (true) {
        const { data, error } = await supabase
          .from('reviews')
          .select('*')
          .in('business_id', queryBusinessIds)
          .order('posted_at', { ascending: false })
          .range(from, from + pageSize - 1);

        if (error) throw error;
        if (!data || data.length === 0) break;
        all.push(...data);
        if (data.length < pageSize) break;
        from += pageSize;
      }

      return all;
    },
    enabled: queryBusinessIds.length > 0,
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
        if (statusFilter === "pending") return !r.status || r.status === "pending" || r.status === "pending_reply";
        if (statusFilter === "not_replied") return !r.approved_reply && r.status !== "replied";
        return r.status === statusFilter;
      });
    }

    // Platform filter
    if (platformFilter !== "all") {
      result = result.filter((r) => (r as any).platform === platformFilter);
    }

    // Sentiment filter
    if (sentimentFilter !== "all") {
      result = result.filter((r) => {
        const a = analysisByReview.get(r.id);
        const label = a
          ? a.sentiment_label === "mixed"
            ? sentimentTone(Number(a.overall_sentiment ?? 0))
            : a.sentiment_label
          : r.sentiment?.toLowerCase();
        return label === sentimentFilter;
      });
    }

    // Rating filter
    if (ratingFilter !== "all") {
      const targetRating = parseInt(ratingFilter);
      result = result.filter((r) => r.rating === targetRating);
    }

    // Chip filter — real topic from analysis, or keyword category fallback
    if (chipFilter?.type === "topic") {
      result = result.filter((r) =>
        (topicsByReview.get(r.id) ?? []).some((tr) => tr.topic_id === chipFilter.key),
      );
    } else if (chipFilter?.type === "category") {
      const cat = REVIEW_CATEGORIES.find((c) => c.key === chipFilter.key);
      if (cat) {
        result = result.filter((r) =>
          matchesCategory(`${r.text || ""} ${r.summary || ""}`, cat)
        );
      }
    }

    // Topic filter (dropdown)
    if (topicFilter !== "all") {
      result = result.filter((r) =>
        (topicsByReview.get(r.id) ?? []).some((tr) => tr.topic_id === topicFilter),
      );
    }

    // Needs attention filter
    if (attentionFilter === "needed") {
      result = result.filter((r) => {
        const flags = (analysisByReview.get(r.id)?.flags ?? {}) as any;
        return !!flags.recovery_needed || !!flags.legal_risk;
      });
    }

    // Sorting
    result.sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case "posted_at":
          {
            // Düzenlenmiş yorumları Google'ın updateTime'ına (edited_at) göre sırala
            const aDate = a.edited_at ? new Date(a.edited_at).getTime() : new Date(a.posted_at).getTime();
            const bDate = b.edited_at ? new Date(b.edited_at).getTime() : new Date(b.posted_at).getTime();
            comparison = aDate - bDate;
          }
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
  }, [reviews, searchQuery, statusFilter, sentimentFilter, platformFilter, ratingFilter, chipFilter, topicFilter, attentionFilter, analysisByReview, topicsByReview, sortField, sortOrder]);

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
          language: replyLanguage,
          business_id: review.business_id,
          platform: review.platform,
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

  const getReviewLang = (reviewId: string): string => langPerId[reviewId] || "auto";
  const setReviewLang = (reviewId: string, lang: string) => {
    setLangPerId(prev => ({ ...prev, [reviewId]: lang }));
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
          language: getReviewLang(review.id),
          business_id: review.business_id,
          platform: review.platform,
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

  const pendingCount = reviews.filter((r) => !r.status || r.status === "pending" || r.status === "pending_reply").length;
  const repliedCount = reviews.filter((r) => r.status === "replied").length;
  const targetBusiness = getTargetBusiness();

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
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-semibold text-foreground">Yorumlar</h1>
            {businesses.length > 1 && (
              <Select value={locationFilter} onValueChange={(v) => { setLocationFilter(v); setCurrentPage(1); }}>
                <SelectTrigger className="w-[200px] h-9 text-sm">
                  <MapPin className="h-4 w-4 mr-1.5 text-muted-foreground" />
                  <SelectValue placeholder="Lokasyon" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">{activeBusiness?.name || "Aktif Lokasyon"}</SelectItem>
                  <SelectItem value="all">Tüm Lokasyonlar</SelectItem>
                  {businesses.filter(b => b.id !== activeBusiness?.id).map(b => (
                    <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
          <p className="text-muted-foreground">
            {locationFilter !== "active" && locationFilter !== "all" 
              ? `${businessNameMap[locationFilter] || ""} — ` 
              : locationFilter === "all" ? "Tüm lokasyonlar — " : ""}
            {reviews.length} yorum • {pendingCount} beklemede • {repliedCount} yanıtlandı
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Yenile
          </Button>
          {targetBusiness?.google_connected && (
            <Button 
              size="sm" 
              onClick={async () => {
                if (!targetBusiness) return;
                setIsFetchingBooking(true);
                try {
                  const response = await supabase.functions.invoke('google-business-reviews', {
                    body: { business_id: targetBusiness.id },
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
          {platformFilter !== "all" && platformFilter !== "google" && targetBusiness && platformSetupConfig[platformFilter]?.getIdFromBusiness(targetBusiness) && (
            <Button 
              size="sm" 
              onClick={async () => {
                if (!targetBusiness) return;
                setIsFetchingBooking(true);
                try {
                  const result = await invokeApifyFetchStart(platformFilter);
                  if (result?.status === "started") {
                    toast({
                      title: `${platformLabels[platformFilter]?.label} Çekim Başlatıldı`,
                      description: "Yorumlar arka planda çekiliyor. Tamamlandığında bildirileceksiniz.",
                    });
                  } else if (result?.error) {
                    toast({ title: "Hata", description: result.error, variant: "destructive" });
                  } else if (result?.success) {
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
              disabled={isFetchingBooking || hasPendingRuns}
            >
              {(isFetchingBooking || hasPendingRuns) ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Download className="h-4 w-4 mr-2" />}
              {hasPendingRuns ? 'Çekiliyor...' : isFetchingBooking ? 'Başlatılıyor...' : `${platformLabels[platformFilter]?.label} Yorumları Çek`}
            </Button>
          )}
        </div>
      </div>

      {/* Topic chips from real analysis (keyword categories as fallback) */}
      {reviews.length > 0 && (
        <ReviewAnalysisChips
          reviews={reviews}
          analysisByReview={analysisByReview}
          topicsByReview={topicsByReview}
          topicLabels={topicLabels}
          selected={chipFilter}
          onSelect={(sel) => { setChipFilter(sel); setCurrentPage(1); }}
        />
      )}

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
              <SelectItem value="not_replied">Yanıtlanmamış</SelectItem>
              <SelectItem value="replied">Yanıtlanmış</SelectItem>
              <SelectItem value="approved">Onaylandı</SelectItem>
            </SelectContent>
          </Select>
          <Select value={sentimentFilter} onValueChange={(v) => { setSentimentFilter(v as SentimentFilter); setCurrentPage(1); }}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder={tt("analysis.filters.sentiment")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{tt("analysis.filters.sentimentAll")}</SelectItem>
              <SelectItem value="positive">{tt("analysis.labels.positive")}</SelectItem>
              <SelectItem value="neutral">{tt("analysis.labels.neutral")}</SelectItem>
              <SelectItem value="negative">{tt("analysis.labels.negative")}</SelectItem>
            </SelectContent>
          </Select>
          <Select value={topicFilter} onValueChange={(v) => { setTopicFilter(v); setCurrentPage(1); }}>
            <SelectTrigger className="w-[170px]">
              <SelectValue placeholder={tt("analysis.filters.topic")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{tt("analysis.filters.topicAll")}</SelectItem>
              {availableTopics.map((tp) => (
                <SelectItem key={tp.id} value={tp.id}>{tp.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={attentionFilter} onValueChange={(v) => { setAttentionFilter(v as "all" | "needed"); setCurrentPage(1); }}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder={tt("analysis.filters.attention")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{tt("analysis.filters.attentionAll")}</SelectItem>
              <SelectItem value="needed">{tt("analysis.filters.attentionNeeded")}</SelectItem>
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
              <SelectItem value="expedia">Expedia</SelectItem>
              <SelectItem value="hotelscom">Hotels.com</SelectItem>
              <SelectItem value="tripcom">Trip.com</SelectItem>
              <SelectItem value="yandex">Yandex Haritalar</SelectItem>
            </SelectContent>
          </Select>
          <Select value={ratingFilter} onValueChange={(v) => { setRatingFilter(v as RatingFilter); setCurrentPage(1); }}>
            <SelectTrigger className="w-[130px]">
              <Star className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Puan" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tüm Puanlar</SelectItem>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="9">9</SelectItem>
              <SelectItem value="8">8</SelectItem>
              <SelectItem value="7">7</SelectItem>
              <SelectItem value="6">6</SelectItem>
              <SelectItem value="5">⭐⭐⭐⭐⭐ (5)</SelectItem>
              <SelectItem value="4">⭐⭐⭐⭐ (4)</SelectItem>
              <SelectItem value="3">⭐⭐⭐ (3)</SelectItem>
              <SelectItem value="2">⭐⭐ (2)</SelectItem>
              <SelectItem value="1">⭐ (1)</SelectItem>
            </SelectContent>
          </Select>
          <Select value={sortOption} onValueChange={(v) => { setSortOption(v as SortOption); setCurrentPage(1); }}>
            <SelectTrigger className="w-[160px]">
              <ArrowUpDown className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Sırala" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">En Yeni</SelectItem>
              <SelectItem value="oldest">En Eski</SelectItem>
              <SelectItem value="rating_high">Puan (Yüksek→Düşük)</SelectItem>
              <SelectItem value="rating_low">Puan (Düşük→Yüksek)</SelectItem>
              <SelectItem value="name_az">İsim (A→Z)</SelectItem>
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
        if (!targetBusiness) return null;
        const hasId = config.getIdFromBusiness(targetBusiness);
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
                <div className="space-y-3">
                  <div className="flex gap-2 items-center">
                    <Input
                      placeholder={config.placeholder}
                      value={platformUrlInput}
                      onChange={(e) => setPlatformUrlInput(e.target.value)}
                      disabled={savingPlatformUrl || isAutoDiscovering}
                      className="flex-1"
                    />
                    <Button 
                      onClick={() => handlePlatformSetup(platformFilter)} 
                      disabled={!platformUrlInput.trim() || savingPlatformUrl || isAutoDiscovering}
                    >
                      {savingPlatformUrl ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Download className="h-4 w-4 mr-2" />}
                      {savingPlatformUrl ? "Çekiliyor..." : "Yorumları Çek"}
                    </Button>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-px flex-1 bg-border" />
                    <span className="text-xs text-muted-foreground">veya</span>
                    <div className="h-px flex-1 bg-border" />
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => handleAutoDiscover(platformFilter)}
                    disabled={isAutoDiscovering || savingPlatformUrl}
                    className="w-full"
                  >
                    {isAutoDiscovering ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Search className="h-4 w-4 mr-2" />}
                    {isAutoDiscovering ? "Aranıyor..." : `${config.label} Profilini Otomatik Bul`}
                  </Button>
                </div>
              ) : (
                <Button
                  onClick={async () => {
                    setIsFetchingBooking(true);
                    try {
                      const result = await invokeApifyFetchStart(platformFilter);
                      if (result?.status === "started") {
                        toast({
                          title: `${config.label} Çekim Başlatıldı`,
                          description: "Yorumlar arka planda çekiliyor. Tamamlandığında bildirileceksiniz.",
                        });
                      } else if (result?.error) {
                        toast({ title: "Hata", description: result.error, variant: "destructive" });
                      } else if (result?.success) {
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
                  disabled={isFetchingBooking || hasPendingRuns}
                >
                  {(isFetchingBooking || hasPendingRuns) ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Download className="h-4 w-4 mr-2" />}
                  {hasPendingRuns ? "Çekiliyor..." : isFetchingBooking ? "Başlatılıyor..." : `${config.label} Yorumlarını Çek`}
                </Button>
              )}
            </div>
          </Card>
        );
      })()}

      {/* Google empty state */}
      {filteredReviews.length === 0 && platformFilter === "google" && targetBusiness?.google_connected && (
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
                if (!targetBusiness) return;
                setIsFetchingBooking(true);
                try {
                  const response = await supabase.functions.invoke('google-business-reviews', {
                    body: { business_id: targetBusiness.id },
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
                {locationFilter !== "active" && <TableHead className="font-semibold">Lokasyon</TableHead>}
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
                <TableHead className="font-semibold min-w-[280px]">Yanıt</TableHead>
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
                      {getRatingScale(review.platform) === 10 ? (
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-primary text-primary" />
                          <span className="text-sm font-semibold text-foreground">
                            {review.rating}
                            <span className="text-muted-foreground font-normal"> / 10</span>
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1">
                          {Array.from({ length: review.rating }).map((_, i) => (
                            <Star key={i} className="h-4 w-4 fill-primary text-primary" />
                          ))}
                        </div>
                      )}
                    </TableCell>
                    {locationFilter !== "active" && (
                      <TableCell>
                        <span className="text-xs font-medium text-muted-foreground truncate max-w-[120px] block">
                          {businessNameMap[review.business_id] || "—"}
                        </span>
                      </TableCell>
                    )}
                    <TableCell>
                      {review.text ? (
                        <p className="text-xs text-muted-foreground line-clamp-2 max-w-[200px]">
                          {review.text}
                        </p>
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
                       <div className="flex flex-col gap-0.5">
                         <span>{format(new Date(review.posted_at), 'd MMM yyyy', { locale: tr })}</span>
                         {review.is_edited && review.edited_at && (
                           <span className="text-[11px] text-amber-600 dark:text-amber-500 flex items-center gap-1">
                             <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-500" />
                             Düzenlendi: {format(new Date(review.edited_at), 'd MMM yyyy', { locale: tr })}
                           </span>
                         )}
                       </div>
                     </TableCell>
                    <TableCell>
                      <Badge variant={statusInfo.variant}>
                        {statusInfo.label}
                      </Badge>
                    </TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      {(review.approved_reply || review.suggested_reply) ? (
                        <div className="flex items-start gap-2">
                          <Popover>
                            <PopoverTrigger asChild>
                              <div className="flex-1 max-w-[200px] cursor-pointer hover:text-foreground transition-colors">
                {review.approved_reply && (
                                  <Badge variant="outline" className="mb-1 text-[10px] px-1.5 py-0 bg-green-50 text-green-700 border-green-200">
                                    {review.reply_source === 'google_api' ? '🌐 Google' : review.suggested_reply ? '✨ AI' : '✏️ Manuel'}
                                  </Badge>
                                )}
                                {!review.approved_reply && review.suggested_reply && (
                                  <Badge variant="outline" className="mb-1 text-[10px] px-1.5 py-0 bg-purple-50 text-purple-700 border-purple-200">AI Öneri</Badge>
                                )}
                                <p className="text-xs text-muted-foreground line-clamp-2">
                                  {review.approved_reply || review.suggested_reply}
                                </p>
                              </div>
                            </PopoverTrigger>
                            <PopoverContent className="w-80 max-h-60 overflow-auto" side="left">
                              {review.approved_reply && (
                                <div className="mb-2">
                                  <Badge variant="outline" className="mb-1 text-xs bg-green-50 text-green-700 border-green-200">
                                    {review.reply_source === 'google_api' ? 'Google\'a Gönderildi' : review.suggested_reply ? 'AI Yanıt (Onaylandı)' : 'Manuel Yanıt'}
                                  </Badge>
                                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{review.approved_reply}</p>
                                </div>
                              )}
                              {review.suggested_reply && review.approved_reply && (
                                <div className="border-t pt-2 mt-2">
                                  <Badge variant="outline" className="mb-1 text-xs">AI Öneri</Badge>
                                  <p className="text-sm leading-relaxed whitespace-pre-wrap text-muted-foreground">{review.suggested_reply}</p>
                                </div>
                              )}
                              {review.suggested_reply && !review.approved_reply && (
                                <p className="text-sm leading-relaxed whitespace-pre-wrap">{review.suggested_reply}</p>
                              )}
                            </PopoverContent>
                          </Popover>
                          <div className="flex gap-1 shrink-0">
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-7 w-7"
                              title="Kopyala"
                              onClick={async () => {
                                await navigator.clipboard.writeText(review.approved_reply || review.suggested_reply!);
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
                            <Select
                              value={getReviewLang(review.id)}
                              onValueChange={(v) => setReviewLang(review.id, v)}
                            >
                              <SelectTrigger className="h-7 w-7 p-0 border-0 bg-transparent shadow-none [&>svg:last-child]:hidden" title="Yanıt dili">
                                <span className="text-sm">{languageOptions.find(l => l.value === getReviewLang(review.id))?.flag}</span>
                              </SelectTrigger>
                              <SelectContent>
                                {languageOptions.map((l) => (
                                  <SelectItem key={l.value} value={l.value}>
                                    {l.flag} {l.label}
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
                          <Select
                            value={getReviewLang(review.id)}
                            onValueChange={(v) => setReviewLang(review.id, v)}
                          >
                            <SelectTrigger className="h-8 w-auto px-2 border rounded bg-background shadow-sm gap-1" title="Yanıt dili">
                              <span className="text-sm">{languageOptions.find(l => l.value === getReviewLang(review.id))?.flag}</span>
                            </SelectTrigger>
                            <SelectContent>
                              {languageOptions.map((l) => (
                                <SelectItem key={l.value} value={l.value}>
                                  {l.flag} {l.label}
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
                {selectedReview.text && <ReviewTranslator text={selectedReview.text} />}
                {selectedReview.is_edited && selectedReview.edited_at && (
                  <div className="mt-3 rounded-md border border-amber-500/30 bg-amber-500/5 p-3">
                    <div className="flex items-center gap-2 text-xs font-medium text-amber-700 dark:text-amber-500 mb-1">
                      <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-500" />
                      Yorumcu bu yorumu düzenledi
                    </div>
                    <p className="text-xs text-muted-foreground">
                      İlk yayın: {format(new Date(selectedReview.posted_at), 'd MMM yyyy', { locale: tr })}
                      {' · '}
                      Son düzenleme: {format(new Date(selectedReview.edited_at), 'd MMM yyyy', { locale: tr })}
                    </p>
                    {selectedReview.previous_text && (
                      <p className="text-xs text-muted-foreground mt-2 italic line-through">
                        Önceki: "{selectedReview.previous_text}"
                      </p>
                    )}
                    {selectedReview.previous_rating != null && selectedReview.previous_rating !== selectedReview.rating && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Önceki puan: {selectedReview.previous_rating} → {selectedReview.rating}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Rating */}
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-2">Puan</h3>
              </div>

              {/* Analysis */}
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-2">{tt("analysis.title")}</h3>
                <ReviewAnalysisPanel
                  reviewId={selectedReview.id}
                  text={selectedReview.text || ""}
                  analysisStatus={selectedReview.analysis_status}
                />
              </div>

              <div>
                {getRatingScale(selectedReview.platform) === 10 ? (
                  <div className="flex items-center gap-2">
                    <Star className="h-5 w-5 fill-primary text-primary" />
                    <span className="text-lg font-semibold text-foreground">
                      {selectedReview.rating}
                      <span className="text-muted-foreground font-normal text-base"> / 10</span>
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1">
                    {Array.from({ length: selectedReview.rating }).map((_, i) => (
                      <Star key={i} className="h-5 w-5 fill-primary text-primary" />
                    ))}
                  </div>
                )}
              </div>

              {/* Existing Reply (from platform / approved) */}
              {selectedReview.approved_reply && (
                <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-semibold text-foreground">Mevcut Yanıt</h3>
                    <Badge variant="outline" className="text-xs">
                      {selectedReview.reply_source === 'platform'
                        ? 'Platform'
                        : selectedReview.reply_source === 'ai'
                        ? 'AI'
                        : selectedReview.reply_source === 'manual'
                        ? 'Manuel'
                        : 'Yanıtlandı'}
                    </Badge>
                  </div>
                  <p className="text-sm leading-relaxed whitespace-pre-wrap text-foreground">
                    {selectedReview.approved_reply}
                  </p>
                  {selectedReview.replied_at && (
                    <p className="text-xs text-muted-foreground mt-2">
                      {format(new Date(selectedReview.replied_at), 'd MMM yyyy', { locale: tr })}
                    </p>
                  )}
                </div>
              )}

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
                  <div className="flex items-center gap-1">
                  <Select value={replyLanguage} onValueChange={setReplyLanguage}>
                    <SelectTrigger className="h-8 w-auto px-2 gap-1" title="Yanıt dili">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {languageOptions.map((l) => (
                        <SelectItem key={l.value} value={l.value}>
                          {l.flag} {l.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
                      handleApprove();
                      const plat = (selectedReview as any).platform;
                      if (plat === 'yandex') {
                        const orgId = (selectedReview as any)?.businesses?.yandex_org_id
                          || (activeBusiness as any)?.yandex_org_id;
                        if (orgId) window.open(`https://yandex.com.tr/maps/org/${orgId}/reviews/`, '_blank');
                      }
                      toast({
                        title: "Panoya Kopyalandı",
                        description: plat === 'yandex'
                          ? "Yandex sayfası açıldı — yanıtı yapıştırıp gönderin."
                          : `Yanıtı ${platformLabels[plat]?.label || 'platform'} paneline yapıştırın.`,
                      });
                    }}
                    disabled={!replyText}
                  >
                    <Copy className="h-4 w-4" />
                    {(selectedReview as any).platform === 'yandex' ? "Yandex'te Yanıtla" : 'Kopyala & Onayla'}
                  </Button>
                )}
              </div>
              {(selectedReview as any).platform === 'yandex' && (
                <p className="text-xs text-muted-foreground -mt-2">
                  Yandex API ile otomatik gönderim desteklenmiyor — cevap kopyalanır, Yandex sayfasında yapıştırıp gönderin.
                </p>
              )}

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
