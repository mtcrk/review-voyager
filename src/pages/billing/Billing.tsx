import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useBusiness } from "@/contexts/BusinessContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { CreditCard, Loader2, Plus, RefreshCw, Wallet } from "lucide-react";

type Subscription = {
  id: string;
  plan_code: string;
  amount: number;
  currency: string;
  status: string;
  next_billing_date: string | null;
  location_count?: number | null;
  addon_codes?: string[] | null;
  computed_total?: number | null;
};

type CardInfo = {
  last_4: string | null;
  brand: string | null;
  bank: string | null;
  schema?: string | null;
};

type PaymentLog = {
  id: string;
  created_at: string;
  payment_amount: number;
  status: string;
  is_recurring: boolean;
};

const PLAN_LABEL: Record<string, string> = {
  hotel_flat: "Otel",
  restaurant_base: "Restoran",
  salon_flat: "Kuaför / Güzellik / Spa",
  clinic_flat: "Klinik",
  // Legacy fallbacks (older subscriptions)
  starter_monthly: "Starter",
  pro_monthly: "Pro",
  agency_monthly: "Agency",
};

const ADDON_LABEL: Record<string, string> = {
  competitor_analysis: "Rakip Analizi",
  ai_visibility: "AI Görünürlük Takibi",
};

function statusBadge(status: string) {
  const map: Record<string, { label: string; cls: string }> = {
    active: { label: "Aktif", cls: "bg-emerald-50 text-emerald-700 border-emerald-200" },
    past_due: { label: "Gecikmiş", cls: "bg-orange-50 text-orange-700 border-orange-200" },
    canceled: { label: "İptal Edildi", cls: "bg-muted text-muted-foreground border-border" },
  };
  const m = map[status] ?? { label: status, cls: "bg-muted text-muted-foreground border-border" };
  return <Badge variant="outline" className={m.cls}>{m.label}</Badge>;
}

function paymentStatusBadge(status: string) {
  const map: Record<string, { label: string; cls: string }> = {
    success: { label: "Başarılı", cls: "bg-emerald-50 text-emerald-700 border-emerald-200" },
    failed: { label: "Başarısız", cls: "bg-red-50 text-red-700 border-red-200" },
    wait_callback: { label: "Bekliyor", cls: "bg-amber-50 text-amber-700 border-amber-200" },
  };
  const m = map[status] ?? { label: status, cls: "bg-muted text-muted-foreground border-border" };
  return <Badge variant="outline" className={m.cls}>{m.label}</Badge>;
}

