/**
 * Product domain — pure types.
 * MVP: lab-owned, USD price, single unit, no variations.
 */

import type { OrganizationId } from "@/domains/organization/types";

declare const productIdBrand: unique symbol;
export type ProductId = string & { readonly [productIdBrand]: true };
export function toProductId(value: string): ProductId {
  return value as ProductId;
}

export type Product = {
  id: ProductId;
  labId: OrganizationId;
  name: string;
  description: string;
  unit: string; // free-form ("mg", "ml", "unit"…) — validation lives in modules/
  priceUsd: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};
