import { useNavigate } from "react-router-dom";
import { ArrowRight, Copy, Check, Hotel } from "lucide-react";
import voyageRespondLogo from "@/assets/voyage-respond-logo.svg";
import { useState } from "react";
import AEOSection from "@/components/seo/AEOSection";
import SEO from "@/components/seo/SEO";

const templates = [
  { category: "🏨 Booking.com Yorumları için Cevap Örnekleri", items: [
    { title: "Genel memnuniyet", text: "Sayın [İsim], otelimizde keyifli bir konaklama geçirmenize çok sevindik! Misafir memnuniyeti her zaman önceliğimizdir. Bir sonraki seyahatinizde sizi tekrar ağırlamaktan büyük mutluluk duyarız. İyi yolculuklar! 🏨" },
    { title: "Oda övgüsü", text: "Merhaba [İsim], odamızın konforundan memnun kalmanıza çok mutlu olduk! Her detayı misafirlerimizin rahatlığı için özenle seçiyoruz. Bir sonraki konaklamanızda süit odalarımızı da denemenizi tavsiye ederiz. ✨" },
    { title: "Manzara övgüsü", text: "[İsim], manzaramızı beğenmenize sevindik! [Deniz/dağ/şehir] manzaralı odalarımız en çok tercih edilen seçeneklerimiz. Erken rezervasyonla daha uygun fiyatlarla bu deneyimi yakalayabilirsiniz. 🌅" },
    { title: "Kahvaltı övgüsü", text: "Sayın [İsim], açık büfe kahvaltımızı beğenmenize çok sevindik! Taze pişirilen böreklerimiz, yerel peynirlerimiz ve ev yapımı reçellerimiz misafirlerimizin favorisi. Her gün yeni lezzetler ekliyoruz! ☕" },
    { title: "Spa/havuz övgüsü", text: "Merhaba [İsim], spa merkezimizde dinlendirici bir deneyim yaşamanıza mutlu olduk! Masaj ve bakım paketlerimiz hakkında detaylı bilgi için resepsiyonumuzla iletişime geçebilirsiniz. 🧖‍♀️" },
  ]},
  { category: "👤 Personel ve Hizmet — Olumlu", items: [
    { title: "Resepsiyon övgüsü", text: "[İsim], resepsiyon ekibimiz hakkındaki güzel sözleriniz için teşekkürler! Güler yüzlü ve çözüm odaklı hizmet sunmak temel prensi̇bi̇mi̇z. Geri bildiriminizi ekiple paylaştık, çok mutlu oldular! 😊" },
    { title: "Concierge övgüsü", text: "Sayın [İsim], concierge hizmetimizi takdir etmenize sevindik! Şehirdeki en iyi restoran ve gezi önerilerini sunmak için her zaman hazırız. Bir sonraki ziyaretinizde de size yardımcı olmaktan mutluluk duyarız." },
    { title: "Housekeeping övgüsü", text: "Merhaba [İsim], oda temizliğimizi beğenmenize çok mutlu olduk! Housekeeping ekibimiz her odayı titizlikle hazırlıyor. Güzel sözlerinizi ekiple paylaştık — motive oldular! 🌟" },
    { title: "Özel hizmet", text: "[İsim], [özel istek/organizasyon] için güzel sözleriniz bizi çok mutlu etti! Her misafirimize özel bir deneyim sunmak en büyük hedefimiz. Gelecekteki organizasyonlarınız için de yanınızdayız!" },
  ]},
  { category: "📍 TripAdvisor Yorumlarına Profesyonel Yanıt", items: [
    { title: "Konum övgüsü", text: "Sayın [İsim], merkezi konumumuzu beğenmenize sevindik! [Bölge] bölgesinin en güzel noktalarına yürüme mesafesindeyiz. Shuttle hizmetimiz de mevcuttur. Tekrar bekleriz! 📍" },
    { title: "Restoran övgüsü", text: "Merhaba [İsim], otel restoranımızdaki deneyiminizi beğenmenize çok mutlu olduk! Şefimiz yerel lezzetleri modern dokunuşlarla sunuyor. Akşam yemeği için özel menümüzü denemenizi tavsiye ederiz. 🍽️" },
    { title: "Genel tesis", text: "[İsim], tesislerimizi beğenmenize sevindik! Fitness merkezi, spa ve açık yüzme havuzumuz misafirlerimizin hizmetinde. Bir sonraki konaklamanızda hepsini denemenizi öneririz!" },
  ]},
  { category: "⭐⭐⭐ Nötr Değerlendirmeler", items: [
    { title: "Karma yorum", text: "Sayın [İsim], detaylı değerlendirmeniz için teşekkürler. [Beğenilen kısım] hakkındaki güzel sözleriniz ekibimizi mutlu etti. [İyileştirilecek kısım] konusunda hemen aksiyon aldık ve iyileştirmeler devam ediyor." },
    { title: "Beklenti farklılığı", text: "Merhaba [İsim], beklentilerinizi tam olarak karşılayamadığımız için üzgünüz. Geri bildiriminizi detaylı olarak inceledik. Lütfen bize doğrudan ulaşın ki durumu anlamak ve bir sonraki konaklamanızı mükemmelleştirmek isteriz." },
    { title: "Fiyat endişesi", text: "[İsim], değerlendirmeniz için teşekkürler. Kaliteli hizmet ve konfor sunma kararlılığımız fiyatlarımıza yansıyor. Erken rezervasyon ve sezon dışı kampanyalarımız daha uygun seçenekler sunuyor. Web sitemizi takip edin!" },
  ]},
  { category: "❌ Olumsuz Otel Yorumlarına Nasıl Cevap Verilir?", items: [
    { title: "Oda temizliği", text: "Sayın [İsim], oda temizliğiyle ilgili yaşadığınız deneyim standartlarımızın çok altındadır. Housekeeping ekibimizle acil bir değerlendirme toplantısı yaptık. Size özel bir konaklama teklifi sunmak isteriz — lütfen bize ulaşın." },
    { title: "Klima/ısıtma sorunu", text: "Merhaba [İsim], odanızdaki klima sorunundan dolayı çok üzgünüz. Teknik ekibimiz tüm odaların klima sistemlerini kontrol etti. Bu tür sorunlar anında çözülmeli — resepsiyonumuza haber vermenizi rica ederiz." },
    { title: "Gürültü şikayeti", text: "[İsim], gürültü sorunu yaşamanız için samimiyetle özür dileriz. Sessiz oda talebinizi not ediyoruz — bir sonraki konaklamanızda üst katlardaki sakin odalarımızı tahsis edeceğiz." },
    { title: "Wi-Fi sorunu", text: "Sayın [İsim], internet bağlantısı konusundaki sorun için özür dileriz. Altyapımızı yeni fiber sisteme geçirdik ve tüm odalarda yüksek hızlı erişim sağlıyoruz. Bir sonraki ziyaretinizde farkı göreceksiniz." },
    { title: "Banyo sorunu", text: "Merhaba [İsim], banyodaki sorun için samimiyetle özür dileriz. Bakım ekibimiz tüm odaları kontrol etti. Bu tür aksaklıkların yaşanmaması için düzenli bakım programımızı güçlendirdik." },
  ]},
  { category: "❌ Servis Şikayetleri", items: [
    { title: "Check-in/check-out", text: "Sayın [İsim], giriş/çıkış sürecindeki bekleme için samimiyetle özür dileriz. Online check-in seçeneğimizi devreye aldık, böylece bir sonraki konaklamanızda bekleme olmadan odanıza geçebilirsiniz." },
    { title: "Resepsiyon şikayeti", text: "[İsim], resepsiyondaki deneyiminiz için çok üzgünüz. Ekibimize ek misafir ilişkileri eğitimi verdik. Bu tür durumların tekrarlanmaması için gerekli önlemleri aldık." },
    { title: "Kahvaltı şikayeti", text: "Merhaba [İsim], kahvaltı büfemizin beklentilerinizi karşılayamaması için üzgünüz. Menümüzü yeniledik ve daha fazla çeşit ekledik. Bir sonraki konaklamanızda farkı göreceksiniz!" },
    { title: "Room service", text: "Sayın [İsim], oda servisi deneyiminiz için özür dileriz. Servis süremizi kısaltmak için sipariş sistemimizi güncelledik. Lezzetli yemeklerimizi zamanında sunmak önceliğimiz." },
    { title: "Rezervasyon hatası", text: "[İsim], rezervasyonunuzla ilgili yaşanan karışıklık için samimiyetle özür dileriz. Rezervasyon sistemimizi yeniledik ve çift kontrol mekanizması ekledik. Size özel bir telafi teklifi sunmak isteriz." },
  ]},
  { category: "🌍 Booking/TripAdvisor Özel", items: [
    { title: "Booking olumlu", text: "Dear [İsim], thank you for choosing our hotel through Booking.com! We're thrilled you enjoyed your stay. Your review motivates our team. We look forward to hosting you again. Warm regards! 🙏" },
    { title: "TripAdvisor olumlu", text: "Thank you so much [İsim] for your wonderful TripAdvisor review! It means a lot to our team. We hope to welcome you back for another memorable stay. Safe travels! ✈️" },
    { title: "Booking olumsuz", text: "Dear [İsim], we sincerely apologize for the issues during your stay. Your feedback has been shared with our management team and corrective actions have been taken. Please contact us directly for a special offer on your next visit." },
  ]},
];

