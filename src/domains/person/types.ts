/**
 * Person domain — pure types.
 *
 * ADR 0007 §3 + princípio #3 (longitudinalidade) + princípio A3
 * (fluxo antes de cadastro):
 *
 *   - Cliente final / paciente, sem auth user nesta fase.
 *   - Cadastrado por um membership (tipicamente um `agente`).
 *   - Vertical denormalizada para suportar leitura por contexto sem
 *     joins extras. Uma mesma pessoa pode acumular relações em
 *     verticais diferentes (cannabis hoje, exames amanhã); cada
 *     entrada em `people` representa essa pessoa em uma vertical.
 *
 * Campos mínimos: name + primary_contact. Tudo mais (doctor, address,
 * documento, etc.) entra quando o gate operacional que os consome
 * estiver sendo construído. Sem campos preventivos.
 */

import type {
  MembershipId,
  VerticalKind,
} from "@/domains/organization/types";

declare const personIdBrand: unique symbol;
export type PersonId = string & { readonly [personIdBrand]: true };
export function toPersonId(value: string): PersonId {
  return value as PersonId;
}

export type Person = {
  id: PersonId;
  name: string;
  /**
   * Contato em texto livre — o agente registra o canal que já usa
   * (WhatsApp, e-mail, telefone). Estruturação por canal entra quando
   * houver gate consumidor.
   */
  primaryContact: string;
  vertical: VerticalKind;
  createdByMembershipId: MembershipId;
  createdAt: string;
  updatedAt: string;
};
