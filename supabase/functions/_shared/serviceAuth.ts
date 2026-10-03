// Servis çağrısı tespiti: env'deki anahtarla birebir eşleşme ya da (eski JWT biçimli) service_role anahtarı.
// JWT yolu imzayı Auth Admin API'ye gerçek bir çağrıyla doğrular — sahte token kabul edilmez.
export async function isServiceAuth(auth: string, url: string, serviceKey: string) {
  if (auth === `Bearer ${serviceKey}`) return true;
  const tok = auth.replace(/^Bearer\s+/i, "");
  try {
    const p = JSON.parse(atob(tok.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")));
    if (p?.role !== "service_role") return false;
    const r = await fetch(`${url}/auth/v1/admin/users?per_page=1`, { headers: { apikey: tok, Authorization: `Bearer ${tok}` } });
    return r.ok;
  } catch { return false; }
}
