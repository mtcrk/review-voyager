import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ContactsTab } from "@/components/email/ContactsTab";
import { ComposeTab } from "@/components/email/ComposeTab";
import { CampaignsTab } from "@/components/email/CampaignsTab";
import { ReviewRequestTab } from "@/components/email/ReviewRequestTab";
import { Mail } from "lucide-react";

export default function EmailCenter() {
  const [activeTab, setActiveTab] = useState("compose");

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-primary/10">
          <Mail className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-semibold text-foreground">Email Merkezi</h1>
          <p className="text-muted-foreground">Müşterilerinize email gönderin ve yönetin</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-muted/30">
          <TabsTrigger value="compose">Email Gönder</TabsTrigger>
          <TabsTrigger value="review-request">Yorum Talebi</TabsTrigger>
          <TabsTrigger value="contacts">Müşteri Listesi</TabsTrigger>
          <TabsTrigger value="campaigns">Gönderim Geçmişi</TabsTrigger>
        </TabsList>

        <TabsContent value="compose">
          <ComposeTab />
        </TabsContent>

        <TabsContent value="review-request">
          <ReviewRequestTab />
        </TabsContent>

        <TabsContent value="contacts">
          <ContactsTab />
        </TabsContent>

        <TabsContent value="campaigns">
          <CampaignsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
