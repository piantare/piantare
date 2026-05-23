import { Card, CardContent } from "@/design-system";

import { requireSession } from "@/app/_lib/gating";
import { Shell } from "@/app/_lib/shell";

/**
 * Landing inicial do escritório (Sprint 1A C1).
 *
 * Honestidade: ainda não há funcionalidade pro escritório nesta camada.
 * Wave Sprint 1A C2 traz partnerships, C3 traz catálogo em camadas,
 * C4 traz cotações dos agentes vinculados.
 *
 * Página intencionalmente calma e curta — comunicar "você está dentro,
 * o sistema está vivo, próximas peças chegam em breve" sem prometer
 * o que ainda não existe.
 */
export default async function EscritorioHomePage() {
  const { membership, memberships } = await requireSession({
    requiredKind: "escritorio",
  });

  return (
    <Shell membership={membership} memberships={memberships}>
      <header className="flex flex-col gap-2">
        <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-[var(--piantare-muted)]">
          Escritório
        </p>
        <h1 className="font-serif text-[40px] font-light leading-none tracking-tight">
          {membership.organizationName}
        </h1>
        <p className="text-[14px] font-light text-[var(--piantare-muted)]">
          Você é o centro operacional do ecossistema. Aqui passam vínculos com
          marcas, catálogo dos seus agentes, validações documentais e
          liberação de despachos.
        </p>
      </header>

      <Card>
        <CardContent className="flex flex-col gap-4 p-7">
          <p className="font-serif text-[22px] font-light text-foreground">
            Conexões com brands · em breve
          </p>
          <p className="text-[14px] font-light leading-relaxed text-[var(--piantare-muted)]">
            Estabelecer vínculos com brands é o primeiro passo para começar a
            operar. Quando uma brand aceitar trabalhar com você, o catálogo
            dela aparece aqui para você publicar aos seus agentes.
          </p>
          <p className="text-[12px] font-light italic text-[var(--piantare-dim)]">
            Estamos preparando essa peça nos próximos dias.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="flex flex-col gap-4 p-7">
          <p className="font-serif text-[22px] font-light text-foreground">
            Agentes vinculados · em breve
          </p>
          <p className="text-[14px] font-light leading-relaxed text-[var(--piantare-muted)]">
            Convidar agentes para representar o escritório. Cada agente terá
            sua carteira de cotações e clientes, acompanhada por aqui.
          </p>
          <p className="text-[12px] font-light italic text-[var(--piantare-dim)]">
            Estamos preparando essa peça nos próximos dias.
          </p>
        </CardContent>
      </Card>
    </Shell>
  );
}
