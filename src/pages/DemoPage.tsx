import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Star, Sparkles, Copy, Check, RotateCcw, ArrowRight, Menu, X, Shield, Users, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import voyageRespondLogo from "@/assets/voyage-respond-logo.svg";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import SEO from "@/components/seo/SEO";
import { EmailGateModal } from "@/components/EmailGateModal";

// GA4 event helper
const gtagEvent = (eventName: string, category: string, label: string) => {
  if (typeof (window as any).gtag === "function") {
    (window as any).gtag("event", eventName, {
      event_category: category,
      event_label: label,
    });
  }
};

const TONES = [
  { id: "friendly", label: "Samimi", emoji: "😊" },
  { id: "formal", label: "Resmi", emoji: "👔" },
  { id: "empathetic", label: "Empatik", emoji: "🤝" },
  { id: "grateful", label: "Minnettar", emoji: "🙏" },
  { id: "apologetic", label: "Özür Dileyen", emoji: "💐" },
  { id: "enthusiastic", label: "Heyecanlı", emoji: "🎉" },
];

const SAMPLE_REVIEWS = [
  { text: "Yemekler çok lezzetliydi, personel ilgiliydi ama bekleme süresi biraz uzundu.", rating: 4, name: "Ayşe K." },
  { text: "Oda temiz değildi, klima çalışmıyordu. Çok hayal kırıklığına uğradık.", rating: 1, name: "Mehmet Y." },
  { text: "Harika bir deneyimdi! Kesinlikle tekrar geleceğiz. Herkese tavsiye ederiz.", rating: 5, name: "Elif D." },
  { text: "Kahvaltı çeşitleri yeterli değildi, ama manzara muhteşemdi.", rating: 3, name: "Ali R." },
  { text: "Check-in sırasında 40 dakika bekledik. Kabul edilemez.", rating: 2, name: "Selin T." },
  { text: "Spa hizmeti harikaydı, masaj çok profesyoneldi. Teşekkürler!", rating: 5, name: "Deniz A." },
  { text: "Gürültülü bir oda verdiler, uyuyamadık. Şikayet ettik ama çözüm sunulmadı.", rating: 1, name: "Burak M." },
  { text: "Fiyat/performans oranı gayet iyi. Temiz, düzenli ve güler yüzlü personel.", rating: 4, name: "Zeynep Ç." },
  { text: "Akşam yemeğinde servis çok yavaştı ama yemekler lezzetliydi.", rating: 3, name: "Hakan S." },
  { text: "Çocuklu aileler için mükemmel! Çocuk kulübü ve havuz çok iyiydi.", rating: 5, name: "Fatma B." },
  { text: "WiFi sürekli kopuyordu, iş seyahati için uygun değil.", rating: 2, name: "Emre K." },
  { text: "Personel çok ilgiliydi, özellikle resepsiyon görevlisi Ahmet Bey'e teşekkürler.", rating: 5, name: "Merve Y." },
  { text: "Havuz alanı çok kalabalıktı, şezlong bulmak imkansızdı.", rating: 2, name: "Oğuz D." },
  { text: "Restoranda vegan seçenekler çok kısıtlıydı. Geliştirilmeli.", rating: 3, name: "Canan E." },
  { text: "Her şey mükemmeldi! 3. gelişimiz ve her seferinde aynı kalite. Bravo!", rating: 5, name: "Kemal Ö." },
];

