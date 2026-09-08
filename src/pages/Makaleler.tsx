import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Clock, Tag } from "lucide-react";
import voyageRespondLogo from "@/assets/voyage-respond-logo.svg";
import SEO from "@/components/seo/SEO";
import { articleImageSrc, listManagedArticles, readTimeLabel, type ManagedArticle } from "@/lib/siteContent";

/** Article hub: lists every imported article that this site owns. */
const Makaleler = () => {
  const [articles, setArticles] = useState<ManagedArticle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    listManagedArticles().then((rows) => {
      if (!active) return;
      setArticles(rows);
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Makaleler | Yorum Yönetimi Rehberleri - VoyageRespond"
        description="Yorum yönetimi, itibar ve yapay zeka görünürlüğü üzerine güncel makaleler. VoyageRespond makale merkezi."
        canonical="/makaleler"
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
                className="px-4 py-2 rounded-md text-sm font-medium text-white transition-all"
                style={{ backgroundColor: "#7A5AF8" }}
              >
                Ücretsiz Dene
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <section className="container mx-auto px-4 sm:px-6 py-10 sm:py-16 text-center">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-4">Makaleler</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Yorum yönetimi ve dijital itibar üzerine yeni yayınlanan makaleler.
        </p>
      </section>

      <section className="container mx-auto px-4 sm:px-6 pb-20">
        {loading ? (
          <p className="text-center text-muted-foreground">Makaleler yükleniyor…</p>
        ) : articles.length === 0 ? (
          <div className="max-w-2xl mx-auto text-center rounded-2xl border border-border bg-card p-8">
            <p className="text-muted-foreground">
              Henüz yayınlanmış makale yok. Bu arada{" "}
              <Link to="/blog/" className="text-primary hover:underline">
                blog yazılarımıza
              </Link>{" "}
              göz atabilirsiniz.
            </p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 max-w-6xl mx-auto">
            {articles.map((article) => {
              const image = articleImageSrc(article);
              return (
                <Link
                  key={article.slug}
                  to={`/blog/${article.slug}/`}
                  className="group block cursor-pointer rounded-2xl border border-border bg-card overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                >
                  {image ? (
                    <img
                      src={image}
                      alt={article.imageAlt ?? article.title}
                      className="h-40 w-full object-cover"
                      loading="lazy"
                      decoding="async"
                    />
                  ) : (
                    <div className="h-2 w-full" style={{ background: "linear-gradient(90deg, #7A5AF8, #3B82F6)" }} />
                  )}
                  <div className="p-6 space-y-4">
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      {article.primaryKeyword ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium">
                          <Tag className="w-3 h-3" />
                          {article.primaryKeyword}
                        </span>
                      ) : null}
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {readTimeLabel(article)}
                      </span>
                    </div>

                    <h2 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors leading-tight">
                      {article.title}
                    </h2>

                    {article.excerpt && (
                      <p className="text-muted-foreground text-sm leading-relaxed line-clamp-3">{article.excerpt}</p>
                    )}

                    <div className="flex items-center justify-between pt-2">
                      <span className="text-xs text-muted-foreground">
                        {article.publishedAt
                          ? new Date(article.publishedAt).toLocaleDateString("tr-TR", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })
                          : ""}
                      </span>
                      <span className="flex items-center gap-1 text-primary text-sm font-medium group-hover:gap-2 transition-all">
                        Oku <ArrowRight className="w-4 h-4" />
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>

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

export default Makaleler;
