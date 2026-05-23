import Link from "next/link";

import { Card, CardContent, CardHeader, CardTitle } from "@/design-system";
import { listOrdersForOrg } from "@/modules/orders";

import { requireSession } from "@/app/_lib/gating";
import { Shell } from "@/app/_lib/shell";

const STATUS_LABELS: Record<string, string> = {
  created: "Criado",
  approved: "Aprovado",
  in_production: "Em produção",
  ready: "Pronto",
  shipped: "Enviado",
};

export default async function OrdersPage() {
  const { membership, memberships } = await requireSession();
  const orders = await listOrdersForOrg(membership.organizationId);
  const isIndustria = membership.orgKind === "industria";

  return (
    <Shell membership={membership} memberships={memberships}>
      <header className="flex flex-col gap-2">
        <h1 className="font-serif text-[40px] font-light leading-none tracking-tight">
          Pedidos
        </h1>
        <p className="text-[14px] font-light text-[var(--piantare-muted)]">
          {isIndustria
            ? "Pedidos recebidos pela sua indústria."
            : "Seus pedidos junto às indústrias."}
        </p>
      </header>

      {orders.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col gap-2 p-10 text-center">
            <p className="font-serif text-2xl font-light text-foreground">
              Nenhum pedido ainda.
            </p>
            <p className="text-[14px] font-light text-[var(--piantare-muted)]">
              {isIndustria
                ? "Quando um brand abrir um pedido para sua indústria, aparece aqui."
                : "Quando você abrir o primeiro pedido, aparece aqui."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="flex flex-col gap-4">
          {orders.map((o) => (
            <Link key={o.id} href={`/orders/${o.id}`} className="block">
              <Card>
                <CardHeader className="flex flex-row items-start justify-between gap-4 pb-3">
                  <div className="flex flex-col gap-1">
                    <CardTitle className="text-[20px]">
                      {o.productName}
                    </CardTitle>
                    <p className="text-[13px] font-light text-[var(--piantare-muted)]">
                      {isIndustria ? `Brand · ${o.brandName}` : `Indústria · ${o.labName}`}
                    </p>
                  </div>
                  <span className="inline-flex items-center rounded-full border border-[var(--piantare-gx)] bg-[var(--piantare-gl)] px-3 py-1 text-[10px] font-medium uppercase tracking-[0.14em] text-[var(--piantare-gd)]">
                    {STATUS_LABELS[o.status] ?? o.status}
                  </span>
                </CardHeader>
                <CardContent className="flex items-baseline gap-4 pt-0 text-[14px] font-light text-[var(--piantare-muted)]">
                  <span className="tabular-nums">
                    {o.quantity}× · US$ {o.totalUsd.toFixed(2)}
                  </span>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </Shell>
  );
}
