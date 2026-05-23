import "server-only";

import { createAdminClient } from "@/services/supabase/admin";
import type { Person } from "@/domains/person";
import type { MembershipId } from "@/domains/organization";

import { rowToPerson } from "./create-person";

/**
 * Lista os pacientes cadastrados por uma membership de agente.
 * RLS já garante isso, mas usamos admin client para coerência com
 * os outros reads que cruzam tabelas.
 */
export async function listPeopleByAgent(
  agentMembershipId: MembershipId,
): Promise<Person[]> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("people")
    .select(
      "id, name, primary_contact, vertical, created_by_membership_id, created_at, updated_at",
    )
    .eq("created_by_membership_id", agentMembershipId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(`listPeopleByAgent: ${error.message}`);
  return (data ?? []).map(rowToPerson);
}
