import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Star, MessageSquare } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

type Row = {
  id: string;
  platform: string;
  rating: number | null;
  title: string | null;
  body: string | null;
  author_name: string | null;
  author_country: string | null;
  posted_at: string | null;
  language: string | null;
};

const PLATFORM_LABEL: Record<string, string> = {
  google: "Google",
  booking: "Booking.com",
  tripadvisor: "TripAdvisor",
  expedia: "Expedia",
  hotels: "Hotels.com",
  hotelscom: "Hotels.com",
};

function fmtDate(iso: string | null) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString("tr-TR", { year: "numeric", month: "short", day: "numeric" });
  } catch {
    return "—";
  }
}

export function CompetitorReviewsDrawer({
  open,
  onOpenChange,
  competitorId,
  competitorName,
  totalCount,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  competitorId: string | null;
  competitorName: string;
  totalCount: number;
}) {
  const [platform, setPlatform] = useState<string | "all">("all");

  const q = useQuery({
    queryKey: ["ci_comp_reviews_drawer", competitorId, platform],
    enabled: open && !!competitorId,
    queryFn: async () => {
      let query = supabase
        .from("ci_competitor_reviews")
        .select("id,platform,rating,title,body,author_name,author_country,posted_at,language")
        .eq("competitor_id", competitorId!)
        .order("posted_at", { ascending: false, nullsFirst: false })
        .limit(200);
      if (platform !== "all") query = query.eq("platform", platform);
      const { data, error } = await query;
      if (error) throw error;
      return (data ?? []) as Row[];
    },
  });

  const rows = q.data ?? [];
  const platforms = Array.from(new Set(rows.map((r) => r.platform))).sort();

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-2xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="text-base">{competitorName}</SheetTitle>
          <SheetDescription>
            Toplanan {totalCount} yorum · en yeni 200 tanesi gösteriliyor
          </SheetDescription>
        </SheetHeader>

        <div className="flex flex-wrap gap-2 mt-4">
          <Button
            size="sm"
            variant={platform === "all" ? "default" : "outline"}
            onClick={() => setPlatform("all")}
          >
            Hepsi
          </Button>
          {platforms.map((p) => (
            <Button
              key={p}
              size="sm"
              variant={platform === p ? "default" : "outline"}
              onClick={() => setPlatform(p)}
            >
              {PLATFORM_LABEL[p] ?? p}
            </Button>
          ))}
        </div>

        <div className="mt-4 space-y-3">
          {q.isLoading ? (
            Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-24 w-full" />)
          ) : rows.length === 0 ? (
            <div className="text-sm text-muted-foreground text-center py-12">
              <MessageSquare className="h-6 w-6 mx-auto mb-2 opacity-50" />
              Henüz yorum toplanmadı.
            </div>
          ) : (
            rows.map((r) => (
              <div key={r.id} className="border rounded-md p-3 space-y-2">
                <div className="flex items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="outline" className="text-[10px]">
                      {PLATFORM_LABEL[r.platform] ?? r.platform}
                    </Badge>
                    {r.rating != null && (
                      <span className="inline-flex items-center gap-1 font-medium">
                        <Star className="h-3 w-3 fill-current text-amber-500" />
                        {Number(r.rating).toFixed(1)}
                      </span>
                    )}
                    {r.author_name && <span className="text-muted-foreground">{r.author_name}</span>}
                    {r.author_country && (
                      <span className="text-muted-foreground">· {r.author_country}</span>
                    )}
                  </div>
                  <span className="text-muted-foreground">{fmtDate(r.posted_at)}</span>
                </div>
                {r.title && <div className="font-medium text-sm">{r.title}</div>}
                {r.body && (
                  <p className="text-sm text-foreground/80 whitespace-pre-wrap">{r.body}</p>
                )}
              </div>
            ))
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}