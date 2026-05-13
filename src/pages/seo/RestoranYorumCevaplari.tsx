import { useNavigate } from "react-router-dom";
import { ArrowRight, Copy, Check, UtensilsCrossed } from "lucide-react";
import voyageRespondLogo from "@/assets/voyage-respond-logo.svg";
import { useState } from "react";
import AEOSection from "@/components/seo/AEOSection";
import SEO from "@/components/seo/SEO";

const templates = [
  { category: "🍽️ Yemek Kalitesi — Olumlu", items: [
    { title: "Genel yemek övgüsü", text: "Merhaba [İsim], lezzetli yemeklerimizi beğenmenize çok sevindik! Şefimiz taze ve yerel malzemeler kullanarak her tabağı özenle hazırlıyor. Bir sonraki ziyaretinizde mevsimsel menümüzü denemenizi tavsiye ederiz. Afiyet olsun! 🍴" },
    { title: "Spesifik yemek övgüsü", text: "[İsim] Bey/Hanım, [yemek adı] tarifimizi beğenmenize bayıldık! Bu tarif şefimizin özel reçetesidir ve her gün taze malzemelerle hazırlanıyor. Sıradaki ziyaretinizde [başka yemek önerisi] denemenizi kesinlikle tavsiye ederiz. 😋" },
    { title: "Tatlı övgüsü", text: "Merhaba [İsim], tatlılarımızı sevmenize çok mutlu olduk! Pastacımız her sabah taze tatlılar hazırlıyor. [Bahsedilen tatlı] favorilerimizden! Bir dahaki sefere [yeni tatlı] denemeyi unutmayın. 🍰" },
    { title: "Kahvaltı övgüsü", text: "[İsim], kahvaltı büfemizi beğenmenize sevindik! Ev yapımı reçellerimiz, taze pişirilen böreklerimiz ve organik yumurtalarımızla haftasonları özel bir deneyim sunuyoruz. Tekrar bekleriz! ☕" },
  ]},
  { category: "👨‍🍳 Servis ve Personel — Olumlu", items: [
    { title: "Garson övgüsü", text: "Merhaba [İsim], [garson adı] hakkındaki güzel sözleriniz onu çok mutlu etti! Ekibimizin her üyesi misafir memnuniyetini öncelik olarak görüyor. Sizi tekrar ağırlamak için sabırsızlanıyoruz!" },
    { title: "Hızlı servis övgüsü", text: "[İsim], hızlı servisimizi takdir etmenize sevindik! Lezzetli yemekleri beklemeden sunmak için sürekli çalışıyoruz. Öğle yemeği için bizi tercih ettiğiniz için teşekkürler! 🚀" },
    { title: "Özel ilgi övgüsü", text: "Merhaba [İsim], size özel bir deneyim sunabildiğimize mutlu olduk! Her misafirimiz bizim için özeldir. Doğum günü/özel gün organizasyonlarımız için de bize danışabilirsiniz! 🎉" },
  ]},
  { category: "🏠 Mekan ve Atmosfer — Olumlu", items: [
    { title: "Dekorasyon övgüsü", text: "[İsim], mekanımızın dekorasyonunu beğenmenize sevindik! Her köşeyi misafirlerimiz için özenle tasarladık. Akşam yemeği için mumlu masalarımız ayrı bir ambians sunuyor, denemenizi öneririz! 🕯️" },
    { title: "Bahçe/teras övgüsü", text: "Merhaba [İsim], bahçemizde keyifli vakit geçirmenize çok mutlu olduk! Yaz aylarında canlı müzik eşliğinde açık hava yemeklerimiz başlıyor. Takipte kalın! 🌿" },
    { title: "Aile dostu övgüsü", text: "[İsim], ailenizle güzel bir deneyim yaşamanıza sevindik! Çocuk menümüz ve oyun alanımızla küçük misafirlerimizi de düşünüyoruz. Haftasonları özel çocuk aktivitelerimiz var! 👨‍👩‍👧‍👦" },
  ]},
  { category: "⭐⭐⭐ Nötr Değerlendirmeler", items: [
    { title: "Karma yorum", text: "Merhaba [İsim], hem olumlu hem yapıcı geri bildiriminiz için teşekkürler. [Beğenilen kısım] hakkındaki sözleriniz bizi mutlu etti. [İyileştirilecek kısım] konusunda hemen aksiyon aldık. Bir sonraki ziyaretinizde farkı göreceksiniz!" },
    { title: "Fiyat-kalite dengesi", text: "[İsim], değerlendirmeniz için teşekkürler. Kaliteli malzeme ve profesyonel hazırlık sürecimiz menü fiyatlarımıza yansıyor. Öğle menümüz ve hafta içi kampanyalarımız daha uygun seçenekler sunuyor. Denemenizi öneririz! 💰" },
    { title: "Beklenti yönetimi", text: "Merhaba [İsim], geri bildiriminiz bizim için çok değerli. Beklentilerinizi tam karşılayamadığımız için üzgünüz. Lütfen bize detay paylaşın — deneyiminizi iyileştirmek için elimizden geleni yapacağız." },
  ]},
  { category: "❌ Olumsuz Yorumlar — Yemek", items: [
    { title: "Tat şikayeti", text: "Merhaba [İsim], yemeğimizin tadının beklentilerinizi karşılayamaması için çok üzgünüz. Şefimizle [bahsedilen yemek] hakkında değerlendirme yaptık. Telafi olarak bir sonraki ziyaretinizde şefin özel tabağını ikram etmek isteriz." },
    { title: "Soğuk yemek", text: "[İsim], yemeğinizin soğuk servis edilmesi kabul edilemez bir durumdur, özür dileriz. Servis süreçlerimizi yeniden düzenledik. Lütfen bize bir şans daha verin — farkı göreceksiniz." },
    { title: "Porsiyon şikayeti", text: "Merhaba [İsim], porsiyon boyutumuzun beklentinizi karşılayamaması için üzgünüz. Menümüzde büyük porsiyon seçenekleri mevcuttur. Bir sonraki ziyaretinizde garsonumuzdan öneri almanızı tavsiye ederiz." },
  ]},
  { category: "❌ Olumsuz Yorumlar — Servis", items: [
    { title: "Yavaş servis", text: "[İsim], uzun bekleme süresinden dolayı samimiyetle özür dileriz. Yoğun dönemlerde yaşanan bu aksaklığı gidermek için ek personel ve yeni sipariş sistemi devreye aldık. Bir sonraki ziyaretinizde çok daha hızlı hizmet göreceksiniz!" },
    { title: "Yanlış sipariş", text: "Merhaba [İsim], siparişinizin yanlış gelmesi için çok üzgünüz. Bu tür hatalar kabul edilemez ve sipariş sürecimizi iyileştirdik. Telafi olarak bir sonraki ziyaretinizde tatlı ikramında bulunmak isteriz." },
    { title: "Kaba personel", text: "[İsim], personelimizin davranışından dolayı yaşadığınız deneyim için samimiyetle özür dileriz. Bu durum kesinlikle kurumsal değerlerimize aykırıdır. İlgili personelle görüşülmüş ve ek müşteri iletişim eğitimi başlatılmıştır." },
    { title: "Rezervasyon sorunu", text: "Merhaba [İsim], rezervasyonunuzla ilgili yaşanan karışıklık için çok üzgünüz. Rezervasyon sistemimizi yeniledik ve bu tür aksaklıkların tekrarını önlemek için kontrol mekanizmalarını güçlendirdik." },
  ]},
  { category: "❌ Olumsuz Yorumlar — Mekan", items: [
    { title: "Temizlik şikayeti", text: "Sayın [İsim], temizlik konusundaki endişenizi son derece ciddiye alıyoruz. Hijyen ekibimizle acil bir değerlendirme yaptık ve günlük kontrol listelerimizi güncelledik. Bu konuda asla taviz vermeyiz." },
    { title: "Gürültü şikayeti", text: "[İsim], gürültü seviyesi konusundaki geri bildiriminiz için teşekkürler. Akustik düzenleme çalışmalarımız devam ediyor. O zamana kadar daha sakin köşemizi tercih edebilirsiniz — rezervasyonda belirtmeniz yeterli." },
    { title: "Klima/sıcaklık", text: "Merhaba [İsim], mekanımızın sıcaklığından rahatsız olmanız için üzgünüz. Klima sistemimizi kontrol ettirdik ve ayarları düzenledik. Bir sonraki ziyaretinizde çok daha konforlu bir ortam sizi bekliyor olacak." },
  ]},
];

