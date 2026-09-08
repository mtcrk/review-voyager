import { useMemo } from "react";
import type { ManagedArticle } from "@/lib/siteContent";

/**
 * Renders the stored article body HTML. External links open in a new tab,
 * below-the-fold images get lazy loading. Nothing is stripped from the markup.
 */
const ManagedArticleBody = ({ article }: { article: ManagedArticle }) => {
  const html = useMemo(() => {
    let out = article.html ?? "";
    // External links open in a new tab; internal links stay in the same tab.
    out = out.replace(/<a\b([^>]*?)href="(https?:\/\/[^"]+)"([^>]*)>/gi, (match, pre, href, post) => {
      if (href.includes("voyagerespond.com")) return match;
      if (/rel=/.test(match) && /target=/.test(match)) return match;
      return `<a${pre}href="${href}"${post} target="_blank" rel="noopener noreferrer">`;
    });
    // Lazy-load body images (featured image is rendered separately).
    out = out.replace(/<img\b(?![^>]*loading=)([^>]*)>/gi, '<img$1 loading="lazy" decoding="async">');
    return out;
  }, [article.html]);

  if (!html) {
    return (
      <p className="text-muted-foreground">Bu yazının içeriği şu anda görüntülenemiyor.</p>
    );
  }

  return <div className="article-content" dangerouslySetInnerHTML={{ __html: html }} />;
};

export default ManagedArticleBody;
