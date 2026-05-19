/**
 * Order domain — pure types + status machine.
 * MVP transitions: created → approved → in_production → ready → shipped.
 * No backwards transitions. No cancel state yet.
 */

import type { OrganizationId } from "@/domains/organization/types";
import type { ProductId } from "@/domains/product/types";

declare const orderIdBrand: unique symbol;
export type OrderId = string & { readonly [orderIdBrand]: true };
export function toOrderId(value: string): OrderId {
  return value as OrderId;
}

declare const invoiceIdBrand: unique symbol;
export type InvoiceId = string & { readonly [invoiceIdBrand]: true };
export function toInvoiceId(value: string): InvoiceId {
  return value as InvoiceId;
}

export const ORDER_STATUSES = [
  "created",
  "approved",
  "in_production",
  "ready",
  "shipped",
] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];
export function isOrderStatus(value: unknown): value is OrderStatus {
  return (
    typeof value === "string" &&
    (ORDER_STATUSES as readonly string[]).includes(value)
  );
}

export const INVOICE_STATUSES = ["pending", "paid"] as const;
export type InvoiceStatus = (typeof INVOICE_STATUSES)[number];

export type Order = {
  id: OrderId;
  brandId: OrganizationId;
  labId: OrganizationId;
  productId: ProductId;
  quantity: number;
  unitPriceUsd: number;
  totalUsd: number;
  status: OrderStatus;
  paymentTerms: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
};

export type Invoice = {
  id: InvoiceId;
  orderId: OrderId;
  amountUsd: number;
  status: InvoiceStatus;
  createdAt: string;
  paidAt: string | null;
};

/**
 * Allowed forward transitions. Anything not listed throws on
 * transitionOrderStatus() in modules/orders/.
 */
const ALLOWED_TRANSITIONS: Readonly<Record<OrderStatus, readonly OrderStatus[]>> =
  {
    created: ["approved"],
    approved: ["in_production"],
    in_production: ["ready"],
    ready: ["shipped"],
    shipped: [],
  };

export function canTransition(from: OrderStatus, to: OrderStatus): boolean {
  return ALLOWED_TRANSITIONS[from].includes(to);
}

export function nextStatus(from: OrderStatus): OrderStatus | null {
  return ALLOWED_TRANSITIONS[from][0] ?? null;
}
