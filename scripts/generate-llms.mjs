import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";

function read(rel) {
  return readFileSync(resolve(rel), "utf-8");
}

function shorten(s, max = 140) {
  if (!s) return "";
  const clean = s.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  return clean.slice(0, max - 1).trimEnd() + "…";
}

// --- Static hub pages (curated descriptions) ---
const corePages = [
  ["/", "Ana Sayfa", "Ürün özeti, özellikler ve 3 ay ücretsiz deneme."],
  ["/about", "Hakkımızda", "Şirket, misyon ve ekip bilgileri."],
  ["/about", "Hakkımızda", "Şirket, misyon ve ekip bilgileri."],
  ["/contact", "İletişim", "Demo talebi ve iletişim formu."],
  ["/demo", "Demo", "Etkileşimli AI yanıt demosu — yorumdan saniyeler içinde marka uyumlu cevap üretimi."],
  ["/blog", "Blog", "Yorum yönetimi, AI görünürlük ve dijital itibar rehberleri."],
  ["/hub", "Otomasyon Hub", "Bağlı kanallarınıza göre kişiselleştirilmiş otomasyon merkezi."],
];

const hubGuides = [
  ["/google-yorum-cevap-ornekleri", "Google Yorum Cevap Örnekleri", "Google yorumları için 25+ hazır yanıt şablonu ve örnek."],
  ["/restoran-yorum-cevaplari", "Restoran Yorum Cevapları", "Restoranlar için 30+ olumlu/olumsuz yanıt şablonu."],
  ["/otel-yorum-cevaplari", "Otel Yorum Cevapları", "Booking, TripAdvisor ve Google için 30+ otel yanıt şablonu."],
  ["/yorum-yonetim-araclari", "Yorum Yönetim Araçları", "Türkiye'de yorum yönetim platformlarının karşılaştırması."],
  ["/online-itibar-yonetimi", "Online İtibar Yönetimi", "Dijital itibar yönetiminin tanımı, süreçleri ve araçları."],
  ["/musteri-memnuniyeti", "Müşteri Memnuniyeti", "Müşteri memnuniyeti ölçümü, anket ve geri bildirim rehberi."],
  ["/restoran-musteri-memnuniyeti", "Restoran Müşteri Memnuniyeti", "Restoranlar için müşteri memnuniyeti stratejileri ve KPI'lar."],
  ["/saglik-itibar-yonetimi", "Sağlık Kuruluşları İtibar Yönetimi", "Klinik, doktor, hastane ve estetik için KVKK + 1219 uyumlu yorum & itibar yönetimi hub'ı."],
  ["/dis-hekimi-yorum-yonetimi", "Diş Hekimi Yorum Yönetimi", "Diş hekimi ve klinikleri için Google + Doktortakvimi yorum yönetimi rehberi."],
  ["/estetik-klinik-yorum-yonetimi", "Estetik Klinik Yorum Yönetimi", "Estetik klinik ve güzellik merkezleri için hassas branş yorum yönetimi rehberi."],
  ["/zincir-restoran-yorum-yonetimi", "Zincir Restoran Yorum Yönetimi", "Çok şubeli restoran zincirleri için Google + Yemeksepeti + Getir çoklu lokasyon yorum yönetimi hub'ı."],
];

// --- GEO / AI-visibility pages (TR + EN pairs) ---
function geoPages() {
  const c = read("src/lib/geoPages.ts") + read("src/lib/geoPagesEn.ts") + read("src/lib/geoVerticalsEn.ts");
  const re = /slug:\s*"([^"]+)",\s*\n\s*lang:\s*"(tr|en)",[\s\S]*?title:\s*"([^"]+)",\s*\n\s*description:\s*\n?\s*"([^"]+)"/g;
  const out = [];
  let m;
  while ((m = re.exec(c)) !== null) {
    out.push([`/${m[1]}`, m[3].replace(/ \| VoyageRespond$/, ""), shorten(m[4])]);
  }
  return out;
}

// --- English platform landing pages (rendered by GeoLanding) ---
function platformEnPages() {
  const c = read("src/lib/geoPlatformEn.ts");
  const re = /slug:\s*"(ai-[^"]+)",\s*\n\s*tr:[\s\S]*?title:\s*\n?\s*"([^"]+)",\s*\n\s*description:\s*\n?\s*"([^"]+)"/g;
  const out = [];
  let m;
  while ((m = re.exec(c)) !== null) {
    out.push([`/platform/${m[1]}`, m[2].replace(/ \| VoyageRespond$/, ""), shorten(m[3])]);
  }
  return out;
}

