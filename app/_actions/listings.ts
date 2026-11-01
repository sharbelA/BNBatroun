"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  LISTING_TYPE_META,
  PRICE_PERIODS,
  PROPERTY_KINDS,
  parseListingType,
} from "@/lib/constants";

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

  const listing_type = parseListingType(formData.get("listing_type"));
  const price = Math.round(parseInt(formData.get("price") as string, 10));
  const areaRaw = parseInt(formData.get("area_sqm") as string, 10);
  const periodRaw = formData.get("price_period") as string;
  const kindRaw = formData.get("property_kind") as string;

  return {
    title,
    slug,
    listing_type,
    internal_name: (formData.get("internal_name") as string)?.trim() || null,
    description: formData.get("description") as string,
    location: (formData.get("location") as string) || "Batroun",
    price,
    // Seasonal / sale rows have no weekend rate; the column is NOT NULL so mirror price.
    weekend_price:
      listing_type === "daily"
        ? Math.round(parseInt(formData.get("weekend_price") as string, 10))
        : price,
    price_period:
      listing_type === "seasonal" && PRICE_PERIODS.some((p) => p.value === periodRaw)
        ? periodRaw
        : listing_type === "seasonal"
          ? "month"
          : null,
    property_kind:
      listing_type === "sale" && PROPERTY_KINDS.some((k) => k.value === kindRaw)
        ? kindRaw
        : null,
    area_sqm: listing_type !== "daily" && Number.isInteger(areaRaw) && areaRaw > 0 ? areaRaw : null,
    bedrooms: parseInt(formData.get("bedrooms") as string) || 1,
    bathrooms: parseInt(formData.get("bathrooms") as string) || 1,
    max_guests: parseInt(formData.get("max_guests") as string) || 2,
    base_guests: parseInt(formData.get("base_guests") as string) || 2,
    price_per_extra_guest: parseFloat(formData.get("price_per_extra_guest") as string) || 0,
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

function validatePrices(fields: {
  listing_type: string;
  price: number;
  weekend_price: number;
}): string | null {
  if (!Number.isInteger(fields.price) || fields.price < 1) {
    if (fields.listing_type === "sale") return "Asking price must be a positive whole number (e.g. 250000).";
    if (fields.listing_type === "seasonal") return "Rent must be a positive whole number (e.g. 1500).";
    return "Weekday price must be a positive whole number (e.g. 60).";
  }
  if (!Number.isInteger(fields.weekend_price) || fields.weekend_price < 1) {
    return "Weekend price must be a positive whole number (e.g. 80).";
  }
  return null;
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
  const priceError = validatePrices(fields);
  if (priceError) return { error: priceError };

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
  revalidatePath("/admin/dashboard");
  revalidatePath("/");
  revalidatePath(LISTING_TYPE_META[fields.listing_type].publicPath);
  redirect(`/admin/listings?type=${fields.listing_type}`);
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

  // The listing type is fixed after creation, so the stored value decides how to
  // interpret the form (a tampered hidden field can't turn a chalet into a sale).
  const { data: existing } = await supabase
    .from("listings")
    .select("listing_type")
    .eq("id", id)
    .single();
  if (!existing) return { error: "Listing not found" };
  formData.set("listing_type", existing.listing_type ?? "daily");

  const { listing_type, ...fields } = parseFormData(formData);

  if (!fields.slug) {
    return { error: "A URL slug is required. Auto-generation failed (title may contain only non-Latin characters). Please type a slug manually, e.g. \"my-chalet\"." };
  }
  const priceError = validatePrices({ listing_type, ...fields });
  if (priceError) return { error: priceError };

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

  const publicPath = LISTING_TYPE_META[listing_type].publicPath;
  revalidatePath("/admin/listings");
  revalidatePath("/admin/dashboard");
  revalidatePath(`${publicPath}/${fields.slug}`);
  revalidatePath(publicPath);
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

// ─── Copy between daily and seasonal ────────────────────────

export type CopyListingResult = { error: string | null; id?: string };

type RentalType = "daily" | "seasonal";

async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { supabase, error: "Not authenticated" } as const;

  const { data: profile } = (await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single()) as { data: { role: string } | null };
  if (!profile || profile.role !== "admin") {
    return { supabase, error: "Admin access required" } as const;
  }
  return { supabase, error: null } as const;
}

/**
 * Copies a listing (fields + photo rows) between the daily and seasonal
 * sections, in either direction. Properties for sale are intentionally not
 * part of this. The copy is created inactive so the price can be set before
 * it goes live. Photo files are shared, not re-uploaded.
 */
export async function copyListingAction(
  sourceId: string,
  targetType: RentalType
): Promise<CopyListingResult> {
  if (targetType !== "daily" && targetType !== "seasonal") {
    return { error: "Invalid target section" };
  }

  const { supabase, error: authError } = await requireAdmin();
  if (authError) return { error: authError };

  const { data: source, error: sourceError } = await supabase
    .from("listings")
    .select("*")
    .eq("id", sourceId)
    .single();
  if (sourceError || !source) return { error: "Listing not found" };

  const sourceType = source.listing_type ?? "daily";
  if (sourceType === "sale") {
    return { error: "Properties for sale can't be copied to other sections." };
  }
  if (sourceType === targetType) {
    return { error: `This listing is already in the ${targetType} section.` };
  }

  const {
    id: _id,
    created_at: _createdAt,
    updated_at: _updatedAt,
    display_order: _displayOrder,
    slug,
    ...fields
  } = source;
  void _id; void _createdAt; void _updatedAt; void _displayOrder;

  // Slug candidates: seasonal copies get "-seasonal"; daily copies drop it when
  // that's free, otherwise fall back to "-daily".
  const stem = slug.replace(/-seasonal(-\d+)?$/, "");
  const candidates =
    targetType === "seasonal"
      ? [`${stem}-seasonal`, ...[2, 3, 4, 5].map((n) => `${stem}-seasonal-${n}`)]
      : [stem, `${stem}-daily`, ...[2, 3, 4].map((n) => `${stem}-daily-${n}`)];

  let newId: string | null = null;
  for (const candidate of candidates) {
    const { data, error } = await supabase
      .from("listings")
      .insert({
        ...fields,
        slug: candidate,
        listing_type: targetType,
        price_period: targetType === "seasonal" ? "month" : null,
        property_kind: null,
        area_sqm: null,
        weekend_price: fields.price,
        is_active: false,
        is_featured: false,
      })
      .select("id")
      .single();

    if (!error && data) {
      newId = data.id;
      break;
    }
    if (error?.code !== "23505") {
      return { error: error?.message ?? "Could not copy listing" };
    }
  }
  if (!newId) return { error: "Could not find a free URL slug for the copy." };

  const { data: images } = await supabase
    .from("listing_images")
    .select("url, display_order, alt_text")
    .eq("listing_id", sourceId);

  if (images && images.length > 0) {
    const { error: imageError } = await supabase
      .from("listing_images")
      .insert(images.map((img) => ({ ...img, listing_id: newId })));
    if (imageError) {
      return { error: `Copied the listing but not its photos: ${imageError.message}`, id: newId };
    }
  }

  revalidatePath("/admin/listings");
  revalidatePath("/admin/dashboard");
  return { error: null, id: newId };
}

// ─── Remove from seasonal ───────────────────────────────────

/**
 * Deletes a seasonal listing. Refuses anything that isn't seasonal, so it can
 * never delete a daily chalet or a property for sale. Photo files stay in
 * storage, so a daily chalet sharing them is unaffected.
 */
export async function removeSeasonalListingAction(id: string): Promise<ActionState> {
  const { supabase, error: authError } = await requireAdmin();
  if (authError) return { error: authError };

  const { data: listing } = await supabase
    .from("listings")
    .select("listing_type, slug")
    .eq("id", id)
    .single();
  if (!listing) return { error: "Listing not found" };
  if (listing.listing_type !== "seasonal") {
    return { error: "Only seasonal listings can be removed this way." };
  }

  const { error } = await supabase.from("listings").delete().eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/admin/listings");
  revalidatePath("/admin/dashboard");
  revalidatePath("/seasonal");
  revalidatePath(`/seasonal/${listing.slug}`);
  return { error: null, success: true };
}
