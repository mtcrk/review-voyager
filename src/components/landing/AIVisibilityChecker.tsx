import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Eye, Sparkles, CheckCircle2, XCircle, ArrowRight, Loader2,
  MapPin, Star, Users, Lock, AlertCircle, TrendingUp,
  Search, Bot, BarChart3, Trophy
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { EmailGateModal } from "@/components/EmailGateModal";
import { trackEvent } from "@/lib/analytics";

const STORAGE_KEY = "ai_visibility_demo_count";
const EMAIL_KEY = "ai_visibility_email_unlocked";
const MAX_FREE_TRIES = 2;
const MAX_EMAIL_TRIES = 5;

const LOCATIONS = [
  "İstanbul", "İstanbul, Kadıköy", "İstanbul, Beşiktaş", "İstanbul, Şişli", "İstanbul, Beyoğlu",
  "İstanbul, Bakırköy", "İstanbul, Ataşehir", "İstanbul, Üsküdar",
  "Ankara", "Ankara, Çankaya", "Ankara, Kızılay",
  "İzmir", "İzmir, Alsancak", "İzmir, Bornova", "İzmir, Karşıyaka",
  "Bursa", "Antalya", "Antalya, Muratpaşa", "Antalya, Konyaaltı", "Antalya, Lara",
  "Adana", "Konya", "Gaziantep", "Mersin", "Kayseri", "Eskişehir",
  "Muğla, Bodrum", "Muğla, Marmaris", "Muğla, Fethiye",
  "Trabzon", "Diyarbakır", "Samsun", "Denizli",
];

interface Competitor { name: string; rating: number; reviewCount: number; address: string | null; }
interface ScoreBreakdown {
  aiVisibility: { points: number; max: number; label: string };
  rating: { points: number; max: number; label: string };
  reviewVolume: { points: number; max: number; label: string };
  gbpPresence: { points: number; max: number; label: string };
}
interface AnalysisResult {
  status: "ok" | "not_found";
  business?: { name: string; rating: number; reviewCount: number; address: string | null; sector: string };
  aiCheck?: { query: string; model: string; mentioned: boolean; mentionedCompetitors: string[]; answerPreview: string };
  competitors?: Competitor[];
  stats?: { ratingMedian: number; reviewMedian: number };
  score?: { total: number; breakdown: ScoreBreakdown };
  summary?: string;
  improvements?: string[];
  message?: string;
}

const STAGES = [
  { key: "google", label: "Google'da işletmeniz aranıyor…", icon: Search },
  { key: "competitors", label: "Bölgedeki rakipler taranıyor…", icon: Users },
  { key: "ai", label: "AI asistana canlı soruluyor…", icon: Bot },
  { key: "score", label: "Skor hesaplanıyor…", icon: BarChart3 },
];

function getUsageCount(): number {
  try { return parseInt(localStorage.getItem(STORAGE_KEY) || "0", 10) || 0; } catch { return 0; }
}
function incrementUsage(): number {
  try {
    const n = getUsageCount() + 1;
    localStorage.setItem(STORAGE_KEY, String(n));
    return n;
  } catch { return 0; }
}
function isEmailUnlocked(): boolean {
  try { return localStorage.getItem(EMAIL_KEY) === "1"; } catch { return false; }
}

