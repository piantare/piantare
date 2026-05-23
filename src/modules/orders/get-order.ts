import "server-only";

import { createClient } from "@/services/supabase/server";
import { OrderNotFoundError, type Order, type OrderId } from "@/domains/order";
import type { OrganizationId } from "@/domains/organization";
import { getOrgNamesByIds } from "@/modules/organizations";

import { rowToOrder } from "./create-order";

export type OrderDetail = Order & {
  productName: string;
  productUnit: string;
  brandName: string;
  labName: string;
};

/**
 * Loads a single order with the joined display metadata used by
 * `/orders/[id]`. RLS gates visibility — non-members get a not-found.
 *
 * Cross-side org names resolved via `getOrgNamesByIds` (see list-orders.ts
 * for the rationale).
 */
export async function getOrderById(id: OrderId): Promise<OrderDetail> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("orders")
    .select(
      `
      id, vertical, brand_id, lab_id, product_id, quantity, unit_price_usd,
      total_usd, status, payment_terms, created_by, created_at, updated_at,
      products:product_id(name, unit)
      `,
    )
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(`getOrderById: ${error.message}`);
  if (!data) throw new OrderNotFoundError();

  // brand_id pode ser null (cotação agente→paciente, ADR 0007 §6 Sprint 1A C4a).
  const orgIds = [data.lab_id, ...(data.brand_id ? [data.brand_id] : [])];
  const orgNames = await getOrgNamesByIds(orgIds);

  return {
    ...rowToOrder(data),
    productName: data.products?.name ?? "",
    productUnit: data.products?.unit ?? "",
    brandName: data.brand_id
      ? (orgNames.get(data.brand_id as OrganizationId) ?? "")
      : "",
    labName: orgNames.get(data.lab_id as OrganizationId) ?? "",
  };
}
