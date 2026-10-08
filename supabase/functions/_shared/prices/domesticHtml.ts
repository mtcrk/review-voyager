// Yurt içi OTA'lar (Jolly Tur, Tatil Sepeti, ETS) ortak yardımcıları: tüm istekler yalnızca Bright Data Web Unlocker
// üzerinden gider (doğrudan fetch yok), TR fiyat metni çözümleme, Türkçe slug.
import { unlockerAvailable, unlockerFetch } from "./unlocker.ts";

export const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36";
export type Counter = { calls: number; unlocker: number };
export const BRIGHTDATA_REQUIRED = "Yurt içi fiyat kaynakları için Bright Data gerekli";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const isChallenge = (t: string) => /Just a moment|cf-chl/i.test(t.slice(0, 3000));

/** Her yurt içi istek: Unlocker (country "tr"). 4xx/5xx'te 1,5 sn sonra tek retry; Cloudflare sayfasında hata. */
export async function domesticCall(
  url: string,
  init: { method?: "GET" | "POST"; body?: string; headers?: Record<string, string> },
  counter: Counter,
): Promise<string> {
  if (!unlockerAvailable()) throw new Error(BRIGHTDATA_REQUIRED);
  let last = "";
  for (let attempt = 0; attempt < 2; attempt++) {
    if (attempt) await sleep(1500);
    // Her deneme hem çağrı hem Unlocker çağrısı sayılır (maliyet = unlocker × UNLOCKER_COST_USD).
    counter.calls++;
    counter.unlocker++;
    let r: { status: number; text: string };
    try {
      r = await unlockerFetch({ url, method: init.method, body: init.body, headers: init.headers, country: "tr" });
    } catch (e) {
      last = `Bright Data isteği başarısız: ${e instanceof Error ? e.message : String(e)}`;
      continue;
    }
    if (r.status >= 400) {
      last = `Bright Data ${r.status}`;
      console.error(`yurt içi istek hatası [${init.method ?? "GET"} ${url}] ${last}: ${r.text.slice(0, 500)}`);
      continue;
    }
    if (isChallenge(r.text)) {
      console.error(`yurt içi istek Cloudflare engeli [${url}]: ${r.text.slice(0, 500)}`);
      throw new Error(`Cloudflare engeli (Bright Data cevabı): ${url.replace(/^https?:\/\/[^/]+/, "")}`);
    }
    return r.text;
  }
  throw new Error(last || "Bright Data isteği başarısız");
}

/** "70.000,00 TL" / "70.000 ,00TL" → 70000 */
export function parseTrPrice(s: string | null | undefined): number | null {
  if (!s) return null;
  const m = s.replace(/\s+/g, "").match(/(\d{1,3}(?:\.\d{3})+|\d+)(?:,(\d{1,2}))?/);
  if (!m) return null;
  const n = Number(m[1].replace(/\./g, "") + (m[2] ? "." + m[2] : ""));
  return n > 0 ? n : null;
}

export function trSlug(s: string) {
  return s.toLocaleLowerCase("tr")
    .replace(/ı/g, "i").replace(/ş/g, "s").replace(/ğ/g, "g").replace(/ü/g, "u").replace(/ö/g, "o").replace(/ç/g, "c")
    .replace(/&/g, " ").replace(/[^a-z0-9\s-]/g, " ").trim().replace(/\s+/g, "-");
}

export const ddmmyyyy = (iso: string) => `${iso.slice(8, 10)}.${iso.slice(5, 7)}.${iso.slice(0, 4)}`;
