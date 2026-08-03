import { useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RTooltip,
  Legend,
} from "recharts";
import { ArrowDownRight, ArrowRight, ArrowUpRight, ChevronRight, Info } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useBusiness } from "@/contexts/BusinessContext";
import { IntelligenceTabs } from "@/components/intelligence/IntelligenceTabs";
import { useCiTopics } from "@/hooks/useReviewAnalysis";
import {
  buildSeries,
  useAnalysisCoverage,
  useTopicExcerpts,
  useTopicMonthly,
  useTopicStats,
  type PeriodStat,
} from "@/hooks/useTopicAnalytics";
import { cn } from "@/lib/utils";

const SERIES_COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--success))",
  "hsl(var(--warning))",
  "hsl(var(--destructive))",
  "hsl(var(--muted-foreground))",
  "hsl(var(--accent-foreground))",
];

function toneClass(score: number) {
  if (score <= -0.15) return "text-destructive";
  if (score >= 0.15) return "text-success";
  return "text-muted-foreground";
}

function DeltaBadge({ stat }: { stat: PeriodStat }) {
  const { t } = useTranslation();
  if (stat.prevMentions === 0) {
    return (
      <Badge variant="outline" className="text-xs text-muted-foreground">
        {t("topicAnalytics.noBaseline")}
      </Badge>
    );
  }
  const d = stat.sentimentDelta;
  const Icon = d > 0.05 ? ArrowUpRight : d < -0.05 ? ArrowDownRight : ArrowRight;
  const cls = d > 0.05 ? "text-success" : d < -0.05 ? "text-destructive" : "text-muted-foreground";
  return (
    <span className={cn("inline-flex items-center gap-1 text-xs font-medium", cls)}>
      <Icon className="h-3.5 w-3.5" />
      {d > 0 ? "+" : ""}
      {d.toFixed(2)}
      {stat.lowConfidence && (
        <Badge variant="outline" className="ml-1 text-[10px] text-muted-foreground">
          {t("topicAnalytics.lowConfidence")}
        </Badge>
      )}
    </span>
  );
}

