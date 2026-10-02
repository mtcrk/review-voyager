import { useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Zap } from "lucide-react";
import { Link } from "@/components/Link";
import { supabase } from "@/integrations/supabase/client";
import { invokeAuthedFunction } from "@/lib/invokeAuthedFunction";
import { BOARD_LABELS, type BoardType, fmtTry, isoDay } from "@/lib/priceTracking";
import { toast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type Subject = { key: string; name: string };
type Market = "domestic" | "international" | "both";
type Row = {
  subject_type: string; competitor_id: string | null; source: string; room_name: string | null; board_type: BoardType;
  refundable: boolean | null; price_per_night: number | null; price_total: number | null; no_availability: boolean;
  min_stay_nights: number | null; queried_nights: number | null; fetched_at: string; reason: string | null;
};
type ChunkResult = { date: string; market: string; rows: Row[]; refunded: number; missing: string[] };

const MAX_DAYS = 7;
const addDay = (iso: string, n: number) => {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
};

export function useCreditBalance(businessId?: string) {
  return useQuery({
    queryKey: ["price-credit-balance", businessId],
    enabled: !!businessId,
    queryFn: async () => {
      const { data, error } = await supabase.rpc("price_credit_balance" as any, { _business_id: businessId });
      if (error) throw error;
      return Number(data ?? 0);
    },
  });
}

export function InstantQueryDialog({
  open, onOpenChange, businessId, subjects, initial, defaultNights,
}: {
  open: boolean; onOpenChange: (v: boolean) => void; businessId: string; subjects: Subject[]; initial?: string[]; defaultNights: number;
}) {
  const qc = useQueryClient();
  const today = isoDay(new Date());
  const [sel, setSel] = useState<string[]>([]);
  const [from, setFrom] = useState(today);
  const [to, setTo] = useState(today);
  const [nights, setNights] = useState(defaultNights);
  const [adults, setAdults] = useState(2);
  const [market, setMarket] = useState<Market>("both");
  const [step, setStep] = useState<"form" | "confirm" | "running" | "done">("form");
  const [progress, setProgress] = useState({ done: 0, total: 0 });
  const [results, setResults] = useState<ChunkResult[]>([]);
  const [refunded, setRefunded] = useState(0);
  const { data: balance = 0 } = useCreditBalance(businessId);

  useEffect(() => {
    if (open) {
      setSel(initial?.length ? initial : []);
      setStep("form"); setResults([]); setRefunded(0); setNights(defaultNights);
    }
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  const days = useMemo(() => {
    if (!from || !to || to < from) return 0;
    let n = 0;
    for (let d = from; d <= to && n <= MAX_DAYS; d = addDay(d, 1)) n++;
    return n;
  }, [from, to]);
  const credits = sel.length * days * (market === "both" ? 2 : 1);
  const tooMany = credits > 20;
  const tooLong = days > MAX_DAYS;
  const insufficient = credits > balance;
  const nameOf = (r: Row) => subjects.find((s) => s.key === (r.subject_type === "own" ? "own" : r.competitor_id))?.name ?? "—";

  const run = async () => {
    setStep("running");
    let started: any;
    try {
      started = await invokeAuthedFunction("instant-price-query", {
        body: { action: "start", business_id: businessId, subjects: sel, from, to, nights, adults, market },
      });
    } catch (e) {
      toast({ title: "Sorgu başlatılamadı", description: e instanceof Error ? e.message : String(e), variant: "destructive" });
      setStep("confirm");
      return;
    }
    qc.invalidateQueries({ queryKey: ["price-credit-balance", businessId] });
    const chunks: { date: string; market: string }[] = started.chunks;
    setProgress({ done: 0, total: chunks.length });
    const out: ChunkResult[] = [];
    for (let i = 0; i < chunks.length; i++) {
      try {
        const r: any = await invokeAuthedFunction("instant-price-query", {
          body: { action: "run", business_id: businessId, query_id: started.query_id, ...chunks[i] },
        });
        out.push(r);
      } catch (e) {
        toast({ title: "Bir parça alınamadı", description: e instanceof Error ? e.message : String(e), variant: "destructive" });
      }
      setResults([...out]);
      setProgress({ done: i + 1, total: chunks.length });
    }
    try {
      const fin: any = await invokeAuthedFunction("instant-price-query", {
        body: { action: "finish", business_id: businessId, query_id: started.query_id },
      });
      setRefunded(fin?.refunded ?? 0);
    } catch { /* iade bir sonraki finish çağrısında da yapılabilir */ }
    qc.invalidateQueries({ queryKey: ["price-credit-balance", businessId] });
    qc.invalidateQueries({ queryKey: ["pt-snaps", businessId] });
    setStep("done");
  };

  return (
    <Dialog open={open} onOpenChange={(v) => step !== "running" && onOpenChange(v)}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><Zap className="h-4 w-4 text-primary" />Anlık fiyat sorgusu</DialogTitle>
          <DialogDescription>
            Önbelleği atlayıp tüm kaynaklardan canlı fiyat çeker. 1 kredi = 1 otel × 1 tarih × 1 pazar. Bakiye: <b>{balance} kredi</b>
          </DialogDescription>
        </DialogHeader>

        {(step === "form" || step === "confirm") && (
          <div className="space-y-4">
            <div>
              <Label className="mb-1.5 block">Oteller</Label>
              <div className="grid max-h-44 grid-cols-1 gap-1 overflow-y-auto rounded-md border p-2 sm:grid-cols-2">
                {subjects.map((s) => (
                  <label key={s.key} className="flex items-center gap-2 text-sm">
                    <Checkbox
                      checked={sel.includes(s.key)}
                      onCheckedChange={(v) => setSel((p) => (v ? [...p, s.key] : p.filter((x) => x !== s.key)))}
                    />
                    <span className="truncate">{s.name}{s.key === "own" ? " (otelimiz)" : ""}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Giriş (ilk)</Label><Input type="date" min={today} value={from} onChange={(e) => { setFrom(e.target.value); if (to < e.target.value) setTo(e.target.value); }} /></div>
              <div><Label>Giriş (son)</Label><Input type="date" min={from} value={to} onChange={(e) => setTo(e.target.value)} /></div>
              <div>
                <Label>Gece</Label>
                <Select value={String(nights)} onValueChange={(v) => setNights(Number(v))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{[1, 2, 3, 7].map((n) => <SelectItem key={n} value={String(n)}>{n} gece</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label>Yetişkin</Label>
                <Select value={String(adults)} onValueChange={(v) => setAdults(Number(v))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{[1, 2, 3, 4].map((n) => <SelectItem key={n} value={String(n)}>{n} yetişkin</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="col-span-2">
                <Label>Pazar</Label>
                <Select value={market} onValueChange={(v) => setMarket(v as Market)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="domestic">Yurt içi (ETS · Jolly · Tatil Sepeti)</SelectItem>
                    <SelectItem value="international">Uluslararası (Google · Booking)</SelectItem>
                    <SelectItem value="both">İkisi</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="rounded-md border bg-muted/40 p-3 text-sm">
              <div className="flex items-center justify-between">
                <span>{sel.length} otel × {days} tarih × {market === "both" ? 2 : 1} pazar</span>
                <span className="font-semibold">{credits} kredi</span>
              </div>
              {tooLong && <p className="mt-1 text-destructive">En fazla {MAX_DAYS} günlük aralık seçebilirsin.</p>}
              {tooMany && <p className="mt-1 text-destructive">Tek seferde en fazla 20 kredi harcanabilir.</p>}
              {!tooMany && insufficient && credits > 0 && (
                <div className="mt-2 flex items-center justify-between gap-2">
                  <span className="text-destructive">Kredi yetersiz (bakiye {balance}).</span>
                  <Button size="sm" variant="outline" asChild><Link to="/settings?tab=price-tracking#krediler">Paket al</Link></Button>
                </div>
              )}
              <p className="mt-1 text-xs text-muted-foreground">Hiçbir kaynaktan cevap alınamayan otel × tarih × pazar için kredi otomatik iade edilir. Booking 1–2 dakika sürebilir.</p>
            </div>

            {step === "form" ? (
              <Button className="w-full" disabled={!credits || tooMany || tooLong || insufficient} onClick={() => setStep("confirm")}>
                Devam
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={() => setStep("form")}>Geri</Button>
                <Button className="flex-1" onClick={run}><Zap className="mr-1 h-4 w-4" />{credits} kredi harca ve sorgula</Button>
              </div>
            )}
          </div>
        )}

        {(step === "running" || step === "done") && (
          <div className="space-y-3">
            {step === "running" ? (
              <div className="flex items-center gap-2 text-sm">
                <Loader2 className="h-4 w-4 animate-spin" />
                Sorgulanıyor {Math.min(progress.done + 1, progress.total || 1)}/{progress.total || "…"} — Booking 1–2 dakika sürebilir, pencereyi kapatma.
              </div>
            ) : (
              <div className="text-sm">
                Tamamlandı. {refunded > 0 ? `${refunded} kredi iade edildi (cevap alınamayan kısımlar).` : "Tüm kısımlar için cevap alındı."} Sonuçlar takvime de işlendi.
              </div>
            )}
            {results.map((r) => (
              <div key={`${r.date}|${r.market}`} className="rounded-md border">
                <div className="flex items-center justify-between border-b bg-muted/40 px-3 py-1.5 text-xs font-medium">
                  <span>{r.date} · {r.market === "domestic" ? "Yurt içi" : "Uluslararası"}</span>
                  {r.refunded > 0 && <Badge variant="outline" className="text-[10px]">{r.refunded} kredi iade</Badge>}
                </div>
                <div className="max-h-64 overflow-auto">
                  <table className="w-full text-xs">
                    <thead className="text-muted-foreground">
                      <tr><th className="px-2 py-1 text-left">Otel · kaynak</th><th className="px-2 py-1 text-left">Oda · pansiyon</th><th className="px-2 py-1 text-left">İptal</th><th className="px-2 py-1 text-right">Gecelik / toplam</th><th className="px-2 py-1 text-right">Saat</th></tr>
                    </thead>
                    <tbody>
                      {[...r.rows].sort((a, b) => nameOf(a).localeCompare(nameOf(b)) || (Number(a.price_per_night ?? 1e12) - Number(b.price_per_night ?? 1e12))).map((x, i) => (
                        <tr key={i} className="border-t">
                          <td className="px-2 py-1"><div className="font-medium">{nameOf(x)}</div><div className="text-muted-foreground">{x.source}</div></td>
                          <td className="px-2 py-1">
                            {x.no_availability
                              ? <span className="text-muted-foreground">{x.reason === "not_on_sale" ? "satışta değil" : x.reason === "min_stay" ? "min. konaklama şartı" : "fiyat yok"}</span>
                              : <>{x.room_name ?? "—"} · {BOARD_LABELS[x.board_type] ?? x.board_type}{x.min_stay_nights ? ` · min ${x.min_stay_nights} gece` : ""}</>}
                          </td>
                          <td className="px-2 py-1">{x.refundable == null ? "—" : x.refundable ? "Ücretsiz iptal" : "İade edilemez"}</td>
                          <td className="px-2 py-1 text-right tabular-nums">
                            {x.price_per_night ? <>{fmtTry(Number(x.price_per_night))}{x.price_total ? <div className="text-muted-foreground">{fmtTry(Number(x.price_total))}</div> : null}</> : "—"}
                          </td>
                          <td className="px-2 py-1 text-right text-muted-foreground">{new Date(x.fetched_at).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })}</td>
                        </tr>
                      ))}
                      {!r.rows.length && <tr><td colSpan={5} className="px-2 py-2 text-muted-foreground">Bu kısım için cevap alınamadı.</td></tr>}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
            {step === "done" && <Button className="w-full" variant="outline" onClick={() => onOpenChange(false)}>Kapat</Button>}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
