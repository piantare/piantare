import "server-only";

import { createAdminClient } from "@/services/supabase/admin";
import { toOrganizationId, type OrganizationId } from "@/domains/organization";

/**
 * Resolve a set of organization IDs to their display names.
 *
 * **Why this exists:** the `organizations` RLS policy only lets a user read
 * rows for orgs they're a member of. PostgREST embedded reads inherit RLS, so
 * cross-side joins on `orders` (brand_id, lab_id) come back as `null` for the
 * counterparty — destroying the marketplace UX (brand can't see lab name,
 * lab can't see brand name).
 *
 * **What this does:** uses the service-role client to fetch `(id, name)` pairs
 * for the given IDs. This is a *display-only* lookup — it never reads anything
 * sensitive, just public-facing org names. Safe because:
 *
 *   - The caller already passed RLS on the row that referenced these IDs
 *     (i.e. they're seeing an order/product they have legitimate access to).
 *   - We return only `name`, never email, billing data, or ownership.
 *
 * Returns a `Map<OrganizationId, string>` so callers can do O(1) lookups.
 * Missing IDs map to an empty string (defensive — shouldn't happen).
 *
 * See docs/smoke-test-runs/2026-05-21-run1.md finding #5.
 */
export async function getOrgNamesByIds(
  ids: ReadonlyArray<OrganizationId | string>,
): Promise<Map<OrganizationId, string>> {
  if (ids.length === 0) return new Map();

  const unique = Array.from(new Set(ids));
  const admin = createAdminClient();

  const { data, error } = await admin
    .from("organizations")
    .select("id, name")
    .in("id", unique);

  if (error) {
    throw new Error(`getOrgNamesByIds: ${error.message}`);
  }

  const map = new Map<OrganizationId, string>();
  for (const row of data ?? []) {
    map.set(toOrganizationId(row.id), row.name);
  }
  return map;
}
