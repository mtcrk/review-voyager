import { Link } from "@/components/Link";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function BillingSuccess() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold mb-2">Ödemeniz alındı</h1>
        <p className="text-muted-foreground mb-6">
          Aboneliğiniz kısa süre içinde aktive edilecek.
        </p>
        <Button asChild><Link to="/dashboard">Panele Dön</Link></Button>
        <p className="text-sm text-muted-foreground mt-6 pt-4 border-t">
          Kart ekstrenizde bu işlem PAYTR / VoyageRespond olarak görünecektir.
        </p>
      </div>
    </div>
  );
}