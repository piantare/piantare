import "server-only";

import { createAdminClient } from "@/services/supabase/admin";
import { generateInvoiceForOrder } from "@/modules/billing";
import { NotAMemberError } from "@/domains/organization";
import {
  InvalidOrderTransitionError,
  OrderNotFoundError,
  canTransition,
  type Order,
  type OrderId,
  type OrderStatus,
} from "@/domains/order";

import { rowToOrder } from "./create-order";

export type TransitionOrderStatusInput = {
  actingUserId: string;
  orderId: OrderId;
  nextStatus: OrderStatus;
};

/**
 * Lab-side action: advance an order through the status machine.
 *
 *   created → approved → in_production → ready → shipped
 *
 * Only the lab assigned to the order may transition it forward. The brand
 * side observes status changes but does not drive them in MVP.
 */
export async function transitionOrderStatus(
  input: TransitionOrderStatusInput,
): Promise<Order> {
  const supabase = createAdminClient();

  // 1. Load current order to know lab + current status.
  const { data: current, error: loadError } = await supabase
    .from("orders")
    .select("status, lab_id")
    .eq("id", input.orderId)
    .maybeSingle();

  if (loadError) throw new Error(`transitionOrderStatus: ${loadError.message}`);
  if (!current) throw new OrderNotFoundError();

  // 2. Verify caller is a lab-side member of the lab on this order.
  const { data: membership, error: memberError } = await supabase
    .from("memberships")
    .select("org_kind")
    .eq("user_id", input.actingUserId)
    .eq("organization_id", current.lab_id)
    .maybeSingle();

  if (memberError) {
    throw new Error(`transitionOrderStatus: ${memberError.message}`);
  }
  if (!membership || membership.org_kind !== "lab") {
    throw new NotAMemberError();
  }

  // 3. Validate the requested transition against the domain machine.
  if (!canTransition(current.status, input.nextStatus)) {
    throw new InvalidOrderTransitionError(current.status, input.nextStatus);
  }

  // 4. Persist.
  const { data: row, error } = await supabase
    .from("orders")
    .update({ status: input.nextStatus })
    .eq("id", input.orderId)
    .select()
    .single();

  if (error || !row) {
    throw new Error(
      `transitionOrderStatus: update failed: ${error?.message ?? "unknown error"}`,
    );
  }

  // Side effect: opening the order (approved) triggers invoice creation.
  // Idempotent — generateInvoiceForOrder returns the existing invoice if any.
  if (input.nextStatus === "approved") {
    await generateInvoiceForOrder(input.orderId);
  }

  return rowToOrder(row);
}
