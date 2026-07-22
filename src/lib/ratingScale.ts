// Normalize platform ratings to a 5-point scale.
// Some platforms (Booking, Expedia, Hotels.com, Trip.com, HolidayCheck) are
// stored on different scales in the reviews table.
const SCALE_BY_PLATFORM: Record<string, number> = {
  google: 5,
  tripadvisor: 5,
  yelp: 5,
  facebook: 5,
  trustpilot: 5,
  booking: 10,
  expedia: 10,
  hotelscom: 10,
  tripcom: 10,
  agoda: 10,
  holidaycheck: 6,
  yandex: 5,
};

export function getPlatformScale(platform?: string | null): number {
  if (!platform) return 5;
  return SCALE_BY_PLATFORM[platform.toLowerCase()] ?? 5;
}

/** Convert a rating from its native platform scale to a 0–5 scale. */
export function normalizeRatingTo5(rating: number, platform?: string | null): number {
  const scale = getPlatformScale(platform);
  if (!rating || scale <= 0) return 0;
  const normalized = (rating / scale) * 5;
  // Sanity clamp — a 5-point rating can never exceed 5.0.
  return Math.max(0, Math.min(5, normalized));
}

/** Weighted average across reviews, each normalized to 5-point scale. */
export function averageRating5(
  reviews: Array<{ rating: number; platform?: string | null }>
): number {
  if (!reviews.length) return 0;
  const sum = reviews.reduce((s, r) => s + normalizeRatingTo5(r.rating, r.platform), 0);
  const avg = sum / reviews.length;
  return Math.max(0, Math.min(5, avg));
}