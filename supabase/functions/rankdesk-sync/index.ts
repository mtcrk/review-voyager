// Public sync endpoint (no auth): overwrites the owned copy of every named item.
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import {
  getSourcePost,
  listSourcePosts,
  serviceClient,
  syncOne,
  type SyncedRow,
} from "../_shared/content-sync.ts";

type HintItem = { slug?: string; kind?: string; updated_at?: string };

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    let hints: HintItem[] = [];
    try {
      const body = (await req.json()) as { items?: HintItem[] } | null;
      if (body && Array.isArray(body.items)) hints = body.items;
    } catch {
      hints = [];
    }

    const db = serviceClient();
    const items: SyncedRow[] = [];
    const errors: { slug: string; error: string }[] = [];

    const slugs = hints.map((h) => h.slug).filter((s): s is string => typeof s === "string" && s.length > 0);

    if (slugs.length > 0) {
      for (const slug of slugs) {
        try {
          const post = await getSourcePost(slug);
          if (!post || !post.slug) throw new Error("item not found upstream");
          items.push(await syncOne(db, post));
        } catch (e) {
          errors.push({ slug, error: (e as Error).message });
        }
      }
    } else {
      const posts = await listSourcePosts(50, 0);
      for (const post of posts) {
        try {
          items.push(await syncOne(db, post));
        } catch (e) {
          errors.push({ slug: post.slug, error: (e as Error).message });
        }
      }
    }

    return json({ synced: items.length, items, ...(errors.length ? { errors } : {}) });
  } catch (e) {
    const message = (e as Error).message ?? "sync failed";
    console.error("sync failed:", message);
    const status = message.includes("API key is not configured") ? 500 : 502;
    return json({ synced: 0, error: message }, status);
  }
});
