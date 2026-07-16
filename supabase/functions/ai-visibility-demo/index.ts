import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function normalize(s: string): string {
  return (s || "")
    .toLocaleLowerCase("tr")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function fuzzyIncludes(haystack: string, needle: string): boolean {
  const h = normalize(haystack);
  const n = normalize(needle);
  if (!n) return false;
  if (h.includes(n)) return true;
  const tokens = n.split(" ").filter((t) => t.length >= 3);
  if (tokens.length === 0) return false;
  return tokens.every((t) => h.includes(t));
}

function median(nums: number[]): number {
  const arr = nums.filter((n) => typeof n === "number" && !isNaN(n)).sort((a, b) => a - b);
  if (arr.length === 0) return 0;
  const mid = Math.floor(arr.length / 2);
  return arr.length % 2 ? arr[mid] : (arr[mid - 1] + arr[mid]) / 2;
}

function sectorFromTypes(types: string[] = []): { key: string; label: string; searchTerm: string } {
  const t = new Set(types);
  const map: Array<[string, string, string, string]> = [
    ["lodging", "lodging", "Otel", "otel"],
    ["restaurant", "restaurant", "Restoran", "restoran"],
    ["cafe", "cafe", "Kafe", "kafe"],
    ["bar", "bar", "Bar", "bar"],
    ["bakery", "bakery", "Fırın / Pastane", "pastane"],
    ["meal_takeaway", "meal_takeaway", "Paket Servis", "restoran"],
    ["gas_station", "gas_station", "Akaryakıt İstasyonu", "benzin istasyonu"],
    ["hospital", "hospital", "Hastane", "hastane"],
    ["doctor", "doctor", "Doktor / Klinik", "klinik"],
    ["dentist", "dentist", "Diş Hekimi", "diş kliniği"],
    ["pharmacy", "pharmacy", "Eczane", "eczane"],
    ["beauty_salon", "beauty_salon", "Güzellik Salonu", "güzellik salonu"],
    ["hair_care", "hair_care", "Kuaför", "kuaför"],
    ["spa", "spa", "Spa", "spa"],
    ["gym", "gym", "Spor Salonu", "spor salonu"],
    ["car_repair", "car_repair", "Oto Servis", "oto servis"],
    ["car_dealer", "car_dealer", "Oto Galeri", "oto galeri"],
    ["real_estate_agency", "real_estate_agency", "Emlak Ofisi", "emlakçı"],
    ["lawyer", "lawyer", "Avukat", "avukat"],
    ["store", "store", "Mağaza", "mağaza"],
  ];
  for (const [type, key, label, term] of map) {
    if (t.has(type)) return { key, label, searchTerm: term };
  }
  return { key: "business", label: "İşletme", searchTerm: "işletme" };
}

// İsim bazlı sektör override — Places types'tan önce kontrol edilir
function sectorFromName(name: string, types: string[] = []): { key: string; label: string; searchTerm: string } | null {
  const n = normalize(name);
  const t = new Set(types);
  const hay = n + " " + [...t].join(" ");
  const keywordMap: Array<[string[], string, string, string]> = [
    [["bungalov", "bungalow"], "bungalow", "Bungalov", "bungalov"],
    [["glamping"], "glamping", "Glamping", "glamping"],
    [["tatil koyu", "tatil köyü", "holiday village"], "holiday_village", "Tatil Köyü", "tatil köyü"],
    [["suite", "suit", "apart", "aparthotel", "apart hotel", "residence", "rezidans"], "apart_suite", "Apart / Suit Otel", "apart otel"],
    [["butik otel", "boutique hotel"], "boutique_hotel", "Butik Otel", "butik otel"],
    [["resort", "beach hotel", "beach resort"], "resort", "Resort Otel", "resort otel"],
    [["termal"], "thermal", "Termal Otel", "termal otel"],
    [["spa hotel", "spa otel"], "spa_hotel", "Spa Otel", "spa otel"],
    [["hostel"], "hostel", "Hostel", "hostel"],
    [["pansiyon", "guesthouse", "guest house"], "guesthouse", "Pansiyon", "pansiyon"],
    [["villa"], "villa", "Villa", "kiralık villa"],
  ];
  for (const [kws, key, label, term] of keywordMap) {
    if (kws.some((kw) => hay.includes(kw))) return { key, label, searchTerm: term };
  }
  if (t.has("resort_hotel")) return { key: "resort", label: "Resort Otel", searchTerm: "resort otel" };
  return null;
}

// Places formatted_address'ten ilçe+il çıkar (TR odaklı) — fallback
function extractLocality(address: string | null | undefined): string {
  if (!address) return "";
  const clean = address.replace(/\bTürkiye\b|\bTurkey\b/gi, "").trim();
  // "53480 Yeşiltepe/Ardeşen/Rize" gibi slash formatı
  if (clean.includes("/")) {
    const parts = clean.split("/").map((p) => p.trim()).filter(Boolean);
    if (parts.length >= 2) {
      const last = parts[parts.length - 1];
      const prev = parts[parts.length - 2];
      // posta kodu vs. temizle
      const cleanPrev = prev.replace(/\b\d{4,6}\b/g, "").trim();
      return `${cleanPrev}, ${last}`.replace(/^,\s*/, "");
    }
    return parts[parts.length - 1] || "";
  }
  // Virgüllü format: "Mah., Sok. No:108 D:1, İlçe, İl 34000, Türkiye"
  // Sokak adres segmentlerini ele (No:, Blv, Cad, Sok, D:, Mah.)
  const streetRe = /\b(no\s*[:.]?\s*\d|d\s*[:.]?\s*\d|blv|bulvar|cad(desi)?|sok(ak|agi|ağı)?|mah(alle(si)?)?|apt|kat\b)\b/i;
  const parts = clean
    .split(",")
    .map((p) => p.replace(/\b\d{4,6}\b/g, "").trim())
    .filter((p) => p && !streetRe.test(p));
  if (parts.length >= 2) {
    const last = parts[parts.length - 1];
    const prev = parts[parts.length - 2];
    return `${prev}, ${last}`;
  }
  return parts[parts.length - 1] || "";
}

// Google Place Details → address_components'ten ilçe+il
async function fetchLocalityFromDetails(
  placeId: string,
  apiKey: string,
): Promise<string> {
  try {
    const url =
      "https://maps.googleapis.com/maps/api/place/details/json?place_id=" +
      encodeURIComponent(placeId) +
      "&fields=address_components&language=tr&region=tr&key=" +
      apiKey;
    const res = await fetchWithTimeout(url, {}, 8000);
    if (!res.ok) return "";
    const data = await res.json();
    const comps: Array<{ long_name: string; types: string[] }> =
      data?.result?.address_components || [];
    if (!comps.length) return "";
    const find = (t: string) => comps.find((c) => c.types?.includes(t))?.long_name || "";
    const il = find("administrative_area_level_1");
    const ilce =
      find("administrative_area_level_2") ||
      find("locality") ||
      find("sublocality_level_1") ||
      find("sublocality");
    if (ilce && il) return `${ilce}, ${il}`;
    return ilce || il || "";
  } catch (e) {
    console.error("Place details error:", e);
    return "";
  }
}

async function fetchWithTimeout(url: string, init: RequestInit, ms: number): Promise<Response> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), ms);
  try {
    return await fetch(url, { ...init, signal: ctrl.signal });
  } finally {
    clearTimeout(timer);
  }
}

