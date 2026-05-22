import "server-only";

import { createClient } from "@/services/supabase/server";

/**
 * Update the password of the **currently signed-in** user. Used by
 * `/auth/reset-password` after the recovery code has been exchanged for a
 * session by `/auth/callback`.
 *
 * Returns null on success or a user-facing error string on failure.
 */
export async function updateOwnPassword(
  newPassword: string,
): Promise<string | null> {
  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) return error.message;
  return null;
}
