import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type MonthlyTopicRow = {
  bucket_month: string;
  topic_id: string;
  category: string;
  is_decision_driver: boolean;
  mention_count: number;
  avg_sentiment: number;
  negative_share: number;
};

export type CoverageRow = {
  total_reviews: number;
  analyzed_reviews: number;
  pending_reviews: number;
  failed_reviews: number;
  skipped_reviews: number;
};

/** Minimum mentions in a window before a delta/percentage is trustworthy. */
export const LOW_DATA_THRESHOLD = 5;

/** Aggregation is done in Postgres — the client only receives month x topic rows. */
export function useTopicMonthly(businessId?: string, months = 12) {
  return useQuery({
    queryKey: ["own_topic_monthly", businessId, months],
    enabled: !!businessId,
    staleTime: 1000 * 60 * 5,
    queryFn: async (): Promise<MonthlyTopicRow[]> => {
      const { data, error } = await supabase.rpc("own_topic_monthly", {
        _business_id: businessId!,
        _months: months,
      });
      if (error) throw error;
      return (data ?? []).map((r: any) => ({
        ...r,
        mention_count: Number(r.mention_count),
        avg_sentiment: Number(r.avg_sentiment),
        negative_share: Number(r.negative_share),
      }));
    },
  });
}

export function useAnalysisCoverage(businessId?: string) {
  return useQuery({
    queryKey: ["own_analysis_coverage", businessId],
    enabled: !!businessId,
    staleTime: 1000 * 60 * 5,
    queryFn: async (): Promise<CoverageRow | null> => {
      const { data, error } = await supabase.rpc("own_analysis_coverage", {
        _business_id: businessId!,
      });
      if (error) throw error;
      const row = (data ?? [])[0];
      return row ? ({ ...row } as CoverageRow) : null;
    },
  });
}

/** Example excerpts for one topic (small, topic-scoped query — index covers it). */
export function useTopicExcerpts(businessId?: string, topicId?: string, limit = 12) {
  return useQuery({
    queryKey: ["own_topic_excerpts", businessId, topicId, limit],
    enabled: !!businessId && !!topicId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ci_review_topics")
        .select("review_id, excerpt, sentiment, review_posted_at")
        .eq("business_id", businessId!)
        .eq("topic_id", topicId!)
        .eq("review_source", "own")
        .not("excerpt", "is", null)
        .order("review_posted_at", { ascending: false })
        .limit(limit);
      if (error) throw error;
      return data ?? [];
    },
  });
}

export type Aggregate = {
  mentions: number;
  weightedSentiment: number;
  negatives: number;
};

export type PeriodStat = {
  key: string;
  mentions: number;
  avgSentiment: number;
  negativeShare: number;
  prevMentions: number;
  prevAvgSentiment: number;
  /** Sentiment delta vs previous period, in sentiment points (-2..2). */
  sentimentDelta: number;
  lowConfidence: boolean;
  isDecisionDriver: boolean;
  category?: string;
};

function emptyAgg(): Aggregate {
  return { mentions: 0, weightedSentiment: 0, negatives: 0 };
}

function add(agg: Aggregate, r: MonthlyTopicRow) {
  agg.mentions += r.mention_count;
  agg.weightedSentiment += r.avg_sentiment * r.mention_count;
  agg.negatives += Math.round(r.negative_share * r.mention_count);
}

function finalize(
  key: string,
  cur: Aggregate,
  prev: Aggregate,
  isDriver: boolean,
  category?: string,
): PeriodStat {
  const avg = cur.mentions ? cur.weightedSentiment / cur.mentions : 0;
  const prevAvg = prev.mentions ? prev.weightedSentiment / prev.mentions : 0;
  return {
    key,
    mentions: cur.mentions,
    avgSentiment: avg,
    negativeShare: cur.mentions ? cur.negatives / cur.mentions : 0,
    prevMentions: prev.mentions,
    prevAvgSentiment: prevAvg,
    sentimentDelta: prev.mentions ? avg - prevAvg : 0,
    lowConfidence: cur.mentions < LOW_DATA_THRESHOLD || prev.mentions < LOW_DATA_THRESHOLD,
    isDecisionDriver: isDriver,
    category,
  };
}

