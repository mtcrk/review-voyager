import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Circle, X } from "lucide-react";
import { useBusiness } from "@/contexts/BusinessContext";
import { useNavigate } from "react-router-dom";

interface SetupWizardProps {
  onDismiss: () => void;
  onComplete: () => void;
}

export function SetupWizard({ onDismiss, onComplete }: SetupWizardProps) {
  const { activeBusiness } = useBusiness();
  const navigate = useNavigate();

  const hasReviewPlatform = !!(
    activeBusiness?.google_connected ||
    activeBusiness?.booking_hotel_id ||
    activeBusiness?.tripadvisor_id ||
    activeBusiness?.trustpilot_url ||
    activeBusiness?.hotelscom_url
  );

  const steps = [
    { num: 1, label: "Hesap Oluştur", done: true },
    { num: 2, label: "Platform Bağla", done: hasReviewPlatform },
    { num: 3, label: "Yorumları Yönet", done: false },
  ];

  return (
    <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-transparent shadow-card relative">
      <Button
        variant="ghost"
        size="icon"
        className="absolute right-2 top-2 h-8 w-8"
        onClick={onDismiss}
      >
        <X className="h-4 w-4" />
      </Button>
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold text-foreground mb-1">Hoş Geldiniz! 👋</h3>
        <p className="text-sm text-muted-foreground mb-6">
          3 adımda yorumlarınızı yönetmeye başlayın
        </p>

        {/* Steps indicator */}
        <div className="flex items-center gap-2 mb-6">
          {steps.map((s, i) => (
            <div key={s.num} className="flex items-center gap-2">
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm ${
                s.done 
                  ? "bg-primary/10 text-primary" 
                  : "bg-muted text-muted-foreground"
              }`}>
                {s.done ? <CheckCircle2 className="h-4 w-4" /> : <Circle className="h-4 w-4" />}
                {s.label}
              </div>
              {i < steps.length - 1 && <div className="w-8 h-px bg-border" />}
            </div>
          ))}
        </div>

        {/* Content */}
        {!hasReviewPlatform ? (
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Sidebar'dan bir yorum platformu seçerek (Google, Booking, TripAdvisor vb.) bağlantı kurabilirsiniz.
            </p>
            <Button variant="outline" size="sm" onClick={() => navigate("/reviews?platform=booking")}>
              Platformları Gör
            </Button>
          </div>
        ) : (
          <p className="text-sm text-primary font-medium">
            ✅ Platform bağlı! Sidebar'dan yorumlarınızı yönetmeye başlayın.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
