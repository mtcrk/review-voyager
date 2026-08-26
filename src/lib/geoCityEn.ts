/**
 * English counterparts of the Turkish city hotel pages
 * (/otel-yorum-yonetimi/<city> -> /hotel-review-management/<city>).
 *
 * Generated from the same cityHotelData source so the figures stay identical;
 * the English copy is adapted per city rather than translated line by line.
 */

import type { GeoPage, GeoFact } from "./geoPages";
import { cityHotelData } from "./cityHotelData";

const FACTS_BASE: GeoFact[] = [
  { value: "Official API", label: "Google connection through the Business Profile API — no password sharing" },
  { value: "8", label: "Selectable reply tones, matched to the language of the review" },
  { value: "TR / EN", label: "Dashboard in two languages; replies drafted in the reviewer's language" },
];

/** Short English positioning per city. Facts come from cityHotelData. */
const EN: Record<string, { name: string; intro: string; note: string; guests: string }> = {
  istanbul: {
    name: "Istanbul",
    intro:
      "Istanbul is Turkey's densest hotel market, from Sultanahmet boutique properties to business hotels in Levent and Maslak, and review volume arrives daily rather than seasonally.",
    note: "Boutique properties in the old city lean on TripAdvisor, while business hotels north of the Bosphorus depend on Booking.com.",
    guests: "Turkish, English, Arabic and Russian replies are effectively mandatory.",
  },
  antalya: {
    name: "Antalya",
    intro:
      "Antalya is the centre of Turkish resort tourism, and properties in Konyaaltı, Lara and Kemer collect review volume in concentrated seasonal peaks.",
    note: "Booking.com usually outweighs Google for resort properties here.",
    guests: "German, Russian and English replies carry most of the volume.",
  },
  bodrum: {
    name: "Bodrum",
    intro:
      "Bodrum's mix of luxury resorts, boutique hotels and villa rentals means reviews are spread across more platforms than in a single-segment market.",
    note: "Airbnb and Booking.com matter alongside Google for the villa and boutique segment.",
    guests: "English and Turkish dominate, with German and Dutch in high season.",
  },
  kapadokya: {
    name: "Cappadocia",
    intro:
      "Cappadocia's cave hotels attract long-haul guests who research heavily before booking, so review text is unusually detailed and influential.",
    note: "TripAdvisor and Booking.com carry disproportionate weight for cave hotels.",
    guests: "English, Spanish, French and Japanese appear regularly in the same week.",
  },
  izmir: {
    name: "Izmir",
    intro:
      "Izmir combines a year-round city hotel market with coastal properties nearby, which produces two very different review patterns in one metro area.",
    note: "City hotels are Google-first; coastal properties skew to Booking.com.",
    guests: "Turkish and English cover most reviews, with German in summer.",
  },
  ankara: {
    name: "Ankara",
    intro:
      "Ankara is a business-travel market, so reviews concentrate on check-in speed, work space, breakfast timing and quiet rooms rather than leisure facilities.",
    note: "Google and Booking.com are the two channels that matter; leisure OTAs are marginal.",
    guests: "Turkish and English are sufficient for most properties.",
  },
  alanya: {
    name: "Alanya",
    intro:
      "Alanya's all-inclusive resorts generate very high seasonal review volume, which makes reply throughput — not reply craft — the real constraint.",
    note: "Booking.com volume tends to exceed Google by a wide margin in season.",
    guests: "Russian, German and Scandinavian languages recur constantly.",
  },
  marmaris: {
    name: "Marmaris",
    intro:
      "Marmaris draws a heavily British and Northern European summer market, so reviews cluster tightly around a few months of the year.",
    note: "TripAdvisor and Booking.com are the primary decision channels.",
    guests: "English carries most of the volume, with Dutch and German behind it.",
  },
  kemer: {
    name: "Kemer",
    intro:
      "Kemer's resort corridor is dominated by large all-inclusive properties where a handful of recurring topics decide the overall score.",
    note: "Booking.com is the main channel; Google matters for direct search.",
    guests: "Russian and German lead, followed by English.",
  },
  fethiye: {
    name: "Fethiye",
    intro:
      "Fethiye and Ölüdeniz mix boutique hotels, apart-hotels and villas, so the same brand may be reviewed on hotel and rental platforms at once.",
    note: "Airbnb and Booking.com sit alongside TripAdvisor for smaller properties.",
    guests: "English dominates, with Turkish and German behind it.",
  },
  cesme: {
    name: "Cesme",
    intro:
      "Çeşme's short, intense season and design-led boutique segment mean a small number of reviews can move the rating quickly.",
    note: "Google and Instagram discovery matter more here than in resort markets.",
    guests: "Turkish and English cover almost all reviews.",
  },
  kusadasi: {
    name: "Kusadasi",
    intro:
      "Kuşadası combines resort hotels with cruise and Ephesus day-trip traffic, producing both long stay reviews and short, sharply worded ones.",
    note: "Booking.com and TripAdvisor lead; Google is the direct-search layer.",
    guests: "English, German and Turkish are the recurring languages.",
  },
  bursa: {
    name: "Bursa",
    intro:
      "Bursa serves thermal, ski and business demand in different seasons, so the topics guests complain about change through the year.",
    note: "Google leads for city and thermal hotels; Booking.com for winter stays.",
    guests: "Turkish and Arabic appear most, with English behind them.",
  },
  trabzon: {
    name: "Trabzon",
    intro:
      "Trabzon's growth is driven by Gulf-region visitors, which makes Arabic-language replies and family-oriented facility feedback central.",
    note: "Booking.com and Google carry the volume; local platforms are secondary.",
    guests: "Arabic and Turkish dominate, with English third.",
  },
  kayseri: {
    name: "Kayseri",
    intro:
      "Kayseri combines business travel with Erciyes winter tourism, so review topics swing between meeting facilities and ski logistics.",
    note: "Google is the primary channel, with Booking.com for the ski season.",
    guests: "Turkish and English cover most reviews.",
  },
};

