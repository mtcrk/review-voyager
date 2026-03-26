import { useQuery } from "@tanstack/react-query";
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

const emptySeries = () => [] as { date: string; value: number }[];

const createEmptyPerformanceData = (): PerformanceData => ({
  dailyMetrics: {
    impressions: {
      desktop_maps: emptySeries(),
      desktop_search: emptySeries(),
      mobile_maps: emptySeries(),
      mobile_search: emptySeries(),
    },
    actions: {
      website_clicks: emptySeries(),
      call_clicks: emptySeries(),
      direction_requests: emptySeries(),
      bookings: emptySeries(),
      food_orders: emptySeries(),
      conversations: emptySeries(),
    },
  },
  searchKeywords: [],
  summary: {
    totalImpressions: 0,
    totalActions: 0,
    topKeyword: "",
    periodStart: "",
    periodEnd: "",
  },
});

function normalizePerformanceData(payload: unknown): PerformanceData {
  const fallback = createEmptyPerformanceData();

  if (!payload || typeof payload !== "object") {
    return fallback;
  }

  const source = payload as Partial<PerformanceData>;
  const impressions = source.dailyMetrics?.impressions;
  const actions = source.dailyMetrics?.actions;
  const summary = source.summary;

  return {
    dailyMetrics: {
      impressions: {
        desktop_maps: Array.isArray(impressions?.desktop_maps) ? impressions.desktop_maps : [],
        desktop_search: Array.isArray(impressions?.desktop_search) ? impressions.desktop_search : [],
        mobile_maps: Array.isArray(impressions?.mobile_maps) ? impressions.mobile_maps : [],
        mobile_search: Array.isArray(impressions?.mobile_search) ? impressions.mobile_search : [],
      },
      actions: {
        website_clicks: Array.isArray(actions?.website_clicks) ? actions.website_clicks : [],
        call_clicks: Array.isArray(actions?.call_clicks) ? actions.call_clicks : [],
        direction_requests: Array.isArray(actions?.direction_requests) ? actions.direction_requests : [],
        bookings: Array.isArray(actions?.bookings) ? actions.bookings : [],
        food_orders: Array.isArray(actions?.food_orders) ? actions.food_orders : [],
        conversations: Array.isArray(actions?.conversations) ? actions.conversations : [],
      },
    },
    searchKeywords: Array.isArray(source.searchKeywords) ? source.searchKeywords : [],
    summary: {
      totalImpressions: typeof summary?.totalImpressions === "number" ? summary.totalImpressions : 0,
      totalActions: typeof summary?.totalActions === "number" ? summary.totalActions : 0,
      topKeyword: typeof summary?.topKeyword === "string" ? summary.topKeyword : "",
      periodStart: typeof summary?.periodStart === "string" ? summary.periodStart : "",
      periodEnd: typeof summary?.periodEnd === "string" ? summary.periodEnd : "",
    },
  };
}

export function useGooglePerformance(dateRange?: { startDate: string; endDate: string }) {
  const { activeBusiness } = useBusiness();

  return useQuery({
    queryKey: ["google-performance", activeBusiness?.id, dateRange?.startDate, dateRange?.endDate],
    queryFn: async (): Promise<PerformanceData | null> => {
      if (!activeBusiness?.google_location_id) return null;

      const body: Record<string, string> = { business_id: activeBusiness.id };
      if (dateRange?.startDate) body.start_date = dateRange.startDate;
      if (dateRange?.endDate) body.end_date = dateRange.endDate;

      const { data, error } = await supabase.functions.invoke("google-performance-metrics", { body });

      if (error) {
        // Try to extract the actual error message from the response
        let message = error.message || "Performance verileri alınamadı.";
        try {
          if (error.context && typeof error.context.json === "function") {
            const payload = await error.context.json();
            if (payload?.error) message = payload.error;
          }
        } catch {
          // ignore parse errors
        }
        throw new Error(message);
      }

      return normalizePerformanceData(data);
    },
    enabled: !!activeBusiness?.google_location_id,
    staleTime: 6 * 60 * 60 * 1000, // 6 hours
    retry: 1,
  });
}
