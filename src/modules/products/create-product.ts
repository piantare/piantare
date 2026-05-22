import "server-only";

import { createAdminClient } from "@/services/supabase/admin";
import { NotAMemberError, type OrganizationId } from "@/domains/organization";
import {
  toProductId,
  type Product,
  type ProductId,
} from "@/domains/product";

export type CreateProductInput = {
  actingUserId: string;
  labId: OrganizationId;
  name: string;
  description: string;
  unit: string;
  priceUsd: number;
};

/**
 * Lab member creates a product. Verifies membership server-side because
 * RLS does not protect writes (we use the admin client per ADR 0003 Q3=b).
 */
export async function createProduct(
  input: CreateProductInput,
): Promise<Product> {
  const name = input.name.trim();
  const description = input.description.trim();
  const unit = input.unit.trim();

  if (name.length === 0) throw new Error("createProduct: name is required.");
  if (unit.length === 0) throw new Error("createProduct: unit is required.");
  if (!Number.isFinite(input.priceUsd) || input.priceUsd < 0) {
    throw new Error("createProduct: priceUsd must be a non-negative number.");
  }

  const supabase = createAdminClient();

  // Check membership in the target producing org + ensure it is an industria.
  const { data: membership, error: memberError } = await supabase
    .from("memberships")
    .select("org_kind")
    .eq("user_id", input.actingUserId)
    .eq("organization_id", input.labId)
    .maybeSingle();

  if (memberError) {
    throw new Error(`createProduct: ${memberError.message}`);
  }
  if (!membership || membership.org_kind !== "industria") {
    throw new NotAMemberError();
  }

  const { data: row, error } = await supabase
    .from("products")
    .insert({
      lab_id: input.labId,
      name,
      description,
      unit,
      price_usd: input.priceUsd,
    })
    .select()
    .single();

  if (error || !row) {
    throw new Error(
      `createProduct: insert failed: ${error?.message ?? "unknown error"}`,
    );
  }

  return rowToProduct(row);
}

function rowToProduct(row: {
  id: string;
  lab_id: string;
  name: string;
  description: string;
  unit: string;
  price_usd: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}): Product {
  return {
    id: toProductId(row.id) as ProductId,
    labId: row.lab_id as OrganizationId,
    name: row.name,
    description: row.description,
    unit: row.unit,
    priceUsd: Number(row.price_usd),
    isActive: row.is_active,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export { rowToProduct };