// --- Dynamic: platform landing pages ---
function platformPages() {
  const c = read("src/lib/platformLandingData.ts");
  const re = /slug:\s*"([^"]+)"[\s\S]*?platformName:\s*"([^"]+)"[\s\S]*?metaDescription:\s*"([^"]+)"/g;
  const out = [];
  let m;
  while ((m = re.exec(c)) !== null) {
    out.push([`/platform/${m[1]}`, `${m[2]} için AI`, shorten(m[3])]);
  }
  return out;
}

// --- English city hotel pages (generated from cityHotelData by geoCityEn.ts) ---
function cityEnPages() {
  const c = read("src/lib/geoCityEn.ts");
  const re = /^\s{2}(\w+):\s*\{\s*\n\s*name:\s*"([^"]+)",\s*\n\s*intro:\s*\n?\s*"([^"]+)"/gm;
  const out = [];
  let m;
  while ((m = re.exec(c)) !== null) {
    out.push([
      `/hotel-review-management/${m[1]}`,
      `${m[2]} Hotel Review Management`,
      shorten(m[3]),
    ]);
  }
  return out;
}

// --- Dynamic: city hotel pages ---
function cityPages() {
  const c = read("src/lib/cityHotelData.ts");
  const re = /slug:\s*"([^"]+)"[\s\S]*?name:\s*"([^"]+)"[\s\S]*?description:\s*\n?\s*"([^"]+)"/g;
  const out = [];
  let m;
  while ((m = re.exec(c)) !== null) {
    out.push([
      `/otel-yorum-yonetimi/${m[1]}`,
      `${m[2]} Otel Yorum Yönetimi`,
      shorten(m[3]),
    ]);
  }
  return out;
}

// --- Dynamic: blog posts (all 3 sources) ---
function blogPages() {
  const files = [
    "src/lib/blogPosts.ts",
    "src/lib/blogClusterRestoran.ts",
    "src/lib/blogClusterMemnuniyet.ts",
    "src/lib/blogClusterSaglik.ts",
    "src/lib/blogClusterRestoranZinciri.ts",
  ];
  const re = /\{\s*slug:\s*"([^"]+)"[\s\S]*?title:\s*"([^"]+)"[\s\S]*?description:\s*"([^"]+)"/g;
  const seen = new Set();
  const out = [];
  for (const f of files) {
    let c;
    try { c = read(f); } catch { continue; }
    let m;
    while ((m = re.exec(c)) !== null) {
      if (seen.has(m[1])) continue;
      seen.add(m[1]);
      out.push([`/blog/${m[1]}`, m[2], shorten(m[3])]);
    }
  }
  return out;
}

function section(title, items) {
  if (!items.length) return "";
  const lines = items.map(([url, name, desc]) => `- [${name}](${url}): ${desc}`);
  return `## ${title}\n\n${lines.join("\n")}\n`;
}

const platform = [...platformPages(), ...platformEnPages()];
const cities = [...cityPages(), ...cityEnPages()];
const blog = blogPages();
const geo = geoPages();

const optional = [
  ["/privacy-policy", "Gizlilik Politikası", "Veri işleme ve gizlilik koşulları."],
  ["/terms-of-service", "Kullanım Koşulları", "Hizmet kullanım şartları ve sorumluluklar."],
];

const header = `# VoyageRespond

> AI destekli yorum yönetim platformu. Otel, restoran ve işletmeler için Google, Booking, TripAdvisor, Hotels.com ve TikTok yorumlarını yapay zeka ile tek panelden yönetin.

VoyageRespond; çok platformlu yorum toplama, 8 farklı tonda AI destekli yanıt önerileri, duygu analizi, AI Görünürlük Skoru, çoklu lokasyon yönetimi ve haftalık strateji raporları sunan bir SaaS ürünüdür. Türkçe ve İngilizce desteği vardır.

`;

const body = [
  section("Pages", corePages),
  section("Hub Sayfaları", hubGuides),
  section("GEO / AI Görünürlük Sayfaları", geo),
  section("Platform Sayfaları", platform),
  section("Lokasyon Sayfaları", cities),
  section("Blog", blog),
  section("Optional", optional),
].join("\n");

const total = corePages.length + hubGuides.length + geo.length + platform.length + cities.length + blog.length + optional.length;
const out = header + body + `\n<!-- generated ${new Date().toISOString().slice(0, 10)} — ${total} pages -->\n`;

writeFileSync(resolve("public/llms.txt"), out, "utf-8");
console.log(
  `llms.txt written (${total} pages: ${corePages.length} core, ${hubGuides.length} hub, ${geo.length} geo, ${platform.length} platform, ${cities.length} city, ${blog.length} blog)`
);