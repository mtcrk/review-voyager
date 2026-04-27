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

  const handleRefreshBooking = async () => {
    if (locations.length === 0) return;
    setRefreshing(true);
    try {
      const { data, error } = await supabase.functions.invoke(
        "fetch-booking-overall-rating",
        { body: { business_ids: locations.map((l) => l.id) } }
      );
      if (error) throw error;
      const okCount = Object.keys(data?.results || {}).length;
      const errCount = Object.keys(data?.errors || {}).length;
      toast.success(
        `Booking puanları güncellendi: ${okCount} başarılı${
          errCount ? `, ${errCount} eksik` : ""
        }`
      );
      queryClient.invalidateQueries({ queryKey: ["platform-ratings-overrides"] });
    } catch (e: any) {
      toast.error(e?.message || "Booking puanları güncellenemedi");
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
            Google 5 üzerinden, Booking ve diğer OTA'lar 10 üzerinden gösterilir — her platformun
            kendi resmi skalası kullanılır.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefreshBooking}
          disabled={refreshing || locations.length === 0}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
          Booking puanlarını güncelle
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
