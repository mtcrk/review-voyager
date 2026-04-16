import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useBusiness } from "@/contexts/BusinessContext";
import { useNewReviews } from "@/contexts/NewReviewsContext";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Inbox as InboxIcon,
  Search,
  Star,
  Building2,
  ChevronDown,
  Filter,
  CheckCircle2,
  MessageSquare,
  Loader2,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { tr } from "date-fns/locale";

const PLATFORM_META: Record<string, { label: string; classes: string }> = {
  google: { label: "Google", classes: "bg-blue-50 text-blue-700 border-blue-200" },
  booking: { label: "Booking.com", classes: "bg-indigo-50 text-indigo-700 border-indigo-200" },
  expedia: { label: "Expedia", classes: "bg-yellow-50 text-yellow-700 border-yellow-200" },
  tripadvisor: { label: "TripAdvisor", classes: "bg-green-50 text-green-700 border-green-200" },
  
  hotelscom: { label: "Hotels.com", classes: "bg-red-50 text-red-700 border-red-200" },
  tripcom: { label: "Trip.com", classes: "bg-orange-50 text-orange-700 border-orange-200" },
};

const PLATFORM_OPTIONS = ["google", "booking", "expedia", "tripadvisor", "hotelscom", "tripcom"];

type StatusTab = "all" | "unanswered" | "negative";

