import { redirect } from "next/navigation";
import Link from "next/link";

import { Button } from "@/design-system";
import { signOut } from "@/modules/auth";
import type { UserMembershipSummary } from "@/modules/onboarding";

export type ShellProps = {
  membership: UserMembershipSummary;
  memberships: UserMembershipSummary[];
  children: React.ReactNode;
};

/**
 * Minimal app shell — header + content. Header surfaces:
 *   - current org name + kind
 *   - quick nav for the kind (industria → products; brand → catalog)
 *   - orders inbox link (both sides)
 *   - logout button
 *
 * Visual: backdrop blur leve sobre fundo warm + divisor verde
 * translúcido. Wordmark em Cormorant para tom editorial.
 */
export function Shell({ membership, memberships, children }: ShellProps) {
  async function logoutAction() {
    "use server";
    await signOut();
    redirect("/login");
  }

  const isIndustria = membership.orgKind === "industria";
  const kindLabel = isIndustria ? "indústria" : membership.orgKind;

  return (
    <div className="flex min-h-full w-full flex-1 flex-col">
      <header className="sticky top-0 z-30 border-b border-[var(--piantare-border)] bg-[rgba(250,252,251,0.92)] backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-4 px-6 py-4">
          <div className="flex items-center gap-8">
            <Link
              href="/"
              className="font-serif text-[22px] font-normal tracking-tight text-foreground transition-opacity hover:opacity-75"
            >
              Piantare
            </Link>
            <nav className="flex items-center gap-6 text-[14px] font-light text-[var(--piantare-muted)]">
              {isIndustria ? (
                <Link
                  href="/industria/products"
                  className="transition-colors hover:text-foreground"
                >
                  Produtos
                </Link>
              ) : (
                <Link
                  href="/brand/catalog"
                  className="transition-colors hover:text-foreground"
                >
                  Catálogo
                </Link>
              )}
              <Link
                href="/orders"
                className="transition-colors hover:text-foreground"
              >
                Pedidos
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-4 text-[13px]">
            <span className="hidden text-[var(--piantare-muted)] sm:inline">
              {membership.organizationName}
              <span className="ml-2 inline-block rounded-full border border-[var(--piantare-gx)] bg-[var(--piantare-gl)] px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-[0.14em] text-[var(--piantare-gd)]">
                {kindLabel}
              </span>
            </span>
            {memberships.length > 1 && (
              <span className="hidden text-[11px] font-light text-[var(--piantare-dim)] md:inline">
                · {memberships.length} orgs
              </span>
            )}
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
