import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Trophy, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { RepScoreResult, COMPONENT_INFO, RepScoreBreakdown } from "@/lib/repScore";

interface RepScoreWidgetProps {
  score: RepScoreResult;
}

export function RepScoreWidget({ score }: RepScoreWidgetProps) {
  const navigate = useNavigate();

  // Circular gauge SVG
  const radius = 58;
  const circumference = 2 * Math.PI * radius;
  const progress = score.totalScore / 1000;
  const strokeDashoffset = circumference * (1 - progress);

  // Top 3 weakest components for improvement tips
  const sortedComponents = (Object.entries(score.breakdown) as [keyof RepScoreBreakdown, number][])
    .map(([key, value]) => ({
      key,
      value,
      ...COMPONENT_INFO[key],
      percentage: Math.round((value / COMPONENT_INFO[key].maxScore) * 100),
    }))
    .sort((a, b) => a.percentage - b.percentage);

  const weakest = sortedComponents.slice(0, 2);

  return (
    <Card className="shadow-card hover:shadow-md transition-all">
      <CardHeader className="pb-3 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10">
              <Trophy className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">Rep Score</CardTitle>
              <p className="text-sm text-muted-foreground">İtibar Puanınız</p>
            </div>
          </div>
          <Badge 
            className="text-sm font-bold px-3 py-1 border-0"
            style={{ backgroundColor: score.gradeColor + '20', color: score.gradeColor }}
          >
            {score.grade}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="flex flex-col items-center gap-4">
          {/* Circular Gauge */}
          <div className="relative">
            <svg width="140" height="140" viewBox="0 0 140 140">
              {/* Background circle */}
              <circle
                cx="70" cy="70" r={radius}
                fill="none"
                stroke="hsl(var(--muted))"
                strokeWidth="10"
                strokeLinecap="round"
              />
              {/* Progress circle */}
              <circle
                cx="70" cy="70" r={radius}
                fill="none"
                stroke={score.gradeColor}
                strokeWidth="10"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                transform="rotate(-90 70 70)"
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-bold text-foreground">{score.totalScore}</span>
              <span className="text-xs text-muted-foreground">/ 1000</span>
            </div>
          </div>

          <p className="text-sm font-medium" style={{ color: score.gradeColor }}>
            {score.gradeLabel}
          </p>

          {/* Weakest areas */}
          {weakest.length > 0 && score.totalScore > 0 && (
            <div className="w-full space-y-2 mt-2">
              <p className="text-xs font-medium text-muted-foreground">İyileştirme Alanları</p>
              {weakest.map((comp) => (
                <div key={comp.key} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">{comp.icon} {comp.label}</span>
                    <span className="font-medium text-foreground">{comp.percentage}%</span>
                  </div>
                  <Progress value={comp.percentage} className="h-1.5" />
                </div>
              ))}
            </div>
          )}

          <Button 
            variant="outline" 
            size="sm" 
            className="w-full mt-2"
            onClick={() => navigate('/rep-score')}
          >
            Detaylı Analiz <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
