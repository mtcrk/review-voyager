import "./ssr-shims";
import { ViteReactSSG } from "vite-react-ssg";
import { routes, PRERENDER_PUBLIC_PATHS } from "./routes";
import "./index.css";
import "./i18n/config";

export const createRoot = ViteReactSSG({ routes });

// Picked up by vite-react-ssg's build pipeline. `paths` is the full list of
// paths enumerated from our route tree (static + getStaticPaths-expanded).
// We return only those we want prerendered. Anything with `:` or `*` is then
// dropped by vite-react-ssg's DefaultIncludedRoutes, but our expanded slugs
// have no params left so they survive.
export function includedRoutes(paths: string[]): string[] {
  const norm = (p: string) => (p.startsWith("/") ? p : `/${p}`);
  const publicSet = new Set(PRERENDER_PUBLIC_PATHS);
  const out = new Set<string>(PRERENDER_PUBLIC_PATHS);
  for (const raw of paths) {
    const p = norm(raw);
    if (publicSet.has(p)) out.add(p);
    if (
      p.startsWith("/blog/") ||
      p.startsWith("/platform/") ||
      p.startsWith("/otel-yorum-yonetimi/")
    ) {
      out.add(p);
    }
  }
  // eslint-disable-next-line no-console
  console.log("[ssg] includedRoutes →", out.size, "paths (input was", paths.length, ")");
  return [...out];
}
