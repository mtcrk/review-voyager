import { useState } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { KeyRound } from "lucide-react";

const passwordSchema = z
  .object({
    newPassword: z
      .string()
      .min(8, { message: "Şifre en az 8 karakter olmalı" })
      .max(72, { message: "Şifre en fazla 72 karakter olabilir" }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Şifreler eşleşmiyor",
    path: ["confirmPassword"],
  });

export function PasswordChangeCard() {
  const { toast } = useToast();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);

  const handleChangePassword = async () => {
    const result = passwordSchema.safeParse({ newPassword, confirmPassword });
    if (!result.success) {
      toast({
        title: "Geçersiz şifre",
        description: result.error.issues[0]?.message ?? "Lütfen kontrol edin",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) {
        toast({
          title: "Şifre güncellenemedi",
          description: error.message,
          variant: "destructive",
        });
        return;
      }
      toast({
        title: "Şifre güncellendi",
        description: "Yeni şifren ile giriş yapabilirsin.",
      });
      setNewPassword("");
      setConfirmPassword("");
    } catch {
      toast({
        title: "Bir hata oluştu",
        description: "Lütfen tekrar dene.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <KeyRound className="h-5 w-5" />
          Şifre Değiştir
        </CardTitle>
        <CardDescription>Hesap şifrenizi güvenli bir şekilde güncelleyin</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="newPassword">Yeni Şifre</Label>
          <Input
            id="newPassword"
            type="password"
            placeholder="En az 8 karakter"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            disabled={saving}
            autoComplete="new-password"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Yeni Şifre (Tekrar)</Label>
          <Input
            id="confirmPassword"
            type="password"
            placeholder="Şifreni tekrar gir"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            disabled={saving}
            autoComplete="new-password"
          />
        </div>
        <Button onClick={handleChangePassword} disabled={saving || !newPassword || !confirmPassword}>
          {saving ? "Güncelleniyor..." : "Şifreyi Güncelle"}
        </Button>
      </CardContent>
    </Card>
  );
}
