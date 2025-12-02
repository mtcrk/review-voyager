import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { MessageSquare, Zap, BarChart3, Check } from "lucide-react";
import voyageRespondLogo from "@/assets/voyage-respond-logo.svg";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslation } from 'react-i18next';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';

const Index = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useTranslation();
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");

  const features = [
    {
      icon: MessageSquare,
      title: t('features.smartManagement.title'),
      description: t('features.smartManagement.description'),
    },
    {
      icon: Zap,
      title: t('features.aiPowered.title'),
      description: t('features.aiPowered.description'),
    },
    {
      icon: BarChart3,
      title: t('features.deepAnalytics.title'),
      description: t('features.deepAnalytics.description'),
    },
  ];

  const pricingPlans = [
    {
      name: t('pricing.starter.name'),
      price: billingCycle === "monthly" ? 19 : 15,
      description: t('pricing.starter.description'),
      features: [
        t('pricing.starter.features.locations'),
        t('pricing.starter.features.reviews'),
        t('pricing.starter.features.dashboard'),
        t('pricing.starter.features.aiGeneration'),
        t('pricing.starter.features.manual'),
      ],
      highlighted: false,
    },
    {
      name: t('pricing.pro.name'),
      price: billingCycle === "monthly" ? 49 : 39,
      description: t('pricing.pro.description'),
      features: [
        t('pricing.pro.features.locations'),
        t('pricing.pro.features.reviews'),
        t('pricing.pro.features.autoReply'),
        t('pricing.pro.features.googleApi'),
        t('pricing.pro.features.support'),
      ],
      highlighted: true,
    },
    {
      name: t('pricing.agency.name'),
      price: billingCycle === "monthly" ? 99 : 79,
      description: t('pricing.agency.description'),
      features: [
        t('pricing.agency.features.locations'),
        t('pricing.agency.features.team'),
        t('pricing.agency.features.analytics'),
        t('pricing.agency.features.whitelabel'),
        t('pricing.agency.features.customSupport'),
      ],
      highlighted: false,
    },
  ];

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
                onClick={() => scrollToSection("features")}
                className="text-base font-medium transition-colors"
                style={{ color: '#1F2937' }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#000000'}
                onMouseLeave={(e) => e.currentTarget.style.color = '#1F2937'}
              >
                {t('nav.features')}
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
              <a
                href="#"
                className="text-base font-medium transition-colors"
                style={{ color: '#1F2937' }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#000000'}
                onMouseLeave={(e) => e.currentTarget.style.color = '#1F2937'}
              >
                {t('nav.documentation')}
              </a>
              <button
                onClick={() => navigate(user ? "/dashboard" : "/login")}
                className="text-base font-medium transition-colors"
                style={{ color: '#1F2937' }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#000000'}
                onMouseLeave={(e) => e.currentTarget.style.color = '#1F2937'}
              >
                {user ? t('nav.dashboard') : t('nav.login')}
              </button>
            </div>

            {/* Language Switcher & CTA - Right */}
            <div className="hidden md:flex items-center gap-3">
              <LanguageSwitcher />
              <button 
                onClick={() => navigate("/register")}
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
                onClick={() => navigate("/register")}
                className="px-4 py-2 rounded-md text-sm font-medium text-white transition-all"
                style={{ backgroundColor: '#7A5AF8' }}
              >
                {t('nav.getStarted')}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-6 pt-40 pb-36 md:pt-44 md:pb-40 relative overflow-hidden">
        <div className="absolute inset-0 gradient-hero"></div>
        <div className="absolute inset-0 gradient-hero-overlay"></div>
        <div className="absolute inset-0 gradient-mesh"></div>
        <div className="text-center max-w-3xl mx-auto space-y-10 relative z-10">
          <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold text-foreground leading-tight tracking-tight">
            {t('hero.title')}
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed">
            {t('hero.subtitle')}
          </p>
          <div className="pt-6">
            <Button 
              size="lg" 
              onClick={() => navigate("/register")} 
              className="relative overflow-hidden gradient-primary text-white shadow-lg text-lg px-12 py-7 hover:shadow-2xl transition-all duration-300 hover:scale-105 group"
            >
              <span className="relative z-10">{t('hero.cta')}</span>
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 gradient-features"></div>
        <div className="container mx-auto px-6 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            {t('features.title')}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t('features.subtitle')}
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="relative p-8 rounded-xl border border-border bg-card shadow-card hover:shadow-xl transition-all duration-300 hover:-translate-y-2 group overflow-hidden"
            >
              <div className="absolute inset-0 gradient-card opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-10">
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <feature.icon className="h-7 w-7 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 gradient-pricing"></div>
        <div className="container mx-auto px-6 relative z-10">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            {t('pricing.title')}
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            {t('pricing.subtitle')}
          </p>
          
          {/* Billing Toggle */}
          <div className="inline-flex items-center gap-3 p-1 bg-secondary rounded-lg">
            <button
              onClick={() => setBillingCycle("monthly")}
              className={`px-6 py-2 rounded-md text-sm font-medium transition-smooth ${
                billingCycle === "monthly"
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t('pricing.monthly')}
            </button>
            <button
              onClick={() => setBillingCycle("yearly")}
              className={`px-6 py-2 rounded-md text-sm font-medium transition-smooth ${
                billingCycle === "yearly"
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t('pricing.yearly')} <span className="text-primary ml-1">{t('pricing.yearlyDiscount')}</span>
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {pricingPlans.map((plan, index) => (
            <div
              key={index}
              className={`relative p-8 rounded-xl border bg-card transition-all duration-300 hover:-translate-y-1 ${
                plan.highlighted
                  ? "border-primary shadow-xl scale-105 gradient-card"
                  : "border-border shadow-card hover:shadow-lg"
              }`}
            >
              {plan.highlighted && (
                <div className="inline-block px-3 py-1 mb-4 text-xs font-semibold text-white gradient-primary rounded-full shadow-md">
                  {t('pricing.popular')}
                </div>
              )}
              <h3 className="text-2xl font-bold text-foreground mb-2">{plan.name}</h3>
              <p className="text-sm text-muted-foreground mb-6">{plan.description}</p>
              <div className="mb-6">
                <span className="text-4xl font-bold text-foreground">${plan.price}</span>
                <span className="text-muted-foreground">{t('pricing.perMonth')}</span>
              </div>
              <Button
                className={`w-full mb-6 ${plan.highlighted ? 'gradient-primary hover:opacity-90 text-white shadow-md' : ''}`}
                variant={plan.highlighted ? "default" : "outline"}
                onClick={() => navigate("/dashboard")}
              >
                {t('nav.getStarted')}
              </Button>
              <ul className="space-y-3">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-muted-foreground">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        </div>
      </section>

      {/* Bottom CTA Section */}
      <section className="container mx-auto px-6 py-20">
        <div className="border border-primary/20 rounded-2xl p-12 md:p-16 text-center relative overflow-hidden shadow-2xl">
          <div className="absolute inset-0 gradient-hero opacity-80"></div>
          <div className="absolute inset-0 gradient-hero-overlay"></div>
          <div className="absolute inset-0 gradient-mesh opacity-20"></div>
          <div className="relative z-10">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              {t('cta.title')}
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              {t('cta.subtitle')}
            </p>
            <Button 
              size="lg" 
              onClick={() => navigate("/register")} 
              className="relative overflow-hidden gradient-primary text-white shadow-lg text-lg px-10 hover:shadow-2xl transition-all duration-300 hover:scale-105 group"
            >
              <span className="relative z-10">{t('cta.button')}</span>
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card/50 backdrop-blur-sm mt-20">
        <div className="container mx-auto px-6 py-12">
          <div className="flex flex-col md:flex-row items-center justify-center gap-6 text-sm text-muted-foreground">
            <span>{t('footer.copyright')}</span>
            <span className="hidden md:block">•</span>
            <button onClick={() => navigate("/privacy-policy")} className="hover:text-foreground transition-colors">{t('footer.privacy')}</button>
            <span className="hidden md:block">•</span>
            <button onClick={() => navigate("/terms-of-service")} className="hover:text-foreground transition-colors">{t('footer.terms')}</button>
            <span className="hidden md:block">•</span>
            <a href="#" className="hover:text-foreground transition-colors">{t('footer.contact')}</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
