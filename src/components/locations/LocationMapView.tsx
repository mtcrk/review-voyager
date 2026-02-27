import { useEffect, useState } from "react";
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
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(null);

  const locationsWithCoords = locations.filter((l) => l.lat && l.lng);

  // No auto-select — show all locations by default

  const selectedLocation =
    locationsWithCoords.find((l) => l.id === selectedLocationId) || locationsWithCoords[0];

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
            <Button onClick={handleSyncLocations} disabled={syncing} variant="outline" className="gap-2">
              {syncing ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
              {syncing ? "Çekiliyor..." : "Google'dan Koordinatları Çek"}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Build map URL showing all locations or selected one
  const allMarkersUrl = locationsWithCoords.length === 1
    ? `https://maps.google.com/maps?q=${locationsWithCoords[0].lat},${locationsWithCoords[0].lng}&z=14&output=embed`
    : selectedLocationId
      ? `https://maps.google.com/maps?q=${selectedLocation.lat},${selectedLocation.lng}&z=14&output=embed`
      : `https://maps.google.com/maps?q=${locationsWithCoords.map(l => `${l.lat},${l.lng}`).join('|')}&z=6&output=embed`;

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <MapPin className="h-4 w-4 text-primary" />
            Harita Görünümü
          </CardTitle>
          {selectedLocationId && locationsWithCoords.length > 1 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedLocationId(null)}
              className="text-xs text-muted-foreground"
            >
              Tümünü Göster
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="h-72 rounded-xl border border-border/60 overflow-hidden bg-muted/20">
          <iframe
            title="Lokasyon harita görünümü"
            src={allMarkersUrl}
            className="w-full h-full"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {locationsWithCoords.map((loc) => {
            const isActive = selectedLocation.id === loc.id;
            return (
              <button
                key={loc.id}
                type="button"
                onClick={() => setSelectedLocationId(loc.id)}
                className={`flex items-start gap-3 p-3 rounded-xl border transition-colors text-left ${
                  isActive
                    ? "border-primary/40 bg-primary/10"
                    : "border-border/60 bg-muted/20 hover:bg-muted/40"
                }`}
              >
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <MapPin className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground text-sm truncate">{loc.name}</p>
                  <p className="text-xs text-muted-foreground">{loc.city || "Konum belirtilmedi"}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Star className="h-3 w-3 text-primary fill-primary" />
                    <span className="text-xs font-semibold text-foreground">{loc.averageRating}</span>
                    <span className="text-xs text-muted-foreground">· {loc.totalReviews} yorum</span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

