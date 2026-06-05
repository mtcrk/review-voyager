import { readFileSync } from "fs";
import { resolve } from "path";

// Static public routes to prerender (auth/app routes excluded).
export const staticPrerenderRoutes = [
  "/",
  "/about",
  "/contact",
  "/demo",
  "/pricing",
  "/blog",
  "/hub",
  "/automations/google-reviews",
  "/automations/instagram-sales",
  "/automations/whatsapp",
  "/automations/other",
  "/google-yorum-cevap-ornekleri",
  "/restoran-yorum-cevaplari",
  "/otel-yorum-cevaplari",
  "/yorum-yonetim-araclari",
  "/online-itibar-yonetimi",
  "/musteri-memnuniyeti",
  "/restoran-musteri-memnuniyeti",
  "/privacy-policy",
  "/terms-of-service",
  "/login",
  "/register",
  "/forgot-password",
  "/onboarding",
];

function readSrc(rel) {
  try {
    return readFileSync(resolve(rel), "utf-8");
  } catch {
    return "";
  }
}

export function platformSlugs() {
  const content = readSrc("src/lib/platformLandingData.ts");
  const slugs = [];
  const re = /slug:\s*"([^"]+)"/g;
  let m;
  while ((m = re.exec(content)) !== null) slugs.push(m[1]);
  return slugs;
}

export function cityHotelSlugs() {
  const content = readSrc("src/lib/cityHotelData.ts");
  const slugs = [];
  const re = /slug:\s*"([^"]+)"/g;
  let m;
  while ((m = re.exec(content)) !== null) slugs.push(m[1]);
  return slugs;
}

export function blogSlugs() {
  const files = [
    "src/lib/blogPosts.ts",
    "src/lib/blogClusterRestoran.ts",
    "src/lib/blogClusterMemnuniyet.ts",
  ];
  const slugs = new Set();
  const re = /\bslug:\s*"([^"]+)"/g;
  for (const f of files) {
    const content = readSrc(f);
    let m;
    while ((m = re.exec(content)) !== null) slugs.add(m[1]);
  }
  return [...slugs];
}

export function getAllPrerenderRoutes({ includeEn = true } = {}) {
  const routes = new Set(staticPrerenderRoutes);
  for (const s of platformSlugs()) routes.add(`/platform/${s}`);
  for (const s of cityHotelSlugs()) routes.add(`/otel-yorum-yonetimi/${s}`);
  for (const s of blogSlugs()) routes.add(`/blog/${s}`);

  if (includeEn) {
    const enRoutes = [];
    for (const r of routes) {
      if (r === "/") enRoutes.push("/en");
      else enRoutes.push(`/en${r}`);
    }
    for (const r of enRoutes) routes.add(r);
  }
  return [...routes];
}