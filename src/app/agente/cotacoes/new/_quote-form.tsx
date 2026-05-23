"use client";

import * as React from "react";

import { Input, Label, SubmitButton } from "@/design-system";

export type CatalogItem = {
  listingId: string;
  productName: string;
  productUnit: string;
  unitPrice: number;
  currency: "USD" | "BRL";
  sellerOrgName: string;
};

export type PersonOption = {
  id: string;
  name: string;
  primaryContact: string;
};

type Props = {
  catalog: ReadonlyArray<CatalogItem>;
  people: ReadonlyArray<PersonOption>;
  action: (formData: FormData) => Promise<void>;
};

/**
 * Form da cotação — coração operacional do agente.
 *
 * Teste dos 2 minutos: 4 campos no máximo. Resumo ao vivo do total
 * para o agente sentir confiança antes do submit. Sem clutter, sem
 * tabela, sem múltiplas etapas — uma tela só.
 *
 * Paciente: dropdown se já existe + opção "+ Novo paciente" que
 * revela 2 campos inline (nome + contato). Princípio A3 — não pedimos
 * mais do que o WhatsApp já pede.
 */
export function QuoteForm({ catalog, people, action }: Props) {
  const [mode, setMode] = React.useState<"existing" | "new">(
    people.length > 0 ? "existing" : "new",
  );
  const [listingId, setListingId] = React.useState(catalog[0]?.listingId ?? "");
  const [quantity, setQuantity] = React.useState(1);

  const listing = React.useMemo(
    () => catalog.find((c) => c.listingId === listingId) ?? null,
    [catalog, listingId],
  );
  const total = listing ? listing.unitPrice * Math.max(0, quantity) : 0;

  if (catalog.length === 0) {
    return (
      <p className="text-[14px] font-light text-[var(--piantare-muted)]">
        Você ainda não tem produtos no seu catálogo. Fale com o operador do
        seu escritório para liberar uma listagem.
      </p>
    );
  }

  return (
    <form action={action} className="flex flex-col gap-6">
      <input type="hidden" name="mode" value={mode} />

      <div className="flex flex-col gap-3">
        <Label>Paciente</Label>
        {people.length > 0 && (
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setMode("existing")}
              className={[
                "rounded-xl border px-4 py-3 text-left transition-all duration-200 ease-out",
                mode === "existing"
                  ? "border-[var(--piantare-gm)] bg-[var(--piantare-gl)] shadow-[var(--piantare-shadow-focus)]"
                  : "border-[var(--piantare-border)] bg-[var(--piantare-warm)]",
              ].join(" ")}
            >
              <span className="block text-[14px] font-normal text-foreground">
                Já cadastrado
              </span>
              <span className="block text-[12px] font-light text-[var(--piantare-muted)]">
                Selecionar da carteira
              </span>
            </button>
            <button
              type="button"
              onClick={() => setMode("new")}
              className={[
                "rounded-xl border px-4 py-3 text-left transition-all duration-200 ease-out",
                mode === "new"
                  ? "border-[var(--piantare-gm)] bg-[var(--piantare-gl)] shadow-[var(--piantare-shadow-focus)]"
                  : "border-[var(--piantare-border)] bg-[var(--piantare-warm)]",
              ].join(" ")}
            >
              <span className="block text-[14px] font-normal text-foreground">
                Novo paciente
              </span>
              <span className="block text-[12px] font-light text-[var(--piantare-muted)]">
                Nome + contato
              </span>
            </button>
          </div>
        )}

        {mode === "existing" && people.length > 0 ? (
          <select
            name="personId"
            required
            className="h-11 w-full rounded-lg border border-[var(--piantare-border)] bg-[var(--piantare-warm)] px-4 text-[14px] font-light text-foreground transition-[background-color,border-color,box-shadow] duration-200 ease-out focus-visible:bg-[var(--piantare-white)] focus-visible:border-[var(--piantare-gm)] focus-visible:shadow-[var(--piantare-shadow-focus)] focus-visible:outline-none"
          >
            <option value="" disabled>
              Selecione…
            </option>
            {people.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} · {p.primaryContact}
              </option>
            ))}
          </select>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label htmlFor="personName">Nome</Label>
              <Input id="personName" name="personName" required />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="personContact">Contato</Label>
              <Input
                id="personContact"
                name="personContact"
                placeholder="WhatsApp, e-mail, telefone"
                required
              />
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-3">
        <Label htmlFor="listingId">Produto</Label>
        <select
          id="listingId"
          name="listingId"
          value={listingId}
          onChange={(e) => setListingId(e.target.value)}
          required
          className="h-11 w-full rounded-lg border border-[var(--piantare-border)] bg-[var(--piantare-warm)] px-4 text-[14px] font-light text-foreground transition-[background-color,border-color,box-shadow] duration-200 ease-out focus-visible:bg-[var(--piantare-white)] focus-visible:border-[var(--piantare-gm)] focus-visible:shadow-[var(--piantare-shadow-focus)] focus-visible:outline-none"
        >
          {catalog.map((c) => (
            <option key={c.listingId} value={c.listingId}>
              {c.sellerOrgName ? `${c.sellerOrgName} · ` : ""}
              {c.productName} ({formatPrice(c.unitPrice, c.currency)}/
              {c.productUnit})
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="quantity">Quantidade</Label>
        <Input
          id="quantity"
          name="quantity"
          type="number"
          min="1"
          step="1"
          value={quantity}
          onChange={(e) => setQuantity(Number(e.target.value))}
          required
        />
      </div>

      {listing && (
        <div className="rounded-xl border border-[var(--piantare-gx)] bg-[var(--piantare-gl)] p-5">
          <div className="text-[10px] font-medium uppercase tracking-[0.18em] text-[var(--piantare-gd)]">
            Resumo
          </div>
          <p className="mt-2 text-[14px] font-light leading-relaxed text-foreground">
            {quantity}× {listing.productUnit} de{" "}
            <span className="font-normal">{listing.productName}</span>
          </p>
          <p className="mt-3 flex flex-wrap items-baseline gap-2 text-[13px] font-light tabular-nums text-[var(--piantare-muted)]">
            <span>
              {quantity} × {formatPrice(listing.unitPrice, listing.currency)}
            </span>
            <span aria-hidden>=</span>
            <span className="font-serif text-[28px] font-light leading-none text-foreground">
              {formatPrice(total, listing.currency)}
            </span>
          </p>
        </div>
      )}

      <SubmitButton pendingLabel="Abrindo cotação…" className="mt-2 w-full">
        Abrir cotação e gerar link
      </SubmitButton>
    </form>
  );
}

const BRL = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});
const USD = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

function formatPrice(value: number, currency: "USD" | "BRL"): string {
  return currency === "BRL" ? BRL.format(value) : USD.format(value);
}