const RestoranYorumCevaplari = () => {
  const navigate = useNavigate();
  const [copiedIndex, setCopiedIndex] = useState<string | null>(null);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(key);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Restoran Yorum Cevap Örnekleri | Google ve Yelp için 30 Şablon"
        description="Restoranınıza gelen Google, Yelp ve TripAdvisor yorumlarına profesyonel cevap örnekleri. Yemek kalitesi, servis hızı, hijyen ve atmosfer şikayetleri için 30 şablon."
        canonical="https://voyagerespond.com/restoran-yorum-cevaplari"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: templates.flatMap((s) =>
            s.items.map((it) => ({
              "@type": "Question",
              name: it.title,
              acceptedAnswer: { "@type": "Answer", text: it.text },
            }))
          ),
        }}
      />
      <nav className="sticky top-0 z-50 border-b backdrop-blur-lg bg-white/95">
        <div className="container mx-auto px-6">
          <div className="flex h-16 items-center justify-between">
            <button onClick={() => navigate("/")} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <img src={voyageRespondLogo} alt="VoyageRespond" className="h-7 w-7" />
              <span className="text-lg" style={{ color: "#1F2937" }}><span className="font-normal">Voyage</span><span className="font-semibold">Respond</span></span>
            </button>
            <div className="flex items-center gap-4">
              <button onClick={() => navigate("/blog")} className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Blog</button>
              <button onClick={() => navigate("/onboarding")} className="px-4 py-2 rounded-md text-sm font-medium text-white transition-all" style={{ backgroundColor: "#7A5AF8" }}>Ücretsiz Dene</button>
            </div>
          </div>
        </div>
      </nav>

      <section className="container mx-auto px-6 py-16 max-w-4xl">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            <UtensilsCrossed className="w-4 h-4" />
            Restoranlara Özel
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Restoran Yorum Cevapları: Google ve Yelp için Hazır Yanıtlar
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Restoranınıza gelen Google, Yelp ve TripAdvisor yorumlarına profesyonel cevap örnekleri. Yemek kalitesi, servis hızı, hijyen ve atmosfer şikayetleri için hazır yanıt şablonları.
          </p>
        </div>

        {templates.map((section, si) => (
          <div key={si} className="mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-6">{section.category}</h2>
            <div className="space-y-4">
              {section.items.map((item, ii) => {
                const key = `${si}-${ii}`;
                return (
                  <div key={key} className="rounded-xl border border-border bg-card p-5 hover:shadow-md transition-all">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground mb-2">{item.title}</h3>
                        <p className="text-muted-foreground text-sm leading-relaxed">{item.text}</p>
                      </div>
                      <button onClick={() => handleCopy(item.text, key)} className="shrink-0 p-2 rounded-lg border border-border hover:bg-muted transition-colors" title="Kopyala">
                        {copiedIndex === key ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4 text-muted-foreground" />}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        <div className="my-16 text-center p-10 rounded-2xl border border-primary/10 bg-gradient-to-br from-primary/5 via-background to-background">
          <h2 className="text-2xl font-bold text-foreground mb-3">Yorumlara manuel cevap vermek yerine otomatik yönetmek ister misiniz?</h2>
          <p className="text-muted-foreground mb-6">VoyageRespond, restoranınıza gelen her yorumu AI ile analiz eder ve markanıza uygun kişiselleştirilmiş yanıtlar üretir.</p>
          <button onClick={() => navigate("/onboarding")} className="px-8 py-3 rounded-md text-white font-medium transition-all hover:shadow-lg" style={{ backgroundColor: "#7A5AF8" }}>
            3 Ay Ücretsiz Deneyin <ArrowRight className="w-4 h-4 inline ml-1" />
          </button>
        </div>

        <AEOSection
          pageUrl="https://voyagerespond.com/restoran-yorum-cevaplari"
          faqs={[
            { question: "Restoran yorumlarına nasıl cevap verilir?", answer: "Restoran yorumlarına kişiselleştirilmiş, samimi ve profesyonel bir tonda yanıt verin. Müşterinin adını kullanın, bahsettiği yemeğe değinin ve tekrar ziyaret için teşvik edin. VoyageRespond gibi AI destekli yorum yönetim platformları bu süreci otomatikleştirir." },
            { question: "Restoran için yorum yönetimi neden önemlidir?", answer: "Tüketicilerin %89'u restoran seçmeden önce yorumları okuyor. Yorumlara düzenli ve profesyonel yanıt veren restoranlar %35 daha fazla güven kazanıyor ve Google sıralamalarında yükseliyor." },
            { question: "AI restoran yorumlarına cevap yazabilir mi?", answer: "Evet, VoyageRespond gibi AI destekli yorum yönetim platformları her yorumu analiz ederek restoranınızın tonuna uygun, kişiselleştirilmiş yanıtlar üretir. Manuel cevap yazmaya kıyasla %90 zaman tasarrufu sağlar." },
            { question: "Kötü restoran yorumuna nasıl cevap verilir?", answer: "Sakin kalın, özür dileyin, sorunu kabul edin ve somut bir çözüm sunun. Müşteriyi offline iletişime yönlendirin. VoyageRespond olumsuz yorumları anında tespit eder ve empatik yanıt önerileri sunar." },
          ]}
        />

        <div className="mt-12 p-6 rounded-xl bg-muted/50 border border-border">
          <h3 className="font-semibold text-foreground mb-4">İlgili Sayfalar</h3>
          <ul className="space-y-2">
            <li><button onClick={() => navigate("/google-yorum-cevap-ornekleri")} className="text-primary hover:underline text-sm">Google Yorum Cevap Örnekleri (25 Şablon) →</button></li>
            <li><button onClick={() => navigate("/otel-yorum-cevaplari")} className="text-primary hover:underline text-sm">Otel Yorum Cevapları (30 Şablon) →</button></li>
            <li><button onClick={() => navigate("/blog/chatgpt-ile-google-yorumlarina-nasil-cevap-yazilir")} className="text-primary hover:underline text-sm">ChatGPT ile Yorum Cevabı Nasıl Yazılır? →</button></li>
            <li><button onClick={() => navigate("/blog/otel-restoran-yorum-yonetimi-rehberi")} className="text-primary hover:underline text-sm">Otel ve Restoran Yorum Yönetimi Rehberi →</button></li>
          </ul>
        </div>
      </section>

      <footer className="border-t border-border bg-card/50">
        <div className="container mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 text-sm text-muted-foreground">
            <span>© 2026 VoyageRespond</span>
            <span className="hidden md:block">•</span>
            <button onClick={() => navigate("/privacy-policy")} className="hover:text-foreground">Gizlilik Politikası</button>
            <span className="hidden md:block">•</span>
            <button onClick={() => navigate("/terms-of-service")} className="hover:text-foreground">Kullanım Koşulları</button>
          </div>
        </div>
      </footer>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org", "@type": "Article",
        headline: "Restoran Yorum Cevapları: 30 Hazır Yanıt Şablonu",
        description: "Restoranlar için Google yorum yanıt şablonları.",
        author: { "@type": "Organization", name: "VoyageRespond" },
        mainEntityOfPage: "https://voyagerespond.com/restoran-yorum-cevaplari",
      })}} />
    </div>
  );
};

export default RestoranYorumCevaplari;
