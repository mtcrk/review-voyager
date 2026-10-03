// Platform yöneticileri PLATFORM_ADMIN_EMAILS secret'ından (virgülle ayrılmış) okunur; kodda e-posta yok.
export function isPlatformAdmin(email: string | null | undefined): boolean {
  if (!email) return false;
  const list = (Deno.env.get("PLATFORM_ADMIN_EMAILS") ?? "").split(",").map((s) => s.trim().toLowerCase()).filter(Boolean);
  return list.includes(email.toLowerCase());
}
