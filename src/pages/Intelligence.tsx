import { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/integrations/supabase/client";
import { useBusiness } from "@/contexts/BusinessContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Loader2, Plus, RefreshCw, Sparkles, Star, X, Check, MapPin } from "lucide-react";

type Competitor = {
  id: string;
  business_id: string;
  name: string;
  place_id: string | null;
  rating: number | null;
  review_count: number | null;
  match_score: number | null;
  proximity_m: number | null;
  status: string;
  source: string;
  created_at: string;
};

type Brief = {
  id: string;
  business_id: string;
  bucket_week: string;
  sections: any;
  signal_strength: number | null;
  reviews_analysed: number | null;
  competitors_count: number | null;
  generated_at: string;
};

const RADIUS_OPTIONS = [
  { label: "2 km", value: 2000 },
  { label: "5 km", value: 5000 },
  { label: "10 km", value: 10000 },
];

function scoreColor(score: number | null) {
  if (score == null) return "bg-muted text-muted-foreground";
  if (score >= 70) return "bg-green-100 text-green-700 border-green-200";
  if (score >= 40) return "bg-amber-100 text-amber-700 border-amber-200";
  return "bg-muted text-muted-foreground";
}

export default function Intelligence() {
  const { activeBusiness } = useBusiness();
  const businessId = activeBusiness?.id;

  const [competitors, setCompetitors] = useState<Competitor[]>([]);
  const [loadingComp, setLoadingComp] = useState(true);
  const [discovering, setDiscovering] = useState(false);
  const [radius, setRadius] = useState(5000);

  const [brief, setBrief] = useState<Brief | null>(null);
  const [loadingBrief, setLoadingBrief] = useState(true);
  const [generatingBrief, setGeneratingBrief] = useState(false);

  const [addOpen, setAddOpen] = useState(false);
  const [addName, setAddName] = useState("");
  const [addPlaceId, setAddPlaceId] = useState("");

  const suggested = useMemo(
    () =>
      competitors
        .filter((c) => c.status === "suggested")
        .sort((a, b) => (b.match_score ?? 0) - (a.match_score ?? 0)),
    [competitors],
  );
  const confirmed = useMemo(
    () => competitors.filter((c) => c.status === "confirmed"),
    [competitors],
  );

  async function fetchCompetitors() {
    if (!businessId) return;
    setLoadingComp(true);
    const { data, error } = await supabase
      .from("ci_competitors")
      .select("*")
      .eq("business_id", businessId)
      .neq("status", "rejected")
      .order("match_score", { ascending: false });
    if (error) {
      toast({ title: "Hata", description: error.message, variant: "destructive" });
    } else {
      setCompetitors((data ?? []) as Competitor[]);
    }
    setLoadingComp(false);
  }

  async function fetchBrief() {
    if (!businessId) return;
    setLoadingBrief(true);
    const { data, error } = await supabase
      .from("ci_monday_briefs")
      .select("*")
      .eq("business_id", businessId)
      .order("bucket_week", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error) {
      console.error(error);
    }
    setBrief((data as Brief) ?? null);
    setLoadingBrief(false);
  }

  useEffect(() => {
    if (businessId) {
      fetchCompetitors();
      fetchBrief();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [businessId]);

  async function discover() {
    if (!businessId) return;
    setDiscovering(true);
    const { data, error } = await supabase.functions.invoke("discover-competitors", {
      body: { business_id: businessId, radius_m: radius },
    });
    setDiscovering(false);
    if (error) {
      toast({ title: "Keşif başarısız", description: error.message, variant: "destructive" });
      return;
    }
    toast({
      title: "Tamamlandı",
      description: `${data?.suggested_count ?? 0} rakip önerisi bulundu.`,
    });
    fetchCompetitors();
  }

  async function setStatus(id: string, status: "confirmed" | "rejected") {
    const { error } = await supabase.from("ci_competitors").update({ status }).eq("id", id);
    if (error) {
      toast({ title: "Hata", description: error.message, variant: "destructive" });
      return;
    }
    setCompetitors((prev) =>
      status === "rejected"
        ? prev.filter((c) => c.id !== id)
        : prev.map((c) => (c.id === id ? { ...c, status } : c)),
    );
  }

  async function addManual() {
    if (!businessId || !addName.trim()) return;
    const { error } = await supabase.from("ci_competitors").insert({
      business_id: businessId,
      name: addName.trim(),
      place_id: addPlaceId.trim() || null,
      source: "manual",
      status: "confirmed",
    });
    if (error) {
      toast({ title: "Eklenemedi", description: error.message, variant: "destructive" });
      return;
    }
    setAddName("");
    setAddPlaceId("");
    setAddOpen(false);
    fetchCompetitors();
  }

  async function generateBrief() {
    if (!businessId) return;
    setGeneratingBrief(true);
    const { error } = await supabase.functions.invoke("generate-monday-brief", {
      body: { business_id: businessId },
    });
    setGeneratingBrief(false);
    if (error) {
      toast({ title: "Brief oluşturulamadı", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Brief hazır", description: "En son brief yüklendi." });
    fetchBrief();
  }

  if (!businessId) {
    return (
      <div className="p-6">
        <p className="text-muted-foreground">Önce bir işletme seçin.</p>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Rakip Analizi · VoyageRespond</title>
      </Helmet>
      <div className="p-4 sm:p-6 max-w-6xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">Rakip Analizi</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Bölgenizdeki rakipleri otomatik keşfedin ve haftalık stratejik brief alın.
          </p>
        </div>

        <Tabs defaultValue="competitors">
          <TabsList>
            <TabsTrigger value="competitors">Rakipler</TabsTrigger>
            <TabsTrigger value="brief">Haftalık Brief</TabsTrigger>
          </TabsList>

          {/* ===== TAB 1: COMPETITORS ===== */}
          <TabsContent value="competitors" className="space-y-6 mt-4">
            <Card>
              <CardContent className="p-4 sm:p-6 flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm text-muted-foreground mr-1">Yarıçap:</span>
                  {RADIUS_OPTIONS.map((r) => (
                    <Button
                      key={r.value}
                      size="sm"
                      variant={radius === r.value ? "default" : "outline"}
                      onClick={() => setRadius(r.value)}
                    >
                      {r.label}
                    </Button>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Dialog open={addOpen} onOpenChange={setAddOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Plus className="h-4 w-4" /> Rakip Ekle
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Manuel Rakip Ekle</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-3">
                        <Input
                          placeholder="Rakip adı"
                          value={addName}
                          onChange={(e) => setAddName(e.target.value)}
                        />
                        <Input
                          placeholder="Google place_id (opsiyonel)"
                          value={addPlaceId}
                          onChange={(e) => setAddPlaceId(e.target.value)}
                        />
                      </div>
                      <DialogFooter>
                        <Button onClick={addManual} disabled={!addName.trim()}>
                          Ekle
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                  <Button onClick={discover} disabled={discovering}>
                    {discovering ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" /> Bölgenizdeki rakipler taranıyor...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4" /> Rakipleri Keşfet
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {loadingComp ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[0, 1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-28 w-full" />
                ))}
              </div>
            ) : (
              <>
                {/* Confirmed */}
                {confirmed.length > 0 && (
                  <section>
                    <h2 className="text-sm font-medium text-muted-foreground mb-2">
                      Rakiplerim ({confirmed.length})
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {confirmed.map((c) => (
                        <CompetitorCard
                          key={c.id}
                          c={c}
                          actions={
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setStatus(c.id, "rejected")}
                            >
                              <X className="h-4 w-4" /> Çıkar
                            </Button>
                          }
                        />
                      ))}
                    </div>
                  </section>
                )}

                {/* Suggested */}
                <section>
                  <h2 className="text-sm font-medium text-muted-foreground mb-2">
                    Önerilen Rakipler ({suggested.length})
                  </h2>
                  {suggested.length === 0 && confirmed.length === 0 ? (
                    <Card>
                      <CardContent className="p-8 text-center space-y-3">
                        <Sparkles className="h-8 w-8 mx-auto text-muted-foreground" />
                        <h3 className="font-medium">Henüz rakip yok</h3>
                        <p className="text-sm text-muted-foreground max-w-md mx-auto">
                          Sisteminiz lokasyonunuza ve seviyenize göre benzer işletmeleri otomatik
                          keşfeder. Başlamak için aşağıdaki butona tıklayın.
                        </p>
                        <Button onClick={discover} disabled={discovering}>
                          {discovering ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Sparkles className="h-4 w-4" />
                          )}
                          Rakipleri Keşfet
                        </Button>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {suggested.map((c) => (
                        <CompetitorCard
                          key={c.id}
                          c={c}
                          actions={
                            <div className="flex gap-2">
                              <Button size="sm" onClick={() => setStatus(c.id, "confirmed")}>
                                <Check className="h-4 w-4" /> Rakibim
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setStatus(c.id, "rejected")}
                              >
                                <X className="h-4 w-4" /> Rakip Değil
                              </Button>
                            </div>
                          }
                        />
                      ))}
                    </div>
                  )}
                </section>
              </>
            )}
          </TabsContent>

          {/* ===== TAB 2: BRIEF ===== */}
          <TabsContent value="brief" className="mt-4">
            {loadingBrief ? (
              <Skeleton className="h-64 w-full" />
            ) : brief ? (
              <BriefView
                brief={brief}
                businessName={activeBusiness?.name ?? ""}
                onRegenerate={generateBrief}
                regenerating={generatingBrief}
              />
            ) : (
              <Card>
                <CardContent className="p-8 text-center space-y-3">
                  <h3 className="font-medium">Brief henüz oluşturulmadı</h3>
                  <p className="text-sm text-muted-foreground max-w-md mx-auto">
                    İlk brief'iniz, en az 1 rakibi onayladıktan sonra oluşturulacak.
                  </p>
                  <Button onClick={generateBrief} disabled={generatingBrief || confirmed.length === 0}>
                    {generatingBrief ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Sparkles className="h-4 w-4" />
                    )}
                    Brief Oluştur
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}

function CompetitorCard({ c, actions }: { c: Competitor; actions: React.ReactNode }) {
  const distanceKm = c.proximity_m != null ? (c.proximity_m / 1000).toFixed(1) : null;
  return (
    <Card>
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="font-medium truncate">{c.name}</h3>
            <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1 flex-wrap">
              {c.rating != null && (
                <span className="inline-flex items-center gap-1">
                  <Star className="h-3 w-3 fill-current text-amber-500" />
                  {c.rating.toFixed(1)}
                </span>
              )}
              {c.review_count != null && <span>{c.review_count} yorum</span>}
              {distanceKm && (
                <span className="inline-flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {distanceKm} km
                </span>
              )}
            </div>
          </div>
          {c.match_score != null && (
            <Badge variant="outline" className={scoreColor(c.match_score)}>
              {Math.round(c.match_score)}
            </Badge>
          )}
        </div>
        <div className="flex justify-end">{actions}</div>
      </CardContent>
    </Card>
  );
}

function BriefView({
  brief,
  businessName,
  onRegenerate,
  regenerating,
}: {
  brief: Brief;
  businessName: string;
  onRegenerate: () => void;
  regenerating: boolean;
}) {
  const s = brief.sections || {};
  const rising: string[] = Array.isArray(s.topics_on_the_rise) ? s.topics_on_the_rise : [];
  const actions: string[] = Array.isArray(s.three_actions) ? s.three_actions : [];

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-wider text-muted-foreground">
            Bu hafta pazarınızda · {businessName}
          </p>
          <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight mt-2 max-w-2xl">
            {s.headline ?? "Bu hafta için brief"}
          </h2>
        </div>
        <Button variant="outline" size="sm" onClick={onRegenerate} disabled={regenerating}>
          {regenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
          Yenile
        </Button>
      </div>

      <Card>
        <CardContent className="p-6 divide-y">
          <BriefRow label="En güçlü avantajınız" value={s.strongest_advantage} />
          {/* TODO: paywall — blur biggest_gap for free tier */}
          <BriefRow label="En büyük açığınız" value={s.biggest_gap} />
          <BriefRow label="En aktif rakip" value={s.most_active_competitor} />
          <div className="py-4">
            <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
              Yükselen konular
            </p>
            {/* TODO: paywall — blur topics_on_the_rise for free tier */}
            {rising.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {rising.map((t, i) => (
                  <Badge key={i} variant="secondary">
                    {t}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">—</p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Bu hafta yapılacak 3 şey</CardTitle>
        </CardHeader>
        <CardContent>
          {actions.length > 0 ? (
            <ol className="space-y-3">
              {actions.map((a, i) => (
                /* TODO: paywall — blur actions 2 & 3 for free tier */
                <li key={i} className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-medium flex items-center justify-center">
                    {i + 1}
                  </span>
                  <span className="text-sm">{a}</span>
                </li>
              ))}
            </ol>
          ) : (
            <p className="text-sm text-muted-foreground">Henüz aksiyon yok.</p>
          )}
        </CardContent>
      </Card>

      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        {brief.signal_strength != null && (
          <Badge variant="outline">Sinyal: {brief.signal_strength}/10</Badge>
        )}
        <span>
          {brief.reviews_analysed ?? 0} yorum · {brief.competitors_count ?? 0} rakip analiz edildi
        </span>
      </div>
    </div>
  );
}

function BriefRow({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="py-4 first:pt-0 last:pb-0">
      <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">{label}</p>
      <p className="text-sm">{value ?? "—"}</p>
    </div>
  );
}