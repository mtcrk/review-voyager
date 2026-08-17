/**
 * Frontend-only mapping of the closed `ci_topics` taxonomy to hotel departments.
 * No migration, no schema change — pure presentation grouping.
 */

export const DEPARTMENTS = [
  "food",
  "room",
  "cleanliness",
  "staff",
  "frontdesk",
  "facilities",
  "location",
  "value",
  "comfort",
  "other",
] as const;

export type DepartmentKey = (typeof DEPARTMENTS)[number];

export const DEPARTMENT_LABELS: Record<DepartmentKey, string> = {
  food: "Yemek & İçecek",
  room: "Oda",
  cleanliness: "Temizlik & Kat Hizmetleri",
  staff: "Personel & Hizmet",
  frontdesk: "Ön Büro & Check-in",
  facilities: "Tesis & Havuz & Spa",
  location: "Konum & Ulaşım",
  value: "Fiyat & Değer",
  comfort: "Gürültü & Konfor",
  other: "Diğer",
};

/** topic_id -> department. Unmapped topics fall back to "other". */
const TOPIC_DEPARTMENT: Record<string, DepartmentKey> = {
  // Yemek & İçecek
  breakfast: "food",
  restaurant: "food",
  bar: "food",
  drinks: "food",
  food_quality: "food",
  food_variety: "food",
  portion_size: "food",
  dietary_options: "food",

  // Oda
  room_quality: "room",
  room_size: "room",
  room_modernity: "room",
  bathroom: "room",
  ac: "room",

  // Temizlik & Kat Hizmetleri
  room_cleanliness: "cleanliness",
  bathroom_cleanliness: "cleanliness",
  facility_cleanliness: "cleanliness",
  public_areas_cleanliness: "cleanliness",

  // Personel & Hizmet
  staff_friendliness: "staff",
  professionalism: "staff",
  problem_resolution: "staff",
  response_speed: "staff",
  wait_time: "staff",
  multilingual_support: "staff",
  service_consistency: "staff",
  communication_clarity: "staff",
  stylist_skill: "staff",
  doctor_skill: "staff",
  follow_up: "staff",
  treatment_outcome: "staff",

  // Ön Büro & Check-in
  checkin_speed: "frontdesk",
  checkout_speed: "frontdesk",
  booking_ease: "frontdesk",
  appointment_ease: "frontdesk",
  photo_accuracy: "frontdesk",

  // Tesis & Havuz & Spa
  pool: "facilities",
  spa: "facilities",
  gym: "facilities",
  parking: "facilities",
  elevators: "facilities",
  equipment_quality: "facilities",
  business_facilities: "facilities",
  workspace_quality: "facilities",
  kids_activities: "facilities",
  family_friendliness: "facilities",
  wifi: "facilities",
  eco_practices: "facilities",
  ev_charging: "facilities",
  product_quality: "facilities",

  // Konum & Ulaşım
  accessibility: "location",
  transportation: "location",
  nearby_attractions: "location",
  view: "location",

  // Fiyat & Değer
  overall_value: "value",
  price_perception: "value",
  pricing_transparency: "value",
  hidden_costs: "value",

  // Gürültü & Konfor
  noise: "comfort",
  noise_level_venue: "comfort",
  bed_comfort: "comfort",
  ambiance: "comfort",
  design: "comfort",
};

export function departmentOf(topicId: string): DepartmentKey {
  return TOPIC_DEPARTMENT[topicId] ?? "other";
}

export function departmentLabel(key: DepartmentKey): string {
  return DEPARTMENT_LABELS[key];
}

/** Sentiment (-1..1) -> 0-100 index, same scale as the reputation index. */
export function sentimentToIndex100(sentiment: number): number {
  return Math.max(0, Math.min(100, ((sentiment + 1) / 2) * 100));
}