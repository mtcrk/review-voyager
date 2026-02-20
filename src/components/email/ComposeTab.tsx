import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { useBusiness } from "@/contexts/BusinessContext";
import { useQuery } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";
import { Send, Sparkles } from "lucide-react";

const TEMPLATES = {
  review_thanks: {
    subject: "Yorumunuz için teşekkürler! 🙏",
    body: `Merhaba {{name}},\n\nDeğerli yorumunuz için çok teşekkür ederiz. Geri bildiriminiz bizim için son derece önemli.\n\nSizi tekrar ağırlamaktan mutluluk duyarız!\n\nSaygılarımızla,\n{{business_name}}`,
  },
  review_invite: {
    subject: "Deneyiminizi paylaşır mısınız? ⭐",
    body: `Merhaba {{name}},\n\nSon ziyaretinizden memnun kaldığınızı umuyoruz! Google'da bize yorum bırakarak deneyiminizi paylaşabilirsiniz.\n\n{{review_link}}\n\nYorumunuz, diğer müşterilerimize de yol gösterecektir.\n\nTeşekkürler,\n{{business_name}}`,
  },
  promo: {
    subject: "Size özel kampanya! 🎉",
    body: `Merhaba {{name}},\n\nDeğerli müşterimiz olarak size özel bir teklifimiz var!\n\n[Kampanya detaylarınızı buraya yazın]\n\nFırsatı kaçırmayın!\n\nSaygılarımızla,\n{{business_name}}`,
  },
  custom: {
    subject: "",
    body: "",
  },
};

