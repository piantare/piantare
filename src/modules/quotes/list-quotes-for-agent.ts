import "server-only";

import { createAdminClient } from "@/services/supabase/admin";
import type { Order, OrderStage } from "@/domains/order";
import type { MembershipId } from "@/domains/organization";
import { rowToOrder } from "@/modules/orders/create-order";

export type AgentQuote = Order & {
  productName: string;
  productUnit: string;
  personName: string;
  personContact: string;
};

type QuoteRow = Parameters<typeof rowToOrder>[0] & {
  products: { name: string; unit: string } | null;
  people: { name: string; primary_contact: string } | null;
};

/**
 * Lista cotações originadas pela membership de agente.
 *
 * Cruza orders.originating_agent_membership_id com produto + paciente
 * para o agente ver "minha carteira" sem clicks adicionais. Ordenação
 * decrescente por data — última atividade primeiro.
 */
export async function listQuotesForAgent(
  agentMembershipId: MembershipId,
): Promise<AgentQuote[]> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("orders")
    .select(
      `
      id, vertical, stage, brand_id, lab_id, product_id, quantity,
      unit_price_usd, total_usd, status, payment_terms, created_by,
      created_at, updated_at,
      for_person_id, originating_agent_membership_id,
      products!inner(name, unit),
      people:for_person_id(name, primary_contact)
      `,
    )
    .eq("originating_agent_membership_id", agentMembershipId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(`listQuotesForAgent: ${error.message}`);

  const rows = (data ?? []) as unknown as QuoteRow[];
  return rows.map((row) => ({
    ...rowToOrder(row),
    productName: row.products?.name ?? "",
    productUnit: row.products?.unit ?? "",
    personName: row.people?.name ?? "",
    personContact: row.people?.primary_contact ?? "",
  }));
}

/**
 * Agregações para a home do agente — pipeline em uma olhada.
 * Tudo derivado da lista; sem queries extras (evita over-fetch).
 */
export type AgentPipelineSummary = {
  total: number;
  byStage: Partial<Record<OrderStage, number>>;
  uniquePeople: number;
  lastActivityAt: string | null;
};

export function summarizePipeline(quotes: AgentQuote[]): AgentPipelineSummary {
  const byStage: Partial<Record<OrderStage, number>> = {};
  const peopleSet = new Set<string>();
  let lastActivityAt: string | null = null;

  for (const q of quotes) {
    if (q.stage) {
      byStage[q.stage] = (byStage[q.stage] ?? 0) + 1;
    }
    peopleSet.add(q.personName);
    if (!lastActivityAt || q.updatedAt > lastActivityAt) {
      lastActivityAt = q.updatedAt;
    }
  }

  return {
    total: quotes.length,
    byStage,
    uniquePeople: peopleSet.size,
    lastActivityAt,
  };
}
