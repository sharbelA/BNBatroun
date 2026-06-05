/**
 * App-wide constants.
 * Regions, amenity metadata, site config — all in one place.
 */

// ─── Regions ────────────────────────────────────────────────
export const REGIONS = [
  { name: "Batroun", emoji: "🏖️", slug: "batroun" },
  
] as const;

export type RegionSlug = (typeof REGIONS)[number]["slug"];

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

// ─── Site config ────────────────────────────────────────────
export const SITE = {
  name: "Manzeli",
  tagline: "Your home away from home in Lebanon",
  description:
    "Find and book the best chalets, villas, and vacation homes across Lebanon. From Batroun beachfront to mountain retreats.",
  currency: "USD",
  currencySymbol: "$",
  whatsappNumber: "", // set when ready
} as const;
