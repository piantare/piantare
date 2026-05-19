import { redirect } from "next/navigation";

import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Label,
} from "@/design-system";
import { listActiveProductsForBrandCatalog } from "@/modules/products";
import { createOrder } from "@/modules/orders";
import { toProductId } from "@/domains/product";

import { requireSession } from "@/app/_lib/gating";
import { Shell } from "@/app/_lib/shell";

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
  const selected = sp.productId
    ? catalog.find((p) => p.id === sp.productId)
    : null;

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
          <form action={createOrderAction} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="productId">Produto</Label>
              <select
                id="productId"
                name="productId"
                defaultValue={selected?.id ?? ""}
                required
                className="h-9 rounded-md border border-input bg-transparent px-3 text-sm"
              >
                <option value="" disabled>
                  Selecione…
                </option>
                {catalog.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.labName} — {p.name} (US$ {p.priceUsd.toFixed(2)}/{p.unit})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="quantity">Quantidade</Label>
                <Input
                  id="quantity"
                  name="quantity"
                  type="number"
                  min="1"
                  step="1"
                  defaultValue={1}
                  required
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="paymentTerms">Condições</Label>
                <Input
                  id="paymentTerms"
                  name="paymentTerms"
                  defaultValue="50/50"
                />
              </div>
            </div>

            <Button type="submit">Criar pedido</Button>
          </form>
        </CardContent>
      </Card>
    </Shell>
  );
}
