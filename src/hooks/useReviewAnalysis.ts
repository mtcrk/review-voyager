import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";

export type AnalysisFlags = {
  recovery_needed?: boolean;
  refund_request?: boolean;
  legal_risk?: boolean;
  is_fake_suspect?: boolean;
  staff_named?: string[];
};

export type AnalysisKeyword = { term: string; polarity: string; weight: number };

export type ReviewAnalysisRow = {
  review_id: string;
  business_id: string;
  overall_sentiment: number;
  sentiment_label: string;
  detected_language: string | null;
  summary: string | null;
  highlights: any;
  keywords: any;
  flags: any;
};

export type ReviewTopicRow = {
  review_id: string;
  topic_id: string;
  sentiment: number;
  confidence: number;
  /** Yorum metninden birebir alınan parça — rozet tıklanınca metinde aranır. */
  excerpt?: string | null;
};

export type CiTopic = {
  id: string;
  category: string;
  display_name: Record<string, string> | null;
  is_decision_driver: boolean;
};

/** Closed taxonomy — small table, cached for the session. */
export function useCiTopics() {
  const { i18n } = useTranslation();
  const lang = (i18n.language || "tr").slice(0, 2);

  const query = useQuery({
    queryKey: ["ci_topics"],
    staleTime: 1000 * 60 * 60,
    queryFn: async (): Promise<CiTopic[]> => {
      const { data, error } = await supabase
        .from("ci_topics")
        .select("id, category, display_name, is_decision_driver");
      if (error) throw error;
      return (data ?? []) as any;
    },
  });

  const byId = useMemo(() => {
    const map: Record<string, CiTopic> = {};
    for (const t of query.data ?? []) map[t.id] = t;
    return map;
  }, [query.data]);

  const labelOf = useMemo(
    () => (topicId: string) => {
      const dn = byId[topicId]?.display_name as Record<string, string> | null | undefined;
      return dn?.[lang] || dn?.tr || dn?.en || topicId;
    },
    [byId, lang],
  );

  const labels = useMemo(() => {
    const map: Record<string, string> = {};
    for (const id of Object.keys(byId)) map[id] = labelOf(id);
    return map;
  }, [byId, labelOf]);

  return { topicsById: byId, labelOf, labels, isLoading: query.isLoading };
}

async function fetchAllPages<T>(
  run: (from: number, to: number) => Promise<{ data: T[] | null; error: any }>,
) {
  const size = 1000;
  const all: T[] = [];
  let from = 0;
  // Hard cap keeps the page responsive on very large accounts.
  for (let page = 0; page < 40; page++) {
    const { data, error } = await run(from, from + size - 1);
    if (error) throw error;
    if (!data || data.length === 0) break;
    all.push(...data);
    if (data.length < size) break;
    from += size;
  }
  return all;
}

/**
 * ONE batched query per table for the whole business scope, indexed by review id.
 * No per-row / per-review queries anywhere.
 */
export function useReviewAnalyses(businessIds: string[]) {
  const ids = useMemo(() => [...businessIds].sort(), [businessIds]);

  const analysisQuery = useQuery({
    queryKey: ["review_analysis", ids],
    enabled: ids.length > 0,
    queryFn: async () =>
      fetchAllPages<ReviewAnalysisRow>((from, to) =>
        supabase
          .from("review_analysis")
          .select(
            "review_id, business_id, overall_sentiment, sentiment_label, detected_language, summary, highlights, keywords, flags",
          )
          .in("business_id", ids)
          .range(from, to) as any,
      ),
  });

  const topicsQuery = useQuery({
    queryKey: ["ci_review_topics_own", ids],
    enabled: ids.length > 0,
    queryFn: async () =>
      fetchAllPages<ReviewTopicRow>((from, to) =>
        supabase
          .from("ci_review_topics")
          .select("review_id, topic_id, sentiment, confidence")
          .eq("review_source", "own")
          .in("business_id", ids)
          .range(from, to) as any,
      ),
  });

  const analysisByReview = useMemo(() => {
    const map = new Map<string, ReviewAnalysisRow>();
    for (const a of analysisQuery.data ?? []) map.set(a.review_id, a);
    return map;
  }, [analysisQuery.data]);

  const topicsByReview = useMemo(() => {
    const map = new Map<string, ReviewTopicRow[]>();
    for (const t of topicsQuery.data ?? []) {
      const list = map.get(t.review_id);
      if (list) list.push(t);
      else map.set(t.review_id, [t]);
    }
    return map;
  }, [topicsQuery.data]);

  return {
    analysisByReview,
    topicsByReview,
    isLoading: analysisQuery.isLoading || topicsQuery.isLoading,
  };
}

/** Single review (detail panel). */
export function useSingleReviewAnalysis(reviewId?: string) {
  return useQuery({
    queryKey: ["review_analysis_single", reviewId],
    enabled: !!reviewId,
    queryFn: async () => {
      const [{ data: analysis, error: aErr }, { data: topics, error: tErr }] = await Promise.all([
        supabase
          .from("review_analysis")
          .select("*")
          .eq("review_id", reviewId!)
          .maybeSingle(),
        supabase
          .from("ci_review_topics")
          .select("review_id, topic_id, sentiment, confidence")
          .eq("review_source", "own")
          .eq("review_id", reviewId!),
      ]);
      if (aErr) throw aErr;
      if (tErr) throw tErr;
      return {
        analysis: (analysis ?? null) as ReviewAnalysisRow | null,
        topics: (topics ?? []) as ReviewTopicRow[],
      };
    },
  });
}

export function sentimentTone(score: number): "positive" | "negative" | "neutral" {
  if (score <= -0.15) return "negative";
  if (score >= 0.15) return "positive";
  return "neutral";
}