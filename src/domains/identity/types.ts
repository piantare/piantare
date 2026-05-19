/**
 * Identity — pure domain types.
 *
 * - Branded primitives keep `UserId`/`FamilyId`/`OrgId` from being mixed.
 * - `Role` mirrors the Postgres `ator_tipo` enum exactly (see supabase/migrations/0001_baseline.sql).
 * - `ApprovalStatus` mirrors `aprovacao_status`.
 * - `CurrentUser` is the in-app representation of an authenticated principal.
 *
 * Per ADR 0002, this module has NO I/O. Translation between database rows
 * and these types belongs in services/supabase/*.
 */

// --- Branded IDs -----------------------------------------------------------

declare const userIdBrand: unique symbol;
declare const familyIdBrand: unique symbol;
declare const orgIdBrand: unique symbol;
declare const memberIdBrand: unique symbol;

export type UserId = string & { readonly [userIdBrand]: true };
export type FamilyId = string & { readonly [familyIdBrand]: true };
export type OrgId = string & { readonly [orgIdBrand]: true };
export type MemberId = string & { readonly [memberIdBrand]: true };

export function toUserId(value: string): UserId {
  return value as UserId;
}
export function toFamilyId(value: string): FamilyId {
  return value as FamilyId;
}
export function toOrgId(value: string): OrgId {
  return value as OrgId;
}
export function toMemberId(value: string): MemberId {
  return value as MemberId;
}

// --- Role (mirrors Postgres enum `ator_tipo`) ------------------------------

export const ROLES = [
  "industria",
  "marca",
  "escritorio",
  "agente",
  "clinica",
  "profissional",
  "magistral",
  "distribuidora",
  "labdiag",
  "hub",
  "agencia",
  "pesquisador",
  "cliente",
  "admin",
] as const;

export type Role = (typeof ROLES)[number];

export function isRole(value: unknown): value is Role {
  return typeof value === "string" && (ROLES as readonly string[]).includes(value);
}

// --- ApprovalStatus (mirrors Postgres enum `aprovacao_status`) -------------

export const APPROVAL_STATUSES = [
  "pendente",
  "aprovado",
  "recusado",
  "em_analise",
] as const;

export type ApprovalStatus = (typeof APPROVAL_STATUSES)[number];

// --- CurrentUser -----------------------------------------------------------

export type CurrentUser = {
  id: UserId;
  email: string | null;
  role: Role | null;
  approvalStatus: ApprovalStatus | null;
};
