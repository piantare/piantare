import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { SupabaseClient } from "@supabase/supabase-js";

import { env } from "@/config/env";
import type { Database } from "@/types/database";

/**
 * Service-role Supabase client — BYPASSES RLS.
 *
 * Use ONLY for:
 *   - Admin route handlers / Server Actions explicitly scoped to admin role
 *   - Background jobs, scripts, scheduled tasks
 *   - Migration / seed code
 *
 * NEVER use:
 *   - Inside a request handler for a regular user
 *   - From a `'use client'` component
 *   - In the edge runtime (the key must not ship there)
 *
 * Guards:
 *   - Throws if SUPABASE_SERVICE_ROLE_KEY is absent.
 *   - Throws if running in edge runtime.
 *
 * See docs/adrs/0003 for the auth + RLS contract.
 */
export function createAdminClient(): SupabaseClient<Database> {
  if (process.env.NEXT_RUNTIME === "edge") {
    throw new Error(
      "services/supabase/admin: cannot create service-role client in edge runtime.",
    );
  }
  if (!env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error(
      "services/supabase/admin: SUPABASE_SERVICE_ROLE_KEY is not set. " +
        "Add it to .env.local for local admin operations, or provision it in the deployment environment.",
    );
  }

  return createSupabaseClient<Database>(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  );
}
