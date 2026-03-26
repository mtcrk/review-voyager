import { useQuery } from "@tanstack/react-query";
import { FunctionsHttpError } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useBusiness } from "@/contexts/BusinessContext";

export interface PerformanceData {
  dailyMetrics: {
    impressions: {
      desktop_maps: { date: string; value: number }[];
      desktop_search: { date: string; value: number }[];
      mobile_maps: { date: string; value: number }[];
      mobile_search: { date: string; value: number }[];
    };
    actions: {
      website_clicks: { date: string; value: number }[];
      call_clicks: { date: string; value: number }[];
      direction_requests: { date: string; value: number }[];
      bookings: { date: string; value: number }[];
      food_orders: { date: string; value: number }[];
      conversations: { date: string; value: number }[];
    };
  };
  searchKeywords: { keyword: string; impressions: number }[];
  summary: {
    totalImpressions: number;
    totalActions: number;
    topKeyword: string;
    periodStart: string;
    periodEnd: string;
  };
}

export function useGooglePerformance() {
  const { activeBusiness } = useBusiness();

  return useQuery({
    queryKey: ["google-performance", activeBusiness?.id],
    queryFn: async (): Promise<PerformanceData | null> => {
      if (!activeBusiness?.google_location_id) return null;

      try {
        const { data, error } = await supabase.functions.invoke("google-performance-metrics", {
          body: { business_id: activeBusiness.id },
        });

        if (error) {
          if (error instanceof FunctionsHttpError) {
            const payload = await error.context.json().catch(() => null);
            throw new Error(payload?.error || error.message);
          }
          throw error;
        }

        return data as PerformanceData;
      } catch (error) {
        throw error instanceof Error
          ? error
          : new Error("Performance verileri alınamadı.");
      }
    },
    enabled: !!activeBusiness?.google_location_id,
    staleTime: 6 * 60 * 60 * 1000, // 6 hours
    retry: 1,
  });
}
