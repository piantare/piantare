import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { Card, CardContent, CardHeader, CardTitle, SubmitButton } from "@/design-system";
import { getOrderById, transitionOrderStatus } from "@/modules/orders";
import {
  getInvoiceForOrder,
  markInvoicePaid,
} from "@/modules/billing";
import {
  ORDER_STATUSES,
  isOrderStatus,
  nextStatus,
  toInvoiceId,
  toOrderId,
} from "@/domains/order";

import { requireSession } from "@/app/_lib/gating";
import { Shell } from "@/app/_lib/shell";

const STATUS_LABELS: Record<string, string> = {
  created: "Criado",
  approved: "Aprovado",
  in_production: "Em produção",
  ready: "Pronto",
  shipped: "Enviado",
};

type Search = { error?: string };

export default async function OrderDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Search>;
}) {
  const { id } = await params;
  const sp = await searchParams;
  const { user, membership, memberships } = await requireSession();

  const order = await getOrderById(toOrderId(id));
  const invoice = await getInvoiceForOrder(order.id);

  const isLabSide = membership.orgKind === "lab" && membership.organizationId === order.labId;
  const next = nextStatus(order.status);

  async function advanceAction(formData: FormData) {
    "use server";
    const target = String(formData.get("nextStatus") ?? "");
    if (!isOrderStatus(target)) {
      redirect(`/orders/${id}?error=${encodeURIComponent("Status inválido.")}`);
    }
    try {
      await transitionOrderStatus({
        actingUserId: user.id,
        orderId: toOrderId(id),
        nextStatus: target,
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erro desconhecido.";
      redirect(`/orders/${id}?error=${encodeURIComponent(msg)}`);
    }
    revalidatePath(`/orders/${id}`);
    revalidatePath("/orders");
    redirect(`/orders/${id}`);
  }

  async function markPaidAction() {
    "use server";
    if (!invoice) return;
    try {
      await markInvoicePaid(toInvoiceId(invoice.id));
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erro desconhecido.";
      redirect(`/orders/${id}?error=${encodeURIComponent(msg)}`);
    }
    revalidatePath(`/orders/${id}`);
    redirect(`/orders/${id}`);
  }

  return (
    <Shell membership={membership} memberships={memberships}>
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">
          Pedido #{order.id.slice(0, 8)}
        </h1>
        <p className="text-sm text-muted-foreground">
          {order.productName} · {order.quantity}× {order.productUnit}
        </p>
      </header>

      {sp.error && <p className="text-sm text-destructive">{sp.error}</p>}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Detalhes</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <div className="text-xs uppercase tracking-wide text-muted-foreground">
              Brand
            </div>
            <div>{order.brandName}</div>
          </div>
          <div>
            <div className="text-xs uppercase tracking-wide text-muted-foreground">
              Lab
            </div>
            <div>{order.labName}</div>
          </div>
          <div>
            <div className="text-xs uppercase tracking-wide text-muted-foreground">
              Preço unitário
            </div>
            <div className="font-mono">US$ {order.unitPriceUsd.toFixed(2)}</div>
          </div>
          <div>
            <div className="text-xs uppercase tracking-wide text-muted-foreground">
              Total
            </div>
            <div className="font-mono">US$ {order.totalUsd.toFixed(2)}</div>
          </div>
          <div>
            <div className="text-xs uppercase tracking-wide text-muted-foreground">
              Condições
            </div>
            <div>{order.paymentTerms}</div>
          </div>
          <div>
            <div className="text-xs uppercase tracking-wide text-muted-foreground">
              Status
            </div>
            <div>{STATUS_LABELS[order.status] ?? order.status}</div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Fluxo</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 text-sm">
          <ol className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-wide">
            {ORDER_STATUSES.map((s, idx) => {
              const currentIdx = ORDER_STATUSES.indexOf(order.status);
              const reached = idx <= currentIdx;
              return (
                <li
                  key={s}
                  className={`rounded px-2 py-1 ${reached ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
                >
                  {STATUS_LABELS[s] ?? s}
                </li>
              );
            })}
          </ol>
          {isLabSide && next ? (
            <form action={advanceAction}>
              <input type="hidden" name="nextStatus" value={next} />
              <SubmitButton pendingLabel="Avançando…">
                Avançar para {STATUS_LABELS[next] ?? next}
              </SubmitButton>
            </form>
          ) : (
            <p className="text-xs text-muted-foreground">
              {next === null
                ? "Pedido finalizado."
                : isLabSide
                  ? ""
                  : "Apenas o lab pode avançar o status."}
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Cobrança</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 text-sm">
          {invoice ? (
            <>
              <p>
                Invoice <span className="font-mono">{invoice.id.slice(0, 8)}</span>{" "}
                · US$ {invoice.amountUsd.toFixed(2)}{" "}
                <span className="text-xs uppercase tracking-wide text-muted-foreground">
                  {invoice.status === "paid" ? "pago" : "pendente"}
                </span>
              </p>
              {invoice.status === "pending" && (
                <form action={markPaidAction}>
                  <SubmitButton pendingLabel="Confirmando…" variant="secondary">
                    Marcar como pago (mock)
                  </SubmitButton>
                </form>
              )}
            </>
          ) : (
            <p className="text-xs text-muted-foreground">
              A invoice é gerada automaticamente quando o lab aprovar o pedido.
            </p>
          )}
        </CardContent>
      </Card>
    </Shell>
  );
}
