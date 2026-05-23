import Link from "next/link";

import { Button, Card, CardContent, CardHeader, CardTitle } from "@/design-system";
import { listProductsByLab } from "@/modules/products";

import { requireSession } from "@/app/_lib/gating";
import { Shell } from "@/app/_lib/shell";

export default async function IndustriaProductsPage() {
  const { membership, memberships } = await requireSession({
    requiredKind: "industria",
  });
  const products = await listProductsByLab(membership.organizationId);

  return (
    <Shell membership={membership} memberships={memberships}>
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-2">
          <h1 className="font-serif text-[40px] font-light leading-none tracking-tight">
            Produtos
          </h1>
          <p className="text-[14px] font-light text-[var(--piantare-muted)]">
            O que sua indústria oferece para o catálogo dos brands.
          </p>
        </div>
        <Button asChild size="default">
          <Link href="/industria/products/new">Novo produto</Link>
        </Button>
      </header>

      {products.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col gap-2 p-10 text-center">
            <p className="font-serif text-2xl font-light text-foreground">
              Nenhum produto ainda.
            </p>
            <p className="text-[14px] font-light text-[var(--piantare-muted)]">
              Crie o primeiro para aparecer no catálogo dos brands.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2">
          {products.map((p) => (
            <Card key={p.id}>
              <CardHeader>
                <CardTitle className="text-[22px]">{p.name}</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-3 text-[14px] font-light">
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
                <span className="inline-flex w-fit items-center rounded-full border border-[var(--piantare-gx)] bg-[var(--piantare-gl)] px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-[0.14em] text-[var(--piantare-gd)]">
                  {p.isActive ? "Ativo" : "Inativo"}
                </span>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </Shell>
  );
}