export default function Inbox() {
  const navigate = useNavigate();
  const { businesses, loading: businessLoading } = useBusiness();
  const { markAllRead } = useNewReviews();

  const [selectedBusinessIds, setSelectedBusinessIds] = useState<string[]>([]);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(PLATFORM_OPTIONS);
  const [statusTab, setStatusTab] = useState<StatusTab>("all");
  const [search, setSearch] = useState("");

  // Default: tüm işletmeler seçili
  useEffect(() => {
    if (businesses.length > 0 && selectedBusinessIds.length === 0) {
      setSelectedBusinessIds(businesses.map((b) => b.id));
    }
  }, [businesses, selectedBusinessIds.length]);

  // Mark all as read when entering inbox
  useEffect(() => {
    markAllRead();
  }, [markAllRead]);

  const businessIdSet = useMemo(() => new Set(selectedBusinessIds), [selectedBusinessIds]);
  const businessNameMap = useMemo(() => {
    const m: Record<string, string> = {};
    businesses.forEach((b) => (m[b.id] = b.name));
    return m;
  }, [businesses]);

  const { data: reviews = [], isLoading } = useQuery({
    queryKey: ["inbox-reviews", selectedBusinessIds.join(",")],
    queryFn: async () => {
      if (selectedBusinessIds.length === 0) return [];
      const { data, error } = await supabase
        .from("reviews")
        .select("*")
        .in("business_id", selectedBusinessIds)
        .order("posted_at", { ascending: false })
        .limit(500);
      if (error) throw error;
      return data || [];
    },
    enabled: selectedBusinessIds.length > 0,
  });

  const filtered = useMemo(() => {
    return reviews.filter((r: any) => {
      if (!businessIdSet.has(r.business_id)) return false;
      if (!selectedPlatforms.includes(r.platform || "google")) return false;
      if (statusTab === "unanswered" && (r.approved_reply || r.status === "replied")) return false;
      if (statusTab === "negative" && r.rating > 3) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        const hay = `${r.reviewer_name || ""} ${r.text || ""} ${businessNameMap[r.business_id] || ""}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [reviews, businessIdSet, selectedPlatforms, statusTab, search, businessNameMap]);

  const stats = useMemo(() => {
    const unanswered = reviews.filter((r: any) => !r.approved_reply && r.status !== "replied").length;
    const negative = reviews.filter((r: any) => r.rating <= 3).length;
    return { total: reviews.length, unanswered, negative };
  }, [reviews]);

  const toggleBusiness = (id: string) => {
    setSelectedBusinessIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const togglePlatform = (p: string) => {
    setSelectedPlatforms((prev) => (prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]));
  };

  if (businessLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-xl bg-primary/10 flex items-center justify-center">
              <InboxIcon className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-semibold text-foreground">Tüm Yorumlar</h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                {businesses.length} işletme · {stats.total} yorum · {stats.unanswered} yanıtlanmamış
              </p>
            </div>
          </div>
        </div>

        {/* Filters bar */}
        <Card className="shadow-card">
          <CardContent className="p-4 space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              {/* Business multi-select */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="h-9">
                    <Building2 className="h-4 w-4 mr-2" />
                    {selectedBusinessIds.length === businesses.length
                      ? "Tüm İşletmeler"
                      : `${selectedBusinessIds.length} işletme`}
                    <ChevronDown className="h-4 w-4 ml-2" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-64 max-h-80 overflow-y-auto">
                  <DropdownMenuLabel className="flex items-center justify-between">
                    <span>İşletmeler</span>
                    <button
                      className="text-xs text-primary hover:underline"
                      onClick={() =>
                        setSelectedBusinessIds(
                          selectedBusinessIds.length === businesses.length
                            ? []
                            : businesses.map((b) => b.id)
                        )
                      }
                    >
                      {selectedBusinessIds.length === businesses.length ? "Temizle" : "Tümü"}
                    </button>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {businesses.map((b) => (
                    <DropdownMenuCheckboxItem
                      key={b.id}
                      checked={selectedBusinessIds.includes(b.id)}
                      onCheckedChange={() => toggleBusiness(b.id)}
                      onSelect={(e) => e.preventDefault()}
                    >
                      {b.name}
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Platform multi-select */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="h-9">
                    <Filter className="h-4 w-4 mr-2" />
                    {selectedPlatforms.length === PLATFORM_OPTIONS.length
                      ? "Tüm Platformlar"
                      : `${selectedPlatforms.length} platform`}
                    <ChevronDown className="h-4 w-4 ml-2" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-56">
                  <DropdownMenuLabel className="flex items-center justify-between">
                    <span>Platformlar</span>
                    <button
                      className="text-xs text-primary hover:underline"
                      onClick={() =>
                        setSelectedPlatforms(
                          selectedPlatforms.length === PLATFORM_OPTIONS.length ? [] : PLATFORM_OPTIONS
                        )
                      }
                    >
                      {selectedPlatforms.length === PLATFORM_OPTIONS.length ? "Temizle" : "Tümü"}
                    </button>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {PLATFORM_OPTIONS.map((p) => (
                    <DropdownMenuCheckboxItem
                      key={p}
                      checked={selectedPlatforms.includes(p)}
                      onCheckedChange={() => togglePlatform(p)}
                      onSelect={(e) => e.preventDefault()}
                    >
                      {PLATFORM_META[p].label}
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Search */}
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Yorum, müşteri veya otel ara..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 h-9"
                />
              </div>
            </div>

            {/* Status tabs */}
            <Tabs value={statusTab} onValueChange={(v) => setStatusTab(v as StatusTab)}>
              <TabsList>
                <TabsTrigger value="all">Tümü ({stats.total})</TabsTrigger>
                <TabsTrigger value="unanswered">Yanıtlanmamış ({stats.unanswered})</TabsTrigger>
                <TabsTrigger value="negative">Olumsuz ({stats.negative})</TabsTrigger>
              </TabsList>
            </Tabs>
          </CardContent>
        </Card>

        {/* Reviews list */}
        {isLoading ? (
          <div className="flex items-center justify-center p-16">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filtered.length === 0 ? (
          <Card className="p-12 text-center shadow-card">
            <MessageSquare className="h-12 w-12 text-muted-foreground/40 mx-auto mb-3" />
            <p className="text-muted-foreground">
              {reviews.length === 0
                ? "Henüz yorum yok. Platformlar bağlandıkça buraya akacak."
                : "Bu filtrelerle eşleşen yorum bulunamadı."}
            </p>
          </Card>
        ) : (
          <div className="space-y-2">
            {filtered.map((r: any) => {
              const platform = PLATFORM_META[r.platform || "google"] || PLATFORM_META.google;
              const isAnswered = !!r.approved_reply || r.status === "replied";
              const isNegative = r.rating <= 3;
              return (
                <button
                  key={r.id}
                  onClick={() => navigate(`/reviews/${r.id}`)}
                  className="w-full text-left bg-card border border-border rounded-lg p-4 hover:border-primary/40 hover:shadow-md transition-all"
                >
                  <div className="flex items-start gap-3">
                    {/* Rating column */}
                    <div className="flex flex-col items-center min-w-[44px] pt-0.5">
                      <div className="flex items-center gap-0.5">
                        <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                        <span className="font-semibold text-sm">{r.rating}</span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-1.5 mb-1">
                        <span className="font-medium text-sm text-foreground">
                          {r.reviewer_name || "Anonim"}
                        </span>
                        <span className="text-muted-foreground text-xs">·</span>
                        <Badge variant="outline" className={`${platform.classes} text-xs px-1.5 py-0`}>
                          {platform.label}
                        </Badge>
                        <span className="text-muted-foreground text-xs">·</span>
                        <span className="text-xs text-muted-foreground inline-flex items-center gap-1">
                          <Building2 className="h-3 w-3" />
                          {businessNameMap[r.business_id] || "—"}
                        </span>
                        <span className="text-muted-foreground text-xs">·</span>
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(r.posted_at), { addSuffix: true, locale: tr })}
                        </span>
                      </div>

                      {r.text && (
                        <p className="text-sm text-foreground/80 line-clamp-2">{r.text}</p>
                      )}

                      <div className="flex items-center gap-2 mt-2">
                        {isAnswered ? (
                          <Badge variant="outline" className="text-xs bg-emerald-50 text-emerald-700 border-emerald-200">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Yanıtlandı
                          </Badge>
                        ) : (
                          <Badge variant="outline" className={`text-xs ${isNegative ? "bg-red-50 text-red-700 border-red-200" : "bg-amber-50 text-amber-700 border-amber-200"}`}>
                            {isNegative ? "🔴 Acil yanıtla" : "Yanıt bekliyor"}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
