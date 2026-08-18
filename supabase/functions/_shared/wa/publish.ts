// deno-lint-ignore-file no-explicit-any
// Shared reply publishing used by wa-webhook (WhatsApp approve/edit flows).
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

export type PublishResult =
  | { ok: true; published: boolean; message: string }
  | { ok: false; message: string };

type Admin = ReturnType<typeof createClient>;

/** Collapse newlines/tabs and repeated spaces — WhatsApp template variables reject \n (Twilio 63021). */
export function oneLine(v: string | null | undefined): string {
  return (v ?? "").replace(/[\r\n\t]+/g, " ").replace(/\s{2,}/g, " ").trim();
}

export function truncate(v: string, max: number): string {
  const s = oneLine(v);
  return s.length > max ? `${s.slice(0, max - 1)}…` : s;
}

async function refreshAccessToken(refreshToken: string): Promise<string> {
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: Deno.env.get("GOOGLE_BUSINESS_CLIENT_ID")!,
      client_secret: Deno.env.get("GOOGLE_BUSINESS_CLIENT_SECRET")!,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
  });
  if (!res.ok) throw new Error(`Google token yenilenemedi: ${res.status}`);
  return (await res.json()).access_token;
}

/**
 * Publish a reply for a review.
 * Google → official API. Other platforms (TripAdvisor/Yandex/...) have no reply API:
 * the reply is stored and marked "ready to send" for the panel.
 */
export async function publishReply(
  admin: Admin,
  reviewId: string,
  replyText: string,
): Promise<PublishResult> {
  const { data: review, error } = await admin
    .from("reviews")
    .select("id, business_id, platform, google_review_name, posted_at, businesses(google_connected, name)")
    .eq("id", reviewId)
    .maybeSingle();
  if (error || !review) return { ok: false, message: "Yorum bulunamadı." };

  const platform = (review as any).platform ?? "google";
  const biz = (review as any).businesses ?? {};
  const canUseGoogleApi =
    platform === "google" && !!biz.google_connected && !!(review as any).google_review_name;

  if (canUseGoogleApi) {
    const { data: creds } = await admin
      .from("business_credentials")
      .select("google_refresh_token")
      .eq("business_id", (review as any).business_id)
      .maybeSingle();

    if (!creds?.google_refresh_token) {
      return { ok: false, message: "Google bağlantısı bulunamadı. Panelden tekrar bağlayın." };
    }

    try {
      const token = await refreshAccessToken(creds.google_refresh_token);
      const res = await fetch(
        `https://mybusiness.googleapis.com/v4/${(review as any).google_review_name}/reply`,
        {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
          body: JSON.stringify({ comment: replyText }),
        },
      );
      if (!res.ok) {
        const body = await res.text();
        console.error(`Google reply failed [${res.status}]: ${body}`);
        await admin
          .from("reviews")
          .update({
            google_reply_status: "failed",
            google_reply_error_message: `Google API ${res.status}`,
          })
          .eq("id", reviewId);
        return { ok: false, message: `Google cevabı kabul etmedi (hata ${res.status}). Tekrar deneyebilirsiniz.` };
      }
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      console.error("Google reply error:", message);
      return { ok: false, message: "Google'a bağlanırken hata oluştu. Tekrar deneyebilirsiniz." };
    }

    await admin
      .from("reviews")
      .update({
        approved_reply: replyText,
        reply_source: "whatsapp_google_api",
        google_reply_status: "sent",
        status: "replied",
        replied_at: new Date().toISOString(),
      })
      .eq("id", reviewId);

    return { ok: true, published: true, message: "Cevabınız Google'da yayınlandı." };
  }

  // No public reply API for this platform — mark as ready to send.
  await admin
    .from("reviews")
    .update({
      approved_reply: replyText,
      reply_source: "whatsapp_manual",
      status: "ready_to_send",
    })
    .eq("id", reviewId);

  const label = platform === "google" ? "Google" : platform;
  return {
    ok: true,
    published: false,
    message: `Cevabınız kaydedildi. ${label} otomatik yayın desteklemediği için panelde "gönderilmeye hazır" olarak işaretlendi.`,
  };
}
