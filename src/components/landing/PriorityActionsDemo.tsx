import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  AlertTriangle,
  Clock,
  CheckCircle2,
  Star,
  ArrowRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

interface DemoReview {
  id: string;
  reviewer: string;
  rating: number;
  text: string;
  date: string;
  priority: "critical" | "urgent" | "normal";
}

const DEMO_REVIEWS: DemoReview[] = [
  {
    id: "1",
    reviewer: "Ahmet Y.",
    rating: 1,
    text: "Berbat deneyim. Siparişim 2 saat geç geldi ve yemekler soğuktu.",
    date: "Bugün",
    priority: "critical",
  },
  {
    id: "2",
    reviewer: "Zeynep K.",
    rating: 2,
    text: "Beklentilerimi karşılamadı. Personel ilgisizdi.",
    date: "Bugün",
    priority: "critical",
  },
  {
    id: "3",
    reviewer: "Mehmet S.",
    rating: 3,
    text: "Ortalama bir deneyim. Fiyat/performans uyumlu değil.",
    date: "Dün",
    priority: "urgent",
  },
  {
    id: "4",
    reviewer: "Elif D.",
    rating: 4,
    text: "Genel olarak memnun kaldım, sadece servis biraz yavaştı.",
    date: "2 gün önce",
    priority: "normal",
  },
  {
    id: "5",
    reviewer: "Can B.",
    rating: 5,
    text: "Harika! Kesinlikle tekrar geleceğim.",
    date: "3 gün önce",
    priority: "normal",
  },
];

export function PriorityActionsDemo() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [selectedReview, setSelectedReview] = useState<string | null>(null);

  const criticalCount = DEMO_REVIEWS.filter((r) => r.priority === "critical").length;
  const urgentCount = DEMO_REVIEWS.filter((r) => r.priority === "urgent").length;

  const getPriorityConfig = (priority: "critical" | "urgent" | "normal") => {
    switch (priority) {
      case "critical":
        return {
          icon: AlertTriangle,
          color: "text-red-600",
          bg: "bg-red-50",
          border: "border-red-200",
          badge: "bg-red-100 text-red-700",
          label: t("landing.priorityDemo.critical", "Kritik"),
        };
      case "urgent":
        return {
          icon: Clock,
          color: "text-amber-600",
          bg: "bg-amber-50",
          border: "border-amber-200",
          badge: "bg-amber-100 text-amber-700",
          label: t("landing.priorityDemo.urgent", "Acil"),
        };
      default:
        return {
          icon: CheckCircle2,
          color: "text-green-600",
          bg: "bg-green-50",
          border: "border-green-200",
          badge: "bg-green-100 text-green-700",
          label: t("landing.priorityDemo.normal", "Normal"),
        };
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-3 h-3 ${
          i < rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30"
        }`}
      />
    ));
  };

  return (
    <Card className="shadow-card border-2 border-primary/10">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-red-100">
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <CardTitle className="text-lg">
                {t("landing.priorityDemo.title", "Öncelikli İşlemler")}
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                {t("landing.priorityDemo.subtitle", "Bugün yanıtlanması gereken yorumlar")}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Badge variant="secondary" className="bg-red-100 text-red-700">
              {criticalCount} {t("landing.priorityDemo.critical", "Kritik")}
            </Badge>
            <Badge variant="secondary" className="bg-amber-100 text-amber-700">
              {urgentCount} {t("landing.priorityDemo.urgent", "Acil")}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        <ScrollArea className="h-[280px] pr-2">
          <div className="space-y-2">
            {DEMO_REVIEWS.map((review) => {
              const config = getPriorityConfig(review.priority);
              const Icon = config.icon;
              const isSelected = selectedReview === review.id;

              return (
                <div
                  key={review.id}
                  onClick={() => setSelectedReview(isSelected ? null : review.id)}
                  className={`p-3 rounded-lg border cursor-pointer transition-all ${
                    isSelected
                      ? `${config.bg} ${config.border}`
                      : "border-border hover:border-primary/30 hover:bg-muted/50"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Icon className={`w-4 h-4 ${config.color}`} />
                      <span className="font-medium text-sm">{review.reviewer}</span>
                      <div className="flex">{renderStars(review.rating)}</div>
                    </div>
                    <Badge variant="secondary" className={`text-xs ${config.badge}`}>
                      {config.label}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                    {review.text}
                  </p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-muted-foreground">{review.date}</span>
                    {isSelected && (
                      <Button size="sm" variant="ghost" className="h-6 text-xs text-primary">
                        {t("landing.priorityDemo.reply", "Yanıtla")} →
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>

        <Button
          onClick={() => navigate("/register")}
          className="w-full gradient-primary text-white"
        >
          {t("landing.priorityDemo.cta", "Tüm Yorumları Yönet")}
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </CardContent>
    </Card>
  );
}
