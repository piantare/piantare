import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

import { env } from "@/config/env";
import type { Database } from "@/types/database";

/**
 * Browser-side Supabase client.
 *
 * - Uses the project's anon key (RLS gates everything).
 * - `@supabase/ssr` handles cookie sync with the server.
 * - Safe to call from `'use client'` components.
 * - NEVER import in server-only paths — use `services/supabase/server.ts`.
 *
 * See docs/adrs/0003 for the auth + RLS contract.
 */
export function createClient(): SupabaseClient<Database> {
  return createBrowserClient<Database>(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}
