import { redirect } from "next/navigation";
import Link from "next/link";

import { Button } from "@/design-system";
import { signOut } from "@/modules/auth";
import type { AgentContext } from "@/modules/agente";

export type AgenteShellProps = {
  agent: AgentContext;
  children: React.ReactNode;
};

/**
 * Shell do agente — distinto do Shell padrão porque o agente é
 * `membership.role`, não `org.kind`. Header mostra:
 *   - wordmark Piantare
 *   - nav: Início (carteira) / Cotações
 *   - escritório que ele representa
 *   - logout
 *
 * Tom Piantare: pill de "agente · {escritório}" comunica papel +
 * contexto sem virar tabelão administrativo (princípio §2c).
 */
export function AgenteShell({ agent, children }: AgenteShellProps) {
  async function logoutAction() {
    "use server";
    await signOut();
    redirect("/login");
  }

  return (
    <div className="flex min-h-full w-full flex-1 flex-col">
      <header className="sticky top-0 z-30 border-b border-[var(--piantare-border)] bg-[rgba(250,252,251,0.92)] backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-4 px-6 py-4">
          <div className="flex items-center gap-8">
            <Link
              href="/agente"
              className="font-serif text-[22px] font-normal tracking-tight text-foreground transition-opacity hover:opacity-75"
            >
              Piantare
            </Link>
            <nav className="flex items-center gap-6 text-[14px] font-light text-[var(--piantare-muted)]">
              <Link
                href="/agente"
                className="transition-colors hover:text-foreground"
              >
                Carteira
              </Link>
              <Link
                href="/agente/cotacoes"
                className="transition-colors hover:text-foreground"
              >
                Cotações
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-4 text-[13px]">
            <span className="hidden text-[var(--piantare-muted)] sm:inline">
              {agent.escritorioName}
              <span className="ml-2 inline-block rounded-full border border-[var(--piantare-gx)] bg-[var(--piantare-gl)] px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-[0.14em] text-[var(--piantare-gd)]">
                agente
              </span>
            </span>
            <form action={logoutAction}>
              <Button variant="ghost" size="sm" type="submit">
                Sair
              </Button>
            </form>
          </div>
        </div>
      </header>
      <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-10 px-6 py-12">
        {children}
      </div>
    </div>
  );
}