export const geoCityEn: GeoPage[] = cityHotelData
  .filter((c) => EN[c.slug])
  .map((c): GeoPage => {
    const en = EN[c.slug];
    const platforms = c.topPlatforms.join(", ");
    return {
      slug: `hotel-review-management/${c.slug}`,
      lang: "en",
      alt: `otel-yorum-yonetimi/${c.slug}`,
      title: `${en.name} Hotel Review Management: Google, Booking, TripAdvisor | VoyageRespond`,
      description: `Manage your ${en.name} hotel's ${platforms} reviews from one dashboard. AI-drafted multilingual replies with human approval.`,
      eyebrow: `${en.name} hotels`,
      h1: `Hotel Review Management in ${en.name}`,
      definition: `Hotel review management in ${en.name} means collecting guest reviews from ${platforms} in one place, replying to them in the guest's own language, and tracking which parts of the stay drive the score. ${en.name} has roughly ${c.hotelCount} hotels with an average rating around ${c.avgRating}, so replies compete for attention.`,
      stepsHeading: "How it works",
      steps: [
        { title: "Connect your channels", body: `Google Business Profile connects through the official API; ${platforms} are added alongside it.` },
        { title: "Reviews arrive in one inbox", body: "New reviews are collected automatically, so nothing has to be checked platform by platform." },
        { title: "Replies are drafted for you", body: "Each draft is written in the language of the review, in the tone you choose." },
        { title: "You approve before publishing", body: "Nothing is published automatically; a person reads every reply first." },
        { title: "Topics show what to fix", body: `Recurring themes are grouped so operational issues become visible. ${en.note}` },
      ],
      tableHeading: "Manual handling vs VoyageRespond",
      tableColumns: ["", "Manual", "VoyageRespond"],
      tableRows: [
        ["Channels", "One login per platform", `${platforms} in a single inbox`],
        ["Languages", "Depends on who is on shift", en.guests],
        ["Response time", "Days, especially in high season", "Draft ready when the review lands"],
        ["Consistency", "Varies by author", "One configured tone across channels"],
        ["Reporting", "Manual spreadsheets", "Topic and sentiment breakdown over time"],
      ],
      factsHeading: `${en.name} at a glance`,
      facts: [
        { value: c.hotelCount, label: `Hotels in ${en.name} (market estimate)` },
        { value: String(c.avgRating), label: `Average hotel rating in ${en.name}` },
        ...FACTS_BASE,
      ],
      faqHeading: "Frequently asked questions",
      faqs: [
        {
          question: `Which review platforms matter most for a hotel in ${en.name}?`,
          answer: `${platforms}. ${en.note} Google matters everywhere because it is where direct searchers land.`,
        },
        {
          question: "In which language should replies be written?",
          answer: `In the language the guest used. In ${en.name}, ${en.guests.toLowerCase()} Replies are drafted in the detected language and you approve them before publishing.`,
        },
        {
          question: "How quickly should a hotel reply?",
          answer:
            "Within 24 to 48 hours while the stay is still recent, and negative reviews first. Speed matters more than length; a short, specific reply outperforms a long generic one.",
        },
        {
          question: "Is the Google connection safe?",
          answer:
            "Yes. The connection uses the official Google Business Profile API with your permission, so no password is shared and access can be revoked at any time.",
        },
        {
          question: "Can a hotel group manage several properties together?",
          answer: `Yes. Properties in ${en.name} and elsewhere can sit in one group view, with a comparison of topics and scores across them.`,
        },
        {
          question: "Are replies published automatically?",
          answer:
            "No. Every reply is a draft until a person approves it. That is deliberate — guest replies are public brand communication.",
        },
      ],
      ctaHeading: `See how your ${en.name} hotel appears in AI answers`,
      ctaBody: `${en.intro} Check for free whether ChatGPT, Gemini and Perplexity name your property.`,
    };
  });

export const geoCityEnSlugs = geoCityEn.map((p) => p.slug);
