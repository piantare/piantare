/**
 * Order domain — pure types + status machine.
 * MVP transitions: created → approved → in_production → ready → shipped.
 * No backwards transitions. No cancel state yet.
 */

import type {
  OrganizationId,
  VerticalKind,
} from "@/domains/organization/types";
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

/**
 * Order stages (ADR 0007 §6 Wave B). Convive com `OrderStatus` durante
 * a transição: status segue como verdade da UI atual da indústria;
 * stage abre espaço para o fluxo completo agente → cotação → … →
 * liquidação. Conversão e UI nova entram em commits incrementais.
 */
export const ORDER_STAGES = [
  "rascunho",
  "cotacao_aberta",
  "documentacao",
  "pagamento",
  "producao_ou_importacao",
  "logistica",
  "entregue",
  "liquidado",
  "cancelado",
] as const;
export type OrderStage = (typeof ORDER_STAGES)[number];
export function isOrderStage(value: unknown): value is OrderStage {
  return (
    typeof value === "string" &&
    (ORDER_STAGES as readonly string[]).includes(value)
  );
}

export const INVOICE_STATUSES = ["pending", "paid"] as const;
export type InvoiceStatus = (typeof INVOICE_STATUSES)[number];

/**
 * Order — domain representation.
 *
 * Naming note (ADR 0007 §12 Wave A): `labId` here denotes the producing
 * org (now `kind = industria`). The physical column `orders.lab_id` and
 * this field name `labId` are retained until Wave C generalizes to a
 * buyer/seller model. Treat as legacy nomenclature, not literal "lab".
 */
export type Order = {
  id: OrderId;
  vertical: VerticalKind;
  brandId: OrganizationId;
  labId: OrganizationId;
  productId: ProductId;
  quantity: number;
  unitPriceUsd: number;
  totalUsd: number;
  status: OrderStatus;
  /**
   * Stage do modelo expandido (ADR 0007 §6). Convive com `status`
   * durante a transição. Sempre presente após Wave B (backfill +
   * default no DB). Optional no tipo apenas para callers cuja SELECT
   * predates a coluna.
   */
  stage?: OrderStage;
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
