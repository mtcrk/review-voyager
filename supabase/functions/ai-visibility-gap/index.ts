import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) return json({ error: "Unauthorized" }, 401);
    const token = authHeader.replace("Bearer ", "");

    const PPLX = Deno.env.get("PERPLEXITY_API_KEY");
    if (!PPLX) return json({ error: "PERPLEXITY_API_KEY yapılandırılmamış" }, 400);

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const ANON = Deno.env.get("SUPABASE_ANON_KEY")!;
    const SERVICE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const userClient = createClient(SUPABASE_URL, ANON, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: claims, error: cErr } = await userClient.auth.getClaims(token);
    if (cErr || !claims?.claims?.sub) return json({ error: "Unauthorized" }, 401);
    const userId = claims.claims.sub as string;

    const body = await req.json().catch(() => ({}));
    const businessId = String(body.business_id || "").trim();
    if (!businessId) return json({ error: "business_id gerekli" }, 400);

    const admin = createClient(SUPABASE_URL, SERVICE);

    const { data: biz, error: bizErr } = await admin
      .from("businesses")
      .select("id, user_id, name, city")
      .eq("id", businessId)
      .maybeSingle();
    if (bizErr || !biz) return json({ error: "İşletme bulunamadı" }, 404);
    if (biz.user_id !== userId) return json({ error: "Forbidden" }, 403);

    const { data: snap } = await admin
      .from("ai_visibility_snapshots")
      .select("business_name, sector_label, mentioned_competitors")
      .eq("business_id", businessId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!snap) return json({ error: "Önce bir AI görünürlük ölçümü yapın." }, 400);

    const name = snap.business_name || biz.name || "";
    const locality = biz.city || "";
    const sector = snap.sector_label || "işletme";
    const compList: string[] = Array.isArray(snap.mentioned_competitors)
      ? (snap.mentioned_competitors as string[]).slice(0, 5)
      : [];
    const competitorsStr = compList.length > 0 ? compList.join(", ") : "bölgedeki öne çıkan rakipler";

    const system =
      "Sen bir çevrimiçi görünürlük analistisin. SADECE web'de bulduğun, kaynak gösterebildiğin bilgileri kullan. Bulamadığın şey hakkında spekülasyon yapma; bulamadıysan not alanında 'web'de bu konuda veri bulamadım' yaz. Cevabını SADECE geçerli JSON olarak ver, başka hiçbir metin, markdown veya kod bloğu işareti ekleme. Şema: {\"present\":[{\"platform\":\"...\",\"note\":\"...\"}],\"weak_or_missing\":[{\"platform\":\"...\",\"note\":\"...\"}],\"competitor_sources\":[{\"source\":\"...\",\"note\":\"...\"}],\"steps\":[{\"title\":\"...\",\"detail\":\"...\"}]}. present=işletmenin web'de var olduğu platformlar, weak_or_missing=yok veya zayıf olduğu yerler, competitor_sources=rakiplerde olup onda olmayan görünürlük kaynakları, steps=en etkili 3 somut adım. Her note/detail 1-2 kısa cümle.";
    const user = `${name} (${locality}) adlı ${sector} işletmesinin çevrimiçi varlığını değerlendir. Şu rakiplerle kıyasla: ${competitorsStr}. TripAdvisor, otel/tatil siteleri, bölgesel blog ve rehberler dahil web taramasına dayanarak şemayı doldur. SADECE JSON döndür.`;

    const ctl = new AbortController();
    const timer = setTimeout(() => ctl.abort(), 20000);
    let resp: Response;
    try {
      resp = await fetch("https://api.perplexity.ai/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${PPLX}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "sonar",
          messages: [
            { role: "system", content: system },
            { role: "user", content: user },
          ],
        }),
        signal: ctl.signal,
      });
    } catch (e) {
      return json({ error: "Perplexity zaman aşımı veya ağ hatası" }, 502);
    } finally {
      clearTimeout(timer);
    }

    if (!resp.ok) {
      const txt = await resp.text();
      if (resp.status === 401 && txt.includes("insufficient_quota")) {
        return json({ error: "Perplexity API kredisi tükendi." }, 402);
      }
      return json({ error: `Perplexity ${resp.status}`, detail: txt.slice(0, 300) }, 502);
    }
    const data = await resp.json();
    const text = data?.choices?.[0]?.message?.content?.trim() || "";
    const rawCitations: string[] = Array.isArray(data?.citations) ? data.citations : [];
    const domains = Array.from(
      new Set(
        rawCitations
          .map((u) => {
            try {
              return new URL(u).hostname.replace(/^www\./, "");
            } catch {
              return null;
            }
          })
          .filter((d): d is string => !!d),
      ),
    );
    if (!text) return json({ error: "Perplexity boş cevap döndürdü" }, 502);

    const generated_at = new Date().toISOString();
    const structured = tryParseStructured(text);
    if (structured) {
      return json({ structured, citations: domains, generated_at });
    }
    return json({ text: stripCitations(text), citations: domains, generated_at });
  } catch (e) {
    console.error("ai-visibility-gap error", e);
    return json({ error: (e as Error).message || "Beklenmeyen hata" }, 500);
  }
});

function json(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function stripCitations(s: string): string {
  return (s || "").replace(/\[\d+\]/g, "");
}

type GapItem = { platform?: string; source?: string; note?: string; title?: string; detail?: string };
type GapStructured = {
  present: { platform: string; note: string }[];
  weak_or_missing: { platform: string; note: string }[];
  competitor_sources: { source: string; note: string }[];
  steps: { title: string; detail: string }[];
};

function tryParseStructured(raw: string): GapStructured | null {
  let s = raw.trim();
  // Strip ```json ... ``` fences if present
  s = s.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
  // Extract first {...} block if extra text surrounds it
  if (!s.startsWith("{")) {
    const m = s.match(/\{[\s\S]*\}/);
    if (m) s = m[0];
  }
  let parsed: Record<string, unknown>;
  try {
    parsed = JSON.parse(s);
  } catch {
    return null;
  }
  const clean = (v: unknown) => (typeof v === "string" ? stripCitations(v).trim() : "");
  const arr = (v: unknown): GapItem[] => (Array.isArray(v) ? (v as GapItem[]) : []);
  const out: GapStructured = {
    present: arr(parsed.present)
      .map((i) => ({ platform: clean(i.platform), note: clean(i.note) }))
      .filter((i) => i.platform),
    weak_or_missing: arr(parsed.weak_or_missing)
      .map((i) => ({ platform: clean(i.platform), note: clean(i.note) }))
      .filter((i) => i.platform),
    competitor_sources: arr(parsed.competitor_sources)
      .map((i) => ({ source: clean(i.source), note: clean(i.note) }))
      .filter((i) => i.source),
    steps: arr(parsed.steps)
      .map((i) => ({ title: clean(i.title), detail: clean(i.detail) }))
      .filter((i) => i.title),
  };
  const total = out.present.length + out.weak_or_missing.length + out.competitor_sources.length + out.steps.length;
  return total > 0 ? out : null;
}