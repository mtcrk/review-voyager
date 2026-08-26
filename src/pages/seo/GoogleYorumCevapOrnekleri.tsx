import { useNavigate } from "react-router-dom";
import { ArrowRight, Copy, Check, MessageSquare } from "lucide-react";
import voyageRespondLogo from "@/assets/voyage-respond-logo.svg";
import { useState } from "react";
import AEOSection from "@/components/seo/AEOSection";
import SEO from "@/components/seo/SEO";

const templates = [
  { category: "⭐⭐⭐⭐⭐ Olumlu Yorumlar", items: [
    { title: "Genel memnuniyet", text: "Merhaba [İsim], harika değerlendirmeniz için çok teşekkür ederiz! Sizin gibi değerli misafirlerimizi ağırlamak bizim için büyük bir mutluluk. Tekrar görüşmek dileğiyle! 🙏" },
    { title: "Yemek övgüsü", text: "[İsim] Bey/Hanım, [bahsedilen yemek] hakkındaki güzel sözleriniz şefimizi çok mutlu etti! Bu tarif tam da sizin gibi damak tadı gelişmiş misafirlerimiz için hazırlanıyor. Bir sonraki ziyaretinizde yeni menümüzü denemenizi kesinlikle öneririz. 😊" },
    { title: "Hizmet övgüsü", text: "Merhaba [İsim], ekibimiz hakkındaki güzel sözleriniz için teşekkürler! Geri bildiriminizi ekibimizle paylaştık, çok mutlu oldular. Sizi tekrar ağırlamak için sabırsızlanıyoruz! 🌟" },
    { title: "Atmosfer övgüsü", text: "[İsim], mekanımızın atmosferini beğenmenize çok sevindik! Her detay misafirlerimizin keyifli vakit geçirmesi için özenle tasarlandı. Bir sonraki ziyaretinizde terasımızı da denemenizi öneririz." },
    { title: "Otel konaklama övgüsü", text: "Sayın [İsim], otelimizde keyifli bir konaklama geçirmenize çok sevindik! Güzel yorumunuz ekibimizi motive etti. Bir sonraki ziyaretinizde sizi tekrar ağırlamaktan onur duyarız. 🏨" },
    { title: "Fiyat-performans övgüsü", text: "Merhaba [İsim], uygun fiyatla kaliteli hizmet sunabildiğimizi duymak bizi çok mutlu etti! Misafirlerimize en iyi deneyimi en makul fiyatlarla sunmak temel prensi̇bi̇mi̇z. Tekrar bekleriz! 💜" },
    { title: "İlk kez gelen müşteri", text: "[İsim], ilk ziyaretinizde bu kadar güzel bir izlenim bırakabildiğimize sevindik! Sizi düzenli misafirlerimiz arasında görmek isteriz. İkinci ziyaretinizde sizi özel bir sürpriz bekliyor olacak! ✨" },
  ]},
  { category: "⭐⭐⭐ Nötr Yorumlar", items: [
    { title: "Karma değerlendirme", text: "Merhaba [İsim], hem olumlu hem de yapıcı geri bildiriminiz için teşekkürler. [Olumlu kısım] hakkındaki güzel sözleriniz bizi mutlu etti. [İyileştirilecek kısım] konusunda ekibimizle çalışıyoruz. Tekrar denemenizi çok isteriz!" },
    { title: "Beklenti karşılanmadı", text: "[İsim], beklentilerinizi tam olarak karşılayamadığımız için üzgünüz. Geri bildiriminiz iyileştirme sürecimiz için çok değerli. Lütfen bize detay paylaşın ki bir sonraki ziyaretinizi mükemmel yapalım." },
    { title: "Detay isteme", text: "Merhaba [İsim], yorumunuz için teşekkürler. Deneyiminizi daha iyi anlayabilmemiz için bize ulaşmanızı rica ederiz. Sizin için en iyi deneyimi sunmak istiyoruz. 📧 info@isletme.com" },
  ]},
  { category: "⭐ Olumsuz Yorumlar", items: [
    { title: "Genel şikayet", text: "Merhaba [İsim], yaşadığınız deneyim için samimiyetle özür dileriz. Bu geri bildirim bizim için çok değerli ve durumu hemen ekibimizle değerlendirdik. Size doğrudan ulaşmak isteriz — lütfen bize yazın." },
    { title: "Yemek kalitesi", text: "[İsim], yemek kalitemizin beklentilerinizi karşılayamaması bizi çok üzdü. Şefimizle durumu değerlendirdik ve düzeltici adımlar attık. Telafi olarak bir sonraki ziyaretinizde özel bir ikram sunmak isteriz." },
    { title: "Uzun bekleme süresi", text: "Merhaba [İsim], uzun bekleme süresinden dolayı samimiyetle özür dileriz. Yoğun saatlerde yaşanan bu aksaklık için ek personel aldık ve sistemimizi güncelledik. Bir sonraki ziyaretinizde farkı göreceksiniz!" },
    { title: "Personel davranışı", text: "[İsim], personelimizin davranışından dolayı yaşadığınız olumsuz deneyim için çok üzgünüz. Bu durum kesinlikle değerlerimize aykırıdır. İlgili ekip arkadaşımızla görüştük ve ek eğitim başlattık." },
    { title: "Hijyen/temizlik", text: "Sayın [İsim], hijyen konusundaki endişenizi son derece ciddiye alıyoruz. Temizlik ekibimizle acil bir değerlendirme yaptık ve kontrol listelerimizi güçlendirdik. Lütfen detayları paylaşmak için bize ulaşın." },
    { title: "Fiyat şikayeti", text: "Merhaba [İsim], geri bildiriminiz için teşekkürler. Kaliteli malzeme ve deneyim sunma konusundaki kararlılığımız fiyatlarımıza yansıyor. Size özel bir teklif sunmak isteriz — bize ulaşın." },
    { title: "Oda şikayeti (Otel)", text: "Sayın [İsim], odanızla ilgili yaşadığınız sorun için samimiyetle özür dileriz. Bu durum standartlarımızın çok altındadır. Size özel bir konaklama teklifi sunmak isteriz — lütfen info@otel.com adresinden bize ulaşın." },
  ]},
  { category: "📝 Özel Durumlar", items: [
    { title: "Sadece yıldız (yazısız)", text: "Puanınız için teşekkür ederiz! 🌟 Deneyiminiz hakkında birkaç kelime yazarsanız, hem bize hem de diğer misafirlerimize çok yardımcı olursunuz. Tekrar görüşmek üzere!" },
    { title: "İngilizce olumlu", text: "Thank you so much for your wonderful review, [Name]! We're delighted you enjoyed your experience with us. We look forward to welcoming you again! 🙏" },
    { title: "İngilizce olumsuz", text: "Dear [Name], we sincerely apologize for your experience. This falls below our standards. Please contact us at [email] so we can make things right." },
    { title: "Sadık müşteri", text: "[İsim], sadık misafirimiz olarak bizi yine değerlendirmenize çok mutlu olduk! Her ziyaretinizde daha iyisini sunmak için çalışıyoruz. Bir sonraki gelişinizde sizi sürpriz bir ikramla karşılamak isteriz! 💜" },
    { title: "Yanlış yorum (başka işletme)", text: "Merhaba [İsim], yorumunuzda bahsettiğiniz durum maalesef işletmemizle örtüşmüyor. Başka bir işletmeyle karıştırmış olabilir misiniz? Yine de sorularınız için buradayız." },
    { title: "Spam/sahte yorum", text: "Bu yorumun gerçek bir müşteri deneyimini yansıtmadığını düşünüyoruz. Yine de tüm misafirlerimize en iyi hizmeti sunma kararlılığımızı sürdürüyoruz. Gerçek deneyimlerinizi duymaktan mutluluk duyarız." },
  ]},
];

