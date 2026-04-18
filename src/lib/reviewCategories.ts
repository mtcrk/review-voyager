// Anahtar kelime tabanlı yorum kategorize sistemi
// TR + EN keywords, lowercased matching

export type ReviewCategory = {
  key: string;
  label: string;
  emoji: string;
  keywords: string[];
};

export const REVIEW_CATEGORIES: ReviewCategory[] = [
  {
    key: "service",
    label: "Hizmet",
    emoji: "🛎️",
    keywords: [
      "hizmet", "servis", "personel", "çalışan", "calisan", "ilgi", "ilgili",
      "güleryüz", "guleryuz", "nazik", "yardımcı", "yardimci", "resepsiyon",
      "service", "staff", "helpful", "friendly staff", "reception",
    ],
  },
  {
    key: "cleanliness",
    label: "Temizlik",
    emoji: "✨",
    keywords: [
      "temiz", "temizlik", "pırıl", "piril", "hijyen", "kirli", "pis",
      "clean", "cleanliness", "spotless", "hygiene", "dirty",
    ],
  },
  {
    key: "location",
    label: "Konum",
    emoji: "📍",
    keywords: [
      "konum", "lokasyon", "merkezi", "ulaşım", "ulasim", "yakın", "yakin",
      "manzara", "deniz manzara", "deniz manzarası",
      "location", "central", "view", "near", "close to",
    ],
  },
  {
    key: "breakfast",
    label: "Kahvaltı",
    emoji: "🥐",
    keywords: [
      "kahvaltı", "kahvalti", "açık büfe", "acik bufe", "büfe", "bufe",
      "breakfast", "buffet", "morning meal",
    ],
  },
  {
    key: "food",
    label: "Yemek",
    emoji: "🍽️",
    keywords: [
      "yemek", "yemekler", "lezzet", "lezzetli", "mutfak", "şef", "sef",
      "akşam yemeği", "aksam yemegi", "öğle", "ogle", "tatlı", "tatli",
      "food", "dinner", "lunch", "meal", "delicious", "tasty", "cuisine", "chef",
    ],
  },
  {
    key: "room",
    label: "Oda",
    emoji: "🛏️",
    keywords: [
      "oda", "odalar", "yatak", "yastık", "yastik", "klima", "balkon",
      "room", "rooms", "bed", "pillow", "bedroom", "suite", "balcony",
    ],
  },
  {
    key: "bathroom",
    label: "Banyo",
    emoji: "🚿",
    keywords: [
      "banyo", "duş", "dus", "tuvalet", "lavabo", "havlu", "su basıncı", "su basinci",
      "bathroom", "shower", "toilet", "towel", "water pressure",
    ],
  },
  {
    key: "pool",
    label: "Havuz",
    emoji: "🏊",
    keywords: [
      "havuz", "yüzme", "yuzme", "havuzlar",
      "pool", "swimming", "pools",
    ],
  },
  {
    key: "spa",
    label: "Spa",
    emoji: "💆",
    keywords: [
      "spa", "masaj", "hamam", "sauna", "wellness",
      "massage", "steam room",
    ],
  },
  {
    key: "gym",
    label: "Spor Salonu",
    emoji: "💪",
    keywords: [
      "spor salonu", "fitness", "gym", "spor", "egzersiz",
      "workout", "exercise",
    ],
  },
  {
    key: "atmosphere",
    label: "Atmosfer",
    emoji: "🌟",
    keywords: [
      "atmosfer", "ambiyans", "ambians", "huzur", "huzurlu", "rahat", "keyifli",
      "atmosphere", "ambiance", "vibe", "cozy", "relaxing", "peaceful",
    ],
  },
  {
    key: "value",
    label: "Fiyat",
    emoji: "💰",
    keywords: [
      "fiyat", "ücret", "ucret", "pahalı", "pahali", "uygun", "değer", "deger",
      "price", "value", "expensive", "cheap", "affordable", "worth",
    ],
  },
  {
    key: "family",
    label: "Aile",
    emoji: "👨‍👩‍👧",
    keywords: [
      "aile", "çocuk", "cocuk", "çocuklar", "cocuklar", "bebek",
      "family", "kids", "children", "child", "baby",
    ],
  },
  {
    key: "bar",
    label: "Bar",
    emoji: "🍹",
    keywords: [
      "bar", "kokteyl", "içki", "icki", "şarap", "sarap", "bira",
      "cocktail", "drinks", "wine", "beer",
    ],
  },
  {
    key: "parking",
    label: "Otopark",
    emoji: "🅿️",
    keywords: [
      "otopark", "park", "park yeri", "vale",
      "parking", "valet",
    ],
  },
  {
    key: "wifi",
    label: "Wi-Fi",
    emoji: "📶",
    keywords: [
      "wifi", "wi-fi", "internet", "kablosuz",
      "wireless",
    ],
  },
  {
    key: "noise",
    label: "Gürültü",
    emoji: "🔇",
    keywords: [
      "gürültü", "gurultu", "sessiz", "ses", "uyku",
      "noise", "noisy", "quiet", "silent", "sleep",
    ],
  },
  {
    key: "checkin",
    label: "Check-in",
    emoji: "🔑",
    keywords: [
      "check in", "check-in", "checkin", "giriş", "giris", "check out", "check-out",
      "checkout", "çıkış", "cikis",
    ],
  },
];

/** Normalize text for matching (lowercase + Turkish chars). */
function normalize(text: string): string {
  return text.toLowerCase();
}

/** Check if a review text matches a category by any keyword. */
export function matchesCategory(text: string | null | undefined, category: ReviewCategory): boolean {
  if (!text) return false;
  const t = normalize(text);
  return category.keywords.some((kw) => t.includes(kw.toLowerCase()));
}

/** Get all category keys that a review matches. */
export function getReviewCategories(text: string | null | undefined): string[] {
  if (!text) return [];
  const t = normalize(text);
  return REVIEW_CATEGORIES.filter((c) =>
    c.keywords.some((kw) => t.includes(kw.toLowerCase()))
  ).map((c) => c.key);
}

/** Count reviews per category from a list. Returns map of category key → count. */
export function countCategories(reviews: Array<{ text?: string | null; summary?: string | null }>): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const cat of REVIEW_CATEGORIES) {
    counts[cat.key] = 0;
  }
  for (const r of reviews) {
    const text = `${r.text || ""} ${r.summary || ""}`;
    for (const cat of REVIEW_CATEGORIES) {
      if (matchesCategory(text, cat)) counts[cat.key]++;
    }
  }
  return counts;
}
