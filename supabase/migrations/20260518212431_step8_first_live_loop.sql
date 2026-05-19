-- ============================================================
-- 20260518212431_step8_first_live_loop
-- Phase 2 Step 8 — First Live Loop (Lab ↔ Brand MVP)
--
-- Goal: enable the loop "user signs up → creates a brand → picks a product
-- from a lab → creates an order → lab updates status → brand follows
-- progress" end-to-end.
--
-- MVP constraints (decided by Nathan, product-first mode):
--   - USD only at storage layer (BRL is display-only, deferred)
--   - 1 organization per (user, kind) at MVP — enforced by unique index
--   - No chat, uploads, audit log, multi-currency, agents, advanced perms
--   - Invoices are a stub schema (no provider, no split)
--   - perfis_* tables from v1.3 baseline are IGNORED at MVP (ADR 0006)
--
-- See: docs/adrs/0006-first-live-loop-mvp.md
-- ============================================================

-- ============================================================
-- 1. Enums
-- ============================================================

create type organization_kind as enum (
  'lab',
  'brand'
);

create type membership_role as enum (
  'owner',
  'member'
);

create type order_status as enum (
  'created',
  'approved',
  'in_production',
  'ready',
  'shipped'
);

create type invoice_status as enum (
  'pending',
  'paid'
);

-- ============================================================
-- 2. organizations
--    Owner is denormalized for cheap bootstrap; the source of truth for
--    "who can act for this org" is the memberships table.
-- ============================================================

