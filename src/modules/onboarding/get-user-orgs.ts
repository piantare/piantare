import "server-only";

import { createClient } from "@/services/supabase/server";
import {
  toMembershipId,
  toOrganizationId,
  type Membership,
  type OrganizationKind,
} from "@/domains/organization";

export type UserMembershipSummary = Membership & {
  organizationName: string;
};

/**
 * Returns the memberships the caller belongs to. Uses the per-request
 * server client so RLS is enforced (defense in depth — admin client would
 * also work but is unnecessary here).
 *
 * Hits the `memberships` and `organizations` tables via a single join.
 */
export async function getUserOrgs(
  userId: string,
): Promise<UserMembershipSummary[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("memberships")
    .select(
      "id, organization_id, user_id, role, org_kind, created_at, organizations(name)",
    )
    .eq("user_id", userId);

  if (error) {
    throw new Error(`getUserOrgs: ${error.message}`);
  }

  return (data ?? []).map((row) => ({
    id: toMembershipId(row.id),
    organizationId: toOrganizationId(row.organization_id),
    userId: row.user_id,
    role: row.role,
    orgKind: row.org_kind as OrganizationKind,
    createdAt: row.created_at,
    organizationName: row.organizations?.name ?? "",
  }));
}
