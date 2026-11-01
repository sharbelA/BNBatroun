"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

type Result = { error: string | null };

export async function addPhotoAction(listingId: string, url: string, altText: string): Promise<Result> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { data: profile } = (await supabase.from("profiles").select("role").eq("id", user.id).single()) as { data: { role: string } | null };
  if (!profile || profile.role !== "admin") return { error: "Admin access required" };

  const { data: existing } = await supabase.from("listing_images").select("display_order").eq("listing_id", listingId).order("display_order", { ascending: false }).limit(1);
  const nextOrder = existing && existing.length > 0 ? (existing[0].display_order ?? 0) + 1 : 1;

  const { error } = await supabase.from("listing_images").insert({
    listing_id: listingId, url, display_order: nextOrder, alt_text: altText || null,
  });
  if (error) return { error: error.message };

  revalidatePath(`/admin/listings/${listingId}/photos`);
  revalidatePath("/");
  return { error: null };
}

export async function deletePhotoAction(imageId: string, storagePath: string, listingId: string): Promise<Result> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { data: profile } = (await supabase.from("profiles").select("role").eq("id", user.id).single()) as { data: { role: string } | null };
  if (!profile || profile.role !== "admin") return { error: "Admin access required" };

  const { data: image } = await supabase.from("listing_images").select("url").eq("id", imageId).single();

  const { error } = await supabase.from("listing_images").delete().eq("id", imageId);
  if (error) return { error: error.message };

  // A copied listing (e.g. daily -> seasonal) shares the same file, so only remove
  // it from storage once no other listing still points at it.
  if (storagePath) {
    let stillUsed = false;
    if (image?.url) {
      const { count } = await supabase
        .from("listing_images")
        .select("id", { count: "exact", head: true })
        .eq("url", image.url);
      stillUsed = (count ?? 0) > 0;
    }
    if (!stillUsed) await supabase.storage.from("listing-photos").remove([storagePath]);
  }

  revalidatePath(`/admin/listings/${listingId}/photos`);
  revalidatePath("/");
  return { error: null };
}

export async function reorderPhotosAction(listingId: string, orderedIds: string[]): Promise<Result> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  for (let i = 0; i < orderedIds.length; i++) {
    const { error } = await supabase.from("listing_images").update({ display_order: i + 1 }).eq("id", orderedIds[i]);
    if (error) return { error: error.message };
  }

  revalidatePath(`/admin/listings/${listingId}/photos`);
  revalidatePath("/");
  return { error: null };
}
