import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useBusiness } from "@/contexts/BusinessContext";
import { supabase } from "@/integrations/supabase/client";
import { invokeAuthedFunction } from "@/lib/invokeAuthedFunction";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/hooks/use-toast";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { Radar, RefreshCw, Sparkles, CheckCircle2, XCircle, AlertTriangle } from "lucide-react";

const CHECKLIST_KEYS = [
  "gbp_description",
  "gbp_categories",
  "gbp_attributes",
  "gbp_photos",
  "reviews_response",
  "review_flow",
  "site_schema",
  "site_faq",
] as const;

type Snapshot = {
  id: string;
  business_id: string;
  created_at: string;
  score: number;
  ai_mentioned: boolean;
  ai_status: string | null;
  rating: number | null;
  review_count: number | null;
  query: string | null;
  answer_preview: string | null;
  competitors: any;
  breakdown: any;
  recommendations: any;
  business_name: string | null;
  sector_label: string | null;
  rating_median: number | null;
  review_median: number | null;
  mentioned_competitors: any;
  summary: string | null;
};

type Rec = { key: string; priority: "high" | "medium" | "low"; title: string; detail: string };

export default function AIVisibility() {
  const { t, i18n } = useTranslation();
  const { activeBusiness } = useBusiness();
  const qc = useQueryClient();
  const [running, setRunning] = useState(false);

  const businessId = activeBusiness?.id ?? null;

  const snapshotsQuery = useQuery({
    queryKey: ["ai-visibility-snapshots", businessId],
    enabled: !!businessId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ai_visibility_snapshots")
        .select("*")
        .eq("business_id", businessId!)
        .order("created_at", { ascending: false })
        .limit(30);
      if (error) throw error;
      return (data ?? []) as Snapshot[];
    },
  });

  const checklistQuery = useQuery({
    queryKey: ["ai-visibility-checklist", businessId],
    enabled: !!businessId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ai_visibility_checklist")
        .select("item_key, done")
        .eq("business_id", businessId!);
      if (error) throw error;
      const map: Record<string, boolean> = {};
      (data ?? []).forEach((r: any) => (map[r.item_key] = r.done));
      return map;
    },
  });

  const latest = snapshotsQuery.data?.[0] ?? null;
  const [cachedInfo, setCachedInfo] = useState<{ cached: boolean; next_available_at?: string } | null>(null);

  const trendData = useMemo(() => {
    if (!snapshotsQuery.data) return [];
    return [...snapshotsQuery.data]
      .reverse()
      .map((s) => ({
        date: new Date(s.created_at).toLocaleDateString(i18n.language, { month: "short", day: "numeric" }),
        score: s.score,
      }));
  }, [snapshotsQuery.data, i18n.language]);

  async function runCheck(force = false) {
    if (!businessId) return;
    setRunning(true);
    try {
      const res = await invokeAuthedFunction<{ cached: boolean; snapshot: Snapshot; next_available_at?: string }>(
        "ai-visibility-check",
        { body: { business_id: businessId, force } }
      );
      setCachedInfo({ cached: !!res?.cached, next_available_at: res?.next_available_at });
      await qc.invalidateQueries({ queryKey: ["ai-visibility-snapshots", businessId] });
    } catch (e: any) {
      toast({
        title: t("aiVisibilityPage.error", { msg: e?.message || "" }),
        variant: "destructive",
      });
    } finally {
      setRunning(false);
    }
  }

  async function toggleChecklist(key: string, done: boolean) {
    if (!businessId) return;
    const prev = checklistQuery.data ?? {};
    qc.setQueryData(["ai-visibility-checklist", businessId], { ...prev, [key]: done });
    const { error } = await supabase
      .from("ai_visibility_checklist")
      .upsert(
        { business_id: businessId, item_key: key, done },
        { onConflict: "business_id,item_key" }
      );
    if (error) {
      qc.setQueryData(["ai-visibility-checklist", businessId], prev);
      toast({ title: error.message, variant: "destructive" });
    }
  }

  useEffect(() => {
    setCachedInfo(null);
  }, [businessId]);

  if (!businessId) {
    return (
      <div className="p-6">
        <Card><CardContent className="p-6 text-sm text-muted-foreground">{t("aiVisibilityPage.noBusiness")}</CardContent></Card>
      </div>
    );
  }

  const recs: Rec[] = Array.isArray(latest?.recommendations) ? (latest!.recommendations as Rec[]) : [];
  const breakdown = (latest?.breakdown ?? {}) as Record<string, { points: number; max: number; label: string }>;

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold flex items-center gap-2">
            <Radar className="h-6 w-6 text-primary" />
            {t("aiVisibilityPage.title")}
          </h1>
          <p className="text-sm text-muted-foreground mt-1 max-w-2xl">{t("aiVisibilityPage.subtitle")}</p>
        </div>
        <Button onClick={() => runCheck(false)} disabled={running} className="gap-2">
          <RefreshCw className={`h-4 w-4 ${running ? "animate-spin" : ""}`} />
          {latest ? t("aiVisibilityPage.refresh") : t("aiVisibilityPage.runCheck")}
        </Button>
      </div>

      {snapshotsQuery.isLoading ? (
        <Skeleton className="h-40 w-full" />
      ) : !latest ? (
        <Card>
          <CardContent className="p-8 text-center space-y-4">
            <Radar className="h-10 w-10 mx-auto text-muted-foreground" />
            <p className="text-sm text-muted-foreground">{t("aiVisibilityPage.noSnapshot")}</p>
            <Button onClick={() => runCheck(false)} disabled={running}>
              {running ? t("aiVisibilityPage.running") : t("aiVisibilityPage.runCheck")}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Score + AI Hero */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle className="text-sm text-muted-foreground font-normal">
                  {t("aiVisibilityPage.scoreLabel")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-bold text-primary">{latest.score}</span>
                  <span className="text-sm text-muted-foreground">{t("aiVisibilityPage.outOf")}</span>
                </div>
                <Progress value={latest.score} />
                {cachedInfo?.cached && (
                  <Badge variant="outline" className="text-xs">{t("aiVisibilityPage.cachedBadge")}</Badge>
                )}
                {cachedInfo?.next_available_at && (
                  <p className="text-xs text-muted-foreground">
                    {t("aiVisibilityPage.nextAvailable", {
                      time: new Date(cachedInfo.next_available_at).toLocaleString(i18n.language),
                    })}
                  </p>
                )}
                <div className="space-y-2 pt-2">
                  <p className="text-xs font-medium text-muted-foreground">{t("aiVisibilityPage.breakdown")}</p>
                  {Object.entries(breakdown).map(([k, v]) => (
                    <div key={k} className="text-xs">
                      <div className="flex justify-between mb-1">
                        <span>{v.label}</span>
                        <span className="tabular-nums">{v.points}/{v.max}</span>
                      </div>
                      <Progress value={(v.points / v.max) * 100} className="h-1" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2 bg-gradient-to-br from-primary/5 to-transparent border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Sparkles className="h-4 w-4 text-primary" />
                  {t("aiVisibilityPage.aiHeroTitle")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-xs text-muted-foreground">{t("aiVisibilityPage.aiHeroQuery")}</p>
                  <p className="text-sm font-medium">{latest.query || "—"}</p>
                </div>
                <div className="flex items-center gap-2">
                  {latest.ai_status === "unavailable" ? (
                    <Badge variant="outline" className="gap-1">
                      <AlertTriangle className="h-3 w-3" /> {t("aiVisibilityPage.aiUnavailable")}
                    </Badge>
                  ) : latest.ai_mentioned ? (
                    <Badge className="gap-1 bg-green-600 hover:bg-green-600">
                      <CheckCircle2 className="h-3 w-3" /> {t("aiVisibilityPage.aiMentioned")}
                    </Badge>
                  ) : (
                    <Badge variant="destructive" className="gap-1">
                      <XCircle className="h-3 w-3" /> {t("aiVisibilityPage.aiNotMentioned")}
                    </Badge>
                  )}
                </div>
                {Array.isArray(latest.mentioned_competitors) && latest.mentioned_competitors.length > 0 && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">{t("aiVisibilityPage.mentionedCompetitors")}</p>
                    <div className="flex flex-wrap gap-1">
                      {(latest.mentioned_competitors as string[]).map((c) => (
                        <Badge key={c} variant="secondary" className="text-xs">{c}</Badge>
                      ))}
                    </div>
                  </div>
                )}
                {latest.answer_preview && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">{t("aiVisibilityPage.answerPreview")}</p>
                    <p className="text-xs bg-muted p-3 rounded whitespace-pre-wrap max-h-40 overflow-y-auto">
                      {latest.answer_preview}
                    </p>
                  </div>
                )}
                {latest.summary && (
                  <p className="text-sm text-muted-foreground italic">{latest.summary}</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Trend */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{t("aiVisibilityPage.trendTitle")}</CardTitle>
            </CardHeader>
            <CardContent>
              {trendData.length < 2 ? (
                <p className="text-sm text-muted-foreground">{t("aiVisibilityPage.trendEmpty")}</p>
              ) : (
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={trendData}>
                      <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                      <XAxis dataKey="date" fontSize={12} />
                      <YAxis domain={[0, 100]} fontSize={12} />
                      <Tooltip />
                      <Line type="monotone" dataKey="score" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 3 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recommendations */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{t("aiVisibilityPage.recommendationsTitle")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {recs.length === 0 ? (
                <p className="text-sm text-muted-foreground">{t("aiVisibilityPage.recommendationsEmpty")}</p>
              ) : (
                recs.map((r) => (
                  <div key={r.key} className="flex gap-3 p-3 border rounded-lg">
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-sm">{r.title}</p>
                        <Badge
                          variant={r.priority === "high" ? "destructive" : r.priority === "medium" ? "default" : "secondary"}
                          className="text-xs"
                        >
                          {t(`aiVisibilityPage.priority${r.priority === "high" ? "High" : r.priority === "medium" ? "Medium" : "Low"}`)}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{r.detail}</p>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </>
      )}

      {/* Checklist */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t("aiVisibilityPage.checklistTitle")}</CardTitle>
          <p className="text-xs text-muted-foreground">{t("aiVisibilityPage.checklistSubtitle")}</p>
        </CardHeader>
        <CardContent className="space-y-2">
          {CHECKLIST_KEYS.map((k) => {
            const done = !!checklistQuery.data?.[k];
            return (
              <label key={k} className="flex items-start gap-3 p-2 hover:bg-muted/50 rounded cursor-pointer">
                <Checkbox checked={done} onCheckedChange={(v) => toggleChecklist(k, !!v)} className="mt-0.5" />
                <span className={`text-sm ${done ? "line-through text-muted-foreground" : ""}`}>
                  {t(`aiVisibilityPage.checklistItems.${k}`)}
                </span>
              </label>
            );
          })}
        </CardContent>
      </Card>

      <p className="text-xs text-muted-foreground text-center pt-2">{t("aiVisibilityPage.footnote")}</p>
    </div>
  );
}