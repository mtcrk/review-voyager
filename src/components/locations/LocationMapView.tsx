import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Star, Loader2, RefreshCw } from "lucide-react";
import { LocationMetrics } from "@/hooks/useMultiLocationData";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Props {
  locations: LocationMetrics[];
  onRefresh?: () => void;
}

export function LocationMapView({ locations, onRefresh }: Props) {
  const [syncing, setSyncing] = useState(false);
  const locationsWithCoords = locations.filter((l) => l.lat && l.lng);

  const handleSyncLocations = async () => {
    setSyncing(true);
    try {
      const googleLocations = locations.filter((l) => l.id);
      if (!googleLocations.length) {
        toast.error("Google bağlantılı işletme bulunamadı");
        return;
      }

      const results = await Promise.allSettled(
        googleLocations.map((l) =>
          supabase.functions.invoke("google-business-info", {
            body: { business_id: l.id },
          })
        )
      );

      const successCount = results.filter((r) => r.status === "fulfilled").length;
      toast.success(`${successCount} işletmenin bilgileri güncellendi`);
      onRefresh?.();
    } catch (error) {
      console.error("Sync error:", error);
      toast.error("Bilgiler güncellenirken hata oluştu");
    } finally {
      setSyncing(false);
    }
  };

  if (locationsWithCoords.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <MapPin className="h-4 w-4 text-primary" />
            Harita Görünümü
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
              <MapPin className="h-8 w-8 text-muted-foreground/50" />
            </div>
            <p className="text-sm text-muted-foreground max-w-xs mb-4">
              Lokasyon koordinatları henüz yok. Google Business'tan otomatik çekebilirsiniz.
            </p>
            <Button
              onClick={handleSyncLocations}
              disabled={syncing}
              variant="outline"
              className="gap-2"
            >
              {syncing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              {syncing ? "Çekiliyor..." : "Google'dan Koordinatları Çek"}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Build a static Google Maps embed with markers
  const center = {
    lat: locationsWithCoords.reduce((s, l) => s + l.lat!, 0) / locationsWithCoords.length,
    lng: locationsWithCoords.reduce((s, l) => s + l.lng!, 0) / locationsWithCoords.length,
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <MapPin className="h-4 w-4 text-primary" />
          Harita Görünümü
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Card-based visual map alternative */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {locationsWithCoords.map((loc) => (
            <div
              key={loc.id}
              className="flex items-start gap-3 p-3 rounded-xl border border-border/60 bg-muted/20 hover:bg-muted/40 transition-colors"
            >
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <MapPin className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground text-sm truncate">{loc.name}</p>
                <p className="text-xs text-muted-foreground">{loc.city || "Konum belirtilmedi"}</p>
                <div className="flex items-center gap-2 mt-1">
                  <Star className="h-3 w-3 text-amber-400 fill-amber-400" />
                  <span className="text-xs font-semibold text-foreground">{loc.averageRating}</span>
                  <span className="text-xs text-muted-foreground">· {loc.totalReviews} yorum</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
