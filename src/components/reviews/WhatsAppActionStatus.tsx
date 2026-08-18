import { useQuery } from "@tanstack/react-query";
import { MessageCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";

const STATUS_LABELS: Record<string, string> = {
  pending: "WhatsApp'tan onay bekliyor",
  editing: "WhatsApp'ta düzenleniyor",
  approved: "WhatsApp'tan onaylandı",
  skipped: "WhatsApp'tan atlandı",
  expired: "WhatsApp bildirimi zaman aşımına uğradı",
};

const STATUS_VARIANTS: Record<string, "default" | "secondary" | "outline"> = {
  pending: "secondary",
  editing: "secondary",
  approved: "default",
  skipped: "outline",
  expired: "outline",
};

export function WhatsAppActionStatus({ reviewId }: { reviewId: string }) {
  const { data } = useQuery({
    queryKey: ["wa-pending-action", reviewId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("wa_pending_actions")
        .select("id, status, created_at, consumed_at")
        .eq("review_id", reviewId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  if (!data) return null;

  const label = STATUS_LABELS[data.status] ?? data.status;
  const stamp = data.consumed_at ?? data.created_at;

  return (
    <div className="flex items-center gap-2 rounded-lg border bg-muted/40 px-3 py-2 text-sm">
      <MessageCircle className="h-4 w-4 text-muted-foreground" />
      <Badge variant={STATUS_VARIANTS[data.status] ?? "outline"}>{label}</Badge>
      {stamp && (
        <span className="text-xs text-muted-foreground">
          {new Date(stamp).toLocaleString("tr-TR")}
        </span>
      )}
    </div>
  );
}
