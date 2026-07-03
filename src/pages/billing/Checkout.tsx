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
import { Loader2, ShieldCheck, Hotel, UtensilsCrossed, Scissors, Stethoscope } from "lucide-react";

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
  const [loading, setLoading] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const [postFields, setPostFields] = useState<Record<string, string> | null>(null);
  const [postAction, setPostAction] = useState("");

  const planSubtotal = useMemo(() => {
    if (!plan) return 0;
    return plan.unit_type === "per_location"
      ? Number(plan.base_amount) * Math.max(1, Number(locationCount) || 1)
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
          location_count: plan!.unit_type === "per_location" ? Math.max(1, Number(locationCount) || 1) : 1,
          computed_total: computedTotal,
          addon_codes: selectedAddons,
        },
      });
      if (error) throw error;
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
          <Card>
            <CardHeader><CardTitle>İşletme Türü</CardTitle></CardHeader>
            <CardContent className="grid sm:grid-cols-2 gap-3">
              {plans.map((p) => {
                const Icon = SEGMENT_ICON[p.segment];
                const active = plan?.id === p.id;
                return (
                  <button
                    type="button"
                    key={p.id}
                    onClick={() => setPlan(p)}
                    className={`border rounded-lg p-4 text-left transition flex items-start gap-3 ${
                      active ? "border-primary ring-2 ring-primary/30" : "border-border hover:border-muted-foreground/40"
                    }`}
                  >
                    <Icon className="w-5 h-5 mt-0.5 text-primary shrink-0" />
                    <div>
                      <div className="font-semibold">{p.label}</div>
                      <div className="text-sm text-muted-foreground">
                        {Number(p.base_amount).toLocaleString("tr-TR")} TL{p.unit_type === "per_location" ? " / lokasyon / ay" : " / ay"}
                      </div>
                    </div>
                  </button>
                );
              })}
            </CardContent>
          </Card>

          {plan?.unit_type === "per_location" && (
            <Card className="mt-6">
              <CardHeader><CardTitle>Lokasyon Sayısı</CardTitle></CardHeader>
              <CardContent>
                <Label>Kaç lokasyonunuz var?</Label>
                <Input
                  type="number"
                  min={1}
                  value={locationCount}
                  onChange={(e) => setLocationCount(Math.max(1, Number(e.target.value) || 1))}
                  className="max-w-[160px] mt-1"
                />
                <p className="text-xs text-muted-foreground mt-2">
                  {Number(plan.base_amount).toLocaleString("tr-TR")} TL × {locationCount} lokasyon = {" "}
                  <span className="font-medium text-foreground">{planSubtotal.toLocaleString("tr-TR")} TL</span>
                </p>
              </CardContent>
            </Card>
          )}

          {addons.length > 0 && (
            <Card className="mt-6">
              <CardHeader><CardTitle>Ek Modüller (Opsiyonel)</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {addons.map((a) => {
                  const checked = selectedAddons.includes(a.addon_code);
                  return (
                    <label
                      key={a.id}
                      className="flex items-center justify-between gap-3 border rounded-lg p-3 cursor-pointer hover:border-muted-foreground/40"
                    >
                      <div className="flex items-center gap-3">
                        <Checkbox
                          checked={checked}
                          onCheckedChange={(v) =>
                            setSelectedAddons((prev) =>
                              v ? [...prev, a.addon_code] : prev.filter((c) => c !== a.addon_code),
                            )
                          }
                        />
                        <span className="text-sm font-medium">{a.label}</span>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        +{Number(a.amount).toLocaleString("tr-TR")} TL / ay
                      </span>
                    </label>
                  );
                })}
              </CardContent>
            </Card>
          )}

          <Card className="mt-6 border-primary/40 bg-primary/5">
            <CardContent className="pt-6 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Plan</span>
                <span>{planSubtotal.toLocaleString("tr-TR")} TL</span>
              </div>
              {addonsSubtotal > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Ek modüller</span>
                  <span>{addonsSubtotal.toLocaleString("tr-TR")} TL</span>
                </div>
              )}
              <div className="h-px bg-border my-2" />
              <div className="flex justify-between text-base font-semibold">
                <span>Aylık Toplam</span>
                <span>{computedTotal.toLocaleString("tr-TR")} TL</span>
              </div>
            </CardContent>
          </Card>
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
          <div className="flex items-start gap-3 border rounded-lg p-4 bg-muted/30">
            <Checkbox id="consent" checked={consent} onCheckedChange={(v) => setConsent(!!v)} />
            <label htmlFor="consent" className="text-sm leading-relaxed cursor-pointer">
              {consentText}
            </label>
          </div>
          )}

          <Button type="submit" className="w-full h-12" disabled={loading || (!updateCardMode && !consent)}>
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