const GoogleYorumCevapOrnekleri = () => {
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
        title="Google Yorum Cevap Örnekleri | 25 Hazır Şablon"
        description="Olumlu, olumsuz ve nötr Google yorumları için 25 profesyonel, kopyala-yapıştır cevap şablonu. Restoran, otel ve hizmet sektörü için."
        canonical="https://voyagerespond.com/google-yorum-cevap-ornekleri"
        alternates={[
          { hrefLang: "tr", href: "https://voyagerespond.com/google-yorum-cevap-ornekleri/" },
          { hrefLang: "en", href: "https://voyagerespond.com/google-review-response-examples/" },
          { hrefLang: "x-default", href: "https://voyagerespond.com/google-review-response-examples/" },
        ]}
      />
      <nav className="sticky top-0 z-50 border-b backdrop-blur-lg bg-white/95">
        <div className="container mx-auto px-6">
          <div className="flex h-16 items-center justify-between">
            <button onClick={() => navigate("/")} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <img src={voyageRespondLogo} alt="VoyageRespond" className="h-7 w-7" />
              <span className="text-lg" style={{ color: "#1F2937" }}>
                <span className="font-normal">Voyage</span><span className="font-semibold">Respond</span>
              </span>
            </button>
            <div className="flex items-center gap-4">
              <button onClick={() => navigate("/blog")} className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Blog</button>
              <button onClick={() => navigate("/demo")} className="px-4 py-2 rounded-md text-sm font-medium text-white transition-all" style={{ backgroundColor: "#7A5AF8" }}>Ücretsiz Dene</button>
            </div>
          </div>
        </div>
      </nav>

      <section className="container mx-auto px-6 py-16 max-w-4xl">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            <MessageSquare className="w-4 h-4" />
            25 Hazır Şablon
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Google Yorum Cevap Örnekleri: 25 Hazır Yanıt Şablonu (2026)
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Google yorumlarına nasıl cevap verilir bilmiyor musunuz? Olumlu, olumsuz ve nötr müşteri yorumları için 25 profesyonel cevap örneği. Restoran, otel ve hizmet sektörü için kopyala-yapıştır hazır şablonlar.
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
                      <button
                        onClick={() => handleCopy(item.text, key)}
                        className="shrink-0 p-2 rounded-lg border border-border hover:bg-muted transition-colors"
                        title="Kopyala"
                        aria-label={copiedIndex === key ? "Kopyalandı" : `\"${item.title}\" şablonunu kopyala`}
                      >
                        {copiedIndex === key ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4 text-muted-foreground" />}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {/* Mid-page CTA */}
        <div className="my-16 text-center p-10 rounded-2xl border border-primary/10 bg-gradient-to-br from-primary/5 via-background to-background">
          <h2 className="text-2xl font-bold text-foreground mb-3">
            Şablonlarla uğraşmak yerine AI'a bırakın
          </h2>
          <p className="text-muted-foreground mb-6">
            VoyageRespond, her yorumu analiz ederek kişiselleştirilmiş, markanıza uygun yanıtlar üretir.
          </p>
          <button onClick={() => navigate("/demo")} className="px-8 py-3 rounded-md text-white font-medium transition-all hover:shadow-lg" style={{ backgroundColor: "#7A5AF8" }}>
            Ücretsiz Deneyin <ArrowRight className="w-4 h-4 inline ml-1" />
          </button>
        </div>

        <AEOSection
          pageUrl="https://voyagerespond.com/google-yorum-cevap-ornekleri"
          faqs={[
            { question: "Google yorumlarına nasıl cevap verilir?", answer: "Google Business profilinizden yorumları görüntüleyip tek tek yanıt verebilirsiniz. Daha hızlı ve tutarlı yanıtlar için VoyageRespond gibi AI destekli yorum yönetim platformlarını kullanabilirsiniz." },
            { question: "Kötü yorumlara nasıl yanıt verilir?", answer: "Olumsuz yorumlara sakin, empatik ve çözüm odaklı yaklaşın. Özür dileyin, sorunu kabul edin ve somut bir çözüm sunun. VoyageRespond, olumsuz yorumları anında tespit eder ve profesyonel yanıt önerileri sunar." },
            { question: "AI yorum cevabı yazabilir mi?", answer: "Evet, AI destekli yorum yönetim platformları her yorumu analiz ederek kişiselleştirilmiş, marka uyumlu yanıtlar üretir. VoyageRespond, Türkçe dahil çok dilli AI yanıt önerileri sunan bir yorum yönetim aracıdır." },
            { question: "Google yorumlarına cevap vermek SEO'yu etkiler mi?", answer: "Evet, Google aktif olarak yönetilen işletme profillerini sıralamada öne çıkarır. Yorum yanıt oranı yüksek işletmeler yerel arama sonuçlarında daha üst sıralarda yer alır." },
            { question: "Hazır yorum cevap şablonları kullanmak doğru mu?", answer: "Şablonlar iyi bir başlangıçtır ancak kişiselleştirilmelidir. VoyageRespond gibi AI araçları her yoruma özel, kişiselleştirilmiş yanıtlar üretir — şablon kullanmaya gerek kalmaz." },
          ]}
        />

        {/* Internal links */}
        <div className="mt-12 p-6 rounded-xl bg-muted/50 border border-border">
          <h3 className="font-semibold text-foreground mb-4">İlgili Rehberler</h3>
          <ul className="space-y-2">
            <li><button onClick={() => navigate("/blog/google-yorumlarina-nasil-yanit-verilir")} className="text-primary hover:underline text-sm">Google Yorumlarına Nasıl Yanıt Verilir? →</button></li>
            <li><button onClick={() => navigate("/blog/kotu-yorumlara-nasil-cevap-verilir")} className="text-primary hover:underline text-sm">Kötü Yorumlara Nasıl Cevap Verilir? →</button></li>
            <li><button onClick={() => navigate("/blog/chatgpt-ile-google-yorumlarina-nasil-cevap-yazilir")} className="text-primary hover:underline text-sm">ChatGPT ile Yorum Cevabı Nasıl Yazılır? →</button></li>
            <li><button onClick={() => navigate("/blog/google-yorum-cevap-araclari-2026")} className="text-primary hover:underline text-sm">En İyi Yorum Yönetim Araçları (2026) →</button></li>
            <li><button onClick={() => navigate("/restoran-yorum-cevaplari")} className="text-primary hover:underline text-sm">Restoran Yorum Cevapları (30 Şablon) →</button></li>
            <li><button onClick={() => navigate("/otel-yorum-cevaplari")} className="text-primary hover:underline text-sm">Otel Yorum Cevapları (30 Şablon) →</button></li>
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
        "@context": "https://schema.org",
        "@type": "Article",
        headline: "Google Yorum Cevap Örnekleri: 25 Hazır Yanıt Şablonu",
        description: "Google yorumlarına kopyala-yapıştır hazır yanıt şablonları.",
        author: { "@type": "Organization", name: "VoyageRespond" },
        publisher: { "@type": "Organization", name: "VoyageRespond" },
        mainEntityOfPage: "https://voyagerespond.com/google-yorum-cevap-ornekleri",
      })}} />
    </div>
  );
};

export default GoogleYorumCevapOrnekleri;
