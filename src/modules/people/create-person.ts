import "server-only";

import { createAdminClient } from "@/services/supabase/admin";
import {
  toPersonId,
  type Person,
  type PersonId,
} from "@/domains/person";
import {
  type MembershipId,
  type VerticalKind,
} from "@/domains/organization";

export type CreatePersonInput = {
  /** Quem está cadastrando — geralmente uma membership com role='agente'. */
  creatorMembershipId: MembershipId;
  name: string;
  primaryContact: string;
  vertical?: VerticalKind;
};

/**
 * Cadastro mínimo de paciente. Princípio A3 (fluxo antes de cadastro):
 * apenas os 2 campos que o agente usa hoje no WhatsApp — nome + contato
 * livre. Endereço, CPF, prescrição, médico — tudo entra quando a stage
 * que os consome estiver sendo construída.
 *
 * Vertical defaultada a 'cannabis_medicinal' (Wave A) — outras verticais
 * aparecem aqui quando entrarem.
 */
export async function createPerson(
  input: CreatePersonInput,
): Promise<Person> {
  const name = input.name.trim();
  const primaryContact = input.primaryContact.trim();

  if (name.length === 0) {
    throw new Error("createPerson: nome é obrigatório.");
  }
  if (primaryContact.length === 0) {
    throw new Error("createPerson: contato é obrigatório.");
  }

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("people")
    .insert({
      name,
      primary_contact: primaryContact,
      vertical: input.vertical ?? "cannabis_medicinal",
      created_by_membership_id: input.creatorMembershipId,
    })
    .select("id, name, primary_contact, vertical, created_by_membership_id, created_at, updated_at")
    .single();

  if (error || !data) {
    throw new Error(
      `createPerson: insert failed: ${error?.message ?? "unknown error"}`,
    );
  }

  return rowToPerson(data);
}

export function rowToPerson(row: {
  id: string;
  name: string;
  primary_contact: string;
  vertical: VerticalKind;
  created_by_membership_id: string;
  created_at: string;
  updated_at: string;
}): Person {
  return {
    id: toPersonId(row.id),
    name: row.name,
    primaryContact: row.primary_contact,
    vertical: row.vertical,
    createdByMembershipId: row.created_by_membership_id as MembershipId,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// Helper para usar PersonId em outros módulos sem cast inline.
export function toPersonIdSafe(value: string): PersonId {
  return toPersonId(value);
}
