import { headers } from "next/headers";
import { notFound } from "next/navigation";

import { Card, CardContent } from "@/design-system";
import { listQuotesForAgent } from "@/modules/quotes";
import type { OrderStage } from "@/domains/order";

import { requireAgenteSession } from "@/app/_lib/agente-gating";
import { AgenteShell } from "@/app/_lib/agente-shell";

import { CopyLinkButton } from "./_copy-link";

const STAGE_LABELS: Partial<Record<OrderStage, string>> = {
  rascunho: "Rascunho",
  cotacao_aberta: "Cotação aberta",
  documentacao: "Documentação",
  pagamento: "Pagamento",
  producao_ou_importacao: "Produção",
  logistica: "Logística",
  entregue: "Entregue",
  liquidado: "Liquidado",
  cancelado: "Cancelado",
};

const BRL = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

export default async function QuoteDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { agent } = await requireAgenteSession();

  // Reusa o listador (RLS via membership de agente garante escopo).
  const quotes = await listQuotesForAgent(agent.membershipId);
  const quote = quotes.find((q) => q.id === id);
  if (!quote) notFound();

  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "";
  const proto = h.get("x-forwarded-proto") ?? "https";
  const origin = `${proto}://${host}`;
  const publicUrl = `${origin}/cotacao/${quote.id}`;

  const isOpen = quote.stage === "cotacao_aberta";

  return (
    <AgenteShell agent={agent}>
      <header className="flex flex-col gap-2">
        <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-[var(--piantare-muted)]">
          Cotação · {quote.id.slice(0, 8)}
        </p>
        <h1 className="font-serif text-[40px] font-light leading-none tracking-tight">
          {quote.personName}
        </h1>
        <p className="text-[14px] font-light text-[var(--piantare-muted)]">
          {quote.personContact}
        </p>
      </header>

      {isOpen && (
        <Card>
          <CardContent className="flex flex-col gap-4 p-7">
            <div className="flex flex-col gap-1">
              <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-[var(--piantare-gd)]">
                Link para o paciente
              </p>
              <p className="break-all text-[13px] font-light text-[var(--piantare-muted)]">
                {publicUrl}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <CopyLinkButton url={publicUrl} />
              <p className="text-[12px] font-light italic text-[var(--piantare-dim)]">
                Cole no WhatsApp do paciente — ele verá o valor e poderá
                aceitar.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="grid gap-5 p-7 sm:grid-cols-2">
          <Field label="Produto" value={quote.productName} />
          <Field
            label="Quantidade"
            value={`${quote.quantity}× ${quote.productUnit}`}
          />
          <Field
            label="Valor"
            value={BRL.format(quote.totalUsd)}
            mono
          />
          <Field
            label="Estágio"
            value={STAGE_LABELS[quote.stage ?? "cotacao_aberta"] ?? "—"}
          />
          {quote.paymentTerms && (
            <Field
              label="Condições de pagamento"
              value={quote.paymentTerms}
            />
          )}
          <Field
            label="Aberta em"
            value={new Date(quote.createdAt).toLocaleString("pt-BR")}
          />
        </CardContent>
      </Card>
    </AgenteShell>
  );
}

function Field({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1">
      <div className="text-[10px] font-medium uppercase tracking-[0.18em] text-[var(--piantare-muted)]">
        {label}
      </div>
      <div
        className={`text-[15px] text-foreground ${mono ? "tabular-nums" : ""}`}
      >
        {value}
      </div>
    </div>
  );
}
