import { useNavigate, useParams } from "react-router-dom";
import { ArrowRight, Sparkles } from "lucide-react";
import voyageRespondLogo from "@/assets/voyage-respond-logo.svg";
import AEOSection from "@/components/seo/AEOSection";
import SEO from "@/components/seo/SEO";
import { platformSlugPairs } from "@/lib/geoPlatformEn";
import {
  getPlatformLandingPage,
  getPlatformLandingSlugs,
  platformLandingPages,
} from "@/lib/platformLandingData";
import NotFound from "@/pages/NotFound";

const SITE_URL = "https://voyagerespond.com";

const PlatformLanding = () => {
  const navigate = useNavigate();
  const { slug } = useParams<{ slug: string }>();
  const data = slug ? getPlatformLandingPage(slug) : undefined;

  if (!data) return <NotFound />;

  const pageUrl = `${SITE_URL}/platform/${data.slug}`;

  // English counterpart lives at /platform/<en-slug> and is rendered by GeoLanding.
  const enSlug = platformSlugPairs[data.slug];
  const alternates = enSlug
    ? [
        { hrefLang: "tr", href: `${SITE_URL}/platform/${data.slug}/` },
        { hrefLang: "en", href: `${SITE_URL}/platform/${enSlug}/` },
        { hrefLang: "x-default", href: `${SITE_URL}/platform/${enSlug}/` },
      ]
    : undefined;

  const related = data.relatedSlugs
    .map((s) => platformLandingPages.find((p) => p.slug === s))
    .filter(Boolean) as typeof platformLandingPages;

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title={data.metaTitle}
        description={data.metaDescription}
        canonical={pageUrl}
        alternates={alternates}
        ogType="article"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "Article",
          headline: data.h1,
          description: data.metaDescription,
          author: { "@type": "Organization", name: "VoyageRespond", url: SITE_URL },
          publisher: {
            "@type": "Organization",
            name: "VoyageRespond",
            logo: { "@type": "ImageObject", url: `${SITE_URL}/og-image.png` },
          },
          mainEntityOfPage: pageUrl,
          inLanguage: "tr-TR",
        }}
      />

      <nav className="sticky top-0 z-50 border-b backdrop-blur-lg bg-white/95">
        <div className="container mx-auto px-6">
          <div className="flex h-16 items-center justify-between">
            <button
              onClick={() => navigate("/")}
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            >
              <img src={voyageRespondLogo} alt="VoyageRespond" className="h-7 w-7" />
              <span className="text-lg" style={{ color: "#1F2937" }}>
                <span className="font-normal">Voyage</span>
                <span className="font-semibold">Respond</span>
              </span>
            </button>
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate("/blog")}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Blog
              </button>
              <button
                onClick={() => navigate("/demo")}
                className="px-4 py-2 rounded-md text-sm font-medium text-white transition-all"
                style={{ backgroundColor: "#7A5AF8" }}
              >
                3 Ay Ücretsiz Dene
              </button>
            </div>
          </div>
        </div>
      </nav>

      <article className="container mx-auto px-4 sm:px-6 py-12 sm:py-16 max-w-3xl">
        {/* Hero */}
        <header className="mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs sm:text-sm font-medium mb-4">
            <span>{data.emoji}</span>
            <span>{data.badgeText}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-5 leading-tight">
            {data.h1}
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
            {data.intro}
          </p>

          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => navigate("/demo")}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg text-white text-sm font-medium transition-all hover:shadow-lg"
              style={{ backgroundColor: "#7A5AF8" }}
            >
              Ücretsiz Başla
              <ArrowRight className="w-4 h-4" />
            </button>
            <p className="text-xs text-muted-foreground self-center">
              Kredi kartı gerekmez · İlk 3 ay ücretsiz
            </p>
          </div>
        </header>

        {/* TOC */}
        <nav
          aria-label="İçindekiler"
          className="mb-12 p-5 rounded-xl border border-border bg-muted/30"
        >
          <h2 className="text-sm font-semibold text-foreground mb-3">İçindekiler</h2>
          <ol className="space-y-2 text-sm">
            {data.sections.map((s, i) => (
              <li key={s.id}>
                <a
                  href={`#${s.id}`}
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  {i + 1}. {s.heading}
                </a>
              </li>
            ))}
            <li>
              <a
                href="#sss"
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                {data.sections.length + 1}. Sıkça Sorulan Sorular
              </a>
            </li>
          </ol>
        </nav>

        {/* Sections */}
        {data.sections.map((s) => (
          <section key={s.id} id={s.id} className="mb-12 scroll-mt-20">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-5">
              {s.heading}
            </h2>
            {s.paragraphs.map((p, i) => (
              <p
                key={i}
                className="text-muted-foreground leading-relaxed mb-4 text-base"
              >
                {p}
              </p>
            ))}
            {s.bullets && (
              <ul className="mt-4 space-y-2">
                {s.bullets.map((b, i) => (
                  <li
                    key={i}
                    className="flex gap-3 text-muted-foreground leading-relaxed"
                  >
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        ))}

        {/* Mid CTA */}
        <div className="my-14 p-8 sm:p-10 rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 via-background to-background text-center">
          <Sparkles className="w-6 h-6 text-primary mx-auto mb-3" />
          <h2 className="text-2xl font-bold text-foreground mb-2">
            {data.platformName} yönetimini bugün otomatikleştirin
          </h2>
          <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
            VoyageRespond ile yorumlarınızı tek panelden, marka sesinde ve saniyeler
            içinde yanıtlayın. İlk 3 ay ücretsiz.
          </p>
          <button
            onClick={() => navigate("/demo")}
            className="inline-flex items-center gap-2 px-7 py-3 rounded-md text-white font-medium transition-all hover:shadow-lg"
            style={{ backgroundColor: "#7A5AF8" }}
          >
            Şimdi Ücretsiz Başla
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* FAQ + AEO */}
        <div id="sss" className="scroll-mt-20">
          <AEOSection pageUrl={pageUrl} faqs={data.faqs} showAISection={false} />
        </div>

        {/* Related */}
        {related.length > 0 && (
          <aside className="mt-12 p-6 rounded-xl bg-muted/40 border border-border">
            <h3 className="font-semibold text-foreground mb-4">İlgili Sayfalar</h3>
            <ul className="space-y-2">
              {related.map((r) => (
                <li key={r.slug}>
                  <button
                    onClick={() => navigate(`/platform/${r.slug}`)}
                    className="text-primary hover:underline text-sm text-left"
                  >
                    {r.emoji} {r.metaTitle} →
                  </button>
                </li>
              ))}
              <li>
                <button
                  onClick={() => navigate("/otel-yorum-cevaplari")}
                  className="text-primary hover:underline text-sm text-left"
                >
                  🏨 Otel Yorum Cevapları (30 Şablon) →
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate("/google-yorum-cevap-ornekleri")}
                  className="text-primary hover:underline text-sm text-left"
                >
                  ⭐ Google Yorum Cevap Örnekleri (25 Şablon) →
                </button>
              </li>
            </ul>
          </aside>
        )}
      </article>

      <footer className="border-t border-border bg-card/50 mt-12">
        <div className="container mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 text-sm text-muted-foreground">
            <span>© 2026 VoyageRespond</span>
            <span className="hidden md:block">•</span>
            <button onClick={() => navigate("/privacy-policy")} className="hover:text-foreground">
              Gizlilik Politikası
            </button>
            <span className="hidden md:block">•</span>
            <button onClick={() => navigate("/terms-of-service")} className="hover:text-foreground">
              Kullanım Koşulları
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export { getPlatformLandingSlugs };
export default PlatformLanding;