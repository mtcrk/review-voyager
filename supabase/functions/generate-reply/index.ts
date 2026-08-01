import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// ---- Gold, aspect-rich examples (short) ----
const goldExamples: Record<string, string[]> = {
  positive_tr: [
    "Merhaba Ayşe Hanım, Deniz manzaralı odamızın keyfini çıkarmanıza ve resepsiyondaki Mehmet'in ilgisinden bahsetmenize çok sevindik. Kahvaltıdaki menemen için de ayrı teşekkürler — şefimize ilettik. Bir sonraki tatilinizde sizi tekrar ağırlamak isteriz.",
    "Sinan Bey, düğün organizasyonunuzda ekibimizin proaktif tutumundan bahsetmeniz bizim için çok değerli. Özellikle Zeynep'in son dakika masa düzenlemesini övmeniz, ona en güzel motivasyon olacak. Yıl dönümünüzde tekrar buluşmak dileğiyle.",
  ],
  positive_en: [
    "Hi Sarah, thank you for calling out Marco at the front desk and the sea-view breakfast terrace — both are things we work hard on, so it means a lot. We'd love to have you back for the truffle season next autumn.",
    "James, we're delighted the deep-tissue massage with Elena hit the spot after your hike. We've shared your note with the spa team and hope to welcome you back on your next Cappadocia trip.",
  ],
  negative_tr: [
    "Merhaba Cem Bey, 3. kattaki klimanın çalışmaması ve check-in'de yaşadığınız beklemenin tatilinizi gölgelediğini görmek bizi üzdü. Bu iki nokta, olmaması gereken şeylerdi. Konuyu ilgili birim müdürümüzle bugün detaylı ele alıyoruz; sizinle doğrudan görüşüp deneyiminizi dinlemek isteriz — {contact} üzerinden bize ulaşırsanız kaldığımız yerden devam ederiz.",
  ],
  negative_en: [
    "Hi Michael, hearing that the shower drain was clogged and that your late check-out request wasn't handled properly is exactly the kind of experience we work to prevent. This isn't the standard we hold ourselves to. I'd like to hear the details directly — please reach me at {contact} and I'll personally follow up. — {signature}",
  ],
  neutral_tr: [
    "Merhaba Elif Hanım, kahvaltıdaki çeşitliliği beğenmenize sevindik; oda yalıtımı için verdiğiniz geri bildirim ise önümüzdeki bakım planımıza doğrudan giriyor. Detayları paylaşmak isterseniz {contact} açık.",
  ],
  neutral_en: [
    "Thanks David — great to hear the rooftop bar worked for you, and your note on the elevator wait is fair; it's already on our upgrade list for this quarter.",
  ],
};

const toneDescriptions: Record<string, { tr: string; en: string }> = {
  formal: { tr: "Profesyonel, resmi, saygılı.", en: "Professional, formal, respectful." },
  friendly: { tr: "Sıcak, samimi, kişisel.", en: "Warm, friendly, personal." },
  playful: { tr: "Eğlenceli, hafif, uygunsa 1 emoji.", en: "Playful, light, at most one emoji." },
  empathetic: { tr: "Empatik, anlayışlı, duygusal zeka yüksek.", en: "Empathetic and understanding." },
  grateful: { tr: "Minnettar, teşekkür odaklı.", en: "Grateful and appreciative." },
  witty: { tr: "Zeki, hafif espritüel ama saygılı.", en: "Witty but respectful." },
  apologetic: { tr: "Özür dileyen, çözüm odaklı.", en: "Apologetic and solution-focused." },
  enthusiastic: { tr: "Coşkulu, pozitif enerjili.", en: "Enthusiastic and upbeat." },
};

function detectLang(text: string, hint: string): "tr" | "en" {
  if (hint && hint.toLowerCase() !== "auto") return hint.toLowerCase() === "tr" ? "tr" : "en";
  return text && /[çğıöşüÇĞİÖŞÜ]/.test(text) ? "tr" : "en";
}

