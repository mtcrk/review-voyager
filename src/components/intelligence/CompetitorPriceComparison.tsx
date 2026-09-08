import { useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Loader2,
  RefreshCw,
  Tag,
  ChevronDown,
  ChevronRight,
  ShieldCheck,
  AlertTriangle,
  CalendarDays,
} from "lucide-react";

type Competitor = { id: string; name: string };

type PriceRow = {
  source: string;
  price: number | string;
  is_official: boolean | null;
  is_ad: boolean | null;
  num_guests: number | null;
  free_cancellation: boolean | null;
  fetched_at?: string;
};

type CompResult = {
  competitor_id: string;
  name: string;
  status: "ok" | "not_found" | "no_prices" | "error";
  cached?: boolean;
  fetched_at?: string;
  prices?: PriceRow[];
};

function defaultCheckin() {
  const d = new Date(Date.now() + 30 * 86400_000);
  return d.toISOString().slice(0, 10);
}

function fmtTry(n: number) {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    maximumFractionDigits: 0,
  }).format(n);
}

function fmtDate(iso: string) {
  const d = new Date(iso.length <= 10 ? `${iso}T00:00:00` : iso);
  return new Intl.DateTimeFormat("tr-TR", { dateStyle: "medium" }).format(d);
}

function fmtDateTime(iso: string) {
  return new Intl.DateTimeFormat("tr-TR", { dateStyle: "medium", timeStyle: "short" }).format(
    new Date(iso),
  );
}

/** Aynı fiyattaki kaynaklar genelde aynı tedarikçidir → tek satırda grupla. */
type PriceGroup = {
  price: number;
  sources: PriceRow[];
  isOfficial: boolean;
  isAd: boolean;
  freeCancellation: boolean;
};

function groupByPrice(rows: PriceRow[]): PriceGroup[] {
  const map = new Map<number, PriceGroup>();
  for (const r of rows) {
    const price = Math.round(Number(r.price));
    if (!Number.isFinite(price) || price <= 0) continue;
    const g = map.get(price);
    if (g) {
      g.sources.push(r);
      g.isOfficial = g.isOfficial || !!r.is_official;
      g.isAd = g.isAd && !!r.is_ad;
      g.freeCancellation = g.freeCancellation || !!r.free_cancellation;
    } else {
      map.set(price, {
        price,
        sources: [r],
        isOfficial: !!r.is_official,
        isAd: !!r.is_ad,
        freeCancellation: !!r.free_cancellation,
      });
    }
  }
  return [...map.values()].sort((a, b) => a.price - b.price);
}

