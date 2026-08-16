// Ülke adı (EN / TR / yerel) -> ISO 3166-1 alpha-2 normalizasyonu.
// Dilden ülke çıkarımı YAPILMAZ. Sadece platformdan gelen ham ülke metni çevrilir.

const NAME_TO_ISO2: Record<string, string> = {
  // Türkiye
  "turkey": "TR", "turkiye": "TR", "türkiye": "TR", "turkei": "TR", "türkei": "TR", "turquie": "TR", "turquia": "TR", "turcia": "TR", "turchia": "TR", "турция": "TR",
  // Almanya
  "germany": "DE", "almanya": "DE", "deutschland": "DE", "allemagne": "DE", "alemania": "DE", "germania": "DE", "германия": "DE",
  // Rusya
  "russia": "RU", "russian federation": "RU", "rusya": "RU", "russland": "RU", "russie": "RU", "rusia": "RU", "россия": "RU",
  // Birleşik Krallık
  "united kingdom": "GB", "uk": "GB", "great britain": "GB", "britain": "GB", "england": "GB", "scotland": "GB", "wales": "GB", "northern ireland": "GB",
  "birleşik krallık": "GB", "birlesik krallik": "GB", "ingiltere": "GB", "i̇ngiltere": "GB", "grossbritannien": "GB", "großbritannien": "GB", "royaume-uni": "GB", "великобритания": "GB", "англия": "GB",
  // Hollanda
  "netherlands": "NL", "the netherlands": "NL", "holland": "NL", "hollanda": "NL", "nederland": "NL", "niederlande": "NL", "pays-bas": "NL", "нидерланды": "NL", "голландия": "NL",
  // Polonya
  "poland": "PL", "polonya": "PL", "polska": "PL", "polen": "PL", "pologne": "PL", "польша": "PL",
  // Ukrayna
  "ukraine": "UA", "ukrayna": "UA", "україна": "UA", "украина": "UA",
  // Kazakistan
  "kazakhstan": "KZ", "kazakistan": "KZ", "казахстан": "KZ",
  // Avusturya
  "austria": "AT", "avusturya": "AT", "osterreich": "AT", "österreich": "AT", "autriche": "AT", "австрия": "AT",
  // İsviçre
  "switzerland": "CH", "isviçre": "CH", "i̇sviçre": "CH", "isvicre": "CH", "schweiz": "CH", "suisse": "CH", "швейцария": "CH",
  // Fransa
  "france": "FR", "fransa": "FR", "frankreich": "FR", "francia": "FR", "франция": "FR",
  // Belçika
  "belgium": "BE", "belçika": "BE", "belcika": "BE", "belgique": "BE", "belgien": "BE", "belgie": "BE", "belgië": "BE", "бельгия": "BE",
  // İskandinavya
  "sweden": "SE", "isveç": "SE", "i̇sveç": "SE", "isvec": "SE", "sverige": "SE", "schweden": "SE", "швеция": "SE",
  "norway": "NO", "norveç": "NO", "norvec": "NO", "norge": "NO", "norwegen": "NO", "норвегия": "NO",
  "denmark": "DK", "danimarka": "DK", "danmark": "DK", "danemark": "DK", "dänemark": "DK", "дания": "DK",
  "finland": "FI", "finlandiya": "FI", "suomi": "FI", "finnland": "FI", "финляндия": "FI",
  "iceland": "IS", "izlanda": "IS", "i̇zlanda": "IS",
  // Orta Doğu
  "israel": "IL", "israil": "IL", "i̇srail": "IL", "израиль": "IL",
  "iran": "IR", "islamic republic of iran": "IR", "i̇ran": "IR", "иран": "IR",
  "iraq": "IQ", "irak": "IQ", "ирак": "IQ",
  "saudi arabia": "SA", "suudi arabistan": "SA", "saudi-arabien": "SA", "саудовская арабия": "SA",
  "united arab emirates": "AE", "uae": "AE", "birleşik arap emirlikleri": "AE", "birlesik arap emirlikleri": "AE", "оаэ": "AE",
  "qatar": "QA", "katar": "QA", "kuwait": "KW", "kuveyt": "KW", "bahrain": "BH", "bahreyn": "BH", "oman": "OM", "umman": "OM",
  "jordan": "JO", "ürdün": "JO", "urdun": "JO", "lebanon": "LB", "lübnan": "LB", "lubnan": "LB", "syria": "SY", "suriye": "SY",
  // Amerika
  "united states": "US", "united states of america": "US", "usa": "US", "u.s.a.": "US", "u.s.": "US", "america": "US",
  "amerika": "US", "abd": "US", "amerika birleşik devletleri": "US", "vereinigte staaten": "US", "états-unis": "US", "сша": "US",
  "canada": "CA", "kanada": "CA", "канада": "CA", "mexico": "MX", "meksika": "MX", "brazil": "BR", "brezilya": "BR", "argentina": "AR", "arjantin": "AR",
  // Doğu Avrupa / Kafkasya / Baltık
  "romania": "RO", "romanya": "RO", "rumänien": "RO", "rumanien": "RO", "румыния": "RO",
  "bulgaria": "BG", "bulgaristan": "BG", "bulgarien": "BG", "болгария": "BG",
  "czech republic": "CZ", "czechia": "CZ", "çekya": "CZ", "cekya": "CZ", "çek cumhuriyeti": "CZ", "tschechien": "CZ", "чехия": "CZ",
  "slovakia": "SK", "slovakya": "SK", "словакия": "SK",
  "moldova": "MD", "republic of moldova": "MD", "moldovya": "MD", "молдова": "MD",
  "belarus": "BY", "belarus republic": "BY", "beyaz rusya": "BY", "belarusya": "BY", "беларусь": "BY", "белоруссия": "BY",
  "azerbaijan": "AZ", "azerbaycan": "AZ", "azerbaidschan": "AZ", "азербайджан": "AZ",
  "georgia": "GE", "gürcistan": "GE", "gurcistan": "GE", "грузия": "GE",
  "armenia": "AM", "ermenistan": "AM", "армения": "AM",
  "uzbekistan": "UZ", "özbekistan": "UZ", "ozbekistan": "UZ", "узбекистан": "UZ",
  "kyrgyzstan": "KG", "kırgızistan": "KG", "kirgizistan": "KG", "киргизия": "KG",
  "turkmenistan": "TM", "türkmenistan": "TM", "туркменистан": "TM", "tajikistan": "TJ", "tacikistan": "TJ",
  "lithuania": "LT", "litvanya": "LT", "литва": "LT",
  "latvia": "LV", "letonya": "LV", "латвия": "LV",
  "estonia": "EE", "estonya": "EE", "эстония": "EE",
  "hungary": "HU", "macaristan": "HU", "ungarn": "HU", "венгрия": "HU",
  "serbia": "RS", "sırbistan": "RS", "sirbistan": "RS", "сербия": "RS",
  "croatia": "HR", "hırvatistan": "HR", "hirvatistan": "HR", "хорватия": "HR",
  "slovenia": "SI", "slovenya": "SI", "bosnia and herzegovina": "BA", "bosna hersek": "BA",
  "north macedonia": "MK", "macedonia": "MK", "kuzey makedonya": "MK", "albania": "AL", "arnavutluk": "AL",
  "kosovo": "XK", "kosova": "XK", "montenegro": "ME", "karadağ": "ME", "karadag": "ME",
  "greece": "GR", "yunanistan": "GR", "griechenland": "GR", "греция": "GR",
  "cyprus": "CY", "kıbrıs": "CY", "kibris": "CY", "güney kıbrıs": "CY",
  // Güney Avrupa / diğer Avrupa
  "italy": "IT", "italya": "IT", "i̇talya": "IT", "italia": "IT", "italien": "IT", "италия": "IT",
  "spain": "ES", "ispanya": "ES", "i̇spanya": "ES", "espana": "ES", "españa": "ES", "spanien": "ES", "испания": "ES",
  "portugal": "PT", "portekiz": "PT", "португалия": "PT",
  "ireland": "IE", "irlanda": "IE", "i̇rlanda": "IE", "ирландия": "IE",
  "malta": "MT", "luxembourg": "LU", "lüksemburg": "LU",
  // Asya / Pasifik / Afrika
  "china": "CN", "çin": "CN", "cin": "CN", "китай": "CN",
  "japan": "JP", "japonya": "JP", "япония": "JP",
  "south korea": "KR", "korea, republic of": "KR", "güney kore": "KR", "guney kore": "KR",
  "india": "IN", "hindistan": "IN", "индия": "IN",
  "pakistan": "PK", "bangladesh": "BD", "bangladeş": "BD",
  "indonesia": "ID", "endonezya": "ID", "malaysia": "MY", "malezya": "MY",
  "singapore": "SG", "singapur": "SG", "thailand": "TH", "tayland": "TH", "vietnam": "VN",
  "philippines": "PH", "filipinler": "PH",
  "australia": "AU", "avustralya": "AU", "австралия": "AU", "new zealand": "NZ", "yeni zelanda": "NZ",
  "egypt": "EG", "mısır": "EG", "misir": "EG", "египет": "EG",
  "morocco": "MA", "fas": "MA", "tunisia": "TN", "tunus": "TN", "algeria": "DZ", "cezayir": "DZ", "libya": "LY",
  "south africa": "ZA", "güney afrika": "ZA", "nigeria": "NG", "nijerya": "NG", "kenya": "KE",
};

