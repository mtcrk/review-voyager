/**
 * English counterparts of the Turkish platform landing pages
 * (src/lib/platformLandingData.ts).
 *
 * Rendered by the shared GeoLanding template at /platform/<slug>, so every
 * page carries the same GEO structure: a neutral definition first, numbered
 * steps, a comparison table, facts and an FAQ. `alt` points at the Turkish
 * slug so reciprocal hreflang tags are emitted on both sides.
 */

import type { GeoPage, GeoFact } from "./geoPages";

const FACTS: GeoFact[] = [
  {
    value: "15",
    label:
      "Supported review and comment platforms (Google, Booking, TripAdvisor, Yandex, Trip.com, Hotels.com, Expedia, Airbnb, Yemeksepeti, Trendyol, Zomato, TikTok, Instagram, Facebook, YouTube)",
  },
  { value: "Official API", label: "Google connection runs through the Business Profile API — no password sharing" },
  { value: "8", label: "Selectable reply tones, applied consistently across every channel" },
  { value: "TR / EN", label: "Dashboard in two languages; replies drafted in the language of the review" },
];

/** Turkish slug -> English slug, used for hreflang on both templates. */
export const platformSlugPairs: Record<string, string> = {
  "google-yorumlari-icin-yapay-zeka": "ai-for-google-reviews",
  "instagram-yorumlari-icin-yapay-zeka": "ai-for-instagram-comments",
  "tripadvisor-yorumlari-icin-yapay-zeka": "ai-for-tripadvisor-reviews",
  "booking-yorumlari-icin-yapay-zeka": "ai-for-booking-com-reviews",
  "tiktok-yorumlari-icin-yapay-zeka": "ai-for-tiktok-comments",
  "yorumlara-yapay-zeka-ile-cevap-yazma": "ai-review-reply-writer",
  "facebook-yorumlari-icin-yapay-zeka": "ai-for-facebook-reviews",
  "youtube-yorumlari-icin-yapay-zeka": "ai-for-youtube-comments",
  "hotels-com-yorumlari-icin-yapay-zeka": "ai-for-hotels-com-reviews",
  "trendyol-yorumlari-icin-yapay-zeka": "ai-for-trendyol-reviews",
  "yemeksepeti-yorumlari-icin-yapay-zeka": "ai-for-yemeksepeti-reviews",
  "airbnb-yorumlari-icin-yapay-zeka": "ai-for-airbnb-reviews",
  "zomato-yorumlari-icin-yapay-zeka": "ai-for-zomato-reviews",
};

interface Src {
  slug: string;
  tr: string;
  name: string;
  eyebrow: string;
  title: string;
  description: string;
  h1: string;
  definition: string;
  steps: [string, string][];
  rows: [string, string, string][];
  faqs: [string, string][];
  ctaHeading: string;
  ctaBody: string;
}

