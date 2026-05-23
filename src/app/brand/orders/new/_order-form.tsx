"use client";

import * as React from "react";

import { Input, Label, SubmitButton } from "@/design-system";

export type CatalogOption = {
  id: string;
  name: string;
  unit: string;
  priceUsd: number;
  labName: string;
};

type Props = {
  catalog: ReadonlyArray<CatalogOption>;
  defaultProductId: string;
  action: (formData: FormData) => Promise<void>;
};

const formatUsd = (value: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);

/**
 * Order editor — client island over the server action.
 *
 * Why a client component: brand needs to *see the total* before they hit
 * submit. Smoke test (run 1, leitura subjetiva) flagged "criação cega" —
 * preço × quantidade só aparece depois do redirect. A small useState here
 * gives instant feedback without changing the persistence path (still the
 * same server action passed in via `action`).
 *
 * Confirmation: we deliberately do NOT use `window.confirm`. Showing a
 * readable summary block ("Pedido para X: N × US$ X = US$ Y") above the
 * submit button IS the confirmation. Click commits.
 */
export function OrderForm({ catalog, defaultProductId, action }: Props) {
  const [productId, setProductId] = React.useState(defaultProductId);
  const [quantity, setQuantity] = React.useState(1);

  const product = React.useMemo(
    () => catalog.find((p) => p.id === productId) ?? null,
    [catalog, productId],
  );
  const total = product ? product.priceUsd * Math.max(0, quantity) : 0;

  return (
    <form action={action} className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <Label htmlFor="productId">Produto</Label>
        <select
          id="productId"
          name="productId"
          value={productId}
          onChange={(e) => setProductId(e.target.value)}
          required
          className="h-11 w-full rounded-lg border border-[var(--piantare-border)] bg-[var(--piantare-warm)] px-4 text-[14px] font-light text-foreground transition-[background-color,border-color,box-shadow] duration-200 ease-out focus-visible:bg-[var(--piantare-white)] focus-visible:border-[var(--piantare-gm)] focus-visible:shadow-[var(--piantare-shadow-focus)] focus-visible:outline-none"
        >
          <option value="" disabled>
            Selecione…
          </option>
          {catalog.map((p) => {
            const labPrefix = p.labName ? `${p.labName} · ` : "";
            return (
              <option key={p.id} value={p.id}>
                {labPrefix}
                {p.name} ({formatUsd(p.priceUsd)}/{p.unit})
              </option>
            );
          })}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
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
        <div className="flex flex-col gap-2">
          <Label htmlFor="paymentTerms">Condições de pagamento</Label>
          <Input
            id="paymentTerms"
            name="paymentTerms"
            placeholder="ex.: 50% adiantado / 50% na entrega"
            defaultValue="50/50"
          />
        </div>
      </div>

      {product && (
        <div className="rounded-xl border border-[var(--piantare-gx)] bg-[var(--piantare-gl)] p-5">
          <div className="text-[10px] font-medium uppercase tracking-[0.18em] text-[var(--piantare-gd)]">
            Resumo
          </div>
          <p className="mt-2 text-[14px] font-light leading-relaxed text-foreground">
            Pedido para{" "}
            <span className="font-normal">{product.labName || "—"}</span>
            : {quantity}× {product.unit} de{" "}
            <span className="font-normal">{product.name}</span>
          </p>
          <p className="mt-3 flex items-baseline gap-2 text-[13px] font-light tabular-nums text-[var(--piantare-muted)]">
            <span>
              {quantity} × {formatUsd(product.priceUsd)}
            </span>
            <span aria-hidden>=</span>
            <span className="font-serif text-[28px] font-light leading-none text-foreground">
              {formatUsd(total)}
            </span>
          </p>
        </div>
      )}

      <SubmitButton pendingLabel="Criando pedido…" className="mt-2 w-full">
        Criar pedido
      </SubmitButton>
    </form>
  );
}
