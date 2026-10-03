// Giriş odası yönetimi. Body: { business_id, action: "refresh" | "set", subject_type, competitor_id, source_adapter, room_name|null }
// set + room_name=null → otomatiğe döner (yeniden hesaplanır).
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { isPlatformAdmin } from "../_shared/platformAdmin.ts";
import { applyBaseRoom, refreshBaseRooms } from "../_shared/prices/baseRooms.ts";

const cors = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type" };
const json = (b: unknown, s = 200) => new Response(JSON.stringify(b), { status: s, headers: { ...cors, "Content-Type": "application/json" } });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  try {
    const url = Deno.env.get("SUPABASE_URL")!;
    const admin: any = createClient(url, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const auth = req.headers.get("Authorization") ?? "";
    const uc = createClient(url, Deno.env.get("SUPABASE_ANON_KEY")!, { global: { headers: { Authorization: auth } } });
    const { data: { user } } = await uc.auth.getUser();
    if (!user) return json({ error: "Oturum doğrulanamadı" }, 401);
    const b = await req.json().catch(() => ({}));
    const bid = String(b?.business_id ?? "");
    if (!/^[0-9a-f-]{36}$/i.test(bid)) return json({ error: "business_id gerekli" }, 400);
    const { data: can } = await admin.rpc("user_can_access_business", { _user_id: user.id, _business_id: bid });
    if (!can && !isPlatformAdmin(user.email)) return json({ error: "Bu işletmeye erişiminiz yok" }, 403);

    if (b.action === "refresh") return json({ changed: await refreshBaseRooms(admin, bid) });
    if (b.action !== "set") return json({ error: "Geçersiz işlem" }, 400);
    const st = b.subject_type === "own" ? "own" : "competitor";
    const cid = st === "own" ? null : String(b.competitor_id ?? "");
    const ad = String(b.source_adapter ?? "");
    if (!ad || (st === "competitor" && !cid)) return json({ error: "Eksik alan" }, 400);
    let q = admin.from("price_base_rooms").select("id").eq("business_id", bid).eq("subject_type", st).eq("source_adapter", ad);
    q = cid ? q.eq("competitor_id", cid) : q.is("competitor_id", null);
    const { data: ex } = await q.maybeSingle();
    if (!b.room_name) {
      if (ex) await admin.from("price_base_rooms").delete().eq("id", ex.id);
      return json({ changed: await refreshBaseRooms(admin, bid) });
    }
    const room = String(b.room_name).slice(0, 300);
    if (ex) await admin.from("price_base_rooms").update({ room_name: room, determined_by: "manual" }).eq("id", ex.id);
    else await admin.from("price_base_rooms").insert({ business_id: bid, subject_type: st, competitor_id: cid, source_adapter: ad, room_name: room, determined_by: "manual" });
    await applyBaseRoom(admin, bid, st, cid, ad, room);
    return json({ ok: true });
  } catch (e) {
    console.error(e);
    return json({ error: String((e as Error)?.message ?? e) }, 500);
  }
});
