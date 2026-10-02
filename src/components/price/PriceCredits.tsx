import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { invokeAuthedFunction } from "@/lib/invokeAuthedFunction";
import { fmtTry } from "@/lib/priceTracking";
import { toast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useCreditBalance } from "./InstantQueryDialog";

const REASON: Record<string, string> = { purchase: "Satın alma", instant_query: "Anlık sorgu", refund: "İade", admin_grant: "Tanımlama" };

export function PriceCredits({ businessId }: { businessId: string }) {
  const qc = useQueryClient();
  const { data: balance, isLoading } = useCreditBalance(businessId);
  const [buying, setBuying] = useState<string | null>(null);
  const [iframe, setIframe] = useState<string | null>(null);

  const { data: packages = [] } = useQuery({
    queryKey: ["price-credit-packages"],
    queryFn: async () => {
      const { data } = await supabase.from("price_credit_packages" as any).select("id, name, credits, price_try").eq("is_active", true).order("sort");
      return (data ?? []) as any[];
    },
  });
  const { data: ledger = [] } = useQuery({
    queryKey: ["price-credit-ledger", businessId],
    queryFn: async () => {
      const { data } = await supabase.from("price_credit_ledger" as any).select("id, delta, reason, note, created_at").eq("business_id", businessId).order("created_at", { ascending: false }).limit(50);
      return (data ?? []) as any[];
    },
  });

  useEffect(() => {
    if (!iframe) return;
    const id = "paytr-iframe-resizer";
    const init = () => (window as any).iFrameResize?.({}, "#paytrcreditframe");
    if (document.getElementById(id)) { init(); return; }
    const s = document.createElement("script");
    s.id = id; s.src = "https://www.paytr.com/js/iframeResizer.min.js"; s.onload = init;
    document.body.appendChild(s);
  }, [iframe]);

  const buy = async (pkgId: string) => {
    setBuying(pkgId);
    try {
      const r: any = await invokeAuthedFunction("paytr-credit-checkout", { body: { business_id: businessId, package_id: pkgId } });
      setIframe(r.iframe_token);
    } catch (e) {
      toast({ title: "Ödeme başlatılamadı", description: e instanceof Error ? e.message : String(e), variant: "destructive" });
    } finally {
      setBuying(null);
    }
  };

  return (
    <Card id="krediler">
      <CardHeader>
        <CardTitle className="text-base">Krediler</CardTitle>
        <CardDescription>Anlık fiyat sorgusu için. 1 kredi = 1 otel × 1 tarih × 1 pazar.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-2xl font-semibold">{isLoading ? "…" : balance} <span className="text-sm font-normal text-muted-foreground">kredi</span></div>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          {packages.map((p) => (
            <div key={p.id} className="rounded-md border p-3">
              <div className="font-medium">{p.credits} kredi</div>
              <div className="text-sm text-muted-foreground">{fmtTry(Number(p.price_try))} · kredi başı {fmtTry(Number(p.price_try) / p.credits)}</div>
              <Button size="sm" className="mt-2 w-full" disabled={!!buying} onClick={() => buy(p.id)}>
                {buying === p.id ? <Loader2 className="h-4 w-4 animate-spin" /> : "Satın al"}
              </Button>
            </div>
          ))}
        </div>
        <div>
          <div className="mb-1 text-sm font-medium">Son hareketler</div>
          {ledger.length ? (
            <div className="max-h-64 divide-y overflow-auto rounded-md border text-sm">
              {ledger.map((l) => (
                <div key={l.id} className="flex items-center justify-between gap-2 px-3 py-1.5">
                  <div className="min-w-0">
                    <Badge variant="outline" className="mr-2 text-[10px]">{REASON[l.reason] ?? l.reason}</Badge>
                    <span className="text-muted-foreground">{l.note ?? ""}</span>
                  </div>
                  <div className="shrink-0 text-right">
                    <span className={l.delta > 0 ? "font-medium text-success" : "font-medium"}>{l.delta > 0 ? `+${l.delta}` : l.delta}</span>
                    <div className="text-[10px] text-muted-foreground">{new Date(l.created_at).toLocaleString("tr-TR")}</div>
                  </div>
                </div>
              ))}
            </div>
          ) : <p className="text-sm text-muted-foreground">Henüz hareket yok.</p>}
        </div>
      </CardContent>
      <Dialog open={!!iframe} onOpenChange={(v) => { if (!v) { setIframe(null); qc.invalidateQueries({ queryKey: ["price-credit-balance", businessId] }); qc.invalidateQueries({ queryKey: ["price-credit-ledger", businessId] }); } }}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Kredi satın al</DialogTitle></DialogHeader>
          {iframe && <iframe id="paytrcreditframe" src={`https://www.paytr.com/odeme/guvenli/${iframe}`} className="h-[600px] w-full border-0" scrolling="no" />}
        </DialogContent>
      </Dialog>
    </Card>
  );
}
