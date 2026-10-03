import { PLACE_WORDS, provincesOf } from "./provinces.ts";
// Ortak otel eşleşme puanlaması (tüm kaynaklar).
// Kural: işletme adındaki AYIRT EDİCİ kelimelerin hepsi adayda geçmeli; konum aynı bölgede olmalı.
// Seviye: high → otomatik kaydet · medium → onay bekler (fiyat çekilmez) · low → eşleşme yok.

export type Level = "high" | "medium" | "low";
export type Candidate = { name: string; location?: string | null; gps?: { lat: number; lng: number } | null; data: Record<string, unknown> };
export type Scored = { cand: Candidate; level: Level; confidence: number; reason: string; extras: number };

export function fold(s: string) {
  return String(s ?? "")
    .toLocaleLowerCase("tr")
    .replace(/ı/g, "i").replace(/ş/g, "s").replace(/ğ/g, "g").replace(/ü/g, "u").replace(/ö/g, "o").replace(/ç/g, "c")
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/&amp;|&/g, " ").replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();
}
const toks = (s: string) => fold(s).split(" ").filter(Boolean);

const GENERIC = new Set([
  "hotel", "hotels", "otel", "oteli", "otelleri", "resort", "resorts", "spa", "club", "beach", "family", "golf", "deluxe", "luxury",
  "the", "and", "ve", "by", "all", "inclusive", "ultra", "her", "sey", "dahil", "herseydahil", "collection", "boutique", "butik",
  "suite", "suites", "thalasso", "wellness", "convention", "center", "centre", "kids", "adult", "adults", "only", "concept",
  "a", "de", "la", "le", "of", "hv1", "turkey", "turkiye", "antalya", "mugla", "riviera", "mediterranean", "region", "coast", "hours", "24", "h",
]);

// Bölge eşdeğerlik tablosu: aynı grup içindeki yerler aynı bölge sayılır.
const REGIONS: Record<string, { words: string[]; center: [number, number] }> = {
  side: { words: ["manavgat", "side", "kizilagac", "kizilot", "sorgun", "titreyengol", "colakli", "evrenseki", "kumkoy", "gundogdu", "ilica", "bogazkent"], center: [36.77, 31.42] },
  belek: { words: ["belek", "serik", "kadriye", "iskele"], center: [36.86, 31.06] },
  lara: { words: ["lara", "kundu", "aksu", "muratpasa", "konyaalti"], center: [36.85, 30.85] },
  kemer: { words: ["kemer", "beldibi", "goynuk", "kiris", "camyuva", "tekirova", "cirali", "adrasan"], center: [36.6, 30.56] },
  alanya: { words: ["alanya", "okurcalar", "avsallar", "incekum", "konakli", "mahmutlar", "turkler", "kargicak"], center: [36.55, 32.0] },
  bodrum: { words: ["bodrum", "turgutreis", "yalikavak", "gumbet", "torba", "bitez", "gundogan", "turkbuku", "golturkbuku", "ortakent", "akyarlar", "gumusluk"], center: [37.04, 27.43] },
  marmaris: { words: ["marmaris", "icmeler", "turunc", "hisaronu", "datca"], center: [36.85, 28.27] },
  fethiye: { words: ["fethiye", "oludeniz", "hisaronu", "calis", "gocek", "kas", "kalkan"], center: [36.62, 29.12] },
  kusadasi: { words: ["kusadasi", "selcuk", "didim", "altinkum"], center: [37.86, 27.26] },
  cesme: { words: ["cesme", "alacati", "ilica", "urla"], center: [38.32, 26.3] },
  istanbul: { words: ["istanbul", "beyoglu", "sisli", "besiktas", "fatih", "kadikoy", "taksim", "sultanahmet", "sariyer", "atasehir", "uskudar"], center: [41.03, 28.98] },
};
const LOC_WORDS = new Set([...Object.values(REGIONS).flatMap((r) => r.words), ...PLACE_WORDS]);

function regionsOf(text: string) {
  const t = new Set(toks(text));
  const out = new Set<string>();
  for (const [k, r] of Object.entries(REGIONS)) if (r.words.some((w) => t.has(w))) out.add(k);
  return out;
}

export function distinctive(name: string) {
  // Virgülden sonrası genelde konumdur ("Club Nena, Side").
  const main = String(name ?? "").split(",")[0];
  return new Set(toks(main).filter((w) => !GENERIC.has(w) && !LOC_WORDS.has(w)));
}

