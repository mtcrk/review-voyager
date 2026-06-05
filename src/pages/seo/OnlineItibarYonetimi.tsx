import { useNavigate } from "react-router-dom";
import { ArrowRight, Shield, TrendingUp, Eye, MessageSquare, BarChart3, Sparkles } from "lucide-react";
import voyageRespondLogo from "@/assets/voyage-respond-logo.svg";
import AEOSection from "@/components/seo/AEOSection";
import SEO from "@/components/seo/SEO";

const OnlineItibarYonetimi = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Online İtibar Yönetimi Nedir? 2026 Rehberi | VoyageRespond"
        description="Online itibar yönetimi nedir, nasıl yapılır, hangi araçlar kullanılır? Google, Booking, TripAdvisor için AI destekli dijital itibar yönetimi rehberi."
        canonical="https://voyagerespond.com/online-itibar-yonetimi"
      />

      <nav className="sticky top-0 z-50 border-b backdrop-blur-lg bg-white/95">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex h-16 items-center justify-between">
            <button onClick={() => navigate("/")} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <img src={voyageRespondLogo} alt="VoyageRespond" className="h-7 w-7" />
              <span className="text-lg" style={{ color: "#1F2937" }}>
                <span className="font-normal">Voyage</span><span className="font-semibold">Respond</span>
              </span>
            </button>
            <div className="flex items-center gap-4">
              <button onClick={() => navigate("/blog")} className="hidden sm:block text-sm font-medium text-muted-foreground hover:text-foreground">Blog</button>
              <button onClick={() => navigate("/onboarding")} className="px-4 py-2 rounded-md text-sm font-medium text-white" style={{ backgroundColor: "#7A5AF8" }}>
                Ücretsiz Dene
              </button>
            </div>
          </div>
        </div>
      </nav>

      <section className="container mx-auto px-4 sm:px-6 py-12 sm:py-16 max-w-4xl">
        <div className="text-center mb-10 sm:mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            <Shield className="w-4 h-4" />
            Dijital İtibar Yönetimi
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-4 leading-tight">
            Online İtibar Yönetimi Nedir ve Nasıl Yapılır?
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
            Google, Booking, TripAdvisor ve sosyal medya yorumlarınızı tek yerden, AI desteğiyle yöneterek markanızın dijital itibarını koruyun ve büyütün.
          </p>
        </div>

        <article className="prose prose-lg max-w-none">
          <h2 className="text-2xl font-bold mt-12 mb-4">Online İtibar Yönetimi Nedir?</h2>
          <p className="text-muted-foreground leading-relaxed">
            Online itibar yönetimi (Online Reputation Management — ORM), işletmenizin internetteki tüm görünümünü — Google yorumları, Booking puanları, TripAdvisor değerlendirmeleri, sosyal medya yorumları ve haber kaynakları — sistematik olarak <strong>izleme, yanıtlama ve geliştirme</strong> sürecidir. Tüketicilerin <strong>%93'ü</strong> bir işletmeye gitmeden önce online yorumları okuyor (BrightLocal 2025). Yani dijital itibarınız, satış kararını tetikleyen ilk filtredir.
          </p>

          <h2 className="text-2xl font-bold mt-12 mb-4">Neden Önemli? 4 Somut Veri</h2>
          <ul className="space-y-2 text-muted-foreground">
            <li>1 yıldız artış = %5-9 ciro artışı (Harvard Business School)</li>
            <li>Olumsuz yoruma yanıt veren işletmeler %35 daha çok güven kazanıyor</li>
            <li>Google "yanımdaki" aramalarında ilk 3'e girmek için minimum 4.4 yıldız ortalaması gerekiyor</li>
            <li>ChatGPT/Gemini gibi AI motorları işletme önerirken yorumlardaki <em>duygu skoru</em>nu kullanıyor</li>
          </ul>

          <h2 className="text-2xl font-bold mt-12 mb-4">Dijital İtibar Yönetiminin 5 Temel Adımı</h2>

          <div className="grid sm:grid-cols-2 gap-4 my-6">
            {[
              { icon: Eye, title: "1. İzleme", desc: "Tüm platformlardaki yorum ve bahisleri tek panelden takip edin." },
              { icon: MessageSquare, title: "2. Yanıtlama", desc: "24 saat içinde, kişiselleştirilmiş ve markanızın tonunda yanıt verin." },
              { icon: BarChart3, title: "3. Analiz", desc: "Duygu trendleri, kategori bazlı şikayet ve memnuniyet skorları üretin." },
              { icon: TrendingUp, title: "4. İyileştirme", desc: "Yorum verisini operasyonel kararlara dönüştürün." },
              { icon: Sparkles, title: "5. Talep Üretimi", desc: "Memnun müşteriden Google/TA yorumu isteyin (QR, SMS, e-posta)." },
            ].map((s, i) => (
              <div key={i} className="rounded-xl border border-border bg-card p-5">
                <s.icon className="w-5 h-5 text-primary mb-2" />
                <div className="font-semibold text-foreground mb-1">{s.title}</div>
                <div className="text-sm text-muted-foreground">{s.desc}</div>
              </div>
            ))}
          </div>

          <h2 className="text-2xl font-bold mt-12 mb-4">Hangi Platformları İzlemek Gerekir?</h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            Sektöre göre değişir; ama 2026 Türkiye için temel liste:
          </p>
          <ul className="space-y-1 text-muted-foreground">
            <li><strong>Google Business Profile</strong> — tüm sektörler için zorunlu (yerel SEO)</li>
            <li><strong>Booking.com & TripAdvisor</strong> — otel, restoran, turizm</li>
            <li><strong>Hotels.com & Trivago</strong> — uluslararası konaklama</li>
            <li><strong>Yemeksepeti & Getir & Trendyol Yemek</strong> — restoran</li>
            <li><strong>Instagram, TikTok, YouTube</strong> — sosyal kanıt + DM ve yorum</li>
            <li><strong>Şikayetvar & Ekşisözlük</strong> — kriz erken uyarı</li>
          </ul>

          <h2 className="text-2xl font-bold mt-12 mb-4">Manuel vs AI Destekli İtibar Yönetimi</h2>
          <div className="overflow-x-auto my-4">
            <table className="w-full text-sm border border-border rounded-lg">
              <thead className="bg-muted">
                <tr>
                  <th className="text-left p-3 border-b border-border">Süreç</th>
                  <th className="text-left p-3 border-b border-border">Manuel</th>
                  <th className="text-left p-3 border-b border-border">AI (VoyageRespond)</th>
                </tr>
              </thead>
              <tbody>
                <tr><td className="p-3 border-b border-border">Yorum toplama</td><td className="p-3 border-b border-border">Her platform ayrı</td><td className="p-3 border-b border-border">Saatlik otomatik çekim</td></tr>
                <tr><td className="p-3 border-b border-border">Ortalama yanıt süresi</td><td className="p-3 border-b border-border">18 saat</td><td className="p-3 border-b border-border">5 dakika</td></tr>
                <tr><td className="p-3 border-b border-border">Çoklu lokasyon</td><td className="p-3 border-b border-border">Her şube ayrı yönetim</td><td className="p-3 border-b border-border">Tek dashboard</td></tr>
                <tr><td className="p-3 border-b border-border">Duygu analizi</td><td className="p-3 border-b border-border">Yok</td><td className="p-3 border-b border-border">Otomatik</td></tr>
                <tr><td className="p-3">Raporlama</td><td className="p-3">Excel</td><td className="p-3">Haftalık AI raporu</td></tr>
              </tbody>
            </table>
          </div>

          <h2 className="text-2xl font-bold mt-12 mb-4">Online İtibar Yönetimi Araçları</h2>
          <p className="text-muted-foreground leading-relaxed">
            Piyasada yaygın araçlar: Yotpo, BirdEye, Podium, Reputation, ReviewTrackers. Türkçe destek, yerel platform entegrasyonu (Yemeksepeti, Şikayetvar, Booking TR puanları) ve AI tabanlı Türkçe yanıt üretimi açısından <strong>VoyageRespond</strong> Türkiye pazarı için optimize edilmiş tek platformdur. Karşılaştırma için → <a href="/yorum-yonetim-araclari" className="text-primary hover:underline">Yorum Yönetim Araçları</a>.
          </p>

          <h2 className="text-2xl font-bold mt-12 mb-4">Kriz Anında İtibar Yönetimi</h2>
          <p className="text-muted-foreground leading-relaxed mb-3">
            Viral bir olumsuz yorum, gıda zehirlenmesi iddiası, sahte yorum saldırısı… Kriz anında 3 kural:
          </p>
          <ul className="space-y-1 text-muted-foreground">
            <li><strong>İlk 2 saat sessiz kalmayın.</strong> Halka açık bir özür notu yayınlayın.</li>
            <li><strong>Defansif olmayın.</strong> Suçlamayın, sorumluluğu kabul edin.</li>
            <li><strong>Sahte yorumları derhal şikayet edin.</strong> Google, Booking, Tripadvisor için ayrı süreçler var.</li>
          </ul>

          <h2 className="text-2xl font-bold mt-12 mb-4">Sık Yapılan 5 Hata</h2>
          <ul className="space-y-2 text-muted-foreground">
            <li><strong>1.</strong> Sadece olumsuz yorumlara yanıt vermek (olumluya yanıt vermek 2x sadakat üretir)</li>
            <li><strong>2.</strong> Şablon kopyala-yapıştır yanıtlar</li>
            <li><strong>3.</strong> 72 saatten geç yanıt</li>
            <li><strong>4.</strong> Sahte olumlu yorum satın almak (Google yakaladığında profil askıya alınır)</li>
            <li><strong>5.</strong> Yorum verisini operasyonel kararlardan ayrı tutmak</li>
          </ul>
        </article>

        <div className="my-16 text-center p-8 sm:p-10 rounded-2xl border border-primary/10 bg-gradient-to-br from-primary/5 via-background to-background">
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">
            Tüm platformlardaki itibarınızı tek panelden yönetin
          </h2>
          <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
            VoyageRespond, Google, Booking, TripAdvisor ve sosyal medya yorumlarınızı AI ile yöneten Türkiye'nin ilk yerli itibar yönetim platformudur.
          </p>
          <button onClick={() => navigate("/onboarding")} className="px-8 py-3 rounded-md text-white font-medium hover:shadow-lg min-h-[48px]" style={{ backgroundColor: "#7A5AF8" }}>
            3 Ay Ücretsiz Deneyin <ArrowRight className="w-4 h-4 inline ml-1" />
          </button>
        </div>

        <AEOSection
          pageUrl="https://voyagerespond.com/online-itibar-yonetimi"
          faqs={[
            { question: "Online itibar yönetimi nedir?", answer: "Online itibar yönetimi (ORM), işletmenizin Google, Booking, TripAdvisor, sosyal medya ve haber kaynaklarındaki tüm görünümünü izleme, yanıtlama ve geliştirme sürecidir. Amacı tüketicinin satın alma kararını veren ilk dijital izlenimi olumlu yönde şekillendirmektir." },
            { question: "Dijital itibar yönetimi ile online itibar yönetimi aynı şey mi?", answer: "Evet. İkisi de aynı süreci ifade eder: internetteki işletme görünümünün sistematik yönetimi. 'Dijital itibar' daha genel marka algısını, 'online itibar' ise spesifik olarak yorumlar ve sosyal kanıt yönetimini vurgular." },
            { question: "Online itibar yönetimi ne kadar süre alır?", answer: "İlk sonuçlar 30 günde görülür: yıldız ortalaması yükselmeye, yanıt oranı %100'e çıkar. Anlamlı dönüşüm (sıralama, ciro) 90 günde belirginleşir. AI destekli yönetim bu süreyi 3-4 kat hızlandırır." },
            { question: "Küçük işletmem için profesyonel bir araç şart mı?", answer: "Haftada 5'in altında yorum geliyorsa Google Business Profile yeterli olabilir. 5+ yorum/hafta veya 2+ lokasyon varsa, sürdürülebilir takip için yorum yönetim yazılımı (VoyageRespond gibi) gereklidir." },
            { question: "Sahte olumsuz yorumlardan nasıl korunurum?", answer: "Yorumu 'Uygunsuz olarak işaretle' ile şikayet edin, somut kanıt (sipariş kaydı yokluğu, rakip işletme bağlantısı) sunun. Süreç 5-15 gün sürer. Bu sırada profesyonel bir yanıt yazarak okuyan herkese durumu açıklayın." },
          ]}
        />

        <div className="mt-12 p-6 rounded-xl bg-muted/50 border border-border">
          <h3 className="font-semibold text-foreground mb-4">İlgili Rehberler</h3>
          <ul className="space-y-2">
            <li><button onClick={() => navigate("/musteri-memnuniyeti")} className="text-primary hover:underline text-sm">Müşteri Memnuniyeti Nedir? →</button></li>
            <li><button onClick={() => navigate("/restoran-musteri-memnuniyeti")} className="text-primary hover:underline text-sm">Restoran Müşteri Memnuniyeti Rehberi →</button></li>
            <li><button onClick={() => navigate("/yorum-yonetim-araclari")} className="text-primary hover:underline text-sm">Yorum Yönetim Araçları Karşılaştırması →</button></li>
            <li><button onClick={() => navigate("/blog/google-yorumlarim-nasil-yonetilir")} className="text-primary hover:underline text-sm">Google Yorumlarım Nasıl Yönetilir? →</button></li>
          </ul>
        </div>
      </section>

      <footer className="border-t border-border bg-card/50">
        <div className="container mx-auto px-4 sm:px-6 py-8">
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 text-sm text-muted-foreground">
            <span>© 2026 VoyageRespond</span>
            <span className="hidden md:block">•</span>
            <button onClick={() => navigate("/privacy-policy")} className="hover:text-foreground">Gizlilik Politikası</button>
            <span className="hidden md:block">•</span>
            <button onClick={() => navigate("/terms-of-service")} className="hover:text-foreground">Kullanım Koşulları</button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default OnlineItibarYonetimi;