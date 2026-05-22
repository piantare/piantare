import { redirect } from "next/navigation";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Label,
  SubmitButton,
} from "@/design-system";
import { createProduct } from "@/modules/products";

import { requireSession } from "@/app/_lib/gating";
import { Shell } from "@/app/_lib/shell";

type Search = { error?: string };

export default async function NewProductPage({
  searchParams,
}: {
  searchParams: Promise<Search>;
}) {
  const sp = await searchParams;
  const { user, membership, memberships } = await requireSession({
    requiredKind: "industria",
  });

  async function createProductAction(formData: FormData) {
    "use server";
    const name = String(formData.get("name") ?? "").trim();
    const description = String(formData.get("description") ?? "").trim();
    const unit = String(formData.get("unit") ?? "").trim();
    const priceUsd = Number(formData.get("priceUsd"));

    try {
      await createProduct({
        actingUserId: user.id,
        labId: membership.organizationId,
        name,
        description,
        unit,
        priceUsd,
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erro desconhecido.";
      redirect(`/industria/products/new?error=${encodeURIComponent(msg)}`);
    }

    redirect("/industria/products");
  }

  return (
    <Shell membership={membership} memberships={memberships}>
      <Card>
        <CardHeader>
          <CardTitle>Novo produto</CardTitle>
        </CardHeader>
        <CardContent>
          {sp.error && (
            <p className="mb-4 text-sm text-destructive">{sp.error}</p>
          )}
          <form action={createProductAction} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="name">Nome</Label>
              <Input id="name" name="name" required />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="description">Descrição</Label>
              <Input id="description" name="description" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="unit">Unidade</Label>
                <Input
                  id="unit"
                  name="unit"
                  placeholder="ex.: kg, frasco, dose"
                  required
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="priceUsd">Preço (USD)</Label>
                <Input
                  id="priceUsd"
                  name="priceUsd"
                  type="number"
                  step="0.01"
                  min="0"
                  required
                />
              </div>
            </div>
            <SubmitButton pendingLabel="Criando produto…">Criar produto</SubmitButton>
          </form>
        </CardContent>
      </Card>
    </Shell>
  );
}
