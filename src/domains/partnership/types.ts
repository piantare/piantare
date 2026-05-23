/**
 * Partnership domain — pure types.
 *
 * ADR 0007 §2e + §3: vínculo bilateral entre duas orgs. Substrato
 * de toda transação no ecossistema. Cada partnership tem:
 *   - um lado seller (publica catálogo, recebe pedido)
 *   - um lado buyer (compra, opera)
 *   - supply_model: como o estoque flui (purchase | consignment | dropship)
 *   - status: ciclo pending → active → terminated
 *
 * Pares típicos no MVP (ADR 0007 §2e):
 *   - seller=industria, buyer=brand
 *   - seller=brand,     buyer=escritorio
 *
 * Validação de quais pares fazem sentido fica na camada de service
 * (princípio: schema flexível, regra de negócio explícita).
 */

import type {
  MembershipId,
  OrganizationId,
} from "@/domains/organization/types";

declare const partnershipIdBrand: unique symbol;
export type PartnershipId = string & { readonly [partnershipIdBrand]: true };
export function toPartnershipId(value: string): PartnershipId {
  return value as PartnershipId;
}

export const PARTNERSHIP_STATUSES = [
  "pending",
  "active",
  "terminated",
] as const;
export type PartnershipStatus = (typeof PARTNERSHIP_STATUSES)[number];
export function isPartnershipStatus(value: unknown): value is PartnershipStatus {
  return (
    typeof value === "string" &&
    (PARTNERSHIP_STATUSES as readonly string[]).includes(value)
  );
}

/**
 * Supply model — define como o estoque/dinheiro fluem no vínculo.
 *
 * - `purchase`: buyer paga adiantado, recebe estoque (caso clássico).
 * - `consignment`: seller consigna estoque; buyer paga conforme vende
 *   ao consumidor final. Liquidação periódica (Wave D+).
 * - `dropship`: seller envia direto ao consumidor; buyer nunca toca
 *   o estoque, recebe comissão.
 *
 * No MVP só `purchase` é exercitado operacionalmente. Os demais
 * existem no enum para evitar migration futura quando o fluxo entrar.
 */
export const SUPPLY_MODELS = ["purchase", "consignment", "dropship"] as const;
export type SupplyModel = (typeof SUPPLY_MODELS)[number];
export function isSupplyModel(value: unknown): value is SupplyModel {
  return (
    typeof value === "string" &&
    (SUPPLY_MODELS as readonly string[]).includes(value)
  );
}

export type Partnership = {
  id: PartnershipId;
  sellerOrgId: OrganizationId;
  buyerOrgId: OrganizationId;
  status: PartnershipStatus;
  supplyModel: SupplyModel;
  /** Texto livre estruturado (comissão, prazos, mínimos). */
  terms: Record<string, unknown>;
  proposedByMembershipId: MembershipId | null;
  acceptedAt: string | null;
  terminatedAt: string | null;
  createdAt: string;
  updatedAt: string;
};
