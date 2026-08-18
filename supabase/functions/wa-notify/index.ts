// deno-lint-ignore-file no-explicit-any
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { sendTemplate } from "../_shared/wa/twilio.ts";
import { oneLine, truncate } from "../_shared/wa/publish.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

const PLATFORM_LABELS: Record<string, string> = {
  google: "Google",
  tripadvisor: "TripAdvisor",
  booking: "Booking.com",
  yandex: "Yandex",
  expedia: "Expedia",
  hotelscom: "Hotels.com",
  tiktok: "TikTok",
  youtube: "YouTube",
};

function shortCode(): string {
  return Math.random().toString(36).slice(2, 8).toUpperCase();
}

/** Local HH:MM in the recipient's timezone. */
function localMinutes(timezone: string | null): number {
  try {
    const parts = new Intl.DateTimeFormat("en-GB", {
      timeZone: timezone || "Europe/Istanbul",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).format(new Date());
    const [h, m] = parts.split(":").map(Number);
    return h * 60 + m;
  } catch {
    return -1;
  }
}

function toMinutes(t: string | null): number | null {
  if (!t) return null;
  const [h, m] = t.split(":").map(Number);
  if (Number.isNaN(h)) return null;
  return h * 60 + (m || 0);
}

function inQuietHours(nowMin: number, start: string | null, end: string | null): boolean {
  const s = toMinutes(start);
  const e = toMinutes(end);
  if (s === null || e === null || nowMin < 0) return false;
  // Overnight ranges (e.g. 22:00 → 08:00) wrap past midnight.
  return s <= e ? nowMin >= s && nowMin < e : nowMin >= s || nowMin < e;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const admin = createClient(SUPABASE_URL, SERVICE_ROLE);

  try {
    const body = await req.json().catch(() => ({}));
    const reviewId = String(body?.review_id ?? "");
    if (!reviewId) return json({ error: "review_id gerekli" }, 400);

    const contentSid = Deno.env.get("WA_TEMPLATE_REVIEW_SID");
    if (!contentSid) {
      console.log("wa-notify: WA_TEMPLATE_REVIEW_SID missing — skipping");
      return json({ ok: true, skipped: "template_not_configured" });
    }

    // a) review + business
    const { data: review } = await admin
      .from("reviews")
      .select("id, business_id, platform, rating, text, reviewer_name, suggested_reply, approved_reply, status")
      .eq("id", reviewId)
      .maybeSingle();

    if (!review) {
      console.log("wa-notify: review not found", reviewId);
      return json({ ok: true, skipped: "review_not_found" });
    }
    if ((review as any).approved_reply) {
      console.log("wa-notify: review already replied", reviewId);
      return json({ ok: true, skipped: "already_replied" });
    }

    const { data: business } = await admin
      .from("businesses")
      .select("id, name")
      .eq("id", (review as any).business_id)
      .maybeSingle();

    if (!business) {
      console.log("wa-notify: business not found for review", reviewId);
      return json({ ok: true, skipped: "business_not_found" });
    }

    // b) verified, active recipients for this business (location-scoped or global)
    const { data: recipients } = await admin
      .from("wa_recipients")
      .select(
        "id, business_id, location_id, phone_e164, min_rating_threshold, daily_cap, quiet_hours_start, quiet_hours_end, timezone",
      )
      .eq("business_id", business.id)
      .eq("status", "verified")
      .eq("is_active", true)
      .is("opt_out_at", null);

    const scoped = (recipients ?? []).filter(
      (r: any) => !r.location_id || r.location_id === (review as any).business_id,
    );

    if (scoped.length === 0) {
      console.log("wa-notify: no eligible recipients for business", business.id);
      return json({ ok: true, skipped: "no_recipients" });
    }

    const rating = Number((review as any).rating ?? 0);
    const platform = String((review as any).platform ?? "google");
    const platformLabel = PLATFORM_LABELS[platform] ?? platform;
    const nowIso = new Date().toISOString();
    const since24h = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    let draft: string | null = (review as any).suggested_reply || null;
    const results: Record<string, string> = {};

    for (const r of scoped as any[]) {
      // c) rating threshold — only notify when rating <= threshold
      const threshold = Number(r.min_rating_threshold ?? 5);
      if (rating > threshold) {
        results[r.id] = "rating_above_threshold";
        continue;
      }

      // d) quiet hours (TODO: queue for later delivery instead of skipping)
      if (inQuietHours(localMinutes(r.timezone), r.quiet_hours_start, r.quiet_hours_end)) {
        results[r.id] = "quiet_hours";
        continue;
      }

      // e) daily cap
      const cap = Number(r.daily_cap ?? 0);
      if (cap > 0) {
        const { count } = await admin
          .from("wa_messages")
          .select("id", { count: "exact", head: true })
          .eq("recipient_id", r.id)
          .eq("direction", "outbound")
          .gte("created_at", since24h);
        if ((count ?? 0) >= cap) {
          results[r.id] = "daily_cap_reached";
          continue;
        }
      }

      // f) idempotency
      const { data: existing } = await admin
        .from("wa_pending_actions")
        .select("id")
        .eq("review_id", reviewId)
        .eq("recipient_id", r.id)
        .eq("status", "pending")
        .maybeSingle();
      if (existing) {
        results[r.id] = "already_pending";
        continue;
      }

      // AI draft — generate once and reuse for every recipient
      if (!draft) {
        try {
          const genRes = await fetch(`${SUPABASE_URL}/functions/v1/generate-reply`, {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${SERVICE_ROLE}` },
            body: JSON.stringify({
              review_id: reviewId,
              business_id: business.id,
              review_text: (review as any).text ?? "",
              reviewer_name: (review as any).reviewer_name ?? "",
              rating,
              platform,
              tone: "friendly",
              language: "auto",
            }),
          });
          if (genRes.ok) {
            const payload = await genRes.json();
            draft = payload?.reply ?? null;
            if (draft) {
              await admin.from("reviews").update({ suggested_reply: draft }).eq("id", reviewId);
            }
          } else {
            console.error("wa-notify: generate-reply failed", genRes.status, await genRes.text());
          }
        } catch (e) {
          console.error("wa-notify: generate-reply error", e instanceof Error ? e.message : e);
        }
      }

      if (!draft) {
        results[r.id] = "no_draft";
        continue;
      }

      const send = await sendTemplate({
        businessId: business.id,
        recipientId: r.id,
        to: r.phone_e164,
        contentSid,
        templateName: "yeni_yorum_bildirimi",
        variables: {
          "1": truncate(business.name ?? "İşletmeniz", 60),
          "2": oneLine(platformLabel),
          "3": String(rating || "-"),
          "4": truncate((review as any).text ?? "(metin yok)", 200),
          "5": truncate(draft, 400),
        },
      });

      if (!send.ok) {
        results[r.id] = `send_failed:${send.errorCode ?? "unknown"}`;
        continue;
      }

      const { error: insErr } = await admin.from("wa_pending_actions").insert({
        business_id: business.id,
        recipient_id: r.id,
        review_id: reviewId,
        short_code: shortCode(),
        draft_reply: draft,
        status: "pending",
        expires_at: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
      });

      if (insErr) {
        // Partial unique index race — another notification already claimed this review.
        console.warn("wa-notify: pending action insert failed:", insErr.message);
        results[r.id] = "pending_insert_conflict";
        continue;
      }

      results[r.id] = "sent";
    }

    console.log("wa-notify:", reviewId, JSON.stringify(results), nowIso);
    return json({ ok: true, results });
  } catch (e) {
    console.error("wa-notify error:", e);
    return json({ error: e instanceof Error ? e.message : String(e) }, 500);
  }
});
