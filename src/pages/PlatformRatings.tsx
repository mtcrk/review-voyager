import { useNavigate } from "react-router-dom";
import { LayoutGrid, Loader2 } from "lucide-react";
import { useMultiLocationData } from "@/hooks/useMultiLocationData";
import { PlatformRatingsMatrix } from "@/components/locations/PlatformRatingsMatrix";
import { useBusiness } from "@/contexts/BusinessContext";
import { toast } from "@/hooks/use-toast";

export default function PlatformRatings() {
  const navigate = useNavigate();
  const { data: locations = [], isLoading } = useMultiLocationData();

  const handleSelectLocation = (id: string) => {
    navigate(`/locations/platform-ratings/${id}`);
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
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-3">
          <div className="p-2 rounded-xl bg-primary/10">
            <LayoutGrid className="h-5 w-5 text-primary" />
          </div>
          Platform Puanları
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Her otelin Google, Booking, TripAdvisor, Hotels.com, Expedia ve Trip.com'daki puanlarını
          tek ekranda karşılaştırın.
        </p>
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
