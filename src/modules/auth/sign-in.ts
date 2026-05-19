import "server-only";

import { createClient } from "@/services/supabase/server";

/**
 * Email/password sign-in. Returns null on success (cookies are written by
 * the per-request server client), or a user-facing error message string on
 * failure. The caller (a Server Action) decides whether to re-render with
 * an error or redirect.
 */
export async function signInWithPassword(
  email: string,
  password: string,
): Promise<string | null> {
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return error.message;
  return null;
}
