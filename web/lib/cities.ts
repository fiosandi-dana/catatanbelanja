/**
 * The 16 Tier 1 & 2 Indonesian cities Pasar DANA launches in (PRD §P4).
 * Mirrors `supabase/seed.sql` exactly. Keep in sync when adding a city.
 */
export const CITIES = [
  { id: "jakarta", name: "Jakarta" },
  { id: "surabaya", name: "Surabaya" },
  { id: "bandung", name: "Bandung" },
  { id: "medan", name: "Medan" },
  { id: "semarang", name: "Semarang" },
  { id: "makassar", name: "Makassar" },
  { id: "bekasi", name: "Bekasi" },
  { id: "tangerang", name: "Tangerang" },
  { id: "depok", name: "Depok" },
  { id: "bogor", name: "Bogor" },
  { id: "yogyakarta", name: "Yogyakarta" },
  { id: "malang", name: "Malang" },
  { id: "denpasar", name: "Denpasar" },
  { id: "balikpapan", name: "Balikpapan" },
  { id: "pekanbaru", name: "Pekanbaru" },
  { id: "padang", name: "Padang" },
] as const;

export type CityId = (typeof CITIES)[number]["id"];

export const DEFAULT_CITY_ID: CityId = "bekasi";

export function isValidCityId(id: string): id is CityId {
  return CITIES.some((c) => c.id === id);
}

export function cityNameOf(id: string): string {
  return CITIES.find((c) => c.id === id)?.name ?? "Bekasi";
}
