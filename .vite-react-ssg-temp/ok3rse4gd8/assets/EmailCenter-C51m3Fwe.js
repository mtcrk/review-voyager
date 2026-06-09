import { jsxs, jsx } from "react/jsx-runtime";
import { useRef, useState } from "react";
import { T as Tabs, a as TabsList, b as TabsTrigger, c as TabsContent } from "./tabs-C8D1i09v.js";
import { C as Card, c as CardContent, a as CardHeader, e as CardTitle, b as CardDescription } from "./card-vx9BCW0t.js";
import { a as useBusiness, s as supabase, t as toast, I as Input, B as Button, m as Badge } from "../main.mjs";
import { L as Label } from "./label-Dr59vwVb.js";
import { T as Table, a as TableHeader, b as TableRow, c as TableHead, d as TableBody, e as TableCell } from "./table-Ni8R8e0b.js";
import { useQueryClient, useQuery, useMutation } from "@tanstack/react-query";
import { Plus, Upload, Users, Trash2, Sparkles, Send, History, Mail } from "lucide-react";
import { T as Textarea } from "./textarea-BbAnJDWe.js";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-1zED13tY.js";
import { C as Checkbox } from "./checkbox-JmtvmXQr.js";
import "@radix-ui/react-tabs";
import "vite-react-ssg";
import "react-router-dom";
import "@radix-ui/react-toast";
import "class-variance-authority";
import "clsx";
import "tailwind-merge";
import "next-themes";
import "sonner";
import "@radix-ui/react-tooltip";
import "react-i18next";
import "@supabase/supabase-js";
import "@radix-ui/react-slot";
import "@radix-ui/react-separator";
import "@radix-ui/react-dialog";
import "@radix-ui/react-alert-dialog";
import "@radix-ui/react-dropdown-menu";
import "@radix-ui/react-collapsible";
import "i18next";
import "i18next-browser-languagedetector";
import "@radix-ui/react-label";
import "@radix-ui/react-select";
import "@radix-ui/react-checkbox";
function ContactsTab() {
  const { activeBusiness } = useBusiness();
  const queryClient = useQueryClient();
  const fileInputRef = useRef(null);
  const [newEmail, setNewEmail] = useState("");
  const [newName, setNewName] = useState("");
  const { data: contacts = [], isLoading } = useQuery({
    queryKey: ["customer-contacts", activeBusiness == null ? void 0 : activeBusiness.id],
    queryFn: async () => {
      if (!activeBusiness) return [];
      const { data, error } = await supabase.from("customer_contacts").select("*").eq("business_id", activeBusiness.id).order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!activeBusiness
  });
  const addContact = useMutation({
    mutationFn: async () => {
      if (!activeBusiness || !newEmail.trim()) throw new Error("Email gerekli");
      const { error } = await supabase.from("customer_contacts").insert({
        business_id: activeBusiness.id,
        email: newEmail.trim().toLowerCase(),
        name: newName.trim() || null,
        source: "manual"
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
    }
  });
  const deleteContact = useMutation({
    mutationFn: async (id) => {
      const { error } = await supabase.from("customer_contacts").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customer-contacts"] });
      toast({ title: "Silindi" });
    }
  });
  const handleCSVUpload = async (e) => {
    var _a, _b;
    const file = (_a = e.target.files) == null ? void 0 : _a[0];
    if (!file || !activeBusiness) return;
    const text = await file.text();
    const lines = text.split("\n").filter((l) => l.trim());
    const contacts2 = [];
    const startIdx = ((_b = lines[0]) == null ? void 0 : _b.toLowerCase().includes("email")) ? 1 : 0;
    for (let i = startIdx; i < lines.length; i++) {
      const parts = lines[i].split(",").map((p) => p.trim().replace(/"/g, ""));
      const email = parts.find((p) => p.includes("@"));
      if (email) {
        const name = parts.find((p) => !p.includes("@") && p.length > 0) || null;
        contacts2.push({
          business_id: activeBusiness.id,
          email: email.toLowerCase(),
          name,
          source: "csv"
        });
      }
    }
    if (contacts2.length === 0) {
      toast({ title: "Hata", description: "CSV'de geçerli email bulunamadı", variant: "destructive" });
      return;
    }
    const { error } = await supabase.from("customer_contacts").upsert(contacts2, {
      onConflict: "business_id,email",
      ignoreDuplicates: true
    });
    if (error) {
      toast({ title: "Hata", description: error.message, variant: "destructive" });
    } else {
      queryClient.invalidateQueries({ queryKey: ["customer-contacts"] });
      toast({ title: "Başarılı", description: `${contacts2.length} müşteri içe aktarıldı` });
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  };
  const subscribedCount = contacts.filter((c) => c.subscribed).length;
  return /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-3 gap-4", children: [
      /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsxs(CardContent, { className: "pt-6 text-center", children: [
        /* @__PURE__ */ jsx("div", { className: "text-3xl font-bold text-foreground", children: contacts.length }),
        /* @__PURE__ */ jsx("div", { className: "text-sm text-muted-foreground mt-1", children: "Toplam Müşteri" })
      ] }) }),
      /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsxs(CardContent, { className: "pt-6 text-center", children: [
        /* @__PURE__ */ jsx("div", { className: "text-3xl font-bold text-green-600", children: subscribedCount }),
        /* @__PURE__ */ jsx("div", { className: "text-sm text-muted-foreground mt-1", children: "Aktif Aboneler" })
      ] }) }),
      /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsxs(CardContent, { className: "pt-6 text-center", children: [
        /* @__PURE__ */ jsx("div", { className: "text-3xl font-bold text-muted-foreground", children: contacts.length - subscribedCount }),
        /* @__PURE__ */ jsx("div", { className: "text-sm text-muted-foreground mt-1", children: "Abonelikten Çıkan" })
      ] }) })
    ] }),
    /* @__PURE__ */ jsxs(Card, { children: [
      /* @__PURE__ */ jsxs(CardHeader, { children: [
        /* @__PURE__ */ jsx(CardTitle, { className: "text-lg", children: "Müşteri Ekle" }),
        /* @__PURE__ */ jsx(CardDescription, { children: "Manuel olarak veya CSV dosyasından müşteri ekleyin" })
      ] }),
      /* @__PURE__ */ jsx(CardContent, { children: /* @__PURE__ */ jsxs("div", { className: "flex gap-3 items-end", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex-1 space-y-1", children: [
          /* @__PURE__ */ jsx(Label, { htmlFor: "contactEmail", children: "Email" }),
          /* @__PURE__ */ jsx(
            Input,
            {
              id: "contactEmail",
              type: "email",
              placeholder: "musteri@ornek.com",
              value: newEmail,
              onChange: (e) => setNewEmail(e.target.value)
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex-1 space-y-1", children: [
          /* @__PURE__ */ jsx(Label, { htmlFor: "contactName", children: "İsim (opsiyonel)" }),
          /* @__PURE__ */ jsx(
            Input,
            {
              id: "contactName",
              placeholder: "Ahmet Yılmaz",
              value: newName,
              onChange: (e) => setNewName(e.target.value)
            }
          )
        ] }),
        /* @__PURE__ */ jsxs(Button, { onClick: () => addContact.mutate(), disabled: !newEmail.trim() || addContact.isPending, children: [
          /* @__PURE__ */ jsx(Plus, { className: "h-4 w-4 mr-1" }),
          " Ekle"
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx(
            "input",
            {
              ref: fileInputRef,
              type: "file",
              accept: ".csv",
              className: "hidden",
              onChange: handleCSVUpload
            }
          ),
          /* @__PURE__ */ jsxs(Button, { variant: "outline", onClick: () => {
            var _a;
            return (_a = fileInputRef.current) == null ? void 0 : _a.click();
          }, children: [
            /* @__PURE__ */ jsx(Upload, { className: "h-4 w-4 mr-1" }),
            " CSV Yükle"
          ] })
        ] })
      ] }) })
    ] }),
    /* @__PURE__ */ jsxs(Card, { children: [
      /* @__PURE__ */ jsx(CardHeader, { children: /* @__PURE__ */ jsxs(CardTitle, { className: "text-lg flex items-center gap-2", children: [
        /* @__PURE__ */ jsx(Users, { className: "h-5 w-5" }),
        "Müşteri Listesi"
      ] }) }),
      /* @__PURE__ */ jsx(CardContent, { children: isLoading ? /* @__PURE__ */ jsx("p", { className: "text-muted-foreground text-sm", children: "Yükleniyor..." }) : contacts.length === 0 ? /* @__PURE__ */ jsx("p", { className: "text-muted-foreground text-sm text-center py-8", children: "Henüz müşteri eklenmemiş. Yukarıdan manuel ekleyin veya CSV yükleyin." }) : /* @__PURE__ */ jsxs(Table, { children: [
        /* @__PURE__ */ jsx(TableHeader, { children: /* @__PURE__ */ jsxs(TableRow, { children: [
          /* @__PURE__ */ jsx(TableHead, { children: "Email" }),
          /* @__PURE__ */ jsx(TableHead, { children: "İsim" }),
          /* @__PURE__ */ jsx(TableHead, { children: "Kaynak" }),
          /* @__PURE__ */ jsx(TableHead, { children: "Durum" }),
          /* @__PURE__ */ jsx(TableHead, { className: "w-10" })
        ] }) }),
        /* @__PURE__ */ jsx(TableBody, { children: contacts.map((contact) => /* @__PURE__ */ jsxs(TableRow, { children: [
          /* @__PURE__ */ jsx(TableCell, { className: "font-medium", children: contact.email }),
          /* @__PURE__ */ jsx(TableCell, { children: contact.name || "—" }),
          /* @__PURE__ */ jsx(TableCell, { children: /* @__PURE__ */ jsx(Badge, { variant: "secondary", className: "text-xs", children: contact.source === "manual" ? "Manuel" : contact.source === "csv" ? "CSV" : "Yorum" }) }),
          /* @__PURE__ */ jsx(TableCell, { children: /* @__PURE__ */ jsx(Badge, { variant: contact.subscribed ? "default" : "secondary", className: "text-xs", children: contact.subscribed ? "Aktif" : "Çıktı" }) }),
          /* @__PURE__ */ jsx(TableCell, { children: /* @__PURE__ */ jsx(
            Button,
            {
              variant: "ghost",
              size: "icon",
              onClick: () => deleteContact.mutate(contact.id),
              children: /* @__PURE__ */ jsx(Trash2, { className: "h-4 w-4 text-destructive" })
            }
          ) })
        ] }, contact.id)) })
      ] }) })
    ] })
  ] });
}
const TEMPLATES = {
  review_thanks: {
    subject: "Yorumunuz için teşekkürler! 🙏",
    body: `Merhaba {{name}},

Değerli yorumunuz için çok teşekkür ederiz. Geri bildiriminiz bizim için son derece önemli.

Sizi tekrar ağırlamaktan mutluluk duyarız!

Saygılarımızla,
{{business_name}}`
  },
  review_invite: {
    subject: "Deneyiminizi paylaşır mısınız? ⭐",
    body: `Merhaba {{name}},

Son ziyaretinizden memnun kaldığınızı umuyoruz! Google'da bize yorum bırakarak deneyiminizi paylaşabilirsiniz.

{{review_link}}

Yorumunuz, diğer müşterilerimize de yol gösterecektir.

Teşekkürler,
{{business_name}}`
  },
  promo: {
    subject: "Size özel kampanya! 🎉",
    body: `Merhaba {{name}},

Değerli müşterimiz olarak size özel bir teklifimiz var!

[Kampanya detaylarınızı buraya yazın]

Fırsatı kaçırmayın!

Saygılarımızla,
{{business_name}}`
  },
  custom: {
    subject: "",
    body: ""
  }
};
function ComposeTab() {
  const { activeBusiness } = useBusiness();
  const [templateType, setTemplateType] = useState("custom");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [replyTo, setReplyTo] = useState("");
  const [sending, setSending] = useState(false);
  const [selectAll, setSelectAll] = useState(true);
  const [selectedIds, setSelectedIds] = useState(/* @__PURE__ */ new Set());
  const { data: contacts = [] } = useQuery({
    queryKey: ["customer-contacts", activeBusiness == null ? void 0 : activeBusiness.id],
    queryFn: async () => {
      if (!activeBusiness) return [];
      const { data, error } = await supabase.from("customer_contacts").select("*").eq("business_id", activeBusiness.id).eq("subscribed", true).order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!activeBusiness
  });
  const handleTemplateChange = (type) => {
    setTemplateType(type);
    const tmpl = TEMPLATES[type];
    if (tmpl) {
      setSubject(tmpl.subject);
      setBody(tmpl.body);
    }
  };
  const getRecipients = () => {
    if (selectAll) return contacts;
    return contacts.filter((c) => selectedIds.has(c.id));
  };
  const toggleContact = (id) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
    setSelectAll(false);
  };
  const processTemplate = (text, contact) => {
    return text.replace(/\{\{name\}\}/g, contact.name || "Değerli Müşterimiz").replace(/\{\{business_name\}\}/g, (activeBusiness == null ? void 0 : activeBusiness.name) || "").replace(/\{\{review_link\}\}/g, (activeBusiness == null ? void 0 : activeBusiness.place_id) ? `https://search.google.com/local/writereview?placeid=${activeBusiness.place_id}` : "[Google Yorum Linki]");
  };
  const bodyToHtml = (text) => {
    return text.split("\n").map((line) => line.trim() === "" ? "<br>" : `<p style="margin:0 0 12px 0;color:#374151;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;font-size:15px;line-height:1.6;">${line}</p>`).join("");
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
      const { data: campaign, error: campError } = await supabase.from("email_campaigns").insert({
        business_id: activeBusiness.id,
        subject,
        body_html: bodyToHtml(body),
        template_type: templateType,
        recipient_count: recipients.length
      }).select("id").single();
      if (campError) throw campError;
      const recipientsList = recipients.map((c) => ({
        email: c.email,
        name: c.name,
        contact_id: c.id
      }));
      const logoUrl = "https://pnpuhewfoxssmbpryart.supabase.co/storage/v1/object/public/email-assets/logo.png?v=2";
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
            <td align="center" style="padding-top:28px;">
              <img src="${logoUrl}" alt="VoyageRespond" width="36" height="36" style="display:inline-block;border-radius:8px;vertical-align:middle;" />
              <p style="margin:6px 0 0 0;font-size:13px;font-weight:600;color:#6b7280;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
                <a href="https://voyagerespond.com" style="color:#7C3AED;text-decoration:none;">VoyageRespond</a>
              </p>
              <p style="margin:4px 0 0 0;font-size:11px;color:#9ca3af;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
                ${(activeBusiness == null ? void 0 : activeBusiness.name) || ""} tarafından gönderildi
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
          reply_to: replyTo || void 0
        }
      });
      if (error) throw error;
      toast({
        title: "Email Gönderildi! ✉️",
        description: `${data.sentCount} email başarıyla gönderildi${data.failedCount > 0 ? `, ${data.failedCount} başarısız` : ""}`
      });
      setSubject("");
      setBody("");
      setTemplateType("custom");
    } catch (err) {
      toast({
        title: "Hata",
        description: err instanceof Error ? err.message : "Email gönderilemedi",
        variant: "destructive"
      });
    } finally {
      setSending(false);
    }
  };
  return /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-6", children: [
    /* @__PURE__ */ jsx("div", { className: "lg:col-span-2 space-y-6", children: /* @__PURE__ */ jsxs(Card, { children: [
      /* @__PURE__ */ jsxs(CardHeader, { children: [
        /* @__PURE__ */ jsxs(CardTitle, { className: "text-lg flex items-center gap-2", children: [
          /* @__PURE__ */ jsx(Sparkles, { className: "h-5 w-5 text-primary" }),
          "Email Oluştur"
        ] }),
        /* @__PURE__ */ jsx(CardDescription, { children: "Şablon seçin veya serbest email yazın" })
      ] }),
      /* @__PURE__ */ jsxs(CardContent, { className: "space-y-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsx(Label, { children: "Şablon" }),
          /* @__PURE__ */ jsxs(Select, { value: templateType, onValueChange: handleTemplateChange, children: [
            /* @__PURE__ */ jsx(SelectTrigger, { children: /* @__PURE__ */ jsx(SelectValue, {}) }),
            /* @__PURE__ */ jsxs(SelectContent, { children: [
              /* @__PURE__ */ jsx(SelectItem, { value: "custom", children: "Serbest Email" }),
              /* @__PURE__ */ jsx(SelectItem, { value: "review_thanks", children: "Yorum Teşekkür Maili" }),
              /* @__PURE__ */ jsx(SelectItem, { value: "review_invite", children: "Yorum Daveti" }),
              /* @__PURE__ */ jsx(SelectItem, { value: "promo", children: "Promosyon / Kampanya" })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsx(Label, { htmlFor: "subject", children: "Konu" }),
          /* @__PURE__ */ jsx(
            Input,
            {
              id: "subject",
              placeholder: "Email konusu...",
              value: subject,
              onChange: (e) => setSubject(e.target.value)
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsx(Label, { htmlFor: "body", children: "İçerik" }),
          /* @__PURE__ */ jsx(
            Textarea,
            {
              id: "body",
              placeholder: "Email içeriğinizi yazın... Değişkenler: {{name}}, {{business_name}}, {{review_link}}",
              value: body,
              onChange: (e) => setBody(e.target.value),
              rows: 12,
              className: "font-mono text-sm"
            }
          ),
          /* @__PURE__ */ jsxs("p", { className: "text-xs text-muted-foreground", children: [
            "Kullanılabilir değişkenler: ",
            "{{name}}",
            ", ",
            "{{business_name}}",
            ", ",
            "{{review_link}}"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsx(Label, { htmlFor: "replyTo", children: "Yanıt Adresi (opsiyonel)" }),
          /* @__PURE__ */ jsx(
            Input,
            {
              id: "replyTo",
              type: "email",
              placeholder: "info@isletmeniz.com",
              value: replyTo,
              onChange: (e) => setReplyTo(e.target.value)
            }
          ),
          /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: "Müşteriler bu emaile yanıt verdiğinde buraya gelir" })
        ] }),
        /* @__PURE__ */ jsxs(
          Button,
          {
            className: "w-full",
            onClick: handleSend,
            disabled: sending || !subject.trim() || !body.trim() || getRecipients().length === 0,
            children: [
              /* @__PURE__ */ jsx(Send, { className: "h-4 w-4 mr-2" }),
              sending ? "Gönderiliyor..." : `${getRecipients().length} kişiye gönder`
            ]
          }
        )
      ] })
    ] }) }),
    /* @__PURE__ */ jsx("div", { children: /* @__PURE__ */ jsxs(Card, { children: [
      /* @__PURE__ */ jsxs(CardHeader, { children: [
        /* @__PURE__ */ jsx(CardTitle, { className: "text-lg", children: "Alıcılar" }),
        /* @__PURE__ */ jsxs(CardDescription, { children: [
          getRecipients().length,
          " müşteri seçili"
        ] })
      ] }),
      /* @__PURE__ */ jsxs(CardContent, { className: "space-y-3", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 pb-2 border-b", children: [
          /* @__PURE__ */ jsx(
            Checkbox,
            {
              id: "selectAll",
              checked: selectAll,
              onCheckedChange: (v) => {
                setSelectAll(!!v);
                if (v) setSelectedIds(/* @__PURE__ */ new Set());
              }
            }
          ),
          /* @__PURE__ */ jsxs(Label, { htmlFor: "selectAll", className: "text-sm font-medium", children: [
            "Tümünü seç (",
            contacts.length,
            ")"
          ] })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "max-h-[400px] overflow-y-auto space-y-2", children: contacts.length === 0 ? /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground text-center py-4", children: "Henüz müşteri yok. Müşteri Listesi sekmesinden ekleyin." }) : contacts.map((c) => /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsx(
            Checkbox,
            {
              checked: selectAll || selectedIds.has(c.id),
              onCheckedChange: () => toggleContact(c.id)
            }
          ),
          /* @__PURE__ */ jsxs("div", { className: "truncate text-sm", children: [
            /* @__PURE__ */ jsx("span", { className: "font-medium", children: c.name || c.email }),
            c.name && /* @__PURE__ */ jsx("span", { className: "text-muted-foreground ml-1 text-xs", children: c.email })
          ] })
        ] }, c.id)) })
      ] })
    ] }) })
  ] });
}
const statusLabels = {
  draft: { label: "Taslak", variant: "secondary" },
  sending: { label: "Gönderiliyor", variant: "outline" },
  sent: { label: "Gönderildi", variant: "default" },
  failed: { label: "Başarısız", variant: "destructive" }
};
const templateLabels = {
  review_thanks: "Yorum Teşekkürü",
  review_invite: "Yorum Daveti",
  promo: "Promosyon",
  custom: "Serbest Email"
};
function CampaignsTab() {
  const { activeBusiness } = useBusiness();
  const { data: campaigns = [], isLoading } = useQuery({
    queryKey: ["email-campaigns", activeBusiness == null ? void 0 : activeBusiness.id],
    queryFn: async () => {
      if (!activeBusiness) return [];
      const { data, error } = await supabase.from("email_campaigns").select("*").eq("business_id", activeBusiness.id).order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!activeBusiness
  });
  return /* @__PURE__ */ jsxs(Card, { children: [
    /* @__PURE__ */ jsxs(CardHeader, { children: [
      /* @__PURE__ */ jsxs(CardTitle, { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsx(History, { className: "h-5 w-5" }),
        "Gönderim Geçmişi"
      ] }),
      /* @__PURE__ */ jsx(CardDescription, { children: "Gönderdiğiniz tüm email kampanyaları" })
    ] }),
    /* @__PURE__ */ jsx(CardContent, { children: isLoading ? /* @__PURE__ */ jsx("p", { className: "text-muted-foreground text-sm", children: "Yükleniyor..." }) : campaigns.length === 0 ? /* @__PURE__ */ jsx("p", { className: "text-muted-foreground text-sm text-center py-8", children: "Henüz email göndermediniz. Email Gönder sekmesinden başlayın." }) : /* @__PURE__ */ jsxs(Table, { children: [
      /* @__PURE__ */ jsx(TableHeader, { children: /* @__PURE__ */ jsxs(TableRow, { children: [
        /* @__PURE__ */ jsx(TableHead, { children: "Konu" }),
        /* @__PURE__ */ jsx(TableHead, { children: "Tür" }),
        /* @__PURE__ */ jsx(TableHead, { children: "Durum" }),
        /* @__PURE__ */ jsx(TableHead, { children: "Alıcı" }),
        /* @__PURE__ */ jsx(TableHead, { children: "Başarılı" }),
        /* @__PURE__ */ jsx(TableHead, { children: "Tarih" })
      ] }) }),
      /* @__PURE__ */ jsx(TableBody, { children: campaigns.map((campaign) => {
        const status = statusLabels[campaign.status] || statusLabels.draft;
        return /* @__PURE__ */ jsxs(TableRow, { children: [
          /* @__PURE__ */ jsx(TableCell, { className: "font-medium max-w-[200px] truncate", children: campaign.subject }),
          /* @__PURE__ */ jsx(TableCell, { children: /* @__PURE__ */ jsx(Badge, { variant: "secondary", className: "text-xs", children: templateLabels[campaign.template_type] || campaign.template_type }) }),
          /* @__PURE__ */ jsx(TableCell, { children: /* @__PURE__ */ jsx(Badge, { variant: status.variant, className: "text-xs", children: status.label }) }),
          /* @__PURE__ */ jsx(TableCell, { children: campaign.recipient_count }),
          /* @__PURE__ */ jsxs(TableCell, { children: [
            campaign.sent_count,
            "/",
            campaign.recipient_count,
            campaign.failed_count > 0 && /* @__PURE__ */ jsxs("span", { className: "text-destructive ml-1", children: [
              "(",
              campaign.failed_count,
              " hata)"
            ] })
          ] }),
          /* @__PURE__ */ jsx(TableCell, { className: "text-muted-foreground text-sm", children: campaign.sent_at ? new Date(campaign.sent_at).toLocaleDateString("tr-TR", {
            day: "numeric",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
          }) : "—" })
        ] }, campaign.id);
      }) })
    ] }) })
  ] });
}
function EmailCenter() {
  const [activeTab, setActiveTab] = useState("compose");
  return /* @__PURE__ */ jsxs("div", { className: "p-8 space-y-6", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
      /* @__PURE__ */ jsx("div", { className: "p-2 rounded-lg bg-primary/10", children: /* @__PURE__ */ jsx(Mail, { className: "h-6 w-6 text-primary" }) }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h1", { className: "text-3xl font-semibold text-foreground", children: "Email Merkezi" }),
        /* @__PURE__ */ jsx("p", { className: "text-muted-foreground", children: "Müşterilerinize email gönderin ve yönetin" })
      ] })
    ] }),
    /* @__PURE__ */ jsxs(Tabs, { value: activeTab, onValueChange: setActiveTab, className: "space-y-6", children: [
      /* @__PURE__ */ jsxs(TabsList, { className: "bg-muted/30", children: [
        /* @__PURE__ */ jsx(TabsTrigger, { value: "compose", children: "Email Gönder" }),
        /* @__PURE__ */ jsx(TabsTrigger, { value: "contacts", children: "Müşteri Listesi" }),
        /* @__PURE__ */ jsx(TabsTrigger, { value: "campaigns", children: "Gönderim Geçmişi" })
      ] }),
      /* @__PURE__ */ jsx(TabsContent, { value: "compose", children: /* @__PURE__ */ jsx(ComposeTab, {}) }),
      /* @__PURE__ */ jsx(TabsContent, { value: "contacts", children: /* @__PURE__ */ jsx(ContactsTab, {}) }),
      /* @__PURE__ */ jsx(TabsContent, { value: "campaigns", children: /* @__PURE__ */ jsx(CampaignsTab, {}) })
    ] })
  ] });
}
export {
  EmailCenter as default
};
