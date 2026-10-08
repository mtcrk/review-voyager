// Fiyat kaynağı kapatma anahtarı (price_source_settings). Yalnız service role okur/yazar.
export const ADAPTER_LABELS: Record<string, string> = {
  etstur: "ETS Tur", jollytur: "Jolly Tur", tatilsepeti: "Tatil Sepeti", booking: "Booking.com", serpapi: "Google Hotels",
};

/** Kapalı (enabled=false) adapter id'leri. Tablo okunamazsa hiçbir kaynak kapatılmaz. */
export async function loadDisabledSources(admin: any): Promise<Set<string>> {
  try {
    const { data, error } = await admin.from("price_source_settings").select("adapter, enabled");
    if (error) { console.error("price_source_settings okunamadı", error); return new Set(); }
    return new Set((data ?? []).filter((r: any) => r.enabled === false).map((r: any) => String(r.adapter)));
  } catch (e) { console.error("price_source_settings okunamadı", e); return new Set(); }
}
