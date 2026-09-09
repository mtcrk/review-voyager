import { useEffect, useState } from "react";
import { Navigate, useParams } from "react-router-dom";
import NotFound from "@/pages/NotFound";
import { getManagedArticle } from "@/lib/siteContent";
import { canonicalPath } from "@/prerenderPaths";

/** Accepts Rankdesk's root-level publication URL and consolidates it on /blog/. */
const ManagedArticleRedirect = () => {
  const { slug } = useParams<{ slug: string }>();
  const [exists, setExists] = useState<boolean | null>(null);

  useEffect(() => {
    let active = true;
    if (!slug) {
      setExists(false);
      return;
    }

    getManagedArticle(slug).then((article) => {
      if (active) setExists(Boolean(article));
    });

    return () => {
      active = false;
    };
  }, [slug]);

  if (exists === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground">Yazı yükleniyor…</p>
      </div>
    );
  }

  if (!exists || !slug) return <NotFound />;

  return <Navigate to={canonicalPath(`/blog/${slug}`)} replace />;
};

export default ManagedArticleRedirect;