export function CompetitorPriceComparison({
  businessId,
  competitors,
}: {
  businessId: string;
  competitors: Competitor[];
}) {
  const [checkin, setCheckin] = useState(defaultCheckin);
  const [nights, setNights] = useState("1");
  const [adults, setAdults] = useState("2");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<CompResult[] | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [meta, setMeta] = useState<{ checkin: string; nights: number; adults: number } | null>(
    null,
  );

  async function run(force = false) {
    if (!competitors.length) return;
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("fetch-competitor-prices", {
        body: {
          business_id: businessId,
          competitor_ids: competitors.map((c) => c.id),
          checkin,
          nights: Number(nights),
          adults: Number(adults),
          force_refresh: force,
        },
      });
      if (error) throw error;
      if ((data as any)?.error) throw new Error((data as any).error);
      setResults(((data as any)?.results ?? []) as CompResult[]);
      setMeta({ checkin, nights: Number(nights), adults: Number(adults) });
      setExpanded(null);
    } catch (e) {
      toast({
        title: "Fiyatlar alınamadı",
        description: e instanceof Error ? e.message : "Beklenmeyen bir hata oluştu.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  const rows = useMemo(() => {
    return (results ?? []).map((r) => {
      const groups = groupByPrice(r.prices ?? []);
      const lowest = groups.length ? groups[0].price : null;
      const officialGroup = groups.find((g) => g.isOfficial) ?? null;
      const parityDiff =
        officialGroup && lowest && officialGroup.price > lowest
          ? Math.round(((officialGroup.price - lowest) / lowest) * 100)
          : null;
      return { ...r, groups, lowest, officialPrice: officialGroup?.price ?? null, parityDiff };
    });
  }, [results]);

  const anyPrices = rows.some((r) => r.lowest != null);
  const lastFetched = useMemo(() => {
    const stamps = (results ?? []).map((r) => r.fetched_at).filter(Boolean) as string[];
    if (!stamps.length) return null;
    return stamps.sort().slice(-1)[0];
  }, [results]);

  if (!competitors.length) return null;

  return (
    <Card className="no-print">
      <CardHeader className="pb-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <CardTitle className="text-base flex items-center gap-2">
              <Tag className="h-4 w-4 text-primary" />
              Fiyat Karşılaştırması
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Seçtiğiniz tarih için rakiplerinizin güncel oda fiyatları.
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex flex-wrap items-end gap-2">
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground flex items-center gap-1">
              <CalendarDays className="h-3 w-3" /> Giriş tarihi
            </label>
            <Input
              type="date"
              value={checkin}
              onChange={(e) => setCheckin(e.target.value)}
              className="h-9 w-[160px]"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">Gece</label>
            <Select value={nights} onValueChange={setNights}>
              <SelectTrigger className="h-9 w-[90px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[1, 2, 3, 4, 5, 7].map((n) => (
                  <SelectItem key={n} value={String(n)}>
                    {n} gece
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">Kişi</label>
            <Select value={adults} onValueChange={setAdults}>
              <SelectTrigger className="h-9 w-[90px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[1, 2, 3, 4].map((n) => (
                  <SelectItem key={n} value={String(n)}>
                    {n} kişi
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button size="sm" onClick={() => run(false)} disabled={loading} className="h-9">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Fiyatları getir
          </Button>
          <Button
            size="icon"
            variant="outline"
            className="h-9 w-9"
            title="Yenile (önbelleği atla)"
            onClick={() => run(true)}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </div>

        {results && !anyPrices && (
          <div className="rounded-lg border bg-muted/40 p-4 text-sm text-muted-foreground">
            Bu otel grubunda fiyat verisi bulunmuyor. Her şey dahil büyük tesisler genellikle
            Google Hotels'e fiyat paylaşmıyor.
          </div>
        )}

        {results && anyPrices && (
          <div className="rounded-lg border overflow-hidden">
            <div className="grid grid-cols-[1fr_auto_auto_auto] gap-3 bg-muted/50 px-4 py-2 text-xs font-medium text-muted-foreground">
              <div>Rakip</div>
              <div className="text-right">En düşük</div>
              <div className="text-right hidden sm:block">Direkt</div>
              <div className="text-right">Kaynak</div>
            </div>

            {rows.map((r) => {
              const isOpen = expanded === r.competitor_id;
              return (
                <div key={r.competitor_id} className="border-t">
                  <button
                    type="button"
                    onClick={() => setExpanded(isOpen ? null : r.competitor_id)}
                    className="w-full text-left grid grid-cols-[1fr_auto_auto_auto] gap-3 items-center px-4 py-3 hover:bg-muted/30 transition-colors"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        {isOpen ? (
                          <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
                        ) : (
                          <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                        )}
                        <span className="font-medium truncate">{r.name}</span>
                      </div>
                      {r.parityDiff != null && (
                        <Badge
                          variant="outline"
                          className="mt-1 ml-6 border-orange-300 text-orange-700 bg-orange-50"
                        >
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          Direkt kanal %{r.parityDiff} pahalı
                        </Badge>
                      )}
                    </div>
                    <div className="text-right">
                      {r.lowest != null ? (
                        <span className="text-lg font-semibold tracking-tight">
                          {fmtTry(r.lowest)}
                        </span>
                      ) : (
                        <span className="text-sm text-muted-foreground">fiyat verisi yok</span>
                      )}
                    </div>
                    <div className="text-right hidden sm:block">
                      {r.officialPrice != null ? (
                        <span className="text-sm inline-flex items-center gap-1">
                          {fmtTry(r.officialPrice)}
                          <Badge variant="secondary" className="text-[10px]">
                            <ShieldCheck className="h-3 w-3 mr-0.5" />
                            resmi
                          </Badge>
                        </span>
                      ) : (
                        <span className="text-sm text-muted-foreground">—</span>
                      )}
                    </div>
                    <div className="text-right text-sm text-muted-foreground whitespace-nowrap">
                      {r.groups.length ? `${r.groups.length} kaynak` : "—"}
                    </div>
                  </button>

                  {isOpen && (
                    <div className="px-4 pb-4">
                      {r.groups.length === 0 ? (
                        <p className="text-sm text-muted-foreground">
                          Bu rakip için fiyat verisi yok.
                        </p>
                      ) : (
                        <div className="rounded-md border divide-y">
                          {r.groups.map((g) => {
                            const extra = g.sources.length - 1;
                            return (
                              <div
                                key={g.price}
                                className="flex items-center justify-between gap-3 px-3 py-2 text-sm"
                              >
                                <div className="flex flex-wrap items-center gap-2 min-w-0">
                                  <span className="font-medium">{fmtTry(g.price)}</span>
                                  <span className="text-muted-foreground truncate">
                                    — {g.sources[0].source}
                                    {extra > 0 ? ` +${extra} kaynak` : ""}
                                  </span>
                                  {g.isOfficial && (
                                    <Badge variant="secondary" className="text-[10px]">
                                      resmi
                                    </Badge>
                                  )}
                                  {g.isAd && (
                                    <Badge variant="outline" className="text-[10px]">
                                      sponsorlu
                                    </Badge>
                                  )}
                                </div>
                                {g.freeCancellation && (
                                  <span className="text-xs text-emerald-700 inline-flex items-center gap-1 whitespace-nowrap">
                                    <ShieldCheck className="h-3 w-3" />
                                    ücretsiz iptal
                                  </span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {results && anyPrices && meta && (
          <p className="text-xs text-muted-foreground">
            Kaynak: Google Hotels · {meta.adults} kişi · {meta.nights} gece ·{" "}
            {fmtDate(meta.checkin)} · vergiler dahil · son güncelleme{" "}
            {lastFetched ? fmtDateTime(lastFetched) : "—"}
          </p>
        )}

        {!results && (
          <p className="text-xs text-muted-foreground">
            Fiyatlar istek üzerine çekilir; aynı tarih için 6 saat boyunca önbellekten gösterilir.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
