import { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useBusiness } from "./BusinessContext";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Star } from "lucide-react";

interface NewReviewsContextType {
  unreadCount: number;
  markAllRead: () => void;
  pushPermission: NotificationPermission | "unsupported";
  requestPushPermission: () => Promise<void>;
}

const NewReviewsContext = createContext<NewReviewsContextType>({
  unreadCount: 0,
  markAllRead: () => {},
  pushPermission: "default",
  requestPushPermission: async () => {},
});

export const useNewReviews = () => useContext(NewReviewsContext);

const STORAGE_KEY = "vr_last_seen_reviews";

function getLastSeen(businessId: string): string {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return new Date(0).toISOString();
    const map = JSON.parse(raw);
    return map[businessId] || new Date(0).toISOString();
  } catch {
    return new Date(0).toISOString();
  }
}

function setLastSeen(businessId: string, iso: string) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const map = raw ? JSON.parse(raw) : {};
    map[businessId] = iso;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  } catch {
    /* noop */
  }
}

export function NewReviewsProvider({ children }: { children: React.ReactNode }) {
  const { activeBusiness } = useBusiness();
  const queryClient = useQueryClient();
  const [unreadCount, setUnreadCount] = useState(0);
  const [pushPermission, setPushPermission] = useState<NotificationPermission | "unsupported">(
    typeof window !== "undefined" && "Notification" in window ? Notification.permission : "unsupported"
  );
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  // Initial unread count from DB
  const refreshCount = useCallback(async () => {
    if (!activeBusiness) {
      setUnreadCount(0);
      return;
    }
    const lastSeen = getLastSeen(activeBusiness.id);
    const { count, error } = await supabase
      .from("reviews")
      .select("id", { count: "exact", head: true })
      .eq("business_id", activeBusiness.id)
      .gt("created_at", lastSeen);
    if (!error) setUnreadCount(count || 0);
  }, [activeBusiness]);

  useEffect(() => {
    refreshCount();
  }, [refreshCount]);

  // Realtime subscription
  useEffect(() => {
    if (!activeBusiness) return;

    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }

    const channel = supabase
      .channel(`reviews-realtime-${activeBusiness.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "reviews",
          filter: `business_id=eq.${activeBusiness.id}`,
        },
        (payload) => {
          const review = payload.new as {
            reviewer_name?: string;
            rating?: number;
            text?: string | null;
            platform?: string;
          };

          setUnreadCount((c) => c + 1);

          // Toast
          const stars = "⭐".repeat(review.rating || 0);
          toast(
            `Yeni yorum: ${review.reviewer_name || "Anonim"} ${stars}`,
            {
              description: review.text?.slice(0, 100) || `${review.platform || "Platform"} üzerinden yeni yorum geldi.`,
              duration: 6000,
            }
          );

          // Browser push
          if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
            try {
              const n = new Notification(`Yeni yorum (${review.rating || "?"}⭐)`, {
                body: `${review.reviewer_name || "Anonim"}: ${(review.text || "").slice(0, 120)}`,
                icon: "/favicon.svg",
                tag: `review-${activeBusiness.id}`,
              });
              n.onclick = () => {
                window.focus();
                window.location.href = "/reviews";
                n.close();
              };
            } catch (err) {
              console.warn("Push notification failed:", err);
            }
          }

          // Refresh review queries
          queryClient.invalidateQueries({ queryKey: ["reviews"] });
          queryClient.invalidateQueries({ queryKey: ["reviews-stats"] });
        }
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
      channelRef.current = null;
    };
  }, [activeBusiness, queryClient]);

  const markAllRead = useCallback(() => {
    if (!activeBusiness) return;
    setLastSeen(activeBusiness.id, new Date().toISOString());
    setUnreadCount(0);
  }, [activeBusiness]);

  const requestPushPermission = useCallback(async () => {
    if (typeof window === "undefined" || !("Notification" in window)) {
      toast.error("Tarayıcınız bildirimleri desteklemiyor");
      return;
    }
    const result = await Notification.requestPermission();
    setPushPermission(result);
    if (result === "granted") {
      toast.success("Bildirimler aktif edildi");
    } else if (result === "denied") {
      toast.error("Bildirimler reddedildi. Tarayıcı ayarlarından değiştirebilirsiniz.");
    }
  }, []);

  return (
    <NewReviewsContext.Provider value={{ unreadCount, markAllRead, pushPermission, requestPushPermission }}>
      {children}
    </NewReviewsContext.Provider>
  );
}
