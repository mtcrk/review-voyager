import { Link } from "react-router-dom";
import { ArrowRight, UtensilsCrossed, ChefHat, Clock, Star } from "lucide-react";
import voyageRespondLogo from "@/assets/voyage-respond-logo.svg";
import AEOSection from "@/components/seo/AEOSection";
import SEO from "@/components/seo/SEO";

const RestoranMusteriMemnuniyeti = () => {

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Restoran Müşteri Memnuniyeti: Ölçüm, Anket, Yorum Yönetimi 2026"
        description="Restoran müşteri memnuniyeti nasıl ölçülür ve artırılır? 4 boyutta ölçüm (yemek, servis, atmosfer, fiyat), anket örnekleri ve Google yorum stratejisi."
        alternates={[
          { hrefLang: "tr", href: "https://voyagerespond.com/restoran-musteri-memnuniyeti/" },
          { hrefLang: "en", href: "https://voyagerespond.com/restaurant-customer-satisfaction/" },
          { hrefLang: "x-default", href: "https://voyagerespond.com/restaurant-customer-satisfaction/" },
        ]}
        canonical="https://voyagerespond.com/restoran-musteri-memnuniyeti"
      />

      <nav className="sticky top-0 z-50 border-b backdrop-blur-lg bg-white/95">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex h-16 items-center justify-between">
            <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <img src={voyageRespondLogo} alt="VoyageRespond" className="h-7 w-7" />
              <span className="text-lg" style={{ color: "#1F2937" }}>
                <span className="font-normal">Voyage</span><span className="font-semibold">Respond</span>
              </span>
            </Link>
            <div className="flex items-center gap-4">
              <Link to="/blog/" className="hidden sm:block text-sm font-medium text-muted-foreground hover:text-foreground">Blog</Link>
              <Link to="/demo/" className="px-4 py-2 rounded-md text-sm font-medium text-white" style={{ backgroundColor: "#7A5AF8" }}>
                Ücretsiz Dene
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <section className="container mx-auto px-4 sm:px-6 py-12 sm:py-16 max-w-4xl">
        <div className="text-center mb-10 sm:mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            <UtensilsCrossed className="w-4 h-4" />
            Restoranlara Özel
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-4 leading-tight">
            Restoran Müşteri Memnuniyeti: Ölçme, Artırma ve Yıldıza Çevirme
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
            Restoran müşteri memnuniyetinin 4 boyutu (yemek, servis, atmosfer, fiyat), anket örnekleri, şikayet yönetimi ve Google yorumlarına dönüştürme stratejisi.
          </p>
        </div>

        <article className="prose prose-lg max-w-none">
          <h2 className="text-2xl font-bold mt-8 mb-4">Restoran Müşteri Memnuniyeti Nedir?</h2>
          <p className="text-muted-foreground leading-relaxed">
            Restoran müşteri memnuniyeti, misafirin restoranınızdan beklediği <strong>yemek + servis + atmosfer + fiyat</strong> deneyiminin gerçekleşen deneyimle örtüşme oranıdır. Sektörel araştırmalara göre tüketicilerin <strong>%87'si</strong> restoran seçmeden önce Google yorumlarını okur; ortalama yıldızı 4.4'ün altında olan restoranların yerel aramada ilk 3'e girme şansı <strong>%70 azalır</strong>.
          </p>

          <h2 className="text-2xl font-bold mt-12 mb-4">Memnuniyetin 4 Boyutu</h2>
          <div className="grid sm:grid-cols-2 gap-4 my-6">
            {[
              { icon: ChefHat, title: "Yemek", desc: "Lezzet, sıcaklık, sunum, porsiyon. Tüm şikayetlerin %42'si buradan gelir." },
              { icon: Clock, title: "Servis", desc: "Hız, ilgi, sorun çözme. 2. en sık şikayet kategorisi." },
              { icon: Star, title: "Atmosfer", desc: "Temizlik, müzik, mekan dekoru, konfor. Tekrar gelmeyi belirleyen #1 faktör." },
              { icon: UtensilsCrossed, title: "Fiyat-Değer", desc: "Mutlak fiyat değil, alınan değere oran önemli." },
            ].map((s, i) => (
              <div key={i} className="rounded-xl border border-border bg-card p-5">
                <s.icon className="w-5 h-5 text-primary mb-2" />
                <div className="font-semibold text-foreground mb-1">{s.title}</div>
                <div className="text-sm text-muted-foreground">{s.desc}</div>
              </div>
            ))}
          </div>

          <h2 className="text-2xl font-bold mt-12 mb-4">Memnuniyet Nasıl Ölçülür?</h2>
          <p className="text-muted-foreground leading-relaxed">
            Restoran için en etkili 3 yöntem:
          </p>
          <ol className="space-y-2 text-muted-foreground list-decimal pl-6">
            <li><strong>Ödeme sonrası mikro anket.</strong> 2 saat içinde SMS/WhatsApp ile tek soru: "1-5 arası ziyaretiniz nasıldı?"</li>
            <li><strong>QR kod masada.</strong> Masaya küçük QR koyun → 30 saniyelik anket.</li>
            <li><strong>Google yorum analizi.</strong> Mevcut yorumlardan duygu kategorisi çıkarın (yemek/servis/atmosfer/fiyat).</li>
          </ol>
          <p className="text-muted-foreground mt-4">
            5 hazır anket şablonu için → <a href="/blog/musteri-memnuniyet-anketi-ornekleri/" className="text-primary hover:underline">Müşteri Memnuniyet Anketi Örnekleri</a>.
          </p>

          <h2 className="text-2xl font-bold mt-12 mb-4">Restoran Müşteri Memnuniyetini Artıran 7 Pratik</h2>
          <ol className="space-y-3 text-muted-foreground list-decimal pl-6">
            <li><strong>İlk 60 saniye protokolü.</strong> Misafir oturduğunda 60 saniye içinde su + selam.</li>
            <li><strong>Menü açıklamasını gerçekçi tutun.</strong> "Az pişmiş" yerine "kanlı" gibi net ifadeler beklentiyi yönetir.</li>
            <li><strong>Garson rotasyonu yapmayın.</strong> Aynı garson masaya başından sonuna kadar baksın.</li>
            <li><strong>Şikayeti masadan çıkmadan çözün.</strong> Mutfak hatası olursa hemen telafi (içecek/tatlı ikramı).</li>
            <li><strong>Mutfak süresini şeffaflaştırın.</strong> "10 dakika sürer" demek beklemeyi 2x kısa hissettirir.</li>
            <li><strong>Çıkışta teşekkür.</strong> Garson kapıya kadar uğurlamak NPS'i 12 puan artırır.</li>
            <li><strong>24 saat içinde takip mesajı.</strong> Memnun müşteriden Google yorumu isteyin.</li>
          </ol>

          <h2 className="text-2xl font-bold mt-12 mb-4">Şikayet Yönetimi: Restoran Spesifik</h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            En sık karşılaşılan 5 şikayet ve nasıl yönetilir:
          </p>
          <ul className="space-y-2 text-muted-foreground">
            <li><strong>Yemek soğuk geldi:</strong> Anında yenisini sıcak getir, içecek ikram et.</li>
            <li><strong>Yavaş servis:</strong> 10 dakika önce müşteriye haber ver, gecikmeyi açıkla.</li>
            <li><strong>Yanlış sipariş:</strong> Doğrusunu getirirken yanlışı iade etme, ikram olarak bırak.</li>
            <li><strong>Kaba personel:</strong> Müdür/şef masaya inip kişisel olarak özür dilesin.</li>
            <li><strong>Hesap hatası:</strong> Hatayı kabul et, indirim sun, kasiyerle özel eğitim yap.</li>
          </ul>

          <h2 className="text-2xl font-bold mt-12 mb-4">Memnuniyetten Google Yıldızına</h2>
          <p className="text-muted-foreground leading-relaxed">
            Memnun müşteri kendiliğinden yorum yazmaz — <strong>istemeniz gerekir</strong>. Mikro anketten 4-5 alanları doğrudan Google yorum linkine yönlendirin; 1-3 alanları ise restorana özel iletişim formuna. Bu basit ayrıştırma, ortalama yıldızınızı 6 ayda 4.1'den 4.6'ya çıkarır.
          </p>

          <h2 className="text-2xl font-bold mt-12 mb-4">AI ile Restoran Memnuniyet Yönetimi</h2>
          <p className="text-muted-foreground leading-relaxed">
            VoyageRespond restoranlar için Google, Yemeksepeti, TripAdvisor ve Zomato yorumlarınızı tek panelden çeker. Her yoruma marka tonunuza uygun kişisel yanıt üretir, kategori bazlı (yemek/servis/temizlik) duygu trendlerini haftalık raporlar.
          </p>
        </article>

        <div className="my-16 text-center p-8 sm:p-10 rounded-2xl border border-primary/10 bg-gradient-to-br from-primary/5 via-background to-background">
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">
            Restoranınızın yıldızlarını yükseltin
          </h2>
          <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
            Tüm Google, Yemeksepeti ve TripAdvisor yorumlarınızı AI ile yönetin. 3 ay ücretsiz deneyin.
          </p>
          <Link to="/demo/" className="px-8 py-3 rounded-md text-white font-medium hover:shadow-lg min-h-[48px]" style={{ backgroundColor: "#7A5AF8" }}>
            Ücretsiz Başla <ArrowRight className="w-4 h-4 inline ml-1" />
          </Link>
        </div>

        <AEOSection
          pageUrl="https://voyagerespond.com/restoran-musteri-memnuniyeti"
          faqs={[
            { question: "Restoran müşteri memnuniyeti nasıl ölçülür?", answer: "Ödeme sonrası 2 saat içinde gönderilen SMS/WhatsApp mikro anketleri (tek soruluk 1-5 değerlendirme), masadaki QR kod anketleri ve mevcut Google yorumlarının kategori bazlı duygu analizi ile ölçülür. Bu üçü birleşince haftalık trend takibi mümkün olur." },
            { question: "Restoranımda memnuniyeti en hızlı nasıl artırırım?", answer: "İlk 60 saniye protokolü (oturunca su+selam), garson rotasyonu yapmamak, şikayeti masada çözmek ve çıkışta kapıya kadar uğurlamak — bu 4 pratik 30 günde memnuniyet skorunu 10-15 puan artırır." },
            { question: "Memnun müşteriden Google yorumunu nasıl alırım?", answer: "Ödeme sonrası SMS ile 1-5 arası mikro anket gönderin; 4-5 verenleri doğrudan Google yorum linkine, 1-3 verenleri restoran iletişim formuna yönlendirin. Bu ayrıştırma ortalama yıldızı korurken yorum sayısını 3x artırır." },
            { question: "Olumsuz Google yorumunu nasıl yönetirim?", answer: "24 saat içinde profesyonel yanıt yazın: özür, somut aksiyon, sizinle doğrudan iletişim çağrısı. Yorum sahte/haksızsa Google'a 'Uygunsuz olarak işaretle' ile şikayet edin. Detaylı çerçeve için olumsuz Google yorumu rehberimize bakın." },
            { question: "Yemeksepeti puanım Google'ı etkiler mi?", answer: "Doğrudan etkilemez ama tüketici davranışını etkiler. Yemeksepeti puanı düşük olan restoranların Google yorum sayısı zamanla %40 düşüyor çünkü misafir önce Yemeksepeti'ne bakıp vazgeçiyor. Çoklu platform yönetimi şart." },
          ]}
        />

        <div className="mt-12 p-6 rounded-xl bg-muted/50 border border-border">
          <h3 className="font-semibold text-foreground mb-4">İlgili Rehberler</h3>
          <ul className="space-y-2">
            <li><Link to="/musteri-memnuniyeti/" className="text-primary hover:underline text-sm">Müşteri Memnuniyeti Nedir? →</Link></li>
            <li><Link to="/restoran-yorum-cevaplari/" className="text-primary hover:underline text-sm">Restoran Yorum Cevap Şablonları →</Link></li>
            <li><Link to="/blog/musteri-memnuniyet-anketi-ornekleri/" className="text-primary hover:underline text-sm">Müşteri Memnuniyet Anketi Örnekleri →</Link></li>
            <li><Link to="/blog/musteri-memnuniyet-mesaji-ornekleri/" className="text-primary hover:underline text-sm">Müşteri Memnuniyet Mesajı Örnekleri →</Link></li>
            <li><Link to="/online-itibar-yonetimi/" className="text-primary hover:underline text-sm">Online İtibar Yönetimi →</Link></li>
          </ul>
        </div>
      </section>

      <footer className="border-t border-border bg-card/50">
        <div className="container mx-auto px-4 sm:px-6 py-8">
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 text-sm text-muted-foreground">
            <span>© 2026 VoyageRespond</span>
            <span className="hidden md:block">•</span>
            <Link to="/privacy-policy/" className="hover:text-foreground">Gizlilik Politikası</Link>
            <span className="hidden md:block">•</span>
            <Link to="/terms-of-service/" className="hover:text-foreground">Kullanım Koşulları</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default RestoranMusteriMemnuniyeti;