import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const CACHE_HOURS = 6;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return json({ error: "Unauthorized" }, 401);
    }
    const token = authHeader.replace("Bearer ", "");

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
    const force = !!body.force;
    if (!businessId) return json({ error: "business_id gerekli" }, 400);

    const admin = createClient(SUPABASE_URL, SERVICE);

    // Ownership check
    const { data: biz, error: bizErr } = await admin
      .from("businesses")
      .select("id, user_id, name, city, place_id")
      .eq("id", businessId)
      .maybeSingle();
    if (bizErr || !biz) return json({ error: "İşletme bulunamadı" }, 404);
    if (biz.user_id !== userId) return json({ error: "Forbidden" }, 403);

    // Check cache — latest snapshot in last CACHE_HOURS
    const cutoff = new Date(Date.now() - CACHE_HOURS * 3600 * 1000).toISOString();
    if (!force) {
      const { data: latest } = await admin
        .from("ai_visibility_snapshots")
        .select("*")
        .eq("business_id", businessId)
        .gte("created_at", cutoff)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (latest) {
        return json({ cached: true, snapshot: latest, next_available_at: nextAvailable(latest.created_at) });
      }
    }

    if (!biz.name || biz.name.trim().length < 2) {
      return json({ error: "İşletme adı eksik" }, 400);
    }

    // Call internal demo function to run pipeline
    const demoRes = await fetch(`${SUPABASE_URL}/functions/v1/ai-visibility-demo`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${ANON}`,
        apikey: ANON,
      },
      body: JSON.stringify({ businessName: biz.name, location: biz.city || "" }),
    });

    if (!demoRes.ok) {
      const txt = await demoRes.text();
      return json({ error: "Analiz başarısız", detail: txt.slice(0, 500) }, 502);
    }
    const result = await demoRes.json();
    if (result.status === "not_found") {
      return json({ error: result.message || "İşletme Google'da bulunamadı" }, 404);
    }

    const recs = buildRecommendations(result);

    const snapshot = {
      business_id: businessId,
      score: result?.score?.total ?? 0,
      ai_mentioned: !!result?.aiCheck?.mentioned,
      ai_status: result?.aiCheck?.status ?? "unavailable",
      rating: result?.business?.rating ?? null,
      review_count: result?.business?.reviewCount ?? null,
      query: result?.aiCheck?.query ?? null,
      answer_preview: result?.aiCheck?.answerPreview ?? null,
      competitors: result?.competitors ?? [],
      breakdown: result?.score?.breakdown ?? {},
      recommendations: recs,
      business_name: result?.business?.name ?? biz.name,
      business_address: result?.business?.address ?? null,
      sector_label: result?.business?.sector ?? null,
      rating_median: result?.stats?.ratingMedian ?? null,
      review_median: result?.stats?.reviewMedian ?? null,
      mentioned_competitors: result?.aiCheck?.mentionedCompetitors ?? [],
      summary: result?.summary ?? null,
    };

    const { data: inserted, error: insErr } = await admin
      .from("ai_visibility_snapshots")
      .insert(snapshot)
      .select()
      .single();
    if (insErr) {
      console.error("insert snapshot error", insErr);
      return json({ error: "Snapshot kaydedilemedi" }, 500);
    }

    return json({ cached: false, snapshot: inserted, next_available_at: nextAvailable(inserted.created_at) });
  } catch (e) {
    console.error("ai-visibility-check error", e);
    return json({ error: (e as Error).message || "Beklenmeyen hata" }, 500);
  }
});

function json(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function nextAvailable(createdAt: string): string {
  return new Date(new Date(createdAt).getTime() + CACHE_HOURS * 3600 * 1000).toISOString();
}

type Rec = { key: string; priority: "high" | "medium" | "low"; title: string; detail: string };

function buildRecommendations(r: any): Rec[] {
  const recs: Rec[] = [];
  const aiMentioned = !!r?.aiCheck?.mentioned;
  const aiStatus = r?.aiCheck?.status;
  const rating = Number(r?.business?.rating ?? 0);
  const reviews = Number(r?.business?.reviewCount ?? 0);
  const ratingMedian = Number(r?.stats?.ratingMedian ?? 0);
  const reviewMedian = Number(r?.stats?.reviewMedian ?? 0);
  const mentionedComp: string[] = Array.isArray(r?.aiCheck?.mentionedCompetitors)
    ? r.aiCheck.mentionedCompetitors
    : [];

  if (aiStatus === "ok" && !aiMentioned) {
    recs.push({
      key: "ai_absent",
      priority: "high",
      title: "AI asistan sizi listelemedi",
      detail:
        mentionedComp.length > 0
          ? `AI cevabında ${mentionedComp.slice(0, 3).join(", ")} geçti; siz geçmediniz. Google Business Profile açıklamanızı, hizmet/özellik listenizi ve son yorumlarınızı zenginleştirerek AI'ın baktığı sinyalleri güçlendirin.`
          : "AI cevabında adınız geçmedi. GBP açıklaması, kategoriler, öne çıkan özellikler ve düzenli yorum akışı AI'ın baktığı sinyallerdir.",
    });
  }

  if (ratingMedian > 0 && rating > 0 && rating + 0.05 < ratingMedian) {
    recs.push({
      key: "rating_below_median",
      priority: "high",
      title: "Puanınız rakip medyanının altında",
      detail: `Ortalama puanınız ${rating.toFixed(2)}, bölge medyanı ${ratingMedian.toFixed(2)}. Olumsuz yorumlara 48 saat içinde yanıt oranınızı %100'e çıkarın; tekrar eden şikayet başlıklarını operasyonda çözün.`,
    });
  }

  if (reviewMedian > 0 && reviews > 0 && reviews < reviewMedian * 0.7) {
    recs.push({
      key: "reviews_below_median",
      priority: "medium",
      title: "Yorum sayınız rekabetçi değil",
      detail: `Sizde ${reviews}, rakip medyanı ${Math.round(reviewMedian)}. Check-out sonrası QR/SMS ile yorum isteme akışını devreye alın; hedef: haftada +5 yeni yorum.`,
    });
  }

  if (rating >= 4.6 && reviews >= 20) {
    recs.push({
      key: "showcase_positive",
      priority: "low",
      title: "Güçlü yorumlarınızı öne çıkarın",
      detail:
        "Puanınız ve yorum hacminiz güçlü. Story Kit ile 5 yıldızlı yorumlarınızı sosyal medyada paylaşarak sinyali dışa taşıyın.",
    });
  }

  if (aiStatus === "unavailable") {
    recs.push({
      key: "ai_unavailable",
      priority: "low",
      title: "AI ölçümü bu turda alınamadı",
      detail: "AI asistan geçici olarak yanıt vermedi; 6 saat sonra tekrar deneyin. Puan bu turda AI bileşeni hariç normalize edildi.",
    });
  }

  if (recs.length === 0) {
    recs.push({
      key: "maintain",
      priority: "low",
      title: "Görünürlüğünüz sağlıklı",
      detail: "Yorum yanıt oranınızı ve GBP güncelliğini koruyun. Yeni özellik / hizmet eklediğinizde GBP'de güncelleyin.",
    });
  }

  return recs;
}