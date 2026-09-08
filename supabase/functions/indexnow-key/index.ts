// Serves the IndexNow ownership key file at /{key}.txt (32 hex characters).
const HEX32 = /^[a-f0-9]{32}$/i;

Deno.serve((req) => {
  const key = Deno.env.get("INDEXNOW_KEY") ?? "";
  const url = new URL(req.url);
  const requested = (url.pathname.split("/").pop() ?? "").replace(/\.txt$/i, "");

  if (!HEX32.test(key) || requested.toLowerCase() !== key.toLowerCase()) {
    return new Response("Not found", { status: 404 });
  }

  return new Response(key, {
    headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "public, max-age=3600" },
  });
});
