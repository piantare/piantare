import "server-only";

import { createClient } from "@/services/supabase/server";

/**
 * Ends the current session. Cookies are cleared by the Supabase SSR client.
 */
export async function signOut(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
}
