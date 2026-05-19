import "server-only";

import { createAdminClient } from "@/services/supabase/admin";
import {
  toInvoiceId,
  toOrderId,
  type Invoice,
  type InvoiceStatus,
  type OrderId,
} from "@/domains/order";

import { getPaymentProvider } from "./mock-payment-provider";

/**
 * Generates the single invoice for a given order. Called automatically by
 * `transitionOrderStatus` when an order moves into `approved` — the lab has
 * agreed to fulfill, so we open the bill. Idempotent: if an invoice already
 * exists for the order, returns the existing one.
 */
export async function generateInvoiceForOrder(
  orderId: OrderId,
): Promise<Invoice> {
  const supabase = createAdminClient();

  const { data: existing, error: existingError } = await supabase
    .from("invoices")
    .select("id, order_id, amount_usd, status, created_at, paid_at")
    .eq("order_id", orderId)
    .maybeSingle();

  if (existingError) {
    throw new Error(`generateInvoiceForOrder: ${existingError.message}`);
  }
  if (existing) return rowToInvoice(existing);

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .select("id, total_usd")
    .eq("id", orderId)
    .maybeSingle();

  if (orderError) {
    throw new Error(`generateInvoiceForOrder: ${orderError.message}`);
  }
  if (!order) {
    throw new Error(`generateInvoiceForOrder: order ${orderId} not found.`);
  }

  // Ask the payment provider to open a charge. For the mock this is a no-op
  // that returns a synthetic reference; later we'll store it on the invoice.
  await getPaymentProvider().createCharge({
    orderId: order.id,
    amountUsd: Number(order.total_usd),
    description: `Piantare order ${order.id}`,
  });

  const { data: row, error } = await supabase
    .from("invoices")
    .insert({
      order_id: order.id,
      amount_usd: order.total_usd,
      status: "pending",
    })
    .select()
    .single();

  if (error || !row) {
    throw new Error(
      `generateInvoiceForOrder: insert failed: ${error?.message ?? "unknown error"}`,
    );
  }

  return rowToInvoice(row);
}

function rowToInvoice(row: {
  id: string;
  order_id: string;
  amount_usd: number;
  status: string;
  created_at: string;
  paid_at: string | null;
}): Invoice {
  return {
    id: toInvoiceId(row.id),
    orderId: toOrderId(row.order_id),
    amountUsd: Number(row.amount_usd),
    status: row.status as InvoiceStatus,
    createdAt: row.created_at,
    paidAt: row.paid_at,
  };
}

export { rowToInvoice };
