import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { Loader2, ShieldCheck, Hotel, UtensilsCrossed, Scissors, Stethoscope, Info, Check, Building2 } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";

type Plan = {
  id: string;
  segment: "hotel" | "restaurant" | "salon" | "clinic";
  plan_code: string;
  label: string;
  base_amount: number;
  unit_type: "flat" | "per_location";
};
type Addon = { id: string; addon_code: string; label: string; amount: number };

const SEGMENT_ICON: Record<Plan["segment"], typeof Hotel> = {
  hotel: Hotel,
  restaurant: UtensilsCrossed,
  salon: Scissors,
  clinic: Stethoscope,
};
const DEFAULT_SEGMENT_ICON = Building2;
const DEFAULT_SEGMENT_META = {
  tagline: "Yorum yönetimi ve itibar takibi.",
  details: [
    "Google ve sektörel platform yorum takibi",
    "AI destekli yanıt üretimi",
    "Trend ve memnuniyet raporları",
  ],
  audience: "İşletmeniz için.",
};

const SEGMENT_META: Record<Plan["segment"], { tagline: string; details: string[]; audience: string }> = {
  hotel: {
    tagline: "Yorum yönetimi, çoklu platform entegrasyonu ve sentiment analizi.",
    details: [
      "Google, Booking, TripAdvisor ve Hotels.com entegrasyonu",
      "AI destekli çok dilli yanıt üretimi",
      "Rakip karşılaştırma ve konum bazlı raporlar",
      "Haftalık yönetici özet e-postaları",
    ],
    audience: "Butik oteller, resort ve zincir otel yöneticileri için.",
  },
  restaurant: {
    tagline: "Şubeler arası yorum takibi ve otomatik yanıt yönetimi.",
    details: [
      "Her lokasyon için ayrı puan ve trend analizi",
      "Google & TripAdvisor yorumlarına AI yanıt",
      "Menü/servis konularına göre kategori raporları",
      "Şube performans karşılaştırması",
    ],
    audience: "Tek şube veya zincir restoranlar, kafeler için.",
  },
  salon: {
    tagline: "Randevu sonrası itibar yönetimi ve müşteri geri dönüşü.",
    details: [
      "Google Business yorumlarına otomatik yanıt",
      "Müşteri memnuniyet skoru takibi",
      "Olumsuz yorumlar için anında bildirim",
      "Yorum toplama QR ve kısa linkleri",
    ],
    audience: "Güzellik salonları, kuaförler ve spa'lar için.",
  },
  clinic: {
    tagline: "Hasta yorumları için hassas ve profesyonel itibar yönetimi.",
    details: [
      "Sağlık jargonuna uygun AI yanıt tonu",
      "Google ve sektörel platform takibi",
      "Olumsuz yorumlarda gerçek zamanlı uyarı",
      "Hekim/branş bazlı memnuniyet raporları",
    ],
    audience: "Poliklinikler, diş klinikleri ve estetik merkezleri için.",
  },
};

const SEGMENT_LABEL: Record<Plan["segment"], string> = {
  hotel: "Otel",
  restaurant: "Restoran",
  salon: "Salon",
  clinic: "Klinik",
};

const ADDON_META: Record<string, string> = {
  competitor_analysis:
    "Bölgenizdeki rakip işletmelerin puan ve yorum trendini otomatik olarak izler; kıyaslamalı raporlar sunar.",
  ai_visibility:
    "ChatGPT, Gemini gibi AI arama motorlarında işletmenizin ne sıklıkla ve nasıl önerildiğini takip eder.",
};

