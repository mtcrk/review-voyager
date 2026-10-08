import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, RefreshCw } from "lucide-react";
import { toast } from "@/hooks/use-toast";

type Src = {
  adapter: string; enabled: boolean; note: string | null;
  ok: number; no_prices: number; error: number; calls: number; cost_usd: number; last_call_at: string | null;
};
const LABELS: Record<string, string> = { etstur: "ETS Tur", jollytur: "Jolly Tur", tatilsepeti: "Tatil Sepeti", booking: "Booking.com", serpapi: "Google Hotels (SerpApi)" };

export function AdminPriceSources() {
  const [rows, setRows] = useState<Src[]>([]);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase.functions.invoke<{ sources: Src[] }>("admin-price-sources", { method: "GET" });
    setLoading(false);
    if (error || !data) { toast({ title: "Yüklenemedi", description: error?.message, variant: "destructive" }); return; }
    setRows(data.sources);
    setNotes(Object.fromEntries(data.sources.map((s) => [s.adapter, s.note ?? ""])));
  };
  useEffect(() => { load(); }, []);

  const save = async (adapter: string, patch: { enabled?: boolean; note?: string }) => {
    setSaving(adapter);
    const { error } = await supabase.functions.invoke("admin-price-sources", { method: "POST", body: { adapter, ...patch } });
    setSaving(null);
    if (error) { toast({ title: "Kaydedilemedi", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Kaydedildi" });
    load();
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base">Fiyat Kaynakları</CardTitle>
        <Button size="sm" variant="outline" onClick={load} disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
        </Button>
      </CardHeader>
      <CardContent>
        <p className="mb-3 text-xs text-muted-foreground">Kapalı kaynaklar zamanlanmış çekimde, "Şimdi yenile"de, anlık sorguda ve eşleştirmede atlanır. Sayılar son 24 saat.</p>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Kaynak</TableHead><TableHead>Açık</TableHead>
              <TableHead className="text-right">Fiyat var</TableHead><TableHead className="text-right">Fiyat yok</TableHead><TableHead className="text-right">Hata</TableHead>
              <TableHead className="text-right">Maliyet</TableHead><TableHead>Son çağrı</TableHead><TableHead>Not</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((s) => (
              <TableRow key={s.adapter}>
                <TableCell className="font-medium">{LABELS[s.adapter] ?? s.adapter}</TableCell>
                <TableCell><Switch checked={s.enabled} disabled={saving === s.adapter} onCheckedChange={(v) => save(s.adapter, { enabled: v })} /></TableCell>
                <TableCell className="text-right">{s.ok}</TableCell>
                <TableCell className="text-right">{s.no_prices}</TableCell>
                <TableCell className={s.error ? "text-right text-destructive" : "text-right"}>{s.error}</TableCell>
                <TableCell className="text-right">${s.cost_usd.toFixed(3)}</TableCell>
                <TableCell className="text-xs">{s.last_call_at ? new Date(s.last_call_at).toLocaleString("tr-TR") : "—"}</TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Input className="h-8 min-w-40" value={notes[s.adapter] ?? ""} onChange={(e) => setNotes({ ...notes, [s.adapter]: e.target.value })} />
                    <Button size="sm" variant="outline" disabled={saving === s.adapter || (notes[s.adapter] ?? "") === (s.note ?? "")} onClick={() => save(s.adapter, { note: notes[s.adapter] ?? "" })}>Kaydet</Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
