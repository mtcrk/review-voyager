// Streams an adopted image from the site's own private object storage so that
// /images/content/<slug>/<file> is publicly readable from this site's domain.
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { serviceClient } from "../_shared/content-sync.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const url = new URL(req.url);
  const marker = "/content-image/";
  const idx = url.pathname.indexOf(marker);
  const objectKey = decodeURIComponent(
    idx === -1 ? (url.searchParams.get("path") ?? "") : url.pathname.slice(idx + marker.length),
  );

  if (!objectKey || objectKey.includes("..")) {
    return new Response("Not found", { status: 404, headers: corsHeaders });
  }

  try {
    const db = serviceClient();
    const { data, error } = await db.storage.from("content-images").download(objectKey);
    if (error || !data) {
      return new Response("Not found", { status: 404, headers: corsHeaders });
    }
    return new Response(data.stream(), {
      headers: {
        ...corsHeaders,
        "Content-Type": data.type || "image/jpeg",
        "Cache-Control": "public, max-age=86400",
      },
    });
  } catch (e) {
    console.error("image serve failed:", (e as Error).message);
    return new Response("Not found", { status: 404, headers: corsHeaders });
  }
});
