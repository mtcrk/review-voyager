import { useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useBusiness } from "@/contexts/BusinessContext";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, Upload, Wand2 } from "lucide-react";
import { invokeAuthedFunction } from "@/lib/invokeAuthedFunction";
import { PriceCredits } from "@/components/price/PriceCredits";
import { BOARD_LABELS, COMPARABLE_BOARDS, type BoardType, fmtTry, isoDay, parseBoard } from "@/lib/priceTracking";

type Src = "etstur" | "jollytur" | "tatilsepeti" | "booking" | "serpapi";
const SRC: { id: Src; label: string; nameCol: string; idCols: string[]; host?: string; parse?: (u: string) => Record<string, unknown> | null }[] = [
  { id: "etstur", label: "ETS Tur", nameCol: "etstur_matched_name", idCols: ["etstur_hotel_id", "etstur_slug"], host: "etstur.com",
    parse: (u) => { const m = u.match(/^https:\/\/(?:www\.)?etstur\.com\/([^/?#]+)/); return m ? { etstur_slug: m[1], etstur_hotel_id: null, etstur_matched_name: null, etstur_checked_at: null } : null; } },
  { id: "jollytur", label: "Jolly Tur", nameCol: "jollytur_matched_name", idCols: ["jollytur_hotel_id", "jollytur_slug"], host: "jollytur.com",
    parse: (u) => { const m = u.match(/^https:\/\/(?:www\.)?jollytur\.com\/([^/?#]+)/); return m ? { jollytur_slug: m[1], jollytur_hotel_id: null, jollytur_matched_name: null, jollytur_checked_at: null } : null; } },
  { id: "tatilsepeti", label: "Tatil Sepeti", nameCol: "tatilsepeti_matched_name", idCols: ["tatilsepeti_slug"], host: "tatilsepeti.com",
    parse: (u) => { const m = u.match(/^https:\/\/(?:www\.)?tatilsepeti\.com\/([^/?#]+)/); return m ? { tatilsepeti_slug: m[1], tatilsepeti_matched_name: null, tatilsepeti_checked_at: null } : null; } },
  { id: "booking", label: "Booking", nameCol: "booking_matched_name", idCols: ["booking_url"], host: "booking.com",
    parse: (u) => /^https:\/\/(www\.)?booking\.com\/hotel\//.test(u) ? { booking_url: u.split("?")[0], booking_matched_name: null, price_source_preference: null, price_source_checked_at: null } : null },
  { id: "serpapi", label: "Google Hotels", nameCol: "serpapi_matched_name", idCols: ["serpapi_property_token"] },
];

function statusOf(row: any, s: (typeof SRC)[number]) {
  if (row?.[`${s.id}_match_source`] === "manual" && s.idCols.some((c) => row?.[c])) return "manual";
  if (row?.[`${s.id}_match_status`] === "pending") return "pending";
  if (s.idCols.some((c) => row?.[c])) return "matched";
  return "none";
}
const BADGE: Record<string, { t: string; v: "default" | "secondary" | "outline" | "destructive" }> = {
  matched: { t: "✓ eşleşti", v: "default" }, pending: { t: "⏳ onay bekliyor", v: "secondary" }, none: { t: "— bulunamadı", v: "outline" }, manual: { t: "✎ elle", v: "secondary" },
};

function SourceRow({ row, s, onSave }: { row: any; s: (typeof SRC)[number]; onSave: (p: Record<string, unknown>) => Promise<void> }) {
  const [v, setV] = useState("");
  const [open, setOpen] = useState(false);
  const st = statusOf(row, s);
  const cand = row?.[`${s.id}_match_candidate`];
  const name = st === "pending" ? cand?.[s.nameCol] : row?.[s.nameCol];
  const reason = row?.[`${s.id}_match_reason`];
  return (
    <div className="space-y-1 border-t pt-2 first:border-t-0 first:pt-0">
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className="w-24 font-medium">{s.label}</span>
        <Badge variant={BADGE[st].v} className="text-[10px]">{BADGE[st].t}</Badge>
        <span className="flex-1 truncate text-foreground">{name ?? (st === "none" ? "" : "adres girildi")}</span>
        {st === "pending" && (
          <>
            <span className="text-muted-foreground">Bu otel mi?</span>
            <Button size="sm" variant="outline" className="h-7 px-2" onClick={() => onSave({ ...cand, [`${s.id}_match_status`]: "matched", [`${s.id}_match_source`]: "manual", [`${s.id}_match_confidence`]: 1, [`${s.id}_match_candidate`]: null })}>✓</Button>
            <Button size="sm" variant="outline" className="h-7 px-2" onClick={() => onSave({ [`${s.id}_match_status`]: "not_found", [`${s.id}_match_source`]: "manual", [`${s.id}_match_candidate`]: null, [`${s.id}_match_reason`]: "kullanıcı reddetti" })}>✗</Button>
          </>
        )}
        {(st === "matched" || st === "manual") && (
          <Button size="sm" variant="ghost" className="h-7 px-2" onClick={() => onSave({ ...Object.fromEntries([s.nameCol, ...s.idCols].map((c) => [c, null])), [`${s.id}_match_status`]: "not_found", [`${s.id}_match_source`]: "manual", [`${s.id}_match_reason`]: "kullanıcı yanlış dedi" })}>Yanlış</Button>
        )}
        {s.parse && <Button size="sm" variant="ghost" className="h-7 px-2" onClick={() => setOpen(!open)}>Adres gir</Button>}
      </div>
      {reason && <p className="truncate text-[11px] text-muted-foreground" title={reason}>{reason}</p>}
      {open && s.parse && (
        <div className="flex flex-col gap-2 sm:flex-row">
          <Input value={v} onChange={(e) => setV(e.target.value)} placeholder={`https://www.${s.host}/...`} className="h-8" />
          <Button size="sm" variant="outline" onClick={async () => {
            const p = s.parse!(v.trim());
            if (!p) return void toast({ title: `Geçersiz ${s.label} adresi`, variant: "destructive" });
            await onSave({ ...p, [`${s.id}_match_status`]: "matched", [`${s.id}_match_source`]: "manual", [`${s.id}_match_confidence`]: 1, [`${s.id}_match_candidate`]: null, [`${s.id}_match_reason`]: "elle girildi" });
            setOpen(false);
          }}>Kaydet</Button>
        </div>
      )}
    </div>
  );
}

function MatchEditor({ label, row, onSave }: { label: string; row: any; onSave: (patch: Record<string, unknown>) => Promise<void> }) {
  return (
    <div className="space-y-2 rounded-lg border p-3 text-sm">
      <div className="font-medium">{label}</div>
      {SRC.map((s) => <SourceRow key={s.id} row={row} s={s} onSave={onSave} />)}
    </div>
  );
}

export function PriceTrackingSettings() {
  const { activeBusiness, refetchBusinesses } = useBusiness();
  const { user } = useAuth();
  const biz = activeBusiness as any;
  const qc = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState({ date: isoDay(1), board: (biz?.price_compare_board_type ?? "breakfast") as BoardType, room: "", price: "", refundable: "unknown", note: "" });

  const { data: comps = [], refetch: refetchComps } = useQuery({
    queryKey: ["pt-settings-comps", biz?.id],
    enabled: !!biz?.id,
    queryFn: async () => {
      const { data } = await (supabase as any)
        .from("ci_competitors")
        .select("*")
        .eq("business_id", biz.id)
        .eq("is_active", true)
        .order("name");
      return data ?? [];
    },
  });

  const { data: rates = [], refetch: refetchRates } = useQuery({
    queryKey: ["pt-settings-rates", biz?.id],
    enabled: !!biz?.id,
    queryFn: async () => {
      const { data } = await (supabase as any)
        .from("own_rate_entries")
        .select("*")
        .eq("business_id", biz.id)
        .gte("date", isoDay(0))
        .order("date")
        .limit(200);
      return data ?? [];
    },
  });

  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);
  const [summary, setSummary] = useState<string | null>(null);

  if (!biz) return null;

  const autoMatch = async () => {
    const subjects = ["own", ...comps.map((c: any) => c.id)];
    const n = { matched: 0, pending: 0, not_found: 0 };
    setSummary(null);
    for (let i = 0; i < subjects.length; i++) {
      setProgress({ done: i, total: subjects.length });
      try {
        const r: any = await invokeAuthedFunction("match-hotels", { body: { business_id: biz.id, subject: subjects[i], force: true, background: false } });
        for (const res of r?.results ?? []) for (const o of res.outcomes ?? []) if (o.status in n) (n as any)[o.status]++;
      } catch (e: any) {
        toast({ title: "Eşleştirme hatası", description: e?.message, variant: "destructive" });
      }
    }
    setProgress(null);
    await Promise.all([refetchBusinesses(), refetchComps()]);
    setSummary(`${n.matched} eşleşme, ${n.pending} onay bekliyor, ${n.not_found} bulunamadı`);
  };

  const saveBiz = async (patch: Record<string, unknown>) => {
    const { error } = await (supabase as any).from("businesses").update(patch).eq("id", biz.id);
    if (error) return void toast({ title: "Kaydedilemedi", description: error.message, variant: "destructive" });
    await refetchBusinesses();
    toast({ title: "Kaydedildi" });
  };
  const saveComp = (id: string) => async (patch: Record<string, unknown>) => {
    const { error } = await (supabase as any).from("ci_competitors").update(patch).eq("id", id);
    if (error) return void toast({ title: "Kaydedilemedi", description: error.message, variant: "destructive" });
    await refetchComps();
    toast({ title: "Kaydedildi" });
  };

  const upsertRates = async (rows: any[]) => {
    const { error } = await (supabase as any).from("own_rate_entries").upsert(rows, { onConflict: "business_id,date,board_type,room_name" });
    if (error) {
      // unique index ifade içerdiği için onConflict eşleşmeyebilir → tek tek ekle
      for (const r of rows) {
        await (supabase as any).from("own_rate_entries").delete()
          .eq("business_id", r.business_id).eq("date", r.date).eq("board_type", r.board_type);
      }
      const { error: e2 } = await (supabase as any).from("own_rate_entries").insert(rows);
      if (e2) throw e2;
    }
    await refetchRates();
    qc.invalidateQueries({ queryKey: ["pt-own-rates"] });
  };

  const addRate = async () => {
    const price = Number(form.price.replace(",", "."));
    if (!/^\d{4}-\d{2}-\d{2}$/.test(form.date) || !(price > 0)) {
      return void toast({ title: "Tarih ve geçerli bir fiyat gir", variant: "destructive" });
    }
    try {
      await upsertRates([{
        business_id: biz.id,
        date: form.date,
        board_type: form.board,
        room_name: form.room.trim() || null,
        price_per_night: price,
        refundable: form.refundable === "unknown" ? null : form.refundable === "yes",
        note: form.note.trim() || null,
        created_by: user?.id,
      }]);
      setForm((f) => ({ ...f, price: "", note: "" }));
      toast({ title: "Fiyat eklendi" });
    } catch (e: any) {
      toast({ title: "Eklenemedi", description: e?.message, variant: "destructive" });
    }
  };

  const importCsv = async (file: File) => {
    const text = await file.text();
    const rows: any[] = [];
    const errors: number[] = [];
    text.split(/\r?\n/).forEach((line, i) => {
      if (!line.trim()) return;
      const [d, b, p] = line.split(/[;,\t]/).map((x) => x.trim().replace(/^"|"$/g, ""));
      if (i === 0 && !/^\d/.test(d)) return; // başlık
      let date = d;
      const m = d.match(/^(\d{1,2})[./](\d{1,2})[./](\d{4})$/);
      if (m) date = `${m[3]}-${m[2].padStart(2, "0")}-${m[1].padStart(2, "0")}`;
      const board = parseBoard(b ?? "");
      const price = Number(String(p ?? "").replace(/\./g, "").replace(",", "."));
      if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !board || !(price > 0)) return void errors.push(i + 1);
      rows.push({ business_id: biz.id, date, board_type: board, room_name: null, price_per_night: price, created_by: user?.id });
    });
    if (!rows.length) return void toast({ title: "CSV'de geçerli satır yok", description: "Biçim: tarih, pansiyon tipi, fiyat", variant: "destructive" });
    try {
      await upsertRates(rows);
      toast({ title: `${rows.length} fiyat içe aktarıldı`, description: errors.length ? `Atlanan satırlar: ${errors.slice(0, 10).join(", ")}` : undefined });
    } catch (e: any) {
      toast({ title: "İçe aktarılamadı", description: e?.message, variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6">
      {biz?.id && <PriceCredits businessId={biz.id} />}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Fiyat Takibi</CardTitle>
          <CardDescription>Açıkken her sabah 06:00'da önümüzdeki 14 günün fiyatları çekilir; 15–60 gün pazartesileri güncellenir.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <Label htmlFor="pt-enabled">Günlük takip</Label>
            <Switch id="pt-enabled" checked={!!biz.price_tracking_enabled} onCheckedChange={(v) => saveBiz({ price_tracking_enabled: v })} />
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <Label>Kıyas pansiyon tipi</Label>
            <Select value={biz.price_compare_board_type ?? "breakfast"} onValueChange={(v) => saveBiz({ price_compare_board_type: v })}>
              <SelectTrigger className="w-full sm:w-48"><SelectValue /></SelectTrigger>
              <SelectContent>{COMPARABLE_BOARDS.map((b) => <SelectItem key={b} value={b}>{BOARD_LABELS[b]}</SelectItem>)}</SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Otel eşleşmeleri</CardTitle>
          <CardDescription>Eşleşen otel adı yanlışsa düzelt; bir sonraki çekimde yeniden eşleştirilir.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap items-center gap-3">
            <Button size="sm" onClick={autoMatch} disabled={!!progress}>
              <Wand2 className="mr-1 h-4 w-4" />{progress ? `Aranıyor… ${progress.done}/${progress.total}` : "Eşleşmeleri otomatik bul"}
            </Button>
            {summary && <span className="text-xs text-muted-foreground">{summary}</span>}
          </div>
          <MatchEditor label={`${biz.name} (otelimiz)`} row={biz} onSave={saveBiz} />
          {comps.map((c: any) => (
            <MatchEditor key={c.id} label={c.name} row={c} onSave={saveComp(c.id)} />
          ))}
          {!comps.length && <p className="text-sm text-muted-foreground">Henüz rakip eklenmemiş.</p>}
        </CardContent>
      </Card>

      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Kendi fiyatlarımız</CardTitle>
          <CardDescription>Girdiğin fiyat, o gün için internetten bulunan fiyatın önüne geçer.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2 sm:grid-cols-3 lg:grid-cols-6">
            <Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
            <Select value={form.board} onValueChange={(v) => setForm({ ...form, board: v as BoardType })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{COMPARABLE_BOARDS.map((b) => <SelectItem key={b} value={b}>{BOARD_LABELS[b]}</SelectItem>)}</SelectContent>
            </Select>
            <Input placeholder="Oda (opsiyonel)" value={form.room} onChange={(e) => setForm({ ...form, room: e.target.value })} />
            <Input placeholder="Gecelik fiyat (TL)" inputMode="decimal" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
            <Select value={form.refundable} onValueChange={(v) => setForm({ ...form, refundable: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="unknown">İade: belirtme</SelectItem>
                <SelectItem value="yes">İade edilebilir</SelectItem>
                <SelectItem value="no">İade edilemez</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={addRate}>Ekle</Button>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <input ref={fileRef} type="file" accept=".csv,text/csv" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) importCsv(f); e.target.value = ""; }} />
            <Button variant="outline" size="sm" onClick={() => fileRef.current?.click()}><Upload className="mr-1 h-4 w-4" />CSV içe aktar</Button>
            <span className="text-xs text-muted-foreground">Biçim: tarih, pansiyon tipi, fiyat — ör. 2026-10-15, her şey dahil, 8500</span>
          </div>
          <div className="max-h-72 divide-y overflow-auto rounded-lg border text-sm">
            {rates.map((r: any) => (
              <div key={r.id} className="flex items-center justify-between gap-2 px-3 py-2">
                <span className="tabular-nums">{r.date}</span>
                <Badge variant="secondary" className="text-[10px]">{BOARD_LABELS[r.board_type as BoardType]}</Badge>
                <span className="flex-1 truncate text-muted-foreground">{r.room_name ?? ""}</span>
                <span className="font-medium tabular-nums">{fmtTry(Number(r.price_per_night))}</span>
                <Button size="icon" variant="ghost" className="h-7 w-7" onClick={async () => {
                  await (supabase as any).from("own_rate_entries").delete().eq("id", r.id);
                  refetchRates();
                  qc.invalidateQueries({ queryKey: ["pt-own-rates"] });
                }}><Trash2 className="h-4 w-4" /></Button>
              </div>
            ))}
            {!rates.length && <p className="px-3 py-4 text-center text-xs text-muted-foreground">Henüz girilmiş fiyat yok.</p>}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
