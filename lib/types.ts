export interface Listing {
  id: string;
  title: string;
  slug: string;
  location: string;
  region: string;
  price_per_night: number;
  currency: string;
  cover_image: string;
  images: string[];
  bedrooms: number;
  bathrooms: number;
  max_guests: number;
  rating: number;
  review_count: number;
  amenities: string[];
  is_featured: boolean;
  host_name: string;
}
