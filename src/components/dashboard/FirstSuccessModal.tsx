import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useReviewFetch } from "@/contexts/ReviewFetchContext";
import { useBusiness } from "@/contexts/BusinessContext";
import { supabase } from "@/integrations/supabase/client";
import { PartyPopper, Inbox, Sparkles } from "lucide-react";

const STORAGE_KEY = "vr_first_success_seen";

function hasSeen(businessId: string): boolean {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return false;
    const map = JSON.parse(raw);
    return !!map[businessId];
  } catch {
    return false;
  }
}

function markSeen(businessId: string) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const map = raw ? JSON.parse(raw) : {};
    map[businessId] = new Date().toISOString();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  } catch {
    /* noop */
  }
}

/**
 * Shows a one-time celebration modal once the user's FIRST review fetch completes
 * and reviews actually exist in the DB. Tracks per-business via localStorage.
 */
export function FirstSuccessModal() {
  const navigate = useNavigate();
  const { activeBusiness } = useBusiness();
  const { hasPendingRuns } = useReviewFetch();
  const [open, setOpen] = useState(false);
  const [reviewCount, setReviewCount] = useState(0);
  const [wasFetching, setWasFetching] = useState(false);

  // Track when fetching transitions from running → done
  useEffect(() => {
    if (hasPendingRuns) {
      setWasFetching(true);
    }
  }, [hasPendingRuns]);

  // When fetching completes, check if we should celebrate
  useEffect(() => {
    if (!activeBusiness) return;
    if (hasPendingRuns) return; // still running
    if (!wasFetching) return; // never fetched in this session
    if (hasSeen(activeBusiness.id)) return;

    let cancelled = false;
    (async () => {
      const { count } = await supabase
        .from("reviews")
        .select("id", { count: "exact", head: true })
        .eq("business_id", activeBusiness.id);

      if (cancelled) return;
      if (count && count > 0) {
        setReviewCount(count);
        setOpen(true);
        markSeen(activeBusiness.id);
        setWasFetching(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [hasPendingRuns, wasFetching, activeBusiness]);

  const handleGoToInbox = () => {
    setOpen(false);
    navigate("/inbox");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-2">
            <PartyPopper className="h-8 w-8 text-primary" />
          </div>
          <DialogTitle className="text-center text-2xl">Harika! Hazırsın 🎉</DialogTitle>
          <DialogDescription className="text-center text-base pt-2">
            <span className="font-semibold text-foreground">{reviewCount} yorum</span> başarıyla çekildi.
            <br />
            Şimdi ilk yanıtını yazmaya hazırsın.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 mt-4">
          <Button onClick={handleGoToInbox} className="w-full h-12" size="lg">
            <Inbox className="h-5 w-5 mr-2" />
            Tüm Yorumları Aç
          </Button>
          <button
            onClick={() => setOpen(false)}
            className="w-full text-sm text-muted-foreground hover:text-foreground py-2"
          >
            Daha sonra
          </button>
        </div>

        <div className="mt-2 pt-4 border-t flex items-start gap-2 text-xs text-muted-foreground">
          <Sparkles className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
          <p>
            <strong className="text-foreground">İpucu:</strong> Sidebar'dan{" "}
            <strong className="text-foreground">Tüm Yorumlar</strong> menüsüyle tüm otellerin ve tüm
            platformların yorumlarını tek ekranda görebilirsin.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
