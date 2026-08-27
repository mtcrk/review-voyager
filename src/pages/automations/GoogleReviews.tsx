import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Star,
  ArrowRight,
  Check,
  Zap,
  Shield,
  BarChart3,
  Eye,
  Globe,
  Sparkles,
  Building2,
} from "lucide-react";
import voyageRespondLogo from "@/assets/voyage-respond-logo.svg";

const GoogleReviews = () => {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    document.title = "Google Yorum Yönetimi | AI ile Akıllı Yanıt ve Analiz - VoyageRespond";
    const meta = document.querySelector('meta[name="description"]');
    if (meta) {
      meta.setAttribute("content", "Google yorumlarınızı yapay zeka ile yönetin. AI destekli akıllı yanıt önerileri, duygu analizi, rakip karşılaştırma ve AI Visibility Score. Otel ve restoranlar için #1 yorum yönetim platformu.");
    }
  }, []);

  const features = [
    {
      icon: Zap,
      title: "AI Destekli Akıllı Yanıtlar",
      description: "Her yorum için kişiselleştirilmiş, markanıza uygun profesyonel yanıt önerileri. Tek tıkla onaylayın ve gönderin.",
    },
    {
      icon: Eye,
      title: "AI Visibility Score",
      description: "İşletmenizin ChatGPT, Gemini ve diğer AI asistanlarında nasıl göründüğünü takip edin.",
    },
    {
      icon: Shield,
      title: "Duygu Analizi",
      description: "Olumsuz yorumları anında tespit edin, öncelikli aksiyon alın. Müşteri sesini dinleyin.",
    },
    {
      icon: BarChart3,
      title: "Performans Analitikleri",
      description: "Puan trendleri, yanıt süreleri ve rakip karşılaştırmaları ile veri odaklı kararlar alın.",
    },
    {
      icon: Globe,
      title: "Çok Platformlu Yönetim",
      description: "Google, Booking, TripAdvisor ve Hotels.com yorumlarını tek panelden yönetin.",
    },
    {
      icon: Building2,
      title: "Çok Lokasyonlu Destek",
      description: "Tüm şubelerinizi tek hesaptan yönetin. Lokasyon bazlı performans karşılaştırması yapın.",
    },
  ];

  const stats = [
    { value: "%89", label: "Müşterilerin yorumları okuyor" },
    { value: "24s", label: "İdeal yanıt süresi" },
    { value: "%35", label: "Daha fazla güven kazanımı" },
    { value: "4.8★", label: "Ortalama kullanıcı puanı" },
  ];

  const comparisons = [
    { feature: "AI yanıt önerileri", us: true, others: false },
    { feature: "AI Visibility Score", us: true, others: false },
    { feature: "Çok platform desteği", us: true, others: false },
    { feature: "Duygu analizi", us: true, others: false },
    { feature: "Çok lokasyon yönetimi", us: true, others: false },
    { feature: "Türkçe destek", us: true, others: false },
    { feature: "Ücretsiz başlangıç", us: true, others: true },
  ];

  const useCases = [
    {
      title: "Oteller & Butik Oteller",
      description: "Google, Booking ve TripAdvisor yorumlarını merkezi olarak yönetin. Çok dilli misafir yorumlarına AI ile yanıt verin.",
      icon: "🏨",
    },
    {
      title: "Restoranlar & Kafeler",
      description: "Google yorumlarında öne çıkan şikayetleri anında tespit edin. Menü ve servis kalitesi hakkında müşteri içgörüleri alın.",
      icon: "🍽️",
    },
    {
      title: "Zincir İşletmeler",
      description: "Tüm lokasyonlarınızı tek panelden yönetin. Şubeler arası performans karşılaştırması yapın.",
      icon: "🏢",
    },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <nav className="sticky top-0 z-50 border-b backdrop-blur-lg bg-white/95">
        <div className="container mx-auto px-6">
          <div className="flex h-16 items-center justify-between">
            <Link
              to="/"
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            >
              <img src={voyageRespondLogo} alt="VoyageRespond" className="h-7 w-7" />
              <span className="text-lg" style={{ color: "#1F2937" }}>
                <span className="font-normal">Voyage</span>
                <span className="font-semibold">Respond</span>
              </span>
            </Link>
            <div className="flex items-center gap-4">
              <Link to="/blog" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors hidden md:block">
                Blog
              </Link>
              <Link to="/hub" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors hidden md:block">
                Hub
              </Link>
              <Link
                to="/demo"
                className="px-5 py-2.5 rounded-md text-sm font-medium text-white transition-all shadow-sm hover:shadow-md inline-block"
                style={{ backgroundColor: "#7A5AF8" }}
              >
                Ücretsiz Başla
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="container mx-auto px-6 py-20 md:py-28 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-8">
            <Sparkles className="w-4 h-4 mr-2" />
            AI Destekli Google Yorum Yönetimi
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
            Google Yorumlarınızı{" "}
            <span className="bg-gradient-to-r from-purple-600 via-primary to-blue-600 bg-clip-text text-transparent">
              Yapay Zeka
            </span>{" "}
            ile Yönetin
          </h1>
          <p className="text-xl text-muted-foreground mb-10 max-w-3xl mx-auto leading-relaxed">
            Müşterinizin sesini dinleyin, AI destekli akıllı yanıtlar oluşturun, duygu analizi yapın ve
            işletmenizin AI asistanlarındaki görünürlüğünü takip edin.
          </p>

          {/* Stats Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto mb-10">
            {stats.map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-3xl font-bold text-primary">{stat.value}</div>
                <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* CTA */}
          {!submitted ? (
            <form onSubmit={handleSubmit} className="max-w-md mx-auto">
              <div className="flex gap-3">
                <Input
                  type="email"
                  placeholder="E-posta adresiniz"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1"
                  required
                />
                <Button type="submit" className="gradient-primary text-white whitespace-nowrap">
                  Ücretsiz Başla
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
              <p className="text-sm text-muted-foreground mt-3">
                3 ay ücretsiz • Kredi kartı gereksiz • 2 dakikada kurulum
              </p>
            </form>
          ) : (
            <div className="bg-green-50 border border-green-200 rounded-xl p-6 max-w-md mx-auto">
              <div className="flex items-center justify-center gap-2 text-green-700 mb-2">
                <Check className="w-5 h-5" />
                <span className="font-semibold">Kaydınız alındı!</span>
              </div>
              <p className="text-green-600 text-sm">
                En kısa sürede erken erişim detaylarını paylaşacağız.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-6 py-20 bg-muted/30">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Google Yorum Yönetiminde İhtiyacınız Olan Her Şey
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Yapay zeka destekli araçlarla yorumlarınızı profesyonelce yönetin, müşteri memnuniyetini artırın.
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {features.map((feature, index) => (
            <div
              key={index}
              className="p-7 rounded-2xl border border-border bg-card hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-5">
                <feature.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-bold text-lg text-foreground mb-2">{feature.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Use Cases */}
      <section className="container mx-auto px-6 py-20">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Hangi Sektöre Hizmet Ediyoruz?
          </h2>
          <p className="text-lg text-muted-foreground">
            Her sektöre özel yorum yönetim stratejileri
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {useCases.map((uc, i) => (
            <div key={i} className="p-8 rounded-2xl border border-border bg-card text-center hover:shadow-lg transition-all">
              <div className="text-5xl mb-4">{uc.icon}</div>
              <h3 className="text-xl font-bold text-foreground mb-3">{uc.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{uc.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* AI Reply Preview */}
      <section className="container mx-auto px-6 py-20 bg-muted/30">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Yorumdan Yanıta Saniyeler İçinde
            </h2>
            <p className="text-lg text-muted-foreground">
              AI, yorumu analiz eder, duygu durumunu belirler ve marka tonunuza uygun yanıt önerir.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-8 items-start">
            <div className="space-y-4">
              {/* Negative Review */}
              <div className="bg-card rounded-xl p-5 border border-border">
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex">
                    {[1, 2].map((i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                    {[3, 4, 5].map((i) => (
                      <Star key={i} className="w-4 h-4 text-gray-300" />
                    ))}
                  </div>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700 font-medium">Olumsuz</span>
                </div>
                <p className="text-foreground text-sm">
                  "Oda temizliği beklediğimiz gibi değildi, banyoda sorun vardı. Personel ilgisizdi."
                </p>
                <span className="text-xs text-muted-foreground mt-2 block">— Mehmet K., 2 saat önce</span>
              </div>
              {/* Positive Review */}
              <div className="bg-card rounded-xl p-5 border border-border">
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-medium">Olumlu</span>
                </div>
                <p className="text-foreground text-sm">
                  "Muhteşem bir deneyimdi! Yemekler harikaydı, personel çok ilgiliydi. Kesinlikle tekrar geleceğiz."
                </p>
                <span className="text-xs text-muted-foreground mt-2 block">— Ayşe T., 5 saat önce</span>
              </div>
            </div>
            <div className="space-y-4">
              <div className="bg-primary/5 rounded-xl p-5 border border-primary/20">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="w-4 h-4 text-primary" />
                  <span className="text-xs text-primary font-semibold">AI Yanıt Önerisi — Olumsuz</span>
                </div>
                <p className="text-foreground text-sm leading-relaxed">
                  "Merhaba Mehmet Bey, geri bildiriminiz için teşekkür ederiz. Oda temizliği ve banyo konusundaki
                  deneyiminiz standartlarımızın altında kalmış, bunun için çok üzgünüz. Ekibimizle durumu derhal
                  değerlendirdik. Sizi doğrudan arayarak telafi etmek isteriz. 🙏"
                </p>
              </div>
              <div className="bg-primary/5 rounded-xl p-5 border border-primary/20">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="w-4 h-4 text-primary" />
                  <span className="text-xs text-primary font-semibold">AI Yanıt Önerisi — Olumlu</span>
                </div>
                <p className="text-foreground text-sm leading-relaxed">
                  "Ayşe Hanım, güzel sözleriniz için çok teşekkür ederiz! Yemeklerimizi ve ekibimizin
                  ilgisini beğenmenize çok sevindik. Sizi tekrar ağırlamak için sabırsızlanıyoruz! 😊"
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="container mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Neden VoyageRespond?
          </h2>
          <p className="text-lg text-muted-foreground">Diğer araçlarla karşılaştırma</p>
        </div>
        <div className="max-w-2xl mx-auto">
          <div className="rounded-2xl border border-border overflow-hidden">
            <div className="grid grid-cols-3 bg-muted p-4 font-semibold text-sm">
              <span>Özellik</span>
              <span className="text-center text-primary">VoyageRespond</span>
              <span className="text-center text-muted-foreground">Diğerleri</span>
            </div>
            {comparisons.map((row, i) => (
              <div key={i} className="grid grid-cols-3 p-4 border-t border-border text-sm items-center">
                <span className="text-foreground">{row.feature}</span>
                <span className="text-center">
                  <Check className="w-5 h-5 text-green-500 mx-auto" />
                </span>
                <span className="text-center">
                  {row.others ? (
                    <Check className="w-5 h-5 text-gray-400 mx-auto" />
                  ) : (
                    <span className="text-gray-300 text-lg">✗</span>
                  )}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="container mx-auto px-6 py-20">
        <div className="max-w-3xl mx-auto text-center p-12 rounded-2xl border border-primary/10 bg-gradient-to-br from-primary/5 via-background to-background">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Google yorumlarınızı AI ile yönetmeye başlayın
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            3 ay ücretsiz • Tüm özellikler dahil • Kredi kartı gereksiz
          </p>
          {!submitted && (
            <form onSubmit={handleSubmit} className="max-w-md mx-auto">
              <div className="flex gap-3">
                <Input
                  type="email"
                  placeholder="E-posta adresiniz"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1"
                  required
                />
                <Button type="submit" className="gradient-primary text-white">
                  Başla
                </Button>
              </div>
            </form>
          )}
          <div className="mt-6">
            <Link to="/blog" className="text-sm text-primary hover:underline">
              Blog yazılarımızı okuyun →
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card/50">
        <div className="container mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 text-sm text-muted-foreground">
            <span>© 2024 VoyageRespond</span>
            <span className="hidden md:block">•</span>
            <button onClick={() => navigate("/blog")} className="hover:text-foreground">Blog</button>
            <span className="hidden md:block">•</span>
            <button onClick={() => navigate("/privacy-policy")} className="hover:text-foreground">Gizlilik Politikası</button>
            <span className="hidden md:block">•</span>
            <button onClick={() => navigate("/terms-of-service")} className="hover:text-foreground">Kullanım Koşulları</button>
          </div>
        </div>
      </footer>

      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            name: "Google Yorum Yönetimi - VoyageRespond",
            description: "Google yorumlarınızı yapay zeka ile yönetin. AI destekli akıllı yanıt önerileri, duygu analizi ve AI Visibility Score.",
            url: "https://voyagerespond.com/automations/google-reviews",
            mainEntity: {
              "@type": "SoftwareApplication",
              name: "VoyageRespond Google Review Management",
              applicationCategory: "BusinessApplication",
              operatingSystem: "Web",
            },
          }),
        }}
      />
    </div>
  );
};

export default GoogleReviews;
