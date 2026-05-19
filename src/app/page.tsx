import { redirect } from "next/navigation";

import { requireSession } from "@/app/_lib/gating";

/**
 * Root entry — pure router based on auth + org state. Step 8 design.
 *
 *   - No session → /login
 *   - No org → /onboarding
 *   - lab → /lab/products
 *   - brand → /brand/catalog
 *
 * Once we have a real dashboard this becomes its own page; for the MVP loop
 * the dashboard is just "where can this user act right now".
 */
export default async function HomePage() {
  const { membership } = await requireSession();
  if (membership.orgKind === "lab") redirect("/lab/products");
  redirect("/brand/catalog");
}
