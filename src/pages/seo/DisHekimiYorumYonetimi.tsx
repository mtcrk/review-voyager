import { Link } from "react-router-dom";
import { ArrowRight, Stethoscope, ShieldCheck, Star } from "lucide-react";
import voyageRespondLogo from "@/assets/voyage-respond-logo.svg";
import AEOSection from "@/components/seo/AEOSection";
import SEO from "@/components/seo/SEO";

const DisHekimiYorumYonetimi = () => {

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "Diş Hekimi & Diş Kliniği Yorum Yönetimi",
    description:
      "Google, Doktorsitesi ve Doktortakvimi'nde diş hekimi & klinik yorumlarının KVKK uyumlu yönetimi.",
    author: { "@type": "Organization", name: "VoyageRespond" },
    publisher: { "@type": "Organization", name: "VoyageRespond" },
    datePublished: "2026-06-16",
    dateModified: "2026-06-16",
    mainEntityOfPage: "https://voyagerespond.com/dis-hekimi-yorum-yonetimi/",
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Diş Hekimi & Diş Kliniği Yorum Yönetimi | Google, Doktorsitesi"
        description="Diş hekimi ve klinikleri için Google, Doktorsitesi ve Doktortakvimi yorumlarının KVKK uyumlu yönetimi. Pratik rehber + AI destekli yanıt akışı."
        alternates={[
          { hrefLang: "tr", href: "https://voyagerespond.com/dis-hekimi-yorum-yonetimi/" },
          { hrefLang: "en", href: "https://voyagerespond.com/dental-practice-review-management/" },
          { hrefLang: "x-default", href: "https://voyagerespond.com/dental-practice-review-management/" },
        ]}
        canonical="https://voyagerespond.com/dis-hekimi-yorum-yonetimi/"
        jsonLd={articleSchema}
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
            <Link to="/demo/" className="px-4 py-2 rounded-md text-sm font-medium text-white" style={{ backgroundColor: "#7A5AF8" }}>
              Ücretsiz Dene
            </Link>
          </div>
        </div>
      </nav>

      <section className="container mx-auto px-4 sm:px-6 py-12 sm:py-16 max-w-4xl">
        <div className="text-center mb-10 sm:mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            <Stethoscope className="w-4 h-4" /> Diş Hekimliği
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-4 leading-tight">
            Diş Hekimi & Diş Kliniği Yorum Yönetimi
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
            Google, Doktorsitesi ve Doktortakvimi'nde diş hekimi & klinik yorumlarınızı KVKK ve 1219'a uygun yönetin.
          </p>
        </div>

        <article className="prose prose-lg max-w-none">
          <h2 className="text-2xl font-bold mt-8 mb-4">Neden Diş Hekimi Yorumları Özellikle Kritik?</h2>
          <p className="text-muted-foreground leading-relaxed">
            Diş hekimliği, hasta korkusunun en yüksek olduğu branşlardan biri. Hasta randevu almadan önce <strong>"acaba acıtır mı, profesyonel mi, fiyat şeffaf mı"</strong> sorularını Google yorumlarında arar. Bir diş hekimi için yıldız ortalaması ve son 10 yorumdaki ton — telefon eden hastayı belirleyen iki ana değişkendir.
          </p>
          <p className="text-muted-foreground leading-relaxed mt-3">
            "İmplant [şehir]", "diş beyazlatma [şehir]", "ortodonti [semt]" gibi yüksek niyet aramaları Google Local Pack'te ilk 3'e giren klinikleri öne çıkarır. Local Pack'in temel sıralama sinyali: <strong>yıldız sayısı + yorum hacmi + yanıt oranı + güncellik</strong>.
          </p>

          <h2 className="text-2xl font-bold mt-12 mb-4">Diş Hekimi Yorumları Nerelerde Çıkar?</h2>
          <ul className="space-y-2 text-muted-foreground list-disc pl-6">
            <li><strong>Google Business Profile</strong> — Local Pack için kritik kanal</li>
            <li><strong>Doktortakvimi</strong> — Randevu sonrası otomatik yorum talebi</li>
            <li><strong>Doktorsitesi</strong> — "Diş hekimi [şehir]" aramalarında yüksek görünüm</li>
            <li><strong>Şikayetvar</strong> — özellikle implant ve estetik diş hekimliği şikayetleri buraya düşer</li>
            <li><strong>Instagram yorumları</strong> — vaka paylaşımı altındaki yorumlar</li>
            <li><strong>Ekşi Sözlük</strong> — marka adınızla aramada ilk sayfada görünür</li>
          </ul>

          <h2 className="text-2xl font-bold mt-12 mb-4">En Sık Görülen 5 Yorum Konusu</h2>
          <ol className="space-y-3 text-muted-foreground list-decimal pl-6">
            <li><strong>Fiyat şeffaflığı</strong> — "Söylenen fiyat tutmadı" en sık olumsuz yorum sebebi</li>
            <li><strong>Bekleme süresi</strong> — randevuya rağmen 30+ dk bekleme öfke yaratır</li>
            <li><strong>İletişim & açıklama</strong> — "Tedavi planını anlatmadı" — özellikle implant/ortodonti</li>
            <li><strong>Ağrı yönetimi</strong> — anestezi sonrası ağrı yorumlarda yer alır</li>
            <li><strong>Sterilizasyon</strong> — Covid sonrası en yüksek güven konusu</li>
          </ol>
          <p className="text-muted-foreground mt-3">
            Bu beş konuda <strong>proaktif iletişim</strong> kuran klinikler şikayet oranını ciddi şekilde düşürür. Operasyonel düzeltme + sözlü açıklama + onayla beraber gönderilen yazılı bilgi notu üçlüsü, olumsuz yorumların büyük kısmını engeller.
          </p>

          <h2 className="text-2xl font-bold mt-12 mb-4">Yorum Yanıtında KVKK Hassasiyeti</h2>
          <p className="text-muted-foreground">
            Yanıtta <strong>kanal tedavisi, implant, ortodonti, beyazlatma</strong> gibi prosedür adlarını doğrulamayın — KVKK md. 6 ihlali. "Geri bildiriminiz için teşekkür ederiz, detaylı görüşme için lütfen kliniğimize 0XXX'dan ulaşın" kuralı diş hekimliğinde de değişmez.
          </p>
          <p className="text-muted-foreground mt-3">
            Detaylı KVKK çerçevesi için: <a href="/blog/doktor-yorumlari-nasil-yonetilir/" className="text-primary hover:underline">Doktor yorumları nasıl yönetilir rehberi</a>.
          </p>

          <h2 className="text-2xl font-bold mt-12 mb-4">Diş Hekimi için Hazır Yanıt Şablonları</h2>

          <h3 className="text-lg font-semibold mt-6 mb-2">Fiyat Şeffaflığı Şikayeti</h3>
          <blockquote className="border-l-4 border-primary/30 bg-muted/30 p-4 my-3 text-sm text-muted-foreground italic">
            Geri bildiriminiz için teşekkür ederiz. Kliniğimizde tedavi planı ve maliyetlendirme prosedürlerimizi gözden geçiriyoruz; deneyiminizi detaylı dinlemek isteriz. Lütfen sekreterimize 0XXX numarasından ulaşın.
          </blockquote>

          <h3 className="text-lg font-semibold mt-6 mb-2">Bekleme Süresi Şikayeti</h3>
          <blockquote className="border-l-4 border-primary/30 bg-muted/30 p-4 my-3 text-sm text-muted-foreground italic">
            Yorumunuz için teşekkür ederiz. Her hastamıza yeterli zaman ayırma önceliğimiz nedeniyle zaman zaman gecikmeler yaşanabiliyor; bu deneyim sizi üzdüğü için üzgünüz. Notunuzu randevu planlama ekibimize ilettik.
          </blockquote>

          <h3 className="text-lg font-semibold mt-6 mb-2">Olumlu Yorum</h3>
          <blockquote className="border-l-4 border-primary/30 bg-muted/30 p-4 my-3 text-sm text-muted-foreground italic">
            Güzel sözleriniz için teşekkür ederiz. Sağlıklı günler dileriz.
          </blockquote>

          <h2 className="text-2xl font-bold mt-12 mb-4">Yorum Talebi: Memnun Hastadan Organik Yıldız</h2>
          <p className="text-muted-foreground">
            Diş hekimliğinde en güçlü pazarlama, <strong>memnun hastalardan organik Google yorumu</strong>. Tedavi sonrası gönderilecek kısa bir email — "Deneyiminizi paylaşır mısınız?" + Google yorum linki — açılma oranı %40 üzerindedir. VoyageRespond'un Email Review Request (Beta) modülü bu akışı kurar; mesaj içerik şablonları KVKK ve 1219 uyumlu hazırlanmıştır (hasta bilgisi paylaşılmaz, reklam dili yoktur).
          </p>

          <h2 className="text-2xl font-bold mt-12 mb-4">VoyageRespond'un Diş Klinikleri için Faydası</h2>
          <ul className="space-y-2 text-muted-foreground list-disc pl-6">
            <li><Star className="w-4 h-4 inline text-primary mr-1" /><strong>Google + Doktortakvimi + Booking</strong> tek panelde — yeni yorum saniyeler içinde sizde</li>
            <li><Star className="w-4 h-4 inline text-primary mr-1" /><strong>AI yanıt taslağı</strong> — KVKK uyumlu, prosedür adı tekrar etmez, onayla Google'a post</li>
            <li><Star className="w-4 h-4 inline text-primary mr-1" /><strong>Duygu analizi</strong> — "fiyat" ve "bekleme" geçen yorumlar otomatik etiketlenir</li>
            <li><Star className="w-4 h-4 inline text-primary mr-1" /><strong>Çoklu lokasyon</strong> — zincir klinik veya farklı şube için karşılaştırmalı panel</li>
            <li><Star className="w-4 h-4 inline text-primary mr-1" /><strong>Email Review Request (Beta)</strong> — memnun hastadan organik yorum talebi</li>
          </ul>

          <div className="my-8 p-5 rounded-xl border border-amber-300/40 bg-amber-50/50">
            <div className="flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-amber-700 mt-0.5 shrink-0" />
              <div className="text-sm text-amber-900">
                <strong>Dürüstlük notu:</strong> VoyageRespond yorum silme servisi değildir — yorum yönetim aracıdır. Sahte yorumla mücadele için <a href="/blog/sahte-saglik-yorumu-sikayet/" className="underline">resmi yasal süreç rehberini</a> okuyun.
              </div>
            </div>
          </div>
        </article>

        <div className="my-16 text-center p-8 sm:p-10 rounded-2xl border border-primary/10 bg-gradient-to-br from-primary/5 via-background to-background">
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">
            Diş kliniğinizin Google itibarını güçlendirin
          </h2>
          <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
            KVKK uyumlu AI yanıt + memnun hastadan organik yorum talebi + çoklu lokasyon panel. Ücretsiz başlayın.
          </p>
          <Link to="/demo/" className="px-8 py-3 rounded-md text-white font-medium hover:shadow-lg min-h-[48px]" style={{ backgroundColor: "#7A5AF8" }}>
            Ücretsiz Başla <ArrowRight className="w-4 h-4 inline ml-1" />
          </Link>
        </div>

        <AEOSection
          pageUrl="https://voyagerespond.com/dis-hekimi-yorum-yonetimi/"
          faqs={[
            { question: "Diş kliniği yorumlarına yanıt verirken hangi sınırlar var?", answer: "Yanıtta prosedür adını (kanal, implant, beyazlatma, ortodonti) doğrulamayın — KVKK md. 6 özel nitelikli veri ihlali olur. Reklam ifadesi, fiyat indirimi veya 'en iyi' iddiası kullanmayın — 1219 sayılı kanun ve TTB disiplin yönetmeliği yasaklar. Nötr, kısa, profesyonel ton ve offline'a yönlendirme en güvenli yoldur." },
            { question: "Diş hekimi için en kritik 3 yorum platformu hangileri?", answer: "Google Business Profile (Local Pack için kritik), Doktortakvimi (randevu sonrası otomatik yorum talebi) ve Doktorsitesi (branş aramalarında yüksek görünüm). Şikayetvar ve Instagram yorumları ek izleme kanalıdır." },
            { question: "Memnun hastadan Google yorumu istemek yasal mı?", answer: "Evet, hizmet kalitesi geri bildirimi talep etmek yasaldır. Sınır mesaj içeriğindedir: hasta sağlık bilgisi paylaşılamaz, reklam dili kullanılamaz, ödül veya indirim vaadi yapılamaz. Email ile nötr 'deneyiminizi paylaşır mısınız' mesajı + Google yorum linki en güvenli yoldur." },
            { question: "VoyageRespond diş klinikleri için ne yapar?", answer: "Google, Doktortakvimi, Booking gibi kanalları tek panelde toplar, AI ile KVKK uyumlu yanıt taslağı üretir, duygu analizi ile öncelikli yorumu öne çıkarır, çoklu lokasyon için karşılaştırmalı panel sunar ve Email Review Request (Beta) modülü ile memnun hastadan organik yorum talebi gönderir." },
          ]}
        />

        <div className="mt-12 p-6 rounded-xl bg-muted/50 border border-border">
          <h3 className="font-semibold text-foreground mb-4">İlgili Rehberler</h3>
          <ul className="space-y-2">
            <li><Link to="/saglik-itibar-yonetimi/" className="text-primary hover:underline text-sm">Sağlık Kuruluşları için İtibar Yönetimi (Hub) →</Link></li>
            <li><Link to="/blog/doktor-yorumlari-nasil-yonetilir/" className="text-primary hover:underline text-sm">Doktor Yorumları Nasıl Yönetilir? →</Link></li>
            <li><Link to="/estetik-klinik-yorum-yonetimi/" className="text-primary hover:underline text-sm">Estetik Klinik Yorum Yönetimi →</Link></li>
            <li><Link to="/blog/sahte-saglik-yorumu-sikayet/" className="text-primary hover:underline text-sm">Sahte Sağlık Yorumu Şikayet Rehberi →</Link></li>
            <li><Link to="/yorum-yonetim-araclari/" className="text-primary hover:underline text-sm">Yorum Yönetim Araçları Karşılaştırması →</Link></li>
            <li><Link to="/platform/google-yorumlari-icin-yapay-zeka/" className="text-primary hover:underline text-sm">Google Yorumları için Yapay Zeka →</Link></li>
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

export default DisHekimiYorumYonetimi;