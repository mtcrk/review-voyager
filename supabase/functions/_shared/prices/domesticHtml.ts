// Yurt içi OTA'lar (Jolly Tur, Tatil Sepeti) ortak yardımcıları: doğrudan çağrı, engelde Bright Data fallback,
// TR fiyat metni çözümleme, Türkçe slug.
import { unlockerAvailable, unlockerFetch } from "./unlocker.ts";

export const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36";
export type Counter = { calls: number; unlocker: number };

export async function domesticCall(
  url: string,
  init: { method?: "GET" | "POST"; body?: string; headers?: Record<string, string> },
  counter: Counter,
): Promise<string> {
  counter.calls++;
  const headers = { "User-Agent": UA, "X-Requested-With": "XMLHttpRequest", ...(init.headers ?? {}) };
  try {
    const res = await fetch(url, { method: init.method ?? "GET", headers, body: init.body, signal: AbortSignal.timeout(25_000) });
    const t = await res.text();
    if (res.ok && !/Just a moment|cf-chl/i.test(t.slice(0, 3000))) return t;
  } catch (_) { /* fallback */ }
  if (!unlockerAvailable()) throw new Error("Doğrudan erişilemedi ve Bright Data yok");
  counter.unlocker++;
  const r = await unlockerFetch({ url, method: init.method, body: init.body, headers: init.headers });
  if (r.status >= 400) throw new Error(`Bright Data ${r.status}`);
  return r.text;
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
