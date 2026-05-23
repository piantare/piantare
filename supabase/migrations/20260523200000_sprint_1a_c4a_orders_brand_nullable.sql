-- ============================================================
-- Sprint 1A C4a — orders.brand_id nullable + buyer constraint
--
-- Cotação aberta pelo agente para paciente (ADR 0007 §6 stage
-- `cotacao_aberta`) não tem org compradora — o buyer é uma `person`.
-- Para acomodar isso no mesmo schema, brand_id vira nullable e uma
-- CHECK constraint garante que toda order tem PELO MENOS um buyer:
-- ou uma org (brand_id) ou um paciente (for_person_id).
--
-- Pedidos legacy (brand→industria, sem for_person_id) continuam
-- válidos: brand_id NOT NULL satisfaz a constraint.
-- Cotações novas (agente→paciente, sem brand): for_person_id NOT NULL
-- satisfaz a constraint.
--
-- Não toca lab_id — ele continua NOT NULL e representa o lado seller
-- em qualquer fluxo (industria, escritorio).
-- ============================================================

alter table public.orders
  alter column brand_id drop not null;

alter table public.orders
  add constraint orders_has_buyer
  check (brand_id is not null or for_person_id is not null);
