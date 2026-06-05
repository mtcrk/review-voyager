import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Check, Star, MessageSquare, Eye, TrendingUp, Sparkles, Zap, Target, Shield, Users, Menu, X } from "lucide-react";
import { useState } from "react";
import voyageRespondLogo from "@/assets/voyage-respond-logo.svg";
import demoPoster from "@/assets/voyagerespond-demo-poster.jpg";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslation } from 'react-i18next';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import SEO from "@/components/seo/SEO";

const Index = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useTranslation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <SEO
        title="VoyageRespond — AI Google Yorum Yönetimi"
        description="Google, Booking ve TripAdvisor yorumlarını yapay zeka ile yönetin. Otomatik yanıt önerileri, duygu analizi, AI görünürlük skoru. 3 ay ücretsiz deneyin."
        canonical="https://voyagerespond.com/"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: [
            {
              "@type": "Question",
              name: "Google yorumlarını yapay zeka ile nasıl yönetebilirim?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "VoyageRespond, Google Business Profile'ınızı bağladıktan sonra tüm yorumlarınızı otomatik olarak çeker. Yapay zeka her yorum için duygu analizi yapar, akıllı yanıt önerileri sunar ve tek tıkla yanıt göndermenizi sağlar.",
              },
            },
            {
              "@type": "Question",
              name: "AI Visibility Score nedir?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "AI Visibility Score, işletmenizin ChatGPT, Google Gemini ve diğer yapay zeka asistanlarında ne kadar görünür olduğunu ölçen bir metriktir. Yorumlarınız, puanlarınız ve online varlığınız analiz edilerek 0-100 arasında bir skor hesaplanır.",
              },
            },
            {
              "@type": "Question",
              name: "Hangi platformlardan yorum çekiliyor?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "VoyageRespond; Google, Booking.com, TripAdvisor ve Hotels.com platformlarından yorumları otomatik olarak çeker ve tek bir panelde yönetmenizi sağlar.",
              },
            },
            {
              "@type": "Question",
              name: "VoyageRespond ücretsiz mi?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Evet, VoyageRespond erken erişim döneminde 3 ay boyunca tüm özellikler ve sınırsız lokasyon ile tamamen ücretsizdir.",
              },
            },
          ],
        }}
      />
      {/* Navbar — Clean, minimal */}
      <nav className="sticky top-0 z-50 border-b border-border/60 backdrop-blur-xl bg-background/80">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <button
              onClick={() => navigate("/")}
              className="flex items-center gap-2.5 hover:opacity-80 transition-opacity"
            >
              <img src={voyageRespondLogo} alt="VoyageRespond" className="h-7 w-7" />
              <span className="text-base tracking-tight text-foreground">
                <span className="font-normal">Voyage</span>
                <span className="font-semibold">Respond</span>
              </span>
            </button>

            {/* Center Nav */}
            <div className="hidden md:flex items-center gap-8">
              <button
                onClick={() => document.getElementById("features")?.scrollIntoView({ behavior: "smooth" })}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                {t('indexPage.nav.features')}
              </button>
              <button
                onClick={() => document.getElementById("pricing")?.scrollIntoView({ behavior: "smooth" })}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                {t('indexPage.nav.pricing')}
              </button>
              <button
                onClick={() => navigate("/blog")}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                {t('indexPage.nav.blog')}
              </button>
              <button
                onClick={() => navigate("/contact")}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                {t('indexPage.nav.contact')}
              </button>
            </div>

            {/* Right Side */}
            <div className="hidden md:flex items-center gap-3">
              <LanguageSwitcher />
              <button
                onClick={() => navigate(user ? "/dashboard" : "/login")}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-3 py-2"
              >
                {user ? t('indexPage.nav.dashboard') : t('indexPage.nav.login')}
              </button>
              <Button
                onClick={() => navigate("/onboarding")}
                className="gradient-primary text-white text-sm px-5 py-2 h-9 hover:shadow-lg transition-all duration-200"
              >
                {t('indexPage.nav.startFree')}
              </Button>
            </div>

            {/* Mobile Menu */}
            <div className="md:hidden flex items-center gap-2">
              <LanguageSwitcher />
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 text-foreground"
                aria-label={mobileMenuOpen ? "Menüyü kapat" : "Menüyü aç"}
                aria-expanded={mobileMenuOpen}
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Mobile Dropdown */}
          {mobileMenuOpen && (
            <div className="md:hidden border-t border-border py-4 space-y-1">
              {[
                { label: t('indexPage.nav.features'), action: () => { document.getElementById("features")?.scrollIntoView({ behavior: "smooth" }); setMobileMenuOpen(false); } },
                { label: t('indexPage.nav.pricing'), action: () => { document.getElementById("pricing")?.scrollIntoView({ behavior: "smooth" }); setMobileMenuOpen(false); } },
                { label: t('indexPage.nav.blog'), action: () => { navigate("/blog"); setMobileMenuOpen(false); } },
                { label: t('indexPage.nav.contact'), action: () => { navigate("/contact"); setMobileMenuOpen(false); } },
                { label: user ? t('indexPage.nav.dashboard') : t('indexPage.nav.login'), action: () => { navigate(user ? "/dashboard" : "/login"); setMobileMenuOpen(false); } },
              ].map((item) => (
                <button
                  key={item.label}
                  onClick={item.action}
                  className="block w-full text-left px-4 py-2.5 text-sm font-medium text-foreground hover:bg-muted rounded-lg transition-colors"
                >
                  {item.label}
                </button>
              ))}
              <div className="px-4 pt-2">
                <Button
                  onClick={() => { navigate("/onboarding"); setMobileMenuOpen(false); }}
                  className="w-full gradient-primary text-white"
                >
                  {t('indexPage.nav.startFree')}
                </Button>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* ─── HERO ─── */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 gradient-hero"></div>
        <div className="absolute inset-0 gradient-mesh"></div>

        <div className="container mx-auto px-4 sm:px-6 pt-20 pb-16 md:pt-32 md:pb-24 relative z-10">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/8 border border-primary/15 text-primary text-xs font-medium">
              <Sparkles className="w-3.5 h-3.5" />
              {t('indexPage.hero.badge')}
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-foreground leading-[1.1] tracking-tight">
              Google Yorumlarınızı{" "}
              <span className="bg-gradient-to-r from-primary to-purple-700 bg-clip-text text-transparent">
                Yapay Zeka ile Otomatik Yönetin
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto">
              VoyageRespond, Google, Booking, TripAdvisor ve 80+ platformdaki müşteri yorumlarınızı tek bir panelde toplar. Yapay zeka her yoruma kişiselleştirilmiş yanıt üretir, duygu analizi yapar ve işletmenizin AI görünürlük skorunu takip eder.
            </p>

            {/* CTA Row */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <Button
                size="lg"
                onClick={() => navigate("/onboarding")}
                className="gradient-primary text-white shadow-lg text-base px-8 py-6 w-full sm:w-auto hover:shadow-xl hover:scale-[1.02] transition-all duration-200 group"
              >
                3 Ay Ücretsiz Deneyin
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-0.5 transition-transform" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => navigate("/demo")}
                className="text-base px-8 py-6 w-full sm:w-auto border-border hover:bg-muted/50 transition-all duration-200"
              >
                {t('indexPage.hero.ctaSecondary')}
              </Button>
            </div>

            {/* Trust line */}
            <p className="text-xs text-muted-foreground pt-1">
              {t('indexPage.hero.trust')}
            </p>
          </div>

          {/* Product Screenshot */}
          <div className="mt-16 max-w-4xl mx-auto">
            <div className="relative rounded-xl overflow-hidden border border-border/60 shadow-2xl shadow-primary/5 bg-card">
              {/* Browser chrome bar */}
              <div className="flex items-center gap-2 px-4 py-3 border-b border-border/40 bg-muted/30">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-400/70"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-400/70"></div>
                  <div className="w-3 h-3 rounded-full bg-green-400/70"></div>
                </div>
                <div className="flex-1 mx-4">
                  <div className="h-6 rounded-md bg-muted/60 max-w-xs mx-auto flex items-center justify-center">
                    <span className="text-[10px] text-muted-foreground font-mono">voyagerespond.com/dashboard</span>
                  </div>
                </div>
              </div>
              <img
                src={demoPoster}
                alt={t('indexPage.hero.screenshotAlt')}
                className="w-full h-auto block"
                width={1280}
                height={800}
                fetchPriority="high"
                decoding="async"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ─── SOCIAL PROOF BAR ─── */}
      <section className="border-y border-border/40 bg-muted/20">
        <div className="container mx-auto px-4 sm:px-6 py-6">
          <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-3 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-primary" />
              <span><strong className="text-foreground">100+</strong> {t('indexPage.socialProof.businesses')}</span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-primary" />
              <span><strong className="text-foreground">50K+</strong> {t('indexPage.socialProof.reviews')}</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-primary" />
              <span>{t('indexPage.socialProof.avgResponse')} <strong className="text-foreground">&lt; 2 dk</strong></span>
            </div>
          </div>
        </div>
      </section>

      {/* ─── FEATURES ─── */}
      <section id="features" className="container mx-auto px-4 sm:px-6 py-20 md:py-28">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            {t('indexPage.featuresSection.title')}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t('indexPage.featuresSection.subtitle')}
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {[
            {
              icon: MessageSquare,
              title: t('indexPage.featuresSection.aiReplyTitle'),
              desc: t('indexPage.featuresSection.aiReplyDesc'),
            },
            {
              icon: Eye,
              title: t('indexPage.featuresSection.visibilityTitle'),
              desc: t('indexPage.featuresSection.visibilityDesc'),
            },
            {
              icon: Star,
              title: t('indexPage.featuresSection.centralTitle'),
              desc: t('indexPage.featuresSection.centralDesc'),
            },
            {
              icon: TrendingUp,
              title: t('indexPage.featuresSection.sentimentTitle'),
              desc: t('indexPage.featuresSection.sentimentDesc'),
            },
            {
              icon: Target,
              title: t('indexPage.featuresSection.multiLocTitle'),
              desc: t('indexPage.featuresSection.multiLocDesc'),
            },
            {
              icon: Shield,
              title: t('indexPage.featuresSection.competitorTitle'),
              desc: t('indexPage.featuresSection.competitorDesc'),
            },
          ].map((feature, i) => (
            <div
              key={i}
              className="group p-6 rounded-xl border border-border bg-card hover:border-primary/20 hover:shadow-lg transition-all duration-300"
            >
              <div className="w-10 h-10 rounded-lg bg-primary/8 flex items-center justify-center mb-4 group-hover:bg-primary/12 transition-colors">
                <feature.icon className="w-5 h-5 text-primary" />
              </div>
              <h3 className="text-base font-semibold text-foreground mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── PRICING / EARLY ACCESS ─── */}
      <section id="pricing" className="relative py-20 md:py-28 overflow-hidden">
        <div className="absolute inset-0 gradient-pricing"></div>
        <div className="container mx-auto px-4 sm:px-6 relative z-10">
          <div className="max-w-2xl mx-auto">
            <div className="rounded-2xl border border-primary/15 bg-card p-8 sm:p-12 shadow-xl relative overflow-hidden">
              {/* Top accent */}
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent"></div>

              <div className="text-center space-y-6">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/8 border border-primary/15 text-primary text-xs font-medium">
                  <Sparkles className="w-3.5 h-3.5" />
                  {t('indexPage.pricingSection.badge')}
                </div>

                <h2 className="text-3xl md:text-4xl font-bold text-foreground">
                  {t('indexPage.pricingSection.title')}
                </h2>

                <p className="text-muted-foreground max-w-lg mx-auto leading-relaxed">
                  {t('indexPage.pricingSection.subtitle')}
                </p>

                {/* Perks */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left max-w-md mx-auto pt-2">
                  {[
                    t('indexPage.pricingSection.perk1'),
                    t('indexPage.pricingSection.perk2'),
                  ].map((perk, i) => (
                    <div key={i} className="flex items-center gap-2.5">
                      <Check className="w-4 h-4 text-primary flex-shrink-0" />
                      <span className="text-sm text-foreground">{perk}</span>
                    </div>
                  ))}
                </div>

                {/* CTA */}
                <div className="pt-4">
                  <Button
                    size="lg"
                    onClick={() => navigate("/register")}
                    className="gradient-primary text-white shadow-lg text-base px-10 py-6 hover:shadow-xl hover:scale-[1.02] transition-all duration-200 group w-full sm:w-auto"
                  >
                    {t('indexPage.pricingSection.cta')}
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-0.5 transition-transform" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="border-t border-border bg-card/50">
        <div className="container mx-auto px-4 sm:px-6 pt-10">
          <div className="max-w-4xl mx-auto p-6 rounded-xl bg-muted/40 border border-border">
            <h2 className="text-base font-semibold text-foreground mb-4">Popüler Rehberler</h2>
            <ul className="grid sm:grid-cols-2 gap-2">
              <li><button onClick={() => navigate("/google-yorum-cevap-ornekleri")} className="text-sm text-primary hover:underline text-left">Google Yorum Cevap Örnekleri (25 Şablon) →</button></li>
              <li><button onClick={() => navigate("/otel-yorum-cevaplari")} className="text-sm text-primary hover:underline text-left">Otel Yorum Cevapları →</button></li>
              <li><button onClick={() => navigate("/restoran-yorum-cevaplari")} className="text-sm text-primary hover:underline text-left">Restoran Yorum Cevapları →</button></li>
              <li><button onClick={() => navigate("/blog/google-yorumlarina-nasil-yanit-verilir")} className="text-sm text-primary hover:underline text-left">Google Yorumlarına Nasıl Yanıt Verilir? →</button></li>
              <li><button onClick={() => navigate("/blog/ai-gorunurluk-skoru-nedir")} className="text-sm text-primary hover:underline text-left">AI Görünürlük Skoru Nedir? →</button></li>
              <li><button onClick={() => navigate("/blog/kotu-yorumlara-nasil-cevap-verilir")} className="text-sm text-primary hover:underline text-left">Kötü Yorumlara Nasıl Cevap Verilir? →</button></li>
            </ul>
          </div>
        </div>
        <div className="container mx-auto px-4 sm:px-6 py-10">
          <div className="grid sm:grid-cols-3 gap-8 mb-8">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <img src={voyageRespondLogo} alt="VoyageRespond" className="h-5 w-5" />
                <span className="font-semibold text-foreground text-sm">VoyageRespond</span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                {t('indexPage.footerSection.tagline')}
              </p>
              <a
                href="https://www.instagram.com/voyagerespond"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Instagram"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
              </a>
            </div>

            {/* Links */}
            <div>
              <h4 className="font-medium text-foreground text-sm mb-3">{t('indexPage.footerSection.links')}</h4>
              <div className="space-y-2">
                <button onClick={() => navigate("/about")} className="block text-sm text-muted-foreground hover:text-foreground transition-colors">{t('indexPage.footerSection.about')}</button>
                <button onClick={() => navigate("/blog")} className="block text-sm text-muted-foreground hover:text-foreground transition-colors">{t('indexPage.footerSection.blog')}</button>
                <button onClick={() => navigate("/contact")} className="block text-sm text-muted-foreground hover:text-foreground transition-colors">{t('indexPage.footerSection.contact')}</button>
                <button onClick={() => navigate("/hub")} className="block text-sm text-muted-foreground hover:text-foreground transition-colors">{t('indexPage.footerSection.hub')}</button>
              </div>
            </div>

            {/* Legal */}
            <div>
              <h4 className="font-medium text-foreground text-sm mb-3">{t('indexPage.footerSection.legal')}</h4>
              <div className="space-y-2">
                <button onClick={() => navigate("/privacy-policy")} className="block text-sm text-muted-foreground hover:text-foreground transition-colors">{t('indexPage.footerSection.privacy')}</button>
                <button onClick={() => navigate("/terms-of-service")} className="block text-sm text-muted-foreground hover:text-foreground transition-colors">{t('indexPage.footerSection.terms')}</button>
                <p className="text-sm text-muted-foreground pt-1">support@voyagerespond.com</p>
              </div>
            </div>
          </div>

          <div className="border-t border-border pt-6 text-center text-xs text-muted-foreground">
            © {new Date().getFullYear()} VoyageRespond. {t('indexPage.footerSection.rights')}
          </div>

          {/* Verified on / 3rd party listings */}
          <div className="mt-6 pt-6 border-t border-border">
            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-xs text-muted-foreground">
              <span className="uppercase tracking-wide text-[10px] font-medium">Verified on</span>
              <a
                href="https://www.capterra.com/p/10042872/VoyageRespond/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 hover:text-foreground transition-colors"
                aria-label="Verified on Capterra"
              >
                <span className="inline-flex items-center justify-center h-5 w-5 rounded bg-[#FF9D28] text-white text-[10px] font-bold">C</span>
                <span>Capterra</span>
              </a>
              <a
                href="https://www.getapp.com/customer-service-support-software/a/voyagerespond/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 hover:text-foreground transition-colors"
                aria-label="Listed on GetApp"
              >
                <span className="inline-flex items-center justify-center h-5 w-5 rounded bg-[#FF6F4D] text-white text-[10px] font-bold">G</span>
                <span>GetApp</span>
              </a>
              <span className="inline-flex items-center gap-1.5 opacity-50" aria-label="G2 coming soon">
                <span className="inline-flex items-center justify-center h-5 w-5 rounded bg-muted text-muted-foreground text-[10px] font-bold">G2</span>
                <span>G2 (soon)</span>
              </span>
              <span className="inline-flex items-center gap-1.5 opacity-50" aria-label="Product Hunt coming soon">
                <span className="inline-flex items-center justify-center h-5 w-5 rounded bg-muted text-muted-foreground text-[10px] font-bold">PH</span>
                <span>Product Hunt (soon)</span>
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
