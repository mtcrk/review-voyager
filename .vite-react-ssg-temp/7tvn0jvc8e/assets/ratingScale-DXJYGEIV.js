const SCALE_BY_PLATFORM = {
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
  holidaycheck: 6
};
function getPlatformScale(platform) {
  if (!platform) return 5;
  return SCALE_BY_PLATFORM[platform.toLowerCase()] ?? 5;
}
function normalizeRatingTo5(rating, platform) {
  const scale = getPlatformScale(platform);
  if (!rating || scale <= 0) return 0;
  const normalized = rating / scale * 5;
  return Math.max(0, Math.min(5, normalized));
}
function averageRating5(reviews) {
  if (!reviews.length) return 0;
  const sum = reviews.reduce((s, r) => s + normalizeRatingTo5(r.rating, r.platform), 0);
  const avg = sum / reviews.length;
  return Math.max(0, Math.min(5, avg));
}
export {
  averageRating5 as a,
  normalizeRatingTo5 as n
};
