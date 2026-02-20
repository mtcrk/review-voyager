import { useState, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { useBusiness } from "@/contexts/BusinessContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";
import { Plus, Upload, Trash2, Users } from "lucide-react";

export function ContactsTab() {
  const { activeBusiness } = useBusiness();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [newEmail, setNewEmail] = useState("");
  const [newName, setNewName] = useState("");

  const { data: contacts = [], isLoading } = useQuery({
    queryKey: ["customer-contacts", activeBusiness?.id],
    queryFn: async () => {
      if (!activeBusiness) return [];
      const { data, error } = await supabase
        .from("customer_contacts")
        .select("*")
        .eq("business_id", activeBusiness.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!activeBusiness,
  });

  const addContact = useMutation({
    mutationFn: async () => {
      if (!activeBusiness || !newEmail.trim()) throw new Error("Email gerekli");
      const { error } = await supabase.from("customer_contacts").insert({
        business_id: activeBusiness.id,
        email: newEmail.trim().toLowerCase(),
        name: newName.trim() || null,
        source: "manual",
      });
      if (error) {
        if (error.code === "23505") throw new Error("Bu email zaten ekli");
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customer-contacts"] });
      setNewEmail("");
      setNewName("");
      toast({ title: "Başarılı", description: "Müşteri eklendi" });
    },
    onError: (err) => {
      toast({ title: "Hata", description: err.message, variant: "destructive" });
    },
  });

  const deleteContact = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("customer_contacts").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customer-contacts"] });
      toast({ title: "Silindi" });
    },
  });

  const handleCSVUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeBusiness) return;

    const text = await file.text();
    const lines = text.split("\n").filter((l) => l.trim());
    const contacts: { business_id: string; email: string; name: string | null; source: string }[] = [];

    // Skip header if present
    const startIdx = lines[0]?.toLowerCase().includes("email") ? 1 : 0;

    for (let i = startIdx; i < lines.length; i++) {
      const parts = lines[i].split(",").map((p) => p.trim().replace(/"/g, ""));
      const email = parts.find((p) => p.includes("@"));
      if (email) {
        const name = parts.find((p) => !p.includes("@") && p.length > 0) || null;
        contacts.push({
          business_id: activeBusiness.id,
          email: email.toLowerCase(),
          name,
          source: "csv",
        });
      }
    }

    if (contacts.length === 0) {
      toast({ title: "Hata", description: "CSV'de geçerli email bulunamadı", variant: "destructive" });
      return;
    }

    const { error } = await supabase.from("customer_contacts").upsert(contacts, {
      onConflict: "business_id,email",
      ignoreDuplicates: true,
    });

    if (error) {
      toast({ title: "Hata", description: error.message, variant: "destructive" });
    } else {
      queryClient.invalidateQueries({ queryKey: ["customer-contacts"] });
      toast({ title: "Başarılı", description: `${contacts.length} müşteri içe aktarıldı` });
    }

    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const subscribedCount = contacts.filter((c) => c.subscribed).length;

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="text-3xl font-bold text-foreground">{contacts.length}</div>
            <div className="text-sm text-muted-foreground mt-1">Toplam Müşteri</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="text-3xl font-bold text-green-600">{subscribedCount}</div>
            <div className="text-sm text-muted-foreground mt-1">Aktif Aboneler</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="text-3xl font-bold text-muted-foreground">{contacts.length - subscribedCount}</div>
            <div className="text-sm text-muted-foreground mt-1">Abonelikten Çıkan</div>
          </CardContent>
        </Card>
      </div>

      {/* Add Contact */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Müşteri Ekle</CardTitle>
          <CardDescription>Manuel olarak veya CSV dosyasından müşteri ekleyin</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3 items-end">
            <div className="flex-1 space-y-1">
              <Label htmlFor="contactEmail">Email</Label>
              <Input
                id="contactEmail"
                type="email"
                placeholder="musteri@ornek.com"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
              />
            </div>
            <div className="flex-1 space-y-1">
              <Label htmlFor="contactName">İsim (opsiyonel)</Label>
              <Input
                id="contactName"
                placeholder="Ahmet Yılmaz"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
              />
            </div>
            <Button onClick={() => addContact.mutate()} disabled={!newEmail.trim() || addContact.isPending}>
              <Plus className="h-4 w-4 mr-1" /> Ekle
            </Button>
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                className="hidden"
                onChange={handleCSVUpload}
              />
              <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
                <Upload className="h-4 w-4 mr-1" /> CSV Yükle
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contact List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Users className="h-5 w-5" />
            Müşteri Listesi
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-muted-foreground text-sm">Yükleniyor...</p>
          ) : contacts.length === 0 ? (
            <p className="text-muted-foreground text-sm text-center py-8">
              Henüz müşteri eklenmemiş. Yukarıdan manuel ekleyin veya CSV yükleyin.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>İsim</TableHead>
                  <TableHead>Kaynak</TableHead>
                  <TableHead>Durum</TableHead>
                  <TableHead className="w-10"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {contacts.map((contact) => (
                  <TableRow key={contact.id}>
                    <TableCell className="font-medium">{contact.email}</TableCell>
                    <TableCell>{contact.name || "—"}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="text-xs">
                        {contact.source === "manual" ? "Manuel" : contact.source === "csv" ? "CSV" : "Yorum"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={contact.subscribed ? "default" : "secondary"} className="text-xs">
                        {contact.subscribed ? "Aktif" : "Çıktı"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteContact.mutate(contact.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
