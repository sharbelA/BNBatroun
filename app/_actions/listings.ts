"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

// ─── Helpers ────────────────────────────────────────────────

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

const AMENITY_FIELDS = [
  "wifi",
  "pool",
  "parking",
  "ac",
  "bbq",
  "sea_view",
  "mountain_view",
  "pet_friendly",
] as const;

function parseFormData(formData: FormData) {
  const title = formData.get("title") as string;
  const slug =
    (formData.get("slug") as string)?.trim() || slugify(title);

  const houseRulesRaw = (formData.get("house_rules") as string) ?? "";
  const house_rules = houseRulesRaw
    .split("\n")
    .map((r) => r.trim())
    .filter(Boolean);

  const amenities: Record<string, boolean> = {};
  for (const key of AMENITY_FIELDS) {
    amenities[key] = formData.get(key) === "on";
  }

  return {
    title,
    slug,
    internal_name: (formData.get("internal_name") as string)?.trim() || null,
    description: formData.get("description") as string,
    location: (formData.get("location") as string) || "Batroun",
    price: Math.round(parseInt(formData.get("price") as string, 10)),
    weekend_price: Math.round(parseInt(formData.get("weekend_price") as string, 10)),
    bedrooms: parseInt(formData.get("bedrooms") as string) || 1,
    bathrooms: parseInt(formData.get("bathrooms") as string) || 1,
    max_guests: parseInt(formData.get("max_guests") as string) || 2,
    latitude: formData.get("latitude")
      ? parseFloat(formData.get("latitude") as string)
      : null,
    longitude: formData.get("longitude")
      ? parseFloat(formData.get("longitude") as string)
      : null,
    house_rules,
    is_active: formData.get("is_active") === "on",
    is_featured: formData.get("is_featured") === "on",
    ...amenities,
  };
}

// ─── Create ─────────────────────────────────────────────────

export type ActionState = { error: string | null; success?: boolean; message?: string; generatedPassword?: string };

export async function createListingAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const supabase = await createClient();

  // Verify admin role
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { data: profile } = (await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single()) as { data: { role: string } | null };

  if (!profile || profile.role !== "admin") {
    return { error: "Admin access required" };
  }

  const hostId = (formData.get("host_id") as string) || user.id;
  const fields = parseFormData(formData);

  if (!fields.slug) {
    return { error: "A URL slug is required. Auto-generation failed (title may contain only non-Latin characters). Please type a slug manually, e.g. \"my-chalet\"." };
  }
  if (!Number.isInteger(fields.price) || fields.price < 1) {
    return { error: "Weekday price must be a positive whole number (e.g. 60)." };
  }
  if (!Number.isInteger(fields.weekend_price) || fields.weekend_price < 1) {
    return { error: "Weekend price must be a positive whole number (e.g. 80)." };
  }

  const { error } = await supabase.from("listings").insert({
    host_id: hostId,
    ...fields,
  });

  if (error) {
    if (error.code === "23505") {
      return { error: `Slug "${fields.slug}" already exists. Choose a different one.` };
    }
    return { error: error.message };
  }

  revalidatePath("/admin/listings");
  revalidatePath("/");
  redirect("/admin/listings");
}

// ─── Update ─────────────────────────────────────────────────

export async function updateListingAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const id = formData.get("id") as string;
  if (!id) return { error: "Missing listing ID" };

  // Check permissions: admin can edit any, host can edit own
  const { data: profile } = (await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single()) as { data: { role: string } | null };

  if (!profile) return { error: "Profile not found" };

  if (profile.role !== "admin") {
    // Host — verify ownership
    const { data: listing } = await supabase
      .from("listings")
      .select("host_id")
      .eq("id", id)
      .single();

    if (!listing || listing.host_id !== user.id) {
      return { error: "You can only edit your own chalets" };
    }
  }

  const fields = parseFormData(formData);

  if (!fields.slug) {
    return { error: "A URL slug is required. Auto-generation failed (title may contain only non-Latin characters). Please type a slug manually, e.g. \"my-chalet\"." };
  }
  if (!Number.isInteger(fields.price) || fields.price < 1) {
    return { error: "Weekday price must be a positive whole number (e.g. 60)." };
  }
  if (!Number.isInteger(fields.weekend_price) || fields.weekend_price < 1) {
    return { error: "Weekend price must be a positive whole number (e.g. 80)." };
  }

  // Only admins may reassign host_id
  const newHostId =
    profile.role === "admin"
      ? (formData.get("host_id") as string) || undefined
      : undefined;

  const updatePayload = newHostId
    ? { ...fields, host_id: newHostId }
    : fields;

  const { error } = await supabase
    .from("listings")
    .update(updatePayload)
    .eq("id", id);

  if (error) {
    if (error.code === "23505") {
      return { error: `Slug "${fields.slug}" already exists.` };
    }
    return { error: error.message };
  }

  revalidatePath("/admin/listings");
  revalidatePath(`/chalets/${fields.slug}`);
  revalidatePath("/");

  // Include host name in success message when reassignment happened
  if (newHostId) {
    const { data: hostProfile } = await supabase
      .from("profiles")
      .select("name")
      .eq("id", newHostId)
      .single();
    const hostName = (hostProfile as { name: string } | null)?.name;
    if (hostName) {
      return { error: null, success: true, message: `Chalet reassigned to ${hostName}.` };
    }
  }

  return { error: null, success: true, message: "Changes saved successfully." };
}

// ─── Delete ─────────────────────────────────────────────────

export async function deleteListingAction(
  id: string
): Promise<ActionState> {
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

  if (!profile || profile.role !== "admin") {
    return { error: "Only admins can delete chalets" };
  }

  const { error } = await supabase.from("listings").delete().eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/admin/listings");
  revalidatePath("/");
  redirect("/admin/listings");
}

// ─── Toggle active/featured ─────────────────────────────────

export async function toggleListingFieldAction(
  id: string,
  field: "is_active" | "is_featured",
  value: boolean
): Promise<ActionState> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase
    .from("listings")
    .update({ [field]: value })
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/admin/listings");
  revalidatePath("/");
  return { error: null, success: true };
}
