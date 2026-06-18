/**
 * Admin queries — require authenticated admin user.
 * Used in admin dashboard pages.
 */

import { createClient } from "@/lib/supabase/server";
import type { Listing, Profile } from "@/lib/supabase/types";

export type AdminListing = Listing & {
  host_name: string;
};

export async function getAdminListings(): Promise<AdminListing[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("listings")
    .select("*, profiles!listings_host_id_fkey(name)")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[getAdminListings]", error.message);
    return [];
  }

  return (data ?? []).map((row: Record<string, unknown>) => ({
    ...(row as Listing),
    host_name:
      (row.profiles as { name: string } | null)?.name ?? "Unknown",
  }));
}

export async function getAdminListingById(
  id: string
): Promise<AdminListing | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("listings")
    .select("*, profiles!listings_host_id_fkey(name)")
    .eq("id", id)
    .single();

  if (error) {
    console.error("[getAdminListingById]", error.message);
    return null;
  }

  return {
    ...(data as Listing),
    host_name:
      (data.profiles as { name: string } | null)?.name ?? "Unknown",
  };
}

export async function getHosts(): Promise<
  Pick<Profile, "id" | "name" | "role">[]
> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("profiles")
    .select("id, name, role")
    .in("role", ["host", "admin"])
    .order("name");

  if (error) {
    console.error("[getHosts]", error.message);
    return [];
  }

  return (data ?? []) as Pick<Profile, "id" | "name" | "role">[];
}

export type HostWithListingCount = Profile & { listing_count: number };

export async function getHostsWithListingCounts(): Promise<
  HostWithListingCount[]
> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("profiles")
    .select("*, listings(count)")
    .eq("role", "host")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[getHostsWithListingCounts]", error.message);
    return [];
  }

  return (data ?? []).map((row: Record<string, unknown>) => ({
    ...(row as Profile),
    listing_count:
      (row.listings as { count: number }[] | null)?.[0]?.count ?? 0,
  }));
}
