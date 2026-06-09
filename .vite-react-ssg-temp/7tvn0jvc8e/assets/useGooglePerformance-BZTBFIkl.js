import { useQuery } from "@tanstack/react-query";
import { a as useBusiness, s as supabase } from "../main.mjs";
const emptySeries = () => [];
const createEmptyPerformanceData = () => ({
  dailyMetrics: {
    impressions: {
      desktop_maps: emptySeries(),
      desktop_search: emptySeries(),
      mobile_maps: emptySeries(),
      mobile_search: emptySeries()
    },
    actions: {
      website_clicks: emptySeries(),
      call_clicks: emptySeries(),
      direction_requests: emptySeries(),
      bookings: emptySeries(),
      food_orders: emptySeries(),
      conversations: emptySeries()
    }
  },
  searchKeywords: [],
  summary: {
    totalImpressions: 0,
    totalActions: 0,
    topKeyword: "",
    periodStart: "",
    periodEnd: ""
  }
});
function normalizePerformanceData(payload) {
  var _a, _b;
  const fallback = createEmptyPerformanceData();
  if (!payload || typeof payload !== "object") {
    return fallback;
  }
  const source = payload;
  const impressions = (_a = source.dailyMetrics) == null ? void 0 : _a.impressions;
  const actions = (_b = source.dailyMetrics) == null ? void 0 : _b.actions;
  const summary = source.summary;
  return {
    dailyMetrics: {
      impressions: {
        desktop_maps: Array.isArray(impressions == null ? void 0 : impressions.desktop_maps) ? impressions.desktop_maps : [],
        desktop_search: Array.isArray(impressions == null ? void 0 : impressions.desktop_search) ? impressions.desktop_search : [],
        mobile_maps: Array.isArray(impressions == null ? void 0 : impressions.mobile_maps) ? impressions.mobile_maps : [],
        mobile_search: Array.isArray(impressions == null ? void 0 : impressions.mobile_search) ? impressions.mobile_search : []
      },
      actions: {
        website_clicks: Array.isArray(actions == null ? void 0 : actions.website_clicks) ? actions.website_clicks : [],
        call_clicks: Array.isArray(actions == null ? void 0 : actions.call_clicks) ? actions.call_clicks : [],
        direction_requests: Array.isArray(actions == null ? void 0 : actions.direction_requests) ? actions.direction_requests : [],
        bookings: Array.isArray(actions == null ? void 0 : actions.bookings) ? actions.bookings : [],
        food_orders: Array.isArray(actions == null ? void 0 : actions.food_orders) ? actions.food_orders : [],
        conversations: Array.isArray(actions == null ? void 0 : actions.conversations) ? actions.conversations : []
      }
    },
    searchKeywords: Array.isArray(source.searchKeywords) ? source.searchKeywords : [],
    summary: {
      totalImpressions: typeof (summary == null ? void 0 : summary.totalImpressions) === "number" ? summary.totalImpressions : 0,
      totalActions: typeof (summary == null ? void 0 : summary.totalActions) === "number" ? summary.totalActions : 0,
      topKeyword: typeof (summary == null ? void 0 : summary.topKeyword) === "string" ? summary.topKeyword : "",
      periodStart: typeof (summary == null ? void 0 : summary.periodStart) === "string" ? summary.periodStart : "",
      periodEnd: typeof (summary == null ? void 0 : summary.periodEnd) === "string" ? summary.periodEnd : ""
    }
  };
}
function useGooglePerformance(dateRange) {
  const { activeBusiness } = useBusiness();
  return useQuery({
    queryKey: ["google-performance", activeBusiness == null ? void 0 : activeBusiness.id, dateRange == null ? void 0 : dateRange.startDate, dateRange == null ? void 0 : dateRange.endDate],
    queryFn: async () => {
      if (!(activeBusiness == null ? void 0 : activeBusiness.google_location_id)) return null;
      const body = { business_id: activeBusiness.id };
      if (dateRange == null ? void 0 : dateRange.startDate) body.start_date = dateRange.startDate;
      if (dateRange == null ? void 0 : dateRange.endDate) body.end_date = dateRange.endDate;
      const { data, error } = await supabase.functions.invoke("google-performance-metrics", { body });
      if (error) {
        let message = error.message || "Performance verileri alınamadı.";
        try {
          if (error.context && typeof error.context.json === "function") {
            const payload = await error.context.json();
            if (payload == null ? void 0 : payload.error) message = payload.error;
          }
        } catch {
        }
        throw new Error(message);
      }
      return normalizePerformanceData(data);
    },
    enabled: !!(activeBusiness == null ? void 0 : activeBusiness.google_location_id),
    staleTime: 6 * 60 * 60 * 1e3,
    // 6 hours
    retry: 1
  });
}
export {
  useGooglePerformance as u
};
