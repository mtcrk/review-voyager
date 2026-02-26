import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Eye, TrendingUp, Star, MessageSquare, CheckCircle, ArrowUp } from "lucide-react";

// Demo data for landing page - no real database queries
const DEMO_STATS: StatsData = {
  totalReviews: 156,
  averageRating: 4.3,
  repliedPercentage: 87,
  positivePercentage: 78,
  visibilityScore: 82,
  trend: 8,
};

interface StatsData {
  totalReviews: number;
  averageRating: number;
  repliedPercentage: number;
  positivePercentage: number;
  visibilityScore: number;
  trend: number;
}

export function AIVisibilityDemo() {
  const { t } = useTranslation();
  const [stats, setStats] = useState<StatsData>(DEMO_STATS);
  const [loading, setLoading] = useState(true);
  const [animatedScore, setAnimatedScore] = useState(0);

  useEffect(() => {
    // Landing page always uses demo data
    setStats(DEMO_STATS);
    setLoading(false);
  }, []);

  // Animate the score
  useEffect(() => {
    if (!loading && stats.visibilityScore > 0) {
      const duration = 2000;
      const steps = 60;
      const increment = stats.visibilityScore / steps;
      let current = 0;

      const timer = setInterval(() => {
        current += increment;
        if (current >= stats.visibilityScore) {
          setAnimatedScore(stats.visibilityScore);
          clearInterval(timer);
        } else {
          setAnimatedScore(Math.floor(current));
        }
      }, duration / steps);

      return () => clearInterval(timer);
    }
  }, [loading, stats.visibilityScore]);

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-amber-600";
    return "text-red-600";
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return t('landing.visibilityDemo.excellent', 'Excellent');
    if (score >= 60) return t('landing.visibilityDemo.good', 'Good');
    if (score >= 40) return t('landing.visibilityDemo.medium', 'Medium');
    return t('landing.visibilityDemo.needsImprovement', 'Needs Improvement');
  };

  return (
    <div className="bg-gradient-to-br from-primary/5 to-blue-500/5 border border-primary/10 rounded-2xl p-8">
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-4">
          <Eye className="w-10 h-10 text-primary" />
        </div>
        
        {loading ? (
          <div className="animate-pulse">
            <div className="h-12 w-20 bg-muted rounded mx-auto mb-2" />
            <div className="h-4 w-32 bg-muted rounded mx-auto" />
          </div>
        ) : (
          <>
            <div className={`text-5xl font-bold mb-1 ${getScoreColor(stats.visibilityScore)}`}>
              {animatedScore}
            </div>
            <div className="text-sm text-muted-foreground mb-2">AI Visibility Score</div>
            <div className={`inline-flex items-center gap-1 text-sm font-medium ${getScoreColor(stats.visibilityScore)}`}>
              <span>{getScoreLabel(stats.visibilityScore)}</span>
            </div>
          </>
        )}
        
        {!loading && stats.trend > 0 && (
          <div className="flex items-center justify-center gap-2 text-green-600 text-sm font-medium mt-3">
            <TrendingUp className="w-4 h-4" />
            <span>+{stats.trend}% {t('landing.visibilityDemo.thisMonth', 'this month')}</span>
          </div>
        )}
      </div>

      {/* Score Breakdown */}
      {!loading && (
        <div className="space-y-3 pt-4 border-t border-primary/10">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Star className="w-4 h-4" />
              <span>{t('landing.visibilityDemo.averageRating', 'Average Rating')}</span>
            </div>
            <span className="font-medium text-foreground">{stats.averageRating}/5</span>
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <MessageSquare className="w-4 h-4" />
              <span>{t('landing.visibilityDemo.responseRate', 'Response Rate')}</span>
            </div>
            <span className="font-medium text-foreground">%{stats.repliedPercentage}</span>
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <CheckCircle className="w-4 h-4" />
              <span>{t('landing.visibilityDemo.positiveReviews', 'Positive Reviews')}</span>
            </div>
            <span className="font-medium text-foreground">%{stats.positivePercentage}</span>
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <ArrowUp className="w-4 h-4" />
              <span>{t('landing.visibilityDemo.totalReviews', 'Total Reviews')}</span>
            </div>
            <span className="font-medium text-foreground">{stats.totalReviews}</span>
          </div>
        </div>
      )}

      {/* Live Badge */}
      <div className="mt-4 pt-4 border-t border-primary/10 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-100 text-green-700 text-xs font-medium">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          {t('landing.visibilityDemo.liveData', 'Live Data')}
        </div>
      </div>
    </div>
  );
}
