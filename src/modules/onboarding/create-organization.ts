import "server-only";

import { createAdminClient } from "@/services/supabase/admin";
import {
  DuplicateOrgKindError,
  isOrgCurrency,
  isOrganizationKind,
  toOrganizationId,
  toMembershipId,
  type Membership,
  type Organization,
  type OrgCurrency,
  type OrganizationKind,
} from "@/domains/organization";

export type CreateOrganizationInput = {
  ownerUserId: string;
  kind: OrganizationKind;
  name: string;
  country: string;
  currency: OrgCurrency;
};

export type CreateOrganizationResult = {
  organization: Organization;
  membership: Membership;
};

/**
 * Creates an organization and the owner's membership in two writes.
 *
 * Atomicity note: Supabase JS over PostgREST cannot execute multi-statement
 * transactions client-side. If the membership insert fails after the org
 * insert succeeded, we roll back manually by deleting the org. This keeps
 * the MVP simple and avoids a dedicated RPC migration. We accept the brief
 * window of partial state in the (extremely unlikely) case where the
 * rollback delete itself fails — the unique index on memberships
 * (user_id, org_kind) ensures the user can still retry cleanly.
 *
 * Uses the service-role client (per ADR 0003 Q3=b) so we don't need RLS
 * write policies. Business invariants are enforced here in code.
 */
export async function createOrganization(
  input: CreateOrganizationInput,
): Promise<CreateOrganizationResult> {
  const name = input.name.trim();
  const country = input.country.trim().toUpperCase();

  if (!isOrganizationKind(input.kind)) {
    throw new Error(`createOrganization: invalid kind "${input.kind}".`);
  }
  if (!isOrgCurrency(input.currency)) {
    throw new Error(
      `createOrganization: invalid currency "${input.currency}".`,
    );
  }
  if (name.length === 0) {
    throw new Error("createOrganization: name is required.");
  }
  if (country.length !== 2) {
    throw new Error(
      "createOrganization: country must be an ISO 3166-1 alpha-2 code.",
    );
  }

  const supabase = createAdminClient();

  // Pre-flight: surface the MVP "1 org per kind per user" rule with a
  // friendly error before we attempt the insert.
  const { data: existing, error: existingError } = await supabase
    .from("memberships")
    .select("id")
    .eq("user_id", input.ownerUserId)
    .eq("org_kind", input.kind)
    .maybeSingle();

  if (existingError) {
    throw new Error(
      `createOrganization: failed to check existing membership: ${existingError.message}`,
    );
  }
  if (existing) {
    throw new DuplicateOrgKindError();
  }

  const { data: orgRow, error: orgError } = await supabase
    .from("organizations")
    .insert({
      kind: input.kind,
      name,
      country,
      currency: input.currency,
      owner_id: input.ownerUserId,
    })
    .select()
    .single();

  if (orgError || !orgRow) {
    throw new Error(
      `createOrganization: failed to insert organization: ${orgError?.message ?? "unknown error"}`,
    );
  }

  const { data: memberRow, error: memberError } = await supabase
    .from("memberships")
    .insert({
      organization_id: orgRow.id,
      user_id: input.ownerUserId,
      role: "owner",
      // org_kind is filled by the BEFORE INSERT trigger; we send a value
      // anyway to keep the NOT NULL constraint happy across drivers.
      org_kind: input.kind,
    })
    .select()
    .single();

  if (memberError || !memberRow) {
    // Roll back the org insert so the user can retry cleanly.
    await supabase.from("organizations").delete().eq("id", orgRow.id);
    if (memberError?.code === "23505") {
      throw new DuplicateOrgKindError();
    }
    throw new Error(
      `createOrganization: failed to insert membership: ${memberError?.message ?? "unknown error"}`,
    );
  }

  return {
    organization: {
      id: toOrganizationId(orgRow.id),
      kind: orgRow.kind,
      name: orgRow.name,
      country: orgRow.country,
      currency: orgRow.currency as OrgCurrency,
      ownerId: orgRow.owner_id,
      createdAt: orgRow.created_at,
      updatedAt: orgRow.updated_at,
    },
    membership: {
      id: toMembershipId(memberRow.id),
      organizationId: toOrganizationId(memberRow.organization_id),
      userId: memberRow.user_id,
      role: memberRow.role,
      orgKind: memberRow.org_kind,
      createdAt: memberRow.created_at,
    },
  };
}
