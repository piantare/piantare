import { redirect } from "next/navigation";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Label,
  SubmitButton,
} from "@/design-system";
import { createOrganization } from "@/modules/onboarding";
import {
  isOrgCurrency,
  isOrganizationKind,
  type OrganizationKind,
  type OrgCurrency,
} from "@/domains/organization";

import { requireSession } from "@/app/_lib/gating";

type Search = { error?: string };

export default async function OnboardingPage({
  searchParams,
}: {
  searchParams: Promise<Search>;
}) {
  const sp = await searchParams;
  const { user, memberships } = await requireSession({ allowNoOrg: true });

  if (memberships.length > 0) {
    // Already onboarded — send them to the loop entry point.
    redirect("/");
  }

  async function createOrgAction(formData: FormData) {
    "use server";
    const kindRaw = String(formData.get("kind") ?? "");
    const name = String(formData.get("name") ?? "").trim();
    const country = String(formData.get("country") ?? "").trim() || "BR";
    const currencyRaw = String(formData.get("currency") ?? "USD");

    if (!isOrganizationKind(kindRaw)) {
      redirect(
        `/onboarding?error=${encodeURIComponent("Escolha indústria, brand ou escritório.")}`,
      );
    }
    if (!isOrgCurrency(currencyRaw)) {
      redirect(
        `/onboarding?error=${encodeURIComponent("Moeda inválida.")}`,
      );
    }
    if (name.length === 0) {
      redirect(
        `/onboarding?error=${encodeURIComponent("Informe o nome da organização.")}`,
      );
    }

    try {
      await createOrganization({
        ownerUserId: user.id,
        kind: kindRaw as OrganizationKind,
        name,
        country,
        currency: currencyRaw as OrgCurrency,
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erro desconhecido.";
      redirect(`/onboarding?error=${encodeURIComponent(msg)}`);
    }

    redirect("/");
  }

  return (
    <main className="mx-auto flex w-full max-w-xl flex-1 flex-col items-center justify-center gap-10 px-6 py-16">
      <header className="flex flex-col items-center gap-3 text-center">
        <h1 className="font-serif text-[40px] font-light leading-none tracking-tight">
          Vamos abrir sua organização
        </h1>
        <p className="text-[14px] font-light leading-relaxed text-[var(--piantare-muted)]">
          A Piantare coordena indústrias, brands e escritórios na cadeia da
          longevidade. Comece escolhendo qual lado você representa — pode
          trocar depois.
        </p>
      </header>
      <Card className="w-full">
        <CardContent className="flex flex-col gap-6 p-7">
          {sp.error && (
            <p className="text-[13px] text-destructive">{sp.error}</p>
          )}
          <form action={createOrgAction} className="flex flex-col gap-5">
            <div className="flex flex-col gap-3">
              <Label>Tipo de organização</Label>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <label className="group cursor-pointer">
                  <input
                    type="radio"
                    name="kind"
                    value="escritorio"
                    defaultChecked
                    className="peer sr-only"
                  />
                  <div className="flex h-full flex-col gap-1 rounded-xl border border-[var(--piantare-border)] bg-[var(--piantare-warm)] px-4 py-4 transition-all duration-200 ease-out peer-checked:border-[var(--piantare-gm)] peer-checked:bg-[var(--piantare-gl)] peer-checked:shadow-[var(--piantare-shadow-focus)] group-hover:-translate-y-[1px]">
                    <span className="text-[15px] font-normal text-foreground">
                      Escritório
                    </span>
                    <span className="text-[12px] font-light text-[var(--piantare-muted)]">
                      Quem opera com agentes
                    </span>
                  </div>
                </label>
                <label className="group cursor-pointer">
                  <input
                    type="radio"
                    name="kind"
                    value="brand"
                    className="peer sr-only"
                  />
                  <div className="flex h-full flex-col gap-1 rounded-xl border border-[var(--piantare-border)] bg-[var(--piantare-warm)] px-4 py-4 transition-all duration-200 ease-out peer-checked:border-[var(--piantare-gm)] peer-checked:bg-[var(--piantare-gl)] peer-checked:shadow-[var(--piantare-shadow-focus)] group-hover:-translate-y-[1px]">
                    <span className="text-[15px] font-normal text-foreground">
                      Brand
                    </span>
                    <span className="text-[12px] font-light text-[var(--piantare-muted)]">
                      Quem estrutura o produto
                    </span>
                  </div>
                </label>
                <label className="group cursor-pointer">
                  <input
                    type="radio"
                    name="kind"
                    value="industria"
                    className="peer sr-only"
                  />
                  <div className="flex h-full flex-col gap-1 rounded-xl border border-[var(--piantare-border)] bg-[var(--piantare-warm)] px-4 py-4 transition-all duration-200 ease-out peer-checked:border-[var(--piantare-gm)] peer-checked:bg-[var(--piantare-gl)] peer-checked:shadow-[var(--piantare-shadow-focus)] group-hover:-translate-y-[1px]">
                    <span className="text-[15px] font-normal text-foreground">
                      Indústria
                    </span>
                    <span className="text-[12px] font-light text-[var(--piantare-muted)]">
                      Quem produz
                    </span>
                  </div>
                </label>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="name">Nome da organização</Label>
              <Input id="name" name="name" required />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="country">País (ISO-2)</Label>
              <Input
                id="country"
                name="country"
                defaultValue="BR"
                maxLength={2}
                required
              />
            </div>
            {/*
              Currency selector intentionally hidden — the MVP stores every
              price in USD (products.price_usd, orders.unit_price_usd) so the
              org-level currency would be decorative and confusing. The action
              falls back to USD when the field is absent. Re-introduce when
              multi-currency pricing is real. See backlog B3.
            */}
            <input type="hidden" name="currency" value="USD" />

            <SubmitButton pendingLabel="Criando organização…" className="mt-3 w-full">
              Criar organização
            </SubmitButton>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
