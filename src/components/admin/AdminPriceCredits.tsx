import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { invokeAuthedFunction } from "@/lib/invokeAuthedFunction";
import { toast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function AdminPriceCredits() {
  const { data: stats, refetch } = useQuery({
    queryKey: ["admin-price-credits"],
    queryFn: () => invokeAuthedFunction("price-credits-admin", { body: { action: "stats" } }) as Promise<any>,
  });
  const [q, setQ] = useState("");
  const [found, setFound] = useState<any[]>([]);
  const [pick, setPick] = useState<any | null>(null);
  const [credits, setCredits] = useState("20");
  const [note, setNote] = useState("Pilot / demo");

  const search = async () => {
    const r: any = await invokeAuthedFunction("price-credits-admin", { body: { action: "search", q } });
    setFound(r.businesses ?? []);
  };
  const grant = async () => {
    try {
      const r: any = await invokeAuthedFunction("price-credits-admin", { body: { action: "grant", business_id: pick.id, credits: Number(credits), note } });
      toast({ title: `${r.credits} kredi verildi`, description: r.business });
      refetch();
    } catch (e) {
      toast({ title: "Kredi verilemedi", description: e instanceof Error ? e.message : String(e), variant: "destructive" });
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader><CardTitle className="text-base">Anlık sorgu — son 30 gün</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
          <div><div className="text-muted-foreground">Harcanan kredi (net)</div><div className="text-xl font-semibold">{stats?.net_credits ?? "…"}</div><div className="text-xs text-muted-foreground">{stats?.spent ?? 0} harcama · {stats?.refunded ?? 0} iade</div></div>
          <div><div className="text-muted-foreground">Gerçek maliyet</div><div className="text-xl font-semibold">${stats?.cost_usd ?? "…"}</div></div>
          <div><div className="text-muted-foreground">Kredi başına maliyet</div><div className="text-xl font-semibold">{stats?.cost_per_credit_usd != null ? `$${stats.cost_per_credit_usd}` : "—"}</div></div>
          <div><div className="text-muted-foreground">Satılan / verilen</div><div className="text-xl font-semibold">{stats?.purchased ?? 0} / {stats?.granted ?? 0}</div></div>
          <div className="col-span-2 space-y-0.5 sm:col-span-4">
            {Object.entries(stats?.by_adapter ?? {}).map(([a, v]: any) => (
              <div key={a} className="flex justify-between text-xs"><span>{a}</span><span>{v.calls} çağrı · ${v.cost.toFixed(4)}</span></div>
            ))}
            {(stats?.by_business ?? []).map((b: any) => (
              <div key={b.business_id} className="flex justify-between border-t pt-0.5 text-xs"><span>{b.name}</span><span>{b.spent - b.refunded} kredi · ${b.cost}</span></div>
            ))}
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle className="text-base">İşletmeye kredi ver</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          <div className="flex gap-2">
            <Input placeholder="İşletme adı" value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={(e) => e.key === "Enter" && search()} />
            <Button variant="outline" onClick={search}>Ara</Button>
          </div>
          {found.map((b) => (
            <button key={b.id} onClick={() => setPick(b)} className={`block w-full rounded border px-2 py-1 text-left text-sm ${pick?.id === b.id ? "border-primary bg-primary/5" : ""}`}>
              {b.name} <span className="text-muted-foreground">{b.city ?? ""}</span>
            </button>
          ))}
          {pick && (
            <div className="flex flex-wrap gap-2">
              <Input className="w-24" type="number" min={1} value={credits} onChange={(e) => setCredits(e.target.value)} />
              <Input className="flex-1" value={note} onChange={(e) => setNote(e.target.value)} />
              <Button onClick={grant}>{pick.name} için ver</Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
