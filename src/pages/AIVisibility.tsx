import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { useBusiness } from "@/contexts/BusinessContext";
import { supabase } from "@/integrations/supabase/client";
import { invokeAuthedFunction } from "@/lib/invokeAuthedFunction";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip as UITooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
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
import {
  Radar,
  RefreshCw,
  Sparkles,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ArrowRight,
  Star,
  Users,
  Loader2,
} from "lucide-react";
import { Search } from "lucide-react";

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

const GBP_KEYS = new Set(["gbp_description", "gbp_categories", "gbp_attributes", "gbp_photos"]);

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
  ai_checks?: any;
};

type Rec = { key: string; priority: "high" | "medium" | "low"; title: string; detail: string };
type Competitor = { name: string; rating: number; reviewCount: number; address?: string | null };

type EngineName = "gemini" | "chatgpt" | "perplexity";
type EngineStatus = "ok" | "unavailable" | "not_configured";
type EngineCheck = {
  engine: EngineName;
  status: EngineStatus;
  mentioned: boolean;
  mentionedCompetitors?: string[];
  answerPreview?: string;
  citations?: string[];
  grounded?: boolean;
};

const ENGINE_LABELS: Record<EngineName, string> = {
  gemini: "Gemini",
  chatgpt: "ChatGPT",
  perplexity: "Perplexity",
};

