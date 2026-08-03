import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Tags, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useBusiness } from "@/contexts/BusinessContext";
import { sentimentTone, useCiTopics } from "@/hooks/useReviewAnalysis";
import {
  useAnalysisCoverage,
  useTopicMonthly,
  useTopicStats,
} from "@/hooks/useTopicAnalytics";
import { cn } from "@/lib/utils";

/** Minimum analysed reviews before a top-3 ranking is meaningful. */
const MIN_ANALYZED = 20;

const toneChip = (tone: "positive" | "negative" | "neutral") =>
  tone === "positive"
    ? "bg-success/10 text-success border-success/30"
    : tone === "negative"
      ? "bg-destructive/10 text-destructive border-destructive/30"
      : "bg-muted text-muted-foreground border-border";

export function TopicAnalyticsCard() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { activeBusiness } = useBusiness();
  const businessId = activeBusiness?.id;

  // Last 90 days ≈ 3 monthly buckets, same RPC as the Konu Analizi page.
  const { data: rows, isLoading } = useTopicMonthly(businessId, 3);
  const { data: coverage } = useAnalysisCoverage(businessId);
  const stats = useTopicStats(rows, 3);
  const { labelOf } = useCiTopics();

  const analyzed = coverage?.window_analyzed_reviews ?? 0;
  const top = stats.priority.slice(0, 3);
  const lowData = analyzed < MIN_ANALYZED || top.every((s) => s.lowConfidence);

  return (
    <Card className="shadow-card">
      <CardHeader className="pb-3 border-b">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-primary/10">
            <Tags className="h-5 w-5 text-primary" />
          </div>
          <div>
            <CardTitle className="text-lg">{t("dashboard.topicCard.title")}</CardTitle>
            <p className="text-sm text-muted-foreground">
              {t("dashboard.topicCard.subtitle")}
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-4 space-y-4">
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-6 w-2/3" />
            <Skeleton className="h-6 w-1/2" />
          </div>
        ) : lowData || top.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            {t("dashboard.topicCard.lowData")}
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {top.map((s) => {
              const tone = sentimentTone(s.avgSentiment);
              return (
                <Badge
                  key={s.key}
                  variant="outline"
                  className={cn("font-medium gap-1.5", toneChip(tone))}
                >
                  {labelOf(s.key)}
                  <span className="opacity-70">
                    {s.avgSentiment > 0
                      ? `+${s.avgSentiment.toFixed(2)}`
                      : s.avgSentiment.toFixed(2)}
                  </span>
                </Badge>
              );
            })}
          </div>
        )}
        <Button
          variant="outline"
          size="sm"
          className="w-full"
          onClick={() => navigate("/konu-analizi")}
        >
          {t("dashboard.topicCard.viewAll")}
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </CardContent>
    </Card>
  );
}