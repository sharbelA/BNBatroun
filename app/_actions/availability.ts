"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { ActionState } from "@/app/_actions/listings";
import type { AvailabilityStatus } from "@/lib/supabase/types";

/**
 * Set availability status for dates. Used to block dates or mark as booked.
 * "Available" is implicit — it means no DB row exists for that date.
 */
export async function upsertAvailabilityAction(
  listingId: string,
  dates: string[],
  status: AvailabilityStatus,
  note: string | null
): Promise<ActionState> {
  if (dates.length === 0) return { error: "No dates selected" };

  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { data: profile } = (await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single()) as { data: { role: string } | null };

  if (!profile) return { error: "Profile not found" };

  if (profile.role !== "admin") {
    const { data: listing } = await supabase
      .from("listings")
      .select("host_id")
      .eq("id", listingId)
      .single();

    if (!listing || listing.host_id !== user.id) {
      return { error: "You can only manage availability for your own chalets" };
    }
    if (status === "booked") {
      return { error: "Only admins can mark dates as booked" };
    }

    // Block hosts from overwriting admin-set booked dates
    const { data: bookedRows } = await supabase
      .from("availability")
      .select("date")
      .eq("listing_id", listingId)
      .eq("status", "booked")
      .in("date", dates);

    if (bookedRows && bookedRows.length > 0) {
      return { error: "Booked dates can only be changed by admin" };
    }
  }

  const rows = dates.map((date) => ({
    listing_id: listingId,
    date,
    status,
    note,
  }));

  const { error } = await supabase
    .from("availability")
    .upsert(rows, { onConflict: "listing_id,date" });

  if (error) return { error: error.message };

  await revalidateListing(supabase, listingId);
  return { error: null, success: true };
}

/**
 * Clear availability entries for given dates (deletes rows → becomes implicitly available).
 * Used to unblock dates.
 */
export async function clearAvailabilityAction(
  listingId: string,
  dates: string[]
): Promise<ActionState> {
  if (dates.length === 0) return { error: "No dates selected" };

  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { data: profile } = (await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single()) as { data: { role: string } | null };

  if (!profile) return { error: "Profile not found" };

  if (profile.role !== "admin") {
    const { data: listing } = await supabase
      .from("listings")
      .select("host_id")
      .eq("id", listingId)
      .single();

    if (!listing || listing.host_id !== user.id) {
      return { error: "You can only manage availability for your own chalets" };
    }

    // Hosts can't clear booked dates
    const { data: bookedRows } = await supabase
      .from("availability")
      .select("date")
      .eq("listing_id", listingId)
      .eq("status", "booked")
      .in("date", dates);

    if (bookedRows && bookedRows.length > 0) {
      return { error: "Booked dates can only be changed by admin" };
    }
  }

  const { error } = await supabase
    .from("availability")
    .delete()
    .eq("listing_id", listingId)
    .in("date", dates);

  if (error) return { error: error.message };

  await revalidateListing(supabase, listingId);
  return { error: null, success: true };
}

/* ─── Helper ─── */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function revalidateListing(supabase: any, listingId: string) {
  const { data: listing } = await supabase
    .from("listings")
    .select("slug")
    .eq("id", listingId)
    .single();
  if (listing?.slug) revalidatePath(`/chalets/${listing.slug}`);
  revalidatePath(`/host/chalets/${listingId}/availability`);
  revalidatePath(`/admin/listings/${listingId}/availability`);
  revalidatePath("/chalets");
}
