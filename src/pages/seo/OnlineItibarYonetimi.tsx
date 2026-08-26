import { useNavigate } from "react-router-dom";
import { ArrowRight, Shield, TrendingUp, Eye, MessageSquare, BarChart3, Sparkles, BookOpen, Scale } from "lucide-react";
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
        alternates={[
          { hrefLang: "tr", href: "https://voyagerespond.com/online-itibar-yonetimi/" },
          { hrefLang: "en", href: "https://voyagerespond.com/online-reputation-management/" },
          { hrefLang: "x-default", href: "https://voyagerespond.com/online-reputation-management/" },
        ]}
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
              <button onClick={() => navigate("/yorum-yonetim-araclari")} className="px-4 py-2 rounded-md text-sm font-medium text-white" style={{ backgroundColor: "#7A5AF8" }}>
                Yorum Yönetim Rehberi
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

          <div className="my-10 rounded-2xl border-2 border-primary/20 bg-primary/5 p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-4">
              <Scale className="w-6 h-6 text-primary" />
              <h2 className="text-2xl font-bold m-0">Online İtibar Yönetimi vs Yorum Yönetimi: Hangisi Size Lazım?</h2>
            </div>
            <p className="text-muted-foreground leading-relaxed mb-5">
              "Online itibar yönetimi" çatı bir terim ve aslında <strong>iki çok farklı hizmet</strong> alanını kapsar. İhtiyacınızı doğru tanımlamak, doğru sağlayıcıya ulaşmanın ilk adımıdır.
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="rounded-xl border border-border bg-card p-5">
                <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Alan 1</div>
                <h3 className="font-semibold text-foreground mb-2">İçerik Silme & SERP Suppression</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Olumsuz haber, ekşi sözlük başlığı veya yargı kararı içeren içeriklerin Google sonuçlarından kaldırılması/aşağı itilmesi. <strong>Hukuki bir süreç</strong>: unutulma hakkı talepleri, mahkeme kararları, DMCA bildirimleri.
                </p>
                <p className="text-sm text-muted-foreground mb-3">
                  <strong className="text-foreground">Kim yapar:</strong> Hukuk firmaları (Mıhcı Hukuk vb.) ve dijital PR ajansları (Webtures, HF Media vb.).
                </p>
                <p className="text-sm text-muted-foreground">
                  <strong className="text-foreground">Ne zaman gerekir:</strong> Kriz, dava, viral skandal — yılda 1-2 kez denk gelinen <em>nadir</em> durumlar.
                </p>
              </div>
              <div className="rounded-xl border-2 border-primary/40 bg-card p-5">
                <div className="text-xs uppercase tracking-wider text-primary mb-2">Alan 2 — VoyageRespond'un alanı</div>
                <h3 className="font-semibold text-foreground mb-2">Yorum Yönetimi</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Google, Booking, TripAdvisor ve sosyal medyadaki müşteri yorumlarını toplama, AI ile yanıtlama, duygu analizi yapma ve operasyonel iyileştirmeye dönüştürme.
                </p>
                <p className="text-sm text-muted-foreground mb-3">
                  <strong className="text-foreground">Kim yapar:</strong> Yorum yönetim platformları — <a href="/yorum-yonetim-araclari/" className="text-primary hover:underline">VoyageRespond, Jetyorum, Esinix</a> gibi yazılım firmaları.
                </p>
                <p className="text-sm text-muted-foreground">
                  <strong className="text-foreground">Ne zaman gerekir:</strong> <em>Her hafta</em>. Otel, restoran, çoklu lokasyon işletmeleri için sürekli ve operasyonel bir süreç.
                </p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mt-5 leading-relaxed">
              <strong className="text-foreground">Pratik kural:</strong> Çoğu işletmenin (özellikle otel ve restoranların) ihtiyacı <strong>yorum yönetimidir</strong>. İçerik silme, ancak gerçek bir kriz veya hukuki sorun varsa devreye alınmalıdır. Yorum yönetimini doğru yaparsanız, ilerideki krizlerin <em>çoğunu</em> baştan engellersiniz.
            </p>
          </div>

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
            Yorum yönetimi tarafında piyasada birçok platform var: Yotpo, Birdeye, Podium, TrustYou, ReviewPro, Jetyorum, Esinix, MARA Solutions ve VoyageRespond. Her birinin güçlü olduğu sektör ve coğrafya farklı. Detaylı karşılaştırma için → <a href="/yorum-yonetim-araclari/" className="text-primary hover:underline">En İyi Yorum Yönetim Araçları 2026: 12 Platform Karşılaştırması</a>.
          </p>
          <p className="text-muted-foreground leading-relaxed mt-3">
            Google özelinde nasıl yönetileceğini adım adım öğrenmek isterseniz → <a href="/blog/google-yorumlarim-nasil-yonetilir/" className="text-primary hover:underline">Google Yorumlarım Nasıl Yönetilir?</a> rehberi iyi bir başlangıç. Restoran sahibiyseniz → <a href="/restoran-yorum-cevaplari/" className="text-primary hover:underline">Restoran Yorum Cevapları</a>, otelciyseniz → <a href="/platform/google-yorumlari-icin-yapay-zeka/" className="text-primary hover:underline">Google yorumları için yapay zeka</a> sayfası daha uygulamaya yönelik.
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

        <div className="my-16 p-8 sm:p-10 rounded-2xl border border-primary/10 bg-gradient-to-br from-primary/5 via-background to-background">
          <div className="flex items-center gap-3 mb-3">
            <BookOpen className="w-6 h-6 text-primary" />
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground m-0">Devamı: Pratik Yorum Yönetimi Rehberi</h2>
          </div>
          <p className="text-muted-foreground mb-6 max-w-2xl">
            Bu sayfa "online itibar yönetimi"nin <strong>ne olduğunu</strong> anlatıyor. <strong>Nasıl yapılacağını</strong> ve hangi araçların ne işe yaradığını uygulamalı olarak görmek isterseniz, kapsamlı yorum yönetimi içeriklerimize geçin:
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <button onClick={() => navigate("/yorum-yonetim-araclari")} className="px-5 py-3 rounded-md text-white font-medium hover:shadow-lg min-h-[48px] text-sm" style={{ backgroundColor: "#7A5AF8" }}>
              12 Platform Karşılaştırması <ArrowRight className="w-4 h-4 inline ml-1" />
            </button>
            <button onClick={() => navigate("/blog/google-yorumlarim-nasil-yonetilir")} className="px-5 py-3 rounded-md font-medium border border-border hover:bg-muted min-h-[48px] text-sm">
              Google Yorumlarım Nasıl Yönetilir?
            </button>
            <button onClick={() => navigate("/restoran-yorum-cevaplari")} className="px-5 py-3 rounded-md font-medium border border-border hover:bg-muted min-h-[48px] text-sm">
              Restoran Yorum Cevapları
            </button>
          </div>
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