export function AIVisibilityChecker() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [businessName, setBusinessName] = useState("");
  const [location, setLocation] = useState("");
  const [loading, setLoading] = useState(false);
  const [stageIdx, setStageIdx] = useState(0);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [analyzedName, setAnalyzedName] = useState("");
  const [analyzedLocation, setAnalyzedLocation] = useState("");
  const [showLocSuggestions, setShowLocSuggestions] = useState(false);
  const [filteredLocs, setFilteredLocs] = useState<string[]>([]);
  const [usageCount, setUsageCount] = useState(0);
  const [emailUnlocked, setEmailUnlocked] = useState(false);
  const [gateOpen, setGateOpen] = useState(false);
  const locRef = useRef<HTMLInputElement>(null);
  const sugRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setUsageCount(getUsageCount());
    setEmailUnlocked(isEmailUnlocked());
  }, []);

  useEffect(() => {
    if (location.trim().length > 0) {
      const f = LOCATIONS.filter((l) => l.toLowerCase().includes(location.toLowerCase())).slice(0, 8);
      setFilteredLocs(f);
      setShowLocSuggestions(f.length > 0);
    } else {
      setFilteredLocs([]);
      setShowLocSuggestions(false);
    }
  }, [location]);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (sugRef.current && !sugRef.current.contains(e.target as Node)
        && locRef.current && !locRef.current.contains(e.target as Node)) {
        setShowLocSuggestions(false);
      }
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const maxTries = emailUnlocked ? MAX_EMAIL_TRIES : MAX_FREE_TRIES;
  const remainingTries = Math.max(0, maxTries - usageCount);
  const limitReached = usageCount >= maxTries;

  const handleAnalyze = async () => {
    if (limitReached) return;
    if (!businessName.trim()) {
      toast.error("Lütfen işletme adı girin");
      return;
    }
    trackEvent("ai_checker_started", { hasLocation: !!location.trim() });
    setLoading(true);
    setResult(null);
    setStageIdx(0);

    // Aşama simulasyonu — çağrı sürerken kullanıcıya ilerleme göster
    const stageTimers: number[] = [];
    stageTimers.push(window.setTimeout(() => setStageIdx(1), 800));
    stageTimers.push(window.setTimeout(() => setStageIdx(2), 1800));
    stageTimers.push(window.setTimeout(() => setStageIdx(3), 3200));

    try {
      const { data, error } = await supabase.functions.invoke("ai-visibility-demo", {
        body: { businessName: businessName.trim(), location: location.trim() || undefined },
      });
      if (error) throw new Error(error.message || "Analiz başarısız");
      if (data?.error) throw new Error(data.error);

      const parsed = data as AnalysisResult;
      setResult(parsed);
      setAnalyzedName(businessName.trim());
      setAnalyzedLocation(location.trim());
      const newCount = incrementUsage();
      setUsageCount(newCount);

      if (parsed.status === "not_found") {
        trackEvent("ai_checker_not_found", { businessName: businessName.trim() });
      } else {
        trackEvent("ai_checker_completed", {
          score: parsed.score?.total,
          ai_mentioned: parsed.aiCheck?.mentioned,
        });
      }
    } catch (err) {
      console.error("Analysis error:", err);
      toast.error(err instanceof Error ? err.message : "Bir hata oluştu");
    } finally {
      stageTimers.forEach((id) => clearTimeout(id));
      setLoading(false);
    }
  };

  const saveLeadAfterEmail = async () => {
    trackEvent("ai_checker_email_captured", { score: result?.score?.total });
    try {
      const email = localStorage.getItem("demo_email");
      if (email && result?.status === "ok") {
        await supabase.from("leads").insert({
          email,
          source: "ai_visibility_checker",
          marketing_consent: true,
          business_name: analyzedName,
          location: analyzedLocation || null,
          score: result.score?.total ?? null,
          ai_mentioned: result.aiCheck?.mentioned ?? null,
          metadata: {
            sector: result.business?.sector,
            aiQuery: result.aiCheck?.query,
            competitors: result.competitors?.map((c) => c.name),
          },
        } as any);
      }
    } catch (e) {
      console.error("Lead save failed:", e);
    }
    try { localStorage.setItem(EMAIL_KEY, "1"); } catch {}
    setEmailUnlocked(true);
    setGateOpen(false);
  };

  const scoreColor = (s: number) =>
    s >= 75 ? "text-green-600" : s >= 50 ? "text-amber-600" : "text-red-600";
  const scoreBg = (s: number) =>
    s >= 75 ? "bg-green-50" : s >= 50 ? "bg-amber-50" : "bg-red-50";
  const scoreRing = (s: number) =>
    s >= 75 ? "ring-green-200" : s >= 50 ? "ring-amber-200" : "ring-red-200";

  return (
    <section id="visibility-checker" className="container mx-auto px-4 sm:px-6 py-16 sm:py-20">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-4">
            <Sparkles className="w-4 h-4" />
            Ücretsiz · Gerçek veri
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
            AI Sizi Öneriyor mu? <span className="text-primary">Şimdi Ölçelim.</span>
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
            Google'dan gerçek verinizi çekiyoruz, sonra AI asistana canlı soruyoruz: sizi öneriyor mu, yoksa rakipleri mi?
          </p>
        </div>

        {/* Input */}
        <div className="bg-card border border-border rounded-2xl p-6 sm:p-8 shadow-lg mb-8">
          {limitReached && !emailUnlocked ? (
            <div className="text-center py-6">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary/10 mb-4">
                <Lock className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Deneme hakkınız doldu</h3>
              <p className="text-muted-foreground mb-5 max-w-md mx-auto">
                E-postanızı bırakın, +3 ölçüm hakkı ve detaylı rakip verilerini açalım.
              </p>
              <Button size="lg" className="gradient-primary text-white" onClick={() => setGateOpen(true)}>
                E-posta ile devam et <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          ) : limitReached ? (
            <div className="text-center py-6">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary/10 mb-4">
                <Lock className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Deneme limitine ulaştınız</h3>
              <p className="text-muted-foreground mb-5">Sınırsız analiz için ücretsiz hesap oluşturun.</p>
              <Button size="lg" className="gradient-primary text-white" onClick={() => navigate("/register")}>
                Ücretsiz Kayıt Ol <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1">
                  <Input
                    type="text"
                    placeholder="İşletme adınız (örn: Cafe Botanica)"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleAnalyze()}
                    className="h-14 text-base sm:text-lg px-5"
                    disabled={loading}
                  />
                </div>
                <div className="sm:w-64 relative">
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground z-10" />
                    <Input
                      ref={locRef}
                      type="text"
                      placeholder="Konum (opsiyonel)"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleAnalyze()}
                      onFocus={() => location.trim().length > 0 && filteredLocs.length > 0 && setShowLocSuggestions(true)}
                      className="h-14 text-base sm:text-lg pl-12 pr-5"
                      disabled={loading}
                      autoComplete="off"
                    />
                  </div>
                  {showLocSuggestions && filteredLocs.length > 0 && (
                    <div
                      ref={sugRef}
                      className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto"
                    >
                      {filteredLocs.map((loc, i) => (
                        <button
                          key={i}
                          type="button"
                          className="w-full px-4 py-3 text-left text-sm hover:bg-muted transition-colors flex items-center gap-2"
                          onClick={() => { setLocation(loc); setShowLocSuggestions(false); }}
                        >
                          <MapPin className="w-4 h-4 text-muted-foreground" />
                          <span>{loc}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <Button
                onClick={handleAnalyze}
                disabled={loading || !businessName.trim()}
                className="h-14 px-8 text-base sm:text-lg gradient-primary text-white w-full sm:w-auto sm:self-end"
              >
                {loading ? (
                  <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Analiz Ediliyor…</>
                ) : (
                  <><Eye className="w-5 h-5 mr-2" /> Şimdi Ölç</>
                )}
              </Button>
              <p className="text-xs text-muted-foreground text-center">
                Kalan hak: <span className="font-medium text-foreground">{remainingTries}</span>
                {" · "}Sınırsız için <button onClick={() => navigate("/register")} className="text-primary hover:underline">kayıt olun</button>
              </p>
            </div>
          )}
        </div>

        {/* Loading stages */}
        {loading && (
          <div className="bg-card border border-border rounded-2xl p-6 sm:p-8 mb-8">
            <div className="space-y-3">
              {STAGES.map((s, i) => {
                const done = i < stageIdx;
                const active = i === stageIdx;
                const Icon = s.icon;
                return (
                  <div key={s.key} className={`flex items-center gap-3 transition-opacity ${i > stageIdx ? "opacity-40" : ""}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${done ? "bg-green-100 text-green-600" : active ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
                      {done ? <CheckCircle2 className="w-5 h-5" /> : active ? <Loader2 className="w-4 h-4 animate-spin" /> : <Icon className="w-4 h-4" />}
                    </div>
                    <span className={`text-sm ${active ? "text-foreground font-medium" : "text-muted-foreground"}`}>{s.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Results */}
        {result && !loading && result.status === "not_found" && (
          <div className="bg-card border-2 border-amber-200 bg-amber-50/40 rounded-2xl p-6 sm:p-8 animate-fade-in">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                <AlertCircle className="w-6 h-6 text-amber-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold mb-2">Google'da işletmenizi bulamadık</h3>
                <p className="text-muted-foreground mb-4">
                  {result.message || "Bu başlı başına bir görünürlük problemi. Google Business Profile'ınız eksik olabilir ya da adınız farklı yazılıyor olabilir."}
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button className="gradient-primary text-white" onClick={() => navigate("/demo")}>
                    Nasıl düzeltilir, göster <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                  <Button variant="outline" onClick={() => { setResult(null); setBusinessName(""); }}>
                    Farklı isimle dene
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {result && !loading && result.status === "ok" && result.business && result.aiCheck && result.score && (
          <div className="animate-fade-in space-y-6">
            {/* HERO: AI kararı */}
            <div className={`rounded-2xl p-6 sm:p-8 border-2 ${result.aiCheck.mentioned ? "border-green-300 bg-green-50/50" : "border-red-300 bg-red-50/40"}`}>
              <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground mb-3">
                <Bot className="w-4 h-4" />
                <span>AI'a az önce soruldu · Gemini 2.5 · canlı</span>
              </div>
              <div className="text-sm text-muted-foreground italic mb-4">
                "{result.aiCheck.query}"
              </div>
              <div className="flex items-start gap-4">
                {result.aiCheck.mentioned ? (
                  <>
                    <CheckCircle2 className="w-10 h-10 text-green-600 flex-shrink-0" />
                    <div>
                      <div className="text-2xl sm:text-3xl font-bold text-green-800 mb-1">
                        {result.business.name} önerildi ✓
                      </div>
                      <p className="text-green-700">
                        AI, {result.business.sector.toLowerCase()} önerileri arasında sizi listeledi.
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <XCircle className="w-10 h-10 text-red-600 flex-shrink-0" />
                    <div>
                      <div className="text-2xl sm:text-3xl font-bold text-red-800 mb-1">
                        {result.business.name} önerilmedi
                      </div>
                      <p className="text-red-700">
                        {result.aiCheck.mentionedCompetitors.length > 0
                          ? <>AI yerine şu rakipleri önerdi: <span className="font-medium">{result.aiCheck.mentionedCompetitors.join(", ")}</span></>
                          : "AI, bu bölgede sizi öneri listesine dahil etmedi."}
                      </p>
                    </div>
                  </>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-4 italic">
                AI cevapları zamanla değişebilir; bu anlık bir ölçümdür.
              </p>
            </div>

            {/* Score + Business info */}
            <div className="grid md:grid-cols-3 gap-4">
              <div className={`rounded-2xl p-6 border ${scoreBg(result.score.total)} ring-4 ${scoreRing(result.score.total)}`}>
                <div className="text-xs text-muted-foreground mb-1">AI Visibility Skoru</div>
                <div className={`text-5xl font-bold ${scoreColor(result.score.total)}`}>
                  {result.score.total}<span className="text-2xl text-muted-foreground">/100</span>
                </div>
                <div className="text-xs text-muted-foreground mt-2">Deterministik formül</div>
              </div>
              <div className="rounded-2xl p-6 border bg-card md:col-span-2">
                <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground mb-2">
                  <MapPin className="w-3.5 h-3.5" /> Google verisi · canlı
                </div>
                <div className="font-semibold text-lg mb-1">{result.business.name}</div>
                <div className="text-sm text-muted-foreground mb-3">{result.business.address}</div>
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                    <span className="font-medium">{result.business.rating || "—"}</span>
                  </div>
                  <div className="text-muted-foreground">{result.business.reviewCount} yorum</div>
                  <div className="text-muted-foreground">· {result.business.sector}</div>
                </div>
              </div>
            </div>

            {/* Summary */}
            {result.summary && (
              <div className="bg-card border rounded-2xl p-6">
                <p className="text-foreground leading-relaxed">{result.summary}</p>
              </div>
            )}

            {/* GATED SECTIONS */}
            <div className="relative">
              <div className={emailUnlocked ? "" : "blur-md pointer-events-none select-none"}>
                {/* Score breakdown */}
                <div className="bg-card border rounded-2xl p-6 mb-6">
                  <h4 className="font-semibold text-lg mb-4 flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-primary" /> Skor Kırılımı
                  </h4>
                  <div className="space-y-3">
                    {Object.values(result.score.breakdown).map((b, i) => (
                      <div key={i}>
                        <div className="flex justify-between text-sm mb-1">
                          <span>{b.label}</span>
                          <span className="font-medium">{b.points}/{b.max}</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary rounded-full transition-all"
                            style={{ width: `${(b.points / b.max) * 100}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Competitors */}
                {result.competitors && result.competitors.length > 0 && (
                  <div className="bg-card border rounded-2xl p-6 mb-6">
                    <h4 className="font-semibold text-lg mb-4 flex items-center gap-2">
                      <Trophy className="w-5 h-5 text-primary" /> Bölgedeki Rakipleriniz
                    </h4>
                    <div className="space-y-2">
                      {result.competitors.map((c, i) => (
                        <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/40 border">
                          <div>
                            <div className="font-medium">{c.name}</div>
                            <div className="text-xs text-muted-foreground">{c.address}</div>
                          </div>
                          <div className="flex items-center gap-3 text-sm">
                            <div className="flex items-center gap-1">
                              <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                              <span className="font-medium">{c.rating}</span>
                            </div>
                            <span className="text-muted-foreground">{c.reviewCount} yorum</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Improvements */}
                {result.improvements && result.improvements.length > 0 && (
                  <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6">
                    <h4 className="font-semibold text-lg mb-4 flex items-center gap-2 text-amber-900">
                      <TrendingUp className="w-5 h-5" /> Somut İyileştirmeler
                    </h4>
                    <ul className="space-y-2">
                      {result.improvements.map((imp, i) => (
                        <li key={i} className="flex items-start gap-2 text-amber-900">
                          <ArrowRight className="w-4 h-4 mt-1 flex-shrink-0" />
                          <span>{imp}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {!emailUnlocked && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-card border-2 border-primary/30 rounded-2xl p-6 sm:p-8 shadow-xl max-w-md text-center">
                    <Lock className="w-8 h-8 text-primary mx-auto mb-3" />
                    <h4 className="font-bold text-lg mb-2">Detayları görmek için e-posta bırakın</h4>
                    <p className="text-sm text-muted-foreground mb-4">
                      Skor kırılımı, rakip tablosu ve size özel iyileştirme önerileri açılır. +3 ölçüm hakkı hediye.
                    </p>
                    <Button className="gradient-primary text-white w-full" onClick={() => setGateOpen(true)}>
                      Detayları Aç <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* CTA */}
            <div className="text-center pt-4">
              <Button size="lg" className="gradient-primary text-white px-8" onClick={() => navigate("/demo")}>
                Bunu düzeltmemi ister misin? Demoyu gör <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          </div>
        )}
      </div>

      <EmailGateModal
        open={gateOpen}
        onOpenChange={setGateOpen}
        onUnlock={saveLeadAfterEmail}
        source="ai_visibility_checker"
      />
      {/* mark localStorage flag after unlock */}
      {emailUnlocked && <input type="hidden" data-unlocked="1" />}
    </section>
  );
}

export default AIVisibilityChecker;
