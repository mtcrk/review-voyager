import { jsxs, jsx } from "react/jsx-runtime";
import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { C as Card } from "./card-vx9BCW0t.js";
import { s as supabase, a as useBusiness, G as useReviewFetch, t as toast, B as Button, I as Input, m as Badge, M as Sheet, N as SheetContent, O as SheetHeader, P as SheetTitle, Q as SheetDescription } from "../main.mjs";
import { T as Textarea } from "./textarea-BbAnJDWe.js";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-1zED13tY.js";
import { C as Checkbox } from "./checkbox-JmtvmXQr.js";
import { P as Popover, a as PopoverTrigger, b as PopoverContent } from "./popover-DkUGUX0H.js";
import { Loader2, MapPin, RefreshCw, Download, Search, Filter, Globe, Star, ArrowUpDown, CheckCircle2, Copy, Sparkles, ChevronLeft, ChevronRight, Send } from "lucide-react";
import { T as Table, a as TableHeader, b as TableRow, c as TableHead, d as TableBody, e as TableCell } from "./table-Ni8R8e0b.js";
import { useQueryClient, useQuery, useMutation } from "@tanstack/react-query";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { R as REVIEW_CATEGORIES, m as matchesCategory, a as ReviewCategoryChips } from "./ReviewCategoryChips-DnDaTAgd.js";
import "vite-react-ssg";
import "@radix-ui/react-toast";
import "class-variance-authority";
import "clsx";
import "tailwind-merge";
import "next-themes";
import "sonner";
import "@radix-ui/react-tooltip";
import "react-i18next";
import "@supabase/supabase-js";
import "@radix-ui/react-slot";
import "@radix-ui/react-separator";
import "@radix-ui/react-dialog";
import "@radix-ui/react-alert-dialog";
import "@radix-ui/react-dropdown-menu";
import "@radix-ui/react-collapsible";
import "i18next";
import "i18next-browser-languagedetector";
import "@radix-ui/react-select";
import "@radix-ui/react-checkbox";
import "@radix-ui/react-popover";
const looksTurkish = (s) => {
  if (/[çğıöşüÇĞİÖŞÜ]/.test(s)) return true;
  const turkishWords = /\b(ve|bir|çok|için|ama|değil|var|yok|teşekkür|güzel|kötü|otel|oda|hizmet|personel|kahvaltı)\b/i;
  return turkishWords.test(s);
};
const ReviewTranslator = ({ text }) => {
  const [translated, setTranslated] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  useEffect(() => {
    setTranslated(null);
    setError(false);
    if (!text || looksTurkish(text)) return;
    let cancelled = false;
    setLoading(true);
    (async () => {
      try {
        const { data, error: invokeError } = await supabase.functions.invoke("translate-text", {
          body: { text, target: "tr" }
        });
        if (cancelled) return;
        if (invokeError || !(data == null ? void 0 : data.translated)) {
          setError(true);
        } else {
          setTranslated(data.translated);
        }
      } catch (e) {
        if (!cancelled) setError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [text]);
  if (!text || looksTurkish(text)) return null;
  if (loading) {
    return /* @__PURE__ */ jsxs("div", { className: "mt-2 flex items-center gap-2 text-xs text-muted-foreground", children: [
      /* @__PURE__ */ jsx(Loader2, { className: "h-3 w-3 animate-spin" }),
      "Türkçeye çevriliyor..."
    ] });
  }
  if (error || !translated) return null;
  return /* @__PURE__ */ jsxs("p", { className: "mt-2 text-sm text-foreground/80 leading-relaxed", children: [
    /* @__PURE__ */ jsx("span", { className: "font-medium text-primary", children: "[Çeviri] " }),
    translated
  ] });
};
const TEN_SCALE_PLATFORMS = /* @__PURE__ */ new Set(["booking", "expedia", "hotelscom", "tripcom"]);
const getRatingScale = (platform) => platform && TEN_SCALE_PLATFORMS.has(platform.toLowerCase()) ? 10 : 5;
const toneOptions = [
  { value: "friendly", label: "Samimi", emoji: "😊" },
  { value: "formal", label: "Resmi", emoji: "👔" },
  { value: "playful", label: "Eğlenceli", emoji: "🎉" },
  { value: "empathetic", label: "Empatik", emoji: "🤝" },
  { value: "grateful", label: "Minnettar", emoji: "🙏" },
  { value: "witty", label: "Espritüel", emoji: "😄" },
  { value: "apologetic", label: "Özür Dileyen", emoji: "💐" },
  { value: "enthusiastic", label: "Coşkulu", emoji: "🔥" }
];
const platformLabels = {
  google: { label: "Google", color: "bg-blue-50 text-blue-700 border-blue-200" },
  booking: { label: "Booking.com", color: "bg-indigo-50 text-indigo-700 border-indigo-200" },
  tripadvisor: { label: "TripAdvisor", color: "bg-green-50 text-green-700 border-green-200" },
  expedia: { label: "Expedia", color: "bg-yellow-50 text-yellow-700 border-yellow-200" },
  hotelscom: { label: "Hotels.com", color: "bg-red-50 text-red-700 border-red-200" },
  tripcom: { label: "Trip.com", color: "bg-orange-50 text-orange-700 border-orange-200" }
};
function Reviews() {
  var _a, _b, _c, _d;
  const { activeBusiness, businesses, refetchBusinesses } = useBusiness();
  const { startFetch, hasPendingRuns, setOnFetchComplete } = useReviewFetch();
  const [locationFilter, setLocationFilter] = useState("active");
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const urlPlatform = searchParams.get("platform");
  const [selectedReview, setSelectedReview] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sentimentFilter, setSentimentFilter] = useState("all");
  const [platformFilter, setPlatformFilter] = useState(urlPlatform || "all");
  const [ratingFilter, setRatingFilter] = useState("all");
  const [sortOption, setSortOption] = useState("newest");
  const [categoryFilter, setCategoryFilter] = useState(null);
  useEffect(() => {
    const newPlatform = searchParams.get("platform");
    const newSentiment = searchParams.get("sentiment");
    const newStatus = searchParams.get("status");
    setPlatformFilter(newPlatform || "all");
    if (newSentiment) setSentimentFilter(newSentiment);
    if (newStatus) setStatusFilter(newStatus);
    setCurrentPage(1);
  }, [searchParams]);
  const sortField = sortOption === "name_az" ? "reviewer_name" : (sortOption == null ? void 0 : sortOption.includes("rating")) ? "rating" : "posted_at";
  const sortOrder = sortOption === "oldest" || sortOption === "rating_low" || sortOption === "name_az" ? "asc" : "desc";
  const [isFetchingBooking, setIsFetchingBooking] = useState(false);
  const [isAutoDiscovering, setIsAutoDiscovering] = useState(false);
  const [platformUrlInput, setPlatformUrlInput] = useState("");
  const [savingPlatformUrl, setSavingPlatformUrl] = useState(false);
  const getTargetBusiness = () => {
    if (!activeBusiness) return null;
    if (locationFilter === "active") return activeBusiness;
    if (locationFilter === "all") return null;
    return businesses.find((b) => b.id === locationFilter) || null;
  };
  const handleAutoDiscover = async (platform) => {
    var _a2;
    const targetBusiness2 = getTargetBusiness();
    if (!targetBusiness2) {
      toast({
        title: "Lokasyon seçin",
        description: "Bu işlem için tek bir lokasyon seçmelisiniz.",
        variant: "destructive"
      });
      return;
    }
    setIsAutoDiscovering(true);
    try {
      const { data, error } = await supabase.functions.invoke("discover-platforms", {
        body: { business_name: targetBusiness2.name, city: targetBusiness2.city || "" }
      });
      if (error) throw error;
      const match = (_a2 = data == null ? void 0 : data.results) == null ? void 0 : _a2.find((r) => r.platform === platform && r.confidence === "high");
      if ((match == null ? void 0 : match.url) && (match == null ? void 0 : match.extractedId)) {
        const config = platformSetupConfig[platform];
        if (config) {
          const parsedId = parseUrlId(match.url, platform);
          await supabase.from("reviews").delete().eq("business_id", targetBusiness2.id).eq("platform", platform);
          await supabase.from("businesses").update({ [config.dbField]: parsedId }).eq("id", targetBusiness2.id);
          const result = await invokeApifyFetchWithPolling(platform);
          if (result == null ? void 0 : result.error) {
            toast({ title: "Hata", description: result.error, variant: "destructive" });
          } else if ((result == null ? void 0 : result.status) === "started") {
            toast({
              title: `${config.label} yorumları çekiliyor`,
              description: "İlk senkronizasyon arka planda başladı. Tamamlanınca bildirim göreceksiniz."
            });
            refetchBusinesses();
          } else {
            toast({
              title: `${config.label} Yorumları Çekildi! 🎉`,
              description: `${result.inserted} yeni yorum eklendi.`
            });
            refetch();
            refetchBusinesses();
          }
        }
      } else {
        toast({ title: "Bulunamadı", description: `${platform} profili otomatik bulunamadı. Lütfen URL'yi manuel yapıştırın.`, variant: "destructive" });
      }
    } catch (err) {
      toast({ title: "Hata", description: err.message || "Otomatik arama başarısız.", variant: "destructive" });
    } finally {
      setIsAutoDiscovering(false);
    }
  };
  const platformSetupConfig = {
    booking: {
      label: "Booking.com",
      placeholder: "Booking.com URL'sini yapıştırın",
      hint: "Booking.com'da otelinizin sayfasını açın, URL'yi kopyalayıp buraya yapıştırın. Otomatik olarak doğru kısmı alacağız.",
      dbField: "booking_hotel_id",
      getIdFromBusiness: (b) => b.booking_hotel_id
    },
    tripadvisor: {
      label: "TripAdvisor",
      placeholder: "TripAdvisor URL'sini yapıştırın",
      hint: "TripAdvisor'da otelinizin sayfasını açın, URL'yi kopyalayıp buraya yapıştırın.",
      dbField: "tripadvisor_id",
      getIdFromBusiness: (b) => b.tripadvisor_id
    },
    hotelscom: {
      label: "Hotels.com",
      placeholder: "Hotels.com URL'sini yapıştırın",
      hint: "Hotels.com'da otelinizin sayfasını açın, URL'yi kopyalayıp buraya yapıştırın.",
      dbField: "hotelscom_url",
      getIdFromBusiness: (b) => b.hotelscom_url
    },
    expedia: {
      label: "Expedia",
      placeholder: "Expedia URL'sini yapıştırın (örn. .../h12345.Hotel-Information)",
      hint: "Expedia'da otelinizin sayfasını açın ve tam URL'yi yapıştırın. Bu bağlantıyı tam URL olarak kaydedeceğiz.",
      dbField: "expedia_hotel_id",
      getIdFromBusiness: (b) => b.expedia_hotel_id
    },
    tripcom: {
      label: "Trip.com",
      placeholder: "Trip.com URL'sini veya hotel ID'sini yapıştırın",
      hint: "Trip.com'da otelinizin sayfasını açın, URL'yi kopyalayıp buraya yapıştırın. Hotel ID'yi otomatik çıkaracağız.",
      dbField: "tripcom_hotel_id",
      getIdFromBusiness: (b) => b.tripcom_hotel_id
    }
  };
  const parseUrlId = (input, platform) => {
    const trimmed = input.trim();
    if (platform === "booking") {
      const match = trimmed.match(/hotel\/([a-z]{2})\/([a-z0-9_-]+)/i);
      if (match) return `${match[1]}/${match[2]}`;
    }
    if (platform === "tripadvisor") {
      const urlMatch = trimmed.match(/(https?:\/\/(?:www\.)?tripadvisor\.[a-z.]+\/(?:Hotel|Restaurant|Attraction)_Review[^\s]*)/i);
      if (urlMatch) return urlMatch[1];
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
    return trimmed;
  };
  const invokeApifyFetchStart = async (platform) => {
    const targetBusiness2 = getTargetBusiness();
    if (!targetBusiness2) throw new Error("Bu işlem için tek bir lokasyon seçmelisiniz");
    return startFetch({
      businessId: targetBusiness2.id,
      businessName: targetBusiness2.name,
      platform
    });
  };
  useEffect(() => {
    setOnFetchComplete(() => {
      queryClient.invalidateQueries({ queryKey: ["reviews"] });
    });
    return () => setOnFetchComplete(void 0);
  }, [setOnFetchComplete, queryClient]);
  const invokeApifyFetchWithPolling = async (platform) => {
    return invokeApifyFetchStart(platform);
  };
  const handlePlatformSetup = async (platform) => {
    const config = platformSetupConfig[platform];
    const targetBusiness2 = getTargetBusiness();
    if (!targetBusiness2 || !platformUrlInput.trim() || !config) {
      if (!targetBusiness2) {
        toast({
          title: "Lokasyon seçin",
          description: "Bu işlem için tek bir lokasyon seçmelisiniz.",
          variant: "destructive"
        });
      }
      return;
    }
    setSavingPlatformUrl(true);
    const parsedId = parseUrlId(platformUrlInput, platform);
    try {
      await supabase.from("reviews").delete().eq("business_id", targetBusiness2.id).eq("platform", platform);
      const { error: updateError } = await supabase.from("businesses").update({ [config.dbField]: parsedId }).eq("id", targetBusiness2.id);
      if (updateError) throw updateError;
      const result = await invokeApifyFetchWithPolling(platform);
      if (result == null ? void 0 : result.error) {
        toast({ title: "Hata", description: result.error, variant: "destructive" });
      } else if ((result == null ? void 0 : result.status) === "started") {
        toast({
          title: `${config.label} yorumları çekiliyor`,
          description: "İlk senkronizasyon arka planda başladı. Tamamlanınca bildirim göreceksiniz."
        });
        setPlatformUrlInput("");
        refetchBusinesses();
      } else {
        toast({
          title: "Yorumlar Çekildi! 🎉",
          description: `${result.inserted} yorum eklendi${result.skipped ? `, ${result.skipped} zaten mevcut` : ""}.`
        });
        setPlatformUrlInput("");
        refetch();
        refetchBusinesses();
      }
    } catch (err) {
      toast({ title: "Hata", description: err.message || "Bir sorun oluştu.", variant: "destructive" });
    } finally {
      setSavingPlatformUrl(false);
    }
  };
  const [selectedIds, setSelectedIds] = useState(/* @__PURE__ */ new Set());
  const [isGeneratingReply, setIsGeneratingReply] = useState(false);
  const [generatingIds, setGeneratingIds] = useState(/* @__PURE__ */ new Set());
  const [tonePerId, setTonePerId] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 25;
  const queryBusinessIds = useMemo(() => {
    if (locationFilter === "all") return businesses.map((b) => b.id);
    if (locationFilter === "active") return activeBusiness ? [activeBusiness.id] : [];
    return [locationFilter];
  }, [locationFilter, activeBusiness, businesses]);
  const businessNameMap = useMemo(() => {
    const map = {};
    businesses.forEach((b) => {
      map[b.id] = b.name;
    });
    return map;
  }, [businesses]);
  const { data: reviews = [], isLoading, refetch } = useQuery({
    queryKey: ["reviews", queryBusinessIds],
    queryFn: async () => {
      if (queryBusinessIds.length === 0) return [];
      const pageSize2 = 1e3;
      let from = 0;
      const all = [];
      while (true) {
        const { data, error } = await supabase.from("reviews").select("*").in("business_id", queryBusinessIds).order("posted_at", { ascending: false }).range(from, from + pageSize2 - 1);
        if (error) throw error;
        if (!data || data.length === 0) break;
        all.push(...data);
        if (data.length < pageSize2) break;
        from += pageSize2;
      }
      return all;
    },
    enabled: queryBusinessIds.length > 0
  });
  const filteredReviews = useMemo(() => {
    let result = [...reviews];
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (r) => {
          var _a2, _b2, _c2;
          return ((_a2 = r.reviewer_name) == null ? void 0 : _a2.toLowerCase().includes(query)) || ((_b2 = r.text) == null ? void 0 : _b2.toLowerCase().includes(query)) || ((_c2 = r.summary) == null ? void 0 : _c2.toLowerCase().includes(query));
        }
      );
    }
    if (statusFilter !== "all") {
      result = result.filter((r) => {
        if (statusFilter === "pending") return !r.status || r.status === "pending" || r.status === "pending_reply";
        if (statusFilter === "not_replied") return !r.approved_reply && r.status !== "replied";
        return r.status === statusFilter;
      });
    }
    if (platformFilter !== "all") {
      result = result.filter((r) => r.platform === platformFilter);
    }
    if (sentimentFilter !== "all") {
      result = result.filter((r) => {
        var _a2;
        return ((_a2 = r.sentiment) == null ? void 0 : _a2.toLowerCase()) === sentimentFilter;
      });
    }
    if (ratingFilter !== "all") {
      const targetRating = parseInt(ratingFilter);
      result = result.filter((r) => r.rating === targetRating);
    }
    if (categoryFilter) {
      const cat = REVIEW_CATEGORIES.find((c) => c.key === categoryFilter);
      if (cat) {
        result = result.filter(
          (r) => matchesCategory(`${r.text || ""} ${r.summary || ""}`, cat)
        );
      }
    }
    result.sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case "posted_at":
          {
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
  }, [reviews, searchQuery, statusFilter, sentimentFilter, platformFilter, ratingFilter, categoryFilter, sortField, sortOrder]);
  const totalPages = Math.max(1, Math.ceil(filteredReviews.length / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const paginatedReviews = filteredReviews.slice((safeCurrentPage - 1) * pageSize, safeCurrentPage * pageSize);
  const bulkApproveMutation = useMutation({
    mutationFn: async (ids) => {
      const { error } = await supabase.from("reviews").update({ status: "approved" }).in("id", ids);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reviews"] });
      setSelectedIds(/* @__PURE__ */ new Set());
      toast({
        title: "Toplu Onaylama",
        description: `${selectedIds.size} yorum onaylandı.`
      });
    },
    onError: () => {
      toast({
        title: "Hata",
        description: "Yorumlar onaylanırken hata oluştu.",
        variant: "destructive"
      });
    }
  });
  const approveMutation = useMutation({
    mutationFn: async (reviewId) => {
      const { error } = await supabase.from("reviews").update({ status: "approved" }).eq("id", reviewId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reviews"] });
      toast({
        title: "Yanıt Onaylandı",
        description: "Yanıt onaylandı olarak işaretlendi."
      });
    },
    onError: () => {
      toast({
        title: "Hata",
        description: "Yanıt onaylanırken hata oluştu.",
        variant: "destructive"
      });
    }
  });
  const sendMutation = useMutation({
    mutationFn: async ({ reviewId, reply }) => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");
      const response = await supabase.functions.invoke("approve-reply", {
        body: { reviewId, approvedReply: reply, sendToGoogle: true, userId: session.user.id }
      });
      if (response.error) {
        await navigator.clipboard.writeText(reply);
        throw new Error(response.error.message || "API hatası - yanıt panoya kopyalandı");
      }
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["reviews"] });
      if ((data == null ? void 0 : data.googleStatus) === "sent") {
        toast({
          title: "Başarılı!",
          description: "Yanıt Google'a gönderildi."
        });
      } else {
        toast({
          title: "Yanıt Kaydedildi",
          description: (data == null ? void 0 : data.message) || "Yanıt kaydedildi."
        });
      }
      setSelectedReview(null);
    },
    onError: (error) => {
      queryClient.invalidateQueries({ queryKey: ["reviews"] });
      toast({
        title: "Uyarı",
        description: error.message || "API bağlantısı kurulamadı, yanıt panoya kopyalandı.",
        variant: "destructive"
      });
      setSelectedReview(null);
    }
  });
  const generateReplyMutation = useMutation({
    mutationFn: async (review) => {
      var _a2;
      setIsGeneratingReply(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");
      const response = await supabase.functions.invoke("generate-reply", {
        body: {
          review_text: review.text,
          reviewer_name: review.reviewer_name,
          rating: review.rating,
          sentiment: review.sentiment,
          tone: (activeBusiness == null ? void 0 : activeBusiness.tone) || "Friendly",
          language: (activeBusiness == null ? void 0 : activeBusiness.language) || "TR"
        }
      });
      if (response.error) throw response.error;
      return { reply: ((_a2 = response.data) == null ? void 0 : _a2.reply) || "", reviewId: review.id };
    },
    onSuccess: ({ reply, reviewId }) => {
      setReplyText(reply);
      supabase.from("reviews").update({ suggested_reply: reply }).eq("id", reviewId).then(() => {
        queryClient.invalidateQueries({ queryKey: ["reviews"] });
      });
      toast({ title: "AI Yanıt Oluşturuldu", description: "Yeni bir yanıt önerisi oluşturuldu." });
    },
    onError: () => {
      toast({ title: "Hata", description: "AI yanıt oluşturulamadı.", variant: "destructive" });
    },
    onSettled: () => {
      setIsGeneratingReply(false);
    }
  });
  const getReviewTone = (reviewId) => tonePerId[reviewId] || "friendly";
  const setReviewTone = (reviewId, tone) => {
    setTonePerId((prev) => ({ ...prev, [reviewId]: tone }));
  };
  const inlineGenerateMutation = useMutation({
    mutationFn: async (review) => {
      var _a2;
      setGeneratingIds((prev) => new Set(prev).add(review.id));
      const tone = getReviewTone(review.id);
      const response = await supabase.functions.invoke("generate-reply", {
        body: {
          review_text: review.text,
          reviewer_name: review.reviewer_name,
          rating: review.rating,
          sentiment: review.sentiment,
          tone,
          language: "auto"
        }
      });
      if (response.error) throw response.error;
      return { reply: ((_a2 = response.data) == null ? void 0 : _a2.reply) || "", reviewId: review.id };
    },
    onSuccess: async ({ reply, reviewId }) => {
      await supabase.from("reviews").update({ suggested_reply: reply }).eq("id", reviewId);
      queryClient.invalidateQueries({ queryKey: ["reviews"] });
      toast({ title: "AI Yanıt Hazır ✨", description: "Yanıt oluşturuldu, kopyalayabilirsiniz." });
    },
    onError: () => {
      toast({ title: "Hata", description: "AI yanıt oluşturulamadı.", variant: "destructive" });
    },
    onSettled: (_, __, review) => {
      setGeneratingIds((prev) => {
        const next = new Set(prev);
        next.delete(review.id);
        return next;
      });
    }
  });
  const handleReviewClick = (review) => {
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
  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedIds(new Set(filteredReviews.map((r) => r.id)));
    } else {
      setSelectedIds(/* @__PURE__ */ new Set());
    }
  };
  const handleSelectOne = (id, checked) => {
    const newSet = new Set(selectedIds);
    if (checked) {
      newSet.add(id);
    } else {
      newSet.delete(id);
    }
    setSelectedIds(newSet);
  };
  const toggleSort = (field) => {
    if (field === "posted_at") {
      setSortOption(sortOption === "newest" ? "oldest" : "newest");
    } else if (field === "rating") {
      setSortOption(sortOption === "rating_high" ? "rating_low" : "rating_high");
    } else if (field === "reviewer_name") {
      setSortOption("name_az");
    }
  };
  const getSentimentColor = (sentiment) => {
    switch (sentiment == null ? void 0 : sentiment.toLowerCase()) {
      case "positive":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "negative":
        return "bg-rose-50 text-rose-700 border-rose-200";
      default:
        return "bg-amber-50 text-amber-700 border-amber-200";
    }
  };
  const getStatusBadge = (status) => {
    switch (status) {
      case "replied":
        return { label: "Yanıtlandı", variant: "default" };
      case "approved":
        return { label: "Onaylandı", variant: "secondary" };
      default:
        return { label: "Beklemede", variant: "outline" };
    }
  };
  const pendingCount = reviews.filter((r) => !r.status || r.status === "pending" || r.status === "pending_reply").length;
  const repliedCount = reviews.filter((r) => r.status === "replied").length;
  const targetBusiness = getTargetBusiness();
  if (!activeBusiness) {
    return /* @__PURE__ */ jsx("div", { className: "p-8", children: /* @__PURE__ */ jsx(Card, { className: "p-12 text-center", children: /* @__PURE__ */ jsx("p", { className: "text-muted-foreground", children: "İşletme seçilmedi. Lütfen önce bir işletme ekleyin." }) }) });
  }
  if (isLoading) {
    return /* @__PURE__ */ jsx("div", { className: "flex items-center justify-center min-h-screen", children: /* @__PURE__ */ jsx("div", { className: "animate-spin rounded-full h-8 w-8 border-b-2 border-primary" }) });
  }
  return /* @__PURE__ */ jsxs("div", { className: "p-8 space-y-6", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 mb-2", children: [
          /* @__PURE__ */ jsx("h1", { className: "text-3xl font-semibold text-foreground", children: "Yorumlar" }),
          businesses.length > 1 && /* @__PURE__ */ jsxs(Select, { value: locationFilter, onValueChange: (v) => {
            setLocationFilter(v);
            setCurrentPage(1);
          }, children: [
            /* @__PURE__ */ jsxs(SelectTrigger, { className: "w-[200px] h-9 text-sm", children: [
              /* @__PURE__ */ jsx(MapPin, { className: "h-4 w-4 mr-1.5 text-muted-foreground" }),
              /* @__PURE__ */ jsx(SelectValue, { placeholder: "Lokasyon" })
            ] }),
            /* @__PURE__ */ jsxs(SelectContent, { children: [
              /* @__PURE__ */ jsx(SelectItem, { value: "active", children: (activeBusiness == null ? void 0 : activeBusiness.name) || "Aktif Lokasyon" }),
              /* @__PURE__ */ jsx(SelectItem, { value: "all", children: "Tüm Lokasyonlar" }),
              businesses.filter((b) => b.id !== (activeBusiness == null ? void 0 : activeBusiness.id)).map((b) => /* @__PURE__ */ jsx(SelectItem, { value: b.id, children: b.name }, b.id))
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("p", { className: "text-muted-foreground", children: [
          locationFilter !== "active" && locationFilter !== "all" ? `${businessNameMap[locationFilter] || ""} — ` : locationFilter === "all" ? "Tüm lokasyonlar — " : "",
          reviews.length,
          " yorum • ",
          pendingCount,
          " beklemede • ",
          repliedCount,
          " yanıtlandı"
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
        /* @__PURE__ */ jsxs(Button, { variant: "outline", size: "sm", onClick: () => refetch(), children: [
          /* @__PURE__ */ jsx(RefreshCw, { className: "h-4 w-4 mr-2" }),
          "Yenile"
        ] }),
        (targetBusiness == null ? void 0 : targetBusiness.google_connected) && /* @__PURE__ */ jsxs(
          Button,
          {
            size: "sm",
            onClick: async () => {
              if (!targetBusiness) return;
              setIsFetchingBooking(true);
              try {
                const response = await supabase.functions.invoke("google-business-reviews", {
                  body: { business_id: targetBusiness.id }
                });
                if (response.error) throw new Error(response.error.message);
                const result = response.data;
                if (result == null ? void 0 : result.error) {
                  toast({ title: "Hata", description: result.error, variant: "destructive" });
                } else {
                  toast({
                    title: "Google Yorumları Çekildi",
                    description: `${result.inserted || 0} yeni yorum eklendi, ${result.skipped || 0} zaten mevcut.`
                  });
                  refetch();
                }
              } catch (err) {
                toast({ title: "Hata", description: err.message || "Yorumlar çekilemedi.", variant: "destructive" });
              } finally {
                setIsFetchingBooking(false);
              }
            },
            disabled: isFetchingBooking,
            children: [
              isFetchingBooking ? /* @__PURE__ */ jsx(Loader2, { className: "h-4 w-4 mr-2 animate-spin" }) : /* @__PURE__ */ jsx(Download, { className: "h-4 w-4 mr-2" }),
              isFetchingBooking ? "Çekiliyor..." : "Google Yorumları Çek"
            ]
          }
        ),
        platformFilter !== "all" && platformFilter !== "google" && targetBusiness && ((_a = platformSetupConfig[platformFilter]) == null ? void 0 : _a.getIdFromBusiness(targetBusiness)) && /* @__PURE__ */ jsxs(
          Button,
          {
            size: "sm",
            onClick: async () => {
              var _a2, _b2;
              if (!targetBusiness) return;
              setIsFetchingBooking(true);
              try {
                const result = await invokeApifyFetchStart(platformFilter);
                if ((result == null ? void 0 : result.status) === "started") {
                  toast({
                    title: `${(_a2 = platformLabels[platformFilter]) == null ? void 0 : _a2.label} Çekim Başlatıldı`,
                    description: "Yorumlar arka planda çekiliyor. Tamamlandığında bildirileceksiniz."
                  });
                } else if (result == null ? void 0 : result.error) {
                  toast({ title: "Hata", description: result.error, variant: "destructive" });
                } else if (result == null ? void 0 : result.success) {
                  toast({
                    title: `${(_b2 = platformLabels[platformFilter]) == null ? void 0 : _b2.label} Yorumları Çekildi`,
                    description: `${result.inserted} yeni yorum eklendi, ${result.skipped} zaten mevcut.`
                  });
                  refetch();
                }
              } catch (err) {
                toast({ title: "Hata", description: err.message || "Yorumlar çekilemedi.", variant: "destructive" });
              } finally {
                setIsFetchingBooking(false);
              }
            },
            disabled: isFetchingBooking || hasPendingRuns,
            children: [
              isFetchingBooking || hasPendingRuns ? /* @__PURE__ */ jsx(Loader2, { className: "h-4 w-4 mr-2 animate-spin" }) : /* @__PURE__ */ jsx(Download, { className: "h-4 w-4 mr-2" }),
              hasPendingRuns ? "Çekiliyor..." : isFetchingBooking ? "Başlatılıyor..." : `${(_b = platformLabels[platformFilter]) == null ? void 0 : _b.label} Yorumları Çek`
            ]
          }
        )
      ] })
    ] }),
    reviews.length > 0 && /* @__PURE__ */ jsx(
      ReviewCategoryChips,
      {
        reviews,
        selectedCategory: categoryFilter,
        onSelectCategory: (c) => {
          setCategoryFilter(c);
          setCurrentPage(1);
        }
      }
    ),
    /* @__PURE__ */ jsxs("div", { className: "flex flex-col lg:flex-row gap-4", children: [
      /* @__PURE__ */ jsxs("div", { className: "relative flex-1", children: [
        /* @__PURE__ */ jsx(Search, { className: "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" }),
        /* @__PURE__ */ jsx(
          Input,
          {
            placeholder: "Yorum veya yorumcu ara...",
            value: searchQuery,
            onChange: (e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            },
            className: "pl-10"
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex gap-2 flex-wrap", children: [
        /* @__PURE__ */ jsxs(Select, { value: statusFilter, onValueChange: (v) => {
          setStatusFilter(v);
          setCurrentPage(1);
        }, children: [
          /* @__PURE__ */ jsxs(SelectTrigger, { className: "w-[140px]", children: [
            /* @__PURE__ */ jsx(Filter, { className: "h-4 w-4 mr-2" }),
            /* @__PURE__ */ jsx(SelectValue, { placeholder: "Durum" })
          ] }),
          /* @__PURE__ */ jsxs(SelectContent, { children: [
            /* @__PURE__ */ jsx(SelectItem, { value: "all", children: "Tüm Durumlar" }),
            /* @__PURE__ */ jsx(SelectItem, { value: "pending", children: "Beklemede" }),
            /* @__PURE__ */ jsx(SelectItem, { value: "not_replied", children: "Yanıtlanmamış" }),
            /* @__PURE__ */ jsx(SelectItem, { value: "replied", children: "Yanıtlanmış" }),
            /* @__PURE__ */ jsx(SelectItem, { value: "approved", children: "Onaylandı" })
          ] })
        ] }),
        /* @__PURE__ */ jsxs(Select, { value: sentimentFilter, onValueChange: (v) => {
          setSentimentFilter(v);
          setCurrentPage(1);
        }, children: [
          /* @__PURE__ */ jsx(SelectTrigger, { className: "w-[140px]", children: /* @__PURE__ */ jsx(SelectValue, { placeholder: "Duygu" }) }),
          /* @__PURE__ */ jsxs(SelectContent, { children: [
            /* @__PURE__ */ jsx(SelectItem, { value: "all", children: "Tüm Duygular" }),
            /* @__PURE__ */ jsx(SelectItem, { value: "positive", children: "Pozitif" }),
            /* @__PURE__ */ jsx(SelectItem, { value: "neutral", children: "Nötr" }),
            /* @__PURE__ */ jsx(SelectItem, { value: "negative", children: "Negatif" })
          ] })
        ] }),
        /* @__PURE__ */ jsxs(Select, { value: platformFilter, onValueChange: (v) => {
          setPlatformFilter(v);
          setCurrentPage(1);
        }, children: [
          /* @__PURE__ */ jsxs(SelectTrigger, { className: "w-[160px]", children: [
            /* @__PURE__ */ jsx(Globe, { className: "h-4 w-4 mr-2" }),
            /* @__PURE__ */ jsx(SelectValue, { placeholder: "Platform" })
          ] }),
          /* @__PURE__ */ jsxs(SelectContent, { children: [
            /* @__PURE__ */ jsx(SelectItem, { value: "all", children: "Tüm Platformlar" }),
            /* @__PURE__ */ jsx(SelectItem, { value: "google", children: "Google" }),
            /* @__PURE__ */ jsx(SelectItem, { value: "booking", children: "Booking.com" }),
            /* @__PURE__ */ jsx(SelectItem, { value: "tripadvisor", children: "TripAdvisor" }),
            /* @__PURE__ */ jsx(SelectItem, { value: "expedia", children: "Expedia" }),
            /* @__PURE__ */ jsx(SelectItem, { value: "hotelscom", children: "Hotels.com" }),
            /* @__PURE__ */ jsx(SelectItem, { value: "tripcom", children: "Trip.com" })
          ] })
        ] }),
        /* @__PURE__ */ jsxs(Select, { value: ratingFilter, onValueChange: (v) => {
          setRatingFilter(v);
          setCurrentPage(1);
        }, children: [
          /* @__PURE__ */ jsxs(SelectTrigger, { className: "w-[130px]", children: [
            /* @__PURE__ */ jsx(Star, { className: "h-4 w-4 mr-2" }),
            /* @__PURE__ */ jsx(SelectValue, { placeholder: "Puan" })
          ] }),
          /* @__PURE__ */ jsxs(SelectContent, { children: [
            /* @__PURE__ */ jsx(SelectItem, { value: "all", children: "Tüm Puanlar" }),
            /* @__PURE__ */ jsx(SelectItem, { value: "10", children: "10" }),
            /* @__PURE__ */ jsx(SelectItem, { value: "9", children: "9" }),
            /* @__PURE__ */ jsx(SelectItem, { value: "8", children: "8" }),
            /* @__PURE__ */ jsx(SelectItem, { value: "7", children: "7" }),
            /* @__PURE__ */ jsx(SelectItem, { value: "6", children: "6" }),
            /* @__PURE__ */ jsx(SelectItem, { value: "5", children: "⭐⭐⭐⭐⭐ (5)" }),
            /* @__PURE__ */ jsx(SelectItem, { value: "4", children: "⭐⭐⭐⭐ (4)" }),
            /* @__PURE__ */ jsx(SelectItem, { value: "3", children: "⭐⭐⭐ (3)" }),
            /* @__PURE__ */ jsx(SelectItem, { value: "2", children: "⭐⭐ (2)" }),
            /* @__PURE__ */ jsx(SelectItem, { value: "1", children: "⭐ (1)" })
          ] })
        ] }),
        /* @__PURE__ */ jsxs(Select, { value: sortOption, onValueChange: (v) => {
          setSortOption(v);
          setCurrentPage(1);
        }, children: [
          /* @__PURE__ */ jsxs(SelectTrigger, { className: "w-[160px]", children: [
            /* @__PURE__ */ jsx(ArrowUpDown, { className: "h-4 w-4 mr-2" }),
            /* @__PURE__ */ jsx(SelectValue, { placeholder: "Sırala" })
          ] }),
          /* @__PURE__ */ jsxs(SelectContent, { children: [
            /* @__PURE__ */ jsx(SelectItem, { value: "newest", children: "En Yeni" }),
            /* @__PURE__ */ jsx(SelectItem, { value: "oldest", children: "En Eski" }),
            /* @__PURE__ */ jsx(SelectItem, { value: "rating_high", children: "Puan (Yüksek→Düşük)" }),
            /* @__PURE__ */ jsx(SelectItem, { value: "rating_low", children: "Puan (Düşük→Yüksek)" }),
            /* @__PURE__ */ jsx(SelectItem, { value: "name_az", children: "İsim (A→Z)" })
          ] })
        ] })
      ] })
    ] }),
    selectedIds.size > 0 && /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4 p-3 bg-primary/5 rounded-lg border border-primary/20", children: [
      /* @__PURE__ */ jsxs("span", { className: "text-sm font-medium", children: [
        selectedIds.size,
        " yorum seçildi"
      ] }),
      /* @__PURE__ */ jsxs(Button, { size: "sm", variant: "outline", onClick: handleBulkApprove, disabled: bulkApproveMutation.isPending, children: [
        /* @__PURE__ */ jsx(CheckCircle2, { className: "h-4 w-4 mr-2" }),
        "Toplu Onayla"
      ] }),
      /* @__PURE__ */ jsx(Button, { size: "sm", variant: "ghost", onClick: () => setSelectedIds(/* @__PURE__ */ new Set()), children: "Seçimi Temizle" })
    ] }),
    platformFilter !== "all" && platformFilter !== "google" && platformSetupConfig[platformFilter] && (() => {
      const config = platformSetupConfig[platformFilter];
      if (!targetBusiness) return null;
      const hasId = config.getIdFromBusiness(targetBusiness);
      const platformReviews = reviews.filter((r) => r.platform === platformFilter);
      if (platformReviews.length > 0 || !config) return null;
      return /* @__PURE__ */ jsx(Card, { className: "border-primary/20 bg-gradient-to-r from-primary/5 to-transparent shadow-card", children: /* @__PURE__ */ jsxs("div", { className: "p-6", children: [
        /* @__PURE__ */ jsx("h3", { className: "text-lg font-semibold text-foreground mb-1", children: hasId ? `${config.label} Bağlı ✅` : `${config.label} Yorumlarını Çekin` }),
        /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground mb-4", children: hasId ? `${config.label} bağlı (${hasId}). Yorumlarınızı çekebilirsiniz.` : config.hint }),
        !hasId ? /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex gap-2 items-center", children: [
            /* @__PURE__ */ jsx(
              Input,
              {
                placeholder: config.placeholder,
                value: platformUrlInput,
                onChange: (e) => setPlatformUrlInput(e.target.value),
                disabled: savingPlatformUrl || isAutoDiscovering,
                className: "flex-1"
              }
            ),
            /* @__PURE__ */ jsxs(
              Button,
              {
                onClick: () => handlePlatformSetup(platformFilter),
                disabled: !platformUrlInput.trim() || savingPlatformUrl || isAutoDiscovering,
                children: [
                  savingPlatformUrl ? /* @__PURE__ */ jsx(Loader2, { className: "h-4 w-4 mr-2 animate-spin" }) : /* @__PURE__ */ jsx(Download, { className: "h-4 w-4 mr-2" }),
                  savingPlatformUrl ? "Çekiliyor..." : "Yorumları Çek"
                ]
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsx("div", { className: "h-px flex-1 bg-border" }),
            /* @__PURE__ */ jsx("span", { className: "text-xs text-muted-foreground", children: "veya" }),
            /* @__PURE__ */ jsx("div", { className: "h-px flex-1 bg-border" })
          ] }),
          /* @__PURE__ */ jsxs(
            Button,
            {
              variant: "outline",
              onClick: () => handleAutoDiscover(platformFilter),
              disabled: isAutoDiscovering || savingPlatformUrl,
              className: "w-full",
              children: [
                isAutoDiscovering ? /* @__PURE__ */ jsx(Loader2, { className: "h-4 w-4 mr-2 animate-spin" }) : /* @__PURE__ */ jsx(Search, { className: "h-4 w-4 mr-2" }),
                isAutoDiscovering ? "Aranıyor..." : `${config.label} Profilini Otomatik Bul`
              ]
            }
          )
        ] }) : /* @__PURE__ */ jsxs(
          Button,
          {
            onClick: async () => {
              setIsFetchingBooking(true);
              try {
                const result = await invokeApifyFetchStart(platformFilter);
                if ((result == null ? void 0 : result.status) === "started") {
                  toast({
                    title: `${config.label} Çekim Başlatıldı`,
                    description: "Yorumlar arka planda çekiliyor. Tamamlandığında bildirileceksiniz."
                  });
                } else if (result == null ? void 0 : result.error) {
                  toast({ title: "Hata", description: result.error, variant: "destructive" });
                } else if (result == null ? void 0 : result.success) {
                  toast({
                    title: `${config.label} Yorumları Çekildi! 🎉`,
                    description: `${result.inserted} yorum eklendi.`
                  });
                  refetch();
                }
              } catch (err) {
                toast({ title: "Hata", description: err.message, variant: "destructive" });
              } finally {
                setIsFetchingBooking(false);
              }
            },
            disabled: isFetchingBooking || hasPendingRuns,
            children: [
              isFetchingBooking || hasPendingRuns ? /* @__PURE__ */ jsx(Loader2, { className: "h-4 w-4 mr-2 animate-spin" }) : /* @__PURE__ */ jsx(Download, { className: "h-4 w-4 mr-2" }),
              hasPendingRuns ? "Çekiliyor..." : isFetchingBooking ? "Başlatılıyor..." : `${config.label} Yorumlarını Çek`
            ]
          }
        )
      ] }) });
    })(),
    filteredReviews.length === 0 && platformFilter === "google" && (targetBusiness == null ? void 0 : targetBusiness.google_connected) && /* @__PURE__ */ jsx(Card, { className: "p-8 shadow-card border-dashed border-2 border-primary/30 bg-primary/5", children: /* @__PURE__ */ jsxs("div", { className: "max-w-lg mx-auto text-center space-y-4", children: [
      /* @__PURE__ */ jsx("div", { className: "w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto", children: /* @__PURE__ */ jsx(Download, { className: "h-6 w-6 text-primary" }) }),
      /* @__PURE__ */ jsx("h3", { className: "text-lg font-semibold text-foreground", children: "Google Yorumlarınızı Çekin" }),
      /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: "Google Business hesabınız bağlı. Yorumlarınızı API üzerinden otomatik çekebilirsiniz." }),
      /* @__PURE__ */ jsxs(
        Button,
        {
          onClick: async () => {
            if (!targetBusiness) return;
            setIsFetchingBooking(true);
            try {
              const response = await supabase.functions.invoke("google-business-reviews", {
                body: { business_id: targetBusiness.id }
              });
              if (response.error) throw new Error(response.error.message);
              const result = response.data;
              if (result == null ? void 0 : result.error) {
                toast({ title: "Hata", description: result.error, variant: "destructive" });
              } else {
                toast({
                  title: "Google Yorumları Çekildi! 🎉",
                  description: `${result.inserted || 0} yorum eklendi.`
                });
                refetch();
              }
            } catch (err) {
              toast({ title: "Hata", description: err.message || "Yorumlar çekilemedi.", variant: "destructive" });
            } finally {
              setIsFetchingBooking(false);
            }
          },
          disabled: isFetchingBooking,
          children: [
            isFetchingBooking && /* @__PURE__ */ jsx(Loader2, { className: "h-4 w-4 mr-2 animate-spin" }),
            isFetchingBooking ? "Çekiliyor..." : "Google Yorumlarını Çek"
          ]
        }
      )
    ] }) }),
    filteredReviews.length === 0 && reviews.length > 0 ? /* @__PURE__ */ jsxs(Card, { className: "p-12 text-center shadow-card", children: [
      /* @__PURE__ */ jsx("p", { className: "text-muted-foreground text-lg", children: "Arama kriterlerine uygun yorum bulunamadı." }),
      /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground mt-2", children: "Filtreleri değiştirmeyi deneyin." })
    ] }) : filteredReviews.length > 0 ? /* @__PURE__ */ jsxs(Card, { className: "shadow-card", children: [
      /* @__PURE__ */ jsxs(Table, { children: [
        /* @__PURE__ */ jsx(TableHeader, { children: /* @__PURE__ */ jsxs(TableRow, { className: "hover:bg-transparent", children: [
          /* @__PURE__ */ jsx(TableHead, { className: "w-12", children: /* @__PURE__ */ jsx(
            Checkbox,
            {
              checked: selectedIds.size === filteredReviews.length && filteredReviews.length > 0,
              onCheckedChange: handleSelectAll
            }
          ) }),
          /* @__PURE__ */ jsx(TableHead, { className: "font-semibold", children: /* @__PURE__ */ jsxs(
            "button",
            {
              onClick: () => toggleSort("reviewer_name"),
              className: "flex items-center gap-1 hover:text-foreground",
              children: [
                "Yorumcu",
                sortField === "reviewer_name" && /* @__PURE__ */ jsx(ArrowUpDown, { className: "h-3 w-3" })
              ]
            }
          ) }),
          /* @__PURE__ */ jsx(TableHead, { className: "font-semibold", children: /* @__PURE__ */ jsxs(
            "button",
            {
              onClick: () => toggleSort("rating"),
              className: "flex items-center gap-1 hover:text-foreground",
              children: [
                "Puan",
                sortField === "rating" && /* @__PURE__ */ jsx(ArrowUpDown, { className: "h-3 w-3" })
              ]
            }
          ) }),
          locationFilter !== "active" && /* @__PURE__ */ jsx(TableHead, { className: "font-semibold", children: "Lokasyon" }),
          /* @__PURE__ */ jsx(TableHead, { className: "font-semibold min-w-[200px]", children: "Yorum" }),
          /* @__PURE__ */ jsx(TableHead, { className: "font-semibold", children: "Platform" }),
          /* @__PURE__ */ jsx(TableHead, { className: "font-semibold", children: "Duygu" }),
          /* @__PURE__ */ jsx(TableHead, { className: "font-semibold", children: /* @__PURE__ */ jsxs(
            "button",
            {
              onClick: () => toggleSort("posted_at"),
              className: "flex items-center gap-1 hover:text-foreground",
              children: [
                "Tarih",
                sortField === "posted_at" && /* @__PURE__ */ jsx(ArrowUpDown, { className: "h-3 w-3" })
              ]
            }
          ) }),
          /* @__PURE__ */ jsx(TableHead, { className: "font-semibold", children: "Durum" }),
          /* @__PURE__ */ jsx(TableHead, { className: "font-semibold min-w-[280px]", children: "Yanıt" })
        ] }) }),
        /* @__PURE__ */ jsx(TableBody, { children: paginatedReviews.map((review) => {
          var _a2, _b2;
          const statusInfo = getStatusBadge(review.status);
          return /* @__PURE__ */ jsxs(
            TableRow,
            {
              className: "cursor-pointer transition-smooth hover:bg-muted/30",
              onClick: () => handleReviewClick(review),
              children: [
                /* @__PURE__ */ jsx(TableCell, { onClick: (e) => e.stopPropagation(), children: /* @__PURE__ */ jsx(
                  Checkbox,
                  {
                    checked: selectedIds.has(review.id),
                    onCheckedChange: (checked) => handleSelectOne(review.id, !!checked)
                  }
                ) }),
                /* @__PURE__ */ jsx(TableCell, { className: "font-medium", children: review.reviewer_name }),
                /* @__PURE__ */ jsx(TableCell, { children: getRatingScale(review.platform) === 10 ? /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1", children: [
                  /* @__PURE__ */ jsx(Star, { className: "h-4 w-4 fill-primary text-primary" }),
                  /* @__PURE__ */ jsxs("span", { className: "text-sm font-semibold text-foreground", children: [
                    review.rating,
                    /* @__PURE__ */ jsx("span", { className: "text-muted-foreground font-normal", children: " / 10" })
                  ] })
                ] }) : /* @__PURE__ */ jsx("div", { className: "flex items-center gap-1", children: Array.from({ length: review.rating }).map((_, i) => /* @__PURE__ */ jsx(Star, { className: "h-4 w-4 fill-primary text-primary" }, i)) }) }),
                locationFilter !== "active" && /* @__PURE__ */ jsx(TableCell, { children: /* @__PURE__ */ jsx("span", { className: "text-xs font-medium text-muted-foreground truncate max-w-[120px] block", children: businessNameMap[review.business_id] || "—" }) }),
                /* @__PURE__ */ jsx(TableCell, { children: review.text ? /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground line-clamp-2 max-w-[200px]", children: review.text }) : /* @__PURE__ */ jsx("span", { className: "text-xs text-muted-foreground italic", children: "Metin yok" }) }),
                /* @__PURE__ */ jsx(TableCell, { children: (() => {
                  const p = platformLabels[review.platform || "google"] || platformLabels.google;
                  return /* @__PURE__ */ jsx(Badge, { className: p.color, variant: "outline", children: p.label });
                })() }),
                /* @__PURE__ */ jsx(TableCell, { children: review.sentiment && /* @__PURE__ */ jsx(Badge, { className: getSentimentColor(review.sentiment), variant: "outline", children: review.sentiment }) }),
                /* @__PURE__ */ jsx(TableCell, { className: "text-muted-foreground", children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-0.5", children: [
                  /* @__PURE__ */ jsx("span", { children: format(new Date(review.posted_at), "d MMM yyyy", { locale: tr }) }),
                  review.is_edited && review.edited_at && /* @__PURE__ */ jsxs("span", { className: "text-[11px] text-amber-600 dark:text-amber-500 flex items-center gap-1", children: [
                    /* @__PURE__ */ jsx("span", { className: "inline-block w-1.5 h-1.5 rounded-full bg-amber-500" }),
                    "Düzenlendi: ",
                    format(new Date(review.edited_at), "d MMM yyyy", { locale: tr })
                  ] })
                ] }) }),
                /* @__PURE__ */ jsx(TableCell, { children: /* @__PURE__ */ jsx(Badge, { variant: statusInfo.variant, children: statusInfo.label }) }),
                /* @__PURE__ */ jsx(TableCell, { onClick: (e) => e.stopPropagation(), children: review.approved_reply || review.suggested_reply ? /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-2", children: [
                  /* @__PURE__ */ jsxs(Popover, { children: [
                    /* @__PURE__ */ jsx(PopoverTrigger, { asChild: true, children: /* @__PURE__ */ jsxs("div", { className: "flex-1 max-w-[200px] cursor-pointer hover:text-foreground transition-colors", children: [
                      review.approved_reply && /* @__PURE__ */ jsx(Badge, { variant: "outline", className: "mb-1 text-[10px] px-1.5 py-0 bg-green-50 text-green-700 border-green-200", children: review.reply_source === "google_api" ? "🌐 Google" : review.suggested_reply ? "✨ AI" : "✏️ Manuel" }),
                      !review.approved_reply && review.suggested_reply && /* @__PURE__ */ jsx(Badge, { variant: "outline", className: "mb-1 text-[10px] px-1.5 py-0 bg-purple-50 text-purple-700 border-purple-200", children: "AI Öneri" }),
                      /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground line-clamp-2", children: review.approved_reply || review.suggested_reply })
                    ] }) }),
                    /* @__PURE__ */ jsxs(PopoverContent, { className: "w-80 max-h-60 overflow-auto", side: "left", children: [
                      review.approved_reply && /* @__PURE__ */ jsxs("div", { className: "mb-2", children: [
                        /* @__PURE__ */ jsx(Badge, { variant: "outline", className: "mb-1 text-xs bg-green-50 text-green-700 border-green-200", children: review.reply_source === "google_api" ? "Google'a Gönderildi" : review.suggested_reply ? "AI Yanıt (Onaylandı)" : "Manuel Yanıt" }),
                        /* @__PURE__ */ jsx("p", { className: "text-sm leading-relaxed whitespace-pre-wrap", children: review.approved_reply })
                      ] }),
                      review.suggested_reply && review.approved_reply && /* @__PURE__ */ jsxs("div", { className: "border-t pt-2 mt-2", children: [
                        /* @__PURE__ */ jsx(Badge, { variant: "outline", className: "mb-1 text-xs", children: "AI Öneri" }),
                        /* @__PURE__ */ jsx("p", { className: "text-sm leading-relaxed whitespace-pre-wrap text-muted-foreground", children: review.suggested_reply })
                      ] }),
                      review.suggested_reply && !review.approved_reply && /* @__PURE__ */ jsx("p", { className: "text-sm leading-relaxed whitespace-pre-wrap", children: review.suggested_reply })
                    ] })
                  ] }),
                  /* @__PURE__ */ jsxs("div", { className: "flex gap-1 shrink-0", children: [
                    /* @__PURE__ */ jsx(
                      Button,
                      {
                        size: "icon",
                        variant: "ghost",
                        className: "h-7 w-7",
                        title: "Kopyala",
                        onClick: async () => {
                          await navigator.clipboard.writeText(review.approved_reply || review.suggested_reply);
                          toast({ title: "Kopyalandı ✓", description: "Yanıt panoya kopyalandı." });
                        },
                        children: /* @__PURE__ */ jsx(Copy, { className: "h-3.5 w-3.5" })
                      }
                    ),
                    /* @__PURE__ */ jsxs(
                      Select,
                      {
                        value: getReviewTone(review.id),
                        onValueChange: (v) => setReviewTone(review.id, v),
                        children: [
                          /* @__PURE__ */ jsx(SelectTrigger, { className: "h-7 w-7 p-0 border-0 bg-transparent shadow-none [&>svg:last-child]:hidden", title: "Ton seç", children: /* @__PURE__ */ jsx("span", { className: "text-sm", children: (_a2 = toneOptions.find((t) => t.value === getReviewTone(review.id))) == null ? void 0 : _a2.emoji }) }),
                          /* @__PURE__ */ jsx(SelectContent, { children: toneOptions.map((t) => /* @__PURE__ */ jsxs(SelectItem, { value: t.value, children: [
                            t.emoji,
                            " ",
                            t.label
                          ] }, t.value)) })
                        ]
                      }
                    ),
                    /* @__PURE__ */ jsx(
                      Button,
                      {
                        size: "icon",
                        variant: "ghost",
                        className: "h-7 w-7",
                        title: "Yeniden üret",
                        disabled: generatingIds.has(review.id),
                        onClick: () => inlineGenerateMutation.mutate(review),
                        children: /* @__PURE__ */ jsx(RefreshCw, { className: `h-3.5 w-3.5 ${generatingIds.has(review.id) ? "animate-spin" : ""}` })
                      }
                    )
                  ] })
                ] }) : /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1", children: [
                  /* @__PURE__ */ jsxs(
                    Select,
                    {
                      value: getReviewTone(review.id),
                      onValueChange: (v) => setReviewTone(review.id, v),
                      children: [
                        /* @__PURE__ */ jsxs(SelectTrigger, { className: "h-8 w-auto px-2 border rounded bg-background shadow-sm gap-1", title: "Ton seç", children: [
                          /* @__PURE__ */ jsx("span", { className: "text-sm", children: (_b2 = toneOptions.find((t) => t.value === getReviewTone(review.id))) == null ? void 0 : _b2.emoji }),
                          /* @__PURE__ */ jsx(SelectValue, {})
                        ] }),
                        /* @__PURE__ */ jsx(SelectContent, { children: toneOptions.map((t) => /* @__PURE__ */ jsxs(SelectItem, { value: t.value, children: [
                          t.emoji,
                          " ",
                          t.label
                        ] }, t.value)) })
                      ]
                    }
                  ),
                  /* @__PURE__ */ jsxs(
                    Button,
                    {
                      size: "sm",
                      variant: "outline",
                      className: "text-xs gap-1.5",
                      disabled: generatingIds.has(review.id),
                      onClick: () => inlineGenerateMutation.mutate(review),
                      children: [
                        /* @__PURE__ */ jsx(Sparkles, { className: `h-3.5 w-3.5 ${generatingIds.has(review.id) ? "animate-spin" : ""}` }),
                        generatingIds.has(review.id) ? "Üretiliyor..." : "AI Yanıt Üret"
                      ]
                    }
                  )
                ] }) })
              ]
            },
            review.id
          );
        }) })
      ] }),
      totalPages > 1 && /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between px-4 py-3 border-t", children: [
        /* @__PURE__ */ jsxs("p", { className: "text-sm text-muted-foreground", children: [
          filteredReviews.length,
          " yorumdan ",
          (safeCurrentPage - 1) * pageSize + 1,
          "–",
          Math.min(safeCurrentPage * pageSize, filteredReviews.length),
          " arası gösteriliyor"
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1", children: [
          /* @__PURE__ */ jsx(
            Button,
            {
              variant: "outline",
              size: "sm",
              disabled: safeCurrentPage <= 1,
              onClick: () => setCurrentPage((p) => Math.max(1, p - 1)),
              children: /* @__PURE__ */ jsx(ChevronLeft, { className: "h-4 w-4" })
            }
          ),
          Array.from({ length: totalPages }, (_, i) => i + 1).filter((p) => p === 1 || p === totalPages || Math.abs(p - safeCurrentPage) <= 1).reduce((acc, p, idx, arr) => {
            if (idx > 0 && p - arr[idx - 1] > 1) acc.push("...");
            acc.push(p);
            return acc;
          }, []).map(
            (p, i) => typeof p === "string" ? /* @__PURE__ */ jsx("span", { className: "px-2 text-muted-foreground text-sm", children: "…" }, `ellipsis-${i}`) : /* @__PURE__ */ jsx(
              Button,
              {
                variant: p === safeCurrentPage ? "default" : "outline",
                size: "sm",
                className: "min-w-[36px]",
                onClick: () => setCurrentPage(p),
                children: p
              },
              p
            )
          ),
          /* @__PURE__ */ jsx(
            Button,
            {
              variant: "outline",
              size: "sm",
              disabled: safeCurrentPage >= totalPages,
              onClick: () => setCurrentPage((p) => Math.min(totalPages, p + 1)),
              children: /* @__PURE__ */ jsx(ChevronRight, { className: "h-4 w-4" })
            }
          )
        ] })
      ] })
    ] }) : null,
    /* @__PURE__ */ jsx(Sheet, { open: !!selectedReview, onOpenChange: () => setSelectedReview(null), children: /* @__PURE__ */ jsxs(SheetContent, { className: "w-full sm:max-w-lg overflow-y-auto", children: [
      /* @__PURE__ */ jsxs(SheetHeader, { children: [
        /* @__PURE__ */ jsxs(SheetTitle, { className: "text-2xl flex items-center gap-2", children: [
          "Yorum Detayları",
          selectedReview && /* @__PURE__ */ jsx(Badge, { className: (_c = platformLabels[selectedReview.platform || "google"]) == null ? void 0 : _c.color, variant: "outline", children: (_d = platformLabels[selectedReview.platform || "google"]) == null ? void 0 : _d.label })
        ] }),
        /* @__PURE__ */ jsxs(SheetDescription, { children: [
          "Yorumcu: ",
          selectedReview == null ? void 0 : selectedReview.reviewer_name
        ] })
      ] }),
      selectedReview && /* @__PURE__ */ jsxs("div", { className: "mt-6 space-y-6", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h3", { className: "text-sm font-semibold text-foreground mb-2", children: "Yorum" }),
          /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground leading-relaxed", children: selectedReview.text || "Yorum metni yok" }),
          selectedReview.text && /* @__PURE__ */ jsx(ReviewTranslator, { text: selectedReview.text }),
          selectedReview.is_edited && selectedReview.edited_at && /* @__PURE__ */ jsxs("div", { className: "mt-3 rounded-md border border-amber-500/30 bg-amber-500/5 p-3", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-xs font-medium text-amber-700 dark:text-amber-500 mb-1", children: [
              /* @__PURE__ */ jsx("span", { className: "inline-block w-1.5 h-1.5 rounded-full bg-amber-500" }),
              "Yorumcu bu yorumu düzenledi"
            ] }),
            /* @__PURE__ */ jsxs("p", { className: "text-xs text-muted-foreground", children: [
              "İlk yayın: ",
              format(new Date(selectedReview.posted_at), "d MMM yyyy", { locale: tr }),
              " · ",
              "Son düzenleme: ",
              format(new Date(selectedReview.edited_at), "d MMM yyyy", { locale: tr })
            ] }),
            selectedReview.previous_text && /* @__PURE__ */ jsxs("p", { className: "text-xs text-muted-foreground mt-2 italic line-through", children: [
              'Önceki: "',
              selectedReview.previous_text,
              '"'
            ] }),
            selectedReview.previous_rating != null && selectedReview.previous_rating !== selectedReview.rating && /* @__PURE__ */ jsxs("p", { className: "text-xs text-muted-foreground mt-1", children: [
              "Önceki puan: ",
              selectedReview.previous_rating,
              " → ",
              selectedReview.rating
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h3", { className: "text-sm font-semibold text-foreground mb-2", children: "Puan" }),
          getRatingScale(selectedReview.platform) === 10 ? /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsx(Star, { className: "h-5 w-5 fill-primary text-primary" }),
            /* @__PURE__ */ jsxs("span", { className: "text-lg font-semibold text-foreground", children: [
              selectedReview.rating,
              /* @__PURE__ */ jsx("span", { className: "text-muted-foreground font-normal text-base", children: " / 10" })
            ] })
          ] }) : /* @__PURE__ */ jsx("div", { className: "flex items-center gap-1", children: Array.from({ length: selectedReview.rating }).map((_, i) => /* @__PURE__ */ jsx(Star, { className: "h-5 w-5 fill-primary text-primary" }, i)) })
        ] }),
        selectedReview.approved_reply && /* @__PURE__ */ jsxs("div", { className: "rounded-lg border border-primary/20 bg-primary/5 p-4", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-2", children: [
            /* @__PURE__ */ jsx("h3", { className: "text-sm font-semibold text-foreground", children: "Mevcut Yanıt" }),
            /* @__PURE__ */ jsx(Badge, { variant: "outline", className: "text-xs", children: selectedReview.reply_source === "platform" ? "Platform" : selectedReview.reply_source === "ai" ? "AI" : selectedReview.reply_source === "manual" ? "Manuel" : "Yanıtlandı" })
          ] }),
          /* @__PURE__ */ jsx("p", { className: "text-sm leading-relaxed whitespace-pre-wrap text-foreground", children: selectedReview.approved_reply }),
          selectedReview.replied_at && /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground mt-2", children: format(new Date(selectedReview.replied_at), "d MMM yyyy", { locale: tr }) })
        ] }),
        selectedReview.summary && /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h3", { className: "text-sm font-semibold text-foreground mb-2", children: "Özet" }),
          /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: selectedReview.summary })
        ] }),
        selectedReview.praises && Array.isArray(selectedReview.praises) && selectedReview.praises.length > 0 && /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h3", { className: "text-sm font-semibold text-foreground mb-2", children: "Övgüler" }),
          /* @__PURE__ */ jsx("div", { className: "flex flex-wrap gap-2", children: selectedReview.praises.map((praise, i) => /* @__PURE__ */ jsx(Badge, { variant: "secondary", className: "bg-emerald-50 text-emerald-700", children: praise }, i)) })
        ] }),
        selectedReview.issues && Array.isArray(selectedReview.issues) && selectedReview.issues.length > 0 && /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h3", { className: "text-sm font-semibold text-foreground mb-2", children: "Sorunlar" }),
          /* @__PURE__ */ jsx("div", { className: "flex flex-wrap gap-2", children: selectedReview.issues.map((issue, i) => /* @__PURE__ */ jsx(Badge, { variant: "secondary", className: "bg-rose-50 text-rose-700", children: issue }, i)) })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-3", children: [
            /* @__PURE__ */ jsx("h3", { className: "text-sm font-semibold text-foreground", children: "AI Önerilen Yanıt" }),
            /* @__PURE__ */ jsxs(
              Button,
              {
                size: "sm",
                variant: "ghost",
                onClick: () => generateReplyMutation.mutate(selectedReview),
                disabled: isGeneratingReply,
                children: [
                  /* @__PURE__ */ jsx(Sparkles, { className: `h-4 w-4 mr-1 ${isGeneratingReply ? "animate-spin" : ""}` }),
                  isGeneratingReply ? "Oluşturuluyor..." : "Yeniden Oluştur"
                ]
              }
            )
          ] }),
          /* @__PURE__ */ jsx(
            Textarea,
            {
              value: replyText,
              onChange: (e) => setReplyText(e.target.value),
              className: "min-h-[120px] resize-none",
              placeholder: "Önerilen yanıtı düzenleyin..."
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex gap-3", children: [
          /* @__PURE__ */ jsxs(
            Button,
            {
              variant: "outline",
              className: "flex-1 gap-2",
              onClick: handleApprove,
              disabled: approveMutation.isPending || selectedReview.status === "approved" || selectedReview.status === "replied",
              children: [
                /* @__PURE__ */ jsx(CheckCircle2, { className: "h-4 w-4" }),
                selectedReview.status === "approved" || selectedReview.status === "replied" ? "Onaylandı" : "Yanıtı Onayla"
              ]
            }
          ),
          selectedReview.platform === "google" || !selectedReview.platform ? /* @__PURE__ */ jsxs(
            Button,
            {
              className: "flex-1 gap-2",
              onClick: handleSendToGoogle,
              disabled: sendMutation.isPending || !replyText,
              children: [
                /* @__PURE__ */ jsx(Send, { className: "h-4 w-4" }),
                "Google'a Gönder"
              ]
            }
          ) : /* @__PURE__ */ jsxs(
            Button,
            {
              className: "flex-1 gap-2",
              onClick: async () => {
                var _a2;
                await navigator.clipboard.writeText(replyText);
                handleApprove();
                toast({
                  title: "Panoya Kopyalandı",
                  description: `Yanıtı ${((_a2 = platformLabels[selectedReview.platform]) == null ? void 0 : _a2.label) || "platform"} paneline yapıştırın.`
                });
              },
              disabled: !replyText,
              children: [
                /* @__PURE__ */ jsx(Copy, { className: "h-4 w-4" }),
                "Kopyala & Onayla"
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsxs(
          Button,
          {
            variant: "ghost",
            className: "w-full",
            onClick: async () => {
              await navigator.clipboard.writeText(replyText);
              toast({
                title: "Kopyalandı",
                description: "Yanıt panoya kopyalandı."
              });
            },
            disabled: !replyText,
            children: [
              /* @__PURE__ */ jsx(Copy, { className: "h-4 w-4 mr-2" }),
              "Panoya Kopyala"
            ]
          }
        ),
        /* @__PURE__ */ jsx("div", { className: "pt-4 border-t border-border", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsx("span", { className: "text-sm text-muted-foreground", children: "Durum:" }),
          /* @__PURE__ */ jsx(Badge, { variant: getStatusBadge(selectedReview.status).variant, children: getStatusBadge(selectedReview.status).label })
        ] }) })
      ] })
    ] }) })
  ] });
}
export {
  Reviews as default
};
