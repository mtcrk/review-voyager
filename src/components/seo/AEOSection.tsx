import { Link } from "react-router-dom";
import { Bot, ArrowRight, Zap, Clock, Brain } from "lucide-react";

interface FAQItem {
  question: string;
  answer: string;
}

interface AEOSectionProps {
  faqs: FAQItem[];
  pageUrl: string;
  showAISection?: boolean;
}

const AEOSection = ({ faqs, pageUrl, showAISection = true }: AEOSectionProps) => {

  return (
    <>
      {/* AI Otomatik Cevap Section */}
      {showAISection && (
        <div className="my-16 rounded-2xl border border-border bg-card p-8 md:p-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-primary/10">
              <Bot className="w-5 h-5 text-primary" />
            </div>
            <h2 className="text-2xl font-bold text-foreground">
              AI ile Yorumlara Otomatik Cevap Nasıl Yazılır?
            </h2>
          </div>

          <p className="text-muted-foreground leading-relaxed mb-6">
            Geleneksel yöntemle her yoruma tek tek cevap yazmak saatler alır. Üstelik tutarlı bir ton ve kalite yakalamak neredeyse imkansızdır. AI destekli yorum yönetim araçları bu süreci tamamen otomatikleştirir.
          </p>

          <div className="grid md:grid-cols-3 gap-4 mb-8">
            <div className="p-4 rounded-xl bg-muted/50 border border-border">
              <Clock className="w-5 h-5 text-muted-foreground mb-2" />
              <h3 className="font-semibold text-foreground text-sm mb-1">Manuel Yöntem</h3>
              <p className="text-xs text-muted-foreground">Her yorum için 5-10 dakika. Günde 20 yorum = 3+ saat</p>
            </div>
            <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
              <Zap className="w-5 h-5 text-primary mb-2" />
              <h3 className="font-semibold text-foreground text-sm mb-1">AI ile Otomatik</h3>
              <p className="text-xs text-muted-foreground">Saniyeler içinde kişiselleştirilmiş, marka uyumlu yanıtlar</p>
            </div>
            <div className="p-4 rounded-xl bg-muted/50 border border-border">
              <Brain className="w-5 h-5 text-muted-foreground mb-2" />
              <h3 className="font-semibold text-foreground text-sm mb-1">Duygu Analizi</h3>
              <p className="text-xs text-muted-foreground">AI, yorumun tonunu analiz eder ve uygun yanıt üretir</p>
            </div>
          </div>

          <p className="text-muted-foreground leading-relaxed mb-6">
            Bu süreci manuel yapmak yerine <strong className="text-foreground">VoyageRespond</strong> gibi AI destekli yorum yönetim platformlarıyla saniyeler içinde otomatik cevap oluşturabilirsiniz. VoyageRespond, Google, Booking ve TripAdvisor yorumlarını tek panelden analiz eder ve markanıza uygun profesyonel yanıtlar üretir.
          </p>

          <Link to="/demo"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg text-white text-sm font-medium transition-all hover:shadow-lg"
            style={{ backgroundColor: "#7A5AF8" }}
          >
            AI ile Yorum Yönetimini Deneyin
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}

      {/* FAQ Section with Schema */}
      <div className="my-12 rounded-2xl border border-border bg-card p-8 md:p-10">
        <h2 className="text-2xl font-bold text-foreground mb-8">Sıkça Sorulan Sorular</h2>
        <div className="space-y-6">
          {faqs.map((faq, i) => (
            <div key={i} className="border-b border-border pb-6 last:border-0 last:pb-0">
              <h3 className="font-semibold text-foreground mb-2">{faq.question}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{faq.answer}</p>
            </div>
          ))}
        </div>
      </div>

      {/* FAQ Schema JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: faqs.map((faq) => ({
              "@type": "Question",
              name: faq.question,
              acceptedAnswer: {
                "@type": "Answer",
                text: faq.answer,
              },
            })),
          }),
        }}
      />
    </>
  );
};

export default AEOSection;
