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
 */
export function Shell({ membership, memberships, children }: ShellProps) {
  async function logoutAction() {
    "use server";
    await signOut();
    redirect("/login");
  }

  const isIndustria = membership.orgKind === "industria";
  // Display label is friendlier than the raw enum value.
  const kindLabel = isIndustria ? "indústria" : membership.orgKind;

  return (
    <div className="flex min-h-full w-full flex-1 flex-col">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-4 p-4">
          <div className="flex items-center gap-6">
            <Link href="/" className="font-semibold tracking-tight">
              Piantare
            </Link>
            <nav className="flex items-center gap-4 text-sm">
              {isIndustria ? (
                <Link href="/industria/products" className="hover:underline">
                  Produtos
                </Link>
              ) : (
                <Link href="/brand/catalog" className="hover:underline">
                  Catálogo
                </Link>
              )}
              <Link href="/orders" className="hover:underline">
                Pedidos
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <span className="text-muted-foreground">
              {membership.organizationName}{" "}
              <span className="text-xs uppercase tracking-wide">
                ({kindLabel})
              </span>
            </span>
            {memberships.length > 1 && (
              <span className="text-xs text-muted-foreground">
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
      <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 p-8">
        {children}
      </div>
    </div>
  );
}