export default function BillingCheckout() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [searchParams] = useSearchParams();
  const updateCardMode = searchParams.get("mode") === "update-card";
  const [businessId, setBusinessId] = useState<string>("");
  const [businesses, setBusinesses] = useState<{ id: string; name: string }[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [addons, setAddons] = useState<Addon[]>([]);
  const [plan, setPlan] = useState<Plan | null>(null);
  const [locationCount, setLocationCount] = useState<number>(1);
  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);
  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("Türkiye");
  const [countryOther, setCountryOther] = useState("");
  const COUNTRY_OPTIONS = ["Türkiye", "Almanya", "Birleşik Krallık", "ABD", "Fransa", "Hollanda", "İtalya", "İspanya", "Rusya", "Suudi Arabistan", "Birleşik Arap Emirlikleri", "Katar", "Azerbaycan", "KKTC", "Bulgaristan", "Yunanistan", "Diğer"];
  const [ccOwner, setCcOwner] = useState("");
  const [ccNumber, setCcNumber] = useState("");
  const [ccExpMonth, setCcExpMonth] = useState("");
  const [ccExpYear, setCcExpYear] = useState("");
  const [ccCvv, setCcCvv] = useState("");
  const [consent, setConsent] = useState(false);
  const [legalConsent, setLegalConsent] = useState(false);
  const [loading, setLoading] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const [postFields, setPostFields] = useState<Record<string, string> | null>(null);
  const [postAction, setPostAction] = useState("");

  const planSubtotal = useMemo(() => {
    if (!plan) return 0;
    const loc = Math.min(500, Math.max(1, Math.trunc(Number(locationCount) || 1)));
    return plan.unit_type === "per_location"
      ? Number(plan.base_amount) * loc
      : Number(plan.base_amount);
  }, [plan, locationCount]);

  const addonsSubtotal = useMemo(
    () =>
      addons
        .filter((a) => selectedAddons.includes(a.addon_code))
        .reduce((s, a) => s + Number(a.amount), 0),
    [addons, selectedAddons],
  );

  const computedTotal = useMemo(
    () => Math.round((planSubtotal + addonsSubtotal) * 100) / 100,
    [planSubtotal, addonsSubtotal],
  );

  const consentText = useMemo(
    () =>
      plan
        ? `${plan.label} planı için kartım her ay otomatik olarak ${computedTotal} TL tutarında yenilenecek. İptal edene kadar bu abonelik devam edecek.`
        : "",
    [plan, computedTotal],
  );

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate("/login?redirect=/billing/checkout");
      return;
    }
    (async () => {
      const { data } = await supabase
        .from("businesses")
        .select("id,name")
        .eq("user_id", user.id);
      setBusinesses(data ?? []);
      if (data && data[0]) setBusinessId(data[0].id);
    })();
  }, [authLoading, user, navigate]);

  // Load pricing catalog
  useEffect(() => {
    (async () => {
      const [{ data: p }, { data: a }] = await Promise.all([
        supabase.from("plans").select("*").eq("is_active", true).order("base_amount"),
        supabase.from("addons").select("*").eq("is_active", true).order("amount"),
      ]);
      const orderedSegments: Plan["segment"][] = ["hotel", "restaurant", "salon", "clinic"];
      const sorted = ((p ?? []) as Plan[]).sort(
        (x, y) => orderedSegments.indexOf(x.segment) - orderedSegments.indexOf(y.segment),
      );
      setPlans(sorted);
      setAddons((a ?? []) as Addon[]);
      if (sorted.length && !plan) setPlan(sorted[0]);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // When postFields set, auto-submit form to PayTR
  useEffect(() => {
    if (postFields && formRef.current) formRef.current.submit();
  }, [postFields]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!updateCardMode && !consent) {
      toast({ title: "Onay gerekli", description: "Devam etmek için otomatik yenileme onayını verin." });
      return;
    }
    if (!updateCardMode && !legalConsent) {
      toast({
        title: "Sözleşme onayı gerekli",
        description: "Mesafeli Satış Sözleşmesi ve Ön Bilgilendirme Formu'nu onaylamanız gerekiyor.",
      });
      return;
    }
    if (!businessId) {
      toast({ title: "İşletme seçin", variant: "destructive" });
      return;
    }
    if (!updateCardMode && !plan) {
      toast({ title: "Plan seçin", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      // 1) log consent (skip in card-update mode; user already consented on initial subscription)
      if (!updateCardMode) {
        await supabase.from("subscription_consent_log").insert({
        business_id: businessId,
        user_id: user!.id,
        plan_code: plan!.plan_code,
        amount: computedTotal,
        currency: "TL",
        consent_text_snapshot: consentText,
        });
      }

      // 2) get PayTR fields from edge function
      const safeLocationCount = plan!.unit_type === "per_location"
        ? Math.min(500, Math.max(1, Math.trunc(Number(locationCount) || 1)))
        : 1;
      const { data, error } = await supabase.functions.invoke("paytr-first-payment", {
        body: {
          business_id: businessId,
          plan_code: plan!.plan_code,
          amount: computedTotal,
          email: user!.email,
          user_name: name,
          city,
          country: country === "Diğer" ? (countryOther.trim() || "Diğer") : country,
          plan_id: plan!.id,
          location_count: safeLocationCount,
          computed_total: computedTotal,
          addon_codes: selectedAddons,
        },
      });
      if (error) {
        // Try to parse body from the edge function response for meaningful messages
        let parsed: { error?: string; server_total?: number } | null = null;
        try {
          const ctx = (error as unknown as { context?: Response }).context;
          if (ctx && typeof ctx.text === "function") {
            const txt = await ctx.text();
            parsed = txt ? JSON.parse(txt) : null;
          }
        } catch {
          /* ignore parse errors */
        }
        if (parsed?.error === "amount_mismatch") {
          toast({
            title: "Fiyat bilgisi güncellendi",
            description:
              "Lütfen sayfayı yenileyip tekrar deneyin. Güncel paket fiyatı seçiminizle eşleşmiyor.",
            variant: "destructive",
          });
          setLoading(false);
          return;
        }
        if (parsed?.error === "location_count_out_of_range") {
          toast({
            title: "Lokasyon sayısı geçersiz",
            description: "Lokasyon sayısı 1 ile 500 arasında olmalıdır.",
            variant: "destructive",
          });
          setLoading(false);
          return;
        }
        throw error;
      }
      if (!data?.fields || !data?.action) throw new Error("PayTR yanıtı geçersiz");

      // 3) Merge card fields for the form POST
      const merged: Record<string, string> = {
        ...data.fields,
        cc_owner: ccOwner,
        card_number: ccNumber.replace(/\s+/g, ""),
        expiry_month: ccExpMonth,
        expiry_year: ccExpYear,
        cvv: ccCvv,
      };
      setPostAction(data.action);
      setPostFields(merged);
    } catch (err) {
      toast({
        title: "Ödeme başlatılamadı",
        description: (err as Error).message,
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background py-10">
      <div className="container max-w-2xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-2">
          {updateCardMode ? "Kartı Güncelle" : "Abonelik Ödemesi"}
        </h1>
        <p className="text-muted-foreground mb-6 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4" /> Kart bilgileriniz doğrudan PayTR'ye iletilir, sunucularımıza uğramaz.
        </p>

        {!updateCardMode && (
        <>
          <section>
            <div className="flex items-baseline gap-3 mb-1">
              <span className="text-xs font-semibold text-primary tracking-wider">ADIM 1</span>
              <h2 className="text-xl font-semibold">İşletme Türü</h2>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              İşletmenize en uygun paketi seçin. Her paket sektöre özel entegrasyonlarla gelir.
            </p>
            <div className="grid sm:grid-cols-2 gap-4">
              {plans.map((p) => {
                const Icon = SEGMENT_ICON[p.segment] ?? DEFAULT_SEGMENT_ICON;
                const active = plan?.id === p.id;
                const meta = SEGMENT_META[p.segment] ?? DEFAULT_SEGMENT_META;
                return (
                  <div key={p.id} className="relative">
                    <button
                      type="button"
                      onClick={() => setPlan(p)}
                      className={`w-full text-left rounded-xl border bg-card p-5 transition-all duration-200 ${
                        active
                          ? "border-primary ring-2 ring-primary/25 shadow-md scale-[1.01]"
                          : "border-border hover:border-primary/40 hover:shadow-sm hover:-translate-y-0.5"
                      }`}
                    >
                      {active && (
                        <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                          <Check className="w-3.5 h-3.5 text-primary-foreground" />
                        </div>
                      )}
                      <div className="w-11 h-11 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
                        <Icon className="w-5 h-5 text-primary" />
                      </div>
                      <div className="font-semibold text-base mb-1">{p.label}</div>
                      <p className="text-xs text-muted-foreground leading-relaxed mb-3 pr-6">
                        {meta.tagline}
                      </p>
                      <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-bold tracking-tight">
                          {Number(p.base_amount).toLocaleString("tr-TR")}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          TL{p.unit_type === "per_location" ? " / lokasyon / ay" : " / ay"}
                        </span>
                      </div>
                    </button>
                    <Popover>
                      <PopoverTrigger asChild>
                        <button
                          type="button"
                          onClick={(e) => e.stopPropagation()}
                          className="absolute bottom-4 right-4 w-7 h-7 rounded-full flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition"
                          aria-label="Detaylar"
                        >
                          <Info className="w-4 h-4" />
                        </button>
                      </PopoverTrigger>
                      <PopoverContent align="end" className="w-80">
                        <div className="space-y-3">
                          <div>
                            <div className="font-semibold text-sm">{p.label} — Neler Dahil?</div>
                            <p className="text-xs text-muted-foreground mt-0.5">{meta.audience}</p>
                          </div>
                          <ul className="space-y-1.5">
                            {meta.details.map((d) => (
                              <li key={d} className="flex items-start gap-2 text-xs">
                                <Check className="w-3.5 h-3.5 text-primary mt-0.5 shrink-0" />
                                <span className="text-muted-foreground leading-relaxed">{d}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>
                );
              })}
            </div>
          </section>

          {plan?.unit_type === "per_location" && (
            <Card className="mt-6 rounded-xl">
              <CardHeader>
                <CardTitle className="text-lg">Lokasyon Sayısı</CardTitle>
                <p className="text-sm text-muted-foreground">Her lokasyon ayrı fiyatlandırılır.</p>
              </CardHeader>
              <CardContent>
                <Label>Kaç lokasyonunuz var?</Label>
                <Input
                  type="number"
                  min={1}
                  max={500}
                  step={1}
                  value={locationCount}
                  onChange={(e) =>
                    setLocationCount(
                      Math.min(500, Math.max(1, Math.trunc(Number(e.target.value) || 1))),
                    )
                  }
                  className="max-w-[160px] mt-1"
                />
                <p className="text-xs text-muted-foreground mt-2">
                  {Number(plan.base_amount).toLocaleString("tr-TR")} TL × {locationCount} lokasyon ={" "}
                  <span className="font-medium text-foreground">
                    {planSubtotal.toLocaleString("tr-TR")} TL
                  </span>
                </p>
              </CardContent>
            </Card>
          )}

          {addons.length > 0 && (
            <section className="mt-8">
              <div className="flex items-baseline gap-3 mb-1">
                <span className="text-xs font-semibold text-primary tracking-wider">ADIM 2</span>
                <h2 className="text-xl font-semibold">Ek Modüller</h2>
                <span className="text-xs text-muted-foreground">Opsiyonel</span>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                İhtiyacınıza göre paketinizi güçlendirin. İstediğiniz zaman ekleyip kaldırabilirsiniz.
              </p>
              <div className="grid gap-3">
                {addons.map((a) => {
                  const checked = selectedAddons.includes(a.addon_code);
                  const info = ADDON_META[a.addon_code];
                  return (
                    <div
                      key={a.id}
                      className={`rounded-xl border bg-card p-4 transition ${
                        checked
                          ? "border-primary ring-1 ring-primary/20"
                          : "border-border hover:border-primary/40"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <Checkbox
                          className="mt-1"
                          checked={checked}
                          onCheckedChange={(v) =>
                            setSelectedAddons((prev) =>
                              v ? [...prev, a.addon_code] : prev.filter((c) => c !== a.addon_code),
                            )
                          }
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold">{a.label}</span>
                            {info && (
                              <Popover>
                                <PopoverTrigger asChild>
                                  <button
                                    type="button"
                                    className="text-muted-foreground hover:text-primary transition"
                                    aria-label="Modül bilgisi"
                                  >
                                    <Info className="w-3.5 h-3.5" />
                                  </button>
                                </PopoverTrigger>
                                <PopoverContent className="w-72 text-xs text-muted-foreground leading-relaxed">
                                  {info}
                                </PopoverContent>
                              </Popover>
                            )}
                          </div>
                          {info && (
                            <p className="text-xs text-muted-foreground mt-1 leading-relaxed line-clamp-2">
                              {info}
                            </p>
                          )}
                        </div>
                        <div className="text-sm font-medium whitespace-nowrap">
                          +{Number(a.amount).toLocaleString("tr-TR")} TL
                          <span className="text-muted-foreground font-normal"> / ay</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          <div className="mt-8">
            <div className="text-xs font-semibold text-primary tracking-wider mb-2">SİPARİŞ ÖZETİ</div>
            <Card className="rounded-xl border-primary/30 shadow-[0_10px_40px_-20px_rgba(122,90,248,0.35)]">
              <CardContent className="pt-6 space-y-4">
                {plan && (
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold">{plan.label}</span>
                        <Badge variant="secondary" className="text-[10px] uppercase tracking-wider">
                          {SEGMENT_LABEL[plan.segment] ?? "Paket"}
                        </Badge>
                      </div>
                      {plan.unit_type === "per_location" ? (
                        <p className="text-xs text-muted-foreground mt-1">
                          {Number(plan.base_amount).toLocaleString("tr-TR")} TL × {locationCount} lokasyon
                        </p>
                      ) : (
                        <p className="text-xs text-muted-foreground mt-1">Sabit aylık plan</p>
                      )}
                    </div>
                    <span className="text-sm font-medium whitespace-nowrap">
                      {planSubtotal.toLocaleString("tr-TR")} TL
                    </span>
                  </div>
                )}

                {selectedAddons.length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-dashed border-border">
                    {addons
                      .filter((a) => selectedAddons.includes(a.addon_code))
                      .map((a) => (
                        <div key={a.id} className="flex justify-between text-sm">
                          <span className="text-muted-foreground">+ {a.label}</span>
                          <span>{Number(a.amount).toLocaleString("tr-TR")} TL</span>
                        </div>
                      ))}
                  </div>
                )}

                <div className="h-px bg-border" />

                <div className="flex items-end justify-between">
                  <div>
                    <div className="text-base font-semibold">Aylık Toplam</div>
                    <div className="text-[11px] text-muted-foreground">
                      Her ay otomatik yenilenir · istediğinizde iptal edin
                    </div>
                  </div>
                  <div className="text-2xl font-bold tracking-tight">
                    {computedTotal.toLocaleString("tr-TR")}{" "}
                    <span className="text-sm font-medium text-muted-foreground">TL</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 mt-6">
          <Card>
            <CardHeader><CardTitle>Ödeme Bilgileri</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {businesses.length > 1 && (
                <div>
                  <Label>İşletme</Label>
                  <select
                    className="w-full border rounded-md h-10 px-3 bg-background"
                    value={businessId}
                    onChange={(e) => setBusinessId(e.target.value)}
                  >
                    {businesses.map((b) => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                </div>
              )}
              <div>
                <Label>Ad Soyad</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} required maxLength={100} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Şehir</Label>
                  <Input value={city} onChange={(e) => setCity(e.target.value)} required maxLength={60} />
                </div>
                <div>
                  <Label>Ülke</Label>
                  <select
                    className="w-full border rounded-md h-10 px-3 bg-background"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                  >
                    {COUNTRY_OPTIONS.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                  {country === "Diğer" && (
                    <Input
                      className="mt-2"
                      placeholder="Ülke adı"
                      value={countryOther}
                      onChange={(e) => setCountryOther(e.target.value)}
                      required
                      maxLength={60}
                    />
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Kart Bilgileri</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Kart Sahibi</Label>
                <Input value={ccOwner} onChange={(e) => setCcOwner(e.target.value)} required maxLength={100} />
              </div>
              <div>
                <Label>Kart Numarası</Label>
                <Input
                  inputMode="numeric"
                  autoComplete="cc-number"
                  value={ccNumber}
                  onChange={(e) => setCcNumber(e.target.value)}
                  required
                  maxLength={23}
                  placeholder="0000 0000 0000 0000"
                />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <Label>Ay</Label>
                  <Input value={ccExpMonth} onChange={(e) => setCcExpMonth(e.target.value)} required maxLength={2} placeholder="MM" />
                </div>
                <div>
                  <Label>Yıl</Label>
                  <Input value={ccExpYear} onChange={(e) => setCcExpYear(e.target.value)} required maxLength={2} placeholder="YY" />
                </div>
                <div>
                  <Label>CVV</Label>
                  <Input value={ccCvv} onChange={(e) => setCcCvv(e.target.value)} required maxLength={4} />
                </div>
              </div>
            </CardContent>
          </Card>

          {!updateCardMode && (
          <div className="space-y-3">
            <div className="flex items-start gap-3 border rounded-lg p-4 bg-muted/30">
              <Checkbox id="consent" checked={consent} onCheckedChange={(v) => setConsent(!!v)} />
              <label htmlFor="consent" className="text-sm leading-relaxed cursor-pointer">
                {consentText}
              </label>
            </div>
            <div className="flex items-start gap-3 border rounded-lg p-4 bg-muted/30">
              <Checkbox
                id="legal-consent"
                checked={legalConsent}
                onCheckedChange={(v) => setLegalConsent(!!v)}
              />
              <label htmlFor="legal-consent" className="text-sm leading-relaxed cursor-pointer">
                <a
                  href="/mesafeli-satis-sozlesmesi"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline text-primary hover:opacity-80"
                >
                  Mesafeli Satış Sözleşmesi
                </a>
                'ni ve{" "}
                <a
                  href="/on-bilgilendirme-formu"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline text-primary hover:opacity-80"
                >
                  Ön Bilgilendirme Formu
                </a>
                'nu okudum, kabul ediyorum.
              </label>
            </div>
            <p className="text-xs text-muted-foreground px-1">
              Abonelik iptali ve iade koşulları için{" "}
              <a
                href="/iptal-iade-kosullari"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-foreground"
              >
                İptal &amp; İade Koşulları
              </a>{" "}
              sayfasına bakınız.
            </p>
          </div>
          )}

          <Button
            type="submit"
            className="w-full h-12"
            disabled={loading || (!updateCardMode && (!consent || !legalConsent))}
          >
            {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
            {updateCardMode ? "Kartı Güvenle Güncelle" : `Güvenli Ödemeye Geç (${computedTotal.toLocaleString("tr-TR")} TL)`}
          </Button>
        </form>

        {/* Hidden auto-submit form to PayTR (real navigation to 3D page) */}
        {postFields && (
          <form
            ref={formRef}
            method="post"
            action={postAction}
            style={{ display: "none" }}
          >
            {Object.entries(postFields).map(([k, v]) => (
              <input key={k} type="hidden" name={k} value={v} />
            ))}
          </form>
        )}
      </div>
    </div>
  );
}