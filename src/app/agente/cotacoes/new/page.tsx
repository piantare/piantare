import { redirect } from "next/navigation";

import { Card, CardContent } from "@/design-system";
import { listListingsForEscritorio } from "@/modules/listings";
import { createPerson, listPeopleByAgent } from "@/modules/people";
import { createQuote } from "@/modules/quotes";
import { toListingId } from "@/domains/listing";
import { toPersonId } from "@/domains/person";

import { requireAgenteSession } from "@/app/_lib/agente-gating";
import { AgenteShell } from "@/app/_lib/agente-shell";

import {
  QuoteForm,
  type CatalogItem,
  type PersonOption,
} from "./_quote-form";

type Search = { error?: string };

export default async function NewQuotePage({
  searchParams,
}: {
  searchParams: Promise<Search>;
}) {
  const sp = await searchParams;
  const { user, agent } = await requireAgenteSession();

  const [listings, people] = await Promise.all([
    listListingsForEscritorio(agent.escritorioOrgId),
    listPeopleByAgent(agent.membershipId),
  ]);

  const catalog: CatalogItem[] = listings.map((l) => ({
    listingId: l.id,
    productName: l.productName,
    productUnit: l.productUnit,
    unitPrice: l.unitPrice,
    currency: l.currency,
    sellerOrgName: l.sellerOrgName,
  }));

  const peopleOptions: PersonOption[] = people.map((p) => ({
    id: p.id,
    name: p.name,
    primaryContact: p.primaryContact,
  }));

  async function createQuoteAction(formData: FormData) {
    "use server";
    const mode = String(formData.get("mode") ?? "");
    const listingIdRaw = String(formData.get("listingId") ?? "");
    const quantityRaw = Number(formData.get("quantity"));

    if (!listingIdRaw) {
      redirect(
        `/agente/cotacoes/new?error=${encodeURIComponent("Selecione um produto.")}`,
      );
    }
    if (!Number.isFinite(quantityRaw) || quantityRaw < 1) {
      redirect(
        `/agente/cotacoes/new?error=${encodeURIComponent("Quantidade inválida.")}`,
      );
    }

    let personIdValue: string;

    try {
      if (mode === "new") {
        const name = String(formData.get("personName") ?? "").trim();
        const contact = String(formData.get("personContact") ?? "").trim();
        if (!name || !contact) {
          redirect(
            `/agente/cotacoes/new?error=${encodeURIComponent("Informe nome e contato do paciente.")}`,
          );
        }
        const person = await createPerson({
          creatorMembershipId: agent.membershipId,
          name,
          primaryContact: contact,
        });
        personIdValue = person.id;
      } else {
        personIdValue = String(formData.get("personId") ?? "");
        if (!personIdValue) {
          redirect(
            `/agente/cotacoes/new?error=${encodeURIComponent("Selecione o paciente.")}`,
          );
        }
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erro desconhecido.";
      redirect(`/agente/cotacoes/new?error=${encodeURIComponent(msg)}`);
    }

    let quoteId: string;
    try {
      const quote = await createQuote({
        agentUserId: user.id,
        agentMembershipId: agent.membershipId,
        escritorioOrgId: agent.escritorioOrgId,
        listingId: toListingId(listingIdRaw),
        personId: toPersonId(personIdValue),
        quantity: quantityRaw,
      });
      quoteId = quote.id;
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erro desconhecido.";
      redirect(`/agente/cotacoes/new?error=${encodeURIComponent(msg)}`);
    }

    redirect(`/agente/cotacoes/${quoteId}`);
  }

  return (
    <AgenteShell agent={agent}>
      <div className="mx-auto w-full max-w-2xl">
        <header className="mb-8 flex flex-col gap-2">
          <h1 className="font-serif text-[36px] font-light leading-none tracking-tight">
            Nova cotação
          </h1>
          <p className="text-[14px] font-light text-[var(--piantare-muted)]">
            Em menos de dois minutos: paciente, produto, quantidade. Você
            recebe um link para mandar pelo WhatsApp.
          </p>
        </header>
        <Card>
          <CardContent className="p-7">
            {sp.error && (
              <p className="mb-5 text-[13px] text-destructive">{sp.error}</p>
            )}
            <QuoteForm
              catalog={catalog}
              people={peopleOptions}
              action={createQuoteAction}
            />
          </CardContent>
        </Card>
      </div>
    </AgenteShell>
  );
}