export default function Billing() {
  const navigate = useNavigate();
  const { activeBusiness, loading: bizLoading } = useBusiness();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [card, setCard] = useState<CardInfo | null>(null);
  const [payments, setPayments] = useState<PaymentLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancelLoading, setCancelLoading] = useState(false);

  const load = async () => {
    if (!activeBusiness) return;
    setLoading(true);
    try {
      const [subRes, payRes, cardRes] = await Promise.all([
        supabase
          .from("subscription_billing")
          .select("id,plan_code,amount,currency,status,next_billing_date,location_count,addon_codes,computed_total")
          .eq("business_id", activeBusiness.id)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle(),
        supabase
          .from("paytr_payment_log")
          .select("id,created_at,payment_amount,status,is_recurring")
          .eq("business_id", activeBusiness.id)
          .order("created_at", { ascending: false })
          .limit(50),
        supabase.functions.invoke("paytr-list-cards", {
          body: { business_id: activeBusiness.id },
        }),
      ]);

      setSubscription((subRes.data as Subscription | null) ?? null);
      setPayments((payRes.data as PaymentLog[] | null) ?? []);

      if (!cardRes.error && cardRes.data) {
        const d = cardRes.data as { cards?: CardInfo[] };
        const first = Array.isArray(d.cards) && d.cards.length > 0 ? d.cards[0] : null;
        setCard(first && first.last_4 ? first : null);
      } else {
        setCard(null);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!bizLoading && activeBusiness) load();
     
  }, [bizLoading, activeBusiness?.id]);

  const handleCancel = async () => {
    if (!activeBusiness) return;
    setCancelLoading(true);
    try {
      const { error } = await supabase.functions.invoke("paytr-cancel-subscription", {
        body: { business_id: activeBusiness.id },
      });
      if (error) throw error;
      toast({ title: "Abonelik iptal edildi", description: "Bir sonraki tahsilat yapılmayacak." });
      await load();
    } catch (e) {
      toast({ title: "İptal başarısız", description: (e as Error).message, variant: "destructive" });
    } finally {
      setCancelLoading(false);
    }
  };

  if (bizLoading || loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Abonelik Yönetimi</h1>
        <p className="text-muted-foreground mt-1">
          Planınızı, kayıtlı kartınızı ve ödeme geçmişinizi buradan yönetin.
        </p>
      </div>

      {/* Current Plan */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="w-5 h-5 text-primary" /> Mevcut Plan
          </CardTitle>
        </CardHeader>
        <CardContent>
          {subscription ? (
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <span className="text-xl font-semibold">
                    {PLAN_LABEL[subscription.plan_code] ?? subscription.plan_code}
                  </span>
                  {statusBadge(subscription.status)}
                </div>
                <div className="text-muted-foreground text-sm">
                  {Number(subscription.amount).toLocaleString("tr-TR")} {subscription.currency} / ay
                </div>
                {(subscription.location_count && subscription.location_count > 1) ||
                (subscription.addon_codes && subscription.addon_codes.length > 0) ? (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {subscription.location_count && subscription.location_count > 1 && (
                      <Badge variant="secondary" className="font-normal">
                        {subscription.location_count} lokasyon
                      </Badge>
                    )}
                    {(subscription.addon_codes ?? []).map((code) => (
                      <Badge key={code} variant="secondary" className="font-normal">
                        {ADDON_LABEL[code] ?? code}
                      </Badge>
                    ))}
                  </div>
                ) : null}
                {subscription.next_billing_date && subscription.status === "active" && (
                  <div className="text-sm text-muted-foreground">
                    Sonraki tahsilat:{" "}
                    <span className="font-medium text-foreground">
                      {new Date(subscription.next_billing_date).toLocaleDateString("tr-TR")}
                    </span>
                  </div>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                <Button onClick={() => navigate("/billing/checkout")}>
                  Planı Yükselt / Değiştir
                </Button>
                {subscription.status !== "canceled" && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline">Aboneliği İptal Et</Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Aboneliği iptal etmek istediğinize emin misiniz?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Aboneliğiniz iptal edilecek ve bir sonraki tahsilat alınmayacak.
                          Erişiminiz mevcut dönemin sonuna kadar devam eder.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Vazgeç</AlertDialogCancel>
                        <AlertDialogAction onClick={handleCancel} disabled={cancelLoading}>
                          {cancelLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                          Evet, İptal Et
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </div>
            </div>
          ) : (
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <p className="text-muted-foreground">
                Henüz aktif bir aboneliğiniz yok. Bir plan seçerek başlayın.
              </p>
              <Button onClick={() => navigate("/billing/checkout")}>Plan Seç</Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Saved Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-primary" /> Kayıtlı Kart
          </CardTitle>
        </CardHeader>
        <CardContent>
          {card && card.last_4 ? (
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center">
                  <CreditCard className="w-6 h-6 text-muted-foreground" />
                </div>
                <div>
                  <div className="font-medium">
                    {(card.schema ?? card.brand ?? "Kart").toString().toUpperCase()} •••• {card.last_4}
                  </div>
                  {card.bank && (
                    <div className="text-sm text-muted-foreground">{card.bank}</div>
                  )}
                </div>
              </div>
              <Button variant="outline" onClick={() => navigate("/billing/checkout?mode=update-card")}>
                <RefreshCw className="w-4 h-4 mr-2" /> Kartı Güncelle
              </Button>
            </div>
          ) : (
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <p className="text-muted-foreground">Henüz kayıtlı kart yok.</p>
              <Button onClick={() => navigate("/billing/checkout")}>
                <Plus className="w-4 h-4 mr-2" /> Kart Ekle
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payment History */}
      <Card>
        <CardHeader>
          <CardTitle>Ödeme Geçmişi</CardTitle>
        </CardHeader>
        <CardContent>
          {payments.length === 0 ? (
            <p className="text-muted-foreground text-sm">Henüz ödeme kaydı yok.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th className="py-2 pr-4 font-medium">Tarih</th>
                    <th className="py-2 pr-4 font-medium">Tutar</th>
                    <th className="py-2 pr-4 font-medium">Tür</th>
                    <th className="py-2 pr-4 font-medium">Durum</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((p) => (
                    <tr key={p.id} className="border-b last:border-0">
                      <td className="py-3 pr-4">
                        {new Date(p.created_at).toLocaleString("tr-TR", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                      </td>
                      <td className="py-3 pr-4 font-medium">
                        {Number(p.payment_amount).toLocaleString("tr-TR")} TL
                      </td>
                      <td className="py-3 pr-4 text-muted-foreground">
                        {p.is_recurring ? "Otomatik Yenileme" : "Tek Seferlik"}
                      </td>
                      <td className="py-3 pr-4">{paymentStatusBadge(p.status)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}