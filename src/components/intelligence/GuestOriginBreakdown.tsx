import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, LineChart, Line, Legend,
} from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Globe, Languages, Info } from "lucide-react";

const PRIMARY = "hsl(var(--primary))";
const MUTED = "hsl(var(--muted-foreground))";

const COUNTRY_LABELS: Record<string, string> = {
  TR: "Türkiye", DE: "Almanya", RU: "Rusya", GB: "Birleşik Krallık", NL: "Hollanda",
  PL: "Polonya", UA: "Ukrayna", KZ: "Kazakistan", AT: "Avusturya", CH: "İsviçre",
  FR: "Fransa", BE: "Belçika", SE: "İsveç", NO: "Norveç", DK: "Danimarka", FI: "Finlandiya",
  IL: "İsrail", IR: "İran", IQ: "Irak", SA: "Suudi Arabistan", AE: "BAE", US: "ABD",
  RO: "Romanya", BG: "Bulgaristan", CZ: "Çekya", MD: "Moldova", BY: "Belarus",
  AZ: "Azerbaycan", GE: "Gürcistan", LT: "Litvanya", LV: "Letonya", EE: "Estonya",
  IT: "İtalya", ES: "İspanya", GR: "Yunanistan", PT: "Portekiz", IE: "İrlanda",
  HU: "Macaristan", RS: "Sırbistan", HR: "Hırvatistan", CA: "Kanada", AU: "Avustralya",
  CN: "Çin", JP: "Japonya", KR: "Güney Kore", IN: "Hindistan", EG: "Mısır",
};

const LANGUAGE_LABELS: Record<string, string> = {
  tr: "Türkçe", en: "İngilizce", de: "Almanca", ru: "Rusça", nl: "Felemenkçe",
  pl: "Lehçe", uk: "Ukraynaca", fr: "Fransızca", ar: "Arapça", fa: "Farsça",
  he: "İbranice", it: "İtalyanca", es: "İspanyolca", ro: "Romence", bg: "Bulgarca",
  sv: "İsveççe", no: "Norveççe", da: "Danca", fi: "Fince", cs: "Çekçe", el: "Yunanca",
  pt: "Portekizce", hu: "Macarca", zh: "Çince", ja: "Japonca", ko: "Korece", kk: "Kazakça",
};

const countryLabel = (code: string) => COUNTRY_LABELS[code] ?? code;
const languageLabel = (code: string) => LANGUAGE_LABELS[code] ?? code.toUpperCase();

const PLATFORM_LABELS: Record<string, string> = {
  booking: "Booking", tripadvisor: "TripAdvisor", expedia: "Expedia",
  hotelscom: "Hotels.com", tripcom: "Trip.com", trustpilot: "Trustpilot",
  google: "Google", yandex: "Yandex",
};

type OwnRow = {
  id: string;
  platform: string | null;
  rating: number | null;
  posted_at: string | null;
  reviewer_country: string | null;
};

type CompRow = {
  competitor_id: string;
  rating: number | null;
  reviewer_country: string | null;
};

function monthKey(iso: string) {
  const d = new Date(iso);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function lastTwelveMonths(): string[] {
  const out: string[] = [];
  const now = new Date();
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    out.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
  }
  return out;
}

