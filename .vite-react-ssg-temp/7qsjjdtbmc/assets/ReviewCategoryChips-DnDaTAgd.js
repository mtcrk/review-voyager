import { jsxs, jsx } from "react/jsx-runtime";
import { useMemo } from "react";
import { y as cn } from "../main.mjs";
const REVIEW_CATEGORIES = [
  {
    key: "service",
    label: "Hizmet",
    emoji: "🛎️",
    keywords: [
      "hizmet",
      "servis",
      "personel",
      "çalışan",
      "calisan",
      "ilgi",
      "ilgili",
      "güleryüz",
      "guleryuz",
      "nazik",
      "yardımcı",
      "yardimci",
      "resepsiyon",
      "service",
      "staff",
      "helpful",
      "friendly staff",
      "reception"
    ]
  },
  {
    key: "cleanliness",
    label: "Temizlik",
    emoji: "✨",
    keywords: [
      "temiz",
      "temizlik",
      "pırıl",
      "piril",
      "hijyen",
      "kirli",
      "pis",
      "clean",
      "cleanliness",
      "spotless",
      "hygiene",
      "dirty"
    ]
  },
  {
    key: "location",
    label: "Konum",
    emoji: "📍",
    keywords: [
      "konum",
      "lokasyon",
      "merkezi",
      "ulaşım",
      "ulasim",
      "yakın",
      "yakin",
      "manzara",
      "deniz manzara",
      "deniz manzarası",
      "location",
      "central",
      "view",
      "near",
      "close to"
    ]
  },
  {
    key: "breakfast",
    label: "Kahvaltı",
    emoji: "🥐",
    keywords: [
      "kahvaltı",
      "kahvalti",
      "açık büfe",
      "acik bufe",
      "büfe",
      "bufe",
      "breakfast",
      "buffet",
      "morning meal"
    ]
  },
  {
    key: "food",
    label: "Yemek",
    emoji: "🍽️",
    keywords: [
      "yemek",
      "yemekler",
      "lezzet",
      "lezzetli",
      "mutfak",
      "şef",
      "sef",
      "akşam yemeği",
      "aksam yemegi",
      "öğle",
      "ogle",
      "tatlı",
      "tatli",
      "food",
      "dinner",
      "lunch",
      "meal",
      "delicious",
      "tasty",
      "cuisine",
      "chef"
    ]
  },
  {
    key: "room",
    label: "Oda",
    emoji: "🛏️",
    keywords: [
      "oda",
      "odalar",
      "yatak",
      "yastık",
      "yastik",
      "klima",
      "balkon",
      "room",
      "rooms",
      "bed",
      "pillow",
      "bedroom",
      "suite",
      "balcony"
    ]
  },
  {
    key: "bathroom",
    label: "Banyo",
    emoji: "🚿",
    keywords: [
      "banyo",
      "duş",
      "dus",
      "tuvalet",
      "lavabo",
      "havlu",
      "su basıncı",
      "su basinci",
      "bathroom",
      "shower",
      "toilet",
      "towel",
      "water pressure"
    ]
  },
  {
    key: "pool",
    label: "Havuz",
    emoji: "🏊",
    keywords: [
      "havuz",
      "yüzme",
      "yuzme",
      "havuzlar",
      "pool",
      "swimming",
      "pools"
    ]
  },
  {
    key: "spa",
    label: "Spa",
    emoji: "💆",
    keywords: [
      "spa",
      "masaj",
      "hamam",
      "sauna",
      "wellness",
      "massage",
      "steam room"
    ]
  },
  {
    key: "gym",
    label: "Spor Salonu",
    emoji: "💪",
    keywords: [
      "spor salonu",
      "fitness",
      "gym",
      "spor",
      "egzersiz",
      "workout",
      "exercise"
    ]
  },
  {
    key: "atmosphere",
    label: "Atmosfer",
    emoji: "🌟",
    keywords: [
      "atmosfer",
      "ambiyans",
      "ambians",
      "huzur",
      "huzurlu",
      "rahat",
      "keyifli",
      "atmosphere",
      "ambiance",
      "vibe",
      "cozy",
      "relaxing",
      "peaceful"
    ]
  },
  {
    key: "value",
    label: "Fiyat",
    emoji: "💰",
    keywords: [
      "fiyat",
      "ücret",
      "ucret",
      "pahalı",
      "pahali",
      "uygun",
      "değer",
      "deger",
      "price",
      "value",
      "expensive",
      "cheap",
      "affordable",
      "worth"
    ]
  },
  {
    key: "family",
    label: "Aile",
    emoji: "👨‍👩‍👧",
    keywords: [
      "aile",
      "çocuk",
      "cocuk",
      "çocuklar",
      "cocuklar",
      "bebek",
      "family",
      "kids",
      "children",
      "child",
      "baby"
    ]
  },
  {
    key: "bar",
    label: "Bar",
    emoji: "🍹",
    keywords: [
      "bar",
      "kokteyl",
      "içki",
      "icki",
      "şarap",
      "sarap",
      "bira",
      "cocktail",
      "drinks",
      "wine",
      "beer"
    ]
  },
  {
    key: "parking",
    label: "Otopark",
    emoji: "🅿️",
    keywords: [
      "otopark",
      "park",
      "park yeri",
      "vale",
      "parking",
      "valet"
    ]
  },
  {
    key: "wifi",
    label: "Wi-Fi",
    emoji: "📶",
    keywords: [
      "wifi",
      "wi-fi",
      "internet",
      "kablosuz",
      "wireless"
    ]
  },
  {
    key: "noise",
    label: "Gürültü",
    emoji: "🔇",
    keywords: [
      "gürültü",
      "gurultu",
      "sessiz",
      "ses",
      "uyku",
      "noise",
      "noisy",
      "quiet",
      "silent",
      "sleep"
    ]
  },
  {
    key: "checkin",
    label: "Check-in",
    emoji: "🔑",
    keywords: [
      "check in",
      "check-in",
      "checkin",
      "giriş",
      "giris",
      "check out",
      "check-out",
      "checkout",
      "çıkış",
      "cikis"
    ]
  }
];
function normalize(text) {
  return text.toLowerCase();
}
function matchesCategory(text, category) {
  if (!text) return false;
  const t = normalize(text);
  return category.keywords.some((kw) => t.includes(kw.toLowerCase()));
}
function countCategories(reviews) {
  const counts = {};
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
function ReviewCategoryChips({
  reviews,
  selectedCategory,
  onSelectCategory,
  className
}) {
  const counts = useMemo(() => countCategories(reviews), [reviews]);
  const visibleCategories = useMemo(
    () => REVIEW_CATEGORIES.map((c) => ({ ...c, count: counts[c.key] || 0 })).filter((c) => c.count > 0).sort((a, b) => b.count - a.count),
    [counts]
  );
  if (visibleCategories.length === 0) return null;
  return /* @__PURE__ */ jsxs("div", { className: cn("flex flex-wrap gap-2", className), children: [
    /* @__PURE__ */ jsxs(
      "button",
      {
        type: "button",
        onClick: () => onSelectCategory(null),
        className: cn(
          "px-3 py-1.5 rounded-full text-sm font-medium border transition-all",
          selectedCategory === null ? "bg-primary/10 text-primary border-primary/30" : "bg-background text-foreground border-border hover:bg-muted"
        ),
        children: [
          "Tümü (",
          reviews.length,
          ")"
        ]
      }
    ),
    visibleCategories.map((cat) => {
      const isActive = selectedCategory === cat.key;
      return /* @__PURE__ */ jsxs(
        "button",
        {
          type: "button",
          onClick: () => onSelectCategory(isActive ? null : cat.key),
          className: cn(
            "px-3 py-1.5 rounded-full text-sm font-medium border transition-all inline-flex items-center gap-1.5",
            isActive ? "bg-primary/10 text-primary border-primary/30" : "bg-background text-foreground border-border hover:bg-muted"
          ),
          children: [
            /* @__PURE__ */ jsx("span", { children: cat.emoji }),
            /* @__PURE__ */ jsx("span", { children: cat.label }),
            /* @__PURE__ */ jsxs("span", { className: cn("text-xs", isActive ? "text-primary/70" : "text-muted-foreground"), children: [
              "(",
              cat.count,
              ")"
            ] })
          ]
        },
        cat.key
      );
    })
  ] });
}
export {
  REVIEW_CATEGORIES as R,
  ReviewCategoryChips as a,
  matchesCategory as m
};
