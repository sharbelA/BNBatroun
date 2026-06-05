/**
 * Supabase browser client.
 * Use in client components ("use client") and event handlers.
 *
 * Usage:
 *   import { supabase } from "@/lib/supabase/client";
 *   const { data } = await supabase.from("listings").select("*");
 */

import { createBrowserClient } from "@supabase/ssr";

export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
