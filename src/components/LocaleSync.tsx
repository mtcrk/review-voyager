import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { isEnglishPath } from "@/lib/geoPages";

/**
 * Keeps the i18n language in sync with the URL.
 * - /en/... and root-level English pages -> EN
 * - everything else -> TR (default)
 *
 * Mounted once inside <BrowserRouter>.
 */
export function LocaleSync() {
  const { i18n } = useTranslation();
  const { pathname } = useLocation();

  useEffect(() => {
    // Note: the <html lang> attribute is owned by SEO.tsx (Helmet) — do not set it here.
    const target = isEnglishPath(pathname) ? "en" : "tr";
    if (i18n.language !== target) {
      i18n.changeLanguage(target);
    }
  }, [pathname, i18n]);

  return null;
}

/**
 * Hook: returns the current locale derived from the URL,
 * plus a helper to build a path in the given locale.
 */
export function useUrlLocale() {
  const { pathname } = useLocation();
  const locale: "tr" | "en" =
    pathname === "/en" || pathname.startsWith("/en/") ? "en" : "tr";

  const stripped =
    locale === "en"
      ? pathname.replace(/^\/en(?=\/|$)/, "") || "/"
      : pathname;

  const buildPath = (target: "tr" | "en", path?: string) => {
    const p = path ?? stripped;
    const clean = p.startsWith("/") ? p : `/${p}`;
    if (target === "en") return clean === "/" ? "/en" : `/en${clean}`;
    return clean;
  };

  return { locale, stripped, buildPath };
}

/**
 * Wrapper route element for /en/*. It just re-renders its children
 * (the actual routes are matched by the inner <Routes>).
 */
export function EnglishOutlet({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
