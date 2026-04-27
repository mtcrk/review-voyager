import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Clock, Tag, Share2 } from "lucide-react";
import { getBlogPost, blogPosts } from "@/lib/blogPosts";
import voyageRespondLogo from "@/assets/voyage-respond-logo.svg";
import AEOSection from "@/components/seo/AEOSection";
import SEO from "@/components/seo/SEO";

const BlogPost = () => {
  const navigate = useNavigate();
  const { slug } = useParams<{ slug: string }>();
  const post = slug ? getBlogPost(slug) : undefined;

  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold">Yazı bulunamadı</h1>
          <button onClick={() => navigate("/blog")} className="text-primary hover:underline">
            Blog'a dön
          </button>
        </div>
      </div>
    );
  }

  // Simple markdown to HTML (handles headers, bold, links, tables, lists)
  const renderMarkdown = (md: string) => {
    const lines = md.trim().split("\n");
    const html: string[] = [];
    let inTable = false;
    let inList = false;

    for (let i = 0; i < lines.length; i++) {
      let line = lines[i];

      // Close list if needed
      if (inList && !line.startsWith("- ") && !line.startsWith("1.") && !line.match(/^\d+\./)) {
        html.push("</ul>");
        inList = false;
      }

      // Table
      if (line.startsWith("|")) {
        if (!inTable) {
          inTable = true;
          html.push('<div class="overflow-x-auto my-6"><table class="w-full border-collapse text-sm">');
          // Header row
          const cells = line.split("|").filter(Boolean).map((c) => c.trim());
          html.push("<thead><tr>" + cells.map((c) => `<th class="border border-border px-4 py-2 bg-muted text-left font-semibold">${c}</th>`).join("") + "</tr></thead><tbody>");
          i++; // Skip separator
          continue;
        }
        const cells = line.split("|").filter(Boolean).map((c) => c.trim());
        html.push("<tr>" + cells.map((c) => `<td class="border border-border px-4 py-2">${formatInline(c)}</td>`).join("") + "</tr>");
        continue;
      } else if (inTable) {
        inTable = false;
        html.push("</tbody></table></div>");
      }

      // Headers
      if (line.startsWith("### ")) {
        html.push(`<h3 class="text-xl font-bold text-foreground mt-8 mb-3">${formatInline(line.slice(4))}</h3>`);
      } else if (line.startsWith("## ")) {
        html.push(`<h2 class="text-2xl font-bold text-foreground mt-10 mb-4">${formatInline(line.slice(3))}</h2>`);
      } else if (line.startsWith("> ")) {
        html.push(`<blockquote class="border-l-4 border-primary/30 pl-4 py-2 my-4 bg-muted/50 rounded-r-lg text-muted-foreground italic">${formatInline(line.slice(2))}</blockquote>`);
      } else if (line.startsWith("- ")) {
        if (!inList) {
          inList = true;
          html.push('<ul class="space-y-2 my-4 ml-6 list-disc text-muted-foreground">');
        }
        html.push(`<li>${formatInline(line.slice(2))}</li>`);
      } else if (line.match(/^\d+\.\s/)) {
        if (!inList) {
          inList = true;
          html.push('<ul class="space-y-2 my-4 ml-6 list-decimal text-muted-foreground">');
        }
        html.push(`<li>${formatInline(line.replace(/^\d+\.\s/, ""))}</li>`);
      } else if (line.trim() === "") {
        // empty line
      } else {
        html.push(`<p class="text-muted-foreground leading-relaxed my-3">${formatInline(line)}</p>`);
      }
    }

    if (inList) html.push("</ul>");
    if (inTable) html.push("</tbody></table></div>");

    return html.join("\n");
  };

  const formatInline = (text: string): string => {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong class="text-foreground font-semibold">$1</strong>')
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-primary hover:underline font-medium">$1</a>')
      .replace(/`([^`]+)`/g, '<code class="bg-muted px-1.5 py-0.5 rounded text-sm">$1</code>');
  };

  const otherPosts = blogPosts.filter((p) => p.slug !== slug).slice(0, 2);

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title={`${post.ogTitle} | VoyageRespond Blog`}
        description={post.ogDescription}
        canonical={`/blog/${post.slug}`}
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "BlogPosting",
          headline: post.title,
          description: post.description,
          author: { "@type": "Organization", name: post.author },
          datePublished: post.publishedAt,
          keywords: post.keywords?.join(", "),
          mainEntityOfPage: `https://voyagerespond.com/blog/${post.slug}`,
        }}
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
              <button onClick={() => navigate("/blog")} className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Blog
              </button>
              <button
                onClick={() => navigate("/onboarding")}
                className="px-4 py-2 rounded-md text-sm font-medium text-white transition-all"
                style={{ backgroundColor: "#7A5AF8" }}
              >
                Ücretsiz Dene
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Article */}
      <article className="container mx-auto px-4 sm:px-6 py-12 max-w-3xl">
        {/* Back */}
        <button
          onClick={() => navigate("/blog")}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Tüm yazılar
        </button>

        {/* Meta */}
        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-6">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
            <Tag className="w-3 h-3" />
            {post.category}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            {post.readTime} okuma
          </span>
          <span>
            {new Date(post.publishedAt).toLocaleDateString("tr-TR", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </span>
        </div>

        {/* Title */}
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground leading-tight mb-6">
          {post.title}
        </h1>

        <p className="text-lg text-muted-foreground leading-relaxed mb-10 pb-10 border-b border-border">
          {post.description}
        </p>

        {/* Content */}
        <div
          className="prose-custom"
          dangerouslySetInnerHTML={{ __html: renderMarkdown(post.content) }}
        />

        {/* AEO Section + FAQ */}
        <AEOSection
          pageUrl={`https://voyagerespond.com/blog/${post.slug}`}
          faqs={[
            { question: "Google yorumlarına nasıl cevap verilir?", answer: "Google Business profilinizden yorumları görüntüleyip tek tek yanıt verebilirsiniz. Daha hızlı ve tutarlı yanıtlar için VoyageRespond gibi AI destekli yorum yönetim platformlarını kullanabilirsiniz." },
            { question: "AI yorum cevabı yazabilir mi?", answer: "Evet, VoyageRespond gibi AI destekli yorum yönetim platformları her yorumu analiz ederek kişiselleştirilmiş, marka uyumlu yanıtlar üretir. Manuel cevap yazmaya kıyasla %90 zaman tasarrufu sağlar." },
            { question: "Kötü yorumlara nasıl yanıt verilir?", answer: "Sakin kalın, özür dileyin, sorunu kabul edin ve somut bir çözüm sunun. VoyageRespond olumsuz yorumları anında tespit eder ve empatik yanıt önerileri sunar." },
          ]}
        />

        {/* Share */}
        <div className="mt-12 pt-8 border-t border-border">
          <div className="flex items-center gap-4">
            <Share2 className="w-5 h-5 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Bu yazıyı paylaşın</span>
            <a
              href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(`https://voyagerespond.com/blog/${post.slug}`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-primary hover:underline"
            >
              Twitter/X
            </a>
            <a
              href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(`https://voyagerespond.com/blog/${post.slug}`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-primary hover:underline"
            >
              LinkedIn
            </a>
          </div>
        </div>
      </article>

      {/* Related Posts */}
      {otherPosts.length > 0 && (
        <section className="container mx-auto px-4 sm:px-6 py-12 max-w-3xl">
          <h2 className="text-2xl font-bold text-foreground mb-6">Diğer Yazılar</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {otherPosts.map((p) => (
              <article
                key={p.slug}
                onClick={() => navigate(`/blog/${p.slug}`)}
                className="cursor-pointer rounded-xl border border-border bg-card p-5 hover:shadow-lg transition-all group"
              >
                <span className="text-xs text-primary font-medium">{p.category}</span>
                <h3 className="text-lg font-semibold text-foreground mt-2 group-hover:text-primary transition-colors">
                  {p.title}
                </h3>
                <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{p.description}</p>
              </article>
            ))}
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="container mx-auto px-4 sm:px-6 py-16 max-w-3xl">
        <div className="text-center p-10 rounded-2xl border border-primary/10 bg-gradient-to-br from-primary/5 via-background to-background">
          <h2 className="text-2xl font-bold text-foreground mb-3">
            Yapay zeka ile yorum yönetimine başlayın
          </h2>
          <p className="text-muted-foreground mb-6">3 ay ücretsiz, tüm özellikler dahil.</p>
          <button
            onClick={() => navigate("/onboarding")}
            className="px-8 py-3 rounded-md text-white font-medium transition-all hover:shadow-lg"
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

      {/* JSON-LD for Blog Post */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            headline: post.title,
            description: post.description,
            author: { "@type": "Organization", name: "VoyageRespond" },
            datePublished: post.publishedAt,
            publisher: {
              "@type": "Organization",
              name: "VoyageRespond",
              logo: { "@type": "ImageObject", url: "https://voyagerespond.com/email-logo.png" },
            },
            mainEntityOfPage: `https://voyagerespond.com/blog/${post.slug}`,
            keywords: post.keywords.join(", "),
          }),
        }}
      />
    </div>
  );
};

export default BlogPost;
