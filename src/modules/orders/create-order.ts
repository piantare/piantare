import "server-only";

import { createAdminClient } from "@/services/supabase/admin";
import { NotAMemberError, type OrganizationId } from "@/domains/organization";
import { InactiveProductError, type ProductId } from "@/domains/product";
import {
  toOrderId,
  type Order,
  type OrderStatus,
} from "@/domains/order";

export type CreateOrderInput = {
  actingUserId: string;
  brandId: OrganizationId;
  productId: ProductId;
  quantity: number;
  paymentTerms?: string;
};

/**
 * Brand member creates an order against an existing product.
 *
 * Server-side guarantees enforced here:
 *   - Caller must be a member of the brand.
 *   - Brand org must actually be of kind `brand`.
 *   - Product must exist and be active; lab_id is resolved from it.
 *   - unit_price_usd is snapshotted from the product at order time.
 *
 * total_usd is computed by the DB (`generated always as` column).
 */
export async function createOrder(input: CreateOrderInput): Promise<Order> {
  if (!Number.isFinite(input.quantity) || input.quantity <= 0) {
    throw new Error("createOrder: quantity must be a positive number.");
  }

  const supabase = createAdminClient();

  // 1. Verify caller belongs to the brand.
  const { data: membership, error: memberError } = await supabase
    .from("memberships")
    .select("org_kind")
    .eq("user_id", input.actingUserId)
    .eq("organization_id", input.brandId)
    .maybeSingle();

  if (memberError) throw new Error(`createOrder: ${memberError.message}`);
  if (!membership || membership.org_kind !== "brand") {
    throw new NotAMemberError();
  }

  // 2. Load the product to snapshot price + lab_id.
  const { data: product, error: productError } = await supabase
    .from("products")
    .select("id, lab_id, price_usd, is_active")
    .eq("id", input.productId)
    .maybeSingle();

  if (productError) throw new Error(`createOrder: ${productError.message}`);
  if (!product) throw new Error("createOrder: product not found.");
  if (!product.is_active) throw new InactiveProductError();

  // 3. Insert the order.
  const { data: row, error } = await supabase
    .from("orders")
    .insert({
      brand_id: input.brandId,
      lab_id: product.lab_id,
      product_id: input.productId,
      quantity: input.quantity,
      unit_price_usd: product.price_usd,
      payment_terms: input.paymentTerms ?? "50/50",
      created_by: input.actingUserId,
    })
    .select()
    .single();

  if (error || !row) {
    throw new Error(
      `createOrder: insert failed: ${error?.message ?? "unknown error"}`,
    );
  }

  return rowToOrder(row);
}

export function rowToOrder(row: {
  id: string;
  brand_id: string;
  lab_id: string;
  product_id: string;
  quantity: number;
  unit_price_usd: number;
  total_usd: number;
  status: OrderStatus;
  payment_terms: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}): Order {
  return {
    id: toOrderId(row.id),
    brandId: row.brand_id as OrganizationId,
    labId: row.lab_id as OrganizationId,
    productId: row.product_id as ProductId,
    quantity: Number(row.quantity),
    unitPriceUsd: Number(row.unit_price_usd),
    totalUsd: Number(row.total_usd),
    status: row.status,
    paymentTerms: row.payment_terms,
    createdBy: row.created_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
