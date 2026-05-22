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
        `/onboarding?error=${encodeURIComponent("Escolha lab ou brand.")}`,
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
    <main className="mx-auto flex w-full max-w-lg flex-1 flex-col gap-6 p-8">
      <Card>
        <CardHeader>
          <CardTitle>Criar sua organização</CardTitle>
          <CardDescription>
            Você precisa de um lab (quem produz) ou um brand (quem encomenda)
            para usar a plataforma. Pode trocar depois.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {sp.error && (
            <p className="text-sm text-destructive">{sp.error}</p>
          )}
          <form action={createOrgAction} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label>Tipo de organização</Label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 text-sm">
                  <input type="radio" name="kind" value="lab" defaultChecked />
                  Lab (produção)
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input type="radio" name="kind" value="brand" />
                  Brand (compra)
                </label>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="name">Nome</Label>
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

            <SubmitButton pendingLabel="Criando organização…">Criar organização</SubmitButton>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
