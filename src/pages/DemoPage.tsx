import { useTranslation } from "react-i18next";
import { AIVisibilityChecker } from "@/components/landing/AIVisibilityChecker";
import { AIReplyDemo } from "@/components/landing/AIReplyDemo";
import { StoryKitDemo } from "@/components/landing/StoryKitDemo";
import { ChatWithReviewsDemo } from "@/components/landing/ChatWithReviewsDemo";
import { PriorityActionsDemo } from "@/components/landing/PriorityActionsDemo";
import { CompetitorComparisonDemo } from "@/components/landing/CompetitorComparisonDemo";
import { AIVisibilityDemo } from "@/components/landing/AIVisibilityDemo";
import { Sparkles, Eye, MessageSquare, Palette, BarChart3 } from "lucide-react";
import voyageRespondLogo from "@/assets/voyage-respond-logo.svg";
import { useNavigate } from "react-router-dom";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useAuth } from "@/contexts/AuthContext";
import { GatedDemoWrapper } from "@/components/GatedDemoWrapper";

export default function DemoPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const demos = [
    {
      id: "visibility",
      icon: Eye,
      title: t('demo.sections.visibility.title', 'İşletmeniz Yapay Zekada Nasıl Görünüyor?'),
      subtitle: t('demo.sections.visibility.subtitle', 'AI Visibility Skorunuzu anında keşfedin'),
    },
    {
      id: "ai-reply",
      icon: MessageSquare,
      title: t('demo.sections.aiReply.title', 'AI Yanıt Önerilerini Deneyin'),
      subtitle: t('demo.sections.aiReply.subtitle', 'Yapay zekanın her yorum için nasıl profesyonel yanıtlar ürettiğini görün'),
    },
    {
      id: "dashboard-tools",
      icon: BarChart3,
      title: t('demo.sections.dashboardTools.title', 'Dashboard Araçları'),
      subtitle: t('demo.sections.dashboardTools.subtitle', 'Öncelikli işlemler, sohbet ve rakip analizi'),
    },
    {
      id: "storykit",
      icon: Palette,
      title: t('demo.sections.storyKit.title', 'Story Kit ile Ücretsiz Pazarlama'),
      subtitle: t('demo.sections.storyKit.subtitle', 'Müşterilerinizi markanızın hikaye anlatıcısına dönüştürün'),
    },
  ];

  const scrollToSection = (id: string) => {
    const el = document.getElementById(`demo-${id}`);
    el?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Simple Navbar */}
      <nav className="sticky top-0 z-50 border-b backdrop-blur-lg bg-background/95">
        <div className="container mx-auto px-6">
          <div className="flex h-16 items-center justify-between">
            <button onClick={() => navigate("/")} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <img src={voyageRespondLogo} alt="VoyageRespond" className="h-6 w-6" />
              <span className="text-base text-foreground">
                <span className="font-normal">Voyage</span>
                <span className="font-semibold">Respond</span>
              </span>
            </button>
            <div className="flex items-center gap-3">
              <LanguageSwitcher />
              <button
                onClick={() => navigate(user ? "/dashboard" : "/register")}
                className="px-4 py-2 rounded-md text-sm font-medium text-white transition-all shadow-sm hover:shadow-md"
                style={{ backgroundColor: '#7A5AF8' }}
              >
                {user ? t('nav.dashboard') : t('nav.getStarted')}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="container mx-auto px-6 pt-16 pb-12 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6">
          <Sparkles className="w-4 h-4" />
          {t('demo.badge', 'İnteraktif Demolar')}
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
          {t('demo.title', 'Platformu Keşfedin')}
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
          {t('demo.subtitle', 'Tüm özellikleri ücretsiz deneyin. Beğendiğinizde gerçek verilerinizle çalışmaya başlayın.')}
        </p>

        {/* Quick nav pills */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          {demos.map((demo) => (
            <button
              key={demo.id}
              onClick={() => scrollToSection(demo.id)}
              className="flex items-center gap-2 px-4 py-2 rounded-full border border-border bg-card hover:bg-muted/50 transition-colors text-sm font-medium text-foreground"
            >
              <demo.icon className="w-4 h-4 text-primary" />
              {demo.title}
            </button>
          ))}
        </div>
      </section>

      {/* Demo Sections */}
      <div id="demo-visibility">
        <GatedDemoWrapper>
          <AIVisibilityChecker />
        </GatedDemoWrapper>
      </div>

      <div id="demo-ai-reply">
        <GatedDemoWrapper>
          <AIReplyDemo />
        </GatedDemoWrapper>
      </div>

      <div id="demo-dashboard-tools">
        <GatedDemoWrapper>
          <section className="container mx-auto px-6 py-20 bg-muted/30">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                {t('demo.sections.dashboardTools.title', 'Dashboard Araçları')}
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                {t('demo.sections.dashboardTools.subtitle', 'Öncelikli işlemler, sohbet ve rakip analizi')}
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
              <ChatWithReviewsDemo />
              <PriorityActionsDemo />
              <CompetitorComparisonDemo />
            </div>
          </section>
        </GatedDemoWrapper>
      </div>

      <div id="demo-storykit">
        <GatedDemoWrapper>
          <StoryKitDemo />
        </GatedDemoWrapper>
      </div>

      {/* AI Visibility Score (live data) */}
      <GatedDemoWrapper>
        <AIVisibilityDemo />
      </GatedDemoWrapper>
    </div>
  );
}