async function placesTextSearch(query: string, apiKey: string) {
  const url =
    "https://maps.googleapis.com/maps/api/place/textsearch/json?query=" +
    encodeURIComponent(query) +
    "&language=tr&region=tr&key=" +
    apiKey;
  const res = await fetchWithTimeout(url, {}, 8000);
  if (!res.ok) throw new Error(`Google Places arama başarısız: ${res.status}`);
  const data = await res.json();
  if (data.status !== "OK" && data.status !== "ZERO_RESULTS") {
    throw new Error(`Google Places hatası: ${data.status} ${data.error_message || ""}`);
  }
  return data.results || [];
}

function nameMatches(inputName: string, foundName: string): boolean {
  const inp = normalize(inputName);
  const found = normalize(foundName);
  if (!inp || !found) return false;
  if (found.includes(inp) || inp.includes(found)) return true;
  const inpTokens = inp.split(" ").filter((t) => t.length >= 3);
  if (inpTokens.length === 0) return false;
  const hits = inpTokens.filter((t) => found.includes(t)).length;
  return hits / inpTokens.length >= 0.6;
}

// ============ Multi-engine AI runner ============

type EngineName = "gemini" | "chatgpt" | "perplexity";
type EngineStatus = "ok" | "unavailable" | "not_configured";

