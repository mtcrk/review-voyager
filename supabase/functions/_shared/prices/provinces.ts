// İl ve ilçe → il eşlemesi (konum kontrolü için). Anahtarlar fold() edilmiş (ascii, küçük harf).
// "Akdeniz" gibi bölge adıyla çakışan ilçelerde il esas alınır; "akdeniz bolgesi"/"mediterranean region" ifadeleri konum sayılmaz.
export const PROVINCES = [
  "adana", "adiyaman", "afyonkarahisar", "agri", "amasya", "ankara", "antalya", "artvin", "aydin", "balikesir", "bilecik", "bingol", "bitlis",
  "bolu", "burdur", "bursa", "canakkale", "cankiri", "corum", "denizli", "diyarbakir", "edirne", "elazig", "erzincan", "erzurum", "eskisehir",
  "gaziantep", "giresun", "gumushane", "hakkari", "hatay", "isparta", "mersin", "istanbul", "izmir", "kars", "kastamonu", "kayseri", "kirklareli",
  "kirsehir", "kocaeli", "konya", "kutahya", "malatya", "manisa", "kahramanmaras", "mardin", "mugla", "mus", "nevsehir", "nigde", "ordu", "rize",
  "sakarya", "samsun", "siirt", "sinop", "sivas", "tekirdag", "tokat", "trabzon", "tunceli", "sanliurfa", "usak", "van", "yozgat", "zonguldak",
  "aksaray", "bayburt", "karaman", "kirikkale", "batman", "sirnak", "bartin", "ardahan", "igdir", "yalova", "karabuk", "kilis", "osmaniye", "duzce",
];

const D: Record<string, string> = {
  antalya: "muratpasa konyaalti kepez aksu dosemealti manavgat side alanya serik belek kemer kas kalkan kumluca finike demre elmali gazipasa akseki gundogmus ibradi korkuteli lara kundu kadriye beldibi tekirova camyuva goynuk cirali adrasan okurcalar avsallar konakli mahmutlar kizilagac kizilot sorgun titreyengol colakli evrenseki kumkoy gundogdu bogazkent olimpos",
  mugla: "bodrum marmaris fethiye datca dalaman koycegiz milas ortaca seydikemer ula yatagan kavaklidere mentese turgutreis yalikavak gumbet torba bitez turkbuku golturkbuku gundogan ortakent akyarlar gumusluk icmeler turunc hisaronu oludeniz gocek calis akyaka sarigerme",
  izmir: "cesme alacati urla seferihisar dikili foca karaburun selcuk torbali menderes bergama tire odemis kemalpasa konak karsiyaka bornova buca balcova narlidere guzelbahce bayrakli cigli gaziemir karabaglar aliaga kinik kiraz beydag bayindir menemen",
  aydin: "kusadasi didim altinkum efeler soke nazilli incirliova germencik kosk sultanhisar yenipazar bozdogan karacasu kuyucak cine buharkent karpuzlu",
  mersin: "akdeniz yenisehir toroslar mezitli tarsus erdemli silifke anamur mut gulnar aydincik bozyazi camliyayla kizkalesi tasucu",
  istanbul: "beyoglu sisli besiktas fatih kadikoy taksim sultanahmet sariyer atasehir uskudar bakirkoy beylikduzu esenyurt kartal maltepe pendik umraniye levent nisantasi eminonu sirkeci karakoy galata avcilar bagcilar basaksehir beykoz bahcelievler zeytinburnu silivri sile adalar buyukada kucukcekmece buyukcekmece tuzla sancaktepe kagithane eyup eyupsultan",
  ankara: "cankaya kecioren yenimahalle mamak etimesgut sincan altindag pursaklar golbasi polatli beypazari kizilcahamam kizilay ulus",
  nevsehir: "goreme urgup uchisar avanos ortahisar derinkuyu kozakli acigol gulsehir hacibektas kapadokya cappadocia",
  bursa: "osmangazi nilufer yildirim mudanya gemlik inegol uludag iznik orhangazi mustafakemalpasa karacabey",
  trabzon: "ortahisar akcaabat yomra arakli of macka uzungol caykara surmene besikduzu vakfikebir",
  balikesir: "ayvalik edremit akcay burhaniye altinoluk gomec erdek bandirma karesi altieylul marmara cunda",
  canakkale: "bozcaada gokceada eceabat gelibolu ayvacik assos ezine biga lapseki",
  denizli: "pamukkale karahayit merkezefendi",
  rize: "ardesen camlihemsin ayder findikli cayeli",
  bolu: "abant kartalkaya mengen goynuk mudurnu",
  hatay: "antakya iskenderun samandag arsuz defne",
  sakarya: "sapanca adapazari serdivan karasu kocaali",
  kocaeli: "izmit kartepe gebze golcuk derince basiskele karamursel kandira",
  tekirdag: "suleymanpasa corlu cerkezkoy marmaraereglisi sarkoy",
  yalova: "cinarcik armutlu ciftlikkoy",
  konya: "selcuklu meram karatay",
  gaziantep: "sahinbey sehitkamil",
  kayseri: "kocasinan melikgazi talas erciyes",
  eskisehir: "odunpazari tepebasi",
  erzurum: "palandoken yakutiye aziziye",
  sanliurfa: "haliliye eyyubiye karakopru halfeti",
  samsun: "atakum ilkadim canik",
  artvin: "hopa arhavi borcka savsat yusufeli",
  afyonkarahisar: "sandikli",
};
export const DISTRICT_TO_PROVINCE: Record<string, string> = {};
for (const [p, ds] of Object.entries(D)) for (const d of ds.split(" ")) DISTRICT_TO_PROVINCE[d] ??= p;

const PROV_SET = new Set(PROVINCES);
export const PLACE_WORDS = new Set([...PROVINCES, ...Object.keys(DISTRICT_TO_PROVINCE)]);

/** fold()'lanmış metinden bölge ifadelerini temizler ("Akdeniz Bölgesi", "Mediterranean Region"). */
export const stripRegionPhrases = (t: string) =>
  t.replace(/\b(akdeniz|ege|marmara|karadeniz|ic anadolu|dogu anadolu|guneydogu anadolu|mediterranean|aegean|black sea|central anatolia)\s+(bolgesi|region)\b/g, " ");

/** Metindeki il(ler). İl adı geçiyorsa o il; yoksa ilçelerden türetilir. */
export function provincesOf(folded: string): Set<string> {
  const toks = stripRegionPhrases(folded).split(" ").filter(Boolean);
  const direct = new Set(toks.filter((w) => PROV_SET.has(w)));
  if (direct.size) return direct;
  const out = new Set<string>();
  for (const w of toks) if (DISTRICT_TO_PROVINCE[w]) out.add(DISTRICT_TO_PROVINCE[w]);
  return out;
}
