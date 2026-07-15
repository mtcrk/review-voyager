import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ContactsTab } from "@/components/email/ContactsTab";
import { ComposeTab } from "@/components/email/ComposeTab";
import { CampaignsTab } from "@/components/email/CampaignsTab";
import { ReviewRequestTab } from "@/components/email/ReviewRequestTab";
import { Mail } from "lucide-react";

const VALID_TABS = ["compose", "review-request", "contacts", "campaigns"] as const;

export default function EmailCenter() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get("tab");
  const [activeTab, setActiveTab] = useState(
    initialTab && VALID_TABS.includes(initialTab as any) ? initialTab : "compose"
  );

  useEffect(() => {
    const t = searchParams.get("tab");
    if (t && VALID_TABS.includes(t as any) && t !== activeTab) {
      setActiveTab(t);
    }
  }, [searchParams]);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    const next = new URLSearchParams(searchParams);
    next.set("tab", value);
    setSearchParams(next, { replace: true });
  };

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

      <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
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