interface EngineResult {
  engine: EngineName;
  status: EngineStatus;
  mentioned: boolean;
  mentionedCompetitors: string[];
  answerPreview: string;
  citations?: string[];
  grounded?: boolean;
  error?: string;
}

const AI_SYSTEM_PROMPT =
  "Sen yerel öneri asistanısın. Kullanıcıya bilgin dahilindeki popüler işletmeleri numaralı liste halinde ver. Uydurma yapma, emin değilsen sadece emin olduklarını listele.";

function extractMentions(
  answer: string,
  businessName: string,
  competitors: Array<{ name: string }>,
): { mentioned: boolean; mentionedCompetitors: string[] } {
  const mentioned = fuzzyIncludes(answer, businessName);
  const mentionedCompetitors: string[] = [];
  for (const c of competitors) {
    if (fuzzyIncludes(answer, c.name)) mentionedCompetitors.push(c.name);
  }
  return { mentioned, mentionedCompetitors };
}

function domainFromUrl(u: string): string {
  try {
    const url = new URL(u);
    return url.hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

async function runGemini(
  query: string,
  key: string,
  businessName: string,
  competitors: Array<{ name: string }>,
): Promise<EngineResult> {
  try {
    const res = await fetchWithTimeout("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: AI_SYSTEM_PROMPT },
          { role: "user", content: query },
        ],
        temperature: 0.3,
      }),
    }, 15000);
    if (!res.ok) {
      const t = await res.text();
      console.error("gemini failed", res.status, t.slice(0, 200));
      return { engine: "gemini", status: "unavailable", mentioned: false, mentionedCompetitors: [], answerPreview: "" };
    }
    const j = await res.json();
    const answer: string = j.choices?.[0]?.message?.content || "";
    const { mentioned, mentionedCompetitors } = extractMentions(answer, businessName, competitors);
    return {
      engine: "gemini",
      status: "ok",
      mentioned,
      mentionedCompetitors,
      answerPreview: answer.slice(0, 600),
    };
  } catch (e) {
    console.error("gemini error", e);
    return { engine: "gemini", status: "unavailable", mentioned: false, mentionedCompetitors: [], answerPreview: "" };
  }
}

