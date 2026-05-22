import { redirect } from "next/navigation";

import { Card, CardContent, CardHeader, CardTitle } from "@/design-system";
import { listActiveProductsForBrandCatalog } from "@/modules/products";
import { createOrder } from "@/modules/orders";
import { toProductId } from "@/domains/product";

import { requireSession } from "@/app/_lib/gating";
import { Shell } from "@/app/_lib/shell";

import { OrderForm, type CatalogOption } from "./_order-form";

type Search = { productId?: string; error?: string };

export default async function NewOrderPage({
  searchParams,
}: {
  searchParams: Promise<Search>;
}) {
  const sp = await searchParams;
  const { user, membership, memberships } = await requireSession({
    requiredKind: "brand",
  });
  const catalog = await listActiveProductsForBrandCatalog();
  const defaultProductId =
    sp.productId && catalog.some((p) => p.id === sp.productId)
      ? sp.productId
      : (catalog[0]?.id ?? "");

  async function createOrderAction(formData: FormData) {
    "use server";
    const productId = String(formData.get("productId") ?? "");
    const quantity = Number(formData.get("quantity"));
    const paymentTerms =
      String(formData.get("paymentTerms") ?? "").trim() || undefined;

    let orderId: string;
    try {
      const order = await createOrder({
        actingUserId: user.id,
        brandId: membership.organizationId,
        productId: toProductId(productId),
        quantity,
        paymentTerms,
      });
      orderId = order.id;
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erro desconhecido.";
      redirect(
        `/brand/orders/new?productId=${encodeURIComponent(productId)}&error=${encodeURIComponent(msg)}`,
      );
    }
    redirect(`/orders/${orderId}`);
  }

  // Project the catalog to the minimal shape the client component needs.
  // We deliberately don't pass internal fields (timestamps, lab_id, etc).
  const options: CatalogOption[] = catalog.map((p) => ({
    id: p.id,
    name: p.name,
    unit: p.unit,
    priceUsd: p.priceUsd,
    labName: p.labName,
  }));

  return (
    <Shell membership={membership} memberships={memberships}>
      <Card>
        <CardHeader>
          <CardTitle>Novo pedido</CardTitle>
        </CardHeader>
        <CardContent>
          {sp.error && (
            <p className="mb-4 text-sm text-destructive">{sp.error}</p>
          )}
          <OrderForm
            catalog={options}
            defaultProductId={defaultProductId}
            action={createOrderAction}
          />
        </CardContent>
      </Card>
    </Shell>
  );
}