function sentimentCategory(rating: number, sentiment?: string): "positive" | "negative" | "neutral" {
  if (sentiment?.toLowerCase() === "positive" || rating >= 4) return "positive";
  if (sentiment?.toLowerCase() === "negative" || rating <= 2) return "negative";
  return "neutral";
}

function pickModel({ category, textLen, brandVoice, customInstructions }: {
  category: string; textLen: number; brandVoice: any; customInstructions?: string;
}): string {
  if (category === "negative" || textLen > 400 || customInstructions || brandVoice?.high_touch) {
    return "google/gemini-2.5-pro";
  }
  return "google/gemini-2.5-flash";
}

async function callAi(model: string, systemPrompt: string, userPrompt: string, maxTokens: number, apiKey: string) {
  const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.75,
      max_tokens: maxTokens,
    }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Response(JSON.stringify({ error: `AI error ${res.status}`, detail: err }), { status: res.status });
  }
  const json = await res.json();
  return (json.choices?.[0]?.message?.content || "").trim();
}

async function runQa(draft: string, params: {
  reviewText: string; lang: string; forbidden: string[]; apiKey: string;
}) {
  const { reviewText, lang, forbidden, apiKey } = params;
  const sys = `You are a strict QA reviewer for customer review responses. Evaluate the DRAFT REPLY against the ORIGINAL REVIEW and return ONLY valid JSON matching:
{"references_specific_detail":boolean,"generic_opening":boolean,"correct_language":boolean,"contains_forbidden_phrase":boolean,"promises_compensation":boolean,"notes":"short reason"}
- references_specific_detail: true if reply cites a concrete detail from the review (person, dish, room, specific issue).
- generic_opening: true ONLY if the opening is a cliché like "Thank you for your wonderful review" / "Harika yorumunuz için teşekkürler" with no personalization.
- correct_language: true if reply language matches expected: ${lang.toUpperCase()}.
- contains_forbidden_phrase: true if it uses any of: ${JSON.stringify(forbidden || [])}.
- promises_compensation: true if it promises/implies refund, compensation, free stay, or admits legal fault.
No markdown, no code fences, JSON only.`;
  const user = `ORIGINAL REVIEW:\n"""${reviewText || ""}"""\n\nDRAFT REPLY:\n"""${draft}"""`;
  try {
    const raw = await callAi("google/gemini-2.5-flash", sys, user, 300, apiKey);
    const cleaned = raw.replace(/```json|```/g, "").trim();
    const start = cleaned.indexOf("{");
    const end = cleaned.lastIndexOf("}");
    if (start === -1 || end === -1) return null;
    return JSON.parse(cleaned.slice(start, end + 1));
  } catch (_e) {
    return null;
  }
}

