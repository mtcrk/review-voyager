import { useState, useEffect, useCallback } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";

interface ExitIntentPopupProps {
  disabled?: boolean;
}

export function ExitIntentPopup({ disabled = false }: ExitIntentPopupProps) {
  const [show, setShow] = useState(false);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const triggerPopup = useCallback(() => {
    if (disabled) return;
    const shown = sessionStorage.getItem("exit_popup_shown");
    const formSubmitted = sessionStorage.getItem("demo_form_submitted");
    if (shown || formSubmitted) return;
    sessionStorage.setItem("exit_popup_shown", "1");
    setShow(true);
  }, [disabled]);

  useEffect(() => {
    // Desktop: mouse leaves viewport toward top
    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0) triggerPopup();
    };
    document.addEventListener("mouseleave", handleMouseLeave);

    // Mobile: quick scroll up detection
    let lastScrollY = window.scrollY;
    let lastTime = Date.now();
    const handleScroll = () => {
      const now = Date.now();
      const delta = lastScrollY - window.scrollY;
      const dt = now - lastTime;
      // Fast upward scroll: >150px in <300ms
      if (delta > 150 && dt < 300) {
        triggerPopup();
      }
      lastScrollY = window.scrollY;
      lastTime = now;
    };
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      document.removeEventListener("mouseleave", handleMouseLeave);
      window.removeEventListener("scroll", handleScroll);
    };
  }, [triggerPopup]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes("@")) {
      setError("Lütfen geçerli bir e-posta girin.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const payload = {
        name: "Exit Popup Lead",
        business_name: "—",
        contact: email.trim(),
      };
      const { error: dbError } = await supabase
        .from("demo_requests" as any)
        .insert(payload);
      if (dbError) throw dbError;

      // Send admin notification email
      await supabase.functions.invoke("notify-demo-request", { body: payload });

      try {
        const { trackEvent } = await import("@/lib/analytics");
        trackEvent("demo_request", { source: "exit_intent" });
      } catch {}

      setSubmitted(true);
    } catch {
      setError("Bir hata oluştu, tekrar deneyin.");
    } finally {
      setLoading(false);
    }
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={() => setShow(false)}
      />

      {/* Modal */}
      <div
        className="relative w-full max-w-md rounded-2xl border border-white/10 p-6 sm:p-8 animate-in fade-in zoom-in-95 duration-300"
        style={{ backgroundColor: "#1A1230" }}
      >
        <button
          onClick={() => setShow(false)}
          className="absolute top-3 right-3 text-white/40 hover:text-white/80 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {!submitted ? (
          <div className="text-center space-y-4">
            <h3 className="text-xl sm:text-2xl font-bold text-white">
              Gitmeden önce!
            </h3>
            <p className="text-sm" style={{ color: "#A78BFA" }}>
              Yorumlarınızın ücretsiz analizini yapalım — sadece e-posta yeter.
            </p>
            <form onSubmit={handleSubmit} className="space-y-3 pt-2">
              <Input
                type="email"
                placeholder="E-posta adresiniz"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus-visible:ring-purple-500"
                required
              />
              {error && <p className="text-xs text-red-400">{error}</p>}
              <Button
                type="submit"
                disabled={loading}
                className="w-full text-white font-semibold py-5 text-sm hover:opacity-90 transition-opacity"
                style={{ backgroundColor: "#7C3AED" }}
              >
                {loading ? "Gönderiliyor..." : "Ücretsiz Analiz Al"}
              </Button>
            </form>
          </div>
        ) : (
          <div className="text-center space-y-3 py-4">
            <div className="text-3xl">✅</div>
            <p className="text-white font-semibold">Teşekkürler!</p>
            <p className="text-sm" style={{ color: "#A78BFA" }}>
              Analiz sonuçlarınızı en kısa sürede göndereceğiz.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
