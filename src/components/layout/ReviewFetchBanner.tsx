import { Loader2 } from "lucide-react";
import { useReviewFetch } from "@/contexts/ReviewFetchContext";

const platformLabels: Record<string, string> = {
  google: "Google",
  booking: "Booking.com",
  tripadvisor: "TripAdvisor",
  expedia: "Expedia",
  hotelscom: "Hotels.com",
};

export function ReviewFetchBanner() {
  const { pendingRuns, hasPendingRuns } = useReviewFetch();

  if (!hasPendingRuns) return null;

  const runs = Array.from(pendingRuns.values());
  const platformNames = runs.map(r => platformLabels[r.platform] || r.platform).join(", ");
  const businessNames = [...new Set(runs.map(r => r.businessName))].join(", ");

  return (
    <div className="bg-primary/10 border-b border-primary/20 px-4 py-2 flex items-center gap-3 text-sm">
      <Loader2 className="h-4 w-4 animate-spin text-primary flex-shrink-0" />
      <span className="text-foreground">
        <span className="font-medium">{businessNames}</span>
        {" — "}
        <span className="text-muted-foreground">
          {platformNames} yorumları arka planda çekiliyor...
        </span>
      </span>
    </div>
  );
}
