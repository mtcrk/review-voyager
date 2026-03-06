import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  AlertTriangle, 
  Clock, 
  Star, 
  ArrowRight,
  CheckCircle,
  MessageSquare
} from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Review {
  id: string;
  reviewer_name: string;
  rating: number;
  text: string | null;
  posted_at: string;
  status: string | null;
  sentiment: string | null;
}

interface PriorityActionsProps {
  reviews: Review[];
}

type PriorityFilter = "all" | "critical" | "urgent" | "normal";

export function PriorityActions({ reviews }: PriorityActionsProps) {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState<PriorityFilter>("all");

  const priorityReviews = useMemo(() => {
    const now = new Date();
    const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);

    // Filter pending reviews
    const pending = reviews.filter(r => r.status === "pending_reply");

    // Categorize by priority
    const critical = pending.filter(r => 
      r.rating <= 2 || r.sentiment === "negative"
    );
    
    const urgent = pending.filter(r => {
      const postedDate = new Date(r.posted_at);
      return postedDate >= threeDaysAgo && !critical.includes(r);
    });

    const normal = pending.filter(r => 
      !critical.includes(r) && !urgent.includes(r)
    );

    return {
      critical: critical.slice(0, 3),
      urgent: urgent.slice(0, 2),
      normal: normal.slice(0, 2),
      totalPending: pending.length,
    };
  }, [reviews]);

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) return `${diffDays}g önce`;
    if (diffHours > 0) return `${diffHours}s önce`;
    return "Az önce";
  };

  const allPriorityReviews = [
    ...priorityReviews.critical.map(r => ({ ...r, priority: "critical" as const })),
    ...priorityReviews.urgent.map(r => ({ ...r, priority: "urgent" as const })),
    ...priorityReviews.normal.map(r => ({ ...r, priority: "normal" as const })),
  ];

  if (priorityReviews.totalPending === 0) {
    return (
      <Card className="shadow-card">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-green-100">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <CardTitle className="text-lg">Öncelikli İşlemler</CardTitle>
              <p className="text-sm text-muted-foreground">Tüm yorumlar yanıtlandı!</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
            <p className="text-muted-foreground">
              Harika! Bekleyen yorum yok.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-card">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-amber-100">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <CardTitle className="text-lg">Bugün Yanıtla</CardTitle>
              <p className="text-sm text-muted-foreground">
                {priorityReviews.totalPending} yorum bekliyor
              </p>
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => navigate("/reviews")}
          >
            Tümünü Gör
            <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        {/* Priority Summary */}
        <div className="flex gap-2 flex-wrap">
          {priorityReviews.critical.length > 0 && (
            <Badge variant="destructive" className="gap-1">
              <AlertTriangle className="w-3 h-3" />
              {priorityReviews.critical.length} Kritik
            </Badge>
          )}
          {priorityReviews.urgent.length > 0 && (
            <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100 gap-1">
              <Clock className="w-3 h-3" />
              {priorityReviews.urgent.length} Acil
            </Badge>
          )}
          {priorityReviews.normal.length > 0 && (
            <Badge variant="secondary" className="gap-1">
              <MessageSquare className="w-3 h-3" />
              {priorityReviews.normal.length} Normal
            </Badge>
          )}
        </div>

        {/* Review List */}
        <div className="space-y-2">
          {allPriorityReviews.slice(0, 5).map((review) => (
            <button
              key={review.id}
              onClick={() => navigate(`/reviews/${review.id}`)}
              className="w-full p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors text-left"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm truncate">
                      {review.reviewer_name}
                    </span>
                    <div className="flex items-center gap-0.5">
                      {Array.from({ length: review.rating }).map((_, i) => (
                        <Star 
                          key={i} 
                          className="w-3 h-3 fill-primary text-primary" 
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-1">
                    {review.text || "Yorum metni yok"}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-xs text-muted-foreground">
                    {getTimeAgo(review.posted_at)}
                  </span>
                  {review.priority === "critical" && (
                    <span className="w-2 h-2 rounded-full bg-red-500" />
                  )}
                  {review.priority === "urgent" && (
                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>

        {priorityReviews.totalPending > 5 && (
          <p className="text-xs text-center text-muted-foreground pt-2">
            +{priorityReviews.totalPending - 5} daha fazla yorum bekliyor
          </p>
        )}
      </CardContent>
    </Card>
  );
}
