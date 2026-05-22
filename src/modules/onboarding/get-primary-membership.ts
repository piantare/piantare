import "server-only";

import { getUserOrgs, type UserMembershipSummary } from "./get-user-orgs";

/**
 * Returns the user's "primary" membership for auth gating purposes.
 *
 * MVP rule: one org per kind per user. If the user has both an indústria
 * and a brand membership, we surface the most recently created one as the
 * default landing context. The user can still navigate to the other side
 * explicitly via /industria/* or /brand/*.
 */
export async function getPrimaryMembership(
  userId: string,
): Promise<UserMembershipSummary | null> {
  const memberships = await getUserOrgs(userId);
  if (memberships.length === 0) return null;
  return [...memberships].sort((a, b) =>
    b.createdAt.localeCompare(a.createdAt),
  )[0];
}
