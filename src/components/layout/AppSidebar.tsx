import { useState, useEffect } from "react";
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
import { toast } from "@/hooks/use-toast";
import { 
  LayoutDashboard, 
  MessageSquare, 
  Zap, 
  BarChart3, 
  Settings, 
  Video, 
  ChevronDown,
  Music2,
  Star,
  Inbox,
  Send,
  Check,
  Camera,
  Building2,
  Mail,
  Brain,
  BedDouble,
  MapPin,
  ShieldCheck,
  Hotel,
  LogOut,
  FileText,
  Trophy,
  TrendingUp,
  LayoutGrid,
  Sparkles,
  Swords,
  Wallet,
  Radar,
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { supabase } from "@/integrations/supabase/client";
import { useBusiness } from "@/contexts/BusinessContext";
import { useNewReviews } from "@/contexts/NewReviewsContext";
import logo from "@/assets/logo.png";
import { invokeAuthedFunction } from "@/lib/invokeAuthedFunction";

type Platform = "google" | "tiktok" | "instagram" | "whatsapp";

interface PlatformConfig {
  id: Platform;
  name: string;
  icon: React.ReactNode;
  connected: boolean;
  menuItems: { title: string; url: string; icon: React.ComponentType<{ className?: string }> }[];
}

const commonItems = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Tüm Yorumlar", url: "/inbox", icon: Inbox, highlight: true },
  { title: "Yorumlar", url: "/reviews", icon: MessageSquare },
  { title: "Rep Score", url: "/rep-score", icon: Trophy },
  { title: "Google Hesapları", url: "/google-accounts", icon: Star },
  { title: "İstatistikler", url: "/statistics", icon: BarChart3 },
  { title: "Sosyal Medya Analizi", url: "/social-analytics", icon: Sparkles },
  { title: "Google Performance", url: "/performance", icon: TrendingUp },
  { title: "Rapor Oluştur", url: "/report", icon: FileText },
  { title: "Ayarlar", url: "/settings", icon: Settings },
];

const locationItems = [
  { title: "Tüm Lokasyonlar", url: "/locations", icon: Building2 },
  { title: "Platform Puanları", url: "/locations/platform-ratings", icon: LayoutGrid },
];

