/**
 * Organization domain — pure types and enums.
 *
 * No I/O, no Supabase types, no framework imports. This file is
 * importable from anywhere; mutations and persistence live in modules/.
 *
 * MVP scope (ADR 0006): two kinds (lab, brand); USD-only storage;
 * one organization per (user, kind).
 */

declare const organizationIdBrand: unique symbol;
export type OrganizationId = string & { readonly [organizationIdBrand]: true };
export function toOrganizationId(value: string): OrganizationId {
  return value as OrganizationId;
}

declare const membershipIdBrand: unique symbol;
export type MembershipId = string & { readonly [membershipIdBrand]: true };
export function toMembershipId(value: string): MembershipId {
  return value as MembershipId;
}

export const ORGANIZATION_KINDS = ["lab", "brand"] as const;
export type OrganizationKind = (typeof ORGANIZATION_KINDS)[number];
export function isOrganizationKind(value: unknown): value is OrganizationKind {
  return (
    typeof value === "string" &&
    (ORGANIZATION_KINDS as readonly string[]).includes(value)
  );
}

export const MEMBERSHIP_ROLES = ["owner", "member"] as const;
export type MembershipRole = (typeof MEMBERSHIP_ROLES)[number];

export const ORG_CURRENCIES = ["USD", "BRL"] as const;
export type OrgCurrency = (typeof ORG_CURRENCIES)[number];
export function isOrgCurrency(value: unknown): value is OrgCurrency {
  return (
    typeof value === "string" &&
    (ORG_CURRENCIES as readonly string[]).includes(value)
  );
}

/**
 * Organization — domain representation, decoupled from the DB row shape.
 *
 * `ownerId` is denormalized in storage; the source of truth for "who can
 * act" is the memberships table, but we keep ownerId on the entity so the
 * UI can render "you own this org" without a join.
 */
export type Organization = {
  id: OrganizationId;
  kind: OrganizationKind;
  name: string;
  country: string; // ISO 3166-1 alpha-2
  currency: OrgCurrency;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
};

export type Membership = {
  id: MembershipId;
  organizationId: OrganizationId;
  userId: string;
  role: MembershipRole;
  orgKind: OrganizationKind;
  createdAt: string;
};
