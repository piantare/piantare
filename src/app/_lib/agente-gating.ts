import "server-only";

import { redirect } from "next/navigation";

import { getCurrentUser } from "@/modules/auth";
import { getAgentContext, type AgentContext } from "@/modules/agente";
import type { CurrentUser } from "@/domains/identity";

/**
 * Guard pra rotas /agente/*.
 *
 * Diferente de `requireSession({ requiredKind })` — agente é
 * `membership.role`, não `org.kind`. Resolve a única membership
 * de agente do user (MVP: 1 agente por user).
 *
 *   - Sem session → /login
 *   - User não é agente em nenhum escritório → /
 */
export type AgenteGate = {
  user: CurrentUser;
  agent: AgentContext;
};

export async function requireAgenteSession(): Promise<AgenteGate> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const agent = await getAgentContext(user.id);
  if (!agent) redirect("/");

  return { user, agent };
}