async function runChatGPT(
  query: string,
  key: string,
  businessName: string,
  competitors: Array<{ name: string }>,
): Promise<EngineResult> {
  // First try Responses API with web_search tool
  try {
    const res = await fetchWithTimeout("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        input: query,
        instructions: AI_SYSTEM_PROMPT,
        tools: [{ type: "web_search" }],
      }),
    }, 15000);
    if (res.ok) {
      const j = await res.json();
      let answer: string = j.output_text || "";
      if (!answer && Array.isArray(j.output)) {
        // Fallback: walk output array
        for (const item of j.output) {
          const parts = item?.content;
          if (Array.isArray(parts)) {
            for (const p of parts) {
              if (typeof p?.text === "string") answer += p.text;
            }
          }
        }
      }
      const { mentioned, mentionedCompetitors } = extractMentions(answer, businessName, competitors);
      return {
        engine: "chatgpt",
        status: "ok",
        mentioned,
        mentionedCompetitors,
        answerPreview: answer.slice(0, 600),
        grounded: true,
      };
    }
    const errText = await res.text();
    console.error("chatgpt responses failed", res.status, errText.slice(0, 200));
  } catch (e) {
    console.error("chatgpt responses error", e);
  }

  // Fallback: chat.completions (no web search)
  try {
    const res = await fetchWithTimeout("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: AI_SYSTEM_PROMPT },
          { role: "user", content: query },
        ],
        temperature: 0.3,
      }),
    }, 15000);
    if (!res.ok) {
      const t = await res.text();
      console.error("chatgpt chat.completions failed", res.status, t.slice(0, 200));
      return { engine: "chatgpt", status: "unavailable", mentioned: false, mentionedCompetitors: [], answerPreview: "" };
    }
    const j = await res.json();
    const answer: string = j.choices?.[0]?.message?.content || "";
    const { mentioned, mentionedCompetitors } = extractMentions(answer, businessName, competitors);
    return {
      engine: "chatgpt",
      status: "ok",
      mentioned,
      mentionedCompetitors,
      answerPreview: answer.slice(0, 600),
      grounded: false,
    };
  } catch (e) {
    console.error("chatgpt chat error", e);
    return { engine: "chatgpt", status: "unavailable", mentioned: false, mentionedCompetitors: [], answerPreview: "" };
  }
}

async function runPerplexity(
  query: string,
  key: string,
  businessName: string,
  competitors: Array<{ name: string }>,
): Promise<EngineResult> {
  try {
    const res = await fetchWithTimeout("https://api.perplexity.ai/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "sonar",
        messages: [
          { role: "system", content: AI_SYSTEM_PROMPT },
          { role: "user", content: query },
        ],
        temperature: 0.3,
      }),
    }, 15000);
    if (!res.ok) {
      const t = await res.text();
      console.error("perplexity failed", res.status, t.slice(0, 200));
      return { engine: "perplexity", status: "unavailable", mentioned: false, mentionedCompetitors: [], answerPreview: "" };
    }
    const j = await res.json();
    const answer: string = j.choices?.[0]?.message?.content || "";
    const rawCitations: string[] = Array.isArray(j.citations) ? j.citations : [];
    const citations = Array.from(
      new Set(rawCitations.map(domainFromUrl).filter(Boolean)),
    ).slice(0, 5);
    const { mentioned, mentionedCompetitors } = extractMentions(answer, businessName, competitors);
    return {
      engine: "perplexity",
      status: "ok",
      mentioned,
      mentionedCompetitors,
      answerPreview: answer.slice(0, 600),
      citations,
      grounded: true,
    };
  } catch (e) {
    console.error("perplexity error", e);
    return { engine: "perplexity", status: "unavailable", mentioned: false, mentionedCompetitors: [], answerPreview: "" };
  }
}

