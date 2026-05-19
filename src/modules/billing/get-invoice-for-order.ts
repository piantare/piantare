import "server-only";

import { createClient } from "@/services/supabase/server";
import type { Invoice, OrderId } from "@/domains/order";

import { rowToInvoice } from "./generate-invoice";

/**
 * Per-request read of the invoice attached to an order. RLS gates by
 * `invoices_select_for_parties`, so non-members see null.
 */
export async function getInvoiceForOrder(
  orderId: OrderId,
): Promise<Invoice | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("invoices")
    .select("id, order_id, amount_usd, status, created_at, paid_at")
    .eq("order_id", orderId)
    .maybeSingle();

  if (error) throw new Error(`getInvoiceForOrder: ${error.message}`);
  if (!data) return null;
  return rowToInvoice(data);
}
