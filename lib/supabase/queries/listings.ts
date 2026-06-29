import { Listing } from "@/lib/types";
import { AMENITY_FILTER_KEYS, type AmenityFilterKey } from "@/lib/constants";
import type {
  Listing as DbListing,
  ListingImage,
  ListingRoom,
  Availability,
  Profile,
} from "@/lib/supabase/types";

export type ListingPageData = {
  listing: DbListing;
  images: ListingImage[];
  rooms: ListingRoom[];
  availability: Availability[];
  host: Profile | null;
};

const isSupabaseConfigured =
  !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
  !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

async function getSupabase() {
  const { createServerClient } = await import("@/lib/supabase/server");
  return createServerClient();
}

type ImageRow = { url: string; display_order: number };

function toListing(row: DbListing & { listing_images?: ImageRow[] }): Listing {
  const images = (row.listing_images ?? [])
    .sort((a, b) => a.display_order - b.display_order)
    .map((i) => i.url);
  // Strip internal_name: this helper is used only by public queries whose results
  // reach client components (ListingCard). Nulling here prevents the value from
  // being serialized into the browser payload.
  return { ...row, images, weekend_price: row.weekend_price ?? row.price, internal_name: null };
}

export async function getListings(options: { featured?: boolean; limit?: number } = {}): Promise<Listing[]> {
  if (!isSupabaseConfigured) return [];
  const supabase = await getSupabase();
  let query = supabase
    .from("listings")
    .select("*, listing_images(url, display_order)")
    .eq("is_active", true)
    .not("slug", "is", null)
    .neq("slug", "");
  if (options.featured) query = query.eq("is_featured", true);
  if (options.limit) query = query.limit(options.limit);
  query = query.order("display_order", { ascending: true }).order("created_at", { ascending: false });

  const { data, error } = await query;
  if (error) { console.error("[getListings]", error.message); return []; }
  return (data ?? []).map((row) => toListing(row as DbListing & { listing_images: ImageRow[] }));
}

export async function getListingBySlug(slug: string): Promise<Listing | null> {
  if (!isSupabaseConfigured) return null;
  const supabase = await getSupabase();
  const { data, error } = await supabase
    .from("listings")
    .select("*, listing_images(url, display_order)")
    .eq("slug", slug)
    .eq("is_active", true)
    .single();
  if (error) { console.error("[getListingBySlug]", error.message); return null; }
  return toListing(data as DbListing & { listing_images: ImageRow[] });
}

// ─── Browse filters ─────────────────────────────────────────

export type ListingFilters = {
  amenities?: AmenityFilterKey[];
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number; // 4 means "4+"
  maxGuests?: number;
  area?: string; // matches the `location` column
  search?: string; // title search
};

export async function getFilteredListings(
  filters: ListingFilters
): Promise<Listing[]> {
  if (!isSupabaseConfigured) return [];
  const supabase = await getSupabase();

  let query = supabase
    .from("listings")
    .select("*, listing_images(url, display_order)")
    .eq("is_active", true)
    .not("slug", "is", null)
    .neq("slug", "");

  for (const key of filters.amenities ?? []) {
    if (AMENITY_FILTER_KEYS.includes(key)) query = query.eq(key, true);
  }
  if (filters.minPrice !== undefined) query = query.gte("price", filters.minPrice);
  if (filters.maxPrice !== undefined) query = query.lte("price", filters.maxPrice);
  if (filters.bedrooms !== undefined) {
    query =
      filters.bedrooms >= 4
        ? query.gte("bedrooms", 4)
        : query.eq("bedrooms", filters.bedrooms);
  }
  if (filters.maxGuests !== undefined) query = query.gte("max_guests", filters.maxGuests);
  if (filters.area) query = query.eq("location", filters.area);
  if (filters.search) query = query.ilike("title", `%${filters.search}%`);

  query = query.order("display_order", { ascending: true }).order("created_at", { ascending: false });

  const { data, error } = await query;
  if (error) { console.error("[getFilteredListings]", error.message); return []; }
  return (data ?? []).map((row) => toListing(row as DbListing & { listing_images: ImageRow[] }));
}

