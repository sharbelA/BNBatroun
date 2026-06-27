"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function reorderListingsAction(orderedIds: string[]) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { data: profile } = (await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single()) as { data: { role: string } | null };

  if (!profile || profile.role !== "admin") return { error: "Admin access required" };

  // Update each listing's display_order
  for (let i = 0; i < orderedIds.length; i++) {
    const { error } = await supabase
      .from("listings")
      .update({ display_order: i + 1 })
      .eq("id", orderedIds[i]);

    if (error) return { error: error.message };
  }

  revalidatePath("/");
  revalidatePath("/chalets");
  return { error: null, success: true };
}
