/**
 * Generic owner/business-response extractor shared by the own-review pipeline
 * (apify-fetch-reviews) and the competitor ingest pipeline (ingest-apify-reviews).
 * Behaviour is intentionally identical to the original inline implementation.
 */
export function extractOwnerReply(it: any): { text: string | null; date: string | null } {
  // Aggregator: reviewResponses is an array of strings or objects
  if (Array.isArray(it?.reviewResponses) && it.reviewResponses.length > 0) {
    const first = it.reviewResponses[0];
    if (typeof first === "string" && first.trim()) return { text: first.trim(), date: null };
    if (first && typeof first === "object") {
      const t = first.text || first.responseText || first.body || first.message || "";
      const d = first.date || first.responseDate || first.createdAt || null;
      if (t) return { text: String(t).trim(), date: d };
    }
  }
  // Common single-field variants across actors
  const candidates = [
    it?.responseFromOwnerText, it?.ownerResponse, it?.ownerReply, it?.replyText,
    it?.managementResponse, it?.hotelResponse, it?.hotelReply, it?.reply,
    it?.response, it?.responseText, it?.replyContent,
    // Booking voyager scraper
    it?.propertyResponse, it?.propertyReply, it?.hostResponse, it?.hostReply,
    // TripAdvisor / Hotels.com / Expedia variants
    it?.managementResponseText, it?.responseFromManagement, it?.hotelResponseText,
    it?.responseFromHotel, it?.responseFromProperty,
  ];
  for (const c of candidates) {
    if (typeof c === "string" && c.trim()) return { text: c.trim(), date: null };
    if (c && typeof c === "object") {
      const t = c.text || c.body || c.message || c.content || "";
      const d = c.date || c.createdAt || c.responseDate || null;
      if (t) return { text: String(t).trim(), date: d };
    }
  }
  // Yandex actor: businessComment (empty string when absent) + businessCommentDate
  if (typeof it?.businessComment === "string" && it.businessComment.trim()) {
    return { text: it.businessComment.trim(), date: it.businessCommentDate || null };
  }
  const dateCandidates = [it?.responseFromOwnerDate, it?.ownerResponseDate, it?.replyDate, it?.responseDate, it?.businessCommentDate];
  const d = dateCandidates.find((x) => typeof x === "string" && x);
  return { text: null, date: d || null };
}
