import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { Loader2, ShieldCheck } from "lucide-react";

type Plan = { code: string; name: string; amount: number };
const PLANS: Plan[] = [
  { code: "starter_monthly", name: "Starter", amount: 499 },
  { code: "pro_monthly", name: "Pro", amount: 999 },
  { code: "agency_monthly", name: "Agency", amount: 2499 },
];

export default function BillingCheckout() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [businessId, setBusinessId] = useState<string>("");
  const [businesses, setBusinesses] = useState<{ id: string; name: string }[]>([]);
  const [plan, setPlan] = useState<Plan>(PLANS[1]);
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
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

  const consentText = useMemo(
    () =>
      `${plan.name} planı için kartım her ay otomatik olarak ${plan.amount} TL tutarında yenilenecek. İptal edene kadar bu abonelik devam edecek.`,
    [plan],
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

  // When postFields set, auto-submit form to PayTR
  useEffect(() => {
    if (postFields && formRef.current) formRef.current.submit();
  }, [postFields]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!consent) {
      toast({ title: "Onay gerekli", description: "Devam etmek için otomatik yenileme onayını verin." });
      return;
    }
    if (!businessId) {
      toast({ title: "İşletme seçin", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      // 1) log consent
      await supabase.from("subscription_consent_log").insert({
        business_id: businessId,
        user_id: user!.id,
        plan_code: plan.code,
        amount: plan.amount,
        currency: "TL",
        consent_text_snapshot: consentText,
      });

      // 2) get PayTR fields from edge function
      const { data, error } = await supabase.functions.invoke("paytr-first-payment", {
        body: {
          business_id: businessId,
          plan_code: plan.code,
          amount: plan.amount,
          email: user!.email,
          user_name: name,
          user_address: address,
          user_phone: phone,
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
        <h1 className="text-3xl font-bold mb-2">Abonelik Ödemesi</h1>
        <p className="text-muted-foreground mb-6 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4" /> Kart bilgileriniz doğrudan PayTR'ye iletilir, sunucularımıza uğramaz.
        </p>

        <Card>
          <CardHeader><CardTitle>Plan</CardTitle></CardHeader>
          <CardContent className="grid sm:grid-cols-3 gap-3">
            {PLANS.map((p) => (
              <button
                type="button"
                key={p.code}
                onClick={() => setPlan(p)}
                className={`border rounded-lg p-4 text-left transition ${
                  plan.code === p.code ? "border-primary ring-2 ring-primary/30" : "border-border"
                }`}
              >
                <div className="font-semibold">{p.name}</div>
                <div className="text-sm text-muted-foreground">{p.amount} TL / ay</div>
              </button>
            ))}
          </CardContent>
        </Card>

        <form onSubmit={handleSubmit} className="space-y-6 mt-6">
          <Card>
            <CardHeader><CardTitle>Fatura Bilgileri</CardTitle></CardHeader>
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
              <div>
                <Label>Adres</Label>
                <Input value={address} onChange={(e) => setAddress(e.target.value)} required maxLength={400} />
              </div>
              <div>
                <Label>Telefon</Label>
                <Input value={phone} onChange={(e) => setPhone(e.target.value)} required maxLength={20} />
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

          <div className="flex items-start gap-3 border rounded-lg p-4 bg-muted/30">
            <Checkbox id="consent" checked={consent} onCheckedChange={(v) => setConsent(!!v)} />
            <label htmlFor="consent" className="text-sm leading-relaxed cursor-pointer">
              {consentText}
            </label>
          </div>

          <Button type="submit" className="w-full h-12" disabled={loading || !consent}>
            {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
            Güvenli Ödemeye Geç ({plan.amount} TL)
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