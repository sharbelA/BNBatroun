/**
 * Listing queries.
 * Server-side data fetching with automatic mock-data fallback
 * when Supabase isn't configured yet.
 *
 * Usage:
 *   import { getListings, getListingBySlug } from "@/lib/supabase/queries/listings";
 *   const featured = await getListings({ featured: true });
 *   const listing = await getListingBySlug("seafront-stone-villa-batroun");
 */

import { Listing } from "@/lib/types";
import { mockListings } from "@/lib/mock-data";

// ─── Helpers ────────────────────────────────────────────────

const isSupabaseConfigured =
  !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
  !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

async function getSupabase() {
  const { createServerClient } = await import("@/lib/supabase/server");
  return createServerClient();
}

// ─── Queries ────────────────────────────────────────────────

interface GetListingsOptions {
  featured?: boolean;
  region?: string;
  limit?: number;
}

export async function getListings(
  options: GetListingsOptions = {}
): Promise<Listing[]> {
  const { featured, region, limit } = options;

  // Use mock data when Supabase isn't configured
  if (!isSupabaseConfigured) {
    let results = [...mockListings];
    if (featured) results = results.filter((l) => l.is_featured);
    if (region) results = results.filter((l) => l.region === region);
    if (limit) results = results.slice(0, limit);
    return results;
  }

  const supabase = await getSupabase();
  let query = supabase.from("listings").select("*");

  if (featured) query = query.eq("is_featured", true);
  if (region) query = query.eq("region", region);
  if (limit) query = query.limit(limit);

  query = query.order("created_at", { ascending: false });

  const { data, error } = await query;

  if (error) {
    console.error("[getListings]", error.message);
    return [];
  }

  return (data as Listing[]) ?? [];
}

export async function getListingBySlug(
  slug: string
): Promise<Listing | null> {
  if (!isSupabaseConfigured) {
    return mockListings.find((l) => l.slug === slug) ?? null;
  }

  const supabase = await getSupabase();
  const { data, error } = await supabase
    .from("listings")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error) {
    console.error("[getListingBySlug]", error.message);
    return null;
  }

  return data as Listing;
}