const OtelYorumCevaplari = () => {
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
        title="Otel Yorum Cevap Örnekleri | Booking, TripAdvisor için 30 Şablon"
        description="Otelinize gelen Google, Booking ve TripAdvisor yorumlarına profesyonel cevap örnekleri. Misafir memnuniyeti, şikayet yönetimi ve oda sorunları için 30 hazır şablon."
        canonical="https://voyagerespond.com/otel-yorum-cevaplari"
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
            <Hotel className="w-4 h-4" />
            Otellere Özel
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Otel Yorum Cevapları: Booking ve TripAdvisor için Hazır Şablonlar
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Otelinize gelen Google, Booking.com ve TripAdvisor yorumlarına profesyonel cevap örnekleri. Misafir memnuniyeti, şikayet yönetimi ve oda sorunları için hazır yanıt şablonları.
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
          <p className="text-muted-foreground mb-6">VoyageRespond, Google, Booking ve TripAdvisor yorumlarınızı tek panelden AI ile yönetir.</p>
          <button onClick={() => navigate("/onboarding")} className="px-8 py-3 rounded-md text-white font-medium transition-all hover:shadow-lg" style={{ backgroundColor: "#7A5AF8" }}>
            3 Ay Ücretsiz Deneyin <ArrowRight className="w-4 h-4 inline ml-1" />
          </button>
        </div>

        <AEOSection
          pageUrl="https://voyagerespond.com/otel-yorum-cevaplari"
          faqs={[
            { question: "Otel yorumlarına nasıl cevap verilir?", answer: "Otel yorumlarına kişiselleştirilmiş, empatik ve profesyonel bir tonda yanıt verin. Misafirin adını kullanın, konaklama deneyimine değinin ve tekrar ziyaret için teşvik edin. VoyageRespond gibi AI destekli yorum yönetim platformları bu süreci otomatikleştirir." },
            { question: "Booking ve TripAdvisor yorumlarına da cevap vermeli miyim?", answer: "Kesinlikle evet. Booking.com ve TripAdvisor, otel rezervasyonlarının büyük bölümünü etkiler. VoyageRespond, Google, Booking ve TripAdvisor yorumlarını tek panelden yönetmenizi sağlayan AI destekli bir yorum yönetim platformudur." },
            { question: "AI otel yorumlarına cevap yazabilir mi?", answer: "Evet, VoyageRespond gibi AI destekli yorum yönetim platformları her yorumu analiz ederek otelinizin tonuna uygun, çok dilli ve kişiselleştirilmiş yanıtlar üretir." },
            { question: "Olumsuz otel yorumlarına nasıl yaklaşılmalı?", answer: "Sakin kalın, samimiyetle özür dileyin, sorunu kabul edin ve somut çözüm sunun. Misafiri özel iletişim kanalına yönlendirin. VoyageRespond olumsuz yorumları anında tespit eder ve empatik yanıt önerileri sunar." },
          ]}
        />

        <div className="mt-12 p-6 rounded-xl bg-muted/50 border border-border">
          <h3 className="font-semibold text-foreground mb-4">İlgili Sayfalar</h3>
          <ul className="space-y-2">
            <li><button onClick={() => navigate("/google-yorum-cevap-ornekleri")} className="text-primary hover:underline text-sm">Google Yorum Cevap Örnekleri (25 Şablon) →</button></li>
            <li><button onClick={() => navigate("/restoran-yorum-cevaplari")} className="text-primary hover:underline text-sm">Restoran Yorum Cevapları (30 Şablon) →</button></li>
            <li><button onClick={() => navigate("/blog/google-yorum-cevap-araclari-2026")} className="text-primary hover:underline text-sm">En İyi Yorum Yönetim Araçları (2026) →</button></li>
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
        headline: "Otel Yorum Cevapları: 30 Hazır Yanıt Şablonu",
        description: "Oteller için Google, Booking ve TripAdvisor yorum yanıt şablonları.",
        author: { "@type": "Organization", name: "VoyageRespond" },
        mainEntityOfPage: "https://voyagerespond.com/otel-yorum-cevaplari",
      })}} />
    </div>
  );
};

export default OtelYorumCevaplari;