export function AppSidebar() {
  const { open } = useSidebar();
  const location = useLocation();
  const navigate = useNavigate();
  const { activeBusiness } = useBusiness();
  const { unreadCount, markAllRead } = useNewReviews();
  
  const [selectedPlatform, setSelectedPlatform] = useState<Platform | null>(null);
  const [tiktokConnected, setTiktokConnected] = useState(false);
  const [googleConnected, setGoogleConnected] = useState(false);
  const [autoSelected, setAutoSelected] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  // Check platform connections
  useEffect(() => {
    const checkConnections = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      // Check TikTok connection
      const { data: tiktok } = await supabase
        .from("social_connections")
        .select("id")
        .eq("provider", "tiktok")
        .eq("user_id", session.user.id)
        .maybeSingle();
      
      setTiktokConnected(!!tiktok);

      // Check Google connection via business
      if (activeBusiness?.google_connected) {
        setGoogleConnected(true);
      } else {
        setGoogleConnected(false);
      }
    };

    checkConnections();
  }, [activeBusiness]);

  // Auto-select platform based on current route or connection
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const platformParam = searchParams.get("platform");
    
    if (location.pathname.includes("tiktok")) {
      setSelectedPlatform("tiktok");
    } else if (location.pathname.includes("reviews") && platformParam) {
      setSelectedPlatform(platformParam as Platform);
    } else if (location.pathname.includes("reviews") || location.pathname.includes("review")) {
      setSelectedPlatform("google");
    } else if (!autoSelected && googleConnected && !selectedPlatform) {
      setSelectedPlatform("google");
      setAutoSelected(true);
    }
  }, [location.pathname, location.search, googleConnected, autoSelected, selectedPlatform]);

  const platforms: PlatformConfig[] = [
    {
      id: "google",
      name: "Google Business",
      icon: <Star className="h-4 w-4" />,
      connected: googleConnected,
      menuItems: [
        { title: "Google Yorumları", url: "/reviews?platform=google", icon: MessageSquare },
        { title: "Yorumlarla Sohbet", url: "/chat", icon: Brain },
      ],
    },
    {
      id: "tiktok",
      name: "TikTok",
      icon: <Music2 className="h-4 w-4" />,
      connected: tiktokConnected,
      menuItems: [
        { title: "Video Yorumları", url: "/tiktok-inbox", icon: Video },
        { title: "DM Inbox", url: "/tiktok-dm", icon: Inbox },
      ],
    },
    {
      id: "instagram",
      name: "Instagram",
      icon: <Send className="h-4 w-4 rotate-12" />,
      connected: false,
      menuItems: [
        { title: "DM Inbox", url: "/instagram-dm", icon: Inbox },
        { title: "Yorum Yanıtları", url: "/instagram-comments", icon: MessageSquare },
      ],
    },
  ];

  const reviewPlatforms = [
    { title: "Booking Yorumları", url: "/reviews?platform=booking", icon: BedDouble },
    { title: "TripAdvisor Yorumları", url: "/reviews?platform=tripadvisor", icon: MapPin },
    { title: "Expedia Yorumları", url: "/reviews?platform=expedia", icon: Building2 },
    { title: "Hotels.com Yorumları", url: "/reviews?platform=hotelscom", icon: Hotel },
    { title: "Trip.com Yorumları", url: "/reviews?platform=tripcom", icon: Building2 },
    { title: "YouTube Yorumları", url: "/youtube", icon: Video },
  ];

  const handlePlatformSelect = async (platform: PlatformConfig) => {
    if (platform.connected) {
      setSelectedPlatform(platform.id);
      return;
    }

    // Not connected — trigger OAuth for Google
    if (platform.id === "google") {
      try {
        const response = await invokeAuthedFunction<{ authUrl?: string }>('google-business-auth', {
          body: { action: 'initiate' },
        });
        if (response?.authUrl) {
          window.location.href = response.authUrl;
        }
      } catch (error: any) {
        console.error('Google connect error:', error);
      }
      return;
    }

    // For other platforms, just select them (they handle connection in their own pages)
    setSelectedPlatform(platform.id);
  };

  const currentPlatform = platforms.find(p => p.id === selectedPlatform);

  return (
    <Sidebar collapsible="offcanvas" className="border-r border-sidebar-border">
      <SidebarHeader className="border-b border-sidebar-border p-4">
        <button 
          onClick={() => navigate("/dashboard")}
          className="flex items-center gap-3 hover:opacity-80 transition-opacity w-full"
        >
          <img src={logo} alt="VoyageRespond" className="h-8 w-8" />
          {open && (
            <span className="text-lg font-semibold text-foreground">
              VoyageRespond
            </span>
          )}
        </button>
      </SidebarHeader>

      <SidebarContent>
        {/* Platform Selector */}
        {open && (
          <div className="px-3 py-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg border bg-card hover:bg-accent transition-colors">
                  <div className="flex items-center gap-2">
                    {currentPlatform ? (
                      <>
                        {currentPlatform.icon}
                        <span className="font-medium text-sm">{currentPlatform.name}</span>
                        {currentPlatform.connected && (
                          <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                            <Check className="h-3 w-3" />
                          </Badge>
                        )}
                      </>
                    ) : (
                      <span className="text-sm text-muted-foreground">Platform seç</span>
                    )}
                  </div>
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
                {platforms.map((platform) => (
                  <DropdownMenuItem
                    key={platform.id}
                    onClick={() => handlePlatformSelect(platform)}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      {platform.icon}
                      <span>{platform.name}</span>
                    </div>
                    {platform.connected ? (
                      <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                        Bağlı
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="text-xs">
                        Bağla
                      </Badge>
                    )}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}

        {/* Common Menu Items */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {commonItems.slice(0, 7).map((item) => {
                const isActive = location.pathname === item.url;
                const showInboxBadge = item.url === "/inbox" && unreadCount > 0;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={item.title}
                    >
                      <NavLink
                        to={item.url}
                        onClick={() => { if (showInboxBadge) markAllRead(); }}
                        className="flex items-center gap-3 transition-smooth"
                      >
                        <item.icon className={`h-5 w-5 ${(item as any).highlight ? "text-primary" : ""}`} />
                        <span className="flex-1">{item.title}</span>
                        {showInboxBadge && (
                          <Badge className="h-5 min-w-5 px-1.5 text-xs bg-destructive text-destructive-foreground hover:bg-destructive">
                            {unreadCount > 99 ? "99+" : unreadCount}
                          </Badge>
                        )}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Lokasyonlar (collapsible) */}
        <Collapsible defaultOpen={location.pathname.startsWith("/locations")} className="group/loc-collapsible">
          <SidebarGroup>
            {open ? (
              <CollapsibleTrigger asChild>
                <SidebarGroupLabel className="text-xs text-muted-foreground px-3 cursor-pointer hover:text-foreground transition-colors flex items-center">
                  <Building2 className="h-4 w-4 mr-2" />
                  Lokasyonlar
                  <ChevronDown className="ml-auto h-4 w-4 transition-transform group-data-[state=open]/loc-collapsible:rotate-180" />
                </SidebarGroupLabel>
              </CollapsibleTrigger>
            ) : null}
            <CollapsibleContent>
              <SidebarGroupContent>
                <SidebarMenu>
                  {locationItems.map((item) => {
                    const isActive = location.pathname === item.url;
                    return (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton asChild isActive={isActive} tooltip={item.title}>
                          <NavLink to={item.url} className="flex items-center gap-3 transition-smooth">
                            <item.icon className="h-5 w-5" />
                            <span>{item.title}</span>
                          </NavLink>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </CollapsibleContent>
          </SidebarGroup>
        </Collapsible>
        {currentPlatform && (
          <SidebarGroup>
            {open && (
              <SidebarGroupLabel className="flex items-center gap-2 text-xs text-muted-foreground px-3">
                {currentPlatform.icon}
                {currentPlatform.name}
              </SidebarGroupLabel>
            )}
            <SidebarGroupContent>
              <SidebarMenu>
                {currentPlatform.menuItems.map((item) => {
                  const isActive = (location.pathname + location.search) === item.url || location.pathname === item.url;
                  const showBadge = item.url.includes("/reviews") && unreadCount > 0;
                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        asChild
                        isActive={isActive}
                        tooltip={item.title}
                      >
                        <NavLink
                          to={item.url}
                          onClick={() => { if (showBadge) markAllRead(); }}
                          className="flex items-center gap-3 transition-smooth"
                        >
                          <item.icon className="h-5 w-5" />
                          <span className="flex-1">{item.title}</span>
                          {showBadge && (
                            <Badge className="h-5 min-w-5 px-1.5 text-xs bg-destructive text-destructive-foreground hover:bg-destructive">
                              {unreadCount > 99 ? "99+" : unreadCount}
                            </Badge>
                          )}
                        </NavLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {/* Review Platforms (Wextractor-based) - Collapsible */}
        <Collapsible defaultOpen={false} className="group/collapsible">
          <SidebarGroup>
            {open && (
              <CollapsibleTrigger asChild>
                <SidebarGroupLabel className="text-xs text-muted-foreground px-3 cursor-pointer hover:text-foreground transition-colors">
                  Yorum Platformları
                  <ChevronDown className="ml-auto h-4 w-4 transition-transform group-data-[state=open]/collapsible:rotate-180" />
                </SidebarGroupLabel>
              </CollapsibleTrigger>
            )}
            <CollapsibleContent>
              <SidebarGroupContent>
                <SidebarMenu>
                  {reviewPlatforms.map((item) => {
                    const isActive = (location.pathname + location.search) === item.url;
                    return (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton
                          asChild
                          isActive={isActive}
                          tooltip={item.title}
                        >
                          <NavLink
                            to={item.url}
                            className="flex items-center gap-3 transition-smooth"
                          >
                            <item.icon className="h-5 w-5" />
                            <span>{item.title}</span>
                          </NavLink>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </CollapsibleContent>
          </SidebarGroup>
        </Collapsible>

        {/* Automation */}
        <SidebarGroup>
          {open && (
            <SidebarGroupLabel className="text-xs text-muted-foreground px-3">
              Otomasyon
            </SidebarGroupLabel>
          )}
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={location.pathname === "/auto-reply"}
                  tooltip="Otomatik Yanıt"
                >
                  <NavLink
                    to="/auto-reply"
                    className="flex items-center gap-3 transition-smooth"
                  >
                    <Zap className="h-5 w-5" />
                    <span>Otomatik Yanıt</span>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={location.pathname === "/intelligence"}
                  tooltip="Rakip Analizi"
                >
                  <NavLink
                    to="/intelligence"
                    className="flex items-center gap-3 transition-smooth"
                  >
                    <Swords className="h-5 w-5" />
                    <span>Rakip Analizi</span>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={location.pathname === "/ai-visibility"}
                  tooltip="Yapay Zekada Görünürlük"
                >
                  <NavLink
                    to="/ai-visibility"
                    className="flex items-center gap-3 transition-smooth"
                  >
                    <Radar className="h-5 w-5" />
                    <span>Yapay Zekada Görünürlük</span>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Story Kit */}
        <SidebarGroup>
          {open && (
            <SidebarGroupLabel className="text-xs text-muted-foreground px-3">
              Pazarlama
            </SidebarGroupLabel>
          )}
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={location.pathname === "/story-kit"}
                  tooltip="Story Kit"
                >
                  <NavLink
                    to="/story-kit"
                    className="flex items-center gap-3 transition-smooth"
                  >
                    <Camera className="h-5 w-5" />
                    <span>Story Kit</span>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={location.pathname === "/email"}
                  tooltip="Email Merkezi"
                >
                  <NavLink
                    to="/email"
                    className="flex items-center gap-3 transition-smooth"
                  >
                    <Mail className="h-5 w-5" />
                    <span>Email Merkezi</span>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Settings */}
        <SidebarGroup className="mt-auto">
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={location.pathname.startsWith("/billing")}
                  tooltip="Abonelik"
                >
                  <NavLink
                    to="/billing"
                    className="flex items-center gap-3 transition-smooth"
                  >
                    <Wallet className="h-5 w-5" />
                    <span>Abonelik</span>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={location.pathname === "/settings"}
                  tooltip="Ayarlar"
                >
                  <NavLink
                    to="/settings"
                    className="flex items-center gap-3 transition-smooth"
                  >
                    <Settings className="h-5 w-5" />
                    <span>Ayarlar</span>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  tooltip="Çıkış Yap"
                >
                  <button
                    onClick={() => setShowLogoutDialog(true)}
                    className="flex items-center gap-3 transition-smooth w-full text-left text-destructive"
                  >
                    <LogOut className="h-5 w-5" />
                    <span>Çıkış Yap</span>
                  </button>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Çıkış yapmak istediğinize emin misiniz?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Oturumunuz sonlandırılacak ve giriş sayfasına yönlendirileceksiniz.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>İptal</AlertDialogCancel>
                    <AlertDialogAction
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      onClick={async () => {
                        await supabase.auth.signOut();
                        toast({ title: "Çıkış Yapıldı", description: "Başarıyla çıkış yaptınız." });
                        navigate('/login');
                      }}
                    >
                      Evet, Çıkış Yap
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
