import { useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "@/components/Link";
import { supabase } from "@/integrations/supabase/client";
import { useBusiness } from "@/contexts/BusinessContext";
import { invokeAuthedFunction } from "@/lib/invokeAuthedFunction";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertTriangle, ArrowDown, ArrowUp, Loader2, RefreshCw, Settings2 } from "lucide-react";
import {
  ADAPTER_LABELS,
  BOARD_LABELS,
  COMPARABLE_BOARDS,
  type BoardType,
  type Cell,
  type OwnRate,
  type Snapshot,
  computeCell,
  fmtTry,
  groupBatches,
  isoDay,
  median,
} from "@/lib/priceTracking";

type Comp = {
  id: string;
  name: string;
  booking_matched_name: string | null;
  serpapi_matched_name: string | null;
  price_source_preference: string | null;
};

const DOW = ["Paz", "Pzt", "Sal", "Çar", "Per", "Cum", "Cmt"];

function dayMeta(iso: string) {
  const d = new Date(`${iso}T00:00:00Z`);
  const dow = d.getUTCDay();
  return { label: `${d.getUTCDate()}.${d.getUTCMonth() + 1}`, dow: DOW[dow], weekend: dow === 5 || dow === 6 };
}

const fmtTime = (iso: string) =>
  new Date(iso).toLocaleString("tr-TR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });

function CellView({ cell, median: med, isOwn }: { cell: Cell; median: number | null; isOwn: boolean }) {
  let tone = "";
  if (cell.kind === "value" && med) {
    const r = cell.value / med;
    if (r <= 0.85) tone = "bg-success/25";
    else if (r <= 0.95) tone = "bg-success/10";
    else if (r >= 1.15) tone = "bg-destructive/25";
    else if (r >= 1.05) tone = "bg-destructive/10";
  }
  const content =
    cell.kind === "value" ? (
      <span className="inline-flex items-center gap-0.5 font-semibold tabular-nums">
        {fmtTry(cell.value)}
        {cell.changePct != null && Math.abs(cell.changePct) > 10 &&
          (cell.changePct > 0 ? <ArrowUp className="h-3 w-3 text-destructive" /> : <ArrowDown className="h-3 w-3 text-success" />)}
      </span>
    ) : cell.kind === "sold_out" ? (
      <span className="text-[10px] leading-tight text-muted-foreground">fiyat yok — muhtemelen dolu</span>
    ) : cell.kind === "incomparable" ? (
      <span className="text-[10px] leading-tight text-warning">kıyaslanamaz</span>
    ) : (
      <span className="text-[10px] text-muted-foreground">henüz çekilmedi</span>
    );

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className={cn("h-full min-h-12 w-full rounded px-1 py-1 text-xs transition-colors hover:ring-1 hover:ring-primary/40", tone)}>
          {content}
          {cell.kind === "value" && isOwn && (
            <div className="mt-0.5 text-[9px] leading-none text-muted-foreground">
              {cell.badge === "manual" ? "otel girdi" : "tahmini"}
            </div>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-72 space-y-1.5 text-xs">
        {cell.kind === "value" && (
          <>
            <div className="flex items-center justify-between">
              <span className="text-base font-semibold">{fmtTry(cell.value)} / gece</span>
              <Badge variant={cell.badge === "manual" ? "default" : "secondary"} className="text-[10px]">
                {cell.badge === "manual" ? "Otel tarafından girildi" : `Tahmini (kaynak: ${cell.source})`}
              </Badge>
            </div>
            <Row k="Kaynak" v={`${cell.source}${cell.adapter !== "manual" ? ` · ${ADAPTER_LABELS[cell.adapter] ?? cell.adapter}` : ""}`} />
            <Row k="Çekim zamanı" v={cell.fetchedAt ? fmtTime(cell.fetchedAt) : "Manuel giriş"} />
            <Row k="Pansiyon" v={BOARD_LABELS[cell.board]} />
            <Row k="Oda" v={cell.roomName ?? "Belirtilmemiş"} />
            <Row k="İade" v={cell.refundable == null ? "Bilinmiyor" : cell.refundable ? "Ücretsiz iptal" : "İade edilemez"} />
            <Row k="Vergiler" v={cell.taxesIncluded == null ? "Bilinmiyor" : cell.taxesIncluded ? "Dahil" : "Hariç"} />
            {cell.prev != null && (
              <Row k="Önceki çekim" v={`${fmtTry(cell.prev)} (${cell.changePct! > 0 ? "+" : ""}${cell.changePct!.toFixed(0)}%)`} />
            )}
            {med && <Row k="Rakip medyanı" v={fmtTry(med)} />}
          </>
        )}
        {cell.kind === "incomparable" && (
          <>
            <p className="font-medium">Kıyaslanamaz</p>
            <p className="text-muted-foreground">{cell.reason}. Yanlış kıyas yapmamak için ana karşılaştırmaya alınmadı.</p>
            <Row k="Çekim zamanı" v={fmtTime(cell.fetchedAt)} />
            <div className="max-h-32 space-y-0.5 overflow-auto border-t pt-1">
              {cell.rows.slice(0, 8).map((r) => (
                <div key={r.id} className="flex justify-between gap-2 text-muted-foreground">
                  <span className="truncate">{BOARD_LABELS[r.board_type]} · {r.room_name ?? r.source}</span>
                  <span className="tabular-nums">{r.price_per_night ? fmtTry(Number(r.price_per_night)) : "—"}</span>
                </div>
              ))}
            </div>
          </>
        )}
        {cell.kind === "sold_out" && (
          <p className="text-muted-foreground">
            {cell.source} bu tarih için fiyat döndürmedi — muhtemelen dolu. Çekim: {fmtTime(cell.fetchedAt)}
          </p>
        )}
        {cell.kind === "none" && <p className="text-muted-foreground">Bu tarih için henüz çekim yapılmadı.</p>}
      </PopoverContent>
    </Popover>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between gap-3">
      <span className="text-muted-foreground">{k}</span>
      <span className="text-right">{v}</span>
    </div>
  );
}

export default function PriceTracking() {
  const { activeBusiness } = useBusiness();
  const biz = activeBusiness as any;
  const businessId: string | undefined = biz?.id;
  const qc = useQueryClient();
  const [days, setDays] = useState<14 | 30 | 60>(14);
  const [adults, setAdults] = useState(2);
  const [boardOverride, setBoardOverride] = useState<BoardType | null>(null);
  const [force, setForce] = useState(false);
  const [market, setMarket] = useState<"international" | "domestic">("international");
  const [refreshing, setRefreshing] = useState(false);
  const board: BoardType = boardOverride ?? (biz?.price_compare_board_type as BoardType) ?? "breakfast";

  const dates = useMemo(() => Array.from({ length: days }, (_, i) => isoDay(i)), [days]);
  const from = dates[0];
  const to = dates[dates.length - 1];

  const { data: comps = [] } = useQuery({
    queryKey: ["pt-comps", businessId],
    enabled: !!businessId,
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("ci_competitors")
        .select("id, name, booking_matched_name, serpapi_matched_name, price_source_preference")
        .eq("business_id", businessId)
        .eq("is_active", true)
        .order("name");
      if (error) throw error;
      return data as Comp[];
    },
  });

  const { data: snaps = [], isLoading } = useQuery({
    queryKey: ["pt-snaps", businessId, from, to, adults, market],
    enabled: !!businessId,
    queryFn: async () => {
      const all: Snapshot[] = [];
      for (let off = 0; off < 20000; off += 1000) {
        const { data, error } = await (supabase as any)
          .from("competitor_price_snapshots")
          .select("id, competitor_id, subject_type, checkin, adults, source, source_adapter, price_per_night, price_total, price_derived, board_type, room_name, refundable, taxes_included, no_availability, fetched_at")
          .eq("business_id", businessId)
          .eq("nights", 1)
          .eq("adults", adults)
          .eq("market", market)
          .gte("checkin", from)
          .lte("checkin", to)
          .gte("fetched_at", new Date(Date.now() - 21 * 86400_000).toISOString())
          .order("fetched_at", { ascending: false })
          .range(off, off + 999);
        if (error) throw error;
        all.push(...(data as Snapshot[]));
        if (!data || data.length < 1000) break;
      }
      return all;
    },
  });

  const { data: ownRates = [] } = useQuery({
    queryKey: ["pt-own-rates", businessId, from, to],
    enabled: !!businessId,
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("own_rate_entries")
        .select("id, date, board_type, room_name, price_per_night, refundable, note")
        .eq("business_id", businessId)
        .gte("date", from)
        .lte("date", to);
      if (error) throw error;
      return data as OwnRate[];
    },
  });

  const batches = useMemo(() => groupBatches(snaps), [snaps]);
  const manualByDate = useMemo(() => {
    const m = new Map<string, OwnRate[]>();
    for (const r of ownRates) m.set(r.date, [...(m.get(r.date) ?? []), r]);
    return m;
  }, [ownRates]);

  const subjects = useMemo(
    () => [{ key: "own", name: biz?.name ?? "Otelimiz", own: true }, ...comps.map((c) => ({ key: c.id, name: c.name, own: false }))],
    [biz?.name, comps],
  );

  const grid = useMemo(() => {
    const cells = new Map<string, Cell>();
    for (const s of subjects) for (const d of dates) {
      cells.set(`${s.key}|${d}`, computeCell(batches.get(`${s.key}|${d}`), board, s.own ? manualByDate.get(d) : undefined));
    }
    const perDay = dates.map((d) => {
      const rivals = comps
        .map((c) => cells.get(`${c.id}|${d}`)!)
        .filter((c): c is Extract<Cell, { kind: "value" }> => c.kind === "value")
        .map((c) => c.value);
      const med = median(rivals);
      const own = cells.get(`own|${d}`)!;
      const ownVal = own.kind === "value" ? own.value : null;
      let rank: string | null = null;
      if (ownVal != null) {
        const all = [...rivals, ownVal].sort((a, b) => a - b);
        rank = `${all.indexOf(ownVal) + 1}/${all.length}`;
      }
      return { d, med, ownVal, rank, compared: rivals.length };
    });
    return { cells, perDay };
  }, [subjects, dates, batches, board, manualByDate, comps]);

  const coverage = useMemo(() => {
    return subjects.map((s) => {
      let last: string | null = null;
      let total = 0;
      let known = 0;
      const adapters = new Set<string>();
      for (const d of dates) {
        const b = batches.get(`${s.key}|${d}`);
        if (!b?.length) continue;
        const priced = b[0].filter((r) => !r.no_availability);
        if (priced.length && (!last || b[0][0].fetched_at > last)) last = b[0][0].fetched_at;
        for (const r of priced) {
          total++;
          if (r.board_type !== "unknown") known++;
          adapters.add(r.source_adapter);
        }
      }
      const pref = s.own ? biz?.price_source_preference : comps.find((c) => c.id === s.key)?.price_source_preference;
      const manual = s.own && ownRates.length > 0;
      return { ...s, last, rate: total ? Math.round((known / total) * 100) : null, adapters: Array.from(adapters), pref, manual };
    });
  }, [subjects, dates, batches, biz?.price_source_preference, comps, ownRates.length]);

  const refresh = async () => {
    if (!businessId) return;
    setRefreshing(true);
    try {
      let calls = 0;
      for (let i = 0; i < days; i += 14) {
        const r: any = await invokeAuthedFunction("fetch-competitor-prices", {
          body: { business_id: businessId, checkin: dates[i], days: Math.min(14, days - i), nights: 1, adults, force_refresh: force },
        });
        calls += r?.calls ?? 0;
        if (r?.capped) break;
      }
      await qc.invalidateQueries({ queryKey: ["pt-snaps", businessId] });
      await qc.invalidateQueries({ queryKey: ["pt-comps", businessId] });
      toast({ title: "Fiyatlar güncellendi", description: calls ? `${calls} sorgu yapıldı.` : "Önbellekteki güncel veriler kullanıldı." });
    } catch (e) {
      toast({ title: "Fiyatlar alınamadı", description: e instanceof Error ? e.message : String(e), variant: "destructive" });
    } finally {
      setRefreshing(false);
    }
  };

  if (!businessId) return <div className="p-6 text-sm text-muted-foreground">Önce bir işletme seçin.</div>;

  return (
    <div className="mx-auto max-w-[1400px] space-y-6 px-4 py-6 sm:px-6">
      <Helmet><title>Fiyat Takibi | VoyageRespond</title></Helmet>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold sm:text-2xl">Fiyat Takibi</h1>
          <p className="text-sm text-muted-foreground">
            Kıyas standardı: {adults} yetişkin, gecelik, {BOARD_LABELS[board].toLocaleLowerCase("tr")} içindeki en ucuz oda, TL.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link to="/settings?tab=price-tracking"><Settings2 className="mr-1 h-4 w-4" />Ayarlar</Link>
          </Button>
          <div className="flex rounded-md border p-0.5 text-xs">
            {(["international", "domestic"] as const).map((m) => (
              <button key={m} onClick={() => setMarket(m)} className={`rounded px-2 py-1 ${market === m ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}>
                {m === "international" ? "Uluslararası" : "Yurt içi (ETS)"}
              </button>
            ))}
          </div>
          <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Switch checked={force} onCheckedChange={setForce} /> Önbelleği atla
          </label>
          <Button size="sm" onClick={refresh} disabled={refreshing}>
            {refreshing ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-1 h-4 w-4" />}
            Şimdi yenile
          </Button>
        </div>
      </div>

      {!biz?.price_tracking_enabled && (
        <Alert>
          <AlertDescription className="text-sm">
            Otomatik günlük takip kapalı. Ayarlar'dan açabilirsin; bu arada "Şimdi yenile" ile anlık çekim yapabilirsin.
          </AlertDescription>
        </Alert>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <Tabs value={String(days)} onValueChange={(v) => setDays(Number(v) as 14 | 30 | 60)}>
          <TabsList>
            <TabsTrigger value="14">14 gün</TabsTrigger>
            <TabsTrigger value="30">30 gün</TabsTrigger>
            <TabsTrigger value="60">60 gün</TabsTrigger>
          </TabsList>
        </Tabs>
        <Select value={board} onValueChange={(v) => setBoardOverride(v as BoardType)}>
          <SelectTrigger className="h-9 w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            {COMPARABLE_BOARDS.map((b) => <SelectItem key={b} value={b}>{BOARD_LABELS[b]}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={String(adults)} onValueChange={(v) => setAdults(Number(v))}>
          <SelectTrigger className="h-9 w-32"><SelectValue /></SelectTrigger>
          <SelectContent>
            {[1, 2, 3, 4].map((n) => <SelectItem key={n} value={String(n)}>{n} yetişkin</SelectItem>)}
          </SelectContent>
        </Select>
        <Badge variant="outline">TL</Badge>
      </div>

      <Card className="shadow-card">
        <CardHeader className="pb-2"><CardTitle className="text-base">Fiyat takvimi</CardTitle></CardHeader>
        <CardContent className="p-0 sm:p-2">
          {isLoading ? (
            <Skeleton className="m-4 h-64" />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-max min-w-full border-separate border-spacing-0 text-center text-xs">
                <thead>
                  <tr>
                    <th className="sticky left-0 z-10 min-w-40 bg-card px-3 py-2 text-left font-medium">Mülk</th>
                    {dates.map((d) => {
                      const m = dayMeta(d);
                      return (
                        <th key={d} className={cn("min-w-20 px-1 py-2 font-medium", m.weekend && "bg-muted/50")}>
                          <div>{m.label}</div>
                          <div className="font-normal text-muted-foreground">{m.dow}</div>
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody>
                  {subjects.map((s) => (
                    <tr key={s.key} className={cn(s.own && "bg-primary/5")}>
                      <td className={cn("sticky left-0 z-10 border-t px-3 py-1 text-left", s.own ? "bg-primary/10 font-semibold" : "bg-card")}>
                        <div className="max-w-48 truncate">{s.name}</div>
                        {s.own && <div className="text-[10px] font-normal text-primary">Otelimiz</div>}
                      </td>
                      {dates.map((d, i) => (
                        <td key={d} className={cn("border-t p-0.5", dayMeta(d).weekend && "bg-muted/40")}>
                          <CellView cell={grid.cells.get(`${s.key}|${d}`)!} median={grid.perDay[i].med} isOwn={s.own} />
                        </td>
                      ))}
                    </tr>
                  ))}
                  <SummaryRow label="Rakip medyanı" values={grid.perDay.map((p) => (p.med ? fmtTry(p.med) : "—"))} dates={dates} />
                  <SummaryRow
                    label="Farkımız"
                    dates={dates}
                    values={grid.perDay.map((p) => {
                      if (p.med == null || p.ownVal == null) return "—";
                      const diff = p.ownVal - p.med;
                      return (
                        <span className={cn(diff > 0 ? "text-destructive" : "text-success")}>
                          {diff > 0 ? "+" : ""}{((diff / p.med) * 100).toFixed(0)}%<br />
                          <span className="text-[10px]">{diff > 0 ? "+" : ""}{fmtTry(diff)}</span>
                        </span>
                      );
                    })}
                  />
                  <SummaryRow label="Sıramız (ucuzdan)" dates={dates} values={grid.perDay.map((p) => p.rank ?? "—")} />
                  <SummaryRow label="Kıyaslanan" dates={dates} values={grid.perDay.map((p) => `${p.compared}/${comps.length} rakip`)} />
                </tbody>
              </table>
            </div>
          )}
          <p className="px-4 py-2 text-[11px] text-muted-foreground">
            Renk: rakiplerin o günkü medyanına göre (yeşil ucuz, kırmızı pahalı). Ok: önceki çekime göre %10'dan fazla değişim. Hücreye dokun: kıyas künyesi.
          </p>
        </CardContent>
      </Card>

      <Card className="shadow-card">
        <CardHeader className="pb-2"><CardTitle className="text-base">Kapsam</CardTitle></CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {coverage.map((c) => {
            const unreachable = !c.last && !c.manual;
            return (
              <div key={c.key} className={cn("rounded-lg border p-3 text-xs", unreachable && "border-warning/60")}>
                <div className="mb-1 flex items-center justify-between gap-2">
                  <span className="truncate font-medium">{c.name}</span>
                  {c.own && <Badge variant="secondary" className="text-[10px]">Otelimiz</Badge>}
                </div>
                <Row k="Kaynak" v={c.adapters.length ? c.adapters.map((a) => ADAPTER_LABELS[a] ?? a).join(", ") : c.pref ? ADAPTER_LABELS[c.pref] ?? c.pref : "—"} />
                {c.manual && <Row k="Manuel giriş" v="Var" />}
                <Row k="Son başarılı çekim" v={c.last ? fmtTime(c.last) : "—"} />
                <Row k="Pansiyon tespit oranı" v={c.rate == null ? "—" : `%${c.rate}`} />
                {unreachable && (
                  <p className="mt-2 flex items-center gap-1 text-warning">
                    <AlertTriangle className="h-3.5 w-3.5" /> Bu otelin fiyatına şu an ulaşamıyoruz
                  </p>
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}

function SummaryRow({ label, values, dates }: { label: string; values: React.ReactNode[]; dates: string[] }) {
  return (
    <tr className="text-[11px]">
      <td className="sticky left-0 z-10 border-t bg-muted px-3 py-1.5 text-left font-medium">{label}</td>
      {values.map((v, i) => (
        <td key={dates[i]} className="border-t bg-muted/40 px-1 py-1.5 tabular-nums">{v}</td>
      ))}
    </tr>
  );
}
