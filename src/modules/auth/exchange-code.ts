import "server-only";

import { createClient } from "@/services/supabase/server";

/**
 * Exchange an OAuth/recovery code for a session and write the auth cookies.
 * Called by `/auth/callback` after Supabase redirects the user back from
 * an email link.
 *
 * Returns null on success, error message on failure.
 */
export async function exchangeCodeForSession(
  code: string,
): Promise<string | null> {
  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) return error.message;
  return null;
}
