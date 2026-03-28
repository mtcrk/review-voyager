import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  MessageSquare,
  Star,
  Phone,
  Sparkles,
  Search,
  Check,
  Clock,
  Lock,
  Bell,
  ArrowRight,
  Zap,
  Users,
  BarChart3,
  Music2,
} from "lucide-react";
import voyageRespondLogo from "@/assets/voyage-respond-logo.svg";
import { useAuth } from "@/contexts/AuthContext";
import { useBusiness } from "@/contexts/BusinessContext";
import { supabase } from "@/integrations/supabase/client";

type TabType = "all" | "instagram" | "google" | "tiktok" | "whatsapp" | "coming-soon";
type AutomationStatus = "available" | "early-access" | "coming-soon";

interface Automation {
  id: string;
  title: string;
  description: string;
  benefit: string;
  channel: "instagram" | "google" | "tiktok" | "whatsapp" | "other";
  status: AutomationStatus;
  icon: React.ElementType;
  badge?: string;
  link?: string;
}

interface TikTokConnection {
  connected: boolean;
  username?: string;
  avatar_url?: string;
}

const Hub = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { activeBusiness } = useBusiness();
  const [searchParams] = useSearchParams();
  const selectedFromOnboarding = searchParams.get("selected");

  const [activeTab, setActiveTab] = useState<TabType>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [setupModal, setSetupModal] = useState<Automation | null>(null);
  const [waitlistModal, setWaitlistModal] = useState<Automation | null>(null);
  const [waitlistEmail, setWaitlistEmail] = useState("");
  const [tiktokConnection, setTiktokConnection] = useState<TikTokConnection>({ connected: false });

  // Read onboarding channel selections
  const onboardingChannels: string[] = (() => {
    try {
      return JSON.parse(localStorage.getItem("onboarding_channels") || "[]");
    } catch { return []; }
  })();

  // Map onboarding channel IDs to hub channel types
  const channelMap: Record<string, string> = {
    "google-reviews": "google",
    "booking": "google", // booking/tripadvisor automations are under google tab
    "tripadvisor": "google",
    "trustpilot": "google",
    "instagram": "instagram",
  };

  const isChannelActivated = (automationChannel: string) => {
    return onboardingChannels.some(ch => channelMap[ch] === automationChannel);
  };

  // Scroll to selected automation from onboarding
  useEffect(() => {
    if (selectedFromOnboarding) {
      setTimeout(() => {
        const el = document.getElementById(`automation-${selectedFromOnboarding}`);
        el?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 300);
    }
  }, [selectedFromOnboarding]);

  // Fetch TikTok connection status
  useEffect(() => {
    const fetchTikTokStatus = async () => {
      if (!activeBusiness?.id) return;
      try {
        const response = await supabase.functions.invoke("tiktok-auth", {
          body: { action: "status", business_id: activeBusiness.id },
        });
        if (!response.error && response.data) {
          setTiktokConnection(response.data);
        }
      } catch (error) {
        console.error("Failed to fetch TikTok status:", error);
      }
    };
    fetchTikTokStatus();
  }, [activeBusiness?.id]);

  const automations: Automation[] = [
    {
      id: "comment-to-dm",
      title: "Comment → DM Auto Reply",
      description: "Automatically send a DM when someone comments a keyword on your post.",
      benefit: "Convert comments into sales conversations",
      channel: "instagram",
      status: "coming-soon",
      icon: MessageSquare,
    },
    {
      id: "dm-faq",
      title: "DM FAQ Assistant",
      description: "AI-powered responses to common questions in your Instagram DMs.",
      benefit: "Save 10+ hours per week on repetitive questions",
      channel: "instagram",
      status: "coming-soon",
      icon: Sparkles,
    },
    {
      id: "story-mention",
      title: "Story Mention Auto-Reply",
      description: "Automatically thank users who mention you in their stories.",
      benefit: "Build stronger relationships with fans",
      channel: "instagram",
      status: "coming-soon",
      icon: Zap,
    },
    {
      id: "review-reply",
      title: "AI Review Reply Suggestions",
      description: "Get smart, personalized reply suggestions for every Google review.",
      benefit: "Reply faster, sound professional every time",
      channel: "google",
      status: "available",
      icon: Star,
      link: "/reviews",
    },
    {
      id: "review-alerts",
      title: "Negative Review Alerts",
      description: "Get instant notifications when you receive a negative review.",
      benefit: "Respond quickly to unhappy customers",
      channel: "google",
      status: "available",
      icon: Bell,
      link: "/reviews",
    },
    {
      id: "tiktok-connect",
      title: "TikTok",
      description: tiktokConnection.connected 
        ? `Connected as @${tiktokConnection.username}`
        : "Connect your TikTok Business account",
      benefit: "Coming soon: Inbox automation",
      channel: "tiktok",
      status: "available",
      icon: Music2,
      badge: tiktokConnection.connected ? "Connected" : "Login Kit",
      link: "/channels/tiktok",
    },
    {
      id: "whatsapp-auto",
      title: "WhatsApp Auto-Responder",
      description: "Automated responses for WhatsApp Business messages.",
      benefit: "Never miss a customer inquiry",
      channel: "whatsapp",
      status: "coming-soon",
      icon: Phone,
    },
    {
      id: "team-inbox",
      title: "Team Inbox",
      description: "Unified inbox for all your channels with team collaboration.",
      benefit: "One place for all customer conversations",
      channel: "other",
      status: "coming-soon",
      icon: Users,
    },
    {
      id: "analytics",
      title: "Response Analytics",
      description: "Track response times, sentiment, and team performance.",
      benefit: "Make data-driven decisions",
      channel: "other",
      status: "coming-soon",
      icon: BarChart3,
    },
  ];

  const tabs = [
    { id: "all" as const, label: "All" },
    { id: "instagram" as const, label: "Instagram" },
    { id: "google" as const, label: "Google Reviews" },
    { id: "tiktok" as const, label: "TikTok" },
    { id: "whatsapp" as const, label: "WhatsApp" },
    { id: "coming-soon" as const, label: "Coming Soon" },
  ];

  // If onboarding channels exist, only show relevant automations
  const hasOnboardingSelection = onboardingChannels.length > 0;

  const filteredAutomations = automations.filter((a) => {
    // First filter by onboarding selections if they exist
    if (hasOnboardingSelection && !isChannelActivated(a.channel)) {
      return false;
    }

    const matchesTab =
      activeTab === "all" ||
      (activeTab === "coming-soon" && a.status === "coming-soon") ||
      (activeTab === "instagram" && a.channel === "instagram") ||
      (activeTab === "google" && a.channel === "google") ||
      (activeTab === "tiktok" && a.channel === "tiktok") ||
      (activeTab === "whatsapp" && a.channel === "whatsapp");

    const matchesSearch =
      a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.description.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesTab && matchesSearch;
  });

  const connectedChannels = onboardingChannels.length || 0;
  const activeAutomations = automations.filter(a => 
    a.status === "available" && a.link && isChannelActivated(a.channel)
  ).length;

  const getStatusBadge = (automation: Automation) => {
    // Check if activated via onboarding
    const activated = automation.status === "available" && isChannelActivated(automation.channel);
    
    // Special handling for TikTok with custom badge
    if (automation.badge) {
      const isConnected = automation.badge === "Connected";
      return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          isConnected ? "bg-primary/10 text-primary" : "bg-foreground text-background"
        }`}>
          {isConnected && <Check className="w-3 h-3 mr-1" />}
          {automation.badge}
        </span>
      );
    }

    if (activated) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
          <Check className="w-3 h-3 mr-1" />
          Active
        </span>
      );
    }

    switch (automation.status) {
      case "available":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
            <Check className="w-3 h-3 mr-1" />
            Available
          </span>
        );
      case "early-access":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-accent text-accent-foreground">
            <Clock className="w-3 h-3 mr-1" />
            Early Access
          </span>
        );
      case "coming-soon":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-muted text-muted-foreground">
            <Lock className="w-3 h-3 mr-1" />
            Coming Soon
          </span>
        );
    }
  };

  const handleAutomationAction = (automation: Automation) => {
    if (automation.link) {
      navigate(automation.link);
      return;
    }

    if (automation.status === "available") {
      setSetupModal(automation);
    } else if (automation.status === "early-access") {
      setWaitlistModal(automation);
    } else {
      setWaitlistModal(automation);
    }
  };

  const getActionButton = (automation: Automation) => {
    const activated = automation.status === "available" && isChannelActivated(automation.channel);
    
    if (activated && automation.link) {
      return (
        <Button
          size="sm"
          className="gradient-primary text-white"
          onClick={() => navigate(automation.link!)}
        >
          Open
          <ArrowRight className="w-4 h-4 ml-1" />
        </Button>
      );
    }

    switch (automation.status) {
      case "available":
        return (
          <Button
            size="sm"
            className="gradient-primary text-white"
            onClick={() => handleAutomationAction(automation)}
          >
            Set up
            <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        );
      case "early-access":
        return (
          <Button
            size="sm"
            variant="outline"
            className="border-accent text-accent-foreground hover:bg-accent/50"
            onClick={() => handleAutomationAction(automation)}
          >
            Join waitlist
          </Button>
        );
      case "coming-soon":
        return (
          <Button
            size="sm"
            variant="ghost"
            className="text-muted-foreground"
            onClick={() => handleAutomationAction(automation)}
          >
            <Bell className="w-4 h-4 mr-1" />
            Notify me
          </Button>
        );
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <nav className="sticky top-0 z-50 border-b backdrop-blur-lg bg-white/95">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex h-16 items-center justify-between">
            <button
              onClick={() => navigate("/")}
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            >
              <img src={voyageRespondLogo} alt="VoyageRespond" className="h-7 w-7" />
              <span className="text-lg" style={{ color: "#1F2937" }}>
                <span className="font-normal">Voyage</span>
                <span className="font-semibold">Respond</span>
              </span>
            </button>
            <div className="flex items-center gap-4">
              {user ? (
                <Button variant="ghost" onClick={() => navigate("/dashboard")}>
                  Dashboard
                </Button>
              ) : (
                <>
                  <Button variant="ghost" onClick={() => navigate("/login")}>
                    Login
                  </Button>
                  <Button className="gradient-primary text-white" onClick={() => navigate("/register")}>
                    Get Started
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <div className="border-b bg-card/50">
        <div className="container mx-auto px-4 sm:px-6 py-12">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
                {hasOnboardingSelection ? "Seçtiğiniz Otomasyonlar" : "Your Automation Hub"}
              </h1>
              <p className="text-muted-foreground text-lg">
                {hasOnboardingSelection 
                  ? "Bu otomasyonlar sizin için hazır. Hemen başlamak için kayıt olun."
                  : "Pick a channel, enable automations, and start converting."}
              </p>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-foreground">{connectedChannels}</div>
                <div className="text-sm text-muted-foreground">Seçili Kanal</div>
              </div>
              <div className="w-px h-10 bg-border" />
              <div className="text-center">
                <div className="text-2xl font-bold text-foreground">{filteredAutomations.length}</div>
                <div className="text-sm text-muted-foreground">Otomasyon</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Banner for non-logged-in users */}
      {!user && hasOnboardingSelection && (
        <div className="bg-primary/5 border-b border-primary/20">
          <div className="container mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-foreground font-medium">
              🚀 Bu otomasyonları kullanmaya başlamak için hesap oluşturun — 3 ay ücretsiz!
            </p>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => navigate("/login")}>
                Giriş Yap
              </Button>
              <Button className="gradient-primary text-white" onClick={() => navigate("/register")}>
                3 Ay Ücretsiz Dene
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="container mx-auto px-4 sm:px-6 py-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                  activeTab === tab.id
                    ? "bg-primary text-white"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search automations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-full md:w-64"
            />
          </div>
        </div>
      </div>

      {/* Automation Cards */}
      <div className="container mx-auto px-4 sm:px-6 pb-12">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAutomations.map((automation) => (
            <div
              key={automation.id}
              id={`automation-${automation.id}`}
              className={`p-6 rounded-xl border bg-card transition-all hover:shadow-lg ${
                selectedFromOnboarding === automation.id
                  ? "ring-2 ring-primary border-primary shadow-lg shadow-primary/20"
                  : "border-border"
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 rounded-lg bg-primary/10">
                  <automation.icon className="w-6 h-6 text-primary" />
                </div>
                {getStatusBadge(automation)}
              </div>
              <h3 className="font-semibold text-lg text-foreground mb-2">{automation.title}</h3>
              <p className="text-muted-foreground text-sm mb-4">{automation.description}</p>
              <p className="text-sm text-primary font-medium mb-4">{automation.benefit}</p>
              <div className="flex justify-end">{getActionButton(automation)}</div>
            </div>
          ))}
        </div>

        {filteredAutomations.length === 0 && (
          <div className="text-center py-16">
            <div className="w-16 h-16 mx-auto bg-muted rounded-full flex items-center justify-center mb-4">
              <Search className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">No automations found</h3>
            <p className="text-muted-foreground">Try adjusting your search or filter.</p>
          </div>
        )}
      </div>

      {/* Setup Modal */}
      <Dialog open={!!setupModal} onOpenChange={() => setSetupModal(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Set up {setupModal?.title}</DialogTitle>
            <DialogDescription>
              Configure your automation settings below.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Trigger Keywords
              </label>
              <Input placeholder="e.g., price, info, details" />
              <p className="text-xs text-muted-foreground mt-1">
                Comma-separated keywords that will trigger this automation.
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Response Template
              </label>
              <Textarea
                placeholder="Hi! Thanks for your interest. Here's more info about..."
                rows={4}
              />
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={() => setSetupModal(null)}>
                Cancel
              </Button>
              <Button className="gradient-primary text-white" onClick={() => setSetupModal(null)}>
                Save Automation
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Waitlist Modal */}
      <Dialog open={!!waitlistModal} onOpenChange={() => setWaitlistModal(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {waitlistModal?.status === "early-access" ? "Join Early Access" : "Get Notified"}
            </DialogTitle>
            <DialogDescription>
              {waitlistModal?.status === "early-access"
                ? "Be among the first to try this feature."
                : "We'll let you know when this feature launches."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="p-4 bg-muted rounded-lg">
              <h4 className="font-semibold text-foreground mb-1">{waitlistModal?.title}</h4>
              <p className="text-sm text-muted-foreground">{waitlistModal?.description}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Email Address
              </label>
              <Input
                type="email"
                placeholder="you@example.com"
                value={waitlistEmail}
                onChange={(e) => setWaitlistEmail(e.target.value)}
              />
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={() => setWaitlistModal(null)}>
                Cancel
              </Button>
              <Button
                className="gradient-primary text-white"
                onClick={() => {
                  setWaitlistModal(null);
                  setWaitlistEmail("");
                }}
              >
                {waitlistModal?.status === "early-access" ? "Join Waitlist" : "Notify Me"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Hub;
