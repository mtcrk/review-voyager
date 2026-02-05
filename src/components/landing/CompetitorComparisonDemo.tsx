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
  Eye,
  Star,
  MessageSquare,
  ArrowRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

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

const DEMO_COMPARISONS: Record<string, ComparisonResult> = {
  default: {
    yourBusiness: {
      name: "Sizin İşletmeniz",
      visibilityScore: 72,
      rating: 4.3,
      reviewCount: 156,
      responseRate: 87,
    },
    competitor: {
      name: "Rakip Kafe",
      visibilityScore: 65,
      rating: 4.1,
      reviewCount: 203,
      responseRate: 45,
    },
    insights: [
      "AI görünürlüğünüz rakibinizden 7 puan daha yüksek! 🎉",
      "Yanıt oranınız çok iyi! Bu AI sıralamalarınızı yükseltiyor.",
      "Yorum sayınızı artırarak rakibinizi geçebilirsiniz.",
    ],
  },
};

export function CompetitorComparisonDemo() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [competitorName, setCompetitorName] = useState("");
  const [showResult, setShowResult] = useState(false);
  const result = DEMO_COMPARISONS.default;

  const handleCompare = () => {
    if (competitorName.trim()) {
      setShowResult(true);
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
    <Card className="shadow-card border-2 border-primary/10">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-blue-100">
            <Users className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <CardTitle className="text-lg">
              {t("landing.competitorDemo.title", "Rakip Karşılaştırması")}
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              {t("landing.competitorDemo.subtitle", "AI görünürlüğünüzü rakiplerle karşılaştırın")}
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
            placeholder={t("landing.competitorDemo.placeholder", "Rakip işletme adı...")}
            onKeyDown={(e) => e.key === "Enter" && handleCompare()}
          />
          <Button
            onClick={handleCompare}
            disabled={!competitorName.trim()}
            size="icon"
          >
            <Search className="w-4 h-4" />
          </Button>
        </div>

        {/* Results */}
        {showResult && (
          <div className="space-y-4 animate-fade-in">
            {/* Comparison Table */}
            <div className="rounded-lg border overflow-hidden">
              <div className="grid grid-cols-3 bg-muted/50 px-4 py-2 text-sm font-medium">
                <div>{t("landing.competitorDemo.metric", "Metrik")}</div>
                <div className="text-center">{t("landing.competitorDemo.you", "Siz")}</div>
                <div className="text-center">{competitorName || "Rakip"}</div>
              </div>

              {/* AI Visibility Score */}
              <div className="grid grid-cols-3 px-4 py-3 border-t items-center">
                <div className="flex items-center gap-2 text-sm">
                  <Eye className="w-4 h-4 text-muted-foreground" />
                  AI Skoru
                </div>
                <div
                  className={`text-center font-semibold ${getComparisonColor(
                    result.yourBusiness.visibilityScore,
                    result.competitor.visibilityScore
                  )}`}
                >
                  <div className="flex items-center justify-center gap-1">
                    {result.yourBusiness.visibilityScore}
                    {getComparisonIcon(
                      result.yourBusiness.visibilityScore,
                      result.competitor.visibilityScore
                    )}
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
                <div
                  className={`text-center font-semibold ${getComparisonColor(
                    result.yourBusiness.rating,
                    result.competitor.rating
                  )}`}
                >
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
                <div
                  className={`text-center font-semibold ${getComparisonColor(
                    result.yourBusiness.reviewCount,
                    result.competitor.reviewCount
                  )}`}
                >
                  <div className="flex items-center justify-center gap-1">
                    {result.yourBusiness.reviewCount}
                    {getComparisonIcon(
                      result.yourBusiness.reviewCount,
                      result.competitor.reviewCount
                    )}
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
                <div
                  className={`text-center font-semibold ${getComparisonColor(
                    result.yourBusiness.responseRate,
                    result.competitor.responseRate
                  )}`}
                >
                  <div className="flex items-center justify-center gap-1">
                    %{result.yourBusiness.responseRate}
                    {getComparisonIcon(
                      result.yourBusiness.responseRate,
                      result.competitor.responseRate
                    )}
                  </div>
                </div>
                <div className="text-center font-semibold text-muted-foreground">
                  %{result.competitor.responseRate}
                </div>
              </div>
            </div>

            {/* Insights */}
            <div className="space-y-2">
              <p className="text-sm font-medium">
                {t("landing.competitorDemo.insights", "AI Önerileri:")}
              </p>
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

        {!showResult && (
          <p className="text-sm text-muted-foreground text-center py-4">
            {t(
              "landing.competitorDemo.hint",
              "Rakip işletme adı girerek AI görünürlük karşılaştırması yapın"
            )}
          </p>
        )}

        <Button
          onClick={() => navigate("/register")}
          className="w-full gradient-primary text-white"
        >
          {t("landing.competitorDemo.cta", "Gerçek Verilerle Karşılaştır")}
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </CardContent>
    </Card>
  );
}
