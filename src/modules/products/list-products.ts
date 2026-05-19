import "server-only";

import { createClient } from "@/services/supabase/server";
import type { OrganizationId } from "@/domains/organization";
import type { Product } from "@/domains/product";

import { rowToProduct } from "./create-product";

/**
 * Lab-side: list all products of the lab the user belongs to.
 * RLS gates by `products_select_for_lab`.
 */
export async function listProductsByLab(
  labId: OrganizationId,
): Promise<Product[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("products")
    .select(
      "id, lab_id, name, description, unit, price_usd, is_active, created_at, updated_at",
    )
    .eq("lab_id", labId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(`listProductsByLab: ${error.message}`);
  return (data ?? []).map(rowToProduct);
}

export type CatalogProduct = Product & { labName: string };

/**
 * Brand-side catalog: every active product across every lab, with the lab
 * name joined for display. RLS gates by `products_select_for_brands`
 * (requires the caller to be a member of at least one brand org).
 */
export async function listActiveProductsForBrandCatalog(): Promise<
  CatalogProduct[]
> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("products")
    .select(
      "id, lab_id, name, description, unit, price_usd, is_active, created_at, updated_at, organizations:lab_id(name)",
    )
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (error) throw new Error(`listActiveProductsForBrandCatalog: ${error.message}`);

  return (data ?? []).map((row) => ({
    ...rowToProduct(row),
    labName: row.organizations?.name ?? "",
  }));
}
