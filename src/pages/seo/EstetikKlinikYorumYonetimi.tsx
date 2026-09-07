import { Link } from "react-router-dom";
import { ArrowRight, Sparkles, ShieldCheck, AlertTriangle } from "lucide-react";
import voyageRespondLogo from "@/assets/voyage-respond-logo.svg";
import AEOSection from "@/components/seo/AEOSection";
import SEO from "@/components/seo/SEO";

const EstetikKlinikYorumYonetimi = () => {

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "Estetik Klinik & Güzellik Merkezi Yorum Yönetimi Rehberi",
    description:
      "Estetik klinik, güzellik merkezi ve medikal estetik için KVKK ve 1219'a uygun yorum yönetimi rehberi.",
    author: { "@type": "Organization", name: "VoyageRespond" },
    publisher: { "@type": "Organization", name: "VoyageRespond" },
    datePublished: "2026-06-16",
    dateModified: "2026-06-16",
    mainEntityOfPage: "https://voyagerespond.com/estetik-klinik-yorum-yonetimi/",
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Estetik Klinik & Güzellik Merkezi Yorum Yönetimi Rehberi"
        description="Estetik klinik, güzellik merkezi ve medikal estetik için KVKK ve 1219'a uygun yorum yönetimi rehberi. Hassas branşa özel yanıt akışı + AI desteği."
        alternates={[
          { hrefLang: "tr", href: "https://voyagerespond.com/estetik-klinik-yorum-yonetimi/" },
          { hrefLang: "en", href: "https://voyagerespond.com/aesthetic-clinic-review-management/" },
          { hrefLang: "x-default", href: "https://voyagerespond.com/aesthetic-clinic-review-management/" },
        ]}
        canonical="https://voyagerespond.com/estetik-klinik-yorum-yonetimi/"
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
            <Sparkles className="w-4 h-4" /> Estetik & Güzellik
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-4 leading-tight">
            Estetik Klinik & Güzellik Merkezi Yorum Yönetimi
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
            En hassas regülasyonlu branşlardan biri olan estetik için KVKK + 1219 uyumlu, sonuç odaklı yorum yönetim rehberi.
          </p>
        </div>

        <article className="prose prose-lg max-w-none">
          <h2 className="text-2xl font-bold mt-8 mb-4">Estetik Sektöründe Yorumun Etkisi</h2>
          <p className="text-muted-foreground leading-relaxed">
            Estetik klinik kararı, çoğu hasta için <strong>hayatının en araştırılan satın alma kararıdır</strong>. Bir kişi rinoplasti yaptırmadan önce ortalama 20-30 yorum okur, 3-5 klinik karşılaştırır, sosyal medyada vakaları inceler. Google yıldız ortalamanız %0.1 farkla bile dönüşüm oranınızı belirler.
          </p>
          <p className="text-muted-foreground leading-relaxed mt-3">
            Aynı zamanda estetik, regülasyonun <strong>en sert</strong> olduğu sağlık alt-branşı. Sağlık Bakanlığı estetik klinik denetimlerinde son yıllarda reklam ihlali ve hasta verisi paylaşımı en sık ceza sebebi.
          </p>

          <h2 className="text-2xl font-bold mt-12 mb-4">Estetikte Yorum Yönetiminin 4 Özel Riski</h2>
          <ol className="space-y-3 text-muted-foreground list-decimal pl-6">
            <li><strong>Öncesi/sonrası görsel ihlali</strong> — Yorum yanıtında hasta görselini paylaşmak ya da "vakanızı sosyal medyamızda görebilirsiniz" yönlendirmesi KVKK ihlali + 1219 reklam yasağı.</li>
            <li><strong>Sonuç vaadi</strong> — "Mükemmel sonuç garantili" veya "iz kalmaz" türü ifadeler yanıtta da kullanılamaz; tıbbi uygulamalarda kesin sonuç vaadi yasaktır.</li>
            <li><strong>Karşılaştırmalı dil</strong> — "Diğer kliniklerden daha iyi" türü ifadeler hem TTB hem rekabet hukuku ihlali.</li>
            <li><strong>Hasta deneyimi reklamı</strong> — Olumlu yorumları broşür, reklam, Instagram kreatifi olarak yeniden yayınlamak Sağlık Bakanlığı yönetmeliği ihlali.</li>
          </ol>

          <h2 className="text-2xl font-bold mt-12 mb-4">En Sık Görülen 6 Yorum Konusu</h2>
          <ul className="space-y-2 text-muted-foreground list-disc pl-6">
            <li><strong>Sonuç memnuniyetsizliği</strong> — "Hayal ettiğim olmadı" tipi yorumlar</li>
            <li><strong>Fiyat şeffaflığı</strong> — paket / ek ücret şikayetleri</li>
            <li><strong>Konsültasyon süresi</strong> — yetersiz görüşme şikayeti</li>
            <li><strong>İletişim & takip</strong> — operasyon sonrası ulaşılamama</li>
            <li><strong>Hijyen & klinik standardı</strong></li>
            <li><strong>Komplikasyon yönetimi</strong> — en hassas konu, yanıtta özel dikkat</li>
          </ul>

          <h2 className="text-2xl font-bold mt-12 mb-4">Estetik için Yanıt Şablonları</h2>

          <h3 className="text-lg font-semibold mt-6 mb-2">Sonuç Memnuniyetsizliği</h3>
          <blockquote className="border-l-4 border-primary/30 bg-muted/30 p-4 my-3 text-sm text-muted-foreground italic">
            Geri bildiriminiz için teşekkür ederiz. Beklentilerinizi karşılayamadığımız için üzgünüz; deneyiminizi detaylı dinlemek ve sürecinizi birlikte değerlendirmek isteriz. Lütfen kliniğimize 0XXX numarasından ulaşın.
          </blockquote>

          <h3 className="text-lg font-semibold mt-6 mb-2">Komplikasyon Bahsi (en hassas)</h3>
          <blockquote className="border-l-4 border-primary/30 bg-muted/30 p-4 my-3 text-sm text-muted-foreground italic">
            Geri bildiriminiz için teşekkür ederiz. Sağlığınız ve kliniğimizin standartları bizim için önceliklidir; durumu detaylı görüşmek üzere lütfen kliniğimize 0XXX numarasından ulaşın. İyi günler dileriz.
          </blockquote>

          <h3 className="text-lg font-semibold mt-6 mb-2">Fiyat Şikayeti</h3>
          <blockquote className="border-l-4 border-primary/30 bg-muted/30 p-4 my-3 text-sm text-muted-foreground italic">
            Yorumunuz için teşekkür ederiz. Konsültasyon süreçlerimizi gözden geçiriyoruz; deneyiminizi detaylı dinlemek isteriz. Lütfen kliniğimize 0XXX'dan ulaşın.
          </blockquote>

          <p className="text-muted-foreground mt-3">
            Tüm yanıtlarda <strong>prosedür adı (rinoplasti, botoks, lazer, dolgu) doğrulanmaz, sonuç vaadi verilmez, indirim / kampanya yer almaz</strong>. Detaylı çerçeve: <a href="/blog/doktor-yorumlari-nasil-yonetilir/" className="text-primary hover:underline">Doktor yorumları nasıl yönetilir rehberi</a>.
          </p>

          <h2 className="text-2xl font-bold mt-12 mb-4">Sahte Yorumla Mücadele</h2>
          <p className="text-muted-foreground">
            Estetik sektörü, rakip kaynaklı sahte yoruma en sık maruz kalan alanlardan biri. Yapılacak yasal süreç: Google Business Profile şikayeti → Google Legal Removal formu → 5651 m.9 ile Sulh Ceza Hâkimliği başvurusu → gerekirse TCK 125/267 savcılık. Tüm adımlar: <a href="/blog/sahte-saglik-yorumu-sikayet/" className="text-primary hover:underline">Sahte sağlık yorumu şikayet rehberi</a>.
          </p>

          <div className="my-8 p-5 rounded-xl border border-amber-300/40 bg-amber-50/50">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-700 mt-0.5 shrink-0" />
              <div className="text-sm text-amber-900">
                <strong>Önemli:</strong> "Yorum sildiririm" diyen üçüncü tarafa <strong>asla para vermeyin</strong>. Estetik sektöründe bu vaatler genellikle sahte pozitif yorum üretimine dayanır — Google tespit ederse profil askıya alır ve yıllarca emeğiniz silinir.
              </div>
            </div>
          </div>

          <h2 className="text-2xl font-bold mt-12 mb-4">VoyageRespond Estetik Kliniklere Ne Sunuyor?</h2>
          <ul className="space-y-2 text-muted-foreground list-disc pl-6">
            <li><strong>Tek panel</strong> — Google, Doktortakvimi, Şikayetvar bahisleri (yakında), Instagram yorumları</li>
            <li><strong>KVKK + 1219 uyumlu AI yanıt taslağı</strong> — prosedür adı tekrar etmez, sonuç vaadi vermez, reklam dili yoktur; siz onaylamadan post yapılmaz</li>
            <li><strong>Duygu analizi</strong> — "komplikasyon" ya da "sonuç" kelimesi geçen yorumu öncelikli listeye taşır</li>
            <li><strong>Çoklu lokasyon</strong> — zincir klinikler için karşılaştırmalı dashboard</li>
            <li><strong>Email Review Request (Beta)</strong> — memnun hastadan organik Google yorum talebi (yasal şablon)</li>
            <li><strong>Haftalık AI strateji raporu</strong> — tekrar eden şikayet konuları, operasyonel müdahale önerileri</li>
          </ul>

          <div className="my-6 p-5 rounded-xl border border-border bg-card">
            <div className="flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-primary mt-0.5 shrink-0" />
              <div className="text-sm text-muted-foreground">
                <strong>Dürüstlük notu:</strong> VoyageRespond yorum silmez. AI Visibility Score ve Review Request Beta'dadır; Review Request şu an yalnızca email kanalıyla çalışır (WhatsApp, SMS, QR roadmap'te).
              </div>
            </div>
          </div>
        </article>

        <div className="my-16 text-center p-8 sm:p-10 rounded-2xl border border-primary/10 bg-gradient-to-br from-primary/5 via-background to-background">
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">
            Estetik kliniğinizin Google itibarını profesyonel yönetin
          </h2>
          <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
            KVKK + 1219 uyumlu AI yanıt akışı, çoklu kanal tek panel, duygu trend raporu. Ücretsiz başlayın.
          </p>
          <Link to="/demo/" className="px-8 py-3 rounded-md text-white font-medium hover:shadow-lg min-h-[48px]" style={{ backgroundColor: "#7A5AF8" }}>
            Ücretsiz Başla <ArrowRight className="w-4 h-4 inline ml-1" />
          </Link>
        </div>

        <AEOSection
          pageUrl="https://voyagerespond.com/estetik-klinik-yorum-yonetimi/"
          faqs={[
            { question: "Estetik klinik yorum yanıtında ne kullanılamaz?", answer: "Prosedür adının doğrulanması (rinoplasti, botoks, dolgu, lazer), sonuç vaadi ('mükemmel sonuç', 'iz kalmaz'), karşılaştırmalı dil ('en iyi', 'rakiplerden iyi'), indirim/kampanya teklifi ve hasta görseli yönlendirmesi yasal risktir. Nötr, kısa, profesyonel ton ve offline'a yönlendirme kuraldır." },
            { question: "Olumlu hasta yorumlarını Instagram'da paylaşabilir miyim?", answer: "Hayır. 1219 sayılı kanun ve Sağlık Bakanlığı'nın 'Sağlığın Teşviki Yönetmeliği' uyarınca hasta deneyimlerinin reklam veya tanıtım amacıyla yeniden yayınlanması yasaktır. Yorumlar Google'da kendi başlarına kalabilir ama broşür, reklam, sosyal medya kreatifi olarak kullanılamaz." },
            { question: "Rakip kaynaklı sahte yorumla nasıl mücadele edilir?", answer: "Google Business Profile → 'Uygunsuz olarak işaretle' → kategori 'Çıkar çatışması' (24-72 saat). Sonuç yoksa Google Legal Removal formu (kanıt ekli). Reddedilirse 5651 sayılı kanun m.9 ile Sulh Ceza Hâkimliği'ne avukat aracılığıyla içerik kaldırma talebi. Hakaret içeriyorsa TCK 125/267 savcılık." },
            { question: "VoyageRespond estetik kliniğin sahte yorumlarını sildirir mi?", answer: "Hayır. VoyageRespond yorum silmez — silme yetkisi yalnızca Google'da veya mahkeme kararındadır. VoyageRespond sahte yorumu tespit etmenize, kanıt toplamanıza ve şikayet sürecini takip etmenize yardımcı olur; aynı zamanda KVKK + 1219 uyumlu profesyonel yanıt taslağı üretir." },
          ]}
        />

        <div className="mt-12 p-6 rounded-xl bg-muted/50 border border-border">
          <h3 className="font-semibold text-foreground mb-4">İlgili Rehberler</h3>
          <ul className="space-y-2">
            <li><Link to="/saglik-itibar-yonetimi/" className="text-primary hover:underline text-sm">Sağlık Kuruluşları için İtibar Yönetimi (Hub) →</Link></li>
            <li><Link to="/blog/doktor-yorumlari-nasil-yonetilir/" className="text-primary hover:underline text-sm">Doktor Yorumları Nasıl Yönetilir? →</Link></li>
            <li><Link to="/dis-hekimi-yorum-yonetimi/" className="text-primary hover:underline text-sm">Diş Hekimi Yorum Yönetimi →</Link></li>
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

export default EstetikKlinikYorumYonetimi;