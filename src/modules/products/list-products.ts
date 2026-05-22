import "server-only";

import { createClient } from "@/services/supabase/server";
import type { OrganizationId } from "@/domains/organization";
import type { Product } from "@/domains/product";
import { getOrgNamesByIds } from "@/modules/organizations";

import { rowToProduct } from "./create-product";

/**
 * Producer-side: list all products of the indústria the user belongs to.
 * RLS gates by `products_select_for_lab` (policy name kept until Wave C).
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
 * Brand-side catalog: every active product across every indústria, with the
 * producing org name joined for display. RLS gates by
 * `products_select_for_brands` (requires the caller to be a member of at
 * least one brand org).
 *
 * Indústria names resolved via `getOrgNamesByIds` because the
 * `organizations` RLS hides producing orgs the brand isn't a member of
 * (see list-orders.ts comment).
 */
export async function listActiveProductsForBrandCatalog(): Promise<
  CatalogProduct[]
> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("products")
    .select(
      "id, lab_id, name, description, unit, price_usd, is_active, created_at, updated_at",
    )
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (error)
    throw new Error(`listActiveProductsForBrandCatalog: ${error.message}`);

  const rows = data ?? [];
  const labIds = rows.map((row) => row.lab_id);
  const orgNames = await getOrgNamesByIds(labIds);

  return rows.map((row) => ({
    ...rowToProduct(row),
    labName: orgNames.get(row.lab_id as OrganizationId) ?? "",
  }));
}
