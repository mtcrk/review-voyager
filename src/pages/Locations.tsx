import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Building2, Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMultiLocationData } from "@/hooks/useMultiLocationData";
import { LocationOverviewStats } from "@/components/locations/LocationOverviewStats";
import { LocationHighlights } from "@/components/locations/LocationHighlights";
import { LocationComparisonTable } from "@/components/locations/LocationComparisonTable";
import { LocationTrendChart } from "@/components/locations/LocationTrendChart";
import { LocationMapView } from "@/components/locations/LocationMapView";

export default function Locations() {
  const navigate = useNavigate();
  const { data: locations = [], isLoading, refetch } = useMultiLocationData();

  const handleSelectLocation = (id: string) => {
    // Navigate to dashboard filtered to this business
    navigate(`/dashboard?business=${id}`);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Lokasyonlar yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (locations.length === 0) {
    return (
      <div className="p-6 md:p-8">
        <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
          <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
            <Building2 className="h-10 w-10 text-primary/60" />
          </div>
          <h2 className="text-xl font-semibold text-foreground mb-2">Henüz lokasyon yok</h2>
          <p className="text-muted-foreground max-w-md mb-6">
            İşletme ekleyerek çoklu lokasyon yönetimini kullanmaya başlayın. 
            Her lokasyonun yorumlarını tek panelden takip edin.
          </p>
          <Button onClick={() => navigate("/settings")} className="gap-2">
            <Plus className="h-4 w-4" />
            İşletme Ekle
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary/10">
              <Building2 className="h-5 w-5 text-primary" />
            </div>
            Lokasyonlar
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Tüm şubelerinizin performansını tek panelden yönetin
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => navigate("/settings")} className="gap-2">
          <Plus className="h-4 w-4" />
          Lokasyon Ekle
        </Button>
      </div>

      {/* Overview Stats */}
      <LocationOverviewStats locations={locations} />

      {/* Highlights (best/worst) */}
      <LocationHighlights locations={locations} />

      {/* Comparison Table */}
      <LocationComparisonTable locations={locations} onSelectLocation={handleSelectLocation} />

      {/* Charts & Map Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <LocationTrendChart locations={locations} />
        <LocationMapView locations={locations} onRefresh={() => refetch()} />
      </div>
    </div>
  );
}
