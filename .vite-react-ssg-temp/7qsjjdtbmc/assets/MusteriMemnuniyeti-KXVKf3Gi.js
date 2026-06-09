import { jsxs, jsx } from "react/jsx-runtime";
import { useNavigate } from "react-router-dom";
import { Heart, TrendingUp, Users, Target, ArrowRight } from "lucide-react";
import { v as voyageRespondLogo } from "./voyage-respond-logo-C1G06huv.js";
import { A as AEOSection } from "./AEOSection-B79DgfDR.js";
import { S as SEO } from "./SEO-CentcBuw.js";
import "react-helmet-async";
const MusteriMemnuniyeti = () => {
  const navigate = useNavigate();
  return /* @__PURE__ */ jsxs("div", { className: "min-h-screen bg-background", children: [
    /* @__PURE__ */ jsx(
      SEO,
      {
        title: "Müşteri Memnuniyeti Nedir? Nasıl Ölçülür ve Artırılır? | 2026",
        description: "Müşteri memnuniyeti nedir, neden önemlidir, NPS/CSAT/CES ile nasıl ölçülür? İşletmeler için uygulanabilir 8 adımlı memnuniyet artırma rehberi.",
        canonical: "https://voyagerespond.com/musteri-memnuniyeti"
      }
    ),
    /* @__PURE__ */ jsx("nav", { className: "sticky top-0 z-50 border-b backdrop-blur-lg bg-white/95", children: /* @__PURE__ */ jsx("div", { className: "container mx-auto px-4 sm:px-6", children: /* @__PURE__ */ jsxs("div", { className: "flex h-16 items-center justify-between", children: [
      /* @__PURE__ */ jsxs("button", { onClick: () => navigate("/"), className: "flex items-center gap-2 hover:opacity-80 transition-opacity", children: [
        /* @__PURE__ */ jsx("img", { src: voyageRespondLogo, alt: "VoyageRespond", className: "h-7 w-7" }),
        /* @__PURE__ */ jsxs("span", { className: "text-lg", style: { color: "#1F2937" }, children: [
          /* @__PURE__ */ jsx("span", { className: "font-normal", children: "Voyage" }),
          /* @__PURE__ */ jsx("span", { className: "font-semibold", children: "Respond" })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4", children: [
        /* @__PURE__ */ jsx("button", { onClick: () => navigate("/blog"), className: "hidden sm:block text-sm font-medium text-muted-foreground hover:text-foreground", children: "Blog" }),
        /* @__PURE__ */ jsx("button", { onClick: () => navigate("/onboarding"), className: "px-4 py-2 rounded-md text-sm font-medium text-white", style: { backgroundColor: "#7A5AF8" }, children: "Ücretsiz Dene" })
      ] })
    ] }) }) }),
    /* @__PURE__ */ jsxs("section", { className: "container mx-auto px-4 sm:px-6 py-12 sm:py-16 max-w-4xl", children: [
      /* @__PURE__ */ jsxs("div", { className: "text-center mb-10 sm:mb-12", children: [
        /* @__PURE__ */ jsxs("div", { className: "inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4", children: [
          /* @__PURE__ */ jsx(Heart, { className: "w-4 h-4" }),
          "Müşteri Deneyimi"
        ] }),
        /* @__PURE__ */ jsx("h1", { className: "text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-4 leading-tight", children: "Müşteri Memnuniyeti Nedir, Nasıl Ölçülür ve Artırılır?" }),
        /* @__PURE__ */ jsx("p", { className: "text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto", children: "Memnuniyet skorlarını ölçmenin, anlamlandırmanın ve yorum yönetimiyle birlikte büyütmenin pratik rehberi." })
      ] }),
      /* @__PURE__ */ jsxs("article", { className: "prose prose-lg max-w-none", children: [
        /* @__PURE__ */ jsx("h2", { className: "text-2xl font-bold mt-8 mb-4", children: "Müşteri Memnuniyeti Nedir?" }),
        /* @__PURE__ */ jsxs("p", { className: "text-muted-foreground leading-relaxed", children: [
          "Müşteri memnuniyeti, bir tüketicinin satın aldığı ürün veya hizmetten beklediği değerle elde ettiği değer arasındaki ",
          /* @__PURE__ */ jsx("strong", { children: "uyumun ölçüsüdür" }),
          ". Yüksek memnuniyet → tekrar satın alma, tavsiye etme ve olumlu yorum yazma davranışını tetikler. Düşük memnuniyet → kayıp müşteri ve olumsuz Google yorumu olarak geri döner."
        ] }),
        /* @__PURE__ */ jsx("h2", { className: "text-2xl font-bold mt-12 mb-4", children: "Neden Bu Kadar Önemli? (4 Veri)" }),
        /* @__PURE__ */ jsx("div", { className: "grid sm:grid-cols-2 gap-4 my-6", children: [
          { icon: TrendingUp, stat: "5x", desc: "Yeni müşteri kazanmak, mevcut tutmaktan 5 kat pahalıdır" },
          { icon: Heart, stat: "%42", desc: "1 puan memnuniyet artışı tekrar satın almayı %42 artırıyor" },
          { icon: Users, stat: "%93", desc: "Tüketicilerin %93'ü karar vermeden önce yorumları okuyor" },
          { icon: Target, stat: "%9", desc: "1 yıldız artış = %5-9 ciro artışı (Harvard araştırması)" }
        ].map((s, i) => /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-border bg-card p-5", children: [
          /* @__PURE__ */ jsx(s.icon, { className: "w-5 h-5 text-primary mb-2" }),
          /* @__PURE__ */ jsx("div", { className: "text-2xl font-bold text-foreground", children: s.stat }),
          /* @__PURE__ */ jsx("div", { className: "text-sm text-muted-foreground", children: s.desc })
        ] }, i)) }),
        /* @__PURE__ */ jsx("h2", { className: "text-2xl font-bold mt-12 mb-4", children: "Müşteri Memnuniyeti Nasıl Ölçülür?" }),
        /* @__PURE__ */ jsx("p", { className: "text-muted-foreground leading-relaxed mb-4", children: "Üç temel metrik kullanılır:" }),
        /* @__PURE__ */ jsx("h3", { className: "text-xl font-semibold mt-6 mb-2", children: "1. NPS (Net Promoter Score)" }),
        /* @__PURE__ */ jsxs("p", { className: "text-muted-foreground", children: [
          "Tek soru: ",
          /* @__PURE__ */ jsx("em", { children: '"Bizi bir arkadaşınıza tavsiye etme olasılığınız 0-10 arasında kaçtır?"' }),
          /* @__PURE__ */ jsx("br", {}),
          /* @__PURE__ */ jsx("strong", { children: "NPS = % Destekçi (9-10) − % Eleştiren (0-6)" }),
          ". 50+ mükemmel, 30+ iyi, 0+ kabul edilebilir."
        ] }),
        /* @__PURE__ */ jsx("h3", { className: "text-xl font-semibold mt-6 mb-2", children: "2. CSAT (Customer Satisfaction Score)" }),
        /* @__PURE__ */ jsxs("p", { className: "text-muted-foreground", children: [
          /* @__PURE__ */ jsx("em", { children: '"Hizmetimizden ne kadar memnun kaldınız? (1-5)"' }),
          " Memnun olanların (4-5) toplam içindeki yüzdesi. ",
          /* @__PURE__ */ jsx("strong", { children: "%80+" }),
          " hedeftir."
        ] }),
        /* @__PURE__ */ jsx("h3", { className: "text-xl font-semibold mt-6 mb-2", children: "3. CES (Customer Effort Score)" }),
        /* @__PURE__ */ jsxs("p", { className: "text-muted-foreground", children: [
          /* @__PURE__ */ jsx("em", { children: '"Sorununuzu çözmek ne kadar kolaydı? (1-7)"' }),
          " Operasyonel verimliliği ölçer."
        ] }),
        /* @__PURE__ */ jsxs("p", { className: "text-muted-foreground mt-4", children: [
          "Detaylı anket örnekleri → ",
          /* @__PURE__ */ jsx("a", { href: "/blog/musteri-memnuniyet-anketi-ornekleri", className: "text-primary hover:underline", children: "20 hazır soru ve 5 şablon" }),
          "."
        ] }),
        /* @__PURE__ */ jsx("h2", { className: "text-2xl font-bold mt-12 mb-4", children: "Müşteri Memnuniyetini Artırmanın 8 Adımı" }),
        /* @__PURE__ */ jsxs("ol", { className: "space-y-3 text-muted-foreground list-decimal pl-6", children: [
          /* @__PURE__ */ jsxs("li", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Beklentiyi netleştirin." }),
            " Yanlış vaat, en hızlı memnuniyet katilidir."
          ] }),
          /* @__PURE__ */ jsxs("li", { children: [
            /* @__PURE__ */ jsx("strong", { children: "İlk 24 saatte yanıtlayın." }),
            " Hem destek talebine hem yoruma."
          ] }),
          /* @__PURE__ */ jsxs("li", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Kişiselleştirin." }),
            " Şablon mesaj memnuniyet skorunu düşürüyor."
          ] }),
          /* @__PURE__ */ jsxs("li", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Geri bildirimi sistematikleştirin." }),
            " Anket → kategori → aksiyon → ölç."
          ] }),
          /* @__PURE__ */ jsxs("li", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Personel eğitimi." }),
            " Memnuniyet, ekibin moralinden ayrılamaz."
          ] }),
          /* @__PURE__ */ jsxs("li", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Sorunlu müşteriyi geri kazanın." }),
            " Telafi alan müşteri 2x sadık olur."
          ] }),
          /* @__PURE__ */ jsxs("li", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Memnun müşteriye yorum talep edin." }),
            " Google/Tripadvisor yıldız sayınız sosyal kanıt üretir."
          ] }),
          /* @__PURE__ */ jsxs("li", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Yorum verisini analiz edin." }),
            " Tekrarlanan şikayetler operasyonel sorunun habercisidir."
          ] })
        ] }),
        /* @__PURE__ */ jsx("h2", { className: "text-2xl font-bold mt-12 mb-4", children: "Müşteri Memnuniyeti ve Online Yorumlar" }),
        /* @__PURE__ */ jsxs("p", { className: "text-muted-foreground leading-relaxed", children: [
          "Memnuniyet anketi, sorunu ",
          /* @__PURE__ */ jsx("strong", { children: "müşteri Google yoruma yazmadan önce" }),
          " yakalamanın en hızlı yoludur. Aksi halde olumsuz deneyim Google'a sızar ve ortalama yıldızınızı düşürür. Memnun müşterilerin Google'a yönlendirilmesi, eleştirenlerin ",
          /* @__PURE__ */ jsx("em", { children: "önce" }),
          " sizinle iletişim kurması — bu akış ",
          /* @__PURE__ */ jsx("a", { href: "/online-itibar-yonetimi", className: "text-primary hover:underline", children: "online itibar yönetimi" }),
          "nin kalbidir."
        ] }),
        /* @__PURE__ */ jsx("h2", { className: "text-2xl font-bold mt-12 mb-4", children: "Sektörel Farklılıklar" }),
        /* @__PURE__ */ jsxs("ul", { className: "space-y-2 text-muted-foreground", children: [
          /* @__PURE__ */ jsxs("li", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Restoran:" }),
            " Yemek + servis + atmosfer + fiyat — 4 boyutu ayrı ölç. ",
            /* @__PURE__ */ jsx("a", { href: "/restoran-musteri-memnuniyeti", className: "text-primary hover:underline", children: "Detay rehber" }),
            "."
          ] }),
          /* @__PURE__ */ jsxs("li", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Otel:" }),
            " Oda temizliği, check-in/out süresi, kahvaltı, konum ana metrikler."
          ] }),
          /* @__PURE__ */ jsxs("li", { children: [
            /* @__PURE__ */ jsx("strong", { children: "E-ticaret:" }),
            " Ürün açıklaması-gerçek eşleşmesi, teslimat süresi, iade kolaylığı."
          ] }),
          /* @__PURE__ */ jsxs("li", { children: [
            /* @__PURE__ */ jsx("strong", { children: "B2B hizmet:" }),
            ' CES en kritik. "İşi halletmek ne kadar kolaydı?"'
          ] })
        ] }),
        /* @__PURE__ */ jsx("h2", { className: "text-2xl font-bold mt-12 mb-4", children: "AI ile Memnuniyet Yönetimi" }),
        /* @__PURE__ */ jsx("p", { className: "text-muted-foreground leading-relaxed", children: "Modern AI platformları (VoyageRespond gibi) açık uçlu anket yanıtlarını otomatik kategorize eder, duygu skorları üretir ve yorum yanıtlarınızı kişiselleştirir. 10 yorum için harcanan 25 dakika, AI ile 5 dakikaya iner — siz yalnızca onaylarsınız." })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "my-16 text-center p-8 sm:p-10 rounded-2xl border border-primary/10 bg-gradient-to-br from-primary/5 via-background to-background", children: [
        /* @__PURE__ */ jsx("h2", { className: "text-2xl sm:text-3xl font-bold text-foreground mb-3", children: "Memnuniyet skorunuzu yıldıza çevirin" }),
        /* @__PURE__ */ jsx("p", { className: "text-muted-foreground mb-6 max-w-xl mx-auto", children: "VoyageRespond, anket sonuçlarınızı Google yorum stratejisine bağlar, AI ile yanıt taslakları üretir ve duygu trendlerini haftalık raporlar." }),
        /* @__PURE__ */ jsxs("button", { onClick: () => navigate("/onboarding"), className: "px-8 py-3 rounded-md text-white font-medium hover:shadow-lg min-h-[48px]", style: { backgroundColor: "#7A5AF8" }, children: [
          "3 Ay Ücretsiz Başla ",
          /* @__PURE__ */ jsx(ArrowRight, { className: "w-4 h-4 inline ml-1" })
        ] })
      ] }),
      /* @__PURE__ */ jsx(
        AEOSection,
        {
          pageUrl: "https://voyagerespond.com/musteri-memnuniyeti",
          faqs: [
            { question: "Müşteri memnuniyeti nedir?", answer: "Müşteri memnuniyeti, tüketicinin bir ürün veya hizmetten beklediği değerle elde ettiği değer arasındaki uyumun ölçüsüdür. Yüksek memnuniyet tekrar satın almayı, tavsiye etmeyi ve olumlu yorum yazmayı tetikler." },
            { question: "Müşteri memnuniyeti nasıl ölçülür?", answer: "Üç temel metrik kullanılır: NPS (tavsiye etme olasılığı 0-10), CSAT (genel memnuniyet 1-5) ve CES (sorunu çözmek ne kadar kolaydı 1-7). NPS sadakat, CSAT genel memnuniyet, CES operasyonel verimlilik ölçer." },
            { question: "İyi bir NPS skoru kaçtır?", answer: "50 üstü mükemmel, 30-50 arası iyi, 0-30 arası kabul edilebilir, negatif değerler kritik müdahale gerektirir. Sektör ortalamaları farklılık gösterir; otel ve restoran sektöründe 40+ rekabetçidir." },
            { question: "Müşteri memnuniyetini en hızlı nasıl artırırım?", answer: "İlk 24 saat içinde tüm yorum ve destek taleplerine yanıt verin, kişiselleştirilmiş mesajlar gönderin ve olumsuz geri bildirim alan müşteriyi proaktif arayarak telafi sunun. Bu üç eylem skorları 30 günde 10-15 puan artırabilir." },
            { question: "Müşteri memnuniyeti ve Google yıldızı bağlantısı nedir?", answer: "Memnun müşteri Google yorumu yazma olasılığı 4x daha fazladır. Yıldız ortalamanız bir puan artarsa cironuz Harvard araştırmasına göre %5-9 artar. Memnuniyet anketi + Google yorum talebi akışı kurmak doğrudan ciro etkisi yaratır." }
          ]
        }
      ),
      /* @__PURE__ */ jsxs("div", { className: "mt-12 p-6 rounded-xl bg-muted/50 border border-border", children: [
        /* @__PURE__ */ jsx("h3", { className: "font-semibold text-foreground mb-4", children: "İlgili Rehberler" }),
        /* @__PURE__ */ jsxs("ul", { className: "space-y-2", children: [
          /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsx("button", { onClick: () => navigate("/restoran-musteri-memnuniyeti"), className: "text-primary hover:underline text-sm", children: "Restoran Müşteri Memnuniyeti Rehberi →" }) }),
          /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsx("button", { onClick: () => navigate("/online-itibar-yonetimi"), className: "text-primary hover:underline text-sm", children: "Online İtibar Yönetimi Nedir? →" }) }),
          /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsx("button", { onClick: () => navigate("/blog/musteri-memnuniyet-anketi-ornekleri"), className: "text-primary hover:underline text-sm", children: "Müşteri Memnuniyet Anketi Örnekleri →" }) }),
          /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsx("button", { onClick: () => navigate("/blog/musteri-memnuniyet-mesaji-ornekleri"), className: "text-primary hover:underline text-sm", children: "Müşteri Memnuniyet Mesajı Örnekleri →" }) })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsx("footer", { className: "border-t border-border bg-card/50", children: /* @__PURE__ */ jsx("div", { className: "container mx-auto px-4 sm:px-6 py-8", children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col md:flex-row items-center justify-center gap-4 text-sm text-muted-foreground", children: [
      /* @__PURE__ */ jsx("span", { children: "© 2026 VoyageRespond" }),
      /* @__PURE__ */ jsx("span", { className: "hidden md:block", children: "•" }),
      /* @__PURE__ */ jsx("button", { onClick: () => navigate("/privacy-policy"), className: "hover:text-foreground", children: "Gizlilik Politikası" }),
      /* @__PURE__ */ jsx("span", { className: "hidden md:block", children: "•" }),
      /* @__PURE__ */ jsx("button", { onClick: () => navigate("/terms-of-service"), className: "hover:text-foreground", children: "Kullanım Koşulları" })
    ] }) }) })
  ] });
};
export {
  MusteriMemnuniyeti as default
};
