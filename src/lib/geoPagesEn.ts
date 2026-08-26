/**
 * English counterparts of the existing Turkish public SEO pages.
 *
 * These are adaptations, not translations: the facts, structure and claims
 * match the Turkish source pages, but the copy is written for an English
 * reader searching these topics. Each entry pairs with its Turkish page via
 * `alt`, so the shared GeoLanding template emits reciprocal hreflang tags
 * (x-default -> the English page).
 */

import type { GeoPage, GeoFact } from "./geoPages";

const FACTS: GeoFact[] = [
  {
    value: "15",
    label:
      "Supported review platforms (Google, Booking, TripAdvisor, Yandex, Trip.com, Hotels.com, Expedia, Airbnb, Yemeksepeti, Trendyol, Zomato, TikTok, Instagram, Facebook, YouTube)",
  },
  { value: "Official API", label: "Connected through the Google Business Profile API — no password sharing" },
  { value: "TR / EN", label: "Dashboard available in two languages; replies are drafted in the reviewer's language" },
  { value: "8", label: "Selectable reply tones (formal, friendly, apologetic, concise and more)" },
];

export const geoPagesEn: GeoPage[] = [
  // ---------------------------------------------------------------- 1
  {
    slug: "online-reputation-management",
    lang: "en",
    alt: "online-itibar-yonetimi",
    title: "Online Reputation Management: What It Is and How to Do It | VoyageRespond",
    description:
      "How online reputation management works for local businesses: monitoring Google, Booking and TripAdvisor, replying, and turning review data into operational decisions.",
    eyebrow: "Online Reputation Management",
    h1: "Online Reputation Management: What It Is and How to Do It",
    definition:
      "Online reputation management (ORM) is the ongoing practice of monitoring, responding to and improving everything published about a business online — Google reviews, Booking and TripAdvisor scores, social comments and news coverage. For most local businesses the working part of ORM is review management: collecting feedback across platforms, replying to it, and feeding what it says back into operations.",
    stepsHeading: "The five steps of reputation management",
    steps: [
      { title: "Monitor", body: "Track reviews and mentions from every platform in one place instead of logging into each dashboard separately." },
      { title: "Respond", body: "Reply within 24 hours, personally and in your brand's voice — and in the language the review was written in." },
      { title: "Analyse", body: "Produce sentiment trends and complaint categories so you can see which topic is pulling your score down." },
      { title: "Improve", body: "Turn review data into operational decisions: staffing at peak hours, breakfast service, room maintenance, wait times." },
      { title: "Generate demand", body: "Ask satisfied customers for a review through QR codes, SMS or email — without filtering by who is likely to be happy." },
    ],
    tableHeading: "Content removal vs review management: which one do you need?",
    tableColumns: ["", "Content removal / SERP suppression", "Review management"],
    tableRows: [
      ["What it covers", "Removing or pushing down negative news, forum threads and court records", "Collecting, answering and analysing customer reviews"],
      ["Who provides it", "Law firms and digital PR agencies", "Review management software platforms, including VoyageRespond"],
      ["How often it is needed", "Rarely — a crisis, a lawsuit, a viral incident", "Every week; it is an operational routine"],
      ["Nature of the work", "Legal: right-to-be-forgotten requests, court orders, DMCA notices", "Operational: monitoring, replying, topic and sentiment analysis"],
      ["Typical buyer", "A business already in a public dispute", "Hotels, restaurants and multi-location businesses"],
    ],
    factsHeading: "Why it matters — four concrete data points",
    facts: [
      { value: "93%", label: "of consumers read online reviews before visiting a business (BrightLocal, 2025)" },
      { value: "5-9%", label: "revenue increase associated with a one-star rating increase (Harvard Business School)" },
      { value: "4.4★", label: "approximate minimum average rating to place in the top three of Google \"near me\" results" },
      { value: "35%", label: "more trust earned by businesses that reply to negative reviews" },
    ],
    faqHeading: "Frequently asked questions",
    faqs: [
      {
        question: "What is the difference between online reputation management and review management?",
        answer:
          "Reputation management is the umbrella term and includes legal content removal and PR work. Review management is the operational core of it — monitoring, answering and analysing customer reviews — and it is what most hotels, restaurants and clinics actually need week to week.",
      },
      {
        question: "Which platforms should a business monitor?",
        answer:
          "Google Business Profile is mandatory for every sector because it drives local search. Hotels and travel businesses add Booking.com, TripAdvisor, Expedia and Trip.com; restaurants add delivery and dining platforms; consumer brands add social channels.",
      },
      {
        question: "Can negative reviews be deleted?",
        answer:
          "A business cannot delete a review itself. It can report reviews that break the platform's content policy — spam, off-topic content, abuse — and the platform decides after a review that usually takes a few days.",
      },
      {
        question: "How quickly should a review be answered?",
        answer:
          "Within 24 hours is a reasonable target, and faster for negative reviews. Speed matters less for the reviewer than for the people reading later, who see whether the business engages at all.",
      },
      {
        question: "Does replying to reviews improve local ranking?",
        answer:
          "Google treats responsiveness as part of profile quality and recommends replying, but there is no direct ranking guarantee. The effect is indirect, through review volume, average rating and profile completeness.",
      },
      {
        question: "Why does reputation now affect AI assistants too?",
        answer:
          "Assistants like ChatGPT, Gemini and Perplexity summarise public review content when recommending a business. The sentiment expressed in your reviews therefore shapes whether you are named in an AI answer, not just where you rank in search.",
      },
    ],
    ctaHeading: "Is your business mentioned by AI assistants?",
    ctaBody:
      "Enter your business name and check for free whether ChatGPT, Gemini and Perplexity name you when people ask for a recommendation.",
    showChecker: true,
  },

  // ---------------------------------------------------------------- 2
  {
    slug: "review-management-software",
    lang: "en",
    alt: "yorum-yonetim-araclari",
    title: "Review Management Software Compared (2026) | VoyageRespond",
    description:
      "A comparison of review management platforms for hotels, restaurants and multi-location businesses: coverage, AI reply quality and pricing ranges.",
    eyebrow: "Software comparison",
    h1: "Review Management Software: How to Compare the Options",
    definition:
      "Review management software collects customer reviews from platforms such as Google, Booking.com and TripAdvisor into one dashboard, drafts replies, and reports on sentiment and recurring topics. Tools differ mainly in platform coverage, the quality of their AI replies, whether they support multiple locations, and whether pricing is per location or per account.",
    stepsHeading: "How to choose a tool in five steps",
    steps: [
      { title: "List the platforms that matter", body: "Write down where your reviews actually arrive. A Google-only tool is cheap but expensive to migrate away from later." },
      { title: "Check reply quality in your languages", body: "Ask for sample AI replies to real reviews in every language your guests write in, not just English." },
      { title: "Check the approval flow", body: "Prefer a suggest-then-approve workflow over direct auto-publishing, so a person signs off on what appears in public." },
      { title: "Check multi-location reporting", body: "If you run more than one site, you need side-by-side comparison and topic breakdown per location, not just a combined inbox." },
      { title: "Compare pricing on your real footprint", body: "Per-location pricing scales very differently from per-account pricing once you pass a handful of properties." },
    ],
    tableHeading: "Platform comparison",
    tableColumns: ["Tool", "Best for", "Pricing range"],
    tableRows: [
      ["VoyageRespond", "Hotels, restaurants and multi-location businesses needing multi-platform coverage plus AI visibility tracking", "Three months free during early access, then monthly"],
      ["Reviewly.ai", "Single-location businesses that only manage Google", "$29-99 / month"],
      ["MARA Solutions", "Mid-sized European chains focused on AI reply quality", "€39-199 / location / month"],
      ["Birdeye", "US-centric multi-location marketing suites", "$299-399+ / month"],
      ["Podium", "Businesses combining reviews with messaging and payments", "$299-399+ / month"],
      ["TrustYou / ReviewPro (Shiji)", "International hotel chains with 50+ properties needing GRI-style benchmarks", "Enterprise, annual contract"],
      ["Esinix / Elektraweb", "Hotels that want the review module inside their existing PMS", "Bundled with the PMS"],
    ],
    factsHeading: "What VoyageRespond covers",
    facts: FACTS,
    faqHeading: "Frequently asked questions",
    faqs: [
      {
        question: "Which review management tool is best?",
        answer:
          "There is no single best tool; it depends on your platform mix and footprint. For hotels, restaurants and multi-location businesses that need Google, Booking, TripAdvisor, Hotels.com and social channels in one place, VoyageRespond covers the widest set and adds AI visibility tracking; a Google-only business can start much cheaper.",
      },
      {
        question: "I only need Google reviews — what should I use?",
        answer:
          "A Google-only tool such as Reviewly.ai is a low-cost starting point for a single location. If you expect to add Booking, TripAdvisor or delivery platforms later, choosing a multi-platform tool from the start avoids a migration.",
      },
      {
        question: "I run an international hotel chain. What is the standard?",
        answer:
          "TrustYou and ReviewPro (Shiji) are the established options for chains with 50 or more properties, mainly for their benchmarking metrics. Mid-sized European chains often use MARA for reply quality, while VoyageRespond is competitive on price and local optimisation.",
      },
      {
        question: "Should I use the review module inside my PMS?",
        answer:
          "If your PMS already includes one, enabling it may be enough. A dedicated platform usually produces better AI replies and ships features faster, so many properties use the PMS for operations and a separate tool for replies and reporting.",
      },
      {
        question: "What do these tools cost?",
        answer:
          "Google-only tools run roughly $29-99 per month, per-location AI tools €39-199 per location per month, US suites like Birdeye and Podium $299-399 and up, and enterprise hotel platforms are annual contracts in the thousands. VoyageRespond is free for three months during early access.",
      },
      {
        question: "How reliable are AI-generated replies?",
        answer:
          "Modern GPT- and Gemini-based tools produce a draft rather than a finished answer, which is why a suggest-and-approve flow is recommended. Tools that learn your brand voice reduce editing to a quick read-through in most cases.",
      },
    ],
    ctaHeading: "See how your business looks to AI assistants",
    ctaBody:
      "Before you pick a tool, check what ChatGPT, Gemini and Perplexity currently say about your business. The check is free and takes under a minute.",
    showChecker: true,
  },

  // ---------------------------------------------------------------- 3
  {
    slug: "google-review-response-examples",
    lang: "en",
    alt: "google-yorum-cevap-ornekleri",
    title: "Google Review Response Examples: 25 Templates | VoyageRespond",
    description:
      "Twenty-five copy-and-paste response templates for positive, neutral and negative Google reviews, written for restaurants, hotels and service businesses.",
    eyebrow: "Response templates",
    h1: "Google Review Response Examples: 25 Templates You Can Copy",
    definition:
      "A Google review response is the public reply a business posts under a customer review on its Google Business Profile. A useful reply thanks or acknowledges the reviewer, addresses the specific detail they mentioned, and — for complaints — offers a concrete correction and a way to continue the conversation privately. Replies are visible to everyone who later reads the review.",
    stepsHeading: "How to reply to a Google review",
    steps: [
      { title: "Read for the specific detail", body: "Find the one thing the reviewer actually talks about: the dish, the room, the wait, the staff member." },
      { title: "Open by acknowledging it", body: "Thank them for praise, or accept the problem without defending it. Never open with a disclaimer." },
      { title: "Answer the detail, not the star rating", body: "A reply that repeats a generic thank-you tells future readers nothing. Name what happened." },
      { title: "Offer a concrete next step", body: "For complaints, say what changed and give a direct contact route. Keep the public reply short." },
      { title: "Publish within 24 hours", body: "Your audience is not the reviewer, it is the customers reading the review weeks later." },
    ],
    tableHeading: "Writing replies manually vs with VoyageRespond",
    tableColumns: ["", "Manual", "VoyageRespond"],
    tableRows: [
      ["Finding new reviews", "Checking the dashboard", "WhatsApp notification as they arrive"],
      ["Time per reply", "5-10 minutes", "About 15 seconds to approve a draft"],
      ["Language", "Whatever the manager writes in", "Drafted in the language of the review"],
      ["Consistency", "Varies by who is on shift", "One brand voice profile across replies"],
      ["Topic reporting", "None", "Automatic topic and sentiment breakdown"],
    ],
    factsHeading: "Coverage",
    facts: FACTS,
    examplesHeading: "25 response templates",
    examples: [
      {
        category: "★★★★★ Positive reviews",
        items: [
          { title: "General praise", text: "Thank you for taking the time to leave such a kind review, [Name]. It genuinely makes our team's day to hear this. We hope to welcome you back soon." },
          { title: "Praise for the food", text: "Thanks so much, [Name] — I passed your comment about the [dish] straight to the kitchen and it made the chef's evening. Next time, ask about the seasonal specials; I think they'd be right up your street." },
          { title: "Praise for the service", text: "Thank you, [Name]. I've shared your review with the team, and knowing the service stood out means a great deal to them. We look forward to seeing you again." },
          { title: "Praise for the atmosphere", text: "We're really glad the space worked for you, [Name]. A lot of thought went into the lighting and the seating, so it's good to hear it lands. The terrace is worth trying on your next visit." },
          { title: "Praise for a hotel stay", text: "Thank you for the lovely review, [Name]. I'm delighted the stay went well and I've passed your comments on to the housekeeping and front desk teams. It would be a pleasure to host you again." },
          { title: "Praise for value", text: "Thank you, [Name]. Keeping the quality up while staying reasonably priced is something we work hard at, so this is good to hear. See you next time." },
          { title: "First-time customer", text: "Thanks for giving us a try, [Name], and for such a generous first impression. We'd love to see you become a regular — do say hello on your next visit." },
        ],
      },
      {
        category: "★★★ Neutral reviews",
        items: [
          { title: "Mixed feedback", text: "Thank you for the balanced review, [Name]. I'm pleased [positive point] worked well, and you're right about [issue] — we're working on it now. I hope you'll give us another go." },
          { title: "Expectations not met", text: "Thank you for being honest, [Name]. I'm sorry we didn't quite meet your expectations. If you can tell us a little more, we'll use it to fix the specific thing that let the visit down." },
          { title: "Asking for detail", text: "Thanks for the review, [Name]. We'd like to understand your visit properly — could you drop us a line at [email]? We'd rather hear the detail than guess at it." },
        ],
      },
      {
        category: "★ Negative reviews",
        items: [
          { title: "General complaint", text: "I'm sorry your visit went this way, [Name]. We've gone through what happened with the team today. I'd like to speak with you directly — please email [email] and I'll pick it up personally." },
          { title: "Food quality", text: "Thank you for telling us, [Name]. The food should not have reached you like that, and I've raised it with the kitchen. Please contact us at [email] — I'd like to put it right on your next visit." },
          { title: "Long wait", text: "You're right, [Name], that wait was too long. We've added cover at peak hours and changed how orders are sequenced. I'm sorry it spoiled the evening." },
          { title: "Staff behaviour", text: "I'm genuinely sorry, [Name]. How you were spoken to isn't how we work. I've spoken with the team member involved and arranged further training. Please get in touch at [email]." },
          { title: "Cleanliness", text: "Thank you for flagging this, [Name] — we take it seriously. We ran an immediate check with the cleaning team and tightened the checklist. Please email [email] with the date and time so we can trace it." },
          { title: "Price complaint", text: "Thanks for the feedback, [Name]. Our prices reflect the ingredients and the service we're committed to, though I understand it didn't feel worth it on the day. Do get in touch — I'd like to hear more." },
          { title: "Room complaint (hotel)", text: "I'm sorry about the room, [Name] — that's below the standard we hold ourselves to. Please contact us at [email] so we can look into it and make it right for a future stay." },
        ],
      },
      {
        category: "Special cases",
        items: [
          { title: "Star rating with no text", text: "Thank you for the rating. If you have a minute to add a line or two about your visit, it helps us and it helps other customers decide. Hope to see you again." },
          { title: "Review in another language", text: "Reply in the language the review was written in. A guest who wrote in German and receives an English reply reads it as a form letter." },
          { title: "Loyal customer", text: "Thank you, [Name] — it means a lot coming from someone who's been with us this long. We'll keep trying to make each visit better than the last." },
          { title: "Review about another business", text: "Hello [Name] — we don't think this describes a visit to us; it may have been left on the wrong listing. If we're wrong, please contact us and we'll look into it straight away." },
          { title: "Suspected fake review", text: "We can't match this to any visit or booking in our records, so we've reported it for review. If you did visit us, please get in touch and we'll gladly look into what happened." },
          { title: "Complaint already resolved", text: "Thank you for updating us, [Name]. I'm glad we could sort it out after your visit, and I'm sorry it needed sorting in the first place. See you next time." },
          { title: "Praise naming a staff member", text: "Thank you, [Name] — [staff name] will be delighted to read this, and I've made sure their manager sees it too. We hope to look after you again soon." },
          { title: "Group or event feedback", text: "Thank you for choosing us for your event, [Name]. I've shared your notes with the events team; the point about [detail] is a useful one and we'll build it into the next booking." },
        ],
      },
    ],
    faqHeading: "Frequently asked questions",
    faqs: [
      {
        question: "How do I reply to a Google review?",
        answer:
          "Open your Google Business Profile, find the review and use the reply option; the response appears publicly under the review. For higher volume, a review management platform lets you draft, approve and publish replies from one place.",
      },
      {
        question: "How should I respond to a bad review?",
        answer:
          "Acknowledge the problem without arguing, say what you are doing about it, and offer a direct contact route. Keep the public reply short — its job is to show future readers how you handle problems.",
      },
      {
        question: "Can AI write review responses?",
        answer:
          "AI tools analyse each review and produce a personalised draft that matches your brand voice and the reviewer's language. The draft still needs a human to read and approve it before publishing.",
      },
      {
        question: "Does replying to reviews help SEO?",
        answer:
          "Google favours actively managed profiles and explicitly recommends responding. Businesses with high response rates tend to perform better in local results, though replying alone is not a ranking guarantee.",
      },
      {
        question: "Is it acceptable to use response templates?",
        answer:
          "Templates are a good starting point but must be personalised — an obviously copied reply reads worse than none. Reference the specific detail the reviewer mentioned before you send anything.",
      },
      {
        question: "Should I reply to five-star reviews too?",
        answer:
          "Yes. Positive reviews are read more often than negative ones, and a short specific reply reinforces what the reviewer praised. It also keeps your overall response rate high.",
      },
    ],
    ctaHeading: "Stop writing every reply from scratch",
    ctaBody:
      "VoyageRespond drafts a reply for each review in the reviewer's language and publishes it once you approve. Check first how visible your business is to AI assistants.",
  },

  // ---------------------------------------------------------------- 4
  {
    slug: "hotel-review-response-examples",
    lang: "en",
    alt: "otel-yorum-cevaplari",
    title: "Hotel Review Response Examples: 30 Templates | VoyageRespond",
    description:
      "Thirty response templates for hotel reviews on Google, Booking.com and TripAdvisor: praise, complaints, room issues, breakfast, noise and cleanliness.",
    eyebrow: "Hotel response templates",
    h1: "Hotel Review Response Examples for Google, Booking and TripAdvisor",
    definition:
      "A hotel review response is the public reply a property posts under a guest review on Google, Booking.com, TripAdvisor or a similar channel. Effective replies name the guest, refer to the specific part of the stay they mention, and set out what has changed when something went wrong. They are read mainly by travellers comparing properties before booking.",
    stepsHeading: "How to reply to a hotel review",
    steps: [
      { title: "Identify the stay", body: "Check the booking so the reply refers to the actual room, dates and rate rather than a generic stay." },
      { title: "Address the guest by name", body: "Where the platform shows a name, use it. Anonymous reviews still deserve a specific opening line." },
      { title: "Answer the operational detail", body: "Breakfast, noise, air conditioning, check-in queues — say what happened and what has been done." },
      { title: "Move the complaint off the public thread", body: "Give one contact route for compensation or follow-up; do not negotiate in public." },
      { title: "Reply on every channel", body: "Booking and TripAdvisor replies influence bookings as much as Google, so keep response rates even across all of them." },
    ],
    tableHeading: "Managing hotel reviews manually vs with VoyageRespond",
    tableColumns: ["", "Manual", "VoyageRespond"],
    tableRows: [
      ["Channels", "Each extranet checked separately", "Google, Booking, TripAdvisor, Expedia, Hotels.com and more in one inbox"],
      ["Guest languages", "Replies in one language", "Draft written in the language of the review"],
      ["Time per reply", "5-10 minutes", "About 15 seconds to approve a draft"],
      ["Recurring issues", "Noticed anecdotally", "Topic and sentiment breakdown per department"],
      ["Multi-property view", "Spreadsheets", "Side-by-side property comparison"],
    ],
    factsHeading: "Coverage",
    facts: FACTS,
    examplesHeading: "30 hotel response templates",
    examples: [
      {
        category: "Positive reviews",
        items: [
          { title: "Overall stay", text: "Thank you for the kind review, [Name]. I'm glad the stay went smoothly and I've passed your comments to the team. We'd be delighted to welcome you back." },
          { title: "Front desk team", text: "Thank you, [Name]. Our front desk team will be very pleased to read this — a warm arrival sets the tone for everything else, so it's good to know it worked." },
          { title: "Housekeeping", text: "Thanks for mentioning the housekeeping, [Name]. It's the part of the stay guests notice most and comment on least, so the team will appreciate the recognition." },
          { title: "Breakfast", text: "Thank you, [Name] — I'll pass this to the breakfast team. We change the spread seasonally, so there should be something new next time you visit." },
          { title: "Location", text: "Glad the location worked for you, [Name]. If you're back in the area, the front desk can point you to a few places that aren't in the guidebooks." },
          { title: "Sea view room", text: "Thank you, [Name]. The sea view rooms are the ones we're proudest of, and I'm pleased it lived up to the photos. Do request the same category next time." },
          { title: "Spa and pool", text: "Thank you for the review, [Name]. I've shared your comments with the spa team. Early mornings are the quietest time at the pool if you prefer it that way." },
          { title: "Family stay", text: "Thank you, [Name]. We're glad the family were comfortable — if you return, let us know the children's ages in advance and we'll set the room up accordingly." },
          { title: "Business traveller", text: "Thank you, [Name]. Good to hear the workspace and the connection held up. Our late checkout for business guests is worth asking about on your next stay." },
          { title: "Returning guest", text: "It's always good to see you back, [Name]. Thank you for taking the time to review us again — we'll keep working to make each stay better than the last." },
        ],
      },
      {
        category: "Neutral and mixed reviews",
        items: [
          { title: "Good room, weak service", text: "Thank you for the honest review, [Name]. I'm glad the room worked; the service gaps you describe are fair, and we've gone through them with the team this week." },
          { title: "Dated facilities", text: "Thank you, [Name]. You're right that parts of the property are showing their age — refurbishment is underway and the [area] is next in the schedule." },
          { title: "Breakfast disappointing", text: "Thanks for the feedback, [Name]. Breakfast is the comment we act on fastest; we've adjusted the hot section and the timing of restocking at peak hours." },
          { title: "Value for money", text: "Thank you for the review, [Name]. Rates vary with the season, and I understand the stay didn't feel like value at that price. Contact us directly next time and we'll look at what we can offer." },
          { title: "Would maybe return", text: "Thanks for the balanced view, [Name]. If you do come back, mention this review when booking and we'll make sure the points you raised are handled." },
        ],
      },
      {
        category: "Negative reviews",
        items: [
          { title: "Room condition", text: "I'm sorry, [Name] — the room should not have been in that condition. We've inspected it and taken it out of service until the work is finished. Please contact [email] so I can follow up personally." },
          { title: "Cleanliness", text: "Thank you for raising this, [Name], and I'm sorry. We ran an immediate check with housekeeping and tightened the room release checklist. I'd like to hear the detail directly at [email]." },
          { title: "Noise", text: "I'm sorry the noise disrupted your stay, [Name]. We've reviewed how we allocate rooms near [source] and can block quieter rooms on request for future stays." },
          { title: "Air conditioning or heating", text: "I'm sorry the room temperature wasn't right, [Name]. Maintenance has checked the unit and it has been repaired. You should have been moved that evening, and I apologise that you weren't." },
          { title: "Long check-in queue", text: "You're right, [Name], the wait at check-in was too long. We've added cover at arrival peaks and opened a second desk during transfer windows." },
          { title: "Staff attitude", text: "I'm sorry about how you were treated, [Name]. That isn't the standard we hold, and I've addressed it with the team member and their manager. Please email [email]." },
          { title: "Booking or overbooking issue", text: "I'm sorry your reservation wasn't honoured as booked, [Name]. That's our error. Please contact [email] with your booking reference so we can resolve the compensation properly." },
          { title: "Hidden charges", text: "Thank you for flagging this, [Name]. Local taxes and extras should be clear before arrival. Send your invoice to [email] and we'll go through every line with you." },
          { title: "Food quality", text: "I'm sorry the restaurant let the stay down, [Name]. I've discussed your comments with the kitchen and we've changed [detail]. I'd welcome the chance to show you the difference." },
          { title: "Pool or beach crowding", text: "Thank you for the feedback, [Name]. Peak weeks put real pressure on the pool area; we've adjusted sunbed management and are enforcing the reservation rules more strictly." },
          { title: "Wi-Fi problems", text: "I'm sorry the connection was unreliable, [Name]. We've had the network surveyed and access points added in the [area] wing." },
          { title: "Transfer or parking", text: "Thanks for telling us, [Name], and sorry for the confusion. We've clarified the transfer instructions in our confirmation email so the next arrival is smoother." },
        ],
      },
      {
        category: "Special cases",
        items: [
          { title: "Rating with no text", text: "Thank you for the rating. If you have a moment to add a sentence about what worked and what didn't, it helps us improve and helps other travellers choose." },
          { title: "Review in another language", text: "Reply in the language the guest wrote in. International guests read a same-language reply as attention; an English reply to a German review reads as automated." },
          { title: "Complaint already handled on site", text: "Thank you for the update, [Name]. I'm glad the team resolved it during your stay, and sorry it came up at all. We've used it to adjust the process." },
          { title: "Unverified or suspicious review", text: "We can't match this review to a booking in our system, so we've asked the platform to check it. If you did stay with us, please contact [email] and we'll look into it right away." },
        ],
      },
    ],
    faqHeading: "Frequently asked questions",
    faqs: [
      {
        question: "How should a hotel reply to a review?",
        answer:
          "Use the guest's name, refer to the specific part of the stay they mention, and be clear about what has changed if something went wrong. Keep it short and move any compensation discussion to email.",
      },
      {
        question: "Should I reply to Booking.com and TripAdvisor reviews as well as Google?",
        answer:
          "Yes. Booking and TripAdvisor influence a large share of hotel bookings, and both display your response rate. VoyageRespond brings all three into one inbox so response rates stay even.",
      },
      {
        question: "Can AI write hotel review replies?",
        answer:
          "AI can draft a reply that matches your property's tone and the guest's language, using the content of the review. A person still approves it before it is published.",
      },
      {
        question: "How do I handle a very negative review?",
        answer:
          "Stay calm, apologise sincerely for the specific failure, and describe the concrete action taken. Then invite the guest to continue privately so the public thread does not turn into a back-and-forth.",
      },
      {
        question: "Should replies be signed by a person?",
        answer:
          "Signing with a first name and role — front office manager, general manager — reads better than an unsigned corporate reply. It also tells the reader that someone with authority saw the complaint.",
      },
      {
        question: "How far back should we reply to old reviews?",
        answer:
          "Replying to reviews from the last six to twelve months is usually worth it, especially negative ones that still appear near the top. Beyond that the effort is better spent on new arrivals.",
      },
    ],
    ctaHeading: "One inbox for every channel",
    ctaBody:
      "VoyageRespond pulls Google, Booking, TripAdvisor, Expedia and Hotels.com reviews into one place and drafts a reply in the guest's own language.",
  },

  // ---------------------------------------------------------------- 5
  {
    slug: "restaurant-review-response-examples",
    lang: "en",
    alt: "restoran-yorum-cevaplari",
    title: "Restaurant Review Response Examples and Templates | VoyageRespond",
    description:
      "Real restaurant review examples and 30 response templates for Google, Yelp and TripAdvisor — praise, complaints, wait times, service and food quality.",
    eyebrow: "Restaurant response templates",
    h1: "Restaurant Review Response Examples and Reply Templates",
    definition:
      "A restaurant review response is the public reply an operator posts under a customer review on Google, Yelp or TripAdvisor. Good replies mention the dish or the moment the reviewer describes, accept criticism without arguing, and state what has changed. Because reviews are read long after they are posted, the reply is written for future diners rather than the reviewer.",
    stepsHeading: "How to reply to a restaurant review",
    steps: [
      { title: "Check the shift", body: "Find out from the team what happened on that date before writing, especially for complaints about wait times." },
      { title: "Name the specific thing", body: "The dish, the table, the server, the queue. Specificity is what separates a real reply from a form letter." },
      { title: "Accept criticism plainly", body: "Explanations that read as excuses do more damage than the original review." },
      { title: "Say what changed", body: "Extra cover at peak hours, a recipe adjusted, a supplier changed — one concrete sentence is enough." },
      { title: "Keep it short", body: "Two to four sentences. Long replies to short reviews look defensive." },
    ],
    tableHeading: "Manual replies vs VoyageRespond",
    tableColumns: ["", "Manual", "VoyageRespond"],
    tableRows: [
      ["Finding new reviews", "Whenever someone remembers to check", "WhatsApp notification as they arrive"],
      ["Time per reply", "5-10 minutes", "About 15 seconds to approve a draft"],
      ["Tone consistency", "Depends who writes it", "One brand voice profile"],
      ["Tourist reviews", "Answered in one language", "Drafted in the reviewer's language"],
      ["Recurring complaints", "Spotted by feel", "Automatic topic and sentiment breakdown"],
    ],
    factsHeading: "Coverage",
    facts: FACTS,
    examplesHeading: "Review examples and 30 reply templates",
    examples: [
      {
        category: "What a useful customer review looks like",
        items: [
          { title: "Positive example 1", text: "Came for an early dinner on a Tuesday, no wait for a table. Ordered the lamb shoulder and the grilled octopus — both properly seasoned and generous for the price. Service was attentive without hovering. Around £30 a head with a glass of wine." },
          { title: "Positive example 2", text: "Sunday lunch with three friends. The kitchen split our sharing plates without being asked, which made the table work. The room is noisy when it's full, so not the place for a quiet conversation, but the food is worth it." },
          { title: "Positive example 3", text: "Stopped in for breakfast twice during a work trip. Coffee is consistently good, eggs cooked as ordered both times, and they had my order out in under ten minutes even at 8am." },
          { title: "Positive example 4", text: "Booked for a birthday. They remembered the note on the reservation and brought out a dessert with a candle. Small thing, but it's why we'll be back." },
          { title: "Constructive example 1", text: "The food was good — the sea bass in particular — but we waited 25 minutes between ordering and the starters arriving on a half-empty Wednesday. Worth going, just not if you're in a hurry." },
          { title: "Constructive example 2", text: "Nice room and friendly staff, but the vegetarian options are limited to one pasta dish. Fine for a group of two, harder if you're booking for a mixed table." },
        ],
      },
      {
        category: "Replying to positive reviews",
        items: [
          { title: "General praise", text: "Thank you for the review, [Name] — glad it hit the mark. I've passed it to the kitchen and the floor team. See you next time." },
          { title: "Specific dish", text: "Thanks, [Name]. The [dish] is one the chef put a lot of work into, so it's good to see it named. There's a seasonal version coming next month worth trying." },
          { title: "Service", text: "Thank you, [Name]. Getting the pace of service right is harder than it looks, so the team will be pleased to read this." },
          { title: "Atmosphere", text: "Glad the room worked for you, [Name]. If you're coming with a bigger group, ask for the back section — it's a little quieter." },
          { title: "Value", text: "Thank you, [Name]. We try to keep the pricing sensible without cutting the ingredients, so this is good to hear." },
          { title: "First visit", text: "Thanks for trying us, [Name], and for the generous first impression. We'd love to see you again." },
          { title: "Regular customer", text: "Always good to see you, [Name]. Thanks for taking the time to write — it means more coming from a regular." },
        ],
      },
      {
        category: "Replying to neutral reviews",
        items: [
          { title: "Good food, slow service", text: "Thank you for the fair review, [Name]. The wait you describe isn't acceptable on a quiet night and we've looked at how the section was staffed." },
          { title: "Mixed dishes", text: "Thanks, [Name] — glad the [good dish] worked. Your note on the [weak dish] is useful; the kitchen is revisiting it." },
          { title: "Noise level", text: "Thank you, [Name]. The room does get loud when it's full. We can seat you in the quieter section if you mention it when booking." },
          { title: "Limited menu options", text: "Thanks for raising it, [Name]. The vegetarian side of the menu is thin and we're expanding it in the next change." },
          { title: "Portion size", text: "Thank you for the feedback, [Name]. We've checked the portioning on that dish against our spec — if it came out light, that's on us." },
        ],
      },
      {
        category: "Replying to negative reviews",
        items: [
          { title: "Food quality", text: "I'm sorry, [Name] — that dish should not have gone out. I've raised it with the kitchen today. Please email [email]; I'd like to put it right." },
          { title: "Cold food", text: "Thank you for telling us, [Name], and apologies. We've changed how plates are held during service at that station so it doesn't happen again." },
          { title: "Long wait", text: "You're right, [Name], that wait was too long. We've added cover on Friday evenings and adjusted how the kitchen sequences tables." },
          { title: "Staff attitude", text: "I'm sorry about how you were spoken to, [Name]. That's not how we work and I've dealt with it directly with the person involved." },
          { title: "Wrong order", text: "Apologies, [Name] — getting the order wrong and not fixing it quickly is a double failure. Please contact [email] so I can make it up to you." },
          { title: "Cleanliness", text: "Thank you for raising this, [Name]. We ran an immediate check and reviewed the cleaning schedule for that area. If you can share the date and time, we'll trace the shift." },
          { title: "Booking not honoured", text: "I'm sorry your table wasn't ready, [Name]. We've tightened how we hold reservations during peak service. Please get in touch — I'd like to invite you back." },
          { title: "Pricing complaint", text: "Thanks for the feedback, [Name]. Our prices reflect the ingredients we buy, though I understand it didn't feel worth it that evening." },
          { title: "Allergy handling", text: "Thank you for flagging this, [Name] — allergen handling is not something we treat lightly. We have re-briefed the floor and kitchen. Please contact [email] directly." },
          { title: "Delivery order", text: "Sorry the delivery arrived like that, [Name]. We've changed the packaging for that dish and raised it with the courier partner." },
        ],
      },
      {
        category: "Special cases",
        items: [
          { title: "Rating with no text", text: "Thanks for the rating. If you have a minute to say what worked and what didn't, it helps us fix the right thing." },
          { title: "Review in another language", text: "Reply in the language the review was written in — tourists notice, and future readers in that language do too." },
          { title: "Review about another venue", text: "Hello [Name] — this doesn't match anything at our restaurant; it may have been left on the wrong listing. If we're mistaken, please get in touch." },
          { title: "Suspected fake review", text: "We can't match this to any booking or order, so we've reported it. If you did visit, please contact us and we'll look into it properly." },
        ],
      },
    ],
    faqHeading: "Frequently asked questions",
    faqs: [
      {
        question: "How do you write a good restaurant review?",
        answer:
          "Say when you visited, name the dishes you ordered, and give a concrete observation about service, atmosphere and value. Three to five sentences based on a real visit is more useful than a long, general opinion.",
      },
      {
        question: "What should a restaurant review include?",
        answer:
          "The food (dish names, portion, taste), the service (welcome, waiting time, attentiveness), the room (cleanliness, noise, seating), value for money, and the time of the visit. These five points are what other diners use to decide.",
      },
      {
        question: "How should a restaurant reply to reviews?",
        answer:
          "Personally and briefly: use the reviewer's name, mention the dish or moment they described, and be direct about what changed if something went wrong. Publishing within a day matters more than perfect wording.",
      },
      {
        question: "Should we reply to every review?",
        answer:
          "Aim to reply to all negative reviews and to as many positive ones as your volume allows. A visible response rate tells prospective customers that someone is paying attention.",
      },
      {
        question: "Can a restaurant get a bad review removed?",
        answer:
          "Only if it breaks the platform's content policy — spam, abuse, or a review of a different business. Genuine negative experiences cannot be removed, which is why the public reply matters.",
      },
      {
        question: "Is it worth replying to reviews on delivery platforms?",
        answer:
          "Yes, because delivery ratings feed the ranking inside those apps. The issues also differ from dine-in — packaging, temperature and courier timing — so they need separate tracking.",
      },
    ],
    ctaHeading: "Reply to every review without writing each one",
    ctaBody:
      "VoyageRespond drafts a reply for each review in the reviewer's language and shows which topics keep pulling your rating down.",
  },

  // ---------------------------------------------------------------- 6
  {
    slug: "multi-location-restaurant-review-management",
    lang: "en",
    alt: "zincir-restoran-yorum-yonetimi",
    title: "Multi-Location Restaurant Review Management | VoyageRespond",
    description:
      "How restaurant chains manage reviews across every branch: one inbox for Google and delivery platforms, per-location comparison and branch-level topic analysis.",
    eyebrow: "Restaurant chains",
    h1: "Multi-Location Restaurant Review Management",
    definition:
      "Multi-location review management is the practice of monitoring and answering customer reviews for every branch of a chain from a single system, while still measuring each location separately. Each address has its own Google Business Profile and its own delivery-platform listings, so a chain needs both a combined inbox and per-branch reporting to see which site is underperforming.",
    stepsHeading: "How chain review management works",
    steps: [
      { title: "Connect every branch", body: "Each address has its own Google Business Profile; all of them are connected under one account through the official API." },
      { title: "Add the delivery platforms", body: "Delivery listings carry their own ratings and their own complaint patterns, so they are tracked alongside Google." },
      { title: "Route reviews to the right manager", body: "A review lands with the branch it belongs to, while head office keeps visibility over everything." },
      { title: "Approve replies centrally or locally", body: "Drafts follow one brand voice; either the branch manager or head office approves before publishing." },
      { title: "Compare branches by topic", body: "Monthly reporting shows which location is behind on which topic — speed, cleanliness, order accuracy, staff." },
    ],
    tableHeading: "Single-branch tools vs chain-level management",
    tableColumns: ["", "Managing each branch separately", "VoyageRespond"],
    tableRows: [
      ["Inbox", "One login per branch and per platform", "All branches and platforms in one inbox"],
      ["Brand voice", "Different tone at every location", "One shared voice profile, local approval"],
      ["Comparison", "Manual spreadsheets", "Side-by-side branch comparison"],
      ["Problem detection", "Noticed when the average drops", "Topic-level breakdown per branch"],
      ["Reporting", "Assembled by hand", "Monthly report per branch and for the group"],
    ],
    factsHeading: "Coverage",
    facts: FACTS,
    faqHeading: "Frequently asked questions",
    faqs: [
      {
        question: "Does each branch need its own Google Business Profile?",
        answer:
          "Yes. Google requires a separate profile for each physical address, and each one collects its own reviews and rating. They can all be managed from a single account, which is how a chain keeps one view of the whole estate.",
      },
      {
        question: "Should head office or the branch reply to reviews?",
        answer:
          "The most workable pattern is a shared brand voice with local approval: the draft is generated centrally and the branch manager approves it. That keeps the tone consistent while retaining the detail only the branch knows.",
      },
      {
        question: "How do we tell whether a problem is local or chain-wide?",
        answer:
          "Compare the same topic across branches over the same period. If wait times are flagged at one site only it is an operational issue there; if the topic rises everywhere at once it usually points to a process or supply change.",
      },
      {
        question: "Do delivery platform reviews need separate handling?",
        answer:
          "They do, because the complaint mix is different — packaging, temperature, missing items and courier delays rather than service or atmosphere. Tracking them separately keeps dine-in metrics readable.",
      },
      {
        question: "How many branches does this make sense for?",
        answer:
          "The benefit becomes clear from around three locations, where per-branch logins and manual reporting start to consume real management time. Below that a single-location workflow is usually enough.",
      },
      {
        question: "Can franchisees be given restricted access?",
        answer:
          "Yes. Franchise managers can be limited to their own location's reviews and reports, while head office keeps the group-level view and the topic comparison across every branch.",
      },
    ],
    ctaHeading: "See every branch in one view",
    ctaBody:
      "VoyageRespond brings every location's reviews into one inbox and shows which branch is behind on which topic.",
  },
];
