import { jsxs, jsx } from "react/jsx-runtime";
import { useNavigate } from "react-router-dom";
import { UtensilsCrossed, Check, Copy, ArrowRight } from "lucide-react";
import { v as voyageRespondLogo } from "./voyage-respond-logo-C1G06huv.js";
import { useState } from "react";
import { A as AEOSection } from "./AEOSection-B79DgfDR.js";
import { S as SEO } from "./SEO-CentcBuw.js";
import "react-helmet-async";
const templates = [
  { category: "🍽️ Yemek Kalitesi — Olumlu", items: [
    { title: "Genel yemek övgüsü", text: "Merhaba [İsim], lezzetli yemeklerimizi beğenmenize çok sevindik! Şefimiz taze ve yerel malzemeler kullanarak her tabağı özenle hazırlıyor. Bir sonraki ziyaretinizde mevsimsel menümüzü denemenizi tavsiye ederiz. Afiyet olsun! 🍴" },
    { title: "Spesifik yemek övgüsü", text: "[İsim] Bey/Hanım, [yemek adı] tarifimizi beğenmenize bayıldık! Bu tarif şefimizin özel reçetesidir ve her gün taze malzemelerle hazırlanıyor. Sıradaki ziyaretinizde [başka yemek önerisi] denemenizi kesinlikle tavsiye ederiz. 😋" },
    { title: "Tatlı övgüsü", text: "Merhaba [İsim], tatlılarımızı sevmenize çok mutlu olduk! Pastacımız her sabah taze tatlılar hazırlıyor. [Bahsedilen tatlı] favorilerimizden! Bir dahaki sefere [yeni tatlı] denemeyi unutmayın. 🍰" },
    { title: "Kahvaltı övgüsü", text: "[İsim], kahvaltı büfemizi beğenmenize sevindik! Ev yapımı reçellerimiz, taze pişirilen böreklerimiz ve organik yumurtalarımızla haftasonları özel bir deneyim sunuyoruz. Tekrar bekleriz! ☕" }
  ] },
  { category: "👨‍🍳 Servis ve Personel — Olumlu", items: [
    { title: "Garson övgüsü", text: "Merhaba [İsim], [garson adı] hakkındaki güzel sözleriniz onu çok mutlu etti! Ekibimizin her üyesi misafir memnuniyetini öncelik olarak görüyor. Sizi tekrar ağırlamak için sabırsızlanıyoruz!" },
    { title: "Hızlı servis övgüsü", text: "[İsim], hızlı servisimizi takdir etmenize sevindik! Lezzetli yemekleri beklemeden sunmak için sürekli çalışıyoruz. Öğle yemeği için bizi tercih ettiğiniz için teşekkürler! 🚀" },
    { title: "Özel ilgi övgüsü", text: "Merhaba [İsim], size özel bir deneyim sunabildiğimize mutlu olduk! Her misafirimiz bizim için özeldir. Doğum günü/özel gün organizasyonlarımız için de bize danışabilirsiniz! 🎉" }
  ] },
  { category: "🏠 Mekan ve Atmosfer — Olumlu", items: [
    { title: "Dekorasyon övgüsü", text: "[İsim], mekanımızın dekorasyonunu beğenmenize sevindik! Her köşeyi misafirlerimiz için özenle tasarladık. Akşam yemeği için mumlu masalarımız ayrı bir ambians sunuyor, denemenizi öneririz! 🕯️" },
    { title: "Bahçe/teras övgüsü", text: "Merhaba [İsim], bahçemizde keyifli vakit geçirmenize çok mutlu olduk! Yaz aylarında canlı müzik eşliğinde açık hava yemeklerimiz başlıyor. Takipte kalın! 🌿" },
    { title: "Aile dostu övgüsü", text: "[İsim], ailenizle güzel bir deneyim yaşamanıza sevindik! Çocuk menümüz ve oyun alanımızla küçük misafirlerimizi de düşünüyoruz. Haftasonları özel çocuk aktivitelerimiz var! 👨‍👩‍👧‍👦" }
  ] },
  { category: "⭐⭐⭐ Nötr Değerlendirmeler", items: [
    { title: "Karma yorum", text: "Merhaba [İsim], hem olumlu hem yapıcı geri bildiriminiz için teşekkürler. [Beğenilen kısım] hakkındaki sözleriniz bizi mutlu etti. [İyileştirilecek kısım] konusunda hemen aksiyon aldık. Bir sonraki ziyaretinizde farkı göreceksiniz!" },
    { title: "Fiyat-kalite dengesi", text: "[İsim], değerlendirmeniz için teşekkürler. Kaliteli malzeme ve profesyonel hazırlık sürecimiz menü fiyatlarımıza yansıyor. Öğle menümüz ve hafta içi kampanyalarımız daha uygun seçenekler sunuyor. Denemenizi öneririz! 💰" },
    { title: "Beklenti yönetimi", text: "Merhaba [İsim], geri bildiriminiz bizim için çok değerli. Beklentilerinizi tam karşılayamadığımız için üzgünüz. Lütfen bize detay paylaşın — deneyiminizi iyileştirmek için elimizden geleni yapacağız." }
  ] },
  { category: "❌ Olumsuz Yorumlar — Yemek", items: [
    { title: "Tat şikayeti", text: "Merhaba [İsim], yemeğimizin tadının beklentilerinizi karşılayamaması için çok üzgünüz. Şefimizle [bahsedilen yemek] hakkında değerlendirme yaptık. Telafi olarak bir sonraki ziyaretinizde şefin özel tabağını ikram etmek isteriz." },
    { title: "Soğuk yemek", text: "[İsim], yemeğinizin soğuk servis edilmesi kabul edilemez bir durumdur, özür dileriz. Servis süreçlerimizi yeniden düzenledik. Lütfen bize bir şans daha verin — farkı göreceksiniz." },
    { title: "Porsiyon şikayeti", text: "Merhaba [İsim], porsiyon boyutumuzun beklentinizi karşılayamaması için üzgünüz. Menümüzde büyük porsiyon seçenekleri mevcuttur. Bir sonraki ziyaretinizde garsonumuzdan öneri almanızı tavsiye ederiz." }
  ] },
  { category: "❌ Olumsuz Yorumlar — Servis", items: [
    { title: "Yavaş servis", text: "[İsim], uzun bekleme süresinden dolayı samimiyetle özür dileriz. Yoğun dönemlerde yaşanan bu aksaklığı gidermek için ek personel ve yeni sipariş sistemi devreye aldık. Bir sonraki ziyaretinizde çok daha hızlı hizmet göreceksiniz!" },
    { title: "Yanlış sipariş", text: "Merhaba [İsim], siparişinizin yanlış gelmesi için çok üzgünüz. Bu tür hatalar kabul edilemez ve sipariş sürecimizi iyileştirdik. Telafi olarak bir sonraki ziyaretinizde tatlı ikramında bulunmak isteriz." },
    { title: "Kaba personel", text: "[İsim], personelimizin davranışından dolayı yaşadığınız deneyim için samimiyetle özür dileriz. Bu durum kesinlikle kurumsal değerlerimize aykırıdır. İlgili personelle görüşülmüş ve ek müşteri iletişim eğitimi başlatılmıştır." },
    { title: "Rezervasyon sorunu", text: "Merhaba [İsim], rezervasyonunuzla ilgili yaşanan karışıklık için çok üzgünüz. Rezervasyon sistemimizi yeniledik ve bu tür aksaklıkların tekrarını önlemek için kontrol mekanizmalarını güçlendirdik." }
  ] },
  { category: "❌ Olumsuz Yorumlar — Mekan", items: [
    { title: "Temizlik şikayeti", text: "Sayın [İsim], temizlik konusundaki endişenizi son derece ciddiye alıyoruz. Hijyen ekibimizle acil bir değerlendirme yaptık ve günlük kontrol listelerimizi güncelledik. Bu konuda asla taviz vermeyiz." },
    { title: "Gürültü şikayeti", text: "[İsim], gürültü seviyesi konusundaki geri bildiriminiz için teşekkürler. Akustik düzenleme çalışmalarımız devam ediyor. O zamana kadar daha sakin köşemizi tercih edebilirsiniz — rezervasyonda belirtmeniz yeterli." },
    { title: "Klima/sıcaklık", text: "Merhaba [İsim], mekanımızın sıcaklığından rahatsız olmanız için üzgünüz. Klima sistemimizi kontrol ettirdik ve ayarları düzenledik. Bir sonraki ziyaretinizde çok daha konforlu bir ortam sizi bekliyor olacak." }
  ] }
];
const RestoranYorumCevaplari = () => {
  const navigate = useNavigate();
  const [copiedIndex, setCopiedIndex] = useState(null);
  const handleCopy = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(key);
    setTimeout(() => setCopiedIndex(null), 2e3);
  };
  return /* @__PURE__ */ jsxs("div", { className: "min-h-screen bg-background", children: [
    /* @__PURE__ */ jsx(
      SEO,
      {
        title: "Restoran Yorum Cevap Örnekleri | 30 Hazır Şablon",
        description: "Google, Yelp ve TripAdvisor restoran yorumları için 30 profesyonel cevap şablonu: yemek, servis, hijyen ve atmosfer.",
        canonical: "https://voyagerespond.com/restoran-yorum-cevaplari"
      }
    ),
    /* @__PURE__ */ jsx("nav", { className: "sticky top-0 z-50 border-b backdrop-blur-lg bg-white/95", children: /* @__PURE__ */ jsx("div", { className: "container mx-auto px-6", children: /* @__PURE__ */ jsxs("div", { className: "flex h-16 items-center justify-between", children: [
      /* @__PURE__ */ jsxs("button", { onClick: () => navigate("/"), className: "flex items-center gap-2 hover:opacity-80 transition-opacity", children: [
        /* @__PURE__ */ jsx("img", { src: voyageRespondLogo, alt: "VoyageRespond", className: "h-7 w-7" }),
        /* @__PURE__ */ jsxs("span", { className: "text-lg", style: { color: "#1F2937" }, children: [
          /* @__PURE__ */ jsx("span", { className: "font-normal", children: "Voyage" }),
          /* @__PURE__ */ jsx("span", { className: "font-semibold", children: "Respond" })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4", children: [
        /* @__PURE__ */ jsx("button", { onClick: () => navigate("/blog"), className: "text-sm font-medium text-muted-foreground hover:text-foreground transition-colors", children: "Blog" }),
        /* @__PURE__ */ jsx("button", { onClick: () => navigate("/onboarding"), className: "px-4 py-2 rounded-md text-sm font-medium text-white transition-all", style: { backgroundColor: "#7A5AF8" }, children: "Ücretsiz Dene" })
      ] })
    ] }) }) }),
    /* @__PURE__ */ jsxs("section", { className: "container mx-auto px-6 py-16 max-w-4xl", children: [
      /* @__PURE__ */ jsxs("div", { className: "text-center mb-12", children: [
        /* @__PURE__ */ jsxs("div", { className: "inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4", children: [
          /* @__PURE__ */ jsx(UtensilsCrossed, { className: "w-4 h-4" }),
          "Restoranlara Özel"
        ] }),
        /* @__PURE__ */ jsx("h1", { className: "text-4xl md:text-5xl font-bold text-foreground mb-4", children: "Restoran Yorum Cevapları: Google ve Yelp için Hazır Yanıtlar" }),
        /* @__PURE__ */ jsx("p", { className: "text-lg text-muted-foreground max-w-2xl mx-auto", children: "Restoranınıza gelen Google, Yelp ve TripAdvisor yorumlarına profesyonel cevap örnekleri. Yemek kalitesi, servis hızı, hijyen ve atmosfer şikayetleri için hazır yanıt şablonları." })
      ] }),
      templates.map((section, si) => /* @__PURE__ */ jsxs("div", { className: "mb-12", children: [
        /* @__PURE__ */ jsx("h2", { className: "text-2xl font-bold text-foreground mb-6", children: section.category }),
        /* @__PURE__ */ jsx("div", { className: "space-y-4", children: section.items.map((item, ii) => {
          const key = `${si}-${ii}`;
          return /* @__PURE__ */ jsx("div", { className: "rounded-xl border border-border bg-card p-5 hover:shadow-md transition-all", children: /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between gap-4", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex-1", children: [
              /* @__PURE__ */ jsx("h3", { className: "font-semibold text-foreground mb-2", children: item.title }),
              /* @__PURE__ */ jsx("p", { className: "text-muted-foreground text-sm leading-relaxed", children: item.text })
            ] }),
            /* @__PURE__ */ jsx(
              "button",
              {
                onClick: () => handleCopy(item.text, key),
                className: "shrink-0 p-2 rounded-lg border border-border hover:bg-muted transition-colors",
                title: "Kopyala",
                "aria-label": copiedIndex === key ? "Şablon kopyalandı" : "Şablonu kopyala",
                children: copiedIndex === key ? /* @__PURE__ */ jsx(Check, { className: "w-4 h-4 text-green-600" }) : /* @__PURE__ */ jsx(Copy, { className: "w-4 h-4 text-muted-foreground" })
              }
            )
          ] }) }, key);
        }) })
      ] }, si)),
      /* @__PURE__ */ jsxs("div", { className: "my-16 text-center p-10 rounded-2xl border border-primary/10 bg-gradient-to-br from-primary/5 via-background to-background", children: [
        /* @__PURE__ */ jsx("h2", { className: "text-2xl font-bold text-foreground mb-3", children: "Yorumlara manuel cevap vermek yerine otomatik yönetmek ister misiniz?" }),
        /* @__PURE__ */ jsx("p", { className: "text-muted-foreground mb-6", children: "VoyageRespond, restoranınıza gelen her yorumu AI ile analiz eder ve markanıza uygun kişiselleştirilmiş yanıtlar üretir." }),
        /* @__PURE__ */ jsxs("button", { onClick: () => navigate("/onboarding"), className: "px-8 py-3 rounded-md text-white font-medium transition-all hover:shadow-lg", style: { backgroundColor: "#7A5AF8" }, children: [
          "3 Ay Ücretsiz Deneyin ",
          /* @__PURE__ */ jsx(ArrowRight, { className: "w-4 h-4 inline ml-1" })
        ] })
      ] }),
      /* @__PURE__ */ jsx(
        AEOSection,
        {
          pageUrl: "https://voyagerespond.com/restoran-yorum-cevaplari",
          faqs: [
            { question: "Restoran yorumlarına nasıl cevap verilir?", answer: "Restoran yorumlarına kişiselleştirilmiş, samimi ve profesyonel bir tonda yanıt verin. Müşterinin adını kullanın, bahsettiği yemeğe değinin ve tekrar ziyaret için teşvik edin. VoyageRespond gibi AI destekli yorum yönetim platformları bu süreci otomatikleştirir." },
            { question: "Restoran için yorum yönetimi neden önemlidir?", answer: "Tüketicilerin %89'u restoran seçmeden önce yorumları okuyor. Yorumlara düzenli ve profesyonel yanıt veren restoranlar %35 daha fazla güven kazanıyor ve Google sıralamalarında yükseliyor." },
            { question: "AI restoran yorumlarına cevap yazabilir mi?", answer: "Evet, VoyageRespond gibi AI destekli yorum yönetim platformları her yorumu analiz ederek restoranınızın tonuna uygun, kişiselleştirilmiş yanıtlar üretir. Manuel cevap yazmaya kıyasla %90 zaman tasarrufu sağlar." },
            { question: "Kötü restoran yorumuna nasıl cevap verilir?", answer: "Sakin kalın, özür dileyin, sorunu kabul edin ve somut bir çözüm sunun. Müşteriyi offline iletişime yönlendirin. VoyageRespond olumsuz yorumları anında tespit eder ve empatik yanıt önerileri sunar." }
          ]
        }
      ),
      /* @__PURE__ */ jsxs("div", { className: "mt-12 p-6 rounded-xl bg-muted/50 border border-border", children: [
        /* @__PURE__ */ jsx("h3", { className: "font-semibold text-foreground mb-4", children: "İlgili Sayfalar" }),
        /* @__PURE__ */ jsxs("ul", { className: "space-y-2", children: [
          /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsx("button", { onClick: () => navigate("/google-yorum-cevap-ornekleri"), className: "text-primary hover:underline text-sm", children: "Google Yorum Cevap Örnekleri (25 Şablon) →" }) }),
          /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsx("button", { onClick: () => navigate("/otel-yorum-cevaplari"), className: "text-primary hover:underline text-sm", children: "Otel Yorum Cevapları (30 Şablon) →" }) }),
          /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsx("button", { onClick: () => navigate("/blog/chatgpt-ile-google-yorumlarina-nasil-cevap-yazilir"), className: "text-primary hover:underline text-sm", children: "ChatGPT ile Yorum Cevabı Nasıl Yazılır? →" }) }),
          /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsx("button", { onClick: () => navigate("/blog/otel-restoran-yorum-yonetimi-rehberi"), className: "text-primary hover:underline text-sm", children: "Otel ve Restoran Yorum Yönetimi Rehberi →" }) })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsx("footer", { className: "border-t border-border bg-card/50", children: /* @__PURE__ */ jsx("div", { className: "container mx-auto px-6 py-8", children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col md:flex-row items-center justify-center gap-4 text-sm text-muted-foreground", children: [
      /* @__PURE__ */ jsx("span", { children: "© 2026 VoyageRespond" }),
      /* @__PURE__ */ jsx("span", { className: "hidden md:block", children: "•" }),
      /* @__PURE__ */ jsx("button", { onClick: () => navigate("/privacy-policy"), className: "hover:text-foreground", children: "Gizlilik Politikası" }),
      /* @__PURE__ */ jsx("span", { className: "hidden md:block", children: "•" }),
      /* @__PURE__ */ jsx("button", { onClick: () => navigate("/terms-of-service"), className: "hover:text-foreground", children: "Kullanım Koşulları" })
    ] }) }) }),
    /* @__PURE__ */ jsx("script", { type: "application/ld+json", dangerouslySetInnerHTML: { __html: JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Article",
      headline: "Restoran Yorum Cevapları: 30 Hazır Yanıt Şablonu",
      description: "Restoranlar için Google yorum yanıt şablonları.",
      author: { "@type": "Organization", name: "VoyageRespond" },
      mainEntityOfPage: "https://voyagerespond.com/restoran-yorum-cevaplari"
    }) } })
  ] });
};
export {
  RestoranYorumCevaplari as default
};
