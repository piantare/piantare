import { redirect } from "next/navigation";

import { getCurrentUser } from "@/modules/auth";
import { getAgentContext } from "@/modules/agente";
import { requireSession } from "@/app/_lib/gating";

/**
 * Root entry — pure router based on auth + org + role state.
 *
 *   - No session → /login
 *   - User is agente (membership.role) → /agente (carteira do agente)
 *   - No org → /onboarding
 *   - industria → /industria/products
 *   - brand → /brand/catalog
 *   - escritorio → /escritorio
 *
 * Agente é resolvido antes da membership "primária" porque um user
 * que é agente NUNCA deve cair na landing de owner do escritório —
 * sua superfície operacional é /agente (ADR 0007 §2c).
 */
export default async function HomePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const agent = await getAgentContext(user.id);
  if (agent) redirect("/agente");

  const { membership } = await requireSession();
  if (membership.orgKind === "industria") redirect("/industria/products");
  if (membership.orgKind === "escritorio") redirect("/escritorio");
  redirect("/brand/catalog");
}