async function runEngines(opts: {
  query: string;
  businessName: string;
  competitors: Array<{ name: string }>;
  lovableKey?: string;
  openaiKey?: string;
  perplexityKey?: string;
}): Promise<EngineResult[]> {
  const tasks: Array<Promise<EngineResult>> = [];

  tasks.push(
    opts.lovableKey
      ? runGemini(opts.query, opts.lovableKey, opts.businessName, opts.competitors)
      : Promise.resolve<EngineResult>({
          engine: "gemini",
          status: "not_configured",
          mentioned: false,
          mentionedCompetitors: [],
          answerPreview: "",
        }),
  );

  tasks.push(
    opts.openaiKey
      ? runChatGPT(opts.query, opts.openaiKey, opts.businessName, opts.competitors)
      : Promise.resolve<EngineResult>({
          engine: "chatgpt",
          status: "not_configured",
          mentioned: false,
          mentionedCompetitors: [],
          answerPreview: "",
        }),
  );

  tasks.push(
    opts.perplexityKey
      ? runPerplexity(opts.query, opts.perplexityKey, opts.businessName, opts.competitors)
      : Promise.resolve<EngineResult>({
          engine: "perplexity",
          status: "not_configured",
          mentioned: false,
          mentionedCompetitors: [],
          answerPreview: "",
        }),
  );

  const settled = await Promise.allSettled(tasks);
  const fallbacks: EngineName[] = ["gemini", "chatgpt", "perplexity"];
  return settled.map((r, i) =>
    r.status === "fulfilled"
      ? r.value
      : {
          engine: fallbacks[i],
          status: "unavailable" as const,
          mentioned: false,
          mentionedCompetitors: [],
          answerPreview: "",
        },
  );
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { businessName, location } = await req.json();

    if (!businessName || String(businessName).trim().length < 2) {
      return new Response(
        JSON.stringify({ error: "İşletme adı gerekli" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const GOOGLE_PLACES_API_KEY = Deno.env.get("GOOGLE_PLACES_API_KEY");

    if (!GOOGLE_PLACES_API_KEY) {
      return new Response(
        JSON.stringify({
          error:
            "GOOGLE_PLACES_API_KEY yapılandırılmamış. Bu ölçüm gerçek Google verisi olmadan yapılamaz.",
        }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const bn = String(businessName).trim();
    const loc = location ? String(location).trim() : "";

    // ADIM A — Google'da işletmeyi bul
    const businessQuery = loc ? `${bn} ${loc}` : bn;
    let businessResults: any[] = [];
    try {
      businessResults = await placesTextSearch(businessQuery, GOOGLE_PLACES_API_KEY);
    } catch (e) {
      console.error("Places search error:", e);
      return new Response(
        JSON.stringify({
          error:
            "Google'a şu an ulaşılamıyor. Lütfen birkaç saniye sonra tekrar deneyin.",
        }),
        { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Sıkı isim eşleşmesi — yanlış işletme dönerse not_found
    const firstMatch = businessResults.find((r: any) => nameMatches(bn, r.name || ""));

    if (!businessResults || businessResults.length === 0 || !firstMatch) {
      return new Response(
        JSON.stringify({
          status: "not_found",
          message:
            "Google'da bu işletmeyi bulamadık. Google Business Profile eksik olabilir veya isim/konum farklı yazılıyor olabilir.",
          businessName: bn,
          location: loc || null,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const biz = firstMatch;
    const sector = sectorFromName(biz.name || bn, biz.types || []) || sectorFromTypes(biz.types || []);
    const detailsLocality = biz.place_id
      ? await fetchLocalityFromDetails(biz.place_id, GOOGLE_PLACES_API_KEY)
      : "";
    const derivedLocality =
      detailsLocality || extractLocality(biz.formatted_address) || loc;
    const bizRating: number = typeof biz.rating === "number" ? biz.rating : 0;
    const bizReviews: number =
      typeof biz.user_ratings_total === "number" ? biz.user_ratings_total : 0;

    // ADIM B — Gerçek rakipler
    const compQuery = derivedLocality
      ? `${sector.searchTerm} ${derivedLocality}`
      : `${sector.searchTerm} ${bn}`;
    let competitorsRaw: any[] = [];
    try {
      competitorsRaw = await placesTextSearch(compQuery, GOOGLE_PLACES_API_KEY);
    } catch (e) {
      console.error("Competitor search failed:", e);
      competitorsRaw = [];
    }
    competitorsRaw = competitorsRaw.filter(
      (c: any) => c.place_id !== biz.place_id && normalize(c.name) !== normalize(biz.name)
    );

    const competitors = competitorsRaw
      .filter((c: any) => typeof c.rating === "number" && typeof c.user_ratings_total === "number")
      .sort(
        (a: any, b: any) =>
          (b.rating || 0) * Math.log10((b.user_ratings_total || 1) + 1) -
          (a.rating || 0) * Math.log10((a.user_ratings_total || 1) + 1)
      )
      .slice(0, 5)
      .map((c: any) => ({
        name: c.name,
        rating: c.rating,
        reviewCount: c.user_ratings_total,
        address: c.formatted_address || null,
      }));

    // ADIM C — Canlı AI sorgusu (multi-engine)
    const aiQuery = derivedLocality
      ? `${derivedLocality} bölgesinde en iyi ${sector.searchTerm} önerir misin? 5-8 isim listele.`
      : `Türkiye'de en iyi ${sector.searchTerm} önerir misin? 5-8 isim listele.`;

    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    const PERPLEXITY_API_KEY = Deno.env.get("PERPLEXITY_API_KEY");

    const aiChecks = await runEngines({
      query: aiQuery,
      businessName: biz.name,
      competitors,
      lovableKey: LOVABLE_API_KEY,
      openaiKey: OPENAI_API_KEY,
      perplexityKey: PERPLEXITY_API_KEY,
    });

    const measured = aiChecks.filter((c) => c.status === "ok");
    const measuredCount = measured.length;
    const mentionedCount = measured.filter((c) => c.mentioned).length;
    const aiMentioned = mentionedCount > 0;
    const aiUnavailable = measuredCount === 0;

    // Backwards-compat aggregate
    const aggregatedAnswer = measured.map((c) => c.answerPreview).filter(Boolean).join("\n---\n");
    const mentionedCompetitors = Array.from(
      new Set(measured.flatMap((c) => c.mentionedCompetitors || [])),
    );

    // ADIM D — Deterministik skor
    const compRatings = competitors.map((c) => c.rating).filter((r) => r > 0);
    const compReviews = competitors.map((c) => c.reviewCount).filter((r) => r > 0);
    const ratingMedian = median(compRatings);
    const reviewMedian = median(compReviews);

    const aiPoints = measuredCount > 0 ? Math.round(40 * (mentionedCount / measuredCount)) : 0;

    let ratingPoints = 0;
    if (ratingMedian > 0 && bizRating > 0) {
      const diff = bizRating - ratingMedian;
      ratingPoints = Math.max(0, Math.min(25, Math.round(12.5 + diff * 25)));
    } else if (bizRating > 0) {
      ratingPoints = Math.round((bizRating / 5) * 25);
    }

    let reviewPoints = 0;
    if (reviewMedian > 0 && bizReviews > 0) {
      const ratio = Math.log10(bizReviews + 1) / Math.log10(reviewMedian + 1);
      reviewPoints = Math.max(0, Math.min(25, Math.round(ratio * 12.5)));
    } else if (bizReviews > 0) {
      reviewPoints = Math.min(25, Math.round(Math.log10(bizReviews + 1) * 8));
    }

    const gbpPoints = 10;

    let total: number;
    let scoreBreakdown: Record<string, { points: number; max: number; label: string }>;
    if (aiUnavailable) {
      // AI ölçülemedi — kalan bileşenleri 100'e normalize et (25+25+10 = 60 max)
      const rawSum = ratingPoints + reviewPoints + gbpPoints;
      total = Math.round((rawSum / 60) * 100);
      scoreBreakdown = {
        rating: { points: ratingPoints, max: 25, label: "Rakip medyanına göre puan" },
        reviewVolume: { points: reviewPoints, max: 25, label: "Rakip medyanına göre yorum sayısı" },
        gbpPresence: { points: gbpPoints, max: 10, label: "Google Business Profile varlığı" },
      };
    } else {
      total = aiPoints + ratingPoints + reviewPoints + gbpPoints;
      scoreBreakdown = {
        aiVisibility: { points: aiPoints, max: 40, label: "AI asistanda görünürlük" },
        rating: { points: ratingPoints, max: 25, label: "Rakip medyanına göre puan" },
        reviewVolume: { points: reviewPoints, max: 25, label: "Rakip medyanına göre yorum sayısı" },
        gbpPresence: { points: gbpPoints, max: 10, label: "Google Business Profile varlığı" },
      };
    }

    // ADIM E — Kısa özet ve öneriler (sadece gerçek veriye dayalı)
    let summary = "";
    let improvements: string[] = [];

    if (LOVABLE_API_KEY) {
      try {
        const factPayload = {
          business: {
            name: biz.name,
            rating: bizRating,
            reviewCount: bizReviews,
            sector: sector.label,
            address: biz.formatted_address || null,
          },
          competitors,
          ratingMedian,
          reviewMedian,
          aiMentioned,
          mentionedCompetitors,
          score: total,
        };
        const sumRes = await fetchWithTimeout("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${LOVABLE_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "google/gemini-2.5-flash",
            messages: [
              {
                role: "system",
                content:
                  'Sen görünürlük analistisin. SADECE sana verilen verilere dayan; HİÇBİR sayı, isim veya rakip UYDURMA. JSON dön: {"summary": "2-3 cümle Türkçe özet", "improvements": ["3-5 somut, veriye dayalı öneri"]}. Sadece JSON, başka metin yok.',
              },
              { role: "user", content: JSON.stringify(factPayload) },
            ],
            temperature: 0.2,
          }),
        }, 15000);
        if (sumRes.ok) {
          const j = await sumRes.json();
          const content = j.choices?.[0]?.message?.content || "";
          const m = content.match(/\{[\s\S]*\}/);
          if (m) {
            const parsed = JSON.parse(m[0]);
            summary = String(parsed.summary || "");
            improvements = Array.isArray(parsed.improvements)
              ? parsed.improvements.map(String)
              : [];
          }
        }
      } catch (e) {
        console.error("Summary LLM error:", e);
      }
    }

    if (!summary) {
      summary = aiMentioned
        ? `${biz.name}, AI asistanın ${sector.label.toLowerCase()} önerileri arasında yer aldı.`
        : `${biz.name}, AI asistanın ${sector.label.toLowerCase()} önerileri arasında yer almadı.`;
    }
    if (improvements.length === 0) {
      improvements = [
        !aiMentioned
          ? "AI asistanlarda görünmüyorsunuz; içerik ve GBP açıklamalarınızı zenginleştirin."
          : "AI görünürlüğünüz iyi; düzenli yorum yönetimi ile bunu koruyun.",
        reviewMedian > bizReviews
          ? "Rakiplerinizden daha az yorumunuz var; müşterilerden yorum toplama akışı kurun."
          : "Yorum sayınız rekabetçi; ivmeyi kaybetmeyin.",
        ratingMedian > bizRating
          ? "Puanınız rakip medyanının altında; olumsuz yorumlara yanıt oranınızı artırın."
          : "Puanınız rekabetçi; olumlu yorumları öne çıkarın.",
      ];
    }

    return new Response(
      JSON.stringify({
        status: "ok",
        business: {
          name: biz.name,
          rating: bizRating,
          reviewCount: bizReviews,
          address: biz.formatted_address || null,
          sector: sector.label,
          placeId: biz.place_id,
        },
        aiCheck: {
          query: aiQuery,
          model: "multi-engine",
          status: aiUnavailable ? "unavailable" : "ok",
          mentioned: aiMentioned,
          mentionedCompetitors,
          answerPreview: aggregatedAnswer.slice(0, 600),
        },
        aiChecks,
        aggregate: { measuredCount, mentionedCount },
        competitors,
        stats: { ratingMedian, reviewMedian },
        score: { total, breakdown: scoreBreakdown },
        summary,
        improvements,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("ai-visibility-demo error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Beklenmeyen bir hata oluştu" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
