import { useMemo, useRef, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { useBusiness } from "@/contexts/BusinessContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";
import { Upload, Plus, Trash2, Send, Info, Sparkles } from "lucide-react";

type Contact = {
  id: string;
  name: string | null;
  email: string;
  checkout_date: string;
  language: string;
  status: string;
  sent_at: string | null;
  reminded_at: string | null;
  clicked_at: string | null;
};

type Settings = {
  business_id: string;
  enabled: boolean;
  delay_hours: number;
  reminder_enabled: boolean;
  reminder_days: number;
  review_link: string | null;
  sender_name: string | null;
  template_intro: string | null;
};

const STATUS_META: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  pending: { label: "Bekliyor", variant: "secondary" },
  scheduled: { label: "Zamanlandı", variant: "secondary" },
  sent: { label: "Gönderildi", variant: "default" },
  reminded: { label: "Hatırlatıldı", variant: "outline" },
  clicked: { label: "Tıklandı", variant: "default" },
  unsubscribed: { label: "Çıktı", variant: "secondary" },
  failed: { label: "Başarısız", variant: "destructive" },
};

export function ReviewRequestTab() {
  const { activeBusiness } = useBusiness();
  const qc = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);
  const [previewLang, setPreviewLang] = useState<"tr" | "en">("tr");

  // Manual add form
  const [addName, setAddName] = useState("");
  const [addEmail, setAddEmail] = useState("");
  const [addDate, setAddDate] = useState("");
  const [addLang, setAddLang] = useState("tr");
  const [addConsent, setAddConsent] = useState(false);

  // CSV consent
  const [csvConsent, setCsvConsent] = useState(false);

  const settingsQ = useQuery({
    queryKey: ["review-request-settings", activeBusiness?.id],
    queryFn: async (): Promise<Settings | null> => {
      if (!activeBusiness) return null;
      const { data } = await supabase
        .from("review_request_settings")
        .select("*")
        .eq("business_id", activeBusiness.id)
        .maybeSingle();
      return (data as Settings) ?? {
        business_id: activeBusiness.id,
        enabled: false,
        delay_hours: 24,
        reminder_enabled: true,
        reminder_days: 3,
        review_link: activeBusiness.place_id ? `https://search.google.com/local/writereview?placeid=${activeBusiness.place_id}` : null,
        sender_name: activeBusiness.name,
        template_intro: null,
      };
    },
    enabled: !!activeBusiness,
  });

  const contactsQ = useQuery({
    queryKey: ["review-request-contacts", activeBusiness?.id],
    queryFn: async (): Promise<Contact[]> => {
      if (!activeBusiness) return [];
      const { data, error } = await supabase
        .from("review_request_contacts")
        .select("id,name,email,checkout_date,language,status,sent_at,reminded_at,clicked_at")
        .eq("business_id", activeBusiness.id)
        .order("created_at", { ascending: false })
        .limit(500);
      if (error) throw error;
      return (data as Contact[]) ?? [];
    },
    enabled: !!activeBusiness,
  });

  const saveSettings = useMutation({
    mutationFn: async (patch: Partial<Settings>) => {
      if (!activeBusiness || !settingsQ.data) return;
      const merged = { ...settingsQ.data, ...patch, business_id: activeBusiness.id };
      const { error } = await supabase
        .from("review_request_settings")
        .upsert(merged, { onConflict: "business_id" });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["review-request-settings"] });
      toast({ title: "Kaydedildi" });
    },
    onError: (e) => toast({ title: "Hata", description: String(e), variant: "destructive" }),
  });

  const addContact = useMutation({
    mutationFn: async () => {
      if (!activeBusiness) throw new Error("Business yok");
      if (!addConsent) throw new Error("İletişim izni onayı gerekli");
      if (!addEmail.includes("@") || !addDate) throw new Error("Geçerli email ve tarih gerekli");
      const { error } = await supabase.from("review_request_contacts").insert({
        business_id: activeBusiness.id,
        name: addName.trim() || null,
        email: addEmail.trim().toLowerCase(),
        checkout_date: addDate,
        language: addLang,
        consent: true,
        status: "pending",
      });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["review-request-contacts"] });
      setAddName(""); setAddEmail(""); setAddDate(""); setAddConsent(false);
      toast({ title: "Eklendi" });
    },
    onError: (e) => toast({ title: "Hata", description: e instanceof Error ? e.message : "", variant: "destructive" }),
  });

  const del = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("review_request_contacts").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["review-request-contacts"] }),
  });

  const handleCsv = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeBusiness) return;
    if (!csvConsent) {
      toast({ title: "İzin onayı gerekli", description: "CSV yüklemeden önce iletişim izni onay kutucuğunu işaretleyin.", variant: "destructive" });
      if (fileRef.current) fileRef.current.value = "";
      return;
    }
    const text = await file.text();
    const lines = text.split(/\r?\n/).filter((l) => l.trim());
    if (!lines.length) return;
    const header = lines[0].toLowerCase().split(",").map((c) => c.trim());
    const hasHeader = header.includes("email") || header.includes("e-mail");
    const startIdx = hasHeader ? 1 : 0;

    const cols = hasHeader ? header : ["name", "email", "checkout_date", "language"];
    const idx = {
      name: cols.indexOf("name"),
      email: cols.findIndex((c) => c === "email" || c === "e-mail"),
      date: cols.findIndex((c) => c === "checkout_date" || c === "date" || c === "checkout"),
      lang: cols.indexOf("language"),
    };

    const rows: Array<{ business_id: string; name: string | null; email: string; checkout_date: string; language: string; consent: boolean; status: string }> = [];
    const errors: string[] = [];

    for (let i = startIdx; i < lines.length; i++) {
      const parts = lines[i].split(",").map((p) => p.trim().replace(/^"|"$/g, ""));
      const email = idx.email >= 0 ? parts[idx.email] : parts.find((p) => p.includes("@")) || "";
      const date = idx.date >= 0 ? parts[idx.date] : parts.find((p) => /^\d{4}-\d{2}-\d{2}$/.test(p)) || "";
      const name = idx.name >= 0 ? parts[idx.name] : (parts.find((p) => !p.includes("@") && !/^\d{4}-/.test(p)) || null);
      const lang = idx.lang >= 0 ? (parts[idx.lang] || "tr") : "tr";
      if (!email.includes("@")) { errors.push(`Satır ${i + 1}: geçersiz email`); continue; }
      if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) { errors.push(`Satır ${i + 1}: geçersiz checkout_date (YYYY-MM-DD)`); continue; }
      rows.push({
        business_id: activeBusiness.id,
        name: name || null,
        email: email.toLowerCase(),
        checkout_date: date,
        language: (lang || "tr").toLowerCase() === "en" ? "en" : "tr",
        consent: true,
        status: "pending",
      });
    }

    if (!rows.length) {
      toast({ title: "İçe aktarım hatası", description: errors.slice(0, 5).join("\n") || "Geçerli satır yok", variant: "destructive" });
      if (fileRef.current) fileRef.current.value = "";
      return;
    }

    const { error } = await supabase
      .from("review_request_contacts")
      .upsert(rows, { onConflict: "business_id,email,checkout_date", ignoreDuplicates: true });
    if (error) {
      toast({ title: "Hata", description: error.message, variant: "destructive" });
    } else {
      qc.invalidateQueries({ queryKey: ["review-request-contacts"] });
      toast({
        title: `${rows.length} kayıt eklendi`,
        description: errors.length ? `${errors.length} satır atlandı` : undefined,
      });
    }
    if (fileRef.current) fileRef.current.value = "";
  };

  const runNow = async () => {
    const { data, error } = await supabase.functions.invoke("review-request-scheduler", { body: {} });
    if (error) return toast({ title: "Hata", description: error.message, variant: "destructive" });
    const s = (data as { summary?: Record<string, number> })?.summary;
    toast({ title: "Çalıştırıldı", description: s ? `Gönderilen: ${s.sent}, Hatırlatılan: ${s.reminded}` : "Tamam" });
    qc.invalidateQueries({ queryKey: ["review-request-contacts"] });
  };

  const stats = useMemo(() => {
    const cutoff = Date.now() - 30 * 24 * 3600 * 1000;
    const list = (contactsQ.data ?? []).filter((c) => c.sent_at && new Date(c.sent_at).getTime() >= cutoff);
    const sent = list.length;
    const clicked = list.filter((c) => c.clicked_at).length;
    return { sent, clicked, rate: sent ? Math.round((clicked / sent) * 100) : 0 };
  }, [contactsQ.data]);

  const s = settingsQ.data;

  const autofillReviewLink = () => {
    if (!activeBusiness?.place_id) {
      toast({ title: "place_id bulunamadı", description: "Google Business bağlantısı gerekli.", variant: "destructive" });
      return;
    }
    saveSettings.mutate({ review_link: `https://search.google.com/local/writereview?placeid=${activeBusiness.place_id}` });
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card><CardContent className="pt-6 text-center">
          <div className="text-3xl font-bold">{stats.sent}</div>
          <div className="text-sm text-muted-foreground mt-1">Gönderilen (30g)</div>
        </CardContent></Card>
        <Card><CardContent className="pt-6 text-center">
          <div className="text-3xl font-bold text-green-600">{stats.clicked}</div>
          <div className="text-sm text-muted-foreground mt-1">Tıklanan</div>
        </CardContent></Card>
        <Card><CardContent className="pt-6 text-center">
          <div className="text-3xl font-bold">{stats.rate}%</div>
          <div className="text-sm text-muted-foreground mt-1">Tıklama oranı</div>
        </CardContent></Card>
      </div>

      {/* Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" /> Otomasyon Ayarları
          </CardTitle>
          <CardDescription>
            Misafirlerinize çıkıştan sonra otomatik yorum talebi e-postası gönderin. Tıklamayanlara bir kez hatırlatma yapılır.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          {s && (
            <>
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div>
                  <p className="font-medium">Otomasyon aktif</p>
                  <p className="text-sm text-muted-foreground">Kapalıyken hiçbir e-posta gönderilmez.</p>
                </div>
                <Switch checked={s.enabled} onCheckedChange={(v) => saveSettings.mutate({ enabled: v })} />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1">
                  <Label>Çıkıştan sonra gecikme (saat)</Label>
                  <Input type="number" min={1} max={168} defaultValue={s.delay_hours}
                    onBlur={(e) => saveSettings.mutate({ delay_hours: Math.max(1, Math.min(168, Number(e.target.value) || 24)) })} />
                </div>
                <div className="space-y-1">
                  <Label>Gönderen adı</Label>
                  <Input defaultValue={s.sender_name ?? ""} placeholder={activeBusiness?.name}
                    onBlur={(e) => saveSettings.mutate({ sender_name: e.target.value || null })} />
                </div>
                <div className="space-y-1 sm:col-span-2">
                  <Label>Yorum linki</Label>
                  <div className="flex gap-2">
                    <Input defaultValue={s.review_link ?? ""} placeholder="https://..."
                      onBlur={(e) => saveSettings.mutate({ review_link: e.target.value || null })} />
                    <Button type="button" variant="outline" onClick={autofillReviewLink}>Google linkini doldur</Button>
                  </div>
                </div>
                <div className="space-y-1 sm:col-span-2">
                  <Label>Özel giriş metni (opsiyonel)</Label>
                  <Textarea rows={3} defaultValue={s.template_intro ?? ""}
                    placeholder="Boş bırakılırsa varsayılan metin kullanılır."
                    onBlur={(e) => saveSettings.mutate({ template_intro: e.target.value || null })} />
                </div>
              </div>

              <div className="flex items-center justify-between rounded-lg border p-4">
                <div>
                  <p className="font-medium">Hatırlatma e-postası</p>
                  <p className="text-sm text-muted-foreground">Tıklamayanlara belirtilen gün sonra 1 kez.</p>
                </div>
                <div className="flex items-center gap-3">
                  <Input type="number" min={1} max={30} className="w-20" defaultValue={s.reminder_days}
                    onBlur={(e) => saveSettings.mutate({ reminder_days: Math.max(1, Math.min(30, Number(e.target.value) || 3)) })} />
                  <span className="text-sm text-muted-foreground">gün</span>
                  <Switch checked={s.reminder_enabled} onCheckedChange={(v) => saveSettings.mutate({ reminder_enabled: v })} />
                </div>
              </div>

              {/* Template preview */}
              <div className="rounded-lg border bg-muted/30 p-4">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-medium">Şablon önizleme</p>
                  <div className="flex gap-1">
                    <Button size="sm" variant={previewLang === "tr" ? "default" : "outline"} onClick={() => setPreviewLang("tr")}>TR</Button>
                    <Button size="sm" variant={previewLang === "en" ? "default" : "outline"} onClick={() => setPreviewLang("en")}>EN</Button>
                  </div>
                </div>
                <div className="rounded bg-background p-4 text-sm">
                  <p className="font-semibold mb-2">
                    {previewLang === "tr"
                      ? `${s.sender_name || activeBusiness?.name}: deneyiminizi paylaşır mısınız?`
                      : `${s.sender_name || activeBusiness?.name}: could you share your experience?`}
                  </p>
                  <p className="text-muted-foreground whitespace-pre-line">
                    {s.template_intro?.trim() || (previewLang === "tr"
                      ? `Merhaba {isim}, bizi tercih ettiğiniz için teşekkür ederiz. ${s.sender_name || activeBusiness?.name} olarak deneyiminizi bir yorumla paylaşmanız çok değerli.`
                      : `Hi {name}, thank you for choosing ${s.sender_name || activeBusiness?.name}. Sharing your experience in a short review helps us a lot.`)}
                  </p>
                  <div className="mt-3">
                    <span className="inline-block rounded-md bg-primary px-4 py-2 text-primary-foreground text-xs font-semibold">
                      {previewLang === "tr" ? "Yorumunuzu paylaşın" : "Share your review"}
                    </span>
                  </div>
                </div>
                <p className="mt-3 flex items-start gap-2 text-xs text-muted-foreground">
                  <Info className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                  KVKK: yalnızca sizden e-posta almayı kabul eden misafirlere gönderim yapmalısınız. İzin sorumluluğu işletmeye aittir.
                </p>
              </div>

              <div className="flex justify-end">
                <Button variant="outline" onClick={runNow}>
                  <Send className="h-4 w-4 mr-2" /> Şimdi çalıştır (test)
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Add / import */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Misafir Ekle</CardTitle>
          <CardDescription>Tek tek ekleyin veya CSV yükleyin (name, email, checkout_date, language).</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-5">
            <Input placeholder="Ad" value={addName} onChange={(e) => setAddName(e.target.value)} />
            <Input placeholder="Email" type="email" value={addEmail} onChange={(e) => setAddEmail(e.target.value)} />
            <Input type="date" value={addDate} onChange={(e) => setAddDate(e.target.value)} />
            <select className="rounded-md border bg-background px-3 text-sm" value={addLang} onChange={(e) => setAddLang(e.target.value)}>
              <option value="tr">TR</option>
              <option value="en">EN</option>
            </select>
            <Button onClick={() => addContact.mutate()} disabled={addContact.isPending}>
              <Plus className="h-4 w-4 mr-1" /> Ekle
            </Button>
          </div>
          <div className="flex items-start gap-2">
            <Checkbox id="single-consent" checked={addConsent} onCheckedChange={(v) => setAddConsent(!!v)} />
            <Label htmlFor="single-consent" className="text-sm font-normal leading-snug">
              Bu kişiden e-posta ile iletişim izni alınmıştır (KVKK / aydınlatma metni sağlandı).
            </Label>
          </div>

          <div className="border-t pt-4 space-y-2">
            <div className="flex items-start gap-2">
              <Checkbox id="csv-consent" checked={csvConsent} onCheckedChange={(v) => setCsvConsent(!!v)} />
              <Label htmlFor="csv-consent" className="text-sm font-normal leading-snug">
                CSV'deki tüm kişilerden e-posta ile iletişim izni alınmıştır.
              </Label>
            </div>
            <div className="flex gap-2">
              <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={handleCsv} />
              <Button variant="outline" onClick={() => fileRef.current?.click()} disabled={!csvConsent}>
                <Upload className="h-4 w-4 mr-2" /> CSV Yükle
              </Button>
              <span className="text-xs text-muted-foreground self-center">Kolonlar: name, email, checkout_date, language</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader><CardTitle className="text-lg">Misafirler</CardTitle></CardHeader>
        <CardContent>
          {contactsQ.isLoading ? (
            <p className="text-sm text-muted-foreground">Yükleniyor...</p>
          ) : (contactsQ.data ?? []).length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">Henüz misafir eklenmedi.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ad</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Çıkış</TableHead>
                  <TableHead>Dil</TableHead>
                  <TableHead>Durum</TableHead>
                  <TableHead className="w-10"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(contactsQ.data ?? []).map((c) => {
                  const m = STATUS_META[c.status] || STATUS_META.pending;
                  return (
                    <TableRow key={c.id}>
                      <TableCell>{c.name || "—"}</TableCell>
                      <TableCell className="font-medium">{c.email}</TableCell>
                      <TableCell>{c.checkout_date}</TableCell>
                      <TableCell><Badge variant="secondary" className="text-xs uppercase">{c.language}</Badge></TableCell>
                      <TableCell><Badge variant={m.variant} className="text-xs">{m.label}</Badge></TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon" onClick={() => del.mutate(c.id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}