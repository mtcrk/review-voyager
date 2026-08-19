// Rep Score — VoyageRespond İtibar Puanı (0-1000)
// 7 bileşenden oluşan ağırlıklı skor
import { averageRating5 } from "@/lib/ratingScale";

export interface RepScoreBreakdown {
  reviewSentiment: number;    // 0-250: Ortalama yıldız puanı
  reviewVolume: number;       // 0-150: Toplam yorum hacmi
  reviewSpread: number;       // 0-100: Platform çeşitliliği
  reviewRecency: number;      // 0-150: Yorum tazeliği (son 90 gün)
  reviewResponse: number;     // 0-200: Yanıt oranı
  reviewQuality: number;      // 0-100: Yorum kalitesi/uzunluğu
  aiVisibility: number;       // 0-50:  AI görünürlük skoru
}

export interface RepScoreResult {
  totalScore: number;
  breakdown: RepScoreBreakdown;
  grade: string;
  gradeColor: string;
  gradeLabel: string;
}

export interface ReviewData {
  rating: number;
  text: string | null;
  platform: string;
  posted_at: string;
  status: string | null;
  sentiment: string | null;
  approved_reply: string | null;
  replied_at: string | null;
}

const SUPPORTED_PLATFORMS = ['google', 'booking', 'tripadvisor', 'expedia', 'hotelscom'];

/** Bileşen tavanları — puanlar asla tavanı geçmemeli. */
export const COMPONENT_MAX: Record<keyof RepScoreBreakdown, number> = {
  reviewSentiment: 250,
  reviewVolume: 150,
  reviewSpread: 100,
  reviewRecency: 150,
  reviewResponse: 200,
  reviewQuality: 100,
  aiVisibility: 50,
};

const clampComponent = (key: keyof RepScoreBreakdown, value: number) =>
  Math.max(0, Math.min(Math.round(value), COMPONENT_MAX[key]));

/** Bileşen yüzdesi — tavana göre, en fazla %100. */
export function componentPercentage(key: keyof RepScoreBreakdown, value: number): number {
  return Math.min(100, Math.round((clampComponent(key, value) / COMPONENT_MAX[key]) * 100));
}

export function calculateRepScore(reviews: ReviewData[]): RepScoreResult {
  if (reviews.length === 0) {
    const emptyBreakdown: RepScoreBreakdown = {
      reviewSentiment: 0,
      reviewVolume: 0,
      reviewSpread: 0,
      reviewRecency: 0,
      reviewResponse: 0,
      reviewQuality: 0,
      aiVisibility: 0,
    };
    return { totalScore: 0, breakdown: emptyBreakdown, ...getGrade(0) };
  }

  const breakdown: RepScoreBreakdown = {
    reviewSentiment: clampComponent('reviewSentiment', calcSentiment(reviews)),
    reviewVolume: clampComponent('reviewVolume', calcVolume(reviews)),
    reviewSpread: clampComponent('reviewSpread', calcSpread(reviews)),
    reviewRecency: clampComponent('reviewRecency', calcRecency(reviews)),
    reviewResponse: clampComponent('reviewResponse', calcResponse(reviews)),
    reviewQuality: clampComponent('reviewQuality', calcQuality(reviews)),
    aiVisibility: clampComponent('aiVisibility', calcAIVisibility(reviews)),
  };

  const totalScore = Math.round(
    breakdown.reviewSentiment +
    breakdown.reviewVolume +
    breakdown.reviewSpread +
    breakdown.reviewRecency +
    breakdown.reviewResponse +
    breakdown.reviewQuality +
    breakdown.aiVisibility
  );

  return { totalScore, breakdown, ...getGrade(totalScore) };
}

// 1. Review Sentiment (0-250): 5'lik ölçeğe normalize edilmiş ortalama puan / 5 × 250
function calcSentiment(reviews: ReviewData[]): number {
  const avg = averageRating5(reviews);
  return Math.round((avg / 5) * 250);
}

// 2. Review Volume (0-150): Logaritmik ölçek, 500+ yorum = tam puan
function calcVolume(reviews: ReviewData[]): number {
  const count = reviews.length;
  if (count >= 500) return 150;
  // Log scale: log(count+1) / log(501) × 150
  return Math.round((Math.log(count + 1) / Math.log(501)) * 150);
}

// 3. Review Spread (0-100): Aktif platform sayısı / toplam platform
function calcSpread(reviews: ReviewData[]): number {
  const activePlatforms = new Set(reviews.map(r => r.platform));
  const ratio = activePlatforms.size / SUPPORTED_PLATFORMS.length;
  return Math.round(ratio * 100);
}

