// Tatil Sepeti adapter'ı. Doğrudan erişim çalışıyor (Bright Data yalnızca engelde).
// Eşleşme: isimden slug tahmini → GET sayfa; site kısa slug'a yönlendirir, <title> ile isim benzerliği doğrulanır.
// Fiyat: POST /{slug} (form: Search=oda:2;tarih:dd.mm.yyyy,dd.mm.yyyy;click:true) → JSON "roomList" HTML.
import { DOMParser } from "https://deno.land/x/deno_dom@v0.1.45/deno-dom-wasm.ts";
import type { AdapterResult, BatchResult, FetchParams, PriceQuote, Subject } from "./types.ts";
import { similarity } from "./types.ts";
import { etsBoard } from "./etstur.ts";
import { UNLOCKER_COST_USD, unlockerAvailable, unlockerFetch } from "./unlocker.ts";
import { type Counter, ddmmyyyy, domesticCall, parseTrPrice, trSlug, UA } from "./domesticHtml.ts";

const BASE = "https://www.tatilsepeti.com";

async function resolve(s: Subject, c: Counter) {
  const base = trSlug(s.name);
  const short = trSlug(s.name.replace(/\b(hotel|otel|resort|spa|golf|&|ve)\b/gi, " "));
  for (const slug of Array.from(new Set([base, short])).filter(Boolean)) {
    c.calls++;
    let finalUrl = "", html = "";
    try {
      const r = await fetch(`${BASE}/${slug}`, { headers: { "User-Agent": UA }, redirect: "follow", signal: AbortSignal.timeout(25_000) });
      finalUrl = r.url; html = r.ok ? await r.text() : "";
    } catch (_) { /* fallback */ }
    if (!html && unlockerAvailable()) {
      c.unlocker++;
      const r = await unlockerFetch({ url: `${BASE}/${slug}` });
      if (r.status < 400) { html = r.text; finalUrl = `${BASE}/${slug}`; }
    }
    const title = html.match(/<title>([^<|]+)/)?.[1]?.replace(/\s*Otel\s*$/i, "").trim() ?? "";
    if (!title || /bulunamad|404/i.test(title)) continue;
    if (similarity(s.name, title) < 0.5 && similarity(title, s.name) < 0.5) continue;
    const finalSlug = new URL(finalUrl).pathname.replace(/^\//, "").split("/")[0] || slug;
    return { slug: finalSlug, name: title };
  }
  return null;
}

export function parseTatilSepeti(html: string, nights: number): PriceQuote[] {
  const doc = new DOMParser().parseFromString(html, "text/html");
  if (!doc) return [];
  const out: PriceQuote[] = [];
  for (const card of Array.from(doc.querySelectorAll("div.hotel-detail-cards[data-roomtypeid]")) as any[]) {
    const pb = card.querySelector(".hotel-detail-cards__price-div");
    if (!pb) continue;
    const disc = parseTrPrice(pb.querySelector("[class*='__discount-price']")?.textContent);
    const def = parseTrPrice(pb.querySelector("[class*='__default-price']")?.textContent);
    const total = disc ?? def;
    if (!total) continue;
    const text = (card.textContent ?? "").replace(/\s+/g, " ");
    const roomName = text.trim().replace(/^\d+\s+/, "").split(" Müsaitlik Takvimi")[0].trim() || null;
    const concept = text.match(/(Ultra Her ?Şey Dahil|Luxury Her ?Şey Dahil|Her ?Şey Dahil|Tam Pansiyon(?: Plus)?|Yarım Pansiyon(?: Plus)?|Oda Kahvaltı|Sadece Oda)/i)?.[1] ?? "";
    const n = Number(text.match(/Toplam\s*(\d+)\s*Gece/)?.[1]) || nights;
    out.push({
      source: "Tatil Sepeti", source_adapter: "tatilsepeti",
      price_per_night: total / n, price_total: total, price_derived: true,
      board_type: etsBoard(null, concept.replace(/Herşey/i, "Her Şey")),
      room_name: roomName,
      refundable: /Ücretsiz İptal|Risksiz/i.test(text) ? true : null,
      taxes_included: true,
      is_official: false, is_ad: false, num_guests: null,
      price_before_discount: disc ? def : null,
      raw: { roomtypeid: card.getAttribute("data-roomtypeid"), concept, total, def },
    });
  }
  return out;
}

export function createTatilSepetiAdapter() {
  return {
    id: "tatilsepeti" as const,
    async fetchMany(subjects: Subject[], p: FetchParams): Promise<BatchResult & { unlocker_calls: number }> {
      const results = new Map<string, AdapterResult>();
      const c: Counter = { calls: 0, unlocker: 0 };
      for (const s of subjects) {
        try {
          const match: Record<string, string> = {};
          let slug = (s as any).tatilsepeti_slug as string | null;
          if (!slug) {
            const h = await resolve(s, c);
            match.tatilsepeti_checked_at = new Date().toISOString();
            if (!h) { results.set(s.key, { status: "not_found", quotes: [], match: match as any }); continue; }
            slug = h.slug;
            Object.assign(match, { tatilsepeti_slug: h.slug, tatilsepeti_matched_name: h.name });
          }
          const search = `oda:${p.adults};tarih:${ddmmyyyy(p.checkin)},${ddmmyyyy(p.checkout)};click:true`;
          const t = await domesticCall(`${BASE}/${slug}`, {
            method: "POST", body: new URLSearchParams({ Search: search }).toString(),
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
          }, c);
          const d = JSON.parse(t);
          const quotes = parseTatilSepeti(String(d?.roomList ?? ""), p.nights);
          results.set(s.key, { status: quotes.length ? "ok" : "no_prices", quotes, match: match as any });
        } catch (e) {
          console.error("tatilsepeti adapter failed", s.name, e);
          results.set(s.key, { status: "error", quotes: [], error: String(e) });
        }
      }
      return { results, calls: c.calls, unlocker_calls: c.unlocker, cost_usd: c.unlocker * UNLOCKER_COST_USD };
    },
  };
}
