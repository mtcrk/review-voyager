import { jsxs, jsx } from "react/jsx-runtime";
import { useNavigate } from "react-router-dom";
import { UtensilsCrossed, ChefHat, Clock, Star, ArrowRight } from "lucide-react";
import { v as voyageRespondLogo } from "./voyage-respond-logo-C1G06huv.js";
import { A as AEOSection } from "./AEOSection-B79DgfDR.js";
import { S as SEO } from "./SEO-CentcBuw.js";
import "react-helmet-async";
const RestoranMusteriMemnuniyeti = () => {
  const navigate = useNavigate();
  return /* @__PURE__ */ jsxs("div", { className: "min-h-screen bg-background", children: [
    /* @__PURE__ */ jsx(
      SEO,
      {
        title: "Restoran Müşteri Memnuniyeti: Ölçüm, Anket, Yorum Yönetimi 2026",
        description: "Restoran müşteri memnuniyeti nasıl ölçülür ve artırılır? 4 boyutta ölçüm (yemek, servis, atmosfer, fiyat), anket örnekleri ve Google yorum stratejisi.",
        canonical: "https://voyagerespond.com/restoran-musteri-memnuniyeti"
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
          /* @__PURE__ */ jsx(UtensilsCrossed, { className: "w-4 h-4" }),
          "Restoranlara Özel"
        ] }),
        /* @__PURE__ */ jsx("h1", { className: "text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-4 leading-tight", children: "Restoran Müşteri Memnuniyeti: Ölçme, Artırma ve Yıldıza Çevirme" }),
        /* @__PURE__ */ jsx("p", { className: "text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto", children: "Restoran müşteri memnuniyetinin 4 boyutu (yemek, servis, atmosfer, fiyat), anket örnekleri, şikayet yönetimi ve Google yorumlarına dönüştürme stratejisi." })
      ] }),
      /* @__PURE__ */ jsxs("article", { className: "prose prose-lg max-w-none", children: [
        /* @__PURE__ */ jsx("h2", { className: "text-2xl font-bold mt-8 mb-4", children: "Restoran Müşteri Memnuniyeti Nedir?" }),
        /* @__PURE__ */ jsxs("p", { className: "text-muted-foreground leading-relaxed", children: [
          "Restoran müşteri memnuniyeti, misafirin restoranınızdan beklediği ",
          /* @__PURE__ */ jsx("strong", { children: "yemek + servis + atmosfer + fiyat" }),
          " deneyiminin gerçekleşen deneyimle örtüşme oranıdır. Sektörel araştırmalara göre tüketicilerin ",
          /* @__PURE__ */ jsx("strong", { children: "%87'si" }),
          " restoran seçmeden önce Google yorumlarını okur; ortalama yıldızı 4.4'ün altında olan restoranların yerel aramada ilk 3'e girme şansı ",
          /* @__PURE__ */ jsx("strong", { children: "%70 azalır" }),
          "."
        ] }),
        /* @__PURE__ */ jsx("h2", { className: "text-2xl font-bold mt-12 mb-4", children: "Memnuniyetin 4 Boyutu" }),
        /* @__PURE__ */ jsx("div", { className: "grid sm:grid-cols-2 gap-4 my-6", children: [
          { icon: ChefHat, title: "Yemek", desc: "Lezzet, sıcaklık, sunum, porsiyon. Tüm şikayetlerin %42'si buradan gelir." },
          { icon: Clock, title: "Servis", desc: "Hız, ilgi, sorun çözme. 2. en sık şikayet kategorisi." },
          { icon: Star, title: "Atmosfer", desc: "Temizlik, müzik, mekan dekoru, konfor. Tekrar gelmeyi belirleyen #1 faktör." },
          { icon: UtensilsCrossed, title: "Fiyat-Değer", desc: "Mutlak fiyat değil, alınan değere oran önemli." }
        ].map((s, i) => /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-border bg-card p-5", children: [
          /* @__PURE__ */ jsx(s.icon, { className: "w-5 h-5 text-primary mb-2" }),
          /* @__PURE__ */ jsx("div", { className: "font-semibold text-foreground mb-1", children: s.title }),
          /* @__PURE__ */ jsx("div", { className: "text-sm text-muted-foreground", children: s.desc })
        ] }, i)) }),
        /* @__PURE__ */ jsx("h2", { className: "text-2xl font-bold mt-12 mb-4", children: "Memnuniyet Nasıl Ölçülür?" }),
        /* @__PURE__ */ jsx("p", { className: "text-muted-foreground leading-relaxed", children: "Restoran için en etkili 3 yöntem:" }),
        /* @__PURE__ */ jsxs("ol", { className: "space-y-2 text-muted-foreground list-decimal pl-6", children: [
          /* @__PURE__ */ jsxs("li", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Ödeme sonrası mikro anket." }),
            ' 2 saat içinde SMS/WhatsApp ile tek soru: "1-5 arası ziyaretiniz nasıldı?"'
          ] }),
          /* @__PURE__ */ jsxs("li", { children: [
            /* @__PURE__ */ jsx("strong", { children: "QR kod masada." }),
            " Masaya küçük QR koyun → 30 saniyelik anket."
          ] }),
          /* @__PURE__ */ jsxs("li", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Google yorum analizi." }),
            " Mevcut yorumlardan duygu kategorisi çıkarın (yemek/servis/atmosfer/fiyat)."
          ] })
        ] }),
        /* @__PURE__ */ jsxs("p", { className: "text-muted-foreground mt-4", children: [
          "5 hazır anket şablonu için → ",
          /* @__PURE__ */ jsx("a", { href: "/blog/musteri-memnuniyet-anketi-ornekleri", className: "text-primary hover:underline", children: "Müşteri Memnuniyet Anketi Örnekleri" }),
          "."
        ] }),
        /* @__PURE__ */ jsx("h2", { className: "text-2xl font-bold mt-12 mb-4", children: "Restoran Müşteri Memnuniyetini Artıran 7 Pratik" }),
        /* @__PURE__ */ jsxs("ol", { className: "space-y-3 text-muted-foreground list-decimal pl-6", children: [
          /* @__PURE__ */ jsxs("li", { children: [
            /* @__PURE__ */ jsx("strong", { children: "İlk 60 saniye protokolü." }),
            " Misafir oturduğunda 60 saniye içinde su + selam."
          ] }),
          /* @__PURE__ */ jsxs("li", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Menü açıklamasını gerçekçi tutun." }),
            ' "Az pişmiş" yerine "kanlı" gibi net ifadeler beklentiyi yönetir.'
          ] }),
          /* @__PURE__ */ jsxs("li", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Garson rotasyonu yapmayın." }),
            " Aynı garson masaya başından sonuna kadar baksın."
          ] }),
          /* @__PURE__ */ jsxs("li", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Şikayeti masadan çıkmadan çözün." }),
            " Mutfak hatası olursa hemen telafi (içecek/tatlı ikramı)."
          ] }),
          /* @__PURE__ */ jsxs("li", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Mutfak süresini şeffaflaştırın." }),
            ' "10 dakika sürer" demek beklemeyi 2x kısa hissettirir.'
          ] }),
          /* @__PURE__ */ jsxs("li", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Çıkışta teşekkür." }),
            " Garson kapıya kadar uğurlamak NPS'i 12 puan artırır."
          ] }),
          /* @__PURE__ */ jsxs("li", { children: [
            /* @__PURE__ */ jsx("strong", { children: "24 saat içinde takip mesajı." }),
            " Memnun müşteriden Google yorumu isteyin."
          ] })
        ] }),
        /* @__PURE__ */ jsx("h2", { className: "text-2xl font-bold mt-12 mb-4", children: "Şikayet Yönetimi: Restoran Spesifik" }),
        /* @__PURE__ */ jsx("p", { className: "text-muted-foreground leading-relaxed mb-4", children: "En sık karşılaşılan 5 şikayet ve nasıl yönetilir:" }),
        /* @__PURE__ */ jsxs("ul", { className: "space-y-2 text-muted-foreground", children: [
          /* @__PURE__ */ jsxs("li", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Yemek soğuk geldi:" }),
            " Anında yenisini sıcak getir, içecek ikram et."
          ] }),
          /* @__PURE__ */ jsxs("li", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Yavaş servis:" }),
            " 10 dakika önce müşteriye haber ver, gecikmeyi açıkla."
          ] }),
          /* @__PURE__ */ jsxs("li", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Yanlış sipariş:" }),
            " Doğrusunu getirirken yanlışı iade etme, ikram olarak bırak."
          ] }),
          /* @__PURE__ */ jsxs("li", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Kaba personel:" }),
            " Müdür/şef masaya inip kişisel olarak özür dilesin."
          ] }),
          /* @__PURE__ */ jsxs("li", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Hesap hatası:" }),
            " Hatayı kabul et, indirim sun, kasiyerle özel eğitim yap."
          ] })
        ] }),
        /* @__PURE__ */ jsx("h2", { className: "text-2xl font-bold mt-12 mb-4", children: "Memnuniyetten Google Yıldızına" }),
        /* @__PURE__ */ jsxs("p", { className: "text-muted-foreground leading-relaxed", children: [
          "Memnun müşteri kendiliğinden yorum yazmaz — ",
          /* @__PURE__ */ jsx("strong", { children: "istemeniz gerekir" }),
          ". Mikro anketten 4-5 alanları doğrudan Google yorum linkine yönlendirin; 1-3 alanları ise restorana özel iletişim formuna. Bu basit ayrıştırma, ortalama yıldızınızı 6 ayda 4.1'den 4.6'ya çıkarır."
        ] }),
        /* @__PURE__ */ jsx("h2", { className: "text-2xl font-bold mt-12 mb-4", children: "AI ile Restoran Memnuniyet Yönetimi" }),
        /* @__PURE__ */ jsx("p", { className: "text-muted-foreground leading-relaxed", children: "VoyageRespond restoranlar için Google, Yemeksepeti, TripAdvisor ve Zomato yorumlarınızı tek panelden çeker. Her yoruma marka tonunuza uygun kişisel yanıt üretir, kategori bazlı (yemek/servis/temizlik) duygu trendlerini haftalık raporlar." })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "my-16 text-center p-8 sm:p-10 rounded-2xl border border-primary/10 bg-gradient-to-br from-primary/5 via-background to-background", children: [
        /* @__PURE__ */ jsx("h2", { className: "text-2xl sm:text-3xl font-bold text-foreground mb-3", children: "Restoranınızın yıldızlarını yükseltin" }),
        /* @__PURE__ */ jsx("p", { className: "text-muted-foreground mb-6 max-w-xl mx-auto", children: "Tüm Google, Yemeksepeti ve TripAdvisor yorumlarınızı AI ile yönetin. 3 ay ücretsiz deneyin." }),
        /* @__PURE__ */ jsxs("button", { onClick: () => navigate("/onboarding"), className: "px-8 py-3 rounded-md text-white font-medium hover:shadow-lg min-h-[48px]", style: { backgroundColor: "#7A5AF8" }, children: [
          "Ücretsiz Başla ",
          /* @__PURE__ */ jsx(ArrowRight, { className: "w-4 h-4 inline ml-1" })
        ] })
      ] }),
      /* @__PURE__ */ jsx(
        AEOSection,
        {
          pageUrl: "https://voyagerespond.com/restoran-musteri-memnuniyeti",
          faqs: [
            { question: "Restoran müşteri memnuniyeti nasıl ölçülür?", answer: "Ödeme sonrası 2 saat içinde gönderilen SMS/WhatsApp mikro anketleri (tek soruluk 1-5 değerlendirme), masadaki QR kod anketleri ve mevcut Google yorumlarının kategori bazlı duygu analizi ile ölçülür. Bu üçü birleşince haftalık trend takibi mümkün olur." },
            { question: "Restoranımda memnuniyeti en hızlı nasıl artırırım?", answer: "İlk 60 saniye protokolü (oturunca su+selam), garson rotasyonu yapmamak, şikayeti masada çözmek ve çıkışta kapıya kadar uğurlamak — bu 4 pratik 30 günde memnuniyet skorunu 10-15 puan artırır." },
            { question: "Memnun müşteriden Google yorumunu nasıl alırım?", answer: "Ödeme sonrası SMS ile 1-5 arası mikro anket gönderin; 4-5 verenleri doğrudan Google yorum linkine, 1-3 verenleri restoran iletişim formuna yönlendirin. Bu ayrıştırma ortalama yıldızı korurken yorum sayısını 3x artırır." },
            { question: "Olumsuz Google yorumunu nasıl yönetirim?", answer: "24 saat içinde profesyonel yanıt yazın: özür, somut aksiyon, sizinle doğrudan iletişim çağrısı. Yorum sahte/haksızsa Google'a 'Uygunsuz olarak işaretle' ile şikayet edin. Detaylı çerçeve için olumsuz Google yorumu rehberimize bakın." },
            { question: "Yemeksepeti puanım Google'ı etkiler mi?", answer: "Doğrudan etkilemez ama tüketici davranışını etkiler. Yemeksepeti puanı düşük olan restoranların Google yorum sayısı zamanla %40 düşüyor çünkü misafir önce Yemeksepeti'ne bakıp vazgeçiyor. Çoklu platform yönetimi şart." }
          ]
        }
      ),
      /* @__PURE__ */ jsxs("div", { className: "mt-12 p-6 rounded-xl bg-muted/50 border border-border", children: [
        /* @__PURE__ */ jsx("h3", { className: "font-semibold text-foreground mb-4", children: "İlgili Rehberler" }),
        /* @__PURE__ */ jsxs("ul", { className: "space-y-2", children: [
          /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsx("button", { onClick: () => navigate("/musteri-memnuniyeti"), className: "text-primary hover:underline text-sm", children: "Müşteri Memnuniyeti Nedir? →" }) }),
          /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsx("button", { onClick: () => navigate("/restoran-yorum-cevaplari"), className: "text-primary hover:underline text-sm", children: "Restoran Yorum Cevap Şablonları →" }) }),
          /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsx("button", { onClick: () => navigate("/blog/musteri-memnuniyet-anketi-ornekleri"), className: "text-primary hover:underline text-sm", children: "Müşteri Memnuniyet Anketi Örnekleri →" }) }),
          /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsx("button", { onClick: () => navigate("/blog/musteri-memnuniyet-mesaji-ornekleri"), className: "text-primary hover:underline text-sm", children: "Müşteri Memnuniyet Mesajı Örnekleri →" }) }),
          /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsx("button", { onClick: () => navigate("/online-itibar-yonetimi"), className: "text-primary hover:underline text-sm", children: "Online İtibar Yönetimi →" }) })
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
  RestoranMusteriMemnuniyeti as default
};
