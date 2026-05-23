import "server-only";

import { createAdminClient } from "@/services/supabase/admin";
import { toOrderId, type Order } from "@/domains/order";
import type {
  MembershipId,
  OrganizationId,
} from "@/domains/organization";
import type { ListingId } from "@/domains/listing";
import type { PersonId } from "@/domains/person";
import { rowToOrder } from "@/modules/orders/create-order";

export type CreateQuoteInput = {
  agentUserId: string;
  agentMembershipId: MembershipId;
  /** O escritório que o agente representa — vira `lab_id` (seller). */
  escritorioOrgId: OrganizationId;
  listingId: ListingId;
  personId: PersonId;
  quantity: number;
  paymentTerms?: string;
};

/**
 * Cria uma cotação aberta — order com stage='cotacao_aberta'.
 *
 * Diferença para createOrder (legacy brand→industria):
 *   - brand_id = NULL (paciente, não org)
 *   - lab_id = escritorio do agente (o seller no leg paciente-facing)
 *   - for_person_id = paciente
 *   - originating_agent_membership_id = quem originou
 *   - stage = 'cotacao_aberta'
 *   - status = 'created' (legacy field, kept para compatibilidade UI)
 *
 * Snapshot de preço:
 *   - Lê o `catalog_listing` ativo para pegar unit_price + currency.
 *   - Persiste em unit_price_usd (nomenclatura legacy — Wave C+ renomeia
 *     para unit_price + currency).
 *   - Para listings em BRL: o número entra como está; nas próximas waves
 *     adicionamos campo currency no order para deixar isso explícito.
 *     Por enquanto a coluna se chama `unit_price_usd` mas o número pode
 *     ser BRL — a UI deve confiar no currency da listing original quando
 *     resolver o pedido.
 *
 * Validações:
 *   - quantity > 0
 *   - listing existe e está ativa
 *   - person existe e pertence à mesma membership de agente (RLS já garante
 *     mas validamos por explicitness)
 */
export async function createQuote(input: CreateQuoteInput): Promise<Order> {
  if (!Number.isFinite(input.quantity) || input.quantity <= 0) {
    throw new Error("createQuote: quantidade precisa ser positiva.");
  }

  const admin = createAdminClient();

  // 1. Carrega listing + valida ativa + pega product_id e preço.
  const { data: listing, error: listingError } = await admin
    .from("catalog_listings")
    .select("id, product_id, unit_price, currency, status")
    .eq("id", input.listingId)
    .maybeSingle();

  if (listingError) throw new Error(`createQuote: ${listingError.message}`);
  if (!listing) throw new Error("createQuote: catálogo não encontrado.");
  if (listing.status !== "active") {
    throw new Error("createQuote: produto não está mais ativo.");
  }
  if (input.quantity < 1) {
    throw new Error("createQuote: quantidade abaixo do mínimo.");
  }

  // 2. Verifica person + dono.
  const { data: person, error: personError } = await admin
    .from("people")
    .select("id, created_by_membership_id")
    .eq("id", input.personId)
    .maybeSingle();

  if (personError) throw new Error(`createQuote: ${personError.message}`);
  if (!person) throw new Error("createQuote: paciente não encontrado.");
  if (person.created_by_membership_id !== input.agentMembershipId) {
    throw new Error("createQuote: paciente não pertence a este agente.");
  }

  // 3. Cria a order com shape de cotação aberta.
  const { data: row, error: insertError } = await admin
    .from("orders")
    .insert({
      brand_id: null,
      lab_id: input.escritorioOrgId,
      product_id: listing.product_id,
      quantity: input.quantity,
      unit_price_usd: listing.unit_price,
      payment_terms: input.paymentTerms?.trim() || "A combinar",
      created_by: input.agentUserId,
      stage: "cotacao_aberta",
      for_person_id: input.personId,
      originating_agent_membership_id: input.agentMembershipId,
    })
    .select()
    .single();

  if (insertError || !row) {
    throw new Error(
      `createQuote: insert failed: ${insertError?.message ?? "unknown error"}`,
    );
  }

  return rowToOrder(row);
}
