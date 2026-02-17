import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CheckCircle2, Circle, Hotel, Download, MessageSquare, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useBusiness } from "@/contexts/BusinessContext";

interface SetupWizardProps {
  onDismiss: () => void;
  onComplete: () => void;
}

export function SetupWizard({ onDismiss, onComplete }: SetupWizardProps) {
  const { activeBusiness, refetchBusinesses } = useBusiness();
  const [bookingId, setBookingId] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);

  // Parse booking hotel ID from full URL or partial input
  const parseBookingId = (input: string): string => {
    const trimmed = input.trim();
    // Extract country/hotel-name from full Booking.com URL
    const match = trimmed.match(/hotel\/([a-z]{2})\/([a-z0-9_-]+)/i);
    if (match) return `${match[1]}/${match[2]}`;
    return trimmed;
  };

  const hasBookingId = !!activeBusiness?.booking_hotel_id;

  const handleSetupBooking = async () => {
    if (!activeBusiness || !bookingId.trim()) return;
    setLoading(true);
    const parsedId = parseBookingId(bookingId);
    try {
      const { error: updateError } = await supabase
        .from("businesses")
        .update({ booking_hotel_id: parsedId })
        .eq("id", activeBusiness.id);
      if (updateError) throw updateError;

      const response = await supabase.functions.invoke("wextractor-fetch-reviews", {
        body: { business_id: activeBusiness.id, platform: "booking", offset: 0 },
      });

      if (response.error) throw new Error(response.error.message);
      const result = response.data;

      if (result?.error) {
        toast({ title: "Hata", description: result.error, variant: "destructive" });
      } else {
        toast({
          title: "Harika! 🎉",
          description: `${result.inserted} yorum çekildi.`,
        });
        setStep(3);
        await refetchBusinesses();
        onComplete();
      }
    } catch (err: any) {
      toast({ title: "Hata", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { num: 1, label: "Hesap Oluştur", icon: CheckCircle2, done: true },
    { num: 2, label: "Booking ID Ekle", icon: hasBookingId ? CheckCircle2 : Hotel, done: hasBookingId },
    { num: 3, label: "Yorumları Yönet", icon: MessageSquare, done: false },
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
                  : step === s.num 
                    ? "bg-primary text-primary-foreground" 
                    : "bg-muted text-muted-foreground"
              }`}>
                {s.done ? <CheckCircle2 className="h-4 w-4" /> : <Circle className="h-4 w-4" />}
                {s.label}
              </div>
              {i < steps.length - 1 && <div className="w-8 h-px bg-border" />}
            </div>
          ))}
        </div>

        {/* Step content */}
        {!hasBookingId && step <= 2 && (
          <div className="space-y-2">
            <div className="flex gap-2 items-center">
              <Input
                placeholder="Booking.com URL'sini yapıştırın"
                value={bookingId}
                onChange={(e) => setBookingId(e.target.value)}
                disabled={loading}
                className="flex-1"
              />
              <Button onClick={handleSetupBooking} disabled={!bookingId.trim() || loading}>
                <Download className="h-4 w-4 mr-2" />
                {loading ? "Çekiliyor..." : "Yorumları Çek"}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Booking.com'da otelinizin sayfasını açın, URL'yi kopyalayıp buraya yapıştırın. Otomatik olarak doğru kısmı alacağız.
            </p>
          </div>
        )}

        {hasBookingId && (
          <p className="text-sm text-primary font-medium">
            ✅ Booking.com bağlı! Yorumlarınız otomatik olarak her gün güncellenir.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
