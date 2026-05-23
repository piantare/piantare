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
      <header className="flex flex-col gap-2">
        <h1 className="font-serif text-[40px] font-light leading-none tracking-tight">
          Catálogo
        </h1>
        <p className="text-[14px] font-light text-[var(--piantare-muted)]">
          Produtos ativos oferecidos pelas indústrias parceiras.
        </p>
      </header>

      {products.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col gap-2 p-10 text-center">
            <p className="font-serif text-2xl font-light text-foreground">
              Ainda nenhum produto disponível.
            </p>
            <p className="text-[14px] font-light text-[var(--piantare-muted)]">
              Quando uma indústria publicar, aparece aqui.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2">
          {products.map((p) => (
            <Card key={p.id}>
              <CardHeader>
                <CardTitle className="text-[22px]">{p.name}</CardTitle>
                <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-[var(--piantare-muted)]">
                  {p.labName}
                </p>
              </CardHeader>
              <CardContent className="flex flex-col gap-4 text-[14px] font-light">
                {p.description && (
                  <p className="text-[var(--piantare-muted)]">
                    {p.description}
                  </p>
                )}
                <p className="tabular-nums text-foreground">
                  <span className="font-normal">
                    US$ {p.priceUsd.toFixed(2)}
                  </span>
                  <span className="text-[var(--piantare-muted)]"> / {p.unit}</span>
                </p>
                <Button asChild size="sm" className="mt-1 w-fit">
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
