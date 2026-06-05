import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { normalizeRatingTo5 } from "@/lib/ratingScale";

export interface LocationMetrics {
  id: string;
  name: string;
  city: string | null;
  lat: number | null;
  lng: number | null;
  totalReviews: number;
  averageRating: number;
  pendingReplies: number;
  repliedCount: number;
  responseRate: number;
  weeklyReviews: number;
  sentimentBreakdown: { positive: number; neutral: number; negative: number };
  ratingTrend: { date: string; avgRating: number; count: number }[];
  platformBreakdown: Record<string, { count: number; avgRating: number }>;
}

export function useMultiLocationData() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["multi-location", user?.id],
    queryFn: async (): Promise<LocationMetrics[]> => {
      if (!user) return [];

      // Fetch all businesses for user
      const { data: businesses, error: bizError } = await supabase
        .from("businesses")
        .select("id, name, city, lat, lng")
        .eq("user_id", user.id);

      if (bizError) throw bizError;
      if (!businesses || businesses.length === 0) return [];

      // Fetch ALL reviews (paginated to bypass Supabase 1000-row limit)
      const businessIds = businesses.map((b) => b.id);
      const reviews: { id: string; business_id: string; rating: number; status: string | null; sentiment: string | null; posted_at: string; platform: string | null }[] = [];
      const PAGE_SIZE = 1000;
      let from = 0;
      while (true) {
        const { data: page, error: revError } = await supabase
          .from("reviews")
          .select("id, business_id, rating, status, sentiment, posted_at, platform")
          .in("business_id", businessIds)
          .order("posted_at", { ascending: false })
          .range(from, from + PAGE_SIZE - 1);
        if (revError) throw revError;
        if (!page || page.length === 0) break;
        reviews.push(...page);
        if (page.length < PAGE_SIZE) break;
        from += PAGE_SIZE;
      }

      const now = new Date();
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      return businesses.map((biz) => {
        const bizReviews = (reviews || []).filter((r) => r.business_id === biz.id);
        const totalReviews = bizReviews.length;
        const averageRating =
          totalReviews > 0
            ? bizReviews.reduce((sum, r) => sum + normalizeRatingTo5(r.rating, r.platform), 0) / totalReviews
            : 0;

        const pendingReplies = bizReviews.filter(
          (r) => r.status === "pending_reply" || r.status === "pending"
        ).length;
        const repliedCount = bizReviews.filter(
          (r) => r.status === "replied" || r.status === "approved"
        ).length;
        const responseRate = totalReviews > 0 ? (repliedCount / totalReviews) * 100 : 0;

        const weeklyReviews = bizReviews.filter(
          (r) => new Date(r.posted_at) >= oneWeekAgo
        ).length;

        const positive = bizReviews.filter((r) => r.sentiment === "positive").length;
        const negative = bizReviews.filter((r) => r.sentiment === "negative").length;
        const neutral = totalReviews - positive - negative;

        // Build 30-day trend (grouped by day)
        const last30 = bizReviews.filter((r) => new Date(r.posted_at) >= thirtyDaysAgo);
        const dailyMap = new Map<string, { sum: number; count: number }>();
        last30.forEach((r) => {
          const day = r.posted_at.slice(0, 10);
          const entry = dailyMap.get(day) || { sum: 0, count: 0 };
          entry.sum += normalizeRatingTo5(r.rating, r.platform);
          entry.count += 1;
          dailyMap.set(day, entry);
        });
        const ratingTrend = Array.from(dailyMap.entries())
          .map(([date, { sum, count }]) => ({
            date,
            avgRating: Math.round((sum / count) * 10) / 10,
            count,
          }))
          .sort((a, b) => a.date.localeCompare(b.date));

        // Platform breakdown (count + avg rating per platform)
        const platformAgg = new Map<string, { sum: number; count: number }>();
        bizReviews.forEach((r) => {
          const p = (r.platform || "google").toLowerCase();
          const entry = platformAgg.get(p) || { sum: 0, count: 0 };
          entry.sum += normalizeRatingTo5(r.rating, r.platform);
          entry.count += 1;
          platformAgg.set(p, entry);
        });
        const platformBreakdown: Record<string, { count: number; avgRating: number }> = {};
        platformAgg.forEach((v, k) => {
          platformBreakdown[k] = {
            count: v.count,
            avgRating: Math.round((v.sum / v.count) * 10) / 10,
          };
        });

        return {
          id: biz.id,
          name: biz.name,
          city: biz.city,
          lat: biz.lat ? Number(biz.lat) : null,
          lng: biz.lng ? Number(biz.lng) : null,
          totalReviews,
          averageRating: Math.round(averageRating * 10) / 10,
          pendingReplies,
          repliedCount,
          responseRate: Math.round(responseRate),
          weeklyReviews,
          sentimentBreakdown: { positive, neutral, negative },
          ratingTrend,
          platformBreakdown,
        };
      });
    },
    enabled: !!user,
  });
}