export default function DemoPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [reviewText, setReviewText] = useState("");
  const [reviewerName, setReviewerName] = useState("");
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [selectedTone, setSelectedTone] = useState("friendly");
  const [generatedReply, setGeneratedReply] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(false);
  const [unlocked, setUnlocked] = useState(() =>
    typeof window !== "undefined" && localStorage.getItem("demo_unlocked") === "true"
  );
  const [gateModalOpen, setGateModalOpen] = useState(false);

  const canGenerate = reviewText.trim().length > 10 && rating > 0;

  const runGenerate = async () => {
    if (!canGenerate) return;
    setLoading(true);
    setGeneratedReply("");

    const toneName = TONES.find(t => t.id === selectedTone)?.label || selectedTone;
    gtagEvent("generate_reply", "demo", toneName);

    try {
      const { data, error } = await supabase.functions.invoke("generate-reply", {
        body: {
          review_text: reviewText.trim(),
          reviewer_name: reviewerName.trim() || undefined,
          rating,
          tone: selectedTone,
          language: "auto",
          business_name: "Demo İşletme",
        },
      });

      if (error) throw error;
      setGeneratedReply(data.reply);
      setHasGenerated(true);
      // reply generated tracked via generate_reply event above
    } catch {
      toast.error("Yanıt oluşturulurken bir hata oluştu. Lütfen tekrar deneyin.");
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    if (!canGenerate) return;
    if (!user && !unlocked) {
      setGateModalOpen(true);
      return;
    }
    await runGenerate();
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedReply);
    setCopied(true);
    toast.success("Yanıt panoya kopyalandı!");
    const toneName = TONES.find(t => t.id === selectedTone)?.label || selectedTone;
    gtagEvent("copy_reply", "demo", toneName);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSampleReview = (sample: typeof SAMPLE_REVIEWS[0]) => {
    setReviewText(sample.text);
    setRating(sample.rating);
    setReviewerName(sample.name);
    setGeneratedReply("");
    gtagEvent("click_example_review", "demo", sample.name);
  };

  const handleToneSelect = (toneId: string) => {
    setSelectedTone(toneId);
    const toneName = TONES.find(t => t.id === toneId)?.label || toneId;
    gtagEvent("change_tone", "demo", toneName);
  };

  const handleCTAClick = (label: string) => {
    gtagEvent("cta_click", "conversion", label);
    navigate(user ? "/dashboard" : "/register");
  };

  const handleReset = () => {
    setReviewText("");
    setReviewerName("");
    setRating(0);
    setSelectedTone("friendly");
    setGeneratedReply("");
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="AI Yorum Yanıt Demo | Ücretsiz Dene | VoyageRespond"
        description="VoyageRespond AI yorum yanıt aracını kayıt olmadan deneyin. Olumlu ve olumsuz yorumlar için saniyeler içinde profesyonel yanıtlar üretin."
        canonical="/demo"
      />
      {/* Navbar */}
      <nav className="sticky top-0 z-50 border-b border-border/60 backdrop-blur-xl bg-background/80">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex h-16 items-center justify-between">
            <button onClick={() => navigate("/")} className="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
              <img src={voyageRespondLogo} alt="VoyageRespond" className="h-7 w-7" />
              <span className="text-base tracking-tight text-foreground">
                <span className="font-normal">Voyage</span>
                <span className="font-semibold">Respond</span>
              </span>
            </button>

            <div className="hidden md:flex items-center gap-4">
              <LanguageSwitcher />
              <Button variant="ghost" size="sm" onClick={() => navigate("/")}>
                Ana Sayfa
              </Button>
              <Button
                size="sm"
                onClick={() => handleCTAClick("header_free_trial")}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {user ? "Dashboard" : "Ücretsiz Başla"}
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>

            <button
              className="md:hidden p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? "Menüyü kapat" : "Menüyü aç"}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

          {mobileMenuOpen && (
            <div className="md:hidden pb-4 space-y-2">
              <Button variant="ghost" size="sm" className="w-full justify-start" onClick={() => { navigate("/"); setMobileMenuOpen(false); }}>
                Ana Sayfa
              </Button>
              <Button size="sm" className="w-full bg-primary text-primary-foreground" onClick={() => { handleCTAClick("header_free_trial"); setMobileMenuOpen(false); }}>
                {user ? "Dashboard" : "Ücretsiz Başla"}
              </Button>
            </div>
          )}
        </div>
      </nav>

      {/* Hero */}
      <section className="container mx-auto px-4 sm:px-6 pt-8 pb-4 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
          <Sparkles className="w-4 h-4" />
          Ücretsiz Deneyin — Kayıt Gerekmez
        </div>
        <h1 className="text-3xl md:text-5xl font-bold text-foreground mb-3 tracking-tight leading-tight">
          AI ile Profesyonel Yorum Yanıtları
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Bir yorum yazın, ton seçin — yapay zeka saniyeler içinde profesyonel bir yanıt oluştursun.
        </p>
      </section>

      {/* Trust Badges */}
      <section className="container mx-auto px-4 sm:px-6 pb-6">
        <div className="flex flex-wrap items-center justify-center gap-4 md:gap-8">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Shield className="w-4 h-4 text-primary" />
            <span>Google Business API Onaylı</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="w-4 h-4 text-primary" />
            <span>25+ İşletme Kullanıyor</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Zap className="w-4 h-4 text-primary" />
            <span>Ortalama 8 Saniye Yanıt Süresi</span>
          </div>
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <div className="flex">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} className={`w-3.5 h-3.5 ${s <= 5 ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30"}`} />
              ))}
            </div>
            <span>4.8/5 Kullanıcı Puanı</span>
          </div>
        </div>
      </section>

      {/* Main Demo Area */}
      <section className="px-4 sm:px-6 lg:px-12 xl:px-20 pb-20">
        <div className="max-w-[1400px] mx-auto">
          {/* Sample Reviews */}
          <div className="mb-8">
            <p className="text-sm font-medium text-muted-foreground mb-3">
              👇 Bir örneğe tıklayın, hemen sonucu görün:
            </p>
            <div className="flex gap-3 overflow-x-auto pb-3 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-12 lg:px-12 xl:-mx-20 xl:px-20">
              {SAMPLE_REVIEWS.map((sample, i) => (
                <button
                  key={i}
                  onClick={() => handleSampleReview(sample)}
                  className="group text-left px-5 py-4 rounded-xl border border-border bg-card hover:border-primary/40 hover:bg-primary/5 transition-all text-sm cursor-pointer flex-shrink-0 w-[280px]"
                >
                  <div className="flex items-center gap-1 mb-1.5">
                    {Array.from({ length: 5 }).map((_, s) => (
                      <Star key={s} className={`w-3.5 h-3.5 ${s < sample.rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30"}`} />
                    ))}
                    <span className="text-xs text-muted-foreground ml-1.5">— {sample.name}</span>
                  </div>
                  <p className="text-muted-foreground line-clamp-2">{sample.text}</p>
                  <span className="inline-flex items-center gap-1 mt-2 text-xs text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                    <Sparkles className="w-3 h-3" /> Tıkla ve dene
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Left: Input */}
            <div className="space-y-5">
              <div className="rounded-2xl border border-border bg-card p-6 lg:p-8 space-y-6">
                <h2 className="text-lg font-semibold text-foreground">Yorum Bilgileri</h2>

                {/* Rating */}
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">Yıldız Puanı</label>
                  <div className="flex gap-1.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => { setRating(star); gtagEvent("change_rating", "demo", String(star)); }}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        className="transition-transform hover:scale-110"
                        aria-label={`${star} yıldız`}
                      >
                        <Star
                          className={`w-9 h-9 transition-colors ${
                            star <= (hoverRating || rating)
                              ? "fill-amber-400 text-amber-400"
                              : "text-muted-foreground/30"
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Reviewer Name */}
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">Yorumcunun Adı (opsiyonel)</label>
                  <input
                    type="text"
                    value={reviewerName}
                    onChange={(e) => setReviewerName(e.target.value)}
                    placeholder="Örn: Ayşe K."
                    className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
                  />
                </div>

                {/* Review Text */}
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">Yorum Metni</label>
                  <Textarea
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    placeholder="Müşterinin yazdığı yorumu buraya yapıştırın veya yazın..."
                    rows={8}
                    className="rounded-xl border-border bg-background resize-none text-sm"
                  />
                  <p className="text-xs text-muted-foreground/60 mt-1.5">
                    {reviewText.length < 10 ? `En az 10 karakter yazın (${reviewText.length}/10)` : `${reviewText.length} karakter`}
                  </p>
                </div>
              </div>

              {/* Tone Selection */}
              <div className="rounded-2xl border border-border bg-card p-6 lg:p-8">
                <h2 className="text-lg font-semibold text-foreground mb-4">Yanıt Tonu</h2>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {TONES.map((tone) => (
                    <button
                      key={tone.id}
                      onClick={() => handleToneSelect(tone.id)}
                      className={`flex flex-col items-center gap-1.5 px-3 py-3 rounded-xl text-sm font-medium transition-all ${
                        selectedTone === tone.id
                          ? "bg-primary text-primary-foreground shadow-md"
                          : "bg-muted/50 text-muted-foreground hover:bg-muted"
                      }`}
                    >
                      <span className="text-lg">{tone.emoji}</span>
                      <span className="text-xs">{tone.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Generate Button */}
              <Button
                onClick={handleGenerate}
                disabled={!canGenerate || loading}
                className="w-full py-6 text-base font-semibold rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    AI Yanıt Üretiyor...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5" />
                    Yanıt Oluştur
                  </div>
                )}
              </Button>
            </div>

            {/* Right: Output */}
            <div className="space-y-5">
              <div className={`rounded-2xl border bg-card p-6 lg:p-8 min-h-[580px] flex flex-col transition-all ${
                generatedReply ? "border-primary/30 shadow-lg shadow-primary/5" : "border-border"
              }`}>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-foreground">AI Yanıtı</h2>
                  {generatedReply && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleReset}
                        className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground"
                        title="Sıfırla"
                        aria-label="Sıfırla"
                      >
                        <RotateCcw className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>

                {generatedReply ? (
                  <div className="flex-1 flex flex-col">
                    <div className="flex-1 rounded-xl bg-primary/5 border border-primary/10 p-5 mb-4">
                      <p className="text-foreground leading-relaxed whitespace-pre-wrap">{generatedReply}</p>
                    </div>

                    <div className="flex items-center gap-2 mb-4">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
                        <Sparkles className="w-3 h-3" />
                        AI Üretildi
                      </span>
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-muted text-muted-foreground text-xs font-medium">
                        {TONES.find(t => t.id === selectedTone)?.emoji} {TONES.find(t => t.id === selectedTone)?.label}
                      </span>
                    </div>

                    <div className="flex gap-2 mb-6">
                      <Button
                        onClick={handleCopy}
                        variant="outline"
                        className="flex-1 rounded-xl"
                      >
                        {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                        {copied ? "Kopyalandı!" : "Yanıtı Kopyala"}
                      </Button>
                      <Button
                        onClick={handleGenerate}
                        variant="outline"
                        disabled={loading}
                        className="rounded-xl"
                        title="Yeniden oluştur"
                      >
                        <RotateCcw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                      </Button>
                    </div>

                    {/* Post-reply conversion CTA */}
                    <div className="rounded-xl border-2 border-primary/30 bg-gradient-to-br from-primary/5 to-primary/10 p-5 animate-in fade-in slide-in-from-bottom-2 duration-500">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0">
                          <Sparkles className="w-5 h-5 text-primary" />
                        </div>
                        <div className="flex-1">
                          <h4 className="text-sm font-semibold text-foreground mb-1">
                            Bu kalitede yanıtları tüm yorumlarınız için otomatik oluşturun
                          </h4>
                          <p className="text-xs text-muted-foreground mb-3">
                            Google, Booking ve TripAdvisor yorumlarını tek panelden yönetin. 3 ay ücretsiz deneyin.
                          </p>
                          <Button
                            size="sm"
                            onClick={() => handleCTAClick("free_trial_3_month")}
                            className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg shadow-md shadow-primary/20"
                          >
                            3 Ay Ücretsiz Başla
                            <ArrowRight className="w-4 h-4 ml-1" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : loading ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-center">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                      <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                    </div>
                    <p className="text-muted-foreground font-medium">AI yanıtınızı oluşturuyor...</p>
                    <p className="text-xs text-muted-foreground/60 mt-1">Genellikle 3-5 saniye sürer</p>
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-center">
                    <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center mb-4">
                      <Sparkles className="w-7 h-7 text-muted-foreground/40" />
                    </div>
                    <p className="text-muted-foreground font-medium mb-1">Henüz yanıt oluşturulmadı</p>
                    <p className="text-sm text-muted-foreground/60 max-w-[250px]">
                      Sol taraftaki formu doldurun ve "Yanıt Oluştur" butonuna tıklayın
                    </p>
                  </div>
                )}
              </div>

              {/* CTA Card */}
              {!generatedReply && (
                <div className="rounded-2xl border border-primary/20 bg-primary/5 p-6 text-center">
                  <h3 className="text-base font-semibold text-foreground mb-2">
                    Tüm yorumlarınızı tek panelden yönetin
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Google, Booking, TripAdvisor — hepsine AI ile anında yanıt verin.
                  </p>
                  <Button
                    onClick={() => handleCTAClick("free_trial_3_month")}
                    className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl"
                  >
                    {user ? "Dashboard'a Git" : "Ücretsiz Başla"}
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
      <EmailGateModal
        open={gateModalOpen}
        onOpenChange={setGateModalOpen}
        onUnlock={() => {
          setUnlocked(true);
          setTimeout(() => { runGenerate(); }, 100);
        }}
        source="demo_generate"
      />
    </div>
  );
}