export default function TopicAnalytics() {
  const { t, i18n } = useTranslation();
  const { activeBusiness } = useBusiness();
  const businessId = activeBusiness?.id;
  const [months, setMonths] = useState(12);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [plotted, setPlotted] = useState<string[]>([]);

  const { data: rows, isLoading } = useTopicMonthly(businessId, months);
  const { data: coverage } = useAnalysisCoverage(businessId);
  const { labelOf } = useCiTopics();
  const stats = useTopicStats(rows, months);
  const { data: excerpts, isLoading: excerptsLoading } = useTopicExcerpts(
    businessId,
    selectedTopic ?? undefined,
  );

  const categoryLabel = (c: string) =>
    t(`topicAnalytics.categories.${c}`, { defaultValue: c });

  const activeSeriesKeys = useMemo(() => {
    if (plotted.length > 0) return plotted;
    return stats.categoryStats.slice(0, 4).map((c) => c.key);
  }, [plotted, stats.categoryStats]);

  const chartData = useMemo(
    () => buildSeries(rows, stats.axis, "category", activeSeriesKeys),
    [rows, stats.axis, activeSeriesKeys],
  );

  const topicsOfCategory = useMemo(
    () =>
      selectedCategory
        ? stats.topicStats.filter((s) => s.category === selectedCategory && s.mentions > 0)
        : [],
    [stats.topicStats, selectedCategory],
  );

  const coveragePct = coverage && coverage.total_reviews
    ? Math.round((coverage.analyzed_reviews / coverage.total_reviews) * 100)
    : null;

  const monthFmt = (m: string) =>
    new Date(m).toLocaleDateString(i18n.language, { month: "short", year: "2-digit" });

  const toggleSeries = (key: string) =>
    setPlotted((prev) => {
      const base = prev.length ? prev : stats.categoryStats.slice(0, 4).map((c) => c.key);
      return base.includes(key) ? base.filter((k) => k !== key) : [...base, key];
    });

  return (
    <div className="space-y-6">
      <Helmet>
        <title>{t("topicAnalytics.metaTitle")}</title>
        <meta name="description" content={t("topicAnalytics.metaDescription")} />
      </Helmet>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{t("topicAnalytics.title")}</h1>
          <p className="text-sm text-muted-foreground">{t("topicAnalytics.subtitle")}</p>
        </div>
        <div className="flex items-center gap-2">
          <IntelligenceTabs />
          <Select value={String(months)} onValueChange={(v) => setMonths(Number(v))}>
            <SelectTrigger className="w-[130px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="6">{t("topicAnalytics.window", { count: 6 })}</SelectItem>
              <SelectItem value="12">{t("topicAnalytics.window", { count: 12 })}</SelectItem>
              <SelectItem value="24">{t("topicAnalytics.window", { count: 24 })}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Coverage note */}
      {coverage && coveragePct !== null && coveragePct < 100 && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription className="space-y-2">
            <span>
              {t("topicAnalytics.coverage", {
                pct: coveragePct,
                analyzed: coverage.analyzed_reviews,
                total: coverage.total_reviews,
              })}
            </span>
            <Progress value={coveragePct} className="h-1.5" />
          </AlertDescription>
        </Alert>
      )}

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
      ) : stats.categoryStats.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-sm text-muted-foreground">
            {t("topicAnalytics.empty")}
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Category rollup */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {stats.categoryStats.map((c) => (
              <button
                key={c.key}
                type="button"
                onClick={() => {
                  setSelectedCategory(c.key);
                  setSelectedTopic(null);
                }}
                className={cn(
                  "text-left rounded-xl border bg-card p-4 transition-colors hover:bg-muted/40",
                  selectedCategory === c.key && "border-primary/40 bg-primary/5",
                )}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{categoryLabel(c.key)}</span>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className={cn("mt-2 text-2xl font-semibold", toneClass(c.avgSentiment))}>
                  {c.avgSentiment.toFixed(2)}
                </div>
                <div className="mt-1 flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    {t("topicAnalytics.mentions", { count: c.mentions })}
                  </span>
                  <DeltaBadge stat={c} />
                </div>
              </button>
            ))}
          </div>

          {/* Trend chart */}
          <Card>
            <CardHeader className="space-y-3">
              <CardTitle className="text-base">
                {t("topicAnalytics.trendTitle", { count: months })}
              </CardTitle>
              <div className="flex flex-wrap gap-2">
                {stats.categoryStats.map((c) => {
                  const active = activeSeriesKeys.includes(c.key);
                  return (
                    <button
                      key={c.key}
                      type="button"
                      onClick={() => toggleSeries(c.key)}
                      className={cn(
                        "rounded-full border px-3 py-1 text-xs transition-colors",
                        active
                          ? "border-primary/30 bg-primary/10 text-primary"
                          : "text-muted-foreground hover:bg-muted",
                      )}
                    >
                      {categoryLabel(c.key)}
                    </button>
                  );
                })}
              </div>
            </CardHeader>
            <CardContent className="h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis
                    dataKey="month"
                    tickFormatter={monthFmt}
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                  />
                  <YAxis
                    domain={[-1, 1]}
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                  />
                  <RTooltip
                    labelFormatter={(v) => monthFmt(String(v))}
                    formatter={(value: any, name: any) => [value, categoryLabel(String(name))]}
                    contentStyle={{
                      background: "hsl(var(--popover))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: 8,
                      color: "hsl(var(--popover-foreground))",
                    }}
                  />
                  <Legend formatter={(v) => categoryLabel(String(v))} />
                  {activeSeriesKeys.map((k, i) => (
                    <Line
                      key={k}
                      type="monotone"
                      dataKey={k}
                      stroke={SERIES_COLORS[i % SERIES_COLORS.length]}
                      strokeWidth={2}
                      dot={false}
                      connectNulls
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Drill-down */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  {selectedCategory
                    ? t("topicAnalytics.topicsIn", { category: categoryLabel(selectedCategory) })
                    : t("topicAnalytics.pickCategory")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {!selectedCategory && (
                  <p className="text-sm text-muted-foreground">
                    {t("topicAnalytics.pickCategoryHint")}
                  </p>
                )}
                {topicsOfCategory.map((s) => (
                  <button
                    key={s.key}
                    type="button"
                    onClick={() => setSelectedTopic(s.key)}
                    className={cn(
                      "flex w-full items-center justify-between rounded-lg border p-3 text-left transition-colors hover:bg-muted/40",
                      selectedTopic === s.key && "border-primary/40 bg-primary/5",
                    )}
                  >
                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium">{labelOf(s.key)}</div>
                      <div className="text-xs text-muted-foreground">
                        {t("topicAnalytics.mentions", { count: s.mentions })} ·{" "}
                        {t("topicAnalytics.negativeShare", {
                          pct: Math.round(s.negativeShare * 100),
                        })}
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <span className={cn("text-sm font-semibold", toneClass(s.avgSentiment))}>
                        {s.avgSentiment.toFixed(2)}
                      </span>
                      <DeltaBadge stat={s} />
                    </div>
                  </button>
                ))}

                {selectedTopic && (
                  <div className="mt-4 space-y-2 border-t pt-4">
                    <h4 className="text-sm font-semibold">
                      {t("topicAnalytics.examples", { topic: labelOf(selectedTopic) })}
                    </h4>
                    {excerptsLoading && <Skeleton className="h-16 rounded-lg" />}
                    {!excerptsLoading && (excerpts ?? []).length === 0 && (
                      <p className="text-sm text-muted-foreground">
                        {t("topicAnalytics.noExamples")}
                      </p>
                    )}
                    {(excerpts ?? []).map((e: any, i: number) => (
                      <div key={i} className="rounded-lg border bg-muted/30 p-3">
                        <p className="text-sm italic">"{e.excerpt}"</p>
                        <div className="mt-2 flex items-center justify-between text-xs">
                          <span className={toneClass(Number(e.sentiment))}>
                            {Number(e.sentiment).toFixed(2)}
                          </span>
                          <Button asChild variant="link" size="sm" className="h-auto p-0 text-xs">
                            <Link to={`/reviews/${e.review_id}`}>
                              {t("topicAnalytics.openReview")}
                            </Link>
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Priority panel */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">{t("topicAnalytics.priorityTitle")}</CardTitle>
                <p className="text-xs text-muted-foreground">
                  {t("topicAnalytics.priorityFormula")}
                </p>
              </CardHeader>
              <CardContent className="space-y-3">
                {stats.priority.slice(0, 8).map((p) => (
                  <div key={p.key} className="rounded-lg border p-3">
                    <div className="flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <span className="text-sm font-medium">{labelOf(p.key)}</span>
                        {p.isDecisionDriver && (
                          <Badge variant="outline" className="ml-2 text-[10px]">
                            {t("topicAnalytics.driver")}
                          </Badge>
                        )}
                        {p.lowConfidence && (
                          <Badge variant="outline" className="ml-2 text-[10px] text-muted-foreground">
                            {t("topicAnalytics.lowConfidence")}
                          </Badge>
                        )}
                      </div>
                      <span className="shrink-0 text-sm font-semibold">
                        {(p.score * 100).toFixed(0)}
                      </span>
                    </div>
                    <div className="mt-2 grid grid-cols-3 gap-2 text-xs text-muted-foreground">
                      <span>
                        {t("topicAnalytics.volume")}: {(p.volume * 100).toFixed(0)}%
                      </span>
                      <span>
                        {t("topicAnalytics.negativity")}: {(p.negativity * 100).toFixed(0)}%
                      </span>
                      <span>
                        {t("topicAnalytics.driverWeight")}: {p.driver ? "1.0" : "0.0"}
                      </span>
                    </div>
                    <Progress value={p.score * 100} className="mt-2 h-1.5" />
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}