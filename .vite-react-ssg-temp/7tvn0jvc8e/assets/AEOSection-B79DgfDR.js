import { jsxs, Fragment, jsx } from "react/jsx-runtime";
import { useNavigate } from "react-router-dom";
import { Bot, Clock, Zap, Brain, ArrowRight } from "lucide-react";
const AEOSection = ({ faqs, pageUrl, showAISection = true }) => {
  const navigate = useNavigate();
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    showAISection && /* @__PURE__ */ jsxs("div", { className: "my-16 rounded-2xl border border-border bg-card p-8 md:p-10", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 mb-6", children: [
        /* @__PURE__ */ jsx("div", { className: "p-2 rounded-lg bg-primary/10", children: /* @__PURE__ */ jsx(Bot, { className: "w-5 h-5 text-primary" }) }),
        /* @__PURE__ */ jsx("h2", { className: "text-2xl font-bold text-foreground", children: "AI ile Yorumlara Otomatik Cevap Nasıl Yazılır?" })
      ] }),
      /* @__PURE__ */ jsx("p", { className: "text-muted-foreground leading-relaxed mb-6", children: "Geleneksel yöntemle her yoruma tek tek cevap yazmak saatler alır. Üstelik tutarlı bir ton ve kalite yakalamak neredeyse imkansızdır. AI destekli yorum yönetim araçları bu süreci tamamen otomatikleştirir." }),
      /* @__PURE__ */ jsxs("div", { className: "grid md:grid-cols-3 gap-4 mb-8", children: [
        /* @__PURE__ */ jsxs("div", { className: "p-4 rounded-xl bg-muted/50 border border-border", children: [
          /* @__PURE__ */ jsx(Clock, { className: "w-5 h-5 text-muted-foreground mb-2" }),
          /* @__PURE__ */ jsx("h3", { className: "font-semibold text-foreground text-sm mb-1", children: "Manuel Yöntem" }),
          /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: "Her yorum için 5-10 dakika. Günde 20 yorum = 3+ saat" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "p-4 rounded-xl bg-primary/5 border border-primary/20", children: [
          /* @__PURE__ */ jsx(Zap, { className: "w-5 h-5 text-primary mb-2" }),
          /* @__PURE__ */ jsx("h3", { className: "font-semibold text-foreground text-sm mb-1", children: "AI ile Otomatik" }),
          /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: "Saniyeler içinde kişiselleştirilmiş, marka uyumlu yanıtlar" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "p-4 rounded-xl bg-muted/50 border border-border", children: [
          /* @__PURE__ */ jsx(Brain, { className: "w-5 h-5 text-muted-foreground mb-2" }),
          /* @__PURE__ */ jsx("h3", { className: "font-semibold text-foreground text-sm mb-1", children: "Duygu Analizi" }),
          /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: "AI, yorumun tonunu analiz eder ve uygun yanıt üretir" })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("p", { className: "text-muted-foreground leading-relaxed mb-6", children: [
        "Bu süreci manuel yapmak yerine ",
        /* @__PURE__ */ jsx("strong", { className: "text-foreground", children: "VoyageRespond" }),
        " gibi AI destekli yorum yönetim platformlarıyla saniyeler içinde otomatik cevap oluşturabilirsiniz. VoyageRespond, Google, Booking ve TripAdvisor yorumlarını tek panelden analiz eder ve markanıza uygun profesyonel yanıtlar üretir."
      ] }),
      /* @__PURE__ */ jsxs(
        "button",
        {
          onClick: () => navigate("/onboarding"),
          className: "inline-flex items-center gap-2 px-6 py-3 rounded-lg text-white text-sm font-medium transition-all hover:shadow-lg",
          style: { backgroundColor: "#7A5AF8" },
          children: [
            "AI ile Yorum Yönetimini Deneyin",
            /* @__PURE__ */ jsx(ArrowRight, { className: "w-4 h-4" })
          ]
        }
      )
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "my-12 rounded-2xl border border-border bg-card p-8 md:p-10", children: [
      /* @__PURE__ */ jsx("h2", { className: "text-2xl font-bold text-foreground mb-8", children: "Sıkça Sorulan Sorular" }),
      /* @__PURE__ */ jsx("div", { className: "space-y-6", children: faqs.map((faq, i) => /* @__PURE__ */ jsxs("div", { className: "border-b border-border pb-6 last:border-0 last:pb-0", children: [
        /* @__PURE__ */ jsx("h3", { className: "font-semibold text-foreground mb-2", children: faq.question }),
        /* @__PURE__ */ jsx("p", { className: "text-muted-foreground text-sm leading-relaxed", children: faq.answer })
      ] }, i)) })
    ] }),
    /* @__PURE__ */ jsx(
      "script",
      {
        type: "application/ld+json",
        dangerouslySetInnerHTML: {
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: faqs.map((faq) => ({
              "@type": "Question",
              name: faq.question,
              acceptedAnswer: {
                "@type": "Answer",
                text: faq.answer
              }
            }))
          })
        }
      }
    )
  ] });
};
export {
  AEOSection as A
};
