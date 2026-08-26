/**
 * English adaptations of the remaining Turkish SEO pages:
 * healthcare reputation, dental, aesthetic clinics, customer satisfaction and
 * restaurant customer satisfaction.
 *
 * Facts and constraints follow the Turkish originals. Where the Turkish page
 * cites Turkish legislation (KVKK, Law 1219), the English version describes the
 * same restriction in terms an international reader can act on, and names the
 * Turkish rule where it is the source of the constraint.
 */

import type { GeoPage, GeoFact } from "./geoPages";

const FACTS: GeoFact[] = [
  {
    value: "15",
    label:
      "Supported review platforms (Google, Booking, TripAdvisor, Yandex, Trip.com, Hotels.com, Expedia, Airbnb, Yemeksepeti, Trendyol, Zomato, TikTok, Instagram, Facebook, YouTube)",
  },
  { value: "Official API", label: "Google connection through the Business Profile API — no password sharing" },
  { value: "8", label: "Selectable reply tones, including a neutral tone for regulated sectors" },
  { value: "TR / EN", label: "Dashboard in two languages; replies drafted in the language of the review" },
];

export const geoVerticalsEn: GeoPage[] = [
  // ------------------------------------------------------------- 8
  {
    slug: "healthcare-reputation-management",
    lang: "en",
    alt: "saglik-itibar-yonetimi",
    title: "Healthcare Reputation Management for Clinics and Hospitals | VoyageRespond",
    description:
      "How clinics, doctors and hospitals manage online reviews without breaching patient privacy or medical advertising rules: a neutral reply framework plus AI drafting.",
    eyebrow: "Healthcare",
    h1: "Reputation and Review Management for Healthcare Providers",
    definition:
      "Healthcare reputation management is the practice of monitoring and responding to patient reviews across Google and medical directories within the limits set by privacy law and medical advertising rules. It is not review deletion. The defining constraint is that a public reply may not confirm that someone was a patient, name a procedure, or promise a result.",
    stepsHeading: "How compliant review management works",
    steps: [
      { title: "Collect every channel", body: "Google Business Profile and the medical directories patients actually use are brought into one inbox." },
      { title: "Classify by risk", body: "Reviews mentioning a procedure, a complication or a legal threat are separated from ordinary feedback." },
      { title: "Draft neutral replies", body: "Drafts thank the reviewer or acknowledge a concern without confirming treatment details or making claims." },
      { title: "Move the case offline", body: "Every clinical discussion is redirected to a named contact route so nothing medical is debated publicly." },
      { title: "Report the pattern", body: "Waiting times, appointment scheduling and communication show up as topics that can be fixed operationally." },
    ],
    tableHeading: "Non-compliant vs compliant replies",
    tableColumns: ["", "Risky reply", "Compliant reply"],
    tableRows: [
      ["Patient status", "\"Thank you for choosing us for your implant\"", "\"Thank you for your feedback\" without confirming any treatment"],
      ["Procedure detail", "Names the treatment the reviewer mentioned", "Never repeats or confirms a procedure"],
      ["Outcome claims", "\"You will get a perfect result\"", "No result promised in public"],
      ["Comparison", "\"The best clinic in the city\"", "No superlative or comparative claim"],
      ["Offers", "Discount or campaign offered in the reply", "No pricing or promotion in a public reply"],
    ],
    factsHeading: "Coverage and technical details",
    facts: FACTS,
    faqHeading: "Frequently asked questions",
    faqs: [
      {
        question: "Are healthcare providers allowed to manage reviews at all?",
        answer:
          "Yes. Monitoring reviews and replying in neutral terms is permitted; what is restricted is confirming patient information and using patient experiences as advertising. Review management is not the same thing as review removal.",
      },
      {
        question: "Why can a reply not mention the treatment?",
        answer:
          "Confirming that a named person received a specific treatment discloses health data, which is special-category personal data under privacy law including Turkey's KVKK. The reviewer may disclose it about themselves; the provider may not confirm it.",
      },
      {
        question: "Can positive patient reviews be reused in marketing?",
        answer:
          "Under Turkish rules — Law 1219 and the Ministry of Health's health promotion regulation — republishing patient experiences as advertising is prohibited. The review can stay on Google, but it cannot be turned into a brochure, ad or social creative.",
      },
      {
        question: "How should a clinic handle a review it believes is fake?",
        answer:
          "Report it to the platform under the appropriate category, keep evidence, and escalate through the platform's legal removal process if the report fails. Removal is always the platform's or a court's decision, never the software's.",
      },
      {
        question: "Is it legal to ask satisfied patients for a review?",
        answer:
          "Asking for feedback on service quality is generally acceptable. The limits are in the message: no health information, no advertising language, and no incentive, discount or gift in exchange for a review.",
      },
      {
        question: "What does AI actually do here?",
        answer:
          "It drafts a neutral reply that acknowledges the feedback without confirming clinical detail, flags high-risk reviews for a human first, and groups recurring themes such as waiting times. A person approves every reply.",
      },
    ],
    ctaHeading: "See how your clinic appears in AI answers",
    ctaBody:
      "Patients increasingly ask an assistant before they search. Check for free whether your clinic is named — no card required.",
  },

  // ------------------------------------------------------------- 9
  {
    slug: "dental-practice-review-management",
    lang: "en",
    alt: "dis-hekimi-yorum-yonetimi",
    title: "Dental Practice Review Management: Google and Directories | VoyageRespond",
    description:
      "Review management for dentists and dental clinics: neutral replies that respect patient privacy, directory coverage, and AI drafts with human approval.",
    eyebrow: "Dental practices",
    h1: "Review Management for Dentists and Dental Clinics",
    definition:
      "Dental review management is the process of tracking and answering patient reviews on Google and dental directories without disclosing clinical information. Because dentistry generates high-volume, procedure-specific feedback, replies must stay neutral: they acknowledge the experience described without confirming the treatment, the outcome or the patient relationship.",
    stepsHeading: "How dental review management works",
    steps: [
      { title: "Connect Google and directories", body: "The practice's Google Business Profile and the appointment directories patients use are connected in one place." },
      { title: "Sort by urgency", body: "Complaints about pain, billing or outcome are flagged first; routine praise is queued behind them." },
      { title: "Draft without clinical detail", body: "Replies avoid naming root canals, implants, whitening or orthodontics even when the reviewer named them." },
      { title: "Redirect to the practice", body: "Every clinical or billing dispute is moved to a named phone number or email in one short sentence." },
      { title: "Ask for feedback properly", body: "Post-appointment requests use neutral wording with no incentive and no health information." },
    ],
    tableHeading: "Manual handling vs VoyageRespond",
    tableColumns: ["", "Manual", "VoyageRespond"],
    tableRows: [
      ["Channels", "Google plus each directory checked separately", "One inbox across all connected channels"],
      ["Compliance", "Depends on who writes the reply", "Neutral drafts with no clinical confirmation"],
      ["Urgent reviews", "Found whenever someone logs in", "Flagged on arrival"],
      ["Multiple locations", "One login per practice", "Comparative view across practices"],
      ["Review requests", "Ad hoc", "Neutral post-appointment email requests"],
    ],
    factsHeading: "Coverage and technical details",
    facts: FACTS,
    faqHeading: "Frequently asked questions",
    faqs: [
      {
        question: "What limits apply when replying to dental reviews?",
        answer:
          "Do not confirm the procedure the reviewer mentions, do not use advertising language, price claims or superlatives, and do not promise outcomes. A short neutral reply that offers a direct contact route is the safest form.",
      },
      {
        question: "Which platforms matter most for a dental practice?",
        answer:
          "Google Business Profile is the priority because it drives local discovery. Appointment directories matter next, since they capture patients searching by specialty, and social comments are worth monitoring as a secondary channel.",
      },
      {
        question: "Can we ask patients for a Google review?",
        answer:
          "Requesting feedback on service quality is acceptable. The request must contain no health information, no promotional language and no reward, and it should go to all patients rather than only the ones you expect to be happy.",
      },
      {
        question: "How should we answer a complaint about pain or an outcome?",
        answer:
          "Acknowledge that the person had a poor experience, state that the practice wants to look into it, and give a direct contact route. Do not discuss clinical detail publicly, even to defend the treatment.",
      },
      {
        question: "Can a bad review be removed?",
        answer:
          "Only reviews that breach the platform's policy can be reported, and the platform decides. Genuine dissatisfaction stays published, which is why a calm reply matters more than a removal attempt.",
      },
      {
        question: "What does the software do for a multi-site practice?",
        answer:
          "It brings every location into one inbox, keeps the reply tone identical across sites, and compares locations by topic so you can see which practice is behind on waiting times or communication.",
      },
    ],
    ctaHeading: "Check how your practice appears in AI answers",
    ctaBody:
      "Enter your practice name and see for free whether ChatGPT, Gemini and Perplexity name you when patients ask for a recommendation.",
  },

  // ------------------------------------------------------------- 10
  {
    slug: "aesthetic-clinic-review-management",
    lang: "en",
    alt: "estetik-klinik-yorum-yonetimi",
    title: "Aesthetic Clinic Review Management: A Compliance-First Guide | VoyageRespond",
    description:
      "Review management for aesthetic and medical beauty clinics: what a public reply may not say, how to handle fake reviews, and where AI drafting fits.",
    eyebrow: "Aesthetic clinics",
    h1: "Review Management for Aesthetic and Medical Beauty Clinics",
    definition:
      "Aesthetic clinic review management is the practice of monitoring and answering patient reviews in a sector where advertising rules are strictest. Public replies cannot confirm a procedure, promise a result, compare the clinic to others, or offer pricing. The working assumption is that every reply will be read by a regulator as well as a prospective patient.",
    stepsHeading: "How compliant review management works",
    steps: [
      { title: "Bring channels together", body: "Google, directories and social comments are monitored in one place, since aesthetic feedback spreads across all three." },
      { title: "Flag high-risk reviews", body: "Reviews naming a procedure, a complication or a refund demand are routed to a person before any reply." },
      { title: "Draft in neutral language", body: "The draft acknowledges the feedback without confirming treatment, outcome or patient status." },
      { title: "Take it offline immediately", body: "One sentence with a named contact route; no clinical discussion in public, ever." },
      { title: "Document suspected fakes", body: "Evidence is collected and the platform's report and legal escalation process is tracked to a decision." },
    ],
    tableHeading: "What a reply may and may not contain",
    tableColumns: ["", "Not permitted", "Permitted"],
    tableRows: [
      ["Procedure", "Confirming rhinoplasty, botox, fillers or laser treatment", "Thanking the reviewer without naming any treatment"],
      ["Outcome", "\"Perfect result\", \"no scarring\"", "An offer to discuss the concern privately"],
      ["Comparison", "\"Best clinic\", \"better than others\"", "A factual, neutral description of the service"],
      ["Commercial", "Discounts, campaigns, price lists", "A contact route with no commercial content"],
      ["Imagery", "Directing readers to before-and-after patient photos", "No reference to patient imagery"],
    ],
    factsHeading: "Coverage and technical details",
    facts: FACTS,
    faqHeading: "Frequently asked questions",
    faqs: [
      {
        question: "What can never appear in an aesthetic clinic's reply?",
        answer:
          "Confirmation of the procedure, any outcome promise, comparative or superlative claims, discounts or campaigns, and any pointer to patient imagery. A short neutral reply plus an offline contact route is the rule.",
      },
      {
        question: "Can positive reviews be shared on Instagram?",
        answer:
          "Under Turkey's Law 1219 and the Ministry of Health's health promotion regulation, republishing patient experiences for promotional purposes is prohibited. The review may remain on Google, but it cannot be reused as an ad or social creative.",
      },
      {
        question: "How do we fight fake reviews from competitors?",
        answer:
          "Report the review to the platform under the conflict-of-interest category, keep evidence, and if the report fails escalate through the platform's legal removal process or, in Turkey, a court application via a lawyer. Abusive content can also be a criminal complaint.",
      },
      {
        question: "Will VoyageRespond delete fake reviews for us?",
        answer:
          "No. Only the platform or a court can remove a review. The software helps you detect suspicious reviews, gather evidence, track the complaint, and draft a compliant reply in the meantime.",
      },
      {
        question: "Should a clinic reply to every review?",
        answer:
          "Reply to negative and ambiguous reviews, because they are what prospective patients read closely. Short generic thanks on positive reviews are fine, but never confirm what treatment the person had.",
      },
      {
        question: "Does AI understand these restrictions?",
        answer:
          "The drafting rules are configured for the sector, so drafts avoid procedure names, outcome claims and promotional language. A human still approves each reply, which is the actual compliance control.",
      },
    ],
    ctaHeading: "Check how your clinic appears in AI answers",
    ctaBody:
      "See for free whether AI assistants name your clinic when someone asks for a recommendation in your category.",
  },

  // ------------------------------------------------------------- 11
  {
    slug: "customer-satisfaction-management",
    lang: "en",
    alt: "musteri-memnuniyeti",
    title: "Customer Satisfaction Management: Measurement and Surveys | VoyageRespond",
    description:
      "How to measure customer satisfaction with micro-surveys, NPS and review sentiment — and how to turn the result into weekly operational decisions.",
    eyebrow: "Customer satisfaction",
    h1: "Customer Satisfaction: How to Measure It and What to Do With the Result",
    definition:
      "Customer satisfaction management is the practice of measuring how customers experience a business, tracking that measurement over time, and acting on what it shows. The usual instruments are short post-purchase surveys, a periodic NPS question, and sentiment analysis of existing public reviews — which is the only source that already exists before you start.",
    stepsHeading: "How to run satisfaction measurement",
    steps: [
      { title: "Start with the reviews you already have", body: "Sentiment and topic analysis of existing reviews gives a baseline without asking anyone anything." },
      { title: "Add a one-question micro-survey", body: "A single 1-5 question sent shortly after the visit gets far higher response rates than a long form." },
      { title: "Track NPS separately", body: "Keep the recommendation question apart from operational scores so trends stay readable." },
      { title: "Route by score", body: "High scores are invited to leave a public review; low scores go to a private contact form so the issue is handled." },
      { title: "Review weekly, act monthly", body: "Watch the topic breakdown weekly; change process, staffing or supply monthly rather than reacting to single responses." },
    ],
    tableHeading: "Comparing measurement methods",
    tableColumns: ["Method", "What it tells you", "Trade-off"],
    tableRows: [
      ["Review sentiment analysis", "What customers already say publicly, by topic", "Skewed towards strong opinions"],
      ["Post-visit micro-survey", "Satisfaction close to the moment of experience", "Needs a contact channel and consent"],
      ["NPS", "Willingness to recommend, comparable over time", "One number, no operational detail"],
      ["Long questionnaire", "Detail across many dimensions", "Low response rate, slow to collect"],
      ["Mystery shopping", "Process compliance", "Small sample, high cost per observation"],
    ],
    factsHeading: "Coverage and technical details",
    facts: FACTS,
    faqHeading: "Frequently asked questions",
    faqs: [
      {
        question: "What is the simplest way to start measuring satisfaction?",
        answer:
          "Analyse the reviews you already have by topic and sentiment, then add a one-question survey sent shortly after the visit. Both can be running within a week and together they cover public perception and private feedback.",
      },
      {
        question: "How is satisfaction different from NPS?",
        answer:
          "Satisfaction measures how a specific experience went; NPS measures willingness to recommend the business overall. They move independently, so a business can have good service scores and weak recommendation intent.",
      },
      {
        question: "Is it acceptable to send review requests only to happy customers?",
        answer:
          "No. Filtering requests by expected sentiment — review gating — breaches Google's policies. You can route low scores to a private form for follow-up, but the review request itself must go to everyone.",
      },
      {
        question: "How often should satisfaction be measured?",
        answer:
          "Continuously at the transaction level and reviewed weekly in aggregate. Monthly or quarterly measurement is too slow to connect a score change to the operational cause behind it.",
      },
      {
        question: "What response rate should we expect?",
        answer:
          "A single-question survey delivered soon after the visit typically outperforms a multi-page form by a wide margin. The exact rate depends on your channel and timing, so track your own baseline rather than a benchmark.",
      },
      {
        question: "How do reviews fit into satisfaction measurement?",
        answer:
          "Reviews are the only satisfaction data that exists before you ask for any, and they are public. Topic-level sentiment analysis of them shows which part of the experience is dragging the rest down.",
      },
    ],
    ctaHeading: "Start with the data you already have",
    ctaBody:
      "VoyageRespond analyses your existing reviews by topic and sentiment. Check first what AI assistants currently say about your business.",
  },

  // ------------------------------------------------------------- 12
  {
    slug: "restaurant-customer-satisfaction",
    lang: "en",
    alt: "restoran-musteri-memnuniyeti",
    title: "Restaurant Customer Satisfaction: Measure and Improve It | VoyageRespond",
    description:
      "How restaurants measure satisfaction across food, service, atmosphere and value — with micro-surveys, QR feedback and review sentiment analysis.",
    eyebrow: "Restaurants",
    h1: "Restaurant Customer Satisfaction: Measurement and Practical Improvement",
    definition:
      "Restaurant customer satisfaction measurement assesses four dimensions — food, service, atmosphere and value for money — and tracks them over time. The practical instruments are a one-question survey sent shortly after payment, QR feedback at the table, and topic-level sentiment analysis of existing Google and delivery-platform reviews.",
    stepsHeading: "How to measure and improve it",
    steps: [
      { title: "Measure in four dimensions", body: "Food, service, atmosphere and value are scored separately; a single overall score hides which one is failing." },
      { title: "Send a micro-survey after payment", body: "A one-question 1-5 rating sent within a couple of hours of the visit captures the experience while it is fresh." },
      { title: "Add QR feedback at the table", body: "Table-side QR codes catch guests who would never open an email." },
      { title: "Route by score", body: "Guests scoring 4-5 are pointed to the public review link; 1-3 go to the restaurant's contact form so the complaint is handled directly." },
      { title: "Fix the service basics", body: "Water and a greeting in the first minute, no server rotation mid-service, complaints resolved at the table, and a farewell at the door." },
    ],
    tableHeading: "Where each dimension is measured",
    tableColumns: ["Dimension", "What to measure", "Best source"],
    tableRows: [
      ["Food", "Dish-level taste, portion, temperature", "Review topic analysis and delivery ratings"],
      ["Service", "Greeting, waiting time, attentiveness", "Post-visit micro-survey"],
      ["Atmosphere", "Cleanliness, noise, seating comfort", "Table-side QR feedback"],
      ["Value", "Price against expectation", "Reviews and survey free text"],
      ["Delivery", "Packaging, temperature, courier timing", "Delivery platform reviews, tracked separately"],
    ],
    factsHeading: "Coverage and technical details",
    facts: FACTS,
    faqHeading: "Frequently asked questions",
    faqs: [
      {
        question: "How is restaurant customer satisfaction measured?",
        answer:
          "With a one-question SMS or WhatsApp micro-survey sent within a couple of hours of payment, QR feedback at the table, and topic-level sentiment analysis of existing Google reviews. Together these three allow weekly trend tracking.",
      },
      {
        question: "What improves satisfaction fastest?",
        answer:
          "Four operational habits: water and a greeting within the first minute, no server rotation mid-service, resolving complaints at the table, and seeing guests to the door. None require investment beyond briefing the team.",
      },
      {
        question: "How do we get more Google reviews from happy guests?",
        answer:
          "Send everyone a 1-5 micro-survey after payment, then point guests who scored 4-5 to your Google review link and guests who scored 1-3 to a contact form. Every guest is asked; only the destination differs by score.",
      },
      {
        question: "Isn't that review gating?",
        answer:
          "Gating means only asking satisfied customers for a review. Asking everyone for feedback and offering a public review link to those who volunteer a good experience — while still handling complaints privately — is the accepted practice; never withhold the request itself based on expected sentiment.",
      },
      {
        question: "How should a negative Google review be handled?",
        answer:
          "Reply within 24 hours with an apology, a concrete action and an invitation to contact you directly. If the review is fake or breaches policy, report it to Google, which decides on removal.",
      },
      {
        question: "Do delivery platform ratings affect the dining side?",
        answer:
          "Not directly, but they affect behaviour: guests who see a weak delivery score often stop before they ever look at your Google profile. That is why delivery and dine-in should both be tracked, separately.",
      },
    ],
    ctaHeading: "Turn feedback into weekly decisions",
    ctaBody:
      "VoyageRespond breaks your reviews down by topic so you can see which of the four dimensions is holding the rating back.",
  },
];
