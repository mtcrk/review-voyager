import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Loader2, Plus, Pencil, Trash2, MessageCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useBusiness } from "@/contexts/BusinessContext";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Recipient {
  id: string;
  phone_e164: string;
  display_name: string | null;
  role: string | null;
  min_rating_threshold: number;
  quiet_hours_start: string | null;
  quiet_hours_end: string | null;
  daily_cap: number;
  is_active: boolean;
}

const emptyForm = {
  phone_e164: "+90",
  display_name: "",
  role: "manager",
  min_rating_threshold: 3,
  quiet_hours_start: "23:00",
  quiet_hours_end: "08:00",
  daily_cap: 20,
  is_active: true,
};

const E164 = /^\+[1-9]\d{7,14}$/;

export function WhatsAppRecipientsCard() {
  const { activeBusiness } = useBusiness();
  const [rows, setRows] = useState<Recipient[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState({ ...emptyForm });

  const load = async () => {
    if (!activeBusiness) { setRows([]); setLoading(false); return; }
    setLoading(true);
    const { data, error } = await supabase
      .from("wa_recipients")
      .select("id, phone_e164, display_name, role, min_rating_threshold, quiet_hours_start, quiet_hours_end, daily_cap, is_active")
      .eq("business_id", activeBusiness.id)
      .order("created_at", { ascending: true });
    if (error) toast({ title: "Hata", description: "Alıcılar yüklenemedi.", variant: "destructive" });
    setRows((data as Recipient[]) || []);
    setLoading(false);
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [activeBusiness?.id]);

  const openNew = () => {
    setEditingId(null);
    setForm({ ...emptyForm });
    setOpen(true);
  };

  const openEdit = (r: Recipient) => {
    setEditingId(r.id);
    setForm({
      phone_e164: r.phone_e164,
      display_name: r.display_name ?? "",
      role: r.role ?? "manager",
      min_rating_threshold: r.min_rating_threshold ?? 3,
      quiet_hours_start: (r.quiet_hours_start ?? "23:00").slice(0, 5),
      quiet_hours_end: (r.quiet_hours_end ?? "08:00").slice(0, 5),
      daily_cap: r.daily_cap ?? 20,
      is_active: r.is_active,
    });
    setOpen(true);
  };

  const save = async () => {
    if (!activeBusiness) return;
    const phone = form.phone_e164.replace(/[\s()-]/g, "");
    if (!E164.test(phone)) {
      toast({
        title: "Geçersiz telefon",
        description: "Numarayı uluslararası formatta girin. Örn: +905551112233",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    const payload = {
      business_id: activeBusiness.id,
      phone_e164: phone,
      display_name: form.display_name.trim() || null,
      role: form.role || null,
      min_rating_threshold: Number(form.min_rating_threshold),
      quiet_hours_start: form.quiet_hours_start || null,
      quiet_hours_end: form.quiet_hours_end || null,
      daily_cap: Number(form.daily_cap),
      is_active: form.is_active,
    };

    const { error } = editingId
      ? await supabase.from("wa_recipients").update(payload).eq("id", editingId)
      : await supabase.from("wa_recipients").insert(payload);

    setSaving(false);
    if (error) {
      toast({
        title: "Kaydedilemedi",
        description: error.message.includes("duplicate")
          ? "Bu numara bu işletmeye zaten ekli."
          : error.message,
        variant: "destructive",
      });
      return;
    }
    toast({ title: editingId ? "Güncellendi" : "Alıcı eklendi" });
    setOpen(false);
    load();
  };

  const remove = async () => {
    if (!deleteId) return;
    const { error } = await supabase.from("wa_recipients").delete().eq("id", deleteId);
    setDeleteId(null);
    if (error) {
      toast({ title: "Hata", description: "Silinemedi.", variant: "destructive" });
      return;
    }
    toast({ title: "Alıcı silindi" });
    load();
  };

  const toggleActive = async (r: Recipient, value: boolean) => {
    setRows((prev) => prev.map((x) => (x.id === r.id ? { ...x, is_active: value } : x)));
    const { error } = await supabase.from("wa_recipients").update({ is_active: value }).eq("id", r.id);
    if (error) { toast({ title: "Hata", description: "Güncellenemedi.", variant: "destructive" }); load(); }
  };

  return (
    <Card className="shadow-card">
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              WhatsApp Bildirimleri
            </CardTitle>
            <CardDescription>
              Yeni yorum geldiğinde WhatsApp'tan haber verilecek kişileri yönetin.
              {activeBusiness && (
                <span className="block mt-1 font-medium text-foreground">
                  İşletme: {activeBusiness.name}
                </span>
              )}
            </CardDescription>
          </div>
          <Button onClick={openNew} disabled={!activeBusiness}>
            <Plus className="mr-2 h-4 w-4" />
            Alıcı Ekle
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {loading ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground py-6">
            <Loader2 className="h-4 w-4 animate-spin" /> Yükleniyor...
          </div>
        ) : rows.length === 0 ? (
          <div className="p-4 rounded-lg border border-border bg-muted/30 text-sm text-muted-foreground">
            Henüz alıcı eklenmedi. Bildirim almak isteyen yöneticinin WhatsApp numarasını ekleyin.
          </div>
        ) : (
          rows.map((r) => (
            <div key={r.id} className="flex items-center gap-4 p-4 rounded-lg border border-border bg-muted/10">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-medium text-foreground">{r.display_name || r.phone_e164}</p>
                  {r.role && <Badge variant="secondary">{r.role}</Badge>}
                  {!r.is_active && <Badge variant="outline">Pasif</Badge>}
                </div>
                <p className="text-sm text-muted-foreground mt-0.5">{r.phone_e164}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {r.min_rating_threshold} yıldız ve altı · günlük en fazla {r.daily_cap} mesaj
                  {r.quiet_hours_start && r.quiet_hours_end
                    ? ` · sessiz saat ${r.quiet_hours_start.slice(0, 5)}–${r.quiet_hours_end.slice(0, 5)}`
                    : ""}
                </p>
              </div>
              <Switch checked={r.is_active} onCheckedChange={(v) => toggleActive(r, v)} />
              <Button variant="ghost" size="icon" onClick={() => openEdit(r)}>
                <Pencil className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => setDeleteId(r.id)}>
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          ))
        )}

        <div className="mt-2 p-4 rounded-lg bg-muted/30 border border-border">
          <p className="text-sm text-muted-foreground">
            <strong>Not:</strong> WhatsApp şablonumuz şu anda onay sürecinde. Onay tamamlanınca
            buradaki alıcılara bildirim ve hazır cevap taslağı gönderimi otomatik başlayacak.
          </p>
        </div>
      </CardContent>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingId ? "Alıcıyı Düzenle" : "Yeni Alıcı"}</DialogTitle>
            <DialogDescription>Bildirim tercihlerini kişiye özel ayarlayın.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="wa-phone">Telefon (WhatsApp)</Label>
              <Input
                id="wa-phone"
                placeholder="+905551112233"
                value={form.phone_e164}
                onChange={(e) => setForm({ ...form, phone_e164: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">Ülke kodu ile birlikte girin. Örn: +905551112233</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="wa-name">Görünen Ad</Label>
                <Input
                  id="wa-name"
                  placeholder="Ahmet Yılmaz"
                  value={form.display_name}
                  onChange={(e) => setForm({ ...form, display_name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="wa-role">Rol</Label>
                <Input
                  id="wa-role"
                  placeholder="Genel Müdür"
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="wa-threshold">Puan Eşiği</Label>
                <Input
                  id="wa-threshold"
                  type="number"
                  min={1}
                  max={5}
                  value={form.min_rating_threshold}
                  onChange={(e) => setForm({ ...form, min_rating_threshold: Number(e.target.value) })}
                />
                <p className="text-xs text-muted-foreground">Bu puan ve altındaki yorumlarda bildirim gider.</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="wa-cap">Günlük Tavan</Label>
                <Input
                  id="wa-cap"
                  type="number"
                  min={1}
                  max={200}
                  value={form.daily_cap}
                  onChange={(e) => setForm({ ...form, daily_cap: Number(e.target.value) })}
                />
                <p className="text-xs text-muted-foreground">Günde gönderilecek en fazla mesaj sayısı.</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="wa-qs">Sessiz Saat Başlangıcı</Label>
                <Input
                  id="wa-qs"
                  type="time"
                  value={form.quiet_hours_start}
                  onChange={(e) => setForm({ ...form, quiet_hours_start: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="wa-qe">Sessiz Saat Bitişi</Label>
                <Input
                  id="wa-qe"
                  type="time"
                  value={form.quiet_hours_end}
                  onChange={(e) => setForm({ ...form, quiet_hours_end: e.target.value })}
                />
              </div>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg border border-border">
              <div>
                <p className="text-sm font-medium">Aktif</p>
                <p className="text-xs text-muted-foreground">Kapalıyken bu kişiye bildirim gitmez.</p>
              </div>
              <Switch
                checked={form.is_active}
                onCheckedChange={(v) => setForm({ ...form, is_active: v })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>İptal</Button>
            <Button onClick={save} disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Kaydet
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Alıcı silinsin mi?</AlertDialogTitle>
            <AlertDialogDescription>
              Bu kişiye artık WhatsApp bildirimi gönderilmeyecek.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>İptal</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={remove}
            >
              Sil
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
