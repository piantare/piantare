import Link from "next/link";

import { Button, Card, CardContent } from "@/design-system";
import {
  listQuotesForAgent,
  summarizePipeline,
  type AgentPipelineSummary,
} from "@/modules/quotes";
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

/**
 * Carteira do agente — home operacional.
 *
 * Sensação alvo (ADR 0007 §2c + direcionais 6/7 do Nathan):
 * "minha carteira viva", não "dashboard administrativo". Mostra
 * pipeline em pílulas, últimas cotações e CTA óbvio.
 */
export default async function AgenteHomePage() {
  const { agent } = await requireAgenteSession();
  const quotes = await listQuotesForAgent(agent.membershipId);
  const summary = summarizePipeline(quotes);
  const lastFive = quotes.slice(0, 5);

  return (
    <AgenteShell agent={agent}>
      <header className="flex flex-col gap-2">
        <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-[var(--piantare-muted)]">
          Sua carteira
        </p>
        <h1 className="font-serif text-[40px] font-light leading-none tracking-tight">
          {summary.total === 0
            ? "Comece sua primeira cotação"
            : "Continue de onde parou"}
        </h1>
        <p className="text-[14px] font-light text-[var(--piantare-muted)]">
          {summary.total === 0
            ? "Você representa o " +
              agent.escritorioName +
              " — cada conversa que você abrir aqui vira um link que pode mandar pelo WhatsApp em segundos."
            : `${summary.uniquePeople} ${summary.uniquePeople === 1 ? "paciente ativo" : "pacientes ativos"} · última atividade ${formatRelative(summary.lastActivityAt)}.`}
        </p>
      </header>

      <PipelineRow summary={summary} />

      <div className="flex items-center gap-3">
        <Button asChild>
          <Link href="/agente/cotacoes/new">Nova cotação</Link>
        </Button>
        {summary.total > 0 && (
          <Button asChild variant="outline">
            <Link href="/agente/cotacoes">Ver todas</Link>
          </Button>
        )}
      </div>

      {summary.total > 0 && (
        <section className="flex flex-col gap-4">
          <h2 className="font-serif text-[22px] font-light leading-none tracking-tight">
            Últimas cotações
          </h2>
          <div className="flex flex-col gap-3">
            {lastFive.map((q) => (
              <Link key={q.id} href={`/agente/cotacoes/${q.id}`}>
                <Card>
                  <CardContent className="flex items-center justify-between gap-4 p-5">
                    <div className="flex flex-col gap-1">
                      <p className="font-serif text-[18px] font-normal leading-tight text-foreground">
                        {q.personName || "(sem nome)"}
                      </p>
                      <p className="text-[13px] font-light text-[var(--piantare-muted)]">
                        {q.productName} · {q.quantity}× {q.productUnit}
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
        </section>
      )}
    </AgenteShell>
  );
}

function PipelineRow({ summary }: { summary: AgentPipelineSummary }) {
  const visibleStages: OrderStage[] = [
    "cotacao_aberta",
    "documentacao",
    "pagamento",
    "producao_ou_importacao",
    "logistica",
    "entregue",
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
      {visibleStages.map((stage) => {
        const count = summary.byStage[stage] ?? 0;
        const active = count > 0;
        return (
          <Card
            key={stage}
            className={`!p-0 ${active ? "" : "opacity-60"}`}
          >
            <CardContent className="flex flex-col gap-1 p-5">
              <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-[var(--piantare-muted)]">
                {STAGE_LABELS[stage]}
              </p>
              <p className="font-serif text-[32px] font-light leading-none tabular-nums text-foreground">
                {count}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
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

function formatRelative(iso: string | null): string {
  if (!iso) return "—";
  const now = Date.now();
  const then = new Date(iso).getTime();
  const diffMs = now - then;
  const min = Math.floor(diffMs / 60_000);
  if (min < 1) return "agora";
  if (min < 60) return `há ${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `há ${h} h`;
  const d = Math.floor(h / 24);
  return `há ${d} d`;
}