function buildSystemPrompt(opts: {
  lang: "tr" | "en";
  langForced?: boolean;
  tone: string;
  category: string;
  rating: number;
  reviewer?: string;
  businessName?: string;
  city?: string;
  platform?: string;
  brandVoice: any;
  customInstructions?: string;
  recentOpenings: string[];
  gold: string[];
}) {
  const {
    lang, langForced, tone, category, rating, reviewer, businessName, city, platform,
    brandVoice, customInstructions, recentOpenings, gold,
  } = opts;
  const langName = lang === "tr" ? "TURKISH (Türkçe)" : "ENGLISH";
  const languageRule = langForced
    ? `4. Write the ENTIRE reply in ${langName}, regardless of the language the guest wrote in. No other language, no translations, no bilingual output.`
    : `4. Reply STRICTLY in the reviewer's language. Fallback hint: ${lang.toUpperCase()}.`;
  const toneCfg = toneDescriptions[tone] || toneDescriptions.friendly;
  const signature = brandVoice?.signature_name
    ? `${brandVoice.signature_name}${brandVoice.signature_role ? ", " + brandVoice.signature_role : ""}`
    : "";
  const contact = brandVoice?.contact_channel || "";
  const seoOn = platform === "google" && brandVoice?.seo_optimized !== false;

  const negativeBlock = `NEGATIVE-REVIEW SERVICE-RECOVERY PLAYBOOK (rating ${rating}):
- Open with a sincere, SPECIFIC apology that names the actual issue (not blanket).
- Never defensive. Never dispute the guest's account publicly.
- NEVER promise or imply compensation, refunds, upgrades, free stays, or admit legal fault.
- Invite them to a private channel: ${contact || "(no contact set — say 'directly via our contact page')"}.
- Sign from a named person: ${signature || "(no signature set — sign as 'Guest Relations Team')"}.
- Close with a forward-looking commitment to improvement.`;

  const positiveNeutralBlock = `TONE FOR ${category.toUpperCase()} (rating ${rating}):
- Warm, ${category === "positive" ? "grateful and specific" : "balanced and constructive"}.
- Acknowledge concrete points; invite them back or thank them for the feedback.`;

  return `You are an enterprise-grade review response writer for ${businessName || "the business"}${city ? " in " + city : ""}. Craft a reply that reads as if written by an experienced Guest Relations Manager, not a template.

## HARD REQUIREMENTS (non-negotiable)
1. The reply MUST reference at least one concrete, specific detail from the guest's review (person named, dish, room/location, specific complaint or praise). If nothing concrete is present, reference the specific rating experience — never a generic "great review".
2. NEVER open with a generic thank-you cliché ("Thank you for your wonderful review", "Harika yorumunuz için çok teşekkür ederiz", "Dear valued customer", etc.). Open with the reviewer's name or a specific detail.
3. Vary sentence structure and length. No template feel.
${languageRule}
5. Do NOT use these forbidden phrases: ${JSON.stringify(brandVoice?.forbidden_phrases || [])}.
6. Do NOT reuse or paraphrase these recent opening sentences from this business:
${recentOpenings.map((o, i) => `   ${i + 1}. "${o}"`).join("\n") || "   (none)"}

## STYLE
- Tone: ${tone.toUpperCase()} — ${lang === "tr" ? toneCfg.tr : toneCfg.en}
- Length: ${category === "negative" ? "80-140 words" : "40-90 words"}.
- ${tone === "playful" ? "Up to 1 relevant emoji." : "No emojis unless tone demands it."}
${signature ? `- Sign the reply with: "— ${signature}" on a new line at the end.` : ""}
${brandVoice?.brand_values ? `- Reflect these brand values subtly: ${brandVoice.brand_values}` : ""}
${seoOn && businessName ? `- LOCAL SEO (Google review): weave the business name "${businessName}"${city ? " and location \"" + city + "\"" : ""} naturally ONCE. Never keyword-stuff. It must read naturally.` : ""}

## PLAYBOOK
${category === "negative" ? negativeBlock : positiveNeutralBlock}

${customInstructions ? `## CUSTOM INSTRUCTIONS\n${customInstructions}\n` : ""}

## GOLD EXAMPLES (style reference only — DO NOT COPY):
${gold.map((g, i) => `${i + 1}. ${g}`).join("\n\n")}

Return ONLY the reply text. No preamble, no quotes, no markdown.`;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body = await req.json();
    const {
      review_text, reviewText: reviewTextAlt, reviewer_name, rating, tone = "friendly",
      language = "TR", summary, issues, praises, sentiment,
      business_name, custom_instructions,
      business_id, platform,
    } = body;
    const reviewText = review_text ?? reviewTextAlt ?? "";

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    // Load brand voice + recent openings server-side
    let brandVoice: any = {};
    let businessName = business_name || "";
    let city = "";
    let recentOpenings: string[] = [];
    if (business_id) {
      try {
        const supabase = createClient(
          Deno.env.get("SUPABASE_URL")!,
          Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
        );
        const { data: biz } = await supabase
          .from("businesses")
          .select("name, city, brand_voice")
          .eq("id", business_id)
          .maybeSingle();
        if (biz) {
          brandVoice = biz.brand_voice || {};
          businessName = businessName || biz.name || "";
          city = biz.city || "";
        }
        const { data: recent } = await supabase
          .from("reviews")
          .select("approved_reply, suggested_reply")
          .eq("business_id", business_id)
          .not("approved_reply", "is", null)
          .order("replied_at", { ascending: false })
          .limit(5);
        recentOpenings = (recent || [])
          .map((r: any) => (r.approved_reply || r.suggested_reply || "").split(/[.!?\n]/)[0].trim())
          .filter((s: string) => s.length > 0)
          .slice(0, 5);
      } catch (e) {
        console.log("brand_voice/recent lookup failed", (e as Error).message);
      }
    }

    const lang = detectLang(reviewText, language);
    const category = sentimentCategory(rating, sentiment);
    const goldKey = `${category}_${lang}`;
    const gold = goldExamples[goldKey] || [];
    const model = pickModel({ category, textLen: reviewText.length, brandVoice, customInstructions: custom_instructions });
    const maxTokens = category === "negative" ? 600 : 300;
    const seoOptimized = platform === "google" && brandVoice?.seo_optimized !== false;

    const analysisCtx = [
      summary ? `Summary: ${summary}` : "",
      praises?.length ? `Positives: ${praises.join(", ")}` : "",
      issues?.length ? `Concerns: ${issues.join(", ")}` : "",
    ].filter(Boolean).join("\n");

    const systemPrompt = buildSystemPrompt({
      lang, tone, category, rating, reviewer: reviewer_name, businessName, city, platform,
      brandVoice, customInstructions: custom_instructions, recentOpenings, gold,
    });
    const userPrompt = `Generate a reply for this ${rating}-star ${category} review.
---
Reviewer: ${reviewer_name || "Guest"}
Review: "${reviewText || "(no text)"}"
---
${analysisCtx}

Return ONLY the reply text.`;

    console.log("generate-reply", {
      model, category, lang, textLen: reviewText.length, business_id: !!business_id,
      brand_voice_set: Object.keys(brandVoice || {}).length > 0, platform,
    });

    let draft = "";
    try {
      draft = await callAi(model, systemPrompt, userPrompt, maxTokens, LOVABLE_API_KEY);
    } catch (e) {
      if (e instanceof Response) return new Response(await e.text(), { status: e.status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      throw e;
    }

    // QA pass
    let qa: any = null;
    let regenerated = false;
    try {
      qa = await runQa(draft, {
        reviewText, lang,
        forbidden: brandVoice?.forbidden_phrases || [],
        apiKey: LOVABLE_API_KEY,
      });
      const failed = qa && (
        !qa.references_specific_detail ||
        qa.generic_opening ||
        !qa.correct_language ||
        qa.contains_forbidden_phrase ||
        qa.promises_compensation
      );
      if (failed) {
        const reasons: string[] = [];
        if (!qa.references_specific_detail) reasons.push("did not reference a specific detail from the review");
        if (qa.generic_opening) reasons.push("used a generic thank-you opening — start with the reviewer's name or a specific detail");
        if (!qa.correct_language) reasons.push(`replied in wrong language (must be ${lang.toUpperCase()})`);
        if (qa.contains_forbidden_phrase) reasons.push("used a forbidden phrase");
        if (qa.promises_compensation) reasons.push("promised/implied compensation — remove any such wording");
        const retryPrompt = userPrompt + `\n\nPREVIOUS ATTEMPT FAILED QA. Fix these issues: ${reasons.join("; ")}. Regenerate.`;
        console.log("qa regenerate", { reasons });
        const second = await callAi(model, systemPrompt, retryPrompt, maxTokens, LOVABLE_API_KEY);
        if (second) {
          draft = second;
          regenerated = true;
          try {
            qa = await runQa(draft, { reviewText, lang, forbidden: brandVoice?.forbidden_phrases || [], apiKey: LOVABLE_API_KEY }) || qa;
          } catch (_) {}
        }
      }
    } catch (e) {
      console.log("qa failed, returning draft", (e as Error).message);
    }

    return new Response(
      JSON.stringify({
        reply: draft,
        meta: {
          tone,
          language: lang,
          sentiment: category,
          model,
          qa: qa ? { ...qa, regenerated, quality_checked: true } : { quality_checked: false },
          seo_optimized: seoOptimized,
        },
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("generate-reply error", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
