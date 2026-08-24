/**
 * Türkçe duyarlı metin arama yardımcıları.
 *
 * Rozet -> metin eşlemesi için gerekli: `ci_review_topics.excerpt` ve
 * `review_analysis.keywords[].term` alanları karakter konumu tutmadığı için
 * metinde arama yapıyoruz. Türkçede `I/ı` ve `İ/i` eşlemesi bozulmasın diye
 * `toLocaleLowerCase("tr")` kullanılıyor.
 *
 * ÖNEMLİ: Küçük harfe çevirme karakter sayısını değiştirmediği için (tr-TR'de
 * 1:1) offset'ler orijinal metinle uyumlu kalır. Yine de güvenli olsun diye
 * yalnızca uzunluk korunuyorsa lower-case eşleme kullanılır.
 */

export const trLower = (s: string) => (s ?? "").toLocaleLowerCase("tr");

export type TextMatch = { start: number; end: number };

/** Metin normalizasyonu — uzunluk korunursa lower-case, yoksa orijinal. */
function foldable(text: string) {
  const lower = trLower(text);
  return lower.length === text.length ? lower : text;
}

/**
 * Verilen terimlerin metindeki tüm eşleşmelerini bulur.
 * Çakışan eşleşmeler tekilleştirilir, sonuç konuma göre sıralıdır.
 */
export function findMatches(text: string, terms: (string | null | undefined)[]): TextMatch[] {
  const src = text ?? "";
  if (!src) return [];
  const hay = foldable(src);
  const raw: TextMatch[] = [];

  for (const termRaw of terms ?? []) {
    const term = (termRaw ?? "").trim();
    if (term.length < 2) continue;
    const needle = foldable(term);
    if (needle.length !== term.length) continue;
    let from = 0;
    // Aynı terim birden fazla geçebilir — hepsini topla.
    for (let guard = 0; guard < 50; guard++) {
      const idx = hay.indexOf(needle, from);
      if (idx === -1) break;
      raw.push({ start: idx, end: idx + needle.length });
      from = idx + Math.max(1, needle.length);
    }
  }

  raw.sort((a, b) => a.start - b.start || b.end - a.end);

  const out: TextMatch[] = [];
  for (const m of raw) {
    const last = out[out.length - 1];
    if (last && m.start < last.end) {
      // Çakışma: daha geniş olanı koru.
      if (m.end > last.end) last.end = m.end;
      continue;
    }
    out.push({ ...m });
  }
  return out;
}

/** Eşleşme sayısı (rozetin tıklanabilir olup olmadığını belirler). */
export const countMatches = (text: string, terms: (string | null | undefined)[]) =>
  findMatches(text, terms).length;

/** Cümle sınırlarını döndürür. */
export function sentenceRanges(text: string): TextMatch[] {
  const src = text ?? "";
  const out: TextMatch[] = [];
  const re = /[^.!?…\n]*[.!?…]*[\n]*/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(src))) {
    if (m[0].length === 0) {
      re.lastIndex++;
      if (re.lastIndex > src.length) break;
      continue;
    }
    out.push({ start: m.index, end: m.index + m[0].length });
    if (re.lastIndex >= src.length) break;
  }
  return out.length ? out : [{ start: 0, end: src.length }];
}