const sources: Src[] = [
  {
    slug: "ai-for-google-reviews",
    tr: "google-yorumlari-icin-yapay-zeka",
    name: "Google reviews",
    eyebrow: "Google Reviews · AI",
    title: "AI for Google Reviews: Automated Replies and Management | VoyageRespond",
    description:
      "Answer Google Business Profile reviews with AI drafts in your own brand voice, get alerts on one-star reviews, and track sentiment across every location.",
    h1: "AI for Google Reviews: Replies, Moderation and Brand Voice",
    definition:
      "AI review management for Google is the practice of collecting Google Business Profile reviews through the official API, generating a reply draft for each one, and publishing it after human approval. The system also labels reviews by sentiment, intent and language, so recurring complaints surface as topics rather than as isolated comments.",
    steps: [
      ["Connect with OAuth", "Authorise your Google Business Profile through the official API. Historic reviews — up to around 2,500 — are imported automatically."],
      ["Reviews are labelled", "Each review is tagged by sentiment, intent (praise, complaint, question) and language before anyone reads it."],
      ["Drafts are generated", "Three reply options are produced from your past replies and your brand voice settings."],
      ["You approve", "Approve, edit or rewrite. Nothing is published to Google until a person signs it off."],
      ["Reports arrive", "Weekly reporting shows which topic moved your rating and which location is behind."],
    ],
    rows: [
      ["Brand voice", "An empty text box in the Google dashboard", "Eight tones trained on your past replies"],
      ["Multiple locations", "One dashboard per branch", "Every location in one inbox"],
      ["Priority", "One-star and five-star reviews in the same list", "Negative reviews flagged on arrival"],
      ["Notification", "Can lag by 24-72 hours", "Immediate alert by email or WhatsApp"],
      ["Foreign-language reviews", "Manual translation", "Reply drafted in the reviewer's language"],
    ],
    faqs: [
      ["Can AI really answer Google reviews for me?", "It produces a draft that matches your tone and refers to what the reviewer wrote. The recommended workflow is suggest-then-approve, so a person checks each reply before it appears publicly."],
      ["Is connecting through the API safe?", "The connection uses Google OAuth, so no password is shared and access can be revoked at any time from your Google account."],
      ["How many past reviews can be imported?", "Historic import reaches roughly 2,500 reviews per profile, which covers the full history of most single locations."],
      ["Can positive reviews be answered automatically?", "You can allow automatic replies for four- and five-star reviews while routing one- and two-star reviews to manual approval. Most operators start fully manual for a week first."],
      ["Does replying affect local ranking?", "Google recommends responding and counts profile activity as a quality signal, but there is no direct ranking guarantee. The effect comes through volume, rating and completeness."],
      ["What happens with spam or fake reviews?", "The review is flagged and a removal request can be filed with Google, which decides after its own review. Nothing can be deleted by the business itself."],
    ],
    ctaHeading: "See what AI assistants say about your business",
    ctaBody: "Check for free whether ChatGPT, Gemini and Perplexity name you when someone asks for a recommendation in your category.",
  },
  {
    slug: "ai-for-instagram-comments",
    tr: "instagram-yorumlari-icin-yapay-zeka",
    name: "Instagram comments",
    eyebrow: "Instagram · AI",
    title: "AI for Instagram Comments: Replies and Moderation | VoyageRespond",
    description:
      "Manage Instagram comments with AI: reply in the commenter's language, spot purchase intent, and keep the tone consistent across every post.",
    h1: "AI for Instagram Comments: Replies, Moderation and Sales Signals",
    definition:
      "AI comment management for Instagram means collecting the comments left on a business account's posts, classifying them by intent — question, praise, complaint or purchase interest — and drafting a reply for each. The point is not volume but speed: comments that contain a buying question lose value within hours of being posted.",
    steps: [
      ["Connect the business account", "An Instagram professional account linked to a Facebook page is connected through the official API."],
      ["Comments are classified", "Each comment is tagged by intent, so price and availability questions are separated from general praise."],
      ["Drafts are generated", "Short replies are written in the commenter's language and in your account's tone."],
      ["You approve and reply", "Approve in one tap; high-intent comments can be routed to a person instead."],
      ["Patterns are reported", "Recurring questions show which product information is missing from your captions."],
    ],
    rows: [
      ["Finding comments", "Scrolling post by post", "One inbox across all posts"],
      ["Purchase questions", "Easily missed", "Flagged by intent"],
      ["Tone", "Varies by whoever is on the account", "One shared voice profile"],
      ["Languages", "Replies in one language", "Reply in the commenter's language"],
      ["Reporting", "None", "Recurring question and sentiment breakdown"],
    ],
    faqs: [
      ["Which Instagram accounts are supported?", "Professional (business or creator) accounts connected to a Facebook page, which is what the official Instagram API requires. Personal accounts cannot be connected."],
      ["Are comments published automatically?", "No. Drafts wait for approval, which matters more on social channels where tone is public and screenshots travel."],
      ["Can direct messages be handled too?", "Comment handling and DM handling are separate surfaces with separate permissions. Comment management is the part covered here."],
      ["How are negative comments handled?", "They are flagged on arrival with a suggested reply that acknowledges the issue and moves the conversation to a private channel."],
      ["Does replying to comments help reach?", "Engagement on a post is one of the signals Instagram uses for distribution, so timely replies help indirectly. No platform guarantees reach from replies alone."],
      ["Can spam be filtered?", "Repetitive promotional comments are detected and grouped so they can be hidden or ignored in bulk rather than one by one."],
    ],
    ctaHeading: "Check your visibility in AI answers",
    ctaBody: "Social proof now feeds AI assistants too. See for free whether your business is named in their recommendations.",
  },
  {
    slug: "ai-for-tripadvisor-reviews",
    tr: "tripadvisor-yorumlari-icin-yapay-zeka",
    name: "TripAdvisor reviews",
    eyebrow: "TripAdvisor · AI",
    title: "AI for TripAdvisor Reviews: Replies for Hotels and Restaurants | VoyageRespond",
    description:
      "Manage TripAdvisor reviews alongside Google and Booking: multilingual AI reply drafts, topic analysis and response-rate tracking in one dashboard.",
    h1: "AI for TripAdvisor Reviews: Multilingual Replies for Hotels and Restaurants",
    definition:
      "TripAdvisor review management with AI means bringing a property's TripAdvisor reviews into the same workflow as its other channels, generating a reply draft for each in the reviewer's language, and analysing the recurring topics behind the ranking. TripAdvisor reviews are long-form and comparative, so replies need more detail than on other platforms.",
    steps: [
      ["Add the property", "The TripAdvisor listing is matched to your property and existing reviews are imported."],
      ["Reviews are grouped by topic", "Rooms, breakfast, service, cleanliness and value are separated so patterns are visible."],
      ["Drafts are written per review", "Each draft references the specific part of the stay the reviewer describes."],
      ["Management approves", "Replies are published under the management response, typically signed by a named manager."],
      ["Ranking factors are tracked", "Response rate, recency and rating trend are monitored alongside your other channels."],
    ],
    rows: [
      ["Channels", "TripAdvisor extranet on its own", "TripAdvisor beside Google, Booking and Expedia"],
      ["Guest languages", "Manual translation", "Draft in the language of the review"],
      ["Long reviews", "Time-consuming to answer well", "Draft covers each point raised"],
      ["Topic analysis", "Read manually", "Automatic topic and sentiment breakdown"],
      ["Multi-property", "Separate logins", "Side-by-side property comparison"],
    ],
    faqs: [
      ["Why does TripAdvisor need a different reply style?", "Reviews there are longer and more comparative, so a two-line thank-you reads as dismissive. A useful management response answers each point the reviewer raised."],
      ["Does responding affect TripAdvisor ranking?", "Ranking is driven by rating, review recency and volume. Responding does not score directly, but it affects whether readers choose you after reading a mixed review."],
      ["Can TripAdvisor reviews be removed?", "Only reviews that breach TripAdvisor's guidelines can be reported for removal, and the platform decides. Genuine complaints stay published."],
      ["Should the general manager sign the reply?", "A named signature performs better than an anonymous corporate response, because it signals that someone with authority read the complaint."],
      ["How are old reviews handled?", "Answering unanswered reviews from the past six to twelve months is usually worthwhile, particularly negative ones still visible near the top of the listing."],
      ["Can TripAdvisor and Google be answered together?", "Yes. Both feed one inbox, which keeps response rates even and prevents one channel from being neglected."],
    ],
    ctaHeading: "Check your AI visibility",
    ctaBody: "Travellers increasingly ask an assistant before they open a booking site. See whether your property is named.",
  },
  {
    slug: "ai-for-booking-com-reviews",
    tr: "booking-yorumlari-icin-yapay-zeka",
    name: "Booking.com reviews",
    eyebrow: "Booking.com · AI",
    title: "AI for Booking.com Reviews: Replies and Score Analysis | VoyageRespond",
    description:
      "Answer Booking.com guest reviews with AI drafts in the guest's language, track the sub-scores that move your overall rating, and compare properties.",
    h1: "AI for Booking.com Reviews: Guest Replies and Score Analysis",
    definition:
      "Booking.com review management with AI covers importing guest reviews, drafting a reply for each in the guest's language, and analysing the platform's sub-scores — staff, cleanliness, comfort, facilities, value and location — to see which one is holding the overall rating down. Booking reviews arrive in a split positive/negative format that replies should address directly.",
    steps: [
      ["Match the property", "Your Booking.com listing is matched and existing guest reviews are imported."],
      ["Sub-scores are tracked", "Staff, cleanliness, comfort, facilities, value and location are followed separately over time."],
      ["Drafts address both halves", "Each draft answers the liked and disliked sections of the review rather than only one."],
      ["Approve and publish", "Replies go out under the property response after your approval."],
      ["Compare over time", "Monthly reporting shows whether the weakest sub-score is moving."],
    ],
    rows: [
      ["Guest languages", "One language for everyone", "Draft in the language of the review"],
      ["Review format", "Positive and negative halves answered generically", "Both halves addressed specifically"],
      ["Sub-scores", "Read from the extranet", "Tracked as a trend per category"],
      ["Other channels", "Separate extranets", "Booking, Google, TripAdvisor and Expedia together"],
      ["Multi-property", "Manual spreadsheets", "Side-by-side property comparison"],
    ],
    faqs: [
      ["Which Booking sub-score matters most?", "Whichever one sits furthest below your overall rating, because the overall score is an average of the categories. Staff and cleanliness are the two guests comment on most."],
      ["Should every Booking review get a reply?", "At minimum every review with written content, and always the negative ones. Guests browsing the listing see the property response directly under the review."],
      ["Can Booking reviews be deleted?", "Only if they breach Booking's guidelines, and the platform decides. Guests may edit their own review within a limited window after posting."],
      ["Why do reviews arrive in two parts?", "Booking asks separately what the guest liked and disliked. A reply that only thanks the guest for the positive half looks like it was not read."],
      ["Does responding influence Booking ranking?", "Ranking is driven mainly by conversion, availability and score. Replies affect conversion by shaping how a mixed review reads to the next guest."],
      ["How long should a reply be?", "Two to four sentences that name the specific issue and the action taken. Long defensive replies reduce trust rather than build it."],
    ],
    ctaHeading: "Check your AI visibility",
    ctaBody: "See for free whether AI assistants name your property when travellers ask for a recommendation.",
  },
  {
    slug: "ai-for-tiktok-comments",
    tr: "tiktok-yorumlari-icin-yapay-zeka",
    name: "TikTok comments",
    eyebrow: "TikTok · AI",
    title: "AI for TikTok Comments: Replies and Moderation | VoyageRespond",
    description:
      "Handle TikTok comments at video scale: intent classification, short safe reply suggestions, and moderation of spam and abuse from one inbox.",
    h1: "AI for TikTok Comments: Moderation and Reply Suggestions at Scale",
    definition:
      "TikTok comment management with AI means pulling the comments on a business account's videos into one inbox, sorting them by intent, and suggesting short replies suitable for the platform. Volume is the defining problem: a single video can attract thousands of comments, of which only a small share need an answer.",
    steps: [
      ["Connect the account", "A TikTok business account is authorised through the official API."],
      ["Comments are sorted by intent", "Questions, complaints, purchase interest and noise are separated automatically."],
      ["Short replies are suggested", "Three brief options are produced per comment, matched to TikTok's register rather than a formal one."],
      ["You approve", "Replies are published only after a person selects one, which matters where tone is public."],
      ["Spam is grouped", "Repetitive or abusive comments are grouped for bulk handling."],
    ],
    rows: [
      ["Comment volume", "Impossible to read every video", "Sorted and filtered by intent"],
      ["Reply length", "Written by hand", "Short suggestions suited to the platform"],
      ["Purchase questions", "Lost in the feed", "Surfaced first"],
      ["Moderation", "Manual hiding", "Spam and abuse grouped"],
      ["Reporting", "None", "Comment sentiment tracked per video"],
    ],
    faqs: [
      ["Which TikTok accounts can be connected?", "Business accounts authorised through TikTok's official API. Access depends on the app's approval status with TikTok."],
      ["Are replies published automatically?", "No — a person selects the reply. On short-video platforms an unreviewed reply carries more risk than a slow one."],
      ["Which comments deserve a reply?", "Questions, complaints and comments showing purchase intent. Replying to every emoji is not a useful goal."],
      ["Can abusive comments be filtered?", "Abuse and spam are detected and grouped so they can be hidden in bulk instead of one at a time."],
      ["Does replying help a video's reach?", "Engagement is one of the signals TikTok uses for distribution, so timely replies can help indirectly. Nobody can guarantee reach."],
      ["Are direct messages included?", "Comments and direct messages are separate surfaces with separate permissions; this page covers comment handling."],
    ],
    ctaHeading: "Check your AI visibility",
    ctaBody: "See whether ChatGPT, Gemini and Perplexity name your business when people ask for a recommendation.",
  },
  {
    slug: "ai-review-reply-writer",
    tr: "yorumlara-yapay-zeka-ile-cevap-yazma",
    name: "AI review replies",
    eyebrow: "AI reply writing",
    title: "AI Review Reply Writer: How Automated Responses Work | VoyageRespond",
    description:
      "How AI writes review replies: brand voice learned from past responses, replies in the reviewer's language, and a human approval step before publishing.",
    h1: "Writing Review Replies with AI: How It Actually Works",
    definition:
      "An AI review reply writer reads a customer review, identifies its sentiment, intent and language, and produces a response draft in the business's own voice. It differs from a template library in that it references the specific detail the reviewer mentioned. In a well-designed workflow the draft is always approved by a person before publication.",
    steps: [
      ["The review is analysed", "Sentiment, intent, language and the topics mentioned are extracted first."],
      ["Brand voice is applied", "A voice profile built from your past replies sets length, formality and sign-off style."],
      ["Options are drafted", "Several variants are produced so you can pick the register that fits the situation."],
      ["A person approves", "You approve, edit or discard. Nothing reaches the platform unapproved."],
      ["The reply is published", "It goes out to the original channel, and the outcome feeds back into the voice profile."],
    ],
    rows: [
      ["", "Templates", "AI reply drafts"],
      ["Personalisation", "Placeholders filled by hand", "References the detail in the review"],
      ["Language", "One language per template set", "Written in the reviewer's language"],
      ["Consistency", "Depends on who edits", "One voice profile across channels"],
      ["Time per reply", "5-10 minutes", "About 15 seconds to approve"],
    ],
    faqs: [
      ["Can a reader tell a reply was written with AI?", "A generic reply is recognisable whether a human or a model wrote it. What makes a reply convincing is referencing the specific detail from the review, which is exactly what a good draft does."],
      ["Should replies be published automatically?", "For most businesses, no. A suggest-and-approve flow costs a few seconds and prevents the rare bad reply that would otherwise be public."],
      ["How does the system learn our voice?", "It analyses your existing replies, plus the tone settings you choose, and applies them to length, formality and closing style."],
      ["What about reviews in languages we do not speak?", "The draft is written in the reviewer's language, and a translation is shown so you know what you are approving."],
      ["Does AI handle negative reviews well?", "It produces an acknowledgement and a concrete next step, but the operational fact — what actually changed — has to come from you. That sentence is usually the one worth editing."],
      ["Which platforms does this work on?", "Any channel connected to the dashboard, including Google, Booking, TripAdvisor, Expedia, delivery platforms and social comments."],
    ],
    ctaHeading: "Check your AI visibility",
    ctaBody: "Reply quality feeds what AI assistants say about you. See what they currently say — the check is free.",
  },
  {
    slug: "ai-for-facebook-reviews",
    tr: "facebook-yorumlari-icin-yapay-zeka",
    name: "Facebook reviews",
    eyebrow: "Facebook · AI",
    title: "AI for Facebook Reviews and Recommendations | VoyageRespond",
    description:
      "Manage Facebook page recommendations and comments with AI drafts, sentiment labels and one inbox shared with Google and Instagram.",
    h1: "AI for Facebook Reviews and Recommendations",
    definition:
      "Facebook review management with AI covers the recommendations and comments left on a business page: importing them, labelling sentiment and intent, and drafting a reply for each. Facebook uses a recommend/does-not-recommend format rather than star ratings, so replies address the reason given rather than a score.",
    steps: [
      ["Connect the page", "The Facebook page is authorised through the official API alongside your other channels."],
      ["Recommendations are imported", "Existing recommendations and their comment threads are pulled into the inbox."],
      ["Sentiment is labelled", "Recommendations, complaints and questions are separated automatically."],
      ["Drafts are generated", "Replies are written in the reviewer's language and your page's tone."],
      ["You approve and publish", "Replies are posted after approval and tracked in the same reporting as other channels."],
    ],
    rows: [
      ["Inbox", "The page notifications tab", "Facebook beside Google and Instagram"],
      ["Format", "Recommend / does not recommend, answered generically", "Reply addresses the stated reason"],
      ["Tone", "Depends on the page admin on duty", "One shared voice profile"],
      ["Languages", "Single language", "Reply in the reviewer's language"],
      ["Reporting", "None", "Sentiment and topic breakdown"],
    ],
    faqs: [
      ["How do Facebook recommendations differ from star reviews?", "Facebook asks whether someone recommends the business and why, with no star scale. The written reason is what future readers see, so the reply should address it directly."],
      ["Can a recommendation be removed?", "Only if it breaches Facebook's community standards and after Facebook reviews the report. A business cannot remove one itself."],
      ["Should the page turn recommendations off?", "Turning them off removes the negative ones and the positive ones together, and looks evasive to anyone comparing pages. Answering them is usually the better option."],
      ["Are page comments included?", "Comments on posts and on recommendations both arrive in the same inbox, since they raise the same kinds of questions."],
      ["Do Facebook reviews affect Google results?", "They do not feed Google's rating, but the page itself can rank in search, so the visible content matters for anyone researching you."],
      ["Is a Facebook page still worth managing?", "For businesses whose customers use it, yes — an unanswered negative recommendation stays visible for years. If your audience is not there, effort is better spent elsewhere."],
    ],
    ctaHeading: "Check your AI visibility",
    ctaBody: "See for free whether AI assistants mention your business in their recommendations.",
  },
  {
    slug: "ai-for-youtube-comments",
    tr: "youtube-yorumlari-icin-yapay-zeka",
    name: "YouTube comments",
    eyebrow: "YouTube · AI",
    title: "AI for YouTube Comments: Replies and Moderation | VoyageRespond",
    description:
      "Manage YouTube comments with AI: sort by intent, draft replies to genuine questions, and group spam across your whole channel from one inbox.",
    h1: "AI for YouTube Comments: Moderation and Reply Drafts",
    definition:
      "YouTube comment management with AI means collecting the comments across a channel's videos, classifying them by intent, and drafting replies to the ones that warrant an answer. Comments accumulate for years after publication, so a channel's back catalogue usually holds more unanswered questions than its newest upload.",
    steps: [
      ["Connect the channel", "The YouTube channel is authorised through the official API."],
      ["Comments are collected", "Comments across every video, including older uploads, arrive in one inbox."],
      ["Intent is classified", "Product questions, complaints, feedback and spam are separated."],
      ["Drafts are written", "Replies are generated in the commenter's language and the channel's tone."],
      ["Spam is grouped", "Repetitive promotional comments are grouped for bulk removal."],
    ],
    rows: [
      ["Back catalogue", "Older videos go unchecked", "Every video in one inbox"],
      ["Questions", "Buried under general comments", "Surfaced by intent"],
      ["Languages", "Answered in one language", "Reply in the commenter's language"],
      ["Spam", "Removed one by one", "Grouped for bulk action"],
      ["Reporting", "None", "Sentiment tracked per video"],
    ],
    faqs: [
      ["Which comments are worth answering?", "Genuine questions and complaints, especially on videos that still get views. Answering the back catalogue often produces more value than answering the newest upload."],
      ["Are replies published automatically?", "No — you approve each one. Channel replies are public and quotable, so a review step is worth the seconds it costs."],
      ["Can spam be removed in bulk?", "Repetitive promotional and scam comments are grouped so they can be removed together rather than individually."],
      ["Does replying help a video perform?", "Engagement is one of the signals YouTube uses, so replies can help indirectly. No platform promises reach in exchange for replies."],
      ["Can comments be tracked per video?", "Yes. Sentiment and recurring questions are reported per video, which shows where the content itself is unclear."],
      ["Is the channel owner's permission required?", "Yes. The connection uses the channel owner's OAuth authorisation and can be revoked at any time."],
    ],
    ctaHeading: "Check your AI visibility",
    ctaBody: "See whether AI assistants name your business when people ask for a recommendation in your category.",
  },
  {
    slug: "ai-for-hotels-com-reviews",
    tr: "hotels-com-yorumlari-icin-yapay-zeka",
    name: "Hotels.com reviews",
    eyebrow: "Hotels.com · AI",
    title: "AI for Hotels.com Reviews: Replies for Properties | VoyageRespond",
    description:
      "Bring Hotels.com guest reviews into the same inbox as Google, Booking and Expedia, with AI drafts in the guest's language and shared topic reporting.",
    h1: "AI for Hotels.com Reviews: One Inbox With Your Other Channels",
    definition:
      "Hotels.com review management with AI means collecting a property's Hotels.com guest reviews alongside its other distribution channels, drafting a reply in the guest's language, and analysing the topics behind the score. Because Hotels.com sits in the Expedia group, its reviews often overlap with Expedia listings and are best tracked together.",
    steps: [
      ["Match the listing", "Your Hotels.com property is matched and existing reviews are imported."],
      ["Related listings are grouped", "Hotels.com and Expedia reviews for the same property are reported together."],
      ["Topics are extracted", "Rooms, cleanliness, breakfast, staff and value are separated per channel."],
      ["Drafts are written", "Each reply addresses the guest's specific comment in their own language."],
      ["You approve", "Replies are published after approval, and response rate is tracked with your other channels."],
    ],
    rows: [
      ["Channels", "Checked separately from Booking and Google", "One inbox across all channels"],
      ["Expedia overlap", "Counted twice by hand", "Grouped in reporting"],
      ["Guest languages", "Manual translation", "Draft in the guest's language"],
      ["Topic analysis", "Read review by review", "Automatic topic breakdown"],
      ["Multi-property", "Spreadsheets", "Side-by-side comparison"],
    ],
    faqs: [
      ["How do Hotels.com and Expedia reviews relate?", "Both belong to the same group and often describe the same property, so tracking them together prevents the same complaint being counted as two separate trends."],
      ["Should Hotels.com reviews be answered?", "Yes, for the same reason as any OTA: the response is visible to travellers comparing properties, and response rate is part of how engaged a property looks."],
      ["In which language should we reply?", "In the guest's language. On distribution channels the audience is international, and a same-language reply is the difference between attention and a form letter."],
      ["Can reviews be removed?", "Only through the platform's own guideline process. Genuine negative feedback stays published, which is why the reply matters."],
      ["Does this replace the extranet?", "No. Replies are drafted and tracked centrally while the extranet remains the property's contractual channel with the OTA."],
      ["How far back are reviews imported?", "The available history for the listing is imported so topic trends have enough data to compare periods."],
    ],
    ctaHeading: "Check your AI visibility",
    ctaBody: "Travellers ask assistants before they open a booking site. See whether your property is named — for free.",
  },
  {
    slug: "ai-for-trendyol-reviews",
    tr: "trendyol-yorumlari-icin-yapay-zeka",
    name: "Trendyol reviews",
    eyebrow: "Trendyol · AI",
    title: "AI for Trendyol Reviews: Seller Replies and Product Insight | VoyageRespond",
    description:
      "Handle Trendyol product reviews and questions with AI drafts, per-product sentiment tracking, and a shared inbox with your other channels.",
    h1: "AI for Trendyol Reviews: Seller Replies and Product Insight",
    definition:
      "Trendyol review management with AI covers a seller's product reviews and buyer questions: collecting them per product, classifying the issue raised — sizing, quality, delivery, packaging — and drafting a reply. On marketplaces the review score sits at product level, so analysis is only useful when it is broken down by SKU.",
    steps: [
      ["Connect the store", "Your Trendyol seller account is connected and existing product reviews are imported."],
      ["Reviews are grouped by product", "Each SKU gets its own score, topic list and trend."],
      ["Issues are classified", "Sizing, quality, delivery and packaging complaints are separated."],
      ["Drafts are written", "Replies address the specific complaint and, where relevant, the returns process."],
      ["Product decisions follow", "Recurring sizing or packaging complaints are surfaced as product-level actions."],
    ],
    rows: [
      ["Scope", "Store-level score", "Score and topics per product"],
      ["Complaint type", "Read manually", "Sizing, quality, delivery and packaging separated"],
      ["Reply time", "Several minutes per review", "About 15 seconds to approve a draft"],
      ["Buyer questions", "Answered ad hoc", "Tracked in the same inbox"],
      ["Reporting", "Manual export", "Trend per SKU"],
    ],
    faqs: [
      ["Why analyse reviews per product rather than per store?", "A marketplace score is an average across very different products. One badly sized item can drag a store average down while every other SKU performs well."],
      ["Which complaints are most actionable?", "Sizing and packaging, because both are fixable without changing the product. They also tend to drive returns, which cost more than the review does."],
      ["Should sellers reply to product reviews?", "Yes, especially to negative ones, since buyers read the seller response when deciding between similar listings."],
      ["Can buyer questions be handled too?", "Pre-purchase questions arrive in the same inbox and are usually more time-sensitive than reviews, because an unanswered question is a lost sale."],
      ["Can reviews be removed?", "Only through the marketplace's own process for guideline breaches. Genuine complaints remain published."],
      ["Does this work alongside Google reviews?", "Yes. Marketplace reviews and Google reviews feed the same dashboard, which matters for sellers who also have a physical location."],
    ],
    ctaHeading: "Check your AI visibility",
    ctaBody: "See whether AI assistants mention your brand when shoppers ask for a recommendation.",
  },
  {
    slug: "ai-for-yemeksepeti-reviews",
    tr: "yemeksepeti-yorumlari-icin-yapay-zeka",
    name: "Yemeksepeti reviews",
    eyebrow: "Yemeksepeti · AI",
    title: "AI for Yemeksepeti Reviews: Restaurant Replies | VoyageRespond",
    description:
      "Manage Yemeksepeti delivery reviews with AI: separate delivery issues from kitchen issues, reply fast, and compare branches in one dashboard.",
    h1: "AI for Yemeksepeti Reviews: Delivery Feedback That Is Actually Usable",
    definition:
      "Yemeksepeti review management with AI means collecting a restaurant's delivery reviews, separating the complaints the kitchen controls from the ones the courier network controls, and drafting a reply for each. Delivery ratings feed ranking inside the app, so they behave differently from dine-in reviews and need separate tracking.",
    steps: [
      ["Connect the listing", "Each branch listing is matched and its reviews are imported."],
      ["Complaints are split by cause", "Food quality, missing items, packaging, temperature and delivery time are separated."],
      ["Drafts are written", "Replies acknowledge the issue and set out what the restaurant is changing."],
      ["Branches are compared", "Multi-branch operators see which location is behind on which cause."],
      ["Kitchen actions follow", "Recurring packaging or temperature issues become operational changes rather than one-off apologies."],
    ],
    rows: [
      ["Complaint cause", "Kitchen and courier issues mixed together", "Separated automatically"],
      ["Reply speed", "Whenever the branch checks", "Notification and one-tap approval"],
      ["Branches", "One login per listing", "All branches in one inbox"],
      ["Dine-in vs delivery", "Averaged together", "Tracked separately"],
      ["Reporting", "Manual", "Topic trend per branch"],
    ],
    faqs: [
      ["Why separate delivery complaints from kitchen complaints?", "A late courier and a cold dish produce the same one-star rating but need completely different fixes. Mixing them makes the data useless for the kitchen."],
      ["Do delivery reviews affect visibility in the app?", "Rating and order volume both feed placement inside delivery apps, so a falling score reduces orders before anyone notices the reviews themselves."],
      ["Should every delivery review get a reply?", "Reply to all negative ones at minimum. Customers ordering again read recent responses when choosing between nearby restaurants."],
      ["What about issues outside our control?", "Acknowledge the experience without blaming the courier publicly, and describe any change you can make — packaging, sealing, prep timing."],
      ["Can this be compared with dine-in feedback?", "Yes, and it should be. The same kitchen often scores very differently in the two channels, which points to packaging rather than cooking."],
      ["Does it work for multiple branches?", "Every branch listing feeds one inbox with per-branch reporting, which is the point for chains."],
    ],
    ctaHeading: "Check your AI visibility",
    ctaBody: "See for free whether AI assistants name your restaurant when people ask where to order from.",
  },
  {
    slug: "ai-for-airbnb-reviews",
    tr: "airbnb-yorumlari-icin-yapay-zeka",
    name: "Airbnb reviews",
    eyebrow: "Airbnb · AI",
    title: "AI for Airbnb Reviews: Host Replies and Category Scores | VoyageRespond",
    description:
      "Manage Airbnb guest reviews with AI drafts, track the category scores that drive your listing, and handle multiple properties from one dashboard.",
    h1: "AI for Airbnb Reviews: Host Replies and Category Scores",
    definition:
      "Airbnb review management with AI covers a host's guest reviews across listings: importing them, tracking the category scores — cleanliness, accuracy, check-in, communication, location and value — and drafting a public response to each. Airbnb reviews are mutual and time-limited, so response timing is part of the workflow rather than an afterthought.",
    steps: [
      ["Add the listings", "Each listing is matched and its review history is imported."],
      ["Category scores are tracked", "Cleanliness, accuracy, check-in, communication, location and value are followed separately."],
      ["Drafts are written", "Public responses are drafted in the guest's language and the host's tone."],
      ["Respond inside the window", "Responses are prioritised while the review is still recent and visible."],
      ["Compare listings", "Multi-listing hosts see which property is behind on which category."],
    ],
    rows: [
      ["Category scores", "Read from the dashboard", "Tracked as a trend per listing"],
      ["Response timing", "Whenever the host logs in", "Prioritised while the review is recent"],
      ["Guest languages", "One language", "Draft in the guest's language"],
      ["Multiple listings", "Checked one at a time", "All listings in one inbox"],
      ["Recurring issues", "Noticed by feel", "Topic breakdown per listing"],
    ],
    faqs: [
      ["Should hosts respond publicly to reviews?", "A short public response is worth writing for negative and mixed reviews, because future guests read it. Not every five-star review needs one."],
      ["Which category score matters most?", "Cleanliness and accuracy drive the most complaints, and accuracy is the cheapest to fix — it usually means the listing description promises something the property does not deliver."],
      ["Can a review be removed?", "Only if it breaks Airbnb's content policy, and Airbnb decides. Retaliatory reviews can be reported but are not automatically removed."],
      ["Does replying affect search placement?", "Airbnb's ranking is driven by ratings, response rate to enquiries and booking behaviour. Public responses affect how a listing reads rather than the algorithm directly."],
      ["How should hosts handle an unfair review?", "Answer factually and briefly, without arguing. A calm correction reads far better to the next guest than a long rebuttal."],
      ["Does this work for co-hosts and managers?", "Yes. Property managers running several listings get one inbox with per-listing reporting."],
    ],
    ctaHeading: "Check your AI visibility",
    ctaBody: "See whether AI assistants mention your property when travellers ask for recommendations.",
  },
  {
    slug: "ai-for-zomato-reviews",
    tr: "zomato-yorumlari-icin-yapay-zeka",
    name: "Zomato reviews",
    eyebrow: "Zomato · AI",
    title: "AI for Zomato Reviews: Restaurant Replies and Insight | VoyageRespond",
    description:
      "Handle Zomato reviews with AI drafts, separate dining feedback from delivery feedback, and track recurring complaints across every outlet.",
    h1: "AI for Zomato Reviews: Replies and Recurring-Issue Tracking",
    definition:
      "Zomato review management with AI means collecting a restaurant's Zomato reviews, distinguishing dine-in feedback from delivery feedback, and drafting a reply for each. Because Zomato listings show both experiences under one rating, separating them is what makes the underlying feedback usable by the kitchen and the floor team.",
    steps: [
      ["Match the outlet", "Each Zomato listing is matched and its reviews are imported."],
      ["Dine-in and delivery are separated", "The two experiences are tracked as distinct streams under one listing."],
      ["Topics are extracted", "Food, service, wait time, packaging and value are labelled automatically."],
      ["Drafts are written", "Replies name the dish or the moment described and state what changed."],
      ["Outlets are compared", "Groups see which outlet is behind on which topic."],
    ],
    rows: [
      ["Experience type", "Dine-in and delivery averaged together", "Tracked separately"],
      ["Reply time", "Several minutes each", "About 15 seconds to approve"],
      ["Languages", "One language", "Reply in the reviewer's language"],
      ["Multiple outlets", "One login per listing", "All outlets in one inbox"],
      ["Reporting", "Manual", "Topic trend per outlet"],
    ],
    faqs: [
      ["Why separate dine-in and delivery reviews?", "The same kitchen can score well in the dining room and badly on delivery, usually because of packaging or travel time. Averaging them hides the actual problem."],
      ["Should restaurants reply to Zomato reviews?", "Yes, particularly negative ones, since diners comparing nearby restaurants read the responses before ordering or booking."],
      ["How quickly should a reply go out?", "Within a day. Recency matters because the newest reviews and replies are the ones shown at the top of the listing."],
      ["Can Zomato reviews be removed?", "Only via the platform's own reporting process for policy breaches. Genuine criticism remains visible."],
      ["What can be done about repeated wait-time complaints?", "Track them by day and time to see whether they cluster around specific shifts, then staff to the pattern rather than to the average."],
      ["Does this work with Google reviews together?", "Yes. Zomato and Google feed the same dashboard, so a complaint appearing in both is easy to identify as a real operational issue."],
    ],
    ctaHeading: "Check your AI visibility",
    ctaBody: "See for free whether AI assistants name your restaurant when diners ask for a recommendation.",
  },
];

export const geoPlatformEn: GeoPage[] = sources.map((s) => ({
  slug: `platform/${s.slug}`,
  lang: "en",
  alt: `platform/${s.tr}`,
  title: s.title,
  description: s.description,
  eyebrow: s.eyebrow,
  h1: s.h1,
  definition: s.definition,
  stepsHeading: `How AI ${s.name.toLowerCase()} management works`,
  steps: s.steps.map(([title, body]) => ({ title, body })),
  tableHeading: `Managing ${s.name.toLowerCase()} manually vs with VoyageRespond`,
  tableColumns: ["", "Manual", "VoyageRespond"],
  tableRows: s.rows,
  factsHeading: "Coverage and technical details",
  facts: FACTS,
  faqHeading: "Frequently asked questions",
  faqs: s.faqs.map(([question, answer]) => ({ question, answer })),
  ctaHeading: s.ctaHeading,
  ctaBody: s.ctaBody,
}));

export const platformEnSlugs = (): string[] => sources.map((s) => s.slug);
