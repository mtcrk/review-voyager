/**
 * Konu bahislerini TARİHE göre çekerken tek doğru kaynak: yorumun `posted_at`
 * değeri. `ci_review_topics.review_posted_at` bazı satırlarda boş (NULL) ya da
 * yorumun tarihiyle uyumsuz olabildiği için doğrudan o kolona filtre atmak
 * bahisleri sessizce düşürür (ve pencereler arasında tutarsız sayı üretir).
 *
 * Bu yüzden: önce seçilen aralıktaki yorum id'lerini çıkarırız, sonra bahisleri
 * o id kümesine göre filtreleriz. Dönen satırların tarihi de yorumdan gelir.
 */
import { supabase } from "@/integrations/supabase/client";

export type OwnTopicRow = {
  review_id: string;
  topic_id: string;
  sentiment: number;
  excerpt: string | null;
  /** Yorumun posted_at değeri (tek doğru kaynak). */
  review_posted_at: string;
};

const PAGE = 1000;
const ID_CHUNK = 300;

/** Aralıktaki yorumların id -> posted_at eşlemesi. */
export async function fetchReviewDates(
  businessId: string,
  fromIso: string,
  toIso: string,
): Promise<Map<string, string>> {
  const map = new Map<string, string>();
  for (let page = 0; page < 20; page++) {
    const { data, error } = await supabase
      .from("reviews")
      .select("id, posted_at")
      .eq("business_id", businessId)
      .gte("posted_at", fromIso)
      .lte("posted_at", toIso)
      .order("posted_at", { ascending: false })
      .range(page * PAGE, page * PAGE + PAGE - 1);
    if (error) throw error;
    const rows = data ?? [];
    for (const r of rows as any[]) if (r.posted_at) map.set(r.id, r.posted_at);
    if (rows.length < PAGE) break;
  }
  return map;
}

export async function fetchOwnTopicRows(
  businessId: string,
  fromIso: string,
  toIso: string,
): Promise<OwnTopicRow[]> {
  const dates = await fetchReviewDates(businessId, fromIso, toIso);
  const ids = Array.from(dates.keys());
  if (ids.length === 0) return [];

  const out: OwnTopicRow[] = [];
  for (let i = 0; i < ids.length; i += ID_CHUNK) {
    const chunk = ids.slice(i, i + ID_CHUNK);
    const { data, error } = await supabase
      .from("ci_review_topics")
      .select("review_id, topic_id, sentiment, excerpt")
      .eq("business_id", businessId)
      .eq("review_source", "own")
      .is("competitor_id", null)
      .in("review_id", chunk);
    if (error) throw error;
    for (const r of (data ?? []) as any[]) {
      const posted = dates.get(r.review_id);
      if (!posted) continue;
      out.push({
        review_id: r.review_id,
        topic_id: r.topic_id,
        sentiment: Number(r.sentiment),
        excerpt: r.excerpt,
        review_posted_at: posted,
      });
    }
  }
  return out;
}
