import { Link, useLocation, useNavigate } from "react-router-dom";
import { ArrowRight, Check, Sparkles } from "lucide-react";
import voyageRespondLogo from "@/assets/voyage-respond-logo.svg";
import SEO from "@/components/seo/SEO";
import { TrustBadges } from "@/components/landing/TrustBadges";
import { AIVisibilityChecker } from "@/components/landing/AIVisibilityChecker";
import { geoPageBySlug, type GeoPage } from "@/lib/geoPages";

const SITE = "https://voyagerespond.com";

const organizationLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "VoyageRespond",
  url: `${SITE}/`,
  logo: `${SITE}/email-logo.png`,
  description:
    "AI-assisted review management platform for hotels, restaurants and local businesses.",
};

const softwareLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "VoyageRespond",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  url: `${SITE}/`,
  publisher: { "@type": "Organization", name: "VoyageRespond" },
  inLanguage: ["tr", "en"],
};

const faqLd = (page: GeoPage) => ({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: page.faqs.map((f) => ({
    "@type": "Question",
    name: f.question,
    acceptedAnswer: { "@type": "Answer", text: f.answer },
  })),
});

const GeoLanding = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const slug = location.pathname.replace(/^\/+|\/+$/g, "");
  const page = geoPageBySlug(slug);

  if (!page) return null;

  const isTr = page.lang === "tr";
  const enSlug = isTr ? page.alt : page.slug;
  const trSlug = isTr ? page.slug : page.alt;

  const canonical = `${SITE}/${page.slug}/`;
  const alternates = [
    { hrefLang: "tr", href: `${SITE}/${trSlug}/` },
    { hrefLang: "en", href: `${SITE}/${enSlug}/` },
    { hrefLang: "x-default", href: `${SITE}/${enSlug}/` },
  ];

  const t = {
    ctaButton: isTr ? "Görünürlüğümü ölç" : "Measure my visibility",
    tryFree: isTr ? "Ücretsiz Dene" : "Try for free",
    guides: isTr ? "Rehberler" : "Guides",
    readMore: isTr ? "Rehberi oku" : "Read the guide",
    otherLang: isTr ? "English" : "Türkçe",
  };

  const checker = (
    <section id="ai-checker" className="container mx-auto px-4 sm:px-6 py-10 max-w-5xl scroll-mt-20">
      <AIVisibilityChecker />
    </section>
  );

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title={page.title}
        description={page.description}
        canonical={canonical}
        alternates={alternates}
        jsonLd={[organizationLd, softwareLd, faqLd(page)]}
      />

      <nav className="sticky top-0 z-50 border-b backdrop-blur-lg bg-white/95">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex h-16 items-center justify-between">
            <button onClick={() => navigate("/")} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <img src={voyageRespondLogo} alt="VoyageRespond" className="h-7 w-7" />
              <span className="text-lg" style={{ color: "#1F2937" }}>
                <span className="font-normal">Voyage</span><span className="font-semibold">Respond</span>
              </span>
            </button>
            <div className="flex items-center gap-4">
              <Link to={`/${isTr ? enSlug : trSlug}/`} className="hidden sm:block text-sm font-medium text-muted-foreground hover:text-foreground">
                {t.otherLang}
              </Link>

              <button onClick={() => navigate("/demo")} className="px-4 py-2 rounded-md text-sm font-medium text-white" style={{ backgroundColor: "#7A5AF8" }}>
                {t.tryFree}
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main>
        {/* H1 + definition (definition is the first text block) */}
        <section className="container mx-auto px-4 sm:px-6 pt-12 sm:pt-16 pb-8 max-w-4xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            <Sparkles className="w-4 h-4" />
            {page.eyebrow}
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-6 leading-tight">
            {page.h1}
          </h1>
          <p className="text-lg text-foreground/90 leading-relaxed rounded-xl border border-border bg-card p-5 sm:p-6">
            {page.definition}
          </p>
        </section>

        {page.showChecker && checker}

        {/* How it works */}
        <section className="container mx-auto px-4 sm:px-6 py-8 max-w-4xl">
          <h2 className="text-2xl font-bold text-foreground mb-6">{page.stepsHeading}</h2>
          <ol className="space-y-4">
            {page.steps.map((s, i) => (
              <li key={i} className="flex gap-4 rounded-xl border border-border bg-card p-5">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold">
                  {i + 1}
                </span>
                <div>
                  <div className="font-semibold text-foreground mb-1">{s.title}</div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{s.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        {/* Comparison table */}
        <section className="container mx-auto px-4 sm:px-6 py-8 max-w-4xl">
          <h2 className="text-2xl font-bold text-foreground mb-6">{page.tableHeading}</h2>
          <div className="overflow-x-auto rounded-xl border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  {page.tableColumns.map((c, i) => (
                    <th key={i} className="px-4 py-3 text-left font-semibold text-foreground">{c}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {page.tableRows.map((row, i) => (
                  <tr key={i} className="border-t border-border">
                    <td className="px-4 py-3 font-medium text-foreground">{row[0]}</td>
                    <td className="px-4 py-3 text-muted-foreground">{row[1]}</td>
                    <td className="px-4 py-3 text-foreground">{row[2]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Facts */}
        <section className="container mx-auto px-4 sm:px-6 py-8 max-w-4xl">
          <h2 className="text-2xl font-bold text-foreground mb-6">{page.factsHeading}</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {page.facts.map((f, i) => (
              <div key={i} className="rounded-xl border border-border bg-card p-5">
                <div className="text-2xl font-bold text-primary mb-1">{f.value}</div>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Response templates */}
        {page.examples && (
          <section className="container mx-auto px-4 sm:px-6 py-8 max-w-4xl">
            <h2 className="text-2xl font-bold text-foreground mb-6">
              {page.examplesHeading || (isTr ? "Örnekler" : "Examples")}
            </h2>
            <div className="space-y-8">
              {page.examples.map((group) => (
                <div key={group.category}>
                  <h3 className="text-lg font-semibold text-foreground mb-4">{group.category}</h3>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {group.items.map((item) => (
                      <div key={item.title} className="rounded-xl border border-border bg-card p-5">
                        <div className="font-medium text-foreground mb-2 text-sm">{item.title}</div>
                        <p className="text-sm text-muted-foreground leading-relaxed">{item.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Hub links */}

        {page.links && (
          <section className="container mx-auto px-4 sm:px-6 py-8 max-w-4xl">
            <h2 className="text-2xl font-bold text-foreground mb-6">{t.guides}</h2>
            <div className="space-y-4">
              {page.links.map((l) => (
                <article key={l.slug} className="rounded-xl border border-border bg-card p-5">
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    <Link to={`/${l.slug}/`} className="hover:text-primary">{l.title}</Link>
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-3">{l.body}</p>
                  <Link to={`/${l.slug}/`} className="inline-flex items-center gap-1 text-sm font-medium text-primary">
                    {t.readMore} <ArrowRight className="w-4 h-4" />
                  </Link>
                </article>
              ))}
            </div>
          </section>
        )}

        {/* FAQ */}
        <section className="container mx-auto px-4 sm:px-6 py-8 max-w-4xl">
          <h2 className="text-2xl font-bold text-foreground mb-6">{page.faqHeading}</h2>
          <div className="space-y-6 rounded-2xl border border-border bg-card p-6 sm:p-8">
            {page.faqs.map((f, i) => (
              <div key={i} className="border-b border-border pb-6 last:border-0 last:pb-0">
                <h3 className="font-semibold text-foreground mb-2">{f.question}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.answer}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="container mx-auto px-4 sm:px-6 py-10 max-w-4xl">
          <div className="rounded-2xl border border-primary/20 bg-primary/5 p-6 sm:p-10 text-center">
            <h2 className="text-2xl font-bold text-foreground mb-3">{page.ctaHeading}</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto mb-6">{page.ctaBody}</p>
            {page.showChecker ? (
              <a
                href="#ai-checker"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg text-white text-sm font-medium"
                style={{ backgroundColor: "#7A5AF8" }}
              >
                {t.ctaButton} <ArrowRight className="w-4 h-4" />
              </a>
            ) : (
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <Check className="w-4 h-4 text-primary" />
                {isTr ? "Kredi kartı gerekmez" : "No credit card required"}
              </div>
            )}
          </div>
        </section>

        {!page.showChecker && checker}

        <TrustBadges />
      </main>
    </div>
  );
};

export default GeoLanding;
