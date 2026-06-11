import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Check, Star, MessageSquare, Eye, TrendingUp, Sparkles, Zap, Target, Shield, Users, Menu, X, Building2, UtensilsCrossed, Hotel, Stethoscope, Store, Dumbbell } from "lucide-react";
import { useState } from "react";
import voyageRespondLogo from "@/assets/voyage-respond-logo.svg";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslation } from 'react-i18next';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import SEO from "@/components/seo/SEO";
import { HeroReviewCarousel } from "@/components/landing/HeroReviewCarousel";

const Index = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useTranslation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#0A0A1A] overflow-x-hidden">
      <SEO
        title="VoyageRespond — AI Google Yorum Yönetimi"
        description="Google, Booking ve TripAdvisor yorumlarını yapay zeka ile yönetin. Otomatik yanıt önerileri, duygu analizi, AI görünürlük skoru. Ücretsiz kaydolun."
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
                text: "Evet, ücretsiz kaydolarak hemen kullanmaya başlayabilirsiniz. Erken erişim döneminde tüm özellikler ve sınırsız lokasyon dahildir.",
              },
            },
          ],
        }}
      />
      {/* Navbar — Clean, minimal */}
      <nav className="sticky top-0 z-50 border-b border-white/5 backdrop-blur-xl bg-[#0A0A1A]/70">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <button
              onClick={() => navigate("/")}
              className="flex items-center gap-2.5 hover:opacity-80 transition-opacity"
            >
              <img
                src={voyageRespondLogo}
                alt="VoyageRespond"
                className="h-7 w-7 brightness-0 invert"
              />
              <span className="text-base tracking-tight text-white">
                <span className="font-normal">Voyage</span>
                <span className="font-semibold">Respond</span>
              </span>
            </button>

            {/* Center Nav */}
            <div className="hidden md:flex items-center gap-8">
              <button
                onClick={() => document.getElementById("features")?.scrollIntoView({ behavior: "smooth" })}
                className="text-sm font-medium transition-colors text-white/70 hover:text-white"
              >
                {t('indexPage.nav.features')}
              </button>
              <button
                onClick={() => document.getElementById("pricing")?.scrollIntoView({ behavior: "smooth" })}
                className="text-sm font-medium transition-colors text-white/70 hover:text-white"
              >
                {t('indexPage.nav.pricing')}
              </button>
              <button
                onClick={() => navigate("/blog")}
                className="text-sm font-medium transition-colors text-white/70 hover:text-white"
              >
                {t('indexPage.nav.blog')}
              </button>
              <button
                onClick={() => navigate("/contact")}
                className="text-sm font-medium transition-colors text-white/70 hover:text-white"
              >
                {t('indexPage.nav.contact')}
              </button>
            </div>

            {/* Right Side */}
            <div className="hidden md:flex items-center gap-3">
              <LanguageSwitcher />
              <button
                onClick={() => navigate(user ? "/dashboard" : "/login")}
                className="text-sm font-medium transition-colors px-3 py-2 text-white/80 hover:text-white"
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
                className="p-2 text-white"
                aria-label={mobileMenuOpen ? "Menüyü kapat" : "Menüyü aç"}
                aria-expanded={mobileMenuOpen}
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Mobile Dropdown */}
          {mobileMenuOpen && (
            <div className="md:hidden border-t border-white/10 py-4 space-y-1">
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
                  className="block w-full text-left px-4 py-2.5 text-sm font-medium text-white/80 hover:bg-white/5 hover:text-white rounded-lg transition-colors"
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
      <section className="relative overflow-hidden -mt-16 pt-16 bg-[#0A0A1A]">
        {/* Deep gradient base */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 100% 80% at 50% 0%, #15152E 0%, #0A0A1A 60%, #08081A 100%)",
          }}
        />
        {/* Primary glow (top center) */}
        <div
          aria-hidden
          className="absolute left-1/2 -translate-x-1/2 top-[8%] w-[640px] h-[640px] rounded-full blur-[120px] opacity-50 pointer-events-none hidden sm:block"
          style={{ background: "radial-gradient(circle, rgba(122,90,248,0.45), transparent 65%)" }}
        />
        {/* Blue glow (bottom right) */}
        <div
          aria-hidden
          className="absolute right-[-10%] bottom-[10%] w-[520px] h-[520px] rounded-full blur-[120px] opacity-40 pointer-events-none hidden sm:block"
          style={{ background: "radial-gradient(circle, rgba(30,107,255,0.45), transparent 65%)" }}
        />
        {/* Grid overlay */}
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none opacity-[0.05]"
          style={{
            backgroundImage:
              "linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)",
            backgroundSize: "56px 56px",
            maskImage:
              "radial-gradient(ellipse 70% 60% at 50% 40%, black 40%, transparent 100%)",
            WebkitMaskImage:
              "radial-gradient(ellipse 70% 60% at 50% 40%, black 40%, transparent 100%)",
          }}
        />

        <div className="container mx-auto px-4 sm:px-6 pt-20 pb-16 md:pt-32 md:pb-24 relative z-10">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-white/90 text-xs font-medium backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-[#A78BFA]" />
              {t('indexPage.hero.badge')}
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-[1.1] tracking-tight">
              Google Yorumlarınızı{" "}
              <span
                className="bg-clip-text text-transparent"
                style={{
                  backgroundImage:
                    "linear-gradient(90deg, #A78BFA 0%, #7A5AF8 45%, #4F8BFF 100%)",
                }}
              >
                Yapay Zeka
              </span>{" "}
              ile Otomatik Yönetin
            </h1>

            {/* Subtitle */}
            <p className="text-lg md:text-xl text-white/70 leading-relaxed max-w-2xl mx-auto">
              VoyageRespond, Google, Booking, TripAdvisor ve birçok platformdaki müşteri yorumlarınızı tek bir panelde toplar. Yapay zeka her yoruma kişiselleştirilmiş yanıt üretir, duygu analizi yapar ve işletmenizin AI görünürlük skorunu takip eder.
            </p>

            {/* CTA Row */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <Button
                size="lg"
                onClick={() => navigate("/onboarding")}
                className="gradient-primary text-white text-base px-8 py-6 w-full sm:w-auto hover:scale-[1.02] transition-all duration-200 group"
                style={{ boxShadow: "0 10px 40px -10px rgba(122,90,248,0.7), 0 0 0 1px rgba(255,255,255,0.08) inset" }}
              >
                Ücretsiz Kaydolun
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-0.5 transition-transform" />
              </Button>
              <Button
                size="lg"
                onClick={() => navigate("/demo")}
                className="text-base px-8 py-6 w-full sm:w-auto bg-transparent border border-white/15 text-white hover:bg-white/5 hover:border-white/25 transition-all duration-200"
              >
                {t('indexPage.hero.ctaSecondary')}
              </Button>
            </div>

            {/* Trust line */}
            <p className="text-xs text-white/55 pt-1">
              {t('indexPage.hero.trust')}
            </p>
          </div>

          <HeroReviewCarousel />
        </div>
      </section>

      {/* ─── SOCIAL PROOF BAR — dark, sits inside hero atmosphere ─── */}
      <section className="relative bg-[#0A0A1A]">
        <div className="container mx-auto px-4 sm:px-6 py-8 md:py-10 relative z-10">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="flex items-center justify-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0">
                <Users className="w-5 h-5 text-[#A78BFA]" />
              </div>
              <div>
                <div className="text-2xl md:text-3xl font-bold text-white leading-tight">100+</div>
                <div className="text-xs md:text-sm text-white/60">{t('indexPage.socialProof.businesses')}</div>
              </div>
            </div>
            <div className="flex items-center justify-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0">
                <Star className="w-5 h-5 text-[#A78BFA]" />
              </div>
              <div>
                <div className="text-2xl md:text-3xl font-bold text-white leading-tight">50K+</div>
                <div className="text-xs md:text-sm text-white/60">{t('indexPage.socialProof.reviews')}</div>
              </div>
            </div>
            <div className="flex items-center justify-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0">
                <Zap className="w-5 h-5 text-[#A78BFA]" />
              </div>
              <div>
                <div className="text-2xl md:text-3xl font-bold text-white leading-tight">&lt; 2 dk</div>
                <div className="text-xs md:text-sm text-white/60">{t('indexPage.socialProof.avgResponse')}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── TRUST / LOGO STRIP ─── */}
      <section className="border-y border-white/5 bg-[#0D0D20]">
        <div className="container mx-auto px-4 sm:px-6 py-10 md:py-12">
          <p className="text-center text-xs uppercase tracking-wider text-white/50 font-medium mb-6">
            Türkiye ve dünyadan işletmeler VoyageRespond'a güveniyor
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-6 max-w-4xl mx-auto">
            {[
              { icon: Hotel, label: "Butik Otel" },
              { icon: UtensilsCrossed, label: "Restoran" },
              { icon: Stethoscope, label: "Klinik" },
              { icon: Building2, label: "Zincir İşletme" },
              { icon: Store, label: "Perakende" },
              { icon: Dumbbell, label: "Fitness" },
            ].map((item, i) => (
              <div
                key={i}
                className="flex items-center gap-2 text-white/40 hover:text-[#C4B5FD] transition-colors duration-200"
              >
                <item.icon className="w-5 h-5" />
                <span className="text-sm font-medium">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FEATURES ─── */}
      <section id="features" className="relative bg-[#0A0A1A] overflow-hidden">
        {/* Subtle ambient glow */}
        <div
          aria-hidden
          className="absolute left-[-10%] top-[20%] w-[480px] h-[480px] rounded-full blur-[120px] opacity-25 pointer-events-none hidden md:block"
          style={{ background: "radial-gradient(circle, rgba(122,90,248,0.5), transparent 65%)" }}
        />
        <div className="container mx-auto px-4 sm:px-6 py-20 md:py-28 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            {t('indexPage.featuresSection.title')}
          </h2>
          <p className="text-lg text-white/60 max-w-2xl mx-auto">
            {t('indexPage.featuresSection.subtitle')}
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {[
            {
              icon: MessageSquare,
              title: t('indexPage.featuresSection.aiReplyTitle'),
              desc: t('indexPage.featuresSection.aiReplyDesc'),
              visual: "ai-reply",
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
              visual: "platforms",
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
              className="group p-6 rounded-xl border border-white/10 bg-white/[0.03] backdrop-blur-md hover:border-white/20 hover:-translate-y-1 hover:shadow-[0_20px_50px_-20px_rgba(122,90,248,0.5)] transition-all duration-300"
            >
              <div className="w-14 h-14 rounded-xl bg-[#A78BFA]/10 border border-[#A78BFA]/15 flex items-center justify-center mb-5 group-hover:bg-[#A78BFA]/15 transition-colors">
                <feature.icon className="w-7 h-7 text-[#C4B5FD]" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
              <p className="text-sm text-white/65 leading-relaxed mb-4">{feature.desc}</p>

              {feature.visual === "ai-reply" && (
                <div className="mt-auto rounded-lg border border-[#A78BFA]/25 bg-[#A78BFA]/[0.06] p-3 space-y-2">
                  <div className="flex items-start gap-2">
                    <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-[8px] font-semibold text-white/70 flex-shrink-0">A</div>
                    <div className="text-[11px] text-white/70 leading-snug">Servis çok yavaştı...</div>
                  </div>
                  <div className="flex items-start gap-2 pl-3">
                    <Sparkles className="w-3 h-3 text-[#C4B5FD] flex-shrink-0 mt-0.5" />
                    <div className="text-[11px] text-white/90 leading-snug">Geri bildiriminiz için teşekkürler, hemen iletişime geçiyoruz...</div>
                  </div>
                </div>
              )}

              {feature.visual === "platforms" && (
                <div className="mt-auto rounded-lg border border-white/10 bg-white/[0.04] p-3">
                  <div className="flex items-center justify-around">
                    <div className="flex flex-col items-center gap-1">
                      <div className="w-7 h-7 rounded-md bg-white flex items-center justify-center text-[10px] font-bold text-[#4285F4]">G</div>
                      <span className="text-[9px] text-white/60">Google</span>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                      <div className="w-7 h-7 rounded-md bg-[#1E6BFF] flex items-center justify-center text-[10px] font-bold text-white">B</div>
                      <span className="text-[9px] text-white/60">Booking</span>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                      <div className="w-7 h-7 rounded-md bg-[#00AF87] flex items-center justify-center text-[10px] font-bold text-white">T</div>
                      <span className="text-[9px] text-white/60">Trip</span>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                      <div className="w-7 h-7 rounded-md bg-white flex items-center justify-center text-[10px] font-bold text-[#0A0A1A]">H</div>
                      <span className="text-[9px] text-white/60">Hotels</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
        </div>
      </section>

      {/* ─── PRICING / EARLY ACCESS ─── */}
      <section id="pricing" className="relative py-20 md:py-28 overflow-hidden bg-[#0D0D20]">
        {/* Ambient purple glow */}
        <div
          aria-hidden
          className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-[140px] opacity-30 pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(122,90,248,0.5), transparent 65%)" }}
        />
        <div className="container mx-auto px-4 sm:px-6 relative z-10">
          <div className="max-w-2xl mx-auto">
            <div
              className="rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-xl p-8 sm:p-12 relative overflow-hidden"
              style={{ boxShadow: "0 30px 80px -20px rgba(122,90,248,0.35), inset 0 1px 0 rgba(255,255,255,0.06)" }}
            >
              {/* Top accent */}
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#A78BFA]/60 to-transparent"></div>

              <div className="text-center space-y-6">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-white/90 text-xs font-medium backdrop-blur-md">
                  <Sparkles className="w-3.5 h-3.5 text-[#A78BFA]" />
                  {t('indexPage.pricingSection.badge')}
                </div>

                <h2 className="text-3xl md:text-4xl font-bold text-white">
                  {t('indexPage.pricingSection.title')}
                </h2>

                <p className="text-white/70 max-w-lg mx-auto leading-relaxed">
                  {t('indexPage.pricingSection.subtitle')}
                </p>

                {/* Perks */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left max-w-md mx-auto pt-2">
                  {[
                    t('indexPage.pricingSection.perk1'),
                    t('indexPage.pricingSection.perk2'),
                  ].map((perk, i) => (
                    <div key={i} className="flex items-center gap-2.5">
                      <Check className="w-4 h-4 text-green-300 flex-shrink-0" />
                      <span className="text-sm text-white/85">{perk}</span>
                    </div>
                  ))}
                </div>

                {/* CTA */}
                <div className="pt-4">
                  <Button
                    size="lg"
                    onClick={() => navigate("/register")}
                    className="gradient-primary text-white text-base px-10 py-6 hover:scale-[1.02] transition-all duration-200 group w-full sm:w-auto"
                    style={{ boxShadow: "0 10px 40px -10px rgba(122,90,248,0.7), 0 0 0 1px rgba(255,255,255,0.08) inset" }}
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
      <footer className="border-t border-white/5 bg-[#08081A]">
        <div className="container mx-auto px-4 sm:px-6 pt-10">
          <div className="max-w-4xl mx-auto p-6 rounded-xl bg-white/[0.03] border border-white/10">
            <h2 className="text-base font-semibold text-white/85 mb-4">Popüler Rehberler</h2>
            <ul className="grid sm:grid-cols-2 gap-2">
              <li><button onClick={() => navigate("/google-yorum-cevap-ornekleri")} className="text-sm text-white/70 hover:text-[#C4B5FD] hover:underline text-left transition-colors">Google Yorum Cevap Örnekleri (25 Şablon) →</button></li>
              <li><button onClick={() => navigate("/otel-yorum-cevaplari")} className="text-sm text-white/70 hover:text-[#C4B5FD] hover:underline text-left transition-colors">Otel Yorum Cevapları →</button></li>
              <li><button onClick={() => navigate("/restoran-yorum-cevaplari")} className="text-sm text-white/70 hover:text-[#C4B5FD] hover:underline text-left transition-colors">Restoran Yorum Cevapları →</button></li>
              <li><button onClick={() => navigate("/blog/google-yorumlarina-nasil-yanit-verilir")} className="text-sm text-white/70 hover:text-[#C4B5FD] hover:underline text-left transition-colors">Google Yorumlarına Nasıl Yanıt Verilir? →</button></li>
              <li><button onClick={() => navigate("/blog/ai-gorunurluk-skoru-nedir")} className="text-sm text-white/70 hover:text-[#C4B5FD] hover:underline text-left transition-colors">AI Görünürlük Skoru Nedir? →</button></li>
              <li><button onClick={() => navigate("/blog/kotu-yorumlara-nasil-cevap-verilir")} className="text-sm text-white/70 hover:text-[#C4B5FD] hover:underline text-left transition-colors">Kötü Yorumlara Nasıl Cevap Verilir? →</button></li>
            </ul>
          </div>
        </div>
        <div className="container mx-auto px-4 sm:px-6 py-10">
          <div className="grid sm:grid-cols-3 gap-8 mb-8">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <img src={voyageRespondLogo} alt="VoyageRespond" className="h-5 w-5 brightness-0 invert" />
                <span className="font-semibold text-white text-sm">VoyageRespond</span>
              </div>
              <p className="text-sm text-white/60 leading-relaxed mb-3">
                {t('indexPage.footerSection.tagline')}
              </p>
              <a
                href="https://www.instagram.com/voyagerespond"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex text-white/60 hover:text-white transition-colors"
                aria-label="Instagram"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
              </a>
            </div>

            {/* Links */}
            <div>
              <h4 className="font-medium text-white/80 text-sm mb-3">{t('indexPage.footerSection.links')}</h4>
              <div className="space-y-2">
                <button onClick={() => navigate("/about")} className="block text-sm text-white/60 hover:text-white transition-colors">{t('indexPage.footerSection.about')}</button>
                <button onClick={() => navigate("/blog")} className="block text-sm text-white/60 hover:text-white transition-colors">{t('indexPage.footerSection.blog')}</button>
                <button onClick={() => navigate("/contact")} className="block text-sm text-white/60 hover:text-white transition-colors">{t('indexPage.footerSection.contact')}</button>
                <button onClick={() => navigate("/hub")} className="block text-sm text-white/60 hover:text-white transition-colors">{t('indexPage.footerSection.hub')}</button>
              </div>
            </div>

            {/* Legal */}
            <div>
              <h4 className="font-medium text-white/80 text-sm mb-3">{t('indexPage.footerSection.legal')}</h4>
              <div className="space-y-2">
                <button onClick={() => navigate("/privacy-policy")} className="block text-sm text-white/60 hover:text-white transition-colors">{t('indexPage.footerSection.privacy')}</button>
                <button onClick={() => navigate("/terms-of-service")} className="block text-sm text-white/60 hover:text-white transition-colors">{t('indexPage.footerSection.terms')}</button>
                <p className="text-sm text-white/60 pt-1">support@voyagerespond.com</p>
              </div>
            </div>
          </div>

          <div className="border-t border-white/5 pt-6 text-center text-xs text-white/55">
            © {new Date().getFullYear()} VoyageRespond. {t('indexPage.footerSection.rights')}
          </div>

          {/* Verified on / 3rd party listings */}
          <div className="mt-6 pt-6 border-t border-white/5">
            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-xs text-white/60">
              <span className="uppercase tracking-wide text-[10px] font-medium text-white/50">Verified on</span>
              <a
                href="https://www.capterra.com/p/10042872/VoyageRespond/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-white/5 border border-white/10 hover:bg-white/10 hover:text-white transition-colors"
                aria-label="Verified on Capterra"
              >
                <span className="inline-flex items-center justify-center h-5 w-5 rounded bg-[#FF9D28] text-white text-[10px] font-bold">C</span>
                <span>Capterra</span>
              </a>
              <a
                href="https://www.getapp.com/customer-service-support-software/a/voyagerespond/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-white/5 border border-white/10 hover:bg-white/10 hover:text-white transition-colors"
                aria-label="Listed on GetApp"
              >
                <span className="inline-flex items-center justify-center h-5 w-5 rounded bg-[#FF6F4D] text-white text-[10px] font-bold">G</span>
                <span>GetApp</span>
              </a>
              <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-white/[0.03] border border-white/5 opacity-60" aria-label="G2 coming soon">
                <span className="inline-flex items-center justify-center h-5 w-5 rounded bg-white/10 text-white/70 text-[10px] font-bold">G2</span>
                <span>G2 (soon)</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-white/[0.03] border border-white/5 opacity-60" aria-label="Product Hunt coming soon">
                <span className="inline-flex items-center justify-center h-5 w-5 rounded bg-white/10 text-white/70 text-[10px] font-bold">PH</span>
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
