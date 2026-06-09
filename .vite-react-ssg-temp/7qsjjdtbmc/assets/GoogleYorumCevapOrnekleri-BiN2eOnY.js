import { jsxs, jsx } from "react/jsx-runtime";
import { useNavigate } from "react-router-dom";
import { MessageSquare, Check, Copy, ArrowRight } from "lucide-react";
import { v as voyageRespondLogo } from "./voyage-respond-logo-C1G06huv.js";
import { useState } from "react";
import { A as AEOSection } from "./AEOSection-B79DgfDR.js";
import { S as SEO } from "./SEO-CentcBuw.js";
import "react-helmet-async";
const templates = [
  { category: "⭐⭐⭐⭐⭐ Olumlu Yorumlar", items: [
    { title: "Genel memnuniyet", text: "Merhaba [İsim], harika değerlendirmeniz için çok teşekkür ederiz! Sizin gibi değerli misafirlerimizi ağırlamak bizim için büyük bir mutluluk. Tekrar görüşmek dileğiyle! 🙏" },
    { title: "Yemek övgüsü", text: "[İsim] Bey/Hanım, [bahsedilen yemek] hakkındaki güzel sözleriniz şefimizi çok mutlu etti! Bu tarif tam da sizin gibi damak tadı gelişmiş misafirlerimiz için hazırlanıyor. Bir sonraki ziyaretinizde yeni menümüzü denemenizi kesinlikle öneririz. 😊" },
    { title: "Hizmet övgüsü", text: "Merhaba [İsim], ekibimiz hakkındaki güzel sözleriniz için teşekkürler! Geri bildiriminizi ekibimizle paylaştık, çok mutlu oldular. Sizi tekrar ağırlamak için sabırsızlanıyoruz! 🌟" },
    { title: "Atmosfer övgüsü", text: "[İsim], mekanımızın atmosferini beğenmenize çok sevindik! Her detay misafirlerimizin keyifli vakit geçirmesi için özenle tasarlandı. Bir sonraki ziyaretinizde terasımızı da denemenizi öneririz." },
    { title: "Otel konaklama övgüsü", text: "Sayın [İsim], otelimizde keyifli bir konaklama geçirmenize çok sevindik! Güzel yorumunuz ekibimizi motive etti. Bir sonraki ziyaretinizde sizi tekrar ağırlamaktan onur duyarız. 🏨" },
    { title: "Fiyat-performans övgüsü", text: "Merhaba [İsim], uygun fiyatla kaliteli hizmet sunabildiğimizi duymak bizi çok mutlu etti! Misafirlerimize en iyi deneyimi en makul fiyatlarla sunmak temel prensi̇bi̇mi̇z. Tekrar bekleriz! 💜" },
    { title: "İlk kez gelen müşteri", text: "[İsim], ilk ziyaretinizde bu kadar güzel bir izlenim bırakabildiğimize sevindik! Sizi düzenli misafirlerimiz arasında görmek isteriz. İkinci ziyaretinizde sizi özel bir sürpriz bekliyor olacak! ✨" }
  ] },
  { category: "⭐⭐⭐ Nötr Yorumlar", items: [
    { title: "Karma değerlendirme", text: "Merhaba [İsim], hem olumlu hem de yapıcı geri bildiriminiz için teşekkürler. [Olumlu kısım] hakkındaki güzel sözleriniz bizi mutlu etti. [İyileştirilecek kısım] konusunda ekibimizle çalışıyoruz. Tekrar denemenizi çok isteriz!" },
    { title: "Beklenti karşılanmadı", text: "[İsim], beklentilerinizi tam olarak karşılayamadığımız için üzgünüz. Geri bildiriminiz iyileştirme sürecimiz için çok değerli. Lütfen bize detay paylaşın ki bir sonraki ziyaretinizi mükemmel yapalım." },
    { title: "Detay isteme", text: "Merhaba [İsim], yorumunuz için teşekkürler. Deneyiminizi daha iyi anlayabilmemiz için bize ulaşmanızı rica ederiz. Sizin için en iyi deneyimi sunmak istiyoruz. 📧 info@isletme.com" }
  ] },
  { category: "⭐ Olumsuz Yorumlar", items: [
    { title: "Genel şikayet", text: "Merhaba [İsim], yaşadığınız deneyim için samimiyetle özür dileriz. Bu geri bildirim bizim için çok değerli ve durumu hemen ekibimizle değerlendirdik. Size doğrudan ulaşmak isteriz — lütfen bize yazın." },
    { title: "Yemek kalitesi", text: "[İsim], yemek kalitemizin beklentilerinizi karşılayamaması bizi çok üzdü. Şefimizle durumu değerlendirdik ve düzeltici adımlar attık. Telafi olarak bir sonraki ziyaretinizde özel bir ikram sunmak isteriz." },
    { title: "Uzun bekleme süresi", text: "Merhaba [İsim], uzun bekleme süresinden dolayı samimiyetle özür dileriz. Yoğun saatlerde yaşanan bu aksaklık için ek personel aldık ve sistemimizi güncelledik. Bir sonraki ziyaretinizde farkı göreceksiniz!" },
    { title: "Personel davranışı", text: "[İsim], personelimizin davranışından dolayı yaşadığınız olumsuz deneyim için çok üzgünüz. Bu durum kesinlikle değerlerimize aykırıdır. İlgili ekip arkadaşımızla görüştük ve ek eğitim başlattık." },
    { title: "Hijyen/temizlik", text: "Sayın [İsim], hijyen konusundaki endişenizi son derece ciddiye alıyoruz. Temizlik ekibimizle acil bir değerlendirme yaptık ve kontrol listelerimizi güçlendirdik. Lütfen detayları paylaşmak için bize ulaşın." },
    { title: "Fiyat şikayeti", text: "Merhaba [İsim], geri bildiriminiz için teşekkürler. Kaliteli malzeme ve deneyim sunma konusundaki kararlılığımız fiyatlarımıza yansıyor. Size özel bir teklif sunmak isteriz — bize ulaşın." },
    { title: "Oda şikayeti (Otel)", text: "Sayın [İsim], odanızla ilgili yaşadığınız sorun için samimiyetle özür dileriz. Bu durum standartlarımızın çok altındadır. Size özel bir konaklama teklifi sunmak isteriz — lütfen info@otel.com adresinden bize ulaşın." }
  ] },
  { category: "📝 Özel Durumlar", items: [
    { title: "Sadece yıldız (yazısız)", text: "Puanınız için teşekkür ederiz! 🌟 Deneyiminiz hakkında birkaç kelime yazarsanız, hem bize hem de diğer misafirlerimize çok yardımcı olursunuz. Tekrar görüşmek üzere!" },
    { title: "İngilizce olumlu", text: "Thank you so much for your wonderful review, [Name]! We're delighted you enjoyed your experience with us. We look forward to welcoming you again! 🙏" },
    { title: "İngilizce olumsuz", text: "Dear [Name], we sincerely apologize for your experience. This falls below our standards. Please contact us at [email] so we can make things right." },
    { title: "Sadık müşteri", text: "[İsim], sadık misafirimiz olarak bizi yine değerlendirmenize çok mutlu olduk! Her ziyaretinizde daha iyisini sunmak için çalışıyoruz. Bir sonraki gelişinizde sizi sürpriz bir ikramla karşılamak isteriz! 💜" },
    { title: "Yanlış yorum (başka işletme)", text: "Merhaba [İsim], yorumunuzda bahsettiğiniz durum maalesef işletmemizle örtüşmüyor. Başka bir işletmeyle karıştırmış olabilir misiniz? Yine de sorularınız için buradayız." },
    { title: "Spam/sahte yorum", text: "Bu yorumun gerçek bir müşteri deneyimini yansıtmadığını düşünüyoruz. Yine de tüm misafirlerimize en iyi hizmeti sunma kararlılığımızı sürdürüyoruz. Gerçek deneyimlerinizi duymaktan mutluluk duyarız." }
  ] }
];
const GoogleYorumCevapOrnekleri = () => {
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
        title: "Google Yorum Cevap Örnekleri | 25 Hazır Şablon",
        description: "Olumlu, olumsuz ve nötr Google yorumları için 25 profesyonel, kopyala-yapıştır cevap şablonu. Restoran, otel ve hizmet sektörü için.",
        canonical: "https://voyagerespond.com/google-yorum-cevap-ornekleri"
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
          /* @__PURE__ */ jsx(MessageSquare, { className: "w-4 h-4" }),
          "25 Hazır Şablon"
        ] }),
        /* @__PURE__ */ jsx("h1", { className: "text-4xl md:text-5xl font-bold text-foreground mb-4", children: "Google Yorum Cevap Örnekleri: 25 Hazır Yanıt Şablonu (2026)" }),
        /* @__PURE__ */ jsx("p", { className: "text-lg text-muted-foreground max-w-2xl mx-auto", children: "Google yorumlarına nasıl cevap verilir bilmiyor musunuz? Olumlu, olumsuz ve nötr müşteri yorumları için 25 profesyonel cevap örneği. Restoran, otel ve hizmet sektörü için kopyala-yapıştır hazır şablonlar." })
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
                "aria-label": copiedIndex === key ? "Kopyalandı" : `"${item.title}" şablonunu kopyala`,
                children: copiedIndex === key ? /* @__PURE__ */ jsx(Check, { className: "w-4 h-4 text-green-600" }) : /* @__PURE__ */ jsx(Copy, { className: "w-4 h-4 text-muted-foreground" })
              }
            )
          ] }) }, key);
        }) })
      ] }, si)),
      /* @__PURE__ */ jsxs("div", { className: "my-16 text-center p-10 rounded-2xl border border-primary/10 bg-gradient-to-br from-primary/5 via-background to-background", children: [
        /* @__PURE__ */ jsx("h2", { className: "text-2xl font-bold text-foreground mb-3", children: "Şablonlarla uğraşmak yerine AI'a bırakın" }),
        /* @__PURE__ */ jsx("p", { className: "text-muted-foreground mb-6", children: "VoyageRespond, her yorumu analiz ederek kişiselleştirilmiş, markanıza uygun yanıtlar üretir." }),
        /* @__PURE__ */ jsxs("button", { onClick: () => navigate("/onboarding"), className: "px-8 py-3 rounded-md text-white font-medium transition-all hover:shadow-lg", style: { backgroundColor: "#7A5AF8" }, children: [
          "Ücretsiz Deneyin ",
          /* @__PURE__ */ jsx(ArrowRight, { className: "w-4 h-4 inline ml-1" })
        ] })
      ] }),
      /* @__PURE__ */ jsx(
        AEOSection,
        {
          pageUrl: "https://voyagerespond.com/google-yorum-cevap-ornekleri",
          faqs: [
            { question: "Google yorumlarına nasıl cevap verilir?", answer: "Google Business profilinizden yorumları görüntüleyip tek tek yanıt verebilirsiniz. Daha hızlı ve tutarlı yanıtlar için VoyageRespond gibi AI destekli yorum yönetim platformlarını kullanabilirsiniz." },
            { question: "Kötü yorumlara nasıl yanıt verilir?", answer: "Olumsuz yorumlara sakin, empatik ve çözüm odaklı yaklaşın. Özür dileyin, sorunu kabul edin ve somut bir çözüm sunun. VoyageRespond, olumsuz yorumları anında tespit eder ve profesyonel yanıt önerileri sunar." },
            { question: "AI yorum cevabı yazabilir mi?", answer: "Evet, AI destekli yorum yönetim platformları her yorumu analiz ederek kişiselleştirilmiş, marka uyumlu yanıtlar üretir. VoyageRespond, Türkçe dahil çok dilli AI yanıt önerileri sunan bir yorum yönetim aracıdır." },
            { question: "Google yorumlarına cevap vermek SEO'yu etkiler mi?", answer: "Evet, Google aktif olarak yönetilen işletme profillerini sıralamada öne çıkarır. Yorum yanıt oranı yüksek işletmeler yerel arama sonuçlarında daha üst sıralarda yer alır." },
            { question: "Hazır yorum cevap şablonları kullanmak doğru mu?", answer: "Şablonlar iyi bir başlangıçtır ancak kişiselleştirilmelidir. VoyageRespond gibi AI araçları her yoruma özel, kişiselleştirilmiş yanıtlar üretir — şablon kullanmaya gerek kalmaz." }
          ]
        }
      ),
      /* @__PURE__ */ jsxs("div", { className: "mt-12 p-6 rounded-xl bg-muted/50 border border-border", children: [
        /* @__PURE__ */ jsx("h3", { className: "font-semibold text-foreground mb-4", children: "İlgili Rehberler" }),
        /* @__PURE__ */ jsxs("ul", { className: "space-y-2", children: [
          /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsx("button", { onClick: () => navigate("/blog/google-yorumlarina-nasil-yanit-verilir"), className: "text-primary hover:underline text-sm", children: "Google Yorumlarına Nasıl Yanıt Verilir? →" }) }),
          /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsx("button", { onClick: () => navigate("/blog/kotu-yorumlara-nasil-cevap-verilir"), className: "text-primary hover:underline text-sm", children: "Kötü Yorumlara Nasıl Cevap Verilir? →" }) }),
          /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsx("button", { onClick: () => navigate("/blog/chatgpt-ile-google-yorumlarina-nasil-cevap-yazilir"), className: "text-primary hover:underline text-sm", children: "ChatGPT ile Yorum Cevabı Nasıl Yazılır? →" }) }),
          /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsx("button", { onClick: () => navigate("/blog/google-yorum-cevap-araclari-2026"), className: "text-primary hover:underline text-sm", children: "En İyi Yorum Yönetim Araçları (2026) →" }) }),
          /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsx("button", { onClick: () => navigate("/restoran-yorum-cevaplari"), className: "text-primary hover:underline text-sm", children: "Restoran Yorum Cevapları (30 Şablon) →" }) }),
          /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsx("button", { onClick: () => navigate("/otel-yorum-cevaplari"), className: "text-primary hover:underline text-sm", children: "Otel Yorum Cevapları (30 Şablon) →" }) })
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
      headline: "Google Yorum Cevap Örnekleri: 25 Hazır Yanıt Şablonu",
      description: "Google yorumlarına kopyala-yapıştır hazır yanıt şablonları.",
      author: { "@type": "Organization", name: "VoyageRespond" },
      publisher: { "@type": "Organization", name: "VoyageRespond" },
      mainEntityOfPage: "https://voyagerespond.com/google-yorum-cevap-ornekleri"
    }) } })
  ] });
};
export {
  GoogleYorumCevapOrnekleri as default
};
