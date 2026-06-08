"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { ActionState } from "@/app/_actions/listings";
import type { AvailabilityStatus } from "@/lib/supabase/types";

export async function upsertAvailabilityAction(
  listingId: string,
  dates: string[],
  status: AvailabilityStatus,
  note: string | null
): Promise<ActionState> {
  if (dates.length === 0) return { error: "No dates selected" };

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
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

  revalidatePath(`/host/chalets/${listingId}/availability`);
  revalidatePath(`/admin/listings/${listingId}/availability`);
  revalidatePath("/chalets");
  return { error: null, success: true };
}
