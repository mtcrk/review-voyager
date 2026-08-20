import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";
import { averageRating5 } from "@/lib/ratingScale";
import { sentimentToIndex100 } from "@/lib/topicDepartments";

/** Rakip tarafında bu eşiğin altındaki bahislerde kıyas savunulamaz. */
const MIN_COMP_MENTIONS = 5;
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Wrench,
  MessageCircle,
  DollarSign,
  ArrowRight,
} from "lucide-react";

type Topic = { id: string; display_name: any; applies_to_verticals: string[] };

function topicLabel(t: Topic | undefined) {
  if (!t) return "—";
  return t.display_name?.tr ?? t.display_name?.en ?? t.id;
}

/** Gün cinsinden medyan yanıt süresi (kaynak: sayfanın ortak kıyas penceresi). */
function fmtDays(d: number | null | undefined) {
  if (d == null) return "—";
  if (d < 1) return `${Math.round(d * 24)} sa`;
  return `${d.toFixed(1)} gün`;
}

/**
 * Tüm kıyas metrikleri ortak kıyas penceresinden hesaplanır ve prop olarak gelir.
 * ActionPack hiçbir yeniden hesaplama yapmaz; prop yoksa ilgili kartı göstermez.
 */
export function ActionPack({
  businessId,
  ownAvg,
  compAvgOfAvg,
  ownReplyRate,
  compReplyRate,
  ownMedianResponse,
  compMedianResponse,
}: {
  businessId: string;
  /** 0-100 itibar indeksi */
  ownAvg?: number | null;
  /** 0-100 itibar indeksi */
  compAvgOfAvg?: number | null;
  ownReplyRate?: number | null;
  compReplyRate?: number | null;
  /** gün */
  ownMedianResponse?: number | null;
  /** gün */
  compMedianResponse?: number | null;
}) {
  const q = useQuery({
    queryKey: ["action-pack", businessId],
    enabled: !!businessId,
    queryFn: async () => {
      const [{ data: biz }, { data: comps }, { data: topics }] = await Promise.all([
        supabase
          .from("businesses")
          .select("id,name,star_rating,segment,price_tier,price_estimate_eur" as any)
          .eq("id", businessId)
          .maybeSingle(),
        supabase
          .from("ci_competitors")
          .select("id,name,rating,review_count,star_rating,segment,price_tier,price_estimate_eur" as any)
          .eq("business_id", businessId)
          .eq("status", "confirmed"),
        supabase
          .from("ci_topics")
          .select("id,display_name,applies_to_verticals"),
      ]);

      const compIds = (comps ?? []).map((c: any) => c.id);
      let topicRows: any[] = [];
      if (compIds.length > 0) {
        const trRes = await supabase
          .from("ci_review_topics")
          .select("topic_id,review_source,sentiment,competitor_id")
          .eq("business_id", businessId);
        topicRows = (trRes.data ?? []) as any[];
      }

      return {
        biz: biz as any,
        comps: (comps ?? []) as any[],
        topics: ((topics ?? []) as any[]).filter((t) =>
          Array.isArray(t.applies_to_verticals) && t.applies_to_verticals.includes("hotel"),
        ) as Topic[],
        topicRows,
      };
    },
  });

  if (q.isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} className="h-56 w-full" />
        ))}
      </div>
    );
  }

  const data = q.data;
  if (!data || data.comps.length === 0) return null;

  const { biz, comps, topics, topicRows } = data;

  // ===== Card 1: Pricing & Positioning =====
  // Puanlar tek kaynaktan gelir: sayfanın ortak kıyas penceresi (0-100 indeks).
  const showPriceCard = ownAvg !== undefined && compAvgOfAvg !== undefined;
  const peerSet = comps;
  const peerPriceEur = (() => {
    const arr = peerSet.map((c: any) => c.price_estimate_eur).filter((n: any) => n != null);
    return arr.length ? arr.reduce((a: number, b: number) => Number(a) + Number(b), 0) / arr.length : null;
  })();
  const ownPriceEur = biz?.price_estimate_eur != null ? Number(biz.price_estimate_eur) : null;

  let priceVerdict: { tone: "good" | "warn" | "bad" | "info"; title: string; detail: string };
  if (ownAvg == null || compAvgOfAvg == null) {
    priceVerdict = {
      tone: "info",
      title: "Daha fazla veri gerekli",
      detail: `Kıyas için kendi yorumlarınız ve emsal rakiplerden en az ${MIN_COMP_MENTIONS} toplanmış yorum gerekiyor.`,
    };
  } else if (ownAvg < compAvgOfAvg) {
    // Normalize edilmiş kıyasta emsalin altındaysak fiyat artışı ASLA önerilmez.
    priceVerdict = {
      tone: "bad",
      title: "Fiyatı sabit tutun",
      detail: `İtibar indeksiniz (${ownAvg.toFixed(1)}) emsal ortalamasının (${compAvgOfAvg.toFixed(1)}) altında — aynı 0-100 ölçeğinde. Önce tekrar eden şikayet konularını kapatın, fiyat artışını erteleyin.`,
    };
  } else if (ownAvg >= compAvgOfAvg + 4 && (ownPriceEur == null || peerPriceEur == null || ownPriceEur <= peerPriceEur)) {
    priceVerdict = {
      tone: "good",
      title: "Fiyatı yukarı çekme fırsatı",
      detail: `İtibar indeksiniz emsalin ${(ownAvg - compAvgOfAvg).toFixed(1)} puan üzerinde. %5-10 fiyat artışını test edin.`,
    };
  } else if (ownPriceEur != null && peerPriceEur != null && ownPriceEur > peerPriceEur * 1.1) {
    priceVerdict = {
      tone: "warn",
      title: "Promosyon/paket önerisi",
      detail: "Puan emsalle aynı ama fiyatınız yüksek. Erken rezervasyon paketi düşünün.",
    };
  } else {
    priceVerdict = {
      tone: "good",
      title: "Konumunuz dengeli",
      detail: "Puan ve fiyat emsalle uyumlu. Volume artırma odaklı kampanyalar deneyin.",
    };
  }

  // ===== Card 2: Operational Priority =====
  type TStat = { neg: number; pos: number; total: number; sentSum: number };
  const ownTopicStats = new Map<string, TStat>();
  const compTopicStats = new Map<string, TStat>();
  for (const r of topicRows) {
    const target = r.review_source === "own" ? ownTopicStats : compTopicStats;
    const e: TStat = target.get(r.topic_id) ?? { neg: 0, pos: 0, total: 0, sentSum: 0 };
    e.total += 1;
    e.sentSum += Number(r.sentiment);
    if (Number(r.sentiment) <= -0.2) e.neg += 1;
    else if (Number(r.sentiment) >= 0.2) e.pos += 1;
    target.set(r.topic_id, e);
  }
  // Konular sekmesindeki "Fark" sütunuyla aynı mantık: rakibin bizden önde
  // olduğu ve minimum örneklem eşiğini geçen konular önceliklidir.
  const gapList = topics
    .map((t) => {
      const o = ownTopicStats.get(t.id);
      const c = compTopicStats.get(t.id);
      if (!o || o.total === 0 || !c || c.total < MIN_COMP_MENTIONS) return null;
      const ownIdx = sentimentToIndex100(o.sentSum / o.total);
      const compIdx = sentimentToIndex100(c.sentSum / c.total);
      const delta = ownIdx - compIdx;
      if (delta >= -2) return null;
      return { topic: t, ownIdx, compIdx, delta, ownN: o.total, compN: c.total };
    })
    .filter((x): x is NonNullable<typeof x> => x != null)
    .sort((a, b) => a.delta - b.delta)
    .slice(0, 3);

  const ownComplaintList = topics
    .map((t) => {
      const o = ownTopicStats.get(t.id);
      if (!o || o.neg === 0) return null;
      return { topic: t, ownNeg: o.neg, ownN: o.total };
    })
    .filter((x): x is NonNullable<typeof x> => x != null)
    .sort((a, b) => b.ownNeg - a.ownNeg)
    .slice(0, 3);

  const opsMode: "gap" | "own" = gapList.length > 0 ? "gap" : "own";

  // ===== Card 3: Reply Benchmark — değerler prop olarak gelir =====
  const showReplyCard =
    ownReplyRate !== undefined &&
    compReplyRate !== undefined &&
    ownMedianResponse !== undefined &&
    compMedianResponse !== undefined;

  function rateTone(own: number | null, comp: number | null, higherBetter = true) {
    if (own == null || comp == null) return "info" as const;
    const diff = own - comp;
    const good = higherBetter ? diff > 5 : diff < -5;
    const bad = higherBetter ? diff < -5 : diff > 5;
    if (good) return "good" as const;
    if (bad) return "bad" as const;
    return "warn" as const;
  }
  const rateBadge = rateTone(ownReplyRate ?? null, compReplyRate ?? null, true);
  const timeBadge = rateTone(
    ownMedianResponse == null ? null : -ownMedianResponse,
    compMedianResponse == null ? null : -compMedianResponse,
    true,
  );

  const toneClass = (t: "good" | "warn" | "bad" | "info") =>
    t === "good"
      ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30"
      : t === "bad"
        ? "bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/30"
        : t === "warn"
          ? "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30"
          : "bg-muted text-muted-foreground border-border";

  const ToneIcon = ({ t }: { t: "good" | "warn" | "bad" | "info" }) =>
    t === "good" ? <TrendingUp className="h-3 w-3" /> : t === "bad" ? <TrendingDown className="h-3 w-3" /> : <Minus className="h-3 w-3" />;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
      {/* CARD 1 - Pricing */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-primary" /> Fiyat & Pozisyon
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            {peerSet.length} emsal rakiple karşılaştırma
            {peerIsSubset
              ? ` · emsal = comp-set içinden aynı segment/yıldız (${comps.length} rakibin ${peerSet.length}'i)`
              : " · emsal = comp-set'in tamamı"}
          </p>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Puanınız (5 üzerinden)</span>
            <span className="font-semibold">{ownAvg != null ? ownAvg.toFixed(2) : "—"}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              Emsal ortalama (toplanan yorumlardan, 5 üzerinden)
            </span>
            <span className="font-semibold">{peerAvg != null ? peerAvg.toFixed(2) : "—"}</span>
          </div>
          {(ownPriceEur != null || peerPriceEur != null) && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Fiyat (€/gece)</span>
              <span className="font-semibold">
                {ownPriceEur != null ? `€${Math.round(ownPriceEur)}` : "—"}
                <span className="text-muted-foreground font-normal"> / </span>
                {peerPriceEur != null ? `€${Math.round(peerPriceEur)}` : "—"}
              </span>
            </div>
          )}
          <div className={`rounded-md border p-3 text-sm ${toneClass(priceVerdict.tone)}`}>
            <div className="font-medium flex items-center gap-1.5">
              <ToneIcon t={priceVerdict.tone} />
              {priceVerdict.title}
            </div>
            <p className="text-xs mt-1 opacity-90">{priceVerdict.detail}</p>
          </div>
          {ownPriceEur == null && (
            <Button asChild variant="ghost" size="sm" className="w-full h-8 text-xs">
              <Link to="/settings?tab=locations">
                Oda fiyatı girin <ArrowRight className="h-3 w-3 ml-1" />
              </Link>
            </Button>
          )}
        </CardContent>
      </Card>

      {/* CARD 2 - Operational */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Wrench className="h-4 w-4 text-primary" />{" "}
            {opsMode === "gap" ? "Bu Hafta Önceliğin" : "Sizde en çok şikayet edilen konular"}
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            {opsMode === "gap"
              ? `Rakibin sizden önde olduğu konular (Konular sekmesindeki "Fark" sütunu, en az ${MIN_COMP_MENTIONS} rakip bahsi)`
              : "Yeterli rakip verisi yok — sadece kendi şikayet sıklığınıza göre sıralandı"}
          </p>
        </CardHeader>
        <CardContent className="space-y-2">
          {opsMode === "own" && ownComplaintList.length === 0 ? (
            <p className="text-xs text-muted-foreground py-4 text-center">
              Belirgin operasyonel öncelik yok. Konuları analiz edin.
            </p>
          ) : opsMode === "gap" ? (
            gapList.map((row, idx) => (
              <div key={row.topic.id} className="flex items-start gap-2 py-1.5 border-b last:border-b-0">
                <div className="flex-shrink-0 h-6 w-6 rounded-full bg-primary/10 text-primary text-xs font-semibold flex items-center justify-center">
                  {idx + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm truncate">{topicLabel(row.topic)}</div>
                  <div className="text-xs text-muted-foreground">
                    Siz {row.ownIdx.toFixed(1)} / rakip {row.compIdx.toFixed(1)}{" "}
                    <span className="text-rose-600 dark:text-rose-400">
                      (−{Math.abs(row.delta).toFixed(1)})
                    </span>
                    {" · "}rakipte {row.compN} bahis
                  </div>
                </div>
              </div>
            ))
          ) : (
            ownComplaintList.map((row, idx) => (
              <div key={row.topic.id} className="flex items-start gap-2 py-1.5 border-b last:border-b-0">
                <div className="flex-shrink-0 h-6 w-6 rounded-full bg-primary/10 text-primary text-xs font-semibold flex items-center justify-center">
                  {idx + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm truncate">{topicLabel(row.topic)}</div>
                  <div className="text-xs text-muted-foreground">
                    Sizde {row.ownNeg} şikayet · {row.ownN} bahis üzerinden
                  </div>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* CARD 3 - Reply Benchmark */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <MessageCircle className="h-4 w-4 text-primary" /> Yanıt Performansı
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            Rakip yanıtları toplanan platformlardan ölçülür
          </p>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Yanıt oranı</span>
              <div className="flex items-center gap-2">
                <span className="font-semibold">{Math.round(ownReplyRate)}%</span>
                <span className="text-xs text-muted-foreground">/ {compReplyRate != null ? `${Math.round(compReplyRate)}%` : "—"}</span>
                <Badge variant="outline" className={`${toneClass(rateBadge)} text-[10px] h-5`}>
                  <ToneIcon t={rateBadge} />
                </Badge>
              </div>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Medyan yanıt süresi</span>
              <div className="flex items-center gap-2">
                <span className="font-semibold">{fmtHours(ownMedianReply)}</span>
                <span className="text-xs text-muted-foreground">/ {fmtHours(compMedianReply)}</span>
                <Badge variant="outline" className={`${toneClass(timeBadge)} text-[10px] h-5`}>
                  <ToneIcon t={timeBadge} />
                </Badge>
              </div>
            </div>
          </div>
          {unansweredCount > 0 && (
            <Button asChild size="sm" variant="outline" className="w-full">
              <Link to="/reviews?status=unanswered">
                Cevapsız {unansweredCount} yoruma git <ArrowRight className="h-3 w-3 ml-1" />
              </Link>
            </Button>
          )}
          {compReplyRate == null && (
            <p className="text-[11px] text-muted-foreground">
              Rakip yanıt verisi henüz toplanmadı. Yorumlar tekrar çekildiğinde dolacak.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}