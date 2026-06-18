/**
 * Listing — DB schema + joined images array.
 */
export interface Listing {
  id: string;
  host_id: string;
  title: string;
  slug: string;
  description: string;
  location: string;
  price: number;
  weekend_price: number;
  bedrooms: number;
  bathrooms: number;
  max_guests: number;
  pet_friendly: boolean;
  pool: boolean;
  wifi: boolean;
  parking: boolean;
  ac: boolean;
  bbq: boolean;
  sea_view: boolean;
  mountain_view: boolean;
  latitude: number | null;
  longitude: number | null;
  house_rules: string[];
  is_featured: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  images: string[];
}
