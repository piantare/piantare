-- ============================================================
-- Wave B foundation — people + role agente + stage column
--
-- ADR 0007 §12 Wave B (incremental, mínimo absoluto). Camada de
-- domínio apenas — sem UI nesta migration. Pelo princípio A3
-- (fluxo antes de cadastro), `people` nasce com o mínimo que
-- permite um agente abrir uma cotação para um cliente real.
-- Campos adicionais (médico, endereço, ID) entram quando o gate
-- que os consome for construído.
--
-- Três mudanças:
--   1. Novo valor de enum `agente` em `membership_role`.
--   2. Tabela `people` mínima: id, name, primary_contact (livre),
--      vertical, created_by_membership_id, timestamps.
--   3. Novo enum `order_stage` + coluna `stage` em `orders`,
--      defaultada/backfillada a partir do status atual (mapping
--      degenerado: status linear → stage equivalente).
--
-- O loop atual continua funcionando inalterado: orders já existentes
-- ganham stage coerente, agente=null, for_person_id=null. UI nova
-- de cotação entra em commit separado.
-- ============================================================

-- ============================================================
-- 1. Membership role enum gains 'agente'
-- ============================================================

alter type public.membership_role add value if not exists 'agente';

-- ============================================================
-- 2. people — cliente final, sem auth user nesta fase
--
-- Princípio A3: somente os 2 campos que destravam a abertura de uma
-- cotação. Contato em texto livre para o agente registrar o canal que
-- já usa (WhatsApp, e-mail, telefone). Estruturação por canal vem
-- quando houver gate que consuma esses dados estruturadamente.
--
-- Vertical denormalizada na pessoa para suportar leitura por contexto
-- sem joins extras (longitudinalidade — uma pessoa pode acumular
-- relações em verticais diferentes; ver §11 do ADR).
-- ============================================================

create table public.people (
  id                          uuid primary key default gen_random_uuid(),
  name                        text not null check (length(trim(name)) > 0),
  primary_contact             text not null check (length(trim(primary_contact)) > 0),
  vertical                    public.vertical_kind not null default 'cannabis_medicinal',
  created_by_membership_id    uuid not null references public.memberships(id) on delete restrict,
  created_at                  timestamptz not null default now(),
  updated_at                  timestamptz not null default now()
);

create index people_created_by_idx on public.people (created_by_membership_id);
create index people_vertical_idx on public.people (vertical);

create trigger people_touch_updated_at
  before update on public.people
  for each row execute function public.touch_updated_at();

alter table public.people enable row level security;
alter table public.people force row level security;

-- Policy: cada agente vê apenas as pessoas que ele cadastrou.
-- Visibilidade cruzada (owner do escritório vê pessoas dos seus
-- agentes) entra na Wave C junto com `partnerships`.
create policy people_select_own
  on public.people
  for select
  using (
    created_by_membership_id in (
      select id from public.memberships where user_id = auth.uid()
    )
  );

create policy people_insert_own
  on public.people
  for insert
  with check (
    created_by_membership_id in (
      select id from public.memberships where user_id = auth.uid()
    )
  );

create policy people_update_own
  on public.people
  for update
  using (
    created_by_membership_id in (
      select id from public.memberships where user_id = auth.uid()
    )
  )
  with check (
    created_by_membership_id in (
      select id from public.memberships where user_id = auth.uid()
    )
  );

-- ============================================================
-- 3. orders.stage — convive com `status` legado durante a transição.
--
-- ADR 0007 §6: o status linear é um caso degenerado do modelo de
-- stages + gates. Backfill mapeia 1:1, sem perda. UI nova de fluxo
-- ramificado entra em commit separado, quando houver agente real.
-- ============================================================

create type public.order_stage as enum (
  'rascunho',
  'cotacao_aberta',
  'documentacao',
  'pagamento',
  'producao_ou_importacao',
  'logistica',
  'entregue',
  'liquidado',
  'cancelado'
);

alter table public.orders
  add column stage public.order_stage;

-- Backfill: cada status legado vira a stage equivalente do novo modelo.
-- Critério: a loja atual cobre `producao_ou_importacao → entregue`.
-- `liquidado` reservado para quando o invoice for marcado como pago.
update public.orders
   set stage = case
     when status = 'created'        then 'producao_ou_importacao'
     when status = 'approved'       then 'producao_ou_importacao'
     when status = 'in_production'  then 'producao_ou_importacao'
     when status = 'ready'          then 'logistica'
     when status = 'shipped'        then 'entregue'
   end::public.order_stage;

alter table public.orders
  alter column stage set not null,
  alter column stage set default 'producao_ou_importacao';

-- ============================================================
-- 4. Forward link de cliente final no pedido (opcional, sem FK ainda
--    forte em comportamento — código não usa nesta fase).
--
-- Adicionar a coluna agora (mas null) deixa o slot pronto. Quando a
-- UI de cotação aberta entrar, ela popula. Pedidos legados continuam
-- com `for_person_id = null` (compra em estoque, sem cliente final).
-- ============================================================

alter table public.orders
  add column for_person_id uuid references public.people(id) on delete set null,
  add column originating_agent_membership_id uuid references public.memberships(id) on delete set null;

create index orders_for_person_idx on public.orders (for_person_id);
create index orders_originating_agent_idx on public.orders (originating_agent_membership_id);