const ISO2_RE = /^[A-Za-z]{2}$/;

/** Ham ülke metnini ISO-2'ye çevirir. Eşleşme yoksa null + uyarı logu. */
export function toIso2(raw?: string | null): string | null {
  if (!raw) return null;
  const trimmed = String(raw).trim();
  if (!trimmed) return null;

  // Zaten ISO-2 ise olduğu gibi kabul et
  if (ISO2_RE.test(trimmed)) return trimmed.toUpperCase();

  const norm = trimmed.toLowerCase().replace(/\s+/g, " ");
  if (NAME_TO_ISO2[norm]) return NAME_TO_ISO2[norm];

  // "Berlin, Germany" / "Almanya - Berlin" gibi bileşik metinlerde parçaları dene
  const parts = norm.split(/[,;/|\-–·]+/).map((p) => p.trim()).filter(Boolean);
  for (let i = parts.length - 1; i >= 0; i--) {
    if (NAME_TO_ISO2[parts[i]]) return NAME_TO_ISO2[parts[i]];
  }

  console.warn("[country] unmapped:", raw);
  return null;
}

const COUNTRY_FIELDS = [
  "userLocation",
  "reviewerCountry",
  "countryName",
  "country",
  "nationality",
  "reviewerNationality",
  "guestCountry",
  "authorLocation",
  "reviewerLocation",
  "userCountry",
  "traveler_location",
  "location",
] as const;

