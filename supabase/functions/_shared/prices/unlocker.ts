// Bright Data Web Unlocker yardımcısı. GET/POST, gövde ve header destekler.
// Her başarılı/başarısız Unlocker çağrısı ayrı sayılır (maliyet takibi için).

export type UnlockerRequest = {
  url: string;
  method?: "GET" | "POST";
  body?: string;
  headers?: Record<string, string>;
  country?: string;
};

// Bright Data Web Unlocker: ~1.5 USD / 1000 istek (tahmini).
export const UNLOCKER_COST_USD = 0.0015;

export function unlockerAvailable() {
  return !!Deno.env.get("BRIGHTDATA_API_KEY") && !!Deno.env.get("BRIGHTDATA_UNLOCKER_ZONE");
}

export async function unlockerFetch(r: UnlockerRequest, timeoutMs = 45_000): Promise<{ status: number; text: string }> {
  const key = Deno.env.get("BRIGHTDATA_API_KEY");
  const zone = Deno.env.get("BRIGHTDATA_UNLOCKER_ZONE");
  if (!key || !zone) throw new Error("Bright Data yapılandırılmamış");
  const payload: Record<string, unknown> = { zone, url: r.url, format: "raw", country: r.country ?? "tr" };
  if (r.method && r.method !== "GET") payload.method = r.method;
  if (r.body != null) payload.body = r.body;
  if (r.headers) payload.headers = r.headers;
  const res = await fetch("https://api.brightdata.com/request", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(timeoutMs),
  });
  return { status: res.status, text: await res.text() };
}
