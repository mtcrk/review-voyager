import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { useBusiness } from "@/contexts/BusinessContext";
import { useQuery } from "@tanstack/react-query";
import { History } from "lucide-react";

const statusLabels: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  draft: { label: "Taslak", variant: "secondary" },
  sending: { label: "Gönderiliyor", variant: "outline" },
  sent: { label: "Gönderildi", variant: "default" },
  failed: { label: "Başarısız", variant: "destructive" },
};

const templateLabels: Record<string, string> = {
  review_thanks: "Yorum Teşekkürü",
  review_invite: "Yorum Daveti",
  promo: "Promosyon",
  custom: "Serbest Email",
};

export function CampaignsTab() {
  const { activeBusiness } = useBusiness();

  const { data: campaigns = [], isLoading } = useQuery({
    queryKey: ["email-campaigns", activeBusiness?.id],
    queryFn: async () => {
      if (!activeBusiness) return [];
      const { data, error } = await supabase
        .from("email_campaigns")
        .select("*")
        .eq("business_id", activeBusiness.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!activeBusiness,
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="h-5 w-5" />
          Gönderim Geçmişi
        </CardTitle>
        <CardDescription>Gönderdiğiniz tüm email kampanyaları</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p className="text-muted-foreground text-sm">Yükleniyor...</p>
        ) : campaigns.length === 0 ? (
          <p className="text-muted-foreground text-sm text-center py-8">
            Henüz email göndermediniz. Email Gönder sekmesinden başlayın.
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Konu</TableHead>
                <TableHead>Tür</TableHead>
                <TableHead>Durum</TableHead>
                <TableHead>Alıcı</TableHead>
                <TableHead>Başarılı</TableHead>
                <TableHead>Tarih</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {campaigns.map((campaign) => {
                const status = statusLabels[campaign.status] || statusLabels.draft;
                return (
                  <TableRow key={campaign.id}>
                    <TableCell className="font-medium max-w-[200px] truncate">
                      {campaign.subject}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="text-xs">
                        {templateLabels[campaign.template_type] || campaign.template_type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={status.variant} className="text-xs">
                        {status.label}
                      </Badge>
                    </TableCell>
                    <TableCell>{campaign.recipient_count}</TableCell>
                    <TableCell>
                      {campaign.sent_count}/{campaign.recipient_count}
                      {campaign.failed_count > 0 && (
                        <span className="text-destructive ml-1">({campaign.failed_count} hata)</span>
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {campaign.sent_at
                        ? new Date(campaign.sent_at).toLocaleDateString("tr-TR", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "—"}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
