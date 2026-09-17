import { useEffect, useState } from "react";
import { Link } from "@/components/Link";
import { ArrowLeft, Clock, Share2, List } from "lucide-react";
import voyageRespondLogo from "@/assets/voyage-respond-logo.svg";
import SEO from "@/components/seo/SEO";
import ManagedArticleBody from "@/components/blog/ManagedArticleBody";
import { articleImageSrc, readTimeLabel, type ManagedArticle } from "@/lib/siteContent";

const ManagedArticlePage = ({ article }: { article: ManagedArticle }) => {
  const [activeId, setActiveId] = useState<string>("");
  const toc = article.toc.filter((h) => h.level <= 3 && h.id && h.text);
  const image = articleImageSrc(article);
  const published = article.publishedAt;
  const url = `https://voyagerespond.com/blog/${article.slug}/`;

  useEffect(() => {
    if (!toc.length) return;
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActiveId(e.target.id)),
      { rootMargin: "-80px 0px -70% 0px", threshold: 0.1 },
    );
    toc.forEach((h) => {
      const el = document.getElementById(h.id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [article.slug, toc]);

  const jsonLd: Record<string, unknown> =
    article.jsonLd.length > 0
      ? (article.jsonLd.length === 1 ? article.jsonLd[0] : { "@context": "https://schema.org", "@graph": article.jsonLd })
      : {
          "@context": "https://schema.org",
          "@type": "BlogPosting",
          headline: article.title,
          description: article.metaDescription ?? article.excerpt ?? article.title,
          image: image ? `https://voyagerespond.com${image.startsWith("/") ? image : `/${image}`}` : undefined,
          publisher: {
            "@type": "Organization",
            name: "VoyageRespond",
            logo: { "@type": "ImageObject", url: "https://voyagerespond.com/email-logo.png" },
          },
          datePublished: published ?? undefined,
          dateModified: article.updatedAt ?? published ?? undefined,
          mainEntityOfPage: url,
        };

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title={article.metaTitle ?? withBrandSuffix(article.title, "VoyageRespond Blog")}
        description={article.metaDescription ?? article.excerpt ?? article.title}
        canonical={`/blog/${article.slug}`}
        ogType="article"
        jsonLd={jsonLd}
      />

      <nav className="sticky top-0 z-50 border-b backdrop-blur-lg bg-white/95">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex h-16 items-center justify-between">
            <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <img src={voyageRespondLogo} alt="VoyageRespond" className="h-7 w-7" />
              <span className="text-lg" style={{ color: "#1F2937" }}>
                <span className="font-normal">Voyage</span>
                <span className="font-semibold">Respond</span>
              </span>
            </Link>
            <div className="flex items-center gap-4">
              <Link to="/blog/" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Blog
              </Link>
              <Link
                to="/demo/"
                className="px-4 py-2 rounded-md text-sm font-medium text-white transition-all inline-block"
                style={{ backgroundColor: "#7A5AF8" }}
              >
                Ücretsiz Dene
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 sm:px-6 py-12">
        <div className="mx-auto max-w-3xl xl:max-w-6xl xl:grid xl:grid-cols-[1fr_240px] xl:gap-12">
          <article className="min-w-0">
            <Link
              to="/blog/"
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
            >
              <ArrowLeft className="w-4 h-4" />
              Blog'a Dön
            </Link>

            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-6">
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {readTimeLabel(article)} okuma
              </span>
              {published && (
                <span>
                  {new Date(published).toLocaleDateString("tr-TR", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
              )}
            </div>

            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground leading-tight mb-6">
              {article.title}
            </h1>

            {article.excerpt && (
              <p className="text-lg text-muted-foreground leading-relaxed mb-10 pb-10 border-b border-border">
                {article.excerpt}
              </p>
            )}

            {image && (
              <img
                src={image}
                alt={article.imageAlt ?? article.title}
                width={article.imageWidth ?? undefined}
                height={article.imageHeight ?? undefined}
                className="w-full rounded-2xl border border-border mb-10"
                loading="eager"
                decoding="async"
              />
            )}

            <ManagedArticleBody article={article} />

            <div className="mt-12 p-6 sm:p-8 rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/10 via-primary/5 to-background flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-center sm:text-left">
                <h2 className="text-lg sm:text-xl font-bold text-foreground">Tüm yorumlarını tek yerden yönet</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Google, Booking ve TripAdvisor yorumlarına yapay zeka ile saniyeler içinde cevap ver.
                </p>
              </div>
              <Link
                to="/demo/"
                className="px-6 py-3 rounded-md text-white font-medium transition-all hover:shadow-lg whitespace-nowrap min-h-[48px] inline-block"
                style={{ backgroundColor: "#7A5AF8" }}
              >
                Ücretsiz Dene →
              </Link>
            </div>

            <div className="mt-12 pt-8 border-t border-border">
              <div className="flex items-center gap-4">
                <Share2 className="w-5 h-5 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Bu yazıyı paylaşın</span>
                <a
                  href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(article.title)}&url=${encodeURIComponent(url)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:underline"
                >
                  Twitter/X
                </a>
                <a
                  href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:underline"
                >
                  LinkedIn
                </a>
              </div>
            </div>
          </article>

          {toc.length > 0 && (
            <aside className="hidden xl:block">
              <div className="sticky top-24">
                <div className="flex items-center gap-2 text-sm font-semibold text-foreground mb-3">
                  <List className="w-4 h-4" />
                  Bu sayfada
                </div>
                <nav className="space-y-1 border-l border-border">
                  {toc.map((h) => (
                    <a
                      key={h.id}
                      href={`#${h.id}`}
                      className={`block pl-4 py-1.5 text-sm leading-snug border-l-2 -ml-px transition-colors ${
                        activeId === h.id
                          ? "border-primary text-primary font-medium"
                          : "border-transparent text-muted-foreground hover:text-foreground"
                      }`}
                      style={{ paddingLeft: h.level >= 3 ? "1.75rem" : undefined }}
                    >
                      {h.text}
                    </a>
                  ))}
                </nav>
              </div>
            </aside>
          )}
        </div>
      </div>

      <footer className="border-t border-border bg-card/50">
        <div className="container mx-auto px-4 sm:px-6 py-8">
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 text-sm text-muted-foreground">
            <span>© 2024 VoyageRespond</span>
            <span className="hidden md:block">•</span>
            <Link to="/privacy-policy/" className="hover:text-foreground">Gizlilik Politikası</Link>
            <span className="hidden md:block">•</span>
            <Link to="/terms-of-service/" className="hover:text-foreground">Kullanım Koşulları</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ManagedArticlePage;
