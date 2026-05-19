import "server-only";

import { redirect } from "next/navigation";

import { getCurrentUser } from "@/modules/auth";
import {
  getPrimaryMembership,
  getUserOrgs,
  type UserMembershipSummary,
} from "@/modules/onboarding";
import type { CurrentUser } from "@/domains/identity";
import type { OrganizationKind } from "@/domains/organization";

/**
 * Tiny auth/org guard for Server Components. Intentionally not a generic
 * abstraction — it just consolidates the redirect rules for Step 8 pages.
 *
 *   - No session → /login
 *   - Logged in but no membership → /onboarding (unless `allowNoOrg` is set,
 *     which the /onboarding page itself uses)
 *   - Wrong org kind for a side-specific page → home
 */
export type GateWithOrg = {
  user: CurrentUser;
  membership: UserMembershipSummary;
  memberships: UserMembershipSummary[];
};

export type GateMaybeNoOrg =
  | GateWithOrg
  | { user: CurrentUser; membership: null; memberships: UserMembershipSummary[] };

export type RequireSessionOptions = {
  allowNoOrg?: boolean;
  requiredKind?: OrganizationKind;
};

export async function requireSession(options: { allowNoOrg: true }): Promise<GateMaybeNoOrg>;
export async function requireSession(options?: { requiredKind?: OrganizationKind }): Promise<GateWithOrg>;
export async function requireSession(
  options: RequireSessionOptions = {},
): Promise<GateMaybeNoOrg> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const memberships = await getUserOrgs(user.id);
  const membership = await getPrimaryMembership(user.id);

  if (!membership) {
    if (options.allowNoOrg) {
      return { user, membership: null, memberships };
    }
    redirect("/onboarding");
  }

  if (options.requiredKind) {
    const matching = memberships.find((m) => m.orgKind === options.requiredKind);
    if (!matching) redirect("/");
    return { user, membership: matching, memberships };
  }

  return { user, membership, memberships };
}
