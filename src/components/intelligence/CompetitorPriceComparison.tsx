import { Link } from "@/components/Link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tag, ArrowRight } from "lucide-react";

type Competitor = { id: string; name: string };

/** Fiyat karşılaştırması artık ayrı "Fiyat Takibi" sayfasında. */
export function CompetitorPriceComparison(_props: { businessId: string; competitors: Competitor[] }) {
  return (
    <Card className="shadow-card">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <Tag className="h-4 w-4 text-primary" /> Fiyat karşılaştırması
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          Rakiplerinin gecelik fiyatlarını aynı pansiyon tipinde, 60 güne kadar takvim üzerinde karşılaştır.
        </p>
        <Button asChild size="sm">
          <Link to="/fiyat-takibi">Fiyatları getir <ArrowRight className="ml-1 h-4 w-4" /></Link>
        </Button>
      </CardContent>
    </Card>
  );
}
