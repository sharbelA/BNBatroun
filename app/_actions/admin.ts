"use server";

import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { ActionState } from "@/app/_actions/listings";

// ─── Service-role client ────────────────────────────────────
// Server-only — bypasses RLS to manage auth users. Never import
// this helper from client code or expose the key to the browser.

function createServiceRoleClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

// ─── Password generation ─────────────────────────────────────
// Derives a memorable prefix from the host's first name and appends
// 6 cryptographically random alphanumeric characters.

function generateHostPassword(fullName: string): string {
  const firstName = (fullName.split(/\s+/)[0] ?? "")
    .toLowerCase()
    .replace(/[^a-z]/g, "");
  const prefix = firstName || "host";

  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  const bytes = new Uint8Array(6);
  crypto.getRandomValues(bytes);
  const suffix = Array.from(bytes, (b) => chars[b % chars.length]).join("");

  return prefix + suffix;
}

// ─── Create host ────────────────────────────────────────────

export async function createHostAction(
  _prev: ActionState,
  formData: FormData
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
    return { error: "Admin access required" };
  }

  const name = (formData.get("name") as string)?.trim();
  const email = (formData.get("email") as string)?.trim();
  const phone = (formData.get("phone") as string)?.trim() || null;
  const whatsapp = (formData.get("whatsapp") as string)?.trim() || phone;

  if (!name || !email) {
    return { error: "Name and email are required" };
  }

  const password = generateHostPassword(name);

  const admin = createServiceRoleClient();

  const { data: created, error: createError } =
    await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { name, role: "host" },
    });

  if (createError) return { error: createError.message };

  // Upsert in case the trigger already ran and created a 'guest' row
  const { error: profileError } = await admin.from("profiles").upsert({
    id: created.user.id,
    name,
    phone,
    whatsapp,
    role: "host",
  });

  if (profileError) {
    // Roll back the auth user so we don't leave an orphaned account.
    await admin.auth.admin.deleteUser(created.user.id);
    return { error: profileError.message };
  }

  revalidatePath("/admin/hosts");
  return { error: null, success: true, generatedPassword: password };
}