/**
 * Splits the window in half: recent half = current period, older half = previous period.
 * Delta = current avg sentiment - previous avg sentiment (mention-weighted).
 */
export function useTopicStats(rows: MonthlyTopicRow[] | undefined, months: number) {
  return useMemo(() => {
    const data = rows ?? [];
    const monthKeys = Array.from(new Set(data.map((r) => r.bucket_month))).sort();
    // Build the full month axis even where a month has no mentions.
    const axis: string[] = [];
    const start = new Date();
    start.setUTCDate(1);
    for (let i = months - 1; i >= 0; i--) {
      const d = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth() - i, 1));
      axis.push(d.toISOString().slice(0, 10));
    }
    const half = Math.floor(months / 2);
    const currentMonths = new Set(axis.slice(axis.length - half));
    const previousMonths = new Set(axis.slice(0, axis.length - half));

    const topicCur = new Map<string, Aggregate>();
    const topicPrev = new Map<string, Aggregate>();
    const catCur = new Map<string, Aggregate>();
    const catPrev = new Map<string, Aggregate>();
    const topicMeta = new Map<string, { category: string; driver: boolean }>();

    for (const r of data) {
      topicMeta.set(r.topic_id, { category: r.category, driver: r.is_decision_driver });
      const inCur = currentMonths.has(r.bucket_month);
      const inPrev = previousMonths.has(r.bucket_month);
      if (!inCur && !inPrev) continue;
      const tMap = inCur ? topicCur : topicPrev;
      const cMap = inCur ? catCur : catPrev;
      if (!tMap.has(r.topic_id)) tMap.set(r.topic_id, emptyAgg());
      if (!cMap.has(r.category)) cMap.set(r.category, emptyAgg());
      add(tMap.get(r.topic_id)!, r);
      add(cMap.get(r.category)!, r);
    }

    const topicStats: PeriodStat[] = Array.from(topicMeta.keys()).map((id) =>
      finalize(
        id,
        topicCur.get(id) ?? emptyAgg(),
        topicPrev.get(id) ?? emptyAgg(),
        topicMeta.get(id)!.driver,
        topicMeta.get(id)!.category,
      ),
    );

    const categories = Array.from(new Set([...catCur.keys(), ...catPrev.keys()]));
    const categoryStats: PeriodStat[] = categories.map((c) =>
      finalize(c, catCur.get(c) ?? emptyAgg(), catPrev.get(c) ?? emptyAgg(), false),
    );

    // Priority score — transparent, all components exposed in the UI.
    const maxMentions = Math.max(1, ...topicStats.map((t) => t.mentions));
    const priority = topicStats
      .filter((t) => t.mentions > 0)
      .map((t) => {
        const volume = t.mentions / maxMentions; // 0..1
        const negativity = t.negativeShare; // 0..1
        const driver = t.isDecisionDriver ? 1 : 0;
        return {
          ...t,
          volume,
          negativity,
          driver,
          score: 0.4 * volume + 0.4 * negativity + 0.2 * driver,
        };
      })
      .sort((a, b) => b.score - a.score);

    return {
      axis,
      monthKeys,
      topicStats: topicStats.sort((a, b) => b.mentions - a.mentions),
      categoryStats: categoryStats.sort((a, b) => b.mentions - a.mentions),
      priority,
      halfMonths: half,
    };
  }, [rows, months]);
}

/** Monthly series per category (or per topic) for recharts. */
export function buildSeries(
  rows: MonthlyTopicRow[] | undefined,
  axis: string[],
  groupBy: "category" | "topic",
  keys: string[],
) {
  const index = new Map<string, Record<string, Aggregate>>();
  for (const m of axis) index.set(m, {});
  for (const r of rows ?? []) {
    const bucket = index.get(r.bucket_month);
    if (!bucket) continue;
    const key = groupBy === "category" ? r.category : r.topic_id;
    if (!keys.includes(key)) continue;
    if (!bucket[key]) bucket[key] = emptyAgg();
    add(bucket[key], r);
  }
  return axis.map((m) => {
    const bucket = index.get(m)!;
    const point: Record<string, any> = { month: m };
    for (const k of keys) {
      const agg = bucket[k];
      point[k] = agg && agg.mentions ? Number((agg.weightedSentiment / agg.mentions).toFixed(3)) : null;
    }
    return point;
  });
}