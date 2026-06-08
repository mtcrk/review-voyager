import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const esc = (s: string) =>
  (s || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const SEGMENT_LABEL: Record<string, string> = {
  luxury: "Lüks",
  upscale: "Üst",
  boutique: "Butik",
  midscale: "Orta",
  budget: "Ekonomik",
  bnb: "B&B",
  hostel: "Hostel",
  apart: "Apart",
};

function median(values: number[]) {
  if (!values.length) return null;
  const s = [...values].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}
const hoursBetween = (a: string, b: string) => (new Date(b).getTime() - new Date(a).getTime()) / 3_600_000;
const fmtHours = (h: number | null) => (h == null ? "—" : h < 1 ? "<1 sa" : h < 48 ? `${Math.round(h)} sa` : `${Math.round(h / 24)} gün`);

async function buildBrief(admin: any, businessId: string) {
  const since = new Date(Date.now() - 7 * 86400_000).toISOString();
  const sincePrev = new Date(Date.now() - 14 * 86400_000).toISOString();

  const [{ data: biz }, { data: comps }, { data: ownReviews }, { data: topics }] = await Promise.all([
    admin.from("businesses").select("id,name,star_rating,segment,price_tier,price_estimate_eur,user_id").eq("id", businessId).maybeSingle(),
    admin.from("ci_competitors").select("id,name,rating,star_rating,segment,price_tier,price_estimate_eur").eq("business_id", businessId).eq("status", "confirmed"),
    admin.from("reviews").select("rating,status,approved_reply,posted_at,replied_at").eq("business_id", businessId).gte("posted_at", sincePrev),
    admin.from("ci_topics").select("id,display_name,applies_to_verticals"),
  ]);
  if (!biz || !comps || comps.length === 0) return null;

  const compIds = comps.map((c: any) => c.id);
  const [{ data: compReviews }, { data: topicRows }] = await Promise.all([
    admin.from("ci_competitor_reviews").select("competitor_id,rating,posted_at,owner_reply_text,owner_reply_at").in("competitor_id", compIds).gte("posted_at", sincePrev),
    admin.from("ci_review_topics").select("topic_id,review_source,sentiment").eq("business_id", businessId).gte("review_posted_at", sincePrev),
  ]);

  const hotelTopics = ((topics ?? []) as any[]).filter((t) => Array.isArray(t.applies_to_verticals) && t.applies_to_verticals.includes("hotel"));
  const topicMap = new Map(hotelTopics.map((t) => [t.id, t]));

  // ----- Pricing card -----
  const recentOwn = (ownReviews ?? []).filter((r: any) => r.posted_at >= since);
  const ownRatings = recentOwn.map((r: any) => r.rating).filter((n: any) => n != null);
  const ownAvg = ownRatings.length ? ownRatings.reduce((a: number, b: number) => a + b, 0) / ownRatings.length : null;

  const peers = (comps as any[]).filter((c) => {
    if (biz.segment && c.segment) return c.segment === biz.segment;
    if (biz.star_rating != null && c.star_rating != null) return Math.abs(Number(biz.star_rating) - Number(c.star_rating)) < 0.6;
    return true;
  });
  const peerSet = peers.length > 0 ? peers : (comps as any[]);
  const peerRatings = peerSet.map((c: any) => c.rating).filter((n: any) => n != null);
  const peerAvg = peerRatings.length ? peerRatings.reduce((a: number, b: number) => a + b, 0) / peerRatings.length : null;
  const peerPriceEur = (() => {
    const a = peerSet.map((c: any) => c.price_estimate_eur).filter((n: any) => n != null);
    return a.length ? a.reduce((x: number, y: number) => Number(x) + Number(y), 0) / a.length : null;
  })();
  const ownPriceEur = biz.price_estimate_eur != null ? Number(biz.price_estimate_eur) : null;

  let pricingMsg = "Daha fazla veri toplandığında öneri görünecek.";
  if (ownAvg != null && peerAvg != null) {
    if (ownAvg >= peerAvg + 0.2 && (ownPriceEur == null || peerPriceEur == null || ownPriceEur <= peerPriceEur)) {
      pricingMsg = `Puanınız emsalin ${(ownAvg - peerAvg).toFixed(1)} üzerinde — fiyatı %5-10 artırma fırsatı var.`;
    } else if (ownAvg <= peerAvg - 0.2) {
      pricingMsg = "Puan emsalin altında. Fiyatı sabit tutun, önce operasyonel sorunları çözün.";
    } else if (ownPriceEur != null && peerPriceEur != null && ownPriceEur > peerPriceEur * 1.1) {
      pricingMsg = "Puan emsalle eşit ama fiyatınız yüksek. Erken rezervasyon paketi düşünün.";
    } else {
      pricingMsg = "Pozisyonunuz dengeli — volume artırma kampanyaları deneyebilirsiniz.";
    }
  }

  // ----- Operational priorities -----
  const ownTopic = new Map<string, { neg: number; pos: number }>();
  const compTopic = new Map<string, { neg: number; pos: number; sentSum: number; total: number }>();
  for (const r of (topicRows ?? []) as any[]) {
    const target = r.review_source === "own" ? ownTopic : compTopic;
    const e = target.get(r.topic_id) ?? ({ neg: 0, pos: 0, sentSum: 0, total: 0 } as any);
    e.total = (e.total ?? 0) + 1;
    e.sentSum = (e.sentSum ?? 0) + Number(r.sentiment);
    if (Number(r.sentiment) <= -0.2) e.neg += 1;
    else if (Number(r.sentiment) >= 0.2) e.pos += 1;
    target.set(r.topic_id, e);
  }
  const ops = hotelTopics
    .map((t) => {
      const o = ownTopic.get(t.id) ?? { neg: 0, pos: 0 };
      const c: any = compTopic.get(t.id) ?? { neg: 0, pos: 0, sentSum: 0, total: 0 };
      const compAvg = c.total > 0 ? c.sentSum / c.total : 0;
      let p = o.neg * 2 + c.neg - o.pos * 0.5;
      if (compAvg > 0.1 && o.neg > 0) p *= 1.5;
      return { t, ownNeg: o.neg, compNeg: c.neg, compAvg, priority: p };
    })
    .filter((x) => x.priority > 0)
    .sort((a, b) => b.priority - a.priority)
    .slice(0, 3);

  // ----- Reply benchmark -----
  const ownTotal = recentOwn.length;
  const ownReplied = recentOwn.filter((r: any) => r.approved_reply || r.status === "replied");
  const ownReplyRate = ownTotal > 0 ? Math.round((ownReplied.length / ownTotal) * 100) : 0;
  const ownMedian = median(
    ownReplied.filter((r: any) => r.posted_at && r.replied_at).map((r: any) => hoursBetween(r.posted_at, r.replied_at)),
  );
  const recentComp = ((compReviews ?? []) as any[]).filter((r) => r.posted_at >= since);
  const compTotalCount = recentComp.length;
  const compRepliedRows = recentComp.filter((r) => r.owner_reply_text);
  const compReplyRate = compTotalCount > 0 ? Math.round((compRepliedRows.length / compTotalCount) * 100) : null;
  const compMedian = median(
    compRepliedRows.filter((r) => r.posted_at && r.owner_reply_at).map((r) => hoursBetween(r.posted_at, r.owner_reply_at)),
  );

  // ----- Week-over-week deltas -----
  const prevOwn = (ownReviews ?? []).filter((r: any) => r.posted_at < since && r.posted_at >= sincePrev);
  const prevAvg = (() => {
    const a = prevOwn.map((r: any) => r.rating).filter((n: any) => n != null);
    return a.length ? a.reduce((x: number, y: number) => x + y, 0) / a.length : null;
  })();
  const volNow = recentOwn.length;
  const volPrev = prevOwn.length;

  return {
    biz,
    ownAvg,
    peerAvg,
    peerCount: peerSet.length,
    pricingMsg,
    ownPriceEur,
    peerPriceEur,
    ops,
    ownReplyRate,
    compReplyRate,
    ownMedian,
    compMedian,
    prevAvg,
    volNow,
    volPrev,
    topicMap,
  };
}

function renderHtml(data: any, dashboardUrl: string) {
  const {
    biz, ownAvg, peerAvg, peerCount, pricingMsg, ownPriceEur, peerPriceEur,
    ops, ownReplyRate, compReplyRate, ownMedian, compMedian, prevAvg, volNow, volPrev, topicMap,
  } = data;

  const ratingDelta = ownAvg != null && prevAvg != null ? ownAvg - prevAvg : null;
  const volDelta = volNow - volPrev;

  const topicLine = (t: any) => t.display_name?.tr ?? t.display_name?.en ?? t.id;

  const opsBlock = ops.length === 0
    ? `<p style="color:#6b7280;font-size:13px;margin:0;">Bu hafta belirgin operasyonel öncelik çıkmadı. 👍</p>`
    : ops.map((o: any, i: number) => `
        <div style="display:flex;gap:10px;padding:10px 0;border-bottom:1px solid #f0f0f0;">
          <div style="flex-shrink:0;height:24px;width:24px;border-radius:50%;background:#ede9fe;color:#7A5AF8;font-weight:600;font-size:12px;display:inline-block;text-align:center;line-height:24px;">${i + 1}</div>
          <div>
            <div style="font-weight:600;color:#1a1a2e;font-size:14px;">${esc(topicLine(o.t))}</div>
            <div style="color:#6b7280;font-size:12px;margin-top:2px;">
              ${o.ownNeg > 0 ? `Sizde ${o.ownNeg} şikayet` : ""}${o.ownNeg > 0 && o.compNeg > 0 ? " · " : ""}${o.compNeg > 0 ? `rakipte ${o.compNeg}` : ""}${o.compAvg > 0.1 ? " · rakip bu konuda iyi" : ""}
            </div>
          </div>
        </div>
      `).join("");

  const ratingDeltaStr = ratingDelta == null ? "—" : `${ratingDelta >= 0 ? "▲" : "▼"} ${Math.abs(ratingDelta).toFixed(2)}`;
  const ratingDeltaColor = ratingDelta == null ? "#6b7280" : ratingDelta >= 0 ? "#10b981" : "#ef4444";
  const volDeltaColor = volDelta >= 0 ? "#10b981" : "#ef4444";

  return `<!DOCTYPE html><html><head><meta charset="utf-8"></head>
<body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#f5f5f7;margin:0;padding:0;">
  <div style="max-width:600px;margin:40px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.06);">
    <div style="background:linear-gradient(135deg,#7A5AF8,#635BFF);padding:28px 32px;">
      <h1 style="color:#fff;font-size:22px;margin:0;font-weight:600;">Haftalık Rakip Briefiniz</h1>
      <p style="color:rgba(255,255,255,0.85);font-size:14px;margin:6px 0 0;">${esc(biz.name)} · ${peerCount} emsal rakiple kıyas</p>
    </div>
    <div style="padding:28px 32px;">
      <div style="display:flex;gap:12px;margin-bottom:24px;">
        <div style="flex:1;background:#f8f9fb;border-radius:12px;padding:14px;text-align:center;">
          <div style="font-size:22px;font-weight:700;color:#1a1a2e;">${ownAvg != null ? ownAvg.toFixed(2) : "—"}</div>
          <div style="font-size:11px;color:${ratingDeltaColor};margin-top:2px;">${ratingDeltaStr} geçen haftaya göre</div>
          <div style="font-size:11px;color:#6b7280;margin-top:4px;">Puanınız</div>
        </div>
        <div style="flex:1;background:#f8f9fb;border-radius:12px;padding:14px;text-align:center;">
          <div style="font-size:22px;font-weight:700;color:#1a1a2e;">${peerAvg != null ? peerAvg.toFixed(2) : "—"}</div>
          <div style="font-size:11px;color:#6b7280;margin-top:2px;">Emsal puan</div>
          <div style="font-size:11px;color:#6b7280;margin-top:4px;">&nbsp;</div>
        </div>
        <div style="flex:1;background:#f8f9fb;border-radius:12px;padding:14px;text-align:center;">
          <div style="font-size:22px;font-weight:700;color:#1a1a2e;">${volNow}</div>
          <div style="font-size:11px;color:${volDeltaColor};margin-top:2px;">${volDelta >= 0 ? "+" : ""}${volDelta} geçen haftaya göre</div>
          <div style="font-size:11px;color:#6b7280;margin-top:4px;">Yeni yorum</div>
        </div>
      </div>

      <h2 style="font-size:14px;color:#7A5AF8;text-transform:uppercase;letter-spacing:0.5px;margin:24px 0 10px;">Fiyat & Pozisyon</h2>
      <div style="background:#faf9ff;border-left:3px solid #7A5AF8;border-radius:6px;padding:14px 16px;">
        <p style="color:#1a1a2e;font-size:14px;margin:0 0 6px;font-weight:600;">${esc(pricingMsg)}</p>
        ${ownPriceEur != null || peerPriceEur != null ? `<p style="color:#6b7280;font-size:12px;margin:0;">Fiyat: ${ownPriceEur != null ? "€" + Math.round(ownPriceEur) : "—"} / emsal ${peerPriceEur != null ? "€" + Math.round(peerPriceEur) : "—"}</p>` : ""}
      </div>

      <h2 style="font-size:14px;color:#7A5AF8;text-transform:uppercase;letter-spacing:0.5px;margin:24px 0 4px;">Bu Hafta Önceliğin</h2>
      ${opsBlock}

      <h2 style="font-size:14px;color:#7A5AF8;text-transform:uppercase;letter-spacing:0.5px;margin:24px 0 10px;">Yanıt Performansı</h2>
      <table style="width:100%;border-collapse:collapse;font-size:14px;">
        <tr style="border-bottom:1px solid #f0f0f0;">
          <td style="padding:10px 0;color:#6b7280;">Yanıt oranı</td>
          <td style="padding:10px 0;text-align:right;color:#1a1a2e;font-weight:600;">${ownReplyRate}% <span style="color:#9ca3af;font-weight:400;">/ ${compReplyRate != null ? compReplyRate + "%" : "—"}</span></td>
        </tr>
        <tr>
          <td style="padding:10px 0;color:#6b7280;">Medyan yanıt süresi</td>
          <td style="padding:10px 0;text-align:right;color:#1a1a2e;font-weight:600;">${fmtHours(ownMedian)} <span style="color:#9ca3af;font-weight:400;">/ ${fmtHours(compMedian)}</span></td>
        </tr>
      </table>

      <div style="text-align:center;margin:32px 0 8px;">
        <a href="${dashboardUrl}" style="display:inline-block;background:#7A5AF8;color:#fff;text-decoration:none;padding:14px 32px;border-radius:10px;font-weight:600;font-size:15px;">Panele Git →</a>
      </div>
    </div>
    <div style="padding:20px 32px;text-align:center;color:#9ca3af;font-size:12px;border-top:1px solid #f0f0f0;">
      VoyageRespond · Haftalık Rakip Briefi<br>
      Bu e-postayı almak istemiyorsanız Ayarlar → Bildirimler'den kapatabilirsiniz.
    </div>
  </div>
</body></html>`;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const resendKey = Deno.env.get("RESEND_API_KEY");
    const admin = createClient(supabaseUrl, serviceKey);

    let target: { business_id?: string; test_email?: string } = {};
    try { target = await req.json(); } catch {}

    // Get all businesses with at least 1 confirmed competitor
    let businessIds: string[] = [];
    if (target.business_id) {
      businessIds = [target.business_id];
    } else {
      const { data: rows } = await admin
        .from("ci_competitors")
        .select("business_id")
        .eq("status", "confirmed");
      businessIds = Array.from(new Set(((rows ?? []) as any[]).map((r) => r.business_id)));
    }

    const dashboardUrl = "https://voyagerespond.com/intelligence/comparison";
    let sent = 0;
    const results: any[] = [];

    for (const bid of businessIds) {
      const data = await buildBrief(admin, bid);
      if (!data) {
        results.push({ business_id: bid, skipped: "no_data" });
        continue;
      }
      const html = renderHtml(data, dashboardUrl);

      // Resolve recipient email
      let email: string | null = target.test_email ?? null;
      if (!email && data.biz.user_id) {
        const { data: userRes } = await admin.auth.admin.getUserById(data.biz.user_id);
        email = userRes?.user?.email ?? null;
      }
      if (!email) {
        results.push({ business_id: bid, skipped: "no_email" });
        continue;
      }

      if (!resendKey) {
        results.push({ business_id: bid, html_preview: html.slice(0, 500), error: "RESEND_API_KEY missing" });
        continue;
      }
      const r = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${resendKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          from: "VoyageRespond <notify@voyagerespond.com>",
          reply_to: "metecorukbasari@gmail.com",
          to: [email],
          subject: `Haftalık Rakip Briefiniz · ${data.biz.name}`,
          html,
        }),
      });
      if (!r.ok) {
        const t = await r.text();
        results.push({ business_id: bid, error: t.slice(0, 200) });
        continue;
      }
      sent++;
      results.push({ business_id: bid, email, sent: true });
    }

    return new Response(JSON.stringify({ ok: true, sent, results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("weekly-competitive-brief error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});