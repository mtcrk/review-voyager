import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useBusiness } from "@/contexts/BusinessContext";
import { useReviewFetch } from "@/contexts/ReviewFetchContext";
import { toast } from "@/hooks/use-toast";
import { Search, Check, X, ExternalLink, Loader2, Sparkles, Star, Hotel, Map, Building2 } from "lucide-react";

interface PlatformResult {
  platform: string;
  platformLabel: string;
  url: string;
  extractedId: string | null;
  confidence: "high" | "medium" | "low";
  title: string;
  description: string;
}

const platformIcons: Record<string, React.ReactNode> = {
  tripadvisor: <Map className="h-5 w-5 text-green-600" />,
  booking: <Hotel className="h-5 w-5 text-blue-700" />,
  trustpilot: <Star className="h-5 w-5 text-emerald-500" />,
  hotelscom: <Building2 className="h-5 w-5 text-red-600" />,
};

const platformDbField: Record<string, string> = {
  tripadvisor: "tripadvisor_id",
  booking: "booking_hotel_id",
  trustpilot: "trustpilot_url",
  hotelscom: "hotelscom_url",
};

export function PlatformDiscovery() {
  const { activeBusiness, refetchBusinesses } = useBusiness();
  const { startFetch } = useReviewFetch();
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<PlatformResult[]>([]);
  const [searched, setSearched] = useState(false);
  const [confirming, setConfirming] = useState<string | null>(null);
  const [dismissed, setDismissed] = useState<string[]>([]);

  const handleDiscover = async () => {
    if (!activeBusiness) return;
    setLoading(true);
    setResults([]);
    setDismissed([]);

    try {
      const { data, error } = await supabase.functions.invoke("discover-platforms", {
        body: {
          business_name: activeBusiness.name,
          city: activeBusiness.city || undefined,
        },
      });

      if (error) throw error;

      // Filter out platforms already connected
      const connected = {
        tripadvisor: activeBusiness.tripadvisor_id,
        booking: activeBusiness.booking_hotel_id,
        trustpilot: activeBusiness.trustpilot_url,
        hotelscom: activeBusiness.hotelscom_url,
      };

      const filtered = (data.results || []).filter(
        (r: PlatformResult) => !connected[r.platform as keyof typeof connected]
      );

      setResults(filtered);
      setSearched(true);

      if (filtered.length === 0) {
        toast({
          title: "Sonuç bulunamadı",
          description: "Yeni platform profili bulunamadı veya tümü zaten bağlı.",
        });
      }
    } catch (err: any) {
      toast({
        title: "Arama hatası",
        description: err.message || "Platform araması başarısız oldu.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async (result: PlatformResult) => {
    if (!activeBusiness) return;
    setConfirming(result.url);

    try {
      const field = platformDbField[result.platform];
      if (!field) throw new Error("Bilinmeyen platform");

      const valueToStore = result.platform === "tripadvisor"
        ? (result.url ? result.url.split("?")[0].split("#")[0] : result.extractedId)
        : result.extractedId;

      if (!valueToStore) throw new Error("Geçerli platform kimliği bulunamadı");

      const { error } = await supabase
        .from("businesses")
        .update({ [field]: valueToStore })
        .eq("id", activeBusiness.id);

      if (error) throw error;

      await refetchBusinesses();

      toast({
        title: `${result.platformLabel} bağlandı!`,
        description: "İlk senkronizasyon başlatılıyor.",
      });

      // Remove confirmed platform results
      setResults((prev) => prev.filter((r) => r.platform !== result.platform));

      // Trigger initial review fetch in global background poll flow
      try {
        const functionName = result.platform === "tripadvisor"
          ? "tripadvisor-fetch-reviews"
          : "apify-fetch-reviews";

        const fetchResult = await startFetch({
          businessId: activeBusiness.id,
          businessName: activeBusiness.name,
          platform: result.platform,
          functionName,
        });

        if (fetchResult?.status === "started") {
          toast({
            title: "Yorumlar çekiliyor",
            description: `${result.platformLabel} yorumları arka planda çekiliyor...`,
          });
        } else if (fetchResult?.success) {
          toast({
            title: "Yorumlar çekildi",
            description: `${fetchResult.inserted ?? 0} yeni yorum eklendi.`,
          });
        }
      } catch {
        // Non-critical, reviews will be fetched on next cron
      }
    } catch (err: any) {
      toast({
        title: "Hata",
        description: err.message || "Platform bağlanamadı.",
        variant: "destructive",
      });
    } finally {
      setConfirming(null);
    }
  };

  const handleDismiss = (url: string) => {
    setDismissed((prev) => [...prev, url]);
  };

  const visibleResults = results.filter((r) => !dismissed.includes(r.url));

  // Don't show if no active business
  if (!activeBusiness) return null;

  // Check if all platforms already connected
  const allConnected = !!(
    activeBusiness.tripadvisor_id &&
    activeBusiness.booking_hotel_id &&
    activeBusiness.trustpilot_url &&
    activeBusiness.hotelscom_url
  );

  if (allConnected) return null;

  return (
    <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-transparent shadow-card">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          Platform Keşfi
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!searched ? (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              <strong>{activeBusiness.name}</strong> için TripAdvisor, Booking.com, Trustpilot ve Hotels.com profillerini otomatik bulalım.
            </p>
            <Button onClick={handleDiscover} disabled={loading} className="w-full">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Aranıyor...
                </>
              ) : (
                <>
                  <Search className="mr-2 h-4 w-4" />
                  Platformları Keşfet
                </>
              )}
            </Button>
          </div>
        ) : visibleResults.length === 0 ? (
          <div className="text-center py-2">
            <p className="text-sm text-muted-foreground">
              Tüm profiller bağlı veya yeni profil bulunamadı.
            </p>
            <Button variant="ghost" size="sm" onClick={handleDiscover} className="mt-2">
              Tekrar Ara
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {visibleResults.map((result) => (
              <div
                key={result.url}
                className="flex items-start gap-3 p-3 rounded-lg border bg-background"
              >
                <span className="mt-0.5">{platformIcons[result.platform] || <Building2 className="h-5 w-5" />}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm truncate">{result.title}</span>
                    <Badge
                      variant={result.confidence === "high" ? "default" : "secondary"}
                      className="text-[10px] px-1.5 py-0"
                    >
                      {result.confidence === "high" ? "Eşleşme ✓" : result.confidence === "medium" ? "Olası" : "Düşük"}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground truncate">{result.description || result.url}</p>
                  {result.extractedId && (
                    <p className="text-xs text-muted-foreground mt-1">
                      ID: <code className="bg-muted px-1 rounded">{result.extractedId}</code>
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => window.open(result.url, "_blank")}
                    title="Sayfayı aç"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive"
                    onClick={() => handleDismiss(result.url)}
                    title="Reddet"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                  {(result.extractedId || (result.platform === "tripadvisor" && result.url)) && (
                    <Button
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleConfirm(result)}
                      disabled={confirming === result.url}
                      title="Onayla ve bağla"
                    >
                      {confirming === result.url ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Check className="h-4 w-4" />
                      )}
                    </Button>
                  )}
                </div>
              </div>
            ))}
            <Button variant="ghost" size="sm" onClick={handleDiscover} disabled={loading}>
              {loading ? "Aranıyor..." : "Tekrar Ara"}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