create table public.organizations (
  id            uuid primary key default gen_random_uuid(),
  kind          organization_kind not null,
  name          text not null check (length(trim(name)) > 0),
  country       text not null check (length(country) = 2), -- ISO 3166-1 alpha-2
  currency      text not null default 'USD' check (currency in ('USD', 'BRL')),
  owner_id      uuid not null references public.profiles(id) on delete restrict,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index organizations_owner_idx on public.organizations (owner_id);
create index organizations_kind_idx  on public.organizations (kind);

-- ============================================================
-- 3. memberships
--    org_kind is denormalized to make the "1 org per kind per user"
--    unique index cheap. Kept in sync via FK + trigger below.
-- ============================================================

create table public.memberships (
  id            uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  user_id       uuid not null references public.profiles(id) on delete cascade,
  role          membership_role not null,
  org_kind      organization_kind not null,
  created_at    timestamptz not null default now(),
  unique (organization_id, user_id)
);

-- MVP rule: a user can hold at most one organization of each kind.
create unique index memberships_one_org_per_kind_idx
  on public.memberships (user_id, org_kind);

create index memberships_org_idx  on public.memberships (organization_id);
create index memberships_user_idx on public.memberships (user_id);

-- Keep memberships.org_kind in lockstep with the parent organization.
create or replace function public.memberships_sync_org_kind()
returns trigger
language plpgsql
as $$
begin
  select kind into new.org_kind
  from public.organizations
  where id = new.organization_id;
  return new;
end;
$$;

create trigger memberships_sync_org_kind_trg
  before insert or update of organization_id on public.memberships
  for each row execute function public.memberships_sync_org_kind();

-- ============================================================
-- 4. products
--    Lab-only (enforced by app-level check + helper). MVP keeps the
--    schema deliberately flat: one price, one unit, no variations.
-- ============================================================

create table public.products (
  id            uuid primary key default gen_random_uuid(),
  lab_id        uuid not null references public.organizations(id) on delete cascade,
  name          text not null check (length(trim(name)) > 0),
  description   text not null default '',
  unit          text not null check (length(trim(unit)) > 0),   -- e.g. 'mg', 'ml', 'unit'
  price_usd     numeric(12,2) not null check (price_usd >= 0),
  is_active     boolean not null default true,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index products_lab_idx on public.products (lab_id);
create index products_active_idx on public.products (lab_id) where is_active;

-- ============================================================
-- 5. orders
-- ============================================================

create table public.orders (
  id              uuid primary key default gen_random_uuid(),
  brand_id        uuid not null references public.organizations(id) on delete restrict,
  lab_id          uuid not null references public.organizations(id) on delete restrict,
  product_id      uuid not null references public.products(id) on delete restrict,
  quantity        numeric(12,2) not null check (quantity > 0),
  unit_price_usd  numeric(12,2) not null check (unit_price_usd >= 0),
  total_usd       numeric(14,2) not null
                    generated always as (quantity * unit_price_usd) stored,
  status          order_status not null default 'created',
  payment_terms   text not null default '50/50',
  created_by      uuid not null references public.profiles(id) on delete restrict,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index orders_brand_idx  on public.orders (brand_id);
create index orders_lab_idx    on public.orders (lab_id);
create index orders_status_idx on public.orders (status);

-- ============================================================
-- 6. invoices (stub)
--    MVP: one invoice per order, total in USD, status pending|paid.
--    No splits, no provider, no line items. Stripe/StarkBank are stubs
--    at the application boundary (services/), not in the schema.
-- ============================================================

create table public.invoices (
  id            uuid primary key default gen_random_uuid(),
  order_id      uuid not null unique references public.orders(id) on delete cascade,
  amount_usd    numeric(14,2) not null check (amount_usd >= 0),
  status        invoice_status not null default 'pending',
  created_at    timestamptz not null default now(),
  paid_at       timestamptz
);

create index invoices_order_idx on public.invoices (order_id);

-- ============================================================
-- 7. updated_at triggers (shared)
-- ============================================================

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger organizations_touch_updated_at
  before update on public.organizations
  for each row execute function public.touch_updated_at();

create trigger products_touch_updated_at
  before update on public.products
  for each row execute function public.touch_updated_at();

create trigger orders_touch_updated_at
  before update on public.orders
  for each row execute function public.touch_updated_at();

-- ============================================================
-- 8. RLS — enable + force on every new table
-- ============================================================

alter table public.organizations enable row level security;
alter table public.memberships   enable row level security;
alter table public.products      enable row level security;
alter table public.orders        enable row level security;
alter table public.invoices      enable row level security;

alter table public.organizations force row level security;
alter table public.memberships   force row level security;
alter table public.products      force row level security;
alter table public.orders        force row level security;
alter table public.invoices      force row level security;

-- ============================================================
-- 9. RLS helper: is_member_of(org_id)
--    Same SECURITY DEFINER STABLE pattern as is_admin() / is_approved().
-- ============================================================

create or replace function public.is_member_of(org uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.memberships
    where organization_id = org and user_id = auth.uid()
  );
$$;

revoke all on function public.is_member_of(uuid) from public;
grant execute on function public.is_member_of(uuid) to anon, authenticated;

-- ============================================================
-- 10. RLS policies — MVP isolation
--
-- Posture:
--   - All writes (insert/update/delete) go through the service-role admin
--     client at the application layer (Server Actions / Route Handlers),
--     which bypasses RLS by design (ADR 0003 Q3=b). The policies below
--     therefore only need to cover the READ path for anon/authenticated.
--   - Mutations use the admin client because we need to enforce business
--     invariants (status transitions, "1 org per kind", etc.) in code
--     anyway — duplicating them as RLS would just be costly drift.
--
-- Read isolation:
--   - organizations: members can see their own org; nobody else.
--   - memberships:   members can see rows of orgs they belong to.
--   - products:      visible to the owning lab + to any brand member
--                    (so brands can browse the catalog); MVP simplification.
--   - orders:        visible to brand-side and lab-side members.
--   - invoices:      visible to anyone who can see the parent order.
-- ============================================================

-- organizations: select for members
create policy organizations_select_for_members
  on public.organizations
  for select
  to authenticated
  using (public.is_member_of(id));

-- memberships: select rows where user is a member of the org
create policy memberships_select_for_members
  on public.memberships
  for select
  to authenticated
  using (public.is_member_of(organization_id));

-- products: select for lab members OR any brand member (MVP catalog open
-- to all authenticated brand members of any brand org).
create policy products_select_for_lab
  on public.products
  for select
  to authenticated
  using (public.is_member_of(lab_id));

create policy products_select_for_brands
  on public.products
  for select
  to authenticated
  using (
    is_active
    and exists (
      select 1 from public.memberships m
      where m.user_id = auth.uid()
        and m.org_kind = 'brand'
    )
  );

-- orders: select for both sides of the transaction
create policy orders_select_for_brand
  on public.orders
  for select
  to authenticated
  using (public.is_member_of(brand_id));

create policy orders_select_for_lab
  on public.orders
  for select
  to authenticated
  using (public.is_member_of(lab_id));

-- invoices: select if user can see the parent order
create policy invoices_select_via_order
  on public.invoices
  for select
  to authenticated
  using (
    exists (
      select 1 from public.orders o
      where o.id = invoices.order_id
        and (public.is_member_of(o.brand_id) or public.is_member_of(o.lab_id))
    )
  );

-- ============================================================
-- 11. Notes for future migrations
--   - Status transition validation is enforced in src/modules/orders/,
--     not via DB constraints. Keep DB flexible at MVP.
--   - perfis_* (v1.3) remain untouched; deprecation is a Step 9+ decision.
--   - currency='BRL' is allowed on organizations only for display
--     intent; no monetary column stores BRL at MVP.
-- ============================================================
