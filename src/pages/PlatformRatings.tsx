import { useNavigate } from "react-router-dom";
import { LayoutGrid, Loader2, RefreshCw } from "lucide-react";
import { useState } from "react";
import { useMultiLocationData } from "@/hooks/useMultiLocationData";
import { PlatformRatingsMatrix } from "@/components/locations/PlatformRatingsMatrix";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

export default function PlatformRatings() {
  const navigate = useNavigate();
  const { data: locations = [], isLoading } = useMultiLocationData();
  const [refreshing, setRefreshing] = useState(false);
  const queryClient = useQueryClient();

  const handleSelectLocation = (id: string) => {
    navigate(`/locations/platform-ratings/${id}`);
  };

  const handleRefreshAll = async () => {
    if (locations.length === 0) return;
    setRefreshing(true);
    const business_ids = locations.map((l) => l.id);
    try {
      const tid = toast.loading("Tüm platform puanları çekiliyor...");

      const [bookingRes, otherRes] = await Promise.all([
        supabase.functions.invoke("fetch-booking-overall-rating", {
          body: { business_ids },
        }),
        supabase.functions.invoke("fetch-platform-overall-rating", {
          body: {
            business_ids,
            platforms: ["tripadvisor", "hotelscom", "expedia", "tripcom"],
          },
        }),
      ]);

      toast.dismiss(tid);

      let success = 0;
      let missing = 0;

      if (!bookingRes.error) {
        success += Object.keys(bookingRes.data?.results || {}).length;
        missing += Object.keys(bookingRes.data?.errors || {}).length;
      }

      if (!otherRes.error && otherRes.data?.results) {
        for (const bizId of Object.keys(otherRes.data.results)) {
          success += Object.keys(otherRes.data.results[bizId] || {}).length;
          missing += Object.keys(otherRes.data.errors?.[bizId] || {}).length;
        }
      }

      toast.success(
        `Puanlar güncellendi: ${success} başarılı${missing ? `, ${missing} eksik/atlandı` : ""}`
      );
      queryClient.invalidateQueries({ queryKey: ["platform-ratings-overrides"] });
    } catch (e: any) {
      toast.error(e?.message || "Puanlar güncellenemedi");
    } finally {
      setRefreshing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Platform puanları yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-[1400px] mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary/10">
              <LayoutGrid className="h-5 w-5 text-primary" />
            </div>
            Platform Puanları
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Google 5 üzerinden; Booking, Hotels.com, Expedia ve Trip.com 10 üzerinden;
            TripAdvisor 5 üzerinden gösterilir — her platformun kendi resmi skalası kullanılır.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefreshAll}
          disabled={refreshing || locations.length === 0}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
          Tüm platform puanlarını güncelle
        </Button>
      </div>

      {locations.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          Henüz lokasyon yok. Önce bir işletme ekleyin.
        </div>
      ) : (
        <PlatformRatingsMatrix locations={locations} onSelectLocation={handleSelectLocation} />
      )}
    </div>
  );
}
