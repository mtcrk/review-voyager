import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { trackEvent } from "@/lib/analytics";
import { Sparkles } from "lucide-react";

interface EmailGateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUnlock: () => void;
  source?: string;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function EmailGateModal({ open, onOpenChange, onUnlock, source = "demo" }: EmailGateModalProps) {
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const value = email.trim().toLowerCase();
    if (!EMAIL_RE.test(value)) {
      setError("Geçerli bir e-posta adresi gir.");
      return;
    }
    setLoading(true);
    try {
      const { error: insertError } = await supabase.from("leads").insert({
        email: value,
        source,
        marketing_consent: consent,
      });
      if (insertError) throw insertError;

      trackEvent("lead_email_submitted", { source });
      localStorage.setItem("demo_unlocked", "true");
      localStorage.setItem("demo_email", value);

      onUnlock();
      onOpenChange(false);
    } catch (err: any) {
      setError("Bir şeyler ters gitti, tekrar dener misin?");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex justify-center mb-2">
            <div className="bg-primary/10 p-3 rounded-full">
              <Sparkles className="w-6 h-6 text-primary" />
            </div>
          </div>
          <DialogTitle className="text-center text-xl">
            Yapay zeka bir yorumu nasıl cevaplıyor, gör
          </DialogTitle>
          <DialogDescription className="text-center">
            30 saniyede dene, kredi kartı yok. Sadece e-postanı bırak, hemen açılsın.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-2">
            <Label htmlFor="gate-email">E-posta</Label>
            <Input
              id="gate-email"
              type="email"
              placeholder="ornek@isletmeniz.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
              autoFocus
            />
          </div>

          <div className="flex items-start gap-2">
            <Checkbox
              id="gate-consent"
              checked={consent}
              onCheckedChange={(v) => setConsent(v === true)}
              disabled={loading}
            />
            <Label htmlFor="gate-consent" className="text-sm text-muted-foreground leading-snug font-normal cursor-pointer">
              Ürün güncellemeleri ve pazarlama e-postaları almayı kabul ediyorum. İstediğim zaman iptal edebilirim.
            </Label>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Açılıyor..." : "Hemen Göster"}
          </Button>

          <p className="text-xs text-center text-muted-foreground">
            E-postanı yalnızca ürün ve içerik güncellemeleri için kullanırız.
          </p>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default EmailGateModal;