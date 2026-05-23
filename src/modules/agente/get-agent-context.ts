import "server-only";

import { createAdminClient } from "@/services/supabase/admin";
import {
  toMembershipId,
  toOrganizationId,
  type MembershipId,
  type OrganizationId,
} from "@/domains/organization";

/**
 * Contexto operacional do agente — quem ele é + qual escritório
 * representa.
 *
 * ADR 0007 §2c: agente é primeira classe operacional, ainda que
 * estruturalmente seja uma membership com role='agente' em uma
 * org kind='escritorio'. Essa função resolve a única membership
 * de agente do user (MVP: 1 agente por user; multi-escritório vem
 * depois).
 *
 * Usa admin client porque RLS de memberships permite o user ver
 * apenas as próprias, e queremos cruzar com organizations.name pro
 * shell exibir o escritório.
 */
export type AgentContext = {
  membershipId: MembershipId;
  escritorioOrgId: OrganizationId;
  escritorioName: string;
};

export async function getAgentContext(
  userId: string,
): Promise<AgentContext | null> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("memberships")
    .select("id, organization_id, role, org_kind, organizations(name)")
    .eq("user_id", userId)
    .eq("role", "agente")
    .eq("org_kind", "escritorio")
    .limit(1)
    .maybeSingle();

  if (error) throw new Error(`getAgentContext: ${error.message}`);
  if (!data) return null;

  return {
    membershipId: toMembershipId(data.id),
    escritorioOrgId: toOrganizationId(data.organization_id),
    escritorioName: data.organizations?.name ?? "",
  };
}
