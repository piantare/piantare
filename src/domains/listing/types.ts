/**
 * Listing domain — pure types.
 *
 * ADR 0007 §3 + doc canônico RN-009 (visibilidade em camadas).
 *
 * Catalog listing = produto publicado por seller pra buyer dentro
 * do escopo de uma partnership. Permite:
 *   - Marca publica produto da indústria pro escritório vinculado.
 *   - Escritório publica produto da marca pro próprio operacional
 *     (visível aos seus agentes via memberships).
 *
 * Preço e moeda são da listing, não do produto — habilita markup
 * por camada e operação cross-currency.
 */

import type { PartnershipId } from "@/domains/partnership/types";
import type { ProductId } from "@/domains/product/types";

declare const listingIdBrand: unique symbol;
export type ListingId = string & { readonly [listingIdBrand]: true };
export function toListingId(value: string): ListingId {
  return value as ListingId;
}

export const LISTING_STATUSES = ["active", "paused", "discontinued"] as const;
export type ListingStatus = (typeof LISTING_STATUSES)[number];
export function isListingStatus(value: unknown): value is ListingStatus {
  return (
    typeof value === "string" &&
    (LISTING_STATUSES as readonly string[]).includes(value)
  );
}

/**
 * Moedas suportadas em listing. Constraint no DB também limita a estas.
 * Quando uma vertical exigir mais (EUR, GBP), entra junto com a regra
 * de fx_rate que vai consumir.
 */
export const LISTING_CURRENCIES = ["USD", "BRL"] as const;
export type ListingCurrency = (typeof LISTING_CURRENCIES)[number];

export type CatalogListing = {
  id: ListingId;
  partnershipId: PartnershipId;
  productId: ProductId;
  unitPrice: number;
  currency: ListingCurrency;
  minOrderQty: number;
  status: ListingStatus;
  createdAt: string;
  updatedAt: string;
};
