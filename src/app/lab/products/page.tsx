import Link from "next/link";

import { Button, Card, CardContent, CardHeader, CardTitle } from "@/design-system";
import { listProductsByLab } from "@/modules/products";

import { requireSession } from "@/app/_lib/gating";
import { Shell } from "@/app/_lib/shell";

export default async function LabProductsPage() {
  const { membership, memberships } = await requireSession({
    requiredKind: "lab",
  });
  const products = await listProductsByLab(membership.organizationId);

  return (
    <Shell membership={membership} memberships={memberships}>
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Produtos</h1>
        <Button asChild>
          <Link href="/lab/products/new">Novo produto</Link>
        </Button>
      </header>

      {products.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-sm text-muted-foreground">
            Nenhum produto ainda. Crie o primeiro para aparecer no catálogo dos
            brands.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {products.map((p) => (
            <Card key={p.id}>
              <CardHeader>
                <CardTitle className="text-base">{p.name}</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-1 text-sm">
                <p className="text-muted-foreground">{p.description}</p>
                <p className="font-mono">
                  US$ {p.priceUsd.toFixed(2)} / {p.unit}
                </p>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  {p.isActive ? "ativo" : "inativo"}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </Shell>
  );
}