const normalizeName = (s: string) =>
  (s || "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

export default function AIVisibility() {
  const { t, i18n } = useTranslation();
  const { activeBusiness } = useBusiness();
  const qc = useQueryClient();
  const [running, setRunning] = useState(false);
  const [runError, setRunError] = useState<string | null>(null);
  const [runStage, setRunStage] = useState(0);
  const [openEngine, setOpenEngine] = useState<EngineName | null>(null);
  const autoRanRef = useRef<string | null>(null);
  const [gapLoading, setGapLoading] = useState(false);
  const [gapError, setGapError] = useState<string | null>(null);
  const [gapResult, setGapResult] = useState<{ text: string; citations: string[]; generated_at: string } | null>(null);

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

  const reviewFunnelQuery = useQuery({
    queryKey: ["ai-visibility-review-funnel", businessId],
    enabled: !!businessId,
    queryFn: async () => {
      const [settingsRes, contactsRes] = await Promise.all([
        supabase
          .from("review_request_settings")
          .select("enabled, review_link")
          .eq("business_id", businessId!)
          .maybeSingle(),
        supabase
          .from("review_request_contacts")
          .select("status, clicked_at, consent")
          .eq("business_id", businessId!),
      ]);
      const settings = settingsRes.data as { enabled: boolean; review_link: string | null } | null;
      const contacts = (contactsRes.data ?? []) as { status: string; clicked_at: string | null; consent: boolean }[];
      const total = contacts.length;
      const consented = contacts.filter((c) => c.consent).length;
      const sent = contacts.filter((c) => ["sent", "reminded", "clicked"].includes(c.status)).length;
      const clicked = contacts.filter((c) => !!c.clicked_at).length;
      const setupDone = !!(settings && !!settings.review_link);
      return {
        setupDone,
        enabled: !!settings?.enabled,
        total,
        consented,
        sent,
        clicked,
        clickRate: sent > 0 ? Math.round((clicked / sent) * 100) : 0,
      };
    },
  });

  const replyStatsQuery = useQuery({
    queryKey: ["ai-visibility-reply-stats", businessId],
    enabled: !!businessId,
    queryFn: async () => {
      const since = new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString();
      const { data, error } = await supabase
        .from("reviews")
        .select("id, status, approved_reply, posted_at")
        .eq("business_id", businessId!)
        .gte("posted_at", since);
      if (error) throw error;
      const rows = data ?? [];
      const total = rows.length;
      const replied = rows.filter(
        (r: any) => !!r.approved_reply || r.status === "replied" || r.status === "approved"
      ).length;
      return {
        total,
        replied,
        rate: total > 0 ? Math.round((replied / total) * 100) : 0,
        hasData: total > 0,
      };
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
    setRunError(null);
    setRunStage(0);
    const stageTimer = setInterval(() => {
      setRunStage((s) => (s < 2 ? s + 1 : s));
    }, 1800);
    try {
      const res = await invokeAuthedFunction<{ cached: boolean; snapshot: Snapshot; next_available_at?: string }>(
        "ai-visibility-check",
        { body: { business_id: businessId, force } }
      );
      setCachedInfo({ cached: !!res?.cached, next_available_at: res?.next_available_at });
      await qc.invalidateQueries({ queryKey: ["ai-visibility-snapshots", businessId] });
    } catch (e: any) {
      const msg = e?.message || "";
      setRunError(msg);
      toast({
        title: t("aiVisibilityPage.error", { msg }),
        variant: "destructive",
      });
    } finally {
      clearInterval(stageTimer);
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
    setRunError(null);
    autoRanRef.current = null;
  }, [businessId]);

  // Auto-run first measurement when no snapshot exists
  useEffect(() => {
    if (!businessId) return;
    if (snapshotsQuery.isLoading) return;
    if (snapshotsQuery.data && snapshotsQuery.data.length > 0) return;
    if (running) return;
    if (autoRanRef.current === businessId) return;
    autoRanRef.current = businessId;
    runCheck(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [businessId, snapshotsQuery.isLoading, snapshotsQuery.data]);

  if (!businessId) {
    return (
      <div className="p-6">
        <Card><CardContent className="p-6 text-sm text-muted-foreground">{t("aiVisibilityPage.noBusiness")}</CardContent></Card>
      </div>
    );
  }

  const recs: Rec[] = Array.isArray(latest?.recommendations) ? (latest!.recommendations as Rec[]) : [];
  const breakdown = (latest?.breakdown ?? {}) as Record<string, { points: number; max: number; label: string }>;
  const competitors: Competitor[] = Array.isArray(latest?.competitors) ? (latest!.competitors as Competitor[]) : [];
  const mentionedComp: string[] = Array.isArray(latest?.mentioned_competitors)
    ? (latest!.mentioned_competitors as string[])
    : [];
  const mentionedSet = new Set(mentionedComp.map(normalizeName));

  const replyStats = replyStatsQuery.data;
  const funnel = reviewFunnelQuery.data;

  // Stepper
  const step1Done = !!funnel?.setupDone;
  const step2Done = !!(funnel && funnel.total > 0);
  const step3Done = !!(funnel && funnel.sent > 0);
  const step4Done = !!(funnel && funnel.clicked > 0);
  const allDone = step1Done && step2Done && step3Done && step4Done;
  const steps = [
    {
      key: 1,
      done: step1Done,
      title: t("aiVisibilityPage.actionSteps.step1Title"),
      live: step1Done ? t("aiVisibilityPage.actionSteps.step1Done") : "—",
      cta: t("aiVisibilityPage.actionSteps.step1Cta"),
    },
    {
      key: 2,
      done: step2Done,
      title: t("aiVisibilityPage.actionSteps.step2Title"),
      live: t("aiVisibilityPage.actionSteps.step2Live", { count: funnel?.total ?? 0 }),
      cta: t("aiVisibilityPage.actionSteps.step2Cta"),
    },
    {
      key: 3,
      done: step3Done,
      title: t("aiVisibilityPage.actionSteps.step3Title"),
      live: t("aiVisibilityPage.actionSteps.step3Live", { sent: funnel?.sent ?? 0 }),
      cta: t("aiVisibilityPage.actionSteps.step3Cta"),
    },
    {
      key: 4,
      done: step4Done,
      title: t("aiVisibilityPage.actionSteps.step4Title"),
      live: t("aiVisibilityPage.actionSteps.step4Live", {
        count: funnel?.clicked ?? 0,
        rate: funnel?.clickRate ?? 0,
      }),
      cta: t("aiVisibilityPage.actionSteps.step4Cta"),
    },
  ];
  const activeIdx = steps.findIndex((s) => !s.done);
  const target = "/email?tab=review-request";

  // Competitor stats
  const compReviewMedian = (() => {
    if (competitors.length === 0) return 0;
    const arr = [...competitors.map((c) => c.reviewCount)].sort((a, b) => a - b);
    const mid = Math.floor(arr.length / 2);
    return arr.length % 2 ? arr[mid] : Math.round((arr[mid - 1] + arr[mid]) / 2);
  })();

  const measuring = running && !latest;
  const stageLabels = [
    t("aiVisibilityPage.stages.stage1"),
    t("aiVisibilityPage.stages.stage2"),
    t("aiVisibilityPage.stages.stage3"),
  ];

  const aiChecks: EngineCheck[] = Array.isArray(latest?.ai_checks)
    ? (latest!.ai_checks as EngineCheck[])
    : [];
  const measuredEngines = aiChecks.filter((c) => c.status === "ok");
  const mentionedEngines = measuredEngines.filter((c) => c.mentioned);

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
        {latest && (
          <Button onClick={() => runCheck(false)} disabled={running} className="gap-2">
            <RefreshCw className={`h-4 w-4 ${running ? "animate-spin" : ""}`} />
            {t("aiVisibilityPage.refresh")}
          </Button>
        )}
      </div>

      {snapshotsQuery.isLoading ? (
        <Skeleton className="h-40 w-full" />
      ) : !latest ? (
        <Card>
          <CardContent className="p-8 space-y-5">
            {runError ? (
              <div className="text-center space-y-4">
                <AlertTriangle className="h-10 w-10 mx-auto text-destructive" />
                <p className="text-sm text-muted-foreground">
                  {t("aiVisibilityPage.autoRunFailed", { msg: runError })}
                </p>
                <Button onClick={() => runCheck(false)} disabled={running}>
                  {t("aiVisibilityPage.tryAgain")}
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Loader2 className="h-5 w-5 animate-spin text-primary" />
                  <p className="text-sm font-medium">{t("aiVisibilityPage.firstMeasureRunning")}</p>
                </div>
                <div className="space-y-2">
                  {stageLabels.map((label, idx) => {
                    const state = idx < runStage ? "done" : idx === runStage ? "active" : "pending";
                    return (
                      <div key={idx} className="flex items-center gap-3 text-sm">
                        {state === "done" ? (
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                        ) : state === "active" ? (
                          <Loader2 className="h-4 w-4 animate-spin text-primary" />
                        ) : (
                          <div className="h-4 w-4 rounded-full border border-muted-foreground/30" />
                        )}
                        <span className={state === "pending" ? "text-muted-foreground" : ""}>{label}</span>
                      </div>
                    );
                  })}
                </div>
                <p className="text-xs text-muted-foreground">{t("aiVisibilityPage.firstMeasureHint")}</p>
              </div>
            )}
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
                {/* Engine summary + chips */}
                {aiChecks.length > 0 ? (
                  <div className="space-y-2">
                    <p className="text-sm font-medium">
                      {measuredEngines.length > 0
                        ? t("aiVisibilityPage.aiEngines.summary", {
                            measured: measuredEngines.length,
                            mentioned: mentionedEngines.length,
                          })
                        : t("aiVisibilityPage.aiUnavailable")}
                    </p>
                    <TooltipProvider>
                      <div className="flex flex-wrap gap-2">
                        {aiChecks.map((c) => {
                          const label = ENGINE_LABELS[c.engine] ?? c.engine;
                          const isOpen = openEngine === c.engine;
                          const notConfigured = c.status === "not_configured";
                          const unavailable = c.status === "unavailable";
                          const chipCls = notConfigured
                            ? "opacity-50 cursor-default"
                            : unavailable
                              ? "border-amber-400 text-amber-700"
                              : c.mentioned
                                ? "bg-green-600 hover:bg-green-600 text-white"
                                : "border-red-300 text-red-700";
                          const tooltip = notConfigured
                            ? t("aiVisibilityPage.aiEngines.notConfigured")
                            : unavailable
                              ? t("aiVisibilityPage.aiEngines.unavailable")
                              : c.engine === "chatgpt" && c.grounded === false
                                ? t("aiVisibilityPage.aiEngines.webless")
                                : c.mentioned
                                  ? t("aiVisibilityPage.aiEngines.mentionedShort")
                                  : t("aiVisibilityPage.aiEngines.notMentionedShort");
                          const chip = (
                            <button
                              type="button"
                              disabled={notConfigured || unavailable || !c.answerPreview}
                              onClick={() => setOpenEngine(isOpen ? null : c.engine)}
                              className="inline-flex"
                            >
                              <Badge
                                variant={c.mentioned && c.status === "ok" ? "default" : "outline"}
                                className={`gap-1 ${chipCls}`}
                              >
                                {notConfigured ? (
                                  <XCircle className="h-3 w-3" />
                                ) : unavailable ? (
                                  <AlertTriangle className="h-3 w-3" />
                                ) : c.mentioned ? (
                                  <CheckCircle2 className="h-3 w-3" />
                                ) : (
                                  <XCircle className="h-3 w-3" />
                                )}
                                {label}
                                {c.engine === "chatgpt" && c.grounded === false && (
                                  <span className="text-[10px] ml-1">*</span>
                                )}
                              </Badge>
                            </button>
                          );
                          return (
                            <UITooltip key={c.engine}>
                              <TooltipTrigger asChild>{chip}</TooltipTrigger>
                              <TooltipContent>{tooltip}</TooltipContent>
                            </UITooltip>
                          );
                        })}
                      </div>
                    </TooltipProvider>
                    {openEngine && (() => {
                      const c = aiChecks.find((x) => x.engine === openEngine);
                      if (!c || !c.answerPreview) return null;
                      return (
                        <div className="space-y-2 rounded-lg border bg-muted/50 p-3">
                          <p className="text-xs font-medium">
                            {ENGINE_LABELS[c.engine]} · {t("aiVisibilityPage.answerPreview")}
                          </p>
                          <p className="text-xs whitespace-pre-wrap max-h-40 overflow-y-auto">
                            {c.answerPreview}
                          </p>
                          {c.citations && c.citations.length > 0 && (
                            <p className="text-xs text-muted-foreground">
                              <span className="font-medium text-foreground">
                                {t("aiVisibilityPage.aiEngines.sources")}:
                              </span>{" "}
                              {c.citations.join(", ")}
                            </p>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                ) : (
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
                )}
                {mentionedComp.length > 0 && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">{t("aiVisibilityPage.mentionedCompetitors")}</p>
                    <div className="flex flex-wrap gap-1">
                      {mentionedComp.map((c) => (
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

          {/* Competitors */}
          {competitors.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Users className="h-4 w-4 text-primary" />
                  {t("aiVisibilityPage.competitorsTitle")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-xs text-muted-foreground border-b">
                        <th className="py-2 pr-3 font-medium">{t("aiVisibilityPage.competitorsCols.name")}</th>
                        <th className="py-2 px-3 font-medium text-right">{t("aiVisibilityPage.competitorsCols.rating")}</th>
                        <th className="py-2 pl-3 font-medium text-right">{t("aiVisibilityPage.competitorsCols.reviews")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b bg-primary/5">
                        <td className="py-2 pr-3 font-semibold">
                          {latest.business_name || activeBusiness?.name}
                          <Badge className="ml-2 text-[10px]" variant="default">
                            {t("aiVisibilityPage.competitorsYou")}
                          </Badge>
                        </td>
                        <td className="py-2 px-3 text-right tabular-nums">
                          {latest.rating ? (
                            <span className="inline-flex items-center gap-1">
                              <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                              {Number(latest.rating).toFixed(1)}
                            </span>
                          ) : "—"}
                        </td>
                        <td className="py-2 pl-3 text-right tabular-nums">{latest.review_count ?? "—"}</td>
                      </tr>
                      {competitors.map((c, idx) => {
                        const isMentioned = mentionedSet.has(normalizeName(c.name));
                        return (
                          <tr key={idx} className="border-b last:border-0">
                            <td className="py-2 pr-3">
                              {c.name}
                              {isMentioned && (
                                <Badge variant="secondary" className="ml-2 text-[10px] gap-1">
                                  <Sparkles className="h-2.5 w-2.5" />
                                  {t("aiVisibilityPage.competitorsAiBadge")}
                                </Badge>
                              )}
                            </td>
                            <td className="py-2 px-3 text-right tabular-nums">
                              <span className="inline-flex items-center gap-1">
                                <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                                {c.rating.toFixed(1)}
                              </span>
                            </td>
                            <td className="py-2 pl-3 text-right tabular-nums">{c.reviewCount}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                {compReviewMedian > 0 && (
                  <p className="text-xs text-muted-foreground">
                    {t("aiVisibilityPage.competitorsMedian", {
                      median: compReviewMedian,
                      you: latest.review_count ?? 0,
                    })}
                  </p>
                )}
              </CardContent>
            </Card>
          )}

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
        </>
      )}

      {/* Action Steps — connected horizontal stepper */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t("aiVisibilityPage.actionSteps.title")}</CardTitle>
          <p className="text-xs text-muted-foreground">{t("aiVisibilityPage.actionSteps.context")}</p>
        </CardHeader>
        <CardContent>
          {allDone ? (
            <div className="flex items-center justify-between gap-3 rounded-lg border border-green-600/40 bg-green-500/5 p-3">
              <div className="flex items-center gap-3 text-sm">
                <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0" />
                <span>
                  {t("aiVisibilityPage.actionSteps.summary", {
                    total: funnel?.total ?? 0,
                    sent: funnel?.sent ?? 0,
                    clicked: funnel?.clicked ?? 0,
                    rate: funnel?.clickRate ?? 0,
                  })}
                </span>
              </div>
              <Button asChild variant="ghost" size="sm" className="gap-1 shrink-0">
                <Link to={target}>
                  {t("aiVisibilityPage.actionSteps.manage")}
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="relative">
                <div className="hidden md:flex items-center justify-between">
                  {steps.map((s, idx) => {
                    const isActive = idx === activeIdx;
                    return (
                      <div key={s.key} className="flex-1 flex items-center">
                        <div className="flex flex-col items-center gap-2 min-w-0 flex-1">
                          <div
                            className={`h-9 w-9 rounded-full flex items-center justify-center text-sm font-semibold border-2 transition ${
                              s.done
                                ? "bg-green-600 border-green-600 text-white"
                                : isActive
                                  ? "bg-primary border-primary text-primary-foreground shadow-md"
                                  : "bg-background border-muted text-muted-foreground"
                            }`}
                          >
                            {s.done ? <CheckCircle2 className="h-5 w-5" /> : s.key}
                          </div>
                          <p
                            className={`text-xs text-center leading-tight px-1 ${
                              isActive ? "font-semibold" : s.done ? "" : "text-muted-foreground"
                            }`}
                          >
                            {s.title}
                          </p>
                          <p className="text-[11px] text-muted-foreground text-center leading-tight">{s.live}</p>
                        </div>
                        {idx < steps.length - 1 && (
                          <div
                            className={`h-0.5 flex-1 mx-1 -mt-10 ${
                              s.done ? "bg-green-600" : "bg-muted"
                            }`}
                          />
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Mobile vertical */}
                <div className="md:hidden space-y-3">
                  {steps.map((s, idx) => {
                    const isActive = idx === activeIdx;
                    return (
                      <div key={s.key} className="flex items-start gap-3">
                        <div
                          className={`h-8 w-8 shrink-0 rounded-full flex items-center justify-center text-sm font-semibold border-2 ${
                            s.done
                              ? "bg-green-600 border-green-600 text-white"
                              : isActive
                                ? "bg-primary border-primary text-primary-foreground"
                                : "bg-background border-muted text-muted-foreground"
                          }`}
                        >
                          {s.done ? <CheckCircle2 className="h-4 w-4" /> : s.key}
                        </div>
                        <div className="flex-1">
                          <p className={`text-sm ${isActive ? "font-semibold" : ""}`}>{s.title}</p>
                          <p className="text-xs text-muted-foreground">{s.live}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {activeIdx !== -1 && (
                <div className="flex justify-center pt-2">
                  <Button asChild size="sm" className="gap-1">
                    <Link to={target}>
                      {steps[activeIdx].cta}
                      <ArrowRight className="h-3 w-3" />
                    </Link>
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recommendations */}
      {latest && (
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
      )}

      {/* Checklist — grouped */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t("aiVisibilityPage.checklistTitle")}</CardTitle>
          <p className="text-xs text-muted-foreground">{t("aiVisibilityPage.checklistSubtitle")}</p>
        </CardHeader>
        <CardContent className="space-y-5">
          <TooltipProvider>
            {/* Google Business Profile group */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {t("aiVisibilityPage.checklistGroups.gbp")}
                </p>
                <Badge variant="outline" className="text-[10px]">
                  {t("aiVisibilityPage.checklistGroups.gbpSoon")}
                </Badge>
              </div>
              {CHECKLIST_KEYS.filter((k) => GBP_KEYS.has(k)).map((k) => {
                const done = !!checklistQuery.data?.[k];
                return (
                  <label
                    key={k}
                    className="flex items-start gap-3 p-2 rounded hover:bg-muted/50 cursor-pointer"
                  >
                    <Checkbox
                      checked={done}
                      onCheckedChange={(v) => toggleChecklist(k, !!v)}
                      className="mt-0.5"
                    />
                    <span className={`text-sm ${done ? "line-through text-muted-foreground" : ""}`}>
                      {t(`aiVisibilityPage.checklistItems.${k}`)}
                    </span>
                  </label>
                );
              })}
            </div>

            {/* Reviews group */}
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {t("aiVisibilityPage.checklistGroups.reviews")}
              </p>
              {(["reviews_response", "review_flow"] as const).map((k) => {
                let autoDone = false;
                let autoBadge: string | null = null;
                let inlineHint: React.ReactNode = null;

                if (k === "review_flow") {
                  autoDone = !!funnel && (funnel.enabled || funnel.sent > 0);
                } else if (k === "reviews_response" && replyStats?.hasData) {
                  if (replyStats.rate >= 90) {
                    autoDone = true;
                    autoBadge = t("aiVisibilityPage.checklistAuto.responseRate", { rate: replyStats.rate });
                  } else {
                    inlineHint = (
                      <span className="text-xs text-muted-foreground ml-2">
                        {t("aiVisibilityPage.checklistAuto.responseCurrent", { rate: replyStats.rate })}{" "}
                        <Link to="/reviews?status=not_replied" className="text-primary underline">
                          {t("aiVisibilityPage.checklistAuto.responseCta")}
                        </Link>
                      </span>
                    );
                  }
                }

                const done = autoDone || !!checklistQuery.data?.[k];
                const row = (
                  <label
                    key={k}
                    className={`flex items-start gap-3 p-2 rounded ${
                      autoDone ? "opacity-90 cursor-default" : "hover:bg-muted/50 cursor-pointer"
                    }`}
                  >
                    <Checkbox
                      checked={done}
                      disabled={autoDone}
                      onCheckedChange={(v) => !autoDone && toggleChecklist(k, !!v)}
                      className="mt-0.5"
                    />
                    <span className={`text-sm ${done ? "line-through text-muted-foreground" : ""}`}>
                      {t(`aiVisibilityPage.checklistItems.${k}`)}
                      {autoBadge && (
                        <Badge variant="outline" className="ml-2 text-[10px]">{autoBadge}</Badge>
                      )}
                      {autoDone && !autoBadge && (
                        <Badge variant="outline" className="ml-2 text-[10px]">
                          {t("aiVisibilityPage.autoCompleted")}
                        </Badge>
                      )}
                      {inlineHint}
                    </span>
                  </label>
                );
                if (autoDone) {
                  return (
                    <UITooltip key={k}>
                      <TooltipTrigger asChild>{row}</TooltipTrigger>
                      <TooltipContent>{t("aiVisibilityPage.autoCompleted")}</TooltipContent>
                    </UITooltip>
                  );
                }
                return row;
              })}
            </div>

            {/* Website group */}
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {t("aiVisibilityPage.checklistGroups.site")}
              </p>
              {(["site_schema", "site_faq"] as const).map((k) => {
                const done = !!checklistQuery.data?.[k];
                return (
                  <label
                    key={k}
                    className="flex items-start gap-3 p-2 rounded hover:bg-muted/50 cursor-pointer"
                  >
                    <Checkbox
                      checked={done}
                      onCheckedChange={(v) => toggleChecklist(k, !!v)}
                      className="mt-0.5"
                    />
                    <span className={`text-sm ${done ? "line-through text-muted-foreground" : ""}`}>
                      {t(`aiVisibilityPage.checklistItems.${k}`)}
                    </span>
                  </label>
                );
              })}
            </div>
          </TooltipProvider>
        </CardContent>
      </Card>

      <p className="text-xs text-muted-foreground text-center pt-2">{t("aiVisibilityPage.footnote")}</p>
    </div>
  );
}
