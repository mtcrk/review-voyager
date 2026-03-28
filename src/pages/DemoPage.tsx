import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Sparkles, CheckCircle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import voyageRespondLogo from "@/assets/voyage-respond-logo.svg";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useAuth } from "@/contexts/AuthContext";

export default function DemoPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: "", business_name: "", contact: "" });
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!form.name.trim() || !form.business_name.trim() || !form.contact.trim()) {
      setError("Lütfen tüm alanları doldurun.");
      return;
    }

    setLoading(true);
    try {
      const { error: dbError } = await supabase
        .from("demo_requests" as any)
        .insert({
          name: form.name.trim(),
          business_name: form.business_name.trim(),
          contact: form.contact.trim(),
        });

      if (dbError) throw dbError;

      // Send email notification
      await supabase.functions.invoke("notify-demo-request", {
        body: {
          name: form.name.trim(),
          business_name: form.business_name.trim(),
          contact: form.contact.trim(),
        },
      });

      setSubmitted(true);
    } catch {
      setError("Bir hata oluştu, lütfen tekrar deneyin.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#0F0A1F" }}>
      {/* Navbar */}
      <nav className="sticky top-0 z-50 border-b border-white/10 backdrop-blur-lg" style={{ backgroundColor: "rgba(15, 10, 31, 0.95)" }}>
        <div className="container mx-auto px-6">
          <div className="flex h-16 items-center justify-between">
            <button onClick={() => navigate("/")} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <img src={voyageRespondLogo} alt="VoyageRespond" className="h-6 w-6" />
              <span className="text-base text-white">
                <span className="font-normal">Voyage</span>
                <span className="font-semibold">Respond</span>
              </span>
            </button>
            <div className="flex items-center gap-3">
              <LanguageSwitcher />
              <button
                onClick={() => navigate(user ? "/dashboard" : "/register")}
                className="px-4 py-2 rounded-md text-sm font-medium text-white transition-all shadow-sm hover:shadow-md"
                style={{ backgroundColor: "#7C3AED" }}
              >
                {user ? t("nav.dashboard") : t("nav.getStarted")}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Content */}
      <section className="container mx-auto px-6 py-20 flex items-center justify-center min-h-[calc(100vh-64px)]">
        <div className="w-full max-w-md">
          {!submitted ? (
            <div className="rounded-2xl p-8 border border-white/10" style={{ backgroundColor: "rgba(255,255,255,0.05)" }}>
              {/* Badge */}
              <div className="flex justify-center mb-6">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-purple-500/30 text-sm font-medium" style={{ backgroundColor: "rgba(124, 58, 237, 0.15)", color: "#C4B5FD" }}>
                  <Sparkles className="w-4 h-4" />
                  Ücretsiz Demo
                </div>
              </div>

              <h1 className="text-3xl md:text-4xl font-bold text-white text-center mb-3">
                Ücretsiz Demo Talep Et
              </h1>
              <p className="text-center mb-8" style={{ color: "#A78BFA" }}>
                Yapay zeka ile yorum yönetimini 2 dakikada görün.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-1.5">İsim</label>
                  <Input
                    placeholder="Adınız Soyadınız"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus-visible:ring-purple-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-1.5">İşletme Adı</label>
                  <Input
                    placeholder="İşletmenizin adı"
                    value={form.business_name}
                    onChange={(e) => setForm({ ...form, business_name: e.target.value })}
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus-visible:ring-purple-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-1.5">Telefon veya E-posta</label>
                  <Input
                    placeholder="İletişim bilginiz"
                    value={form.contact}
                    onChange={(e) => setForm({ ...form, contact: e.target.value })}
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus-visible:ring-purple-500"
                    required
                  />
                </div>

                {error && (
                  <p className="text-sm text-red-400 text-center">{error}</p>
                )}

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full text-white font-semibold py-6 text-base hover:opacity-90 transition-opacity"
                  style={{ backgroundColor: "#7C3AED" }}
                >
                  {loading ? "Gönderiliyor..." : "Demo Talep Et"}
                </Button>
              </form>

              <p className="text-xs text-center mt-4" style={{ color: "rgba(255,255,255,0.3)" }}>
                Bilgileriniz gizli tutulur ve yalnızca demo randevusu için kullanılır.
              </p>
            </div>
          ) : (
            <div className="text-center space-y-6">
              <div className="flex justify-center">
                <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ backgroundColor: "rgba(124, 58, 237, 0.2)" }}>
                  <CheckCircle className="w-8 h-8" style={{ color: "#A78BFA" }} />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-white">Talebiniz alındı!</h2>
              <p style={{ color: "#A78BFA" }}>
                En kısa sürede sizinle iletişime geçeceğiz.
              </p>
              <Button
                variant="outline"
                onClick={() => navigate("/")}
                className="border-white/20 text-white hover:bg-white/10"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Ana Sayfaya Dön
              </Button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
