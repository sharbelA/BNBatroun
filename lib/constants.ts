/**
 * App-wide constants.
 * Regions, amenity metadata, site config — all in one place.
 */

// ─── Regions ────────────────────────────────────────────────
export const REGIONS = [
  { name: "Batroun", emoji: "🏖️", slug: "batroun" },
  
] as const;

export type RegionSlug = (typeof REGIONS)[number]["slug"];

// ─── Batroun sub-areas ──────────────────────────────────────
// Used for location filtering within the Batroun district.
export const BATROUN_AREAS = [
  { name: "Batroun City", slug: "batroun-city", emoji: "🏛️" },
  { name: "Kfar Abida", slug: "kfar-abida", emoji: "🌊" },
  { name: "Hamat", slug: "hamat", emoji: "⛰️" },
  { name: "Msaylha", slug: "msaylha", emoji: "🏰" },
  { name: "Thoum", slug: "thoum", emoji: "🌿" },
  { name: "Kfour", slug: "kfour", emoji: "🏘️" },
  { name: "Rachana", slug: "rachana", emoji: "🎨" },
  { name: "Hardine", slug: "hardine", emoji: "🌲" },
  { name: "Douma", slug: "douma", emoji: "🏔️" },
  { name: "Smar Jbeil", slug: "smar-jbeil", emoji: "🌳" },
  { name: "Tannourine", slug: "tannourine", emoji: "❄️" },
  { name: "Edde", slug: "edde", emoji: "🏖️" },
  { name: "Deria", slug: "deria", emoji: "🌅" },
  { name: "Halta", slug: "halta", emoji: "🌿" },
  { name: "Koubba", slug: "koubba", emoji: "🏘️" },
  { name: "Other", slug: "other", emoji: "📍" },
] as const;

export type AreaSlug = (typeof BATROUN_AREAS)[number]["slug"];
export const AREA_NAMES = BATROUN_AREAS.map((a) => a.name);

// ─── Amenity labels ─────────────────────────────────────────
// Maps amenity keys to display labels and optional emoji.
// Used for filters, listing details, and search.
export const AMENITIES: Record<string, { label: string; emoji: string }> = {
  pool: { label: "Pool", emoji: "🏊" },
  wifi: { label: "WiFi", emoji: "📶" },
  ac: { label: "AC", emoji: "❄️" },
  heating: { label: "Heating", emoji: "🔥" },
  parking: { label: "Parking", emoji: "🅿️" },
  bbq: { label: "BBQ", emoji: "🍖" },
  fireplace: { label: "Fireplace", emoji: "🪵" },
  kitchen: { label: "Kitchen", emoji: "🍳" },
  "sea-view": { label: "Sea View", emoji: "🌊" },
  "mountain-view": { label: "Mountain View", emoji: "⛰️" },
  garden: { label: "Garden", emoji: "🌳" },
  balcony: { label: "Balcony", emoji: "🌅" },
  rooftop: { label: "Rooftop", emoji: "🏙️" },
  historic: { label: "Historic", emoji: "🏛️" },
  hiking: { label: "Hiking", emoji: "🥾" },
};

// ─── Browse filter amenities ────────────────────────────────
// Maps to boolean columns on the `listings` table — used by the
// chalets browse page filter pills (client-safe, no Supabase imports).
export const AMENITY_FILTER_KEYS = [
  "pet_friendly",
  "pool",
  "sea_view",
  "mountain_view",
  "wifi",
  "parking",
  "ac",
  "bbq",
] as const;

export type AmenityFilterKey = (typeof AMENITY_FILTER_KEYS)[number];

export const AMENITY_FILTER_LABELS: Record<AmenityFilterKey, string> = {
  pet_friendly: "Pet Friendly",
  pool: "Pool",
  sea_view: "Sea View",
  mountain_view: "Mountain View",
  wifi: "WiFi",
  parking: "Parking",
  ac: "AC",
  bbq: "BBQ",
};

// ─── Site config ────────────────────────────────────────────
export const SITE = {
  name: "BNBatroun",
  tagline: "Your home away from home in Lebanon",
  description:
    "Find and book the best chalets, villas, and vacation homes across Lebanon. From Batroun beachfront to mountain retreats.",
  currency: "USD",
  currencySymbol: "$",
  whatsappNumber: "", // set when ready
} as const;
