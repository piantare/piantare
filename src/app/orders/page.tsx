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

  return (
    <Shell membership={membership} memberships={memberships}>
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Pedidos</h1>
        <p className="text-sm text-muted-foreground">
          {membership.orgKind === "industria"
            ? "Pedidos recebidos pela sua indústria."
            : "Seus pedidos junto às indústrias."}
        </p>
      </header>

      {orders.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-sm text-muted-foreground">
            Nenhum pedido ainda.
          </CardContent>
        </Card>
      ) : (
        <div className="flex flex-col gap-3">
          {orders.map((o) => (
            <Link key={o.id} href={`/orders/${o.id}`} className="block">
              <Card className="hover:bg-accent/40">
                <CardHeader>
                  <CardTitle className="text-base">
                    {o.productName}{" "}
                    <span className="text-xs font-normal text-muted-foreground">
                      · {o.quantity}× · US$ {o.totalUsd.toFixed(2)}
                    </span>
                  </CardTitle>
                  <p className="text-xs text-muted-foreground">
                    {membership.orgKind === "industria"
                      ? `Brand: ${o.brandName}`
                      : `Indústria: ${o.labName}`}
                  </p>
                </CardHeader>
                <CardContent className="text-xs uppercase tracking-wide text-muted-foreground">
                  {STATUS_LABELS[o.status] ?? o.status}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </Shell>
  );
}
