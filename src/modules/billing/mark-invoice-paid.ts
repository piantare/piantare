import "server-only";

import { createAdminClient } from "@/services/supabase/admin";
import type { Invoice, InvoiceId } from "@/domains/order";

import { rowToInvoice } from "./generate-invoice";
import { getPaymentProvider } from "./mock-payment-provider";

/**
 * Marks an invoice as paid. MVP: any logged-in user can flip the bit via
 * admin client (mock confirm). Real implementation will gate by either
 * webhook auth or admin role.
 */
export async function markInvoicePaid(id: InvoiceId): Promise<Invoice> {
  const supabase = createAdminClient();

  await getPaymentProvider().markPaid(`mock_${id}`);

  const { data: row, error } = await supabase
    .from("invoices")
    .update({ status: "paid", paid_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (error || !row) {
    throw new Error(
      `markInvoicePaid: update failed: ${error?.message ?? "unknown error"}`,
    );
  }
  return rowToInvoice(row);
}
