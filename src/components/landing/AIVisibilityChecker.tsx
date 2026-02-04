import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Eye, Sparkles, CheckCircle, AlertTriangle, ArrowRight, Loader2, 
  TrendingUp, Lightbulb, MapPin, Star, Users, MessageSquare, Trophy,
  Building2
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Competitor {
  name: string;
  rating: number;
  comparison: string;
}

interface FeaturedReview {
  category: string;
  summary: string;
}

interface AnalysisResult {
  visibilityScore: number;
  sector: string;
  localRanking: {
    position: number;
    totalCompetitors: number;
    query: string;
  };
  customerSentiment: {
    overallRating: number;
    totalReviews: number;
    highlights: string[];
    concerns: string[];
  };
  featuredReviews: FeaturedReview[];
  competitors: Competitor[];
  aiPerception: string;
  strengths: string[];
  improvements: string[];
  recommendation: string;
}

export function AIVisibilityChecker() {
  const [businessName, setBusinessName] = useState("");
  const [location, setLocation] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [analyzedName, setAnalyzedName] = useState("");
  const [analyzedLocation, setAnalyzedLocation] = useState("");

  const handleAnalyze = async () => {
    if (!businessName.trim()) {
      toast.error("Lütfen işletme adı girin");
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const { data, error } = await supabase.functions.invoke("ai-visibility-demo", {
        body: { 
          businessName: businessName.trim(),
          location: location.trim() || undefined
        },
      });

      if (error) {
        throw new Error(error.message || "Analiz başarısız");
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      if (data?.analysis) {
        setResult(data.analysis);
        setAnalyzedName(data.businessName);
        setAnalyzedLocation(data.location || "");
      }
    } catch (error) {
      console.error("Analysis error:", error);
      toast.error(error instanceof Error ? error.message : "Analiz sırasında bir hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 75) return "text-green-600";
    if (score >= 50) return "text-amber-600";
    return "text-red-600";
  };

  const getScoreLabel = (score: number) => {
    if (score >= 75) return "İyi";
    if (score >= 50) return "Orta";
    return "Geliştirilebilir";
  };

  const getScoreBg = (score: number) => {
    if (score >= 75) return "bg-green-100";
    if (score >= 50) return "bg-amber-100";
    return "bg-red-100";
  };

  const getRankingBadge = (position: number) => {
    if (position === 1) return "🥇";
    if (position === 2) return "🥈";
    if (position === 3) return "🥉";
    return `#${position}`;
  };

  return (
    <section id="visibility-checker" className="container mx-auto px-6 py-20">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-4">
            <Sparkles className="w-4 h-4" />
            Ücretsiz Demo
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            AI Sizi Nasıl Görüyor?
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            İşletme adınızı ve konumunuzu girin, AI asistanların sizi nasıl algıladığını görün
          </p>
        </div>

        {/* Input Section */}
        <div className="bg-card border border-border rounded-2xl p-8 shadow-lg mb-8">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <Input
                  type="text"
                  placeholder="İşletme adınız"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAnalyze()}
                  className="h-14 text-lg px-6"
                  disabled={loading}
                />
              </div>
              <div className="sm:w-64">
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Konum"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleAnalyze()}
                    className="h-14 text-lg pl-12 pr-6"
                    disabled={loading}
                  />
                </div>
              </div>
            </div>
            <Button
              onClick={handleAnalyze}
              disabled={loading || !businessName.trim()}
              className="h-14 px-8 text-lg gradient-primary text-white w-full sm:w-auto sm:self-end"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Analiz Ediliyor...
                </>
              ) : (
                <>
                  <Eye className="w-5 h-5 mr-2" />
                  Analiz Et
                </>
              )}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-3 text-center">
            Bu demo amaçlı bir analizdir. Gerçek sonuçlar için hesap oluşturun.
          </p>
        </div>

        {/* Results Section */}
        {result && (
          <div className="animate-fade-in space-y-6">
            {/* Main Score & Ranking Card */}
            <div className="bg-card border border-border rounded-2xl p-8 shadow-lg">
              <div className="flex flex-col lg:flex-row items-start gap-8">
                {/* Score Circle */}
                <div className="flex-shrink-0 flex flex-col items-center">
                  <div className={`w-32 h-32 rounded-full ${getScoreBg(result.visibilityScore)} flex items-center justify-center`}>
                    <div className="text-center">
                      <div className={`text-4xl font-bold ${getScoreColor(result.visibilityScore)}`}>
                        {result.visibilityScore}
                      </div>
                      <div className={`text-sm font-medium ${getScoreColor(result.visibilityScore)}`}>
                        {getScoreLabel(result.visibilityScore)}
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
                    <Building2 className="w-4 h-4" />
                    <span>{result.sector}</span>
                  </div>
                </div>

                {/* Analysis Text */}
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-foreground mb-2">
                    "{analyzedName}" için AI Visibility Skoru
                  </h3>
                  {analyzedLocation && (
                    <div className="flex items-center gap-2 text-muted-foreground mb-3">
                      <MapPin className="w-4 h-4" />
                      <span>{analyzedLocation}</span>
                    </div>
                  )}
                  <p className="text-muted-foreground mb-4">
                    {result.aiPerception}
                  </p>
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
                    <Lightbulb className="w-4 h-4" />
                    {result.recommendation}
                  </div>
                </div>
              </div>
            </div>

            {/* Local Ranking & Customer Sentiment */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Local Ranking */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Trophy className="w-5 h-5 text-blue-600" />
                  <h4 className="font-semibold text-blue-800">Konum Bazlı Sıralama</h4>
                </div>
                <div className="flex items-center gap-4 mb-4">
                  <div className="text-4xl font-bold text-blue-700">
                    {getRankingBadge(result.localRanking.position)}
                  </div>
                  <div>
                    <div className="text-sm text-blue-600">
                      {result.localRanking.totalCompetitors} rakip arasında
                    </div>
                    <div className="text-xs text-blue-500 mt-1">
                      "{result.localRanking.query}"
                    </div>
                  </div>
                </div>
                <p className="text-sm text-blue-700">
                  AI asistanlar "{result.localRanking.query}" gibi sorgularda sizi {result.localRanking.position}. sırada gösteriyor.
                </p>
              </div>

              {/* Customer Sentiment */}
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 rounded-xl p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Star className="w-5 h-5 text-purple-600" />
                  <h4 className="font-semibold text-purple-800">Müşteri Memnuniyeti</h4>
                </div>
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex items-center gap-1">
                    <span className="text-3xl font-bold text-purple-700">{result.customerSentiment.overallRating}</span>
                    <Star className="w-6 h-6 text-yellow-500 fill-yellow-500" />
                  </div>
                  <div className="text-sm text-purple-600">
                    {result.customerSentiment.totalReviews} yorum
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="text-xs text-purple-600 font-medium">Öne Çıkanlar:</div>
                  <div className="flex flex-wrap gap-2">
                    {result.customerSentiment.highlights.map((highlight, index) => (
                      <span key={index} className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs">
                        {highlight}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Featured Reviews */}
            <div className="bg-card border border-border rounded-xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <MessageSquare className="w-5 h-5 text-foreground" />
                <h4 className="font-semibold text-foreground">AI'ın Yorumlardan Çıkardığı Özetler</h4>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                {result.featuredReviews.map((review, index) => (
                  <div key={index} className="bg-muted/50 rounded-lg p-4">
                    <div className="font-medium text-foreground mb-1">{review.category}</div>
                    <p className="text-sm text-muted-foreground">{review.summary}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Competitors */}
            <div className="bg-card border border-border rounded-xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <Users className="w-5 h-5 text-foreground" />
                <h4 className="font-semibold text-foreground">Rakip Karşılaştırması</h4>
              </div>
              <div className="space-y-3">
                {result.competitors.map((competitor, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="font-medium text-foreground">{competitor.name}</span>
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                        <span className="text-sm text-muted-foreground">{competitor.rating}</span>
                      </div>
                    </div>
                    <span className="text-sm text-muted-foreground">{competitor.comparison}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Strengths & Improvements */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Strengths */}
              <div className="bg-green-50 border border-green-200 rounded-xl p-6">
                <div className="flex items-center gap-2 mb-4">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <h4 className="font-semibold text-green-800">Güçlü Yönler</h4>
                </div>
                <ul className="space-y-2">
                  {result.strengths.map((strength, index) => (
                    <li key={index} className="flex items-start gap-2 text-green-700">
                      <TrendingUp className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      <span>{strength}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Improvements */}
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
                <div className="flex items-center gap-2 mb-4">
                  <AlertTriangle className="w-5 h-5 text-amber-600" />
                  <h4 className="font-semibold text-amber-800">Geliştirme Alanları</h4>
                </div>
                <ul className="space-y-2">
                  {result.improvements.map((improvement, index) => (
                    <li key={index} className="flex items-start gap-2 text-amber-700">
                      <ArrowRight className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      <span>{improvement}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* CTA */}
            <div className="text-center pt-4">
              <Button 
                size="lg" 
                className="gradient-primary text-white px-8"
                onClick={() => window.location.href = "/onboarding"}
              >
                Tam Analiz İçin Kayıt Ol
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
