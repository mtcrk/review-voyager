import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Example responses for different scenarios
const exampleResponses = {
  positive_tr: [
    "Harika yorumunuz için çok teşekkür ederiz! Sizinle çalışmak bizim için de keyifli. Tekrar görüşmek üzere! 🙏",
    "Bu güzel sözler için minnettarız. Mutlu müşterilerimiz bizim en büyük motivasyonumuz!",
  ],
  positive_en: [
    "Thank you so much for your wonderful review! We're thrilled you had a great experience. Hope to see you again soon! 🙏",
    "We truly appreciate your kind words. Happy customers like you make what we do worthwhile!",
  ],
  negative_tr: [
    "Yaşadığınız deneyimden dolayı özür dileriz. Geri bildiriminiz bizim için çok değerli. Sorunu çözmek için sizinle iletişime geçmek isteriz.",
    "Beklentilerinizi karşılayamadığımız için üzgünüz. Deneyiminizi iyileştirmek için neler yapabileceğimizi öğrenmek isteriz.",
  ],
  negative_en: [
    "We're sorry to hear about your experience. Your feedback is valuable to us and we'd like to make things right. Please reach out so we can help.",
    "We apologize that we didn't meet your expectations. We'd love to learn how we can improve your experience.",
  ],
  neutral_tr: [
    "Yorumunuz için teşekkür ederiz. Geri bildiriminiz bizim için değerli, gelişmemize katkı sağlıyor.",
    "Zaman ayırıp yorum yaptığınız için teşekkürler. Hizmetimizi geliştirmek için önerilerinizi dikkate alacağız.",
  ],
  neutral_en: [
    "Thank you for your review. Your feedback is valuable and helps us improve our service.",
    "We appreciate you taking the time to share your thoughts. We'll take your suggestions into consideration.",
  ],
};