export async function getActiveSlugs(): Promise<{ slug: string; updated_at: string }[]> {
  if (!isSupabaseConfigured) return [];
  const supabase = await getSupabase();
  const { data, error } = await supabase
    .from("listings")
    .select("slug, updated_at")
    .eq("is_active", true);

  if (error) { console.error("[getActiveSlugs]", error.message); return []; }
  return (data ?? []) as { slug: string; updated_at: string }[];
}

export type HostListing = DbListing & { cover_image: string | null };

export type HostListingDetail = Pick<
  DbListing,
  "id" | "host_id" | "title" | "internal_name" | "location"
>;

export async function getHostListingById(
  listingId: string,
  hostId: string
): Promise<HostListingDetail | null> {
  if (!isSupabaseConfigured) return null;
  const supabase = await getSupabase();
  const { data, error } = await supabase
    .from("listings")
    .select("id, host_id, title, internal_name, location")
    .eq("id", listingId)
    .eq("host_id", hostId)
    .single();

  if (error) {
    console.error("[getHostListingById]", error.message);
    return null;
  }
  return data as HostListingDetail;
}

export async function getHostListings(hostId: string): Promise<HostListing[]> {
  if (!isSupabaseConfigured) return [];
  try {
    const supabase = await getSupabase();
    const { data, error } = await supabase
      .from("listings")
      .select("*, listing_images(url, display_order)")
      .eq("host_id", hostId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[getHostListings] supabase error:", error.message, error);
      return [];
    }

    return (data ?? []).map((row) => {
      const listing = row as DbListing & { listing_images?: ImageRow[] };
      const images = (listing.listing_images ?? []).sort(
        (a, b) => a.display_order - b.display_order
      );
      return { ...listing, cover_image: images[0]?.url ?? null };
    });
  } catch (err: unknown) {
    console.error("[getHostListings] unexpected throw:", err);
    return [];
  }
}

export async function getListingAvailabilityWindow(
  listingId: string
): Promise<Availability[]> {
  if (!isSupabaseConfigured) return [];
  const supabase = await getSupabase();

  const from = new Date();
  from.setDate(1);
  const to = new Date(from);
  to.setMonth(to.getMonth() + 3);

  const { data, error } = await supabase
    .from("availability")
    .select("*")
    .eq("listing_id", listingId)
    .gte("date", from.toISOString().slice(0, 10))
    .lte("date", to.toISOString().slice(0, 10));

  if (error) {
    console.error("[getListingAvailabilityWindow]", error.message);
    return [];
  }

  return (data ?? []) as Availability[];
}

export async function getListingFull(slug: string): Promise<ListingPageData | null> {
  if (!isSupabaseConfigured) return null;
  const supabase = await getSupabase();

  const { data: listing, error } = await supabase
    .from("listings")
    .select("*, listing_images(*)")
    .eq("slug", slug)
    .eq("is_active", true)
    .single();
  if (error || !listing) return null;

  const images = ((listing as Record<string, unknown>).listing_images as ListingImage[] ?? [])
    .sort((a, b) => a.display_order - b.display_order);

  const from = new Date(); from.setDate(1);
  const to = new Date(from); to.setMonth(to.getMonth() + 3);

  const [roomsRes, availRes, hostRes] = await Promise.all([
    supabase.from("listing_rooms").select("*").eq("listing_id", listing.id),
    supabase.from("availability").select("*").eq("listing_id", listing.id).gte("date", from.toISOString().slice(0, 10)).lte("date", to.toISOString().slice(0, 10)),
    supabase.from("profiles").select("*").eq("id", listing.host_id).single(),
  ]);

  return {
    listing: listing as DbListing,
    images,
    rooms: (roomsRes.data ?? []) as ListingRoom[],
    availability: (availRes.data ?? []) as Availability[],
    host: (hostRes.data ?? null) as Profile | null,
  };
}
