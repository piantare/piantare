import Link from "next/link";

import { Button, Card, CardContent } from "@/design-system";
import { listQuotesForAgent } from "@/modules/quotes";
import type { OrderStage } from "@/domains/order";

import { requireAgenteSession } from "@/app/_lib/agente-gating";
import { AgenteShell } from "@/app/_lib/agente-shell";

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

export default async function AgenteCotacoesPage() {
  const { agent } = await requireAgenteSession();
  const quotes = await listQuotesForAgent(agent.membershipId);

  return (
    <AgenteShell agent={agent}>
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-2">
          <h1 className="font-serif text-[40px] font-light leading-none tracking-tight">
            Cotações
          </h1>
          <p className="text-[14px] font-light text-[var(--piantare-muted)]">
            Tudo que você abriu — em qualquer fase do fluxo.
          </p>
        </div>
        <Button asChild>
          <Link href="/agente/cotacoes/new">Nova cotação</Link>
        </Button>
      </header>

      {quotes.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col gap-2 p-10 text-center">
            <p className="font-serif text-2xl font-light text-foreground">
              Nenhuma cotação ainda.
            </p>
            <p className="text-[14px] font-light text-[var(--piantare-muted)]">
              Quando você abrir a primeira, ela aparece aqui — e gera um
              link que pode mandar pelo WhatsApp na hora.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="flex flex-col gap-3">
          {quotes.map((q) => (
            <Link key={q.id} href={`/agente/cotacoes/${q.id}`}>
              <Card>
                <CardContent className="flex flex-col gap-3 p-6 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex flex-col gap-1">
                    <p className="font-serif text-[20px] font-normal leading-tight text-foreground">
                      {q.personName || "(sem nome)"}
                    </p>
                    <p className="text-[13px] font-light text-[var(--piantare-muted)]">
                      {q.productName} · {q.quantity}× {q.productUnit}
                      {q.personContact && (
                        <> · {q.personContact}</>
                      )}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="tabular-nums text-[14px] text-foreground">
                      {formatBrl(q.totalUsd)}
                    </span>
                    <StageBadge stage={q.stage} />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </AgenteShell>
  );
}

function StageBadge({ stage }: { stage: OrderStage | undefined }) {
  if (!stage) return null;
  return (
    <span className="inline-flex items-center rounded-full border border-[var(--piantare-gx)] bg-[var(--piantare-gl)] px-3 py-1 text-[10px] font-medium uppercase tracking-[0.14em] text-[var(--piantare-gd)]">
      {STAGE_LABELS[stage] ?? stage}
    </span>
  );
}

const BRL = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

function formatBrl(value: number): string {
  return BRL.format(value);
}
