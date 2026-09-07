/**
 * TR <-> EN page pairs for hreflang.
 *
 * Used as a *fallback* by <SEO>: pages that already pass an explicit
 * `alternates` prop keep theirs. Pages without one get tr / en / x-default
 * derived from this map (or a self-referencing pair when no translation
 * exists).
 */

import { canonicalPath, canonicalUrl } from "@/prerenderPaths";
import { isEnglishPath } from "@/lib/geoPages";
import { cityHotelPages } from "@/lib/cityHotelData";

/** Turkish path -> English path. Both without trailing slash here. */
const BASE_PAIRS: [string, string][] = [
  ["/", "/"],
  ["/otel-yorum-cevaplari", "/hotel-review-response-examples"],
  ["/restoran-yorum-cevaplari", "/restaurant-review-response-examples"],
  ["/google-yorum-cevap-ornekleri", "/google-review-response-examples"],
  ["/online-itibar-yonetimi", "/online-reputation-management"],
  ["/yorum-yonetim-araclari", "/review-management-software"],
  ["/zincir-restoran-yorum-yonetimi", "/multi-location-restaurant-review-management"],
  ["/saglik-itibar-yonetimi", "/healthcare-reputation-management"],
  ["/dis-hekimi-yorum-yonetimi", "/dental-practice-review-management"],
  ["/estetik-klinik-yorum-yonetimi", "/aesthetic-clinic-review-management"],
  ["/musteri-memnuniyeti", "/customer-satisfaction-management"],
  ["/restoran-musteri-memnuniyeti", "/restaurant-customer-satisfaction"],
  ["/google-yorum-yonetimi", "/google-review-management"],
  ["/yapay-zeka-yorum-cevaplama", "/ai-review-response"],
  ["/google-isletme-profili-optimizasyonu", "/google-business-profile-optimization"],
  ["/ai-gorunurluk", "/ai-search-visibility"],
  ["/isletme-yorum-yonetimi", "/business-review-management"],
  ["/platform/google-yorumlari-icin-yapay-zeka", "/platform/ai-for-google-reviews"],
  ["/platform/instagram-yorumlari-icin-yapay-zeka", "/platform/ai-for-instagram-comments"],
  ["/platform/tripadvisor-yorumlari-icin-yapay-zeka", "/platform/ai-for-tripadvisor-reviews"],
  ["/platform/booking-yorumlari-icin-yapay-zeka", "/platform/ai-for-booking-com-reviews"],
  ["/platform/tiktok-yorumlari-icin-yapay-zeka", "/platform/ai-for-tiktok-comments"],
  ["/platform/yorumlara-yapay-zeka-ile-cevap-yazma", "/platform/ai-review-reply-writer"],
  ["/platform/facebook-yorumlari-icin-yapay-zeka", "/platform/ai-for-facebook-reviews"],
  ["/platform/youtube-yorumlari-icin-yapay-zeka", "/platform/ai-for-youtube-comments"],
  ["/platform/hotels-com-yorumlari-icin-yapay-zeka", "/platform/ai-for-hotels-com-reviews"],
  ["/platform/trendyol-yorumlari-icin-yapay-zeka", "/platform/ai-for-trendyol-reviews"],
  ["/platform/yemeksepeti-yorumlari-icin-yapay-zeka", "/platform/ai-for-yemeksepeti-reviews"],
  ["/platform/airbnb-yorumlari-icin-yapay-zeka", "/platform/ai-for-airbnb-reviews"],
  ["/platform/zomato-yorumlari-icin-yapay-zeka", "/platform/ai-for-zomato-reviews"],
];

// City hotel pages: /otel-yorum-yonetimi/<slug> <-> /hotel-review-management/<slug>
const CITY_PAIRS: [string, string][] = (cityHotelPages ?? []).map((c) => [
  `/otel-yorum-yonetimi/${c.slug}`,
  `/hotel-review-management/${c.slug}`,
]);

const PAIRS = [...BASE_PAIRS, ...CITY_PAIRS];

const trToEn = new Map(PAIRS.map(([tr, en]) => [canonicalPath(tr), canonicalPath(en)]));
const enToTr = new Map(PAIRS.map(([tr, en]) => [canonicalPath(en), canonicalPath(tr)]));

export interface Alternate {
  hrefLang: string;
  href: string;
}

/**
 * Reciprocal hreflang set for a pathname. Always includes x-default.
 * Falls back to a single-language + x-default set when there is no pair.
 */
export function hreflangFor(pathname: string): Alternate[] {
  const self = canonicalPath(pathname);
  const isEn = isEnglishPath(self);

  const tr = isEn ? enToTr.get(self) : self;
  const en = isEn ? self : trToEn.get(self);

  const out: Alternate[] = [];
  if (tr) out.push({ hrefLang: "tr", href: canonicalUrl(tr) });
  if (en) out.push({ hrefLang: "en", href: canonicalUrl(en) });
  out.push({ hrefLang: "x-default", href: canonicalUrl(en ?? tr ?? self) });
  return out;
}
