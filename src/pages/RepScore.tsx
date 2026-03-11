import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Trophy, TrendingUp, TrendingDown, Info } from "lucide-react";
import { useBusiness } from "@/contexts/BusinessContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { calculateRepScore, COMPONENT_INFO, RepScoreBreakdown, ReviewData } from "@/lib/repScore";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

export default function RepScore() {
  const { activeBusiness } = useBusiness();

  const { data: reviews = [], isLoading } = useQuery({
    queryKey: ['reviews-for-repscore', activeBusiness?.id],
    queryFn: async () => {
      if (!activeBusiness) return [];
      const { data, error } = await supabase
        .from('reviews')
        .select('rating, text, platform, posted_at, status, sentiment, approved_reply, replied_at')
        .eq('business_id', activeBusiness.id);
      if (error) throw error;
      return (data || []) as ReviewData[];
    },
    enabled: !!activeBusiness,
  });

  const score = calculateRepScore(reviews);

  // Circular gauge
  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const progress = score.totalScore / 1000;
  const strokeDashoffset = circumference * (1 - progress);

  const components = (Object.entries(score.breakdown) as [keyof RepScoreBreakdown, number][])
    .map(([key, value]) => ({
      key,
      value,
      ...COMPONENT_INFO[key],
      percentage: Math.round((value / COMPONENT_INFO[key].maxScore) * 100),
    }))
    .sort((a, b) => b.percentage - a.percentage);

  // Recommendations
  const recommendations = components
    .filter(c => c.percentage < 70)
    .sort((a, b) => a.percentage - b.percentage)
    .slice(0, 4)
    .map(comp => {
      const recs: Record<string, string> = {
        reviewSentiment: 'Müşteri deneyimini iyileştirerek yıldız ortalamanızı yükseltin.',
        reviewVolume: 'Daha fazla müşteriden yorum talep edin. Minimum 500 yorum hedefleyin.',
        reviewSpread: 'Google dışında Booking, TripAdvisor gibi platformlarda da yorum toplayın.',
        reviewRecency: 'Düzenli yorum toplama stratejisi oluşturun. Son 90 gün kritik.',
        reviewResponse: 'Tüm olumsuz yorumlara %100, olumlu yorumlara en az %20 yanıt verin.',
        reviewQuality: 'Müşterilerden detaylı yorum bırakmalarını teşvik edin (2-3 cümle).',
        aiVisibility: 'Pozitif duygu oranını artırmak için müşteri memnuniyetine odaklanın.',
      };
      return { ...comp, recommendation: recs[comp.key] };
    });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto p-8 space-y-8">
        {/* Header */}
        <div>
          <div className="flex items-center gap-3 mb-1">
            <Trophy className="h-7 w-7 text-primary" />
            <h1 className="text-3xl font-semibold text-foreground">Rep Score</h1>
          </div>
          <p className="text-muted-foreground">
            Tüm platformlardan tek bir itibar puanı — 7 bileşen, 1000 puan üzerinden
          </p>
        </div>

        {/* Score Hero */}
        <Card className="shadow-card overflow-hidden">
          <div className="bg-gradient-to-br from-primary/5 via-background to-primary/10 p-8">
            <div className="flex flex-col md:flex-row items-center gap-8">
              {/* Gauge */}
              <div className="relative flex-shrink-0">
                <svg width="200" height="200" viewBox="0 0 200 200">
                  <circle
                    cx="100" cy="100" r={radius}
                    fill="none"
                    stroke="hsl(var(--muted))"
                    strokeWidth="12"
                    strokeLinecap="round"
                  />
                  <circle
                    cx="100" cy="100" r={radius}
                    fill="none"
                    stroke={score.gradeColor}
                    strokeWidth="12"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    transform="rotate(-90 100 100)"
                    className="transition-all duration-1000 ease-out"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-5xl font-bold text-foreground">{score.totalScore}</span>
                  <span className="text-sm text-muted-foreground mt-1">/ 1000</span>
                </div>
              </div>

              {/* Grade Info */}
              <div className="flex-1 text-center md:text-left space-y-3">
                <div className="flex items-center gap-3 justify-center md:justify-start">
                  <Badge
                    className="text-2xl font-bold px-4 py-2 border-0"
                    style={{ backgroundColor: score.gradeColor + '20', color: score.gradeColor }}
                  >
                    {score.grade}
                  </Badge>
                  <span className="text-xl font-semibold" style={{ color: score.gradeColor }}>
                    {score.gradeLabel}
                  </span>
                </div>
                <p className="text-muted-foreground max-w-md">
                  {score.totalScore >= 750
                    ? 'İtibarınız mükemmel seviyede! Bu performansı korumaya devam edin.'
                    : score.totalScore >= 500
                    ? 'İyi bir itibar puanınız var. Birkaç alanı iyileştirerek daha da yükselebilirsiniz.'
                    : score.totalScore > 0
                    ? 'İtibar puanınızda iyileştirme fırsatları var. Aşağıdaki önerileri inceleyin.'
                    : 'Henüz yeterli veri yok. Yorum toplamaya başlayın!'}
                </p>
                <div className="flex gap-4 text-sm text-muted-foreground justify-center md:justify-start">
                  <span>{reviews.length} toplam yorum</span>
                  <span>•</span>
                  <span>{new Set(reviews.map(r => r.platform)).size} platform</span>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Components Grid */}
        <div>
          <h2 className="text-xl font-semibold text-foreground mb-4">Bileşen Analizi</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {components.map((comp) => (
              <Card key={comp.key} className="shadow-card hover:shadow-md transition-all">
                <CardContent className="p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{comp.icon}</span>
                      <span className="font-medium text-sm text-foreground">{comp.label}</span>
                    </div>
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="h-3.5 w-3.5 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="max-w-[200px] text-xs">{comp.tip}</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{comp.value} / {comp.maxScore}</span>
                      <span className="font-semibold text-foreground">{comp.percentage}%</span>
                    </div>
                    <Progress value={comp.percentage} className="h-2" />
                  </div>
                  <div className="flex items-center gap-1.5 text-xs">
                    {comp.percentage >= 70 ? (
                      <>
                        <TrendingUp className="h-3 w-3 text-emerald-500" />
                        <span className="text-emerald-600">İyi performans</span>
                      </>
                    ) : (
                      <>
                        <TrendingDown className="h-3 w-3 text-amber-500" />
                        <span className="text-amber-600">İyileştirme alanı</span>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Recommendations */}
        {recommendations.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold text-foreground mb-4">İyileştirme Önerileri</h2>
            <div className="space-y-3">
              {recommendations.map((rec, i) => (
                <Card key={rec.key} className="shadow-card">
                  <CardContent className="p-5 flex items-start gap-4">
                    <div
                      className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
                      style={{ backgroundColor: score.gradeColor + '15', color: score.gradeColor }}
                    >
                      {i + 1}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span>{rec.icon}</span>
                        <span className="font-medium text-foreground">{rec.label}</span>
                        <Badge variant="outline" className="text-xs">{rec.percentage}%</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{rec.recommendation}</p>
                    </div>
                    <div className="flex-shrink-0 text-right">
                      <span className="text-xs text-muted-foreground">Potansiyel</span>
                      <p className="font-semibold text-primary text-sm">+{rec.maxScore - rec.value} puan</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Score Formula */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="text-base">Nasıl Hesaplanır?</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
              {components.map((comp) => (
                <div key={comp.key} className="flex items-center gap-2 text-muted-foreground">
                  <span>{comp.icon}</span>
                  <span>{comp.label}: <strong className="text-foreground">{comp.maxScore}</strong></span>
                </div>
              ))}
              <div className="flex items-center gap-2 font-semibold text-foreground col-span-2 md:col-span-4 pt-2 border-t">
                <span>🏆</span>
                <span>Toplam: 1000 puan</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