function fromValue(v: any): string | null {
  if (typeof v === "string" && v.trim()) return v.trim();
  if (v && typeof v === "object") {
    const inner = v.name ?? v.country ?? v.countryName ?? v.text;
    if (typeof inner === "string" && inner.trim()) return inner.trim();
  }
  return null;
}

/** Actor'dan actor'a değişen alan adlarını sırayla dener; ham metni döndürür. */
export function extractReviewerCountryRaw(item: any, platform?: string): string | null {
  for (const key of COUNTRY_FIELDS) {
    const hit = fromValue(item?.[key]);
    if (hit) return hit;
  }
  console.log("[country] no field matched for provider:", platform ?? "unknown", Object.keys(item ?? {}));
  return null;
}

/** Ham + ISO-2 + kaynak üçlüsünü döndürür. */
export function extractReviewerCountry(item: any, platform?: string): {
  reviewer_country: string | null;
  reviewer_country_raw: string | null;
  reviewer_country_source: string | null;
} {
  const raw = extractReviewerCountryRaw(item, platform);
  if (!raw) {
    return { reviewer_country: null, reviewer_country_raw: null, reviewer_country_source: null };
  }
  return {
    reviewer_country: toIso2(raw),
    reviewer_country_raw: raw.slice(0, 200),
    reviewer_country_source: "platform",
  };
}
