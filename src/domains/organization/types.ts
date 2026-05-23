/**
 * Organization domain — pure types and enums.
 *
 * No I/O, no Supabase types, no framework imports. This file is
 * importable from anywhere; mutations and persistence live in modules/.
 *
 * Scope (ADR 0007 Wave A): two kinds today (industria, brand);
 * USD-only storage; one organization per (user, kind); every record
 * tagged with a vertical (defaulted to cannabis_medicinal).
 * Other actor kinds (escritorio, agente, farmacia_magistral, ...) and
 * other verticals come in later waves.
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

/**
 * Organization kinds (ADR 0007 §3 + §2e fluxo comercial canônico).
 *
 * - `industria` — produz / fabrica white-label / private-label.
 * - `brand` — detém o SKU comercial, opera via escritório.
 * - `escritorio` — opera o dia a dia: importa, valida documentação,
 *   libera despacho, é o centro operacional do MVP (§2c).
 *
 * Próximos kinds (Wave E+): `farmacia_magistral`, `laboratorio`,
 * `clinica`. Entram quando o gate operacional que os consome estiver
 * sendo construído (princípio A3).
 */
export const ORGANIZATION_KINDS = ["industria", "brand", "escritorio"] as const;
export type OrganizationKind = (typeof ORGANIZATION_KINDS)[number];
export function isOrganizationKind(value: unknown): value is OrganizationKind {
  return (
    typeof value === "string" &&
    (ORGANIZATION_KINDS as readonly string[]).includes(value)
  );
}

/**
 * Membership roles (ADR 0007 §3): pessoa dentro de uma org.
 * - `owner` / `member`: roles operacionais clássicos.
 * - `agente` (Wave B): pessoa que origina cotações e mantém carteira
 *   de clientes. Pode coexistir com owner/member em outra org.
 * Outros papéis (`operator`, `financeiro`, `visualizador`) entram quando
 * o fluxo que os consome estiver sendo construído (princípio A3).
 */
export const MEMBERSHIP_ROLES = ["owner", "member", "agente"] as const;
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
 * Verticals are operational ecosystems Piantare coordinates. ADR 0007 §11.
 * Cannabis medicinal is the first; suplemento de longevidade, farmácia
 * magistral standalone, exame diagnóstico and others will be added here
 * as they are bootstrapped.
 */
export const VERTICAL_KINDS = ["cannabis_medicinal"] as const;
export type VerticalKind = (typeof VERTICAL_KINDS)[number];
export function isVerticalKind(value: unknown): value is VerticalKind {
  return (
    typeof value === "string" &&
    (VERTICAL_KINDS as readonly string[]).includes(value)
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
  vertical: VerticalKind;
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
