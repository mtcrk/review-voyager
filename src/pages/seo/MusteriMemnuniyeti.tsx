import { useNavigate } from "react-router-dom";
import { ArrowRight, Heart, Target, TrendingUp, Users } from "lucide-react";
import voyageRespondLogo from "@/assets/voyage-respond-logo.svg";
import AEOSection from "@/components/seo/AEOSection";
import SEO from "@/components/seo/SEO";

const MusteriMemnuniyeti = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Müşteri Memnuniyeti Nedir? Nasıl Ölçülür ve Artırılır? | 2026"
        description="Müşteri memnuniyeti nedir, neden önemlidir, NPS/CSAT/CES ile nasıl ölçülür? İşletmeler için uygulanabilir 8 adımlı memnuniyet artırma rehberi."
        alternates={[
          { hrefLang: "tr", href: "https://voyagerespond.com/musteri-memnuniyeti/" },
          { hrefLang: "en", href: "https://voyagerespond.com/customer-satisfaction-management/" },
          { hrefLang: "x-default", href: "https://voyagerespond.com/customer-satisfaction-management/" },
        ]}
        canonical="https://voyagerespond.com/musteri-memnuniyeti"
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
              <button onClick={() => navigate("/demo")} className="px-4 py-2 rounded-md text-sm font-medium text-white" style={{ backgroundColor: "#7A5AF8" }}>
                Ücretsiz Dene
              </button>
            </div>
          </div>
        </div>
      </nav>

      <section className="container mx-auto px-4 sm:px-6 py-12 sm:py-16 max-w-4xl">
        <div className="text-center mb-10 sm:mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            <Heart className="w-4 h-4" />
            Müşteri Deneyimi
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-4 leading-tight">
            Müşteri Memnuniyeti Nedir, Nasıl Ölçülür ve Artırılır?
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
            Memnuniyet skorlarını ölçmenin, anlamlandırmanın ve yorum yönetimiyle birlikte büyütmenin pratik rehberi.
          </p>
        </div>

        <article className="prose prose-lg max-w-none">
          <h2 className="text-2xl font-bold mt-8 mb-4">Müşteri Memnuniyeti Nedir?</h2>
          <p className="text-muted-foreground leading-relaxed">
            Müşteri memnuniyeti, bir tüketicinin satın aldığı ürün veya hizmetten beklediği değerle elde ettiği değer arasındaki <strong>uyumun ölçüsüdür</strong>. Yüksek memnuniyet → tekrar satın alma, tavsiye etme ve olumlu yorum yazma davranışını tetikler. Düşük memnuniyet → kayıp müşteri ve olumsuz Google yorumu olarak geri döner.
          </p>

          <h2 className="text-2xl font-bold mt-12 mb-4">Neden Bu Kadar Önemli? (4 Veri)</h2>
          <div className="grid sm:grid-cols-2 gap-4 my-6">
            {[
              { icon: TrendingUp, stat: "5x", desc: "Yeni müşteri kazanmak, mevcut tutmaktan 5 kat pahalıdır" },
              { icon: Heart, stat: "%42", desc: "1 puan memnuniyet artışı tekrar satın almayı %42 artırıyor" },
              { icon: Users, stat: "%93", desc: "Tüketicilerin %93'ü karar vermeden önce yorumları okuyor" },
              { icon: Target, stat: "%9", desc: "1 yıldız artış = %5-9 ciro artışı (Harvard araştırması)" },
            ].map((s, i) => (
              <div key={i} className="rounded-xl border border-border bg-card p-5">
                <s.icon className="w-5 h-5 text-primary mb-2" />
                <div className="text-2xl font-bold text-foreground">{s.stat}</div>
                <div className="text-sm text-muted-foreground">{s.desc}</div>
              </div>
            ))}
          </div>

          <h2 className="text-2xl font-bold mt-12 mb-4">Müşteri Memnuniyeti Nasıl Ölçülür?</h2>
          <p className="text-muted-foreground leading-relaxed mb-4">Üç temel metrik kullanılır:</p>

          <h3 className="text-xl font-semibold mt-6 mb-2">1. NPS (Net Promoter Score)</h3>
          <p className="text-muted-foreground">
            Tek soru: <em>"Bizi bir arkadaşınıza tavsiye etme olasılığınız 0-10 arasında kaçtır?"</em><br/>
            <strong>NPS = % Destekçi (9-10) − % Eleştiren (0-6)</strong>. 50+ mükemmel, 30+ iyi, 0+ kabul edilebilir.
          </p>

          <h3 className="text-xl font-semibold mt-6 mb-2">2. CSAT (Customer Satisfaction Score)</h3>
          <p className="text-muted-foreground">
            <em>"Hizmetimizden ne kadar memnun kaldınız? (1-5)"</em> Memnun olanların (4-5) toplam içindeki yüzdesi. <strong>%80+</strong> hedeftir.
          </p>

          <h3 className="text-xl font-semibold mt-6 mb-2">3. CES (Customer Effort Score)</h3>
          <p className="text-muted-foreground">
            <em>"Sorununuzu çözmek ne kadar kolaydı? (1-7)"</em> Operasyonel verimliliği ölçer.
          </p>

          <p className="text-muted-foreground mt-4">
            Detaylı anket örnekleri → <a href="/blog/musteri-memnuniyet-anketi-ornekleri/" className="text-primary hover:underline">20 hazır soru ve 5 şablon</a>.
          </p>

          <h2 className="text-2xl font-bold mt-12 mb-4">Müşteri Memnuniyetini Artırmanın 8 Adımı</h2>
          <ol className="space-y-3 text-muted-foreground list-decimal pl-6">
            <li><strong>Beklentiyi netleştirin.</strong> Yanlış vaat, en hızlı memnuniyet katilidir.</li>
            <li><strong>İlk 24 saatte yanıtlayın.</strong> Hem destek talebine hem yoruma.</li>
            <li><strong>Kişiselleştirin.</strong> Şablon mesaj memnuniyet skorunu düşürüyor.</li>
            <li><strong>Geri bildirimi sistematikleştirin.</strong> Anket → kategori → aksiyon → ölç.</li>
            <li><strong>Personel eğitimi.</strong> Memnuniyet, ekibin moralinden ayrılamaz.</li>
            <li><strong>Sorunlu müşteriyi geri kazanın.</strong> Telafi alan müşteri 2x sadık olur.</li>
            <li><strong>Memnun müşteriye yorum talep edin.</strong> Google/Tripadvisor yıldız sayınız sosyal kanıt üretir.</li>
            <li><strong>Yorum verisini analiz edin.</strong> Tekrarlanan şikayetler operasyonel sorunun habercisidir.</li>
          </ol>

          <h2 className="text-2xl font-bold mt-12 mb-4">Müşteri Memnuniyeti ve Online Yorumlar</h2>
          <p className="text-muted-foreground leading-relaxed">
            Memnuniyet anketi, sorunu <strong>müşteri Google yoruma yazmadan önce</strong> yakalamanın en hızlı yoludur. Aksi halde olumsuz deneyim Google'a sızar ve ortalama yıldızınızı düşürür. Memnun müşterilerin Google'a yönlendirilmesi, eleştirenlerin <em>önce</em> sizinle iletişim kurması — bu akış <a href="/online-itibar-yonetimi/" className="text-primary hover:underline">online itibar yönetimi</a>nin kalbidir.
          </p>

          <h2 className="text-2xl font-bold mt-12 mb-4">Sektörel Farklılıklar</h2>
          <ul className="space-y-2 text-muted-foreground">
            <li><strong>Restoran:</strong> Yemek + servis + atmosfer + fiyat — 4 boyutu ayrı ölç. <a href="/restoran-musteri-memnuniyeti/" className="text-primary hover:underline">Detay rehber</a>.</li>
            <li><strong>Otel:</strong> Oda temizliği, check-in/out süresi, kahvaltı, konum ana metrikler.</li>
            <li><strong>E-ticaret:</strong> Ürün açıklaması-gerçek eşleşmesi, teslimat süresi, iade kolaylığı.</li>
            <li><strong>B2B hizmet:</strong> CES en kritik. "İşi halletmek ne kadar kolaydı?"</li>
          </ul>

          <h2 className="text-2xl font-bold mt-12 mb-4">AI ile Memnuniyet Yönetimi</h2>
          <p className="text-muted-foreground leading-relaxed">
            Modern AI platformları (VoyageRespond gibi) açık uçlu anket yanıtlarını otomatik kategorize eder, duygu skorları üretir ve yorum yanıtlarınızı kişiselleştirir. 10 yorum için harcanan 25 dakika, AI ile 5 dakikaya iner — siz yalnızca onaylarsınız.
          </p>
        </article>

        <div className="my-16 text-center p-8 sm:p-10 rounded-2xl border border-primary/10 bg-gradient-to-br from-primary/5 via-background to-background">
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">
            Memnuniyet skorunuzu yıldıza çevirin
          </h2>
          <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
            VoyageRespond, anket sonuçlarınızı Google yorum stratejisine bağlar, AI ile yanıt taslakları üretir ve duygu trendlerini haftalık raporlar.
          </p>
          <button onClick={() => navigate("/demo")} className="px-8 py-3 rounded-md text-white font-medium hover:shadow-lg min-h-[48px]" style={{ backgroundColor: "#7A5AF8" }}>
            3 Ay Ücretsiz Başla <ArrowRight className="w-4 h-4 inline ml-1" />
          </button>
        </div>

        <AEOSection
          pageUrl="https://voyagerespond.com/musteri-memnuniyeti"
          faqs={[
            { question: "Müşteri memnuniyeti nedir?", answer: "Müşteri memnuniyeti, tüketicinin bir ürün veya hizmetten beklediği değerle elde ettiği değer arasındaki uyumun ölçüsüdür. Yüksek memnuniyet tekrar satın almayı, tavsiye etmeyi ve olumlu yorum yazmayı tetikler." },
            { question: "Müşteri memnuniyeti nasıl ölçülür?", answer: "Üç temel metrik kullanılır: NPS (tavsiye etme olasılığı 0-10), CSAT (genel memnuniyet 1-5) ve CES (sorunu çözmek ne kadar kolaydı 1-7). NPS sadakat, CSAT genel memnuniyet, CES operasyonel verimlilik ölçer." },
            { question: "İyi bir NPS skoru kaçtır?", answer: "50 üstü mükemmel, 30-50 arası iyi, 0-30 arası kabul edilebilir, negatif değerler kritik müdahale gerektirir. Sektör ortalamaları farklılık gösterir; otel ve restoran sektöründe 40+ rekabetçidir." },
            { question: "Müşteri memnuniyetini en hızlı nasıl artırırım?", answer: "İlk 24 saat içinde tüm yorum ve destek taleplerine yanıt verin, kişiselleştirilmiş mesajlar gönderin ve olumsuz geri bildirim alan müşteriyi proaktif arayarak telafi sunun. Bu üç eylem skorları 30 günde 10-15 puan artırabilir." },
            { question: "Müşteri memnuniyeti ve Google yıldızı bağlantısı nedir?", answer: "Memnun müşteri Google yorumu yazma olasılığı 4x daha fazladır. Yıldız ortalamanız bir puan artarsa cironuz Harvard araştırmasına göre %5-9 artar. Memnuniyet anketi + Google yorum talebi akışı kurmak doğrudan ciro etkisi yaratır." },
          ]}
        />

        <div className="mt-12 p-6 rounded-xl bg-muted/50 border border-border">
          <h3 className="font-semibold text-foreground mb-4">İlgili Rehberler</h3>
          <ul className="space-y-2">
            <li><button onClick={() => navigate("/restoran-musteri-memnuniyeti")} className="text-primary hover:underline text-sm">Restoran Müşteri Memnuniyeti Rehberi →</button></li>
            <li><button onClick={() => navigate("/online-itibar-yonetimi")} className="text-primary hover:underline text-sm">Online İtibar Yönetimi Nedir? →</button></li>
            <li><button onClick={() => navigate("/blog/musteri-memnuniyet-anketi-ornekleri")} className="text-primary hover:underline text-sm">Müşteri Memnuniyet Anketi Örnekleri →</button></li>
            <li><button onClick={() => navigate("/blog/musteri-memnuniyet-mesaji-ornekleri")} className="text-primary hover:underline text-sm">Müşteri Memnuniyet Mesajı Örnekleri →</button></li>
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

export default MusteriMemnuniyeti;