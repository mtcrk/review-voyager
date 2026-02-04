import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, Sparkles, CheckCircle, AlertTriangle, ArrowRight, Loader2, TrendingUp, Lightbulb } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface AnalysisResult {
  visibilityScore: number;
  strengths: string[];
  improvements: string[];
  aiPerception: string;
  recommendation: string;
}

export function AIVisibilityChecker() {
  const [businessName, setBusinessName] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [analyzedName, setAnalyzedName] = useState("");

  const handleAnalyze = async () => {
    if (!businessName.trim()) {
      toast.error("Lütfen işletme adı girin");
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const { data, error } = await supabase.functions.invoke("ai-visibility-demo", {
        body: { businessName: businessName.trim() },
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

  return (
    <section id="visibility-checker" className="container mx-auto px-6 py-20">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-4">
            <Sparkles className="w-4 h-4" />
            Ücretsiz Demo
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            AI Sizi Nasıl Görüyor?
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            İşletme adınızı girin, AI asistanların sizi nasıl algıladığını görün
          </p>
        </div>

        {/* Input Section */}
        <div className="bg-card border border-border rounded-2xl p-8 shadow-lg mb-8">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                type="text"
                placeholder="İşletme adınızı girin... (örn: Cafe Botanica)"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAnalyze()}
                className="h-14 text-lg px-6"
                disabled={loading}
              />
            </div>
            <Button
              onClick={handleAnalyze}
              disabled={loading || !businessName.trim()}
              className="h-14 px-8 text-lg gradient-primary text-white"
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
            {/* Score Card */}
            <div className="bg-card border border-border rounded-2xl p-8 shadow-lg">
              <div className="flex flex-col md:flex-row items-center gap-8">
                {/* Score Circle */}
                <div className="flex-shrink-0">
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
                </div>

                {/* Analysis Text */}
                <div className="flex-1 text-center md:text-left">
                  <h3 className="text-2xl font-bold text-foreground mb-2">
                    "{analyzedName}" için AI Visibility Skoru
                  </h3>
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
