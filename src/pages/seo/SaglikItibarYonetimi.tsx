import { Link } from "react-router-dom";
import { ArrowRight, Stethoscope, ShieldCheck, Bot, Activity, Users, AlertTriangle, FileText } from "lucide-react";
import voyageRespondLogo from "@/assets/voyage-respond-logo.svg";
import AEOSection from "@/components/seo/AEOSection";
import SEO from "@/components/seo/SEO";

const SaglikItibarYonetimi = () => {

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "Sağlık Kuruluşları için Online İtibar Yönetimi",
    description:
      "Klinik, doktor, hastane ve estetik merkezler için KVKK ve 1219 sayılı kanuna uygun yorum & itibar yönetimi rehberi.",
    author: { "@type": "Organization", name: "VoyageRespond" },
    publisher: {
      "@type": "Organization",
      name: "VoyageRespond",
      logo: { "@type": "ImageObject", url: "https://voyagerespond.com/og-image.png" },
    },
    datePublished: "2026-06-16",
    dateModified: "2026-06-16",
    mainEntityOfPage: "https://voyagerespond.com/saglik-itibar-yonetimi/",
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Sağlık Kuruluşları için İtibar & Yorum Yönetimi | Klinik, Doktor, Hastane"
        description="Klinik, doktor, hastane ve estetik merkezler için KVKK ve 1219 sayılı kanuna uygun online itibar & yorum yönetimi. Pratik rehber + AI destekli yanıt akışı."
        alternates={[
          { hrefLang: "tr", href: "https://voyagerespond.com/saglik-itibar-yonetimi/" },
          { hrefLang: "en", href: "https://voyagerespond.com/healthcare-reputation-management/" },
          { hrefLang: "x-default", href: "https://voyagerespond.com/healthcare-reputation-management/" },
        ]}
        canonical="https://voyagerespond.com/saglik-itibar-yonetimi/"
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
            <div className="flex items-center gap-4">
              <Link to="/blog" className="hidden sm:block text-sm font-medium text-muted-foreground hover:text-foreground">Blog</Link>
              <Link to="/demo" className="px-4 py-2 rounded-md text-sm font-medium text-white" style={{ backgroundColor: "#7A5AF8" }}>
                Ücretsiz Dene
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <section className="container mx-auto px-4 sm:px-6 py-12 sm:py-16 max-w-4xl">
        <div className="text-center mb-10 sm:mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            <Stethoscope className="w-4 h-4" /> Sağlık & Klinik
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-4 leading-tight">
            Sağlık Kuruluşları için Online İtibar Yönetimi
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
            Klinik, doktor, hastane ve estetik merkezler için KVKK ve 1219 sayılı kanuna uygun yorum & itibar yönetimi rehberi.
          </p>
        </div>

        <article className="prose prose-lg max-w-none">
          <h2 className="text-2xl font-bold mt-8 mb-4">Sağlıkta Online İtibar Neden Hayati?</h2>
          <p className="text-muted-foreground leading-relaxed">
            Hastalar yeni bir hekim, klinik veya hastane seçmeden önce neredeyse her zaman Google'a bakar. Software Advice araştırmasına göre hastaların <strong>%84'ü</strong> seçim öncesi online yorumlara güveniyor ve <strong>%77'si</strong> ilk arama olarak Google'ı tercih ediyor. Türkiye'de bu davranışı Doktortakvimi, Doktorsitesi, Eniyihekim ve Şikayetvar tamamlıyor.
          </p>
          <p className="text-muted-foreground leading-relaxed mt-3">
            Sağlık sektöründe online itibar yönetimi sadece bir pazarlama meselesi değildir — <strong>1219 sayılı Tababet Kanunu, Sağlık Bakanlığı'nın reklam yönetmeliği ve KVKK'nın özel nitelikli kişisel veri kuralları</strong> yorum yanıtlarınızdan rezervasyon akışınıza kadar her noktayı belirler. Bu hub, sağlık kuruluşlarının bu sınırlar içinde nasıl güçlü bir dijital itibar inşa edeceğini özetler.
          </p>

          <h2 className="text-2xl font-bold mt-12 mb-4">Veriler: Hasta Karar Yolculuğu</h2>
          <div className="grid sm:grid-cols-2 gap-4 my-6">
            {[
              { icon: Users, stat: "%84", desc: "Hastalar yeni hekim seçmeden önce online yorum okuyor (Software Advice)" },
              { icon: Activity, stat: "%77", desc: "İlk arama olarak Google tercih ediyor" },
              { icon: ShieldCheck, stat: "%88", desc: "Olumsuz yoruma profesyonel cevap veren işletmelere daha fazla güveniyor (BrightLocal)" },
              { icon: AlertTriangle, stat: "1M TL", desc: "KVKK özel nitelikli veri ihlali için üst sınır cezası" },
            ].map((s, i) => (
              <div key={i} className="rounded-xl border border-border bg-card p-5">
                <s.icon className="w-5 h-5 text-primary mb-2" />
                <div className="text-2xl font-bold text-foreground">{s.stat}</div>
                <div className="text-sm text-muted-foreground">{s.desc}</div>
              </div>
            ))}
          </div>

          <h2 className="text-2xl font-bold mt-12 mb-4">Hangi Platformlar Önemli?</h2>
          <p className="text-muted-foreground leading-relaxed mb-4">Türkiye'de bir sağlık kuruluşu hakkında yorum yazılabilecek başlıca platformlar:</p>
          <ul className="space-y-2 text-muted-foreground list-disc pl-6">
            <li><strong>Google Business Profile</strong> — Local Pack için kritik; yıldız + yorum sayısı doğrudan sıralama sinyali</li>
            <li><strong>Doktortakvimi</strong> — randevu sonrası otomatik yorum talebi gönderir, yoğun trafikli</li>
            <li><strong>Doktorsitesi</strong> — branş bazlı arama sonuçlarında yüksek görünürlük</li>
            <li><strong>Eniyihekim, Sağlık Asistanı</strong> — sektörel dizinler</li>
            <li><strong>Şikayetvar</strong> — özellikle olumsuz deneyimlerin sızdığı kanal</li>
            <li><strong>Sosyal medya</strong> — Instagram yorumları, X bahsetmeleri, Facebook</li>
            <li><strong>Ekşi Sözlük</strong> — markalı arama yapan herkes ilk sayfada görür</li>
          </ul>
          <p className="text-muted-foreground mt-4">
            6-7 farklı kanalı elle takip etmek haftada 2-3 saat alır. Hub bir araç ihtiyacını ortaya çıkarır — bkz. <a href="/yorum-yonetim-araclari/" className="text-primary hover:underline">Yorum yönetim araçları karşılaştırması</a>.
          </p>

          <h2 className="text-2xl font-bold mt-12 mb-4">Yasal Çerçeve: KVKK + 1219 + TTB</h2>

          <h3 className="text-xl font-semibold mt-6 mb-2">KVKK md. 6 — Özel Nitelikli Kişisel Veri</h3>
          <p className="text-muted-foreground">
            Sağlık verileri (tanı, tedavi, ilaç, prosedür, randevu bilgisi) özel nitelikli kişisel veridir. Açık rıza olmadan işlenmesi, paylaşılması veya doğrulanması yasaktır. Pratik sonuç: <strong>Google yorum yanıtınızda hiçbir sağlık bilgisini doğrulayamazsınız</strong> — hasta kendi tanısını yorumda yazmış olsa bile.
          </p>

          <h3 className="text-xl font-semibold mt-6 mb-2">1219 Sayılı Kanun — Hekimlik Reklam Yasağı</h3>
          <p className="text-muted-foreground">
            Hekimler ve sağlık kuruluşları reklam yapamaz. Yorum yanıtınız da reklam unsuru taşıyamaz: "Türkiye'nin en iyi", "%99 başarı", "indirimli kontrol" türü ifadeler yasal risktir.
          </p>

          <h3 className="text-xl font-semibold mt-6 mb-2">Türk Tabipler Birliği Disiplin Yönetmeliği</h3>
          <p className="text-muted-foreground">
            Reklam niteliği taşıyan davranışlar için para cezası ve geçici meslekten men gibi yaptırımlar öngörülür. Sosyal medya ya da Google yorum yanıtında agresif/savunmacı dil, hasta bilgisi sızdırma da disiplin kapsamına girer.
          </p>

          <div className="my-8 p-5 rounded-xl border border-amber-300/40 bg-amber-50/50">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-700 mt-0.5 shrink-0" />
              <div className="text-sm text-amber-900">
                <strong>Dürüstlük notu:</strong> VoyageRespond yorum <strong>silme</strong> servisi değildir, yorum <strong>yönetim</strong> aracıdır. Hiçbir yorum yönetim aracı Google yorumunu silemez — silme yetkisi yalnızca Google'dadır ya da Sulh Ceza Hâkimliği kararı gerekir. "Garantili silme" vaat eden servislere para vermeyin.
              </div>
            </div>
          </div>

          <h2 className="text-2xl font-bold mt-12 mb-4">Yorum Yönetimi vs Yorum Sildirme — Dürüst Fark</h2>
          <div className="overflow-x-auto my-4">
            <table className="w-full text-sm border border-border">
              <thead className="bg-muted/40">
                <tr>
                  <th className="border border-border p-3 text-left">Yorum Yönetimi (yasal)</th>
                  <th className="border border-border p-3 text-left">Yorum Sildirme Vaadi (riskli)</th>
                </tr>
              </thead>
              <tbody>
                <tr><td className="border border-border p-3">Tüm yorumları tek panelde toplar</td><td className="border border-border p-3">"Para karşılığı sildiririz"</td></tr>
                <tr><td className="border border-border p-3">AI ile KVKK uyumlu yanıt taslağı</td><td className="border border-border p-3">Sahte pozitif yorum üretir (Google yasaklar)</td></tr>
                <tr><td className="border border-border p-3">Sahte yorumu tespit edip şikayet sürecini kolaylaştırır</td><td className="border border-border p-3">"Gizleriz" diye ücret alır, gerçek sonuç yok</td></tr>
                <tr><td className="border border-border p-3">Yasal olarak tartışmasız</td><td className="border border-border p-3">Tabip Odası ve KVKK risk</td></tr>
              </tbody>
            </table>
          </div>

          <h2 className="text-2xl font-bold mt-12 mb-4">Branşa Göre Rehberler</h2>
          <p className="text-muted-foreground mb-4">Her sağlık branşının yorum yönetiminde farklı dinamikleri var. Aşağıdaki spoke rehberleri ilgili alanınız için detaylı pratiği veriyor:</p>

          <div className="grid sm:grid-cols-2 gap-4 my-6">
            <a href="/blog/doktor-yorumlari-nasil-yonetilir/" className="block p-5 rounded-xl border border-border bg-card hover:border-primary/30 hover:shadow-md transition-all">
              <FileText className="w-5 h-5 text-primary mb-2" />
              <h3 className="font-semibold text-foreground mb-1">Doktor Yorumları Nasıl Yönetilir?</h3>
              <p className="text-sm text-muted-foreground">Hekimler için KVKK uyumlu yanıt çerçevesi, sahte yorumla mücadele ve AI destekli yanıt akışı.</p>
            </a>
            <a href="/dis-hekimi-yorum-yonetimi/" className="block p-5 rounded-xl border border-border bg-card hover:border-primary/30 hover:shadow-md transition-all">
              <Stethoscope className="w-5 h-5 text-primary mb-2" />
              <h3 className="font-semibold text-foreground mb-1">Diş Hekimi & Diş Kliniği Yorum Yönetimi</h3>
              <p className="text-sm text-muted-foreground">Google, Doktorsitesi ve Doktortakvimi'nde diş hekimi için pratik yönetim rehberi.</p>
            </a>
            <a href="/estetik-klinik-yorum-yonetimi/" className="block p-5 rounded-xl border border-border bg-card hover:border-primary/30 hover:shadow-md transition-all">
              <Activity className="w-5 h-5 text-primary mb-2" />
              <h3 className="font-semibold text-foreground mb-1">Estetik Klinik & Güzellik Merkezi Yorum Yönetimi</h3>
              <p className="text-sm text-muted-foreground">Estetik ve güzellik merkezlerinin yüksek hassasiyetli yorum yönetimi rehberi.</p>
            </a>
            <a href="/blog/sahte-saglik-yorumu-sikayet/" className="block p-5 rounded-xl border border-border bg-card hover:border-primary/30 hover:shadow-md transition-all">
              <ShieldCheck className="w-5 h-5 text-primary mb-2" />
              <h3 className="font-semibold text-foreground mb-1">Sahte Sağlık Yorumu Nasıl Şikayet Edilir?</h3>
              <p className="text-sm text-muted-foreground">Google + 5651 m.9 + savcılık — sahte yoruma karşı yasal yol haritası.</p>
            </a>
          </div>

          <h2 className="text-2xl font-bold mt-12 mb-4">Sağlık Kuruluşları için 7 Adımlı İtibar Stratejisi</h2>
          <ol className="space-y-3 text-muted-foreground list-decimal pl-6">
            <li><strong>Google Business Profile'ı eksiksiz doldurun.</strong> Branş, açılış saatleri, fotoğraf, hizmet listesi — eksik profil Local Pack sıralamasını düşürür.</li>
            <li><strong>Doktortakvimi ve Doktorsitesi profillerinizi düzenli güncelleyin.</strong> Hasta bu kanalda Google'la karşılaştırma yapar.</li>
            <li><strong>Yorum gelmesini bekleyin demek yerine memnun hastadan yorum talep edin.</strong> Email ile yasal review request (VoyageRespond Beta) en güvenli yoldur.</li>
            <li><strong>Her yoruma 24 saat içinde, KVKK uyumlu, nötr cevap yazın.</strong> Sessizlik onaylama olarak okunur.</li>
            <li><strong>Olumsuz yorumda hasta bilgisi tekrar etmeyin, offline'a taşıyın.</strong> "Lütfen kliniğimize 0XXX'dan ulaşın."</li>
            <li><strong>Sahte yorumu resmi süreçle şikayet edin.</strong> Google form → 5651 m.9 → savcılık (gerekirse). Üçüncü tarafa para vermeyin.</li>
            <li><strong>Duygu trendlerini ayda bir gözden geçirin.</strong> "Bekleme süresi" yorumlarda artıyorsa operasyonel müdahale zamanı.</li>
          </ol>

          <h2 className="text-2xl font-bold mt-12 mb-4">VoyageRespond'un Sağlık Kuruluşlarına Faydası</h2>
          <p className="text-muted-foreground mb-4">VoyageRespond, sağlık sektörünün regülasyon hassasiyetine göre çalışan bir yorum yönetim platformudur. Sunduğu somut özellikler:</p>
          <ul className="space-y-2 text-muted-foreground list-disc pl-6">
            <li><strong>AI ile KVKK uyumlu yanıt taslağı</strong> — hasta bilgisi tekrar etmeyen, reklam ifadesi içermeyen nötr ton; siz onaylamadan post yapılmaz</li>
            <li><strong>Google'a otomatik post</strong> — onayladığınız yanıt tek tıkla Google Business Profile'a düşer</li>
            <li><strong>Yorumlarınızla AI Sohbet</strong> — "Son 3 ayda bekleme süresinden şikayet eden kaç hasta var?" gibi doğal dilde sorular</li>
            <li><strong>Duygu analizi</strong> — 1 yıldızlı yorumu öncelikli listeye taşır</li>
            <li><strong>Çoklu lokasyon</strong> — şubeleriniz veya zincirleriniz tek panelden, karşılaştırmalı</li>
            <li><strong>Email ile Review Request (Beta)</strong> — memnun hastalardan yasal yorum talebi (WhatsApp/SMS/QR roadmap'te)</li>
            <li><strong>AI Görünürlük Skoru (Beta)</strong> — ChatGPT/Gemini gibi AI asistanlarında nasıl göründüğünüzü ölçer</li>
            <li><strong>Haftalık AI strateji raporu</strong> — duygu trendleri, kazanımlar, aksiyon önerileri</li>
          </ul>
          <p className="text-muted-foreground mt-4">
            VoyageRespond <strong>yorum silmez</strong>, <strong>sahte pozitif yorum üretmez</strong>, <strong>hasta verisi işlemez</strong>. Yaptığı tek şey: tüm kanalları tek panele toplamak, KVKK uyumlu yanıt taslağı üretmek ve sizin onayınızı beklemek.
          </p>
        </article>

        <div className="my-16 text-center p-8 sm:p-10 rounded-2xl border border-primary/10 bg-gradient-to-br from-primary/5 via-background to-background">
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">
            Sağlık kuruluşunuzun online itibarını profesyonel yönetin
          </h2>
          <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
            KVKK ve 1219'a uygun yanıt akışı, çoklu kanal tek panel, AI duygu analizi. Ücretsiz başlayın, kart bilgisi gerekmez.
          </p>
          <Link to="/demo" className="px-8 py-3 rounded-md text-white font-medium hover:shadow-lg min-h-[48px]" style={{ backgroundColor: "#7A5AF8" }}>
            Ücretsiz Başla <ArrowRight className="w-4 h-4 inline ml-1" />
          </Link>
        </div>

        <AEOSection
          pageUrl="https://voyagerespond.com/saglik-itibar-yonetimi/"
          faqs={[
            { question: "Sağlık kuruluşları yorum yönetimi yapabilir mi?", answer: "Evet. Yorum yönetimi, yorum silme değildir; tüm kanalları tek panele toplamak, KVKK uyumlu yanıt yazmak ve duygu trendlerini izlemek tamamen yasaldır. Sınır, yanıtın içeriğindedir: hasta sağlık bilgisi tekrar edilemez, reklam unsuru taşıyamaz." },
            { question: "VoyageRespond Google yorumu sildirebilir mi?", answer: "Hayır. Silme yetkisi yalnızca Google'da veya Sulh Ceza Hâkimliği kararındadır. VoyageRespond yorumları toplar, AI ile yanıt taslağı üretir ve şüpheli yorumu Google'a şikayet sürecinizde rehberlik eder — silme garantisi vermez." },
            { question: "Hekim olarak yoruma cevap yazarken nelere dikkat etmeliyim?", answer: "Yanıtta hiçbir sağlık bilgisini (tanı, tedavi, ilaç, randevu) doğrulamayın; KVKK md. 6 ihlali olur. Reklam ifadesi (en iyi, %99 başarı, indirim) kullanmayın; 1219 sayılı kanun ve TTB disiplin yönetmeliği yasaklar. Nötr, kısa, profesyonel ton ve offline'a yönlendirme en güvenli yoldur." },
            { question: "Sahte bir yorumu nasıl sildirebilirim?", answer: "Google Business Profile'da yorumu 'Uygunsuz olarak işaretle' (24-72 saat) → reddedilirse Google Legal Removal formu → hâlâ sonuç yoksa 5651 sayılı kanunun 9. maddesi ile Sulh Ceza Hâkimliği'ne avukat aracılığıyla içerik kaldırma talebi. Hakaret içeriyorsa TCK 125/267 kapsamında savcılık." },
            { question: "Hasta yorumlarını reklamımda kullanabilir miyim?", answer: "Hayır. 1219 sayılı kanun ve Sağlık Bakanlığı'nın 'Sağlığın Teşviki Yönetmeliği' uyarınca hasta yorumlarını broşür, reklam, web sitesi 'müşteri yorumu' alanı veya sosyal medya kreatifi olarak yeniden yayınlayamazsınız. Yorumlar yalnızca Google/Doktortakvimi gibi platformlarda kendi başlarına kalabilir." },
            { question: "AI ile yorum yanıtlamak güvenli mi?", answer: "VoyageRespond'un AI motoru sağlık regülasyonuna göre kalibre edilmiştir: hasta bilgisi tekrar etmez, reklam dili kullanmaz, nötr ton üretir. Üstelik AI yalnızca taslak üretir — siz onaylamadan hiçbir yanıt Google'a gönderilmez. Bu hem KVKK hem 1219 açısından en güvenli yoldur." },
          ]}
        />

        <div className="mt-12 p-6 rounded-xl bg-muted/50 border border-border">
          <h3 className="font-semibold text-foreground mb-4">İlgili Rehberler</h3>
          <ul className="space-y-2">
            <li><Link to="/blog/doktor-yorumlari-nasil-yonetilir" className="text-primary hover:underline text-sm">Doktor Yorumları Nasıl Yönetilir? →</Link></li>
            <li><Link to="/dis-hekimi-yorum-yonetimi" className="text-primary hover:underline text-sm">Diş Hekimi & Diş Kliniği Yorum Yönetimi →</Link></li>
            <li><Link to="/estetik-klinik-yorum-yonetimi" className="text-primary hover:underline text-sm">Estetik Klinik Yorum Yönetimi →</Link></li>
            <li><Link to="/blog/sahte-saglik-yorumu-sikayet" className="text-primary hover:underline text-sm">Sahte Sağlık Yorumu Şikayet Rehberi →</Link></li>
            <li><Link to="/yorum-yonetim-araclari" className="text-primary hover:underline text-sm">Yorum Yönetim Araçları Karşılaştırması →</Link></li>
            <li><Link to="/online-itibar-yonetimi" className="text-primary hover:underline text-sm">Online İtibar Yönetimi (Genel) →</Link></li>
            <li><Link to="/platform/google-yorumlari-icin-yapay-zeka" className="text-primary hover:underline text-sm">Google Yorumları için Yapay Zeka →</Link></li>
          </ul>
        </div>
      </section>

      <footer className="border-t border-border bg-card/50">
        <div className="container mx-auto px-4 sm:px-6 py-8">
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 text-sm text-muted-foreground">
            <span>© 2026 VoyageRespond</span>
            <span className="hidden md:block">•</span>
            <Link to="/privacy-policy" className="hover:text-foreground">Gizlilik Politikası</Link>
            <span className="hidden md:block">•</span>
            <Link to="/terms-of-service" className="hover:text-foreground">Kullanım Koşulları</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default SaglikItibarYonetimi;