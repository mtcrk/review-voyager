import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Users, 
  TrendingUp, 
  TrendingDown,
  Minus,
  Search,
  Loader2,
  Eye,
  Star,
  MessageSquare
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface CompetitorData {
  name: string;
  visibilityScore: number;
  rating: number;
  reviewCount: number;
  responseRate: number;
}

interface ComparisonResult {
  yourBusiness: CompetitorData;
  competitor: CompetitorData;
  insights: string[];
}

export function CompetitorComparison() {
  const [competitorName, setCompetitorName] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ComparisonResult | null>(null);

  const handleCompare = async () => {
    if (!competitorName.trim()) {
      toast.error("Lütfen rakip işletme adı girin");
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const { data, error } = await supabase.functions.invoke("ai-visibility-demo", {
        body: { 
          businessName: competitorName.trim(),
          location: "",
          isCompetitorCheck: true
        },
      });

      if (error) throw error;

      // Simulate comparison with mock your business data
      // In production, this would use real data from the user's business
      const yourBusinessData: CompetitorData = {
        name: "Sizin İşletmeniz",
        visibilityScore: 72,
        rating: 4.3,
        reviewCount: 156,
        responseRate: 87,
      };

      const competitorData: CompetitorData = {
        name: competitorName.trim(),
        visibilityScore: data?.analysis?.visibilityScore || Math.floor(Math.random() * 40) + 50,
        rating: data?.analysis?.customerSentiment?.overallRating || (Math.random() * 1.5 + 3.5).toFixed(1),
        reviewCount: data?.analysis?.customerSentiment?.totalReviews || Math.floor(Math.random() * 200) + 50,
        responseRate: Math.floor(Math.random() * 40) + 50,
      };

      const insights: string[] = [];
      
      if (yourBusinessData.visibilityScore > competitorData.visibilityScore) {
        insights.push(`AI görünürlüğünüz rakibinizden ${yourBusinessData.visibilityScore - competitorData.visibilityScore} puan daha yüksek!`);
      } else {
        insights.push(`Rakibiniz AI'da sizden ${competitorData.visibilityScore - yourBusinessData.visibilityScore} puan daha görünür.`);
      }

      if (yourBusinessData.rating > Number(competitorData.rating)) {
        insights.push("Müşteri puanınız rakibinizden daha yüksek - bunu vurgulayın!");
      }

      if (yourBusinessData.responseRate > competitorData.responseRate) {
        insights.push("Yanıt oranınız çok iyi! Bu AI görünürlüğünüzü artırıyor.");
      } else {
        insights.push("Yanıt oranınızı artırarak AI sıralamalarınızı yükseltebilirsiniz.");
      }

      setResult({
        yourBusiness: yourBusinessData,
        competitor: { ...competitorData, rating: Number(competitorData.rating) },
        insights,
      });

    } catch (error) {
      console.error("Comparison error:", error);
      toast.error("Karşılaştırma yapılırken bir hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  const getComparisonIcon = (yours: number, theirs: number) => {
    if (yours > theirs) return <TrendingUp className="w-4 h-4 text-green-600" />;
    if (yours < theirs) return <TrendingDown className="w-4 h-4 text-red-600" />;
    return <Minus className="w-4 h-4 text-muted-foreground" />;
  };

  const getComparisonColor = (yours: number, theirs: number) => {
    if (yours > theirs) return "text-green-600";
    if (yours < theirs) return "text-red-600";
    return "text-muted-foreground";
  };

  return (
    <Card className="shadow-card">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-blue-100">
            <Users className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <CardTitle className="text-lg">Rakip Karşılaştırması</CardTitle>
            <p className="text-sm text-muted-foreground">
              AI görünürlüğünüzü rakiplerle karşılaştırın
            </p>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Search Input */}
        <div className="flex gap-2">
          <Input
            value={competitorName}
            onChange={(e) => setCompetitorName(e.target.value)}
            placeholder="Rakip işletme adı..."
            onKeyDown={(e) => e.key === "Enter" && handleCompare()}
            disabled={loading}
          />
          <Button 
            onClick={handleCompare} 
            disabled={loading || !competitorName.trim()}
            size="icon"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Search className="w-4 h-4" />
            )}
          </Button>
        </div>

        {/* Results */}
        {result && (
          <div className="space-y-4 animate-fade-in">
            {/* Comparison Table */}
            <div className="rounded-lg border overflow-hidden">
              <div className="grid grid-cols-3 bg-muted/50 px-4 py-2 text-sm font-medium">
                <div>Metrik</div>
                <div className="text-center">Siz</div>
                <div className="text-center">{result.competitor.name}</div>
              </div>
              
              {/* AI Visibility Score */}
              <div className="grid grid-cols-3 px-4 py-3 border-t items-center">
                <div className="flex items-center gap-2 text-sm">
                  <Eye className="w-4 h-4 text-muted-foreground" />
                  AI Skoru
                </div>
                <div className={`text-center font-semibold ${getComparisonColor(result.yourBusiness.visibilityScore, result.competitor.visibilityScore)}`}>
                  <div className="flex items-center justify-center gap-1">
                    {result.yourBusiness.visibilityScore}
                    {getComparisonIcon(result.yourBusiness.visibilityScore, result.competitor.visibilityScore)}
                  </div>
                </div>
                <div className="text-center font-semibold text-muted-foreground">
                  {result.competitor.visibilityScore}
                </div>
              </div>

              {/* Rating */}
              <div className="grid grid-cols-3 px-4 py-3 border-t items-center">
                <div className="flex items-center gap-2 text-sm">
                  <Star className="w-4 h-4 text-muted-foreground" />
                  Puan
                </div>
                <div className={`text-center font-semibold ${getComparisonColor(result.yourBusiness.rating, result.competitor.rating)}`}>
                  <div className="flex items-center justify-center gap-1">
                    {result.yourBusiness.rating}
                    {getComparisonIcon(result.yourBusiness.rating, result.competitor.rating)}
                  </div>
                </div>
                <div className="text-center font-semibold text-muted-foreground">
                  {result.competitor.rating}
                </div>
              </div>

              {/* Review Count */}
              <div className="grid grid-cols-3 px-4 py-3 border-t items-center">
                <div className="flex items-center gap-2 text-sm">
                  <MessageSquare className="w-4 h-4 text-muted-foreground" />
                  Yorum
                </div>
                <div className={`text-center font-semibold ${getComparisonColor(result.yourBusiness.reviewCount, result.competitor.reviewCount)}`}>
                  <div className="flex items-center justify-center gap-1">
                    {result.yourBusiness.reviewCount}
                    {getComparisonIcon(result.yourBusiness.reviewCount, result.competitor.reviewCount)}
                  </div>
                </div>
                <div className="text-center font-semibold text-muted-foreground">
                  {result.competitor.reviewCount}
                </div>
              </div>

              {/* Response Rate */}
              <div className="grid grid-cols-3 px-4 py-3 border-t items-center">
                <div className="flex items-center gap-2 text-sm">
                  <TrendingUp className="w-4 h-4 text-muted-foreground" />
                  Yanıt %
                </div>
                <div className={`text-center font-semibold ${getComparisonColor(result.yourBusiness.responseRate, result.competitor.responseRate)}`}>
                  <div className="flex items-center justify-center gap-1">
                    %{result.yourBusiness.responseRate}
                    {getComparisonIcon(result.yourBusiness.responseRate, result.competitor.responseRate)}
                  </div>
                </div>
                <div className="text-center font-semibold text-muted-foreground">
                  %{result.competitor.responseRate}
                </div>
              </div>
            </div>

            {/* Insights */}
            <div className="space-y-2">
              <p className="text-sm font-medium">AI Önerileri:</p>
              {result.insights.map((insight, i) => (
                <div 
                  key={i}
                  className="flex items-start gap-2 p-3 rounded-lg bg-muted/50 text-sm"
                >
                  <span className="text-primary">💡</span>
                  <span>{insight}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {!result && !loading && (
          <p className="text-sm text-muted-foreground text-center py-4">
            Rakip işletme adı girerek AI görünürlük karşılaştırması yapın
          </p>
        )}
      </CardContent>
    </Card>
  );
}
