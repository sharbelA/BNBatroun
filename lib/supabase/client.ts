/**
 * Supabase browser client.
 * Use in client components ("use client") and event handlers.
 *
 * Usage:
 *   import { supabase } from "@/lib/supabase/client";
 *   const { data } = await supabase.from("listings").select("*");
 */

import { createBrowserClient } from "@supabase/ssr";

let _client: ReturnType<typeof createBrowserClient> | null = null;

export const supabase = new Proxy({} as ReturnType<typeof createBrowserClient>, {
  get(_target, prop) {
    if (!_client) {
      _client = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        { auth: { flowType: 'pkce' } }
      );
    }
    return (_client as Record<string, unknown>)[prop as string];
  },
});
