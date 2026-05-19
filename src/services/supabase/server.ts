import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

import { env } from "@/config/env";
import type { Database } from "@/types/database";

/**
 * Per-request Supabase client for Server Components, Server Actions,
 * and Route Handlers.
 *
 * - Always call inside the request scope (never module-level cache).
 * - Reads cookies via Next 16 async `cookies()`.
 * - `setAll` may throw inside Server Components (read-only cookie store);
 *   that is expected — middleware handles refresh in that case.
 *
 * See docs/adrs/0003 for the auth + RLS contract.
 */
export async function createClient(): Promise<SupabaseClient<Database>> {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            for (const { name, value, options } of cookiesToSet) {
              cookieStore.set(name, value, options);
            }
          } catch {
            // Called from a Server Component — the cookie store is
            // read-only. Middleware will refresh the session on the next
            // request, so this is non-fatal.
          }
        },
      },
    },
  );
}
