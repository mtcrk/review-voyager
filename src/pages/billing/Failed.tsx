import { Link } from "@/components/Link";
import { XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function BillingFailed() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <XCircle className="w-16 h-16 text-destructive mx-auto mb-4" />
        <h1 className="text-2xl font-bold mb-2">Ödeme başarısız</h1>
        <p className="text-muted-foreground mb-6">
          Kartınızdan çekim yapılamadı. Farklı bir kartla yeniden deneyebilirsiniz.
        </p>
        <div className="flex gap-3 justify-center">
          <Button asChild><Link to="/billing/checkout">Tekrar Dene</Link></Button>
          <Button asChild variant="outline"><Link to="/dashboard">Panele Dön</Link></Button>
        </div>
      </div>
    </div>
  );
}