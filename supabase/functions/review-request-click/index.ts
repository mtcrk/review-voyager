import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

Deno.serve(async (req) => {
  const url = new URL(req.url);
  const token = url.searchParams.get("t");
  const action = url.searchParams.get("action");
  if (!token) return new Response("Missing token", { status: 400 });

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const { data: contact } = await supabase
    .from("review_request_contacts")
    .select("id, business_id, status, clicked_at")
    .eq("unsubscribe_token", token)
    .maybeSingle();

  if (!contact) return new Response("Not found", { status: 404 });

  if (action === "unsubscribe") {
    await supabase
      .from("review_request_contacts")
      .update({ status: "unsubscribed" })
      .eq("id", contact.id);
    return new Response(
      `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Unsubscribed</title></head>
<body style="font-family:-apple-system,Segoe UI,Roboto,sans-serif;max-width:520px;margin:80px auto;padding:0 20px;text-align:center;color:#111827;">
<h1 style="font-size:22px;">Aboneliğiniz iptal edildi</h1>
<p style="color:#6b7280;">Bu adrese daha fazla yorum talebi e-postası göndermeyeceğiz.</p>
<p style="color:#6b7280;font-size:14px;">Unsubscribed. You will no longer receive review request emails at this address.</p>
</body></html>`,
      { status: 200, headers: { "Content-Type": "text/html; charset=utf-8" } }
    );
  }

  // Load settings + business for redirect target
  const { data: settings } = await supabase
    .from("review_request_settings")
    .select("review_link")
    .eq("business_id", contact.business_id)
    .maybeSingle();
  const { data: biz } = await supabase
    .from("businesses")
    .select("place_id")
    .eq("id", contact.business_id)
    .maybeSingle();

  const target = settings?.review_link?.trim()
    || (biz?.place_id ? `https://search.google.com/local/writereview?placeid=${biz.place_id}` : null);
  if (!target) return new Response("Review link not configured", { status: 500 });

  // Mark click (do not overwrite unsubscribed)
  if (contact.status !== "unsubscribed") {
    await supabase
      .from("review_request_contacts")
      .update({
        clicked_at: contact.clicked_at || new Date().toISOString(),
        status: "clicked",
      })
      .eq("id", contact.id);
  }

  return new Response(null, { status: 302, headers: { Location: target } });
});