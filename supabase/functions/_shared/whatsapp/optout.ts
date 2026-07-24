const OPT_OUT_WORDS = new Set([
  "stop", "unsubscribe", "cancel", "quit", "end",
  "dur", "iptal", "cikar", "çıkar", "cik", "çık", "vazgec", "vazgeç",
]);

export function isOptOutMessage(body: string | null | undefined): boolean {
  if (!body) return false;
  const cleaned = body.trim().toLowerCase().replace(/[^a-zçğıöşü]/gi, "");
  if (!cleaned) return false;
  return OPT_OUT_WORDS.has(cleaned);
}