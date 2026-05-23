-- ============================================================
-- Sprint 1A C2 + C3 — partnerships + catalog_listings
--
-- ADR 0007 §2e (fluxo comercial canônico) + §3 (entity model) +
-- alinhamento com doc canônico Piantare RN-005, RN-009, RN-010.
--
-- Camadas de relacionamento comercial:
--   Indústria ↔ Marca       (partnership)
--   Marca ↔ Escritório      (partnership)
--   Escritório ↔ Agente     (NÃO modelado aqui — agente é membership
--                            do escritório, não vínculo entre orgs)
--
-- Catálogo em camadas:
--   Marca lista produto da indústria pro escritório vinculado.
--   Escritório lista produto da marca pra seus agentes (memberships).
--
-- Sem UI nesta migration — schema + RLS preparados pra C4 começar a
-- ler. Mantém princípio A3 (fluxo antes de cadastro): partnerships
-- nasce com 4 campos operacionais, terms_jsonb livre, sem contraproposta
-- versionada (essa entra quando houver gate que consuma).
-- ============================================================

-- ============================================================
-- 1. partnership_status + supply_model enums
-- ============================================================

create type public.partnership_status as enum (
  'pending',     -- proposto por um lado, aguarda aceite
  'active',      -- ambos aceitaram, vínculo operacional
  'terminated'   -- encerrado por qualquer lado
);

create type public.supply_model as enum (
  'purchase',      -- escritório paga marca adiantado, recebe estoque
  'consignment',   -- marca consigna; escritório paga conforme vende
  'dropship'       -- marca envia direto ao paciente; escritório nunca toca o estoque
);

-- ============================================================
-- 2. partnerships — vínculo bilateral entre duas orgs
--
-- (seller_org_id, buyer_org_id) único quando status='active' garante
-- que não há dois vínculos ativos entre as mesmas duas orgs.
-- ============================================================

create table public.partnerships (
  id                uuid primary key default gen_random_uuid(),
  seller_org_id     uuid not null references public.organizations(id) on delete restrict,
  buyer_org_id      uuid not null references public.organizations(id) on delete restrict,
  status            public.partnership_status not null default 'pending',
  supply_model      public.supply_model not null default 'purchase',
  -- terms_jsonb: condições negociadas em texto livre estruturado.
  -- Sem schema rígido nesta fase — escritório/marca registram o que
  -- combinaram (comissão, prazos, mínimos). Estruturação quando houver
  -- regra de negócio que consuma campo específico.
  terms             jsonb not null default '{}'::jsonb,
  proposed_by_membership_id uuid references public.memberships(id) on delete set null,
  accepted_at       timestamptz,
  terminated_at     timestamptz,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),

  -- seller e buyer não podem ser a mesma org
  constraint partnerships_distinct_orgs check (seller_org_id <> buyer_org_id)
);

-- Uma única partnership ativa por par (seller, buyer).
-- Pares pending/terminated podem coexistir — permite re-propor depois de encerrar.
create unique index partnerships_unique_active
  on public.partnerships (seller_org_id, buyer_org_id)
  where status = 'active';

create index partnerships_seller_idx on public.partnerships (seller_org_id);
create index partnerships_buyer_idx on public.partnerships (buyer_org_id);
create index partnerships_status_idx on public.partnerships (status);

create trigger partnerships_touch_updated_at
  before update on public.partnerships
  for each row execute function public.touch_updated_at();

alter table public.partnerships enable row level security;
alter table public.partnerships force row level security;

-- SELECT: ambos os lados (membership do seller OU do buyer) podem ver.
create policy partnerships_select_either_side
  on public.partnerships
  for select
  using (
    public.is_member_of(seller_org_id)
    or public.is_member_of(buyer_org_id)
  );

-- INSERT: qualquer membership de qualquer dos dois lados pode propor.
create policy partnerships_insert_either_side
  on public.partnerships
  for insert
  with check (
    public.is_member_of(seller_org_id)
    or public.is_member_of(buyer_org_id)
  );

-- UPDATE: qualquer dos dois lados pode mudar status (aceitar, encerrar)
-- ou ajustar terms. Granularidade fina (só seller muda preço, só buyer
-- aceita) entra quando houver fluxo de contraproposta versionada.
create policy partnerships_update_either_side
  on public.partnerships
  for update
  using (
    public.is_member_of(seller_org_id)
    or public.is_member_of(buyer_org_id)
  )
  with check (
    public.is_member_of(seller_org_id)
    or public.is_member_of(buyer_org_id)
  );

-- ============================================================
-- 3. listing_status enum
-- ============================================================

create type public.listing_status as enum (
  'active',
  'paused',
  'discontinued'
);

-- ============================================================
-- 4. catalog_listings — produto publicado por seller pra buyer
--
-- Cada listing é publicada dentro do escopo de uma partnership
-- existente. Isso garante que catálogo só existe entre orgs com
-- vínculo formal. Preço e moeda são da listing, não do produto —
-- permite escritório publicar mesmo produto em diferentes camadas
-- com markup próprio.
-- ============================================================

create table public.catalog_listings (
  id                uuid primary key default gen_random_uuid(),
  partnership_id    uuid not null references public.partnerships(id) on delete restrict,
  product_id        uuid not null references public.products(id) on delete restrict,
  unit_price        numeric(12, 4) not null check (unit_price > 0),
  currency          text not null check (currency in ('USD', 'BRL')),
  min_order_qty     integer not null default 1 check (min_order_qty > 0),
  status            public.listing_status not null default 'active',
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

-- Um mesmo produto pode estar listado várias vezes em partnerships
-- diferentes, mas só uma vez ativa por partnership (evita duplicata).
create unique index catalog_listings_unique_active
  on public.catalog_listings (partnership_id, product_id)
  where status = 'active';

create index catalog_listings_partnership_idx on public.catalog_listings (partnership_id);
create index catalog_listings_product_idx on public.catalog_listings (product_id);

create trigger catalog_listings_touch_updated_at
  before update on public.catalog_listings
  for each row execute function public.touch_updated_at();

alter table public.catalog_listings enable row level security;
alter table public.catalog_listings force row level security;

-- SELECT: caller é membership de qualquer dos dois lados da partnership.
create policy catalog_listings_select_via_partnership
  on public.catalog_listings
  for select
  using (
    exists (
      select 1
      from public.partnerships p
      where p.id = catalog_listings.partnership_id
        and (
          public.is_member_of(p.seller_org_id)
          or public.is_member_of(p.buyer_org_id)
        )
    )
  );

-- INSERT/UPDATE: somente o SELLER da partnership pode publicar/editar
-- (o buyer compra, não publica catálogo próprio para si).
create policy catalog_listings_insert_seller_only
  on public.catalog_listings
  for insert
  with check (
    exists (
      select 1
      from public.partnerships p
      where p.id = catalog_listings.partnership_id
        and public.is_member_of(p.seller_org_id)
    )
  );

create policy catalog_listings_update_seller_only
  on public.catalog_listings
  for update
  using (
    exists (
      select 1
      from public.partnerships p
      where p.id = catalog_listings.partnership_id
        and public.is_member_of(p.seller_org_id)
    )
  )
  with check (
    exists (
      select 1
      from public.partnerships p
      where p.id = catalog_listings.partnership_id
        and public.is_member_of(p.seller_org_id)
    )
  );
