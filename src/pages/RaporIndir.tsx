import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Link } from "@/components/Link";
import SEO from "@/components/seo/SEO";
import { Button } from "@/components/ui/button";
import { trackEvent } from "@/lib/analytics";
import { Download, FileText, Check, ArrowRight } from "lucide-react";
import voyageRespondLogo from "@/assets/voyage-respond-logo.svg";

const PDF_PATH = "/raporlar/itibar-fiyat-gucu-raporu.pdf";

const highlights = [
  "%1 puan itibar artışının RevPAR üzerindeki etkisi (Cornell verisi)",
  "Yorum puanı ile fiyatlama gücü arasındaki ilişki",
  "Yanıt oranının rezervasyon dönüşümüne etkisi",
  "Otel sahipleri ve genel müdürler için 6 sayfalık özet",
];

const RaporIndir = () => {
  const [params] = useSearchParams();
  const [started, setStarted] = useState(false);
  const triggered = useRef(false);

  // ManyChat / reklam linkleri doğrudan indirme başlatır.
  useEffect(() => {
    if (triggered.current) return;
    triggered.current = true;
    const source = params.get("src") || params.get("utm_source") || "direct";
    trackEvent("lead_magnet_download", { report: "itibar-fiyat-gucu", source });
    const timer = window.setTimeout(() => {
      const a = document.createElement("a");
      a.href = PDF_PATH;
      a.setAttribute("download", "VoyageRespond-Itibar-Fiyat-Gucu-Raporu.pdf");
      document.body.appendChild(a);
      a.click();
      a.remove();
      setStarted(true);
    }, 600);
    return () => window.clearTimeout(timer);
  }, [params]);

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="İtibar & Fiyat Gücü Raporu (PDF) | VoyageRespond"
        description="Online yorumların otel fiyat gücüne etkisi: %1 puan itibar artışı, %1.42 RevPAR. Cornell ve hakemli literatürden 6 sayfalık ücretsiz rapor."
        canonical="/rapor"
        noindex
      />

      <nav className="border-b bg-white/95 backdrop-blur-lg">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex h-16 items-center justify-between">
            <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <img src={voyageRespondLogo} alt="VoyageRespond" className="h-7 w-7" />
              <span className="text-lg" style={{ color: "#1F2937" }}>
                <span className="font-normal">Voyage</span>
                <span className="font-semibold">Respond</span>
              </span>
            </Link>
            <Button variant="ghost" asChild>
              <Link to="/demo/">Demo</Link>
            </Button>
          </div>
        </div>
      </nav>

      <section className="container mx-auto px-4 sm:px-6 py-12 sm:py-20">
        <div className="max-w-2xl mx-auto text-center">
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
            <FileText className="w-4 h-4 mr-2" />
            Ücretsiz Rapor · 6 sayfa · PDF
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-4">
            %1 puan itibar, %1.42 RevPAR.
          </h1>
          <p className="text-lg text-muted-foreground mb-8">
            Online yorumların fiyat gücünüze etkisi — Cornell ve hakemli literatürden derlenmiş
            kısa rapor. İndirmen otomatik başlıyor; başlamadıysa aşağıdaki butona dokun.
          </p>

          <Button size="lg" className="gradient-primary text-white w-full sm:w-auto h-12 px-8" asChild>
            <a href={PDF_PATH} download="VoyageRespond-Itibar-Fiyat-Gucu-Raporu.pdf">
              <Download className="w-5 h-5 mr-2" />
              Raporu indir (PDF)
            </a>
          </Button>
          {started && (
            <p className="text-sm text-muted-foreground mt-3">
              İndirme başladı. Görünmüyorsa butona tekrar dokun.
            </p>
          )}

          <div className="mt-12 text-left bg-card border border-border rounded-2xl p-6 sm:p-8">
            <h2 className="text-xl font-semibold text-foreground mb-4">Raporda ne var?</h2>
            <ul className="space-y-3">
              {highlights.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-muted-foreground">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-10">
            <p className="text-muted-foreground mb-4">
              Yorumlarınızı yapay zeka ile tek panelden yönetmek ister misiniz?
            </p>
            <Button size="lg" variant="outline" className="w-full sm:w-auto h-12" asChild>
              <Link to="/demo/">
                Ürünü canlı dene
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default RaporIndir;