export function ComposeTab() {
  const { activeBusiness } = useBusiness();
  const [templateType, setTemplateType] = useState<string>("custom");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [replyTo, setReplyTo] = useState("");
  const [sending, setSending] = useState(false);
  const [selectAll, setSelectAll] = useState(true);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const { data: contacts = [] } = useQuery({
    queryKey: ["customer-contacts", activeBusiness?.id],
    queryFn: async () => {
      if (!activeBusiness) return [];
      const { data, error } = await supabase
        .from("customer_contacts")
        .select("*")
        .eq("business_id", activeBusiness.id)
        .eq("subscribed", true)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!activeBusiness,
  });

  const handleTemplateChange = (type: string) => {
    setTemplateType(type);
    const tmpl = TEMPLATES[type as keyof typeof TEMPLATES];
    if (tmpl) {
      setSubject(tmpl.subject);
      setBody(tmpl.body);
    }
  };

  const getRecipients = () => {
    if (selectAll) return contacts;
    return contacts.filter((c) => selectedIds.has(c.id));
  };

  const toggleContact = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
    setSelectAll(false);
  };

  const processTemplate = (text: string, contact: { name?: string | null }) => {
    return text
      .replace(/\{\{name\}\}/g, contact.name || "Değerli Müşterimiz")
      .replace(/\{\{business_name\}\}/g, activeBusiness?.name || "")
      .replace(/\{\{review_link\}\}/g, activeBusiness?.place_id
        ? `https://search.google.com/local/writereview?placeid=${activeBusiness.place_id}`
        : "[Google Yorum Linki]");
  };

  const bodyToHtml = (text: string) => {
    return text
      .split("\n")
      .map((line) => (line.trim() === "" ? "<br>" : `<p style="margin:0 0 12px 0;color:#374151;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;font-size:15px;line-height:1.6;">${line}</p>`))
      .join("");
  };

  const handleSend = async () => {
    if (!activeBusiness) return;
    const recipients = getRecipients();
    if (recipients.length === 0) {
      toast({ title: "Hata", description: "En az bir alıcı seçin", variant: "destructive" });
      return;
    }
    if (!subject.trim() || !body.trim()) {
      toast({ title: "Hata", description: "Konu ve içerik gerekli", variant: "destructive" });
      return;
    }

    setSending(true);
    try {
      // Create campaign
      const { data: campaign, error: campError } = await supabase
        .from("email_campaigns")
        .insert({
          business_id: activeBusiness.id,
          subject,
          body_html: bodyToHtml(body),
          template_type: templateType,
          recipient_count: recipients.length,
        })
        .select("id")
        .single();

      if (campError) throw campError;

      // Send emails via edge function
      const recipientsList = recipients.map((c) => ({
        email: c.email,
        name: c.name,
        contact_id: c.id,
      }));

      // Process template per recipient - send batch with first contact's template as base
      const logoUrl = "https://pnpuhewfoxssmbpryart.supabase.co/storage/v1/object/public/email-assets/logo.png?v=1";
      const processedBody = bodyToHtml(processTemplate(body, recipientsList[0]));
      const processedHtml = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#f3f4f6;">
    <tr>
      <td align="center" style="padding:40px 16px;">
        <table role="presentation" width="560" cellspacing="0" cellpadding="0" border="0" style="max-width:560px;width:100%;">
          <tr>
            <td align="center" style="padding-bottom:24px;">
              <img src="${logoUrl}" alt="${activeBusiness?.name || 'VoyageRespond'}" width="40" height="40" style="display:block;border-radius:8px;" />
            </td>
          </tr>
          <tr>
            <td style="background-color:#ffffff;border-radius:12px;border:1px solid #e5e7eb;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td style="height:4px;background:linear-gradient(90deg,#7C3AED,#6366F1);border-radius:12px 12px 0 0;font-size:0;line-height:0;">&nbsp;</td>
                </tr>
                <tr>
                  <td style="padding:36px 32px;">
                    ${processedBody}
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding-top:24px;">
              <p style="margin:0;font-size:12px;color:#9ca3af;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
                ${activeBusiness?.name || ''} tarafından <a href="https://voyagerespond.com" style="color:#7C3AED;text-decoration:none;">VoyageRespond</a> ile gönderildi
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

      const { data, error } = await supabase.functions.invoke("send-customer-email", {
        body: {
          business_id: activeBusiness.id,
          campaign_id: campaign.id,
          recipients: recipientsList,
          subject: processTemplate(subject, recipientsList[0]),
          body_html: processedHtml,
          reply_to: replyTo || undefined,
        },
      });

      if (error) throw error;

      toast({
        title: "Email Gönderildi! ✉️",
        description: `${data.sentCount} email başarıyla gönderildi${data.failedCount > 0 ? `, ${data.failedCount} başarısız` : ""}`,
      });

      // Reset form
      setSubject("");
      setBody("");
      setTemplateType("custom");
    } catch (err) {
      toast({
        title: "Hata",
        description: err instanceof Error ? err.message : "Email gönderilemedi",
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Compose Area */}
      <div className="lg:col-span-2 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Email Oluştur
            </CardTitle>
            <CardDescription>Şablon seçin veya serbest email yazın</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Şablon</Label>
              <Select value={templateType} onValueChange={handleTemplateChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="custom">Serbest Email</SelectItem>
                  <SelectItem value="review_thanks">Yorum Teşekkür Maili</SelectItem>
                  <SelectItem value="review_invite">Yorum Daveti</SelectItem>
                  <SelectItem value="promo">Promosyon / Kampanya</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="subject">Konu</Label>
              <Input
                id="subject"
                placeholder="Email konusu..."
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="body">İçerik</Label>
              <Textarea
                id="body"
                placeholder="Email içeriğinizi yazın... Değişkenler: {{name}}, {{business_name}}, {{review_link}}"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={12}
                className="font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground">
                Kullanılabilir değişkenler: {"{{name}}"}, {"{{business_name}}"}, {"{{review_link}}"}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="replyTo">Yanıt Adresi (opsiyonel)</Label>
              <Input
                id="replyTo"
                type="email"
                placeholder="info@isletmeniz.com"
                value={replyTo}
                onChange={(e) => setReplyTo(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Müşteriler bu emaile yanıt verdiğinde buraya gelir
              </p>
            </div>

            <Button
              className="w-full"
              onClick={handleSend}
              disabled={sending || !subject.trim() || !body.trim() || getRecipients().length === 0}
            >
              <Send className="h-4 w-4 mr-2" />
              {sending ? "Gönderiliyor..." : `${getRecipients().length} kişiye gönder`}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Recipient Selector */}
      <div>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Alıcılar</CardTitle>
            <CardDescription>{getRecipients().length} müşteri seçili</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b">
              <Checkbox
                id="selectAll"
                checked={selectAll}
                onCheckedChange={(v) => {
                  setSelectAll(!!v);
                  if (v) setSelectedIds(new Set());
                }}
              />
              <Label htmlFor="selectAll" className="text-sm font-medium">
                Tümünü seç ({contacts.length})
              </Label>
            </div>
            <div className="max-h-[400px] overflow-y-auto space-y-2">
              {contacts.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Henüz müşteri yok. Müşteri Listesi sekmesinden ekleyin.
                </p>
              ) : (
                contacts.map((c) => (
                  <div key={c.id} className="flex items-center gap-2">
                    <Checkbox
                      checked={selectAll || selectedIds.has(c.id)}
                      onCheckedChange={() => toggleContact(c.id)}
                    />
                    <div className="truncate text-sm">
                      <span className="font-medium">{c.name || c.email}</span>
                      {c.name && (
                        <span className="text-muted-foreground ml-1 text-xs">{c.email}</span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