// 4. Review Recency (0-150): Son 90 gündeki yorumların oranı
function calcRecency(reviews: ReviewData[]): number {
  const now = new Date();
  const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
  const recentCount = reviews.filter(r => new Date(r.posted_at) >= ninetyDaysAgo).length;
  const ratio = recentCount / reviews.length;
  // Bonus: en az 10 taze yorum varsa ekstra puan
  const volumeBonus = Math.min(recentCount / 30, 1) * 0.3;
  return Math.round(Math.min((ratio + volumeBonus), 1) * 150);
}

// 5. Review Response (0-200): Yanıtlanmış yorum oranı
function calcResponse(reviews: ReviewData[]): number {
  const replied = reviews.filter(r => r.approved_reply || r.replied_at).length;
  const ratio = replied / reviews.length;
  // Negatif yorumlara yanıt oranı daha önemli
  const negativeReviews = reviews.filter(r => r.rating <= 2);
  const negativeReplied = negativeReviews.filter(r => r.approved_reply || r.replied_at).length;
  const negativeRatio = negativeReviews.length > 0 ? negativeReplied / negativeReviews.length : 1;
  // Ağırlıklı: %60 genel yanıt, %40 negatif yanıt
  const weighted = ratio * 0.6 + negativeRatio * 0.4;
  return Math.round(weighted * 200);
}

// 6. Review Quality (0-100): Ortalama yorum uzunluğu (karakter)
function calcQuality(reviews: ReviewData[]): number {
  const reviewsWithText = reviews.filter(r => r.text && r.text.length > 0);
  if (reviewsWithText.length === 0) return 0;
  const avgLength = reviewsWithText.reduce((sum, r) => sum + (r.text?.length || 0), 0) / reviewsWithText.length;
  // 200+ karakter = tam puan
  return Math.round(Math.min(avgLength / 200, 1) * 100);
}

// 7. AI Visibility (0-50): Duygu analizi ve puan kombinasyonu
function calcAIVisibility(reviews: ReviewData[]): number {
  const positiveCount = reviews.filter(r => r.sentiment === 'positive').length;
  const analyzedCount = reviews.filter(r => r.sentiment).length;
  if (analyzedCount === 0) return 25; // Analiz yoksa orta puan
  const positiveRatio = positiveCount / analyzedCount;
  const ratingScore = averageRating5(reviews) / 5;
  return Math.round(((positiveRatio * 0.6 + ratingScore * 0.4)) * 50);
}

function getGrade(score: number): { grade: string; gradeColor: string; gradeLabel: string } {
  if (score >= 850) return { grade: 'A+', gradeColor: 'hsl(152, 69%, 31%)', gradeLabel: 'Mükemmel' };
  if (score >= 750) return { grade: 'A', gradeColor: 'hsl(152, 69%, 41%)', gradeLabel: 'Çok İyi' };
  if (score >= 650) return { grade: 'B+', gradeColor: 'hsl(82, 69%, 41%)', gradeLabel: 'İyi' };
  if (score >= 550) return { grade: 'B', gradeColor: 'hsl(45, 93%, 47%)', gradeLabel: 'Orta Üstü' };
  if (score >= 450) return { grade: 'C', gradeColor: 'hsl(36, 93%, 47%)', gradeLabel: 'Orta' };
  if (score >= 350) return { grade: 'D', gradeColor: 'hsl(16, 93%, 47%)', gradeLabel: 'Gelişmeli' };
  return { grade: 'F', gradeColor: 'hsl(0, 84%, 50%)', gradeLabel: 'Kritik' };
}

export const COMPONENT_INFO: Record<keyof RepScoreBreakdown, { label: string; maxScore: number; icon: string; tip: string }> = {
  reviewSentiment: { label: 'Yorum Duyarlılığı', maxScore: 250, icon: '⭐', tip: 'Tüm platformlardaki ortalama yıldız puanınız' },
  reviewVolume: { label: 'Yorum Hacmi', maxScore: 150, icon: '📊', tip: 'Toplam yorum sayınız (500+ ideal)' },
  reviewSpread: { label: 'Platform Çeşitliliği', maxScore: 100, icon: '🌐', tip: 'Kaç farklı platformda yorumunuz var' },
  reviewRecency: { label: 'Yorum Tazeliği', maxScore: 150, icon: '🕐', tip: 'Son 90 gündeki yorum yoğunluğu' },
  reviewResponse: { label: 'Yanıt Oranı', maxScore: 200, icon: '💬', tip: 'Yorumlara yanıt verme oranınız (negatif yorumlar ağırlıklı)' },
  reviewQuality: { label: 'Yorum Kalitesi', maxScore: 100, icon: '✍️', tip: 'Müşterilerinizin bıraktığı yorumların detay seviyesi' },
  aiVisibility: { label: 'AI Görünürlük', maxScore: 50, icon: '🤖', tip: 'Yapay zeka arama motorlarındaki tahmini görünürlüğünüz' },
};
