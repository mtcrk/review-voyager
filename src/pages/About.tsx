import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import voyageRespondLogo from "@/assets/voyage-respond-logo.svg";
import { useAuth } from "@/contexts/AuthContext";
import { MapPin, Mail, Globe, Building2, Target, Users, Sparkles, ArrowRight } from "lucide-react";

export default function About() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 border-b backdrop-blur-lg bg-white" style={{ borderBottomColor: '#E2E8F0' }}>
        <div className="container mx-auto px-6">
          <div className="flex h-20 items-center justify-between">
            <button
              onClick={() => navigate("/")}
              className="flex items-center gap-2 pl-3 pt-1 hover:opacity-80 transition-opacity"
            >
              <img src={voyageRespondLogo} alt="VoyageRespond" className="h-7 w-7" />
              <span className="text-lg" style={{ color: '#1F2937', letterSpacing: '0.02em' }}>
                <span className="font-normal">Voyage</span>
                <span className="font-semibold">Respond</span>
              </span>
            </button>
            <div className="hidden md:flex items-center gap-8">
              <button onClick={() => navigate("/")} className="text-base font-medium text-foreground hover:text-primary transition-colors">
                {t('nav.home', 'Ana Sayfa')}
              </button>
              <button onClick={() => navigate("/#pricing")} className="text-base font-medium text-foreground hover:text-primary transition-colors">
                {t('landing.earlyAccess.badge', 'Erken Erişim')}
              </button>
              <button onClick={() => navigate("/contact")} className="text-base font-medium text-foreground hover:text-primary transition-colors">
                {t('nav.contact', 'İletişim')}
              </button>
            </div>
            <div className="flex items-center gap-3">
              <LanguageSwitcher />
              <Button onClick={() => navigate(user ? "/dashboard" : "/onboarding")} className="gradient-primary text-white">
                {t('nav.getStarted')}
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="container mx-auto px-6 pt-20 pb-16 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6">
          <Building2 className="w-4 h-4" />
          {t('about.badge', 'Hakkımızda')}
        </div>
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight mb-6">
          {t('about.title', 'Yapay Zeka ile İşletmelerin')}{' '}
          <span className="bg-gradient-to-r from-purple-600 via-primary to-blue-600 bg-clip-text text-transparent">
            {t('about.titleHighlight', 'Çevrimiçi İtibarını Yönetiyoruz')}
          </span>
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
          {t('about.subtitle', 'VoyageRespond, yapay zeka destekli yorum yönetimi ve itibar optimizasyonu ile işletmelerin çevrimiçi itibarını güçlendiren bir teknoloji platformudur. Google, Booking.com, TripAdvisor ve sosyal medya platformlarındaki yorumları tek noktadan yönetin.')}
        </p>
      </section>

      {/* Mission & Values */}
      <section className="container mx-auto px-6 py-16">
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="text-center p-8 rounded-2xl border border-border bg-card hover:shadow-lg transition-shadow">
            <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-5">
              <Target className="w-7 h-7 text-primary" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-3">
              {t('about.mission.title', 'Misyonumuz')}
            </h3>
            <p className="text-muted-foreground leading-relaxed">
              {t('about.mission.description', 'İşletmelerin çevrimiçi itibarını yapay zeka ile yönetmek ve güçlendirmek. Her yorum, markanızın dijital itibarını şekillendiren bir fırsattır.')}
            </p>
          </div>

          <div className="text-center p-8 rounded-2xl border border-border bg-card hover:shadow-lg transition-shadow">
            <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-5">
              <Sparkles className="w-7 h-7 text-primary" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-3">
              {t('about.vision.title', 'Vizyonumuz')}
            </h3>
            <p className="text-muted-foreground leading-relaxed">
              {t('about.vision.description', 'Her işletmenin çevrimiçi itibarını yapay zeka ile kolayca yönetebileceği, olumsuz yorumları fırsata çevirebileceği ve müşteri memnuniyetini artırabileceği bir dünya.')}
            </p>
          </div>

          <div className="text-center p-8 rounded-2xl border border-border bg-card hover:shadow-lg transition-shadow">
            <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-5">
              <Users className="w-7 h-7 text-primary" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-3">
              {t('about.values.title', 'Değerlerimiz')}
            </h3>
            <p className="text-muted-foreground leading-relaxed">
              {t('about.values.description', 'Şeffaflık, yenilikçilik ve müşteri odaklılık. Veriye dayalı kararlar ile işletmelerin büyümesine katkıda bulunuyoruz.')}
            </p>
          </div>
        </div>
      </section>

      {/* What We Do */}
      <section className="container mx-auto px-6 py-16">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground text-center mb-12">
            {t('about.whatWeDo.title', 'Ne Yapıyoruz?')}
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="p-6 rounded-xl border border-border bg-card">
              <h3 className="text-lg font-semibold text-foreground mb-2">🤖 AI Visibility Engine</h3>
              <p className="text-muted-foreground">
                {t('about.whatWeDo.aiVisibility', 'İşletmenizin Google arama ve yapay zeka asistanlarındaki görünürlüğünü ölçen ve optimize eden teknoloji.')}
              </p>
            </div>
            <div className="p-6 rounded-xl border border-border bg-card">
              <h3 className="text-lg font-semibold text-foreground mb-2">💬 Akıllı Yanıt Önerileri</h3>
              <p className="text-muted-foreground">
                {t('about.whatWeDo.smartReply', 'Yapay zeka destekli, markanızın tonuna uygun otomatik yorum yanıtı önerileri. Google, Booking, TripAdvisor ve Trustpilot desteği.')}
              </p>
            </div>
            <div className="p-6 rounded-xl border border-border bg-card">
              <h3 className="text-lg font-semibold text-foreground mb-2">📊 Performans Analitikleri</h3>
              <p className="text-muted-foreground">
                {t('about.whatWeDo.analytics', 'Duygu analizi, trend takibi ve rekabet karşılaştırması ile işletmenizin çevrimiçi itibarını anlık olarak izleyin.')}
              </p>
            </div>
            <div className="p-6 rounded-xl border border-border bg-card">
              <h3 className="text-lg font-semibold text-foreground mb-2">📱 Çoklu Platform</h3>
              <p className="text-muted-foreground">
                {t('about.whatWeDo.multiPlatform', 'Google, Instagram, TikTok, Booking.com, TripAdvisor ve daha fazla platformdan gelen yorumları tek bir panelden yönetin.')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-6 py-20">
        <div className="max-w-3xl mx-auto text-center rounded-2xl border border-primary/10 bg-gradient-to-br from-primary/5 via-background to-background p-12">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            {t('about.cta.title', 'İşletmenizi Büyütmeye Başlayın')}
          </h2>
          <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
            {t('about.cta.subtitle', 'AI Visibility Score\'unuzu ücretsiz öğrenin ve dijital görünürlüğünüzü artırın.')}
          </p>
          <Button
            size="lg"
            onClick={() => navigate("/onboarding")}
            className="gradient-primary text-white shadow-lg text-lg px-10 py-6 hover:shadow-2xl transition-all duration-300 hover:scale-105"
          >
            {t('landing.heroCta', 'See Your AI Visibility Score')}
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-12">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <img src={voyageRespondLogo} alt="VoyageRespond" className="h-6 w-6" />
                <span className="font-semibold text-foreground">VoyageRespond</span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                AI-powered review management & visibility optimization platform.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-3">{t('footer.quickLinks', 'Hızlı Bağlantılar')}</h4>
              <div className="space-y-2">
                <button onClick={() => navigate("/")} className="block text-sm text-muted-foreground hover:text-foreground transition-colors">{t('nav.home', 'Ana Sayfa')}</button>
                <button onClick={() => navigate("/#pricing")} className="block text-sm text-muted-foreground hover:text-foreground transition-colors">{t('landing.earlyAccess.badge', 'Erken Erişim')}</button>
                <button onClick={() => navigate("/contact")} className="block text-sm text-muted-foreground hover:text-foreground transition-colors">{t('nav.contact', 'İletişim')}</button>
                <button onClick={() => navigate("/about")} className="block text-sm text-muted-foreground hover:text-foreground transition-colors">{t('about.badge', 'Hakkımızda')}</button>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-3">{t('about.companyInfo.address', 'Adres')}</h4>
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
}
