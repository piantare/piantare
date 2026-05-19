import "server-only";

import { createClient } from "@/services/supabase/server";
import { OrderNotFoundError, type Order, type OrderId } from "@/domains/order";

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
 */
export async function getOrderById(id: OrderId): Promise<OrderDetail> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("orders")
    .select(
      `
      id, brand_id, lab_id, product_id, quantity, unit_price_usd, total_usd,
      status, payment_terms, created_by, created_at, updated_at,
      products:product_id(name, unit),
      brand:organizations!brand_id(name),
      lab:organizations!lab_id(name)
      `,
    )
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(`getOrderById: ${error.message}`);
  if (!data) throw new OrderNotFoundError();

  return {
    ...rowToOrder(data),
    productName: data.products?.name ?? "",
    productUnit: data.products?.unit ?? "",
    brandName: data.brand?.name ?? "",
    labName: data.lab?.name ?? "",
  };
}