export function GuestOriginBreakdown({ businessId }: { businessId: string }) {
  const [tab, setTab] = useState("country");

  const ownQuery = useQuery({
    queryKey: ["guest-origin-own", businessId],
    enabled: Boolean(businessId),
    queryFn: async (): Promise<OwnRow[]> => {
      const { data, error } = await supabase
        .from("reviews")
        .select("id, platform, rating, posted_at, reviewer_country")
        .eq("business_id", businessId)
        .order("posted_at", { ascending: false })
        .limit(5000);
      if (error) throw error;
      return (data ?? []) as OwnRow[];
    },
  });

  const langQuery = useQuery({
    queryKey: ["guest-origin-lang", businessId],
    enabled: Boolean(businessId),
    queryFn: async (): Promise<Array<{ review_id: string; detected_language: string | null }>> => {
      const { data, error } = await supabase
        .from("review_analysis")
        .select("review_id, detected_language")
        .eq("business_id", businessId)
        .limit(5000);
      if (error) throw error;
      return (data ?? []) as any;
    },
  });

  const compQuery = useQuery({
    queryKey: ["guest-origin-comp", businessId],
    enabled: Boolean(businessId),
    queryFn: async () => {
      const { data: comps, error: cErr } = await supabase
        .from("ci_competitors")
        .select("id, name")
        .eq("business_id", businessId);
      if (cErr) throw cErr;
      const ids = (comps ?? []).map((c: any) => c.id);
      if (!ids.length) return { names: {} as Record<string, string>, rows: [] as CompRow[] };
      const { data: rows, error: rErr } = await supabase
        .from("ci_competitor_reviews")
        .select("competitor_id, rating, reviewer_country")
        .in("competitor_id", ids)
        .limit(8000);
      if (rErr) throw rErr;
      const names: Record<string, string> = {};
      for (const c of comps ?? []) names[(c as any).id] = (c as any).name;
      return { names, rows: (rows ?? []) as CompRow[] };
    },
  });

  const own = ownQuery.data ?? [];

  const country = useMemo(() => {
    const known = own.filter((r) => r.reviewer_country);
    const total = own.length;
    const coverage = total ? Math.round((known.length / total) * 100) : 0;

    const sourcePlatforms = Array.from(
      new Set(known.map((r) => r.platform || "").filter(Boolean)),
    ).map((p) => PLATFORM_LABELS[p] ?? p);

    const byCountry = new Map<string, { count: number; ratingSum: number; ratingCount: number }>();
    for (const r of known) {
      const code = r.reviewer_country!;
      const e = byCountry.get(code) ?? { count: 0, ratingSum: 0, ratingCount: 0 };
      e.count += 1;
      if (typeof r.rating === "number") { e.ratingSum += r.rating; e.ratingCount += 1; }
      byCountry.set(code, e);
    }

    const list = Array.from(byCountry.entries())
      .map(([code, e]) => ({
        code,
        label: countryLabel(code),
        count: e.count,
        share: known.length ? (e.count / known.length) * 100 : 0,
        avgRating: e.ratingCount ? e.ratingSum / e.ratingCount : null,
      }))
      .sort((a, b) => b.count - a.count);

    const domestic = byCountry.get("TR")?.count ?? 0;
    const foreign = known.length - domestic;

    const months = lastTwelveMonths();
    const topCodes = list.slice(0, 5).map((c) => c.code);
    const trendMap = new Map<string, Record<string, number>>();
    for (const m of months) trendMap.set(m, {});
    for (const r of known) {
      if (!r.posted_at) continue;
      const m = monthKey(r.posted_at);
      if (!trendMap.has(m)) continue;
      const code = r.reviewer_country!;
      if (!topCodes.includes(code)) continue;
      const row = trendMap.get(m)!;
      row[code] = (row[code] ?? 0) + 1;
    }
    const trend = months.map((m) => ({ month: m.slice(2), ...(trendMap.get(m) ?? {}) }));

    return { total, known: known.length, coverage, sourcePlatforms, list, domestic, foreign, trend, topCodes };
  }, [own]);

  const language = useMemo(() => {
    const ratingById = new Map(own.map((r) => [r.id, r.rating] as const));
    const rows = (langQuery.data ?? []).filter((r) => r.detected_language);
    const byLang = new Map<string, { count: number; ratingSum: number; ratingCount: number }>();
    for (const r of rows) {
      const code = (r.detected_language || "").slice(0, 2).toLowerCase();
      if (!code) continue;
      const e = byLang.get(code) ?? { count: 0, ratingSum: 0, ratingCount: 0 };
      e.count += 1;
      const rating = ratingById.get(r.review_id);
      if (typeof rating === "number") { e.ratingSum += rating; e.ratingCount += 1; }
      byLang.set(code, e);
    }
    const total = rows.length;
    const list = Array.from(byLang.entries())
      .map(([code, e]) => ({
        code,
        label: languageLabel(code),
        count: e.count,
        share: total ? (e.count / total) * 100 : 0,
        avgRating: e.ratingCount ? e.ratingSum / e.ratingCount : null,
      }))
      .sort((a, b) => b.count - a.count);
    const trCount = byLang.get("tr")?.count ?? 0;
    return { total, list, trShare: total ? (trCount / total) * 100 : 0, otherShare: total ? ((total - trCount) / total) * 100 : 0 };
  }, [langQuery.data, own]);

  const competitorCompare = useMemo(() => {
    const data = compQuery.data;
    if (!data || !data.rows.length) return null;
    const perCompetitor = new Map<string, { known: number; total: number; byCountry: Map<string, number> }>();
    for (const r of data.rows) {
      const e = perCompetitor.get(r.competitor_id) ?? { known: 0, total: 0, byCountry: new Map() };
      e.total += 1;
      if (r.reviewer_country) {
        e.known += 1;
        e.byCountry.set(r.reviewer_country, (e.byCountry.get(r.reviewer_country) ?? 0) + 1);
      }
      perCompetitor.set(r.competitor_id, e);
    }
    const withCountry = Array.from(perCompetitor.entries()).filter(([, e]) => e.known > 0);
    if (!withCountry.length || country.known === 0) return null;

    const codes = new Set<string>(country.list.slice(0, 6).map((c) => c.code));
    for (const [, e] of withCountry) {
      Array.from(e.byCountry.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 4)
        .forEach(([code]) => codes.add(code));
    }

    const series = [
      { key: "self", label: "Siz", coverage: country.coverage, known: country.known, total: country.total },
      ...withCountry.map(([id, e]) => ({
        key: id,
        label: data.names[id] ?? "Rakip",
        coverage: e.total ? Math.round((e.known / e.total) * 100) : 0,
        known: e.known,
        total: e.total,
      })),
    ];

    const chart = Array.from(codes).map((code) => {
      const row: any = { code, label: countryLabel(code) };
      const selfCount = country.list.find((c) => c.code === code)?.count ?? 0;
      row.self = country.known ? Number(((selfCount / country.known) * 100).toFixed(1)) : 0;
      for (const [id, e] of withCountry) {
        row[id] = e.known ? Number((((e.byCountry.get(code) ?? 0) / e.known) * 100).toFixed(1)) : 0;
      }
      return row;
    }).sort((a, b) => b.self - a.self);

    return { series, chart };
  }, [compQuery.data, country]);

  const loading = ownQuery.isLoading;

  return (
    <Card className="shadow-card">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-primary/10">
            <Globe className="h-5 w-5 text-primary" />
          </div>
          <CardTitle className="text-lg">Ülke ve dil kırılımı</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-3">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-48 w-full" />
          </div>
        ) : (
          <Tabs value={tab} onValueChange={setTab}>
            <TabsList>
              <TabsTrigger value="country">Ülke</TabsTrigger>
              <TabsTrigger value="language">Yorum dili</TabsTrigger>
            </TabsList>

            {/* ---- Sekme A: Ülke ---- */}
            <TabsContent value="country" className="pt-4 space-y-6">
              <div>
                <h3 className="font-semibold">Yorum yazanların ülke dağılımı</h3>
                {country.known === 0 ? (
                  <p className="text-sm text-muted-foreground mt-2">
                    Henüz ülke bilgisi olan yorum yok. Booking veya TripAdvisor yorumları çekildiğinde burası dolacak.
                  </p>
                ) : (
                  <p className="text-xs text-muted-foreground mt-1">
                    {country.total} yorumun {country.known}'ında ülke bilgisi var (%{country.coverage})
                    {country.sourcePlatforms.length > 0 && <> · Kaynak: {country.sourcePlatforms.join(", ")}.</>}{" "}
                    Google ve Yandex ülke bilgisi vermiyor.
                  </p>
                )}
              </div>

              {country.known > 0 && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-lg border p-3">
                      <div className="text-xs text-muted-foreground">Yurtiçi (TR)</div>
                      <div className="text-2xl font-semibold">
                        %{((country.domestic / country.known) * 100).toFixed(1)}
                      </div>
                      <div className="text-xs text-muted-foreground">{country.domestic} yorum</div>
                    </div>
                    <div className="rounded-lg border p-3">
                      <div className="text-xs text-muted-foreground">Yurtdışı</div>
                      <div className="text-2xl font-semibold">
                        %{((country.foreign / country.known) * 100).toFixed(1)}
                      </div>
                      <div className="text-xs text-muted-foreground">{country.foreign} yorum</div>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Yurtiçi/yurtdışı ayrımı yalnızca ülkesi bilinen {country.known} yorum üzerinden hesaplanır (kapsam %{country.coverage}).
                  </p>

                  <div className="rounded-lg border overflow-hidden">
                    <div className="grid grid-cols-4 bg-muted/50 px-3 py-2 text-xs font-medium">
                      <div>Ülke</div>
                      <div className="text-right">Yorum</div>
                      <div className="text-right">Pay</div>
                      <div className="text-right">Ort. puan</div>
                    </div>
                    {country.list.slice(0, 15).map((c) => (
                      <div key={c.code} className="grid grid-cols-4 px-3 py-2 border-t text-sm items-center">
                        <div className="font-medium">{c.label}</div>
                        <div className="text-right">{c.count}</div>
                        <div className="text-right">%{c.share.toFixed(1)}</div>
                        <div className="text-right">{c.avgRating != null ? c.avgRating.toFixed(1) : "veri yok"}</div>
                      </div>
                    ))}
                  </div>

                  <div>
                    <div className="text-sm font-medium mb-2">Son 12 ay trendi (en çok yorum yazan 5 ülke)</div>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={country.trend}>
                          <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                          <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                          <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                          <Tooltip />
                          <Legend />
                          {country.topCodes.map((code, i) => (
                            <Line
                              key={code}
                              type="monotone"
                              dataKey={code}
                              name={countryLabel(code)}
                              stroke={i === 0 ? PRIMARY : `hsl(${(i * 62) % 360} 65% 52%)`}
                              strokeWidth={2}
                              dot={false}
                            />
                          ))}
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {competitorCompare ? (
                    <div>
                      <div className="text-sm font-medium mb-1">Rakiplerle ülke dağılımı karşılaştırması</div>
                      <div className="flex flex-wrap gap-1 mb-2">
                        {competitorCompare.series.map((s) => (
                          <Badge key={s.key} variant="secondary" className="text-xs">
                            {s.label}: {s.known}/{s.total} yorumda ülke (%{s.coverage})
                          </Badge>
                        ))}
                      </div>
                      <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={competitorCompare.chart}>
                            <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                            <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                            <YAxis tick={{ fontSize: 11 }} unit="%" />
                            <Tooltip formatter={(v: any) => `%${v}`} />
                            <Legend />
                            {competitorCompare.series.map((s, i) => (
                              <Bar
                                key={s.key}
                                dataKey={s.key}
                                name={s.label}
                                fill={i === 0 ? PRIMARY : `hsl(${(i * 48 + 200) % 360} 60% 55%)`}
                              />
                            ))}
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Paylar, her iki tarafta da yalnızca ülkesi bilinen yorumlar üzerinden hesaplanır.
                      </p>
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground">
                      Rakiplerde ülke bilgisi olan yorum yok, karşılaştırma gösterilemiyor.
                    </p>
                  )}
                </>
              )}
            </TabsContent>

            {/* ---- Sekme B: Yorum dili ---- */}
            <TabsContent value="language" className="pt-4 space-y-4">
              <div className="flex items-center gap-2">
                <Languages className="h-4 w-4 text-muted-foreground" />
                <h3 className="font-semibold">Yorum dili dağılımı</h3>
              </div>

              {language.total === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Henüz dil analizi yapılmış yorum yok.
                </p>
              ) : (
                <>
                  <p className="text-xs text-muted-foreground">
                    {language.total} yorumun dili analizle belirlendi.
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-lg border p-3">
                      <div className="text-xs text-muted-foreground">Türkçe yorum payı</div>
                      <div className="text-2xl font-semibold">%{language.trShare.toFixed(1)}</div>
                    </div>
                    <div className="rounded-lg border p-3">
                      <div className="text-xs text-muted-foreground">Yabancı dilde yorum payı</div>
                      <div className="text-2xl font-semibold">%{language.otherShare.toFixed(1)}</div>
                    </div>
                  </div>

                  <div className="rounded-lg border overflow-hidden">
                    <div className="grid grid-cols-4 bg-muted/50 px-3 py-2 text-xs font-medium">
                      <div>Dil</div>
                      <div className="text-right">Yorum</div>
                      <div className="text-right">Pay</div>
                      <div className="text-right">Ort. puan</div>
                    </div>
                    {language.list.slice(0, 15).map((l) => (
                      <div key={l.code} className="grid grid-cols-4 px-3 py-2 border-t text-sm items-center">
                        <div className="font-medium">{l.label}</div>
                        <div className="text-right">{l.count}</div>
                        <div className="text-right">%{l.share.toFixed(1)}</div>
                        <div className="text-right">{l.avgRating != null ? l.avgRating.toFixed(1) : "veri yok"}</div>
                      </div>
                    ))}
                  </div>

                  <div className="h-60">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={language.list.slice(0, 8)}>
                        <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                        <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                        <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                        <Tooltip />
                        <Bar dataKey="count" name="Yorum" fill={PRIMARY} radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </>
              )}

              <div className="flex gap-2 rounded-lg border bg-muted/40 p-3 text-xs text-muted-foreground">
                <Info className="h-4 w-4 shrink-0" style={{ color: MUTED }} />
                <span>
                  Türkçe yorum payı ile bilinen ülkelerdeki TR payı arasında büyük fark varsa, bu genelde
                  yurtdışında yaşayan Türkçe konuşan misafirlerden kaynaklanır. Dil, ülke bilgisi değildir.
                </span>
              </div>
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
    </Card>
  );
}
