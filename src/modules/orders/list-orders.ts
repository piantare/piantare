import "server-only";

import { createClient } from "@/services/supabase/server";
import type { OrganizationId } from "@/domains/organization";
import type { Order } from "@/domains/order";
import { getOrgNamesByIds } from "@/modules/organizations";

import { rowToOrder } from "./create-order";

export type OrderListItem = Order & {
  productName: string;
  brandName: string;
  labName: string;
};

/**
 * Lists every order visible to the caller for a given org.
 *
 * RLS gates by `orders_select_for_brand` or `orders_select_for_lab`, so the
 * caller only sees orders for orgs they actually belong to. We additionally
 * filter by the requested org so a user with multiple memberships only sees
 * the inbox they asked for.
 *
 * **Cross-side org names:** the `organizations` RLS policy hides the
 * counterparty's row, so we cannot use a PostgREST embed for `brand` / `lab`.
 * Instead we collect the counterparty IDs from the RLS-filtered orders and
 * resolve their names via `getOrgNamesByIds` (admin-scoped, display-only).
 */
export async function listOrdersForOrg(
  orgId: OrganizationId,
): Promise<OrderListItem[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("orders")
    .select(
      `
      id, vertical, brand_id, lab_id, product_id, quantity, unit_price_usd,
      total_usd, status, payment_terms, created_by, created_at, updated_at,
      products:product_id(name)
      `,
    )
    .or(`brand_id.eq.${orgId},lab_id.eq.${orgId}`)
    .order("created_at", { ascending: false });

  if (error) throw new Error(`listOrdersForOrg: ${error.message}`);

  const rows = data ?? [];

  // Resolve all referenced org names in one round trip.
  // brand_id pode ser null (cotação agente→paciente, ADR 0007 §6).
  const orgIds: string[] = [];
  for (const row of rows) {
    orgIds.push(row.lab_id);
    if (row.brand_id) orgIds.push(row.brand_id);
  }
  const orgNames = await getOrgNamesByIds(orgIds);

  return rows.map((row) => ({
    ...rowToOrder(row),
    productName: row.products?.name ?? "",
    brandName: row.brand_id
      ? (orgNames.get(row.brand_id as OrganizationId) ?? "")
      : "",
    labName: orgNames.get(row.lab_id as OrganizationId) ?? "",
  }));
}
