import "server-only";

import { createClient } from "@/services/supabase/server";

/**
 * Email/password sign-up. The Supabase project is expected to have email
 * confirmation disabled for MVP (set in Auth settings); if confirmation is
 * required the returned `needsConfirmation` flag will be true and the
 * caller should surface "check your inbox".
 *
 * Returns either a user-facing error message or a result with the
 * confirmation flag.
 */
export type SignUpResult =
  | { ok: false; error: string }
  | { ok: true; needsConfirmation: boolean };

export async function signUpWithPassword(
  email: string,
  password: string,
): Promise<SignUpResult> {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) return { ok: false, error: error.message };
  // When email confirmation is required, `session` is null on first signup.
  return { ok: true, needsConfirmation: data.session === null };
}
