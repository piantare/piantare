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

  // "Lab side" in legacy naming = the producing org (industria). Kept this
  // variable name until the column itself is renamed in Wave C.
  const isLabSide =
    membership.orgKind === "industria" &&
    membership.organizationId === order.labId;
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
      <header className="flex flex-col gap-2">
        <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-[var(--piantare-muted)]">
          Pedido · {order.id.slice(0, 8)}
        </p>
        <h1 className="font-serif text-[40px] font-light leading-none tracking-tight">
          {order.productName}
        </h1>
        <p className="text-[14px] font-light text-[var(--piantare-muted)]">
          {order.quantity}× {order.productUnit} · US$ {order.totalUsd.toFixed(2)}
        </p>
      </header>

      {sp.error && <p className="text-[13px] text-destructive">{sp.error}</p>}

      <Card>
        <CardHeader>
          <CardTitle className="text-[22px]">Detalhes</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-5 sm:grid-cols-2">
          <div className="flex flex-col gap-1">
            <div className="text-[10px] font-medium uppercase tracking-[0.18em] text-[var(--piantare-muted)]">
              Brand
            </div>
            <div className="text-[15px] text-foreground">{order.brandName}</div>
          </div>
          <div className="flex flex-col gap-1">
            <div className="text-[10px] font-medium uppercase tracking-[0.18em] text-[var(--piantare-muted)]">
              Indústria
            </div>
            <div className="text-[15px] text-foreground">{order.labName}</div>
          </div>
          <div className="flex flex-col gap-1">
            <div className="text-[10px] font-medium uppercase tracking-[0.18em] text-[var(--piantare-muted)]">
              Preço unitário
            </div>
            <div className="tabular-nums text-[15px] text-foreground">
              US$ {order.unitPriceUsd.toFixed(2)}
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <div className="text-[10px] font-medium uppercase tracking-[0.18em] text-[var(--piantare-muted)]">
              Total
            </div>
            <div className="tabular-nums text-[15px] text-foreground">
              US$ {order.totalUsd.toFixed(2)}
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <div className="text-[10px] font-medium uppercase tracking-[0.18em] text-[var(--piantare-muted)]">
              Condições de pagamento
            </div>
            <div className="text-[15px] text-foreground">{order.paymentTerms}</div>
          </div>
          <div className="flex flex-col gap-1">
            <div className="text-[10px] font-medium uppercase tracking-[0.18em] text-[var(--piantare-muted)]">
              Status
            </div>
            <div className="text-[15px] text-foreground">
              {STATUS_LABELS[order.status] ?? order.status}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-[22px]">Fluxo</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          <ol className="flex flex-wrap items-center gap-2">
            {ORDER_STATUSES.map((s, idx) => {
              const currentIdx = ORDER_STATUSES.indexOf(order.status);
              const reached = idx <= currentIdx;
              const isCurrent = idx === currentIdx;
              return (
                <li
                  key={s}
                  className={[
                    "inline-flex items-center rounded-full px-3 py-1 text-[10px] font-medium uppercase tracking-[0.14em] transition-colors",
                    isCurrent
                      ? "bg-[var(--piantare-gd)] text-[var(--piantare-white)]"
                      : reached
                        ? "border border-[var(--piantare-gx)] bg-[var(--piantare-gl)] text-[var(--piantare-gd)]"
                        : "border border-[var(--piantare-border)] bg-transparent text-[var(--piantare-dim)]",
                  ].join(" ")}
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
            <p className="text-[13px] font-light text-[var(--piantare-muted)]">
              {next === null
                ? "Pedido finalizado."
                : isLabSide
                  ? ""
                  : "Apenas a indústria pode avançar o status."}
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-[22px]">Cobrança</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {invoice ? (
            <>
              <div className="flex flex-wrap items-baseline gap-3">
                <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-[var(--piantare-muted)]">
                  Invoice · {invoice.id.slice(0, 8)}
                </p>
                <p className="tabular-nums text-[18px] text-foreground">
                  US$ {invoice.amountUsd.toFixed(2)}
                </p>
                <span
                  className={[
                    "inline-flex items-center rounded-full px-3 py-1 text-[10px] font-medium uppercase tracking-[0.14em]",
                    invoice.status === "paid"
                      ? "bg-[var(--piantare-gd)] text-[var(--piantare-white)]"
                      : "border border-[var(--piantare-gx)] bg-[var(--piantare-gl)] text-[var(--piantare-gd)]",
                  ].join(" ")}
                >
                  {invoice.status === "paid" ? "Pago" : "Pendente"}
                </span>
              </div>
              {invoice.status === "pending" && (
                <form action={markPaidAction}>
                  <SubmitButton pendingLabel="Confirmando…" variant="outline">
                    Marcar como pago (mock)
                  </SubmitButton>
                </form>
              )}
            </>
          ) : (
            <p className="text-[13px] font-light text-[var(--piantare-muted)]">
              A invoice é gerada automaticamente quando a indústria aprovar o
              pedido.
            </p>
          )}
        </CardContent>
      </Card>
    </Shell>
  );
}