function km(a: [number, number], b: [number, number]) {
  const R = 6371, dLat = ((b[0] - a[0]) * Math.PI) / 180, dLng = ((b[1] - a[1]) * Math.PI) / 180;
  const x = Math.sin(dLat / 2) ** 2 + Math.cos((a[0] * Math.PI) / 180) * Math.cos((b[0] * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(x));
}

/** ok · mismatch · unknown */
export function locationCheck(city: string | null, c: Candidate): { status: "ok" | "mismatch" | "unknown"; note: string } {
  const bizR = regionsOf(city ?? "");
  const candR = regionsOf(`${c.name} ${c.location ?? ""}`);
  if (c.gps && bizR.size) {
    const near = Array.from(bizR).some((k) => km(REGIONS[k].center, [c.gps!.lat, c.gps!.lng]) < 30);
    return near ? { status: "ok", note: "konum yakın" } : { status: "mismatch", note: "konum uzak" };
  }
  if (bizR.size && candR.size) {
    const hit = Array.from(candR).some((k) => bizR.has(k));
    return hit ? { status: "ok", note: `konum ${Array.from(candR).join("/")}` } : { status: "mismatch", note: `konum ${Array.from(candR).join("/")}` };
  }
  // İl düzeyi: işletme şehri ilçe olabilir ("Akdeniz" → Mersin); aday konumu ilçe ya da il düzeyinde eşleşmeli.
  const bizP = provincesOf(fold(city ?? ""));
  const candP = provincesOf(fold(c.location ? c.location : c.name));
  if (bizP.size && candP.size) {
    const hit = Array.from(candP).some((p) => bizP.has(p));
    return { status: hit ? "ok" : "mismatch", note: `il ${Array.from(candP).join("/")}` };
  }
  const ct = fold(city ?? "");
  if (ct && fold(`${c.name} ${c.location ?? ""}`).split(" ").includes(ct)) return { status: "ok", note: `konum ${ct}` };
  if (ct && c.location && fold(c.location)) return { status: "mismatch", note: `konum: ${c.location}` };
  return { status: "unknown", note: "konum bilgisi yok" };
}

/** refNames: işletme adı + diğer kaynaklarda yüksek güvenle eşleşen resmi adlar (çapraz doğrulama). */
export function scoreCandidate(refNames: string[], city: string | null, c: Candidate): Scored {
  const C = distinctive(c.name);
  let best: { missing: string[]; extras: string[] } | null = null;
  for (const ref of refNames) {
    const R = distinctive(ref);
    if (!R.size) {
      const eq = fold(ref.split(",")[0]) === fold(c.name.split(",")[0]);
      const r = { missing: eq ? [] : ["tam ad"], extras: [] as string[] };
      if (!best || r.missing.length < best.missing.length) best = r;
      continue;
    }
    const missing = Array.from(R).filter((w) => !C.has(w));
    const extras = Array.from(C).filter((w) => !R.has(w));
    if (!best || missing.length < best.missing.length || (missing.length === best.missing.length && extras.length < best.extras.length)) best = { missing, extras };
  }
  if (!best || best.missing.length) {
    return { cand: c, level: "low", confidence: 0.1, extras: 99, reason: `${c.name}: eksik ayırt edici kelime (${best?.missing.join(", ") ?? "?"})` };
  }
  const loc = locationCheck(city, c);
  if (loc.status === "mismatch") return { cand: c, level: "low", confidence: 0.2, extras: best.extras.length, reason: `${c.name}: ${loc.note} — bölge uyuşmuyor` };
  const ex = best.extras;
  if (ex.length >= 3) return { cand: c, level: "low", confidence: 0.3, extras: ex.length, reason: `${c.name}: fazla ek kelime (${ex.join(", ")})` };
  if (!ex.length && loc.status === "ok") return { cand: c, level: "high", confidence: 0.95, extras: 0, reason: `ad ve ${loc.note} uyuşuyor` };
  const why = [ex.length ? `ek kelime: ${ex.join(", ")}` : "", loc.status === "unknown" ? loc.note : ""].filter(Boolean).join("; ");
  return { cand: c, level: "medium", confidence: ex.length ? 0.6 : 0.7, extras: ex.length, reason: `${c.name}: ${why}` };
}

export function pickBest(refNames: string[], city: string | null, cands: Candidate[]) {
  const scored = cands.map((c) => scoreCandidate(refNames, city, c));
  const rank = { high: 0, medium: 1, low: 2 } as const;
  scored.sort((a, b) => rank[a.level] - rank[b.level] || a.extras - b.extras || b.confidence - a.confidence);
  const top = scored[0];
  if (!top) return { best: null as Scored | null, rejected: [] as Scored[] };
  // Belirsizlik: aynı seviyede farklı iki yüksek aday → onaya düşür.
  const twin = scored.find((s, i) => i > 0 && s.level === "high" && fold(s.cand.name) !== fold(top.cand.name));
  if (top.level === "high" && twin) {
    top.level = "medium"; top.confidence = 0.6; top.reason = `birden çok güçlü aday (${twin.cand.name})`;
  }
  return { best: top.level === "low" ? null : top, rejected: scored.filter((s) => s.level === "low").slice(0, 3) };
}

/** Arama sorgusu varyantları: tam ad, ayırt edici kelimeler. */
export function queryVariants(name: string, city: string | null) {
  const d = Array.from(distinctive(name)).join(" ");
  const base = String(name).split(",")[0].trim();
  return Array.from(new Set([base, d, d && city ? `${d} ${city}` : ""].filter((x) => x && x.length >= 3))).slice(0, 3);
}
