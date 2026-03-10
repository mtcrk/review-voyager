import { createContext, useContext, useState, useRef, useEffect, useCallback, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface PendingRun {
  runId: string;
  platform: string;
  functionName: string;
  businessId: string;
  businessName: string;
  startedAt: number;
}

interface ReviewFetchContextType {
  pendingRuns: Map<string, PendingRun>;
  hasPendingRuns: boolean;
  startFetch: (params: {
    businessId: string;
    businessName: string;
    platform: string;
    functionName?: string;
  }) => Promise<any>;
  onFetchComplete?: () => void;
  setOnFetchComplete: (cb: (() => void) | undefined) => void;
}

const ReviewFetchContext = createContext<ReviewFetchContextType | null>(null);

export function useReviewFetch() {
  const ctx = useContext(ReviewFetchContext);
  if (!ctx) throw new Error("useReviewFetch must be used within ReviewFetchProvider");
  return ctx;
}

const platformLabels: Record<string, string> = {
  google: "Google",
  booking: "Booking.com",
  tripadvisor: "TripAdvisor",
  trustpilot: "Trustpilot",
  hotelscom: "Hotels.com",
};

const POLL_INTERVAL_MS = 3000;

export function ReviewFetchProvider({ children }: { children: ReactNode }) {
  const [pendingRunsState, setPendingRunsState] = useState<Map<string, PendingRun>>(new Map());
  const pendingRunsRef = useRef<Map<string, PendingRun>>(new Map());
  const onFetchCompleteRef = useRef<(() => void) | undefined>();

  const hasPendingRuns = pendingRunsState.size > 0;

  const setOnFetchComplete = useCallback((cb: (() => void) | undefined) => {
    onFetchCompleteRef.current = cb;
  }, []);

  const startFetch = useCallback(async (params: {
    businessId: string;
    businessName: string;
    platform: string;
    functionName?: string;
  }) => {
    const { businessId, businessName, platform } = params;
    const functionName = params.functionName || (platform === "tripadvisor" ? "tripadvisor-fetch-reviews" : "apify-fetch-reviews");

    const response = await supabase.functions.invoke(functionName, {
      body: { business_id: businessId, ...(platform !== "tripadvisor" ? { platform } : {}) },
    });

    if (response.error) {
      const msg = response.data?.error || response.error.message || "Bilinmeyen hata";
      throw new Error(msg);
    }

    const result = response.data;

    // If already completed instantly
    if (result?.success) return result;

    // If running, register for background polling
    if (result?.status === "running" && result?.run_id) {
      const key = `${businessId}-${platform}`;
      const run: PendingRun = {
        runId: result.run_id,
        platform,
        functionName,
        businessId,
        businessName,
        startedAt: Date.now(),
      };
      pendingRunsRef.current.set(key, run);
      setPendingRunsState(new Map(pendingRunsRef.current));
      return { status: "started", run_id: result.run_id };
    }

    return result;
  }, []);

  // Background polling
  useEffect(() => {
    if (!hasPendingRuns) return;

    const interval = setInterval(async () => {
      const entries = Array.from(pendingRunsRef.current.entries());
      if (entries.length === 0) {
        setPendingRunsState(new Map());
        return;
      }

      for (const [key, run] of entries) {
        try {
          const pollResp = await supabase.functions.invoke(run.functionName, {
            body: {
              business_id: run.businessId,
              ...(run.platform !== "tripadvisor" ? { platform: run.platform } : {}),
              run_id: run.runId,
            },
          });

          if (pollResp.error) continue;
          const result = pollResp.data;

          if (result?.status === "running") continue;

          // Completed
          pendingRunsRef.current.delete(key);
          setPendingRunsState(new Map(pendingRunsRef.current));

          if (result?.success) {
            toast({
              title: `${platformLabels[run.platform] || run.platform} Yorumları Çekildi! 🎉`,
              description: `${run.businessName}: ${result.inserted} yeni yorum eklendi${result.skipped ? `, ${result.skipped} zaten mevcut` : ""}.`,
            });
            onFetchCompleteRef.current?.();
          } else {
            toast({
              title: "Hata",
              description: result?.message || result?.error || "Yorum çekme başarısız.",
              variant: "destructive",
            });
          }
        } catch {
          // Retry on network errors
        }
      }
    }, POLL_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [hasPendingRuns]);

  return (
    <ReviewFetchContext.Provider value={{
      pendingRuns: pendingRunsState,
      hasPendingRuns,
      startFetch,
      setOnFetchComplete,
    }}>
      {children}
    </ReviewFetchContext.Provider>
  );
}
