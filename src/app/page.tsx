import { redirect } from "next/navigation";

import { requireSession } from "@/app/_lib/gating";

/**
 * Root entry — pure router based on auth + org state.
 *
 *   - No session → /login
 *   - No org → /onboarding
 *   - industria → /industria/products
 *   - brand → /brand/catalog
 *   - escritorio → /escritorio (placeholder até C2/C3)
 *
 * Once we have a real dashboard this becomes its own page; for the MVP loop
 * the dashboard is just "where can this user act right now".
 */
export default async function HomePage() {
  const { membership } = await requireSession();
  if (membership.orgKind === "industria") redirect("/industria/products");
  if (membership.orgKind === "escritorio") redirect("/escritorio");
  redirect("/brand/catalog");
}
