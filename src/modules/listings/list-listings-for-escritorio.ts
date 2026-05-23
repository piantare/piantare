import "server-only";

import { createAdminClient } from "@/services/supabase/admin";
import {
  toListingId,
  type CatalogListing,
  type ListingCurrency,
  type ListingStatus,
} from "@/domains/listing";
import { toPartnershipId } from "@/domains/partnership";
import { toProductId } from "@/domains/product";
import type { OrganizationId } from "@/domains/organization";
import { getOrgNamesByIds } from "@/modules/organizations";

export type AgentCatalogItem = CatalogListing & {
  productName: string;
  productUnit: string;
  productDescription: string;
  sellerOrgName: string;
};

/**
 * Catálogo operacional do agente.
 *
 * Cruza partnerships onde o `escritorioOrgId` é BUYER e estão ATIVAS
 * com `catalog_listings` ativas dentro de cada partnership. Joina
 * produto (nome + unidade + descrição) e resolve nome do seller
 * separadamente via `getOrgNamesByIds` (admin client) — evita join
 * polimórfico complicado e mantém a regra de "display-only" pro nome
 * do counterparty.
 */
export async function listListingsForEscritorio(
  escritorioOrgId: OrganizationId,
): Promise<AgentCatalogItem[]> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("catalog_listings")
    .select(
      `
      id, partnership_id, product_id, unit_price, currency, min_order_qty,
      status, created_at, updated_at,
      partnerships!inner(id, seller_org_id, status, buyer_org_id),
      products!inner(name, unit, description)
      `,
    )
    .eq("partnerships.buyer_org_id", escritorioOrgId)
    .eq("partnerships.status", "active")
    .eq("status", "active")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`listListingsForEscritorio: ${error.message}`);
  }

  const rows = (data ?? []) as Array<{
    id: string;
    partnership_id: string;
    product_id: string;
    unit_price: number;
    currency: string;
    min_order_qty: number;
    status: ListingStatus;
    created_at: string;
    updated_at: string;
    products: { name: string; unit: string; description: string | null } | null;
    partnerships: { seller_org_id: string } | null;
  }>;

  const sellerIds = rows
    .map((r) => r.partnerships?.seller_org_id)
    .filter((x): x is string => Boolean(x));
  const sellerNames = await getOrgNamesByIds(sellerIds);

  return rows.map((row) => ({
    id: toListingId(row.id),
    partnershipId: toPartnershipId(row.partnership_id),
    productId: toProductId(row.product_id),
    unitPrice: Number(row.unit_price),
    currency: row.currency as ListingCurrency,
    minOrderQty: row.min_order_qty,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    productName: row.products?.name ?? "",
    productUnit: row.products?.unit ?? "",
    productDescription: row.products?.description ?? "",
    sellerOrgName: row.partnerships?.seller_org_id
      ? (sellerNames.get(row.partnerships.seller_org_id as OrganizationId) ?? "")
      : "",
  }));
}