// Tone descriptions for better prompt engineering
const toneDescriptions = {
  formal: {
    tr: "Profesyonel ve resmi bir dil kullan. Saygılı hitap şekli, açık ve net cümleler.",
    en: "Use professional and formal language. Respectful addressing, clear and concise sentences.",
    examples_tr: ["Sayın müşterimiz,", "Değerli geri bildiriminiz için teşekkür ederiz."],
    examples_en: ["Dear valued customer,", "We appreciate your valuable feedback."],
  },
  friendly: {
    tr: "Samimi ve sıcak bir dil kullan. Kişisel ve yakın hitap, pozitif enerji.",
    en: "Use warm and approachable language. Personal and friendly tone, positive energy.",
    examples_tr: ["Merhaba!", "Çok teşekkür ederiz, bu bizim için çok önemli!"],
    examples_en: ["Hi there!", "Thank you so much, this means a lot to us!"],
  },
  playful: {
    tr: "Eğlenceli ve rahat bir dil kullan. Uygun emojiler ekle, enerjik ol.",
    en: "Use fun and casual language. Add appropriate emojis, be energetic.",
    examples_tr: ["Hey! 👋", "Süpersiniz! 🎉"],
    examples_en: ["Hey there! 👋", "You're awesome! 🎉"],
  },
  empathetic: {
    tr: "Empatik ve anlayışlı bir dil kullan. Müşterinin duygularını anladığını göster.",
    en: "Use empathetic and understanding language. Show you understand the customer's feelings.",
    examples_tr: ["Yaşadığınız durumu anlıyoruz.", "Bu konuda haklısınız."],
    examples_en: ["We understand your situation.", "You're absolutely right about this."],
  },
  grateful: {
    tr: "Minnettarlık ve şükran dolu bir dil kullan. Müşteriye ne kadar değer verdiğini vurgula.",
    en: "Use a grateful and appreciative tone. Emphasize how much you value the customer.",
    examples_tr: ["Bizimle paylaştığınız için minnettarız.", "Desteğiniz bizim için paha biçilmez."],
    examples_en: ["We're grateful you shared this with us.", "Your support is invaluable to us."],
  },
  witty: {
    tr: "Zeki ve espritüel bir dil kullan. Hafif mizah ekle ama saygılı kal.",
    en: "Use witty and clever language. Add light humor while staying respectful.",
    examples_tr: ["Sizi mutlu ettiğimize sevindik! 😉", "Böyle güzel sözler duymak keyif veriyor!"],
    examples_en: ["Glad we could make your day! 😉", "Words like these keep us going!"],
  },
  apologetic: {
    tr: "Özür dileyen ve çözüm odaklı bir dil kullan. Samimi pişmanlık göster.",
    en: "Use an apologetic and solution-focused tone. Show genuine remorse.",
    examples_tr: ["Bu durum için içtenlikle özür dileriz.", "Sizi hayal kırıklığına uğrattığımız için çok üzgünüz."],
    examples_en: ["We sincerely apologize for this situation.", "We're truly sorry for the disappointment."],
  },
  enthusiastic: {
    tr: "Coşkulu ve heyecanlı bir dil kullan. Pozitif enerjiyi yansıt, ünlem işaretleri kullan.",
    en: "Use enthusiastic and excited language. Reflect positive energy with exclamation marks.",
    examples_tr: ["Harika bir yorum! Çok mutluyuz!", "Sizi ağırlamak bizim için büyük keyif!"],
    examples_en: ["What an amazing review! We're thrilled!", "It's an absolute pleasure to serve you!"],
  },
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      review_text, 
      reviewer_name,
      rating, 
      tone = "friendly", 
      language = "TR", 
      summary, 
      issues, 
      praises,
      sentiment,
      business_name,
      custom_instructions 
    } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log("Generating AI reply for review:", { rating, tone, language, sentiment });

    const lang = language.toLowerCase() === "auto" 
      ? (review_text && /[çğıöşüÇĞİÖŞÜ]/.test(review_text) ? "tr" : "en")
      : (language.toLowerCase() === "tr" ? "tr" : "en");
    const toneConfig = toneDescriptions[tone as keyof typeof toneDescriptions] || toneDescriptions.friendly;
    
    // Determine sentiment category
    let sentimentCategory = "neutral";
    if (sentiment?.toLowerCase() === "positive" || rating >= 4) {
      sentimentCategory = "positive";
    } else if (sentiment?.toLowerCase() === "negative" || rating <= 2) {
      sentimentCategory = "negative";
    }
    
    // Get relevant example responses
    const exampleKey = `${sentimentCategory}_${lang}` as keyof typeof exampleResponses;
    const examples = exampleResponses[exampleKey] || [];

    // Build context from analysis
    let analysisContext = "";
    if (summary) {
      analysisContext += `\n📋 Review Summary: ${summary}`;
    }
    if (praises && praises.length > 0) {
      analysisContext += `\n✅ Positive Points: ${praises.join(", ")}`;
    }
    if (issues && issues.length > 0) {
      analysisContext += `\n⚠️ Concerns/Issues: ${issues.join(", ")}`;
    }

    // Build the enhanced system prompt
    const systemPrompt = `You are an expert review response writer for ${business_name || "a business"}. Your task is to generate authentic, personalized responses to customer reviews.

## Language & Tone
- CRITICAL: Detect the language of the original review and reply in THE SAME LANGUAGE. If the review is in Turkish, reply in Turkish. If in English, reply in English. If in German, reply in German. Match the reviewer's language exactly.
- Fallback language hint: ${lang === "tr" ? "TURKISH" : "ENGLISH"}
- Tone: ${tone.toUpperCase()}
- ${lang === "tr" ? toneConfig.tr : toneConfig.en}
- Example phrases: ${(lang === "tr" ? toneConfig.examples_tr : toneConfig.examples_en).join(", ")}

## Response Guidelines

### For ${rating}-star reviews:
${rating >= 4 ? `
- Express genuine gratitude and appreciation
- Acknowledge specific positive points mentioned
- Invite them back / express hope to serve again
- Keep it warm and enthusiastic` : rating >= 3 ? `
- Thank them for their feedback
- Acknowledge both positives and areas for improvement
- Show commitment to better service
- Keep it balanced and constructive` : `
- Begin with a sincere apology
- Acknowledge their specific concerns without being defensive
- Explain how you'll address the issues
- Offer to make things right (contact, compensation, etc.)
- Keep it professional and solution-oriented`}

### Structure:
1. ${reviewer_name ? `Address the reviewer by name (${reviewer_name})` : "Start with a warm greeting"}
2. Thank them for taking the time to review
3. Address specific points from their review
4. ${rating < 3 ? "Offer a solution or next steps" : "Express hope to see them again"}

### IMPORTANT:
- Keep response between 2-4 sentences (40-80 words)
- Be authentic - avoid generic corporate speak
- Reference specific details from their review to show you read it
- ${tone === "playful" ? "Use 1-2 relevant emojis" : "Keep emojis minimal or none"}
- Never start with "Dear Sir/Madam" or similar generic greetings
${custom_instructions ? `\n### Custom Instructions:\n${custom_instructions}` : ""}

## Example Responses (for reference):
${examples.map((ex, i) => `${i + 1}. "${ex}"`).join("\n")}`;

    const userPrompt = `Generate a reply for this ${rating}-star ${sentimentCategory} review:

---
Review by ${reviewer_name || "Customer"}:
"${review_text || "(No review text provided)"}"
---
${analysisContext}

Generate ONLY the response text, no additional commentary.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.7,
        max_tokens: 300,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("AI gateway error:", response.status, error);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required. Please add credits to your workspace." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      throw new Error(`AI gateway error: ${error}`);
    }

    const data = await response.json();
    const generatedReply = data.choices[0].message.content.trim();

    console.log("AI reply generated successfully");

    return new Response(
      JSON.stringify({ 
        reply: generatedReply,
        meta: {
          tone,
          language: lang,
          sentiment: sentimentCategory,
          model: "google/gemini-2.5-flash",
        }
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in generate-reply function:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
