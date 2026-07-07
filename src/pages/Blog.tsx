import { useNavigate } from "react-router-dom";
import { ArrowRight, Clock, Tag } from "lucide-react";
import { blogPosts } from "@/lib/blogPosts";
import voyageRespondLogo from "@/assets/voyage-respond-logo.svg";
import SEO from "@/components/seo/SEO";

const Blog = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Blog | Yorum Yönetimi ve AI Rehberleri - VoyageRespond"
        description="Google yorum yönetimi, AI görünürlük, müşteri analizi ve dijital itibar yönetimi hakkında rehberler ve ipuçları. VoyageRespond Blog."
        canonical="/blog"
      />
      {/* Header */}
      <nav className="sticky top-0 z-50 border-b backdrop-blur-lg bg-white/95">
        <div className="container mx-auto px-4 sm:px-6">
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
              <button onClick={() => navigate("/")} className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Ana Sayfa
              </button>
              <button
                onClick={() => navigate("/demo")}
                className="px-4 py-2 rounded-md text-sm font-medium text-white transition-all"
                style={{ backgroundColor: "#7A5AF8" }}
              >
                Ücretsiz Dene
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="container mx-auto px-4 sm:px-6 py-10 sm:py-16 text-center">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-4">
          Blog
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Google yorum yönetimi, AI görünürlük ve dijital itibar stratejileri hakkında rehberler.
        </p>
      </section>

      {/* Blog Posts Grid */}
      <section className="container mx-auto px-4 sm:px-6 pb-20">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 max-w-6xl mx-auto">
          {blogPosts.map((post) => (
            <article
              key={post.slug}
              onClick={() => navigate(`/blog/${post.slug}`)}
              className="group cursor-pointer rounded-2xl border border-border bg-card overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            >
              {/* Category Banner */}
              <div className="h-2 w-full" style={{ background: "linear-gradient(90deg, #7A5AF8, #3B82F6)" }} />
              
              <div className="p-6 space-y-4">
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium">
                    <Tag className="w-3 h-3" />
                    {post.category}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {post.readTime}
                  </span>
                </div>

                <h2 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors leading-tight">
                  {post.title}
                </h2>

                <p className="text-muted-foreground text-sm leading-relaxed line-clamp-3">
                  {post.description}
                </p>

                <div className="flex items-center justify-between pt-2">
                  <span className="text-xs text-muted-foreground">
                    {new Date(post.publishedAt).toLocaleDateString("tr-TR", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                  <span className="flex items-center gap-1 text-primary text-sm font-medium group-hover:gap-2 transition-all">
                    Oku <ArrowRight className="w-4 h-4" />
                  </span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 sm:px-6 pb-20">
        <div className="max-w-3xl mx-auto text-center p-8 sm:p-12 rounded-2xl border border-primary/10 bg-gradient-to-br from-primary/5 via-background to-background">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
            Yorumlarınızı AI ile yönetmeye başlayın
          </h2>
          <p className="text-muted-foreground mb-6">
            3 ay ücretsiz, tüm özellikler dahil.
          </p>
          <button
            onClick={() => navigate("/demo")}
            className="px-8 py-3 rounded-md text-white font-medium transition-all hover:shadow-lg min-h-[48px]"
            style={{ backgroundColor: "#7A5AF8" }}
          >
            Ücretsiz Dene
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card/50">
        <div className="container mx-auto px-4 sm:px-6 py-8">
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 text-sm text-muted-foreground">
            <span>© 2024 VoyageRespond</span>
            <span className="hidden md:block">•</span>
            <button onClick={() => navigate("/privacy-policy")} className="hover:text-foreground">Gizlilik Politikası</button>
            <span className="hidden md:block">•</span>
            <button onClick={() => navigate("/terms-of-service")} className="hover:text-foreground">Kullanım Koşulları</button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Blog;
