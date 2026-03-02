import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { MessageSquare, Star, Phone, Check, ArrowRight, Clock, Lock, Music2, Eye, TrendingUp, Sparkles, Target, Users, Zap, Shield } from "lucide-react";
import voyageRespondLogo from "@/assets/voyage-respond-logo.svg";

import { useAuth } from "@/contexts/AuthContext";
import { useTranslation } from 'react-i18next';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { Testimonials } from "@/components/landing/Testimonials";
import { TrustBadges } from "@/components/landing/TrustBadges";
import { APIComplianceBanner } from "@/components/landing/APIComplianceBanner";
import { ProductVideo } from "@/components/landing/ProductVideo";
import { AIVisibilityDemo } from "@/components/landing/AIVisibilityDemo";
const Index = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useTranslation();
  

  const automationOptions = [
    {
      id: "instagram",
      title: t('landing.automations.instagram.title', 'Instagram Sales'),
      status: "available" as const,
      color: "from-purple-500 to-pink-500",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-200",
      icon: MessageSquare,
      features: [
        t('landing.automations.instagram.feature1', 'Comment → DM automation'),
        t('landing.automations.instagram.feature2', 'AI-powered DM replies'),
        t('landing.automations.instagram.feature3', 'Product & session sales'),
      ],
      cta: t('landing.automations.instagram.cta', 'Enable Instagram Automation'),
      ctaLink: "/onboarding",
    },
    {
      id: "google-reviews",
      title: t('landing.automations.googleReviews.title', 'Google Reviews + AI Visibility'),
      status: "available" as const,
      color: "from-blue-500 to-cyan-500",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
      icon: Star,
      features: [
        t('landing.automations.googleReviews.feature1', 'AI Visibility Score & insights'),
        t('landing.automations.googleReviews.feature2', 'Smart review reply suggestions'),
        t('landing.automations.googleReviews.feature3', 'Sentiment & search optimization'),
      ],
      cta: t('landing.automations.googleReviews.cta', 'See Your AI Visibility Score'),
      ctaLink: "/onboarding",
    },
    {
      id: "tiktok",
      title: t('landing.automations.tiktok.title', 'TikTok'),
      status: "available" as const,
      color: "from-black to-gray-800",
      bgColor: "bg-gray-50",
      borderColor: "border-gray-300",
      icon: Music2,
      features: [
        t('landing.automations.tiktok.feature1', 'Login Kit integration'),
        t('landing.automations.tiktok.feature2', 'Account connection'),
        t('landing.automations.tiktok.feature3', 'Coming soon: Inbox automation'),
      ],
      cta: t('landing.automations.tiktok.cta', 'Connect TikTok'),
      ctaLink: "/channels/tiktok",
    },
    {
      id: "whatsapp",
      title: t('landing.automations.whatsapp.title', 'WhatsApp'),
      status: "coming-soon" as const,
      color: "from-gray-400 to-gray-500",
      bgColor: "bg-gray-50",
      borderColor: "border-gray-200",
      icon: Phone,
      features: [
        t('landing.automations.whatsapp.feature1', 'Shared inbox'),
        t('landing.automations.whatsapp.feature2', 'Customer conversations'),
        t('landing.automations.whatsapp.feature3', 'Business messaging'),
      ],
      cta: t('landing.automations.whatsapp.cta', 'Notify Me'),
      ctaLink: "/automations/whatsapp",
    },
  ];

  const useCases = [
    {
      title: t('landing.useCases.instagram.title', 'Only Instagram Sales'),
      description: t('landing.useCases.instagram.description', 'Perfect for creators and e-commerce brands who sell through DMs'),
      icon: MessageSquare,
      color: "bg-purple-100 text-purple-700",
    },
    {
      title: t('landing.useCases.google.title', 'Google Reviews + AI Visibility'),
      description: t('landing.useCases.google.description', 'Boost your local search ranking with AI-powered review insights and visibility tracking'),
      icon: Eye,
      color: "bg-blue-100 text-blue-700",
    },
    {
      title: t('landing.useCases.multi.title', 'Full Visibility Stack'),
      description: t('landing.useCases.multi.description', 'Combine social engagement with AI visibility for maximum discoverability'),
      icon: TrendingUp,
      color: "bg-gradient-to-r from-purple-100 to-blue-100 text-primary",
    },
  ];

  const howItWorks = [
    {
      step: "1",
      title: t('landing.howItWorks.step1.title', 'Connect & Analyze'),
      description: t('landing.howItWorks.step1.description', 'Link your Google Business Profile. Our AI instantly calculates your Visibility Score.'),
      icon: Eye,
    },
    {
      step: "2",
      title: t('landing.howItWorks.step2.title', 'Get Smart Recommendations'),
      description: t('landing.howItWorks.step2.description', 'AI tells you which reviews to answer, when to respond, and how to optimize for search.'),
      icon: Sparkles,
    },
    {
      step: "3",
      title: t('landing.howItWorks.step3.title', 'Track Your Growth'),
      description: t('landing.howItWorks.step3.description', 'Monitor visibility metrics, sentiment trends, and review performance in real-time.'),
      icon: TrendingUp,
    },
  ];

  const earlyAccessPerks = [
    { icon: Zap, text: t('landing.earlyAccess.perk1', '3 ay tamamen ücretsiz kullanım') },
    { icon: Users, text: t('landing.earlyAccess.perk2', 'Kurucu ekiple birebir onboarding') },
    { icon: Star, text: t('landing.earlyAccess.perk3', 'Ömür boyu %50 indirimli fiyat garantisi') },
    { icon: Shield, text: t('landing.earlyAccess.perk4', 'Öncelikli destek ve özellik talepleri') },
  ];

  const getStatusBadge = (status: "available" | "early-access" | "coming-soon") => {
    switch (status) {
      case "available":
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <Check className="w-3 h-3 mr-1" />
            Available
          </span>
        );
      case "early-access":
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
            <Clock className="w-3 h-3 mr-1" />
            Early Access
          </span>
        );
      case "coming-soon":
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
            <Lock className="w-3 h-3 mr-1" />
            Coming Soon
          </span>
        );
    }
  };

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    element?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 border-b backdrop-blur-lg" style={{ backgroundColor: '#FFFFFF', borderBottomColor: '#E2E8F0' }}>
        <div className="container mx-auto px-6">
          <div className="flex h-20 items-center justify-between">
            {/* Logo - Left */}
            <button 
              onClick={() => navigate(user ? "/dashboard" : "/login")}
              className="flex items-center gap-2 pl-3 pt-1 hover:opacity-80 transition-opacity"
            >
              <img src={voyageRespondLogo} alt="VoyageRespond" className="h-7 w-7" />
              <span className="text-lg" style={{ color: '#1F2937', letterSpacing: '0.02em' }}>
                <span className="font-normal">Voyage</span>
                <span className="font-semibold">Respond</span>
              </span>
            </button>

            {/* Navigation Links - Center */}
            <div className="hidden md:flex items-center gap-8 absolute left-1/2 transform -translate-x-1/2">
              <button
                onClick={() => scrollToSection("automations")}
                className="text-base font-medium transition-colors"
                style={{ color: '#1F2937' }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#000000'}
                onMouseLeave={(e) => e.currentTarget.style.color = '#1F2937'}
              >
                {t('nav.automations', 'Automations')}
              </button>
              <button
                onClick={() => scrollToSection("pricing")}
                className="text-base font-medium transition-colors"
                style={{ color: '#1F2937' }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#000000'}
                onMouseLeave={(e) => e.currentTarget.style.color = '#1F2937'}
              >
                {t('nav.pricing')}
              </button>
              <button
                onClick={() => navigate("/hub")}
                className="text-base font-medium transition-colors"
                style={{ color: '#1F2937' }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#000000'}
                onMouseLeave={(e) => e.currentTarget.style.color = '#1F2937'}
              >
                {t('nav.hub', 'Hub')}
              </button>
              <button
                onClick={() => navigate(user ? "/dashboard" : "/login")}
                className="text-base font-medium transition-colors"
                style={{ color: '#1F2937' }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#000000'}
                onMouseLeave={(e) => e.currentTarget.style.color = '#1F2937'}
              >
                {user ? t('nav.dashboard') : t('nav.login')}
              </button>
              <button
                onClick={() => navigate("/contact")}
                className="text-base font-medium transition-colors"
                style={{ color: '#1F2937' }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#000000'}
                onMouseLeave={(e) => e.currentTarget.style.color = '#1F2937'}
              >
                {t('nav.contact', 'Contact')}
              </button>
              <button
                onClick={() => navigate("/about")}
                className="text-base font-medium transition-colors"
                style={{ color: '#1F2937' }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#000000'}
                onMouseLeave={(e) => e.currentTarget.style.color = '#1F2937'}
              >
                {t('about.badge', 'Hakkımızda')}
              </button>
            </div>

            {/* Language Switcher & CTA - Right */}
            <div className="hidden md:flex items-center gap-3">
              <LanguageSwitcher />
              <button 
                onClick={() => navigate("/onboarding")}
                className="px-5 py-2.5 rounded-md text-sm font-medium text-white transition-all duration-200 shadow-sm hover:shadow-md"
                style={{ backgroundColor: '#7A5AF8' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#6D28D9'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#7A5AF8'}
              >
                {t('nav.getStarted')}
              </button>
            </div>

            {/* Mobile Menu */}
            <div className="md:hidden flex items-center gap-2">
              <LanguageSwitcher />
              <button 
                onClick={() => navigate("/onboarding")}
                className="px-4 py-2 rounded-md text-sm font-medium text-white transition-all"
                style={{ backgroundColor: '#7A5AF8' }}
              >
                {t('nav.getStarted')}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section - AI Visibility Focused */}
      <section className="container mx-auto px-6 pt-32 pb-20 md:pt-40 md:pb-28 relative overflow-hidden">
        <div className="absolute inset-0 gradient-hero"></div>
        <div className="absolute inset-0 gradient-hero-overlay"></div>
        <div className="absolute inset-0 gradient-mesh"></div>
        <div className="text-center max-w-4xl mx-auto space-y-8 relative z-10">
          {/* AI Visibility Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium">
            <Sparkles className="w-4 h-4" />
            {t('landing.aiVisibilityBadge', 'Powered by AI Visibility Engine')}
          </div>
          
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-foreground leading-tight tracking-tight">
            {t('landing.heroLine1', 'Be Found by Google.')}<br />
            <span className="bg-gradient-to-r from-purple-600 via-primary to-blue-600 bg-clip-text text-transparent">
              {t('landing.heroLine2', 'Be Discovered by AI.')}
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed max-w-3xl mx-auto">
            {t('landing.heroSubtitle', 'AI-powered review management that boosts your visibility on Google Search and AI assistants.')}<br className="hidden md:block" />
            {t('landing.heroSubtitle2', 'Get your AI Visibility Score, smart reply suggestions, and real-time performance insights.')}
          </p>
          
          {/* Value Props Row */}
          <div className="flex flex-wrap items-center justify-center gap-6 pt-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-primary" />
              <span>{t('landing.valueProp1', 'AI Visibility Score')}</span>
            </div>
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-primary" />
              <span>{t('landing.valueProp2', 'Review Optimization')}</span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              <span>{t('landing.valueProp3', 'Performance Tracking')}</span>
            </div>
          </div>
          
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button 
              size="lg" 
              onClick={() => navigate("/onboarding")} 
              className="relative overflow-hidden gradient-primary text-white shadow-lg text-lg px-10 py-7 hover:shadow-2xl transition-all duration-300 hover:scale-105 group"
            >
              <span className="relative z-10">{t('landing.heroCta', 'See Your AI Visibility Score')}</span>
              <ArrowRight className="w-5 h-5 ml-2 relative z-10" />
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              onClick={() => scrollToSection("demo")} 
              className="text-lg px-10 py-7 hover:bg-muted transition-all duration-300"
            >
              {t('landing.tryDemo', 'Try AI Reply Demo')}
            </Button>
          </div>
        </div>
      </section>

       {/* Freemium CTA Section */}
       <section className="container mx-auto px-6 py-20 md:py-28">
         <div className="max-w-3xl mx-auto">
           <div className="relative overflow-hidden rounded-2xl border border-primary/10 bg-gradient-to-br from-primary/5 via-background to-background p-12 md:p-16 text-center">
             {/* Subtle gradient background */}
             <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/5 opacity-50"></div>
             
             <div className="relative z-10 space-y-6">
               <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium">
                 <Sparkles className="w-4 h-4" />
                 {t('landing.freemiumCta.badge', 'AI Visibility Engine')}
               </div>
               
               <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground leading-tight">
                 {t('landing.freemiumCta.title', 'How does your business look on AI?')}
               </h2>
               
               <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                 {t('landing.freemiumCta.subtitle', 'Discover your AI Visibility Score instantly. See how you rank on Google Search, AI assistants, and get smart recommendations to boost your online presence.')}
               </p>
               
               <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
                 <Button 
                   size="lg" 
                   onClick={() => navigate(user ? "/dashboard" : "/register")} 
                   className="relative overflow-hidden gradient-primary text-white shadow-lg text-base px-8 py-6 hover:shadow-2xl transition-all duration-300 hover:scale-105 group"
                 >
                   <span className="relative z-10">{t('landing.freemiumCta.cta', 'Check My AI Score - Free')}</span>
                   <ArrowRight className="w-4 h-4 ml-2 relative z-10" />
                   <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                 </Button>
                 <p className="text-sm text-muted-foreground">
                   {t('landing.freemiumCta.subtext', 'No credit card required')}
                 </p>
               </div>
             </div>
           </div>
         </div>
       </section>

       {/* Demo Teaser Section */}
       <section className="container mx-auto px-6 py-20">
         <div className="text-center mb-12">
           <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-4">
             <Sparkles className="w-4 h-4" />
             {t('landing.demoTeaser.badge', 'Ücretsiz Deneyin')}
           </div>
           <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
             {t('landing.demoTeaser.title', 'Tüm Özellikleri Ücretsiz Deneyin')}
           </h2>
           <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
             {t('landing.demoTeaser.subtitle', 'Kayıt olun ve platformun tüm interaktif demolarını keşfedin.')}
           </p>
         </div>

         <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
           {[
             { icon: Eye, title: t('landing.demoTeaser.cards.visibility', 'AI Visibility Skoru'), desc: t('landing.demoTeaser.cards.visibilityDesc', 'İşletmeniz yapay zekada nasıl görünüyor?') },
             { icon: MessageSquare, title: t('landing.demoTeaser.cards.aiReply', 'AI Yanıt Önerileri'), desc: t('landing.demoTeaser.cards.aiReplyDesc', 'Her yoruma profesyonel AI yanıtlar') },
             { icon: Target, title: t('landing.demoTeaser.cards.dashboard', 'Dashboard Araçları'), desc: t('landing.demoTeaser.cards.dashboardDesc', 'Sohbet, öncelik, rakip analizi') },
             { icon: Star, title: t('landing.demoTeaser.cards.storyKit', 'Story Kit'), desc: t('landing.demoTeaser.cards.storyKitDesc', 'Ücretsiz sosyal medya pazarlama') },
           ].map((card, i) => (
             <button
               key={i}
               onClick={() => navigate(user ? "/demo" : "/register?redirect=/demo")}
               className="p-6 rounded-xl border border-border bg-card hover:bg-muted/50 hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 text-left group"
             >
               <div className="p-2 rounded-lg bg-primary/10 w-fit mb-4">
                 <card.icon className="w-5 h-5 text-primary" />
               </div>
               <h3 className="font-semibold text-foreground mb-2">{card.title}</h3>
               <p className="text-sm text-muted-foreground mb-4">{card.desc}</p>
               <span className="text-sm font-medium text-primary group-hover:underline flex items-center gap-1">
                 {t('landing.demoTeaser.tryNow', 'Ücretsiz Dene')} <ArrowRight className="w-3 h-3" />
               </span>
             </button>
           ))}
         </div>
       </section>

      {/* Product Video Section */}
      <ProductVideo />

      {/* API Compliance Section */}
      <APIComplianceBanner />
      {/* Automation Options Grid */}
      <section id="automations" className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 gradient-features"></div>
        <div className="container mx-auto px-6 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              {t('landing.automationsTitle', 'Choose Your Automations')}
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {t('landing.automationsSubtitle', "Each channel is independent. Enable one, or combine multiple — it's your choice.")}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {automationOptions.map((option) => (
              <div
                key={option.id}
                className={`relative p-8 rounded-xl border ${option.borderColor} ${option.bgColor} transition-all duration-300 hover:shadow-xl hover:-translate-y-2 group ${
                  option.status === "coming-soon" ? "opacity-70" : ""
                }`}
              >
                <div className="flex items-start justify-between mb-6">
                  <div className={`p-3 rounded-xl bg-gradient-to-br ${option.color}`}>
                    <option.icon className="w-7 h-7 text-white" />
                  </div>
                  {getStatusBadge(option.status)}
                </div>
                
                <h3 className="text-2xl font-bold text-foreground mb-4">{option.title}</h3>
                
                <ul className="space-y-3 mb-8">
                  {option.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-3">
                      <Check className="w-5 h-5 text-primary flex-shrink-0" />
                      <span className="text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  className={`w-full ${
                    option.status === "coming-soon" 
                      ? "" 
                      : "gradient-primary text-white hover:opacity-90"
                  }`}
                  variant={option.status === "coming-soon" ? "outline" : "default"}
                  onClick={() => navigate(option.ctaLink)}
                  disabled={option.status === "coming-soon"}
                >
                  {option.cta}
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="container mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            {t('landing.useCasesTitle', 'Use one automation — or combine multiple channels')}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t('landing.useCasesSubtitle', "You're not buying a single product. You're choosing modules that fit your business.")}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {useCases.map((useCase, index) => (
            <div
              key={index}
              className="p-8 rounded-xl border border-border bg-card hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
            >
              <div className={`w-14 h-14 rounded-xl ${useCase.color} flex items-center justify-center mb-6`}>
                <useCase.icon className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">{useCase.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{useCase.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 gradient-features"></div>
        <div className="container mx-auto px-6 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              {t('landing.howItWorksTitle', 'How It Works')}
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {t('landing.howItWorksSubtitle', 'Get started in minutes, not days.')}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {howItWorks.map((step, index) => (
              <div key={index} className="text-center p-8">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                  <span className="text-2xl font-bold text-primary">{step.step}</span>
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3">{step.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Enterprise / Built for Scale Section */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-foreground/[0.03] to-transparent"></div>
        <div className="container mx-auto px-6 relative z-10">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold tracking-wide uppercase mb-4">
              <TrendingUp className="w-3.5 h-3.5" />
              {t('landing.enterprise.badge', 'Built for Scale')}
            </div>
            <h2 className="text-3xl md:text-5xl font-bold text-foreground leading-tight mb-4">
              {t('landing.enterprise.title', '30,000+ reviews?')}
              <br />
              <span className="bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                {t('landing.enterprise.titleHighlight', 'We handle it.')}
              </span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {t('landing.enterprise.subtitle', 'Shopping malls, hotel chains, and franchise networks trust VoyageRespond to manage thousands of reviews across multiple locations — automatically.')}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto mb-12">
            {[
              { icon: Target, value: '30K+', label: t('landing.enterprise.stat1', 'Reviews managed per location') },
              { icon: MessageSquare, value: '< 2min', label: t('landing.enterprise.stat2', 'Average response time') },
              { icon: Users, value: '50+', label: t('landing.enterprise.stat3', 'Locations from one dashboard') },
              { icon: Sparkles, value: '12+', label: t('landing.enterprise.stat4', 'Languages auto-detected') },
            ].map((stat, i) => (
              <div key={i} className="text-center p-6 rounded-xl bg-card border border-border hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-4">
                  <stat.icon className="w-6 h-6 text-primary" />
                </div>
                <div className="text-3xl font-bold text-foreground mb-1">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {[
              { icon: Eye, title: t('landing.enterprise.feature1Title', 'Multi-Location Dashboard'), desc: t('landing.enterprise.feature1Desc', 'Manage all branches from a single panel. Compare ratings, response rates, and sentiment across locations.') },
              { icon: Sparkles, title: t('landing.enterprise.feature2Title', 'Multilingual AI Replies'), desc: t('landing.enterprise.feature2Desc', 'Auto-detect review language and respond in Arabic, English, Russian, Hindi, and 8+ more languages.') },
              { icon: TrendingUp, title: t('landing.enterprise.feature3Title', 'Enterprise Analytics'), desc: t('landing.enterprise.feature3Desc', 'Track AI Visibility scores, review velocity, and competitor benchmarks across your entire portfolio.') },
            ].map((feature, i) => (
              <div key={i} className="p-6 rounded-xl border border-border bg-card hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <div className="p-2 rounded-lg bg-primary/10 w-fit mb-4">
                  <feature.icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Button 
              size="lg" 
              onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })} 
              className="gradient-primary text-white shadow-lg text-base px-10 py-7 hover:shadow-2xl transition-all duration-300 hover:scale-105"
            >
              {t('landing.enterprise.cta', 'Join Early Access')}
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </div>
      </section>

      {/* Early Access Section - YC Style */}
      <section id="pricing" className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 gradient-pricing"></div>
        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-3xl mx-auto">
            {/* Main Card */}
            <div className="relative rounded-2xl border border-primary/20 bg-card p-10 md:p-14 shadow-xl overflow-hidden">
              {/* Subtle gradient accent */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-purple-500 to-blue-500"></div>
              
              <div className="text-center space-y-6">
                {/* Badge */}
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold tracking-wide uppercase">
                  <Sparkles className="w-3.5 h-3.5" />
                  {t('landing.earlyAccess.badge', 'Early Access')}
                </div>

                {/* Title */}
                <h2 className="text-3xl md:text-4xl font-bold text-foreground leading-tight">
                  {t('landing.earlyAccess.title', 'İlk 100 işletmeye özel')}
                </h2>

                {/* Subtitle */}
                <p className="text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed">
                  {t('landing.earlyAccess.subtitle', '3 ay boyunca tüm özellikler ücretsiz. Kredi kartı gerekmez. İlk kullanıcılarımız ömür boyu özel fiyattan yararlanır.')}
                </p>

                {/* Perks Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 text-left max-w-lg mx-auto">
                  {earlyAccessPerks.map((perk, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                        <perk.icon className="w-4 h-4 text-primary" />
                      </div>
                      <span className="text-sm text-foreground font-medium">{perk.text}</span>
                    </div>
                  ))}
                </div>

                {/* CTA */}
                <div className="pt-6 space-y-4">
                  <Button 
                    size="lg" 
                    onClick={() => navigate("/register")} 
                    className="relative overflow-hidden gradient-primary text-white shadow-lg text-base px-10 py-7 hover:shadow-2xl transition-all duration-300 hover:scale-105 group w-full sm:w-auto"
                  >
                    <span className="relative z-10">{t('landing.earlyAccess.cta', '3 Ay Ücretsiz Başla')}</span>
                    <ArrowRight className="w-5 h-5 ml-2 relative z-10" />
                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                  </Button>
                  
                  <p className="text-xs text-muted-foreground">
                    {t('landing.earlyAccess.disclaimer', 'Kredi kartı gerekmez · 2 dakikada kurulum · İstediğiniz zaman iptal')}
                  </p>
                </div>

                {/* Social Proof Counter */}
                <div className="pt-6 border-t border-border">
                  <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <div className="flex -space-x-2">
                        {[...Array(4)].map((_, i) => (
                          <div key={i} className="w-7 h-7 rounded-full bg-gradient-to-br from-primary/30 to-primary/60 border-2 border-card flex items-center justify-center">
                            <Users className="w-3 h-3 text-primary-foreground" />
                          </div>
                        ))}
                      </div>
                      <span className="font-medium text-foreground">
                        {t('landing.earlyAccess.counter', '23 işletme katıldı')}
                      </span>
                    </div>
                    <div className="hidden sm:block w-px h-4 bg-border"></div>
                    <span className="hidden sm:block">
                      {t('landing.earlyAccess.spotsLeft', '77 kontenjan kaldı')}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* AI Visibility Value Section */}
      <section className="container mx-auto px-6 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
                {t('landing.whyAIVisibility', 'Why AI Visibility Matters')}
              </h3>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                {t('landing.whyAIVisibilityDesc', "Your reviews don't just influence customers — they train AI models. Google's AI Overviews, ChatGPT, and other AI assistants use your review content to recommend businesses. Our Reviewer AI Engine analyzes your reviews, suggests optimized responses, and tracks how your business appears in AI-powered search results.")}
              </p>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-muted-foreground">{t('landing.aiFeature1', 'AI Visibility Score: See how AI assistants perceive your business')}</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-muted-foreground">{t('landing.aiFeature2', 'Answer Optimization: Craft replies that boost search visibility')}</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-muted-foreground">{t('landing.aiFeature3', 'AI Recommendation Panel: Know which reviews to prioritize')}</span>
                </li>
              </ul>
            </div>
            <AIVisibilityDemo />
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <Testimonials />

      {/* Trust Badges & Security Section */}
      <TrustBadges />

      {/* Bottom CTA Section */}
      <section className="container mx-auto px-6 py-20">
        <div className="border border-primary/20 rounded-2xl p-12 md:p-16 text-center relative overflow-hidden shadow-2xl">
          <div className="absolute inset-0 gradient-hero opacity-80"></div>
          <div className="absolute inset-0 gradient-hero-overlay"></div>
          <div className="absolute inset-0 gradient-mesh opacity-20"></div>
          <div className="relative z-10">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              {t('landing.ctaTitle', 'Ready to boost your AI visibility?')}
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              {t('landing.ctaSubtitle', 'Get your free AI Visibility Score and see how your business appears to AI assistants.')}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button 
                size="lg" 
                onClick={() => navigate("/onboarding")} 
                className="relative overflow-hidden gradient-primary text-white shadow-lg text-lg px-10 hover:shadow-2xl transition-all duration-300 hover:scale-105 group"
              >
                <span className="relative z-10">{t('landing.heroCta', 'See Your AI Visibility Score')}</span>
                <ArrowRight className="w-5 h-5 ml-2 relative z-10" />
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                onClick={() => navigate("/automations/google-reviews")} 
                className="text-lg px-8 hover:bg-muted transition-all duration-300"
              >
                {t('landing.learnMore', 'Learn More')}
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card/50 backdrop-blur-sm mt-20">
        <div className="container mx-auto px-6 py-12">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <img src={voyageRespondLogo} alt="VoyageRespond" className="h-6 w-6" />
                <span className="font-semibold text-foreground">VoyageRespond</span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {t('footer.description', 'AI-powered review management & visibility optimization platform.')}
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-3">{t('footer.quickLinks', 'Hızlı Bağlantılar')}</h4>
              <div className="space-y-2">
                <button onClick={() => navigate("/pricing")} className="block text-sm text-muted-foreground hover:text-foreground transition-colors">{t('nav.pricing')}</button>
                <button onClick={() => navigate("/contact")} className="block text-sm text-muted-foreground hover:text-foreground transition-colors">{t('nav.contact', 'İletişim')}</button>
                <button onClick={() => navigate("/about")} className="block text-sm text-muted-foreground hover:text-foreground transition-colors">{t('about.badge', 'Hakkımızda')}</button>
                <button onClick={() => navigate("/hub")} className="block text-sm text-muted-foreground hover:text-foreground transition-colors">Hub</button>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-3">{t('footer.address', 'Adres')}</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Bilkent Cyberpark, Üniversiteler Mah.<br />
                Bilkent Blv., 06520 Çankaya<br />
                Ankara, Türkiye
              </p>
              <p className="text-sm text-muted-foreground mt-2">support@voyagerespond.com</p>
            </div>
          </div>
          <div className="border-t border-border pt-6 flex flex-col md:flex-row items-center justify-center gap-6 text-sm text-muted-foreground">
            <span>{t('footer.copyright')}</span>
            <span className="hidden md:block">•</span>
            <button onClick={() => navigate("/privacy-policy")} className="hover:text-foreground transition-colors">{t('footer.privacy')}</button>
            <span className="hidden md:block">•</span>
            <button onClick={() => navigate("/terms-of-service")} className="hover:text-foreground transition-colors">{t('footer.terms')}</button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;