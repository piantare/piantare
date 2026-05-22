import Link from "next/link";

import { Button, Card, CardContent, CardHeader, CardTitle } from "@/design-system";
import { listActiveProductsForBrandCatalog } from "@/modules/products";

import { requireSession } from "@/app/_lib/gating";
import { Shell } from "@/app/_lib/shell";

export default async function BrandCatalogPage() {
  const { membership, memberships } = await requireSession({
    requiredKind: "brand",
  });
  const products = await listActiveProductsForBrandCatalog();

  return (
    <Shell membership={membership} memberships={memberships}>
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Catálogo</h1>
        <p className="text-sm text-muted-foreground">
          Produtos ativos oferecidos pelas indústrias parceiras.
        </p>
      </header>

      {products.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-sm text-muted-foreground">
            Ainda não há produtos disponíveis no catálogo.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {products.map((p) => (
            <Card key={p.id}>
              <CardHeader>
                <CardTitle className="text-base">{p.name}</CardTitle>
                <p className="text-xs text-muted-foreground">
                  Indústria: {p.labName}
                </p>
              </CardHeader>
              <CardContent className="flex flex-col gap-2 text-sm">
                <p className="text-muted-foreground">{p.description}</p>
                <p className="font-mono">
                  US$ {p.priceUsd.toFixed(2)} / {p.unit}
                </p>
                <Button asChild size="sm">
                  <Link href={`/brand/orders/new?productId=${p.id}`}>
                    Criar pedido
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </Shell>
  );
}
