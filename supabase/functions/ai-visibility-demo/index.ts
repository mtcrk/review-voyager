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

async function placesTextSearch(query: string, apiKey: string) {
  const url =
    "https://maps.googleapis.com/maps/api/place/textsearch/json?query=" +
    encodeURIComponent(query) +
    "&language=tr&region=tr&key=" +
    apiKey;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Google Places arama başarısız: ${res.status}`);
  const data = await res.json();
  if (data.status !== "OK" && data.status !== "ZERO_RESULTS") {
    throw new Error(`Google Places hatası: ${data.status} ${data.error_message || ""}`);
  }
  return data.results || [];
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
    const businessResults = await placesTextSearch(businessQuery, GOOGLE_PLACES_API_KEY);

    if (!businessResults || businessResults.length === 0) {
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

    const biz = businessResults[0];
    const sector = sectorFromTypes(biz.types || []);
    const bizRating: number = typeof biz.rating === "number" ? biz.rating : 0;
    const bizReviews: number =
      typeof biz.user_ratings_total === "number" ? biz.user_ratings_total : 0;

    // ADIM B — Gerçek rakipler
    const compQuery = loc ? `${sector.searchTerm} ${loc}` : `${sector.searchTerm} ${bn}`;
    let competitorsRaw = await placesTextSearch(compQuery, GOOGLE_PLACES_API_KEY);
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

    // ADIM C — Canlı AI sorgusu
    const aiQuery = loc
      ? `${loc} bölgesinde en iyi ${sector.searchTerm} önerir misin? 5-8 isim listele.`
      : `Türkiye'de en iyi ${sector.searchTerm} önerir misin? 5-8 isim listele.`;

    let aiAnswer = "";
    let aiMentioned = false;
    const mentionedCompetitors: string[] = [];

    if (LOVABLE_API_KEY) {
      try {
        const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
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
                  "Sen yerel öneri asistanısın. Kullanıcıya bilgin dahilindeki popüler işletmeleri numaralı liste halinde ver. Uydurma yapma, emin değilsen sadece emin olduklarını listele.",
              },
              { role: "user", content: aiQuery },
            ],
            temperature: 0.3,
          }),
        });
        if (aiRes.ok) {
          const j = await aiRes.json();
          aiAnswer = j.choices?.[0]?.message?.content || "";
          aiMentioned = fuzzyIncludes(aiAnswer, biz.name);
          for (const c of competitors) {
            if (fuzzyIncludes(aiAnswer, c.name)) mentionedCompetitors.push(c.name);
          }
        } else {
          console.error("AI query failed:", aiRes.status, await aiRes.text());
        }
      } catch (e) {
        console.error("AI query error:", e);
      }
    }

    // ADIM D — Deterministik skor
    const compRatings = competitors.map((c) => c.rating).filter((r) => r > 0);
    const compReviews = competitors.map((c) => c.reviewCount).filter((r) => r > 0);
    const ratingMedian = median(compRatings);
    const reviewMedian = median(compReviews);

    const aiPoints = aiMentioned ? 40 : 0;

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
    const total = aiPoints + ratingPoints + reviewPoints + gbpPoints;

    const scoreBreakdown = {
      aiVisibility: { points: aiPoints, max: 40, label: "AI asistanda görünürlük" },
      rating: { points: ratingPoints, max: 25, label: "Rakip medyanına göre puan" },
      reviewVolume: { points: reviewPoints, max: 25, label: "Rakip medyanına göre yorum sayısı" },
      gbpPresence: { points: gbpPoints, max: 10, label: "Google Business Profile varlığı" },
    };

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
        const sumRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
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
        });
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
          model: "google/gemini-2.5-flash",
          mentioned: aiMentioned,
          mentionedCompetitors,
          answerPreview: aiAnswer.slice(0, 600),
        },
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
