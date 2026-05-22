import "server-only";

import { createClient } from "@/services/supabase/server";

/**
 * Send a Supabase recovery email. The user will receive a link to
 * `redirectTo` (must be in the Supabase Redirect URL allowlist), which
 * routes through `/auth/callback` to exchange the code for a session, then
 * lands on `/auth/reset-password`.
 *
 * We deliberately do NOT distinguish "email exists" vs "doesn't exist" in
 * the response — Supabase already treats this as idempotent for security
 * (no enumeration). The caller always shows the same neutral confirmation.
 *
 * Returns the underlying error message ONLY for genuine API failures
 * (network, malformed input) — never for "email not found".
 */
export async function sendPasswordReset(
  email: string,
  redirectTo: string,
): Promise<string | null> {
  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo,
  });
  if (error) return error.message;
  return null;
}
