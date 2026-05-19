import { createClient } from "@/services/supabase/server";
import {
  isRole,
  toUserId,
  type CurrentUser,
  type Role,
  type ApprovalStatus,
} from "@/domains/identity";

/**
 * Reads the current authenticated user from the request cookies and joins
 * with `profiles` to populate role + approval status.
 *
 * - Returns `null` when no session is active.
 * - Returns `null` (with role/approvalStatus null) when a session exists
 *   but no `profiles` row is yet linked — that's a bootstrap state, not an
 *   error (per Supabase Auth + profile-extension pattern in schema v1.3).
 *
 * Per ADR 0002, this is a `modules/` use-case: it orchestrates
 * `services/supabase/server` and translates into the `domains/identity`
 * `CurrentUser` type. It does NOT live in `domains/identity`.
 */
export async function getCurrentUser(): Promise<CurrentUser | null> {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return null;
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("tipo, status")
    .eq("id", user.id)
    .maybeSingle();

  const role: Role | null =
    profile && isRole(profile.tipo) ? profile.tipo : null;

  const approvalStatus: ApprovalStatus | null =
    (profile?.status as ApprovalStatus | undefined) ?? null;

  return {
    id: toUserId(user.id),
    email: user.email ?? null,
    role,
    approvalStatus,
  };
}
